import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * Accounts are stored on this device only (AsyncStorage), with salted SHA-256 password hashes.
 * Moving them to a cloud backend later only means replacing the functions in this file.
 */

export type LibraryItem = { gameId: string; purchasedAt: string; pricePaid: number };
export type Order = { id: string; date: string; items: { gameId: string; price: number }[]; total: number };

export type Profile = {
  displayName: string;
  bio: string;
  avatarColor: string;
  favoriteGenres: string[];
  platforms: string[];
  country: string;
  socials: { twitch: string; kick: string; youtube: string; steam: string };
};

export type User = Profile & {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  library: LibraryItem[];
  wishlist: string[];
  orders: Order[];
};

type StoredUser = User & { passwordHash: string; salt: string };

type AuthState = {
  user: User | null;
  ready: boolean;
  signUp: (input: { displayName: string; username: string; email: string; password: string }) => Promise<string | null>;
  signIn: (identifier: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  purchase: (items: { gameId: string; price: number }[]) => Promise<Order | null>;
  toggleWishlist: (gameId: string) => Promise<void>;
  owns: (gameId: string) => boolean;
};

const USERS_KEY = 'gc.users.v1';
const SESSION_KEY = 'gc.session.v1';

export const AVATAR_COLORS = ['#8B5CF6', '#22D3EE', '#F43F5E', '#F97316', '#34D399', '#FBBF24', '#6366F1', '#EC4899'];

const AuthContext = createContext<AuthState | null>(null);

async function loadUsers(): Promise<StoredUser[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

async function saveUsers(users: StoredUser[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function hash(password: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

function toPublic({ passwordHash: _h, salt: _s, ...user }: StoredUser): User {
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [users, session] = await Promise.all([loadUsers(), AsyncStorage.getItem(SESSION_KEY).catch(() => null)]);
      const current = users.find((u) => u.id === session);
      if (current) setUser(toPublic(current));
      setReady(true);
    })();
  }, []);

  /** Applies a change to the signed-in user and saves it. */
  const mutate = useCallback(
    async (change: (u: StoredUser) => StoredUser) => {
      if (!user) return null;
      const users = await loadUsers();
      const index = users.findIndex((u) => u.id === user.id);
      if (index === -1) return null;
      users[index] = change(users[index]);
      await saveUsers(users);
      const updated = toPublic(users[index]);
      setUser(updated);
      return updated;
    },
    [user],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      ready,

      async signUp({ displayName, username, email, password }) {
        const name = displayName.trim();
        const handle = username.trim().toLowerCase();
        const mail = email.trim().toLowerCase();
        if (name.length < 2) return 'Please enter your name.';
        if (!/^[a-z0-9_]{3,20}$/.test(handle)) return 'Username must be 3–20 letters, numbers or _.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return 'Please enter a valid email address.';
        if (password.length < 8) return 'Password must be at least 8 characters.';

        const users = await loadUsers();
        if (users.some((u) => u.username === handle)) return 'This username is already taken.';
        if (users.some((u) => u.email === mail)) return 'An account with this email already exists.';

        const salt = Crypto.randomUUID();
        const newUser: StoredUser = {
          id: Crypto.randomUUID(),
          username: handle,
          email: mail,
          displayName: name,
          bio: '',
          avatarColor: AVATAR_COLORS[users.length % AVATAR_COLORS.length],
          favoriteGenres: [],
          platforms: [],
          country: '',
          socials: { twitch: '', kick: '', youtube: '', steam: '' },
          createdAt: new Date().toISOString(),
          library: [],
          wishlist: [],
          orders: [],
          salt,
          passwordHash: await hash(password, salt),
        };
        await saveUsers([...users, newUser]);
        await AsyncStorage.setItem(SESSION_KEY, newUser.id);
        setUser(toPublic(newUser));
        return null;
      },

      async signIn(identifier, password) {
        const id = identifier.trim().toLowerCase();
        const users = await loadUsers();
        const found = users.find((u) => u.email === id || u.username === id);
        if (!found || (await hash(password, found.salt)) !== found.passwordHash) {
          return 'Wrong username/email or password.';
        }
        await AsyncStorage.setItem(SESSION_KEY, found.id);
        setUser(toPublic(found));
        return null;
      },

      async signOut() {
        await AsyncStorage.removeItem(SESSION_KEY);
        setUser(null);
      },

      async updateProfile(patch) {
        await mutate((u) => ({ ...u, ...patch, socials: { ...u.socials, ...patch.socials } }));
      },

      async purchase(items) {
        const order: Order = {
          id: Crypto.randomUUID().slice(0, 8).toUpperCase(),
          date: new Date().toISOString(),
          items,
          total: items.reduce((sum, i) => sum + i.price, 0),
        };
        const updated = await mutate((u) => {
          const fresh = items.filter((i) => !u.library.some((l) => l.gameId === i.gameId));
          return {
            ...u,
            library: [...u.library, ...fresh.map((i) => ({ gameId: i.gameId, purchasedAt: order.date, pricePaid: i.price }))],
            wishlist: u.wishlist.filter((id) => !items.some((i) => i.gameId === id)),
            orders: [order, ...u.orders],
          };
        });
        return updated ? order : null;
      },

      async toggleWishlist(gameId) {
        await mutate((u) => ({
          ...u,
          wishlist: u.wishlist.includes(gameId) ? u.wishlist.filter((id) => id !== gameId) : [...u.wishlist, gameId],
        }));
      },

      owns(gameId) {
        return !!user?.library.some((l) => l.gameId === gameId);
      },
    }),
    [user, ready, mutate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

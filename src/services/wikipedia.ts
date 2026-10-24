import { APP_AGENT, getJson } from '@/services/http';

export type WikiAbout = {
  overview: string[];
  /** Title of the section about how the game is played, e.g. "Gameplay". */
  gameplayTitle: string | null;
  gameplay: string[];
  url: string;
};

const GAMEPLAY = /^(gameplay|game ?modes?|how to play|game mechanics|mechanics|gameplay and .*)$/i;

function paragraphs(text: string, max: number) {
  return text
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 40)
    .slice(0, max);
}

/** Intro and gameplay section of a game's English Wikipedia article (CC BY-SA). */
export async function getWikiAbout(title: string): Promise<WikiAbout | null> {
  const api = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({
    action: 'query',
    prop: 'extracts',
    explaintext: '1',
    titles: title,
    redirects: '1',
    format: 'json',
    origin: '*',
  })}`;
  const res = await getJson<{ query: { pages: Record<string, { title: string; extract?: string }> } }>(api, {
    headers: { 'Api-User-Agent': APP_AGENT },
    ttl: 3600_000,
  });
  const page = Object.values(res.query.pages)[0];
  if (!page?.extract) return null;

  // Cut the plain-text article into "== Heading ==" sections.
  const text = page.extract;
  const heads = [...text.matchAll(/\n(={2,4}) ([^=\n]+?) \1\n/g)];
  const intro = text.slice(0, heads[0]?.index ?? text.length);
  const sections = heads.map((m, i) => ({
    level: m[1].length,
    heading: m[2].trim(),
    body: text.slice(m.index! + m[0].length, heads[i + 1]?.index ?? text.length),
  }));

  // The gameplay section, including its sub-sections.
  const start = sections.findIndex((s) => s.level === 2 && GAMEPLAY.test(s.heading));
  let gameplay = '';
  if (start !== -1) {
    for (let i = start; i < sections.length && (i === start || sections[i].level > 2); i++) gameplay += '\n' + sections[i].body;
  }

  return {
    overview: paragraphs(intro, 3),
    gameplayTitle: start === -1 ? null : sections[start].heading,
    gameplay: paragraphs(gameplay, 5),
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
  };
}

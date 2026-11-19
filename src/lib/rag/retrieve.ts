import { KNOWLEDGE, type KnowledgeChunk } from '@/lib/rag/knowledge';

/**
 * BM25 keyword retrieval over the resume chunks. With about 16 short chunks this needs
 * no vector store or embedding API, and it runs in memory on every request.
 */

const TOP_K = 6;
const K1 = 1.4;
const B = 0.75;

const STOPWORDS = new Set(
  'a about am an and any are as at be been can could d did do does for from had has have how i if in is it its ll m me my of on or re s so t tell than that the their them there this to us ve was we were what when which who whom why will with would you your yours'.split(
    ' ',
  ),
);

// Visitors rarely use the resume's own words, so common phrasings map onto its section vocabulary.
const SYNONYMS: Record<string, string[]> = {
  golang: ['go'],
  postgres: ['postgresql'],
  node: ['nodejs'],
  cv: ['resume', 'summary'],
  background: ['summary', 'experience'],
  who: ['summary'],
  bio: ['summary'],
  yourself: ['summary'],
  job: ['experience'],
  jobs: ['experience'],
  work: ['experience'],
  worked: ['experience'],
  working: ['experience'],
  career: ['experience'],
  company: ['experience'],
  companies: ['experience'],
  employer: ['experience'],
  role: ['experience', 'current'],
  position: ['experience', 'current'],
  stack: ['skills'],
  tech: ['skills'],
  technology: ['skills'],
  technologies: ['skills'],
  tools: ['skills'],
  framework: ['skills'],
  frameworks: ['skills'],
  language: ['skills', 'languages'],
  know: ['skills'],
  built: ['project'],
  build: ['project'],
  portfolio: ['project'],
  study: ['education'],
  studied: ['education'],
  college: ['education'],
  university: ['education'],
  degree: ['education'],
  graduate: ['education'],
  graduated: ['education'],
  qualification: ['education'],
  email: ['contact'],
  reach: ['contact'],
  hire: ['contact', 'availability'],
  where: ['location'],
  based: ['location'],
  live: ['location'],
  city: ['location'],
  join: ['availability', 'notice'],
  start: ['availability', 'notice'],
  long: ['years'],
};

const stem = (token: string) => (token.length > 3 && token.endsWith('s') && !token.endsWith('ss') ? token.slice(0, -1) : token);

const rawTokens = (text: string) => text.toLowerCase().match(/[a-z0-9]+[+#]*/g) ?? [];

const tokenize = (text: string) =>
  rawTokens(text)
    .filter((token) => !STOPWORDS.has(token))
    .map(stem);

/** Query tokens, including synonyms. Synonyms are looked up first because some source words are stopwords. */
const queryTerms = (text: string) => {
  const expanded = rawTokens(text).flatMap((token) => [token, ...(SYNONYMS[token] ?? [])]);
  return [...new Set(expanded.filter((token) => !STOPWORDS.has(token)).map(stem))];
};

interface IndexedChunk {
  chunk: KnowledgeChunk;
  counts: Map<string, number>;
  length: number;
}

const INDEX: IndexedChunk[] = KNOWLEDGE.map((chunk) => {
  const tokens = tokenize(`${chunk.section} ${chunk.title} ${chunk.text}`);
  const counts = new Map<string, number>();
  tokens.forEach((token) => counts.set(token, (counts.get(token) ?? 0) + 1));
  return { chunk, counts, length: tokens.length };
});

const AVERAGE_LENGTH = INDEX.reduce((sum, doc) => sum + doc.length, 0) / INDEX.length;

const idf = (term: string) => {
  const matches = INDEX.filter((doc) => doc.counts.has(term)).length;
  return Math.log(1 + (INDEX.length - matches + 0.5) / (matches + 0.5));
};

function search(query: string): KnowledgeChunk[] {
  const terms = queryTerms(query).map((term) => ({ term, weight: idf(term) }));
  return INDEX.map((doc) => {
    const score = terms.reduce((total, { term, weight }) => {
      const frequency = doc.counts.get(term) ?? 0;
      const norm = frequency + K1 * (1 - B + (B * doc.length) / AVERAGE_LENGTH);
      return total + (weight * frequency * (K1 + 1)) / norm;
    }, 0);
    return { chunk: doc.chunk, score };
  })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K)
    .map((result) => result.chunk);
}

export interface Retrieval {
  chunks: KnowledgeChunk[];
  /** False when nothing matched and `chunks` is only the summary, for greetings and off-topic questions. */
  matched: boolean;
}

/** Falls back to the previous question so follow-ups like "tell me more" keep their context. */
export function retrieve(question: string, previousQuestion?: string): Retrieval {
  const chunks = search(question);
  if (chunks.length > 0) return { chunks, matched: true };

  const followUp = previousQuestion ? search(previousQuestion) : [];
  if (followUp.length > 0) return { chunks: followUp, matched: true };

  return { chunks: KNOWLEDGE.filter((chunk) => chunk.section === 'summary'), matched: false };
}

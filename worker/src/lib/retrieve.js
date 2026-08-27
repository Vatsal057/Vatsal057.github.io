/**
 * BM25 retrieval over the prebuilt knowledge base.
 *
 * Runs entirely in the Worker with no embedding call, so it costs zero Neurons
 * and adds well under a millisecond. The index is precomputed at build time;
 * at request time we only tokenize the (short) query.
 */
import { tokenize } from './tokenize.js';

const K1 = 1.2;
const B = 0.75;
// Roughly the weight of one rare term matching, so a full title match reliably
// beats a couple of incidental body mentions without swamping real relevance.
const TITLE_BOOST = 6;

/**
 * @param {string} query
 * @param {object} kb           parsed knowledge.json
 * @param {object} [opts]
 * @param {number} [opts.topK]      hard cap on chunks returned
 * @param {number} [opts.maxChars]  budget so prompt cost stays predictable
 * @returns {{chunks: Array, terms: string[], scores: Array}}
 */
export function retrieve(query, kb, opts = {}) {
  const topK = opts.topK ?? 6;
  const maxChars = opts.maxChars ?? 6400; // ~1,600 tokens
  const { chunks, docLens, avgDocLen, postings } = kb;
  const N = chunks.length;

  const terms = tokenize(query);
  const querySet = new Set(terms);
  const scores = new Map();

  for (const t of querySet) {
    const posting = postings[t];
    if (!posting) continue;
    const df = posting.length;
    // Standard BM25 idf, floored at 0 so terms appearing in nearly every
    // document cannot push scores negative.
    const idf = Math.max(0, Math.log(1 + (N - df + 0.5) / (df + 0.5)));
    for (const [i, tf] of posting) {
      const norm = tf + K1 * (1 - B + (B * docLens[i]) / avgDocLen);
      scores.set(i, (scores.get(i) || 0) + (idf * tf * (K1 + 1)) / norm);
    }
  }

  // Name-match bonus. BM25 alone lets a short tangential document outrank the
  // thing actually being asked about, so reward covering a chunk's whole title
  // and reward it more when the coverage is complete.
  const titles = kb.titleTokens || [];
  for (let i = 0; i < titles.length; i++) {
    const tt = titles[i];
    if (!tt || tt.length === 0) continue;
    const hits = tt.filter(t => querySet.has(t)).length;
    if (hits === 0) continue;
    const coverage = hits / tt.length;
    const bonus = TITLE_BOOST * coverage * (coverage === 1 ? 2 : 1);
    scores.set(i, (scores.get(i) || 0) + bonus);
  }

  const ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK);

  const picked = [];
  let used = 0;
  for (const [i, score] of ranked) {
    const c = chunks[i];
    if (used + c.text.length > maxChars && picked.length > 0) continue;
    picked.push({ ...c, score });
    used += c.text.length;
  }

  return { chunks: picked, terms, scores: ranked };
}

/**
 * Formats retrieved chunks into a facts block for the system prompt.
 * Falls back to the headline stats so the model always has something concrete
 * rather than inventing details when a question matches nothing.
 */
export function buildContext(query, kb, opts) {
  let { chunks } = retrieve(query, kb, opts);

  if (chunks.length === 0) {
    const fallback = kb.chunks.filter(c => c.kind === 'meta');
    chunks = fallback.length ? fallback : kb.chunks.slice(0, 2);
  }

  return chunks
    .map(c => `[${c.title}] ${c.text}`)
    .join('\n\n');
}

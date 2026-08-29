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
// Chunk kinds that describe one specific piece of work. Two of these in the same
// prompt is what lets the model blend them together.
const PROJECT_KINDS = new Set(['project', 'app', 'tool', 'research', 'planned']);

/**
 * @param {string} query
 * @param {object} kb           parsed knowledge.json
 * @param {object} [opts]
 * @param {number} [opts.topK]      hard cap on chunks returned
 * @param {number} [opts.maxChars]  budget so prompt cost stays predictable
 * @param {string} [opts.pinId]     slug to force into first place, for when the
 *                                  caller already knows what is being asked about
 * @returns {{chunks: Array, terms: string[], scores: Array}}
 */
export function retrieve(query, kb, opts = {}) {
  const topK = opts.topK ?? 6;
  const maxChars = opts.maxChars ?? 6400; // ~1,600 tokens
  const pinId = opts.pinId || '';
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

  let ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK);

  // On a project page the visitor asks things like "how does this work", which
  // names nothing searchable. The page already knows which project it is, so that
  // chunk is forced to the front. Being able to do that is what lets topK come
  // down instead of up, because one certain chunk beats six guesses.
  //
  // The other projects then have to go. Asked "what broke while building this" on
  // the Oracle page, BM25 also returns Constitution RAG, whose text describes a
  // chunking bug. The model reads that concrete story and retells it as if it
  // belonged to whatever page you are on, and telling it not to does not work: a
  // specific story in the context beats an instruction about it. So another
  // project only survives here when the question actually names it.
  if (pinId) {
    const pinIdx = kb.chunks.findIndex(c => c.id && c.id.slice(c.id.indexOf(':') + 1) === pinId);
    if (pinIdx > -1) {
      ranked = [
        [pinIdx, Infinity],
        ...ranked.filter(([i]) => {
          if (i === pinIdx) return false;
          if (!PROJECT_KINDS.has(kb.chunks[i].kind)) return true;   // skills, contact, site sections
          const tt = titles[i] || [];
          return tt.some(t => querySet.has(t));                     // named explicitly
        }),
      ].slice(0, topK);
    }
  }

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

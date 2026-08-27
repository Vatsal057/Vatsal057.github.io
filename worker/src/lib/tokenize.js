/**
 * Shared tokenizer. Imported by BOTH the build script and the Worker so the
 * index and the queries can never be normalized differently -- that mismatch
 * is the classic silent killer of keyword retrieval.
 */

// Deliberately small. Words like "how" and "what" carry no signal here, but
// domain words that look like stopwords ("no", "not") are kept out of caution.
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'can', 'did',
  'do', 'does', 'for', 'from', 'had', 'has', 'have', 'he', 'her', 'him', 'his',
  'how', 'i', 'in', 'is', 'it', 'its', 'me', 'my', 'of', 'on', 'or', 'that',
  'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'to', 'was',
  'were', 'what', 'when', 'where', 'which', 'who', 'why', 'will', 'with', 'you',
  'your', 'about', 'into', 'over', 'than', 'too', 'very', 'just', 'more', 'some',
  'tell', 'know', 'like', 'get', 'got', 'us', 'we',
]);

/**
 * Crude suffix stripping. Not a real stemmer, but it collapses the plural and
 * tense variations that actually matter for this corpus ("papers"/"paper",
 * "shipped"/"ship", "training"/"train") without pulling in a dependency.
 */
function stem(w) {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && w.endsWith('sses')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us')) return w.slice(0, -1);
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  return w;
}

export function tokenize(text) {
  if (!text) return [];

  const out = [];
  const push = w => {
    if (w.length > 1 && !STOPWORDS.has(w)) {
      const s = stem(w);
      if (s) out.push(s);
    }
  };

  const words = String(text)
    .toLowerCase()
    // keep + # . - inside words so "c++", "node.js", "fastapi-docker" survive
    .replace(/[^a-z0-9+#.\-\s]/g, ' ')
    .split(/\s+/);

  for (const raw of words) {
    const w = raw.replace(/^[.\-]+|[.\-]+$/g, '');
    if (!w) continue;
    push(w);
    // Also emit the pieces of compound tokens, so searching "probclip" finds
    // "probclip-a" and "node" finds "node.js". Without this, a visitor has to
    // type a hyphenated name exactly to get a hit.
    if (/[.\-]/.test(w)) {
      for (const part of w.split(/[.\-]+/)) push(part);
    }
  }

  return out;
}

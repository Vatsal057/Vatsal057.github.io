/**
 * Builds worker/src/knowledge.json from the portfolio's own sources.
 *
 * Run by CI before every Worker deploy, so the companion's knowledge can never
 * drift from the live site. Fails loudly on malformed project data rather than
 * shipping a knowledge base with holes in it.
 *
 *   node build-knowledge.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenize } from './src/lib/tokenize.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
// Emitted as a JS module rather than raw .json so it imports identically under
// Node, esbuild and the Workers runtime without needing import attributes.
const OUT = join(HERE, 'src', 'knowledge.js');

// index.html sections worth indexing. The rest (projects, apps, tools, roadmap,
// research, skills) are rendered from projects-data.js, so taking them from the
// HTML too would just duplicate content and waste prompt tokens.
const HTML_SECTIONS = [
  'experience', 'education', 'certifications', 'principles', 'datathon',
  'timeline', 'value',
];

// Every project must have these, or retrieval silently answers with holes.
const REQUIRED_PROJECT_FIELDS = ['slug', 'title', 'kind', 'status', 'oneLiner'];

// Vatsal's phone number is on the site, but a chatbot volunteering it to anyone
// who asks is a spam magnet. Email and profile links are the intended funnel.
const CONTACT_FIELDS_TO_INDEX = ['email', 'github', 'linkedin', 'kaggle', 'resumeUrl'];

/**
 * Vocabulary bridges. Visitors ask "where did he study" but the education
 * section never contains the word "study"; they ask about "papers" but research
 * entries say "under review". Keyword retrieval cannot cross that gap on its
 * own, so we index the words people actually search with.
 */
const ID_ALIASES = {
  'section:education': 'study studied college university degree academics school masters mtech bachelors graduation qualification',
  'section:experience': 'job work working internship intern employer role company career employment',
  'section:certifications': 'certificate certified course courses credential training',
  'section:principles': 'philosophy values beliefs approach principles opinions mindset',
  'section:timeline': 'history journey chronology background story progression',
  'section:datathon': 'competition hackathon contest datathon',
  'section:value': 'why hire value offer strengths recruiter',
  'meta:contact': 'contact email reach hire reachable linkedin github resume cv message',
  'meta:stats': 'currently now today working building count total how many number shipped overview summary',
};

const KIND_ALIASES = {
  project: 'project projects built build shipped portfolio',
  app: 'app apps application macos native desktop menubar',
  tool: 'tool tools utility script helper',
  research: 'research paper papers publication published preprint first-author academic',
  planned: 'planned upcoming future roadmap next building wip',
  skill: 'skill skills proficiency knows experienced good competent',
};

function aliasesFor(id, kind) {
  const base = id.split('#')[0];
  return [ID_ALIASES[base] || '', KIND_ALIASES[kind] || ''].filter(Boolean).join(' ');
}

const errors = [];
const warnings = [];

function loadPortfolioData() {
  const src = readFileSync(join(ROOT, 'projects-data.js'), 'utf8');
  const sandbox = { window: {} };
  // projects-data.js is a plain browser script assigning to window.*
  new Function('window', src)(sandbox.window);
  return { CONFIG: sandbox.window.CONFIG || {}, PROJECTS: sandbox.window.PROJECTS || [] };
}

function stripHtml(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function flatten(v) {
  if (v == null) return '';
  if (Array.isArray(v)) return v.map(flatten).filter(Boolean).join('; ');
  if (typeof v === 'object') return Object.values(v).map(flatten).filter(Boolean).join('; ');
  return String(v);
}

const chunks = [];
const add = (id, title, kind, parts) => {
  const text = parts.map(flatten).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  if (!text) { warnings.push(`empty chunk skipped: ${id}`); return; }
  chunks.push({ id, title, kind, text });
};

// ---------- 1. projects, apps, tools, research, planned ----------
const { CONFIG, PROJECTS } = loadPortfolioData();

if (PROJECTS.length === 0) errors.push('projects-data.js exposed zero PROJECTS');

for (const p of PROJECTS) {
  const missing = REQUIRED_PROJECT_FIELDS.filter(f => !p[f]);
  if (missing.length) {
    errors.push(`project "${p.slug || p.title || '(unnamed)'}" missing required field(s): ${missing.join(', ')}`);
    continue;
  }
  // id carries the kind so it is self-describing: app:insomniac, research:probclip-a
  add(`${p.kind}:${p.slug}`, p.title, p.kind, [
    `${p.title} (${p.kind}, status: ${p.status}).`,
    p.tag && `Category: ${p.tag}.`,
    p.platform && `Platform: ${p.platform}.`,
    p.oneLiner,
    p.problem && `Problem it solves: ${p.problem}`,
    p.how && `Pipeline: ${flatten(p.how)}.`,
    p.highlights && `Details: ${flatten(p.highlights)}`,
    p.learned && `What he learned: ${p.learned}`,
    p.stack && `Stack: ${flatten(p.stack)}.`,
    p.targets && `Targets: ${flatten(p.targets)}.`,
    p.links && `Links: ${flatten(p.links)}.`,
  ]);
}

// ---------- 2. skills ----------
for (const s of CONFIG.skills || []) {
  if (!s.name) { warnings.push('skill entry without a name'); continue; }
  add(`skill:${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, s.name, 'skill', [
    `Skill: ${s.name}.`,
    s.pct && `Self-assessed proficiency: ${s.pct}%.`,
    s.ships && `Evidence: ${s.ships}.`,
    s.note,
    s.shipsList && `Used in: ${stripHtml(s.shipsList)}.`,
  ]);
}

// ---------- 3. headline stats + what he's working on ----------
const hs = CONFIG.heroStats || {};
add('meta:stats', 'Portfolio stats', 'meta', [
  hs.shipped != null && `${hs.shipped} projects shipped.`,
  hs.papers != null && `${hs.papers} research papers.`,
  hs.building != null && `${hs.building} projects currently being built.`,
  CONFIG.currentlyTraining && `Currently working on: ${flatten(CONFIG.currentlyTraining)}.`,
]);

// ---------- 4. contact ----------
const contact = CONFIG.contact || {};
add('meta:contact', 'Contact', 'meta', [
  'How to reach Vatsal Vaghasiya:',
  ...CONTACT_FIELDS_TO_INDEX.map(f => contact[f] && `${f}: ${contact[f]}`),
]);

// ---------- 5. narrative sections from index.html ----------
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
for (const id of HTML_SECTIONS) {
  const re = new RegExp(`<section[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/section>`, 'i');
  const m = html.match(re);
  if (!m) { warnings.push(`index.html section not found: #${id}`); continue; }
  const text = stripHtml(m[1]);
  if (text.length < 40) { warnings.push(`index.html section #${id} had little text (${text.length} chars)`); continue; }
  // Long sections get split so one giant chunk cannot dominate retrieval.
  const MAX = 1200;
  if (text.length <= MAX) {
    add(`section:${id}`, id, 'section', [text]);
  } else {
    const sentences = text.split(/(?<=\.)\s+/);
    let buf = '', part = 1;
    for (const s of sentences) {
      if ((buf + ' ' + s).length > MAX && buf) {
        add(`section:${id}#${part++}`, id, 'section', [buf]);
        buf = s;
      } else buf = buf ? `${buf} ${s}` : s;
    }
    if (buf) add(`section:${id}#${part}`, id, 'section', [buf]);
  }
}

// ---------- fail loudly ----------
if (errors.length) {
  console.error('\nknowledge build FAILED:\n' + errors.map(e => `  - ${e}`).join('\n') + '\n');
  process.exit(1);
}

// ---------- build the inverted index ----------
// Precomputed at build time so the Worker only tokenizes the short query at
// request time, keeping us well inside the Workers CPU budget.
const docLens = [];
const titleTokens = [];
const postings = {}; // term -> [[chunkIndex, termFrequency], ...]

chunks.forEach((c, i) => {
  const aliases = aliasesFor(c.id, c.kind);
  // Title repeated so a name match outweighs an incidental body mention: asking
  // "what is cachy" should surface Cachy, not every project that name-drops it.
  const stream = [
    c.title, c.title, c.title,
    aliases, aliases,
    c.kind,
    c.text,
  ].join(' ');

  const terms = tokenize(stream);
  docLens.push(terms.length);
  titleTokens.push(tokenize(c.title));

  const tf = new Map();
  for (const t of terms) tf.set(t, (tf.get(t) || 0) + 1);
  for (const [t, n] of tf) {
    (postings[t] ||= []).push([i, n]);
  }
});

const avgDocLen = docLens.reduce((a, b) => a + b, 0) / (docLens.length || 1);

const kb = {
  builtAt: new Date().toISOString(),
  chunks: chunks.map(c => ({ id: c.id, title: c.title, kind: c.kind, text: c.text })),
  docLens,
  titleTokens,
  avgDocLen,
  postings,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `// GENERATED by build-knowledge.mjs -- do not edit by hand.\n// Built ${kb.builtAt} from projects-data.js and index.html.\nexport default ${JSON.stringify(kb)};\n`);

// ---------- report ----------
const chars = chunks.reduce((a, c) => a + c.text.length, 0);
const byKind = chunks.reduce((m, c) => ((m[c.kind] = (m[c.kind] || 0) + 1), m), {});
console.log('knowledge base built');
console.log(`  chunks:      ${chunks.length}  (${Object.entries(byKind).map(([k, v]) => `${k}:${v}`).join(', ')})`);
console.log(`  content:     ${chars} chars  ~${Math.round(chars / 4)} tokens`);
console.log(`  vocabulary:  ${Object.keys(postings).length} unique terms`);
console.log(`  avg doc len: ${avgDocLen.toFixed(1)} terms`);
console.log(`  artifact:    ${(JSON.stringify(kb).length / 1024).toFixed(1)} KB`);
if (warnings.length) console.log('  warnings:\n' + warnings.map(w => `    - ${w}`).join('\n'));

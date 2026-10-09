
// ============ Dark Mode ============
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  const isDark = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) document.body.classList.add('dark-mode');
  themeToggle.textContent = isDark ? '☀' : '☾';
  themeToggle.addEventListener('click', () => {
    const willBeDark = !document.body.classList.contains('dark-mode');
    document.body.classList.toggle('dark-mode', willBeDark);
    themeToggle.textContent = willBeDark ? '☀' : '☾';
    localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
  });
}

// ============ Scroll reveal + skill bars ============
document.documentElement.classList.add('js');   // reveal-gating: no JS, no hiding
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    if (e.target.classList.contains('skill')) animateSkill(e.target);
    io.unobserve(e.target);
  }
}, { threshold: 0.18 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

function animateSkill(el) {
  // bars show relative depth; the receipts label carries the claim (no fake %)
  el.style.setProperty('--w', el.dataset.pct + '%');
}

document.querySelectorAll('.card .pipeline').forEach(pl => {
  pl.querySelectorAll('span').forEach((s, i) => s.style.setProperty('--i', i));
});

// ============ Notebook card: real day + page = days since B.Tech init ============
// This file is also loaded by case/project.html, which ships none of the
// homepage furniture. Unguarded lookups here used to throw on every detail
// page, and since this is one flat top-level script that killed everything
// below the throw.
const ncDay = document.getElementById('ncDay');
const ncPage = document.getElementById('ncPage');
if (ncDay) {
  ncDay.textContent = new Date().toLocaleDateString('en', { weekday: 'short' });
}
if (ncPage) {
  ncPage.textContent = Math.floor((Date.now() - new Date('2021-10-01')) / 864e5);
}

// ============ GitHub live activity ============
if (document.getElementById('ghLive')) {
  fetch('https://api.github.com/users/Vatsal057/events/public')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(events => {
      if (!events.length) return;
      const hrs = Math.round((Date.now() - new Date(events[0].created_at)) / 36e5);
      const ago = hrs < 1 ? 'under an hour ago' : hrs < 48 ? `${hrs}h ago` : `${Math.round(hrs / 24)}d ago`;
      const el = document.getElementById('ghLive');
      el.textContent = `// last GitHub activity: ${ago}`;
      el.hidden = false;
    })
    .catch(() => {});
}

// ============ Typewriter ============
const ROLES = ['AI engineer in training', 'MTech · Data Science', 'RAG, from scratch', 'paper under review', '19 projects shipped'];
const typeTarget = document.getElementById('typeTarget');
if (typeTarget) {
  (function typeLoop(ri = 0, ci = 0, deleting = false) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { typeTarget.textContent = ROLES[0]; return; }
    const word = ROLES[ri % ROLES.length];
    typeTarget.textContent = word.slice(0, ci);
    let delay = deleting ? 32 : 62;
    if (!deleting && ci === word.length) { deleting = true; delay = 1700; }
    else if (deleting && ci === 0) { deleting = false; ri++; delay = 350; }
    setTimeout(() => typeLoop(ri, ci + (deleting ? -1 : 1), deleting), delay);
  })();
}

// ============ Flip cards ============
// The research sheets used to be in here. They no longer flip: the numbers that
// prove the papers were on the back face, where a scanning reader never saw them.
document.querySelectorAll('.card-flip').forEach(card => {
  // ISSUE 18 — the card announces itself as a button but never announced its
  // state, so a screen-reader user had no way to know the card was now showing
  // its other side. aria-pressed is the right property for a toggle button.
  card.setAttribute('aria-pressed', 'false');
  const flip = () => {
    const flipped = card.classList.toggle('flipped');
    card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
  };
  card.addEventListener('click', e => { if (!e.target.closest('a')) flip(); });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });
});

// Keyboard accessibility for cards with role="link"
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const linkEl = e.target && e.target.closest ? e.target.closest('[role="link"]') : null;
    if (linkEl && !linkEl.closest('a')) {
      e.preventDefault();
      linkEl.click();
    }
  }
});

// ============ Nav: current section ============
// ISSUE 17 — the top nav is nine links over a document that measures 11,162px
// and it had no current state, so it was a jump list rather than an orientation
// aid. rootMargin biases the "active" band to the upper third of the viewport so
// the highlight changes when a section heading reaches reading position, not
// when the section merely touches the bottom edge.
(() => {
  const links = [...document.querySelectorAll('.topnav a[href^="#"]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const byId = new Map();
  links.forEach(a => {
    const el = document.getElementById(a.hash.slice(1));
    if (el) byId.set(el, a);
  });
  if (!byId.size) return;

  const visible = new Set();
  const paint = () => {
    // topmost visible section wins, so overlapping sections cannot both light up
    let best = null, bestTop = Infinity;
    visible.forEach(el => {
      const t = el.getBoundingClientRect().top;
      if (t < bestTop) { bestTop = t; best = el; }
    });
    links.forEach(a => a.removeAttribute('aria-current'));
    if (best) byId.get(best).setAttribute('aria-current', 'page');
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
    paint();
  }, { rootMargin: '-72px 0px -62% 0px', threshold: 0 });
  byId.forEach((_, el) => io.observe(el));
})();

// ============ Recruiter mode ============
const recruiterToggle = document.getElementById('recruiterToggle');
// The switch only exists on the homepage, but the preference is global, so the
// body class is applied either way — a detail page should stay quiet too.
document.body.classList.toggle('recruiter', localStorage.getItem('recruiter') === '1');
if (recruiterToggle) {
  recruiterToggle.checked = localStorage.getItem('recruiter') === '1';
  recruiterToggle.addEventListener('change', () => {
    document.body.classList.toggle('recruiter', recruiterToggle.checked);
    localStorage.setItem('recruiter', recruiterToggle.checked ? '1' : '0');
  });
}

// Guide mascot logic moved to guide.js

// ============ Terminal ============
const PROJECT_FILES = {
  'cachy':        'Cachy - knowledge engine. Reels/articles → structured cards.\n  transcription (faster-whisper) + OCR (tesseract) + LLM chain w/ 3-provider fallback\n  semantic knowledge graph · Flutter + FastAPI · offline-capable',
  'rag':          'Constitution of India RAG - QA with citations.\n  sentence-transformers + ChromaDB + Mistral-7B\n  retrieval written from scratch (~60 lines, no framework) · 78% accuracy, failures documented',
  'ipl-mlops':    'IPL Match Predictor - full ML lifecycle.\n  XGBoost + FastAPI + Streamlit, 3 services on Docker Compose\n  drift monitor computes PSI every 5 min → flags retraining',
  'airswipe':     'AirSwipe - control slides with bare hands.\n  MediaPipe + OpenCV · swipe/point/pinch · orientation-invariant',
  'aqi':          'Bangalore AQI - clustering 14 stations, 1 year of data.\n  K-Means vs hierarchical vs DBSCAN → DBSCAN found hotspots (Silk Board, AQI 500)',
  'scribbletype': 'ScribbleType - handwriting → text for seniors.\n  on-device ML Kit ink recognition · tremor smoothing · system-wide Android IME',
  'insomniac':    'Insomniac - macOS keep-awake, lid closed included.\n  smart triggers (app/Wi-Fi/CPU/downloads) · insomniac:// URL scheme · Swift + IOKit',
  'glide':        'Glide - custom 3/4/5-finger trackpad gestures.\n  speed-aware actions · reciprocal undo · haptics · IOKit multitouch',
  'dimmer':       'Dimmer - dims displays below hardware minimum.\n  overlay windows · multi-monitor · menu bar app · Swift',
  'photowidget':  'PhotoWidget - your photos as desktop widgets.\n  4 sizes · per-widget photo choice · WidgetKit + AppIntents',
  'media-manager':'Media Manager - tidies photo library with verifiable Undo.\n  Swift · SwiftUI · ffmpeg · Core Location',
  'wardrobe':     'Smart Wardrobe - AI outfit suggestions.\n  weather + occasion + wash history · cost-per-wear analytics · Flutter, all local',
  'preference-prediction': 'Efficient LLM Preference Classification.\n  Siamese DeBERTa-v3-xsmall · held-out log loss 1.0384 · 46.40% acc · 2× Tesla T4s',
};
const HELP = `available commands:
  <span class="t-sage">about</span>          who is this guy
  <span class="t-sage">projects</span>       list all 13          <span class="t-dim">(then: cat &lt;name&gt;)</span>
  <span class="t-sage">apps</span>           shipped apps by platform
  <span class="t-sage">papers</span>         research under review
  <span class="t-sage">skills</span>         training progress
  <span class="t-sage">timeline</span>       git log --journey
  <span class="t-sage">train</span>          run a training job
  <span class="t-sage">contact</span>        how to reach
  <span class="t-sage">resume</span>         download resume.pdf
  <span class="t-sage">open</span> github|linkedin|kaggle
  <span class="t-sage">sudo hire-me</span>   escalate privileges
  <span class="t-sage">clear</span> · <span class="t-sage">exit</span>`;

const overlay = document.getElementById('terminalOverlay');
const termOut = document.getElementById('termOut');
const termInput = document.getElementById('termInput');
const termBody = document.getElementById('termBody');
const history = [];
let histIdx = -1;

function tprint(html, cls = '') {
  const div = document.createElement('div');
  div.innerHTML = `<pre${cls ? ` class="${cls}"` : ''}>${html}</pre>`;
  termOut.appendChild(div);
  termBody.scrollTop = termBody.scrollHeight;
}

function openTerminal() {
  overlay.hidden = false;
  if (!termOut.childElementCount) {
    tprint(`<span class="t-amber">vatsal-lab OS 1.0</span> - type <span class="t-sage">help</span> to begin`);
  }
  termInput.focus();
}
function closeTerminal() { overlay.hidden = true; }

// Terminal mode is homepage-only furniture; detail pages ship none of it.
if (overlay && termOut && termInput && termBody) {
  document.getElementById('terminalBtn').addEventListener('click', openTerminal);
  document.getElementById('terminalClose').addEventListener('click', closeTerminal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeTerminal(); });
  termBody.addEventListener('click', () => termInput.focus());

  // The training loop and the terminal were both real and both undiscoverable:
  // nothing on the first screen invited a click. This puts one honest entry
  // point in the hero instead of leaving them behind a corner button.
  document.getElementById('heroTrainBtn')?.addEventListener('click', () => {
    openTerminal();
    runCommand('train');
  });

  document.addEventListener('keydown', e => {
    if (e.key === '`' && e.ctrlKey) { e.preventDefault(); overlay.hidden ? openTerminal() : closeTerminal(); }
    if (e.key === 'Escape' && !overlay.hidden) closeTerminal();
  });
}

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function runCommand(raw) {
  const input = raw.trim();
  tprint(`<span class="t-sage">vatsal@lab:~$</span> ${esc(input)}`);
  if (!input) return;
  history.unshift(input); histIdx = -1;
  const [cmd, ...args] = input.split(/\s+/);
  const arg = args.join(' ').toLowerCase();

  switch (cmd.toLowerCase()) {
    case 'help': tprint(HELP); break;
    case 'about':
    case 'whoami':
      tprint(`Vatsal Vaghasiya - AI engineer in training.
MTech Data Science @ Ramaiah University (Bengaluru).
Builds ML systems end to end and ships working software.
1 paper under review (first author) · 19 projects shipped.`); break;
    case 'ls':
    case 'projects':
      tprint(Object.keys(PROJECT_FILES).map(k => `<span class="t-sage">${k}/</span>`).join('  ') +
        `\n<span class="t-dim">13 total. try: cat rag</span>`); break;
    case 'apps':
      tprint(`macOS: <span class="t-sage">insomniac glide dimmer photowidget media-manager</span>
mobile: <span class="t-sage">scribbletype wardrobe cachy</span>
<span class="t-dim">try: cat glide</span>`); break;
    case 'cat': {
      const key = arg.replace(/\/$/, '');
      tprint(PROJECT_FILES[key] ? esc(PROJECT_FILES[key]) : `cat: ${esc(arg) || '?'}: no such file. try: projects`, PROJECT_FILES[key] ? '' : 't-err'); break;
    }
    case 'papers':
    case 'paper':
      tprint(`[1] Efficient LLM Preference Classification - Siamese DeBERTa
    Vaghasiya, Kshetrimayum, Prabadevi, Prathap  <span class="t-dim">(first author)</span>
    log loss 1.0384 · 46.40% acc · 127× fewer params · 2× Tesla T4s
    <span class="t-amber">under review</span> · papers/efficient-llm-preference-classification.pdf`); break;
    case 'skills':
      tprint(`Python        ██████████████████░░  90%
DL / PyTorch  ████████████████░░░░  82%
Vision        ████████████████░░░░  80%
LLMs & RAG    █████████████░░░░░░░  68%  <span class="t-dim">← training</span>
SQL           ██████████████░░░░░░  72%
MLOps         ██████████████░░░░░░  70%`); break;
    case 'timeline':
    case 'git':
      tprint(`<span class="t-amber">a1f2021</span> Oct 2021  init: B.Tech @ SAL College of Engineering
<span class="t-amber">b3c4d55</span> 2023      feat: Python + OpenCV
<span class="t-amber">c7e8f01</span> 2024      feat: AirSwipe, first real users
<span class="t-amber">d9a0b12</span> Apr 2025  release: B.Tech complete
<span class="t-amber">f5e6a78</span> Nov 2025  checkout -b mtech @ Ramaiah University
<span class="t-amber">e2c3d44</span> Feb 2026  feat: paper submitted (LLM Preference Prediction)
<span class="t-amber">b9c0d12</span> Aug 2026  feat: won 1st prize @ Karnataka Education Datathon
<span class="t-sage">HEAD</span>    now       training…`); break;
    case 'train': fakeTrain(); break;
    case 'contact':
      const cPhone = window.CONFIG?.contact?.phone || '+91 8780335009';
      tprint(`phone:    ${cPhone}
email:    <span class="t-sage">kvaghasiya057@gmail.com</span>
github:   github.com/Vatsal057
linkedin: linkedin.com/in/vatsal-vaghasiya
kaggle:   kaggle.com/vatsalvaghasiya`); break;
    case 'resume':
      tprint(`downloading resume.pdf …`, 't-sage');
      { const a = document.createElement('a'); a.href = ROOT + 'resume.pdf'; a.download = 'Vatsal-Vaghasiya-Resume.pdf'; a.click(); } break;
    case 'open': {
      const urls = { github: 'https://github.com/Vatsal057', linkedin: 'https://www.linkedin.com/in/vatsal-vaghasiya/', kaggle: 'https://www.kaggle.com/vatsalvaghasiya' };
      if (urls[arg]) { tprint(`opening ${arg}…`, 't-sage'); window.open(urls[arg], '_blank'); }
      else tprint(`open: unknown target. try: open github`, 't-err'); break;
    }
    case 'sudo':
      if (arg === 'hire-me') tprint(`[sudo] permission granted.
initiating handshake… <span class="t-sage">✓</span>
send offer to kvaghasiya057@gmail.com`, 't-amber');
      else tprint(`${esc(arg || 'sudo')}: user vatsal is already doing his best`, 't-err'); break;
    case 'rm': tprint(`rm: refusing to delete 4 years of work. nice try.`, 't-err'); break;
    case 'pwd': tprint(`/home/vatsal/lab`); break;
    case 'clear': termOut.innerHTML = ''; break;
    case 'exit': closeTerminal(); break;
    default: tprint(`zsh: command not found: ${esc(cmd)} - try <span class="t-sage">help</span>`, 't-err');
  }
}

function fakeTrain() {
  const epochs = [[1, 2.303], [2, 1.482], [3, 0.977], [4, 0.641], [5, 0.412], [6, 0.288]];
  tprint(`training vatsal_v2.pt on dataset: <span class="t-sage">every_failure_so_far/</span>`);
  epochs.forEach(([ep, loss], i) => {
    setTimeout(() => {
      const filled = '█'.repeat(ep * 3) + '░'.repeat(18 - ep * 3);
      tprint(`epoch ${ep}/6  ${filled}  loss: ${loss.toFixed(3)}`);
      if (ep === 6) tprint(`<span class="t-sage">✓ converged.</span> model improved. it always does.`);
    }, 380 * (i + 1));
  });
}

if (termInput) {
  termInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { runCommand(termInput.value); termInput.value = ''; }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (histIdx < history.length - 1) termInput.value = history[++histIdx] || ''; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); termInput.value = histIdx > 0 ? history[--histIdx] : (histIdx = -1, ''); }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const cmds = ['help', 'about', 'projects', 'papers', 'skills', 'timeline', 'train', 'contact', 'resume', 'open ', 'sudo hire-me', 'clear', 'exit', 'cat '];
      const hit = cmds.find(c => c.startsWith(termInput.value) && termInput.value);
      if (hit) termInput.value = hit;
    }
  });
}

// ============ Konami → gradient descent rain ============
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let kIdx = 0;
document.addEventListener('keydown', e => {
  kIdx = e.key === KONAMI[kIdx] ? kIdx + 1 : (e.key === KONAMI[0] ? 1 : 0);
  if (kIdx === KONAMI.length) { kIdx = 0; gradientRain(); cheer(); }
});

function gradientRain() {
  const cv = document.getElementById('rain');
  if (!cv) return;                       // homepage-only easter egg
  cv.hidden = false;
  cv.width = innerWidth; cv.height = innerHeight;
  const ctx = cv.getContext('2d');
  const cols = Math.floor(cv.width / 18);
  const drops = Array.from({ length: cols }, () => Math.random() * -40);
  const glyphs = '0123456789.∇θλη';
  let frames = 0;
  say('gradient descent detected. loss is falling.', true);
  const iv = setInterval(() => {
    ctx.fillStyle = 'rgba(247,245,240,.18)';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.font = '14px JetBrains Mono';
    drops.forEach((y, i) => {
      ctx.fillStyle = Math.random() < .12 ? '#D9A86C' : '#8FA98F';
      ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * 18, y * 18);
      drops[i] = y * 18 > cv.height && Math.random() > .97 ? 0 : y + .55;
    });
    if (++frames > 260) { clearInterval(iv); cv.hidden = true; }
  }, 33);
}

// ============ Motion layer — vanilla, zero dependencies ============
// The pinned shelf, magnetic buttons and card tilt are gone on purpose:
// they hid content and taxed scroll. Motion now lives in reveals, hovers,
// the count-up, and the cursor below. Recruiter mode / reduced motion win.
(() => {
  if (window.CONFIG) {
    const c = window.CONFIG;
    
    // 1. Hero Stats
    if (c.heroStats) {
      const update = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) { el.dataset.count = val; el.textContent = val; } };
      update('stat-shipped', c.heroStats.shipped); update('stat-papers', c.heroStats.papers); update('stat-building', c.heroStats.building);
    }
    

    // 3. Currently Training
    const trainList = document.getElementById('trainingList');
    if (trainList && c.currentlyTraining) {
      let html = '<p class="nc-label">currently training:</p>';
      c.currentlyTraining.forEach(t => html += `<p>□ ${t}</p>`);
      trainList.innerHTML = html;
    }
    
    // 4. Skills Grid
    const skillsGrid = document.getElementById('skillsGrid');
    if (skillsGrid && c.skills) {
      let html = '';
      c.skills.forEach(s => {
        // The bar is now a 3px rule rather than the headline. Seven bars all
        // filled to the same 60-75% said nothing; the shipped-work line below
        // is the actual evidence, so it carries the weight instead.
        html += `
        <div class="skill reveal" data-pct="${s.pct}">
          <div class="skill-top mono"><b>${s.name}</b><span class="skill-pct">${s.ships}</span></div>
          <div class="bar"><div class="bar-fill"></div></div>
          <p class="skill-note">${s.note}</p>
          <p class="skill-ships mono">${s.shipsList}</p>
        </div>`;
      });
      skillsGrid.innerHTML = html;
      skillsGrid.querySelectorAll('.reveal').forEach(el => io.observe(el));
    }
    
    // 5. Contact Form Access Key
    const accessKey = document.getElementById('formAccessKey');
    if (accessKey && c.formAccessKey) accessKey.value = c.formAccessKey;
    
    // 6. Contact Links
    const contactLinks = document.getElementById('contactLinks');
    if (contactLinks && c.contact) {
      contactLinks.innerHTML = `
        <a class="btn btn-ghost" href="tel:${c.contact.phone.replace(/\s+/g, '')}">${c.contact.phone}</a>
        <a class="btn btn-ghost" href="mailto:${c.contact.email}">${c.contact.email}</a>
        <a class="btn btn-ghost" href="${c.contact.github}" target="_blank" rel="noopener">GitHub</a>
        <a class="btn btn-ghost" href="${c.contact.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
        <a class="btn btn-ghost" href="${c.contact.kaggle}" target="_blank" rel="noopener">Kaggle</a>
        <a class="btn btn-ghost" href="${c.contact.resumeUrl}" download>Résumé (PDF)</a>
      `;
      contactLinks.querySelectorAll('.reveal').forEach(el => io.observe(el));
    }
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) {
    document.querySelectorAll('.hero-stats .count').forEach(el => {
      const end = +el.dataset.count, t0 = performance.now(), dur = 1400;
      (function tick(t) {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }
})();

// ============ Notebook cursor — ink dot + sketch ring ============
// Shape-shifts per element. Off for touch, reduced motion, recruiter mode,
// and steps aside over text inputs so the native caret works.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!matchMedia('(pointer: fine)').matches) return;

  const dot = document.createElement('div');
  const ring = document.createElement('div');
  const label = document.createElement('span');
  dot.className = 'nbc-dot';
  ring.className = 'nbc-ring';
  label.className = 'nbc-label';
  ring.appendChild(label);
  document.body.append(dot, ring);

  // dot snaps, ring lags — pen tip and its halo. One rAF lerp loop, no library.
  //
  // Two things here used to cost a frame's worth of work forever. The ring was
  // positioned with `calc(Xpx - 50%)`, so every single frame had to resolve a
  // percentage against the ring's own box; it is centred with a margin now and
  // the loop writes plain pixels. And the loop never returned, so the compositor
  // had work queued even with the mouse sitting still — it now stops once the
  // lerp has caught up and is restarted by kick().
  const pos = { dx: 0, dy: 0, rx: 0, ry: 0, tx: 0, ty: 0, rtx: 0, rty: 0 };
  let raf = 0;
  const settled = () =>
    Math.abs(pos.tx - pos.dx) < 0.05 && Math.abs(pos.ty - pos.dy) < 0.05 &&
    Math.abs(pos.rtx - pos.rx) < 0.05 && Math.abs(pos.rty - pos.ry) < 0.05;

  function loop() {
    pos.dx += (pos.tx - pos.dx) * 0.55;
    pos.dy += (pos.ty - pos.dy) * 0.55;
    pos.rx += (pos.rtx - pos.rx) * 0.16;
    pos.ry += (pos.rty - pos.ry) * 0.16;
    dot.style.translate = `${pos.dx.toFixed(1)}px ${pos.dy.toFixed(1)}px`;
    ring.style.translate = `${pos.rx.toFixed(1)}px ${pos.ry.toFixed(1)}px`;
    if (settled()) { raf = 0; return; }
    raf = requestAnimationFrame(loop);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const dx = v => { pos.tx = v; }, dy = v => { pos.ty = v; };
  const rx = v => { pos.rtx = v; }, ry = v => { pos.rty = v; };

  const recruiterOn = () => document.body.classList.contains('recruiter');
  // `armed` replaces the old one-way `started`. It has to be able to go back to
  // false: see cursorPark() for why.
  let armed = false, stuck = null, cx = 0, cy = 0;
  const stuckBox = { cx: 0, cy: 0 };

  addEventListener('pointermove', e => {
    cx = e.clientX; cy = e.clientY;
    if (!armed && !recruiterOn()) {
      // Snap every target to the pointer before showing the cursor, otherwise it
      // flies in across the page from wherever it was last parked.
      pos.dx = pos.tx = pos.rx = pos.rtx = cx;
      pos.dy = pos.ty = pos.ry = pos.rty = cy;
      document.body.classList.add('nbc-on');
      armed = true;
    }
    dx(cx); dy(cy);
    if (stuck) {
      // Conform to the button, follow the cursor only a little (magnetic stick).
      // The rect is cached at morph time; reading it here meant a forced layout
      // on every pointermove.
      const bx = stuckBox.cx, by = stuckBox.cy;
      rx(bx + (cx - bx) * 0.18); ry(by + (cy - by) * 0.18);
    } else {
      rx(cx); ry(cy);
    }
    kick();
  }, { passive: true });

  // ring morphs into the button's own box (size + corner radius) and sticks
  function morphTo(el) {
    if (stuck === el) return;
    stuck = el;
    const r = el.getBoundingClientRect();
    const br = parseFloat(getComputedStyle(el).borderRadius) || 6;
    const w = r.width + 12, h = r.height + 12;
    stuckBox.cx = r.left + r.width / 2;
    stuckBox.cy = r.top + r.height / 2;
    dot.classList.add('is-shape'); ring.classList.add('is-shape');
    ring.style.width = w + 'px';
    ring.style.height = h + 'px';
    ring.style.borderRadius = (br + 5) + 'px';
    // Centring is a margin rather than a percentage translate, so it only has to
    // be recomputed when the size changes instead of on every frame.
    ring.style.margin = `${-h / 2}px 0 0 ${-w / 2}px`;
    kick();
  }
  function morphReset() {
    if (!stuck) return;
    stuck = null;
    dot.classList.remove('is-shape'); ring.classList.remove('is-shape');
    ring.style.width = ''; ring.style.height = ''; ring.style.borderRadius = '';
    ring.style.margin = '';
    kick();
  }

  // morphReset() early-returns unless something is morphed, so it can only ever
  // clear `is-shape` — it cannot clear `is-link` or `is-label`. Every "put the
  // cursor back to normal" caller below was calling it and silently leaving the
  // label state behind. This clears all of it, unconditionally.
  function cursorReset() {
    stuck = null;
    dot.classList.remove('is-shape', 'is-link', 'is-label', 'is-down');
    ring.classList.remove('is-shape', 'is-link', 'is-label', 'is-down');
    ring.style.width = ''; ring.style.height = '';
    ring.style.borderRadius = ''; ring.style.margin = '';
    label.textContent = '';
  }

  // Park the cursor: clear it, hide it, and disarm so the next real pointermove
  // re-arms it at the pointer's actual position.
  //
  // This is the fix for "I clicked a card, it opened a new page, I came back and
  // the cursor was stuck to that card". A same-origin back navigation is served
  // from the back/forward cache, which restores the DOM *and* the JS heap exactly
  // as they were — including `is-label` on the ring, the "view →" text inside it,
  // the ring's last translate, and `nbc-on` on <body> (which hides the native
  // cursor). So the page came back with a 2.15x "view →" ring frozen on the card
  // you left from and no system cursor to replace it, and it stayed that way
  // until you moved the mouse far enough to cross into a different element and
  // trigger a mouseover. Parking on the way out *and* the way back in means the
  // frozen state is clean in both directions.
  function cursorPark() {
    cursorReset();
    document.body.classList.remove('nbc-on');
    armed = false;
  }

  // what the cursor becomes, first match wins
  const LABELS = [
    ['.card-flip', 'flip →'],
    ['.book', 'peek'],
    ['.recruiter-switch', 'quiet mode'],
    ['.cert-card', 'view PDF'],
  ];
  const BTNS = '.btn, .terminal-btn, button:not(#robotBtn)';
  const GROW = 'a, [role="button"], [role="link"], label, .topnav a';
  const NATIVE = 'input, textarea, .terminal-overlay';

  const setState = (link, lbl) => {
    dot.classList.toggle('is-link', link);
    ring.classList.toggle('is-link', link);
    dot.classList.toggle('is-label', !!lbl);
    ring.classList.toggle('is-label', !!lbl);
    if (lbl) label.textContent = lbl;
  };

  document.addEventListener('mouseover', e => {
    const t = e.target;
    if (recruiterOn()) return;
    if (t.closest(NATIVE)) { document.body.classList.remove('nbc-on'); morphReset(); setState(false, null); return; }
    if (armed) document.body.classList.add('nbc-on');
    for (const [sel, text] of LABELS) {
      if (t.closest(sel)) { morphReset(); setState(false, text); return; }
    }

    const btn = t.closest(BTNS + ', a');
    if (btn) { setState(false, null); morphTo(btn); return; }

    // Card cursor logic (V1: view →)
    const card = t.closest('.card:not(.card-flip), .app-window, .cardflip-back, .achievement-card');
    if (card) { morphReset(); setState(false, 'view →'); return; }

    morphReset();
    setState(!!t.closest(GROW), null);
  });
  document.documentElement.addEventListener('mouseleave', () => document.body.classList.remove('nbc-on'));
  document.documentElement.addEventListener('mouseenter', () => { if (armed && !recruiterOn()) document.body.classList.add('nbc-on'); });

  // A morph caches the target's rect once, and morphTo() early-returns while the
  // same element is still hovered, so a scroll that does not change the hovered
  // element leaves the magnetic anchor pointing at coordinates the element has
  // moved away from — the ring then hangs off a point in space. Measured: after
  // scrollBy(0, 400) the anchor was still 400px stale. Dropping the morph on
  // scroll is enough; the next mouseover re-measures.
  addEventListener('scroll', () => { if (stuck) morphReset(); }, { passive: true });

  const setDown = on => {
    dot.classList.toggle('is-down', on);
    ring.classList.toggle('is-down', on);
  };
  addEventListener('pointerdown', () => setDown(true));
  addEventListener('pointerup', () => setDown(false));

  // Clicking something that opens a new tab moves focus away before pointerup
  // ever reaches this page, so is-down stayed on and the cursor kept its pressed
  // size for good. Every path that can swallow the pointerup has to release it.
  addEventListener('pointercancel', () => setDown(false));
  addEventListener('contextmenu', () => setDown(false));

  // These all mean "the pointer is no longer ours". They used to call
  // morphReset(), which cannot clear the label state, so a ring showing
  // "view →" survived every one of them.
  addEventListener('blur', cursorPark);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cursorPark(); });
  // Clean on the way out, so the state the back/forward cache freezes is already
  // neutral...
  addEventListener('pagehide', cursorPark);
  // ...and clean on the way back in, because a restore hands back whatever was
  // frozen. Deliberately does NOT re-add nbc-on: the browser is showing the
  // native cursor at this point, and the first pointermove re-arms ours at the
  // pointer's real position rather than leaving one frozen on the old card.
  // Gated on persisted: only a restore can carry stale state, and parking on a
  // fresh parse would race a pointermove that arrived while the page was loading.
  addEventListener('pageshow', e => { if (e.persisted) cursorPark(); });

  // recruiter switch kills it, native cursor returns. The switch itself lives
  // only on the homepage; detail pages read the stored preference instead.
  const rt = document.getElementById('recruiterToggle');
  if (rt) {
    rt.addEventListener('change', () => {
      cursorReset();
      document.body.classList.toggle('nbc-on', armed && !recruiterOn());
    });
  }
})();

// ============ Web3Forms Contact Handler ============
const form = document.getElementById('contactForm');
const result = document.getElementById('formResult');
const submitBtn = document.getElementById('submitBtn');

if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    result.style.display = "block";
    result.textContent = "Sending...";
    result.className = "mono form-result";
    submitBtn.disabled = true;

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: json
    })
    .then(async (response) => {
      let json = await response.json();
      if (response.status == 200) {
        result.textContent = "Message sent successfully! 🚀";
        result.classList.add("success");
      } else {
        console.log(response);
        result.textContent = json.message;
        result.classList.add("error");
      }
    })
    .catch(error => {
      console.log(error);
      result.textContent = "Something went wrong!";
      result.classList.add("error");
    })
    .finally(function() {
      submitBtn.disabled = false;
      form.reset();
      setTimeout(() => {
        result.style.display = "none";
      }, 5000);
    });
  });
}

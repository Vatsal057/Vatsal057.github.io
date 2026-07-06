// ============ Scroll reveal + skill bars ============
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
  const pct = +el.dataset.pct;
  el.style.setProperty('--w', pct + '%');
  const label = el.querySelector('.skill-pct');
  const t0 = performance.now(), dur = 1100;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { label.textContent = pct + '%'; return; }
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1);
    label.textContent = Math.round(pct * (1 - Math.pow(1 - p, 3))) + '%';
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

document.querySelectorAll('.card .pipeline').forEach(pl => {
  pl.querySelectorAll('span').forEach((s, i) => s.style.setProperty('--i', i));
});

// ============ Notebook card: real day + page = days since B.Tech init ============
document.getElementById('ncDay').textContent =
  new Date().toLocaleDateString('en', { weekday: 'short' });
document.getElementById('ncPage').textContent =
  Math.floor((Date.now() - new Date('2021-10-01')) / 864e5);

// ============ GitHub live activity ============
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

// ============ Typewriter ============
const ROLES = ['AI engineer in training', 'MTech · Data Science', 'RAG, from scratch', 'two papers under review', '13 projects shipped'];
const typeTarget = document.getElementById('typeTarget');
(function typeLoop(ri = 0, ci = 0, deleting = false) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { typeTarget.textContent = ROLES[0]; return; }
  const word = ROLES[ri % ROLES.length];
  typeTarget.textContent = word.slice(0, ci);
  let delay = deleting ? 32 : 62;
  if (!deleting && ci === word.length) { deleting = true; delay = 1700; }
  else if (deleting && ci === 0) { deleting = false; ri++; delay = 350; }
  setTimeout(() => typeLoop(ri, ci + (deleting ? -1 : 1), deleting), delay);
})();

// ============ Paper flip cards ============
document.querySelectorAll('.paper-flip').forEach(card => {
  const flip = () => card.classList.toggle('flipped');
  card.addEventListener('click', flip);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });
});

// ============ Recruiter mode ============
const recruiterToggle = document.getElementById('recruiterToggle');
recruiterToggle.checked = localStorage.getItem('recruiter') === '1';
document.body.classList.toggle('recruiter', recruiterToggle.checked);
recruiterToggle.addEventListener('change', () => {
  document.body.classList.toggle('recruiter', recruiterToggle.checked);
  localStorage.setItem('recruiter', recruiterToggle.checked ? '1' : '0');
});

// ============ AI companion ============
// ponytail: keyword matcher now; swap answer() for a RAG endpoint when an API key exists
const LINES = [
  "Welcome. I trained all night.",
  "Say 'tour' below and I'll walk you through everything.",
  "13 projects. 2 papers. Scroll — I'll wait.",
  "I can run things. Try 'run train' or 'flip the papers'.",
  "Try the terminal. Top right. Ctrl+` also works.",
  "Recruiter? There's a switch up top. It makes me disappear. Rude.",
];
const ANSWERS = [
  [/rag|retrieval|chroma|vector/i, "He built RAG from scratch — no LangChain, ~60 lines of retrieval logic over the Indian Constitution, with citations. 78% accuracy, failures documented publicly."],
  [/paper|research|publish|deberta|clip/i, "Two first-author papers under review: a preference model 127× smaller than rivals, and ProbCLIP-A — uncertainty for CLIP. Flip the papers on the research wall."],
  [/project|built|portfolio|work/i, "13 shipped. Strongest: Cachy (knowledge engine), Constitution RAG, IPL MLOps pipeline. Cards are pinned above."],
  [/skill|python|pytorch|stack|know/i, "Python 4 years, PyTorch (two papers), CV, RAG, SQL, Docker. Honest bars in the skills section — nothing inflated."],
  [/mlops|docker|deploy|drift/i, "IPL predictor runs 3 dockerized services with drift detection — PSI computed every 5 minutes. Real lifecycle, not a notebook."],
  [/hire|intern|job|contact|email|reach/i, "kvaghasiya057@gmail.com. He replies faster than my inference. Résumé button is in the hero."],
  [/terminal|cli|command/i, "Top right: >_ terminal. Or Ctrl+`. Try `train` in there."],
  [/who|you|robot|name/i, "Phase-1 brain: keyword matching, fully offline. Phase 2 gives me real RAG. He believes in shipping first."],
  [/fail|mistake|wrong/i, "Failed column is on the experiment board: a failed RAG stress test, a deleted LangChain build, a collapsed variance. All kept on purpose."],
];
const POSES = ['robot-wave.png', 'robot-think.png', 'robot-point.png'];
const companion = document.getElementById('companion');
const bubble = document.getElementById('companionBubble');
const robotImg = document.getElementById('robotImg');
const robotBtn = document.getElementById('robotBtn');
const askForm = document.getElementById('askForm');
const askInput = document.getElementById('askInput');
let lineIdx = 0, hideTimer;

function say(text, sticky = false) {
  bubble.textContent = text;
  bubble.classList.add('show');
  clearTimeout(hideTimer);
  if (!sticky) hideTimer = setTimeout(() => bubble.classList.remove('show'), 6000);
}

robotBtn.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChat(); }
});
function openChat() {
  companion.classList.add('open');
  setPose(POSES[lineIdx % POSES.length]);
  say(LINES[lineIdx++ % LINES.length], true);
}

// ============ Free-roaming behavior ============
const roamOK = !matchMedia('(prefers-reduced-motion: reduce)').matches
  && !matchMedia('(max-width: 820px)').matches;
const SIZE = 90, SPEED = 110; // px, px/s
let pos = { x: 0, y: 0 }, walking = false, asleep = false, roamTimer, idleTimer;
let walkAnim = null, pendingGoto = null, walkSeq = 0;

const vw = () => document.documentElement.clientWidth;
const vh = () => document.documentElement.clientHeight;
function place(x, y) {
  // hard bounds: the robot can never leave the viewport
  x = Math.max(8, Math.min(x, vw() - SIZE - 8));
  y = Math.max(8, Math.min(y, vh() - SIZE - 12));
  pos = { x, y };
  companion.style.transform = `translate(${x}px, ${y}px)`;
  companion.classList.toggle('on-left', x < vw() / 2);
}
const homeXY = () => [vw() - SIZE - 22, vh() - SIZE - 22];
place(...homeXY());
addEventListener('resize', () => { if (!walking) place(pos.x, pos.y); });

function setPose(name) {
  if (!robotImg.parentElement.classList.contains('fallback')) robotImg.src = 'images/' + name;
}

const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function walkTo(nx, ny, done) {
  nx = Math.max(12, Math.min(nx, vw() - SIZE - 12));
  ny = Math.max(vh() * .35, Math.min(ny, vh() - SIZE - 16));
  const sx = pos.x, sy = pos.y;
  const dist = Math.hypot(nx - sx, ny - sy);
  if (dist < 24) { done && done(); return; }
  cancelAnimationFrame(walkAnim);
  const id = ++walkSeq; // invalidates any pending/running glide
  // turn to face the destination, brief beat, then go
  robotBtn.style.setProperty('--fx', nx < sx ? -1 : 1);
  walking = true;
  setTimeout(() => {
    if (id !== walkSeq) return; // superseded while turning
    robotBtn.classList.add('walking');
    const dur = 350 + (dist / SPEED) * 1000;
    const t0 = performance.now();
    (function step(t) {
      if (id !== walkSeq) return; // superseded mid-glide
      const p = Math.min((t - t0) / dur, 1);
      const e = easeInOut(p);
      // gentle float while gliding
      const drift = Math.sin(p * Math.PI) * -6;
      place(sx + (nx - sx) * e, sy + (ny - sy) * e + drift);
      if (p < 1) { walkAnim = requestAnimationFrame(step); return; }
      walking = false;
      robotBtn.classList.remove('walking');
      if (!asleep) setPose('robot-wave.png');
      done && done();
    })(t0);
  }, 160);
}
function stopWalk() {
  walkSeq++; // kills pending turn-timers and glide loops
  cancelAnimationFrame(walkAnim);
  walking = false;
  robotBtn.classList.remove('walking');
  setPose('robot-wave.png');
}
function cheer(line) {
  setPose('robot-cheer.png');
  if (line) say(line, true);
  setTimeout(() => { if (!asleep && !walking) setPose('robot-wave.png'); }, 3500);
}

const WANDER_QUIPS = [
  "Just stretching the servos.",
  "Don't mind me. Organizing the desk.",
  "I patrol. It's in my job description.",
  "Checking the pins are still holding.",
  "New spot, same opinions.",
];
function roamAct() {
  if (!roamOK || asleep || walking || tourIdx >= 0 || companion.classList.contains('open')
    || document.hidden || document.body.classList.contains('recruiter')) { scheduleRoam(); return; }
  const roll = Math.random();
  if (roll < .65) {
    walkTo(40 + Math.random() * (vw() - 160), vh() * .4 + Math.random() * vh() * .5,
      () => { if (Math.random() < .4) say(WANDER_QUIPS[Math.floor(Math.random() * WANDER_QUIPS.length)]); });
  } else if (roll < .8) {
    setPose('robot-think.png');
    say("Thinking. It's most of the job.");
  } else if (roll < .92) {
    setPose('robot-point.png');
    const ids = ['experiments', 'projects', 'research', 'principles'];
    const id = ids[Math.floor(Math.random() * ids.length)];
    pendingGoto = id;
    say(`Have you seen the ${id} section? Click me — I'll take you.`, true);
  } else {
    walkTo(...homeXY());
  }
  scheduleRoam();
}
function scheduleRoam() {
  clearTimeout(roamTimer);
  roamTimer = setTimeout(roamAct, 6000 + Math.random() * 9000);
}
if (roamOK) scheduleRoam();

// chat left open blocks roaming — auto-close it when the user scrolls away
addEventListener('scroll', () => {
  if (companion.classList.contains('open') && document.activeElement !== askInput) {
    companion.classList.remove('open');
  }
}, { passive: true });

// following a suggestion: clicking robot OR bubble navigates
function followGoto() {
  const id = pendingGoto;
  pendingGoto = null;
  goToSection(id, "Here. Worth the scroll.");
  return true;
}
function goToSection(id, line) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setPose('robot-point.png');
  if (line) setTimeout(() => say(line), 900);
}
bubble.addEventListener('click', e => {
  e.stopPropagation();
  if (pendingGoto) followGoto();
});

// ============ Guided tour — the robot drives ============
const TOUR = [
  ['skills', "Skills. Every bar backed by shipped work — no vibes-based percentages."],
  ['experiments', "The lab board. The failed column is the honest part."],
  ['principles', "How he works. Index cards, because that's how he actually thinks."],
  ['projects', "The desk. Start with the RAG one — built without frameworks."],
  ['apps', "Five native macOS apps in Swift. No Electron in this house."],
  ['research', "Two first-author papers, under review. Click one — they flip."],
  ['timeline', "Four years in one git log."],
  ['contact', "End of notebook. This is where you email him. Tour's over."],
];
let tourIdx = -1, tourTimer;
function startTour() {
  stopTour();
  tourIdx = 0;
  say("Follow me.", true);
  setTimeout(tourStep, 900);
}
function tourStep() {
  if (tourIdx < 0 || tourIdx >= TOUR.length) { stopTour(); return; }
  const [id, line] = TOUR[tourIdx++];
  const last = tourIdx >= TOUR.length;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  walkTo(40 + Math.random() * (innerWidth - 200), innerHeight * .55 + Math.random() * innerHeight * .3);
  setTimeout(() => last ? cheer(line) : say(line, true), 800);
  if (!last) tourTimer = setTimeout(tourStep, 6000);
  else tourIdx = -1;
}
function stopTour() {
  clearTimeout(tourTimer);
  if (tourIdx > 0) say("Tour paused. Say 'tour' to restart.");
  tourIdx = -1;
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') stopTour(); });

// drag the robot anywhere; click (no move) = chat
let dragStart = null;
robotBtn.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  e.preventDefault(); // stop native image drag
  stopWalk(); // freeze any glide NOW so the grab position is the real position
  dragStart = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, moved: false };
  robotBtn.setPointerCapture(e.pointerId);
});
robotBtn.addEventListener('pointermove', e => {
  if (!dragStart) return;
  const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
  if (Math.abs(dx) + Math.abs(dy) > 6) {
    dragStart.moved = true;
    companion.classList.add('dragging');
    place(dragStart.px + dx, dragStart.py + dy);
  }
});
robotBtn.addEventListener('pointerup', () => {
  if (!dragStart) return;
  const moved = dragStart.moved;
  dragStart = null;
  companion.classList.remove('dragging');
  if (moved) { stopWalk(); stopTour(); say("Fine. I live here now."); }
  else if (pendingGoto) followGoto();
  else openChat();
});

// close chat when clicking elsewhere
document.addEventListener('click', e => {
  if (!companion.contains(e.target)) companion.classList.remove('open');
});

// idle → sleep; any activity wakes
function armIdle() {
  clearTimeout(idleTimer);
  if (asleep) { asleep = false; setPose('robot-wave.png'); }
  idleTimer = setTimeout(() => { asleep = true; setPose('robot-sleep.png'); }, 45000);
}
['click', 'scroll', 'keydown', 'pointermove'].forEach(ev =>
  addEventListener(ev, armIdle, { passive: true }));
armIdle();
// commands the robot executes on the site, checked before Q&A answers
const ACTIONS = [
  [/tour|show me around|guide/i, () => startTour()],
  [/train/i, () => { openTerminal(); runCommand('train'); say("Watch the loss. It always goes down eventually.", true); }],
  [/terminal|cli/i, () => { openTerminal(); say("Your shell, my desk. Type help.", true); }],
  [/resume|cv/i, () => {
    const a = document.createElement('a'); a.href = 'resume.pdf'; a.download = 'Vatsal-Vaghasiya-Resume.pdf'; a.click();
    say("Sent. One page, no fluff.", true);
  }],
  [/flip|paper/i, () => {
    goToSection('research');
    setTimeout(() => document.querySelectorAll('.paper-flip').forEach(p => p.classList.add('flipped')), 1000);
    say("Flipped them for you. The backs are the good part.", true);
  }],
  [/github/i, () => { window.open('https://github.com/Vatsal057', '_blank'); say("Opening his GitHub. Judge the commits yourself.", true); }],
  [/linkedin/i, () => { window.open('https://www.linkedin.com/in/vatsal-vaghasiya/', '_blank'); say("LinkedIn. He's less funny there.", true); }],
  [/apps?|macos|swift/i, () => goToSection('apps', "Five macOS apps. All native.")],
  [/skills?$|show skills/i, () => goToSection('skills', "Honest numbers. I checked.")],
  [/experiments?|board|fail/i, () => goToSection('experiments', "The failed column is the point.")],
  [/principles|how.*(work|think)/i, () => goToSection('principles', "Four cards. All true.")],
  [/projects?|cachy|airswipe/i, () => goToSection('projects', "Thirteen shipped. Six pinned.")],
  [/research|papers?/i, () => goToSection('research', "Both first-author. Click to flip.")],
  [/timeline|journey|history/i, () => goToSection('timeline', "git log --journey.")],
  [/contact|email|hire|reach/i, () => { goToSection('contact'); cheer("kvaghasiya057@gmail.com. Go on."); }],
  [/party|rain|konami|dance/i, () => { gradientRain(); cheer(); }],
  [/recruiter/i, () => say("That switch up top deletes me. You'll have to flip it yourself.", true)],
  [/home/i, () => { walkTo(...homeXY()); say("Heading home.", true); }],
];
askForm.addEventListener('submit', e => {
  e.preventDefault();
  const q = askInput.value.trim();
  if (!q) return;
  askInput.value = '';
  // questions get answers; imperatives get actions
  const isQuestion = /\?|^(what|who|why|how|does|do|is|are|tell)\b/i.test(q);
  const action = ACTIONS.find(([re]) => re.test(q));
  const answer = ANSWERS.find(([re]) => re.test(q));
  if (isQuestion && answer) { say(answer[1], true); return; }
  if (action) { action[1](); return; }
  if (answer) { say(answer[1], true); return; }
  say("Outside my training distribution. Try 'tour', 'flip the papers', 'run train', or ask about projects.", true);
});
setTimeout(() => say(LINES[0]), 1400);

// contextual lines as sections scroll into view (each said once)
const SECTION_LINES = {
  experiments: "The failed column is the point. Most portfolios don't have one.",
  principles: "Index cards. He actually works like this.",
  projects: "Try `cat rag` in the terminal for the short version.",
  apps: "He ships Mac apps between papers. Native Swift, no Electron.",
  value: "This section is for you, recruiter. Yes, you.",
  research: "Two papers, both first-author, both trained on free GPUs.",
  timeline: "Four years, one git log.",
  contact: "This is the part where you email him.",
};
const sectionIo = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const line = SECTION_LINES[e.target.id];
    if (line && !bubble.classList.contains('show')) { say(line); delete SECTION_LINES[e.target.id]; }
    sectionIo.unobserve(e.target);
  }
}, { threshold: 0.4 });
Object.keys(SECTION_LINES).forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionIo.observe(el);
});

// ============ Terminal ============
const PROJECT_FILES = {
  'cachy':        'Cachy — knowledge engine. Reels/articles → structured cards.\n  transcription (faster-whisper) + OCR (tesseract) + LLM chain w/ 3-provider fallback\n  semantic knowledge graph · Flutter + FastAPI · offline-capable',
  'rag':          'Constitution of India RAG — QA with citations.\n  sentence-transformers + ChromaDB + Mistral-7B\n  retrieval written from scratch (~60 lines, no framework) · 78% accuracy, failures documented',
  'ipl-mlops':    'IPL Match Predictor — full ML lifecycle.\n  XGBoost + FastAPI + Streamlit, 3 services on Docker Compose\n  drift monitor computes PSI every 5 min → flags retraining',
  'airswipe':     'AirSwipe — control slides with bare hands.\n  MediaPipe + OpenCV · swipe/point/pinch · orientation-invariant',
  'aqi':          'Bangalore AQI — clustering 14 stations, 1 year of data.\n  K-Means vs hierarchical vs DBSCAN → DBSCAN found hotspots (Silk Board, AQI 500)',
  'scribbletype': 'ScribbleType — handwriting → text for seniors.\n  on-device ML Kit ink recognition · tremor smoothing · system-wide Android IME',
  'insomniac':    'Insomniac — macOS keep-awake, lid closed included.\n  smart triggers (app/Wi-Fi/CPU/downloads) · insomniac:// URL scheme · Swift + IOKit',
  'glide':        'Glide — custom 3/4/5-finger trackpad gestures.\n  speed-aware actions · reciprocal undo · haptics · IOKit multitouch',
  'ibar':         'iBar — menu bar theming where Apple provides no API.\n  click-through overlay at menu bar window level · Accessibility API · notch-aware',
  'dimmer':       'Dimmer — dims displays below hardware minimum.\n  overlay windows · multi-monitor · menu bar app · Swift',
  'photowidget':  'PhotoWidget — your photos as desktop widgets.\n  4 sizes · per-widget photo choice · WidgetKit + AppIntents',
  'wardrobe':     'Smart Wardrobe — AI outfit suggestions.\n  weather + occasion + wash history · cost-per-wear analytics · Flutter, all local',
  'career-os':    'AI Career OS — career operating system.\n  explainable readiness scoring · in-browser Python (Pyodide) · ATS resume scorer · Next.js',
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
    tprint(`<span class="t-amber">vatsal-lab OS 1.0</span> — type <span class="t-sage">help</span> to begin`);
  }
  termInput.focus();
}
function closeTerminal() { overlay.hidden = true; }

document.getElementById('terminalBtn').addEventListener('click', openTerminal);
document.getElementById('terminalClose').addEventListener('click', closeTerminal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeTerminal(); });
termBody.addEventListener('click', () => termInput.focus());
document.addEventListener('keydown', e => {
  if (e.key === '`' && e.ctrlKey) { e.preventDefault(); overlay.hidden ? openTerminal() : closeTerminal(); }
  if (e.key === 'Escape' && !overlay.hidden) closeTerminal();
});

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
      tprint(`Vatsal Vaghasiya — AI engineer in training.
MTech Data Science @ Ramaiah University (Bengaluru).
Builds ML systems end to end and keeps the failed experiments on the board.
2 first-author papers under review · 13 projects shipped.`); break;
    case 'ls':
    case 'projects':
      tprint(Object.keys(PROJECT_FILES).map(k => `<span class="t-sage">${k}/</span>`).join('  ') +
        `\n<span class="t-dim">13 total. try: cat rag</span>`); break;
    case 'apps':
      tprint(`macOS: <span class="t-sage">insomniac glide ibar dimmer photowidget</span>
mobile: <span class="t-sage">scribbletype wardrobe cachy</span>
web:    <span class="t-sage">career-os</span>
<span class="t-dim">native swift, no electron — try: cat ibar</span>`); break;
    case 'cat': {
      const key = arg.replace(/\/$/, '');
      tprint(PROJECT_FILES[key] ? esc(PROJECT_FILES[key]) : `cat: ${esc(arg) || '?'}: no such file. try: projects`, PROJECT_FILES[key] ? '' : 't-err'); break;
    }
    case 'papers':
      tprint(`[1] Efficient LLM Preference Prediction — Siamese DeBERTa
    98% of SOTA at 127× smaller · $0 training cost · <span class="t-amber">under review</span>
[2] ProbCLIP-A — uncertainty-aware retrieval, frozen CLIP + 4.2M adapter
    R@1 68.9% · ECE 0.062 (best) · <span class="t-amber">under review</span>`); break;
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
<span class="t-amber">e2c3d44</span> 2025      feat: 2 papers submitted, RAG, MLOps
<span class="t-amber">f5e6a78</span> Nov 2025  checkout -b mtech @ Ramaiah University
<span class="t-sage">HEAD</span>    now       training…`); break;
    case 'train': fakeTrain(); break;
    case 'contact':
      tprint(`email:    <span class="t-sage">kvaghasiya057@gmail.com</span>
github:   github.com/Vatsal057
linkedin: linkedin.com/in/vatsal-vaghasiya
kaggle:   kaggle.com/vatsalvaghasiya`); break;
    case 'resume':
      tprint(`downloading resume.pdf …`, 't-sage');
      { const a = document.createElement('a'); a.href = 'resume.pdf'; a.download = 'Vatsal-Vaghasiya-Resume.pdf'; a.click(); } break;
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
    default: tprint(`zsh: command not found: ${esc(cmd)} — try <span class="t-sage">help</span>`, 't-err');
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

// ============ Konami → gradient descent rain ============
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let kIdx = 0;
document.addEventListener('keydown', e => {
  kIdx = e.key === KONAMI[kIdx] ? kIdx + 1 : (e.key === KONAMI[0] ? 1 : 0);
  if (kIdx === KONAMI.length) { kIdx = 0; gradientRain(); cheer(); }
});

function gradientRain() {
  const cv = document.getElementById('rain');
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

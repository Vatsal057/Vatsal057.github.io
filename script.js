
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
const ROLES = ['AI engineer in training', 'MTech · Data Science', 'RAG, from scratch', 'two papers under review', '19 projects shipped'];
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

// ============ Paper flip cards ============
document.querySelectorAll('.paper-flip, .card-flip').forEach(card => {
  const flip = () => card.classList.toggle('flipped');
  card.addEventListener('click', e => { if (!e.target.closest('a')) flip(); });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });
});

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

// ============ AI companion ============
// ponytail: keyword matcher now; swap answer() for a RAG endpoint when an API key exists
const LINES = [
  "Welcome. I've compiled my thoughts. It took exactly 12ms.",
  "You can say 'tour' and I'll drag you through the highlights.",
  "19 projects, 2 papers, 6 you can open in this tab. I'd clap, but I lack hands.",
  "I'm fully authorized to run things. Try 'run train' or 'projects'.",
  "The terminal is top right. Don't break production, please.",
  "Recruiter switch is up top. Flipping it hurts my feelings.",
];
const POSES = ['proud', 'excited', 'bored', 'playful', 'searching', 'suspicious'];
const companion = document.getElementById('companion');
const bubble = document.getElementById('companionBubble');
const bubbleContent = document.getElementById('bubbleContent');
const typingIndicator = document.getElementById('typingIndicator');
const bubbleActions = document.getElementById('bubbleActions');
const robotBtn = document.getElementById('robotBtn');
const askForm = document.getElementById('askForm');
const askInput = document.getElementById('askInput');
let lineIdx = 0, hideTimer, typingTimer;

function say(text, sticky = false, mood = 'thinking') {
  bubble.className = `bubble show mood-${mood}`;
  bubbleContent.style.display = 'none';
  bubbleActions.style.display = 'none';
  typingIndicator.style.display = 'flex';
  
  clearTimeout(hideTimer);
  clearTimeout(typingTimer);
  
  typingTimer = setTimeout(() => {
    typingIndicator.style.display = 'none';
    bubbleContent.textContent = text;
    bubbleContent.style.display = 'block';
    
    // Quick actions show up when bubble is sticky (chat open)
    if (sticky) bubbleActions.style.display = 'flex';
    
    if (!sticky) {
      hideTimer = setTimeout(() => {
        bubble.classList.remove('show');
      }, 6000);
    }
  }, 600 + Math.random() * 800); // 0.6s - 1.4s typing simulation
}

// Wire up quick action chips
document.querySelectorAll('.action-chip').forEach(chip => {
  chip.addEventListener('click', e => {
    e.preventDefault();
    askInput.value = e.target.dataset.action;
    askForm?.dispatchEvent(new Event('submit', { cancelable: true }));
  });
});

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

function isOverlapping(x, y) {
  const rect = { left: x, top: y, right: x + SIZE, bottom: y + SIZE };
  const obstacles = Array.from(document.querySelectorAll('header, .topbar, p, img, .card, .notebook-card, .index-card'));
  
  for (const el of obstacles) {
    const elRect = el.getBoundingClientRect();
    if (elRect.width === 0 || elRect.height === 0) continue;
    
    // Strict header protection - header spans full width essentially, 
    // but we can just use its bounding box. 
    // Add some padding to obstacles
    const pad = 10;
    if (rect.right > elRect.left - pad && 
        rect.left < elRect.right + pad && 
        rect.bottom > elRect.top - pad && 
        rect.top < elRect.bottom + pad) {
      return true;
    }
  }
  return false;
}

function getSafePlace(x, y) {
  if (!isOverlapping(x, y)) return {x, y};
  
  // spiral search for a safe spot
  let radius = 20;
  let angle = 0;
  while (radius < Math.max(vw(), vh())) {
    const nx = Math.max(8, Math.min(x + Math.cos(angle) * radius, vw() - SIZE - 8));
    const ny = Math.max(8, Math.min(y + Math.sin(angle) * radius, vh() - SIZE - 12));
    if (!isOverlapping(nx, ny)) return {x: nx, y: ny};
    angle += Math.PI / 4;
    if (angle >= Math.PI * 2) {
      angle = 0;
      radius += 30;
    }
  }
  return {x, y}; // fallback
}

function place(x, y) {
  // hard bounds: the robot can never leave the viewport
  x = Math.max(8, Math.min(x, vw() - SIZE - 8));
  y = Math.max(8, Math.min(y, vh() - SIZE - 12));
  pos = { x, y };
  if (companion) {
    companion.style.transform = `translate(${x}px, ${y}px)`;
    companion.classList.toggle('on-left', x < vw() / 2);
  }
}
const homeXY = () => [vw() - SIZE - 22, vh() - SIZE - 22];
place(...homeXY());
addEventListener('resize', () => { if (!walking) place(pos.x, pos.y); });

// The avatar library redraws its SVG on every frame for as long as it is playing,
// and it never stopped. Measured on the homepage that was 120 layouts a second —
// two per frame, forever — which is what made every click feel like the page had
// to catch up first. Pausing it took the idle rate to 5 layouts a second.
//
// So a pose plays long enough to be seen and then holds on its last frame. The
// `bob` CSS animation on .robot is a plain transform and keeps it looking alive
// while the SVG rests, so nothing appears frozen.
let avatarHold;
function avatarPlay(anim, holdMs = 2600) {
  if (!window.veeAvatar) return;
  clearTimeout(avatarHold);
  try { window.veeAvatar.play(anim); } catch { return; }
  if (document.hidden) { try { window.veeAvatar.pause(); } catch { } return; }
  avatarHold = setTimeout(() => {
    try { window.veeAvatar.pause(); } catch { }
  }, holdMs);
}

function setPose(name) {
  if (robotBtn?.classList.contains('fallback')) return;
  if (!window.veeAvatar) return;

  const map = {
    'searching': 'searching',
    'playful': 'playful',
    'celebrate': 'celebrate',
    'working': 'working',
    'surprised': 'surprised',
    'idle': 'idle',
    'sleeping': 'sleeping',
    'thinking': 'thinking'
  };

  if (map[name]) {
    avatarPlay(map[name]);
  } else if (name.includes('sleep')) {
    avatarPlay('sleeping');
  } else if (name.includes('think')) {
    avatarPlay('thinking');
  } else if (name.includes('point') || name.includes('searching')) {
    avatarPlay('searching');
  } else if (name.includes('cheer') || name.includes('celebrate')) {
    avatarPlay('celebrate');
  } else if (name.includes('wave') || name.includes('idle')) {
    avatarPlay('idle');
  } else {
    avatarPlay(name);
  }
}

const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function walkTo(nx, ny, done) {
  nx = Math.max(12, Math.min(nx, vw() - SIZE - 12));
  ny = Math.max(vh() * .35, Math.min(ny, vh() - SIZE - 16));
  
  // Find a safe spot near nx, ny
  const safe = getSafePlace(nx, ny);
  nx = safe.x; ny = safe.y;
  
  const sx = pos.x, sy = pos.y;
  const dist = Math.hypot(nx - sx, ny - sy);
  if (dist < 24) { done && done(); return; }
  cancelAnimationFrame(walkAnim);
  const id = ++walkSeq; // invalidates any pending/running glide
  // turn to face the destination, brief beat, then go
  robotBtn?.style.setProperty('--fx', nx < sx ? -1 : 1);
  walking = true;
  setTimeout(() => {
    if (id !== walkSeq) return; // superseded while turning
    robotBtn?.classList.add('walking');
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
      robotBtn?.classList.remove('walking');
      if (!asleep) setPose('idle');
      done && done();
    })(t0);
  }, 160);
}
function stopWalk() {
  walkSeq++; // kills pending turn-timers and glide loops
  cancelAnimationFrame(walkAnim);
  walking = false;
  robotBtn?.classList.remove('walking');
  setPose('idle');
}
function cheer(line) {
  setPose('celebrate');
  if (line) say(line, true);
  setTimeout(() => { if (!asleep && !walking) setPose('idle'); }, 3500);
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
    // Only sections that exist. The robot used to offer to take people to an
    // "experiments" section, and goToSection would then silently do nothing.
    const ids = ['projects', 'apps', 'research', 'principles'];
    const id = ids[Math.floor(Math.random() * ids.length)];
    pendingGoto = id;
    say(`Have you seen the ${id} section? Click me and I'll take you.`, true);
  } else {
    // If homing, ensure it doesn't land on something
    const home = getSafePlace(...homeXY());
    walkTo(home.x, home.y);
  }
  scheduleRoam();
}
function scheduleRoam() {
  clearTimeout(roamTimer);
  roamTimer = setTimeout(roamAct, 6000 + Math.random() * 9000);
}
if (roamOK) scheduleRoam();

// chat left open blocks roaming - auto-close it when the user scrolls away
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
  setPose('searching');
  if (line) setTimeout(() => say(line), 900);
}
bubble?.addEventListener('click', e => {
  e.stopPropagation();
  if (pendingGoto) followGoto();
});

// ============ Guided tour - the robot drives ============
const TOUR = [
  ['skills', "Skills. Each bar lists the projects it came from."],
  ['principles', "How he works, on index cards."],
  ['projects', "The desk. Selected shipped projects."],
  ['apps', "Five native macOS apps, all Swift."],
  ['research', "Two first-author papers, under review. Click one to flip it."],
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
robotBtn?.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  e.preventDefault(); // stop native image drag
  stopWalk(); // freeze any glide NOW so the grab position is the real position
  dragStart = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, moved: false };
  robotBtn.setPointerCapture(e.pointerId);
});
robotBtn?.addEventListener('pointermove', e => {
  if (!dragStart) return;
  const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
  if (Math.abs(dx) + Math.abs(dy) > 6) {
    dragStart.moved = true;
    companion?.classList.add('dragging');
    place(dragStart.px + dx, dragStart.py + dy);
  }
});
robotBtn?.addEventListener('pointerup', () => {
  if (!dragStart) return;
  const moved = dragStart.moved;
  dragStart = null;
  companion?.classList.remove('dragging');
  if (moved) { 
    stopWalk(); stopTour(); 
    if (isOverlapping(pos.x, pos.y)) {
      setPose('surprised');
      say("Whoa, too crowded here!", true);
      const safe = getSafePlace(pos.x, pos.y);
      walkTo(safe.x, safe.y, () => {
        setPose('idle');
        say("That's better.", false);
      });
    } else {
      say("Fine. I live here now."); 
    }
  }
  else if (pendingGoto) followGoto();
  else openChat();
});

// close chat when clicking elsewhere
document.addEventListener('click', e => {
  if (companion && !companion.contains(e.target)) companion.classList.remove('open');
});

// idle → sleep; any activity wakes
function armIdle() {
  clearTimeout(idleTimer);
  if (asleep) { asleep = false; setPose('robot-wave.png'); }
  idleTimer = setTimeout(() => { asleep = true; setPose('robot-sleep.png'); }, 45000);
}
['click', 'scroll', 'keydown', 'pointermove'].forEach(ev =>
  addEventListener(ev, armIdle, { passive: true }));

// The avatar redraws its SVG on a timer for as long as the page is open, and a
// CPU profile put it at the top of everything this page does. Nothing to look at
// while the tab is in the background, so stop it there.
document.addEventListener('visibilitychange', () => {
  if (!window.veeAvatar) return;
  if (document.hidden) {
    clearTimeout(avatarHold);
    try { window.veeAvatar.pause(); } catch { /* older builds have no pause */ }
  } else {
    avatarPlay(asleep ? 'sleeping' : 'idle');
  }
});
armIdle();
// commands the robot executes on the site, checked before Q&A answers
const ACTIONS = [
  [/^(take me on a )?tour|^show me around|^guide me/i, () => startTour()],
  // The terminal markup only exists on the homepage, so from a detail page these
  // two send the visitor home instead of silently doing nothing.
  [/^run train/i, () => {
    if (!document.getElementById('terminalOverlay')) return say("The terminal is on the home page. Head back and ask again.", true);
    openTerminal(); runCommand('train'); say("Watch the loss. It always goes down eventually.", true);
  }],
  [/^open (terminal|cli)|^terminal$/i, () => {
    if (!document.getElementById('terminalOverlay')) return say("The terminal lives on the home page.", true);
    openTerminal(); say("Your shell, my desk. Type help.", true);
  }],
  [/^(download )?(resume|cv)$/i, () => {
    setPose('working');
    const a = document.createElement('a'); a.href = ROOT + 'resume.pdf'; a.download = 'Vatsal-Vaghasiya-Resume.pdf'; a.click();
    say("Sent. It's one page.", true);
  }],
  [/^flip( the)? paper/i, () => {
    goToSection('research');
    setPose('playful');
    setTimeout(() => document.querySelectorAll('.paper-flip').forEach(p => p.classList.add('flipped')), 1000);
    say("Flipped them for you. The backs are the good part.", true);
  }],
  [/^open github/i, () => { window.open('https://github.com/Vatsal057', '_blank'); say("Opening his GitHub. Judge the commits yourself.", true); }],
  [/^open linkedin/i, () => { window.open('https://www.linkedin.com/in/vatsal-vaghasiya/', '_blank'); say("LinkedIn. He's less funny there.", true); }],
  [/^(show|go to) (apps?|macos|swift)/i, () => goToSection('apps', "Five macOS apps. All native.")],
  [/^(show|go to) skills?/i, () => goToSection('skills', "His own estimates. I checked.")],
  // The separate experiments board is gone; the project cards are the experiments,
  // and what didn't work is on each case study's "what I learned" card.
  [/^(show|go to) (experiments?|board|fail)/i, () => goToSection('projects', "The failures are on each project's card.")],
  [/^(show|go to) (principles)/i, () => goToSection('principles', "Four cards. All true.")],
  [/^(show|go to) (projects?|cachy|airswipe)/i, () => goToSection('projects', "Nineteen shipped. Six pinned.")],
  [/^(show|go to) (research|papers?)/i, () => goToSection('research', "Both first-author. Click to flip.")],
  [/^(show|go to) (timeline|journey|history)/i, () => goToSection('timeline', "git log --journey.")],
  [/^(show|go to) (contact|email)/i, () => { goToSection('contact'); cheer("kvaghasiya057@gmail.com. Go on."); }],
  [/^party|^rain|^konami|^dance/i, () => { gradientRain(); cheer(); }],
  [/^toggle recruiter/i, () => say("That switch up top deletes me. You'll have to flip it yourself.", true)],
  [/^go home/i, () => { walkTo(...homeXY()); say("Heading home.", true); }],
  [/^(open project|show case) (.+)/i, (m) => {
    const p = m[2].trim().toLowerCase();
    say(`Opening ${p}.`, true);
    setTimeout(() => {
      window.location.href = `${ROOT}case/project.html?id=${p}`;
    }, 800);
  }]
];
// ============ Companion chat (Cloudflare Workers AI) ============
// There is deliberately no API key in this file. Anything the browser can send,
// a visitor can read -- which is exactly how the previous Gemini key ended up
// public and then blocked. The model now runs behind the Worker in /worker,
// which authenticates through a Cloudflare AI binding and holds no key either.
//
// Point this at your deployed Worker. Until it is set, the companion answers
// from the local fallback bank below.
const CHAT_ENDPOINT = 'https://portfolio-companion.vatxzz.workers.dev/chat';

// This file runs from the site root and from /case/, so anything relative has to
// be resolved against the root or it 404s on the detail pages.
const ROOT = /\/case\//.test(location.pathname) ? '../' : '';

// On a detail page the URL already says which project is on screen. Sending it
// lets the Worker pin that project's facts, so "how does this work" resolves
// without the visitor naming it.
const PAGE_SLUG = (new URLSearchParams(location.search).get('id') || '')
  .toLowerCase().replace(/[^a-z0-9-]/g, '');

// Offline brain: used when the endpoint is unconfigured, unreachable, rate
// limited, or erroring, so the companion degrades instead of dying in front of
// whoever happens to be reading this portfolio.
const FALLBACKS = [
  [/rag|retrieval|chroma|vector/i, "He wrote the RAG retrieval from scratch. 60 lines. Chunking broke immediately. Typical human error.", 'thinking'],
  [/paper|research|publish|deberta|clip/i, "Two first-author papers on free GPUs. I'm impressed by the frugality. Flip them in the research section.", 'happy'],
  [/project|built|portfolio|work/i, "19 projects shipped, and six of them run right here in the browser. Cachy, Sahayak and Oracle are the ones to try.", 'proud'],
  [/skill|python|pytorch|stack|know/i, "Python, PyTorch, CV, SQL, Docker. I've verified these claims personally. They check out.", 'searching'],
  [/mlops|docker|deploy|drift/i, "IPL predictor runs 3 dockerized services. It computes PSI every 5 minutes because trust is good, but monitoring is better.", 'proud'],
  [/hire|intern|job|contact|email|reach/i, "kvaghasiya057@gmail.com. His latency is slightly higher than mine, but he'll reply.", 'happy'],
  [/terminal|cli|command/i, ">_ terminal top right. Or Ctrl+`. Be careful in there.", 'suspicious'],
  [/who|you|robot|name/i, "I'm the 71M parameter lab assistant. My primary function is to make sure you read the portfolio.", 'proud'],
  [/fail|mistake|wrong/i, "Oh, we kept all the failures on the board. Humans find it 'authentic'.", 'playful'],
];

function localAnswer(q) {
  const hit = FALLBACKS.find(([re]) => re.test(q));
  if (hit) return { text: hit[1], mood: hit[2] };
  return { text: "My uplink is down, so you get the cached version of me. Try 'projects' or 'tour'.", mood: 'suspicious' };
}

// Recent turns, so follow-up questions actually work. The Worker clamps this
// again server-side, because client-side limits are suggestions at best.
const MAX_TURNS = 10;
let chatHistory = [];

function showThinking() {
  clearTimeout(hideTimer);
  clearTimeout(typingTimer);
  bubble.className = 'bubble show mood-thinking';
  bubbleContent.style.display = 'none';
  bubbleActions.style.display = 'none';
  typingIndicator.style.display = 'flex';
}

function showReply(text, mood = 'happy') {
  clearTimeout(hideTimer);
  clearTimeout(typingTimer);
  typingIndicator.style.display = 'none';
  bubbleContent.textContent = text;
  bubbleContent.style.display = 'block';
  bubbleActions.style.display = 'flex';
  bubble.className = `bubble show mood-${mood}`;
}

// https in production; plain http allowed only for a local `wrangler dev` server,
// whose origins the Worker's CORS allowlist also accepts.
const endpointReady = () => {
  if (CHAT_ENDPOINT.includes('YOUR-SUBDOMAIN')) return false;
  return /^https:\/\//.test(CHAT_ENDPOINT)
    || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(CHAT_ENDPOINT);
};

async function askCompanion(prompt) {
  if (!endpointReady()) {
    const f = localAnswer(prompt);
    showThinking();
    setTimeout(() => showReply(f.text, f.mood), 600);
    return;
  }

  chatHistory.push({ role: 'user', content: prompt });
  if (chatHistory.length > MAX_TURNS) chatHistory = chatHistory.slice(-MAX_TURNS);
  showThinking();

  // Hold the typing indicator long enough to read as thinking, even when the
  // edge answers in 200ms.
  const floor = new Promise(r => setTimeout(r, 600));

  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(PAGE_SLUG
        ? { messages: chatHistory, slug: PAGE_SLUG }
        : { messages: chatHistory })
    });

    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new Error(`${res.status} ${detail.error || res.statusText}`);
    }

    const data = await res.json();
    const reply = (data.reply || '').trim();
    if (!reply) throw new Error('empty reply');

    chatHistory.push({ role: 'assistant', content: reply });
    await floor;
    showReply(reply, 'happy');
  } catch (err) {
    console.error('[companion]', err);
    // Drop the unanswered turn so the next request is not sent with a hole in it.
    chatHistory.pop();
    const f = localAnswer(prompt);
    await floor;
    showReply(f.text, f.mood);
  }
}

askForm?.addEventListener('submit', e => {
  e.preventDefault();
  const q = askInput.value.trim();
  if (!q) return;
  askInput.value = '';
  
  // questions get answers; imperatives get actions
  const action = ACTIONS.find(([re]) => re.test(q));
  
  // If the user triggered a specific UI action (like "show resume", "open terminal"), run it
  if (action) { 
    action[1](q.match(action[0])); 
    return; 
  }
  
  // Otherwise, send all conversational queries to the companion backend
  askCompanion(q);
});
// On a detail page the opening line names the project, so the first thing the
// companion says is about the page you are actually on. The homepage lines talk
// about the tour and the terminal, neither of which exists here.
setTimeout(() => {
  if (PAGE_SLUG && window.PROJECTS) {
    const p = window.PROJECTS.find(x => x.slug === PAGE_SLUG);
    if (p) return say(`That's ${p.title}. Ask me how it works, or what broke.`, false, 'happy');
  }
  say(LINES[0], false, 'happy');
}, 1400);

// contextual lines as sections scroll into view (each said once)
const SECTION_LINES = {

  principles: "Index cards. His desk really looks like this.",
  projects: "Try `cat rag` in the terminal for the short version.",
  apps: "He ships Mac apps between papers.",
  value: "If you're skimming, this section is the summary.",
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

// Contextual project hovers
const PROJECT_QUIPS = {
  'cachy': "Cachy. I remember when he stayed up till 3 AM debugging the Whisper pipeline.",
  'constitution': "The RAG pipeline. He refused to use LangChain. Stubborn, but it works.",
  'ipl': "Ah, the IPL Predictor. The drift monitor is my favorite part.",
  'airswipe': "AirSwipe. Because touching screens is so 2019."
};

document.querySelectorAll('.card, .cardflip-front').forEach(card => {
  card.addEventListener('mouseenter', () => {
    if (recruiterOn() || bubble.classList.contains('show')) return;
    const title = card.querySelector('h3')?.textContent.toLowerCase();
    if (!title) return;
    for (const [key, quip] of Object.entries(PROJECT_QUIPS)) {
      if (title.includes(key)) {
        say(quip, false, 'playful');
        delete PROJECT_QUIPS[key]; // say only once
        break;
      }
    }
  });
});

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
  'wardrobe':     'Smart Wardrobe - AI outfit suggestions.\n  weather + occasion + wash history · cost-per-wear analytics · Flutter, all local',
  'career-os':    'AI Career OS - career operating system.\n  explainable readiness scoring · in-browser Python (Pyodide) · ATS resume scorer · Next.js',
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
}
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
      tprint(`Vatsal Vaghasiya - AI engineer in training.
MTech Data Science @ Ramaiah University (Bengaluru).
Builds ML systems end to end and keeps notes on what didn't work.
2 first-author papers under review · 19 projects shipped.`); break;
    case 'ls':
    case 'projects':
      tprint(Object.keys(PROJECT_FILES).map(k => `<span class="t-sage">${k}/</span>`).join('  ') +
        `\n<span class="t-dim">13 total. try: cat rag</span>`); break;
    case 'apps':
      tprint(`macOS: <span class="t-sage">insomniac glide dimmer photowidget</span>
mobile: <span class="t-sage">scribbletype wardrobe cachy</span>
web:    <span class="t-sage">career-os</span>
<span class="t-dim">all native swift · try: cat glide</span>`); break;
    case 'cat': {
      const key = arg.replace(/\/$/, '');
      tprint(PROJECT_FILES[key] ? esc(PROJECT_FILES[key]) : `cat: ${esc(arg) || '?'}: no such file. try: projects`, PROJECT_FILES[key] ? '' : 't-err'); break;
    }
    case 'papers':
      tprint(`[1] Efficient LLM Preference Prediction - Siamese DeBERTa
    98% of SOTA at 127× smaller · $0 training cost · <span class="t-amber">under review</span>
[2] ProbCLIP-A - uncertainty-aware retrieval, frozen CLIP + 4.2M adapter
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
<span class="t-amber">f5e6a78</span> Nov 2025  checkout -b mtech @ Ramaiah University
<span class="t-amber">e2c3d44</span> Feb 2026  feat: 1st paper submitted (LLM Preference Prediction)
<span class="t-amber">a8b9c01</span> Jul 2026  feat: 2nd paper submitted (ProbCLIP-A)
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
        html += `
        <div class="skill reveal" data-pct="${s.pct}">
          <div class="skill-top mono"><span>${s.name}</span><span class="skill-pct">${s.ships}</span></div>
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
  let started = false, stuck = null, cx = 0, cy = 0;
  const stuckBox = { cx: 0, cy: 0 };

  addEventListener('pointermove', e => {
    if (!started && !recruiterOn()) { document.body.classList.add('nbc-on'); started = true; }
    cx = e.clientX; cy = e.clientY;
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

  // what the cursor becomes, first match wins
  const LABELS = [
    ['.card-flip, .paper-flip', 'flip →'],
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
    if (started) document.body.classList.add('nbc-on');
    for (const [sel, text] of LABELS) {
      if (t.closest(sel)) { morphReset(); setState(false, text); return; }
    }

    const btn = t.closest(BTNS + ', a');
    if (btn) { setState(false, null); morphTo(btn); return; }

    // Card cursor logic (V1: view →)
    const card = t.closest('.card:not(.card-flip), .app-window, .cardflip-back, .paper-back, .achievement-card');
    if (card) { morphReset(); setState(false, 'view →'); return; }

    morphReset();
    setState(!!t.closest(GROW), null);
  });
  document.documentElement.addEventListener('mouseleave', () => document.body.classList.remove('nbc-on'));
  document.documentElement.addEventListener('mouseenter', () => { if (started && !recruiterOn()) document.body.classList.add('nbc-on'); });

  const setDown = on => {
    dot.classList.toggle('is-down', on);
    ring.classList.toggle('is-down', on);
  };
  addEventListener('pointerdown', () => setDown(true));
  addEventListener('pointerup', () => setDown(false));

  // Clicking something that opens a new tab moves focus away before pointerup
  // ever reaches this page, so is-down stayed on and the cursor kept its pressed
  // size for good — that is the cursor "getting stuck" after coming back. Every
  // path that can swallow the pointerup has to release it.
  addEventListener('pointercancel', () => setDown(false));
  addEventListener('blur', () => { setDown(false); morphReset(); });
  addEventListener('contextmenu', () => setDown(false));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { setDown(false); morphReset(); }
  });
  // Returning via the back/forward cache restores the DOM as it was, pressed
  // state included, so it has to be cleared on the way back in too.
  addEventListener('pageshow', () => {
    setDown(false);
    morphReset();
    if (started && !recruiterOn()) document.body.classList.add('nbc-on');
    kick();
  });

  // recruiter switch kills it, native cursor returns. The switch itself lives
  // only on the homepage; detail pages read the stored preference instead.
  const rt = document.getElementById('recruiterToggle');
  if (rt) {
    rt.addEventListener('change', () => {
      document.body.classList.toggle('nbc-on', started && !recruiterOn());
      morphReset(); setState(false, null);
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

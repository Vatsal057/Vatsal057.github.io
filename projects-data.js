/* ============================================================
   projects-data.js — single source of truth for every project.
   Cards in index.html and detail pages (projects/project.html?id=slug)
   both read from window.PROJECTS. Add a project = add one entry here.
   ============================================================ */
window.PROJECTS = [

  /* ---------- AI / ML projects ---------- */
  {
    slug: "cachy",
    title: "Cachy",
    kind: "project",
    status: "shipped",
    tag: "knowledge engine · flutter + fastapi",
    oneLiner: "Turns Reels, Shorts and articles into structured knowledge cards, linked in a semantic graph.",
    problem: "Short-form media is where a lot of learning now happens, but it evaporates the moment you scroll past. I wanted the useful 20 seconds of a Reel captured as something I could search, revisit and connect — not re-watch.",
    how: ["ingest", "transcribe / OCR", "LLM chain", "cards", "graph"],
    highlights: [
      "LLM chain with automatic fallback across Gemini 2.5 Flash → Cerebras → Groq → paragraph fallback, because free APIs kept dropping mid-request.",
      "Transcription via Groq Whisper with a local faster-whisper fallback; keyframe OCR via Tesseract.",
      "Semantic knowledge graph: semantic + reference + tag edges, label-propagation clustering, client-side force-directed layout.",
      "No external infra — single SQLite DB, in-process asyncio worker (no Redis/Celery), deploys to one free HF Space.",
      "Reel-style Feed replay, per-card and library-wide chat, semantic search, Present mode."
    ],
    learned: "A three-provider fallback chain shipped faster and broke less than waiting for one reliable paid API.",
    stack: ["Whisper", "OpenCV", "Tesseract", "SQLite", "FastAPI", "Flutter", "HF Spaces"],
    links: { github: "https://github.com/Vatsal057/Cachy" }
  },
  {
    slug: "constitution-rag",
    title: "Constitution of India · RAG Q&A",
    kind: "project",
    status: "shipped",
    tag: "rag from scratch · no langchain",
    oneLiner: "Ask the Indian Constitution anything; get grounded answers with exact citations and similarity scores.",
    problem: "I wanted to actually understand retrieval, not import it. So I wrote the whole RAG loop by hand and picked a document where a wrong-but-confident answer would be obviously wrong: the Constitution.",
    how: ["pdf", "chunk", "embed", "retrieve", "cite"],
    highlights: [
      "Retrieval and prompt logic written directly in ~60 lines — no LangChain.",
      "query → all-MiniLM-L6-v2 embedding → ChromaDB cosine top-5 → context prompt → Mistral-7B → answer + citations.",
      "Streamlit chat UI with a source panel showing retrieved chunks, page numbers and similarity scores.",
      "Ships with FAILURES.md: a 20-query stress test. First-pass accuracy 65%, ~78% after fixing chunking."
    ],
    learned: "Chunking broke everything first. The retriever was fine; the boundaries between chunks were the bug.",
    stack: ["sentence-transformers", "ChromaDB", "Mistral-7B", "pypdf", "Streamlit"],
    links: { github: "https://github.com/Vatsal057/samvidhan" }
  },
  {
    slug: "ipl-mlops",
    title: "IPL Match Predictor · MLOps",
    kind: "project",
    status: "shipped",
    tag: "full ml lifecycle · self-monitoring",
    oneLiner: "An XGBoost match-outcome model that serves itself, watches itself for drift, and says when it needs retraining.",
    problem: "A model in a notebook isn't a system. I wanted the whole lifecycle — train, serve, monitor — running as separate services the way it would in production, not a single script.",
    how: ["data", "features", "train", "serve", "monitor"],
    highlights: [
      "Three Docker Compose services sharing a /data volume: a FastAPI prediction API, a PSI drift monitor, and a Streamlit dashboard.",
      "Drift detection via Population Stability Index between training and recent prediction distributions, computed every 5 minutes and surfaced live.",
      "Endpoints: /predict, /result, /stats, /drift, /health.",
      "Chose XGBoost over an MLP for a small, mostly-categorical 9-feature set — same accuracy, faster, interpretable importances."
    ],
    learned: "Self-monitoring is cheap to add and changes how much you trust the thing. A number that goes stale silently is worse than no number.",
    stack: ["XGBoost", "FastAPI", "SQLite", "Streamlit", "Docker Compose"],
    links: { github: "https://github.com/Vatsal057/ipl-mlops" }
  },
  {
    slug: "airswipe",
    title: "AirSwipe",
    kind: "project",
    status: "shipped",
    tag: "computer vision · gesture control",
    oneLiner: "Control PowerPoint with bare hands through a webcam — swipe, point, pinch. No remote, no keyboard.",
    problem: "Presenting means either pacing near the laptop or fumbling a clicker. I wanted to drive slides from anywhere in the room with gestures that don't false-trigger while I'm just talking with my hands.",
    how: ["webcam", "landmarks", "gesture", "action"],
    highlights: [
      "Gestures: dwell-based start/stop, swipe next/previous, proportional pinch-zoom, auto-calibrating laser pointer, blank screen, jump to first slide.",
      "Finger detection uses distance ratios, so it's orientation-independent.",
      "A deliberate dead zone separates laser from zoom; swipe arming/return windows stop accidental triggers.",
      "core/ (controller, MediaPipe detector, gesture state machines) + ui/ (PyQt6 + OpenCV overlay), fully tunable via config.json."
    ],
    learned: "Most of the work in a gesture controller isn't recognising gestures — it's refusing to recognise the ones you didn't mean.",
    stack: ["MediaPipe", "OpenCV", "PyQt6"],
    links: { github: "https://github.com/Vatsal057/AirSwipe" }
  },
  {
    slug: "bangalore-aqi",
    title: "Bangalore Air Quality",
    kind: "project",
    status: "shipped",
    tag: "data mining · unsupervised",
    oneLiner: "A year of data from 14 CPCB stations, clustered to find the pollution hotspots a city-wide average hides.",
    problem: "A single city AQI number hides everything interesting. A traffic junction and a leafy suburb get averaged into a meaningless middle. I wanted to surface the local variance.",
    how: ["excel mess", "clean", "features", "cluster", "hotspots"],
    highlights: [
      "Manual ETL from the CPCB CAAQMS portal: non-standard 'wide' Excel files reshaped into long-format time series.",
      "6 engineered features, three clustering algorithms compared.",
      "DBSCAN won — it flags outliers, and the outliers were the hotspots. Silk Board hit AQI 500.",
      "Ships as a standalone notebook with processed datasets, cluster assignments, report and presentation."
    ],
    learned: "DBSCAN beat K-Means here precisely because it doesn't force every point into a cluster — the points it refused to place were the answer.",
    stack: ["pandas", "scikit-learn", "DBSCAN", "Jupyter"],
    links: { github: "https://github.com/Vatsal057/AirQuality" }
  },
  {
    slug: "indian-food-search",
    title: "Indian Food Multimodal Search",
    kind: "project",
    status: "shipped",
    tag: "clip · text + image retrieval",
    oneLiner: "Find any Indian dish by describing it in plain English — or by uploading a photo of something similar.",
    problem: "Every CLIP demo uses the same Flickr8k stock photos. I wanted to see whether the approach held on something domain-specific and culturally relevant, so I pointed it at Indian food.",
    how: ["encode dishes", "index", "text/image query", "rank", "explain"],
    highlights: [
      "Text → Image: type what you're craving, get ranked results ('crispy golden dosa' reliably surfaces dosas).",
      "Image → Image: upload any food photo, find visually similar dishes.",
      "Category browser and a 'Surprise Me' random discovery mode.",
      "A category-breakdown bar chart per search — added after noticing queries matched across dish families; it made retrieval interpretable."
    ],
    learned: "The interpretability chart wasn't planned. It came from being confused by my own results, and it's now the most useful part.",
    stack: ["CLIP", "Python", "Gradio", "HF Spaces"],
    links: { github: "https://github.com/Vatsal057/indian-food-search" }
  },
  {
    slug: "plant-disease",
    title: "Plant Disease Detector",
    kind: "project",
    status: "shipped",
    tag: "cnn · grad-cam explainability",
    oneLiner: "Upload a leaf photo, get an instant diagnosis — with a Grad-CAM heatmap showing exactly what the model looked at.",
    problem: "Most plant-disease demos give a prediction and a confidence score and stop. You never learn whether the model looked at the lesion or at the soil in the background. I wanted the model to show its work.",
    how: ["leaf image", "classify", "grad-cam", "severity", "explain"],
    highlights: [
      "Classifies across 15 classes: 5 crops × (healthy + common diseases).",
      "Grad-CAM overlay highlights the regions that drove the prediction — uniform spread on healthy leaves, concentrated on the lesion when diseased.",
      "Reports severity (none / low / medium / high) with a plain-English description.",
      "Top-5 probability breakdown chart per image."
    ],
    learned: "Confidence scores lie by omission. A heatmap is a much harder thing for a model to fake trustworthiness with.",
    stack: ["PyTorch", "Grad-CAM", "Gradio", "HF Spaces"],
    links: { github: "https://github.com/Vatsal057/plant-disease-detector" }
  },
  {
    slug: "scribbletype",
    title: "ScribbleType",
    kind: "project",
    status: "shipped",
    tag: "on-device ml · accessibility",
    oneLiner: "A handwriting-to-text Android keyboard for seniors: write with a finger, get typed text — all on device.",
    problem: "Tiny on-screen keys and autocorrect fight older users. Handwriting is the input they already trust. I wanted a keyboard that reads their handwriting locally, no cloud, and adapts to how they write.",
    how: ["strokes", "smooth", "recognize", "learn"],
    highlights: [
      "On-device ink recognition via ML Kit — nothing leaves the phone.",
      "A personal dictionary that learns the user's writing over time.",
      "Catmull-Rom smoothing filters hand tremor before recognition.",
      "Ships as a real Kotlin IME, not a demo app."
    ],
    stack: ["ML Kit", "Flutter", "Kotlin IME"],
    links: { github: "https://github.com/Vatsal057/Scribbleeeee" }
  },
  /* ---------- Native apps ---------- */
  {
    slug: "insomniac",
    title: "Insomniac.app",
    kind: "app",
    status: "shipped",
    platform: "macOS",
    tag: "macOS · menu bar utility",
    oneLiner: "Keeps a Mac awake, lid closed included, with smart triggers so you rarely have to think about it.",
    problem: "The built-in Keep Awake options are all-or-nothing and forget the lid. I wanted something that turns itself on for the right apps, networks and workloads and gets out of the way otherwise.",
    highlights: [
      "Keeps the Mac awake with the lid closed.",
      "Timed durations and a global shortcut.",
      "Smart triggers: auto-enable on chosen apps, Wi-Fi networks, high CPU, or active downloads.",
      "Scriptable via an insomniac:// URL scheme."
    ],
    stack: ["Swift 5.9", "AppKit", "IOKit", "NWPathMonitor"],
    links: { github: "https://github.com/Vatsal057/Insomniac" }
  },
  {
    slug: "glide",
    title: "Glide.app",
    kind: "app",
    status: "shipped",
    platform: "macOS",
    tag: "macOS · trackpad gestures",
    oneLiner: "Custom 3/4/5-finger trackpad gestures for window snapping, media control and launching apps.",
    problem: "macOS gives you a handful of fixed trackpad gestures and no way to add your own. I use the trackpad constantly, so I built the customizer I wanted.",
    highlights: [
      "Custom 3/4/5-finger gestures mapped to window snapping, media control and app launching.",
      "Speed-aware: a slow swipe switches windows, a fast flick opens the browser.",
      "Reciprocal undo, haptic feedback, per-app filters.",
      "Reads raw multitouch data directly via IOKit."
    ],
    stack: ["Swift", "AppKit", "IOKit multitouch"],
    links: { github: "https://github.com/Vatsal057/Glide" }
  },
  {
    slug: "ibar",
    title: "iBar.app",
    kind: "app",
    status: "shipped",
    platform: "macOS",
    tag: "macOS · menu bar theming",
    oneLiner: "Themes the macOS menu bar — something Apple gives you no public API for.",
    problem: "You can theme almost everything on a Mac except the menu bar. There's no API for it. So I did it the hard way, with a click-through overlay window at the menu bar's own level.",
    highlights: [
      "Click-through overlay at the menu bar's window level — gradients and blur.",
      "Auto-presets that respond to window state; notch-aware.",
      "Reads menu titles via the Accessibility API to keep them legible against any background.",
      "Solves a problem the OS actively doesn't want solved."
    ],
    learned: "Half of the effort was legibility — a themed bar is useless if you can't read the menu titles on top of it.",
    stack: ["Swift", "SwiftUI", "Accessibility API", "CGWindowList"],
    links: { github: "https://github.com/Vatsal057/iBar" }
  },
  {
    slug: "dimmer",
    title: "Dimmer.app",
    kind: "app",
    status: "shipped",
    platform: "macOS",
    tag: "macOS · display dimming",
    oneLiner: "Dims displays below the hardware minimum using overlay windows, each monitor independently.",
    problem: "At night even the lowest hardware brightness is too bright, especially on external monitors that don't dim as far. An overlay fixes it per-display.",
    highlights: [
      "Dims each connected monitor independently via overlay windows.",
      "Goes below the hardware minimum brightness.",
      "Lives in the menu bar, does one thing well."
    ],
    stack: ["Swift", "SwiftUI", "AppKit"],
    links: { github: "https://github.com/Vatsal057/Dimmer" }
  },
  {
    slug: "photowidget",
    title: "PhotoWidget.app",
    kind: "app",
    status: "shipped",
    platform: "macOS",
    tag: "macOS · desktop widgets",
    oneLiner: "Your own photos as desktop widgets, in four sizes and full colour.",
    problem: "macOS desktop widgets are mostly system data. I wanted my own photos up there, in colour, without the monochrome tint the widget system likes to apply.",
    highlights: [
      "Personal photos as desktop widgets in four sizes.",
      "Per-widget photo choice.",
      "Full colour even in monochrome widget mode."
    ],
    stack: ["Swift", "WidgetKit", "AppIntents"],
    links: { github: "https://github.com/Vatsal057/PhotoWidget" }
  },
  {
    slug: "smart-wardrobe",
    title: "Smart Wardrobe",
    kind: "app",
    status: "shipped",
    platform: "Flutter",
    tag: "flutter · on-device, no account",
    oneLiner: "Photograph your clothes once; the app plans what you wear.",
    problem: "Deciding what to wear is a small daily tax, and 'what do I even own' is worse when half of it is in the wash. I wanted a closet that plans outfits from clothes I actually have, against the actual weather.",
    highlights: [
      "Outfit suggestions by occasion, from clothes you own.",
      "A 'Today' screen that checks live weather and recent wear history first.",
      "Wash tracking and packing lists built against the forecast.",
      "Fully on-device, no account."
    ],
    stack: ["Flutter", "SQLite", "on-device"],
    links: { github: "https://github.com/Vatsal057/Smart-Wardrobe" }
  },
  /* ---------- Developer tools & extensions ---------- */
  {
    slug: "chrome-to-safari",
    title: "chrome-to-safari",
    kind: "tool",
    status: "shipped",
    platform: "macOS",
    tag: "dev tool · extension signing",
    oneLiner: "Turn any Chrome extension into a working, signed Safari extension — no paid Apple Developer ID.",
    problem: "Safari can run Chrome extensions, but unsigned ones get disabled every time Safari restarts, so you're forever re-ticking 'Allow unsigned extensions'. Signing with a free Apple ID fixes it permanently — the tooling to do that just didn't exist in one drag-and-drop step.",
    highlights: [
      "Drag an unpacked extension folder (or paste a Chrome Web Store link) → get a signed Safari extension.",
      "Signs with a free Apple Development certificate — no $99/year membership.",
      "Once enabled in Safari, it stays enabled across restarts.",
      "Ships with a small drop-target UI (./chrome-to-safari.sh --ui)."
    ],
    stack: ["Shell", "Xcode toolchain", "WebExtensions"],
    links: { github: "https://github.com/Vatsal057/chrome-to-safari" }
  },
  {
    slug: "mac-app-signer",
    title: "mac-app-signer",
    kind: "tool",
    status: "shipped",
    platform: "macOS",
    tag: "dev tool · code signing",
    oneLiner: "Sign any macOS .app bundle locally with a free Apple certificate — no paid Developer ID required.",
    problem: "Build an app from source and Gatekeeper nags you; Safari disables unsigned extensions on every restart. Apple's free developer tier already includes a certificate that fixes both — this just wraps it in one command.",
    highlights: [
      "Re-signs any .app so macOS treats it as properly signed on your machine.",
      "Keeps development-signed Safari extensions enabled permanently.",
      "Removes Gatekeeper friction on locally-built apps.",
      "Uses the free Apple Development certificate — no $99/year."
    ],
    stack: ["Shell", "codesign", "Xcode CLT"],
    links: { github: "https://github.com/Vatsal057/mac-app-signer" }
  },
  {
    slug: "hidebars",
    title: "HideBars",
    kind: "tool",
    status: "shipped",
    platform: "Obsidian",
    tag: "obsidian plugin · focus",
    oneLiner: "An Obsidian plugin that auto-hides both sidebars until you hover the window edge.",
    problem: "In fullscreen or a narrow window, Obsidian's sidebars eat the width I want for notes. I wanted them gone until I reach for them, then back on demand — without losing my layout when I exit fullscreen.",
    highlights: [
      "Auto-collapses both sidebars in fullscreen or below a width threshold.",
      "Hover the window edge to reveal a hidden sidebar; move away to hide it.",
      "Toggle-button expand pins a sidebar open until you close it again.",
      "Leaving fullscreen restores the sidebar states you had before.",
      "Two bindable commands, one per sidebar."
    ],
    stack: ["TypeScript", "Obsidian API"],
    links: { github: "https://github.com/Vatsal057/HideBars" }
  },
  {
    slug: "chitchat-automator",
    title: "Chitchat Automator",
    kind: "tool",
    status: "shipped",
    platform: "Chrome",
    tag: "chrome extension · automation",
    oneLiner: "A Chrome extension that automates chitchat.gg — keyword-skip, auto-greet, auto-restart, all from a clean popup.",
    problem: "Random-chat sites are mostly waiting: for a good match, for a restart after a disconnect, for someone you haven't already talked to. I automated the boring parts behind a toggle.",
    highlights: [
      "Keyword skip: auto-skips a chat when an incoming message matches your keywords.",
      "Username filtering with plain-text and regex patterns.",
      "Skip history: automatically skip anyone you've already chatted with.",
      "Auto-greeting and auto-restart on disconnect; one toggle pauses everything without losing settings."
    ],
    stack: ["JavaScript", "Chrome Extension APIs", "MV3"],
    links: { github: "https://github.com/Vatsal057/ChitChatExtension" }
  },

  /* ---------- Research ---------- */
  {
    slug: "preference-prediction",
    title: "Efficient LLM Preference Prediction",
    kind: "research",
    status: "under review",
    tag: "siamese DeBERTa · calibration",
    oneLiner: "Predicts which chatbot answer humans prefer — at 98% of state-of-the-art with a model 127× smaller.",
    problem: "Preference models used to rank chatbot answers are huge. I wanted to see how far a tiny, cheap-to-train model could get with the right training tricks instead of raw scale.",
    highlights: [
      "Siamese DeBERTa with swap augmentation and temperature calibration.",
      "98% of state-of-the-art performance with a 71M-param model — 127× smaller.",
      "Trained for $0 on free T4 GPUs in 8.4 hours.",
      "Metrics: log loss 1.052 → 0.987, accuracy +3.5 points."
    ],
    learned: "Swap augmentation bought more accuracy than a bigger model would have — it killed the position bias directly.",
    stack: ["DeBERTa-v3", "PyTorch", "free T4 GPUs"],
    links: { github: "https://github.com/Vatsal057" }
  },
  {
    slug: "probclip-a",
    title: "ProbCLIP-A: Uncertainty-Aware Retrieval",
    kind: "research",
    status: "under review",
    tag: "probabilistic adapters · frozen CLIP",
    oneLiner: "Makes CLIP report how sure it is — a small adapter that turns a frozen model into a calibrated one.",
    problem: "CLIP gives you a similarity score but no honest sense of when it's guessing. I wanted uncertainty out of a frozen foundation model without retraining it.",
    highlights: [
      "A 4.2M-param probabilistic adapter on frozen CLIP outputs distributions, not point estimates.",
      "Monte Carlo sampling turns those into uncertainty scores.",
      "Catches 36.6% of failures at an 8.1% false-alarm rate.",
      "Metrics: R@1 68.9%, ECE 0.062 — best calibration of all baselines tested."
    ],
    learned: "Skip the KL warmup schedule and the variance collapses to zero — the model quietly stops being probabilistic.",
    stack: ["CLIP", "PyTorch", "Monte Carlo sampling"],
    links: { github: "https://github.com/Vatsal057" }
  },

  /* ---------- Planned / building next ---------- */
  {
    slug: "sahayak",
    title: "Sahayak — Government Scheme Assistant",
    kind: "planned",
    status: "in progress",
    tag: "flagship · grounded rag + rules",
    links: { github: "https://github.com/Vatsal057/sahayak" },
    oneLiner: "Grounded, cited answers about Indian welfare schemes, with a deterministic eligibility engine.",
    problem: "India runs 3,000+ welfare schemes and the binding constraint is awareness — eligible people don't know schemes exist or can't parse the bureaucratic eligibility language. Existing portals are keyword-search and English-form-heavy. Nobody answers 'I'm a Karnataka farmer with 2 acres — what do I get?' in plain language with trustworthy citations.",
    how: ["ingest schemes", "retrieve", "rules engine", "action card", "abstain if unsure"],
    highlights: [
      "Natural-language eligibility answers with every claim traceable to a source document and URL.",
      "Profile-based discovery: age / state / occupation / income / category → ranked likely-eligible schemes.",
      "Per-scheme action card: benefits, eligibility checklist, required documents, application steps, official link.",
      "Hindi + English at launch, Hinglish queries handled.",
      "Refuses confidently-wrong answers — low retrieval confidence → 'verify at the official source'. Calibration is the point."
    ],
    targets: "Goals: ≥95% grounded claims, correct scheme in top-5 for ≥85% of queries, ≥80% abstention on unanswerable queries. 500 schemes at launch.",
    stack: ["hybrid retrieval (dense + BM25 + RRF)", "bge-m3", "LLM fallback chain", "deterministic rules engine"]
  },
  {
    slug: "oracle",
    title: "Oracle — Personal ML That Learns You",
    kind: "planned",
    status: "in progress",
    tag: "on-device · conformal calibration",
    links: { github: "https://github.com/Vatsal057/oracle" },
    oneLiner: "Honest, calibrated predictions about your own behaviour — the shown 80% is right ~80% of the time.",
    problem: "Habit trackers show dashboards of the past. None make calibrated predictions about your future behaviour, or explain why. The hard, unsolved part is doing meaningful ML on tiny (n=30–300), noisy, single-person datasets without lying about confidence.",
    how: ["log signals", "learn per-person", "predict", "explain", "self-score calibration"],
    highlights: [
      "Near-zero-friction logging (< 30s/day) for sleep, gym, study, mood, spending, screen time, plus custom signals.",
      "Daily calibrated predictions for user-chosen targets, with intervals — not just point guesses.",
      "Top-3 signal contributions per prediction, in plain language.",
      "A visible calibration score and an honest cold-start mode ('still learning you — 2 more weeks').",
      "100% on-device: no account, no cloud, no telemetry. Export or delete everything."
    ],
    targets: "Goals: ECE ≤ 0.10 on a 60-day self-test, beat a persistence baseline on Brier score after 45 days, no >70% predictions before 21 days of data.",
    stack: ["on-device ML", "conformal prediction", "temperature scaling", "Flutter / native"]
  },
  {
    slug: "cachy-study",
    title: "Cachy Study — Exam-Notes Generator",
    kind: "planned",
    status: "planned",
    tag: "extends cachy · fastest build",
    oneLiner: "Turns 40-hour lecture playlists into syllabus-mapped, cited, exam-ready course packs.",
    problem: "Students learn from long lecture playlists but revise from notes, and converting 40 hours of video into exam-ready material is manual, so most don't. Existing AI summarizers do per-video TL;DRs — none produce course-level, syllabus-mapped study material.",
    how: ["playlist + syllabus", "transcribe", "structure by topic", "map to syllabus", "generate pack"],
    highlights: [
      "A Course Pack, not per-video summaries: topic-structured notes with definitions, derivations, worked examples and pitfalls — every block cited to video + timestamp (click to jump).",
      "Syllabus map: each unit marked covered / partial / not covered, with links.",
      "Likely exam questions per unit, generated from emphasis cues (repetition, 'this is important', time spent).",
      "Anki-exportable flashcards and per-unit quizzes; the Cachy Feed reused for a 2-minute-per-unit cram mode.",
      "Free-first — a full course pack must cost ₹0."
    ],
    targets: "Goals: ≥90% of syllabus topics correctly mapped, 100% of note blocks carry a resolvable timestamp, 40-hour playlist → pack in < 2 hours on free tiers.",
    stack: ["Cachy pipeline", "LLM fallback chain", "Whisper", "timestamped retrieval"]
  },
  {
    slug: "chatlens",
    title: "ChatLens — WhatsApp Chat Analyzer",
    kind: "planned",
    status: "planned",
    tag: "100% client-side · verifiable privacy",
    oneLiner: "WhatsApp analytics where your chats never leave your device — and you can prove it.",
    problem: "People are intensely curious about their chat dynamics, but every existing analyzer makes you upload your most private data to someone's server. Huge demand, no trustworthy tool. Privacy isn't a feature here — it's the product.",
    how: ["drag-drop export", "parse", "deterministic analytics", "wrapped cards", "verify offline"],
    highlights: [
      "Input: WhatsApp 'export chat' .txt/.zip — handles Android + iOS formats, 12/24h clocks, locales, group + 1:1.",
      "Deterministic on-device analytics: rhythm heatmaps, who-initiates, response-time distributions, double-text rate, conversation-killer stats, emoji/word leaderboards, laugh dialect.",
      "'Chat Wrapped' — Spotify-Wrapped-style shareable cards, anonymized by default.",
      "Verifiable privacy: works fully offline (airplane-mode demo), open source, CSP blocks all network egress, 'inspect the network tab' invitation in the UI."
    ],
    targets: "Design constraint #1: the architecture makes uploading chats impossible, not just avoided. Parser goal: ≥99% line-parse across platforms and 4 locales.",
    stack: ["client-side JS", "no backend", "strict CSP", "deterministic stats"]
  },
  {
    slug: "placementiq",
    title: "PlacementIQ — Placement Intelligence",
    kind: "planned",
    status: "planned",
    tag: "resume scorer + company intel · maybe",
    oneLiner: "A calibrated resume scorer plus crowdsourced, per-company interview intelligence.",
    problem: "Placement prep in India is fragmented — interview experiences scattered across Telegram, generic resume advice, no way to answer 'for this company and this role, what should I fix first?'. Existing players sell content, not personalized intelligence.",
    how: ["upload resume + role", "shortlist model", "company intel", "prep plan", "mock interview"],
    highlights: [
      "Resume scorer with specific prioritized fixes, backed by a trained shortlist-prediction model (not just LLM vibes) with calibrated confidence shown.",
      "Per company × role intelligence: round structure, frequent topics, difficulty trend, CTC ranges — from crowdsourced, moderated submissions.",
      "A week-by-week prep planner and an LLM mock interviewer with scored feedback.",
      "A contribution flywheel: submit a verified interview experience to unlock premium views."
    ],
    targets: "Flagged 'maybe' — gated on a real cold-start data plan (campus-first, crowdsourced, no ToS-violating scraping). Model goal: shortlist AUC ≥ 0.70, ECE ≤ 0.10.",
    stack: ["siamese DeBERTa", "calibration toolkit", "LLM fallback chain", "moderated crowdsourcing"]
  }
];

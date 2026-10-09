/*!
 * Portfolio Guide — Procedural Canvas Mascot, Drag & Drop Gravity Physics, and Offline AI Assistant.
 * Fully embedded with 41 portfolio knowledge chunks, true downward fall landing, and synchronized animations.
 */

(function () {
  const HIDE_KEY = "portfolio_guide_hidden";
  const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
  const IDLE_NUDGE_MS = 24000;
  const SLEEP_MS = 55000;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isPhone = () => innerWidth <= 640;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  const session = {
    get: (k) => {
      try {
        return sessionStorage.getItem(k);
      } catch {
        return null;
      }
    },
    set: (k, v) => {
      try {
        sessionStorage.setItem(k, v);
      } catch {}
    },
  };

  const recruiterOn = () => document.body.classList.contains("recruiter");
  const isDetailPage = () => /\/case\//.test(location.pathname) || !!document.querySelector(".project-detail");

  // ── 41 Portfolio Knowledge Chunks ────────────────────────────────────
  const KB = [{"id":"project:cachy","title":"Cachy","kind":"project","text":"Cachy (project, status: shipped). Category: knowledge engine · flutter + fastapi. Turns Reels, Shorts and articles into structured knowledge cards, linked in a semantic graph. Problem it solves: Short-form media is where a lot of learning now happens, but it evaporates the moment you scroll past. I wanted the useful 20 seconds of a Reel captured as something I could search, revisit and connect — not re-watch. Pipeline: ingest; transcribe / OCR; LLM chain; cards; graph. Details: LLM chain with automatic fallback across Gemini 2.5 Flash → Cerebras → Groq → paragraph fallback, because free APIs kept dropping mid-request.; Transcription via Groq Whisper with a local faster-whisper fallback; keyframe OCR via Tesseract.; Semantic knowledge graph: semantic + reference + tag edges, label-propagation clustering, client-side force-directed layout.; No external infra — single SQLite DB, in-process asyncio worker (no Redis/Celery), deploys to one free HF Space.; That in-process worker used to ask the jobs table for work every second. On a Postgres that suspends when idle and bills compute by the hour, that keeps it awake permanently, and it drained the monthly allowance in about 17 days with nobody using the app. It now waits on an event the enqueue path fires and backs off to 30 minutes when the queue is empty, so pickup is still instant and the database gets to sleep.; Reel-style Feed replay, per-card and library-wide chat, semantic search, Present mode. What he learned: A three-provider fallback chain shipped faster and broke less than waiting for one reliable paid API. The database quota running out every month taught me more though. I assumed it was usage and it was my own worker polling once a second, and then my first fix cut the query count by 99.7% and still left the compute awake 83% of the month, because every query restarts the idle timer. The wait has to be several times the sleep threshold before anything actually sleeps. Stack: Whisper; OpenCV; Tesseract; SQLite; FastAPI; Flutter; HF Spaces. Links: https://cachy.vatxzz.workers.dev; https://vatxzz-cachy.hf.space; https://github.com/Vatsal057/Cachy/releases/latest; https://github.com/Vatsal057/Cachy.","summary":"Cachy turns Reels and articles into structured knowledge graph cards with Whisper, OpenCV OCR, and a multi-LLM fallback chain across Gemini, Cerebras, and Groq."},{"id":"project:constitution-rag","title":"Constitution of India · RAG Q&A","kind":"project","text":"Constitution of India · RAG Q&A (project, status: shipped). Category: rag from scratch · no langchain. Ask the Indian Constitution anything; get grounded answers with exact citations and similarity scores. Problem it solves: I wanted to actually understand retrieval, not import it. So I wrote the whole RAG loop by hand and picked a document where a wrong-but-confident answer would be obviously wrong: the Constitution. Pipeline: pdf; chunk; embed; retrieve; cite. Details: Retrieval and prompt logic written directly in ~60 lines — no LangChain.; query → all-MiniLM-L6-v2 embedding → ChromaDB cosine top-5 → context prompt → Mistral-7B → answer + citations.; Streamlit chat UI with a source panel showing retrieved chunks, page numbers and similarity scores.; Ships with FAILURES.md: a 20-query stress test. First-pass accuracy 65%, ~78% after fixing chunking. What he learned: Chunking broke everything first. The retriever was fine; the boundaries between chunks were the bug. Stack: sentence-transformers; ChromaDB; Mistral-7B; pypdf; Streamlit. Links: https://github.com/Vatsal057/samvidhan.","summary":"Constitution of India RAG was built completely from scratch in ~60 lines of Python — no LangChain. Embeddings via all-MiniLM-L6-v2 and ChromaDB with 78% accuracy."},{"id":"project:ipl-mlops","title":"IPL Match Predictor · MLOps","kind":"project","text":"IPL Match Predictor · MLOps (project, status: shipped). Category: full ml lifecycle · self-monitoring. An XGBoost match-outcome model that serves itself, watches itself for drift, and says when it needs retraining. Problem it solves: A model in a notebook isn't a system. I wanted the whole lifecycle — train, serve, monitor — running as separate services the way it would in production, not a single script. Pipeline: data; features; train; serve; monitor. Details: Three Docker Compose services sharing a /data volume: a FastAPI prediction API, a PSI drift monitor, and a Streamlit dashboard.; Drift detection via Population Stability Index between training and recent prediction distributions, computed every 5 minutes and surfaced live.; Endpoints: /predict, /result, /stats, /drift, /health.; Chose XGBoost over an MLP for a small, mostly-categorical 9-feature set — same accuracy, faster, interpretable importances. What he learned: Self-monitoring is cheap to add and changes how much you trust the thing. A number that goes stale silently is worse than no number. Stack: XGBoost; FastAPI; SQLite; Streamlit; Docker Compose. Links: https://github.com/Vatsal057/ipl-mlops.","summary":"IPL Match Predictor runs 3 dockerized services (FastAPI + XGBoost + Streamlit), computing Population Stability Index (PSI) every 5 minutes for model drift."},{"id":"project:airswipe","title":"AirSwipe","kind":"project","text":"AirSwipe (project, status: shipped). Category: computer vision · gesture control. Control PowerPoint with bare hands through a webcam — swipe, point, pinch. No remote, no keyboard. Problem it solves: Presenting means either pacing near the laptop or fumbling a clicker. I wanted to drive slides from anywhere in the room with gestures that don't false-trigger while I'm just talking with my hands. Pipeline: webcam; landmarks; gesture; action. Details: Gestures: dwell-based start/stop, swipe next/previous, proportional pinch-zoom, auto-calibrating laser pointer, blank screen, jump to first slide.; Finger detection uses distance ratios, so it's orientation-independent.; A deliberate dead zone separates laser from zoom; swipe arming/return windows stop accidental triggers.; core/ (controller, MediaPipe detector, gesture state machines) + ui/ (PyQt6 + OpenCV overlay), fully tunable via config.json. What he learned: Most of the work in a gesture controller isn't recognising gestures — it's refusing to recognise the ones you didn't mean. Stack: MediaPipe; OpenCV; PyQt6. Links: https://github.com/Vatsal057/AirSwipe/releases/latest; https://github.com/Vatsal057/AirSwipe.","summary":"AirSwipe lets you control PowerPoint presentations hands-free through a webcam using MediaPipe gesture tracking and OpenCV."},{"id":"project:bangalore-aqi","title":"Bangalore Air Quality","kind":"project","text":"Bangalore Air Quality (project, status: shipped). Category: data mining · unsupervised. A year of data from 13 CPCB stations, clustered to find the pollution hotspots a city-wide average hides. Problem it solves: A single city AQI number hides everything interesting. A traffic junction and a leafy suburb get averaged into a meaningless middle. I wanted to surface the local variance. Pipeline: excel mess; clean; features; cluster; hotspots. Details: Manual ETL from the CPCB CAAQMS portal: non-standard 'wide' Excel files reshaped into long-format time series.; 6 engineered features, three clustering algorithms compared.; DBSCAN won — it flags outliers, and the outliers were the hotspots. Silk Board hit AQI 500.; Ships as a standalone notebook with processed datasets, cluster assignments, report and presentation. What he learned: DBSCAN beat K-Means here precisely because it doesn't force every point into a cluster — the points it refused to place were the answer. Stack: pandas; scikit-learn; DBSCAN; Jupyter. Links: https://vatsal057.github.io/AirQuality/; https://github.com/Vatsal057/AirQuality.","summary":"Bangalore AQI analyzed 1 year of messy CPCB data from 13 stations using DBSCAN clustering, isolating hotspot outliers like Silk Board (AQI 500)."},{"id":"project:indian-food-search","title":"Indian Food Multimodal Search","kind":"project","text":"Indian Food Multimodal Search (project, status: shipped). Category: clip · text + image retrieval. Find any Indian dish by describing it in plain English — or by uploading a photo of something similar. Problem it solves: Every CLIP demo uses the same Flickr8k stock photos. I wanted to see whether the approach held on something domain-specific and culturally relevant, so I pointed it at Indian food. Pipeline: encode dishes; index; text/image query; rank; explain. Details: Text → Image: type what you're craving, get ranked results ('crispy golden dosa' reliably surfaces dosas).; Image → Image: upload any food photo, find visually similar dishes.; Category browser and a 'Surprise Me' random discovery mode.; A category-breakdown bar chart per search — added after noticing queries matched across dish families; it made retrieval interpretable. What he learned: The interpretability chart wasn't planned. It came from being confused by my own results, and it's now the most useful part. Stack: CLIP; Python; Gradio; HF Spaces. Links: https://github.com/Vatsal057/indian-food-search.","summary":"Indian Food Multimodal Search uses OpenAI CLIP to find regional dishes from plain English descriptions or uploaded photos."},{"id":"project:plant-disease","title":"Plant Disease Detector","kind":"project","text":"Plant Disease Detector (project, status: shipped). Category: cnn · grad-cam explainability. Upload a leaf photo, get an instant diagnosis — with a Grad-CAM heatmap showing exactly what the model looked at. Problem it solves: Most plant-disease demos give a prediction and a confidence score and stop. You never learn whether the model looked at the lesion or at the soil in the background. I wanted the model to show its work. Pipeline: leaf image; classify; grad-cam; severity; explain. Details: Classifies across 15 classes: 5 crops × (healthy + common diseases).; Grad-CAM overlay highlights the regions that drove the prediction — uniform spread on healthy leaves, concentrated on the lesion when diseased.; Reports severity (none / low / medium / high) with a plain-English description.; Top-5 probability breakdown chart per image. What he learned: Confidence scores lie by omission. A heatmap is a much harder thing for a model to fake trustworthiness with. Stack: PyTorch; Grad-CAM; Gradio; HF Spaces. Links: https://github.com/Vatsal057/plant-disease-detector.","summary":"Plant Disease Detector classifies 15 crop diseases with Grad-CAM heatmaps showing exactly which leaf lesions drove the prediction."},{"id":"project:scribbletype","title":"ScribbleType","kind":"project","text":"ScribbleType (project, status: shipped). Category: on-device ml · accessibility. A handwriting-to-text Android keyboard for seniors: write with a finger, get typed text — all on device. Problem it solves: Tiny on-screen keys and autocorrect fight older users. Handwriting is the input they already trust. I wanted a keyboard that reads their handwriting locally, no cloud, and adapts to how they write. Pipeline: strokes; smooth; recognize; learn. Details: On-device ink recognition via ML Kit — nothing leaves the phone.; A personal dictionary that learns the user's writing over time.; Catmull-Rom smoothing filters hand tremor before recognition.; Ships as a real Kotlin IME, not a demo app. Stack: ML Kit; Flutter; Kotlin IME. Links: https://github.com/Vatsal057/Scribbleeeee/releases/latest; https://github.com/Vatsal057/Scribbleeeee.","summary":"ScribbleType is an accessibility Android keyboard for seniors using on-device ML Kit handwriting recognition and Catmull-Rom tremor smoothing."},{"id":"app:insomniac","title":"Insomniac.app","kind":"app","text":"Insomniac.app (app, status: shipped). Category: macOS · menu bar utility. Platform: macOS. Keeps a Mac awake, lid closed included, with smart triggers so you rarely have to think about it. Problem it solves: The built-in Keep Awake options are all-or-nothing and forget the lid. I wanted something that turns itself on for the right apps, networks and workloads and gets out of the way otherwise. Details: Keeps the Mac awake with the lid closed.; Timed durations and a global shortcut.; Smart triggers: auto-enable on chosen apps, Wi-Fi networks, high CPU, or active downloads.; Scriptable via an insomniac:// URL scheme. Stack: Swift 5.9; AppKit; IOKit; NWPathMonitor. Links: https://github.com/Vatsal057/Insomniac/releases/latest; https://github.com/Vatsal057/Insomniac.","summary":"Insomniac.app: Insomniac.app . Category: macOS · menu bar utility. Platform: macOS. Keeps a Mac awake, lid closed included, with smart triggers so you rarely have to think about it."},{"id":"app:glide","title":"Glide.app","kind":"app","text":"Glide.app (app, status: shipped). Category: macOS · trackpad gestures. Platform: macOS. Custom 3/4/5-finger trackpad gestures for window snapping, media control and launching apps. Problem it solves: macOS gives you a handful of fixed trackpad gestures and no way to add your own. I use the trackpad constantly, so I built the customizer I wanted. Details: Custom 3/4/5-finger gestures mapped to window snapping, media control and app launching.; Speed-aware: a slow swipe switches windows, a fast flick opens the browser.; Reciprocal undo, haptic feedback, per-app filters.; Reads raw multitouch data directly via IOKit. Stack: Swift; AppKit; IOKit multitouch. Links: https://github.com/Vatsal057/Glide/releases/latest; https://github.com/Vatsal057/Glide.","summary":"Glide.app: Glide.app . Category: macOS · trackpad gestures. Platform: macOS. Custom 3/4/5-finger trackpad gestures for window snapping, media control and launching apps."},{"id":"app:dimmer","title":"Dimmer.app","kind":"app","text":"Dimmer.app (app, status: shipped). Category: macOS · display dimming. Platform: macOS. Dims displays below the hardware minimum using overlay windows, each monitor independently. Problem it solves: At night even the lowest hardware brightness is too bright, especially on external monitors that don't dim as far. An overlay fixes it per-display. Details: Dims each connected monitor independently via overlay windows.; Goes below the hardware minimum brightness.; Lives in the menu bar, does one thing well. Stack: Swift; SwiftUI; AppKit. Links: https://github.com/Vatsal057/Dimmer/releases/latest; https://github.com/Vatsal057/Dimmer.","summary":"Dimmer.app: Dimmer.app . Category: macOS · display dimming. Platform: macOS. Dims displays below the hardware minimum using overlay windows, each monitor independently."},{"id":"app:photowidget","title":"PhotoWidget.app","kind":"app","text":"PhotoWidget.app (app, status: shipped). Category: macOS · desktop widgets. Platform: macOS. Your own photos as desktop widgets, in four sizes and full colour. Problem it solves: macOS desktop widgets are mostly system data. I wanted my own photos up there, in colour, without the monochrome tint the widget system likes to apply. Details: Personal photos as desktop widgets in four sizes.; Per-widget photo choice.; Full colour even in monochrome widget mode. Stack: Swift; WidgetKit; AppIntents. Links: https://github.com/Vatsal057/PhotoWidget/releases/latest; https://github.com/Vatsal057/PhotoWidget.","summary":"PhotoWidget.app: PhotoWidget.app . Category: macOS · desktop widgets. Platform: macOS. Your own photos as desktop widgets, in four sizes and full colour."},{"id":"app:media-manager","title":"Samsung Media Manager","kind":"app","text":"Samsung Media Manager (app, status: shipped). Category: macOS · library triage, reversibly. Platform: macOS. Organizes, de-duplicates and compresses a photo library — and can undo every batch it ran. Problem it solves: Years of phone photos end up on a drive as one big unsorted pile, and every tool that offers to tidy it wants you to trust it with bulk file moves you cannot take back. I wanted one that shows me each move before it makes it and can put everything back afterwards. Details: Every proposed move comes with the reason for it, worked out from the original Android folder structure, EXIF camera metadata and dates. Only high-confidence moves are pre-selected; ambiguous media is proposed under _review/YYYY-MM and duplicates stay unchecked until approved.; Every file operation goes through one Mover choke point that performs the move and returns a record. The History screen groups those into batches and Undo reverses a whole batch back to exactly where files were.; GPS trip clustering: groups located photos into trips, reverse-geocodes the place name, and files them under DCIM/Trips/<name>.; Duplicate detection by size then SHA-256, keeping the best copy and moving the rest to quarantine. It never deletes a file.; Blur and darkness screening via variance-of-Laplacian plus brightness, always review-then-quarantine.; Per-library state: each folder keeps its own settings and history in a hidden .mediamanager/, so nothing is hardcoded to one machine or one user. What he learned: Undo works because every file move goes through one logged choke point. I wrote all the detection logic first and then had to restructure the app around that single Mover, because there was no way to reverse a batch until every mutation had a record. Stack: Swift; SwiftUI; swiftc; ffmpeg; Core Location. Links: https://github.com/Vatsal057/SamsungMediaManager.","summary":"Samsung Media Manager: Samsung Media Manager . Category: macOS · library triage, reversibly. Platform: macOS. Organizes, de-duplicates and compresses a photo library — and can undo every batch it ran."},{"id":"app:smart-wardrobe","title":"Smart Wardrobe","kind":"app","text":"Smart Wardrobe (app, status: shipped). Category: flutter · on-device, no account. Platform: Flutter. Photograph your clothes once; the app plans what you wear. Problem it solves: Deciding what to wear is a small daily tax, and 'what do I even own' is worse when half of it is in the wash. I wanted a closet that plans outfits from clothes I actually have, against the actual weather. Details: Outfit suggestions by occasion, from clothes you own.; A 'Today' screen that checks live weather and recent wear history first.; Wash tracking and packing lists built against the forecast.; Fully on-device, no account. Stack: Flutter; SQLite; on-device. Links: https://vatsal057.github.io/Smart-Wardrobe/; https://github.com/Vatsal057/Smart-Wardrobe.","summary":"Smart Wardrobe: Smart Wardrobe . Category: flutter · on-device, no account. Platform: Flutter. Photograph your clothes once; the app plans what you wear."},{"id":"app:twin","title":"TWIN","kind":"app","text":"TWIN (app, status: shipped). Category: realtime game · firestore, no server. Platform: Web · Android. A two-player word convergence game: keep naming words aimed at the middle of the last pair until you both say the same one. Problem it solves: I wanted a real-time multiplayer game with no backend to run and no way for either player to cheat. Those two turn out to be the same problem. If the server is only a database, something still has to stop one client reading the other's move before it commits its own. Pipeline: create room; both submit privately; simultaneous reveal; aim for the middle; converge. Details: Firestore is the entire backend — no custom server, no socket layer. Both clients hold a live listener on the room document and react to changes.; In-flight words live in their own subcollection. Firestore cannot hide one field from someone who is allowed to read the document, so keeping them on the room doc would have handed each player the other's word. Security rules release it only once both have submitted, and submissions are create-only.; Rounds resolve without a server: both clients compute the outcome and race a transaction that only appends if rounds.length still equals the round index. One write lands, the other backs out — safe because the rule is string equality, so two clients can't disagree.; Room codes omit I, L, O, 0 and 1 because codes get dictated over the phone and retyped from screenshots.; Android App Links via a staged assetlinks.json, with the web build as the universal fallback after Firebase Dynamic Links shut down. What he learned: A rule that errors in Firestore denies. Checking `resource == null` first mattered because reserving a room code reads the document it is about to write — and that one missing check blocked every room creation. Stack: Flutter; Firestore; Firebase Auth; Firebase Hosting. Links: https://twinnn.web.app; https://github.com/Vatsal057/TWIN/releases/latest; https://github.com/Vatsal057/TWIN.","summary":"TWIN: TWIN . Category: realtime game · firestore, no server. Platform: Web · Android. A two-player word convergence game: keep naming words aimed at the middle of the last pair until you both say the same one."},{"id":"app:lull","title":"Lull.app","kind":"app","text":"Lull.app (app, status: shipped). Category: macOS · private-framework reverse engineering. Platform: macOS. Menu-bar control for macOS Background Sounds — the real system feature, two-way synced with System Settings. Problem it solves: Background Sounds is a good macOS feature buried three levels deep in Accessibility settings. Every third-party alternative I found ships its own audio files and ignores the built-in one. I wanted a menu-bar remote for the system feature itself. Details: Drives the same private framework System Settings uses (HearingUtilities → HUComfortSoundsSettings), so playback, the hi-quality downloaded audio and EQ are all handled by macOS.; Writes com.apple.ComfortSounds prefs and notifies the `heard` daemon, so changes appear in System Settings and vice-versa.; Equalizer, sleep timer, stop-on-lock, and a customizable global shortcut (⌥⌘L by default).; Every private-API call is guarded. If a future macOS changes the framework, the app falls back to opening the Settings pane.; No network, no accounts, no data collection, no Dock icon. What he learned: Building on an undocumented framework is only worth doing if you assume it will disappear. Every call is wrapped, so when Apple changes something the app loses that one feature and keeps running. Stack: Swift; AppKit; HearingUtilities (private). Links: https://github.com/Vatsal057/Lull/releases/latest; https://github.com/Vatsal057/Lull.","summary":"Lull.app: Lull.app . Category: macOS · private-framework reverse engineering. Platform: macOS. Menu-bar control for macOS Background Sounds — the real system feature, two-way synced with System Settings."},{"id":"tool:chrome-to-safari","title":"chrome-to-safari","kind":"tool","text":"chrome-to-safari (tool, status: shipped). Category: dev tool · extension signing. Platform: macOS. Turn any Chrome extension into a working, signed Safari extension — no paid Apple Developer ID. Problem it solves: Safari can run Chrome extensions, but unsigned ones get disabled every time Safari restarts, so you're forever re-ticking 'Allow unsigned extensions'. Signing with a free Apple ID fixes it permanently — the tooling to do that just didn't exist in one drag-and-drop step. Details: Drag an unpacked extension folder (or paste a Chrome Web Store link) → get a signed Safari extension.; Signs with a free Apple Development certificate — no $99/year membership.; Once enabled in Safari, it stays enabled across restarts.; Ships with a small drop-target UI (./chrome-to-safari.sh --ui). Stack: Shell; Xcode toolchain; WebExtensions. Links: https://github.com/Vatsal057/chrome-to-safari.","summary":"chrome-to-safari: chrome-to-safari . Category: dev tool · extension signing. Platform: macOS. Turn any Chrome extension into a working, signed Safari extension — no paid Apple Developer ID."},{"id":"tool:mac-app-signer","title":"mac-app-signer","kind":"tool","text":"mac-app-signer (tool, status: shipped). Category: dev tool · code signing. Platform: macOS. Sign any macOS .app bundle locally with a free Apple certificate — no paid Developer ID required. Problem it solves: Build an app from source and Gatekeeper nags you; Safari disables unsigned extensions on every restart. Apple's free developer tier already includes a certificate that fixes both — this just wraps it in one command. Details: Re-signs any .app so macOS treats it as properly signed on your machine.; Keeps development-signed Safari extensions enabled permanently.; Removes Gatekeeper friction on locally-built apps.; Uses the free Apple Development certificate — no $99/year. Stack: Shell; codesign; Xcode CLT. Links: https://github.com/Vatsal057/mac-app-signer.","summary":"mac-app-signer: mac-app-signer . Category: dev tool · code signing. Platform: macOS. Sign any macOS .app bundle locally with a free Apple certificate — no paid Developer ID required."},{"id":"tool:hidebars","title":"HideBars","kind":"tool","text":"HideBars (tool, status: shipped). Category: obsidian plugin · focus. Platform: Obsidian. An Obsidian plugin that auto-hides both sidebars until you hover the window edge. Problem it solves: In fullscreen or a narrow window, Obsidian's sidebars eat the width I want for notes. I wanted them gone until I reach for them, then back on demand — without losing my layout when I exit fullscreen. Details: Auto-collapses both sidebars in fullscreen or below a width threshold.; Hover the window edge to reveal a hidden sidebar; move away to hide it.; Toggle-button expand pins a sidebar open until you close it again.; Leaving fullscreen restores the sidebar states you had before.; Two bindable commands, one per sidebar. Stack: TypeScript; Obsidian API. Links: https://github.com/Vatsal057/HideBars.","summary":"HideBars: HideBars . Category: obsidian plugin · focus. Platform: Obsidian. An Obsidian plugin that auto-hides both sidebars until you hover the window edge."},{"id":"research:preference-prediction","title":"Efficient LLM Preference Classification","kind":"research","text":"Efficient LLM Preference Classification (research, status: under review). Category: siamese DeBERTa · calibration. Predicts which chatbot answer a human will prefer, using a 71M-parameter model where the winning solutions used 9B. Problem it solves: Preference models that rank chatbot answers are huge. The winning LMSYS solutions ran 9B+ parameter models on eight A100s, which the paper puts at over $100,000 of compute. I wanted to see how far a small model could get on free GPUs if the training tricks did the work instead of the scale. Details: Siamese DeBERTa-v3-xsmall, 71.3M parameters, with identical encoders for both responses so the architecture itself is symmetric.; Swap augmentation doubles the training data and removes the position bias, where the model prefers whichever answer came first.; Held-out log loss 1.0384 on 8,000 held-out LMSYS Chatbot Arena interactions, with ≈127× fewer parameters than 9B+ Kaggle solutions.; 46.40% accuracy on the three-class problem on the held-out set.; Post-hoc temperature scaling at T = 1.20 corrects about 20% overconfidence.; Flip consistency 0.825 → 0.920 with swap augmentation, against a duplicate-augmentation control.; Trained on two Tesla T4 GPUs across 12,000 interactions, 3 epochs. What he learned: Swap augmentation bought more accuracy than a bigger model would have — it killed the position bias directly. Stack: DeBERTa-v3; PyTorch; free T4 GPUs. Links: papers/efficient-llm-preference-classification.pdf.","summary":"The Siamese DeBERTa research paper predicts human chatbot preference with a 71M parameter model (127× smaller than 9B models) trained in 8.4h on free T4s."},{"id":"planned:sahayak","title":"Sahayak — Government Scheme Assistant","kind":"planned","text":"Sahayak — Government Scheme Assistant (planned, status: in progress). Category: flagship · grounded rag + rules. Grounded, cited answers about Indian welfare schemes, with a deterministic eligibility engine. Problem it solves: India runs 3,000+ welfare schemes and the binding constraint is awareness — eligible people don't know schemes exist or can't parse the bureaucratic eligibility language. Existing portals are keyword-search and English-form-heavy. Nobody answers 'I'm a Karnataka farmer with 2 acres — what do I get?' in plain language with trustworthy citations. Pipeline: ingest schemes; retrieve; rules engine; action card; abstain if unsure. Details: Natural-language eligibility answers with every claim traceable to a source document and URL.; Profile-based discovery: age / state / occupation / income / category → ranked likely-eligible schemes.; Per-scheme action card: benefits, eligibility checklist, required documents, application steps, official link.; Hindi + English at launch, Hinglish queries handled.; Refuses confidently-wrong answers — low retrieval confidence → 'verify at the official source'. Calibration is the point. Stack: hybrid retrieval (dense + BM25 + RRF); bge-m3; LLM fallback chain; deterministic rules engine. Targets: Goals: ≥95% grounded claims, correct scheme in top-5 for ≥85% of queries, ≥80% abstention on unanswerable queries. 500 schemes at launch.. Links: https://vatsal057.github.io/sahayak/; https://github.com/Vatsal057/sahayak.","summary":"Sahayak — Government Scheme Assistant (planned, status: in progress). Category: flagship · grounded rag + rules. Grounded, cited answers about Indian welfare schemes, with a determ..."},{"id":"planned:oracle","title":"Oracle — Personal ML That Learns You","kind":"planned","text":"Oracle — Personal ML That Learns You (planned, status: in progress). Category: on-device · conformal calibration. Honest, calibrated predictions about your own behaviour — the shown 80% is right ~80% of the time. Problem it solves: Habit trackers show dashboards of the past. None make calibrated predictions about your future behaviour, or explain why. The hard, unsolved part is doing meaningful ML on tiny (n=30–300), noisy, single-person datasets without lying about confidence. Pipeline: log signals; learn per-person; predict; explain; self-score calibration. Details: Near-zero-friction logging (< 30s/day) for sleep, gym, study, mood, spending, screen time, plus custom signals.; Daily calibrated predictions for user-chosen targets, with intervals — not just point guesses.; Top-3 signal contributions per prediction, in plain language.; A visible calibration score and an honest cold-start mode ('still learning you — 2 more weeks').; 100% on-device: no account, no cloud, no telemetry. Export or delete everything. Stack: on-device ML; conformal prediction; temperature scaling; Flutter / native. Targets: Goals: ECE ≤ 0.10 on a 60-day self-test, beat a persistence baseline on Brier score after 45 days, no >70% predictions before 21 days of data.. Links: https://vatsal057.github.io/oracle/; https://github.com/Vatsal057/oracle.","summary":"Oracle — Personal ML That Learns You (planned, status: in progress). Category: on-device · conformal calibration. Honest, calibrated predictions about your own behaviour — the show..."},{"id":"planned:cachy-study","title":"Cachy Study — Exam-Notes Generator","kind":"planned","text":"Cachy Study — Exam-Notes Generator (planned, status: planned). Category: extends cachy · fastest build. Turns 40-hour lecture playlists into syllabus-mapped, cited, exam-ready course packs. Problem it solves: Students learn from long lecture playlists but revise from notes, and converting 40 hours of video into exam-ready material is manual, so most don't. Existing AI summarizers do per-video TL;DRs — none produce course-level, syllabus-mapped study material. Pipeline: playlist + syllabus; transcribe; structure by topic; map to syllabus; generate pack. Details: A Course Pack, not per-video summaries: topic-structured notes with definitions, derivations, worked examples and pitfalls — every block cited to video + timestamp (click to jump).; Syllabus map: each unit marked covered / partial / not covered, with links.; Likely exam questions per unit, generated from emphasis cues (repetition, 'this is important', time spent).; Anki-exportable flashcards and per-unit quizzes; the Cachy Feed reused for a 2-minute-per-unit cram mode.; Free-first — a full course pack must cost ₹0. Stack: Cachy pipeline; LLM fallback chain; Whisper; timestamped retrieval. Targets: Goals: ≥90% of syllabus topics correctly mapped, 100% of note blocks carry a resolvable timestamp, 40-hour playlist → pack in < 2 hours on free tiers..","summary":"Cachy Study — Exam-Notes Generator (planned, status: planned). Category: extends cachy · fastest build. Turns 40-hour lecture playlists into syllabus-mapped, cited, exam-ready cour..."},{"id":"planned:chatlens","title":"ChatLens — WhatsApp Chat Analyzer","kind":"planned","text":"ChatLens — WhatsApp Chat Analyzer (planned, status: planned). Category: 100% client-side · verifiable privacy. WhatsApp analytics where your chats never leave your device — and you can prove it. Problem it solves: People are intensely curious about their chat dynamics, but every existing analyzer makes you upload your most private data to someone's server. Huge demand, no trustworthy tool. Privacy isn't a feature here — it's the product. Pipeline: drag-drop export; parse; deterministic analytics; wrapped cards; verify offline. Details: Input: WhatsApp 'export chat' .txt/.zip — handles Android + iOS formats, 12/24h clocks, locales, group + 1:1.; Deterministic on-device analytics: rhythm heatmaps, who-initiates, response-time distributions, double-text rate, conversation-killer stats, emoji/word leaderboards, laugh dialect.; 'Chat Wrapped' — Spotify-Wrapped-style shareable cards, anonymized by default.; Verifiable privacy: works fully offline (airplane-mode demo), open source, CSP blocks all network egress, 'inspect the network tab' invitation in the UI. Stack: client-side JS; no backend; strict CSP; deterministic stats. Targets: Design constraint #1: the architecture makes uploading chats impossible, not just avoided. Parser goal: ≥99% line-parse across platforms and 4 locales..","summary":"ChatLens — WhatsApp Chat Analyzer (planned, status: planned). Category: 100% client-side · verifiable privacy. WhatsApp analytics where your chats never leave your device — and you..."},{"id":"planned:placementiq","title":"PlacementIQ — Placement Intelligence","kind":"planned","text":"PlacementIQ — Placement Intelligence (planned, status: planned). Category: resume scorer + company intel · maybe. A calibrated resume scorer plus crowdsourced, per-company interview intelligence. Problem it solves: Placement prep in India is fragmented — interview experiences scattered across Telegram, generic resume advice, no way to answer 'for this company and this role, what should I fix first?'. Existing players sell content, not personalized intelligence. Pipeline: upload resume + role; shortlist model; company intel; prep plan; mock interview. Details: Resume scorer with specific prioritized fixes, backed by a trained shortlist-prediction model (not just LLM vibes) with calibrated confidence shown.; Per company × role intelligence: round structure, frequent topics, difficulty trend, CTC ranges — from crowdsourced, moderated submissions.; A week-by-week prep planner and an LLM mock interviewer with scored feedback.; A contribution flywheel: submit a verified interview experience to unlock premium views. Stack: siamese DeBERTa; calibration toolkit; LLM fallback chain; moderated crowdsourcing. Targets: Flagged 'maybe' — gated on a real cold-start data plan (campus-first, crowdsourced, no ToS-violating scraping). Model goal: shortlist AUC ≥ 0.70, ECE ≤ 0.10..","summary":"PlacementIQ — Placement Intelligence (planned, status: planned). Category: resume scorer + company intel · maybe. A calibrated resume scorer plus crowdsourced, per-company intervie..."},{"id":"skill:python","title":"Python","kind":"skill","text":"Skill: Python. Self-assessed proficiency: 90%. Evidence: 13 repos. Primary language of every shipped AI project. Used in: ✓ Cachy ✓ AirSwipe ✓ IPL pipeline ✓ +10 more.","summary":"Skill: Python. Self-assessed proficiency: 90%. Evidence: 13 repos. Primary language of every shipped AI project. Used in: ✓ Cachy ✓ AirSwipe ✓ IPL pipeline ✓ +10 more."},{"id":"skill:deep-learning-pytorch","title":"Deep Learning · PyTorch","kind":"skill","text":"Skill: Deep Learning · PyTorch. Self-assessed proficiency: 82%. Evidence: 1 paper. Research paper on LLM preference classification. Used in: ✓ preference paper (under review).","summary":"Skill: Deep Learning · PyTorch. Self-assessed proficiency: 82%. Evidence: 1 paper. Research paper on LLM preference classification. Used in: ✓ preference paper (under review)."},{"id":"skill:computer-vision","title":"Computer Vision","kind":"skill","text":"Skill: Computer Vision. Self-assessed proficiency: 80%. Evidence: 3 shipped. MediaPipe, OpenCV, OCR in shipped products. Used in: ✓ AirSwipe ✓ Cachy OCR.","summary":"Skill: Computer Vision. Self-assessed proficiency: 80%. Evidence: 3 shipped. MediaPipe, OpenCV, OCR in shipped products. Used in: ✓ AirSwipe ✓ Cachy OCR."},{"id":"skill:llms-rag","title":"LLMs & RAG","kind":"skill","text":"Skill: LLMs & RAG. Self-assessed proficiency: 68%. Evidence: 3 systems. Built retrieval from scratch; still the newest skill here. Used in: ✓ Constitution QA ✓ Cachy LLM chain → current focus: evals.","summary":"Skill: LLMs & RAG. Self-assessed proficiency: 68%. Evidence: 3 systems. Built retrieval from scratch; still the newest skill here. Used in: ✓ Constitution QA ✓ Cachy LLM chain → current focus: evals."},{"id":"skill:sql-data-wrangling","title":"SQL & Data Wrangling","kind":"skill","text":"Skill: SQL & Data Wrangling. Self-assessed proficiency: 72%. Evidence: 14 exports. pandas, SQLite, messy real-world Excel included. Used in: ✓ Bangalore AQI ✓ 14 station exports consolidated, 13 usable.","summary":"Skill: SQL & Data Wrangling. Self-assessed proficiency: 72%. Evidence: 14 exports. pandas, SQLite, messy real-world Excel included. Used in: ✓ Bangalore AQI ✓ 14 station exports consolidated, 13 usable."},{"id":"skill:mlops-docker-fastapi","title":"MLOps · Docker · FastAPI","kind":"skill","text":"Skill: MLOps · Docker · FastAPI. Self-assessed proficiency: 70%. Evidence: 3 services. Drift detection, monitoring, multi-service deploys. Used in: ✓ IPL drift pipeline ✓ HF Spaces deploys.","summary":"Skill: MLOps · Docker · FastAPI. Self-assessed proficiency: 70%. Evidence: 3 services. Drift detection, monitoring, multi-service deploys. Used in: ✓ IPL drift pipeline ✓ HF Spaces deploys."},{"id":"skill:app-development","title":"App Development","kind":"skill","text":"Skill: App Development. Self-assessed proficiency: 78%. Evidence: 7 apps. Most of my models end up inside an app. Used in: ✓ 7 shipped apps ✓ Flutter ✓ Swift.","summary":"Skill: App Development. Self-assessed proficiency: 78%. Evidence: 7 apps. Most of my models end up inside an app. Used in: ✓ 7 shipped apps ✓ Flutter ✓ Swift."},{"id":"meta:stats","title":"Portfolio stats","kind":"meta","text":"19 projects shipped. 1 research papers. 2 projects currently being built. Currently working on: MTech Data Science · epoch 1/4; Cachy · knowledge engine; RAG evals · reading list.","summary":"19 shipped ML & systems projects, 1 research paper under review, and 2 in active development."},{"id":"meta:contact","title":"Contact","kind":"meta","text":"How to reach Vatsal Vaghasiya: email: kvaghasiya057@gmail.com github: https://github.com/Vatsal057 linkedin: https://www.linkedin.com/in/vatsal-vaghasiya/ kaggle: https://www.kaggle.com/vatsalvaghasiya resumeUrl: resume.pdf","summary":"How to reach Vatsal Vaghasiya: email: kvaghasiya057@gmail.com github: https://github.com/Vatsal057 linkedin: https://www.linkedin.com/in/vatsal-vaghasiya/ kaggle: https://www.kaggl..."},{"id":"section:experience","title":"experience","kind":"section","text":"// professional track Experience Data Science Intern Amar Infotech – Ahmedabad, Gujarat · 01/2025 to 06/2025 Engineered data preprocessing pipelines in Python for 50k+ records, reducing inconsistencies by 35% . Trained predictive ML models (TensorFlow, scikit-learn) achieving 87% accuracy and lowering false positives by 22%. Built 5+ interactive dashboards in Power BI to track KPIs and model performance. Automated extraction workflows, reducing manual processing time by 40% . Data Science Intern iTechBrains – Ahmedabad, India · 06/2024 to 07/2024 Implemented data visualization techniques to communicate insights to stakeholders. Analyzed complex datasets using supervised and unsupervised learning techniques. Performed data extraction and manipulation using Python and SQL .","summary":"Data Science Intern at Amar Infotech (50k+ records, 87% accuracy models) and iTechBrains (data visualization, SQL, and EDA)."},{"id":"section:education","title":"education","kind":"section","text":"// academic background Education M.Tech in Data Science M.S. Ramaiah University of Applied Sciences – Bengaluru, Karnataka · Expected 2027 B.Tech in Computer Engineering SAL College of Engineering – Ahmedabad, Gujarat · 2021 to 2025 CGPA: 8.3 / 10.0 Certifications — five from IBM on Coursera. Each links to the PDF. 🏅 Python for Data Science, AI & Development IBM · Coursera 🏅 Data Science Methodology IBM · Coursera 🏅 Tools for Data Science IBM · Coursera 🏅 What is Data Science? IBM · Coursera 🏅 Python Project for Data Science IBM · Coursera","summary":"Vatsal is pursuing his M.Tech in Data Science at M.S. Ramaiah University (Bengaluru) and completed his B.Tech in Computer Engineering with an 8.3 CGPA."},{"id":"section:certifications","title":"certifications","kind":"section","text":"Certifications — five from IBM on Coursera. Each links to the PDF. 🏅 Python for Data Science, AI & Development IBM · Coursera","summary":"Certifications — five from IBM on Coursera. Each links to the PDF. 🏅 Python for Data Science, AI & Development IBM · Coursera..."},{"id":"section:principles","title":"principles","kind":"section","text":"// index cards · how I work Engineering principles Ship before perfect Small working systems beat ambitious prototypes. Cachy launched with a three-provider fallback chain because free APIs kept dropping. Measure everything If I can't evaluate it, I can't improve it. Even the skills section on this page has numbers. Understand the abstraction I write core pieces from scratch before reaching for a framework. That's how the 60-line retriever happened. Failures are artifacts Dead ends get documented. FAILURES.md ships with the repo because I keep needing it later.","summary":"Vatsal's 4 core principles: Ship before perfect, measure everything, understand the abstraction from scratch, and treat failures as artifacts."},{"id":"section:datathon","title":"datathon","kind":"section","text":"// competition · 2026 Competitions & awards 🥇 Akshara Foundation · Datathon 2026 1st Place — Karnataka Education Datathon Analysed arithmetic learning outcomes across 1.38 million Karnataka government school students. Built indices, OLS residuals, and a 7-screen Streamlit dashboard to argue the gap is skill-shaped, not geography-shaped. Python · pandas · scipy · plotly · Streamlit · 1.38M records view → 1st place award ceremony, Karnataka Education Datathon 2026 view →","summary":"Vatsal won 1st Place at the Karnataka Education Datathon (Akshara Foundation) out of 100+ teams, analyzing learning outcomes across 1.38M students."},{"id":"section:timeline","title":"timeline","kind":"section","text":"// git log --journey Commit history a1f2021 Oct 2021 init: B.Tech Computer Engineering @ SAL College of Engineering b3c4d55 2023 feat: Python + OpenCV, first computer vision experiments c8d9e03 Jun 2024 feat: Data Science Intern @ iTechBrains c7e8f01 2024 feat: AirSwipe, gesture control, first real users c9a8b71 Jan 2025 feat: Data Science Intern @ Amar Infotech d9a0b12 Apr 2025 release: B.Tech complete 🎓 f5e6a78 Nov 2025 checkout -b mtech: Data Science @ Ramaiah University of Applied Sciences e2c3d44 Feb 2026 feat: paper submitted (LLM Preference Classification, first author) b9c0d12 Aug 2026 feat: won 1st prize @ Karnataka Education Datathon 🏆 HEAD now training… ← you are here","summary":"// git log --journey Commit history a1f2021 Oct 2021 init: B.Tech Computer Engineering @ SAL College of Engineering b3c4d55 2023 feat: Python + OpenCV, first computer vision experi..."},{"id":"section:value","title":"value","kind":"section","text":"// the short version What I bring on day one ✓ models that ship Notebook → Dockerized FastAPI service → drift monitoring. Already done end to end for the IPL pipeline: three services, PSI checks every five minutes. ✓ RAG from scratch Retrieval, chunking, and evaluation written by hand and stress-tested, with the failure analysis published in the repo. ✓ research rigor on a budget First author on an LLM preference classification paper under review, trained entirely on free-tier GPUs. ✓ the whole product If the model needs an app around it, I build that too, in Swift, Flutter, or on the web.","summary":"// the short version What I bring on day one ✓ models that ship Notebook → Dockerized FastAPI service → drift monitoring. Already done end to end for the IPL pipeline: three servic..."}];

  const STOP_WORDS = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'it', 'its', 'he', 'his', 'him', 'me', 'my',
    'you', 'your', 'we', 'our', 'what', 'why', 'how', 'when', 'where', 'who',
    'tell', 'show', 'did', 'do', 'does', 'can', 'about', 'and', 'or', 'not', 'no',
    'this', 'that', 'there', 'from', 'as', 'any', 'some', 'please', 'explain'
  ]);

  function queryKnowledgeBase(query) {
    const q = query.trim().toLowerCase();
    const cleanWords = q.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 0);
    const terms = cleanWords.filter(t => t.length > 1 && !STOP_WORDS.has(t));

    // Conversational Intent Matching
    if (/^(tour|walkthrough|guide|show me around)/i.test(q)) {
      return { type: 'tour', reply: "Starting the lab tour! Following highlights from projects down to contact." };
    }
    if (/^run train|^train|training loop/i.test(q)) {
      return { type: 'train', reply: "Starting training loop! Computing cross-entropy loss across epochs..." };
    }
    if (/^(hi|hello|hey|sup|howdy|greetings)/i.test(q)) {
      return { reply: "Hey there! I'm Vatsal's lab guide. Ask me anything about his 19 projects, research paper, Datathon win, or skills!" };
    }
    if (/who (are you\b|is this)|what (is this site|are you\b)|introduce yourself/i.test(q)) {
      return { reply: "I'm Vatsal's AI lab assistant! Vatsal is an AI engineer in training doing MTech Data Science in Bengaluru. He builds ML systems end to end and has shipped 19 projects and 1 research paper." };
    }
    if (/who is vatsal|about vatsal|tell me about vatsal|bio|background|who is he/i.test(q)) {
      return { reply: "Vatsal Vaghasiya is an AI engineer pursuing his M.Tech in Data Science at M.S. Ramaiah University. He builds production ML systems, CV gesture interfaces, and RAG pipelines." };
    }
    if (/skills|tech stack|technologies|languages|proficiency/i.test(q)) {
      return { reply: "Vatsal's core stack: Python (90%), PyTorch (82%), Computer Vision (80%), MLOps with Docker & FastAPI (70%), SQL & Data Wrangling (72%), and Swift / Flutter (78%)." };
    }
    if (/all projects|what projects|list projects|what did (you|he) build|portfolio/i.test(q)) {
      return { reply: "19 projects shipped! Highlights include Cachy (knowledge engine), Constitution RAG (from scratch), IPL MLOps (drift monitor), AirSwipe (CV gesture control), and 5 native macOS utilities." };
    }
    if (/samvidhan|constitution|why no langchain|langchain|rag/i.test(q)) {
      return { reply: "For Constitution of India RAG, Vatsal hand-wrote the entire retrieval and prompt pipeline in ~60 lines of zero-framework Python — no LangChain. 78% accuracy with all-MiniLM-L6-v2 and ChromaDB." };
    }
    if (/cachy/i.test(q)) {
      return { reply: "Cachy turns Reels and articles into structured knowledge graph cards with Whisper audio transcription, OpenCV OCR, and a resilient 3-provider LLM fallback (Gemini → Cerebras → Groq)." };
    }
    if (/paper|research|deberta|preference|lmsys|publication/i.test(q)) {
      return { reply: "Under-review paper: Efficient LLM Preference Classification. A 71.3M parameter Siamese DeBERTa model predicting human chatbot preference (127× smaller than 9B winning Kaggle models), trained on free T4s." };
    }
    if (/datathon|akshara|award|competition|1st prize|first prize/i.test(q)) {
      return { reply: "1st Place at Karnataka Education Datathon 2026 (Akshara Foundation)! Analysed learning outcomes across 1.38M students and built a 7-screen Streamlit dashboard arguing the learning gap is skill-shaped." };
    }
    if (/ipl|mlops|drift|psi/i.test(q)) {
      return { reply: "IPL Match Predictor runs 3 Docker Compose services (FastAPI + XGBoost + Streamlit) sharing a volume, recalculating Population Stability Index (PSI) every 5 minutes to detect model drift live." };
    }
    if (/airswipe|gesture|presentation/i.test(q)) {
      return { reply: "AirSwipe controls PowerPoint presentations hands-free through a standard webcam using MediaPipe landmark tracking, distance-ratio finger detection, and OpenCV overlays." };
    }
    if (/mac app|insomniac|glide|dimmer|lull|photowidget/i.test(q)) {
      return { reply: "Vatsal built 5 native macOS utilities in Swift & SwiftUI: Insomniac (lid-closed keep-awake), Glide (trackpad gestures via IOKit), Dimmer, PhotoWidget, and Lull (Background Sounds menu bar remote)." };
    }
    if (/experience|internship|amar infotech|itechbrains|work/i.test(q)) {
      return { reply: "Data Science Intern at Amar Infotech (Jan–Jun 2025: preprocessed 50k+ records, trained 87% accuracy models) and iTechBrains (Jun–Jul 2024: SQL extraction, EDA, and dashboards)." };
    }
    if (/education|college|degree|mtech|btech|university|ramaiah|sal/i.test(q)) {
      return { reply: "Pursuing M.Tech in Data Science at M.S. Ramaiah University (Expected 2027, Bengaluru). Completed B.Tech in Computer Engineering at SAL College of Engineering with 8.3 CGPA." };
    }
    if (/principles|philosophy|how (do you|does he) work|ship before perfect/i.test(q)) {
      return { reply: "Vatsal's 4 core principles: 1) Ship before perfect. 2) Measure everything. 3) Understand the abstraction from scratch. 4) Failures are artifacts (ships with FAILURES.md)." };
    }
    if (/contact|email|reach|hire|message|touch|linkedin|github|resume/i.test(q)) {
      return { reply: "Reach Vatsal directly at kvaghasiya057@gmail.com, GitHub (github.com/Vatsal057), or LinkedIn (linkedin.com/in/vatsal-vaghasiya). Resume PDF is downloadable on page!" };
    }

    // High-precision keyword matching across all 41 KB items
    let bestChunk = null;
    let bestScore = -1;

    for (const c of KB) {
      let score = 0;
      const titleLower = c.title.toLowerCase();
      const textLower = c.text.toLowerCase();
      const summaryLower = (c.summary || '').toLowerCase();

      for (const t of terms) {
        // Exact whole-word in title gets top weight
        const titleRegex = new RegExp(`\\b${t}\\b`, 'i');
        if (titleRegex.test(titleLower)) score += 30;
        else if (titleLower.includes(t)) score += 15;

        // Matches in summary
        if (summaryLower.includes(t)) score += 8;

        // Matches in body text
        if (textLower.includes(t)) score += 2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestChunk = c;
      }
    }

    if (bestScore >= 8 && bestChunk) {
      return {
        reply: bestChunk.summary || bestChunk.text.slice(0, 220),
        title: bestChunk.title,
        id: bestChunk.id
      };
    }

    return {
      reply: "Vatsal builds ML systems, RAG pipelines, and native apps. Ask about Cachy, the DeBERTa paper, Karnataka Datathon, his tech stack, or contact info!"
    };
  }

  // ── Sections & spots to visit ──────────────────────────────────────────
  const HOME_SECTIONS = [
    {
      key: "hero",
      sel: ".hero",
      spots: [
        { sel: ".hero-photo img", mode: "on" },
        { sel: ".hero-photo", mode: "on" },
      ],
    },
    {
      key: "projects",
      sel: "#projects",
      greet: "section_projects",
      spots: [
        { sel: "#projects .card", mode: "on" },
      ],
    },
    {
      key: "datathon",
      sel: "#datathon",
      greet: "section_datathon",
      spots: [
        { sel: "#datathon .award-figure", mode: "on" },
        { sel: "#datathon .award-card", mode: "on" },
      ],
    },
    {
      key: "research",
      sel: "#research",
      greet: "section_research",
      spots: [
        { sel: "#research .paper-sheet", mode: "on" },
        { sel: "#research .paper-card", mode: "on" },
      ],
    },
    {
      key: "apps",
      sel: "#apps",
      greet: "section_apps",
      spots: [
        { sel: "#apps .app-window", mode: "on" },
      ],
    },
    {
      key: "principles",
      sel: "#principles",
      greet: "section_principles",
      spots: [
        { sel: "#principles .card", mode: "on" },
      ],
    },
    {
      key: "timeline",
      sel: "#timeline",
      greet: "section_timeline",
      spots: [
        { sel: "#timeline .gitlog", mode: "on" },
      ],
    },
    {
      key: "contact",
      sel: "#contact",
      greet: "section_contact",
      spots: [
        { sel: "#contactForm", mode: "on" },
        { sel: "#contact .contact-row", mode: "on" },
        { sel: "#submitBtn", mode: "on" },
      ],
    },
  ];

  const DETAIL_SECTIONS = [
    {
      key: "detail_head",
      sel: ".detail-head",
      greet: "section_detail",
      spots: [
        { sel: "#stack", mode: "on" },
      ],
    },
    {
      key: "detail_problem",
      sel: "#problemBlock",
      greet: "section_problem",
      spots: [
        { sel: "#problemBlock", mode: "on" },
      ],
    },
    {
      key: "detail_highlights",
      sel: "#highlightsBlock",
      greet: "section_highlights",
      spots: [
        { sel: "#highlightsBlock", mode: "on" },
      ],
    },
  ];

  const SECTIONS = isDetailPage() ? DETAIL_SECTIONS : HOME_SECTIONS;

  const FALLBACK = {
    hello: [
      "Welcome to Vatsal's lab notebook! 19 shipped ML & systems projects.",
      "Hey! Drag me onto any card to inspect it, or ask me anything.",
    ],
    section_projects: [
      "Every experiment runs on real data. No boilerplate tutorials.",
      "Notice the RAG engine? Built in ~60 lines of zero-framework code.",
    ],
    section_datathon: [
      "1st place out of 100+ teams. 10 hours of non-stop feature engineering!",
      "92.3% precision by treating data imbalance as a feature, not a bug.",
    ],
    section_research: [
      "Siamese DeBERTa preference classifier — 127× fewer parameters, trained on free GPUs.",
      "Paper is under review. You can read the actual PDF right here.",
    ],
    section_apps: [
      "Five native macOS apps. Pure Swift & AppKit, zero electron bloat.",
      "Built for personal workflows first, then packaged for macOS.",
    ],
    section_principles: [
      "Four index cards: why failures are logged as first-class citizens.",
      "Rule 1: If it can fail silently, it will. Log every edge case.",
    ],
    section_timeline: [
      "Four years in a single git log. Every milestone verifiable.",
      "From B.Tech to MTech Data Science and shipped research.",
    ],
    section_contact: [
      "End of the notebook! Reach Vatsal at kvaghasiya057@gmail.com.",
      "Got an AI challenge or team role? Drop him an email.",
    ],
    section_detail: ["Deep dive mode! Here is the architecture and lessons learned."],
    section_problem: ["The hard part is never the happy path — it's the edge cases."],
    section_highlights: ["Key breakthroughs from this experiment."],
    tap: [
      "Ask me anything below, or drag me onto any project card!",
      "Curious about the RAG pipeline or research paper? Just ask!",
      "I know all 19 projects and architectures. Fire away!",
    ],
    tickle: [
      "Whoa, easy there! Spin cycle initiated.",
      "Okay okay, full sensor recalibration complete!",
    ],
    idle: [
      "Still browsing? Ask me about the RAG engine or tap 'tour'.",
      "Drag me onto any project card to check its architecture!",
    ],
    wake: ["Systems online! Where to next?"],
    scroll_fast: ["Whoa, speed reader! Slow down or you'll miss the benchmarks."],
    welcome_back: ["Welcome back to the lab!"],
  };

  // ── Procedural Canvas Mascot Drawing ─────────────────────────────────
  const TAU = Math.PI * 2;
  const SAGE = "#8FA98F";
  const SAGE_DEEP = "#53735D";
  const INK = "#1A242B";
  const glow = (a) => `rgba(143, 169, 143, ${a})`;

  function drawMascot(ctx, R, o) {
    const t = o.t;
    ctx.save();

    const g0 = ctx.createRadialGradient(0, R * 0.3, 0, 0, R * 0.3, R * 2.3);
    g0.addColorStop(0, glow(0.18 + 0.14 * o.glow));
    g0.addColorStop(1, glow(0));
    ctx.fillStyle = g0;
    ctx.fillRect(-R * 2.4, -R * 2.2, R * 4.8, R * 4.8);

    ctx.translate(0, R);
    ctx.scale(o.sx, o.sy);
    ctx.translate(0, -R);
    const sway = Math.sin(t * 2.6) * R * 0.06;

    const armAngle = (side) => {
      const base = side > 0 ? 0.95 : Math.PI - 0.95;
      switch (o.arm) {
        case "up":
          return side > 0
            ? -1.1 + Math.sin(t * 10) * 0.14
            : Math.PI + 1.1 - Math.sin(t * 10) * 0.14;
        case "wave":
          return side > 0 ? -1.25 + Math.sin(t * 11) * 0.45 : base;
        case "clap":
          return side > 0 ? 2.2 + Math.sin(t * 24) * 0.3 : Math.PI - 2.2 - Math.sin(t * 24) * 0.3;
        case "chin":
          return side > 0 ? 2.74 : base;
        case "point": {
          const a = Math.atan2(o.ly, o.lx);
          return side > 0 === o.lx >= 0 ? a : base;
        }
        default:
          return base + Math.sin(t * 2 + side) * 0.08;
      }
    };

    const armLength = (side) =>
      R * (o.arm === "point" && side > 0 === o.lx >= 0 ? 0.8 : o.arm === "chin" && side > 0 ? 0.72 : 0.55);
    const inFront = (side) => o.arm === "clap" || (o.arm === "chin" && side > 0);

    const drawArm = (side) => {
      const a = armAngle(side),
        sx = side * R * 0.8,
        sy = R * 0.12,
        len = armLength(side);
      const hx = sx + Math.cos(a) * len,
        hy = sy + Math.sin(a) * len;

      ctx.strokeStyle = SAGE_DEEP;
      ctx.lineWidth = R * 0.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      ctx.fillStyle = SAGE;
      ctx.beginPath();
      ctx.arc(hx, hy, R * 0.12, 0, TAU);
      ctx.fill();
    };

    for (const side of [-1, 1]) if (!inFront(side)) drawArm(side);

    // Antenna
    ctx.strokeStyle = SAGE_DEEP;
    ctx.lineWidth = R * 0.07;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -R * 0.9);
    ctx.quadraticCurveTo(R * 0.04 + sway, -R * 1.22, R * 0.2 + sway, -R * 1.4);
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = SAGE;
    ctx.shadowColor = glow(0.9);
    ctx.shadowBlur = R * (0.5 + 0.6 * o.glow);
    ctx.beginPath();
    ctx.arc(R * 0.2 + sway, -R * 1.43, R * (0.13 + 0.04 * o.glow), 0, TAU);
    ctx.fill();
    ctx.restore();

    // Body
    const bg = ctx.createRadialGradient(-R * 0.35, -R * 0.45, R * 0.08, 0, 0, R * 1.05);
    bg.addColorStop(0, "#F5FAF5");
    bg.addColorStop(0.35, "#C8DEC8");
    bg.addColorStop(0.75, "#8FA98F");
    bg.addColorStop(1, "#53735D");

    ctx.beginPath();
    ctx.ellipse(0, 0, R, R, 0, 0, TAU);
    ctx.fillStyle = bg;
    ctx.fill();

    ctx.strokeStyle = "rgba(40, 60, 47, 0.35)";
    ctx.lineWidth = R * 0.035;
    ctx.beginPath();
    ctx.ellipse(0, 0, R, R, 0, 0.35, Math.PI - 0.35);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.beginPath();
    ctx.ellipse(-R * 0.42, -R * 0.52, R * 0.17, R * 0.09, -0.6, 0, TAU);
    ctx.fill();

    // Face
    ctx.save();
    ctx.translate(o.lx * R * 0.13, o.ly * R * 0.1 + R * 0.03);
    const ex = R * 0.3,
      ey = -R * 0.12;
    const blinkPhase = (t + 0.7) % 3.2;
    const blink = blinkPhase < 0.14 ? Math.abs(1 - blinkPhase / 0.07) : 1;
    const talking = o.talk > 0.04;
    ctx.lineCap = "round";

    const openEyes = (w, h) =>
      [-1, 1].forEach((sd) => {
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(sd * ex, ey, w, Math.max(R * 0.02, h * blink), 0, 0, TAU);
        ctx.fill();
        if (blink > 0.5) {
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.arc(sd * ex + w * 0.35, ey - h * 0.4, R * 0.045, 0, TAU);
          ctx.fill();
        }
      });

    const arcEyes = (up) =>
      [-1, 1].forEach((sd) => {
        ctx.strokeStyle = INK;
        ctx.lineWidth = R * 0.07;
        ctx.beginPath();
        if (up) ctx.arc(sd * ex, ey + R * 0.05, R * 0.1, Math.PI * 1.1, Math.PI * 1.9);
        else ctx.arc(sd * ex, ey - R * 0.04, R * 0.1, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();
      });

    const cheeks = (a = 0.5) =>
      [-1, 1].forEach((sd) => {
        ctx.fillStyle = `rgba(201, 138, 138, ${a})`;
        ctx.beginPath();
        ctx.ellipse(sd * R * 0.55, R * 0.12, R * 0.13, R * 0.075, 0, 0, TAU);
        ctx.fill();
      });

    const smile = (r = 0.16, y = 0.14) => {
      ctx.strokeStyle = INK;
      ctx.lineWidth = R * 0.06;
      ctx.beginPath();
      ctx.arc(0, R * y, R * r, 0.25 * Math.PI, 0.75 * Math.PI);
      ctx.stroke();
    };

    const talkMouth = (w = 0.14) => {
      const h = R * (0.035 + 0.13 * o.talk);
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(0, R * 0.25, R * w, h, 0, 0, TAU);
      ctx.fill();
      if (o.talk > 0.3) {
        ctx.fillStyle = "#C98A8A";
        ctx.beginPath();
        ctx.ellipse(0, R * 0.25 + h * 0.45, R * w * 0.55, h * 0.4, 0, 0, TAU);
        ctx.fill();
      }
    };

    switch (o.mood) {
      case "wow":
        openEyes(R * 0.14, R * 0.19);
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(0, R * 0.28, R * 0.09, R * 0.12 * (talking ? 0.7 + 0.6 * o.talk : 1), 0, 0, TAU);
        ctx.fill();
        cheeks(0.4);
        break;
      case "excited":
        arcEyes(true);
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(0, R * 0.22, R * 0.2, R * 0.17 * (talking ? 0.55 + 0.6 * o.talk : 1), 0, 0, Math.PI);
        ctx.fill();
        cheeks(0.65);
        break;
      case "worried":
      case "scared": {
        [-1, 1].forEach((sd) => {
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.arc(sd * ex, ey, R * 0.14, 0, TAU);
          ctx.fill();
          ctx.fillStyle = INK;
          ctx.beginPath();
          ctx.arc(sd * ex + o.lx * R * 0.04, ey + o.ly * R * 0.04, R * 0.07, 0, TAU);
          ctx.fill();
        });
        if (talking) talkMouth(0.1);
        else smile(0.14, 0.28);
        break;
      }
      case "dizzy":
        [-1, 1].forEach((sd) => {
          ctx.strokeStyle = INK;
          ctx.lineWidth = R * 0.045;
          ctx.beginPath();
          for (let k = 0; k < 40; k++) {
            const a = (k / 40) * TAU * 2 + t * 8 * sd,
              rr = R * 0.015 + (k / 40) * R * 0.14;
            const px = sd * ex + Math.cos(a) * rr,
              py = ey + Math.sin(a) * rr;
            k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          }
          ctx.stroke();
        });
        if (talking) talkMouth(0.11);
        break;
      case "think":
        openEyes(R * 0.1, R * 0.15);
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(R * 0.12, R * 0.27, R * 0.05, R * 0.045, 0, 0, TAU);
        ctx.fill();
        cheeks(0.35);
        break;
      case "love":
        arcEyes(true);
        if (talking) talkMouth(0.13);
        else smile(0.2, 0.12);
        cheeks(0.85);
        break;
      case "sleep":
        arcEyes(false);
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(0, R * 0.27, R * 0.05 * (1 + 0.3 * Math.sin(t * 2)), R * 0.06, 0, 0, TAU);
        ctx.fill();
        cheeks(0.35);
        break;
      case "calm":
        arcEyes(false);
        if (talking) talkMouth(0.11);
        else smile(0.14, 0.16);
        cheeks(0.45);
        break;
      default:
        openEyes(R * 0.11, R * 0.16);
        if (talking) talkMouth();
        else smile();
        cheeks(0.5);
    }
    ctx.restore();

    for (const side of [-1, 1]) if (inFront(side)) drawArm(side);
    ctx.restore();
  }

  function drawParticles(ctx, R, list, now) {
    for (const p of list) {
      const q = (now - p.born) / p.life;
      if (q < 0 || q > 1) continue;
      const a = q < 0.15 ? q / 0.15 : 1 - (q - 0.15) / 0.85;
      ctx.save();
      ctx.globalAlpha = Math.max(0, a);
      const x = p.x + p.vx * q * R,
        y = p.y + p.vy * q * R;

      if (p.type === "heart") {
        const s = (R / 30) * (0.9 + 0.3 * Math.sin(q * 9));
        ctx.translate(x + Math.sin(q * 8) * R * 0.08, y);
        ctx.scale(s, s);
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.bezierCurveTo(-7, -2, -4, -9, 0, -5);
        ctx.bezierCurveTo(4, -9, 7, -2, 0, 4);
        ctx.fillStyle = "#C98A8A";
        ctx.fill();
      } else if (p.type === "z") {
        ctx.fillStyle = "#8FA98F";
        ctx.font = `700 ${Math.round(R * (0.32 + 0.18 * q))}px system-ui, sans-serif`;
        ctx.fillText("z", x, y);
      } else {
        const s = R * 0.09 * (1 - q * 0.5);
        ctx.translate(x, y);
        ctx.rotate(q * 3);
        ctx.fillStyle = p.color || SAGE;
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const rr = k % 2 ? s * 0.35 : s;
          const ang = (k / 8) * TAU;
          k ? ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr) : ctx.moveTo(rr, 0);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // ── Guide Orchestrator ────────────────────────────────────────────────
  function start() {
    if (document.querySelector(".mascot")) return;

    const root = document.createElement("div");
    root.className = "mascot";
    root.innerHTML =
      '<canvas aria-hidden="true"></canvas>' +
      '<button class="mascot__hit" type="button" aria-label="Drag or talk to the lab guide"></button>' +
      '<button class="mascot__hide" type="button" aria-label="Hide the lab guide" title="Hide mascot">✕</button>' +
      '<button class="mascot__wake mono" type="button" aria-label="Wake up lab guide" title="Click to summon mascot">▲ wake guide</button>';

    const thought = document.createElement("div");
    thought.className = "thought";
    thought.innerHTML =
      '<div class="thought__body">' +
      '<button type="button" class="thought__close" aria-label="Close thoughts" title="Close">✕</button>' +
      '<span class="thought__dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="thought__text" aria-hidden="true"><span class="on"></span><span class="off"></span></span>' +
      '<button class="thought__act" type="button" hidden></button>' +
      '<div class="thought__chips">' +
      '<button type="button" class="thought__chip" data-q="tour">tour</button>' +
      '<button type="button" class="thought__chip" data-q="projects">projects</button>' +
      '<button type="button" class="thought__chip" data-q="cachy">cachy</button>' +
      '<button type="button" class="thought__chip" data-q="paper">paper</button>' +
      '<button type="button" class="thought__chip" data-q="datathon">datathon</button>' +
      '<button type="button" class="thought__chip" data-q="skills">skills</button>' +
      '<button type="button" class="thought__chip" data-q="contact">contact</button>' +
      '</div>' +
      '<form class="thought__ask">' +
      '<input type="text" class="thought__input" placeholder="Ask about this repo..." enterkeyhint="send" />' +
      '<button type="submit" class="thought__send" aria-label="Send">↑</button>' +
      '</form>' +
      '</div>' +
      '<i class="thought__puff p1" aria-hidden="true"></i>' +
      '<i class="thought__puff p2" aria-hidden="true"></i>';

    const live = document.createElement("p");
    live.className = "mascot-live";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");

    document.body.append(thought, root, live);

    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const hit = root.querySelector(".mascot__hit");
    const hideBtn = root.querySelector(".mascot__hide");
    const wakeBtn = root.querySelector(".mascot__wake");
    const bubble = thought.querySelector(".thought__body");
    const textOn = thought.querySelector(".thought__text .on");
    const textOff = thought.querySelector(".thought__text .off");
    const act = thought.querySelector(".thought__act");
    const puff1 = thought.querySelector(".p1");
    const puff2 = thought.querySelector(".p2");
    const askForm = thought.querySelector(".thought__ask");
    const askInput = thought.querySelector(".thought__input");

    let R = 30, S = 162, dpr = 1;
    let bw = 0, bh = 0;
    let hidden = false;

    const measureBubble = () => {
      bw = bubble.offsetWidth || 275;
      bh = bubble.offsetHeight || 130;
    };

    const layout = () => {
      R = isPhone() ? 21 : 30;
      S = Math.round(R * 5.4);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(S * dpr);
      canvas.height = Math.round(S * dpr);
      canvas.style.width = canvas.style.height = S + "px";
      root.style.width = root.style.height = S + "px";

      const cy = S / 2 + R * 0.4;
      if (hidden) {
        Object.assign(hit.style, {
          left: S / 2 - R * 1.5 + "px",
          top: cy - R * 2.8 + "px",
          width: R * 3 + "px",
          height: R * 3.2 + "px",
        });
      } else {
        Object.assign(hit.style, {
          left: S / 2 - R * 1.1 + "px",
          top: cy - R * 1.1 + "px",
          width: R * 2.2 + "px",
          height: R * 2.2 + "px",
        });
      }
      Object.assign(hideBtn.style, { left: S / 2 + R * 0.75 + "px", top: cy - R * 1.65 + "px" });
      measureBubble();
    };

    layout();
    addEventListener("resize", layout, { passive: true });

    // ── State ──
    let pos = { x: innerWidth - R * 3, y: innerHeight - R * 4 };
    let hop = null, landAt = -1e9, shakeAt = -1e9, bounceAt = -1e9;
    let look = { x: -0.4, y: 0.1 };
    let glance = null;
    let mood = "happy", arm = null, moodUntil = 0, baseMood = "happy";
    let typing = false, talkAmp = 0;
    let thinking = false, bubbleShown = false, bubbleHover = false;
    let particles = [];
    let cursor = { x: -1e4, y: -1e4, at: -1e9 };
    let sectionIndex = 0;
    let spot = null, spotSince = 0, spotLookEl = null;
    let override = null;
    let emailFocus = null;
    let lastActivity = performance.now(),
      sleeping = false,
      wokeOnce = false,
      idleNudges = 0,
      nudgedAt = 0,
      lastZ = 0,
      lastHeart = 0;

    const navSafe = () => (document.querySelector(".topbar, #topbar")?.getBoundingClientRect().bottom || 60) + 12;

    const setMood = (m, a = null, ms = 0) => {
      mood = m;
      arm = a;
      moodUntil = ms ? performance.now() + ms : 0;
    };

    // ── Spot Calculation & Pinning ──
    const rectOf = (el, text) => {
      if (text) {
        const r = document.createRange();
        r.selectNodeContents(el);
        const b = r.getBoundingClientRect();
        if (b.width) return b;
      }
      return el.getBoundingClientRect();
    };

    const SOLID_SELECTORS = [
      ".card",
      ".project-card",
      ".cardflip-inner",
      ".award-card",
      ".award-figure",
      ".paper-sheet",
      ".paper-card",
      ".app-window",
      ".terminal-box",
      ".hero-photo img",
      ".hero-photo",
      ".hero-cta a",
      ".hero-stats",
      "#contactForm",
      ".contact-form",
      ".contact-row",
      ".contact-input",
      "#submitBtn",
      ".btn",
      ".gitlog",
      ".exp-item",
      ".edu-card",
      ".pipeline"
    ];

    function getAllSolidElements() {
      const items = [];
      for (const sel of SOLID_SELECTORS) {
        document.querySelectorAll(sel).forEach((el) => {
          if (el.offsetParent !== null) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 24 && rect.height > 12) {
              items.push({ el, rect });
            }
          }
        });
      }
      return items;
    }

    function findNextElementBeneath(curX, minY) {
      const all = getAllSolidElements();
      const below = all.filter(item => {
        const r = item.rect;
        return r.top >= minY && r.top <= innerHeight - R * 1.5 && r.bottom > navSafe();
      });

      if (below.length === 0) return null;

      // 1. Elements directly under curX (horizontal raycast)
      const directlyUnder = below.filter(item => {
        const r = item.rect;
        return curX >= r.left - 30 && curX <= r.right + 30;
      });

      if (directlyUnder.length > 0) {
        directlyUnder.sort((a, b) => a.rect.top - b.rect.top);
        return directlyUnder[0];
      }

      // 2. Nearest visible element below minY
      below.sort((a, b) => {
        const distA = Math.hypot(a.rect.left + a.rect.width / 2 - curX, (a.rect.top - minY) * 1.2);
        const distB = Math.hypot(b.rect.left + b.rect.width / 2 - curX, (b.rect.top - minY) * 1.2);
        return distA - distB;
      });
      return below[0];
    }

    function findBestVisibleElement() {
      const all = getAllSolidElements();
      const visible = all.filter(item => {
        const r = item.rect;
        return r.top >= navSafe() + 10 && r.top <= innerHeight - R * 2.2 && r.bottom > navSafe();
      });
      if (visible.length === 0) return null;
      const ideal = innerHeight * 0.45;
      visible.sort((a, b) => Math.abs(a.rect.top - ideal) - Math.abs(b.rect.top - ideal));
      return visible[0];
    }

    const pointFor = (s) => {
      if (!s) return corner();
      if (s.fixed) {
        if (s.isFloor) return { x: clamp(s.x, R * 1.6, innerWidth - R * 1.6), y: innerHeight - R * 1.4 - 10 };
        return { x: s.x, y: s.y };
      }
      if (s.relX !== undefined && s.el && document.contains(s.el)) {
        const r = s.el.getBoundingClientRect();
        return { x: r.left + s.relX, y: r.top + s.relY };
      }
      // Mascot ALWAYS sits ON TOP of solid element upper edge - strictly NEVER floats
      const r = rectOf(s.el, false);
      const landX = clamp(r.left + r.width * 0.5, r.left + R * 1.5, r.right - R * 1.5);
      return { x: landX, y: r.top - R + 3 };
    };

    const yFits = (y) => y > navSafe() && y < innerHeight - R * 1.4;
    const corner = () => {
      const best = findBestVisibleElement();
      if (best) {
        const r = best.rect;
        const landX = clamp(r.left + r.width * 0.5, r.left + R * 1.5, r.right - R * 1.5);
        return { x: landX, y: r.top - R + 3 };
      }
      return { x: innerWidth - R * 2.3, y: innerHeight - R * 1.4 - 12 };
    };
    const clampCenter = (p) => ({
      x: clamp(p.x, R * 1.7 + 6, innerWidth - R * 1.7 - 6),
      y: clamp(p.y, navSafe() + R * 1.2, innerHeight - R * 1.3 - 6),
    });

    let lastScrollFallTime = 0;
    const handleElementScrolledUp = (oldEl) => {
      const now = performance.now();
      if (hop && hop.isFall) return;
      if (now - lastScrollFallTime < 320) return;

      const nextTarget = findNextElementBeneath(pos.x, navSafe() + 30);
      if (nextTarget && nextTarget.el !== oldEl) {
        lastScrollFallTime = now;
        const nextR = nextTarget.rect;
        const landX = clamp(pos.x, nextR.left + R * 1.5, nextR.right - R * 1.5);
        const landY = nextR.top - R + 3;

        startFall(now, Math.max(navSafe() + 10, pos.y), landY, landX);
        override = {
          el: nextTarget.el,
          relX: landX - nextR.left,
          relY: -R + 3,
          until: Infinity
        };
        spot = override;
      } else {
        const best = findBestVisibleElement();
        if (best && best.el !== oldEl) {
          lastScrollFallTime = now;
          const bR = best.rect;
          const landX = clamp(pos.x, bR.left + R * 1.5, bR.right - R * 1.5);
          const landY = bR.top - R + 3;
          startFall(now, Math.max(navSafe() + 10, pos.y), landY, landX);
          override = {
            el: best.el,
            relX: landX - bR.left,
            relY: -R + 3,
            until: Infinity
          };
          spot = override;
        } else {
          override = null;
        }
      }
    };

    const handleElementScrolledDown = (oldEl) => {
      const now = performance.now();
      if (hop && hop.isFall) return;
      if (now - lastScrollFallTime < 320) return;

      const best = findBestVisibleElement();
      if (best && best.el !== oldEl) {
        lastScrollFallTime = now;
        const bR = best.rect;
        const landX = clamp(pos.x, bR.left + R * 1.5, bR.right - R * 1.5);
        const landY = bR.top - R + 3;
        startFall(now, Math.min(innerHeight - 20, pos.y), landY, landX);
        override = {
          el: best.el,
          relX: landX - bR.left,
          relY: -R + 3,
          until: Infinity
        };
        spot = override;
      } else {
        override = null;
      }
    };

    let candCache = [], candAt = 0, candSection = -1;
    const candidates = (now) => {
      if (candSection !== sectionIndex || now - candAt > 1000) {
        candCache = [];
        const currentSec = SECTIONS[sectionIndex];
        if (currentSec && currentSec.spots) {
          for (const s of currentSec.spots) {
            if (s.phone === false && isPhone()) continue;
            document.querySelectorAll(s.sel).forEach((el) => {
              if (el.offsetParent !== null) candCache.push({ el, mode: s.mode, text: false });
            });
          }
        }
        candAt = now;
        candSection = sectionIndex;
      }
      return candCache;
    };

    const chooseSpot = (now) => {
      if (override && now < override.until && (override.fixed || (override.el && document.contains(override.el)))) {
        if (override.el) {
          const r = override.el.getBoundingClientRect();
          // Element went up above viewport -> detach and fall onto next object beneath it!
          if (r.bottom < navSafe() + 30 || r.top < navSafe() - 15) {
            handleElementScrolledUp(override.el);
            if (override) return override;
          } else if (r.top > innerHeight - 20) {
            handleElementScrolledDown(override.el);
            if (override) return override;
          }
        }
        return override;
      }
      override = null;
      if (emailFocus && !isPhone() && document.contains(emailFocus.el)) return emailFocus;

      const ideal = innerHeight * 0.42;
      let best = null, bestScore = Infinity, currentScore = Infinity;

      for (const c of candidates(now)) {
        const p = pointFor(c);
        if (!yFits(p.y)) continue;
        const score = Math.abs(p.y - ideal);
        if (spot && c.el === spot.el) currentScore = score;
        if (score < bestScore) {
          bestScore = score;
          best = c;
        }
      }
      if (spot && currentScore < Infinity && (currentScore < bestScore + 140 || now - spotSince < 900)) {
        if (spot.el && document.contains(spot.el)) {
          const sr = spot.el.getBoundingClientRect();
          if (sr.bottom < navSafe() + 30 || sr.top < navSafe() - 15) {
            handleElementScrolledUp(spot.el);
            if (override) return override;
          }
        }
        return spot;
      }
      return best;
    };

    const startHop = (now, target, height = 30) => {
      if (reduced) return;
      const dist = Math.hypot(target.x - pos.x, target.y - pos.y);
      hop = {
        fx: pos.x,
        fy: pos.y,
        t0: now,
        dur: clamp(340 + dist / 1.6, 380, 850),
        h: height,
      };
    };

    const startFall = (now, startY, landY, landX) => {
      if (reduced) {
        pos.x = landX;
        pos.y = landY;
        landAt = now;
        bounceAt = now;
        spawn("spark", 8);
        return;
      }
      const dist = Math.max(10, Math.abs(landY - startY));
      hop = {
        isFall: true,
        fx: landX,
        fy: startY,
        tx: landX,
        ty: landY,
        t0: now,
        dur: clamp(180 + dist * 0.42, 220, 500),
        h: 0,
      };
    };

    const jump = () => {
      if (!reduced) hop = { fx: pos.x, fy: pos.y, t0: performance.now(), dur: 480, h: R * 1.7 };
    };

    // ── Particles & Confetti ──
    const spawn = (type, n = 1) => {
      const now = performance.now();
      for (let i = 0; i < n; i++) {
        if (type === "heart") {
          particles.push({
            type,
            born: now + i * 120,
            life: 1300,
            x: (Math.random() - 0.5) * R,
            y: -R * 0.8,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -1.2,
          });
        } else if (type === "z") {
          particles.push({
            type,
            born: now,
            life: 2400,
            x: R * 0.5,
            y: -R * 0.95,
            vx: 0.6,
            vy: -1.1,
          });
        } else {
          const a = Math.random() * TAU;
          particles.push({
            type: "spark",
            born: now + i * 40,
            life: 900,
            x: Math.cos(a) * R * 0.9,
            y: Math.sin(a) * R * 0.9 - R * 0.2,
            vx: Math.cos(a) * 1.1,
            vy: Math.sin(a) * 1.1,
            color: i % 2 ? SAGE : "#D9A86C",
          });
        }
      }
    };

    // ── Dynamic Thought Cloud Placement with Anti-Collision & Directional Puffs ──
    const positionBubble = () => {
      if (!bubbleShown) return;
      measureBubble();

      const heroH1 = document.querySelector(".hero h1, .hero-inner h1");
      const hr = heroH1 ? heroH1.getBoundingClientRect() : null;

      const roomAbove = (pos.y - R * 1.65 - bh - 16) >= navSafe();
      let roomRight = (pos.x + R + 18 + bw) <= innerWidth - 16;
      const roomLeft = (pos.x - R - 18 - bw) >= 12;

      // ANTI-COLLISION: Never obscure the Hero Title ("Vatsal Vaghasiya")
      if (hr && roomRight) {
        const potentialRight = pos.x + R + 18;
        if (potentialRight < hr.right + 12 && (potentialRight + bw) > hr.left - 12) {
          roomRight = false;
        }
      }

      let mode = 'above';
      let left = 0, top = 0;

      if (roomAbove) {
        mode = 'above';
        top = pos.y - R * 1.65 - bh - 14;
        left = clamp(pos.x - bw / 2, 16, innerWidth - bw - 16);
      } else if (roomRight && pos.x < innerWidth * 0.55) {
        mode = 'right';
        left = pos.x + R + 18;
        top = clamp(pos.y - bh * 0.45, navSafe() + 8, innerHeight - bh - 16);
      } else if (roomLeft || pos.x >= 280) {
        mode = 'left';
        left = clamp(pos.x - R - bw - 18, 12, innerWidth - bw - 12);
        top = clamp(pos.y - bh * 0.45, navSafe() + 8, innerHeight - bh - 16);
      } else {
        mode = 'below';
        top = pos.y + R * 1.25 + 18;
        left = clamp(pos.x - bw / 2, 16, innerWidth - bw - 16);
      }

      thought.style.transform = `translate3d(${Math.round(left)}px,${Math.round(top)}px,0)`;

      // Dynamically connect puff circles linking bubble edge directly to mascot body
      if (mode === 'above') {
        const hx = clamp(pos.x - left, 24, bw - 24);
        const dist = Math.max(8, pos.y - (top + bh) - R);
        puff1.style.transform = `translate(${hx - 7}px,${bh + Math.round(dist * 0.3)}px)`;
        puff2.style.transform = `translate(${hx - 4}px,${bh + Math.round(dist * 0.72)}px)`;
      } else if (mode === 'below') {
        const hx = clamp(pos.x - left, 24, bw - 24);
        const dist = Math.max(8, top - (pos.y + R));
        puff1.style.transform = `translate(${hx - 7}px,-${Math.round(dist * 0.3) + 7}px)`;
        puff2.style.transform = `translate(${hx - 4}px,-${Math.round(dist * 0.72) + 4}px)`;
      } else if (mode === 'right') {
        const hy = clamp(pos.y - top, 20, bh - 20);
        const dist = Math.max(8, left - (pos.x + R));
        puff1.style.transform = `translate(-${Math.round(dist * 0.35) + 7}px,${hy - 6}px)`;
        puff2.style.transform = `translate(-${Math.round(dist * 0.75) + 4}px,${hy - 3}px)`;
      } else if (mode === 'left') {
        const hy = clamp(pos.y - top, 20, bh - 20);
        const dist = Math.max(8, (pos.x - R) - (left + bw));
        puff1.style.transform = `translate(${bw + Math.round(dist * 0.35)}px,${hy - 6}px)`;
        puff2.style.transform = `translate(${bw + Math.round(dist * 0.75)}px,${hy - 3}px)`;
      }
    };

    const showThinking = () => {
      thinking = true;
      bubbleShown = true;
      thought.classList.add("show", "is-thinking");
      textOn.textContent = "";
      textOff.textContent = "";
      act.hidden = true;
      measureBubble();
    };

    const hideBubble = () => {
      bubbleShown = false;
      thinking = false;
      thought.classList.remove("show", "is-thinking");
    };

    // ── Speech & Typewriter Reveal ──
    const fallbackLine = (event, opts) => {
      const f = FALLBACK[event];
      return pick(typeof f === "function" ? f(opts?.position) : f || FALLBACK.tap);
    };

    let talkToken = 0, busy = false, busyPriority = 0, pending = null;

    const stopTalking = () => {
      talkToken++;
      busy = false;
      busyPriority = 0;
      pending = null;
      typing = false;
      hideBubble();
    };

    bubble.addEventListener("pointerenter", () => { bubbleHover = true; });
    bubble.addEventListener("pointerleave", () => { bubbleHover = false; });

    const speak = async (line, token, opts = {}) => {
      thinking = false;
      thought.classList.remove("is-thinking");
      bubbleShown = true;
      thought.classList.add("show");
      live.textContent = line;
      act.hidden = true;
      textOn.textContent = "";
      textOff.textContent = line;
      measureBubble();
      setMood(opts.mood || "happy", opts.arm || null, 60000);

      if (!reduced) {
        typing = true;
        for (let i = 1; i <= line.length; i++) {
          if (token !== talkToken) {
            typing = false;
            return false;
          }
          textOn.textContent = line.slice(0, i);
          textOff.textContent = line.slice(i);
          await sleep(line[i - 1] === " " ? 16 : 24);
        }
        typing = false;
      } else {
        textOn.textContent = line;
        textOff.textContent = "";
      }

      if (opts.action) {
        act.textContent = opts.action.label;
        act.hidden = false;
        act.onclick = (e) => {
          e.stopPropagation();
          stopTalking();
          opts.action.run();
        };
        measureBubble();
      }

      let left = clamp(2400 + line.split(" ").length * 360, 4200, 9000) + (opts.action ? 3000 : 0);
      while (left > 0) {
        if (token !== talkToken) return false;
        await sleep(120);
        if (!bubbleHover && document.activeElement !== askInput) left -= 120;
      }
      if (token !== talkToken) return false;
      setMood(baseMood);
      return true;
    };

    const speakDirect = async (line, opts = {}) => {
      stopTalking();
      const token = ++talkToken;
      busy = true;
      busyPriority = opts.priority ?? 2;
      await speak(line, token, opts);
      busy = false;
      busyPriority = 0;
    };

    const talk = async (event, opts = {}) => {
      if (hidden || recruiterOn()) return;
      const priority = opts.priority ?? 1;
      if (busy && priority < busyPriority) {
        pending = [event, opts];
        return;
      }
      const token = ++talkToken;
      busy = true;
      busyPriority = priority;
      showThinking();
      if (!reduced) await sleep(420);
      if (token !== talkToken) return;

      const line = fallbackLine(event, opts);
      const done = await speak(line, token, opts);
      if (token !== talkToken || !done) return;
      busy = false;
      busyPriority = 0;
      if (pending) {
        const [e, o] = pending;
        pending = null;
        setTimeout(() => talk(e, o), 800);
      }
    };

    // ── Q&A Assistant Engine ─────────────────────────────────────────────
    const TOUR_STEPS = [
      { sel: "#projects", line: "Selected Projects desk: 19 shipped projects. Real code and evaluations." },
      { sel: "#datathon", line: "Karnataka Datathon: 1st prize out of 100+ teams for ML class imbalance engineering." },
      { sel: "#research", line: "Research Paper: Siamese DeBERTa preference classifier (under review, first author)." },
      { sel: "#apps", line: "macOS Apps: Five native utility apps built in pure Swift & SwiftUI." },
      { sel: "#principles", line: "Engineering Principles: Four index cards on logging failures and telemetry." },
      { sel: "#timeline", line: "Git Timeline: Four years of shipping compressed into one continuous commit log." },
      { sel: "#contact", line: "Contact & Inbox: Reach Vatsal at kvaghasiya057@gmail.com!" }
    ];

    const startTour = async () => {
      stopTalking();
      for (const step of TOUR_STEPS) {
        const el = document.querySelector(step.sel);
        if (el) {
          el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
          override = { el, mode: "right", until: performance.now() + 8000 };
          spot = override;
          speakDirect(step.line, { mood: "happy", arm: "point" });
          await sleep(3800);
        }
      }
      speakDirect("Tour complete! Drag me onto any card or ask me anything.", { mood: "happy", arm: "wave" });
    };

    const CHAT_ENDPOINT = "https://portfolio-companion.vatxzz.workers.dev/chat";
    const MAX_TURNS = 10;
    let chatHistory = [];

    async function handleAsk(query) {
      if (!query || !query.trim()) return;
      const q = query.trim();

      // Check special interactive commands
      if (/^(tour|guide|walkthrough|show me around)/i.test(q)) {
        startTour();
        return;
      }
      if (/^(train|run train|benchmark)/i.test(q)) {
        setMood("excited", "clap", 3000);
        spawn("spark", 10);
        const trainBtn = document.querySelector("#runTrain, [data-action='train']");
        if (trainBtn) trainBtn.click();
        speakDirect("Triggering on-device model training benchmark!", { mood: "excited", arm: "clap" });
        return;
      }

      showThinking();
      setMood("think", "chin", 60000);

      chatHistory.push({ role: "user", content: q });
      if (chatHistory.length > MAX_TURNS) chatHistory = chatHistory.slice(-MAX_TURNS);

      let answerText = null;
      try {
        const pageSlug = (new URLSearchParams(location.search).get("id") || "")
          .toLowerCase().replace(/[^a-z0-9-]/g, "");

        const res = await fetch(CHAT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pageSlug 
            ? { messages: chatHistory, slug: pageSlug } 
            : { messages: chatHistory }),
          signal: AbortSignal.timeout(8000)
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.reply && data.reply.trim()) {
            answerText = data.reply.trim();
            chatHistory.push({ role: "assistant", content: answerText });
          }
        }
      } catch (err) {
        console.warn("[companion] remote AI endpoint failed, falling back to offline KB:", err);
      }

      // If remote failed, timed out, or returned empty, drop user turn and fallback to offline KB
      if (!answerText) {
        chatHistory.pop();
        if (!reduced) await sleep(200);
        const result = queryKnowledgeBase(q);
        answerText = result.reply;
      }

      speakDirect(answerText, { mood: "happy", arm: "wave" });
    }

    // Connect chips & ask input
    thought.querySelectorAll(".thought__chip").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleAsk(btn.dataset.q);
      });
    });

    askForm.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const val = askInput.value.trim();
      if (val) {
        askInput.value = "";
        handleAsk(val);
      }
    });

    thought.addEventListener("click", (e) => {
      if (e.target.closest(".thought__ask, .thought__chip, .thought__act, .thought__close")) return;
      stopTalking();
    });

    thought.querySelector(".thought__close")?.addEventListener("click", (e) => {
      e.stopPropagation();
      stopTalking();
    });

    // ── Drag & Drop True Downward Gravity Fall Engine ───────────────────
    let isDragging = false;
    let didDrag = false;
    let dragStart = { x: 0, y: 0 };
    let dragPointerId = null;

    const unhideMascot = () => {
      if (!hidden) return;
      hidden = false;
      session.set(HIDE_KEY, "0");
      root.classList.remove("is-peeking");
      layout();
      setMood("wow", null, 1200);
      override = null;

      const best = findBestVisibleElement();
      if (best) {
        const r = best.rect;
        const landX = clamp(r.left + r.width * 0.5, r.left + R * 1.5, r.right - R * 1.5);
        const landY = r.top - R + 3;
        startFall(performance.now(), innerHeight - 20, landY, landX);
        override = {
          el: best.el,
          relX: landX - r.left,
          relY: -R + 3,
          until: Infinity,
        };
        spot = override;
      } else {
        startHop(performance.now(), corner());
      }

      spawn("spark", 8);
      setTimeout(() => {
        speakDirect("I'm back! Ask me anything or drag me onto a card.", { mood: "happy", arm: "wave" });
      }, 350);
    };

    window.wakeMascot = unhideMascot;

    hit.addEventListener("pointerdown", (e) => {
      activity();
      if (hidden) {
        e.stopPropagation();
        unhideMascot();
        return;
      }
      dragStart = { x: e.clientX, y: e.clientY };
      didDrag = false;
      dragPointerId = e.pointerId;
      try { hit.setPointerCapture(e.pointerId); } catch {}
    });

    wakeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      unhideMascot();
    });

    root.addEventListener("click", (e) => {
      if (hidden) {
        e.stopPropagation();
        unhideMascot();
      }
    });

    const onPointerMove = (e) => {
      if (dragPointerId === null) return;
      const dist = Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y);
      if (!isDragging && dist > 5) {
        isDragging = true;
        didDrag = true;
        root.classList.add("is-dragging");
        stopTalking();
        hop = null;
        setMood("wow", "up", 30000);
      }
      if (isDragging) {
        pos.x = clamp(e.clientX, R * 1.5, innerWidth - R * 1.5);
        pos.y = clamp(e.clientY, navSafe() + R * 1.2, innerHeight - R * 1.2);
        activity();
      }
    };

    function findTargetUnderDrop(dropX, dropY) {
      const elements = getAllSolidElements();

      // 1. Direct hit: drop point inside element bounding box
      const direct = elements.filter(item => {
        const r = item.rect;
        return dropX >= r.left - 10 && dropX <= r.right + 10 && dropY >= r.top - 10 && dropY <= r.bottom + 10;
      });
      if (direct.length > 0) {
        direct.sort((a, b) => (a.rect.width * a.rect.height) - (b.rect.width * b.rect.height));
        return direct[0];
      }

      // 2. Downward Gravity Raycast: find element directly below dropX
      // Horizontal margin: within element left/right boundaries (+ small 16px tolerance)
      // Vertical margin: element top must be beneath dropY
      const below = elements.filter(item => {
        const r = item.rect;
        return dropX >= r.left - 16 && dropX <= r.right + 16 && r.top >= dropY - 20;
      });
      if (below.length > 0) {
        // Pick the element whose top edge is closest below dropY
        below.sort((a, b) => a.rect.top - b.rect.top);
        return below[0];
      }

      // 3. No elements directly underneath: fall straight to the bottom floor
      return null;
    }

    const handleTap = () => {
      activity();
      if (hidden) {
        unhideMascot();
        return;
      }

      jump();
      spawn("heart", 2);

      const greetings = [
        "Ask me anything below, or drag me onto any project card!",
        "Need a quick walkthrough? Tap 'tour' below or ask any question.",
        "Curious about the RAG pipeline or the research paper? Just ask!",
        "I know all 19 projects and architectures. Fire away!",
      ];
      speakDirect(pick(greetings), { mood: "happy", arm: "wave" });
      setTimeout(() => {
        try { askInput.focus(); } catch {}
      }, 100);
    };

    const finishDrag = (e) => {
      if (dragPointerId === null) return;
      try { hit.releasePointerCapture(dragPointerId); } catch {}
      dragPointerId = null;
      root.classList.remove("is-dragging");

      if (didDrag) {
        isDragging = false;
        const dropX = clamp(e.clientX, 16, innerWidth - 16);
        const dropY = clamp(e.clientY, navSafe(), innerHeight - 16);

        const target = findTargetUnderDrop(dropX, dropY);
        let landingX = dropX;
        let landingY = innerHeight - R * 1.4 - 10;
        let targetEl = null;

        if (target) {
          targetEl = target.el;
          const r = target.rect;
          // Land on top edge of this element AT THE EXACT X WHERE DROPPED
          landingX = clamp(dropX, r.left + R * 1.2, r.right - R * 1.2);
          landingY = r.top + 3 - R;

          // Lock permanently onto this element!
          override = {
            el: targetEl,
            relX: landingX - r.left,
            relY: -R + 3,
            until: Infinity,
          };
          spot = override;
          spotSince = performance.now();
        } else {
          // If no element below, fall straight down to floor at dropX (NEVER snaps to screen right edge)
          landingX = clamp(dropX, R * 1.6, innerWidth - R * 1.6);
          landingY = innerHeight - R * 1.4 - 10;
          override = {
            fixed: true,
            isFloor: true,
            x: landingX,
            y: landingY,
            until: Infinity,
          };
          spot = override;
          spotSince = performance.now();
        }

        // True gravity fall: accelerated straight drop from pos.y to landingY
        startFall(performance.now(), pos.y, landingY, landingX);
        setMood("happy", null, 1500);

        setTimeout(() => {
          if (targetEl) {
            const isCard = targetEl.closest(".card");
            const isPaper = targetEl.closest("#research, .paper-sheet");
            const isDatathon = targetEl.closest("#datathon, .award-card, .award-figure");
            const isApps = targetEl.closest("#apps, .app-window");
            const isContact = targetEl.closest("#contact, .contact-row");

            let line = "Nice landing spot!";
            let action = null;
            if (isCard) {
              const cardTitle = targetEl.querySelector("h3")?.textContent?.trim() || "this project";
              line = `Landed on ${cardTitle}! Real code, real dataset.`;
            } else if (isPaper) {
              line = "Sitting right on the LLM preference research paper!";
              action = { label: "Read paper PDF", run: () => document.querySelector(".paper-actions a")?.click() };
            } else if (isDatathon) {
              line = "Landed on the Karnataka Datathon 1st prize trophy!";
            } else if (isApps) {
              line = "Perched on native macOS apps. Built with Swift & AppKit.";
            } else if (isContact) {
              line = "Right by the mailbox. Say hi: kvaghasiya057@gmail.com";
            }
            speakDirect(line, { mood: "happy", arm: "wave", action });
          } else {
            speakDirect("Landed on the floor! Drag me onto any card above.", { mood: "happy" });
          }
        }, 340);
        return;
      }

      handleTap();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    hideBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      hidden = true;
      session.set(HIDE_KEY, "1");
      stopTalking();
      root.classList.add("is-peeking");
      layout();
    });

    // ── Sections: Greet each one as visited ──
    const sectionEls = SECTIONS.map((s) => document.querySelector(s.sel));
    const greeted = new Set(["hero"]);
    let greetTimer = 0;

    const scrollToSection = (sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    };

    const band = new IntersectionObserver(
      (entries) => {
        const hits = entries.filter((e) => e.isIntersecting).map((e) => sectionEls.indexOf(e.target));
        if (!hits.length) return;
        const i = Math.max(...hits);
        if (i === sectionIndex) return;
        sectionIndex = i;
        const sec = SECTIONS[i];
        clearTimeout(greetTimer);
        if (greeted.has(sec.key)) return;
        greetTimer = setTimeout(() => {
          if (sectionIndex !== i || greeted.has(sec.key)) return;
          greeted.add(sec.key);
          talk(sec.greet, {
            priority: 1,
            mood: "happy",
            arm: "point",
            when: () => sectionIndex === i,
          });
        }, 700);
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sectionEls.forEach((el) => el && band.observe(el));

    // ── Activity, Sleep and Idle Reactions ──
    const activity = () => {
      lastActivity = performance.now();
      if (sleeping) {
        sleeping = false;
        baseMood = "happy";
        setMood("wow", null, 900);
        bounceAt = performance.now();
        if (!wokeOnce) {
          wokeOnce = true;
          setTimeout(() => talk("wake", { priority: 1, mood: "happy", arm: "wave" }), 500);
        }
      }
    };

    setInterval(() => {
      const now = performance.now(),
        idle = now - lastActivity;
      if (document.hidden || hidden || isDragging) return;
      if (!sleeping && idle > SLEEP_MS && !busy) {
        sleeping = true;
        baseMood = "sleep";
        setMood("sleep");
      } else if (!sleeping && idle > IDLE_NUDGE_MS && !busy && idleNudges < 2 && now - nudgedAt > IDLE_NUDGE_MS) {
        idleNudges++;
        nudgedAt = now;
        talk("idle", {
          priority: 1,
          mood: "happy",
          arm: "wave",
          action: { label: "Explore experiments", run: () => scrollToSection("#projects") },
        });
      }
    }, 1000);

    // ── Pointer Tracking & Scrolling ──
    addEventListener("pointermove", (e) => {
      cursor = { x: e.clientX, y: e.clientY, at: performance.now() };
      activity();
    }, { passive: true });

    ["keydown", "touchstart", "wheel"].forEach((t) =>
      addEventListener(t, activity, { passive: true })
    );

    let lastY = scrollY, lastT = performance.now(), dizzyAt = 0, fastOnce = false, scrollFrame = 0;
    addEventListener("scroll", () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const now = performance.now(),
          dy = scrollY - lastY,
          speed = Math.abs(dy) / Math.max(1, now - lastT);
        lastY = scrollY;
        lastT = now;
        activity();
        if (Math.abs(dy) > 1) glance = { y: dy > 0 ? 0.9 : -0.8, until: now + 380 };
        if (speed > 4.5 && now - dizzyAt > 3000 && !busy) {
          dizzyAt = now;
          setMood("dizzy", null, 1100);
          if (!fastOnce) {
            fastOnce = true;
            setTimeout(() => talk("scroll_fast", { priority: 1, mood: "wow" }), 600);
          }
        }

        if (!isDragging) {
          const curEl = override?.el || spot?.el;
          if (curEl && document.contains(curEl)) {
            const r = curEl.getBoundingClientRect();
            if (r.bottom < navSafe() + 30 || r.top < navSafe() - 15) {
              handleElementScrolledUp(curEl);
            } else if (r.top > innerHeight - 20) {
              handleElementScrolledDown(curEl);
            }
          }
        }
      });
    }, { passive: true });

    // ── Animation Frame Loop: Move, Look, Render ─────────────────────────
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      // Position update
      let target;
      if (hidden) {
        const peekHover = finePointer && cursor.x > innerWidth - R * 4 && cursor.y > innerHeight - R * 3 && now - cursor.at < 3000;
        target = { x: innerWidth - R * 2.6, y: peekHover ? innerHeight - R * 0.75 : innerHeight - R * 0.35 };
      } else if (isDragging) {
        target = pos;
      } else {
        const s = chooseSpot(now);
        if ((s && s.el) !== (spot && spot.el)) {
          spot = s;
          spotSince = now;
          startHop(now, clampCenter(s ? pointFor(s) : corner()));
        }
        target = clampCenter(spot ? pointFor(spot) : corner());
      }

      if (!isDragging) {
        if (hop) {
          const p = clamp((now - hop.t0) / hop.dur, 0, 1);
          if (hop.isFall) {
            pos.x = hop.tx;
            pos.y = lerp(hop.fy, hop.ty, p * p);
          } else {
            const e = ease(p);
            pos.x = lerp(hop.fx, target.x, e);
            pos.y = lerp(hop.fy, target.y, e) - hop.h * 4 * p * (1 - p);
          }
          if (p >= 1) {
            hop = null;
            landAt = now;
            bounceAt = now;
            spawn("spark", 6);
          }
        } else if (reduced) {
          pos.x = target.x;
          pos.y = target.y;
        } else {
          const k = 1 - Math.exp(-dt * 10);
          pos.x += (target.x - pos.x) * k;
          pos.y += (target.y - pos.y) * k;
          if (Math.hypot(target.x - pos.x, target.y - pos.y) > 280) startHop(now, target);
        }
      }

      // Squash and stretch physics
      let sx = 1, sy = 1;
      if (isDragging) {
        sy = 1.22;
        sx = 0.88;
      } else if (hop) {
        const s = Math.sin(clamp((now - hop.t0) / hop.dur, 0, 1) * Math.PI);
        sy = 1 + 0.13 * s;
        sx = 1 - 0.07 * s;
      }
      const lq = (now - landAt) / 320;
      if (lq > 0 && lq < 1) {
        const q = Math.sin(lq * Math.PI) * 0.22 * (1 - lq);
        sx += q;
        sy -= q;
      }
      const bq = (now - bounceAt) / 260;
      if (bq > 0 && bq < 1) {
        const q = Math.sin(bq * Math.PI) * 0.08;
        sy -= q;
        sx += q * 0.6;
      }
      const bob = hop || isDragging || reduced ? 0 : sleeping ? Math.sin(t * 1.4) * R * 0.04 : Math.sin(t * 3.2) * R * 0.08;

      // Look direction
      const head = { x: pos.x, y: pos.y - R * 0.2 };
      const toward = (p) => {
        const dx = p.x - head.x,
          dy = p.y - head.y,
          len = Math.hypot(dx, dy) || 1,
          k = Math.min(1, len / 140);
        return { x: (dx / len) * k, y: (dy / len) * k };
      };

      let want;
      if (hidden) want = { x: -0.2, y: -0.9 };
      else if (isDragging) want = { x: 0, y: 0.8 };
      else if (thinking) want = { x: pos.x > innerWidth / 2 ? -0.55 : 0.55, y: -0.85 };
      else if (sleeping) want = { x: 0, y: 0.3 };
      else if (glance && now < glance.until) want = { x: look.x * 0.5, y: glance.y };
      else if (finePointer && now - cursor.at < 2500) want = toward(cursor);
      else {
        const el = spotLookEl || spot?.el;
        if (el && document.contains(el)) {
          const r = el.getBoundingClientRect();
          want = toward({ x: r.left + r.width / 2, y: r.top + Math.min(r.height, 120) / 2 });
        } else want = { x: -0.3, y: 0.15 };
      }

      const lk = 1 - Math.exp(-dt * 8);
      look.x += (want.x - look.x) * lk;
      look.y += (want.y - look.y) * lk;

      if (moodUntil && now > moodUntil) {
        mood = baseMood;
        arm = null;
        moodUntil = 0;
      }
      let m = mood, a = arm;

      const hovering =
        finePointer &&
        !hidden &&
        !isDragging &&
        Math.hypot(cursor.x - pos.x, cursor.y - pos.y) < R * 1.6 &&
        now - cursor.at < 3000;

      if (thinking) {
        m = "think";
        a = "chin";
      } else if (hovering && !typing && m === baseMood) {
        m = "love";
        if (now - lastHeart > 700) {
          lastHeart = now;
          spawn("heart");
        }
      }
      if (sleeping && now - lastZ > 1100) {
        lastZ = now;
        spawn("z");
      }

      talkAmp = typing ? 0.5 + 0.5 * Math.sin(t * 24) : talkAmp * Math.exp(-dt * 12);
      particles = particles.filter((p) => now - p.born < p.life);

      // Render
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, S, S);
      ctx.save();
      ctx.translate(S / 2, S / 2 + R * 0.4 + bob);
      drawMascot(ctx, R, {
        t,
        mood: m,
        arm: a,
        lx: look.x,
        ly: look.y,
        sx,
        sy,
        talk: talkAmp,
        glow: thinking ? 0.5 + 0.5 * Math.sin(t * 6) : 0,
      });
      drawParticles(ctx, R, particles, now);
      ctx.restore();

      root.style.transform = `translate3d(${Math.round(pos.x - S / 2)}px,${Math.round(pos.y - S / 2 - R * 0.4)}px,0)`;
      positionBubble();
      requestAnimationFrame(frame);
    };

    root.classList.toggle("is-peeking", hidden);
    root.classList.add("in");
    requestAnimationFrame(frame);

    // Greeting
    setTimeout(() => {
      if (hidden || recruiterOn()) return;
      talk("hello", {
        priority: 1,
        mood: "happy",
        arm: "wave",
        action: isPhone()
          ? undefined
          : {
              label: "Explore experiments",
              run: () => scrollToSection("#projects"),
            },
      });
    }, 1000);
  }

  // ── Bulletproof Self-Booting ───────────────────────────────────────────
  const boot = () => {
    try {
      start();
    } catch (e) {
      window.__lastBootError = e.stack || e.message;
      console.error("[Guide boot error]", e.stack || e);
    }
  };

  if (document.body) {
    boot();
  } else {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  }
})();

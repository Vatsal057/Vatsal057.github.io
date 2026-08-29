/* Renders one project detail page from window.PROJECTS by ?id=slug. */
(function () {
  document.documentElement.classList.add('js');
  var isDark = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) document.body.classList.add('dark-mode');

  var id = new URLSearchParams(location.search).get("id");
  var p = (window.PROJECTS || []).find(function (x) { return x.slug === id; });

  if (!p) {
    document.getElementById("notfound").hidden = false;
    return;
  }

  var kindLabel = {
    project: "project", app: "app", tool: "tool",
    research: "research", planned: "planned"
  }[p.kind] || "project";

  document.title = p.title + " · Vatsal Vaghasiya";
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", p.oneLiner || p.title);

  var main = document.querySelector("main.detail");
  main.hidden = false;
  if (p.kind === "planned") main.classList.add("is-planned");

  // Name the project in the companion's input so it is obvious the robot on this
  // page knows what you are looking at.
  var ask = document.getElementById("askInput");
  if (ask) ask.placeholder = "Ask about " + p.title + "...";

  document.getElementById("crumbKind").textContent = kindLabel;
  document.getElementById("crumbTitle").textContent = p.title;
  document.getElementById("title").textContent = p.title;
  document.getElementById("tag").textContent = p.tag || "";
  document.getElementById("oneLiner").textContent = p.oneLiner || "";

  var badge = document.getElementById("badge");
  badge.textContent = p.status;
  badge.classList.add("badge-" + p.status.replace(/\s+/g, "-"));

  document.getElementById("stack").textContent =
    (p.stack || []).join(" · ");

  // links
  var links = document.getElementById("links");
  if (p.links && p.links.website) {
    links.appendChild(anchor(p.links.website, "visit website ↗", "btn btn-accent"));
  }
  if (p.links && p.links.demo) {
    var demoClass = p.links.website ? "btn btn-ghost" : "btn btn-primary";
    links.appendChild(anchor(p.links.demo, "live demo ↗", demoClass));
  }
  if (p.links && p.links.download) {
    var dlClass = (p.links.website || p.links.demo) ? "btn btn-ghost" : "btn btn-primary";
    links.appendChild(anchor(p.links.download, (p.downloadLabel || "download") + " ↓", dlClass));
  }
  if (p.links && p.links.github) {
    var ghClass = (p.links.website || p.links.demo || p.links.download) ? "btn btn-ghost" : "btn btn-primary";
    links.appendChild(anchor(p.links.github, "github repo →", ghClass));
  }
  if (p.links && p.links.certificate) {
    links.appendChild(anchor(p.links.certificate, "view certificate →", "btn btn-primary"));
  }

  // An honest caveat next to the buttons — e.g. "this needs two players", or why
  // a research project has no repo link yet, so the button row does not just
  // show a link that goes nowhere.
  if (p.note) {
    var noteEl = document.getElementById("note");
    if (noteEl) {
      noteEl.textContent = p.note;
      noteEl.hidden = false;
    }
  }

  document.getElementById("problem").textContent = p.problem || p.oneLiner || "";

  // media: real screenshot when one exists; a quiet honest note for visual
  // apps still waiting on a capture; nothing at all for research/planned.
  if (p.media) {
    var img = document.getElementById("mediaImg");
    img.src = p.media.src;
    img.alt = p.media.alt || p.title;
    document.getElementById("mediaCaption").textContent = p.media.caption || "";
    document.getElementById("mediaBlock").hidden = false;
  } else if ((p.kind === "app" || p.kind === "tool") &&
             !(p.links && (p.links.demo || p.links.website))) {
    // Only apologise for a missing screenshot when there's nothing live to
    // click either. If the thing runs in a browser, the demo *is* the media.
    document.getElementById("mediaPending").hidden = false;
  }

  // how (pipeline)
  if (p.how && p.how.length) {
    var how = document.getElementById("how");
    p.how.forEach(function (step) {
      var s = document.createElement("span");
      s.textContent = step;
      how.appendChild(s);
    });
    document.getElementById("howBlock").hidden = false;
  }

  // highlights
  var ul = document.getElementById("highlights");
  (p.highlights || []).forEach(function (h) {
    var li = document.createElement("li");
    li.textContent = h;
    ul.appendChild(li);
  });

  // targets (planned projects)
  if (p.targets) {
    document.getElementById("targets").textContent = p.targets;
    document.getElementById("targetsBlock").hidden = false;
  }

  // learned
  if (p.learned) {
    document.getElementById("learned").textContent = p.learned;
    document.getElementById("learnedBlock").hidden = false;
  }

  // No GSAP on detail pages — reveal blocks on scroll with a tiny observer,
  // and show anything already in view immediately.
  var reveals = document.querySelectorAll(".detail .reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  function anchor(href, text, cls) {
    var a = document.createElement("a");
    a.href = href; a.textContent = text; a.className = cls;
    a.target = "_blank"; a.rel = "noopener";
    return a;
  }
})();

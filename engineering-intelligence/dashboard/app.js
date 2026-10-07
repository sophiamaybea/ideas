const REMOTE = "https://raw.githubusercontent.com/sophiamaybea/ideas/engineering-intelligence/engineering-intelligence/dashboard/data/dashboard.json";

let D = null;
let route = location.hash.slice(1) || "home";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[m]));

function prettyTime(value) {
  try {
    return new Date(value).toLocaleString([], {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    }).toUpperCase();
  } catch (e) {
    return String(value || "");
  }
}

function money(n) {
  return "$" + Number(n || 0).toLocaleString();
}

function sectionHead(num, title, accent, sub) {
  return '<section class="sectionHead">' +
    '<div><span class="sectionNum">' + esc(num) + ' / LIVE INDEX</span>' +
    '<h1>' + esc(title) + (accent ? ' <i>' + esc(accent) + '</i>' : '') + '</h1></div>' +
    '<p>' + esc(sub) + '</p></section>';
}

function tag(text, cls) {
  return '<span class="tag ' + (cls || "") + '">' + esc(text) + '</span>';
}

function cardPlot(seed) {
  const heights = [];
  let h = 0;
  String(seed || "").split("").forEach((c, i) => {
    h = (h + c.charCodeAt(0) * (i + 3)) % 37;
    heights.push(18 + (h % 76));
  });
  while (heights.length < 14) heights.push(24 + ((heights.length * 17) % 68));
  return '<div class="miniPlot" aria-hidden="true">' +
    heights.slice(0, 14).map((x) => '<i style="height:' + x + '%"></i>').join("") +
    '</div>';
}

async function load() {
  try {
    const r = await fetch(REMOTE + "?v=" + Date.now(), { cache: "no-store" });
    if (!r.ok) throw new Error("remote");
    D = await r.json();
  } catch (e) {
    D = await fetch("/data/dashboard.json", { cache: "no-store" }).then((r) => r.json());
  }

  $("#boot").hidden = true;
  $("#app").hidden = false;
  const stamp = prettyTime(D.meta.lastUpdated);
  $("#headerUpdate").textContent = "UPDATED " + stamp;
  $("#footerUpdate").textContent = "LAST INGEST / " + stamp;
  bind();
  render();
}

function bind() {
  document.body.addEventListener("click", (e) => {
    const routeButton = e.target.closest("[data-route]");
    if (routeButton) {
      const next = routeButton.dataset.route;
      if (next) {
        location.hash = next;
        route = next;
        render();
      }
      $("#rail").classList.remove("open");
      $("#menuBtn").setAttribute("aria-expanded", "false");
    }

    const detail = e.target.closest("[data-detail]");
    if (detail) openDetail(detail.dataset.detail, detail.dataset.key);
  });

  window.addEventListener("hashchange", () => {
    route = location.hash.slice(1) || "home";
    render();
  });

  $("#menuBtn").addEventListener("click", () => {
    const rail = $("#rail");
    const open = rail.classList.toggle("open");
    $("#menuBtn").setAttribute("aria-expanded", String(open));
  });

  $(".closeDialog").onclick = () => $("#detailDialog").close();
  $("#detailDialog").addEventListener("click", (e) => {
    if (e.target === $("#detailDialog")) $("#detailDialog").close();
  });
}

function render() {
  document.querySelectorAll(".rail button").forEach((b) => {
    b.classList.toggle("active", b.dataset.route === route);
  });

  const views = { home, repos, prompts, ventures, companies, projects, learning };
  (views[route] || home)();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function radarNodes() {
  const positions = [
    [24, 28], [70, 22], [82, 51], [66, 78], [30, 76], [14, 52], [52, 12], [48, 88]
  ];
  const items = (D.projects || []).slice(0, 8);
  return items.map((p, i) => {
    const pos = positions[i % positions.length];
    const hot = /LIVE|BUILDING/.test(p.status || "") ? " hot" : "";
    return '<span class="orbit' + hot + '" data-label="' + esc(p.name) + '" style="left:' +
      pos[0] + '%;top:' + pos[1] + '%"></span>';
  }).join("");
}

function home() {
  const counts = [
    ["REPOSITORIES", D.repos.length],
    ["PROMPT SYSTEMS", D.prompts.length],
    ["VENTURES", D.ventures.length],
    ["COMPANIES", D.companies.length]
  ];

  const deltas = (D.changes || []).slice(0, 4).map((c) =>
    '<article class="deltaCard"><small>' + esc(c.type) + ' / ' + esc(c.time || "NOW") + '</small>' +
    '<h3>' + esc(c.title) + '</h3><p>' + esc(c.body) + '</p></article>'
  ).join("");

  const modes = (D.modes || []).map((m) => '<span>' + esc(m) + '</span>').join("");

  $("#view").innerHTML =
    '<div class="kicker"><span>00 / SYSTEM ATLAS</span><strong>OBSERVE → MODEL → BUILD → MEASURE → LEARN</strong></div>' +
    '<section class="heroAtlas">' +
      '<article class="heroCopy">' +
        '<span class="heroIndex">A.01 / LIVING ENGINEERING + ECONOMIC INTELLIGENCE</span>' +
        '<h1 class="heroTitle">ENGINEERING <em>INTELLIGENCE</em></h1>' +
        '<p class="heroDek">' + esc(D.meta.subtitle) + ' The interface is an atlas of what exists, what changed, what might matter, and what actually earned money.</p>' +
        '<div class="modeTape">' + modes + '</div>' +
      '</article>' +
      '<article class="atlasPanel">' +
        '<span class="panelLabel">SYSTEM RELATION MAP / CURRENT BUILD GRAPH</span>' +
        '<div class="radar"><div class="radarCore">' +
          '<span class="axisX"></span><span class="axisY"></span>' +
          radarNodes() +
          '<span class="radarPulse">EI</span>' +
        '</div></div>' +
        '<div class="radarLegend">' +
          counts.map((c) => '<div><b>' + c[1] + '</b><span>' + c[0] + ' INDEXED</span></div>').join("") +
        '</div>' +
      '</article>' +
    '</section>' +
    '<div class="deltaStrip">' + deltas + '</div>' +
    '<div class="jumpGrid">' +
      '<button class="jump" data-route="repos"><small>01 / TECHNICAL LEVERAGE</small><span>↗</span><b>GITHUB<br>GOLD MINE</b></button>' +
      '<button class="jump" data-route="ventures"><small>03 / ECONOMIC EXPERIMENTS</small><span>↗</span><b>AUTONOMOUS<br>VENTURES</b></button>' +
      '<button class="jump" data-route="companies"><small>04 / CAPITAL MAP</small><span>↗</span><b>WHO<br>MAKES MONEY</b></button>' +
    '</div>';
}

function repoCard(r) {
  const hot = r.status === "PRIORITY" || r.status === "FOUNDATION";
  return '<article class="blueprintCard clickable" data-detail="repo" data-key="' + esc(r.name) + '">' +
    '<div class="cardTop"><div class="tags">' +
      tag(r.status, hot ? "hot" : "blue") + tag(r.licence || "LICENCE N/A", "") +
    '</div><span class="cardArrow">↗</span></div>' +
    '<h2>' + esc(r.name) + '</h2>' +
    '<p>' + esc(r.capability) + '</p>' +
    '<div class="capLine"><span class="label">USED FOR</span><br>' + esc((r.usedFor || []).join(" / ")) + '</div>' +
    cardPlot(r.name) +
  '</article>';
}

function repos() {
  $("#view").innerHTML =
    sectionHead("01", "REPO", "RADAR", "Open source treated as an engineering knowledge base. Every repository is translated into capability, current use, commercial potential and fit.") +
    '<div class="searchRow"><input class="search" id="q" autocomplete="off" placeholder="SEARCH REPOSITORIES / CAPABILITIES">' +
    '<span class="countChip" id="resultCount"></span></div>' +
    '<div class="blueprintGrid" id="repoCards"></div>';

  const paint = () => {
    const q = $("#q").value.toLowerCase();
    const rows = D.repos.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
    $("#resultCount").textContent = rows.length + " / " + D.repos.length + " MATCHES";
    $("#repoCards").innerHTML = rows.map(repoCard).join("");
  };
  $("#q").oninput = paint;
  paint();
}

function promptCard(p, index) {
  const codes = (p.codes || []).map((x) => '<span class="codepill">' + esc(x) + '</span>').join("");
  return '<article class="blueprintCard promptCard clickable" data-detail="prompt" data-key="' + esc(p.title) + '">' +
    '<div class="cardTop"><span class="label">P.' + String(index + 1).padStart(2, "0") + ' / PROMPT SYSTEM</span><span class="cardArrow">↗</span></div>' +
    '<div class="promptCodes">' + codes + '</div>' +
    '<h2>' + esc(p.title) + '</h2><p>' + esc(p.summary) + '</p>' +
    cardPlot(p.title) +
  '</article>';
}

function prompts() {
  $("#view").innerHTML =
    sectionHead("02", "PROMPT", "LIBRARY", "A durable index of the cognitive, research, engineering and commercial procedures created in the working system. New substantial prompt systems are collected by the hourly run.") +
    '<div class="searchRow"><input class="search" id="q" autocomplete="off" placeholder="SEARCH PROMPTS / MODES">' +
    '<span class="countChip" id="resultCount"></span></div>' +
    '<div class="blueprintGrid" id="promptCards"></div>';

  const paint = () => {
    const q = $("#q").value.toLowerCase();
    const rows = D.prompts.filter((p) => JSON.stringify(p).toLowerCase().includes(q));
    $("#resultCount").textContent = rows.length + " / " + D.prompts.length + " SYSTEMS";
    $("#promptCards").innerHTML = rows.map(promptCard).join("");
  };
  $("#q").oninput = paint;
  paint();
}

function ventureCard(v, index) {
  const max = Math.max.apply(null, D.ventures.map((x) => Number(x.model.p90 || 1)));
  const l = Math.max(0, Number(v.model.p10 || 0) / max * 100);
  const w = Math.max(2, (Number(v.model.p90 || 0) - Number(v.model.p10 || 0)) / max * 100);
  const m = Math.min(99, Number(v.model.meanRevenue || 0) / max * 100);

  return '<article class="blueprintCard clickable" data-detail="venture" data-key="' + esc(v.name) + '">' +
    '<div class="cardTop"><div class="tags">' + tag("V." + String(index + 1).padStart(2, "0"), "blue") + tag("WOLFRAM / " + v.status, "hot") + '</div><span class="cardArrow">↗</span></div>' +
    '<h2>' + esc(v.name) + '</h2><p>' + esc(v.thesis) + '</p>' +
    '<div class="metricBand"><span class="rangeFill" style="left:' + l + '%;width:' + w + '%"></span><span class="meanMark" style="left:' + m + '%"></span></div>' +
    '<div class="rangeLabels"><span>P10 ' + money(v.model.p10) + '</span><span>MEAN ' + money(v.model.meanRevenue) + '</span><span>P90 ' + money(v.model.p90) + '</span></div>' +
    '<div class="metricline">' +
      '<div class="metric"><b>' + Math.round(Number(v.model.p100 || 0) * 100) + '%</b><span>P ≥ $100</span></div>' +
      '<div class="metric"><b>' + esc(v.model.medianDaysToFirstDollar) + 'D</b><span>MODELLED FIRST $</span></div>' +
      '<div class="metric"><b>' + money(v.model.meanContributionProfit) + '</b><span>MEAN CONTRIBUTION</span></div>' +
    '</div>' +
  '</article>';
}

function ventures() {
  $("#view").innerHTML =
    sectionHead("03", "VENTURE", "LAB", "Autonomous business hypotheses are shown as experiments, not promises. Each one carries assumptions, failure modes, a falsification test and an explicit economic model.") +
    '<div class="notice">' + esc(D.meta.modelNotice) + '</div>' +
    '<div class="blueprintGrid">' + D.ventures.map(ventureCard).join("") + '</div>';
}

function companies() {
  $("#view").innerHTML =
    sectionHead("04", "MONEY", "MAP", "A financial reference layer showing which technology companies generate large profits, followed by the mechanism: product, margin, moat and lesson.") +
    '<div class="notice blue">DATA / ' + esc(D.meta.financialDataset) + '</div>' +
    '<div class="searchRow"><input class="search" id="q" autocomplete="off" placeholder="SEARCH PROFITABLE TECH COMPANIES">' +
    '<span class="countChip" id="resultCount"></span></div>' +
    '<div class="moneyTable" id="companyList"></div>';

  const paint = () => {
    const q = $("#q").value.toLowerCase();
    const rows = D.companies.filter((c) => JSON.stringify(c).toLowerCase().includes(q));
    $("#resultCount").textContent = rows.length + " / " + D.companies.length + " COMPANIES";
    $("#companyList").innerHTML = rows.map((c) =>
      '<div class="moneyRow" data-detail="company" data-key="' + esc(c.name) + '">' +
        '<span class="rank">#' + esc(c.rank) + '</span>' +
        '<span class="name">' + esc(c.name) + ' <small>' + esc(c.ticker) + '</small></span>' +
        '<span class="category">' + (c.profileStatus === "enriched" ? "ANALYSED" : "QUEUED") + '</span>' +
        '<span class="yoy ' + (String(c.yoy).startsWith("-") ? "down" : "up") + '">' + esc(c.yoy) + '</span>' +
        '<span class="profit">' + esc(c.netIncome) + '</span>' +
      '</div>'
    ).join("");
  };
  $("#q").oninput = paint;
  paint();
}

function projects() {
  const layers = D.projects.map((p, i) =>
    '<article class="stackLayer"><small>' + String(i + 1).padStart(2, "0") + ' / ' + esc(p.status) + '</small>' +
    '<h3>' + esc(p.name) + '</h3><p>' + esc(p.kind) + ' / ' + esc(p.purpose) + '</p></article>'
  ).join("");

  const cards = D.projects.map((p) =>
    '<article class="projectCard"><div class="tags">' + tag(p.status, /LIVE|BUILDING/.test(p.status) ? "hot" : "") + tag(p.kind, "blue") + '</div>' +
    '<h2>' + esc(p.name) + '</h2><p>' + esc(p.purpose) + '</p><p><span class="label">EVIDENCE</span><br>' + esc(p.evidence) + '</p></article>'
  ).join("");

  $("#view").innerHTML =
    sectionHead("05", "CURRENT", "SYSTEMS", "The memory layer for what is already being built. Research should compound around active systems rather than continually inventing unrelated projects.") +
    '<div class="stackBoard"><div class="systemStack">' + layers + '</div><div class="projectList">' + cards + '</div></div>';
}

function loopNodes() {
  const positions = [[50,3],[85,22],[97,55],[76,87],[40,97],[8,72],[4,34],[25,10]];
  return (D.learning.loop || []).slice(0, 8).map((x, i) => {
    const p = positions[i % positions.length];
    return '<span class="loopNode" style="left:' + p[0] + '%;top:' + p[1] + '%">' + esc(x) + '</span>';
  }).join("");
}

function learning() {
  const rules = (D.learning.rules || []).map((r, i) =>
    '<article class="rule"><small>RULE ' + String(i + 1).padStart(2, "0") + '</small><h3>' + esc(r) + '</h3></article>'
  ).join("");

  const wolframTests = (D.wolfram.tests || []).map((t, i) =>
    '<article class="rule"><small>MODEL TEST ' + String(i + 1).padStart(2, "0") + '</small><h3>' + esc(t) + '</h3></article>'
  ).join("");

  $("#view").innerHTML =
    sectionHead("06", "LEARNING", "LOOP", "Learning means measured prediction error, attribution and policy change. Model confidence is separated from observed revenue so the interface cannot mistake a simulation for income.") +
    '<div class="learningHero">' +
      '<div class="loopDiagram"><div class="loopWheel">' + loopNodes() + '<div class="loopCore">OUTCOME<br>MEMORY</div></div></div>' +
      '<div>' +
        '<div class="metricline" style="margin-top:0">' +
          '<div class="metric"><b>' + money(D.learning.observedRevenue) + '</b><span>OBSERVED REVENUE</span></div>' +
          '<div class="metric"><b>' + esc(D.learning.observedPaidVentures) + '</b><span>PAID VENTURES</span></div>' +
          '<div class="metric"><b>' + esc(D.learning.predictionErrors.length) + '</b><span>ERRORS LOGGED</span></div>' +
        '</div>' +
        '<div class="notice" style="margin-top:10px">' + esc(D.wolfram.caveat) + '</div>' +
        '<div class="ruleBoard">' + rules + '</div>' +
      '</div>' +
    '</div>' +
    sectionHead("06B", "WOLFRAM", "TESTS", D.wolfram.method) +
    '<div class="ruleBoard">' + wolframTests + '</div>';
}

function openDetail(type, key) {
  let h = "";

  if (type === "repo") {
    const r = D.repos.find((x) => x.name === key);
    if (!r) return;
    h = tag(r.status, "hot") + tag(r.licence || "LICENCE N/A", "") +
      '<h2 id="dialogTitle">' + esc(r.name) + '</h2>' +
      '<h4>CAPABILITY</h4><p>' + esc(r.capability) + '</p>' +
      '<h4>USED IN OUR SYSTEMS</h4><p>' + esc((r.usedFor || []).join(" / ")) + '</p>' +
      '<h4>EXAMPLES ALREADY POSSIBLE</h4><p>' + esc((r.examples || []).join(" / ")) + '</p>' +
      '<h4>POTENTIAL</h4><p>' + esc(r.potential) + '</p>' +
      '<p><a href="' + esc(r.url) + '" target="_blank" rel="noreferrer">OPEN REPOSITORY ↗</a></p>';
  }

  if (type === "prompt") {
    const p = D.prompts.find((x) => x.title === key);
    if (!p) return;
    h = tag("PROMPT SYSTEM", "blue") +
      '<h2 id="dialogTitle">' + esc(p.title) + '</h2><p>' + esc(p.summary) + '</p>' +
      '<h4>MODES</h4><p>' + (p.codes || []).map((x) => '<span class="codepill">' + esc(x) + '</span>').join(" ") + '</p>' +
      '<h4>COLLECTION LOGIC</h4><p>The hourly collector preserves durable prompt identities and purposes so useful procedures remain searchable and reusable across the wider system.</p>';
  }

  if (type === "venture") {
    const v = D.ventures.find((x) => x.name === key);
    if (!v) return;
    h = tag("MODELLED, NOT EARNED", "hot") +
      '<h2 id="dialogTitle">' + esc(v.name) + '</h2><p>' + esc(v.thesis) + '</p>' +
      '<h4>AGENT / TECHNOLOGY STACK</h4><p>' + esc((v.stack || []).join(" / ")) + '</p>' +
      '<h4>WOLFRAM BASELINE</h4><p>Mean monthly revenue: <b>' + money(v.model.meanRevenue) + '</b><br>' +
      '10th to 90th percentile: <b>' + money(v.model.p10) + ' to ' + money(v.model.p90) + '</b><br>' +
      'P(revenue ≥ $100): <b>' + Math.round(Number(v.model.p100 || 0) * 100) + '%</b><br>' +
      'Modelled median time to first dollar: <b>' + esc(v.model.medianDaysToFirstDollar) + ' days</b></p>' +
      '<h4>MAIN FAILURE MODE</h4><p>' + esc(v.risk) + '</p>' +
      '<h4>NEXT FALSIFICATION TEST</h4><p>' + esc(v.nextTest) + '</p>';
  }

  if (type === "company") {
    const c = D.companies.find((x) => x.name === key);
    if (!c) return;
    const p = D.companyProfiles[key];
    h = tag("#" + c.rank + " FY2025 PROFIT", "blue") +
      '<h2 id="dialogTitle">' + esc(c.name) + '</h2><p><b>' + esc(c.netIncome) + '</b> net income / ' + esc(c.yoy) + ' YoY</p>';
    if (p) {
      h += '<h4>WHAT IT DOES</h4><p>' + esc(p.does) + '</p>' +
        '<h4>WHY IT MAKES MONEY</h4><p>' + esc(p.why) + '</p>' +
        '<h4>MOAT</h4><p>' + esc(p.moat) + '</p>' +
        '<h4>WHAT WE SHOULD LEARN</h4><p>' + esc(p.lesson) + '</p>';
    } else {
      h += '<div class="notice">QUALITATIVE PROFILE QUEUED FOR HOURLY ENRICHMENT. THE FINANCIAL RECORD IS ALREADY INDEXED.</div>';
    }
  }

  $("#dialogContent").innerHTML = h;
  $("#detailDialog").showModal();
}

load();

setInterval(async () => {
  try {
    const r = await fetch(REMOTE + "?v=" + Date.now(), { cache: "no-store" });
    if (!r.ok) return;
    const next = await r.json();
    if (D && next.meta.lastUpdated !== D.meta.lastUpdated) {
      D = next;
      const stamp = prettyTime(D.meta.lastUpdated);
      $("#headerUpdate").textContent = "UPDATED " + stamp;
      $("#footerUpdate").textContent = "LAST INGEST / " + stamp;
      render();
    }
  } catch (e) {}
}, 60000);

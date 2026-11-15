/* SPACEVITALS — application (views, state, NASA DONKI integration). No build step, no dependencies. */
/* AI disclosure: written with the help of Claude (Anthropic), reviewed and tested by the SPACEVITALS team. */
(function () {
  "use strict";
  const D0 = window.SV_DEMO, PY = window.SV_PY || null, REF = window.SV_OSD575 || null;
  const C = window.SVCharts, A = window.SVAnalytics;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fx = (v, d = 1) => v === null || v === undefined || Number.isNaN(v) ? "—" : Number(v).toFixed(d);
  const sign = v => (v > 0 ? "+" : "") + v.toFixed(0) + "%";
  if (!D0) { document.getElementById("view").innerHTML = `<div class="empty">data/demo_data.js is missing. Run <code>python analysis/build_demo_data.py</code>.</div>`; return; }

  /* ================= icons (shapes adapted from Lucide, https://lucide.dev, ISC License) ================= */
  const I = (p, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ICON = {
    overview: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    health: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    bone: '<path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"/>',
    ai: '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    radiation: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    records: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/>',
    crew: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    preferences: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    spark: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    o2: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    bp: '<path d="M2 12h3l3-8 4 16 3-8h7"/>',
    temp: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
    sleep: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    rad: '<circle cx="12" cy="12" r="2"/><path d="M12 2a10 10 0 0 1 8.66 5L15.46 10A4 4 0 0 0 12 8ZM3.34 7A10 10 0 0 1 12 2v6a4 4 0 0 0-3.46 2ZM12 22a10 10 0 0 1-8.66-5l5.2-3a4 4 0 0 0 6.92 0l5.2 3A10 10 0 0 1 12 22Z"/>',
  };
  const NAV = [["overview", "Overview"], ["health", "Health Dashboard"], ["bone", "Bone Health"], ["ai", "AI Analysis"], ["radiation", "Radiation Monitor"], ["records", "Medical Records"], ["crew", "Crew Monitoring"], ["preferences", "Settings"]];

  /* ================= persistent store (this browser only) ================= */
  const KEY = "spacevitals_v1";
  const blank = () => ({ manualVitals: {}, manualUrine: {}, records: {}, acks: {}, apiKey: "", reduce: false, events: [] });
  let store = blank();
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && typeof s === "object") {
      const d = blank(), isObj = v => v && typeof v === "object" && !Array.isArray(v);
      ["manualVitals", "manualUrine", "records", "acks"].forEach(k => { if (isObj(s[k])) { d[k] = s[k]; if (k !== "acks") Object.keys(d[k]).forEach(id => { if (!Array.isArray(d[k][id])) delete d[k][id]; }); } });
      if (typeof s.apiKey === "string") d.apiKey = s.apiKey;
      d.reduce = !!s.reduce;
      if (Array.isArray(s.events)) d.events = s.events.filter(e => e && typeof e.text === "string");
      store = d;
    }
  } catch (e) { /* storage unavailable or corrupted: start clean */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore */ } };
  const fileURLs = {}; // uploaded files live for this session only

  /* ================= time ================= */
  const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  const MAXDAY = D0.mission.current_day;
  const LAUNCH = new Date(+TODAY - (MAXDAY - 1) * 864e5);
  const dateOf = d => new Date(+LAUNCH + (d >= 1 ? d - 1 : d) * 864e5);
  const fmtDate = d => dateOf(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const dayLabel = d => d >= 1 ? `Day ${d}` : `L${d}`;
  const MILESTONES = [[1, "Baseline vitals & initial urine biomarkers"], [30, "Urinary Ca²⁺ and NTx begin to rise"], [60, "Further rise in bone-resorption markers"], [90, "AI flags an unusual vital-sign pattern"], [120, "Medical officer receives the health report"]];

  /* ================= state ================= */
  const state = { astro: "A1", day: MAXDAY, view: "overview", trend: "all", metric: "heart_rate", range: { preset: "30", from: MAXDAY - 29, to: MAXDAY },
    rec: { q: "", type: "all", sort: "desc", cmp: null, ref: null }, ai: { level: "all" }, bell: false,
    donki: { status: "idle", events: [], fetchedAt: null, from: null, to: null, types: { FLR: true, CME: true, SEP: true, GST: true }, msg: "" } };
  const astro = id => D0.astronauts.find(a => a.id === (id || state.astro));
  const initials = a => a.full_name.split(" ").map(w => w[0]).join("");
  const AVC = { A1: "linear-gradient(135deg,#22D3EE,#60a5fa)", A2: "linear-gradient(135deg,#34d399,#22D3EE)", A3: "linear-gradient(135deg,#a78bfa,#60a5fa)", A4: "linear-gradient(135deg,#fbbf24,#f472b6)" };
  const LVC = { normal: "var(--ok)", attention: "var(--warn)", critical: "var(--crit)" };
  const avatar = (a, lg, lvl) => `<div class="av${lg ? " lg" : ""}" style="background:${AVC[a.id] || AVC.A1};--st:${LVC[lvl || "normal"]}" title="${esc(a.full_name)}">${initials(a)}</div>`;
  const stBadge = (lvl, txt) => `<span class="st ${lvl}">${txt || { normal: "Normal", attention: "Attention", critical: "Critical", none: "No data" }[lvl]}</span>`;
  const SIM = `<span class="tag sim" title="Fictional demo data, not a real measurement">Simulated</span>`;
  const NASA = (t = "NASA data") => `<span class="tag nasa">${t}</span>`;
  const MAN = `<span class="tag man">Manual entry</span>`;

  /* ================= data accessors ================= */
  function vitalsAll(id = state.astro) {
    const map = new Map(D0.health_metrics[id].map(r => [r.day, { ...r }]));
    (store.manualVitals[id] || []).forEach(r => map.set(r.day, { ...map.get(r.day), ...r, manual: true }));
    return [...map.values()].sort((a, b) => a.day - b.day);
  }
  const vitals = (id = state.astro, day = state.day) => vitalsAll(id).filter(r => r.day <= day);
  function boneAll(id = state.astro) { return [...D0.bone_markers[id], ...(store.manualUrine[id] || []).map(t => ({ ...t, manual: true }))].sort((a, b) => a.day - b.day); }
  const bone = (id = state.astro, day = state.day) => boneAll(id).filter(t => t.day <= day);
  const dose = (id = state.astro, day = state.day) => D0.dosimeter[id].filter(r => r.day <= day);
  const records = (id = state.astro, day = state.day) => [...D0.medical_records[id], ...(store.records[id] || [])].filter(r => r.test_day <= day);
  const cache = new Map();
  function analysis(id = state.astro, day = state.day) {
    const k = `${id}|${day}|${(store.manualVitals[id] || []).length}|${(store.manualUrine[id] || []).length}|${JSON.stringify(store.manualVitals[id] || []).length}`;
    if (!cache.has(k)) cache.set(k, A.analyze({ vitals: vitals(id, day), bone: bone(id, day), day }));
    return cache.get(k);
  }
  const ackKey = (id, o) => `${id}:${o.key}`;
  const activeAlerts = (id = state.astro) => analysis(id).obs.filter(o => !store.acks[ackKey(id, o)]);

  /* ================= shell rendering ================= */
  function renderNav() {
    const n = activeAlerts().length;
    $("#nav").innerHTML = NAV.map(([k, label]) => `<a href="#${k}" data-v="${k}" class="${state.view === k ? "on" : ""}">${I(ICON[k])}<span>${label}</span>${k === "ai" && n ? `<span class="badge ${analysis().level === "critical" ? "" : "w"}">${n}</span>` : ""}</a>`).join("");
    const a = astro(), lvl = analysis().level;
    $("#me").innerHTML = `${avatar(a, false, lvl)}<div><div class="n">${esc(a.full_name)}</div><div class="r">${esc(a.role)} · ${stBadge(lvl)}</div></div>`;
    $("#topAv").innerHTML = avatar(a, false, lvl);
  }
  function renderTop() {
    $("#dayLbl").textContent = state.day;
    $("#daySlider").value = state.day;
    $("#milestones").innerHTML = MILESTONES.map(([d, t]) => `<button class="chip ${state.day === d ? "on" : ""}" data-day="${d}" title="${t}">Day ${d}</button>`).join("");
    const n = activeAlerts().length + store.events.filter(e => !e.read).length;
    const c = $("#bellCnt"); c.hidden = !n; c.textContent = n;
    renderPop();
  }
  function renderPop() {
    const al = activeAlerts(), ev = store.events.slice(0, 8);
    $("#pop").innerHTML = `<h5>Active alerts · ${esc(astro().full_name)}</h5>${al.length ? al.slice(0, 6).map(o => `<div class="it" data-go="ai"><span class="st ${o.level}" style="padding:0;background:none"></span><div><div>${esc(o.title)}</div><div class="dt">Since ${dayLabel(o.created_day)} · ${esc(o.method)}</div></div></div>`).join("") : `<div class="it" style="cursor:default;color:var(--mu)">No active alerts.</div>`}
      <h5>Recent activity</h5>${ev.length ? ev.map(e => `<div class="it" style="cursor:default"><div style="color:var(--cyan)">${I(ICON.info, 15)}</div><div><div>${esc(e.text)}</div><div class="dt">${new Date(e.t).toLocaleString("en-GB")}</div></div></div>`).join("") : `<div class="it" style="cursor:default;color:var(--mu)">No recent activity.</div>`}`;
  }
  function tickClock() {
    const now = new Date();
    $("#clock").innerHTML = `${now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })} · ${now.toLocaleTimeString("en-GB")}<span>Mission day ${state.day} · ${esc(D0.mission.phase)}</span>`;
  }
  function toast(text) { const t = document.createElement("div"); t.className = "toast"; t.textContent = text; $("#toasts").appendChild(t); setTimeout(() => t.remove(), 3800); }
  function logEvent(text) { store.events.unshift({ t: Date.now(), text, read: false }); store.events = store.events.slice(0, 40); save(); }
  function openModal(html) { $("#modalBox").innerHTML = `<button class="x" data-close aria-label="Close">×</button>` + html; $("#modal").classList.add("open"); }
  function closeModal() { $("#modal").classList.remove("open"); }

  /* ================= shared pieces ================= */
  const METRIC_UI = {
    heart_rate: { icon: "heart", color: "#f472b6", label: "Heart Rate", unit: "BPM", dp: 0 },
    spo2: { icon: "o2", color: "#22D3EE", label: "Blood Oxygen (SpO₂)", unit: "%", dp: 0 },
    bp: { icon: "bp", color: "#a78bfa", label: "Blood Pressure", unit: "mmHg", dp: 0 },
    body_temperature: { icon: "temp", color: "#fb923c", label: "Body Temperature", unit: "°C", dp: 1 },
    sleep_hours: { icon: "sleep", color: "#60a5fa", label: "Sleep Duration", unit: "hours", dp: 1 },
    systolic_pressure: { color: "#a78bfa", label: "Systolic pressure", unit: "mmHg", dp: 0 },
    diastolic_pressure: { color: "#818cf8", label: "Diastolic pressure", unit: "mmHg", dp: 0 },
  };
  function metricLevel(an, m) {
    const s = an.series[m]; if (!s || !s.baseline || !an.baselineReady) return "none";
    const z = s.z[s.z.length - 1]; if (z === null) return "none";
    const dir = A.METRICS[m].dir, v = dir === "low" ? -z : Math.abs(z);
    return v >= 3 ? "critical" : v >= 2 ? "attention" : "normal";
  }
  const levelTxt = { normal: "Normal", attention: "Attention", critical: "Critical", none: "Baseline pending" };
  function metricCard(m, rows, an) {
    const U = METRIC_UI[m], last = rows[rows.length - 1];
    let val, lvl, spark;
    if (m === "bp") { val = `${last.systolic_pressure}/${last.diastolic_pressure}`; lvl = A.maxLevel([metricLevel(an, "systolic_pressure"), metricLevel(an, "diastolic_pressure")].map(x => x === "none" ? "normal" : x)); if (!an.baselineReady) lvl = "none"; spark = rows.slice(-14).map(r => r.systolic_pressure); }
    else { val = fx(last[m], U.dp); lvl = metricLevel(an, m); spark = rows.slice(-14).map(r => r[m]); }
    return `<div class="card metric hover click" data-metric="${m === "bp" ? "systolic_pressure" : m}" title="Open in Health Dashboard">
      <h3><span class="l"><span style="color:${U.color}">${I(ICON[U.icon], 17)}</span>${U.label}</span>${stBadge(lvl, levelTxt[lvl])}</h3>
      <div class="v">${val}<span class="u">${U.unit}</span></div>
      <div class="spark" data-spark="${esc(JSON.stringify(spark))}" data-color="${U.color}"></div>
      <div class="meta"><span>Updated ${dayLabel(last.day)} · 07:30 ship time</span>${last.manual ? MAN : SIM}</div></div>`;
  }
  function radiationCard() {
    const d = dose(), last = d[d.length - 1], cum = d.reduce((s, r) => s + r.measured_dose, 0);
    return `<div class="card metric hover click" data-go="radiation" title="Open Radiation Monitor">
      <h3><span class="l"><span style="color:#facc15">${I(ICON.rad, 17)}</span>Radiation Exposure</span>${stBadge("normal", "Expected")}</h3>
      <div class="v">${fx(last.measured_dose, 2)}<span class="u">mSv/day</span></div>
      <div class="spark" data-spark="${esc(JSON.stringify(d.slice(-14).map(r => r.measured_dose)))}" data-color="#facc15"></div>
      <div class="meta"><span>Σ ${cum.toFixed(0)} mSv this mission · personal dosimeter</span>${SIM}</div></div>`;
  }
  function drawSparks(root = document) { $$(".spark", root).forEach(el => C.sparkline(el, JSON.parse(el.dataset.spark), el.dataset.color)); }
  const demoBanner = () => `<div class="banner">${I(ICON.info, 16)}<div><b style="color:#c4b5fd">Demonstration data.</b> Crew, vital signs, urine biomarkers and dosimeter readings are <b>simulated</b> (fictional astronauts) until real sources are connected. Items tagged ${NASA()} come from NASA open data (DONKI, OSDR).</div></div>`;


  /* ================= Animated body map ================= */
  const BMC = { normal: "#22c55e", attention: "#facc15", critical: "#ef4444", none: "#64748b" };
  function organStates(an, rows) {
    const nz = x => (x === "none" ? "normal" : x), last = rows[rows.length - 1], ready = an.baselineReady;
    const L = k => (ready ? nz(metricLevel(an, k)) : "none");
    const multi = an.obs.find(o => o.metricKey === "multi");
    const br = an.boneRes, bl = k => (br[k] ? (br[k].lastDay <= 1 ? "normal" : br[k].level) : "none");
    const pct = k => (br[k] && br[k].lastDay > 1 ? ` · ${sign(br[k].pct)}` : "");
    const heart = ready ? A.maxLevel([L("heart_rate"), L("systolic_pressure"), L("diastolic_pressure")].concat(multi ? [multi.level] : [])) : "none";
    return {
      head:    { name: "Brain & sleep", level: ready ? A.maxLevel([L("sleep_hours"), L("body_temperature")]) : "none", value: `Sleep ${fx(last.sleep_hours, 1)} h · ${fx(last.body_temperature, 1)} °C`, metric: "sleep_hours" },
      heart:   { name: "Heart", level: heart, value: `${last.heart_rate} BPM · ${last.systolic_pressure}/${last.diastolic_pressure}`, metric: "heart_rate" },
      lungs:   { name: "Lungs", level: L("spo2"), value: `SpO₂ ${last.spo2}%`, metric: "spo2" },
      kidneys: { name: "Kidneys", level: A.maxLevel(["urine_calcium", "urine_creatinine"].map(bl).map(nz)), value: br.urine_calcium ? `Urine Ca²⁺ ${fx(br.urine_calcium.last, 0)} mg/24 h${pct("urine_calcium")}` : "No urine test yet", go: "bone" },
      bones:   { name: "Skeleton", level: A.maxLevel(["urine_ntx", "urine_ctx"].map(bl).map(nz)), value: br.urine_ntx ? `NTx${pct("urine_ntx") || " · baseline"} · CTX${pct("urine_ctx") || " · baseline"}` : "No urine test yet", go: "bone" },
    };
  }
  function bodyMapCard(an, rows) {
    const O = organStates(an, rows), last = rows[rows.length - 1];
    const hr = Math.max(40, Math.min(160, last.heart_rate || 60)), beat = (60 / hr).toFixed(3);
    const d = dose(), rate = d.length ? d[d.length - 1].measured_dose : 0, nP = Math.max(4, Math.min(14, Math.round(rate * 6)));
    const c = k => BMC[O[k].level], crit = k => (O[k].level === "critical" ? " alarm" : O[k].level === "attention" ? " warnpulse" : "");
    const attr = k => `class="organ${crit(k)}" data-organ="${k}" ${O[k].metric ? `data-metric="${O[k].metric}"` : `data-go="${O[k].go}"`} tabindex="0" role="button" aria-label="${O[k].name}: ${O[k].level}"`;
    const parts = [];
    for (let i = 0; i < nP; i++) { const x = 18 + ((i * 53) % 164), y = 40 + ((i * 97) % 340); parts.push(`<circle class="bm-p" cx="${x}" cy="${y}" r="${1.6 + (i % 3) * 0.7}" style="animation-delay:${(i * 0.43) % 4}s;animation-duration:${3 + (i % 4)}s"/>`); }
    const mirror = dd => dd.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${200 - +x} ${y}`);
    const lungL = "M82 104 Q66 108 64 132 L64 168 Q66 177 77 174 L91 167 Q95 158 95 140 L95 112 Q93 104 82 104 Z";
    const armL = "M53 100 Q38 104 34 122 L24 214 Q22 229 32 229 Q39 227 41 214 L51 150 Z";
    return `<div class="card bmcard" id="bmCard" style="--beat:${beat}s">
      <h3><span class="l">Body map · live status ${SIM}</span><span class="sub">click an organ</span></h3>
      <div class="bmwrap">
        <svg class="bm" id="bmSvg" viewBox="0 0 200 420" role="img" aria-label="Astronaut body map">
          <defs>
            <linearGradient id="bmSuit" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1c3150"/><stop offset="1" stop-color="#0f1d33"/></linearGradient>
            <linearGradient id="bmScan" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#22D3EE" stop-opacity="0"/><stop offset=".85" stop-color="#22D3EE" stop-opacity=".35"/><stop offset="1" stop-color="#22D3EE" stop-opacity=".9"/></linearGradient>
            <radialGradient id="bmAura"><stop offset="0" stop-color="#22D3EE" stop-opacity=".16"/><stop offset="1" stop-color="#22D3EE" stop-opacity="0"/></radialGradient>
            <filter id="bmGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <clipPath id="bmClip"><ellipse cx="100" cy="48" rx="24" ry="28"/><rect x="92" y="70" width="16" height="16"/><path d="M62 92 Q100 80 138 92 Q150 96 152 112 L146 206 Q142 228 134 236 L66 236 Q58 228 54 206 L48 112 Q50 96 62 92 Z"/><path d="${armL}"/><path d="${mirror(armL)}"/><path d="M68 232 L64 398 Q64 408 76 408 L92 408 Q96 404 96 396 L100 262 L104 396 Q104 404 108 408 L124 408 Q136 408 136 398 L132 232 Z"/></clipPath>
          </defs>
          <ellipse cx="100" cy="215" rx="98" ry="205" fill="url(#bmAura)"/>
          <g class="bm-parts">${parts.join("")}</g>
          <g fill="url(#bmSuit)" stroke="#2c4a70" stroke-width="1.3">
            <ellipse cx="100" cy="48" rx="24" ry="28"/><rect x="92" y="70" width="16" height="16" rx="4"/>
            <path d="M62 92 Q100 80 138 92 Q150 96 152 112 L146 206 Q142 228 134 236 L66 236 Q58 228 54 206 L48 112 Q50 96 62 92 Z"/>
            <path d="${armL}"/><path d="${mirror(armL)}"/>
            <path d="M68 232 L64 398 Q64 408 76 408 L92 408 Q96 404 96 396 L100 262 L104 396 Q104 404 108 408 L124 408 Q136 408 136 398 L132 232 Z"/>
          </g>
          <g ${attr("head")}>
            <ellipse cx="100" cy="46" rx="26" ry="30" fill="transparent"/>
            <path class="bm-brain" d="M86 48 q-4 -14 9 -16 q5 -6 10 0 q13 2 9 16 q2 9 -8 11 q-5 4 -11 0 q-11 -2 -9 -11 z" fill="${c("head")}" fill-opacity=".22" stroke="${c("head")}" stroke-width="1.6"/>
            <path d="M100 33 v26 M92 44 q4 3 0 7 M108 44 q-4 3 0 7" fill="none" stroke="${c("head")}" stroke-width="1.1" opacity=".8"/>
          </g>
          <g ${attr("lungs")}>
            <path class="bm-lung" d="${lungL}" fill="${c("lungs")}" fill-opacity=".2" stroke="${c("lungs")}" stroke-width="1.5"/>
            <path class="bm-lung" d="${mirror(lungL)}" fill="${c("lungs")}" fill-opacity=".2" stroke="${c("lungs")}" stroke-width="1.5"/>
          </g>
          <g ${attr("bones")}>
            <path d="M100 92 V214" stroke="${c("bones")}" stroke-width="3.2" stroke-dasharray="5 3" stroke-linecap="round" fill="none"/>
            <path d="M74 214 Q100 200 126 214 L122 232 Q100 222 78 232 Z" fill="${c("bones")}" fill-opacity=".18" stroke="${c("bones")}" stroke-width="2.2"/>
            <path d="M84 236 L80 316 M116 236 L120 316 M80 324 L82 396 M120 324 L118 396" stroke="${c("bones")}" stroke-width="4" stroke-linecap="round" fill="none"/>
            <circle cx="80" cy="320" r="3.4" fill="${c("bones")}"/><circle cx="120" cy="320" r="3.4" fill="${c("bones")}"/>
            <rect x="60" y="196" width="80" height="210" fill="transparent"/>
          </g>
          <g ${attr("kidneys")}>
            <path d="M80 182 q-9 1 -9 11 q0 10 9 11 q5 0 5 -5 q-3 -6 0 -12 q0 -5 -5 -5 z" fill="${c("kidneys")}" stroke="${c("kidneys")}" stroke-width="1"/>
            <path d="M120 182 q9 1 9 11 q0 10 -9 11 q-5 0 -5 -5 q3 -6 0 -12 q0 -5 5 -5 z" fill="${c("kidneys")}" stroke="${c("kidneys")}" stroke-width="1"/>
          </g>
          <g ${attr("heart")}>
            <circle cx="108" cy="142" r="20" fill="transparent" stroke="${c("heart")}" stroke-opacity=".5" stroke-dasharray="3 3" class="bm-ring"/>
            <g class="bm-heart" filter="url(#bmGlow)"><path d="M108 157 C92 147 90 131 99 129 C103 128 106 131 108 134 C110 131 113 128 117 129 C126 131 124 147 108 157 Z" fill="${c("heart")}"/></g>
            <path d="M99 141 h4 l2 -5 3 9 2 -6 1.5 2 h5" fill="none" stroke="#07111F" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <g clip-path="url(#bmClip)" pointer-events="none"><rect class="bm-scan" x="0" y="-30" width="200" height="30" fill="url(#bmScan)"/></g>
          <text x="100" y="418" text-anchor="middle" fill="#4f6480" font-size="8.5" font-family="monospace" letter-spacing="1">${esc(astro().role.toUpperCase())} · DAY ${state.day}</text>
        </svg>
        <div class="bmside">
          <div class="ecg"><svg viewBox="0 0 240 40" preserveAspectRatio="none" aria-hidden="true"><g class="ecg-run" style="animation-duration:${(4 * 60 / hr).toFixed(2)}s"><path d="${ecgPath(480)}" fill="none" stroke="${c("heart")}" stroke-width="1.8" stroke-linejoin="round"/></g></svg><span><b>${last.heart_rate}</b> BPM</span></div>
          <div class="bmlist">${Object.entries(O).map(([k, o]) => `<div class="bmrow" data-organ-row="${k}" ${o.metric ? `data-metric="${o.metric}"` : `data-go="${o.go}"`}><i style="background:${BMC[o.level]}"></i><div><b>${o.name}</b><span>${esc(o.value)}</span></div>${stBadge(o.level === "none" ? "none" : o.level, o.level === "none" ? "Pending" : undefined)}</div>`).join("")}</div>
          <div class="bmfoot">Radiation ${fx(rate, 2)} mSv/day · particle density ∝ dose</div>
        </div>
      </div></div>`;
  }
  function ecgPath(w) { let d = "M0 24", x = 0; while (x < w) { d += ` L${x + 18} 24 L${x + 22} 21 L${x + 26} 24 L${x + 30} 24 L${x + 32} 28 L${x + 35} 4 L${x + 38} 34 L${x + 41} 24 L${x + 46} 24 L${x + 52} 18 L${x + 58} 24 L${x + 60} 24`; x += 60; } return d; }
  function bindBodyMap() {
    const svg = $("#bmSvg"); if (!svg) return;
    const O = organStates(analysis(), vitals()), card = $("#bmCard");
    const hl = k => { card.dataset.hl = k || ""; };
    $$(".organ", svg).forEach(g => {
      const k = g.dataset.organ, o = O[k];
      g.addEventListener("mousemove", e => C.showTip(e, `<b>${o.name}</b><div class="row"><span>${esc(o.value)}</span></div><div style="margin-top:4px">${stBadge(o.level === "none" ? "none" : o.level, o.level === "none" ? "Baseline pending" : undefined)}</div><div style="color:#7f94b0;margin-top:4px">Click to open details</div>`));
      g.addEventListener("mouseenter", () => hl(k)); g.addEventListener("mouseleave", () => { hl(""); C.hideTip(); });
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); g.dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
    });
    $$(".bmrow", card).forEach(r => { r.addEventListener("mouseenter", () => hl(r.dataset.organRow)); r.addEventListener("mouseleave", () => hl("")); });
  }

  /* ================= VIEW: Overview ================= */
  function vOverview() {
    const a = astro(), rows = vitals(), an = analysis(), al = activeAlerts();
    const exam = records().filter(r => r.record_type === "exam" || r.record_type === "ecg").sort((x, y) => y.test_day - x.test_day)[0];
    const greet = a.role === "Commander" ? "Commander" : a.full_name.split(" ")[0];
    const top = an.obs[0];
    return `
    <div class="ph"><div><div class="sub">${esc(a.mission)} · ${esc(D0.mission.phase)}</div><div class="h1">Welcome back, ${esc(greet)}</div><div class="sub">Mission Day <b style="color:#fff">${state.day}</b> · ${fmtDate(state.day)} · ${esc(a.full_name)}, ${esc(a.role)}</div></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn ghost" data-go="crew">${I(ICON.crew, 16)}Crew</button><button class="btn" id="reportBtn" ${state.day < 90 ? "disabled title='Available from mission day 90'" : ""}>${I(ICON.file, 16)}Medical officer report</button></div></div>
    ${demoBanner()}
    <div class="grid g6" style="margin-bottom:16px">${["heart_rate", "spo2", "bp", "body_temperature", "sleep_hours"].map(m => metricCard(m, rows, an)).join("")}${radiationCard()}</div>
    <div class="grid ovgrid" style="margin-bottom:16px" id="ovRow">
      ${bodyMapCard(an, rows)}
      <div class="card ovtrend"><h3><span class="l">Health trends · last 7 days ${SIM}</span><span class="seg" id="trendSeg">${[["all", "All (% vs baseline)"], ["heart_rate", "HR"], ["spo2", "SpO₂"], ["systolic_pressure", "BP"], ["body_temperature", "Temp"], ["sleep_hours", "Sleep"]].map(([k, l]) => `<button data-trend="${k}" class="${state.trend === k ? "on" : ""}">${l}</button>`).join("")}</span></h3>
        <div class="chart" id="trendChart"></div><div class="legend" id="trendLegend"></div></div>
      <div class="card ovstatus"><h3><span class="l">Health status</span>${stBadge(an.baselineReady ? an.level : "none", an.baselineReady ? { normal: "All clear", attention: "Attention", critical: "Critical" }[an.level] : "Baseline pending")}</h3>
        <dl class="kv">
          <dt>Overall monitoring status</dt><dd>${an.baselineReady ? ({ normal: "Nominal", attention: "Review advised", critical: "Medical review" })[an.level] : "Establishing baseline (days 1–14)"}</dd>
          <dt>Active alerts</dt><dd><a href="#ai" style="text-decoration:none">${al.length} (${al.filter(o => o.level === "critical").length} critical)</a></dd>
          <dt>Last medical examination</dt><dd>${exam ? `${esc(exam.title)} · ${dayLabel(exam.test_day)}` : "—"}</dd>
          <dt>Methods running</dt><dd>MA-7 · z-score · Isolation Forest</dd>
        </dl>
        <div class="ai" style="margin-top:14px"><div class="ic" style="color:var(--cyan)">${I(ICON.spark, 18)}</div><div><div style="font-size:11.5px;color:var(--mu);font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:3px">Latest AI observation</div><p>${top ? esc(top.explanation) : an.baselineReady ? "No measurement is outside this astronaut's individual baseline range." : "Collecting the first 14 days of data to build this astronaut's personal baseline."}</p></div></div>
      </div>
    </div>
    <div class="card"><h3><span class="l">Demonstration scenario · MARS EXPLORATION MISSION — DAY 120 ${SIM}</span><span class="sub">click a milestone</span></h3>
      <div class="timeline">${MILESTONES.map(([d, t]) => `<div class="ms ${state.day >= d ? "done" : ""} ${state.day === d ? "cur" : ""}" data-day="${d}"><div class="dot"></div><b>Day ${d}</b><span>${t}</span></div>`).join("")}</div></div>`;
  }
  function pOverview() {
    drawSparks($("#view"));
    bindBodyMap();
    const an = analysis(), rows = vitals().slice(-7), el = $("#trendChart");
    const days = rows.map(r => r.day);
    if (state.trend === "all") {
      const ks = ["heart_rate", "spo2", "systolic_pressure", "body_temperature", "sleep_hours"], cols = ["#f472b6", "#22D3EE", "#a78bfa", "#fb923c", "#60a5fa"];
      const series = ks.map((k, i) => { const b = an.series[k].baseline; return { name: METRIC_UI[k].label, color: cols[i], values: rows.map(r => b ? (r[k] - b.mean) / b.mean * 100 : null), points: true }; });
      C.lineChart(el, { x: days, series, height: 250, xLabel: d => "Day " + d, yFmt: v => (v > 0 ? "+" : "") + Math.round(v) + "%", refLines: [{ y: 0, color: "#22c55e", label: "Individual baseline" }],
        tooltip: i => `<b>Mission day ${days[i]}</b>` + ks.map((k, j) => `<div class="row"><span>${METRIC_UI[k].label}</span><span>${fx(rows[i][k], METRIC_UI[k].dp)} ${A.METRICS[k].unit} (${series[j].values[i] === null ? "—" : sign(series[j].values[i])})</span></div>`).join("") });
      $("#trendLegend").innerHTML = series.map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join("") + `<span>% change from days 1–14 baseline</span>`;
    } else {
      const k = state.trend, b = an.series[k].baseline, U = METRIC_UI[k];
      C.lineChart(el, { x: days, series: [{ name: U.label, color: U.color, values: rows.map(r => r[k]), points: true, area: true }], band: b ? { lo: b.mean - 2 * b.sd, hi: b.mean + 2 * b.sd, label: "baseline ±2 SD" } : null, height: 250, xLabel: d => "Day " + d, unit: A.METRICS[k].unit });
      $("#trendLegend").innerHTML = `<span><i style="background:${U.color}"></i>${U.label} (${A.METRICS[k].unit})</span><span><i class="box" style="background:rgba(34,197,94,.25)"></i>Individual baseline ±2 SD</span>`;
    }
  }

  /* ================= VIEW: Health Dashboard ================= */
  function rangeRows() {
    const all = vitals(), r = state.range;
    let from = r.from, to = Math.min(r.to, state.day);
    if (r.preset !== "custom") { const n = r.preset === "all" ? 9999 : +r.preset; to = state.day; from = Math.max(1, state.day - n + 1); }
    return { rows: all.filter(x => x.day >= from && x.day <= to), from, to };
  }
  function vHealth() {
    const a = astro(), { rows, from, to } = rangeRows(), m = state.metric, an = analysis(), U = METRIC_UI[m] || METRIC_UI.heart_rate, s = an.series[m];
    const vals = rows.map(r => r[m]).filter(v => v !== null && v !== undefined);
    const mean = vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : null;
    const lvl = metricLevel(an, m), zl = s.z[s.z.length - 1];
    const last = vitals().slice(-1)[0];
    return `
    <div class="ph"><div><div class="h1">Health Dashboard</div><div class="sub">${esc(a.full_name)} · daily resting measurements ${SIM}</div></div>
      <button class="btn" id="addVitBtn">${I(ICON.plus, 16)}Add measurement</button></div>
    <div class="card" style="margin-bottom:16px">
      <div class="toolbar">
        <span class="seg" id="metricSeg">${Object.keys(A.METRICS).map(k => `<button data-m="${k}" class="${k === m ? "on" : ""}">${A.METRICS[k].label.replace("Blood oxygen (SpO₂)", "SpO₂")}</button>`).join("")}</span>
        <span style="flex:1"></span>
        <span class="seg" id="rangeSeg">${[["7", "7 d"], ["30", "30 d"], ["90", "90 d"], ["all", "All"], ["custom", "Custom"]].map(([k, l]) => `<button data-r="${k}" class="${state.range.preset === k ? "on" : ""}">${l}</button>`).join("")}</span>
        <label class="field" style="flex-direction:row;align-items:center;gap:6px">From <input class="input" type="number" id="rFrom" min="1" max="${state.day}" value="${from}" style="width:76px"></label>
        <label class="field" style="flex-direction:row;align-items:center;gap:6px">To <input class="input" type="number" id="rTo" min="1" max="${state.day}" value="${to}" style="width:76px"></label>
      </div>
      <div class="chart" id="hChart"></div>
      <div class="legend"><span><i style="background:${U.color}"></i>Daily value</span><span><i style="background:#fff"></i>7-day moving average</span><span><i class="box" style="background:rgba(34,197,94,.25)"></i>Baseline ±2 SD (days 1–14)</span><span><i class="box" style="background:transparent;border:2px solid #ef4444;border-radius:50%"></i>Isolation Forest anomaly</span></div>
    </div>
    <div class="grid g4" style="margin-bottom:16px">
      <div class="card"><h3>Latest (${dayLabel(last.day)})</h3><div class="metric"><div class="v">${fx(last[m], A.METRICS[m].dp)}<span class="u">${A.METRICS[m].unit}</span></div></div></div>
      <div class="card"><h3>Mean in range</h3><div class="metric"><div class="v">${fx(mean, A.METRICS[m].dp + 1)}<span class="u">${A.METRICS[m].unit}</span></div><div class="meta">Days ${from}–${to} · n=${vals.length}</div></div></div>
      <div class="card"><h3>Individual baseline</h3><div class="metric"><div class="v">${s.baseline ? fx(s.baseline.mean, A.METRICS[m].dp + 1) : "—"}<span class="u">± ${s.baseline ? fx(s.baseline.sd, 2) : "—"}</span></div><div class="meta">Days 1–14, mean ± SD</div></div></div>
      <div class="card"><h3>Trend z-score ${stBadge(lvl, levelTxt[lvl])}</h3><div class="metric"><div class="v">${zl === null || zl === undefined ? "—" : (zl > 0 ? "+" : "") + zl.toFixed(2)}<span class="u">SD</span></div><div class="meta">7-day average vs baseline</div></div></div>
    </div>
    <div class="card"><h3><span class="l">Measurements · days ${from}–${to}</span><span class="sub">${rows.length} days</span></h3>
      <div class="tw" style="max-height:340px"><table><thead><tr><th>Day</th><th>Date</th><th class="n">HR</th><th class="n">SpO₂</th><th class="n">BP</th><th class="n">Temp</th><th class="n">Sleep</th><th>Source</th></tr></thead><tbody>
      ${rows.slice().reverse().map(r => `<tr><td>${r.day}</td><td>${fmtDate(r.day)}</td><td class="n">${r.heart_rate}</td><td class="n">${r.spo2}%</td><td class="n">${r.systolic_pressure}/${r.diastolic_pressure}</td><td class="n">${fx(r.body_temperature, 1)}</td><td class="n">${fx(r.sleep_hours, 1)} h</td><td>${r.manual ? MAN : SIM}</td></tr>`).join("")}
      </tbody></table></div></div>`;
  }
  function pHealth() {
    const { rows } = rangeRows(), m = state.metric, an = analysis(), U = METRIC_UI[m], s = an.series[m];
    const all = vitals(), idx = rows.map(r => all.findIndex(x => x.day === r.day));
    const ma = idx.map(i => s.ma[i]), flagged = new Set(an.ifRes.flagged || []);
    C.lineChart($("#hChart"), { x: rows.map(r => r.day), height: 300, xLabel: d => "Day " + d, unit: A.METRICS[m].unit,
      series: [{ name: "Daily", color: U.color, values: rows.map(r => r[m]), area: true, points: rows.length <= 45 ? 2.6 : false }, { name: "7-day avg", color: "#ffffff", values: ma, width: 1.6, dash: "5 4" }],
      band: s.baseline ? { lo: s.baseline.mean - 2 * s.baseline.sd, hi: s.baseline.mean + 2 * s.baseline.sd, label: "baseline ±2 SD" } : null,
      markers: rows.filter(r => flagged.has(r.day)).map(r => ({ x: r.day, color: "#ef4444" })),
      tooltip: i => { const r = rows[i], z = s.zDaily[idx[i]]; return `<b>Mission day ${r.day} · ${fmtDate(r.day)}</b><div class="row"><span>${A.METRICS[m].label}</span><span>${fx(r[m], A.METRICS[m].dp)} ${A.METRICS[m].unit}</span></div><div class="row"><span>7-day avg</span><span>${fx(ma[i], 1)}</span></div><div class="row"><span>z vs baseline</span><span>${z === null ? "—" : z.toFixed(2)}</span></div>${flagged.has(r.day) ? `<div style="color:#f87171;margin-top:4px">Isolation Forest: unusual day</div>` : ""}${r.manual ? `<div style="color:#60a5fa">Manual entry</div>` : ""}`; } });
  }
  function addVitalsForm() {
    const last = vitals().slice(-1)[0];
    openModal(`<h2>Add health measurement</h2><p class="sub" style="margin-bottom:14px">${esc(astro().full_name)} · saved in this browser and analysed immediately.</p>
    <form id="vitForm" class="form">
      <label class="field">Mission day<input class="input" name="day" type="number" min="1" max="${state.day}" value="${state.day}" required></label>
      <label class="field">Heart rate (BPM)<input class="input" name="heart_rate" type="number" min="30" max="220" value="${last.heart_rate}" required></label>
      <label class="field">SpO₂ (%)<input class="input" name="spo2" type="number" min="70" max="100" value="${last.spo2}" required></label>
      <label class="field">Systolic (mmHg)<input class="input" name="systolic_pressure" type="number" min="70" max="220" value="${last.systolic_pressure}" required></label>
      <label class="field">Diastolic (mmHg)<input class="input" name="diastolic_pressure" type="number" min="40" max="140" value="${last.diastolic_pressure}" required></label>
      <label class="field">Body temp (°C)<input class="input" name="body_temperature" type="number" step="0.1" min="34" max="41" value="${last.body_temperature}" required></label>
      <label class="field">Sleep (hours)<input class="input" name="sleep_hours" type="number" step="0.1" min="0" max="14" value="${last.sleep_hours}" required></label>
      <div style="grid-column:1/-1;display:flex;gap:10px;justify-content:flex-end;margin-top:6px"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">${I(ICON.check, 16)}Save measurement</button></div>
    </form>`);
    $("#vitForm").onsubmit = e => {
      e.preventDefault(); const f = new FormData(e.target), r = {};
      for (const [k, v] of f.entries()) r[k] = k === "day" ? Math.round(+v) : +v;
      if (r.day < 1 || r.day > state.day) return toast("Mission day must be between 1 and " + state.day);
      (store.manualVitals[state.astro] = (store.manualVitals[state.astro] || []).filter(x => x.day !== r.day)).push(r);
      save(); cache.clear(); logEvent(`${astro().full_name}: health measurement saved for mission day ${r.day}`);
      closeModal(); toast("Measurement saved · dashboard and AI analysis updated"); render();
    };
  }

  /* ================= VIEW: Bone Health ================= */
  const BONE_COL = { urine_calcium: "#22D3EE", urine_ntx: "#f472b6", urine_ctx: "#a78bfa", urine_creatinine: "#facc15" };
  const BONE_DESC = { urine_calcium: "Calcium excretion — tracks changes in calcium metabolism.", urine_ntx: "Collagen cross-link fragment — marker of bone resorption.", urine_ctx: "C-telopeptide — second resorption marker, useful for trends.", urine_creatinine: "Used to normalise urinary marker concentrations." };
  function vBone() {
    const an = analysis(), br = an.boneRes, tests = bone(), a = astro();
    const pre = tests.filter(t => t.day <= 1), during = tests.filter(t => t.day > 1);
    const narrative = A.boneNarrative(br);
    const lvl = A.maxLevel(Object.values(br).filter(Boolean).map(r => r.level));
    return `
    <div class="ph"><div><div class="h1">Bone Health</div><div class="sub">Urine biomarkers of bone metabolism · ${esc(a.full_name)} ${SIM}</div></div>
      <button class="btn" id="addUrineBtn">${I(ICON.plus, 16)}Add urine lab result</button></div>
    <div class="banner warn">${I(ICON.alert, 16)}<div><b style="color:#fde68a">What these markers can and cannot tell you.</b> Urine biomarkers reflect bone <i>turnover activity</i> (resorption). They do <b>not</b> measure bone mineral density and cannot diagnose osteoporosis. Bone density and structure require DXA or other clinical imaging (e.g. QCT).</div></div>
    <div class="grid g4" style="margin-bottom:16px">${Object.keys(A.BONE).map(k => {
      const B = A.BONE[k], r = br[k];
      if (!r) return `<div class="card"><h3>${B.label}</h3><div class="empty">No results yet</div></div>`;
      return `<div class="card metric hover"><h3><span class="l"><span style="width:9px;height:9px;border-radius:3px;background:${BONE_COL[k]};display:inline-block"></span>${B.label}</span>${stBadge(r.lastDay <= 1 ? "normal" : r.level, r.lastDay <= 1 ? "Baseline" : undefined)}</h3>
        <div class="v">${fx(r.last, B.dp)}<span class="u">${B.unit}</span></div>
        <div class="spark" data-spark="${esc(JSON.stringify(r.series.map(p => p.v)))}" data-color="${BONE_COL[k]}"></div>
        <dl class="kv" style="margin-top:8px;font-size:12px"><dt>Individual baseline</dt><dd>${fx(r.base, B.dp)}</dd><dt>Change vs baseline</dt><dd style="color:${LVC[r.level]}">${sign(r.pct)}</dd><dt>Last test</dt><dd>${dayLabel(r.lastDay)} · ${fmtDate(r.lastDay)}</dd></dl>
        <div class="meta" style="margin-top:6px"><span>${BONE_DESC[k]}</span></div></div>`;
    }).join("")}</div>
    <div class="grid g2" style="margin-bottom:16px">
      <div class="card"><h3><span class="l">Historical trend · % change from individual baseline</span></h3><div class="chart" id="boneTrend"></div>
        <div class="legend">${Object.keys(A.BONE).map(k => `<span><i style="background:${BONE_COL[k]}"></i>${A.BONE[k].short}</span>`).join("")}<span>dashed lines: attention thresholds</span></div></div>
      <div class="card"><h3><span class="l">Before · During · After the mission</span></h3><div class="chart" id="bonePhase"></div>
        <div class="legend">${Object.keys(A.BONE).slice(0, 3).map(k => `<span><i class="box" style="background:${BONE_COL[k]}"></i>${A.BONE[k].short}</span>`).join("")}<span>mean % of baseline · "After" available once the crew returns</span></div></div>
    </div>
    <div class="card" style="margin-bottom:16px"><h3><span class="l">${I(ICON.spark, 17)} AI Bone Health Analysis</span>${stBadge(lvl)}</h3>
      <div class="ai"><div class="ic" style="color:var(--cyan)">${I(ICON.bone, 18)}</div><div>${narrative.map(p => `<p>${esc(p)}</p>`).join("")}<p style="font-size:11.5px;color:var(--mu)">Method: % change of each marker from this astronaut's mean pre-flight value (L-60, L-30, L-7, day 1); attention / critical thresholds Ca²⁺ +20/+40%, NTx & CTX +30/+60%. Not a diagnosis.</p></div></div></div>
    <div class="card" style="margin-bottom:16px"><h3><span class="l">Urine laboratory results</span><span class="sub">${tests.length} tests · ${pre.length} pre-flight, ${during.length} in-flight</span></h3>
      <div class="tw"><table><thead><tr><th>Test date</th><th>Mission day</th><th class="n">Calcium<br>mg/24 h</th><th class="n">NTx<br>nmol BCE/mmol Cr</th><th class="n">CTX<br>µg/mmol Cr</th><th class="n">Creatinine<br>g/24 h</th><th>Sample type</th><th>Source</th></tr></thead><tbody>
      ${tests.slice().reverse().map(t => `<tr><td>${fmtDate(t.day)}</td><td>${dayLabel(t.day)}</td><td class="n">${t.urine_calcium}</td><td class="n">${fx(t.urine_ntx, 1)}</td><td class="n">${t.urine_ctx}</td><td class="n">${fx(t.urine_creatinine, 2)}</td><td class="wrap" style="min-width:220px;font-size:12px;color:var(--tx2)">${esc(t.sample_type)}</td><td>${t.manual ? MAN : SIM}</td></tr>`).join("")}
      </tbody></table></div></div>
    ${REF ? `<div class="card" style="margin-bottom:16px"><h3><span class="l">Real spaceflight reference · Inspiration4 crew serum chemistry ${NASA("NASA OSDR · OSD-575")}</span></h3>
      <p class="sub" style="margin-bottom:10px">Real data from 4 civilian astronauts on a 3-day orbital flight (2021). Serum markers, not urine — shown to compare with actual pre- vs post-flight variation. L = days before launch, R = days after return.</p>
      <div class="toolbar"><span class="seg" id="refSeg">${["Serum calcium", "Alkaline phosphatase"].filter(k => REF.analytes[k]).map(k => `<button data-ref="${k}" class="${(state.rec.ref || "Serum calcium") === k ? "on" : ""}">${k}</button>`).join("")}</span></div>
      <div class="chart" id="refChart"></div><div class="legend"><span><i style="background:#22D3EE"></i>Crew mean</span><span><i class="box" style="background:rgba(34,211,238,.18)"></i>Min–max of 4 crew</span><span><i class="box" style="background:rgba(34,197,94,.25)"></i>Lab reference range</span></div></div>` : ""}
    <div class="card"><h3><span class="l">How microgravity affects bone metabolism</span></h3>
      <div class="edu">
        <div class="step"><div class="num">01 · UNLOADING</div><h4>Less mechanical load</h4><p>In weightlessness the skeleton — especially hips, spine and legs — no longer carries body weight, removing the main signal that maintains bone.</p></div>
        <div class="step"><div class="num">02 · RESORPTION</div><h4>Bone breakdown increases</h4><p>Osteoclast activity rises while formation does not keep pace. Collagen fragments such as NTx and CTX appear in urine.</p></div>
        <div class="step"><div class="num">03 · CALCIUM</div><h4>Calcium leaves the body</h4><p>Released calcium is excreted by the kidneys, raising urinary calcium and kidney-stone risk.</p></div>
        <div class="step"><div class="num">04 · OUTCOME</div><h4>Measurable density loss</h4><p>Long-duration ISS crews lost on average about 1–1.5% of hip and spine bone mineral density per month without modern countermeasures (LeBlanc et al., 2000), measured by DXA.</p></div>
        <div class="step"><div class="num">05 · COUNTERMEASURES</div><h4>Exercise & nutrition</h4><p>High-load resistive exercise (ARED), adequate vitamin D and calcium, and — in studies — bisphosphonates reduce the loss. Monitoring markers helps time and evaluate them.</p></div>
      </div></div>`;
  }
  function pBone() {
    drawSparks($("#view"));
    const br = analysis().boneRes, tests = bone(), xs = tests.map(t => t.day);
    const ks = Object.keys(A.BONE).filter(k => br[k]);
    C.lineChart($("#boneTrend"), { x: xs, height: 270, xLabel: d => d >= 1 ? "D" + d : "L" + d, yFmt: v => (v > 0 ? "+" : "") + Math.round(v) + "%",
      series: ks.map(k => ({ name: A.BONE[k].short, color: BONE_COL[k], values: br[k].series.map(p => p.pct), points: 3 })),
      refLines: [{ y: 0, color: "#22c55e", label: "baseline" }, { y: 30, color: "#facc15", label: "NTx/CTX attention +30%" }, { y: 20, color: "rgba(250,204,21,.45)" }],
      shade: [{ from: xs[0], to: 1, color: "rgba(34,197,94,.05)" }],
      tooltip: i => `<b>${tests[i].day >= 1 ? "Mission day " + tests[i].day : "Pre-flight " + dayLabel(tests[i].day)} · ${fmtDate(tests[i].day)}</b>` + ks.map(k => `<div class="row"><span>${A.BONE[k].short}</span><span>${fx(tests[i][k], A.BONE[k].dp)} (${sign(br[k].series[i].pct)})</span></div>`).join("") });
    const pre = tests.filter(t => t.day <= 1), dur = tests.filter(t => t.day > 1);
    const pct = (arr, k) => arr.length ? arr.reduce((s, t) => s + t[k], 0) / arr.length / br[k].base * 100 : null;
    const ks3 = ["urine_calcium", "urine_ntx", "urine_ctx"].filter(k => br[k]);
    C.barChart($("#bonePhase"), { categories: ["Before", "During", "After"], sublabels: [`pre-flight (n=${pre.length})`, `in-flight (n=${dur.length})`, "mission in progress"], height: 270, unit: "% of baseline",
      series: ks3.map(k => ({ name: A.BONE[k].short, color: BONE_COL[k], values: [pct(pre, k), pct(dur, k), null], notes: ["Mean of pre-flight tests", "Mean of in-flight tests to date", ""] })), refLine: 100, yFmt: v => Math.round(v) + "%" });
    if (REF && $("#refChart")) {
      const key = state.rec.ref || "Serum calcium", R = REF.analytes[key], s = R.series;
      const lo = parseFloat(R.lab_range[0]), hi = parseFloat(R.lab_range[1]);
      C.lineChart($("#refChart"), { x: s.map((_, i) => i), height: 230, xLabel: i => s[Math.round(i)] ? s[Math.round(i)].tp : "", unit: R.unit,
        series: [{ name: "max", color: "rgba(34,211,238,.35)", values: s.map(p => p.max), dash: "2 3", width: 1, noTip: true }, { name: "min", color: "rgba(34,211,238,.35)", values: s.map(p => p.min), dash: "2 3", width: 1, noTip: true }, { name: "Crew mean", color: "#22D3EE", values: s.map(p => p.mean), points: 3.5 }],
        band: isFinite(lo) && isFinite(hi) ? { lo, hi, label: "lab reference range" } : null, shade: [{ from: s.findIndex(p => p.tp.startsWith("R")) - 0.51, to: s.findIndex(p => p.tp.startsWith("R")) - 0.49, color: "rgba(34,211,238,.55)" }],
        tooltip: i => `<b>${s[i].tp} · Inspiration4 (n=${s[i].n})</b><div class="row"><span>Crew mean</span><span>${s[i].mean} ${R.unit}</span></div><div class="row"><span>Range</span><span>${s[i].min}–${s[i].max}</span></div><div style="color:#7f94b0;margin-top:3px">NASA OSDR OSD-575 · ${esc(REF.file)}</div>` });
    }
  }
  function addUrineForm() {
    const last = bone().slice(-1)[0];
    openModal(`<h2>Add urine laboratory result</h2><p class="sub" style="margin-bottom:14px">${esc(astro().full_name)} · results are compared with the individual pre-flight baseline immediately.</p>
    <form id="urForm" class="form">
      <label class="field">Mission day<input class="input" name="day" type="number" min="2" max="${state.day}" value="${state.day}" required></label>
      <label class="field">Calcium (mg/24 h)<input class="input" name="urine_calcium" type="number" min="20" max="800" value="${last.urine_calcium}" required></label>
      <label class="field">NTx (nmol BCE/mmol Cr)<input class="input" name="urine_ntx" type="number" step="0.1" min="5" max="300" value="${last.urine_ntx}" required></label>
      <label class="field">CTX (µg/mmol Cr)<input class="input" name="urine_ctx" type="number" min="20" max="2000" value="${last.urine_ctx}" required></label>
      <label class="field">Creatinine (g/24 h)<input class="input" name="urine_creatinine" type="number" step="0.01" min="0.3" max="3" value="${last.urine_creatinine}" required></label>
      <label class="field" style="grid-column:span 2">Sample type<select class="input" name="sample_type"><option>24-h urine (Ca, creatinine) + 2nd-morning void (NTx, CTX)</option><option>24-h urine pool</option><option>Spot urine (2nd-morning void)</option></select></label>
      <div style="grid-column:1/-1;display:flex;gap:10px;justify-content:flex-end;margin-top:6px"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">${I(ICON.check, 16)}Save result</button></div>
    </form>`);
    $("#urForm").onsubmit = e => {
      e.preventDefault(); const f = new FormData(e.target), t = { phase: "in-flight" };
      for (const [k, v] of f.entries()) t[k] = k === "sample_type" ? v : k === "day" ? Math.round(+v) : +v;
      (store.manualUrine[state.astro] = store.manualUrine[state.astro] || []).push(t);
      (store.records[state.astro] = store.records[state.astro] || []).push({ id: `M${Date.now()}`, astronaut_id: state.astro, test_day: t.day, record_type: "urine", title: "Urine bone-marker panel", values: { "Calcium (mg/24h)": t.urine_calcium, "NTx (nmol BCE/mmol Cr)": t.urine_ntx, "CTX (µg/mmol Cr)": t.urine_ctx, "Creatinine (g/24h)": t.urine_creatinine }, notes: t.sample_type, file_url: null, source: "manual" });
      save(); cache.clear(); logEvent(`${astro().full_name}: urine lab result added for mission day ${t.day}`);
      closeModal(); toast("Urine result saved · bone analysis updated"); render();
    };
  }

  /* ================= VIEW: AI Analysis ================= */
  function vAI() {
    const an = analysis(), a = astro(), f = state.ai.level;
    const obs = an.obs.filter(o => f === "all" || o.level === f);
    const cnt = l => an.obs.filter(o => o.level === l).length;
    const pyA = PY && PY.by_astronaut[state.astro];
    const hist = historyFor(state.astro);
    return `
    <div class="ph"><div><div class="h1">AI Analysis</div><div class="sub">${esc(a.full_name)} · data up to mission day ${state.day}</div></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn ghost" id="exportAlerts">${I(ICON.download, 16)}Export alerts (JSON)</button><button class="btn" id="reportBtn" ${state.day < 90 ? "disabled title='Available from mission day 90'" : ""}>${I(ICON.file, 16)}Medical officer report</button></div></div>
    <div class="banner info">${I(ICON.info, 16)}<div>The analysis compares each astronaut with <b>their own baseline</b>, detects unusual changes and combinations, and explains them in plain language. It <b>does not</b> produce diagnoses or treatment instructions — every observation ends with a monitoring or review step for the crew medical officer.</div></div>
    <div class="grid g4" style="margin-bottom:16px">
      <div class="card"><h3>Overall level</h3>${stBadge(an.baselineReady ? an.level : "none", an.baselineReady ? undefined : "Baseline pending")}<div class="sub" style="margin-top:8px">${an.obs.length} observation${an.obs.length === 1 ? "" : "s"}</div></div>
      <div class="card"><h3>Critical</h3><div class="metric"><div class="v" style="color:var(--crit)">${cnt("critical")}</div></div></div>
      <div class="card"><h3>Attention</h3><div class="metric"><div class="v" style="color:var(--warn)">${cnt("attention")}</div></div></div>
      <div class="card"><h3>Data used</h3><div class="sub">${vitals().length} days of vitals · ${bone().length} urine tests · baseline days 1–14</div></div>
    </div>
    <div class="card" style="margin-bottom:16px"><h3><span class="l">${I(ICON.spark, 17)} Risk observations</span><span class="seg" id="lvlSeg">${["all", "critical", "attention"].map(l => `<button data-l="${l}" class="${f === l ? "on" : ""}">${l[0].toUpperCase() + l.slice(1)}</button>`).join("")}</span></h3>
      <div class="list">${obs.length ? obs.map(o => `<div class="obs ${o.level}">
        <div class="hd"><div class="t">${esc(o.title)}</div><div style="display:flex;gap:8px;align-items:center">${stBadge(o.level)}<span class="tag sim" style="color:var(--mu);border-color:var(--line2);background:none">${esc(o.method)}</span></div></div>
        <div class="nums"><span>Metric <b>${esc(o.metric)}</b></span>${o.prev !== null ? `<span>${o.prevLabel} <b>${fx(o.prev, o.dp + (o.unit === "score" ? 0 : 1))} ${o.unit}</b></span>` : ""}${o.cur !== null ? `<span>${o.curLabel} <b>${fx(o.cur, o.dp + (o.unit === "score" ? 0 : 1))} ${o.unit}</b></span>` : ""}${o.pct !== null && o.pct !== undefined ? `<span>Change <b style="color:${LVC[o.level]}">${sign(o.pct)}</b></span>` : ""}${o.z !== undefined && o.z !== null ? `<span>z <b>${o.z.toFixed(2)}</b></span>` : ""}<span>Since <b>${dayLabel(o.created_day)}</b></span></div>
        <div class="ex">${esc(o.explanation)}</div>
        <div class="nx"><b style="color:var(--cyan)">Recommended next action:</b> ${esc(o.next)}</div></div>`).join("") : `<div class="empty">${an.baselineReady ? "No observations at this level — all monitored measurements are within the individual baseline range." : "Baseline is being established (mission days 1–14). Analysis starts on day 15."}</div>`}</div></div>
    <div class="grid g2" style="margin-bottom:16px">
      <div class="card"><h3><span class="l">Isolation Forest · daily anomaly score</span><span class="sub">6 vital signs, z-scored to baseline</span></h3>
        ${an.ifRes.status === "ok" ? `<div class="chart" id="ifChart"></div><div class="legend"><span><i style="background:#22D3EE"></i>Anomaly score</span><span><i style="background:#ef4444"></i>Threshold ${A.IF_THRESHOLD}</span><span>Flagged days: <b style="color:#fff">${an.ifRes.flagged.length ? an.ifRes.flagged.join(", ") : "none"}</b></span></div>` : `<div class="empty">Isolation Forest needs at least 30 days of data (currently ${vitals().length}).</div>`}</div>
      <div class="card"><h3><span class="l">Python cross-check · pandas + scikit-learn</span></h3>
        ${pyA ? `<p class="sub" style="margin-bottom:10px">The same pipeline was run offline with <code>sklearn.ensemble.IsolationForest</code> on the full 120-day demo record (<code>analysis/build_demo_data.py</code>).</p>
        <dl class="kv"><dt>scikit-learn flagged days</dt><dd>${pyA.isolation_forest.flagged_days.join(", ") || "none"}</dd><dt>In-browser engine (to day ${state.day})</dt><dd>${(an.ifRes.flagged || []).join(", ") || "none"}</dd><dt>Agreement</dt><dd>${agreement(pyA.isolation_forest.flagged_days, an.ifRes.flagged || [])}</dd><dt>Parameters</dt><dd style="font-weight:400;font-size:12px">${esc(pyA.isolation_forest.params)}</dd></dl>
        <h3 style="margin-top:16px">Methods</h3><dl class="kv" style="font-size:12.5px"><dt>Moving average</dt><dd style="font-weight:400;text-align:left">7-day window smooths day-to-day noise.</dd><dt>Z-score</dt><dd style="font-weight:400;text-align:left">(7-day avg − baseline mean) / baseline SD; ≥2 attention, ≥3 critical.</dd><dt>Isolation Forest</dt><dd style="font-weight:400;text-align:left">Finds days whose combination of vitals is easy to isolate (unusual), even if each value is only mildly off.</dd></dl>` : `<div class="empty">py_analysis.js not found.</div>`}</div>
    </div>
    ${valCard()}
    <div class="card"><h3><span class="l">Alert history</span><span class="sub">${hist.length} alerts · first raised day shown</span></h3>
      <div class="tw" style="max-height:360px"><table><thead><tr><th>Raised</th><th>Metric</th><th>Level</th><th>Description</th><th>Status</th><th></th></tr></thead><tbody>
      ${hist.length ? hist.map(h => `<tr><td>${dayLabel(h.created_day)}<div class="sub" style="font-size:11px">${fmtDate(h.created_day)}</div></td><td>${esc(h.metric)}</td><td>${stBadge(h.level)}</td><td class="wrap" style="min-width:260px;font-size:12.5px">${esc(h.title)}</td><td>${h.acked ? `<span class="st none">Acknowledged</span>` : h.active ? `<span class="st attention">Active</span>` : `<span class="st normal">Resolved</span>`}</td><td>${h.active && !h.acked ? `<button class="btn sm ghost" data-ack="${esc(h.key)}">Acknowledge</button>` : ""}</td></tr>`).join("") : `<tr><td colspan="6" class="sub">No alerts raised yet.</td></tr>`}
      </tbody></table></div></div>`;
  }
  function agreement(a, b) { const A1 = new Set(a), B1 = new Set(b); const inter = [...A1].filter(x => B1.has(x)).length, uni = new Set([...a, ...b]).size; return uni ? `${inter}/${uni} days (Jaccard ${(inter / uni).toFixed(2)})` : "both: none flagged"; }
  function historyFor(id) {
    const seen = new Map(), cur = new Set(analysis(id).obs.map(o => o.key));
    const checkpoints = [...new Set([...[15, 20, 30, 40, 45, 50, 60, 70, 75, 80, 86, 88, 90, 100, 105, 110, 120].filter(d => d <= state.day), state.day])];
    checkpoints.forEach(d => analysis(id, d).obs.forEach(o => { if (!seen.has(o.key)) seen.set(o.key, { ...o }); }));
    return [...seen.values()].map(o => ({ ...o, active: cur.has(o.key), acked: !!store.acks[`${id}:${o.key}`] })).sort((x, y) => y.created_day - x.created_day || A.LV[y.level] - A.LV[x.level]);
  }
  /* ===== Validation on REAL NASA data (OSD-575), generated by analysis/validate_osd575.py ===== */
  function valCard() {
    const V = window.SV_VAL; if (!V) return "";
    const r1 = V.by_timepoint["R+1"], r194 = V.by_timepoint["R+194"];
    return `<div class="card" style="margin-bottom:16px"><h3><span class="l">${I(ICON.check, 17)} Method check on real NASA data</span>${NASA("OSD-575")}</h3>
      <p class="sub" style="margin-bottom:12px">The same personal-baseline method, applied to the real serum chemistry of the ${V.crew_n} Inspiration4 crew members (${V.analytes_n} analytes). ${esc(V.method)} No simulated data on this card.</p>
      <div class="grid g2">
        <div style="min-width:0"><div class="chart" id="valChart"></div><div class="legend"><span><i style="background:#22D3EE"></i>Flagged vs personal baseline</span><span><i style="background:#94a3b8"></i>Outside lab reference range</span></div></div>
        <div style="min-width:0">
          <div class="kpis" style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap">
            <div class="card" style="flex:1;min-width:150px;padding:12px"><div class="sub">Day after landing (R+1)</div><div class="metric"><div class="v" style="color:var(--cyan)">${r1.personal}</div></div><div class="sub">changes vs personal baseline, of ${r1.comparisons}</div></div>
            <div class="card" style="flex:1;min-width:150px;padding:12px"><div class="sub">Missed by lab ranges</div><div class="metric"><div class="v" style="color:var(--warn)">${r1.personal_only}</div></div><div class="sub">flagged values still inside the normal lab range</div></div>
          </div>
          <div class="tw"><table style="font-size:12.5px"><thead><tr><th>Crew</th><th>Analyte</th><th>R+1</th><th>Pre-flight mean</th><th>Change</th><th>Lab range</th></tr></thead><tbody>
          ${V.r1_flags.slice(0, 6).map(o => `<tr><td>${esc(o.subject)}</td><td>${esc(o.analyte)}</td><td><b>${o.value} ${esc(o.unit)}</b></td><td>${o.pre_mean}</td><td>${o.pct > 0 ? "+" : ""}${o.pct}%</td><td>${o.in_lab_range ? "inside" : "<b style='color:var(--warn)'>outside</b>"}</td></tr>`).join("")}
          </tbody></table></div>
          <div class="sub" style="font-size:11.5px;margin-top:6px">Source: ${esc(V.file)}, row numbers kept in data/osd575_validation.js.</div>
        </div>
      </div>
      <div class="banner info" style="margin-top:14px">${I(ICON.info, 16)}<div><b>What this shows — and what it does not.</b> Personal baselines catch ${r1.personal_only} changes the day after landing that standard lab ranges call normal. But the method still flags ${r194.personal} values six months later (R+194), when the crew should be back to normal: three pre-flight samples underestimate natural day-to-day variation. That is why SPACEVITALS judges vital signs on 7-day averages, lets a bone marker reach Critical only when a repeat test confirms it, and why calibrating baselines on long-duration NASA OSDR data is our next step. This card reports detected changes, not health effects.</div></div>
    </div>`;
  }
  function pVal() {
    const V = window.SV_VAL, el = $("#valChart"); if (!V || !el) return;
    const tps = Object.keys(V.by_timepoint);
    C.barChart(el, { categories: tps, height: 230, series: [{ name: "Flagged vs personal baseline", color: "#22D3EE", values: tps.map(t => V.by_timepoint[t].personal) }, { name: "Outside lab reference range", color: "#94a3b8", values: tps.map(t => V.by_timepoint[t].lab) }] });
  }
  function pAI() {
    pVal();
    const an = analysis(); if (an.ifRes.status !== "ok" || !$("#ifChart")) return;
    const r = an.ifRes, fl = new Set(r.flagged);
    C.lineChart($("#ifChart"), { x: r.days, height: 240, xLabel: d => "Day " + d, yFmt: v => v.toFixed(2), series: [{ name: "Anomaly score", color: "#22D3EE", values: r.scores, area: true }], refLines: [{ y: A.IF_THRESHOLD, color: "#ef4444", label: "threshold" }],
      markers: r.days.filter(d => fl.has(d)).map(d => ({ x: d, color: "#ef4444" })),
      tooltip: i => `<b>Mission day ${r.days[i]}</b><div class="row"><span>Anomaly score</span><span>${r.scores[i].toFixed(3)}</span></div>${fl.has(r.days[i]) ? `<div style="color:#f87171">Flagged as unusual</div>` : ""}`, onClick: i => { state.view = "health"; state.range = { preset: "custom", from: Math.max(1, r.days[i] - 10), to: Math.min(state.day, r.days[i] + 10) }; location.hash = "health"; } });
  }

  /* ================= VIEW: Radiation Monitor (NASA DONKI) ================= */
  const DTYPES = { FLR: { label: "Solar flare", color: "#facc15" }, CME: { label: "Coronal mass ejection", color: "#f472b6" }, SEP: { label: "Solar energetic particles", color: "#ef4444" }, GST: { label: "Geomagnetic storm", color: "#a78bfa" } };
  const iso = d => d.toISOString().slice(0, 10);
  function vRadiation() {
    const dz = state.donki; if (!dz.from) { dz.to = iso(new Date()); dz.from = iso(new Date(Date.now() - 30 * 864e5)); }
    const d = dose(), cum = d.reduce((s, r) => s + r.measured_dose, 0), last = d[d.length - 1];
    const evs = dz.events.filter(e => dz.types[e.type]).sort((a, b) => b.date - a.date);
    const badge = { live: NASA("Live · NASA DONKI"), cached: `<span class="tag cache">Cached ${dz.fetchedAt ? new Date(dz.fetchedAt).toLocaleString("en-GB") : ""}</span>`, sample: SIM.replace("Simulated", "Sample data"), loading: `<span class="tag nasa">Loading…</span>`, idle: "" }[dz.status] || "";
    return `
    <div class="ph"><div><div class="h1">Radiation Monitor</div><div class="sub">Space weather from NASA DONKI · personal dosimeter ${SIM}</div></div></div>
    <div class="banner info">${I(ICON.info, 16)}<div><b>Space weather ≠ personal dose.</b> NASA DONKI reports space-weather <i>events</i> (flares, CMEs, particle events, geomagnetic storms) near Earth. It does not give any astronaut's radiation dose. Personal dose comes only from dosimeter measurements — simulated in this demo — and is never calculated from a solar event.</div></div>
    <div class="card" style="margin-bottom:16px">
      <h3><span class="l">Space weather events · NASA DONKI (CCMC) ${badge}</span></h3>
      <div class="toolbar">
        <label class="field" style="flex-direction:row;align-items:center;gap:6px">From <input class="input" type="date" id="dzFrom" value="${dz.from}" style="width:150px"></label>
        <label class="field" style="flex-direction:row;align-items:center;gap:6px">To <input class="input" type="date" id="dzTo" value="${dz.to}" style="width:150px"></label>
        <span class="seg" id="dzTypes">${Object.keys(DTYPES).map(k => `<button data-t="${k}" class="${dz.types[k] ? "on" : ""}" title="${DTYPES[k].label}">${k}</button>`).join("")}</span>
        <button class="btn" id="dzFetch">${I(ICON.refresh, 16)}Fetch from NASA</button>
      </div>
      ${dz.msg ? `<div class="banner ${dz.status === "live" ? "info" : "warn"}" style="margin-bottom:12px">${I(ICON.info, 16)}<div>${esc(dz.msg)}</div></div>` : ""}
      <div class="chart" id="dzTimeline"></div>
      <div class="legend">${Object.entries(DTYPES).map(([k, v]) => `<span><i class="box" style="background:${v.color};border-radius:50%"></i>${k} · ${v.label}</span>`).join("")}</div>
    </div>
    <div class="grid" style="grid-template-columns:minmax(0,1.3fr) minmax(300px,1fr);margin-bottom:16px" id="radRow">
      <div class="card"><h3><span class="l">Latest events</span><span class="sub">${evs.length} event${evs.length === 1 ? "" : "s"}</span></h3>
        <div style="max-height:460px;overflow:auto">${evs.length ? evs.map(e => `<div class="event"><div class="ty" style="background:${DTYPES[e.type].color}22;color:${DTYPES[e.type].color}">${e.type}</div><div><div class="ti">${esc(e.title)}</div><div class="ds">${esc(e.desc)}</div><div class="mt">${e.date.toISOString().replace("T", " ").slice(0, 16)} UTC · ${e.sample ? "SAMPLE (not a real event)" : `Source: NASA DONKI${e.link ? ` · <a href="${esc(e.link)}" target="_blank" rel="noopener">event page</a>` : ""}`}</div></div></div>`).join("") : `<div class="empty">${dz.status === "loading" ? "Fetching events from NASA…" : "No events in this range. Press “Fetch from NASA”."}</div>`}</div></div>
      <div class="card"><h3><span class="l">Personal dosimeter · ${esc(astro().full_name)}</span>${SIM}</h3>
        <dl class="kv" style="margin-bottom:12px"><dt>Today (${dayLabel(last.day)})</dt><dd>${fx(last.measured_dose, 3)} mSv</dd><dt>Mission total</dt><dd>${cum.toFixed(1)} mSv</dd><dt>Device</dt><dd style="font-weight:400;font-size:12px">${esc(last.device_source)}</dd><dt>Reference</dt><dd style="font-weight:400;font-size:12px">Deep-space cruise ≈1.84 mSv/day measured by MSL/RAD (Zeitlin et al., Science 2013)</dd><dt>Context</dt><dd style="font-weight:400;font-size:12px">NASA career limit: 600 mSv effective dose (NASA-STD-3001)</dd></dl>
        <div class="chart" id="doseChart"></div><div class="legend"><span><i style="background:#facc15"></i>Cumulative dose (mSv)</span></div></div>
    </div>`;
  }
  function pRadiation() {
    const dz = state.donki, from = new Date(dz.from + "T00:00:00Z"), to = new Date(dz.to + "T23:59:59Z");
    C.eventTimeline($("#dzTimeline"), { events: dz.events.filter(e => dz.types[e.type]), types: Object.fromEntries(Object.entries(DTYPES).filter(([k]) => dz.types[k])), from, to });
    const d = dose(); let s = 0; const cum = d.map(r => (s += r.measured_dose));
    C.lineChart($("#doseChart"), { x: d.map(r => r.day), height: 200, xLabel: v => "Day " + v, series: [{ name: "Cumulative", color: "#facc15", values: cum, area: true }], unit: "mSv",
      tooltip: i => `<b>Mission day ${d[i].day}</b><div class="row"><span>Daily</span><span>${d[i].measured_dose.toFixed(3)} mSv</span></div><div class="row"><span>Cumulative</span><span>${cum[i].toFixed(1)} mSv</span></div><div style="color:#a78bfa">Simulated dosimeter</div>` });
    if (dz.status === "idle") fetchDonki();
  }
  function parseDonki(type, j) {
    const out = [];
    (Array.isArray(j) ? j : []).forEach(e => {
      try {
        if (type === "FLR") out.push({ type, id: e.flrID, date: new Date(e.peakTime || e.beginTime), title: `${e.classType || "Unclassified"} solar flare`, desc: `Active region ${e.activeRegionNum ?? "—"} at ${e.sourceLocation || "—"} · begin ${String(e.beginTime || "").slice(11, 16)}, peak ${String(e.peakTime || "").slice(11, 16)}, end ${String(e.endTime || "—").slice(11, 16)} UTC`, link: e.link });
        if (type === "CME") { const an = (e.cmeAnalyses || []).find(x => x.isMostAccurate) || (e.cmeAnalyses || [])[0]; out.push({ type, id: e.activityID, date: new Date(e.startTime), title: `Coronal mass ejection${an && an.speed ? ` · ${Math.round(an.speed)} km/s` : ""}${an && an.type ? ` (type ${an.type})` : ""}`, desc: (e.note || "No analyst note.").slice(0, 240) + ((e.note || "").length > 240 ? "…" : ""), link: e.link }); }
        if (type === "SEP") out.push({ type, id: e.sepID, date: new Date(e.eventTime), title: "Solar energetic particle event", desc: `Detected by ${(e.instruments || []).map(i => i.displayName).join(", ") || "—"}${(e.linkedEvents || []).length ? ` · linked to ${(e.linkedEvents || []).map(l => l.activityID).slice(0, 3).join(", ")}` : ""}`, link: e.link });
        if (type === "GST") { const kp = Math.max(...(e.allKpIndex || []).map(k => k.kpIndex), 0); out.push({ type, id: e.gstID, date: new Date(e.startTime), title: `Geomagnetic storm · Kp ${kp}`, desc: `Maximum planetary K-index ${kp}${kp >= 5 ? ` (NOAA scale G${Math.min(5, Math.floor(kp) - 4)})` : ""}. Affects Earth's magnetosphere; relevant to LEO operations, not to a spacecraft in deep space.`, link: e.link }); }
      } catch (err) { /* skip malformed event */ }
    });
    return out.filter(e => !isNaN(+e.date));
  }
  function sampleEvents() {
    const now = Date.now(), mk = (dd, type, title, desc) => ({ type, id: "SAMPLE-" + type + dd, date: new Date(now - dd * 864e5), title, desc, sample: true });
    return [mk(2, "FLR", "SAMPLE · M1.2 solar flare", "Illustrative event shown because NASA DONKI could not be reached."), mk(5, "CME", "SAMPLE · Coronal mass ejection · 650 km/s", "Illustrative event — not real data."), mk(6, "GST", "SAMPLE · Geomagnetic storm · Kp 6", "Illustrative event — not real data."), mk(12, "FLR", "SAMPLE · X1.0 solar flare", "Illustrative event — not real data."), mk(12, "SEP", "SAMPLE · Solar energetic particle event", "Illustrative event — not real data."), mk(20, "CME", "SAMPLE · Coronal mass ejection · 420 km/s", "Illustrative event — not real data.")];
  }
  async function fetchDonki() {
    const dz = state.donki, key = store.apiKey || "DEMO_KEY", types = Object.keys(DTYPES);
    dz.status = "loading"; dz.msg = ""; if (state.view === "radiation") render(true);
    try {
      const get = (t, url) => fetch(url).then(r => { if (r.status === 429) throw new Error("rate"); if (!r.ok) throw new Error("http " + r.status); return r.text(); }).then(tx => parseDonki(t, tx ? JSON.parse(tx) : []));
      const q = t => `${t}?startDate=${dz.from}&endDate=${dz.to}`;
      let res, src = "ccmc.gsfc.nasa.gov/DONKI-API";
      try { res = await Promise.all(types.map(t => get(t, `https://ccmc.gsfc.nasa.gov/DONKI-API/get/${q(t)}`))); }
      catch (e1) { src = "api.nasa.gov/DONKI"; res = await Promise.all(types.map(t => get(t, `https://api.nasa.gov/DONKI/${q(t)}&api_key=${encodeURIComponent(key)}`))); }
      dz.events = res.flat(); dz.status = "live"; dz.fetchedAt = Date.now();
      dz.msg = `Loaded ${dz.events.length} events from ${src} (${dz.from} → ${dz.to}).`;
      try { localStorage.setItem("spacevitals_donki", JSON.stringify({ fetchedAt: dz.fetchedAt, from: dz.from, to: dz.to, events: dz.events })); } catch (e) { /* ignore */ }
      logEvent(`NASA DONKI: ${dz.events.length} space-weather events loaded`);
    } catch (err) {
      let cached = null; try { cached = JSON.parse(localStorage.getItem("spacevitals_donki") || "null"); } catch (e) { /* ignore */ }
      const why = err.message === "rate" ? "NASA API rate limit reached." : "NASA DONKI could not be reached from this page (offline or blocked).";
      if (cached && cached.events) { dz.events = cached.events.map(e => ({ ...e, date: new Date(e.date) })); dz.status = "cached"; dz.fetchedAt = cached.fetchedAt; dz.msg = `${why} Showing cached NASA data from ${new Date(cached.fetchedAt).toLocaleString("en-GB")} (${cached.from} → ${cached.to}).`; }
      else { dz.events = sampleEvents(); dz.status = "sample"; dz.msg = `${why} Showing clearly labelled SAMPLE events — these are not real NASA data.`; }
    }
    if (state.view === "radiation") render(true);
  }

  /* ================= VIEW: Medical Records ================= */
  const RTYPES = { blood: "Blood test", urine: "Urine test", ecg: "ECG", vision: "Vision exam", exam: "Medical exam", other: "Other" };
  function vRecords() {
    const r = state.rec, all = records();
    const q = r.q.toLowerCase();
    const list = all.filter(x => (r.type === "all" || x.record_type === r.type) && (!q || [x.title, x.notes, RTYPES[x.record_type], JSON.stringify(x.values || {})].join(" ").toLowerCase().includes(q))).sort((a, b) => r.sort === "desc" ? b.test_day - a.test_day : a.test_day - b.test_day);
    const numKeys = [...new Set(all.flatMap(x => Object.entries(x.values || {}).filter(([, v]) => typeof v === "number").map(([k]) => k)))];
    if (!r.cmp || !numKeys.includes(r.cmp)) r.cmp = numKeys.find(k => k.startsWith("Hemoglobin")) || numKeys[0];
    return `
    <div class="ph"><div><div class="h1">Medical Records</div><div class="sub">${esc(astro().full_name)} · ${all.length} records</div></div><button class="btn" id="addRecBtn">${I(ICON.plus, 16)}Add record / upload report</button></div>
    <div class="card" style="margin-bottom:16px">
      <div class="toolbar">
        <input class="input grow" id="recQ" placeholder="Search records, values or notes…" value="${esc(r.q)}">
        <select class="input" id="recType" style="width:auto"><option value="all">All types</option>${Object.entries(RTYPES).map(([k, v]) => `<option value="${k}" ${r.type === k ? "selected" : ""}>${v}</option>`).join("")}</select>
        <select class="input" id="recSort" style="width:auto"><option value="desc" ${r.sort === "desc" ? "selected" : ""}>Newest first</option><option value="asc" ${r.sort === "asc" ? "selected" : ""}>Oldest first</option></select>
      </div>
      <div class="tw" style="max-height:420px"><table><thead><tr><th>Date</th><th>Day</th><th>Type</th><th>Record</th><th>Key values</th><th>Source</th></tr></thead><tbody>
      ${list.length ? list.map(x => `<tr class="clickable" data-rec="${esc(x.id)}"><td>${fmtDate(x.test_day)}</td><td>${dayLabel(x.test_day)}</td><td>${RTYPES[x.record_type] || esc(x.record_type)}</td><td>${esc(x.title)}${x.file_name ? ` <span class="tag man">${I(ICON.file, 11)} file</span>` : ""}</td><td class="wrap" style="font-size:12px;color:var(--tx2);min-width:240px">${Object.entries(x.values || {}).slice(0, 3).map(([k, v]) => `${esc(k.replace(/ \(.*\)/, ""))}: <b style="color:#fff">${esc(v)}</b>`).join(" · ")}</td><td>${x.source === "manual" ? MAN : SIM}</td></tr>`).join("") : `<tr><td colspan="6" class="sub">No records match the search.</td></tr>`}
      </tbody></table></div></div>
    <div class="grid g2">
      <div class="card"><h3><span class="l">Compare measurements over time</span>${SIM}</h3>
        <div class="toolbar"><select class="input" id="cmpKey">${numKeys.map(k => `<option ${k === r.cmp ? "selected" : ""}>${esc(k)}</option>`).join("")}</select></div>
        <div class="chart" id="cmpChart"></div></div>
      ${REF ? `<div class="card"><h3><span class="l">Reference: real spaceflight bloodwork</span>${NASA("OSD-575")}</h3>
        <div class="toolbar"><select class="input" id="refKey">${Object.keys(REF.analytes).map(k => `<option ${k === (r.ref || "Serum calcium") ? "selected" : ""}>${esc(k)}</option>`).join("")}</select></div>
        <div class="chart" id="refChart2"></div><p class="sub" style="font-size:12px;margin-top:6px">${esc(REF.dataset)} · ${esc(REF.note)}</p></div>` : ""}
    </div>`;
  }
  function pRecords() {
    const r = state.rec, all = records().filter(x => x.values && typeof x.values[r.cmp] === "number").sort((a, b) => a.test_day - b.test_day);
    C.lineChart($("#cmpChart"), { x: all.map(x => x.test_day), height: 240, xLabel: d => dayLabel(Math.round(d)), series: [{ name: r.cmp, color: "#22D3EE", values: all.map(x => x.values[r.cmp]), points: 3.5, area: true }],
      tooltip: i => `<b>${dayLabel(all[i].test_day)} · ${fmtDate(all[i].test_day)}</b><div class="row"><span>${esc(r.cmp)}</span><span>${all[i].values[r.cmp]}</span></div><div style="color:#7f94b0">${esc(all[i].title)}${all[i].source === "manual" ? " · manual" : " · simulated"}</div>` });
    if (REF && $("#refChart2")) {
      const key = r.ref || "Serum calcium", R = REF.analytes[key], s = R.series, lo = parseFloat(R.lab_range[0]), hi = parseFloat(R.lab_range[1]);
      C.lineChart($("#refChart2"), { x: s.map((_, i) => i), height: 240, xLabel: i => s[Math.round(i)] ? s[Math.round(i)].tp : "", unit: R.unit,
        series: [{ name: "Crew max", color: "rgba(34,211,238,.35)", values: s.map(p => p.max), dash: "2 3", width: 1 }, { name: "Crew min", color: "rgba(34,211,238,.35)", values: s.map(p => p.min), dash: "2 3", width: 1 }, { name: "Crew mean", color: "#22D3EE", values: s.map(p => p.mean), points: 3.5 }],
        band: isFinite(lo) && isFinite(hi) ? { lo, hi, label: "lab range" } : null });
    }
  }
  function recordDetail(id) {
    const x = records().find(r => r.id === id); if (!x) return;
    const url = fileURLs[x.id];
    openModal(`<h2>${esc(x.title)}</h2><p class="sub" style="margin-bottom:14px">${RTYPES[x.record_type] || ""} · ${dayLabel(x.test_day)} · ${fmtDate(x.test_day)} · ${x.source === "manual" ? "Manual entry" : "Simulated demo record"}</p>
      ${Object.keys(x.values || {}).length ? `<div class="tw" style="margin-bottom:14px"><table><thead><tr><th>Measurement</th><th class="n">Value</th></tr></thead><tbody>${Object.entries(x.values).map(([k, v]) => `<tr><td>${esc(k)}</td><td class="n">${esc(v)}</td></tr>`).join("")}</tbody></table></div>` : ""}
      <p style="font-size:13.5px;color:var(--tx2)"><b style="color:#fff">Notes:</b> ${esc(x.notes || "—")}</p>
      ${x.file_name ? `<p style="margin-top:12px">${I(ICON.file, 15)} ${esc(x.file_name)} (${Math.round((x.file_size || 0) / 1024)} KB) ${url ? `· <a href="${url}" target="_blank" rel="noopener">Open file</a>` : `<span class="sub">· file content is kept only for the browser session it was uploaded in</span>`}</p>` : ""}
      ${x.source === "manual" ? `<div style="margin-top:16px;text-align:right"><button class="btn danger sm" data-delrec="${esc(x.id)}">Delete record</button></div>` : ""}`);
  }
  function addRecordForm() {
    openModal(`<h2>Add medical record</h2><p class="sub" style="margin-bottom:14px">${esc(astro().full_name)} · optionally attach a laboratory report (PDF, image, CSV).</p>
    <form id="recForm" class="form">
      <label class="field">Record type<select class="input" name="record_type">${Object.entries(RTYPES).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
      <label class="field">Mission day<input class="input" name="test_day" type="number" min="-365" max="${state.day}" value="${state.day}" required></label>
      <label class="field" style="grid-column:span 2">Title<input class="input" name="title" required maxlength="80" placeholder="e.g. Blood chemistry panel"></label>
      <label class="field" style="grid-column:1/-1">Measurements (optional) — one per line, <i>Name (unit): value</i><textarea class="input" name="values" placeholder="Hemoglobin (g/dL): 13.4&#10;25-OH vitamin D (ng/mL): 29"></textarea></label>
      <label class="field" style="grid-column:1/-1">Notes<textarea class="input" name="notes" maxlength="600"></textarea></label>
      <label class="field" style="grid-column:1/-1">Laboratory report file<input class="input" name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.csv,.txt"></label>
      <div style="grid-column:1/-1;display:flex;gap:10px;justify-content:flex-end;margin-top:6px"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">${I(ICON.check, 16)}Save record</button></div>
    </form>`);
    $("#recForm").onsubmit = e => {
      e.preventDefault(); const f = new FormData(e.target), values = {};
      String(f.get("values") || "").split("\n").forEach(line => { const m = line.match(/^(.+?):\s*(-?[\d.]+)\s*$/); if (m) values[m[1].trim().slice(0, 60)] = +m[2]; });
      const file = f.get("file"), id = `M${Date.now()}`;
      const rec = { id, astronaut_id: state.astro, test_day: Math.round(+f.get("test_day")), record_type: f.get("record_type"), title: String(f.get("title")).trim(), values, notes: String(f.get("notes") || ""), file_url: null, source: "manual" };
      if (file && file.size) { rec.file_name = file.name; rec.file_size = file.size; fileURLs[id] = URL.createObjectURL(file); }
      (store.records[state.astro] = store.records[state.astro] || []).push(rec);
      save(); logEvent(`${astro().full_name}: medical record “${rec.title}” added`); closeModal(); toast("Record saved"); render();
    };
  }

  /* ================= VIEW: Crew Monitoring ================= */
  function vCrew() {
    return `<div class="ph"><div><div class="h1">Crew Monitoring</div><div class="sub">Medical officer view · ${D0.astronauts.length} crew · mission day ${state.day} ${SIM}</div></div></div>
    ${demoBanner()}
    <div class="crew">${D0.astronauts.map(a => {
      const an = analysis(a.id), v = vitals(a.id), last = v[v.length - 1], al = activeAlerts(a.id);
      const exam = records(a.id).filter(r => r.record_type === "exam" || r.record_type === "ecg").sort((x, y) => y.test_day - x.test_day)[0];
      const lvl = an.baselineReady ? an.level : "none";
      return `<div class="card crewcard hover click" data-astro="${a.id}" tabindex="0" role="button" aria-label="Open ${esc(a.full_name)} dashboard">
        <div class="top2">${avatar(a, true, an.level)}<div style="flex:1;min-width:0"><div style="font-weight:700;font-size:15px">${esc(a.full_name)}</div><div class="sub">${esc(a.role)}</div></div>${stBadge(lvl, lvl === "none" ? "Baseline pending" : undefined)}</div>
        <div class="vit"><div><small>Heart rate</small><b>${last.heart_rate}</b> <span class="sub">BPM</span></div><div><small>SpO₂</small><b>${last.spo2}</b> <span class="sub">%</span></div></div>
        <div class="spark" data-spark="${esc(JSON.stringify(v.slice(-21).map(r => r.heart_rate)))}" data-color="${an.level === "critical" ? "#ef4444" : an.level === "attention" ? "#facc15" : "#22c55e"}"></div>
        <dl class="kv" style="font-size:12.5px;margin-top:8px"><dt>Latest medical exam</dt><dd>${exam ? dayLabel(exam.test_day) : "—"}</dd><dt>Active alerts</dt><dd style="color:${al.length ? LVC[an.level] : "inherit"}">${al.length}${al.length ? ` · ${esc(al[0].metric)}` : ""}</dd></dl>
      </div>`; }).join("")}</div>`;
  }

  /* ================= VIEW: Settings ================= */
  function vSettings() {
    return `<div class="ph"><div><div class="h1">Settings</div><div class="sub">Data sources, API access and demo controls</div></div></div>
    <div class="grid g2">
      <div class="card"><h3><span class="l">NASA DONKI API</span>${NASA("CCMC DONKI")}</h3>
        <label class="field">NASA API key (optional, only for the api.nasa.gov fallback)<input class="input" id="apiKey" type="password" placeholder="DEMO_KEY is used when empty" value="${esc(store.apiKey)}" autocomplete="off"></label>
        <p class="sub" style="font-size:12px;margin:8px 0 12px">Since 30 Sep 2026 DONKI is served by NASA CCMC at ccmc.gsfc.nasa.gov/DONKI-API without a key; the app calls it directly from your browser. A key entered here is used only if that fails, and is stored only in this browser (localStorage). In the full-stack architecture (README) the FastAPI backend holds the key in an environment variable.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="saveKey">${I(ICON.check, 16)}Save key</button><button class="btn ghost" id="testKey">${I(ICON.refresh, 16)}Test DONKI connection</button></div></div>
      <div class="card"><h3>Demo data</h3>
        <p class="sub" style="margin-bottom:12px">Manual measurements, urine results and records you add are kept in this browser. Export them or reset to the original demo scenario.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn ghost" id="expCsv">${I(ICON.download, 16)}Export vitals (CSV)</button><button class="btn ghost" id="expJson">${I(ICON.download, 16)}Export all (JSON)</button><button class="btn danger" id="resetDemo">Reset demo data</button></div>
        <h3 style="margin-top:18px">Display</h3>
        <label style="display:flex;gap:10px;align-items:center;font-size:13.5px;cursor:pointer"><input type="checkbox" id="reduce" ${store.reduce ? "checked" : ""} style="accent-color:var(--cyan);width:16px;height:16px">Reduce motion (disable animations)</label></div>
      <div class="card span2"><h3>Data sources & labelling</h3>
        <div class="tw"><table><thead><tr><th>Source</th><th>Used for</th><th>Label in app</th></tr></thead><tbody>
          <tr><td>NASA DONKI (CCMC) — FLR, CME, SEP, GST</td><td class="wrap">Space-weather event list and timeline (Radiation Monitor)</td><td>${NASA("Live · NASA DONKI")} / <span class="tag cache">Cached</span></td></tr>
          <tr><td>NASA OSDR · OSD-575 (Inspiration4)</td><td class="wrap">Real pre/post-flight serum chemistry of 4 astronauts, used as scientific reference</td><td>${NASA("OSD-575")}</td></tr>
          <tr><td>MSL/RAD (Zeitlin et al., Science 2013)</td><td class="wrap">Reference deep-space dose rate for the simulated dosimeter</td><td>cited in text</td></tr>
          <tr><td>SPACEVITALS demo generator (seed ${D0.seed})</td><td class="wrap">Fictional crew, vitals, urine biomarkers, dosimeter, medical records</td><td>${SIM}</td></tr>
          <tr><td>User input</td><td class="wrap">Measurements, urine results, records added in this browser</td><td>${MAN}</td></tr>
        </tbody></table></div>
        <p class="sub" style="font-size:12px;margin-top:10px">SPACEVITALS is a decision-support prototype for NASA Space Apps Challenge 2026. It is not a medical device and does not provide diagnoses or treatment instructions.</p></div>
      <div class="card span2"><h3>Use of artificial intelligence (disclosure)</h3>
        <p class="sub" style="font-size:13px;color:var(--tx2)">The source code, demo-data generator, interface text and documentation of SPACEVITALS were created with the help of <b>Claude (Anthropic)</b>, a generative AI assistant, and reviewed and tested by the team. The in-app “AI Analysis” itself is <b>not</b> a generative model: it runs transparent statistics (moving average, z-score) and an Isolation Forest, implemented in <code>js/analytics.js</code> and cross-checked with scikit-learn. No AI-generated images, audio or video are used, and no NASA logos or mission insignia are used or modified.</p></div>
    </div>`;
  }
  function download(name, text, type) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ================= Medical officer report ================= */
  function report() {
    const a = astro(), an = analysis(), br = an.boneRes, v = vitals(), last = v[v.length - 1], d = dose();
    const html = `<div class="report" id="reportDoc"><h1>SPACEVITALS · Medical Officer Health Report</h1>
      <div class="small">${esc(a.mission)} · Mission day ${state.day} (${fmtDate(state.day)}) · Generated ${new Date().toLocaleString("en-GB")} · SIMULATED DEMO DATA</div>
      <h2>Crew member</h2><p>${esc(a.full_name)} — ${esc(a.role)} · Overall monitoring level: <b>${an.level.toUpperCase()}</b> · Active alerts: ${activeAlerts().length}</p>
      <h2>Latest vital signs (${dayLabel(last.day)})</h2><table><tr><th>HR</th><th>SpO₂</th><th>BP</th><th>Temp</th><th>Sleep</th><th>Dose today</th></tr><tr><td>${last.heart_rate} bpm</td><td>${last.spo2}%</td><td>${last.systolic_pressure}/${last.diastolic_pressure}</td><td>${last.body_temperature} °C</td><td>${last.sleep_hours} h</td><td>${d[d.length - 1].measured_dose.toFixed(2)} mSv</td></tr></table>
      <h2>Bone metabolism (urine markers vs individual baseline)</h2><table><tr><th>Marker</th><th>Baseline</th><th>Latest</th><th>Change</th><th>Level</th></tr>${Object.keys(A.BONE).filter(k => br[k]).map(k => `<tr><td>${A.BONE[k].label}</td><td>${fx(br[k].base, A.BONE[k].dp)}</td><td>${fx(br[k].last, A.BONE[k].dp)} (day ${br[k].lastDay})</td><td>${sign(br[k].pct)}</td><td>${br[k].level}</td></tr>`).join("")}</table>
      <p class="small">Urine markers indicate bone turnover only; bone mineral density requires DXA or other imaging.</p>
      <h2>AI observations</h2>${an.obs.length ? `<ol>${an.obs.map(o => `<li><b>[${o.level.toUpperCase()}] ${esc(o.title)}</b> — ${esc(o.explanation)}<br><i>Next action:</i> ${esc(o.next)}</li>`).join("")}</ol>` : "<p>No observations.</p>"}
      <h2>Methods</h2><p class="small">7-day moving average and z-score versus the individual baseline (days 1–14); Isolation Forest on six vital signs (threshold ${A.IF_THRESHOLD}); bone markers as % change from the mean of pre-flight samples. Decision support only — not a diagnosis.</p></div>`;
    openModal(`<h2>Medical officer report</h2><p class="sub" style="margin-bottom:12px">Ready to send to the flight surgeon on Earth.</p>${html}
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap"><button class="btn ghost" id="copyRep">Copy text</button><button class="btn" id="dlRep">${I(ICON.download, 16)}Download (.html)</button></div>`);
    $("#dlRep").onclick = () => download(`SPACEVITALS_report_${a.id}_day${state.day}.html`, `<!DOCTYPE html><html><head><meta charset="utf-8"><title>SPACEVITALS report</title><style>body{font:14px/1.5 system-ui;max-width:860px;margin:30px auto;padding:0 20px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccd;padding:5px 8px;text-align:left}h2{color:#0b4d5c}</style></head><body>${$("#reportDoc").innerHTML}</body></html>`, "text/html");
    $("#copyRep").onclick = () => navigator.clipboard.writeText($("#reportDoc").innerText).then(() => toast("Report copied to clipboard"), () => toast("Copy not allowed here — use Download"));
    logEvent(`Medical officer report generated for ${a.full_name} (day ${state.day})`);
  }

  /* ================= router / render ================= */
  const VIEWS = { overview: [vOverview, pOverview], health: [vHealth, pHealth], bone: [vBone, pBone], ai: [vAI, pAI], radiation: [vRadiation, pRadiation], records: [vRecords, pRecords], crew: [vCrew, () => drawSparks($("#view"))], preferences: [vSettings, () => {}] };
  let lastView = null;
  function render(keepScroll) {
    const [v, p] = VIEWS[state.view] || VIEWS.overview;
    const y = scrollY;
    const el = $("#view"); el.innerHTML = v();
    if (lastView !== state.view) { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; }
    renderNav(); renderTop(); tickClock(); C.hideTip();
    p();
    if (keepScroll || lastView === state.view) scrollTo(0, y); else scrollTo(0, 0);
    lastView = state.view;
    document.title = `${(NAV.find(n => n[0] === state.view) || NAV[0])[1]} · SPACEVITALS`;
  }
  function route() {
    const h = location.hash.replace("#", "");
    state.view = VIEWS[h] ? h : "overview";
    $("#side").classList.remove("open"); render();
  }
  function setDay(d) { state.day = Math.max(1, Math.min(MAXDAY, d)); render(true); }

  // global delegated events
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-go],[data-day],[data-metric],[data-trend],[data-m],[data-r],[data-l],[data-t],[data-ref],[data-astro],[data-ack],[data-rec],[data-delrec],[data-close],#reportBtn,#addVitBtn,#addUrineBtn,#addRecBtn,#dzFetch,#saveKey,#testKey,#expCsv,#expJson,#resetDemo,#exportAlerts,#me");
    if (!t) { if (!e.target.closest("#pop,#bell")) { $("#pop").classList.remove("open"); } return; }
    const ds = t.dataset;
    if (ds.close !== undefined) return closeModal();
    if (ds.go) { $("#pop").classList.remove("open"); location.hash = ds.go; return; }
    if (ds.day) return setDay(+ds.day);
    if (ds.metric) { state.metric = ds.metric; location.hash = "health"; return; }
    if (ds.trend) { state.trend = ds.trend; return render(true); }
    if (ds.m) { state.metric = ds.m; return render(true); }
    if (ds.r) { state.range.preset = ds.r; if (ds.r === "custom") { state.range.from = +$("#rFrom").value; state.range.to = +$("#rTo").value; } return render(true); }
    if (ds.l) { state.ai.level = ds.l; return render(true); }
    if (ds.t && state.view === "radiation") { state.donki.types[ds.t] = !state.donki.types[ds.t]; return render(true); }
    if (ds.ref) { state.rec.ref = ds.ref; return render(true); }
    if (ds.astro) { state.astro = ds.astro; cache.clear(); toast(`Showing ${astro().full_name}`); location.hash = "health"; if (state.view === "health") render(); return; }
    if (ds.ack) { store.acks[`${state.astro}:${ds.ack}`] = Date.now(); save(); toast("Alert acknowledged"); return render(true); }
    if (ds.rec) return recordDetail(ds.rec);
    if (ds.delrec) { store.records[state.astro] = (store.records[state.astro] || []).filter(r => r.id !== ds.delrec); save(); closeModal(); toast("Record deleted"); return render(true); }
    switch (t.id) {
      case "reportBtn": return report();
      case "addVitBtn": return addVitalsForm();
      case "addUrineBtn": return addUrineForm();
      case "addRecBtn": return addRecordForm();
      case "dzFetch": state.donki.from = $("#dzFrom").value; state.donki.to = $("#dzTo").value; if (state.donki.from > state.donki.to) return toast("Start date must be before end date"); return fetchDonki();
      case "saveKey": store.apiKey = $("#apiKey").value.trim(); save(); return toast(store.apiKey ? "API key saved in this browser" : "Using DEMO_KEY");
      case "testKey": store.apiKey = $("#apiKey").value.trim(); save(); state.donki.status = "idle"; if (state.view === "radiation") return render(); location.hash = "radiation"; return;
      case "expCsv": { const rows = vitalsAll(); return download(`spacevitals_${state.astro}_vitals.csv`, ["astronaut_id,day,heart_rate,spo2,systolic_pressure,diastolic_pressure,body_temperature,sleep_hours,source", ...rows.map(r => [state.astro, r.day, r.heart_rate, r.spo2, r.systolic_pressure, r.diastolic_pressure, r.body_temperature, r.sleep_hours, r.manual ? "manual" : "simulated"].join(","))].join("\n"), "text/csv"); }
      case "expJson": return download("spacevitals_export.json", JSON.stringify({ exported: new Date().toISOString(), label: D0.label, astronauts: D0.astronauts, user_additions: store }, null, 1), "application/json");
      case "exportAlerts": return download(`spacevitals_${state.astro}_alerts_day${state.day}.json`, JSON.stringify(historyFor(state.astro).map(h => ({ astronaut_id: state.astro, metric_name: h.metric, alert_level: h.level, description: h.title, explanation: h.explanation, created_mission_day: h.created_day, status: h.acked ? "acknowledged" : h.active ? "active" : "resolved" })), null, 1), "application/json");
      case "resetDemo": if (!confirmReset()) return; store = blank(); save(); cache.clear(); toast("Demo data reset"); return render();
      case "me": location.hash = "crew"; return;
    }
  });
  let resetArmed = 0;
  function confirmReset() { if (Date.now() - resetArmed < 4000) return true; resetArmed = Date.now(); toast("Press “Reset demo data” again within 4 s to confirm"); return false; }
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeModal(); $("#pop").classList.remove("open"); }
    if ((e.key === "Enter" || e.key === " ") && e.target.dataset && e.target.dataset.astro) { e.preventDefault(); e.target.click(); }
  });
  document.addEventListener("change", e => {
    const id = e.target.id;
    if (id === "rFrom" || id === "rTo") { state.range = { preset: "custom", from: +$("#rFrom").value, to: +$("#rTo").value }; if (state.range.from > state.range.to) [state.range.from, state.range.to] = [state.range.to, state.range.from]; render(true); }
    if (id === "recType") { state.rec.type = e.target.value; render(true); }
    if (id === "recSort") { state.rec.sort = e.target.value; render(true); }
    if (id === "cmpKey") { state.rec.cmp = e.target.value; render(true); }
    if (id === "refKey") { state.rec.ref = e.target.value; render(true); }
    if (id === "reduce") { store.reduce = e.target.checked; save(); document.body.classList.toggle("reduce", store.reduce); }
  });
  let qT; document.addEventListener("input", e => { if (e.target.id === "recQ") { clearTimeout(qT); const pos = e.target.selectionStart; qT = setTimeout(() => { state.rec.q = e.target.value; render(true); const q = $("#recQ"); q.focus(); q.setSelectionRange(pos, pos); }, 220); } });
  $("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
  $("#bell").addEventListener("click", e => { e.stopPropagation(); const p = $("#pop"); p.classList.toggle("open"); if (p.classList.contains("open")) { store.events.forEach(ev => ev.read = true); save(); setTimeout(renderTop, 1500); } });
  $("#pop").addEventListener("click", e => { const it = e.target.closest("[data-go]"); if (it) { $("#pop").classList.remove("open"); location.hash = it.dataset.go; } });
  $("#burger").addEventListener("click", () => $("#side").classList.toggle("open"));
  $("#daySlider").addEventListener("input", e => { $("#dayLbl").textContent = e.target.value; });
  $("#daySlider").addEventListener("change", e => setDay(+e.target.value));
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { const p = (VIEWS[state.view] || VIEWS.overview)[1]; p(); }, 180); });
  addEventListener("hashchange", route);
  document.body.classList.toggle("reduce", store.reduce);
  setInterval(tickClock, 1000);
  route();
})();

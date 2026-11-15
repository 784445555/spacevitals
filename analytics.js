/* AI disclosure: written with the help of Claude (Anthropic), reviewed and tested by the SPACEVITALS team. */
/* SPACEVITALS — analytics engine (same methods as analysis/build_demo_data.py):
 *   moving average · z-score vs individual baseline · Isolation Forest (Liu, Ting & Zhou 2008)
 * Produces non-diagnostic observations with three levels: normal / attention / critical. */
(function () {
  "use strict";
  const BASE_DAYS = 14, MA_WIN = 7, IF_MIN_DAYS = 30, IF_THRESHOLD = 0.62;
  const METRICS = {
    heart_rate:        { label: "Heart rate", unit: "bpm", sdFloor: 1.5, dir: "both", dp: 0 },
    spo2:              { label: "Blood oxygen (SpO₂)", unit: "%", sdFloor: 0.5, dir: "low", dp: 0 },
    systolic_pressure: { label: "Systolic pressure", unit: "mmHg", sdFloor: 2.5, dir: "both", dp: 0 },
    diastolic_pressure:{ label: "Diastolic pressure", unit: "mmHg", sdFloor: 2.0, dir: "both", dp: 0 },
    body_temperature:  { label: "Body temperature", unit: "°C", sdFloor: 0.1, dir: "both", dp: 1 },
    sleep_hours:       { label: "Sleep duration", unit: "h", sdFloor: 0.25, dir: "low", dp: 1 },
  };
  const BONE = {
    urine_calcium:    { label: "Urinary calcium", short: "Ca²⁺", unit: "mg/24 h", att: 20, crit: 40, dp: 0 },
    urine_ntx:        { label: "Urinary NTx", short: "NTx", unit: "nmol BCE/mmol Cr", att: 30, crit: 60, dp: 1 },
    urine_ctx:        { label: "Urinary CTX", short: "CTX", unit: "µg/mmol Cr", att: 30, crit: 60, dp: 0 },
    urine_creatinine: { label: "Urinary creatinine", short: "Creatinine", unit: "g/24 h", att: 15, crit: 30, dp: 2, both: true },
  };
  const NEXT = {
    heart_rate: "Repeat resting measurement after 5 min seated rest; review recent workload and sleep; inform the crew medical officer if the trend persists.",
    spo2: "Re-measure with a second sensor and check cabin O₂ partial-pressure telemetry; inform the crew medical officer.",
    systolic_pressure: "Repeat measurement after 5 min rest with correct cuff size; inform the crew medical officer if it persists.",
    diastolic_pressure: "Repeat measurement after 5 min rest; inform the crew medical officer if it persists.",
    body_temperature: "Repeat measurement in 1 h and log any symptoms; inform the crew medical officer if it persists.",
    sleep_hours: "Review sleep schedule, light exposure and workload; log subjective sleep quality for the medical officer.",
    bone: "Repeat the urine panel at the next scheduled collection, verify the 24-h collection was complete, and review the trend with the flight surgeon together with exercise (ARED) and nutrition logs.",
    creat: "Check sample collection completeness and timing before interpreting creatinine-normalised markers; repeat collection.",
  };
  const LV = { normal: 0, attention: 1, critical: 2 };
  const maxLevel = arr => arr.reduce((a, b) => LV[b] > LV[a] ? b : a, "normal");

  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  const sd = a => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
  function movingAverage(vals, w = MA_WIN) { return vals.map((_, i) => { const s = vals.slice(Math.max(0, i - w + 1), i + 1).filter(v => v !== null && isFinite(v)); return s.length >= Math.min(3, w) ? mean(s) : null; }); }
  function baseline(rows, m) {
    const v = rows.filter(r => r.day >= 1 && r.day <= BASE_DAYS).map(r => r[m]).filter(x => x !== null && isFinite(x));
    if (v.length < 5) return null;
    return { mean: mean(v), sd: Math.max(sd(v), METRICS[m].sdFloor), n: v.length };
  }

  /* ---------- Isolation Forest (seeded, deterministic) ---------- */
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const H = i => Math.log(i) + 0.5772156649;
  const cFactor = n => n > 2 ? 2 * H(n - 1) - 2 * (n - 1) / n : n === 2 ? 1 : 0;
  function buildTree(X, idx, depth, limit, r) {
    if (depth >= limit || idx.length <= 1) return { size: idx.length };
    const d = X[0].length, f = Math.floor(r() * d);
    let lo = Infinity, hi = -Infinity; idx.forEach(i => { lo = Math.min(lo, X[i][f]); hi = Math.max(hi, X[i][f]); });
    if (lo === hi) return { size: idx.length };
    const split = lo + r() * (hi - lo);
    const L = idx.filter(i => X[i][f] < split), R = idx.filter(i => X[i][f] >= split);
    return { f, split, l: buildTree(X, L, depth + 1, limit, r), r: buildTree(X, R, depth + 1, limit, r) };
  }
  function pathLen(x, node, depth) { if (node.size !== undefined) return depth + cFactor(node.size); return pathLen(x, x[node.f] < node.split ? node.l : node.r, depth + 1); }
  function isolationForest(X, { trees = 200, sample = 64, seed = 2026 } = {}) {
    const r = rng(seed), n = X.length, psi = Math.min(sample, n), limit = Math.ceil(Math.log2(psi));
    const forest = [];
    for (let t = 0; t < trees; t++) {
      const idx = []; const pool = [...Array(n).keys()];
      for (let k = 0; k < psi; k++) { const j = k + Math.floor(r() * (n - k)); [pool[k], pool[j]] = [pool[j], pool[k]]; idx.push(pool[k]); }
      forest.push(buildTree(X, idx, 0, limit, r));
    }
    const c = cFactor(psi);
    return X.map(x => Math.pow(2, -mean(forest.map(tr => pathLen(x, tr, 0))) / c));
  }

  /* ---------- main analysis ---------- */
  function analyze(ctx) {
    // ctx: {vitals:[rows≤day], bone:[tests≤day], day, astro}
    const { vitals, bone, day } = ctx;
    const obs = [], series = {};
    const enoughBaseline = vitals.filter(r => r.day <= BASE_DAYS).length >= 5;

    Object.keys(METRICS).forEach(m => {
      const M = METRICS[m], vals = vitals.map(r => r[m]);
      const ma = movingAverage(vals);
      const b = baseline(vitals, m);
      const z = b ? ma.map(v => v === null ? null : (v - b.mean) / b.sd) : vals.map(() => null);
      const zDaily = b ? vals.map(v => v === null || v === undefined ? null : (v - b.mean) / b.sd) : vals.map(() => null);
      series[m] = { values: vals, ma, z, zDaily, baseline: b };
      if (!b || !vitals.length || day <= BASE_DAYS) return;
      const i = vitals.length - 1, zi = z[i], last = vals[i];
      const signed = M.dir === "low" ? -zi : M.dir === "high" ? zi : Math.abs(zi);
      let level = signed >= 3 ? "critical" : signed >= 2 ? "attention" : "normal";
      const pct = (ma[i] - b.mean) / b.mean * 100;
      if (level !== "normal") {
        // first day of the current episode, for alert history
        let start = i; while (start > 0 && z[start - 1] !== null && (M.dir === "low" ? -z[start - 1] : M.dir === "high" ? z[start - 1] : Math.abs(z[start - 1])) >= 2) start--;
        const up = zi > 0;
        obs.push({
          key: `vit-${m}-${vitals[start].day}`, created_day: vitals[start].day, metric: M.label, metricKey: m, level, method: "7-day moving average · z-score",
          title: `${M.label} ${up ? "above" : "below"} individual baseline`, prev: b.mean, cur: ma[i], unit: M.unit, pct, z: zi, dp: M.dp,
          prevLabel: "Baseline (days 1–14)", curLabel: "7-day average",
          explanation: `The 7-day average ${M.label.toLowerCase()} is ${Math.abs(zi).toFixed(1)} standard deviations ${up ? "above" : "below"} this astronaut's own baseline (${b.mean.toFixed(M.dp)} ${M.unit}) and has been outside the ±2 SD range since mission day ${vitals[start].day}.`,
          next: NEXT[m],
        });
      } else if (zDaily[i] !== null && Math.abs(zDaily[i]) >= 3.5) {
        obs.push({
          key: `vit1-${m}-${vitals[i].day}`, created_day: vitals[i].day, metric: M.label, metricKey: m, level: "attention", method: "single-day z-score",
          title: `Isolated ${M.label.toLowerCase()} outlier today`, prev: b.mean, cur: last, unit: M.unit, pct: (last - b.mean) / b.mean * 100, z: zDaily[i], dp: M.dp,
          prevLabel: "Baseline", curLabel: "Today",
          explanation: `Today's single reading is ${Math.abs(zDaily[i]).toFixed(1)} SD from baseline while the 7-day average is still in range — possibly a transient or a measurement artefact.`,
          next: NEXT[m],
        });
      }
    });

    // Isolation Forest on multivariate daily vitals
    let ifRes = { status: "insufficient", scores: [], flagged: [] };
    const keys = Object.keys(METRICS);
    if (vitals.length >= IF_MIN_DAYS && enoughBaseline) {
      const bs = keys.map(k => series[k].baseline);
      const rows = vitals.filter(r => keys.every(k => r[k] !== null && r[k] !== undefined && isFinite(r[k])));
      const X = rows.map(r => keys.map((k, j) => (r[k] - bs[j].mean) / bs[j].sd));
      const scores = isolationForest(X);
      const flagged = rows.map((r, i) => scores[i] >= IF_THRESHOLD ? r.day : null).filter(x => x !== null);
      ifRes = { status: "ok", days: rows.map(r => r.day), scores, flagged, threshold: IF_THRESHOLD };
      const recent = flagged.filter(d => d > day - 7);
      const runsAll = []; flagged.forEach(d => { const last = runsAll[runsAll.length - 1]; if (last && d - last[last.length - 1] === 1) last.push(d); else runsAll.push([d]); });
      const lastRun = recent.length ? runsAll.find(r => r.includes(recent[recent.length - 1])) : null;
      const strong = lastRun && (lastRun.length >= 2 || Math.max(...lastRun.map(d => scores[rows.findIndex(r => r.day === d)])) >= 0.68);
      if (recent.length && strong) {
        const runs = []; flagged.forEach(d => { const last = runs[runs.length - 1]; if (last && d - last[last.length - 1] === 1) last.push(d); else runs.push([d]); });
        const run = runs.find(r => r.includes(recent[recent.length - 1]));
        const rowsRun = vitals.filter(r => run.includes(r.day));
        const drivers = keys.map(k => ({ k, z: mean(rowsRun.map(r => (r[k] - series[k].baseline.mean) / series[k].baseline.sd)) })).sort((a, b) => Math.abs(b.z) - Math.abs(a.z)).slice(0, 3);
        obs.push({
          key: `if-${run[0]}`, created_day: run[0], metric: "Combined vital signs", metricKey: "multi", level: run.length >= 3 ? "critical" : "attention", method: "Isolation Forest (multivariate)",
          title: `Unusual combination of vital signs (${run.length} day${run.length > 1 ? "s" : ""})`,
          prev: IF_THRESHOLD, cur: Math.max(...run.map(d => scores[rows.findIndex(r => r.day === d)])), unit: "score", pct: null, dp: 2,
          prevLabel: "Anomaly threshold", curLabel: "Max anomaly score",
          explanation: `Isolation Forest isolated mission day${run.length > 1 ? "s" : ""} ${run[0]}${run.length > 1 ? "–" + run[run.length - 1] : ""} as unusual compared with the rest of this astronaut's record. Main contributors: ${drivers.map(d => `${METRICS[d.k].label.toLowerCase()} (${d.z > 0 ? "+" : ""}${d.z.toFixed(1)} SD)`).join(", ")}. Individual values may each look only mildly abnormal.`,
          next: "Review these days with the crew member (symptoms, workload, sleep, EVA or exercise), repeat measurements, and inform the crew medical officer.",
        });
      }
    }

    // Bone markers vs individual pre-flight baseline (tests on day ≤ 1)
    const boneRes = {};
    const pre = bone.filter(t => t.day <= 1);
    Object.keys(BONE).forEach(k => {
      const B = BONE[k], vals = bone.map(t => t[k]).filter(v => v !== null && v !== undefined && isFinite(v));
      if (!pre.length || !vals.length) { boneRes[k] = null; return; }
      const base = mean(pre.map(t => t[k]).filter(v => isFinite(v)));
      const last = bone[bone.length - 1], prev = bone.length > 1 ? bone[bone.length - 2] : null;
      const pct = (last[k] - base) / base * 100;
      const mag = B.both ? Math.abs(pct) : pct;
      const level = last.day <= 1 ? "normal" : mag >= B.crit ? "critical" : mag >= B.att ? "attention" : "normal";
      const rising = bone.length >= 3 && bone[bone.length - 1][k] > bone[bone.length - 2][k] && bone[bone.length - 2][k] > bone[bone.length - 3][k];
      boneRes[k] = { base, last: last[k], lastDay: last.day, prev: prev ? prev[k] : null, prevDay: prev ? prev.day : null, pct, level, rising, series: bone.map(t => ({ day: t.day, v: t[k], pct: (t[k] - base) / base * 100, manual: t.manual })) };
      if (level !== "normal") {
        let start = bone.length - 1; while (start > 0 && bone[start - 1].day > 1 && (B.both ? Math.abs((bone[start - 1][k] - base) / base * 100) : (bone[start - 1][k] - base) / base * 100) >= B.att) start--;
        obs.push({
          key: `bone-${k}-${bone[start].day}`, created_day: bone[start].day, metric: B.label, metricKey: k, level, method: "% change vs individual pre-flight baseline",
          title: k === "urine_creatinine" ? "Urinary creatinine differs from baseline" : `${B.label} increased vs individual baseline`,
          prev: base, cur: last[k], unit: B.unit, pct, dp: B.dp, prevLabel: "Pre-flight baseline", curLabel: `Test day ${last.day}`,
          explanation: k === "urine_creatinine"
            ? `Creatinine excretion is ${pct.toFixed(0)}% from baseline. Because NTx and CTX are normalised to creatinine, an incomplete or unusual collection can distort them.`
            : `${B.label} is ${pct > 0 ? "+" : ""}${pct.toFixed(0)}% above this astronaut's pre-flight baseline${rising ? " and has risen across the last three tests" : ""}. ${k === "urine_calcium" ? "Higher calcium excretion may reflect calcium released from bone; it is also relevant to kidney-stone risk." : "This may indicate increased bone resorption activity."} Urine markers do not measure bone density.`,
          next: k === "urine_creatinine" ? NEXT.creat : NEXT.bone,
        });
      }
    });
    const boneHigh = ["urine_ntx", "urine_ctx", "urine_calcium"].filter(k => boneRes[k] && boneRes[k].level !== "normal");
    if (boneHigh.length >= 2) {
      const lvl = maxLevel(boneHigh.map(k => boneRes[k].level));
      const created = Math.max(...obs.filter(o => boneHigh.includes(o.metricKey)).map(o => o.created_day));
      obs.push({
        key: `combo-bone-${created}`, created_day: created, metric: "Bone metabolism (combined)", metricKey: "combo", level: lvl, method: "Rule: concordant change in ≥2 markers",
        title: "Concordant rise in calcium excretion and resorption markers",
        prev: null, cur: null, unit: "", pct: null, dp: 0, prevLabel: "", curLabel: "",
        explanation: `${boneHigh.map(k => BONE[k].short).join(", ")} have all moved upward from baseline. Agreement between independent markers makes a true change in bone resorption more likely than a single noisy result. Imaging (DXA / QCT) is required to assess bone mineral density.`,
        next: "Flag for the flight surgeon's review at the next private medical conference; schedule repeat urine panel; consider whether a post-flight or in-flight imaging assessment is planned.",
      });
    }

    obs.sort((a, b) => LV[b.level] - LV[a.level] || b.created_day - a.created_day);
    return { obs, series, ifRes, boneRes, level: maxLevel(obs.map(o => o.level)), baselineReady: day > BASE_DAYS && enoughBaseline };
  }

  // Bone narrative for the Bone Health page
  function boneNarrative(boneRes) {
    const ks = ["urine_ntx", "urine_ctx", "urine_calcium", "urine_creatinine"].filter(k => boneRes[k]);
    if (!ks.length) return ["No urine results yet. Baseline will be established from pre-flight samples."];
    const p = [];
    const up = ks.filter(k => k !== "urine_creatinine" && boneRes[k].level !== "normal");
    if (!up.length) p.push(`All bone-related urine markers are within the expected range of this astronaut's individual pre-flight baseline (latest test: mission day ${boneRes[ks[0]].lastDay}).`);
    up.forEach(k => { const r = boneRes[k], B = BONE[k]; p.push(`${B.label} has ${r.pct > 0 ? "increased" : "decreased"} by ${Math.abs(r.pct).toFixed(0)}% compared with the astronaut's individual baseline (${r.base.toFixed(B.dp)} → ${r.last.toFixed(B.dp)} ${B.unit})${r.rising ? ", rising across three consecutive tests" : ""}. ${k === "urine_calcium" ? "This may reflect increased calcium release from bone." : "This may indicate increased bone resorption activity."}`); });
    const cr = boneRes.urine_creatinine;
    if (cr && cr.level !== "normal") p.push(`Urinary creatinine is ${cr.pct.toFixed(0)}% from baseline — check collection completeness before interpreting creatinine-normalised markers.`);
    else if (cr) p.push(`Urinary creatinine is stable (${cr.pct > 0 ? "+" : ""}${cr.pct.toFixed(0)}%), so creatinine-normalised NTx and CTX values are interpretable.`);
    if (up.length) p.push("Further medical evaluation and repeat testing are recommended. These markers indicate bone turnover activity only; bone mineral density and structure require DXA or other clinical imaging.");
    return p;
  }

  window.SVAnalytics = { analyze, boneNarrative, movingAverage, isolationForest, METRICS, BONE, LV, maxLevel, IF_THRESHOLD, BASE_DAYS };
})();

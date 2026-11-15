/* AI disclosure: written with the help of Claude (Anthropic), reviewed and tested by the SPACEVITALS team. */
/* SPACEVITALS — dependency-free SVG charts with hover tooltips (works offline and on GitHub Pages). */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const S = (t, a = {}, txt) => { const e = document.createElementNS(NS, t); for (const k in a) if (a[k] !== undefined && a[k] !== null) e.setAttribute(k, a[k]); if (txt !== undefined) e.textContent = txt; return e; };
  const tip = () => document.getElementById("tip");
  function showTip(evt, html) {
    const t = tip(); if (!t) return;
    t.innerHTML = html; t.style.opacity = 1;
    const w = t.offsetWidth, h = t.offsetHeight;
    let x = evt.clientX + 14, y = evt.clientY + 14;
    if (x + w > innerWidth - 8) x = evt.clientX - w - 14;
    if (y + h > innerHeight - 8) y = evt.clientY - h - 14;
    t.style.left = x + "px"; t.style.top = y + "px";
  }
  function hideTip() { const t = tip(); if (t) t.style.opacity = 0; }

  function niceTicks(lo, hi, n = 5) {
    if (!isFinite(lo) || !isFinite(hi)) return [0, 1];
    if (lo === hi) { lo -= 1; hi += 1; }
    const span = hi - lo, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => span / s <= n) || 10 * mag;
    const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }
  const fmtNum = v => v === null || v === undefined || Number.isNaN(v) ? "—" : Math.abs(v) >= 100 ? Math.round(v).toString() : Math.abs(v) >= 10 ? (+v.toFixed(1)).toString() : (+v.toFixed(2)).toString();

  /**
   * lineChart(el, {x:[...], xLabel:fn, series:[{name,values,color,width,dash,area,points}], band:{lo,hi,label},
   *                refLines:[{y,label,color}], markers:[{x,label,color}], height, yFmt, yMin, yMax, tooltip:fn(i)})
   */
  function lineChart(el, o) {
    el.innerHTML = "";
    const W = Math.max(260, el.clientWidth || 600), H = o.height || 260;
    const L = o.left ?? 46, R = 16, T = 14, B = 28;
    const svg = S("svg", { viewBox: `0 0 ${W} ${H}`, height: H, role: "img", "aria-label": o.aria || "chart" });
    el.appendChild(svg);
    const xs = o.x; const n = xs.length;
    if (!n) { el.innerHTML = `<div class="empty">No data in the selected range.</div>`; return; }
    let lo = Infinity, hi = -Infinity;
    o.series.forEach(s => s.values.forEach(v => { if (v !== null && v !== undefined && isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }));
    if (o.band) { lo = Math.min(lo, o.band.lo); hi = Math.max(hi, o.band.hi); }
    (o.refLines || []).forEach(r => { lo = Math.min(lo, r.y); hi = Math.max(hi, r.y); });
    if (o.yMin !== undefined) lo = o.yMin; if (o.yMax !== undefined) hi = o.yMax;
    const pad = (hi - lo || Math.abs(hi) || 1) * 0.08; if (o.yMin === undefined) lo -= pad; if (o.yMax === undefined) hi += pad;
    const ticks = niceTicks(lo, hi, o.ticks || 5); lo = Math.min(lo, ticks[0]); hi = Math.max(hi, ticks[ticks.length - 1]);
    const xmin = xs[0], xmax = xs[n - 1];
    const X = v => L + (xmax === xmin ? 0.5 : (v - xmin) / (xmax - xmin)) * (W - L - R);
    const Y = v => T + (hi - v) / (hi - lo) * (H - T - B);
    const yFmt = o.yFmt || fmtNum;
    ticks.forEach(t => { svg.appendChild(S("line", { x1: L, x2: W - R, y1: Y(t), y2: Y(t), stroke: "#16283f" })); svg.appendChild(S("text", { x: L - 8, y: Y(t) + 3.5, "text-anchor": "end" }, yFmt(t))); });
    const xt = niceTicks(xmin, xmax, Math.max(2, Math.min(8, Math.floor((W - L) / 80)))).filter(v => v >= xmin && v <= xmax);
    xt.forEach(t => svg.appendChild(S("text", { x: X(t), y: H - 8, "text-anchor": "middle" }, o.xLabel ? o.xLabel(t) : t)));
    if (o.band) {
      svg.appendChild(S("rect", { x: L, y: Y(o.band.hi), width: W - L - R, height: Math.max(0, Y(o.band.lo) - Y(o.band.hi)), fill: "rgba(34,197,94,.07)", stroke: "rgba(34,197,94,.22)", "stroke-dasharray": "3 4" }));
      if (o.band.label) svg.appendChild(S("text", { x: W - R - 4, y: Y(o.band.hi) - 4, "text-anchor": "end", style: "fill:#4ade80;font-size:10.5px" }, o.band.label));
    }
    (o.shade || []).forEach(sh => svg.appendChild(S("rect", { x: X(sh.from), y: T, width: Math.max(2, X(sh.to) - X(sh.from)), height: H - T - B, fill: sh.color || "rgba(239,68,68,.08)" })));
    (o.refLines || []).forEach(r => { svg.appendChild(S("line", { x1: L, x2: W - R, y1: Y(r.y), y2: Y(r.y), stroke: r.color || "#ef4444", "stroke-dasharray": "5 4", "stroke-width": 1.4 })); if (r.label) svg.appendChild(S("text", { x: L + 6, y: Y(r.y) - 5, style: `fill:${r.color || "#ef4444"};font-size:10.5px` }, r.label)); });
    o.series.forEach((s, si) => {
      let d = "", pen = false, area = "";
      s.values.forEach((v, i) => {
        if (v === null || v === undefined || !isFinite(v)) { pen = false; return; }
        d += (pen ? "L" : "M") + X(xs[i]).toFixed(1) + "," + Y(v).toFixed(1); pen = true;
      });
      if (s.area) {
        const pts = s.values.map((v, i) => v === null ? null : [X(xs[i]), Y(v)]).filter(Boolean);
        if (pts.length) { area = `M${pts[0][0]},${Y(lo)} ` + pts.map(p => `L${p[0]},${p[1]}`).join(" ") + ` L${pts[pts.length - 1][0]},${Y(lo)} Z`; const gid = "g" + Math.random().toString(36).slice(2, 8); const gr = S("linearGradient", { id: gid, x1: 0, x2: 0, y1: 0, y2: 1 }); gr.appendChild(S("stop", { offset: 0, "stop-color": s.color, "stop-opacity": .28 })); gr.appendChild(S("stop", { offset: 1, "stop-color": s.color, "stop-opacity": 0 })); svg.appendChild(gr); svg.appendChild(S("path", { d: area, fill: `url(#${gid})` })); }
      }
      const p = S("path", { d, fill: "none", stroke: s.color, "stroke-width": s.width || 2, "stroke-dasharray": s.dash, "stroke-linejoin": "round", "stroke-linecap": "round" });
      if (!o.static) { const len = 4000; p.style.strokeDasharray = s.dash || len; if (!s.dash) { p.style.strokeDashoffset = len; p.style.transition = `stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1) ${si * 0.08}s`; requestAnimationFrame(() => requestAnimationFrame(() => p.style.strokeDashoffset = 0)); } }
      svg.appendChild(p);
      if (s.points) s.values.forEach((v, i) => { if (v !== null && v !== undefined) svg.appendChild(S("circle", { cx: X(xs[i]), cy: Y(v), r: s.points === true ? 3.2 : s.points, fill: s.pointFill || s.color, stroke: "#07111F", "stroke-width": 1.5 })); });
    });
    (o.markers || []).forEach(m => {
      const s0 = o.series[m.series || 0], i = xs.indexOf(m.x); const v = i >= 0 ? s0.values[i] : null; if (v === null || v === undefined) return;
      svg.appendChild(S("circle", { cx: X(m.x), cy: Y(v), r: 5.5, fill: "none", stroke: m.color || "#ef4444", "stroke-width": 2 }));
    });
    // hover layer
    const vline = S("line", { y1: T, y2: H - B, stroke: "rgba(255,255,255,.25)", "stroke-dasharray": "3 3", opacity: 0 });
    svg.appendChild(vline);
    const dots = o.series.map(s => { const c = S("circle", { r: 4.5, fill: s.color, stroke: "#07111F", "stroke-width": 2, opacity: 0 }); svg.appendChild(c); return c; });
    const hit = S("rect", { x: L, y: T, width: W - L - R, height: H - T - B, fill: "transparent" });
    svg.appendChild(hit);
    const pick = evt => {
      const r = svg.getBoundingClientRect(), px = (evt.clientX - r.left) * (W / r.width);
      let best = 0, bd = Infinity; xs.forEach((x, i) => { const dd = Math.abs(X(x) - px); if (dd < bd) { bd = dd; best = i; } });
      return best;
    };
    hit.addEventListener("mousemove", evt => {
      const i = pick(evt), x = X(xs[i]);
      vline.setAttribute("x1", x); vline.setAttribute("x2", x); vline.setAttribute("opacity", 1);
      o.series.forEach((s, k) => { const v = s.values[i]; if (v === null || v === undefined || !isFinite(v)) { dots[k].setAttribute("opacity", 0); return; } dots[k].setAttribute("cx", x); dots[k].setAttribute("cy", Y(v)); dots[k].setAttribute("opacity", 1); });
      const html = o.tooltip ? o.tooltip(i) : `<b>${o.xLabel ? o.xLabel(xs[i]) : xs[i]}</b>` + o.series.filter(s => !s.noTip).map(s => `<div class="row"><span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${s.color};margin-right:6px"></i>${s.name}</span><span>${yFmt(s.values[i])}${o.unit ? " " + o.unit : ""}</span></div>`).join("");
      showTip(evt, html);
    });
    hit.addEventListener("mouseleave", () => { vline.setAttribute("opacity", 0); dots.forEach(d => d.setAttribute("opacity", 0)); hideTip(); });
    if (o.onClick) { hit.style.cursor = "pointer"; hit.addEventListener("click", evt => o.onClick(pick(evt))); }
  }

  /** barChart(el, {categories, series:[{name,values,color}], height, yFmt, unit, refLine}) — grouped bars */
  function barChart(el, o) {
    el.innerHTML = "";
    const W = Math.max(260, el.clientWidth || 500), H = o.height || 240, L = o.left ?? 44, R = 12, T = 14, B = 36;
    const svg = S("svg", { viewBox: `0 0 ${W} ${H}`, height: H }); el.appendChild(svg);
    let lo = 0, hi = 0; o.series.forEach(s => s.values.forEach(v => { if (v !== null && isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }));
    if (o.refLine !== undefined) hi = Math.max(hi, o.refLine);
    const ticks = niceTicks(lo, hi * 1.08 || 1, 5); lo = Math.min(lo, ticks[0]); hi = ticks[ticks.length - 1];
    const Y = v => T + (hi - v) / (hi - lo) * (H - T - B);
    const yFmt = o.yFmt || fmtNum;
    ticks.forEach(t => { svg.appendChild(S("line", { x1: L, x2: W - R, y1: Y(t), y2: Y(t), stroke: t === 0 ? "#2a4060" : "#16283f" })); svg.appendChild(S("text", { x: L - 8, y: Y(t) + 3.5, "text-anchor": "end" }, yFmt(t))); });
    const cw = (W - L - R) / o.categories.length, gw = cw * 0.72, bw = gw / o.series.length;
    o.categories.forEach((c, ci) => {
      const x0 = L + ci * cw + (cw - gw) / 2;
      svg.appendChild(S("text", { x: L + ci * cw + cw / 2, y: H - 14, "text-anchor": "middle", style: "fill:#c4d2e4" }, c));
      if (o.sublabels) svg.appendChild(S("text", { x: L + ci * cw + cw / 2, y: H - 1, "text-anchor": "middle", style: "font-size:10px" }, o.sublabels[ci]));
      o.series.forEach((s, si) => {
        const v = s.values[ci]; if (v === null || v === undefined || !isFinite(v)) return;
        const y = Y(Math.max(0, v)), h = Math.abs(Y(v) - Y(0));
        const r = S("rect", { x: x0 + si * bw + 1.5, y: v >= 0 ? Y(0) : Y(0), width: Math.max(2, bw - 3), height: 0, rx: 4, fill: s.color });
        svg.appendChild(r);
        requestAnimationFrame(() => requestAnimationFrame(() => { r.style.transition = "all .7s cubic-bezier(.2,.8,.2,1)"; r.setAttribute("y", v >= 0 ? y : Y(0)); r.setAttribute("height", h); }));
        r.addEventListener("mousemove", e => showTip(e, `<b>${c} · ${s.name}</b><div class="row"><span>Value</span><span>${yFmt(v)}${o.unit ? " " + o.unit : ""}</span></div>${s.notes && s.notes[ci] ? `<div style="color:#7f94b0;margin-top:3px">${s.notes[ci]}</div>` : ""}`));
        r.addEventListener("mouseleave", hideTip);
      });
    });
    if (o.refLine !== undefined) svg.appendChild(S("line", { x1: L, x2: W - R, y1: Y(o.refLine), y2: Y(o.refLine), stroke: "#22c55e", "stroke-dasharray": "5 4" }));
  }

  /** sparkline(el, values, color) */
  function sparkline(el, values, color) {
    el.innerHTML = "";
    const W = Math.max(120, el.clientWidth || 180), H = el.clientHeight || 42;
    const v = values.filter(x => x !== null && isFinite(x)); if (v.length < 2) return;
    let lo = Math.min(...v), hi = Math.max(...v); if (lo === hi) { lo -= 1; hi += 1; }
    const X = i => 2 + i / (values.length - 1) * (W - 4), Y = x => 4 + (hi - x) / (hi - lo) * (H - 8);
    const svg = S("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none" });
    const pts = values.map((x, i) => x === null ? null : [X(i), Y(x)]).filter(Boolean);
    const gid = "s" + Math.random().toString(36).slice(2, 8);
    const gr = S("linearGradient", { id: gid, x1: 0, x2: 0, y1: 0, y2: 1 }); gr.appendChild(S("stop", { offset: 0, "stop-color": color, "stop-opacity": .3 })); gr.appendChild(S("stop", { offset: 1, "stop-color": color, "stop-opacity": 0 }));
    svg.appendChild(gr);
    svg.appendChild(S("path", { d: `M${pts[0][0]},${H} ` + pts.map(p => `L${p[0]},${p[1]}`).join(" ") + ` L${pts[pts.length - 1][0]},${H} Z`, fill: `url(#${gid})` }));
    svg.appendChild(S("path", { d: pts.map((p, i) => (i ? "L" : "M") + p[0] + "," + p[1]).join(" "), fill: "none", stroke: color, "stroke-width": 1.8, "stroke-linejoin": "round", "vector-effect": "non-scaling-stroke" }));
    const last = pts[pts.length - 1]; svg.appendChild(S("circle", { cx: last[0], cy: last[1], r: 2.6, fill: color }));
    el.appendChild(svg);
  }

  /** eventTimeline(el, {events:[{date:Date,type,label}], types:{TYPE:{color,label}}, from:Date, to:Date}) */
  function eventTimeline(el, o) {
    el.innerHTML = "";
    const W = Math.max(260, el.clientWidth || 600), rows = Object.keys(o.types), H = 34 + rows.length * 34, L = 54, R = 14;
    const svg = S("svg", { viewBox: `0 0 ${W} ${H}`, height: H }); el.appendChild(svg);
    const t0 = +o.from, t1 = +o.to, X = t => L + (t - t0) / Math.max(1, t1 - t0) * (W - L - R);
    rows.forEach((k, i) => { const y = 20 + i * 34; svg.appendChild(S("line", { x1: L, x2: W - R, y1: y, y2: y, stroke: "#16283f" })); svg.appendChild(S("text", { x: 6, y: y + 4, style: `fill:${o.types[k].color};font-weight:700;font-family:monospace` }, k)); });
    const days = Math.round((t1 - t0) / 864e5), step = Math.max(1, Math.ceil(days / Math.max(2, Math.floor((W - L) / 90))));
    for (let d = 0; d <= days; d += step) { const t = t0 + d * 864e5; svg.appendChild(S("text", { x: X(t), y: H - 4, "text-anchor": "middle" }, new Date(t).toISOString().slice(5, 10))); }
    o.events.forEach(e => {
      const i = rows.indexOf(e.type); if (i < 0) return; const y = 20 + i * 34;
      const c = S("circle", { cx: X(+e.date), cy: y, r: 6.5, fill: o.types[e.type].color, stroke: "#07111F", "stroke-width": 2, style: "cursor:pointer" });
      c.addEventListener("mousemove", ev => showTip(ev, `<b>${e.type} · ${e.date.toISOString().replace("T", " ").slice(0, 16)} UTC</b><div>${e.label}</div>`));
      c.addEventListener("mouseleave", hideTip);
      if (e.onClick) c.addEventListener("click", e.onClick);
      svg.appendChild(c);
    });
  }

  window.SVCharts = { lineChart, barChart, sparkline, eventTimeline, hideTip, showTip, fmtNum };
})();

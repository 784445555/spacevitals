#!/usr/bin/env python3
"""
SPACEVITALS — demo data generator and Python analytics cross-check.

    python analysis/build_demo_data.py                      # demo data + scikit-learn analysis
    python analysis/build_demo_data.py --osd575 OSD_575_data # also extract the real Inspiration4 reference

Writes (classic <script> files so index.html opens by double-click, no server needed):
    data/demo_data.js        window.SV_DEMO        — SIMULATED Mars mission (fictional crew)
    data/py_analysis.js      window.SV_PY          — moving average, z-score, IsolationForest (scikit-learn)
    data/osd575_reference.js window.SV_OSD575      — REAL NASA OSDR OSD-575 (Inspiration4) serum chemistry

Requirements: numpy, pandas, scikit-learn (the OSD-575 extract uses only the standard library).
Every simulated value is fictional and labelled "simulated" in the app.

AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant,
and reviewed and tested by the SPACEVITALS team.
"""
import argparse
import csv
import json
import os
import re
import statistics
from datetime import datetime, timezone

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

SEED = 2026
DAYS = 120
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data")

# Fictional crew. No birth dates or other personal data (NASA Space Apps rules on PII).
CREW = [
    {"id": "A1", "full_name": "Elena Vasquez", "role": "Commander", "mission": "Mars Exploration Mission", "sex": "F", "profile": "bone"},
    {"id": "A2", "full_name": "Kenji Mori", "role": "Medical Officer", "mission": "Mars Exploration Mission", "sex": "M", "profile": "nominal"},
    {"id": "A3", "full_name": "Amara Okafor", "role": "Mission Specialist", "mission": "Mars Exploration Mission", "sex": "F", "profile": "sleep"},
    {"id": "A4", "full_name": "Lukas Brandt", "role": "Flight Engineer", "mission": "Mars Exploration Mission", "sex": "M", "profile": "transient"},
]

# Bone-marker trajectories: % change from individual pre-flight baseline at mission milestones.
# Direction (rising urinary Ca and resorption markers in early flight) follows ISS biochemistry
# literature; the magnitudes here are fictional demo values.
BONE_PATH = {
    "bone":      {"ca": [0, 24, 28, 50, 47], "ntx": [0, 34, 50, 96, 90], "ctx": [0, 31, 48, 88, 84]},
    "nominal":   {"ca": [0, 10, 14, 15, 13], "ntx": [0, 12, 16, 18, 17], "ctx": [0, 10, 15, 16, 15]},
    "sleep":     {"ca": [0, 18, 26, 30, 29], "ntx": [0, 22, 30, 36, 34], "ctx": [0, 20, 28, 32, 31]},
    "transient": {"ca": [0, 12, 18, 20, 19], "ntx": [0, 15, 22, 26, 24], "ctx": [0, 14, 20, 23, 22]},
}
MILESTONES = [1, 30, 60, 90, 120]
IF_THRESHOLD = 0.62  # anomaly score cut-off (0.5 ≈ ordinary point)
URINE_DAYS = [-60, -30, -7, 1, 15, 30, 45, 60, 75, 90, 105, 120]


def interp(day, path):
    return float(np.interp(max(day, 1), MILESTONES, path)) if day >= 1 else 0.0


def gen_vitals(rng, prof):
    d = np.arange(1, DAYS + 1)
    base = {"bone": (66, 118, 77, 36.6, 7.5), "nominal": (62, 116, 75, 36.6, 7.3),
            "sleep": (68, 121, 79, 36.7, 7.2), "transient": (64, 119, 78, 36.5, 7.4)}[prof]
    hr = base[0] + rng.normal(0, 2.0, DAYS)
    sbp = base[1] + rng.normal(0, 3.0, DAYS)
    dbp = base[2] + rng.normal(0, 2.2, DAYS)
    temp = base[3] + rng.normal(0, 0.12, DAYS)
    sleep = base[4] + rng.normal(0, 0.35, DAYS)
    spo2 = 98 + rng.normal(0, 0.45, DAYS)
    if prof == "bone":
        hr += np.clip((d - 40) / 80, 0, 1) * 5
        sleep -= np.clip((d - 50) / 40, 0, 1) * 0.6
        win = (d >= 86) & (d <= 91)                      # cluster the AI should pick up at day 90
        hr[win] += rng.normal(16, 2, win.sum()); sleep[win] -= rng.normal(1.8, .3, win.sum())
        temp[win] += rng.normal(.55, .1, win.sum()); sbp[win] += rng.normal(10, 2, win.sum())
        after = d > 91
        sleep[after] += np.clip((d[after] - 91) / 25, 0, 1) * 0.35
    if prof == "sleep":
        sleep -= np.clip((d - 30) / 60, 0, 1) * 1.2
        hr += np.clip((d - 30) / 60, 0, 1) * 3
    if prof == "transient":
        for k in (52, 53):
            hr[k - 1] += 22; temp[k - 1] += .7; spo2[k - 1] -= 1.5
    return pd.DataFrame({"day": d, "heart_rate": hr.round(0), "spo2": np.clip(spo2, 93, 100).round(0),
                         "systolic_pressure": sbp.round(0), "diastolic_pressure": dbp.round(0),
                         "body_temperature": temp.round(1), "sleep_hours": np.clip(sleep, 3.5, 9.5).round(1)})


def gen_bone(rng, prof, sex):
    base = {"ca": 205 if sex == "M" else 180, "ntx": 32 if sex == "M" else 38, "ctx": 170 if sex == "M" else 195,
            "cr": 1.65 if sex == "M" else 1.20}
    rows = []
    for day in URINE_DAYS:
        p = BONE_PATH[prof]
        f = lambda key: 1 + interp(day, p[key]) / 100  # noqa: E731
        rows.append({
            "day": day,
            "urine_calcium": round(base["ca"] * f("ca") * rng.normal(1, .05)),
            "urine_ntx": round(base["ntx"] * f("ntx") * rng.normal(1, .06), 1),
            "urine_ctx": round(base["ctx"] * f("ctx") * rng.normal(1, .06)),
            "urine_creatinine": round(base["cr"] * rng.normal(1, .035), 2),
            "sample_type": "24-h urine (Ca, creatinine) + 2nd-morning void (NTx, CTX)",
            "phase": "pre-flight" if day < 1 else "in-flight",
        })
    return rows


def gen_dose(rng):
    # Deep-space cruise: MSL/RAD measured ~1.84 mSv/day (Zeitlin et al., Science 2013). Values are simulated.
    return [{"day": int(d), "measured_dose": round(float(1.84 * rng.normal(1, .06)), 3), "unit": "mSv/day",
             "device_source": "Simulated personal dosimeter (reference rate: MSL/RAD cruise)"} for d in range(1, DAYS + 1)]


def gen_records(rng, a, vit, bone):
    recs, rid = [], 0

    def add(day, rtype, title, values, notes):
        nonlocal rid
        rid += 1
        recs.append({"id": f"{a['id']}-R{rid:03d}", "astronaut_id": a["id"], "test_day": day, "record_type": rtype,
                     "title": title, "values": values, "notes": notes, "file_url": None, "source": "simulated"})

    hb0 = 14.6 if a["sex"] == "M" else 13.5
    for i, day in enumerate([-30, 30, 60, 90, 120]):
        add(day, "blood", "Blood chemistry panel", {
            "Hemoglobin (g/dL)": round(hb0 - (0.25 * i) + rng.normal(0, .15), 1),
            "Serum calcium (mg/dL)": round(9.5 + 0.06 * i + rng.normal(0, .1), 2),
            "Alkaline phosphatase (U/L)": round(62 + rng.normal(0, 4)),
            "Creatinine (mg/dL)": round(0.95 + rng.normal(0, .05), 2),
            "25-OH vitamin D (ng/mL)": round(34 - 1.5 * i + rng.normal(0, 1.2), 1),
        }, "Venous blood, onboard analyser." if day > 0 else "Pre-flight clinical laboratory.")
    for b in bone:
        add(b["day"], "urine", "Urine bone-marker panel", {
            "Calcium (mg/24h)": b["urine_calcium"], "NTx (nmol BCE/mmol Cr)": b["urine_ntx"],
            "CTX (µg/mmol Cr)": b["urine_ctx"], "Creatinine (g/24h)": b["urine_creatinine"]}, b["sample_type"])
    for day in [-30, 30, 60, 90, 120]:
        hr = int(vit.loc[vit.day == max(day, 1), "heart_rate"].iloc[0])
        add(day, "ecg", "12-lead ECG", {"Heart rate (bpm)": hr, "PR (ms)": int(158 + rng.normal(0, 6)),
                                        "QRS (ms)": int(92 + rng.normal(0, 4)), "QTc (ms)": int(404 + rng.normal(0, 7))},
            "Sinus rhythm. No acute changes vs pre-flight." if day != 90 or a["profile"] != "bone"
            else "Sinus tachycardia during recording; repeat ECG at rest suggested.")
    for day in [-30, 45, 105]:
        add(day, "vision", "Ocular exam (OCT + acuity)", {"Visual acuity (OD/OS)": "20/20 · 20/20",
                                                         "RNFL thickness Δ vs pre-flight (µm)": 0 if day < 0 else round(rng.normal(1.2, .8), 1)},
            "Monitoring for spaceflight-associated neuro-ocular syndrome (SANS). No change requiring action.")
    for day in [-14, 60, 118]:
        add(day, "exam", "Periodic medical examination", {"Weight change (%)": 0 if day < 0 else round(rng.normal(-1.5, .6), 1)},
            "Routine examination by crew medical officer." if day > 0 else "Pre-flight certification exam.")
    return recs


def analyse(vit, bone):
    """Moving average + z-score vs individual baseline + IsolationForest (scikit-learn)."""
    metrics = ["heart_rate", "spo2", "systolic_pressure", "diastolic_pressure", "body_temperature", "sleep_hours"]
    base = vit[vit.day <= 14]
    out = {"z_last": {}, "ma7_last": {}}
    for m in metrics:
        mu, sd = base[m].mean(), max(base[m].std(ddof=1), {"heart_rate": 1.5, "spo2": .5, "systolic_pressure": 2.5,
                                                              "diastolic_pressure": 2, "body_temperature": .1, "sleep_hours": .25}[m])
        ma = vit[m].rolling(7, min_periods=3).mean()
        out["ma7_last"][m] = round(float(ma.iloc[-1]), 2)
        out["z_last"][m] = round(float((ma.iloc[-1] - mu) / sd), 2)
    X = vit[metrics].to_numpy()
    X = (X - X[:14].mean(0)) / np.maximum(X[:14].std(0, ddof=1), 1e-6)
    iforest = IsolationForest(n_estimators=200, max_samples=64, random_state=SEED).fit(X)
    score = -iforest.score_samples(X)            # Liu et al. anomaly score s(x) in (0, 1]
    flagged = vit.day[score >= IF_THRESHOLD].tolist()
    out["isolation_forest"] = {"flagged_days": [int(x) for x in flagged],
                               "scores": [round(float(s), 3) for s in score],
                               "params": f"n_estimators=200, max_samples=64, flag if score >= {IF_THRESHOLD}; features z-scored to days 1–14",
                               "threshold": IF_THRESHOLD}
    b = pd.DataFrame(bone)
    pre = b[b.day <= 1]
    out["bone_pct_last"] = {k: round(float((b[k].iloc[-1] - pre[k].mean()) / pre[k].mean() * 100), 1)
                            for k in ["urine_calcium", "urine_ntx", "urine_ctx", "urine_creatinine"]}
    return out


TP_RE = re.compile(r"([LR])([-+])(\d+)")


def osd575_reference(folder):
    """Extract real Inspiration4 serum chemistry (crew mean per timepoint) from the CMP file."""
    want = {"CALCIUM": "Serum calcium", "ALKALINE PHOSPHATASE": "Alkaline phosphatase", "CREATININE": "Creatinine",
            "POTASSIUM": "Potassium", "SODIUM": "Sodium"}
    path = None
    for dp, _, fns in os.walk(folder):
        for fn in fns:
            if "comprehensive_metabolic_panel" in fn.lower() and "submitted" in fn.lower():
                path = os.path.join(dp, fn)
    if not path:
        return None
    vals, meta = {}, {}
    with open(path, encoding="utf-8-sig", newline="") as f:
        for r in csv.DictReader(f):
            an = (r.get("ANALYTE") or "").strip().upper()
            if an not in want:
                continue
            try:
                v = float(r["VALUE"])
            except (TypeError, ValueError):
                continue
            tp = (r.get("timepoint") or "").strip()
            vals.setdefault(an, {}).setdefault(tp, []).append(v)
            meta[an] = {"unit": r.get("UNITS"), "range": [r.get("RANGE_MIN"), r.get("RANGE_MAX")]}
    key = lambda tp: (lambda m: (int(m.group(3)) * (1 if m.group(2) == "+" else -1)) if m else 0)(TP_RE.search(tp))  # noqa: E731
    out = {}
    for an, tps in vals.items():
        series = [{"tp": tp, "mean": round(statistics.mean(v), 3), "min": min(v), "max": max(v), "n": len(v)}
                  for tp, v in sorted(tps.items(), key=lambda kv: key(kv[0]))]
        out[want[an]] = {"unit": meta[an]["unit"], "lab_range": meta[an]["range"], "series": series}
    return {"dataset": "NASA OSDR OSD-575 (Inspiration4, LSDS-8 Comprehensive Metabolic Panel)",
            "url": "https://osdr.nasa.gov/bio/repo/data/studies/OSD-575",
            "file": os.path.basename(path), "crew_n": 4,
            "note": "3-day orbital flight (2021). L = days before launch, R = days after return. Crew mean per timepoint.",
            "analytes": out}


def write_js(name, var, obj):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(f"/* Generated by analysis/build_demo_data.py on {datetime.now(timezone.utc):%Y-%m-%d %H:%M} UTC. AI disclosure: generator written with the help of Claude (Anthropic). */\n")
        f.write(f"window.{var} = ")
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--osd575", default="OSD_575_data")
    a = ap.parse_args()
    rng = np.random.default_rng(SEED)
    demo = {"generated_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"), "seed": SEED,
            "label": "SIMULATED demo data — fictional crew, not real astronaut measurements",
            "mission": {"name": "Mars Exploration Mission", "current_day": DAYS, "phase": "Earth–Mars cruise"},
            "astronauts": [], "health_metrics": {}, "bone_markers": {}, "dosimeter": {}, "medical_records": {}}
    py = {"generated_utc": demo["generated_utc"], "engine": "pandas + scikit-learn", "by_astronaut": {}}
    for c in CREW:
        vit = gen_vitals(rng, c["profile"])
        bone = gen_bone(rng, c["profile"], c["sex"])
        demo["astronauts"].append({k: c[k] for k in ("id", "full_name", "role", "mission", "sex")})
        demo["health_metrics"][c["id"]] = vit.to_dict("records")
        demo["bone_markers"][c["id"]] = bone
        demo["dosimeter"][c["id"]] = gen_dose(rng)
        demo["medical_records"][c["id"]] = gen_records(rng, c, vit, bone)
        py["by_astronaut"][c["id"]] = analyse(vit, bone)
        print(f"{c['id']} {c['full_name']:<14} IF-flagged days: {py['by_astronaut'][c['id']]['isolation_forest']['flagged_days']}"
              f"  bone change % @120: {py['by_astronaut'][c['id']]['bone_pct_last']}")
    for rec in demo["health_metrics"].values():
        for r in rec:
            for k, v in r.items():
                r[k] = int(v) if k in ("day", "heart_rate", "spo2", "systolic_pressure", "diastolic_pressure") else float(v)
    write_js("demo_data.js", "SV_DEMO", demo)
    write_js("py_analysis.js", "SV_PY", py)
    ref = osd575_reference(a.osd575) if os.path.isdir(a.osd575) else None
    if ref:
        write_js("osd575_reference.js", "SV_OSD575", ref)
        print(f"OSD-575 reference: {list(ref['analytes'])}")
    else:
        print(f"OSD-575 folder not found ({a.osd575}); keeping existing data/osd575_reference.js if present.")
    print("Wrote data/demo_data.js, data/py_analysis.js")


if __name__ == "__main__":
    main()

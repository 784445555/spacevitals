# SPACEVITALS — Monitor. Predict. Protect.

**AI-assisted astronaut health and bone monitoring platform** · NASA Space Apps Challenge 2026
Challenge: *Create Health Monitoring Software for Astronauts on Space Missions*

On a Mars mission, Earth is up to ~22 minutes away (one-way signal delay) and the crew medical officer has to judge health changes on board. SPACEVITALS compares every astronaut with **their own baseline**, finds unusual trends and combinations, and explains them in plain language. Its main feature is **bone health monitoring from urine biomarkers**, because bone loss is one of the best-documented risks of long missions.

> Decision-support prototype. It is not a medical device, and it does not diagnose or prescribe.

## Live demo

The demo is published with GitHub Pages; the link is in the repository description. To run it locally, open `index.html` by double-clicking it. There is no build step, no server and nothing to install.

## Features

| Page | What it does |
|---|---|
| **Overview** | Welcome header, mission day selector (1–120), six metric cards with sparklines, 7-day trend chart, health status panel with the latest AI observation, demo milestones |
| **Health Dashboard** | Metric and date-range filters, daily values with a 7-day moving average, a ±2 SD baseline band and Isolation Forest markers, plus *Add measurement* |
| **Bone Health** | Urinary Ca²⁺, NTx, CTX and creatinine against the individual baseline, a trend chart, before/during/after comparison, AI bone analysis, lab table, *Add urine result*, an education section, and a **real NASA reference** (Inspiration4 serum chemistry, OSD-575) |
| **AI Analysis** | Risk observations (metric, previous and current value, % change, explanation, next action), three alert levels, Isolation Forest score chart, **Python/scikit-learn cross-check**, alert history with acknowledge |
| **Radiation Monitor** | **NASA DONKI** FLR, CME, SEP and GST events with a timeline and date and type filters; simulated personal dosimeter |
| **Medical Records** | Search, type filter, sorting, add record with lab-report upload, record details, comparison over time, OSD-575 reference |
| **Crew Monitoring** | Four fictional crew cards; click one to open that astronaut's dashboard |
| **Settings** | NASA API key, CSV/JSON export, demo data reset, reduced motion, data-source labelling, AI disclosure |

## NASA data used

| Source | How it is used | Label in the app |
|---|---|---|
| **NASA DONKI** (Space Weather Database Of Notifications, Knowledge, Information; CCMC) via `ccmc.gsfc.nasa.gov/DONKI-API/get/` (no key; `api.nasa.gov/DONKI` as fallback) FLR, CME, SEP, GST | Fetched live in the browser; event list and timeline on the Radiation Monitor page, with a cache and a clearly labelled offline sample | `LIVE · NASA DONKI` / `CACHED` / `SAMPLE` |
| **NASA OSDR OSD-575** (Inspiration4 / LSDS-8, Comprehensive Metabolic Panel) | Real pre- and post-flight serum calcium, alkaline phosphatase, creatinine, potassium and sodium of 4 crew members (crew mean, min–max, lab range). Shown as the scientific reference on Bone Health and Medical Records | `NASA OSDR · OSD-575` |
| **MSL/RAD** measurements (NASA Mars Science Laboratory) | ~1.84 mSv/day deep-space cruise dose rate, which anchors the simulated dosimeter | cited in the app |
| **NASA-STD-3001** | 600 mSv career effective-dose limit, shown as context | cited in the app |

Everything else in the demo is **simulated**: the fictional crew, vital signs, urine biomarkers, dosimeter readings and medical records. All of it is labelled `SIMULATED`, and none of it is personal data.

Scientific guardrails built into the app:
- **Urine markers measure bone turnover, not bone density.** The app never diagnoses osteoporosis and points to DXA/QCT for density.
- **DONKI reports space-weather events, not a personal dose.** Personal dose comes only from dosimeter readings (simulated here) and is never calculated from a solar event.
- The OSD-575 crew is only 4 people on a 3-day flight, so it is shown as a reference for real variation, not as evidence of an effect.

## How the analysis works (`js/analytics.js`, mirrored in Python)

1. **Individual baseline:** mission days 1–14 for vitals; the mean of pre-flight samples (L-60, L-30, L-7, day 1) for urine markers.
2. **7-day moving average** smooths day-to-day noise.
3. **Z-score** = (7-day average − baseline mean) / baseline SD. A value ≥ 2 raises *Attention*; ≥ 3 raises *Critical*.
4. **Isolation Forest** (Liu, Ting & Zhou 2008) runs on six z-scored vital signs: 200 trees, ψ = 64, and a day is flagged when its anomaly score is ≥ 0.62. It starts once at least 30 days are available.
5. **Bone rules:** Ca²⁺ +20 % / +40 %; NTx and CTX +30 % / +60 %; creatinine ±15 % triggers a check on collection quality. A combined observation fires when two or more markers rise together.
6. Each observation ends with a **monitoring or review step** for the medical officer, never with a diagnosis or treatment instruction.

`analysis/build_demo_data.py` generates the demo data (seed 2026) and runs the same pipeline with **pandas and scikit-learn**. On the demo record, the in-browser engine and `sklearn.ensemble.IsolationForest` flag the same days (86–91 for the Commander).

```bash
pip install numpy pandas scikit-learn
python analysis/build_demo_data.py --osd575 OSD_575_data
```

## Use of artificial intelligence

- **Development tool:** Claude (Anthropic), a generative AI assistant, was used to write the source code (HTML, CSS, JavaScript, Python, SQL), the demo-data generator, interface text and this README. The team reviewed, ran and tested the result. Each code file carries an AI-disclosure comment in its header.
- **In the product:** the "AI Analysis" is **not** a generative model. It is transparent statistics plus an Isolation Forest (unsupervised machine learning), implemented in plain JavaScript and cross-checked with scikit-learn.
- **Media:** no AI-generated images, audio or video are used. The logo is a simple vector drawing in the code. No NASA logos, flags or mission insignia are used or modified.

## Architecture

```
index.html ── css/styles.css
           ── js/charts.js      dependency-free SVG charts with tooltips (offline-capable)
           ── js/analytics.js   moving average · z-score · Isolation Forest · alert rules
           ── js/app.js         8 views, state, forms, NASA DONKI client, report
           ── data/*.js         demo data, Python results, OSD-575 extract (classic scripts → works from file://)
analysis/build_demo_data.py     data generator + scikit-learn cross-check
backend/schema.sql              PostgreSQL schema for the planned FastAPI backend
```

**Why it is a static app:** judges must be able to open the demo from a link with nothing installed, and a spacecraft tool should keep working offline. The planned production stack is React + FastAPI + PostgreSQL. In it, the backend proxies DONKI with the API key held in an environment variable and stores data using `backend/schema.sql`, and the analytics module ports directly to the Python version. In this static build, a NASA API key typed into Settings is stored only in that browser.

## Demo scenario: "MARS EXPLORATION MISSION — DAY 120"

| Day | What happens |
|---|---|
| 1 | Baseline vitals and initial urine biomarkers |
| 30 | Urinary Ca²⁺ and NTx begin to rise (*Attention*) |
| 60 | Bone-resorption markers rise further |
| 90 | Isolation Forest flags an unusual multi-vital pattern on days 86–91 (*Critical*) |
| 120 | The medical officer report becomes available |

## References

- NASA DONKI — Space Weather Database Of Notifications, Knowledge, Information. NASA Community Coordinated Modeling Center (CCMC). https://ccmc.gsfc.nasa.gov/tools/DONKI/ · API: https://ccmc.gsfc.nasa.gov/DONKI-API/get/
- NASA Open Science Data Repository, OSD-575: SpaceX Inspiration4 (LSDS-8) blood serum metabolic panel. https://osdr.nasa.gov/bio/repo/data/studies/OSD-575
- Zeitlin C. et al. (2013). Measurements of energetic particle radiation in transit to Mars on the Mars Science Laboratory. *Science* 340, 1080–1084.
- LeBlanc A. et al. (2000). Bone mineral and lean tissue loss after long duration space flight. *J Musculoskelet Neuronal Interact* 1(2), 157–160.
- NASA-STD-3001, NASA Space Flight Human-System Standard, Vol. 1 Rev. B (2022).
- Liu F. T., Ting K. M., Zhou Z.-H. (2008). Isolation Forest. *IEEE ICDM*, 413–422.
- Pedregosa F. et al. (2011). Scikit-learn: Machine Learning in Python. *JMLR* 12, 2825–2830.
- Interface icon shapes adapted from Lucide (https://lucide.dev), ISC License.

## Limitations

All crew data is simulated. The thresholds are illustrative and have not been clinically validated. The next step is to calibrate them on real long-duration data from NASA OSDR and to connect real wearable and laboratory devices.

## License

MIT (see `LICENSE`). Uses NASA open data; not endorsed by NASA.

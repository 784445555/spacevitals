-- SPACEVITALS — PostgreSQL schema for the planned FastAPI backend.
-- AI disclosure: written with the help of Claude (Anthropic), reviewed by the SPACEVITALS team.
-- The current MVP is a static web app (data in data/*.js + browser localStorage);
-- this schema mirrors the same entities so the backend can replace them 1:1.
-- Personal data is kept minimal: no birth dates or contact details are stored.

CREATE TABLE astronauts (
    id        TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    mission   TEXT NOT NULL,
    role      TEXT NOT NULL
);

CREATE TABLE health_metrics (
    id                 BIGSERIAL PRIMARY KEY,
    astronaut_id       TEXT NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
    heart_rate         SMALLINT CHECK (heart_rate BETWEEN 20 AND 250),
    spo2               SMALLINT CHECK (spo2 BETWEEN 50 AND 100),
    systolic_pressure  SMALLINT,
    diastolic_pressure SMALLINT,
    body_temperature   NUMERIC(4,1),
    sleep_hours        NUMERIC(4,1),
    source             TEXT NOT NULL DEFAULT 'sensor',   -- sensor | manual | simulated
    measured_at        TIMESTAMPTZ NOT NULL
);
CREATE INDEX ON health_metrics (astronaut_id, measured_at);

CREATE TABLE bone_markers (
    id               BIGSERIAL PRIMARY KEY,
    astronaut_id     TEXT NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
    urine_calcium    NUMERIC(6,1),   -- mg/24 h
    urine_ntx        NUMERIC(6,1),   -- nmol BCE/mmol creatinine
    urine_ctx        NUMERIC(7,1),   -- µg/mmol creatinine
    urine_creatinine NUMERIC(4,2),   -- g/24 h
    sample_type      TEXT,
    source           TEXT NOT NULL DEFAULT 'lab',
    test_date        DATE NOT NULL
);
CREATE INDEX ON bone_markers (astronaut_id, test_date);

CREATE TABLE radiation_events (            -- cached NASA DONKI events
    id          TEXT PRIMARY KEY,           -- flrID / activityID / sepID / gstID
    event_type  TEXT NOT NULL CHECK (event_type IN ('FLR','CME','SEP','GST')),
    event_date  TIMESTAMPTZ NOT NULL,
    description TEXT,
    source      TEXT NOT NULL DEFAULT 'NASA DONKI',
    raw         JSONB
);

CREATE TABLE dosimeter_readings (
    id            BIGSERIAL PRIMARY KEY,
    astronaut_id  TEXT NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
    measured_dose NUMERIC(8,4) NOT NULL,
    unit          TEXT NOT NULL DEFAULT 'mSv/day',
    measured_at   TIMESTAMPTZ NOT NULL,
    device_source TEXT NOT NULL
);

CREATE TABLE health_alerts (
    id           BIGSERIAL PRIMARY KEY,
    astronaut_id TEXT NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
    metric_name  TEXT NOT NULL,
    alert_level  TEXT NOT NULL CHECK (alert_level IN ('normal','attention','critical')),
    description  TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','acknowledged','resolved'))
);

CREATE TABLE medical_records (
    id           BIGSERIAL PRIMARY KEY,
    astronaut_id TEXT NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
    record_type  TEXT NOT NULL CHECK (record_type IN ('blood','urine','ecg','vision','exam','other')),
    title        TEXT,
    values_json  JSONB,
    file_url     TEXT,
    test_date    DATE NOT NULL,
    notes        TEXT
);

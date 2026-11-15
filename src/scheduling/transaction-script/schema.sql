-- Lesson 02: plain tables, no ORM entities yet.
CREATE TABLE IF NOT EXISTS visits (
  id            TEXT PRIMARY KEY,
  client_name   TEXT NOT NULL,
  caregiver_id  TEXT NOT NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  check_in_at   TIMESTAMPTZ,
  check_out_at  TIMESTAMPTZ,
  duration_min  INTEGER,
  status        TEXT NOT NULL DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS billing_lines (
  id            SERIAL PRIMARY KEY,
  visit_id      TEXT NOT NULL,
  duration_min  INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

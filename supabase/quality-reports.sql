-- Table pour stocker les rapports qualité générés par quality-report.ts
CREATE TABLE IF NOT EXISTS quality_reports (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_at   text        NOT NULL UNIQUE,
  period_start   text        NOT NULL,
  period_end     text        NOT NULL,
  report_markdown text       NOT NULL,
  summary        jsonb,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quality_reports_generated_at
  ON quality_reports (generated_at DESC);

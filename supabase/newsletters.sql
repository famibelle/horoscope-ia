-- Table de stockage des newsletters générées
-- À exécuter dans l'éditeur SQL de Supabase

CREATE TABLE IF NOT EXISTS newsletters (
  id             TEXT        PRIMARY KEY,
  date           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subject        TEXT        NOT NULL,
  preview        TEXT,
  html_content   TEXT        NOT NULL,
  text_content   TEXT,
  sign           TEXT,
  subscriber_email TEXT
);

-- Index pour les requêtes par date (liste + déduplication quotidienne)
CREATE INDEX IF NOT EXISTS idx_newsletters_date ON newsletters (date DESC);

-- Lecture publique en lecture seule (pages Next.js avec ANON_KEY)
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "newsletters_select" ON newsletters
  FOR SELECT USING (true);

CREATE POLICY "newsletters_insert_service" ON newsletters
  FOR INSERT WITH CHECK (true);

CREATE POLICY "newsletters_update_service" ON newsletters
  FOR UPDATE USING (true);

CREATE POLICY "newsletters_delete_service" ON newsletters
  FOR DELETE USING (true);

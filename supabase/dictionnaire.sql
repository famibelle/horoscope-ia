-- Dictionnaire faune/flore vivant
-- Pré-peuplé depuis faune-data.ts / flore-data.ts via scripts/seed-dictionnaire.ts
-- usage_count s'incrémente à chaque génération d'horoscope

CREATE TABLE IF NOT EXISTS dictionnaire (
  id                   text PRIMARY KEY,
  type                 text NOT NULL CHECK (type IN ('faune', 'flore')),
  nom_creole           text NOT NULL,
  nom_francais         text,
  nom_scientifique     text,
  categorie            text,
  dimension_culturelle text,
  sacre_symbolique     text,
  is_resistance_symbol boolean DEFAULT false,
  tags                 text[]  DEFAULT '{}',
  usage_count          integer DEFAULT 0,
  first_cited          text,
  last_cited           text,
  signes               text[]  DEFAULT '{}',
  updated_at           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dictionnaire_type  ON dictionnaire(type);
CREATE INDEX IF NOT EXISTS idx_dictionnaire_usage ON dictionnaire(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_dictionnaire_creole ON dictionnaire(nom_creole);

-- Lecture publique (même pattern que les autres tables)
ALTER TABLE dictionnaire ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read dictionnaire" ON dictionnaire FOR SELECT USING (true);

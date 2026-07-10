-- Table de suivi de la consommation de tokens Mistral (tous scripts + routes API confondus)
CREATE TABLE IF NOT EXISTS mistral_usage (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at        timestamptz DEFAULT now(),
  source            text        NOT NULL,   -- ex: 'generate-horoscopes:horoscope', 'api:tts:optimize'
  model             text        NOT NULL,   -- 'mistral-large-latest', 'mistral-small-latest', 'voxtral-mini-tts-2603'
  endpoint          text        NOT NULL DEFAULT 'chat', -- 'chat' | 'audio'
  prompt_tokens     integer,
  completion_tokens integer,
  total_tokens      integer,
  success           boolean     NOT NULL DEFAULT true,
  http_status       integer,
  duration_ms       integer
);

CREATE INDEX IF NOT EXISTS idx_mistral_usage_created_at ON mistral_usage (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mistral_usage_source ON mistral_usage (source);
CREATE INDEX IF NOT EXISTS idx_mistral_usage_model ON mistral_usage (model);

-- XPlayerCards central platform — run once against the dedicated Neon PostgreSQL database.
-- No user accounts are created by this MVP. Writes are protected by STUDIO_ADMIN_TOKEN.
CREATE TABLE IF NOT EXISTS public.games (
  slug text PRIMARY KEY,
  config jsonb NOT NULL,
  poster_base64 text NOT NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT games_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{3,59}$'),
  CONSTRAINT games_config_object CHECK (jsonb_typeof(config) = 'object')
);

CREATE INDEX IF NOT EXISTS games_updated_at_idx ON public.games (updated_at DESC);
CREATE INDEX IF NOT EXISTS games_published_idx ON public.games (is_published, updated_at DESC);

COMMENT ON TABLE public.games IS
  'Published mini-games. Config and generated 1200x630 social poster are served by the XPlayerCards platform.';

-- Interactive cards (newsletter widgets hosted as X player cards). Added 2026-10-23.
CREATE TABLE IF NOT EXISTS public.cards (
  slug text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'newsletter',
  config jsonb NOT NULL,
  poster_base64 text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cards_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{3,59}$'),
  CONSTRAINT cards_config_object CHECK (jsonb_typeof(config) = 'object'),
  CONSTRAINT cards_kind_known CHECK (kind IN ('newsletter', 'quiz'))
);

CREATE INDEX IF NOT EXISTS cards_updated_at_idx ON public.cards (updated_at DESC);
CREATE INDEX IF NOT EXISTS cards_published_idx ON public.cards (is_published, updated_at DESC);

COMMENT ON TABLE public.cards IS
  'Interactive X player cards (newsletter signup widgets). Config drives server-rendered card pages at /c/:slug.';

-- Subscribers collected by interactive cards.
CREATE TABLE IF NOT EXISTS public.card_subscribers (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_slug text NOT NULL REFERENCES public.cards(slug) ON DELETE CASCADE,
  email text NOT NULL,
  list_name text NOT NULL DEFAULT 'newsletter',
  source text NOT NULL DEFAULT 'card',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT card_subscribers_email_format CHECK (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  CONSTRAINT card_subscribers_unique UNIQUE (card_slug, email, list_name)
);

CREATE INDEX IF NOT EXISTS card_subscribers_card_idx ON public.card_subscribers (card_slug, created_at DESC);

COMMENT ON TABLE public.card_subscribers IS
  'Emails collected through interactive cards. One row per (card, email, list).';

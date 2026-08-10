-- RationQ: Supabase schema for persistent articles + news pipeline
-- Run this once in your Supabase project's SQL Editor (Project -> SQL Editor -> New query).
-- Safe to re-run: uses IF NOT EXISTS everywhere.

create extension if not exists "pgcrypto";

-- ============================================================
-- ARTICLES
-- Core scalar fields get real columns (used for filtering/sorting
-- in the app). Nested structures (benefits, documents, steps, source)
-- are stored as JSONB since their shape is already defined in
-- src/types.ts and doesn't need separate relational tables at this scale.
-- ============================================================
create table if not exists articles (
  id                    text primary key,
  slug                  text unique not null,
  scheme_id             text not null,
  title                 text not null,
  short_summary         text not null,
  what_happened         text not null,
  what_is_scheme        text not null,
  benefits              jsonb not null default '[]',
  who_can_apply         jsonb not null default '[]',
  who_cannot_apply      jsonb not null default '[]',
  documents             jsonb not null default '[]',
  steps                 jsonb not null default '[]',
  deadline              text,
  status_check_guide    text,
  official_website      text,
  important_warnings    jsonb not null default '[]',
  source                jsonb not null default '{}',
  generated_image       text,
  published_at          timestamptz not null default now(),
  last_verified_at      timestamptz not null default now(),
  read_time_minutes     integer default 3,
  category              text not null,
  state                 text not null,
  is_central            boolean not null default false,
  is_new                boolean not null default true,
  is_updated            boolean not null default false,
  status                text not null default 'draft' check (status in ('draft', 'pending_verification', 'published', 'archived')),
  ai_confidence_score   numeric,
  language              text default 'en',
  title_telugu          text,
  short_summary_telugu  text,
  what_is_scheme_telugu text,
  what_happened_telugu  text,
  created_at            timestamptz not null default now()
);

-- Dedup + lookup indexes
create unique index if not exists articles_scheme_id_idx on articles (scheme_id);
create index if not exists articles_status_idx on articles (status);
create index if not exists articles_category_idx on articles (lower(category));
create index if not exists articles_state_idx on articles (lower(state));
create index if not exists articles_title_trgm_idx on articles using gin (to_tsvector('english', title));

-- ============================================================
-- NEWS PIPELINE ITEMS
-- The admin "source crawl" queue (RSS-fetched or simulated candidates
-- awaiting AI restructuring into an Article).
-- ============================================================
create table if not exists pipeline_items (
  id                    text primary key,
  source_url            text not null,
  source_title          text not null,
  source_domain         text not null,
  fetched_at            timestamptz not null default now(),
  text_snippet          text,
  relevance_status      text not null default 'relevant' check (relevance_status in ('relevant', 'irrelevant', 'duplicate')),
  confidence_score      numeric not null default 0.5,
  extracted_department  text,
  generated_article_id  text references articles(id),
  created_at            timestamptz not null default now()
);

-- A given press-release URL should only ever be queued once.
create unique index if not exists pipeline_items_source_url_idx on pipeline_items (source_url);
create index if not exists pipeline_items_relevance_idx on pipeline_items (relevance_status);

-- ============================================================
-- Row Level Security
-- The app talks to these tables ONLY from the server using the
-- SERVICE ROLE key (which bypasses RLS), so RLS can stay enabled
-- with no public policies — the anon/public key gets zero access.
-- ============================================================
alter table articles enable row level security;
alter table pipeline_items enable row level security;

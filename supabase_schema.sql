-- Supabase Schema for RationQ / Scheme Portal
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

CREATE TABLE IF NOT EXISTS public.articles (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    scheme_id TEXT,
    title TEXT NOT NULL,
    title_telugu TEXT,
    short_summary TEXT,
    short_summary_telugu TEXT,
    what_happened TEXT,
    what_happened_telugu TEXT,
    what_is_scheme TEXT,
    what_is_scheme_telugu TEXT,
    detailed_guide_text TEXT,
    detailed_guide_text_telugu TEXT,
    benefits JSONB DEFAULT '[]'::jsonb,
    who_can_apply JSONB DEFAULT '[]'::jsonb,
    who_cannot_apply JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    steps JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    important_warnings JSONB DEFAULT '[]'::jsonb,
    source JSONB DEFAULT '{}'::jsonb,
    deadline TEXT,
    status_check_guide TEXT,
    official_website TEXT,
    generated_image TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    read_time_minutes INT DEFAULT 4,
    category TEXT DEFAULT 'Government Schemes',
    state TEXT DEFAULT 'Central Government',
    is_central BOOLEAN DEFAULT true,
    is_new BOOLEAN DEFAULT false,
    is_updated BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'published',
    data JSONB -- Full JSON representation for quick document fallback
);

CREATE TABLE IF NOT EXISTS public.news_pipeline (
    id TEXT PRIMARY KEY,
    source_url TEXT,
    source_title TEXT,
    source_domain TEXT,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    text_snippet TEXT,
    relevance_status TEXT DEFAULT 'relevant',
    extracted_department TEXT
);

-- Enable RLS (Row Level Security) & add public read policy
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Allow service/anon write access on articles" ON public.articles FOR ALL USING (true);

CREATE POLICY "Allow public read access on news_pipeline" ON public.news_pipeline FOR SELECT USING (true);
CREATE POLICY "Allow service/anon write access on news_pipeline" ON public.news_pipeline FOR ALL USING (true);

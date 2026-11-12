-- =============================================================================
-- Migration: 001_journal_setup.sql
-- Description: Complete schema, indexes, RLS policies, triggers, and storage
--              setup for the Portfolio Journal feature.
-- Target: Supabase PostgreSQL
-- Where to run: Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =============================================================================

-- Ensure cryptographic functions are available for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. TABLES
-- -----------------------------------------------------------------------------

-- 1.1 Core Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT            NOT NULL,
  slug            TEXT            UNIQUE NOT NULL,
  description     TEXT,
  pov             TEXT,
  cover_image     TEXT,
  start_date      TEXT,
  end_date        TEXT,
  city            TEXT,
  state           TEXT,
  country         TEXT,
  travel_type     TEXT,
  transport       TEXT,
  companions      TEXT,
  distance        TEXT,
  expenses        TEXT,
  closing_note    TEXT,
  status          TEXT            NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  published_at    TIMESTAMPTZ,
  seo_title       TEXT,
  seo_description TEXT
);

-- 1.2 Trip Photographs Table
CREATE TABLE IF NOT EXISTS public.trip_photos (
  id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID            NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  image_url     TEXT            NOT NULL,
  caption       TEXT,
  location_name TEXT,
  taken_at      TEXT,
  display_order INTEGER         NOT NULL DEFAULT 0
);

-- 1.3 Trip Explored Places / Locations Table
CREATE TABLE IF NOT EXISTS public.trip_locations (
  id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID            NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name          TEXT            NOT NULL,
  latitude      NUMERIC,
  longitude     NUMERIC,
  description   TEXT,
  image_url     TEXT,
  rating        INTEGER         CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  maps_url      TEXT,
  display_order INTEGER         NOT NULL DEFAULT 0
);

-- 1.4 Trip Favourite Moments / Highlights Table
CREATE TABLE IF NOT EXISTS public.trip_highlights (
  id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID            NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title         TEXT            NOT NULL,
  description   TEXT,
  image_url     TEXT,
  display_order INTEGER         NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- 2. PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_trips_status         ON public.trips (status);
CREATE INDEX IF NOT EXISTS idx_trips_slug           ON public.trips (slug);
CREATE INDEX IF NOT EXISTS idx_trips_published_at   ON public.trips (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_trip_photos_trip     ON public.trip_photos (trip_id, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_trip_locations_trip  ON public.trip_locations (trip_id, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_trip_highlights_trip ON public.trip_highlights (trip_id, display_order ASC);

-- -----------------------------------------------------------------------------
-- 3. TIMESTAMP AUTOMATION TRIGGER
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_trips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_trips_updated_at ON public.trips;
CREATE TRIGGER trg_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_trips_updated_at();

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

ALTER TABLE public.trips           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_photos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_locations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_highlights  ENABLE ROW LEVEL SECURITY;

-- 4.1 Trips Policies
-- Public visitors can read ONLY published trips; drafts are strictly hidden
DROP POLICY IF EXISTS "Public can view published trips" ON public.trips;
CREATE POLICY "Public can view published trips"
  ON public.trips
  FOR SELECT
  USING (status = 'published');

-- Server-side admin actions use service_role, granting full administrative access
DROP POLICY IF EXISTS "Service role has full access to trips" ON public.trips;
DROP POLICY IF EXISTS "Admin write access to trips" ON public.trips;
CREATE POLICY "Service role has full access to trips"
  ON public.trips
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4.2 Trip Photos Policies
DROP POLICY IF EXISTS "Public can view published trip photos" ON public.trip_photos;
CREATE POLICY "Public can view published trip photos"
  ON public.trip_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_photos.trip_id
        AND trips.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Service role has full access to trip photos" ON public.trip_photos;
DROP POLICY IF EXISTS "Admin write access to trip photos" ON public.trip_photos;
CREATE POLICY "Service role has full access to trip photos"
  ON public.trip_photos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4.3 Trip Locations Policies
DROP POLICY IF EXISTS "Public can view published trip locations" ON public.trip_locations;
CREATE POLICY "Public can view published trip locations"
  ON public.trip_locations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_locations.trip_id
        AND trips.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Service role has full access to trip locations" ON public.trip_locations;
DROP POLICY IF EXISTS "Admin write access to trip locations" ON public.trip_locations;
CREATE POLICY "Service role has full access to trip locations"
  ON public.trip_locations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4.4 Trip Highlights Policies
DROP POLICY IF EXISTS "Public can view published trip highlights" ON public.trip_highlights;
CREATE POLICY "Public can view published trip highlights"
  ON public.trip_highlights
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_highlights.trip_id
        AND trips.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Service role has full access to trip highlights" ON public.trip_highlights;
DROP POLICY IF EXISTS "Admin write access to trip highlights" ON public.trip_highlights;
CREATE POLICY "Service role has full access to trip highlights"
  ON public.trip_highlights
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 5. STORAGE BUCKET CONFIGURATION ('journal')
-- -----------------------------------------------------------------------------

-- Create or configure the public 'journal' bucket for travel photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'journal',
  'journal',
  true,
  10485760, -- 10MB limit per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

-- Storage RLS: Public read access for display
DROP POLICY IF EXISTS "Public can view journal images" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public can view journal images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'journal');

-- Storage RLS: Service role can manage all images (upload, delete)
DROP POLICY IF EXISTS "Service role can manage journal images" ON storage.objects;
DROP POLICY IF EXISTS "Admin write access to journal images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Full Storage Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
CREATE POLICY "Service role can manage journal images"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'journal')
  WITH CHECK (bucket_id = 'journal');

-- =============================================================================
-- Migration Complete!
-- =============================================================================


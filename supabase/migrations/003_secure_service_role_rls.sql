-- =============================================================================
-- Migration: 003_secure_service_role_rls.sql
-- Description: Enforces strict, secure Row Level Security (RLS) policies.
--              - Public visitors (anon/unauthenticated) can ONLY read published trips,
--                their associated photos, locations, highlights, and journal images.
--              - Public visitors are completely BLOCKED from inserting, updating,
--                or deleting any record or uploading any file.
--              - Privileged write operations are restricted strictly to service_role,
--                which is executed exclusively by the server API after verifying
--                the admin session.
-- Where to run: Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =============================================================================

-- 1. Trips table
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write access to trips" ON public.trips;
DROP POLICY IF EXISTS "Public can view published trips" ON public.trips;
DROP POLICY IF EXISTS "Service role has full access to trips" ON public.trips;

CREATE POLICY "Public can view published trips"
  ON public.trips
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Service role has full access to trips"
  ON public.trips
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Trip photos table
ALTER TABLE public.trip_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write access to trip photos" ON public.trip_photos;
DROP POLICY IF EXISTS "Public can view published trip photos" ON public.trip_photos;
DROP POLICY IF EXISTS "Service role has full access to trip photos" ON public.trip_photos;

CREATE POLICY "Public can view published trip photos"
  ON public.trip_photos
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_photos.trip_id
        AND trips.status = 'published'
    )
  );

CREATE POLICY "Service role has full access to trip photos"
  ON public.trip_photos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Trip locations table
ALTER TABLE public.trip_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write access to trip locations" ON public.trip_locations;
DROP POLICY IF EXISTS "Public can view published trip locations" ON public.trip_locations;
DROP POLICY IF EXISTS "Service role has full access to trip locations" ON public.trip_locations;

CREATE POLICY "Public can view published trip locations"
  ON public.trip_locations
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_locations.trip_id
        AND trips.status = 'published'
    )
  );

CREATE POLICY "Service role has full access to trip locations"
  ON public.trip_locations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Trip highlights table
ALTER TABLE public.trip_highlights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write access to trip highlights" ON public.trip_highlights;
DROP POLICY IF EXISTS "Public can view published trip highlights" ON public.trip_highlights;
DROP POLICY IF EXISTS "Service role has full access to trip highlights" ON public.trip_highlights;

CREATE POLICY "Public can view published trip highlights"
  ON public.trip_highlights
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_highlights.trip_id
        AND trips.status = 'published'
    )
  );

CREATE POLICY "Service role has full access to trip highlights"
  ON public.trip_highlights
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Storage bucket 'journal'
DROP POLICY IF EXISTS "Admin Full Storage Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin write access to journal images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Public can view journal images" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage journal images" ON storage.objects;

CREATE POLICY "Public can view journal images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'journal');

CREATE POLICY "Service role can manage journal images"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'journal')
  WITH CHECK (bucket_id = 'journal');


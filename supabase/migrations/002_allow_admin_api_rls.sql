-- =============================================================================
-- Migration: 002_allow_admin_api_rls.sql
-- Description: Updates Row Level Security (RLS) policies to allow write operations
--              (INSERT, UPDATE, DELETE) and storage uploads when using the
--              Publishable / Anon key from the server-side Next.js admin API.
-- Where to run: Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =============================================================================

-- 1. Trips table policies
DROP POLICY IF EXISTS "Service role has full access to trips" ON public.trips;
DROP POLICY IF EXISTS "Admin write access to trips" ON public.trips;
CREATE POLICY "Admin write access to trips"
  ON public.trips
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 2. Trip photos table policies
DROP POLICY IF EXISTS "Service role has full access to trip photos" ON public.trip_photos;
DROP POLICY IF EXISTS "Admin write access to trip photos" ON public.trip_photos;
CREATE POLICY "Admin write access to trip photos"
  ON public.trip_photos
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 3. Trip locations table policies
DROP POLICY IF EXISTS "Service role has full access to trip locations" ON public.trip_locations;
DROP POLICY IF EXISTS "Admin write access to trip locations" ON public.trip_locations;
CREATE POLICY "Admin write access to trip locations"
  ON public.trip_locations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 4. Trip highlights table policies
DROP POLICY IF EXISTS "Service role has full access to trip highlights" ON public.trip_highlights;
DROP POLICY IF EXISTS "Admin write access to trip highlights" ON public.trip_highlights;
CREATE POLICY "Admin write access to trip highlights"
  ON public.trip_highlights
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 5. Supabase Storage bucket 'journal' policies
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Full Storage Access" ON storage.objects;
CREATE POLICY "Admin Full Storage Access"
  ON storage.objects
  FOR ALL
  TO public
  USING (bucket_id = 'journal')
  WITH CHECK (bucket_id = 'journal');


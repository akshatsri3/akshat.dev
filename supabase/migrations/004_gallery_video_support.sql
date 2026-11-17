-- =============================================================================
-- Migration 004: Extend Journal Gallery with Video Support
-- Description: Adds media_type ('image' | 'video'), video_url, thumbnail_url,
--              and duration to public.trip_photos while preserving all
--              existing photographs, display ordering, and RLS policies.
-- =============================================================================

-- 1. Add media_type column (defaults to 'image' for all existing and new photos)
ALTER TABLE public.trip_photos 
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image' 
  CHECK (media_type IN ('image', 'video'));

-- 2. Add video_url column for storing video file URLs in Supabase storage
ALTER TABLE public.trip_photos 
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 3. Add thumbnail_url column for video poster images or photo thumbnails
ALTER TABLE public.trip_photos 
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 4. Add duration column (video duration in seconds)
ALTER TABLE public.trip_photos 
  ADD COLUMN IF NOT EXISTS duration NUMERIC;

-- 5. Make image_url nullable so video items don't strictly require image_url
--    if video_url is provided, while existing records remain valid.
ALTER TABLE public.trip_photos 
  ALTER COLUMN image_url DROP NOT NULL;

-- 6. Add constraint ensuring at least one media URL is present
ALTER TABLE public.trip_photos 
  DROP CONSTRAINT IF EXISTS chk_trip_photos_media_url;

ALTER TABLE public.trip_photos 
  ADD CONSTRAINT chk_trip_photos_media_url 
  CHECK (image_url IS NOT NULL OR video_url IS NOT NULL);

-- 7. Add index for media_type queries if filtering by media type
CREATE INDEX IF NOT EXISTS idx_trip_photos_media_type 
  ON public.trip_photos (media_type);

-- Notify schema reload
COMMENT ON COLUMN public.trip_photos.media_type IS 'Media type: image or video';
COMMENT ON COLUMN public.trip_photos.video_url IS 'Public URL of MP4 or WebM video file in Supabase Storage';
COMMENT ON COLUMN public.trip_photos.thumbnail_url IS 'Public URL of thumbnail/poster image';
COMMENT ON COLUMN public.trip_photos.duration IS 'Video length in seconds';


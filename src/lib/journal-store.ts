import { supabase } from "./supabase";
export { isAdmin, adminLogin, adminLogout, getAdminToken } from "@/lib/blog-store";
import { isAdmin, getAdminToken } from "@/lib/blog-store";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface JournalTrip {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  pov: string | null;
  cover_image: string | null;
  start_date: string | null;
  end_date: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  travel_type: string | null;
  transport: string | null;
  companions: string | null;
  distance: string | null;
  expenses: string | null;
  closing_note: string | null;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export interface JournalPhoto {
  id: string;
  trip_id: string;
  image_url: string;
  media_type?: "image" | "video";
  video_url?: string | null;
  thumbnail_url?: string | null;
  duration?: number | null;
  caption: string | null;
  location_name: string | null;
  taken_at: string | null;
  display_order: number;
}

export interface JournalLocation {
  id: string;
  trip_id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  image_url: string | null;
  rating: number | null;
  maps_url: string | null;
  display_order: number;
}

export interface JournalHighlight {
  id: string;
  trip_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let warnedNotConfigured = false;

/**
 * Checks if Supabase client credentials exist and are not placeholders.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return false;
  if (
    url.includes("your-project") ||
    url.includes("example.com") ||
    key.includes("your-") ||
    url.trim() === ""
  ) {
    return false;
  }
  return true;
}

function warnMissingConfig(operation: string) {
  if (!warnedNotConfigured) {
    console.warn(
      `[Journal] Supabase backend is not yet connected or configured in .env (${operation}). Showing empty state.`
    );
    warnedNotConfigured = true;
  }
}

/** Converts a title to a clean URL-friendly slug */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Public Read Functions ───────────────────────────────────────────────────

/**
 * Returns all published trips ordered by published_at desc.
 * Safe from TypeError: Failed to fetch.
 */
export async function getPublishedTrips(): Promise<JournalTrip[]> {
  if (!isSupabaseConfigured()) {
    warnMissingConfig("getPublishedTrips");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.warn("[Journal] Error fetching published trips:", error.message);
      return [];
    }

    return (data as JournalTrip[]) || [];
  } catch (err: any) {
    console.warn("[Journal] Connection failed in getPublishedTrips:", err?.message || err);
    return [];
  }
}

/**
 * Returns a single published trip by slug, or null.
 */
export async function getTripBySlug(slug: string): Promise<JournalTrip | null> {
  if (!isSupabaseConfigured()) {
    warnMissingConfig("getTripBySlug");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) {
      if (error.code !== "PGRST116") {
        console.warn("[Journal] Error fetching trip by slug:", error.message);
      }
      return null;
    }

    return data as JournalTrip;
  } catch (err: any) {
    console.warn("[Journal] Connection failed in getTripBySlug:", err?.message || err);
    return null;
  }
}

/**
 * Returns photos for a published trip ordered by display_order.
 */
export async function getTripPhotos(tripId: string): Promise<JournalPhoto[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("trip_photos")
      .select("*")
      .eq("trip_id", tripId)
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("[Journal] Error fetching photos:", error.message);
      return [];
    }

    return (data as JournalPhoto[]) || [];
  } catch (err: any) {
    console.warn("[Journal] Connection failed in getTripPhotos:", err?.message || err);
    return [];
  }
}

/**
 * Returns mapped locations for a trip ordered by display_order.
 */
export async function getTripLocations(tripId: string): Promise<JournalLocation[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("trip_locations")
      .select("*")
      .eq("trip_id", tripId)
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("[Journal] Error fetching locations:", error.message);
      return [];
    }

    return (data as JournalLocation[]) || [];
  } catch (err: any) {
    console.warn("[Journal] Connection failed in getTripLocations:", err?.message || err);
    return [];
  }
}

/**
 * Returns highlights for a trip ordered by display_order.
 */
export async function getTripHighlights(tripId: string): Promise<JournalHighlight[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("trip_highlights")
      .select("*")
      .eq("trip_id", tripId)
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("[Journal] Error fetching highlights:", error.message);
      return [];
    }

    return (data as JournalHighlight[]) || [];
  } catch (err: any) {
    console.warn("[Journal] Connection failed in getTripHighlights:", err?.message || err);
    return [];
  }
}

/**
 * Computes aggregate statistics from published trips.
 */
export async function getJournalStats(): Promise<{
  trips: number;
  cities: number;
  states: number;
  countries: number;
}> {
  if (!isSupabaseConfigured()) {
    warnMissingConfig("getJournalStats");
    return { trips: 0, cities: 0, states: 0, countries: 0 };
  }

  try {
    const { data, error } = await supabase
      .from("trips")
      .select("city, state, country")
      .eq("status", "published");

    if (error || !data) {
      return { trips: 0, cities: 0, states: 0, countries: 0 };
    }

    const trips = data.length;
    const cities = new Set(data.map((t) => t.city).filter(Boolean)).size;
    const states = new Set(data.map((t) => t.state).filter(Boolean)).size;
    const countries = new Set(data.map((t) => t.country).filter(Boolean)).size;

    return { trips, cities, states, countries };
  } catch (err: any) {
    console.warn("[Journal] Connection failed in getJournalStats:", err?.message || err);
    return { trips: 0, cities: 0, states: 0, countries: 0 };
  }
}

/**
 * Returns all mapped locations for published trips along with their parent trip.
 */
export async function getPublishedLocationsWithTrips(): Promise<{
  locations: JournalLocation[];
  tripsByLocationId: Record<string, JournalTrip>;
}> {
  if (!isSupabaseConfigured()) {
    return { locations: [], tripsByLocationId: {} };
  }

  try {
    const { data: publishedTrips, error: tripsError } = await supabase
      .from("trips")
      .select("*")
      .eq("status", "published");

    if (tripsError || !publishedTrips || publishedTrips.length === 0) {
      return { locations: [], tripsByLocationId: {} };
    }

    const tripIds = publishedTrips.map((t) => t.id);
    const tripMap = new Map<string, JournalTrip>(
      publishedTrips.map((t) => [t.id, t as JournalTrip])
    );

    const { data: locations, error: locsError } = await supabase
      .from("trip_locations")
      .select("*")
      .in("trip_id", tripIds)
      .order("display_order", { ascending: true });

    if (locsError || !locations) {
      return { locations: [], tripsByLocationId: {} };
    }

    const tripsByLocationId: Record<string, JournalTrip> = {};
    for (const loc of locations) {
      const parentTrip = tripMap.get(loc.trip_id);
      if (parentTrip) {
        tripsByLocationId[loc.id] = parentTrip;
      }
    }

    return {
      locations: locations as JournalLocation[],
      tripsByLocationId,
    };
  } catch (err: any) {
    console.warn("[Journal] Connection failed in getPublishedLocationsWithTrips:", err?.message || err);
    return { locations: [], tripsByLocationId: {} };
  }
}

// ─── Admin Operations (Delegated to Server API with Passcode) ────────────────

function getAdminHeaders() {
  const token = getAdminToken() || "Akshat321!";
  return {
    "Content-Type": "application/json",
    "x-admin-passcode": token,
  };
}

/**
 * Returns all trips including drafts.
 */
export async function getAllTrips(): Promise<JournalTrip[]> {
  if (!isAdmin()) {
    throw new Error("Unauthorized: admin session required.");
  }

  try {
    const res = await fetch("/api/journal/admin?action=getAllTrips", {
      headers: getAdminHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.trips || [];
  } catch (err: any) {
    console.error("Failed to getAllTrips:", err);
    return [];
  }
}

/**
 * Returns summary stats for admin dashboard.
 */
export async function getAdminStats(): Promise<{
  total: number;
  published: number;
  drafts: number;
  totalPhotos: number;
}> {
  if (!isAdmin()) {
    return { total: 0, published: 0, drafts: 0, totalPhotos: 0 };
  }

  try {
    const res = await fetch("/api/journal/admin?action=getAdminStats", {
      headers: getAdminHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return { total: 0, published: 0, drafts: 0, totalPhotos: 0 };
    }

    const data = await res.json();
    return data.stats || { total: 0, published: 0, drafts: 0, totalPhotos: 0 };
  } catch (err) {
    return { total: 0, published: 0, drafts: 0, totalPhotos: 0 };
  }
}

/**
 * Fetches a single trip with its related records.
 */
export async function getTripById(id: string): Promise<{
  trip: JournalTrip | null;
  photos: JournalPhoto[];
  locations: JournalLocation[];
  highlights: JournalHighlight[];
}> {
  try {
    const res = await fetch(`/api/journal/admin?action=getTripById&id=${encodeURIComponent(id)}`, {
      headers: getAdminHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return { trip: null, photos: [], locations: [], highlights: [] };
    }

    const data = await res.json();
    return {
      trip: data.trip || null,
      photos: data.photos || [],
      locations: data.locations || [],
      highlights: data.highlights || [],
    };
  } catch (err) {
    return { trip: null, photos: [], locations: [], highlights: [] };
  }
}

/**
 * Creates a new trip.
 */
export async function createTrip(tripData: Partial<JournalTrip>): Promise<JournalTrip> {
  const res = await fetch("/api/journal/admin", {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({
      action: "createTrip",
      trip: tripData,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to create trip.");
  }

  return data.trip;
}

/**
 * Updates an existing trip.
 */
export async function updateTrip(id: string, tripData: Partial<JournalTrip>): Promise<JournalTrip> {
  const res = await fetch("/api/journal/admin", {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({
      action: "updateTrip",
      id,
      trip: tripData,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update trip.");
  }

  return data.trip;
}

/**
 * Deletes a trip and cleans up its stored photos.
 */
export async function deleteTrip(id: string): Promise<void> {
  const res = await fetch("/api/journal/admin", {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({
      action: "deleteTrip",
      id,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to delete trip.");
  }
}

/**
 * Publishes a trip.
 */
export async function publishTrip(id: string): Promise<JournalTrip> {
  const res = await fetch("/api/journal/admin", {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({
      action: "publishTrip",
      id,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to publish trip.");
  }

  return data.trip;
}

/**
 * Unpublishes a trip.
 */
export async function unpublishTrip(id: string): Promise<JournalTrip> {
  const res = await fetch("/api/journal/admin", {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({
      action: "unpublishTrip",
      id,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to unpublish trip.");
  }

  return data.trip;
}

/**
 * Saves/replaces photos for a trip.
 */
export async function saveTripPhotos(
  tripId: string,
  photos: Partial<JournalPhoto>[]
): Promise<void> {
  const res = await fetch("/api/journal/admin", {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({
      action: "savePhotos",
      tripId,
      photos,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to save photos.");
  }
}

/**
 * Saves/replaces locations for a trip.
 */
export async function saveTripLocations(
  tripId: string,
  locations: Partial<JournalLocation>[]
): Promise<void> {
  const res = await fetch("/api/journal/admin", {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({
      action: "saveLocations",
      tripId,
      locations,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to save locations.");
  }
}

/**
 * Saves/replaces highlights for a trip.
 */
export async function saveTripHighlights(
  tripId: string,
  highlights: Partial<JournalHighlight>[]
): Promise<void> {
  const res = await fetch("/api/journal/admin", {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({
      action: "saveHighlights",
      tripId,
      highlights,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to save highlights.");
  }
}

export interface UploadMediaResult {
  url: string;
  media_type: "image" | "video";
  path: string;
}

/**
 * Uploads a media file (photo or video) to the 'journal' Supabase storage bucket via the server API.
 * Photos are stored in `${tripId}/...` and videos are stored in `videos/${tripId}/...`.
 */
export async function uploadJournalMedia(
  file: File,
  tripId: string = "general"
): Promise<UploadMediaResult> {
  if (!isAdmin()) {
    throw new Error("Unauthorized: admin session required.");
  }

  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
  ];
  const allowedVideoTypes = ["video/mp4", "video/webm"];
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const isVideo = allowedVideoTypes.includes(file.type) || ext === "mp4" || ext === "webm";
  const isImage = allowedImageTypes.includes(file.type) || ["jpg", "jpeg", "png", "webp", "avif", "gif"].includes(ext);

  if (!isVideo && !isImage) {
    throw new Error(
      `Unsupported file format for "${file.name}". Supported: Photos (JPEG, PNG, WebP, AVIF, GIF) and Videos (MP4, WebM).`
    );
  }

  const maxBytes = isVideo ? 100 * 1024 * 1024 : 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    const limitStr = isVideo ? "100MB" : "15MB";
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File "${file.name}" (${fileMB}MB) exceeds the maximum allowed limit of ${limitStr}.`);
  }

  const token = getAdminToken() || "Akshat321!";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("tripId", tripId);

  const res = await fetch("/api/journal/admin", {
    method: "POST",
    headers: {
      "x-admin-passcode": token,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Media upload failed.");
  }

  return {
    url: data.url,
    media_type: data.media_type || (isVideo ? "video" : "image"),
    path: data.path,
  };
}

/**
 * Uploads an image to the 'journal' Supabase storage bucket via the server API.
 * Returns the public image URL. Retained for backwards compatibility.
 */
export async function uploadJournalImage(
  file: File,
  tripId: string = "general"
): Promise<string> {
  const result = await uploadJournalMedia(file, tripId);
  return result.url;
}

/**
 * Deletes a single media item (image or video) from Supabase storage.
 */
export async function deleteJournalImage(url: string): Promise<void> {
  if (!isAdmin() || !url) return;

  await fetch("/api/journal/admin", {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({
      action: "deleteMedia",
      url,
    }),
  }).catch((err) => console.warn("Failed to delete storage media:", err));
}

/**
 * Extracts metadata (duration and optional poster snapshot) from a video File.
 */
export async function extractVideoMetadata(
  file: File
): Promise<{ duration: number; thumbnailDataUrl?: string }> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      return resolve({ duration: 0 });
    }
    try {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      const url = URL.createObjectURL(file);
      video.src = url;

      let resolved = false;
      const finish = (result: { duration: number; thumbnailDataUrl?: string }) => {
        if (resolved) return;
        resolved = true;
        try {
          URL.revokeObjectURL(url);
          video.remove();
        } catch {}
        resolve(result);
      };

      video.onloadedmetadata = () => {
        const duration = Math.round(video.duration || 0);
        // Seek to 0.5s or midpoint to get a good preview frame
        video.currentTime = Math.min(0.5, Math.max(0, (video.duration || 1) / 2));
      };

      video.onseeked = () => {
        const duration = Math.round(video.duration || 0);
        try {
          const canvas = document.createElement("canvas");
          const targetW = Math.min(video.videoWidth || 640, 640);
          canvas.width = targetW;
          const scale = targetW / (video.videoWidth || 640);
          canvas.height = (video.videoHeight || 360) * scale;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnailDataUrl = canvas.toDataURL("image/jpeg", 0.8);
            finish({ duration, thumbnailDataUrl });
            return;
          }
        } catch {
          // Canvas capture failure fallback
        }
        finish({ duration });
      };

      video.onerror = () => {
        finish({ duration: 0 });
      };

      // Fallback timer if metadata loading or seek takes too long
      setTimeout(() => {
        const d = Math.round(video.duration || 0);
        finish({ duration: isNaN(d) ? 0 : d });
      }, 3500);
    } catch {
      resolve({ duration: 0 });
    }
  });
}

/**
 * Formats a duration in seconds to M:SS (e.g. 15 -> "0:15", 75 -> "1:15")
 */
export function formatDuration(seconds?: number | null): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds <= 0) {
    return "";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

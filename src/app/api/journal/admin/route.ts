import { NextRequest, NextResponse } from "next/server";
import {
  getServerSupabaseAdmin,
  verifyAdminPasscode,
  isServerSupabaseConfigured,
} from "@/lib/supabase-server";

// Helper to enforce admin passcode from headers or cookies
function checkAuth(req: Request) {
  // 1. Check header
  const headerToken = req.headers.get("x-admin-passcode");
  if (verifyAdminPasscode(headerToken)) return true;

  // 2. Check cookies
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/portfolio_admin_token=([^;]+)/);
  if (match && verifyAdminPasscode(decodeURIComponent(match[1]))) {
    return true;
  }

  return false;
}

// -----------------------------------------------------------------------------
// GET: Admin reads (all trips, drafts, stats)
// -----------------------------------------------------------------------------
export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing admin passcode." },
      { status: 401 }
    );
  }

  if (!isServerSupabaseConfigured()) {
    return NextResponse.json(
      {
        error: "Server Supabase is not properly configured. SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is missing.",
        configured: false,
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const supabase = getServerSupabaseAdmin();

  try {
    if (action === "getAllTrips") {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, trips: data || [] });
    }

    if (action === "getAdminStats") {
      const [tripsRes, photosRes] = await Promise.all([
        supabase.from("trips").select("id, status"),
        supabase.from("trip_photos").select("id", { count: "exact", head: true }),
      ]);

      if (tripsRes.error) {
        return NextResponse.json(
          { error: tripsRes.error.message, code: tripsRes.error.code },
          { status: 400 }
        );
      }

      const allTrips = tripsRes.data || [];
      const total = allTrips.length;
      const published = allTrips.filter((t) => t.status === "published").length;
      const drafts = allTrips.filter((t) => t.status === "draft").length;
      const totalPhotos = photosRes.count || 0;

      return NextResponse.json({
        success: true,
        stats: { total, published, drafts, totalPhotos },
      });
    }

    if (action === "getTripById") {
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json({ error: "Missing trip id" }, { status: 400 });
      }

      const [tripRes, photosRes, locsRes, highsRes] = await Promise.all([
        supabase.from("trips").select("*").eq("id", id).single(),
        supabase
          .from("trip_photos")
          .select("*")
          .eq("trip_id", id)
          .order("display_order", { ascending: true }),
        supabase
          .from("trip_locations")
          .select("*")
          .eq("trip_id", id)
          .order("display_order", { ascending: true }),
        supabase
          .from("trip_highlights")
          .select("*")
          .eq("trip_id", id)
          .order("display_order", { ascending: true }),
      ]);

      if (tripRes.error) {
        return NextResponse.json(
          { error: tripRes.error.message, code: tripRes.error.code },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        trip: tripRes.data,
        photos: photosRes.data || [],
        locations: locsRes.data || [],
        highlights: highsRes.data || [],
      });
    }

    return NextResponse.json({ error: "Unknown GET action" }, { status: 400 });
  } catch (err: any) {
    console.error("[API GET /api/journal/admin error]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// POST: Admin mutations (create, update, delete, publish, image upload)
// -----------------------------------------------------------------------------
export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing admin passcode." },
      { status: 401 }
    );
  }

  if (!isServerSupabaseConfigured()) {
    return NextResponse.json(
      {
        error: "Server Supabase is not configured. SUPABASE_SERVICE_ROLE_KEY is required for admin operations.",
        configured: false,
      },
      { status: 503 }
    );
  }

  const supabase = getServerSupabaseAdmin();
  const contentType = req.headers.get("content-type") || "";

  // Handle multipart form data for image upload
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const tripId = (formData.get("tripId") as string) || "general";

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      // Validate MIME type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported image type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF, GIF` },
          { status: 400 }
        );
      }

      // Validate File Size (10MB max)
      const maxBytes = 10 * 1024 * 1024;
      if (file.size > maxBytes) {
        return NextResponse.json(
          { error: "File exceeds maximum size of 10MB." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${tripId}/${Date.now()}-${cleanFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("journal")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return NextResponse.json(
          { error: uploadError.message },
          { status: (uploadError as any).statusCode ? Number((uploadError as any).statusCode) : 400 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("journal")
        .getPublicUrl(uploadData.path);

      return NextResponse.json({
        success: true,
        url: publicUrlData.publicUrl,
        path: uploadData.path,
      });
    } catch (err: any) {
      console.error("[Storage Upload Error]:", err);
      return NextResponse.json(
        { error: err?.message || "Failed to upload image." },
        { status: 500 }
      );
    }
  }

  // Handle JSON action payloads
  try {
    const body = await req.json();
    const { action } = body;

    // Create Trip
    if (action === "createTrip") {
      const { trip } = body;
      const insertData = { ...trip };
      if (!insertData.id) delete insertData.id;
      const { data, error } = await supabase
        .from("trips")
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error("createTrip error:", error);
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.code === "42501" ? 403 : 400 }
        );
      }
      return NextResponse.json({ success: true, trip: data });
    }

    // Update Trip
    if (action === "updateTrip") {
      const { id, trip } = body;
      const updateData = { ...trip };
      delete updateData.id;
      const { data, error } = await supabase
        .from("trips")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("updateTrip error:", error);
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, trip: data });
    }

    // Delete Trip (with cascade storage cleanup)
    if (action === "deleteTrip") {
      const { id } = body;

      // 1. Fetch any photos stored in Supabase storage for this trip
      try {
        const { data: files } = await supabase.storage
          .from("journal")
          .list(id);

        if (files && files.length > 0) {
          const filePaths = files.map((f) => `${id}/${f.name}`);
          await supabase.storage.from("journal").remove(filePaths);
        }
      } catch (storageErr) {
        console.warn("Storage cleanup warning during trip delete:", storageErr);
      }

      // 2. Delete database record (cascades to trip_photos, trip_locations, trip_highlights)
      const { error } = await supabase.from("trips").delete().eq("id", id);
      if (error) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, deletedId: id });
    }

    // Publish Trip
    if (action === "publishTrip") {
      const { id } = body;
      const { data, error } = await supabase
        .from("trips")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, trip: data });
    }

    // Unpublish Trip
    if (action === "unpublishTrip") {
      const { id } = body;
      const { data, error } = await supabase
        .from("trips")
        .update({
          status: "draft",
          published_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, trip: data });
    }

    // Save Photos (delete existing for trip then re-insert)
    if (action === "savePhotos") {
      const { tripId, photos } = body;
      await supabase.from("trip_photos").delete().eq("trip_id", tripId);

      if (photos && photos.length > 0) {
        const formatted = photos.map((p: any, i: number) => ({
          trip_id: tripId,
          image_url: p.image_url,
          caption: p.caption || null,
          location_name: p.location_name || null,
          taken_at: p.taken_at || null,
          display_order: typeof p.display_order === "number" ? p.display_order : i,
        }));
        const { error } = await supabase.from("trip_photos").insert(formatted);
        if (error) {
          return NextResponse.json(
            { error: error.message, code: error.code },
            { status: 400 }
          );
        }
      }
      return NextResponse.json({ success: true });
    }

    // Save Locations
    if (action === "saveLocations") {
      const { tripId, locations } = body;
      await supabase.from("trip_locations").delete().eq("trip_id", tripId);

      if (locations && locations.length > 0) {
        const formatted = locations.map((l: any, i: number) => ({
          trip_id: tripId,
          name: l.name,
          latitude: typeof l.latitude === "number" ? l.latitude : null,
          longitude: typeof l.longitude === "number" ? l.longitude : null,
          description: l.description || null,
          image_url: l.image_url || null,
          rating: typeof l.rating === "number" ? l.rating : null,
          maps_url: l.maps_url || null,
          display_order: typeof l.display_order === "number" ? l.display_order : i,
        }));
        const { error } = await supabase.from("trip_locations").insert(formatted);
        if (error) {
          return NextResponse.json(
            { error: error.message, code: error.code },
            { status: 400 }
          );
        }
      }
      return NextResponse.json({ success: true });
    }

    // Save Highlights
    if (action === "saveHighlights") {
      const { tripId, highlights } = body;
      await supabase.from("trip_highlights").delete().eq("trip_id", tripId);

      if (highlights && highlights.length > 0) {
        const formatted = highlights.map((h: any, i: number) => ({
          trip_id: tripId,
          title: h.title,
          description: h.description || null,
          image_url: h.image_url || null,
          display_order: typeof h.display_order === "number" ? h.display_order : i,
        }));
        const { error } = await supabase.from("trip_highlights").insert(formatted);
        if (error) {
          return NextResponse.json(
            { error: error.message, code: error.code },
            { status: 400 }
          );
        }
      }
      return NextResponse.json({ success: true });
    }

    // Delete single image from storage
    if (action === "deleteImage") {
      const { url } = body;
      if (url && typeof url === "string" && url.includes("/storage/v1/object/public/journal/")) {
        const path = url.split("/storage/v1/object/public/journal/")[1];
        if (path) {
          await supabase.storage.from("journal").remove([decodeURIComponent(path)]);
        }
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("[API POST /api/journal/admin error]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}


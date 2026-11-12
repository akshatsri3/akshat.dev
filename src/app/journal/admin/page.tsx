"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  LogOut,
  ArrowLeft,
  Save,
  X,
  Upload,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Camera,
  Layers,
  FileText,
  Compass,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import {
  isAdmin,
  adminLogout,
  getAllTrips,
  getAdminStats,
  createTrip,
  updateTrip,
  deleteTrip,
  publishTrip,
  unpublishTrip,
  getTripPhotos,
  getTripLocations,
  getTripHighlights,
  saveTripPhotos,
  saveTripLocations,
  saveTripHighlights,
  uploadJournalImage,
  generateSlug,
  JournalTrip,
  JournalPhoto,
  JournalLocation,
  JournalHighlight,
} from "@/lib/journal-store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

interface AdminStats {
  total: number;
  published: number;
  drafts: number;
  totalPhotos: number;
}

export default function JournalAdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "trips">("overview");

  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    published: 0,
    drafts: 0,
    totalPhotos: 0,
  });
  const [trips, setTrips] = useState<JournalTrip[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [formTab, setFormTab] = useState<
    "basic" | "travel" | "media" | "story" | "locations" | "highlights" | "publish"
  >("basic");

  // Form Fields
  const [formData, setFormData] = useState<Partial<JournalTrip>>({
    title: "",
    slug: "",
    description: "",
    pov: "",
    cover_image: "",
    start_date: "",
    end_date: "",
    city: "",
    state: "",
    country: "",
    travel_type: "",
    transport: "",
    companions: "",
    distance: "",
    expenses: "",
    closing_note: "",
    status: "draft",
    seo_title: "",
    seo_description: "",
  });

  const [photos, setPhotos] = useState<Partial<JournalPhoto>[]>([]);
  const [locations, setLocations] = useState<Partial<JournalLocation>[]>([]);
  const [highlights, setHighlights] = useState<Partial<JournalHighlight>[]>([]);

  // Image Uploading States
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      const tripId = editingTripId || "new-" + Date.now();
      const url = await uploadJournalImage(file, tripId);
      setFormData((prev) => ({ ...prev, cover_image: url }));
      showNotification("success", "Cover image uploaded successfully.");
    } catch (err: any) {
      showNotification("error", err?.message || "Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingGallery(true);
      const tripId = editingTripId || "new-" + Date.now();
      const uploadPromises = Array.from(files).map((file) =>
        uploadJournalImage(file, tripId)
      );
      const urls = await Promise.all(uploadPromises);
      const newPhotos: Partial<JournalPhoto>[] = urls.map((url, i) => ({
        image_url: url,
        caption: "",
        location_name: "",
        taken_at: "",
        display_order: photos.length + i,
      }));
      setPhotos((prev) => [...prev, ...newPhotos]);
      showNotification(
        "success",
        `Uploaded ${urls.length} photo${urls.length > 1 ? "s" : ""} successfully.`
      );
    } catch (err: any) {
      showNotification("error", err?.message || "Failed to upload gallery photos.");
    } finally {
      setUploadingGallery(false);
      if (e.target) e.target.value = "";
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, tripsData] = await Promise.all([
        getAdminStats(),
        getAllTrips(),
      ]);
      setStats(statsData);
      setTrips(tripsData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      showNotification("error", "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for new trip
  const handleOpenNewTrip = () => {
    setEditingTripId(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      pov: "",
      cover_image: "",
      start_date: "",
      end_date: "",
      city: "",
      state: "",
      country: "",
      travel_type: "",
      transport: "",
      companions: "",
      distance: "",
      expenses: "",
      closing_note: "",
      status: "draft",
      seo_title: "",
      seo_description: "",
    });
    setPhotos([]);
    setLocations([]);
    setHighlights([]);
    setFormTab("basic");
    setIsModalOpen(true);
  };

  useEffect(() => {
    const authStatus = isAdmin();
    setAuthenticated(authStatus);
    if (authStatus) {
      loadDashboardData();
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("action") === "new") {
          handleOpenNewTrip();
        }
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Title change with auto-slug
  const handleTitleChange = (newTitle: string) => {
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: prev.slug && editingTripId ? prev.slug : generateSlug(newTitle),
    }));
  };

  // Open modal to edit existing trip
  const handleOpenEditTrip = async (trip: JournalTrip) => {
    setEditingTripId(trip.id);
    setFormData(trip);
    setFormTab("basic");
    setIsModalOpen(true);

    try {
      const [photoData, locData, highData] = await Promise.all([
        getTripPhotos(trip.id),
        getTripLocations(trip.id),
        getTripHighlights(trip.id),
      ]);
      setPhotos(photoData);
      setLocations(locData);
      setHighlights(highData);
    } catch (err) {
      console.error("Failed to load related trip items:", err);
    }
  };

  // Save Trip (Create or Update)
  const handleSaveTrip = async (publishImmediate = false) => {
    if (!formData.title?.trim() || !formData.slug?.trim()) {
      showNotification("error", "Trip Title and Slug are required.");
      return;
    }

    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        status: publishImmediate ? ("published" as const) : formData.status || "draft",
      };

      let savedTrip: JournalTrip;
      if (editingTripId) {
        savedTrip = await updateTrip(editingTripId, dataToSave);
      } else {
        savedTrip = await createTrip(dataToSave);
      }

      // Save related items
      await Promise.all([
        saveTripPhotos(savedTrip.id, photos),
        saveTripLocations(savedTrip.id, locations),
        saveTripHighlights(savedTrip.id, highlights),
      ]);

      if (publishImmediate && savedTrip.status !== "published") {
        await publishTrip(savedTrip.id);
      }

      showNotification(
        "success",
        editingTripId ? "Trip updated successfully." : "Trip created successfully."
      );
      setIsModalOpen(false);
      await loadDashboardData();
    } catch (err: any) {
      console.error("Error saving trip:", err);
      showNotification("error", err?.message || "Failed to save trip. Check database connection.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Trip
  const handleDeleteTrip = async (id: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${title}" and all its photos?`
      )
    ) {
      return;
    }

    try {
      await deleteTrip(id);
      showNotification("success", "Trip deleted successfully.");
      await loadDashboardData();
    } catch (err) {
      console.error("Error deleting trip:", err);
      showNotification("error", "Failed to delete trip.");
    }
  };

  // Toggle publish / unpublish
  const handleTogglePublish = async (trip: JournalTrip) => {
    try {
      if (trip.status === "published") {
        await unpublishTrip(trip.id);
        showNotification("success", `Unpublished "${trip.title}".`);
      } else {
        await publishTrip(trip.id);
        showNotification("success", `Published "${trip.title}".`);
      }
      await loadDashboardData();
    } catch (err) {
      console.error("Error updating publish status:", err);
      showNotification("error", "Failed to update publish status.");
    }
  };

  // Photo handlers
  const handleAddPhoto = () => {
    setPhotos((prev) => [
      ...prev,
      {
        image_url: "",
        caption: "",
        location_name: "",
        taken_at: "",
        display_order: prev.length,
      },
    ]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMovePhoto = (index: number, direction: "up" | "down") => {
    setPhotos((prev) => {
      const copy = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((p, i) => ({ ...p, display_order: i }));
    });
  };

  // Location handlers
  const handleAddLocation = () => {
    setLocations((prev) => [
      ...prev,
      {
        name: "",
        latitude: null,
        longitude: null,
        description: "",
        image_url: "",
        rating: 5,
        maps_url: "",
        display_order: prev.length,
      },
    ]);
  };

  const handleRemoveLocation = (index: number) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  };

  // Highlight handlers
  const handleAddHighlight = () => {
    setHighlights((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        image_url: "",
        display_order: prev.length,
      },
    ]);
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  // Render unauthorized gate
  if (authenticated === false) {
    return (
      <div className="min-h-screen flex flex-col bg-[oklch(0.08 0.02 260)] text-[#F5F1EB]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 rounded-full bg-[#141414] border border-[#262626] mb-6">
            <LogOut className="size-8 text-[oklch(0.65 0.25 260)]" />
          </div>
          <h1
            className="text-4xl font-normal mb-3 text-[#F5F1EB]"
            
          >
            Admin Access Required
          </h1>
          <p className="text-[#A3A3A3] max-w-md mb-8 text-sm leading-relaxed">
            This dashboard is restricted. Triple-click the copyright notice in the
            footer below to enter your admin passcode.
          </p>
          <div className="flex gap-4">
            <Link
              href="/journal"
              className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest border border-[#262626] text-[#F5F1EB] hover:border-[oklch(0.65 0.25 260)] transition-colors"
            >
              Back to Journal
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.08 0.02 260)] text-[#F5F1EB]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-28 pb-20">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-[#262626]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[oklch(0.65 0.25 260)]/10 text-[oklch(0.65 0.25 260)] border border-[oklch(0.65 0.25 260)]/20">
                Admin Panel
              </span>
              <span className="text-xs text-[#A3A3A3]">· Connected to Supabase</span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-normal tracking-tight text-[#F5F1EB]"
              
            >
              Journal Management
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/blog"
              className="px-4 py-2 rounded-full text-xs font-medium border border-[#262626] text-[#A3A3A3] hover:text-[#F5F1EB] hover:border-[oklch(0.65 0.25 260)] transition-colors"
            >
              Blog Management
            </Link>
            <Link
              href="/journal"
              target="_blank"
              className="px-4 py-2 rounded-full text-xs font-medium border border-[#262626] text-[#A3A3A3] hover:text-[#F5F1EB] hover:border-[oklch(0.65 0.25 260)] transition-colors inline-flex items-center gap-1.5"
            >
              <span>View Public Journal</span>
              <ExternalLink className="size-3" />
            </Link>
            <button
              onClick={() => {
                adminLogout();
                window.location.reload();
              }}
              className="px-4 py-2 rounded-full text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors inline-flex items-center gap-1.5"
            >
              <LogOut className="size-3" />
              <span>Log out</span>
            </button>
            <button
              onClick={handleOpenNewTrip}
              className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-[oklch(0.65 0.25 260)] text-[oklch(0.08 0.02 260)] hover:bg-[oklch(0.72 0.22 260)] transition-colors shadow-lg shadow-[oklch(0.65 0.25 260)]/20 inline-flex items-center gap-1.5"
            >
              <Plus className="size-4" />
              <span>Create New Journey</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-[#141414] text-[oklch(0.65 0.25 260)] border border-[oklch(0.65 0.25 260)]/40 shadow-sm"
                : "text-[#A3A3A3] hover:text-[#F5F1EB] border border-[#262626]"
            }`}
          >
            <BarChart3 className="size-3.5" />
            <span>Overview & Stats</span>
          </button>
          <button
            onClick={() => setActiveTab("trips")}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2 ${
              activeTab === "trips"
                ? "bg-[#141414] text-[oklch(0.65 0.25 260)] border border-[oklch(0.65 0.25 260)]/40 shadow-sm"
                : "text-[#A3A3A3] hover:text-[#F5F1EB] border border-[#262626]"
            }`}
          >
            <MapPin className="size-3.5" />
            <span>All Journeys ({trips.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-10">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { label: "Total Journeys", value: stats.total, color: "#F5F1EB" },
                { label: "Published Journeys", value: stats.published, color: "#22c55e" },
                { label: "Draft Journeys", value: stats.drafts, color: "#eab308" },
                { label: "Total Photographs", value: stats.totalPhotos, color: "oklch(0.65 0.25 260)" },
              ].map((card, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#262626] bg-[#141414] p-6 flex flex-col justify-between"
                >
                  <span className="text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-3">
                    {card.label}
                  </span>
                  <span
                    className="text-4xl md:text-5xl font-normal"
                    style={{
                      
                      color: card.color,
                    }}
                  >
                    {card.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Recent Trips Table */}
            <div className="rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden">
              <div className="p-6 border-b border-[#262626] flex items-center justify-between">
                <div>
                  <h3
                    className="text-xl font-normal text-[#F5F1EB]"
                    
                  >
                    Recent Journeys
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-0.5">
                    Latest updated entries in your journal
                  </p>
                </div>
                <button
                  onClick={handleOpenNewTrip}
                  className="px-4 py-1.5 rounded-full text-xs font-medium border border-[#262626] hover:border-[oklch(0.65 0.25 260)] text-[oklch(0.65 0.25 260)] transition-colors"
                >
                  + Add Trip
                </button>
              </div>

              {trips.length === 0 ? (
                <div className="py-16 text-center text-[#A3A3A3] text-sm">
                  No journeys recorded yet. Create your first journey to begin!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#262626] text-xs uppercase tracking-wider text-[#A3A3A3] bg-[#101010]/60">
                        <th className="py-3.5 px-6">Title</th>
                        <th className="py-3.5 px-6">Location</th>
                        <th className="py-3.5 px-6">Status</th>
                        <th className="py-3.5 px-6">Last Updated</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]/50">
                      {trips.slice(0, 6).map((t) => (
                        <tr
                          key={t.id}
                          className="hover:bg-[#1c1c1c]/50 transition-colors"
                        >
                          <td className="py-4 px-6 font-medium text-[#F5F1EB]">
                            {t.title}
                          </td>
                          <td className="py-4 px-6 text-[#A3A3A3] text-xs">
                            {[t.city, t.country].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                t.status === "published"
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs text-[#A3A3A3]">
                            {new Date(t.updated_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditTrip(t)}
                              className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-[oklch(0.65 0.25 260)] hover:bg-[#262626]/50 transition-colors"
                              title="Edit trip"
                            >
                              <Edit3 className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTrip(t.id, t.title)}
                              className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete trip"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Trips List */}
        {activeTab === "trips" && (
          <div className="rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden">
            <div className="p-6 border-b border-[#262626] flex items-center justify-between">
              <div>
                <h3
                  className="text-xl font-normal text-[#F5F1EB]"
                  
                >
                  All Journeys ({trips.length})
                </h3>
                <p className="text-xs text-[#A3A3A3] mt-0.5">
                  Manage, edit, publish or delete your journeys
                </p>
              </div>
              <button
                onClick={handleOpenNewTrip}
                className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[oklch(0.65 0.25 260)] text-[oklch(0.08 0.02 260)] hover:bg-[oklch(0.72 0.22 260)] transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>New Journey</span>
              </button>
            </div>

            {trips.length === 0 ? (
              <div className="py-24 text-center">
                <Compass className="size-12 text-[oklch(0.65 0.25 260)]/40 mx-auto mb-4" />
                <p className="text-base text-[#F5F1EB] font-normal mb-1">
                  No journeys created yet
                </p>
                <p className="text-xs text-[#A3A3A3] mb-6">
                  Start documenting your trips, stories and photos
                </p>
                <button
                  onClick={handleOpenNewTrip}
                  className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-[oklch(0.65 0.25 260)] text-[oklch(0.08 0.02 260)]"
                >
                  Create First Journey
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#262626] text-xs uppercase tracking-wider text-[#A3A3A3] bg-[#101010]/60">
                      <th className="py-3.5 px-6">Title & Slug</th>
                      <th className="py-3.5 px-6">Location</th>
                      <th className="py-3.5 px-6">Dates</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]/50">
                    {trips.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-[#1c1c1c]/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-[#F5F1EB]">{t.title}</div>
                          <div className="text-[11px] text-[#A3A3A3]/70 font-mono mt-0.5">
                            /{t.slug}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[#A3A3A3] text-xs">
                          {[t.city, t.state, t.country].filter(Boolean).join(", ") ||
                            "—"}
                        </td>
                        <td className="py-4 px-6 text-[#A3A3A3] text-xs">
                          {t.start_date || "—"}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleTogglePublish(t)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                              t.status === "published"
                                ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                            }`}
                            title="Click to toggle publish"
                          >
                            {t.status === "published" ? (
                              <Eye className="size-3" />
                            ) : (
                              <EyeOff className="size-3" />
                            )}
                            <span>{t.status}</span>
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          {t.status === "published" && (
                            <Link
                              href={`/journal/${t.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-[oklch(0.65 0.25 260)] hover:bg-[#262626]/50 transition-colors inline-block"
                              title="View published trip"
                            >
                              <ExternalLink className="size-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => handleOpenEditTrip(t)}
                            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-[oklch(0.65 0.25 260)] hover:bg-[#262626]/50 transition-colors"
                            title="Edit trip"
                          >
                            <Edit3 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrip(t.id, t.title)}
                            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete trip"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Trip Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#101010] border border-[#262626] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#262626] bg-[#141414]">
              <div>
                <h2
                  className="text-2xl font-normal text-[#F5F1EB]"
                  
                >
                  {editingTripId ? "Edit Journey" : "Create New Journey"}
                </h2>
                <p className="text-xs text-[#A3A3A3]">
                  Fill in your memories, photography, coordinates and details
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-[#A3A3A3] hover:text-[#F5F1EB] hover:bg-[#262626] transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex items-center gap-1 px-8 py-3 border-b border-[#262626] bg-[#0a0a0a] overflow-x-auto text-xs">
              {[
                { id: "basic", label: "A. Basic Info", icon: FileText },
                { id: "travel", label: "B. Travel Details", icon: Compass },
                { id: "media", label: "C. Photography", icon: Camera },
                { id: "story", label: "D. POV Story", icon: Edit3 },
                { id: "locations", label: "E. Places Visited", icon: MapPin },
                { id: "highlights", label: "F. Highlights", icon: Sparkles },
                { id: "publish", label: "G. Publishing", icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = formTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFormTab(tab.id as typeof formTab)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors inline-flex items-center gap-1.5 ${
                      active
                        ? "bg-[oklch(0.18 0.06 260)] text-[oklch(0.65 0.25 260)] border border-[oklch(0.65 0.25 260)]/40"
                        : "text-[#A3A3A3] hover:text-[#F5F1EB]"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body / Tab Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Tab A: Basic Info */}
              {formTab === "basic" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                      Journey Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ""}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Kanyakumari — Chasing the Last Sunset"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                      Slug * (URL path)
                    </label>
                    <input
                      type="text"
                      value={formData.slug || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      placeholder="e.g. kanyakumari-sunset"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] font-mono text-xs focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                      Short Description / Subtitle
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="A short introduction or poetic summary of this trip..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)] text-sm leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                        City / Town
                      </label>
                      <input
                        type="text"
                        value={formData.city || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, city: e.target.value }))
                        }
                        placeholder="e.g. Kanyakumari"
                        className="w-full px-4 py-2 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] text-sm focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={formData.state || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, state: e.target.value }))
                        }
                        placeholder="e.g. Tamil Nadu"
                        className="w-full px-4 py-2 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] text-sm focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, country: e.target.value }))
                        }
                        placeholder="e.g. India"
                        className="w-full px-4 py-2 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] text-sm focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={formData.start_date || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                        }
                        placeholder="e.g. Nov 2026 or 2026-11-09"
                        className="w-full px-4 py-2 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] text-sm focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                        End Date
                      </label>
                      <input
                        type="text"
                        value={formData.end_date || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                        }
                        placeholder="e.g. Nov 2026 or 2026-11-12"
                        className="w-full px-4 py-2 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] text-sm focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab B: Travel Info */}
              {formTab === "travel" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                        Travel Type
                      </label>
                      <input
                        type="text"
                        value={formData.travel_type || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, travel_type: e.target.value }))
                        }
                        placeholder="e.g. Solo Backpacking / Road Trip / Weekend Getaway"
                        className="w-full px-4 py-2 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] text-sm focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                        Transportation
                      </label>
                      <input
                        type="text"
                        value={formData.transport || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, transport: e.target.value }))
                        }
                        placeholder="e.g. Royal Enfield / Train / Flight"
                        className="w-full px-4 py-2 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] text-sm focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                        Companions
                      </label>
                      <input
                        type="text"
                        value={formData.companions || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, companions: e.target.value }))
                        }
                        placeholder="e.g. Solo / With Friends"
                        className="w-full px-4 py-2 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] text-sm focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                        Distance Traveled
                      </label>
                      <input
                        type="text"
                        value={formData.distance || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, distance: e.target.value }))
                        }
                        placeholder="e.g. ~1,200 km"
                        className="w-full px-4 py-2 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] text-sm focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                        Approx. Expenses
                      </label>
                      <input
                        type="text"
                        value={formData.expenses || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, expenses: e.target.value }))
                        }
                        placeholder="e.g. ₹15,000"
                        className="w-full px-4 py-2 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] text-sm focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab C: Cover Image & Gallery */}
              {formTab === "media" && (
                <div className="space-y-8">
                  {/* Cover Image Section */}
                  <div className="p-5 rounded-2xl border border-[#262626] bg-[#141414] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium">
                          Cover Photograph *
                        </label>
                        <p className="text-xs text-[#A3A3A3]/70 mt-0.5">
                          High-resolution cinematic landscape photo for the hero banner
                        </p>
                      </div>
                      <div>
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          disabled={uploadingCover}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-[oklch(0.65 0.25 260)] text-[oklch(0.08 0.02 260)] hover:bg-[oklch(0.72 0.22 260)] transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {uploadingCover ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Upload className="size-3.5" />
                          )}
                          <span>{uploadingCover ? "Uploading..." : "Upload Cover File"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Cover Preview */}
                    {formData.cover_image && (
                      <div className="relative w-full h-56 rounded-xl overflow-hidden border border-[#262626] bg-[#0a0a0a]">
                        <Image
                          src={formData.cover_image}
                          alt="Cover preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, cover_image: "" }))}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-red-400 hover:text-red-300 transition-colors"
                          title="Remove cover image"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    )}

                    <div>
                      <span className="text-[11px] text-[#A3A3A3] block mb-1">
                        Or enter direct image URL:
                      </span>
                      <input
                        type="text"
                        value={formData.cover_image || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, cover_image: e.target.value }))
                        }
                        placeholder="https://..."
                        className="w-full px-3.5 py-2 rounded-xl border border-[#262626] bg-[#0a0a0a] text-[#F5F1EB] text-xs font-mono focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                      />
                    </div>
                  </div>

                  {/* Gallery Section */}
                  <div className="p-5 rounded-2xl border border-[#262626] bg-[#141414] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-[#F5F1EB] flex items-center gap-2">
                          <Camera className="size-4 text-[oklch(0.65 0.25 260)]" />
                          <span>Gallery Photographs ({photos.length})</span>
                        </h4>
                        <p className="text-xs text-[#A3A3A3] mt-0.5">
                          Upload multiple photos at once. They will appear in the editorial masonry grid and lightbox.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          ref={galleryInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          disabled={uploadingGallery}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-[oklch(0.65 0.25 260)] text-[oklch(0.08 0.02 260)] hover:bg-[oklch(0.72 0.22 260)] transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {uploadingGallery ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Upload className="size-3.5" />
                          )}
                          <span>{uploadingGallery ? "Uploading..." : "Upload Photos"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAddPhoto}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#262626] text-[#A3A3A3] hover:text-[#F5F1EB] hover:border-[oklch(0.65 0.25 260)] transition-colors inline-flex items-center gap-1"
                        >
                          <Plus className="size-3.5" />
                          <span>Add URL</span>
                        </button>
                      </div>
                    </div>

                    {photos.length === 0 ? (
                      <div className="py-10 text-center border border-dashed border-[#262626] rounded-xl bg-[#0a0a0a]/50">
                        <Camera className="size-8 text-[#A3A3A3]/40 mx-auto mb-2" />
                        <p className="text-xs text-[#A3A3A3]">
                          No gallery photographs added yet. Click &quot;Upload Photos&quot; to choose files.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {photos.map((photo, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-xl border border-[#262626] bg-[#0a0a0a] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
                          >
                            {/* Thumbnail */}
                            {photo.image_url ? (
                              <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-[#262626] bg-[#141414]">
                                <Image
                                  src={photo.image_url}
                                  alt={photo.caption || "Thumbnail"}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 shrink-0 rounded-lg border border-[#262626] bg-[#141414] flex items-center justify-center text-[#A3A3A3]/40">
                                <ImageIcon className="size-6" />
                              </div>
                            )}

                            {/* Inputs */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                              <input
                                type="text"
                                value={photo.image_url || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPhotos((prev) =>
                                    prev.map((p, idx) =>
                                      idx === i ? { ...p, image_url: val } : p
                                    )
                                  );
                                }}
                                placeholder="Image URL *"
                                className="px-3 py-1.5 rounded-lg border border-[#262626] bg-[#141414] text-xs text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                              />
                              <input
                                type="text"
                                value={photo.caption || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPhotos((prev) =>
                                    prev.map((p, idx) =>
                                      idx === i ? { ...p, caption: val } : p
                                    )
                                  );
                                }}
                                placeholder="Caption (e.g. Sunset view over the ocean)"
                                className="px-3 py-1.5 rounded-lg border border-[#262626] bg-[#141414] text-xs text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                              />
                              <input
                                type="text"
                                value={photo.location_name || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPhotos((prev) =>
                                    prev.map((p, idx) =>
                                      idx === i ? { ...p, location_name: val } : p
                                    )
                                  );
                                }}
                                placeholder="Spot / Location name"
                                className="px-3 py-1.5 rounded-lg border border-[#262626] bg-[#141414] text-xs text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                              />
                            </div>

                            {/* Order & Remove Controls */}
                            <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMovePhoto(i, "up")}
                                disabled={i === 0}
                                className="p-1 rounded text-[#A3A3A3] hover:text-[#F5F1EB] disabled:opacity-30"
                                title="Move up"
                              >
                                <ChevronUp className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMovePhoto(i, "down")}
                                disabled={i === photos.length - 1}
                                className="p-1 rounded text-[#A3A3A3] hover:text-[#F5F1EB] disabled:opacity-30"
                                title="Move down"
                              >
                                <ChevronDown className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(i)}
                                className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Remove photo"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab D: Personal Story (POV) */}
              {formTab === "story" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                      My POV — Personal Story (Markdown / Paragraphs)
                    </label>
                    <p className="text-xs text-[#A3A3A3]/70 mb-2">
                      Separate paragraphs with double newlines. Write your reflections,
                      atmosphere, and unscripted memories.
                    </p>
                    <textarea
                      rows={12}
                      value={formData.pov || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, pov: e.target.value }))
                      }
                      placeholder="Write your story in your own words..."
                      className="w-full px-4 py-3 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)] text-sm leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                      Closing Note / Thought
                    </label>
                    <textarea
                      rows={3}
                      value={formData.closing_note || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, closing_note: e.target.value }))
                      }
                      placeholder="A parting reflection to conclude the journey..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)] text-sm italic"
                    />
                  </div>
                </div>
              )}

              {/* Tab E: Locations */}
              {formTab === "locations" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#F5F1EB]">
                        Mapped Places ({locations.length})
                      </h4>
                      <p className="text-xs text-[#A3A3A3]">
                        Coordinates are plotted on the interactive trip map
                      </p>
                    </div>
                    <button
                      onClick={handleAddLocation}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[oklch(0.65 0.25 260)]/40 text-[oklch(0.65 0.25 260)] hover:bg-[oklch(0.65 0.25 260)]/10 transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="size-3.5" />
                      <span>Add Place</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {locations.map((loc, i) => (
                      <div
                        key={i}
                        className="p-5 rounded-2xl border border-[#262626] bg-[#141414] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.65 0.25 260)]">
                            Place #{i + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveLocation(i)}
                            className="p-1 rounded text-red-400 hover:bg-red-500/10"
                            title="Remove place"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={loc.name || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLocations((prev) =>
                                prev.map((l, idx) =>
                                  idx === i ? { ...l, name: val } : l
                                )
                              );
                            }}
                            placeholder="Place Name *"
                            className="px-3 py-2 rounded-lg border border-[#262626] bg-[#0a0a0a] text-xs text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                          />
                          <input
                            type="number"
                            step="any"
                            value={loc.latitude ?? ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || null;
                              setLocations((prev) =>
                                prev.map((l, idx) =>
                                  idx === i ? { ...l, latitude: val } : l
                                )
                              );
                            }}
                            placeholder="Latitude (e.g. 8.0883)"
                            className="px-3 py-2 rounded-lg border border-[#262626] bg-[#0a0a0a] text-xs text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                          />
                          <input
                            type="number"
                            step="any"
                            value={loc.longitude ?? ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || null;
                              setLocations((prev) =>
                                prev.map((l, idx) =>
                                  idx === i ? { ...l, longitude: val } : l
                                )
                              );
                            }}
                            placeholder="Longitude (e.g. 77.5385)"
                            className="px-3 py-2 rounded-lg border border-[#262626] bg-[#0a0a0a] text-xs text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={loc.maps_url || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLocations((prev) =>
                                prev.map((l, idx) =>
                                  idx === i ? { ...l, maps_url: val } : l
                                )
                              );
                            }}
                            placeholder="Google Maps URL"
                            className="px-3 py-2 rounded-lg border border-[#262626] bg-[#0a0a0a] text-xs text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                          />
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={loc.rating ?? 5}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || null;
                              setLocations((prev) =>
                                prev.map((l, idx) =>
                                  idx === i ? { ...l, rating: val } : l
                                )
                              );
                            }}
                            placeholder="Rating (1 to 5)"
                            className="px-3 py-2 rounded-lg border border-[#262626] bg-[#0a0a0a] text-xs text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                          />
                        </div>

                        <textarea
                          rows={2}
                          value={loc.description || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLocations((prev) =>
                              prev.map((l, idx) =>
                                idx === i ? { ...l, description: val } : l
                              )
                            );
                          }}
                          placeholder="Short notes about this spot..."
                          className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#0a0a0a] text-xs text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab F: Highlights */}
              {formTab === "highlights" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#F5F1EB]">
                        Favourite Moments ({highlights.length})
                      </h4>
                      <p className="text-xs text-[#A3A3A3]">
                        Special memories, unexpected surprises, or food recommendations
                      </p>
                    </div>
                    <button
                      onClick={handleAddHighlight}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[oklch(0.65 0.25 260)]/40 text-[oklch(0.65 0.25 260)] hover:bg-[oklch(0.65 0.25 260)]/10 transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="size-3.5" />
                      <span>Add Moment</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {highlights.map((h, i) => (
                      <div
                        key={i}
                        className="p-5 rounded-2xl border border-[#262626] bg-[#141414] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.65 0.25 260)]">
                            Highlight #{i + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveHighlight(i)}
                            className="p-1 rounded text-red-400 hover:bg-red-500/10"
                            title="Remove highlight"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={h.title || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHighlights((prev) =>
                              prev.map((item, idx) =>
                                idx === i ? { ...item, title: val } : item
                              )
                            );
                          }}
                          placeholder="Highlight Title (e.g. The Coastal Sunset Ride)"
                          className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#0a0a0a] text-xs text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                        />

                        <input
                          type="text"
                          value={h.image_url || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHighlights((prev) =>
                              prev.map((item, idx) =>
                                idx === i ? { ...item, image_url: val } : item
                              )
                            );
                          }}
                          placeholder="Optional photograph URL"
                          className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#0a0a0a] text-xs text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                        />

                        <textarea
                          rows={2}
                          value={h.description || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHighlights((prev) =>
                              prev.map((item, idx) =>
                                idx === i ? { ...item, description: val } : item
                              )
                            );
                          }}
                          placeholder="Description of the experience..."
                          className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#0a0a0a] text-xs text-[#F5F1EB] focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab G: Publishing */}
              {formTab === "publish" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-3">
                      Publication Status
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer p-4 rounded-xl border border-[#262626] bg-[#141414] hover:border-[oklch(0.65 0.25 260)] flex-1">
                        <input
                          type="radio"
                          name="status"
                          value="draft"
                          checked={formData.status === "draft"}
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, status: "draft" }))
                          }
                          className="text-[oklch(0.65 0.25 260)]"
                        />
                        <div>
                          <div className="text-sm font-medium text-[#F5F1EB]">
                            Draft
                          </div>
                          <div className="text-xs text-[#A3A3A3]">
                            Only visible to you in this admin dashboard
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-4 rounded-xl border border-[#262626] bg-[#141414] hover:border-[oklch(0.65 0.25 260)] flex-1">
                        <input
                          type="radio"
                          name="status"
                          value="published"
                          checked={formData.status === "published"}
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, status: "published" }))
                          }
                          className="text-[oklch(0.65 0.25 260)]"
                        />
                        <div>
                          <div className="text-sm font-medium text-[#F5F1EB]">
                            Published
                          </div>
                          <div className="text-xs text-[#A3A3A3]">
                            Live on the journal landing page and world map
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                      SEO Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.seo_title || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, seo_title: e.target.value }))
                      }
                      placeholder="Custom page title for search engines"
                      className="w-full px-4 py-2 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] text-sm focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A3A3A3] font-medium mb-1.5">
                      SEO Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.seo_description || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          seo_description: e.target.value,
                        }))
                      }
                      placeholder="Meta description for search engines"
                      className="w-full px-4 py-2 rounded-xl border border-[#262626] bg-[#141414] text-[#F5F1EB] text-sm focus:outline-none focus:border-[oklch(0.65 0.25 260)]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-8 py-4 border-t border-[#262626] bg-[#141414]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] hover:text-[#F5F1EB] transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSaveTrip(false)}
                  disabled={saving}
                  className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border border-[#262626] text-[#F5F1EB] hover:border-[oklch(0.65 0.25 260)] transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>

                <button
                  onClick={() => handleSaveTrip(true)}
                  disabled={saving}
                  className="px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-[oklch(0.65 0.25 260)] text-[oklch(0.08 0.02 260)] hover:bg-[oklch(0.72 0.22 260)] transition-colors disabled:opacity-50 shadow-md shadow-[oklch(0.65 0.25 260)]/20 flex items-center gap-1.5"
                >
                  <Save className="size-3.5" />
                  <span>{saving ? "Saving..." : "Publish Journey"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {notification && (
        <div
          className={`fixed bottom-8 right-8 z-[200] px-5 py-3 rounded-2xl border text-xs font-medium shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all ${
            notification.type === "success"
              ? "bg-[#141414]/90 border-green-500/40 text-green-400"
              : "bg-[#141414]/90 border-red-500/40 text-red-400"
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}

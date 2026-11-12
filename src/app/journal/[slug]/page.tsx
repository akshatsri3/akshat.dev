"use client";

import { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Users,
  Compass,
  Car,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import PhotoGallery from "@/components/journal/PhotoGallery";
import LocationCard from "@/components/journal/LocationCard";
import { Button } from "@/components/ui/button";
import {
  getTripBySlug,
  getTripPhotos,
  getTripLocations,
  getTripHighlights,
  getPublishedTrips,
  JournalTrip,
  JournalPhoto,
  JournalLocation,
  JournalHighlight,
} from "@/lib/journal-store";

// Dynamic import for trip map to prevent SSR issues
const TripDetailMap = dynamic(
  () => import("@/components/journal/TripDetailMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[350px] rounded-3xl bg-card/40 animate-pulse border border-border/50" />
    ),
  }
);

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [trip, setTrip] = useState<JournalTrip | null>(null);
  const [photos, setPhotos] = useState<JournalPhoto[]>([]);
  const [locations, setLocations] = useState<JournalLocation[]>([]);
  const [highlights, setHighlights] = useState<JournalHighlight[]>([]);
  const [prevTrip, setPrevTrip] = useState<JournalTrip | null>(null);
  const [nextTrip, setNextTrip] = useState<JournalTrip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const tripData = await getTripBySlug(slug);
        if (!tripData) {
          setTrip(null);
          return;
        }

        setTrip(tripData);

        const [photoData, locationData, highlightData, allPublished] =
          await Promise.all([
            getTripPhotos(tripData.id),
            getTripLocations(tripData.id),
            getTripHighlights(tripData.id),
            getPublishedTrips(),
          ]);

        setPhotos(photoData);
        setLocations(locationData);
        setHighlights(highlightData);

        // Find previous and next trips
        const currentIndex = allPublished.findIndex((t) => t.id === tripData.id);
        if (currentIndex !== -1) {
          setPrevTrip(currentIndex > 0 ? allPublished[currentIndex - 1] : null);
          setNextTrip(
            currentIndex < allPublished.length - 1
              ? allPublished[currentIndex + 1]
              : null
          );
        }
      } catch (err) {
        console.error("Error loading trip:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Loading Journey...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-32 px-6 text-center">
          <div className="p-4 rounded-full bg-primary/10 text-primary mb-6">
            <Compass className="size-12" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Journey Not Found
          </h1>
          <p className="text-muted-foreground max-w-md mb-8 text-sm">
            This journey might still be in drafting or does not exist.
          </p>
          <Link href="/journal">
            <Button className="rounded-full gap-2 shadow-lg shadow-primary/20">
              <ArrowLeft className="size-4" />
              Back to Journal
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Location headline string
  const locationParts = [trip.city, trip.state, trip.country].filter(Boolean);
  const locationString = locationParts.join(", ");

  // Metadata badges
  const badges = [
    trip.travel_type ? { icon: Compass, label: trip.travel_type } : null,
    trip.transport ? { icon: Car, label: trip.transport } : null,
    trip.companions ? { icon: Users, label: trip.companions } : null,
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string }[];

  // Detailed fields
  const detailItems = [
    { label: "Destination", value: trip.city },
    { label: "State / Region", value: trip.state },
    { label: "Country", value: trip.country },
    {
      label: "Travel Dates",
      value:
        trip.start_date && trip.end_date
          ? `${trip.start_date} – ${trip.end_date}`
          : trip.start_date || trip.end_date || null,
    },
    { label: "Travel Type", value: trip.travel_type },
    { label: "Transportation", value: trip.transport },
    { label: "Companions", value: trip.companions },
    { label: "Approx. Distance", value: trip.distance },
    { label: "Approx. Expenses", value: trip.expenses },
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* Breadcrumb / Back link */}
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-4">
          <Link
            href="/journal"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="size-3.5" />
            Back to All Journeys
          </Link>
        </div>

        {/* 5.1 Cinematic Hero */}
        <section className="relative w-full max-w-7xl mx-auto px-6 mb-16">
          <div className="relative w-full h-[55vh] md:h-[72vh] min-h-[460px] rounded-3xl overflow-hidden border border-border/50 bg-card/40 shadow-xl">
            {trip.cover_image ? (
              <Image
                src={trip.cover_image}
                alt={trip.title}
                fill
                priority
                unoptimized
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-card via-muted/30 to-card" />
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

            {/* Hero Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14 max-w-4xl">
              {locationString && (
                <div className="flex items-center gap-2 text-xs md:text-sm font-semibold uppercase tracking-wider text-primary mb-3">
                  <MapPin className="size-4" />
                  <span>{locationString}</span>
                  {trip.start_date && (
                    <>
                      <span className="text-muted-foreground/50">·</span>
                      <span className="text-muted-foreground font-medium">{trip.start_date}</span>
                    </>
                  )}
                </div>
              )}

              <h1 className="text-3xl md:text-6xl font-bold leading-tight tracking-tight text-foreground mb-4">
                {trip.title}
              </h1>

              {trip.description && (
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl font-normal">
                  {trip.description}
                </p>
              )}

              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex flex-wrap items-center gap-2.5 mt-6">
                  {badges.map((b, i) => {
                    const Icon = b.icon;
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-card/80 border border-border/60 backdrop-blur-md text-foreground shadow-sm"
                      >
                        <Icon className="size-3.5 text-primary" />
                        {b.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5.2 My POV — Personal Story */}
        {trip.pov && (
          <section className="max-w-3xl mx-auto px-6 py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2.5 mb-6">
                <span className="h-6 w-1 rounded-full bg-primary" />
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  My POV
                </h2>
              </div>

              <div className="space-y-6 text-base md:text-lg leading-relaxed text-muted-foreground font-normal">
                {trip.pov.split("\n\n").map((para, idx) => (
                  <p key={idx} className="whitespace-pre-wrap leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* 5.3 Photo Gallery */}
        <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-1 rounded-full bg-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Visual Memories
              </h2>
            </div>
            {photos.length > 0 && (
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                {photos.length} {photos.length === 1 ? "Photograph" : "Photographs"}
              </span>
            )}
          </div>

          <PhotoGallery photos={photos} />
        </section>

        {/* 5.4 Places I Explored */}
        {locations.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="flex items-center gap-2.5 mb-8">
              <span className="h-6 w-1 rounded-full bg-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Places I Explored
              </h2>
            </div>

            {/* Trip Map */}
            <div className="mb-10">
              <TripDetailMap locations={locations} />
            </div>

            {/* Locations Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((loc) => (
                <LocationCard key={loc.id} location={loc} />
              ))}
            </div>
          </section>
        )}

        {/* 5.5 Trip Details */}
        {detailItems.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="rounded-3xl border border-border/50 bg-card/40 p-8 md:p-12 shadow-sm">
              <div className="flex items-center gap-2.5 mb-8">
                <span className="h-6 w-1 rounded-full bg-primary" />
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  Trip Logistics & Details
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {detailItems.map((item, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground/80 mb-1 font-semibold">
                      {item.label}
                    </span>
                    <span className="text-sm md:text-base text-foreground font-medium">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5.6 Favourite Moments / Highlights */}
        {highlights.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="flex items-center gap-2.5 mb-8">
              <span className="h-6 w-1 rounded-full bg-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Favourite Moments & Highlights
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlights.map((h) => (
                <div
                  key={h.id}
                  className="rounded-3xl border border-border/50 bg-card/50 overflow-hidden p-6 flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm"
                >
                  <div>
                    {h.image_url && (
                      <div className="relative w-full h-48 mb-4 rounded-2xl overflow-hidden bg-muted/20">
                        <Image
                          src={h.image_url}
                          alt={h.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Sparkles className="size-4 shrink-0" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {h.title}
                      </h3>
                    </div>
                    {h.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {h.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5.8 Ending Section */}
        {trip.closing_note && (
          <section className="max-w-3xl mx-auto px-6 py-16 text-center">
            <span className="inline-block text-4xl mb-4 text-primary">
              ❝
            </span>
            <p className="text-xl md:text-2xl font-medium italic text-foreground leading-relaxed mb-4">
              {trip.closing_note}
            </p>
            <span className="inline-block h-0.5 w-16 bg-primary/40 rounded-full" />
          </section>
        )}

        {/* Previous / Next Navigation */}
        <section className="max-w-7xl mx-auto px-6 pt-12 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {prevTrip ? (
              <Link
                href={`/journal/${prevTrip.slug}`}
                className="group flex flex-col items-start gap-1 p-5 rounded-2xl border border-border/50 bg-card/40 hover:border-primary/50 hover:bg-card transition-all w-full sm:w-auto min-w-[220px]"
              >
                <span className="text-xs uppercase tracking-wider text-muted-foreground group-hover:text-primary flex items-center gap-1 transition-colors font-medium">
                  <ArrowLeft className="size-3" /> Previous Journey
                </span>
                <span className="text-base font-semibold text-foreground">
                  {prevTrip.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            <Link
              href="/journal"
              className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            >
              All Journeys
            </Link>

            {nextTrip ? (
              <Link
                href={`/journal/${nextTrip.slug}`}
                className="group flex flex-col items-end gap-1 p-5 rounded-2xl border border-border/50 bg-card/40 hover:border-primary/50 hover:bg-card transition-all w-full sm:w-auto min-w-[220px] text-right"
              >
                <span className="text-xs uppercase tracking-wider text-muted-foreground group-hover:text-primary flex items-center gap-1 transition-colors font-medium">
                  Next Journey <ChevronRight className="size-3" />
                </span>
                <span className="text-base font-semibold text-foreground">
                  {nextTrip.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

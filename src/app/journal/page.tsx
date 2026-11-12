"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, FileText, Plus, LogOut } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { isAdmin, adminLogout } from "@/lib/blog-store";
import { Button } from "@/components/ui/button";
import TripCard from "@/components/journal/TripCard";
import {
  getPublishedTrips,
  getJournalStats,
  getPublishedLocationsWithTrips,
  JournalTrip,
  JournalLocation,
} from "@/lib/journal-store";

// Dynamic map import — SSR disabled; map worker builds the component
const JournalWorldMap = dynamic(
  () => import("@/components/journal/JournalWorldMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] rounded-3xl bg-card/40 border border-border/40 animate-pulse" />
    ),
  }
);

type SortOrder = "newest" | "oldest";

interface Stats {
  trips: number;
  cities: number;
  states: number;
  countries: number;
}

const STAT_CARDS = [
  { key: "trips" as const, label: "Total Trips" },
  { key: "cities" as const, label: "Cities Explored" },
  { key: "states" as const, label: "States Visited" },
  { key: "countries" as const, label: "Countries Visited" },
];

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
        active
          ? "border border-primary bg-primary/15 text-primary shadow-sm shadow-primary/10"
          : "border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 bg-card/40 hover:bg-card"
      }`}
    >
      {label}
    </button>
  );
}

export default function JournalPage() {
  const [admin, setAdmin] = useState(false);
  const [trips, setTrips] = useState<JournalTrip[]>([]);
  const [locations, setLocations] = useState<JournalLocation[]>([]);
  const [tripsByLocationId, setTripsByLocationId] = useState<Record<string, JournalTrip>>({});
  const [stats, setStats] = useState<Stats>({ trips: 0, cities: 0, states: 0, countries: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterYear, setFilterYear] = useState<string | null>(null);
  const [filterCountry, setFilterCountry] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");

  useEffect(() => {
    setAdmin(isAdmin());
    async function load() {
      try {
        const [fetchedTrips, fetchedStats, mapData] = await Promise.all([
          getPublishedTrips(),
          getJournalStats(),
          getPublishedLocationsWithTrips(),
        ]);
        setTrips(fetchedTrips);
        setStats(fetchedStats);
        setLocations(mapData.locations);
        setTripsByLocationId(mapData.tripsByLocationId);
      } catch (err) {
        console.error("Failed to load journal data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Derive filter options
  const years = useMemo(() => {
    const set = new Set<string>();
    trips.forEach((t) => {
      if (t.start_date) {
        const y = t.start_date.slice(0, 4);
        if (y) set.add(y);
      }
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [trips]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    trips.forEach((t) => {
      if (t.country) set.add(t.country);
    });
    return Array.from(set).sort();
  }, [trips]);

  const states = useMemo(() => {
    const set = new Set<string>();
    trips.forEach((t) => {
      if (t.state && (!filterCountry || t.country === filterCountry)) {
        set.add(t.state);
      }
    });
    return Array.from(set).sort();
  }, [trips, filterCountry]);

  // Filtered + sorted trips
  const filteredTrips = useMemo(() => {
    let result = trips.filter((t) => {
      if (filterYear && (!t.start_date || !t.start_date.startsWith(filterYear))) return false;
      if (filterCountry && t.country !== filterCountry) return false;
      if (filterState && t.state !== filterState) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [t.title, t.city, t.state, t.country, t.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      const da = new Date(a.published_at ?? a.start_date ?? "").getTime() || 0;
      const db = new Date(b.published_at ?? b.start_date ?? "").getTime() || 0;
      return sort === "newest" ? db - da : da - db;
    });

    return result;
  }, [trips, filterYear, filterCountry, filterState, search, sort]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        {/* ── Admin Mode Banner ───────────────────────────────────────── */}
        {admin && (
          <section className="pt-24 px-6 max-w-7xl mx-auto">
            <div className="p-4 rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  Admin Active
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-sm flex items-center gap-1.5">
                    <Compass className="size-3.5" />
                    <span>Journal Management</span>
                  </span>
                  <Link
                    href="/blog"
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="size-3.5 text-primary" />
                    <span>Blog Management</span>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href="/journal/admin?action=new">
                  <Button size="sm" className="rounded-full gap-1.5 shadow-lg shadow-primary/20">
                    <Plus className="size-3.5" /> Add New Trip
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full gap-1.5 border-red-500/40 text-red-500 hover:bg-red-500/10"
                  onClick={() => {
                    adminLogout();
                    window.location.reload();
                  }}
                >
                  <LogOut className="size-3.5" /> Logout
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ── 1. Hero ─────────────────────────────────────────────────── */}
        <section className="pt-28 md:pt-32 pb-14 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4"
          >
            <Compass size={14} />
            Through My Journeys
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl md:text-9xl font-normal tracking-normal text-gradient py-4 mb-2"
            style={{ fontFamily: "var(--font-great-vibes), cursive" }}
          >
            My Journal
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-muted-foreground -mt-2 mb-4 text-lg font-medium italic tracking-wide"
          >
            Notes from the road
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-muted-foreground/60 text-sm max-w-md mx-auto"
          >
            Collecting places, moments, and stories along the way...
          </motion.p>
        </section>

        {/* ── 2. Stats Row ────────────────────────────────────────────── */}
        <section className="pb-16 px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center max-w-3xl mx-auto p-3 rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm shadow-sm"
          >
            {STAT_CARDS.map((card, i) => (
              <div key={card.key} className="flex items-center">
                <div className="text-center px-6 md:px-8 py-3">
                  <div className="text-3xl md:text-4xl font-bold mb-0.5 text-gradient font-sans">
                    {stats[card.key]}
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                    {card.label}
                  </div>
                </div>
                {i < STAT_CARDS.length - 1 && (
                  <div className="h-8 w-px hidden sm:block bg-border/50" />
                )}
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── 3. World Map ─────────────────────────────────────────────── */}
        <section className="px-6 max-w-7xl mx-auto pb-16">
          <JournalWorldMap
            trips={trips}
            locations={locations}
            tripsByLocationId={tripsByLocationId}
          />
        </section>

        {/* ── 4. Filters + Sort ────────────────────────────────────────── */}
        <section className="px-6 max-w-7xl mx-auto pb-10">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <input
                type="text"
                placeholder="Search journeys, places, cities…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-card/50 rounded-full px-5 py-2.5 text-sm outline-none transition-colors duration-200 border border-border/60 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* Filter rows */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Year filters */}
              {years.length > 0 && (
                <>
                  <FilterButton
                    label="All Years"
                    active={filterYear === null}
                    onClick={() => setFilterYear(null)}
                  />
                  {years.map((y) => (
                    <FilterButton
                      key={y}
                      label={y}
                      active={filterYear === y}
                      onClick={() => setFilterYear(filterYear === y ? null : y)}
                    />
                  ))}
                  <span className="w-px h-5 bg-border/50 hidden sm:block" />
                </>
              )}

              {/* Country filters */}
              {countries.length > 0 && (
                <>
                  <FilterButton
                    label="All Countries"
                    active={filterCountry === null}
                    onClick={() => { setFilterCountry(null); setFilterState(null); }}
                  />
                  {countries.map((c) => (
                    <FilterButton
                      key={c}
                      label={c}
                      active={filterCountry === c}
                      onClick={() => {
                        setFilterCountry(filterCountry === c ? null : c);
                        setFilterState(null);
                      }}
                    />
                  ))}
                  {states.length > 0 && (
                    <>
                      <span className="w-px h-5 bg-border/50 hidden sm:block" />
                      {states.map((s) => (
                        <FilterButton
                          key={s}
                          label={s}
                          active={filterState === s}
                          onClick={() => setFilterState(filterState === s ? null : s)}
                        />
                      ))}
                    </>
                  )}
                  <span className="w-px h-5 bg-border/50 hidden sm:block" />
                </>
              )}

              {/* Sort */}
              <FilterButton
                label="Newest First"
                active={sort === "newest"}
                onClick={() => setSort("newest")}
              />
              <FilterButton
                label="Oldest First"
                active={sort === "oldest"}
                onClick={() => setSort("oldest")}
              />
            </div>
          </div>
        </section>

        {/* ── 5. Trip Cards Grid ───────────────────────────────────────── */}
        <section className="px-6 max-w-7xl mx-auto pb-20">
          {loading ? (
            /* Loading skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-border/40 bg-card/30 animate-pulse h-[380px]"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} index={i} />
              ))}

              {/* ── 6. Empty State ─────────────────────────────────────── */}
              {filteredTrips.length === 0 && (
                <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-card/30 col-span-full">
                  <Compass className="size-12 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    Every journey starts somewhere.
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                    {admin
                      ? "No published journeys yet. Click below to add your first journey!"
                      : "Stories and travel logs coming soon."}
                  </p>
                  {admin && (
                    <Link href="/journal/admin?action=new">
                      <Button className="rounded-full gap-2 shadow-lg shadow-primary/20">
                        <Plus className="size-4" /> Add New Trip
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

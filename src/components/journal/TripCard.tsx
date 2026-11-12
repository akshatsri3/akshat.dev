"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { JournalTrip } from "@/lib/journal-store";

interface TripCardProps {
  trip: JournalTrip;
  index: number;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function TripCard({ trip, index }: TripCardProps) {
  const delay = Math.min(index * 0.06, 0.3);

  const locationText = [trip.city, trip.state, trip.country].filter(Boolean).join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="group h-full"
    >
      <Link href={`/journal/${trip.slug}`} className="block h-full">
        <div className="flex flex-col h-full rounded-3xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 overflow-hidden">
          {/* Cover Image */}
          <div className="relative w-full overflow-hidden aspect-[16/10] bg-muted/20">
            {trip.cover_image ? (
              <Image
                src={trip.cover_image}
                alt={trip.title}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-card via-muted/30 to-card flex items-center justify-center">
                <MapPin className="size-10 text-muted-foreground/30" />
              </div>
            )}
            {/* Soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          </div>

          {/* Card Content */}
          <div className="flex flex-col flex-grow p-6">
            {/* Location + Date row */}
            <div className="flex items-center justify-between gap-2 mb-3">
              {locationText ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary tracking-wide line-clamp-1">
                  <MapPin className="size-3 shrink-0" />
                  {locationText}
                </span>
              ) : (
                <span />
              )}
              {trip.start_date && (
                <span className="text-xs text-muted-foreground/70 shrink-0 font-medium">
                  {formatDate(trip.start_date)}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-semibold mb-2 leading-snug text-foreground group-hover:text-primary transition-colors">
              {trip.title}
            </h3>

            {/* Description */}
            {trip.description && (
              <p className="text-sm text-muted-foreground mb-5 flex-grow line-clamp-2 leading-relaxed">
                {trip.description}
              </p>
            )}

            {/* CTA */}
            <div className="mt-auto pt-2 flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all gap-1.5">
              <span>Explore Journey</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

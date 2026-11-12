"use client";

import { JournalLocation } from "@/lib/journal-store";
import { ExternalLink, MapPin, Star } from "lucide-react";
import Image from "next/image";

interface LocationCardProps {
  location: JournalLocation;
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <div className="rounded-3xl border border-border/50 bg-card/50 p-5 flex flex-col justify-between hover:border-primary/50 hover:bg-card transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5">
      <div>
        {location.image_url && (
          <div className="relative w-full h-44 mb-4 rounded-2xl overflow-hidden bg-muted/20">
            <Image
              src={location.image_url}
              alt={location.name}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" />
            <h4 className="text-lg font-semibold text-foreground">
              {location.name}
            </h4>
          </div>
          {location.rating && location.rating > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-400">
              <Star className="size-3.5 fill-current" />
              <span>{location.rating}/5</span>
            </div>
          )}
        </div>

        {location.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
            {location.description}
          </p>
        )}
      </div>

      {location.maps_url && (
        <a
          href={location.maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors pt-3 border-t border-border/50"
        >
          <span>View on Google Maps</span>
          <ExternalLink className="size-3" />
        </a>
      )}
    </div>
  );
}

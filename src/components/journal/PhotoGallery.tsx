"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { JournalPhoto } from "@/lib/journal-store";
import { X, ChevronLeft, ChevronRight, Calendar, MapPin, Maximize2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface PhotoGalleryProps {
  photos: JournalPhoto[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === 0 ? photos.length - 1 : (prev ?? 0) - 1));
  }, [lightboxIndex, photos.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === photos.length - 1 ? 0 : (prev ?? 0) + 1));
  }, [lightboxIndex, photos.length]);

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handleClose, handlePrev, handleNext]);

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border/50 rounded-3xl bg-card/30">
        <p className="text-sm text-muted-foreground">No photographs added for this journey yet.</p>
      </div>
    );
  }

  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <div>
      {/* Editorial Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {photos.map((photo, idx) => (
          <div
            key={photo.id || idx}
            onClick={() => setLightboxIndex(idx)}
            className="group relative cursor-pointer break-inside-avoid overflow-hidden rounded-3xl border border-border/50 bg-card/50 transition-all duration-300 hover:border-primary/50 hover:bg-card hover:shadow-xl hover:shadow-primary/5"
          >
            <div className="relative w-full overflow-hidden bg-muted/20">
              <Image
                src={photo.image_url}
                alt={photo.caption || "Trip photo"}
                width={800}
                height={600}
                unoptimized
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-primary">
                  <Maximize2 className="size-3.5" />
                  View Photo
                </span>
              </div>
            </div>

            {(photo.caption || photo.location_name || photo.taken_at) && (
              <div className="p-4 border-t border-border/40">
                {photo.caption && (
                  <p className="text-sm text-foreground font-medium leading-relaxed mb-2">
                    {photo.caption}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {photo.location_name && (
                    <span className="flex items-center gap-1 text-primary">
                      <MapPin className="size-3" />
                      {photo.location_name}
                    </span>
                  )}
                  {photo.taken_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {photo.taken_at}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between z-10 max-w-6xl mx-auto w-full">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                {lightboxIndex + 1} / {photos.length}
              </span>
              <button
                onClick={handleClose}
                className="p-2.5 rounded-full bg-card/80 text-foreground hover:text-primary border border-border/50 hover:border-primary/50 transition-colors"
                aria-label="Close lightbox"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Main Image Viewer */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
              <button
                onClick={handlePrev}
                className="absolute left-2 md:left-6 z-10 p-3 rounded-full bg-card/80 text-foreground hover:text-primary border border-border/50 hover:border-primary/50 backdrop-blur-sm transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-6" />
              </button>

              <div className="relative max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center">
                <Image
                  src={currentPhoto.image_url}
                  alt={currentPhoto.caption || "Enlarged photo"}
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                  sizes="100vw"
                />
              </div>

              <button
                onClick={handleNext}
                className="absolute right-2 md:right-6 z-10 p-3 rounded-full bg-card/80 text-foreground hover:text-primary border border-border/50 hover:border-primary/50 backdrop-blur-sm transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="size-6" />
              </button>
            </div>

            {/* Bottom Caption */}
            <div className="max-w-2xl mx-auto text-center z-10">
              {currentPhoto.caption && (
                <p className="text-base text-foreground font-medium mb-1.5">
                  {currentPhoto.caption}
                </p>
              )}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                {currentPhoto.location_name && (
                  <span className="flex items-center gap-1 text-primary">
                    <MapPin className="size-3" />
                    {currentPhoto.location_name}
                  </span>
                )}
                {currentPhoto.taken_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {currentPhoto.taken_at}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

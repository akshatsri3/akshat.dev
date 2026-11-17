"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { JournalPhoto, formatDuration } from "@/lib/journal-store";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Maximize2,
  Play,
  Film,
  Volume2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface PhotoGalleryProps {
  photos: JournalPhoto[];
}

function isVideoItem(photo: JournalPhoto): boolean {
  if (photo.media_type === "video") return true;
  if (photo.video_url) return true;
  if (photo.image_url && photo.image_url.match(/\.(mp4|webm)($|\?)/i)) return true;
  return false;
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
        <p className="text-sm text-muted-foreground">No media added for this journey yet.</p>
      </div>
    );
  }

  const currentItem = lightboxIndex !== null ? photos[lightboxIndex] : null;
  const isCurrentVideo = currentItem ? isVideoItem(currentItem) : false;

  return (
    <div>
      {/* Editorial Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {photos.map((item, idx) => {
          const isVideo = isVideoItem(item);
          const mediaUrl = item.video_url || item.image_url;
          const posterUrl =
            item.thumbnail_url ||
            (!item.image_url?.match(/\.(mp4|webm)($|\?)/i) ? item.image_url : null);
          const durationStr = formatDuration(item.duration);

          return (
            <div
              key={item.id || idx}
              onClick={() => setLightboxIndex(idx)}
              className="group relative cursor-pointer break-inside-avoid overflow-hidden rounded-3xl border border-border/50 bg-card/50 transition-all duration-300 hover:border-primary/50 hover:bg-card hover:shadow-xl hover:shadow-primary/5"
            >
              {/* Media Thumbnail Container */}
              <div className="relative w-full overflow-hidden bg-muted/20">
                {isVideo ? (
                  /* Video Thumbnail */
                  <div className="relative w-full aspect-[16/10] md:aspect-auto overflow-hidden bg-black/40">
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={item.caption || "Video preview"}
                        width={800}
                        height={600}
                        unoptimized
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <video
                        src={mediaUrl}
                        preload="metadata"
                        muted
                        playsInline
                        className="w-full h-auto min-h-[220px] object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                      />
                    )}

                    {/* Centered Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="size-12 md:size-14 rounded-full bg-background/80 backdrop-blur-md border border-border/60 text-foreground flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
                        <Play className="size-5 md:size-6 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Duration / Video Badge */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-md border border-border/60 text-[11px] font-semibold text-foreground flex items-center gap-1.5 shadow-sm">
                      <Film className="size-3 text-primary" />
                      <span>{durationStr || "Video"}</span>
                    </div>
                  </div>
                ) : (
                  /* Photo Thumbnail */
                  <Image
                    src={item.image_url}
                    alt={item.caption || "Trip photo"}
                    width={800}
                    height={600}
                    unoptimized
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}

                {/* Subtle Hover Action Pill */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-primary">
                    {isVideo ? (
                      <>
                        <Play className="size-3.5 fill-current" />
                        Play Video
                      </>
                    ) : (
                      <>
                        <Maximize2 className="size-3.5" />
                        View Photo
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Caption & Metadata Details */}
              {(item.caption || item.location_name || item.taken_at) && (
                <div className="p-4 border-t border-border/40">
                  {item.caption && (
                    <p className="text-sm text-foreground font-medium leading-relaxed mb-2">
                      {item.caption}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {item.location_name && (
                      <span className="flex items-center gap-1 text-primary">
                        <MapPin className="size-3" />
                        {item.location_name}
                      </span>
                    )}
                    {item.taken_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {item.taken_at}
                      </span>
                    )}
                    {isVideo && (
                      <span className="flex items-center gap-1 font-medium text-foreground/80">
                        <Film className="size-3 text-primary" />
                        {durationStr || "Video"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal (Full-Screen Viewer for Photos & Videos) */}
      <AnimatePresence>
        {lightboxIndex !== null && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between z-10 max-w-6xl mx-auto w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  {lightboxIndex + 1} / {photos.length}
                </span>
                {isCurrentVideo && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                    <Play className="size-2.5 fill-current" />
                    Video
                  </span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2.5 rounded-full bg-card/80 text-foreground hover:text-primary border border-border/50 hover:border-primary/50 transition-colors"
                aria-label="Close lightbox"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Main Media Viewer */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
              <button
                onClick={handlePrev}
                className="absolute left-2 md:left-6 z-10 p-3 rounded-full bg-card/80 text-foreground hover:text-primary border border-border/50 hover:border-primary/50 backdrop-blur-sm transition-colors"
                aria-label="Previous item"
              >
                <ChevronLeft className="size-6" />
              </button>

              <div className="relative max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center px-4">
                {isCurrentVideo ? (
                  /* Video Player with full controls, autoplay, and preload metadata */
                  <video
                    key={currentItem.id || lightboxIndex}
                    src={currentItem.video_url || currentItem.image_url}
                    poster={
                      currentItem.thumbnail_url ||
                      (!currentItem.image_url?.match(/\.(mp4|webm)($|\?)/i)
                        ? currentItem.image_url
                        : undefined)
                    }
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl bg-black border border-border/40 focus:outline-none"
                  >
                    Your browser does not support HTML5 video playback.
                  </video>
                ) : (
                  /* Photo Image */
                  <Image
                    src={currentItem.image_url}
                    alt={currentItem.caption || "Enlarged photo"}
                    fill
                    className="object-contain"
                    priority
                    unoptimized
                    sizes="100vw"
                  />
                )}
              </div>

              <button
                onClick={handleNext}
                className="absolute right-2 md:right-6 z-10 p-3 rounded-full bg-card/80 text-foreground hover:text-primary border border-border/50 hover:border-primary/50 backdrop-blur-sm transition-colors"
                aria-label="Next item"
              >
                <ChevronRight className="size-6" />
              </button>
            </div>

            {/* Bottom Caption & Info */}
            <div className="max-w-2xl mx-auto text-center z-10">
              {currentItem.caption && (
                <p className="text-base text-foreground font-medium mb-1.5">
                  {currentItem.caption}
                </p>
              )}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                {currentItem.location_name && (
                  <span className="flex items-center gap-1 text-primary">
                    <MapPin className="size-3" />
                    {currentItem.location_name}
                  </span>
                )}
                {currentItem.taken_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {currentItem.taken_at}
                  </span>
                )}
                {isCurrentVideo && currentItem.duration && currentItem.duration > 0 && (
                  <span className="flex items-center gap-1 text-foreground/80 font-medium">
                    <Film className="size-3 text-primary" />
                    {formatDuration(currentItem.duration)}
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

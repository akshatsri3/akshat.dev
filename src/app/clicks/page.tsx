"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowLeft, Camera, MapPin } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export default function ClicksPage() {

  const clicks = [
    {
      quote: "Every year Sangam is visted by Flamingos for migration..",
      name: "The Flamingos",
      designation: "Sangam-Praygraj/ 9-NOV-24",
      src: "/assets/clicks/prayagraj.jpeg",
    },
    {
      quote: "In a place full of people, everyone is racing the same clock. Time is constant ~ We are not.",
      name: "The Clock Court",
      designation: "VIT-Chennai/Clock-Court",
      src: "/assets/clicks/clock-court.jpeg",
    },
    {
      quote: "Under this sky, between arrivals and departures, something in us keeps changing.",
      name: "VIT Twilight Gate",
      designation: "VIT-Chennai/Main-Gate",
      src: "/assets/clicks/main-gate.jpeg",
    },
    {
      quote: "A block which holds emmmence memmories for me...",
      name: "D-Block",
      designation: "VIT-Chennai/D2-Block",
      src: "/assets/clicks/dblock.jpeg",
    },
    {
      quote: "Under a patient moon, even silence feels complete...",
      name: "Nocturne at VIT",
      designation: "VIT-Chennai/Moon-light",
      src: "/assets/clicks/moon1.jpeg",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-6 py-12 md:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 -ml-2 text-muted-foreground hover:text-primary")}
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </motion.div>

          {/* Header */}
          <div className="text-center mb-0 md:mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6"
            >
              <Camera size={14} />
              Through My Lens
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-6xl md:text-9xl font-normal tracking-normal mb-6 text-gradient py-4"
              style={{ fontFamily: "var(--font-great-vibes), cursive" }}
            >
              Collected Silences
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              A collection of moments frozen in time. Exploring perspective, light, and the stories hidden in plain sight.
            </motion.p>
          </div>

          {/* Gallery Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full"
          >
            <AnimatedTestimonials testimonials={clicks} autoplay={true} />
          </motion.div>

          {/* Note Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20 p-8 rounded-3xl bg-secondary/20 border border-white/5 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Capturing the Rest...</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              I'm constantly exploring new places and perspectives. Stay tuned as I update this space with my latest work.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

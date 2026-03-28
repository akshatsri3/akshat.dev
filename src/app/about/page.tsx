"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Mail, MapPin, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-6 py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
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

          {/* Hero Section / Profile Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-12 items-center mb-20"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-primary to-accent rounded-2xl blur-sm opacity-40 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative w-64 h-80 md:w-80 md:h-[450px] bg-secondary/30 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src="/assets/profile.jpg"
                  alt="Akshat Srivastava"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-6xl md:text-8xl font-normal tracking-normal mb-4 text-gradient py-4"
                style={{ fontFamily: "var(--font-great-vibes), cursive" }}
              >
                About Me
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xl text-muted-foreground"
              >
                Hi, I’m Akshat Srivastava~doing my part, the rest unfolds..
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap justify-center md:justify-start gap-6 mt-8"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} className="text-primary" />
                  India
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase size={16} className="text-primary" />
                  Developer
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail size={16} className="text-primary" />
                  akshatsri.work@gmail.com
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Bio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="prose prose-invert max-w-none"
          >
            <h2 className="text-3xl font-bold mb-6 tracking-tight">The Story-</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Akshat here, from Prayagraj, India — just figuring things out as I go.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              An artist in spirit a seeker by nature which keep me grounded,I like to travel whenever I can,maths and physics keeps me curious.Getting lost between places, books, space, and a camera lens—just exploring, one thought, one frame, one step at a time.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">

            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

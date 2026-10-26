"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Download } from "lucide-react";
import Image from "next/image";

import { useState, useEffect, useCallback } from "react";

const useTypewriter = (text: string, speed: number = 100, delay: number = 2000) => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const tick = useCallback(() => {
    const fullText = text;
    const updatedText = isDeleting
      ? fullText.substring(0, displayText.length - 1)
      : fullText.substring(0, displayText.length + 1);

    setDisplayText(updatedText);

    if (!isDeleting && updatedText === fullText) {
      setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && updatedText === "") {
      setIsDeleting(false);
    }
  }, [displayText, isDeleting, text, delay]);

  useEffect(() => {
    const timer = setTimeout(tick, isDeleting ? speed / 2 : speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, speed]);

  return displayText;
};

const Typewriter = ({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) => {
  const [start, setStart] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStart(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const displayText = useTypewriter(start ? text : "", 100, 2000);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="inline-block w-[3px] h-[0.8em] bg-primary ml-1 translate-y-[0.1em]"
      />
    </span>
  );
};

const GreetingTypewriter = ({ words, speed = 100, delay = 2000, startDelay = 0, className = "" }: { words: string[]; speed?: number; delay?: number; startDelay?: number; className?: string }) => {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [started, setStarted] = useState(startDelay === 0);

  useEffect(() => {
    if (startDelay === 0) return;
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  const tick = useCallback(() => {
    if (!started) return;
    const fullText = words[index];
    const updatedText = isDeleting
      ? fullText.substring(0, displayText.length - 1)
      : fullText.substring(0, displayText.length + 1);

    setDisplayText(updatedText);

    if (!isDeleting && updatedText === fullText) {
      setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && updatedText === "") {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
    }
  }, [displayText, isDeleting, index, words, delay, started]);

  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(tick, isDeleting ? speed / 2 : speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, speed, started]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="inline-block w-[2px] h-[0.7em] bg-primary ml-1 translate-y-[0.1em]"
      />
    </span>
  );
};


export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden -mt-[4.5rem] pt-[4.5rem]">
      {/* Hero background photo */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/assets/hero-bg.png"
          alt="Hero background"
          fill
          priority
          quality={90}
          style={{ objectFit: "cover", objectPosition: "center 30%" }}
        />
      </div>

      {/* Dissolve overlay — dark base */}
      <div className="absolute inset-0 -z-10 bg-black/60" />

      {/* Radial vignette — darkens edges, keeps center clear */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 20%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Bottom gradient fade into page background — deep cinematic blend */}
      <div
        className="absolute inset-x-0 bottom-0 h-80 -z-10"
        style={{
          background:
            "linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background)/0.85) 25%, hsl(var(--background)/0.55) 55%, transparent 100%)",
        }}
      />

      {/* Extra-wide bottom sweep so nothing bleeds through */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 -z-9"
        style={{ background: "hsl(var(--background))" }}
      />

      {/* Subtle top fade */}
      <div
        className="absolute inset-x-0 top-0 h-24 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 100%)",
        }}
      />

      {/* Subtle color tint blobs to preserve brand feel */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[140px] -z-10 animate-pulse delay-1000" />


      <div className="section-padding text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-3xl md:text-5xl font-bold tracking-tighter text-primary/80"
        >
          <GreetingTypewriter words={["Hi!", "नमस्ते !", "Hola!"]} />
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 text-gradient leading-[1.1]"
        >
          Akshat Srivastava
        </motion.h1>


        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl mx-auto mb-12"
        >
          <span
            className="block text-2xl md:text-3xl font-light text-white/75 tracking-widest"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontStyle: "italic",
              fontWeight: 300,
              letterSpacing: "0.12em",
            }}
          >
            &#8220;&thinsp;Aceptar, Aprender, Avanzar&thinsp;&#8221;
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/blog"
            className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 gap-2 group")}
          >
            My Blogs
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="/resume.pdf"
            download
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8 gap-2")}
          >
            Download Resume
            <Download className="size-4" />
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/50"
      >
        <div className="w-px h-12 bg-linear-to-b from-transparent via-muted-foreground/30 to-transparent mx-auto" />
      </motion.div>
    </section>
  );
}

export function HeroBlend() {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: "120px", marginTop: "-80px", zIndex: 1 }}>
      {/* Solid background fill */}
      <div className="absolute inset-0" style={{ background: "hsl(var(--background))" }} />

      {/* Animated radial aurora glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.18, 0.32, 0.18], scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 -translate-x-1/2 top-[-40px] w-[600px] h-[120px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, hsl(var(--primary)/0.22) 0%, hsl(var(--primary)/0.06) 60%, transparent 100%)",
          filter: "blur(18px)",
        }}
      />

      {/* Secondary accent glow offset */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.10, 0.20, 0.10], x: ["-5%", "5%", "-5%"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute left-1/2 -translate-x-1/2 top-[-20px] w-[400px] h-[80px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(var(--accent)/0.18) 0%, transparent 100%)",
          filter: "blur(24px)",
        }}
      />

      {/* Thin shimmering top line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 0.5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-0 left-0 right-0 h-px origin-left"
        style={{
          background:
            "linear-gradient(to right, transparent, hsl(var(--primary)/0.5) 30%, hsl(var(--primary)/0.7) 50%, hsl(var(--primary)/0.5) 70%, transparent)",
        }}
      />
    </div>
  );
}

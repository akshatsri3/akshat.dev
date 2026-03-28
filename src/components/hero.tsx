"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Download } from "lucide-react";

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

const GreetingTypewriter = ({ words, speed = 100, delay = 2000, className = "" }: { words: string[]; speed?: number; delay?: number; className?: string }) => {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const tick = useCallback(() => {
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
  }, [displayText, isDeleting, index, words, delay]);

  useEffect(() => {
    const timer = setTimeout(tick, isDeleting ? speed / 2 : speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, speed]);

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
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] -z-10 animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[150px] -z-10 animate-pulse delay-500" />


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
          <br />
          <Typewriter text="I build with intent." delay={3000} />
        </motion.h1>


        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-12"
        >
          I'm a Full-stack Developer specializing in building high-performance,
          accessible,that solve real-world problems.
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

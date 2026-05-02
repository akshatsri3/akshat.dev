"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalBrandingProps {
  onClick?: () => void;
  className?: string;
}

export const TerminalBranding = ({ onClick, className }: TerminalBrandingProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem("hasVisitedTerminalBranding");
    if (!visited) {
      const timer = setTimeout(() => {
        setShowNudge(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAction = () => {
    if (showNudge) {
      setShowNudge(false);
      localStorage.setItem("hasVisitedTerminalBranding", "true");
    }
    onClick?.();
  };

  // SVG for the terminal block cursor
  const terminalCursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="0 0 12 20" fill="none"><rect x="0" y="2" width="10" height="16" fill="%23a78bfa" fill-opacity="0.9" /></svg>'), auto`;

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleAction}
        style={{ cursor: isHovered ? terminalCursor : "pointer" }}
        className={cn(
          "group relative flex items-center font-mono text-xl font-bold tracking-tighter transition-all duration-300",
          "text-white hover:text-violet-400 focus:outline-none",
          className
        )}
        aria-label="Open terminal"
      >
        {/* The Animated Prompt */}
        <motion.span
          initial={false}
          animate={{ 
            opacity: isHovered || showNudge ? 1 : 0.6,
            x: isHovered ? 0 : -2,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.2 }}
          className="mr-1.5 text-violet-400 inline-block font-mono"
        >
          &gt;
        </motion.span>

        {/* The Text with Flicker effect on hover */}
        <span className="relative inline-block">
          Akshat
          {isHovered && (
            <motion.span
              animate={{ 
                opacity: [0, 0.4, 0.2, 0.5, 0.3],
                scale: [1, 1.02, 0.98, 1.01, 1]
              }}
              transition={{ 
                duration: 0.15, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
              className="absolute inset-0 bg-violet-400/20 blur-md -z-10 rounded-full"
            />
          )}
        </span>

        {/* Pulse Glow for Nudge */}
        {showNudge && (
          <motion.div
            layoutId="nudge-glow"
            className="absolute -inset-4 rounded-full bg-violet-400/15 blur-xl -z-20"
            animate={{ 
              opacity: [0.2, 0.5, 0.2],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {showNudge && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="absolute -bottom-11 left-0 whitespace-nowrap rounded-lg border border-white/10 bg-black/80 px-3 py-1.5 font-mono text-[11px] text-neutral-300 backdrop-blur-md shadow-xl z-[60]"
          >
            <span className="text-violet-400 animate-pulse mr-1">&gt;</span> try clicking
            <div className="absolute -top-1 left-4 w-2 h-2 bg-black/80 border-t border-l border-white/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

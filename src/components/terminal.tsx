"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Square } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TerminalLine {
  id: number;
  type: "system" | "prompt" | "output" | "error" | "success" | "info";
  text: string;
  href?: string;
}

const GITHUB_USERNAME = "akshatsri3";

// ─── Boot sequence ────────────────────────────────────────────────────────────
const BOOT_LINES = [
  { text: "Initializing system...", delay: 0 },
  { text: "Loading portfolio...", delay: 600 },
  { text: "Mounting file system...", delay: 1100 },
  { text: "Access granted. Welcome.", delay: 1700 },
  { text: 'Type "help" to see available commands.', delay: 2300 },
];

import { fetchGithubRepos, formatTimeAgo } from "@/lib/github";

// ─── Command registry ─────────────────────────────────────────────────────────
type CommandOutput = TerminalLine[];
type CommandHandler = (args: string[]) => CommandOutput | Promise<CommandOutput>;

function buildOutput(
  lines: { type: TerminalLine["type"]; text: string; href?: string }[]
): CommandOutput {
  return lines.map((l, i) => ({ id: Date.now() + i, ...l }));
}

const COMMANDS: Record<string, CommandHandler> = {
  help: () =>
    buildOutput([
      { type: "info", text: "┌─────────────────────────────────────────┐" },
      { type: "info", text: "│          Available Commands              │" },
      { type: "info", text: "├─────────────────────────────────────────┤" },
      { type: "success", text: "  whoami      →  About me" },
      { type: "success", text: "  skills      →  Tech stack & tools" },
      { type: "success", text: "  projects    →  Navigate to projects" },
      { type: "success", text: "  contact     →  Navigate to contact" },
      { type: "success", text: "  resume      →  Download my resume" },
      { type: "success", text: "  current     →  What I'm building now" },
      { type: "success", text: "  open [repo] →  Open a GitHub repository" },
      { type: "success", text: "  clear       →  Clear terminal" },
      { type: "info", text: "└─────────────────────────────────────────┘" },
    ]),

  whoami: () =>
    buildOutput([
      { type: "info", text: "┌─────────────────────────────────────────┐" },
      { type: "info", text: "│                akshat.sh                 │" },
      { type: "info", text: "└─────────────────────────────────────────┘" },
      { type: "output", text: "  Name     :  Akshat Srivastava" },
      { type: "output", text: "  Role     :  Full-Stack Developer" },
      { type: "output", text: "  Location :  India  🇮🇳" },
      { type: "output", text: "  Focus    :  Building things that matter" },
      { type: "output", text: "  Hobby    :  Photography · Travel · Space" },
      { type: "output", text: "" },
      {
        type: "success",
        text: "  An artist in spirit, a seeker by nature.",
      },
    ]),

  skills: () =>
    buildOutput([
      { type: "info", text: "$ cat skills.json" },
      { type: "output", text: "" },
      { type: "success", text: "  Frontend   →  React · Next.js · TypeScript · Tailwind" },
      { type: "success", text: "  Backend    →  Node.js · Express · Python · REST APIs" },
      { type: "success", text: "  Mobile     →  React Native · Expo" },
      { type: "success", text: "  AI / ML    →  OpenCV · MediaPipe · TensorFlow" },
      { type: "success", text: "  Database   →  PostgreSQL · Supabase · Firebase" },
      { type: "success", text: "  Tools      →  Git · Docker · Figma · Vercel" },
    ]),

  projects: () =>
    buildOutput([
      { type: "system", text: "$ scrolling to projects..." },
      { type: "success", text: "  ✓ Navigating to #projects" },
    ]),

  contact: () =>
    buildOutput([
      { type: "system", text: "$ opening contact..." },
      { type: "success", text: "  ✓ Navigating to #contact" },
    ]),

  resume: () =>
    buildOutput([
      { type: "system", text: "$ डाउनलोडिंग resume..." },
      { type: "output", text: "  [██████████████████████] 100%" },
      { type: "success", text: "  ✓ resume.pdf downloaded successfully" },
    ]),

  current: async () => {
    try {
      const repos = await fetchGithubRepos(GITHUB_USERNAME);
      const topRepos = repos.slice(0, 4);
      
      const outputLines = [
        { type: "info" as const, text: `$ fetching latest work from @${GITHUB_USERNAME}...` },
        { type: "output" as const, text: "" },
      ];

      topRepos.forEach(repo => {
        outputLines.push({
          type: "success" as const,
          text: `  ✔ ${repo.name.padEnd(20)} (updated ${formatTimeAgo(repo.updated_at)})`,
          href: repo.html_url
        });
      });

      outputLines.push({ type: "output" as const, text: "" });
      outputLines.push({ type: "info" as const, text: "  Type 'open <repo-name>' to explore more." });

      return buildOutput(outputLines);
    } catch (error) {
      return buildOutput([
        { type: "error", text: "  Unable to fetch latest projects. Please try again later." }
      ]);
    }
  },

  open: async (args) => {
    if (args.length === 0) {
      return buildOutput([{ type: "error", text: "  Usage: open <repo-name>" }]);
    }
    const repoName = args[0].toLowerCase();
    try {
      const repos = await fetchGithubRepos(GITHUB_USERNAME);
      const repo = repos.find(r => r.name.toLowerCase() === repoName);
      if (repo) {
        window.open(repo.html_url, "_blank");
        return buildOutput([{ type: "success", text: `  ✓ Opening ${repo.name}...` }]);
      } else {
        return buildOutput([{ type: "error", text: `  Repository '${repoName}' not found.` }]);
      }
    } catch (error) {
      return buildOutput([{ type: "error", text: "  An error occurred. Please try again later." }]);
    }
  },

  "sudo access-akshat": () =>
    buildOutput([
      { type: "system", text: "$ sudo access-akshat" },
      { type: "output", text: "  [sudo] password for akshat: ••••••••" },
      { type: "output", text: "" },
      { type: "success", text: "  ✦  Root access granted." },
      { type: "output", text: "" },
      {
        type: "info",
        text: '  "Doing my part — the rest unfolds."',
      },
      { type: "output", text: "                              — Akshat" },
    ]),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
let lineCounter = 1000;
const uid = () => ++lineCounter;

// ─── Main Component ───────────────────────────────────────────────────────────
interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Terminal({ isOpen, onClose }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [isBooting, setIsBooting] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, ox: 0, oy: 0 });

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Boot sequence ────────────────────────────────────────────────────────
  const runBoot = useCallback(() => {
    setLines([]);
    setIsBooting(true);
    BOOT_LINES.forEach(({ text, delay }) => {
      setTimeout(() => {
        setLines((prev) => [
          ...prev,
          { id: uid(), type: "system", text },
        ]);
        if (delay === BOOT_LINES[BOOT_LINES.length - 1].delay) {
          setIsBooting(false);
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }, delay);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPos({ x: 0, y: 0 });
      setIsMinimized(false);
      runBoot();
    }
  }, [isOpen, runBoot]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  // ── Keyboard: Escape to close ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── Run command ──────────────────────────────────────────────────────────
  const runCommand = useCallback(
    async (raw: string) => {
      const parts = raw.trim().split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      if (!cmd) return;

      // echo the prompt line
      setLines((prev) => [
        ...prev,
        { id: uid(), type: "prompt", text: raw.trim() },
      ]);
      setHistory((h) => [raw.trim(), ...h]);
      setHistoryIdx(-1);

      if (cmd === "clear") {
        setLines([]);
        return;
      }

      const handler = COMMANDS[cmd];
      if (!handler) {
        setLines((prev) => [
          ...prev,
          {
            id: uid(),
            type: "error",
            text: `  bash: ${cmd}: command not found. Type "help" for available commands.`,
          },
        ]);
        return;
      }

      // Handle async commands with loading state
      let output: CommandOutput;
      if (cmd === "current") {
        const loadingId = uid();
        setLines((prev) => [
          ...prev,
          { id: loadingId, type: "system", text: "  Fetching latest work..." },
        ]);
        
        output = await handler(args);
        
        setLines((prev) => prev.filter(l => l.id !== loadingId).concat(output));
      } else {
        output = await handler(args);
        setLines((prev) => [...prev, ...output]);
      }

      // side-effects
      if (cmd === "projects") {
        setTimeout(() => {
          onClose();
          document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
        }, 600);
      }
      if (cmd === "contact") {
        setTimeout(() => {
          onClose();
          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
        }, 600);
      }
      if (cmd === "resume") {
        setTimeout(() => {
          const a = document.createElement("a");
          a.href = "/resume.pdf";
          a.download = "Akshat_Srivastava_Resume.pdf";
          a.click();
        }, 1000);
      }
    },
    [onClose]
  );

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
    setInput("");
  };

  // ── History navigation ───────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(next);
      setInput(history[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(historyIdx - 1, -1);
      setHistoryIdx(next);
      setInput(next === -1 ? "" : history[next]);
    }
  };

  // ── Dragging ─────────────────────────────────────────────────────────────
  const startDrag = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y });
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => {
      setPos({
        x: dragStart.ox + e.clientX - dragStart.mx,
        y: dragStart.oy + e.clientY - dragStart.my,
      });
    };
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging, dragStart]);

  // ── Line colors ───────────────────────────────────────────────────────────
  const lineClass = (type: TerminalLine["type"]) => {
    switch (type) {
      case "system":  return "text-blue-400/80";
      case "prompt":  return "text-emerald-400";
      case "success": return "text-emerald-300";
      case "error":   return "text-red-400";
      case "info":    return "text-violet-400/90";
      default:        return "text-neutral-300";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Terminal window */}
          <motion.div
            key="terminal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            style={{ x: pos.x, y: pos.y }}
            className="fixed z-[90] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(680px,calc(100vw-32px))]"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
              style={{
                background: "rgba(9, 9, 16, 0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(24px)",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(100,80,255,0.07)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title bar */}
              <div
                className="flex items-center gap-2 px-4 py-3 select-none cursor-grab active:cursor-grabbing"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseDown={startDrag}
              >
                {/* Traffic lights */}
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors group flex items-center justify-center"
                  aria-label="Close"
                >
                  <X size={7} className="opacity-0 group-hover:opacity-100 text-red-900" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMinimized((v) => !v); }}
                  className="w-3 h-3 rounded-full bg-yellow-400/80 hover:bg-yellow-400 transition-colors group flex items-center justify-center"
                  aria-label="Minimize"
                >
                  <Minus size={7} className="opacity-0 group-hover:opacity-100 text-yellow-900" />
                </button>
                <button
                  className="w-3 h-3 rounded-full bg-emerald-500/40 cursor-default"
                  aria-label="Maximize (disabled)"
                >
                  <Square size={7} className="opacity-0" />
                </button>

                {/* Tab label */}
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-xs text-neutral-500 font-mono tracking-wider">
                    akshat@portfolio:~
                  </span>
                </div>

                {/* Keyboard hint */}
                <span className="text-[10px] text-neutral-600 font-mono hidden sm:block">
                  esc to close
                </span>
              </div>

              {/* Body */}
              <AnimatePresence initial={false}>
                {!isMinimized && (
                  <motion.div
                    key="body"
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {/* Output area */}
                    <div className="h-72 overflow-y-auto px-5 py-4 font-mono text-sm leading-relaxed custom-scrollbar">
                      {lines.map((line) => (
                        <div key={line.id} className="flex gap-2 min-h-[1.4em]">
                          {line.type === "prompt" && (
                            <span className="text-violet-400 shrink-0 select-none">
                              ❯
                            </span>
                          )}
                          {line.href ? (
                            <a 
                              href={line.href} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`${lineClass(line.type)} hover:underline decoration-violet-500/50 underline-offset-4 cursor-pointer transition-all duration-200 hover:text-white`}
                            >
                              {line.text}
                            </a>
                          ) : (
                            <span className={lineClass(line.type)}>{line.text}</span>
                          )}
                        </div>
                      ))}
                      {/* Blinking idle cursor */}
                      {isBooting && (
                        <span className="inline-block w-2 h-[1em] bg-emerald-400/80 animate-pulse ml-1 translate-y-[0.15em]" />
                      )}
                      <div ref={endRef} />
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} />

                    {/* Input row */}
                    <form
                      onSubmit={handleSubmit}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <span className="text-violet-400 font-mono text-sm select-none shrink-0">
                        ❯
                      </span>
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isBooting}
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        placeholder={isBooting ? "" : "type a command..."}
                        className="flex-1 bg-transparent outline-none text-sm font-mono text-neutral-100 caret-violet-400 placeholder:text-neutral-600 disabled:opacity-40"
                        aria-label="Terminal input"
                      />
                      {/* Blinking cursor when empty */}
                      {!isBooting && input === "" && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="w-[7px] h-[13px] bg-violet-400/70 rounded-sm shrink-0"
                        />
                      )}
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

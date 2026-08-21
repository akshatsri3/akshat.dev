"use client";

import React from "react";
import { Timeline } from "@/components/ui/timeline";

export function Experience() {
  const data = [
    {
      title: "2026 – Present",
      content: (
        <div className="space-y-4">
          <p className="text-sm md:text-base font-normal text-neutral-800 dark:text-neutral-200 leading-relaxed">
            Final year student at <span className="font-semibold text-primary">VIT-Chennai</span>.
            Focused on advanced SAR remote sensing research and architecting intelligent, high-impact systems.
          </p>
          <ul className="space-y-2 translate-y-[-4px]">
            {[
              "Researching multi-temporal SAR imagery & machine learning for land cover change detection.",
              "Architecting enterprise knowledge retrieval (RAG) platforms and intelligent doc pipelines.",
              "Building stealth developer tooling and high-impact full-stack solutions."
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {["SAR & ML", "RAG Systems", "Next.js", "Vector DBs", "Full-Stack"].map((tech) => (
              <span key={tech} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary/10 rounded-md text-primary">
                {tech}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "2024 – 2026",
      content: (
        <div className="space-y-4">
          <p className="text-sm md:text-base font-normal text-neutral-800 dark:text-neutral-200 leading-relaxed">
            App Development Lead at <span className="font-semibold text-primary">HackClub VIT-Chennai</span>.
            Mentored a 50–60 member team across engineering initiatives and spearheaded community-driven software.
          </p>
          <ul className="space-y-2 translate-y-[-4px]">
            {[
              "Published 'VInhance' for VTOP on the Chrome Web Store, reaching 200+ installs.",
              "Engineered full-stack applications including Expensify with OCR-assisted tracking.",
              "Coordinated architecture and delivery of community tools used across campus."
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {["Next.js", "React Native", "TypeScript", "Node.js", "MongoDB"].map((tech) => (
              <span key={tech} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary/10 rounded-md text-primary">
                {tech}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "2023 – 2024",
      content: (
        <div className="space-y-4">
          <p className="text-sm md:text-base font-normal text-neutral-800 dark:text-neutral-200 leading-relaxed">
            Started the journey at <span className="font-semibold text-primary">VIT-Chennai</span>. Immersed in computer science fundamentals, full-stack architecture, and competitive hackathons.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Data Structures", "Java", "Python", "Web Foundations"].map((tech) => (
              <span key={tech} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary/10 rounded-md text-primary">
                {tech}
              </span>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="experience" className="relative w-full overflow-hidden">
      <Timeline data={data} />
    </section>
  );
}

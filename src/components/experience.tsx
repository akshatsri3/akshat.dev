"use client";

import React from "react";
import { Timeline } from "@/components/ui/timeline";

export function Experience() {
  const data = [
    {
      title: "2026",
      content: (
        <div className="space-y-4">
          <p className="text-sm md:text-base font-normal text-neutral-800 dark:text-neutral-200 leading-relaxed">
            Currently a 3rd year student at <span className="font-semibold text-primary">VIT-Chennai</span>.
            Focused on mastering full-stack development and exploring AI integration.
          </p>
          <ul className="space-y-2 translate-y-[-4px]">
            {[
              "Built and deployed a premium minimalist personal portfolio.",
              "Developing 'VInhance' - a productivity extension for VIT's VTOP.",
              "Building a streamlined productivity app tailored for student workflows."
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: "2025",
      content: (
        <div className="space-y-4">
          <p className="text-sm md:text-base font-normal text-neutral-800 dark:text-neutral-200 leading-relaxed">
            Leading the App Development efforts at <span className="font-semibold text-primary">Hackclub VIT-Chennai</span>.
            Coordinating team projects and mentoring new members in mobile and web development.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Next.js", "React Native", "TypeScript", "UI-UX"].map((tech) => (
              <span key={tech} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary/10 rounded-md text-primary">
                {tech}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "2023-24",
      content: (
        <div className="space-y-4">
          <p className="text-sm md:text-base font-normal text-neutral-800 dark:text-neutral-200 leading-relaxed">
            Started the journey at VIT-Chennai. Immersed in the world of application development and competitive programming.
            Active participant in regional hackathons and tech symposiums.
          </p>
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

"use client";

import { motion } from "framer-motion";
import { Section } from "./section";
import {
  Code2,
  Layout,
  Database,
  Server,
  Smartphone,
  Wand2,
  Github,
  Zap,
  WavesLadder
} from "lucide-react";

const skillCategories = [
  {
    title: "Frontend",
    icon: <Layout className="size-6 text-primary" />,
    skills: ["React", "Next.js", "JavaScript", "TypeScript", "Tailwind CSS", "Streamlit Ui"],
  },
  {
    title: "Backend",
    icon: <Server className="size-6 text-primary" />,
    skills: ["Node.js", "Express", "Flask", "REST APIs"],
  },
  {
    title: "Database & DevOps",
    icon: <Database className="size-6 text-primary" />,
    skills: ["PostgreSQL", "MongoDB", "Docker", "AWS", "CI/CD"],
  },
  {
    title: "Tools & Design",
    icon: <Wand2 className="size-6 text-primary" />,
    skills: ["Git", "Postman", "Vercel", "Matlab"],
  },
  {
    title: "Programming Languages",
    icon: <Code2 className="size-6 text-primary" />,
    skills: ["Java", "C/C++", "Python", "JavaScript", "TypeScript",],
  },
];

export function Skills() {
  return (
    <Section id="skills">
      <div className="mb-12">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Technical Skills</h2>
        <p className="text-muted-foreground text-lg max-w-2xl">
          The technologies and tools I use to bring ideas to life, from frontend to backend.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {skillCategories.map((category, i) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 group"
          >
            <div className="mb-4 p-3 bg-primary/15 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
              {category.icon}
            </div>
            <h3 className="text-xl font-bold mb-4">{category.title}</h3>
            <ul className="space-y-2">
              {category.skills.map((skill) => (
                <li key={skill} className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  <div className="size-1.5 rounded-full bg-primary/60" />
                  {skill}
                </li>
              ))}
            </ul>
          </motion.div>

        ))}
      </div>
    </Section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Section } from "./section";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";

const projects = [
  {
    title: "VInhance",
    description: "An extension made for VIT's VTOP for better user-experience.",
    image: "/assets/project/vinhance.png",
    tags: ["HTML", "CSS", "JavaScript", "UI-UX"],
    github: "https://github.com/VInhance/vinhance-web",
    demo: "https://chromewebstore.google.com/detail/kdpkhnlloacadjadmepfnpdliglafaaf?utm_source=item-share-cb",
  },
  {
    title: "Expenisfy",
    description: "An app built to track your expenses and income.",
    image: "/assets/project/expensify.png",
    tags: ["React Native", "Firebase", "Shadcn-UI", "NodeJs"],
    github: "https://github.com/akshatsri3/Expensify_App",

  },
];

export function Projects() {
  return (
    <Section id="projects">
      <div className="mb-12">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Featured Projects</h2>
        <p className="text-muted-foreground text-lg max-w-2xl">
          A selection of my favorite works, ranging from apps to websites to extensions all built with only one intent,
          making life easier and productive!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300"
          >
            <div className="aspect-video relative overflow-hidden">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-background/20 backdrop-blur-md rounded-full hover:bg-background/40 transition-colors"
                >
                  <Github className="size-5" />
                </a>
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-background/20 backdrop-blur-md rounded-full hover:bg-background/40 transition-colors"
                >
                  <ExternalLink className="size-5" />
                </a>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary/10 rounded-md text-primary">
                    {tag}
                  </span>
                ))}

              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

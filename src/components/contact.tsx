"use client";

import { motion } from "framer-motion";
import { Section } from "./section";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, ArrowUpRight, Instagram } from "lucide-react";

export function Contact() {
  return (
    <Section id="contact" className="bg-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">Let's Connect !</h2>
          <p className="text-muted-foreground text-xl mb-10">
            Have anything in mind contact me. I reply faster than my code compiles..
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <a href="mailto:akshatsri.work@gmail.com" className="w-full sm:w-auto">
            <Button size="xl" className="w-full sm:w-auto rounded-full px-10 gap-3 text-lg group shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
              <Mail className="size-5 text-primary-foreground" />
              Send an Email
              <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 pt-10 border-t border-border/50 flex flex-wrap justify-center gap-x-12 gap-y-6 text-sm text-muted-foreground"
        >
          <a href="https://github.com/akshatsri3" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1 group">
            GitHub <ArrowUpRight className="size-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a href="https://www.linkedin.com/in/akshatsri3/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1 group">
            LinkedIn <ArrowUpRight className="size-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a href="https://x.com/akshats50627406" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1 group">
            Twitter <ArrowUpRight className="size-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a href="https://www.instagram.com/akshatsri.3/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1 group">
            Instagram <ArrowUpRight className="size-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a href="mailto:akshatsri.work@gmail.com" className="hover:text-primary transition-colors flex items-center gap-1 group">
            Email <ArrowUpRight className="size-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>

      </div>
    </Section>
  );
}

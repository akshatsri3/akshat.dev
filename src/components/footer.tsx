"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Github, Linkedin, Twitter, Mail, Instagram } from "lucide-react";
import { adminLogin } from "@/lib/blog-store";
import Link from "next/link";

export function Footer() {
  const [clicks, setClicks] = useState(0);
  const pathname = usePathname();

  const handleAdminCheck = () => {
    if (!pathname?.startsWith("/blog")) return;
    const newClicks = clicks + 1;
    if (newClicks >= 3) {
      setClicks(0);
      const pass = window.prompt("Enter admin passcode:");
      if (pass && adminLogin(pass)) {
        window.location.reload();
      }
    } else {
      setClicks(newClicks);
      // Reset clicks after 2 seconds of inactivity
      setTimeout(() => setClicks(0), 2000);
    }
  };

  return (
    <footer className="border-t border-border/50 py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-left">
          <p 
            className="text-sm text-muted-foreground cursor-pointer select-none"
            onClick={handleAdminCheck}
          >
            © {new Date().getFullYear()} Akshat Srivastava.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Built with ❤️ from Prayagraj.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Link href="https://github.com/akshatsri3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Github size={20} />
          </Link>
          <Link href="https://www.linkedin.com/in/akshatsri3/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Linkedin size={20} />
          </Link>
          <Link href="https://x.com/akshats50627406" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Twitter size={20} />
          </Link>
          <Link href="https://www.instagram.com/akshatsri.3/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Instagram size={20} />
          </Link>
          <Link href="mailto:akshatsri.work@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
            <Mail size={20} />
          </Link>
        </div>
      </div>
    </footer>
  );
}

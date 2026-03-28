"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Navbar as ResizableNavbar, 
  NavBody, 
  NavItems, 
  MobileNav, 
  NavbarLogo, 
  NavbarButton, 
  MobileNavHeader, 
  MobileNavToggle, 
  MobileNavMenu 
} from "@/components/ui/resizable-navbar";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { name: "About Me", link: "/about" },
  { name: "Clicks", link: "/clicks" },
  { name: "Projects", link: "/#projects" },
  { name: "Experience", link: "/#experience" },
  { name: "Skills", link: "/#skills" },
  { name: "Contact", link: "/#contact" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ResizableNavbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navLinks} />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NavbarButton href="/blog" variant="secondary">
            My Blogs
          </NavbarButton>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          <div className="flex flex-col gap-4 py-4 border-t border-white/5">
            {navLinks.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-neutral-400 hover:text-white transition-colors px-2"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex w-full flex-col gap-3 pt-4 border-t border-white/5">
            <NavbarButton
              href="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
              variant="secondary"
              className="w-full"
            >
              My Blogs
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogoLockup } from "@/components/ui/logo";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "Leaderboard", href: "/#leaderboard" },
  { name: "Pricing", href: "/#pricing" },
  { name: "FAQ", href: "/#faq" },
  { name: "UI Post-UTME", href: "/ui-post-utme" },
  { name: "Blog", href: "/blog" },
];

export function MarketingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Add slight background and border when not at the very top
      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100 && !isMobileMenuOpen) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out",
          isVisible ? "translate-y-0" : "-translate-y-full",
          isScrolled || isMobileMenuOpen
            ? "border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        {/* Announcement Banner */}
        <div className="bg-gradient-to-r from-[#e09040] via-[#f5c890] to-[#c06830] text-[#09090b] text-[11px] md:text-xs font-bold py-2 px-5 text-center flex items-center justify-center gap-2 relative z-50">
          <span>⚡ UI Post-UTME 2026 Form is officially OUT! Registration runs June 22 to July 19.</span>
          <a href="/blog/ui-post-utme-registration" className="underline hover:text-black/80 font-extrabold shrink-0">
            Read Guide & Apply →
          </a>
        </div>

        <div className="mx-auto flex h-16 md:h-20 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-8">
            <a href="/" className="relative z-50">
              <LogoLockup responsiveSize={{ mobile: "sm", tablet: "md", desktop: "lg" }} />
            </a>
            
            {/* Desktop Links */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-white/50 transition-colors hover:text-[#e09040]"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" href="/login">
                Sign in
              </Button>
              <Button asChild size="sm" href="/signup">
                Get started
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#09090b]/95 backdrop-blur-2xl transition-all duration-500 ease-in-out lg:hidden",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div 
          className={cn(
            "flex h-full flex-col justify-center px-8 transition-transform duration-500 delay-100",
            isMobileMenuOpen ? "translate-y-0" : "translate-y-8"
          )}
        >
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-bold tracking-tight text-white/70 transition-colors hover:text-[#e09040]"
              >
                {link.name}
              </a>
            ))}
            <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-8 sm:hidden">
              <Button asChild variant="secondary" size="lg" href="/login" className="w-full">
                Sign in
              </Button>
              <Button asChild size="lg" href="/signup" className="w-full">
                Get started free
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

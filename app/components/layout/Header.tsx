"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

import MobileMenu from "../ui/MobileMenu";
import LanguageSwitch from "../ui/LanguageSwitch";
import NavItem from "../ui/NavItem";
import { useLanguage } from "@/app/context/LanguageContext";
import { en, pt } from "@/app/i18n";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { locale } = useLanguage();
  const dict = locale === "en" ? en : pt;

  const navItems = [
    { label: dict.header.nav.about, sectionId: "ocean-path" },
    { label: dict.header.nav.skills, sectionId: "skills" },
    { label: dict.header.nav.contact, sectionId: "site-footer" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 border border-(--color-header-border) transition-colors duration-300"
      style={{
        background: scrolled
          ? "rgba(2, 8, 26, 0.88)"
          : "var(--color-header-bg)",
        backdropFilter: scrolled ? "blur(12px)" : "blur(4px)",
      }}
    >
      <nav className="container py-4 mx-auto px-4 sm:px-6 flex items-center justify-between">
        <h1>
          <a href="#" aria-label={dict.header.logoAriaLabel}>
            <Image
              src="/logo.svg"
              alt="Raul Albuquerque Logo"
              width={60}
              height={26}
              className="hover:opacity-80"
            />
          </a>
        </h1>

        <ul className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavItem key={item.label} label={item.label} sectionId={item.sectionId} />
          ))}
        </ul>

        <div className="hidden md:block">
          <LanguageSwitch />
        </div>

        <button
          className="md:hidden text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={dict.header.menuAriaLabel}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {menuOpen && (
        <MobileMenu items={navItems} onClose={() => setMenuOpen(false)} />
      )}
    </header>
  );
}

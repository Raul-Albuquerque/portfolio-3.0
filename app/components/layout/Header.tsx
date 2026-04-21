"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import MobileMenu from "../ui/MobileMenu";
import LanguageSwitch from "../ui/LanguageSwitch";
import NavItem from "../ui/NavItem";

const navItems = ["Sobre", "Habilidades", "Experiência", "Contato"];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-(--color-header-bg) border border-(--color-header-border) md:px-0 px-1.5">
      <nav className="container py-4 mx-auto flex items-center justify-between">
        <h1>
          <a href="#" aria-label="Ir para o topo">
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
            <NavItem key={item} label={item} />
          ))}
        </ul>

        <div className="hidden md:block">
          <LanguageSwitch />
        </div>

        <button
          className="md:hidden text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
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

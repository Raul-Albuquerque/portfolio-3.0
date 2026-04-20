"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import LanguageSwitch from "./LanguageSwitch";

const navItems = ["Sobre", "Habilidades", "Experiência", "Contato"];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-(--color-header-bg) border border-(--color-header-border) md:px-0 px-1.5">
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

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <li key={item}>
              <button className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none text-sm">
                {item}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <LanguageSwitch />
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-(--color-header-border) px-4 pb-4">
          <ul className="flex flex-col gap-1 pt-3">
            {navItems.map((item) => (
              <li key={item}>
                <button
                  className="w-full text-right text-gray-500 hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none py-2 text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
          <div className="pt-3 border-t border-(--color-header-border) flex justify-end mt-2">
            <LanguageSwitch />
          </div>
        </div>
      )}
    </header>
  );
}

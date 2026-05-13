"use client";

import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";
import { en, pt } from "@/app/i18n";

// Number assembled at runtime to avoid static bot scraping
function buildWhatsAppUrl() {
  const parts = ["55", "81", "99708", "0397"];
  return `https://wa.me/${parts.join("")}`;
}

export default function Footer() {
  const { locale } = useLanguage();
  const dict = locale === "en" ? en : pt;
  const navLinks = [
    { label: dict.header.nav.about, sectionId: "ocean-path" },
    { label: dict.header.nav.skills, sectionId: "skills" },
  ];

  return (
    <footer id="site-footer" className="border-t border-(--color-header-border) bg-(--color-bg)">
      <div className="container mx-auto px-6 sm:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8">

          {/* Coluna 1 — Logo + tagline */}
          <div className="flex flex-col gap-4">
            <a href="#" aria-label={dict.header.logoAriaLabel}>
              <Image
                src="/logo.svg"
                alt="Raul Albuquerque Logo"
                width={60}
                height={26}
                className="hover:opacity-80 transition-opacity"
              />
            </a>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs sm:max-w-none lg:max-w-xs">
              {dict.footer.tagline}
            </p>
          </div>

          {/* Coluna 2 — Links úteis */}
          <div className="flex flex-col gap-4">
            <h3 className="text-gray-300 text-sm font-medium">
              {dict.footer.links.title}
            </h3>
            <ul className="flex flex-col gap-2">
              {navLinks.map(({ label, sectionId }) => (
                <li key={label}>
                  <button
                    className="text-gray-500 hover:text-gray-300 transition-colors text-sm bg-transparent border-none cursor-pointer p-0"
                    onClick={() => {
                      const el = document.getElementById(sectionId);
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3 — Contato */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <h3 className="text-gray-300 text-sm font-medium">
              {dict.footer.contact.title}
            </h3>
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/in/dev-raul-albuquerque/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <Image
                  src="/linkedin.svg"
                  alt="LinkedIn"
                  width={20}
                  height={20}
                  className="opacity-60 hover:opacity-80 transition-opacity"
                />
              </a>
              <a
                href="https://github.com/Raul-Albuquerque"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <Image
                  src="/github.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="opacity-60 hover:opacity-80 transition-opacity"
                />
              </a>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <Image
                  src="/whatsapp.svg"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                  className="opacity-60 hover:opacity-80 transition-opacity"
                />
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

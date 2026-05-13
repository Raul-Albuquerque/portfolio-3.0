"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

const languages = [
  { code: "pt-br" as const, label: "Português", flag: "/brazil-flag.svg" },
  { code: "en" as const, label: "English", flag: "/us-flag.svg" },
];

export default function LanguageSwitch() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === locale)!;

  function select(code: "pt-br" | "en") {
    setLocale(code);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Image
          src={currentLang.flag}
          alt={currentLang.label}
          width={24}
          height={16}
        />
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""} text-gray-400`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 w-40 rounded-md shadow-lg z-50 bg-[#0E1220] border border-[rgba(214,225,249,0.15)]"
        >
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                role="option"
                aria-selected={locale === lang.code}
                onClick={() => select(lang.code)}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-black/10 cursor-pointer"
              >
                <Image
                  src={lang.flag}
                  alt={lang.label}
                  width={24}
                  height={16}
                />
                <span className="text-gray-500">{lang.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

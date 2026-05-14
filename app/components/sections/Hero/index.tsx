"use client";
import dynamic from "next/dynamic";

import { surgena } from "@/app/fonts";
import Button from "../../ui/Button";
import { useLanguage } from "@/app/context/LanguageContext";
import { en, pt } from "@/app/i18n";

const SharkCanvas = dynamic(() => import("./SharkCanvas"), { ssr: false });

export default function Hero() {
  const { locale } = useLanguage();
  const dict = locale === "en" ? en : pt;

  return (
    <section className="relative w-full h-dvh overflow-hidden">
      <SharkCanvas />

      <article className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 sm:px-8">
        <h3
          className={`${surgena.className} text-gray-500 text-lg sm:text-2xl md:text-3xl mb-3 md:mb-4`}
        >
          {dict.hero.name}
        </h3>
        <h2
          className={`${surgena.className} text-4xl sm:text-6xl md:text-8xl bg-linear-to-r from-(--color-gradient-from) to-(--color-gradient-to) bg-clip-text text-transparent max-w-205 mb-5 md:mb-4 leading-tight`}
        >
          {dict.hero.role}
        </h2>
        <Button
          text={dict.hero.cta}
          theme="hero"
          onClick={() => {
            const el = document.getElementById("skills");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </article>
    </section>
  );
}

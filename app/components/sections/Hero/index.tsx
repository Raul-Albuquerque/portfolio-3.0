"use client";
import dynamic from "next/dynamic";

import { surgena } from "@/app/fonts";
import Button from "../../ui/Button";
import { useLanguage } from "@/app/context/LanguageContext";

const SharkCanvas = dynamic(() => import("./SharkCanvas"), { ssr: false });

export default function Hero() {
  const { dict } = useLanguage();

  return (
    <section className="relative w-full h-dvh overflow-hidden">
      <SharkCanvas />

      <article className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h3
          className={`${surgena.className} text-gray-500 text-2xl md:text-3xl mb-4`}
        >
          {dict.hero.name}
        </h3>
        <h2
          className={`${surgena.className} text-6xl md:text-8xl bg-linear-to-r from-(--color-gradient-from) to-(--color-gradient-to) bg-clip-text text-transparent max-w-137.5 mb-4`}
        >
          {dict.hero.role}
        </h2>
        <Button
          text={dict.hero.cta}
          theme="hero"
          onClick={() => console.log("clicado")}
        />
      </article>
    </section>
  );
}

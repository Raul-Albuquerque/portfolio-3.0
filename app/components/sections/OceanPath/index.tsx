"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { surgena } from "@/app/fonts";
import useScrollProgress from "./useScrollProgress";
import { useLanguage } from "@/app/context/LanguageContext";
import { en, pt } from "@/app/i18n";

const OceanCanvas = dynamic(() => import("./OceanCanvas"), { ssr: false });
const MobileFallback = dynamic(() => import("./MobileFallback"), { ssr: false });

export type Milestone = {
  key: string;
  time: string;
  title: string;
  description: string;
  region?: string;
};

const MILESTONE_KEYS = [
  "military",
  "law_school",
  "transition",
  "software_college",
  "freelancer",
  "siberia",
  "voluntary",
  "machlev",
  "freelancer_two",
] as const;

export default function OceanPath() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useScrollProgress(scrollContainerRef);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { locale } = useLanguage();
  const dict = locale === "en" ? en : pt;

  const milestones: Milestone[] = MILESTONE_KEYS.map((key) => {
    const card = dict.milestones.milestones_cards[key];
    return {
      key,
      time: card.date,
      region: card.region,
      title: card.title,
      description: card.description,
    };
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section id="ocean-path">
      <div
        className="px-6 sm:px-8 pt-16 sm:pt-20 md:pt-24 pb-8 text-center"
        style={{ background: "var(--color-bg)" }}
      >
        <p
          className="text-xs tracking-widest uppercase mb-4"
          style={{ color: "rgba(96,239,255,0.6)" }}
        >
          {dict.milestones.subtitle}
        </p>
        <h2
          className={`${surgena.className} text-3xl sm:text-5xl md:text-7xl mb-4 leading-tight`}
          style={{
            background: "linear-gradient(to right, #0061FF, #60EFFF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {dict.milestones.title}
        </h2>
        <p
          className="mx-auto max-w-sm sm:max-w-md text-sm mb-2 px-2"
          style={{ color: "rgba(148,163,184,0.7)" }}
        >
          {dict.milestones.text}
        </p>
        <p
          className="mx-auto max-w-xs text-xs"
          style={{ color: "rgba(96,239,255,0.4)", letterSpacing: "0.05em" }}
        >
          {dict.milestones.scrollCta}
        </p>
      </div>

      {prefersReducedMotion || isMobile ? (
        <MobileFallback milestones={milestones} />
      ) : (
        <div
          ref={scrollContainerRef}
          className="relative"
          style={{ height: "500vh" }}
        >
          <div className="sticky top-0 h-screen w-full">
            <OceanCanvas milestones={milestones} progressRef={progressRef} />

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
              <div
                className="h-12 w-px animate-pulse"
                style={{
                  background: "linear-gradient(to bottom, rgba(96,239,255,0.4), transparent)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

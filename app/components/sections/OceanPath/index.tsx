"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { surgena } from "@/app/fonts";
import { useLanguage } from "@/app/context/LanguageContext";
import useScrollProgress from "./useScrollProgress";

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
  const { dict } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useScrollProgress(scrollContainerRef);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const milestones: Milestone[] = MILESTONE_KEYS.map((key) => {
    const card = dict.milestones.milestones_cards[key];
    return {
      key,
      time: card.date,
      title: card.title,
      description: card.description,
      region: card.region,
    };
  });

  return (
    <section id="ocean-path">
      {/* Section heading */}
      <div className="px-4 pt-24 text-center">
        <p
          suppressHydrationWarning
          className="text-xs tracking-widest uppercase mb-4"
          style={{ color: "rgba(96,239,255,0.6)" }}
        >
          {dict.milestones.subtitle}
        </p>
        <h2
          suppressHydrationWarning
          className={`${surgena.className} text-5xl md:text-7xl mb-4`}
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
          suppressHydrationWarning
          className="mx-auto max-w-md text-sm mb-2"
          style={{ color: "rgba(148,163,184,0.7)" }}
        >
          {dict.milestones.text}
        </p>
        <p
          className="mx-auto max-w-xs text-xs"
          style={{ color: "rgba(96,239,255,0.4)", letterSpacing: "0.05em" }}
        >
          ↓ scroll to dive deeper
        </p>
      </div>

      {prefersReducedMotion ? (
        <MobileFallback milestones={milestones} />
      ) : (
        <div
          ref={scrollContainerRef}
          className="relative"
          style={{ height: "500vh" }}
        >
          <div className="sticky top-0 h-screen w-full">
            <OceanCanvas milestones={milestones} progressRef={progressRef} />

            {/* Scroll pulse indicator */}
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

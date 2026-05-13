"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { skills } from "@/app/data/skills";
import SkillCard from "./SkillCard";
import { RING_CONFIGS } from "./constants";
import { surgena } from "@/app/fonts";
import { useLanguage } from "@/app/context/LanguageContext";
import { en, pt } from "@/app/i18n";

gsap.registerPlugin(ScrollTrigger);

const JellyfishCanvas = dynamic(() => import("./JellyfishCanvas"), {
  ssr: false,
});

// One extra page at the start before any ring activates
const SCROLL_PAGES = RING_CONFIGS.length + 1;
const TOTAL_RINGS = RING_CONFIGS.length;

function getActiveRingIndex(progress: number): number {
  const introBand = 1 / SCROLL_PAGES;
  if (progress < introBand) return -1;
  const ringProgress = (progress - introBand) / (1 - introBand);
  return Math.min(Math.floor(ringProgress * TOTAL_RINGS), TOTAL_RINGS - 1);
}

function SkillsMobileFallback({
  orderedSkills,
  dict,
}: {
  orderedSkills: typeof skills;
  dict: typeof en;
}) {
  const [active, setActive] = useState(0);
  const total = orderedSkills.length;

  function prev() { setActive((i) => (i - 1 + total) % total); }
  function next() { setActive((i) => (i + 1) % total); }

  const group = orderedSkills[active];
  const categoryLabel = dict.skills.categories[group.categoryID as keyof typeof dict.skills.categories];

  return (
    <section className="md:hidden px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-gray-500 text-xs tracking-widest uppercase mb-4">
          {dict.skills.eyebrow}
        </p>
        <h2 className={`${surgena.className} text-3xl sm:text-5xl bg-linear-to-r from-(--color-gradient-from) to-(--color-gradient-to) bg-clip-text text-transparent mb-4 leading-tight`}>
          {dict.skills.title}
        </h2>
        <p className="text-xs text-gray-500 max-w-xs leading-relaxed mx-auto">
          {dict.skills.subtitleMobile}
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <div
          key={group.categoryID}
          className="rounded-2xl px-4 py-6 backdrop-blur-md"
          style={{
            background: "rgba(2, 8, 28, 0.78)",
            border: "1px solid rgba(96, 239, 255, 0.2)",
            boxShadow: "0 0 32px rgba(0, 97, 255, 0.18), 0 4px 16px rgba(0,0,0,0.6)",
          }}
        >
          <p className="text-xs font-semibold mb-4 tracking-widest uppercase text-center" style={{ color: "#60efff" }}>
            {categoryLabel}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {group.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs rounded-lg px-3 py-1"
                style={{
                  background: "rgba(0, 97, 255, 0.15)",
                  border: "1px solid rgba(96, 239, 255, 0.18)",
                  color: "rgba(214, 235, 255, 0.92)",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 px-1">
          <button
            onClick={prev}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            aria-label={dict.skills.prevAriaLabel}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            {dict.skills.prevLabel}
          </button>

          <div className="flex gap-1.5">
            {orderedSkills.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`${dict.skills.dotAriaLabel} ${i + 1}`}
                className="rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  width: i === active ? "20px" : "6px",
                  height: "6px",
                  background: i === active ? "linear-gradient(to right, #0061FF, #60EFFF)" : "rgba(96,239,255,0.25)",
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            aria-label={dict.skills.nextAriaLabel}
          >
            {dict.skills.nextLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <p className="text-center text-xs mt-3" style={{ color: "rgba(96,239,255,0.4)" }}>
          {active + 1} / {total}
        </p>
      </div>
    </section>
  );
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { locale } = useLanguage();
  const dict = locale === "en" ? en : pt;

  const searchParams = useSearchParams();
  const isMkt = searchParams.get("isMkt") === "1";

  const orderedSkills = isMkt ? [...skills].reverse() : skills;

  const skillsByRingIndex = RING_CONFIGS.map(
    (cfg) => orderedSkills.find((s) => s.categoryID === cfg.categoryID)!,
  );

  const activeRingIndex = getActiveRingIndex(scrollProgress);

  const introBand = 1 / SCROLL_PAGES;
  const introOpacity = Math.max(0, 1 - scrollProgress / (introBand * 0.8));

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${(SCROLL_PAGES - 1) * 100}%`,
        pin: stickyRef.current,
        pinSpacing: true,
        scrub: 0.6,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <div id="skills">
      <SkillsMobileFallback orderedSkills={orderedSkills} dict={dict} />
      <section
        ref={sectionRef}
        style={{ height: `${SCROLL_PAGES * 100}vh` }}
        className="relative hidden md:block"
      >
        <div
          ref={stickyRef}
          className="relative w-full overflow-hidden"
          style={{ height: "100vh" }}
        >
          <div
            className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
            style={{
              height: "18vh",
              background: "linear-gradient(to bottom, #020d1a 0%, transparent 100%)",
            }}
          />

          <JellyfishCanvas
            scrollProgress={scrollProgress}
            activeRingIndex={activeRingIndex}
          />

          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-start text-center px-6 pt-20 sm:pt-24 md:pt-28 pointer-events-none select-none"
            style={{ opacity: introOpacity, transition: "opacity 0.1s linear" }}
          >
            <div className="mb-32 text-center">
              <p className="text-gray-500 text-sm tracking-widest uppercase mb-4">
                {dict.skills.eyebrow}
              </p>
              <h2
                className={`${surgena.className} text-3xl sm:text-5xl md:text-7xl bg-linear-to-r from-(--color-gradient-from) to-(--color-gradient-to) bg-clip-text text-transparent mb-4 leading-tight`}
              >
                {dict.skills.title}
              </h2>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed mx-auto">
                {dict.skills.subtitle}
              </p>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {skillsByRingIndex.map((group, i) => (
              <SkillCard
                key={group.categoryID}
                group={group}
                visible={i === activeRingIndex}
                categoryLabel={dict.skills.categories[group.categoryID as keyof typeof dict.skills.categories]}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

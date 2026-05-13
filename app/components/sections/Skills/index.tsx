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

gsap.registerPlugin(ScrollTrigger);

const JellyfishCanvas = dynamic(() => import("./JellyfishCanvas"), {
  ssr: false,
});

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Corrente Frontend",
  backend: "Corrente Backend",
  database: "Corrente de Banco de Dados",
  infra: "Corrente de Infraestrutura & Ferramentas",
  "digital-marketing": "Corrente de Marketing Digital",
};

// One extra page at the start before any ring activates
const SCROLL_PAGES = RING_CONFIGS.length + 1;
const TOTAL_RINGS = RING_CONFIGS.length;

// Derive which ring index is active from scroll progress (0–1).
// Each ring occupies an equal band. -1 = none.
function getActiveRingIndex(progress: number): number {
  // First 1/SCROLL_PAGES is the "intro" band (no card)
  const introBand = 1 / SCROLL_PAGES;
  if (progress < introBand) return -1;
  const ringProgress = (progress - introBand) / (1 - introBand);
  return Math.min(Math.floor(ringProgress * TOTAL_RINGS), TOTAL_RINGS - 1);
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const searchParams = useSearchParams();
  const isMkt = searchParams.get("isMkt") === "1";

  // Ordered skill groups based on URL param
  const orderedSkills = isMkt ? [...skills].reverse() : skills;

  // Map ordered skills to ring slots by categoryID
  const skillsByRingIndex = RING_CONFIGS.map(
    (cfg) => orderedSkills.find((s) => s.categoryID === cfg.categoryID)!,
  );

  const activeRingIndex = getActiveRingIndex(scrollProgress);

  // Fade out the intro text as the first ring band ends
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
    <section
      ref={sectionRef}
      style={{ height: `${SCROLL_PAGES * 100}vh` }}
      className="relative"
    >
      <div
        ref={stickyRef}
        className="relative w-full overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Gradient veil that blends the top edge with the Hero background colour */}
        <div
          className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
          style={{
            height: "18vh",
            background:
              "linear-gradient(to bottom, #020d1a 0%, transparent 100%)",
          }}
        />

        <JellyfishCanvas
          scrollProgress={scrollProgress}
          activeRingIndex={activeRingIndex}
        />

        {/* Intro text — fades out as the first ring activates */}
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-start text-center px-4 pt-28 pointer-events-none select-none"
          style={{ opacity: introOpacity, transition: "opacity 0.1s linear" }}
        >
          <div className="mb-32 text-center">
            <p className="text-gray-500 text-sm tracking-widest uppercase mb-4">
              SEMPRE EM MOVIMENTO
            </p>
            <h2
              className={`${surgena.className} text-5xl md:text-7xl bg-linear-to-r from-(--color-gradient-from) to-(--color-gradient-to) bg-clip-text text-transparent mb-4`}
            >
              MINHAS HABILIDADES
            </h2>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed mx-auto">
              Correntes que nunca param — role e mergulhe em cada uma
            </p>
          </div>
        </div>

        {/* Skill cards — static bottom position, one visible at a time */}
        <div className="absolute inset-0 pointer-events-none">
          {skillsByRingIndex.map((group, i) => (
            <SkillCard
              key={group.categoryID}
              group={group}
              visible={i === activeRingIndex}
              categoryLabel={CATEGORY_LABELS[group.categoryID]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

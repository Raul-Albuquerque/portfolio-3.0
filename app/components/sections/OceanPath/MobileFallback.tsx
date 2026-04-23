"use client";

import { useRef, useEffect, useState } from "react";
import type { Milestone } from "./index";

type Props = { milestones: Milestone[] };

export default function MobileFallback({ milestones }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const range = el.offsetHeight - window.innerHeight;
      if (range <= 0) { setScrollProgress(0); return; }
      setScrollProgress(Math.max(0, Math.min(1, -rect.top / range)));
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  // How far along the path the drawn line extends (0-1)
  const drawn = Math.max(0, Math.min(1, (scrollProgress - 0.05) / 0.8));
  // Airplane icon position (% from top)
  const iconTop = Math.max(0, Math.min(96, drawn * 96));
  const iconOpacity = scrollProgress < 0.05 ? 0 : scrollProgress > 0.9 ? Math.max(0, 1 - (scrollProgress - 0.9) / 0.1) : 1;

  return (
    <div ref={containerRef} className="relative px-4 pb-24">
      <div className="mx-auto max-w-lg relative">
        {/* SVG dashed flight path that draws itself */}
        <svg
          className="absolute left-1/2 top-0 -translate-x-1/2 h-full overflow-visible"
          width="4"
          preserveAspectRatio="none"
          style={{ height: "100%" }}
        >
          <defs>
            <linearGradient id="ocean-path-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0061FF" />
              <stop offset="50%" stopColor="#00c8ff" />
              <stop offset="100%" stopColor="#60efff" />
            </linearGradient>
          </defs>
          {/* Faint background line */}
          <line
            x1="2" y1="0" x2="2" y2="100%"
            stroke="#0061ff" strokeOpacity="0.1" strokeWidth="2" strokeDasharray="8 6"
          />
          {/* Animated drawn line via stroke-dashoffset trick */}
          <line
            x1="2" y1="0" x2="2" y2="100%"
            stroke="url(#ocean-path-gradient)"
            strokeWidth="2"
            strokeDasharray="8 6"
            strokeOpacity="0.6"
            style={{
              strokeDashoffset: `${(1 - drawn) * 100}%`,
              transition: "none",
            }}
          />
        </svg>

        {/* Swimming indicator */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          style={{ top: `${iconTop}%`, opacity: iconOpacity, transition: "none" }}
        >
          <div className="relative -mt-3 flex h-7 w-7 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full opacity-30 blur-md"
              style={{ background: "radial-gradient(circle, #0061ff, #60efff)" }}
            />
            {/* Wave / fin icon */}
            <svg viewBox="0 0 24 24" className="relative h-4 w-4" fill="#60efff">
              <path d="M3 18c0-4 3-7 6-8l3-1c3-1 6-4 6-8h2c0 5-3 9-7 10l-3 1c-2.5.8-5 3-5 6H3z" />
            </svg>
          </div>
        </div>

        <div className="space-y-8">
          {milestones.map((milestone, i) => {
            const isLeft = i % 2 === 0;
            // Reveal cards progressively based on scroll
            const cardT = (i + 1) / (milestones.length + 1);
            const cardVisible = scrollProgress > cardT - 0.08;
            const cardOpacity = cardVisible ? Math.min(1, (scrollProgress - (cardT - 0.08)) / 0.06) : 0;
            const cardX = cardVisible ? 0 : (isLeft ? -20 : 20);

            return (
              <div
                key={milestone.key}
                className={`relative ${isLeft ? "pr-[52%] text-right" : "pl-[52%] text-left"}`}
                style={{
                  opacity: cardOpacity,
                  transform: `translateX(${cardX}px)`,
                  transition: "none",
                }}
              >
                {/* Waypoint dot */}
                <div
                  className="absolute left-1/2 top-3 -translate-x-1/2"
                  style={{ opacity: cardOpacity }}
                >
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0061ff]/40 bg-[#020d1a]">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#60efff">
                      <path d="M3 18c0-4 3-7 6-8l3-1c3-1 6-4 6-8h2c0 5-3 9-7 10l-3 1c-2.5.8-5 3-5 6H3z" />
                    </svg>
                  </div>
                </div>

                {/* Card */}
                <div
                  className="rounded-2xl p-4 backdrop-blur-sm"
                  style={{
                    border: "1px solid rgba(96,239,255,0.15)",
                    background: "rgba(2,13,26,0.85)",
                    boxShadow: "0 4px 24px rgba(0,97,255,0.1)",
                  }}
                >
                  <span
                    className="inline-block rounded-full px-3 py-0.5 text-xs font-semibold"
                    style={{ background: "rgba(0,97,255,0.18)", color: "#60efff" }}
                  >
                    {milestone.time}
                  </span>
                  {milestone.region && (
                    <span
                      className="ml-2 text-xs"
                      style={{ color: "rgba(96,239,255,0.5)", letterSpacing: "0.05em" }}
                    >
                      {milestone.region}
                    </span>
                  )}
                  <h4 className="mt-2 text-sm font-bold" style={{ color: "#f0f9ff" }}>
                    {milestone.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: "rgba(148,163,184,0.9)" }}>
                    {milestone.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

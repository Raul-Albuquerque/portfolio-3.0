"use client";

import { useEffect, useRef } from "react";
import type { SkillGroup } from "@/app/data/skills";

interface Props {
  group: SkillGroup;
  visible: boolean;
  categoryLabel: string;
}

export default function SkillCard({ group, visible, categoryLabel }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const wasVisible = useRef(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    if (visible && !wasVisible.current) {
      card.style.opacity = "0";
      card.style.transform = "translateX(-50%) translateY(16px)";
      requestAnimationFrame(() => {
        card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        card.style.opacity = "1";
        card.style.transform = "translateX(-50%) translateY(0)";
      });
    } else if (!visible && wasVisible.current) {
      card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      card.style.opacity = "0";
      card.style.transform = "translateX(-50%) translateY(10px)";
    }

    wasVisible.current = visible;
  }, [visible]);

  return (
    <div
      ref={cardRef}
      className="absolute left-1/2 pointer-events-none select-none"
      style={{
        bottom: "2.5rem",
        transform: "translateX(-50%) translateY(16px)",
        opacity: 0,
        width: "min(90vw, 680px)",
      }}
    >
      <div
        className="rounded-2xl px-6 py-5 backdrop-blur-md"
        style={{
          background: "rgba(2, 8, 28, 0.78)",
          border: "1px solid rgba(96, 239, 255, 0.2)",
          boxShadow: "0 0 32px rgba(0, 97, 255, 0.18), 0 4px 16px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header row */}
        <p
          className="text-sm font-semibold mb-3 tracking-widest uppercase text-center"
          style={{ color: "#60efff" }}
        >
          {categoryLabel}
        </p>

        {/* Skills grid */}
        <div className="flex flex-wrap gap-2 justify-center">
          {group.skills.map((skill) => (
            <span
              key={skill}
              className="text-sm rounded-lg px-3 py-1"
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
    </div>
  );
}

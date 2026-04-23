"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks scroll progress (0-1) of a tall container element.
 * Returns a mutable ref — safe to read inside rAF without causing re-renders.
 */
export default function useScrollProgress(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const progressRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scrollRange = container.offsetHeight - window.innerHeight;
      if (scrollRange <= 0) return;
      const scrolled = -rect.top;
      progressRef.current = Math.max(0, Math.min(1, scrolled / scrollRange));
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [containerRef]);

  return progressRef;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-reveal wrapper. Content is fully visible on the server (no-JS / SEO
 * safe); after hydration, elements that are below the fold fade in on entry.
 */
export function Reveal({ children, className, delay = 0, as: Tag = "div", y = 20 }) {
  const ref = useRef(null);
  const [state, setState] = useState("visible"); // visible | hidden | shown

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return; // already on screen
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setState("hidden");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{
        transitionDelay: state === "shown" ? `${delay}ms` : "0ms",
        transform: state === "hidden" ? `translateY(${y}px)` : undefined,
      }}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        state === "hidden" && "opacity-0",
        className
      )}
    >
      {children}
    </Tag>
  );
}

"use client";

import { useEffect, useRef, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  stagger?: boolean;
  staggerDelay?: number;
}

export function Reveal({ children, delay = 0, stagger = false, staggerDelay = 60 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (stagger) {
              const children = Array.from(element.children) as HTMLElement[];
              children.forEach((child, index) => {
                setTimeout(() => {
                  child.classList.add("reveal-visible");
                }, delay + index * staggerDelay);
              });
            } else {
              setTimeout(() => {
                element.classList.add("reveal-visible");
              }, delay);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [delay, stagger, staggerDelay]);

  return (
    <div ref={ref} className={stagger ? "reveal-stagger-container" : "reveal"}>
      {children}
    </div>
  );
}

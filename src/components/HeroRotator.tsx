"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DEFAULT_HERO_PAIRS, type HeroPair } from "@/lib/hero-content";

const ROTATE_MS = 6000;
const OWN_PHRASE = "you own the accounts and code.";

const headlineClass =
  "w-full min-w-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 text-text tracking-tight leading-[1.1]";

const subheadlineClass =
  "w-full min-w-0 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-text-muted leading-relaxed mb-8 md:mb-10";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function reducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function reducedMotionServerSnapshot() {
  return false;
}

function Subheadline({ text }: { text: string }) {
  const parts = text.split(OWN_PHRASE);
  if (parts.length === 1) return text;
  return parts.map((part, index) =>
    index === parts.length - 1 ? (
      part
    ) : (
      <span key={index}>
        {part}
        <strong className="text-text">{OWN_PHRASE}</strong>
      </span>
    ),
  );
}

export function HeroRotator({
  pairs,
  children,
}: {
  pairs: HeroPair[];
  children?: ReactNode;
}) {
  const slides = pairs.length > 0 ? pairs : DEFAULT_HERO_PAIRS;
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    reducedMotionServerSnapshot,
  );
  const activeIndex = reducedMotion ? 0 : index % slides.length;

  useEffect(() => {
    if (reducedMotion || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      if (paused.current) return;
      setIndex((current) => (current + 1) % slides.length);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [reducedMotion, slides.length]);

  return (
    <div
      data-testid="home-hero-rotator"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      onFocusCapture={() => {
        paused.current = true;
      }}
      onBlurCapture={(event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
          paused.current = false;
        }
      }}
    >
      {/*
        Pair 1 is the only h1 and stays in the accessibility tree. Later
        lines are visual-only so a screen reader is not read a new heading
        every six seconds. aria-live is off for the same reason. Hovering
        or focusing this region pauses the timer. Reduced motion never leaves
        pair 1. Every pair is stacked in one grid cell, so a shorter line
        leaves space under the text and the button below stays put.
      */}
      <div className="grid w-full" aria-live="off">
        {slides.map((pair, slideIndex) => {
          const active = slideIndex === activeIndex;
          const Headline = slideIndex === 0 ? "h1" : "p";
          return (
            <div
              key={slideIndex}
              className={`col-start-1 row-start-1 w-full min-w-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={slideIndex === 0 ? undefined : true}
            >
              <Headline data-hero-line={slideIndex} data-hero-role="headline" className={headlineClass}>
                {pair.headline}
              </Headline>
              <p data-hero-line={slideIndex} data-hero-role="subheadline" className={subheadlineClass}>
                <Subheadline text={pair.subheadline} />
              </p>
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
}

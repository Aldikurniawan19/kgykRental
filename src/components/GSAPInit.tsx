"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({
    force3D: true,
    autoSleep: 60,
  });
  // Smooth out any frame rate fluctuations
  gsap.ticker.lagSmoothing(1000, 16);
}

export default function GSAPInit() {
  const pathname = usePathname();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Custom ultra-smooth cubic-bezier ease
      const smoothEase = "power3.out";

      // 1. Fade Up (Smooth vertical slide)
      const revealElements = document.querySelectorAll<HTMLElement>("[data-gsap='fade-up']");
      revealElements.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 22, force3D: true },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: smoothEase,
            force3D: true,
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              once: true,
            },
          }
        );
      });

      // 2. Fade Left (from right to left)
      const fadeLeftElements = document.querySelectorAll<HTMLElement>("[data-gsap='fade-left']");
      fadeLeftElements.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: 24, force3D: true },
          {
            opacity: 1,
            x: 0,
            duration: 0.85,
            ease: smoothEase,
            force3D: true,
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              once: true,
            },
          }
        );
      });

      // 3. Fade Right (from left to right)
      const fadeRightElements = document.querySelectorAll<HTMLElement>("[data-gsap='fade-right']");
      fadeRightElements.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: -24, force3D: true },
          {
            opacity: 1,
            x: 0,
            duration: 0.85,
            ease: smoothEase,
            force3D: true,
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              once: true,
            },
          }
        );
      });

      // 4. Zoom In (Subtle scale expansion)
      const zoomInElements = document.querySelectorAll<HTMLElement>("[data-gsap='zoom-in']");
      zoomInElements.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.96, force3D: true },
          {
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: smoothEase,
            force3D: true,
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              once: true,
            },
          }
        );
      });

      // 5. Staggered Cards (Smooth sequential entrance)
      const staggerContainers = document.querySelectorAll<HTMLElement>("[data-gsap='stagger-cards']");
      staggerContainers.forEach((container) => {
        const cards = Array.from(container.children) as HTMLElement[];
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 20, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.08,
              ease: "power2.out",
              force3D: true,
              clearProps: "transform",
              scrollTrigger: {
                trigger: container,
                start: "top 90%",
                once: true,
              },
            }
          );
        }
      });
    });

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}

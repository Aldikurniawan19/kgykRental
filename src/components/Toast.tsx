"use client";

import { useEffect, useRef } from "react";
import type { ToastType } from "@/lib/app";

const DURATION = 4000;
const MAX = 3;

const ICONS: Record<ToastType, string> = {
  success: "ph-fill ph-check-circle",
  error: "ph-fill ph-warning-circle",
  warning: "ph-fill ph-warning",
  info: "ph-fill ph-info",
};

const TITLES: Record<ToastType, string> = {
  success: "Berhasil!",
  error: "Gagal!",
  warning: "Perhatian!",
  info: "Informasi",
};

export default function Toast() {
  const backdropRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const showBackdrop = () => {
      backdropRef.current?.classList.add("toast-backdrop--visible");
    };

    const hideBackdrop = () => {
      const box = containerRef.current;
      if (!box) return;
      const live = box.querySelectorAll(".toast:not(.toast--exit)");
      if (live.length === 0) {
        backdropRef.current?.classList.remove("toast-backdrop--visible");
      }
    };

    const dismiss = (el: HTMLElement) => {
      if (!el || el.classList.contains("toast--exit")) return;
      el.classList.add("toast--exit");
      el.classList.remove("toast--visible");
      setTimeout(() => {
        if (el.parentElement) {
          el.style.height = el.offsetHeight + "px";
          el.style.overflow = "hidden";
          requestAnimationFrame(() => {
            el.style.transition =
              "height 0.2s ease, margin 0.2s ease, padding 0.2s ease, opacity 0.2s ease";
            el.style.height = "0";
            el.style.padding = "0";
            el.style.margin = "0";
            setTimeout(() => {
              if (el.parentElement) el.remove();
              hideBackdrop();
            }, 200);
          });
        }
      }, 250);
    };

    const createToast = (message: string, type: ToastType) => {
      const box = containerRef.current;
      if (!box) return;

      const iconClass = ICONS[type] || ICONS.success;
      const title = TITLES[type] || TITLES.success;

      const live = box.querySelectorAll(".toast:not(.toast--exit)");
      if (live.length >= MAX) dismiss(live[0] as HTMLElement);

      showBackdrop();

      const el = document.createElement("div");
      el.className = `toast toast--${type}`;
      el.setAttribute("role", "alert");

      el.innerHTML =
        '<button class="toast__close" aria-label="Tutup"><i class="ph ph-x"></i></button>' +
        `<div class="toast__icon"><i class="${iconClass}"></i></div>` +
        `<div class="toast__title">${title}</div>` +
        `<div class="toast__body"><div class="toast__message">${message}</div></div>` +
        '<div class="toast__progress"></div>';

      box.appendChild(el);

      el.querySelector(".toast__close")?.addEventListener("click", () => dismiss(el));

      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add("toast--visible"));
      });

      const bar = el.querySelector(".toast__progress") as HTMLElement | null;
      if (bar) {
        bar.style.width = "100%";
        requestAnimationFrame(() => {
          bar.style.transitionDuration = DURATION + "ms";
          bar.style.width = "0%";
        });
      }

      let tid: ReturnType<typeof setTimeout> | null = null;
      let left = DURATION;
      let t0 = Date.now();

      const go = () => {
        t0 = Date.now();
        tid = setTimeout(() => dismiss(el), left);
      };

      el.addEventListener("mouseenter", () => {
        if (tid) {
          clearTimeout(tid);
          tid = null;
          left -= Date.now() - t0;
          if (left < 0) left = 0;
        }
        if (bar) {
          bar.style.transitionDuration = "0ms";
          bar.style.width = getComputedStyle(bar).width;
        }
      });

      el.addEventListener("mouseleave", () => {
        if (!el.classList.contains("toast--exit")) {
          go();
          if (bar) {
            requestAnimationFrame(() => {
              bar.style.transitionDuration = left + "ms";
              bar.style.width = "0%";
            });
          }
        }
      });

      go();
    };

    const handleToastEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message: string; type: ToastType };
      if (detail?.message) createToast(detail.message, detail.type || "success");
    };

    const handleBackdropClick = () => {
      const box = containerRef.current;
      if (box) {
        box.querySelectorAll(".toast:not(.toast--exit)").forEach((t) => {
          dismiss(t as HTMLElement);
        });
      }
    };

    window.addEventListener("app:toast", handleToastEvent);
    backdropRef.current?.addEventListener("click", handleBackdropClick);

    return () => {
      window.removeEventListener("app:toast", handleToastEvent);
    };
  }, []);

  return (
    <>
      <div id="gooey-toast-backdrop" ref={backdropRef} className="toast-backdrop" />
      <div id="gooey-toast-container" ref={containerRef} className="toast-container" />
    </>
  );
}
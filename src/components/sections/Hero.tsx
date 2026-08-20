"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PiCalendarPlus, PiCheckCircleFill } from "react-icons/pi";

export default function Hero() {
  const textRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (textRef.current) {
        textRef.current.classList.remove("gsap-hidden");
        gsap.fromTo(
          textRef.current.children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.15,
            ease: "power3.out",
          }
        );
      }

      if (heroRef.current && blob1Ref.current && blob2Ref.current) {
        gsap.to(blob1Ref.current, {
          y: 80,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.to(blob2Ref.current, {
          y: -60,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative pt-28 pb-20 lg:pt-44 lg:pb-32 hero-bg overflow-hidden"
    >
      <div
        ref={blob1Ref}
        className="absolute top-20 right-0 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
      ></div>
      <div
        ref={blob2Ref}
        className="absolute bottom-10 left-10 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={textRef} className="w-full max-w-3xl gsap-hero-text gsap-hidden">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Rental Mobil <span className="gradient-text">Mudah, Cepat,</span> dan Terpercaya
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl">
            Sewa mobil harian, mingguan dengan pilihan kendaraan
            terbaik untuk perjalanan pribadi, keluarga, maupun bisnis area jogja.
          </p>
          <div className="flex flex-col sm:flex-row items-start justify-start gap-4">
            <a
              href="#mobil"
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-primary/30 text-center"
            >
              Lihat Katalog Mobil
            </a>
            <a
              href="/booking"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/25 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
            >
              <PiCalendarPlus className="text-xl text-white" />
              Reservasi Online
            </a>
          </div>

          <div className="mt-10 flex items-center justify-start gap-6 text-slate-300 text-sm font-medium flex-wrap">
            <div className="flex items-center gap-2">
              <PiCheckCircleFill className="text-accent text-lg" /> Beragam Pilihan
            </div>
            <div className="flex items-center gap-2">
              <PiCheckCircleFill className="text-accent text-lg" /> Harga Transparan
            </div>
            <div className="flex items-center gap-2">
              <PiCheckCircleFill className="text-accent text-lg" /> Layanan 24/7
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
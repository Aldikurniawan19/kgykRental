"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PiMapPinFill,
  PiPhoneFill,
  PiEnvelopeSimpleFill,
  PiArrowRightBold,
  PiCalendarCheckFill,
  PiWhatsappLogoFill,
} from "react-icons/pi";

export default function BookingForm() {
  const [contactSettings, setContactSettings] = useState({
    address: "Jl. Pandega Marga, Caturtunggal, Depok, Sleman, Yogyakarta 55281",
    phone: "+62 881-0233-31644",
    email: "info@kgykrental.com",
    whatsapp: "62881023331644",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setContactSettings({
            address: data.address || "Jl. Pandega Marga, Caturtunggal, Depok, Sleman, Yogyakarta 55281",
            phone: data.phone || "+62 881-0233-31644",
            email: data.email || "info@kgykrental.com",
            whatsapp: data.whatsapp || "62881023331644",
          });
        }
      })
      .catch((err) => console.error("Failed to fetch contact settings:", err));
  }, []);

  const cleanWa = contactSettings.whatsapp.replace(/[^0-9]/g, "");
  const waNumber = cleanWa.startsWith("0") ? "62" + cleanWa.slice(1) : cleanWa;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Admin KGYK Rental, saya ingin bertanya seputar sewa mobil di Yogyakarta.")}`;

  return (
    <section id="kontak" className="py-14 sm:py-20 bg-slate-50 relative border-t border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14" data-gsap="fade-up">
          <span className="inline-block px-3.5 py-1 bg-blue-50 text-primary text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-blue-100">
            Hubungi Kami 24/7
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy tracking-tight mb-3">
            Informasi Kontak & Reservasi
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Tim KGYK Rental siap melayani konsultasi dan reservasi armada kendaraan Anda di Yogyakarta.
          </p>
        </div>

        {/* 3 Minimalist Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12" data-gsap="stagger-cards">
          
          {/* Card 1: Alamat Garasi */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md border border-slate-100 transition-all group flex flex-col justify-between">
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-11 h-11 bg-blue-50 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                <PiMapPinFill className="text-xl" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lokasi Garasi</h3>
                <h4 className="text-sm sm:text-base font-extrabold text-navy mt-0.5">Yogyakarta</h4>
              </div>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed mt-2 pl-0.5">
              {contactSettings.address}
            </p>
          </div>

          {/* Card 2: Telepon & WA */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md border border-slate-100 transition-all group flex flex-col justify-between">
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <PiPhoneFill className="text-xl" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telepon & WA</h3>
                <h4 className="text-sm sm:text-base font-extrabold text-navy mt-0.5">Customer Support</h4>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-navy text-xs sm:text-sm font-bold">{contactSettings.phone}</span>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <PiWhatsappLogoFill className="text-sm" /> Chat WA
              </a>
            </div>
          </div>

          {/* Card 3: Email Support */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md border border-slate-100 transition-all group flex flex-col justify-between">
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <PiEnvelopeSimpleFill className="text-xl" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Official</h3>
                <h4 className="text-sm sm:text-base font-extrabold text-navy mt-0.5">Informasi & Penawaran</h4>
              </div>
            </div>
            <p className="text-navy text-xs sm:text-sm font-bold truncate mt-2">
              {contactSettings.email}
            </p>
          </div>

        </div>

        {/* Minimalist CTA Banner */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-navy rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/3"></div>

          <div className="relative z-10 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 text-accent text-xs font-extrabold uppercase tracking-wider mb-1">
              <PiCalendarCheckFill className="text-sm" /> Reservasi Instan Online
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Siap Sewa Mobil di Jogja?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-md">
              Pilih mobil pilihan Anda dan selesaikan pemesanan secara online dengan mudah.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            >
              <span>Pesan Mobil Sekarang</span>
              <PiArrowRightBold className="text-sm" />
            </Link>
            <Link
              href="/katalog"
              className="inline-flex items-center justify-center px-6 py-3.5 border border-white/20 text-white hover:bg-white/10 font-extrabold rounded-xl transition-all text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            >
              Lihat Katalog
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
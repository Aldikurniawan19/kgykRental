"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cars } from "@/data/cars";
import { openCarDetail, bookCar } from "@/lib/app";
import { formatRupiah } from "@/lib/format";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  PiArrowRight,
  PiUsers,
  PiGasPump,
  PiSteeringWheel,
  PiInfo,
  PiCar,
} from "react-icons/pi";

const filters = [
  { value: "all", label: "Semua Tipe" },
  { value: "mpv", label: "MPV" },
  { value: "suv", label: "SUV" },
  { value: "city car", label: "City Car" },
  { value: "van", label: "Van" },
];

export default function CarCatalog() {
  const [currentFilter, setCurrentFilter] = useState("all");

  const filteredCars =
    currentFilter === "all"
      ? cars
      : cars.filter((c) => c.category === currentFilter);
  const displayCars = filteredCars.slice(0, 3);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [currentFilter]);

  return (
    <section id="mobil" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-6">
          <div className="max-w-xl" data-gsap="fade-right">
            <h4 className="text-primary font-bold tracking-wider uppercase text-sm mb-2">
              Katalog Armada
            </h4>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-0">
              Pilih Mobil Sesuai Kebutuhan Anda
            </h2>
          </div>

          <div className="shrink-0 self-end sm:self-auto" data-gsap="fade-left">
            <Link
              href="/katalog"
              scroll={true}
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                }
              }}
              className="inline-flex items-center gap-1.5 text-primary hover:text-blue-700 text-sm font-bold transition-colors group cursor-pointer"
            >
              <span className="border-b border-transparent group-hover:border-blue-700 pb-0.5">
                Lihat Selengkapnya
              </span>
              <PiArrowRight className="font-bold group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 justify-center sm:justify-start" data-gsap="fade-up">
          {filters.map((filter) => (
            <button
              key={filter.value}
              className={`filter-btn px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                currentFilter === filter.value
                  ? "bg-primary text-white shadow-md active"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              data-filter={filter.value}
              onClick={() => setCurrentFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div id="carGrid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-gsap="stagger-cards">
          {displayCars.map((car) => {
            const statusBadge = car.status ? (
              <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full">
                Tersedia
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-full">
                Tidak Tersedia
              </span>
            );

            const btnClass = car.status
              ? "bg-primary hover:bg-blue-700 text-white shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5"
              : "bg-slate-200 text-slate-400 cursor-not-allowed";

            return (
              <div
                key={car.id}
                className="bg-white border border-slate-100 rounded-3xl p-5 hover:border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col group"
              >
                <div
                  className="relative h-52 w-full overflow-hidden cursor-pointer flex items-center justify-center bg-white mb-2"
                  onClick={() => openCarDetail(car.id)}
                >
                  <img
                    src={car.img}
                    alt={car.name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 z-20">{statusBadge}</div>
                  <div className="absolute bottom-2 left-2 z-20">
                    <span className="px-3 py-1 bg-slate-50 border border-slate-200/80 text-navy text-xs font-bold rounded-full shadow-xs">
                      {car.type}
                    </span>
                  </div>
                </div>

                <div className="flex-grow flex flex-col pt-2">
                  <h3
                    className="text-xl font-bold text-navy mb-4 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => openCarDetail(car.id)}
                  >
                    {car.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <PiUsers className="text-primary text-base" /> {car.capacity}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <PiGasPump className="text-primary text-base" /> Bensin
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 col-span-2">
                      <PiSteeringWheel className="text-primary text-base" /> {car.trans}
                    </div>
                  </div>

                  <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Mulai dari</p>
                      <p className="text-lg font-bold text-navy">
                        {formatRupiah(car.price)}{" "}
                        <span className="text-sm font-normal text-slate-500">/hari</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openCarDetail(car.id)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary text-sm font-semibold transition-colors cursor-pointer"
                        title="Lihat Detail"
                      >
                        <PiInfo className="text-lg" />
                      </button>
                      <button
                        disabled={!car.status}
                        onClick={() => car.status && bookCar(car.name)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${btnClass}`}
                      >
                        Booking
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {displayCars.length === 0 && (
          <div id="noCarFound" className="text-center py-20">
            <PiCar className="text-6xl text-slate-300 mb-4 mx-auto" />
            <h3 className="text-xl font-bold text-navy mb-2">
              Mobil tidak ditemukan
            </h3>
            <p className="text-slate-500">Silakan coba pencarian dengan kata kunci lain.</p>
          </div>
        )}
      </div>
    </section>
  );
}
"use client";

import { useEffect, useState } from "react";
import { cars, type Car } from "@/data/cars";
import { showToast } from "@/lib/app";
import { formatRupiah } from "@/lib/format";

export default function CarDetailModal() {
  const [car, setCar] = useState<Car | null>(null);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id: number };
      const found = cars.find((c) => c.id === detail?.id);
      if (found) setCar(found);
    };

    window.addEventListener("app:open-car-detail", handleOpen);
    return () => window.removeEventListener("app:open-car-detail", handleOpen);
  }, []);

  const close = () => setCar(null);

  const handleBook = () => {
    if (!car) return;
    close();
    if (car.status) {
      const currentUser = JSON.parse(
        localStorage.getItem("kgyk_current_user") || "null"
      );
      if (!currentUser) {
        showToast(
          "Silakan login atau daftar akun terlebih dahulu untuk melakukan pemesanan.",
          "error"
        );
        window.dispatchEvent(new CustomEvent("app:open-login"));
        return;
      }
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("app:book-car", { detail: { carName: car.name } })
        );
      }, 300);
    } else {
      showToast("Mobil saat ini tidak tersedia.", "warning");
    }
  };

  if (!car) return null;

  return (
    <div id="carDetailModal" className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-navy/70 backdrop-blur-sm transition-opacity"
        onClick={close}
      ></div>

      <div
        id="carDetailContent"
        className="bg-white rounded-3xl w-full max-w-4xl relative z-10 transform scale-100 opacity-100 transition-all duration-300 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
      >
        <button
          onClick={close}
          className="absolute top-4 right-4 w-10 h-10 bg-white/50 backdrop-blur hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-800 transition-colors z-20 shadow-sm cursor-pointer"
        >
          <i className="ph ph-x text-xl font-bold"></i>
        </button>

        <div className="w-full md:w-1/2 h-64 md:h-auto min-h-[260px] relative bg-white flex items-center justify-center p-6 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-100">
          <img
            id="detailModalImg"
            src={car.img}
            alt={car.name}
            className="w-full h-full max-h-80 object-contain"
          />
          <div className="absolute bottom-4 left-4">
            <span
              id="detailModalType"
              className="px-4 py-1.5 bg-slate-50 border border-slate-200/80 text-navy text-sm font-bold rounded-full shadow-xs"
            >
              {car.type}
            </span>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
          <h3 id="detailModalTitle" className="text-2xl md:text-3xl font-bold text-navy mb-2">
            {car.name}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <i className="ph text-primary ph-users text-lg"></i>{" "}
              <span id="detailModalCapacity">{car.capacity}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="ph text-primary ph-gas-pump text-lg"></i> Bensin
            </div>
            <div className="flex items-center gap-2">
              <i className="ph text-primary ph-steering-wheel text-lg"></i>{" "}
              <span id="detailModalTrans">{car.trans}</span>
            </div>
          </div>

          <div className="flex-grow">
            <h4 className="font-bold text-navy mb-2 text-lg">Deskripsi Kendaraan</h4>
            <p id="detailModalDesc" className="text-slate-600 text-sm leading-relaxed mb-6">
              {car.description}
            </p>

            <h4 className="font-bold text-navy mb-2 text-lg">Fasilitas Termasuk</h4>
            <ul className="space-y-2 text-sm text-slate-600 mb-8">
              <li className="flex items-center gap-2">
                <i className="ph-fill ph-check-circle text-green-500 text-lg"></i>{" "}
                Asuransi All Risk (Bebas cemas)
              </li>
              <li className="flex items-center gap-2">
                <i className="ph-fill ph-check-circle text-green-500 text-lg"></i>{" "}
                Perawatan Berkala Standar Dealer
              </li>
              <li className="flex items-center gap-2">
                <i className="ph-fill ph-check-circle text-green-500 text-lg"></i>{" "}
                Dukungan Bantuan Darurat 24/7
              </li>
            </ul>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Harga Sewa</p>
            <p className="text-3xl font-bold text-navy mb-4">
              <span id="detailModalPrice">{formatRupiah(car.price)}</span>{" "}
              <span className="text-sm font-normal text-slate-500">/hari</span>
            </p>

            <button
              id="detailModalBookBtn"
              onClick={handleBook}
              disabled={!car.status}
              className={
                car.status
                  ? "w-full py-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform cursor-pointer"
                  : "w-full py-4 bg-slate-200 text-slate-500 font-bold rounded-xl cursor-not-allowed"
              }
            >
              {car.status ? "Booking Mobil Ini" : "Mobil Tidak Tersedia"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
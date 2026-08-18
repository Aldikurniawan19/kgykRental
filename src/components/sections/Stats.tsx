"use client";

import { useEffect, useRef, useState } from "react";
import { cars, type Car } from "@/data/cars";
import {
  getBookings,
  getCurrentUser,
  openLoginModal,
  showToast,
} from "@/lib/app";
import { formatRupiah } from "@/lib/format";

export default function Stats() {
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [carSelect, setCarSelect] = useState("all");
  const [availableCars, setAvailableCars] = useState<Car[] | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleBookCar = (e: Event) => {
      const detail = (e as CustomEvent).detail as { carName: string };
      if (!detail?.carName) return;
      const carName = detail.carName;

      const currentUser = getCurrentUser();
      if (!currentUser) {
        showToast(
          "Silakan login atau daftar akun terlebih dahulu untuk melakukan pemesanan.",
          "error"
        );
        openLoginModal();
        return;
      }

      const formCar = document.getElementById("formCar") as HTMLSelectElement | null;
      const formDateStart = document.getElementById("formDateStart") as HTMLInputElement | null;
      const formDateEnd = document.getElementById("formDateEnd") as HTMLInputElement | null;

      if (formCar) {
        formCar.value = carName;
        formCar.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (formDateStart && dateStart) {
        formDateStart.value = dateStart;
        formDateStart.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (formDateEnd && dateEnd) {
        formDateEnd.value = dateEnd;
        formDateEnd.dispatchEvent(new Event("change", { bubbles: true }));
      }

      const bookingSection = document.getElementById("reservasi");
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("app:book-car", handleBookCar);
    return () => window.removeEventListener("app:book-car", handleBookCar);
  }, [dateStart, dateEnd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStart || !dateEnd) return;

    const start = new Date(dateStart);
    const end = new Date(dateEnd);

    if (end < start) {
      showToast("Tanggal selesai tidak boleh sebelum tanggal mulai.", "error");
      return;
    }

    const bookings = getBookings();

    const carsToCheck =
      carSelect === "all" ? cars : cars.filter((c) => c.name === carSelect);

    const available = carsToCheck.filter((car) => {
      const hasConflict = bookings.some((b) => {
        if (b.carName === car.name && b.status !== "Ditolak") {
          const existingStart = new Date(b.startDate);
          const existingEnd = new Date(b.endDate);
          return start <= existingEnd && end >= existingStart;
        }
        return false;
      });
      return !hasConflict;
    });

    setAvailableCars(available);
  };

  const orderCar = (carName: string) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showToast(
        "Silakan login atau daftar akun terlebih dahulu untuk melakukan pemesanan.",
        "error"
      );
      openLoginModal();
      return;
    }

    const formCar = document.getElementById("formCar") as HTMLSelectElement | null;
    const formDateStart = document.getElementById("formDateStart") as HTMLInputElement | null;
    const formDateEnd = document.getElementById("formDateEnd") as HTMLInputElement | null;

    if (formCar) {
      formCar.value = carName;
      formCar.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (formDateStart) {
      formDateStart.value = dateStart;
      formDateStart.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (formDateEnd) {
      formDateEnd.value = dateEnd;
      formDateEnd.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const bookingSection = document.getElementById("reservasi");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-700 text-sm";

  return (
    <section className="relative -mt-10 mx-4 sm:mx-6 lg:mx-8 z-20" data-gsap="fade-up">
      <div className="container mx-auto max-w-6xl bg-white p-6 md:p-8 rounded-2xl shadow-soft border border-slate-100">
        <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
          <i className="ph ph-calendar-search text-primary text-xl"></i>
          Cek Ketersediaan Mobil
        </h3>

        <form
          ref={formRef}
          id="availabilityForm"
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Mulai Sewa
            </label>
            <input
              type="date"
              id="checkDateStart"
              required
              className={inputClass}
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Selesai Sewa
            </label>
            <input
              type="date"
              id="checkDateEnd"
              required
              className={inputClass}
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Pilih Mobil
            </label>
            <select
              id="checkCar"
              required
              className={inputClass}
              value={carSelect}
              onChange={(e) => setCarSelect(e.target.value)}
            >
              <option value="all">Semua Mobil</option>
              {cars.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md text-sm hover:shadow-lg cursor-pointer"
            >
              Cek Ketersediaan
            </button>
          </div>
        </form>

        {availableCars && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-fade-in">
            {availableCars.length === 0 ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center text-red-700">
                <i className="ph ph-warning-circle text-4xl block mb-2 text-red-500"></i>
                <p className="font-semibold text-sm">
                  Mobil tidak tersedia pada jadwal tersebut. Silakan pilih tanggal lain.
                </p>
              </div>
            ) : (
              <>
                <h4 className="text-sm font-bold text-navy mb-4 flex items-center gap-1.5">
                  <i className="ph ph-check-circle text-green-500 text-lg"></i>
                  Pilihan Mobil Tersedia pada Jadwal Anda:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableCars.map((car) => (
                    <div
                      key={car.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-20 h-14 sm:w-24 sm:h-16 bg-white rounded-xl border border-slate-100 flex items-center justify-center p-1 flex-shrink-0">
                          <img
                            src={car.img}
                            alt={car.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h5 className="text-sm font-bold text-navy truncate">{car.name}</h5>
                          <p className="text-xs text-slate-500 font-medium">
                            {car.type} • {car.trans}
                          </p>
                          <p className="text-xs font-bold text-primary mt-1">
                            {formatRupiah(car.price)} /hari
                          </p>
                        </div>
                      </div>
                      <button
                        data-order-car={car.name}
                        onClick={() => orderCar(car.name)}
                        className="w-full sm:w-auto bg-primary hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm hover:shadow-md transition-all cursor-pointer text-center whitespace-nowrap"
                      >
                        Pesan Sekarang
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
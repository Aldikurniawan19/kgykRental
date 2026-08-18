"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CarDetailModal from "@/components/CarDetailModal";
import SuccessModal from "@/components/SuccessModal";
import { cars, type Car } from "@/data/cars";
import { getBookings, getCurrentUser, openCarDetail, openLoginModal, showToast } from "@/lib/app";
import { formatRupiah } from "@/lib/format";

const filters = [
  { value: "all", label: "Semua Tipe" },
  { value: "mpv", label: "MPV" },
  { value: "suv", label: "SUV" },
  { value: "city car", label: "City Car" },
  { value: "van", label: "Van" },
];

const getCapacityVal = (c: string) => parseInt(c.replace(/\D/g, "")) || 0;

export default function KatalogPage() {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [checkStart, setCheckStart] = useState("");
  const [checkEnd, setCheckEnd] = useState("");
  const [dateChecked, setDateChecked] = useState(false);

  const hasDates = !!checkStart && !!checkEnd;

  const result = useMemo(() => {
    let r: Car[] = [...cars];

    if (searchVal) {
      r = r.filter((car) =>
        car.name.toLowerCase().includes(searchVal.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      r = r.filter((car) => car.category === categoryFilter);
    }

    if (dateChecked && hasDates) {
      const start = new Date(checkStart);
      const end = new Date(checkEnd);
      const bookings = getBookings();

      r = r.filter((car) => {
        if (!car.status) return false;
        const isBooked = bookings.some((b) => {
          if (b.carName === car.name && b.status !== "Ditolak") {
            const bStart = new Date(b.startDate);
            const bEnd = new Date(b.endDate);
            return start <= bEnd && end >= bStart;
          }
          return false;
        });
        return !isBooked;
      });
    }

    if (sortBy === "price-asc") {
      r.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      r.sort((a, b) => b.price - a.price);
    } else if (sortBy === "capacity-desc") {
      r.sort((a, b) => getCapacityVal(b.capacity) - getCapacityVal(a.capacity));
    } else if (sortBy === "recommended") {
      r.sort((a, b) => a.id - b.id);
    }

    return r;
  }, [searchVal, sortBy, categoryFilter, checkStart, checkEnd, dateChecked, hasDates]);

  const availabilityMsg = useMemo(() => {
    if (!dateChecked || !hasDates) return null;
    const start = new Date(checkStart);
    const end = new Date(checkEnd);
    return `Menampilkan ${result.length} mobil yang tersedia untuk periode sewa: ${start.toLocaleDateString(
      "id-ID",
      { day: "numeric", month: "short", year: "numeric" }
    )} s/d ${end.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  }, [dateChecked, hasDates, checkStart, checkEnd, result.length]);

  const handleCheckAvailability = () => {
    if (!checkStart || !checkEnd) {
      showToast(
        "Silakan lengkapi tanggal mulai dan selesai sewa terlebih dahulu.",
        "warning"
      );
      return;
    }
    if (new Date(checkEnd) < new Date(checkStart)) {
      showToast("Tanggal selesai tidak boleh sebelum tanggal mulai.", "error");
      return;
    }
    setDateChecked(true);
  };

  const handleResetAvailability = () => {
    setCheckStart("");
    setCheckEnd("");
    setDateChecked(false);
  };

  const handleBookCar = (carName: string) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      openLoginModal();
      return;
    }

    let queryStr = `/?car=${encodeURIComponent(carName)}`;
    if (checkStart && checkEnd) {
      queryStr += `&start=${checkStart}&end=${checkEnd}`;
    }
    router.push(`${queryStr}#reservasi`);
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50 font-sans pt-0">
        <section className="relative bg-gradient-to-r from-navy via-slate-900 to-navy text-white pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <nav
              className="flex items-center gap-2 text-xs md:text-sm text-slate-300 mb-4"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1">
                <i className="ph ph-house"></i> Beranda
              </Link>
              <i className="ph ph-caret-right text-slate-500"></i>
              <span className="text-white font-semibold">Katalog Mobil</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 animate-fade-in">
                Katalog Armada <span className="text-accent">KGYK</span>
              </h1>
              <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-0">
                Jelajahi berbagai pilihan mobil berkualitas yang siap menemani perjalanan
                Anda. Bersih, terawat, dan selalu siap dalam performa terbaik.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20" data-gsap="fade-up">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100/80">
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between pb-6 border-b border-slate-100">
                <div className="relative flex-grow max-w-md">
                  <label htmlFor="searchInput" className="sr-only">
                    Cari Mobil
                  </label>
                  <input
                    type="text"
                    id="searchInput"
                    placeholder="Cari nama mobil..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm text-slate-800 placeholder-slate-400"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                  />
                  <i className="ph ph-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl"></i>
                </div>

                <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end">
                  <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
                    <i className="ph ph-funnel text-sm"></i> Urutkan:
                  </span>
                  <select
                    id="sortSelect"
                    className="px-3 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-slate-50 focus:bg-white text-slate-700 text-xs font-bold cursor-pointer min-w-[150px]"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recommended">Rekomendasi</option>
                    <option value="price-asc">Harga Terendah</option>
                    <option value="price-desc">Harga Tertinggi</option>
                    <option value="capacity-desc">Kapasitas Terbesar</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pb-6 border-b border-slate-100 justify-start">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      categoryFilter === filter.value
                        ? "bg-primary text-white shadow-md active"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    data-filter={filter.value}
                    onClick={() => setCategoryFilter(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50">
                <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
                  <i className="ph ph-calendar-check text-primary text-lg"></i>
                  Cek Ketersediaan Tanggal Sewa
                </h3>
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
                  <div className="grid grid-cols-2 gap-3 flex-grow">
                    <div>
                      <label
                        htmlFor="checkStartDate"
                        className="block text-[10px] sm:text-xs font-semibold text-slate-600 mb-1.5"
                      >
                        Mulai Sewa
                      </label>
                      <input
                        type="date"
                        id="checkStartDate"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-slate-700 text-xs"
                        value={checkStart}
                        onChange={(e) => setCheckStart(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="checkEndDate"
                        className="block text-[10px] sm:text-xs font-semibold text-slate-600 mb-1.5"
                      >
                        Selesai Sewa
                      </label>
                      <input
                        type="date"
                        id="checkEndDate"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-slate-700 text-xs"
                        value={checkEnd}
                        onChange={(e) => setCheckEnd(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full lg:w-auto shrink-0">
                    <button
                      onClick={handleCheckAvailability}
                      className="w-full lg:w-auto px-4 py-3 bg-primary hover:bg-blue-700 text-white text-[11px] sm:text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <i className="ph ph-magnifying-glass-plus text-base"></i> Cari Mobil
                      Ready
                    </button>
                    <button
                      onClick={handleResetAvailability}
                      className="w-full lg:w-auto px-4 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                      title="Reset tanggal"
                    >
                      <i className="ph ph-arrow-counter-clockwise text-base"></i> Reset
                    </button>
                  </div>
                </div>

                {availabilityMsg && (
                  <div className="text-xs font-bold text-slate-600 mt-4 p-3 bg-blue-100/60 rounded-xl border border-blue-200/40 flex items-center gap-2 animate-fade-in">
                    <i className="ph ph-info text-base text-primary"></i>
                    <span>{availabilityMsg}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div id="catalogGrid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-gsap="stagger-cards">
            {result.map((car, index) => {
              const statusBadge = car.status ? (
                <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-200">
                  Tersedia
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-full border border-red-200">
                  Penuh
                </span>
              );

              const btnClass = car.status
                ? "bg-primary hover:bg-blue-700 text-white shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5"
                : "bg-slate-200 text-slate-400 cursor-not-allowed";

              return (
                <div
                  key={car.id}
                  className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  <div
                    className="relative h-48 w-full overflow-hidden cursor-pointer flex items-center justify-center bg-white mb-2"
                    onClick={() => openCarDetail(car.id)}
                  >
                    <img
                      src={car.img}
                      alt={car.name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 z-20">{statusBadge}</div>
                    <div className="absolute bottom-2 left-2 z-20">
                      <span className="px-2.5 py-0.5 bg-slate-50 border border-slate-200/80 text-navy text-[10px] font-bold rounded-md shadow-xs">
                        {car.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 flex-grow flex flex-col justify-between">
                    <div>
                      <h3
                        className="text-base font-bold text-navy mb-3 cursor-pointer hover:text-primary transition-colors truncate"
                        onClick={() => openCarDetail(car.id)}
                      >
                        {car.name}
                      </h3>

                      <div className="grid grid-cols-2 gap-y-2 mb-4 border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <i className="ph text-primary ph-users text-base"></i>{" "}
                          {car.capacity}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <i className="ph text-primary ph-gas-pump text-base"></i> Bensin
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 col-span-2">
                          <i className="ph text-primary ph-steering-wheel text-base"></i>{" "}
                          {car.trans}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-baseline justify-between mb-4">
                        <div>
                          <p className="text-[10px] text-slate-400">Harga rental</p>
                          <p className="text-base font-extrabold text-navy">
                            {formatRupiah(car.price)}
                            <span className="text-[10px] font-normal text-slate-400">
                              /hari
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openCarDetail(car.id)}
                          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-all cursor-pointer"
                          title="Lihat Detail"
                        >
                          <i className="ph ph-info text-base"></i>
                        </button>
                        <button
                          disabled={!car.status}
                          onClick={() => car.status && handleBookCar(car.name)}
                          className={`${btnClass} flex-grow py-2.5 rounded-xl text-xs font-bold transition-all text-center`}
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

          {result.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ph ph-car text-4xl"></i>
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">Mobil Tidak Ditemukan</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Silakan sesuaikan filter tanggal atau ubah kata kunci pencarian Anda.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <CarDetailModal />
      <SuccessModal />

      <WhatsAppButton />
    </>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  PiHouse,
  PiCaretRight,
  PiMagnifyingGlass,
  PiFunnel,
  PiCalendarCheck,
  PiMagnifyingGlassPlus,
  PiArrowCounterClockwise,
  PiInfo,
  PiUsers,
  PiGasPump,
  PiSteeringWheel,
  PiCar,
} from "react-icons/pi";

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
  const [carList, setCarList] = useState<Car[]>(cars);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
    fetch("/api/cars")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.length > 0) setCarList(data);
      })
      .catch((err) => console.error("Failed to fetch live cars for katalog:", err));
  }, []);

  const hasDates = !!checkStart && !!checkEnd;

  const result = useMemo(() => {
    let r: Car[] = [...carList];

    if (searchVal) {
      r = r.filter((car) =>
        car.name.toLowerCase().includes(searchVal.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      r = r.filter(
        (car) => car.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (dateChecked && hasDates) {
      const start = new Date(checkStart);
      const end = new Date(checkEnd);
      const bookings = getBookings();

      const activeStatuses = ["Menunggu Verifikasi", "Disetujui", "Dalam Penyewaan"];
      r = r.filter((car) => {
        if (!car.status) return false;
        const isBooked = bookings.some((b) => {
          if (b.carName === car.name && activeStatuses.includes(b.status)) {
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
      r.sort((a, b) => b.id - a.id);
    }

    return r;
  }, [carList, searchVal, sortBy, categoryFilter, checkStart, checkEnd, dateChecked, hasDates]);

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
                <PiHouse /> Beranda
              </Link>
              <PiCaretRight className="text-slate-500" />
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

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20" data-gsap="fade-up">
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xl border border-slate-100 max-w-5xl mx-auto space-y-3.5">
            {/* Informative Hint */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 border-b border-slate-50 pb-2">
              <PiInfo className="text-primary text-sm shrink-0" />
              <span>Pilih tanggal sewa untuk mengecek ketersediaan mobil pada hari yang Anda inginkan:</span>
            </div>

            {/* Row 1: Search & Date Check Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
              {/* Search Bar */}
              <div className="md:col-span-5 relative">
                <label htmlFor="searchInput" className="sr-only">
                  Cari Mobil
                </label>
                <input
                  type="text"
                  id="searchInput"
                  placeholder="Cari mobil (contoh: Avanza, Brio)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs md:text-sm text-slate-800 transition-all placeholder:text-slate-400 font-medium"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                />
                <PiMagnifyingGlass className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
              </div>

              {/* Date Start & End Inputs */}
              <div className="md:col-span-5 grid grid-cols-2 gap-2">
                <div className="relative">
                  <label htmlFor="checkStartDate" className="absolute -top-2 left-3 px-1 bg-white text-[9px] font-bold text-slate-400 z-10">
                    Mulai Sewa
                  </label>
                  <input
                    type="date"
                    id="checkStartDate"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs text-slate-700 font-medium transition-all"
                    value={checkStart}
                    onChange={(e) => setCheckStart(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <label htmlFor="checkEndDate" className="absolute -top-2 left-3 px-1 bg-white text-[9px] font-bold text-slate-400 z-10">
                    Selesai Sewa
                  </label>
                  <input
                    type="date"
                    id="checkEndDate"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs text-slate-700 font-medium transition-all"
                    value={checkEnd}
                    onChange={(e) => setCheckEnd(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 flex gap-1.5">
                <button
                  onClick={handleCheckAvailability}
                  className="flex-grow py-2.5 px-3 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <PiCalendarCheck className="text-sm" />
                  <span>Cari</span>
                </button>
                {(checkStart || checkEnd) && (
                  <button
                    onClick={handleResetAvailability}
                    className="p-2.5 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer shrink-0"
                    title="Reset Tanggal"
                  >
                    <PiArrowCounterClockwise className="text-sm" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: Category Filter Pills & Sort Select */}
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full md:w-auto pb-1 md:pb-0">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      categoryFilter === filter.value
                        ? "bg-navy text-white shadow-xs"
                        : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
                    }`}
                    data-filter={filter.value}
                    onClick={() => setCategoryFilter(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="w-full md:w-auto shrink-0">
                <select
                  id="sortSelect"
                  className="w-full md:w-auto px-3 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50 focus:bg-white text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recommended">Urutkan: Rekomendasi</option>
                  <option value="price-asc">Harga Terendah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                  <option value="capacity-desc">Kapasitas Terbesar</option>
                </select>
              </div>
            </div>

            {availabilityMsg && (
              <div className="text-xs font-semibold text-slate-600 p-2.5 bg-blue-50/70 rounded-xl border border-blue-100/60 flex items-center justify-between gap-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <PiInfo className="text-base text-primary shrink-0" />
                  <span>{availabilityMsg}</span>
                </div>
                <button
                  onClick={handleResetAvailability}
                  className="text-xs text-primary font-bold hover:underline shrink-0 cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div id="catalogGrid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-gsap="stagger-cards">
            {result.map((car) => {
              const btnClass =
                "bg-primary hover:bg-blue-700 text-white shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5";

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
                          <PiUsers className="text-primary text-base" />{" "}
                          {car.capacity}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <PiGasPump className="text-primary text-base" /> Bensin
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 col-span-2">
                          <PiSteeringWheel className="text-primary text-base" />{" "}
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
                          <PiInfo className="text-base" />
                        </button>
                        <button
                          onClick={() => handleBookCar(car.name)}
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
                <PiCar className="text-4xl" />
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
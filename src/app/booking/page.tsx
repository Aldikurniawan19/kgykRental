"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CarDetailModal from "@/components/CarDetailModal";
import SuccessModal from "@/components/SuccessModal";
import { cars, type Car } from "@/data/cars";
import {
  getBookings,
  getCurrentUser,
  openLoginModal,
  openRegisterModal,
  setBookings,
  showToast,
  generateBookingCode,
  type AppUser,
  type Booking,
} from "@/lib/app";
import { formatRupiah } from "@/lib/format";
import {
  PiHouse,
  PiCaretRight,
  PiLock,
  PiUpload,
  PiCheckCircleFill,
  PiCar,
  PiShieldCheckFill,
  PiArrowRightBold,
  PiCalendarBlankFill,
  PiPaperclipFill,
  PiSpinner,
} from "react-icons/pi";

function BookingFormContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<AppUser | null>(null);
  const [carList, setCarList] = useState<Car[]>(cars);
  const [formCar, setFormCar] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [message, setMessage] = useState("");
  const [docName, setDocName] = useState("");
  const [showSplash, setShowSplash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    fetch("/api/cars")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.length > 0) setCarList(data);
      })
      .catch((err) => console.error("Failed to fetch live cars for booking form:", err));
  }, []);

  useEffect(() => {
    const updateAuth = () => {
      const current = getCurrentUser();
      if (current) {
        setUser(current);
      } else if (status === "authenticated" && session?.user) {
        setUser({
          fullName: session.user.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
          phone: (session.user as any).phone || "",
        });
      } else {
        setUser(null);
      }
    };
    window.addEventListener("auth-changed", updateAuth);
    updateAuth();
    return () => window.removeEventListener("auth-changed", updateAuth);
  }, [session, status]);

  // Handle URL Query Parameters (car, carId, start, end)
  useEffect(() => {
    const carParam = searchParams.get("car");
    const carIdParam = searchParams.get("carId");
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (startParam) setDateStart(startParam);
    if (endParam) setDateEnd(endParam);

    if (carParam) {
      const match = carList.find((c) => c.name.toLowerCase() === carParam.toLowerCase());
      if (match) setFormCar(match.name);
    } else if (carIdParam) {
      const match = carList.find((c) => c.id === Number(carIdParam));
      if (match) setFormCar(match.name);
    }
  }, [searchParams, carList]);

  const selectedCar = useMemo(() => {
    return carList.find((c) => c.name === formCar) || null;
  }, [formCar, carList]);

  const calculateDuration = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (!startStr || !endStr || end < start) return null;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const estimate = useMemo(() => {
    if (!selectedCar) return null;
    const days = calculateDuration(dateStart, dateEnd);
    if (days === null) return null;
    return {
      days,
      day: formatRupiah(selectedCar.price),
      total: formatRupiah(selectedCar.price * days),
      totalRaw: selectedCar.price * days,
    };
  }, [selectedCar, dateStart, dateEnd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const currentUser = getCurrentUser();
    if (!currentUser) {
      showToast("Silakan login terlebih dahulu untuk melakukan pemesanan.", "error");
      openLoginModal();
      return;
    }

    if (!formCar || !dateStart || !dateEnd) return;

    if (!selectedCar) {
      showToast("Silakan pilih kendaraan.", "error");
      return;
    }

    const start = new Date(dateStart);
    const end = new Date(dateEnd);

    if (end < start) {
      showToast("Tanggal selesai tidak boleh sebelum tanggal mulai.", "error");
      return;
    }

    setIsSubmitting(true);

    const diffDays = calculateDuration(dateStart, dateEnd) ?? 1;

    const activeStatuses = ["Menunggu Verifikasi", "Disetujui", "Dalam Penyewaan"];
    const bookings = getBookings();
    const isConflicted = bookings.some((b) => {
      if (b.carName === formCar && activeStatuses.includes(b.status)) {
        const existingStart = new Date(b.startDate);
        const existingEnd = new Date(b.endDate);
        return start <= existingEnd && end >= existingStart;
      }
      return false;
    });

    if (isConflicted) {
      showToast(`Maaf, mobil ${formCar} tidak tersedia pada tanggal tersebut.`, "error");
      return;
    }

    const bookingCode = generateBookingCode();
    const totalPrice = selectedCar.price * diffDays;

    let newBooking: Booking = {
      id: Date.now(),
      bookingCode,
      userEmail: currentUser.email,
      userName: currentUser.fullName,
      carId: selectedCar.id,
      carName: selectedCar.name,
      startDate: dateStart,
      endDate: dateEnd,
      duration: diffDays,
      serviceType: "Sewa Mobil",
      pickupLocation: "Kantor KGYK Yogyakarta",
      dropoffLocation: "Kantor KGYK Yogyakarta",
      notes: message.trim(),
      totalPrice,
      status: "Menunggu Verifikasi",
      paymentStatus: "Belum Bayar",
      paidAt: null,
      releasedAt: null,
      returnedAt: null,
      lateFeeHours: 0,
      lateFee: 0,
      grandTotal: totalPrice,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingCode,
          userEmail: currentUser.email,
          userName: currentUser.fullName,
          carId: selectedCar.id,
          carName: selectedCar.name,
          startDate: dateStart,
          endDate: dateEnd,
          duration: diffDays,
          serviceType: "Sewa Mobil",
          pickupLocation: "Kantor KGYK Yogyakarta",
          dropoffLocation: "Kantor KGYK Yogyakarta",
          notes: message.trim(),
          totalPrice,
          status: "Menunggu Verifikasi",
          paymentStatus: "Belum Bayar",
          grandTotal: totalPrice,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        newBooking = { ...newBooking, ...saved };
      }
    } catch (apiErr) {
      console.error("Failed to sync booking to backend API:", apiErr);
    }

    const cleanWaNumber = contactSettings.whatsapp.replace(/[^0-9]/g, "");
    const waNumber = cleanWaNumber.startsWith("0") ? "62" + cleanWaNumber.slice(1) : cleanWaNumber;
    const formatDateIndo = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    const waMessage = `*KGYK RENTAL MOBIL YOGYAKARTA*
_Diskusi & Konfirmasi Booking Kendaraan_

Halo Admin KGYK Rental, saya telah mengajukan pemesanan kendaraan secara online dan ingin mendiskusikan rincian penawaran serta kesepakatan harga fix (final price) penyewaan.

--------------------------------------------------
*KODE BOOKING*: *${newBooking.bookingCode}*
--------------------------------------------------

*DATA PELANGGAN*
• Nama: ${currentUser.fullName}
• Email: ${currentUser.email}

*DETAIL PEMESANAN KENDARAAN*
• Mobil: ${newBooking.carName}
• Periode Sewa: ${formatDateIndo(newBooking.startDate)} s/d ${formatDateIndo(newBooking.endDate)}
• Durasi: ${newBooking.duration} Hari

*RINCIAN BIAYA*
• Estimasi Biaya: ${formatRupiah(newBooking.totalPrice)}

--------------------------------------------------
Saya ingin mendiskusikan kesepakatan harga fix dan ketersediaan unit lebih lanjut bersama Admin. Mohon informasi & konfirmasi selanjutnya. Terima kasih!
--------------------------------------------------`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
    newBooking.waUrl = waUrl;

    bookings.push(newBooking);
    setBookings(bookings);

    window.__lastBooking = newBooking;

    setShowSplash(true);

    setTimeout(() => {
      setShowSplash(false);
      setIsSubmitting(false);
      setFormCar("");
      setDateStart("");
      setDateEnd("");
      setMessage("");
      setDocName("");
      window.dispatchEvent(new CustomEvent("booking-success"));
    }, 1800);
  };

  return (
    <div className="container mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 sm:pb-12">
      <div className="max-w-3xl mx-auto">
        
        {/* Main Smart Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          
          {/* Header Bar */}
          <div className="p-3.5 sm:p-5 bg-slate-50/90 border-b border-slate-100">
            <h2 className="text-base sm:text-xl font-extrabold text-navy">Formulir Booking Mobil</h2>
            <p className="text-[10px] sm:text-xs text-slate-500">Reservasi sewa kendaraan instan</p>
          </div>

          {!user ? (
            /* Login Required Card */
            <div className="p-6 sm:p-10 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-3 border border-blue-100">
                <PiLock className="text-2xl" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-navy mb-1">Silakan Masuk ke Akun Anda</h3>
              <p className="text-slate-500 text-xs max-w-xs mb-5 leading-relaxed">
                Untuk melakukan reservasi armada online, mohon login atau mendaftar terlebih dahulu.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => openLoginModal()}
                  className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer"
                >
                  Masuk Akun
                </button>
                <button
                  onClick={() => openRegisterModal()}
                  className="w-full sm:w-auto px-6 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Daftar Akun Baru
                </button>
              </div>
            </div>
          ) : (
            /* Streamlined Mobile-Friendly Form */
            <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-4">
              
              {/* 1. Pilih Mobil */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <PiCar className="text-primary text-sm" /> Pilih Mobil <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-3 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/60 focus:bg-white text-navy font-bold text-xs sm:text-sm cursor-pointer"
                  value={formCar}
                  onChange={(e) => setFormCar(e.target.value)}
                >
                  <option value="">-- Pilih Armada Mobil --</option>
                  {carList.map((car) => (
                    <option key={car.id} value={car.name}>
                      {car.name} ({car.type}) — {formatRupiah(car.price)}/hari {!car.status ? "(Tidak Tersedia)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Car Compact Preview (If Selected) */}
              {selectedCar && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 sm:p-3.5 flex items-center justify-between gap-2 animate-fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-16 h-11 bg-white rounded-lg p-0.5 border border-slate-200/60 flex items-center justify-center shrink-0">
                      <img src={selectedCar.img} alt={selectedCar.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-navy text-xs sm:text-sm truncate">{selectedCar.name}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-500 truncate mt-0.5">
                        👥 {selectedCar.capacity} • 🕹️ {selectedCar.trans} • ⛽ Bensin
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9px] text-slate-400">Harga</p>
                    <p className="text-xs sm:text-sm font-extrabold text-primary">{formatRupiah(selectedCar.price)}<span className="text-[9px] font-normal text-slate-400">/hr</span></p>
                  </div>
                </div>
              )}

              {/* 2. Tanggal Sewa (Side-by-Side on Mobile) */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <PiCalendarBlankFill className="text-primary text-xs sm:text-sm" /> Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/60 focus:bg-white text-navy font-semibold text-xs sm:text-sm"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <PiCalendarBlankFill className="text-primary text-xs sm:text-sm" /> Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/60 focus:bg-white text-navy font-semibold text-xs sm:text-sm"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                  />
                </div>
              </div>

              {/* 3. Catatan & Upload Identitas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/60 focus:bg-white text-navy text-xs font-medium resize-none placeholder:text-slate-400"
                    placeholder="Tujuan atau keperluan khusus..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Upload KTP / SIM (Opsional)
                  </label>
                  <div
                    className="border border-dashed border-slate-300 hover:border-primary rounded-xl p-2.5 text-center cursor-pointer bg-slate-50/60 hover:bg-blue-50/30 transition-all h-[58px] flex items-center justify-center gap-2"
                    onClick={() => document.getElementById("formDoc")?.click()}
                  >
                    <PiPaperclipFill className="text-primary text-base shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="text-xs text-slate-700 font-bold truncate max-w-[150px] sm:max-w-[180px]">
                        {docName ? docName : "Pilih File KTP/SIM"}
                      </p>
                      <p className="text-[9px] text-slate-400">PDF, PNG, JPG (Max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      id="formDoc"
                      className="hidden"
                      onChange={(e) => setDocName(e.target.files?.[0]?.name ?? "")}
                    />
                  </div>
                </div>
              </div>

              {/* Live Price Estimation Banner */}
              {estimate && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 rounded-xl p-3 flex items-center justify-between gap-2 animate-fade-in">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      Total Biaya ({estimate.days} Hari)
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {estimate.days} x {estimate.day}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base sm:text-xl font-black text-navy">{estimate.total}</p>
                  </div>
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 sm:py-3.5 px-5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-primary hover:bg-blue-700 disabled:bg-blue-400 shadow-md hover:shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-1"
              >
                {isSubmitting ? (
                  <>
                    <PiSpinner className="animate-spin text-base" />
                    <span>Memproses Booking...</span>
                  </>
                ) : (
                  <>
                    <span>Konfirmasi Booking Sekarang</span>
                    <PiArrowRightBold className="text-sm" />
                  </>
                )}
              </button>

              {/* Compact Guarantees */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-[10px] font-semibold text-slate-500 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <PiShieldCheckFill className="text-emerald-500 text-xs" /> Asuransi Termasuk
                </span>
                <span className="flex items-center gap-1">
                  <PiShieldCheckFill className="text-emerald-500 text-xs" /> Harga Transparan
                </span>
                <span className="flex items-center gap-1">
                  <PiShieldCheckFill className="text-emerald-500 text-xs" /> Support 24/7
                </span>
              </div>
            </form>
          )}
        </div>

      </div>

      {/* Success Splash Modal */}
      {showSplash && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-navy/80 backdrop-blur-md animate-fade-in p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center animate-scale-up">
            <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 animate-spin-once" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="stroke-slate-100" strokeWidth="6" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-emerald-500 animate-stroke-once"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 m-auto w-14 h-14 bg-gradient-to-tr from-green-500 to-emerald-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-pop-scale">
                <PiCheckCircleFill className="text-3xl" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-navy mb-1.5">Pesanan Berhasil Dibuat!</h3>
            <p className="text-slate-500 text-xs">Menyiapkan Struk & Nota Pemesanan Anda...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50/60 font-sans pt-0">
        {/* Compact Hero Banner */}
        <section className="relative bg-gradient-to-r from-navy via-slate-900 to-navy text-white pt-20 pb-8 md:pt-28 md:pb-12 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <nav className="flex items-center gap-2 text-sm sm:text-base text-slate-200 mb-3" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1.5 font-medium">
                <PiHouse className="text-base sm:text-lg" /> Beranda
              </Link>
              <PiCaretRight className="text-slate-400 text-sm sm:text-base" />
              <span className="text-white font-bold">Formulir Booking</span>
            </nav>

            <div className="max-w-2xl">
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight mb-1 animate-fade-in">
                Pemesanan Mobil Online <span className="text-accent">KGYK</span>
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed mb-0">
                Reservasi cepat & praktis tanpa antre untuk perjalanan Anda di Yogyakarta.
              </p>
            </div>
          </div>
        </section>

        <Suspense
          fallback={
            <div className="py-16 text-center">
              <PiCar className="text-3xl text-slate-300 animate-bounce mx-auto mb-2" />
              <p className="text-slate-500 text-xs font-semibold">Memuat formulir...</p>
            </div>
          }
        >
          <BookingFormContent />
        </Suspense>
      </main>

      <Footer />
      <CarDetailModal />
      <SuccessModal />
      <WhatsAppButton />
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import html2canvas from "html2canvas-pro";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  getBookings,
  getCurrentUser,
  openLoginModal,
  openRegisterModal,
  type AppUser,
  type Booking,
} from "@/lib/app";
import { cars } from "@/data/cars";
import { formatDateShort, formatRupiah } from "@/lib/format";
import {
  PiHouse,
  PiCaretRight,
  PiLock,
  PiCalendarBlank,
  PiCheckCircleFill,
  PiXCircleFill,
  PiCarFill,
  PiSealCheckFill,
  PiClockFill,
  PiReceipt,
  PiArrowCounterClockwise,
  PiX,
  PiPrinter,
  PiDownload,
} from "react-icons/pi";

const getStatusClass = (status: string) => {
  if (status === "Disetujui")
    return "bg-emerald-100/70 text-emerald-800 border-emerald-200";
  if (status === "Ditolak")
    return "bg-red-100/70 text-red-800 border-red-200";
  if (status === "Dalam Penyewaan")
    return "bg-blue-100/70 text-blue-800 border-blue-200";
  if (status === "Selesai")
    return "bg-slate-200/70 text-slate-700 border-slate-300";
  return "bg-amber-100/70 text-amber-800 border-amber-200";
};

const renderStatusIcon = (status: string) => {
  if (status === "Disetujui") return <PiCheckCircleFill className="text-xs shrink-0" />;
  if (status === "Ditolak") return <PiXCircleFill className="text-xs shrink-0" />;
  if (status === "Dalam Penyewaan") return <PiCarFill className="text-xs shrink-0" />;
  if (status === "Selesai") return <PiSealCheckFill className="text-xs shrink-0" />;
  return <PiClockFill className="text-xs shrink-0" />;
};

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed">("all");
  const [dbBookings, setDbBookings] = useState<Booking[]>([]);
  const [contactSettings, setContactSettings] = useState({
    address: "Jl. Pandega Marga, Caturtunggal, Depok, Sleman, DIY 55281",
    phone: "+62 881-0233-31644",
    email: "info@kgykrental.com",
  });
  const receiptPrintAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else if (status === "authenticated" && session?.user) {
      setUser({
        fullName: session.user.name || session.user.email?.split("@")[0] || "User",
        email: session.user.email || "",
        phone: (session.user as any).phone || "",
      });
    } else {
      setUser(null);
    }

    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setContactSettings({
            address: data.address || "Jl. Pandega Marga, Caturtunggal, Depok, Sleman, DIY 55281",
            phone: data.phone || "+62 881-0233-31644",
            email: data.email || "info@kgykrental.com",
          });
        }
      })
      .catch((err) => console.error("Failed to fetch settings in History page:", err));

    const loadLiveBookings = async () => {
      try {
        const res = await fetch("/api/bookings");
        if (res.ok) {
          const data = await res.json();
          setDbBookings(data);
        }
      } catch (err) {
        console.error("Failed to fetch live bookings for history:", err);
      }
    };

    loadLiveBookings();

    const handleAuth = () => {
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
      loadLiveBookings();
    };
    window.addEventListener("auth-changed", handleAuth);
    return () => window.removeEventListener("auth-changed", handleAuth);
  }, [session, status]);

  const localBookings = user ? getBookings().filter((b) => b.userEmail === user.email) : [];
  
  const allBookings = user
    ? dbBookings.length > 0
      ? dbBookings.filter((b) => b.userEmail?.toLowerCase() === user.email.toLowerCase())
      : localBookings
    : ([] as Booking[]);

  const filteredBookings = allBookings.filter((b) => {
    if (filterTab === "active") return b.status !== "Selesai" && b.status !== "Ditolak";
    if (filterTab === "completed") return b.status === "Selesai" || b.status === "Ditolak";
    return true;
  });

  const closeReceiptModal = () => setActiveBooking(null);

  const handleDownload = () => {
    const element = receiptPrintAreaRef.current;
    if (!element || !activeBooking) return;

    const filename = `Struk-${activeBooking.bookingCode || "Booking"}.png`;

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = "375px";
    clone.style.height = "auto";
    clone.style.background = "#ffffff";
    clone.style.padding = "24px";
    clone.style.boxSizing = "border-box";

    document.body.appendChild(clone);

    setTimeout(() => {
      html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 375,
      })
        .then((canvas) => {
          canvas.toBlob((blob) => {
            document.body.removeChild(clone);
            if (!blob) {
              alert("Gagal memproses gambar struk.");
              return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = filename;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
          }, "image/png");
        })
        .catch((err) => {
          if (document.body.contains(clone)) {
            document.body.removeChild(clone);
          }
          alert("Gagal mengunduh gambar: " + (err.message || err.toString()));
        });
    }, 50);
  };

  const renderReceipt = (b: Booking) => {
    const deadline = formatDateShort(b.endDate) + ", 16:00 WIB";
    const hasLateFee = Boolean(b.lateFee && b.lateFee > 0);
    const isPaid = b.paymentStatus === "Lunas";

    return (
      <div ref={receiptPrintAreaRef} id="historyReceiptModalPrintArea" className="p-4 sm:p-6 overflow-y-auto print:overflow-visible print:p-4 font-sans">
        <div className="text-center border-b-2 border-dashed border-slate-200 pb-3 mb-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center font-black text-xs font-mono">
              K
            </span>
            <span className="font-extrabold text-sm text-navy tracking-tight">
              KGYK RENTAL MOBIL
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
            {contactSettings.address}
            <br />
            Telp/WA: {contactSettings.phone} • Email: {contactSettings.email}
          </p>
        </div>

        <div className="text-center mb-3">
          <h3 className="text-xs sm:text-sm font-extrabold text-navy tracking-wider uppercase">
            {isPaid
              ? hasLateFee
                ? "STRUK PENGEMBALIAN"
                : "STRUK PEMBAYARAN"
              : "STRUK PEMESANAN"}
          </h3>
          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
            {isPaid
              ? "Bukti transaksi sewa kendaraan resmi"
              : "Tunjukkan struk ini saat pengambilan kendaraan"}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-3 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-400 font-bold block uppercase">
              Kode Booking
            </span>
            <span className="text-xs sm:text-sm font-black text-primary font-mono tracking-wider">
              {b.bookingCode || "-"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">
              Tanggal Cetak
            </span>
            <span className="text-[10px] font-bold text-slate-600">
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="mb-3 space-y-1">
          <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            Data Penyewa
          </h5>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div>
              <span className="text-[8px] text-slate-400 font-bold block">NAMA</span>
              <span className="text-[10px] font-bold text-slate-700">{b.userName}</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 font-bold block">EMAIL</span>
              <span className="text-[10px] font-semibold text-slate-600 truncate block">
                {b.userEmail}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-3 space-y-1">
          <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            Detail Sewa Kendaraan
          </h5>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div>
              <span className="text-[8px] text-slate-400 font-bold block">KENDARAAN</span>
              <span className="text-[10px] font-bold text-slate-700">{b.carName}</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 font-bold block">LAYANAN</span>
              <span className="text-[10px] font-semibold text-slate-600">
                {b.serviceType}
              </span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 font-bold block">
                PERIODE SEWA
              </span>
              <span className="text-[10px] font-bold text-slate-700">
                {formatDateShort(b.startDate)} - {formatDateShort(b.endDate)}
              </span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 font-bold block">DURASI</span>
              <span className="text-[10px] font-bold text-slate-700">
                {b.duration} Hari
              </span>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-slate-200 pt-3 mb-3 space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-medium">Biaya Sewa</span>
            <span className="font-bold text-slate-700">
              {formatRupiah(b.totalPrice)}
            </span>
          </div>
          {hasLateFee && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-2 my-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-red-600 font-bold">
                  Denda ({b.lateFeeHours} jam)
                </span>
                <span className="text-red-600 font-bold">
                  +{formatRupiah(b.lateFee!)}
                </span>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center text-xs font-black text-navy border-t border-slate-100 pt-2 mt-1">
            <span>TOTAL AKHIR</span>
            <span>{formatRupiah(b.grandTotal || b.totalPrice)}</span>
          </div>
        </div>

        <div className="text-center mb-3">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 ${
              isPaid
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            } border rounded-full text-[9px] font-extrabold uppercase tracking-wider`}
          >
            {isPaid ? "LUNAS" : "BELUM BAYAR"}
          </span>
        </div>

        <div className="border-t-2 border-dashed border-slate-200 pt-2.5 text-center space-y-0.5">
          <p className="text-[8px] text-slate-400 font-medium leading-relaxed">
            Struk resmi KGYK Rental Mobil Yogyakarta.
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50/60 font-sans pt-0">
        {/* Full Header-Aligned Hero Banner */}
        <section className="relative bg-gradient-to-r from-navy via-slate-900 to-navy text-white pt-24 pb-10 md:pt-32 md:pb-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>

          {/* Standard container matching Navbar container alignment */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <nav className="flex items-center gap-2 text-sm sm:text-base text-slate-200 mb-3" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1.5 font-medium">
                <PiHouse className="text-base sm:text-lg" /> Beranda
              </Link>
              <PiCaretRight className="text-slate-400 text-sm sm:text-base" />
              <span className="text-white font-bold">Riwayat Pemesanan</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-1.5 animate-fade-in">
                Riwayat <span className="text-accent">Pemesanan Mobil</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-0">
                Pantau daftar transaksi, status penyewaan, dan unduh nota atau struk kendaraan Anda.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section Aligned Perfectly with Navbar Container */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-24 relative z-20">
          {!isMounted ? (
            <div className="text-center py-16">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-200 rounded-full mb-3"></div>
                <div className="h-4 w-36 bg-slate-200 rounded"></div>
              </div>
            </div>
          ) : !user ? (
            <div className="py-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white text-primary rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-200">
                <PiLock className="text-3xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-navy mb-1.5">Akses Terkunci</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
                Silakan masuk ke akun Anda terlebih dahulu untuk melihat riwayat pemesanan kendaraan.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => openLoginModal()}
                  className="w-full sm:w-auto px-7 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer"
                >
                  Masuk Akun
                </button>
                <button
                  onClick={() => openRegisterModal()}
                  className="w-full sm:w-auto px-7 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Daftar Akun Baru
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Top Control Bar resting directly on background, spanning full container width */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-lg sm:text-2xl font-extrabold text-navy">
                    Daftar Reservasi Anda
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                    Menampilkan total <strong className="text-navy">{allBookings.length}</strong> transaksi pemesanan
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-xl shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => setFilterTab("all")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterTab === "all"
                        ? "bg-primary text-white shadow-xs"
                        : "text-slate-600 hover:text-navy"
                    }`}
                  >
                    Semua ({allBookings.length})
                  </button>
                  <button
                    onClick={() => setFilterTab("active")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterTab === "active"
                        ? "bg-primary text-white shadow-xs"
                        : "text-slate-600 hover:text-navy"
                    }`}
                  >
                    Aktif ({allBookings.filter(b => b.status !== "Selesai" && b.status !== "Ditolak").length})
                  </button>
                  <button
                    onClick={() => setFilterTab("completed")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterTab === "completed"
                        ? "bg-primary text-white shadow-xs"
                        : "text-slate-600 hover:text-navy"
                    }`}
                  >
                    Selesai ({allBookings.filter(b => b.status === "Selesai" || b.status === "Ditolak").length})
                  </button>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white/70 backdrop-blur-xs rounded-2xl border border-slate-200">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <PiCalendarBlank className="text-3xl text-slate-400" />
                  </div>
                  <h4 className="text-navy font-bold text-base mb-1">
                    Belum Ada Pemesanan
                  </h4>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mb-5">
                    {filterTab === "all"
                      ? "Anda belum memesan kendaraan apapun. Pilih armada favorit Anda dan mulai perjalanan!"
                      : "Tidak ada riwayat pemesanan pada kategori ini."}
                  </p>
                  <Link
                    href="/katalog"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm"
                  >
                    Cari Mobil Sekarang
                  </Link>
                </div>
              ) : (
                /* Grid 2-Column Desktop Layout spanning full navbar container width */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {filteredBookings.map((b) => {
                    const statusClass = getStatusClass(b.status);
                    const hasLateFee = Boolean(b.lateFee && b.lateFee > 0);

                    const car = cars.find((c) => c.name === b.carName);
                    const carImg = car
                      ? car.img
                      : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80";

                    return (
                      <div
                        key={b.id}
                        className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                      >
                        {/* 1. TOP ROW: Booking Code & Service Type */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs sm:text-sm font-mono font-black text-primary bg-blue-50 px-3 py-1 rounded-lg border border-blue-100/90">
                            {b.bookingCode || `#${b.id.toString().slice(-6)}`}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {b.serviceType}
                          </span>
                        </div>

                        {/* 2. SECOND ROW: Status & Payment Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                          <span
                            className={`px-3 py-0.5 inline-flex items-center gap-1.5 text-xs font-bold rounded-full border ${statusClass}`}
                          >
                            {renderStatusIcon(b.status)}
                            {b.status}
                          </span>
                          {b.paymentStatus === "Lunas" ? (
                            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/70 rounded-full px-2.5 py-0.5">
                              ✓ Lunas
                            </span>
                          ) : (
                            <span className="text-xs font-extrabold text-amber-600 bg-amber-50 border border-amber-200/70 rounded-full px-2.5 py-0.5">
                              🔒 Belum Bayar
                            </span>
                          )}
                        </div>

                        {/* 3. MAIN CONTENT: Car Thumbnail & Details */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-24 sm:w-32 h-16 sm:h-22 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-center p-1.5 shrink-0">
                            <img
                              src={carImg}
                              alt={b.carName}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm sm:text-base font-extrabold text-navy truncate">
                              {b.carName}
                            </h4>
                            <p className="text-xs text-slate-600 truncate mt-1">
                              📅 {formatDateShort(b.startDate)} - {formatDateShort(b.endDate)} ({b.duration} Hari)
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                              📍 Ambil: {b.pickupLocation || "Kantor KGYK Yogyakarta"}
                            </p>

                            {hasLateFee && (
                              <div className="text-xs font-bold text-red-600 mt-1">
                                Denda ({b.lateFeeHours} jam): +{formatRupiah(b.lateFee!)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 4. FOOTER: Total Price & Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Biaya</span>
                            <p className="text-sm sm:text-lg font-black text-navy leading-tight">
                              {formatRupiah(b.grandTotal || b.totalPrice)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveBooking(b)}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <PiReceipt className="text-base" /> Struk
                            </button>

                            {b.status === "Selesai" && (
                              <Link
                                href={`/booking?car=${encodeURIComponent(b.carName)}`}
                                className="px-3.5 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <PiArrowCounterClockwise className="text-sm" /> Pesan Lagi
                              </Link>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Digital Receipt Modal */}
      {activeBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm transition-opacity"
            onClick={closeReceiptModal}
          ></div>
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full relative z-10 transform scale-100 opacity-100 transition-all duration-300 shadow-2xl flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl sm:rounded-t-3xl print:hidden">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                Struk Reservasi Kendaraan
              </span>
              <button
                onClick={closeReceiptModal}
                className="w-7 h-7 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <PiX className="text-base" />
              </button>
            </div>

            {renderReceipt(activeBooking)}

            <div className="px-5 pb-5 pt-1 flex flex-col gap-2 print:hidden">
              <button
                onClick={handleDownload}
                className="w-full py-2.5 px-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-xs sm:text-sm cursor-pointer"
              >
                <PiDownload className="text-base" /> Unduh Gambar Struk
              </button>
              <button
                onClick={closeReceiptModal}
                className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  PiArrowLeft,
  PiLock,
  PiCalendarBlank,
  PiTimer,
  PiMapPin,
  PiMapPinLine,
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
    return "bg-green-50 text-green-700 border-green-200/60";
  if (status === "Ditolak")
    return "bg-red-50 text-red-700 border-red-200/60";
  if (status === "Dalam Penyewaan")
    return "bg-blue-50 text-blue-700 border-blue-200/60";
  if (status === "Selesai")
    return "bg-slate-100 text-slate-700 border-slate-200/60";
  return "bg-amber-50 text-amber-700 border-amber-200/60";
};

const renderStatusIcon = (status: string) => {
  if (status === "Disetujui") return <PiCheckCircleFill className="text-sm" />;
  if (status === "Ditolak") return <PiXCircleFill className="text-sm" />;
  if (status === "Dalam Penyewaan") return <PiCarFill className="text-sm" />;
  if (status === "Selesai") return <PiSealCheckFill className="text-sm" />;
  return <PiClockFill className="text-sm" />;
};

export default function HistoryPage() {
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
    setUser(currentUser);

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
      setUser(getCurrentUser());
      loadLiveBookings();
    };
    window.addEventListener("auth-changed", handleAuth);
    return () => window.removeEventListener("auth-changed", handleAuth);
  }, []);

  const localBookings = user ? getBookings().filter((b) => b.userEmail === user.email) : [];
  
  // Merge live DB bookings with local storage, preferring live DB
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
      <div ref={receiptPrintAreaRef} id="historyReceiptModalPrintArea" className="p-4 sm:p-6 overflow-y-auto print:overflow-visible print:p-4">
        <div className="text-center border-b-2 border-dashed border-slate-200 pb-3 mb-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center font-black text-xs font-mono">
              K
            </span>
            <span className="font-extrabold text-sm text-navy tracking-tight">
              KGYK RENTAL MOBIL
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-medium leading-relaxed font-sans">
            {contactSettings.address}
            <br />
            Telp/WA: {contactSettings.phone} • Email: {contactSettings.email}
          </p>
        </div>

        <div className="text-center mb-3">
          <h3 className="text-sm font-extrabold text-navy tracking-wider uppercase">
            {isPaid
              ? hasLateFee
                ? "STRUK PENGEMBALIAN"
                : "STRUK PEMBAYARAN"
              : "STRUK PEMESANAN"}
          </h3>
          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
            {isPaid
              ? "Bukti transaksi sewa kendaraan"
              : "Tunjukkan struk ini kepada petugas saat pengambilan kendaraan"}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-400 font-bold block uppercase">
              Kode Booking
            </span>
            <span className="text-md font-extrabold text-primary font-mono tracking-widest">
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
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="mb-3 space-y-1.5 font-sans">
          <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            Data Penyewa
          </h5>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <span className="text-[8px] text-slate-400 font-bold block">NAMA</span>
              <span className="text-[10px] font-bold text-slate-700">{b.userName}</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 font-bold block">EMAIL</span>
              <span className="text-[10px] font-semibold text-slate-600">
                {b.userEmail}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-3 space-y-1.5 font-sans">
          <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            Detail Sewa Kendaraan
          </h5>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
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
                TANGGAL MULAI
              </span>
              <span className="text-[10px] font-bold text-slate-700">
                {formatDateShort(b.startDate)}
              </span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 font-bold block">
                TANGGAL SELESAI
              </span>
              <span className="text-[10px] font-bold text-slate-700">
                {formatDateShort(b.endDate)}
              </span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 font-bold block">DURASI</span>
              <span className="text-[10px] font-bold text-slate-700">
                {b.duration} Hari
              </span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 font-bold block">
                BATAS KEMBALI
              </span>
              <span className="text-[10px] font-bold text-slate-700">{deadline}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[8px] text-slate-400 font-bold block">
                LOKASI AMBIL
              </span>
              <span className="text-[10px] font-semibold text-slate-600">
                {b.pickupLocation || "Kantor KGYK Yogyakarta"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[8px] text-slate-400 font-bold block">
                LOKASI KEMBALI
              </span>
              <span className="text-[10px] font-semibold text-slate-600">
                {b.dropoffLocation || "Kantor KGYK Yogyakarta"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-slate-200 pt-3 mb-3 space-y-1 font-sans">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-medium">Biaya Sewa</span>
            <span className="font-bold text-slate-700">
              {formatRupiah(b.totalPrice)}
            </span>
          </div>
          {hasLateFee && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-2 my-1.5 font-sans">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-red-600 font-bold font-sans">
                  Denda Keterlambatan ({b.lateFeeHours} jam)
                </span>
                <span className="text-red-600 font-bold font-sans">
                  +{formatRupiah(b.lateFee!)}
                </span>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center text-[12px] font-extrabold text-navy border-t border-slate-100 pt-2 mt-1">
            <span>TOTAL AKHIR</span>
            <span>{formatRupiah(b.grandTotal || b.totalPrice)}</span>
          </div>
        </div>

        <div className="text-center mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 ${
              isPaid
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            } border rounded-full text-[10px] font-extrabold uppercase tracking-wider font-sans`}
          >
            {isPaid ? "LUNAS" : "BELUM BAYAR"}
          </span>
        </div>

        <div className="border-t-2 border-dashed border-slate-200 pt-3 text-center space-y-1 font-sans">
          <p className="text-[8px] text-slate-400 font-medium leading-relaxed">
            {isPaid
              ? "Bukti transaksi sewa kendaraan ini sah dan resmi dari pihak KGYK Rental."
              : "Struk ini wajib ditunjukkan kepada petugas saat pengambilan kendaraan. Pembayaran dilakukan di tempat."}
          </p>
          <p className="text-[8px] text-slate-400 font-semibold leading-relaxed">
            Keterlambatan pengembalian melewati jam 16:00 WIB pada tanggal akhir sewa
            <br />
            dikenakan denda 10% tarif harian per jam. Lebih dari 5 jam = 1 hari penuh.
          </p>
          <p className="text-[7px] text-slate-300 font-semibold pt-2">
            Dicetak pada: {new Date().toLocaleString("id-ID")} • KGYK Rental Mobil
            Yogyakarta
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50 font-sans pt-0">
        {/* Banner Section */}
        <section className="relative bg-gradient-to-r from-navy via-slate-900 to-navy text-white pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl">
            <nav
              className="flex items-center gap-2 text-xs md:text-sm text-slate-300 mb-4"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1">
                <PiHouse /> Beranda
              </Link>
              <PiCaretRight className="text-slate-500" />
              <span className="text-white font-semibold">Riwayat Pemesanan</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 animate-fade-in">
                Riwayat <span className="text-accent">Pemesanan</span>
              </h1>
              <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                Pantau status reservasi, jadwal penyewaan, dan akses struk pemesanan mobil Anda.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-8 pb-20 relative z-20 max-w-6xl">
          {!isMounted ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-slate-100 max-w-md mx-auto min-h-[300px] flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full mb-3"></div>
                <div className="h-4 w-32 bg-slate-100 rounded mb-2"></div>
                <div className="h-3 w-48 bg-slate-100 rounded"></div>
              </div>
            </div>
          ) : !user ? (
            <div className="bg-white rounded-3xl p-8 md:p-12 text-center shadow-xl border border-slate-100 max-w-md mx-auto animate-fade-in">
              <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <PiLock className="text-4xl text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-2">Akses Terkunci</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Silakan masuk ke akun Anda atau mendaftar terlebih dahulu untuk melihat riwayat pemesanan.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => openLoginModal()}
                  className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                >
                  Masuk Akun
                </button>
                <button
                  onClick={() => openRegisterModal()}
                  className="px-6 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Daftar Baru
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100">
              {/* Header & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-navy">
                    Daftar Reservasi Anda
                  </h2>
                  <p className="text-slate-500 text-xs md:text-sm mt-0.5">
                    Menampilkan total <strong className="text-navy">{allBookings.length}</strong> pemesanan
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                  <button
                    onClick={() => setFilterTab("all")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterTab === "all"
                        ? "bg-primary text-white shadow-xs"
                        : "text-slate-600 hover:text-navy"
                    }`}
                  >
                    Semua ({allBookings.length})
                  </button>
                  <button
                    onClick={() => setFilterTab("active")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterTab === "active"
                        ? "bg-primary text-white shadow-xs"
                        : "text-slate-600 hover:text-navy"
                    }`}
                  >
                    Aktif ({allBookings.filter(b => b.status !== "Selesai" && b.status !== "Ditolak").length})
                  </button>
                  <button
                    onClick={() => setFilterTab("completed")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <PiCalendarBlank className="text-3xl text-slate-400" />
                  </div>
                  <h4 className="text-navy font-bold text-lg mb-1">
                    Belum Ada Pemesanan
                  </h4>
                  <p className="text-slate-500 text-xs md:text-sm max-w-sm mx-auto mb-6">
                    {filterTab === "all"
                      ? "Anda belum memesan kendaraan apapun. Pilih armada favorit Anda dan mulai perjalanan!"
                      : "Tidak ada riwayat pemesanan pada kategori ini."}
                  </p>
                  <Link
                    href="/katalog"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                  >
                    Cari Mobil Sekarang
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-gsap="stagger-cards">
                  {filteredBookings.map((b) => {
                    const statusClass = getStatusClass(b.status);
                    const hasLateFee = Boolean(b.lateFee && b.lateFee > 0);

                    const car = cars.find((c) => c.name === b.carName);
                    const carImg = car
                      ? car.img
                      : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80";
                    const carType = car ? car.type : "Armada";

                    return (
                      <div
                        key={b.id}
                        className="bg-white rounded-2xl md:rounded-3xl p-5 shadow-sm hover:shadow-lg border border-slate-100/90 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          {/* Header Bar */}
                          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-slate-100 text-navy rounded-lg text-xs font-mono font-bold border border-slate-200/60">
                                {b.bookingCode || `#${b.id.toString().slice(-6)}`}
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-bold rounded-full border ${statusClass}`}
                            >
                              {renderStatusIcon(b.status)}
                              {b.status}
                            </span>
                          </div>

                          {/* Body Content */}
                          <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="w-full sm:w-36 h-28 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-center p-2 shrink-0">
                              <img
                                src={carImg}
                                alt={b.carName}
                                className="w-full h-full object-contain"
                              />
                            </div>

                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-base font-extrabold text-navy mb-0.5">
                                    {b.carName}
                                  </h4>
                                  <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                    {carType} • {b.serviceType}
                                  </span>
                                </div>
                                {b.paymentStatus === "Lunas" ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1 shrink-0">
                                    <PiCheckCircleFill className="text-xs" /> Lunas
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1 shrink-0">
                                    <PiClockFill className="text-xs" /> Belum Bayar
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
                                <div className="flex items-center gap-1.5">
                                  <PiCalendarBlank className="text-primary text-sm shrink-0" />
                                  <span className="font-semibold text-slate-700">
                                    {formatDateShort(b.startDate)} - {formatDateShort(b.endDate)}
                                  </span>
                                  <span className="text-[11px] font-normal text-slate-400">
                                    ({b.duration} Hari)
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <PiMapPin className="text-primary text-sm shrink-0" />
                                  <span className="truncate">
                                    Ambil: <strong className="text-slate-700">{b.pickupLocation || "Kantor KGYK Yogyakarta"}</strong>
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 sm:col-span-2">
                                  <PiMapPinLine className="text-primary text-sm shrink-0" />
                                  <span className="truncate">
                                    Kembali: <strong className="text-slate-700">{b.dropoffLocation || "Kantor KGYK Yogyakarta"}</strong>
                                  </span>
                                </div>
                              </div>

                              {hasLateFee && (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-[11px] text-red-600 font-semibold mt-2">
                                  Denda Keterlambatan ({b.lateFeeHours} jam): +{formatRupiah(b.lateFee!)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Footer Bar */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Total Biaya
                            </span>
                            <span className="text-lg font-extrabold text-navy">
                              {formatRupiah(b.grandTotal || b.totalPrice)}
                            </span>
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
                                href={`/?car=${encodeURIComponent(b.carName)}#reservasi`}
                                className="px-3.5 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs text-center flex items-center gap-1.5 cursor-pointer"
                              >
                                <PiArrowCounterClockwise className="text-sm font-bold" />
                                Pesan Lagi
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

      {activeBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm transition-opacity"
            onClick={closeReceiptModal}
          ></div>
          <div className="bg-white rounded-3xl max-w-lg w-full mx-4 relative z-10 transform scale-100 opacity-100 transition-all duration-300 shadow-2xl flex flex-col max-h-[92vh]">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-3xl print:hidden">
              <span className="text-sm font-extrabold text-slate-800">
                Detail Struk Reservasi
              </span>
              <button
                onClick={closeReceiptModal}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <PiX className="text-lg" />
              </button>
            </div>

            {renderReceipt(activeBooking)}

            <div className="px-6 pb-5 pt-2 flex flex-col gap-3 print:hidden">
              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer text-sm"
                >
                  <PiPrinter className="text-lg" />
                  Cetak Struk
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer text-sm"
                >
                  <PiDownload className="text-lg" />
                  Unduh Gambar
                </button>
              </div>
              <button
                onClick={closeReceiptModal}
                className="w-full py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all cursor-pointer text-sm"
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
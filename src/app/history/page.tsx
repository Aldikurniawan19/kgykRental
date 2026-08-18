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
  type Booking,
} from "@/lib/app";
import { cars } from "@/data/cars";
import { formatDateShort, formatRupiah } from "@/lib/format";

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

const getStatusIcon = (status: string) => {
  if (status === "Disetujui") return "ph-check-circle";
  if (status === "Ditolak") return "ph-x-circle";
  if (status === "Dalam Penyewaan") return "ph-car";
  if (status === "Selesai") return "ph-circle-wavy-check";
  return "ph-clock";
};

export default function HistoryPage() {
  const [, setReloadKey] = useState(0);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const receiptPrintAreaRef = useRef<HTMLDivElement>(null);

  const user = getCurrentUser();

  const bookings = user
    ? getBookings().filter((b) => b.userEmail === user.email)
    : ([] as Booking[]);

  useEffect(() => {
    const handleAuth = () => setReloadKey((k) => k + 1);
    window.addEventListener("auth-changed", handleAuth);
    return () => window.removeEventListener("auth-changed", handleAuth);
  }, []);

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
    const hasLateFee = b.lateFee && b.lateFee > 0;
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
            Jl. Pandega Marga, Caturtunggal, Kec. Depok, Sleman, DIY 55281
            <br />
            Telp/WA: +62 812 3456 7890 • Email: cs@kgyk.com
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
                {b.pickupLocation}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[8px] text-slate-400 font-bold block">
                LOKASI KEMBALI
              </span>
              <span className="text-[10px] font-semibold text-slate-600">
                {b.dropoffLocation}
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
                  +{formatRupiah(b.lateFee)}
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

      <main className="pt-12 pb-20 bg-lightbg min-h-[85vh] font-sans">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-slate-600 hover:text-primary transition-all font-bold bg-white px-5 py-3 rounded-2xl shadow-soft border border-slate-100/60 max-w-max hover:shadow-md"
            >
              <i className="ph ph-arrow-left text-lg font-bold text-primary"></i>
              <span>Kembali ke Beranda</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-accent text-navy flex items-center justify-center font-black text-sm">
                K
              </span>
              <span className="text-xl font-black text-navy tracking-tight">
                KGYK <span className="text-primary font-bold">Rental</span>
              </span>
            </div>
          </div>

          {!user ? (
            <div className="bg-white rounded-3xl p-8 md:p-12 text-center shadow-soft border border-slate-100/60 max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ph ph-lock text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-navy mb-3">Akses Terkunci</h3>
              <p className="text-slate-500 text-sm mb-8">
                Silakan masuk atau daftar akun terlebih dahulu untuk melihat riwayat
                pemesanan sewa mobil Anda.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
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
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-soft border border-slate-100/60">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-navy">Riwayat Pemesanan</h3>
                  <p className="text-slate-500 text-sm">
                    Kelola status, jadwal penyewaan, dan kelengkapan kendaraan Anda.
                  </p>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <i className="ph ph-calendar-blank text-3xl"></i>
                  </div>
                  <h4 className="text-navy font-bold text-lg mb-1">
                    Belum Ada Pemesanan
                  </h4>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                    Anda belum memesan kendaraan apapun. Pilih armada favorit Anda dan
                    nikmati perjalanan menyenangkan.
                  </p>
                  <Link
                    href="/"
                    className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                  >
                    Cari Mobil Sekarang
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-gsap="stagger-cards">
                  {bookings.map((b) => {
                    const statusClass = getStatusClass(b.status);
                    const statusIcon = getStatusIcon(b.status);
                    const hasLateFee = b.lateFee && b.lateFee > 0;

                    const car = cars.find((c) => c.name === b.carName);
                    const carImg = car
                      ? car.img
                      : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80";
                    const carType = car ? car.type : "Armada";

                    return (
                      <div
                        key={b.id}
                        className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-blue-50 rounded-md text-[10px] font-extrabold text-blue-600 tracking-wider font-mono">
                                {b.bookingCode || "#" + b.id.toString().slice(-6)}
                              </span>
                            </div>
                            <span
                              className={`px-2.5 py-1 inline-flex items-center gap-1 text-[11px] font-bold leading-5 rounded-full border ${statusClass}`}
                            >
                              <i className={`ph-fill ${statusIcon}`}></i>
                              {b.status}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-5 mb-5">
                            <div className="w-full sm:w-2/5 aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 bg-white flex items-center justify-center p-2 shrink-0">
                              <img
                                src={carImg}
                                alt={b.carName}
                                className="w-full h-full object-contain"
                              />
                            </div>

                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-base font-bold text-navy">
                                  {b.carName}
                                </h4>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                                  {carType}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 gap-1.5 text-[11px] text-slate-600">
                                <div className="flex items-center gap-1.5">
                                  <i className="ph ph-calendar-blank text-slate-400 text-sm"></i>
                                  <span className="font-semibold text-slate-700">
                                    {formatDateShort(b.startDate)} -{" "}
                                    {formatDateShort(b.endDate)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <i className="ph ph-timer text-slate-400 text-sm"></i>
                                  <span>
                                    Durasi:{" "}
                                    <span className="font-bold text-slate-700">
                                      {b.duration} Hari
                                    </span>{" "}
                                    ({b.serviceType})
                                  </span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <i className="ph ph-map-pin text-slate-400 text-sm mt-0.5"></i>
                                  <span>
                                    Ambil:{" "}
                                    <span className="font-medium text-slate-700">
                                      {b.pickupLocation}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <i className="ph ph-map-pin-line text-slate-400 text-sm mt-0.5"></i>
                                  <span>
                                    Kembali:{" "}
                                    <span className="font-medium text-slate-700">
                                      {b.dropoffLocation}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              {b.paymentStatus === "Lunas" ? (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 w-max">
                                  <i className="ph-fill ph-check-circle"></i> Lunas
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 w-max">
                                  <i className="ph-fill ph-clock"></i> Belum Bayar
                                </div>
                              )}

                              {hasLateFee && (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-[10px]">
                                  <span className="text-red-600 font-bold">
                                    Denda Keterlambatan: {formatRupiah(b.lateFee)} (
                                    {b.lateFeeHours} jam)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex flex-row items-center justify-between gap-4 mt-auto">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                              Total Biaya
                            </span>
                            <span className="text-lg font-extrabold text-navy">
                              {formatRupiah(b.grandTotal || b.totalPrice)}
                            </span>
                            {hasLateFee && (
                              <span className="text-[9px] text-red-500 font-bold block">
                                Termasuk denda {formatRupiah(b.lateFee)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveBooking(b)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-slate-200"
                            >
                              <i className="ph ph-receipt"></i> Struk
                            </button>

                            {b.status === "Selesai" && (
                              <Link
                                href={`/?car=${encodeURIComponent(b.carName)}#reservasi`}
                                className="px-3.5 py-2 bg-primary hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-sm hover:shadow text-center flex items-center gap-1.5 cursor-pointer"
                              >
                                <i className="ph ph-arrow-counter-clockwise font-bold"></i>
                                Pesan Kembali
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
        </div>
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
                <i className="ph ph-x text-lg"></i>
              </button>
            </div>

            {renderReceipt(activeBooking)}

            <div className="px-6 pb-5 pt-2 flex flex-col gap-3 print:hidden">
              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer text-sm"
                >
                  <i className="ph ph-printer text-lg"></i>
                  Cetak Struk
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer text-sm"
                >
                  <i className="ph ph-download text-lg"></i>
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
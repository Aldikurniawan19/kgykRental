"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import html2canvas from "html2canvas-pro";
import { formatRupiah } from "@/lib/format";
import type { Booking } from "@/lib/app";

export default function SuccessModal() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleBookingSuccess = () => {
      const last = window.__lastBooking;
      if (!last) return;
      setBooking(last);
    };

    window.addEventListener("booking-success", handleBookingSuccess);
    return () => window.removeEventListener("booking-success", handleBookingSuccess);
  }, []);

  const close = () => setBooking(null);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handleDownload = () => {
    const element = receiptRef.current;
    if (!element) return;

    const filename = `Struk-${booking ? booking.bookingCode : "Booking"}.png`;

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

  if (!booking) return null;

  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div id="successModal" className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm transition-opacity"
        id="modalBackdrop"
        onClick={close}
      ></div>

      <div
        id="modalContent"
        className="bg-white rounded-3xl max-w-lg w-full mx-4 relative z-10 transform scale-100 opacity-100 transition-all duration-300 shadow-2xl flex flex-col max-h-[92vh]"
      >
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-3xl print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <i className="ph-fill ph-check text-white text-xs font-bold"></i>
            </div>
            <span className="text-sm font-extrabold text-slate-800">
              Reservasi Berhasil!
            </span>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="ph ph-x text-lg"></i>
          </button>
        </div>

        <div
          ref={receiptRef}
          id="receipt-print-area"
          className="p-4 sm:p-6 overflow-y-auto print:overflow-visible print:p-4"
        >
          <div className="text-center border-b-2 border-dashed border-slate-200 pb-3 mb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <i className="ph-fill ph-steering-wheel text-sm text-white"></i>
              </div>
              <span className="font-extrabold text-sm text-navy tracking-tight">
                KGYK RENTAL MOBIL
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
              Jl. Pandega Marga, Caturtunggal, Kec. Depok, Sleman, DIY 55281
              <br />
              Telp/WA: +62 812 3456 7890 • Email: cs@kgyk.com
            </p>
          </div>

          <div className="text-center mb-3">
            <h3 className="text-sm font-extrabold text-navy tracking-wider uppercase">
              STRUK PEMESANAN
            </h3>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
              Tunjukkan struk ini kepada petugas saat pengambilan kendaraan
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-400 font-bold block uppercase">
                Kode Booking
              </span>
              <span className="text-md font-extrabold text-primary font-mono tracking-widest">
                {booking.bookingCode}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">
                Tanggal Cetak
              </span>
              <span className="text-[10px] font-bold text-slate-600">{printDate}</span>
            </div>
          </div>

          <div className="mb-3 space-y-1.5">
            <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
              Data Penyewa
            </h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div>
                <span className="text-[8px] text-slate-400 font-bold block">NAMA</span>
                <span className="text-[10px] font-bold text-slate-700">
                  {booking.userName}
                </span>
              </div>
              <div>
                <span className="text-[8px] text-slate-400 font-bold block">EMAIL</span>
                <span className="text-[10px] font-semibold text-slate-600">
                  {booking.userEmail}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-3 space-y-1.5">
            <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
              Detail Sewa Kendaraan
            </h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div>
                <span className="text-[8px] text-slate-400 font-bold block">KENDARAAN</span>
                <span className="text-[10px] font-bold text-slate-700">
                  {booking.carName}
                </span>
              </div>
              <div>
                <span className="text-[8px] text-slate-400 font-bold block">LAYANAN</span>
                <span className="text-[10px] font-semibold text-slate-600">
                  {booking.serviceType}
                </span>
              </div>
              <div>
                <span className="text-[8px] text-slate-400 font-bold block">
                  TANGGAL MULAI
                </span>
                <span className="text-[10px] font-bold text-slate-700">
                  {formatDate(booking.startDate)}
                </span>
              </div>
              <div>
                <span className="text-[8px] text-slate-400 font-bold block">
                  TANGGAL SELESAI
                </span>
                <span className="text-[10px] font-bold text-slate-700">
                  {formatDate(booking.endDate)}
                </span>
              </div>
              <div>
                <span className="text-[8px] text-slate-400 font-bold block">DURASI</span>
                <span className="text-[10px] font-bold text-slate-700">
                  {booking.duration} Hari
                </span>
              </div>
              <div>
                <span className="text-[8px] text-slate-400 font-bold block">
                  BATAS KEMBALI
                </span>
                <span className="text-[10px] font-bold text-slate-700">
                  {formatDate(booking.endDate)}, 16:00 WIB
                </span>
              </div>
              <div>
                <span className="text-[8px] text-slate-400 font-bold block">
                  LOKASI AMBIL
                </span>
                <span className="text-[10px] font-semibold text-slate-600">
                  {booking.pickupLocation}
                </span>
              </div>
              <div>
                <span className="text-[8px] text-slate-400 font-bold block">
                  LOKASI KEMBALI
                </span>
                <span className="text-[10px] font-semibold text-slate-600">
                  {booking.dropoffLocation}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-slate-200 pt-3 mb-3 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 font-medium">Estimasi Biaya Sewa</span>
              <span className="font-extrabold text-navy">
                {formatRupiah(booking.totalPrice)}
              </span>
            </div>
          </div>

          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              <i className="ph-fill ph-clock text-sm"></i> BELUM BAYAR
            </span>
          </div>

          <div className="border-t-2 border-dashed border-slate-200 pt-3 text-center space-y-1">
            <p className="text-[8px] text-slate-400 font-medium leading-relaxed">
              Struk ini wajib ditunjukkan kepada petugas saat pengambilan kendaraan.
              Pembayaran dilakukan di tempat.
            </p>
            <p className="text-[8px] text-slate-400 font-semibold">
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
          <div className="flex gap-3">
            <Link
              href="/history"
              onClick={close}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-center text-sm"
            >
              Lihat Pesanan
            </Link>
            <button
              onClick={close}
              className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all cursor-pointer text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
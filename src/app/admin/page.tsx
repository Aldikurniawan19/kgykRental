"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah, formatDateShort } from "@/lib/format";
import {
  PiCar,
  PiReceipt,
  PiClock,
  PiCurrencyDollar,
  PiArrowRight,
  PiCheckCircleFill,
  PiClockFill,
  PiXCircleFill,
  PiCarFill,
  PiSealCheckFill,
} from "react-icons/pi";

interface StatsData {
  totalCars: number;
  activeCars: number;
  totalBookings: number;
  pendingBookings: number;
  activeRentals: number;
  totalRevenue: number;
}

interface BookingItem {
  id: number;
  bookingCode: string;
  userName: string;
  userEmail: string;
  carName: string;
  startDate: string;
  endDate: string;
  duration: number;
  grandTotal: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resStats, resBookings] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/bookings"),
      ]);

      if (resStats.ok) {
        const dataStats = await resStats.json();
        setStats(dataStats);
      }
      if (resBookings.ok) {
        const dataBookings = await resBookings.json();
        setRecentBookings(dataBookings.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === "Disetujui")
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200/60 inline-flex items-center gap-1.5">
          <PiCheckCircleFill className="text-xs" /> Disetujui
        </span>
      );
    if (status === "Ditolak")
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200/60 inline-flex items-center gap-1.5">
          <PiXCircleFill className="text-xs" /> Ditolak
        </span>
      );
    if (status === "Dalam Penyewaan")
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 inline-flex items-center gap-1.5">
          <PiCarFill className="text-xs" /> Dalam Sewa
        </span>
      );
    if (status === "Selesai")
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60 inline-flex items-center gap-1.5">
          <PiSealCheckFill className="text-xs" /> Selesai
        </span>
      );
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 inline-flex items-center gap-1.5">
        <PiClockFill className="text-xs" /> Menunggu Verifikasi
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy tracking-tight">Ringkasan Operasional</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Pantau statistik ketersediaan armada, status reservasi, dan transaksi keuangan.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/mobil"
            className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <PiCar className="text-base" /> Kelola Mobil
          </Link>
          <Link
            href="/admin/transaksi"
            className="px-5 py-2.5 bg-navy hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <PiReceipt className="text-base" /> Operasional Transaksi
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Cars */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-300 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Total Armada Mobil
            </span>
            <span className="text-3xl font-extrabold text-navy mt-1.5 block">
              {loading ? "..." : stats?.totalCars || 0}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
              {stats?.activeCars || 0} unit aktif tersedia
            </span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-blue-50 text-primary flex items-center justify-center text-2xl shrink-0 border border-blue-100/80">
            <PiCar />
          </div>
        </div>

        {/* Card 2: Total Bookings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-300 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Total Transaksi
            </span>
            <span className="text-3xl font-extrabold text-navy mt-1.5 block">
              {loading ? "..." : stats?.totalBookings || 0}
            </span>
            <span className="text-[11px] font-semibold text-blue-600 mt-1 block">
              {stats?.activeRentals || 0} transaksi aktif
            </span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shrink-0 border border-emerald-100/80">
            <PiReceipt />
          </div>
        </div>

        {/* Card 3: Pending Verification */}
        {stats && stats.pendingBookings > 0 ? (
          <Link
            href="/admin/transaksi?status=Menunggu+Verifikasi"
            className="bg-amber-50/60 border border-amber-200/80 p-6 rounded-3xl shadow-soft hover:shadow-md hover:border-amber-400 hover:bg-amber-100/50 transition-all duration-300 flex items-center justify-between group cursor-pointer"
            title="Klik untuk memverifikasi pesanan masuk"
          >
            <div>
              <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider block">
                Menunggu Verifikasi
              </span>
              <span className="text-3xl font-extrabold text-amber-600 mt-1.5 block">
                {loading ? "..." : stats.pendingBookings}
              </span>
              <span className="text-[11px] font-bold text-amber-700 mt-1 flex items-center gap-1 group-hover:underline">
                Klik untuk verifikasi pesanan &rarr;
              </span>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <PiClock />
            </div>
          </Link>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Menunggu Verifikasi
              </span>
              <span className="text-3xl font-extrabold text-slate-400 mt-1.5 block">
                {loading ? "..." : 0}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
                Tidak ada pesanan antre
              </span>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-2xl shrink-0 border border-slate-100">
              <PiClock />
            </div>
          </div>
        )}

        {/* Card 4: Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-300 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Total Pendapatan
            </span>
            <span className="text-xl font-extrabold text-navy mt-1.5 block truncate max-w-[150px]">
              {loading ? "..." : formatRupiah(stats?.totalRevenue || 0)}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
              Status Lunas
            </span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl shrink-0 border border-purple-100/80">
            <PiCurrencyDollar />
          </div>
        </div>
      </div>

      {/* Recent Bookings Table Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-navy">
              Transaksi Terbaru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar 5 reservasi terbaru yang masuk ke dalam sistem
            </p>
          </div>
          <Link
            href="/admin/transaksi"
            className="text-xs font-bold text-primary hover:text-blue-700 flex items-center gap-1 group"
          >
            Lihat Semua Transaksi
            <PiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold">
            Memuat data transaksi...
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold">
            Belum ada transaksi reservasi tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="py-3.5 px-4 rounded-l-xl">Kode Booking</th>
                  <th className="py-3.5 px-4">Penyewa</th>
                  <th className="py-3.5 px-4">Kendaraan</th>
                  <th className="py-3.5 px-4">Tanggal Sewa</th>
                  <th className="py-3.5 px-4">Total Biaya</th>
                  <th className="py-3.5 px-4">Status Sewa</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">Pembayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-navy">
                      {b.bookingCode}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-slate-800 block">
                        {b.userName}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {b.userEmail}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-700">
                      {b.carName}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-700 block">
                        {formatDateShort(b.startDate)} - {formatDateShort(b.endDate)}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        ({b.duration} Hari)
                      </span>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-navy">
                      {formatRupiah(b.grandTotal || b.totalPrice)}
                    </td>
                    <td className="py-4 px-4">{renderStatusBadge(b.status)}</td>
                    <td className="py-4 px-4 text-right">
                      {b.paymentStatus === "Lunas" ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 inline-flex items-center gap-1">
                          LUNAS
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200/60 inline-flex items-center gap-1">
                          BELUM BAYAR
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

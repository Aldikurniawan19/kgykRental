"use client";

import { useEffect, useState } from "react";
import { formatRupiah, formatDateShort } from "@/lib/format";
import { setBookings as setLocalBookings } from "@/lib/app";
import {
  PiReceipt,
  PiCheckCircleFill,
  PiClockFill,
  PiXCircleFill,
  PiCarFill,
  PiSealCheckFill,
  PiX,
  PiPrinter,
  PiMagnifyingGlass,
  PiWarningCircleFill,
  PiEyeFill,
  PiUserFill,
  PiCalendarBlankFill,
  PiCurrencyDollarFill,
  PiMapPinFill,
  PiNoteFill,
  PiPlus,
  PiArrowRightBold,
  PiCaretLeftBold,
  PiCaretRightBold,
} from "react-icons/pi";

interface BookingItem {
  id: number;
  bookingCode: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  carId: number;
  carName: string;
  startDate: string;
  endDate: string;
  duration: number;
  serviceType: string;
  pickupLocation: string;
  dropoffLocation: string;
  notes?: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paidAt?: string | null;
  releasedAt?: string | null;
  returnedAt?: string | null;
  lateFeeHours: number;
  lateFee: number;
  grandTotal: number;
  createdAt: string;
}

const PAYMENT_METHODS = [
  "Belum Dipilih",
  "Transfer Bank BCA",
  "Transfer Bank BRI",
  "Transfer Bank Mandiri",
  "Transfer Bank BNI",
  "QRIS",
  "Tunai / Cash",
  "E-Wallet (Dana)",
  "E-Wallet (GoPay)",
  "E-Wallet (OVO)",
];

// Confirmation modal type
interface ConfirmAction {
  title: string;
  message: string;
  label: string;
  variant: "primary" | "green" | "red" | "amber";
  onConfirm: () => void;
}

export default function AdminTransactionsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchVal, setSearchVal] = useState("");

  // Detail panel
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  // Confirmation dialog
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Receipt modal
  const [activeReceipt, setActiveReceipt] = useState<BookingItem | null>(null);

  // Manual Add Booking Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [cars, setCars] = useState<{ id: number; name: string; price: number }[]>([]);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addFormData, setAddFormData] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    carId: 1,
    carName: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    duration: 1,
    serviceType: "Lepas Kunci",
    pickupLocation: "Kantor KGYK Yogyakarta",
    dropoffLocation: "Kantor KGYK Yogyakarta",
    totalPrice: 400000,
    status: "Disetujui",
    paymentStatus: "Lunas",
    paymentMethod: "Tunai / Cash",
    notes: "",
  });

  // Late fee modal
  const [lateFeeModalBooking, setLateFeeModalBooking] = useState<BookingItem | null>(null);
  const [lateHoursInput, setLateHoursInput] = useState<number>(1);

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Pagination state (Max 6 data per page)
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchVal]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  useEffect(() => {
    fetchBookings();
    fetchCars();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get("status");
      if (statusParam) {
        setStatusFilter(statusParam);
      }
    }
  }, []);

  const syncLocalBookings = (list: BookingItem[]) => {
    setBookings(list);
    setLocalBookings(list as any);
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        syncLocalBookings(data);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const res = await fetch("/api/cars");
      if (res.ok) {
        const data = await res.json();
        setCars(data);
        if (data.length > 0) {
          setAddFormData((prev) => ({
            ...prev,
            carId: data[0].id,
            carName: data[0].name,
            totalPrice: data[0].price,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch cars:", err);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addSubmitting) return;

    try {
      setAddSubmitting(true);
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addFormData,
          grandTotal: addFormData.totalPrice,
        }),
      });

      if (res.ok) {
        const newBooking = await res.json();
        syncLocalBookings([newBooking, ...bookings]);
        setIsAddModalOpen(false);
        triggerToast(`Berhasil menambahkan reservasi baru #${newBooking.bookingCode} untuk ${newBooking.userName}!`);
      } else {
        const errData = await res.json().catch(() => ({}));
        triggerToast(`Gagal menambahkan reservasi: ${errData.error || "Terjadi kesalahan"}`, "error");
      }
    } catch (err) {
      console.error("Failed to create booking:", err);
      triggerToast("Terjadi kesalahan sistem saat menambahkan reservasi.", "error");
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleUpdateStatus = async (bookingId: number, newStatus: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (newStatus === "Selesai" && targetBooking && targetBooking.paymentStatus !== "Lunas") {
      triggerToast(
        "Gagal menandai Selesai: Status pembayaran belum LUNAS. Silakan selesaikan pembayaran terlebih dahulu!",
        "error"
      );
      setConfirmAction(null);
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        const nextList = bookings.map((b) => (b.id === bookingId ? updated : b));
        syncLocalBookings(nextList);
        if (selectedBooking?.id === bookingId) setSelectedBooking(updated);

        const statusMessages: Record<string, string> = {
          Disetujui: `Berhasil menerima & menyetujui pesanan ${updated.bookingCode}!`,
          Ditolak: `Pesanan ${updated.bookingCode} telah berhasil ditolak.`,
          "Dalam Penyewaan": `Berhasil melepas kendaraan! Pesanan ${updated.bookingCode} kini dalam penyewaan.`,
          Selesai: `Pesanan ${updated.bookingCode} selesai & kendaraan berhasil dikembalikan.`,
          "Menunggu Verifikasi": `Status pesanan ${updated.bookingCode} dikembalikan ke Menunggu Verifikasi.`,
        };
        const toastMsg = statusMessages[newStatus] || `Berhasil mengubah status pesanan ${updated.bookingCode} menjadi "${newStatus}".`;
        triggerToast(toastMsg);
      } else {
        const errData = await res.json().catch(() => ({}));
        triggerToast(`Gagal memperbarui status: ${errData.error || "Terjadi kesalahan"}`, "error");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      triggerToast("Terjadi kesalahan koneksi saat memperbarui status.", "error");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleUpdatePaymentStatus = async (bookingId: number, newPaymentStatus: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (newPaymentStatus === "Lunas" && targetBooking) {
      if (!targetBooking.paymentMethod || targetBooking.paymentMethod === "Belum Dipilih") {
        triggerToast(
          "Gagal mengonfirmasi Lunas: Silakan pilih Metode Pembayaran terlebih dahulu!",
          "error"
        );
        setConfirmAction(null);
        return;
      }
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        const nextList = bookings.map((b) => (b.id === bookingId ? updated : b));
        syncLocalBookings(nextList);
        if (selectedBooking?.id === bookingId) setSelectedBooking(updated);

        const isLunas = newPaymentStatus === "Lunas";
        const toastMsg = isLunas
          ? `Berhasil mengonfirmasi pembayaran! Pesanan ${updated.bookingCode} kini LUNAS.`
          : `Status pembayaran pesanan ${updated.bookingCode} diubah menjadi Belum Bayar.`;
        triggerToast(toastMsg);
      } else {
        const errData = await res.json().catch(() => ({}));
        triggerToast(`Gagal memperbarui pembayaran: ${errData.error || "Terjadi kesalahan"}`, "error");
      }
    } catch (err) {
      console.error("Failed to update payment status:", err);
      triggerToast("Terjadi kesalahan koneksi saat memperbarui pembayaran.", "error");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleUpdatePaymentMethod = async (bookingId: number, newMethod: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: newMethod }),
      });
      if (res.ok) {
        const updated = await res.json();
        const nextList = bookings.map((b) => (b.id === bookingId ? updated : b));
        syncLocalBookings(nextList);
        if (selectedBooking?.id === bookingId) setSelectedBooking(updated);
        triggerToast(`Metode pembayaran pesanan ${updated.bookingCode} berhasil diubah menjadi "${newMethod}".`);
      } else {
        triggerToast("Gagal memperbarui metode pembayaran.", "error");
      }
    } catch (err) {
      console.error("Failed to update payment method:", err);
      triggerToast("Terjadi kesalahan koneksi saat memperbarui metode pembayaran.", "error");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleSaveLateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lateFeeModalBooking) return;

    const dailyRate = Math.round(lateFeeModalBooking.totalPrice / (lateFeeModalBooking.duration || 1));
    const hourlyFee = Math.round(dailyRate * 0.1);
    const calculatedFee = hourlyFee * lateHoursInput;
    const newGrandTotal = lateFeeModalBooking.totalPrice + calculatedFee;

    try {
      const res = await fetch(`/api/bookings/${lateFeeModalBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lateFeeHours: lateHoursInput,
          lateFee: calculatedFee,
          grandTotal: newGrandTotal,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        const nextList = bookings.map((b) =>
          b.id === lateFeeModalBooking.id ? updated : b
        );
        syncLocalBookings(nextList);
        if (selectedBooking?.id === lateFeeModalBooking.id) setSelectedBooking(updated);
        setLateFeeModalBooking(null);
        triggerToast(`Berhasil menambahkan denda keterlambatan ${lateHoursInput} jam (${formatRupiah(calculatedFee)}) untuk pesanan ${updated.bookingCode}!`);
      } else {
        triggerToast("Gagal memperbarui denda keterlambatan.", "error");
      }
    } catch (err) {
      console.error("Failed to save late fee:", err);
      triggerToast("Terjadi kesalahan koneksi saat menyimpan denda.", "error");
    }
  };

  // --- Confirmation helpers ---
  const confirmStatusChange = (booking: BookingItem, newStatus: string) => {
    if (newStatus === "Selesai" && booking.paymentStatus !== "Lunas") {
      triggerToast(
        "Tidak dapat menandai Selesai. Status pembayaran transaksi ini masih BELUM BAYAR (harus Lunas terlebih dahulu).",
        "error"
      );
      return;
    }

    const labels: Record<string, { title: string; msg: string; label: string; variant: ConfirmAction["variant"] }> = {
      Disetujui: {
        title: "Setujui Reservasi",
        msg: `Setujui reservasi ${booking.bookingCode} dari ${booking.userName} untuk ${booking.carName}?`,
        label: "Ya, Setujui",
        variant: "green",
      },
      "Dalam Penyewaan": {
        title: "Lepas Kendaraan",
        msg: `Ubah status menjadi "Dalam Penyewaan"? Mobil ${booking.carName} akan dianggap sedang disewakan.`,
        label: "Ya, Lepas Kendaraan",
        variant: "primary",
      },
      Selesai: {
        title: "Tandai Selesai",
        msg: `Tandai transaksi ${booking.bookingCode} sebagai selesai? Pastikan kendaraan sudah dikembalikan.`,
        label: "Ya, Tandai Selesai",
        variant: "primary",
      },
      Ditolak: {
        title: "Tolak Reservasi",
        msg: `Tolak reservasi ${booking.bookingCode} dari ${booking.userName}? Tindakan ini tidak bisa dibatalkan.`,
        label: "Ya, Tolak Reservasi",
        variant: "red",
      },
      "Menunggu Verifikasi": {
        title: "Reset ke Menunggu",
        msg: `Kembalikan status ${booking.bookingCode} ke "Menunggu Verifikasi"?`,
        label: "Ya, Reset Status",
        variant: "amber",
      },
    };

    const config = labels[newStatus];
    if (!config) return;

    setConfirmAction({
      title: config.title,
      message: config.msg,
      label: config.label,
      variant: config.variant,
      onConfirm: () => handleUpdateStatus(booking.id, newStatus),
    });
  };

  const confirmPaymentChange = (booking: BookingItem) => {
    const isLunas = booking.paymentStatus === "Lunas";
    if (!isLunas && (!booking.paymentMethod || booking.paymentMethod === "Belum Dipilih")) {
      triggerToast(
        "Silakan pilih Metode Pembayaran terlebih dahulu sebelum mengonfirmasi pembayaran LUNAS!",
        "error"
      );
      return;
    }

    setConfirmAction({
      title: isLunas ? "Batalkan Lunas" : "Konfirmasi Pembayaran Lunas",
      message: isLunas
        ? `Ubah status pembayaran ${booking.bookingCode} kembali ke "Belum Bayar"?`
        : `Konfirmasi bahwa pembayaran ${booking.bookingCode} sebesar ${formatRupiah(booking.grandTotal || booking.totalPrice)} sudah diterima (${booking.paymentMethod})?`,
      label: isLunas ? "Ya, Batalkan" : "Ya, Konfirmasi Lunas",
      variant: isLunas ? "amber" : "green",
      onConfirm: () =>
        handleUpdatePaymentStatus(booking.id, isLunas ? "Belum Bayar" : "Lunas"),
    });
  };

  const filteredBookings = bookings.filter((b) => {
    const matchStatus = statusFilter === "all" ? true : b.status === statusFilter;
    const matchSearch =
      b.bookingCode.toLowerCase().includes(searchVal.toLowerCase()) ||
      b.userName.toLowerCase().includes(searchVal.toLowerCase()) ||
      b.carName.toLowerCase().includes(searchVal.toLowerCase()) ||
      b.userEmail.toLowerCase().includes(searchVal.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const renderStatusBadge = (status: string) => {
    const map: Record<string, { icon: React.ReactNode; cls: string; text: string }> = {
      Disetujui: { icon: <PiCheckCircleFill />, cls: "bg-green-50 text-green-700 border-green-200", text: "Disetujui" },
      Ditolak: { icon: <PiXCircleFill />, cls: "bg-red-50 text-red-700 border-red-200", text: "Ditolak" },
      "Dalam Penyewaan": { icon: <PiCarFill />, cls: "bg-blue-50 text-blue-700 border-blue-200", text: "Dalam Penyewaan" },
      Selesai: { icon: <PiSealCheckFill />, cls: "bg-slate-100 text-slate-700 border-slate-200", text: "Selesai" },
    };
    const cfg = map[status] || { icon: <PiClockFill />, cls: "bg-amber-50 text-amber-700 border-amber-200", text: "Menunggu Verifikasi" };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${cfg.cls}`}>
        {cfg.icon} {cfg.text}
      </span>
    );
  };

  const confirmBtnCls: Record<string, string> = {
    primary: "bg-primary hover:bg-blue-700 text-white",
    green: "bg-emerald-600 hover:bg-emerald-700 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
    amber: "bg-amber-600 hover:bg-amber-700 text-white",
  };

  // Available next statuses for a given booking
  const getNextActions = (b: BookingItem) => {
    const actions: { label: string; status: string; variant: string }[] = [];
    if (b.status === "Menunggu Verifikasi") {
      actions.push({ label: "Setujui", status: "Disetujui", variant: "green" });
      actions.push({ label: "Tolak", status: "Ditolak", variant: "red" });
    }
    if (b.status === "Disetujui") {
      actions.push({ label: "Lepas Kendaraan", status: "Dalam Penyewaan", variant: "primary" });
      actions.push({ label: "Tolak", status: "Ditolak", variant: "red" });
    }
    if (b.status === "Dalam Penyewaan") {
      actions.push({ label: "Tandai Selesai", status: "Selesai", variant: "primary" });
    }
    return actions;
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] animate-fadeIn">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold text-white transition-all ${
              toast.type === "success"
                ? "bg-emerald-600 border-emerald-500 shadow-emerald-600/20"
                : "bg-red-600 border-red-500 shadow-red-600/20"
            }`}
          >
            <PiCheckCircleFill className="text-lg shrink-0 text-white" />
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white/80 hover:text-white p-0.5 cursor-pointer"
            >
              <PiX className="text-sm" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy tracking-tight">
            Operasional Transaksi
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Verifikasi pesanan, ubah status penyewaan, dan kelola pembayaran.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-98 self-start sm:self-auto"
        >
          <PiPlus className="text-base" /> Tambah Transaksi Manual
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-soft space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
          {[
            { id: "all", label: "Semua (" + bookings.length + ")" },
            { id: "Menunggu Verifikasi", label: "Menunggu (" + bookings.filter((b) => b.status === "Menunggu Verifikasi").length + ")" },
            { id: "Disetujui", label: "Disetujui (" + bookings.filter((b) => b.status === "Disetujui").length + ")" },
            { id: "Dalam Penyewaan", label: "Dalam Sewa (" + bookings.filter((b) => b.status === "Dalam Penyewaan").length + ")" },
            { id: "Selesai", label: "Selesai (" + bookings.filter((b) => b.status === "Selesai").length + ")" },
            { id: "Ditolak", label: "Ditolak (" + bookings.filter((b) => b.status === "Ditolak").length + ")" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Cari kode booking, nama, atau mobil..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          </div>
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            Menampilkan <strong className="text-navy">{filteredBookings.length}</strong> transaksi
          </span>
        </div>
      </div>

      {/* Main Content: Card List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 font-semibold">
          Memuat daftar transaksi reservasi...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <PiReceipt className="text-5xl mx-auto text-slate-300" />
          <p className="text-xs font-semibold">
            Tidak ada transaksi ditemukan pada kategori ini.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedBookings.map((b) => {
              const nextActions = getNextActions(b);
              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl border shadow-soft p-5 space-y-3 transition-all hover:shadow-md cursor-pointer ${
                    selectedBooking?.id === b.id ? "border-primary ring-2 ring-primary/15" : "border-slate-100"
                  }`}
                  onClick={() => setSelectedBooking(b)}
                >
                  {/* Card Header: Code + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-navy text-sm block">{b.bookingCode}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{formatDateShort(b.createdAt)}</span>
                    </div>
                    {renderStatusBadge(b.status)}
                  </div>

                  {/* Card Body: Key Info */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <PiUserFill className="text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-800 truncate">{b.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <PiCarFill className="text-slate-400 shrink-0" />
                      <span className="font-semibold truncate">{b.carName}</span>
                      <span className="text-[10px] text-slate-400">• {b.serviceType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <PiCalendarBlankFill className="text-slate-400 shrink-0" />
                      <span className="font-semibold">
                        {formatDateShort(b.startDate)} — {formatDateShort(b.endDate)}
                      </span>
                      <span className="text-[10px] text-slate-400">({b.duration} Hari)</span>
                    </div>
                  </div>

                  {/* Card Footer: Price + Payment Badge */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="font-extrabold text-navy text-sm">
                      {formatRupiah(b.grandTotal || b.totalPrice)}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                        b.paymentStatus === "Lunas"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {b.paymentStatus === "Lunas" ? <PiCheckCircleFill className="text-xs" /> : <PiClockFill className="text-xs" />}
                      {b.paymentStatus === "Lunas" ? "Lunas" : "Belum Bayar"}
                    </span>
                  </div>

                  {/* Quick Action Buttons (only if there are available next steps) */}
                  {nextActions.length > 0 && (
                    <div className="flex gap-2 pt-1">
                      {nextActions.map((act) => (
                        <button
                          key={act.status}
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmStatusChange(b, act.status);
                          }}
                          className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            act.variant === "green"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : act.variant === "red"
                              ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                              : "bg-blue-50 text-primary border border-blue-200 hover:bg-blue-100"
                          }`}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 bg-white p-4 rounded-2xl shadow-soft">
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan <strong className="text-navy">{startIndex + 1}</strong> -{" "}
                <strong className="text-navy">
                  {Math.min(startIndex + ITEMS_PER_PAGE, filteredBookings.length)}
                </strong>{" "}
                dari <strong className="text-navy">{filteredBookings.length}</strong> transaksi
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <PiCaretLeftBold className="text-xs" /> Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  Next <PiCaretRightBold className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === Detail Side Panel (Modal) === */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy/40 backdrop-blur-xs" onClick={() => setSelectedBooking(null)}>
          <div
            className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-base font-extrabold text-navy">Detail Transaksi</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 hover:text-navy flex items-center justify-center cursor-pointer"
              >
                <PiX className="text-lg" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Status & Booking Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-navy text-lg">{selectedBooking.bookingCode}</span>
                  {renderStatusBadge(selectedBooking.status)}
                </div>
                <span className="text-[10px] text-slate-400">Dibuat: {formatDateShort(selectedBooking.createdAt)}</span>
              </div>

              {/* Penyewa Info */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  <PiUserFill className="inline mr-1" />Data Penyewa
                </span>
                <div className="space-y-1">
                  <span className="font-bold text-navy block">{selectedBooking.userName}</span>
                  <span className="text-slate-500">{selectedBooking.userEmail}</span>
                  {selectedBooking.userPhone && (
                    <span className="text-slate-500 block">{selectedBooking.userPhone}</span>
                  )}
                </div>
              </div>

              {/* Kendaraan & Jadwal */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  <PiCarFill className="inline mr-1" />Kendaraan & Jadwal
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mobil</span>
                    <span className="font-bold text-navy">{selectedBooking.carName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jenis Layanan</span>
                    <span className="font-semibold text-slate-700">{selectedBooking.serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mulai</span>
                    <span className="font-semibold text-slate-700">{formatDateShort(selectedBooking.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selesai</span>
                    <span className="font-semibold text-slate-700">{formatDateShort(selectedBooking.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Durasi</span>
                    <span className="font-bold text-navy">{selectedBooking.duration} Hari</span>
                  </div>
                </div>
              </div>

              {/* Lokasi */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  <PiMapPinFill className="inline mr-1" />Lokasi
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jemput</span>
                    <span className="font-semibold text-slate-700 text-right max-w-[60%]">{selectedBooking.pickupLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Antar</span>
                    <span className="font-semibold text-slate-700 text-right max-w-[60%]">{selectedBooking.dropoffLocation}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    <PiNoteFill className="inline mr-1" />Catatan
                  </span>
                  <p className="text-slate-600 font-medium leading-relaxed">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Biaya */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  <PiCurrencyDollarFill className="inline mr-1" />Biaya
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Biaya Sewa ({selectedBooking.duration} Hari)</span>
                    <span className="font-bold text-slate-700">{formatRupiah(selectedBooking.totalPrice)}</span>
                  </div>
                  {Boolean(selectedBooking.lateFee && selectedBooking.lateFee > 0) && (
                    <div className="flex justify-between text-red-600">
                      <span className="font-bold">Denda ({selectedBooking.lateFeeHours} jam)</span>
                      <span className="font-bold">+{formatRupiah(selectedBooking.lateFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-navy text-sm border-t border-slate-200 pt-2">
                    <span>Total Akhir</span>
                    <span>{formatRupiah(selectedBooking.grandTotal || selectedBooking.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Payment status badge + toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Status Pembayaran</span>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                      selectedBooking.paymentStatus === "Lunas"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {selectedBooking.paymentStatus === "Lunas" ? <PiCheckCircleFill /> : <PiClockFill />}
                    {selectedBooking.paymentStatus === "Lunas" ? "LUNAS" : "BELUM BAYAR"}
                  </span>
                </div>
                <button
                  onClick={() => confirmPaymentChange(selectedBooking)}
                  className="px-3.5 py-2 bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-[11px] transition-all cursor-pointer"
                >
                  Ubah Status
                </button>
              </div>

              {/* Payment method selector */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  <PiCurrencyDollarFill className="inline mr-1" />Metode Pembayaran
                </span>
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-xs font-bold ${
                    selectedBooking.paymentMethod === "Belum Dipilih" ? "text-amber-600" : "text-navy"
                  }`}>
                    {selectedBooking.paymentMethod || "Belum Dipilih"}
                  </span>
                  <select
                    value={selectedBooking.paymentMethod || "Belum Dipilih"}
                    onChange={(e) => {
                      const newMethod = e.target.value;
                      setConfirmAction({
                        title: "Ubah Metode Pembayaran",
                        message: `Ubah metode pembayaran transaksi ${selectedBooking.bookingCode} menjadi "${newMethod}"?`,
                        label: "Ya, Ubah Metode",
                        variant: "primary",
                        onConfirm: () => handleUpdatePaymentMethod(selectedBooking.id, newMethod),
                      });
                    }}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer hover:bg-slate-100 transition-all"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* --- Action Buttons --- */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Kelola Transaksi</span>

                {/* Status change buttons */}
                {getNextActions(selectedBooking).map((act) => (
                  <button
                    key={act.status}
                    onClick={() => confirmStatusChange(selectedBooking, act.status)}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      act.variant === "green"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : act.variant === "red"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-primary hover:bg-blue-700 text-white"
                    }`}
                  >
                    <PiArrowRightBold className="text-sm" />
                    {act.label}
                  </button>
                ))}

                {/* Denda button */}
                <button
                  onClick={() => {
                    setLateFeeModalBooking(selectedBooking);
                    setLateHoursInput(selectedBooking.lateFeeHours || 1);
                  }}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  + Input Denda Keterlambatan
                </button>

                {/* Struk button */}
                <button
                  onClick={() => setActiveReceipt(selectedBooking)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PiReceipt className="text-sm" /> Lihat Struk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Confirmation Modal === */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
              <PiWarningCircleFill className="text-3xl text-slate-500" />
            </div>
            <h3 className="text-base font-extrabold text-navy">{confirmAction.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{confirmAction.message}</p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmAction.onConfirm}
                disabled={actionLoading}
                className={`flex-1 py-2.5 font-bold rounded-xl text-xs shadow-md cursor-pointer transition-all disabled:opacity-50 ${
                  confirmBtnCls[confirmAction.variant]
                }`}
              >
                {actionLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Memproses...</span>
                  </>
                ) : (
                  confirmAction.label
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Late Fee Modal === */}
      {lateFeeModalBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-navy">
                Hitung Denda Keterlambatan
              </h3>
              <button
                onClick={() => setLateFeeModalBooking(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-navy flex items-center justify-center cursor-pointer"
              >
                <PiX className="text-base" />
              </button>
            </div>

            <form onSubmit={handleSaveLateFee} className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <span className="font-bold text-slate-700 block">
                  {lateFeeModalBooking.bookingCode} • {lateFeeModalBooking.carName}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Harga Sewa: {formatRupiah(lateFeeModalBooking.totalPrice)} ({lateFeeModalBooking.duration} Hari)
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Jumlah Jam Keterlambatan *
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold text-navy"
                  value={lateHoursInput}
                  onChange={(e) => setLateHoursInput(Number(e.target.value))}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  * Tarif denda: 10% dari sewa harian per jam keterlambatan.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLateFeeModalBooking(null)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Denda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === View Receipt Modal === */}
      {activeReceipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-navy">
                Struk Reservasi #{activeReceipt.bookingCode}
              </h3>
              <button
                onClick={() => setActiveReceipt(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-navy flex items-center justify-center cursor-pointer"
              >
                <PiX className="text-lg" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 font-sans text-xs">
              <div className="text-center border-b border-slate-200 pb-3">
                <h4 className="font-black text-navy text-sm">KGYK RENTAL MOBIL</h4>
                <p className="text-[10px] text-slate-400">
                  Sleman, DI Yogyakarta • +62 812 3456 7890
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-bold block">Penyewa</span>
                  <span className="font-bold text-slate-700">{activeReceipt.userName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-bold block">Kendaraan</span>
                  <span className="font-bold text-slate-700">{activeReceipt.carName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-bold block">Mulai Sewa</span>
                  <span className="font-semibold text-slate-700">{formatDateShort(activeReceipt.startDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-bold block">Selesai Sewa</span>
                  <span className="font-semibold text-slate-700">{formatDateShort(activeReceipt.endDate)}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-1">
                <div className="flex justify-between">
                  <span>Biaya Sewa ({activeReceipt.duration} Hari)</span>
                  <span className="font-bold">{formatRupiah(activeReceipt.totalPrice)}</span>
                </div>
                {Boolean(activeReceipt.lateFee && activeReceipt.lateFee > 0) && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Denda Keterlambatan ({activeReceipt.lateFeeHours} jam)</span>
                    <span>+{formatRupiah(activeReceipt.lateFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-navy text-sm border-t border-slate-200 pt-2">
                  <span>TOTAL AKHIR</span>
                  <span>{formatRupiah(activeReceipt.grandTotal || activeReceipt.totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <PiPrinter className="text-base" /> Cetak Struk
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Add Manual Booking Modal === */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-navy">
                  Tambah Reservasi Manual
                </h3>
                <p className="text-[11px] text-slate-400">
                  Input pesanan walk-in / pemesanan langsung offline.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-navy flex items-center justify-center cursor-pointer"
              >
                <PiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Informasi Pemesan
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      value={addFormData.userName}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, userName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Email Penyewa *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="budi@gmail.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      value={addFormData.userEmail}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, userEmail: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                    value={addFormData.userPhone}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, userPhone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Kendaraan & Jadwal
                </span>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Pilih Unit Mobil *
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-navy cursor-pointer"
                    value={addFormData.carId}
                    onChange={(e) => {
                      const selectedCar = cars.find(
                        (c) => c.id === Number(e.target.value)
                      );
                      if (selectedCar) {
                        setAddFormData({
                          ...addFormData,
                          carId: selectedCar.id,
                          carName: selectedCar.name,
                          totalPrice: selectedCar.price * addFormData.duration,
                        });
                      }
                    }}
                  >
                    {cars.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {formatRupiah(c.price)}/hari
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Mulai Sewa *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      value={addFormData.startDate}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Selesai Sewa *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      value={addFormData.endDate}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Durasi (Hari) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-navy"
                      value={addFormData.duration}
                      onChange={(e) => {
                        const dur = Number(e.target.value);
                        const selectedCar = cars.find(
                          (c) => c.id === addFormData.carId
                        );
                        const pricePerDay = selectedCar ? selectedCar.price : 400000;
                        setAddFormData({
                          ...addFormData,
                          duration: dur,
                          totalPrice: pricePerDay * dur,
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Jenis Layanan
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
                      value={addFormData.serviceType}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, serviceType: e.target.value })
                      }
                    >
                      <option value="Lepas Kunci">Lepas Kunci</option>
                      <option value="Dengan Driver">Dengan Driver</option>
                      <option value="Drop Off Airport">Drop Off Airport</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Total Biaya Sewa (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-navy"
                      value={addFormData.totalPrice}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          totalPrice: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Status & Pembayaran
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Status Transaksi
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
                      value={addFormData.status}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, status: e.target.value })
                      }
                    >
                      <option value="Disetujui">Disetujui</option>
                      <option value="Dalam Penyewaan">Dalam Penyewaan</option>
                      <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Status Pembayaran
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
                      value={addFormData.paymentStatus}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          paymentStatus: e.target.value,
                        })
                      }
                    >
                      <option value="Lunas">Lunas</option>
                      <option value="Belum Bayar">Belum Bayar</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Metode Pembayaran
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
                      value={addFormData.paymentMethod}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          paymentMethod: e.target.value,
                        })
                      }
                    >
                      <option value="Tunai / Cash">Tunai / Cash</option>
                      <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                      <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                      <option value="QRIS">QRIS</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={addSubmitting}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="px-5 py-2.5 bg-primary hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {addSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Menyimpan Transaksi...</span>
                    </>
                  ) : (
                    "Simpan Transaksi"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-in animation style */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}

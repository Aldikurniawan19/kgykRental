"use client";

import { useEffect, useMemo, useState } from "react";
import { cars } from "@/data/cars";
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
  PiMapPinFill,
  PiPhoneFill,
  PiEnvelopeSimpleFill,
  PiInstagramLogoFill,
  PiFacebookLogoFill,
  PiTwitterLogoFill,
  PiLock,
  PiUpload,
  PiCheckCircle,
  PiCheckCircleFill,
} from "react-icons/pi";

export default function BookingForm() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [carList, setCarList] = useState(cars);
  const [formCar, setFormCar] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [message, setMessage] = useState("");
  const [docName, setDocName] = useState("");
  const [showSplash, setShowSplash] = useState(false);
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
    const updateAuth = () => setUser(getCurrentUser());
    window.addEventListener("auth-changed", updateAuth);
    const syncTimer = setTimeout(updateAuth, 0);
    return () => {
      window.removeEventListener("auth-changed", updateAuth);
      clearTimeout(syncTimer);
    };
  }, []);

  const calculateDuration = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (!startStr || !endStr || end < start) return null;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const estimate = useMemo(() => {
    const car = cars.find((c) => c.name === formCar);
    const days = calculateDuration(dateStart, dateEnd);
    if (!car || days === null) return null;
    return {
      days,
      day: formatRupiah(car.price),
      total: formatRupiah(car.price * days),
    };
  }, [formCar, dateStart, dateEnd]);

  const duration = estimate ? estimate.days.toString() : "";

  useEffect(() => {
    const handleBookCar = (e: Event) => {
      const detail = (e as CustomEvent).detail as { carName: string };
      if (!detail?.carName) return;
      setFormCar(detail.carName);
      const bookingSection = document.getElementById("reservasi");
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("app:book-car", handleBookCar);
    return () => window.removeEventListener("app:book-car", handleBookCar);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const carParam = urlParams.get("car");
    const startParam = urlParams.get("start");
    const endParam = urlParams.get("end");

    const carMatch = carParam
      ? cars.find((c) => c.name.toLowerCase() === carParam.toLowerCase())
      : undefined;
    const hasParam = !!carMatch || !!startParam || !!endParam;
    if (!hasParam) return;

    setTimeout(() => {
      if (carMatch) setFormCar(carMatch.name);
      if (startParam) setDateStart(startParam);
      if (endParam) setDateEnd(endParam);

      const reservationSection = document.getElementById("reservasi");
      if (reservationSection) {
        reservationSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 300);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) {
      showToast("Silakan login terlebih dahulu untuk melakukan pemesanan.", "error");
      return;
    }

    if (!formCar || !dateStart || !dateEnd) return;

    const car = carList.find((c) => c.name === formCar);
    if (!car) {
      showToast("Silakan pilih kendaraan.", "error");
      return;
    }

    const start = new Date(dateStart);
    const end = new Date(dateEnd);

    if (end < start) {
      showToast("Tanggal selesai tidak boleh sebelum tanggal mulai.", "error");
      return;
    }

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
      showToast(
        `Maaf, mobil ${formCar} tidak tersedia pada tanggal tersebut.`,
        "error"
      );
      return;
    }

    const bookingCode = generateBookingCode();
    const totalPrice = car.price * diffDays;

    let newBooking: Booking = {
      id: Date.now(),
      bookingCode,
      userEmail: currentUser.email,
      userName: currentUser.fullName,
      carId: car.id,
      carName: car.name,
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

    // Sync with SQLite Database API so it appears live in the Admin Dashboard!
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingCode,
          userEmail: currentUser.email,
          userName: currentUser.fullName,
          carId: car.id,
          carName: car.name,
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
      setFormCar("");
      setDateStart("");
      setDateEnd("");
      setMessage("");
      setDocName("");
      window.dispatchEvent(new CustomEvent("booking-success"));
    }, 1800);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-slate-50 focus:bg-white text-slate-700 text-sm";
  const disabledInputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm font-medium cursor-not-allowed";

  return (
    <section id="reservasi" className="py-20 bg-lightbg relative border-t border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden" data-gsap="fade-up">
          <div className="flex flex-col lg:flex-row">
            {/* Info Kontak Panel */}
            <div className="lg:w-2/5 bg-navy text-white p-10 lg:p-12 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>

              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-2">Hubungi Kami</h3>
                <p className="text-slate-300 mb-10">
                  Tim kami siap melayani kebutuhan transportasi Anda 24/7 di
                  Yogyakarta.
                </p>

                <div className="space-y-6 mb-12">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <PiMapPinFill className="text-accent text-xl" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300">Lokasi Garasi</h4>
                      <p className="text-white text-sm">
                        {contactSettings.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <PiPhoneFill className="text-accent text-xl" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300">Telepon & WA</h4>
                      <p className="text-white text-sm">{contactSettings.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <PiEnvelopeSimpleFill className="text-accent text-xl" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300">Email</h4>
                      <p className="text-white text-sm">{contactSettings.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-6 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-3">Ikuti Media Sosial Kami</p>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="w-9 h-9 bg-white/10 hover:bg-primary rounded-xl flex items-center justify-center text-white transition-colors"
                  >
                    <PiInstagramLogoFill className="text-lg" />
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 bg-white/10 hover:bg-primary rounded-xl flex items-center justify-center text-white transition-colors"
                  >
                    <PiFacebookLogoFill className="text-lg" />
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 bg-white/10 hover:bg-primary rounded-xl flex items-center justify-center text-white transition-colors"
                  >
                    <PiTwitterLogoFill className="text-lg" />
                  </a>
                </div>
              </div>
            </div>

            {/* Dynamic Form Panel */}
            <div className="lg:w-3/5 p-10 lg:p-12 relative flex items-center">
              {!user ? (
                <div className="w-full text-center py-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6 border border-slate-200">
                    <PiLock className="text-4xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy mb-2">
                    Pemesanan Online Terkunci
                  </h3>
                  <p className="text-slate-500 text-sm max-w-sm mb-8">
                    Untuk menjamin kenyamanan bertransaksi, silakan masuk ke akun Anda
                    atau mendaftar terlebih dahulu.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => openLoginModal()}
                      className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                    >
                      Masuk ke Akun
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
                <div className="w-full">
                  <h3 className="text-2xl font-bold text-navy mb-6">
                    Form Pemesanan Online
                  </h3>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Nama Pelanggan
                        </label>
                        <input
                          type="text"
                          id="formName"
                          disabled
                          className={disabledInputClass}
                          value={user.fullName}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Pilihan Mobil
                        </label>
                        <select
                          id="formCar"
                          required
                          className={inputClass}
                          value={formCar}
                          onChange={(e) => setFormCar(e.target.value)}
                        >
                          <option value="">Pilih Armada Mobil</option>
                          {carList.map((car) => (
                            <option key={car.id} value={car.name}>
                              {car.name} ({car.type}) {!car.status ? "- (Tidak Tersedia)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Tanggal Mulai Sewa
                        </label>
                        <input
                          type="date"
                          id="formDateStart"
                          required
                          className={inputClass}
                          value={dateStart}
                          onChange={(e) => setDateStart(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Tanggal Selesai Sewa
                        </label>
                        <input
                          type="date"
                          id="formDateEnd"
                          required
                          className={inputClass}
                          value={dateEnd}
                          onChange={(e) => setDateEnd(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Durasi Sewa (Hari)
                        </label>
                        <input
                          type="number"
                          id="formDuration"
                          disabled
                          className={disabledInputClass}
                          placeholder="Otomatis"
                          value={duration}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Pesan Tambahan
                        </label>
                        <textarea
                          id="formMessage"
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-slate-50 focus:bg-white resize-none text-slate-800 text-sm"
                          placeholder="Catatan tambahan untuk admin..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Upload Identitas (KTP / SIM A)
                        </label>
                        <div
                          className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary hover:bg-slate-50/50 transition-colors"
                          onClick={() =>
                            document.getElementById("formDoc")?.click()
                          }
                        >
                          <PiUpload className="text-2xl text-slate-400 mb-1 mx-auto" />
                          <p className="text-xs text-slate-500 font-semibold">
                            {docName
                              ? docName
                              : "Klik atau tarik file ke area ini"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            PDF, PNG, JPG (Maks. 5MB)
                          </p>
                          <input
                            type="file"
                            id="formDoc"
                            className="hidden"
                            onChange={(e) =>
                              setDocName(e.target.files?.[0]?.name ?? "")
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {estimate && (
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex justify-between items-center animate-fade-in">
                        <div>
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            Estimasi Biaya Sewa
                          </span>
                          <p className="text-xs text-slate-500">
                            {estimate.days} hari sewa
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500">Total Biaya:</span>
                          <p className="text-2xl font-extrabold text-navy">
                            {estimate.total}
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full flex justify-center items-center gap-2 py-4 px-8 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                    >
                      <PiCheckCircle className="text-2xl" />
                      Konfirmasi Booking Mobil
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSplash && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-navy/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-sm w-full mx-4 text-center shadow-2xl flex flex-col items-center animate-scale-up">
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              {/* Smooth Single-Spin SVG Loading Ring */}
              <svg
                className="w-full h-full transform -rotate-90 animate-spin-once"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-100"
                  strokeWidth="6"
                  fill="none"
                />
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

              {/* Center Success Badge with Smooth Pop Effect */}
              <div className="absolute inset-0 m-auto w-16 h-16 bg-gradient-to-tr from-green-500 to-emerald-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-pop-scale">
                <PiCheckCircleFill className="text-4xl" />
              </div>
            </div>

            <h3 className="text-2xl font-extrabold text-navy mb-2">
              Pesanan Berhasil Dibuat!
            </h3>
            <p className="text-slate-500 text-sm">
              Menyiapkan Struk & Nota Pemesanan Anda...
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
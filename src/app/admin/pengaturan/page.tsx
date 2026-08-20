"use client";

import { useState, useEffect } from "react";
import {
  PiKey,
  PiEnvelopeSimple,
  PiLockKey,
  PiCheckCircle,
  PiWarningCircle,
  PiSpinner,
  PiSlidersHorizontalFill,
  PiGlobeFill,
  PiEyeBold,
  PiEyeSlashBold,
} from "react-icons/pi";

interface SettingsData {
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
}

const DEFAULT_SETTINGS: SettingsData = {
  whatsapp: "62881023331644",
  phone: "+62 881-0233-31644",
  email: "info@kgykrental.com",
  address: "Jl. Pandega Marga, Caturtunggal, Depok, Sleman, Yogyakarta 55281",
};

export default function AdminPengaturanPage() {
  const [formData, setFormData] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Admin Account Credentials State
  const [adminEmail, setAdminEmail] = useState("admin@kgyk.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [savingAdminCreds, setSavingAdminCreds] = useState(false);
  const [adminCredsStatus, setAdminCredsStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchAdminCredentials();
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  useEffect(() => {
    if (!adminCredsStatus) return;
    const timer = setTimeout(() => {
      setAdminCredsStatus(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [adminCredsStatus]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setFormData({
          whatsapp: data.whatsapp || DEFAULT_SETTINGS.whatsapp,
          phone: data.phone || DEFAULT_SETTINGS.phone,
          email: data.email || DEFAULT_SETTINGS.email,
          address: data.address || DEFAULT_SETTINGS.address,
        });
      }
    } catch (error) {
      console.error("Gagal mengambil data pengaturan:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminCredentials = async () => {
    try {
      const res = await fetch("/api/admin/credentials");
      if (res.ok) {
        const data = await res.json();
        if (data.adminEmail) {
          setAdminEmail(data.adminEmail);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil email admin:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const savedData = await res.json();
        setFormData({
          whatsapp: savedData.whatsapp || formData.whatsapp,
          phone: savedData.phone || formData.phone,
          email: savedData.email || formData.email,
          address: savedData.address || formData.address,
        });
        setStatusMessage({
          type: "success",
          text: "Pengaturan kontak publik berhasil disimpan.",
        });
      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: "Gagal menyimpan pengaturan. Silakan coba lagi.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAdminCredsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCredsStatus(null);

    if (!currentPassword) {
      setAdminCredsStatus({
        type: "error",
        text: "Kata sandi lama wajib diisi untuk konfirmasi keamanan.",
      });
      return;
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      setAdminCredsStatus({
        type: "error",
        text: "Kata sandi baru dan konfirmasi kata sandi tidak cocok.",
      });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setAdminCredsStatus({
        type: "error",
        text: "Kata sandi baru minimal harus 6 karakter.",
      });
      return;
    }

    setSavingAdminCreds(true);

    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newAdminEmail: adminEmail,
          newAdminPassword: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAdminCredsStatus({
          type: "success",
          text: "Kredensial email & kata sandi admin berhasil diperbarui!",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setAdminCredsStatus({
          type: "error",
          text: data.error || "Gagal memperbarui kredensial admin.",
        });
      }
    } catch (err) {
      setAdminCredsStatus({
        type: "error",
        text: "Terjadi kesalahan jaringan saat memperbarui kredensial admin.",
      });
    } finally {
      setSavingAdminCreds(false);
    }
  };

  const handleResetDefault = () => {
    if (confirm("Kembalikan ke pengaturan awal kontak?")) {
      setFormData(DEFAULT_SETTINGS);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-xs text-slate-500 font-medium flex items-center gap-2">
        <PiSpinner className="animate-spin text-base text-primary" />
        <span>Memuat data pengaturan...</span>
      </div>
    );
  }

  const cleanWaNumber = formData.whatsapp.replace(/[^0-9]/g, "");

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-sans text-slate-800 relative">
      {/* Loading Screen Overlay */}
      {saving && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-slate-900 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 max-w-xs w-full text-center border border-slate-100">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-800">Menyimpan Pengaturan...</span>
          </div>
        </div>
      )}

      {/* Header Halaman */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-extrabold text-navy">Pengaturan</h1>
        <p className="text-xs text-slate-500 mt-1">
          Kelola akun administrator dan informasi kontak publik website KGYK Rental.
        </p>
      </div>

      {/* Grid Layout Kanan-Kiri (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* KOLOM KIRI: EDIT AKUN ADMIN */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
              <PiKey />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-navy">Edit Akun & Kata Sandi Admin</h2>
              <p className="text-xs text-slate-500">
                Ubah email login dan kata sandi akses panel admin
              </p>
            </div>
          </div>

          {/* Notifikasi Status Akun Admin */}
          {adminCredsStatus && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
                adminCredsStatus.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {adminCredsStatus.type === "success" ? (
                  <PiCheckCircle className="text-base text-emerald-600 shrink-0" />
                ) : (
                  <PiWarningCircle className="text-base text-red-600 shrink-0" />
                )}
                <span>{adminCredsStatus.text}</span>
              </div>
              <button
                onClick={() => setAdminCredsStatus(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base px-2 cursor-pointer leading-none"
              >
                &times;
              </button>
            </div>
          )}

          <form onSubmit={handleAdminCredsSubmit} className="space-y-4 text-xs">
            {/* Email Admin */}
            <div>
              <label className="block font-bold text-navy mb-1">
                Email Login Admin
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  disabled={savingAdminCreds}
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@kgyk.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-primary transition-all disabled:opacity-50"
                />
                <PiEnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              </div>
            </div>

            {/* Password Lama (Wajib) */}
            <div>
              <label className="block font-bold text-navy mb-1">
                Kata Sandi Lama <span className="text-red-500">* (Wajib)</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  disabled={savingAdminCreds}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama Anda"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-primary transition-all disabled:opacity-50"
                />
                <PiLockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
                  title={showCurrentPassword ? "Sembunyikan Kata Sandi" : "Lihat Kata Sandi"}
                >
                  {showCurrentPassword ? (
                    <PiEyeSlashBold className="text-base" />
                  ) : (
                    <PiEyeBold className="text-base" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Baru (Opsional) */}
            <div>
              <label className="block font-bold text-navy mb-1">
                Kata Sandi Baru <span className="text-slate-400 font-normal">(Kosongkan jika tidak diubah)</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  disabled={savingAdminCreds}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-primary transition-all disabled:opacity-50"
                />
                <PiLockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
                  title={showNewPassword ? "Sembunyikan Kata Sandi" : "Lihat Kata Sandi"}
                >
                  {showNewPassword ? (
                    <PiEyeSlashBold className="text-base" />
                  ) : (
                    <PiEyeBold className="text-base" />
                  )}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password Baru */}
            <div>
              <label className="block font-bold text-navy mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmNewPassword ? "text" : "password"}
                  disabled={savingAdminCreds}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-primary transition-all disabled:opacity-50"
                />
                <PiLockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
                  title={showConfirmNewPassword ? "Sembunyikan Kata Sandi" : "Lihat Kata Sandi"}
                >
                  {showConfirmNewPassword ? (
                    <PiEyeSlashBold className="text-base" />
                  ) : (
                    <PiEyeBold className="text-base" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingAdminCreds}
                className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {savingAdminCreds ? (
                  <>
                    <PiSpinner className="animate-spin text-base" />
                    <span>Memperbarui Akun...</span>
                  </>
                ) : (
                  <span>Perbarui Akun Admin</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* KOLOM KANAN: EDIT DATA WEBSITE */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
                  <PiGlobeFill />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy">Edit Data Website & Kontak</h2>
                  <p className="text-xs text-slate-500">
                    Atur kontak dan alamat garasi pada website utama
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetDefault}
                className="text-xs text-slate-600 hover:text-navy border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Reset Default
              </button>
            </div>

            {/* Notifikasi Status Kontak Publik */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
                  statusMessage.type === "success"
                    ? "bg-emerald-600 text-white border border-emerald-700"
                    : "bg-red-600 text-white border border-red-700"
                }`}
              >
                <span>{statusMessage.text}</span>
                <button
                  onClick={() => setStatusMessage(null)}
                  className="text-white/80 hover:text-white font-bold text-base px-2 cursor-pointer leading-none"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Form Edit Data Website */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* WhatsApp */}
                <div>
                  <label className="block font-bold text-navy mb-1">
                    Nomor WhatsApp Garasi
                  </label>
                  <input
                    type="text"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="62881023331644"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 transition-all"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Format: 628xxx (tanpa + atau spasi)
                  </span>
                </div>

                {/* Telepon */}
                <div>
                  <label className="block font-bold text-navy mb-1">
                    Nomor Telepon Display
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+62 881-0233-31644"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-navy mb-1">
                  Email Official Operasional
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="info@kgykrental.com"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 transition-all"
                />
              </div>

              {/* Alamat */}
              <div>
                <label className="block font-bold text-navy mb-1">
                  Alamat Garasi & Kantor Utama
                </label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Alamat lengkap..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 transition-all resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Data Website</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Pratinjau Tampilan Kontak Publik */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-xs space-y-3">
            <span className="font-extrabold text-navy block border-b border-slate-200 pb-2">
              Pratinjau Live Kontak Website
            </span>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                <span className="font-semibold text-slate-500">WhatsApp:</span>
                <span className="font-bold text-navy">wa.me/{cleanWaNumber}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                <span className="font-semibold text-slate-500">Telepon Display:</span>
                <span className="font-bold text-navy">{formData.phone}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                <span className="font-semibold text-slate-500">Email Official:</span>
                <span className="font-bold text-navy">{formData.email}</span>
              </div>
              <div className="pt-1">
                <span className="font-semibold text-slate-500 block mb-1">Alamat Garasi:</span>
                <span className="font-medium text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 block leading-relaxed">
                  {formData.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

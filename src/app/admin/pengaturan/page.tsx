"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

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
          text: "Pengaturan berhasil disimpan.",
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

  const handleResetDefault = () => {
    if (confirm("Kembalikan ke pengaturan awal?")) {
      setFormData(DEFAULT_SETTINGS);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-xs text-slate-500 font-medium">
        Memuat data pengaturan...
      </div>
    );
  }

  const cleanWaNumber = formData.whatsapp.replace(/[^0-9]/g, "");

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans text-slate-800 relative">
      {/* Loading Screen Overlay */}
      {saving && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-slate-900 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 max-w-xs w-full text-center border border-slate-100">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-800">Menyimpan Pengaturan...</span>
          </div>
        </div>
      )}

      {/* Header Minimalis */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Pengaturan Kontak Publik</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur informasi kontak dan alamat yang ditampilkan pada website publik.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefault}
          className="text-xs text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Reset Default
        </button>
      </div>

      {/* Notifikasi Status (Hijau untuk sukses) */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
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

      {/* Form Minimalis */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor WhatsApp
              </label>
              <input
                type="text"
                name="whatsapp"
                required
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="62881023331644"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-slate-500 transition-colors"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Format: 628xxx (tanpa + atau spasi)
              </span>
            </div>

            {/* Telepon */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon Display
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+62 881-0233-31644"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-slate-500 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Operasional
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="info@kgykrental.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Garasi & Kantor
            </label>
            <textarea
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Alamat lengkap..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-slate-500 transition-colors resize-none"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>

      {/* Ringkasan Pratinjau Minimalis */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
        <span className="font-semibold text-slate-700 block">Pratinjau Tampilan Ringkas</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
          <div><strong className="text-slate-800">WA:</strong> wa.me/{cleanWaNumber}</div>
          <div><strong className="text-slate-800">Telepon:</strong> {formData.phone}</div>
          <div><strong className="text-slate-800">Email:</strong> {formData.email}</div>
          <div className="md:col-span-2"><strong className="text-slate-800">Alamat:</strong> {formData.address}</div>
        </div>
      </div>
    </div>
  );
}

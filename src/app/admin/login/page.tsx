"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PiLockKeyFill,
  PiEnvelopeSimpleFill,
  PiEyeFill,
  PiEyeSlashFill,
  PiHouseFill,
  PiArrowRightBold,
} from "react-icons/pi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@kgyk.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("kgyk_admin_auth", "true");
        localStorage.setItem("kgyk_admin_user", JSON.stringify(data.user));
        router.push("/admin");
      } else {
        setError(data.error || "Email atau kata sandi tidak valid.");
      }
    } catch (err) {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 flex items-center justify-center p-4 sm:p-6 font-sans text-slate-800">
      <div className="w-full max-w-md space-y-5">
        {/* Card Form */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Header & Logo */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-sm">
                K
              </span>
              <span className="text-xl font-black text-navy tracking-tight">
                KGYK <span className="text-primary font-bold">Admin</span>
              </span>
            </Link>
            <div>
              <h1 className="text-lg font-black text-navy">Login Admin Operasional</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan email dan kata sandi untuk mengelola website
              </p>
            </div>
          </div>

          {/* Clean Hint Box */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-600 space-y-0.5">
            <span className="font-bold text-navy block">Kredensial Default:</span>
            <div className="flex justify-between font-mono text-[10px] text-slate-700">
              <span>Email: <strong>admin@kgyk.com</strong></span>
              <span>Password: <strong>admin123</strong></span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <label className="font-extrabold text-navy block mb-1.5">
                Email / Username Admin
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="admin@kgyk.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <PiEnvelopeSimpleFill className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="font-extrabold text-navy block mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <PiLockKeyFill className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? (
                    <PiEyeSlashFill className="text-base" />
                  ) : (
                    <PiEyeFill className="text-base" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  Masuk ke Dashboard <PiArrowRightBold className="text-xs" />
                </>
              )}
            </button>
          </form>

          {/* Footer Return Home */}
          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary font-bold transition-colors"
            >
              <PiHouseFill className="text-sm" /> Kembali ke Website Utama
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

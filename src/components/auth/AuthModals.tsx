"use client";

import { useEffect, useState } from "react";
import {
  setCurrentUser,
  notifyAuthChanged,
  showToast,
} from "@/lib/app";
import { PiX, PiEye, PiEyeSlash } from "react-icons/pi";

export default function AuthModals() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  useEffect(() => {
    const openLogin = () => {
      setLoginError(null);
      setRegisterOpen(false);
      setLoginOpen(true);
    };

    const openRegister = () => {
      setRegisterError(null);
      setLoginOpen(false);
      setRegisterOpen(true);
    };

    window.addEventListener("app:open-login", openLogin);
    window.addEventListener("app:open-register", openRegister);

    return () => {
      window.removeEventListener("app:open-login", openLogin);
      window.removeEventListener("app:open-register", openRegister);
    };
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    const fullName = registerName.trim();
    const email = registerEmail.trim();
    const phone = registerPhone.trim();

    if (registerPassword.length < 8) {
      setRegisterError("Password minimal harus 8 karakter.");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password: registerPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error || "Gagal mendaftarkan akun.");
        return;
      }

      const newUser = { fullName: data.fullName, email: data.email, phone: data.phone };
      setCurrentUser(newUser);
      notifyAuthChanged();

      setRegisterOpen(false);
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPhone("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");

      showToast(`Pendaftaran berhasil! Selamat datang, ${fullName}.`, "success");
    } catch (err: any) {
      setRegisterError("Terjadi kesalahan sistem saat mendaftar.");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword;

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Email atau password salah.");
        return;
      }

      const user = { fullName: data.fullName, email: data.email, phone: data.phone };
      setCurrentUser(user);
      notifyAuthChanged();

      setLoginOpen(false);
      setLoginEmail("");
      setLoginPassword("");

      showToast(`Selamat datang kembali, ${user.fullName}!`, "success");
    } catch (err: any) {
      setLoginError("Terjadi kesalahan sistem saat login.");
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 text-sm";

  return (
    <>
      {/* Login Modal */}
      {loginOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setLoginOpen(false)}
          ></div>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 transform scale-100 opacity-100 transition-all duration-300 shadow-2xl border border-slate-100">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-2xl"
              onClick={() => setLoginOpen(false)}
            >
              <PiX />
            </button>
            <h3 className="text-2xl font-bold text-navy mb-2">
              Masuk ke Akun Anda
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Silakan login untuk melakukan pemesanan mobil.
            </p>

            {loginError && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-4 border border-red-100">
                {loginError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className={inputClass}
                  placeholder="nama@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    className={`${inputClass} pr-10`}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                    title={showLoginPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                  >
                    {showLoginPassword ? (
                      <PiEyeSlash className="text-lg" />
                    ) : (
                      <PiEye className="text-lg" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md cursor-pointer"
              >
                Masuk
              </button>
            </form>
            <p className="text-slate-500 text-sm text-center mt-6">
              Belum punya akun?{" "}
              <button
                className="text-primary font-semibold hover:underline cursor-pointer"
                onClick={() => {
                  setLoginError(null);
                  setLoginOpen(false);
                  setRegisterOpen(true);
                }}
              >
                Daftar sekarang
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {registerOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setRegisterOpen(false)}
          ></div>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 transform scale-100 opacity-100 transition-all duration-300 shadow-2xl border border-slate-100">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-2xl"
              onClick={() => setRegisterOpen(false)}
            >
              <PiX />
            </button>
            <h3 className="text-2xl font-bold text-navy mb-2">
              Daftar Akun Baru
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Lengkapi data di bawah untuk membuat akun KGYK.
            </p>

            {registerError && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-4 border border-red-100">
                {registerError}
              </div>
            )}

            <form
              className="space-y-4 max-h-[60vh] overflow-y-auto pr-1"
              onSubmit={handleRegisterSubmit}
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Nama lengkap Anda"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className={inputClass}
                  placeholder="nama@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nomor Telepon (Aktif)
                </label>
                <input
                  type="tel"
                  required
                  className={inputClass}
                  placeholder="0812xxxxxxxx"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Password (Min. 8 karakter)
                </label>
                <div className="relative">
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    required
                    className={`${inputClass} pr-10`}
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                    title={showRegisterPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                  >
                    {showRegisterPassword ? (
                      <PiEyeSlash className="text-lg" />
                    ) : (
                      <PiEye className="text-lg" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showRegisterConfirmPassword ? "text" : "password"}
                    required
                    className={`${inputClass} pr-10`}
                    placeholder="••••••••"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                    title={showRegisterConfirmPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                  >
                    {showRegisterConfirmPassword ? (
                      <PiEyeSlash className="text-lg" />
                    ) : (
                      <PiEye className="text-lg" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md mt-2 cursor-pointer"
              >
                Daftar Akun
              </button>
            </form>
            <p className="text-slate-500 text-sm text-center mt-6">
              Sudah punya akun?{" "}
              <button
                className="text-primary font-semibold hover:underline cursor-pointer"
                onClick={() => {
                  setRegisterError(null);
                  setRegisterOpen(false);
                  setLoginOpen(true);
                }}
              >
                Masuk disini
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PiGaugeFill,
  PiCarFill,
  PiReceiptFill,
  PiSlidersHorizontalFill,
  PiHouseFill,
  PiListBold,
  PiXBold,
  PiSignOutFill,
} from "react-icons/pi";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // If on /admin/login, bypass auth check
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setShowLogoutConfirm(false);
      setAuthenticated(true);
      return;
    }

    const auth = localStorage.getItem("kgyk_admin_auth");
    if (auth === "true") {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
      router.push("/admin/login");
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem("kgyk_admin_auth");
    localStorage.removeItem("kgyk_admin_user");
    router.push("/admin/login");
  };

  const navItems = [
    {
      name: "Dashboard Overview",
      href: "/admin",
      icon: PiGaugeFill,
      exact: true,
    },
    {
      name: "Kelola Armada Mobil",
      href: "/admin/mobil",
      icon: PiCarFill,
    },
    {
      name: "Operasional Transaksi",
      href: "/admin/transaksi",
      icon: PiReceiptFill,
    },
    {
      name: "Pengaturan Kontak",
      href: "/admin/pengaturan",
      icon: PiSlidersHorizontalFill,
    },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };

  // 1. Render login page directly without admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 2. Auth loading state
  if (authenticated === null || !authenticated) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center text-white text-xs font-bold gap-2">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        <span>Memverifikasi Akses Admin...</span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 font-sans flex text-slate-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Fixed Non-Scrolling Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 z-50 shadow-soft transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-accent text-navy flex items-center justify-center font-black text-base shadow-xs">
              K
            </span>
            <div>
              <span className="text-lg font-black text-navy tracking-tight block leading-none">
                KGYK <span className="text-primary font-black">Admin</span>
              </span>
              <span className="text-[10px] text-slate-700 font-black tracking-wider uppercase mt-0.5 block">
                Panel Operasional
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-700 hover:text-navy p-1 cursor-pointer"
          >
            <PiXBold className="text-xl" />
          </button>
        </div>

        {/* Navigation Items (Internal Scroll if needed) */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-slate-900">
            Menu Utama
          </div>

          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "text-slate-900 hover:bg-slate-100 hover:text-black"
                }`}
              >
                <Icon className={`text-xl ${active ? "text-white" : "text-slate-800"}`} />
                <span className={active ? "text-white font-extrabold" : "text-slate-900"}>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-6 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-slate-900">
            Navigasi Publik
          </div>

          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black text-slate-900 hover:bg-slate-100 hover:text-black transition-all"
          >
            <PiHouseFill className="text-xl text-slate-800" />
            <span>Ke Website Utama</span>
          </Link>
        </nav>

        {/* Footer Admin Profile & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-xs shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-black text-navy block truncate">
                  Admin KGYK
                </span>
                <span className="text-[10px] text-slate-700 font-bold block truncate">
                  admin@kgyk.com
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Logout Admin"
            >
              <PiSignOutFill className="text-base" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <PiSignOutFill className="text-3xl" />
            </div>
            <h3 className="text-base font-extrabold text-navy">Konfirmasi Keluar (Logout)</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Apakah Anda yakin ingin keluar dari Panel Admin KGYK Rental?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer transition-all"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area (Independent Viewport Scroll) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <PiListBold className="text-xl" />
            </button>
            <h1 className="text-sm md:text-base font-black text-navy">
              Dashboard Kelola Mobil & Operasional
            </h1>
          </div>
        </header>

        {/* Page Container */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}

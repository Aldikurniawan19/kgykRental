"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  clearCurrentUser,
  notifyAuthChanged,
  showToast,
  openLoginModal,
  openRegisterModal,
  type AppUser,
} from "@/lib/app";
import {
  PiCaretDown,
  PiClockCounterClockwise,
  PiSignOut,
  PiList,
  PiX,
} from "react-icons/pi";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const isKatalog = pathname.startsWith("/katalog");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileBtnRef = useRef<HTMLButtonElement>(null);
  const profileDropdownBtnRef = useRef<HTMLButtonElement>(null);
  const profileDropdownMenuRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const checkScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 50);
    };

    window.addEventListener("scroll", checkScroll);
    checkScroll();

    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  useEffect(() => {
    const updateAuthState = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      if (!currentUser) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("auth-changed", updateAuthState);
    updateAuthState();

    return () => window.removeEventListener("auth-changed", updateAuthState);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const mobileMenu = mobileMenuRef.current;
      const mobileBtn = mobileBtnRef.current;

      if (
        mobileOpen &&
        mobileMenu &&
        mobileBtn &&
        !mobileBtn.contains(target) &&
        !mobileMenu.contains(target)
      ) {
        closeMobileMenu();
      }

      const dropdownBtn = profileDropdownBtnRef.current;
      const dropdownMenu = profileDropdownMenuRef.current;
      if (
        dropdownOpen &&
        dropdownBtn &&
        dropdownMenu &&
        !dropdownBtn.contains(target) &&
        !dropdownMenu.contains(target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [mobileOpen, dropdownOpen]);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0,
    };
    const navLinks = document.querySelectorAll("nav a");
    const mobileNavLinks = document.querySelectorAll(".mobile-link");

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          if (!id) return;

          navLinks.forEach((link) => {
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });

          mobileNavLinks.forEach((link) => {
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((section) => observer.observe(section));

    const handleScrollTop = () => {
      if (
        window.scrollY === 0 &&
        (window.location.pathname === "/" || window.location.pathname === "")
      ) {
        document.querySelectorAll("nav a").forEach((link, idx) => {
          if (idx === 0) link.classList.add("active");
          else link.classList.remove("active");
        });
        document.querySelectorAll(".mobile-link").forEach((link, idx) => {
          if (idx === 0) link.classList.add("active");
          else link.classList.remove("active");
        });
      }
    };

    window.addEventListener("scroll", handleScrollTop);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScrollTop);
    };
  }, [pathname]);

  const handleLogout = () => {
    setDropdownOpen(false);
    closeMobileMenu();
    clearCurrentUser();
    notifyAuthChanged();
    showToast("Anda telah berhasil keluar.", "info");
    if (window.location.hash === "#reservasi") {
      window.location.hash = "";
    }
  };

  const navItems = [
    { label: "Beranda", href: isHome ? "#home" : "/#home" },
    { label: "Layanan", href: isHome ? "#layanan" : "/#layanan" },
    {
      label: "Mobil",
      href: isHome ? "#mobil" : "/katalog",
      active: isKatalog,
    },
  ];

  const initial = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : "U";

  return (
    <header
      id="header"
      ref={headerRef}
      className="fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-500 bg-transparent border-b border-transparent"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-20 transition-all duration-300">
          {/* Logo */}
          <div
            id="logo-container"
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              closeMobileMenu();
            }}
          >
            <span
              id="logo-text"
              className="font-bold text-lg md:text-xl tracking-tight transition-all duration-300"
            >
              KGYK<span className="text-accent">.</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`font-medium hover:text-primary transition-colors ${
                  item.active ? "active" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            {!user && (
              <Link
                id="guest-cta"
                href="/booking"
                className="hidden lg:inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-blue-700 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                Booking sekarang
              </Link>
            )}

            {user && (
              <div className="hidden lg:inline-flex relative items-center">
                <button
                  id="profile-dropdown-btn"
                  ref={profileDropdownBtnRef}
                  className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-full text-slate-800 text-sm font-bold transition-all duration-300 cursor-pointer select-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((prev) => !prev);
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-extrabold"
                    id="user-initial-container"
                  >
                    <span id="user-initial">{initial}</span>
                  </div>
                  <span
                    id="user-name-display"
                    className="text-sm font-bold truncate max-w-[120px]"
                  >
                    {user.fullName}
                  </span>
                  <PiCaretDown
                    className={`text-xs transition-transform duration-300 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    id="dropdown-caret"
                  />
                </button>

                {dropdownOpen && (
                  <div
                    id="profile-dropdown-menu"
                    ref={profileDropdownMenuRef}
                    className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-fade-in"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-50">
                      <p className="text-xs text-slate-400">Masuk sebagai</p>
                      <p
                        id="dropdown-user-email"
                        className="text-xs font-bold text-navy truncate"
                      >
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/history"
                        id="dropdown-history-btn"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-all cursor-pointer"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <PiClockCounterClockwise className="text-lg text-slate-400" />
                        <span>Riwayat Sewa</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-50 pt-1">
                      <button
                        id="dropdown-logout-btn"
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        onClick={handleLogout}
                      >
                        <PiSignOut className="text-lg" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              id="mobile-menu-btn"
              ref={mobileBtnRef}
              className="md:hidden p-2 rounded-lg transition-colors focus:outline-none cursor-pointer text-2xl"
              onClick={(e) => {
                e.stopPropagation();
                setMobileOpen((prev) => !prev);
              }}
            >
              {mobileOpen ? <PiX /> : <PiList />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className="md:hidden bg-white border-slate-100 absolute w-full left-0 top-full shadow-lg border-t"
        >
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50 mobile-link ${
                  item.active ? "active" : ""
                }`}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}

            {!user && (
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 px-3">
                <button
                  id="mobile-login-btn"
                  className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-center text-sm hover:bg-blue-700 transition-colors cursor-pointer"
                  onClick={() => {
                    closeMobileMenu();
                    openLoginModal();
                  }}
                >
                  Masuk
                </button>
                <button
                  id="mobile-register-btn"
                  className="w-full py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-center text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => {
                    closeMobileMenu();
                    openRegisterModal();
                  }}
                >
                  Daftar Akun
                </button>
              </div>
            )}

            {user && (
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 px-3">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-sm font-bold">
                    <span id="mobile-user-initial">{initial}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      id="mobile-user-name"
                      className="text-sm font-bold text-navy truncate"
                    >
                      {user.fullName}
                    </span>
                    <span
                      id="mobile-user-email"
                      className="text-xs text-slate-400 truncate"
                    >
                      {user.email}
                    </span>
                  </div>
                </div>
                <Link
                  href="/history"
                  className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-primary hover:bg-slate-50 mobile-link flex items-center gap-2.5 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <PiClockCounterClockwise className="text-lg text-slate-400" />{" "}
                  Riwayat Sewa
                </Link>
                <button
                  id="mobile-logout-btn"
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                  onClick={handleLogout}
                >
                  <PiSignOut className="text-lg" /> Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Toast from "@/components/Toast";
import GSAPInit from "@/components/GSAPInit";
import AuthModals from "@/components/auth/AuthModals";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Rental Mobil Terpercaya | Sewa Mobil Harian, Mingguan, dan Bulanan",
    template: "%s | KGYK Rental",
  },
  description:
    "Sewa mobil mudah dan terpercaya dengan berbagai pilihan armada bersih, harga transparan, serta layanan rental harian, mingguan, dan bulanan.",
  keywords:
    "rental mobil, sewa mobil, rental mobil harian, rental mobil bulanan, sewa mobil jogja, rental mobil terpercaya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} scroll-smooth`}
    >
      <head>
        <Script
          src="https://unpkg.com/@phosphor-icons/web"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-lightbg text-slate-800 antialiased selection:bg-primary selection:text-white">
        {children}
        <AuthModals />
        <Toast />
        <GSAPInit />
      </body>
    </html>
  );
}
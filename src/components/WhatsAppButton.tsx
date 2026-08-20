"use client";

import { useEffect, useState } from "react";
import { PiWhatsappLogo } from "react-icons/pi";

export default function WhatsAppButton() {
  const [waNumber, setWaNumber] = useState("62881023331644");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.whatsapp) {
          setWaNumber(data.whatsapp);
        }
      })
      .catch((err) => console.error("Gagal mengambil nomor WA:", err));
  }, []);

  const cleanWaNumber = waNumber.replace(/[^0-9]/g, "");

  return (
    <a
      href={`https://wa.me/${cleanWaNumber}?text=Halo%20Admin%20KGYK,%20saya%20ingin%20tanya%20sewa%20mobil.`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl shadow-lg hover:bg-green-600 transition-all transform hover:scale-110 z-50 animate-bounce cursor-pointer group"
    >
      <PiWhatsappLogo />
      <span className="absolute right-16 bg-navy text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Hubungi Kami
      </span>
    </a>
  );
}
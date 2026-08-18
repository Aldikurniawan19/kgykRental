"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Apa saja syarat untuk menyewa mobil?",
    a: "Syarat utama menyewa mobil antara lain melampirkan KTP, KK, SIM A yang masih aktif, dan dokumen pendukung lainnya (seperti ID Card karyawan atau tiket pesawat/kereta untuk wisatawan).",
  },
  {
    q: "Apakah harga sudah termasuk BBM dan Tol?",
    a: "Harga sewa mobil yang tertera di website umumnya belum termasuk BBM, tol, dan parkir. Namun, kami juga menyediakan opsi \"All In\" jika Anda menggunakan jasa sopir kami.",
  },
  {
    q: "Bagaimana jika terjadi kerusakan pada mobil?",
    a: "Seluruh armada kami dilindungi oleh asuransi. Jika terjadi kerusakan, penyewa hanya perlu membayar biaya klaim asuransi (own risk) sesuai dengan ketentuan yang disepakati di awal.",
  },
  {
    q: "Apakah bisa digunakan untuk luar kota?",
    a: "Sangat bisa. Mohon informasikan kepada admin rute luar kota Anda saat melakukan pemesanan agar kami dapat menyesuaikan kendaraan dan memberikan estimasi jika ada penambahan biaya luar kota untuk sopir.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3" data-gsap="fade-right">
            <h4 className="text-primary font-bold tracking-wider uppercase text-sm mb-2">
              FAQ
            </h4>
            <h2 className="text-3xl font-bold text-navy mb-4">Pertanyaan Umum</h2>
            <p className="text-slate-600 mb-6">
              Temukan jawaban atas pertanyaan yang sering diajukan seputar layanan
              rental kami.
            </p>
            <a
              href="#reservasi"
              className="text-primary font-semibold flex items-center gap-2 hover:underline"
            >
              Punya pertanyaan lain? Hubungi Kami{" "}
              <i className="ph-bold ph-arrow-right"></i>
            </a>
          </div>

          <div className="lg:w-2/3">
            <div className="space-y-4" id="faqAccordion" data-gsap="stagger-cards">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    className={`faq-item border rounded-2xl overflow-hidden transition-all bg-white ${
                      isOpen ? "border-primary" : "border-slate-200"
                    }`}
                  >
                    <button
                      className="faq-button w-full text-left px-6 py-5 flex items-center justify-between font-semibold text-navy hover:bg-slate-50 focus:outline-none"
                      onClick={() => toggleFaq(index)}
                    >
                      <span>{faq.q}</span>
                      <i
                        className={`ph ph-caret-down text-slate-400 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      ></i>
                    </button>
                    <div
                      className={`faq-content px-6 pb-5 text-slate-600 text-sm leading-relaxed ${
                        isOpen ? "" : "hidden"
                      }`}
                    >
                      {faq.a}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
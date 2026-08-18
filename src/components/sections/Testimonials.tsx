"use client";

import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import SectionHeader from "@/components/ui/SectionHeader";

const testimonials = [
  {
    stars: 5,
    text: "Sistem pemesanan online-nya sangat memudahkan. Saya bisa pantau status pesanan saya tanpa harus bolak-balik chat admin. Verifikasinya cepat dan mobil sesuai deskripsi.",
    name: "Andi Saputra",
    sub: "Menyewa Innova Zenix",
    initial: "A",
  },
  {
    stars: 5,
    text: "Dulu agak ragu sewa mobil secara online, tapi setelah register dan upload dokumen lewat web ini rasanya aman banget. Privasi terjaga, instruksi bayar juga jelas di riwayat akun.",
    name: "Diana Putri",
    sub: "Menyewa Honda Brio",
    initial: "D",
  },
  {
    stars: 4,
    text: "Desain webnya profesional. Fitur cek ketersediaan sangat akurat, jadi saya gak buang waktu milih mobil yang ternyata udah di-booking orang. Sangat direkomendasikan!",
    name: "Budi Santoso",
    sub: "Menyewa Honda CR-V",
    initial: "B",
  },
  {
    stars: 5,
    text: "Sangat puas dengan sewa mobil di sini. Syarat verifikasinya gak ribet, mobil Avanza yang saya pakai juga sangat prima, bersih, dan wangi saat serah terima.",
    name: "Rian Hidayat",
    sub: "Menyewa Toyota Avanza",
    initial: "R",
  },
  {
    stars: 5,
    text: "Layanan sopirnya luar biasa. Sangat sopan, tepat waktu saat penjemputan di bandara, dan paham rute-rute jalan alternatif menghindari kemacetan. Sangat terbantu!",
    name: "Siti Rahma",
    sub: "Menyewa Toyota Hiace",
    initial: "S",
  },
  {
    stars: 4,
    text: "Harga sewa Innova Reborn di sini paling murah dibanding rental lain. Kondisi AC dingin banget, suspensi empuk, dan mesin terawat. Bakal langganan terus.",
    name: "Eko Prasetyo",
    sub: "Menyewa Innova Reborn",
    initial: "E",
  },
];

export default function Testimonials() {
  return (
    <section id="testimoni" className="py-20 bg-lightbg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader tag="Testimoni" title="Apa Kata Pelanggan Kami?" />

        <div data-gsap="fade-up">
          <Swiper
            className="testimoniSwiper pb-12"
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={30}
            loop={true}
            pagination={{ el: ".swiper-pagination", clickable: true }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
          >
          {testimonials.map((testi, idx) => (
            <SwiperSlide key={idx} className="h-auto">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-soft h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-1 text-accent">
                      {Array.from({ length: 5 }).map((_, i) =>
                        i < testi.stars ? (
                          <i key={i} className="ph-fill ph-star text-lg"></i>
                        ) : (
                          <i key={i} className="ph ph-star text-lg"></i>
                        )
                      )}
                    </div>
                    <span className="text-slate-200/80 text-6xl font-serif leading-none select-none font-bold">
                      ”
                    </span>
                  </div>

                  <p className="text-slate-600 italic mb-8 text-sm leading-relaxed">
                    {"\u201C" + testi.text + "\u201D"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200/70 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {testi.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-sm">{testi.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{testi.sub}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        </div>
      </div>
    </section>
  );
}
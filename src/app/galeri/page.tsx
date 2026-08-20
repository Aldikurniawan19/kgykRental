import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { PiHouse, PiCaretRight, PiMapPin, PiArrowRight } from "react-icons/pi";

export const metadata: Metadata = {
  title: "Galeri Wisata",
  description:
    "Jelajahi berbagai destinasi wisata menarik yang dapat Anda kunjungi dengan kenyamanan armada KGYK Rental.",
};

const destinations = [
  {
    name: "Candi Borobudur",
    location: "Magelang, Jawa Tengah",
    img: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80",
    description:
      "Candi Buddha terbesar di dunia dengan relief indah dan pemandangan matahari terbit yang memukau.",
  },
  {
    name: "Jalan Malioboro",
    location: "Yogyakarta",
    img: "https://images.unsplash.com/photo-1574958269340-fa927503f3f9?auto=format&fit=crop&w=800&q=80",
    description:
      "Ikon kota Yogyakarta. Pusat perbelanjaan dan kuliner legendaris yang hidup 24 jam.",
  },
  {
    name: "Candi Prambanan",
    location: "Sleman, Yogyakarta",
    img: "https://images.unsplash.com/photo-1584311029524-74720977a0b5?auto=format&fit=crop&w=800&q=80",
    description:
      "Kompleks candi Hindu terbesar di Indonesia yang terkenal dengan legenda Roro Jonggrang.",
  },
  {
    name: "Pantai Parangtritis",
    location: "Bantul, Yogyakarta",
    img: "https://images.unsplash.com/photo-1588665961608-f10f43b67ce7?auto=format&fit=crop&w=800&q=80",
    description:
      "Pantai eksotis dengan hamparan pasir hitam dan gumuk pasir yang terkenal mistis.",
  },
  {
    name: "Gunung Merapi",
    location: "Sleman, Yogyakarta",
    img: "https://images.unsplash.com/photo-1533207604313-0975608b417e?auto=format&fit=crop&w=800&q=80",
    description:
      "Gunung berapi paling aktif di Indonesia yang menawarkan wisata Lava Tour seru dengan Jeep.",
  },
  {
    name: "Tebing Breksi",
    location: "Sleman, Yogyakarta",
    img: "https://images.unsplash.com/photo-1621217279314-52d3a9bb7e7e?auto=format&fit=crop&w=800&q=80",
    description:
      "Bekas tambang batu yang disulap menjadi tempat wisata instagenic dengan pemandangan kota.",
  },
];

export default function GaleriPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50 font-sans pt-0">
        <section className="relative bg-gradient-to-r from-navy via-slate-900 to-navy text-white pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <nav
              className="flex items-center gap-2 text-xs md:text-sm text-slate-300 mb-4"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1">
                <PiHouse /> Beranda
              </Link>
              <PiCaretRight className="text-slate-500" />
              <span className="text-white font-semibold">Galeri Wisata</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 animate-fade-in">
                Galeri Wisata <span className="text-accent">Pilihan</span>
              </h1>
              <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-0">
                Temukan inspirasi destinasi liburan Anda. KGYK Rental siap mengantarkan
                Anda menjelajahi keindahan alam dan budaya dengan aman dan nyaman.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-gsap="stagger-cards">
            {destinations.map((dest) => (
              <div
                key={dest.name}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={dest.img}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold rounded-full mb-2">
                      <PiMapPin /> {dest.location}
                    </span>
                    <h3 className="text-2xl font-bold text-white">{dest.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {dest.description}
                  </p>
                  <a
                    href="/katalog"
                    className="inline-flex items-center justify-center w-full px-4 py-3 border border-primary text-primary hover:bg-primary hover:text-white text-sm font-bold rounded-xl transition-colors gap-2"
                  >
                    <span>Pilih Mobil ke Sini</span>
                    <PiArrowRight />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
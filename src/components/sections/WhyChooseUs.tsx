import {
  PiShieldCheckFill,
  PiTagFill,
  PiCalendarCheckFill,
  PiHeadsetFill,
  PiTaxiFill,
  PiUserFill,
} from "react-icons/pi";

const advantages = [
  {
    icon: PiShieldCheckFill,
    title: "Aman & Terpercaya",
    desc: "Unit terawat, bersih, dan selalu dalam kondisi prima untuk perjalanan Anda.",
  },
  {
    icon: PiTagFill,
    title: "Harga Terbaik",
    desc: "Harga kompetitif tanpa biaya tersembunyi. Lebih hemat, lebih nyaman.",
  },
  {
    icon: PiCalendarCheckFill,
    title: "Pemesanan Mudah",
    desc: "Proses booking cepat dan praktis kapan saja, di mana saja.",
  },
  {
    icon: PiHeadsetFill,
    title: "Layanan 24/7",
    desc: "Tim kami siap membantu Anda kapan pun selama perjalanan.",
  },
  {
    icon: PiTaxiFill,
    title: "Pilihan Mobil Lengkap",
    desc: "Tersedia berbagai pilihan mobil sesuai kebutuhan dan budget Anda.",
  },
  {
    icon: PiUserFill,
    title: "Sopir Profesional",
    desc: "Sopir berpengalaman, ramah, dan siap mengantar Anda dengan aman.",
  },
];

export default function WhyChooseUs() {
  return (
    <section
      id="keunggulan"
      className="py-14 sm:py-16 lg:py-20 overflow-hidden relative layanan-bg flex items-center"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:w-7/12 xl:w-7/12 lg:ml-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center bg-blue-100/90 text-primary px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider mb-3.5"
            data-gsap="fade-left"
          >
            KEUNGGULAN KAMI
          </div>

          {/* Heading */}
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy mb-3 leading-tight tracking-tight"
            data-gsap="fade-left"
          >
            Keunggulan Kami, <br className="hidden sm:inline" />
            Pengalaman <span className="text-primary">Terbaik</span>
          </h2>

          {/* Description */}
          <p
            className="text-slate-500 text-xs sm:text-sm lg:text-base leading-relaxed mb-6 sm:mb-8 max-w-xl"
            data-gsap="fade-left"
          >
            Kami berkomitmen memberikan layanan sewa mobil terbaik dengan
            pengalaman yang mudah, aman, dan berkesan.
          </p>

          {/* 6 Cards Grid (3 Columns on tablet/desktop, 2 on mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4" data-gsap="stagger-cards">
            {advantages.map((advantage) => {
              const Icon = advantage.icon;
              return (
                <div
                  key={advantage.title}
                  className="bg-white/95 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 sm:p-5 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center"
                >
                  {/* Icon in Circular Badge */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center mb-3 text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Icon />
                  </div>

                  {/* Card Title */}
                  <h3 className="text-xs sm:text-sm font-bold text-navy mb-1 sm:mb-1.5 leading-snug">
                    {advantage.title}
                  </h3>

                  {/* Card Description */}
                  <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed">
                    {advantage.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
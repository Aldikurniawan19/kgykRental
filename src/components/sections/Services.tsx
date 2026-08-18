import SectionHeader from "@/components/ui/SectionHeader";

const services = [
  {
    icon: "ph ph-calendar-check",
    title: "Rental Harian",
    desc: "Solusi tepat untuk perjalanan singkat di dalam kota. Fleksibel dan hemat untuk kebutuhan harian Anda.",
  },
  {
    icon: "ph ph-map-trifold",
    title: "Tour Destinasi Wisata",
    desc: "Jelajahi berbagai tempat wisata menarik dengan paket tour terencana dan armada kendaraan yang nyaman.",
  },
  {
    icon: "ph ph-user",
    title: "Dengan Sopir",
    desc: "Perjalanan lebih santai dan aman bersama sopir kami yang berpengalaman dan profesional.",
  },
  {
    icon: "ph ph-airplane-tilt",
    title: "Antar Jemput Bandara",
    desc: "Layanan penjemputan atau pengantaran dari dan ke bandara secara tepat waktu.",
  },
  {
    icon: "ph ph-buildings",
    title: "Sewa Perusahaan",
    desc: "Penyediaan kendaraan operasional untuk instansi atau perusahaan dengan sistem kontrak.",
  },
  {
    icon: "ph ph-confetti",
    title: "Mobil Pernikahan",
    desc: "Sewa mobil premium lengkap dengan dekorasi untuk melengkapi hari bahagia Anda.",
  },
];

export default function Services() {
  return (
    <section id="layanan" className="py-20 bg-lightbg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Layanan Kami"
          title="Solusi Transportasi Untuk Setiap Kebutuhan"
          description="Pilih layanan yang paling sesuai dengan rencana perjalanan Anda. Kami menyediakan berbagai opsi fleksibel."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-gsap="stagger-cards">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-soft transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                <i
                  className={`${service.icon} text-3xl text-primary group-hover:text-white transition-colors duration-300`}
                ></i>
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">{service.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
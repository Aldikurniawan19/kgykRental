import SectionHeader from "@/components/ui/SectionHeader";
import {
  PiMagnifyingGlassFill,
  PiFileTextFill,
  PiCreditCardFill,
  PiKeyFill,
} from "react-icons/pi";

const steps = [
  {
    icon: PiMagnifyingGlassFill,
    title: "Pilih Armada",
    desc: "Jelajahi katalog kami dan gunakan filter untuk menemukan mobil yang paling sesuai dengan kebutuhan Anda.",
    num: 1,
    isSpecial: false,
  },
  {
    icon: PiFileTextFill,
    title: "Isi Reservasi",
    desc: "Lengkapi form online dengan data diri, tanggal penyewaan, serta durasi pinjam dengan mudah & aman.",
    num: 2,
    isSpecial: false,
  },
  {
    icon: PiCreditCardFill,
    title: "Verifikasi Data",
    desc: "Tim kami akan memverifikasi pesanan Anda. Selesaikan pembayaran DP setelah mendapat konfirmasi.",
    num: 3,
    isSpecial: false,
  },
  {
    icon: PiKeyFill,
    title: "Mobil Siap",
    desc: "Kendaraan bersih dan prima siap digunakan. Anda bisa ambil di garasi kami atau diantar ke lokasi.",
    num: 4,
    isSpecial: true,
  },
];

export default function BookingSteps() {
  return (
    <section className="py-20 bg-white relative overflow-hidden border-t border-slate-100">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full filter blur-3xl -translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          tag="Proses Cepat & Praktis"
          title="Langkah Mudah Menyewa Mobil"
          description="Sistem reservasi online kami dirancang agar sangat simpel, mempermudah Anda mendapatkan kendaraan idaman dalam hitungan menit."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative mt-10" data-gsap="stagger-cards">
          <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-transparent border-t-2 border-dashed border-slate-200 z-0"></div>

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative flex flex-col items-center text-center group px-4"
              >
                <div
                  className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-soft border border-slate-100 transition-all duration-300 group-hover:-translate-y-2 text-primary text-3xl group-hover:bg-primary group-hover:text-white"
                >
                  <Icon />
                  <div
                    className="absolute -top-3 -right-3 w-8 h-8 font-bold rounded-full flex items-center justify-center text-sm shadow-md bg-primary text-white"
                  >
                    {step.num}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
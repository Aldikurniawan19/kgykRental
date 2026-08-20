export default function PromoBanner() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
          data-gsap="zoom-in"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-xl transform translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10 md:w-2/3 text-center md:text-left text-white">
            <span className="inline-block px-3.5 py-1 bg-white/20 text-white text-xs font-bold rounded-lg mb-4 uppercase tracking-wider backdrop-blur-sm">
              Promo Terbatas
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Diskon 15% Untuk Sewa Mingguan!
            </h2>
            <p className="text-blue-100 text-lg">
              Dapatkan harga lebih hemat untuk rencana liburan keluarga panjang
              Anda. Berlaku hingga akhir bulan ini.
            </p>
          </div>

          <div className="relative z-10 md:w-1/3 text-center md:text-right">
            <a
              href="/booking"
              className="inline-block px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl"
            >
              Klaim Promo Sekarang
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
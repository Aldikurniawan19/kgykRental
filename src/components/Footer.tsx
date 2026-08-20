import {
  PiInstagramLogo,
  PiFacebookLogo,
  PiYoutubeLogo,
  PiWhatsappLogo,
  PiCaretRight,
  PiMapPin,
  PiPhone,
  PiEnvelope,
  PiClock,
} from "react-icons/pi";

export default function Footer() {
  return (
    <footer className="bg-navy pt-20 pb-10 border-t border-slate-800 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-16" data-gsap="stagger-cards">
          {/* Brand & Socials Column */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="flex items-center mb-6">
              <span className="font-bold text-2xl tracking-tight text-white">
                KGYK<span className="text-accent">.</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Penyedia jasa rental mobil terpercaya untuk keperluan pribadi,
              wisata, maupun operasional perusahaan dengan harga terbaik dan
              pelayanan profesional di wilayah Yogyakarta dan sekitarnya.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-accent text-slate-400 hover:text-navy flex items-center justify-center transition-all duration-300 shadow-md transform hover:-translate-y-1"
                aria-label="Instagram"
              >
                <PiInstagramLogo className="text-lg" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-accent text-slate-400 hover:text-navy flex items-center justify-center transition-all duration-300 shadow-md transform hover:-translate-y-1"
                aria-label="Facebook"
              >
                <PiFacebookLogo className="text-lg" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-accent text-slate-400 hover:text-navy flex items-center justify-center transition-all duration-300 shadow-md transform hover:-translate-y-1"
                aria-label="YouTube"
              >
                <PiYoutubeLogo className="text-lg" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-accent text-slate-400 hover:text-navy flex items-center justify-center transition-all duration-300 shadow-md transform hover:-translate-y-1"
                aria-label="WhatsApp"
              >
                <PiWhatsappLogo className="text-lg" />
              </a>
            </div>
          </div>

          {/* Navigasi Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-8 after:h-[2px] after:bg-accent">
              Navigasi
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#home"
                  className="text-slate-400 hover:text-accent transition-colors text-sm flex items-center gap-1.5"
                >
                  <PiCaretRight className="text-xs" /> Beranda
                </a>
              </li>
              <li>
                <a
                  href="#layanan"
                  className="text-slate-400 hover:text-accent transition-colors text-sm flex items-center gap-1.5"
                >
                  <PiCaretRight className="text-xs" /> Layanan Kami
                </a>
              </li>
              <li>
                <a
                  href="#mobil"
                  className="text-slate-400 hover:text-accent transition-colors text-sm flex items-center gap-1.5"
                >
                  <PiCaretRight className="text-xs" /> Katalog Mobil
                </a>
              </li>
              <li>
                <a
                  href="#keunggulan"
                  className="text-slate-400 hover:text-accent transition-colors text-sm flex items-center gap-1.5"
                >
                  <PiCaretRight className="text-xs" /> Keunggulan
                </a>
              </li>
              <li>
                <a
                  href="#testimoni"
                  className="text-slate-400 hover:text-accent transition-colors text-sm flex items-center gap-1.5"
                >
                  <PiCaretRight className="text-xs" /> Testimoni
                </a>
              </li>
            </ul>
          </div>

          {/* Layanan Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-8 after:h-[2px] after:bg-accent">
              Layanan
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#layanan"
                  className="text-slate-400 hover:text-accent transition-colors text-sm flex items-center gap-1.5"
                >
                  <PiCaretRight className="text-xs" /> Rental Harian
                </a>
              </li>
              <li>
                <a
                  href="#layanan"
                  className="text-slate-400 hover:text-accent transition-colors text-sm flex items-center gap-1.5"
                >
                  <PiCaretRight className="text-xs" /> Tour Wisata
                </a>
              </li>
              <li>
                <a
                  href="#layanan"
                  className="text-slate-400 hover:text-accent transition-colors text-sm flex items-center gap-1.5"
                >
                  <PiCaretRight className="text-xs" /> Dengan Sopir
                </a>
              </li>
              <li>
                <a
                  href="#layanan"
                  className="text-slate-400 hover:text-accent transition-colors text-sm flex items-center gap-1.5"
                >
                  <PiCaretRight className="text-xs" /> Jemput Bandara
                </a>
              </li>
              <li>
                <a
                  href="#layanan"
                  className="text-slate-400 hover:text-accent transition-colors text-sm flex items-center gap-1.5"
                >
                  <PiCaretRight className="text-xs" /> Mobil Pengantin
                </a>
              </li>
            </ul>
          </div>

          {/* Kontak Kami Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-8 after:h-[2px] after:bg-accent">
              Hubungi Kami
            </h4>
            <ul className="space-y-3">
              <li className="text-slate-400 text-sm flex items-start gap-2.5">
                <PiMapPin className="text-accent text-lg mt-0.5 flex-shrink-0" />
                <span>
                  Jl. Pandega Marga, Manggung, Caturtunggal, Kec. Depok,
                  Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281
                </span>
              </li>
              <li className="text-slate-400 text-sm flex items-center gap-2.5">
                <PiPhone className="text-accent text-lg flex-shrink-0" />
                <a href="tel:+6281234567890" className="hover:text-accent transition-colors">
                  +62 812-3456-7890
                </a>
              </li>
              <li className="text-slate-400 text-sm flex items-center gap-2.5">
                <PiEnvelope className="text-accent text-lg flex-shrink-0" />
                <a href="mailto:info@kgyk.com" className="hover:text-accent transition-colors">
                  info@kgyk.com
                </a>
              </li>
              <li className="text-slate-400 text-sm flex items-center gap-2.5">
                <PiClock className="text-accent text-lg flex-shrink-0" />
                <span>Setiap Hari (24 Jam)</span>
              </li>
            </ul>
          </div>

          {/* Google Maps Embed Column */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-6 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-8 after:h-[2px] after:bg-accent">
              Lokasi Kantor
            </h4>
            <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-800 shadow-lg group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.210408544061!2d110.3798782!3d-7.7568856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a59a720a4421b%3A0xe54d3dfab4551187!2sJl.%20Pandega%20Marga%2C%20Manggung%2C%20Caturtunggal%2C%20Kec.%20Depok%2C%20Kabupaten%20Sleman%2C%20Daerah%20Istimewa%20Yogyakarta%2055281!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                className="w-full h-full border-0 group-hover:scale-105 transition-transform duration-500"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-slate-500 text-sm mb-4 md:mb-0">
            &copy; 2026 KGYK. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-accent text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-slate-500 hover:text-accent text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
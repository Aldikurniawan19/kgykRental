import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import Services from "@/components/sections/Services";
import CarCatalog from "@/components/sections/CarCatalog";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import BookingSteps from "@/components/sections/BookingSteps";
import PromoBanner from "@/components/sections/PromoBanner";
import Testimonials from "@/components/sections/Testimonials";
import Faq from "@/components/sections/Faq";
import BookingForm from "@/components/sections/BookingForm";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CarDetailModal from "@/components/CarDetailModal";
import SuccessModal from "@/components/SuccessModal";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <Stats />
        <Services />
        <CarCatalog />
        <WhyChooseUs />
        <BookingSteps />
        <PromoBanner />
        <Testimonials />
        <Faq />
        <BookingForm />
      </main>

      <Footer />

      <CarDetailModal />
      <SuccessModal />

      <WhatsAppButton />
    </>
  );
}
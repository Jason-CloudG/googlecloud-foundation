import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import WhatIsSection from "@/components/landing/WhatIsSection";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import ProcessSection from "@/components/landing/ProcessSection";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <WhatIsSection />
      <WhyChooseUs />
      <ProcessSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;

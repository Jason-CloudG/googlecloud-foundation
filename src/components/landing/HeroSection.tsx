import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-hero opacity-80" />
      <div className="absolute inset-0 bg-glow" />

      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-primary-foreground/80 font-medium">Enterprise-Grade GCP Infrastructure</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            <span className="text-primary-foreground">Production-Ready GCP Landing Zone in </span>
            <span className="text-gradient-primary">Hours, Not Weeks</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Automated Terraform-based secure foundation for your GCP Organization. 
            CIS-aligned security, enterprise IAM, and scalable multi-environment design.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/wizard">
              <Button variant="hero" size="xl">
                Start Your Landing Zone Setup
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="mailto:venkateshprabhu.gs@quadrasystems.net">
              <Button variant="heroOutline" size="xl">
                <MessageSquare className="mr-2 h-5 w-5" />
                Talk to an Expert
              </Button>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 flex items-center justify-center gap-8 text-primary-foreground/40 text-sm"
        >
          <span>Trusted by enterprise teams</span>
          <span>•</span>
          <span>SOC 2 Aligned</span>
          <span>•</span>
          <span>CIS Benchmarks</span>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

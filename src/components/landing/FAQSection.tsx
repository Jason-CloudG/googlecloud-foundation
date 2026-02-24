import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  { q: "How long does a GCP Landing Zone deployment take?", a: "With our automated approach, a standard landing zone can be deployed in 1–3 business days. Complex enterprise configurations with hybrid connectivity may take up to 2 weeks." },
  { q: "Can I customize the landing zone to my needs?", a: "Absolutely. Our 10-step wizard captures your exact requirements — from folder hierarchy to IAM model, networking architecture, and compliance needs. Every deployment is tailored." },
  { q: "What security standards do you follow?", a: "We align with CIS Google Cloud Foundation Benchmark (Level 1 & 2), support VPC Service Controls, CMEK encryption, and can adapt to your specific compliance framework (SOC 2, ISO 27001, HIPAA)." },
  { q: "Is everything managed through Terraform?", a: "Yes. 100% of the infrastructure is defined as Terraform code. You receive the full codebase, state management setup, and CI/CD pipeline configuration for ongoing management." },
  { q: "Do you support hybrid/multi-cloud connectivity?", a: "Yes. We configure Cloud Interconnect, VPN tunnels, and DNS peering for hybrid connectivity with on-premises or other cloud environments." },
  { q: "What happens after deployment?", a: "You receive full documentation, Terraform code, runbooks, and a knowledge transfer session. We also offer ongoing support and managed services packages." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="section-padding bg-secondary/50">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="card-elevated rounded-xl px-6 border">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;

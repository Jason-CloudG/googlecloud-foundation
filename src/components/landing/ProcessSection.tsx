import { motion } from "framer-motion";
import { ClipboardCheck, PenTool, Rocket, CheckCircle2 } from "lucide-react";

const steps = [
  { icon: ClipboardCheck, label: "Assess", desc: "We evaluate your GCP org needs, compliance requirements, and architecture goals." },
  { icon: PenTool, label: "Design", desc: "Custom landing zone blueprint with networking, IAM, security, and folder hierarchy." },
  { icon: Rocket, label: "Terraform Deploy", desc: "Automated provisioning using tested Terraform modules. Everything as code." },
  { icon: CheckCircle2, label: "Validate & Handover", desc: "Full validation, documentation, and knowledge transfer to your team." },
];

const ProcessSection = () => {
  return (
    <section id="process" className="section-padding bg-background">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground">
            Our 4-Step Process
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From assessment to handover — a proven methodology for enterprise cloud foundations.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-4 gap-8 relative z-10">
            {steps.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-card border-2 border-primary/20 flex items-center justify-center mb-4 shadow-lg">
                  <s.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-xs font-mono text-muted-foreground mb-1">Step {i + 1}</span>
                <h3 className="font-bold text-lg mb-2 text-foreground">{s.label}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;

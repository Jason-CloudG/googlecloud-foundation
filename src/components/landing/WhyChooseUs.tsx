import { motion } from "framer-motion";
import { Zap, Code2, ShieldCheck, Users, Layers } from "lucide-react";

const reasons = [
  { icon: Zap, title: "Deploy in Hours", desc: "Not weeks. Our automated pipeline provisions your entire landing zone in hours." },
  { icon: Code2, title: "Terraform IaC", desc: "100% Infrastructure as Code. Version-controlled, repeatable, and auditable." },
  { icon: ShieldCheck, title: "CIS-Aligned Security", desc: "Built on CIS Google Cloud Foundation Benchmark for enterprise compliance." },
  { icon: Users, title: "Enterprise IAM", desc: "Centralized or federated identity with proper role hierarchy and least privilege." },
  { icon: Layers, title: "Multi-Env Design", desc: "Scalable dev/test/staging/prod architecture that grows with your organization." },
];

const WhyChooseUs = () => {
  return (
    <section id="why" className="section-padding bg-secondary/50">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground">
            Why Choose Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Battle-tested patterns, automated delivery, and deep GCP expertise.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center p-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <r.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">{r.title}</h3>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

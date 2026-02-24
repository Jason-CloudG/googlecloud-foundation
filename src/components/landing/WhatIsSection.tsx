import { motion } from "framer-motion";
import { Building2, FolderTree, Shield, Network, DollarSign, Eye } from "lucide-react";

const features = [
  { icon: Building2, title: "Organization Structure", desc: "Proper GCP org hierarchy with resource organization that scales from startup to enterprise." },
  { icon: FolderTree, title: "Folder Hierarchy", desc: "Environment-based folder structure (Dev/Test/Prod) with inherited IAM policies and guardrails." },
  { icon: Shield, title: "IAM & Security", desc: "Least-privilege IAM model with centralized or federated identity, service accounts, and access boundaries." },
  { icon: Network, title: "Shared VPC & Networking", desc: "Hub-spoke or shared VPC architecture with firewall rules, Cloud NAT, and hybrid connectivity." },
  { icon: Eye, title: "Logging & Monitoring", desc: "Centralized Cloud Logging with org-level sinks, Cloud Monitoring dashboards, and SIEM integration." },
  { icon: DollarSign, title: "Budget Controls", desc: "Billing account structure with budget alerts, quotas, and cost allocation through project labels." },
];

const WhatIsSection = () => {
  return (
    <section id="what" className="section-padding bg-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground">
            What is a GCP Landing Zone?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A Landing Zone is a pre-configured, secure foundation for your Google Cloud environment — 
            the architectural blueprint that ensures every project follows best practices from day one.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-elevated rounded-xl p-6 hover:shadow-xl transition-shadow group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-card-foreground">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsSection;

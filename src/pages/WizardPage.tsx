import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ArrowLeft, ArrowRight, Check, Cloud, AlertTriangle, ExternalLink, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import stepOrgImg from "@/assets/wizard/step-org.jpg";
import stepBillingImg from "@/assets/wizard/step-billing.jpg";
import stepEnvImg from "@/assets/wizard/step-env.jpg";
import stepFoldersImg from "@/assets/wizard/step-folders.jpg";
import stepNetworkImg from "@/assets/wizard/step-network.jpg";
import stepIamImg from "@/assets/wizard/step-iam.jpg";
import stepSecurityImg from "@/assets/wizard/step-security.jpg";
import stepLoggingImg from "@/assets/wizard/step-logging.jpg";
import stepSupportImg from "@/assets/wizard/step-support.jpg";
import stepAutomationImg from "@/assets/wizard/step-automation.jpg";

// Use step-org image for identity gate too
const stepImages = [
  stepOrgImg, stepOrgImg, stepBillingImg, stepEnvImg, stepFoldersImg, stepNetworkImg,
  stepIamImg, stepSecurityImg, stepLoggingImg, stepSupportImg, stepAutomationImg,
];

const STORAGE_KEY = "lz-wizard-data";

interface WizardData {
  // Step 0: Identity Gate
  workspaceExists: string; // "yes" | "no" | ""
  identityOrgId: string;
  identityDomain: string;
  superAdminConfirmed: boolean;
  superAdminSelection: string; // "yes" | "no" | ""
  // Step 1: Org & Governance
  orgId: string;
  domain: string;
  policyAutomation: string;
  // Step 2: Billing
  billingId: string;
  budgetThreshold: string;
  alertRecipients: string;
  // Step 3: Environment
  environments: string[];
  customEnv: string;
  // Step 4: Folder Hierarchy
  folderPreference: string;
  folderNotes: string;
  // Step 5: Networking
  networkModel: string;
  regions: string;
  hybridConnectivity: string;
  // Step 6: IAM
  iamModel: string;
  identityProvider: string;
  // Step 7: Security
  cisLevel: string;
  vpcServiceControls: boolean;
  cmek: boolean;
  complianceNotes: string;
  // Step 8: Logging
  centralLogging: boolean;
  logRetention: string;
  siemIntegration: string;
  // Step 9: Google Cloud Support
  supportPlan: string;
  // Step 10: Automation
  cicdTool: string;
  terraformStateLocation: string;
  timeline: string;
  // Contact
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  goLiveDate: string;
}

const defaultData: WizardData = {
  workspaceExists: "", identityOrgId: "", identityDomain: "", superAdminConfirmed: false, superAdminSelection: "",
  orgId: "", domain: "", policyAutomation: "",
  billingId: "", budgetThreshold: "", alertRecipients: "",
  environments: [], customEnv: "",
  folderPreference: "", folderNotes: "",
  networkModel: "", regions: "", hybridConnectivity: "",
  iamModel: "", identityProvider: "",
  cisLevel: "", vpcServiceControls: false, cmek: false, complianceNotes: "",
  centralLogging: true, logRetention: "30", siemIntegration: "",
  supportPlan: "",
  cicdTool: "", terraformStateLocation: "", timeline: "",
  companyName: "", contactPerson: "", email: "", phone: "", country: "", goLiveDate: "",
};

const stepTitles = [
  "Identity & Organization Verification",
  "Organization & Governance",
  "Billing & Budget Controls",
  "Environment Strategy",
  "Folder Hierarchy",
  "Networking Architecture",
  "IAM Model",
  "Security & Compliance",
  "Logging & Monitoring",
  "Google Cloud Support",
  "Automation & Contact",
];

const WizardPage = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
  });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const update = (field: keyof WizardData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleEnv = (env: string) => {
    setData(prev => ({
      ...prev,
      environments: prev.environments.includes(env)
        ? prev.environments.filter(e => e !== env)
        : [...prev.environments, env],
    }));
  };

  const isIdentityGateValid = () => {
    if (data.workspaceExists !== "yes") return false;
    if (!data.identityOrgId || !/^\d+$/.test(data.identityOrgId)) return false;
    if (!data.identityDomain.trim()) return false;
    if (!data.superAdminConfirmed) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!data.companyName || !data.email || !data.contactPerson) {
      toast.error("Please fill in all required contact fields.");
      return;
    }

    const regionsArray = data.regions
      ? data.regions.split(",").map(r => r.trim()).filter(Boolean)
      : [];

    const { error } = await supabase.from("submissions").insert({
      company_name: data.companyName,
      contact_person: data.contactPerson,
      email: data.email,
      org_id: data.identityOrgId || data.orgId,
      billing_account: data.billingId,
      environments: data.environments,
      network_model: data.networkModel,
      iam_model: data.iamModel,
      cis_level: data.cisLevel,
      regions: regionsArray,
      budget_threshold: data.budgetThreshold ? Number(data.budgetThreshold) : null,
      timeline: data.timeline,
      status: "New",
      workspace_exists: data.workspaceExists === "yes",
      primary_domain: data.identityDomain || data.domain,
      super_admin_confirmed: data.superAdminConfirmed,
    });

    if (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit. Please try again.");
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    setSubmitted(true);
    toast.success("Submission received! We'll be in touch.");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-3xl font-black mb-4 text-foreground">Submission Received!</h1>
          <p className="text-muted-foreground mb-8">Thank you for completing the Landing Zone assessment. Our team will review your requirements and reach out within 24 hours.</p>
          <Link to="/"><Button size="lg">Back to Home</Button></Link>
        </motion.div>
      </div>
    );
  }

  const renderStep = () => {
    const fieldClass = "space-y-2";
    switch (step) {
      case 0: return (
        <div className="space-y-6">
          <div className={fieldClass}>
            <Label className="text-base font-semibold">Do you already have Google Workspace and a GCP Organization? *</Label>
            <RadioGroup value={data.workspaceExists} onValueChange={v => update("workspaceExists", v)} className="mt-3">
              <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card">
                <RadioGroupItem value="yes" id="ws-yes" />
                <Label htmlFor="ws-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card">
                <RadioGroupItem value="no" id="ws-no" />
                <Label htmlFor="ws-no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {data.workspaceExists === "no" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border-2 border-destructive/50 bg-destructive/5 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Google Workspace Required</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Before proceeding, you must register Google Workspace and verify your domain. Once completed, return with your Organization ID.
                  </p>
                </div>
              </div>
              <a
                href="https://workspace.google.com/gcpidentity/signup?sku=identitybasic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Register Google Workspace <ExternalLink className="h-4 w-4" />
              </a>
            </motion.div>
          )}

          {data.workspaceExists === "yes" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className={fieldClass}>
                <Label>Organization ID * <span className="text-xs text-muted-foreground">(numeric only)</span></Label>
                <Input
                  placeholder="123456789012"
                  value={data.identityOrgId}
                  onChange={e => update("identityOrgId", e.target.value)}
                />
                {data.identityOrgId && !/^\d+$/.test(data.identityOrgId) && (
                  <p className="text-sm text-destructive">Organization ID must be numeric only.</p>
                )}
              </div>
              <div className={fieldClass}>
                <Label>Primary Domain *</Label>
                <Input
                  placeholder="company.com"
                  value={data.identityDomain}
                  onChange={e => update("identityDomain", e.target.value)}
                />
              </div>
              <div className={fieldClass}>
                <Label className="text-base font-semibold">Do you have Super Admin access to Google Workspace? *</Label>
                <RadioGroup
                  value={data.superAdminSelection}
                  onValueChange={v => {
                    update("superAdminSelection", v);
                    update("superAdminConfirmed", v === "yes");
                  }}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card">
                    <RadioGroupItem value="yes" id="sa-yes" />
                    <Label htmlFor="sa-yes" className="cursor-pointer">Yes, I have Super Admin access</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card">
                    <RadioGroupItem value="no" id="sa-no" />
                    <Label htmlFor="sa-no" className="cursor-pointer">No, I don't have Super Admin access to Google Workspace</Label>
                  </div>
                </RadioGroup>
              </div>

              {data.superAdminSelection === "no" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border-2 border-destructive/50 bg-destructive/5 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Super Admin Access Required</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You need Super Admin access to proceed. Use the link below to recover or verify your Super Admin user details.
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://toolbox.googleapps.com/apps/recovery/form"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Recover Super Admin Access <ExternalLink className="h-4 w-4" />
                  </a>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      );
      case 1: return (
        <div className="space-y-6">
          <div className={fieldClass}><Label>GCP Organization ID *</Label><Input placeholder="123456789012" value={data.orgId || data.identityOrgId} onChange={e => update("orgId", e.target.value)} /></div>
          <div className={fieldClass}><Label>Primary Domain *</Label><Input placeholder="company.com" value={data.domain || data.identityDomain} onChange={e => update("domain", e.target.value)} /></div>
          <div className={fieldClass}><Label>Organization Policy Automation</Label>
            <Select value={data.policyAutomation} onValueChange={v => update("policyAutomation", v)}>
              <SelectTrigger><SelectValue placeholder="Select preference" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Automation</SelectItem>
                <SelectItem value="partial">Partial (Review & Apply)</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-6">
          <div className={fieldClass}><Label>Billing Account ID *</Label><Input placeholder="0X0X0X-0X0X0X-0X0X0X" value={data.billingId} onChange={e => update("billingId", e.target.value)} /></div>
          <div className={fieldClass}><Label>Monthly Budget Threshold (USD)</Label><Input type="number" placeholder="10000" value={data.budgetThreshold} onChange={e => update("budgetThreshold", e.target.value)} /></div>
          <div className={fieldClass}><Label>Alert Recipients (comma-separated emails)</Label><Input placeholder="cto@company.com, finance@company.com" value={data.alertRecipients} onChange={e => update("alertRecipients", e.target.value)} /></div>
        </div>
      );
      case 3: return (
        <div className="space-y-6">
          <Label>Select Environments *</Label>
          <div className="grid grid-cols-2 gap-3">
            {["Development", "Testing", "Staging", "Production"].map(env => (
              <div key={env} className="flex items-center space-x-2 p-3 rounded-lg border bg-card cursor-pointer hover:border-primary/50 transition-colors" onClick={() => toggleEnv(env)}>
                <Checkbox checked={data.environments.includes(env)} />
                <span className="text-sm font-medium text-foreground">{env}</span>
              </div>
            ))}
          </div>
          <div className={fieldClass}><Label>Custom Environment (optional)</Label><Input placeholder="e.g., Sandbox, DR" value={data.customEnv} onChange={e => update("customEnv", e.target.value)} /></div>
        </div>
      );
      case 4: {
        const folderOptions = [
          {
            value: "env-based",
            label: "Environment-Based (Dev/Test/Prod)",
            architecture: [
              "Organization",
              "├── Folder: Development",
              "│   ├── Project: app-dev",
              "│   └── Project: data-dev",
              "├── Folder: Testing",
              "│   ├── Project: app-test",
              "│   └── Project: data-test",
              "├── Folder: Staging",
              "│   └── Project: app-staging",
              "└── Folder: Production",
              "    ├── Project: app-prod",
              "    └── Project: data-prod",
            ],
            description: "Organizes projects by lifecycle stage. Best for teams with clear dev → prod promotion workflows.",
          },
          {
            value: "team-based",
            label: "Team/BU-Based",
            architecture: [
              "Organization",
              "├── Folder: Engineering",
              "│   ├── Project: eng-backend",
              "│   └── Project: eng-frontend",
              "├── Folder: Data Science",
              "│   ├── Project: ds-analytics",
              "│   └── Project: ds-ml-pipelines",
              "├── Folder: Marketing",
              "│   └── Project: mkt-campaigns",
              "└── Folder: Finance",
              "    └── Project: fin-reporting",
            ],
            description: "Organizes by business unit or team. Best for large orgs with autonomous teams and separate budgets.",
          },
          {
            value: "hybrid",
            label: "Hybrid (Env + Team)",
            architecture: [
              "Organization",
              "├── Folder: Engineering",
              "│   ├── Folder: Dev",
              "│   │   └── Project: eng-app-dev",
              "│   ├── Folder: Staging",
              "│   │   └── Project: eng-app-staging",
              "│   └── Folder: Prod",
              "│       └── Project: eng-app-prod",
              "├── Folder: Data Science",
              "│   ├── Folder: Dev",
              "│   │   └── Project: ds-ml-dev",
              "│   └── Folder: Prod",
              "│       └── Project: ds-ml-prod",
            ],
            description: "Combines team isolation with environment separation. Best for enterprises needing both team autonomy and lifecycle controls.",
          },
          {
            value: "custom",
            label: "Custom",
            architecture: [
              "Organization",
              "├── Folder: [Your Structure]",
              "│   ├── Folder: [Sub-group A]",
              "│   │   └── Project: [project-a]",
              "│   └── Folder: [Sub-group B]",
              "│       └── Project: [project-b]",
              "└── Folder: [Shared Services]",
              "    └── Project: [shared-infra]",
            ],
            description: "Define your own folder hierarchy. Describe your preferred structure in the notes below.",
          },
        ];

        return (
          <div className="space-y-6">
            <div className={fieldClass}>
              <Label>Folder Hierarchy Preference</Label>
              <div className="grid gap-3 mt-2">
                {folderOptions.map(opt => (
                  <HoverCard key={opt.value} openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <div
                        onClick={() => update("folderPreference", opt.value)}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                          data.folderPreference === opt.value
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <span className="text-sm font-medium text-foreground">{opt.label}</span>
                        <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent side="right" align="start" className="w-80 p-4">
                      <p className="text-sm font-semibold text-foreground mb-2">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mb-3">{opt.description}</p>
                      <div className="bg-muted rounded-md p-3 font-mono text-xs text-foreground leading-relaxed whitespace-pre">
                        {opt.architecture.join("\n")}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
            <div className={fieldClass}><Label>Additional Notes</Label><Textarea placeholder="Describe your preferred folder structure..." value={data.folderNotes} onChange={e => update("folderNotes", e.target.value)} /></div>
          </div>
        );
      }
      case 5: {
        const networkOptions = [
          {
            value: "shared-vpc",
            label: "Shared VPC (Recommended)",
            description: "Centralized network management. Host project owns VPCs, service projects attach. Best for enterprises needing consistent network policies.",
            architecture: [
              "Organization",
              "├── Host Project (Shared VPC)",
              "│   ├── VPC: shared-network",
              "│   │   ├── Subnet: dev (10.0.1.0/24)",
              "│   │   ├── Subnet: staging (10.0.2.0/24)",
              "│   │   └── Subnet: prod (10.0.3.0/24)",
              "│   ├── Cloud Router",
              "│   ├── Cloud NAT",
              "│   └── Firewall Rules (centralized)",
              "├── Service Project: app-dev",
              "│   └── Uses: shared-network/dev",
              "├── Service Project: app-staging",
              "│   └── Uses: shared-network/staging",
              "└── Service Project: app-prod",
              "    └── Uses: shared-network/prod",
            ],
          },
          {
            value: "per-project",
            label: "Per-Project VPC",
            description: "Each project gets its own VPC. Maximum isolation but more management overhead. Good for independent teams or strict compliance boundaries.",
            architecture: [
              "Organization",
              "├── Project: app-dev",
              "│   └── VPC: dev-network",
              "│       ├── Subnet: default (10.1.0.0/24)",
              "│       ├── Cloud Router",
              "│       ├── Cloud NAT",
              "│       └── Firewall Rules",
              "├── Project: app-staging",
              "│   └── VPC: staging-network",
              "│       ├── Subnet: default (10.2.0.0/24)",
              "│       ├── Cloud Router",
              "│       └── Firewall Rules",
              "└── Project: app-prod",
              "    └── VPC: prod-network",
              "        ├── Subnet: default (10.3.0.0/24)",
              "        ├── Cloud Router",
              "        ├── Cloud NAT",
              "        └── Firewall Rules",
            ],
          },
          {
            value: "hub-spoke",
            label: "Hub & Spoke",
            description: "Central hub VPC connects to spoke VPCs via peering. Balances isolation with centralized egress/ingress and shared services.",
            architecture: [
              "Organization",
              "├── Hub Project",
              "│   └── VPC: hub-network",
              "│       ├── Subnet: shared-services (10.0.0.0/24)",
              "│       ├── Cloud Router + Cloud NAT",
              "│       ├── Cloud VPN / Interconnect",
              "│       └── Firewall Rules (centralized)",
              "├── Spoke: dev-project",
              "│   └── VPC: dev-spoke",
              "│       ├── Subnet: workloads (10.1.0.0/24)",
              "│       └── Peering → hub-network",
              "├── Spoke: staging-project",
              "│   └── VPC: staging-spoke",
              "│       ├── Subnet: workloads (10.2.0.0/24)",
              "│       └── Peering → hub-network",
              "└── Spoke: prod-project",
              "    └── VPC: prod-spoke",
              "        ├── Subnet: workloads (10.3.0.0/24)",
              "        └── Peering → hub-network",
            ],
          },
        ];
        return (
          <div className="space-y-6">
            <div className={fieldClass}>
              <Label>Network Model *</Label>
              <div className="grid gap-3 mt-2">
                {networkOptions.map(opt => (
                  <HoverCard key={opt.value} openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <div
                        onClick={() => update("networkModel", opt.value)}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                          data.networkModel === opt.value
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <span className="text-sm font-medium text-foreground">{opt.label}</span>
                        <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent side="right" align="start" className="w-96 p-4">
                      <p className="text-sm font-semibold text-foreground mb-2">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mb-3">{opt.description}</p>
                      <div className="bg-muted rounded-md p-3 font-mono text-xs text-foreground leading-relaxed whitespace-pre">
                        {opt.architecture.join("\n")}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
            <div className={fieldClass}><Label>Primary Regions (comma-separated)</Label><Input placeholder="us-central1, europe-west1" value={data.regions} onChange={e => update("regions", e.target.value)} /></div>
            <div className={fieldClass}><Label>Hybrid Connectivity</Label>
              <Select value={data.hybridConnectivity} onValueChange={v => update("hybridConnectivity", v)}>
                <SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="vpn">Cloud VPN</SelectItem>
                  <SelectItem value="interconnect">Dedicated Interconnect</SelectItem>
                  <SelectItem value="partner">Partner Interconnect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      }
      case 6: return (
        <div className="space-y-6">
          <div className={fieldClass}><Label>IAM Model *</Label>
            <Select value={data.iamModel} onValueChange={v => update("iamModel", v)}>
              <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="centralized">Centralized</SelectItem>
                <SelectItem value="federated">Federated</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={fieldClass}><Label>Identity Provider (IdP)</Label>
            <Select value={data.identityProvider} onValueChange={v => update("identityProvider", v)}>
              <SelectTrigger><SelectValue placeholder="Select IdP" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="google-workspace">Google Workspace</SelectItem>
                <SelectItem value="azure-ad">Azure AD / Entra ID</SelectItem>
                <SelectItem value="okta">Okta</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
      case 7: return (
        <div className="space-y-6">
          <div className={fieldClass}><Label>CIS Benchmark Level</Label>
            <Select value={data.cisLevel} onValueChange={v => update("cisLevel", v)}>
              <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="level1">Level 1 (Standard)</SelectItem>
                <SelectItem value="level2">Level 2 (Strict)</SelectItem>
                <SelectItem value="custom">Custom Policy Set</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card">
            <Checkbox checked={data.vpcServiceControls} onCheckedChange={v => update("vpcServiceControls", !!v)} />
            <Label>Enable VPC Service Controls</Label>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card">
            <Checkbox checked={data.cmek} onCheckedChange={v => update("cmek", !!v)} />
            <Label>Enable Customer-Managed Encryption Keys (CMEK)</Label>
          </div>
          <div className={fieldClass}><Label>Additional Compliance Notes</Label><Textarea placeholder="SOC 2, HIPAA, ISO 27001, etc." value={data.complianceNotes} onChange={e => update("complianceNotes", e.target.value)} /></div>
        </div>
      );
      case 8: return (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card">
            <Checkbox checked={data.centralLogging} onCheckedChange={v => update("centralLogging", !!v)} />
            <Label>Enable Central Logging Project</Label>
          </div>
          <div className={fieldClass}><Label>Log Retention (days)</Label>
            <Select value={data.logRetention} onValueChange={v => update("logRetention", v)}>
              <SelectTrigger><SelectValue placeholder="Select retention" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">365 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={fieldClass}><Label>SIEM Integration</Label>
            <Select value={data.siemIntegration} onValueChange={v => update("siemIntegration", v)}>
              <SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="chronicle">Google Chronicle</SelectItem>
                <SelectItem value="splunk">Splunk</SelectItem>
                <SelectItem value="sentinel">Microsoft Sentinel</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
      case 9: return (
        <div className="space-y-6">
          <Label className="text-base">Select a Google Cloud Support Plan *</Label>
          <div className="space-y-4">
            {[
              { value: "standard", title: "Standard Support", price: "$29/month base", desc: "Technical support during business hours with 4-hour response time for P2 issues. Ideal for workloads under development." },
              { value: "enhanced", title: "Enhanced Support", price: "Starting at $500/month + 3% of net charges", desc: "1-hour response for P1 issues, 24/7 coverage for critical issues, third-party tech support, and Cloud AI companion. Best for production workloads." },
              { value: "premium", title: "Premium Support", price: "Starting at $12,500/month + 4% of net charges", desc: "15-minute response for P1 issues, named Technical Account Manager, Customer Aware Support, and proactive guidance. For mission-critical workloads." },
            ].map(plan => (
              <div
                key={plan.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${data.supportPlan === plan.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-card"}`}
                onClick={() => update("supportPlan", plan.value)}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${data.supportPlan === plan.value ? "border-primary" : "border-muted-foreground/40"}`}>
                    {data.supportPlan === plan.value && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-bold text-foreground">{plan.title}</h4>
                      <span className="text-sm font-semibold text-primary">{plan.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      case 10: return (
        <div className="space-y-6">
          <div className={fieldClass}><Label>CI/CD Tool</Label>
            <Select value={data.cicdTool} onValueChange={v => update("cicdTool", v)}>
              <SelectTrigger><SelectValue placeholder="Select tool" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cloud-build">Cloud Build</SelectItem>
                <SelectItem value="github-actions">GitHub Actions</SelectItem>
                <SelectItem value="gitlab-ci">GitLab CI</SelectItem>
                <SelectItem value="jenkins">Jenkins</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={fieldClass}><Label>Terraform State Location</Label>
            <Select value={data.terraformStateLocation} onValueChange={v => update("terraformStateLocation", v)}>
              <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                <SelectItem value="terraform-cloud">Terraform Cloud</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={fieldClass}><Label>Expected Timeline</Label>
            <Select value={data.timeline} onValueChange={v => update("timeline", v)}>
              <SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">ASAP (1-2 weeks)</SelectItem>
                <SelectItem value="1month">Within 1 month</SelectItem>
                <SelectItem value="3months">Within 3 months</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <hr className="border-border" />
          <h3 className="font-bold text-lg text-foreground">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className={fieldClass}><Label>Company Name *</Label><Input value={data.companyName} onChange={e => update("companyName", e.target.value)} /></div>
            <div className={fieldClass}><Label>Contact Person *</Label><Input value={data.contactPerson} onChange={e => update("contactPerson", e.target.value)} /></div>
            <div className={fieldClass}><Label>Email *</Label><Input type="email" value={data.email} onChange={e => update("email", e.target.value)} /></div>
            <div className={fieldClass}><Label>Phone</Label><Input type="tel" value={data.phone} onChange={e => update("phone", e.target.value)} /></div>
            <div className={fieldClass}><Label>Country</Label><Input value={data.country} onChange={e => update("country", e.target.value)} /></div>
            <div className={fieldClass}><Label>Expected Go-Live Date</Label><Input type="date" value={data.goLiveDate} onChange={e => update("goLiveDate", e.target.value)} /></div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  const canProceedFromStep = () => {
    if (step === 0) return isIdentityGateValid();
    if (step === 9 && !data.supportPlan) return false;
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !isIdentityGateValid()) {
      if (data.workspaceExists === "no") {
        toast.error("You must have Google Workspace before proceeding.");
      } else if (!data.workspaceExists) {
        toast.error("Please select whether you have Google Workspace.");
      } else {
        toast.error("Please complete all required identity fields.");
      }
      return;
    }
    if (step === 9 && !data.supportPlan) {
      toast.error("Please select a support plan before continuing.");
      return;
    }
    setStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
            <Cloud className="h-5 w-5 text-primary" />
            CloudFoundry
          </Link>
          <span className="text-sm text-muted-foreground">Step {step + 1} of {stepTitles.length}</span>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex gap-1">
            {stepTitles.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="relative h-40 md:h-48 overflow-hidden">
            <img
              src={stepImages[step]}
              alt={stepTitles[step]}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              <h2 className="text-2xl font-black text-foreground">{stepTitles[step]}</h2>
              <p className="text-muted-foreground text-sm">Step {step + 1} of {stepTitles.length}</p>
            </div>
          </div>
          <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            {step < stepTitles.length - 1 ? (
              <Button onClick={handleNext} disabled={step === 0 && data.workspaceExists === "no"}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button variant="accent" onClick={handleSubmit}>
                Submit Assessment <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WizardPage;

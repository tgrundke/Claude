export type OnboardingStage =
  | "new_lead"
  | "discovery"
  | "environment_documentation"
  | "deployment_planning"
  | "tool_provisioning"
  | "deployment_execution"
  | "verification"
  | "complete";

export const STAGE_LABELS: Record<OnboardingStage, string> = {
  new_lead: "New Lead",
  discovery: "Discovery",
  environment_documentation: "Environment Documentation",
  deployment_planning: "Deployment Planning",
  tool_provisioning: "Tool Provisioning",
  deployment_execution: "Deployment Execution",
  verification: "Verification",
  complete: "Complete",
};

export const STAGE_COLORS: Record<OnboardingStage, string> = {
  new_lead: "bg-blue-100 text-blue-800",
  discovery: "bg-purple-100 text-purple-800",
  environment_documentation: "bg-yellow-100 text-yellow-800",
  deployment_planning: "bg-orange-100 text-orange-800",
  tool_provisioning: "bg-cyan-100 text-cyan-800",
  deployment_execution: "bg-indigo-100 text-indigo-800",
  verification: "bg-pink-100 text-pink-800",
  complete: "bg-green-100 text-green-800",
};

export const STAGE_ORDER: OnboardingStage[] = [
  "new_lead",
  "discovery",
  "environment_documentation",
  "deployment_planning",
  "tool_provisioning",
  "deployment_execution",
  "verification",
  "complete",
];

export interface Client {
  id: string;
  companyName: string;
  primaryContact: ContactInfo;
  additionalContacts: ContactInfo[];
  address: Address;
  website: string;
  industry: string;
  employeeCount: number;
  currentProvider: OutgoingProvider;
  contractStartDate: string;
  contractValue: number;
  slaTier: "standard" | "premium" | "enterprise";
  stage: OnboardingStage;
  checklist: ChecklistItem[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  isPrimary: boolean;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  state: string;
  zip: string;
}

export interface OutgoingProvider {
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contractEndDate: string;
  servicesProvided: string;
  notes: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  completed: boolean;
  completedAt: string | null;
  completedBy: string | null;
  notes: string;
  order: number;
}

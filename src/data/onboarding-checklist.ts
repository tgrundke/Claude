import type { ChecklistItem } from "@/types/client";
import { generateId } from "@/lib/id";

export function getDefaultChecklist(): ChecklistItem[] {
  const items = [
    { category: "Discovery", label: "Gather existing network diagrams" },
    { category: "Discovery", label: "Collect current vendor contracts" },
    { category: "Discovery", label: "Document ISP details (provider, circuit IDs, bandwidth)" },
    { category: "Discovery", label: "Review existing SLAs and compliance requirements" },
    { category: "Discovery", label: "Document line-of-business applications" },
    { category: "Access & Credentials", label: "Obtain domain admin credentials" },
    { category: "Access & Credentials", label: "Collect M365 / Google Workspace global admin access" },
    { category: "Access & Credentials", label: "Get firewall admin credentials" },
    { category: "Access & Credentials", label: "Gather WiFi SSID and credentials" },
    { category: "Access & Credentials", label: "Collect VPN configuration details" },
    { category: "Network", label: "Document IP addressing scheme" },
    { category: "Network", label: "Map VLAN configuration" },
    { category: "Network", label: "Record DNS settings (internal and external)" },
    { category: "Network", label: "Document DHCP scopes" },
    { category: "Security", label: "Review current antivirus / EDR solution" },
    { category: "Security", label: "Audit MFA status across all users" },
    { category: "Security", label: "Review backup configuration and test restores" },
    { category: "Security", label: "Document compliance requirements (HIPAA, PCI, etc.)" },
    { category: "Security", label: "Review conditional access / security policies" },
    { category: "Deployment Prep", label: "Create NinjaOne tenant and configure policies" },
    { category: "Deployment Prep", label: "Configure Auvik collector" },
    { category: "Deployment Prep", label: "Provision Sophos MDR tenant" },
    { category: "Deployment Prep", label: "Set up Axcient backup appliance / cloud" },
    { category: "Communication", label: "Send welcome email to client" },
    { category: "Communication", label: "Notify outgoing provider of transition timeline" },
    { category: "Communication", label: "Schedule kickoff meeting with client" },
    { category: "Communication", label: "Distribute deployment timeline to all parties" },
    { category: "Verification", label: "Verify all RMM agents reporting" },
    { category: "Verification", label: "Confirm backup jobs running successfully" },
    { category: "Verification", label: "Validate monitoring alerts are firing correctly" },
    { category: "Verification", label: "Complete handoff documentation" },
  ];

  return items.map((item, index) => ({
    id: generateId(),
    category: item.category,
    label: item.label,
    completed: false,
    completedAt: null,
    completedBy: null,
    assignedTo: "",
    scheduledDate: "",
    dueDate: "",
    priority: "medium" as const,
    notes: "",
    order: index,
  }));
}

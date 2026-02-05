import type { DeploymentItem, DeploymentTool } from "@/types/deployment";
import { generateId } from "@/lib/id";
import { addDays, format } from "date-fns";

interface DeploymentTemplate {
  tool: DeploymentTool;
  taskName: string;
  description: string;
  dayOffset: number;
  estimatedDurationMinutes: number;
  scheduledTime: string;
}

const DEPLOYMENT_TEMPLATES: DeploymentTemplate[] = [
  // Week 1 - NinjaOne + Auvik
  {
    tool: "ninja",
    taskName: "NinjaOne - Server Agent Deployment",
    description: "Deploy NinjaOne RMM agent to all servers. Verify agents check in and are reporting correctly.",
    dayOffset: 0,
    estimatedDurationMinutes: 120,
    scheduledTime: "09:00",
  },
  {
    tool: "ninja",
    taskName: "NinjaOne - Workstation Agent Deployment",
    description: "Deploy NinjaOne RMM agent to all workstations via GPO or manual installation.",
    dayOffset: 2,
    estimatedDurationMinutes: 240,
    scheduledTime: "09:00",
  },
  {
    tool: "ninja",
    taskName: "NinjaOne - Policy Configuration",
    description: "Configure monitoring policies, patch management policies, and alert thresholds.",
    dayOffset: 3,
    estimatedDurationMinutes: 120,
    scheduledTime: "10:00",
  },
  {
    tool: "auvik",
    taskName: "Auvik - Collector Deployment",
    description: "Deploy Auvik collector to the network. Configure SNMP community strings on managed switches.",
    dayOffset: 4,
    estimatedDurationMinutes: 60,
    scheduledTime: "09:00",
  },
  {
    tool: "auvik",
    taskName: "Auvik - Network Discovery & Mapping",
    description: "Allow Auvik to discover the network. Review and categorize discovered devices. Set up alerts.",
    dayOffset: 5,
    estimatedDurationMinutes: 90,
    scheduledTime: "10:00",
  },
  // Week 2 - Sophos MDR
  {
    tool: "sophos_mdr",
    taskName: "Sophos MDR - Server Endpoint Deployment",
    description: "Deploy Sophos MDR endpoint agent to all servers. Remove any existing AV software first.",
    dayOffset: 7,
    estimatedDurationMinutes: 120,
    scheduledTime: "09:00",
  },
  {
    tool: "sophos_mdr",
    taskName: "Sophos MDR - Workstation Endpoint Deployment",
    description: "Deploy Sophos MDR endpoint agent to all workstations. Remove existing AV first.",
    dayOffset: 9,
    estimatedDurationMinutes: 240,
    scheduledTime: "09:00",
  },
  {
    tool: "sophos_mdr",
    taskName: "Sophos MDR - Policy & Exclusion Configuration",
    description: "Configure Sophos policies, add necessary exclusions for LOB apps, and verify MDR service is active.",
    dayOffset: 11,
    estimatedDurationMinutes: 120,
    scheduledTime: "10:00",
  },
  // Week 3 - Axcient
  {
    tool: "axcient",
    taskName: "Axcient - Backup Agent Deployment (Servers)",
    description: "Deploy Axcient backup agents to all servers. Configure backup sets and schedules.",
    dayOffset: 14,
    estimatedDurationMinutes: 180,
    scheduledTime: "09:00",
  },
  {
    tool: "axcient",
    taskName: "Axcient - Initial Seed Backup",
    description: "Start initial seed backups. Monitor for completion and troubleshoot any failures.",
    dayOffset: 15,
    estimatedDurationMinutes: 480,
    scheduledTime: "18:00",
  },
  {
    tool: "axcient",
    taskName: "Axcient - Backup Verification & Test Restore",
    description: "Verify initial backups completed successfully. Perform test restore to validate recoverability.",
    dayOffset: 17,
    estimatedDurationMinutes: 120,
    scheduledTime: "10:00",
  },
  // Week 4 - Verification
  {
    tool: "ninja",
    taskName: "Final Verification - All Agents Reporting",
    description: "Verify all NinjaOne, Auvik, Sophos, and Axcient agents are reporting. Resolve any missing devices.",
    dayOffset: 21,
    estimatedDurationMinutes: 120,
    scheduledTime: "09:00",
  },
  {
    tool: "ninja",
    taskName: "Alert Tuning & Threshold Adjustment",
    description: "Review alerts from the past 3 weeks. Tune thresholds and eliminate false positives.",
    dayOffset: 22,
    estimatedDurationMinutes: 120,
    scheduledTime: "10:00",
  },
  {
    tool: "ninja",
    taskName: "Documentation & Handoff",
    description: "Finalize all documentation. Update Hudu with environment details. Complete handoff to support team.",
    dayOffset: 24,
    estimatedDurationMinutes: 180,
    scheduledTime: "09:00",
  },
];

export function generateDefaultDeploymentPlan(
  clientId: string,
  startDate: Date
): DeploymentItem[] {
  return DEPLOYMENT_TEMPLATES.map((template) => ({
    id: generateId(),
    clientId,
    tool: template.tool,
    taskName: template.taskName,
    description: template.description,
    scheduledDate: format(addDays(startDate, template.dayOffset), "yyyy-MM-dd"),
    scheduledTime: template.scheduledTime,
    estimatedDurationMinutes: template.estimatedDurationMinutes,
    status: "not_started" as const,
    assignedTo: "",
    dependsOn: [],
    linkedEmailId: null,
    notes: "",
    completedAt: null,
  }));
}

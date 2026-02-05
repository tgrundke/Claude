import { format, parseISO } from "date-fns";
import type { Client } from "@/types/client";
import type { EmailTemplate } from "@/types/email";
import type { DeploymentItem } from "@/types/deployment";
import { TOOL_DISPLAY_NAMES } from "@/types/deployment";

export function buildVariableMap(
  client: Client,
  deploymentItems?: DeploymentItem[],
  extraVars?: Record<string, string>
): Record<string, string> {
  const vars: Record<string, string> = {
    companyName: client.companyName,
    contactFirstName: client.primaryContact.firstName,
    contactLastName: client.primaryContact.lastName,
    contactFullName: `${client.primaryContact.firstName} ${client.primaryContact.lastName}`,
    contactEmail: client.primaryContact.email,
    contactPhone: client.primaryContact.phone,
    contactTitle: client.primaryContact.title,
    companyAddress: [client.address.street, client.address.suite, client.address.city, client.address.state, client.address.zip].filter(Boolean).join(", "),
    currentProviderName: client.currentProvider.name,
    currentProviderContact: client.currentProvider.contactName,
    currentProviderEmail: client.currentProvider.contactEmail,
    currentProviderPhone: client.currentProvider.contactPhone,
    contractStartDate: client.contractStartDate ? format(parseISO(client.contractStartDate), "MMMM d, yyyy") : "TBD",
    contractEndDate: client.currentProvider.contractEndDate ? format(parseISO(client.currentProvider.contractEndDate), "MMMM d, yyyy") : "TBD",
    slaTier: client.slaTier.charAt(0).toUpperCase() + client.slaTier.slice(1),
    employeeCount: String(client.employeeCount),
    industry: client.industry,
    website: client.website,
  };

  if (deploymentItems && deploymentItems.length > 0) {
    const scheduleLines = deploymentItems
      .filter((item) => item.scheduledDate)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
      .map((item) => {
        const date = format(parseISO(item.scheduledDate), "MMM d, yyyy");
        const tool = TOOL_DISPLAY_NAMES[item.tool];
        return `  - ${date}: ${tool} - ${item.taskName}`;
      });
    vars.deploymentSchedule = scheduleLines.join("\n");
  }

  if (extraVars) {
    Object.assign(vars, extraVars);
  }

  return vars;
}

export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
    result = result.replace(regex, value || "");
  }
  return result;
}

export function renderEmailTemplate(
  template: EmailTemplate,
  client: Client,
  deploymentItems?: DeploymentItem[],
  extraVars?: Record<string, string>
): { subject: string; body: string } {
  const variables = buildVariableMap(client, deploymentItems, extraVars);
  return {
    subject: renderTemplate(template.subject, variables),
    body: renderTemplate(template.body, variables),
  };
}

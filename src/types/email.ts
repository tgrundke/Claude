export type EmailTemplateType =
  | "client_welcome"
  | "outgoing_provider_notification"
  | "deployment_schedule"
  | "tool_access_credentials"
  | "weekly_status_update"
  | "onboarding_complete";

export type EmailStatus = "draft" | "ready" | "sent" | "failed";

export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
  availableVariables: string[];
  isDefault: boolean;
}

export interface GeneratedEmail {
  id: string;
  clientId: string;
  templateId: string | null;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  status: EmailStatus;
  linkedDeploymentItemId: string | null;
  scheduledSendDate: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const EMAIL_STATUS_COLORS: Record<EmailStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  ready: "bg-blue-100 text-blue-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

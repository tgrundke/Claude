export type M365CheckCategory =
  | "identity_access"
  | "email_security"
  | "data_protection"
  | "endpoint_management"
  | "compliance"
  | "tenant_config"
  | "teams_sharepoint";

export type M365CheckSeverity = "critical" | "high" | "medium" | "low" | "info";

export type M365CheckStatus = "pass" | "fail" | "warning" | "not_checked" | "not_applicable";

export interface M365Check {
  id: string;
  category: M365CheckCategory;
  name: string;
  description: string;
  severity: M365CheckSeverity;
  status: M365CheckStatus;
  currentValue: string;
  recommendedValue: string;
  remediation: string;
  cippEquivalent?: string; // CIPP standard name if applicable
  microsoftDoc?: string; // MS doc reference
}

export interface M365TenantInfo {
  tenantId: string;
  tenantName: string;
  primaryDomain: string;
  totalUsers: number;
  licensedUsers: number;
  guestUsers: number;
  adminUsers: number;
  licenses: M365License[];
  domains: string[];
  connectedAt: string;
}

export interface M365License {
  name: string;
  skuId: string;
  totalLicenses: number;
  assignedLicenses: number;
  availableLicenses: number;
}

export interface M365Assessment {
  clientId: string;
  tenantInfo: M365TenantInfo | null;
  checks: M365Check[];
  runAt: string | null;
  status: "not_started" | "connecting" | "running" | "completed" | "error";
  errorMessage: string | null;
  overallScore: number; // 0-100
}

export const M365_CATEGORY_LABELS: Record<M365CheckCategory, string> = {
  identity_access: "Identity & Access Management",
  email_security: "Email Security",
  data_protection: "Data Protection",
  endpoint_management: "Endpoint Management",
  compliance: "Compliance & Governance",
  tenant_config: "Tenant Configuration",
  teams_sharepoint: "Teams & SharePoint",
};

export const M365_CATEGORY_ICONS: Record<M365CheckCategory, string> = {
  identity_access: "shield",
  email_security: "mail",
  data_protection: "lock",
  endpoint_management: "monitor",
  compliance: "clipboard",
  tenant_config: "settings",
  teams_sharepoint: "users",
};

export const M365_SEVERITY_COLORS: Record<M365CheckSeverity, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
  info: "bg-gray-100 text-gray-600",
};

export const M365_STATUS_COLORS: Record<M365CheckStatus, string> = {
  pass: "bg-green-100 text-green-800",
  fail: "bg-red-100 text-red-800",
  warning: "bg-yellow-100 text-yellow-800",
  not_checked: "bg-gray-100 text-gray-500",
  not_applicable: "bg-gray-50 text-gray-400",
};

export const M365_STATUS_LABELS: Record<M365CheckStatus, string> = {
  pass: "Pass",
  fail: "Fail",
  warning: "Warning",
  not_checked: "Not Checked",
  not_applicable: "N/A",
};

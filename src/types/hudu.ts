export type HuduConfigType =
  | "client_profile"
  | "microsoft_365"
  | "vpn_configuration"
  | "firewall_configuration"
  | "server_configuration"
  | "network_switch_configuration"
  | "backup_configuration"
  | "wireless_configuration"
  | "domain_dns"
  | "isp_circuit"
  | "printer_scanner"
  | "voip_configuration"
  | "security_solution"
  | "physical_location";

export const HUDU_CONFIG_LABELS: Record<HuduConfigType, string> = {
  client_profile: "Client Profile",
  microsoft_365: "Microsoft 365 Configuration",
  vpn_configuration: "VPN Configuration",
  firewall_configuration: "Firewall Configuration",
  server_configuration: "Server Configuration",
  network_switch_configuration: "Network Switch Configuration",
  backup_configuration: "Backup Configuration",
  wireless_configuration: "Wireless Configuration",
  domain_dns: "Domain & DNS",
  isp_circuit: "ISP / Circuit",
  printer_scanner: "Printer / Scanner",
  voip_configuration: "VoIP Configuration",
  security_solution: "Security Solution (Sophos MDR)",
  physical_location: "Physical Location",
};

export interface HuduRequiredField {
  fieldName: string;
  label: string;
  required: boolean;
}

export interface HuduExpectedConfig {
  type: HuduConfigType;
  label: string;
  expectedCount: number;
  source: string; // "environment_data" | "standard" | "manual"
  requiredFields: HuduRequiredField[];
}

export interface HuduActualConfig {
  type: HuduConfigType;
  name: string;
  exists: boolean;
  populatedFields: string[];
  missingFields: string[];
  completionPct: number;
}

export type ExceptionSeverity = "critical" | "warning" | "info";

export interface HuduException {
  id: string;
  severity: ExceptionSeverity;
  configType: HuduConfigType;
  title: string;
  description: string;
  expectedValue: string;
  actualValue: string;
  resolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export const EXCEPTION_SEVERITY_COLORS: Record<ExceptionSeverity, string> = {
  critical: "bg-red-100 text-red-800",
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-100 text-blue-800",
};

export interface HuduVerificationResult {
  clientId: string;
  runAt: string;
  expectedConfigs: HuduExpectedConfig[];
  actualConfigs: HuduActualConfig[];
  exceptions: HuduException[];
  overallScore: number;
  totalExpected: number;
  totalFound: number;
  totalComplete: number;
}

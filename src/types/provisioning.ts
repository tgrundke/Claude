export type ProvisioningStatus =
  | "not_started"
  | "pending"
  | "provisioning"
  | "active"
  | "failed";

export interface ToolProvisioningState {
  status: ProvisioningStatus;
  tenantId: string;
  tenantName: string;
  adminEmail: string;
  provisionedAt: string | null;
  notes: string;
  errorMessage: string | null;
}

export interface ClientProvisioning {
  clientId: string;
  ninja: ToolProvisioningState;
  sophos: ToolProvisioningState;
  auvik: ToolProvisioningState;
  axcient: ToolProvisioningState;
}

export const PROVISIONING_STATUS_LABELS: Record<ProvisioningStatus, string> = {
  not_started: "Not Started",
  pending: "Pending",
  provisioning: "Provisioning...",
  active: "Active",
  failed: "Failed",
};

export const PROVISIONING_STATUS_COLORS: Record<ProvisioningStatus, string> = {
  not_started: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  provisioning: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export function createDefaultProvisioning(clientId: string): ClientProvisioning {
  const defaultState: ToolProvisioningState = {
    status: "not_started",
    tenantId: "",
    tenantName: "",
    adminEmail: "",
    provisionedAt: null,
    notes: "",
    errorMessage: null,
  };
  return {
    clientId,
    ninja: { ...defaultState },
    sophos: { ...defaultState },
    auvik: { ...defaultState },
    axcient: { ...defaultState },
  };
}

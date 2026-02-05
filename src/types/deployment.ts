export type DeploymentTool = "ninja" | "auvik" | "sophos_mdr" | "axcient";

export type DeploymentStatus =
  | "not_started"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "blocked"
  | "cancelled";

export interface DeploymentItem {
  id: string;
  clientId: string;
  tool: DeploymentTool;
  taskName: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDurationMinutes: number;
  status: DeploymentStatus;
  assignedTo: string;
  dependsOn: string[];
  linkedEmailId: string | null;
  notes: string;
  completedAt: string | null;
}

export const TOOL_DISPLAY_NAMES: Record<DeploymentTool, string> = {
  ninja: "NinjaOne RMM",
  auvik: "Auvik Network Mgmt",
  sophos_mdr: "Sophos MDR",
  axcient: "Axcient Backups",
};

export const TOOL_COLORS: Record<DeploymentTool, string> = {
  ninja: "bg-sky-100 text-sky-800",
  auvik: "bg-violet-100 text-violet-800",
  sophos_mdr: "bg-red-100 text-red-800",
  axcient: "bg-emerald-100 text-emerald-800",
};

export const DEPLOYMENT_STATUS_LABELS: Record<DeploymentStatus, string> = {
  not_started: "Not Started",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
  cancelled: "Cancelled",
};

export const DEPLOYMENT_STATUS_COLORS: Record<DeploymentStatus, string> = {
  not_started: "bg-gray-100 text-gray-800",
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  blocked: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-500",
};

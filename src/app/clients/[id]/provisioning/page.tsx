"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useClients } from "@/hooks/use-clients";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { createDefaultProvisioning, PROVISIONING_STATUS_LABELS, PROVISIONING_STATUS_COLORS } from "@/types/provisioning";
import type { ClientProvisioning, ToolProvisioningState, ProvisioningStatus } from "@/types/provisioning";
import { provisionNinjaTenant, provisionSophosTenant, provisionAuvikTenant, provisionAxcientTenant } from "@/lib/provisioning-stubs";
import { cn } from "@/lib/utils";

const TOOLS = [
  { key: "ninja" as const, name: "NinjaOne RMM", description: "Remote monitoring and management platform for endpoints and servers.", color: "border-l-sky-500", provision: provisionNinjaTenant },
  { key: "sophos" as const, name: "Sophos MDR", description: "Managed detection and response for advanced threat protection.", color: "border-l-red-500", provision: provisionSophosTenant },
  { key: "auvik" as const, name: "Auvik", description: "Cloud-based network monitoring and management.", color: "border-l-violet-500", provision: provisionAuvikTenant },
  { key: "axcient" as const, name: "Axcient", description: "Business continuity and disaster recovery solution.", color: "border-l-emerald-500", provision: provisionAxcientTenant },
];

export default function ProvisioningPage() {
  const params = useParams();
  const clientId = params.id as string;
  const { getClient } = useClients();
  const client = getClient(clientId);

  const key = `${STORAGE_KEYS.PROVISIONING_PREFIX}${clientId}`;
  const [provisioning, setProvisioning] = useLocalStorage<ClientProvisioning>(
    key,
    createDefaultProvisioning(clientId)
  );
  const [provisioningTool, setProvisioningTool] = useState<string | null>(null);

  if (!client) return null;

  const handleProvision = async (toolKey: "ninja" | "sophos" | "auvik" | "axcient") => {
    const tool = TOOLS.find((t) => t.key === toolKey);
    if (!tool) return;

    setProvisioningTool(toolKey);
    setProvisioning((prev) => ({
      ...prev,
      [toolKey]: { ...prev[toolKey], status: "provisioning" as ProvisioningStatus },
    }));

    try {
      const result = await tool.provision(client);
      setProvisioning((prev) => ({
        ...prev,
        [toolKey]: {
          ...prev[toolKey],
          status: result.success ? "active" as ProvisioningStatus : "failed" as ProvisioningStatus,
          tenantId: result.tenantId,
          tenantName: `${client.companyName} - ${tool.name}`,
          provisionedAt: result.success ? new Date().toISOString() : null,
          errorMessage: result.success ? null : (result.errorMessage || "Provisioning failed"),
        },
      }));
    } catch {
      setProvisioning((prev) => ({
        ...prev,
        [toolKey]: {
          ...prev[toolKey],
          status: "failed" as ProvisioningStatus,
          errorMessage: "An unexpected error occurred",
        },
      }));
    }
    setProvisioningTool(null);
  };

  const getToolState = (toolKey: "ninja" | "sophos" | "auvik" | "axcient"): ToolProvisioningState => {
    return provisioning[toolKey];
  };

  const allProvisioned = TOOLS.every((t) => getToolState(t.key).status === "active");
  const provisionedCount = TOOLS.filter((t) => getToolState(t.key).status === "active").length;

  return (
    <div>
      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Tool provisioning is simulated in this version. In production, these buttons will make API calls to provision real tenants.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Provisioning Progress</h2>
          <span className="text-sm text-gray-500">{provisionedCount} / {TOOLS.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(provisionedCount / TOOLS.length) * 100}%` }}
          />
        </div>
        {allProvisioned && (
          <p className="text-sm text-green-600 mt-2 font-medium">All tools provisioned successfully!</p>
        )}
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOOLS.map((tool) => {
          const state = getToolState(tool.key);
          const isProvisioning = provisioningTool === tool.key;
          return (
            <div key={tool.key} className={cn("bg-white rounded-xl border border-gray-200 border-l-4 p-5", tool.color)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{tool.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{tool.description}</p>
                </div>
                <span className={cn("text-xs font-medium px-2 py-1 rounded-full shrink-0", PROVISIONING_STATUS_COLORS[state.status])}>
                  {PROVISIONING_STATUS_LABELS[state.status]}
                </span>
              </div>

              {state.status === "active" && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
                  <p className="text-xs text-gray-600"><strong>Tenant ID:</strong> {state.tenantId}</p>
                  <p className="text-xs text-gray-600"><strong>Tenant Name:</strong> {state.tenantName}</p>
                  {state.provisionedAt && (
                    <p className="text-xs text-gray-400">Provisioned: {new Date(state.provisionedAt).toLocaleString()}</p>
                  )}
                </div>
              )}

              {state.status === "failed" && state.errorMessage && (
                <div className="bg-red-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-red-600">{state.errorMessage}</p>
                </div>
              )}

              <button
                onClick={() => handleProvision(tool.key)}
                disabled={state.status === "active" || isProvisioning}
                className={cn(
                  "w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  state.status === "active"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : isProvisioning
                    ? "bg-blue-100 text-blue-600 cursor-wait"
                    : state.status === "failed"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {isProvisioning
                  ? "Provisioning..."
                  : state.status === "active"
                  ? "Provisioned"
                  : state.status === "failed"
                  ? "Retry Provisioning"
                  : "Provision Tenant"
                }
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

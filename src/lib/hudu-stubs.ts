/**
 * Hudu API Simulation Stubs
 * In production, these would call the Hudu REST API to push documentation.
 * For demo purposes, simulates the push with a delay and returns success.
 */

import type { Firewall, Server, Workstation, NetworkSwitch, GenericAsset } from "@/types/environment";

export interface HuduPushResult {
  success: boolean;
  totalPushed: number;
  details: HuduPushDetail[];
  pushedAt: string;
  errors: string[];
}

export interface HuduPushDetail {
  type: "firewall" | "server" | "workstation" | "switch" | "asset";
  name: string;
  huduAssetId: string;
  status: "created" | "updated" | "failed";
  message: string;
}

interface EnvironmentData {
  firewalls: Firewall[];
  servers: Server[];
  workstations: Workstation[];
  switches: NetworkSwitch[];
  assets: GenericAsset[];
}

/**
 * Simulates pushing all environment data to Hudu as asset documentation.
 * In production:
 *   - POST /api/v1/companies/{id}/assets for new assets
 *   - PUT /api/v1/assets/{id} for existing assets
 *   - Uses Hudu Asset Layouts to match the correct template for each device type
 */
export async function pushToHudu(data: EnvironmentData): Promise<HuduPushResult> {
  const details: HuduPushDetail[] = [];
  const errors: string[] = [];
  let totalPushed = 0;

  // Simulate processing each device type with progressive delays
  // Firewalls
  for (const fw of data.firewalls) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    totalPushed++;
    details.push({
      type: "firewall",
      name: `${fw.make} ${fw.model}`,
      huduAssetId: `hudu-fw-${fw.id.slice(0, 8)}`,
      status: "created",
      message: `Firewall asset created in Hudu with layout "Firewall Configuration"`,
    });
  }

  // Servers
  for (const srv of data.servers) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    totalPushed++;
    details.push({
      type: "server",
      name: srv.hostname,
      huduAssetId: `hudu-srv-${srv.id.slice(0, 8)}`,
      status: "created",
      message: `Server asset created in Hudu with layout "Server Configuration"`,
    });
  }

  // Workstations
  for (const ws of data.workstations) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    totalPushed++;
    details.push({
      type: "workstation",
      name: ws.hostname,
      huduAssetId: `hudu-ws-${ws.id.slice(0, 8)}`,
      status: "created",
      message: `Workstation asset created in Hudu with layout "Workstation Configuration"`,
    });
  }

  // Switches
  for (const sw of data.switches) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    totalPushed++;
    details.push({
      type: "switch",
      name: `${sw.make} ${sw.model}`,
      huduAssetId: `hudu-sw-${sw.id.slice(0, 8)}`,
      status: "created",
      message: `Switch asset created in Hudu with layout "Network Switch Configuration"`,
    });
  }

  // Generic Assets
  for (const asset of data.assets) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    totalPushed++;
    details.push({
      type: "asset",
      name: asset.name,
      huduAssetId: `hudu-asset-${asset.id.slice(0, 8)}`,
      status: "created",
      message: `Asset created in Hudu with layout "${asset.assetType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}"`,
    });
  }

  return {
    success: errors.length === 0,
    totalPushed,
    details,
    pushedAt: new Date().toISOString(),
    errors,
  };
}

/**
 * Validates that environment data has minimum required fields before pushing.
 * Returns a list of warnings for items with missing critical fields.
 */
export function validateForHudu(data: EnvironmentData): string[] {
  const warnings: string[] = [];

  data.firewalls.forEach((fw, i) => {
    if (!fw.make) warnings.push(`Firewall #${i + 1}: Missing make/manufacturer`);
    if (!fw.managementIp) warnings.push(`Firewall #${i + 1}: Missing management IP`);
  });

  data.servers.forEach((srv, i) => {
    if (!srv.hostname) warnings.push(`Server #${i + 1}: Missing hostname`);
    if (!srv.os) warnings.push(`Server #${i + 1}: Missing operating system`);
  });

  data.workstations.forEach((ws, i) => {
    if (!ws.hostname) warnings.push(`Workstation #${i + 1}: Missing hostname`);
    if (!ws.os) warnings.push(`Workstation #${i + 1}: Missing operating system`);
  });

  data.switches.forEach((sw, i) => {
    if (!sw.make) warnings.push(`Switch #${i + 1}: Missing make/manufacturer`);
  });

  data.assets.forEach((asset, i) => {
    if (!asset.name) warnings.push(`Asset #${i + 1}: Missing name`);
  });

  return warnings;
}

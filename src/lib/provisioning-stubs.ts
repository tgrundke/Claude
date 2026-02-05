import type { Client } from "@/types/client";

export interface ProvisionResult {
  tenantId: string;
  success: boolean;
  errorMessage?: string;
}

async function simulateApiCall(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function provisionNinjaTenant(client: Client): Promise<ProvisionResult> {
  await simulateApiCall(2000);
  return {
    tenantId: `ninja-${client.id.slice(0, 8)}`,
    success: true,
  };
}

export async function provisionSophosTenant(client: Client): Promise<ProvisionResult> {
  await simulateApiCall(2500);
  return {
    tenantId: `sophos-${client.id.slice(0, 8)}`,
    success: true,
  };
}

export async function provisionAuvikTenant(client: Client): Promise<ProvisionResult> {
  await simulateApiCall(1800);
  return {
    tenantId: `auvik-${client.id.slice(0, 8)}`,
    success: true,
  };
}

export async function provisionAxcientTenant(client: Client): Promise<ProvisionResult> {
  await simulateApiCall(2200);
  return {
    tenantId: `axcient-${client.id.slice(0, 8)}`,
    success: true,
  };
}

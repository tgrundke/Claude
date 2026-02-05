"use client";

import { useLocalStorage } from "./use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { generateId } from "@/lib/id";
import type { Firewall, Server, Workstation, NetworkSwitch, GenericAsset } from "@/types/environment";

interface EnvironmentData {
  firewalls: Firewall[];
  servers: Server[];
  workstations: Workstation[];
  switches: NetworkSwitch[];
  assets: GenericAsset[];
}

const emptyEnv: EnvironmentData = {
  firewalls: [],
  servers: [],
  workstations: [],
  switches: [],
  assets: [],
};

export function useEnvironment(clientId: string) {
  const key = `${STORAGE_KEYS.ENVIRONMENT_PREFIX}${clientId}`;
  const [data, setData] = useLocalStorage<EnvironmentData>(key, emptyEnv);

  const addFirewall = (fw: Omit<Firewall, "id" | "clientId">) => {
    setData((prev) => ({
      ...prev,
      firewalls: [...prev.firewalls, { ...fw, id: generateId(), clientId }],
    }));
  };
  const updateFirewall = (id: string, updates: Partial<Firewall>) => {
    setData((prev) => ({
      ...prev,
      firewalls: prev.firewalls.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };
  const deleteFirewall = (id: string) => {
    setData((prev) => ({ ...prev, firewalls: prev.firewalls.filter((f) => f.id !== id) }));
  };

  const addServer = (s: Omit<Server, "id" | "clientId">) => {
    setData((prev) => ({
      ...prev,
      servers: [...prev.servers, { ...s, id: generateId(), clientId }],
    }));
  };
  const updateServer = (id: string, updates: Partial<Server>) => {
    setData((prev) => ({
      ...prev,
      servers: prev.servers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };
  const deleteServer = (id: string) => {
    setData((prev) => ({ ...prev, servers: prev.servers.filter((s) => s.id !== id) }));
  };

  const addWorkstation = (w: Omit<Workstation, "id" | "clientId">) => {
    setData((prev) => ({
      ...prev,
      workstations: [...prev.workstations, { ...w, id: generateId(), clientId }],
    }));
  };
  const updateWorkstation = (id: string, updates: Partial<Workstation>) => {
    setData((prev) => ({
      ...prev,
      workstations: prev.workstations.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));
  };
  const deleteWorkstation = (id: string) => {
    setData((prev) => ({ ...prev, workstations: prev.workstations.filter((w) => w.id !== id) }));
  };

  const addSwitch = (sw: Omit<NetworkSwitch, "id" | "clientId">) => {
    setData((prev) => ({
      ...prev,
      switches: [...prev.switches, { ...sw, id: generateId(), clientId }],
    }));
  };
  const updateSwitch = (id: string, updates: Partial<NetworkSwitch>) => {
    setData((prev) => ({
      ...prev,
      switches: prev.switches.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };
  const deleteSwitch = (id: string) => {
    setData((prev) => ({ ...prev, switches: prev.switches.filter((s) => s.id !== id) }));
  };

  const addAsset = (a: Omit<GenericAsset, "id" | "clientId">) => {
    setData((prev) => ({
      ...prev,
      assets: [...prev.assets, { ...a, id: generateId(), clientId }],
    }));
  };
  const updateAsset = (id: string, updates: Partial<GenericAsset>) => {
    setData((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  };
  const deleteAsset = (id: string) => {
    setData((prev) => ({ ...prev, assets: prev.assets.filter((a) => a.id !== id) }));
  };

  // Bulk import methods for Auvik/Ninja integrations
  const bulkAddFirewalls = (items: Omit<Firewall, "id" | "clientId">[]) => {
    setData((prev) => ({
      ...prev,
      firewalls: [...prev.firewalls, ...items.map((fw) => ({ ...fw, id: generateId(), clientId }))],
    }));
  };

  const bulkAddServers = (items: Omit<Server, "id" | "clientId">[]) => {
    setData((prev) => ({
      ...prev,
      servers: [...prev.servers, ...items.map((s) => ({ ...s, id: generateId(), clientId }))],
    }));
  };

  const bulkAddWorkstations = (items: Omit<Workstation, "id" | "clientId">[]) => {
    setData((prev) => ({
      ...prev,
      workstations: [...prev.workstations, ...items.map((w) => ({ ...w, id: generateId(), clientId }))],
    }));
  };

  const bulkAddSwitches = (items: Omit<NetworkSwitch, "id" | "clientId">[]) => {
    setData((prev) => ({
      ...prev,
      switches: [...prev.switches, ...items.map((sw) => ({ ...sw, id: generateId(), clientId }))],
    }));
  };

  const bulkAddAssets = (items: Omit<GenericAsset, "id" | "clientId">[]) => {
    setData((prev) => ({
      ...prev,
      assets: [...prev.assets, ...items.map((a) => ({ ...a, id: generateId(), clientId }))],
    }));
  };

  const clearAll = () => {
    setData(emptyEnv);
  };

  return {
    ...data,
    addFirewall, updateFirewall, deleteFirewall,
    addServer, updateServer, deleteServer,
    addWorkstation, updateWorkstation, deleteWorkstation,
    addSwitch, updateSwitch, deleteSwitch,
    addAsset, updateAsset, deleteAsset,
    bulkAddFirewalls, bulkAddServers, bulkAddWorkstations, bulkAddSwitches, bulkAddAssets,
    clearAll,
  };
}

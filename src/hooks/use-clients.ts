"use client";

import { useLocalStorage } from "./use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Client, OnboardingStage, ChecklistItem } from "@/types/client";
import { generateId } from "@/lib/id";
import { getDefaultChecklist } from "@/data/onboarding-checklist";

export function useClients() {
  const [clients, setClients] = useLocalStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);

  const addClient = (data: Omit<Client, "id" | "createdAt" | "updatedAt" | "checklist" | "stage">) => {
    const now = new Date().toISOString();
    const newClient: Client = {
      ...data,
      id: generateId(),
      stage: "new_lead",
      checklist: getDefaultChecklist(),
      createdAt: now,
      updatedAt: now,
    };
    setClients((prev) => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const getClient = (id: string) => clients.find((c) => c.id === id);

  const getClientsByStage = (stage: OnboardingStage) =>
    clients.filter((c) => c.stage === stage);

  const moveClientToStage = (id: string, stage: OnboardingStage) => {
    updateClient(id, { stage });
  };

  const updateChecklist = (clientId: string, checklistItemId: string, updates: Partial<ChecklistItem>) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          checklist: c.checklist.map((item) =>
            item.id === checklistItemId ? { ...item, ...updates } : item
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  return {
    clients,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    getClientsByStage,
    moveClientToStage,
    updateChecklist,
  };
}

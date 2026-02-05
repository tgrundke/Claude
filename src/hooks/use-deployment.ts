"use client";

import { useLocalStorage } from "./use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { generateId } from "@/lib/id";
import type { DeploymentItem, DeploymentStatus } from "@/types/deployment";

export function useDeployment(clientId: string) {
  const key = `${STORAGE_KEYS.DEPLOYMENT_PREFIX}${clientId}`;
  const [items, setItems] = useLocalStorage<DeploymentItem[]>(key, []);

  const addItem = (item: Omit<DeploymentItem, "id" | "clientId">) => {
    setItems((prev) => [...prev, { ...item, id: generateId(), clientId }]);
  };

  const updateItem = (id: string, updates: Partial<DeploymentItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateStatus = (id: string, status: DeploymentStatus) => {
    updateItem(id, {
      status,
      completedAt: status === "completed" ? new Date().toISOString() : null,
    });
  };

  const loadDefaults = (defaultItems: DeploymentItem[]) => {
    setItems(defaultItems);
  };

  const sortedItems = [...items].sort((a, b) =>
    a.scheduledDate.localeCompare(b.scheduledDate) || a.scheduledTime.localeCompare(b.scheduledTime)
  );

  return {
    items: sortedItems,
    addItem,
    updateItem,
    deleteItem,
    updateStatus,
    loadDefaults,
  };
}

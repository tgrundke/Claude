"use client";

import { useLocalStorage } from "./use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { generateId } from "@/lib/id";
import type { GeneratedEmail, EmailStatus } from "@/types/email";

export function useEmails(clientId: string) {
  const key = `${STORAGE_KEYS.EMAILS_PREFIX}${clientId}`;
  const [emails, setEmails] = useLocalStorage<GeneratedEmail[]>(key, []);

  const addEmail = (email: Omit<GeneratedEmail, "id" | "clientId" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    setEmails((prev) => [
      ...prev,
      { ...email, id: generateId(), clientId, createdAt: now, updatedAt: now },
    ]);
  };

  const updateEmail = (id: string, updates: Partial<GeneratedEmail>) => {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      )
    );
  };

  const deleteEmail = (id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id));
  };

  const updateStatus = (id: string, status: EmailStatus) => {
    updateEmail(id, {
      status,
      sentAt: status === "sent" ? new Date().toISOString() : null,
    });
  };

  const markAllReady = () => {
    setEmails((prev) =>
      prev.map((e) =>
        e.status === "draft"
          ? { ...e, status: "ready" as const, updatedAt: new Date().toISOString() }
          : e
      )
    );
  };

  const sendAllReady = async () => {
    const readyEmails = emails.filter((e) => e.status === "ready");
    for (const email of readyEmails) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateStatus(email.id, "sent");
    }
    return readyEmails.length;
  };

  return {
    emails,
    addEmail,
    updateEmail,
    deleteEmail,
    updateStatus,
    markAllReady,
    sendAllReady,
  };
}

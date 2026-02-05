"use client";

import { useLocalStorage } from "./use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { generateSimulatedTenant, generateM365Checks } from "@/data/m365-best-practices";
import type { M365Assessment } from "@/types/m365";

const M365_KEY_PREFIX = "msp_onboarding_m365_";

function createEmptyAssessment(clientId: string): M365Assessment {
  return {
    clientId,
    tenantInfo: null,
    checks: [],
    runAt: null,
    status: "not_started",
    errorMessage: null,
    overallScore: 0,
  };
}

export function useM365Assessment(clientId: string) {
  const key = `${M365_KEY_PREFIX}${clientId}`;
  const [assessment, setAssessment] = useLocalStorage<M365Assessment>(key, createEmptyAssessment(clientId));

  const connectTenant = async (companyName: string) => {
    setAssessment((prev) => ({ ...prev, status: "connecting", errorMessage: null }));
    // Simulate OAuth / API connection delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const tenantInfo = generateSimulatedTenant(companyName);
    setAssessment((prev) => ({ ...prev, tenantInfo, status: "not_started" }));
  };

  const runAssessment = async () => {
    setAssessment((prev) => ({ ...prev, status: "running", errorMessage: null }));

    // Simulate progressive check execution
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const checks = generateM365Checks();

    // Calculate score
    const scorableChecks = checks.filter((c) => c.status !== "not_applicable" && c.status !== "not_checked");
    const passCount = scorableChecks.filter((c) => c.status === "pass").length;
    const warningCount = scorableChecks.filter((c) => c.status === "warning").length;
    const overallScore = scorableChecks.length > 0
      ? Math.round(((passCount + warningCount * 0.5) / scorableChecks.length) * 100)
      : 0;

    // Simulate completing over a few seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setAssessment((prev) => ({
      ...prev,
      checks,
      runAt: new Date().toISOString(),
      status: "completed",
      overallScore,
    }));
  };

  const resetAssessment = () => {
    setAssessment(createEmptyAssessment(clientId));
  };

  const stats = {
    total: assessment.checks.length,
    pass: assessment.checks.filter((c) => c.status === "pass").length,
    fail: assessment.checks.filter((c) => c.status === "fail").length,
    warning: assessment.checks.filter((c) => c.status === "warning").length,
    critical: assessment.checks.filter((c) => c.severity === "critical" && c.status === "fail").length,
    high: assessment.checks.filter((c) => c.severity === "high" && c.status === "fail").length,
  };

  return {
    assessment,
    connectTenant,
    runAssessment,
    resetAssessment,
    stats,
  };
}

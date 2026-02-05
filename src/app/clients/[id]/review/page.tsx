"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useClients } from "@/hooks/use-clients";
import { useEnvironment } from "@/hooks/use-environment";
import {
  HUDU_CONFIG_LABELS,
  EXCEPTION_SEVERITY_COLORS,
} from "@/types/hudu";
import type {
  HuduConfigType,
  HuduExpectedConfig,
  HuduActualConfig,
  HuduException,
  HuduVerificationResult,
  ExceptionSeverity,
} from "@/types/hudu";
import {
  HUDU_REQUIRED_FIELDS,
  ALWAYS_REQUIRED_CONFIGS,
  ENVIRONMENT_DERIVED_CONFIGS,
} from "@/data/hudu-standards";
import { generateId } from "@/lib/id";
import { cn } from "@/lib/utils";

function simulateHuduCheck(
  type: HuduConfigType,
  expectedCount: number,
  seed: number
): { actuals: HuduActualConfig[]; exceptions: HuduException[] } {
  const requiredFields = HUDU_REQUIRED_FIELDS[type] || [];
  const actuals: HuduActualConfig[] = [];
  const exceptions: HuduException[] = [];

  // Simulate: some configs exist, some don't, some are incomplete
  const hash = (seed * 31 + type.length * 17) % 100;
  const existCount = Math.max(0, Math.min(expectedCount, expectedCount - (hash % 3 === 0 ? 1 : 0)));

  for (let i = 0; i < expectedCount; i++) {
    const exists = i < existCount;
    const configName = `${HUDU_CONFIG_LABELS[type]} ${expectedCount > 1 ? `#${i + 1}` : ""}`.trim();

    if (!exists) {
      // Missing entirely
      actuals.push({
        type,
        name: configName,
        exists: false,
        populatedFields: [],
        missingFields: requiredFields.map((f) => f.fieldName),
        completionPct: 0,
      });
      exceptions.push({
        id: generateId(),
        severity: "critical",
        configType: type,
        title: `Missing: ${configName}`,
        description: `Expected ${HUDU_CONFIG_LABELS[type]} configuration not found in Hudu.`,
        expectedValue: "Configuration should exist in Hudu",
        actualValue: "Not found",
        resolved: false,
        resolvedAt: null,
        resolvedBy: null,
      });
    } else {
      // Exists but may be incomplete
      const itemHash = (hash + i * 13) % 100;
      const populatedPct = 50 + (itemHash % 50); // 50-99% fields populated
      const totalReqFields = requiredFields.filter((f) => f.required).length;
      const populatedReqCount = Math.floor((populatedPct / 100) * totalReqFields);

      const populated = requiredFields.filter((f) => f.required).slice(0, populatedReqCount).map((f) => f.fieldName);
      const missing = requiredFields.filter((f) => f.required && !populated.includes(f.fieldName)).map((f) => f.fieldName);

      const completion = totalReqFields > 0 ? Math.round((populatedReqCount / totalReqFields) * 100) : 100;

      actuals.push({
        type,
        name: configName,
        exists: true,
        populatedFields: populated,
        missingFields: missing,
        completionPct: completion,
      });

      if (missing.length > 0) {
        const missingLabels = requiredFields
          .filter((f) => missing.includes(f.fieldName))
          .map((f) => f.label);
        exceptions.push({
          id: generateId(),
          severity: "warning",
          configType: type,
          title: `Incomplete: ${configName}`,
          description: `Configuration exists but has ${missing.length} required field(s) not populated.`,
          expectedValue: `All ${totalReqFields} required fields populated`,
          actualValue: `${populatedReqCount} of ${totalReqFields} required fields populated. Missing: ${missingLabels.join(", ")}`,
          resolved: false,
          resolvedAt: null,
          resolvedBy: null,
        });
      }
    }
  }

  // If expected 0 but always required
  if (expectedCount === 0 && ALWAYS_REQUIRED_CONFIGS.includes(type)) {
    exceptions.push({
      id: generateId(),
      severity: "critical",
      configType: type,
      title: `Missing: ${HUDU_CONFIG_LABELS[type]}`,
      description: `This is a standard required configuration that should always exist.`,
      expectedValue: "At least 1 configuration",
      actualValue: "0 found",
      resolved: false,
      resolvedAt: null,
      resolvedBy: null,
    });
  }

  return { actuals, exceptions };
}

export default function ReviewPage() {
  const params = useParams();
  const clientId = params.id as string;
  const { getClient } = useClients();
  const envData = useEnvironment(clientId);
  const client = getClient(clientId);
  const [result, setResult] = useState<HuduVerificationResult | null>(null);
  const [showSection, setShowSection] = useState<"checklist" | "hudu" | "exceptions">("checklist");

  if (!client) return null;

  // Checklist verification
  const incompleteItems = client.checklist.filter((i) => !i.completed);
  const checklistComplete = incompleteItems.length === 0;
  const categories = [...new Set(client.checklist.map((i) => i.category))];

  // Gather unique locations from environment data
  const allLocations = new Set<string>();
  envData.firewalls.forEach((f) => { if (f.location) allLocations.add(f.location); });
  envData.servers.forEach((s) => { if (s.location) allLocations.add(s.location); });
  envData.switches.forEach((s) => { if (s.location) allLocations.add(s.location); });
  const locationCount = Math.max(1, allLocations.size);

  // Expected config counts based on environment data
  const expectedCounts: Record<HuduConfigType, number> = {
    client_profile: 1,
    microsoft_365: 1,
    vpn_configuration: envData.firewalls.filter((f) => f.hasVpn).length > 0 ? 1 : 0,
    firewall_configuration: envData.firewalls.length,
    server_configuration: envData.servers.length,
    network_switch_configuration: envData.switches.length,
    backup_configuration: 1,
    wireless_configuration: envData.assets.filter((a) => a.assetType === "access_point").length > 0 ? 1 : 0,
    domain_dns: 1,
    isp_circuit: 1,
    printer_scanner: envData.assets.filter((a) => a.assetType === "printer").length,
    voip_configuration: envData.assets.filter((a) => a.assetType === "voip_phone").length > 0 ? 1 : 0,
    security_solution: 1,
    physical_location: locationCount,
  };

  const runVerification = () => {
    const allActuals: HuduActualConfig[] = [];
    const allExceptions: HuduException[] = [];
    const expectedConfigs: HuduExpectedConfig[] = [];

    let seed = 42;
    (Object.entries(expectedCounts) as [HuduConfigType, number][]).forEach(([type, count]) => {
      if (count === 0 && !ALWAYS_REQUIRED_CONFIGS.includes(type)) return;
      const effectiveCount = Math.max(count, ALWAYS_REQUIRED_CONFIGS.includes(type) ? 1 : 0);

      expectedConfigs.push({
        type,
        label: HUDU_CONFIG_LABELS[type],
        expectedCount: effectiveCount,
        source: ALWAYS_REQUIRED_CONFIGS.includes(type) ? "standard" : "environment_data",
        requiredFields: HUDU_REQUIRED_FIELDS[type] || [],
      });

      const { actuals, exceptions } = simulateHuduCheck(type, effectiveCount, seed);
      allActuals.push(...actuals);
      allExceptions.push(...exceptions);
      seed += 7;
    });

    const totalExpected = expectedConfigs.reduce((sum, c) => sum + c.expectedCount, 0);
    const totalFound = allActuals.filter((a) => a.exists).length;
    const totalComplete = allActuals.filter((a) => a.exists && a.completionPct === 100).length;
    const score = totalExpected > 0 ? Math.round((totalComplete / totalExpected) * 100) : 0;

    setResult({
      clientId,
      runAt: new Date().toISOString(),
      expectedConfigs,
      actualConfigs: allActuals,
      exceptions: allExceptions,
      overallScore: score,
      totalExpected,
      totalFound,
      totalComplete,
    });
    setShowSection("hudu");
  };

  const resolveException = (exceptionId: string) => {
    if (!result) return;
    setResult({
      ...result,
      exceptions: result.exceptions.map((e) =>
        e.id === exceptionId ? { ...e, resolved: true, resolvedAt: new Date().toISOString(), resolvedBy: "Manual Review" } : e
      ),
    });
  };

  const unresolvedExceptions = result?.exceptions.filter((e) => !e.resolved) || [];
  const criticalCount = unresolvedExceptions.filter((e) => e.severity === "critical").length;
  const warningCount = unresolvedExceptions.filter((e) => e.severity === "warning").length;

  return (
    <div>
      {/* Section Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { key: "checklist" as const, label: "Checklist Verification" },
          { key: "hudu" as const, label: "Hudu Documentation Audit" },
          { key: "exceptions" as const, label: `Exception Report${unresolvedExceptions.length > 0 ? ` (${unresolvedExceptions.length})` : ""}` },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setShowSection(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              showSection === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CHECKLIST VERIFICATION */}
      {showSection === "checklist" && (
        <div className="space-y-6">
          <div className={cn("rounded-xl border p-6", checklistComplete ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200")}>
            <div className="flex items-center gap-3 mb-4">
              {checklistComplete ? (
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              ) : (
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
              )}
              <div>
                <h2 className={cn("text-lg font-bold", checklistComplete ? "text-green-800" : "text-yellow-800")}>
                  {checklistComplete ? "All Checklist Items Complete" : `${incompleteItems.length} Incomplete Item(s)`}
                </h2>
                <p className={cn("text-sm", checklistComplete ? "text-green-600" : "text-yellow-600")}>
                  {client.checklist.filter((i) => i.completed).length} of {client.checklist.length} items completed
                </p>
              </div>
            </div>

            {!checklistComplete && (
              <div className="space-y-4 mt-4">
                {categories.map((cat) => {
                  const incomplete = incompleteItems.filter((i) => i.category === cat);
                  if (incomplete.length === 0) return null;
                  return (
                    <div key={cat}>
                      <h4 className="text-xs font-semibold text-yellow-800 uppercase mb-1">{cat}</h4>
                      {incomplete.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 py-1 pl-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          <span className="text-sm text-yellow-800">{item.label}</span>
                          {item.assignedTo && <span className="text-xs text-yellow-600">({item.assignedTo})</span>}
                          {item.dueDate && new Date(item.dueDate) < new Date() && (
                            <span className="text-xs bg-red-200 text-red-800 px-1.5 py-0.5 rounded">OVERDUE</span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Environment Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Environment Summary (Expected Hudu Documentation)</h3>
            <p className="text-xs text-gray-500 mb-4">
              Based on your environment data, the following configurations should exist in Hudu with all required fields populated.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.entries(expectedCounts) as [HuduConfigType, number][])
                .filter(([type, count]) => count > 0 || ALWAYS_REQUIRED_CONFIGS.includes(type))
                .map(([type, count]) => (
                  <div key={type} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700">{HUDU_CONFIG_LABELS[type as HuduConfigType]}</p>
                    <p className="text-lg font-bold text-gray-900">{Math.max(count, ALWAYS_REQUIRED_CONFIGS.includes(type as HuduConfigType) ? 1 : 0)}</p>
                    <p className="text-xs text-gray-400">
                      {ALWAYS_REQUIRED_CONFIGS.includes(type as HuduConfigType) ? "Required standard" : "From environment data"}
                    </p>
                  </div>
                ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={runVerification}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg transition-all hover:shadow-xl"
              >
                Run Hudu Documentation Audit
              </button>
              <p className="text-xs text-gray-400 mt-2">Simulates verification against Hudu API. In production, connects to your Hudu instance.</p>
            </div>
          </div>
        </div>
      )}

      {/* HUDU AUDIT RESULTS */}
      {showSection === "hudu" && result && (
        <div className="space-y-6">
          {/* Score Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className={cn("text-3xl font-bold", result.overallScore >= 80 ? "text-green-600" : result.overallScore >= 60 ? "text-yellow-600" : "text-red-600")}>
                {result.overallScore}%
              </p>
              <p className="text-xs text-gray-500">Documentation Score</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-gray-900">{result.totalExpected}</p>
              <p className="text-xs text-gray-500">Expected Configs</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-blue-600">{result.totalFound}</p>
              <p className="text-xs text-gray-500">Found in Hudu</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-green-600">{result.totalComplete}</p>
              <p className="text-xs text-gray-500">Fully Complete</p>
            </div>
          </div>

          {/* Config-by-config breakdown */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">Configuration Breakdown</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {result.expectedConfigs.map((config) => {
                const actuals = result.actualConfigs.filter((a) => a.type === config.type);
                const found = actuals.filter((a) => a.exists).length;
                const complete = actuals.filter((a) => a.exists && a.completionPct === 100).length;
                const exceptions = result.exceptions.filter((e) => e.configType === config.type && !e.resolved);

                return (
                  <div key={config.type} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900">{config.label}</h4>
                        <span className="text-xs text-gray-400">({config.source === "standard" ? "Required Standard" : "Environment Data"})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">Expected: {config.expectedCount}</span>
                        <span className={cn("text-xs font-medium", found === config.expectedCount ? "text-green-600" : "text-red-600")}>
                          Found: {found}
                        </span>
                        <span className={cn("text-xs font-medium", complete === config.expectedCount ? "text-green-600" : "text-yellow-600")}>
                          Complete: {complete}
                        </span>
                      </div>
                    </div>

                    {/* Individual configs */}
                    <div className="space-y-1 ml-4">
                      {actuals.map((actual, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {actual.exists ? (
                            <svg className={cn("w-4 h-4", actual.completionPct === 100 ? "text-green-500" : "text-yellow-500")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              {actual.completionPct === 100 ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                              )}
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span className={cn("text-xs", actual.exists ? "text-gray-700" : "text-red-600")}>{actual.name}</span>
                          {actual.exists && (
                            <span className={cn("text-xs", actual.completionPct === 100 ? "text-green-500" : "text-yellow-500")}>
                              ({actual.completionPct}% complete)
                            </span>
                          )}
                          {actual.missingFields.length > 0 && actual.exists && (
                            <span className="text-xs text-gray-400">
                              Missing: {actual.missingFields.slice(0, 3).join(", ")}{actual.missingFields.length > 3 ? ` +${actual.missingFields.length - 3}` : ""}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {exceptions.length > 0 && (
                      <p className="text-xs text-red-500 mt-1 ml-4">{exceptions.length} exception(s)</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* EXCEPTION REPORT */}
      {showSection === "exceptions" && (
        <div className="space-y-6">
          {!result ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-500">Run the Hudu Documentation Audit first to generate the exception report.</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className={cn("rounded-xl border p-5 text-center", criticalCount > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200")}>
                  <p className={cn("text-3xl font-bold", criticalCount > 0 ? "text-red-600" : "text-green-600")}>{criticalCount}</p>
                  <p className="text-xs text-gray-500">Critical (Missing)</p>
                </div>
                <div className={cn("rounded-xl border p-5 text-center", warningCount > 0 ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200")}>
                  <p className={cn("text-3xl font-bold", warningCount > 0 ? "text-yellow-600" : "text-green-600")}>{warningCount}</p>
                  <p className="text-xs text-gray-500">Warnings (Incomplete)</p>
                </div>
                <div className="rounded-xl border bg-gray-50 border-gray-200 p-5 text-center">
                  <p className="text-3xl font-bold text-green-600">{result.exceptions.filter((e) => e.resolved).length}</p>
                  <p className="text-xs text-gray-500">Resolved</p>
                </div>
              </div>

              {/* Exception List */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900">All Exceptions</h3>
                </div>
                {result.exceptions.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-green-600 font-medium">No exceptions found. All documentation is complete!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {result.exceptions
                      .sort((a, b) => {
                        if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
                        const sev = { critical: 0, warning: 1, info: 2 };
                        return sev[a.severity] - sev[b.severity];
                      })
                      .map((exception) => (
                        <div key={exception.id} className={cn("p-4", exception.resolved && "opacity-50")}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", EXCEPTION_SEVERITY_COLORS[exception.severity])}>
                                  {exception.severity.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-400">{HUDU_CONFIG_LABELS[exception.configType]}</span>
                                {exception.resolved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Resolved</span>}
                              </div>
                              <p className="text-sm font-medium text-gray-900">{exception.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{exception.description}</p>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                  <p className="text-xs font-medium text-green-700">Expected</p>
                                  <p className="text-xs text-gray-600">{exception.expectedValue}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-red-700">Actual</p>
                                  <p className="text-xs text-gray-600">{exception.actualValue}</p>
                                </div>
                              </div>
                            </div>
                            {!exception.resolved && (
                              <button
                                onClick={() => resolveException(exception.id)}
                                className="shrink-0 ml-4 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Print Report */}
              <div className="text-center">
                <button onClick={() => window.print()} className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
                  Print Exception Report
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Run Button if not yet run */}
      {showSection !== "checklist" && !result && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <button onClick={runVerification} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
            Run Hudu Documentation Audit
          </button>
        </div>
      )}
    </div>
  );
}

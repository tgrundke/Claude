"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useClients } from "@/hooks/use-clients";
import { useM365Assessment } from "@/hooks/use-m365-assessment";
import {
  M365_CATEGORY_LABELS,
  M365_SEVERITY_COLORS,
  M365_STATUS_COLORS,
  M365_STATUS_LABELS,
} from "@/types/m365";
import type { M365CheckCategory, M365CheckSeverity, M365CheckStatus } from "@/types/m365";
import { cn } from "@/lib/utils";

export default function M365Page() {
  const params = useParams();
  const clientId = params.id as string;
  const { getClient } = useClients();
  const client = getClient(clientId);
  const { assessment, connectTenant, runAssessment, resetAssessment, stats } = useM365Assessment(clientId);

  const [activeView, setActiveView] = useState<"overview" | "details" | "report">("overview");
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<M365CheckCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<M365CheckStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<M365CheckSeverity | "all">("all");

  if (!client) return null;

  const filteredChecks = assessment.checks.filter((c) => {
    if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (severityFilter !== "all" && c.severity !== severityFilter) return false;
    return true;
  });

  const categories = Object.keys(M365_CATEGORY_LABELS) as M365CheckCategory[];
  const categoryStats = categories.map((cat) => {
    const catChecks = assessment.checks.filter((c) => c.category === cat);
    return {
      category: cat,
      label: M365_CATEGORY_LABELS[cat],
      total: catChecks.length,
      pass: catChecks.filter((c) => c.status === "pass").length,
      fail: catChecks.filter((c) => c.status === "fail").length,
      warning: catChecks.filter((c) => c.status === "warning").length,
    };
  });

  const scoreColor = assessment.overallScore >= 80 ? "text-green-600" : assessment.overallScore >= 60 ? "text-yellow-600" : "text-red-600";
  const scoreRingColor = assessment.overallScore >= 80 ? "stroke-green-500" : assessment.overallScore >= 60 ? "stroke-yellow-500" : "stroke-red-500";

  return (
    <div>
      {/* Connection Banner */}
      {assessment.status === "not_started" && !assessment.tenantInfo && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Connect to Microsoft 365 Tenant</h2>
          <p className="text-sm text-gray-500 mb-1 max-w-lg mx-auto">
            Connect to {client.companyName}&apos;s M365 tenant to run a best practices security assessment.
            This will analyze identity, email security, data protection, and compliance settings.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            In production, this uses delegated admin permissions or CIPP API. Currently running in demo mode.
          </p>
          <button
            onClick={() => connectTenant(client.companyName)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Tenant (Demo)
          </button>
        </div>
      )}

      {/* Connecting State */}
      {assessment.status === "connecting" && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center mb-6">
          <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Connecting to Tenant...</h2>
          <p className="text-sm text-gray-500">Authenticating and gathering tenant information</p>
        </div>
      )}

      {/* Tenant Connected - Show Info + Run Button */}
      {assessment.tenantInfo && assessment.status !== "connecting" && (
        <>
          {/* Tenant Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">M365</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{assessment.tenantInfo.tenantName}</h3>
                    <p className="text-xs text-gray-500">{assessment.tenantInfo.primaryDomain}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-500">Total Users</p>
                    <p className="text-lg font-bold text-gray-900">{assessment.tenantInfo.totalUsers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Licensed Users</p>
                    <p className="text-lg font-bold text-gray-900">{assessment.tenantInfo.licensedUsers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Guest Users</p>
                    <p className="text-lg font-bold text-gray-900">{assessment.tenantInfo.guestUsers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Admin Users</p>
                    <p className="text-lg font-bold text-red-600">{assessment.tenantInfo.adminUsers}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {assessment.status === "completed" && (
                  <button onClick={runAssessment} className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                    Re-Run
                  </button>
                )}
                <button onClick={resetAssessment} className="px-3 py-1.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Disconnect
                </button>
              </div>
            </div>

            {/* License Table */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Licenses</h4>
              <div className="space-y-1">
                {assessment.tenantInfo.licenses.map((lic) => (
                  <div key={lic.skuId} className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-700">{lic.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{lic.assignedLicenses} / {lic.totalLicenses} assigned</span>
                      <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${lic.totalLicenses > 0 ? (lic.assignedLicenses / lic.totalLicenses) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Run Assessment / Running */}
          {assessment.status !== "completed" && assessment.status !== "running" && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Analyze</h3>
              <p className="text-sm text-gray-600 mb-4">
                Run a comprehensive best practices assessment covering {35}+ security and configuration checks
                across identity, email, data protection, endpoints, and compliance.
              </p>
              <button
                onClick={runAssessment}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg transition-all hover:shadow-xl"
              >
                Run Best Practices Analysis
              </button>
              <p className="text-xs text-gray-400 mt-2">Compatible with CIPP (CyberDrain Improved Partner Portal) standards</p>
            </div>
          )}

          {assessment.status === "running" && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center mb-6">
              <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-900 mb-2">Running Assessment...</h2>
              <p className="text-sm text-gray-500">Checking identity, email, data protection, endpoints, and compliance settings</p>
            </div>
          )}

          {/* Results */}
          {assessment.status === "completed" && (
            <>
              {/* View Tabs */}
              <div className="flex gap-2 mb-6">
                {([
                  { key: "overview" as const, label: "Overview & Gap Analysis" },
                  { key: "details" as const, label: "Detailed Checks" },
                  { key: "report" as const, label: "Report" },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveView(tab.key)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                      activeView === tab.key ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* OVERVIEW */}
              {activeView === "overview" && (
                <div className="space-y-6">
                  {/* Score + Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Score Circle */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center">
                      <svg viewBox="0 0 120 120" className="w-28 h-28">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                        <circle
                          cx="60" cy="60" r="50" fill="none"
                          className={scoreRingColor}
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${assessment.overallScore * 3.14} 314`}
                          transform="rotate(-90 60 60)"
                        />
                        <text x="60" y="55" textAnchor="middle" className={`text-2xl font-bold fill-current ${scoreColor}`}>
                          {assessment.overallScore}
                        </text>
                        <text x="60" y="72" textAnchor="middle" className="text-xs fill-gray-400">Score</text>
                      </svg>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <p className="text-xs text-gray-500 mb-1">Checks Passed</p>
                      <p className="text-3xl font-bold text-green-600">{stats.pass}</p>
                      <p className="text-xs text-gray-400 mt-1">of {stats.total} total checks</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <p className="text-xs text-gray-500 mb-1">Checks Failed</p>
                      <p className="text-3xl font-bold text-red-600">{stats.fail}</p>
                      <div className="flex gap-2 mt-1">
                        {stats.critical > 0 && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{stats.critical} critical</span>}
                        {stats.high > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{stats.high} high</span>}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <p className="text-xs text-gray-500 mb-1">Warnings</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.warning}</p>
                      <p className="text-xs text-gray-400 mt-1">partially configured</p>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Category Breakdown</h3>
                    <div className="space-y-3">
                      {categoryStats.map((cat) => {
                        const pct = cat.total > 0 ? Math.round((cat.pass / cat.total) * 100) : 0;
                        return (
                          <div key={cat.category}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-700">{cat.label}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-green-600">{cat.pass} pass</span>
                                {cat.fail > 0 && <span className="text-xs text-red-600">{cat.fail} fail</span>}
                                {cat.warning > 0 && <span className="text-xs text-yellow-600">{cat.warning} warn</span>}
                                <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="flex h-2 rounded-full overflow-hidden">
                                <div className="bg-green-500" style={{ width: `${cat.total > 0 ? (cat.pass / cat.total) * 100 : 0}%` }} />
                                <div className="bg-yellow-400" style={{ width: `${cat.total > 0 ? (cat.warning / cat.total) * 100 : 0}%` }} />
                                <div className="bg-red-400" style={{ width: `${cat.total > 0 ? (cat.fail / cat.total) * 100 : 0}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Critical & High Failures - Gap Analysis */}
                  <div className="bg-white rounded-xl border border-red-200 p-6">
                    <h3 className="text-sm font-bold text-red-800 mb-4">Gap Analysis - Critical & High Priority Failures</h3>
                    {assessment.checks.filter((c) => c.status === "fail" && (c.severity === "critical" || c.severity === "high")).length === 0 ? (
                      <p className="text-sm text-green-600">No critical or high severity failures detected.</p>
                    ) : (
                      <div className="space-y-3">
                        {assessment.checks
                          .filter((c) => c.status === "fail" && (c.severity === "critical" || c.severity === "high"))
                          .sort((a, b) => (a.severity === "critical" ? -1 : 1))
                          .map((check) => (
                            <div key={check.id} className="p-4 bg-red-50 rounded-lg border border-red-100">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", M365_SEVERITY_COLORS[check.severity])}>
                                  {check.severity.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">{M365_CATEGORY_LABELS[check.category]}</span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">{check.name}</p>
                              <p className="text-xs text-gray-600 mt-1">{check.description}</p>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                  <p className="text-xs font-medium text-red-700">Current State</p>
                                  <p className="text-xs text-red-600">{check.currentValue}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-green-700">Recommended</p>
                                  <p className="text-xs text-green-600">{check.recommendedValue}</p>
                                </div>
                              </div>
                              <div className="mt-2 p-2 bg-white rounded border border-red-100">
                                <p className="text-xs font-medium text-gray-700">Remediation:</p>
                                <p className="text-xs text-gray-600">{check.remediation}</p>
                              </div>
                              {check.cippEquivalent && (
                                <p className="text-xs text-blue-600 mt-1">CIPP: {check.cippEquivalent}</p>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DETAILED CHECKS */}
              {activeView === "details" && (
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as M365CheckCategory | "all")}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{M365_CATEGORY_LABELS[cat]}</option>
                      ))}
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as M365CheckStatus | "all")}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                      <option value="warning">Warning</option>
                    </select>
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value as M365CheckSeverity | "all")}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">All Severities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <span className="text-xs text-gray-400 ml-auto">{filteredChecks.length} checks shown</span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {filteredChecks.map((check) => (
                      <div key={check.id}>
                        <button
                          onClick={() => setExpandedCheck(expandedCheck === check.id ? null : check.id)}
                          className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left"
                        >
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full shrink-0", M365_STATUS_COLORS[check.status])}>
                            {M365_STATUS_LABELS[check.status]}
                          </span>
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full shrink-0", M365_SEVERITY_COLORS[check.severity])}>
                            {check.severity}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{check.name}</p>
                            <p className="text-xs text-gray-500">{M365_CATEGORY_LABELS[check.category]}</p>
                          </div>
                          <svg className={cn("w-4 h-4 text-gray-400 transition-transform shrink-0", expandedCheck === check.id && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {expandedCheck === check.id && (
                          <div className="px-4 pb-4 bg-gray-50 space-y-3">
                            <p className="text-sm text-gray-600">{check.description}</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <p className="text-xs font-semibold text-gray-500 mb-1">Current Value</p>
                                <p className={cn("text-sm", check.status === "pass" ? "text-green-700" : check.status === "warning" ? "text-yellow-700" : "text-red-700")}>
                                  {check.currentValue}
                                </p>
                              </div>
                              <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <p className="text-xs font-semibold text-gray-500 mb-1">Recommended Value</p>
                                <p className="text-sm text-green-700">{check.recommendedValue}</p>
                              </div>
                            </div>
                            {check.status !== "pass" && (
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-xs font-semibold text-blue-800 mb-1">Remediation Steps</p>
                                <p className="text-sm text-blue-700">{check.remediation}</p>
                              </div>
                            )}
                            <div className="flex gap-4">
                              {check.cippEquivalent && (
                                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">CIPP: {check.cippEquivalent}</span>
                              )}
                              {check.microsoftDoc && (
                                <span className="text-xs text-blue-500">MS Documentation available</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REPORT */}
              {activeView === "report" && (
                <div className="bg-white rounded-xl border border-gray-200 p-8">
                  <div className="max-w-3xl mx-auto">
                    {/* Report Header */}
                    <div className="text-center border-b border-gray-200 pb-6 mb-6">
                      <h1 className="text-2xl font-bold text-gray-900">Microsoft 365 Security Assessment Report</h1>
                      <p className="text-sm text-gray-500 mt-1">{client.companyName}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Generated: {assessment.runAt ? new Date(assessment.runAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
                      </p>
                    </div>

                    {/* Executive Summary */}
                    <section className="mb-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-3">Executive Summary</h2>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          This assessment evaluated <strong>{stats.total}</strong> Microsoft 365 security and configuration best practices
                          for <strong>{client.companyName}</strong>&apos;s tenant ({assessment.tenantInfo?.primaryDomain}).
                          The overall security score is <strong className={scoreColor}>{assessment.overallScore}%</strong>.
                          Of the {stats.total} checks performed, <strong className="text-green-600">{stats.pass} passed</strong>,{" "}
                          <strong className="text-red-600">{stats.fail} failed</strong>, and{" "}
                          <strong className="text-yellow-600">{stats.warning} had warnings</strong>.
                          {stats.critical > 0 && (
                            <span className="text-red-700 font-semibold"> There are {stats.critical} critical severity failures that should be addressed immediately.</span>
                          )}
                        </p>
                      </div>
                    </section>

                    {/* Tenant Overview */}
                    {assessment.tenantInfo && (
                      <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Tenant Overview</h2>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Tenant Name</p>
                            <p className="text-sm font-medium">{assessment.tenantInfo.tenantName}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Primary Domain</p>
                            <p className="text-sm font-medium">{assessment.tenantInfo.primaryDomain}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Total / Licensed Users</p>
                            <p className="text-sm font-medium">{assessment.tenantInfo.totalUsers} / {assessment.tenantInfo.licensedUsers}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Guest / Admin Users</p>
                            <p className="text-sm font-medium">{assessment.tenantInfo.guestUsers} / {assessment.tenantInfo.adminUsers}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">License Summary</h4>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 text-xs font-semibold text-gray-500">License</th>
                                <th className="text-right py-2 text-xs font-semibold text-gray-500">Assigned</th>
                                <th className="text-right py-2 text-xs font-semibold text-gray-500">Total</th>
                                <th className="text-right py-2 text-xs font-semibold text-gray-500">Available</th>
                              </tr>
                            </thead>
                            <tbody>
                              {assessment.tenantInfo.licenses.map((lic) => (
                                <tr key={lic.skuId} className="border-b border-gray-100">
                                  <td className="py-2 text-xs text-gray-700">{lic.name}</td>
                                  <td className="py-2 text-xs text-gray-700 text-right">{lic.assignedLicenses}</td>
                                  <td className="py-2 text-xs text-gray-700 text-right">{lic.totalLicenses}</td>
                                  <td className="py-2 text-xs text-gray-700 text-right">{lic.availableLicenses}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}

                    {/* Findings by Category */}
                    <section className="mb-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-3">Findings by Category</h2>
                      {categoryStats.map((cat) => {
                        const catChecks = assessment.checks.filter((c) => c.category === cat.category);
                        return (
                          <div key={cat.category} className="mb-6">
                            <h3 className="text-sm font-bold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                              {cat.label}
                              <span className="text-xs font-normal text-gray-400 ml-2">
                                ({cat.pass} pass, {cat.fail} fail, {cat.warning} warning)
                              </span>
                            </h3>
                            <div className="space-y-2">
                              {catChecks.map((check) => (
                                <div key={check.id} className="flex items-start gap-3 py-2">
                                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5", M365_STATUS_COLORS[check.status])}>
                                    {M365_STATUS_LABELS[check.status]}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-900">{check.name}</p>
                                    {check.status === "fail" && (
                                      <p className="text-xs text-red-600 mt-0.5">Current: {check.currentValue} | Recommended: {check.recommendedValue}</p>
                                    )}
                                  </div>
                                  <span className={cn("text-xs px-1.5 py-0.5 rounded shrink-0", M365_SEVERITY_COLORS[check.severity])}>
                                    {check.severity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </section>

                    {/* Print / Export */}
                    <div className="flex justify-center gap-3 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
                      >
                        Print Report
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

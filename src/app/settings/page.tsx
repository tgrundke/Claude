"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { defaultEmailTemplates } from "@/data/email-templates";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "templates" | "about">("general");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <PageHeader title="Settings" description="Configure your onboarding portal" />

      <div className="flex gap-4 mb-6">
        {[
          { key: "general" as const, label: "General" },
          { key: "templates" as const, label: "Email Templates" },
          { key: "about" as const, label: "About" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeTab === tab.key ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === "general" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Data Management</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Export All Data</p>
                    <p className="text-xs text-gray-500">Download all client data as a JSON backup file.</p>
                  </div>
                  <button
                    onClick={() => {
                      const keys = Object.keys(localStorage).filter((k) => k.startsWith("msp_"));
                      const data: Record<string, unknown> = {};
                      keys.forEach((k) => {
                        try { data[k] = JSON.parse(localStorage.getItem(k) || ""); } catch { data[k] = localStorage.getItem(k); }
                      });
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `msp-onboarding-backup-${new Date().toISOString().split("T")[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    Export JSON
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Clear All Data</p>
                    <p className="text-xs text-gray-500">Remove all client data from local storage. This cannot be undone.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure? This will delete ALL data and cannot be undone.")) {
                        const keys = Object.keys(localStorage).filter((k) => k.startsWith("msp_"));
                        keys.forEach((k) => localStorage.removeItem(k));
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                  >
                    Clear Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Email Templates</h3>
            <p className="text-sm text-gray-500 mb-4">
              These are the default email templates used when composing emails. Use {`{{variableName}}`} syntax for dynamic fields.
            </p>
            <div className="space-y-3">
              {defaultEmailTemplates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{template.name}</p>
                      <p className="text-xs text-gray-500">Subject: {template.subject}</p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${selectedTemplate === template.id ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {selectedTemplate === template.id && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <p className="text-xs font-medium text-gray-500 mb-2">Available Variables:</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.availableVariables.map((v) => (
                          <span key={v} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{`{{${v}}}`}</span>
                        ))}
                      </div>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200 max-h-64 overflow-y-auto">
                        {template.body}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">About</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Application</span>
                <span className="text-sm text-gray-900">IT Onboarding Portal</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Version</span>
                <span className="text-sm text-gray-900">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Storage</span>
                <span className="text-sm text-gray-900">Browser Local Storage</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Framework</span>
                <span className="text-sm text-gray-900">Next.js + React + Tailwind CSS</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Future Integrations:</strong> This portal is designed to eventually connect with ConnectWise, Halo PSA, Hudu, NinjaOne, Auvik, Sophos Central, Axcient, and Microsoft 365 APIs for automated provisioning and data sync.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

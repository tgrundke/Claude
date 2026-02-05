"use client";

import { useParams } from "next/navigation";
import { useClients } from "@/hooks/use-clients";

export default function ClientOverviewPage() {
  const params = useParams();
  const clientId = params.id as string;
  const { getClient, updateChecklist } = useClients();
  const client = getClient(clientId);

  if (!client) return null;

  const completedCount = client.checklist.filter((i) => i.completed).length;
  const totalCount = client.checklist.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categories = [...new Set(client.checklist.map((item) => item.category))];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Company Info</p>
          <p className="text-sm text-gray-900 mt-2">{client.companyName}</p>
          {client.address.city && (
            <p className="text-xs text-gray-500">{client.address.city}, {client.address.state}</p>
          )}
          {client.industry && <p className="text-xs text-gray-500">{client.industry}</p>}
          {client.employeeCount > 0 && <p className="text-xs text-gray-500">{client.employeeCount} employees</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Contract</p>
          {client.contractStartDate && (
            <p className="text-sm text-gray-900 mt-2">Start: {client.contractStartDate}</p>
          )}
          {client.contractValue > 0 && (
            <p className="text-xs text-gray-500">${client.contractValue}/mo</p>
          )}
          <p className="text-xs text-gray-500">SLA: {client.slaTier.charAt(0).toUpperCase() + client.slaTier.slice(1)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Outgoing Provider</p>
          {client.currentProvider.name ? (
            <>
              <p className="text-sm text-gray-900 mt-2">{client.currentProvider.name}</p>
              {client.currentProvider.contactName && (
                <p className="text-xs text-gray-500">{client.currentProvider.contactName}</p>
              )}
              {client.currentProvider.contactEmail && (
                <p className="text-xs text-gray-500">{client.currentProvider.contactEmail}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-2">Not specified</p>
          )}
        </div>
      </div>

      {/* Checklist Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Onboarding Checklist</h2>
          <span className="text-sm text-gray-500">{completedCount} / {totalCount} ({progress}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-6">
          {categories.map((category) => {
            const items = client.checklist.filter((i) => i.category === category);
            const catCompleted = items.filter((i) => i.completed).length;
            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {category} <span className="text-gray-400 font-normal">({catCompleted}/{items.length})</span>
                </h3>
                <div className="space-y-1">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => {
                          updateChecklist(clientId, item.id, {
                            completed: e.target.checked,
                            completedAt: e.target.checked ? new Date().toISOString() : null,
                          });
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${item.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

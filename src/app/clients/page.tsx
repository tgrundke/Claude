"use client";

import { useState } from "react";
import Link from "next/link";
import { useClients } from "@/hooks/use-clients";
import { PageHeader } from "@/components/layout/page-header";
import { STAGE_LABELS, STAGE_COLORS, STAGE_ORDER } from "@/types/client";
import type { OnboardingStage } from "@/types/client";
import { cn } from "@/lib/utils";

export default function ClientsPage() {
  const { clients, deleteClient } = useClients();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<OnboardingStage | "all">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.primaryContact.email.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "all" || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Clients"
        description={`${clients.length} total clients`}
        actions={
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Add Client
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as OnboardingStage | "all")}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stages</option>
            {STAGE_ORDER.map((s) => (
              <option key={s} value={s}>{STAGE_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">No clients found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Company</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stage</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => {
                const completed = client.checklist.filter((i) => i.completed).length;
                const total = client.checklist.length;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/clients/${client.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        {client.companyName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{client.primaryContact.firstName} {client.primaryContact.lastName}</p>
                      <p className="text-xs text-gray-500">{client.primaryContact.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", STAGE_COLORS[client.stage])}>
                        {STAGE_LABELS[client.stage]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {deleteConfirm === client.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { deleteClient(client.id); setDeleteConfirm(null); }}
                            className="text-xs text-red-600 font-medium hover:text-red-800"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs text-gray-500 font-medium hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(client.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

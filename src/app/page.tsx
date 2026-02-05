"use client";

import { useClients } from "@/hooks/use-clients";
import { PageHeader } from "@/components/layout/page-header";
import { STAGE_ORDER, STAGE_LABELS, STAGE_COLORS } from "@/types/client";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { clients, getClientsByStage } = useClients();

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.stage !== "complete").length;
  const completedClients = clients.filter((c) => c.stage === "complete").length;

  const avgChecklistProgress = clients.length > 0
    ? Math.round(
        clients.reduce((sum, c) => {
          const completed = c.checklist.filter((i) => i.completed).length;
          return sum + (c.checklist.length > 0 ? (completed / c.checklist.length) * 100 : 0);
        }, 0) / clients.length
      )
    : 0;

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        description="Overview of all client onboarding activity"
        actions={
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
            </svg>
            New Client
          </Link>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Total Clients</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalClients}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Active Onboarding</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{activeClients}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{completedClients}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Avg. Checklist Progress</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{avgChecklistProgress}%</p>
        </div>
      </div>

      {/* Pipeline Board */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Pipeline</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGE_ORDER.map((stage) => {
          const stageClients = getClientsByStage(stage);
          return (
            <div
              key={stage}
              className="min-w-[220px] max-w-[260px] bg-white rounded-xl border border-gray-200 flex-shrink-0"
            >
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", STAGE_COLORS[stage])}>
                    {STAGE_LABELS[stage]}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{stageClients.length}</span>
                </div>
              </div>
              <div className="p-2 space-y-2 min-h-[100px]">
                {stageClients.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No clients</p>
                ) : (
                  stageClients.map((client) => {
                    const completed = client.checklist.filter((i) => i.completed).length;
                    const total = client.checklist.length;
                    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                    return (
                      <Link
                        key={client.id}
                        href={`/clients/${client.id}`}
                        className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {client.companyName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {client.primaryContact.firstName} {client.primaryContact.lastName}
                        </p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {clients.length === 0 && (
        <div className="mt-8 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No clients yet</h3>
          <p className="mt-2 text-sm text-gray-500">Get started by adding your first client or importing from your CRM.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/clients/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Add Client
            </Link>
            <Link
              href="/import"
              className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Import from CRM
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

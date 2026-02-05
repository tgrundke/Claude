"use client";

import { useClients } from "@/hooks/use-clients";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { PageHeader } from "@/components/layout/page-header";
import { STAGE_ORDER, STAGE_LABELS, STAGE_COLORS } from "@/types/client";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { ENGINEERS } from "@/data/engineers";
import type { DeploymentItem } from "@/types/deployment";
import { TOOL_DISPLAY_NAMES, TOOL_COLORS } from "@/types/deployment";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format, parseISO, startOfWeek, addDays, isWithinInterval, isSameDay } from "date-fns";

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

  // Gather all deployment items across clients for the timeline
  const allDeployments: (DeploymentItem & { companyName: string })[] = [];
  clients.forEach((client) => {
    const key = `${STORAGE_KEYS.DEPLOYMENT_PREFIX}${client.id}`;
    const stored = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (stored) {
      try {
        const items: DeploymentItem[] = JSON.parse(stored);
        items.forEach((item) => {
          allDeployments.push({ ...item, companyName: client.companyName });
        });
      } catch { /* ignore parse errors */ }
    }
  });

  allDeployments.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  // Build 4-week calendar view starting from today (Mon start)
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const calendarDays: Date[] = [];
  for (let i = 0; i < 28; i++) {
    calendarDays.push(addDays(weekStart, i));
  }

  // Engineer workload summary
  const engineerWorkload = ENGINEERS.map((eng) => {
    const assignedTasks = allDeployments.filter((d) => d.assignedTo === eng.name);
    const todaySlot = eng.availability.find((s) => s.date === format(today, "yyyy-MM-dd"));
    return {
      ...eng,
      totalTasks: assignedTasks.length,
      completedTasks: assignedTasks.filter((t) => t.status === "completed").length,
      freeHoursToday: todaySlot ? todaySlot.totalHours - todaySlot.bookedHours : 0,
    };
  });

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

      {/* Project Timeline Calendar */}
      {allDeployments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Project Timeline</h2>
          <p className="text-xs text-gray-500 mb-4">4-week deployment view across all clients</p>

          {/* Week headers */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-px mb-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {calendarDays.map((day, idx) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const dayTasks = allDeployments.filter((d) => d.scheduledDate === dateStr);
                  const isToday = isSameDay(day, today);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "bg-white p-1.5 min-h-[70px]",
                        isToday && "ring-2 ring-blue-500 ring-inset",
                        isWeekend && "bg-gray-50"
                      )}
                    >
                      <p className={cn(
                        "text-xs mb-1",
                        isToday ? "font-bold text-blue-600" : "text-gray-400"
                      )}>
                        {format(day, "MMM d")}
                      </p>
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={cn("text-xs px-1 py-0.5 rounded mb-0.5 truncate", TOOL_COLORS[task.tool])}
                          title={`${task.companyName}: ${task.taskName} (${TOOL_DISPLAY_NAMES[task.tool]})`}
                        >
                          <span className="font-medium">{task.companyName.split(" ")[0]}</span>: {task.taskName.split(" - ").pop()}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <p className="text-xs text-gray-400">+{dayTasks.length - 3} more</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3">
                {(Object.entries(TOOL_DISPLAY_NAMES) as [string, string][]).map(([key, name]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={cn("w-3 h-3 rounded", TOOL_COLORS[key as keyof typeof TOOL_COLORS])} />
                    <span className="text-xs text-gray-500">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Engineer Workload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Engineering Team</h2>
        <p className="text-xs text-gray-500 mb-4">Availability synced from Halo PSA / M365 Calendar</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {engineerWorkload.map((eng) => (
            <div key={eng.id} className="text-center p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-2", eng.color)}>
                {eng.avatar}
              </div>
              <p className="text-sm font-medium text-gray-900">{eng.name}</p>
              <p className="text-xs text-gray-400 mb-3">{eng.role}</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Today</span>
                  <span className={cn("font-medium", eng.freeHoursToday > 4 ? "text-green-600" : eng.freeHoursToday > 0 ? "text-yellow-600" : "text-red-500")}>
                    {eng.freeHoursToday}h free
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Assigned</span>
                  <span className="text-blue-600 font-medium">{eng.totalTasks} tasks</span>
                </div>
                {eng.totalTasks > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${eng.totalTasks > 0 ? (eng.completedTasks / eng.totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
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
          <p className="mt-2 text-sm text-gray-500">Get started by adding your first client or importing from HubSpot / your outgoing provider&apos;s PSA.</p>
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
              Import from PSA
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

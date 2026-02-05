"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useClients } from "@/hooks/use-clients";
import { ENGINEERS } from "@/data/engineers";
import { cn } from "@/lib/utils";

export default function ClientOverviewPage() {
  const params = useParams();
  const clientId = params.id as string;
  const { getClient, updateChecklist, assignCategoryToEngineer, scheduleCategoryTasks } = useClients();
  const client = getClient(clientId);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);

  if (!client) return null;

  const completedCount = client.checklist.filter((i) => i.completed).length;
  const totalCount = client.checklist.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const categories = [...new Set(client.checklist.map((item) => item.category))];

  const getEngineerInfo = (name: string) => ENGINEERS.find((e) => e.name === name);

  const overdueCount = client.checklist.filter((i) => !i.completed && i.dueDate && new Date(i.dueDate) < new Date()).length;
  const assignedCount = client.checklist.filter((i) => i.assignedTo).length;
  const scheduledCount = client.checklist.filter((i) => i.scheduledDate).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Company Info</p>
          <p className="text-sm text-gray-900 mt-2">{client.companyName}</p>
          {client.address.city && <p className="text-xs text-gray-500">{client.address.city}, {client.address.state}</p>}
          {client.industry && <p className="text-xs text-gray-500">{client.industry}</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Contract</p>
          {client.contractStartDate && <p className="text-sm text-gray-900 mt-2">Start: {client.contractStartDate}</p>}
          {client.contractValue > 0 && <p className="text-xs text-gray-500">${client.contractValue}/mo</p>}
          <p className="text-xs text-gray-500">SLA: {client.slaTier.charAt(0).toUpperCase() + client.slaTier.slice(1)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Outgoing Provider</p>
          {client.currentProvider.name ? (
            <>
              <p className="text-sm text-gray-900 mt-2">{client.currentProvider.name}</p>
              {client.currentProvider.contactEmail && <p className="text-xs text-gray-500">{client.currentProvider.contactEmail}</p>}
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-2">Not specified</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Assigned / Scheduled</p>
          <p className="text-sm text-gray-900 mt-2">{assignedCount} assigned</p>
          <p className="text-xs text-gray-500">{scheduledCount} scheduled</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Overdue</p>
          <p className={cn("text-2xl font-bold mt-1", overdueCount > 0 ? "text-red-600" : "text-green-600")}>{overdueCount}</p>
          <p className="text-xs text-gray-500">tasks past due</p>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Onboarding Checklist</h2>
          <span className="text-sm text-gray-500">{completedCount} / {totalCount} ({progress}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-4">
          {categories.map((category) => {
            const items = client.checklist.filter((i) => i.category === category);
            const catCompleted = items.filter((i) => i.completed).length;
            const isExpanded = expandedCategory === category;
            const categoryAssignee = items[0]?.assignedTo || "";

            return (
              <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Category Header */}
                <div className="bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : category)}
                      className="flex items-center gap-2 text-left"
                    >
                      <svg className={cn("w-4 h-4 text-gray-400 transition-transform", isExpanded && "rotate-90")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      <h3 className="text-sm font-semibold text-gray-700">
                        {category}
                      </h3>
                      <span className="text-xs text-gray-400">({catCompleted}/{items.length})</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Category-level engineer assignment */}
                      <select
                        value={categoryAssignee}
                        onChange={(e) => assignCategoryToEngineer(clientId, category, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                        title="Assign all tasks in this category"
                      >
                        <option value="">Assign group...</option>
                        {ENGINEERS.map((eng) => (
                          <option key={eng.id} value={eng.name}>{eng.name}</option>
                        ))}
                      </select>

                      {/* Category-level scheduling */}
                      <input
                        type="date"
                        value={items[0]?.scheduledDate || ""}
                        onChange={(e) => scheduleCategoryTasks(clientId, category, e.target.value, items[0]?.dueDate || "")}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                        title="Schedule all tasks in this category"
                      />
                      <input
                        type="date"
                        value={items[0]?.dueDate || ""}
                        onChange={(e) => scheduleCategoryTasks(clientId, category, items[0]?.scheduledDate || "", e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                        title="Set due date for all tasks"
                      />

                      {/* Progress bar mini */}
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${items.length > 0 ? (catCompleted / items.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Show assigned avatars for category */}
                  {categoryAssignee && (() => {
                    const eng = getEngineerInfo(categoryAssignee);
                    return eng ? (
                      <div className="flex items-center gap-1.5 mt-2 ml-6">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold", eng.color)}>
                          {eng.avatar}
                        </div>
                        <span className="text-xs text-gray-500">{eng.name} - {eng.role}</span>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Task Items (always visible, but expanded shows full details) */}
                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const isEditing = editingTask === item.id;
                    const isOverdue = !item.completed && item.dueDate && new Date(item.dueDate) < new Date();
                    const eng = item.assignedTo ? getEngineerInfo(item.assignedTo) : null;

                    return (
                      <div key={item.id} className={cn("p-3", isOverdue && "bg-red-50")}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={(e) => {
                              updateChecklist(clientId, item.id, {
                                completed: e.target.checked,
                                completedAt: e.target.checked ? new Date().toISOString() : null,
                              });
                            }}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 shrink-0"
                          />
                          <span className={cn("text-sm flex-1", item.completed ? "text-gray-400 line-through" : "text-gray-700")}>
                            {item.label}
                          </span>

                          {/* Inline indicators */}
                          <div className="flex items-center gap-2 shrink-0">
                            {isOverdue && (
                              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Overdue</span>
                            )}
                            {item.priority !== "medium" && (
                              <span className={cn("text-xs px-1.5 py-0.5 rounded",
                                item.priority === "high" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"
                              )}>
                                {item.priority}
                              </span>
                            )}
                            {eng && (
                              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold", eng.color)} title={eng.name}>
                                {eng.avatar}
                              </div>
                            )}
                            {item.scheduledDate && (
                              <span className="text-xs text-gray-400">{item.scheduledDate}</span>
                            )}
                            <button
                              onClick={() => setEditingTask(isEditing ? null : item.id)}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              {isEditing ? "Close" : "Edit"}
                            </button>
                          </div>
                        </div>

                        {/* Expanded edit row */}
                        {isEditing && (
                          <div className="mt-3 ml-7 p-3 bg-gray-50 rounded-lg space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Assigned To</label>
                                <select
                                  value={item.assignedTo}
                                  onChange={(e) => updateChecklist(clientId, item.id, { assignedTo: e.target.value })}
                                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
                                >
                                  <option value="">Unassigned</option>
                                  {ENGINEERS.map((e) => (
                                    <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Scheduled Date</label>
                                <input
                                  type="date"
                                  value={item.scheduledDate}
                                  onChange={(e) => updateChecklist(clientId, item.id, { scheduledDate: e.target.value })}
                                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                                <input
                                  type="date"
                                  value={item.dueDate}
                                  onChange={(e) => updateChecklist(clientId, item.id, { dueDate: e.target.value })}
                                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                                <select
                                  value={item.priority}
                                  onChange={(e) => updateChecklist(clientId, item.id, { priority: e.target.value as "low" | "medium" | "high" })}
                                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                              <input
                                type="text"
                                value={item.notes}
                                onChange={(e) => updateChecklist(clientId, item.id, { notes: e.target.value })}
                                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
                                placeholder="Add notes..."
                              />
                            </div>
                            {/* Create To-Do button */}
                            {item.assignedTo && item.scheduledDate && (
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => {
                                    alert(`To-Do created for ${item.assignedTo}:\n\nTask: ${item.label}\nScheduled: ${item.scheduledDate}\nDue: ${item.dueDate || "No due date"}\n\nIn production, this will create a ticket in Halo PSA.`);
                                  }}
                                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
                                >
                                  Create To-Do for {item.assignedTo.split(" ")[0]}
                                </button>
                                <span className="text-xs text-gray-400">Creates a task in Halo PSA</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useDeployment } from "@/hooks/use-deployment";
import { useClients } from "@/hooks/use-clients";
import { generateDefaultDeploymentPlan } from "@/data/deployment-defaults";
import { TOOL_DISPLAY_NAMES, TOOL_COLORS, DEPLOYMENT_STATUS_LABELS, DEPLOYMENT_STATUS_COLORS } from "@/types/deployment";
import type { DeploymentTool, DeploymentStatus, DeploymentItem } from "@/types/deployment";
import { cn } from "@/lib/utils";
import { format, parseISO, startOfWeek, addDays } from "date-fns";

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function DeploymentPage() {
  const params = useParams();
  const clientId = params.id as string;
  const { items, addItem, updateItem, deleteItem, updateStatus, loadDefaults } = useDeployment(clientId);
  const { getClient } = useClients();
  const client = getClient(clientId);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<"timeline" | "calendar">("timeline");
  const [startDate, setStartDate] = useState(
    client?.contractStartDate || format(new Date(), "yyyy-MM-dd")
  );

  const [form, setForm] = useState<Omit<DeploymentItem, "id" | "clientId">>({
    tool: "ninja",
    taskName: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "09:00",
    estimatedDurationMinutes: 60,
    status: "not_started",
    assignedTo: "",
    dependsOn: [],
    linkedEmailId: null,
    notes: "",
    completedAt: null,
  });

  const resetForm = () => {
    setForm({
      tool: "ninja", taskName: "", description: "", scheduledDate: "", scheduledTime: "09:00",
      estimatedDurationMinutes: 60, status: "not_started", assignedTo: "", dependsOn: [],
      linkedEmailId: null, notes: "", completedAt: null,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (editingId) {
      updateItem(editingId, form);
    } else {
      addItem(form);
    }
    resetForm();
  };

  const startEdit = (item: DeploymentItem) => {
    setEditingId(item.id);
    const { id: _id, clientId: _cid, ...rest } = item;
    setForm(rest);
    setShowForm(true);
  };

  const handleLoadDefaults = () => {
    const defaults = generateDefaultDeploymentPlan(clientId, parseISO(startDate));
    loadDefaults(defaults);
  };

  // Group items by week
  const groupByWeek = () => {
    const weeks: Record<string, DeploymentItem[]> = {};
    items.forEach((item) => {
      if (!item.scheduledDate) return;
      const weekStart = format(startOfWeek(parseISO(item.scheduledDate), { weekStartsOn: 1 }), "yyyy-MM-dd");
      if (!weeks[weekStart]) weeks[weekStart] = [];
      weeks[weekStart].push(item);
    });
    return Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b));
  };

  // Generate calendar days for current month view
  const getCalendarDays = () => {
    const baseDate = items.length > 0 ? parseISO(items[0].scheduledDate) : new Date();
    const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const days: Date[] = [];
    let current = calStart;
    while (current <= monthEnd || days.length % 7 !== 0) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }
    return { days, monthStart };
  };

  const statusCounts = {
    not_started: items.filter((i) => i.status === "not_started").length,
    scheduled: items.filter((i) => i.status === "scheduled").length,
    in_progress: items.filter((i) => i.status === "in_progress").length,
    completed: items.filter((i) => i.status === "completed").length,
  };

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{statusCounts.not_started}</p>
          <p className="text-xs text-gray-500">Not Started</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{statusCounts.scheduled}</p>
          <p className="text-xs text-gray-500">Scheduled</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{statusCounts.in_progress}</p>
          <p className="text-xs text-gray-500">In Progress</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Deployment Timeline</h2>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setView("timeline")}
                className={cn("px-3 py-1 text-xs font-medium", view === "timeline" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50")}
              >
                Timeline
              </button>
              <button
                onClick={() => setView("calendar")}
                className={cn("px-3 py-1 text-xs font-medium", view === "calendar" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50")}
              >
                Calendar
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {items.length === 0 && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={handleLoadDefaults}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                >
                  Load Default Plan
                </button>
              </div>
            )}
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">{editingId ? "Edit" : "Add"} Deployment Task</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tool *</label>
                <select className={inputCls} value={form.tool} onChange={(e) => setForm({ ...form, tool: e.target.value as DeploymentTool })}>
                  {Object.entries(TOOL_DISPLAY_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Task Name *</label>
                <input className={inputCls} value={form.taskName} onChange={(e) => setForm({ ...form, taskName: e.target.value })} placeholder="Deploy agents to servers" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Description</label>
                <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Scheduled Date</label>
                <input className={inputCls} type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Scheduled Time</label>
                <input className={inputCls} type="time" value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Duration (minutes)</label>
                <input className={inputCls} type="number" value={form.estimatedDurationMinutes} onChange={(e) => setForm({ ...form, estimatedDurationMinutes: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DeploymentStatus })}>
                  {Object.entries(DEPLOYMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Assigned To</label>
                <input className={inputCls} value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} placeholder="Team member name" />
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <input className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">{editingId ? "Update" : "Save"}</button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 mb-2">No deployment tasks yet.</p>
              <p className="text-xs text-gray-400">Load the default plan or add tasks manually.</p>
            </div>
          ) : view === "timeline" ? (
            <div className="space-y-8">
              {groupByWeek().map(([weekStart, weekItems]) => (
                <div key={weekStart}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Week of {format(parseISO(weekStart), "MMM d, yyyy")}
                  </h3>
                  <div className="space-y-2">
                    {weekItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                        <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: item.tool === "ninja" ? "#0ea5e9" : item.tool === "auvik" ? "#7c3aed" : item.tool === "sophos_mdr" ? "#ef4444" : "#10b981" }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", TOOL_COLORS[item.tool])}>
                              {TOOL_DISPLAY_NAMES[item.tool]}
                            </span>
                            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", DEPLOYMENT_STATUS_COLORS[item.status])}>
                              {DEPLOYMENT_STATUS_LABELS[item.status]}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{item.taskName}</p>
                          {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                            <span>{format(parseISO(item.scheduledDate), "MMM d")} at {item.scheduledTime}</span>
                            <span>{item.estimatedDurationMinutes} min</span>
                            {item.assignedTo && <span>Assigned: {item.assignedTo}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={item.status}
                            onChange={(e) => updateStatus(item.id, e.target.value as DeploymentStatus)}
                            className="text-xs border border-gray-200 rounded px-2 py-1"
                          >
                            {Object.entries(DEPLOYMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                          <button onClick={() => startEdit(item)} className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                          <button onClick={() => deleteItem(item.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Calendar View */
            <div>
              {(() => {
                const { days, monthStart } = getCalendarDays();
                return (
                  <>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                      {format(monthStart, "MMMM yyyy")}
                    </h3>
                    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                        <div key={d} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500">{d}</div>
                      ))}
                      {days.map((day, idx) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const dayItems = items.filter((i) => i.scheduledDate === dateStr);
                        const isCurrentMonth = day.getMonth() === monthStart.getMonth();
                        return (
                          <div
                            key={idx}
                            className={cn("bg-white p-2 min-h-[80px]", !isCurrentMonth && "opacity-40")}
                          >
                            <p className="text-xs text-gray-500 mb-1">{format(day, "d")}</p>
                            {dayItems.map((item) => (
                              <div
                                key={item.id}
                                className={cn("text-xs px-1 py-0.5 rounded mb-0.5 truncate cursor-pointer", TOOL_COLORS[item.tool])}
                                title={`${TOOL_DISPLAY_NAMES[item.tool]}: ${item.taskName}`}
                                onClick={() => startEdit(item)}
                              >
                                {item.taskName}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useEnvironment } from "@/hooks/use-environment";
import { cn } from "@/lib/utils";
import { SERVER_ROLE_LABELS, ASSET_TYPE_LABELS } from "@/types/environment";
import type { Firewall, Server, Workstation, NetworkSwitch, GenericAsset, ServerRole, AssetType } from "@/types/environment";
import { importFromAuvik } from "@/lib/auvik-stubs";
import type { AuvikImportResult } from "@/lib/auvik-stubs";
import { importFromNinja } from "@/lib/ninja-stubs";
import type { NinjaImportResult } from "@/lib/ninja-stubs";
import { pushToHudu, validateForHudu } from "@/lib/hudu-stubs";
import type { HuduPushResult } from "@/lib/hudu-stubs";

type Tab = "firewalls" | "servers" | "workstations" | "switches" | "assets";

const TABS: { key: Tab; label: string }[] = [
  { key: "firewalls", label: "Firewalls" },
  { key: "servers", label: "Servers" },
  { key: "workstations", label: "Workstations" },
  { key: "switches", label: "Switches" },
  { key: "assets", label: "Other Assets" },
];

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

type ImportStatus = "idle" | "loading" | "preview" | "done" | "error";
type HuduStatus = "idle" | "validating" | "confirming" | "pushing" | "done" | "error";

export default function EnvironmentPage() {
  const params = useParams();
  const clientId = params.id as string;
  const env = useEnvironment(clientId);
  const [activeTab, setActiveTab] = useState<Tab>("firewalls");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Import states
  const [auvikStatus, setAuvikStatus] = useState<ImportStatus>("idle");
  const [auvikResult, setAuvikResult] = useState<AuvikImportResult | null>(null);
  const [ninjaStatus, setNinjaStatus] = useState<ImportStatus>("idle");
  const [ninjaResult, setNinjaResult] = useState<NinjaImportResult | null>(null);

  // Hudu push states
  const [huduStatus, setHuduStatus] = useState<HuduStatus>("idle");
  const [huduWarnings, setHuduWarnings] = useState<string[]>([]);
  const [huduResult, setHuduResult] = useState<HuduPushResult | null>(null);
  const [huduProgress, setHuduProgress] = useState(0);

  // Firewall form state
  const [fwForm, setFwForm] = useState<Omit<Firewall, "id" | "clientId">>({
    make: "", model: "", serialNumber: "", firmwareVersion: "", managementIp: "", wanIp: "", lanSubnets: "", hasVpn: false, vpnConfig: "", age: "", location: "", notes: "",
  });

  // Server form state
  const [srvForm, setSrvForm] = useState<Omit<Server, "id" | "clientId">>({
    hostname: "", role: "other" as ServerRole, make: "", model: "", serialNumber: "", os: "", osVersion: "", cpuInfo: "", ramGb: 0, storageGb: 0, storageType: "SSD", ipAddress: "", isVirtual: false, hypervisor: "", currentBackupMethod: "", criticalApps: "", age: "", location: "", notes: "",
  });

  // Workstation form state
  const [wsForm, setWsForm] = useState<Omit<Workstation, "id" | "clientId">>({
    hostname: "", make: "", model: "", serialNumber: "", os: "", osVersion: "", cpuInfo: "", ramGb: 0, storageGb: 0, assignedUser: "", department: "", age: "", location: "", notes: "",
  });

  // Switch form state
  const [swForm, setSwForm] = useState<Omit<NetworkSwitch, "id" | "clientId">>({
    make: "", model: "", serialNumber: "", managementIp: "", portCount: 0, poeCapable: false, isManaged: false, vlanConfig: "", age: "", location: "", notes: "",
  });

  // Asset form state
  const [assetForm, setAssetForm] = useState<Omit<GenericAsset, "id" | "clientId">>({
    assetType: "printer" as AssetType, name: "", make: "", model: "", serialNumber: "", ipAddress: "", location: "", assignedUser: "", warrantyExpiration: "", age: "", notes: "",
  });

  const resetForms = () => {
    setFwForm({ make: "", model: "", serialNumber: "", firmwareVersion: "", managementIp: "", wanIp: "", lanSubnets: "", hasVpn: false, vpnConfig: "", age: "", location: "", notes: "" });
    setSrvForm({ hostname: "", role: "other", make: "", model: "", serialNumber: "", os: "", osVersion: "", cpuInfo: "", ramGb: 0, storageGb: 0, storageType: "SSD", ipAddress: "", isVirtual: false, hypervisor: "", currentBackupMethod: "", criticalApps: "", age: "", location: "", notes: "" });
    setWsForm({ hostname: "", make: "", model: "", serialNumber: "", os: "", osVersion: "", cpuInfo: "", ramGb: 0, storageGb: 0, assignedUser: "", department: "", age: "", location: "", notes: "" });
    setSwForm({ make: "", model: "", serialNumber: "", managementIp: "", portCount: 0, poeCapable: false, isManaged: false, vlanConfig: "", age: "", location: "", notes: "" });
    setAssetForm({ assetType: "printer", name: "", make: "", model: "", serialNumber: "", ipAddress: "", location: "", assignedUser: "", warrantyExpiration: "", age: "", notes: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (editingId) {
      switch (activeTab) {
        case "firewalls": env.updateFirewall(editingId, fwForm as Partial<Firewall>); break;
        case "servers": env.updateServer(editingId, srvForm as Partial<Server>); break;
        case "workstations": env.updateWorkstation(editingId, wsForm as Partial<Workstation>); break;
        case "switches": env.updateSwitch(editingId, swForm as Partial<NetworkSwitch>); break;
        case "assets": env.updateAsset(editingId, assetForm as Partial<GenericAsset>); break;
      }
    } else {
      switch (activeTab) {
        case "firewalls": env.addFirewall(fwForm); break;
        case "servers": env.addServer(srvForm); break;
        case "workstations": env.addWorkstation(wsForm); break;
        case "switches": env.addSwitch(swForm); break;
        case "assets": env.addAsset(assetForm); break;
      }
    }
    resetForms();
  };

  const startEdit = (item: Firewall | Server | Workstation | NetworkSwitch | GenericAsset) => {
    setEditingId(item.id);
    setShowForm(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, clientId: _cid, ...rest } = item as unknown as Record<string, unknown>;
    switch (activeTab) {
      case "firewalls": setFwForm(rest as Omit<Firewall, "id" | "clientId">); break;
      case "servers": setSrvForm(rest as Omit<Server, "id" | "clientId">); break;
      case "workstations": setWsForm(rest as Omit<Workstation, "id" | "clientId">); break;
      case "switches": setSwForm(rest as Omit<NetworkSwitch, "id" | "clientId">); break;
      case "assets": setAssetForm(rest as Omit<GenericAsset, "id" | "clientId">); break;
    }
  };

  const handleDelete = (id: string) => {
    switch (activeTab) {
      case "firewalls": env.deleteFirewall(id); break;
      case "servers": env.deleteServer(id); break;
      case "workstations": env.deleteWorkstation(id); break;
      case "switches": env.deleteSwitch(id); break;
      case "assets": env.deleteAsset(id); break;
    }
  };

  // --- Auvik Import ---
  const handleAuvikImport = async () => {
    setAuvikStatus("loading");
    try {
      const result = await importFromAuvik();
      setAuvikResult(result);
      setAuvikStatus("preview");
    } catch {
      setAuvikStatus("error");
    }
  };

  const confirmAuvikImport = () => {
    if (!auvikResult) return;
    if (auvikResult.firewalls.length > 0) env.bulkAddFirewalls(auvikResult.firewalls);
    if (auvikResult.switches.length > 0) env.bulkAddSwitches(auvikResult.switches);
    if (auvikResult.assets.length > 0) env.bulkAddAssets(auvikResult.assets);
    setAuvikStatus("done");
  };

  // --- Ninja Import ---
  const handleNinjaImport = async () => {
    setNinjaStatus("loading");
    try {
      const result = await importFromNinja();
      setNinjaResult(result);
      setNinjaStatus("preview");
    } catch {
      setNinjaStatus("error");
    }
  };

  const confirmNinjaImport = () => {
    if (!ninjaResult) return;
    if (ninjaResult.servers.length > 0) env.bulkAddServers(ninjaResult.servers);
    if (ninjaResult.workstations.length > 0) env.bulkAddWorkstations(ninjaResult.workstations);
    setNinjaStatus("done");
  };

  // --- Hudu Push ---
  const handleHuduValidate = () => {
    setHuduStatus("validating");
    const warnings = validateForHudu({
      firewalls: env.firewalls,
      servers: env.servers,
      workstations: env.workstations,
      switches: env.switches,
      assets: env.assets,
    });
    setHuduWarnings(warnings);
    setHuduStatus("confirming");
  };

  const handleHuduPush = async () => {
    setHuduStatus("pushing");
    setHuduProgress(0);

    const totalItems = env.firewalls.length + env.servers.length + env.workstations.length + env.switches.length + env.assets.length;
    const progressInterval = setInterval(() => {
      setHuduProgress((prev) => {
        const next = prev + (100 / Math.max(totalItems, 1)) * 0.3;
        return Math.min(next, 95);
      });
    }, 200);

    try {
      const result = await pushToHudu({
        firewalls: env.firewalls,
        servers: env.servers,
        workstations: env.workstations,
        switches: env.switches,
        assets: env.assets,
      });
      clearInterval(progressInterval);
      setHuduProgress(100);
      setHuduResult(result);
      setHuduStatus("done");
    } catch {
      clearInterval(progressInterval);
      setHuduStatus("error");
    }
  };

  const totalItems = env.firewalls.length + env.servers.length + env.workstations.length + env.switches.length + env.assets.length;

  const counts = {
    firewalls: env.firewalls.length,
    servers: env.servers.length,
    workstations: env.workstations.length,
    switches: env.switches.length,
    assets: env.assets.length,
  };

  return (
    <div>
      {/* Integration Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Data Integration</h2>
            <p className="text-xs text-gray-500 mt-0.5">Import device data from monitoring tools or push to documentation</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Auvik Import Button */}
            <button
              onClick={handleAuvikImport}
              disabled={auvikStatus === "loading"}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors",
                auvikStatus === "done"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
              )}
            >
              {auvikStatus === "loading" ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Pulling from Auvik...</>
              ) : auvikStatus === "done" ? (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Auvik Imported</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Import from Auvik</>
              )}
            </button>

            {/* Ninja Import Button */}
            <button
              onClick={handleNinjaImport}
              disabled={ninjaStatus === "loading"}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors",
                ninjaStatus === "done"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              )}
            >
              {ninjaStatus === "loading" ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Pulling from NinjaOne...</>
              ) : ninjaStatus === "done" ? (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Ninja Imported</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Import from NinjaOne</>
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200" />

            {/* Push to Hudu Button */}
            <button
              onClick={handleHuduValidate}
              disabled={totalItems === 0 || huduStatus === "pushing"}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors",
                huduStatus === "done"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {huduStatus === "pushing" ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Pushing to Hudu...</>
              ) : huduStatus === "done" ? (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Pushed to Hudu</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>Push to Hudu</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Auvik Preview Modal */}
      {auvikStatus === "preview" && auvikResult && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-teal-900">Auvik Import Preview</h3>
              <p className="text-xs text-teal-700 mt-0.5">
                Found {auvikResult.totalDevices} devices. Review before importing.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAuvikStatus("idle")} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={confirmAuvikImport} className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700">Import All</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {auvikResult.firewalls.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-teal-100">
                <p className="text-xs font-semibold text-gray-700 mb-2">Firewalls ({auvikResult.firewalls.length})</p>
                {auvikResult.firewalls.map((fw, i) => (
                  <div key={i} className="text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
                    <span className="font-medium">{fw.make} {fw.model}</span>
                    <br /><span className="text-gray-400">IP: {fw.managementIp} | WAN: {fw.wanIp}</span>
                  </div>
                ))}
              </div>
            )}
            {auvikResult.switches.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-teal-100">
                <p className="text-xs font-semibold text-gray-700 mb-2">Switches ({auvikResult.switches.length})</p>
                {auvikResult.switches.map((sw, i) => (
                  <div key={i} className="text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
                    <span className="font-medium">{sw.make} {sw.model}</span>
                    <br /><span className="text-gray-400">{sw.portCount} ports | {sw.managementIp}</span>
                  </div>
                ))}
              </div>
            )}
            {auvikResult.assets.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-teal-100">
                <p className="text-xs font-semibold text-gray-700 mb-2">Other Devices ({auvikResult.assets.length})</p>
                {auvikResult.assets.map((a, i) => (
                  <div key={i} className="text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
                    <span className="font-medium">{a.name}</span>
                    <br /><span className="text-gray-400">{a.make} {a.model} | {ASSET_TYPE_LABELS[a.assetType]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ninja Preview Modal */}
      {ninjaStatus === "preview" && ninjaResult && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-indigo-900">NinjaOne Import Preview</h3>
              <p className="text-xs text-indigo-700 mt-0.5">
                Found {ninjaResult.totalDevices} endpoints. Review before importing.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setNinjaStatus("idle")} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={confirmNinjaImport} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Import All</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {ninjaResult.servers.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-indigo-100">
                <p className="text-xs font-semibold text-gray-700 mb-2">Servers ({ninjaResult.servers.length})</p>
                {ninjaResult.servers.map((srv, i) => (
                  <div key={i} className="text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
                    <span className="font-medium">{srv.hostname}</span> - {SERVER_ROLE_LABELS[srv.role]}
                    <br /><span className="text-gray-400">{srv.make} {srv.model} | {srv.os} {srv.osVersion} | {srv.ramGb}GB RAM</span>
                  </div>
                ))}
              </div>
            )}
            {ninjaResult.workstations.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-indigo-100">
                <p className="text-xs font-semibold text-gray-700 mb-2">Workstations ({ninjaResult.workstations.length})</p>
                {ninjaResult.workstations.map((ws, i) => (
                  <div key={i} className="text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
                    <span className="font-medium">{ws.hostname}</span>{ws.assignedUser && ` - ${ws.assignedUser}`}
                    <br /><span className="text-gray-400">{ws.make} {ws.model} | {ws.os} {ws.osVersion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hudu Confirmation Modal */}
      {huduStatus === "confirming" && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-orange-900">Push to Hudu - Confirmation</h3>
              <p className="text-xs text-orange-700 mt-0.5">
                Ready to push {totalItems} items to Hudu for documentation.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setHuduStatus("idle")} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleHuduPush} className="px-3 py-1.5 text-xs font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700">Confirm Push</button>
            </div>
          </div>

          {/* Summary of what will be pushed */}
          <div className="grid grid-cols-5 gap-3 mb-3">
            <div className="bg-white rounded-lg p-2 border border-orange-100 text-center">
              <p className="text-lg font-bold text-gray-900">{env.firewalls.length}</p>
              <p className="text-xs text-gray-500">Firewalls</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-orange-100 text-center">
              <p className="text-lg font-bold text-gray-900">{env.servers.length}</p>
              <p className="text-xs text-gray-500">Servers</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-orange-100 text-center">
              <p className="text-lg font-bold text-gray-900">{env.workstations.length}</p>
              <p className="text-xs text-gray-500">Workstations</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-orange-100 text-center">
              <p className="text-lg font-bold text-gray-900">{env.switches.length}</p>
              <p className="text-xs text-gray-500">Switches</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-orange-100 text-center">
              <p className="text-lg font-bold text-gray-900">{env.assets.length}</p>
              <p className="text-xs text-gray-500">Other Assets</p>
            </div>
          </div>

          {huduWarnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-yellow-800 mb-1">Warnings ({huduWarnings.length})</p>
              <ul className="text-xs text-yellow-700 space-y-0.5">
                {huduWarnings.map((w, i) => (
                  <li key={i}>&#x26A0; {w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Hudu Push Progress */}
      {huduStatus === "pushing" && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-orange-900 mb-2">Pushing to Hudu...</h3>
          <div className="w-full bg-orange-200 rounded-full h-2.5 mb-2">
            <div className="bg-orange-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${huduProgress}%` }} />
          </div>
          <p className="text-xs text-orange-700">Creating asset documentation... {Math.round(huduProgress)}%</p>
        </div>
      )}

      {/* Hudu Push Result */}
      {huduStatus === "done" && huduResult && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-green-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Successfully Pushed to Hudu
              </h3>
              <p className="text-xs text-green-700 mt-0.5">
                {huduResult.totalPushed} assets created in Hudu at {new Date(huduResult.pushedAt).toLocaleTimeString()}
              </p>
            </div>
            <button onClick={() => setHuduStatus("idle")} className="text-xs text-green-700 hover:text-green-900">Dismiss</button>
          </div>

          <div className="bg-white rounded-lg border border-green-100 divide-y divide-green-50 max-h-48 overflow-y-auto">
            {huduResult.details.map((detail, i) => (
              <div key={i} className="px-3 py-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-900">{detail.name}</span>
                  <span className="text-xs text-gray-400 ml-2">({detail.type})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600">{detail.status}</span>
                  <span className="text-xs text-gray-400 font-mono">{detail.huduAssetId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); resetForms(); }}
            className={cn(
              "p-3 rounded-xl border text-center transition-colors",
              activeTab === tab.key ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:bg-gray-50"
            )}
          >
            <p className="text-2xl font-bold text-gray-900">{counts[tab.key]}</p>
            <p className="text-xs text-gray-500">{tab.label}</p>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{TABS.find((t) => t.key === activeTab)?.label}</h2>
          <button
            onClick={() => { resetForms(); setShowForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Add {activeTab === "assets" ? "Asset" : TABS.find((t) => t.key === activeTab)?.label.slice(0, -1)}
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              {editingId ? "Edit" : "Add"} {activeTab === "assets" ? "Asset" : TABS.find((t) => t.key === activeTab)?.label.slice(0, -1)}
            </h3>

            {activeTab === "firewalls" && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Make *</label><input className={inputCls} value={fwForm.make} onChange={(e) => setFwForm({ ...fwForm, make: e.target.value })} placeholder="Fortinet, SonicWall, etc." /></div>
                <div><label className={labelCls}>Model</label><input className={inputCls} value={fwForm.model} onChange={(e) => setFwForm({ ...fwForm, model: e.target.value })} placeholder="FortiGate 60F" /></div>
                <div><label className={labelCls}>Serial Number</label><input className={inputCls} value={fwForm.serialNumber} onChange={(e) => setFwForm({ ...fwForm, serialNumber: e.target.value })} /></div>
                <div><label className={labelCls}>Firmware Version</label><input className={inputCls} value={fwForm.firmwareVersion} onChange={(e) => setFwForm({ ...fwForm, firmwareVersion: e.target.value })} /></div>
                <div><label className={labelCls}>Management IP</label><input className={inputCls} value={fwForm.managementIp} onChange={(e) => setFwForm({ ...fwForm, managementIp: e.target.value })} placeholder="192.168.1.1" /></div>
                <div><label className={labelCls}>WAN IP</label><input className={inputCls} value={fwForm.wanIp} onChange={(e) => setFwForm({ ...fwForm, wanIp: e.target.value })} /></div>
                <div><label className={labelCls}>LAN Subnets</label><input className={inputCls} value={fwForm.lanSubnets} onChange={(e) => setFwForm({ ...fwForm, lanSubnets: e.target.value })} placeholder="192.168.1.0/24, 10.0.0.0/24" /></div>
                <div><label className={labelCls}>Age</label><input className={inputCls} value={fwForm.age} onChange={(e) => setFwForm({ ...fwForm, age: e.target.value })} placeholder="2 years" /></div>
                <div><label className={labelCls}>Location</label><input className={inputCls} value={fwForm.location} onChange={(e) => setFwForm({ ...fwForm, location: e.target.value })} placeholder="Main Office, Server Room" /></div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={fwForm.hasVpn} onChange={(e) => setFwForm({ ...fwForm, hasVpn: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                  <label className="text-sm text-gray-700">Has VPN</label>
                </div>
                <div className="col-span-2"><label className={labelCls}>Notes</label><textarea className={inputCls} rows={2} value={fwForm.notes} onChange={(e) => setFwForm({ ...fwForm, notes: e.target.value })} /></div>
              </div>
            )}

            {activeTab === "servers" && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Hostname *</label><input className={inputCls} value={srvForm.hostname} onChange={(e) => setSrvForm({ ...srvForm, hostname: e.target.value })} placeholder="DC01" /></div>
                <div>
                  <label className={labelCls}>Role</label>
                  <select className={inputCls} value={srvForm.role} onChange={(e) => setSrvForm({ ...srvForm, role: e.target.value as ServerRole })}>
                    {Object.entries(SERVER_ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Make</label><input className={inputCls} value={srvForm.make} onChange={(e) => setSrvForm({ ...srvForm, make: e.target.value })} placeholder="Dell, HP, etc." /></div>
                <div><label className={labelCls}>Model</label><input className={inputCls} value={srvForm.model} onChange={(e) => setSrvForm({ ...srvForm, model: e.target.value })} placeholder="PowerEdge R740" /></div>
                <div><label className={labelCls}>OS</label><input className={inputCls} value={srvForm.os} onChange={(e) => setSrvForm({ ...srvForm, os: e.target.value })} placeholder="Windows Server" /></div>
                <div><label className={labelCls}>OS Version</label><input className={inputCls} value={srvForm.osVersion} onChange={(e) => setSrvForm({ ...srvForm, osVersion: e.target.value })} placeholder="2022" /></div>
                <div><label className={labelCls}>CPU</label><input className={inputCls} value={srvForm.cpuInfo} onChange={(e) => setSrvForm({ ...srvForm, cpuInfo: e.target.value })} placeholder="Xeon E5-2680" /></div>
                <div><label className={labelCls}>RAM (GB)</label><input className={inputCls} type="number" value={srvForm.ramGb || ""} onChange={(e) => setSrvForm({ ...srvForm, ramGb: parseInt(e.target.value) || 0 })} /></div>
                <div><label className={labelCls}>Storage (GB)</label><input className={inputCls} type="number" value={srvForm.storageGb || ""} onChange={(e) => setSrvForm({ ...srvForm, storageGb: parseInt(e.target.value) || 0 })} /></div>
                <div>
                  <label className={labelCls}>Storage Type</label>
                  <select className={inputCls} value={srvForm.storageType} onChange={(e) => setSrvForm({ ...srvForm, storageType: e.target.value as "SSD" | "HDD" | "NVMe" | "Mixed" })}>
                    <option value="SSD">SSD</option><option value="HDD">HDD</option><option value="NVMe">NVMe</option><option value="Mixed">Mixed</option>
                  </select>
                </div>
                <div><label className={labelCls}>IP Address</label><input className={inputCls} value={srvForm.ipAddress} onChange={(e) => setSrvForm({ ...srvForm, ipAddress: e.target.value })} /></div>
                <div><label className={labelCls}>Age</label><input className={inputCls} value={srvForm.age} onChange={(e) => setSrvForm({ ...srvForm, age: e.target.value })} placeholder="3 years" /></div>
                <div><label className={labelCls}>Location</label><input className={inputCls} value={srvForm.location} onChange={(e) => setSrvForm({ ...srvForm, location: e.target.value })} /></div>
                <div><label className={labelCls}>Backup Method</label><input className={inputCls} value={srvForm.currentBackupMethod} onChange={(e) => setSrvForm({ ...srvForm, currentBackupMethod: e.target.value })} placeholder="Veeam, ShadowProtect, etc." /></div>
                <div><label className={labelCls}>Critical Apps</label><input className={inputCls} value={srvForm.criticalApps} onChange={(e) => setSrvForm({ ...srvForm, criticalApps: e.target.value })} placeholder="QuickBooks, SQL Server, etc." /></div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={srvForm.isVirtual} onChange={(e) => setSrvForm({ ...srvForm, isVirtual: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                  <label className="text-sm text-gray-700">Virtual Machine</label>
                </div>
                <div className="col-span-2"><label className={labelCls}>Notes</label><textarea className={inputCls} rows={2} value={srvForm.notes} onChange={(e) => setSrvForm({ ...srvForm, notes: e.target.value })} /></div>
              </div>
            )}

            {activeTab === "workstations" && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Hostname</label><input className={inputCls} value={wsForm.hostname} onChange={(e) => setWsForm({ ...wsForm, hostname: e.target.value })} placeholder="WS-001" /></div>
                <div><label className={labelCls}>Make</label><input className={inputCls} value={wsForm.make} onChange={(e) => setWsForm({ ...wsForm, make: e.target.value })} placeholder="Dell, Lenovo, etc." /></div>
                <div><label className={labelCls}>Model</label><input className={inputCls} value={wsForm.model} onChange={(e) => setWsForm({ ...wsForm, model: e.target.value })} placeholder="OptiPlex 7090" /></div>
                <div><label className={labelCls}>Serial Number</label><input className={inputCls} value={wsForm.serialNumber} onChange={(e) => setWsForm({ ...wsForm, serialNumber: e.target.value })} /></div>
                <div><label className={labelCls}>OS</label><input className={inputCls} value={wsForm.os} onChange={(e) => setWsForm({ ...wsForm, os: e.target.value })} placeholder="Windows 11" /></div>
                <div><label className={labelCls}>OS Version</label><input className={inputCls} value={wsForm.osVersion} onChange={(e) => setWsForm({ ...wsForm, osVersion: e.target.value })} placeholder="23H2" /></div>
                <div><label className={labelCls}>RAM (GB)</label><input className={inputCls} type="number" value={wsForm.ramGb || ""} onChange={(e) => setWsForm({ ...wsForm, ramGb: parseInt(e.target.value) || 0 })} /></div>
                <div><label className={labelCls}>Storage (GB)</label><input className={inputCls} type="number" value={wsForm.storageGb || ""} onChange={(e) => setWsForm({ ...wsForm, storageGb: parseInt(e.target.value) || 0 })} /></div>
                <div><label className={labelCls}>Assigned User</label><input className={inputCls} value={wsForm.assignedUser} onChange={(e) => setWsForm({ ...wsForm, assignedUser: e.target.value })} /></div>
                <div><label className={labelCls}>Department</label><input className={inputCls} value={wsForm.department} onChange={(e) => setWsForm({ ...wsForm, department: e.target.value })} /></div>
                <div><label className={labelCls}>Age</label><input className={inputCls} value={wsForm.age} onChange={(e) => setWsForm({ ...wsForm, age: e.target.value })} placeholder="1 year" /></div>
                <div><label className={labelCls}>Location</label><input className={inputCls} value={wsForm.location} onChange={(e) => setWsForm({ ...wsForm, location: e.target.value })} /></div>
                <div className="col-span-2"><label className={labelCls}>Notes</label><textarea className={inputCls} rows={2} value={wsForm.notes} onChange={(e) => setWsForm({ ...wsForm, notes: e.target.value })} /></div>
              </div>
            )}

            {activeTab === "switches" && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Make</label><input className={inputCls} value={swForm.make} onChange={(e) => setSwForm({ ...swForm, make: e.target.value })} placeholder="Cisco, Ubiquiti, etc." /></div>
                <div><label className={labelCls}>Model</label><input className={inputCls} value={swForm.model} onChange={(e) => setSwForm({ ...swForm, model: e.target.value })} /></div>
                <div><label className={labelCls}>Serial Number</label><input className={inputCls} value={swForm.serialNumber} onChange={(e) => setSwForm({ ...swForm, serialNumber: e.target.value })} /></div>
                <div><label className={labelCls}>Management IP</label><input className={inputCls} value={swForm.managementIp} onChange={(e) => setSwForm({ ...swForm, managementIp: e.target.value })} /></div>
                <div><label className={labelCls}>Port Count</label><input className={inputCls} type="number" value={swForm.portCount || ""} onChange={(e) => setSwForm({ ...swForm, portCount: parseInt(e.target.value) || 0 })} /></div>
                <div><label className={labelCls}>Age</label><input className={inputCls} value={swForm.age} onChange={(e) => setSwForm({ ...swForm, age: e.target.value })} /></div>
                <div><label className={labelCls}>Location</label><input className={inputCls} value={swForm.location} onChange={(e) => setSwForm({ ...swForm, location: e.target.value })} /></div>
                <div><label className={labelCls}>VLAN Config</label><input className={inputCls} value={swForm.vlanConfig} onChange={(e) => setSwForm({ ...swForm, vlanConfig: e.target.value })} /></div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={swForm.poeCapable} onChange={(e) => setSwForm({ ...swForm, poeCapable: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm text-gray-700">PoE Capable</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={swForm.isManaged} onChange={(e) => setSwForm({ ...swForm, isManaged: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm text-gray-700">Managed</span></label>
                </div>
                <div className="col-span-2"><label className={labelCls}>Notes</label><textarea className={inputCls} rows={2} value={swForm.notes} onChange={(e) => setSwForm({ ...swForm, notes: e.target.value })} /></div>
              </div>
            )}

            {activeTab === "assets" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Asset Type</label>
                  <select className={inputCls} value={assetForm.assetType} onChange={(e) => setAssetForm({ ...assetForm, assetType: e.target.value as AssetType })}>
                    {Object.entries(ASSET_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Name</label><input className={inputCls} value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} placeholder="Front Desk Printer" /></div>
                <div><label className={labelCls}>Make</label><input className={inputCls} value={assetForm.make} onChange={(e) => setAssetForm({ ...assetForm, make: e.target.value })} /></div>
                <div><label className={labelCls}>Model</label><input className={inputCls} value={assetForm.model} onChange={(e) => setAssetForm({ ...assetForm, model: e.target.value })} /></div>
                <div><label className={labelCls}>Serial Number</label><input className={inputCls} value={assetForm.serialNumber} onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })} /></div>
                <div><label className={labelCls}>IP Address</label><input className={inputCls} value={assetForm.ipAddress} onChange={(e) => setAssetForm({ ...assetForm, ipAddress: e.target.value })} /></div>
                <div><label className={labelCls}>Location</label><input className={inputCls} value={assetForm.location} onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })} /></div>
                <div><label className={labelCls}>Assigned User</label><input className={inputCls} value={assetForm.assignedUser} onChange={(e) => setAssetForm({ ...assetForm, assignedUser: e.target.value })} /></div>
                <div><label className={labelCls}>Age</label><input className={inputCls} value={assetForm.age} onChange={(e) => setAssetForm({ ...assetForm, age: e.target.value })} /></div>
                <div><label className={labelCls}>Warranty Expiration</label><input className={inputCls} type="date" value={assetForm.warrantyExpiration} onChange={(e) => setAssetForm({ ...assetForm, warrantyExpiration: e.target.value })} /></div>
                <div className="col-span-2"><label className={labelCls}>Notes</label><textarea className={inputCls} rows={2} value={assetForm.notes} onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })} /></div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={resetForms} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="p-4">
          {activeTab === "firewalls" && (
            env.firewalls.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No firewalls documented yet.</p>
                <p className="text-xs text-gray-400 mt-1">Click &quot;Import from Auvik&quot; to pull network data or &quot;Add Firewall&quot; to enter manually.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead><tr className="text-left border-b border-gray-200">
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Make/Model</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Serial</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Mgmt IP</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">WAN IP</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Location</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Source</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Actions</th>
                </tr></thead>
                <tbody>{env.firewalls.map((fw) => (
                  <tr key={fw.id} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-sm">{fw.make} {fw.model}</td>
                    <td className="px-3 py-2 text-xs text-gray-500 font-mono">{fw.serialNumber}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{fw.managementIp}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{fw.wanIp}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{fw.location}</td>
                    <td className="px-3 py-2">
                      {fw.notes?.includes("Imported from Auvik") ? (
                        <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">Auvik</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Manual</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <button onClick={() => startEdit(fw)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                      <button onClick={() => handleDelete(fw.id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )
          )}

          {activeTab === "servers" && (
            env.servers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No servers documented yet.</p>
                <p className="text-xs text-gray-400 mt-1">Click &quot;Import from NinjaOne&quot; to pull endpoint data or &quot;Add Server&quot; to enter manually.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead><tr className="text-left border-b border-gray-200">
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Hostname</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Role</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">OS</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">RAM/Storage</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">IP</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Source</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Actions</th>
                </tr></thead>
                <tbody>{env.servers.map((srv) => (
                  <tr key={srv.id} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-sm font-medium">{srv.hostname}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{SERVER_ROLE_LABELS[srv.role]}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{srv.os} {srv.osVersion}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{srv.ramGb}GB / {srv.storageGb}GB</td>
                    <td className="px-3 py-2 text-xs text-gray-500 font-mono">{srv.ipAddress}</td>
                    <td className="px-3 py-2">
                      {srv.notes?.includes("Imported from NinjaOne") ? (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Ninja</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Manual</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <button onClick={() => startEdit(srv)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                      <button onClick={() => handleDelete(srv.id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )
          )}

          {activeTab === "workstations" && (
            env.workstations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No workstations documented yet.</p>
                <p className="text-xs text-gray-400 mt-1">Click &quot;Import from NinjaOne&quot; to pull endpoint data or &quot;Add Workstation&quot; to enter manually.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead><tr className="text-left border-b border-gray-200">
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Hostname</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Make/Model</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">OS</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">User</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Dept</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Source</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Actions</th>
                </tr></thead>
                <tbody>{env.workstations.map((ws) => (
                  <tr key={ws.id} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-sm font-medium">{ws.hostname}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{ws.make} {ws.model}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{ws.os} {ws.osVersion}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{ws.assignedUser}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{ws.department}</td>
                    <td className="px-3 py-2">
                      {ws.notes?.includes("Imported from NinjaOne") ? (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Ninja</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Manual</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <button onClick={() => startEdit(ws)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                      <button onClick={() => handleDelete(ws.id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )
          )}

          {activeTab === "switches" && (
            env.switches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No switches documented yet.</p>
                <p className="text-xs text-gray-400 mt-1">Click &quot;Import from Auvik&quot; to pull network data or &quot;Add Switch&quot; to enter manually.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead><tr className="text-left border-b border-gray-200">
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Make/Model</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Mgmt IP</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Ports</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Features</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Location</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Source</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Actions</th>
                </tr></thead>
                <tbody>{env.switches.map((sw) => (
                  <tr key={sw.id} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-sm font-medium">{sw.make} {sw.model}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{sw.managementIp}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{sw.portCount}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{[sw.poeCapable && "PoE", sw.isManaged && "Managed"].filter(Boolean).join(", ") || "-"}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{sw.location}</td>
                    <td className="px-3 py-2">
                      {sw.notes?.includes("Imported from Auvik") ? (
                        <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">Auvik</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Manual</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <button onClick={() => startEdit(sw)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                      <button onClick={() => handleDelete(sw.id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )
          )}

          {activeTab === "assets" && (
            env.assets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No assets documented yet.</p>
                <p className="text-xs text-gray-400 mt-1">Click &quot;Import from Auvik&quot; to pull device data or &quot;Add Asset&quot; to enter manually.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead><tr className="text-left border-b border-gray-200">
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Type</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Name</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Make/Model</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Location</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Source</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Actions</th>
                </tr></thead>
                <tbody>{env.assets.map((asset) => (
                  <tr key={asset.id} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-sm">{ASSET_TYPE_LABELS[asset.assetType]}</td>
                    <td className="px-3 py-2 text-sm font-medium">{asset.name}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{asset.make} {asset.model}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{asset.location}</td>
                    <td className="px-3 py-2">
                      {asset.notes?.includes("Imported from Auvik") ? (
                        <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">Auvik</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Manual</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <button onClick={() => startEdit(asset)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                      <button onClick={() => handleDelete(asset.id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
}

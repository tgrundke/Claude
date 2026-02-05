"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useClients } from "@/hooks/use-clients";
import { cn } from "@/lib/utils";
import { STAGE_LABELS, STAGE_COLORS, STAGE_ORDER } from "@/types/client";
import type { OnboardingStage } from "@/types/client";

const tabs = [
  { href: "", label: "Overview" },
  { href: "/environment", label: "Environment" },
  { href: "/deployment", label: "Deployment" },
  { href: "/emails", label: "Emails" },
  { href: "/provisioning", label: "Provisioning" },
  { href: "/m365", label: "M365 Assessment" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const { getClient, moveClientToStage } = useClients();
  const clientId = params.id as string;
  const client = getClient(clientId);

  if (!client) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Client not found</h2>
          <p className="text-sm text-gray-500 mt-2">This client may have been deleted.</p>
          <Link href="/clients" className="text-sm text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  const basePath = `/clients/${clientId}`;
  const currentTab = pathname === basePath ? "" : pathname.replace(basePath, "");

  return (
    <div className="p-8">
      {/* Client Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/clients" className="text-sm text-gray-500 hover:text-gray-700">Clients</Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-2xl font-bold text-gray-900">{client.companyName}</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {client.primaryContact.firstName} {client.primaryContact.lastName} - {client.primaryContact.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Stage:</span>
          <select
            value={client.stage}
            onChange={(e) => moveClientToStage(clientId, e.target.value as OnboardingStage)}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer",
              STAGE_COLORS[client.stage]
            )}
          >
            {STAGE_ORDER.map((s) => (
              <option key={s} value={s}>{STAGE_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={`${basePath}${tab.href}`}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                currentTab === tab.href
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {children}
    </div>
  );
}

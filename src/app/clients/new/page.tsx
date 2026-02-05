"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClients } from "@/hooks/use-clients";
import { PageHeader } from "@/components/layout/page-header";
import { generateId } from "@/lib/id";
import type { Client, ContactInfo, Address, OutgoingProvider } from "@/types/client";

const STEPS = [
  "Company Info",
  "Primary Contact",
  "Outgoing Provider",
  "Contract Details",
  "Review",
];

function emptyContact(): ContactInfo {
  return {
    id: generateId(),
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    isPrimary: true,
  };
}

function emptyAddress(): Address {
  return { street: "", suite: "", city: "", state: "", zip: "" };
}

function emptyProvider(): OutgoingProvider {
  return {
    name: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contractEndDate: "",
    servicesProvided: "",
    notes: "",
  };
}

export default function NewClientPage() {
  const router = useRouter();
  const { addClient } = useClients();
  const [step, setStep] = useState(0);

  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState<Address>(emptyAddress());
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeeCount, setEmployeeCount] = useState(0);
  const [primaryContact, setPrimaryContact] = useState<ContactInfo>(emptyContact());
  const [currentProvider, setCurrentProvider] = useState<OutgoingProvider>(emptyProvider());
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractValue, setContractValue] = useState(0);
  const [slaTier, setSlaTier] = useState<"standard" | "premium" | "enterprise">("standard");
  const [notes, setNotes] = useState("");

  const canNext = () => {
    switch (step) {
      case 0: return companyName.trim() !== "";
      case 1: return primaryContact.firstName.trim() !== "" && primaryContact.email.trim() !== "";
      case 2: return true;
      case 3: return true;
      default: return true;
    }
  };

  const handleCreate = () => {
    const client = addClient({
      companyName,
      primaryContact,
      additionalContacts: [],
      address,
      website,
      industry,
      employeeCount,
      currentProvider,
      contractStartDate,
      contractValue,
      slaTier,
      notes,
    });
    router.push(`/clients/${client.id}`);
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <PageHeader title="New Client Onboarding" description="Walk through the steps to onboard a new client" />

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  i < step
                    ? "bg-green-500 text-white"
                    : i === step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < step ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`ml-2 text-xs font-medium whitespace-nowrap ${i <= step ? "text-gray-900" : "text-gray-400"}`}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
            <div>
              <label className={labelCls}>Company Name *</label>
              <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Street Address</label>
                <input className={inputCls} value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="123 Main St" />
              </div>
              <div>
                <label className={labelCls}>Suite / Unit</label>
                <input className={inputCls} value={address.suite} onChange={(e) => setAddress({ ...address, suite: e.target.value })} placeholder="Suite 100" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>City</label>
                <input className={inputCls} value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="New York" />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input className={inputCls} value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="NY" />
              </div>
              <div>
                <label className={labelCls}>Zip Code</label>
                <input className={inputCls} value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} placeholder="10001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Website</label>
                <input className={inputCls} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
              </div>
              <div>
                <label className={labelCls}>Industry</label>
                <input className={inputCls} value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Healthcare, Legal, etc." />
              </div>
            </div>
            <div>
              <label className={labelCls}>Number of Employees</label>
              <input className={inputCls} type="number" value={employeeCount || ""} onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 0)} placeholder="50" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Primary Contact</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>First Name *</label>
                <input className={inputCls} value={primaryContact.firstName} onChange={(e) => setPrimaryContact({ ...primaryContact, firstName: e.target.value })} placeholder="John" />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input className={inputCls} value={primaryContact.lastName} onChange={(e) => setPrimaryContact({ ...primaryContact, lastName: e.target.value })} placeholder="Smith" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input className={inputCls} type="email" value={primaryContact.email} onChange={(e) => setPrimaryContact({ ...primaryContact, email: e.target.value })} placeholder="john@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={primaryContact.phone} onChange={(e) => setPrimaryContact({ ...primaryContact, phone: e.target.value })} placeholder="(555) 123-4567" />
              </div>
              <div>
                <label className={labelCls}>Title</label>
                <input className={inputCls} value={primaryContact.title} onChange={(e) => setPrimaryContact({ ...primaryContact, title: e.target.value })} placeholder="IT Director" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Outgoing Provider</h2>
            <p className="text-sm text-gray-500 mb-4">Enter details about the current/outgoing IT provider if applicable.</p>
            <div>
              <label className={labelCls}>Provider Name</label>
              <input className={inputCls} value={currentProvider.name} onChange={(e) => setCurrentProvider({ ...currentProvider, name: e.target.value })} placeholder="Previous MSP Inc." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Contact Name</label>
                <input className={inputCls} value={currentProvider.contactName} onChange={(e) => setCurrentProvider({ ...currentProvider, contactName: e.target.value })} placeholder="Jane Doe" />
              </div>
              <div>
                <label className={labelCls}>Contact Email</label>
                <input className={inputCls} type="email" value={currentProvider.contactEmail} onChange={(e) => setCurrentProvider({ ...currentProvider, contactEmail: e.target.value })} placeholder="jane@previousmsp.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Contact Phone</label>
                <input className={inputCls} value={currentProvider.contactPhone} onChange={(e) => setCurrentProvider({ ...currentProvider, contactPhone: e.target.value })} placeholder="(555) 987-6543" />
              </div>
              <div>
                <label className={labelCls}>Contract End Date</label>
                <input className={inputCls} type="date" value={currentProvider.contractEndDate} onChange={(e) => setCurrentProvider({ ...currentProvider, contractEndDate: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Services They Provided</label>
              <textarea className={inputCls} rows={3} value={currentProvider.servicesProvided} onChange={(e) => setCurrentProvider({ ...currentProvider, servicesProvided: e.target.value })} placeholder="Helpdesk, network management, backups..." />
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea className={inputCls} rows={2} value={currentProvider.notes} onChange={(e) => setCurrentProvider({ ...currentProvider, notes: e.target.value })} placeholder="Any additional notes about the transition..." />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Contract Start Date</label>
                <input className={inputCls} type="date" value={contractStartDate} onChange={(e) => setContractStartDate(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Monthly Contract Value ($)</label>
                <input className={inputCls} type="number" value={contractValue || ""} onChange={(e) => setContractValue(parseInt(e.target.value) || 0)} placeholder="5000" />
              </div>
            </div>
            <div>
              <label className={labelCls}>SLA Tier</label>
              <select className={inputCls} value={slaTier} onChange={(e) => setSlaTier(e.target.value as "standard" | "premium" | "enterprise")}>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea className={inputCls} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes about this client..." />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Review & Create</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Company</h3>
                <p className="text-sm text-gray-900">{companyName}</p>
                {address.street && <p className="text-sm text-gray-500">{address.street}{address.suite ? `, ${address.suite}` : ""}</p>}
                {address.city && <p className="text-sm text-gray-500">{address.city}, {address.state} {address.zip}</p>}
                {website && <p className="text-sm text-gray-500">{website}</p>}
                {industry && <p className="text-sm text-gray-500">Industry: {industry}</p>}
                {employeeCount > 0 && <p className="text-sm text-gray-500">Employees: {employeeCount}</p>}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Primary Contact</h3>
                <p className="text-sm text-gray-900">{primaryContact.firstName} {primaryContact.lastName}</p>
                <p className="text-sm text-gray-500">{primaryContact.email}</p>
                {primaryContact.phone && <p className="text-sm text-gray-500">{primaryContact.phone}</p>}
                {primaryContact.title && <p className="text-sm text-gray-500">{primaryContact.title}</p>}
              </div>
              {currentProvider.name && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Outgoing Provider</h3>
                  <p className="text-sm text-gray-900">{currentProvider.name}</p>
                  {currentProvider.contactName && <p className="text-sm text-gray-500">Contact: {currentProvider.contactName}</p>}
                  {currentProvider.contactEmail && <p className="text-sm text-gray-500">{currentProvider.contactEmail}</p>}
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Contract</h3>
                {contractStartDate && <p className="text-sm text-gray-500">Start: {contractStartDate}</p>}
                {contractValue > 0 && <p className="text-sm text-gray-500">Value: ${contractValue}/mo</p>}
                <p className="text-sm text-gray-500">SLA: {slaTier.charAt(0).toUpperCase() + slaTier.slice(1)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">A default onboarding checklist will be created automatically.</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleCreate}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Create Client
          </button>
        )}
      </div>
    </div>
  );
}

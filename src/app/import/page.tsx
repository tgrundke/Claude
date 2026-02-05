"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { parseCsvFile, CONNECTWISE_FIELD_MAP, APP_FIELD_OPTIONS } from "@/lib/csv-parser";
import { useClients } from "@/hooks/use-clients";
import { generateId } from "@/lib/id";
import type { CsvParseResult, CsvColumnMapping } from "@/types/import";

const STEPS = ["Upload CSV", "Map Columns", "Preview", "Import"];

export default function ImportPage() {
  const router = useRouter();
  const { addClient } = useClients();
  const [step, setStep] = useState(0);
  const [csvData, setCsvData] = useState<CsvParseResult | null>(null);
  const [mappings, setMappings] = useState<CsvColumnMapping[]>([]);
  const [importedIds, setImportedIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    try {
      const result = await parseCsvFile(file);
      setCsvData(result);

      // Auto-map columns
      const autoMappings: CsvColumnMapping[] = result.headers.map((header) => {
        const autoField = CONNECTWISE_FIELD_MAP[header] || "";
        return {
          csvColumn: header,
          appField: autoField,
          sampleValues: result.rows.slice(0, 3).map((r) => r[header] || ""),
          isRequired: false,
          isMapped: autoField !== "",
        };
      });
      setMappings(autoMappings);
      setStep(1);
    } catch (err) {
      setErrors([`Failed to parse CSV: ${err instanceof Error ? err.message : "Unknown error"}`]);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".csv")) {
        handleFile(file);
      } else {
        setErrors(["Please upload a .csv file"]);
      }
    },
    [handleFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const updateMapping = (csvColumn: string, appField: string) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.csvColumn === csvColumn ? { ...m, appField, isMapped: appField !== "" } : m
      )
    );
  };

  const handleImport = () => {
    if (!csvData) return;
    const ids: string[] = [];
    const importErrors: string[] = [];

    csvData.rows.forEach((row, idx) => {
      const fieldMap: Record<string, string> = {};
      mappings.forEach((m) => {
        if (m.appField && m.isMapped) {
          fieldMap[m.appField] = row[m.csvColumn] || "";
        }
      });

      if (!fieldMap.companyName) {
        importErrors.push(`Row ${idx + 1}: Missing company name, skipped.`);
        return;
      }

      try {
        const client = addClient({
          companyName: fieldMap.companyName || "",
          primaryContact: {
            id: generateId(),
            firstName: fieldMap.contactFirstName || "",
            lastName: fieldMap.contactLastName || "",
            email: fieldMap.contactEmail || "",
            phone: fieldMap.contactPhone || "",
            title: fieldMap.contactTitle || "",
            isPrimary: true,
          },
          additionalContacts: [],
          address: {
            street: fieldMap.street || "",
            suite: fieldMap.suite || "",
            city: fieldMap.city || "",
            state: fieldMap.state || "",
            zip: fieldMap.zip || "",
          },
          website: fieldMap.website || "",
          industry: fieldMap.industry || "",
          employeeCount: parseInt(fieldMap.employeeCount) || 0,
          currentProvider: {
            name: fieldMap.currentProviderName || "",
            contactName: fieldMap.currentProviderContact || "",
            contactEmail: fieldMap.currentProviderEmail || "",
            contactPhone: fieldMap.currentProviderPhone || "",
            contractEndDate: "",
            servicesProvided: "",
            notes: fieldMap.notes || "",
          },
          contractStartDate: "",
          contractValue: 0,
          slaTier: "standard",
          notes: fieldMap.notes || "",
        });
        ids.push(client.id);
      } catch (err) {
        importErrors.push(`Row ${idx + 1}: ${err instanceof Error ? err.message : "Import failed"}`);
      }
    });

    setImportedIds(ids);
    setErrors(importErrors);
    setStep(3);
  };

  const companyNameMapped = mappings.some((m) => m.appField === "companyName" && m.isMapped);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Import Data"
        description="Import client data from ConnectWise, Halo, or other CRM/PSA systems"
      />

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                i < step ? "bg-green-500 text-white" : i === step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {i < step ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span className={`ml-2 text-xs font-medium ${i <= step ? "text-gray-900" : "text-gray-400"}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Step 0: Upload */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
            <p className="text-sm text-gray-500 mb-6">
              Export your client data from ConnectWise, Halo, or any PSA tool as a CSV file and upload it here.
              We will auto-detect common column names from ConnectWise.
            </p>
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              <p className="text-sm text-gray-600 mb-2">Drag and drop your CSV file here, or</p>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">
                Browse Files
                <input type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
              </label>
            </div>
            {errors.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                {errors.map((e, i) => <p key={i} className="text-sm text-red-600">{e}</p>)}
              </div>
            )}
          </div>
        )}

        {/* Step 1: Map Columns */}
        {step === 1 && csvData && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Map Columns</h2>
            <p className="text-sm text-gray-500 mb-4">
              We detected {csvData.headers.length} columns and {csvData.rowCount} rows.
              Map each CSV column to the corresponding field in our system. Green highlights show auto-detected mappings.
            </p>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {mappings.map((mapping) => (
                <div key={mapping.csvColumn} className={`flex items-center gap-4 p-3 rounded-lg ${mapping.isMapped ? "bg-green-50" : "bg-gray-50"}`}>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{mapping.csvColumn}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {mapping.sampleValues.filter(Boolean).join(", ") || "No sample data"}
                    </p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  <select
                    value={mapping.appField}
                    onChange={(e) => updateMapping(mapping.csvColumn, e.target.value)}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {APP_FIELD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(0)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Back</button>
              <button onClick={() => setStep(2)} disabled={!companyNameMapped} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                Next: Preview
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && csvData && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Preview Import</h2>
            <p className="text-sm text-gray-500 mb-4">
              Showing first {Math.min(10, csvData.rowCount)} of {csvData.rowCount} rows. Review the data below before importing.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-left">#</th>
                    {mappings.filter((m) => m.isMapped).map((m) => (
                      <th key={m.csvColumn} className="px-3 py-2 text-xs font-semibold text-gray-500 text-left">
                        {APP_FIELD_OPTIONS.find((o) => o.value === m.appField)?.label || m.appField}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.rows.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="px-3 py-2 text-xs text-gray-400">{idx + 1}</td>
                      {mappings.filter((m) => m.isMapped).map((m) => (
                        <td key={m.csvColumn} className="px-3 py-2 text-sm text-gray-700">{row[m.csvColumn]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Back</button>
              <button onClick={handleImport} className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                Import {csvData.rowCount} Records
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Import Complete</h2>
            <p className="text-sm text-gray-500 mb-4">
              Successfully imported {importedIds.length} client{importedIds.length !== 1 ? "s" : ""}.
            </p>
            {errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                <p className="text-sm font-medium text-yellow-800 mb-2">Warnings:</p>
                {errors.map((e, i) => <p key={i} className="text-xs text-yellow-700">{e}</p>)}
              </div>
            )}
            <div className="flex justify-center gap-3">
              <button onClick={() => router.push("/clients")} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                View Clients
              </button>
              <button onClick={() => { setStep(0); setCsvData(null); setMappings([]); setImportedIds([]); setErrors([]); }} className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50">
                Import More
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

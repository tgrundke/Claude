import Papa from "papaparse";
import type { CsvParseResult } from "@/types/import";

export function parseCsvFile(file: File): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];
        resolve({
          headers,
          rows,
          rowCount: rows.length,
        });
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

export const CONNECTWISE_FIELD_MAP: Record<string, string> = {
  "Company Name": "companyName",
  "CompanyName": "companyName",
  "company_name": "companyName",
  "Company": "companyName",
  "Account Name": "companyName",
  "Contact First Name": "contactFirstName",
  "First Name": "contactFirstName",
  "FirstName": "contactFirstName",
  "Contact Last Name": "contactLastName",
  "Last Name": "contactLastName",
  "LastName": "contactLastName",
  "Email": "contactEmail",
  "Contact Email": "contactEmail",
  "E-mail": "contactEmail",
  "Phone": "contactPhone",
  "Contact Phone": "contactPhone",
  "Phone Number": "contactPhone",
  "Title": "contactTitle",
  "Contact Title": "contactTitle",
  "Job Title": "contactTitle",
  "Address": "street",
  "Street": "street",
  "Address Line 1": "street",
  "City": "city",
  "State": "state",
  "Province": "state",
  "Zip": "zip",
  "Zip Code": "zip",
  "Postal Code": "zip",
  "Website": "website",
  "Web Site": "website",
  "URL": "website",
  "Industry": "industry",
  "Market": "industry",
  "Number of Employees": "employeeCount",
  "Employees": "employeeCount",
  "Employee Count": "employeeCount",
};

export const APP_FIELD_OPTIONS = [
  { value: "", label: "-- Skip --" },
  { value: "companyName", label: "Company Name" },
  { value: "contactFirstName", label: "Contact First Name" },
  { value: "contactLastName", label: "Contact Last Name" },
  { value: "contactEmail", label: "Contact Email" },
  { value: "contactPhone", label: "Contact Phone" },
  { value: "contactTitle", label: "Contact Title" },
  { value: "street", label: "Street Address" },
  { value: "suite", label: "Suite / Unit" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "zip", label: "Zip Code" },
  { value: "website", label: "Website" },
  { value: "industry", label: "Industry" },
  { value: "employeeCount", label: "Employee Count" },
  { value: "currentProviderName", label: "Current Provider Name" },
  { value: "currentProviderContact", label: "Current Provider Contact" },
  { value: "currentProviderEmail", label: "Current Provider Email" },
  { value: "currentProviderPhone", label: "Current Provider Phone" },
  { value: "notes", label: "Notes" },
];

export interface CsvColumnMapping {
  csvColumn: string;
  appField: string;
  sampleValues: string[];
  isRequired: boolean;
  isMapped: boolean;
}

export interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors: ImportError[];
  importedClientIds: string[];
}

export interface ImportError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
}

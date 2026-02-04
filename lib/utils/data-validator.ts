import { ExcelRow } from '@/lib/types/sales';
import { Entity } from '@/lib/types/sales';

// No strict required columns - we'll accept any columns that exist
// But we'll validate that we have at least some data
const MINIMUM_COLUMNS = ['Invoice date', 'Invoice', 'Currency'];
const VALID_ENTITIES: Entity[] = ['HQ', 'USA', 'BWA', 'Vietnam', 'Healthcare', 'Korot'];

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function validateExcelData(data: ExcelRow[], entity: Entity): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Check if entity is valid
  if (!VALID_ENTITIES.includes(entity)) {
    errors.push({
      row: 0,
      field: 'entity',
      message: `Invalid entity: ${entity}. Must be one of: ${VALID_ENTITIES.join(', ')}`,
    });
  }

  // Check if data is empty
  if (data.length === 0) {
    errors.push({
      row: 0,
      field: 'data',
      message: 'Excel file is empty or has no data rows',
    });
    return { valid: false, errors };
  }

  // Check if we have at least some basic columns
  const firstRow = data[0];
  const hasBasicData = firstRow && (
    'Invoice date' in firstRow || 'Date' in firstRow ||
    'Invoice' in firstRow || 'Invoice Amount' in firstRow
  );
  
  if (!hasBasicData) {
    errors.push({
      row: 0,
      field: 'columns',
      message: 'Excel file does not contain expected sales data columns. Please check the file format.',
    });
  }

  // Basic validation - check if invoice date is valid (if present)
  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 because Excel rows start at 1 and we have header

    // Validate Invoice date (if present)
    const invoiceDate = row['Invoice date'] || row.Date;
    if (invoiceDate) {
      const date = parseDate(invoiceDate);
      if (!date || isNaN(date.getTime())) {
        errors.push({
          row: rowNum,
          field: 'Invoice date',
          message: `Invalid date format: ${invoiceDate}`,
        });
      }
    }

    // Validate Due date (if present)
    if (row['Due date']) {
      const date = parseDate(row['Due date']);
      if (date && isNaN(date.getTime())) {
        errors.push({
          row: rowNum,
          field: 'Due date',
          message: `Invalid due date format: ${row['Due date']}`,
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

function parseDate(value: string | number): Date | null {
  if (typeof value === 'number') {
    // Excel date serial number
    return XLSXDateToJSDate(value);
  }
  
  if (typeof value === 'string') {
    // Try parsing as ISO date or common formats
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
}

function XLSXDateToJSDate(serial: number): Date {
  // Excel date serial number to JavaScript Date
  // Excel epoch is January 1, 1900, JavaScript epoch is January 1, 1970
  const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
  const jsDate = new Date(excelEpoch.getTime() + serial * 86400000);
  return jsDate;
}

function parseNumber(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned);
  }
  
  return NaN;
}

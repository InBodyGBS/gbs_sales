import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { parseExcelBuffer } from '@/lib/utils/excel-parser';
import { validateExcelData } from '@/lib/utils/data-validator';
import { getQuarterFromDate, getYearFromDate } from '@/lib/utils/formatters';
import { Entity, ExcelRow } from '@/lib/types/sales';
import * as XLSX from 'xlsx';

const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '104857600'); // 100MB

function parseDate(value: string | number): Date {
  if (typeof value === 'number') {
    // Excel date serial number
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + value * 86400000);
  }
  return new Date(value);
}

function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entity = formData.get('entity') as Entity;

    console.log('Upload request received:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      entity: entity,
    });

    if (!file) {
      console.error('No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!entity || entity === 'All') {
      console.error('Invalid entity:', entity);
      return NextResponse.json(
        { error: 'Please select a specific entity (HQ, USA, BWA, Vietnam, Healthcare, or Korot)' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      console.error('File size exceeds limit:', file.size, MAX_FILE_SIZE);
      return NextResponse.json(
        { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Check file type - be more flexible with file extensions
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.xlsx', '.xls'];
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/excel',
      'application/x-excel',
    ];
    
    if (!hasValidExtension && !validTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type, fileName);
      return NextResponse.json(
        { 
          error: 'Invalid file type. Please upload .xlsx or .xls file',
          details: `File type: ${file.type || 'unknown'}, File name: ${file.name}`
        },
        { status: 400 }
      );
    }

    // Parse Excel file
    const arrayBuffer = await file.arrayBuffer();
    const excelData = parseExcelBuffer(arrayBuffer);

    // Validate data
    if (!excelData || excelData.length === 0) {
      console.error('Excel file is empty or could not be parsed');
      return NextResponse.json(
        { error: 'Excel file is empty or could not be parsed. Please check the file format.' },
        { status: 400 }
      );
    }

    const validation = validateExcelData(excelData, entity);
    if (!validation.valid) {
      console.error('Data validation failed:', validation.errors);
      return NextResponse.json(
        { 
          error: 'Data validation failed',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Generate batch ID
    const batchId = crypto.randomUUID();

    // Transform data for database
    const supabase = await createServiceClient();
    
    // First, verify the table exists and get column info
    const { data: tableInfo, error: tableError } = await supabase
      .from('sales_data')
      .select('*')
      .limit(0);
    
    if (tableError && tableError.code === '42P01') {
      return NextResponse.json(
        { 
          error: 'Database table not found',
          details: 'The sales_data table does not exist. Please run the database schema from database/schema.sql in your Supabase SQL Editor.',
          hint: 'Go to Supabase Dashboard → SQL Editor → New Query → Paste schema.sql content → Run'
        },
        { status: 500 }
      );
    }

    // Helper function to convert Excel column names to DB column names (snake_case)
    const toSnakeCase = (str: string): string => {
      return str
        .replace(/\s+/g, '_')
        .replace(/-/g, '_')
        .replace(/[()]/g, '')
        .replace(/\//g, '_')
        .toLowerCase();
    };

    // Helper function to get value from row (case-insensitive)
    const getValue = (row: ExcelRow, columnName: string): any => {
      // Try exact match first
      if (row[columnName] !== undefined) return row[columnName];
      
      // Try case-insensitive match
      const keys = Object.keys(row);
      const matchedKey = keys.find(k => k.toLowerCase() === columnName.toLowerCase());
      if (matchedKey) return row[matchedKey];
      
      return null;
    };

    // Helper function to parse date
    const parseDateValue = (value: any): Date | null => {
      if (!value) return null;
      if (value instanceof Date) return value;
      if (typeof value === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + value * 86400000);
      }
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    };

    const salesData = excelData
      .map((row: ExcelRow, index: number) => {
        try {
          // Get invoice date for year/quarter calculation
          const invoiceDateValue = getValue(row, 'Invoice date') || getValue(row, 'Date');
          const invoiceDate = parseDateValue(invoiceDateValue);
          
          let year: number | null = null;
          let quarter: string | null = null;
          
          if (invoiceDate) {
            year = getYearFromDate(invoiceDate);
            quarter = getQuarterFromDate(invoiceDate);
          }

          // Build data object with all original columns
          const dbRow: any = {
            // Added columns
            entity,
            year,
            quarter,
            upload_batch_id: batchId,
          };

          // Map all original Excel columns to DB columns
          const columnMapping: { [excelCol: string]: string } = {
            'Sales Type': 'sales_type',
            'Invoice': 'invoice',
            'Voucher': 'voucher',
            'Invoice date': 'invoice_date',
            'Pool': 'pool',
            'Supply method': 'supply_method',
            'Sub Method - 1': 'sub_method_1',
            'Sub Method - 2': 'sub_method_2',
            'Sub Method - 3': 'sub_method_3',
            'Application': 'application',
            'Industry': 'industry',
            'Sub Industry - 1': 'sub_industry_1',
            'Sub Industry - 2': 'sub_industry_2',
            'General group': 'general_group',
            'Sales order': 'sales_order',
            'Account number': 'account_number',
            'Name': 'name',
            'Name2': 'name2',
            'Customer invoice account': 'customer_invoice_account',
            'Invoice account': 'invoice_account',
            'Group': 'group',
            'Currency': 'currency',
            'Invoice Amount': 'invoice_amount',
            'Invoice Amount_MST': 'invoice_amount_mst',
            'Sales tax amount': 'sales_tax_amount',
            'The sales tax amount, in the accounting currency': 'sales_tax_amount_accounting',
            'Total for invoice': 'total_for_invoice',
            'Total_MST': 'total_mst',
            'Open balance': 'open_balance',
            'Due date': 'due_date',
            'Sales tax group': 'sales_tax_group',
            'Payment type': 'payment_type',
            'Terms of payment': 'terms_of_payment',
            'Payment schedule': 'payment_schedule',
            'Method of payment': 'method_of_payment',
            'Posting profile': 'posting_profile',
            'Delivery terms': 'delivery_terms',
            'H_DIM_WK': 'h_dim_wk',
            'H_WK_NAME': 'h_wk_name',
            'H_DIM_CC': 'h_dim_cc',
            'H DIM NAME': 'h_dim_name',
            'Line number': 'line_number',
            'Street': 'street',
            'City': 'city',
            'State': 'state',
            'ZIP/postal code': 'zip_postal_code',
            'Final ZipCode': 'final_zipcode',
            'Region': 'region',
            'Product type': 'product_type',
            'Item group': 'item_group',
            'Category': 'category',
            'Model': 'model',
            'Item number': 'item_number',
            'Product name': 'product_name',
            'Text': 'text',
            'Warehouse': 'warehouse',
            'Name3': 'name3',
            'Quantity': 'quantity',
            'Inventory unit': 'inventory_unit',
            'Price unit': 'price_unit',
            'Net amount': 'net_amount',
            'Line Amount_MST': 'line_amount_mst',
            'Sales tax group2': 'sales_tax_group2',
            'TaxItemGroup': 'tax_item_group',
            'Mode of delivery': 'mode_of_delivery',
            'Dlv Detail': 'dlv_detail',
            'Online order': 'online_order',
            'Sales channel': 'sales_channel',
            'Promotion': 'promotion',
            '2nd Sales': 'second_sales',
            'Personnel number': 'personnel_number',
            'WORKERNAME': 'worker_name',
            'L DIM NAME': 'l_dim_name',
            'L_DIM_WK': 'l_dim_wk',
            'L_WK_NAME': 'l_wk_name',
            'L_DIM_CC': 'l_dim_cc',
            'Main account': 'main_account',
            'Account name': 'account_name',
            'Rebate': 'rebate',
            'Description': 'description',
            'Country': 'country',
            'CREATEDDATE': 'created_date',
            'CREATEDBY': 'created_by',
            'Exception': 'exception',
            'With collection agency': 'with_collection_agency',
            'Credit rating': 'credit_rating',
          };

          // Process each column
          Object.keys(columnMapping).forEach((excelCol) => {
            const dbCol = columnMapping[excelCol];
            let value = getValue(row, excelCol);
            
            // Handle date columns
            if (dbCol.includes('_date') || dbCol === 'created_date') {
              const dateValue = parseDateValue(value);
              dbRow[dbCol] = dateValue ? dateValue.toISOString().split('T')[0] : null;
            }
            // Handle numeric columns
            else if (dbCol.includes('amount') || dbCol.includes('balance') || 
                     dbCol.includes('quantity') || dbCol === 'line_number' || 
                     dbCol === 'price_unit' || dbCol === 'rebate') {
              const numValue = parseNumber(value);
              dbRow[dbCol] = isNaN(numValue) ? null : numValue;
            }
            // Handle text columns
            else {
              dbRow[dbCol] = value !== null && value !== undefined ? String(value).trim() : null;
            }
          });

          return dbRow;
        } catch (err) {
          console.error(`Error processing row ${index + 2}:`, err);
          return null;
        }
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    // Check for duplicates and insert
    let rowsInserted = 0;
    const errors: string[] = [];

    // Try batch insert first (more efficient)
    if (salesData.length > 0) {
      try {
        const { data, error: batchError } = await supabase
          .from('sales_data')
          .insert(salesData)
          .select();

        if (batchError) {
          console.error('Batch insert error:', batchError);
          
          // If batch insert fails, try individual inserts to get specific errors
          console.log('Falling back to individual inserts...');
          for (let i = 0; i < salesData.length; i++) {
            const row = salesData[i];
            try {
              const { error: insertError } = await supabase
                .from('sales_data')
                .insert(row);
              
              if (insertError) {
                errors.push(`Row ${i + 2}: ${insertError.message}${insertError.details ? ` (${insertError.details})` : ''}${insertError.hint ? ` - Hint: ${insertError.hint}` : ''}`);
                console.error(`Row ${i + 2} insert error:`, insertError);
              } else {
                rowsInserted++;
              }
            } catch (err) {
              errors.push(`Row ${i + 2}: ${(err as Error).message}`);
            }
          }
        } else {
          rowsInserted = data?.length || 0;
        }
      } catch (err) {
        console.error('Insert error:', err);
        errors.push(`Failed to insert data: ${(err as Error).message}`);
      }
    }

    // Save upload history
    const { error: historyError } = await supabase.from('upload_history').insert({
      batch_id: batchId,
      entity,
      file_name: file.name,
      file_path: null, // Can be updated if storing in Supabase Storage
      rows_uploaded: rowsInserted,
      status: errors.length > 0 ? 'partial' : 'success',
      error_message: errors.length > 0 ? errors.join('; ') : null,
    });

    if (historyError) {
      console.error('Error saving upload history:', historyError);
    }

    return NextResponse.json({
      success: true,
      batchId,
      rowsInserted,
      totalRows: salesData.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = (error as Error).message || 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to process upload',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  }
}

// app/api/upload/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { createServiceClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// Route Segment Config for larger file processing
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  let batchId = '';
  
  try {
    console.log('📥 File processing request received');

    // 1. Parse request body
    const body = await request.json();
    const { storagePath, entity, fileName } = body;

    console.log('📄 Storage Path:', storagePath);
    console.log('🏢 Entity:', entity);
    console.log('📝 File Name:', fileName);

    // 2. Validate inputs
    if (!storagePath || !entity || !fileName) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 3. Create Supabase client
    const supabase = createServiceClient();

    // 4. Download file from Supabase Storage
    console.log('📥 Downloading file from storage...');
    const { downloadFile } = await import('@/lib/utils/storage');
    
    let fileData: Blob;
    try {
      fileData = await downloadFile(storagePath);
      console.log('✅ File downloaded successfully');
    } catch (downloadError) {
      console.error('❌ Download error:', downloadError);
      return NextResponse.json(
        { success: false, error: 'Failed to download file from storage', details: (downloadError as Error).message },
        { status: 500 }
      );
    }

    // 5. Convert Blob to ArrayBuffer and parse Excel
    const arrayBuffer = await fileData.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Parsed ${jsonData.length} rows from Excel`);

    if (jsonData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Excel file is empty' },
        { status: 400 }
      );
    }

    // 6. Create batch ID
    batchId = uuidv4();

    // 7. Record upload in history
    const { error: historyError } = await supabase
      .from('upload_history')
      .insert({
        batch_id: batchId,
        entity: entity,
        file_name: fileName,
        storage_path: storagePath,
        rows_uploaded: jsonData.length,
        status: 'processing',
      });

    if (historyError) {
      console.error('❌ History insert error:', historyError);
    }

    // 8. Transform and insert data
    console.log('🔄 Transforming data...');
    
    const columnMap: { [key: string]: string } = {
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
      'Group': 'group_name',
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

    function parseDate(value: any): string | null {
      if (!value) return null;
      
      if (typeof value === 'number') {
        const date = XLSX.SSF.parse_date_code(value);
        if (date) {
          return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
        }
      }
      
      if (typeof value === 'string') {
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0];
        }
      }
      
      return null;
    }

    function getQuarter(dateStr: string | null): string | null {
      if (!dateStr) return null;
      const month = parseInt(dateStr.split('-')[1]);
      if (month >= 1 && month <= 3) return 'Q1';
      if (month >= 4 && month <= 6) return 'Q2';
      if (month >= 7 && month <= 9) return 'Q3';
      if (month >= 10 && month <= 12) return 'Q4';
      return null;
    }

    const transformedData = jsonData.map((row: any) => {
      const transformed: any = {
        entity: entity,
        upload_batch_id: batchId,
      };

      for (const [excelCol, dbCol] of Object.entries(columnMap)) {
        const value = row[excelCol];
        
        if (dbCol === 'invoice_date' || dbCol === 'due_date' || dbCol === 'created_date') {
          transformed[dbCol] = parseDate(value);
          
          if (dbCol === 'invoice_date' && transformed[dbCol]) {
            transformed.year = parseInt(transformed[dbCol].split('-')[0]);
            transformed.quarter = getQuarter(transformed[dbCol]);
          }
        } else if (value !== undefined && value !== null && value !== '') {
          transformed[dbCol] = value;
        }
      }

      return transformed;
    });

    // 9. Insert data in batches
    const BATCH_SIZE = 1000;
    let totalInserted = 0;
    const errors: any[] = [];

    for (let i = 0; i < transformedData.length; i += BATCH_SIZE) {
      const batch = transformedData.slice(i, i + BATCH_SIZE);
      
      const { data, error: insertError } = await supabase
        .from('sales_data')
        .insert(batch)
        .select();

      if (insertError) {
        console.error(`❌ Batch ${i / BATCH_SIZE + 1} error:`, insertError);
        errors.push({
          batch: i / BATCH_SIZE + 1,
          error: insertError.message,
        });
      } else {
        totalInserted += batch.length;
        console.log(`✅ Inserted batch ${i / BATCH_SIZE + 1}: ${batch.length} rows`);
      }
    }

    // 10. Update upload history
    await supabase
      .from('upload_history')
      .update({
        status: errors.length > 0 ? 'partial' : 'success',
        rows_uploaded: totalInserted,
        error_message: errors.length > 0 ? JSON.stringify(errors) : null,
      })
      .eq('batch_id', batchId);

    console.log(`✅ Upload complete: ${totalInserted} rows inserted`);

    return NextResponse.json({
      success: true,
      rowsInserted: totalInserted,
      batchId,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('❌ Processing error:', error);
    
    if (batchId) {
      const supabase = createServiceClient();
      await supabase
        .from('upload_history')
        .update({
          status: 'failed',
          error_message: (error as Error).message,
        })
        .eq('batch_id', batchId);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process file',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

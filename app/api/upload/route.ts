// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { createServiceClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// Route Segment Config for larger file uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes (Vercel Pro allows up to 300s)

export async function POST(request: NextRequest) {
  let batchId = '';
  
  try {
    console.log('📥 Upload request received');

    // 1. Supabase 클라이언트 생성
    const supabase = createServiceClient();

    // 2. FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entity = formData.get('entity') as string;

    console.log('📄 File:', file?.name, '| Size:', file?.size);
    console.log('🏢 Entity:', entity);

    // 3. 기본 검증
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!entity) {
      return NextResponse.json(
        { success: false, error: 'No entity selected' },
        { status: 400 }
      );
    }

    const validEntities = ['HQ', 'USA', 'BWA', 'Vietnam', 'Healthcare', 'Korot'];
    if (!validEntities.includes(entity)) {
      return NextResponse.json(
        { success: false, error: `Invalid entity: ${entity}` },
        { status: 400 }
      );
    }

    // 4. 파일 크기 제한 (50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // 5. 파일 타입 검증
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only .xlsx and .xls files are allowed.' },
        { status: 400 }
      );
    }

    // 6. 파일을 Buffer로 변환
    console.log('🔄 Converting file to buffer...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7. 엑셀 파일 파싱
    console.log('📊 Parsing Excel file...');
    let workbook: XLSX.WorkBook;
    
    try {
      workbook = XLSX.read(buffer, { 
        type: 'buffer',
        cellDates: true,
        cellNF: false,
        cellText: false
      });
    } catch (parseError: any) {
      console.error('❌ Excel parsing error:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to parse Excel file',
          details: parseError.message 
        },
        { status: 400 }
      );
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false,
      defval: null
    });

    console.log(`✅ Parsed ${rawData.length} rows from sheet: ${sheetName}`);

    if (rawData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Excel file is empty' },
        { status: 400 }
      );
    }

    // 8. 데이터 변환
    console.log('🔄 Transforming data...');
    const transformedData: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNum = i + 2;

      try {
        // Invoice date 파싱
        let invoiceDate = null;
        let year = null;
        let quarter = null;

        if (row['Invoice date']) {
          try {
            const dateValue = row['Invoice date'];
            let parsedDate: Date;

            if (typeof dateValue === 'number') {
              // Excel serial date
              const excelEpoch = new Date(1899, 11, 30);
              parsedDate = new Date(excelEpoch.getTime() + dateValue * 86400000);
            } else if (typeof dateValue === 'string') {
              parsedDate = new Date(dateValue);
            } else if (dateValue instanceof Date) {
              parsedDate = dateValue;
            } else {
              throw new Error('Invalid date type');
            }

            if (!isNaN(parsedDate.getTime())) {
              invoiceDate = parsedDate.toISOString().split('T')[0];
              year = parsedDate.getFullYear();
              quarter = `Q${Math.floor(parsedDate.getMonth() / 3) + 1}`;
            }
          } catch (dateError) {
            console.warn(`Row ${rowNum}: Invalid invoice date: ${row['Invoice date']}`);
          }
        }

        // Due date 파싱
        let dueDate = null;
        if (row['Due date']) {
          try {
            const dateValue = row['Due date'];
            let parsedDate: Date;

            if (typeof dateValue === 'number') {
              const excelEpoch = new Date(1899, 11, 30);
              parsedDate = new Date(excelEpoch.getTime() + dateValue * 86400000);
            } else if (typeof dateValue === 'string') {
              parsedDate = new Date(dateValue);
            } else if (dateValue instanceof Date) {
              parsedDate = dateValue;
            } else {
              throw new Error('Invalid date type');
            }

            if (!isNaN(parsedDate.getTime())) {
              dueDate = parsedDate.toISOString().split('T')[0];
            }
          } catch (dateError) {
            console.warn(`Row ${rowNum}: Invalid due date: ${row['Due date']}`);
          }
        }

        // CREATEDDATE 파싱
        let createdDate = null;
        if (row['CREATEDDATE']) {
          try {
            const dateValue = row['CREATEDDATE'];
            let parsedDate: Date;

            if (typeof dateValue === 'number') {
              const excelEpoch = new Date(1899, 11, 30);
              parsedDate = new Date(excelEpoch.getTime() + dateValue * 86400000);
            } else if (typeof dateValue === 'string') {
              parsedDate = new Date(dateValue);
            } else if (dateValue instanceof Date) {
              parsedDate = dateValue;
            } else {
              throw new Error('Invalid date type');
            }

            if (!isNaN(parsedDate.getTime())) {
              createdDate = parsedDate.toISOString();
            }
          } catch (dateError) {
            console.warn(`Row ${rowNum}: Invalid created date`);
          }
        }

        // 숫자 필드 파싱 함수
        const parseNumber = (value: any): number | null => {
          if (value === null || value === undefined || value === '') return null;
          const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : parseFloat(value);
          return isNaN(num) ? null : num;
        };

        // 데이터 매핑
        const mappedRow = {
          entity,
          year,
          quarter,
          
          // Original Excel columns
          sales_type: row['Sales Type'] || null,
          invoice: row['Invoice'] || null,
          voucher: row['Voucher'] || null,
          invoice_date: invoiceDate,
          pool: row['Pool'] || null,
          supply_method: row['Supply method'] || null,
          sub_method_1: row['Sub Method - 1'] || null,
          sub_method_2: row['Sub Method - 2'] || null,
          sub_method_3: row['Sub Method - 3'] || null,
          application: row['Application'] || null,
          industry: row['Industry'] || null,
          sub_industry_1: row['Sub Industry - 1'] || null,
          sub_industry_2: row['Sub Industry - 2'] || null,
          general_group: row['General group'] || null,
          sales_order: row['Sales order'] || null,
          account_number: row['Account number'] || null,
          name: row['Name'] || null,
          name2: row['Name2'] || null,
          customer_invoice_account: row['Customer invoice account'] || null,
          invoice_account: row['Invoice account'] || null,
          group: row['Group'] || null,
          currency: row['Currency'] || null,
          invoice_amount: parseNumber(row['Invoice Amount']),
          invoice_amount_mst: parseNumber(row['Invoice Amount_MST']),
          sales_tax_amount: parseNumber(row['Sales tax amount']),
          sales_tax_amount_accounting: parseNumber(row['The sales tax amount, in the accounting currency']),
          total_for_invoice: parseNumber(row['Total for invoice']),
          total_mst: parseNumber(row['Total_MST']),
          open_balance: parseNumber(row['Open balance']),
          due_date: dueDate,
          sales_tax_group: row['Sales tax group'] || null,
          payment_type: row['Payment type'] || null,
          terms_of_payment: row['Terms of payment'] || null,
          payment_schedule: row['Payment schedule'] || null,
          method_of_payment: row['Method of payment'] || null,
          posting_profile: row['Posting profile'] || null,
          delivery_terms: row['Delivery terms'] || null,
          h_dim_wk: row['H_DIM_WK'] || null,
          h_wk_name: row['H_WK_NAME'] || null,
          h_dim_cc: row['H_DIM_CC'] || null,
          h_dim_name: row['H_DIM_NAME'] || null,
          line_number: parseNumber(row['Line number']),
          street: row['Street'] || null,
          city: row['City'] || null,
          state: row['State'] || null,
          zip_postal_code: row['ZIP/postal code'] || null,
          final_zipcode: row['Final ZipCode'] || null,
          region: row['Region'] || null,
          product_type: row['Product type'] || null,
          item_group: row['Item group'] || null,
          category: row['Category'] || null,
          model: row['Model'] || null,
          item_number: row['Item number'] || null,
          product_name: row['Product name'] || null,
          text: row['Text'] || null,
          warehouse: row['Warehouse'] || null,
          name3: row['Name3'] || null,
          quantity: parseNumber(row['Quantity']),
          inventory_unit: row['Inventory unit'] || null,
          price_unit: parseNumber(row['Price unit']),
          net_amount: parseNumber(row['Net amount']),
          line_amount_mst: parseNumber(row['Line Amount_MST']),
          sales_tax_group2: row['Sales tax group2'] || null,
          tax_item_group: row['TaxItemGroup'] || null,
          mode_of_delivery: row['Mode of delivery'] || null,
          dlv_detail: row['Dlv Detail'] || null,
          online_order: row['Online order'] || null,
          sales_channel: row['Sales channel'] || null,
          promotion: row['Promotion'] || null,
          second_sales: row['2nd Sales'] || null,
          personnel_number: row['Personnel number'] || null,
          worker_name: row['WORKERNAME'] || null,
          l_dim_name: row['L_DIM_NAME'] || null,
          l_dim_wk: row['L_DIM_WK'] || null,
          l_wk_name: row['L_WK_NAME'] || null,
          l_dim_cc: row['L_DIM_CC'] || null,
          main_account: row['Main account'] || null,
          account_name: row['Account name'] || null,
          rebate: parseNumber(row['Rebate']),
          description: row['Description'] || null,
          country: row['Country'] || null,
          created_date: createdDate,
          created_by: row['CREATEDBY'] || null,
          exception: row['Exception'] || null,
          with_collection_agency: row['With collection agency'] || null,
          credit_rating: row['Credit rating'] || null,
          
          upload_batch_id: batchId
        };

        transformedData.push(mappedRow);

      } catch (validationError: any) {
        errors.push(`Row ${rowNum}: ${validationError.message}`);
        if (errors.length >= 10) {
          errors.push('... (showing first 10 errors)');
          break;
        }
      }
    }

    if (errors.length > 0 && transformedData.length === 0) {
      console.error('❌ All data validation failed:', errors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Data validation failed',
          details: errors
        },
        { status: 400 }
      );
    }

    console.log(`✅ Transformed ${transformedData.length} rows (${errors.length} errors skipped)`);

    // 9. Batch ID 생성
    batchId = uuidv4();
    console.log('🆔 Batch ID:', batchId);

    // Batch ID를 모든 행에 추가
    transformedData.forEach(row => row.upload_batch_id = batchId);

    // 10. Upload history 기록
    console.log('💾 Creating upload history...');
    const { error: historyError } = await supabase
      .from('upload_history')
      .insert({
        batch_id: batchId,
        entity,
        file_name: file.name,
        rows_uploaded: transformedData.length,
        status: 'processing'
      });

    if (historyError) {
      console.error('❌ Upload history error:', historyError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database error',
          details: historyError.message
        },
        { status: 500 }
      );
    }

    // 11. 데이터 삽입
    console.log('💾 Inserting data...');
    const CHUNK_SIZE = 500; // 한 번에 500개씩
    let totalInserted = 0;

    for (let i = 0; i < transformedData.length; i += CHUNK_SIZE) {
      const chunk = transformedData.slice(i, i + CHUNK_SIZE);
      const { error: insertError } = await supabase
        .from('sales_data')
        .insert(chunk);

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        
        // 실패 시 history 업데이트
        await supabase
          .from('upload_history')
          .update({ 
            status: 'failed',
            error_message: insertError.message 
          })
          .eq('batch_id', batchId);

        return NextResponse.json(
          { 
            success: false, 
            error: 'Database insert failed',
            details: insertError.message,
            hint: insertError.hint
          },
          { status: 500 }
        );
      }

      totalInserted += chunk.length;
      console.log(`✅ Inserted ${totalInserted}/${transformedData.length} rows`);
    }

    // 12. Upload history 완료 업데이트
    await supabase
      .from('upload_history')
      .update({ status: 'completed' })
      .eq('batch_id', batchId);

    console.log('✅ Upload completed successfully');

    // 13. 성공 응답
    return NextResponse.json({
      success: true,
      batchId,
      rowsInserted: totalInserted,
      rowsSkipped: errors.length,
      entity,
      fileName: file.name
    });

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    
    if (batchId) {
      try {
        const supabase = createServiceClient();
        await supabase
          .from('upload_history')
          .update({ 
            status: 'failed',
            error_message: error.message 
          })
          .eq('batch_id', batchId);
      } catch (updateError) {
        console.error('Failed to update history:', updateError);
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// GET: 업로드 히스토리 조회
export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('upload_history')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ history: data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
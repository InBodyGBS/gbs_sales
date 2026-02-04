import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entity = searchParams.get('entity');
    const year = searchParams.get('year');
    const format = searchParams.get('format') || 'csv';

    if (format !== 'csv') {
      return NextResponse.json(
        { error: 'Only CSV format is supported' },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    let query = supabase.from('sales_data').select('*');

    if (entity && entity !== 'All') {
      query = query.eq('entity', entity);
    }

    if (year) {
      query = query.eq('year', parseInt(year));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sales data', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data to export' },
        { status: 404 }
      );
    }

    // Convert to CSV
    const headers = [
      'Entity',
      'Sale Date',
      'Year',
      'Quarter',
      'Category',
      'Product',
      'Region',
      'Currency',
      'Sales Amount',
      'Quantity',
    ];

    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        [
          row.entity,
          row.sale_date,
          row.year,
          row.quarter,
          row.category || '',
          `"${row.product.replace(/"/g, '""')}"`,
          row.region || '',
          row.currency,
          row.sales_amount,
          row.quantity,
        ].join(',')
      ),
    ];

    const csv = csvRows.join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="sales-export-${entity || 'all'}-${year || 'all'}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Failed to export data', details: (error as Error).message },
      { status: 500 }
    );
  }
}

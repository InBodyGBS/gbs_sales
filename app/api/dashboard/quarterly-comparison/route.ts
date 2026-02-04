import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const entities = searchParams.get('entities')?.split(',').filter(Boolean) || [];

    if (!year) {
      return NextResponse.json(
        { error: 'Year parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();
    const currentYear = parseInt(year);
    const previousYear = currentYear - 1;

    // Get current year data
    let currentQuery = supabase
      .from('sales_data')
      .select('quarter, line_amount_mst, invoice_amount_mst, invoice_amount');

    currentQuery = currentQuery.eq('year', currentYear);

    if (entities.length > 0 && !entities.includes('All')) {
      currentQuery = currentQuery.in('entity', entities);
    }

    const { data: currentData, error: currentError } = await currentQuery;

    // Get previous year data
    let prevQuery = supabase
      .from('sales_data')
      .select('quarter, line_amount_mst, invoice_amount_mst, invoice_amount');

    prevQuery = prevQuery.eq('year', previousYear);

    if (entities.length > 0 && !entities.includes('All')) {
      prevQuery = prevQuery.in('entity', entities);
    }

    const { data: prevData, error: prevError } = await prevQuery;

    if (currentError || prevError) {
      return NextResponse.json(
        { error: 'Failed to fetch quarterly comparison', details: currentError?.message || prevError?.message },
        { status: 500 }
      );
    }

    // Group by quarter for current year
    const currentQuarterMap = new Map<string, number>();
    (currentData || []).forEach((row) => {
      const quarter = row.quarter || 'Q1';
      const amount = parseFloat(row.line_amount_mst || row.invoice_amount_mst || row.invoice_amount || 0);
      currentQuarterMap.set(quarter, (currentQuarterMap.get(quarter) || 0) + (isNaN(amount) ? 0 : amount));
    });

    // Group by quarter for previous year
    const prevQuarterMap = new Map<string, number>();
    (prevData || []).forEach((row) => {
      const quarter = row.quarter || 'Q1';
      const amount = parseFloat(row.line_amount_mst || row.invoice_amount_mst || row.invoice_amount || 0);
      prevQuarterMap.set(quarter, (prevQuarterMap.get(quarter) || 0) + (isNaN(amount) ? 0 : amount));
    });

    // Build result
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const result = quarters.map((q) => ({
      quarter: q,
      currentYear: currentQuarterMap.get(q) || 0,
      previousYear: prevQuarterMap.get(q) || 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Quarterly comparison API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quarterly comparison', details: (error as Error).message },
      { status: 500 }
    );
  }
}

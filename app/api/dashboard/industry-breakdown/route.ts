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

    let query = supabase
      .from('sales_data')
      .select('industry, line_amount_mst, invoice_amount_mst, invoice_amount');

    query = query.eq('year', parseInt(year));

    if (entities.length > 0 && !entities.includes('All')) {
      query = query.in('entity', entities);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch industry breakdown', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Group by industry
    const industryMap = new Map<string, { amount: number; transactions: number }>();

    data.forEach((row) => {
      const industry = row.industry || 'Unknown';
      const amount = parseFloat(row.line_amount_mst || row.invoice_amount_mst || row.invoice_amount || 0);

      if (!industryMap.has(industry)) {
        industryMap.set(industry, { amount: 0, transactions: 0 });
      }

      const industryData = industryMap.get(industry)!;
      industryData.amount += isNaN(amount) ? 0 : amount;
      industryData.transactions += 1;
    });

    const result = Array.from(industryMap.entries())
      .map(([industry, data]) => ({
        industry,
        amount: data.amount,
        transactions: data.transactions,
      }))
      .sort((a, b) => b.amount - a.amount);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Industry breakdown API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch industry breakdown', details: (error as Error).message },
      { status: 500 }
    );
  }
}

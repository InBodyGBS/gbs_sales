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

    // Note: fg_classification column may not exist yet
    // For now, we'll check if it exists or use a placeholder
    let query = supabase
      .from('sales_data')
      .select('fg_classification, line_amount_mst, invoice_amount_mst, invoice_amount');

    query = query.eq('year', parseInt(year));

    if (entities.length > 0 && !entities.includes('All')) {
      query = query.in('entity', entities);
    }

    const { data, error } = await query;

    if (error) {
      // If fg_classification doesn't exist, return empty or default data
      if (error.code === '42703') {
        return NextResponse.json([
          { fg: 'FG', amount: 0, percentage: 0 },
          { fg: 'NonFG', amount: 0, percentage: 0 },
        ]);
      }
      return NextResponse.json(
        { error: 'Failed to fetch FG distribution', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json([
        { fg: 'FG', amount: 0, percentage: 0 },
        { fg: 'NonFG', amount: 0, percentage: 0 },
      ]);
    }

    // Group by FG classification
    const fgMap = new Map<string, number>();

    data.forEach((row) => {
      const fg = row.fg_classification || 'NonFG';
      const amount = parseFloat(row.line_amount_mst || row.invoice_amount_mst || row.invoice_amount || 0);
      
      fgMap.set(fg, (fgMap.get(fg) || 0) + (isNaN(amount) ? 0 : amount));
    });

    const total = Array.from(fgMap.values()).reduce((sum, val) => sum + val, 0);

    const result = Array.from(fgMap.entries())
      .map(([fg, amount]) => ({
        fg,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return NextResponse.json(result);
  } catch (error) {
    console.error('FG distribution API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FG distribution', details: (error as Error).message },
      { status: 500 }
    );
  }
}

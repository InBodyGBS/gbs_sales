import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '10');
    const entities = searchParams.get('entities')?.split(',').filter(Boolean) || [];

    if (!year) {
      return NextResponse.json(
        { error: 'Year parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Select country column (exists in schema) and amount columns
    let query = supabase
      .from('sales_data')
      .select('country, state, city, entity, line_amount_mst, invoice_amount_mst, invoice_amount');

    query = query.eq('year', parseInt(year));

    if (entities.length > 0 && !entities.includes('All')) {
      query = query.in('entity', entities);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Country sales query error:', error);
      // If column doesn't exist, return empty array instead of error
      if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist')) {
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { error: 'Failed to fetch country sales', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Group by country (use country, state, city, or entity as fallback)
    const countryMap = new Map<string, number>();

    data.forEach((row: any) => {
      // Use country if available, otherwise fallback to state, city, or entity
      const country = row.country || row.state || row.city || row.entity || 'Unknown';
      const amount = parseFloat(row.line_amount_mst || row.invoice_amount_mst || row.invoice_amount || 0);
      
      countryMap.set(country, (countryMap.get(country) || 0) + (isNaN(amount) ? 0 : amount));
    });

    const result = Array.from(countryMap.entries())
      .map(([country, amount]) => ({
        country,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Country sales API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch country sales', details: (error as Error).message },
      { status: 500 }
    );
  }
}

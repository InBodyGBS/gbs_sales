import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entity = searchParams.get('entity');

    const supabase = await createServiceClient();
    
    let query = supabase
      .from('sales_data')
      .select('year')
      .order('year', { ascending: false });

    if (entity && entity !== 'All') {
      query = query.eq('entity', entity);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch years', details: error.message },
        { status: 500 }
      );
    }

    // Get unique years
    const years = Array.from(new Set(data?.map((d) => d.year) || []))
      .sort((a, b) => b - a);

    return NextResponse.json({ years });
  } catch (error) {
    console.error('Years API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch years', details: (error as Error).message },
      { status: 500 }
    );
  }
}

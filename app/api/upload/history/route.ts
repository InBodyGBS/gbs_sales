import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entity = searchParams.get('entity');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = await createServiceClient();

    let query = supabase
      .from('upload_history')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(limit);

    if (entity && entity !== 'All') {
      query = query.eq('entity', entity);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch upload history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch upload history', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ history: data || [] });
  } catch (error) {
    console.error('Upload history API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upload history', details: (error as Error).message },
      { status: 500 }
    );
  }
}

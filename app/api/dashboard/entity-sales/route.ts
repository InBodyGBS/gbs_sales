import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');

    if (!year) {
      return NextResponse.json(
        { error: 'Year parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from('sales_data')
      .select('entity, line_amount_mst, quantity, invoice_amount_mst, invoice_amount')
      .eq('year', parseInt(year));

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sales data', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Group by entity
    const entityMap = new Map<string, { amount: number; qty: number }>();

    data.forEach((row) => {
      const entity = row.entity;
      if (!entityMap.has(entity)) {
        entityMap.set(entity, { amount: 0, qty: 0 });
      }

      const entityData = entityMap.get(entity)!;
      const amount = parseFloat(row.line_amount_mst || row.invoice_amount_mst || row.invoice_amount || 0);
      const qty = parseFloat(row.quantity || 0);
      
      entityData.amount += isNaN(amount) ? 0 : amount;
      entityData.qty += isNaN(qty) ? 0 : qty;
    });

    const result = Array.from(entityMap.entries())
      .map(([entity, data]) => ({
        entity,
        amount: data.amount,
        qty: data.qty,
      }))
      .sort((a, b) => b.amount - a.amount);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Entity sales API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entity sales', details: (error as Error).message },
      { status: 500 }
    );
  }
}

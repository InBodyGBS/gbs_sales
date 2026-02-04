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

    let query = supabase
      .from('sales_data')
      .select('product_name, product, line_amount_mst, quantity, invoice_amount_mst, invoice_amount');

    query = query.eq('year', parseInt(year));

    if (entities.length > 0 && !entities.includes('All')) {
      query = query.in('entity', entities);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch top products', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Group by product
    const productMap = new Map<string, { amount: number; qty: number }>();

    data.forEach((row) => {
      const product = row.product_name || row.product || 'Unknown';
      const amount = parseFloat(row.line_amount_mst || row.invoice_amount_mst || row.invoice_amount || 0);
      const qty = parseFloat(row.quantity || 0);

      if (!productMap.has(product)) {
        productMap.set(product, { amount: 0, qty: 0 });
      }

      const productData = productMap.get(product)!;
      productData.amount += isNaN(amount) ? 0 : amount;
      productData.qty += isNaN(qty) ? 0 : qty;
    });

    const result = Array.from(productMap.entries())
      .map(([product, data]) => ({
        product,
        amount: data.amount,
        qty: data.qty,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Top products API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top products', details: (error as Error).message },
      { status: 500 }
    );
  }
}

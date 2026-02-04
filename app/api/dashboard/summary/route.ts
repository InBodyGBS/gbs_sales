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

    // Build query - use sales_data table (vw_sales_enriched will be created later)
    let query = supabase
      .from('sales_data')
      .select('line_amount_mst, quantity, invoice_amount_mst, invoice_amount');

    // Filter by year
    query = query.eq('year', parseInt(year));

    // Filter by entities
    if (entities.length > 0 && !entities.includes('All')) {
      query = query.in('entity', entities);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sales data', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        totalAmount: 0,
        totalQty: 0,
        avgAmount: 0,
        totalTransactions: 0,
        comparison: {
          amount: 0,
          qty: 0,
        },
      });
    }

    // Calculate metrics
    const totalAmount = data.reduce((sum, row) => {
      const amount = parseFloat(row.line_amount_mst || row.invoice_amount_mst || row.invoice_amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const totalQty = data.reduce((sum, row) => {
      const qty = parseFloat(row.quantity || 0);
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);

    const avgAmount = data.length > 0 ? totalAmount / data.length : 0;
    const totalTransactions = data.length;

    // Get previous period data for comparison
    const prevYear = parseInt(year) - 1;
    let prevQuery = supabase
      .from('sales_data')
      .select('line_amount_mst, quantity, invoice_amount_mst, invoice_amount')
      .eq('year', prevYear);

    if (entities.length > 0 && !entities.includes('All')) {
      prevQuery = prevQuery.in('entity', entities);
    }

    const { data: prevData } = await prevQuery;

    const prevTotalAmount = prevData?.reduce((sum, row) => {
      const amount = parseFloat(row.line_amount_mst || row.invoice_amount_mst || row.invoice_amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0) || 0;

    const prevTotalQty = prevData?.reduce((sum, row) => {
      const qty = parseFloat(row.quantity || 0);
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0) || 0;

    // Calculate percentage change
    const amountChange = prevTotalAmount > 0 
      ? ((totalAmount - prevTotalAmount) / prevTotalAmount) * 100 
      : 0;
    const qtyChange = prevTotalQty > 0 
      ? ((totalQty - prevTotalQty) / prevTotalQty) * 100 
      : 0;

    return NextResponse.json({
      totalAmount,
      totalQty,
      avgAmount,
      totalTransactions,
      comparison: {
        amount: amountChange,
        qty: qtyChange,
      },
    });
  } catch (error) {
    console.error('Dashboard summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary', details: (error as Error).message },
      { status: 500 }
    );
  }
}

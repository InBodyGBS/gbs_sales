import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { SalesSummary, QuarterlySummary } from '@/lib/types/sales';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entity = searchParams.get('entity');
    const year = searchParams.get('year');

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
      return NextResponse.json({
        quarterly: [],
        summary: {
          total_sales: 0,
          total_quantity: 0,
          average_transaction: 0,
          active_products: 0,
        },
      });
    }

    // Calculate summary - use actual column names from database
    const totalSales = data.reduce((sum, row) => {
      const amount = parseFloat(row.invoice_amount || row.sales_amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalQuantity = data.reduce((sum, row) => {
      const qty = parseFloat(row.quantity || 0);
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);
    
    const averageTransaction = data.length > 0 ? totalSales / data.length : 0;
    const activeProducts = new Set(
      data.map((row) => row.product_name || row.product || '').filter(Boolean)
    ).size;

    // Calculate quarterly data
    const quarterlyMap = new Map<string, { sales: number; quantity: number }>();
    
    data.forEach((row) => {
      const quarter = row.quarter;
      if (!quarter) return;
      
      if (!quarterlyMap.has(quarter)) {
        quarterlyMap.set(quarter, { sales: 0, quantity: 0 });
      }
      const quarterData = quarterlyMap.get(quarter)!;
      const amount = parseFloat(row.invoice_amount || row.sales_amount || 0);
      const qty = parseFloat(row.quantity || 0);
      quarterData.sales += isNaN(amount) ? 0 : amount;
      quarterData.quantity += isNaN(qty) ? 0 : qty;
    });

    const quarterly: QuarterlySummary[] = ['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
      const data = quarterlyMap.get(q) || { sales: 0, quantity: 0 };
      return {
        quarter: q as 'Q1' | 'Q2' | 'Q3' | 'Q4',
        sales_amount: data.sales,
        quantity: data.quantity,
      };
    });

    const summary: SalesSummary = {
      total_sales: totalSales,
      total_quantity: totalQuantity,
      average_transaction: averageTransaction,
      active_products: activeProducts,
      quarterly,
    };

    return NextResponse.json({ quarterly, summary });
  } catch (error) {
    console.error('Sales summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales summary', details: (error as Error).message },
      { status: 500 }
    );
  }
}

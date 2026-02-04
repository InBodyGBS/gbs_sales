import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { SalesBreakdown } from '@/lib/types/sales';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entity = searchParams.get('entity');
    const year = searchParams.get('year');
    const categories = searchParams.get('categories')?.split(',') || [];
    const regions = searchParams.get('regions')?.split(',') || [];
    const currencies = searchParams.get('currencies')?.split(',') || [];

    const supabase = await createServiceClient();

    let query = supabase.from('sales_data').select('*');

    if (entity && entity !== 'All') {
      query = query.eq('entity', entity);
    }

    if (year) {
      query = query.eq('year', parseInt(year));
    }

    if (categories.length > 0) {
      query = query.in('category', categories);
    }

    if (regions.length > 0) {
      query = query.in('region', regions);
    }

    if (currencies.length > 0) {
      query = query.in('currency', currencies);
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
        categoryData: [],
        productData: [],
        regionData: [],
        currencyData: [],
        trendData: [],
      });
    }

    // Category breakdown
    const categoryMap = new Map<string, { sales: number; quantity: number }>();
    data.forEach((row) => {
      const cat = row.category || 'Uncategorized';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, { sales: 0, quantity: 0 });
      }
      const catData = categoryMap.get(cat)!;
      const amount = parseFloat(row.invoice_amount || row.sales_amount || 0);
      const qty = parseFloat(row.quantity || 0);
      catData.sales += isNaN(amount) ? 0 : amount;
      catData.quantity += isNaN(qty) ? 0 : qty;
    });
    const categoryData = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        sales_amount: data.sales,
        quantity: data.quantity,
      }))
      .sort((a, b) => b.sales_amount - a.sales_amount);

    // Product breakdown (Top 10)
    const productMap = new Map<string, { sales: number; quantity: number }>();
    data.forEach((row) => {
      const product = row.product_name || row.product || 'Unknown';
      if (!productMap.has(product)) {
        productMap.set(product, { sales: 0, quantity: 0 });
      }
      const prodData = productMap.get(product)!;
      const amount = parseFloat(row.invoice_amount || row.sales_amount || 0);
      const qty = parseFloat(row.quantity || 0);
      prodData.sales += isNaN(amount) ? 0 : amount;
      prodData.quantity += isNaN(qty) ? 0 : qty;
    });
    const productData = Array.from(productMap.entries())
      .map(([product, data]) => ({
        product,
        sales_amount: data.sales,
        quantity: data.quantity,
      }))
      .sort((a, b) => b.sales_amount - a.sales_amount)
      .slice(0, 10);

    // Region breakdown
    const regionMap = new Map<string, { sales: number; quantity: number }>();
    data.forEach((row) => {
      const region = row.region || 'Unknown';
      if (!regionMap.has(region)) {
        regionMap.set(region, { sales: 0, quantity: 0 });
      }
      const regData = regionMap.get(region)!;
      const amount = parseFloat(row.invoice_amount || row.sales_amount || 0);
      const qty = parseFloat(row.quantity || 0);
      regData.sales += isNaN(amount) ? 0 : amount;
      regData.quantity += isNaN(qty) ? 0 : qty;
    });
    const regionData = Array.from(regionMap.entries())
      .map(([region, data]) => ({
        region,
        sales_amount: data.sales,
        quantity: data.quantity,
      }))
      .sort((a, b) => b.sales_amount - a.sales_amount);

    // Currency breakdown
    const currencyMap = new Map<string, number>();
    data.forEach((row) => {
      const currency = row.currency || 'Unknown';
      const amount = parseFloat(row.invoice_amount || row.sales_amount || 0);
      currencyMap.set(currency, (currencyMap.get(currency) || 0) + (isNaN(amount) ? 0 : amount));
    });
    const currencyData = Array.from(currencyMap.entries())
      .map(([currency, sales_amount]) => ({
        currency,
        sales_amount,
      }))
      .sort((a, b) => b.sales_amount - a.sales_amount);

    // Trend data (by quarter)
    const trendMap = new Map<string, { sales: number; quantity: number }>();
    data.forEach((row) => {
      const quarter = `${row.year}-${row.quarter}`;
      if (!trendMap.has(quarter)) {
        trendMap.set(quarter, { sales: 0, quantity: 0 });
      }
      const trendData = trendMap.get(quarter)!;
      const amount = parseFloat(row.invoice_amount || row.sales_amount || 0);
      const qty = parseFloat(row.quantity || 0);
      trendData.sales += isNaN(amount) ? 0 : amount;
      trendData.quantity += isNaN(qty) ? 0 : qty;
    });
    const trendData = Array.from(trendMap.entries())
      .map(([quarter, data]) => ({
        quarter,
        sales_amount: data.sales,
        quantity: data.quantity,
      }))
      .sort((a, b) => a.quarter.localeCompare(b.quarter));

    const breakdown: SalesBreakdown = {
      categoryData,
      productData,
      regionData,
      currencyData,
      trendData,
    };

    return NextResponse.json(breakdown);
  } catch (error) {
    console.error('Sales breakdown API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales breakdown', details: (error as Error).message },
      { status: 500 }
    );
  }
}

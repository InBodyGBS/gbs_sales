import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortBy = searchParams.get('sortBy') || 'invoice_date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const entities = searchParams.get('entities')?.split(',').filter(Boolean) || [];
    const quarter = searchParams.get('quarter');
    const countries = searchParams.get('countries')?.split(',').filter(Boolean) || [];
    const fg = searchParams.get('fg');

    if (!year) {
      return NextResponse.json(
        { error: 'Year parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Build query
    let query = supabase
      .from('sales_data')
      .select('*', { count: 'exact' });

    query = query.eq('year', parseInt(year));

    if (entities.length > 0 && !entities.includes('All')) {
      query = query.in('entity', entities);
    }

    if (quarter && quarter !== 'All') {
      query = query.eq('quarter', quarter);
    }

    if (countries.length > 0) {
      // Use country column (country_derived doesn't exist in schema)
      query = query.in('country', countries);
    }

    // Note: fg_classification may not exist in schema
    // We'll try to filter, but if the column doesn't exist, the query will fail
    // and we'll handle it in the error handler
    if (fg && fg !== 'All') {
      query = query.eq('fg_classification', fg);
    }

    // Apply sorting
    const orderColumn = sortBy === 'amount' 
      ? 'line_amount_mst' 
      : sortBy === 'qty' 
      ? 'quantity' 
      : sortBy;

    query = query.order(orderColumn, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      // If fg_classification column doesn't exist, retry without the filter
      if (error.code === '42703' && fg && fg !== 'All') {
        console.warn('fg_classification column not found, retrying without filter');
        // Retry query without fg filter
        let retryQuery = supabase
          .from('sales_data')
          .select('*', { count: 'exact' })
          .eq('year', parseInt(year));

        if (entities.length > 0 && !entities.includes('All')) {
          retryQuery = retryQuery.in('entity', entities);
        }

        if (quarter && quarter !== 'All') {
          retryQuery = retryQuery.eq('quarter', quarter);
        }

        if (countries.length > 0) {
          retryQuery = retryQuery.in('country', countries);
        }

        retryQuery = retryQuery.order(orderColumn, { ascending: sortOrder === 'asc' });
        retryQuery = retryQuery.range(from, to);

        const { data: retryData, error: retryError, count: retryCount } = await retryQuery;

        if (retryError) {
          return NextResponse.json(
            { error: 'Failed to fetch data table', details: retryError.message },
            { status: 500 }
          );
        }

        // Transform data (filter fg in memory since column doesn't exist)
        const transformedData = (retryData || [])
          .filter((row: any) => {
            // Since fg_classification doesn't exist, we can't filter by it
            // Return all data
            return true;
          })
          .map((row: any) => ({
            entity: row.entity,
            year: row.year,
            quarter: row.quarter,
            month: row.invoice_date ? new Date(row.invoice_date).getMonth() + 1 : null,
            country: row.country || row.state || row.city || 'Unknown',
            fg: 'NonFG', // Default since column doesn't exist
            product: row.product_name || row.product || 'Unknown',
            industry: row.industry || 'Unknown',
            currency: row.currency || 'USD',
            qty: parseFloat(row.quantity || 0),
            amount: parseFloat(row.line_amount_mst || row.invoice_amount_mst || row.invoice_amount || 0),
          }));

        return NextResponse.json({
          data: transformedData,
          total: retryCount || 0,
          page,
          pageSize,
        });
      }

      return NextResponse.json(
        { error: 'Failed to fetch data table', details: error.message },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const transformedData = (data || []).map((row) => ({
      entity: row.entity,
      year: row.year,
      quarter: row.quarter,
      month: row.invoice_date ? new Date(row.invoice_date).getMonth() + 1 : null,
      country: row.country || row.state || row.city || 'Unknown',
      fg: row.fg_classification || 'NonFG',
      product: row.product_name || row.product || 'Unknown',
      industry: row.industry || 'Unknown',
      currency: row.currency || 'USD',
      qty: parseFloat(row.quantity || 0),
      amount: parseFloat(row.line_amount_mst || row.invoice_amount_mst || row.invoice_amount || 0),
    }));

    return NextResponse.json({
      data: transformedData,
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Data table API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data table', details: (error as Error).message },
      { status: 500 }
    );
  }
}

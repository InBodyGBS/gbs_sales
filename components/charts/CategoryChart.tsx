'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CategoryData } from '@/lib/types/sales';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';

interface CategoryChartProps {
  data: CategoryData[];
  loading?: boolean;
}

export function CategoryChart({ data, loading }: CategoryChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Sales by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Sales by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    category: item.category.length > 15 ? item.category.substring(0, 15) + '...' : item.category,
    sales: item.sales_amount,
    quantity: item.quantity,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Sales by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'sales') {
                  return formatCurrency(value);
                }
                return formatNumber(value);
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="sales"
              fill="hsl(var(--primary))"
              name="Sales Amount"
            />
            <Bar
              yAxisId="right"
              dataKey="quantity"
              fill="hsl(var(--secondary))"
              name="Quantity"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProductData } from '@/lib/types/sales';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';

interface ProductChartProps {
  data: ProductData[];
  loading?: boolean;
}

export function ProductChart({ data, loading }: ProductChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Products</CardTitle>
          <CardDescription>Best performing products</CardDescription>
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
          <CardTitle>Top 10 Products</CardTitle>
          <CardDescription>Best performing products</CardDescription>
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
    product: item.product.length > 20 ? item.product.substring(0, 20) + '...' : item.product,
    sales: item.sales_amount,
    quantity: item.quantity,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Products</CardTitle>
        <CardDescription>Best performing products</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis
              type="category"
              dataKey="product"
              width={90}
              fontSize={12}
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
              dataKey="sales"
              fill="hsl(var(--primary))"
              name="Sales Amount"
            />
            <Bar
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

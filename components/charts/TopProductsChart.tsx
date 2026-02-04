'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';

interface TopProductsData {
  product: string;
  amount: number;
  qty: number;
}

interface TopProductsChartProps {
  data: TopProductsData[];
  loading?: boolean;
}

export function TopProductsChart({ data, loading }: TopProductsChartProps) {
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
    product: item.product.length > 25 ? item.product.substring(0, 25) + '...' : item.product,
    amount: item.amount,
    qty: item.qty,
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
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => formatCurrency(value, 'USD')} />
            <YAxis type="category" dataKey="product" width={110} fontSize={11} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'amount') {
                  return formatCurrency(value, 'USD');
                }
                return formatNumber(value);
              }}
            />
            <Bar dataKey="amount" fill="#3B82F6" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

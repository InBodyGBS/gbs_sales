'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendData } from '@/lib/types/sales';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';

interface TrendChartProps {
  data: TrendData[];
  loading?: boolean;
}

export function TrendChart({ data, loading }: TrendChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Trend</CardTitle>
          <CardDescription>Sales trend over time</CardDescription>
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
          <CardTitle>Quarterly Trend</CardTitle>
          <CardDescription>Sales trend over time</CardDescription>
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
    quarter: item.quarter,
    sales: item.sales_amount,
    quantity: item.quantity,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quarterly Trend</CardTitle>
        <CardDescription>Sales trend over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
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
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Sales Amount"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="quantity"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              name="Quantity"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

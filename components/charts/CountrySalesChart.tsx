'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';

interface CountrySalesData {
  country: string;
  amount: number;
}

interface CountrySalesChartProps {
  data: CountrySalesData[];
  loading?: boolean;
}

export function CountrySalesChart({ data, loading }: CountrySalesChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Country Sales</CardTitle>
          <CardDescription>Top countries by sales</CardDescription>
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
          <CardTitle>Country Sales</CardTitle>
          <CardDescription>Top countries by sales</CardDescription>
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
    country: item.country,
    amount: item.amount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Country Sales</CardTitle>
        <CardDescription>Top countries by sales</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => formatCurrency(value, 'USD')} />
            <YAxis type="category" dataKey="country" width={90} fontSize={12} />
            <Tooltip formatter={(value: number) => formatCurrency(value, 'USD')} />
            <Bar dataKey="amount" fill="#3B82F6" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

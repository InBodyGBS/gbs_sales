'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';

interface EntitySalesData {
  entity: string;
  amount: number;
  qty: number;
}

interface EntitySalesChartProps {
  data: EntitySalesData[];
  loading?: boolean;
}

const ENTITY_COLORS: { [key: string]: string } = {
  HQ: '#3B82F6',
  USA: '#10B981',
  BWA: '#F59E0B',
  Vietnam: '#EF4444',
  Healthcare: '#8B5CF6',
  Korot: '#EC4899',
};

export function EntitySalesChart({ data, loading }: EntitySalesChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entity Sales</CardTitle>
          <CardDescription>Sales by entity</CardDescription>
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
          <CardTitle>Entity Sales</CardTitle>
          <CardDescription>Sales by entity</CardDescription>
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
    entity: item.entity,
    amount: item.amount,
    qty: item.qty,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entity Sales</CardTitle>
        <CardDescription>Sales by entity</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="entity" />
            <YAxis tickFormatter={(value) => formatCurrency(value, 'USD')} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'amount') {
                  return formatCurrency(value, 'USD');
                }
                return formatNumber(value);
              }}
            />
            <Legend />
            <Bar
              dataKey="amount"
              fill="#3B82F6"
              name="Amount"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={ENTITY_COLORS[entry.entity] || '#3B82F6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

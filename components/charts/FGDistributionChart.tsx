'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';

interface FGDistributionData {
  fg: string;
  amount: number;
  percentage: number;
}

interface FGDistributionChartProps {
  data: FGDistributionData[];
  loading?: boolean;
}

const COLORS = {
  FG: '#3B82F6',
  NonFG: '#6B7280',
};

export function FGDistributionChart({ data, loading }: FGDistributionChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>FG vs NonFG</CardTitle>
          <CardDescription>Sales distribution by FG classification</CardDescription>
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
          <CardTitle>FG vs NonFG</CardTitle>
          <CardDescription>Sales distribution by FG classification</CardDescription>
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
    name: item.fg,
    value: item.amount,
    percentage: item.percentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>FG vs NonFG</CardTitle>
        <CardDescription>Sales distribution by FG classification</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value, 'USD')} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

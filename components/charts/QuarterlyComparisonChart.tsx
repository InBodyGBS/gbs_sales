'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';

interface QuarterlyComparisonData {
  quarter: string;
  currentYear: number;
  previousYear: number;
}

interface QuarterlyComparisonChartProps {
  data: QuarterlyComparisonData[];
  currentYear: number;
  loading?: boolean;
}

export function QuarterlyComparisonChart({ data, currentYear, loading }: QuarterlyComparisonChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Comparison</CardTitle>
          <CardDescription>Year-over-year comparison</CardDescription>
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
          <CardTitle>Quarterly Comparison</CardTitle>
          <CardDescription>Year-over-year comparison</CardDescription>
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
    [currentYear.toString()]: item.currentYear,
    [(currentYear - 1).toString()]: item.previousYear,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quarterly Comparison</CardTitle>
        <CardDescription>Year-over-year comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis tickFormatter={(value) => formatCurrency(value, 'USD')} />
            <Tooltip formatter={(value: number) => formatCurrency(value, 'USD')} />
            <Legend />
            <Bar
              dataKey={currentYear.toString()}
              fill="#3B82F6"
              name={`${currentYear}`}
            />
            <Bar
              dataKey={(currentYear - 1).toString()}
              fill="#6B7280"
              name={`${currentYear - 1}`}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

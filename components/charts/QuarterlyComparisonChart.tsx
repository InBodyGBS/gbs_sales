'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatKRW } from '@/lib/utils/formatters';
import { Entity } from '@/lib/types/sales';

interface QuarterlyComparisonData {
  quarter: string;
  currentYear: number;
  previousYear: number;
}

interface QuarterlyComparisonChartProps {
  data: QuarterlyComparisonData[];
  currentYear: number;
  loading?: boolean;
  entity?: Entity;
}

export function QuarterlyComparisonChart({ data, currentYear, loading, entity }: QuarterlyComparisonChartProps) {
  const isKRWEntity = entity && ['HQ', 'Healthcare', 'Korot'].includes(entity);
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

  // Calculate max value for better Y-axis scaling
  const maxValue = Math.max(
    ...chartData.flatMap((d) => [Number(d[currentYear.toString()]) || 0, Number(d[(currentYear - 1).toString()]) || 0]),
  );
  const yAxisDomain = [0, maxValue * 1.1]; // Add 10% padding

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
            <YAxis
              domain={yAxisDomain}
              tickFormatter={(value) => isKRWEntity ? formatKRW(value) : formatCurrency(value, 'USD')}
            />
            <Tooltip
              formatter={(value: number) => isKRWEntity ? formatKRW(value) : formatCurrency(value, 'USD')}
            />
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

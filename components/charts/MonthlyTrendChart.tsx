'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatNumber, formatKRW } from '@/lib/utils/formatters';
import { Entity } from '@/lib/types/sales';

interface MonthlyTrendData {
  month: number;
  amount: number;
  qty: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyTrendData[];
  loading?: boolean;
  entity?: Entity;
}

const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export function MonthlyTrendChart({ data, loading, entity }: MonthlyTrendChartProps) {
  const isKRWEntity = entity && ['HQ', 'Healthcare', 'Korot'].includes(entity);
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
          <CardDescription>Sales trend by month</CardDescription>
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
          <CardTitle>Monthly Trend</CardTitle>
          <CardDescription>Sales trend by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create a map of existing data by month
  const dataMap = new Map(
    data.map((item) => [item.month, { amount: item.amount, qty: item.qty }])
  );

  // Create chart data for all 12 months, filling missing months with 0
  const chartData = monthNames.map((monthName, index) => {
    const month = index + 1;
    const monthData = dataMap.get(month);
    return {
      month: monthName,
      amount: monthData?.amount || 0,
      qty: monthData?.qty || 0,
    };
  });

  // Calculate max amount for better Y-axis scaling
  const maxAmount = Math.max(...chartData.map((d) => d.amount), 0);
  const yAxisDomain = [0, maxAmount * 1.1 || 1]; // Add 10% padding, minimum 1 to avoid domain error

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trend</CardTitle>
        <CardDescription>Sales trend by month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month"
              ticks={monthNames}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            {isKRWEntity ? (
              <>
                <YAxis
                  domain={yAxisDomain}
                  tickFormatter={(value) => formatKRW(value)}
                />
                <Tooltip
                  formatter={(value: number) => formatKRW(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Amount"
                  dot={{ r: 4 }}
                />
              </>
            ) : (
              <>
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  domain={yAxisDomain}
                  tickFormatter={(value) => formatCurrency(value, 'USD')}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'amount') {
                      return formatCurrency(value, 'USD');
                    }
                    return formatNumber(value);
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="amount"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Amount"
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="qty"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Qty"
                  dot={{ r: 4 }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

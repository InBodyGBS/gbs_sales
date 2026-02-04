'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuarterlySummary } from '@/lib/types/sales';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import { Download } from 'lucide-react';
import { Entity } from '@/lib/types/sales';

interface QuarterlyTableProps {
  quarterly: QuarterlySummary[];
  entity: Entity;
  year: string;
  loading?: boolean;
}

export function QuarterlyTable({
  quarterly,
  entity,
  year,
  loading,
}: QuarterlyTableProps) {
  const handleExport = async () => {
    try {
      const url = `/api/export?entity=${entity}&year=${year}&format=csv`;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `sales-export-${entity}-${year}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Summary</CardTitle>
          <CardDescription>Sales data by quarter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSales = quarterly.reduce((sum, q) => sum + q.sales_amount, 0);
  const totalQuantity = quarterly.reduce((sum, q) => sum + q.quantity, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quarterly Summary</CardTitle>
            <CardDescription>Sales data by quarter</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Quarter</th>
                <th className="text-right p-2 font-medium">Sales Amount</th>
                <th className="text-right p-2 font-medium">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {quarterly.map((q) => (
                <tr key={q.quarter} className="border-b">
                  <td className="p-2">{q.quarter}</td>
                  <td className="p-2 text-right">
                    {formatCurrency(q.sales_amount)}
                  </td>
                  <td className="p-2 text-right">
                    {formatNumber(q.quantity)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 font-semibold">
                <td className="p-2">Total</td>
                <td className="p-2 text-right">
                  {formatCurrency(totalSales)}
                </td>
                <td className="p-2 text-right">
                  {formatNumber(totalQuantity)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

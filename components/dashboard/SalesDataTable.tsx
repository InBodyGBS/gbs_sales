'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import { useState, useEffect } from 'react';
import { Entity } from '@/lib/types/sales';

interface TableRow {
  entity: string;
  year: number;
  quarter: string;
  month: number | null;
  country: string;
  fg: string;
  product: string;
  industry: string;
  currency: string;
  qty: number;
  amount: number;
}

interface SalesDataTableProps {
  year: string;
  entities: Entity[];
  quarter: string;
  countries: string[];
  fg: string;
  loading?: boolean;
}

export function SalesDataTable({
  year,
  entities,
  quarter,
  countries,
  fg,
  loading,
}: SalesDataTableProps) {
  const [data, setData] = useState<TableRow[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('amount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const pageSize = 20;

  useEffect(() => {
    if (year) {
      fetchData();
    }
  }, [year, entities, quarter, countries, fg, page, sortBy, sortOrder]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        year,
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortOrder,
        entities: entities.join(','),
        quarter,
        countries: countries.join(','),
        fg,
      });

      const res = await fetch(`/api/dashboard/data-table?${params}`);
      const result = await res.json();

      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('Failed to fetch table data:', error);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(0);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        year,
        entities: entities.join(','),
        quarter,
        countries: countries.join(','),
        fg,
      });

      const res = await fetch(`/api/export?${params}&format=csv`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-export-${year}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      row.entity.toLowerCase().includes(search) ||
      row.product.toLowerCase().includes(search) ||
      row.country.toLowerCase().includes(search) ||
      row.industry.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Data Table</CardTitle>
          <CardDescription>Detailed sales records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sales Data Table</CardTitle>
            <CardDescription>Detailed sales records</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search by entity, product, country, industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th
                    className="text-left p-2 font-medium cursor-pointer hover:bg-muted"
                    onClick={() => handleSort('entity')}
                  >
                    Entity {sortBy === 'entity' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-2 font-medium">Year</th>
                  <th className="text-left p-2 font-medium">Q</th>
                  <th className="text-left p-2 font-medium">Month</th>
                  <th className="text-left p-2 font-medium">Country</th>
                  <th className="text-left p-2 font-medium">FG</th>
                  <th className="text-left p-2 font-medium">Product</th>
                  <th className="text-left p-2 font-medium">Industry</th>
                  <th className="text-left p-2 font-medium">Currency</th>
                  <th
                    className="text-right p-2 font-medium cursor-pointer hover:bg-muted"
                    onClick={() => handleSort('qty')}
                  >
                    Qty {sortBy === 'qty' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-right p-2 font-medium cursor-pointer hover:bg-muted"
                    onClick={() => handleSort('amount')}
                  >
                    Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2">{row.entity}</td>
                    <td className="p-2">{row.year}</td>
                    <td className="p-2">{row.quarter}</td>
                    <td className="p-2">{row.month || '-'}</td>
                    <td className="p-2">{row.country}</td>
                    <td className="p-2">{row.fg}</td>
                    <td className="p-2">{row.product}</td>
                    <td className="p-2">{row.industry}</td>
                    <td className="p-2">{row.currency}</td>
                    <td className="p-2 text-right">{formatNumber(row.qty)}</td>
                    <td className="p-2 text-right">{formatCurrency(row.amount, 'USD')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, total)} of {total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

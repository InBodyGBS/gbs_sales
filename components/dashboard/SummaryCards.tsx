'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesSummary } from '@/lib/types/sales';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import { DollarSign, Package, TrendingUp, Box } from 'lucide-react';

interface SummaryCardsProps {
  summary: SalesSummary | null;
  loading?: boolean;
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const cards = [
    {
      title: 'Total Sales',
      value: formatCurrency(summary.total_sales),
      icon: DollarSign,
      description: 'Total revenue',
    },
    {
      title: 'Total Quantity',
      value: formatNumber(summary.total_quantity),
      icon: Package,
      description: 'Total units sold',
    },
    {
      title: 'Avg Transaction',
      value: formatCurrency(summary.average_transaction),
      icon: TrendingUp,
      description: 'Average per transaction',
    },
    {
      title: 'Active Products',
      value: formatNumber(summary.active_products),
      icon: Box,
      description: 'Unique products',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

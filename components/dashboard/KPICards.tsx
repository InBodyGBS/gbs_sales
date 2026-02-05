'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, TrendingUp, FileText, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency, formatNumber, formatKRW } from '@/lib/utils/formatters';
import { Entity } from '@/lib/types/sales';

interface KPICardsProps {
  data: {
    totalAmount: number;
    totalQty: number;
    avgAmount: number;
    totalTransactions: number;
    comparison: {
      amount: number;
      qty: number;
    };
  } | null;
  loading?: boolean;
  entity?: Entity;
}

export function KPICards({ data, loading, entity }: KPICardsProps) {
  const isKRWEntity = entity && ['HQ', 'Healthcare', 'Korot'].includes(entity);
  
  if (loading) {
    const cardCount = isKRWEntity ? 1 : 4;
    return (
      <div className={`grid gap-4 ${isKRWEntity ? 'md:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        {Array.from({ length: cardCount }).map((_, i) => (
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

  if (!data) {
    return null;
  }

  // For HQ, Healthcare, Korot: only show Total Amount with KRW format (no currency symbol)
  if (isKRWEntity) {
    return (
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKRW(data.totalAmount)}</div>
            <div className={`flex items-center text-xs mt-1 ${data.comparison.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.comparison.amount >= 0 ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              <span>{Math.abs(data.comparison.amount).toFixed(1)}% vs previous period</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total sales amount (KRW)</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For other entities, show all cards
  const cards = [
    {
      title: 'Total Amount',
      value: formatCurrency(data.totalAmount, 'USD'),
      icon: DollarSign,
      comparison: data.comparison.amount,
      description: 'Total sales amount',
    },
    {
      title: 'Total Qty',
      value: formatNumber(data.totalQty) + ' units',
      icon: Package,
      comparison: data.comparison.qty,
      description: 'Total quantity sold',
    },
    {
      title: 'Average Amount',
      value: formatCurrency(data.avgAmount, 'USD'),
      icon: TrendingUp,
      comparison: data.comparison.amount,
      description: 'Average transaction amount',
    },
    {
      title: 'Total Transactions',
      value: formatNumber(data.totalTransactions),
      icon: FileText,
      comparison: null,
      description: 'Number of transactions',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.comparison !== null && card.comparison >= 0;
        
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.comparison !== null && (
                <div className={`flex items-center text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  <span>{Math.abs(card.comparison).toFixed(1)}% vs previous period</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { KPICards } from '@/components/dashboard/KPICards';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { QuarterlyComparisonChart } from '@/components/charts/QuarterlyComparisonChart';
import { FGDistributionChart } from '@/components/charts/FGDistributionChart';
import { EntitySalesChart } from '@/components/charts/EntitySalesChart';
import { CountrySalesChart } from '@/components/charts/CountrySalesChart';
import { TopProductsChart } from '@/components/charts/TopProductsChart';
import { IndustryBreakdownChart } from '@/components/charts/IndustryBreakdownChart';
import { SalesDataTable } from '@/components/dashboard/SalesDataTable';
import { Entity } from '@/lib/types/sales';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [year, setYear] = useState<string>('');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [quarter, setQuarter] = useState<string>('All');
  const [countries, setCountries] = useState<string[]>([]);
  const [fg, setFG] = useState<string>('All');
  
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<any>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [quarterlyComparison, setQuarterlyComparison] = useState<any[]>([]);
  const [fgDistribution, setFGDistribution] = useState<any[]>([]);
  const [entitySales, setEntitySales] = useState<any[]>([]);
  const [countrySales, setCountrySales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [industryBreakdown, setIndustryBreakdown] = useState<any[]>([]);

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (year) {
      fetchAllData();
    }
  }, [year, entities, quarter, countries, fg]);

  const fetchYears = async () => {
    try {
      const res = await fetch('/api/years');
      const data = await res.json();
      if (data.years && data.years.length > 0 && !year) {
        setYear(String(data.years[0]));
      }
    } catch (error) {
      console.error('Failed to fetch years:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const entityParam = entities.length === 0 || entities.length === 6 ? 'All' : entities.join(',');
      
      const [
        kpiRes,
        monthlyRes,
        quarterlyRes,
        fgRes,
        entityRes,
        countryRes,
        productsRes,
        industryRes,
      ] = await Promise.all([
        fetch(`/api/dashboard/summary?year=${year}&entities=${entityParam}`),
        fetch(`/api/dashboard/monthly-trend?year=${year}&entities=${entityParam}`),
        fetch(`/api/dashboard/quarterly-comparison?year=${year}&entities=${entityParam}`),
        fetch(`/api/dashboard/fg-distribution?year=${year}&entities=${entityParam}`),
        fetch(`/api/dashboard/entity-sales?year=${year}`),
        fetch(`/api/dashboard/country-sales?year=${year}&limit=10&entities=${entityParam}`),
        fetch(`/api/dashboard/top-products?year=${year}&limit=10&entities=${entityParam}`),
        fetch(`/api/dashboard/industry-breakdown?year=${year}&entities=${entityParam}`),
      ]);

      if (!kpiRes.ok) throw new Error('Failed to fetch KPI data');
      if (!monthlyRes.ok) throw new Error('Failed to fetch monthly trend');
      if (!quarterlyRes.ok) throw new Error('Failed to fetch quarterly comparison');
      if (!fgRes.ok) throw new Error('Failed to fetch FG distribution');
      if (!entityRes.ok) throw new Error('Failed to fetch entity sales');
      if (!countryRes.ok) throw new Error('Failed to fetch country sales');
      if (!productsRes.ok) throw new Error('Failed to fetch top products');
      if (!industryRes.ok) throw new Error('Failed to fetch industry breakdown');

      setKpiData(await kpiRes.json());
      setMonthlyTrend(await monthlyRes.json());
      setQuarterlyComparison(await quarterlyRes.json());
      setFGDistribution(await fgRes.json());
      setEntitySales(await entityRes.json());
      setCountrySales(await countryRes.json());
      setTopProducts(await productsRes.json());
      setIndustryBreakdown(await industryRes.json());
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!year) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No data available. Please upload sales data first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Analyze sales performance across entities and time periods
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <DashboardFilters
            year={year}
            entities={entities}
            quarter={quarter}
            countries={countries}
            fg={fg}
            onYearChange={setYear}
            onEntitiesChange={setEntities}
            onQuarterChange={setQuarter}
            onCountriesChange={setCountries}
            onFGChange={setFG}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* KPI Cards */}
          <KPICards data={kpiData} loading={loading} />

          {/* Time Trend Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <MonthlyTrendChart data={monthlyTrend} loading={loading} />
            <QuarterlyComparisonChart
              data={quarterlyComparison}
              currentYear={parseInt(year)}
              loading={loading}
            />
          </div>

          {/* FG & Entity Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <FGDistributionChart data={fgDistribution} loading={loading} />
            <EntitySalesChart data={entitySales} loading={loading} />
          </div>

          {/* Geographic & Product Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <CountrySalesChart data={countrySales} loading={loading} />
            <TopProductsChart data={topProducts} loading={loading} />
          </div>

          {/* Industry Analysis Section */}
          <IndustryBreakdownChart data={industryBreakdown} loading={loading} />

          {/* Data Table Section */}
          <SalesDataTable
            year={year}
            entities={entities}
            quarter={quarter}
            countries={countries}
            fg={fg}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

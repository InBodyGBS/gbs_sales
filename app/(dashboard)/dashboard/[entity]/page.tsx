'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ENTITY_DISPLAY_NAMES: Record<Entity, string> = {
  HQ: 'HQ',
  USA: 'USA',
  BWA: 'BWA',
  Vietnam: 'Vietnam',
  Healthcare: 'Healthcare',
  Korot: 'Korot',
  All: 'All',
};

export default function EntityDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const entity = params.entity as Entity;

  const [year, setYear] = useState<string>('');
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

  // Validate entity
  const validEntities: Entity[] = ['HQ', 'USA', 'BWA', 'Vietnam', 'Healthcare', 'Korot'];
  const isValidEntity = validEntities.includes(entity);

  useEffect(() => {
    if (!isValidEntity) {
      toast.error('Invalid entity selected');
      router.push('/dashboard');
      return;
    }
    fetchYears();
  }, [entity, isValidEntity, router]);

  useEffect(() => {
    if (year && isValidEntity) {
      fetchAllData();
    }
  }, [year, entity, quarter, countries, fg, isValidEntity]);

  const fetchYears = async () => {
    try {
      const res = await fetch(`/api/years?entity=${entity}`);
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
      // Use the entity from URL, not from filters
      const entityParam = entity;
      
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

  if (!isValidEntity) {
    return null; // Will redirect
  }

  if (!year) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No data available for {ENTITY_DISPLAY_NAMES[entity]}. Please upload sales data first.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Entity Selection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {ENTITY_DISPLAY_NAMES[entity]} Sales Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Analyze sales performance for {ENTITY_DISPLAY_NAMES[entity]}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <DashboardFilters
            year={year}
            entities={[entity]} // Fixed to current entity
            quarter={quarter}
            countries={countries}
            fg={fg}
            onYearChange={setYear}
            onEntitiesChange={() => {}} // Disabled - entity is fixed from URL
            onQuarterChange={setQuarter}
            onCountriesChange={setCountries}
            onFGChange={setFG}
            disableEntitySelection={true} // Add this prop to disable entity selection
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* KPI Cards */}
          <KPICards data={kpiData} loading={loading} entity={entity} />

          {/* Time Trend Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <MonthlyTrendChart data={monthlyTrend} loading={loading} entity={entity} />
            <QuarterlyComparisonChart
              data={quarterlyComparison}
              currentYear={parseInt(year)}
              loading={loading}
              entity={entity}
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
            entities={[entity]} // Fixed to current entity
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

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Entity } from '@/lib/types/sales';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  entity: Entity;
  year: string;
  onEntityChange: (entity: Entity) => void;
  onYearChange: (year: string) => void;
  onFiltersChange: (filters: {
    categories: string[];
    regions: string[];
    currencies: string[];
  }) => void;
}

export function FilterPanel({
  entity,
  year,
  onEntityChange,
  onYearChange,
  onFiltersChange,
}: FilterPanelProps) {
  const [entities, setEntities] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);

  useEffect(() => {
    fetchEntities();
  }, []);

  useEffect(() => {
    fetchYears();
  }, [entity]);

  useEffect(() => {
    fetchAvailableFilters();
  }, [entity, year]);

  const fetchEntities = async () => {
    try {
      const res = await fetch('/api/entities');
      const data = await res.json();
      setEntities(data.entities);
    } catch (error) {
      console.error('Failed to fetch entities:', error);
    }
  };

  const fetchYears = async () => {
    try {
      const res = await fetch(`/api/years?entity=${entity}`);
      const data = await res.json();
      setYears(data.years);
    } catch (error) {
      console.error('Failed to fetch years:', error);
    }
  };

  const fetchAvailableFilters = async () => {
    try {
      const res = await fetch(
        `/api/sales/breakdown?entity=${entity}&year=${year}`
      );
      const data = await res.json();
      
      setAvailableCategories(
        data.categoryData?.map((c: any) => c.category) || []
      );
      setAvailableRegions(
        data.regionData?.map((r: any) => r.region) || []
      );
      setAvailableCurrencies(
        data.currencyData?.map((c: any) => c.currency) || []
      );
    } catch (error) {
      console.error('Failed to fetch available filters:', error);
    }
  };

  const handleReset = () => {
    setCategories([]);
    setRegions([]);
    setCurrencies([]);
    onFiltersChange({ categories: [], regions: [], currencies: [] });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = categories.includes(category)
      ? categories.filter((c) => c !== category)
      : [...categories, category];
    setCategories(newCategories);
    onFiltersChange({
      categories: newCategories,
      regions,
      currencies,
    });
  };

  const handleRegionToggle = (region: string) => {
    const newRegions = regions.includes(region)
      ? regions.filter((r) => r !== region)
      : [...regions, region];
    setRegions(newRegions);
    onFiltersChange({
      categories,
      regions: newRegions,
      currencies,
    });
  };

  const handleCurrencyToggle = (currency: string) => {
    const newCurrencies = currencies.includes(currency)
      ? currencies.filter((c) => c !== currency)
      : [...currencies, currency];
    setCurrencies(newCurrencies);
    onFiltersChange({
      categories,
      regions,
      currencies: newCurrencies,
    });
  };

  return (
    <Card className="sticky top-4 z-10">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Filter sales data by entity, year, and more</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="entity">Entity</Label>
          <Select value={entity} onValueChange={(value) => onEntityChange(value as Entity)}>
            <SelectTrigger id="entity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {entities.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Select value={year} onValueChange={onYearChange}>
            <SelectTrigger id="year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-sm font-medium"
          >
            <span>Advanced Filters</span>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              <div>
                <Label className="mb-2 block">Categories</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {availableCategories.map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat}`}
                        checked={categories.includes(cat)}
                        onCheckedChange={() => handleCategoryToggle(cat)}
                      />
                      <label
                        htmlFor={`cat-${cat}`}
                        className="text-sm cursor-pointer"
                      >
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Regions</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {availableRegions.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={`region-${region}`}
                        checked={regions.includes(region)}
                        onCheckedChange={() => handleRegionToggle(region)}
                      />
                      <label
                        htmlFor={`region-${region}`}
                        className="text-sm cursor-pointer"
                      >
                        {region}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Currencies</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {availableCurrencies.map((currency) => (
                    <div key={currency} className="flex items-center space-x-2">
                      <Checkbox
                        id={`currency-${currency}`}
                        checked={currencies.includes(currency)}
                        onCheckedChange={() => handleCurrencyToggle(currency)}
                      />
                      <label
                        htmlFor={`currency-${currency}`}
                        className="text-sm cursor-pointer"
                      >
                        {currency}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

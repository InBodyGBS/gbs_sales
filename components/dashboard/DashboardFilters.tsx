'use client';

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
import { useState, useEffect } from 'react';

interface DashboardFiltersProps {
  year: string;
  entities: Entity[];
  quarter: string;
  countries: string[];
  fg: string;
  onYearChange: (year: string) => void;
  onEntitiesChange: (entities: Entity[]) => void;
  onQuarterChange: (quarter: string) => void;
  onCountriesChange: (countries: string[]) => void;
  onFGChange: (fg: string) => void;
  disableEntitySelection?: boolean;
}

export function DashboardFilters({
  year,
  entities,
  quarter,
  countries,
  fg,
  onYearChange,
  onEntitiesChange,
  onQuarterChange,
  onCountriesChange,
  onFGChange,
  disableEntitySelection = false,
}: DashboardFiltersProps) {
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchYears();
    fetchCountries();
  }, []);

  const fetchYears = async () => {
    try {
      const res = await fetch('/api/years');
      const data = await res.json();
      setAvailableYears(data.years || []);
    } catch (error) {
      console.error('Failed to fetch years:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      // This would fetch from an API endpoint
      // For now, we'll leave it empty
      setAvailableCountries([]);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  const allEntities: Entity[] = ['HQ', 'USA', 'BWA', 'Vietnam', 'Healthcare', 'Korot'];
  const isAllSelected = entities.length === allEntities.length;

  const handleEntityToggle = (entity: Entity) => {
    if (entity === 'All' || isAllSelected && entity === allEntities[0]) {
      onEntitiesChange(isAllSelected ? [] : allEntities);
    } else {
      if (entities.includes(entity)) {
        onEntitiesChange(entities.filter((e) => e !== entity));
      } else {
        onEntitiesChange([...entities, entity]);
      }
    }
  };

  const handleReset = () => {
    onYearChange('');
    onEntitiesChange([]);
    onQuarterChange('All');
    onCountriesChange([]);
    onFGChange('All');
  };

  return (
    <Card className="sticky top-4 z-10">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Filter dashboard data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Select value={year} onValueChange={onYearChange}>
            <SelectTrigger id="year">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!disableEntitySelection ? (
          <div className="space-y-2">
            <Label>Entities</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="entity-all"
                  checked={isAllSelected}
                  onCheckedChange={() => onEntitiesChange(isAllSelected ? [] : allEntities)}
                />
                <label htmlFor="entity-all" className="text-sm cursor-pointer">
                  All
                </label>
              </div>
              {allEntities.map((entity) => (
                <div key={entity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`entity-${entity}`}
                    checked={entities.includes(entity)}
                    onCheckedChange={() => handleEntityToggle(entity)}
                  />
                  <label htmlFor={`entity-${entity}`} className="text-sm cursor-pointer">
                    {entity}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Entity</Label>
            <div className="p-3 border rounded-md bg-muted">
              <p className="text-sm font-medium">{entities[0] || 'N/A'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Entity is fixed for this dashboard
              </p>
            </div>
          </div>
        )}

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
              <div className="space-y-2">
                <Label>Quarter</Label>
                <div className="flex gap-2">
                  {['All', 'Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                    <Button
                      key={q}
                      variant={quarter === q ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onQuarterChange(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>FG</Label>
                <div className="flex gap-2">
                  {['All', 'FG', 'NonFG'].map((f) => (
                    <Button
                      key={f}
                      variant={fg === f ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onFGChange(f)}
                    >
                      {f}
                    </Button>
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

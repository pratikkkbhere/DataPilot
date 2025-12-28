import { useState } from 'react';
import { FilterConfig, SortConfig, DataRow, ColumnStats } from '@/types/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, ArrowUpDown, Filter } from 'lucide-react';

interface FilterSortProps {
  columns: ColumnStats[];
  filters: FilterConfig[];
  sorts: SortConfig[];
  onFiltersChange: (filters: FilterConfig[]) => void;
  onSortsChange: (sorts: SortConfig[]) => void;
}

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'between', label: 'Between' },
  { value: 'is_null', label: 'Is Empty' },
  { value: 'is_not_null', label: 'Is Not Empty' },
];

export function FilterSort({ columns, filters, sorts, onFiltersChange, onSortsChange }: FilterSortProps) {
  const addFilter = () => {
    onFiltersChange([...filters, { column: columns[0]?.name || '', operator: 'equals', value: '' }]);
  };

  const updateFilter = (index: number, update: Partial<FilterConfig>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...update };
    onFiltersChange(newFilters);
  };

  const removeFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  const addSort = () => {
    onSortsChange([...sorts, { column: columns[0]?.name || '', direction: 'asc' }]);
  };

  const updateSort = (index: number, update: Partial<SortConfig>) => {
    const newSorts = [...sorts];
    newSorts[index] = { ...newSorts[index], ...update };
    onSortsChange(newSorts);
  };

  const removeSort = (index: number) => {
    onSortsChange(sorts.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filters
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addFilter}>
              <Plus className="h-4 w-4 mr-1" />
              Add Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No filters applied. Click "Add Filter" to filter your data.
            </p>
          ) : (
            filters.map((filter, i) => (
              <div key={i} className="flex items-end gap-2 p-3 bg-muted/30 rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs text-muted-foreground">Column</Label>
                  <Select value={filter.column} onValueChange={(v) => updateFilter(i, { column: v })}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col.name} value={col.name}>{col.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-xs text-muted-foreground">Operator</Label>
                  <Select value={filter.operator} onValueChange={(v) => updateFilter(i, { operator: v as FilterConfig['operator'] })}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!['is_null', 'is_not_null'].includes(filter.operator) && (
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs text-muted-foreground">Value</Label>
                    <Input
                      value={String(filter.value ?? '')}
                      onChange={(e) => updateFilter(i, { value: e.target.value })}
                      className="bg-background"
                      placeholder="Enter value..."
                    />
                  </div>
                )}
                {filter.operator === 'between' && (
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Input
                      value={String(filter.value2 ?? '')}
                      onChange={(e) => updateFilter(i, { value2: e.target.value })}
                      className="bg-background"
                      placeholder="End value..."
                    />
                  </div>
                )}
                <Button variant="ghost" size="icon" onClick={() => removeFilter(i)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-primary" />
              Sorting
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addSort}>
              <Plus className="h-4 w-4 mr-1" />
              Add Sort
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sorts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No sorting applied. Click "Add Sort" to sort your data.
            </p>
          ) : (
            sorts.map((sort, i) => (
              <div key={i} className="flex items-end gap-2 p-3 bg-muted/30 rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs text-muted-foreground">Column</Label>
                  <Select value={sort.column} onValueChange={(v) => updateSort(i, { column: v })}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col.name} value={col.name}>{col.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-xs text-muted-foreground">Direction</Label>
                  <Select value={sort.direction} onValueChange={(v) => updateSort(i, { direction: v as 'asc' | 'desc' })}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant="outline" className="mb-1.5">
                  {i + 1}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => removeSort(i)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

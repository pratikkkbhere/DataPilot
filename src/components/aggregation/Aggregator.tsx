import { useState } from 'react';
import { AggregationConfig, ColumnStats, DataRow } from '@/types/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Calculator, Table2 } from 'lucide-react';
import { performAggregation } from '@/lib/dataUtils';
import { DataPreview } from '@/components/data/DataPreview';

interface AggregatorProps {
  data: DataRow[];
  columns: ColumnStats[];
}

const aggregationFunctions = [
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'median', label: 'Median' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
];

export function Aggregator({ data, columns }: AggregatorProps) {
  const [groupByColumns, setGroupByColumns] = useState<string[]>([]);
  const [aggregations, setAggregations] = useState<{ column: string; function: string }[]>([]);
  const [result, setResult] = useState<DataRow[] | null>(null);

  const numericColumns = columns.filter((c) => c.type === 'number');

  const toggleGroupBy = (colName: string) => {
    setGroupByColumns((prev) =>
      prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]
    );
    setResult(null);
  };

  const addAggregation = () => {
    if (numericColumns.length > 0) {
      setAggregations([
        ...aggregations,
        { column: numericColumns[0].name, function: 'sum' },
      ]);
      setResult(null);
    }
  };

  const updateAggregation = (index: number, update: Partial<{ column: string; function: string }>) => {
    const newAggs = [...aggregations];
    newAggs[index] = { ...newAggs[index], ...update };
    setAggregations(newAggs);
    setResult(null);
  };

  const removeAggregation = (index: number) => {
    setAggregations(aggregations.filter((_, i) => i !== index));
    setResult(null);
  };

  const runAggregation = () => {
    if (groupByColumns.length === 0 && aggregations.length === 0) return;

    const config: AggregationConfig = {
      groupByColumns,
      aggregations: aggregations.map((a) => ({
        column: a.column,
        function: a.function as AggregationConfig['aggregations'][0]['function'],
      })),
    };

    const aggregatedData = performAggregation(data, config);
    setResult(aggregatedData);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Table2 className="h-5 w-5 text-primary" />
              Group By Columns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {columns.map((col) => (
                <div
                  key={col.name}
                  className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg"
                >
                  <Checkbox
                    id={`group-${col.name}`}
                    checked={groupByColumns.includes(col.name)}
                    onCheckedChange={() => toggleGroupBy(col.name)}
                  />
                  <Label htmlFor={`group-${col.name}`} className="text-sm cursor-pointer">
                    {col.name}
                  </Label>
                </div>
              ))}
            </div>
            {groupByColumns.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Selected:</span>
                {groupByColumns.map((col) => (
                  <Badge key={col} className="bg-primary/20 text-primary">
                    {col}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Aggregations
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={addAggregation}
                disabled={numericColumns.length === 0}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {numericColumns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No numeric columns available for aggregation
              </p>
            ) : aggregations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Click "Add" to create aggregations
              </p>
            ) : (
              aggregations.map((agg, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Select value={agg.function} onValueChange={(v) => updateAggregation(i, { function: v })}>
                    <SelectTrigger className="w-28 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aggregationFunctions.map((fn) => (
                        <SelectItem key={fn.value} value={fn.value}>
                          {fn.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">of</span>
                  <Select value={agg.column} onValueChange={(v) => updateAggregation(i, { column: v })}>
                    <SelectTrigger className="flex-1 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map((col) => (
                        <SelectItem key={col.name} value={col.name}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => removeAggregation(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={runAggregation}
          disabled={groupByColumns.length === 0 && aggregations.length === 0}
        >
          <Calculator className="h-4 w-4 mr-2" />
          Run Aggregation
        </Button>
      </div>

      {result && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Aggregation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <DataPreview data={result} title="" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

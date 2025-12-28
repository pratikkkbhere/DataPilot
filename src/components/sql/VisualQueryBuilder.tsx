import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, Trash2, Wand2, HelpCircle, Columns, Filter, 
  ArrowUpDown, Layers, Calculator, Hash 
} from 'lucide-react';
import { VisualQueryConfig, WhereCondition, OrderByConfig, AggregationConfig } from '@/types/sql';
import { buildQueryFromVisual } from '@/lib/sqlEngine';

interface VisualQueryBuilderProps {
  columns: string[];
  onQueryGenerated: (sql: string) => void;
}

const operators = [
  { value: 'equals', label: '= Equals' },
  { value: 'not_equals', label: '≠ Not Equals' },
  { value: 'contains', label: '∋ Contains' },
  { value: 'greater_than', label: '> Greater Than' },
  { value: 'less_than', label: '< Less Than' },
  { value: 'greater_equal', label: '>= Greater or Equal' },
  { value: 'less_equal', label: '<= Less or Equal' },
  { value: 'between', label: '↔ Between' },
  { value: 'is_null', label: '∅ Is Null' },
  { value: 'is_not_null', label: '● Is Not Null' },
  { value: 'in', label: '∈ In List' },
  { value: 'like', label: '≈ Like Pattern' }
];

const aggregationFunctions = [
  { value: 'COUNT', label: 'COUNT', description: 'Count records' },
  { value: 'SUM', label: 'SUM', description: 'Sum values' },
  { value: 'AVG', label: 'AVG', description: 'Average value' },
  { value: 'MIN', label: 'MIN', description: 'Minimum value' },
  { value: 'MAX', label: 'MAX', description: 'Maximum value' }
];

const generateId = () => Math.random().toString(36).substring(7);

export function VisualQueryBuilder({ columns, onQueryGenerated }: VisualQueryBuilderProps) {
  const [config, setConfig] = useState<VisualQueryConfig>({
    selectColumns: ['*'],
    whereConditions: [],
    groupByColumns: [],
    orderByColumns: [],
    aggregations: [],
    limit: undefined
  });
  
  const [selectAll, setSelectAll] = useState(true);
  
  // Generate SQL whenever config changes
  useEffect(() => {
    const sql = buildQueryFromVisual(config, columns);
    onQueryGenerated(sql);
  }, [config, columns, onQueryGenerated]);
  
  // Column selection
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setConfig(prev => ({
      ...prev,
      selectColumns: checked ? ['*'] : []
    }));
  };
  
  const handleColumnToggle = (column: string) => {
    if (selectAll) {
      setSelectAll(false);
      setConfig(prev => ({
        ...prev,
        selectColumns: [column]
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        selectColumns: prev.selectColumns.includes(column)
          ? prev.selectColumns.filter(c => c !== column)
          : [...prev.selectColumns, column]
      }));
    }
  };
  
  // WHERE conditions
  const addWhereCondition = () => {
    const newCondition: WhereCondition = {
      id: generateId(),
      column: columns[0] || '',
      operator: 'equals',
      value: '',
      connector: config.whereConditions.length > 0 ? 'AND' : undefined
    };
    setConfig(prev => ({
      ...prev,
      whereConditions: [...prev.whereConditions, newCondition]
    }));
  };
  
  const updateWhereCondition = (id: string, updates: Partial<WhereCondition>) => {
    setConfig(prev => ({
      ...prev,
      whereConditions: prev.whereConditions.map(c =>
        c.id === id ? { ...c, ...updates } : c
      )
    }));
  };
  
  const removeWhereCondition = (id: string) => {
    setConfig(prev => ({
      ...prev,
      whereConditions: prev.whereConditions.filter(c => c.id !== id)
    }));
  };
  
  // Aggregations
  const addAggregation = () => {
    const newAgg: AggregationConfig = {
      id: generateId(),
      column: '*',
      function: 'COUNT'
    };
    setConfig(prev => ({
      ...prev,
      aggregations: [...prev.aggregations, newAgg]
    }));
  };
  
  const updateAggregation = (id: string, updates: Partial<AggregationConfig>) => {
    setConfig(prev => ({
      ...prev,
      aggregations: prev.aggregations.map(a =>
        a.id === id ? { ...a, ...updates } : a
      )
    }));
  };
  
  const removeAggregation = (id: string) => {
    setConfig(prev => ({
      ...prev,
      aggregations: prev.aggregations.filter(a => a.id !== id)
    }));
  };
  
  // Group By
  const toggleGroupBy = (column: string) => {
    setConfig(prev => ({
      ...prev,
      groupByColumns: prev.groupByColumns.includes(column)
        ? prev.groupByColumns.filter(c => c !== column)
        : [...prev.groupByColumns, column]
    }));
  };
  
  // Order By
  const addOrderBy = () => {
    const newOrder: OrderByConfig = {
      column: columns[0] || '',
      direction: 'ASC'
    };
    setConfig(prev => ({
      ...prev,
      orderByColumns: [...prev.orderByColumns, newOrder]
    }));
  };
  
  const updateOrderBy = (index: number, updates: Partial<OrderByConfig>) => {
    setConfig(prev => ({
      ...prev,
      orderByColumns: prev.orderByColumns.map((o, i) =>
        i === index ? { ...o, ...updates } : o
      )
    }));
  };
  
  const removeOrderBy = (index: number) => {
    setConfig(prev => ({
      ...prev,
      orderByColumns: prev.orderByColumns.filter((_, i) => i !== index)
    }));
  };
  
  return (
    <Card className="border-2 border-foreground shadow-brutal">
      <CardHeader className="border-b-2 border-foreground bg-primary text-primary-foreground">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          VISUAL QUERY BUILDER
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* SELECT Columns */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Columns className="h-4 w-4" />
            <Label className="font-bold">SELECT COLUMNS</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Choose which columns to include in results</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <Switch checked={selectAll} onCheckedChange={handleSelectAll} />
            <Label className="text-sm">Select All Columns (*)</Label>
          </div>
          
          {!selectAll && (
            <div className="flex flex-wrap gap-2">
              {columns.map(col => (
                <Badge
                  key={col}
                  variant={config.selectColumns.includes(col) ? 'default' : 'outline'}
                  className="cursor-pointer border-2 border-foreground"
                  onClick={() => handleColumnToggle(col)}
                >
                  {col}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* WHERE Conditions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label className="font-bold">WHERE (FILTERS)</Label>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Add conditions to filter rows</TooltipContent>
              </Tooltip>
            </div>
            <Button size="sm" variant="outline" onClick={addWhereCondition} className="border-2">
              <Plus className="h-4 w-4 mr-1" /> Add Filter
            </Button>
          </div>
          
          {config.whereConditions.map((condition, index) => (
            <div key={condition.id} className="flex flex-wrap items-center gap-2 p-3 bg-muted border-2 border-foreground">
              {index > 0 && (
                <Select
                  value={condition.connector}
                  onValueChange={(v) => updateWhereCondition(condition.id, { connector: v as 'AND' | 'OR' })}
                >
                  <SelectTrigger className="w-20 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <Select
                value={condition.column}
                onValueChange={(v) => updateWhereCondition(condition.id, { column: v })}
              >
                <SelectTrigger className="w-40 border-2">
                  <SelectValue placeholder="Column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={condition.operator}
                onValueChange={(v) => updateWhereCondition(condition.id, { operator: v as WhereCondition['operator'] })}
              >
                <SelectTrigger className="w-44 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operators.map(op => (
                    <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {!['is_null', 'is_not_null'].includes(condition.operator) && (
                <Input
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) => updateWhereCondition(condition.id, { value: e.target.value })}
                  className="w-32 border-2"
                />
              )}
              
              {condition.operator === 'between' && (
                <Input
                  placeholder="Value 2"
                  value={condition.value2 || ''}
                  onChange={(e) => updateWhereCondition(condition.id, { value2: e.target.value })}
                  className="w-32 border-2"
                />
              )}
              
              <Button
                size="icon"
                variant="destructive"
                onClick={() => removeWhereCondition(condition.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        {/* Aggregations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <Label className="font-bold">AGGREGATIONS</Label>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Apply aggregate functions like COUNT, SUM, AVG</TooltipContent>
              </Tooltip>
            </div>
            <Button size="sm" variant="outline" onClick={addAggregation} className="border-2">
              <Plus className="h-4 w-4 mr-1" /> Add Aggregation
            </Button>
          </div>
          
          {config.aggregations.map(agg => (
            <div key={agg.id} className="flex flex-wrap items-center gap-2 p-3 bg-muted border-2 border-foreground">
              <Select
                value={agg.function}
                onValueChange={(v) => updateAggregation(agg.id, { function: v as AggregationConfig['function'] })}
              >
                <SelectTrigger className="w-28 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aggregationFunctions.map(fn => (
                    <SelectItem key={fn.value} value={fn.value}>
                      {fn.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-sm font-mono">(</span>
              
              <Select
                value={agg.column}
                onValueChange={(v) => updateAggregation(agg.id, { column: v })}
              >
                <SelectTrigger className="w-40 border-2">
                  <SelectValue placeholder="Column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">* (All)</SelectItem>
                  {columns.map(col => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-sm font-mono">)</span>
              <span className="text-sm">AS</span>
              
              <Input
                placeholder="Alias"
                value={agg.alias || ''}
                onChange={(e) => updateAggregation(agg.id, { alias: e.target.value })}
                className="w-32 border-2"
              />
              
              <Button
                size="icon"
                variant="destructive"
                onClick={() => removeAggregation(agg.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        {/* GROUP BY */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <Label className="font-bold">GROUP BY</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Group results by these columns</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {columns.map(col => (
              <Badge
                key={col}
                variant={config.groupByColumns.includes(col) ? 'default' : 'outline'}
                className="cursor-pointer border-2 border-foreground"
                onClick={() => toggleGroupBy(col)}
              >
                {col}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* ORDER BY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <Label className="font-bold">ORDER BY</Label>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Sort results by column</TooltipContent>
              </Tooltip>
            </div>
            <Button size="sm" variant="outline" onClick={addOrderBy} className="border-2">
              <Plus className="h-4 w-4 mr-1" /> Add Sort
            </Button>
          </div>
          
          {config.orderByColumns.map((order, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={order.column}
                onValueChange={(v) => updateOrderBy(index, { column: v })}
              >
                <SelectTrigger className="w-40 border-2">
                  <SelectValue placeholder="Column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={order.direction}
                onValueChange={(v) => updateOrderBy(index, { direction: v as 'ASC' | 'DESC' })}
              >
                <SelectTrigger className="w-28 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASC">ASC ↑</SelectItem>
                  <SelectItem value="DESC">DESC ↓</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                size="icon"
                variant="destructive"
                onClick={() => removeOrderBy(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        {/* LIMIT */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            <Label className="font-bold">LIMIT</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Limit the number of results returned</TooltipContent>
            </Tooltip>
          </div>
          
          <Input
            type="number"
            placeholder="No limit"
            value={config.limit || ''}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              limit: e.target.value ? parseInt(e.target.value) : undefined
            }))}
            className="w-32 border-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}

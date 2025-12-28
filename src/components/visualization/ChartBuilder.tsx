import { useState, useMemo } from 'react';
import { DataRow, ColumnStats } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, LineChart, PieChart, Activity, ScatterChart as ScatterIcon } from 'lucide-react';
import { prepareChartData, prepareHistogramData, prepareScatterData } from '@/lib/dataUtils';
import {
  BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

interface ChartBuilderProps {
  data: DataRow[];
  columns: ColumnStats[];
}

const CHART_COLORS = [
  'hsl(174, 72%, 56%)',
  'hsl(262, 83%, 68%)',
  'hsl(47, 95%, 60%)',
  'hsl(340, 82%, 65%)',
  'hsl(199, 89%, 60%)',
  'hsl(142, 71%, 55%)',
];

export function ChartBuilder({ data, columns }: ChartBuilderProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'histogram' | 'scatter'>('bar');
  const [xAxis, setXAxis] = useState(columns[0]?.name || '');
  const [yAxis, setYAxis] = useState(columns.find(c => c.type === 'number')?.name || '');
  const [aggregation, setAggregation] = useState<'count' | 'sum' | 'avg'>('count');

  const numericColumns = columns.filter(c => c.type === 'number');

  const chartData = useMemo(() => {
    if (chartType === 'histogram' && yAxis) {
      return prepareHistogramData(data, yAxis);
    }
    if (chartType === 'scatter' && xAxis && yAxis) {
      return prepareScatterData(data, xAxis, yAxis);
    }
    if (xAxis) {
      return prepareChartData(data, xAxis, yAxis || undefined, aggregation);
    }
    return [];
  }, [data, chartType, xAxis, yAxis, aggregation]);

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center text-muted-foreground">
          Select axes to generate chart
        </div>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="value" fill="hsl(174, 72%, 56%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(174, 72%, 56%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(174, 72%, 56%)', r: 4 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart>
              <Pie
                data={chartData.slice(0, 8)}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={140}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.slice(0, 8).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="range" 
                stroke="hsl(var(--muted-foreground))"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="hsl(262, 83%, 68%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name={xAxis} 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name={yAxis} 
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Scatter data={chartData} fill="hsl(47, 95%, 60%)" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Chart Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={chartType} onValueChange={(v) => setChartType(v as typeof chartType)}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="bar" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Bar</span>
              </TabsTrigger>
              <TabsTrigger value="line" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                <span className="hidden sm:inline">Line</span>
              </TabsTrigger>
              <TabsTrigger value="pie" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Pie</span>
              </TabsTrigger>
              <TabsTrigger value="histogram" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Histogram</span>
              </TabsTrigger>
              <TabsTrigger value="scatter" className="flex items-center gap-2">
                <ScatterIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Scatter</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chartType !== 'histogram' && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">X-Axis</Label>
                <Select value={xAxis} onValueChange={setXAxis}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.name} value={col.name}>{col.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                {chartType === 'histogram' ? 'Column' : 'Y-Axis (Numeric)'}
              </Label>
              <Select value={yAxis} onValueChange={setYAxis}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {numericColumns.map((col) => (
                    <SelectItem key={col.name} value={col.name}>{col.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!['histogram', 'scatter'].includes(chartType) && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Aggregation</Label>
                <Select value={aggregation} onValueChange={(v) => setAggregation(v as typeof aggregation)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="avg">Average</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Chart Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  );
}

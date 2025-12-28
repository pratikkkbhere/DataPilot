import { DatasetSummary } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Rows, Columns, AlertCircle, Copy, Hash, Type, Calendar, ToggleLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataProfilerProps {
  summary: DatasetSummary;
}

const typeIcons = {
  number: Hash,
  string: Type,
  date: Calendar,
  boolean: ToggleLeft,
  mixed: AlertCircle,
};

const typeColors = {
  number: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  string: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  date: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  boolean: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  mixed: 'bg-warning/20 text-warning border-warning/30',
};

export function DataProfiler({ summary }: DataProfilerProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-1/20 flex items-center justify-center">
              <Rows className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{summary.totalRows.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Rows</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-2/20 flex items-center justify-center">
              <Columns className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{summary.totalColumns}</p>
              <p className="text-sm text-muted-foreground">Total Columns</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-warning/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{summary.overallMissingPercentage}%</p>
              <p className="text-sm text-muted-foreground">Missing Values</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-4/20 flex items-center justify-center">
              <Copy className="h-6 w-6 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{summary.duplicateRowCount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Duplicate Rows</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Column Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Column</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Missing</TableHead>
                  <TableHead className="font-semibold">Unique</TableHead>
                  <TableHead className="font-semibold">Min</TableHead>
                  <TableHead className="font-semibold">Max</TableHead>
                  <TableHead className="font-semibold">Mean</TableHead>
                  <TableHead className="font-semibold">Median</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.columnStats.map((col) => {
                  const Icon = typeIcons[col.type];
                  return (
                    <TableRow key={col.name} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{col.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('gap-1', typeColors[col.type])}
                        >
                          <Icon className="h-3 w-3" />
                          {col.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={col.missingPercentage}
                            className="w-16 h-1.5"
                          />
                          <span className={cn(
                            'text-sm',
                            col.missingPercentage > 20 ? 'text-warning' : 'text-muted-foreground'
                          )}>
                            {col.missingPercentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{col.uniqueCount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{col.min ?? '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{col.max ?? '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{col.mean ?? '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{col.median ?? '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings2, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Trash2, 
  Calculator, 
  Type, 
  Calendar,
  RotateCcw,
  Play,
  Eye
} from 'lucide-react';
import { ColumnStats, DataRow, MissingValueConfig, MissingValueStrategy, MissingValuePreview, CleaningAction } from '@/types/data';

interface MissingValueConfigProps {
  columns: ColumnStats[];
  data: DataRow[];
  originalData: DataRow[];
  onApplyChanges: (cleanedData: DataRow[], actions: CleaningAction[]) => void;
  onReset: () => void;
}

const typeIcons: Record<string, typeof Calculator> = {
  number: Calculator,
  string: Type,
  date: Calendar,
  boolean: Type,
  mixed: Type,
};

const strategyLabels: Record<MissingValueStrategy, string> = {
  leave_null: 'Leave as NULL',
  fill_mean: 'Fill with Mean',
  fill_median: 'Fill with Median',
  fill_mode: 'Fill with Mode',
  fill_custom: 'Fill with Custom Value',
  fill_earliest: 'Fill with Earliest Date',
  fill_latest: 'Fill with Latest Date',
  drop_rows: 'Drop Rows with Missing',
};

const strategyDescriptions: Record<MissingValueStrategy, string> = {
  leave_null: 'Keep missing values as NULL/empty - no changes made',
  fill_mean: 'Replace with the average of all values in this column',
  fill_median: 'Replace with the middle value when data is sorted',
  fill_mode: 'Replace with the most frequently occurring value',
  fill_custom: 'Replace with a specific value you provide',
  fill_earliest: 'Replace with the earliest date found in this column',
  fill_latest: 'Replace with the latest/most recent date in this column',
  drop_rows: 'Remove all rows that have missing values in this column',
};

export function MissingValueConfigComponent({ 
  columns, 
  data, 
  originalData,
  onApplyChanges,
  onReset
}: MissingValueConfigProps) {
  const [configs, setConfigs] = useState<Record<string, MissingValueConfig>>({});
  const [selectedColumn, setSelectedColumn] = useState<ColumnStats | null>(null);
  const [tempStrategy, setTempStrategy] = useState<MissingValueStrategy>('leave_null');
  const [tempCustomValue, setTempCustomValue] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Get columns with missing values
  const columnsWithMissing = useMemo(() => 
    columns.filter(col => col.missingCount > 0),
    [columns]
  );

  // Calculate preview of changes
  const preview = useMemo((): MissingValuePreview[] => {
    const previews: MissingValuePreview[] = [];
    
    for (const [colName, config] of Object.entries(configs)) {
      const colStats = columns.find(c => c.name === colName);
      if (!colStats || config.strategy === 'leave_null') continue;

      let description = '';
      const affected = colStats.missingCount;

      switch (config.strategy) {
        case 'fill_mean':
          description = `${affected} missing values will be filled with Mean (${colStats.mean?.toFixed(2) ?? 'N/A'})`;
          break;
        case 'fill_median':
          description = `${affected} missing values will be filled with Median (${colStats.median?.toFixed(2) ?? 'N/A'})`;
          break;
        case 'fill_mode':
          description = `${affected} missing values will be filled with Mode ("${colStats.mode ?? 'N/A'}")`;
          break;
        case 'fill_custom':
          description = `${affected} missing values will be filled with "${config.customValue}"`;
          break;
        case 'fill_earliest':
          description = `${affected} missing values will be filled with earliest date (${colStats.min ?? 'N/A'})`;
          break;
        case 'fill_latest':
          description = `${affected} missing values will be filled with latest date (${colStats.max ?? 'N/A'})`;
          break;
        case 'drop_rows':
          description = `${affected} rows will be removed due to missing values`;
          break;
      }

      previews.push({
        column: colName,
        strategy: config.strategy,
        affectedRows: affected,
        description,
      });
    }

    return previews;
  }, [configs, columns]);

  // Get available strategies based on column type
  const getStrategiesForType = (type: string): MissingValueStrategy[] => {
    const common: MissingValueStrategy[] = ['leave_null', 'drop_rows'];
    
    switch (type) {
      case 'number':
        return [...common, 'fill_mean', 'fill_median', 'fill_mode', 'fill_custom'];
      case 'date':
        return [...common, 'fill_earliest', 'fill_latest', 'fill_custom'];
      default: // string, boolean, mixed
        return [...common, 'fill_mode', 'fill_custom'];
    }
  };

  const openConfigDialog = (col: ColumnStats) => {
    setSelectedColumn(col);
    const existing = configs[col.name];
    setTempStrategy(existing?.strategy ?? 'leave_null');
    setTempCustomValue(existing?.customValue?.toString() ?? '');
  };

  const saveConfig = () => {
    if (!selectedColumn) return;
    
    setConfigs(prev => ({
      ...prev,
      [selectedColumn.name]: {
        column: selectedColumn.name,
        strategy: tempStrategy,
        customValue: tempStrategy === 'fill_custom' ? tempCustomValue : undefined,
      }
    }));
    setSelectedColumn(null);
  };

  const removeConfig = (colName: string) => {
    setConfigs(prev => {
      const updated = { ...prev };
      delete updated[colName];
      return updated;
    });
  };

  const applyAllChanges = () => {
    let cleanedData = [...data.map(row => ({ ...row }))];
    const actions: CleaningAction[] = [];

    for (const [colName, config] of Object.entries(configs)) {
      if (config.strategy === 'leave_null') continue;

      const colStats = columns.find(c => c.name === colName);
      if (!colStats) continue;

      if (config.strategy === 'drop_rows') {
        const before = cleanedData.length;
        cleanedData = cleanedData.filter(row => 
          row[colName] !== null && row[colName] !== undefined && row[colName] !== ''
        );
        const dropped = before - cleanedData.length;
        if (dropped > 0) {
          actions.push({
            column: colName,
            action: 'Drop rows with missing',
            affectedRows: dropped,
            details: `Removed ${dropped} rows with missing values`,
          });
        }
      } else {
        let fillValue: unknown;
        let method = '';

        switch (config.strategy) {
          case 'fill_mean':
            fillValue = colStats.mean ?? 0;
            method = 'Mean';
            break;
          case 'fill_median':
            fillValue = colStats.median ?? 0;
            method = 'Median';
            break;
          case 'fill_mode':
            fillValue = colStats.mode ?? '';
            method = 'Mode';
            break;
          case 'fill_custom':
            fillValue = config.customValue;
            method = 'Custom value';
            break;
          case 'fill_earliest':
            fillValue = colStats.min;
            method = 'Earliest date';
            break;
          case 'fill_latest':
            fillValue = colStats.max;
            method = 'Latest date';
            break;
        }

        let filled = 0;
        for (const row of cleanedData) {
          if (row[colName] === null || row[colName] === undefined || row[colName] === '') {
            row[colName] = fillValue;
            filled++;
          }
        }

        if (filled > 0) {
          actions.push({
            column: colName,
            action: `Fill missing with ${method}`,
            affectedRows: filled,
            details: `Filled ${filled} missing values with ${fillValue}`,
          });
        }
      }
    }

    onApplyChanges(cleanedData, actions);
    setShowPreview(false);
    setConfigs({});
  };

  const hasConfigurations = Object.keys(configs).length > 0;
  const hasNonNullConfigs = preview.length > 0;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Settings2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Missing Value Configuration</CardTitle>
                  <CardDescription>
                    Configure how missing values should be handled for each column
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Reset to Original
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Restore dataset to its original uploaded state</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Columns Table */}
        {columnsWithMissing.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Missing Values</h3>
              <p className="text-muted-foreground">
                Your dataset has no missing values. You can proceed to the next step.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Columns with Missing Values ({columnsWithMissing.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column Name</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead className="text-right">Missing Count</TableHead>
                      <TableHead className="text-right">Missing %</TableHead>
                      <TableHead>Configuration</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {columnsWithMissing.map(col => {
                      const Icon = typeIcons[col.type] || Type;
                      const config = configs[col.name];
                      
                      return (
                        <TableRow key={col.name}>
                          <TableCell className="font-medium">{col.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1 capitalize">
                              <Icon className="h-3 w-3" />
                              {col.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {col.missingCount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge 
                              variant="secondary"
                              className={
                                col.missingPercentage > 50 
                                  ? 'bg-destructive/20 text-destructive' 
                                  : col.missingPercentage > 20 
                                    ? 'bg-warning/20 text-warning' 
                                    : 'bg-muted text-muted-foreground'
                              }
                            >
                              {col.missingPercentage.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {config && config.strategy !== 'leave_null' ? (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-primary/20 text-primary border-primary/30">
                                  {strategyLabels[config.strategy]}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeConfig(col.name)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Not configured</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openConfigDialog(col)}
                              className="gap-1"
                            >
                              <Settings2 className="h-3 w-3" />
                              Configure
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Preview & Apply Section */}
        {hasConfigurations && (
          <Card className="bg-card border-border border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Pending Changes ({preview.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasNonNullConfigs ? (
                <>
                  <div className="space-y-2">
                    {preview.map((p, i) => (
                      <div 
                        key={i}
                        className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-foreground">{p.column}</span>
                          <span className="text-muted-foreground"> → </span>
                          <span className="text-foreground">{p.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => setConfigs({})}
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={() => setShowPreview(true)}
                      className="gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Apply Changes
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  All columns are set to "Leave as NULL" - no changes will be made.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Configuration Dialog */}
        <Dialog open={!!selectedColumn} onOpenChange={() => setSelectedColumn(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Configure Missing Values
                <Badge variant="outline" className="ml-2 capitalize">
                  {selectedColumn?.name}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Choose how to handle {selectedColumn?.missingCount.toLocaleString()} missing values 
                ({selectedColumn?.missingPercentage.toFixed(1)}% of data)
              </DialogDescription>
            </DialogHeader>

            {selectedColumn && (
              <div className="space-y-4 py-4">
                {/* Column Stats */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-medium capitalize">{selectedColumn.type}</span>
                  </div>
                  {selectedColumn.type === 'number' && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Mean:</span>
                        <span className="ml-2 font-medium">{selectedColumn.mean?.toFixed(2) ?? 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Median:</span>
                        <span className="ml-2 font-medium">{selectedColumn.median?.toFixed(2) ?? 'N/A'}</span>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-muted-foreground">Mode:</span>
                    <span className="ml-2 font-medium">{String(selectedColumn.mode ?? 'N/A')}</span>
                  </div>
                  {selectedColumn.type === 'date' && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Earliest:</span>
                        <span className="ml-2 font-medium">{String(selectedColumn.min ?? 'N/A')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Latest:</span>
                        <span className="ml-2 font-medium">{String(selectedColumn.max ?? 'N/A')}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Strategy Selection */}
                <RadioGroup value={tempStrategy} onValueChange={(v) => setTempStrategy(v as MissingValueStrategy)}>
                  <div className="space-y-3">
                    {getStrategiesForType(selectedColumn.type).map(strategy => (
                      <div 
                        key={strategy}
                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                          tempStrategy === strategy 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={strategy} id={strategy} className="mt-0.5" />
                        <div className="flex-1">
                          <Label htmlFor={strategy} className="font-medium cursor-pointer">
                            {strategyLabels[strategy]}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {strategyDescriptions[strategy]}
                          </p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[200px]">
                            <p>{strategyDescriptions[strategy]}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                {/* Custom Value Input */}
                {tempStrategy === 'fill_custom' && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="customValue">Custom Value</Label>
                    {selectedColumn.type === 'date' ? (
                      <Input
                        id="customValue"
                        type="date"
                        value={tempCustomValue}
                        onChange={(e) => setTempCustomValue(e.target.value)}
                        className="bg-background"
                      />
                    ) : (
                      <Input
                        id="customValue"
                        type={selectedColumn.type === 'number' ? 'number' : 'text'}
                        placeholder={
                          selectedColumn.type === 'number' 
                            ? 'Enter a number...' 
                            : 'Enter a value (e.g., "Unknown", "Not Provided")'
                        }
                        value={tempCustomValue}
                        onChange={(e) => setTempCustomValue(e.target.value)}
                        className="bg-background"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedColumn(null)}>
                Cancel
              </Button>
              <Button onClick={saveConfig}>
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Apply Confirmation Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Confirm Changes</DialogTitle>
              <DialogDescription>
                The following changes will be applied to your dataset. This action cannot be undone
                (but you can reset to original data).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-4">
              {preview.map((p, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium">{p.column}</span>
                    <span className="text-muted-foreground"> → </span>
                    <span>{p.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Cancel
              </Button>
              <Button onClick={applyAllChanges} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Apply Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

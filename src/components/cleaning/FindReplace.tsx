import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Replace, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DataRow, CleaningAction, ColumnStats } from '@/types/data';
import { toast } from 'sonner';

interface FindReplaceProps {
  columns: ColumnStats[];
  data: DataRow[];
  onApplyChanges: (cleanedData: DataRow[], actions: CleaningAction[]) => void;
}

export function FindReplaceComponent({ columns, data, onApplyChanges }: FindReplaceProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [findValue, setFindValue] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  // Get string columns only
  const stringColumns = columns.filter(col => col.type === 'string' || col.type === 'mixed');

  const previewReplace = useCallback(() => {
    if (!selectedColumn || !findValue) {
      setPreviewCount(null);
      return;
    }

    let count = 0;
    const findRegex = matchWholeWord 
      ? new RegExp(`\\b${findValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, matchCase ? 'g' : 'gi')
      : new RegExp(findValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi');

    for (const row of data) {
      const cellValue = String(row[selectedColumn] ?? '');
      if (findRegex.test(cellValue)) {
        const matches = cellValue.match(findRegex);
        if (matches) {
          count += matches.length;
        }
      }
    }

    setPreviewCount(count);
  }, [selectedColumn, findValue, matchCase, matchWholeWord, data]);

  const handlePreview = () => {
    previewReplace();
  };

  const handleApply = useCallback(() => {
    if (!selectedColumn || !findValue) {
      toast.error('Please select a column and enter a find value');
      return;
    }

    if (previewCount === null || previewCount === 0) {
      toast.error('No matches found to replace');
      return;
    }

    let cleanedData = [...data.map(row => ({ ...row }))];
    let replaced = 0;
    
    const findRegex = matchWholeWord 
      ? new RegExp(`\\b${findValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, matchCase ? 'g' : 'gi')
      : new RegExp(findValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi');

    for (const row of cleanedData) {
      const cellValue = String(row[selectedColumn] ?? '');
      if (findRegex.test(cellValue)) {
        const newValue = cellValue.replace(findRegex, replaceValue);
        if (newValue !== cellValue) {
          row[selectedColumn] = newValue;
          replaced++;
        }
      }
    }

    const actions: CleaningAction[] = [{
      column: selectedColumn,
      action: 'Find and Replace',
      affectedRows: replaced,
      details: `Replaced "${findValue}" with "${replaceValue}" in ${replaced} rows`,
    }];

    onApplyChanges(cleanedData, actions);
    
    // Reset form
    setFindValue('');
    setReplaceValue('');
    setPreviewCount(null);
    
    toast.success(`Replaced ${replaced} occurrence(s)`);
  }, [selectedColumn, findValue, replaceValue, matchCase, matchWholeWord, data, previewCount, onApplyChanges]);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-foreground shadow-brutal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Replace className="h-5 w-5" />
            Find and Replace
          </CardTitle>
          <CardDescription>
            Search for specific values in a column and replace them with new values
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Column Selection */}
          <div className="space-y-2">
            <Label htmlFor="column-select">Select Column</Label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger id="column-select" className="border-2 border-foreground">
                <SelectValue placeholder="Choose a column to search" />
              </SelectTrigger>
              <SelectContent>
                {stringColumns.map((col) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name} ({col.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Find Value */}
          <div className="space-y-2">
            <Label htmlFor="find-value">Find</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="find-value"
                value={findValue}
                onChange={(e) => {
                  setFindValue(e.target.value);
                  setPreviewCount(null);
                }}
                placeholder="Enter text to find"
                className="pl-10 border-2 border-foreground"
              />
            </div>
          </div>

          {/* Replace Value */}
          <div className="space-y-2">
            <Label htmlFor="replace-value">Replace With</Label>
            <div className="relative">
              <Replace className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="replace-value"
                value={replaceValue}
                onChange={(e) => setReplaceValue(e.target.value)}
                placeholder="Enter replacement text"
                className="pl-10 border-2 border-foreground"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Options</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={matchCase}
                  onChange={(e) => {
                    setMatchCase(e.target.checked);
                    setPreviewCount(null);
                  }}
                  className="w-4 h-4 border-2 border-foreground"
                />
                <span className="text-sm">Match case</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={matchWholeWord}
                  onChange={(e) => {
                    setMatchWholeWord(e.target.checked);
                    setPreviewCount(null);
                  }}
                  className="w-4 h-4 border-2 border-foreground"
                />
                <span className="text-sm">Match whole word</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          {previewCount !== null && (
            <div className={`p-4 rounded-lg border-2 ${
              previewCount > 0 
                ? 'bg-success/10 border-success/20' 
                : 'bg-muted/50 border-border'
            }`}>
              <div className="flex items-center gap-2">
                {previewCount > 0 ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="font-semibold text-success">
                      {previewCount} occurrence(s) found
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">No matches found</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="flex-1 border-2 border-foreground shadow-brutal-hover"
              disabled={!selectedColumn || !findValue}
            >
              <Search className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-primary text-primary-foreground border-2 border-foreground shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              disabled={!selectedColumn || !findValue || previewCount === null || previewCount === 0}
            >
              <Replace className="h-4 w-4 mr-2" />
              Apply Replace
            </Button>
          </div>
        </CardContent>
      </Card>

      {stringColumns.length === 0 && (
        <Card className="border-2 border-foreground shadow-brutal bg-muted/30">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              No string columns available for find and replace operations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


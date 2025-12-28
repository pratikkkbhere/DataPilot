import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Play, Code, AlertCircle, Check, HelpCircle } from 'lucide-react';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  error?: string;
  isLoading?: boolean;
  columns: string[];
}

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE',
  'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT', 'RIGHT',
  'INNER', 'OUTER', 'ON', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'NULL', 'IS', 'ASC', 'DESC',
  'UNION', 'EXCEPT', 'INTERSECT', 'ALL', 'ANY', 'EXISTS', 'OVER', 'PARTITION BY',
  'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LEAD', 'LAG', 'FIRST_VALUE', 'LAST_VALUE',
  'ROUND', 'COALESCE', 'NULLIF', 'CAST', 'CONVERT'
];

export function SQLEditor({ value, onChange, onExecute, error, isLoading, columns }: SQLEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isValid, setIsValid] = useState(true);
  
  // Basic SQL validation
  useEffect(() => {
    const trimmed = value.trim().toUpperCase();
    const valid = trimmed.startsWith('SELECT') || trimmed === '';
    setIsValid(valid);
  }, [value]);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`;
    }
  }, [value]);
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (isValid && !isLoading) {
        onExecute();
      }
    }
    
    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);
        // Set cursor position after indent
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };
  
  return (
    <Card className="border-2 border-foreground shadow-brutal">
      <CardHeader className="border-b-2 border-foreground bg-secondary text-secondary-foreground">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            SQL EDITOR
          </div>
          <div className="flex items-center gap-2">
            {isValid ? (
              <Badge className="bg-success text-success-foreground border-2 border-foreground">
                <Check className="h-3 w-3 mr-1" /> Valid
              </Badge>
            ) : (
              <Badge className="bg-destructive text-destructive-foreground border-2 border-foreground">
                <AlertCircle className="h-3 w-3 mr-1" /> Invalid
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Available Columns */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold">Available Columns:</span>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Click to insert column name into query</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-wrap gap-1">
            {columns.map(col => (
              <Badge
                key={col}
                variant="outline"
                className="cursor-pointer border-2 border-foreground text-xs hover:bg-muted"
                onClick={() => {
                  const textarea = textareaRef.current;
                  if (textarea) {
                    const start = textarea.selectionStart;
                    const newValue = value.substring(0, start) + `[${col}]` + value.substring(start);
                    onChange(newValue);
                    textarea.focus();
                  }
                }}
              >
                {col}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* SQL Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`-- Write your SQL query here
SELECT *
FROM dataset
WHERE column_name = 'value'
ORDER BY column_name DESC
LIMIT 100`}
            className={`
              w-full min-h-[200px] p-4 font-mono text-sm 
              bg-background border-2 border-foreground 
              resize-none focus:outline-none focus:ring-2 focus:ring-primary
              ${!isValid ? 'border-destructive' : ''}
            `}
            spellCheck={false}
          />
          
          {/* Line numbers indicator */}
          <div className="absolute top-2 right-2 text-xs text-muted-foreground">
            {value.split('\n').length} lines
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 border-2 border-destructive text-destructive flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Query Error</p>
              <p className="text-sm font-mono">{error}</p>
            </div>
          </div>
        )}
        
        {/* Keyboard Shortcuts */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex gap-4">
            <span><kbd className="px-1 py-0.5 bg-muted border border-foreground">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-muted border border-foreground">Enter</kbd> Run Query</span>
            <span><kbd className="px-1 py-0.5 bg-muted border border-foreground">Tab</kbd> Indent</span>
          </div>
          
          <Button
            onClick={onExecute}
            disabled={!isValid || isLoading || !value.trim()}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isLoading ? 'Running...' : 'Run Query'}
          </Button>
        </div>
        
        {/* SQL Keywords Help */}
        <details className="text-sm">
          <summary className="cursor-pointer font-bold text-muted-foreground hover:text-foreground">
            SQL Keywords Reference
          </summary>
          <div className="mt-2 p-3 bg-muted border-2 border-foreground flex flex-wrap gap-1">
            {SQL_KEYWORDS.map(kw => (
              <Badge
                key={kw}
                variant="outline"
                className="text-xs border border-foreground font-mono"
              >
                {kw}
              </Badge>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

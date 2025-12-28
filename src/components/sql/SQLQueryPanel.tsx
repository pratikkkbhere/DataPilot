import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, Wand2, Code, Copy, Clock, Rows3, Download, BarChart3 } from 'lucide-react';
import { DataRow, ColumnStats } from '@/types/data';
import { SQLQueryResult } from '@/types/sql';
import { initializeDataset, executeQuery } from '@/lib/sqlEngine';
import { VisualQueryBuilder } from './VisualQueryBuilder';
import { SQLEditor } from './SQLEditor';
import { SQLTemplates } from './SQLTemplates';
import { ChartBuilder } from '@/components/visualization/ChartBuilder';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface SQLQueryPanelProps {
  data: DataRow[];
  columns: ColumnStats[];
}

export function SQLQueryPanel({ data, columns }: SQLQueryPanelProps) {
  const [activeTab, setActiveTab] = useState('visual');
  const [sqlQuery, setSqlQuery] = useState('SELECT *\nFROM dataset\nLIMIT 10');
  const [result, setResult] = useState<SQLQueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 50;
  
  const columnNames = columns.map(c => c.name);
  
  // Initialize dataset when data changes
  useEffect(() => {
    initializeDataset(data);
  }, [data]);
  
  // Execute query
  const handleExecute = useCallback(() => {
    setIsLoading(true);
    setPage(0);
    
    setTimeout(() => {
      const queryResult = executeQuery(sqlQuery);
      setResult(queryResult);
      setIsLoading(false);
    }, 50);
  }, [sqlQuery]);
  
  // Handle visual builder query generation
  const handleVisualQuery = useCallback((sql: string) => {
    setSqlQuery(sql);
  }, []);
  
  // Handle template selection
  const handleTemplateSelect = (query: string) => {
    setSqlQuery(query);
    setActiveTab('editor');
  };
  
  // Export results
  const exportCSV = () => {
    if (!result?.data.length) return;
    const headers = result.columns.join(',');
    const rows = result.data.map(row => 
      result.columns.map(col => {
        const val = row[col];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'query_results.csv');
  };
  
  const exportExcel = () => {
    if (!result?.data.length) return;
    const ws = XLSX.utils.json_to_sheet(result.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Query Results');
    XLSX.writeFile(wb, 'query_results.xlsx');
  };
  
  // Paginated data
  const paginatedData = result?.data.slice(page * pageSize, (page + 1) * pageSize) || [];
  const totalPages = result ? Math.ceil(result.rowCount / pageSize) : 0;
  
  // Build column stats for chart builder
  const resultColumnStats: ColumnStats[] = result?.columns.map(name => {
    const values = result.data.map(r => r[name]);
    const isNumeric = values.every(v => typeof v === 'number' || !isNaN(Number(v)));
    return {
      name,
      type: isNumeric ? 'number' : 'string',
      totalCount: result.rowCount,
      missingCount: 0,
      missingPercentage: 0,
      uniqueCount: new Set(values).size
    };
  }) || [];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-foreground shadow-brutal bg-card">
        <CardHeader className="border-b-2 border-foreground">
          <CardTitle className="flex items-center gap-3">
            <Database className="h-6 w-6" />
            CREATE YOUR OWN SQL QUERY
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <Badge variant="outline" className="border-2 gap-1">
              <Rows3 className="h-3 w-3" /> Table: dataset
            </Badge>
            <Badge variant="outline" className="border-2 gap-1">
              {data.length.toLocaleString()} rows
            </Badge>
            <Badge variant="outline" className="border-2 gap-1">
              {columnNames.length} columns
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* Query Builder Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 border-2 border-foreground bg-muted p-1 h-auto">
          <TabsTrigger value="visual" className="gap-2 py-3 data-[state=active]:shadow-brutal">
            <Wand2 className="h-4 w-4" /> Visual Builder
          </TabsTrigger>
          <TabsTrigger value="editor" className="gap-2 py-3 data-[state=active]:shadow-brutal">
            <Code className="h-4 w-4" /> SQL Editor
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2 py-3 data-[state=active]:shadow-brutal">
            <Copy className="h-4 w-4" /> Templates
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visual" className="mt-4 space-y-4">
          <VisualQueryBuilder columns={columnNames} onQueryGenerated={handleVisualQuery} />
          <SQLEditor 
            value={sqlQuery} 
            onChange={setSqlQuery} 
            onExecute={handleExecute}
            error={result?.error}
            isLoading={isLoading}
            columns={columnNames}
          />
        </TabsContent>
        
        <TabsContent value="editor" className="mt-4">
          <SQLEditor 
            value={sqlQuery} 
            onChange={setSqlQuery} 
            onExecute={handleExecute}
            error={result?.error}
            isLoading={isLoading}
            columns={columnNames}
          />
        </TabsContent>
        
        <TabsContent value="templates" className="mt-4 space-y-4">
          <SQLTemplates columns={columnNames} onSelectTemplate={handleTemplateSelect} />
        </TabsContent>
      </Tabs>
      
      {/* Results */}
      {result && !result.error && (
        <Card className="border-2 border-foreground shadow-brutal">
          <CardHeader className="border-b-2 border-foreground bg-success text-success-foreground">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Rows3 className="h-5 w-5" />
                QUERY RESULTS
              </div>
              <div className="flex items-center gap-4 text-sm font-normal">
                <Badge variant="secondary" className="border-2 border-foreground gap-1">
                  <Rows3 className="h-3 w-3" /> {result.rowCount} rows
                </Badge>
                <Badge variant="secondary" className="border-2 border-foreground gap-1">
                  <Clock className="h-3 w-3" /> {result.executionTime.toFixed(2)}ms
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1 border-2">
                <Download className="h-4 w-4" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportExcel} className="gap-1 border-2">
                <Download className="h-4 w-4" /> Excel
              </Button>
              <Button 
                variant={showChart ? "default" : "outline"} 
                size="sm" 
                onClick={() => setShowChart(!showChart)}
                className="gap-1 border-2"
              >
                <BarChart3 className="h-4 w-4" /> {showChart ? 'Hide Chart' : 'Visualize'}
              </Button>
            </div>
            
            {/* Results Table */}
            <div className="border-2 border-foreground overflow-auto max-h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-muted">
                  <TableRow className="border-b-2 border-foreground">
                    {result.columns.map(col => (
                      <TableHead key={col} className="font-bold border-r border-foreground last:border-r-0">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, i) => (
                    <TableRow key={i} className="border-b border-foreground">
                      {result.columns.map(col => (
                        <TableCell key={col} className="border-r border-foreground last:border-r-0 font-mono text-sm">
                          {String(row[col] ?? '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Chart Visualization */}
      {showChart && result && result.data.length > 0 && (
        <ChartBuilder data={result.data as DataRow[]} columns={resultColumnStats} />
      )}
    </div>
  );
}

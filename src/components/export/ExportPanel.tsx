import { DataRow } from '@/types/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet, FileText, FileImage } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface ExportPanelProps {
  data: DataRow[];
  fileName: string;
}

export function ExportPanel({ data, fileName }: ExportPanelProps) {
  const baseName = fileName.replace(/\.[^/.]+$/, '');

  const exportCSV = () => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          const val = row[h];
          const str = String(val ?? '');
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${baseName}_cleaned.csv`);
  };

  const exportExcel = () => {
    if (data.length === 0) return;
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cleaned Data');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${baseName}_cleaned.xlsx`);
  };

  const exportJSON = () => {
    if (data.length === 0) return;
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `${baseName}_cleaned.json`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Export Your Data</h2>
        <p className="text-muted-foreground">
          Download your cleaned and processed dataset in your preferred format
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group" onClick={exportCSV}>
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-chart-1/20 flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
              <FileText className="h-8 w-8 text-chart-1" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">CSV File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Universal format compatible with any spreadsheet software
            </p>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group" onClick={exportExcel}>
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-chart-6/20 flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
              <FileSpreadsheet className="h-8 w-8 text-chart-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Excel File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Native Excel format with full formatting support
            </p>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Excel
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group" onClick={exportJSON}>
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-chart-2/20 flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
              <FileImage className="h-8 w-8 text-chart-2" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">JSON File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Structured format ideal for developers and APIs
            </p>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border max-w-4xl mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Export Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-semibold text-foreground">{data.length.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Rows</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-semibold text-foreground">{data.length > 0 ? Object.keys(data[0]).length : 0}</p>
              <p className="text-sm text-muted-foreground">Total Columns</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-semibold text-foreground">{baseName}</p>
              <p className="text-sm text-muted-foreground">File Name</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-semibold text-success">Ready</p>
              <p className="text-sm text-muted-foreground">Status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

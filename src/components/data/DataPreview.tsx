import { useMemo, useState } from 'react';
import { DataRow } from '@/types/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Rows, Columns } from 'lucide-react';

interface DataPreviewProps {
  data: DataRow[];
  title?: string;
  maxRows?: number;
}

export function DataPreview({ data, title = 'Data Preview', maxRows = 50 }: DataPreviewProps) {
  const [page, setPage] = useState(0);
  const rowsPerPage = maxRows;

  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page, rowsPerPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Rows className="h-4 w-4" />
            <span>{data.length.toLocaleString()} rows</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Columns className="h-4 w-4" />
            <span>{columns.length} columns</span>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((col) => (
                  <TableHead key={col} className="font-semibold text-foreground whitespace-nowrap">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, i) => (
                <TableRow key={i} className="hover:bg-muted/30">
                  {columns.map((col) => (
                    <TableCell key={col} className="whitespace-nowrap max-w-xs truncate">
                      {String(row[col] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { ColumnStats, DatasetSummary, CleaningSummary, CleaningAction, DataRow, FilterConfig, SortConfig, AggregationConfig } from '@/types/data';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Detect the data type of a column
export function detectColumnType(values: unknown[]): 'number' | 'string' | 'date' | 'boolean' | 'mixed' {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNullValues.length === 0) return 'string';

  let numberCount = 0;
  let dateCount = 0;
  let booleanCount = 0;

  for (const value of nonNullValues) {
    const str = String(value).trim();
    
    if (str.toLowerCase() === 'true' || str.toLowerCase() === 'false') {
      booleanCount++;
    } else if (!isNaN(Number(str)) && str !== '') {
      numberCount++;
    } else if (isValidDate(str)) {
      dateCount++;
    }
  }

  const threshold = nonNullValues.length * 0.8;
  
  if (booleanCount >= threshold) return 'boolean';
  if (numberCount >= threshold) return 'number';
  if (dateCount >= threshold) return 'date';
  
  return 'string';
}

function isValidDate(str: string): boolean {
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{2}\/\d{2}\/\d{4}$/,
    /^\d{2}-\d{2}-\d{4}$/,
  ];
  return datePatterns.some(p => p.test(str)) && !isNaN(Date.parse(str));
}

// Calculate statistics for a numeric column
function calculateNumericStats(values: number[]): { min: number; max: number; mean: number; median: number; standardDev: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  const standardDev = Math.sqrt(avgSquaredDiff);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    standardDev: Math.round(standardDev * 100) / 100,
  };
}

// Calculate mode for a column
function calculateMode(values: unknown[]): string | number | undefined {
  const frequency: Record<string, number> = {};
  let maxFreq = 0;
  let mode: string | number | undefined;
  
  for (const value of values) {
    const key = String(value);
    frequency[key] = (frequency[key] || 0) + 1;
    if (frequency[key] > maxFreq) {
      maxFreq = frequency[key];
      mode = value as string | number;
    }
  }
  
  return mode;
}

// Profile the entire dataset
export function profileDataset(data: DataRow[]): DatasetSummary {
  if (data.length === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      overallMissingPercentage: 0,
      duplicateRowCount: 0,
      columnStats: [],
    };
  }

  const columns = Object.keys(data[0]);
  const columnStats: ColumnStats[] = [];
  let totalMissing = 0;

  for (const col of columns) {
    const values = data.map(row => row[col]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const missingCount = values.length - nonNullValues.length;
    totalMissing += missingCount;
    
    const type = detectColumnType(values);
    const uniqueValues = new Set(nonNullValues.map(String));
    
    const stats: ColumnStats = {
      name: col,
      type,
      totalCount: values.length,
      missingCount,
      missingPercentage: Math.round((missingCount / values.length) * 10000) / 100,
      uniqueCount: uniqueValues.size,
      mode: calculateMode(nonNullValues),
    };

    if (type === 'number') {
      const numericValues = nonNullValues.map(Number).filter(n => !isNaN(n));
      if (numericValues.length > 0) {
        const numStats = calculateNumericStats(numericValues);
        Object.assign(stats, numStats);
      }
    } else if (type === 'string' || type === 'date') {
      const strValues = nonNullValues.map(String).sort();
      stats.min = strValues[0];
      stats.max = strValues[strValues.length - 1];
    }

    columnStats.push(stats);
  }

  // Count duplicate rows
  const rowStrings = data.map(row => JSON.stringify(row));
  const uniqueRows = new Set(rowStrings);
  const duplicateRowCount = data.length - uniqueRows.size;

  return {
    totalRows: data.length,
    totalColumns: columns.length,
    overallMissingPercentage: Math.round((totalMissing / (data.length * columns.length)) * 10000) / 100,
    duplicateRowCount,
    columnStats,
  };
}

// Clean the dataset
export function cleanDataset(data: DataRow[], columnStats: ColumnStats[]): { cleanedData: DataRow[]; summary: CleaningSummary } {
  const actions: CleaningAction[] = [];
  let cleanedData = [...data.map(row => ({ ...row }))];
  const totalRowsBefore = cleanedData.length;

  // Remove duplicate rows
  const seenRows = new Set<string>();
  const uniqueData: DataRow[] = [];
  let duplicatesRemoved = 0;
  
  for (const row of cleanedData) {
    const rowKey = JSON.stringify(row);
    if (!seenRows.has(rowKey)) {
      seenRows.add(rowKey);
      uniqueData.push(row);
    } else {
      duplicatesRemoved++;
    }
  }
  cleanedData = uniqueData;

  if (duplicatesRemoved > 0) {
    actions.push({
      column: 'All',
      action: 'Remove duplicates',
      affectedRows: duplicatesRemoved,
      details: `Removed ${duplicatesRemoved} duplicate rows`,
    });
  }

  // Handle missing values and clean each column
  for (const stats of columnStats) {
    const col = stats.name;
    
    if (stats.missingCount > 0) {
      let fillValue: unknown;
      let fillMethod: string;

      if (stats.type === 'number') {
        fillValue = stats.median ?? stats.mean ?? 0;
        fillMethod = 'median';
      } else {
        fillValue = stats.mode ?? '';
        fillMethod = 'mode';
      }

      let filled = 0;
      for (const row of cleanedData) {
        if (row[col] === null || row[col] === undefined || row[col] === '') {
          row[col] = fillValue;
          filled++;
        }
      }

      if (filled > 0) {
        actions.push({
          column: col,
          action: `Fill missing with ${fillMethod}`,
          affectedRows: filled,
          details: `Filled ${filled} missing values with ${fillValue}`,
        });
      }
    }

    // Trim strings and normalize text
    if (stats.type === 'string') {
      let trimmed = 0;
      for (const row of cleanedData) {
        const original = row[col];
        if (typeof original === 'string') {
          const cleaned = original.trim();
          if (cleaned !== original) {
            row[col] = cleaned;
            trimmed++;
          }
        }
      }

      if (trimmed > 0) {
        actions.push({
          column: col,
          action: 'Trim whitespace',
          affectedRows: trimmed,
          details: `Trimmed whitespace from ${trimmed} values`,
        });
      }
    }

    // Convert to proper types
    if (stats.type === 'number') {
      for (const row of cleanedData) {
        const val = row[col];
        if (typeof val === 'string' && val !== '') {
          const num = Number(val);
          if (!isNaN(num)) {
            row[col] = num;
          }
        }
      }
    }
  }

  return {
    cleanedData,
    summary: {
      totalRowsBefore,
      totalRowsAfter: cleanedData.length,
      duplicatesRemoved,
      actions,
    },
  };
}

// Apply filters to data
export function applyFilters(data: DataRow[], filters: FilterConfig[]): DataRow[] {
  return data.filter(row => {
    return filters.every(filter => {
      const value = row[filter.column];
      const strValue = String(value ?? '').toLowerCase();
      const filterValue = String(filter.value ?? '').toLowerCase();

      switch (filter.operator) {
        case 'equals':
          return strValue === filterValue;
        case 'not_equals':
          return strValue !== filterValue;
        case 'contains':
          return strValue.includes(filterValue);
        case 'greater_than':
          return Number(value) > Number(filter.value);
        case 'less_than':
          return Number(value) < Number(filter.value);
        case 'between':
          return Number(value) >= Number(filter.value) && Number(value) <= Number(filter.value2);
        case 'is_null':
          return value === null || value === undefined || value === '';
        case 'is_not_null':
          return value !== null && value !== undefined && value !== '';
        default:
          return true;
      }
    });
  });
}

// Apply sorting to data
export function applySort(data: DataRow[], sorts: SortConfig[]): DataRow[] {
  return [...data].sort((a, b) => {
    for (const sort of sorts) {
      const aVal = a[sort.column];
      const bVal = b[sort.column];
      
      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal ?? '').localeCompare(String(bVal ?? ''));
      }
      
      if (comparison !== 0) {
        return sort.direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
}

// Perform aggregation
export function performAggregation(data: DataRow[], config: AggregationConfig): DataRow[] {
  const groups = new Map<string, DataRow[]>();

  // Group data
  for (const row of data) {
    const key = config.groupByColumns.map(col => String(row[col] ?? '')).join('|||');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  }

  // Aggregate each group
  const result: DataRow[] = [];
  
  for (const [key, rows] of groups) {
    const keyParts = key.split('|||');
    const aggregatedRow: DataRow = {};
    
    // Add group by columns
    config.groupByColumns.forEach((col, i) => {
      aggregatedRow[col] = keyParts[i];
    });

    // Calculate aggregations
    for (const agg of config.aggregations) {
      const values = rows.map(r => r[agg.column]).filter(v => v !== null && v !== undefined);
      const numValues = values.map(Number).filter(n => !isNaN(n));
      
      let result: number;
      const aggName = `${agg.function}_${agg.column}`;

      switch (agg.function) {
        case 'count':
          result = values.length;
          break;
        case 'sum':
          result = numValues.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          result = numValues.length > 0 ? numValues.reduce((a, b) => a + b, 0) / numValues.length : 0;
          break;
        case 'median': {
          const sorted = [...numValues].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          result = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
          break;
        }
        case 'min':
          result = Math.min(...numValues);
          break;
        case 'max':
          result = Math.max(...numValues);
          break;
        default:
          result = 0;
      }

      aggregatedRow[aggName] = Math.round(result * 100) / 100;
    }

    result.push(aggregatedRow);
  }

  return result;
}

// Prepare chart data
export function prepareChartData(data: DataRow[], xAxis: string, yAxis?: string, aggregation: 'count' | 'sum' | 'avg' = 'count') {
  const groups = new Map<string, number[]>();

  for (const row of data) {
    const xVal = String(row[xAxis] ?? 'Unknown');
    if (!groups.has(xVal)) {
      groups.set(xVal, []);
    }
    if (yAxis) {
      const yVal = Number(row[yAxis]);
      if (!isNaN(yVal)) {
        groups.get(xVal)!.push(yVal);
      }
    } else {
      groups.get(xVal)!.push(1);
    }
  }

  const chartData: { name: string; value: number }[] = [];

  for (const [name, values] of groups) {
    let value: number;
    switch (aggregation) {
      case 'count':
        value = values.length;
        break;
      case 'sum':
        value = values.reduce((a, b) => a + b, 0);
        break;
      case 'avg':
        value = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        break;
    }
    chartData.push({ name, value: Math.round(value * 100) / 100 });
  }

  return chartData.sort((a, b) => b.value - a.value).slice(0, 20);
}

// Prepare scatter plot data
export function prepareScatterData(data: DataRow[], xAxis: string, yAxis: string) {
  return data
    .map(row => ({
      x: Number(row[xAxis]),
      y: Number(row[yAxis]),
    }))
    .filter(point => !isNaN(point.x) && !isNaN(point.y))
    .slice(0, 500);
}

// Prepare histogram data
export function prepareHistogramData(data: DataRow[], column: string, bins: number = 10) {
  const values = data.map(row => Number(row[column])).filter(n => !isNaN(n));
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / bins;

  const histogram: { range: string; count: number }[] = [];
  
  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = values.filter(v => v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)).length;
    histogram.push({
      range: `${Math.round(binStart * 10) / 10} - ${Math.round(binEnd * 10) / 10}`,
      count,
    });
  }

  return histogram;
}

// Parse CSV file
export async function parseCSV(file: File): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as DataRow[]);
      },
      error: (err) => {
        reject(new Error(`Failed to parse CSV: ${err.message}`));
      },
    });
  });
}

// Parse Excel file
export async function parseExcel(file: File): Promise<DataRow[]> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet) as DataRow[];
    return data;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export type { DataRow };

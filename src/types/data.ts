export interface ColumnStats {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean' | 'mixed';
  totalCount: number;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  mode?: string | number;
  standardDev?: number;
}

export interface DatasetSummary {
  totalRows: number;
  totalColumns: number;
  overallMissingPercentage: number;
  duplicateRowCount: number;
  columnStats: ColumnStats[];
}

export interface CleaningAction {
  column: string;
  action: string;
  affectedRows: number;
  details: string;
}

export interface CleaningSummary {
  totalRowsBefore: number;
  totalRowsAfter: number;
  duplicatesRemoved: number;
  actions: CleaningAction[];
}

export interface FilterConfig {
  column: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'is_null' | 'is_not_null';
  value?: string | number;
  value2?: string | number;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface AggregationConfig {
  groupByColumns: string[];
  aggregations: {
    column: string;
    function: 'count' | 'sum' | 'avg' | 'median' | 'min' | 'max';
  }[];
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'histogram' | 'scatter' | 'heatmap';
  xAxis?: string;
  yAxis?: string;
  aggregation?: 'count' | 'sum' | 'avg';
}

export type DataRow = Record<string, unknown>;

// Missing Value Configuration Types
export type MissingValueStrategy = 
  | 'leave_null'
  | 'fill_mean'
  | 'fill_median'
  | 'fill_mode'
  | 'fill_custom'
  | 'fill_earliest'
  | 'fill_latest'
  | 'drop_rows';

export interface MissingValueConfig {
  column: string;
  strategy: MissingValueStrategy;
  customValue?: string | number | Date;
}

export interface MissingValuePreview {
  column: string;
  strategy: MissingValueStrategy;
  affectedRows: number;
  description: string;
}

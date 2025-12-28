export interface SQLQueryResult {
  data: Record<string, unknown>[];
  columns: string[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

export interface VisualQueryConfig {
  selectColumns: string[];
  whereConditions: WhereCondition[];
  groupByColumns: string[];
  orderByColumns: OrderByConfig[];
  aggregations: AggregationConfig[];
  limit?: number;
  having?: string;
}

export interface WhereCondition {
  id: string;
  column: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'between' | 'is_null' | 'is_not_null' | 'in' | 'like';
  value: string;
  value2?: string;
  connector?: 'AND' | 'OR';
}

export interface OrderByConfig {
  column: string;
  direction: 'ASC' | 'DESC';
}

export interface AggregationConfig {
  id: string;
  column: string;
  function: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
  alias?: string;
}

export interface SQLTemplate {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'analysis' | 'aggregation' | 'advanced' | 'quality';
  query: string;
  icon: string;
}

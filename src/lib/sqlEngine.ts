import alasql from 'alasql';
import { SQLQueryResult, VisualQueryConfig } from '@/types/sql';
import { DataRow } from '@/types/data';

// Initialize the dataset table
export function initializeDataset(data: DataRow[]): void {
  // Drop table if exists and create new one
  try {
    alasql('DROP TABLE IF EXISTS dataset');
  } catch (e) {
    // Table might not exist, ignore
  }
  
  if (data.length === 0) return;
  
  // Create table and insert data
  alasql('CREATE TABLE dataset');
  alasql.tables.dataset.data = [...data];
}

// Execute SQL query
export function executeQuery(sql: string): SQLQueryResult {
  const startTime = performance.now();
  
  try {
    // Basic SQL validation
    const normalizedSql = sql.trim().toUpperCase();
    
    // Only allow SELECT statements for safety
    if (!normalizedSql.startsWith('SELECT')) {
      return {
        data: [],
        columns: [],
        rowCount: 0,
        executionTime: 0,
        error: 'Only SELECT queries are allowed for data analysis'
      };
    }
    
    // Check for dangerous operations
    const dangerousKeywords = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER', 'TRUNCATE'];
    for (const keyword of dangerousKeywords) {
      if (normalizedSql.includes(keyword) && !normalizedSql.startsWith('SELECT')) {
        return {
          data: [],
          columns: [],
          rowCount: 0,
          executionTime: 0,
          error: `${keyword} operations are not allowed`
        };
      }
    }
    
    const rawResult = alasql(sql) as Record<string, unknown>[];
    const result: Record<string, unknown>[] = Array.isArray(rawResult) ? rawResult : [];
    const endTime = performance.now();
    
    // Handle empty results
    if (!result || result.length === 0) {
      return {
        data: [],
        columns: [],
        rowCount: 0,
        executionTime: endTime - startTime
      };
    }
    
    // Extract column names from first row
    const columns = Object.keys(result[0]);
    
    return {
      data: result,
      columns,
      rowCount: result.length,
      executionTime: endTime - startTime
    };
  } catch (error) {
    return {
      data: [],
      columns: [],
      rowCount: 0,
      executionTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Query execution failed'
    };
  }
}

// Build SQL from visual config
export function buildQueryFromVisual(config: VisualQueryConfig, columns: string[]): string {
  const parts: string[] = [];
  
  // SELECT clause
  let selectParts: string[] = [];
  
  // Add aggregations first
  if (config.aggregations.length > 0) {
    config.aggregations.forEach(agg => {
      const alias = agg.alias || `${agg.function.toLowerCase()}_${agg.column}`;
      if (agg.column === '*') {
        selectParts.push(`${agg.function}(*) AS ${alias}`);
      } else {
        selectParts.push(`${agg.function}([${agg.column}]) AS [${alias}]`);
      }
    });
  }
  
  // Add regular columns
  if (config.selectColumns.length > 0) {
    const regularCols = config.selectColumns
      .filter(col => col !== '*')
      .map(col => `[${col}]`);
    
    if (config.selectColumns.includes('*')) {
      if (selectParts.length === 0) {
        selectParts.push('*');
      } else {
        // If we have aggregations and *, add all non-aggregated columns
        const aggCols = config.aggregations.map(a => a.column);
        columns.forEach(col => {
          if (!aggCols.includes(col)) {
            selectParts.push(`[${col}]`);
          }
        });
      }
    } else {
      selectParts = [...regularCols, ...selectParts];
    }
  } else if (selectParts.length === 0) {
    selectParts.push('*');
  }
  
  parts.push(`SELECT ${selectParts.join(', ')}`);
  parts.push('FROM dataset');
  
  // WHERE clause
  if (config.whereConditions.length > 0) {
    const whereParts = config.whereConditions.map((cond, index) => {
      let condition = '';
      const col = `[${cond.column}]`;
      
      switch (cond.operator) {
        case 'equals':
          condition = `${col} = '${cond.value}'`;
          break;
        case 'not_equals':
          condition = `${col} != '${cond.value}'`;
          break;
        case 'contains':
          condition = `${col} LIKE '%${cond.value}%'`;
          break;
        case 'like':
          condition = `${col} LIKE '${cond.value}'`;
          break;
        case 'greater_than':
          condition = `${col} > ${cond.value}`;
          break;
        case 'less_than':
          condition = `${col} < ${cond.value}`;
          break;
        case 'greater_equal':
          condition = `${col} >= ${cond.value}`;
          break;
        case 'less_equal':
          condition = `${col} <= ${cond.value}`;
          break;
        case 'between':
          condition = `${col} BETWEEN ${cond.value} AND ${cond.value2}`;
          break;
        case 'is_null':
          condition = `${col} IS NULL`;
          break;
        case 'is_not_null':
          condition = `${col} IS NOT NULL`;
          break;
        case 'in':
          const values = cond.value.split(',').map(v => `'${v.trim()}'`).join(', ');
          condition = `${col} IN (${values})`;
          break;
      }
      
      if (index > 0 && cond.connector) {
        return `${cond.connector} ${condition}`;
      }
      return condition;
    });
    
    parts.push(`WHERE ${whereParts.join(' ')}`);
  }
  
  // GROUP BY clause
  if (config.groupByColumns.length > 0) {
    const groupCols = config.groupByColumns.map(col => `[${col}]`).join(', ');
    parts.push(`GROUP BY ${groupCols}`);
  }
  
  // HAVING clause
  if (config.having) {
    parts.push(`HAVING ${config.having}`);
  }
  
  // ORDER BY clause
  if (config.orderByColumns.length > 0) {
    const orderParts = config.orderByColumns.map(o => `[${o.column}] ${o.direction}`).join(', ');
    parts.push(`ORDER BY ${orderParts}`);
  }
  
  // LIMIT clause
  if (config.limit && config.limit > 0) {
    parts.push(`LIMIT ${config.limit}`);
  }
  
  return parts.join('\n');
}

// Get column info from dataset
export function getDatasetInfo(): { columns: { name: string; type: string }[]; sampleData: DataRow[] } {
  try {
    const rawData = alasql.tables.dataset?.data as DataRow[] | undefined;
    const data: DataRow[] = rawData || [];
    if (data.length === 0) {
      return { columns: [], sampleData: [] };
    }
    
    const firstRow = data[0];
    const columns = Object.keys(firstRow).map(name => {
      const value = firstRow[name];
      let type = 'string';
      if (typeof value === 'number') type = 'number';
      else if (typeof value === 'boolean') type = 'boolean';
      else if (value instanceof Date) type = 'date';
      return { name, type };
    });
    
    const sampleData = data.slice(0, 10);
    
    return { columns, sampleData };
  } catch {
    return { columns: [], sampleData: [] };
  }
}

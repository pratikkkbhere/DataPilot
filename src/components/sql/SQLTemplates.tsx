import { SQLTemplate } from '@/types/sql';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, Hash, AlertCircle, Copy, ArrowUp, ArrowDown, 
  PieChart, Calendar, Percent, TrendingUp, Medal, 
  Fingerprint, BarChart3, Filter, SortAsc, Activity,
  Search, Target, CheckCircle, Layers, Grid3X3,
  TrendingDown, Timer, LineChart, Award, ArrowLeftRight,
  Users, Slice, ListChecks, Shield, Clock, FileWarning, Scale
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SQLTemplatesProps {
  columns: string[];
  onSelectTemplate: (query: string) => void;
}

const getTemplates = (columns: string[]): SQLTemplate[] => {
  const firstCol = columns[0] || 'column_name';
  const secondCol = columns[1] || 'second_column';
  const numericCol = columns.find(c => !isNaN(Number(c))) || columns[1] || 'numeric_column';
  const dateCol = columns.find(c => c.toLowerCase().includes('date')) || columns[0] || 'date_column';
  const categoryCol = columns.find(c => c.toLowerCase().includes('category') || c.toLowerCase().includes('type')) || firstCol;
  const subCategoryCol = columns.find(c => c.toLowerCase().includes('sub') || c.toLowerCase().includes('name')) || secondCol;
  
  return [
    // ==================== BASIC ====================
    {
      id: 'view_sample',
      name: 'View Sample Data',
      description: 'Preview first 10 rows of the dataset',
      category: 'basic',
      icon: 'eye',
      query: `SELECT *\nFROM dataset\nLIMIT 10`
    },
    {
      id: 'count_rows',
      name: 'Count Total Rows',
      description: 'Get the total number of rows',
      category: 'basic',
      icon: 'hash',
      query: `SELECT COUNT(*) AS total_rows\nFROM dataset`
    },
    {
      id: 'count_distinct',
      name: 'Count Distinct Values',
      description: 'Find number of unique values in a column',
      category: 'basic',
      icon: 'fingerprint',
      query: `SELECT COUNT(DISTINCT [${firstCol}]) AS unique_count\nFROM dataset`
    },
    {
      id: 'value_frequency',
      name: 'Column Value Frequency',
      description: 'Count how often each value appears',
      category: 'basic',
      icon: 'bar-chart',
      query: `SELECT [${firstCol}], COUNT(*) AS frequency\nFROM dataset\nGROUP BY [${firstCol}]\nORDER BY frequency DESC`
    },
    {
      id: 'sort_dataset',
      name: 'Sort Dataset',
      description: 'Sort by column (ASC / DESC)',
      category: 'basic',
      icon: 'sort',
      query: `SELECT *\nFROM dataset\nORDER BY [${firstCol}] DESC`
    },
    {
      id: 'filter_condition',
      name: 'Filter by Condition',
      description: 'Show rows matching a condition',
      category: 'basic',
      icon: 'filter',
      query: `SELECT *\nFROM dataset\nWHERE [${firstCol}] = 'value'\n  -- Change 'value' to your filter condition`
    },
    {
      id: 'top_n',
      name: 'Top N Records',
      description: 'Get top 10 records by a column',
      category: 'basic',
      icon: 'arrow-up',
      query: `SELECT *\nFROM dataset\nORDER BY [${firstCol}] DESC\nLIMIT 10`
    },
    {
      id: 'bottom_n',
      name: 'Bottom N Records',
      description: 'Get bottom 10 records by a column',
      category: 'basic',
      icon: 'arrow-down',
      query: `SELECT *\nFROM dataset\nORDER BY [${firstCol}] ASC\nLIMIT 10`
    },

    // ==================== ANALYSIS ====================
    {
      id: 'missing_values',
      name: 'Check Missing Values',
      description: 'Find rows with NULL values in a column',
      category: 'analysis',
      icon: 'alert',
      query: `SELECT *\nFROM dataset\nWHERE [${firstCol}] IS NULL\n   OR [${firstCol}] = ''`
    },
    {
      id: 'null_percentage',
      name: 'Null Percentage per Column',
      description: 'Identify columns with high missing data',
      category: 'analysis',
      icon: 'activity',
      query: `SELECT \n  COUNT(*) AS total_rows,\n  SUM(CASE WHEN [${firstCol}] IS NULL OR [${firstCol}] = '' THEN 1 ELSE 0 END) AS null_count,\n  ROUND(SUM(CASE WHEN [${firstCol}] IS NULL OR [${firstCol}] = '' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS null_percentage\nFROM dataset`
    },
    {
      id: 'duplicates',
      name: 'Find Duplicates',
      description: 'Identify duplicate records',
      category: 'analysis',
      icon: 'copy',
      query: `SELECT [${firstCol}], COUNT(*) AS count\nFROM dataset\nGROUP BY [${firstCol}]\nHAVING COUNT(*) > 1\nORDER BY count DESC`
    },
    {
      id: 'outlier_detection',
      name: 'Outlier Detection',
      description: 'Values outside min/max thresholds',
      category: 'analysis',
      icon: 'search',
      query: `SELECT *\nFROM dataset\nWHERE [${numericCol}] < (SELECT AVG([${numericCol}]) - 2 * STDEV([${numericCol}]) FROM dataset)\n   OR [${numericCol}] > (SELECT AVG([${numericCol}]) + 2 * STDEV([${numericCol}]) FROM dataset)`
    },
    {
      id: 'invalid_values',
      name: 'Invalid Value Check',
      description: 'Negative values where not allowed',
      category: 'analysis',
      icon: 'target',
      query: `SELECT *\nFROM dataset\nWHERE [${numericCol}] < 0\n  -- Modify condition for your validation rules`
    },
    {
      id: 'data_range_check',
      name: 'Data Range Check',
      description: 'Values outside expected range',
      category: 'analysis',
      icon: 'check-circle',
      query: `SELECT *,\n  CASE \n    WHEN [${numericCol}] < 0 THEN 'Below Range'\n    WHEN [${numericCol}] > 1000 THEN 'Above Range'\n    ELSE 'In Range'\n  END AS range_status\nFROM dataset\nWHERE [${numericCol}] < 0 OR [${numericCol}] > 1000`
    },
    {
      id: 'consistency_check',
      name: 'Consistency Check',
      description: 'Compare related columns (e.g., total vs sum)',
      category: 'analysis',
      icon: 'scale',
      query: `SELECT *\nFROM dataset\nWHERE [${firstCol}] <> [${secondCol}]\n  -- Compare columns that should match`
    },

    // ==================== AGGREGATION ====================
    {
      id: 'category_agg',
      name: 'Category Aggregation',
      description: 'Group by category with counts and sums',
      category: 'aggregation',
      icon: 'pie',
      query: `SELECT [${firstCol}],\n       COUNT(*) AS count,\n       SUM([${numericCol}]) AS total\nFROM dataset\nGROUP BY [${firstCol}]\nORDER BY count DESC`
    },
    {
      id: 'multi_level_group',
      name: 'Multi-Level Group By',
      description: 'Group by category + sub-category',
      category: 'aggregation',
      icon: 'layers',
      query: `SELECT [${categoryCol}], [${subCategoryCol}],\n       COUNT(*) AS count,\n       SUM([${numericCol}]) AS total\nFROM dataset\nGROUP BY [${categoryCol}], [${subCategoryCol}]\nORDER BY [${categoryCol}], count DESC`
    },
    {
      id: 'pivot_table',
      name: 'Pivot Table',
      description: 'Convert rows into columns',
      category: 'aggregation',
      icon: 'grid',
      query: `SELECT [${categoryCol}],\n       SUM(CASE WHEN [${firstCol}] = 'Value1' THEN [${numericCol}] ELSE 0 END) AS value1_sum,\n       SUM(CASE WHEN [${firstCol}] = 'Value2' THEN [${numericCol}] ELSE 0 END) AS value2_sum\nFROM dataset\nGROUP BY [${categoryCol}]`
    },
    {
      id: 'date_trends',
      name: 'Date-wise Trends',
      description: 'Analyze trends over time',
      category: 'aggregation',
      icon: 'calendar',
      query: `SELECT [${dateCol}],\n       COUNT(*) AS count\nFROM dataset\nGROUP BY [${dateCol}]\nORDER BY [${dateCol}] ASC`
    },
    {
      id: 'running_total',
      name: 'Running Total',
      description: 'Cumulative sum over time',
      category: 'aggregation',
      icon: 'trending-up',
      query: `SELECT [${dateCol}], [${numericCol}],\n       SUM([${numericCol}]) OVER (ORDER BY [${dateCol}]) AS running_total\nFROM dataset\nORDER BY [${dateCol}]`
    },
    {
      id: 'moving_average',
      name: 'Moving Average',
      description: 'Rolling averages (3, 7, 30 days)',
      category: 'aggregation',
      icon: 'line-chart',
      query: `SELECT [${dateCol}], [${numericCol}],\n       AVG([${numericCol}]) OVER (ORDER BY [${dateCol}] ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg_7\nFROM dataset\nORDER BY [${dateCol}]`
    },
    {
      id: 'growth_rate',
      name: 'Growth Rate',
      description: 'Month-over-month / year-over-year growth',
      category: 'aggregation',
      icon: 'trending-down',
      query: `SELECT [${dateCol}], [${numericCol}],\n       LAG([${numericCol}]) OVER (ORDER BY [${dateCol}]) AS prev_value,\n       ROUND(([${numericCol}] - LAG([${numericCol}]) OVER (ORDER BY [${dateCol}])) * 100.0 / NULLIF(LAG([${numericCol}]) OVER (ORDER BY [${dateCol}]), 0), 2) AS growth_pct\nFROM dataset\nORDER BY [${dateCol}]`
    },
    {
      id: 'top_per_group',
      name: 'Top Category per Group',
      description: 'Best-performing item per category',
      category: 'aggregation',
      icon: 'award',
      query: `SELECT *\nFROM (\n  SELECT *, \n    ROW_NUMBER() OVER (PARTITION BY [${categoryCol}] ORDER BY [${numericCol}] DESC) AS rn\n  FROM dataset\n) ranked\nWHERE rn = 1`
    },
    {
      id: 'stats_summary',
      name: 'Statistics Summary',
      description: 'Get min, max, avg, sum for numeric columns',
      category: 'aggregation',
      icon: 'timer',
      query: `SELECT \n       COUNT(*) AS total_count,\n       MIN([${numericCol}]) AS min_value,\n       MAX([${numericCol}]) AS max_value,\n       AVG([${numericCol}]) AS avg_value,\n       SUM([${numericCol}]) AS sum_value\nFROM dataset`
    },

    // ==================== ADVANCED ====================
    {
      id: 'percentage',
      name: 'Percentage Contribution',
      description: 'Calculate percentage of total',
      category: 'advanced',
      icon: 'percent',
      query: `SELECT [${firstCol}],\n       COUNT(*) AS count,\n       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM dataset), 2) AS percentage\nFROM dataset\nGROUP BY [${firstCol}]\nORDER BY percentage DESC`
    },
    {
      id: 'rank_groups',
      name: 'Rank Within Groups',
      description: 'Rank records within each group',
      category: 'advanced',
      icon: 'medal',
      query: `SELECT *,\n       ROW_NUMBER() OVER (PARTITION BY [${firstCol}] ORDER BY [${numericCol}] DESC) AS rank\nFROM dataset`
    },
    {
      id: 'window_lag_lead',
      name: 'Window Functions (LAG/LEAD)',
      description: 'Compare with previous/next row',
      category: 'advanced',
      icon: 'arrow-left-right',
      query: `SELECT [${dateCol}], [${numericCol}],\n       LAG([${numericCol}], 1) OVER (ORDER BY [${dateCol}]) AS prev_value,\n       LEAD([${numericCol}], 1) OVER (ORDER BY [${dateCol}]) AS next_value,\n       [${numericCol}] - LAG([${numericCol}], 1) OVER (ORDER BY [${dateCol}]) AS diff_from_prev\nFROM dataset\nORDER BY [${dateCol}]`
    },
    {
      id: 'trend_comparison',
      name: 'Trend Comparison',
      description: 'Current vs previous period',
      category: 'advanced',
      icon: 'arrow-left-right',
      query: `SELECT [${categoryCol}],\n       SUM(CASE WHEN [${dateCol}] >= '2024-01-01' THEN [${numericCol}] ELSE 0 END) AS current_period,\n       SUM(CASE WHEN [${dateCol}] < '2024-01-01' THEN [${numericCol}] ELSE 0 END) AS previous_period,\n       SUM(CASE WHEN [${dateCol}] >= '2024-01-01' THEN [${numericCol}] ELSE 0 END) - \n       SUM(CASE WHEN [${dateCol}] < '2024-01-01' THEN [${numericCol}] ELSE 0 END) AS difference\nFROM dataset\nGROUP BY [${categoryCol}]`
    },
    {
      id: 'cohort_analysis',
      name: 'Cohort Analysis (Basic)',
      description: 'Group users by first activity date',
      category: 'advanced',
      icon: 'users',
      query: `SELECT first_date AS cohort,\n       COUNT(*) AS cohort_size\nFROM (\n  SELECT [${firstCol}], MIN([${dateCol}]) AS first_date\n  FROM dataset\n  GROUP BY [${firstCol}]\n) cohorts\nGROUP BY first_date\nORDER BY first_date`
    },
    {
      id: 'bucket_binning',
      name: 'Bucket / Binning',
      description: 'Group numeric values into ranges',
      category: 'advanced',
      icon: 'slice',
      query: `SELECT \n  CASE \n    WHEN [${numericCol}] < 10 THEN '0-9'\n    WHEN [${numericCol}] < 50 THEN '10-49'\n    WHEN [${numericCol}] < 100 THEN '50-99'\n    ELSE '100+'\n  END AS bucket,\n  COUNT(*) AS count\nFROM dataset\nGROUP BY \n  CASE \n    WHEN [${numericCol}] < 10 THEN '0-9'\n    WHEN [${numericCol}] < 50 THEN '10-49'\n    WHEN [${numericCol}] < 100 THEN '50-99'\n    ELSE '100+'\n  END\nORDER BY bucket`
    },
    {
      id: 'conditional_agg',
      name: 'Conditional Aggregation',
      description: 'Metrics using CASE WHEN',
      category: 'advanced',
      icon: 'list-checks',
      query: `SELECT [${categoryCol}],\n       COUNT(*) AS total,\n       SUM(CASE WHEN [${numericCol}] > 100 THEN 1 ELSE 0 END) AS high_value_count,\n       SUM(CASE WHEN [${numericCol}] <= 100 THEN 1 ELSE 0 END) AS low_value_count,\n       ROUND(SUM(CASE WHEN [${numericCol}] > 100 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS high_value_pct\nFROM dataset\nGROUP BY [${categoryCol}]`
    },
    {
      id: 'pareto_analysis',
      name: 'Pareto Analysis (80/20)',
      description: 'Top contributors to total value',
      category: 'advanced',
      icon: 'percent',
      query: `SELECT [${firstCol}], [${numericCol}],\n       SUM([${numericCol}]) OVER (ORDER BY [${numericCol}] DESC) AS cumulative_sum,\n       ROUND(SUM([${numericCol}]) OVER (ORDER BY [${numericCol}] DESC) * 100.0 / SUM([${numericCol}]) OVER (), 2) AS cumulative_pct\nFROM dataset\nORDER BY [${numericCol}] DESC`
    },

    // ==================== DATA QUALITY ====================
    {
      id: 'quality_summary',
      name: 'Data Quality Summary',
      description: 'Missing %, duplicates %, invalid %',
      category: 'quality',
      icon: 'shield',
      query: `SELECT \n  COUNT(*) AS total_rows,\n  SUM(CASE WHEN [${firstCol}] IS NULL OR [${firstCol}] = '' THEN 1 ELSE 0 END) AS null_count,\n  ROUND(SUM(CASE WHEN [${firstCol}] IS NULL OR [${firstCol}] = '' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS null_pct,\n  (SELECT COUNT(*) FROM (SELECT [${firstCol}] FROM dataset GROUP BY [${firstCol}] HAVING COUNT(*) > 1)) AS duplicate_groups\nFROM dataset`
    },
    {
      id: 'freshness_check',
      name: 'Freshness Check',
      description: 'Latest date in dataset',
      category: 'quality',
      icon: 'clock',
      query: `SELECT \n  MIN([${dateCol}]) AS earliest_date,\n  MAX([${dateCol}]) AS latest_date,\n  COUNT(DISTINCT [${dateCol}]) AS unique_dates\nFROM dataset`
    },
    {
      id: 'schema_drift',
      name: 'Schema Drift Check',
      description: 'Unexpected nulls or new values',
      category: 'quality',
      icon: 'file-warning',
      query: `SELECT [${firstCol}], COUNT(*) AS count\nFROM dataset\nWHERE [${firstCol}] NOT IN ('Expected1', 'Expected2', 'Expected3')\n  AND [${firstCol}] IS NOT NULL\nGROUP BY [${firstCol}]\nORDER BY count DESC`
    },
    {
      id: 'validation_violations',
      name: 'Validation Rule Violations',
      description: 'Rows breaking business rules',
      category: 'quality',
      icon: 'alert',
      query: `SELECT *,\n  CASE \n    WHEN [${numericCol}] < 0 THEN 'Negative Value'\n    WHEN [${firstCol}] IS NULL THEN 'Missing Required Field'\n    WHEN [${numericCol}] > 10000 THEN 'Value Too High'\n    ELSE 'Valid'\n  END AS violation_type\nFROM dataset\nWHERE [${numericCol}] < 0\n   OR [${firstCol}] IS NULL\n   OR [${numericCol}] > 10000`
    }
  ];
};

const iconMap: Record<string, React.ElementType> = {
  'eye': Eye,
  'hash': Hash,
  'alert': AlertCircle,
  'copy': Copy,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'pie': PieChart,
  'calendar': Calendar,
  'percent': Percent,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'medal': Medal,
  'fingerprint': Fingerprint,
  'bar-chart': BarChart3,
  'filter': Filter,
  'sort': SortAsc,
  'activity': Activity,
  'search': Search,
  'target': Target,
  'check-circle': CheckCircle,
  'layers': Layers,
  'grid': Grid3X3,
  'timer': Timer,
  'line-chart': LineChart,
  'award': Award,
  'arrow-left-right': ArrowLeftRight,
  'users': Users,
  'slice': Slice,
  'list-checks': ListChecks,
  'shield': Shield,
  'clock': Clock,
  'file-warning': FileWarning,
  'scale': Scale
};

const categoryColors: Record<string, string> = {
  'basic': 'bg-info text-info-foreground',
  'analysis': 'bg-warning text-warning-foreground',
  'aggregation': 'bg-success text-success-foreground',
  'advanced': 'bg-accent text-accent-foreground',
  'quality': 'bg-destructive text-destructive-foreground'
};

export function SQLTemplates({ columns, onSelectTemplate }: SQLTemplatesProps) {
  const templates = getTemplates(columns);
  
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, SQLTemplate[]>);
  
  return (
    <Card className="border-2 border-foreground shadow-brutal">
      <CardHeader className="border-b-2 border-foreground bg-muted">
        <CardTitle className="text-lg flex items-center gap-2">
          <Copy className="h-5 w-5" />
          SQL TEMPLATES
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <div key={category} className="space-y-2">
            <Badge className={`${categoryColors[category]} border-2 border-foreground uppercase text-xs`}>
              {category}
            </Badge>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {categoryTemplates.map(template => {
                const IconComponent = iconMap[template.icon] || Eye;
                return (
                  <Tooltip key={template.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-auto py-3 px-4 flex flex-col items-start text-left gap-1 justify-start border-2 hover:shadow-brutal"
                        onClick={() => onSelectTemplate(template.query)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <IconComponent className="h-4 w-4 shrink-0" />
                          <span className="font-bold text-sm truncate">{template.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {template.description}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

import { CleaningSummary as CleaningSummaryType } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, Sparkles, Trash2, Edit3 } from 'lucide-react';

interface CleaningSummaryProps {
  summary: CleaningSummaryType;
}

const actionIcons: Record<string, typeof Sparkles> = {
  'Remove duplicates': Trash2,
  'Fill missing': Edit3,
  'Trim whitespace': Sparkles,
};

export function CleaningSummaryComponent({ summary }: CleaningSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-success/10 border border-success/20 rounded-lg">
        <CheckCircle2 className="h-8 w-8 text-success" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Data Cleaned Successfully</h3>
          <p className="text-sm text-muted-foreground">
            {summary.actions.length} cleaning operations performed
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-semibold text-foreground">{summary.totalRowsBefore.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Rows Before</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-center">
            <ArrowRight className="h-6 w-6 text-primary" />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-semibold text-success">{summary.totalRowsAfter.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Rows After</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Cleaning Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.actions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No cleaning actions were needed - your data was already clean!
            </p>
          ) : (
            <div className="space-y-3">
              {summary.actions.map((action, i) => {
                const Icon = Object.entries(actionIcons).find(([key]) => 
                  action.action.toLowerCase().includes(key.toLowerCase())
                )?.[1] || Sparkles;
                
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-secondary/50">
                          {action.column}
                        </Badge>
                        <span className="font-medium text-foreground">{action.action}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{action.details}</p>
                    </div>
                    <Badge className="bg-chart-1/20 text-chart-1 border-chart-1/30">
                      {action.affectedRows} rows
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

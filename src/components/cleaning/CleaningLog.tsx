import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Sparkles, Trash2, Edit3, Clock } from 'lucide-react';
import { CleaningAction } from '@/types/data';

interface CleaningLogProps {
  actions: CleaningAction[];
}

const actionIcons: Record<string, typeof Sparkles> = {
  'drop': Trash2,
  'fill': Edit3,
  'remove': Trash2,
  'trim': Sparkles,
};

export function CleaningLog({ actions }: CleaningLogProps) {
  if (actions.length === 0) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Cleaning Log ({actions.length} operations)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-2">
            {actions.map((action, i) => {
              const Icon = Object.entries(actionIcons).find(([key]) => 
                action.action.toLowerCase().includes(key)
              )?.[1] || Sparkles;
              
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-lg"
                >
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-secondary/50">
                        {action.column}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">{action.action}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.details}</p>
                  </div>
                  <Badge className="bg-chart-1/20 text-chart-1 border-chart-1/30 flex-shrink-0">
                    {action.affectedRows} rows
                  </Badge>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

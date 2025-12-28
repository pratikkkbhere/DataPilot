import { Upload, Filter, BarChart3, FileDown, CheckCircle2, Settings, PieChart, Database, Search } from 'lucide-react';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const steps: WorkflowStep[] = [
  {
    id: 1,
    title: 'UPLOAD',
    description: 'Import your CSV or Excel files',
    icon: Upload,
    color: 'bg-primary'
  },
  {
    id: 2,
    title: 'PROFILE',
    description: 'Auto-analyze your dataset',
    icon: Search,
    color: 'bg-info'
  },
  {
    id: 3,
    title: 'CLEAN',
    description: 'Auto-detect and fix data issues',
    icon: Settings,
    color: 'bg-secondary'
  },
  {
    id: 4,
    title: 'FILTER',
    description: 'Filter and sort your data',
    icon: Filter,
    color: 'bg-accent'
  },
  {
    id: 5,
    title: 'SQL',
    description: 'Query with SQL',
    icon: Database,
    color: 'bg-chart-5'
  },
  {
    id: 6,
    title: 'AGGREGATE',
    description: 'Group and summarize data',
    icon: PieChart,
    color: 'bg-chart-4'
  },
  {
    id: 7,
    title: 'VISUALIZE',
    description: 'Create charts and graphs',
    icon: BarChart3,
    color: 'bg-success'
  },
  {
    id: 8,
    title: 'EXPORT',
    description: 'Download processed data',
    icon: FileDown,
    color: 'bg-warning'
  }
];

interface WorkflowStepsProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

export function WorkflowSteps({
  currentStep,
  onStepClick,
  completedSteps = []
}: WorkflowStepsProps) {
  return (
    <div className="w-full py-6 bg-muted border-b-4 border-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            const isClickable = step.id === 1 || completedSteps.includes(step.id - 1);
            
            return (
              <button
                key={step.id}
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={`
                  group relative flex flex-col items-center p-3 min-w-[100px] lg:min-w-[120px]
                  border-2 border-foreground
                  transition-all duration-150
                  animate-fade-in
                  ${isActive ? `${step.color} text-foreground shadow-brutal-lg translate-x-[-4px] translate-y-[-4px]` : isCompleted ? 'bg-card shadow-brutal' : 'bg-muted shadow-brutal opacity-60'}
                  ${isClickable && !isActive ? 'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg cursor-pointer' : ''}
                  ${!isClickable ? 'cursor-not-allowed' : ''}
                `}
                style={{
                  animationDelay: `${index * 80}ms`
                }}
              >
                {/* Step number badge */}
                <div className={`
                  absolute -top-2 -left-2 w-6 h-6 
                  border-2 border-foreground 
                  flex items-center justify-center 
                  text-xs font-bold
                  ${isCompleted ? 'bg-success text-success-foreground' : isActive ? 'bg-background' : 'bg-muted'}
                `}>
                  {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : step.id}
                </div>

                {/* Icon */}
                <div className={`
                  w-10 h-10 lg:w-12 lg:h-12
                  border-2 border-foreground 
                  flex items-center justify-center 
                  mb-2
                  ${isActive ? 'bg-background animate-bounce-in' : isCompleted ? step.color : 'bg-background'}
                `}>
                  <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${isActive || isCompleted ? '' : 'opacity-60'}`} />
                </div>

                {/* Title */}
                <span className="text-xs lg:text-sm font-bold tracking-wider">
                  {step.title}
                </span>

                {/* Description - hidden on mobile */}
                <span className="hidden lg:block text-xs mt-1 opacity-80 text-center">
                  {step.description}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rotate-45" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

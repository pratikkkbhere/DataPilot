import { Database, BarChart3, HelpCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderProps {
  onOpenShortcuts?: () => void;
}

export function Header({ onOpenShortcuts }: HeaderProps) {
  return (
    <header className="border-b-4 border-foreground bg-primary sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-secondary border-2 border-foreground shadow-brutal flex items-center justify-center">
              <Database className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground tracking-wider">
                DATAPILOT
              </h1>
              <p className="text-xs text-primary-foreground/80 uppercase tracking-widest">
                Automated Data Analyst
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-background border-2 border-foreground px-4 py-2 shadow-brutal">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm uppercase font-bold">No-code Analysis</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onOpenShortcuts}
                    className="bg-background"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span className="sr-only">Keyboard Shortcuts</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="border-2 border-foreground shadow-brutal">
                  <p>Keyboard Shortcuts <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted border border-foreground font-mono">Ctrl + /</kbd></p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

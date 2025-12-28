import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Keyboard, Navigation, Sparkles, Database, BarChart3, Command } from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  icon: React.ReactNode;
  shortcuts: ShortcutItem[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    title: 'Global Shortcuts',
    icon: <Command className="h-4 w-4" />,
    shortcuts: [
      { keys: ['Ctrl', 'O'], description: 'Upload dataset' },
      { keys: ['Ctrl', 'S'], description: 'Save current workflow' },
      { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo action' },
      { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
      { keys: ['Ctrl', 'D'], description: 'Toggle Dark / Light mode' },
      { keys: ['Ctrl', '/'], description: 'Open shortcuts help' },
    ],
  },
  {
    title: 'Navigation Shortcuts',
    icon: <Navigation className="h-4 w-4" />,
    shortcuts: [
      { keys: ['Alt', '1'], description: 'Import' },
      { keys: ['Alt', '2'], description: 'Profile' },
      { keys: ['Alt', '3'], description: 'Clean' },
      { keys: ['Alt', '4'], description: 'Filter' },
      { keys: ['Alt', '5'], description: 'SQL' },
      { keys: ['Alt', '6'], description: 'Aggregate' },
      { keys: ['Alt', '7'], description: 'Visualize' },
      { keys: ['Alt', '8'], description: 'Export' },
    ],
  },
  {
    title: 'Data Cleaning Shortcuts',
    icon: <Sparkles className="h-4 w-4" />,
    shortcuts: [
      { keys: ['Ctrl', 'M'], description: 'Open missing value configuration' },
      { keys: ['Ctrl', 'Shift', 'D'], description: 'Remove duplicates' },
      { keys: ['Ctrl', 'T'], description: 'Trim text fields' },
      { keys: ['Ctrl', 'Shift', 'T'], description: 'Convert data types' },
      { keys: ['Ctrl', 'R'], description: 'Reset to raw dataset' },
    ],
  },
  {
    title: 'SQL Editor Shortcuts',
    icon: <Database className="h-4 w-4" />,
    shortcuts: [
      { keys: ['Ctrl', 'Enter'], description: 'Run SQL query' },
      { keys: ['Ctrl', 'Shift', 'F'], description: 'Format SQL' },
      { keys: ['Ctrl', 'L'], description: 'Clear SQL editor' },
      { keys: ['Ctrl', '↑'], description: 'Previous query in history' },
      { keys: ['Ctrl', '↓'], description: 'Next query in history' },
    ],
  },
  {
    title: 'Visualization Shortcuts',
    icon: <BarChart3 className="h-4 w-4" />,
    shortcuts: [
      { keys: ['Ctrl', 'Shift', 'V'], description: 'Create visualization' },
      { keys: ['Ctrl', '1'], description: 'Bar chart' },
      { keys: ['Ctrl', '2'], description: 'Line chart' },
      { keys: ['Ctrl', '3'], description: 'Pie / Donut chart' },
      { keys: ['Ctrl', '4'], description: 'Histogram' },
      { keys: ['Ctrl', '5'], description: 'Scatter plot' },
      { keys: ['Ctrl', 'E'], description: 'Export chart' },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function KeyBadge({ keyName }: { keyName: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-bold uppercase bg-muted border-2 border-foreground shadow-brutal-hover font-mono">
      {keyName}
    </kbd>
  );
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return shortcutCategories;

    const query = searchQuery.toLowerCase();
    return shortcutCategories
      .map((category) => ({
        ...category,
        shortcuts: category.shortcuts.filter(
          (shortcut) =>
            shortcut.description.toLowerCase().includes(query) ||
            shortcut.keys.some((key) => key.toLowerCase().includes(query))
        ),
      }))
      .filter((category) => category.shortcuts.length > 0);
  }, [searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] border-4 border-foreground shadow-brutal-xl bg-card p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b-4 border-foreground bg-primary">
          <DialogTitle className="flex items-center gap-3 text-xl text-primary-foreground">
            <div className="h-10 w-10 bg-secondary border-2 border-foreground shadow-brutal flex items-center justify-center">
              <Keyboard className="h-5 w-5 text-secondary-foreground" />
            </div>
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 border-b-2 border-foreground/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shortcuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-foreground shadow-brutal-hover focus:shadow-brutal"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[55vh]">
          <div className="p-6 space-y-8">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Keyboard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-bold">No shortcuts found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div key={category.title} className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    <div className="h-6 w-6 bg-accent/20 border border-foreground/20 flex items-center justify-center">
                      {category.icon}
                    </div>
                    {category.title}
                  </div>
                  <div className="grid gap-2">
                    {category.shortcuts.map((shortcut, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 px-3 bg-muted/30 border border-foreground/10 hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIdx) => (
                            <span key={keyIdx} className="flex items-center">
                              <KeyBadge keyName={key} />
                              {keyIdx < shortcut.keys.length - 1 && (
                                <span className="mx-1 text-muted-foreground text-xs">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t-2 border-foreground/20 bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Press <KeyBadge keyName="Esc" /> to close • <KeyBadge keyName="Ctrl" /> + <KeyBadge keyName="/" /> to toggle
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

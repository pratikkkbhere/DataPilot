import { useState, useMemo, useCallback, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { WorkflowSteps } from '@/components/layout/WorkflowSteps';
import { FileUpload } from '@/components/upload/FileUpload';
import { DataPreview } from '@/components/data/DataPreview';
import { DataProfiler } from '@/components/profiling/DataProfiler';
import { CleaningSummaryComponent } from '@/components/cleaning/CleaningSummary';
import { MissingValueConfigComponent } from '@/components/cleaning/MissingValueConfig';
import { FindReplaceComponent } from '@/components/cleaning/FindReplace';
import { CleaningLog } from '@/components/cleaning/CleaningLog';
import { FilterSort } from '@/components/filter/FilterSort';
import { SQLQueryPanel } from '@/components/sql/SQLQueryPanel';
import { Aggregator } from '@/components/aggregation/Aggregator';
import { ChartBuilder } from '@/components/visualization/ChartBuilder';
import { ExportPanel } from '@/components/export/ExportPanel';
import { KeyboardShortcutsModal } from '@/components/help/KeyboardShortcutsModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataRow, DatasetSummary, CleaningSummary, FilterConfig, SortConfig, CleaningAction } from '@/types/data';
import { profileDataset, cleanDataset, applyFilters, applySort } from '@/lib/dataUtils';
import { ArrowLeft, ArrowRight, Upload, RefreshCw, Wand2, Settings2, Replace, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  // Core state
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState('');
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [originalData, setOriginalData] = useState<DataRow[]>([]);
  const [cleanedData, setCleanedData] = useState<DataRow[]>([]);
  
  // Profiling state
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [cleaningSummary, setCleaningSummary] = useState<CleaningSummary | null>(null);
  const [userCleaningActions, setUserCleaningActions] = useState<CleaningAction[]>([]);
  
  // Filter & Sort state
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [sorts, setSorts] = useState<SortConfig[]>([]);
  
  // Undo state for cleaning actions
  const [undoData, setUndoData] = useState<DataRow[] | null>(null);
  const [undoActions, setUndoActions] = useState<CleaningAction[]>([]);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);
  const [undoTimeRemaining, setUndoTimeRemaining] = useState<number>(0);
  
  // Keyboard shortcuts modal state
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  // Global keyboard shortcut listener for Ctrl + /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup undo timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimer) {
        clearInterval(undoTimer);
      }
    };
  }, [undoTimer]);

  // Processed data with filters and sorts applied
  const processedData = useMemo(() => {
    let data = cleanedData;
    if (filters.length > 0) {
      data = applyFilters(data, filters);
    }
    if (sorts.length > 0) {
      data = applySort(data, sorts);
    }
    return data;
  }, [cleanedData, filters, sorts]);

  // Handle file upload
  const handleDataLoaded = useCallback((data: DataRow[], name: string) => {
    setRawData(data);
    setOriginalData(data);
    setFileName(name);
    
    // Auto-profile the data
    const profileSummary = profileDataset(data);
    setSummary(profileSummary);
    
    // Auto-clean the data
    const { cleanedData: cleaned, summary: cleanSum } = cleanDataset(data, profileSummary.columnStats);
    setCleanedData(cleaned);
    setCleaningSummary(cleanSum);
    setUserCleaningActions([]);
    
    // Move to profile step
    setStep(2);
  }, []);

  // Setup undo timer (5 seconds)
  const setupUndoTimer = useCallback((previousData: DataRow[], previousActions: CleaningAction[]) => {
    // Clear existing timer
    if (undoTimer) {
      clearInterval(undoTimer);
    }

    // Set undo data
    setUndoData(previousData);
    setUndoActions(previousActions);
    setUndoTimeRemaining(5);

    // Start countdown
    const interval = setInterval(() => {
      setUndoTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setUndoData(null);
          setUndoActions([]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setUndoTimer(interval);

    // Clear after 5 seconds
    setTimeout(() => {
      clearInterval(interval);
      setUndoData(null);
      setUndoActions([]);
      setUndoTimeRemaining(0);
    }, 5000);
  }, [undoTimer]);

  // Handle undo
  const handleUndo = useCallback(() => {
    if (undoData) {
      setCleanedData(undoData);
      setUserCleaningActions(undoActions);
      
      // Re-profile with previous data
      const newSummary = profileDataset(undoData);
      setSummary(newSummary);
      
      // Re-run auto-cleaning
      const { cleanedData: cleaned, summary: cleanSum } = cleanDataset(undoData, newSummary.columnStats);
      setCleanedData(cleaned);
      setCleaningSummary(cleanSum);
      
      // Clear undo state
      if (undoTimer) {
        clearInterval(undoTimer);
      }
      setUndoData(null);
      setUndoActions([]);
      setUndoTimeRemaining(0);
      
      toast.success('Changes undone');
    }
  }, [undoData, undoActions, undoTimer]);

  // Handle missing value configuration changes
  const handleMissingValueChanges = useCallback((newData: DataRow[], actions: CleaningAction[]) => {
    // Save current state for undo
    const previousData = [...cleanedData];
    const previousActions = [...userCleaningActions];
    
    setCleanedData(newData);
    setUserCleaningActions(prev => [...prev, ...actions]);
    
    // Re-profile with new data
    const newSummary = profileDataset(newData);
    setSummary(newSummary);
    
    // Setup undo timer
    setupUndoTimer(previousData, previousActions);
    
    toast.success(`Applied ${actions.length} cleaning operation(s)`, {
      description: `${actions.reduce((sum, a) => sum + a.affectedRows, 0)} rows affected`,
    });
  }, [cleanedData, userCleaningActions, setupUndoTimer]);

  // Handle find and replace changes
  const handleFindReplaceChanges = useCallback((newData: DataRow[], actions: CleaningAction[]) => {
    // Save current state for undo
    const previousData = [...cleanedData];
    const previousActions = [...userCleaningActions];
    
    setCleanedData(newData);
    setUserCleaningActions(prev => [...prev, ...actions]);
    
    // Re-profile with new data
    const newSummary = profileDataset(newData);
    setSummary(newSummary);
    
    // Setup undo timer
    setupUndoTimer(previousData, previousActions);
    
    toast.success(`Applied find and replace`, {
      description: `${actions.reduce((sum, a) => sum + a.affectedRows, 0)} rows affected`,
    });
  }, [cleanedData, userCleaningActions, setupUndoTimer]);

  // Reset to original data
  const handleResetToOriginal = useCallback(() => {
    setCleanedData(originalData);
    setUserCleaningActions([]);
    
    // Re-profile with original data
    const profileSummary = profileDataset(originalData);
    setSummary(profileSummary);
    
    // Re-run auto-cleaning
    const { cleanedData: cleaned, summary: cleanSum } = cleanDataset(originalData, profileSummary.columnStats);
    setCleanedData(cleaned);
    setCleaningSummary(cleanSum);
    
    toast.info('Dataset reset to original state');
  }, [originalData]);

  // Reset everything
  const handleReset = () => {
    setStep(1);
    setFileName('');
    setRawData([]);
    setOriginalData([]);
    setCleanedData([]);
    setSummary(null);
    setCleaningSummary(null);
    setUserCleaningActions([]);
    setFilters([]);
    setSorts([]);
  };

  const canGoNext = step < 8 && rawData.length > 0;
  const canGoPrev = step > 1;

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenShortcuts={() => setShortcutsModalOpen(true)} />
      <WorkflowSteps currentStep={step} />
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        open={shortcutsModalOpen} 
        onOpenChange={setShortcutsModalOpen} 
      />
      
      <main className="container mx-auto px-6 py-8">
        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="animate-fade-in">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
        )}

        {/* Step 2: Profile */}
        {step === 2 && summary && (
          <div className="animate-slide-up space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Data Profile</h2>
                <p className="text-muted-foreground">Automatic analysis of your dataset</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-4 py-2 rounded-lg border border-border">
                <Upload className="h-4 w-4" />
                <span>{fileName}</span>
              </div>
            </div>
            <DataProfiler summary={summary} />
            <DataPreview data={rawData} title="Original Data (First 50 Rows)" maxRows={50} />
          </div>
        )}

        {/* Step 3: Clean */}
        {step === 3 && cleaningSummary && summary && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Data Cleaning</h2>
              <p className="text-muted-foreground">Configure and apply data quality improvements</p>
            </div>

            {/* Undo Button */}
            {undoData && undoTimeRemaining > 0 && (
              <div className="flex items-center justify-end">
                <Button
                  onClick={handleUndo}
                  variant="outline"
                  className="gap-2 border-2 border-foreground shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg"
                >
                  <RotateCcw className="h-4 w-4" />
                  Undo ({undoTimeRemaining}s)
                </Button>
              </div>
            )}

            <Tabs defaultValue="auto" className="w-full">
              <TabsList className="grid w-full max-w-2xl grid-cols-3">
                <TabsTrigger value="auto" className="gap-2">
                  <Wand2 className="h-4 w-4" />
                  Auto Cleaning
                </TabsTrigger>
                <TabsTrigger value="missing" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  Missing Values
                </TabsTrigger>
                <TabsTrigger value="findreplace" className="gap-2">
                  <Replace className="h-4 w-4" />
                  Find & Replace
                </TabsTrigger>
              </TabsList>

              <TabsContent value="auto" className="mt-6 space-y-6">
                <CleaningSummaryComponent summary={cleaningSummary} />
                {userCleaningActions.length > 0 && (
                  <CleaningLog actions={userCleaningActions} />
                )}
              </TabsContent>

              <TabsContent value="missing" className="mt-6 space-y-6">
                <MissingValueConfigComponent
                  columns={summary.columnStats}
                  data={cleanedData}
                  originalData={originalData}
                  onApplyChanges={handleMissingValueChanges}
                  onReset={handleResetToOriginal}
                />
                {userCleaningActions.length > 0 && (
                  <CleaningLog actions={userCleaningActions} />
                )}
              </TabsContent>

              <TabsContent value="findreplace" className="mt-6 space-y-6">
                <FindReplaceComponent
                  columns={summary.columnStats}
                  data={cleanedData}
                  onApplyChanges={handleFindReplaceChanges}
                />
                {userCleaningActions.length > 0 && (
                  <CleaningLog actions={userCleaningActions} />
                )}
              </TabsContent>
            </Tabs>

            <DataPreview data={cleanedData} title="Cleaned Data Preview" maxRows={50} />
          </div>
        )}

        {/* Step 4: Filter & Sort */}
        {step === 4 && summary && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Filter & Sort</h2>
              <p className="text-muted-foreground">Refine your data with filters and sorting</p>
            </div>
            <FilterSort
              columns={summary.columnStats}
              filters={filters}
              sorts={sorts}
              onFiltersChange={setFilters}
              onSortsChange={setSorts}
            />
            <DataPreview data={processedData} title={`Filtered Data (${processedData.length} rows)`} />
          </div>
        )}

        {/* Step 5: SQL Query */}
        {step === 5 && summary && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">SQL Query</h2>
              <p className="text-muted-foreground">Analyze your data with SQL queries</p>
            </div>
            <SQLQueryPanel data={processedData} columns={summary.columnStats} />
          </div>
        )}

        {/* Step 6: Aggregate */}
        {step === 6 && summary && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Aggregation</h2>
              <p className="text-muted-foreground">Group and summarize your data</p>
            </div>
            <Aggregator data={processedData} columns={summary.columnStats} />
          </div>
        )}

        {/* Step 7: Visualize */}
        {step === 7 && summary && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Visualization</h2>
              <p className="text-muted-foreground">Create charts and explore your data visually</p>
            </div>
            <ChartBuilder data={processedData} columns={summary.columnStats} />
          </div>
        )}

        {/* Step 8: Export */}
        {step === 8 && (
          <div className="animate-slide-up">
            <ExportPanel data={processedData} fileName={fileName} />
          </div>
        )}

        {/* Navigation */}
        {rawData.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border py-4">
            <div className="container mx-auto px-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Start Over
              </Button>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  disabled={!canGoPrev}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={() => setStep(s => Math.min(8, s + 1))}
                  disabled={!canGoNext}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Spacer for fixed navigation */}
      {rawData.length > 0 && <div className="h-20" />}
      
      {/* Footer */}
      <footer className="w-full py-6 mt-8 border-t-4 border-foreground bg-background">
        <p className="text-center text-lg font-bold">
          Made in 🇮🇳 With <span className="text-red-500">❤️</span>
        </p>
      </footer>
    </div>
  );
};

export default Index;

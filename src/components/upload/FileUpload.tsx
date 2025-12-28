import { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, File, X } from 'lucide-react';
import { parseCSV, parseExcel, DataRow } from '@/lib/dataUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onDataLoaded: (data: DataRow[], filename: string) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(extension || '')) {
      toast.error('Invalid file type', {
        description: 'Please upload a CSV or Excel file',
      });
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);

    try {
      let data: DataRow[];
      
      if (extension === 'csv') {
        data = await parseCSV(file);
      } else {
        data = await parseExcel(file);
      }

      if (data.length === 0) {
        toast.error('Empty file', {
          description: 'The uploaded file contains no data',
        });
        setIsLoading(false);
        setSelectedFile(null);
        return;
      }

      toast.success('File uploaded successfully', {
        description: `Loaded ${data.length} rows from ${file.name}`,
      });

      onDataLoaded(data, file.name);
    } catch (error) {
      toast.error('Error parsing file', {
        description: 'There was an error reading the file. Please check the format.',
      });
      console.error(error);
      setSelectedFile(null);
    } finally {
      setIsLoading(false);
    }
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="max-w-2xl w-full">
        <div
          className={cn(
            'upload-zone',
            isDragging && 'dragging'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="file-input"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleInputChange}
          />
          
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-lg font-semibold">Processing your file...</p>
            </div>
          ) : selectedFile ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <FileSpreadsheet className="w-16 h-16 text-success" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center border-2 border-foreground shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <label htmlFor="file-input" className="neo-button-primary cursor-pointer" onClick={(e) => e.stopPropagation()}>
                Choose Different File
              </label>
            </div>
          ) : (
            <div className="w-full border-4 border-foreground bg-background p-8 shadow-brutal">
              <div className="flex flex-col items-center gap-6">
                <div className="text-center w-full">
                  <h3 className="text-2xl font-bold mb-6 uppercase">Upload Your Data or DRAG & DROP</h3>
                  
                  <div className="flex gap-3 justify-center mb-6">
                    <span className="neo-badge bg-secondary">
                      <File className="w-4 h-4 mr-1" />
                      CSV
                    </span>
                    <span className="neo-badge bg-success text-success-foreground">
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      Excel
                    </span>
                  </div>
                </div>
                <label htmlFor="file-input" className="neo-button-primary cursor-pointer w-full text-center" onClick={(e) => e.stopPropagation()}>
                  Select File
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

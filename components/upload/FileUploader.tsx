'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Entity } from '@/lib/types/sales';
import toast from 'react-hot-toast';

interface FileUploaderProps {
  entity: Entity;
  onUploadSuccess?: () => void;
}

export function FileUploader({ entity, onUploadSuccess }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    details?: any;
  }>({
    open: false,
    title: '',
    message: '',
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadedFile(file);
    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      toast.loading('Uploading file...', { id: 'upload' });

      // Upload directly using the new API endpoint
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/upload/${entity}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }

        const errorMessage = errorData.error || 'Upload failed';
        const errorDetails = errorData.details;

        // Show error in dialog
        setErrorDialog({
          open: true,
          title: 'Upload Failed',
          message: errorMessage,
          details: errorDetails,
        });

        // Also show toast for quick notification
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      toast.dismiss('upload');
      
      if (result.success) {
        // 상세 로그 출력
        console.log('✅ 업로드 성공!');
        console.log(`📊 원본: ${result.data.originalRows}개 행`);
        console.log(`💾 저장: ${result.data.filteredRows}개 행`);
        console.log(`🗑️ 제거된 컬럼: ${result.data.columnsRemoved}개`);
        console.log(`📉 용량 절감: ${result.data.spaceReduction}`);
        console.log(`📁 저장 경로: ${result.data.storagePath}`);

        toast.success(
          `Successfully uploaded ${result.rowsInserted} rows from ${file.name} (${result.data.spaceReduction} size reduced)`
        );

        if (onUploadSuccess) {
          onUploadSuccess();
        }

        // Reset after 2 seconds
        setTimeout(() => {
          setUploadedFile(null);
          setProgress(0);
        }, 2000);
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Upload failed';
      
      toast.dismiss('upload');
      
      // If error dialog is not already open, show it
      if (!errorDialog.open) {
        setErrorDialog({
          open: true,
          title: 'Upload Error',
          message: errorMessage,
        });
      }
      
      setUploadedFile(null);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }, [entity, onUploadSuccess, errorDialog.open]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    maxSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '104857600'), // 100MB
    disabled: uploading || entity === 'All',
    onError: (error) => {
      setErrorDialog({
        open: true,
        title: 'File Error',
        message: error.message || 'An error occurred while processing the file',
      });
    },
  });

  // Handle file rejection errors
  useEffect(() => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      const errorMessages: string[] = [];
      
      rejection.errors.forEach((error) => {
        if (error.code === 'file-too-large') {
          errorMessages.push(`File size exceeds the maximum limit of 100MB`);
        } else if (error.code === 'file-invalid-type') {
          errorMessages.push(`Invalid file type. Please upload .xlsx or .xls files`);
        } else if (error.code === 'too-many-files') {
          errorMessages.push(`Only one file can be uploaded at a time`);
        } else {
          errorMessages.push(error.message);
        }
      });

      if (errorMessages.length > 0) {
        setErrorDialog({
          open: true,
          title: 'File Rejected',
          message: errorMessages.join('\n'),
        });
      }
    }
  }, [fileRejections]);

  const handleRemove = () => {
    setUploadedFile(null);
    setProgress(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Sales Data</CardTitle>
        <CardDescription>
          Drag and drop your Excel file here, or click to browse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
            ${uploading || entity === 'All' ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}
          `}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <div>
                <p className="text-sm font-medium">Uploading {uploadedFile?.name}...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Data import in progress. This may take several minutes.
                </p>
                <Progress value={progress} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
              </div>
            </div>
          ) : uploadedFile ? (
            <div className="space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <div>
                <p className="text-sm font-medium">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isDragActive ? 'Drop the file here' : 'Click or drag file to upload'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports .xlsx and .xls files (max 100MB)
                </p>
              </div>
              {entity === 'All' && (
                <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Please select a specific entity to upload</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Error Dialog */}
      <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {errorDialog.title}
            </DialogTitle>
            <DialogDescription>
              {errorDialog.message}
            </DialogDescription>
          </DialogHeader>
          
          {errorDialog.details && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">상세 정보:</h4>
              {Array.isArray(errorDialog.details) ? (
                <div className="bg-muted p-4 rounded-md space-y-2">
                  {errorDialog.details.map((detail: any, index: number) => (
                    <div key={index} className="text-sm">
                      {typeof detail === 'object' ? (
                        <div className="space-y-1">
                          {detail.row && (
                            <span className="font-medium">Row {detail.row}: </span>
                          )}
                          {detail.field && (
                            <span className="font-medium">{detail.field}: </span>
                          )}
                          <span>{detail.message}</span>
                        </div>
                      ) : (
                        <div>{String(detail)}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(errorDialog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setErrorDialog({ ...errorDialog, open: false })}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

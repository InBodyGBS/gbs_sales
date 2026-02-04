'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileUploader } from '@/components/upload/FileUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Entity, UploadHistory } from '@/lib/types/sales';
import { formatDate } from '@/lib/utils/formatters';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function UploadPage() {
  const [entity, setEntity] = useState<Entity>('HQ');
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUploadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/upload/history?entity=${entity}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch upload history');
      }
      
      const data = await response.json();
      setUploadHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch upload history:', error);
      setUploadHistory([]);
    } finally {
      setLoading(false);
    }
  }, [entity]);

  useEffect(() => {
    fetchUploadHistory();
  }, [fetchUploadHistory]);

  const handleUploadSuccess = () => {
    fetchUploadHistory();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sales Dashboard - Data Upload</h1>
        <p className="text-muted-foreground mt-2">
          Upload Excel files containing sales data for each entity
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entity">Select Entity</Label>
            <Select
              value={entity}
              onValueChange={(value) => setEntity(value as Entity)}
            >
              <SelectTrigger id="entity">
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HQ">HQ</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="BWA">BWA</SelectItem>
                <SelectItem value="Vietnam">Vietnam</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Korot">Korot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FileUploader entity={entity} onUploadSuccess={handleUploadSuccess} />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upload History</CardTitle>
              <CardDescription>Recent file uploads</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading...
                </div>
              ) : uploadHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No upload history yet
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadHistory.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(upload.status)}
                          <span className="font-medium">{upload.file_name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span>{upload.entity}</span>
                          {upload.rows_uploaded !== null && (
                            <span className="ml-2">
                              • {upload.rows_uploaded} rows
                            </span>
                          )}
                          <span className="ml-2">
                            • {formatDate(upload.uploaded_at)}
                          </span>
                        </div>
                        {upload.error_message && (
                          <p className="text-xs text-red-500 mt-1">
                            {upload.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

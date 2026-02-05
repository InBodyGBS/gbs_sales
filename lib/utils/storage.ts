// lib/utils/storage.ts
import { createServiceClient } from '@/lib/supabase/server';

/**
 * Supabase Storage에서 파일 다운로드
 * @param storagePath 파일 경로 (예: 'USA/1738742400000_sales.xlsx')
 * @returns Blob 데이터
 */
export async function downloadFile(storagePath: string): Promise<Blob> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase.storage
    .from('sales-files')
    .download(storagePath);
  
  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }
  
  if (!data) {
    throw new Error('No data returned from storage');
  }
  
  return data;
}

/**
 * Supabase Storage에 파일 업로드
 * @param storagePath 저장할 경로
 * @param file 업로드할 파일
 * @returns 업로드된 파일 경로
 */
export async function uploadFile(
  storagePath: string, 
  file: File | Blob
): Promise<string> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase.storage
    .from('sales-files')
    .upload(storagePath, file, {
      upsert: false,
    });
  
  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
  
  return data.path;
}

/**
 * Supabase Storage에서 파일 삭제
 * @param storagePath 삭제할 파일 경로
 */
export async function deleteFile(storagePath: string): Promise<void> {
  const supabase = createServiceClient();
  
  const { error } = await supabase.storage
    .from('sales-files')
    .remove([storagePath]);
  
  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Supabase Storage에서 파일 목록 조회
 * @param path 폴더 경로 (예: 'USA/')
 * @returns 파일 목록
 */
export async function listFiles(path: string = '') {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase.storage
    .from('sales-files')
    .list(path, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });
  
  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }
  
  return data;
}

/**
 * 파일의 공개 URL 생성 (Private 버킷의 경우 서명된 URL)
 * @param storagePath 파일 경로
 * @param expiresIn 만료 시간 (초, 기본 1시간)
 * @returns 서명된 URL
 */
export async function getSignedUrl(
  storagePath: string, 
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase.storage
    .from('sales-files')
    .createSignedUrl(storagePath, expiresIn);
  
  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }
  
  return data.signedUrl;
}

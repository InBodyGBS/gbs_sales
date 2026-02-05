# Supabase Storage Utility 사용 예제

## 📦 lib/utils/storage.ts

재사용 가능한 Supabase Storage 유틸리티 함수 모음

---

## 📥 파일 다운로드

```typescript
import { downloadFile } from '@/lib/utils/storage';

// 서버 사이드에서만 사용 가능
async function processFile(storagePath: string) {
  try {
    const blob = await downloadFile('USA/1738742400000_sales.xlsx');
    
    // Blob을 ArrayBuffer로 변환
    const arrayBuffer = await blob.arrayBuffer();
    
    // Excel 파일 처리
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    // ...
  } catch (error) {
    console.error('Download failed:', error);
  }
}
```

---

## 📤 파일 업로드

```typescript
import { uploadFile } from '@/lib/utils/storage';

async function handleUpload(file: File, entity: string) {
  const timestamp = Date.now();
  const storagePath = `${entity}/${timestamp}_${file.name}`;
  
  try {
    const uploadedPath = await uploadFile(storagePath, file);
    console.log('File uploaded to:', uploadedPath);
    return uploadedPath;
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

---

## 🗑️ 파일 삭제

```typescript
import { deleteFile } from '@/lib/utils/storage';

async function cleanupOldFiles(storagePath: string) {
  try {
    await deleteFile('USA/old_file.xlsx');
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Delete failed:', error);
  }
}
```

---

## 📋 파일 목록 조회

```typescript
import { listFiles } from '@/lib/utils/storage';

async function getEntityFiles(entity: string) {
  try {
    const files = await listFiles(`${entity}/`);
    
    files.forEach(file => {
      console.log(`- ${file.name} (${file.metadata?.size} bytes)`);
    });
    
    return files;
  } catch (error) {
    console.error('List failed:', error);
  }
}
```

---

## 🔗 서명된 URL 생성

```typescript
import { getSignedUrl } from '@/lib/utils/storage';

// Private 파일의 임시 다운로드 링크 생성
async function createDownloadLink(storagePath: string) {
  try {
    // 1시간 동안 유효한 URL
    const signedUrl = await getSignedUrl(storagePath, 3600);
    
    console.log('Download link:', signedUrl);
    return signedUrl;
  } catch (error) {
    console.error('URL creation failed:', error);
  }
}

// 사용 예시
async function sendFileToUser(storagePath: string) {
  const url = await getSignedUrl('USA/sales.xlsx', 7200); // 2시간
  
  // 이메일이나 API 응답으로 URL 전달
  return { downloadUrl: url };
}
```

---

## 🔄 실제 사용 사례

### 1. 파일 업로드 후 처리

```typescript
// app/api/upload/[entity]/route.ts
import { uploadFile } from '@/lib/utils/storage';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Storage에 업로드
  const storagePath = `${entity}/${Date.now()}_${file.name}`;
  await uploadFile(storagePath, file);
  
  // 파일 처리
  const blob = await downloadFile(storagePath);
  // ...
}
```

### 2. 파일 다운로드 API

```typescript
// app/api/download/[path]/route.ts
import { getSignedUrl } from '@/lib/utils/storage';

export async function GET(request: NextRequest) {
  const storagePath = request.nextUrl.searchParams.get('path');
  
  if (!storagePath) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 });
  }
  
  try {
    const signedUrl = await getSignedUrl(storagePath, 300); // 5분
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
```

### 3. 파일 관리 대시보드

```typescript
// app/api/files/route.ts
import { listFiles, deleteFile } from '@/lib/utils/storage';

export async function GET(request: NextRequest) {
  const entity = request.nextUrl.searchParams.get('entity');
  
  const files = await listFiles(entity ? `${entity}/` : '');
  
  return NextResponse.json({
    files: files.map(f => ({
      name: f.name,
      size: f.metadata?.size,
      createdAt: f.created_at,
      path: `${entity}/${f.name}`,
    })),
  });
}

export async function DELETE(request: NextRequest) {
  const { path } = await request.json();
  await deleteFile(path);
  return NextResponse.json({ success: true });
}
```

---

## ⚠️ 주의사항

1. **서버 사이드 전용**: 모든 함수는 서버 사이드(API Routes)에서만 사용 가능
2. **Service Role Key 필요**: `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 설정 필수
3. **Storage Policies**: Supabase에서 적절한 policies 설정 필요
4. **에러 처리**: 모든 함수는 에러 발생 시 throw하므로 try-catch 사용 권장

---

## 🔐 보안 권장사항

```typescript
// ❌ 잘못된 예 - 클라이언트에 직접 노출
export async function GET() {
  const files = await listFiles(); // 모든 파일 노출
  return NextResponse.json({ files });
}

// ✅ 올바른 예 - 인증 및 권한 확인
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 사용자의 엔티티만 조회
  const files = await listFiles(`${session.entity}/`);
  return NextResponse.json({ files });
}
```

---

## 📊 파일 크기 제한

- **Hobby/Pro 플랜**: 50GB 총 스토리지
- **파일당 최대 크기**: 50MB (기본), 설정으로 증가 가능
- **현재 설정**: 100MB (버킷 설정에서 변경)

---

## 🛠️ 문제 해결

### Storage 접근 오류
```bash
Error: Failed to download file: The resource was not found
```
→ Supabase Storage policies 확인 (Service role 권한)

### 파일 업로드 실패
```bash
Error: Failed to upload file: Payload too large
```
→ 버킷의 파일 크기 제한 확인

### URL 생성 실패
```bash
Error: Failed to create signed URL
```
→ 버킷이 Private인지 확인 (Public 버킷은 signed URL 불필요)

# Supabase Storage Setup for Large File Uploads

## 1단계: Supabase Storage 버킷 생성

1. Supabase Dashboard → Storage 메뉴로 이동
2. "New bucket" 클릭
3. 다음 설정으로 버킷 생성:
   - **Name**: `sales-files`
   - **Public bucket**: ❌ (Private로 설정)
   - **File size limit**: 100MB
   - **Allowed MIME types**: 
     - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
     - `application/vnd.ms-excel`

## 2단계: Storage Policy 설정

Storage 버킷의 Policies 탭에서 다음 정책 추가:

### Policy 1: Upload Access (Service Role)
```sql
CREATE POLICY "Service role can upload files"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'sales-files');
```

### Policy 2: Read Access (Service Role)
```sql
CREATE POLICY "Service role can read files"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'sales-files');
```

### Policy 3: Delete Access (Service Role)
```sql
CREATE POLICY "Service role can delete files"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'sales-files');
```

## 3단계: upload_history 테이블 업데이트

SQL Editor에서 다음 쿼리 실행:

```sql
-- storage_path 컬럼 추가
ALTER TABLE upload_history
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- 기존 데이터 확인
SELECT id, file_name, storage_path, created_at 
FROM upload_history 
ORDER BY created_at DESC 
LIMIT 10;
```

## 4단계: 환경 변수 확인

`.env.local` 파일에 다음 변수가 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 작동 방식

### 기존 방식 (Vercel 제한 4.5MB)
```
Client → Vercel API Route (body size 제한) → Supabase DB
```

### 새로운 방식 (100MB 지원)
```
Client → Supabase Storage (직접 업로드)
         ↓
API Route → Supabase Storage에서 다운로드 → 처리 → Supabase DB
```

## 장점

1. ✅ Vercel의 4.5MB body size 제한 우회
2. ✅ 최대 100MB 파일 업로드 가능
3. ✅ 업로드 실패 시 재시도 가능
4. ✅ 파일 보관 및 추적 가능
5. ✅ 진행률 표시 가능

## 확인 사항

1. Supabase 버킷이 생성되었는지 확인:
   - Dashboard → Storage → `sales-files` 버킷 존재 확인

2. Policies가 적용되었는지 확인:
   - Storage → sales-files → Policies 탭에서 3개 정책 확인

3. 테이블 컬럼이 추가되었는지 확인:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'upload_history';
   ```

## 다음 단계

설정이 완료되면 업데이트된 코드를 배포하세요:
```bash
git push origin main
```

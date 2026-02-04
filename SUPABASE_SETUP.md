# Supabase 설정 가이드

## 1. 프로젝트 정보

프로젝트 이름: **GBS_sales_prototype**

## 2. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application (애플리케이션 설정 - Supabase에서 받는 것이 아닙니다)
NEXT_PUBLIC_APP_NAME=Sales Dashboard
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
```

### Application 환경 변수 설명:
- **NEXT_PUBLIC_APP_NAME**: 애플리케이션 이름 (선택사항, 표시용)
- **NEXT_PUBLIC_MAX_FILE_SIZE**: 파일 업로드 최대 크기 (104857600 bytes = 100MB)
  - 필요에 따라 변경 가능 (예: 50MB = 52428800, 200MB = 209715200)

### Supabase 키 찾는 방법:
1. Supabase 대시보드 (https://supabase.com/dashboard) 접속
2. GBS_sales_prototype 프로젝트 선택
3. Settings → API 메뉴로 이동
4. 다음 정보를 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** 키 → `SUPABASE_SERVICE_ROLE_KEY` (주의: 이 키는 서버 사이드에서만 사용)

## 3. 데이터베이스 스키마 적용

### ⚠️ 테이블이 이미 존재하는 경우

**"relation already exists" 에러가 발생했다면:**

1. **기존 테이블 구조 확인** (데이터 보존):
   - `database/check-existing-schema.sql` 파일을 SQL Editor에서 실행
   - 현재 테이블 구조를 확인

2. **테이블 재생성** (⚠️ 모든 데이터 삭제):
   - `database/drop-and-recreate.sql` 파일을 SQL Editor에서 실행
   - 기존 테이블을 삭제하고 새로 생성

3. **테이블 수정** (데이터 보존):
   - `database/alter-table-if-needed.sql` 파일을 참고하여 필요한 컬럼만 추가/수정

### 방법 1: SQL Editor 사용 (새 프로젝트 또는 재생성)

**⚠️ 기존 테이블이 있는 경우 (데이터 삭제):**
1. Supabase 대시보드에서 **SQL Editor** 메뉴로 이동
2. **New query** 클릭
3. `database/drop-and-recreate-full.sql` 파일의 **전체 내용**을 복사하여 붙여넣기
4. **Run** 버튼 클릭하여 실행

**새 프로젝트인 경우:**
1. Supabase 대시보드에서 **SQL Editor** 메뉴로 이동
2. **New query** 클릭
3. `database/schema-full.sql` 파일의 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭하여 실행

**⚠️ 중요:** SQL Editor에는 **SQL 코드만** 붙여넣어야 합니다. TypeScript 파일(.ts)이나 다른 코드는 붙여넣지 마세요!

### 방법 2: 직접 실행할 SQL

```sql
-- Sales Data Table
CREATE TABLE sales_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity VARCHAR(50) NOT NULL,
    sale_date DATE NOT NULL,
    year INTEGER NOT NULL,
    quarter VARCHAR(2) NOT NULL,
    category VARCHAR(100),
    product VARCHAR(200) NOT NULL,
    region VARCHAR(100),
    currency VARCHAR(10) NOT NULL,
    sales_amount DECIMAL(15, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    upload_batch_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_entity CHECK (entity IN ('HQ', 'USA', 'BWA', 'Vietnam', 'Healthcare', 'Korot')),
    CONSTRAINT valid_quarter CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
    CONSTRAINT positive_amount CHECK (sales_amount >= 0),
    CONSTRAINT positive_quantity CHECK (quantity >= 0)
);

-- Upload History Table
CREATE TABLE upload_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL UNIQUE,
    entity VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    rows_uploaded INTEGER,
    status VARCHAR(20),
    error_message TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sales_entity ON sales_data(entity);
CREATE INDEX idx_sales_year ON sales_data(year);
CREATE INDEX idx_sales_quarter ON sales_data(quarter);
CREATE INDEX idx_sales_date ON sales_data(sale_date);
CREATE INDEX idx_sales_category ON sales_data(category);
CREATE INDEX idx_sales_product ON sales_data(product);
```

## 4. Storage Bucket 설정 (선택사항)

파일 저장 기능을 사용하려면 Storage bucket을 생성하세요:

1. Supabase 대시보드에서 **Storage** 메뉴로 이동
2. **New bucket** 클릭
3. 다음 설정으로 생성:
   - **Name**: `sales-uploads`
   - **Public bucket**: ❌ (비공개)
   - **File size limit**: 100MB
   - **Allowed MIME types**: 
     - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
     - `application/vnd.ms-excel`

## 5. Row Level Security (RLS) 설정

현재는 Phase 1이므로 RLS를 비활성화 상태로 두거나, 모든 사용자가 읽을 수 있도록 설정할 수 있습니다:

```sql
-- RLS 비활성화 (Phase 1)
ALTER TABLE sales_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE upload_history DISABLE ROW LEVEL SECURITY;

-- 또는 모든 사용자가 읽을 수 있도록 설정
ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read access" ON sales_data FOR SELECT USING (true);
CREATE POLICY "Allow all insert access" ON sales_data FOR INSERT WITH CHECK (true);
```

## 6. 설정 확인

다음 명령어로 개발 서버를 실행하여 연결을 확인하세요:

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 을 열고, 업로드 페이지에서 테스트 파일을 업로드해보세요.

## 7. 문제 해결

### 연결 오류가 발생하는 경우:
- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- API 키가 올바른지 확인 (anon key와 service_role key 구분)

### 데이터베이스 오류가 발생하는 경우:
- SQL 스키마가 올바르게 실행되었는지 확인
- Table Editor에서 `sales_data`와 `upload_history` 테이블이 생성되었는지 확인

## 8. 다음 단계

설정이 완료되면:
1. 테스트 엑셀 파일을 업로드하여 데이터 입력 테스트
2. 대시보드에서 데이터 조회 테스트
3. Vercel에 배포 시 환경 변수도 동일하게 설정

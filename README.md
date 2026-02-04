# Sales Dashboard

InBody의 글로벌 자회사(HQ, USA, BWA, Vietnam, Healthcare, Korot)의 매출 데이터를 통합하여 시각화하고 분석하는 웹 기반 대시보드입니다.

## 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **UI**: React 18+, Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## 주요 기능

- 📊 엑셀 파일 기반 데이터 업로드
- 🔍 다차원 필터링 (Entity, Year, Category, Region, Currency)
- 📈 다양한 차트 시각화 (카테고리, 제품, 지역, 트렌드)
- 📋 분기별 매출 데이터 그리드
- 💾 CSV 내보내기 기능

## 시작하기

### 1. 저장소 클론

```bash
git clone <repository-url>
cd gbs_sales
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_NAME=Sales Dashboard
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
```

### 4. Supabase 데이터베이스 설정

Supabase SQL Editor에서 다음 스키마를 실행하세요:

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

-- Indexes
CREATE INDEX idx_sales_entity ON sales_data(entity);
CREATE INDEX idx_sales_year ON sales_data(year);
CREATE INDEX idx_sales_quarter ON sales_data(quarter);
CREATE INDEX idx_sales_date ON sales_data(sale_date);
CREATE INDEX idx_sales_category ON sales_data(category);
CREATE INDEX idx_sales_product ON sales_data(product);
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
sales-dashboard/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── upload/
│   │   ├── entities/
│   │   ├── years/
│   │   ├── sales/
│   │   └── export/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── charts/
│   ├── dashboard/
│   └── upload/
├── lib/
│   ├── supabase/
│   ├── utils/
│   └── types/
└── public/
```

## 엑셀 파일 형식

업로드할 엑셀 파일은 다음 컬럼을 포함해야 합니다:

- **Date** (필수): 날짜 (YYYY-MM-DD 형식 또는 Excel Date)
- **Product** (필수): 제품명
- **Currency** (필수): 통화 (KRW, USD, VND 등)
- **Sales Amount** (필수): 매출액 (숫자)
- **Quantity** (필수): 수량 (정수)
- **Category** (선택): 제품 카테고리
- **Region** (선택): 판매 지역

## 배포

### Vercel 배포

1. GitHub 저장소를 Vercel에 연결
2. 환경 변수 설정
3. 자동 배포 완료

자세한 내용은 [Vercel 문서](https://vercel.com/docs)를 참조하세요.

## 라이선스

이 프로젝트는 InBody Co., Ltd.의 내부 프로젝트입니다.

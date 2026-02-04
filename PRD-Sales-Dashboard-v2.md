# **Product Requirements Document (PRD)**
## **Sales Dashboard**

### **1. Executive Summary**

Sales Dashboard는 InBody의 글로벌 자회사(HQ, USA, BWA, Vietnam, Healthcare, Korot)의 매출 데이터를 통합하여 시각화하고 분석하는 웹 기반 대시보드입니다. 엑셀 파일 기반의 분산된 매출 데이터를 중앙 집중식으로 관리하며, 다양한 차원(Entity, 기간, 카테고리, 제품, 지역, 통화)에서 매출 성과를 실시간으로 분석할 수 있는 인터페이스를 제공합니다.

---

### **2. Background & Objectives**

**배경**
- 현재 각 Entity별 매출 데이터가 개별 엑셀 파일로 관리되어 통합 분석이 어려움
- 분기별, 연도별 매출 추이 및 Entity 간 비교 분석에 많은 시간 소요
- 경영진 및 재무팀의 신속한 의사결정을 위한 통합 리포팅 도구 필요

**목표**
- 6개 Entity의 매출 데이터를 단일 플랫폼에서 통합 관리
- 다차원 필터링을 통한 유연한 데이터 분석 환경 제공
- 분기별/연도별 매출 트렌드의 시각적 모니터링
- 데이터 업로드부터 리포팅까지의 프로세스 자동화

---

### **3. Scope**

**In Scope**
- 6개 Entity(HQ, USA, BWA, Vietnam, Healthcare, Korot) 매출 데이터 업로드 및 통합
- 엑셀 파일 기반 데이터 수집 인터페이스
- 서버리스 아키텍처 기반 데이터 가공 및 DB 저장
- Entity 및 연도 선택 기능
- 분기별 매출 데이터 그리드 표시
- 카테고리/제품/지역/통화별 매출액 및 수량 시각화
- 다중 필터 기능

**Out of Scope (Phase 1)**
- 실시간 ERP 연동
- 예측 분석 (Forecasting)
- 사용자 권한 관리 (Role-based Access Control) - Supabase Auth는 Phase 2에서 추가
- 데이터 편집 기능
- 모바일 앱

---

### **4. Functional Requirements**

#### **4.1 데이터 업로드 (Data Upload)**

| ID | Requirement | Priority |
|---|---|---|
| FR-1.1 | 사용자는 Entity별 엑셀 파일(.xlsx, .xls)을 업로드할 수 있어야 함 | High |
| FR-1.2 | 업로드 시 Entity 선택 드롭다운 제공 (HQ, USA, BWA, Vietnam, Healthcare, Korot) | High |
| FR-1.3 | 파일 업로드 전 클라이언트 측 데이터 유효성 검증 (필수 컬럼 존재 여부, 데이터 타입 등) | High |
| FR-1.4 | 업로드 진행 상태 표시 (Progress indicator) | Medium |
| FR-1.5 | 업로드 실패 시 상세 에러 메시지 제공 | High |
| FR-1.6 | Supabase Storage를 통한 파일 저장 및 관리 | High |
| FR-1.7 | 다중 파일 동시 업로드 지원 | Low |

#### **4.2 데이터 가공 (Data Processing)**

| ID | Requirement | Priority |
|---|---|---|
| FR-2.1 | Next.js API Routes에서 SheetJS(xlsx) 사용하여 엑셀 파싱 | High |
| FR-2.2 | 파싱된 데이터를 Supabase PostgreSQL에 저장 | High |
| FR-2.3 | 통합 데이터에 Entity 구분 컬럼 추가 | High |
| FR-2.4 | 날짜 데이터로부터 Year, Quarter 컬럼 자동 생성 | High |
| FR-2.5 | 통화 환산 컬럼 생성 (선택적, 환율 정보 제공 시) | Medium |
| FR-2.6 | 중복 데이터 제거 로직 적용 | High |
| FR-2.7 | 데이터 정합성 검증 (매출액 음수 체크, 필수 필드 null 체크 등) | High |

#### **4.3 대시보드 조회 (Dashboard View)**

| ID | Requirement | Priority |
|---|---|---|
| FR-3.1 | Entity 선택 드롭다운 제공 (All, HQ, USA, BWA, Vietnam, Healthcare, Korot) | High |
| FR-3.2 | Year 선택 드롭다운 제공 (업로드된 데이터의 연도 범위) | High |
| FR-3.3 | Entity 및 Year 선택 시 자동으로 데이터 갱신 (클라이언트 측 필터링) | High |
| FR-3.4 | 분기별(Q1, Q2, Q3, Q4) 매출 데이터 그리드 테이블 표시 | High |
| FR-3.5 | 그리드에 매출액(Sales Amount), 수량(Quantity) 표시 | High |
| FR-3.6 | 그리드 데이터 CSV 내보내기 기능 | Medium |

#### **4.4 시각화 및 필터링 (Visualization & Filtering)**

| ID | Requirement | Priority |
|---|---|---|
| FR-4.1 | **카테고리별** 매출액 및 수량 차트 (Bar/Pie chart) | High |
| FR-4.2 | **제품별** 매출액 및 수량 차트 (Top 10 Horizontal Bar) | High |
| FR-4.3 | **지역별** 매출액 및 수량 차트 (Pie chart) | High |
| FR-4.4 | **통화별** 매출액 집계 차트 | High |
| FR-4.5 | 다중 필터 선택 UI 제공 (체크박스) | High |
| FR-4.6 | 분기별 매출 트렌드 라인 차트 (Time-series) | High |
| FR-4.7 | 차트 데이터 호버 시 상세 정보 툴팁 표시 | Medium |
| FR-4.8 | 필터 초기화(Reset) 버튼 | Medium |
| FR-4.9 | 선택된 필터 조건 요약 표시 | Low |

---

### **5. Technical Requirements**

#### **5.1 기술 스택**

**Frontend**
- Framework: **Next.js 14+** (App Router)
- UI Library: **React 18+**
- Styling: **Tailwind CSS** + **shadcn/ui** components
- Charting: **Chart.js** or **Recharts**
- State Management: React Context API or Zustand
- Form Handling: React Hook Form
- File Upload: react-dropzone

**Backend**
- Runtime: **Node.js 18+**
- Framework: **Next.js API Routes** (Serverless Functions)
- Excel Processing: **xlsx** (SheetJS)
- Database Client: **@supabase/supabase-js**

**Database & Storage**
- Database: **Supabase (PostgreSQL)**
- File Storage: **Supabase Storage**
- Authentication: Supabase Auth (Phase 2)

**Deployment**
- Hosting: **Vercel**
- CI/CD: Vercel Git Integration
- Environment: Vercel Edge Network

**Development Tools**
- TypeScript
- ESLint + Prettier
- Git + GitHub

#### **5.2 데이터 모델 (Supabase PostgreSQL Schema)**

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

#### **5.3 API Endpoints (Next.js API Routes)**

```typescript
// /app/api/upload/route.ts
POST /api/upload
- Request: FormData with file and entity
- Response: { success, batchId, rowsInserted }

// /app/api/entities/route.ts
GET /api/entities
- Response: { entities: string[] }

// /app/api/years/route.ts
GET /api/years?entity={entity}
- Response: { years: number[] }

// /app/api/sales/summary/route.ts
GET /api/sales/summary?entity={entity}&year={year}
- Response: { quarterly: [], summary: {} }

// /app/api/sales/breakdown/route.ts
GET /api/sales/breakdown?entity={entity}&year={year}&categories=[]&regions=[]&currencies=[]
- Response: { categoryData, productData, regionData, trendData }

// /app/api/export/route.ts
GET /api/export?entity={entity}&year={year}&format=csv
- Response: CSV file download
```

#### **5.4 Supabase Configuration**

**Row Level Security (RLS) - Phase 2**
```sql
-- Enable RLS
ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;

-- Policies (for future authentication)
CREATE POLICY "Allow read access to all authenticated users"
ON sales_data FOR SELECT
TO authenticated
USING (true);
```

**Storage Buckets**
- Bucket: `sales-uploads`
- Public: No
- File size limit: 50MB
- Allowed MIME types: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/vnd.ms-excel`

---

### **6. Data Requirements**

#### **6.1 입력 데이터 형식**

**엑셀 파일 필수 컬럼**
- Date (날짜): YYYY-MM-DD 형식 또는 Excel Date
- Category (카테고리): 제품 카테고리
- Product (제품명): 개별 제품명
- Region (지역): 판매 지역
- Currency (통화): KRW, USD, VND 등
- Sales Amount (매출액): 숫자 (통화 기호 제외)
- Quantity (수량): 정수

**선택 컬럼**
- Customer Name (고객명)
- Sales Rep (영업 담당자)
- Notes (비고)

#### **6.2 데이터 품질 기준**

- 날짜 필드: 공백 불가, 유효한 날짜 형식
- 매출액: 0 이상의 숫자, 통화 기호 제외
- 수량: 0 이상의 정수
- Entity: 정의된 6개 Entity 중 하나와 매칭
- 중복 거래: (Date + Product + Region + Entity) 조합으로 중복 체크

---

### **7. User Interface/UX**

#### **7.1 페이지 구조**

**Page 1: 데이터 업로드 페이지 (`/upload`)**
- Header: "Sales Dashboard - Data Upload"
- Entity 선택 드롭다운
- 파일 드래그 앤 드롭 영역 (react-dropzone)
- 업로드 진행 상태 바
- 업로드 이력 카드 (Entity, 파일명, 업로드 시간, 상태)

**Page 2: 대시보드 메인 페이지 (`/dashboard`)**
- Header with navigation
- 필터 영역 (Sticky):
  - Entity 선택 (좌측)
  - Year 선택 (좌측)
  - Advanced Filters: 카테고리, 제품, 지역, 통화 (Collapsible section)
- 요약 카드 영역 (4개 카드):
  - 총 매출액
  - 총 수량
  - 평균 거래 금액
  - 활성 제품 수
- 분기별 매출 그리드 테이블
- 시각화 영역 (2x2 Grid):
  - 카테고리별 매출액 (Bar chart)
  - 제품별 TOP 10 (Horizontal bar chart)
  - 지역별 매출 분포 (Pie chart)
  - 분기별 트렌드 (Line chart)

**Page 3: 홈페이지 (`/`)**
- 프로젝트 소개
- 주요 기능 카드
- "Upload Data" 및 "View Dashboard" CTA 버튼

#### **7.2 UX 고려사항**

- **Loading States**: Skeleton UI for data loading
- **Error Handling**: Toast notifications for errors (react-hot-toast)
- **Responsive Design**: Mobile-first approach with breakpoints
- **Accessibility**: WCAG 2.1 AA compliance
- **Color Palette**: Color-blind friendly (Tailwind's default palette)
- **Empty States**: Meaningful messages with action buttons
- **Animations**: Framer Motion for smooth transitions

---

### **8. Non-Functional Requirements**

| Category | Requirement | Target |
|---|---|---|
| **Performance** | 데이터 업로드 처리 시간 | < 30초 (10,000 rows) |
| | 대시보드 초기 로딩 시간 (FCP) | < 2초 |
| | 필터 적용 후 차트 갱신 | < 500ms |
| | Lighthouse Score | > 90 |
| **Scalability** | Vercel 동시 요청 처리 | 100 req/s |
| | Supabase 데이터 볼륨 | 최대 500만 건 |
| **Reliability** | Vercel 가용성 | 99.99% (SLA) |
| | 데이터 백업 | Supabase 자동 백업 |
| **Security** | 파일 업로드 크기 제한 | 최대 50MB |
| | HTTPS Only | Vercel 자동 SSL |
| | SQL Injection Prevention | Parameterized queries |
| **Usability** | 사용자 교육 시간 | 30분 이내 |
| **Compatibility** | 브라우저 지원 | Chrome 90+, Safari 14+, Edge 90+ |

---

### **9. Architecture Overview**

```
┌─────────────────┐
│   Client        │
│  (Next.js SSR)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel Edge    │
│   (CDN + SSL)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐        ┌──────────────────┐
│  Next.js API    │◄──────►│   Supabase       │
│   Routes        │        │  - PostgreSQL    │
│ (Serverless)    │        │  - Storage       │
└─────────────────┘        └──────────────────┘
```

**Data Flow**
1. User uploads Excel file → Vercel
2. API Route parses file with `xlsx` → Extract rows
3. Validate and transform data → Generate batch_id
4. Upload to Supabase Storage (optional)
5. Insert data into PostgreSQL
6. Return success response with batch_id
7. Dashboard queries data via API Routes
8. Client-side filtering and rendering

---

### **10. Environment Variables**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (server-side only)

# Application
NEXT_PUBLIC_APP_NAME=Sales Dashboard
NEXT_PUBLIC_MAX_FILE_SIZE=52428800 # 50MB
```

---

### **11. Success Metrics**

#### **정량적 지표**
- 데이터 업로드 성공률 > 95%
- 대시보드 Lighthouse Performance Score > 90
- API 평균 응답 시간 < 500ms
- 사용자 만족도 (설문) > 4.0/5.0
- 월 평균 사용 빈도 > 15회/사용자

#### **정성적 지표**
- 매출 데이터 통합 분석 시간 단축
- Entity 간 매출 비교 분석 용이성 향상
- 경영진 리포팅 준비 시간 감소

---

### **12. Timeline & Milestones**

| Phase | Milestone | Duration | Deliverables |
|---|---|---|---|
| **Phase 0: 프로토타입** | HTML 프로토타입 완성 | 완료 | Interactive HTML mockup |
| **Phase 1: 환경 설정** | Next.js + Supabase 설정 | 3일 | Repo setup, DB schema |
| **Phase 2: 업로드 기능** | 파일 업로드 구현 | 1주 | Upload page, API routes |
| **Phase 3: 대시보드 개발** | UI 구현 및 차트 연동 | 2주 | Dashboard page, charts |
| **Phase 4: 통합 & 테스트** | E2E 테스트 및 최적화 | 1주 | Testing, bug fixes |
| **Phase 5: 배포** | Vercel 프로덕션 배포 | 2일 | Live URL, monitoring |
| **Phase 6: 사용자 교육** | 문서화 및 트레이닝 | 3일 | User guide, training |

**총 예상 기간: 5~6주**

---

### **13. Deployment Strategy**

**Vercel Deployment**
1. GitHub 저장소 연결
2. 환경 변수 설정 (Vercel Dashboard)
3. Preview deployment for feature branches
4. Production deployment on `main` branch merge

**Supabase Setup**
1. Supabase 프로젝트 생성
2. Database schema 실행 (SQL Editor)
3. Storage bucket 생성 (`sales-uploads`)
4. API keys 복사 → Vercel 환경 변수

**CI/CD Pipeline**
- Git push → Vercel auto-build
- Preview URL for PR reviews
- Automatic production deployment on merge

---

### **14. Risks & Mitigation**

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| 엑셀 파일 형식 불일치 | High | High | 표준 템플릿 제공, 클라이언트 측 검증 |
| Vercel Serverless timeout (10s) | Medium | Medium | 대용량 파일은 청크 처리 or Background job |
| Supabase 무료 tier 제한 | Low | Low | Usage 모니터링, 필요시 Pro plan 전환 |
| Entity별 데이터 구조 차이 | High | Medium | 데이터 매핑 룰 정의, 유연한 파싱 로직 |
| 사용자 교육 부족 | Low | Medium | 상세 문서 + 온보딩 플로우 |

---

### **15. Future Enhancements (Phase 2+)**

- **Authentication**: Supabase Auth 연동 (Google, Email/Password)
- **Role-Based Access**: Admin, Viewer, Editor 역할 관리
- **Real-time Updates**: Supabase Realtime for collaborative viewing
- **ERP Integration**: D365, Odoo API 연동
- **ML Predictions**: 매출 예측 모델 (TensorFlow.js)
- **Mobile App**: React Native + Supabase
- **Internationalization**: i18n (한국어, 영어, 베트남어)
- **Advanced Analytics**: Cohort analysis, Retention metrics
- **Custom Reports**: 사용자 정의 리포트 빌더
- **Notifications**: 이메일 리포트 자동 발송 (Resend API)

---

### **16. Project Structure**

```
sales-dashboard/
├── app/
│   ├── (auth)/                 # Auth pages (Phase 2)
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard main
│   │   └── upload/
│   │       └── page.tsx        # Upload page
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts
│   │   ├── sales/
│   │   │   ├── summary/
│   │   │   │   └── route.ts
│   │   │   └── breakdown/
│   │   │       └── route.ts
│   │   └── export/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # shadcn components
│   ├── charts/
│   │   ├── CategoryChart.tsx
│   │   ├── ProductChart.tsx
│   │   ├── RegionChart.tsx
│   │   └── TrendChart.tsx
│   ├── dashboard/
│   │   ├── FilterPanel.tsx
│   │   ├── SummaryCards.tsx
│   │   └── QuarterlyTable.tsx
│   └── upload/
│       └── FileUploader.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── utils/
│   │   ├── excel-parser.ts
│   │   ├── data-validator.ts
│   │   └── formatters.ts
│   └── types/
│       └── sales.ts
├── public/
│   └── templates/
│       └── sales-template.xlsx
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

### **17. Testing Strategy**

**Unit Tests** (Jest + React Testing Library)
- API Routes 테스트
- Excel 파싱 로직 테스트
- 데이터 변환 함수 테스트

**Integration Tests**
- Supabase 연동 테스트
- File upload → DB insert flow

**E2E Tests** (Playwright)
- 파일 업로드 시나리오
- 대시보드 필터링 시나리오
- 데이터 export 시나리오

**Performance Tests**
- Lighthouse CI
- API load testing (k6)

---

### **18. Documentation**

**Developer Documentation**
- README.md: 프로젝트 개요 및 설정 가이드
- CONTRIBUTING.md: 개발 가이드라인
- API.md: API 엔드포인트 문서

**User Documentation**
- 사용자 매뉴얼 (Notion 또는 GitBook)
- 엑셀 템플릿 가이드
- FAQ 및 트러블슈팅

---

### **19. Approval**

| Role | Name | Signature | Date |
|---|---|---|---|
| Project Sponsor | | | |
| Product Owner | Cho Seunghyun | | 2026-02-04 |
| Tech Lead | | | |
| QA Lead | | | |

---

**Document Version:** 2.0 (Node.js + Supabase + Vercel)
**Last Updated:** 2026-02-04  
**Author:** Cho Seunghyun

---

## **Quick Start Guide**

### **For Development**

1. **Clone repository**
```bash
git clone https://github.com/your-org/sales-dashboard.git
cd sales-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Supabase**
   - Create project at supabase.com
   - Run schema from `/database/schema.sql`
   - Copy API keys to `.env.local`

4. **Run development server**
```bash
npm run dev
```

5. **Open browser**
```
http://localhost:3000
```

### **For Deployment**

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
   - Import repository in Vercel Dashboard
   - Add environment variables
   - Deploy!

3. **Access production URL**
```
https://sales-dashboard.vercel.app
```

---

이 PRD는 Node.js + Supabase + Vercel 스택에 최적화되어 있으며, 서버리스 아키텍처의 장점을 활용하도록 설계되었습니다.

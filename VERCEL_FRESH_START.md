# Vercel 프로젝트 삭제 후 재생성 가이드

기존 프로젝트를 삭제하고 `gbs_sales` 저장소로 새로 시작하는 방법입니다.

## 🗑️ 1단계: 기존 프로젝트 삭제

1. **Vercel 대시보드** 접속
2. **"gbs-sales"** 프로젝트 선택
3. **Settings** 탭 클릭
4. 맨 아래로 스크롤
5. **"General"** 섹션 찾기
6. **"Delete Project"** 버튼 클릭
7. 프로젝트 이름 입력하여 확인
8. **"Delete"** 클릭

⚠️ **주의**: 배포 기록과 설정이 모두 삭제됩니다. 환경 변수는 다시 설정해야 합니다.

---

## 🆕 2단계: 새 프로젝트 생성

### 방법 1: Import Git Repository (권장)

1. Vercel 대시보드에서 **"Add New..."** → **"Project"** 클릭
2. **"Import Git Repository"** 섹션에서:
   - 저장소 검색: `gbs_sales` 입력
   - **"InBodyGBS/gbs_sales"** 저장소 선택
   - **"Import"** 버튼 클릭

### 방법 2: Git URL 직접 입력

1. **"Enter a Git repository URL to deploy..."** 입력란 사용
2. URL 입력:
   ```
   https://github.com/InBodyGBS/gbs_sales.git
   ```
3. **"Continue"** 버튼 클릭

---

## ⚙️ 3단계: 프로젝트 설정

### 기본 설정 (자동 감지됨)
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 환경 변수 설정 (중요!)

**"Environment Variables"** 섹션에서 다음 변수들을 추가:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_NAME=GBS Sales Dashboard
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
```

**환경 변수 값 찾는 방법:**
1. `.env.local` 파일 확인 (로컬에 있음)
2. 또는 Supabase 대시보드 → Settings → API

---

## 🚀 4단계: 배포 실행

1. 모든 설정 완료 후 **"Deploy"** 버튼 클릭
2. 빌드 진행 상황 확인
3. 배포 완료 후 **"Visit"** 버튼으로 사이트 확인

---

## ✅ 배포 완료 후 확인

1. **배포 URL 확인**
   - `https://gbs-sales.vercel.app` 또는 할당된 URL

2. **Source 탭에서 확인**
   - `package.json`의 `"name"`이 `"gbs-sales-dashboard"`인지 확인
   - `gbs_dash` 코드가 아닌 `gbs_sales` 코드인지 확인

3. **기능 테스트**
   - 홈페이지 로드
   - 업로드 페이지 접근
   - 대시보드 페이지 접근
   - Supabase 연결 확인

---

## 📝 체크리스트

- [ ] 기존 프로젝트 삭제 완료
- [ ] 새 프로젝트 생성 (`gbs_sales` 저장소)
- [ ] 환경 변수 모두 설정 완료
- [ ] 배포 완료
- [ ] Source 탭에서 올바른 코드 확인
- [ ] 사이트 기능 테스트 완료

---

**프로젝트 삭제 후 재생성하면 깔끔하게 시작할 수 있습니다!** 🎯

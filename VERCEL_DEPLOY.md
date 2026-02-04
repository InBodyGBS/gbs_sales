# Vercel 배포 가이드

이 문서는 GBS Sales Dashboard를 Vercel에 배포하는 방법을 설명합니다.

## 📋 사전 준비사항

1. **GitHub/GitLab/Bitbucket 저장소**
   - 프로젝트가 Git 저장소에 푸시되어 있어야 합니다
   - Vercel은 Git 저장소와 연동하여 배포합니다

2. **Vercel 계정**
   - [vercel.com](https://vercel.com)에서 계정 생성
   - GitHub/GitLab 계정으로 로그인 가능

3. **Supabase 프로젝트 설정 완료**
   - Supabase 프로젝트가 생성되어 있어야 합니다
   - API 키와 URL을 준비해두세요

---

## 🚀 배포 방법

### 방법 1: Vercel 웹 대시보드 사용 (권장)

1. **Vercel 로그인**
   - [vercel.com](https://vercel.com) 접속
   - GitHub/GitLab 계정으로 로그인

2. **새 프로젝트 추가**
   - 대시보드에서 "Add New..." → "Project" 클릭
   - Git 저장소 선택 (GitHub/GitLab/Bitbucket)
   - 프로젝트 저장소 선택

3. **프로젝트 설정**
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `npm install` (기본값)

4. **환경 변수 설정**
   - "Environment Variables" 섹션에서 다음 변수들을 추가:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_NAME=GBS Sales Dashboard
   NEXT_PUBLIC_MAX_FILE_SIZE=104857600
   ```

   **중요**: 
   - `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트에서 접근 가능합니다
   - `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용되므로 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다

5. **배포 실행**
   - "Deploy" 버튼 클릭
   - 빌드가 완료되면 배포 URL이 생성됩니다

---

### 방법 2: Vercel CLI 사용

1. **Vercel CLI 설치**
   ```bash
   npm i -g vercel
   ```

2. **로그인**
   ```bash
   vercel login
   ```

3. **프로젝트 배포**
   ```bash
   vercel
   ```

4. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

5. **환경 변수 설정**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_APP_NAME
   vercel env add NEXT_PUBLIC_MAX_FILE_SIZE
   ```

---

## 🔧 환경 변수 상세 설정

### Supabase 환경 변수 가져오기

1. Supabase 대시보드 접속
2. 프로젝트 선택
3. Settings → API 메뉴로 이동
4. 다음 정보를 복사:

   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ 비밀번호처럼 보관)

### 환경 변수 목록

| 변수명 | 설명 | 예시 값 |
|--------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_APP_NAME` | 애플리케이션 이름 | `GBS Sales Dashboard` |
| `NEXT_PUBLIC_MAX_FILE_SIZE` | 최대 파일 크기 (바이트) | `104857600` (100MB) |

---

## 📝 배포 후 확인사항

1. **배포 URL 확인**
   - Vercel 대시보드에서 배포된 URL 확인
   - 예: `https://gbs-sales-dashboard.vercel.app`

2. **환경 변수 확인**
   - 배포된 사이트에서 브라우저 콘솔 열기
   - `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)` 확인 (개발 모드에서만)

3. **기능 테스트**
   - ✅ 홈페이지 로드 확인
   - ✅ 업로드 페이지 접근
   - ✅ 대시보드 페이지 접근
   - ✅ 데이터 업로드 테스트
   - ✅ 차트 표시 확인

---

## 🔄 자동 배포 설정

Vercel은 Git 저장소와 연동되어 자동으로 배포됩니다:

- **프로덕션 배포**: `main` 또는 `master` 브랜치에 푸시 시
- **프리뷰 배포**: 다른 브랜치에 푸시 시 (PR 생성 시)

### 배포 브랜치 변경

1. Vercel 대시보드 → 프로젝트 설정
2. "Git" 섹션에서 Production Branch 변경 가능

---

## 🐛 문제 해결

### 빌드 에러

1. **로컬에서 빌드 테스트**
   ```bash
   npm run build
   ```
   - 로컬에서 빌드가 성공해야 Vercel에서도 성공합니다

2. **환경 변수 확인**
   - Vercel 대시보드에서 모든 환경 변수가 올바르게 설정되었는지 확인

3. **빌드 로그 확인**
   - Vercel 대시보드 → Deployments → 해당 배포의 로그 확인

### 런타임 에러

1. **브라우저 콘솔 확인**
   - F12 → Console 탭에서 에러 확인

2. **Vercel 함수 로그 확인**
   - Vercel 대시보드 → 프로젝트 → Functions 탭
   - API 라우트의 로그 확인

### Supabase 연결 에러

1. **CORS 설정 확인**
   - Supabase 대시보드 → Settings → API
   - "Allowed Origins"에 Vercel 도메인 추가
   - 예: `https://gbs-sales-dashboard.vercel.app`

2. **RLS (Row Level Security) 확인**
   - Supabase 대시보드 → Authentication → Policies
   - 필요한 테이블에 적절한 정책이 설정되어 있는지 확인

---

## 📊 성능 최적화

### 이미지 최적화
- Next.js Image 컴포넌트 사용 (이미 적용됨)

### API 라우트 최적화
- 서버 사이드에서 데이터 처리
- 적절한 캐싱 전략 사용

### 빌드 최적화
- 불필요한 의존성 제거
- Dynamic imports 사용

---

## 🔐 보안 고려사항

1. **환경 변수 보호**
   - `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출되지 않도록 주의
   - `.env.local` 파일은 Git에 커밋하지 않음 (이미 .gitignore에 포함됨)

2. **Supabase RLS 정책**
   - 프로덕션 환경에서는 적절한 RLS 정책 설정 필수

3. **API 라우트 보호**
   - 필요시 인증 미들웨어 추가

---

## 📚 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Supabase 문서](https://supabase.com/docs)

---

## ✅ 체크리스트

배포 전 확인사항:

- [ ] Git 저장소에 코드 푸시 완료
- [ ] Supabase 프로젝트 생성 및 설정 완료
- [ ] 환경 변수 준비 완료
- [ ] 로컬에서 `npm run build` 성공
- [ ] 로컬에서 기본 기능 테스트 완료
- [ ] Vercel 계정 생성 완료
- [ ] Vercel에 프로젝트 연결 완료
- [ ] 환경 변수 설정 완료
- [ ] 배포 성공 확인
- [ ] 배포된 사이트 기능 테스트 완료

---

**배포 완료 후**: 배포된 URL을 팀과 공유하고, 필요시 커스텀 도메인을 설정하세요! 🎉

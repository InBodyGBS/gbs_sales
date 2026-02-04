# Vercel 재배포 가이드

Git 저장소를 연결한 후 배포하는 방법입니다.

## 🚀 자동 배포

Vercel은 Git 저장소에 연결되면 자동으로 배포를 시작합니다. 

### 배포 상태 확인

1. Vercel 대시보드 → "gbs-sales" 프로젝트
2. "Deployments" 탭 클릭
3. 최신 배포 상태 확인:
   - 🟡 **Building**: 빌드 중
   - 🟢 **Ready**: 배포 완료
   - 🔴 **Error**: 에러 발생

---

## 🔄 수동 재배포 방법

### 방법 1: Git에 푸시하여 트리거

```powershell
# 작은 변경사항 커밋 (예: README 수정)
git add .
git commit -m "Trigger redeploy"
git push origin main
```

### 방법 2: Vercel 대시보드에서 재배포

1. **Deployments** 탭으로 이동
2. 이전 배포 기록에서 **"..."** 메뉴 클릭
3. **"Redeploy"** 선택
4. 확인

### 방법 3: 특정 커밋으로 재배포

1. **Deployments** 탭으로 이동
2. 재배포하고 싶은 배포 기록 클릭
3. **"Redeploy"** 버튼 클릭

---

## ⚙️ 환경 변수 확인

배포 전에 환경 변수가 설정되어 있는지 확인하세요:

1. Settings → **"Environment Variables"** 섹션
2. 다음 변수들이 모두 설정되어 있는지 확인:
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `NEXT_PUBLIC_APP_NAME`
   - ✅ `NEXT_PUBLIC_MAX_FILE_SIZE`

---

## 🔍 배포 로그 확인

배포 중 문제가 발생하면:

1. **Deployments** 탭 → 배포 기록 클릭
2. **"Build Logs"** 또는 **"Runtime Logs"** 확인
3. 에러 메시지 확인 및 수정

---

## ✅ 배포 완료 후 확인

1. **배포 URL 확인**
   - `https://gbs-sales.vercel.app` 또는 할당된 URL
   - "Visit" 버튼 클릭

2. **기능 테스트**
   - ✅ 홈페이지 로드
   - ✅ 업로드 페이지 접근
   - ✅ 대시보드 페이지 접근
   - ✅ Supabase 연결 확인

---

## 🐛 문제 해결

### 빌드 에러

```bash
# 로컬에서 빌드 테스트
npm run build
```

### 환경 변수 에러

- Settings → Environment Variables에서 모든 변수 확인
- Production, Preview, Development 환경 모두 설정되어 있는지 확인

### Supabase 연결 에러

- Supabase 대시보드에서 CORS 설정 확인
- Vercel 도메인을 허용 목록에 추가

---

**배포가 완료되면 알려주세요!** 🎉

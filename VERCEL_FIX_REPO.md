# Vercel에서 잘못된 저장소 참조 문제 해결

Vercel에서 Git URL을 변경했는데도 이전 저장소(`gbs_dash`)의 데이터가 나오는 경우 해결 방법입니다.

## 🔍 문제 진단

### 1. Vercel Git 연결 확인

1. Vercel 대시보드 → "gbs-sales" 프로젝트
2. Settings → **"Git"** 섹션
3. 현재 연결된 저장소 확인:
   - ✅ `InBodyGBS/gbs_sales` 여야 함
   - ❌ `InBodyGBS/gbs_dash`면 문제!

### 2. 배포 소스 확인

1. **Deployments** 탭으로 이동
2. 최신 배포 기록 클릭
3. **"Source"** 섹션 확인:
   - 어떤 저장소에서 배포되었는지 확인
   - 어떤 브랜치에서 배포되었는지 확인

---

## 🔧 해결 방법

### 방법 1: Git 연결 완전히 재설정

1. **Settings → Git** 섹션으로 이동
2. **"Disconnect"** 버튼 클릭 (현재 연결 해제)
3. 확인 메시지에서 확인
4. **"Connect Git Repository"** 버튼 클릭
5. `gbs_sales` 저장소 선택
6. **"Save"** 클릭

### 방법 2: 프로젝트 삭제 후 재생성

⚠️ **주의**: 배포 기록이 삭제됩니다.

1. Settings → General → **"Delete Project"**
2. 프로젝트 삭제 확인
3. 새 프로젝트 생성:
   - "Add New..." → "Project"
   - `gbs_sales` 저장소 선택
   - 환경 변수 다시 설정

### 방법 3: 환경 변수 확인

이전 프로젝트의 환경 변수가 남아있을 수 있습니다:

1. Settings → **"Environment Variables"** 섹션
2. 모든 환경 변수 확인:
   - `NEXT_PUBLIC_SUPABASE_URL` - 올바른 Supabase 프로젝트 URL인지 확인
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 올바른 키인지 확인
   - `SUPABASE_SERVICE_ROLE_KEY` - 올바른 키인지 확인

### 방법 4: 강제 재배포

1. **Deployments** 탭으로 이동
2. 최신 배포 기록에서 **"..."** 메뉴 클릭
3. **"Redeploy"** 선택
4. 배포가 `gbs_sales` 저장소에서 실행되는지 확인

---

## ✅ 확인 체크리스트

- [ ] Vercel Settings → Git에서 `gbs_sales` 저장소가 연결되어 있음
- [ ] GitHub에서 `gbs_sales` 저장소에 최신 코드가 푸시되어 있음
- [ ] Vercel Deployments에서 배포 소스가 `gbs_sales` 저장소임
- [ ] 환경 변수가 올바른 Supabase 프로젝트를 가리키고 있음
- [ ] 최신 배포가 `gbs_sales` 저장소에서 실행됨

---

## 🐛 추가 확인사항

### GitHub 저장소 확인

GitHub에서 `gbs_sales` 저장소를 직접 확인:
- https://github.com/InBodyGBS/gbs_sales
- 파일들이 올바르게 있는지 확인
- `package.json`이 올바른지 확인

### Vercel 배포 로그 확인

1. Deployments → 배포 기록 클릭
2. **"Build Logs"** 확인
3. 어떤 저장소에서 빌드되는지 확인
4. 에러 메시지 확인

---

**문제가 계속되면 Vercel 지원팀에 문의하거나 프로젝트를 삭제 후 재생성하는 것이 가장 확실합니다.**

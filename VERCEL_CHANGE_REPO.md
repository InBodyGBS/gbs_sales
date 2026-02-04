# Vercel에서 Git 저장소 변경하기

현재 Vercel 프로젝트에 연결된 Git 저장소를 다른 저장소로 변경하는 방법입니다.

## 🔄 방법 1: Vercel 대시보드에서 변경 (권장)

### 단계별 가이드

1. **Settings 페이지로 이동**
   - Vercel 대시보드에서 "gbs-sales" 프로젝트 선택
   - 상단 네비게이션에서 **"Settings"** 탭 클릭

2. **Git 섹션 찾기**
   - Settings 페이지에서 **"Git"** 섹션으로 스크롤
   - 현재 연결된 저장소 정보가 표시됩니다

3. **저장소 연결 해제**
   - **"Disconnect"** 또는 **"Unlink"** 버튼 클릭
   - 확인 메시지에서 확인

4. **새 저장소 연결**
   - **"Connect Git Repository"** 버튼 클릭
   - GitHub/GitLab/Bitbucket에서 새 저장소 선택
   - 또는 Git URL 직접 입력

5. **저장**
   - 새 저장소 선택 후 **"Save"** 클릭

---

## 🔄 방법 2: 프로젝트 삭제 후 재생성

만약 Settings에서 변경이 어렵다면:

1. **프로젝트 삭제**
   - Settings → General → **"Delete Project"**
   - ⚠️ 주의: 배포 기록이 삭제됩니다

2. **새 프로젝트 생성**
   - "Add New..." → "Project"
   - 올바른 Git 저장소 선택
   - 환경 변수 다시 설정

---

## 📝 새 Git 저장소 준비

새 저장소로 변경하기 전에:

### 1. GitHub에 새 저장소 생성 (아직 없다면)

```bash
# GitHub에서 새 저장소 생성
# Repository name: gbs_sales (또는 원하는 이름)
```

### 2. 로컬에서 새 저장소에 푸시

```powershell
# 프로젝트 폴더로 이동
cd "C:\Users\user\OneDrive - InBody Co., Ltd\GBS_Project\gbs_sales"

# 기존 원격 저장소 확인
git remote -v

# 기존 원격 저장소 제거 (있다면)
git remote remove origin

# 새 원격 저장소 추가
git remote add origin https://github.com/InBodyGBS/gbs_sales.git

# 푸시
git push -u origin main
```

---

## ⚙️ 환경 변수 확인

저장소를 변경해도 환경 변수는 유지됩니다. 하지만 확인해보세요:

1. Settings → **"Environment Variables"** 섹션
2. 다음 변수들이 설정되어 있는지 확인:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_MAX_FILE_SIZE`

---

## 🔍 현재 저장소 확인

현재 어떤 저장소에 연결되어 있는지 확인:

1. Vercel 대시보드 → 프로젝트 → **"Repository"** 버튼 클릭
2. 또는 Settings → **"Git"** 섹션에서 확인

---

## ⚠️ 주의사항

1. **배포 기록**: 저장소를 변경해도 기존 배포 기록은 유지됩니다
2. **자동 배포**: 새 저장소의 `main` 브랜치에 푸시하면 자동으로 배포됩니다
3. **환경 변수**: 저장소 변경 시 환경 변수는 자동으로 유지됩니다

---

## 🚀 변경 후 확인

1. **새 저장소 연결 확인**
   - Settings → Git에서 새 저장소 URL 확인

2. **테스트 배포**
   - 새 저장소의 `main` 브랜치에 작은 변경사항 푸시
   - Vercel에서 자동 배포가 트리거되는지 확인

---

**문제가 있으면 알려주세요!** 🎯

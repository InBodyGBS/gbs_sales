# GitHub 저장소 설정 및 푸시 가이드

이 가이드는 GBS Sales Dashboard 프로젝트를 GitHub에 푸시하는 방법을 설명합니다.

## 📋 사전 준비

1. **GitHub 계정**이 있어야 합니다
2. **Git이 설치**되어 있어야 합니다
3. **로컬 프로젝트**가 준비되어 있어야 합니다

---

## 🚀 단계별 가이드

### 1단계: GitHub에서 새 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 우측 상단의 **"+"** 버튼 클릭 → **"New repository"** 선택
3. 저장소 정보 입력:
   - **Repository name**: `gbs_sales` (또는 원하는 이름)
   - **Description**: "GBS Sales Dashboard - InBody Global Sales Data Visualization"
   - **Visibility**: 
     - Public (공개) 또는 Private (비공개) 선택
   - **⚠️ 중요**: 
     - ✅ **"Add a README file"** 체크 해제 (이미 README.md가 있음)
     - ✅ **"Add .gitignore"** 체크 해제 (이미 .gitignore가 있음)
     - ✅ **"Choose a license"** 선택 안 함
4. **"Create repository"** 버튼 클릭

---

### 2단계: 로컬 프로젝트 Git 초기화 및 푸시

터미널(또는 PowerShell)에서 프로젝트 폴더로 이동한 후 다음 명령어를 실행하세요:

```bash
# 1. 현재 디렉토리 확인 (프로젝트 루트에 있어야 함)
cd C:\Users\user\OneDrive - InBody Co., Ltd\GBS_Project\gbs_sales

# 2. Git 저장소 초기화 (이미 초기화되어 있다면 이 단계는 건너뛰기)
git init

# 3. 모든 파일 추가 (단, .env.local은 자동으로 제외됨)
git add .

# 4. 첫 커밋 생성
git commit -m "Initial commit: GBS Sales Dashboard"

# 5. 메인 브랜치로 이름 변경 (필요한 경우)
git branch -M main

# 6. GitHub 저장소를 원격 저장소로 추가
# ⚠️ 아래 URL을 본인의 GitHub 저장소 URL로 변경하세요!
git remote add origin https://github.com/InBodyGBS/gbs_sales.git

# 7. GitHub에 푸시
git push -u origin main
```

**⚠️ 주의사항:**
- 6번 단계의 URL은 GitHub에서 생성한 저장소의 URL로 변경해야 합니다
- GitHub 저장소 페이지에서 초록색 "Code" 버튼을 클릭하면 URL을 복사할 수 있습니다

---

### 3단계: .env.local 파일 확인

**중요**: `.env.local` 파일은 **절대 Git에 커밋하면 안 됩니다!**

확인 방법:
```bash
# .gitignore에 .env.local이 포함되어 있는지 확인
cat .gitignore | grep .env
```

`.gitignore` 파일에 다음이 포함되어 있어야 합니다:
```
.env*.local
.env
```

만약 `.env.local`이 이미 Git에 추가되어 있다면:
```bash
# Git 캐시에서 제거 (파일은 로컬에 유지됨)
git rm --cached .env.local
git commit -m "Remove .env.local from git"
```

---

### 4단계: 푸시 확인

GitHub 저장소 페이지에서:
- ✅ 파일들이 올라갔는지 확인
- ✅ README.md가 보이는지 확인
- ✅ `.env.local` 파일이 **보이지 않아야** 합니다

---

## 🔧 문제 해결

### 에러: "remote origin already exists"

```bash
# 기존 원격 저장소 제거
git remote remove origin

# 새로 추가
git remote add origin https://github.com/InBodyGBS/gbs_sales.git
```

### 에러: "Authentication failed"

GitHub 인증이 필요합니다:

**방법 1: Personal Access Token 사용 (권장)**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" 클릭
3. 권한 선택: `repo` (전체 권한)
4. 토큰 생성 후 복사
5. 푸시 시 비밀번호 대신 토큰 사용

**방법 2: GitHub CLI 사용**
```bash
# GitHub CLI 설치 후
gh auth login
```

### 에러: "Large files detected"

큰 파일이 있는 경우:
```bash
# .gitignore에 큰 파일 추가
echo "*.xlsx" >> .gitignore
echo "*.csv" >> .gitignore

# 다시 커밋
git add .gitignore
git commit -m "Add large files to gitignore"
git push
```

---

## ✅ 체크리스트

푸시 전 확인사항:

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있음
- [ ] GitHub 저장소 생성 완료
- [ ] 로컬 Git 저장소 초기화 완료
- [ ] 원격 저장소 연결 완료
- [ ] 파일 푸시 완료
- [ ] GitHub에서 파일 확인 완료
- [ ] `.env.local`이 GitHub에 노출되지 않음

---

## 🎯 다음 단계

GitHub에 푸시가 완료되면:

1. **Vercel로 돌아가기**
2. **"Import Git Repository"** 섹션에서 새로고침
3. **"gbs_sales"** 저장소가 보이면 **"Import"** 클릭
4. 환경 변수 설정
5. 배포!

---

**도움이 필요하면 알려주세요!** 🚀

# Gemini Project Configuration

## 1. 기본 지침
- 항상 한국어로 응답합니다.
- 개발 환경은 Windows입니다.
- 단계별로 생각하고 계획을 세운 후 작업을 수행합니다.
- 파일 수정 전에는 항상 `git pull`을 실행하여 원격 저장소의 최신 변경사항을 먼저 반영합니다.
- 파일 추가 및 수정 후에는 항상 `git add .`, `git commit`, `git push`를 수행합니다.
- 커밋 메시지는 한글로 작성하며, `commit_message.txt` 파일을 `utf-8`로 생성하여 사용하고 커밋 후에는 `del commit_message.txt` 명령으로 삭제합니다.

## 2. 프로젝트 개요
이 프로젝트는 **원룸 관리 애플리케이션**입니다. Vue.js 기반의 프론트엔드와 Node.js/Express 기반의 백엔드로 구성되어 있습니다.

- **프론트엔드:** `frontend` 디렉토리, Vue.js, Vuetify, Vuex 사용
- **백엔드:** `backend` 디렉토리, Node.js, Express, Sequelize ORM 사용
- **데이터베이스:** SQLite, `database/oneroom.db` 파일에 저장

## 3. 주요 기술 스택
- **Frontend:** Vue.js 3, Vite, Vue Router, Vuex, Vuetify, Axios, Chart.js
- **Backend:** Node.js, Express, Sequelize, SQLite3, JWT, Bcrypt, Multer, ExcelJS
- **Package Manager:** npm

## 4. 실행 및 스크립트
프로젝트 전체를 한 번에 실행하려면 루트 디렉토리에서 `run.bat` 파일을 실행하십시오.

- **전체 실행:** `run.bat`
- **프론트엔드 개발 서버 실행:** `cd frontend` 후 `npm run dev`
- **백엔드 개발 서버 실행:** `cd backend` 후 `npm run dev` (또는 `npm start`)

### 백엔드 데이터베이스 명령어
`cd backend` 디렉토리에서 다음 명령어를 사용할 수 있습니다.
- **마이그레이션 실행:** `npm run db:migrate`
- **초기 데이터 생성 (Seeding):** `npm run db:seed`
- **데이터베이스 초기화:** `npm run db:reset`

## 5. 코딩 스타일 및 규칙
- 프로젝트의 일관성을 유지하기 위해 기존 코드의 스타일과 구조를 따릅니다.
- 특히 `.cursorrules` 디렉토리의 규칙들을 참고하여 코드를 작성합니다.
- API 요청은 `frontend/src/api.js`에 정의된 함수들을 사용합니다.
- Vuex 상태 관리는 `frontend/src/store` 디렉토리의 모듈화된 구조를 따릅니다.
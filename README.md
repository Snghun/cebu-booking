# 예약 시스템 웹 애플리케이션

React, Node.js, MongoDB를 이용한 풀스택 예약 시스템입니다.

## 기술 스택

### 프론트엔드
- React 18
- Material-UI (MUI)
- React Router
- Axios

### 백엔드
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT 인증
- bcryptjs (비밀번호 암호화)

## 프로젝트 구조

```
booking/
├── client/          # React 프론트엔드
├── server/          # Node.js 백엔드
├── package.json     # 루트 패키지 관리
└── README.md        # 프로젝트 설명
```

## 설치 및 실행

### 1. 전체 의존성 설치
```bash
npm run install-all
```

### 2. 환경 변수 설정
서버 디렉토리에서 `.env` 파일을 생성하고 다음 내용을 추가하세요:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/booking-app
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 3. MongoDB 설치 및 실행
MongoDB를 로컬에 설치하거나 MongoDB Atlas를 사용하세요.

### 4. 개발 서버 실행
```bash
# 프론트엔드와 백엔드 동시 실행
npm run dev

# 또는 개별 실행
npm run server  # 백엔드만
npm run client  # 프론트엔드만
```

## 접속 주소

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:5000

## 주요 기능 (예정)

- [ ] 사용자 회원가입/로그인
- [ ] 예약 생성/수정/삭제
- [ ] 예약 조회 및 관리
- [ ] 관리자 대시보드
- [ ] 실시간 알림

## 개발 가이드

### 백엔드 API 개발
- `server/routes/` - API 라우트
- `server/models/` - MongoDB 스키마
- `server/middleware/` - 미들웨어
- `server/controllers/` - 컨트롤러

### 프론트엔드 개발
- `client/src/components/` - React 컴포넌트
- `client/src/pages/` - 페이지 컴포넌트
- `client/src/services/` - API 서비스
- `client/src/utils/` - 유틸리티 함수

## 라이센스

ISC 
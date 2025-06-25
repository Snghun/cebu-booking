# 세부 리조트 예약 시스템

React, Netlify Functions, MongoDB를 이용한 현대적인 리조트 예약 시스템입니다.

## 🏗️ 아키텍처

- **프론트엔드**: React 19.1.0 + Tailwind CSS
- **백엔드**: Netlify Functions (서버리스)
- **데이터베이스**: MongoDB
- **배포**: Netlify + GitHub Pages

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
# 루트 의존성 설치
npm install

# 클라이언트 의존성 설치
cd client && npm install

# Netlify Functions 의존성 설치
cd netlify/functions && npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# MongoDB 연결 문자열
MONGODB_URI=mongodb://localhost:27017/booking-app

# JWT 시크릿 키
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Netlify Functions URL (로컬 개발용)
REACT_APP_API_URL=http://localhost:8888/.netlify/functions/api
```

### 3. MongoDB 실행

MongoDB가 로컬에서 실행 중인지 확인하세요.

### 4. 개발 서버 실행

```bash
# Netlify Functions 개발 서버 (백엔드)
netlify dev

# 새 터미널에서 React 개발 서버 (프론트엔드)
cd client && npm start
```

## 📁 프로젝트 구조

```
booking/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── services/      # API 서비스
│   │   └── context/       # React Context
│   └── public/            # 정적 파일
├── netlify/
│   └── functions/         # Netlify Functions (서버리스 API)
│       ├── api.js         # 메인 API 함수
│       ├── init-rooms.js  # 객실 데이터 초기화
│       └── init-gallery.js # 갤러리 데이터 초기화
└── netlify.toml           # Netlify 설정
```

## 🔧 주요 기능

### 예약 시스템
- ✅ 객실 선택 및 예약
- ✅ 체크인/체크아웃 날짜 선택
- ✅ 투숙객 수 선택
- ✅ 예약자 정보 입력
- ✅ 예약 확인 및 취소
- ✅ 예약 내역 조회

### 사용자 관리
- ✅ 회원가입/로그인
- ✅ JWT 기반 인증
- ✅ 사용자 프로필 관리

### 객실 관리
- ✅ 객실 목록 조회
- ✅ 객실 상세 정보
- ✅ 객실 가격 및 시설 정보

## 🌐 API 엔드포인트

### 인증
- `POST /api/users/register` - 회원가입
- `POST /api/users/login` - 로그인

### 예약
- `GET /api/bookings` - 예약 목록 조회
- `POST /api/bookings` - 새 예약 생성
- `PUT /api/bookings/:id` - 예약 수정
- `DELETE /api/bookings/:id` - 예약 취소

### 객실
- `GET /api/rooms` - 객실 목록 조회
- `GET /api/rooms/:id` - 객실 상세 정보

### 갤러리
- `GET /api/gallery` - 갤러리 이미지 조회

## 🚀 배포

### Netlify 배포
```bash
# Netlify에 배포
netlify deploy --prod
```

### GitHub Pages 배포
```bash
# 클라이언트 빌드
cd client && npm run build

# GitHub Pages에 배포
npm run deploy
```

## 🛠️ 개발 도구

### 스크립트
```bash
# 전체 의존성 설치
npm run install-all

# 클라이언트 개발 서버
npm run dev

# 클라이언트 빌드
npm run build

# Netlify Functions 의존성 설치
npm run install-functions
```

## 📝 예약 데이터 예시

```json
{
  "roomId": "객실ID",
  "checkIn": "2024-01-15",
  "checkOut": "2024-01-17",
  "guests": 2,
  "guestName": "홍길동",
  "guestEmail": "hong@example.com",
  "guestPhone": "010-1234-5678",
  "specialRequests": "특별 요청사항"
}
```

## 🔒 보안

- JWT 토큰 기반 인증
- bcrypt를 이용한 비밀번호 암호화
- CORS 설정
- 입력 데이터 검증

## 📱 반응형 디자인

- 모바일 우선 디자인
- Tailwind CSS를 이용한 현대적인 UI
- 부드러운 애니메이션과 전환 효과

## 🎨 UI/UX 특징

- 직관적인 예약 플로우
- 실시간 폼 검증
- 로딩 상태 표시
- 에러 메시지 처리
- 성공 알림

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**Cebu Resort Booking System** - 세부 리조트 예약 시스템 
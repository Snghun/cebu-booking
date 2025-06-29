# 비밀번호 찾기 기능 설정 가이드

## 개요
Cebu Stays 예약 시스템에 비밀번호 찾기 기능이 추가되었습니다. 사용자가 비밀번호를 잊어버렸을 때 이메일로 임시 비밀번호를 발송하고, 새로운 비밀번호로 재설정할 수 있습니다.

## 기능 설명

### 1. 비밀번호 찾기 프로세스
1. 사용자가 로그인 페이지에서 "비밀번호를 잊으셨나요?" 클릭
2. 이메일 주소 입력
3. 임시 비밀번호가 이메일로 발송됨 (1시간 후 만료)
4. 임시 비밀번호로 로그인
5. 대시보드에서 새 비밀번호로 변경

### 2. 보안 기능
- 임시 비밀번호는 1시간 후 자동 만료
- 임시 비밀번호로 로그인 시 사용자에게 알림 표시
- 새 비밀번호 변경 시 임시 비밀번호 플래그 자동 제거

## 환경 변수 설정

### Gmail SMTP 설정
이메일 발송을 위해 Gmail SMTP를 사용합니다. 다음 환경 변수를 설정해야 합니다:

```bash
# Netlify 환경 변수 설정
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://your-domain.netlify.app
```

### Gmail 앱 비밀번호 생성 방법

1. **Google 계정 설정**
   - [Google 계정](https://myaccount.google.com/) 접속
   - 보안 → 2단계 인증 활성화

2. **앱 비밀번호 생성**
   - 보안 → 앱 비밀번호
   - "앱 선택" → "기타(맞춤 이름)"
   - 앱 이름 입력 (예: "Cebu Stays")
   - 생성된 16자리 비밀번호 복사

3. **환경 변수 설정**
   - `EMAIL_USER`: Gmail 주소
   - `EMAIL_PASS`: 생성된 앱 비밀번호

### Netlify 환경 변수 설정

1. **Netlify 대시보드**
   - 사이트 설정 → 환경 변수
   - 새 환경 변수 추가

2. **필요한 환경 변수**
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=https://your-domain.netlify.app
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   ```

## API 엔드포인트

### 1. 비밀번호 찾기 요청
```
POST /api/users/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 2. 비밀번호 재설정
```
POST /api/users/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "tempPassword": "temporary-password",
  "newPassword": "new-password"
}
```

## 프론트엔드 페이지

### 1. 비밀번호 찾기 페이지
- 경로: `/forgot-password`
- 기능: 이메일 입력 및 임시 비밀번호 발송

### 2. 비밀번호 재설정 페이지
- 경로: `/reset-password`
- 기능: 임시 비밀번호와 새 비밀번호 입력

## 이메일 템플릿

발송되는 이메일에는 다음 정보가 포함됩니다:
- 사용자 이름
- 임시 비밀번호 (12자리 랜덤 문자열)
- 만료 시간 (1시간)
- 보안 주의사항
- 로그인 링크

## 테스트 방법

1. **회원가입**
   - 새 계정으로 회원가입

2. **비밀번호 찾기 테스트**
   - 로그인 페이지에서 "비밀번호를 잊으셨나요?" 클릭
   - 이메일 주소 입력
   - 이메일 확인

3. **임시 비밀번호 로그인**
   - 이메일의 임시 비밀번호로 로그인
   - 대시보드에서 알림 확인

4. **비밀번호 변경**
   - "비밀번호 변경하기" 버튼 클릭
   - 새 비밀번호 설정

## 주의사항

1. **Gmail 설정**
   - 2단계 인증이 활성화되어 있어야 함
   - 앱 비밀번호 사용 필수

2. **환경 변수**
   - 모든 환경 변수가 올바르게 설정되어야 함
   - Netlify 배포 후 환경 변수 재설정 필요

3. **보안**
   - 임시 비밀번호는 1시간 후 자동 만료
   - 사용자는 반드시 새 비밀번호로 변경해야 함

## 문제 해결

### 이메일 발송 실패
1. Gmail 2단계 인증 확인
2. 앱 비밀번호 재생성
3. 환경 변수 재설정

### 임시 비밀번호 만료
- 1시간 후 자동 만료되므로 다시 요청 필요

### 로그인 실패
- 임시 비밀번호 정확히 입력 확인
- 대소문자 구분 확인 
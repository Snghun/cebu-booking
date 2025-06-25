const { handler } = require('./api');

// 테스트 이벤트 객체
const testEvent = {
  httpMethod: 'POST',
  path: '/.netlify/functions/api/users/login',
  body: JSON.stringify({
    email: 'admin@cebuparadise.com',
    password: 'admin123'
  }),
  headers: {
    'Content-Type': 'application/json'
  }
};

// 테스트 실행
async function testLogin() {
  try {
    console.log('=== 로그인 테스트 시작 ===');
    const result = await handler(testEvent, {});
    console.log('응답 상태 코드:', result.statusCode);
    console.log('응답 본문:', result.body);
    console.log('=== 로그인 테스트 완료 ===');
  } catch (error) {
    console.error('테스트 실패:', error);
  }
}

testLogin(); 
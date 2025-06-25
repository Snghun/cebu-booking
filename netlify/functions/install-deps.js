const { execSync } = require('child_process');
const path = require('path');

console.log('Netlify Functions 의존성 설치 중...');

try {
  // netlify/functions 디렉토리로 이동
  const functionsDir = path.join(__dirname);
  process.chdir(functionsDir);
  
  // npm install 실행
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('✅ Netlify Functions 의존성 설치 완료!');
} catch (error) {
  console.error('❌ 의존성 설치 실패:', error.message);
  process.exit(1);
} 
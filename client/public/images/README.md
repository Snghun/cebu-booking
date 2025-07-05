# 이미지 폴더 구조

이 폴더는 프로젝트에서 사용하는 모든 이미지 파일들을 저장합니다.

## 폴더 구조

```
images/
├── rooms/          # 룸 이미지들
│   ├── room1.jpg
│   ├── room2.jpg
│   └── room3.jpg
├── gallery/        # 갤러리 이미지들
│   ├── gallery1.jpg
│   ├── gallery2.jpg
│   └── gallery3.jpg
└── gall_1.jpg     # 기존 갤러리 이미지
```

## 사용법

### React 컴포넌트에서 이미지 사용하기

```javascript
// 룸 이미지 사용
const roomImageUrl = process.env.PUBLIC_URL + '/images/rooms/room1.jpg';

// 갤러리 이미지 사용
const galleryImageUrl = process.env.PUBLIC_URL + '/images/gallery/gallery1.jpg';
```

### 이미지 파일 추가하기

1. 적절한 폴더에 이미지 파일을 추가
2. 파일명은 영문 소문자와 숫자, 언더스코어만 사용
3. 지원 형식: jpg, jpeg, png, gif, webp

### 권장 사항

- 이미지 크기는 웹 최적화를 위해 적절히 조정
- 파일명은 의미있게 작성 (예: room1-interior.jpg)
- 용량이 큰 이미지는 압축 후 업로드 
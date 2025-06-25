const mongoose = require('mongoose');

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB 연결 성공');
  } catch (err) {
    console.error('MongoDB 연결 실패:', err.message);
    process.exit(1);
  }
};

// Gallery 모델
const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['resort', 'room', 'facility', 'view'],
    default: 'resort'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Gallery = mongoose.model('Gallery', gallerySchema);

// 초기 갤러리 데이터
const initialGallery = [
  {
    title: '리조트 전경',
    imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: '아름다운 리조트 전경',
    category: 'resort',
    order: 1
  },
  {
    title: '인피니티 풀',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: '바다와 하나되는 인피니티 풀',
    category: 'facility',
    order: 2
  },
  {
    title: '해변 전망',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: '아름다운 해변 전망',
    category: 'view',
    order: 3
  },
  {
    title: '객실 내부',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: '럭셔리한 객실 내부',
    category: 'room',
    order: 4
  },
  {
    title: '스파 시설',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: '편안한 스파 시설',
    category: 'facility',
    order: 5
  },
  {
    title: '레스토랑',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: '고급 레스토랑',
    category: 'facility',
    order: 6
  },
  {
    title: '객실 발코니',
    imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: '아름다운 발코니 전망',
    category: 'room',
    order: 7
  },
  {
    title: '정원',
    imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: '아름다운 정원',
    category: 'view',
    order: 8
  }
];

// 데이터베이스 초기화 함수
const initializeGallery = async () => {
  try {
    await connectDB();
    
    // 기존 갤러리 데이터 삭제
    await Gallery.deleteMany({});
    console.log('기존 갤러리 데이터 삭제 완료');
    
    // 새로운 갤러리 데이터 삽입
    const gallery = await Gallery.insertMany(initialGallery);
    console.log(`${gallery.length}개의 갤러리 데이터가 성공적으로 추가되었습니다.`);
    
    // 추가된 갤러리 목록 출력
    gallery.forEach(item => {
      console.log(`- ${item.title}: ${item.category}`);
    });
    
    mongoose.connection.close();
    console.log('데이터베이스 연결 종료');
  } catch (error) {
    console.error('갤러리 데이터 초기화 실패:', error);
    process.exit(1);
  }
};

// 스크립트 실행
if (require.main === module) {
  initializeGallery();
}

module.exports = { initializeGallery }; 
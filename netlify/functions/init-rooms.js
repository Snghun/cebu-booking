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

// Room 모델
const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  detailedDescription: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  size: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  roomType: {
    type: String,
    enum: ['standard', 'deluxe', 'suite', 'villa'],
    default: 'standard'
  },
  view: {
    type: String,
    enum: ['garden', 'ocean', 'mountain', 'city'],
    default: 'garden'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Room = mongoose.model('Room', roomSchema);

// 초기 객실 데이터
const initialRooms = [
  {
    name: 'Ocean View Deluxe Suite',
    description: '바다가 내려다보이는 럭셔리 스위트룸',
    detailedDescription: '세부 최고의 바다 전망을 자랑하는 델럭스 스위트입니다. 넓은 발코니에서 일출과 일몰을 감상할 수 있으며, 프리미엄 시설과 최고급 서비스를 제공합니다. 침실과 거실이 분리되어 있어 편안한 휴식을 취할 수 있습니다.',
    price: 245000,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    size: '55㎡',
    capacity: 3,
    amenities: ['무료 Wi-Fi', '미니바', '발코니', '바다 전망', '스파 욕조', '룸서비스', '에어컨', 'TV'],
    features: ['180도 바다 전망', '프라이빗 발코니', '킹사이즈 베드', '분리형 샤워실', '고급 아메니티'],
    roomType: 'suite',
    view: 'ocean',
    isAvailable: true
  },
  {
    name: 'Premium Villa with Pool',
    description: '프라이빗 풀이 있는 럭셔리 빌라',
    detailedDescription: '완전한 프라이버시를 보장하는 프리미엄 빌라입니다. 전용 수영장과 넓은 테라스를 갖추고 있어 가족이나 커플에게 최적의 선택입니다. 최고급 시설과 24시간 컨시어지 서비스를 제공합니다.',
    price: 380000,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    size: '85㎡',
    capacity: 4,
    amenities: ['프라이빗 풀', '바다 전망', '키친', '테라스', '미니바', '무료 Wi-Fi', '에어컨', 'TV'],
    features: ['전용 수영장', '넓은 테라스', '풀뷰', '독립형 빌라', '고급 주방 시설'],
    roomType: 'villa',
    view: 'ocean',
    isAvailable: true
  },
  {
    name: 'Beachfront Paradise Suite',
    description: '해변 바로 앞 프리미엄 스위트',
    detailedDescription: '해변에서 불과 몇 걸음 거리에 위치한 파라다이스 스위트입니다. 아름다운 해변과 터키석 빛 바다를 바로 앞에서 감상할 수 있으며, 최고의 위치에서 완벽한 휴식을 제공합니다.',
    price: 195000,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    size: '45㎡',
    capacity: 2,
    amenities: ['해변 접근', '스파 욕조', '미니바', '룸서비스', '무료 Wi-Fi', '에어컨', 'TV'],
    features: ['해변 프론트', '스파 욕조', '발코니', '킹사이즈 베드', '해변 전망'],
    roomType: 'suite',
    view: 'ocean',
    isAvailable: true
  },
  {
    name: 'Garden View Standard Room',
    description: '아름다운 정원이 내려다보이는 스탠다드 룸',
    detailedDescription: '평화로운 정원 전망을 자랑하는 스탠다드 룸입니다. 트로피컬 정원의 아름다운 풍경을 감상할 수 있으며, 편안하고 깔끔한 분위기에서 휴식을 취할 수 있습니다.',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    size: '35㎡',
    capacity: 2,
    amenities: ['무료 Wi-Fi', '미니바', '정원 전망', '에어컨', 'TV', '샤워실'],
    features: ['정원 전망', '편안한 분위기', '퀸사이즈 베드', '깔끔한 인테리어'],
    roomType: 'standard',
    view: 'garden',
    isAvailable: true
  },
  {
    name: 'Family Suite',
    description: '가족 여행에 최적화된 넓은 스위트',
    detailedDescription: '가족 여행에 최적화된 넓고 편안한 패밀리 스위트입니다. 2개의 침실과 넓은 거실을 갖추고 있어 가족 모두가 편안하게 지낼 수 있습니다. 아이들을 위한 특별한 시설도 마련되어 있습니다.',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    size: '75㎡',
    capacity: 6,
    amenities: ['2개 침실', '거실', '미니바', '발코니', '무료 Wi-Fi', '에어컨', 'TV', '주방'],
    features: ['2개 침실', '넓은 거실', '가족 친화적', '주방 시설', '발코니'],
    roomType: 'suite',
    view: 'garden',
    isAvailable: true
  }
];

// 데이터베이스 초기화 함수
const initializeRooms = async () => {
  try {
    await connectDB();
    
    // 기존 객실 데이터 삭제
    await Room.deleteMany({});
    console.log('기존 객실 데이터 삭제 완료');
    
    // 새로운 객실 데이터 삽입
    const rooms = await Room.insertMany(initialRooms);
    console.log(`${rooms.length}개의 객실 데이터가 성공적으로 추가되었습니다.`);
    
    // 추가된 객실 목록 출력
    rooms.forEach(room => {
      console.log(`- ${room.name}: ₩${room.price.toLocaleString()}`);
    });
    
    mongoose.connection.close();
    console.log('데이터베이스 연결 종료');
  } catch (error) {
    console.error('객실 데이터 초기화 실패:', error);
    process.exit(1);
  }
};

// 스크립트 실행
if (require.main === module) {
  initializeRooms();
}

module.exports = { initializeRooms }; 
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// CORS 설정
const corsHandler = cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

// MongoDB 연결
const connectDB = async () => {
  try {
    // 이미 연결되어 있는지 확인
    if (mongoose.connection.readyState === 1) {
      return;
    }
    
    const mongoUri = process.env.MONGODB_URI;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
  } catch (err) {
    console.error('MongoDB 연결 실패:', err);
    throw err;
  }
};

// 서버리스 환경에서는 연결을 한 번만 수행
let isConnected = false;
const ensureConnection = async () => {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      await connectDB();
      isConnected = true;
    }
  } catch (error) {
    console.error('MongoDB 연결 보장 실패:', error);
    throw error;
  }
};

// 모델이 이미 존재하는지 확인하고 조건부로 생성
const getOrCreateModel = (modelName, schema) => {
  try {
    return mongoose.model(modelName);
  } catch (error) {
    return mongoose.model(modelName, schema);
  }
};

// User 모델
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = getOrCreateModel('User', userSchema);

// Booking 모델
const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  // 예약 정보
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  // 예약자 정보
  guestName: {
    type: String,
    required: true,
    trim: true
  },
  guestEmail: {
    type: String,
    required: true,
    trim: true
  },
  guestPhone: {
    type: String,
    trim: true
  },
  specialRequests: {
    type: String,
    trim: true
  },
  // 예약 상태
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Booking = getOrCreateModel('Booking', bookingSchema);

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

const Room = getOrCreateModel('Room', roomSchema);

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

const Gallery = getOrCreateModel('Gallery', gallerySchema);

// Netlify Function 핸들러
exports.handler = async (event, context) => {
  // 기본 CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight OK' })
    };
  }

  try {
    const { httpMethod, path, body, headers: requestHeaders } = event;
    const pathSegments = path.replace('/.netlify/functions/api', '').split('/').filter(Boolean);
    
    // API 라우팅
    if (pathSegments[0] === 'users') {
      return await handleUsers(httpMethod, pathSegments, body, headers, event);
    } else if (pathSegments[0] === 'bookings') {
      return await handleBookings(httpMethod, pathSegments, body, headers, event);
    } else if (pathSegments[0] === 'rooms') {
      return await handleRooms(httpMethod, pathSegments, body, headers);
    } else if (pathSegments[0] === 'gallery') {
      return await handleGallery(httpMethod, pathSegments, body, headers);
    } else if (pathSegments[0] === 'admin') {
      return await handleAdmin(httpMethod, pathSegments, body, headers, event);
    } else if (path === '/.netlify/functions/api') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Cebu Resort Booking API가 실행 중입니다.' }),
      };
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'API 엔드포인트를 찾을 수 없습니다.' }),
      };
    }
  } catch (error) {
    console.error('API 오류 발생:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: '서버 내부 오류가 발생했습니다.',
        error: error.message 
      }),
    };
  }
};

// 관리자 권한 확인 함수
const verifyAdmin = async (token) => {
  try {
    if (!token) {
      throw new Error('토큰이 없습니다.');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    
    if (!user.isAdmin) {
      throw new Error('관리자 권한이 필요합니다.');
    }
    
    return user;
  } catch (error) {
    throw new Error('관리자 인증 실패: ' + error.message);
  }
};

// 사용자 관련 핸들러
async function handleUsers(httpMethod, pathSegments, body, headers, event) {
  // 안전한 JSON 파싱
  let parsedBody = {};
  try {
    if (body && typeof body === 'string' && body.trim() !== '') {
      parsedBody = JSON.parse(body);
    }
  } catch (parseError) {
    console.error('JSON 파싱 오류:', parseError);
    console.error('요청 본문:', body);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: '잘못된 요청 형식입니다.' })
    };
  }
  
  // MongoDB 연결 보장
  try {
    await ensureConnection();
  } catch (connectionError) {
    console.error('MongoDB 연결 실패:', connectionError);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: '데이터베이스 연결에 실패했습니다.' })
    };
  }
  
  if (httpMethod === 'GET' && pathSegments.length === 1) {
    // GET /api/users
    const users = await User.find().select('-password');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(users),
    };
  } else if (httpMethod === 'POST' && pathSegments[1] === 'register') {
    // POST /api/users/register
    const { username, email, password } = parsedBody;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: '이미 존재하는 사용자입니다.' }),
      };
    }
    
    const user = new User({ username, email, password });
    await user.save();
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ message: '회원가입이 완료되었습니다.' }),
    };
  } else if (httpMethod === 'POST' && pathSegments[1] === 'login') {
    // POST /api/users/login
    const { email, password } = parsedBody;
    
    // 데이터 타입 검증
    if (typeof email !== 'string' || typeof password !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: '이메일과 비밀번호는 문자열이어야 합니다.' }),
      };
    }
    
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: '이메일과 비밀번호를 입력해주세요.' }),
      };
    }
    
    const user = await User.findOne({ email: email.toString() });
    if (!user) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: '사용자를 찾을 수 없습니다.' }),
      };
    }
    
    const isMatch = await user.comparePassword(password.toString());
    if (!isMatch) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: '비밀번호가 일치하지 않습니다.' }),
      };
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '1h'
    });
    
    const responseData = { 
      message: '로그인 성공', 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        isAdmin: user.isAdmin 
      },
      token
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData),
    };
  } else if (httpMethod === 'PUT' && pathSegments[1] === 'profile') {
    // PUT /api/users/profile - 사용자 정보 수정
    const token = event.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: '로그인이 필요합니다.' })
      };
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const { username, email } = parsedBody;
      
      // 현재 사용자 조회
      const user = await User.findById(decoded.userId);
      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '사용자를 찾을 수 없습니다.' })
        };
      }
      
      // 이메일 중복 확인 (자신의 이메일 제외)
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: '이미 사용 중인 이메일입니다.' })
          };
        }
      }
      
      // 사용자명 중복 확인 (자신의 사용자명 제외)
      if (username && username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: '이미 사용 중인 사용자명입니다.' })
          };
        }
      }
      
      // 정보 업데이트
      if (username) user.username = username;
      if (email) user.email = email;
      
      await user.save();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: '사용자 정보가 수정되었습니다.',
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
          }
        })
      };
    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: '유효하지 않은 토큰입니다.' })
      };
    }
  } else if (httpMethod === 'PUT' && pathSegments[1] === 'password') {
    // PUT /api/users/password - 비밀번호 변경
    const token = event.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: '로그인이 필요합니다.' })
      };
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const { currentPassword, newPassword } = parsedBody;
      
      if (!currentPassword || !newPassword) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: '현재 비밀번호와 새 비밀번호를 입력해주세요.' })
        };
      }
      
      // 현재 사용자 조회
      const user = await User.findById(decoded.userId);
      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '사용자를 찾을 수 없습니다.' })
        };
      }
      
      // 현재 비밀번호 확인
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: '현재 비밀번호가 일치하지 않습니다.' })
        };
      }
      
      // 새 비밀번호 설정
      user.password = newPassword;
      await user.save();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: '비밀번호가 변경되었습니다.' })
      };
    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: '유효하지 않은 토큰입니다.' })
      };
    }
  }
  
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ message: '사용자 API 엔드포인트를 찾을 수 없습니다.' }),
  };
}

// 예약 관련 핸들러
async function handleBookings(httpMethod, pathSegments, body, headers, event) {
  // 안전한 JSON 파싱
  let parsedBody = {};
  try {
    if (body && typeof body === 'string' && body.trim() !== '') {
      parsedBody = JSON.parse(body);
    }
  } catch (parseError) {
    console.error('JSON 파싱 오류:', parseError);
    console.error('요청 본문:', body);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: '잘못된 요청 형식입니다.' })
    };
  }
  
  if (httpMethod === 'GET' && pathSegments.length === 1) {
    // GET /api/bookings - 사용자의 예약 목록 조회
    const token = event.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: '로그인이 필요합니다.' })
      };
    }
    
    try {
      // MongoDB 연결 보장
      await ensureConnection();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const bookings = await Booking.find({ user: decoded.userId })
        .populate('room', 'name price image')
        .sort({ createdAt: -1 });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(bookings)
      };
    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: '유효하지 않은 토큰입니다.' })
      };
    }
  } else if (httpMethod === 'GET' && pathSegments.length === 2) {
    // GET /api/bookings/:id - 개별 예약 조회
    const bookingId = pathSegments[1];
    const token = event.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: '로그인이 필요합니다.' })
      };
    }
    
    try {
      await ensureConnection();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // 예약 조회 및 소유권 확인
      const booking = await Booking.findOne({ _id: bookingId, user: decoded.userId })
        .populate('room', 'name price image description size capacity amenities');
      
      if (!booking) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '예약을 찾을 수 없습니다.' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(booking)
      };
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: error.message })
      };
    }
  } else if (httpMethod === 'POST' && pathSegments.length === 1) {
    // POST /api/bookings - 예약 생성
    const token = event.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: '로그인이 필요합니다.' })
      };
    }
    
    try {
      // MongoDB 연결 보장
      await ensureConnection();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      const {
        roomId,
        checkIn,
        checkOut,
        guests,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests
      } = parsedBody;
      
      // 필수 필드 검증
      if (!roomId || !checkIn || !checkOut || !guests || !guestName || !guestEmail) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: '필수 정보가 누락되었습니다.' })
        };
      }
      
      // 객실 정보 조회
      const room = await Room.findById(roomId);
      if (!room) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '객실을 찾을 수 없습니다.' })
        };
      }
      
      // 체크인/체크아웃 날짜 검증
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkInDate < today) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: '체크인 날짜는 오늘 이후여야 합니다.' })
        };
      }
      
      if (checkOutDate <= checkInDate) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: '체크아웃 날짜는 체크인 날짜 이후여야 합니다.' })
        };
      }
      
      // 숙박 일수 계산
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const totalPrice = room.price * nights;
      
      const booking = new Booking({
        user: decoded.userId,
        room: roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        totalPrice
      });
      
      try {
        const savedBooking = await booking.save();
        
        let populatedBooking;
        try {
          populatedBooking = await booking.populate('room', 'name price image');
        } catch (populateError) {
          console.error('Populate 실패:', populateError);
          populatedBooking = booking; // Populate 실패해도 예약은 성공
        }
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            message: '예약이 성공적으로 생성되었습니다.',
            booking: populatedBooking
          })
        };
      } catch (saveError) {
        console.error('예약 저장 실패:', saveError);
        throw saveError;
      }
    } catch (error) {
      console.error('예약 생성 오류:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: error.message })
      };
    }
  } else if (httpMethod === 'PUT' && pathSegments.length === 2) {
    // PUT /api/bookings/:id - 예약 수정
    const bookingId = pathSegments[1];
    const token = event.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: '로그인이 필요합니다.' })
      };
    }
    
    try {
      await ensureConnection();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // 예약 조회 및 소유권 확인
      const booking = await Booking.findOne({ _id: bookingId, user: decoded.userId });
      if (!booking) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '예약을 찾을 수 없습니다.' })
        };
      }
      
      const {
        checkIn,
        checkOut,
        guests,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests
      } = parsedBody;
      
      // 필수 필드 검증
      if (!checkIn || !checkOut || !guests || !guestName || !guestEmail) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: '필수 정보가 누락되었습니다.' })
        };
      }
      
      // 날짜 검증
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkInDate < today) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: '체크인 날짜는 오늘 이후여야 합니다.' })
        };
      }
      
      if (checkOutDate <= checkInDate) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: '체크아웃 날짜는 체크인 날짜 이후여야 합니다.' })
        };
      }
      
      // 객실 정보 조회하여 가격 재계산
      const room = await Room.findById(booking.room);
      if (!room) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '객실 정보를 찾을 수 없습니다.' })
        };
      }
      
      // 숙박 일수 계산 및 가격 재계산
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const totalPrice = room.price * nights;
      
      // 예약 정보 업데이트
      booking.checkIn = checkInDate;
      booking.checkOut = checkOutDate;
      booking.guests = guests;
      booking.guestName = guestName;
      booking.guestEmail = guestEmail;
      booking.guestPhone = guestPhone || '';
      booking.specialRequests = specialRequests || '';
      booking.totalPrice = totalPrice;
      booking.updatedAt = Date.now();
      
      const updatedBooking = await booking.save();
      const populatedBooking = await updatedBooking.populate('room', 'name price image');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(populatedBooking)
      };
    } catch (error) {
      console.error('예약 수정 오류:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: error.message })
      };
    }
  } else if (httpMethod === 'DELETE' && pathSegments.length === 2) {
    // DELETE /api/bookings/:id - 예약 삭제
    const bookingId = pathSegments[1];
    const token = event.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: '로그인이 필요합니다.' })
      };
    }
    
    try {
      await ensureConnection();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // 예약 조회 및 소유권 확인
      const booking = await Booking.findOne({ _id: bookingId, user: decoded.userId });
      if (!booking) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '예약을 찾을 수 없습니다.' })
        };
      }
      
      // 예약 삭제
      await Booking.findByIdAndDelete(bookingId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: '예약이 성공적으로 취소되었습니다.' })
      };
    } catch (error) {
      console.error('예약 삭제 오류:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: error.message })
      };
    }
  }
  
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ message: '예약 API 엔드포인트를 찾을 수 없습니다.' }),
  };
}

// 객실 목록 조회
async function handleRooms(httpMethod, pathSegments, body, headers) {
  if (httpMethod === 'GET' && pathSegments.length === 1) {
    // GET /api/rooms - 객실 목록 조회
    await ensureConnection();
    
    try {
      const rooms = await Room.find({ isAvailable: true }).sort({ createdAt: -1 });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(rooms)
      };
    } catch (error) {
      console.error('객실 데이터 조회 오류:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: error.message })
      };
    }
  } else if (httpMethod === 'GET' && pathSegments.length === 2) {
    // GET /api/rooms/:id - 개별 객실 조회
    const roomId = pathSegments[1];
    try {
      await ensureConnection();
      const room = await Room.findById(roomId);
      if (!room) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '객실을 찾을 수 없습니다.' })
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(room)
      };
    } catch (error) {
      console.error('개별 객실 조회 오류:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: error.message })
      };
    } 
  } else if (httpMethod === 'GET' && pathSegments.length === 3 && pathSegments[2] === 'bookings') {
    // GET /api/rooms/:id/bookings - 특정 객실의 예약 정보 조회
    const roomId = pathSegments[1];
    try {
      await ensureConnection();
      const bookings = await Booking.find({ 
        room: roomId, 
        status: { $in: ['confirmed', 'pending'] } 
      }).select('checkIn checkOut status');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(bookings)
      };
    } catch (error) {
      console.error('객실 예약 정보 조회 오류:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: error.message })
      };
    }
  }
  
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ message: '객실 API 엔드포인트를 찾을 수 없습니다.' }),
  };
}

// Gallery 관련 핸들러
async function handleGallery(httpMethod, pathSegments, body, headers) {
  if (httpMethod === 'GET') {
    await ensureConnection();
    
    try {
      const gallery = await Gallery.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(gallery)
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: error.message })
      };
    }
  }
  
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ message: '갤러리 API 엔드포인트를 찾을 수 없습니다.' }),
  };
}

// 관리자 관련 핸들러
async function handleAdmin(httpMethod, pathSegments, body, headers, event) {
  const parsedBody = body ? JSON.parse(body) : {};
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  
  // MongoDB 연결 보장
  try {
    await ensureConnection();
  } catch (connectionError) {
    console.error('MongoDB 연결 실패:', connectionError);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: '데이터베이스 연결에 실패했습니다.' })
    };
  }
  
  try {
    // 관리자 권한 확인
    const adminUser = await verifyAdmin(token);
    
    if (httpMethod === 'GET' && pathSegments[1] === 'dashboard') {
      // GET /api/admin/dashboard - 대시보드 통계
      const totalBookings = await Booking.countDocuments();
      const totalUsers = await User.countDocuments({ isAdmin: false });
      const totalRooms = await Room.countDocuments();
      
      const recentBookings = await Booking.find()
        .populate('room', 'name')
        .populate('user', 'username email')
        .sort({ createdAt: -1 })
        .limit(5);
      
      const monthlyRevenue = await Booking.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' }
          }
        }
      ]);
      
      const responseData = {
        totalBookings,
        totalUsers,
        totalRooms,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        recentBookings
      };
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(responseData)
      };
    } else if (httpMethod === 'GET' && pathSegments[1] === 'bookings') {
      // GET /api/admin/bookings - 예약 목록
      const bookings = await Booking.find()
        .populate('room', 'name')
        .populate('user', 'username email')
        .sort({ createdAt: -1 });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(bookings)
      };
    } else if (httpMethod === 'GET' && pathSegments[1] === 'bookings' && pathSegments[2]) {
      // GET /api/admin/bookings/:id - 예약 상세
      const booking = await Booking.findById(pathSegments[2])
        .populate('room', 'name description image')
        .populate('user', 'username email');
      
      if (!booking) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '예약을 찾을 수 없습니다.' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(booking)
      };
    } else if (httpMethod === 'PUT' && pathSegments[1] === 'bookings' && pathSegments[2]) {
      // PUT /api/admin/bookings/:id - 예약 수정
      const booking = await Booking.findByIdAndUpdate(
        pathSegments[2],
        parsedBody,
        { new: true }
      ).populate('room', 'name').populate('user', 'username email');
      
      if (!booking) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '예약을 찾을 수 없습니다.' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(booking)
      };
    } else if (httpMethod === 'DELETE' && pathSegments[1] === 'bookings' && pathSegments[2]) {
      // DELETE /api/admin/bookings/:id - 예약 삭제
      const booking = await Booking.findByIdAndDelete(pathSegments[2]);
      
      if (!booking) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '예약을 찾을 수 없습니다.' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: '예약이 삭제되었습니다.' })
      };
    } else if (httpMethod === 'GET' && pathSegments[0] === 'admin'&& pathSegments[1] === 'users' && !pathSegments[2]) {
      // GET /api/admin/users - 고객 목록
      const users = await User.find({ isAdmin: false })
        .select('-password')
        .sort({ createdAt: -1 });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(users)
      };
    } else if (httpMethod === 'GET' && pathSegments[0] === 'admin' && pathSegments[1] === 'users' && pathSegments[2]) {
      const user = await User.findById(pathSegments[2]).select('-password');
      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '사용자를 찾을 수 없습니다.' })
        };
      }
      // 해당 사용자의 예약 내역도 함께 조회
      const userBookings = await Booking.find({ user: pathSegments[2] })
        .populate('room', 'name')
        .sort({ createdAt: -1 });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ user, bookings: userBookings })
      };
    } else if (httpMethod === 'POST' && pathSegments[1] === 'rooms') {
      // POST /api/admin/rooms - 객실 추가
      const room = new Room(parsedBody);
      await room.save();
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(room)
      };
    } else if (httpMethod === 'PUT' && pathSegments[1] === 'rooms' && pathSegments[2]) {
      // PUT /api/admin/rooms/:id - 객실 수정
      const room = await Room.findByIdAndUpdate(
        pathSegments[2],
        parsedBody,
        { new: true }
      );
      
      if (!room) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '객실을 찾을 수 없습니다.' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(room)
      };
    } else if (httpMethod === 'DELETE' && pathSegments[1] === 'rooms' && pathSegments[2]) {
      // DELETE /api/admin/rooms/:id - 객실 삭제
      const room = await Room.findByIdAndDelete(pathSegments[2]);
      
      if (!room) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '객실을 찾을 수 없습니다.' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: '객실이 삭제되었습니다.' })
      };
    } else if (httpMethod === 'GET' && pathSegments[1] === 'rooms' && !pathSegments[2]) {
      // GET /api/admin/rooms - 관리자 객실 전체 조회
      const rooms = await Room.find({}).sort({ createdAt: -1 });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(rooms)
      };
    }
    
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: '관리자 API 엔드포인트를 찾을 수 없습니다.' })
    };
    
  } catch (error) {
    console.error('관리자 API 오류:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
} 
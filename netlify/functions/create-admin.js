const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// User 모델
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
    required: true
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

// 비밀번호 해싱 미들웨어
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

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// 관리자 계정 생성 함수
const createAdmin = async () => {
  try {
    await connectDB();
    
    const adminData = {
      username: 'admin',
      email: 'admin@cebuparadise.com',
      password: 'admin123',
      isAdmin: true
    };
    
    // 기존 관리자 계정 확인
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('관리자 계정이 이미 존재합니다.');
      console.log('이메일:', existingAdmin.email);
      console.log('관리자 권한:', existingAdmin.isAdmin);
      mongoose.connection.close();
      return;
    }
    
    // 새로운 관리자 계정 생성
    const admin = new User(adminData);
    await admin.save();
    
    console.log('관리자 계정이 성공적으로 생성되었습니다.');
    console.log('이메일:', admin.email);
    console.log('비밀번호: admin123');
    console.log('관리자 권한:', admin.isAdmin);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('관리자 계정 생성 실패:', error);
    process.exit(1);
  }
};

// 스크립트 실행
if (require.main === module) {
  createAdmin();
}

module.exports = { createAdmin }; 
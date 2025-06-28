import axios from 'axios';

// Netlify Functions API 기본 URL
const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8888/.netlify/functions/api"
    : "/.netlify/functions/api";

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (토큰 추가)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // JWT 토큰 만료 또는 인증 오류
      const errorMessage = error.response?.data?.message || '';
      
      // 관리자 API가 아닌 경우에만 자동 로그아웃
      if (!error.config.url.includes('/admin')) {
        // JWT 관련 오류인지 확인
        if (errorMessage.includes('jwt expired') || errorMessage.includes('jwt') || errorMessage.includes('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// 사용자 관련 API
export const userAPI = {
  // 회원가입
  register: (userData) => api.post('/users/register', userData),
  
  // 로그인
  login: (credentials) => api.post('/users/login', credentials),
  
  // 사용자 목록 조회
  getUsers: () => api.get('/users'),
  
  // 사용자 정보 수정
  updateProfile: (userData) => api.put('/users/profile', userData),
  
  // 비밀번호 변경
  changePassword: (passwordData) => api.put('/users/password', passwordData),
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/users/login', { 
      email: email.trim(), 
      password: password.trim() 
    });
    
    return response.data;
  } catch (error) {
    console.error('로그인 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const response = await api.post('/users/register', { username, email, password });
    return response.data;
  } catch (error) {
    console.error('회원가입 오류:', error.response?.data || error.message);
    throw error;
  }
};

// 사용자 정보 수정
export const updateUserProfile = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.put('/users/profile', userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('사용자 정보 수정 오류:', error.response?.data || error.message);
    throw error;
  }
};

// 비밀번호 변경
export const changeUserPassword = async (currentPassword, newPassword) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.put('/users/password', {
      currentPassword,
      newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('비밀번호 변경 오류:', error.response?.data || error.message);
    throw error;
  }
};

// 예약 관련 API
export const createBooking = async (bookingData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/bookings', bookingData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('예약 생성 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserBookings = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('사용자 예약 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const getBooking = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get(`/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('예약 상세 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const updateBooking = async (id, bookingData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.put(`/bookings/${id}`, bookingData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('예약 수정 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteBooking = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('예약 삭제 오류:', error.response?.data || error.message);
    throw error;
  }
};

// 관리자 API
export const getAdminDashboard = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('관리자 대시보드 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const getAdminBookings = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/admin/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('관리자 예약 목록 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const getAdminBooking = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get(`/admin/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('관리자 예약 상세 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const updateAdminBooking = async (id, bookingData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.put(`/admin/bookings/${id}`, bookingData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('관리자 예약 수정 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteAdminBooking = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/admin/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('관리자 예약 삭제 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const getAdminUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('관리자 사용자 목록 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const createAdminRoom = async (roomData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/admin/rooms', roomData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('관리자 객실 생성 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const updateAdminRoom = async (id, roomData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.put(`/admin/rooms/${id}`, roomData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('관리자 객실 수정 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteAdminRoom = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/admin/rooms/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('관리자 객실 삭제 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const getAdminRooms = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/admin/rooms', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('관리자 객실 전체 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

// 객실 관련 API
export const getRooms = async () => {
  try {
    const response = await api.get('/rooms');
    return response.data;
  } catch (error) {
    console.error('객실 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

// 개별 객실 조회
export const getRoom = async (id) => {
  try {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    console.error('개별 객실 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

// 갤러리 관련 API
export const getGallery = async () => {
  try {
    const response = await api.get('/gallery');
    return response.data;
  } catch (error) {
    console.error('갤러리 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

export const getRoomBookings = async (roomId) => {
  try {
    const response = await api.get(`/rooms/${roomId}/bookings`);
    return response.data;
  } catch (error) {
    console.error('룸 예약 정보 조회 오류:', error.response?.data || error.message);
    // 에러가 발생하면 빈 배열 반환
    return [];
  }
};

export default api; 
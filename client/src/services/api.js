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

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 응답 오류:', error.response?.status, error.response?.data);
    console.error('오류 메시지:', error.message);
    console.error('요청 URL:', error.config?.url);
    
    // 관리자 API가 아닌 경우에만 자동 로그아웃 처리
    if (error.response?.status === 401 && !error.config?.url?.includes('/admin/')) {
      console.log('관리자 API가 아닌 401 오류로 인한 자동 로그아웃');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
};

export const loginUser = async (email, password) => {
  try {
    // 데이터 검증
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('이메일과 비밀번호는 문자열이어야 합니다.');
    }
    
    if (!email.trim() || !password.trim()) {
      throw new Error('이메일과 비밀번호를 입력해주세요.');
    }
    
    console.log('로그인 요청 데이터:', { email: email.trim(), password: '***' });
    
    const response = await api.post('/users/login', { 
      email: email.trim(), 
      password: password.trim() 
    });
    
    console.log('로그인 응답:', response.data);
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

export default api; 
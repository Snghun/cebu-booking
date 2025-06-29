import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Star, 
  Waves,
  MapPin,
  Phone,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { getRoom, getRoomBookings, createBooking } from '../services/api';
import { useSwipeable } from 'react-swipeable';
import { DayPicker } from 'react-day-picker';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

// 달력 스타일 오버라이드
const calendarStyles = `
  .rdp {
    --rdp-cell-size: 32px;
    --rdp-accent-color: #1e40af;
    --rdp-background-color: #dbeafe;
    --rdp-accent-color-dark: #1e3a8a;
    --rdp-background-color-dark: #1e3a8a;
    --rdp-outline: 2px solid var(--rdp-accent-color);
    --rdp-outline-selected: 2px solid rgba(0, 0, 0, 0.75);
    margin: 0.5em;
    font-size: 14px;
  }
  
  @media (min-width: 768px) {
    .rdp {
      --rdp-cell-size: 40px;
      margin: 1em;
      font-size: 16px;
    }
  }
  
  .rdp-day_selected,
  .rdp-day_selected:focus-visible,
  .rdp-day_selected:hover {
    color: white;
    background-color: #3b82f6;
    border-radius: 6px;
    font-weight: 400;
  }
  
  .rdp-day_range_start,
  .rdp-day_range_end {
    color: white;
    background-color: #3b82f6;
    border-radius: 6px;
    font-weight: 400;
  }
  
  .rdp-day_range_middle {
    background-color: #dbeafe;
    border-radius: 0;
  }
  
  .rdp-day_booked {
    background-color: #fecaca;
    color: #dc2626;
    font-weight: 600;
    border-radius: 6px;
    position: relative;
  }
  
  .rdp-day_booked:hover {
    background-color: #fca5a5;
  }
  
  .rdp-day_booked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 3px;
    height: 3px;
    background-color: #dc2626;
    border-radius: 50%;
  }
  
  @media (min-width: 768px) {
    .rdp-day_booked::after {
      width: 4px;
      height: 4px;
    }
  }
  
  .rdp-day_today {
    font-weight: bold;
    color: #1e40af;
    border: 2px solid #1e40af;
    border-radius: 6px;
  }
  
  .rdp-day:not(.rdp-day_disabled):not(.rdp-day_selected):not(.rdp-day_booked):hover {
    background-color: #eff6ff;
    border-radius: 6px;
  }
  
  .rdp-day_disabled {
    color: #9ca3af;
    background-color: #f3f4f6;
    border-radius: 6px;
  }
  
  .rdp-head_cell {
    font-weight: 600;
    color: #374151;
    padding: 4px 0;
    font-size: 12px;
  }
  
  @media (min-width: 768px) {
    .rdp-head_cell {
      padding: 8px 0;
      font-size: 14px;
    }
  }
  
  .rdp-nav_button {
    background-color: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    color: #374151;
    padding: 6px;
    transition: all 0.2s;
    font-size: 12px;
  }
  
  @media (min-width: 768px) {
    .rdp-nav_button {
      padding: 8px;
      font-size: 14px;
    }
  }
  
  .rdp-nav_button:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }
  
  .rdp-caption {
    font-weight: 600;
    color: #111827;
    padding: 4px 0;
    font-size: 14px;
  }
  
  @media (min-width: 768px) {
    .rdp-caption {
      padding: 8px 0;
      font-size: 16px;
    }
  }
  
  /* 선택된 구간 음영 처리 */
  .rdp-day[data-selected="true"] {
    background-color: #3b82f6 !important;
    color: white !important;
    font-weight: 400 !important;
  }
  
  /* 체크인과 체크아웃 사이 날짜들 음영 처리 */
  .rdp-day[data-range="true"] {
    background-color: #dbeafe !important;
    color: #1e293b !important;
  }
  
  /* 체크인과 체크아웃 날짜 완전 통일 */
  .rdp-day_selected,
  .rdp-day_range_start,
  .rdp-day_range_end {
    background-color: #3b82f6 !important;
    color: white !important;
    font-weight: 400 !important;
    border-radius: 6px !important;
  }
  
  /* 선택된 날짜의 파란 동그라미 제거 */
  .rdp-day_selected::after,
  .rdp-day_range_start::after,
  .rdp-day_range_end::after {
    display: none !important;
  }
  
  /* 모든 선택된 날짜의 가상 요소 제거 */
  .rdp-day[aria-selected="true"]::after,
  .rdp-day[data-selected="true"]::after {
    display: none !important;
  }
  
  /* 더 구체적인 선택자로 파란 동그라미 제거 */
  .rdp-day.rdp-day_selected::after,
  .rdp-day.rdp-day_range_start::after,
  .rdp-day.rdp-day_range_end::after {
    display: none !important;
    content: none !important;
  }
  
  /* 모든 가상 요소 제거 */
  .rdp-day::after,
  .rdp-day::before {
    display: none !important;
    content: none !important;
  }
  
  /* 선택된 날짜의 모든 가상 요소 제거 */
  .rdp-day[aria-selected="true"]::after,
  .rdp-day[aria-selected="true"]::before,
  .rdp-day[data-selected="true"]::after,
  .rdp-day[data-selected="true"]::before {
    display: none !important;
    content: none !important;
  }
  
  /* rdp-day_button의 border-radius 제거 */
  .rdp-day_button {
    border-radius: 0 !important;
  }
  
  /* 선택된 날짜의 버튼 border-radius 제거 */
  .rdp-day_selected .rdp-day_button,
  .rdp-day_range_start .rdp-day_button,
  .rdp-day_range_end .rdp-day_button {
    border-radius: 0 !important;
  }
  
  /* 선택된 날짜의 border 제거 */
  .rdp-selected .rdp-day_button {
    border: none !important;
  }
  
  /* 모든 선택된 날짜의 border 제거 */
  .rdp-day_selected .rdp-day_button,
  .rdp-day_range_start .rdp-day_button,
  .rdp-day_range_end .rdp-day_button {
    border: none !important;
  }
  
  /* 모바일 달력 컨테이너 */
  .calendar-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  /* 모바일에서 달력 테이블 최소 너비 설정 */
  .rdp-table {
    min-width: 280px;
  }
  
  @media (min-width: 768px) {
    .rdp-table {
      min-width: auto;
    }
  }

  /* 모바일 최적화를 위한 추가 스타일 */
  @media (max-width: 767px) {
    .rdp {
      --rdp-cell-size: 28px;
      margin: 0.25em;
      font-size: 12px;
      width: 100%;
      max-width: 100%;
    }
    
    .rdp-table {
      width: 100%;
      min-width: 100%;
      max-width: 100%;
      table-layout: fixed;
    }
    
    .rdp-head_cell {
      padding: 2px 0;
      font-size: 11px;
      width: 14.28%;
    }
    
    .rdp-nav_button {
      padding: 4px;
      font-size: 11px;
    }
    
    .rdp-caption {
      padding: 2px 0;
      font-size: 13px;
    }
    
    .calendar-container {
      overflow-x: hidden;
      width: 100%;
      max-width: 100%;
    }
    
    /* 모바일에서 달력 전체 너비 조정 */
    .rdp {
      width: 100%;
      max-width: 100%;
    }
    
    /* 모바일에서 셀 크기 조정 */
    .rdp-day {
      width: 28px;
      height: 28px;
      font-size: 12px;
      max-width: 14.28%;
    }
    
    /* 모바일에서 예약 섹션 패딩 조정 */
    .booking-section {
      padding: 1rem;
    }
    
    /* 모바일에서 달력 셀 간격 조정 */
    .rdp-tbody {
      width: 100%;
    }
    
    .rdp-tbody td {
      width: 14.28%;
      padding: 1px;
    }
  }
`;

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2
  });
  const [roomBookings, setRoomBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function fetchRoom() {
      try {
        setLoading(true);
        setError('');
        const roomData = await getRoom(id);
        setRoom(roomData);
      } catch (error) {
        console.error('객실 조회 오류:', error);
        setError('객실 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchRoom();
    }
  }, [id]);

  // 룸의 예약 정보 가져오기
  useEffect(() => {
    async function fetchRoomBookings() {
      if (!room) return;
      
      try {
        setBookingsLoading(true);
        const bookings = await getRoomBookings(room._id);
        setRoomBookings(bookings);
      } catch (error) {
        console.error('룸 예약 정보 조회 오류:', error);
      } finally {
        setBookingsLoading(false);
      }
    }
    
    fetchRoomBookings();
  }, [room]);

  // 이미지 자동 슬라이드
  useEffect(() => {
    if (room && room.images && room.images.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [room]);

  useEffect(() => {
    if (room && room.images && room.images.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [room]);

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  const handleBooking = async () => {
    if (!selectedDate.checkIn || !selectedDate.checkOut) {
      alert('체크인/체크아웃 날짜를 선택해주세요.');
      return;
    }
    
    // 로그인 상태 확인
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!token || !user) {
      alert('예약을 위해 로그인이 필요합니다.\n로그인 페이지로 이동합니다.');
      navigate('/login');
      return;
    }
    
    // 로그인된 상태 - 사용자 정보로 예약 폼 초기화
    setBookingForm({
      guestName: user.username || '',
      guestEmail: user.email || '',
      guestPhone: '',
      specialRequests: ''
    });
    
    // 예약 정보 입력 모달 표시
    setShowBookingForm(true);
  };

  const calculateNights = () => {
    if (!selectedDate.checkIn || !selectedDate.checkOut) return 0;
    
    const start = new Date(selectedDate.checkIn);
    const end = new Date(selectedDate.checkOut);
    
    // 유효하지 않은 날짜인 경우 0 반환
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }
    
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    const nights = calculateNights();
    return room ? room.price * nights : 0;
  };

  // 예약된 날짜들을 Date 객체로 변환
  const getBookedDates = () => {
    const bookedDates = [];
    roomBookings.forEach(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      
      // 유효하지 않은 날짜는 건너뛰기
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        return;
      }
      
      // 체크인부터 체크아웃까지 모든 날짜를 추가 (체크아웃 날짜 포함)
      const currentDate = new Date(checkIn);
      while (currentDate <= checkOut) {
        bookedDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    return bookedDates;
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleImageChange((currentImageIndex + 1) % room.images.length),
    onSwipedRight: () => handleImageChange((currentImageIndex - 1 + room.images.length) % room.images.length),
    trackMouse: true,
  });

  // 예약 제출 처리
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!bookingForm.guestName.trim()) {
      alert('예약자 이름을 입력해주세요.');
      return;
    }
    
    if (!bookingForm.guestEmail.trim()) {
      alert('예약자 이메일을 입력해주세요.');
      return;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingForm.guestEmail)) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return;
    }
    
    if (!bookingForm.guestPhone.trim()) {
      alert('예약자 전화번호를 입력해주세요.');
      return;
    }
    
    // 날짜 중복 검사
    const checkInDate = new Date(selectedDate.checkIn);
    const checkOutDate = new Date(selectedDate.checkOut);
    
    // 유효하지 않은 날짜인 경우 오류 처리
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      alert('유효하지 않은 날짜입니다. 다시 선택해주세요.');
      return;
    }
    
    const isDateConflict = roomBookings.some(booking => {
      const existingCheckIn = new Date(booking.checkIn);
      const existingCheckOut = new Date(booking.checkOut);
      
      // 유효하지 않은 기존 예약 날짜는 건너뛰기
      if (isNaN(existingCheckIn.getTime()) || isNaN(existingCheckOut.getTime())) {
        return false;
      }
      
      return (
        (checkInDate >= existingCheckIn && checkInDate <= existingCheckOut) ||
        (checkOutDate >= existingCheckIn && checkOutDate <= existingCheckOut) ||
        (checkInDate <= existingCheckIn && checkOutDate >= existingCheckOut)
      );
    });
    
    if (isDateConflict) {
      alert('선택하신 날짜에 이미 예약이 있습니다.\n다른 날짜를 선택해주세요.');
      
      setSelectedDate({
        checkIn: '',
        checkOut: '',
        guests: 2
      });
      
      setShowBookingForm(false);
      return;
    }
    
    try {
      setBookingLoading(true);
      
      const bookingData = {
        roomId: room._id,
        checkIn: selectedDate.checkIn,
        checkOut: selectedDate.checkOut,
        guests: selectedDate.guests,
        guestName: bookingForm.guestName.trim(),
        guestEmail: bookingForm.guestEmail.trim(),
        guestPhone: bookingForm.guestPhone.trim(),
        specialRequests: bookingForm.specialRequests.trim()
      };
      
      await createBooking(bookingData);
      
      alert('예약이 성공적으로 완료되었습니다!\n예약 내역을 확인하시겠습니까?');
      
      setShowBookingForm(false);
      setBookingForm({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        specialRequests: ''
      });
      
      setSelectedDate({
        checkIn: '',
        checkOut: '',
        guests: 2
      });
      
      const updatedBookings = await getRoomBookings(room._id);
      setRoomBookings(updatedBookings);
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('예약 생성 실패:', error);
      const errorMessage = error.response?.data?.message || '예약 생성에 실패했습니다.';
      
      if (error.response?.status === 401 || errorMessage.includes('jwt expired') || errorMessage.includes('jwt')) {
        alert('로그인 세션이 만료되었습니다.\n다시 로그인해주세요.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setShowBookingForm(false);
        navigate('/login');
        return;
      }
      
      alert(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">객실 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
          <p className="text-red-600 mb-4">객실을 찾을 수 없습니다.</p>
          <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <style>{calendarStyles}</style>
      
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)} 
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2">
                <Waves className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                  Cebu Stays
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 객실 이미지 갤러리 */}
        <div className="mb-8">
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden" {...handlers}>
            {room.images && room.images.length > 0 ? (
              <>
                {room.images.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${room.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                
                {/* 이미지 인디케이터 */}
                {room.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {room.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageChange(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <p className="text-gray-500">이미지가 없습니다</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 객실 정보 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              {/* 객실 기본 정보 */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-keep">{room.name}</h1>
                  <p className="text-gray-600 text-base sm:text-lg mb-4 break-words line-clamp-2">{room.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <span className="whitespace-nowrap">{room.size}</span>
                    <div className="flex items-center whitespace-nowrap">
                      <Users className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>최대 {room.capacity}명</span>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right min-w-[120px]">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">₩{room.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">1박 기준</p>
                </div>
              </div>

              {/* 객실 상세 설명 */}
              {room.detailedDescription && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">객실 소개</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{room.detailedDescription}</p>
                  </div>
                </div>
              )}

              {/* 객실 특징 */}
              {room.features && room.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">객실 특징</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {room.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 편의시설 */}
              {room.amenities && room.amenities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">편의시설</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {room.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 text-gray-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 객실 규칙 */}
              {room.houseRules && room.houseRules.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">객실 규칙</h3>
                  <div className="space-y-3">
                    {room.houseRules.map((rule, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 체크인/체크아웃 정보 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">체크인/체크아웃</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 text-lg">체크인</h4>
                    <p className="text-blue-700 font-medium text-lg">오후 3:00</p>
                    <p className="text-blue-600 text-sm mt-2">체크인 시간 이후에 객실 이용 가능합니다.</p>
                  </div>
                  <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2 text-lg">체크아웃</h4>
                    <p className="text-red-700 font-medium text-lg">오전 11:00</p>
                    <p className="text-red-600 text-sm mt-2">체크아웃 시간까지 객실 이용 가능합니다.</p>
                  </div>
                </div>
              </div>

              {/* 위치 정보 */}
              {room.location && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">위치</h3>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-start space-x-4">
                      <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-800 font-semibold text-lg mb-2">{room.location.name}</p>
                        {room.location.address && (
                          <p className="text-gray-600 mb-2">{room.location.address}</p>
                        )}
                        {room.location.description && (
                          <p className="text-gray-600 text-sm leading-relaxed">{room.location.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 연락처 정보 */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">연락처</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-gray-800 font-semibold">전화번호</p>
                      <p className="text-gray-600">+82-10-1234-5678</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-gray-800 font-semibold">이메일</p>
                      <p className="text-gray-600">info@cebustays.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 예약 섹션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 booking-section">
              <h2 className="text-xl font-bold text-gray-900 mb-6">예약하기</h2>
              
              {/* 날짜 선택 */}
              <div className="mb-6">
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">예약 현황을 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="calendar-container bg-white rounded-lg p-1 md:p-4 shadow-sm border border-gray-200">
                    <DayPicker
                      mode="single"
                      selected={selectedDate.checkIn ? new Date(selectedDate.checkIn) : undefined}
                      onSelect={(day) => {
                        if (!day) return;
                        
                        const clickedDate = format(day, 'yyyy-MM-dd');
                        const clickedDateTime = day.getTime();
                        
                        // 예약된 날짜인지 확인
                        const bookedDates = getBookedDates();
                        const isBooked = bookedDates.some(bookedDate => 
                          format(bookedDate, 'yyyy-MM-dd') === clickedDate
                        );
                        
                        if (isBooked) {
                          return; // 예약된 날짜는 클릭 불가
                        }
                        
                        // 체크인과 체크아웃이 모두 선택된 상태라면 초기화
                        if (selectedDate.checkIn && selectedDate.checkOut) {
                          setSelectedDate({
                            checkIn: clickedDate,
                            checkOut: '',
                            guests: selectedDate.guests
                          });
                          return;
                        }
                        
                        // 체크인이 선택되지 않은 경우
                        if (!selectedDate.checkIn) {
                          setSelectedDate({
                            ...selectedDate,
                            checkIn: clickedDate
                          });
                        }
                        // 체크인은 선택되었지만 체크아웃이 선택되지 않은 경우
                        else if (!selectedDate.checkOut) {
                          const checkInDate = new Date(selectedDate.checkIn);
                          
                          // 클릭한 날짜가 체크인보다 이전이거나 같은 경우, 새로운 체크인으로 설정
                          if (clickedDateTime <= checkInDate.getTime()) {
                            setSelectedDate({
                              ...selectedDate,
                              checkIn: clickedDate,
                              checkOut: ''
                            });
                            return;
                          }
                          
                          // 체크아웃 날짜가 예약된 기간과 겹치는지 확인
                          const isCheckOutDateConflict = roomBookings.some(booking => {
                            const existingCheckIn = new Date(booking.checkIn);
                            const existingCheckOut = new Date(booking.checkOut);
                            
                            // 유효하지 않은 기존 예약 날짜는 건너뛰기
                            if (isNaN(existingCheckIn.getTime()) || isNaN(existingCheckOut.getTime())) {
                              return false;
                            }
                            
                            return day >= existingCheckIn && day <= existingCheckOut;
                          });
                          
                          if (isCheckOutDateConflict) {
                            alert('선택하신 체크아웃 날짜는 이미 예약된 기간입니다.');
                            return;
                          }
                          
                          setSelectedDate({
                            ...selectedDate,
                            checkOut: clickedDate
                          });
                        }
                      }}
                      disabled={(date) => {
                        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                          return true;
                        }
                        
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        // 오늘 이전 날짜 비활성화
                        if (date < today) {
                          return true;
                        }
                        
                        // 예약된 날짜 비활성화
                        const bookedDates = getBookedDates();
                        return bookedDates.some(bookedDate => 
                          format(bookedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                        );
                      }}
                      locale={ko}
                      fromDate={new Date()}
                      toDate={addDays(new Date(), 365)}
                      showOutsideDays={false}
                      className="w-full"
                      modifiers={{
                        booked: getBookedDates(),
                        today: new Date(),
                        selected: selectedDate.checkIn ? new Date(selectedDate.checkIn) : undefined,
                        rangeStart: selectedDate.checkIn ? new Date(selectedDate.checkIn) : undefined,
                        rangeEnd: selectedDate.checkOut ? new Date(selectedDate.checkOut) : undefined,
                        rangeMiddle: (() => {
                          if (!selectedDate.checkIn || !selectedDate.checkOut) return [];
                          
                          const checkIn = new Date(selectedDate.checkIn);
                          const checkOut = new Date(selectedDate.checkOut);
                          
                          if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return [];
                          
                          const middleDates = [];
                          const current = new Date(checkIn);
                          current.setDate(current.getDate() + 1); // 체크인 다음날부터
                          
                          while (current < checkOut) {
                            middleDates.push(new Date(current));
                            current.setDate(current.getDate() + 1);
                          }
                          
                          return middleDates;
                        })()
                      }}
                      modifiersStyles={{
                        booked: { backgroundColor: '#fecaca', color: '#dc2626' },
                        today: { border: '2px solid #1e40af', color: '#1e40af' },
                        selected: { backgroundColor: '#3b82f6', color: 'white' },
                        rangeStart: { backgroundColor: '#3b82f6', color: 'white' },
                        rangeEnd: { backgroundColor: '#3b82f6', color: 'white' },
                        rangeMiddle: { backgroundColor: '#dbeafe', color: '#1e293b' }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 투숙객 수 선택 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">투숙객 수</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedDate(prev => ({ ...prev, guests: Math.max(1, prev.guests - 1) }))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium text-gray-900 min-w-[2rem] text-center">{selectedDate.guests}</span>
                  <button
                    onClick={() => setSelectedDate(prev => ({ ...prev, guests: Math.min(room.capacity, prev.guests + 1) }))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">최대 {room.capacity}명까지 가능</p>
              </div>

              {/* 예약 요약 */}
              {selectedDate.checkIn && selectedDate.checkOut && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">예약 요약</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">체크인</span>
                      <span className="font-medium">{selectedDate.checkIn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">체크아웃</span>
                      <span className="font-medium">{selectedDate.checkOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">투숙객</span>
                      <span className="font-medium">{selectedDate.guests}명</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">박수</span>
                      <span className="font-medium">{calculateNights()}박</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 금액</span>
                        <span className="font-bold text-lg text-blue-600">₩{calculateTotalPrice().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 예약 버튼 */}
              <button
                onClick={handleBooking}
                disabled={!selectedDate.checkIn || !selectedDate.checkOut}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                예약하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 예약 폼 모달 */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">예약 정보 입력</h2>
              
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    예약자 이름 *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.guestName}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, guestName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={bookingForm.guestEmail}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, guestEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호 *
                  </label>
                  <input
                    type="tel"
                    value={bookingForm.guestPhone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, guestPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="010-1234-5678"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    특별 요청사항
                  </label>
                  <textarea
                    value={bookingForm.specialRequests}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="특별한 요청사항이 있으시면 입력해주세요."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? '예약 중...' : '예약 완료'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetail; 
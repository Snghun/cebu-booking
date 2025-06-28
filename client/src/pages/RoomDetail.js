import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Star, 
  Waves,
  MapPin,
  Waves as WavesIcon,
  Phone,
  Mail,
  Clock,
  Car,
  Home
} from 'lucide-react';
import { getRoom, getRoomBookings, createBooking } from '../services/api';
import { useSwipeable } from 'react-swipeable';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// 달력 스타일 오버라이드
const calendarStyles = `
  .react-calendar {
    width: 100%;
    border: none;
    font-family: inherit;
  }
  
  .react-calendar__tile {
    padding: 8px;
    background: none;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    transition: all 0.2s;
  }
  
  .react-calendar__tile:enabled:hover {
    background-color: #e3f2fd;
  }
  
  .react-calendar__tile--active {
    background: #1976d2 !important;
    color: white;
  }
  
  .react-calendar__tile--now {
    background: #fff3e0;
    color: #f57c00;
  }
  
  .react-calendar__navigation button {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
  }
  
  .react-calendar__navigation button:enabled:hover {
    background-color: #f5f5f5;
  }
  
  .react-calendar__month-view__weekdays {
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    color: #666;
  }
  
  .react-calendar__month-view__weekdays__weekday {
    padding: 8px;
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
        // 예약 정보 조회 실패는 치명적이지 않으므로 에러 상태로 설정하지 않음
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
      // 로그인되지 않은 상태
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
      
      // 체크인부터 체크아웃 전날까지 모든 날짜를 추가
      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        bookedDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    return bookedDates;
  };

  // 달력에서 날짜 타일 렌더링 함수
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const bookedDates = getBookedDates();
    const isBooked = bookedDates.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
    );
    
    if (isBooked) {
      return 'bg-gray-300 text-gray-600 font-medium';
    }
    
    // 선택된 기간 음영처리
    if (selectedDate.checkIn && selectedDate.checkOut) {
      const checkInDate = new Date(selectedDate.checkIn);
      const checkOutDate = new Date(selectedDate.checkOut);
      const currentDate = new Date(date);
      
      if (currentDate >= checkInDate && currentDate <= checkOutDate) {
        return 'bg-blue-200 text-blue-800 font-medium';
      }
    }
    
    // 예약 가능한 날짜는 회색 배경으로 표시
    return 'bg-gray-100 text-gray-700';
  };

  // 달력에서 날짜 클릭 비활성화
  const tileDisabled = ({ date, view }) => {
    if (view !== 'month') return false;
    
    const bookedDates = getBookedDates();
    return bookedDates.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
    );
  };

  // 달력에서 날짜 클릭 처리
  const handleDateClick = (date) => {
    const clickedDate = date.getFullYear() + '-' + 
                       String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(date.getDate()).padStart(2, '0');
    
    // 예약된 날짜인지 확인
    const bookedDates = getBookedDates();
    const isBooked = bookedDates.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
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
      const checkOutDate = new Date(clickedDate);
      
      // 체크아웃이 체크인보다 이전인 경우, 새로운 날짜를 체크인으로 설정
      if (checkOutDate <= checkInDate) {
        setSelectedDate({
          ...selectedDate,
          checkIn: clickedDate,
          checkOut: ''
        });
        return;
      }
      
      setSelectedDate({
        ...selectedDate,
        checkOut: clickedDate
      });
    }
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
    
    const isDateConflict = roomBookings.some(booking => {
      const existingCheckIn = new Date(booking.checkIn);
      const existingCheckOut = new Date(booking.checkOut);
      
      // 새로운 예약의 체크인/체크아웃이 기존 예약 기간과 겹치는지 확인
      return (
        (checkInDate >= existingCheckIn && checkInDate < existingCheckOut) || // 새로운 체크인이 기존 예약 기간 내
        (checkOutDate > existingCheckIn && checkOutDate <= existingCheckOut) || // 새로운 체크아웃이 기존 예약 기간 내
        (checkInDate <= existingCheckIn && checkOutDate >= existingCheckOut) // 새로운 예약이 기존 예약을 완전히 포함
      );
    });
    
    if (isDateConflict) {
      alert('선택하신 날짜에 이미 예약이 있습니다.\n다른 날짜를 선택해주세요.');
      
      // 날짜 초기화
      setSelectedDate({
        checkIn: '',
        checkOut: '',
        guests: 2
      });
      
      // 모달 닫기
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
      
      // 폼 초기화 및 모달 닫기
      setShowBookingForm(false);
      setBookingForm({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        specialRequests: ''
      });
      
      // 날짜 초기화
      setSelectedDate({
        checkIn: '',
        checkOut: '',
        guests: 2
      });
      
      // 예약 목록 새로고침
      const updatedBookings = await getRoomBookings(room._id);
      setRoomBookings(updatedBookings);
      
      // 예약자 대시보드로 이동
      navigate('/dashboard');
      
    } catch (error) {
      console.error('예약 생성 실패:', error);
      const errorMessage = error.response?.data?.message || '예약 생성에 실패했습니다.';
      
      // JWT 토큰 만료 또는 인증 오류인 경우
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
              <Link to="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                <Home className="w-6 h-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <Waves className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                  Cebu Paradise Resort
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
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-keep">{room.name}</h1>
                  <p className="text-gray-600 text-base sm:text-lg mb-4 break-words line-clamp-2">{room.description}</p>
                  <div className="flex flex-nowrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 overflow-x-auto min-w-0">
                    <span className="whitespace-nowrap min-w-0 overflow-hidden text-ellipsis">{room.size}</span>
                    <span className="hidden sm:inline">|</span>
                    <div className="flex items-center whitespace-nowrap min-w-0 overflow-hidden text-ellipsis">
                      <Users className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>최대 {room.capacity}명</span>
                    </div>
                    <span className="hidden sm:inline">|</span>
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
                  <h3 className="text-xl font-bold text-gray-900 mb-4">객실 소개</h3>
                  <p className="text-gray-700 leading-relaxed">{room.detailedDescription}</p>
                </div>
              )}

              {/* 편의시설 */}
              {room.amenities && room.amenities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">편의시설</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {room.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 객실 특징 */}
              {room.features && room.features.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">객실 특징</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {room.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 예약 사이드바 */}
          <div className="lg:col-span-1">
            {/* 예약 현황 달력 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">예약 현황</h3>
              {bookingsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="calendar-container">
                  <Calendar
                    tileClassName={tileClassName}
                    tileDisabled={tileDisabled}
                    className="w-full border-0"
                    formatDay={(locale, date) => date.getDate()}
                    showNeighboringMonth={false}
                    minDate={new Date()}
                    onClickDay={handleDateClick}
                    locale="ko-KR"
                  />
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <span>예약된 날짜</span>
                    </div>


                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">예약하기</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체크인</label>
                  <input
                    type="date"
                    value={selectedDate.checkIn}
                    onChange={(e) => setSelectedDate({...selectedDate, checkIn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체크아웃</label>
                  <input
                    type="date"
                    value={selectedDate.checkOut}
                    onChange={(e) => setSelectedDate({...selectedDate, checkOut: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">투숙객</label>
                  <select
                    value={selectedDate.guests}
                    onChange={(e) => setSelectedDate({...selectedDate, guests: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num}명</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 가격 계산 */}
              {selectedDate.checkIn && selectedDate.checkOut && (
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">1박 기준</span>
                      <span className="font-medium">₩{room.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">숙박 일수</span>
                      <span className="font-medium">{calculateNights()}박</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">총 가격</span>
                        <span className="text-lg font-bold text-blue-600">₩{calculateTotalPrice().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
              >
                예약하기
              </button>

              {/* 연락처 정보 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">문의하기</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>+63 32 888 1234</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>info@cebuparadise.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>24시간 문의 가능</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 리조트 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">리조트 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">위치</h4>
              <p className="text-gray-600 text-sm">Mactan Island, Cebu, Philippines</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <WavesIcon className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">해변 접근</h4>
              <p className="text-gray-600 text-sm">프라이빗 해변 5분 거리</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Car className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">교통</h4>
              <p className="text-gray-600 text-sm">공항에서 30분 거리</p>
            </div>
          </div>
        </div>
      </div>

      {/* 예약 폼 모달 */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">예약 정보 입력</h3>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* 예약 요약 정보 */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">예약 요약</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>객실:</span>
                      <span className="font-medium">{room.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>체크인:</span>
                      <span className="font-medium">{selectedDate.checkIn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>체크아웃:</span>
                      <span className="font-medium">{selectedDate.checkOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>투숙객:</span>
                      <span className="font-medium">{selectedDate.guests}명</span>
                    </div>
                    <div className="flex justify-between">
                      <span>총 가격:</span>
                      <span className="font-medium text-blue-600">₩{calculateTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 예약자 정보 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    예약자 이름 *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.guestName}
                    onChange={(e) => setBookingForm({...bookingForm, guestName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예약자 이름을 입력하세요"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">로그인된 사용자 정보가 자동으로 입력되었습니다.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={bookingForm.guestEmail}
                    onChange={(e) => setBookingForm({...bookingForm, guestEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@email.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">로그인된 사용자 정보가 자동으로 입력되었습니다.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호 *
                  </label>
                  <input
                    type="tel"
                    value={bookingForm.guestPhone}
                    onChange={(e) => setBookingForm({...bookingForm, guestPhone: e.target.value})}
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
                    onChange={(e) => setBookingForm({...bookingForm, specialRequests: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="특별 요청사항이 있으시면 입력해주세요"
                    rows="3"
                  />
                </div>

                {/* 버튼 */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>예약 중...</span>
                      </div>
                    ) : (
                      '예약 완료'
                    )}
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
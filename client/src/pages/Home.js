import React, { useState, useEffect } from 'react';
import { MapPin, Star, Users, Wifi, Car, Coffee, Waves, LogIn, UserPlus, Menu, X, LogOut, User, BarChart3 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRooms, getGallery, createBooking, getRoomBookings } from '../services/api';

const CebuResortBooking = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomsError, setRoomsError] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState(false);
  
  // 예약 관련 상태
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: ''
  });

  // 메인 히어로 이미지들
  const heroImages = [
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
  ];

  // 객실 데이터 가져오기
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setRoomsError(false);
        const roomsData = await getRooms();
        setRooms(roomsData);
      } catch (error) {
        console.error('객실 데이터 가져오기 실패:', error);
        setRoomsError(true);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // 갤러리 데이터 가져오기
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setGalleryLoading(true);
        setGalleryError(false);
        const galleryData = await getGallery();
        setGallery(galleryData);
      } catch (error) {
        console.error('갤러리 데이터 가져오기 실패:', error);
        setGalleryError(true);
        setGallery([]);
      } finally {
        setGalleryLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // 상세보기 페이지에서 전달된 예약 정보 처리
  useEffect(() => {
    if (location.state) {
      const { selectedRoom, checkIn: stateCheckIn, checkOut: stateCheckOut, guests: stateGuests } = location.state;
      
      if (selectedRoom) {
        setSelectedRoom(selectedRoom);
      }
      if (stateCheckIn) {
        setCheckIn(stateCheckIn);
      }
      if (stateCheckOut) {
        setCheckOut(stateCheckOut);
      }
      if (stateGuests) {
        setGuests(stateGuests);
      }
      
      // 상태를 사용한 후 클리어
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // 리조트 시설들
  const facilities = [
    { icon: <Waves className="w-8 h-8" />, name: '인피니티 풀', desc: '바다와 하나되는 풀' },
    { icon: <Coffee className="w-8 h-8" />, name: '뉴타운 인프라', desc: '깨끗하고 편리한 시설' },
    { icon: <Car className="w-8 h-8" />, name: '가까운 공항', desc: '세부 국제 공항 15분 거리' },
    { icon: <Wifi className="w-8 h-8" />, name: '와이파이', desc: '객실 내 무료 와이파이' }
  ];

  // 히어로 이미지 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // 부드러운 스크롤 함수
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    // 모바일 메뉴 닫기
    setIsMobileMenuOpen(false);
  };

  const handleBooking = () => {
    if (!checkIn || !checkOut || !selectedRoom) {
      alert('체크인/체크아웃 날짜와 객실을 선택해주세요.');
      return;
    }
    
    // 로그인 상태 체크
    if (!isAuthenticated) {
      alert('예약을 위해 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    
    // 예약자 정보 기본값 설정
    setGuestInfo({
      guestName: user?.username || '',
      guestEmail: user?.email || '',
      guestPhone: '',
      specialRequests: ''
    });
    
    setShowBookingModal(true);
  };

  // 예약 제출 처리
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!selectedRoom) {
      alert('객실을 선택해주세요.');
      return;
    }
    
    if (!checkIn) {
      alert('체크인 날짜를 선택해주세요.');
      return;
    }
    
    if (!checkOut) {
      alert('체크아웃 날짜를 선택해주세요.');
      return;
    }
    
    if (!guests || guests < 1) {
      alert('투숙객 수를 선택해주세요.');
      return;
    }
    
    if (!guestInfo.guestName || guestInfo.guestName.trim() === '') {
      alert('예약자 이름을 입력해주세요.');
      return;
    }
    
    if (!guestInfo.guestEmail || guestInfo.guestEmail.trim() === '') {
      alert('예약자 이메일을 입력해주세요.');
      return;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestInfo.guestEmail)) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return;
    }
    
    if (!guestInfo.guestPhone || guestInfo.guestPhone.trim() === '') {
      alert('예약자 전화번호를 입력해주세요.');
      return;
    }
    
    try {
      setBookingLoading(true);
      
      // 로그인 상태 및 토큰 확인
      if (!isAuthenticated) {
        alert('예약을 위해 로그인이 필요합니다.');
        navigate('/login');
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('로그인 토큰이 없습니다. 다시 로그인해주세요.');
        logout();
        navigate('/login');
        return;
      }
      
      // 날짜 중복 검사
      try {
        const roomBookings = await getRoomBookings(selectedRoom._id);
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        const isDateConflict = roomBookings.some(booking => {
          const existingCheckIn = new Date(booking.checkIn);
          const existingCheckOut = new Date(booking.checkOut);
          
          // 새로운 예약의 체크인/체크아웃이 기존 예약 기간과 겹치는지 확인
          // 체크아웃 날짜도 포함하여 검사 (체크아웃 당일에도 새로운 체크인이 불가능)
          return (
            (checkInDate >= existingCheckIn && checkInDate <= existingCheckOut) || // 새로운 체크인이 기존 예약 기간 내
            (checkOutDate >= existingCheckIn && checkOutDate <= existingCheckOut) || // 새로운 체크아웃이 기존 예약 기간 내
            (checkInDate <= existingCheckIn && checkOutDate >= existingCheckOut) // 새로운 예약이 기존 예약을 완전히 포함
          );
        });
        
        if (isDateConflict) {
          alert('선택하신 날짜에 이미 예약이 있습니다.\n다른 날짜를 선택해주세요.');
          
          // 날짜 초기화
          setCheckIn('');
          setCheckOut('');
          
          // 모달 닫기
          setShowBookingModal(false);
          return;
        }
      } catch (error) {
        console.error('예약 정보 조회 실패:', error);
        // 예약 정보 조회 실패 시에도 예약 진행 (서버에서 중복 검사 수행)
      }
      
      const bookingData = {
        roomId: selectedRoom._id,
        checkIn,
        checkOut,
        guests,
        guestName: guestInfo.guestName.trim(),
        guestEmail: guestInfo.guestEmail.trim(),
        guestPhone: guestInfo.guestPhone ? guestInfo.guestPhone.trim() : '',
        specialRequests: guestInfo.specialRequests ? guestInfo.specialRequests.trim() : ''
      };
      
      await createBooking(bookingData);
      
      alert('예약이 성공적으로 완료되었습니다!');
      
      // 모달 닫기 및 폼 초기화
      setShowBookingModal(false);
      setSelectedRoom(null);
      setCheckIn('');
      setCheckOut('');
      setGuests(2);
      setGuestInfo({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        specialRequests: ''
      });
      
    } catch (error) {
      console.error('예약 생성 실패:', error);
      const errorMessage = error.response?.data?.message || '예약 생성에 실패했습니다.';
      alert(errorMessage);
      
      // 토큰 관련 오류인 경우 로그인 페이지로 리다이렉트
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // 예약 모달 닫기
  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
  };

  // 로그아웃 처리 함수
  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
      alert('로그아웃이 완료되었습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-cyan-50 to-white">
      {/* Header */}
      <header className="relative z-50 bg-white/90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Waves className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Cebu Stays
              </h1>
            </div>
            <nav className="flex items-center space-x-4 md:space-x-6">
              <div className="hidden md:flex items-center space-x-6">
                <button 
                  onClick={() => scrollToSection('rooms')} 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer"
                >
                  객실
                </button>
                <button 
                  onClick={() => scrollToSection('facilities')} 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer"
                >
                  시설
                </button>
                <button 
                  onClick={() => scrollToSection('contact')} 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer"
                >
                  문의
                </button>
              </div>
              <div className="flex items-center space-x-3 md:space-x-4 md:ml-4">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <div className="hidden md:flex items-center space-x-2 text-gray-700">
                      <User className="w-4 h-4" />
                      <Link 
                        to="/dashboard" 
                        className="text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer"
                        title="대시보드로 이동"
                      >
                        {user?.username}
                      </Link>
                    </div>
                    {/* 모바일에서 대시보드 이동 아이콘 */}
                    <Link
                      to="/dashboard"
                      className="md:hidden text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                      title="대시보드로 이동"
                    >
                      <User className="w-5 h-5" />
                    </Link>
                    {user?.isAdmin && (
                      <Link
                        to="/admin"
                        className="text-gray-700 hover:text-purple-600 transition-colors p-2 rounded-lg hover:bg-purple-50"
                        title="관리자 페이지"
                      >
                        <BarChart3 className="w-5 h-5" />
                      </Link>
                    )}
                    {/* 데스크톱에서만 로그아웃 아이콘 표시 */}
                    <button
                      onClick={handleLogout}
                      className="hidden md:block text-gray-700 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="로그아웃"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50" title="로그인">
                      <LogIn className="w-5 h-5" />
                    </Link>
                    <Link to="/register" className="text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50" title="회원가입">
                      <UserPlus className="w-5 h-5" />
                    </Link>
                  </>
                )}
                {/* 모바일 메뉴 버튼 */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </nav>
          </div>
          
          {/* 모바일 메뉴 */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3 pt-4">
                <button 
                  onClick={() => scrollToSection('rooms')} 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer text-left py-2"
                >
                  객실
                </button>
                <button 
                  onClick={() => scrollToSection('facilities')} 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer text-left py-2"
                >
                  시설
                </button>
                <button 
                  onClick={() => scrollToSection('contact')} 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer text-left py-2"
                >
                  문의
                </button>
                
                {/* 모바일에서 로그인 상태 표시 */}
                {isAuthenticated ? (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-gray-700 mb-3">
                      <User className="w-4 h-4" />
                      <Link 
                        to="/dashboard" 
                        className="text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {user?.username}
                      </Link>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-red-600 transition-colors font-medium cursor-pointer text-left py-2 w-full"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200">
                    <Link 
                      to="/login" 
                      className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer text-left py-2 block"
                    >
                      로그인
                    </Link>
                    <Link 
                      to="/register" 
                      className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer text-left py-2 block"
                    >
                      회원가입
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={image} 
              alt={`Cebu ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-sky-300/40 via-cyan-200/30 to-blue-200/25" />
          </div>
        ))}
        
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                Paradise
                <span className="block bg-gradient-to-r from-yellow-200 via-emerald-200 to-cyan-100 bg-clip-text text-transparent drop-shadow-2xl">
                  Awaits
                </span>
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed drop-shadow-lg">
                필리핀 세부 막탄 뉴타운에서 누리는 특별한 휴식.  
                에메랄드빛 바다와 하얀 모래사장, 그리고 편안한 숙소에서 당신만의 완벽한 하루를 시작하세요.
              </p>
              <div className="flex items-center space-x-4 text-white/80 drop-shadow-lg">
                <MapPin className="w-5 h-5" />
                <span>Mactan Island, Cebu, Philippines</span>
              </div>
            </div>
          </div>
        </div>

        {/* 스크롤 인디케이터 */}
        <button 
          onClick={() => scrollToSection('booking-section')}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
          </div>
        </button>
      </section>

      {/* 예약 섹션 */}
      <section id="booking-section" className="py-16 bg-white shadow-2xl -mt-20 relative z-20 mx-6 rounded-3xl">
        <div className="max-w-6xl mx-auto px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">객실 예약</h3>
          
          {/* 예약 폼 */}
          <div className="bg-gradient-to-r from-emerald-50 via-cyan-50 to-teal-50 rounded-2xl p-4 sm:p-8 mb-12">
            {/* 선택된 객실 정보 표시 */}
            {!selectedRoom && (
              <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border-l-4 border-gray-300 text-gray-600 text-center">
                아래 객실을 선택 해 주세요.
              </div>
            )}
            {selectedRoom && (
              <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border-l-4 border-blue-500">
                {/* 모바일: 세로 배치, 데스크톱: 가로 배치 */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <img 
                      src={selectedRoom.image} 
                      alt={selectedRoom.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h4 className="font-bold text-gray-800 break-keep text-base sm:text-lg">{selectedRoom.name}</h4>
                      {/* 모바일에서는 설명 숨김 */}
                      <p className="hidden sm:block text-sm text-gray-600 break-words line-clamp-2">{selectedRoom.description}</p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                        <span className="hidden sm:inline">{selectedRoom.size}</span>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{selectedRoom.capacity}명</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center lg:text-right min-w-[100px]">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">₩{selectedRoom.price.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">1박 기준</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 모바일: 세로 배치, 데스크톱: 가로 배치 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">체크인</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">체크아웃</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">투숙객</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num}명</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleBooking}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-4 sm:px-6 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base font-medium"
                >
                  예약하기
                </button>
              </div>
            </div>
          </div>

          {/* 객실 목록 */}
          <div id="rooms" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // 로딩 상태
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                    <div className="h-64 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4"></div>
                      <div className="flex space-x-2">
                        <div className="h-6 bg-gray-300 rounded w-20"></div>
                        <div className="h-6 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : roomsError ? (
              <div className="text-center text-red-500">
                객실 데이터를 가져오는 중 문제가 발생했습니다. 다시 시도해주세요.
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room._id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${
                    selectedRoom?._id === room._id ? 'ring-4 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={room.image} 
                      alt={room.name}
                      className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-blue-600 font-bold">₩{room.price.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{room.name}</h4>
                    <p className="text-gray-600 mb-4">{room.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{room.size}</span>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{room.capacity}명</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
                          +{room.amenities.length - 3}개 더
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-blue-600">
                        ₩{room.price.toLocaleString()}
                      </div>
                      <Link
                        to={`/room/${room._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        상세보기
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 시설 소개 */}
      <section id="facilities" className="py-20 bg-gradient-to-b from-emerald-50 via-cyan-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">프리미엄 시설</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              뉴타운 최고의 럭셔리 시설들로 완벽한 휴가를 만들어드립니다
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {facilities.map((facility, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                  {facility.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">{facility.name}</h4>
                <p className="text-gray-600">{facility.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 갤러리 섹션 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-center text-gray-800 mb-16">갤러리</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryLoading ? (
              // 로딩 상태
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative group overflow-hidden rounded-xl">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </>
            ) : galleryError ? (
              <div className="text-center text-red-500">
                갤러리 데이터를 가져오는 중 문제가 발생했습니다. 다시 시도해주세요.
              </div>
            ) : (
              gallery.map((image, index) => (
                <div key={index} className="relative group overflow-hidden rounded-xl">
                  <img 
                    src={image.imageUrl} 
                    alt={image.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Waves className="w-8 h-8 text-blue-400" />
                <h4 className="text-2xl font-bold">Cebu Stays</h4>
              </div>
              <p className="text-gray-400 leading-relaxed">
                막탄 뉴타운 중심에서 누리는 리조트 감성.<br/>바다와 어우러진 감각적인 스테이를 만나보세요.
              </p>
            </div>
            
            <div>
              <h5 className="text-xl font-bold mb-6">연락처</h5>
              <div className="space-y-3 text-gray-400">
                <p>📍 Newtown 8blvd, Mactan Lapu-Lapu, Cebu</p>
                <p>📞 +63 956 570 7440</p>
                <p>✉️ bamibomi@naver.com</p>
                <p>💬 카카오톡: clarakim12345</p>
              </div>
            </div>
            
            <div>
              <h5 className="text-xl font-bold mb-6">체크인 정보</h5>
              <div className="space-y-3 text-gray-400">
                <p>체크인: 오후 1시</p>
                <p>체크아웃: 오전 11시</p>
                <p>24시간 체크인 서비스</p>
                <p>갤런 물 1통 서비스</p>
                <p>아떼,시터,튜터 소개 가능 (일정 맞을 경우)</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Cebu Stays. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* 예약 모달 */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">예약 정보 확인</h3>
                <button
                  onClick={handleCloseBookingModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* 선택된 객실 정보 */}
              {selectedRoom && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={selectedRoom.image} 
                      alt={selectedRoom.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-bold text-gray-800">{selectedRoom.name}</h4>
                      <p className="text-sm text-gray-600">{selectedRoom.description}</p>
                      <div className="text-lg font-bold text-blue-600 mt-1">
                        ₩{selectedRoom.price.toLocaleString()}/박
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 예약 정보 */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-3">예약 정보</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">체크인:</span>
                    <span className="ml-2 font-medium">{checkIn}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">체크아웃:</span>
                    <span className="ml-2 font-medium">{checkOut}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">투숙객:</span>
                    <span className="ml-2 font-medium">{guests}명</span>
                  </div>
                  <div>
                    <span className="text-gray-600">총 가격:</span>
                    <span className="ml-2 font-bold text-blue-600">
                      ₩{selectedRoom ? (selectedRoom.price * Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))).toLocaleString() : 0}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 예약자 정보 폼 */}
              <form onSubmit={handleBookingSubmit}>
                <h4 className="font-bold text-gray-800 mb-3">예약자 정보</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      예약자 이름 *
                    </label>
                    <input
                      type="text"
                      value={guestInfo.guestName}
                      onChange={(e) => setGuestInfo({...guestInfo, guestName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일 *
                    </label>
                    <input
                      type="email"
                      value={guestInfo.guestEmail}
                      onChange={(e) => setGuestInfo({...guestInfo, guestEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      전화번호 *
                    </label>
                    <input
                      type="tel"
                      value={guestInfo.guestPhone}
                      onChange={(e) => setGuestInfo({...guestInfo, guestPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      특별 요청사항
                    </label>
                    <textarea
                      value={guestInfo.specialRequests}
                      onChange={(e) => setGuestInfo({...guestInfo, specialRequests: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="특별한 요청사항이 있으시면 입력해주세요."
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseBookingModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default CebuResortBooking; 

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Star, 
  ArrowLeft,
  Waves,
  MapPin,
  Waves as WavesIcon,
  Phone,
  Mail,
  Clock,
  Car,
  Home
} from 'lucide-react';
import { getRoom } from '../services/api';

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

  const handleBooking = () => {
    if (!selectedDate.checkIn || !selectedDate.checkOut) {
      alert('체크인/체크아웃 날짜를 선택해주세요.');
      return;
    }
    
    // 홈페이지로 이동하면서 선택된 정보 전달
    navigate('/', { 
      state: { 
        selectedRoom: room,
        checkIn: selectedDate.checkIn,
        checkOut: selectedDate.checkOut,
        guests: selectedDate.guests
      }
    });
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
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
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
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden">
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
    </div>
  );
};

export default RoomDetail; 
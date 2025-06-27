import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  ArrowLeft,
  Waves,
  Edit,
  Trash2,
  Phone,
  Mail,
  AlertCircle,
  User,
  LogOut,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBooking, updateBooking, deleteBooking } from '../services/api';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // 수정 가능한 필드들
  const [editData, setEditData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: ''
  });

  useEffect(() => {
    async function fetchBooking() {
      try {
        setLoading(true);
        const foundBooking = await getBooking(id);
        
        if (!foundBooking) {
          setError('예약을 찾을 수 없습니다.');
          return;
        }
        
        setBooking(foundBooking);
        setEditData({
          checkIn: foundBooking.checkIn.split('T')[0],
          checkOut: foundBooking.checkOut.split('T')[0],
          guests: foundBooking.guests,
          guestName: foundBooking.guestName,
          guestEmail: foundBooking.guestEmail,
          guestPhone: foundBooking.guestPhone || '',
          specialRequests: foundBooking.specialRequests || ''
        });
      } catch (error) {
        console.error('예약 조회 오류:', error);
        setError('예약 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchBooking();
  }, [isAuthenticated, navigate, id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // 원래 데이터로 복원
    setEditData({
      checkIn: booking.checkIn.split('T')[0],
      checkOut: booking.checkOut.split('T')[0],
      guests: booking.guests,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone || '',
      specialRequests: booking.specialRequests || ''
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // 날짜 유효성 검사
      const checkInDate = new Date(editData.checkIn);
      const checkOutDate = new Date(editData.checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkInDate < today) {
        alert('체크인 날짜는 오늘 이후여야 합니다.');
        return;
      }
      
      if (checkOutDate <= checkInDate) {
        alert('체크아웃 날짜는 체크인 날짜보다 늦어야 합니다.');
        return;
      }
      
      const updatedBooking = await updateBooking(id, {
        checkIn: editData.checkIn,
        checkOut: editData.checkOut,
        guests: editData.guests,
        guestName: editData.guestName,
        guestEmail: editData.guestEmail,
        guestPhone: editData.guestPhone,
        specialRequests: editData.specialRequests
      });
      
      setBooking(updatedBooking);
      setIsEditing(false);
      alert('예약이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('예약 수정 오류:', error);
      alert('예약 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 예약을 취소하시겠습니까?')) {
      return;
    }
    
    try {
      setDeleting(true);
      await deleteBooking(id);
      alert('예약이 성공적으로 취소되었습니다.');
      navigate('/dashboard');
    } catch (error) {
      console.error('예약 삭제 오류:', error);
      alert('예약 취소에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return '확정';
      case 'pending':
        return '대기중';
      case 'cancelled':
        return '취소됨';
      default:
        return '알 수 없음';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">예약을 찾을 수 없습니다.</p>
          <Link to="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* 헤더 */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>대시보드</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Waves className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                  Cebu Paradise Resort
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="text-gray-700 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                title="로그아웃"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">예약 상세 정보</h2>
          <p className="text-gray-600">예약 정보를 확인하고 수정하세요</p>
        </div>

        {/* 예약 상태 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                {booking.room?.image && (
                  <img 
                    src={booking.room.image} 
                    alt={booking.room.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {booking.room?.name || '객실 정보 없음'}
                  </h3>
                  {booking.room?.description && (
                    <p className="text-gray-600 text-sm mb-2">{booking.room.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {booking.room?.size && (
                      <span>{booking.room.size}</span>
                    )}
                    {booking.room?.capacity && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>최대 {booking.room.capacity}명</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {getStatusText(booking.status)}
              </span>
            </div>
            <div className="text-right ml-4">
              <p className="text-2xl font-bold text-blue-600">
                ₩{(booking.room?.price || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">1박 기준</p>
              <p className="text-lg font-semibold text-gray-800 mt-1">
                총 ₩{(booking.totalPrice || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                ({calculateNights(booking.checkIn, booking.checkOut)}박)
              </p>
            </div>
          </div>
          
          {/* 객실 편의시설 */}
          {booking.room?.amenities && booking.room.amenities.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">편의시설</h4>
              <div className="flex flex-wrap gap-2">
                {booking.room.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 예약 정보 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">예약 정보</h3>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>수정</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? '저장 중...' : '저장'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>취소</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 체크인/체크아웃 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  체크인
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.checkIn}
                    onChange={(e) => setEditData({...editData, checkIn: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{formatDate(booking.checkIn)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  체크아웃
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.checkOut}
                    onChange={(e) => setEditData({...editData, checkOut: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{formatDate(booking.checkOut)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  투숙객 수
                </label>
                {isEditing ? (
                  <select
                    value={editData.guests}
                    onChange={(e) => setEditData({...editData, guests: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num}명</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{booking.guests}명</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  숙박 일수
                </label>
                <p className="text-gray-900">
                  {calculateNights(booking.checkIn, booking.checkOut)}박
                </p>
              </div>
            </div>

            {/* 투숙객 정보 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  투숙객 이름
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.guestName}
                    onChange={(e) => setEditData({...editData, guestName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{booking.guestName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  이메일
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.guestEmail}
                    onChange={(e) => setEditData({...editData, guestEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{booking.guestEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  전화번호
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.guestPhone}
                    onChange={(e) => setEditData({...editData, guestPhone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{booking.guestPhone || '입력되지 않음'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 특별 요청사항 */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              특별 요청사항
            </label>
            {isEditing ? (
              <textarea
                value={editData.specialRequests}
                onChange={(e) => setEditData({...editData, specialRequests: e.target.value})}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="특별한 요청사항이 있으시면 입력해주세요..."
              />
            ) : (
              <p className="text-gray-900">{booking.specialRequests || '특별 요청사항 없음'}</p>
            )}
          </div>

          {/* 예약 취소 버튼 */}
          {booking.status === 'pending' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? '취소 중...' : '예약 취소'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetail; 
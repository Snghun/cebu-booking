import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Trash2, 
  Search,
  X
} from 'lucide-react';
import { getAdminBookings, deleteAdminBooking, updateAdminBooking } from '../../services/api';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminBookings();
      setBookings(data);
    } catch (error) {
      console.error('예약 목록 조회 오류:', error);
      setError('예약 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('정말로 이 예약을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteAdminBooking(id);
      setBookings(bookings.filter(booking => booking._id !== id));
      alert('예약이 삭제되었습니다.');
    } catch (error) {
      console.error('예약 삭제 오류:', error);
      alert('예약 삭제에 실패했습니다.');
    }
  };

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleChangeStatus = async (status) => {
    if (!selectedBooking) return;
    try {
      await updateAdminBooking(selectedBooking._id, { status });
      alert(`예약 상태가 '${status === 'confirmed' ? '완료' : '대기'}'로 변경되었습니다.`);
      setShowDetailModal(false);
      fetchBookings();
    } catch (error) {
      alert('예약 상태 변경에 실패했습니다.');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestInfo?.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchBookings}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">예약 관리</h2>
          <p className="text-gray-600 mt-1">모든 예약을 확인하고 관리하세요</p>
        </div>
        <div className="text-sm text-gray-500">
          총 {bookings.length}개의 예약
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="예약자명, 이메일, 객실명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="confirmed">확정</option>
              <option value="pending">대기</option>
              <option value="cancelled">취소</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 예약 목록 - 데스크톱 테이블 */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예약자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  객실
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  체크인
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  체크아웃
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  투숙객
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가격
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.user?.username || booking.guestInfo?.guestName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.user?.email || booking.guestInfo?.guestEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.room?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.guestCount || booking.guestInfo?.guestCount || '-'}명
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₩{booking.totalPrice?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status === 'confirmed' ? '확정' : booking.status === 'pending' ? '대기' : booking.status === 'cancelled' ? '취소' : booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetail(booking)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="상세보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(booking._id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterStatus !== 'all' ? '검색 결과가 없습니다.' : '예약이 없습니다.'}
          </div>
        )}
      </div>

      {/* 예약 목록 - 모바일 카드 */}
      <div className="lg:hidden space-y-4">
        {filteredBookings.map((booking) => (
          <div key={booking._id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {booking.user?.username || booking.guestInfo?.guestName}
                </h3>
                <p className="text-sm text-gray-500">
                  {booking.user?.email || booking.guestInfo?.guestEmail}
                </p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                booking.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800' 
                  : booking.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {booking.status === 'confirmed' ? '확정' : booking.status === 'pending' ? '대기' : booking.status === 'cancelled' ? '취소' : booking.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">객실:</span>
                <span className="font-medium">{booking.room?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">체크인:</span>
                <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">체크아웃:</span>
                <span>{new Date(booking.checkOut).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">투숙객:</span>
                <span>{booking.guestCount || booking.guestInfo?.guestCount || '-'}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">가격:</span>
                <span className="font-medium">₩{booking.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4 pt-3 border-t">
              <button
                onClick={() => handleViewDetail(booking)}
                className="text-blue-600 hover:text-blue-900 transition-colors text-sm"
              >
                상세보기
              </button>
              <button
                onClick={() => handleDeleteBooking(booking._id)}
                className="text-red-600 hover:text-red-900 transition-colors text-sm"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
        
        {filteredBookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterStatus !== 'all' ? '검색 결과가 없습니다.' : '예약이 없습니다.'}
          </div>
        )}
      </div>

      {/* 예약 상세 모달 */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">예약 상세 정보</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* 예약자 정보 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">예약자 정보</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">이름</p>
                        <p className="font-medium">{selectedBooking.user?.username || selectedBooking.guestInfo?.guestName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">이메일</p>
                        <p className="font-medium">{selectedBooking.user?.email || selectedBooking.guestInfo?.guestEmail}</p>
                      </div>
                      {selectedBooking.guestInfo?.guestPhone && (
                        <div>
                          <p className="text-sm text-gray-600">전화번호</p>
                          <p className="font-medium">{selectedBooking.guestInfo.guestPhone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 객실 정보 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">객실 정보</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">객실명</p>
                        <p className="font-medium">{selectedBooking.room?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">가격</p>
                        <p className="font-medium">₩{selectedBooking.totalPrice?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 예약 정보 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">예약 정보</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">체크인</p>
                        <p className="font-medium">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">체크아웃</p>
                        <p className="font-medium">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">투숙객</p>
                        <p className="font-medium">{selectedBooking.guestCount || selectedBooking.guestInfo?.guestCount || '-'}명</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">예약일</p>
                        <p className="font-medium">{new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 특별 요청사항 */}
                {selectedBooking.guestInfo?.specialRequests && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">특별 요청사항</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedBooking.guestInfo.specialRequests}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row justify-end md:space-x-3 mt-6 space-y-2 md:space-y-0">
                {selectedBooking.status === 'pending' && (
                  <button
                    onClick={() => handleChangeStatus('confirmed')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    예약완료로 변경
                  </button>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <button
                    onClick={() => handleChangeStatus('pending')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    대기로 변경
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings; 
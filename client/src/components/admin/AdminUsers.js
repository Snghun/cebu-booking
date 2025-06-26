import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Search,
  X
} from 'lucide-react';
import { getAdminUsers } from '../../services/api';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      console.error('고객 목록 조회 오류:', error);
      setError('고객 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 상세보기용 사용자 조회 함수 (새로 구현)
  const fetchUserDetail = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/admin/users/${userId}`,
        {
          baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8888/.netlify/functions/api',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('관리자 사용자 상세 조회 오류:', error.response?.data || error.message);
      throw error;
    }
  };

  const handleViewDetail = async (userId) => {
    try {
      const userData = await fetchUserDetail(userId);
      setSelectedUser(userData);
      setShowDetailModal(true);
    } catch (error) {
      console.error('고객 상세 조회 오류:', error);
      alert('고객 정보를 불러오는데 실패했습니다.');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          onClick={fetchUsers}
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">고객 관리</h2>
          <p className="text-gray-600 mt-1">등록된 고객 정보를 확인하고 관리하세요</p>
        </div>
        <div className="text-sm text-gray-500">
          총 {users.length}명의 고객
        </div>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="고객명, 이메일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 고객 목록 */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이메일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetail(user._id)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="상세보기"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? '검색 결과가 없습니다.' : '고객이 없습니다.'}
          </div>
        )}
      </div>

      {/* 고객 상세 모달 */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">고객 상세 정보</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                {/* 고객 정보 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">고객 정보</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">고객명</p>
                        <p className="font-medium">{selectedUser.user?.username || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">이메일</p>
                        <p className="font-medium">{selectedUser.user?.email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">가입일</p>
                        <p className="font-medium">{selectedUser.user?.createdAt ? new Date(selectedUser.user.createdAt).toLocaleDateString() : '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 예약 내역 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">예약 내역</h4>
                  {selectedUser.bookings && selectedUser.bookings.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUser.bookings.map((booking) => (
                        <div key={booking._id} className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">객실</p>
                              <p className="font-medium">{booking.room?.name || '-'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">체크인</p>
                              <p className="font-medium">{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : '-'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">가격</p>
                              <p className="font-medium">{typeof booking.totalPrice === 'number' ? `₩${booking.totalPrice.toLocaleString()}` : '-'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                      예약 내역이 없습니다.
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
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

export default AdminUsers;
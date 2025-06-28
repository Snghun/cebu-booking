import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Home, 
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { getAdminDashboard } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('대시보드 데이터 조회 오류:', error);
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (menu) => {
    navigate(`/admin?menu=${menu}`);
  };

  const statsCards = [
    {
      title: '총 예약',
      value: dashboardData?.totalBookings || 0,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    {
      title: '총 고객',
      value: dashboardData?.totalUsers || 0,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-500'
    },
    {
      title: '총 객실',
      value: dashboardData?.totalRooms || 0,
      icon: Home,
      color: 'bg-purple-500',
      textColor: 'text-purple-500'
    },
    {
      title: '이번 달 매출',
      value: `₩${(dashboardData?.monthlyRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-orange-500',
      textColor: 'text-orange-500'
    }
  ];

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
          onClick={fetchDashboardData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">대시보드</h2>
        <p className="text-gray-600 mt-1">리조트 운영 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`mt-2 sm:mt-0 p-2 sm:p-3 rounded-full ${stat.color} bg-opacity-10 self-start sm:self-auto`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 최근 예약 - 데스크톱 테이블 */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">최근 예약</h3>
        </div>
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
                  가격
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData?.recentBookings?.map((booking) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!dashboardData?.recentBookings || dashboardData.recentBookings.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            최근 예약이 없습니다.
          </div>
        )}
      </div>

      {/* 최근 예약 - 모바일 카드 */}
      <div className="lg:hidden bg-white rounded-lg shadow-sm border">
        <div className="px-4 py-3 border-b">
          <h3 className="text-base font-semibold text-gray-900">최근 예약</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {dashboardData?.recentBookings?.map((booking) => (
            <div key={booking._id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {booking.user?.username || booking.guestInfo?.guestName}
                  </h4>
                  <p className="text-xs text-gray-500">
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
              
              <div className="space-y-1 text-xs">
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
                  <span className="text-gray-600">가격:</span>
                  <span className="font-medium">₩{booking.totalPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">투숙객:</span>
                  <span>{booking.guests || '-'}명</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {(!dashboardData?.recentBookings || dashboardData.recentBookings.length === 0) && (
          <div className="text-center py-6 text-gray-500 text-sm">
            최근 예약이 없습니다.
          </div>
        )}
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <button
          onClick={() => handleQuickAction('bookings')}
          className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 lg:p-6 hover:shadow-md transition-all duration-200 text-left group"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0 group-hover:bg-blue-200 transition-colors">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">예약 관리</h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">모든 예약을 확인하고 관리하세요</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
        
        <button
          onClick={() => handleQuickAction('users')}
          className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 lg:p-6 hover:shadow-md transition-all duration-200 text-left group"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0 group-hover:bg-green-200 transition-colors">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">고객 관리</h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">고객 정보를 확인하고 관리하세요</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
        
        <button
          onClick={() => handleQuickAction('rooms')}
          className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 lg:p-6 hover:shadow-md transition-all duration-200 text-left group"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0 group-hover:bg-purple-200 transition-colors">
              <Home className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">객실 관리</h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">객실 정보를 수정하고 관리하세요</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard; 
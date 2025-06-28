import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Home, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminBookings from '../components/admin/AdminBookings';
import AdminUsers from '../components/admin/AdminUsers';
import AdminRooms from '../components/admin/AdminRooms';
import { Link } from 'react-router-dom';

const Admin = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 관리자 권한 확인
  useEffect(() => {
    if (!isAdmin) {
      alert('관리자 권한이 필요합니다.');
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // URL 파라미터에서 메뉴 확인
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const menu = params.get('menu');
    if (menu) {
      setActiveMenu(menu);
    }
  }, [location.search]);

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
    setMobileMenuOpen(false); // 모바일 메뉴 닫기
    navigate(`/admin?menu=${menu}`);
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
      navigate('/');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3 },
    { id: 'bookings', label: '예약 관리', icon: Calendar },
    { id: 'users', label: '고객 관리', icon: Users },
    { id: 'rooms', label: '객실 관리', icon: Home },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'bookings':
        return <AdminBookings />;
      case 'users':
        return <AdminUsers />;
      case 'rooms':
        return <AdminRooms />;
      default:
        return <AdminDashboard />;
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors" title="홈으로">
              <Home className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">관리자 대시보드</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block text-sm text-gray-600">
              관리자: {user?.username}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-red-600 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 데스크톱 사이드바 */}
        <aside className={`hidden lg:block bg-white shadow-sm transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <div className="p-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`} />
            </button>
          </div>
          
          <nav className="mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                    activeMenu === item.id
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* 모바일 사이드바 오버레이 */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                        activeMenu === item.id
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin; 
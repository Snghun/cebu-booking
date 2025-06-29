import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Waves, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/users/forgot-password', { email: email.trim().toLowerCase() });
      setSuccess(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || '비밀번호 찾기 요청에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <Link to="/login" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors mb-4">
            <ArrowLeft className="w-6 h-6" />
            <span>로그인으로 돌아가기</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Waves className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Cebu Stays
            </h1>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">비밀번호 찾기</h2>
          <p className="text-gray-600">
            가입하신 이메일 주소를 입력하시면 임시 비밀번호를 발송해드립니다
          </p>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">이메일 발송 완료!</p>
                <p className="text-green-600 text-sm">
                  입력하신 이메일 주소로 임시 비밀번호가 발송되었습니다. 
                  이메일을 확인하신 후 임시 비밀번호로 로그인해주세요.
                </p>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이메일 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소 *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="example@email.com"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>처리 중...</span>
                  </div>
                ) : (
                  '임시 비밀번호 발송'
                )}
              </button>
            </form>
          )}

          {/* 추가 정보 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              임시 비밀번호는 1시간 후 만료됩니다.
            </p>
            <p className="text-xs text-gray-500">
              계정이 없으신가요?{' '}
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>

        {/* 보안 안내 */}
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">보안 안내</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 임시 비밀번호는 1시간 후 자동으로 만료됩니다</li>
              <li>• 로그인 후 반드시 새로운 비밀번호로 변경해주세요</li>
              <li>• 이메일을 다른 사람과 공유하지 마세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 
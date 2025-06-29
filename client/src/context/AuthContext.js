import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTempPassword, setIsTempPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const tempPasswordFlag = localStorage.getItem('isTempPassword');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsAdmin(parsedUser.isAdmin || false);
        setIsTempPassword(tempPasswordFlag === 'true');
      } catch (error) {
        console.error('사용자 데이터 파싱 오류:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      const { token, user: userData, isTempPassword } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isTempPassword', isTempPassword ? 'true' : 'false');
      
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.isAdmin || false);
      setIsTempPassword(isTempPassword || false);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await registerUser(username, email, password);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isTempPassword');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsTempPassword(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    setIsAdmin(userData.isAdmin || false);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const clearTempPassword = () => {
    setIsTempPassword(false);
    localStorage.removeItem('isTempPassword');
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isTempPassword,
    loading,
    login,
    register,
    logout,
    updateUser,
    clearTempPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
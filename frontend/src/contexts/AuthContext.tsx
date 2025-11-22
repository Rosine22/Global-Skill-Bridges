import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';


interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current?: boolean;
}

interface CompanyInfo {
  name?: string;
  size?: string;
  industry?: string;
  website?: string;
  description?: string;
  logo?: string;
}

interface MentorInfo {
  expertise?: string[];
  yearsOfExperience?: number;
  availability?: string;
  bio?: string;
}

interface RTBInfo {
  department?: string;
  position?: string;
  permissions?: string[];
}

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  portfolio?: string;
}

interface Preferences {
  emailNotifications?: boolean;
  jobAlerts?: boolean;
  mentorshipRequests?: boolean;
  theme?: 'light' | 'dark' | 'system';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'job-seeker' | 'employer' | 'mentor' | 'admin' | 'rtb-admin';
  avatar?: {
    url: string;
    public_id: string;
  };
  isEmailVerified: boolean;
  profileCompletion: number;
  isApproved?: boolean; // employer approval flag returned from backend
  phone?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: string;
  education?: Education[];
  experience?: Experience[];
  skills?: string[];
  companyInfo?: CompanyInfo;
  mentorInfo?: MentorInfo;
  rtbInfo?: RTBInfo;
  socialLinks?: SocialLinks;
  preferences?: Preferences;
  isActive?: boolean;
  isBlocked?: boolean;
  lastLogin?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'job-seeker' | 'employer' | 'mentor';
  phone?: string;
  companyInfo?: CompanyInfo;
  avatar?: string;
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: string;
  education?: Education[];
  experience?: Experience[];
  skills?: string[];
  companyInfo?: CompanyInfo;
  mentorInfo?: MentorInfo;
  rtbInfo?: RTBInfo;
  socialLinks?: SocialLinks;
  preferences?: Preferences;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  requestRtbCode: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyRtbCode: (email: string, code: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string, email?: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (data: ProfileUpdateData) => Promise<{ success: boolean; message: string; user?: User }>;
  refreshAuthToken: () => Promise<boolean>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const saveAuthData = useCallback((token: string, refreshToken: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setRefreshToken(refreshToken);
    setUser(userData);
  }, []);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const getCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUser(data.data);
          setToken(storedToken);
          setRefreshToken(localStorage.getItem('refreshToken'));
        } else {
          clearAuthData();
        }
      } else {
        clearAuthData();
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, [clearAuthData]);


  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  const register = async (userData: RegisterData): Promise<{ success: boolean; message?: string; nextStep?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        saveAuthData(data.token, data.refreshToken, data.user);
        // return server response including any extra flags (e.g., nextStep)
        return { success: true, message: data.message, nextStep: data.nextStep };
      } else {
        setError(data.message || 'Registration failed');
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch {
      const message = 'Network error. Please check your connection.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const requestRtbCode = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/rtb/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Failed to send code');
        return { success: false, message: data.message || 'Failed to send code' };
      }
    } catch {
      const message = 'Network error. Please check your connection.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const verifyRtbCode = async (email: string, code: string, name?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/rtb/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code, name }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.token && data.refreshToken && data.user) {
          saveAuthData(data.token, data.refreshToken, data.user);
        }
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Verification failed');
        return { success: false, message: data.message || 'Verification failed' };
      }
    } catch {
      const message = 'Network error. Please check your connection.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        saveAuthData(data.token, data.refreshToken, data.user);
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Login failed');
        return { success: false, message: data.message || 'Invalid credentials' };
      }
    } catch {
      const message = 'Network error. Please check your connection.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'If an account with that email exists, a password reset link has been sent'
        };
      } else {
        setError(data.message);
        return {
          success: false,
          message: data.message || 'Failed to send password reset email'
        };
      }
    } catch {
      const message = 'Network error. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      setError(null);

      if (password !== confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match'
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters'
        };
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/reset-password/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.token && data.refreshToken && data.user) {
          saveAuthData(data.token, data.refreshToken, data.user);
        }
        return {
          success: true,
          message: data.message || 'Password reset successfully'
        };
      } else {
        setError(data.message);
        return {
          success: false,
          message: data.message || 'Invalid or expired reset token'
        };
      }
    } catch {
      const message = 'Network error. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };
  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        return { success: false, message: 'You must be logged in to change password' };
      }

      if (newPassword !== confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      if (newPassword.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || 'Password changed successfully'
        };
      } else {
        setError(data.message);
        return {
          success: false,
          message: data.message || 'Failed to change password'
        };
      }
    } catch {
      const message = 'Network error. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (verificationToken: string, email?: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      setError(null);

      const body: { token: string; email?: string } = { token: verificationToken };
      if (email) body.email = email;

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await getCurrentUser();
        return {
          success: true,
          message: data.message || 'Email verified successfully'
        };
      } else {
        setError(data.message);
        return {
          success: false,
          message: data.message || 'Invalid verification token'
        };
      }
    } catch {
      const message = 'Network error. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: ProfileUpdateData): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        return { success: false, message: 'You must be logged in to update profile' };
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUser(result.data);
        localStorage.setItem('user', JSON.stringify(result.data));
        return {
          success: true,
          message: result.message || 'Profile updated successfully',
          user: result.data
        };
      } else {
        setError(result.message);
        return {
          success: false,
          message: result.message || 'Failed to update profile'
        };
      }
    } catch {
      const message = 'Network error. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const refreshAuthToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        saveAuthData(data.token, data.refreshToken, data.user);
        return true;
      } else {
        clearAuthData();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthData();
      return false;
    }
  };

  const value = {
    user,
    token,
    refreshToken,
    loading,
    error,
    login,
    requestRtbCode,
    verifyRtbCode,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyEmail,
    updateProfile,
    refreshAuthToken,
    getCurrentUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
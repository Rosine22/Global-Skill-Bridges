import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Type definitions for user profile data

// Education interface
interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

// Experience interface
interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current?: boolean;
}

// Company info interface
interface CompanyInfo {
  name?: string;
  size?: string;
  industry?: string;
  website?: string;
  description?: string;
  logo?: string;
}

// Mentor info interface
interface MentorInfo {
  expertise?: string[];
  yearsOfExperience?: number;
  availability?: string;
  bio?: string;
}

// RTB info interface
interface RTBInfo {
  department?: string;
  position?: string;
  permissions?: string[];
}

// Social links interface
interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  portfolio?: string;
}

// Preferences interface
interface Preferences {
  emailNotifications?: boolean;
  jobAlerts?: boolean;
  mentorshipRequests?: boolean;
  theme?: 'light' | 'dark' | 'system';
}

// User interface matching backend response
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

// Registration data interface
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'job-seeker' | 'employer' | 'mentor';
  phone?: string;
  companyInfo?: CompanyInfo;
  avatar?: string;
}

// Profile update data
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
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: ProfileUpdateData) => Promise<{ success: boolean; message: string; user?: User }>;
  refreshAuthToken: () => Promise<boolean>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
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

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Save auth data to localStorage
  const saveAuthData = useCallback((token: string, refreshToken: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setRefreshToken(refreshToken);
    setUser(userData);
  }, []);

  // Clear auth data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  // Get current user from backend
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

  // Initialize auth state on mount
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  // Register new user
  const register = async (userData: RegisterData): Promise<{ success: boolean; message?: string }> => {
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
        return { success: true, message: data.message };
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

  // Login user
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

  // Logout user
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

  // Forgot password
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

  // Reset password
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
        // Auto-login after successful password reset
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

  // Change password (for logged in users)
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

  // Verify email
  const verifyEmail = async (verificationToken: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/verify-email/${verificationToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh user data
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

  // Update profile
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

  // Refresh auth token
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
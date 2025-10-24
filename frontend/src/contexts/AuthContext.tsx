import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'job-seeker' | 'employer' | 'mentor' | 'admin' | 'rtb-admin';
  avatar?: string;
  isVerified?: boolean;
  profileComplete?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { email: string; name: string; role: 'job-seeker' | 'employer' | 'mentor' | 'admin' | 'rtb-admin' }) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call - in real app, this would be an actual API call
    setLoading(true);
    
    // Mock users for demo
    const mockUsers: User[] = [
      { 
        id: '1', 
        email: 'john@example.com', 
        name: 'John Mukamana', 
        role: 'job-seeker',
        isVerified: true,
        profileComplete: true,
        approvalStatus: 'approved'
      },
      { 
        id: '2', 
        email: 'employer@company.com', 
        name: 'Tech Solutions Ltd', 
        role: 'employer',
        isVerified: true,
        profileComplete: true,
        approvalStatus: 'approved'
      },
      { 
        id: '3', 
        email: 'mentor@example.com', 
        name: 'Sarah Uwimana', 
        role: 'mentor',
        isVerified: true,
        profileComplete: true,
        approvalStatus: 'approved'
      },
      { 
        id: '4', 
        email: 'admin@gsb.com', 
        name: 'System Admin', 
        role: 'admin',
        isVerified: true,
        profileComplete: true,
        approvalStatus: 'approved'
      },
      { 
        id: '5', 
        email: 'rtb@rtb.gov.rw', 
        name: 'RTB Administrator', 
        role: 'rtb-admin',
        isVerified: true,
        profileComplete: true,
        approvalStatus: 'approved'
      },
      { 
        id: '6', 
        email: 'newemployer@company.com', 
        name: 'New Company Ltd', 
        role: 'employer',
        isVerified: false,
        profileComplete: false,
        approvalStatus: 'pending'
      }
    ];
    
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === 'password123') {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const register = async (userData: { email: string; name: string; role: 'job-seeker' | 'employer' | 'mentor' | 'admin' | 'rtb-admin' }): Promise<boolean> => {
    setLoading(true);
    
    // Simulate registration
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isVerified: false,
      profileComplete: false
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      
      // In production, this would make a real API call to /api/auth/forgot-password
      const response = await fetch('/api/auth/forgot-password', {
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
          message: data.message || 'Password reset instructions have been sent to your email.'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to send password reset email.'
        };
      }
    } catch (error) {
      // For demo purposes, simulate a successful response
      console.log('Demo mode: Password reset email would be sent to:', email, 'Error:', error);
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent to your email address.'
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);

      if (password !== confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match.'
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters long.'
        };
      }

      // In production, this would make a real API call to /api/auth/reset-password/:token
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login after successful password reset
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return {
          success: true,
          message: data.message || 'Password has been reset successfully. You are now logged in.'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Invalid or expired reset token.'
        };
      }
    } catch (error) {
      // For demo purposes, simulate a successful response
      console.log('Demo mode: Password would be reset for token:', token, 'Error:', error);
      return {
        success: true,
        message: 'Password has been reset successfully. Please log in with your new password.'
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'job-seeker' | 'employer' | 'mentor' | 'admin' | 'rtb-admin';
  avatar?: string;
  isVerified?: boolean;
  profileComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
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
        profileComplete: true
      },
      { 
        id: '2', 
        email: 'employer@company.com', 
        name: 'Tech Solutions Ltd', 
        role: 'employer',
        isVerified: true,
        profileComplete: true
      },
      { 
        id: '3', 
        email: 'mentor@example.com', 
        name: 'Sarah Uwimana', 
        role: 'mentor',
        isVerified: true,
        profileComplete: true
      },
      { 
        id: '4', 
        email: 'admin@gsb.com', 
        name: 'System Admin', 
        role: 'admin',
        isVerified: true,
        profileComplete: true
      },
      { 
        id: '5', 
        email: 'rtb@rtb.gov.rw', 
        name: 'RTB Administrator', 
        role: 'rtb-admin',
        isVerified: true,
        profileComplete: true
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

  const register = async (userData: any): Promise<boolean> => {
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

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
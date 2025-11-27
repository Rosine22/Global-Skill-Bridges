export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  JOBS: '/api/jobs',
  APPLICATIONS: '/api/applications',
  MENTORSHIP: '/api/mentorship',
  SKILLS: '/api/skills',
  MESSAGES: '/api/messages',
  NOTIFICATIONS: '/api/notifications',
  ADMIN: '/api/admin',
  RTB: '/api/rtb',
  ANALYTICS: '/api/analytics',
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

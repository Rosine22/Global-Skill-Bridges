import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobSeekerDashboard from './pages/dashboards/JobSeekerDashboard';
import EmployerDashboard from './pages/dashboards/EmployerDashboard';
import MentorDashboard from './pages/dashboards/MentorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import RTBDashboard from './pages/dashboards/RTBDashboard';
import JobDetailsPage from './pages/JobDetailsPage';
import ProfilePage from './pages/ProfilePage';
import MentorshipPage from './pages/MentorshipPage';
import SkillsVerificationPage from './pages/SkillsVerificationPage';
import ApplicationsPage from './pages/ApplicationsPage';
import MessagesPage from './pages/MessagesPage';
import TalentSearchPage from './pages/TalentSearchPage';
import SessionsPage from './pages/SessionsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import NotificationsPage from './pages/NotificationsPage';
import MentorProfilePage from './pages/MentorProfilePage';
import RTBAnalyticsPage from './pages/RTBAnalyticsPage';
import RTBSkillsGapPage from './pages/RTBSkillsGapPage';
import RTBProgramsPage from './pages/RTBProgramsPage';
import RTBReportsPage from './pages/RTBReportsPage';
import AdminJobManagementPage from './pages/AdminJobManagementPage';
import AdminVerificationPage from './pages/AdminVerificationPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

function DashboardRouter() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case 'job-seeker':
      return <JobSeekerDashboard />;
    case 'employer':
      return <EmployerDashboard />;
    case 'mentor':
      return <MentorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'rtb-admin':
      return <RTBDashboard />;
    default:
      return <Navigate to="/login" />;
  }
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/job/:id" 
                element={
                  <ProtectedRoute>
                    <JobDetailsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/mentorship" 
                element={
                  <ProtectedRoute>
                    <MentorshipPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/skills-verification" 
                element={
                  <ProtectedRoute>
                    <SkillsVerificationPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/applications" 
                element={
                  <ProtectedRoute>
                    <ApplicationsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/talent" 
                element={
                  <ProtectedRoute>
                    <TalentSearchPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/sessions" 
                element={
                  <ProtectedRoute>
                    <SessionsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute>
                    <AdminUsersPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* RTB Analytics Routes - placeholder pages that show coming soon */}
              <Route 
                path="/rtb/analytics" 
                element={
                  <ProtectedRoute>
                    <RTBDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/rtb/skills-gap" 
                element={
                  <ProtectedRoute>
                    <RTBDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/rtb/programs" 
                element={
                  <ProtectedRoute>
                    <RTBDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/rtb/reports" 
                element={
                  <ProtectedRoute>
                    <RTBDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route for unmatched paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
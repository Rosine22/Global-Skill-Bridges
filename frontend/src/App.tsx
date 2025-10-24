import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';

// Shared pages
import LandingPage from './pages/shared/LandingPage';
import ProfilePage from './pages/shared/ProfilePage';
import MessagesPage from './pages/shared/MessagesPage';
import NotificationsPage from './pages/shared/NotificationsPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard pages
import JobSeekerDashboard from './pages/job-seeker/Dashboard';
import EmployerDashboard from './pages/employer/Dashboard';
import MentorDashboard from './pages/mentor/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import RTBDashboard from './pages/rtb/Dashboard';

// Job Seeker pages
import JobDetailsPage from './pages/job-seeker/JobDetails';
import SkillsVerificationPage from './pages/job-seeker/SkillsVerification';
import ApplicationsPage from './pages/job-seeker/Applications';

// Employer pages
import TalentSearchPage from './pages/employer/TalentSearch';
import PostJobPage from './pages/employer/PostJob';
import EmployerOnboarding from './pages/employer/Onboarding';
import EmployerPendingApproval from './pages/employer/PendingApproval';
import TestEmployerData from './pages/employer/TestData';

// Mentor pages
import MentorshipPage from './pages/mentor/MentorshipPage';
import SessionsPage from './pages/mentor/SessionsPage';
import MentorProfilePage from './pages/mentor/ProfilePage';

// Admin pages
import AdminUsersPage from './pages/admin/UsersPage';
import AdminJobManagementPage from './pages/admin/JobManagement';
import AdminVerificationPage from './pages/admin/VerificationPage';
import AdminEmployerApproval from './pages/admin/EmployerApproval';
import AdminLoginPage from './pages/admin/LoginPage';

// RTB pages
import RTBAnalyticsPage from './pages/rtb/AnalyticsPage';
import RTBSkillsGapPage from './pages/rtb/SkillsGapPage';
import RTBProgramsPage from './pages/rtb/ProgramsPage';
import RTBReportsPage from './pages/rtb/ReportsPage';

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
  
  // Handle employer approval workflow
  if (user.role === 'employer') {
    if (!user.profileComplete) {
      return <Navigate to="/employer/onboarding" />;
    }
    if (user.approvalStatus === 'pending') {
      return <Navigate to="/employer/pending-approval" />;
    }
    if (user.approvalStatus === 'rejected') {
      return <Navigate to="/employer/pending-approval" />;
    }
  }
  
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
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/test-employer-data" element={<TestEmployerData />} />
              
              {/* Employer Onboarding Routes */}
              <Route 
                path="/employer/onboarding" 
                element={
                  <ProtectedRoute>
                    <EmployerOnboarding />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/employer/pending-approval" 
                element={
                  <ProtectedRoute>
                    <EmployerPendingApproval />
                  </ProtectedRoute>
                } 
              />
              
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
                path="/mentor/:id" 
                element={
                  <ProtectedRoute>
                    <MentorProfilePage />
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
                path="/employer/post-job" 
                element={
                  <ProtectedRoute>
                    <PostJobPage />
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
              

              
                            {/* RTB Routes */}
              <Route 
                path="/rtb/analytics" 
                element={
                  <ProtectedRoute>
                    <RTBAnalyticsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/rtb/skills-gap" 
                element={
                  <ProtectedRoute>
                    <RTBSkillsGapPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/rtb/programs" 
                element={
                  <ProtectedRoute>
                    <RTBProgramsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/rtb/reports" 
                element={
                  <ProtectedRoute>
                    <RTBReportsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/rtb/graduates" 
                element={
                  <ProtectedRoute>
                    <RTBDashboard />
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
              
              <Route 
                path="/admin/jobs" 
                element={
                  <ProtectedRoute>
                    <AdminJobManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/verifications" 
                element={
                  <ProtectedRoute>
                    <AdminVerificationPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/employer-approvals" 
                element={
                  <ProtectedRoute>
                    <AdminEmployerApproval />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/reports" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile/:id" 
                element={
                  <ProtectedRoute>
                    <MentorProfilePage />
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
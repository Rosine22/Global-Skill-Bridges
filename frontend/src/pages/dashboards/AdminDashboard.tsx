import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserContext } from '../../contexts/UserContext';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users,
  Briefcase,
  UserCheck,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Activity,
  Settings,
  FileText,
  Award
} from 'lucide-react';

function AdminDashboard() {
  const { user } = useAuth();
  const { jobs, applications, mentorshipRequests } = useUserContext();

  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+142 this month',
      icon: Users,
      color: 'text-primary-600',
      breakdown: 'Job Seekers: 2,156 | Employers: 341 | Mentors: 350'
    },
    {
      title: 'Active Jobs',
      value: jobs.filter(job => job.status === 'active').length,
      change: '+23 this week',
      icon: Briefcase,
      color: 'text-secondary-600',
      breakdown: 'Posted this month: 89'
    },
    {
      title: 'Applications',
      value: applications.length,
      change: '+67 today',
      icon: FileText,
      color: 'text-purple-600',
      breakdown: 'Success rate: 23%'
    },
    {
      title: 'Verified Skills',
      value: '8,934',
      change: '+234 pending',
      icon: Award,
      color: 'text-orange-600',
      breakdown: 'Verification rate: 89%'
    }
  ];

  const recentActivities = [
    { type: 'user', message: 'New job seeker registered: John Mukamana', time: '2 minutes ago' },
    { type: 'job', message: 'TechCorp International posted new job: Software Developer', time: '5 minutes ago' },
    { type: 'verification', message: 'Skills verification completed for Mary Uwimana', time: '10 minutes ago' },
    { type: 'application', message: '3 new applications received for Electrical Technician position', time: '15 minutes ago' },
    { type: 'mentor', message: 'Mentorship request accepted by Sarah Uwimana', time: '23 minutes ago' }
  ];

  const pendingReviews = [
    { type: 'skill-verification', count: 23, title: 'Skills Verifications' },
    { type: 'mentor-applications', count: 7, title: 'Mentor Applications' },
    { type: 'job-reports', count: 3, title: 'Job Reports' },
    { type: 'user-reports', count: 2, title: 'User Reports' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-300 mb-4">
            Welcome back, {user?.name}! Monitor platform activity and manage operations.
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.open('/admin/job-management', '_blank')}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Job Management
            </button>
            <button 
              onClick={() => window.open('/admin/verification', '_blank')}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Verification
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 border-t pt-2">
                  {stat.breakdown}
                </p>
              </div>
            );
          })}
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pending Reviews</h2>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              {pendingReviews.map((review, index) => (
                <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-800 mb-1">
                    {review.count}
                  </div>
                  <div className="text-sm font-medium text-orange-700 mb-2">
                    {review.title}
                  </div>
                  <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                    Review →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Analytics */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">User Registration Trends</h2>
            </div>
            <div className="p-6">
              <div className="h-64 flex items-center justify-center text-gray-500">
                <BarChart3 className="h-12 w-12 mb-4" />
                <div className="text-center">
                  <p>Chart placeholder</p>
                  <p className="text-sm">Real analytics would be integrated here</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Job Application Success Rate</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Software Development</span>
                  <span className="text-sm text-gray-600">32%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '32%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Electrical Engineering</span>
                  <span className="text-sm text-gray-600">28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-secondary-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Automotive Technology</span>
                  <span className="text-sm text-gray-600">18%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h2>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'job' ? 'bg-green-500' :
                    activity.type === 'verification' ? 'bg-purple-500' :
                    activity.type === 'application' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">System Management</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <button 
                onClick={() => window.open('/admin/users', '_blank')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Users className="h-6 w-6 text-primary-600 mb-2" />
                <h3 className="font-medium text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
              </button>
              <button 
                onClick={() => window.open('/admin/verifications', '_blank')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Award className="h-6 w-6 text-secondary-600 mb-2" />
                <h3 className="font-medium text-gray-900">Skill Verification</h3>
                <p className="text-sm text-gray-600">Review and approve skill verifications</p>
              </button>
              <button 
                onClick={() => window.open('/admin/moderation', '_blank')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <FileText className="h-6 w-6 text-purple-600 mb-2" />
                <h3 className="font-medium text-gray-900">Content Moderation</h3>
                <p className="text-sm text-gray-600">Review reported content and jobs</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
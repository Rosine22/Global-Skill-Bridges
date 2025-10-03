import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserContext } from '../../contexts/UserContext';
import DashboardLayout from '../../components/DashboardLayout';
import JobCard from '../../components/JobCard';
import { 
  Search, 
  MapPin, 
  Filter, 
  TrendingUp,
  Briefcase,
  MessageCircle,
  Award,
  User
} from 'lucide-react';

function JobSeekerDashboard() {
  const { user } = useAuth();
  const { jobs, applications } = useUserContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = !selectedLocation || job.country === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const stats = [
    {
      title: 'Applications Sent',
      value: applications.length,
      change: '+2 this week',
      icon: Briefcase,
      color: 'text-primary-600'
    },
    {
      title: 'Profile Views',
      value: 43,
      change: '+8 this week',
      icon: User,
      color: 'text-secondary-600'
    },
    {
      title: 'Messages',
      value: 5,
      change: '2 unread',
      icon: MessageCircle,
      color: 'text-purple-600'
    },
    {
      title: 'Skills Verified',
      value: 12,
      change: '3 pending',
      icon: Award,
      color: 'text-orange-600'
    }
  ];

  const recentApplications = applications.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-primary-100 mb-4">
            Ready to find your next global opportunity? {filteredJobs.length} jobs match your profile.
          </p>
          {!user?.profileComplete && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-sm">
                Complete your profile to get better job matches and increase your visibility to employers.
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Applications */}
        {applications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            </div>
            <div className="p-6 space-y-4">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{application.jobTitle}</h3>
                    <p className="text-sm text-gray-600">{application.company}</p>
                    <p className="text-sm text-gray-500">Applied on {application.appliedDate}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      application.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : application.status === 'reviewed'
                        ? 'bg-blue-100 text-blue-800'
                        : application.status === 'shortlisted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Search */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Find Jobs</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search jobs, companies, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Countries</option>
                  <option value="Canada">Canada</option>
                  <option value="UAE">UAE</option>
                  <option value="Germany">Germany</option>
                  <option value="UK">United Kingdom</option>
                  <option value="USA">United States</option>
                </select>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No jobs found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default JobSeekerDashboard;
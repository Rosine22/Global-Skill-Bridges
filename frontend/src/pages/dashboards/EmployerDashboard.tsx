import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserContext } from '../../contexts/UserContext';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Plus,
  Users,
  Eye,
  Calendar,
  TrendingUp,
  Briefcase,
  FileText,
  Settings
} from 'lucide-react';

function EmployerDashboard() {
  const { user } = useAuth();
  const { jobs, applications, addJob } = useUserContext();
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    location: '',
    country: '',
    description: '',
    requirements: '',
    skills: '',
    salary: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract',
    remote: false
  });

  // Filter jobs and applications for this employer
  const employerJobs = jobs.filter(job => job.employerId === user?.id);
  const jobApplications = applications.filter(app => 
    employerJobs.some(job => job.id === app.jobId)
  );

  const stats = [
    {
      title: 'Active Jobs',
      value: employerJobs.filter(job => job.status === 'active').length,
      change: '+2 this month',
      icon: Briefcase,
      color: 'text-primary-600'
    },
    {
      title: 'Total Applications',
      value: jobApplications.length,
      change: '+12 this week',
      icon: FileText,
      color: 'text-secondary-600'
    },
    {
      title: 'Profile Views',
      value: 234,
      change: '+23 this week',
      icon: Eye,
      color: 'text-purple-600'
    },
    {
      title: 'Candidates Hired',
      value: 8,
      change: '2 this month',
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newJob = {
      ...jobForm,
      company: user?.name || 'Company Name',
      employerId: user?.id || '',
      requirements: jobForm.requirements.split('\n').filter(req => req.trim()),
      skills: jobForm.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      status: 'active' as const
    };
    
    addJob(newJob);
    setShowJobForm(false);
    setJobForm({
      title: '',
      location: '',
      country: '',
      description: '',
      requirements: '',
      skills: '',
      salary: '',
      type: 'full-time',
      remote: false
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setJobForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-secondary-600 to-primary-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-secondary-100 mb-4">
            Manage your job postings and find the perfect candidates for your team.
          </p>
          <button
            onClick={() => setShowJobForm(true)}
            className="bg-white text-secondary-600 px-4 py-2 rounded-lg font-medium hover:bg-secondary-50 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </button>
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
        {jobApplications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {jobApplications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{application.applicantName}</h3>
                      <p className="text-sm text-gray-600">{application.jobTitle}</p>
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
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Job Listings */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Your Job Listings</h2>
            <button
              onClick={() => setShowJobForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </button>
          </div>
          <div className="p-6">
            {employerJobs.length > 0 ? (
              <div className="space-y-4">
                {employerJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.location}, {job.country}</p>
                        <p className="text-sm text-gray-500 mt-1">Posted on {job.postedDate}</p>
                        <div className="flex items-center mt-3 space-x-4">
                          <span className="text-sm text-gray-600">
                            <Users className="h-4 w-4 inline mr-1" />
                            {job.applications || 0} applications
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : job.status === 'closed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No job listings yet</p>
                <button
                  onClick={() => setShowJobForm(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
                >
                  Post Your First Job
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Job Posting Form Modal */}
        {showJobForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Post New Job</h3>
              </div>
              <form onSubmit={handleJobSubmit} className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={jobForm.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={jobForm.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={jobForm.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      name="type"
                      value={jobForm.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={jobForm.salary}
                    onChange={handleInputChange}
                    placeholder="e.g., $50,000 - $70,000 USD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    name="description"
                    value={jobForm.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements (one per line)
                  </label>
                  <textarea
                    name="requirements"
                    value={jobForm.requirements}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Bachelor's degree in relevant field&#10;2+ years of experience&#10;Strong communication skills"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={jobForm.skills}
                    onChange={handleInputChange}
                    placeholder="JavaScript, React, Node.js, SQL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="remote"
                    checked={jobForm.remote}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Remote work available
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowJobForm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Post Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default EmployerDashboard;
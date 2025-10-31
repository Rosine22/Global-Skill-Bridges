import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useUserContext } from '../../contexts/UserContext';
import { Briefcase, Search, CreditCard as Edit3, Trash2, CheckCircle, XCircle, AlertTriangle, MapPin, Calendar, Users, DollarSign, Building } from 'lucide-react';

function AdminJobManagementPage() {
  const { jobs } = useUserContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || job.status === statusFilter;
    const matchesType = !typeFilter || job.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleJobAction = (jobId: string, action: 'approve' | 'reject' | 'suspend' | 'delete') => {
    console.log(`${action} job ${jobId}`);
    // In a real app, this would make API calls
    alert(`Job ${action}d successfully!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const stats = [
    {
      title: 'Total Jobs',
      value: jobs.length,
      color: 'text-primary-600'
    },
    {
      title: 'Active Jobs',
      value: jobs.filter(job => job.status === 'active').length,
      color: 'text-green-600'
    },
    {
      title: 'Draft Jobs',
      value: jobs.filter(job => job.status === 'draft').length,
      color: 'text-yellow-600'
    },
    {
      title: 'Total Applications',
      value: jobs.reduce((sum, job) => sum + (job.applications || 0), 0),
      color: 'text-blue-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
            <p className="text-gray-600">Monitor and manage all job postings on the platform</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search jobs by title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="p-6">
            {filteredJobs.length > 0 ? (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(job.status)}`}>
                            {getStatusIcon(job.status)}
                            <span className="ml-1 capitalize">{job.status}</span>
                          </span>
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                            {job.type.replace('-', ' ')}
                          </span>
                          {job.remote && (
                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                              Remote
                            </span>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <Building className="h-4 w-4 mr-2" />
                              {job.company}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <MapPin className="h-4 w-4 mr-2" />
                              {job.location}, {job.country}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              Posted on {job.postedDate}
                            </div>
                            {job.salary && (
                              <div className="flex items-center text-sm text-gray-600">
                                <DollarSign className="h-4 w-4 mr-2" />
                                {job.salary}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <Users className="h-4 w-4 mr-2" />
                              {job.applications || 0} applications
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.skills.slice(0, 4).map((skill) => (
                            <span 
                              key={skill}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              +{job.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        Job ID: {job.id} • Employer ID: {job.employerId}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleJobAction(job.id, 'approve')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="View details"
                        >
                        </button>
                        <button
                          onClick={() => handleJobAction(job.id, 'approve')}
                          className="text-green-600 hover:text-green-700 p-1"
                          title="Edit job"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {job.status === 'active' ? (
                          <button
                            onClick={() => handleJobAction(job.id, 'suspend')}
                            className="text-yellow-600 hover:text-yellow-700 p-1"
                            title="Suspend job"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJobAction(job.id, 'approve')}
                            className="text-green-600 hover:text-green-700 p-1"
                            title="Approve job"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleJobAction(job.id, 'delete')}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Delete job"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No jobs found</p>
                <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminJobManagementPage;

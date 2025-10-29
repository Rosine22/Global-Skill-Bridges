import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserContext, type Application } from '../../contexts/UserContext';
import DashboardLayout from '../../components/DashboardLayout';
import ApplicationReviewModal from '../../components/ApplicationReviewModal';
import { 
  Search, 
  Calendar, 
  Building, 
  Eye, 
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react';

function ApplicationsPage() {
  const { user } = useAuth();
  const { applications, jobs, updateApplicationStatus } = useUserContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [statusUpdateNotification, setStatusUpdateNotification] = useState<string | null>(null);

  // Filter applications based on user role
  const userApplications = user?.role === 'job-seeker' 
    ? applications.filter(app => app.applicantId === user.id)
    : user?.role === 'employer' 
    ? applications.filter(app => {
        const job = jobs.find(j => j.id === app.jobId);
        return job?.employerId === user.id;
      })
    : applications;

  const filteredApplications = userApplications.filter(app => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'reviewed':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'shortlisted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'hired':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'hired':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (applicationId: string, newStatus: Application['status']) => {
    updateApplicationStatus(applicationId, newStatus);
    console.log('Status updated in ApplicationsPage:', applicationId, newStatus);
    
    // Update the selected application if it's currently being viewed
    if (selectedApplication && selectedApplication.id === applicationId) {
      setSelectedApplication({ ...selectedApplication, status: newStatus });
    }
    
    // Show notification
    const application = applications.find(app => app.id === applicationId);
    if (application) {
      setStatusUpdateNotification(`${application.applicantName}'s application status updated to ${newStatus}`);
      // Clear notification after 3 seconds
      setTimeout(() => setStatusUpdateNotification(null), 3000);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedApplication(null);
  };

  const handleSendMessage = (applicationId: string, message: string) => {
    console.log('Sending message:', applicationId, message);
    // TODO: Implement message sending
  };

  const stats = [
    {
      title: 'Total Applications',
      value: userApplications.length,
      color: 'text-primary-600'
    },
    {
      title: 'Pending Review',
      value: userApplications.filter(app => app.status === 'pending').length,
      color: 'text-yellow-600'
    },
    {
      title: 'Shortlisted',
      value: userApplications.filter(app => app.status === 'shortlisted').length,
      color: 'text-green-600'
    },
    {
      title: user?.role === 'employer' ? 'Hired' : 'Success Rate',
      value: user?.role === 'employer' 
        ? userApplications.filter(app => app.status === 'hired').length
        : `${Math.round((userApplications.filter(app => app.status === 'hired').length / Math.max(userApplications.length, 1)) * 100)}%`,
      color: 'text-purple-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Status Update Notification */}
        {statusUpdateNotification && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            <p className="font-medium">{statusUpdateNotification}</p>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600">
              {user?.role === 'job-seeker' 
                ? 'Track your job applications and their progress'
                : 'Manage applications for your posted jobs'
              }
            </p>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder={user?.role === 'employer' ? "Search applicants or jobs..." : "Search applications..."}
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
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="p-6">
            {filteredApplications.length > 0 ? (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
                          <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1">{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</span>
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <Building className="h-4 w-4 mr-2" />
                              {application.company}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              Applied on {application.appliedDate}
                            </div>
                            {user?.role === 'employer' && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Eye className="h-4 w-4 mr-2" />
                                Applicant: {application.applicantName}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            {application.coverLetter && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                                <p className="text-sm text-gray-600 line-clamp-3">{application.coverLetter}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {user?.role === 'employer' && application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'reviewed')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'shortlisted')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {user?.role === 'employer' && application.status === 'shortlisted' && (
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'hired')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm"
                          >
                            Hire
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleViewApplication(application)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No applications found</p>
                <p className="text-sm text-gray-400">
                  {user?.role === 'job-seeker' 
                    ? 'Start applying to jobs to see your applications here'
                    : 'Applications for your job postings will appear here'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Application Review Modal */}
        {showReviewModal && selectedApplication && (
          <ApplicationReviewModal
            application={selectedApplication}
            isOpen={showReviewModal}
            onClose={handleCloseReviewModal}
            onStatusUpdate={handleStatusUpdate}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default ApplicationsPage;

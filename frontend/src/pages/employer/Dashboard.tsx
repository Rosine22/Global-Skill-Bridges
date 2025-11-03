import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserContext, Application } from '../../contexts/UserContext';
import DashboardLayout from '../../components/DashboardLayout';
import ApplicationReviewModal from '../../components/ApplicationReviewModal';
import { getApiUrl } from '../../config/api';

function EmployerDashboard() {
  const { user } = useAuth();
  const { jobs, applications, updateApplicationStatus } = useUserContext();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter jobs posted by current employer
  const employerJobs = jobs.filter(job => 
    user && job.employerId === user.id
  );
  
  // Filter applications for employer's jobs
  const employerApplications = applications.filter(app =>
    employerJobs.some(job => job.id === app.jobId)
  );

  // Handlers for buttons
  const handlePostNewJob = () => {
    // Navigate to job posting page
    window.location.href = '/employer/post-job';
  };

  const handleViewApplicationDetails = (applicationId: string) => {
    const app = employerApplications.find(a => a.id === applicationId);
    if (app) {
      setSelectedApplication(app);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const handleStatusUpdate = (applicationId: string, newStatus: Application['status']) => {
    updateApplicationStatus(applicationId, newStatus);
    alert(`Application status updated to: ${newStatus}`);
  };

  const handleSendMessage = (applicationId: string, message: string) => {
    console.log(`Sending message to application ${applicationId}:`, message);
    alert('Message sent successfully!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Employer'}!</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your job postings and review applications.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{employerJobs.length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Jobs</dt>
                    <dd className="text-lg font-medium text-gray-900">{employerJobs.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{employerApplications.length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Applications</dt>
                    <dd className="text-lg font-medium text-gray-900">{employerApplications.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">0</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Interviews</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">0</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Hires</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Job Postings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Job Postings</h3>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                onClick={handlePostNewJob}
              >
                Post New Job
              </button>
            </div>
            {employerJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No job postings yet.</p>
                <p className="text-sm text-gray-400 mt-1">Create your first job posting to start hiring!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {employerJobs.map((job) => {
                  const jobApplications = employerApplications.filter(app => app.jobId === job.id);
                  return (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{job.location}, {job.country} • {job.type}</p>
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{job.description}</p>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm font-medium text-gray-900">{job.salary}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {jobApplications.length} applications
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                          onClick={() => {
                            // Show applications for this specific job
                            if (jobApplications.length > 0) {
                              handleViewApplicationDetails(jobApplications[0].id);
                            } else {
                              alert('No applications for this job yet.');
                            }
                          }}
                        >
                          View Applications ({jobApplications.length})
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-500 text-sm font-medium"
                          onClick={() => {
                            window.location.href = `/employer/edit-job/${job.id}`;
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-500 text-sm font-medium"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${job.title}"?`)) {
                              alert('Job deletion feature will be implemented soon!');
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        {employerApplications.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Applications</h3>
              <div className="space-y-2">
                {employerApplications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
                    <div>
                      <p className="font-medium text-gray-900 text-xs">{application.applicantName}</p>
                      <p className="text-xs text-gray-500">{application.jobTitle}</p>
                      <p className="text-xs text-gray-400">Applied {new Date(application.appliedDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-500 text-xs font-medium"
                        onClick={() => handleViewApplicationDetails(application.id)}
                      >
                        View Details
                      </button>
                      <button
                        className="text-green-600 hover:text-green-500 text-xs font-medium"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(getApiUrl(`/api/applications/${application.id}/cv/preview`), {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });
                            
                            if (!response.ok) {
                              throw new Error('Failed to fetch CV preview');
                            }
                            
                            const data = await response.json();
                            if (data.success && data.data.previewUrl) {
                              window.open(data.data.previewUrl, '_blank');
                            } else {
                              alert('CV preview URL not available');
                            }
                          } catch (error) {
                            console.error('Error fetching CV preview:', error);
                            alert('Failed to preview CV. Please try again.');
                          }
                        }}
                      >
                        Preview CV
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-500 text-xs font-medium"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(getApiUrl(`/api/applications/${application.id}/cv/download`), {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });
                            
                            if (!response.ok) {
                              throw new Error('Failed to fetch CV download');
                            }
                            
                            const data = await response.json();
                            if (data.success && data.data.downloadUrl) {
                              const link = document.createElement('a');
                              link.href = data.data.downloadUrl;
                              link.download = data.data.fileName || 'resume.pdf';
                              link.target = '_blank';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } else {
                              alert('CV download URL not available');
                            }
                          } catch (error) {
                            console.error('Error downloading CV:', error);
                            alert('Failed to download CV. Please try again.');
                          }
                        }}
                      >
                        Download CV
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <a
                  href="/applications"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  View all applications ({employerApplications.length}) →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Application Review Modal */}
      {selectedApplication && (
        <ApplicationReviewModal
          application={selectedApplication}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
          onSendMessage={handleSendMessage}
        />
      )}
    </DashboardLayout>
  );
}

export default EmployerDashboard;

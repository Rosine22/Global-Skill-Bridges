import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserContext } from '../../contexts/UserContext';
import DashboardLayout from '../../components/DashboardLayout';
import JobCard from '../../components/JobCard';

function JobSeekerDashboard() {
  const { user } = useAuth();
  const { jobs, applications, applyToJob } = useUserContext();
  const [loading] = useState(false);
  const [activeView, setActiveView] = useState<'jobs' | 'applications' | 'interviews' | null>('jobs');

  console.log('JobSeekerDashboard - Jobs from context:', jobs);
  console.log('JobSeekerDashboard - Jobs count:', jobs.length);
  console.log('JobSeekerDashboard - Applications:', applications.length);

  // Filter applications for current user
  const userApplications = applications.filter(app => 
    user && app.applicantEmail === user.email
  );

  // Calculate statistics
  const totalApplications = userApplications.length;
  const pendingApplications = userApplications.filter(app => app.status === 'pending').length;
  const shortlistedApplications = userApplications.filter(app => 
    app.status === 'shortlisted' || app.status === 'interview-scheduled'
  ).length;

  const handleApply = (jobId: string) => {
    if (!user) {
      alert('Please login to apply for jobs');
      return;
    }

    // Simple application - in real app, this would open a modal with application form
    const applicationData = {
      coverLetter: `I am interested in applying for this position. I believe my skills and experience make me a great fit for this role.`,
      resume: null,
      portfolio: { url: '', description: '' },
      additionalDocuments: [],
      personalInfo: {
        phone: '',
        linkedIn: '',
        website: '',
        availableStartDate: new Date().toISOString().split('T')[0]
      },
      salaryExpectation: {
        min: '',
        max: '',
        currency: 'USD',
        isNegotiable: true
      },
      whyInterested: 'I am excited about this opportunity and believe I can contribute significantly to the team.',
      additionalNotes: ''
    };

    applyToJob(jobId, applicationData);
    alert('Application submitted successfully!');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Job Seeker'}!</h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your job search today.
          </p>
        </div>

        {/* Stats - Interactive Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <button 
            className={`bg-white overflow-hidden shadow rounded-lg w-full text-left hover:shadow-md transition-shadow ${activeView === 'jobs' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveView(activeView === 'jobs' ? null : 'jobs')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{jobs.length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Available Jobs</dt>
                    <dd className="text-lg font-medium text-gray-900">{jobs.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </button>

          <button 
            className={`bg-white overflow-hidden shadow rounded-lg w-full text-left hover:shadow-md transition-shadow ${activeView === 'applications' ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setActiveView(activeView === 'applications' ? null : 'applications')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{totalApplications}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                    <dd className="text-lg font-medium text-gray-900">{totalApplications}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </button>

          <button 
            className="bg-white overflow-hidden shadow rounded-lg w-full text-left hover:shadow-md transition-shadow"
            onClick={() => setActiveView(activeView === 'applications' ? null : 'applications')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{pendingApplications}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                    <dd className="text-lg font-medium text-gray-900">{pendingApplications}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </button>

          <button 
            className={`bg-white overflow-hidden shadow rounded-lg w-full text-left hover:shadow-md transition-shadow ${activeView === 'interviews' ? 'ring-2 ring-purple-500' : ''}`}
            onClick={() => setActiveView(activeView === 'interviews' ? null : 'interviews')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{shortlistedApplications}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Shortlisted</dt>
                    <dd className="text-lg font-medium text-gray-900">{shortlistedApplications}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Dynamic Content Based on Selected Button */}
        {activeView === 'jobs' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Available Job Opportunities</h3>
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No jobs available at the moment.</p>
                  <p className="text-sm text-gray-400 mt-1">Check back later for new opportunities!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onApply={() => handleApply(job.id)}
                      hasApplied={userApplications.some(app => app.jobId === job.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'applications' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Applications</h3>
              {userApplications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">You haven't applied to any jobs yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Click on "Available Jobs" to start applying!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-lg">{application.jobTitle}</p>
                        <p className="text-sm text-gray-600 mt-1">Applied on {new Date(application.appliedDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500 mt-1">Applicant: {application.applicantName}</p>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'reviewed' || application.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'interview-scheduled' ? 'bg-purple-100 text-purple-800' :
                          application.status === 'hired' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'interviews' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Shortlisted & Interviews</h3>
              {shortlistedApplications === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No interviews scheduled yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Keep applying to jobs and you'll hear back soon!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userApplications
                    .filter(app => app.status === 'shortlisted' || app.status === 'interview-scheduled')
                    .map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-lg">{application.jobTitle}</p>
                          <p className="text-sm text-gray-600 mt-1">Applied on {new Date(application.appliedDate).toLocaleDateString()}</p>
                          <p className="text-sm text-purple-700 font-medium mt-2">
                            {application.status === 'interview-scheduled' ? '🎉 Interview Scheduled!' : '✨ Shortlisted'}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                            {application.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default JobSeekerDashboard;

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Briefcase,
  Users,
  ArrowLeft,
  CheckCircle,
  Building
} from 'lucide-react';

function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs, applications, applyToJob } = useUserContext();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const job = jobs.find(j => j.id === id);
  const hasApplied = applications.some(app => app.jobId === id);

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Job not found</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Go back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyToJob(job.id, coverLetter);
    setShowApplicationForm(false);
    setCoverLetter('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </button>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Job Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                <div className="flex items-center space-x-4 text-primary-100">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    {job.company}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {job.location}, {job.country}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  job.type === 'full-time' 
                    ? 'bg-white/20 text-white'
                    : job.type === 'part-time'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/20 text-white'
                }`}>
                  {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
                </span>
                {job.remote && (
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-white/20 text-white rounded-full text-sm">
                      Remote Available
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Job Meta Information */}
            <div className="grid md:grid-cols-4 gap-6 mb-8 p-6 bg-primary-50 rounded-lg">
              <div className="text-center">
                <DollarSign className="h-6 w-6 text-secondary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Salary</p>
                <p className="font-semibold text-gray-900">
                  {job.salary || 'Not specified'}
                </p>
              </div>
              <div className="text-center">
                <Calendar className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Posted</p>
                <p className="font-semibold text-gray-900">{job.postedDate}</p>
              </div>
              <div className="text-center">
                <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Applications</p>
                <p className="font-semibold text-gray-900">{job.applications || 0}</p>
              </div>
              <div className="text-center">
                <Briefcase className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {job.type.replace('-', ' ')}
                </p>
              </div>
            </div>

            {/* Application Status */}
            {hasApplied && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-green-800 font-medium">Application Submitted</p>
                  <p className="text-green-700 text-sm">Your application is being reviewed by the employer.</p>
                </div>
              </div>
            )}

            {/* Job Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span 
                    key={skill}
                    className="px-3 py-2 bg-primary-100 text-primary-800 rounded-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Apply Section */}
            <div className="border-t pt-6">
              {hasApplied ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">You have already applied to this position.</p>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
                  >
                    View My Applications
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Ready to take the next step in your career?
                  </p>
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg"
                  >
                    Apply Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Apply to {job.title}</h3>
                <p className="text-gray-600">at {job.company}</p>
              </div>
              <form onSubmit={handleApply} className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={8}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tell the employer why you're the perfect fit for this role..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Tip: Mention specific skills from the job requirements that match your experience.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Submit Application
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

export default JobDetailsPage;
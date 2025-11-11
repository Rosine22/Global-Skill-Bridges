import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { Application } from '../contexts/UserContext';
import { User, Star, Send, FileText,Download, MessageSquare } from 'lucide-react';
import { getApiUrl } from '../config/api';

interface ApplicationReviewModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (applicationId: string, status: Application['status']) => void;
  onSendMessage: (applicationId: string, message: string) => void;
}

const ApplicationReviewModal: React.FC<ApplicationReviewModalProps> = ({
  application,
  isOpen,
  onClose,
  onStatusUpdate,
  onSendMessage,
}) => {
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState({
    rating: 0,
    comments: '',
    decision: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const notify = useNotification();

  // Reset form when application changes
  useEffect(() => {
    if (isOpen && application) {
      setFeedback({
        rating: 0,
        comments: '',
        decision: ''
      });
      setMessage('');
      setUpdateSuccess(false);
      setIsUpdating(false);
    }
  }, [isOpen, application]);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{application.applicantName}</h2>
              <p className="text-gray-700 text-sm">Applied for {application.jobTitle}</p>
              <p className="text-xs text-gray-600 mt-1">Applied on {formatDate(application.appliedDate)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="mt-2">
            <p className="text-gray-600 text-xs">Complete application review with all details, documents, and decision controls</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Success Message */}
          {updateSuccess && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Application status updated successfully!</p>
            </div>
          )}

          {/* Complete Application View */}
          <div className="space-y-8">
            {/* Applicant Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white rounded-full p-4">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{application.applicantName}</h3>
                  <p className="text-gray-700">{application.applicantEmail || 'No email provided'}</p>
                  <div className="mt-3 flex items-center space-x-4">
                    <span className="text-gray-600 text-sm">Applied {formatDate(application.appliedDate)}</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      application.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      application.status === 'hired' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      Current Status: {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            {application.personalInfo && (
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <User className="h-6 w-6 mr-2 text-blue-600" />
                  Contact Information
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <p className="text-gray-900 bg-gray-50 rounded p-3">{application.applicantEmail || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <p className="text-gray-900 bg-gray-50 rounded p-3">{application.personalInfo.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">LinkedIn Profile</label>
                    {application.personalInfo.linkedIn ? (
                      <a 
                        href={application.personalInfo.linkedIn} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 bg-gray-50 rounded p-3 block"
                      >
                        {application.personalInfo.linkedIn}
                      </a>
                    ) : (
                      <p className="text-gray-500 bg-gray-50 rounded p-3">Not provided</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Personal Website</label>
                    {application.personalInfo.website ? (
                      <a 
                        href={application.personalInfo.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 bg-gray-50 rounded p-3 block"
                      >
                        {application.personalInfo.website}
                      </a>
                    ) : (
                      <p className="text-gray-500 bg-gray-50 rounded p-3">Not provided</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Available Start Date</label>
                    <p className="text-gray-900 bg-gray-50 rounded p-3">
                      {application.personalInfo.availableStartDate ? 
                        formatDate(application.personalInfo.availableStartDate) : 
                        'Not specified'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cover Letter */}
            {application.coverLetter && (
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-6 w-6 mr-2 text-green-600" />
                  Cover Letter
                </h4>
                <div className="bg-green-50 rounded-lg p-6">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {application.coverLetter}
                  </p>
                </div>
              </div>
            )}

            {/* Why Interested */}
            {application.whyInterested && (
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Why are you interested in this position?</h4>
                <div className="bg-blue-50 rounded-lg p-6">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {application.whyInterested}
                  </p>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {application.additionalNotes && (
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Additional Notes</h4>
                <div className="bg-yellow-50 rounded-lg p-6">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {application.additionalNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Salary Expectations */}
            {application.salaryExpectation && (
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="h-6 w-6 mr-2 text-yellow-600" />
                  Salary Expectations
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Expected Salary Range</label>
                    <p className="text-gray-900 bg-gray-50 rounded p-3 font-bold">
                      {application.salaryExpectation.currency} {application.salaryExpectation.min} - {application.salaryExpectation.max}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Negotiable</label>
                    <p className={`font-semibold rounded p-3 ${
                      application.salaryExpectation.isNegotiable 
                        ? 'text-green-800 bg-green-100' 
                        : 'text-red-800 bg-red-100'
                    }`}>
                      {application.salaryExpectation.isNegotiable ? 'Yes, open to negotiation' : 'Fixed, non-negotiable'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Resume/CV */}
            {application.resume ? (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Resume/CV
                </h4>
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{application.resume.fileName || 'Resume.pdf'}</p>
                      <p className="text-gray-600 text-xs">
                        {application.resume.fileSize ? `${(application.resume.fileSize / 1024 / 1024).toFixed(2)} MB • ` : ''}
                        {application.resume.uploadedAt ? `Uploaded ${formatDate(application.resume.uploadedAt)}` : 'Resume/CV'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
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
                            notify.error('CV preview URL not available');
                          }
                          } catch (error) {
                          console.error('Error fetching CV preview:', error);
                          notify.error('Failed to preview CV. Please try again.');
                        }
                      }}
                      className="flex items-center px-4 py-2 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-sm"
                    >
                      Preview CV
                    </button>
                    <button 
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
                            // Create a temporary link to download the file
                            const link = document.createElement('a');
                            link.href = data.data.downloadUrl;
                            link.download = data.data.fileName || 'resume.pdf';
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          } else {
                            notify.error('CV download URL not available');
                          }
                        } catch (error) {
                          console.error('Error downloading CV:', error);
                          notify.error('Failed to download CV. Please try again.');
                        }
                      }}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download CV
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm font-medium">No resume uploaded</p>
                <p className="text-gray-500 text-xs">The applicant didn't upload a resume/CV</p>
              </div>
            )}

            {/* Portfolio */}
            {application.portfolio && (
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-purple-600" />
                  Portfolio
                </h4>
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio URL</label>
                    <a 
                      href={application.portfolio.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 font-semibold text-xl"
                    >
                      {application.portfolio.url}
                    </a>
                  </div>
                  {application.portfolio.description && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <p className="text-gray-800 text-lg">{application.portfolio.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Documents */}
            {application.additionalDocuments && application.additionalDocuments.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-green-600" />
                  Additional Documents ({application.additionalDocuments.length} {application.additionalDocuments.length === 1 ? 'document' : 'documents'})
                </h4>
                <div className="grid gap-4">
                  {application.additionalDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <FileText className="h-10 w-10 text-green-600 mr-4" />
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{doc.name}</p>
                          <p className="text-gray-600 capitalize">
                            {doc.type} • Uploaded {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button className="flex items-center px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-100 font-medium">
                          View
                        </button>
                        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Screening Questions */}
            {application.screeningAnswers && application.screeningAnswers.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-6 w-6 mr-2 text-orange-600" />
                  Screening Questions ({application.screeningAnswers.length} {application.screeningAnswers.length === 1 ? 'question' : 'questions'})
                </h4>
                <div className="space-y-6">
                  {application.screeningAnswers.map((answer, index) => (
                    <div key={index} className="border-l-4 border-orange-500 bg-orange-50 rounded-r-lg p-6">
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-3 text-lg">Question {index + 1}</h5>
                        <p className="text-gray-800 bg-white rounded p-4 shadow-sm text-lg">{answer.question}</p>
                      </div>
                      <div>
                        <h6 className="font-semibold text-gray-900 mb-3 text-lg">Applicant's Answer</h6>
                        <div className="bg-orange-100 rounded p-4">
                          <p className="text-gray-900 font-medium text-lg">{answer.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RATING AND REVIEW SECTION - AT THE BOTTOM */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-3 border-purple-300 rounded-xl p-8 mt-12 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center">
                <Star className="h-8 w-8 mr-3 text-purple-600" />
                Application Review & Decision
              </h3>
              
              {/* Rating Section */}
              <div className="mb-8">
                <label className="block text-lg font-bold text-gray-900 mb-4 text-center">Rate This Candidate</label>
                <div className="flex items-center justify-center space-x-3 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                      className={`p-3 transition-all duration-200 hover:scale-125 ${feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                    >
                      <Star className="h-12 w-12 fill-current" />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm font-semibold text-gray-800">
                  {feedback.rating === 0 ? 'Click stars to rate this candidate' : 
                   feedback.rating === 1 ? '⭐ Poor fit for the role' :
                   feedback.rating === 2 ? '⭐⭐ Below average candidate' :
                   feedback.rating === 3 ? '⭐⭐⭐ Average candidate' :
                   feedback.rating === 4 ? '⭐⭐⭐⭐ Good candidate' :
                   '⭐⭐⭐⭐⭐ Excellent candidate'}
                </p>
              </div>

              {/* Internal Comments */}
              <div className="mb-8">
                <label className="block text-lg font-bold text-gray-900 mb-4">Internal Review Comments</label>
                <textarea
                  value={feedback.comments}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                  rows={5}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder="Add detailed feedback about the candidate's qualifications, experience, fit for the role, interview notes, strengths, areas of concern, etc..."
                />
                <p className="text-sm text-gray-600 mt-3">
                  These comments are confidential and for internal hiring team use only.
                </p>
              </div>

              {/* Status Update */}
              <div className="mb-8">
                <label className="block text-lg font-bold text-gray-900 mb-4">Update Application Status</label>
                <select
                  onChange={(e) => setFeedback(prev => ({ ...prev, decision: e.target.value }))}
                  value={feedback.decision}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium"
                >
                  <option value="">Select new status...</option>
                  <option value="reviewed">Mark as Reviewed</option>
                  <option value="shortlisted"> Shortlist Candidate</option>
                  <option value="interview-scheduled">Schedule Interview</option>
                  <option value="rejected"> Reject Application</option>
                  <option value="hired">Mark as Hired</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-6 mb-8">
                <button
                  onClick={onClose}
                  className="px-8 py-4 text-gray-700 border-2 border-gray-400 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                >
                  Cancel Review
                </button>
                <button
                  onClick={async () => {
                    if (feedback.decision) {
                      setIsUpdating(true);
                      try {
                        onStatusUpdate(application.id, feedback.decision as Application['status']);
                        console.log('Status updated:', application.id, feedback.decision, feedback.comments);
                        setUpdateSuccess(true);
                        
                        // Show success message briefly, then close
                        setTimeout(() => {
                          onClose();
                        }, 2000);
                      } catch (error) {
                        console.error('Error updating status:', error);
                      } finally {
                        setIsUpdating(false);
                      }
                    }
                  }}
                  disabled={!feedback.decision || isUpdating}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-xl"
                >
                  {isUpdating ? ' Updating Status...' : updateSuccess ? ' Status Updated!' : ' Update Application Status'}
                </button>
              </div>

              {/* Send Message Section */}
              <div className="pt-6 border-t-2 border-purple-200">
                <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                  Send Message to Applicant
                </h4>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message to the applicant..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                  <button
                    onClick={() => {
                      if (message.trim()) {
                        onSendMessage(application.id, message);
                        setMessage('');
                      }
                    }}
                    disabled={!message.trim()}
                    className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold text-sm"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Send Message
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  This message will be sent directly to the applicant's email address.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationReviewModal;
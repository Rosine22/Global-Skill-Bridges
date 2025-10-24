import { Link } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  Mail, 
  Phone, 
  FileText,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

function EmployerPendingApproval() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Pending Approval
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for submitting your company profile! We're reviewing your information.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium mb-4">
              <Clock className="h-4 w-4 mr-2" />
              Under Review
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your Profile is Being Reviewed
            </h2>
            <p className="text-gray-600">
              Our admin team is currently verifying your company information and documents.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Profile Submitted</p>
                <p className="text-sm text-gray-500">Your company profile has been successfully submitted</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100">
                  <RefreshCw className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Under Review</p>
                <p className="text-sm text-gray-500">Admin team is verifying your company details</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Email Notification</p>
                <p className="text-sm text-gray-400">You'll receive approval confirmation via email</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Account Activated</p>
                <p className="text-sm text-gray-400">Full access to post jobs and find talent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">What to Expect</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start">
              <Clock className="h-4 w-4 mt-0.5 mr-3 text-blue-600" />
              <div>
                <p className="font-medium">Review Timeline</p>
                <p>Our team typically reviews profiles within 2-3 business days</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FileText className="h-4 w-4 mt-0.5 mr-3 text-blue-600" />
              <div>
                <p className="font-medium">Verification Process</p>
                <p>We verify company registration, contact details, and business legitimacy</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="h-4 w-4 mt-0.5 mr-3 text-blue-600" />
              <div>
                <p className="font-medium">Email Updates</p>
                <p>You'll receive notifications about your approval status and next steps</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Email Support</p>
                <p className="text-gray-600">support@globalskillsbridge.com</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Phone Support</p>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Status
          </button>
        </div>

        {/* Additional Information */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Questions about the approval process? 
            <a href="mailto:support@globalskillsbridge.com" className="text-primary-600 hover:text-primary-700 ml-1">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmployerPendingApproval;

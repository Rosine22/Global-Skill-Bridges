import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext, type EmployerProfile } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2,
  Mail,
  MapPin,
  Eye,
  Search,
  Shield,
  AlertCircle
} from 'lucide-react';

function AdminEmployerApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { employerProfiles, updateEmployerApprovalStatus } = useUserContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedEmployer, setSelectedEmployer] = useState<EmployerProfile | null>(null);
  const [showModal, setShowModal] = useState(false);


  // Check if user is admin
  useEffect(() => {
    if (!user) {
      // Not logged in, redirect to login
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin' && user.role !== 'rtb-admin') {
      // Not an admin, redirect to admin login
      navigate('/admin/login');
      return;
    }
  }, [user, navigate]);

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not admin
  if (user.role !== 'admin' && user.role !== 'rtb-admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You need administrator privileges to access this page.
          </p>
          <button
            onClick={() => navigate('/admin/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Admin Login
          </button>
        </div>
      </div>
    );
  }

  // Filter employers based on search term and status
  const filteredEmployers = employerProfiles.filter((employer) => {
    const matchesSearch = employer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employer.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'pending' 
      ? employer.status === 'pending' 
      : activeTab === 'approved' 
      ? employer.status === 'approved'
      : employer.status === 'rejected';
    return matchesSearch && matchesTab;
  });

  const pendingCount = employerProfiles.filter(e => e.status === 'pending').length;
  const approvedCount = employerProfiles.filter(e => e.status === 'approved').length;
  const rejectedCount = employerProfiles.filter(e => e.status === 'rejected').length;

  const handleApprove = async (employerId: string) => {
    updateEmployerApprovalStatus(employerId, 'approved');
    alert('Employer approved successfully! They will receive an email notification.');
    setShowModal(false);
  };

  const handleReject = async (employerId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    updateEmployerApprovalStatus(employerId, 'rejected', reason || undefined);
    alert(`Employer rejected. ${reason ? `Reason: ${reason}` : 'No reason provided.'}`);
    setShowModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employer Approvals</h1>
              <p className="text-gray-600 text-sm mt-1">Review and manage employer registrations</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Back to Home
              </button>
              <button
                onClick={() => { if (window.confirm('Are you sure you want to logout?')) { logout(); navigate('/admin/login'); } }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Pending Approvals
                  <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {pendingCount}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'approved'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Approved Employers
                  <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {approvedCount}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'rejected'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Rejected Employers
                  <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rejectedCount}
                  </span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by company name, email, or industry..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Employer Cards Grid */}
        {filteredEmployers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab === 'pending' ? 'pending' : activeTab === 'approved' ? 'approved' : 'rejected'} employers found
            </h3>
            <p className="text-gray-500">
              {employerProfiles.length === 0 
                ? "No employer applications have been submitted yet."
                : `No ${activeTab === 'pending' ? 'pending applications' : activeTab === 'approved' ? 'approved employers' : 'rejected employers'} match your search criteria.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployers.map((employer) => (
              <div 
                key={employer.id} 
                className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => {
                  setSelectedEmployer(employer);
                  setShowModal(true);
                }}
              >
                <div className="p-6">
                  {/* Logo and Company Name */}
                  <div className="flex items-start mb-4">
                    {employer.companyLogo ? (
                      <img 
                        src={employer.companyLogo} 
                        alt={`${employer.companyName} logo`}
                        className="h-14 w-14 rounded-lg object-cover border-2 border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold border-2 border-gray-200 flex-shrink-0">
                        {employer.companyName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="ml-4 flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {employer.companyName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{employer.industry}</p>
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{employer.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{employer.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{employer.companySize}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {getStatusBadge(employer.status)}
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                      View Details
                      <Eye className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for employer details */}
      {showModal && selectedEmployer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedEmployer.companyLogo ? (
                    <img 
                      src={selectedEmployer.companyLogo} 
                      alt={`${selectedEmployer.companyName} logo`}
                      className="h-16 w-16 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-200 shadow-sm">
                      {selectedEmployer.companyName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEmployer.companyName}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" />
                      {selectedEmployer.industry}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Company Logo and Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Company Information
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                  {selectedEmployer.companyLogo ? (
                    <div>
                      <img 
                        src={selectedEmployer.companyLogo} 
                        alt={`${selectedEmployer.companyName} logo`}
                        className="h-32 w-32 rounded-lg object-cover border-2 border-gray-300 shadow-md hover:shadow-lg transition-shadow"
                        onError={(e) => {
                          console.error('Image failed to load!', selectedEmployer.companyLogo);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-green-600 mt-2 font-medium">✓ Logo uploaded</p>
                    </div>
                  ) : (
                    <div>
                      <div className="h-32 w-32 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold border-2 border-gray-300 shadow-md">
                        {selectedEmployer.companyName.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 italic">No logo uploaded</p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.companyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Industry</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.industry}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Size</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.companySize}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Founded</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.founded}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <a href={selectedEmployer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {selectedEmployer.website}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.companyRegistration}</p>
                  </div>
                </div>
                
                {selectedEmployer.description && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.description}</p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.contactPerson}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.location}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedEmployer.address}, {selectedEmployer.city}, {selectedEmployer.country} {selectedEmployer.postalCode}
                  </p>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.taxId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remote Policy</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedEmployer.remotePolicy}</p>
                  </div>
                </div>
                
                {selectedEmployer.linkedinProfile && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">LinkedIn Profile</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <a href={selectedEmployer.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {selectedEmployer.linkedinProfile}
                      </a>
                    </p>
                  </div>
                )}
                
                {selectedEmployer.benefits && selectedEmployer.benefits.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Benefits</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedEmployer.benefits.map((benefit, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedEmployer.workCulture && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Work Culture</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.workCulture}</p>
                  </div>
                )}
              </div>

              {/* Application Status and Actions */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      {getStatusBadge(selectedEmployer.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Applied on: {formatDate(selectedEmployer.createdAt)}
                    </p>
                    {selectedEmployer.updatedAt && selectedEmployer.updatedAt !== selectedEmployer.createdAt && (
                      <p className="text-sm text-gray-600">
                        Last updated: {formatDate(selectedEmployer.updatedAt)}
                      </p>
                    )}
                  </div>
                  
                  {selectedEmployer.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedEmployer.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        Approve Application
                      </button>
                      <button
                        onClick={() => handleReject(selectedEmployer.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                      >
                        Reject Application
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEmployerApproval;

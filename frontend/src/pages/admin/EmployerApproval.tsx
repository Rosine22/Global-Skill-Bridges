import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import PromptDialog from '../../components/PromptDialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from '../../config/api';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2,
  Mail,
  MapPin,
  Search,
  Shield,
  AlertCircle
} from 'lucide-react';

type BackendEmployer = {
  _id: string;
  name: string; 
  email: string;
  phone?: string;
  role: string;
  isApproved: boolean;
  isActive: boolean;
  isEmailVerified?: boolean;
  profileCompletion?: number;
  createdAt: string;
  updatedAt?: string;
  approvalDate?: string;
  approvedBy?: {
    _id: string;
    name?: string;
    email?: string;
  };
  avatar?: {
    url?: string;
    public_id?: string;
  };
  companyInfo?: {
    name?: string;
    industry?: string;
    size?: string;
    website?: string;
    description?: string;
    registrationNumber?: string;
    establishedYear?: number;
    taxId?: string;
    remotePolicy?: string;
    logo?: {
      url?: string;
      public_id?: string;
    };
  };
  location?: {
    city?: string;
    country?: string;
    address?: string;
  };
  adminNotes?: Array<{ 
    note: string; 
    addedAt: string; 
    addedBy: string | { _id: string; name?: string; email?: string };
  }>;
  stats?: {
    jobsPosted?: number;
    profileViews?: number;
  };
};

function AdminEmployerApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [pendingEmployers, setPendingEmployers] = useState<BackendEmployer[]>([]);
  const [approvedEmployers, setApprovedEmployers] = useState<BackendEmployer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<BackendEmployer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [promptOpen, setPromptOpen] = useState(false);
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);


  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin' && user.role !== 'rtb-admin') {
      navigate('/admin/login');
      return;
    }
  }, [user, navigate]);

  const fetchEmployers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();

      // Fetch pending employers
      const pendingRes = await fetch(getApiUrl(`${API_ENDPOINTS.ADMIN}/employers/pending`), { headers });
      if (!pendingRes.ok) {
        const errorText = await pendingRes.text();
        throw new Error(`Failed to load pending employers: ${errorText}`);
      }
      const pendingJson = await pendingRes.json();
      console.log('Pending employers response:', pendingJson);
      setPendingEmployers(pendingJson.data || []);

      // Fetch approved employers
      const approvedRes = await fetch(getApiUrl(`${API_ENDPOINTS.ADMIN}/employers?isApproved=true`), { headers });
      if (!approvedRes.ok) {
        const errorText = await approvedRes.text();
        throw new Error(`Failed to load approved employers: ${errorText}`);
      }
      const approvedJson = await approvedRes.json();
      console.log('Approved employers response:', approvedJson);
      setApprovedEmployers(approvedJson.data || []);

      // Log summary
      console.log(`Successfully loaded ${pendingJson.data?.length || 0} pending and ${approvedJson.data?.length || 0} approved employers`);
    } catch (e: unknown) {
      console.error('Error fetching employers', e);
      const msg = e instanceof Error ? e.message : 'Failed to load employers';
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'rtb-admin')) {
      fetchEmployers();
    }
  }, [user, fetchEmployers]);

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

  const listForTab = activeTab === 'pending' ? pendingEmployers : approvedEmployers;
  const term = searchTerm.toLowerCase();
  const currentEmployers = listForTab.filter((e) => {
    const company = e.companyInfo?.name?.toLowerCase() || '';
    const email = e.email?.toLowerCase() || '';
    const industry = e.companyInfo?.industry?.toLowerCase() || '';
    return company.includes(term) || email.includes(term) || industry.includes(term);
  });

  const pendingCount = pendingEmployers.length;
  const approvedCount = approvedEmployers.length;

  const handleApprove = async (employerId: string) => {
    try {
      setLoading(true);
      const headers = {
        ...getAuthHeaders(),
      };
      const res = await fetch(getApiUrl(`${API_ENDPOINTS.ADMIN}/employers/${employerId}/approve`), {
        method: 'PUT',
        headers,
        body: JSON.stringify({ approve: true })
      });
      if (!res.ok) throw new Error('Failed to approve employer');
      await fetchEmployers();
      setShowModal(false);
    } catch (e) {
      console.error(e);
      notify.error('Failed to approve employer.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = (employerId: string) => {
    setPendingRejectId(employerId);
    setPromptOpen(true);
  };

  const submitReject = async (notes: string) => {
    if (!pendingRejectId) return;
    try {
      setLoading(true);
      const headers = {
        ...getAuthHeaders(),
      };
      const res = await fetch(getApiUrl(`${API_ENDPOINTS.ADMIN}/employers/${pendingRejectId}/approve`), {
        method: 'PUT',
        headers,
        body: JSON.stringify({ approve: false, notes })
      });
      if (!res.ok) throw new Error('Failed to reject employer');
      await fetchEmployers();
      setShowModal(false);
      notify.success('Employer rejected successfully');
    } catch (e) {
      console.error(e);
      notify.error('Failed to reject employer.');
    } finally {
      setLoading(false);
      setPendingRejectId(null);
      setPromptOpen(false);
    }
  };

  const getStatusBadge = (status: 'pending' | 'approved') => {
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
                onClick={() => {
                  setConfirmMessage('Are you sure you want to logout?');
                  setConfirmAction(() => () => { logout(); navigate('/admin/login'); });
                  setConfirmOpen(true);
                }}
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

        {error && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        {/* Employer Cards Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <p className="text-gray-600">Loading employers...</p>
          </div>
        ) : currentEmployers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab === 'pending' ? 'pending' : 'approved'} employers found
            </h3>
            <p className="text-gray-500">
              {activeTab === 'pending' ? 'No employer applications are pending review.' : 'No approved employers found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentEmployers.map((employer) => (
              <div 
                key={employer._id} 
                className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => {
                  setSelectedEmployer(employer);
                  setShowModal(true);
                }}
              >
                <div className="p-6">
                  {/* Logo and Company Name */}
                  <div className="flex items-start mb-4">
                    <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold border-2 border-gray-200 flex-shrink-0 overflow-hidden">
                      {(employer.companyInfo?.logo?.url || employer.avatar?.url) ? (
                        <img 
                          src={employer.companyInfo?.logo?.url || employer.avatar?.url} 
                          alt={employer.companyInfo?.name || 'Company logo'} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.textContent = (employer.companyInfo?.name || 'E')[0]?.toUpperCase();
                          }}
                        />
                      ) : (
                        (employer.companyInfo?.name || 'E')[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {employer.companyInfo?.name || 'Unknown Company'}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{employer.companyInfo?.industry || 'Industry not set'}</p>
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{[employer.location?.city, employer.location?.country].filter(Boolean).join(', ') || 'Location not set'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{employer.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{employer.companyInfo?.size || 'Size not set'}</span>
                    </div>
                    {employer.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0">📞</span>
                        <span className="truncate">{employer.phone}</span>
                      </div>
                    )}
                    {employer.companyInfo?.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0">🌐</span>
                        <span className="truncate">{employer.companyInfo.website}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge and Additional Info */}
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(activeTab)}
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                        View Details
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Applied: {formatDate(employer.createdAt)}</span>
                      {employer.isEmailVerified && (
                        <span className="text-green-600 font-medium">✓ Email Verified</span>
                      )}
                    </div>
                    {employer.profileCompletion !== undefined && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${employer.profileCompletion}%` }}
                        ></div>
                      </div>
                    )}
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
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-200 shadow-sm overflow-hidden">
                    {(selectedEmployer.companyInfo?.logo?.url || selectedEmployer.avatar?.url) ? (
                      <img 
                        src={selectedEmployer.companyInfo?.logo?.url || selectedEmployer.avatar?.url} 
                        alt={selectedEmployer.companyInfo?.name || 'Company logo'} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.textContent = (selectedEmployer.companyInfo?.name || 'E')[0]?.toUpperCase();
                        }}
                      />
                    ) : (
                      (selectedEmployer.companyInfo?.name || 'E')[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEmployer.companyInfo?.name || 'Unknown Company'}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" />
                      {selectedEmployer.companyInfo?.industry || 'Industry not set'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.companyInfo?.name || 'Unknown Company'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Industry</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.companyInfo?.industry || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Size</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.companyInfo?.size || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Founded</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.companyInfo?.establishedYear || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <a href={selectedEmployer.companyInfo?.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {selectedEmployer.companyInfo?.website || 'Not set'}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.companyInfo?.registrationNumber || 'Not set'}</p>
                  </div>
                </div>
                {selectedEmployer.companyInfo?.description && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.companyInfo.description}</p>
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
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">{[selectedEmployer.location?.address, selectedEmployer.location?.city, selectedEmployer.location?.country].filter(Boolean).join(', ') || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployer.companyInfo?.taxId || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remote Policy</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedEmployer.companyInfo?.remotePolicy || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Verified</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedEmployer.isEmailVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedEmployer.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profile Completion</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${selectedEmployer.profileCompletion || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{selectedEmployer.profileCompletion || 0}%</span>
                      </div>
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedEmployer.adminNotes && selectedEmployer.adminNotes.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Notes</h3>
                  <div className="space-y-3">
                    {selectedEmployer.adminNotes.map((note, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                        <p className="text-sm text-gray-900 mb-2">{note.note}</p>
                            <p className="text-xs text-gray-500">
                              Added on {formatDate(note.addedAt)} by {typeof note.addedBy === 'string' ? note.addedBy : (note.addedBy?.name || note.addedBy?.email || note.addedBy?._id)}
                            </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Status and Actions */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      {getStatusBadge(pendingEmployers.find(e => e._id === selectedEmployer._id) ? 'pending' : 'approved')}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Applied on: {formatDate(selectedEmployer.createdAt)}
                      </p>
                      {selectedEmployer.updatedAt && selectedEmployer.updatedAt !== selectedEmployer.createdAt && (
                        <p className="text-sm text-gray-600">
                          Last updated: {formatDate(selectedEmployer.updatedAt)}
                        </p>
                      )}
                      {selectedEmployer.approvalDate && (
                        <p className="text-sm text-green-600 font-medium">
                          Approved on: {formatDate(selectedEmployer.approvalDate)}
                        </p>
                      )}
                      {selectedEmployer.approvedBy && (
                        <p className="text-sm text-gray-600">
                          Approved by: {selectedEmployer.approvedBy.name || selectedEmployer.approvedBy.email}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {pendingEmployers.find(e => e._id === selectedEmployer._id) && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedEmployer._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        Approve Application
                      </button>
                      <button
                        onClick={() => handleReject(selectedEmployer._id)}
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

      {/* Confirm and Prompt dialogs */}
      <ConfirmDialog
        open={confirmOpen}
        message={confirmMessage}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          try {
            confirmAction();
          } catch (e) {
            console.error(e);
          }
        }}
      />

      <PromptDialog
        open={promptOpen}
        title="Reason for rejection (optional)"
        defaultValue={''}
        onCancel={() => { setPromptOpen(false); setPendingRejectId(null); }}
        onSubmit={(value) => submitReject(value)}
      />
    </div>
  );
}

export default AdminEmployerApproval;

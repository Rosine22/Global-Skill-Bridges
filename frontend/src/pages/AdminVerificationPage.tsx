import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Award, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Download,
  User,
  FileText,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  skill: string;
  level: 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  certificate?: string;
  notes?: string;
  evidence: string[];
}

function AdminVerificationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Mock verification requests
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([
    {
      id: '1',
      userId: '1',
      userName: 'John Mukamana',
      userEmail: 'john@example.com',
      skill: 'JavaScript Programming',
      level: 'Advanced',
      status: 'pending',
      submittedDate: '2024-01-20',
      certificate: 'javascript-cert.pdf',
      evidence: ['Portfolio website', 'GitHub projects', 'Certification'],
      notes: 'Submitted comprehensive portfolio with multiple React projects.'
    },
    {
      id: '2',
      userId: '2',
      userName: 'Marie Uwimana',
      userEmail: 'marie@example.com',
      skill: 'Electrical Circuit Design',
      level: 'Intermediate',
      status: 'pending',
      submittedDate: '2024-01-19',
      evidence: ['Technical drawings', 'Project documentation'],
      notes: 'Provided detailed circuit schematics and project reports.'
    },
    {
      id: '3',
      userId: '3',
      userName: 'David Nzeyimana',
      userEmail: 'david@example.com',
      skill: 'Engine Diagnostics',
      level: 'Expert',
      status: 'approved',
      submittedDate: '2024-01-18',
      reviewedDate: '2024-01-19',
      reviewedBy: 'Admin User',
      certificate: 'engine-diagnostics-cert.pdf',
      evidence: ['Industry certification', 'Work experience', 'Training records'],
      notes: 'Excellent credentials with 5+ years experience and multiple certifications.'
    },
    {
      id: '4',
      userId: '4',
      userName: 'Grace Mukamana',
      userEmail: 'grace@example.com',
      skill: 'Database Management',
      level: 'Basic',
      status: 'rejected',
      submittedDate: '2024-01-17',
      reviewedDate: '2024-01-18',
      reviewedBy: 'Admin User',
      evidence: ['Course completion'],
      notes: 'Insufficient practical experience. Recommend completing additional projects.'
    },
    {
      id: '5',
      userId: '5',
      userName: 'Patrick Habimana',
      userEmail: 'patrick@example.com',
      skill: 'Project Management',
      level: 'Intermediate',
      status: 'pending',
      submittedDate: '2024-01-16',
      certificate: 'pmp-cert.pdf',
      evidence: ['PMP certification', 'Project portfolio', 'References'],
      notes: 'Strong project management background with certified credentials.'
    }
  ]);

  const filteredRequests = verificationRequests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.skill.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesLevel = !levelFilter || request.level === levelFilter;
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const handleVerificationAction = (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    setVerificationRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewedDate: new Date().toISOString().split('T')[0],
            reviewedBy: 'Current Admin',
            notes: notes || request.notes
          }
        : request
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'bg-purple-100 text-purple-800';
      case 'Advanced':
        return 'bg-blue-100 text-blue-800';
      case 'Intermediate':
        return 'bg-green-100 text-green-800';
      case 'Basic':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      title: 'Total Requests',
      value: verificationRequests.length,
      color: 'text-primary-600'
    },
    {
      title: 'Pending Review',
      value: verificationRequests.filter(r => r.status === 'pending').length,
      color: 'text-yellow-600'
    },
    {
      title: 'Approved',
      value: verificationRequests.filter(r => r.status === 'approved').length,
      color: 'text-green-600'
    },
    {
      title: 'Rejected',
      value: verificationRequests.filter(r => r.status === 'rejected').length,
      color: 'text-red-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Skills Verification</h1>
            <p className="text-gray-600">Review and approve skills verification requests</p>
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
                    placeholder="Search by user name or skill..."
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
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Levels</option>
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>
          </div>

          {/* Verification Requests List */}
          <div className="p-6">
            {filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">{request.userName}</h3>
                          <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(request.level)}`}>
                            {request.level}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Email:</strong> {request.userEmail}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Skill:</strong> {request.skill}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Submitted:</strong> {request.submittedDate}
                            </p>
                            {request.reviewedDate && (
                              <p className="text-sm text-gray-600">
                                <strong>Reviewed:</strong> {request.reviewedDate} by {request.reviewedBy}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Evidence Provided:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {request.evidence.map((item, index) => (
                                <li key={index} className="flex items-center">
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                            {request.certificate && (
                              <div className="mt-2">
                                <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download Certificate
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {request.notes && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                            <p className="text-sm text-gray-600">{request.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        Request ID: {request.id} • User ID: {request.userId}
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 p-1" title="View details">
                          <Eye className="h-4 w-4" />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVerificationAction(request.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerificationAction(request.id, 'reject', 'Requires additional evidence')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No verification requests found</p>
                <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Verification Guidelines */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Verification Guidelines</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Approval Criteria</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Valid certificates or credentials from recognized institutions
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Demonstrated practical experience through portfolios or projects
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Professional references or work history validation
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Skill level matches claimed proficiency
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Rejection Reasons</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Insufficient or invalid documentation
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Claimed skill level doesn't match evidence
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Fraudulent or falsified credentials
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Incomplete application or missing requirements
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminVerificationPage;
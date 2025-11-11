import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Users, Search, UserCheck, UserX, CreditCard as Edit3, Trash2, Plus, Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'job-seeker' | 'employer' | 'mentor' | 'admin' | 'rtb-admin';
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastLogin: string;
  profileCompletion: number;
  verified: boolean;
  location: string;
}

function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [, setShowUserForm] = useState(false);

  // Mock users data
  const users: AdminUser[] = [
    {
      id: '1',
      name: 'John Mukamana',
      email: 'john@example.com',
      role: 'job-seeker',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-01-20',
      profileCompletion: 95,
      verified: true,
      location: 'Kigali, Rwanda'
    },
    {
      id: '2',
      name: 'TechCorp International',
      email: 'employer@company.com',
      role: 'employer',
      status: 'active',
      joinDate: '2024-01-10',
      lastLogin: '2024-01-19',
      profileCompletion: 100,
      verified: true,
      location: 'Toronto, Canada'
    },
    {
      id: '3',
      name: 'Sarah Uwimana',
      email: 'mentor@example.com',
      role: 'mentor',
      status: 'active',
      joinDate: '2024-01-05',
      lastLogin: '2024-01-20',
      profileCompletion: 90,
      verified: true,
      location: 'Toronto, Canada'
    },
    {
      id: '4',
      name: 'Marie Uwimana',
      email: 'marie@example.com',
      role: 'job-seeker',
      status: 'pending',
      joinDate: '2024-01-18',
      lastLogin: '2024-01-18',
      profileCompletion: 60,
      verified: false,
      location: 'Kigali, Rwanda'
    },
    {
      id: '5',
      name: 'Suspended User',
      email: 'suspended@example.com',
      role: 'job-seeker',
      status: 'suspended',
      joinDate: '2024-01-01',
      lastLogin: '2024-01-12',
      profileCompletion: 45,
      verified: false,
      location: 'Kigali, Rwanda'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'suspended':
        return <UserX className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'job-seeker':
        return 'bg-blue-100 text-blue-800';
      case 'employer':
        return 'bg-purple-100 text-purple-800';
      case 'mentor':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'rtb-admin':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUserAction = (userId: string, action: 'activate' | 'suspend' | 'delete' | 'verify') => {
    console.log(`${action} user ${userId}`);
  };

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      color: 'text-primary-600'
    },
    {
      title: 'Active Users',
      value: users.filter(u => u.status === 'active').length,
      color: 'text-green-600'
    },
    {
      title: 'Pending Verification',
      value: users.filter(u => u.status === 'pending').length,
      color: 'text-yellow-600'
    },
    {
      title: 'Suspended',
      value: users.filter(u => u.status === 'suspended').length,
      color: 'text-red-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage platform users and their access</p>
          </div>
          <button
            onClick={() => setShowUserForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
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
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Roles</option>
                  <option value="job-seeker">Job Seekers</option>
                  <option value="employer">Employers</option>
                  <option value="mentor">Mentors</option>
                  <option value="admin">Admins</option>
                  <option value="rtb-admin">RTB Admins</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {user.name}
                            {user.verified && (
                              <Shield className="h-4 w-4 text-green-500 ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1 capitalize">{user.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.profileCompletion}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${user.profileCompletion}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleUserAction(user.id, 'verify')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user.id, 'activate')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleUserAction(user.id, 'delete')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No users found</p>
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminUsersPage;

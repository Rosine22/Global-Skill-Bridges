import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  isApproved: boolean;
  createdAt: string;
}

function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalJobs: 0,
    pendingJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersResponse, jobsResponse] = await Promise.all([
          fetch('/api/admin/users', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          fetch('/api/admin/jobs', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const usersArray = usersData.users || usersData || [];
          setUsers(usersArray);
          
          const pendingUsers = usersArray.filter((u: User) => !u.isApproved).length;
          setStats(prev => ({
            ...prev,
            totalUsers: usersArray.length,
            pendingUsers
          }));
        }

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          const jobsArray = jobsData.jobs || jobsData || [];
          console.log('Jobs data received:', jobsArray); // Debug log
          console.log('First job createdAt:', jobsArray[0]?.createdAt); // Debug log
          setJobs(jobsArray);
          
          const pendingJobs = jobsArray.filter((j: Job) => !j.isApproved).length;
          setStats(prev => ({
            ...prev,
            totalJobs: jobsArray.length,
            pendingJobs
          }));
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleUserApproval = async (userId: string, approve: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ approve })
      });

      if (response.ok) {
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isApproved: approve } : u
        ));
        setStats(prev => ({
          ...prev,
          pendingUsers: approve ? prev.pendingUsers - 1 : prev.pendingUsers + 1
        }));
      }
    } catch (error) {
      console.error('Error updating user approval:', error);
    }
  };

  // Removed unused navigation variable

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome back, {user?.name}! Here's your platform overview.
            </p>
          </div>
          <a
            href="/admin/employer-approvals"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Employer Verification
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{stats.totalUsers}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{stats.pendingUsers}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pendingUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{stats.totalJobs}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalJobs}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{stats.pendingJobs}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Jobs</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pendingJobs}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users Pending Approval */}
        {stats.pendingUsers > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Users Pending Approval</h3>
              <div className="space-y-3">
                {users.filter(u => !u.isApproved).slice(0, 5).map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email} • {user.role}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUserApproval(user._id, true)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUserApproval(user._id, false)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <a
                  href="/admin/users"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  View all users →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Recent Jobs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Job Postings</h3>
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                {/* <p className="text-gray-500">No job postings yet.</p> */}
              </div>
            ) : (
              <div className="space-y-3">
                {jobs
                  .slice()
                  .sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                  })
                  .slice(0, 2)
                  .map((job) => (
                  <div key={job._id} className={`flex items-center justify-between p-3 rounded-lg ${
                    job.isApproved ? 'bg-green-50' : 'bg-yellow-50'
                  }`}>
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        job.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {job.isApproved ? 'Approved' : 'Pending'}
                      </span>
                      {!job.isApproved && (
                        <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <a
                href="/admin/jobs"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                View all jobs →
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;

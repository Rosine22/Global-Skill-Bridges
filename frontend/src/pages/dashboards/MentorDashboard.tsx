import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserContext } from '../../contexts/UserContext';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users,
  MessageCircle,
  Calendar,
  Award,
  Clock,
  CheckCircle,
  User,
  Star
} from 'lucide-react';

function MentorDashboard() {
  const { user } = useAuth();
  const { mentorshipRequests, updateMentorshipStatus } = useUserContext();

  // Filter mentorship requests for this mentor
  const mentorRequests = mentorshipRequests.filter(req => req.mentorId === user?.id);

  const stats = [
    {
      title: 'Active Mentees',
      value: mentorRequests.filter(req => req.status === 'accepted').length,
      change: '+2 this month',
      icon: Users,
      color: 'text-primary-600'
    },
    {
      title: 'Pending Requests',
      value: mentorRequests.filter(req => req.status === 'pending').length,
      change: '3 new today',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Sessions This Month',
      value: 12,
      change: '+4 from last month',
      icon: Calendar,
      color: 'text-secondary-600'
    },
    {
      title: 'Mentorship Rating',
      value: '4.9',
      change: '12 reviews',
      icon: Star,
      color: 'text-purple-600'
    }
  ];

  const handleRequestResponse = (requestId: string, status: 'accepted' | 'declined') => {
    updateMentorshipStatus(requestId, status);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-700 to-secondary-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-primary-100 mb-4">
            Help shape the next generation of TVET professionals. You have {mentorRequests.filter(req => req.status === 'pending').length} pending mentorship requests.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mentorship Requests */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Mentorship Requests</h2>
          </div>
          <div className="p-6">
            {mentorRequests.length > 0 ? (
              <div className="space-y-4">
                {mentorRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <h3 className="font-semibold text-gray-900">{request.seekerName}</h3>
                          <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : request.status === 'declined'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">
                          <strong>Field:</strong> {request.field}
                        </p>
                        <p className="text-gray-600 mb-3">{request.message}</p>
                        <p className="text-sm text-gray-500">Requested on {request.requestDate}</p>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRequestResponse(request.id, 'accepted')}
                            className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRequestResponse(request.id, 'declined')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {request.status === 'accepted' && (
                        <div className="flex space-x-2">
                          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </button>
                          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No mentorship requests yet</p>
                <p className="text-sm text-gray-400">
                  Job seekers will be able to request mentorship from you based on your expertise.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="h-6 w-6 text-primary-600 mb-2" />
                <h3 className="font-medium text-gray-900">Schedule Session</h3>
                <p className="text-sm text-gray-600">Book time with your mentees</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageCircle className="h-6 w-6 text-secondary-600 mb-2" />
                <h3 className="font-medium text-gray-900">Send Message</h3>
                <p className="text-sm text-gray-600">Reach out to your mentees</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Award className="h-6 w-6 text-purple-600 mb-2" />
                <h3 className="font-medium text-gray-900">Update Profile</h3>
                <p className="text-sm text-gray-600">Keep your expertise current</p>
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Mock upcoming sessions */}
              <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Career Planning Session</h3>
                  <p className="text-sm text-gray-600">with John Mukamana</p>
                  <p className="text-sm text-primary-600">Tomorrow, 2:00 PM - 3:00 PM</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Join
                  </button>
                  <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MentorDashboard;
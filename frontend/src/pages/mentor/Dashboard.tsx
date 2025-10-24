import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserContext } from '../../contexts/UserContext';
import DashboardLayout from '../../components/DashboardLayout';
import CalendarIntegration from '../../components/CalendarIntegration';
import { 
  Users,
  MessageCircle,
  Calendar,
  Award,
  Clock,
  User,
  Star
} from 'lucide-react';

function MentorDashboard() {
  const { user } = useAuth();
  const { mentorshipRequests, updateMentorshipStatus, getMentorSessions, updateSessionStatus } = useUserContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar'>('overview');
  const [sessionFilter, setSessionFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  // Filter mentorship requests for this mentor
  const mentorRequests = mentorshipRequests.filter(req => req.mentorId === user?.id);
  
  // Get mentor's sessions
  const mentorSessions = getMentorSessions(user?.id || '1');
  
  // Filter sessions based on selected filter
  const now = new Date();
  const upcomingSessions = mentorSessions.filter(session => {
    const sessionDate = new Date(session.date + 'T' + session.time);
    return sessionDate > now && ['pending', 'confirmed'].includes(session.status);
  });
  
  const pastSessions = mentorSessions.filter(session => {
    const sessionDate = new Date(session.date + 'T' + session.time);
    return sessionDate <= now || ['completed', 'cancelled'].includes(session.status);
  });

  const getFilteredSessions = () => {
    switch (sessionFilter) {
      case 'upcoming':
        return upcomingSessions;
      case 'past':
        return pastSessions;
      case 'all':
        return mentorSessions;
      default:
        return upcomingSessions;
    }
  };

  const filteredSessions = getFilteredSessions();

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
      value: upcomingSessions.length + pastSessions.filter(s => {
        const sessionMonth = new Date(s.date).getMonth();
        const currentMonth = new Date().getMonth();
        return sessionMonth === currentMonth;
      }).length,
      change: `${upcomingSessions.length} upcoming`,
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

    const handleJoinMeeting = (sessionId: string, meetingLink?: string) => {
    // In a real implementation, you would:
    // 1. Get the session details including meeting link using sessionId
    // 2. Open the meeting link in a new tab/window
    
    // For now, just open a generic meeting URL or show a placeholder
    const url = meetingLink || 'https://meet.google.com/new';
    console.log('Joining meeting for session:', sessionId);
    window.open(url, '_blank');
  };

  const handleRescheduleSession = (sessionId: string) => {
    // In a real app, this would open a reschedule modal
    const confirmed = confirm('Are you sure you want to reschedule this session? This will notify the mentee.');
    if (confirmed) {
      updateSessionStatus(sessionId, 'pending');
      alert('Session has been marked for rescheduling. The mentee will be notified.');
    }
  };

  const handleConfirmSession = (sessionId: string) => {
    updateSessionStatus(sessionId, 'confirmed');
    console.log('Session confirmed:', sessionId);
  };

  const handleDeclineSession = (sessionId: string) => {
    const confirmed = confirm('Are you sure you want to decline this session? The mentee will be notified.');
    if (confirmed) {
      updateSessionStatus(sessionId, 'declined');
      console.log('Session declined:', sessionId);
    }
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mentorship Overview
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'calendar'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar Integration
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
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

        {/* Booked Sessions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Sessions</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSessionFilter('upcoming')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    sessionFilter === 'upcoming'
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Upcoming ({upcomingSessions.length})
                </button>
                <button
                  onClick={() => setSessionFilter('past')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    sessionFilter === 'past'
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Past ({pastSessions.length})
                </button>
                <button
                  onClick={() => setSessionFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    sessionFilter === 'all'
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  All ({mentorSessions.length})
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => {
                  const sessionDate = new Date(session.date + 'T' + session.time);
                  const isUpcoming = sessionDate > new Date() && ['pending', 'confirmed'].includes(session.status);
                  const isPast = sessionDate <= new Date() || ['completed', 'cancelled'].includes(session.status);
                  
                  return (
                    <div key={session.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                      isUpcoming 
                        ? 'bg-primary-50 border-primary-200' 
                        : isPast && session.status === 'completed'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-4 ${
                          isUpcoming 
                            ? 'bg-primary-600' 
                            : isPast && session.status === 'completed'
                            ? 'bg-green-600'
                            : 'bg-gray-600'
                        }`}>
                          {session.jobSeekerName?.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || 'JS'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{session.jobSeekerName || 'Job Seeker'}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : session.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : session.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{session.topic || 'Mentorship Session'}</p>
                          <p className={`text-sm ${isUpcoming ? 'text-primary-600' : 'text-gray-600'}`}>
                            {new Date(session.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric' 
                            })}, {session.time} ({session.duration} min)
                          </p>
                          {session.description && (
                            <p className="text-xs text-gray-500 mt-1">{session.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {isUpcoming && session.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleConfirmSession(session.id)}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => handleDeclineSession(session.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {isUpcoming && session.status === 'confirmed' && (
                          <>
                            <button 
                              onClick={() => handleJoinMeeting(session.id, session.meetingLink)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              Join Meeting
                            </button>
                            <button 
                              onClick={() => handleRescheduleSession(session.id)}
                              className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                            >
                              Reschedule
                            </button>
                          </>
                        )}
                        {isPast && session.status === 'completed' && (
                          <button 
                            onClick={() => alert(`Session Notes: ${session.notes || 'No notes recorded'}`)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            View Notes
                          </button>
                        )}
                        {isPast && (session.status === 'cancelled' || session.status === 'declined') && (
                          <span className="text-red-600 text-sm capitalize">{session.status}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>
                    {sessionFilter === 'upcoming' 
                      ? 'No upcoming sessions scheduled.'
                      : sessionFilter === 'past'
                      ? 'No past sessions found.'
                      : 'No sessions found.'
                    }
                  </p>
                  <p className="text-sm">
                    {sessionFilter === 'upcoming' 
                      ? 'Sessions will appear here once mentees book with you.'
                      : sessionFilter === 'past'
                      ? 'Completed and cancelled sessions will appear here.'
                      : 'All your sessions will be listed here.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <CalendarIntegration 
                mentorId={user?.id || ''} 
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MentorDashboard;

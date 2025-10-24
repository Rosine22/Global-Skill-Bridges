import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Calendar, Clock, User, Video, Phone, Plus, CreditCard as Edit3, Trash2, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  menteeName: string;
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  type: 'video' | 'phone' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  meetingLink?: string;
}

function SessionsPage() {
  const { user } = useAuth();
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [selectedView, setSelectedView] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [newSession, setNewSession] = useState({
    menteeName: '',
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    type: 'video' as 'video' | 'phone' | 'in-person'
  });

  // Mock sessions data
  const sessions: Session[] = [
    {
      id: '1',
      mentorId: user?.id || '',
      menteeId: '1',
      menteeName: 'John Mukamana',
      title: 'Career Planning Session',
      description: 'Discuss career goals and international opportunities',
      scheduledDate: '2024-01-25',
      scheduledTime: '14:00',
      duration: 60,
      type: 'video',
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/abc-123'
    },
    {
      id: '2',
      mentorId: user?.id || '',
      menteeId: '2',
      menteeName: 'Marie Uwimana',
      title: 'Technical Skills Review',
      description: 'Review electrical engineering competencies and certifications',
      scheduledDate: '2024-01-23',
      scheduledTime: '10:00',
      duration: 90,
      type: 'video',
      status: 'completed',
      notes: 'Excellent progress in PLC programming. Recommended advanced certification.'
    },
    {
      id: '3',
      mentorId: user?.id || '',
      menteeId: '3',
      menteeName: 'David Nzeyimana',
      title: 'Interview Preparation',
      description: 'Mock interview and feedback for automotive technician role',
      scheduledDate: '2024-01-28',
      scheduledTime: '16:00',
      duration: 45,
      type: 'phone',
      status: 'scheduled'
    },
    {
      id: '4',
      mentorId: user?.id || '',
      menteeId: '1',
      menteeName: 'John Mukamana',
      title: 'Follow-up Session',
      description: 'Review application progress and next steps',
      scheduledDate: '2024-01-20',
      scheduledTime: '15:00',
      duration: 30,
      type: 'video',
      status: 'completed',
      notes: 'Applied to 3 positions in Canada. Need to work on cover letter formatting.'
    }
  ];

  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.scheduledDate);
    const today = new Date();
    
    switch (selectedView) {
      case 'upcoming':
        return sessionDate >= today && session.status === 'scheduled';
      case 'past':
        return sessionDate < today || session.status === 'completed';
      case 'all':
      default:
        return true;
    }
  });

  const handleNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would create the session
    console.log('Creating session:', newSession);
    setShowNewSessionForm(false);
    setNewSession({
      menteeName: '',
      title: '',
      description: '',
      scheduledDate: '',
      scheduledTime: '',
      duration: 60,
      type: 'video'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'rescheduled':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in-person':
        return <User className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const sessionDate = new Date(`${date}T${time}`);
    return sessionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentorship Sessions</h1>
            <p className="text-gray-600">Manage your scheduled mentoring sessions</p>
          </div>
          <button
            onClick={() => setShowNewSessionForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Session
          </button>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex space-x-4">
              {[
                { key: 'upcoming', label: 'Upcoming', count: sessions.filter(s => new Date(s.scheduledDate) >= new Date() && s.status === 'scheduled').length },
                { key: 'past', label: 'Past', count: sessions.filter(s => new Date(s.scheduledDate) < new Date() || s.status === 'completed').length },
                { key: 'all', label: 'All', count: sessions.length }
              ].map((view) => (
                <button
                  key={view.key}
                  onClick={() => setSelectedView(view.key as 'upcoming' | 'past' | 'all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedView === view.key
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {view.label} ({view.count})
                </button>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          <div className="p-6">
            {filteredSessions.length > 0 ? (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(session.status)}`}>
                              {getStatusIcon(session.status)}
                              <span className="ml-1">{session.status.charAt(0).toUpperCase() + session.status.slice(1)}</span>
                            </span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <User className="h-4 w-4 mr-2" />
                              Mentee: {session.menteeName}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDateTime(session.scheduledDate, session.scheduledTime)}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <Clock className="h-4 w-4 mr-2" />
                              {session.duration} minutes
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              {getTypeIcon(session.type)}
                              <span className="ml-2 capitalize">{session.type} Session</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600 mb-3">
                              <strong>Description:</strong> {session.description}
                            </p>
                            {session.notes && (
                              <p className="text-sm text-gray-600">
                                <strong>Notes:</strong> {session.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex space-x-2">
                        {session.status === 'scheduled' && (
                          <>
                            {session.meetingLink && (
                              <a
                                href={session.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center"
                              >
                                <Video className="h-4 w-4 mr-1" />
                                Join Meeting
                              </a>
                            )}
                            <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
                              <Edit3 className="h-4 w-4 mr-1" />
                              Reschedule
                            </button>
                            <button className="text-red-600 hover:text-red-700 text-sm flex items-center">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Cancel
                            </button>
                          </>
                        )}
                        
                        {session.status === 'completed' && (
                          <button className="text-primary-600 hover:text-primary-700 text-sm flex items-center">
                            <Edit3 className="h-4 w-4 mr-1" />
                            Add Notes
                          </button>
                        )}
                      </div>
                      
                      <button className="text-primary-600 hover:text-primary-700 text-sm flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message Mentee
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No sessions found</p>
                <p className="text-sm text-gray-400">
                  {selectedView === 'upcoming' 
                    ? 'Schedule your first mentoring session'
                    : 'No sessions match the selected view'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* New Session Form Modal */}
        {showNewSessionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Schedule New Session</h3>
              </div>
              <form onSubmit={handleNewSession} className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mentee Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newSession.menteeName}
                      onChange={(e) => setNewSession(prev => ({ ...prev, menteeName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Type
                    </label>
                    <select
                      value={newSession.type}
                      onChange={(e) => setNewSession(prev => ({ ...prev, type: e.target.value as 'video' | 'phone' | 'in-person' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="video">Video Call</option>
                      <option value="phone">Phone Call</option>
                      <option value="in-person">In Person</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newSession.title}
                    onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Career Planning Session"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newSession.description}
                    onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of what will be covered in this session"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newSession.scheduledDate}
                      onChange={(e) => setNewSession(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newSession.scheduledTime}
                      onChange={(e) => setNewSession(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="180"
                      step="15"
                      value={newSession.duration}
                      onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewSessionForm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Schedule Session
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

export default SessionsPage;

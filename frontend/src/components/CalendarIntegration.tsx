import { useState, useEffect } from 'react';
import { useCalendarIntegration } from '../hooks/useCalendarIntegration';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Video
} from 'lucide-react';

interface CalendarIntegrationProps {
  mentorId: string;
}

const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({ 
  mentorId
}) => {
  const {
    isConnected,
    isLoading,
    error,
    connectCalendar,
    disconnectCalendar,
    availability,
    getAvailability,
    upcomingSessions,
    getUpcomingSessions,
    clearError
  } = useCalendarIntegration(mentorId);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAvailability, setShowAvailability] = useState(false);

  useEffect(() => {
    if (isConnected) {
      getUpcomingSessions();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      getAvailability(new Date().toISOString(), endDate.toISOString());
    }
  }, [isConnected, getUpcomingSessions, getAvailability]);

  const handleDateChange = async (date: Date) => {
    setSelectedDate(date);
    if (isConnected) {
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      await getAvailability(date.toISOString(), endDate.toISOString());
      setShowAvailability(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connect Your Calendar
          </h3>
          <p className="text-gray-600 mb-6">
            Sync with Google Calendar to manage your mentorship sessions and availability automatically.
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Automatic scheduling and availability management
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Send calendar invitations to mentees
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Automatic Google Meet links for sessions
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Reminder notifications
            </div>
          </div>

          <button
            onClick={connectCalendar}
            disabled={isLoading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 flex items-center mx-auto"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            Connect Google Calendar
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <div>
            <p className="font-medium text-green-800">Calendar Connected</p>
            <p className="text-sm text-green-600">Your Google Calendar is synced</p>
          </div>
        </div>
        <button
          onClick={disconnectCalendar}
          className="text-green-700 hover:text-green-900 text-sm font-medium"
        >
          Disconnect
        </button>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h3>
            <button
              onClick={getUpcomingSessions}
              disabled={isLoading}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="p-6">
          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                      <Video className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{session.title}</h4>
                      <p className="text-sm text-gray-600">{formatDate(session.start)}</p>
                    </div>
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
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No upcoming sessions</p>
            </div>
          )}
        </div>
      </div>

      {/* Availability Management */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Availability Management</h3>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Actions
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setShowAvailability(!showAvailability)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm"
                >
                  {showAvailability ? 'Hide' : 'Show'} Availability
                </button>
              </div>
            </div>
          </div>

          {/* Availability Slots */}
          {showAvailability && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-4">Available Time Slots</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availability.map((slot, index) => (
                  <button
                    key={index}
                    disabled={!slot.available}
                    className={`p-2 text-xs rounded-lg text-center ${
                      slot.available
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {new Date(slot.start).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Settings */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Calendar Settings</h3>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Hours
              </label>
              <div className="flex space-x-2">
                <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                </select>
                <span className="flex items-center text-gray-500">to</span>
                <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option>5:00 PM</option>
                  <option>6:00 PM</option>
                  <option>7:00 PM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Duration
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-sm text-red-700">{error}</span>
          <button
            onClick={clearError}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarIntegration;
import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Bell,
  CheckCircle,
  Briefcase,
  User,
  Award,
  MessageSquare,
  Check,
  Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'job' | 'application' | 'mentorship' | 'verification' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'job' | 'mentorship'>('all');
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'application',
      title: 'Application Update',
      message: 'Your application for Software Developer at TechCorp has been reviewed.',
      timestamp: '2024-01-20 10:30',
      read: false,
      actionUrl: '/applications'
    },
    {
      id: '2',
      type: 'mentorship',
      title: 'Mentorship Request Accepted',
      message: 'Sarah Uwimana has accepted your mentorship request.',
      timestamp: '2024-01-19 14:15',
      read: false,
      actionUrl: '/mentorship'
    },
    {
      id: '3',
      type: 'verification',
      title: 'Skill Verification Complete',
      message: 'Your JavaScript Programming skill has been verified.',
      timestamp: '2024-01-18 16:45',
      read: true,
      actionUrl: '/skills-verification'
    },
    {
      id: '4',
      type: 'job',
      title: 'New Job Match',
      message: 'A new job matching your skills has been posted: React Developer in Canada.',
      timestamp: '2024-01-17 09:20',
      read: true,
      actionUrl: '/dashboard'
    },
    {
      id: '5',
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from TechCorp HR.',
      timestamp: '2024-01-16 11:30',
      read: false,
      actionUrl: '/messages'
    }
  ]);

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'job':
        return notification.type === 'job' || notification.type === 'application';
      case 'mentorship':
        return notification.type === 'mentorship';
      default:
        return true;
    }
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job':
      case 'application':
        return <Briefcase className="h-5 w-5 text-primary-600" />;
      case 'mentorship':
        return <User className="h-5 w-5 text-green-500" />;
      case 'verification':
        return <Award className="h-5 w-5 text-purple-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-4 border-b">
            <div className="flex space-x-4">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'job', label: 'Jobs', count: notifications.filter(n => n.type === 'job' || n.type === 'application').length },
                { key: 'mentorship', label: 'Mentorship', count: notifications.filter(n => n.type === 'mentorship').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as 'all' | 'unread' | 'job' | 'mentorship')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View Details →
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-primary-600 hover:text-primary-700 p-1"
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notifications found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default NotificationsPage;

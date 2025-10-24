import { useState, useEffect } from 'react';
import calendarService, { CalendarEvent as ServiceCalendarEvent, AvailabilitySlot } from '../services/calendarService';

interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  attendees?: string[];
}

// Google API type for window object
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      auth2: {
        init: (config: { client_id: string }) => {
          signIn: (options: { scope: string }) => Promise<{
            isSignedIn: () => boolean;
            getAuthResponse: () => { access_token: string };
          }>;
        };
      };
    };
  }
}

export const useCalendarIntegration = (mentorId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check if calendar is connected
  useEffect(() => {
    checkCalendarConnection();
  }, []);

  const checkCalendarConnection = async () => {
    try {
      // Check if user has authorized calendar access
      const connected = localStorage.getItem('calendar_connected') === 'true';
      setIsConnected(connected);
    } catch (error) {
      console.error('Error checking calendar connection:', error);
      setError('Failed to check calendar connection');
    }
  };

  // Connect to external calendar (Mock implementation)
  const connectCalendar = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock calendar connection - in real app, implement Google OAuth flow
      console.log('Connecting to calendar...');
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('calendar_connected', 'true');
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting calendar:', error);
      setError('Failed to connect calendar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect calendar
  const disconnectCalendar = () => {
    localStorage.removeItem('calendar_connected');
    localStorage.removeItem('google_access_token');
    setIsConnected(false);
    setAvailability([]);
    setUpcomingSessions([]);
  };

  // Get availability for a date range
  const getAvailability = async (startDate: string, endDate: string) => {
    if (!isConnected || !mentorId) return;

    try {
      setIsLoading(true);
      setError(null);

      const mentorEmail = `${mentorId}@mentor.com`; // Adjust based on your user model
      const slots = await calendarService.getMentorAvailability(
        mentorEmail, 
        startDate, 
        endDate
      );
      
      setAvailability(slots);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setError('Failed to fetch availability');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a mentorship session
  const createSession = async (sessionData: {
    title: string;
    description?: string;
    start: string;
    end: string;
    menteeEmail: string;
    menteeName: string;
  }) => {
    if (!isConnected) throw new Error('Calendar not connected');

    try {
      setIsLoading(true);
      setError(null);

      const event = {
        summary: sessionData.title,
        description: `Mentorship Session\n\nMentee: ${sessionData.menteeName}\n\n${sessionData.description || ''}`,
        start: {
          dateTime: sessionData.start,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: sessionData.end,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attendees: [
          {
            email: sessionData.menteeEmail,
            displayName: sessionData.menteeName
          }
        ]
      };

      const createdEvent = await calendarService.createMentorshipSession(event);
      
      // Refresh upcoming sessions
      await getUpcomingSessions();
      
      return createdEvent;
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Failed to create session');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a session
  const updateSession = async (sessionId: string, updates: Partial<CalendarEvent>) => {
    if (!isConnected) throw new Error('Calendar not connected');

    try {
      setIsLoading(true);
      setError(null);

      // Convert hook CalendarEvent format to service format
      const serviceUpdates: Partial<ServiceCalendarEvent> = {
        summary: updates.title,
        description: updates.description,
        ...(updates.start && {
          start: {
            dateTime: updates.start,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }),
        ...(updates.end && {
          end: {
            dateTime: updates.end,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        })
      };

      const updatedEvent = await calendarService.updateMentorshipSession(sessionId, serviceUpdates);
      
      // Refresh upcoming sessions
      await getUpcomingSessions();
      
      return updatedEvent;
    } catch (error) {
      console.error('Error updating session:', error);
      setError('Failed to update session');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel a session
  const cancelSession = async (sessionId: string) => {
    if (!isConnected) throw new Error('Calendar not connected');

    try {
      setIsLoading(true);
      setError(null);

      await calendarService.cancelMentorshipSession(sessionId);
      
      // Refresh upcoming sessions
      await getUpcomingSessions();
    } catch (error) {
      console.error('Error canceling session:', error);
      setError('Failed to cancel session');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get upcoming sessions
  const getUpcomingSessions = async () => {
    if (!isConnected || !mentorId) return;

    try {
      const sessions = await calendarService.getUpcomingSessions();
      
      const formattedSessions = sessions.map((session: ServiceCalendarEvent) => ({
        id: session.id,
        title: session.summary,
        description: session.description,
        start: session.start.dateTime,
        end: session.end.dateTime,
        attendees: session.attendees?.map((a) => a.email) || []
      }));

      setUpcomingSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      setError('Failed to fetch upcoming sessions');
    }
  };

  return {
    // Connection state
    isConnected,
    isLoading,
    error,
    
    // Connection methods
    connectCalendar,
    disconnectCalendar,
    
    // Availability
    availability,
    getAvailability,
    
    // Session management
    upcomingSessions,
    createSession,
    updateSession,
    cancelSession,
    getUpcomingSessions,
    
    // Utility
    clearError: () => setError(null)
  };
};
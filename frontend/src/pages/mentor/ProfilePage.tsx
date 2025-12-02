import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserContext } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { API_BASE_URL, getAuthHeaders } from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  ArrowLeft,
  MapPin,
  Star,
  Award,
  Video,
  Phone,
  User,
  CheckCircle,
  Send,
  Clock,
  CalendarDays
} from 'lucide-react';
import { Mentor } from '../../contexts/UserContext';

interface MentorProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  title: string;
  company: string;
  location: string;
  expertise: string[];
  experience: string;
  rating: number;
  reviews: number;
  bio: string;
  achievements: string[];
  languages: string[];
  availability: string;
  sessionTypes: string[];
  responseTime: string;
  totalMentees: number;
  successStories: number;
  linkedInProfile?: string;
  education?: any[];
}

interface AvailabilitySlot {
  date: string;
  time: string;
  available: boolean;
  duration: number; // in minutes
}

interface BackendMentor {
  _id: string;
  name: string;
  email?: string;
  bio?: string;
  avatar?: {
    url: string;
    public_id: string;
  };
  mentorInfo?: {
    specializations?: string[];
    yearsOfExperience?: number;
    biography?: string;
    achievements?: string[];
    languages?: string[];
    availability?: any[];
    linkedInProfile?: string;
  };
  location?: {
    city?: string;
    country?: string;
    address?: string;
  };
  phone?: string;
  skills?: Array<{
    name?: string;
    skill?: {
      name: string;
    };
  }>;
  stats?: {
    mentoringSessions?: number;
    rating?: number;
    reviews?: number;
  };
  experience?: Array<{
    position?: string;
    company?: string;
    isCurrent?: boolean;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    field?: string;
  }>;
}

function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { requestMentorship, createOrGetConversation, bookSession, mentorshipRequests } = useUserContext();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [requestForm, setRequestForm] = useState({
    field: '',
    message: ''
  });
  const [bookingForm, setBookingForm] = useState({
    topic: '',
    description: '',
    duration: 60
  });
  const notify = useNotification();

  // Check if there's any mentorship request with this mentor (pending, accepted, active, completed, declined)
  const existingMentorshipRequest = mentor && user
    ? mentorshipRequests.find(
        req => req.mentorId === mentor.id && 
               req.seekerId === user.id
      )
    : null;

  // Fetch mentor from backend
  const fetchMentor = useCallback(async () => {
    if (!id) {
      setError('Mentor ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Add cache-busting timestamp to ensure fresh data
      const response = await fetch(`${API_BASE_URL}/api/users/${id}?t=${Date.now()}`, {
        headers: getAuthHeaders(),
        cache: 'no-cache',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Mentor not found');
        }
        throw new Error('Failed to fetch mentor');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const backendMentor: BackendMentor = data.data;
        
        // Debug: Log mentor data to help troubleshoot
        console.log('Mentor data received:', {
          id: backendMentor._id,
          name: backendMentor.name,
          role: data.data.role,
          mentorInfo: backendMentor.mentorInfo,
          yearsOfExperience: backendMentor.mentorInfo?.yearsOfExperience,
          experience: backendMentor.experience
        });
        
        // Check if user is a mentor
        if (backendMentor.mentorInfo || data.data.role === 'mentor') {
          // Get current role from experience
          const currentExperience = backendMentor.experience?.find(exp => exp.isCurrent) || backendMentor.experience?.[0];
          const currentRole = currentExperience 
            ? `${currentExperience.position || 'Professional'} at ${currentExperience.company || 'Company'}`
            : 'Mentor';

          // Get location string
          const locationStr = backendMentor.location 
            ? `${backendMentor.location.city || ''}${backendMentor.location.city && backendMentor.location.country ? ', ' : ''}${backendMentor.location.country || ''}`
            : 'Location not specified';

          // Get expertise from specializations or skills
          const expertise = backendMentor.mentorInfo?.specializations || 
            backendMentor.skills?.map(s => s.name || s.skill?.name).filter(Boolean) || 
            [];

          // Get experience string - check multiple sources
          let experienceStr = 'Experience not specified';
          
          // First, check mentorInfo.yearsOfExperience (including 0)
          const yearsOfExp = backendMentor.mentorInfo?.yearsOfExperience;
          if (yearsOfExp !== null && yearsOfExp !== undefined && yearsOfExp !== '') {
            // Handle both number and string values
            const years = typeof yearsOfExp === 'string' ? parseInt(yearsOfExp, 10) : yearsOfExp;
            if (!isNaN(years) && years >= 0) {
              experienceStr = `${years}+ years`;
            }
          } 
          
          // Fallback: Calculate from experience array if yearsOfExperience not available
          if (experienceStr === 'Experience not specified' && backendMentor.experience && backendMentor.experience.length > 0) {
            const now = new Date();
            let totalYears = 0;
            
            backendMentor.experience.forEach(exp => {
              if (exp.startDate) {
                const startDate = new Date(exp.startDate);
                const endDate = exp.endDate ? new Date(exp.endDate) : now;
                const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
                totalYears = Math.max(totalYears, years);
              }
            });
            
            if (totalYears > 0) {
              experienceStr = `${Math.round(totalYears)}+ years`;
            }
          }

          // Get bio
          const bio = backendMentor.bio || 
            backendMentor.mentorInfo?.biography || 
            (expertise.length > 0 
              ? `Experienced professional with expertise in ${expertise.slice(0, 2).join(' and ')}.`
              : 'Experienced professional ready to help you grow your career.');

          const transformedMentor: Mentor & { email?: string; phone?: string; linkedInProfile?: string; education?: any[] } = {
            id: backendMentor._id,
            name: backendMentor.name,
            email: backendMentor.email,
            phone: backendMentor.phone,
            title: currentExperience?.position || 'Mentor',
            company: currentExperience?.company || '',
            expertise: expertise,
            location: locationStr,
            experience: experienceStr,
            rating: backendMentor.stats?.rating || 4.5,
            reviews: backendMentor.stats?.reviews || 0,
            bio: bio,
            currentRole: currentRole,
            avatar: backendMentor.avatar?.url,
            achievements: backendMentor.mentorInfo?.achievements || [],
            languages: backendMentor.mentorInfo?.languages || [],
            availability: backendMentor.mentorInfo?.availability ? 'Available' : 'Not specified',
            sessionTypes: ['Video Call', 'In-Person'],
            responseTime: 'Within 24 hours',
            totalMentees: 0,
            successStories: 0,
            linkedInProfile: backendMentor.mentorInfo?.linkedInProfile,
            education: backendMentor.education || [],
          };

          setMentor(transformedMentor);
        } else {
          setError('User is not a mentor');
        }
      }
    } catch (err) {
      console.error('Error fetching mentor:', err);
      setError(err instanceof Error ? err.message : 'Failed to load mentor');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch mentor data on mount and when id changes
  useEffect(() => {
    fetchMentor();
  }, [fetchMentor]);

  // Refresh data when page becomes visible (e.g., after editing profile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && id) {
        // Refresh mentor data when page becomes visible
        fetchMentor();
      }
    };

    const handleFocus = () => {
      if (id) {
        // Refresh mentor data when window gains focus
        fetchMentor();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [id, fetchMentor]);

  // Generate mock availability data
  useEffect(() => {
    const generateAvailability = () => {
      const slots: AvailabilitySlot[] = [];
      const today = new Date();
      
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(today.getDate() + day);
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        const dateStr = date.toISOString().split('T')[0];
        
        // Generate morning slots (9 AM - 12 PM)
        for (let hour = 9; hour < 12; hour++) {
          slots.push({
            date: dateStr,
            time: `${hour.toString().padStart(2, '0')}:00`,
            available: Math.random() > 0.3, // 70% available
            duration: 60
          });
        }
        
        // Generate afternoon slots (2 PM - 5 PM)
        for (let hour = 14; hour < 17; hour++) {
          slots.push({
            date: dateStr,
            time: `${hour.toString().padStart(2, '0')}:00`,
            available: Math.random() > 0.4, // 60% available
            duration: 60
          });
        }
      }
      
      setAvailability(slots);
    };

    generateAvailability();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-gray-500 mt-4">Loading mentor profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !mentor) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Mentor Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The mentor you are looking for does not exist."}</p>
          <button 
            onClick={() => navigate('/mentorship')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Mentors
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const mentorProfile: MentorProfile = {
    id: mentor.id,
    name: mentor.name,
    email: (mentor as any).email,
    phone: (mentor as any).phone,
    title: mentor.title,
    company: mentor.company,
    location: mentor.location,
    expertise: mentor.expertise,
    experience: mentor.experience,
    rating: mentor.rating,
    reviews: mentor.reviews,
    bio: mentor.bio,
    achievements: mentor.achievements,
    languages: mentor.languages,
    availability: mentor.availability,
    sessionTypes: mentor.sessionTypes,
    responseTime: mentor.responseTime,
    totalMentees: mentor.totalMentees,
    successStories: mentor.successStories,
    linkedInProfile: (mentor as any).linkedInProfile,
    education: (mentor as any).education || [],
  };

  const getAvailableDates = () => {
    const dates = new Set(availability.filter(slot => slot.available).map(slot => slot.date));
    return Array.from(dates).sort();
  };

  const getAvailableTimesForDate = (date: string) => {
    return availability.filter(slot => slot.date === date && slot.available);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBookSession = () => {
    // Book the session using UserContext
    bookSession(mentorProfile.id, mentorProfile.name, {
      topic: bookingForm.topic,
      description: bookingForm.description,
      date: selectedDate,
      time: selectedTime,
      duration: bookingForm.duration
    });

  // Show success message and reset form
  notify.success('Session booked successfully! You will receive a calendar invitation soon.');
    setShowBookingModal(false);
    setSelectedTime('');
    setSelectedDate('');
    setBookingForm({ topic: '', description: '', duration: 60 });
  };

  const handleStartConversation = () => {
    // Create or get existing conversation with the mentor
    createOrGetConversation(mentorProfile.id, mentorProfile.name, 'mentor');
    // Navigate to messages page with userId parameter to auto-open conversation
    navigate(`/messages?userId=${mentorProfile.id}`);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submitting if a request already exists
    if (existingMentorshipRequest) {
      notify.error('You have already sent a mentorship request to this mentor');
      setShowRequestForm(false);
      return;
    }
    
    if (!requestForm.field || !requestForm.message) {
      notify.error('Please fill in all required fields');
      return;
    }

    try {
      await requestMentorship(mentorProfile.id, requestForm.field, requestForm.message);
      setShowRequestForm(false);
      setRequestForm({ field: '', message: '' });
      notify.success('Mentorship request sent successfully!');
    } catch (error) {
      console.error('Error sending mentorship request:', error);
      notify.error(error instanceof Error ? error.message : 'Failed to send mentorship request');
    }
  };

  const reviews = [
    {
      id: '1',
      name: 'John Mukamana',
      rating: 5,
      comment: 'Sarah helped me transition from a local developer role to a position at a Canadian tech company. Her guidance was invaluable!',
      date: '2024-01-15'
    },
    {
      id: '2',
      name: 'Marie Claire',
      rating: 5,
      comment: 'Excellent mentor! Very knowledgeable and patient. Helped me improve my technical skills significantly.',
      date: '2024-01-10'
    },
    {
      id: '3',
      name: 'David Nzeyimana',
      rating: 4,
      comment: 'Great insights into the tech industry. Sarah provided practical advice for career growth.',
      date: '2024-01-05'
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mentors
        </button>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                  {mentorProfile.name.charAt(0)}
                </div>
                <div className="ml-6">
                  <h1 className="text-3xl font-bold mb-2">{mentorProfile.name}</h1>
                  <p className="text-xl text-primary-100 mb-2">{mentorProfile.title}</p>
                  <p className="text-primary-100 mb-3">{mentorProfile.company}</p>
                  <div className="flex flex-wrap items-center gap-4 text-primary-100">
                    {mentorProfile.email && (
                      <div className="flex items-center">
                        <span className="text-sm">{mentorProfile.email}</span>
                      </div>
                    )}
                    {mentorProfile.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        <span className="text-sm">{mentorProfile.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{mentorProfile.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-300" />
                      <span className="text-sm">{mentorProfile.rating.toFixed(1)} ({mentorProfile.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span className="text-sm">{mentorProfile.totalMentees} mentees</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <div className="text-2xl font-bold">{mentorProfile.successStories}</div>
                  <div className="text-sm text-primary-100">Success Stories</div>
                </div>
                <div className="flex space-x-3">
                  {existingMentorshipRequest ? (
                    <button
                      disabled
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center text-sm cursor-default ${
                        existingMentorshipRequest.status === 'completed' 
                          ? 'bg-gray-100 text-gray-700'
                          : existingMentorshipRequest.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : existingMentorshipRequest.status === 'accepted'
                          ? 'bg-green-100 text-green-700'
                          : existingMentorshipRequest.status === 'declined'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {existingMentorshipRequest.status === 'completed' 
                        ? 'Mentorship Completed' 
                        : existingMentorshipRequest.status === 'active'
                        ? 'Mentorship Active'
                        : existingMentorshipRequest.status === 'accepted'
                        ? 'Mentorship Accepted'
                        : existingMentorshipRequest.status === 'declined'
                        ? 'Request Declined'
                        : 'Request Pending'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowRequestForm(true)}
                      className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center text-sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Request Mentorship
                    </button>
                  )}
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="bg-secondary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary-700 transition-colors flex items-center text-sm"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Book Session
                  </button>
                  <button
                    onClick={() => handleStartConversation()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center text-sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <Award className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-primary-600">{mentorProfile.experience}</div>
                <div className="text-sm text-primary-700">Experience</div>
              </div>
              <div className="text-center p-4 bg-secondary-50 rounded-lg">
                <Clock className="h-8 w-8 text-secondary-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-secondary-600">Response Time</div>
                <div className="text-xs text-secondary-700">{mentorProfile.responseTime}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-600">{Math.round((mentorProfile.successStories / mentorProfile.totalMentees) * 100)}%</div>
                <div className="text-sm text-green-700">Success Rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-purple-600">{mentorProfile.rating}</div>
                <div className="text-sm text-purple-700">Average Rating</div>
              </div>
            </div>

            {/* Contact Information */}
            {(mentorProfile.email || mentorProfile.phone || mentorProfile.linkedInProfile) && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {mentorProfile.email && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-2">Email:</span>
                      <span className="text-sm text-gray-600">{mentorProfile.email}</span>
                    </div>
                  )}
                  {mentorProfile.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700 mr-2">Phone:</span>
                      <span className="text-sm text-gray-600">{mentorProfile.phone}</span>
                    </div>
                  )}
                  {mentorProfile.linkedInProfile && (
                    <div className="flex items-center">
                      <a 
                        href={mentorProfile.linkedInProfile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* About Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{mentorProfile.bio}</p>
            </div>

            {/* Expertise */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Areas of Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {mentorProfile.expertise.map((skill) => (
                  <span 
                    key={skill}
                    className="px-3 py-2 bg-primary-100 text-primary-800 rounded-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Achievements</h2>
              <ul className="space-y-2">
                {mentorProfile.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Session Information */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Types</h2>
                <div className="space-y-2">
                  {mentorProfile.sessionTypes.map((type, index) => (
                    <div key={index} className="flex items-center">
                      {type.includes('Video') && <Video className="h-4 w-4 text-blue-500 mr-2" />}
                      {type.includes('Phone') && <Phone className="h-4 w-4 text-green-500 mr-2" />}
                      {type.includes('In-Person') && <User className="h-4 w-4 text-purple-500 mr-2" />}
                      <span className="text-gray-700">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {mentorProfile.languages.map((language) => (
                    <span 
                      key={language}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {language}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-2">Availability</h3>
                <p className="text-gray-600">{mentorProfile.availability}</p>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Reviews ({mentorProfile.reviews})
              </h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                          {review.name.charAt(0)}
                        </div>
                        <span className="ml-2 font-medium text-gray-900">{review.name}</span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Book Session Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Book a Session</h3>
                <p className="text-gray-600">with {mentorProfile.name}</p>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Date Selection */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Select Date</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {getAvailableDates().map((date) => (
                        <button
                          key={date}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTime('');
                          }}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedDate === date
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{formatDate(date)}</div>
                          <div className="text-sm text-gray-500">
                            {getAvailableTimesForDate(date).length} slots available
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Available Times {selectedDate && `for ${formatDate(selectedDate)}`}
                    </h4>
                    {selectedDate ? (
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {getAvailableTimesForDate(selectedDate).map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`p-2 text-sm rounded-lg border transition-colors ${
                              selectedTime === slot.time
                                ? 'border-primary-500 bg-primary-500 text-white'
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Please select a date first</p>
                    )}
                  </div>
                </div>

                {/* Session Details */}
                {selectedDate && selectedTime && (
                  <div className="mt-6 space-y-4 border-t pt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Topic *
                      </label>
                      <input
                        type="text"
                        value={bookingForm.topic}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, topic: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., Career transition to tech, Resume review, Technical interview prep"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <select
                        value={bookingForm.duration}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value={30}>30 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Details
                      </label>
                      <textarea
                        value={bookingForm.description}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Share any specific questions or areas you'd like to focus on during the session..."
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedDate('');
                      setSelectedTime('');
                      setBookingForm({ topic: '', description: '', duration: 60 });
                    }}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookSession}
                    disabled={!selectedDate || !selectedTime || !bookingForm.topic}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Mentorship Modal */}
        {showRequestForm && !existingMentorshipRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Request Mentorship</h3>
                <p className="text-gray-600">from {mentorProfile.name}</p>
              </div>
              <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field of Interest
                  </label>
                  <select
                    value={requestForm.field}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, field: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select a field</option>
                    <option value="software-development">Software Development</option>
                    <option value="electrical-engineering">Electrical Engineering</option>
                    <option value="mechanical-engineering">Mechanical Engineering</option>
                    <option value="civil-engineering">Civil Engineering</option>
                    <option value="automotive-technology">Automotive Technology</option>
                    <option value="construction">Construction</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="career-guidance">Career Guidance</option>
                    <option value="interview-preparation">Interview Preparation</option>
                    <option value="skill-development">Skill Development</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to Mentor
                  </label>
                  <textarea
                    value={requestForm.message}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tell the mentor about yourself, your goals, and what specific guidance you're looking for..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
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

export default MentorProfilePage;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserContext } from '../../contexts/UserContext';
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

interface MentorProfile {
  id: string;
  name: string;
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
}

interface AvailabilitySlot {
  date: string;
  time: string;
  available: boolean;
  duration: number; // in minutes
}

function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requestMentorship, createOrGetConversation, getMentorById, bookSession } = useUserContext();
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

  // Get mentor profile from context
  const mentor = getMentorById(id || '1');
  
  if (!mentor) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Mentor Not Found</h1>
          <p className="text-gray-600 mb-6">The mentor you're looking for doesn't exist.</p>
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
    successStories: mentor.successStories
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
    alert('Session booked successfully! You will receive a calendar invitation soon.');
    setShowBookingModal(false);
    setSelectedTime('');
    setSelectedDate('');
    setBookingForm({ topic: '', description: '', duration: 60 });
  };

  const handleStartConversation = () => {
    // Create or get existing conversation with the mentor
    createOrGetConversation(mentorProfile.id, mentorProfile.name, 'mentor');
    // Navigate to messages page
    navigate('/messages');
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestMentorship(mentorProfile.id, requestForm.field, requestForm.message);
    setShowRequestForm(false);
    setRequestForm({ field: '', message: '' });
    // Show success message or redirect
    alert('Mentorship request sent successfully!');
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
                  <div className="flex items-center space-x-4 text-primary-100">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {mentorProfile.location}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-300" />
                      {mentorProfile.rating} ({mentorProfile.reviews} reviews)
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {mentorProfile.totalMentees} mentees
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
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center text-sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Request Mentorship
                  </button>
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
        {showRequestForm && (
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
                    {mentorProfile.expertise.map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
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

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserContext } from '../contexts/UserContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  ArrowLeft,
  MapPin,
  Star,
  Award,
  Calendar,
  MessageSquare,
  Video,
  Phone,
  User,
  CheckCircle,
  Send,
  Clock
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

function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { requestMentorship } = useUserContext();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    field: '',
    message: ''
  });

  // Mock mentor profile data
  const mentorProfile: MentorProfile = {
    id: id || '1',
    name: 'Sarah Uwimana',
    title: 'Senior Software Engineer',
    company: 'Google',
    location: 'Toronto, Canada',
    expertise: ['Software Development', 'Project Management', 'Career Transition', 'Technical Leadership'],
    experience: '8+ years',
    rating: 4.9,
    reviews: 24,
    bio: 'Senior Software Engineer at Google with extensive experience in full-stack development and team leadership. Originally from Rwanda, I am passionate about helping TVET graduates transition to successful tech careers globally. I have mentored over 50 professionals and helped them secure positions at top tech companies.',
    achievements: [
      'Led development of 3 major products at Google',
      'Mentored 50+ professionals to career success',
      'Speaker at 10+ international tech conferences',
      'Published 15+ technical articles'
    ],
    languages: ['English', 'Kinyarwanda', 'French'],
    availability: 'Weekends and evenings (EST)',
    sessionTypes: ['Video Call', 'Phone Call', 'In-Person (Toronto area)'],
    responseTime: 'Usually responds within 24 hours',
    totalMentees: 52,
    successStories: 38
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
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Request Mentorship
                </button>
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
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserContext } from '../contexts/UserContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Users,
  Star,
  MessageCircle,
  Calendar,
  Search,
  MapPin,
  Award,
  Send
} from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  location: string;
  experience: string;
  rating: number;
  reviews: number;
  bio: string;
  currentRole: string;
  avatar?: string;
}

function MentorshipPage() {
  const { user } = useAuth();
  const { mentorshipRequests, requestMentorship } = useUserContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [showRequestForm, setShowRequestForm] = useState<string | null>(null);
  const [requestForm, setRequestForm] = useState({
    field: '',
    message: ''
  });

  // Mock mentors data
  const mentors: Mentor[] = [
    {
      id: '1',
      name: 'Sarah Uwimana',
      expertise: ['Software Development', 'Project Management', 'Career Transition'],
      location: 'Toronto, Canada',
      experience: '8+ years',
      rating: 4.9,
      reviews: 24,
      bio: 'Senior Software Engineer at Google with extensive experience in full-stack development. Originally from Rwanda, passionate about helping TVET graduates transition to tech careers globally.',
      currentRole: 'Senior Software Engineer at Google'
    },
    {
      id: '2',
      name: 'Jean Baptiste Nzeyimana',
      expertise: ['Electrical Engineering', 'Renewable Energy', 'Leadership'],
      location: 'Dubai, UAE',
      experience: '10+ years',
      rating: 4.8,
      reviews: 18,
      bio: 'Electrical Engineering Manager specializing in renewable energy projects. Leading teams across the Middle East and helping engineers advance their careers internationally.',
      currentRole: 'Engineering Manager at Emirates Energy'
    },
    {
      id: '3',
      name: 'Marie Claire Mukasonga',
      expertise: ['Automotive Technology', 'Quality Assurance', 'Team Leadership'],
      location: 'Munich, Germany',
      experience: '12+ years',
      rating: 4.9,
      reviews: 31,
      bio: 'Quality Manager at BMW with deep expertise in automotive systems. Passionate about supporting young engineers in their career development and international mobility.',
      currentRole: 'Quality Manager at BMW'
    }
  ];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesExpertise = !selectedExpertise || mentor.expertise.includes(selectedExpertise);
    return matchesSearch && matchesExpertise;
  });

  const allExpertiseAreas = Array.from(new Set(mentors.flatMap(mentor => mentor.expertise)));

  const handleRequestSubmit = (mentorId: string) => {
    requestMentorship(mentorId, requestForm.field, requestForm.message);
    setShowRequestForm(null);
    setRequestForm({ field: '', message: '' });
  };

  const userRequests = mentorshipRequests.filter(req => req.seekerId === user?.id);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Find a Mentor</h1>
          <p className="text-gray-600">
            Connect with experienced professionals from the Rwandan diaspora and industry experts to accelerate your career growth.
          </p>
        </div>

        {/* My Mentorship Requests */}
        {userRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">My Mentorship Requests</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {userRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{request.mentorName}</h3>
                      <p className="text-sm text-gray-600">{request.field}</p>
                      <p className="text-sm text-gray-500">Requested on {request.requestDate}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search mentors by name or expertise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Expertise Areas</option>
                  {allExpertiseAreas.map((expertise) => (
                    <option key={expertise} value={expertise}>{expertise}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                  {mentor.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                <p className="text-gray-600 text-sm">{mentor.currentRole}</p>
                <div className="flex items-center justify-center mt-2">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">{mentor.location}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900 ml-1">
                        {mentor.rating} ({mentor.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 mb-2 block">Expertise</span>
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.map((skill) => (
                      <span 
                        key={skill}
                        className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 mb-2 block">Experience</span>
                  <span className="text-sm text-gray-600">{mentor.experience}</span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-3">{mentor.bio}</p>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <Link to={`/mentor/${mentor.id}`}>View Profile</Link>
                  </button>
                  <button
                    onClick={() => setShowRequestForm(mentor.id)}
                    className="flex-1 border border-primary-600 text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Request Mentorship
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No mentors found</p>
            <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Request Mentorship</h3>
                <p className="text-gray-600">
                  from {mentors.find(m => m.id === showRequestForm)?.name}
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
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
                      {mentors.find(m => m.id === showRequestForm)?.expertise.map((exp) => (
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
                    <p className="text-sm text-gray-500 mt-2">
                      Be specific about what you hope to achieve through mentorship and what questions you have.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowRequestForm(null)}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRequestSubmit(showRequestForm)}
                    disabled={!requestForm.field || !requestForm.message}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MentorshipPage;
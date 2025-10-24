import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Search, 
  Filter, 
  MapPin, 
  Award, 
  User, 
  MessageSquare,
  Star,
  Eye,
  Clock
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  country: string;
  skills: string[];
  verifiedSkills: number;
  totalSkills: number;
  experience: string;
  education: string;
  profileCompletion: number;
  rating: number;
  reviews: number;
  availability: 'available' | 'employed' | 'seeking';
  lastActive: string;
  bio: string;
}

function TalentSearchPage() {
  // Handler for viewing profile
  const handleViewProfile = (candidateId: string) => {
    window.location.href = `/employer/talent-profile/${candidateId}`;
  };

  // Handler for contacting candidate
  const handleContactCandidate = (candidateId: string) => {
    window.location.href = `/employer/contact-talent/${candidateId}`;
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Mock candidates data
  const candidates: Candidate[] = [
    {
      id: '1',
      name: 'John Mukamana',
      title: 'Software Developer',
      location: 'Kigali',
      country: 'Rwanda',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
      verifiedSkills: 8,
      totalSkills: 10,
      experience: '2+ years',
      education: 'Diploma in Software Development - Rwanda Polytechnic',
      profileCompletion: 95,
      rating: 4.8,
      reviews: 12,
      availability: 'seeking',
      lastActive: '2024-01-20',
      bio: 'Passionate software developer with expertise in full-stack development. Looking for international opportunities.'
    },
    {
      id: '2',
      name: 'Marie Uwimana',
      title: 'Electrical Engineer',
      location: 'Kigali',
      country: 'Rwanda',
      skills: ['Circuit Design', 'PLC Programming', 'AutoCAD', 'Power Systems', 'Project Management'],
      verifiedSkills: 6,
      totalSkills: 8,
      experience: '3+ years',
      education: 'Diploma in Electrical Engineering - IPRC Kigali',
      profileCompletion: 88,
      rating: 4.9,
      reviews: 8,
      availability: 'available',
      lastActive: '2024-01-19',
      bio: 'Experienced electrical engineer specializing in power systems and industrial automation.'
    },
    {
      id: '3',
      name: 'David Nzeyimana',
      title: 'Automotive Technician',
      location: 'Kigali',
      country: 'Rwanda',
      skills: ['Engine Diagnostics', 'Brake Systems', 'Transmission Repair', 'BMW Systems', 'Mercedes Systems'],
      verifiedSkills: 7,
      totalSkills: 9,
      experience: '4+ years',
      education: 'Certificate in Automotive Technology - WDA',
      profileCompletion: 92,
      rating: 4.7,
      reviews: 15,
      availability: 'seeking',
      lastActive: '2024-01-18',
      bio: 'Expert automotive technician with specialization in German vehicle systems.'
    },
    {
      id: '4',
      name: 'Grace Mukamana',
      title: 'Full-Stack Developer',
      location: 'Kigali',
      country: 'Rwanda',
      skills: ['Java', 'Spring Boot', 'Angular', 'MySQL', 'Docker'],
      verifiedSkills: 4,
      totalSkills: 8,
      experience: '1+ years',
      education: 'Diploma in Software Development - Rwanda Coding Academy',
      profileCompletion: 78,
      rating: 4.6,
      reviews: 5,
      availability: 'available',
      lastActive: '2024-01-21',
      bio: 'Recent graduate with strong foundation in enterprise application development.'
    }
  ];

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = !locationFilter || candidate.country.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesSkills = !skillsFilter || candidate.skills.some(skill => 
      skill.toLowerCase().includes(skillsFilter.toLowerCase())
    );
    const matchesAvailability = !availabilityFilter || candidate.availability === availabilityFilter;
    
    return matchesSearch && matchesLocation && matchesSkills && matchesAvailability;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'seeking':
        return 'bg-blue-100 text-blue-800';
      case 'employed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastActive = (date: string) => {
    const diffMs = new Date().getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Find Talent</h1>
            <p className="text-gray-600">Search and connect with skilled TVET graduates</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search by name, title, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Locations</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                  </select>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Availability</option>
                    <option value="available">Available</option>
                    <option value="seeking">Seeking</option>
                    <option value="employed">Employed</option>
                  </select>
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced
                  </button>
                </div>
              </div>
              
              {showAdvancedFilters && (
                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                    <input
                      type="text"
                      placeholder="e.g., JavaScript, Python"
                      value={skillsFilter}
                      onChange={(e) => setSkillsFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                      <option value="">Any Experience</option>
                      <option value="entry">Entry Level (0-2 years)</option>
                      <option value="mid">Mid Level (2-5 years)</option>
                      <option value="senior">Senior Level (5+ years)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills Verification</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                      <option value="">Any Verification</option>
                      <option value="high">Highly Verified (80%+)</option>
                      <option value="medium">Moderately Verified (50%+)</option>
                      <option value="basic">Basic Verification</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredCandidates.length} candidates found
            </h2>
          </div>
          
          <div className="p-6">
            {filteredCandidates.length > 0 ? (
              <div className="space-y-6">
                {filteredCandidates.map((candidate) => (
                  <div key={candidate.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-4 flex-1">
                        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {candidate.name.charAt(0)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                              <p className="text-gray-600">{candidate.title}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(candidate.availability)}`}>
                                {candidate.availability.charAt(0).toUpperCase() + candidate.availability.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <MapPin className="h-4 w-4 mr-2" />
                                {candidate.location}, {candidate.country}
                              </div>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <Award className="h-4 w-4 mr-2" />
                                Skills Verified: {candidate.verifiedSkills}/{candidate.totalSkills}
                              </div>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <Star className="h-4 w-4 mr-2 text-yellow-400" />
                                {candidate.rating} ({candidate.reviews} reviews)
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                Active {formatLastActive(candidate.lastActive)}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Experience:</strong> {candidate.experience}
                              </p>
                              <p className="text-sm text-gray-600 mb-3">
                                <strong>Education:</strong> {candidate.education}
                              </p>
                              <div className="mb-3">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                  <span>Profile Completion</span>
                                  <span>{candidate.profileCompletion}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary-600 h-2 rounded-full" 
                                    style={{ width: `${candidate.profileCompletion}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4">{candidate.bio}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {candidate.skills.slice(0, 5).map((skill) => (
                              <span 
                                key={skill}
                                className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                +{candidate.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-4">
                      <button 
                        className="text-primary-600 hover:text-primary-700 flex items-center text-sm font-medium"
                        onClick={() => handleViewProfile(candidate.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </button>
                      <button 
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                        onClick={() => handleContactCandidate(candidate.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No candidates found</p>
                <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default TalentSearchPage;

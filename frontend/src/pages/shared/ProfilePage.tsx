import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Mail, Phone, MapPin, Award, CreditCard as Edit3, Save, X, Plus } from 'lucide-react';

function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+250 788 123 456',
    location: 'Kigali, Rwanda',
    bio: 'Passionate TVET graduate with expertise in software development and electrical systems.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Electrical Systems'],
    experience: [
      {
        id: 1,
        title: 'Junior Developer',
        company: 'Tech Solutions Ltd',
        period: '2023 - Present',
        description: 'Developing web applications using modern technologies.'
      }
    ],
    education: [
      {
        id: 1,
        degree: 'Diploma in Software Development',
        institution: 'Rwanda Polytechnic',
        period: '2021 - 2023',
        description: 'Comprehensive training in software development and computer systems.'
      }
    ],
    certifications: [
      {
        id: 1,
        name: 'React Developer Certificate',
        issuer: 'Global Tech Institute',
        date: '2023',
        verified: true
      }
    ]
  });

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setIsEditing(false);
  };

  const addSkill = () => {
    const newSkill = prompt('Enter a skill:');
    if (newSkill && !profile.skills.includes(newSkill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white relative">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-primary-100">{user?.role ? user.role.replace('-', ' ').charAt(0).toUpperCase() + user.role.slice(1).replace('-', ' ') : ''}</p>
                  <div className="flex items-center mt-2 text-primary-100">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.location}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 flex items-center"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    ) : (
                      <span className="text-gray-700">{profile.email}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    ) : (
                      <span className="text-gray-700">{profile.phone}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    ) : (
                      <span className="text-gray-700">{profile.location}</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Bio</h2>
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-700">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                {isEditing && (
                  <button
                    onClick={addSkill}
                    className="bg-primary-600 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Skill
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span 
                    key={skill}
                    className="px-3 py-2 bg-primary-100 text-primary-800 rounded-lg font-medium flex items-center"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience</h2>
              <div className="space-y-4">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                    <p className="text-gray-700">{exp.company}</p>
                    <p className="text-sm text-gray-500 mb-2">{exp.period}</p>
                    <p className="text-gray-600">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
              <div className="space-y-4">
                {profile.education.map((edu) => (
                  <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-700">{edu.institution}</p>
                    <p className="text-sm text-gray-500 mb-2">{edu.period}</p>
                    <p className="text-gray-600">{edu.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
              <div className="space-y-4">
                {profile.certifications.map((cert) => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                      <p className="text-gray-700">{cert.issuer}</p>
                      <p className="text-sm text-gray-500">{cert.date}</p>
                    </div>
                    {cert.verified && (
                      <div className="flex items-center text-green-600">
                        <Award className="h-5 w-5 mr-1" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;

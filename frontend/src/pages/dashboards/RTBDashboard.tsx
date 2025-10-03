import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserContext } from '../../contexts/UserContext';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users,
  TrendingUp,
  Award,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  FileText,
  Download,
  Filter,
  Search,
  Eye,
  MessageSquare
} from 'lucide-react';

interface Graduate {
  id: string;
  name: string;
  program: string;
  graduationYear: number;
  skills: string[];
  employmentStatus: 'employed' | 'seeking' | 'unemployed' | 'further-study';
  currentPosition?: string;
  currentCompany?: string;
  location: string;
  salaryRange?: string;
  skillsVerified: number;
  totalSkills: number;
  mentorshipStatus: 'active' | 'completed' | 'none';
  lastUpdate: string;
}

function RTBDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');

  // Mock graduates data
  const graduates: Graduate[] = [
    {
      id: '1',
      name: 'John Mukamana',
      program: 'Software Development',
      graduationYear: 2023,
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      employmentStatus: 'employed',
      currentPosition: 'Junior Developer',
      currentCompany: 'TechCorp International',
      location: 'Toronto, Canada',
      salaryRange: '$65,000 - $75,000 CAD',
      skillsVerified: 8,
      totalSkills: 10,
      mentorshipStatus: 'completed',
      lastUpdate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Marie Uwimana',
      program: 'Electrical Engineering',
      graduationYear: 2023,
      skills: ['Circuit Design', 'PLC Programming', 'AutoCAD', 'Power Systems'],
      employmentStatus: 'seeking',
      location: 'Kigali, Rwanda',
      skillsVerified: 6,
      totalSkills: 8,
      mentorshipStatus: 'active',
      lastUpdate: '2024-01-20'
    },
    {
      id: '3',
      name: 'David Nzeyimana',
      program: 'Automotive Technology',
      graduationYear: 2022,
      skills: ['Engine Diagnostics', 'Brake Systems', 'Transmission Repair'],
      employmentStatus: 'employed',
      currentPosition: 'Automotive Technician',
      currentCompany: 'German Auto Group',
      location: 'Munich, Germany',
      salaryRange: '€45,000 - €52,000',
      skillsVerified: 7,
      totalSkills: 9,
      mentorshipStatus: 'completed',
      lastUpdate: '2024-01-18'
    },
    {
      id: '4',
      name: 'Grace Mukamana',
      program: 'Software Development',
      graduationYear: 2023,
      skills: ['Java', 'Spring Boot', 'MySQL', 'Angular'],
      employmentStatus: 'unemployed',
      location: 'Kigali, Rwanda',
      skillsVerified: 4,
      totalSkills: 8,
      mentorshipStatus: 'none',
      lastUpdate: '2024-01-22'
    },
    {
      id: '5',
      name: 'Patrick Habimana',
      program: 'Civil Engineering',
      graduationYear: 2022,
      skills: ['Structural Design', 'Project Management', 'CAD', 'Construction'],
      employmentStatus: 'further-study',
      location: 'Kigali, Rwanda',
      skillsVerified: 5,
      totalSkills: 7,
      mentorshipStatus: 'active',
      lastUpdate: '2024-01-19'
    }
  ];

  const filteredGraduates = graduates.filter(graduate => {
    const matchesSearch = graduate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         graduate.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || graduate.employmentStatus === statusFilter;
    const matchesProgram = !programFilter || graduate.program === programFilter;
    return matchesSearch && matchesStatus && matchesProgram;
  });

  const stats = [
    {
      title: 'Total Graduates',
      value: graduates.length,
      change: '+12 this year',
      icon: Users,
      color: 'text-primary-600'
    },
    {
      title: 'Employment Rate',
      value: `${Math.round((graduates.filter(g => g.employmentStatus === 'employed').length / graduates.length) * 100)}%`,
      change: '+5% from last year',
      icon: TrendingUp,
      color: 'text-secondary-600'
    },
    {
      title: 'Skills Verified',
      value: graduates.reduce((sum, g) => sum + g.skillsVerified, 0),
      change: '+23 this month',
      icon: Award,
      color: 'text-purple-600'
    },
    {
      title: 'International Placements',
      value: graduates.filter(g => !g.location.includes('Rwanda')).length,
      change: '+3 this quarter',
      icon: MapPin,
      color: 'text-orange-600'
    }
  ];

  const programs = Array.from(new Set(graduates.map(g => g.program)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'employed':
        return 'bg-secondary-100 text-secondary-800';
      case 'seeking':
        return 'bg-yellow-100 text-yellow-800';
      case 'unemployed':
        return 'bg-red-100 text-red-800';
      case 'further-study':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMentorshipColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-secondary-100 text-secondary-800';
      case 'completed':
        return 'bg-primary-100 text-primary-800';
      case 'none':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Program', 'Graduation Year', 'Employment Status', 'Current Position', 'Location', 'Skills Verified', 'Mentorship Status'].join(','),
      ...filteredGraduates.map(g => [
        g.name,
        g.program,
        g.graduationYear,
        g.employmentStatus,
        g.currentPosition || 'N/A',
        g.location,
        `${g.skillsVerified}/${g.totalSkills}`,
        g.mentorshipStatus
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rtb_graduates_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">RTB Graduate Tracking Dashboard</h1>
          <p className="text-primary-100 mb-4">
            Monitor the progress and employment outcomes of TVET graduates. Track skills development, employment status, and identify support gaps.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => window.open('/rtb/reports', '_blank')}
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
            <button className="bg-primary-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-800 transition-colors flex items-center">
              <Link to="/rtb/analytics" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
              </Link>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Employment Status Overview */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Employment Status Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-secondary-50 rounded-lg">
                <div className="text-2xl font-bold text-secondary-600 mb-1">
                  {graduates.filter(g => g.employmentStatus === 'employed').length}
                </div>
                <div className="text-sm font-medium text-secondary-700">Employed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {graduates.filter(g => g.employmentStatus === 'seeking').length}
                </div>
                <div className="text-sm font-medium text-yellow-700">Job Seeking</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {graduates.filter(g => g.employmentStatus === 'unemployed').length}
                </div>
                <div className="text-sm font-medium text-red-700">Unemployed</div>
              </div>
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {graduates.filter(g => g.employmentStatus === 'further-study').length}
                </div>
                <div className="text-sm font-medium text-primary-700">Further Study</div>
              </div>
            </div>
          </div>
        </div>

        {/* Graduates List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Graduate Tracking</h2>
              <div className="flex space-x-2">
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search graduates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="employed">Employed</option>
                  <option value="seeking">Job Seeking</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="further-study">Further Study</option>
                </select>
                <select
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Programs</option>
                  {programs.map((program) => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {filteredGraduates.map((graduate) => (
                <div key={graduate.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{graduate.name}</h3>
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(graduate.employmentStatus)}`}>
                          {graduate.employmentStatus.charAt(0).toUpperCase() + graduate.employmentStatus.slice(1).replace('-', ' ')}
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getMentorshipColor(graduate.mentorshipStatus)}`}>
                          Mentorship: {graduate.mentorshipStatus}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Program:</strong> {graduate.program} ({graduate.graduationYear})
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Location:</strong> {graduate.location}
                          </p>
                          {graduate.currentPosition && (
                            <p className="text-sm text-gray-600">
                              <strong>Position:</strong> {graduate.currentPosition} at {graduate.currentCompany}
                            </p>
                          )}
                          {graduate.salaryRange && (
                            <p className="text-sm text-gray-600">
                              <strong>Salary:</strong> {graduate.salaryRange}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Skills Verified:</strong> {graduate.skillsVerified}/{graduate.totalSkills}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{ width: `${(graduate.skillsVerified / graduate.totalSkills) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {graduate.skills.slice(0, 3).map((skill) => (
                              <span 
                                key={skill}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {graduate.skills.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                +{graduate.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500">Last updated: {graduate.lastUpdate}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </button>
                      <button className="text-secondary-600 hover:text-secondary-700 text-sm font-medium flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contact
                      </button>
                    </div>
                  </div>
                  
                  {/* Action Items for Unemployed/Seeking */}
                  {(graduate.employmentStatus === 'unemployed' || graduate.employmentStatus === 'seeking') && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-yellow-800">Action Required</span>
                      </div>
                      <div className="text-xs text-yellow-700 space-y-1">
                        {graduate.skillsVerified < graduate.totalSkills && (
                          <p>• Complete skills verification ({graduate.totalSkills - graduate.skillsVerified} skills pending)</p>
                        )}
                        {graduate.mentorshipStatus === 'none' && (
                          <p>• Assign mentor for career guidance</p>
                        )}
                        <p>• Review job matching opportunities</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {filteredGraduates.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No graduates found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Skills Gap Analysis */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Skills Gap Analysis</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Most In-Demand Skills</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">JavaScript</span>
                    <span className="text-sm font-medium text-primary-600">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Python</span>
                    <span className="text-sm font-medium text-primary-600">72%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">React</span>
                    <span className="text-sm font-medium text-primary-600">68%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Skills Gaps</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Cloud Computing</span>
                    <span className="text-sm font-medium text-red-600">32%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">DevOps</span>
                    <span className="text-sm font-medium text-red-600">28%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Data Analysis</span>
                    <span className="text-sm font-medium text-red-600">25%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Recommendations</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Introduce cloud computing modules</p>
                  <p>• Partner with tech companies for DevOps training</p>
                  <p>• Expand data analysis curriculum</p>
                  <p>• Increase industry mentorship programs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RTBDashboard;
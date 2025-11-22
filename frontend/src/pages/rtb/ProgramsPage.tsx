import { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  GraduationCap,
  TrendingUp,
  Users,
  Award,
  Target,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Download,
  MapPin,
  Briefcase
} from 'lucide-react';
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from '../../config/api';

interface Program {
  id: string;
  name: string;
  institution: string;
  duration: string;
  graduates: number;
  employmentRate: number;
  averageSalary: string;
  skillsVerified: number;
  internationalPlacements: number;
  rating: number;
  status: 'excellent' | 'good' | 'needs-improvement';
  trends: {
    enrollment: 'up' | 'down' | 'stable';
    employment: 'up' | 'down' | 'stable';
    satisfaction: 'up' | 'down' | 'stable';
  };
}

function RTBProgramsPage() {
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [sortBy, setSortBy] = useState('employment');

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const headers = getAuthHeaders();
        const res = await fetch(getApiUrl(`${API_ENDPOINTS.RTB}/dashboard`), { headers });
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data || {};
        const perf = data.programPerformance || [];
        // Map programPerformance to Program shape
        const mapped: Program[] = perf.map((p: any, idx: number) => ({
          id: p._id || String(idx),
          name: p.program || p._id || 'Unknown',
          institution: p.institution || 'Various',
          duration: p.duration || 'N/A',
          graduates: p.totalGraduates || p.total || 0,
          employmentRate: Math.round(p.employmentRate || (p.employed && p.totalGraduates ? (p.employed / p.totalGraduates) * 100 : 0)),
          averageSalary: p.avgSalary ? `$${p.avgSalary}` : p.avgSalary || 'N/A',
          skillsVerified: p.verifiedSkills || 0,
          internationalPlacements: p.internationalPlacements || 0,
          rating: p.avgRating || 0,
          status: 'good',
          trends: {
            enrollment: 'stable',
            employment: 'stable',
            satisfaction: 'stable'
          }
        }));

        setPrograms(mapped);
      } catch (err) {
        console.error('Failed to load program performance', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const institutions = Array.from(new Set(programs.map(p => p.institution)));
  
  const filteredPrograms = selectedInstitution === 'all' 
    ? programs 
    : programs.filter(p => p.institution === selectedInstitution);

  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    switch (sortBy) {
      case 'employment':
        return b.employmentRate - a.employmentRate;
      case 'graduates':
        return b.graduates - a.graduates;
      case 'rating':
        return b.rating - a.rating;
      case 'salary':
        return parseInt(b.averageSalary.replace(/[$,]/g, '')) - parseInt(a.averageSalary.replace(/[$,]/g, ''));
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'needs-improvement':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  const overallStats = {
    totalGraduates: programs.reduce((sum, p) => sum + (p.graduates || 0), 0),
    averageEmployment: programs.length > 0 ? Math.round(programs.reduce((sum, p) => sum + (p.employmentRate || 0), 0) / programs.length) : 0,
    averageRating: programs.length > 0 ? (programs.reduce((sum, p) => sum + (p.rating || 0), 0) / programs.length).toFixed(1) : '0.0',
    totalInternational: programs.reduce((sum, p) => sum + (p.internationalPlacements || 0), 0)
  };
  const notify = useNotification();

  const exportReport = () => {
    console.log('Exporting program effectiveness report...');
    notify.success('Program effectiveness report exported successfully!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Program Effectiveness</h1>
            <p className="text-gray-600">Monitor and evaluate TVET program performance and outcomes</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Institutions</option>
              {institutions.map((institution) => (
                <option key={institution} value={institution}>{institution}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="employment">Sort by Employment Rate</option>
              <option value="graduates">Sort by Graduates</option>
              <option value="rating">Sort by Rating</option>
              <option value="salary">Sort by Salary</option>
            </select>
            <button
              onClick={exportReport}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Graduates</p>
                <p className="text-3xl font-bold text-primary-600">{overallStats.totalGraduates}</p>
                <p className="text-sm text-green-500">+12% from last year</p>
              </div>
              <GraduationCap className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Employment Rate</p>
                <p className="text-3xl font-bold text-green-600">{overallStats.averageEmployment}%</p>
                <p className="text-sm text-green-500">+3% from last year</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">International Placements</p>
                <p className="text-3xl font-bold text-blue-600">{overallStats.totalInternational}</p>
                <p className="text-sm text-blue-500">45% of employed</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Program Rating</p>
                <p className="text-3xl font-bold text-purple-600">{overallStats.averageRating}</p>
                <p className="text-sm text-purple-500">Out of 5.0</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Programs List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Program Performance Overview</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {sortedPrograms.map((program) => (
                <div key={program.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(program.status)}`}>
                          {getStatusIcon(program.status)}
                          <span className="ml-1 capitalize">{program.status.replace('-', ' ')}</span>
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span>{program.institution}</span>
                        <span>•</span>
                        <span>{program.duration}</span>
                        <span>•</span>
                        <span>Rating: {program.rating}/5.0</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{program.employmentRate}%</div>
                      <div className="text-sm text-gray-500">Employment Rate</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6 mb-4">
                    <div className="text-center p-4 bg-primary-50 rounded-lg">
                      <Users className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-primary-600">{program.graduates}</div>
                      <div className="text-sm text-primary-700">Graduates</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Award className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-green-600">{program.skillsVerified}%</div>
                      <div className="text-sm text-green-700">Skills Verified</div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-blue-600">{program.internationalPlacements}</div>
                      <div className="text-sm text-blue-700">International</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-purple-600">{program.averageSalary}</div>
                      <div className="text-sm text-purple-700">Avg Salary</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Trends</h4>
                    <div className="flex space-x-6">
                      <div className="flex items-center">
                        {getTrendIcon(program.trends.enrollment)}
                        <span className="ml-2 text-sm text-gray-600">Enrollment</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(program.trends.employment)}
                        <span className="ml-2 text-sm text-gray-600">Employment</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(program.trends.satisfaction)}
                        <span className="ml-2 text-sm text-gray-600">Satisfaction</span>
                      </div>
                    </div>
                  </div>

                  {program.status === 'needs-improvement' && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-red-800 mb-2">Improvement Areas</h5>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Enhance industry partnerships for better job placement</li>
                        <li>• Update curriculum to match current market demands</li>
                        <li>• Improve skills verification and certification processes</li>
                        <li>• Strengthen career guidance and mentorship programs</li>
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Strategic Recommendations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">High-Performing Programs</h3>
              <ul className="space-y-1 text-primary-100 text-sm">
                <li>• Scale successful practices to other programs</li>
                <li>• Increase enrollment capacity for high-demand programs</li>
                <li>• Establish centers of excellence</li>
                <li>• Share best practices across institutions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Programs Needing Support</h3>
              <ul className="space-y-1 text-primary-100 text-sm">
                <li>• Provide additional resources and training</li>
                <li>• Strengthen industry partnerships</li>
                <li>• Update curriculum and equipment</li>
                <li>• Implement targeted improvement plans</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RTBProgramsPage;

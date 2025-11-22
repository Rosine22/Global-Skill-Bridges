import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users,
  TrendingUp,
  Award,
  MapPin,
  AlertTriangle,
  BarChart3,
  Download,
  Search,
  Eye,
  MessageSquare,
  X
} from 'lucide-react';
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from '../../config/api';

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

interface ProgramPerformance {
  program?: string;
  _id?: string;
  totalGraduates?: number;
  total?: number;
  employmentRate?: number;
  avgSalary?: number;
}

interface SkillGap {
  skill?: string;
  _id?: string;
  skillName?: string;
  totalMentions?: number;
  criticalMentions?: number;
  priority?: string;
  count?: number;
}

interface InternationalStats {
  totalWithInternationalInterest?: number;
  currentlyInternational?: number;
}

interface EmploymentTrend {
  _id?: { status?: string } | string;
  status?: string;
  count?: number;
}

interface SalaryEntry {
  avgSalary?: number;
}

function RTBDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [showEmploymentModal, setShowEmploymentModal] = useState(false);
  const [selectedEmploymentStatus, setSelectedEmploymentStatus] = useState<string>('');

  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [overview, setOverview] = useState({
    totalGraduates: 0,
    employmentRate: 0,
    internationalPlacements: 0,
    averageSalary: 0
  });
  const [skillsOverview, setSkillsOverview] = useState({
    totalSkills: 0,
    verifiedSkills: 0,
    verificationRate: 0
  });
  const [programPerformance, setProgramPerformance] = useState<ProgramPerformance[]>([]);
  const [skillsGaps, setSkillsGaps] = useState<SkillGap[]>([]);
  const [internationalStats, setInternationalStats] = useState<InternationalStats>({});
  const [employmentTrends, setEmploymentTrends] = useState<EmploymentTrend[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();

        const [rtbRes, skillsRes, analyticsRes] = await Promise.all([
          fetch(getApiUrl(`${API_ENDPOINTS.RTB}/dashboard`), { headers }),
          fetch(getApiUrl('/api/skills/analytics'), { headers }),
          fetch(getApiUrl(`${API_ENDPOINTS.RTB}/analytics?timeframe=yearly`), { headers })
        ]);

        if (rtbRes.ok) {
          const rtbJson = await rtbRes.json();
          const data = rtbJson.data || {};
          setGraduates((data.recentGraduates || []).map((g: unknown) => {
            const rec = g as Record<string, unknown>;
            const userObj = rec.user as Record<string, unknown> | undefined;
            const id = (rec._id as string) || (rec.id as string) || (userObj && (userObj._id as string)) || String(Math.random());
            const name = (userObj && (userObj.name as string)) || (userObj && (userObj.fullName as string)) || (rec.name as string) || 'Unknown';
            const program = (rec.program as string) || (rec.programName as string) || 'Unknown';
            const graduationYear = (rec.graduationYear as number) || (rec.year as number) || new Date().getFullYear();
            const rawSkills = (rec.skills as unknown[]) || [];
            const skills: string[] = rawSkills.map((s) => {
              if (typeof s === 'string') return s;
              const maybe = s as Record<string, unknown>;
              return typeof maybe.name === 'string' ? maybe.name : '';
            }).filter(Boolean) as string[];

            const employmentHistory = rec.employmentHistory as Record<string, unknown>[] | undefined;
            const employmentStatus = (rec.employmentStatus as Graduate['employmentStatus']) || 'seeking';
            const currentPosition = (rec.currentPosition as string) || (employmentHistory && (employmentHistory[0].position as string)) || undefined;
            const currentCompany = (rec.currentCompany as string) || (employmentHistory && (employmentHistory[0].company as string)) || undefined;
            const userLocation = userObj?.location as Record<string, unknown> | undefined;
            const location = userLocation && typeof userLocation.city === 'string' && typeof userLocation.country === 'string' ? `${userLocation.city as string}, ${userLocation.country as string}` : ((rec.location as string) || 'Unknown');
            const salaryRange = rec.currentSalaryRange as string | undefined;
            const skillsVerified = (rec.skillsVerified as number) || 0;
            const totalSkills = (rec.totalSkills as number) || 0;
            const mentorshipStatus = (rec.mentorshipStatus as Graduate['mentorshipStatus']) || 'none';
            const lastUpdate = (rec.lastContactDate as string) || (rec.updatedAt as string) || (rec.createdAt as string) || new Date().toISOString();

            return {
              id,
              name,
              program,
              graduationYear,
              skills,
              employmentStatus,
              currentPosition,
              currentCompany,
              location,
              salaryRange,
              skillsVerified,
              totalSkills,
              mentorshipStatus,
              lastUpdate
            } as Graduate;
          }));

          setOverview({
            totalGraduates: data.overview?.totalGraduates || data.totalGraduates || 0,
            employmentRate: parseFloat(data.overview?.overallEmploymentRate || data.overallEmploymentRate || 0),
            internationalPlacements: data.overview?.internationalPlacements || data.internationalPlacements || 0,
            averageSalary: 0
          });

          // program performance, skills gaps, international stats and trends
          setProgramPerformance(data.programPerformance || []);
          setSkillsGaps(data.skillsGaps || []);
          setInternationalStats(data.internationalStats || {});
          setEmploymentTrends(data.employmentTrends || []);
        }

        if (skillsRes.ok) {
          const skillsJson = await skillsRes.json();
          const sdata = skillsJson.data || {};
          const tot = sdata.overview?.totalSkills || 0;
          const verified = sdata.overview?.verifiedSkills || 0;
          setSkillsOverview({
            totalSkills: tot,
            verifiedSkills: verified,
            verificationRate: tot > 0 ? Math.round((verified / tot) * 100) : 0
          });
        }

        if (analyticsRes.ok) {
          const ajson = await analyticsRes.json();
          const aData = ajson.data || {};
          const salaryArr: SalaryEntry[] = aData.salaryAnalysis || [];
          if (salaryArr.length > 0) {
            const avg = Math.round(salaryArr.reduce((sum, s) => sum + (s.avgSalary || 0), 0) / salaryArr.length);
            setOverview(prev => ({ ...prev, averageSalary: avg }));
          }
        }
      } catch (err) {
        console.error('Failed to load RTB dashboard data', err);
      }
    };

    fetchData();
  }, []);

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
      value: overview.totalGraduates,
      change: '',
      icon: Users,
      color: 'text-primary-600'
    },
    {
      title: 'Employment Rate',
      value: `${overview.employmentRate}%`,
      change: '',
      icon: TrendingUp,
      color: 'text-secondary-600'
    },
    {
      title: 'Skills Verified',
      value: skillsOverview.verifiedSkills,
      change: '',
      icon: Award,
      color: 'text-purple-600'
    },
    {
      title: 'International Placements',
      value: overview.internationalPlacements,
      change: '',
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

  const handleEmploymentStatusClick = (status: string) => {
    setSelectedEmploymentStatus(status);
    setShowEmploymentModal(true);
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
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
          <p className="text-primary-100 mb-4">
            Monitor the progress and employment outcomes of TVET graduates. Track skills development, employment status, and identify support gaps.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={exportData}
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
            <Link 
              to="/rtb/analytics" 
              className="bg-primary-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-800 transition-colors flex items-center"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
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
              <button 
                onClick={() => handleEmploymentStatusClick('employed')}
                className="text-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors cursor-pointer border-2 border-transparent hover:border-secondary-200"
              >
                <div className="text-2xl font-bold text-secondary-600 mb-1">
                  {graduates.filter(g => g.employmentStatus === 'employed').length}
                </div>
                <div className="text-sm font-medium text-secondary-700">Employed</div>
                <div className="text-xs text-secondary-600 mt-1">Click to view details</div>
              </button>
              <button 
                onClick={() => handleEmploymentStatusClick('seeking')}
                className="text-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer border-2 border-transparent hover:border-yellow-200"
              >
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {graduates.filter(g => g.employmentStatus === 'seeking').length}
                </div>
                <div className="text-sm font-medium text-yellow-700">Job Seeking</div>
                <div className="text-xs text-yellow-600 mt-1">Click to view details</div>
              </button>
              <button 
                onClick={() => handleEmploymentStatusClick('unemployed')}
                className="text-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer border-2 border-transparent hover:border-red-200"
              >
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {graduates.filter(g => g.employmentStatus === 'unemployed').length}
                </div>
                <div className="text-sm font-medium text-red-700">Unemployed</div>
                <div className="text-xs text-red-600 mt-1">Click to view details</div>
              </button>
              <button 
                onClick={() => handleEmploymentStatusClick('further-study')}
                className="text-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer border-2 border-transparent hover:border-primary-200"
              >
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {graduates.filter(g => g.employmentStatus === 'further-study').length}
                </div>
                <div className="text-sm font-medium text-primary-700">Further Study</div>
                <div className="text-xs text-primary-600 mt-1">Click to view details</div>
              </button>
            </div>
          </div>
        </div>

        {/* Graduates List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Graduate Tracking</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate('/rtb/graduates')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
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
                      <button 
                        onClick={() => navigate(`/profile/${graduate.id}`)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </button>
                      <button 
                        onClick={() => navigate(`/messages?user=${graduate.id}`)}
                        className="text-secondary-600 hover:text-secondary-700 text-sm font-medium flex items-center"
                      >
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

        {/* Skills Gap Analysis, Program Effectiveness, Deployment Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skills Gap */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Skills Gap Analysis</h2>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-1 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Most In-Demand Skills</h3>
                  <div className="space-y-2">
                    {(skillsGaps && skillsGaps.length > 0 ?
                      [...skillsGaps]
                        .sort((a,b)=> (b.totalMentions || 0) - (a.totalMentions || 0))
                        .slice(0,3)
                        .map((s) => (
                          <div key={s.skill || s._id || s.skillName} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">{s.skill || s._id || s.skillName}</span>
                            <span className="text-sm font-medium text-primary-600">{(s.totalMentions ?? s.count ?? '—')}</span>
                          </div>
                        )) : (
                          <div className="text-sm text-gray-500">No skills demand data available.</div>
                        )
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Top Skills Gaps</h3>
                  <div className="space-y-2">
                    {(skillsGaps && skillsGaps.length > 0 ?
                      [...skillsGaps]
                        .sort((a,b)=> (b.criticalMentions || 0) - (a.criticalMentions || 0))
                        .slice(0,3)
                        .map((s)=> (
                          <div key={(s.skill || s._id || s.skillName)+"-gap"} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">{s.skill || s._id || s.skillName}</span>
                            <span className="text-sm font-medium text-red-600">{(s.criticalMentions ?? s.totalMentions ?? '—')}</span>
                          </div>
                        )) : (
                          <div className="text-sm text-gray-500">No skills gap data available.</div>
                        )
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Recommendations</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {skillsGaps && skillsGaps.length > 0 ? (
                        skillsGaps
                          .filter((s)=> (s.priority || '').toLowerCase() === 'high')
                          .slice(0,4)
                          .map((s)=> (
                            <p key={(s.skill||s._id||s.skillName)+"-rec"}>• Prioritise training for {s.skill || s._id || s.skillName} ({(s.criticalMentions ?? s.totalMentions)} mentions)</p>
                          ))
                    ) : (
                      <>
                        <p>• No detailed recommendations available — collect more assessments.</p>
                        <p>• Consider partnerships for short courses on cloud, data and DevOps.</p>
                        <p>• Increase mentorship and employer engagement to validate skills.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Program Effectiveness */}
          <div className="bg-white rounded-lg shadow-sm border lg:col-span-1">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Program Effectiveness</h2>
              <Link to="/rtb/programs" className="text-sm text-primary-600">See all</Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {(programPerformance && programPerformance.length > 0) ? (
                  programPerformance.slice(0,6).map((p)=> (
                    <div key={p.program || p._id || Math.random()} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{p.program || p._id}</div>
                        <div className="text-xs text-gray-500">Graduates: {(p.totalGraduates ?? p.total) || 0}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{Math.round((p.employmentRate ?? 0))}%</div>
                        <div className="text-xs text-gray-500">Avg salary: {p.avgSalary ? `$${p.avgSalary}` : '—'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No program performance data available.</div>
                )}
              </div>
            </div>
          </div>

          {/* Deployment / International Mobility & Trends */}
          <div className="bg-white rounded-lg shadow-sm border lg:col-span-1">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Deployment & Mobility</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Total with international interest</span>
                  <span className="font-medium">{(internationalStats?.totalWithInternationalInterest ?? '—')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Currently internationally placed</span>
                  <span className="font-medium">{(internationalStats?.currentlyInternational ?? '—')}</span>
                </div>
                <div className="flex justify-between">
                  <span>International placement rate</span>
                  <span className="font-medium">{internationalStats && internationalStats.currentlyInternational && internationalStats.totalWithInternationalInterest ? Math.round((internationalStats.currentlyInternational / Math.max(1, internationalStats.totalWithInternationalInterest)) * 100) + '%' : '—'}</span>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600">Employment (last 12 months):</div>
                  <div className="mt-2 text-lg font-semibold">
                    {employmentTrends && employmentTrends.length > 0 ? (
                      employmentTrends.reduce((sum, t) => {
                        const idObj = t._id as { status?: string } | undefined;
                        const status = (idObj && idObj.status) || (t.status) || '';
                        return status === 'employed' ? sum + (t.count || 0) : sum;
                      }, 0)
                    ) : '—'}
                  </div>
                  <div className="text-xs text-gray-500">Number of employment events recorded in recent trends</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Status Details Modal */}
        {showEmploymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 capitalize">
                      {selectedEmploymentStatus === 'further-study' 
                        ? 'Further Study' 
                        : selectedEmploymentStatus.replace('-', ' ')} Graduates
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {graduates.filter(g => g.employmentStatus === selectedEmploymentStatus).length} graduates
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEmploymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {graduates
                    .filter(g => g.employmentStatus === selectedEmploymentStatus)
                    .map((graduate) => (
                    <div key={graduate.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{graduate.name}</h4>
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
                                {graduate.skills.slice(0, 4).map((skill) => (
                                  <span 
                                    key={skill}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {graduate.skills.length > 4 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                    +{graduate.skills.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-500">Last updated: {graduate.lastUpdate}</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setShowEmploymentModal(false);
                              navigate(`/profile/${graduate.id}`);
                            }}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </button>
                          <button 
                            onClick={() => {
                              setShowEmploymentModal(false);
                              navigate(`/messages?user=${graduate.id}`);
                            }}
                            className="text-secondary-600 hover:text-secondary-700 text-sm font-medium flex items-center"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Contact
                          </button>
                        </div>
                      </div>
                      
                      {/* Action Items for specific statuses */}
                      {(graduate.employmentStatus === 'unemployed' || graduate.employmentStatus === 'seeking') && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                          <div className="flex items-center mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-yellow-800">Recommended Actions</span>
                          </div>
                          <div className="text-xs text-yellow-700 space-y-1">
                            {graduate.skillsVerified < graduate.totalSkills && (
                              <p>• Complete skills verification ({graduate.totalSkills - graduate.skillsVerified} skills pending)</p>
                            )}
                            {graduate.mentorshipStatus === 'none' && (
                              <p>• Assign mentor for career guidance</p>
                            )}
                            <p>• Review job matching opportunities</p>
                            <p>• Connect with employment support services</p>
                          </div>
                        </div>
                      )}
                      
                      {graduate.employmentStatus === 'employed' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                          <div className="flex items-center mb-2">
                            <Award className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800">Employment Success</span>
                          </div>
                          <div className="text-xs text-green-700 space-y-1">
                            <p>• Successfully placed in {graduate.currentCompany}</p>
                            {graduate.salaryRange && <p>• Salary range: {graduate.salaryRange}</p>}
                            <p>• Consider for alumni mentorship program</p>
                            <p>• Schedule follow-up for career progression</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {graduates.filter(g => g.employmentStatus === selectedEmploymentStatus).length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No graduates with this employment status.</p>
                  </div>
                )}
                
                {/* Summary Actions for the group */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Showing {graduates.filter(g => g.employmentStatus === selectedEmploymentStatus).length} graduates
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => {
                          const statusGraduates = graduates.filter(g => g.employmentStatus === selectedEmploymentStatus);
                          const csvContent = [
                            ['Name', 'Program', 'Graduation Year', 'Employment Status', 'Current Position', 'Location', 'Skills Verified', 'Mentorship Status'].join(','),
                            ...statusGraduates.map(g => [
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
                          a.download = `${selectedEmploymentStatus}_graduates.csv`;
                          a.click();
                          window.URL.revokeObjectURL(url);
                        }}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export List
                      </button>
                      <button
                        onClick={() => setShowEmploymentModal(false)}
                        className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default RTBDashboard;

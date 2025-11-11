import { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Award, 
  Target,
  Download,
  Briefcase
} from 'lucide-react';

function RTBSkillsGapPage() {
  const [selectedSector, setSelectedSector] = useState('all');

  const skillsGapData = [
    {
      skill: 'Cloud Computing (AWS/Azure)',
      sector: 'Technology',
      marketDemand: 92,
      graduateCompetency: 28,
      gap: 64,
      trend: 'increasing',
      priority: 'critical',
      jobOpenings: 145,
      averageSalary: '$75,000'
    },
    {
      skill: 'DevOps & CI/CD',
      sector: 'Technology',
      marketDemand: 88,
      graduateCompetency: 22,
      gap: 66,
      trend: 'increasing',
      priority: 'critical',
      jobOpenings: 98,
      averageSalary: '$72,000'
    },
    {
      skill: 'Data Science & Analytics',
      sector: 'Technology',
      marketDemand: 85,
      graduateCompetency: 35,
      gap: 50,
      trend: 'stable',
      priority: 'high',
      jobOpenings: 76,
      averageSalary: '$68,000'
    },
    {
      skill: 'Renewable Energy Systems',
      sector: 'Engineering',
      marketDemand: 78,
      graduateCompetency: 45,
      gap: 33,
      trend: 'increasing',
      priority: 'high',
      jobOpenings: 54,
      averageSalary: '$62,000'
    },
    {
      skill: 'IoT & Smart Systems',
      sector: 'Engineering',
      marketDemand: 82,
      graduateCompetency: 38,
      gap: 44,
      trend: 'increasing',
      priority: 'high',
      jobOpenings: 67,
      averageSalary: '$65,000'
    },
    {
      skill: 'Electric Vehicle Technology',
      sector: 'Automotive',
      marketDemand: 75,
      graduateCompetency: 42,
      gap: 33,
      trend: 'increasing',
      priority: 'medium',
      jobOpenings: 43,
      averageSalary: '$58,000'
    },
    {
      skill: 'Advanced Manufacturing',
      sector: 'Manufacturing',
      marketDemand: 70,
      graduateCompetency: 55,
      gap: 15,
      trend: 'stable',
      priority: 'low',
      jobOpenings: 32,
      averageSalary: '$52,000'
    },
    {
      skill: 'Cybersecurity',
      sector: 'Technology',
      marketDemand: 90,
      graduateCompetency: 25,
      gap: 65,
      trend: 'increasing',
      priority: 'critical',
      jobOpenings: 112,
      averageSalary: '$78,000'
    }
  ];

  const recommendations = [
    {
      skill: 'Cloud Computing',
      actions: [
        'Partner with AWS/Azure for certification programs',
        'Integrate cloud labs into curriculum',
        'Provide hands-on cloud project experience',
        'Establish cloud computing specialization track'
      ],
      timeline: '6-12 months',
      investment: 'High',
      impact: 'Critical'
    },
    {
      skill: 'DevOps',
      actions: [
        'Introduce DevOps methodology courses',
        'Set up CI/CD pipeline training labs',
        'Partner with tech companies for internships',
        'Create DevOps bootcamp programs'
      ],
      timeline: '3-6 months',
      investment: 'Medium',
      impact: 'High'
    },
    {
      skill: 'Cybersecurity',
      actions: [
        'Develop cybersecurity specialization',
        'Establish security testing labs',
        'Partner with cybersecurity firms',
        'Integrate security practices across programs'
      ],
      timeline: '6-9 months',
      investment: 'High',
      impact: 'Critical'
    }
  ];

  const filteredData = selectedSector === 'all' 
    ? skillsGapData 
    : skillsGapData.filter(item => item.sector === selectedSector);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const notify = useNotification();

  const exportReport = () => {
    console.log('Exporting skills gap report...');
    notify.success('Skills gap analysis report exported successfully!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Skills Gap Analysis</h1>
            <p className="text-gray-600">Identify critical skill shortages and development priorities</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Sectors</option>
              <option value="Technology">Technology</option>
              <option value="Engineering">Engineering</option>
              <option value="Automotive">Automotive</option>
              <option value="Manufacturing">Manufacturing</option>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Skills Gaps</p>
                <p className="text-3xl font-bold text-red-600">
                  {filteredData.filter(item => item.priority === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Gap</p>
                <p className="text-3xl font-bold text-orange-600">
                  {Math.round(filteredData.reduce((sum, item) => sum + item.gap, 0) / filteredData.length)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Job Opportunities</p>
                <p className="text-3xl font-bold text-blue-600">
                  {filteredData.reduce((sum, item) => sum + item.jobOpenings, 0)}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Salary Potential</p>
                <p className="text-3xl font-bold text-green-600">$67K</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Skills Gap Analysis Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Detailed Skills Analysis</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skill / Sector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Demand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Graduate Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gap
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opportunities
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.skill}</div>
                        <div className="text-sm text-gray-500">{item.sector}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.marketDemand}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.marketDemand}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${item.graduateCompetency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.graduateCompetency}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTrendIcon(item.trend)}
                        <span className="ml-2 text-sm font-medium text-gray-900">{item.gap}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.jobOpenings} jobs</div>
                        <div className="text-sm text-gray-500">{item.averageSalary}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Strategic Recommendations</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.skill}</h3>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rec.impact === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {rec.impact} Impact
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {rec.timeline}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recommended Actions</h4>
                      <ul className="space-y-1">
                        {rec.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">Investment Level</h5>
                          <p className={`text-sm font-medium ${
                            rec.investment === 'High' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {rec.investment}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">Timeline</h5>
                          <p className="text-sm text-gray-600">{rec.timeline}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Implementation Roadmap */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Implementation Roadmap</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Phase 1 (0-6 months)</h3>
              <ul className="text-sm text-primary-100 space-y-1">
                <li>• Establish cloud computing labs</li>
                <li>• Launch DevOps training programs</li>
                <li>• Partner with industry leaders</li>
                <li>• Begin curriculum updates</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Phase 2 (6-12 months)</h3>
              <ul className="text-sm text-primary-100 space-y-1">
                <li>• Roll out new specializations</li>
                <li>• Implement certification programs</li>
                <li>• Expand industry partnerships</li>
                <li>• Launch mentorship initiatives</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Phase 3 (12+ months)</h3>
              <ul className="text-sm text-primary-100 space-y-1">
                <li>• Evaluate program effectiveness</li>
                <li>• Scale successful initiatives</li>
                <li>• Continuous curriculum updates</li>
                <li>• Measure employment outcomes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RTBSkillsGapPage;

import { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardLayout from '../../components/DashboardLayout';
import { TrendingUp, MapPin, Award, Download } from 'lucide-react';

function RTBAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('12months');

  const employmentData = [
    { program: 'Software Development', employed: 85, seeking: 12, unemployed: 3 },
    { program: 'Electrical Engineering', employed: 78, seeking: 15, unemployed: 7 },
    { program: 'Automotive Technology', employed: 82, seeking: 10, unemployed: 8 },
    { program: 'Civil Engineering', employed: 75, seeking: 18, unemployed: 7 },
    { program: 'Mechanical Engineering', employed: 80, seeking: 14, unemployed: 6 }
  ];

  const locationData = [
    { location: 'Rwanda', count: 245, percentage: 45 },
    { location: 'Canada', count: 98, percentage: 18 },
    { location: 'UAE', count: 76, percentage: 14 },
    { location: 'Germany', count: 54, percentage: 10 },
    { location: 'Other', count: 71, percentage: 13 }
  ];

  const salaryRanges = [
    { range: '$20,000 - $30,000', count: 45, percentage: 12 },
    { range: '$30,000 - $50,000', count: 128, percentage: 34 },
    { range: '$50,000 - $70,000', count: 98, percentage: 26 },
    { range: '$70,000 - $100,000', count: 76, percentage: 20 },
    { range: '$100,000+', count: 29, percentage: 8 }
  ];

  const skillsInDemand = [
    { skill: 'JavaScript', demand: 95, graduates: 78, gap: 17 },
    { skill: 'Python', demand: 88, graduates: 65, gap: 23 },
    { skill: 'React', demand: 82, graduates: 56, gap: 26 },
    { skill: 'Cloud Computing', demand: 90, graduates: 34, gap: 56 },
    { skill: 'DevOps', demand: 75, graduates: 28, gap: 47 },
    { skill: 'Data Analysis', demand: 85, graduates: 42, gap: 43 }
  ];

  const notify = useNotification();

  const exportData = (type: string) => {
    // Mock export functionality
    console.log(`Exporting ${type} data...`);
    notify.success(`${type} data exported successfully!`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employment Analytics</h1>
            <p className="text-gray-600">Comprehensive analysis of graduate employment outcomes and trends</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="2years">Last 2 Years</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={() => exportData('Analytics')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Employment Rate</p>
                <p className="text-3xl font-bold text-green-600">79.8%</p>
                <p className="text-sm text-green-500">+5.2% from last year</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">International Placements</p>
                <p className="text-3xl font-bold text-blue-600">298</p>
                <p className="text-sm text-blue-500">55% of employed graduates</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Salary</p>
                <p className="text-3xl font-bold text-purple-600">$52,400</p>
                <p className="text-sm text-purple-500">+12% from last year</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Skills Verified</p>
                <p className="text-3xl font-bold text-orange-600">1,247</p>
                <p className="text-sm text-orange-500">87% verification rate</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Employment by Program */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Employment Rate by Program</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {employmentData.map((program) => (
                <div key={program.program} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">{program.program}</h3>
                    <span className="text-sm font-medium text-green-600">
                      {program.employed}% employed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${program.employed}%` }}
                      ></div>
                      <div 
                        className="bg-yellow-500" 
                        style={{ width: `${program.seeking}%` }}
                      ></div>
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${program.unemployed}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Employed: {program.employed}%</span>
                    <span>Seeking: {program.seeking}%</span>
                    <span>Unemployed: {program.unemployed}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Geographic Distribution</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {locationData.map((location) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">{location.location}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${location.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {location.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Salary Distribution</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {salaryRanges.map((range) => (
                  <div key={range.range} className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm">{range.range}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-secondary-600 h-2 rounded-full" 
                          style={{ width: `${range.percentage * 3}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">
                        {range.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Gap Analysis */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Skills Gap Analysis</h2>
            <p className="text-gray-600">Market demand vs. graduate competency levels</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {skillsInDemand.map((skill) => (
                <div key={skill.skill} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">{skill.skill}</h3>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      skill.gap > 40 
                        ? 'bg-red-100 text-red-800' 
                        : skill.gap > 20 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {skill.gap}% gap
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Market Demand</span>
                      <span className="font-medium">{skill.demand}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${skill.demand}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Graduate Competency</span>
                      <span className="font-medium">{skill.graduates}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${skill.graduates}%` }}
                      ></div>
                    </div>
                  </div>
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
              <h3 className="font-semibold mb-2">Curriculum Enhancement</h3>
              <ul className="space-y-1 text-primary-100 text-sm">
                <li>• Introduce cloud computing modules across all programs</li>
                <li>• Expand DevOps training in software development</li>
                <li>• Add data analysis components to engineering programs</li>
                <li>• Strengthen practical project-based learning</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Industry Partnerships</h3>
              <ul className="space-y-1 text-primary-100 text-sm">
                <li>• Establish partnerships with cloud service providers</li>
                <li>• Create internship programs with international companies</li>
                <li>• Develop industry-specific certification pathways</li>
                <li>• Increase mentor engagement from diaspora professionals</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RTBAnalyticsPage;

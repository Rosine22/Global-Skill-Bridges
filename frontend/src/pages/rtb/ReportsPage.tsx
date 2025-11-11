import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Download, 
  FileText, 
  Calendar, 
  BarChart3,
  TrendingUp,
  Award,
  Briefcase,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'employment' | 'skills' | 'programs' | 'analytics' | 'comprehensive';
  format: 'PDF' | 'Excel' | 'CSV';
  lastGenerated: string;
  size: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'on-demand';
}

function RTBReportsPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('current-year');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const availableReports: Report[] = [
    {
      id: '1',
      title: 'Graduate Employment Status Report',
      description: 'Comprehensive overview of graduate employment outcomes, job placement rates, and career progression tracking.',
      type: 'employment',
      format: 'PDF',
      lastGenerated: '2024-01-20',
      size: '2.4 MB',
      frequency: 'monthly'
    },
    {
      id: '2',
      title: 'Skills Gap Analysis Report',
      description: 'Detailed analysis of market skill demands vs. graduate competencies, identifying critical gaps and opportunities.',
      type: 'skills',
      format: 'Excel',
      lastGenerated: '2024-01-18',
      size: '1.8 MB',
      frequency: 'quarterly'
    },
    {
      id: '3',
      title: 'Program Effectiveness Dashboard',
      description: 'Performance metrics for all TVET programs including enrollment, completion, and employment rates.',
      type: 'programs',
      format: 'PDF',
      lastGenerated: '2024-01-15',
      size: '3.2 MB',
      frequency: 'quarterly'
    },
    {
      id: '4',
      title: 'International Placement Analytics',
      description: 'Analysis of graduates working internationally, salary comparisons, and destination country trends.',
      type: 'analytics',
      format: 'Excel',
      lastGenerated: '2024-01-12',
      size: '1.5 MB',
      frequency: 'monthly'
    },
    {
      id: '5',
      title: 'Graduate Tracking Database Export',
      description: 'Complete database export of all graduate records, employment status, and contact information.',
      type: 'comprehensive',
      format: 'CSV',
      lastGenerated: '2024-01-10',
      size: '5.7 MB',
      frequency: 'weekly'
    },
    {
      id: '6',
      title: 'Skills Verification Summary',
      description: 'Overview of skills verification activities, blockchain records, and certification status.',
      type: 'skills',
      format: 'PDF',
      lastGenerated: '2024-01-08',
      size: '1.2 MB',
      frequency: 'monthly'
    },
    {
      id: '7',
      title: 'Employer Engagement Report',
      description: 'Analysis of employer partnerships, job postings, hiring rates, and feedback on graduate quality.',
      type: 'employment',
      format: 'PDF',
      lastGenerated: '2024-01-05',
      size: '2.1 MB',
      frequency: 'quarterly'
    },
    {
      id: '8',
      title: 'Annual TVET Outcomes Report',
      description: 'Comprehensive annual report covering all aspects of TVET graduate outcomes and program effectiveness.',
      type: 'comprehensive',
      format: 'PDF',
      lastGenerated: '2023-12-31',
      size: '8.4 MB',
      frequency: 'annual'
    }
  ];

  const filteredReports = selectedType === 'all' 
    ? availableReports 
    : availableReports.filter(report => report.type === selectedType);

  const generateReport = async (reportId: string) => {
    setGeneratingReport(reportId);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const report = availableReports.find(r => r.id === reportId);
    if (report) {
      // Update last generated date
      report.lastGenerated = new Date().toISOString().split('T')[0];
      
      // Simulate download
      const blob = new Blob(['Mock report data'], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, '_')}.${report.format.toLowerCase()}`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    
    setGeneratingReport(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'employment':
        return <Briefcase className="h-5 w-5 text-green-500" />;
      case 'skills':
        return <Award className="h-5 w-5 text-purple-500" />;
      case 'programs':
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
      case 'analytics':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'comprehensive':
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'employment':
        return 'bg-green-100 text-green-800';
      case 'skills':
        return 'bg-purple-100 text-purple-800';
      case 'programs':
        return 'bg-blue-100 text-blue-800';
      case 'analytics':
        return 'bg-orange-100 text-orange-800';
      case 'comprehensive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return 'bg-red-100 text-red-800';
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      case 'quarterly':
        return 'bg-yellow-100 text-yellow-800';
      case 'annual':
        return 'bg-green-100 text-green-800';
      case 'on-demand':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const quickStats = {
    totalReports: availableReports.length,
    lastWeek: 3,
    totalSize: '26.3 MB',
    automated: availableReports.filter(r => r.frequency !== 'on-demand').length
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Export Reports</h1>
            <p className="text-gray-600">Generate and download comprehensive reports on graduate outcomes and program effectiveness</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Report Types</option>
              <option value="employment">Employment Reports</option>
              <option value="skills">Skills Reports</option>
              <option value="programs">Program Reports</option>
              <option value="analytics">Analytics Reports</option>
              <option value="comprehensive">Comprehensive Reports</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="current-year">Current Year</option>
              <option value="last-year">Last Year</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Reports</p>
                <p className="text-3xl font-bold text-primary-600">{quickStats.totalReports}</p>
              </div>
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Generated This Week</p>
                <p className="text-3xl font-bold text-green-600">{quickStats.lastWeek}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Data Size</p>
                <p className="text-3xl font-bold text-blue-600">{quickStats.totalSize}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Automated Reports</p>
                <p className="text-3xl font-bold text-purple-600">{quickStats.automated}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Available Reports</h2>
          </div>
          <div className="p-6">
            <div className="grid gap-6">
              {filteredReports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        {getTypeIcon(report.type)}
                        <h3 className="text-lg font-semibold text-gray-900 ml-2">{report.title}</h3>
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                          {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(report.frequency)}`}>
                          {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{report.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Last generated: {report.lastGenerated}
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          Format: {report.format}
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Size: {report.size}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <button
                        onClick={() => generateReport(report.id)}
                        disabled={generatingReport === report.id}
                        className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center"
                      >
                        {generatingReport === report.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Generate & Download
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Report Builder */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Custom Report Builder</h2>
            <p className="text-gray-600">Create custom reports with specific data points and filters</p>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Categories</label>
                <div className="space-y-2">
                  {['Graduate Demographics', 'Employment Status', 'Skills Verification', 'Salary Information', 'Geographic Distribution'].map((category) => (
                    <label key={category} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option>Last 12 months</option>
                  <option>Last 6 months</option>
                  <option>Current year</option>
                  <option>Custom date range</option>
                </select>
                
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Programs</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option>All programs</option>
                  <option>Software Development</option>
                  <option>Electrical Engineering</option>
                  <option>Automotive Technology</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option>PDF Report</option>
                  <option>Excel Spreadsheet</option>
                  <option>CSV Data</option>
                  <option>PowerPoint Presentation</option>
                </select>
                
                <button className="w-full mt-6 bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Custom Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Automated Report Schedule</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Upcoming Reports</h3>
              <div className="space-y-2 text-primary-100 text-sm">
                <div className="flex justify-between">
                  <span>Graduate Employment Status</span>
                  <span>Jan 31, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span>Skills Gap Analysis</span>
                  <span>Feb 15, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span>Program Effectiveness</span>
                  <span>Mar 1, 2024</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Report Distribution</h3>
              <ul className="space-y-1 text-primary-100 text-sm">
                <li>• Automatically sent to RTB leadership</li>
                <li>• Shared with partner institutions</li>
                <li>• Published to stakeholder portal</li>
                <li>• Archived in document management system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RTBReportsPage;

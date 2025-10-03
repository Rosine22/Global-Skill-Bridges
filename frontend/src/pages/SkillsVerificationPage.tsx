import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Award, CheckCircle, Clock, AlertCircle, Upload, FileText, Shield, Blocks as Blockchain, Plus, Download, Eye, Globe } from 'lucide-react';

interface SkillVerification {
  id: string;
  skill: string;
  level: 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';
  status: 'verified' | 'pending' | 'rejected';
  verifiedDate?: string;
  certificate?: string;
  blockchain_hash?: string;
  verifier: string;
}

function SkillsVerificationPage() {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skill: '',
    level: 'Basic' as 'Basic' | 'Intermediate' | 'Advanced' | 'Expert',
    certificate: null as File | null
  });

  // Mock verified skills
  const [verifiedSkills, setVerifiedSkills] = useState<SkillVerification[]>([
    {
      id: '1',
      skill: 'JavaScript Programming',
      level: 'Advanced',
      status: 'verified',
      verifiedDate: '2024-01-10',
      certificate: 'javascript-cert.pdf',
      blockchain_hash: '0x4a7b9c2d8e5f1a3b6d9e4f2a8c5b1d7e9f3a6c8e1b4d7f2a9c6e3b8d5f1a4c7e9b',
      verifier: 'Global Tech Institute'
    },
    {
      id: '2',
      skill: 'React Development',
      level: 'Intermediate',
      status: 'verified',
      verifiedDate: '2024-01-05',
      certificate: 'react-cert.pdf',
      blockchain_hash: '0x1d4f7a2b9c6e3d8f5a1c4e7b9d2f8a5c3e6b9d4f1a7c2e8b5d9f3a6c1e4b7d8f2a',
      verifier: 'Rwanda Polytechnic'
    },
    {
      id: '3',
      skill: 'Electrical Systems Design',
      level: 'Advanced',
      status: 'pending',
      verifier: 'Engineering Board Rwanda'
    },
    {
      id: '4',
      skill: 'Database Management',
      level: 'Basic',
      status: 'rejected',
      verifier: 'Tech Skills Assessment'
    }
  ]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVerification: SkillVerification = {
      id: Date.now().toString(),
      skill: newSkill.skill,
      level: newSkill.level,
      status: 'pending',
      verifier: 'Global Skills Bridge Assessment'
    };

    setVerifiedSkills(prev => [newVerification, ...prev]);
    setNewSkill({ skill: '', level: 'Basic', certificate: null });
    setShowAddForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const verifiedCount = verifiedSkills.filter(skill => skill.status === 'verified').length;
  const pendingCount = verifiedSkills.filter(skill => skill.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Skills Verification</h1>
          <p className="text-gray-600">
            Verify your technical skills and competencies through our blockchain-secured verification system.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Skills</p>
                <p className="text-2xl font-bold text-secondary-600">{verifiedCount}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blockchain Secured</p>
                <p className="text-2xl font-bold text-primary-600">{verifiedCount}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Security Info */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 mr-3" />
            <h2 className="text-xl font-bold">Blockchain-Secured Verification</h2>
          </div>
          <p className="text-primary-100 mb-4">
            Your verified skills are secured using blockchain technology, ensuring immutable and globally verifiable credentials that employers can trust.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-3">
              <Shield className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Tamper-Proof</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <Globe className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Globally Accepted</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <CheckCircle className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Instantly Verifiable</p>
            </div>
          </div>
        </div>

        {/* Skills List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Your Skills</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </button>
          </div>

          <div className="p-6">
            {verifiedSkills.length > 0 ? (
              <div className="space-y-4">
                {verifiedSkills.map((skill) => (
                  <div key={skill.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{skill.skill}</h3>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-sm text-gray-600">
                            Level: <span className="font-medium">{skill.level}</span>
                          </span>
                          <span className="text-sm text-gray-600">
                            Verifier: <span className="font-medium">{skill.verifier}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(skill.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(skill.status)}`}>
                          {skill.status.charAt(0).toUpperCase() + skill.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {skill.status === 'verified' && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800 mb-1">
                              Verified on {skill.verifiedDate}
                            </p>
                            {skill.blockchain_hash && (
                              <div className="flex items-center text-xs text-green-700">
                                <Blockchain className="h-3 w-3 mr-1" />
                                <span className="font-mono break-all">
                                  {skill.blockchain_hash.substring(0, 20)}...
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {skill.certificate && (
                              <button className="text-primary-600 hover:text-primary-700 flex items-center text-xs">
                                <Download className="h-3 w-3 mr-1" />
                                Certificate
                              </button>
                            )}
                            <button className="text-green-600 hover:text-green-700 flex items-center text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Verify
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {skill.status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          Your skill verification is being reviewed. This process typically takes 3-5 business days.
                        </p>
                      </div>
                    )}

                    {skill.status === 'rejected' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 mb-2">
                          Verification was not successful. Please review the requirements and submit additional documentation.
                        </p>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          Resubmit →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No skills verified yet</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
                >
                  Verify Your First Skill
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Skill Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Add Skill for Verification</h3>
                <p className="text-gray-600">Submit a skill for verification to enhance your profile credibility.</p>
              </div>
              <form onSubmit={handleAddSkill} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    value={newSkill.skill}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, skill: e.target.value }))}
                    required
                    placeholder="e.g., JavaScript Programming, Electrical Circuit Design"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proficiency Level
                  </label>
                  <select
                    value={newSkill.level}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, level: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Be honest about your level - this will be verified through assessment.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Certificate (Optional)
                  </label>
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload any certificates or documentation
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setNewSkill(prev => ({ 
                        ...prev, 
                        certificate: e.target.files?.[0] || null 
                      }))}
                      className="text-sm text-gray-500"
                    />
                  </div>
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-primary-800 mb-2">Verification Process</h4>
                  <ol className="text-xs text-primary-700 space-y-1">
                    <li>1. Submit your skill for review</li>
                    <li>2. Complete online assessment or interview</li>
                    <li>3. Skill verification recorded on blockchain</li>
                    <li>4. Receive verifiable digital credential</li>
                  </ol>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Submit for Verification
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

export default SkillsVerificationPage;
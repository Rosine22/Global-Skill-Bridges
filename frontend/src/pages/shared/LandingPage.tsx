import { Link } from 'react-router-dom';
import { 
  Globe, 
  Users, 
  ArrowRight,
  Briefcase,
  Shield
} from 'lucide-react';

function LandingPage() {

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-teal-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Global Skills Bridge</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/test-employer-data"
                className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Test Data
              </Link>
              <Link
                to="/admin/employer-approvals"
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Admin Approvals
              </Link>
              <Link
                to="/login"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Bridge Your Skills to
                <span className="text-teal-600"> Global Opportunities</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect TVET graduates with verified global employment opportunities. 
              Secure your credentials, find your dream job, and get mentorship from industry experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center transition-colors"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="border border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                >
                  I'm an Employer
                </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Career Development Ecosystem
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to secure global employment opportunities
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-50 rounded-xl">
           <Shield className="h-12 w-12 text-teal-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills Verification</h3>
              <p className="text-gray-600">
                Blockchain-secured credential verification system ensuring trust and transparency for employers worldwide.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gray-50 rounded-xl">
              <Briefcase className="h-12 w-12 text-blue-600 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Job Matching</h3>
              <p className="text-gray-600">
                Connect with international employers seeking your specific skills and qualifications.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gray-50 rounded-xl">
           <Users className="h-12 w-12 text-teal-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert Mentorship</h3>
              <p className="text-gray-600">
                Get guidance from Rwandan diaspora and industry experts to accelerate your career growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">5,000+</div>
                    <div className="text-teal-100">TVET Graduates</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">500+</div>
                    <div className="text-teal-100">Global Employers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">200+</div>
                    <div className="text-teal-100">Expert Mentors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">95%</div>
                    <div className="text-teal-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to your global career</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Create Profile</h3>
              <p className="text-gray-600">Build your comprehensive skills-based profile with verified credentials</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Verify Skills</h3>
              <p className="text-gray-600">Get your competencies verified through our secure blockchain system</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Find Opportunities</h3>
              <p className="text-gray-600">Browse and apply to global job opportunities that match your skills</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Get Support</h3>
              <p className="text-gray-600">Receive mentorship and guidance throughout your career journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Launch Your Global Career?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of TVET graduates who have found success with Global Skills Bridge
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center transition-colors"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Globe className="h-8 w-8 text-primary-400" />
                <span className="ml-2 text-xl font-bold">Global Skills Bridge</span>
              </div>
              <p className="text-gray-400">
                Connecting TVET graduates with global opportunities through verified skills and expert mentorship.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Create Profile</Link></li>
                <li><Link to="/skills-verification" className="hover:text-white transition-colors">Verify Skills</Link></li>
                <li><Link to="/mentorship" className="hover:text-white transition-colors">Find Mentor</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Post Jobs</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Find Talent</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Verify Candidates</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Global Skills Bridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

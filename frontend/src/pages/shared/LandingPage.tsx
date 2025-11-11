import { Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  Globe, 
  Users, 
  ArrowRight,
  Briefcase,
  Shield,
  ChevronDown
} from 'lucide-react';

function LandingPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  Menu
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <Link
                        to="/admin/employer-approvals"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Admin Approvals
                      </Link>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Get Started
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

   {/* Hero Section */}
<section className="relative bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 pt-20 pb-32 overflow-hidden">
  {/* Decorative background blobs */}
  <div className="absolute top-20 right-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
  <div
    className="absolute bottom-20 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
    style={{ animationDelay: '2s' }}
  ></div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Left Content */}
      <div>
        <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6">
          <span className="text-orange-500 mr-2">🌍</span>
          <span className="text-sm font-medium text-gray-700">Global Career Opportunities</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
          Bridge Your Skills to
          <span className="text-teal-600"> Global Opportunities</span>
        </h1>

        <p className="text-base text-gray-600 mb-8 max-w-lg">
          Connect TVET graduates with verified global employment opportunities. 
          Secure your credentials, find your dream job, and get mentorship from industry experts.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/register"
            className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-full text-base font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 justify-center"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center border border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white px-8 py-3 rounded-full text-base font-semibold transition-all justify-center"
          >
            I'm an Employer
          </Link>
        </div>
      </div>

      {/* Right Content - Image and Cards (unchanged) */}
      <div className="relative">
        {/* Main decorative circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-pink-300 to-orange-300 rounded-full opacity-40 blur-2xl"></div>

        {/* Student Image Placeholder */}
        <div className="relative z-10 flex justify-center">
          <div className="w-84 h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-2xl">
            {/* <Users className="w-32 h-32 text-gray-400" /> */}
            <img
              src="https://images.pexels.com/photos/4173235/pexels-photo-4173235.jpeg"
              alt="Student"
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>
        </div>

        {/* Floating Card - Top Right */}
        <div className="absolute top-0 right-0 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-xl w-56 z-20 transform hover:scale-105 transition-transform">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-semibold mb-1">Difficult Things About Education</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/20 backdrop-blur-sm text-xs px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
              Go Now
            </button>
            <button className="bg-white text-indigo-600 text-xs px-3 py-1 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Get Started
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 border-2 border-white"></div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white"></div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-teal-400 border-2 border-white"></div>
            </div>
            <span className="text-xs text-white/90">+500 Students</span>
          </div>
        </div>

        {/* Floating Card - Bottom Right */}
        <div className="absolute bottom-8 -right-4 bg-white p-5 rounded-2xl shadow-xl w-64 z-20 transform hover:scale-105 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">React</h4>
              <p className="text-xs text-gray-500">Web Development</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            It is a long established fact that a reader will be distracted.
          </p>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex text-yellow-400 text-xs mb-1">
                ★★★★★ <span className="text-gray-500 ml-1">(5 Reviews)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-indigo-600">$70</span>
                <span className="text-sm text-gray-400 line-through">$100</span>
              </div>
            </div>
            <button className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">
              Learn More →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Curved bottom */}
  <div className="absolute bottom-0 left-0 right-0">
    <svg
      viewBox="0 0 1440 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
    >
      <path
        d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
        fill="white"
      />
    </svg>
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
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Users, 
  Briefcase,
  Shield,
  ChevronDown
} from 'lucide-react';

function LandingPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({
    graduates: 0,
    employers: 0,
    mentors: 0,
    successRate: 0
  });
  
  const sectionRef = useRef(null);

  // Intersection Observer to detect when section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  // Counter animation
  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      graduates: 5000,
      employers: 500,
      mentors: 200,
      successRate: 95
    };

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setCounts({
        graduates: Math.floor(targets.graduates * progress),
        employers: Math.floor(targets.employers * progress),
        mentors: Math.floor(targets.mentors * progress),
        successRate: Math.floor(targets.successRate * progress)
      });

      if (currentStep >= steps) {
        setCounts(targets);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible]);

  const steps = [
    {
      number: 1,
      title: "Create Profile",
      description: "Build your comprehensive skills-based profile with verified credentials",
      bgColor: "from-yellow-400 to-yellow-500",
      delay: "0ms"
    },
    {
      number: 2,
      title: "Verify Skills",
      description: "Get your competencies verified through our secure blockchain system",
      bgColor: "from-amber-400 to-amber-500",
      delay: "200ms"
    },
    {
      number: 3,
      title: "Find Opportunities",
      description: "Browse and apply to global job opportunities that match your skills",
      bgColor: "from-lime-400 to-lime-500",
      delay: "400ms"
    },
    {
      number: 4,
      title: "Get Support",
      description: "Receive mentorship and guidance throughout your career journey",
      bgColor: "from-green-400 to-green-500",
      delay: "600ms"
    }
  ];

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
   <section className="relative pt-16 pb-12 overflow-hidden min-h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/4173235/pexels-photo-4173235.jpeg)',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-teal-900/80"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center min-h-[70vh] text-center">
        {/* Main Content - Centered */}
        <div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Bridge Your Skills to
            <span className="text-teal-300"> Global Opportunities</span>
          </h1>

          <p className="text-lg md:text-2xl text-white/90 mb-10 max-w-2xl md:max-w-3xl mx-auto">
            Connect TVET graduates with verified global employment opportunities. 
            Secure your credentials, find your dream job, and get mentorship from industry experts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
            <button className="inline-flex items-center bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 justify-center">
               Start Your Journey
            {/* <ArrowRight className="ml-2 h-5 w-5" /> */}
            </button>
            </Link>
            <Link to="/login">
            <button className="inline-flex items-center border-2 border-white text-white hover:bg-white hover:text-teal-900 px-8 py-4 rounded-full text-lg font-semibold transition-all justify-center backdrop-blur-sm">
              I'm an Employer
            </button>
            </Link>
            
          </div>
        </div>

        {/* Floating Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-3xl">
          {/* Card 1 */}
          {/* <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <h4 className="font-bold text-white text-lg mb-2">Verified Credentials</h4>
            <p className="text-sm text-white/80">
              Blockchain-secured certificates recognized globally
            </p>
          </div> */}

          {/* Card 2 */}
          {/* <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
            <h4 className="font-bold text-white text-lg mb-2">Global Jobs</h4>
            <p className="text-sm text-white/80">
              Access 500+ international employment opportunities
            </p>
          </div> */}

          {/* Card 3 */}
          {/* <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h4 className="font-bold text-white text-lg mb-2">Expert Mentorship</h4>
            <p className="text-sm text-white/80">
              Connect with industry professionals for career guidance
            </p>
          </div> */}
        </div>
      </div>

      {/* Curved bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
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
      <section className="py-10 bg-white">
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
            <div className="text-start p-8 bg-teal-50 rounded">
           <Shield className="h-12 w-12 text-teal-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills Verification</h3>
              <p className="text-gray-600">
                Blockchain-secured credential verification system ensuring trust and transparency for employers worldwide.
              </p>
            </div>
            
            <div className="text-center p-8 bg-teal-50 rounded">
              <Briefcase className="h-12 w-12 text-blue-600 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Job Matching</h3>
              <p className="text-gray-600">
                Connect with international employers seeking your specific skills and qualifications.
              </p>
            </div>
            
            <div className="text-end p-8 bg-teal-50 rounded">
           <Users className="h-12 w-12 text-teal-400 ml-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert Mentorship</h3>
              <p className="text-gray-600">
                Get guidance from Rwandan diaspora and industry experts to accelerate your career growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
<section ref={sectionRef} className="py-20 bg-teal-700 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {/* TVET Graduates */}
          <div className="transform transition-all duration-500 hover:scale-105">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              {counts.graduates.toLocaleString()}+
            </div>
            <div className="text-teal-100 text-sm md:text-base font-medium">TVET Graduates</div>
          </div>

          {/* Global Employers */}
          <div className="transform transition-all duration-500 hover:scale-105">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              {counts.employers.toLocaleString()}+
            </div>
            <div className="text-teal-100 text-sm md:text-base font-medium">Global Employers</div>
          </div>

          {/* Expert Mentors */}
          <div className="transform transition-all duration-500 hover:scale-105">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              {counts.mentors.toLocaleString()}+
            </div>
            <div className="text-teal-100 text-sm md:text-base font-medium">Expert Mentors</div>
          </div>

          {/* Success Rate */}
          <div className="transform transition-all duration-500 hover:scale-105">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              {counts.successRate}%
            </div>
            <div className="text-teal-100 text-sm md:text-base font-medium">Success Rate</div>
          </div>
        </div>
      </div>
    </section>

      {/* How It Works */}
<section ref={sectionRef} className="py-20 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg md:text-xl text-gray-600">Simple steps to your global career</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className={`text-center transform transition-all duration-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: step.delay }}
            >
              {/* Card with teal-50 background */}
              <div className="bg-teal-50 p-6 rounded hover:shadow transition-all duration-300 h-full border border-teal-100 hover:-translate-y-2">
                {/* Progress-colored icon circle */}
                <div className="relative inline-block mb-6">
                  <div className={`absolute inset-0 ${step.bgColor} rounded-full blur-lg opacity-40`}></div>
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${step.bgColor} text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold`}>
                    {step.number}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>

              {/* Connecting line (except for last step) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-24 left-1/2 w-full h-0.5 bg-gradient-to-r from-teal-200 to-teal-300 -z-10"
                  style={{ 
                    width: 'calc(100% - 4rem)',
                    transform: 'translateX(2rem)'
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>


      {/* CTA Section */}
 <section className="relative py-20 pb-20 bg-teal-600 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Launch Your Global Career?
        </h2>
        <p className="text-lg md:text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
          Join thousands of TVET graduates who have found success with Global Skills Bridge
        </p>
        
        <Link to="/register">
        <button className="bg-white text-teal-600 hover:bg-teal-50 px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center transition-colors">
          Get Started Today
          {/* <ArrowRight className="ml-2 h-5 w-5" /> */}
        </button>
        </Link>
        
      </div>
      
    </section>

      {/* Footer */}
  <footer className="relative bg-gray-900 text-white pt-20 pb-12">
      {/* Wave at the top */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full rotate-180"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#0D9488"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Globe className="h-8 w-8 text-teal-400" />
              <span className="ml-2 text-xl font-bold">Global Skills Bridge</span>
            </div>
            <p className="text-gray-400">
              Connecting TVET graduates with global opportunities through verified skills and expert mentorship.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/register" className="hover:text-white transition-colors">Create Profile</a></li>
              <li><a href="/skills-verification" className="hover:text-white transition-colors">Verify Skills</a></li>
              <li><a href="/mentorship" className="hover:text-white transition-colors">Find Mentor</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/register" className="hover:text-white transition-colors">Post Jobs</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">Find Talent</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">Verify Candidates</a></li>
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
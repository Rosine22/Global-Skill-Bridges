import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserContext } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { 
  Building2,
  MapPin,
  Users,
  Upload,
  Check,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface CompanyProfile {
  companyName: string;
  website: string;
  industry: string;
  companySize: string;
  founded: string;
  description: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  contactEmail: string;
  logo?: File | null;
  companyRegistration: string;
  taxId: string;
  linkedinProfile: string;
  benefits: string[];
  workCulture: string;
  remotePolicy: string;
}

function EmployerOnboarding() {
  const { user } = useAuth();
  const { submitEmployerProfile } = useUserContext();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: '',
    website: '',
    industry: '',
    companySize: '',
    founded: '',
    description: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
    contactEmail: user?.email || '',
    logo: null,
    companyRegistration: '',
    taxId: '',
    linkedinProfile: '',
    benefits: [],
    workCulture: '',
    remotePolicy: 'office-only'
  });

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Transportation', 'Energy', 'Agriculture',
    'Media & Entertainment', 'Hospitality', 'Real Estate', 'Other'
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  const countries = [
    'Rwanda', 'Kenya', 'Uganda', 'Tanzania', 'Canada', 'United States',
    'United Kingdom', 'Germany', 'France', 'Australia', 'South Africa',
    'Nigeria', 'Ghana', 'UAE', 'Other'
  ];

  const commonBenefits = [
    'Health Insurance',
    'Dental Coverage',
    'Vision Coverage',
    'Life Insurance',
    'Retirement Plan (401k/RRSP)',
    'Paid Time Off',
    'Flexible Working Hours',
    'Remote Work Options',
    'Professional Development',
    'Training Budget',
    'Gym Membership',
    'Free Meals',
    'Transportation Allowance',
    'Stock Options',
    'Parental Leave',
    'Mental Health Support'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfile(prev => ({ ...prev, logo: e.target.files![0] }));
    }
  };

  const handleBenefitToggle = (benefit: string) => {
    setProfile(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert logo to base64 if it exists
      let companyLogoBase64 = '';
      if (profile.logo) {
        companyLogoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(profile.logo as File);
        });
      }

      // Submit the profile using UserContext
      await submitEmployerProfile({
        companyName: profile.companyName,
        email: profile.contactEmail,
        phone: profile.phone,
        industry: profile.industry,
        companySize: profile.companySize,
        location: `${profile.city}, ${profile.country}`,
        website: profile.website,
        companyRegistration: profile.companyRegistration,
        description: profile.description,
        contactPerson: user?.name || 'Unknown',
        address: profile.address,
        city: profile.city,
        country: profile.country,
        postalCode: profile.postalCode,
        taxId: profile.taxId,
        linkedinProfile: profile.linkedinProfile,
        benefits: profile.benefits,
        workCulture: profile.workCulture,
        remotePolicy: profile.remotePolicy,
        founded: profile.founded,
        companyLogo: companyLogoBase64 // Add the logo as base64
      });
      
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Company profile submitted successfully! Your account is now pending admin approval. You will receive an email notification once approved.');
      
      // Redirect to a pending approval page
      navigate('/employer/pending-approval');
    } catch (error) {
      console.error('Error submitting profile:', error);
      alert('There was an error submitting your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(profile.companyName && profile.industry && profile.companySize && profile.founded);
      case 2:
        return !!(profile.address && profile.city && profile.country && profile.phone);
      case 3:
        return !!(profile.description && profile.workCulture);
      case 4:
        return !!(profile.companyRegistration && profile.contactEmail);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Company Profile</h1>
          <p className="text-gray-600">Help us learn more about your company to connect you with the best talent</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step <= currentStep 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step < currentStep ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Company Info</span>
            <span>Location & Contact</span>
            <span>Company Culture</span>
            <span>Legal & Verification</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <Building2 className="h-6 w-6 text-primary-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={profile.companyName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={profile.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="https://www.yourcompany.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <select
                      name="industry"
                      value={profile.industry}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select an industry</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size *
                    </label>
                    <select
                      name="companySize"
                      value={profile.companySize}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select company size</option>
                      {companySizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Founded Year *
                    </label>
                    <input
                      type="number"
                      name="founded"
                      value={profile.founded}
                      onChange={handleInputChange}
                      required
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="2020"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      name="linkedinProfile"
                      value={profile.linkedinProfile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {profile.logo ? (
                      <div className="space-y-3">
                        <img 
                          src={URL.createObjectURL(profile.logo)} 
                          alt="Company logo preview" 
                          className="h-24 w-24 object-cover rounded-lg mx-auto border-2 border-gray-200"
                        />
                        <p className="text-sm text-gray-700 font-medium">{profile.logo.name}</p>
                        <button
                          type="button"
                          onClick={() => setProfile(prev => ({ ...prev, logo: null }))}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Click to upload company logo
                        </label>
                        <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & Contact */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <MapPin className="h-6 w-6 text-primary-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Location & Contact Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="123 Business Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="City name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={profile.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select a country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={profile.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={profile.contactEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="hr@company.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Company Culture */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <Users className="h-6 w-6 text-primary-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Company Culture & Benefits</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Description *
                  </label>
                  <textarea
                    name="description"
                    value={profile.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tell candidates about your company mission, values, and what makes it a great place to work..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Culture *
                  </label>
                  <textarea
                    name="workCulture"
                    value={profile.workCulture}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe your work culture, team dynamics, and work environment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remote Work Policy
                  </label>
                  <select
                    name="remotePolicy"
                    value={profile.remotePolicy}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="office-only">Office Only</option>
                    <option value="remote-friendly">Remote Friendly</option>
                    <option value="remote-first">Remote First</option>
                    <option value="fully-remote">Fully Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Employee Benefits (select all that apply)
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {commonBenefits.map((benefit) => (
                      <label key={benefit} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profile.benefits.includes(benefit)}
                          onChange={() => handleBenefitToggle(benefit)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{benefit}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Legal & Verification */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <AlertCircle className="h-6 w-6 text-primary-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Legal & Verification Information</h2>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Verification Required</p>
                      <p>This information is required for account verification and will be reviewed by our admin team.</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Registration Number *
                    </label>
                    <input
                      type="text"
                      name="companyRegistration"
                      value={profile.companyRegistration}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your company registration number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax ID / VAT Number
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      value={profile.taxId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your tax ID or VAT number"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Information</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Company:</strong> {profile.companyName || 'Not provided'}</p>
                    <p><strong>Industry:</strong> {profile.industry || 'Not provided'}</p>
                    <p><strong>Location:</strong> {profile.city && profile.country ? `${profile.city}, ${profile.country}` : 'Not provided'}</p>
                    <p><strong>Contact:</strong> {profile.contactEmail || 'Not provided'}</p>
                    <p><strong>Remote Policy:</strong> {profile.remotePolicy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">What happens next?</p>
                      <ul className="mt-2 space-y-1">
                        <li>• Your profile will be submitted for admin review</li>
                        <li>• Our team will verify your company information</li>
                        <li>• You'll receive an email notification within 2-3 business days</li>
                        <li>• Once approved, you'll have full access to post jobs and find talent</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                    isStepValid(currentStep)
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepValid(currentStep) || isSubmitting}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    isStepValid(currentStep) && !isSubmitting
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EmployerOnboarding;

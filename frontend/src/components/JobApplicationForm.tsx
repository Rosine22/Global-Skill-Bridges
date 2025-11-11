import React, { useState } from 'react';
import { JobApplicationData } from '../contexts/UserContext';
import { 
  Upload, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Phone,
  Calendar,
  DollarSign
} from 'lucide-react';

interface JobApplicationFormProps {
  job: {
    id: string;
    title: string;
    company: string;
    salary?: string;
    screeningQuestions?: Array<{
      id: string;
      question: string;
      type: 'text' | 'multiple-choice' | 'yes-no' | 'numeric';
      required: boolean;
      options?: string[];
      placeholder?: string;
    }>;
  };
  onSubmit: (applicationData: JobApplicationData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ 
  job, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState<JobApplicationData>({
    coverLetter: '',
    resume: null,
    portfolio: {
      url: '',
      description: ''
    },
    additionalDocuments: [],
    personalInfo: {
      phone: '',
      linkedIn: '',
      website: '',
      availableStartDate: ''
    },
    salaryExpectation: {
      min: '',
      max: '',
      currency: 'USD',
      isNegotiable: true
    },
    whyInterested: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; 
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.coverLetter.trim()) {
          newErrors.coverLetter = 'Cover letter is required';
        } else if (formData.coverLetter.length < 100) {
          newErrors.coverLetter = 'Cover letter should be at least 100 characters';
        }
        if (!formData.resume) {
          newErrors.resume = 'Resume/CV is required';
        }
        break;
      case 2:
        if (!formData.personalInfo.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else {
          // Basic phone validation
          const phoneRegex = /^[+]?[()]?[\d\s\-()]{10,}$/;
          if (!phoneRegex.test(formData.personalInfo.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
          }
        }
        
        if (!formData.personalInfo.availableStartDate) {
          newErrors.availableStartDate = 'Available start date is required';
        } else {
          // Check if the date is not in the past
          const selectedDate = new Date(formData.personalInfo.availableStartDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            newErrors.availableStartDate = 'Available start date cannot be in the past';
          }
        }

        // Validate LinkedIn URL if provided
        if (formData.personalInfo.linkedIn && !formData.personalInfo.linkedIn.includes('linkedin.com')) {
          newErrors.linkedIn = 'Please enter a valid LinkedIn profile URL';
        }

        // Validate website URL if provided
        if (formData.personalInfo.website) {
          try {
            new URL(formData.personalInfo.website);
          } catch {
            newErrors.website = 'Please enter a valid website URL';
          }
        }
        break;
        case 3:
        if (!formData.whyInterested.trim()) {
          newErrors.whyInterested = 'Please explain why you\'re interested in this position';
        }
        break;
      case 4:
        // Validate screening questions if they exist
        if (job.screeningQuestions) {
          job.screeningQuestions.forEach(question => {
            if (question.required) {
              const answer = formData.screeningAnswers?.find(a => a.questionId === question.id);
              if (!answer || !answer.answer.trim()) {
                newErrors[`screening_${question.id}`] = 'This question is required';
              }
            }
          });
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFileUpload = (file: File, type: 'resume' | 'document') => {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [`${type}_size`]: 'File size must be less than 5MB' }));
      return;
    }

    // Validate file type
    const allowedTypes = {
      'resume': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
    };

    if (!allowedTypes[type].includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        [`${type}_type`]: type === 'resume' 
          ? 'Resume must be in PDF or Word format' 
          : 'Document must be in PDF, Word, JPG, or PNG format'
      }));
      return;
    }

    // Clear any previous errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`${type}_size`];
      delete newErrors[`${type}_type`];
      if (type === 'resume') delete newErrors.resume;
      return newErrors;
    });

    if (type === 'resume') {
      setFormData(prev => ({ ...prev, resume: file }));
    }
  };

  const addAdditionalDocument = () => {
    setFormData(prev => ({
      ...prev,
      additionalDocuments: [
        ...prev.additionalDocuments,
        { name: '', file: undefined as File | undefined, type: 'other' as const }
      ]
    }));
  };

  const removeAdditionalDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalDocuments: prev.additionalDocuments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step < currentStep ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              step
            )}
          </div>
          {step < 5 && (
            <div
              className={`flex-1 h-1 mx-4 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Application Essentials</h3>
      
      {/* Cover Letter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Letter *
        </label>
        <textarea
          value={formData.coverLetter}
          onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
          rows={8}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.coverLetter ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Tell us why you're the perfect fit for this role. Highlight your relevant experience, skills, and what makes you unique..."
        />
        {errors.coverLetter && (
          <p className="text-sm text-red-600 mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.coverLetter}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          {formData.coverLetter.length}/2000 characters
        </p>
      </div>

      {/* Resume Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resume/CV *
        </label>
        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
          errors.resume ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
        }`}>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, 'resume');
            }}
            className="hidden"
            id="resume-upload"
          />
          <label htmlFor="resume-upload" className="cursor-pointer">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {formData.resume ? formData.resume.name : 'Click to upload your resume'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
          </label>
        </div>
        {(errors.resume || errors.resume_size || errors.resume_type) && (
          <p className="text-sm text-red-600 mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.resume || errors.resume_size || errors.resume_type}
          </p>
        )}
      </div>

      {/* Portfolio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Portfolio (Optional)
        </label>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <LinkIcon className="h-5 w-5 text-gray-400" />
            <input
              type="url"
              value={formData.portfolio.url}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                portfolio: { ...prev.portfolio, url: e.target.value }
              }))}
              placeholder="https://your-portfolio.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <textarea
            value={formData.portfolio.description}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              portfolio: { ...prev.portfolio, description: e.target.value }
            }))}
            rows={2}
            placeholder="Brief description of your portfolio..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="tel"
              value={formData.personalInfo.phone}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                personalInfo: { ...prev.personalInfo, phone: e.target.value }
              }))}
              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Start Date *
          </label>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="date"
              value={formData.personalInfo.availableStartDate}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                personalInfo: { ...prev.personalInfo, availableStartDate: e.target.value }
              }))}
              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.availableStartDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.availableStartDate && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.availableStartDate}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile
          </label>
          <input
            type="url"
            value={formData.personalInfo.linkedIn}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              personalInfo: { ...prev.personalInfo, linkedIn: e.target.value }
            }))}
            placeholder="https://linkedin.com/in/yourprofile"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.linkedIn ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.linkedIn && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.linkedIn}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personal Website
          </label>
          <input
            type="url"
            value={formData.personalInfo.website}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              personalInfo: { ...prev.personalInfo, website: e.target.value }
            }))}
            placeholder="https://yourwebsite.com"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.website ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.website && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.website}
            </p>
          )}
        </div>
      </div>

      {/* Salary Expectations */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Salary Expectations</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Expected
            </label>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="number"
                value={formData.salaryExpectation.min}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  salaryExpectation: { ...prev.salaryExpectation, min: e.target.value }
                }))}
                placeholder="50000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Expected
            </label>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="number"
                value={formData.salaryExpectation.max}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  salaryExpectation: { ...prev.salaryExpectation, max: e.target.value }
                }))}
                placeholder="70000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={formData.salaryExpectation.currency}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                salaryExpectation: { ...prev.salaryExpectation, currency: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.salaryExpectation.isNegotiable}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                salaryExpectation: { ...prev.salaryExpectation, isNegotiable: e.target.checked }
              }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Salary is negotiable</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Why are you interested in this position? *
        </label>
        <textarea
          value={formData.whyInterested}
          onChange={(e) => setFormData(prev => ({ ...prev, whyInterested: e.target.value }))}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.whyInterested ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="What attracts you to this role and our company? How do you see yourself contributing to our team?"
        />
        {errors.whyInterested && (
          <p className="text-sm text-red-600 mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.whyInterested}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Documents
        </label>
        <div className="space-y-3">
          {formData.additionalDocuments.map((doc, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <select
                value={doc.type}
                onChange={(e) => {
                  const newDocs = [...formData.additionalDocuments];
                  newDocs[index].type = e.target.value as 'certificate' | 'transcript' | 'recommendation' | 'portfolio' | 'other';
                  setFormData(prev => ({ ...prev, additionalDocuments: newDocs }));
                }}
                className="px-3 py-1 border border-gray-300 rounded"
              >
                <option value="certificate">Certificate</option>
                <option value="transcript">Transcript</option>
                <option value="recommendation">Recommendation</option>
                <option value="portfolio">Portfolio</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                value={doc.name}
                onChange={(e) => {
                  const newDocs = [...formData.additionalDocuments];
                  newDocs[index].name = e.target.value;
                  setFormData(prev => ({ ...prev, additionalDocuments: newDocs }));
                }}
                placeholder="Document name"
                className="flex-1 px-3 py-1 border border-gray-300 rounded"
              />
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const newDocs = [...formData.additionalDocuments];
                    newDocs[index].file = file;
                    setFormData(prev => ({ ...prev, additionalDocuments: newDocs }));
                  }
                }}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeAdditionalDocument(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addAdditionalDocument}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Document
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.additionalNotes}
          onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Any additional information you'd like to share..."
        />
      </div>
    </div>
  );

  const handleScreeningAnswer = (questionId: string, question: string, answer: string, questionType: string) => {
    setFormData(prev => {
      const existingAnswers = prev.screeningAnswers || [];
      const updatedAnswers = existingAnswers.filter(a => a.questionId !== questionId);
      
      if (answer.trim()) {
        updatedAnswers.push({
          questionId,
          question,
          answer,
          questionType: questionType as 'text' | 'multiple-choice' | 'yes-no' | 'numeric'
        });
      }
      
      return {
        ...prev,
        screeningAnswers: updatedAnswers
      };
    });
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Screening Questions</h3>
      
      {job.screeningQuestions && job.screeningQuestions.length > 0 ? (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 mb-4">
            Please answer the following questions to help us better understand your qualifications.
          </p>
          
          {job.screeningQuestions.map((question) => {
            const existingAnswer = formData.screeningAnswers?.find(a => a.questionId === question.id)?.answer || '';
            const hasError = errors[`screening_${question.id}`];
            
            return (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {question.type === 'text' && (
                  <textarea
                    value={existingAnswer}
                    onChange={(e) => handleScreeningAnswer(question.id, question.question, e.target.value, question.type)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      hasError ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={question.placeholder}
                  />
                )}
                
                {question.type === 'numeric' && (
                  <input
                    type="number"
                    value={existingAnswer}
                    onChange={(e) => handleScreeningAnswer(question.id, question.question, e.target.value, question.type)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      hasError ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={question.placeholder}
                  />
                )}
                
                {question.type === 'yes-no' && (
                  <div className="flex space-x-4">
                    {['Yes', 'No'].map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name={`question_${question.id}`}
                          value={option}
                          checked={existingAnswer === option}
                          onChange={(e) => handleScreeningAnswer(question.id, question.question, e.target.value, question.type)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {question.type === 'multiple-choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name={`question_${question.id}`}
                          value={option}
                          checked={existingAnswer === option}
                          onChange={(e) => handleScreeningAnswer(question.id, question.question, e.target.value, question.type)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {hasError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {hasError}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No screening questions for this position.
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Review Your Application</h3>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Application Summary</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Position:</strong> {job.title} at {job.company}</p>
          <p><strong>Cover Letter:</strong> {formData.coverLetter.length} characters</p>
          <p><strong>Resume:</strong> {formData.resume?.name || 'No file selected'}</p>
          {formData.portfolio.url && (
            <p><strong>Portfolio:</strong> <a href={formData.portfolio.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">View Portfolio</a></p>
          )}
          <p><strong>Phone:</strong> {formData.personalInfo.phone}</p>
          <p><strong>Available Start:</strong> {formData.personalInfo.availableStartDate}</p>
          {formData.salaryExpectation.min && (
            <p><strong>Salary Range:</strong> {formData.salaryExpectation.currency} {formData.salaryExpectation.min} - {formData.salaryExpectation.max}</p>
          )}
          <p><strong>Additional Documents:</strong> {formData.additionalDocuments.length}</p>
          {formData.screeningAnswers && formData.screeningAnswers.length > 0 && (
            <p><strong>Screening Questions Answered:</strong> {formData.screeningAnswers.length}</p>
          )}
        </div>
      </div>

      {/* Screening Questions Summary */}
      {formData.screeningAnswers && formData.screeningAnswers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Screening Responses</h4>
          <div className="space-y-3">
            {formData.screeningAnswers.map((answer) => (
              <div key={answer.questionId} className="border-b border-gray-100 pb-2 last:border-b-0">
                <p className="text-sm font-medium text-gray-700">{answer.question}</p>
                <p className="text-sm text-gray-600 mt-1">{answer.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Ready to Submit</p>
            <p className="text-sm text-blue-700 mt-1">
              Please review all information carefully. Once submitted, you cannot edit your application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Apply to {job.title}</h2>
          <p className="text-gray-600">at {job.company}</p>
          {renderStepIndicator()}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Previous
                </button>
              )}
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationForm;
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, User } from './AuthContext';

export interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  location: string;
  experience: string;
  rating: number;
  reviews: number;
  bio: string;
  currentRole: string;
  avatar?: string;
  achievements: string[];
  languages: string[];
  availability: string;
  sessionTypes: string[];
  responseTime: string;
  totalMentees: number;
  successStories: number;
}

export interface JobScreeningQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple-choice' | 'yes-no' | 'numeric';
  required: boolean;
  options?: string[]; 
  placeholder?: string; 
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string; // Add logo field
  location: string;
  country: string;
  description: string;
  requirements: string[];
  skills: string[];
  salary: string;
  type: 'full-time' | 'part-time' | 'contract';
  remote: boolean;
  postedDate: string;
  employerId: string;
  applications?: number;
  status: 'active' | 'closed' | 'draft';
  screeningQuestions?: JobScreeningQuestion[];
}

export interface JobApplicationData {
  coverLetter: string;
  resume: File | null;
  portfolio: {
    url: string;
    description: string;
  };
  additionalDocuments: Array<{
    name: string;
    file: File | undefined;
    type: 'certificate' | 'transcript' | 'recommendation' | 'portfolio' | 'other';
  }>;
  personalInfo: {
    phone: string;
    linkedIn: string;
    website: string;
    availableStartDate: string;
  };
  salaryExpectation: {
    min: string;
    max: string;
    currency: string;
    isNegotiable: boolean;
  };
  whyInterested: string;
  additionalNotes: string;
  screeningAnswers?: Array<{
    questionId: string;
    question: string;
    answer: string;
    questionType: 'text' | 'multiple-choice' | 'yes-no' | 'numeric';
  }>;
}

export interface InterviewData {
  type: string;
  scheduledDate: string;
  duration: number;
  location: string;
  meetingLink: string;
  interviewer: { 
    name: string; 
    email: string; 
    title: string; 
  };
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  applicantId: string;
  applicantName: string;
  applicantEmail?: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview-scheduled' | 'rejected' | 'hired';
  coverLetter: string;
  
  resume?: {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  };
  portfolio?: {
    url: string;
    description: string;
  };
  additionalDocuments?: Array<{
    name: string;
    fileName: string;
    type: 'certificate' | 'transcript' | 'recommendation' | 'portfolio' | 'other';
    uploadedAt: string;
  }>;
  personalInfo?: {
    phone: string;
    linkedIn: string;
    website: string;
    availableStartDate: string;
  };
  salaryExpectation?: {
    min: string;
    max: string;
    currency: string;
    isNegotiable: boolean;
  };
  whyInterested?: string;
  additionalNotes?: string;
  
  screeningAnswers?: Array<{
    questionId: string;
    question: string;
    answer: string;
    questionType: 'text' | 'multiple-choice' | 'yes-no' | 'numeric';
  }>;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  seekerId: string;
  seekerName: string;
  field: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  requestDate: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  content: string;
  timestamp: string;
  read: boolean;
  messageType?: 'text' | 'image' | 'file';
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  mentorId: string;
  mentorName: string;
  jobSeekerId: string;
  jobSeekerName: string;
  topic: string;
  description?: string;
  date: string;
  time: string;
  duration: number; 
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'declined';
  meetingLink?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EmployerProfile {
  id: string;
  userId: string;
  companyName: string;
  email: string;
  phone: string;
  industry: string;
  companySize: string;
  location: string;
  website?: string;
  companyLogo?: string; 
  submittedAt: string;
  createdAt: string;
  updatedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  companyRegistration: string;
  description: string;
  contactPerson: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  taxId?: string;
  linkedinProfile?: string;
  benefits: string[];
  workCulture: string;
  remotePolicy: string;
  founded: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

interface UserContextType {
  jobs: Job[];
  applications: Application[];
  mentorshipRequests: MentorshipRequest[];
  messages: Message[];
  conversations: Conversation[];
  sessions: Session[];
  mentors: Mentor[];
  users: User[];
  employerProfiles: EmployerProfile[];
  addJob: (job: Omit<Job, 'id' | 'postedDate'>) => void;
  updateJob: (jobId: string, job: Omit<Job, 'id' | 'postedDate' | 'employerId' | 'applications'>) => void;
  applyToJob: (jobId: string, applicationData: JobApplicationData) => void;
  applyToJobQuick: (jobId: string, coverLetter: string) => void; // Legacy quick apply
  requestMentorship: (mentorId: string, field: string, message: string) => void;
  updateApplicationStatus: (applicationId: string, status: Application['status']) => void;
  updateMentorshipStatus: (requestId: string, status: MentorshipRequest['status']) => void;
  sendMessage: (receiverId: string, receiverName: string, receiverRole: string, content: string) => void;
  markMessageAsRead: (messageId: string) => void;
  getConversationMessages: (conversationId: string) => Message[];
  createOrGetConversation: (otherUserId: string, otherUserName: string, otherUserRole: string) => string;
  bookSession: (mentorId: string, mentorName: string, sessionData: { topic: string; description?: string; date: string; time: string; duration: number }) => void;
  updateSessionStatus: (sessionId: string, status: Session['status']) => void;
  getMentorSessions: (mentorId: string) => Session[];
  getJobSeekerSessions: (jobSeekerId: string) => Session[];
  getMentorById: (mentorId: string) => Mentor | undefined;
  canBookSessionWithMentor: (mentorId: string) => boolean;
  submitEmployerProfile: (profileData: Omit<EmployerProfile, 'id' | 'userId' | 'submittedAt' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEmployerApprovalStatus: (profileId: string, status: 'approved' | 'rejected', reason?: string) => void;
  getPendingEmployerProfiles: () => EmployerProfile[];
  getEmployerProfileByUserId: (userId: string) => EmployerProfile | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); 
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const saved = localStorage.getItem('globalSkillsBridge_jobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Loaded jobs from localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load jobs from localStorage:', error);
    }
    return [];
  });
  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const saved = localStorage.getItem('globalSkillsBridge_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Loaded applications from localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load applications from localStorage:', error);
    }
    return [];
  });
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [employerProfiles, setEmployerProfiles] = useState<EmployerProfile[]>(() => {
    try {
      const saved = localStorage.getItem('employerProfiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Loaded employer profiles from localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load employer profiles from localStorage:', error);
    }
    return [];
  });

  useEffect(() => {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Software Developer',
        company: 'TechCorp International',
        location: 'Toronto',
        country: 'Canada',
        description: 'Join our dynamic team as a Software Developer. We are looking for passionate individuals with strong programming skills.',
        requirements: ['Bachelor\'s degree in Computer Science', '2+ years experience', 'Strong problem-solving skills'],
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        salary: '$65,000 - $85,000 CAD',
        type: 'full-time',
        remote: true,
        postedDate: '2024-01-15',
        employerId: '2',
        applications: 12,
        status: 'active',
        screeningQuestions: [
          {
            id: 'q1',
            question: 'How many years of JavaScript development experience do you have?',
            type: 'numeric',
            required: true,
            placeholder: 'Enter number of years'
          },
          {
            id: 'q2',
            question: 'Are you legally authorized to work in Canada?',
            type: 'yes-no',
            required: true
          },
          {
            id: 'q3',
            question: 'Which JavaScript frameworks have you worked with professionally?',
            type: 'multiple-choice',
            required: true,
            options: ['React', 'Angular', 'Vue.js', 'Svelte', 'None of the above']
          },
          {
            id: 'q4',
            question: 'Describe your experience with full-stack development and any notable projects.',
            type: 'text',
            required: true,
            placeholder: 'Please describe your experience...'
          }
        ]
      },
      {
        id: '2',
        title: 'Electrical Technician',
        company: 'PowerGrid Solutions',
        location: 'Dubai',
        country: 'UAE',
        description: 'Seeking experienced electrical technicians for infrastructure projects in the Middle East.',
        requirements: ['Electrical Engineering Diploma', '3+ years experience', 'UAE experience preferred'],
        skills: ['Electrical Systems', 'PLC Programming', 'Motor Control', 'Safety Protocols'],
        salary: '$45,000 - $60,000 USD',
        type: 'full-time',
        remote: false,
        postedDate: '2024-01-10',
        employerId: '2',
        applications: 8,
        status: 'active',
        screeningQuestions: [
          {
            id: 'q1',
            question: 'Do you have experience working with high-voltage electrical systems?',
            type: 'yes-no',
            required: true
          },
          {
            id: 'q2',
            question: 'Which PLC programming languages are you proficient in?',
            type: 'multiple-choice',
            required: true,
            options: ['Ladder Logic', 'Structured Text', 'Function Block Diagram', 'Sequential Function Chart', 'None']
          },
          {
            id: 'q3',
            question: 'Are you willing to work on rotating shifts and overtime as needed?',
            type: 'yes-no',
            required: true
          },
          {
            id: 'q4',
            question: 'Describe your most challenging electrical project and how you solved it.',
            type: 'text',
            required: false,
            placeholder: 'Please describe the project and your solution...'
          }
        ]
      },
      {
        id: '3',
        title: 'Automotive Mechanic',
        company: 'German Auto Group',
        location: 'Munich',
        country: 'Germany',
        description: 'Join our premium automotive service center specializing in luxury vehicles.',
        requirements: ['Automotive Technology Certificate', '2+ years experience', 'German language basics'],
        skills: ['Engine Diagnostics', 'Brake Systems', 'Transmission Repair', 'BMW/Mercedes expertise'],
        salary: '€40,000 - €55,000',
        type: 'full-time',
        remote: false,
        postedDate: '2024-01-12',
        employerId: '2',
        applications: 15,
        status: 'active',
        screeningQuestions: [
          {
            id: 'q1',
            question: 'Do you have specific experience with BMW or Mercedes-Benz vehicles?',
            type: 'multiple-choice',
            required: true,
            options: ['BMW only', 'Mercedes-Benz only', 'Both BMW and Mercedes-Benz', 'Neither, but willing to learn']
          },
          {
            id: 'q2',
            question: 'What is your proficiency level in German?',
            type: 'multiple-choice',
            required: true,
            options: ['Native/Fluent', 'Conversational', 'Basic', 'None, but willing to learn']
          },
          {
            id: 'q3',
            question: 'Are you authorized to work in Germany/EU?',
            type: 'yes-no',
            required: true
          },
          {
            id: 'q4',
            question: 'How many years of automotive repair experience do you have?',
            type: 'numeric',
            required: true,
            placeholder: 'Enter number of years'
          }
        ]
      }
    ];

    const mockApplications: Application[] = [
      {
        id: '1',
        jobId: '1',
        jobTitle: 'Software Developer',
        company: 'TechCorp International',
        applicantId: 'user-1',
        applicantName: 'Jane Smith',
        applicantEmail: 'jane.smith@email.com',
        appliedDate: '2024-01-16',
        status: 'pending',
        coverLetter: 'I am excited to apply for the Software Developer position at TechCorp International. With my 3 years of experience in full-stack development and expertise in JavaScript, React, and Node.js, I believe I would be a valuable addition to your team. I am passionate about creating innovative solutions and always eager to learn new technologies. My experience at Tech Innovations Inc. has prepared me to take on new challenges and contribute to your dynamic team.'
      },
      {
        id: '2',
        jobId: '2',
        jobTitle: 'Electrical Technician',
        company: 'PowerGrid Solutions',
        applicantId: 'user-2',
        applicantName: 'Ahmed Hassan',
        applicantEmail: 'ahmed.hassan@email.com',
        appliedDate: '2024-01-17',
        status: 'reviewed',
        coverLetter: 'I am writing to express my interest in the Electrical Technician position at PowerGrid Solutions. With over 5 years of experience in electrical systems and PLC programming, including 2 years of UAE-specific experience, I am well-prepared for this role. My background at Emirates Power Solutions has given me extensive experience in industrial automation and power systems maintenance, which aligns perfectly with your requirements.'
      },
      {
        id: '3',
        jobId: '3',
        jobTitle: 'Graphic Designer',
        company: 'Creative Agency Ltd',
        applicantId: 'user-3',
        applicantName: 'Maria Gonzalez',
        applicantEmail: 'maria.gonzalez@email.com',
        appliedDate: '2024-01-18',
        status: 'shortlisted',
        coverLetter: 'I am thrilled to submit my application for the Graphic Designer position at Creative Agency Ltd. As a creative professional with expertise in Adobe Creative Suite and brand development, I have successfully delivered visual solutions for diverse clients at Creative Studio MX. My passion for visual storytelling and attention to detail make me an ideal candidate for this role. I would love to bring my creative vision to your team.'
      }
    ];

    const mockMentorshipRequests: MentorshipRequest[] = [
      {
        id: '1',
        mentorId: '1',
        mentorName: 'Sarah Uwimana',
        seekerId: 'user-1',
        seekerName: 'John Mukamana',
        field: 'Software Development',
        message: 'I would love guidance on transitioning to international tech roles.',
        status: 'accepted',
        requestDate: '2024-01-14'
      },
      {
        id: '2',
        mentorId: '2',
        mentorName: 'Jean Baptiste Nzeyimana',
        seekerId: 'user-1',
        seekerName: 'John Mukamana',
        field: 'Electrical Engineering',
        message: 'Looking for mentorship in renewable energy projects.',
        status: 'accepted',
        requestDate: '2024-01-10'
      }
    ];

    const mockMessages: Message[] = [
      {
        id: '1',
        conversationId: 'conv-1',
        senderId: 'mentor-1',
        senderName: 'Sarah Uwimana',
        senderRole: 'mentor',
        receiverId: 'user-1',
        receiverName: 'John Doe',
        receiverRole: 'job-seeker',
        content: 'Hi! I saw your mentorship request and would love to help you with your career transition.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
        messageType: 'text'
      },
      {
        id: '2',
        conversationId: 'conv-1',
        senderId: 'user-1',
        senderName: 'John Doe',
        senderRole: 'job-seeker',
        receiverId: 'mentor-1',
        receiverName: 'Sarah Uwimana',
        receiverRole: 'mentor',
        content: 'Thank you so much! I\'m really interested in learning about opportunities in Canada.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: true,
        messageType: 'text'
      },
      {
        id: '3',
        conversationId: 'conv-1',
        senderId: 'mentor-1',
        senderName: 'Sarah Uwimana',
        senderRole: 'mentor',
        receiverId: 'user-1',
        receiverName: 'John Doe',
        receiverRole: 'job-seeker',
        content: 'I\'d be happy to help you with your career transition. Let\'s schedule a call this week.',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        read: false,
        messageType: 'text'
      },
      {
        id: '4',
        conversationId: 'conv-2',
        senderId: 'employer-1',
        senderName: 'TechCorp HR',
        senderRole: 'employer',
        receiverId: 'user-1',
        receiverName: 'John Doe',
        receiverRole: 'job-seeker',
        content: 'Thank you for your application for the Software Developer position.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true,
        messageType: 'text'
      },
      {
        id: '5',
        conversationId: 'conv-2',
        senderId: 'user-1',
        senderName: 'John Doe',
        senderRole: 'job-seeker',
        receiverId: 'employer-1',
        receiverName: 'TechCorp HR',
        receiverRole: 'employer',
        content: 'Thank you for considering my application. I\'m very excited about this opportunity.',
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        read: true,
        messageType: 'text'
      },
      {
        id: '6',
        conversationId: 'conv-2',
        senderId: 'employer-1',
        senderName: 'TechCorp HR',
        senderRole: 'employer',
        receiverId: 'user-1',
        receiverName: 'John Doe',
        receiverRole: 'job-seeker',
        content: 'We\'d like to schedule an interview with you. Are you available this week?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
        messageType: 'text'
      }
    ];

    const mockConversations: Conversation[] = [
      {
        id: 'conv-1',
        participants: [
          { id: 'user-1', name: 'John Doe', role: 'job-seeker' },
          { id: 'mentor-1', name: 'Sarah Uwimana', role: 'mentor' }
        ],
        lastMessage: mockMessages[2],
        unreadCount: 1,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 900000).toISOString()
      },
      {
        id: 'conv-2',
        participants: [
          { id: 'user-1', name: 'John Doe', role: 'job-seeker' },
          { id: 'employer-1', name: 'TechCorp HR', role: 'employer' }
        ],
        lastMessage: mockMessages[5],
        unreadCount: 0,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    const mockSessions: Session[] = [
      {
        id: 'session-1',
        mentorId: '1', 
        mentorName: 'Current Mentor',
        jobSeekerId: 'user-1',
        jobSeekerName: 'Jane Smith',
        topic: 'Career Planning Session',
        description: 'Discuss career transition opportunities in tech',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        time: '14:00',
        duration: 60,
        status: 'confirmed',
        meetingLink: 'https://meet.google.com/session-1',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'session-2',
        mentorId: '1',
        mentorName: 'Current Mentor',
        jobSeekerId: 'user-2',
        jobSeekerName: 'Ahmed Hassan',
        topic: 'Technical Skills Review',
        description: 'Review programming fundamentals and best practices',
        date: new Date(Date.now() + 432000000).toISOString().split('T')[0], // In 5 days
        time: '16:00',
        duration: 90,
        status: 'pending',
        meetingLink: 'https://meet.google.com/session-2',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'session-3',
        mentorId: '1',
        mentorName: 'Current Mentor',
        jobSeekerId: 'user-3',
        jobSeekerName: 'Maria Gonzalez',
        topic: 'Portfolio Review',
        description: 'Review design portfolio and provide feedback',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
        time: '10:00',
        duration: 60,
        status: 'completed',
        meetingLink: 'https://meet.google.com/session-3',
        notes: 'Great portfolio! Suggested adding more UX case studies.',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'session-4',
        mentorId: '1',
        mentorName: 'Current Mentor',
        jobSeekerId: 'user-1',
        jobSeekerName: 'Jane Smith',
        topic: 'Interview Preparation',
        description: 'Practice technical interview questions',
        date: new Date(Date.now() - 604800000).toISOString().split('T')[0], // 1 week ago
        time: '15:30',
        duration: 45,
        status: 'cancelled',
        meetingLink: 'https://meet.google.com/session-4',
        notes: 'Cancelled due to mentee schedule conflict.',
        createdAt: new Date(Date.now() - 691200000).toISOString(),
        updatedAt: new Date(Date.now() - 604800000).toISOString()
      }
    ];

    const mockMentors: Mentor[] = [
      {
        id: '1',
        name: 'Sarah Uwimana',
        title: 'Senior Software Engineer',
        company: 'Google',
        expertise: ['Software Development', 'Project Management', 'Career Transition', 'Technical Leadership'],
        location: 'Toronto, Canada',
        experience: '8+ years',
        rating: 4.9,
        reviews: 24,
        bio: 'Senior Software Engineer at Google with extensive experience in full-stack development and team leadership. Originally from Rwanda, I am passionate about helping TVET graduates transition to successful tech careers globally. I have mentored over 50 professionals and helped them secure positions at top tech companies.',
        currentRole: 'Senior Software Engineer at Google',
        achievements: [
          'Led development of 3 major products at Google',
          'Mentored 50+ professionals to career success',
          'Speaker at 10+ international tech conferences',
          'Published 15+ technical articles'
        ],
        languages: ['English', 'Kinyarwanda', 'French'],
        availability: 'Weekends and evenings (EST)',
        sessionTypes: ['Video Call', 'Phone Call', 'In-Person (Toronto area)'],
        responseTime: 'Usually responds within 24 hours',
        totalMentees: 52,
        successStories: 38
      },
      {
        id: '2',
        name: 'Jean Baptiste Nzeyimana',
        title: 'Engineering Manager',
        company: 'Emirates Energy',
        expertise: ['Electrical Engineering', 'Renewable Energy', 'Leadership', 'Project Management'],
        location: 'Dubai, UAE',
        experience: '10+ years',
        rating: 4.8,
        reviews: 18,
        bio: 'Electrical Engineering Manager specializing in renewable energy projects. Leading teams across the Middle East and helping engineers advance their careers internationally. Experienced in sustainable energy solutions and team management.',
        currentRole: 'Engineering Manager at Emirates Energy',
        achievements: [
          'Managed $50M+ renewable energy projects',
          'Led teams of 20+ engineers',
          'Reduced project costs by 25% through innovation',
          'Certified in PMP and Six Sigma'
        ],
        languages: ['English', 'Arabic', 'Kinyarwanda', 'French'],
        availability: 'Weekdays 6-8 PM (GST)',
        sessionTypes: ['Video Call', 'Phone Call'],
        responseTime: 'Usually responds within 48 hours',
        totalMentees: 28,
        successStories: 21
      },
      {
        id: '3',
        name: 'Marie Claire Mukasonga',
        title: 'Quality Manager',
        company: 'BMW',
        expertise: ['Automotive Technology', 'Quality Assurance', 'Team Leadership', 'Process Improvement'],
        location: 'Munich, Germany',
        experience: '12+ years',
        rating: 4.9,
        reviews: 31,
        bio: 'Quality Manager at BMW with deep expertise in automotive systems and manufacturing processes. Passionate about supporting young engineers in their career development and international mobility. Specialist in automotive quality standards and continuous improvement.',
        currentRole: 'Quality Manager at BMW',
        achievements: [
          'Improved quality metrics by 40%',
          'Implemented lean manufacturing processes',
          'Certified Master Black Belt in Six Sigma',
          'Led cross-cultural teams across 5 countries'
        ],
        languages: ['English', 'German', 'Kinyarwanda', 'French'],
        availability: 'Weekends (CET)',
        sessionTypes: ['Video Call', 'Phone Call', 'In-Person (Munich area)'],
        responseTime: 'Usually responds within 12 hours',
        totalMentees: 45,
        successStories: 34
      }
    ];

    
    setJobs(prev => {
      if (prev.length === 0) {
        console.log('Initializing with mock jobs:', mockJobs.length);
        try {
          localStorage.setItem('globalSkillsBridge_jobs', JSON.stringify(mockJobs));
        } catch (error) {
          console.error('Failed to save mock jobs to localStorage:', error);
        }
        return mockJobs;
      } else {
        console.log('Using existing jobs from localStorage:', prev.length);
        return prev;
      }
    });

    setApplications(prev => {
      if (prev.length === 0) {
        console.log('Initializing with mock applications:', mockApplications.length);
       
        try {
          localStorage.setItem('globalSkillsBridge_applications', JSON.stringify(mockApplications));
        } catch (error) {
          console.error('Failed to save mock applications to localStorage:', error);
        }
        return mockApplications;
      } else {
        console.log('Using existing applications from localStorage:', prev.length);
        return prev;
      }
    });

    setMentorshipRequests(mockMentorshipRequests);
    setMessages(mockMessages);
    setConversations(mockConversations);
    setSessions(mockSessions);
    setMentors(mockMentors);

    // Mock users for applicant profiles
    const mockUsers: User[] = [
      {
        id: 'user-1',
        email: 'jane.smith@email.com',
        name: 'Jane Smith',
        role: 'job-seeker',
        isEmailVerified: true,
        profileCompletion: 100
      },
      {
        id: 'user-2',
        email: 'ahmed.hassan@email.com',
        name: 'Ahmed Hassan',
        role: 'job-seeker',
        isEmailVerified: true,
        profileCompletion: 100
      },
      {
        id: 'user-3',
        email: 'maria.gonzalez@email.com',
        name: 'Maria Gonzalez',
        role: 'job-seeker',
        isEmailVerified: true,
        profileCompletion: 100
      }
    ];

    const mockEmployerProfiles: EmployerProfile[] = [
      {
        id: 'emp-1',
        userId: 'user-employer-1',
        companyName: 'TechCorp Solutions',
        companyLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
        email: 'hr@techcorp.com',
        phone: '+1 (555) 123-4567',
        industry: 'Technology',
        companySize: '51-200 employees',
        location: 'Kigali, Rwanda',
        website: 'https://techcorp.com',
        submittedAt: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        status: 'pending',
        companyRegistration: 'RW-12345678',
        description: 'Leading software development company focused on innovative solutions for African markets.',
        contactPerson: 'Jane Smith',
        address: '123 Tech Street',
        city: 'Kigali',
        country: 'Rwanda',
        postalCode: '12345',
        taxId: 'TAX-123456',
        linkedinProfile: 'https://linkedin.com/company/techcorp',
        benefits: ['Health Insurance', 'Remote Work Options', 'Professional Development'],
        workCulture: 'Fast-paced, innovative environment focused on collaboration and continuous learning.',
        remotePolicy: 'hybrid',
        founded: '2018'
      },
      {
        id: 'emp-2',
        userId: 'user-employer-2',
        companyName: 'Green Energy Ltd',
        companyLogo: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=200&h=200&fit=crop',
        email: 'contact@greenenergy.rw',
        phone: '+250 788 123 456',
        industry: 'Energy',
        companySize: '11-50 employees',
        location: 'Kigali, Rwanda',
        website: 'https://greenenergy.rw',
        submittedAt: '2024-01-14T14:20:00Z',
        createdAt: '2024-01-14T14:20:00Z',
        updatedAt: '2024-01-14T14:20:00Z',
        status: 'pending',
        companyRegistration: 'RW-87654321',
        description: 'Renewable energy solutions provider committed to sustainable development in East Africa.',
        contactPerson: 'Robert Mugisha',
        address: '456 Green Avenue',
        city: 'Kigali',
        country: 'Rwanda',
        postalCode: '54321',
        benefits: ['Health Insurance', 'Flexible Working Hours', 'Environmental Impact Bonus'],
        workCulture: 'Mission-driven team focused on environmental sustainability and innovation.',
        remotePolicy: 'remote-friendly',
        founded: '2020'
      },
      {
        id: 'emp-3',
        userId: '2',
        companyName: 'Tech Solutions Ltd',
        email: 'employer@company.com',
        phone: '+1 (555) 987-6543',
        industry: 'Technology',
        companySize: '201-500 employees',
        location: 'Toronto, Canada',
        submittedAt: '2024-01-01T09:00:00Z',
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-02T10:00:00Z',
        status: 'approved',
        companyRegistration: 'CA-555444333',
        description: 'Established technology company providing enterprise solutions.',
        contactPerson: 'Tech Admin',
        address: '789 Business Blvd',
        city: 'Toronto',
        country: 'Canada',
        postalCode: 'M1M 1M1',
        benefits: ['Health Insurance', 'Retirement Plan (401k/RRSP)', 'Professional Development'],
        workCulture: 'Professional environment with focus on work-life balance.',
        remotePolicy: 'remote-first',
        founded: '2015',
        approvedAt: '2024-01-02T10:00:00Z',
        approvedBy: 'admin'
      }
    ];

    setUsers(mockUsers);
    
    setEmployerProfiles(prev => {
      if (prev.length === 0) {
        console.log('Initializing with mock employer profiles:', mockEmployerProfiles.length);
        try {
          localStorage.setItem('employerProfiles', JSON.stringify(mockEmployerProfiles));
        } catch (error) {
          console.error('Failed to save mock data to localStorage:', error);
        }
        return mockEmployerProfiles;
      } else {
        console.log('Using existing employer profiles from localStorage:', prev.length);
        return prev;
      }
    });
    
    console.log('UserContext initialized with mock data:');
    console.log('Jobs:', mockJobs.length);
  }, []);

  useEffect(() => {
    if (jobs.length > 0) {
      try {
        localStorage.setItem('globalSkillsBridge_jobs', JSON.stringify(jobs));
        console.log('Saved jobs to localStorage:', jobs.length);
      } catch (error) {
        console.error('Failed to save jobs to localStorage:', error);
      }
    }
  }, [jobs]);

  useEffect(() => {
    if (applications.length > 0) {
      try {
        localStorage.setItem('globalSkillsBridge_applications', JSON.stringify(applications));
        console.log('Saved applications to localStorage:', applications.length);
      } catch (error) {
        console.error('Failed to save applications to localStorage:', error);
      }
    }
  }, [applications]);

  const addJob = (jobData: Omit<Job, 'id' | 'postedDate'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      postedDate: new Date().toISOString().split('T')[0],
      applications: 0
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const updateJob = (jobId: string, jobData: Omit<Job, 'id' | 'postedDate' | 'employerId' | 'applications'>) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, ...jobData }
        : job
    ));
  };

  const applyToJob = (jobId: string, applicationData: JobApplicationData) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const processedDocuments = applicationData.additionalDocuments
      .filter(doc => doc.file)
      .map(doc => ({
        name: doc.name,
        fileName: doc.file!.name,
        type: doc.type,
        uploadedAt: new Date().toISOString()
      }));

    const newApplication: Application = {
      id: Date.now().toString(),
      jobId,
      jobTitle: job.title,
      company: job.company,
      applicantId: user?.id || '1', 
      applicantName: user?.name || 'Current User',
      applicantEmail: user?.email || 'current.user@email.com',
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      coverLetter: applicationData.coverLetter,
      
      resume: applicationData.resume ? {
        fileName: applicationData.resume.name,
        fileSize: applicationData.resume.size,
        uploadedAt: new Date().toISOString()
      } : undefined,
      
      portfolio: applicationData.portfolio.url ? {
        url: applicationData.portfolio.url,
        description: applicationData.portfolio.description
      } : undefined,
      
      additionalDocuments: processedDocuments.length > 0 ? processedDocuments : undefined,
      
      personalInfo: {
        phone: applicationData.personalInfo.phone,
        linkedIn: applicationData.personalInfo.linkedIn,
        website: applicationData.personalInfo.website,
        availableStartDate: applicationData.personalInfo.availableStartDate
      },
      
      salaryExpectation: applicationData.salaryExpectation.min ? {
        min: applicationData.salaryExpectation.min,
        max: applicationData.salaryExpectation.max,
        currency: applicationData.salaryExpectation.currency,
        isNegotiable: applicationData.salaryExpectation.isNegotiable
      } : undefined,
      
      whyInterested: applicationData.whyInterested,
      additionalNotes: applicationData.additionalNotes,
      screeningAnswers: applicationData.screeningAnswers
    };

    setApplications(prev => [newApplication, ...prev]);
    setJobs(prev => prev.map(j => 
      j.id === jobId 
        ? { ...j, applications: (j.applications || 0) + 1 }
        : j
    ));

    console.log('Comprehensive application submitted:', newApplication);
  };

  const applyToJobQuick = (jobId: string, coverLetter: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const newApplication: Application = {
      id: Date.now().toString(),
      jobId,
      jobTitle: job.title,
      company: job.company,
      applicantId: user?.id || '1',
      applicantName: user?.name || 'Current User',
      applicantEmail: user?.email || 'current.user@email.com',
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      coverLetter
    };

    setApplications(prev => [newApplication, ...prev]);
    setJobs(prev => prev.map(j => 
      j.id === jobId 
        ? { ...j, applications: (j.applications || 0) + 1 }
        : j
    ));
  };

  const requestMentorship = (mentorId: string, field: string, message: string) => {
    const newRequest: MentorshipRequest = {
      id: Date.now().toString(),
      mentorId,
      mentorName: 'Mentor Name', 
      seekerId: '1', 
      seekerName: 'Current User',
      field,
      message,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0]
    };

    setMentorshipRequests(prev => [newRequest, ...prev]);
  };

  const updateApplicationStatus = (applicationId: string, status: Application['status']) => {
    setApplications(prev => prev.map(app =>
      app.id === applicationId ? { ...app, status } : app
    ));
  };

  const updateMentorshipStatus = (requestId: string, status: MentorshipRequest['status']) => {
    setMentorshipRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status } : req
    ));
  };

  const createOrGetConversation = (otherUserId: string, otherUserName: string, otherUserRole: string): string => {
    const existingConv = conversations.find(conv => 
      conv.participants.some(p => p.id === otherUserId)
    );

    if (existingConv) {
      return existingConv.id;
    }

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: [
        { id: 'user-1', name: 'Current User', role: 'job-seeker' }, 
        { id: otherUserId, name: otherUserName, role: otherUserRole }
      ],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setConversations(prev => [newConversation, ...prev]);
    return newConversation.id;
  };

  const sendMessage = (receiverId: string, receiverName: string, receiverRole: string, content: string) => {
    const conversationId = createOrGetConversation(receiverId, receiverName, receiverRole);
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: 'user-1', 
      senderName: 'Current User', 
      senderRole: 'job-seeker', 
      receiverId,
      receiverName,
      receiverRole,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      messageType: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            lastMessage: newMessage,
            updatedAt: new Date().toISOString()
          }
        : conv
    ));
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, read: true } : msg
    ));

    const message = messages.find(m => m.id === messageId);
    if (message) {
      setConversations(prev => prev.map(conv => 
        conv.id === message.conversationId 
          ? { 
              ...conv, 
              unreadCount: Math.max(0, conv.unreadCount - 1)
            }
          : conv
      ));
    }
  };

  const getConversationMessages = (conversationId: string): Message[] => {
    return messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const bookSession = (
    mentorId: string, 
    mentorName: string, 
    sessionData: { topic: string; description?: string; date: string; time: string; duration: number }
  ) => {
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    const newSession: Session = {
      id: `session-${Date.now()}`,
      mentorId,
      mentorName,
      jobSeekerId: user.id,
      jobSeekerName: user.name,
      topic: sessionData.topic,
      description: sessionData.description,
      date: sessionData.date,
      time: sessionData.time,
      duration: sessionData.duration,
      status: 'confirmed', 
      meetingLink: `https://meet.google.com/session-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSessions(prev => [...prev, newSession]);
    console.log('Session booked successfully:', newSession);
  };

  const updateSessionStatus = (sessionId: string, status: Session['status']) => {
    setSessions(prev => prev.map(session =>
      session.id === sessionId 
        ? { ...session, status, updatedAt: new Date().toISOString() }
        : session
    ));
  };

  const getMentorSessions = (mentorId: string): Session[] => {
    return sessions
      .filter(session => session.mentorId === mentorId)
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
  };

  const getJobSeekerSessions = (jobSeekerId: string): Session[] => {
    return sessions
      .filter(session => session.jobSeekerId === jobSeekerId)
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
  };

  const getMentorById = (mentorId: string): Mentor | undefined => {
    return mentors.find(mentor => mentor.id === mentorId);
  };

  const canBookSessionWithMentor = (mentorId: string): boolean => {
    return mentorshipRequests.some(request => 
      request.mentorId === mentorId && 
      request.seekerId === 'user-1' && 
      request.status === 'accepted'
    );
  };

  const submitEmployerProfile = async (profileData: Omit<EmployerProfile, 'id' | 'userId' | 'submittedAt' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const currentTime = new Date().toISOString();
    
    const userId = user?.id || `temp-user-${Date.now()}`;
    
    if (!user) {
      console.warn('No authenticated user found - using temporary user ID for demo purposes');
    }

    const newProfile: EmployerProfile = {
      ...profileData,
      id: `emp-${Date.now()}`,
      userId: userId,
      submittedAt: currentTime,
      createdAt: currentTime,
      updatedAt: currentTime,
      status: 'pending'
    };

    console.log('=== SUBMITTING EMPLOYER PROFILE ===');
    console.log('Profile data:', newProfile);
    console.log('Company Logo:', profileData.companyLogo ? 'Logo present (base64)' : 'No logo');
    console.log('Logo preview (first 100 chars):', profileData.companyLogo?.substring(0, 100));
    console.log('Current user:', user);
    
    if (user) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            companyInfo: {
              name: profileData.companyName,
              industry: profileData.industry,
              size: profileData.companySize,
              website: profileData.website,
              description: profileData.description,
              registrationNumber: profileData.companyRegistration,
              establishedYear: profileData.founded ? parseInt(profileData.founded) : undefined
            },
            location: {
              city: profileData.city,
              country: profileData.country,
              address: profileData.address
            },
            phone: profileData.phone,
            avatar: profileData.companyLogo ? {
              url: profileData.companyLogo,
              public_id: `company_logo_${Date.now()}`
            } : undefined
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save profile to backend');
        }

        const result = await response.json();
        console.log('Profile saved to backend:', result);
      } catch (error) {
        console.error('Error saving profile to backend:', error);
        
      }
    }
    
    setEmployerProfiles(prev => {
      const updatedProfiles = [...prev, newProfile];
      console.log('Updated profiles after submission:', updatedProfiles);
      
      try {
        localStorage.setItem('employerProfiles', JSON.stringify(updatedProfiles));
        console.log('Profiles saved to localStorage');
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
      
      return updatedProfiles;
    });
    
    console.log('Employer profile submitted successfully!');
  };

  const updateEmployerApprovalStatus = (profileId: string, status: 'approved' | 'rejected', reason?: string) => {
    const adminId = user?.id || 'demo-admin';
    
    if (!user) {
      console.warn('No authenticated user - proceeding with demo admin permissions');
    } else if (user.role !== 'admin') {
      console.warn('User is not admin - proceeding for demo purposes');
    }

    setEmployerProfiles(prev => {
      const updatedProfiles = prev.map(profile => 
        profile.id === profileId 
          ? { 
              ...profile, 
              status,
              updatedAt: new Date().toISOString(),
              ...(status === 'approved' && {
                approvedAt: new Date().toISOString(),
                approvedBy: adminId
              }),
              ...(status === 'rejected' && {
                rejectedAt: new Date().toISOString(),
                rejectedBy: adminId,
                rejectionReason: reason
              })
            }
          : profile
      );
      
      try {
        localStorage.setItem('employerProfiles', JSON.stringify(updatedProfiles));
        console.log('Employer profile status updated and saved to localStorage');
      } catch (error) {
        console.error('Failed to save updated profiles to localStorage:', error);
      }
      
      return updatedProfiles;
    });

    console.log(`Employer profile ${profileId} ${status}${reason ? ` - Reason: ${reason}` : ''}`);
  };

  const getPendingEmployerProfiles = (): EmployerProfile[] => {
    return employerProfiles.filter(profile => profile.status === 'pending');
  };

  const getEmployerProfileByUserId = (userId: string): EmployerProfile | undefined => {
    return employerProfiles.find(profile => profile.userId === userId);
  };

  const value = {
    jobs,
    applications,
    mentorshipRequests,
    messages,
    conversations,
    sessions,
    mentors,
    users,
    employerProfiles,
    addJob,
    updateJob,
    applyToJob,
    applyToJobQuick,
    requestMentorship,
    updateApplicationStatus,
    updateMentorshipStatus,
    sendMessage,
    markMessageAsRead,
    getConversationMessages,
    createOrGetConversation,
    bookSession,
    updateSessionStatus,
    getMentorSessions,
    getJobSeekerSessions,
    getMentorById,
    canBookSessionWithMentor,
    submitEmployerProfile,
    updateEmployerApprovalStatus,
    getPendingEmployerProfiles,
    getEmployerProfileByUserId
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
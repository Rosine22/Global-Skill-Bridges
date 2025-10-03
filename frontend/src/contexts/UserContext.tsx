import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Job {
  id: string;
  title: string;
  company: string;
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
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  applicantId: string;
  applicantName: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  coverLetter: string;
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

interface UserContextType {
  jobs: Job[];
  applications: Application[];
  mentorshipRequests: MentorshipRequest[];
  addJob: (job: Omit<Job, 'id' | 'postedDate'>) => void;
  applyToJob: (jobId: string, coverLetter: string) => void;
  requestMentorship: (mentorId: string, field: string, message: string) => void;
  updateApplicationStatus: (applicationId: string, status: Application['status']) => void;
  updateMentorshipStatus: (requestId: string, status: MentorshipRequest['status']) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);

  useEffect(() => {
    // Initialize with mock data
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
        status: 'active'
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
        status: 'active'
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
        status: 'active'
      }
    ];

    const mockApplications: Application[] = [
      {
        id: '1',
        jobId: '1',
        jobTitle: 'Software Developer',
        company: 'TechCorp International',
        applicantId: '1',
        applicantName: 'John Mukamana',
        appliedDate: '2024-01-16',
        status: 'pending',
        coverLetter: 'I am excited to apply for this position...'
      }
    ];

    const mockMentorshipRequests: MentorshipRequest[] = [
      {
        id: '1',
        mentorId: '3',
        mentorName: 'Sarah Uwimana',
        seekerId: '1',
        seekerName: 'John Mukamana',
        field: 'Software Development',
        message: 'I would love guidance on transitioning to international tech roles.',
        status: 'accepted',
        requestDate: '2024-01-14'
      }
    ];

    setJobs(mockJobs);
    setApplications(mockApplications);
    setMentorshipRequests(mockMentorshipRequests);
  }, []);

  const addJob = (jobData: Omit<Job, 'id' | 'postedDate'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      postedDate: new Date().toISOString().split('T')[0],
      applications: 0
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const applyToJob = (jobId: string, coverLetter: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const newApplication: Application = {
      id: Date.now().toString(),
      jobId,
      jobTitle: job.title,
      company: job.company,
      applicantId: '1', // Current user ID
      applicantName: 'Current User',
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
      mentorName: 'Mentor Name', // Would be fetched from mentor data
      seekerId: '1', // Current user ID
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

  const value = {
    jobs,
    applications,
    mentorshipRequests,
    addJob,
    applyToJob,
    requestMentorship,
    updateApplicationStatus,
    updateMentorshipStatus
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { useUserContext, Job } from '../contexts/UserContext';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Briefcase,
  Clock,
  Users,
  Globe
} from 'lucide-react';

interface JobCardProps {
  job: Job;
}

function JobCard({ job }: JobCardProps) {
  const { applications, applyToJob } = useUserContext();
  
  const hasApplied = applications.some(app => app.jobId === job.id);
  
  const handleQuickApply = () => {
    if (!hasApplied) {
      applyToJob(job.id, 'I am interested in this position and believe my skills would be a great fit for your team.');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link 
            to={`/job/${job.id}`} 
            className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {job.title}
          </Link>
          <p className="text-lg text-gray-700 mt-1">{job.company}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            job.type === 'full-time' 
              ? 'bg-secondary-100 text-secondary-800'
              : job.type === 'part-time'
              ? 'bg-primary-100 text-primary-800'
              : 'bg-purple-100 text-purple-800'
          }`}>
            {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
          </span>
          {job.remote && (
            <span className="mt-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
              Remote
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {job.location}, {job.country}
        </div>
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-1" />
          {job.salary || 'Salary not specified'}
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          Posted {job.postedDate}
        </div>
        {job.applications && (
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {job.applications} applications
          </div>
        )}
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 4).map((skill) => (
          <span 
            key={skill}
            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            +{job.skills.length - 4} more
          </span>
        )}
      </div>

      <div className="flex justify-between items-center">
        <Link
          to={`/job/${job.id}`}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          View Details
        </Link>
        <div className="flex space-x-3">
          <button className="text-gray-600 hover:text-gray-700 text-sm">
            Save
          </button>
          {hasApplied ? (
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
              Applied
            </span>
          ) : (
            <button
              onClick={handleQuickApply}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Quick Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobCard;
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Global Skills Bridge API',
    version: '1.0.0',
    description: 'Comprehensive API documentation for Global Skills Bridge - A TVET job matching and skills development platform',
    contact: {
      name: 'Global Skills Bridge Team',
      email: 'support@globalskillsbridge.com',
      url: 'https://globalskillsbridge.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development Server'
    },
    {
      url: 'https://your-production-domain.com',
      description: 'Production Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from login endpoint'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          _id: {
            type: 'string',
            description: 'Auto-generated MongoDB ObjectId'
          },
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            description: 'Full name of the user'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Valid email address'
          },
          role: {
            type: 'string',
            enum: ['job-seeker', 'employer', 'mentor', 'admin', 'rtb-admin'],
            description: 'User role in the system'
          },
          avatar: {
            type: 'string',
            format: 'uri',
            description: 'Profile picture URL'
          },
          location: {
            type: 'object',
            properties: {
              city: { type: 'string' },
              country: { type: 'string' },
              coordinates: {
                type: 'array',
                items: { type: 'number' }
              }
            }
          },
          skills: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                skill: { type: 'string' },
                proficiencyLevel: {
                  type: 'string',
                  enum: ['beginner', 'intermediate', 'advanced', 'expert']
                },
                yearsOfExperience: { type: 'number' }
              }
            }
          },
          isVerified: {
            type: 'boolean',
            description: 'Email verification status'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Job: {
        type: 'object',
        required: ['title', 'company', 'description', 'location'],
        properties: {
          _id: {
            type: 'string',
            description: 'Auto-generated MongoDB ObjectId'
          },
          title: {
            type: 'string',
            description: 'Job title'
          },
          company: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              logo: { type: 'string' },
              website: { type: 'string' }
            }
          },
          description: {
            type: 'string',
            description: 'Detailed job description'
          },
          location: {
            type: 'object',
            properties: {
              city: { type: 'string' },
              country: { type: 'string' },
              remote: { type: 'boolean' }
            }
          },
          salary: {
            type: 'object',
            properties: {
              min: { type: 'number' },
              max: { type: 'number' },
              currency: { type: 'string' }
            }
          },
          jobType: {
            type: 'string',
            enum: ['full-time', 'part-time', 'contract', 'internship']
          },
          status: {
            type: 'string',
            enum: ['active', 'closed', 'draft']
          },
          requirements: {
            type: 'object',
            properties: {
              skills: {
                type: 'array',
                items: { type: 'string' }
              },
              experience: { type: 'string' },
              education: { type: 'string' }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Application: {
        type: 'object',
        required: ['applicant', 'job'],
        properties: {
          _id: {
            type: 'string',
            description: 'Auto-generated MongoDB ObjectId'
          },
          applicant: {
            type: 'string',
            description: 'User ID of the applicant'
          },
          job: {
            type: 'string',
            description: 'Job ID'
          },
          status: {
            type: 'string',
            enum: ['submitted', 'under-review', 'interview-scheduled', 'interview-completed', 'offer-extended', 'hired', 'rejected'],
            description: 'Current application status'
          },
          coverLetter: {
            type: 'string',
            description: 'Applicant cover letter'
          },
          resume: {
            type: 'string',
            format: 'uri',
            description: 'Resume file URL'
          },
          matchScore: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'AI-calculated match score'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      MentorshipRequest: {
        type: 'object',
        required: ['mentee', 'mentor', 'requestedSkills'],
        properties: {
          _id: {
            type: 'string',
            description: 'Auto-generated MongoDB ObjectId'
          },
          mentee: {
            type: 'string',
            description: 'User ID of the mentee requesting mentorship'
          },
          mentor: {
            type: 'string',
            description: 'User ID of the requested mentor'
          },
          requestedSkills: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Skills for which mentorship is requested'
          },
          message: {
            type: 'string',
            description: 'Message from mentee to mentor'
          },
          status: {
            type: 'string',
            enum: ['pending', 'accepted', 'declined', 'completed'],
            default: 'pending',
            description: 'Current mentorship request status'
          },
          sessionType: {
            type: 'string',
            enum: ['one-time', 'ongoing', 'project-based'],
            description: 'Type of mentorship session'
          },
          preferredSchedule: {
            type: 'object',
            properties: {
              timeSlots: {
                type: 'array',
                items: { type: 'string' }
              },
              duration: { type: 'string' },
              frequency: { type: 'string' }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'User password'
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            description: 'Full name'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'Password (minimum 6 characters)'
          },
          role: {
            type: 'string',
            enum: ['job-seeker', 'employer', 'mentor'],
            description: 'User role (admin roles are assigned separately)'
          }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean'
          },
          message: {
            type: 'string'
          },
          token: {
            type: 'string',
            description: 'JWT access token'
          },
          refreshToken: {
            type: 'string',
            description: 'JWT refresh token'
          },
          user: {
            $ref: '#/components/schemas/User'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            description: 'Error message'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' }
              }
            },
            description: 'Validation errors (if any)'
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            description: 'Success message'
          },
          data: {
            type: 'object',
            description: 'Response data'
          }
        }
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          count: {
            type: 'number',
            description: 'Number of items in current page'
          },
          total: {
            type: 'number',
            description: 'Total number of items'
          },
          pages: {
            type: 'number',
            description: 'Total number of pages'
          },
          currentPage: {
            type: 'number',
            description: 'Current page number'
          },
          data: {
            type: 'array',
            items: {
              type: 'object'
            },
            description: 'Array of data items'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints'
    },
    {
      name: 'Users',
      description: 'User management and profile operations'
    },
    {
      name: 'Jobs',
      description: 'Job posting and management operations'
    },
    {
      name: 'Applications',
      description: 'Job application management'
    },
    {
      name: 'Mentorship',
      description: 'Mentorship program management'
    },
    {
      name: 'Skills',
      description: 'Skills verification and management'
    },
    {
      name: 'Messages',
      description: 'Real-time messaging system'
    },
    {
      name: 'Notifications',
      description: 'Notification management'
    },
    {
      name: 'Admin',
      description: 'Administrative operations'
    },
    {
      name: 'RTB',
      description: 'RTB graduate tracking and analytics'
    },
    {
      name: 'Analytics',
      description: 'Platform analytics and reporting'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './routes/*.js', // Path to the API route files
    './models/*.js', // Path to model files (for additional schema definitions)
    './app.js'       // Main app file
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
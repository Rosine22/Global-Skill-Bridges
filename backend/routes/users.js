const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { RTBGraduate } = require('../models/Skill');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const router = express.Router();

// All user routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// @access  Private
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('skills.skill', 'name category level')
      .populate('experience.company', 'name industry location')
      .select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john@example.com"
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *                 example: "+1234567890"
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: "New York"
 *                   country:
 *                     type: string
 *                     example: "USA"
 *               bio:
 *                 type: string
 *                 description: User's biography/description
 *                 example: "Experienced software developer"
 *               linkedinProfile:
 *                 type: string
 *                 description: LinkedIn profile URL
 *                 example: "https://linkedin.com/in/johndoe"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Validation errors
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('location.city').optional().trim(),
  body('location.country').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if email is already taken (if changing email)
    if (req.body.email && req.body.email !== req.user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered'
        });
      }
    }

    // Fields that can be updated
    const allowedUpdates = [
      'name', 'email', 'phone', 'location', 'bio', 'avatar',
      'socialProfiles', 'preferences', 'experience', 'education',
      'certifications', 'languages', 'availability'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).populate('skills.skill', 'name category level').select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put('/password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/search
// @desc    Search for users
// @access  Private
router.get('/search', async (req, res, next) => {
  try {
    const { q, role, location, skills, page = 1, limit = 20 } = req.query;

    const query = {};
    
    // Text search
    if (q) {
      query.$or = [
        { name: new RegExp(q, 'i') },
        { 'bio': new RegExp(q, 'i') },
        { 'experience.position': new RegExp(q, 'i') },
        { 'experience.company.name': new RegExp(q, 'i') }
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by location
    if (location) {
      query.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') }
      ];
    }

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query['skills.skill'] = { $in: skillsArray };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .populate('skills.skill', 'name category')
      .select('name email avatar role location bio experience isOnline lastSeen')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ lastSeen: -1, createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('skills.skill', 'name category level')
      .select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/skills
// @desc    Add skill to user profile
// @access  Private
router.post('/skills', [
  body('skillId').isMongoId().withMessage('Valid skill ID is required'),
  body('proficiencyLevel').isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Valid proficiency level is required'),
  body('yearsOfExperience').optional().isNumeric().withMessage('Years of experience must be a number')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { skillId, proficiencyLevel, yearsOfExperience, endorsements } = req.body;

    // Check if skill already exists in user's profile
    const existingSkillIndex = req.user.skills.findIndex(
      s => s.skill.toString() === skillId
    );

    if (existingSkillIndex !== -1) {
      // Update existing skill
      req.user.skills[existingSkillIndex].proficiencyLevel = proficiencyLevel;
      req.user.skills[existingSkillIndex].yearsOfExperience = yearsOfExperience;
      if (endorsements) {
        req.user.skills[existingSkillIndex].endorsements = endorsements;
      }
      req.user.skills[existingSkillIndex].lastUpdated = new Date();
    } else {
      // Add new skill
      req.user.skills.push({
        skill: skillId,
        proficiencyLevel,
        yearsOfExperience,
        endorsements: endorsements || [],
        addedAt: new Date()
      });
    }

    await req.user.save();

    const updatedUser = await User.findById(req.user._id)
      .populate('skills.skill', 'name category level')
      .select('-password');

    res.status(200).json({
      success: true,
      message: existingSkillIndex !== -1 ? 'Skill updated successfully' : 'Skill added successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/skills/:skillId
// @desc    Remove skill from user profile
// @access  Private
router.delete('/skills/:skillId', async (req, res, next) => {
  try {
    const { skillId } = req.params;

    // Remove skill from user's profile
    req.user.skills = req.user.skills.filter(
      s => s.skill.toString() !== skillId
    );

    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Skill removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/experience
// @desc    Add work experience
// @access  Private
router.post('/experience', [
  body('position').notEmpty().trim().withMessage('Position is required'),
  body('company').notEmpty().trim().withMessage('Company is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('isCurrent').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const experienceData = {
      ...req.body,
      addedAt: new Date()
    };

    req.user.experience.push(experienceData);
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Experience added successfully',
      data: req.user.experience
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/experience/:experienceId
// @desc    Update work experience
// @access  Private
router.put('/experience/:experienceId', async (req, res, next) => {
  try {
    const { experienceId } = req.params;

    const experienceIndex = req.user.experience.findIndex(
      exp => exp._id.toString() === experienceId
    );

    if (experienceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    // Update experience fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        req.user.experience[experienceIndex][key] = req.body[key];
      }
    });

    req.user.experience[experienceIndex].lastUpdated = new Date();
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Experience updated successfully',
      data: req.user.experience[experienceIndex]
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/experience/:experienceId
// @desc    Delete work experience
// @access  Private
router.delete('/experience/:experienceId', async (req, res, next) => {
  try {
    const { experienceId } = req.params;

    req.user.experience = req.user.experience.filter(
      exp => exp._id.toString() !== experienceId
    );

    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/dashboard-stats
// @desc    Get dashboard statistics for current user
// @access  Private
router.get('/dashboard-stats', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {
      user: {
        name: req.user.name,
        role: userRole,
        avatar: req.user.avatar
      }
    };

    switch (userRole) {
      case 'job-seeker':
        // Job seeker stats
        const applications = await Application.find({ applicant: userId });
        const savedJobs = await Job.find({ 'savedBy': userId }).countDocuments();
        
        stats.jobSeeker = {
          totalApplications: applications.length,
          pendingApplications: applications.filter(app => app.status === 'submitted').length,
          interviewsScheduled: applications.filter(app => app.status === 'interview-scheduled').length,
          offersReceived: applications.filter(app => app.status === 'offer-extended').length,
          savedJobs,
          profileCompletion: calculateProfileCompletion(req.user)
        };
        break;

      case 'employer':
        // Employer stats
        const companyJobs = await Job.find({ 'company': req.user.company });
        const jobIds = companyJobs.map(job => job._id);
        const receivedApplications = await Application.find({ job: { $in: jobIds } });
        
        stats.employer = {
          activeJobs: companyJobs.filter(job => job.status === 'active').length,
          totalJobs: companyJobs.length,
          applicationsReceived: receivedApplications.length,
          newApplications: receivedApplications.filter(app => app.status === 'submitted').length,
          interviewsScheduled: receivedApplications.filter(app => app.status === 'interview-scheduled').length,
          hiredCandidates: receivedApplications.filter(app => app.status === 'hired').length
        };
        break;

      case 'mentor':
        // Mentor stats
        const MentorshipRequest = require('../models/MentorshipRequest');
        const mentorshipRequests = await MentorshipRequest.find({ mentor: userId });
        
        stats.mentor = {
          totalMentees: mentorshipRequests.filter(req => req.status === 'accepted').length,
          pendingRequests: mentorshipRequests.filter(req => req.status === 'pending').length,
          completedSessions: mentorshipRequests.reduce((sum, req) => 
            sum + (req.sessions ? req.sessions.filter(s => s.status === 'completed').length : 0), 0
          ),
          upcomingSessions: mentorshipRequests.reduce((sum, req) => 
            sum + (req.sessions ? req.sessions.filter(s => s.status === 'scheduled').length : 0), 0
          )
        };
        break;

      case 'admin':
        // Admin stats
        const totalUsers = await User.countDocuments();
        const totalJobs = await Job.countDocuments();
        const totalApplications = await Application.countDocuments();
        const activeUsers = await User.countDocuments({ 
          lastSeen: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
        
        stats.admin = {
          totalUsers,
          activeUsers,
          totalJobs,
          activeJobs: await Job.countDocuments({ status: 'active' }),
          totalApplications,
          pendingVerifications: await require('../models/Skill').SkillVerification.countDocuments({ 
            verificationStatus: 'pending' 
          })
        };
        break;

      case 'rtb-admin':
        // RTB Admin stats
        const currentYear = new Date().getFullYear();
        const graduates = await RTBGraduate.find({ graduationYear: currentYear });
        
        stats.rtbAdmin = {
          totalGraduates: graduates.length,
          employedGraduates: graduates.filter(g => g.employmentStatus === 'employed').length,
          seekingEmployment: graduates.filter(g => g.employmentStatus === 'seeking').length,
          internationalPlacements: graduates.filter(g => 
            g.employmentHistory?.some(emp => emp.isInternational && emp.isCurrent)
          ).length,
          employmentRate: graduates.length > 0 
            ? ((graduates.filter(g => g.employmentStatus === 'employed').length / graduates.length) * 100).toFixed(1)
            : 0
        };
        break;
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to calculate profile completion
function calculateProfileCompletion(user) {
  const fields = [
    'name', 'email', 'phone', 'location', 'bio', 'avatar',
    'skills', 'experience', 'education'
  ];

  let completedFields = 0;
  fields.forEach(field => {
    if (user[field]) {
      if (Array.isArray(user[field])) {
        if (user[field].length > 0) completedFields++;
      } else if (typeof user[field] === 'object' && user[field] !== null) {
        if (Object.keys(user[field]).length > 0) completedFields++;
      } else {
        completedFields++;
      }
    }
  });

  return Math.round((completedFields / fields.length) * 100);
}

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', async (req, res, next) => {
  try {
    const allowedPreferences = [
      'emailNotifications', 'pushNotifications', 'jobAlerts',
      'mentorshipAlerts', 'profileVisibility', 'language',
      'timezone', 'currency'
    ];

    const preferences = {};
    allowedPreferences.forEach(pref => {
      if (req.body[pref] !== undefined) {
        preferences[pref] = req.body[pref];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select('preferences');

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedUser.preferences
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/recommendations
// @desc    Get user recommendations (jobs, mentors, connections)
// @access  Private
router.get('/recommendations', async (req, res, next) => {
  try {
    const { type = 'all' } = req.query; // all, jobs, mentors, connections

    const recommendations = {};

    if (type === 'all' || type === 'jobs') {
      // Job recommendations based on skills and preferences
      const userSkills = req.user.skills.map(s => s.skill);
      const jobRecommendations = await Job.find({
        status: 'active',
        'requirements.skills': { $in: userSkills },
        'company': { $ne: req.user.company } // Exclude own company jobs
      })
      .populate('company', 'name logo location')
      .limit(10)
      .sort({ createdAt: -1 });

      recommendations.jobs = jobRecommendations;
    }

    if (type === 'all' || type === 'mentors') {
      // Mentor recommendations based on career interests
      const mentorRecommendations = await User.find({
        role: 'mentor',
        'mentorProfile.isAvailable': true,
        'skills.skill': { $in: req.user.skills.map(s => s.skill) }
      })
      .select('name avatar bio mentorProfile experience skills')
      .populate('skills.skill', 'name category')
      .limit(10);

      recommendations.mentors = mentorRecommendations;
    }

    if (type === 'all' || type === 'connections') {
      // Connection recommendations based on common interests/skills
      const connectionRecommendations = await User.find({
        _id: { $ne: req.user._id },
        role: { $in: ['job-seeker', 'mentor', 'employer'] },
        'skills.skill': { $in: req.user.skills.map(s => s.skill) }
      })
      .select('name avatar bio location role skills')
      .populate('skills.skill', 'name category')
      .limit(10);

      recommendations.connections = connectionRecommendations;
    }

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
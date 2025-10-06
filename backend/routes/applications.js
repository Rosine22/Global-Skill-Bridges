const express = require("express");
const { body, validationResult } = require("express-validator");
const Application = require("../models/Application");
const Job = require("../models/Job");
const { Notification } = require("../models/Message");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job application management
 */

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get applications for current user
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of applications per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, under-review, interview-scheduled, hired, rejected]
 *         description: Filter by application status
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 */

// @route   GET /api/applications
// @desc    Get applications (for current user based on role)
// @access  Private
router.get("/", protect, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let filter = {};
    let populateFields = "";

    // Filter based on user role
    if (req.user.role === "job-seeker") {
      filter.applicant = req.user._id;
      populateFields = "job employer";
    } else if (req.user.role === "employer") {
      filter.employer = req.user._id;
      populateFields = "job applicant";
    } else if (req.user.role === "admin") {
      // Admin can see all applications
      populateFields = "job applicant employer";
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view applications",
      });
    }

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Job filter (for employers viewing specific job applications)
    if (req.query.jobId) {
      filter.job = req.query.jobId;
    }

    const applications = await Application.find(filter)
      .populate(populateFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(filter);

    // Get status statistics
    const statusStats = await Application.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: applications,
      statusStats,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application by ID
// @access  Private (Applicant, Employer, or Admin)
router.get("/:id", protect, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("job")
      .populate("applicant", "-password")
      .populate("employer", "-password")
      .populate("interviews.interviewer")
      .populate("internalNotes.addedBy", "name");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check authorization
    const isApplicant =
      application.applicant._id.toString() === req.user._id.toString();
    const isEmployer =
      application.employer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isApplicant && !isEmployer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this application",
      });
    }

    // Hide internal notes from applicants
    if (isApplicant && !isAdmin) {
      application.internalNotes = [];
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Employer or Admin)
router.put(
  "/:id/status",
  protect,
  authorize("employer", "admin"),
  [
    body("status")
      .isIn([
        "submitted",
        "under-review",
        "shortlisted",
        "interview-scheduled",
        "interview-completed",
        "second-interview",
        "reference-check",
        "offer-made",
        "offer-accepted",
        "offer-declined",
        "hired",
        "rejected",
      ])
      .withMessage("Invalid status"),
    body("note")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Note cannot exceed 1000 characters"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const application = await Application.findById(req.params.id)
        .populate("job")
        .populate("applicant")
        .populate("employer");

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      // Check authorization (employer must own the job or be admin)
      const isJobOwner =
        application.employer._id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isJobOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this application",
        });
      }

      const { status, note } = req.body;
      const oldStatus = application.status;

      try {
        // Update status using the model method for validation
        await application.updateStatus(status, req.user._id);

        // Add note if provided
        if (note) {
          application.internalNotes.push({
            note,
            addedBy: req.user._id,
            addedAt: new Date(),
          });
          await application.save();
        }

        // Send notification to applicant
        const statusMessages = {
          "under-review": "Your application is now under review",
          shortlisted: "Congratulations! You have been shortlisted",
          "interview-scheduled":
            "An interview has been scheduled for your application",
          "interview-completed": "Thank you for completing the interview",
          "second-interview": "You have been invited for a second interview",
          "reference-check": "We are conducting reference checks",
          "offer-made": "Congratulations! You have received a job offer",
          hired: "Congratulations! You have been hired",
          rejected:
            "Thank you for your interest. Unfortunately, we will not be moving forward",
        };

        if (statusMessages[status]) {
          await Notification.createNotification({
            user: application.applicant._id,
            title: "Application Status Update",
            message: `${statusMessages[status]} for the position "${application.job.title}" at ${application.job.company}`,
            type: "application-status",
            relatedApplication: application._id,
            relatedJob: application.job._id,
            actionUrl: `/applications/${application._id}`,
            priority: ["offer-made", "hired", "interview-scheduled"].includes(
              status
            )
              ? "high"
              : "medium",
          });
        }

        res.status(200).json({
          success: true,
          message: `Application status updated from ${oldStatus} to ${status}`,
          data: application,
        });
      } catch (statusError) {
        return res.status(400).json({
          success: false,
          message: statusError.message,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/applications/:id/interview
// @desc    Schedule an interview
// @access  Private (Employer or Admin)
router.post(
  "/:id/interview",
  protect,
  authorize("employer", "admin"),
  [
    body("type")
      .isIn(["phone", "video", "in-person", "technical", "panel"])
      .withMessage("Invalid interview type"),
    body("scheduledDate").isISO8601().withMessage("Valid date is required"),
    body("duration")
      .isInt({ min: 15, max: 480 })
      .withMessage("Duration must be between 15 and 480 minutes"),
    body("interviewer.name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Interviewer name is required"),
    body("interviewer.email")
      .isEmail()
      .withMessage("Valid interviewer email is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const application = await Application.findById(req.params.id)
        .populate("job")
        .populate("applicant")
        .populate("employer");

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      // Check authorization
      const isJobOwner =
        application.employer._id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isJobOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to schedule interviews for this application",
        });
      }

      // Add interview to application
      const interviewData = {
        type: req.body.type,
        scheduledDate: new Date(req.body.scheduledDate),
        duration: req.body.duration,
        location: req.body.location,
        meetingLink: req.body.meetingLink,
        interviewer: req.body.interviewer,
        status: "scheduled",
      };

      application.interviews.push(interviewData);

      // Update application status if not already at interview stage
      if (
        ![
          "interview-scheduled",
          "interview-completed",
          "second-interview",
        ].includes(application.status)
      ) {
        application.status = "interview-scheduled";
      }

      await application.save();

      // Send notification to applicant
      await Notification.createNotification({
        user: application.applicant._id,
        title: "Interview Scheduled",
        message: `An interview has been scheduled for your application to "${application.job.title}" at ${application.job.company}`,
        type: "interview-scheduled",
        relatedApplication: application._id,
        relatedJob: application.job._id,
        actionUrl: `/applications/${application._id}`,
        priority: "high",
      });

      res.status(200).json({
        success: true,
        message: "Interview scheduled successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/applications/:id/interview/:interviewId
// @desc    Update interview details or status
// @access  Private (Employer or Admin)
router.put(
  "/:id/interview/:interviewId",
  protect,
  authorize("employer", "admin"),
  async (req, res, next) => {
    try {
      const application = await Application.findById(req.params.id)
        .populate("applicant")
        .populate("job");

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      // Check authorization
      const isJobOwner =
        application.employer.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isJobOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update interviews for this application",
        });
      }

      // Find the interview
      const interview = application.interviews.id(req.params.interviewId);
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: "Interview not found",
        });
      }

      // Update interview fields
      const allowedUpdates = [
        "scheduledDate",
        "actualDate",
        "duration",
        "location",
        "meetingLink",
        "status",
        "feedback",
        "rating",
        "notes",
      ];

      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          interview[field] = req.body[field];
        }
      });

      // If interview is completed, update application status
      if (
        req.body.status === "completed" &&
        application.status === "interview-scheduled"
      ) {
        application.status = "interview-completed";
      }

      await application.save();

      res.status(200).json({
        success: true,
        message: "Interview updated successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/applications/:id/feedback
// @desc    Add employer feedback to application
// @access  Private (Employer or Admin)
router.post(
  "/:id/feedback",
  protect,
  authorize("employer", "admin"),
  [
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comments")
      .optional()
      .isLength({ max: 2000 })
      .withMessage("Comments cannot exceed 2000 characters"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      // Check authorization
      const isJobOwner =
        application.employer.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isJobOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to provide feedback for this application",
        });
      }

      // Update feedback
      application.employerFeedback = {
        rating: req.body.rating,
        comments: req.body.comments,
        strengths: req.body.strengths || [],
        areasForImprovement: req.body.areasForImprovement || [],
        overallImpression: req.body.overallImpression,
      };

      await application.save();

      res.status(200).json({
        success: true,
        message: "Feedback added successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/applications/:id/withdraw
// @desc    Withdraw application (by applicant)
// @access  Private (Job seeker only)
router.put(
  "/:id/withdraw",
  protect,
  authorize("job-seeker"),
  [
    body("reason")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Reason cannot exceed 500 characters"),
  ],
  async (req, res, next) => {
    try {
      const application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      // Check if user owns this application
      if (application.applicant.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to withdraw this application",
        });
      }

      // Check if application can be withdrawn
      if (
        ["hired", "offer-accepted", "withdrawn"].includes(application.status)
      ) {
        return res.status(400).json({
          success: false,
          message: "This application cannot be withdrawn",
        });
      }

      // Update application
      application.status = "withdrawn";
      application.withdrawnBy = req.user._id;
      application.withdrawalReason = req.body.reason;
      application.withdrawnAt = new Date();

      await application.save();

      res.status(200).json({
        success: true,
        message: "Application withdrawn successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/applications/stats
// @desc    Get application statistics for current user
// @access  Private
router.get("/stats", protect, async (req, res, next) => {
  try {
    let stats = {};

    if (req.user.role === "job-seeker") {
      // Job seeker stats
      const applicantStats = await Application.aggregate([
        { $match: { applicant: req.user._id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const totalApplications = await Application.countDocuments({
        applicant: req.user._id,
      });
      const successfulApplications = await Application.countDocuments({
        applicant: req.user._id,
        status: { $in: ["hired", "offer-accepted"] },
      });

      stats = {
        totalApplications,
        successRate:
          totalApplications > 0
            ? ((successfulApplications / totalApplications) * 100).toFixed(1)
            : 0,
        statusBreakdown: applicantStats,
        recentApplications: await Application.find({ applicant: req.user._id })
          .populate("job", "title company")
          .sort({ createdAt: -1 })
          .limit(5),
      };
    } else if (req.user.role === "employer") {
      // Employer stats
      const employerStats = await Application.getApplicationStats(
        req.user._id,
        30
      );

      const totalApplications = await Application.countDocuments({
        employer: req.user._id,
      });
      const totalJobs = await Job.countDocuments({ employer: req.user._id });

      stats = {
        totalApplications,
        totalJobs,
        averageApplicationsPerJob:
          totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0,
        statusBreakdown: employerStats,
        topJobs: await Application.aggregate([
          { $match: { employer: req.user._id } },
          {
            $group: {
              _id: "$job",
              applicationCount: { $sum: 1 },
            },
          },
          { $sort: { applicationCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "jobs",
              localField: "_id",
              foreignField: "_id",
              as: "jobDetails",
            },
          },
        ]),
      };
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

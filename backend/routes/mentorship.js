const express = require("express");
const { body, validationResult } = require("express-validator");
const MentorshipRequest = require("../models/MentorshipRequest");
const User = require("../models/User");
const { Notification } = require("../models/Message");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/mentorship
// @desc    Get mentorship requests (filtered by user role)
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
      filter.mentee = req.user._id;
      populateFields = "mentor";
    } else if (req.user.role === "mentor") {
      filter.mentor = req.user._id;
      populateFields = "mentee";
    } else if (req.user.role === "admin" || req.user.role === "rtb-admin") {
      populateFields = "mentor mentee";
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view mentorship requests",
      });
    }

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Field filter
    if (req.query.field) {
      filter.field = req.query.field;
    }

    const mentorshipRequests = await MentorshipRequest.find(filter)
      .populate(populateFields, "name avatar mentorInfo location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MentorshipRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: mentorshipRequests.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: mentorshipRequests,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/mentorship/request
// @desc    Create a mentorship request
// @access  Private (Job seekers only)
router.post(
  "/request",
  protect,
  authorize("job-seeker"),
  [
    body("mentorId").isMongoId().withMessage("Valid mentor ID is required"),
    body("field")
      .isIn([
        "software-development",
        "electrical-engineering",
        "mechanical-engineering",
        "civil-engineering",
        "automotive-technology",
        "construction",
        "healthcare",
        "hospitality",
        "agriculture",
        "manufacturing",
        "career-guidance",
        "interview-preparation",
        "skill-development",
        "other",
      ])
      .withMessage("Invalid mentorship field"),
    body("message")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Message must be between 10 and 1000 characters"),
    body("timeCommitment")
      .optional()
      .isIn([
        "1-2-hours-week",
        "3-5-hours-week",
        "5-10-hours-week",
        "flexible",
      ]),
    body("duration")
      .optional()
      .isIn(["1-month", "3-months", "6-months", "1-year", "ongoing"]),
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

      const {
        mentorId,
        field,
        message,
        goals,
        timeCommitment,
        duration,
        preferredMeetingType,
      } = req.body;

      // Verify mentor exists and has mentor role
      const mentor = await User.findById(mentorId);
      if (!mentor || mentor.role !== "mentor") {
        return res.status(404).json({
          success: false,
          message: "Mentor not found",
        });
      }

      // Check if there's already a pending/active mentorship between these users
      const existingMentorship = await MentorshipRequest.findOne({
        mentor: mentorId,
        mentee: req.user._id,
        status: { $in: ["pending", "accepted", "active"] },
      });

      if (existingMentorship) {
        return res.status(400).json({
          success: false,
          message:
            "You already have a pending or active mentorship with this mentor",
        });
      }

      // Check mentor capacity
      const activeMentorships = await MentorshipRequest.countDocuments({
        mentor: mentorId,
        status: "active",
      });

      const mentorCapacity = mentor.mentorInfo?.menteeCapacity || 5;
      if (activeMentorships >= mentorCapacity) {
        return res.status(400).json({
          success: false,
          message: "This mentor has reached their mentee capacity",
        });
      }

      // Create mentorship request
      const mentorshipRequest = await MentorshipRequest.create({
        mentor: mentorId,
        mentee: req.user._id,
        field,
        message,
        goals: goals || [],
        timeCommitment: timeCommitment || "flexible",
        duration: duration || "3-months",
        preferredMeetingType: preferredMeetingType || "video-call",
      });

      // Send notification to mentor
      await Notification.createNotification({
        user: mentorId,
        title: "New Mentorship Request",
        message: `${req.user.name} has requested mentorship in ${field}`,
        type: "mentorship-request",
        relatedMentorship: mentorshipRequest._id,
        relatedUser: req.user._id,
        actionUrl: `/mentorship/${mentorshipRequest._id}`,
        priority: "medium",
      });

      const populatedRequest = await MentorshipRequest.findById(
        mentorshipRequest._id
      )
        .populate("mentor", "name avatar mentorInfo")
        .populate("mentee", "name avatar");

      res.status(201).json({
        success: true,
        message: "Mentorship request sent successfully",
        data: populatedRequest,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/mentorship/:id/respond
// @desc    Respond to a mentorship request (accept/decline)
// @access  Private (Mentors only)
router.put(
  "/:id/respond",
  protect,
  authorize("mentor"),
  [
    body("action")
      .isIn(["accept", "decline"])
      .withMessage("Action must be accept or decline"),
    body("message")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Message cannot exceed 500 characters"),
    body("declineReason")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Decline reason cannot exceed 200 characters"),
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

      const mentorshipRequest = await MentorshipRequest.findById(
        req.params.id
      ).populate("mentee", "name avatar");

      if (!mentorshipRequest) {
        return res.status(404).json({
          success: false,
          message: "Mentorship request not found",
        });
      }

      // Check if user is the mentor for this request
      if (mentorshipRequest.mentor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to respond to this mentorship request",
        });
      }

      // Check if request is still pending
      if (mentorshipRequest.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "This mentorship request has already been responded to",
        });
      }

      const { action, message, declineReason } = req.body;

      if (action === "accept") {
        await mentorshipRequest.acceptRequest({ message });

        // Send notification to mentee
        await Notification.createNotification({
          user: mentorshipRequest.mentee._id,
          title: "Mentorship Request Accepted",
          message: `${req.user.name} has accepted your mentorship request`,
          type: "mentorship-accepted",
          relatedMentorship: mentorshipRequest._id,
          relatedUser: req.user._id,
          actionUrl: `/mentorship/${mentorshipRequest._id}`,
          priority: "high",
        });
      } else {
        await mentorshipRequest.declineRequest(declineReason, message);

        // Send notification to mentee
        await Notification.createNotification({
          user: mentorshipRequest.mentee._id,
          title: "Mentorship Request Declined",
          message: `${req.user.name} has declined your mentorship request`,
          type: "mentorship-request",
          relatedMentorship: mentorshipRequest._id,
          relatedUser: req.user._id,
          actionUrl: `/mentorship/${mentorshipRequest._id}`,
          priority: "medium",
        });
      }

      res.status(200).json({
        success: true,
        message: `Mentorship request ${action}ed successfully`,
        data: mentorshipRequest,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/mentorship/:id/start
// @desc    Start mentorship (create plan)
// @access  Private (Mentor only)
router.post(
  "/:id/start",
  protect,
  authorize("mentor"),
  [
    body("objectives")
      .isArray({ min: 1 })
      .withMessage("At least one objective is required"),
    body("milestones").optional().isArray(),
    body("meetingSchedule.frequency")
      .optional()
      .isIn(["weekly", "bi-weekly", "monthly", "as-needed"]),
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

      const mentorshipRequest = await MentorshipRequest.findById(req.params.id);

      if (!mentorshipRequest) {
        return res.status(404).json({
          success: false,
          message: "Mentorship request not found",
        });
      }

      // Check authorization
      if (mentorshipRequest.mentor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to start this mentorship",
        });
      }

      const { objectives, milestones, meetingSchedule } = req.body;

      const plan = {
        objectives,
        milestones: milestones || [],
        meetingSchedule: meetingSchedule || {},
      };

      await mentorshipRequest.startMentorship(plan);

      res.status(200).json({
        success: true,
        message: "Mentorship started successfully",
        data: mentorshipRequest,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/mentorship/:id/session
// @desc    Schedule a mentorship session
// @access  Private (Mentor or Mentee)
router.post(
  "/:id/session",
  protect,
  [
    body("scheduledDate").isISO8601().withMessage("Valid date is required"),
    body("duration")
      .isInt({ min: 15, max: 180 })
      .withMessage("Duration must be between 15 and 180 minutes"),
    body("type")
      .optional()
      .isIn(["video-call", "phone-call", "in-person", "messaging"]),
    body("topics").optional().isArray(),
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

      const mentorshipRequest = await MentorshipRequest.findById(req.params.id)
        .populate("mentor", "name")
        .populate("mentee", "name");

      if (!mentorshipRequest) {
        return res.status(404).json({
          success: false,
          message: "Mentorship not found",
        });
      }

      // Check if user is part of this mentorship
      const isMentor =
        mentorshipRequest.mentor._id.toString() === req.user._id.toString();
      const isMentee =
        mentorshipRequest.mentee._id.toString() === req.user._id.toString();

      if (!isMentor && !isMentee) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to schedule sessions for this mentorship",
        });
      }

      if (mentorshipRequest.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Mentorship must be active to schedule sessions",
        });
      }

      const sessionData = {
        scheduledDate: new Date(req.body.scheduledDate),
        duration: req.body.duration,
        type: req.body.type || "video-call",
        topics: req.body.topics || [],
        meetingLink: req.body.meetingLink,
        status: "scheduled",
      };

      await mentorshipRequest.addSession(sessionData);

      // Send notification to the other participant
      const recipientId = isMentor
        ? mentorshipRequest.mentee._id
        : mentorshipRequest.mentor._id;
      const senderName = req.user.name;

      await Notification.createNotification({
        user: recipientId,
        title: "Mentorship Session Scheduled",
        message: `${senderName} has scheduled a mentorship session`,
        type: "session-reminder",
        relatedMentorship: mentorshipRequest._id,
        relatedUser: req.user._id,
        actionUrl: `/mentorship/${mentorshipRequest._id}`,
        priority: "medium",
      });

      res.status(200).json({
        success: true,
        message: "Session scheduled successfully",
        data: mentorshipRequest,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/mentorship/mentors
// @desc    Get available mentors with filtering
// @access  Private (Job seekers)
router.get(
  "/mentors",
  protect,
  authorize("job-seeker"),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {
        role: "mentor",
        isActive: true,
        isBlocked: false,
      };

      if (req.query.specialization) {
        filter["mentorInfo.specializations"] = {
          $in: [req.query.specialization],
        };
      }

      if (req.query.location) {
        filter["location.country"] = new RegExp(req.query.location, "i");
      }

      if (req.query.experience) {
        filter["mentorInfo.yearsOfExperience"] = {
          $gte: parseInt(req.query.experience),
        };
      }

      // Search by name or skills
      if (req.query.search) {
        filter.$or = [
          { name: new RegExp(req.query.search, "i") },
          { "skills.name": new RegExp(req.query.search, "i") },
          { "mentorInfo.specializations": new RegExp(req.query.search, "i") },
        ];
      }

      const mentors = await User.find(filter)
        .select("name avatar mentorInfo location skills stats")
        .sort({ "stats.mentoringSessions": -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Get active mentee count for each mentor
      const mentorsWithStats = await Promise.all(
        mentors.map(async (mentor) => {
          const activeMenteeCount = await MentorshipRequest.countDocuments({
            mentor: mentor._id,
            status: "active",
          });

          return {
            ...mentor.toObject(),
            activeMenteeCount,
            availableSlots:
              (mentor.mentorInfo?.menteeCapacity || 5) - activeMenteeCount,
          };
        })
      );

      const total = await User.countDocuments(filter);

      res.status(200).json({
        success: true,
        count: mentorsWithStats.length,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        data: mentorsWithStats,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/mentorship/:id
// @desc    Get single mentorship request details
// @access  Private (Mentor, Mentee, or Admin)
router.get("/:id", protect, async (req, res, next) => {
  try {
    const mentorshipRequest = await MentorshipRequest.findById(req.params.id)
      .populate("mentor", "name avatar mentorInfo location skills")
      .populate("mentee", "name avatar location skills education experience");

    if (!mentorshipRequest) {
      return res.status(404).json({
        success: false,
        message: "Mentorship not found",
      });
    }

    // Check authorization
    const isMentor =
      mentorshipRequest.mentor._id.toString() === req.user._id.toString();
    const isMentee =
      mentorshipRequest.mentee._id.toString() === req.user._id.toString();
    const isAdmin = ["admin", "rtb-admin"].includes(req.user.role);

    if (!isMentor && !isMentee && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this mentorship",
      });
    }

    res.status(200).json({
      success: true,
      data: mentorshipRequest,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/mentorship/:id/complete
// @desc    Complete mentorship
// @access  Private (Mentor or Mentee)
router.put(
  "/:id/complete",
  protect,
  [
    body("completionReason").isIn([
      "goals-achieved",
      "mutual-agreement",
      "time-expired",
      "mentee-request",
      "mentor-request",
    ]),
    body("completionNote")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Completion note cannot exceed 500 characters"),
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

      const mentorshipRequest = await MentorshipRequest.findById(req.params.id)
        .populate("mentor", "name")
        .populate("mentee", "name");

      if (!mentorshipRequest) {
        return res.status(404).json({
          success: false,
          message: "Mentorship not found",
        });
      }

      // Check authorization
      const isMentor =
        mentorshipRequest.mentor._id.toString() === req.user._id.toString();
      const isMentee =
        mentorshipRequest.mentee._id.toString() === req.user._id.toString();

      if (!isMentor && !isMentee) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to complete this mentorship",
        });
      }

      const completionData = {
        completedBy: req.user._id,
        completionReason: req.body.completionReason,
        completionNote: req.body.completionNote,
      };

      await mentorshipRequest.completeMentorship(completionData);

      // Update mentor stats
      const mentor = await User.findById(mentorshipRequest.mentor._id);
      mentor.stats.mentoringSessions =
        (mentor.stats.mentoringSessions || 0) +
        mentorshipRequest.completedSessions;
      await mentor.save();

      res.status(200).json({
        success: true,
        message: "Mentorship completed successfully",
        data: mentorshipRequest,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

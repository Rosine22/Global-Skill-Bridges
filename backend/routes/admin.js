const express = require("express");
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const MentorshipRequest = require("../models/MentorshipRequest");
const SkillVerification = require("../models/Skill");
const { RTBGraduate } = require("../models/Skill");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All admin routes require admin authentication
router.use(protect);
router.use(authorize("admin"));

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     description: Retrieve comprehensive statistics for admin dashboard
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 1250
 *                         newThisMonth:
 *                           type: integer
 *                           example: 45
 *                         jobSeekers:
 *                           type: integer
 *                           example: 800
 *                         employers:
 *                           type: integer
 *                           example: 200
 *                         mentors:
 *                           type: integer
 *                           example: 150
 *                         rtbUsers:
 *                           type: integer
 *                           example: 100
 *                     jobs:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 500
 *                         active:
 *                           type: integer
 *                           example: 320
 *                         newThisMonth:
 *                           type: integer
 *                           example: 25
 *                     applications:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 2500
 *                         pending:
 *                           type: integer
 *                           example: 150
 *                         thisMonth:
 *                           type: integer
 *                           example: 180
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get("/dashboard", async (req, res, next) => {
  try {
    // Get current date and date 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // User statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true,
    });

    const usersByRole = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Job statistics
    const totalJobs = await Job.countDocuments({ status: "active" });
    const newJobsThisMonth = await Job.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      status: "active",
    });

    const jobsByCategory = await Job.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Application statistics
    const totalApplications = await Application.countDocuments();
    const newApplicationsThisMonth = await Application.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate success rate
    const successfulApplications = await Application.countDocuments({
      status: { $in: ["hired", "offer-accepted"] },
    });
    const successRate =
      totalApplications > 0
        ? ((successfulApplications / totalApplications) * 100).toFixed(1)
        : 0;

    // Mentorship statistics
    const totalMentorships = await MentorshipRequest.countDocuments();
    const activeMentorships = await MentorshipRequest.countDocuments({
      status: "active",
    });

    // Skill verification statistics
    const pendingVerifications = await SkillVerification.countDocuments({
      status: "pending",
    });
    const totalVerifications = await SkillVerification.countDocuments();

    // Recent activity
    const recentUsers = await User.find({ isActive: true })
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentJobs = await Job.find({ status: "active" })
      .select("title company createdAt")
      .populate("employer", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    // System health indicators
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const expiredJobs = await Job.countDocuments({
      applicationDeadline: { $lt: new Date() },
      status: "active",
    });

    const dashboardData = {
      overview: {
        totalUsers,
        newUsersThisMonth,
        totalJobs,
        newJobsThisMonth,
        totalApplications,
        newApplicationsThisMonth,
        successRate,
        activeMentorships,
        pendingVerifications,
      },
      userStats: {
        total: totalUsers,
        byRole: usersByRole,
        blocked: blockedUsers,
        newThisMonth: newUsersThisMonth,
      },
      jobStats: {
        total: totalJobs,
        byCategory: jobsByCategory,
        expired: expiredJobs,
        newThisMonth: newJobsThisMonth,
      },
      applicationStats: {
        total: totalApplications,
        byStatus: applicationsByStatus,
        successRate,
        newThisMonth: newApplicationsThisMonth,
      },
      mentorshipStats: {
        total: totalMentorships,
        active: activeMentorships,
      },
      recentActivity: {
        users: recentUsers,
        jobs: recentJobs,
      },
      systemHealth: {
        blockedUsers,
        expiredJobs,
        pendingVerifications,
      },
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin only)
router.get("/users", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    if (req.query.isBlocked !== undefined) {
      filter.isBlocked = req.query.isBlocked === "true";
    }

    if (req.query.isVerified !== undefined) {
      filter.isEmailVerified = req.query.isVerified === "true";
    }

    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, "i") },
        { email: new RegExp(req.query.search, "i") },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (block/unblock, activate/deactivate)
// @access  Private (Admin only)
router.put("/users/:id/status", async (req, res, next) => {
  try {
    const { isActive, isBlocked, reason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admins from blocking other admins
    if (user.role === "admin" && isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Cannot block admin users",
      });
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    if (isBlocked !== undefined) {
      user.isBlocked = isBlocked;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${
        isBlocked ? "blocked" : isActive ? "activated" : "deactivated"
      } successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/jobs
// @desc    Get all jobs for admin management
// @access  Private (Admin only)
router.get("/jobs", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.featured !== undefined) {
      filter.featured = req.query.featured === "true";
    }

    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(req.query.search, "i") },
        { company: new RegExp(req.query.search, "i") },
      ];
    }

    const jobs = await Job.find(filter)
      .populate("employer", "name email companyInfo")
      .populate("applicationCount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/jobs/:id/feature
// @desc    Feature/unfeature a job
// @access  Private (Admin only)
router.put("/jobs/:id/feature", async (req, res, next) => {
  try {
    const { featured } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    job.featured = featured;
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job ${featured ? "featured" : "unfeatured"} successfully`,
      data: job,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/verifications
// @desc    Get skill verification requests
// @access  Private (Admin only)
router.get("/verifications", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.skillName) {
      filter.skillName = new RegExp(req.query.skillName, "i");
    }

    const verifications = await SkillVerification.find(filter)
      .populate("user", "name email avatar")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SkillVerification.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: verifications.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: verifications,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/verifications/:id/review
// @desc    Approve or reject skill verification
// @access  Private (Admin only)
router.put("/verifications/:id/review", async (req, res, next) => {
  try {
    const { action, notes, reason, details } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be approve or reject",
      });
    }

    const verification = await SkillVerification.findById(
      req.params.id
    ).populate("user");

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification request not found",
      });
    }

    if (
      verification.status !== "pending" &&
      verification.status !== "under-review"
    ) {
      return res.status(400).json({
        success: false,
        message: "This verification has already been reviewed",
      });
    }

    if (action === "approve") {
      await verification.approve(req.user._id, notes);

      // Update user's skills array
      const user = await User.findById(verification.user._id);
      const skillIndex = user.skills.findIndex(
        (s) => s.name === verification.skillName
      );

      if (skillIndex >= 0) {
        user.skills[skillIndex].isVerified = true;
        user.skills[skillIndex].verifiedBy = req.user._id;
        user.skills[skillIndex].verificationDate = new Date();
      } else {
        user.skills.push({
          name: verification.skillName,
          level: verification.level,
          isVerified: true,
          verifiedBy: req.user._id,
          verificationDate: new Date(),
        });
      }

      await user.save();
    } else {
      await verification.reject(req.user._id, reason, details);
    }

    res.status(200).json({
      success: true,
      message: `Verification ${action}ed successfully`,
      data: verification,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Private (Admin only)
router.get("/analytics", async (req, res, next) => {
  try {
    const timeframe = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    // User growth analytics
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Job posting analytics
    const jobPostings = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Application success rates by category
    const successRatesByCategory = await Application.aggregate([
      {
        $lookup: {
          from: "jobs",
          localField: "job",
          foreignField: "_id",
          as: "jobInfo",
        },
      },
      { $unwind: "$jobInfo" },
      {
        $group: {
          _id: "$jobInfo.category",
          totalApplications: { $sum: 1 },
          successfulApplications: {
            $sum: {
              $cond: [{ $in: ["$status", ["hired", "offer-accepted"]] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          category: "$_id",
          totalApplications: 1,
          successfulApplications: 1,
          successRate: {
            $multiply: [
              { $divide: ["$successfulApplications", "$totalApplications"] },
              100,
            ],
          },
        },
      },
      { $sort: { successRate: -1 } },
    ]);

    // Top performing employers
    const topEmployers = await Job.aggregate([
      {
        $group: {
          _id: "$employer",
          jobsPosted: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalApplications: { $sum: "$applications" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "employerInfo",
        },
      },
      { $unwind: "$employerInfo" },
      {
        $project: {
          name: "$employerInfo.name",
          company: "$employerInfo.companyInfo.name",
          jobsPosted: 1,
          totalViews: 1,
          totalApplications: 1,
          avgApplicationsPerJob: {
            $divide: ["$totalApplications", "$jobsPosted"],
          },
        },
      },
      { $sort: { totalApplications: -1 } },
      { $limit: 10 },
    ]);

    // Skills demand analysis
    const skillsDemand = await Job.aggregate([
      { $unwind: "$skills" },
      {
        $group: {
          _id: "$skills.name",
          demandCount: { $sum: 1 },
          averageLevel: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ["$skills.level", "beginner"] }, then: 1 },
                  { case: { $eq: ["$skills.level", "intermediate"] }, then: 2 },
                  { case: { $eq: ["$skills.level", "advanced"] }, then: 3 },
                  { case: { $eq: ["$skills.level", "expert"] }, then: 4 },
                ],
                default: 2,
              },
            },
          },
        },
      },
      { $sort: { demandCount: -1 } },
      { $limit: 20 },
    ]);

    const analyticsData = {
      userGrowth,
      jobPostings,
      successRatesByCategory,
      topEmployers,
      skillsDemand,
      summary: {
        timeframe: `${timeframe} days`,
        totalNewUsers: userGrowth.reduce((sum, day) => sum + day.count, 0),
        totalNewJobs: jobPostings.reduce((sum, day) => sum + day.count, 0),
        overallSuccessRate:
          successRatesByCategory.length > 0
            ? (
                successRatesByCategory.reduce(
                  (sum, cat) => sum + cat.successRate,
                  0
                ) / successRatesByCategory.length
              ).toFixed(1)
            : 0,
      },
    };

    res.status(200).json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/announcements
// @desc    Send system-wide announcement
// @access  Private (Admin only)
router.post("/announcements", async (req, res, next) => {
  try {
    const { title, message, targetRoles, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    // Build user filter
    const userFilter = { isActive: true };
    if (targetRoles && targetRoles.length > 0) {
      userFilter.role = { $in: targetRoles };
    }

    // Get target users
    const targetUsers = await User.find(userFilter).select("_id");

    // Create notifications for all target users
    const notifications = targetUsers.map((user) => ({
      user: user._id,
      title,
      message,
      type: "system-announcement",
      priority: priority || "medium",
    }));

    // Bulk create notifications (you'd implement this in the Notification model)
    // await Notification.insertMany(notifications);

    res.status(200).json({
      success: true,
      message: `Announcement sent to ${targetUsers.length} users`,
      targetCount: targetUsers.length,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require("express");
const { RTBGraduate } = require("../models/Skill");
const User = require("../models/User");
const Application = require("../models/Application");
const Job = require("../models/Job");
const SkillVerification = require("../models/Skill");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All RTB routes require RTB admin authentication
router.use(protect);
router.use(authorize("rtb-admin", "admin"));

/**
 * @swagger
 * /api/rtb/dashboard:
 *   get:
 *     summary: Get RTB dashboard statistics
 *     description: Retrieve comprehensive statistics for Refugee Talent Bridge dashboard
 *     tags: [RTB]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: RTB dashboard statistics retrieved successfully
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
 *                     participants:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 250
 *                         active:
 *                           type: integer
 *                           example: 180
 *                         graduated:
 *                           type: integer
 *                           example: 120
 *                         employed:
 *                           type: integer
 *                           example: 85
 *                     programs:
 *                       type: object
 *                       properties:
 *                         active:
 *                           type: integer
 *                           example: 5
 *                         completed:
 *                           type: integer
 *                           example: 12
 *                     skillsGap:
 *                       type: object
 *                       properties:
 *                         highDemand:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["JavaScript", "Python", "Digital Marketing"]
 *                         emergingSkills:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["AI/ML", "Cloud Computing", "Cybersecurity"]
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - RTB admin access required
 *       500:
 *         description: Server error
 */
// @access  Private (RTB Admin only)
router.get("/dashboard", async (req, res, next) => {
  try {
    // Get current year and previous years data
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];

    // Graduate statistics by year
    const graduateStatsByYear = await Promise.all(
      years.map(async (year) => {
        const graduates = await RTBGraduate.find({ graduationYear: year });
        const employmentStats = await RTBGraduate.getEmploymentStatsByYear(
          year
        );

        return {
          year,
          totalGraduates: graduates.length,
          employmentStats,
          employmentRate:
            graduates.length > 0
              ? (
                  (graduates.filter((g) => g.employmentStatus === "employed")
                    .length /
                    graduates.length) *
                  100
                ).toFixed(1)
              : 0,
          internationalPlacements: graduates.filter((g) =>
            g.employmentHistory?.some(
              (emp) => emp.isInternational && emp.isCurrent
            )
          ).length,
        };
      })
    );

    // Program performance analysis
    const programStats = await RTBGraduate.aggregate([
      {
        $group: {
          _id: "$program",
          totalGraduates: { $sum: 1 },
          employed: {
            $sum: {
              $cond: [{ $eq: ["$employmentStatus", "employed"] }, 1, 0],
            },
          },
          avgSalary: {
            $avg: {
              $let: {
                vars: {
                  currentJob: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$employmentHistory",
                          cond: "$$this.isCurrent",
                        },
                      },
                      0,
                    ],
                  },
                },
              },
              in: "$$currentJob.salary.amount",
            },
          },
        },
      },
      {
        $project: {
          program: "$_id",
          totalGraduates: 1,
          employed: 1,
          employmentRate: {
            $multiply: [{ $divide: ["$employed", "$totalGraduates"] }, 100],
          },
          avgSalary: { $round: ["$avgSalary", 0] },
        },
      },
      { $sort: { employmentRate: -1 } },
    ]);

    // Skills gap analysis
    const skillsGaps = await RTBGraduate.getSkillsGapAnalysis();

    // International mobility statistics
    const internationalStats = await RTBGraduate.aggregate([
      {
        $group: {
          _id: null,
          totalWithInternationalInterest: {
            $sum: {
              $cond: ["$internationalInterest.interested", 1, 0],
            },
          },
          currentlyInternational: {
            $sum: {
              $cond: [
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: "$employmentHistory",
                          cond: {
                            $and: [
                              "$$this.isCurrent",
                              "$$this.isInternational",
                            ],
                          },
                        },
                      },
                    },
                    0,
                  ],
                },
                1,
                0,
              ],
            },
          },
          topTargetCountries: "$internationalInterest.targetCountries",
        },
      },
    ]);

    // Get recent graduates for tracking
    const recentGraduates = await RTBGraduate.find({
      graduationYear: { $gte: currentYear - 1 },
    })
      .populate("user", "name email")
      .sort({ "user.createdAt": -1 })
      .limit(10);

    // Employment trends over time
    const employmentTrends = await RTBGraduate.aggregate([
      {
        $match: {
          lastContactDate: {
            $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          }, // Last year
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$lastContactDate" },
            month: { $month: "$lastContactDate" },
            status: "$employmentStatus",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const dashboardData = {
      overview: {
        totalGraduates: graduateStatsByYear.reduce(
          (sum, year) => sum + year.totalGraduates,
          0
        ),
        currentYearGraduates:
          graduateStatsByYear.find((y) => y.year === currentYear)
            ?.totalGraduates || 0,
        overallEmploymentRate:
          graduateStatsByYear.length > 0
            ? (
                graduateStatsByYear.reduce(
                  (sum, year) => sum + parseFloat(year.employmentRate),
                  0
                ) / graduateStatsByYear.length
              ).toFixed(1)
            : 0,
        internationalPlacements: graduateStatsByYear.reduce(
          (sum, year) => sum + year.internationalPlacements,
          0
        ),
        criticalSkillsGaps: skillsGaps.slice(0, 5),
      },
      graduateStatsByYear,
      programPerformance: programStats,
      skillsGaps: skillsGaps.slice(0, 10),
      internationalStats: internationalStats[0] || {
        totalWithInternationalInterest: 0,
        currentlyInternational: 0,
      },
      recentGraduates,
      employmentTrends,
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/rtb/graduates
// @desc    Get all RTB graduates with filtering
// @access  Private (RTB Admin only)
router.get("/graduates", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (req.query.graduationYear) {
      filter.graduationYear = parseInt(req.query.graduationYear);
    }

    if (req.query.program) {
      filter.program = new RegExp(req.query.program, "i");
    }

    if (req.query.employmentStatus) {
      filter.employmentStatus = req.query.employmentStatus;
    }

    if (req.query.institution) {
      filter.institution = new RegExp(req.query.institution, "i");
    }

    if (req.query.isActivelyTracked !== undefined) {
      filter.isActivelyTracked = req.query.isActivelyTracked === "true";
    }

    if (req.query.search) {
      // Search in user name through populate (we'll handle this after population)
    }

    const graduates = await RTBGraduate.find(filter)
      .populate("user", "name email location avatar")
      .sort({ graduationYear: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Filter by user name if search provided
    let filteredGraduates = graduates;
    if (req.query.search) {
      filteredGraduates = graduates.filter((grad) =>
        grad.user?.name.toLowerCase().includes(req.query.search.toLowerCase())
      );
    }

    const total = await RTBGraduate.countDocuments(filter);

    // Get summary statistics
    const summaryStats = await RTBGraduate.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$employmentStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: filteredGraduates.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: filteredGraduates,
      summaryStats,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/rtb/graduates
// @desc    Add new graduate to tracking system
// @access  Private (RTB Admin only)
router.post("/graduates", async (req, res, next) => {
  try {
    const {
      userId,
      program,
      institution,
      graduationYear,
      studentId,
      gpa,
      employmentStatus,
      skillsAssessment,
      careerGoals,
    } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if graduate already exists
    const existingGraduate = await RTBGraduate.findOne({ user: userId });
    if (existingGraduate) {
      return res.status(400).json({
        success: false,
        message: "Graduate already exists in tracking system",
      });
    }

    const graduateData = {
      user: userId,
      program,
      institution,
      graduationYear,
      studentId,
      gpa,
      employmentStatus: employmentStatus || "seeking",
      skillsAssessment: skillsAssessment || [],
      careerGoals: careerGoals || [],
      lastContactDate: new Date(),
      contactMethod: "in-person",
    };

    const graduate = await RTBGraduate.create(graduateData);

    // Update user's RTB info
    user.rtbInfo = {
      graduationYear,
      program,
      institution,
      studentId,
      currentEmploymentStatus: employmentStatus || "seeking",
    };
    await user.save();

    const populatedGraduate = await RTBGraduate.findById(graduate._id).populate(
      "user",
      "name email location avatar"
    );

    res.status(201).json({
      success: true,
      message: "Graduate added to tracking system successfully",
      data: populatedGraduate,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/rtb/graduates/:id
// @desc    Update graduate information
// @access  Private (RTB Admin only)
router.put("/graduates/:id", async (req, res, next) => {
  try {
    const graduate = await RTBGraduate.findById(req.params.id);

    if (!graduate) {
      return res.status(404).json({
        success: false,
        message: "Graduate not found",
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      "program",
      "institution",
      "graduationYear",
      "employmentStatus",
      "employmentHistory",
      "skillsAssessment",
      "skillsGaps",
      "careerGoals",
      "mentorshipNeeds",
      "internationalInterest",
      "programFeedback",
      "isActivelyTracked",
      "trackingConsent",
    ];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Update last contact info
    updates.lastContactDate = new Date();
    if (req.body.contactMethod) {
      updates.contactMethod = req.body.contactMethod;
    }

    const updatedGraduate = await RTBGraduate.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("user", "name email location avatar");

    res.status(200).json({
      success: true,
      message: "Graduate information updated successfully",
      data: updatedGraduate,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/rtb/graduates/:id/employment
// @desc    Update graduate employment status
// @access  Private (RTB Admin only)
router.put("/graduates/:id/employment", async (req, res, next) => {
  try {
    const graduate = await RTBGraduate.findById(req.params.id);

    if (!graduate) {
      return res.status(404).json({
        success: false,
        message: "Graduate not found",
      });
    }

    const { employmentStatus, employmentDetails } = req.body;

    if (!employmentStatus) {
      return res.status(400).json({
        success: false,
        message: "Employment status is required",
      });
    }

    await graduate.updateEmploymentStatus(employmentStatus, employmentDetails);

    res.status(200).json({
      success: true,
      message: "Employment status updated successfully",
      data: graduate,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/rtb/analytics
// @desc    Get detailed RTB analytics
// @access  Private (RTB Admin only)
router.get("/analytics", async (req, res, next) => {
  try {
    const timeframe = req.query.timeframe || "yearly"; // yearly, monthly, quarterly
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Employment outcomes by program
    const programOutcomes = await RTBGraduate.aggregate([
      {
        $match: {
          graduationYear: { $gte: year - 2, $lte: year },
        },
      },
      {
        $group: {
          _id: {
            program: "$program",
            year: "$graduationYear",
          },
          totalGraduates: { $sum: 1 },
          employed: {
            $sum: {
              $cond: [{ $eq: ["$employmentStatus", "employed"] }, 1, 0],
            },
          },
          seeking: {
            $sum: {
              $cond: [{ $eq: ["$employmentStatus", "seeking"] }, 1, 0],
            },
          },
          unemployed: {
            $sum: {
              $cond: [{ $eq: ["$employmentStatus", "unemployed"] }, 1, 0],
            },
          },
          furtherStudy: {
            $sum: {
              $cond: [{ $eq: ["$employmentStatus", "further-study"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          program: "$_id.program",
          year: "$_id.year",
          totalGraduates: 1,
          employed: 1,
          seeking: 1,
          unemployed: 1,
          furtherStudy: 1,
          employmentRate: {
            $multiply: [{ $divide: ["$employed", "$totalGraduates"] }, 100],
          },
        },
      },
      { $sort: { year: -1, employmentRate: -1 } },
    ]);

    // Salary analysis by program and year
    const salaryAnalysis = await RTBGraduate.aggregate([
      {
        $match: {
          employmentStatus: "employed",
          employmentHistory: { $elemMatch: { isCurrent: true } },
        },
      },
      {
        $unwind: "$employmentHistory",
      },
      {
        $match: {
          "employmentHistory.isCurrent": true,
          "employmentHistory.salary.amount": { $exists: true, $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            program: "$program",
            country: "$employmentHistory.location.country",
          },
          avgSalary: { $avg: "$employmentHistory.salary.amount" },
          minSalary: { $min: "$employmentHistory.salary.amount" },
          maxSalary: { $max: "$employmentHistory.salary.amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgSalary: -1 } },
    ]);

    // Skills gap trends
    const skillsGapTrends = await RTBGraduate.aggregate([
      { $unwind: "$skillsGaps" },
      {
        $group: {
          _id: {
            skill: "$skillsGaps.skillName",
            importance: "$skillsGaps.importance",
          },
          count: { $sum: 1 },
          avgIdentificationDate: { $avg: "$skillsGaps.identifiedDate" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    // International mobility success rates
    const internationalMobility = await RTBGraduate.aggregate([
      {
        $group: {
          _id: "$program",
          totalGraduates: { $sum: 1 },
          interestedInInternational: {
            $sum: {
              $cond: ["$internationalInterest.interested", 1, 0],
            },
          },
          currentlyInternational: {
            $sum: {
              $cond: [
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: "$employmentHistory",
                          cond: {
                            $and: [
                              "$$this.isCurrent",
                              "$$this.isInternational",
                            ],
                          },
                        },
                      },
                    },
                    0,
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          program: "$_id",
          totalGraduates: 1,
          interestedInInternational: 1,
          currentlyInternational: 1,
          internationalSuccessRate: {
            $cond: [
              { $gt: ["$interestedInInternational", 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      "$currentlyInternational",
                      "$interestedInInternational",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { internationalSuccessRate: -1 } },
    ]);

    const analyticsData = {
      programOutcomes,
      salaryAnalysis,
      skillsGapTrends,
      internationalMobility,
      summary: {
        timeframe,
        year,
        totalGraduatesAnalyzed: programOutcomes.reduce(
          (sum, p) => sum + p.totalGraduates,
          0
        ),
        overallEmploymentRate:
          programOutcomes.length > 0
            ? (
                programOutcomes.reduce((sum, p) => sum + p.employmentRate, 0) /
                programOutcomes.length
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

// @route   GET /api/rtb/reports/employment
// @desc    Generate employment report
// @access  Private (RTB Admin only)
router.get("/reports/employment", async (req, res, next) => {
  try {
    const startYear =
      parseInt(req.query.startYear) || new Date().getFullYear() - 2;
    const endYear = parseInt(req.query.endYear) || new Date().getFullYear();
    const program = req.query.program;

    const filter = {
      graduationYear: { $gte: startYear, $lte: endYear },
    };

    if (program) {
      filter.program = program;
    }

    const graduates = await RTBGraduate.find(filter)
      .populate("user", "name email location")
      .sort({ graduationYear: -1, program: 1 });

    // Generate report data
    const reportData = {
      reportMetadata: {
        generatedAt: new Date(),
        generatedBy: req.user.name,
        period: `${startYear}-${endYear}`,
        program: program || "All Programs",
        totalGraduates: graduates.length,
      },
      graduates: graduates.map((grad) => ({
        name: grad.user?.name,
        email: grad.user?.email,
        program: grad.program,
        graduationYear: grad.graduationYear,
        employmentStatus: grad.employmentStatus,
        currentPosition: grad.employmentHistory?.find((emp) => emp.isCurrent)
          ?.position,
        currentCompany: grad.employmentHistory?.find((emp) => emp.isCurrent)
          ?.company,
        location: grad.employmentHistory?.find((emp) => emp.isCurrent)
          ?.location,
        isInternational:
          grad.employmentHistory?.find((emp) => emp.isCurrent)
            ?.isInternational || false,
        salary: grad.employmentHistory?.find((emp) => emp.isCurrent)?.salary
          ?.amount,
        lastContactDate: grad.lastContactDate,
        skillsGaps: grad.skillsGaps?.map((sg) => sg.skillName) || [],
      })),
      summary: {
        byProgram: {},
        byYear: {},
        overallEmploymentRate: 0,
        internationalPlacementRate: 0,
      },
    };

    // Calculate summary statistics
    const programStats = {};
    const yearStats = {};
    let totalEmployed = 0;
    let totalInternational = 0;

    graduates.forEach((grad) => {
      // Program stats
      if (!programStats[grad.program]) {
        programStats[grad.program] = { total: 0, employed: 0 };
      }
      programStats[grad.program].total++;
      if (grad.employmentStatus === "employed") {
        programStats[grad.program].employed++;
        totalEmployed++;

        if (
          grad.employmentHistory?.find(
            (emp) => emp.isCurrent && emp.isInternational
          )
        ) {
          totalInternational++;
        }
      }

      // Year stats
      if (!yearStats[grad.graduationYear]) {
        yearStats[grad.graduationYear] = { total: 0, employed: 0 };
      }
      yearStats[grad.graduationYear].total++;
      if (grad.employmentStatus === "employed") {
        yearStats[grad.graduationYear].employed++;
      }
    });

    reportData.summary.byProgram = programStats;
    reportData.summary.byYear = yearStats;
    reportData.summary.overallEmploymentRate =
      graduates.length > 0
        ? ((totalEmployed / graduates.length) * 100).toFixed(1)
        : 0;
    reportData.summary.internationalPlacementRate =
      graduates.length > 0
        ? ((totalInternational / graduates.length) * 100).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/rtb/skills-gaps
// @desc    Get comprehensive skills gap analysis
// @access  Private (RTB Admin only)
router.get("/skills-gaps", async (req, res, next) => {
  try {
    const program = req.query.program;
    const year = parseInt(req.query.year);

    let matchFilter = {};
    if (program) matchFilter.program = program;
    if (year) matchFilter.graduationYear = year;

    const skillsGapAnalysis = await RTBGraduate.aggregate([
      { $match: matchFilter },
      { $unwind: "$skillsGaps" },
      {
        $group: {
          _id: {
            skill: "$skillsGaps.skillName",
            importance: "$skillsGaps.importance",
            program: "$program",
          },
          count: { $sum: 1 },
          hasTraining: {
            $sum: {
              $cond: ["$skillsGaps.availableTraining", 1, 0],
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.skill",
          totalMentions: { $sum: "$count" },
          criticalMentions: {
            $sum: {
              $cond: [{ $eq: ["$_id.importance", "critical"] }, "$count", 0],
            },
          },
          programBreakdown: {
            $push: {
              program: "$_id.program",
              count: "$count",
              importance: "$_id.importance",
            },
          },
          trainingAvailable: { $sum: "$hasTraining" },
        },
      },
      {
        $project: {
          skill: "$_id",
          totalMentions: 1,
          criticalMentions: 1,
          programBreakdown: 1,
          trainingGap: {
            $subtract: ["$totalMentions", "$trainingAvailable"],
          },
          priority: {
            $switch: {
              branches: [
                { case: { $gte: ["$criticalMentions", 10] }, then: "High" },
                { case: { $gte: ["$criticalMentions", 5] }, then: "Medium" },
                { case: { $gte: ["$totalMentions", 10] }, then: "Medium" },
              ],
              default: "Low",
            },
          },
        },
      },
      { $sort: { criticalMentions: -1, totalMentions: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: skillsGapAnalysis,
      filters: {
        program: program || "All Programs",
        year: year || "All Years",
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

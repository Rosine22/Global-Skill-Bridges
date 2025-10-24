const express = require("express");
const { body, query, validationResult } = require("express-validator");
const Job = require("../models/Job").default;
const Application = require("../models/Application");
const { protect, authorize, optionalAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job posting and management operations
 */

// Validation rules
const jobValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Job title must be between 3 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),
  body("company")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters"),
  body("location.city").trim().notEmpty().withMessage("City is required"),
  body("location.country").trim().notEmpty().withMessage("Country is required"),
  body("category")
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
      "other",
    ])
    .withMessage("Invalid job category"),
  body("type")
    .optional()
    .isIn(["full-time", "part-time", "contract", "internship", "temporary"]),
  body("level")
    .optional()
    .isIn(["entry", "junior", "mid", "senior", "lead", "executive"]),
  body("skills")
    .isArray({ min: 1 })
    .withMessage("At least one skill is required"),
  body("requirements")
    .isArray({ min: 1 })
    .withMessage("At least one requirement is required"),
];

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs with filtering and pagination
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of jobs per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for job titles or descriptions
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: jobType
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, contract, internship]
 *         description: Filter by job type
 *       - in: query
 *         name: salaryMin
 *         schema:
 *           type: number
 *         description: Minimum salary filter
 *       - in: query
 *         name: salaryMax
 *         schema:
 *           type: number
 *         description: Maximum salary filter
 *     responses:
 *       200:
 *         description: List of jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */

// @route   GET /api/jobs
// @desc    Get all jobs with filtering, pagination, and search
// @access  Public (with optional auth for personalized results)
router.get(
  "/",
  optionalAuth,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("category")
      .optional()
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
        "other",
      ]),
    query("type")
      .optional()
      .isIn(["full-time", "part-time", "contract", "internship", "temporary"]),
    query("level")
      .optional()
      .isIn(["entry", "junior", "mid", "senior", "lead", "executive"]),
    query("remote").optional().isBoolean(),
    query("minSalary").optional().isNumeric(),
    query("maxSalary").optional().isNumeric(),
    query("skills").optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors: errors.array(),
        });
      }

      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter = {
        status: "active",
        $or: [
          { applicationDeadline: { $gte: new Date() } },
          { applicationDeadline: null },
        ],
      };

      // Apply filters
      if (req.query.search) {
        filter.$text = { $search: req.query.search };
      }

      if (req.query.category) {
        filter.category = req.query.category;
      }

      if (req.query.type) {
        filter.type = req.query.type;
      }

      if (req.query.level) {
        filter.level = req.query.level;
      }

      if (req.query.country) {
        filter["location.country"] = new RegExp(req.query.country, "i");
      }

      if (req.query.city) {
        filter["location.city"] = new RegExp(req.query.city, "i");
      }

      if (req.query.remote === "true") {
        filter["location.isRemote"] = true;
      }

      if (req.query.skills) {
        const skills = req.query.skills.split(",").map((s) => s.trim());
        filter["skills.name"] = { $in: skills };
      }

      // Salary range filter
      if (req.query.minSalary || req.query.maxSalary) {
        filter.$and = filter.$and || [];

        if (req.query.minSalary) {
          filter.$and.push({
            $or: [
              { "salary.min": { $gte: parseInt(req.query.minSalary) } },
              { "salary.max": { $gte: parseInt(req.query.minSalary) } },
            ],
          });
        }

        if (req.query.maxSalary) {
          filter.$and.push({
            $or: [
              { "salary.max": { $lte: parseInt(req.query.maxSalary) } },
              { "salary.min": { $lte: parseInt(req.query.maxSalary) } },
            ],
          });
        }
      }

      // Sort options
      let sortOption = { createdAt: -1 };
      if (req.query.sort === "salary-asc") {
        sortOption = { "salary.min": 1, createdAt: -1 };
      } else if (req.query.sort === "salary-desc") {
        sortOption = { "salary.max": -1, createdAt: -1 };
      } else if (req.query.sort === "featured") {
        sortOption = { featured: -1, createdAt: -1 };
      }

      // Execute query
      const jobs = await Job.find(filter)
        .populate("employer", "name companyInfo.name avatar")
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean();

      // Get total count for pagination
      const total = await Job.countDocuments(filter);

      // If user is authenticated, mark jobs they've applied to
      if (req.user) {
        const userApplications = await Application.find({
          applicant: req.user._id,
          job: { $in: jobs.map((job) => job._id) },
        }).select("job");

        const appliedJobIds = new Set(
          userApplications.map((app) => app.job.toString())
        );

        jobs.forEach((job) => {
          job.hasApplied = appliedJobIds.has(job._id.toString());
        });
      }

      res.status(200).json({
        success: true,
        count: jobs.length,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        data: jobs,
        filters: {
          categories: await Job.distinct("category", { status: "active" }),
          countries: await Job.distinct("location.country", {
            status: "active",
          }),
          types: await Job.distinct("type", { status: "active" }),
          levels: await Job.distinct("level", { status: "active" }),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/jobs/featured
// @desc    Get featured jobs
// @access  Public
router.get("/featured", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const jobs = await Job.findFeatured(limit);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a single job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public (with optional auth for application status)
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("employer", "name companyInfo avatar location")
      .populate("applicationCount");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Increment view count
    await job.incrementViews();

    // Check if user has applied (if authenticated)
    let hasApplied = false;
    let applicationStatus = null;

    if (req.user) {
      const application = await Application.findOne({
        job: job._id,
        applicant: req.user._id,
      });

      if (application) {
        hasApplied = true;
        applicationStatus = application.status;
      }
    }

    // Get similar jobs
    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      category: job.category,
      status: "active",
      $or: [
        { applicationDeadline: { $gte: new Date() } },
        { applicationDeadline: null },
      ],
    })
      .populate("employer", "name companyInfo.name")
      .limit(5)
      .select("title company location salary type");

    res.status(200).json({
      success: true,
      data: {
        job,
        hasApplied,
        applicationStatus,
        similarJobs,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - location
 *               - company
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: "Senior Software Developer"
 *               description:
 *                 type: string
 *                 minLength: 50
 *                 example: "We are looking for an experienced software developer..."
 *               company:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Tech Solutions Inc"
 *                   website:
 *                     type: string
 *                     example: "https://techsolutions.com"
 *                   logo:
 *                     type: string
 *                     example: "https://example.com/logo.png"
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: "Kigali"
 *                   country:
 *                     type: string
 *                     example: "Rwanda"
 *                   remote:
 *                     type: boolean
 *                     example: false
 *               salary:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                     example: 800000
 *                   max:
 *                     type: number
 *                     example: 1200000
 *                   currency:
 *                     type: string
 *                     example: "RWF"
 *               jobType:
 *                 type: string
 *                 enum: [full-time, part-time, contract, internship]
 *                 example: "full-time"
 *               requirements:
 *                 type: object
 *                 properties:
 *                   skills:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["JavaScript", "Node.js", "React"]
 *                   experience:
 *                     type: string
 *                     example: "3+ years"
 *                   education:
 *                     type: string
 *                     example: "Bachelor's degree in Computer Science"
 *     responses:
 *       201:
 *         description: Job created successfully
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
 *                   example: "Job created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only employers can create jobs
 */

// @route   POST /api/jobs
// @desc    Create new job posting
// @access  Private (Employers only)
router.post(
  "/",
  protect,
  authorize("employer"),
  jobValidation,
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

      // Add employer info to job data
      const jobData = {
        ...req.body,
        employer: req.user._id,
        company:
          req.body.company || req.user.companyInfo?.name || req.user.name,
      };

      const job = await Job.create(jobData);

      // Update user stats
      req.user.stats.jobsPosted = (req.user.stats.jobsPosted || 0) + 1;
      await req.user.save();

      const populatedJob = await Job.findById(job._id).populate(
        "employer",
        "name companyInfo.name"
      );

      res.status(201).json({
        success: true,
        message: "Job created successfully",
        data: populatedJob,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/jobs/:id
// @desc    Update job posting
// @access  Private (Job owner or admin)
router.put("/:id", protect, async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check ownership or admin access
    if (
      job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this job",
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      "title",
      "description",
      "location",
      "requirements",
      "skills",
      "salary",
      "benefits",
      "customBenefits",
      "applicationDeadline",
      "startDate",
      "status",
      "type",
      "level",
      "category",
    ];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    job = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("employer", "name companyInfo.name");

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job posting
// @access  Private (Job owner or admin)
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check ownership or admin access
    if (
      job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this job",
      });
    }

    // Soft delete by updating status
    job.status = "closed";
    job.archivedAt = new Date();
    job.archivedBy = req.user._id;
    await job.save();

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/jobs/:id/applications
// @desc    Get applications for a specific job
// @access  Private (Job owner or admin)
router.get("/:id/applications", protect, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check ownership or admin access
    if (
      job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view applications for this job",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { job: req.params.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const applications = await Application.find(filter)
      .populate("applicant", "name email avatar location skills experience")
      .sort({ "matchingScore.overall": -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/jobs/:id/apply
// @desc    Apply to a job
// @access  Private (Job seekers only)
router.post(
  "/:id/apply",
  protect,
  authorize("job-seeker"),
  [
    body("coverLetter")
      .optional()
      .isLength({ max: 2000 })
      .withMessage("Cover letter cannot exceed 2000 characters"),
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

      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }

      if (job.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "This job is no longer accepting applications",
        });
      }

      if (job.applicationDeadline && new Date() > job.applicationDeadline) {
        return res.status(400).json({
          success: false,
          message: "Application deadline has passed",
        });
      }

      // Check if user already applied
      const existingApplication = await Application.findOne({
        job: req.params.id,
        applicant: req.user._id,
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: "You have already applied to this job",
        });
      }

      // Create application
      const applicationData = {
        job: req.params.id,
        applicant: req.user._id,
        employer: job.employer,
        coverLetter: req.body.coverLetter,
        resume: req.body.resume,
        portfolio: req.body.portfolio,
        additionalDocuments: req.body.additionalDocuments,
      };

      const application = await Application.create(applicationData);

      // Update job applications count
      job.applications = (job.applications || 0) + 1;
      await job.save();

      // Update user stats
      req.user.stats.jobsApplied = (req.user.stats.jobsApplied || 0) + 1;
      await req.user.save();

      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/jobs/my/posted
// @desc    Get jobs posted by current user
// @access  Private (Employers only)
router.get(
  "/my/posted",
  protect,
  authorize("employer"),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = { employer: req.user._id };

      if (req.query.status) {
        filter.status = req.query.status;
      }

      const jobs = await Job.find(filter)
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
  }
);

// @route   GET /api/jobs/recommendations
// @desc    Get job recommendations for current user
// @access  Private (Job seekers only)
router.get(
  "/recommendations",
  protect,
  authorize("job-seeker"),
  async (req, res, next) => {
    try {
      const userSkills = req.user.skills?.map((skill) => skill.name) || [];
      const userLocation = req.user.location?.country;
      const limit = parseInt(req.query.limit) || 10;

      let recommendationFilter = {
        status: "active",
        $or: [
          { applicationDeadline: { $gte: new Date() } },
          { applicationDeadline: null },
        ],
      };

      // Skills-based recommendations
      if (userSkills.length > 0) {
        recommendationFilter["skills.name"] = { $in: userSkills };
      }

      // Location preference (if user prefers local jobs)
      if (userLocation && req.query.includeLocation === "true") {
        recommendationFilter.$or = [
          { "location.country": userLocation },
          { "location.isRemote": true },
        ];
      }

      const recommendations = await Job.find(recommendationFilter)
        .populate("employer", "name companyInfo.name")
        .sort({ featured: -1, createdAt: -1 })
        .limit(limit);

      res.status(200).json({
        success: true,
        count: recommendations.length,
        data: recommendations,
        message:
          recommendations.length === 0
            ? "No recommendations found. Try updating your skills or location."
            : undefined,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

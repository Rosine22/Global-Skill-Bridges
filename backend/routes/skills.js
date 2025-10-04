const express = require("express");
const SkillVerification = require("../models/Skill");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// All skills routes require authentication
router.use(protect);

// @route   GET /api/skills
// @desc    Get all skills with categories
// @access  Private
router.get("/", async (req, res, next) => {
  try {
    const { category, level, verified, search } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (verified !== undefined) filter.verified = verified === "true";

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const skills = await SkillVerification.find(filter)
      .populate("verifiedBy", "name title organization")
      .populate("endorsements.endorsedBy", "name title organization")
      .sort({ createdAt: -1 });

    // Group skills by category
    const skillsByCategory = skills.reduce((acc, skill) => {
      const category = skill.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: skills.length,
      data: {
        skills,
        skillsByCategory,
        categories: Object.keys(skillsByCategory),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/skills
// @desc    Create a new skill
// @access  Private
router.post(
  "/",
  [
    body("name").notEmpty().trim().withMessage("Skill name is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("level")
      .isIn(["beginner", "intermediate", "advanced", "expert"])
      .withMessage("Valid level is required"),
    body("description").optional().trim(),
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
        name,
        category,
        level,
        description,
        tags,
        certificationRequired,
        assessmentCriteria,
      } = req.body;

      // Check if skill already exists
      const existingSkill = await SkillVerification.findOne({
        name: new RegExp(`^${name}$`, "i"),
        category,
      });

      if (existingSkill) {
        return res.status(400).json({
          success: false,
          message: "Skill with this name already exists in this category",
        });
      }

      const skill = await SkillVerification.create({
        name,
        category,
        level,
        description,
        tags: tags || [],
        certificationRequired: certificationRequired || false,
        assessmentCriteria: assessmentCriteria || [],
        createdBy: req.user._id,
      });

      const populatedSkill = await SkillVerification.findById(
        skill._id
      ).populate("createdBy", "name title organization");

      res.status(201).json({
        success: true,
        message: "Skill created successfully",
        data: populatedSkill,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/skills/verification/:userId
// @desc    Get skill verifications for a user
// @access  Private
router.get("/verification/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, category, verifiedOnly } = req.query;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build filter for user's skills
    const filter = { user: userId };
    if (status) filter.verificationStatus = status;
    if (verifiedOnly === "true") filter.verified = true;

    let verifications = await SkillVerification.find(filter)
      .populate("verifiedBy", "name title organization")
      .populate("endorsements.endorsedBy", "name title organization")
      .sort({ verificationDate: -1 });

    // Filter by category if specified
    if (category) {
      verifications = verifications.filter((v) => v.category === category);
    }

    // Calculate skill statistics
    const skillStats = {
      totalSkills: verifications.length,
      verifiedSkills: verifications.filter((v) => v.verified).length,
      pendingVerifications: verifications.filter(
        (v) => v.verificationStatus === "pending"
      ).length,
      skillsByCategory: verifications.reduce((acc, skill) => {
        acc[skill.category] = (acc[skill.category] || 0) + 1;
        return acc;
      }, {}),
      skillsByLevel: verifications.reduce((acc, skill) => {
        acc[skill.level] = (acc[skill.level] || 0) + 1;
        return acc;
      }, {}),
    };

    res.status(200).json({
      success: true,
      count: verifications.length,
      data: {
        verifications,
        stats: skillStats,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/skills/verify/:skillId
// @desc    Submit skill for verification or verify a skill
// @access  Private
router.post(
  "/verify/:skillId",
  [
    body("evidenceType")
      .optional()
      .isIn(["certificate", "portfolio", "project", "reference", "assessment"]),
    body("evidenceUrl")
      .optional()
      .isURL()
      .withMessage("Valid URL required for evidence"),
    body("description").optional().trim(),
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

      const { skillId } = req.params;
      const {
        evidenceType,
        evidenceUrl,
        description,
        verificationNotes,
        approved,
      } = req.body;

      const skill = await SkillVerification.findById(skillId);
      if (!skill) {
        return res.status(404).json({
          success: false,
          message: "Skill not found",
        });
      }

      // If user is submitting for verification
      if (
        req.user.role === "job-seeker" ||
        (skill.user && skill.user.toString() === req.user._id.toString())
      ) {
        if (skill.verificationStatus === "verified") {
          return res.status(400).json({
            success: false,
            message: "Skill is already verified",
          });
        }

        // Add evidence
        const evidence = {
          type: evidenceType,
          url: evidenceUrl,
          description,
          submittedAt: new Date(),
        };

        skill.evidence.push(evidence);
        skill.verificationStatus = "pending";
        skill.verificationRequestDate = new Date();

        await skill.save();

        res.status(200).json({
          success: true,
          message: "Skill submitted for verification",
          data: skill,
        });
      } else if (["mentor", "employer", "admin"].includes(req.user.role)) {
        // Verifier is reviewing/approving the skill
        if (approved === true) {
          skill.verified = true;
          skill.verificationStatus = "verified";
          skill.verificationDate = new Date();
          skill.verifiedBy = req.user._id;
          if (verificationNotes) {
            skill.verificationNotes = verificationNotes;
          }
        } else if (approved === false) {
          skill.verificationStatus = "rejected";
          skill.rejectionReason =
            verificationNotes || "Insufficient evidence provided";
          skill.rejectedBy = req.user._id;
          skill.rejectionDate = new Date();
        }

        await skill.save();

        const populatedSkill = await SkillVerification.findById(skill._id)
          .populate("user", "name email")
          .populate("verifiedBy", "name title organization")
          .populate("rejectedBy", "name title organization");

        res.status(200).json({
          success: true,
          message: approved
            ? "Skill verified successfully"
            : "Skill verification rejected",
          data: populatedSkill,
        });
      } else {
        return res.status(403).json({
          success: false,
          message: "Not authorized to perform this action",
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/skills/endorse/:skillId
// @desc    Endorse a skill
// @access  Private
router.post(
  "/endorse/:skillId",
  [
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Comment must be less than 500 characters"),
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

      const { skillId } = req.params;
      const { comment } = req.body;

      const skill = await SkillVerification.findById(skillId);
      if (!skill) {
        return res.status(404).json({
          success: false,
          message: "Skill not found",
        });
      }

      // Check if user already endorsed this skill
      const existingEndorsement = skill.endorsements.find(
        (e) => e.endorsedBy.toString() === req.user._id.toString()
      );

      if (existingEndorsement) {
        return res.status(400).json({
          success: false,
          message: "You have already endorsed this skill",
        });
      }

      // Cannot endorse own skill
      if (skill.user && skill.user.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Cannot endorse your own skill",
        });
      }

      // Add endorsement
      skill.endorsements.push({
        endorsedBy: req.user._id,
        comment,
        endorsedAt: new Date(),
      });

      await skill.save();

      const populatedSkill = await SkillVerification.findById(
        skill._id
      ).populate("endorsements.endorsedBy", "name title organization avatar");

      res.status(200).json({
        success: true,
        message: "Skill endorsed successfully",
        data: populatedSkill,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/skills/pending-verifications
// @desc    Get all pending skill verifications (for verifiers)
// @access  Private (Mentors, Employers, Admins)
router.get(
  "/pending-verifications",
  authorize("mentor", "employer", "admin"),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const { category, level } = req.query;

      // Build filter
      const filter = {
        verificationStatus: "pending",
      };

      if (category) filter.category = category;
      if (level) filter.level = level;

      const pendingVerifications = await SkillVerification.find(filter)
        .populate("user", "name email avatar location")
        .populate("createdBy", "name title organization")
        .sort({ verificationRequestDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await SkillVerification.countDocuments(filter);

      // Get summary statistics
      const summaryStats = await SkillVerification.aggregate([
        { $match: { verificationStatus: "pending" } },
        {
          $group: {
            _id: {
              category: "$category",
              level: "$level",
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.category",
            levels: {
              $push: {
                level: "$_id.level",
                count: "$count",
              },
            },
            totalCount: { $sum: "$count" },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        count: pendingVerifications.length,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        data: {
          pendingVerifications,
          summaryStats,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/skills/analytics
// @desc    Get skills analytics and trends
// @access  Private (Admin only)
router.get(
  "/analytics",
  authorize("admin", "rtb-admin"),
  async (req, res, next) => {
    try {
      // Verification statistics
      const verificationStats = await SkillVerification.aggregate([
        {
          $group: {
            _id: "$verificationStatus",
            count: { $sum: 1 },
          },
        },
      ]);

      // Skills by category and level
      const skillsDistribution = await SkillVerification.aggregate([
        {
          $group: {
            _id: {
              category: "$category",
              level: "$level",
            },
            count: { $sum: 1 },
            verified: {
              $sum: { $cond: ["$verified", 1, 0] },
            },
          },
        },
        {
          $group: {
            _id: "$_id.category",
            levels: {
              $push: {
                level: "$_id.level",
                total: "$count",
                verified: "$verified",
              },
            },
            totalSkills: { $sum: "$count" },
            totalVerified: { $sum: "$verified" },
          },
        },
        { $sort: { totalSkills: -1 } },
      ]);

      // Most endorsed skills
      const mostEndorsedSkills = await SkillVerification.aggregate([
        {
          $project: {
            name: 1,
            category: 1,
            level: 1,
            verified: 1,
            endorsementCount: { $size: "$endorsements" },
          },
        },
        { $sort: { endorsementCount: -1 } },
        { $limit: 10 },
      ]);

      // Verification trends over time (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const verificationTrends = await SkillVerification.aggregate([
        {
          $match: {
            verificationDate: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$verificationDate" },
              month: { $month: "$verificationDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      // Skills gap analysis (skills with low verification rates)
      const skillsGapAnalysis = await SkillVerification.aggregate([
        {
          $group: {
            _id: "$category",
            totalSkills: { $sum: 1 },
            verifiedSkills: {
              $sum: { $cond: ["$verified", 1, 0] },
            },
            pendingSkills: {
              $sum: {
                $cond: [{ $eq: ["$verificationStatus", "pending"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            category: "$_id",
            totalSkills: 1,
            verifiedSkills: 1,
            pendingSkills: 1,
            verificationRate: {
              $cond: [
                { $gt: ["$totalSkills", 0] },
                {
                  $multiply: [
                    { $divide: ["$verifiedSkills", "$totalSkills"] },
                    100,
                  ],
                },
                0,
              ],
            },
          },
        },
        { $sort: { verificationRate: 1 } },
      ]);

      const analyticsData = {
        overview: {
          totalSkills: verificationStats.reduce(
            (sum, stat) => sum + stat.count,
            0
          ),
          verifiedSkills:
            verificationStats.find((s) => s._id === "verified")?.count || 0,
          pendingVerifications:
            verificationStats.find((s) => s._id === "pending")?.count || 0,
          rejectedVerifications:
            verificationStats.find((s) => s._id === "rejected")?.count || 0,
        },
        verificationStats,
        skillsDistribution,
        mostEndorsedSkills,
        verificationTrends,
        skillsGapAnalysis,
      };

      res.status(200).json({
        success: true,
        data: analyticsData,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/skills/:id
// @desc    Update skill information
// @access  Private (Creator or Admin)
router.put("/:id", async (req, res, next) => {
  try {
    const skill = await SkillVerification.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Check permission
    const isCreator =
      skill.createdBy && skill.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this skill",
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      "name",
      "description",
      "tags",
      "level",
      "assessmentCriteria",
    ];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedSkill = await SkillVerification.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("createdBy", "name title organization");

    res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      data: updatedSkill,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/skills/:id
// @desc    Delete a skill
// @access  Private (Creator or Admin)
router.delete("/:id", async (req, res, next) => {
  try {
    const skill = await SkillVerification.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Check permission
    const isCreator =
      skill.createdBy && skill.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this skill",
      });
    }

    await SkillVerification.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

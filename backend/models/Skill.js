const mongoose = require("mongoose");

const skillVerificationSchema = new mongoose.Schema(
  {
    // User and Skill Information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillName: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      required: true,
    },

    // Verification Method
    verificationType: {
      type: String,
      enum: [
        "certificate",
        "assessment",
        "portfolio",
        "reference",
        "interview",
      ],
      required: true,
    },

    // Evidence/Documentation
    evidence: [
      {
        type: {
          type: String,
          enum: [
            "certificate",
            "transcript",
            "project",
            "portfolio",
            "reference-letter",
            "assessment-result",
          ],
        },
        name: String,
        description: String,
        public_id: String,
        url: String,
        fileName: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Certificate Information (if applicable)
    certificate: {
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date,
      credentialId: String,
      verificationUrl: String,
    },

    // Assessment Results (if applicable)
    assessment: {
      score: Number,
      maxScore: Number,
      percentage: Number,
      assessmentDate: Date,
      assessorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      notes: String,
    },

    // Reference Information (if applicable)
    reference: {
      refereeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      refereeName: String,
      refereeTitle: String,
      refereeCompany: String,
      refereeEmail: String,
      refereePhone: String,
      relationship: String,
      yearsKnown: Number,
      comments: String,
      contactedAt: Date,
      responseReceived: Boolean,
    },

    // Verification Status
    status: {
      type: String,
      enum: ["pending", "under-review", "approved", "rejected", "expired"],
      default: "pending",
    },

    // Reviewer Information
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    reviewNotes: String,

    // Verification Result
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDate: Date,
    expiryDate: Date, // When verification expires

    // Additional Information
    industry: String,
    category: {
      type: String,
      enum: [
        "technical",
        "soft-skills",
        "language",
        "certification",
        "tool-proficiency",
        "other",
      ],
    },

    // Rejection Information
    rejectionReason: String,
    rejectionDetails: String,

    // Resubmission
    isResubmission: {
      type: Boolean,
      default: false,
    },
    originalSubmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkillVerification",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
skillVerificationSchema.index({ user: 1, status: 1 });
skillVerificationSchema.index({ skillName: 1 });
skillVerificationSchema.index({ status: 1, createdAt: -1 });
skillVerificationSchema.index({ reviewedBy: 1 });
skillVerificationSchema.index({ expiryDate: 1 });

// Virtual for verification badge level
skillVerificationSchema.virtual("badgeLevel").get(function () {
  if (!this.isVerified) return null;

  const scoreBasedLevel = {
    expert: "gold",
    advanced: "silver",
    intermediate: "bronze",
    beginner: "basic",
  };

  return scoreBasedLevel[this.level] || "basic";
});

// Method to approve verification
skillVerificationSchema.methods.approve = function (reviewerId, notes) {
  this.status = "approved";
  this.isVerified = true;
  this.verificationDate = new Date();
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;

  // Set expiry date (2 years from now)
  this.expiryDate = new Date();
  this.expiryDate.setFullYear(this.expiryDate.getFullYear() + 2);

  return this.save();
};

// Method to reject verification
skillVerificationSchema.methods.reject = function (
  reviewerId,
  reason,
  details
) {
  this.status = "rejected";
  this.isVerified = false;
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.rejectionReason = reason;
  this.rejectionDetails = details;

  return this.save();
};

// Method to check if verification is expired
skillVerificationSchema.methods.isExpired = function () {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
};

// Static method to get verification statistics
skillVerificationSchema.statics.getVerificationStats = function (
  timeframe = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

module.exports = mongoose.model("SkillVerification", skillVerificationSchema);

// RTB Graduate Tracking Schema
const rtbGraduateSchema = new mongoose.Schema(
  {
    // Graduate Information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Academic Information
    program: {
      type: String,
      required: true,
    },
    institution: {
      type: String,
      required: true,
    },
    graduationYear: {
      type: Number,
      required: true,
    },
    studentId: String,
    gpa: Number,
    finalGrade: String,

    // Employment Tracking
    employmentStatus: {
      type: String,
      enum: [
        "employed",
        "seeking",
        "unemployed",
        "further-study",
        "entrepreneur",
      ],
      required: true,
    },
    employmentHistory: [
      {
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        isCurrent: Boolean,
        salary: {
          amount: Number,
          currency: String,
          period: String,
        },
        location: {
          city: String,
          country: String,
        },
        isInternational: Boolean,
        employmentType: {
          type: String,
          enum: ["full-time", "part-time", "contract", "internship"],
        },
      },
    ],

    // Skills Assessment
    skillsAssessment: [
      {
        skillName: String,
        levelAtGraduation: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
        },
        currentLevel: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
        },
        isMarketRelevant: Boolean,
        demandLevel: {
          type: String,
          enum: ["high", "medium", "low"],
        },
        lastAssessed: Date,
      },
    ],

    // Skills Gaps Analysis
    skillsGaps: [
      {
        skillName: String,
        importance: {
          type: String,
          enum: ["critical", "important", "nice-to-have"],
        },
        availableTraining: Boolean,
        identifiedDate: Date,
      },
    ],

    // Career Development
    careerGoals: [String],
    mentorshipNeeds: {
      needed: Boolean,
      areas: [String],
      preferredMentorProfile: String,
    },

    // International Mobility
    internationalInterest: {
      interested: Boolean,
      targetCountries: [String],
      barriers: [String],
      visaStatus: String,
    },

    // Follow-up Information
    lastContactDate: Date,
    contactMethod: {
      type: String,
      enum: ["phone", "email", "in-person", "survey", "linkedin"],
    },
    responseRate: Number, // percentage of surveys/contacts responded to

    // RTB Program Feedback
    programFeedback: {
      overallSatisfaction: {
        type: Number,
        min: 1,
        max: 5,
      },
      curriculumRelevance: {
        type: Number,
        min: 1,
        max: 5,
      },
      industryPreparation: {
        type: Number,
        min: 1,
        max: 5,
      },
      suggestions: [String],
      wouldRecommend: Boolean,
    },

    // Tracking Flags
    isActivelyTracked: {
      type: Boolean,
      default: true,
    },
    trackingConsent: {
      type: Boolean,
      default: true,
    },
    dataRetentionExpiry: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
rtbGraduateSchema.index({ user: 1 });
rtbGraduateSchema.index({ graduationYear: 1 });
rtbGraduateSchema.index({ program: 1 });
rtbGraduateSchema.index({ employmentStatus: 1 });
rtbGraduateSchema.index({ "employmentHistory.isCurrent": 1 });

// Method to update employment status
rtbGraduateSchema.methods.updateEmploymentStatus = function (
  newStatus,
  employmentDetails
) {
  this.employmentStatus = newStatus;

  if (employmentDetails && newStatus === "employed") {
    // End previous current employment
    this.employmentHistory.forEach((emp) => {
      if (emp.isCurrent) {
        emp.isCurrent = false;
        emp.endDate = new Date();
      }
    });

    // Add new employment
    this.employmentHistory.push({
      ...employmentDetails,
      isCurrent: true,
      startDate: employmentDetails.startDate || new Date(),
    });
  }

  this.lastContactDate = new Date();
  return this.save();
};

// Static method to get employment statistics by year
rtbGraduateSchema.statics.getEmploymentStatsByYear = function (year) {
  return this.aggregate([
    { $match: { graduationYear: year } },
    {
      $group: {
        _id: "$employmentStatus",
        count: { $sum: 1 },
      },
    },
  ]);
};

// Static method to get skills gap analysis
rtbGraduateSchema.statics.getSkillsGapAnalysis = function () {
  return this.aggregate([
    { $unwind: "$skillsGaps" },
    {
      $group: {
        _id: "$skillsGaps.skillName",
        count: { $sum: 1 },
        criticalCount: {
          $sum: {
            $cond: [{ $eq: ["$skillsGaps.importance", "critical"] }, 1, 0],
          },
        },
      },
    },
    { $sort: { criticalCount: -1, count: -1 } },
  ]);
};

module.exports.RTBGraduate = mongoose.model("RTBGraduate", rtbGraduateSchema);

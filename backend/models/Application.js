const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // Core References
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Application Content
    coverLetter: {
      type: String,
      maxlength: [2000, "Cover letter cannot exceed 2000 characters"],
    },
    resume: {
      public_id: String,
      url: String,
      fileName: String,
    },
    portfolio: {
      url: String,
      description: String,
    },

    // Additional Documents
    additionalDocuments: [
      {
        name: String,
        public_id: String,
        url: String,
        type: {
          type: String,
          enum: [
            "certificate",
            "transcript",
            "recommendation",
            "portfolio",
            "other",
          ],
        },
      },
    ],

    // Application Status
    status: {
      type: String,
      enum: [
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
        "withdrawn",
      ],
      default: "submitted",
    },

    // Interview Information
    interviews: [
      {
        type: {
          type: String,
          enum: ["phone", "video", "in-person", "technical", "panel"],
          default: "video",
        },
        scheduledDate: Date,
        duration: Number, // in minutes
        location: String,
        meetingLink: String,
        interviewer: {
          name: String,
          title: String,
          email: String,
        },
        status: {
          type: String,
          enum: ["scheduled", "completed", "cancelled", "rescheduled"],
          default: "scheduled",
        },
        feedback: String,
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        notes: String,
      },
    ],

    // Feedback and Notes
    employerFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comments: String,
      strengths: [String],
      areasForImprovement: [String],
      overallImpression: String,
    },

    // Internal Notes (only visible to employer)
    internalNotes: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Communication History
    messages: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        to: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        subject: String,
        message: String,
        sentAt: {
          type: Date,
          default: Date.now,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Salary Negotiation
    salaryNegotiation: {
      applicantExpectation: {
        min: Number,
        max: Number,
        currency: String,
        isNegotiable: Boolean,
      },
      employerOffer: {
        amount: Number,
        currency: String,
        benefits: [String],
        startDate: Date,
        isCounterOffer: Boolean,
      },
      finalAgreedSalary: {
        amount: Number,
        currency: String,
        benefits: [String],
      },
    },

    // Matching Score (calculated)
    matchingScore: {
      overall: Number,
      skillsMatch: Number,
      experienceMatch: Number,
      educationMatch: Number,
      locationMatch: Number,
    },

    // Tracking Information
    source: {
      type: String,
      enum: ["direct", "job-board", "referral", "social-media", "career-fair"],
      default: "direct",
    },
    referralSource: String,

    // Withdrawal Information
    withdrawnBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    withdrawalReason: String,
    withdrawnAt: Date,

    // Follow-up Information
    followUpReminders: [
      {
        scheduledDate: Date,
        type: {
          type: String,
          enum: [
            "interview-feedback",
            "decision-update",
            "reference-check",
            "offer-follow-up",
          ],
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ employer: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ "matchingScore.overall": -1 });

// Virtual for job details
applicationSchema.virtual("jobDetails", {
  ref: "Job",
  localField: "job",
  foreignField: "_id",
  justOne: true,
});

// Virtual for applicant details
applicationSchema.virtual("applicantDetails", {
  ref: "User",
  localField: "applicant",
  foreignField: "_id",
  justOne: true,
});

// Pre-save middleware to calculate matching score
applicationSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Populate job and applicant for matching calculation
      await this.populate(["job", "applicant"]);

      if (this.job && this.applicant) {
        this.matchingScore = this.calculateMatchingScore();
      }
    } catch (error) {
      console.error("Error calculating matching score:", error);
    }
  }
  next();
});

// Method to calculate matching score
applicationSchema.methods.calculateMatchingScore = function () {
  if (!this.job || !this.applicant) return { overall: 0 };

  let skillsMatch = 0;
  let experienceMatch = 0;
  let educationMatch = 0;
  let locationMatch = 0;

  // Skills matching
  if (this.job.skills && this.applicant.skills) {
    const jobSkills = this.job.skills.map((s) => s.name.toLowerCase());
    const applicantSkills = this.applicant.skills.map((s) =>
      s.name.toLowerCase()
    );
    const matchingSkills = jobSkills.filter((skill) =>
      applicantSkills.includes(skill)
    );
    skillsMatch = (matchingSkills.length / jobSkills.length) * 100;
  }

  // Experience matching
  const jobExperience = this.job.experienceRequired?.min || 0;
  const applicantExperience = this.applicant.experience?.length || 0;
  if (jobExperience === 0) {
    experienceMatch = 100;
  } else {
    experienceMatch = Math.min(
      (applicantExperience / jobExperience) * 100,
      100
    );
  }

  // Education matching
  const jobEducation = this.job.educationRequired?.level;
  const applicantEducation = this.applicant.education?.[0]?.degree;
  if (!jobEducation || jobEducation === "any") {
    educationMatch = 100;
  } else if (applicantEducation) {
    // Simple matching - can be improved with education level hierarchy
    educationMatch = applicantEducation
      .toLowerCase()
      .includes(jobEducation.toLowerCase())
      ? 100
      : 50;
  }

  // Location matching
  const jobCountry = this.job.location?.country;
  const applicantCountry = this.applicant.location?.country;
  if (this.job.location?.isRemote) {
    locationMatch = 100;
  } else if (jobCountry && applicantCountry) {
    locationMatch =
      jobCountry.toLowerCase() === applicantCountry.toLowerCase() ? 100 : 30;
  }

  // Calculate overall score (weighted average)
  const overall =
    skillsMatch * 0.4 +
    experienceMatch * 0.3 +
    educationMatch * 0.2 +
    locationMatch * 0.1;

  return {
    overall: Math.round(overall),
    skillsMatch: Math.round(skillsMatch),
    experienceMatch: Math.round(experienceMatch),
    educationMatch: Math.round(educationMatch),
    locationMatch: Math.round(locationMatch),
  };
};

// Method to update status with validation
applicationSchema.methods.updateStatus = function (newStatus, updatedBy) {
  const validTransitions = {
    submitted: ["under-review", "rejected", "withdrawn"],
    "under-review": ["shortlisted", "rejected", "interview-scheduled"],
    shortlisted: ["interview-scheduled", "rejected", "offer-made"],
    "interview-scheduled": ["interview-completed", "rejected", "cancelled"],
    "interview-completed": [
      "second-interview",
      "reference-check",
      "offer-made",
      "rejected",
    ],
    "second-interview": ["offer-made", "rejected", "reference-check"],
    "reference-check": ["offer-made", "rejected"],
    "offer-made": ["offer-accepted", "offer-declined"],
    "offer-accepted": ["hired"],
    "offer-declined": ["rejected"],
    hired: [],
    rejected: [],
    withdrawn: [],
  };

  const currentStatus = this.status;
  const allowedTransitions = validTransitions[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${currentStatus} to ${newStatus}`
    );
  }

  this.status = newStatus;

  // Add internal note about status change
  this.internalNotes.push({
    note: `Status changed from ${currentStatus} to ${newStatus}`,
    addedBy: updatedBy,
    addedAt: new Date(),
  });

  return this.save();
};

// Static method to get application statistics
applicationSchema.statics.getApplicationStats = function (
  employerId,
  timeframe = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);

  return this.aggregate([
    {
      $match: {
        employer: mongoose.Types.ObjectId(employerId),
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

module.exports = mongoose.model("Application", applicationSchema);

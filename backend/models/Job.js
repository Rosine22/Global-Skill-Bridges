import { Schema, model } from "mongoose";

const jobSchema = new Schema(
  {
    // Basic Job Information
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [200, "Job title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    // Company Information
    employer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
    },

    // Location Information
    location: {
      city: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      address: String,
      isRemote: {
        type: Boolean,
        default: false,
      },
      remoteType: {
        type: String,
        enum: ["fully-remote", "hybrid", "on-site"],
        default: "on-site",
      },
    },

    // Job Details
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "temporary"],
      default: "full-time",
    },
    category: {
      type: String,
      enum: [
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
      ],
      required: true,
    },
    level: {
      type: String,
      enum: ["entry", "junior", "mid", "senior", "lead", "executive"],
      default: "entry",
    },

    // Requirements
    requirements: [
      {
        type: String,
        required: true,
      },
    ],
    skills: [
      {
        name: {
          type: String,
          required: true,
        },
        level: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
          default: "intermediate",
        },
        isRequired: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // Experience Requirements
    experienceRequired: {
      min: {
        type: Number,
        default: 0,
      },
      max: Number,
      unit: {
        type: String,
        enum: ["months", "years"],
        default: "years",
      },
    },

    // Education Requirements
    educationRequired: {
      level: {
        type: String,
        enum: [
          "high-school",
          "diploma",
          "bachelor",
          "master",
          "phd",
          "certificate",
          "any",
        ],
        default: "diploma",
      },
      field: String,
    },

    // Compensation
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: "USD",
      },
      period: {
        type: String,
        enum: ["hourly", "monthly", "yearly"],
        default: "yearly",
      },
      isNegotiable: {
        type: Boolean,
        default: true,
      },
      showRange: {
        type: Boolean,
        default: true,
      },
    },

    // Benefits
    benefits: [
      {
        type: String,
        enum: [
          "health-insurance",
          "dental-insurance",
          "vision-insurance",
          "retirement-plan",
          "paid-time-off",
          "flexible-hours",
          "remote-work",
          "professional-development",
          "gym-membership",
          "free-meals",
          "transportation",
          "visa-sponsorship",
          "relocation-assistance",
          "other",
        ],
      },
    ],
    customBenefits: [String],

    // Application Details
    applicationDeadline: Date,
    startDate: Date,
    applicationMethod: {
      type: String,
      enum: ["platform", "email", "website"],
      default: "platform",
    },
    externalUrl: String,
    contactEmail: String,

    // Job Status
    status: {
      type: String,
      enum: ["draft", "active", "paused", "closed", "expired"],
      default: "draft",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    urgent: {
      type: Boolean,
      default: false,
    },

    // Analytics
    views: {
      type: Number,
      default: 0,
    },
    applications: {
      type: Number,
      default: 0,
    },

    // SEO and Metadata
    slug: String,
    tags: [String],

    // Verification (for compliance)
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verificationDate: Date,

    // Archive Information
    archivedAt: Date,
    archivedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ employer: 1 });
jobSchema.index({ "location.country": 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ "skills.name": 1 });
jobSchema.index({ title: "text", description: "text", company: "text" });
jobSchema.index({ applicationDeadline: 1 });
jobSchema.index({ featured: -1, createdAt: -1 });

// Virtual for application count from Application model
jobSchema.virtual("applicationCount", {
  ref: "Application",
  localField: "_id",
  foreignField: "job",
  count: true,
});

// Virtual for recent applications
jobSchema.virtual("recentApplications", {
  ref: "Application",
  localField: "_id",
  foreignField: "job",
  options: {
    sort: { createdAt: -1 },
    limit: 5,
  },
});

// Pre-save middleware to generate slug
jobSchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-")
      .trim("-");
  }
  next();
});

// Method to check if job is expired
jobSchema.methods.isExpired = function () {
  if (!this.applicationDeadline) return false;
  return new Date() > this.applicationDeadline;
};

// Method to get formatted salary
jobSchema.methods.getFormattedSalary = function () {
  if (!this.salary || (!this.salary.min && !this.salary.max)) {
    return "Salary not specified";
  }

  const currency = this.salary.currency || "USD";
  const period = this.salary.period || "yearly";

  if (this.salary.min && this.salary.max) {
    return `${currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()} per ${period}`;
  } else if (this.salary.min) {
    return `${currency} ${this.salary.min.toLocaleString()}+ per ${period}`;
  } else if (this.salary.max) {
    return `Up to ${currency} ${this.salary.max.toLocaleString()} per ${period}`;
  }
};

// Method to increment views
jobSchema.methods.incrementViews = function () {
  this.views = (this.views || 0) + 1;
  return this.save();
};

// Static method to find jobs by skills
jobSchema.statics.findBySkills = function (skills) {
  return this.find({
    "skills.name": { $in: skills },
    status: "active",
    $or: [
      { applicationDeadline: { $gte: new Date() } },
      { applicationDeadline: null },
    ],
  });
};

// Static method to find featured jobs
jobSchema.statics.findFeatured = function (limit = 10) {
  return this.find({
    featured: true,
    status: "active",
    $or: [
      { applicationDeadline: { $gte: new Date() } },
      { applicationDeadline: null },
    ],
  })
    .populate("employer", "name companyInfo.name")
    .sort({ createdAt: -1 })
    .limit(limit);
};

export default model("Job", jobSchema);

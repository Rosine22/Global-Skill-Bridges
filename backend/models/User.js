const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      enum: ["job-seeker", "employer", "mentor", "admin", "rtb-admin"],
      default: "job-seeker",
    },
    avatar: {
      public_id: String,
      url: String,
    },

    // Profile Information
    phone: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number"],
    },
    location: {
      city: String,
      country: String,
      address: String,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },

    // Professional Information (Job Seekers & Mentors)
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startDate: Date,
        endDate: Date,
        isCompleted: Boolean,
        grade: String,
      },
    ],
    experience: [
      {
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        isCurrent: Boolean,
        description: String,
        location: String,
      },
    ],
    skills: [
      {
        name: String,
        level: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
        },
        isVerified: {
          type: Boolean,
          default: false,
        },
        verifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        verificationDate: Date,
        certificates: [
          {
            name: String,
            issuer: String,
            issueDate: Date,
            expiryDate: Date,
            credentialId: String,
            url: String,
          },
        ],
      },
    ],

    // Company Information (Employers)
    companyInfo: {
      name: String,
      industry: String,
      size: {
        type: String,
        enum: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
      },
      website: String,
      description: String,
      registrationNumber: String,
      establishedYear: Number,
    },

    // Mentor Specific Information
    mentorInfo: {
      specializations: [String],
      yearsOfExperience: Number,
      menteeCapacity: {
        type: Number,
        default: 5,
      },
      hourlyRate: Number,
      languages: [String],
      timeZone: String,
      availability: [
        {
          day: {
            type: String,
            enum: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
          },
          startTime: String,
          endTime: String,
        },
      ],
      biography: String,
      linkedInProfile: String,
      achievements: [String],
    },

    // RTB Graduate Information
    rtbInfo: {
      graduationYear: Number,
      program: String,
      institution: String,
      studentId: String,
      currentEmploymentStatus: {
        type: String,
        enum: ["employed", "seeking", "unemployed", "further-study"],
      },
      currentPosition: String,
      currentCompany: String,
      salaryRange: String,
      skillsGaps: [String],
      careerGoals: [String],
      needsMentorship: {
        type: Boolean,
        default: false,
      },
    },

    // Verification Status
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    isProfileVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: [
      {
        type: String,
        url: String,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
      },
    ],

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: function() {
        // Auto-approve all roles except employer
        return this.role !== 'employer';
      },
    },
    approvalDate: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    adminNotes: [
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
    lastLogin: Date,
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Social Links
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String,
    },

    // Preferences
    preferences: {
      jobAlerts: {
        type: Boolean,
        default: true,
      },
      mentorshipAlerts: {
        type: Boolean,
        default: true,
      },
      marketingEmails: {
        type: Boolean,
        default: false,
      },
      language: {
        type: String,
        default: "en",
      },
      currency: {
        type: String,
        default: "USD",
      },
    },

    // Reset Password
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Statistics
    stats: {
      jobsApplied: {
        type: Number,
        default: 0,
      },
      jobsPosted: {
        type: Number,
        default: 0,
      },
      mentoringSessions: {
        type: Number,
        default: 0,
      },
      profileViews: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ "location.country": 1 });
userSchema.index({ "skills.name": 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, isBlocked: 1 });

// Virtual for full name formatting
userSchema.virtual("fullName").get(function () {
  return this.name;
});

// Virtual for current active mentees (for mentors)
userSchema.virtual("activeMentees", {
  ref: "MentorshipRequest",
  localField: "_id",
  foreignField: "mentor",
  match: { status: "active" },
  count: true,
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to calculate profile completion
userSchema.methods.calculateProfileCompletion = function () {
  let completion = 0;
  const weights = {
    basicInfo: 20, // name, email, phone, location
    education: 15,
    experience: 20,
    skills: 20,
    avatar: 10,
    verification: 15,
  };

  // Basic info check
  if (this.name && this.email && this.phone && this.location.country) {
    completion += weights.basicInfo;
  }

  // Education check
  if (this.education && this.education.length > 0) {
    completion += weights.education;
  }

  // Experience check
  if (this.experience && this.experience.length > 0) {
    completion += weights.experience;
  }

  // Skills check
  if (this.skills && this.skills.length >= 3) {
    completion += weights.skills;
  }

  // Avatar check
  if (this.avatar && this.avatar.url) {
    completion += weights.avatar;
  }

  // Verification check
  if (this.isEmailVerified) {
    completion += weights.verification;
  }

  this.profileCompletion = Math.min(completion, 100);
  return this.profileCompletion;
};

// Method to generate reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);

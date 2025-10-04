const mongoose = require("mongoose");

const mentorshipRequestSchema = new mongoose.Schema(
  {
    // Core References
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Request Information
    field: {
      type: String,
      required: [true, "Mentorship field is required"],
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
        "career-guidance",
        "interview-preparation",
        "skill-development",
        "other",
      ],
    },

    // Request Details
    message: {
      type: String,
      required: [true, "Request message is required"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    goals: [String],
    timeCommitment: {
      type: String,
      enum: ["1-2-hours-week", "3-5-hours-week", "5-10-hours-week", "flexible"],
      default: "flexible",
    },
    duration: {
      type: String,
      enum: ["1-month", "3-months", "6-months", "1-year", "ongoing"],
      default: "3-months",
    },
    preferredMeetingType: {
      type: String,
      enum: ["video-call", "phone-call", "in-person", "messaging", "flexible"],
      default: "video-call",
    },

    // Status Management
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "declined",
        "active",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    // Response from Mentor
    mentorResponse: {
      message: String,
      acceptedAt: Date,
      declinedAt: Date,
      declineReason: String,
    },

    // Mentorship Plan (after acceptance)
    mentorshipPlan: {
      objectives: [String],
      milestones: [
        {
          title: String,
          description: String,
          targetDate: Date,
          isCompleted: {
            type: Boolean,
            default: false,
          },
          completedAt: Date,
        },
      ],
      meetingSchedule: {
        frequency: {
          type: String,
          enum: ["weekly", "bi-weekly", "monthly", "as-needed"],
        },
        dayOfWeek: String,
        timeOfDay: String,
        duration: Number, // in minutes
      },
    },

    // Session Tracking
    sessions: [
      {
        scheduledDate: Date,
        actualDate: Date,
        duration: Number, // in minutes
        type: {
          type: String,
          enum: ["video-call", "phone-call", "in-person", "messaging"],
          default: "video-call",
        },
        topics: [String],
        notes: String,
        menteeNotes: String,
        mentorNotes: String,
        status: {
          type: String,
          enum: ["scheduled", "completed", "cancelled", "no-show"],
          default: "scheduled",
        },
        meetingLink: String,
        recordings: [
          {
            url: String,
            duration: Number,
          },
        ],
      },
    ],

    // Progress Tracking
    progress: {
      overallProgress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      skillsImproved: [String],
      achievementsUnlocked: [String],
      certificationsEarned: [
        {
          name: String,
          issuer: String,
          earnedDate: Date,
          credentialUrl: String,
        },
      ],
    },

    // Feedback and Reviews
    feedback: {
      menteeToMentor: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
        skills: [
          {
            skill: String,
            rating: Number,
          },
        ],
        wouldRecommend: Boolean,
        submittedAt: Date,
      },
      mentorToMentee: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
        strengths: [String],
        areasForImprovement: [String],
        overallProgress: String,
        submittedAt: Date,
      },
    },

    // Communication Preferences
    communicationPreferences: {
      primaryChannel: {
        type: String,
        enum: ["platform-messaging", "email", "whatsapp", "telegram"],
        default: "platform-messaging",
      },
      responseTimeExpectation: {
        type: String,
        enum: ["immediate", "within-hours", "within-day", "within-week"],
        default: "within-day",
      },
    },

    // Completion Information
    completionInfo: {
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      completionReason: {
        type: String,
        enum: [
          "goals-achieved",
          "mutual-agreement",
          "time-expired",
          "mentee-request",
          "mentor-request",
        ],
      },
      completionNote: String,
      completedAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
mentorshipRequestSchema.index({ mentor: 1, status: 1 });
mentorshipRequestSchema.index({ mentee: 1, status: 1 });
mentorshipRequestSchema.index({ field: 1 });
mentorshipRequestSchema.index({ createdAt: -1 });
mentorshipRequestSchema.index({ status: 1, createdAt: -1 });

// Prevent duplicate active mentorship requests
mentorshipRequestSchema.index(
  { mentor: 1, mentee: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "accepted", "active"] },
    },
  }
);

// Virtual for total sessions count
mentorshipRequestSchema.virtual("totalSessions").get(function () {
  return this.sessions ? this.sessions.length : 0;
});

// Virtual for completed sessions count
mentorshipRequestSchema.virtual("completedSessions").get(function () {
  return this.sessions
    ? this.sessions.filter((s) => s.status === "completed").length
    : 0;
});

// Virtual for total mentorship duration
mentorshipRequestSchema.virtual("totalDuration").get(function () {
  if (!this.sessions) return 0;
  return this.sessions
    .filter((s) => s.status === "completed")
    .reduce((total, session) => total + (session.duration || 0), 0);
});

// Method to accept mentorship request
mentorshipRequestSchema.methods.acceptRequest = function (mentorResponse) {
  if (this.status !== "pending") {
    throw new Error("Only pending requests can be accepted");
  }

  this.status = "accepted";
  this.mentorResponse = {
    ...mentorResponse,
    acceptedAt: new Date(),
  };

  return this.save();
};

// Method to decline mentorship request
mentorshipRequestSchema.methods.declineRequest = function (
  declineReason,
  message
) {
  if (this.status !== "pending") {
    throw new Error("Only pending requests can be declined");
  }

  this.status = "declined";
  this.mentorResponse = {
    message,
    declineReason,
    declinedAt: new Date(),
  };

  return this.save();
};

// Method to start mentorship (after acceptance)
mentorshipRequestSchema.methods.startMentorship = function (plan) {
  if (this.status !== "accepted") {
    throw new Error("Mentorship must be accepted before starting");
  }

  this.status = "active";
  this.mentorshipPlan = plan;

  return this.save();
};

// Method to add session
mentorshipRequestSchema.methods.addSession = function (sessionData) {
  if (this.status !== "active") {
    throw new Error("Can only add sessions to active mentorships");
  }

  this.sessions.push(sessionData);
  return this.save();
};

// Method to update progress
mentorshipRequestSchema.methods.updateProgress = function (progressUpdate) {
  if (!this.progress) {
    this.progress = { overallProgress: 0 };
  }

  Object.assign(this.progress, progressUpdate);
  return this.save();
};

// Method to complete milestone
mentorshipRequestSchema.methods.completeMilestone = function (milestoneIndex) {
  if (this.mentorshipPlan && this.mentorshipPlan.milestones[milestoneIndex]) {
    this.mentorshipPlan.milestones[milestoneIndex].isCompleted = true;
    this.mentorshipPlan.milestones[milestoneIndex].completedAt = new Date();

    // Calculate overall progress based on completed milestones
    const completedMilestones = this.mentorshipPlan.milestones.filter(
      (m) => m.isCompleted
    ).length;
    const totalMilestones = this.mentorshipPlan.milestones.length;
    this.progress.overallProgress = Math.round(
      (completedMilestones / totalMilestones) * 100
    );
  }

  return this.save();
};

// Method to complete mentorship
mentorshipRequestSchema.methods.completeMentorship = function (completionData) {
  if (this.status !== "active") {
    throw new Error("Only active mentorships can be completed");
  }

  this.status = "completed";
  this.completionInfo = {
    ...completionData,
    completedAt: new Date(),
  };

  return this.save();
};

// Static method to get mentor statistics
mentorshipRequestSchema.statics.getMentorStats = function (mentorId) {
  return this.aggregate([
    { $match: { mentor: mongoose.Types.ObjectId(mentorId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

// Static method to find active mentorships for user
mentorshipRequestSchema.statics.findActiveMentorships = function (userId) {
  return this.find({
    $or: [
      { mentor: userId, status: "active" },
      { mentee: userId, status: "active" },
    ],
  })
    .populate("mentor", "name avatar mentorInfo")
    .populate("mentee", "name avatar");
};

module.exports = mongoose.model("MentorshipRequest", mentorshipRequestSchema);

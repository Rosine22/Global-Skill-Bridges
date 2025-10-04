const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Participants
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Message Content
    subject: {
      type: String,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      maxlength: [5000, "Message content cannot exceed 5000 characters"],
    },

    // Message Type
    type: {
      type: String,
      enum: [
        "direct",
        "job-application",
        "mentorship",
        "system",
        "notification",
      ],
      default: "direct",
    },

    // Related Objects (for context)
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
    relatedMentorship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MentorshipRequest",
    },

    // Attachments
    attachments: [
      {
        fileName: String,
        originalName: String,
        fileSize: Number,
        mimeType: String,
        public_id: String,
        url: String,
      },
    ],

    // Status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,

    // Threading (for conversations)
    threadId: {
      type: String,
      index: true,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    // Flags
    isImportant: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        deletedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
messageSchema.index({ threadId: 1, createdAt: 1 });
messageSchema.index({ type: 1 });

// Virtual for conversation partner (from perspective of current user)
messageSchema.virtual("conversationPartner").get(function () {
  // This would be set based on the current user context
  return this.sender.equals(this.currentUserId) ? this.recipient : this.sender;
});

// Method to mark as read
messageSchema.methods.markAsRead = function (userId) {
  if (this.recipient.equals(userId) && !this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to delete for user
messageSchema.methods.deleteForUser = function (userId) {
  const existingDeletion = this.deletedBy.find((d) => d.user.equals(userId));

  if (!existingDeletion) {
    this.deletedBy.push({
      user: userId,
      deletedAt: new Date(),
    });
  }

  // If both sender and recipient deleted, mark as deleted
  if (this.deletedBy.length >= 2) {
    this.isDeleted = true;
  }

  return this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = function (user1, user2, options = {}) {
  const { page = 1, limit = 50 } = options;

  return this.find({
    $or: [
      { sender: user1, recipient: user2 },
      { sender: user2, recipient: user1 },
    ],
    "deletedBy.user": { $nin: [user1] },
    isDeleted: false,
  })
    .populate("sender", "name avatar")
    .populate("recipient", "name avatar")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

// Static method to get user's conversations list
messageSchema.statics.getUserConversations = function (userId, options = {}) {
  const { page = 1, limit = 20 } = options;

  return this.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { recipient: userId }],
        "deletedBy.user": { $ne: userId },
        isDeleted: false,
      },
    },
    {
      $addFields: {
        conversationPartner: {
          $cond: {
            if: { $eq: ["$sender", userId] },
            then: "$recipient",
            else: "$sender",
          },
        },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: "$conversationPartner",
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$recipient", userId] },
                  { $eq: ["$isRead", false] },
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
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "partnerInfo",
      },
    },
    {
      $unwind: "$partnerInfo",
    },
    {
      $sort: { "lastMessage.createdAt": -1 },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);
};

module.exports = mongoose.model("Message", messageSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema(
  {
    // Recipient
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Notification Content
    title: {
      type: String,
      required: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },

    // Notification Type
    type: {
      type: String,
      enum: [
        "job-alert",
        "application-status",
        "interview-scheduled",
        "mentorship-request",
        "mentorship-accepted",
        "session-reminder",
        "skill-verification",
        "system-announcement",
        "message-received",
        "profile-view",
        "job-recommendation",
      ],
      required: true,
    },

    // Related Objects
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
    relatedMentorship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MentorshipRequest",
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Action Information
    actionUrl: String, // URL to navigate when notification is clicked
    actionText: String, // Text for action button (e.g., "View Application", "Schedule Interview")

    // Status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,

    // Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Delivery Information
    deliveryMethods: [
      {
        method: {
          type: String,
          enum: ["in-app", "email", "sms", "push"],
        },
        delivered: {
          type: Boolean,
          default: false,
        },
        deliveredAt: Date,
        error: String,
      },
    ],

    // Expiry
    expiresAt: Date,

    // Grouping (for similar notifications)
    groupKey: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ groupKey: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to create and send notification
notificationSchema.statics.createNotification = async function (
  notificationData
) {
  const notification = new this(notificationData);
  await notification.save();

  // Here you would integrate with push notification service, email service, etc.
  // For now, we'll just save to database

  return notification;
};

// Static method to get user's unread count
notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    user: userId,
    isRead: false,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  });
};

module.exports.Notification = mongoose.model(
  "Notification",
  notificationSchema
);

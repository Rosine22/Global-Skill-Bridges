const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job').default;
const Application = require('../models/Application');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All notification routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieve all notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Filter for unread notifications only
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [application_update, message, job_match, mentorship_request]
 *         description: Filter by notification type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of notifications to return
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       type:
 *                         type: string
 *                         example: "application_update"
 *                       title:
 *                         type: string
 *                         example: "Application Status Update"
 *                       message:
 *                         type: string
 *                         example: "Your application has been reviewed"
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { type, read } = req.query;

    // Build notification filter
    const filter = { recipient: req.user._id };
    
    if (type) {
      filter.type = type;
    }
    
    if (read !== undefined) {
      filter.read = read === 'true';
    }

    // Get notifications from user's notifications array
    const user = await User.findById(req.user._id);
    let notifications = user.notifications || [];

    // Apply filters
    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }
    
    if (read !== undefined) {
      notifications = notifications.filter(n => n.read === (read === 'true'));
    }

    // Sort by creation date (newest first)
    notifications.sort((a, b) => b.createdAt - a.createdAt);

    // Apply pagination
    const paginatedNotifications = notifications.slice(skip, skip + limit);

    // Populate referenced data for each notification
    const populatedNotifications = await Promise.all(
      paginatedNotifications.map(async (notification) => {
        const populatedNotification = { ...notification.toObject() };

        try {
          // Populate sender information
          if (notification.data?.senderId) {
            const sender = await User.findById(notification.data.senderId)
              .select('name avatar role');
            populatedNotification.sender = sender;
          }

          // Populate job information
          if (notification.data?.jobId) {
            const job = await Job.findById(notification.data.jobId)
              .select('title company location status')
              .populate('company', 'name logo');
            populatedNotification.job = job;
          }

          // Populate application information
          if (notification.data?.applicationId) {
            const application = await Application.findById(notification.data.applicationId)
              .select('status createdAt')
              .populate('job', 'title company')
              .populate('applicant', 'name avatar');
            populatedNotification.application = application;
          }

        } catch (populateError) {
          console.error('Error populating notification:', populateError);
        }

        return populatedNotification;
      })
    );

    const total = notifications.length;

    res.status(200).json({
      success: true,
      count: paginatedNotifications.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: populatedNotifications
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/mark-read
// @desc    Mark notifications as read
// @access  Private
router.post('/mark-read', async (req, res, next) => {
  try {
    const { notificationIds } = req.body; // Array of notification IDs

    const user = await User.findById(req.user._id);

    if (!notificationIds || notificationIds.length === 0) {
      // Mark all notifications as read
      user.notifications.forEach(notification => {
        if (!notification.read) {
          notification.read = true;
          notification.readAt = new Date();
        }
      });
    } else {
      // Mark specific notifications as read
      notificationIds.forEach(notificationId => {
        const notification = user.notifications.id(notificationId);
        if (notification && !notification.read) {
          notification.read = true;
          notification.readAt = new Date();
        }
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications/:notificationId
// @desc    Delete a notification
// @access  Private
router.delete('/:notificationId', async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const user = await User.findById(req.user._id);
    const notification = user.notifications.id(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    user.notifications.pull(notificationId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const unreadCount = user.notifications.filter(n => !n.read).length;

    // Get unread count by type
    const unreadByType = user.notifications.reduce((acc, notification) => {
      if (!notification.read) {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
      }
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        totalUnread: unreadCount,
        unreadByType
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/preferences
// @desc    Update notification preferences
// @access  Private
router.post('/preferences', async (req, res, next) => {
  try {
    const {
      emailNotifications,
      pushNotifications,
      jobAlerts,
      applicationUpdates,
      mentorshipAlerts,
      messageAlerts,
      marketingEmails
    } = req.body;

    const preferences = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      pushNotifications: pushNotifications !== undefined ? pushNotifications : true,
      jobAlerts: jobAlerts !== undefined ? jobAlerts : true,
      applicationUpdates: applicationUpdates !== undefined ? applicationUpdates : true,
      mentorshipAlerts: mentorshipAlerts !== undefined ? mentorshipAlerts : true,
      messageAlerts: messageAlerts !== undefined ? messageAlerts : true,
      marketingEmails: marketingEmails !== undefined ? marketingEmails : false
    };

    await User.findByIdAndUpdate(
      req.user._id,
      { 'preferences.notifications': preferences },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: preferences
    });
  } catch (error) {
    next(error);
  }
});

// Utility function to create notifications (used by other routes)
const createNotification = async (recipientId, type, title, message, data = {}) => {
  try {
    const user = await User.findById(recipientId);
    if (!user) return false;

    const notification = {
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date()
    };

    user.notifications.push(notification);

    // Keep only last 100 notifications per user
    if (user.notifications.length > 100) {
      user.notifications = user.notifications.slice(-100);
    }

    await user.save();

    // TODO: Send push notification if user has enabled it
    // TODO: Send email notification if user has enabled it

    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

// Notification helper functions for different types
const NotificationHelpers = {
  // Job-related notifications
  async notifyJobApplication(applicantId, employerId, jobId, applicationId) {
    await Promise.all([
      // Notify applicant
      createNotification(
        applicantId,
        'application-submitted',
        'Application Submitted',
        'Your job application has been submitted successfully',
        { jobId, applicationId }
      ),
      // Notify employer
      createNotification(
        employerId,
        'new-application',
        'New Job Application',
        'You have received a new job application',
        { jobId, applicationId, senderId: applicantId }
      )
    ]);
  },

  async notifyApplicationUpdate(applicantId, status, jobId, applicationId, employerId) {
    const statusMessages = {
      'under-review': 'Your application is now under review',
      'interview-scheduled': 'Congratulations! An interview has been scheduled',
      'interview-completed': 'Your interview has been completed',
      'offer-extended': 'Congratulations! You have received a job offer',
      'hired': 'Congratulations! You have been hired',
      'rejected': 'Your application has been reviewed'
    };

    await createNotification(
      applicantId,
      'application-update',
      'Application Status Update',
      statusMessages[status] || 'Your application status has been updated',
      { jobId, applicationId, status, senderId: employerId }
    );
  },

  // Message notifications
  async notifyNewMessage(senderId, recipientId, messageId) {
    const sender = await User.findById(senderId).select('name');
    
    await createNotification(
      recipientId,
      'new-message',
      'New Message',
      `You have a new message from ${sender.name}`,
      { messageId, senderId }
    );
  },

  // Mentorship notifications
  async notifyMentorshipRequest(mentorId, menteeId, requestId) {
    const mentee = await User.findById(menteeId).select('name');
    
    await createNotification(
      mentorId,
      'mentorship-request',
      'New Mentorship Request',
      `${mentee.name} has requested mentorship from you`,
      { requestId, senderId: menteeId }
    );
  },

  async notifyMentorshipUpdate(menteeId, status, requestId, mentorId) {
    const statusMessages = {
      'accepted': 'Your mentorship request has been accepted!',
      'rejected': 'Your mentorship request has been declined',
      'completed': 'Your mentorship program has been completed'
    };

    await createNotification(
      menteeId,
      'mentorship-update',
      'Mentorship Status Update',
      statusMessages[status] || 'Your mentorship status has been updated',
      { requestId, status, senderId: mentorId }
    );
  },

  // System notifications
  async notifySystemUpdate(userId, title, message, data = {}) {
    await createNotification(
      userId,
      'system-update',
      title,
      message,
      data
    );
  },

  async notifySkillVerification(userId, skillId, status, verifierId) {
    const statusMessages = {
      'verified': 'Your skill has been verified!',
      'rejected': 'Your skill verification was not approved'
    };

    await createNotification(
      userId,
      'skill-verification',
      'Skill Verification Update',
      statusMessages[status] || 'Your skill verification status has been updated',
      { skillId, status, senderId: verifierId }
    );
  }
};

// Export notification helpers for use in other routes
module.exports = router;
module.exports.NotificationHelpers = NotificationHelpers;
module.exports.createNotification = createNotification;
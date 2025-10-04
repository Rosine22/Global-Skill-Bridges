const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// All message routes require authentication
router.use(protect);

// @route   GET /api/messages/conversations
// @desc    Get all conversations for the current user
// @access  Private
router.get('/conversations', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get unique conversations where user is participant
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      {
        $addFields: {
          conversationWith: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$recipient',
              '$sender'
            ]
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationWith',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', req.user._id] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalMessages: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'conversationPartner'
        }
      },
      {
        $unwind: '$conversationPartner'
      },
      {
        $project: {
          conversationWith: {
            _id: '$conversationPartner._id',
            name: '$conversationPartner.name',
            email: '$conversationPartner.email',
            avatar: '$conversationPartner.avatar',
            role: '$conversationPartner.role',
            isOnline: '$conversationPartner.isOnline',
            lastSeen: '$conversationPartner.lastSeen'
          },
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.content',
            messageType: '$lastMessage.messageType',
            createdAt: '$lastMessage.createdAt',
            read: '$lastMessage.read',
            sender: '$lastMessage.sender',
            recipient: '$lastMessage.recipient'
          },
          unreadCount: 1,
          totalMessages: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    // Get total conversation count
    const totalConversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      {
        $addFields: {
          conversationWith: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$recipient',
              '$sender'
            ]
          }
        }
      },
      {
        $group: {
          _id: '$conversationWith'
        }
      },
      {
        $count: 'total'
      }
    ]);

    const total = totalConversations[0]?.total || 0;

    res.status(200).json({
      success: true,
      count: conversations.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/messages/conversation/:userId
// @desc    Get messages in conversation with specific user
// @access  Private
router.get('/conversation/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify the other user exists
    const otherUser = await User.findById(userId).select('name email avatar role isOnline lastSeen');
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get messages between current user and specified user
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    })
    .populate('sender', 'name avatar')
    .populate('recipient', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Mark messages as read where current user is recipient
    await Message.updateMany(
      {
        sender: userId,
        recipient: req.user._id,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    // Get total message count
    const total = await Message.countDocuments({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    });

    // Reverse messages to show oldest first (after pagination)
    const reversedMessages = messages.reverse();

    res.status(200).json({
      success: true,
      count: reversedMessages.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        messages: reversedMessages,
        conversationWith: otherUser
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/send
// @desc    Send a new message
// @access  Private
router.post('/send', [
  body('recipient').isMongoId().withMessage('Valid recipient ID is required'),
  body('content').notEmpty().trim().withMessage('Message content is required'),
  body('messageType').optional().isIn(['text', 'image', 'file', 'job-share', 'interview-invitation']).withMessage('Invalid message type')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { recipient, content, messageType, metadata } = req.body;

    // Verify recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Cannot send message to yourself
    if (recipient === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    const messageData = {
      sender: req.user._id,
      recipient,
      content,
      messageType: messageType || 'text'
    };

    // Add metadata for special message types
    if (metadata) {
      messageData.metadata = metadata;
    }

    const message = await Message.create(messageData);

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar');

    // TODO: Emit socket event for real-time delivery
    // io.to(recipientSocketId).emit('new-message', populatedMessage);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/:messageId/read', async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only recipient can mark message as read
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    if (!message.read) {
      message.read = true;
      message.readAt = new Date();
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/messages/conversation/:userId/read-all
// @desc    Mark all messages in conversation as read
// @access  Private
router.put('/conversation/:userId/read-all', async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Mark all unread messages from this user as read
    const result = await Message.updateMany(
      {
        sender: userId,
        recipient: req.user._id,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} messages marked as read`,
      data: {
        markedAsRead: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/:messageId', async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete message (within 24 hours) or admin
    const isSender = message.sender.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isRecent = (Date.now() - message.createdAt.getTime()) < (24 * 60 * 60 * 1000); // 24 hours

    if (!isAdmin && (!isSender || !isRecent)) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete this message. Messages can only be deleted by sender within 24 hours.'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/messages/search
// @desc    Search messages
// @access  Private
router.get('/search', async (req, res, next) => {
  try {
    const { query, conversationWith, messageType, startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build filter
    const filter = {
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ],
      content: new RegExp(query, 'i')
    };

    if (conversationWith) {
      filter.$and = [
        {
          $or: [
            { sender: req.user._id, recipient: conversationWith },
            { sender: conversationWith, recipient: req.user._id }
          ]
        }
      ];
    }

    if (messageType) {
      filter.messageType = messageType;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const messages = await Message.find(filter)
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: messages
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get unread message count for current user
// @access  Private
router.get('/unread-count', async (req, res, next) => {
  try {
    const unreadCount = await Message.countDocuments({
      recipient: req.user._id,
      read: false
    });

    // Get unread count by conversation
    const unreadByConversation = await Message.aggregate([
      {
        $match: {
          recipient: req.user._id,
          read: false
        }
      },
      {
        $group: {
          _id: '$sender',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'sender'
        }
      },
      {
        $unwind: '$sender'
      },
      {
        $project: {
          senderId: '$_id',
          senderName: '$sender.name',
          senderAvatar: '$sender.avatar',
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUnread: unreadCount,
        unreadByConversation
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/share-job
// @desc    Share a job through message
// @access  Private
router.post('/share-job', [
  body('recipient').isMongoId().withMessage('Valid recipient ID is required'),
  body('jobId').isMongoId().withMessage('Valid job ID is required'),
  body('message').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { recipient, jobId, message: customMessage } = req.body;

    // Verify recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Verify job exists
    const Job = require('../models/Job');
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const content = customMessage || `I thought you might be interested in this job: ${job.title}`;

    const messageData = {
      sender: req.user._id,
      recipient,
      content,
      messageType: 'job-share',
      metadata: {
        jobId: job._id,
        jobTitle: job.title,
        company: job.company.name,
        location: job.location
      }
    };

    const newMessage = await Message.create(messageData);

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Job shared successfully',
      data: populatedMessage
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/interview-invitation
// @desc    Send interview invitation through message
// @access  Private (Employer only)
router.post('/interview-invitation', [
  body('recipient').isMongoId().withMessage('Valid recipient ID is required'),
  body('applicationId').isMongoId().withMessage('Valid application ID is required'),
  body('interviewDate').isISO8601().withMessage('Valid interview date is required'),
  body('interviewType').isIn(['phone', 'video', 'in-person']).withMessage('Valid interview type is required'),
  body('message').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { recipient, applicationId, interviewDate, interviewType, location, message: customMessage } = req.body;

    // Verify application exists and user is the employer
    const Application = require('../models/Application');
    const application = await Application.findById(applicationId)
      .populate('job', 'title company')
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if current user is the job employer
    if (application.job.company.toString() !== req.user.company?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send interview invitation for this application'
      });
    }

    const content = customMessage || `You've been invited for an interview for the position of ${application.job.title}`;

    const messageData = {
      sender: req.user._id,
      recipient,
      content,
      messageType: 'interview-invitation',
      metadata: {
        applicationId: application._id,
        jobTitle: application.job.title,
        company: application.job.company.name,
        interviewDate: new Date(interviewDate),
        interviewType,
        location: location || null
      }
    };

    const newMessage = await Message.create(messageData);

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar');

    // Update application status
    application.status = 'interview-scheduled';
    application.interviewDetails = {
      scheduledDate: new Date(interviewDate),
      type: interviewType,
      location: location || null,
      scheduledBy: req.user._id,
      scheduledAt: new Date()
    };
    await application.save();

    res.status(201).json({
      success: true,
      message: 'Interview invitation sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
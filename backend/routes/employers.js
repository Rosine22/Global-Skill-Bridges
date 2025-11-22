const express = require('express');
const router = express.Router();
const User = require('../models/User');
const EmailService = require('../services/emailService');
const { protect } = require('../middleware/auth');
const { createNotification } = require('./notifications');

const emailService = new EmailService();

/**
 * POST /api/employers/onboard
 * Accept employer onboarding data and attach to user's companyInfo.
 */
router.post('/onboard', protect, async (req, res, next) => {
  try {
    const { companyInfo, location, phone, avatar } = req.body;

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const prevHasCompany = !!(user.companyInfo && user.companyInfo.name);

    // Merge incoming companyInfo with existing (if any)
    user.companyInfo = Object.assign({}, user.companyInfo || {}, companyInfo || {});

    // Normalize company size values to match schema enums
    if (user.companyInfo && user.companyInfo.size) {
      const rawSize = String(user.companyInfo.size).toLowerCase();
      const sizeMap = new Map([
        ['1-10 employees', '1-10'],
        ['1-10', '1-10'],
        ['11-50 employees', '11-50'],
        ['11-50', '11-50'],
        ['51-200 employees', '51-200'],
        ['51-200', '51-200'],
        ['201-500 employees', '201-1000'],
        ['501-1000 employees', '201-1000'],
        ['1000+ employees', '1000+'],
        ['1000+', '1000+']
      ]);
      // find mapping by checking startsWith or direct match
      let mapped = null;
      for (const [k, v] of sizeMap.entries()) {
        if (rawSize === k || rawSize.startsWith(k)) {
          mapped = v;
          break;
        }
      }
      if (mapped) user.companyInfo.size = mapped;
    }

    // Normalize remote policy values to schema enums
    if (user.companyInfo && user.companyInfo.remotePolicy) {
      const rp = String(user.companyInfo.remotePolicy).toLowerCase();
      const rpMap = {
        'office-only': 'onsite',
        'onsite': 'onsite',
        'remote-friendly': 'remote',
        'remote-first': 'remote',
        'fully-remote': 'remote',
        'hybrid': 'hybrid',
        'remote': 'remote',
        'flexible': 'flexible'
      };
      if (rpMap[rp]) user.companyInfo.remotePolicy = rpMap[rp];
    }

    // If avatar provided, attach to both user.avatar and companyInfo.logo
    if (avatar) {
      user.avatar = avatar;
      if (!user.companyInfo) user.companyInfo = {};
      user.companyInfo.logo = user.companyInfo.logo || {};
      user.companyInfo.logo.url = avatar.url || avatar;
      user.companyInfo.logo.public_id = avatar.public_id || avatar.public_id || `company_logo_${Date.now()}`;
    }

    // Update other fields if provided
    if (location) user.location = location;
    if (phone) user.phone = phone;

    // Try saving and report validation errors clearly
    try {
      await user.save();
    } catch (saveErr) {
      console.error('Failed to save user during onboarding:', saveErr);
      // If mongoose validation error, return details to client
      if (saveErr.name === 'ValidationError') {
        const details = Object.keys(saveErr.errors).reduce((acc, key) => {
          acc[key] = saveErr.errors[key].message;
          return acc;
        }, {});
        return res.status(400).json({ success: false, message: 'Validation failed', errors: details });
      }
      throw saveErr;
    }

    // If this submission completed the company profile for the first time, notify admins
    const newHasCompany = !!(user.companyInfo && user.companyInfo.name);
    if (!prevHasCompany && newHasCompany) {
      try {
        const adminNotifyResult = await emailService.sendNewEmployerNotificationToAdmin(user);
        if (!adminNotifyResult.success) {
          console.error('Failed to email admins about new employer (onboard):', adminNotifyResult.error);
        }
      } catch (e) {
        console.error('Error sending admin email on employer onboard:', e);
      }

      try {
        const admins = await User.find({ role: { $in: ['admin', 'rtb-admin'] } }).select('_id');
        await Promise.all(admins.map(a => createNotification(a._id, 'employer-registration', 'New Employer Registration', `A new employer (${user.companyInfo?.name || user.name}) completed profile and requires approval.`, { userId: user._id })));
      } catch (notifErr) {
        console.error('Failed to create in-app admin notification on onboard:', notifErr);
      }
    }

    try {
      user.calculateProfileCompletion();
      await user.save();
    } catch (e) {
      console.error('Failed to recalc profile completion after onboarding:', e);
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

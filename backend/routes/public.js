const express = require('express');
const User = require('../models/User');
const Application = require('../models/Application');
const { RTBGraduate } = require('../models/Skill');

const router = express.Router();

// Public stats endpoint used by the frontend landing page
// Note: returns aggregated, read-only counts computed from the database
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalGraduates,
      totalEmployers,
      totalMentors,
      totalApplications,
      totalHires
    ] = await Promise.all([
      // RTB graduate tracking model
      RTBGraduate.countDocuments(),
      // Approved employers only
      User.countDocuments({ role: 'employer', isApproved: true }),
      User.countDocuments({ role: 'mentor' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'hired' })
    ]);

    const successRate = totalApplications > 0
      ? parseFloat(((totalHires / totalApplications) * 100).toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalGraduates,
        totalEmployers,
        totalMentors,
        successRate
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { RTBGraduate } = require('../models/Skill');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// @route   GET /api/analytics/overview
// @desc    Get platform overview analytics
// @access  Private (Admin only)
router.get('/overview', authorize('admin', 'rtb-admin'), async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query; // daily, weekly, monthly, yearly

    // Calculate date ranges
    const now = new Date();
    let startDate, previousPeriodStart;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousPeriodStart = new Date(startDate);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        previousPeriodStart = new Date(startDate);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousPeriodStart = new Date(startDate);
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousPeriodStart = new Date(startDate);
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
        break;
    }

    // Current period stats
    const [
      totalUsers,
      newUsers,
      activeUsers,
      totalJobs,
      newJobs,
      activeJobs,
      totalApplications,
      newApplications,
      successfulHires
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ lastSeen: { $gte: startDate } }),
      Job.countDocuments(),
      Job.countDocuments({ createdAt: { $gte: startDate } }),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      Application.countDocuments({ createdAt: { $gte: startDate } }),
      Application.countDocuments({ 
        status: 'hired',
        updatedAt: { $gte: startDate }
      })
    ]);

    // Previous period stats for comparison
    const [
      prevNewUsers,
      prevActiveUsers,
      prevNewJobs,
      prevNewApplications,
      prevSuccessfulHires
    ] = await Promise.all([
      User.countDocuments({ 
        createdAt: { $gte: previousPeriodStart, $lt: startDate } 
      }),
      User.countDocuments({ 
        lastSeen: { $gte: previousPeriodStart, $lt: startDate } 
      }),
      Job.countDocuments({ 
        createdAt: { $gte: previousPeriodStart, $lt: startDate } 
      }),
      Application.countDocuments({ 
        createdAt: { $gte: previousPeriodStart, $lt: startDate } 
      }),
      Application.countDocuments({ 
        status: 'hired',
        updatedAt: { $gte: previousPeriodStart, $lt: startDate }
      })
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    // User distribution by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Application success rate
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const successRate = totalApplications > 0 
      ? ((successfulHires / totalApplications) * 100).toFixed(1)
      : 0;

    const overviewData = {
      period,
      dateRange: {
        start: startDate,
        end: now
      },
      metrics: {
        users: {
          total: totalUsers,
          new: newUsers,
          active: activeUsers,
          growth: {
            new: calculateGrowth(newUsers, prevNewUsers),
            active: calculateGrowth(activeUsers, prevActiveUsers)
          }
        },
        jobs: {
          total: totalJobs,
          new: newJobs,
          active: activeJobs,
          growth: {
            new: calculateGrowth(newJobs, prevNewJobs)
          }
        },
        applications: {
          total: totalApplications,
          new: newApplications,
          successful: successfulHires,
          successRate: parseFloat(successRate),
          growth: {
            new: calculateGrowth(newApplications, prevNewApplications),
            successful: calculateGrowth(successfulHires, prevSuccessfulHires)
          }
        }
      },
      distribution: {
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        applicationsByStatus: applicationStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    };

    res.status(200).json({
      success: true,
      data: overviewData
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/trends
// @desc    Get platform trends and time-series data
// @access  Private (Admin only)
router.get('/trends', authorize('admin', 'rtb-admin'), async (req, res, next) => {
  try {
    const { metric = 'users', period = 'monthly', months = 12 } = req.query;

    const monthsBack = parseInt(months);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    let aggregationPipeline;
    let collection;

    // Define aggregation based on metric
    switch (metric) {
      case 'users':
        collection = User;
        break;
      case 'jobs':
        collection = Job;
        break;
      case 'applications':
        collection = Application;
        break;
      default:
        collection = User;
    }

    // Build time-series aggregation
    const groupByPeriod = period === 'daily' 
      ? {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        }
      : {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };

    const trends = await collection.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupByPeriod,
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Format data for frontend
    const formattedTrends = trends.map(item => ({
      date: period === 'daily' 
        ? new Date(item._id.year, item._id.month - 1, item._id.day)
        : new Date(item._id.year, item._id.month - 1, 1),
      count: item.count
    }));

    res.status(200).json({
      success: true,
      data: {
        metric,
        period,
        trends: formattedTrends,
        totalRecords: formattedTrends.reduce((sum, item) => sum + item.count, 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/geographic
// @desc    Get geographic distribution analytics
// @access  Private (Admin only)
router.get('/geographic', authorize('admin', 'rtb-admin'), async (req, res, next) => {
  try {
    const { type = 'users' } = req.query; // users, jobs, applications

    let pipeline;

    switch (type) {
      case 'jobs':
        pipeline = [
          {
            $group: {
              _id: {
                country: '$location.country',
                city: '$location.city'
              },
              count: { $sum: 1 }
            }
          }
        ];
        break;

      case 'applications':
        pipeline = [
          {
            $lookup: {
              from: 'users',
              localField: 'applicant',
              foreignField: '_id',
              as: 'applicantData'
            }
          },
          {
            $unwind: '$applicantData'
          },
          {
            $group: {
              _id: {
                country: '$applicantData.location.country',
                city: '$applicantData.location.city'
              },
              count: { $sum: 1 }
            }
          }
        ];
        break;

      case 'users':
      default:
        pipeline = [
          {
            $group: {
              _id: {
                country: '$location.country',
                city: '$location.city'
              },
              count: { $sum: 1 }
            }
          }
        ];
        break;
    }

    const collection = type === 'jobs' ? Job : 
                      type === 'applications' ? Application : User;

    const geoData = await collection.aggregate([
      ...pipeline,
      {
        $sort: { count: -1 }
      },
      {
        $limit: 50 // Top 50 locations
      }
    ]);

    // Group by country
    const byCountry = geoData.reduce((acc, item) => {
      const country = item._id.country || 'Unknown';
      if (!acc[country]) {
        acc[country] = { total: 0, cities: [] };
      }
      acc[country].total += item.count;
      if (item._id.city) {
        acc[country].cities.push({
          city: item._id.city,
          count: item.count
        });
      }
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        type,
        byCountry,
        topLocations: geoData.slice(0, 10),
        totalRecords: geoData.reduce((sum, item) => sum + item.count, 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/skills
// @desc    Get skills analytics and trends
// @access  Private (Admin only)
router.get('/skills', authorize('admin', 'rtb-admin'), async (req, res, next) => {
  try {
    // Most in-demand skills (from job requirements)
    const jobSkills = await Job.aggregate([
      { $unwind: '$requirements.skills' },
      {
        $group: {
          _id: '$requirements.skills',
          jobCount: { $sum: 1 },
          avgSalaryMin: { $avg: '$salary.min' },
          avgSalaryMax: { $avg: '$salary.max' }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 20 }
    ]);

    // Most common skills (from user profiles)
    const userSkills = await User.aggregate([
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills.skill',
          userCount: { $sum: 1 },
          avgProficiency: { $avg: '$skills.proficiencyLevel' }
        }
      },
      {
        $lookup: {
          from: 'skills',
          localField: '_id',
          foreignField: '_id',
          as: 'skillData'
        }
      },
      {
        $unwind: { path: '$skillData', preserveNullAndEmptyArrays: true }
      },
      { $sort: { userCount: -1 } },
      { $limit: 20 }
    ]);

    // Skills gap analysis (high demand, low supply)
    const skillsGapAnalysis = [];
    
    jobSkills.forEach(jobSkill => {
      const userSkill = userSkills.find(us => 
        us._id.toString() === jobSkill._id.toString()
      );
      
      const demandSupplyRatio = userSkill ? 
        (jobSkill.jobCount / userSkill.userCount) : jobSkill.jobCount;

      skillsGapAnalysis.push({
        skill: jobSkill._id,
        jobDemand: jobSkill.jobCount,
        userSupply: userSkill ? userSkill.userCount : 0,
        gapScore: demandSupplyRatio,
        avgSalaryRange: {
          min: Math.round(jobSkill.avgSalaryMin || 0),
          max: Math.round(jobSkill.avgSalaryMax || 0)
        }
      });
    });

    // Sort by gap score (highest gap first)
    skillsGapAnalysis.sort((a, b) => b.gapScore - a.gapScore);

    res.status(200).json({
      success: true,
      data: {
        mostDemandedSkills: jobSkills,
        mostCommonSkills: userSkills,
        skillsGaps: skillsGapAnalysis.slice(0, 15),
        summary: {
          totalUniqueSkillsInJobs: jobSkills.length,
          totalUniqueSkillsInProfiles: userSkills.length,
          topGapSkills: skillsGapAnalysis.slice(0, 5).map(s => s.skill)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/employment
// @desc    Get employment and hiring analytics
// @access  Private (Admin only)
router.get('/employment', authorize('admin', 'rtb-admin'), async (req, res, next) => {
  try {
    // Application funnel analysis
    const applicationFunnel = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Time to hire analysis
    const timeToHire = await Application.aggregate([
      {
        $match: {
          status: 'hired',
          hiredAt: { $exists: true }
        }
      },
      {
        $addFields: {
          daysToHire: {
            $divide: [
              { $subtract: ['$hiredAt', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDaysToHire: { $avg: '$daysToHire' },
          minDaysToHire: { $min: '$daysToHire' },
          maxDaysToHire: { $max: '$daysToHire' },
          totalHires: { $sum: 1 }
        }
      }
    ]);

    // Success rate by job category
    const successByCategory = await Job.aggregate([
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'job',
          as: 'applications'
        }
      },
      {
        $addFields: {
          totalApplications: { $size: '$applications' },
          successfulHires: {
            $size: {
              $filter: {
                input: '$applications',
                cond: { $eq: ['$$this.status', 'hired'] }
              }
            }
          }
        }
      },
      {
        $match: {
          totalApplications: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$category',
          totalJobs: { $sum: 1 },
          totalApplications: { $sum: '$totalApplications' },
          totalHires: { $sum: '$successfulHires' },
          avgApplicationsPerJob: { $avg: '$totalApplications' }
        }
      },
      {
        $addFields: {
          successRate: {
            $multiply: [
              { $divide: ['$totalHires', '$totalApplications'] },
              100
            ]
          }
        }
      },
      {
        $sort: { successRate: -1 }
      }
    ]);

    // Monthly hiring trends
    const hiringTrends = await Application.aggregate([
      {
        $match: {
          status: 'hired',
          hiredAt: { 
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$hiredAt' },
            month: { $month: '$hiredAt' }
          },
          hires: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        applicationFunnel,
        timeToHire: timeToHire[0] || {
          avgDaysToHire: 0,
          minDaysToHire: 0,
          maxDaysToHire: 0,
          totalHires: 0
        },
        successByCategory,
        hiringTrends,
        summary: {
          totalApplications: applicationFunnel.reduce((sum, item) => sum + item.count, 0),
          totalHires: applicationFunnel.find(item => item._id === 'hired')?.count || 0,
          overallSuccessRate: (() => {
            const total = applicationFunnel.reduce((sum, item) => sum + item.count, 0);
            const hired = applicationFunnel.find(item => item._id === 'hired')?.count || 0;
            return total > 0 ? ((hired / total) * 100).toFixed(1) : 0;
          })()
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/revenue
// @desc    Get revenue and business analytics (placeholder for future premium features)
// @access  Private (Admin only)
router.get('/revenue', authorize('admin'), async (req, res, next) => {
  try {
    // Placeholder for future premium features
    // This would track subscription revenue, premium job postings, etc.
    
    const placeholderData = {
      monthlyRevenue: 0,
      yearlyRevenue: 0,
      premiumUsers: 0,
      premiumJobPostings: 0,
      revenueBySource: {},
      growthRate: 0
    };

    res.status(200).json({
      success: true,
      data: placeholderData,
      message: 'Revenue analytics will be implemented with premium features'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private (Admin only)
router.get('/export', authorize('admin', 'rtb-admin'), async (req, res, next) => {
  try {
    const { type = 'overview', format = 'json' } = req.query;

    let data;
    
    switch (type) {
      case 'users':
        data = await User.find({})
          .select('name email role location createdAt lastSeen')
          .lean();
        break;
      case 'jobs':
        data = await Job.find({})
          .populate('company', 'name')
          .select('title company location salary status createdAt')
          .lean();
        break;
      case 'applications':
        data = await Application.find({})
          .populate('applicant', 'name email')
          .populate('job', 'title company')
          .select('applicant job status createdAt')
          .lean();
        break;
      default:
        // Overview export
        data = {
          exportDate: new Date(),
          totalUsers: await User.countDocuments(),
          totalJobs: await Job.countDocuments(),
          totalApplications: await Application.countDocuments()
        };
    }

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${Date.now()}.csv"`);
      
      // For simplicity, returning JSON for now
      // In production, you'd use a CSV library
      res.json(data);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${Date.now()}.json"`);
      res.json({
        success: true,
        exportType: type,
        exportDate: new Date(),
        data
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
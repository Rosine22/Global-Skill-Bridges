const express = require('express');
const User = require('../models/User');
const Application = require('../models/Application');
const EmailService = require('../services/emailService');

const { protect, authorize } = require('../middleware/auth');
const { createNotification } = require('./notifications');

const router = express.Router();

// Protect all admin routes and require admin role
router.use(protect);
router.use(authorize('admin', 'rtb-admin'));

// Helper to normalize/merge employer company fields so admin UI can read a
// consistent shape regardless of whether data is stored under `companyInfo`
// or as top-level aliases (companyName, companyRegistration, etc.).
function mergeEmployerDetails(employer) {
  // employer may be a Mongoose doc or a plain object
  const e = employer && employer.toObject ? employer.toObject() : (employer || {});

  const ci = e.companyInfo || {};

  const merged = {
    id: e._id,
    name: e.name || ci.contactPerson || ci.name || e.companyName || 'Unknown',
    email: e.email,
    phone: e.phone || ci.phone || null,
    companyName: ci.name || e.companyName || null,
    companyRegistration: ci.registrationNumber || e.companyRegistration || null,
    companyIndustry: ci.industry || e.companyIndustry || null,
    companySize: ci.size || e.companySize || null,
    website: ci.website || e.website || null,
    description: ci.description || e.description || null,
    logo: (ci.logo && ci.logo.url) || (e.companyInfo && e.companyInfo.logo && e.companyInfo.logo.url) || (e.avatar && e.avatar.url) || null,
    taxId: ci.taxId || e.taxId || null,
    contactPerson: ci.contactPerson || e.contactPerson || null,
    location: e.location || ci.location || null,
    isEmailVerified: e.isEmailVerified,
    isApproved: e.isApproved,
    approvalDate: e.approvalDate || null,
    approvedBy: e.approvedBy || null,
    adminNotes: e.adminNotes || [],
    createdAt: e.createdAt || null,
    profileCompletion: e.profileCompletion || 0,
  };

  return merged;
}

// ✅ Get pending employers (for admin approval)
router.get("/employers/pending", async (req, res) => {
  try {
    const pendingEmployers = await User.find({
      role: "employer",
      isApproved: false,
      isActive: true,
    })
      .select("-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken") // Exclude sensitive fields only
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    console.log(`Found ${pendingEmployers.length} pending employers`);

    // Normalize employer details for consistent admin consumption
    const normalized = pendingEmployers.map((emp) => {
      const merged = mergeEmployerDetails(emp);
      // attach merged profile but keep original data for debugging if needed
      return {
        ...emp,
        employerProfile: merged,
      };
    });

    // Log a sample normalized employer for debugging
    if (normalized.length > 0) {
      console.log('Sample normalized pending employer:', normalized[0].employerProfile);
    }

    res.status(200).json({
      success: true,
      data: normalized,
      count: normalized.length,
    });
  } catch (error) {
    console.error("Error fetching pending employers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending employers",
      error: error.message,
    });
  }
});

// ✅ Get all employers (approved + pending)
router.get("/employers", async (req, res) => {
  try {
    // Support both `status=approved|pending` and `isApproved=true|false` (frontend may use either)
    const { page = 1, limit = 50, status, isApproved } = req.query; // Increased default limit
    const skip = (page - 1) * limit;

    // filter by approval status if provided
    const filter = { role: "employer", isActive: true }; // Only active employers
    if (status === "approved") filter.isApproved = true;
    if (status === "pending") filter.isApproved = false;
    if (typeof isApproved !== 'undefined') {
      // allow ?isApproved=true or ?isApproved=false
      filter.isApproved = (String(isApproved) === 'true');
    }

    const employers = await User.find(filter)
      .select("-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken") // Exclude sensitive fields only
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance

    const totalEmployers = await User.countDocuments(filter);

    console.log(`Found ${employers.length} employers with filter:`, filter);

    // Normalize each employer and include `employerProfile` for consistent frontend display
    const normalized = employers.map(emp => ({
      ...emp,
      employerProfile: mergeEmployerDetails(emp)
    }));

    if (normalized.length > 0) {
      console.log('Sample normalized employer:', normalized[0].employerProfile);
    }

    res.status(200).json({
      success: true,
      data: normalized,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEmployers / limit),
        totalEmployers,
      },
    });
  } catch (error) {
    console.error("Error fetching employers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employers",
      error: error.message,
    });
  }
});

// ✅ Get all job applications
router.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("jobSeeker", "-password")
      .populate("employer", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error,
    });
  }
});

// ✅ Get specific employer by ID
router.get("/employers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const employer = await User.findOne({ _id: id, role: "employer" })
      .select("-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken")
      .populate('approvedBy', 'name email');
    
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    console.log(`Retrieved employer details for ID: ${id}`);

    const normalized = mergeEmployerDetails(employer);

    res.status(200).json({
      success: true,
      data: {
        ...employer,
        employerProfile: normalized,
      },
    });
  } catch (error) {
    console.error("Error fetching employer details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employer details",
      error: error.message,
    });
  }
});

// ✅ Approve or reject employer
router.put("/employers/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { approve, notes } = req.body;

    const employer = await User.findOne({ _id: id, role: "employer" });
    
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    // Update approval status
    employer.isApproved = approve === true;
    
    if (approve) {
      employer.approvalDate = new Date();
      employer.isActive = true; // ensure account is active once approved
      employer.approvedBy = req.user._id;
    } else {
      // If rejected, make sure employer cannot log in or access the system
      employer.isApproved = false;
      employer.isActive = false;
    }

    // Add admin notes if provided
    if (notes) {
      if (!employer.adminNotes) employer.adminNotes = [];
      employer.adminNotes.push({
        note: notes,
        addedAt: new Date(),
        addedBy: req.user?.id || 'admin', // Use authenticated admin's ID if available
      });
    }

    await employer.save();

    // Send email notification to employer about approval status change
    try {
      const emailService = new EmailService();
      // Pass a boolean isApproved along with any admin notes so the template can include the message
      await emailService.sendEmployerApprovalEmail(employer.toObject ? employer.toObject() : employer, !!employer.isApproved, notes || '');
    } catch (emailErr) {
      console.error('Failed to send employer approval email:', emailErr);
      // Continue without failing the API response
    }

    // Create in-app notification for employer
    try {
      await createNotification(employer._id, 'employer-approval', `Your application has been ${approve ? 'approved' : 'rejected'}`, notes || (approve ? 'Your account is approved. You can now access the employer dashboard.' : 'Your application was not approved. Please contact support for details.'), { approved: approve });
    } catch (notifErr) {
      console.error('Failed to create in-app notification for employer:', notifErr);
    }

    // Respond with normalized employer profile as well
    const normalizedProfile = mergeEmployerDetails(employer);

    res.status(200).json({
      success: true,
      message: approve ? "Employer approved successfully" : "Employer rejected",
      data: {
        ...employer.toObject ? employer.toObject() : employer,
        employerProfile: normalizedProfile,
      },
    });
  } catch (error) {
    console.error("Error updating employer approval:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update employer approval status",
      error,
    });
  }
});

module.exports = router;

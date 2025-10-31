const express = require('express');
const User = require('../models/User');
const Application = require('../models/Application');

const router = express.Router();

// ✅ Get pending employers (for admin approval)
router.get("/employers/pending", async (req, res) => {
  try {
    const pendingEmployers = await User.find({
      role: "employer",
      isApproved: false,
      isActive: true,
    })
      .select("-password") // ✅ FIXED: exclude only password
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: pendingEmployers,
    });
  } catch (error) {
    console.error("Error fetching pending employers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending employers",
      error,
    });
  }
});

// ✅ Get all employers (approved + pending)
router.get("/employers", async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // filter by approval status if provided
    const filter = { role: "employer" };
    if (status === "approved") filter.isApproved = true;
    if (status === "pending") filter.isApproved = false;

    const employers = await User.find(filter)
      .select("-password") // ✅ FIXED: exclude only password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalEmployers = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: employers,
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
      error,
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
      // You can set approvedBy if you have req.user available from auth middleware
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

    res.status(200).json({
      success: true,
      message: approve ? "Employer approved successfully" : "Employer rejected",
      data: employer,
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

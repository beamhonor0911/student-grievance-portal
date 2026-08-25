const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');
const auth = require('../middleware/authMiddleware');

// Helper to ensure grievance has all required fields
function sanitizeGrievance(g) {
  return {
    ...g,
    title: g.title || 'Untitled Grievance',
    description: g.description || '',
    category: g.category || 'Other',
    priority: g.priority || 'Medium',
    status: g.status || 'Pending',
    assignedTo: g.assignedTo || 'Not Assigned',
    adminRemarks: g.adminRemarks || '',
    studentName: g.studentName || 'Student',
    studentEmail: g.studentEmail || '',
    createdAt: g.createdAt || new Date().toISOString(),
    updatedAt: g.updatedAt || new Date().toISOString()
  };
}

// SUBMIT grievance (student only)
router.post('/submit', auth, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const grievance = new Grievance({
      title,
      description,
      category: category || 'Other',
      priority: priority || 'Medium',
      status: 'Pending',
      assignedTo: 'Not Assigned',
      adminRemarks: '',
      student: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email
    });

    await grievance.save();
    res.status(201).json({ message: 'Grievance submitted successfully', grievance });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET my grievances (student)
router.get('/my', auth, async (req, res) => {
  try {
    const grievances = await Grievance.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(grievances.map(sanitizeGrievance));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all grievances (admin only) — with search & pagination
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { search, page, limit } = req.query;
    let query = {};

    // Search support
    if (search) {
      const regex = new RegExp(search, 'i');
      query = {
        $or: [
          { title: regex },
          { studentName: regex },
          { studentEmail: regex },
          { category: regex }
        ]
      };
    }

    let grievancesQuery = Grievance.find(query).sort({ createdAt: -1 });

    // Pagination support
    if (page && limit) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      grievancesQuery = grievancesQuery.skip(skip).limit(parseInt(limit));
    }

    const grievances = await grievancesQuery;
    res.json(grievances.map(sanitizeGrievance));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET grievance stats (admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const grievances = await Grievance.find();
    const total = grievances.length;

    const byStatus = {
      Pending: grievances.filter(g => g.status === 'Pending').length,
      'In Progress': grievances.filter(g => g.status === 'In Progress').length,
      Resolved: grievances.filter(g => g.status === 'Resolved').length,
      Rejected: grievances.filter(g => g.status === 'Rejected').length,
    };

    const byCategory = {};
    grievances.forEach(g => {
      byCategory[g.category] = (byCategory[g.category] || 0) + 1;
    });

    const byPriority = {
      Low: grievances.filter(g => g.priority === 'Low').length,
      Medium: grievances.filter(g => g.priority === 'Medium').length,
      High: grievances.filter(g => g.priority === 'High').length,
    };

    const resolutionRate = total > 0 ? Math.round((byStatus.Resolved / total) * 100) : 0;

    const recentActivity = grievances
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map(g => ({
        title: g.title,
        status: g.status,
        updatedAt: g.updatedAt
      }));

    res.json({ total, byStatus, byCategory, byPriority, resolutionRate, recentActivity });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE grievance status (admin only)
router.put('/update/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, assignedTo, adminRemarks } = req.body;

    const grievance = await Grievance.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo, adminRemarks },
      { new: true }
    );

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    res.json({ message: 'Grievance updated successfully', grievance });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE grievance (admin only)
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Grievance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Grievance deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Academic', 'Hostel', 'Infrastructure', 'Financial', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: String,
  studentEmail: String,
  assignedTo: {
    type: String,
    default: 'Not Assigned'
  },
  adminRemarks: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Grievance', grievanceSchema);
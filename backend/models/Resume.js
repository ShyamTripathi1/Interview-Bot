const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    github: String,
    linkedin: String,
    summary: String
  },
  experience: [{
    company: String,
    role: String,
    startDate: String,
    endDate: String,
    description: String,
    aiSuggestions: String // AI feedback for descriptions
  }],
  education: [{
    institution: String,
    degree: String,
    graduationYear: String
  }],
  skills: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resume', ResumeSchema);

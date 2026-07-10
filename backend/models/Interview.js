const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: [true, 'Please specify the job role']
  },
  jobDescription: {
    type: String,
    default: ''
  },
  questions: [{
    questionText: String,
    userAnswer: String,
    feedback: String,
    score: Number // 0-10 rating
  }],
  violations: [{
    questionIndex: Number,
    type: { type: String },
    details: String
  }],
  violationsCount: {
    type: Number,
    default: 0
  },
  overallScore: {
    type: Number,
    default: 0
  },
  overallFeedback: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interview', InterviewSchema);

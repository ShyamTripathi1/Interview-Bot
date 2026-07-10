const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: [true, 'Please specify the quiz topic/skill']
  },
  questions: [{
    questionText: String,
    options: [String],
    correctOptionIndex: Number,
    explanation: String,
    userAnswerIndex: {
      type: Number,
      default: -1
    }
  }],
  score: {
    type: Number,
    default: 0
  },
  aiRecommendations: {
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

module.exports = mongoose.model('Quiz', QuizSchema);

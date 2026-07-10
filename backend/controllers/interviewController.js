const Interview = require('../models/Interview');
const geminiService = require('../services/geminiService');

exports.startInterview = async (req, res) => {
  try {
    const { role, jobDescription } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Please specify the job role' });
    }

    // Call Gemini to generate questions
    const questionTexts = await geminiService.generateInterviewQuestions(role, jobDescription);
    
    const questions = questionTexts.map(q => ({
      questionText: q,
      userAnswer: '',
      feedback: '',
      score: 0
    }));

    const interview = await Interview.create({
      user: req.user.id,
      role,
      jobDescription,
      questions,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      interview
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitInterviewAnswers = async (req, res) => {
  try {
    const { interviewId, answers, snapshots } = req.body;
    if (!interviewId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const questionTexts = interview.questions.map(q => q.questionText);
    
    // Evaluate answers with Gemini
    const evaluation = await geminiService.gradeInterviewAnswers(interview.role, questionTexts, answers, snapshots || []);

    // Save grades
    interview.questions = interview.questions.map((q, idx) => {
      const graded = evaluation.questions[idx] || {};
      return {
        questionText: q.questionText,
        userAnswer: answers[idx] || '',
        feedback: graded.feedback || 'Good effort.',
        score: typeof graded.score === 'number' ? graded.score : 7
      };
    });

    // Save violations
    if (evaluation.violations && Array.isArray(evaluation.violations)) {
      interview.violations = evaluation.violations.map(v => ({
        questionIndex: typeof v.questionIndex === 'number' ? v.questionIndex : -1,
        type: v.type || 'unknown',
        details: v.details || ''
      }));
      interview.violationsCount = evaluation.violations.length;
    } else {
      interview.violations = [];
      interview.violationsCount = 0;
    }

    interview.overallScore = typeof evaluation.overallScore === 'number' ? evaluation.overallScore : 7;
    interview.overallFeedback = evaluation.overallFeedback || 'Evaluation completed successfully.';
    interview.status = 'completed';

    await interview.save();

    res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }
    if (interview.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    res.status(200).json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

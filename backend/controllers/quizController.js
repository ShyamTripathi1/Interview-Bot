const Quiz = require('../models/Quiz');
const geminiService = require('../services/geminiService');

exports.startQuiz = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: 'Please specify the quiz topic' });
    }

    // Call Gemini to generate quiz
    const generatedQuestions = await geminiService.generateQuiz(topic);

    const quiz = await Quiz.create({
      user: req.user.id,
      topic,
      questions: generatedQuestions.map(q => ({
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
        userAnswerIndex: -1
      })),
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      quiz: {
        _id: quiz._id,
        topic: quiz.topic,
        questions: quiz.questions.map(q => ({
          questionText: q.questionText,
          options: q.options
        })) // Return questions without correct answer info to client during test
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, userAnswers } = req.body; // userAnswers is an array of numbers representing chosen indices
    if (!quizId || !userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Score quiz
    let correctCount = 0;
    quiz.questions = quiz.questions.map((q, idx) => {
      const uAns = userAnswers[idx] !== undefined ? userAnswers[idx] : -1;
      const isCorrect = uAns === q.correctOptionIndex;
      if (isCorrect) correctCount++;
      return {
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
        userAnswerIndex: uAns
      };
    });

    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);

    // Call Gemini to generate feedback recommendations
    const feedback = await geminiService.generateQuizFeedback(quiz.topic, correctCount, quiz.questions.length);

    quiz.score = finalScore;
    quiz.aiRecommendations = feedback;
    quiz.status = 'completed';

    await quiz.save();

    res.status(200).json({
      success: true,
      quiz
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

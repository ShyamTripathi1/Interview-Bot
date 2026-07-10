const express = require('express');
const router = express.Router();

const { register, login, getMe, protect } = require('../controllers/authController');
const { startInterview, submitInterviewAnswers, getInterviews, getInterview } = require('../controllers/interviewController');
const { startQuiz, submitQuiz, getQuizzes } = require('../controllers/quizController');
const { getResume, updateResume, enhanceSection } = require('../controllers/resumeController');
const { sendMessage } = require('../controllers/chatController');

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);

// Interview routes
router.post('/interviews/start', protect, startInterview);
router.post('/interviews/submit', protect, submitInterviewAnswers);
router.get('/interviews', protect, getInterviews);
router.get('/interviews/:id', protect, getInterview);

// Quiz routes
router.post('/quizzes/start', protect, startQuiz);
router.post('/quizzes/submit', protect, submitQuiz);
router.get('/quizzes', protect, getQuizzes);

// Resume routes
router.get('/resume', protect, getResume);
router.put('/resume', protect, updateResume);
router.post('/resume/enhance', protect, enhanceSection);

// Chat / Coach routes
router.post('/chat/message', protect, sendMessage);

module.exports = router;

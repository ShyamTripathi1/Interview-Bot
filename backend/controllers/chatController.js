const geminiService = require('../services/geminiService');

exports.sendMessage = async (req, res) => {
  try {
    const { message, history } = req.body; // history: array of { role: 'user'|'model', content: string }
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const reply = await geminiService.chatWithCareerCoach(message, history || []);

    res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

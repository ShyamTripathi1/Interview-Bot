const Resume = require('../models/Resume');
const geminiService = require('../services/geminiService');

exports.getResume = async (req, res) => {
  try {
    let resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      // Create empty template
      resume = await Resume.create({
        user: req.user.id,
        personalInfo: { fullName: '', email: '', phone: '', github: '', linkedin: '', summary: '' },
        experience: [],
        education: [],
        skills: []
      });
    }
    res.status(200).json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateResume = async (req, res) => {
  try {
    const { personalInfo, experience, education, skills } = req.body;
    let resume = await Resume.findOne({ user: req.user.id });

    if (!resume) {
      resume = new Resume({ user: req.user.id });
    }

    if (personalInfo) resume.personalInfo = personalInfo;
    if (experience) resume.experience = experience;
    if (education) resume.education = education;
    if (skills) resume.skills = skills;

    await resume.save();
    res.status(200).json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.enhanceSection = async (req, res) => {
  try {
    const { type, text, role } = req.body;
    if (!type || !text) {
      return res.status(400).json({ success: false, message: 'Type and text parameters are required' });
    }

    let enhancedText = '';
    if (type === 'summary') {
      enhancedText = await geminiService.enhanceResumeSummary(text, role);
    } else if (type === 'experience') {
      enhancedText = await geminiService.enhanceExperienceBulletPoints(text, role);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid section type' });
    }

    res.status(200).json({
      success: true,
      enhancedText
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

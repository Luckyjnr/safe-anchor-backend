const Expert = require('../models/Expert');
const Session = require('../models/Session');
const Resource = require('../models/Resource');
const User = require('../models/User');

// Get expert dashboard info
const getExpertDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const expert = await Expert.findOne({ userId });
    if (!expert) return res.status(404).json({ msg: 'Expert profile not found' });

    // Get sessions for expert
    const sessions = await Session.find({ expertId: expert._id }).populate('victimId');
    // Get articles by this user
    const articles = await Resource.find({ type: 'article', author: req.user.firstName });

    // Exclude password from user profile
    const { password, ...safeUser } = req.user.toObject();

    res.json({
      dashboard: {
        expert: safeUser,
        specialization: expert.specialization,
        upcomingSessions: sessions.filter(s => s.status === 'pending' || s.status === 'confirmed'),
        recentSessions: sessions.filter(s => s.status === 'completed').slice(0, 5),
        stats: {
          totalSessions: expert.totalSessions,
          rating: expert.rating,
          articles: articles.length
        }
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { getExpertDashboard };
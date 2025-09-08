const Victim = require('../models/Victim');
const Session = require('../models/Session');
const Resource = require('../models/Resource');
const User = require('../models/User');

// Get victim dashboard info
const getVictimDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const victim = await Victim.findOne({ userId }).populate('matchedExperts');
    if (!victim) return res.status(404).json({ msg: 'Victim profile not found' });

    // Get sessions for victim
    const sessions = await Session.find({ victimId: victim._id }).populate('expertId');
    // Get survivor stories by this user
    const stories = await Resource.find({ type: 'survivor-story', author: req.user.firstName });

    // Exclude password from user profile
    const { password, ...safeUser } = req.user.toObject();

    res.json({
      dashboard: {
        user: safeUser,
        matchedExperts: victim.matchedExperts,
        upcomingSessions: sessions.filter(s => s.status === 'pending' || s.status === 'confirmed'),
        recentSessions: sessions.filter(s => s.status === 'completed').slice(0, 5),
        survivorStories: stories
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { getVictimDashboard };
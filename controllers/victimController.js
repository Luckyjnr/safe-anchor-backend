const Victim = require('../models/Victim');
const { matchExpert } = require('../services/matchingService');

// POST /api/victims/match-expert
const matchExpertForVictim = async (req, res) => {
  try {
    const { userId, preferences } = req.body;
    const victim = await Victim.findOne({ userId });
    if (!victim) return res.status(404).json({ msg: 'Victim not found' });

    const experts = await matchExpert(preferences);
    victim.matchedExperts = experts.map(e => e._id);
    victim.expertPreferences = preferences;
    await victim.save();

    res.json({ matchedExperts: experts });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/victims/matched-experts
const getMatchedExperts = async (req, res) => {
  try {
    const { userId } = req.query;
    const victim = await Victim.findOne({ userId }).populate('matchedExperts');
    if (!victim) return res.status(404).json({ msg: 'Victim not found' });

    res.json({ matchedExperts: victim.matchedExperts });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// PUT /api/victims/expert-preference
const updateExpertPreference = async (req, res) => {
  try {
    const { userId, preferences } = req.body;
    const victim = await Victim.findOne({ userId });
    if (!victim) return res.status(404).json({ msg: 'Victim not found' });

    victim.expertPreferences = preferences;
    await victim.save();

    res.json({ msg: 'Preferences updated' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/victims/anonymous-start
const startAnonymousSupport = async (req, res) => {
  // You can generate a temporary anonymous user/session here
  res.status(201).json({ msg: 'Anonymous support session started', sessionId: 'temp-session-id' });
};

// POST /api/victims/questionnaire
const submitAnonymousQuestionnaire = async (req, res) => {
  // Save questionnaire data anonymously
  res.status(201).json({ msg: 'Anonymous questionnaire submitted' });
};

// GET /api/victims/anonymous-resources
const getAnonymousResources = async (req, res) => {
  // Return resources for anonymous users
  res.json({ resources: ['Resource 1', 'Resource 2'] });
};

// POST /api/victims/emergency-contact
const addEmergencyContact = async (req, res) => {
  try {
    const { userId, contact } = req.body;
    const victim = await Victim.findOneAndUpdate(
      { userId },
      { $push: { emergencyContacts: contact } },
      { new: true }
    );
    if (!victim) return res.status(404).json({ msg: 'Victim not found' });
    res.json({ msg: 'Emergency contact added', victim });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/victims/expert-history
const getExpertHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    const victim = await Victim.findOne({ userId });
    if (!victim) return res.status(404).json({ msg: 'Victim not found' });
    res.json({ sessionHistory: victim.sessionHistory || [] });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  matchExpertForVictim,
  getMatchedExperts,
  updateExpertPreference,
  startAnonymousSupport,
  submitAnonymousQuestionnaire,
  getAnonymousResources,
  addEmergencyContact,
  getExpertHistory
};
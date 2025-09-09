const Victim = require('../models/Victim');
const User = require('../models/User');
const { matchExpert } = require('../services/matchingService');

// POST /api/victims/match-expert
const matchExpertForVictim = async (req, res) => {
  try {
    const userId = req.user._id; // Get from JWT token
    const { preferences } = req.body;
    console.log('Match expert - userId:', userId, 'preferences:', preferences);
    
    let victim = await Victim.findOne({ userId });
    console.log('Victim found:', victim ? 'Yes' : 'No');
    
    if (!victim) {
      // If victim record doesn't exist, create it
      console.log('Creating victim record for expert matching');
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      victim = new Victim({ 
        userId: userId,
        matchedExperts: [],
        expertPreferences: {},
        emergencyContacts: [],
        sessionHistory: []
      });
      await victim.save();
      console.log('Victim record created for expert matching');
    }

    const experts = await matchExpert(preferences);
    victim.matchedExperts = experts.map(e => e._id);
    victim.expertPreferences = preferences;
    await victim.save();

    res.json({ matches: experts });
  } catch (err) {
    console.error('Match expert error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/victims/matched-experts
const getMatchedExperts = async (req, res) => {
  try {
    const userId = req.user._id; // Get from JWT token
    console.log('Get matched experts - userId:', userId);
    
    let victim = await Victim.findOne({ userId }).populate('matchedExperts');
    console.log('Victim found:', victim ? 'Yes' : 'No');
    
    if (!victim) {
      // If victim record doesn't exist, create it
      console.log('Creating victim record for matched experts request');
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      victim = new Victim({ 
        userId: userId,
        matchedExperts: [],
        expertPreferences: {},
        emergencyContacts: [],
        sessionHistory: []
      });
      await victim.save();
      await victim.populate('matchedExperts');
      console.log('Victim record created for matched experts');
    }

    res.json({ experts: victim.matchedExperts });
  } catch (err) {
    console.error('Get matched experts error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// PUT /api/victims/expert-preference
const updateExpertPreference = async (req, res) => {
  try {
    const userId = req.user._id; // Get from JWT token
    const preferences = req.body;
    
    console.log('Update expert preference - userId:', userId, 'preferences:', preferences);
    
    let victim = await Victim.findOne({ userId });
    console.log('Victim found:', victim ? 'Yes' : 'No');
    
    if (!victim) {
      // If victim record doesn't exist, create it
      console.log('Creating victim record for expert preference update');
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      victim = new Victim({ 
        userId: userId,
        matchedExperts: [],
        expertPreferences: {},
        emergencyContacts: [],
        sessionHistory: []
      });
      await victim.save();
      console.log('Victim record created for expert preference');
    }

    victim.expertPreferences = preferences;
    await victim.save();

    res.json({ msg: 'Expert preferences updated successfully', victim });
  } catch (err) {
    console.error('Update expert preference error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// POST /api/victims/anonymous-start
const startAnonymousSupport = async (req, res) => {
  // You can generate a temporary anonymous user/session here
  res.status(201).json({ msg: 'anonymous support session started', sessionId: 'temp-session-id' });
};

// POST /api/victims/questionnaire
const submitAnonymousQuestionnaire = async (req, res) => {
  // Save questionnaire data anonymously
  res.status(201).json({ msg: 'anonymous questionnaire submitted' });
};

// GET /api/victims/anonymous-resources
const getAnonymousResources = async (req, res) => {
  // Return resources for anonymous users
  res.json({ resources: ['Resource 1', 'Resource 2'] });
};

// POST /api/victims/emergency-contact
const addEmergencyContact = async (req, res) => {
  try {
    const userId = req.user._id; // Get from JWT token
    const contact = req.body;
    
    console.log('Add emergency contact - userId:', userId, 'contact:', contact);
    
    let victim = await Victim.findOne({ userId });
    console.log('Victim found:', victim ? 'Yes' : 'No');
    
    if (!victim) {
      // If victim record doesn't exist, create it
      console.log('Creating victim record for emergency contact');
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      victim = new Victim({ 
        userId: userId,
        matchedExperts: [],
        expertPreferences: {},
        emergencyContacts: [],
        sessionHistory: []
      });
      await victim.save();
      console.log('Victim record created for emergency contact');
    }

    victim.emergencyContacts.push(contact);
    await victim.save();

    res.json({ msg: 'Emergency contact added successfully', victim });
  } catch (err) {
    console.error('Add emergency contact error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/victims/expert-history
const getExpertHistory = async (req, res) => {
  try {
    const userId = req.user._id; // Get from JWT token
    console.log('Get expert history - userId:', userId);
    
    let victim = await Victim.findOne({ userId });
    console.log('Victim found:', victim ? 'Yes' : 'No');
    
    if (!victim) {
      // If victim record doesn't exist, create it
      console.log('Creating victim record for expert history request');
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      victim = new Victim({ 
        userId: userId,
        matchedExperts: [],
        expertPreferences: {},
        emergencyContacts: [],
        sessionHistory: []
      });
      await victim.save();
      console.log('Victim record created for expert history');
    }
    
    res.json({ history: victim.sessionHistory || [] });
  } catch (err) {
    console.error('Get expert history error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/victims/profile
const getVictimProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Get from JWT token
    console.log('Get victim profile - userId:', userId);
    
    let victim = await Victim.findOne({ userId }).populate('matchedExperts');
    console.log('Victim found:', victim ? 'Yes' : 'No');
    
    if (!victim) {
      // If victim record doesn't exist, create it
      console.log('Creating victim record for profile request');
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      victim = new Victim({ 
        userId: userId,
        matchedExperts: [],
        expertPreferences: {},
        emergencyContacts: [],
        sessionHistory: []
      });
      await victim.save();
      await victim.populate('matchedExperts');
      console.log('Victim record created for profile');
    }

    res.json({ victim });
  } catch (err) {
    console.error('Get victim profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
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
  getExpertHistory,
  getVictimProfile
};
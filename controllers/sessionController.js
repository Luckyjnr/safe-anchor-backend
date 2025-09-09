const Session = require('../models/Session');
const mongoose = require('mongoose');

// Book a session with availability check
const bookSession = async (req, res) => {
  try {
    const victimId = req.user._id; // Get from JWT token
    const { expertId, scheduledAt, notes, duration } = req.body;

    console.log('Book session - victimId:', victimId, 'expertId:', expertId, 'scheduledAt:', scheduledAt);

    // Validate required fields
    if (!expertId || !scheduledAt) {
      return res.status(400).json({ msg: 'Missing required fields: expertId and scheduledAt are required' });
    }

    // Check if scheduled time is in the past
    const scheduledTime = new Date(scheduledAt);
    if (scheduledTime < new Date()) {
      return res.status(400).json({ msg: 'Cannot schedule session in the past' });
    }

    // Check for double booking (expert already has a session at this time)
    const conflict = await Session.findOne({
      expertId,
      scheduledAt: scheduledTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflict) {
      return res.status(409).json({ msg: 'Expert is not available at the selected time.' });
    }

    // Optionally, check if victim already has a session at this time
    const victimConflict = await Session.findOne({
      victimId,
      scheduledAt: scheduledTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (victimConflict) {
      return res.status(409).json({ msg: 'You already have a session at the selected time.' });
    }

    const session = new Session({ victimId, expertId, scheduledAt: scheduledTime, notes });
    await session.save();
    res.status(201).json({ msg: 'session booked', session });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all sessions for a user
const getSessions = async (req, res) => {
  try {
    const userId = req.user._id; // Get from JWT token
    console.log('Get sessions - userId:', userId);
    
    const sessions = await Session.find({ victimId: userId })
      .populate('expertId', 'specialization')
      .sort({ scheduledAt: -1 });
    
    res.json({ sessions });
  } catch (err) {
    console.error('Get sessions error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get session details
const getSession = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Get session - id:', id);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid session ID format' });
    }
    
    const session = await Session.findById(id).populate('victimId expertId');
    console.log('Get session - found:', session ? 'Yes' : 'No');
    
    if (!session) return res.status(404).json({ msg: 'Session not found' });
    res.json({ session });
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Update session
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log('Update session - id:', id, 'updates:', updates);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid session ID format' });
    }
    
    const session = await Session.findByIdAndUpdate(id, updates, { new: true });
    console.log('Update session - found:', session ? 'Yes' : 'No');
    
    if (!session) return res.status(404).json({ msg: 'Session not found' });
    res.json({ msg: 'session updated', session });
  } catch (err) {
    console.error('Update session error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Delete session
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete session - id:', id);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid session ID format' });
    }
    
    const session = await Session.findByIdAndDelete(id);
    console.log('Delete session - found:', session ? 'Yes' : 'No');
    
    if (!session) return res.status(404).json({ msg: 'Session not found' });
    res.json({ msg: 'session deleted' });
  } catch (err) {
    console.error('Delete session error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = { bookSession, getSessions, getSession, updateSession, deleteSession };
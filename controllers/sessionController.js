const Session = require('../models/Session');

// Book a session with availability check
const bookSession = async (req, res) => {
  try {
    const { victimId, expertId, scheduledAt, notes } = req.body;

    // Validate required fields
    if (!victimId || !expertId || !scheduledAt) {
      return res.status(400).json({ msg: 'Missing required fields' });
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

// Get session details
const getSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id).populate('victimId expertId');
    if (!session) return res.status(404).json({ msg: 'Session not found' });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update session
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const session = await Session.findByIdAndUpdate(id, updates, { new: true });
    if (!session) return res.status(404).json({ msg: 'Session not found' });
    res.json({ msg: 'session updated', session });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete session
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findByIdAndDelete(id);
    if (!session) return res.status(404).json({ msg: 'Session not found' });
    res.json({ msg: 'session deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { bookSession, getSession, updateSession, deleteSession };
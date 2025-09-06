const Session = require('../models/Session');

// Book a session with availability check
const bookSession = async (req, res) => {
  try {
    const { victimId, expertId, scheduledAt, notes } = req.body;

    // Check for double booking (expert already has a session at this time)
    const conflict = await Session.findOne({
      expertId,
      scheduledAt: new Date(scheduledAt),
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflict) {
      return res.status(409).json({ msg: 'Expert is not available at the selected time.' });
    }

    // Optionally, check if victim already has a session at this time
    const victimConflict = await Session.findOne({
      victimId,
      scheduledAt: new Date(scheduledAt),
      status: { $in: ['pending', 'confirmed'] }
    });

    if (victimConflict) {
      return res.status(409).json({ msg: 'You already have a session at the selected time.' });
    }

    const session = new Session({ victimId, expertId, scheduledAt, notes });
    await session.save();
    res.status(201).json({ msg: 'Session booked', session });
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
    res.json({ msg: 'Session updated', session });
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
    res.json({ msg: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { bookSession, getSession, updateSession, deleteSession };
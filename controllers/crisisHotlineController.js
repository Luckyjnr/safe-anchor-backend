const CrisisHotline = require('../models/CrisisHotline');

// Get all hotlines
const getHotlines = async (req, res) => {
  try {
    const hotlines = await CrisisHotline.find();
    res.json({ hotlines });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Create hotline
const createHotline = async (req, res) => {
  try {
    const { name, phone, country, description } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ msg: 'Name and phone are required.' });
    }
    const hotline = new CrisisHotline({ name, phone, country, description });
    await hotline.save();
    res.status(201).json({ msg: 'Hotline created', hotline });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update hotline
const updateHotline = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const hotline = await CrisisHotline.findByIdAndUpdate(id, updates, { new: true });
    if (!hotline) return res.status(404).json({ msg: 'Hotline not found' });
    res.json({ msg: 'Hotline updated', hotline });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete hotline
const deleteHotline = async (req, res) => {
  try {
    const { id } = req.params;
    const hotline = await CrisisHotline.findByIdAndDelete(id);
    if (!hotline) return res.status(404).json({ msg: 'Hotline not found' });
    res.json({ msg: 'Hotline deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  getHotlines,
  createHotline,
  updateHotline,
  deleteHotline
};
const CrisisHotline = require('../models/CrisisHotline');

// Get all hotlines
const getHotlines = async (req, res) => {
  try {
    console.log('Get hotlines request');
    const hotlines = await CrisisHotline.find();
    console.log('Get hotlines - found:', hotlines.length);
    res.json({ hotlines });
  } catch (err) {
    console.error('Get hotlines error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Create hotline
const createHotline = async (req, res) => {
  try {
    const { name, phone, country, description } = req.body;
    console.log('Create hotline - body:', req.body);
    console.log('Create hotline - name:', name, 'phone:', phone);
    
    if (!name || !phone) {
      return res.status(400).json({ msg: 'Name and phone are required.' });
    }
    const hotline = new CrisisHotline({ name, phone, country, description });
    await hotline.save();
    res.status(201).json({ msg: 'hotline created', hotline });
  } catch (err) {
    console.error('Create hotline error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Update hotline
const updateHotline = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log('Update hotline - id:', id, 'updates:', updates);
    
    const hotline = await CrisisHotline.findByIdAndUpdate(id, updates, { new: true });
    console.log('Update hotline - found:', hotline ? 'Yes' : 'No');
    
    if (!hotline) return res.status(404).json({ msg: 'Hotline not found' });
    res.json({ msg: 'hotline updated', hotline });
  } catch (err) {
    console.error('Update hotline error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Delete hotline
const deleteHotline = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete hotline - id:', id);
    
    const hotline = await CrisisHotline.findByIdAndDelete(id);
    console.log('Delete hotline - found:', hotline ? 'Yes' : 'No');
    
    if (!hotline) return res.status(404).json({ msg: 'Hotline not found' });
    res.json({ msg: 'hotline deleted' });
  } catch (err) {
    console.error('Delete hotline error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = {
  getHotlines,
  createHotline,
  updateHotline,
  deleteHotline
};
const SupportGroup = require('../models/SupportGroup');
const mongoose = require('mongoose');

// Get all support groups
const getSupportGroups = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    
    console.log('Get support groups - category:', category);
    
    if (category) {
      query.category = category;
    }
    
    const groups = await SupportGroup.find(query).populate('members', 'email firstName lastName');
    console.log('Get support groups - found:', groups.length);
    res.json({ supportGroups: groups });
  } catch (err) {
    console.error('Get support groups error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Create a support group
const createSupportGroup = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    console.log('Create support group - body:', req.body, 'userId:', req.user._id);
    
    if (!name) {
      return res.status(400).json({ msg: 'Group name is required.' });
    }
    const group = new SupportGroup({ 
      name, 
      description, 
      category: category || 'general',
      createdBy: req.user._id 
    });
    await group.save();
    res.status(201).json({ msg: 'support group created', supportGroup: group });
  } catch (err) {
    console.error('Create support group error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Update a support group
const updateSupportGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log('Update support group - id:', id, 'updates:', updates);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid support group ID format' });
    }
    
    const group = await SupportGroup.findByIdAndUpdate(id, updates, { new: true });
    console.log('Update support group - found:', group ? 'Yes' : 'No');
    
    if (!group) return res.status(404).json({ msg: 'Support group not found' });
    res.json({ msg: 'support group updated', supportGroup: group });
  } catch (err) {
    console.error('Update support group error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Delete a support group
const deleteSupportGroup = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete support group - id:', id);
    
    const group = await SupportGroup.findByIdAndDelete(id);
    console.log('Delete support group - found:', group ? 'Yes' : 'No');
    
    if (!group) return res.status(404).json({ msg: 'Support group not found' });
    res.json({ msg: 'support group deleted' });
  } catch (err) {
    console.error('Delete support group error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Join a support group
const joinSupportGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // Get from JWT token
    console.log('Join support group - id:', id, 'userId:', userId);
    
    const group = await SupportGroup.findById(id);
    console.log('Join support group - found:', group ? 'Yes' : 'No');
    
    if (!group) return res.status(404).json({ msg: 'Support group not found' });
    if (group.members.includes(userId)) {
      return res.status(400).json({ msg: 'User already a member' });
    }
    group.members.push(userId);
    await group.save();
    res.json({ msg: 'joined support group' });
  } catch (err) {
    console.error('Join support group error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Leave a support group
const leaveSupportGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // Get from JWT token
    console.log('Leave support group - id:', id, 'userId:', userId);
    
    const group = await SupportGroup.findById(id);
    console.log('Leave support group - found:', group ? 'Yes' : 'No');
    
    if (!group) return res.status(404).json({ msg: 'Support group not found' });
    group.members = group.members.filter(member => member.toString() !== userId);
    await group.save();
    res.json({ msg: 'left support group' });
  } catch (err) {
    console.error('Leave support group error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = {
  getSupportGroups,
  createSupportGroup,
  updateSupportGroup,
  deleteSupportGroup,
  joinSupportGroup,
  leaveSupportGroup
};
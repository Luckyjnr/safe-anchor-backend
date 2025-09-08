const SupportGroup = require('../models/SupportGroup');

// Get all support groups
const getSupportGroups = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    const groups = await SupportGroup.find(query).populate('members', 'email firstName lastName');
    res.json({ supportGroups: groups });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Create a support group
const createSupportGroup = async (req, res) => {
  try {
    const { name, description, category } = req.body;
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
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update a support group
const updateSupportGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const group = await SupportGroup.findByIdAndUpdate(id, updates, { new: true });
    if (!group) return res.status(404).json({ msg: 'Support group not found' });
    res.json({ msg: 'support group updated', supportGroup: group });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a support group
const deleteSupportGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await SupportGroup.findByIdAndDelete(id);
    if (!group) return res.status(404).json({ msg: 'Support group not found' });
    res.json({ msg: 'support group deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Join a support group
const joinSupportGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    const group = await SupportGroup.findById(id);
    if (!group) return res.status(404).json({ msg: 'Support group not found' });
    if (group.members.includes(userId)) {
      return res.status(400).json({ msg: 'User already a member' });
    }
    group.members.push(userId);
    await group.save();
    res.json({ msg: 'joined support group' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Leave a support group
const leaveSupportGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    const group = await SupportGroup.findById(id);
    if (!group) return res.status(404).json({ msg: 'Support group not found' });
    group.members = group.members.filter(member => member.toString() !== userId);
    await group.save();
    res.json({ msg: 'left support group' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
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
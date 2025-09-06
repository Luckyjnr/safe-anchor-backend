const Resource = require('../models/Resource');

// Get all articles
const getArticles = async (req, res) => {
  try {
    const articles = await Resource.find({ type: 'article' });
    res.json({ articles });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all survivor stories
const getSurvivorStories = async (req, res) => {
  try {
    const stories = await Resource.find({ type: 'survivor-story' });
    res.json({ survivorStories: stories });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Create a resource (article or survivor story)
const createResource = async (req, res) => {
  try {
    const { type, title, content, author } = req.body;
    if (!type || !title || !content) {
      return res.status(400).json({ msg: 'Type, title, and content are required.' });
    }
    const resource = new Resource({ type, title, content, author });
    await resource.save();
    res.status(201).json({ msg: 'Resource created', resource });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update a resource
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const resource = await Resource.findByIdAndUpdate(id, updates, { new: true });
    if (!resource) return res.status(404).json({ msg: 'Resource not found' });
    res.json({ msg: 'Resource updated', resource });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a resource
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) return res.status(404).json({ msg: 'Resource not found' });
    res.json({ msg: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  getArticles,
  getSurvivorStories,
  createResource,
  updateResource,
  deleteResource
};
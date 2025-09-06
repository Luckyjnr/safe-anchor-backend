const Expert = require('../models/Expert');

const matchExpert = async (preferences) => {
  const query = {};
  if (preferences.specialization) {
    query.specialization = { $in: preferences.specialization };
  }
  // Add more filters as needed
  return await Expert.find(query).limit(5);
};

module.exports = { matchExpert };
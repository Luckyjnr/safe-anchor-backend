const Expert = require('../models/Expert');
const User = require('../models/User');

// Match experts based on victim preferences
const matchExpert = async (preferences) => {
  try {
    const { specialization, experience, languages, gender, ageRange } = preferences;
    
    // Build query based on preferences
    const query = { verificationStatus: 'verified', isActive: true };
    
    if (specialization && specialization.length > 0) {
      query.specialization = { $in: specialization };
    }
    
    // Get experts with populated user data
    let experts = await Expert.find(query).populate('userId');
    
    // Filter by additional criteria if needed
    if (gender || ageRange) {
      experts = experts.filter(expert => {
        const user = expert.userId;
        if (gender && user.gender !== gender) return false;
        if (ageRange) {
          const age = calculateAge(user.dateOfBirth);
          if (!isAgeInRange(age, ageRange)) return false;
        }
        return true;
      });
    }
    
    // Sort by rating and total sessions (more experienced first)
    experts.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.totalSessions - a.totalSessions;
    });
    
    // Return top 10 matches
    return experts.slice(0, 10);
  } catch (error) {
    console.error('Error in matching service:', error);
    return [];
  }
};

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper function to check if age is in range
const isAgeInRange = (age, ageRange) => {
  if (!age || !ageRange) return true;
  
  switch (ageRange) {
    case '18-25': return age >= 18 && age <= 25;
    case '26-35': return age >= 26 && age <= 35;
    case '36-45': return age >= 36 && age <= 45;
    case '46-55': return age >= 46 && age <= 55;
    case '55+': return age >= 55;
    default: return true;
  }
};

module.exports = { matchExpert };
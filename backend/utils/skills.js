import User from '../models/User.js';

// Bumps a trainee's skill percentages when they complete a course.
// Adds new skills at 20%, or increases existing ones by 20% (capped at 100).
export const updateSkillsOnCompletion = async (userId, skillsGained) => {
  if (!skillsGained || skillsGained.length === 0) return;

  const user = await User.findById(userId);
  if (!user) return;

  skillsGained.forEach((skillName) => {
    const existing = user.skills.find((s) => s.name === skillName);
    if (existing) {
      existing.pct = Math.min(100, existing.pct + 20);
    } else {
      user.skills.push({ name: skillName, pct: 20 });
    }
  });

  await user.save();
};
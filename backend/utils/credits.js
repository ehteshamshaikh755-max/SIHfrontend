import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';

// Adds (or deducts, if amount is negative) credits to a trainee's wallet
// and logs the transaction. Always use this instead of editing user.credits directly.
export async function awardCredits(userId, amount, label, icon = '🎓') {
  await User.findByIdAndUpdate(userId, { $inc: { credits: amount } });
  await CreditTransaction.create({
    user: userId,
    label,
    amount,
    type: amount >= 0 ? 'earn' : 'redeem',
    icon,
  });
}

// Same idea but for a trainer's contributionCredits balance.
export async function awardContributionCredits(userId, amount, label, icon = '✅') {
  await User.findByIdAndUpdate(userId, { $inc: { contributionCredits: amount } });
  await CreditTransaction.create({
    user: userId,
    label,
    amount,
    type: amount >= 0 ? 'earn' : 'redeem',
    icon,
  });
}

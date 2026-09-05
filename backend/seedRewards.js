// One-time script to seed a starter set of rewards.
// Run with: node seedRewards.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Reward from './models/Reward.js';

dotenv.config();

const REWARDS = [
  { title: 'Advanced Course Access Pass', desc: 'Unlock any Advanced-level course without prerequisite checks.', cost: 1000, icon: '🚀' },
  { title: 'Priority Mentor Session', desc: '30-minute 1:1 session with a senior domain trainer.', cost: 600, icon: '🧑‍🏫' },
  { title: 'e-Certificate Frame Upgrade', desc: 'Premium verified certificate design with holographic seal.', cost: 250, icon: '🖼️' },
  { title: 'Capacity Connect Merchandise Kit', desc: 'Notebook, pen and lanyard shipped to your office address.', cost: 400, icon: '🎒' },
  { title: 'Skip-the-Queue Support', desc: 'Priority helpdesk support for 30 days.', cost: 150, icon: '⚡' },
  { title: 'Leadership Bootcamp Seat', desc: 'Reserved seat in the quarterly in-person leadership bootcamp.', cost: 1500, icon: '🏛️' },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const existingCount = await Reward.countDocuments();
  if (existingCount > 0) {
    console.log(`Rewards already exist (${existingCount} found). Skipping seed.`);
    process.exit(0);
  }

  await Reward.insertMany(REWARDS);
  console.log(`Seeded ${REWARDS.length} rewards.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

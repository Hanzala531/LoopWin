import { User } from './Src/Models/user.Models.js';
import connectDB from './Src/Database/index.js';
import dotenv from 'dotenv';

dotenv.config();

await connectDB();

console.log('=== REFERRAL ANALYSIS ===');

const allUsers = await User.find({}).select('name phone referralCode referredBy referralCount rewards createdAt').sort({ createdAt: -1 }).limit(10);

console.log('\nLast 10 users:');
allUsers.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name} (${user.phone})`);
  console.log(`   Referral Code: ${user.referralCode || 'MISSING'}`);
  console.log(`   Referred By: ${user.referredBy || 'None'}`);
  console.log(`   Referral Count: ${user.referralCount}`);
  console.log(`   Rewards: ${user.rewards}`);
  console.log('');
});

// Check for users with referrals
const usersWithReferrals = await User.find({ referredBy: { $ne: null } }).select('name referredBy');
console.log(`\nUsers with referrals: ${usersWithReferrals.length}`);

// Check referral count accuracy
if (usersWithReferrals.length > 0) {
  const sampleReferralCode = usersWithReferrals[0].referredBy;
  const actualCount = await User.countDocuments({ referredBy: sampleReferralCode });
  const referrer = await User.findOne({ referralCode: sampleReferralCode }).select('name referralCount');
  
  console.log(`\nSample check for referral code: ${sampleReferralCode}`);
  console.log(`Referrer: ${referrer?.name}`);
  console.log(`Stored count: ${referrer?.referralCount}`);
  console.log(`Actual count: ${actualCount}`);
  console.log(`Match: ${referrer?.referralCount === actualCount ? 'YES' : 'NO'}`);
}

// Check all referral codes for accuracy
const allReferrers = await User.find({ referralCode: { $exists: true, $ne: null } }).select('name referralCode referralCount');
console.log(`\nChecking all ${allReferrers.length} referrers:`);

let incorrectCount = 0;
for (const referrer of allReferrers) {
  const actualCount = await User.countDocuments({ referredBy: referrer.referralCode });
  if (referrer.referralCount !== actualCount) {
    console.log(`❌ ${referrer.name}: stored=${referrer.referralCount}, actual=${actualCount}`);
    incorrectCount++;
  } else if (actualCount > 0) {
    console.log(`✅ ${referrer.name}: ${actualCount} referrals (correct)`);
  }
}

console.log(`\nSummary: ${incorrectCount} referrers have incorrect counts`);

process.exit(0);

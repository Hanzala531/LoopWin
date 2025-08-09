import { User } from './Src/Models/user.Models.js';
import connectDB from './Src/Database/index.js';
import dotenv from 'dotenv';

dotenv.config();

await connectDB();

console.log('=== TESTING POTENTIAL ISSUES ===');

// Check for potential issues:

// 1. Check if there are users without referral codes
const usersWithoutCodes = await User.find({ 
  $or: [
    { referralCode: { $exists: false } }, 
    { referralCode: null }, 
    { referralCode: "" }
  ] 
}).select('name phone createdAt');

console.log(`\n1. Users without referral codes: ${usersWithoutCodes.length}`);
if (usersWithoutCodes.length > 0) {
  console.log('First few users without codes:');
  usersWithoutCodes.slice(0, 5).forEach(user => {
    console.log(`   - ${user.name} (${user.phone}) created: ${user.createdAt}`);
  });
}

// 2. Check for case sensitivity issues in referral codes
const allReferralCodes = await User.find({ referralCode: { $exists: true, $ne: null } }).select('referralCode');
console.log(`\n2. Total referral codes in DB: ${allReferralCodes.length}`);

// Check for potential duplicates (case insensitive)
const codeMap = {};
let duplicates = 0;
allReferralCodes.forEach(user => {
  const code = user.referralCode.toLowerCase();
  if (codeMap[code]) {
    duplicates++;
    console.log(`   ⚠️  Potential duplicate: ${user.referralCode} vs ${codeMap[code]}`);
  } else {
    codeMap[code] = user.referralCode;
  }
});
console.log(`   Duplicate codes found: ${duplicates}`);

// 3. Check for referredBy codes that don't exist
const usersWithReferrals = await User.find({ referredBy: { $ne: null } }).select('name referredBy');
console.log(`\n3. Users with referrals: ${usersWithReferrals.length}`);

let orphanedReferrals = 0;
for (const user of usersWithReferrals) {
  const referrerExists = await User.findOne({ referralCode: user.referredBy });
  if (!referrerExists) {
    orphanedReferrals++;
    console.log(`   ❌ Orphaned referral: ${user.name} referred by non-existent code ${user.referredBy}`);
  }
}
console.log(`   Orphaned referrals: ${orphanedReferrals}`);

// 4. Check for inconsistent referral counts
console.log(`\n4. Checking referral count consistency...`);
const referrers = await User.find({ referralCode: { $exists: true, $ne: null } }).select('name referralCode referralCount rewards');

let inconsistentCounts = 0;
for (const referrer of referrers) {
  const actualCount = await User.countDocuments({ referredBy: referrer.referralCode });
  if (referrer.referralCount !== actualCount) {
    inconsistentCounts++;
    console.log(`   ❌ ${referrer.name}: stored=${referrer.referralCount}, actual=${actualCount}`);
  }
}
console.log(`   Inconsistent counts: ${inconsistentCounts}`);

// 5. Test the registration API parameters
console.log(`\n5. Testing API parameter variations that might cause issues:`);
console.log(`   The API accepts these referral parameter names:`);
console.log(`   - referralCode (main)`);
console.log(`   - referalCode (typo - one 'r')`);
console.log(`   - refCode (short)`);
console.log(`   - referral (alternative)`);

process.exit(0);

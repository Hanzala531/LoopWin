import { User } from './Src/Models/user.Models.js';
import connectDB from './Src/Database/index.js';
import dotenv from 'dotenv';

dotenv.config();

await connectDB();

console.log('=== INVESTIGATING SPECIFIC INCONSISTENCY ===');

// Find the problematic user
const problematicUser = await User.findOne({ name: 'Hanzala Tahir' }).select('name referralCode referralCount rewards');
console.log('Problematic user:', problematicUser);

if (problematicUser) {
  // Check who should be referred by this user
  const referredUsers = await User.find({ referredBy: problematicUser.referralCode }).select('name phone referredBy createdAt');
  console.log(`\nUsers referred by ${problematicUser.referralCode}:`, referredUsers);
  
  // Check if there are any users referred by similar codes (case sensitivity)
  const similarCodes = await User.find({ 
    referredBy: { $regex: new RegExp(`^${problematicUser.referralCode}$`, 'i') } 
  }).select('name phone referredBy');
  console.log('\nUsers with similar referral codes (case insensitive):', similarCodes);
  
  // Fix the inconsistency
  const actualCount = await User.countDocuments({ referredBy: problematicUser.referralCode });
  console.log(`\nActual count: ${actualCount}`);
  console.log(`Stored count: ${problematicUser.referralCount}`);
  
  // Update to correct count
  const updateResult = await User.updateOne(
    { _id: problematicUser._id },
    { $set: { referralCount: actualCount, rewards: actualCount } }
  );
  console.log('Update result:', updateResult);
  
  // Verify the fix
  const fixedUser = await User.findById(problematicUser._id).select('name referralCount rewards');
  console.log('After fix:', fixedUser);
}

// Also check for old users without referral codes and fix them
console.log('\n=== FIXING USERS WITHOUT REFERRAL CODES ===');
const usersWithoutCodes = await User.find({ 
  $or: [
    { referralCode: { $exists: false } }, 
    { referralCode: null }, 
    { referralCode: "" }
  ] 
});

console.log(`Found ${usersWithoutCodes.length} users without referral codes. Fixing...`);

for (const user of usersWithoutCodes) {
  console.log(`Fixing user: ${user.name} (${user.phone})`);
  // Trigger the pre-save hook to generate referral code
  await user.save();
  console.log(`  Generated code: ${user.referralCode}`);
}

console.log('\n✅ All fixes applied!');

process.exit(0);

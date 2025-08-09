import { User } from './Src/Models/user.Models.js';
import connectDB from './Src/Database/index.js';
import dotenv from 'dotenv';

dotenv.config();

await connectDB();

console.log('=== TESTING REFERRAL REGISTRATION ===');

// First, let's get an existing referral code to test with
const existingUser = await User.findOne({ referralCode: { $exists: true, $ne: null } }).select('name referralCode referralCount rewards');

if (!existingUser) {
  console.log('❌ No existing users with referral codes found!');
  process.exit(1);
}

console.log(`Found existing user: ${existingUser.name}`);
console.log(`Referral code: ${existingUser.referralCode}`);
console.log(`Current referral count: ${existingUser.referralCount}`);
console.log(`Current rewards: ${existingUser.rewards}`);

// Simulate the registration logic step by step
const testReferralCode = existingUser.referralCode;
const testPhone = `test${Date.now()}`;

console.log(`\n--- Simulating registration with referral code: ${testReferralCode} ---`);

// Step 1: Check if referral code exists (this is what the controller does)
const referrer = await User.findOne({ referralCode: testReferralCode }).select("_id referralCount rewards referralCode");
console.log(`Step 1 - Referrer found: ${referrer ? 'YES' : 'NO'}`);

if (referrer) {
  console.log(`Referrer ID: ${referrer._id}`);
  console.log(`Current referral count: ${referrer.referralCount}`);
  
  // Step 2: Create new user payload
  const newUserPayload = {
    name: "Test User",
    phone: testPhone,
    password: "testpassword123",
    referredBy: testReferralCode
  };
  
  console.log(`Step 2 - User payload created with referredBy: ${newUserPayload.referredBy}`);
  
  // Step 3: Create the user
  try {
    const newUser = await User.create(newUserPayload);
    console.log(`Step 3 - User created: ${newUser.name} (${newUser._id})`);
    console.log(`         Referral code: ${newUser.referralCode}`);
    console.log(`         Referred by: ${newUser.referredBy}`);
    
    // Step 4: Count users referred by this code (what the controller does)
    const count = await User.countDocuments({ referredBy: testReferralCode });
    console.log(`Step 4 - Count of users referred by ${testReferralCode}: ${count}`);
    
    // Step 5: Update the referrer's count
    const updateResult = await User.updateOne(
      { _id: referrer._id },
      { $set: { referralCount: count, rewards: count } }
    );
    console.log(`Step 5 - Update result:`, updateResult);
    
    // Step 6: Verify the update
    const updatedReferrer = await User.findById(referrer._id).select('name referralCount rewards');
    console.log(`Step 6 - Updated referrer: ${updatedReferrer.name}`);
    console.log(`         New referral count: ${updatedReferrer.referralCount}`);
    console.log(`         New rewards: ${updatedReferrer.rewards}`);
    
    // Cleanup - remove test user
    await User.findByIdAndDelete(newUser._id);
    console.log(`\n✅ Test completed successfully! Test user removed.`);
    
  } catch (error) {
    console.log(`❌ Error creating test user:`, error.message);
  }
}

process.exit(0);

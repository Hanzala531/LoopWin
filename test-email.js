import { sendTransactionEmail } from "./Src/Services/email.Services.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testEmail() {
    console.log("🧪 Testing email functionality...");
    console.log("Gmail User:", process.env.GMAIL_USER);
    console.log("Gmail Pass (first 4 chars):", process.env.GMAIL_PASS?.substring(0, 4) + "****");
    console.log("Gmail Pass Length:", process.env.GMAIL_PASS?.length);
    
    try {
        const result = await sendTransactionEmail({
            name: "Test User",
            phone: "+923001234567",
            transactionId: "TEST123456"
        });
        
        console.log("✅ Email test result:", result);
        
        if (result.success) {
            console.log("🎉 Email sent successfully!");
        } else {
            console.log("❌ Email failed:", result.error);
        }
        
    } catch (error) {
        console.error("❌ Email test error:", error.message);
        console.error("Full error:", error);
    }
}

testEmail();

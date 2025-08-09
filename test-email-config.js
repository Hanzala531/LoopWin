import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

console.log('Testing email configuration...');
console.log('GMAIL_USER:', process.env.GMAIL_USER ? 'SET' : 'MISSING');
console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? 'SET' : 'MISSING');

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.error('❌ Gmail credentials are missing!');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Test the connection
async function testEmailConnection() {
    try {
        console.log('Testing SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        
        // Send a test email
        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"Loop Win Test" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            subject: "Test Email - Loop Win",
            text: "This is a test email to verify the email configuration.",
            html: "<p>This is a test email to verify the email configuration.</p>"
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
        
        // Provide specific guidance based on the error
        if (error.message.includes('Invalid login')) {
            console.log('\n📋 Solutions:');
            console.log('1. Make sure you are using an App Password, not your regular Gmail password');
            console.log('2. Enable 2-Factor Authentication on your Gmail account');
            console.log('3. Generate a new App Password at: https://myaccount.google.com/apppasswords');
            console.log('4. Use the App Password in your .env file (without spaces)');
        } else if (error.message.includes('Missing credentials')) {
            console.log('\n📋 Check your .env file and make sure GMAIL_USER and GMAIL_PASS are set correctly');
        }
    }
}

testEmailConnection();

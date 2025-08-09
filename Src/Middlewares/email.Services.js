import nodemailer from "nodemailer";

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
export const sendTransactionEmail = async ({ 
  name, 
  phone, 
  transactionId, 
  productName = 'N/A', 
  productPrice = 0, 
  paymentScreenshot = null, 
  purchaseId = null 
}) => {
  // Debug: Check if credentials are available
  console.log('Email service debug:');
  console.log('GMAIL_USER:', process.env.GMAIL_USER ? 'SET' : 'MISSING');
  console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? 'SET' : 'MISSING');
  
  // Validate credentials before proceeding
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.error('Gmail credentials missing!');
    return { success: false, error: 'Gmail credentials not configured' };
  }

  const mailOptions = {
    from: `"Loop Win Notifications" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER, // your admin Gmail
    subject: `� New Payment Upload - Loop Win | Transaction: ${transactionId}`,
    text: `
NEW PAYMENT UPLOAD NOTIFICATION

Customer Details:
Name: ${name}
Phone: ${phone}

Purchase Details:
Product: ${productName}
Price: $${productPrice}
Purchase ID: ${purchaseId}
Transaction ID: ${transactionId}

Payment Screenshot: ${paymentScreenshot ? 'Uploaded' : 'Not provided'}
Screenshot URL: ${paymentScreenshot || 'N/A'}

Status: Payment uploaded - Requires admin approval

This is an automated notification from Loop Win.
Please review and approve the payment in the admin panel.
    `,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Loop Win - Payment Upload Notification</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0;">
  <div style="max-width: 650px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6a11cb, #2575fc); padding: 25px; text-align: center;">
      <h1 style="color: white; margin: 0;">🔔 Loop Win</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">New Payment Upload</p>
    </div>

    <!-- Content -->
    <div style="padding: 25px;">
      <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2575fc;">
        <h2 style="color: #2575fc; margin: 0 0 5px;">Payment Upload Alert</h2>
        <p style="margin: 0; color: #666;">A customer has uploaded payment screenshot and requires admin approval</p>
      </div>

      <!-- Customer Details -->
      <h3 style="color: #333; margin-bottom: 10px;">👤 Customer Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #333; width: 30%;">Name:</td>
          <td style="padding: 8px; color: #555;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #333;">Phone:</td>
          <td style="padding: 8px; color: #555;">${phone}</td>
        </tr>
      </table>

      <!-- Purchase Details -->
      <h3 style="color: #333; margin-bottom: 10px;">🛒 Purchase Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #333; width: 30%;">Product:</td>
          <td style="padding: 8px; color: #555;">${productName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #333;">Price:</td>
          <td style="padding: 8px; color: #555; font-weight: bold;">$${productPrice}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #333;">Purchase ID:</td>
          <td style="padding: 8px; color: #555; font-family: monospace;">${purchaseId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #333;">Transaction ID:</td>
          <td style="padding: 8px; color: #555; font-weight: bold; background: #fff3cd; padding: 12px; border-radius: 4px;">${transactionId}</td>
        </tr>
      </table>

      <!-- Payment Screenshot -->
      ${paymentScreenshot ? `
      <h3 style="color: #333; margin-bottom: 10px;">📸 Payment Screenshot</h3>
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${paymentScreenshot}" alt="Payment Screenshot" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      </div>
      <p style="text-align: center; margin-bottom: 20px;">
        <a href="${paymentScreenshot}" target="_blank" style="color: #2575fc; text-decoration: none; font-weight: bold;">🔗 View Full Screenshot</a>
      </p>
      ` : ''}

      <!-- Action Required -->
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
        <h3 style="color: #856404; margin: 0 0 10px;">⚠️ Action Required</h3>
        <p style="margin: 0; color: #856404;">Please review this payment upload and approve/reject it in the admin panel.</p>
      </div>

      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        This is an automated email from Loop Win to notify you of a payment upload that requires your review.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 13px; color: #888;">
      © ${new Date().getFullYear()} Loop Win. All rights reserved.
    </div>
  </div>
</body>
</html>
`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Transaction notification sent for ${transactionId}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send transaction email:`, error.message);
    return { success: false, error: error.message };
  }
};

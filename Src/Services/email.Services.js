import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendEmail = async ({ email, fullname, subject, text, html, phone }) => {
  // Email from customer to you (contact form submission)
  const mailOptions = {
    from: `"${fullname}" <${email}>`,
    // to: 'testmailhanzala@gmail.com',
    to: process.env.GMAIL_USER,
    subject: `New Contact Form: ${subject}`,
    text: `
Name: ${fullname}
Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subject}

Message:
${text}
`,
    html: html || `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f7f7f7; margin: 0; padding: 0;">
  <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-top: 20px; margin-bottom: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0056b3 0%, #003366 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-weight: 400; font-size: 24px;">New Contact Form Submission</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 14px;">Received on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <!-- Customer Info Box -->
      <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 5px solid #0056b3;">
        <h2 style="margin-top: 0; font-size: 18px; color: #0056b3; margin-bottom: 15px; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Customer Information</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; font-weight: bold; width: 100px; color: #555;">Name:</td>
            <td style="padding: 10px 0; color: #333;">${fullname}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #555;">Email:</td>
            <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #0056b3; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #555;">Phone:</td>
            <td style="padding: 10px 0;">${phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #555;">Subject:</td>
            <td style="padding: 10px 0;">${subject}</td>
          </tr>
        </table>
      </div>
      
      <!-- Message Box -->
      <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
        <h2 style="margin-top: 0; font-size: 18px; color: #0056b3; margin-bottom: 15px; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 5px;">
            <path fill="#0056b3" d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z M19,13H5v-2h14V13z M19,9H5V7h14V9z M19,5H5V3h14V5z"/>
          </svg>
          Message
        </h2>
        <div style="background-color: #f9f9f9; border-radius: 6px; padding: 20px; margin-top: 10px; color: #444; font-size: 15px; line-height: 1.7;">
          ${text.replace(/\n/g, '<br>')}
        </div>
        
        <div style="margin-top: 25px; text-align: center;">
          <a href="mailto:${email}" style="display: inline-block; background: #0056b3; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: 500;">Reply to ${fullname}</a>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
      <p style="margin: 0; color: #777; font-size: 13px;">This message was sent via the FK Cars contact form.</p>
      <p style="margin: 5px 0 0; color: #777; font-size: 13px;">© ${new Date().getFullYear()} FK Cars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email received from ${email}`);
    
    // Optional: Send confirmation email to the customer
    const confirmationOptions = {
      from: `"FK Cars" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Thank you for contacting FK Cars",
      text: `
Dear ${fullname},

Thank you for contacting FK Cars. We have received your inquiry and will get back to you shortly.

Best regards,
FK Cars Team
`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting FK Cars</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f7f7f7; margin: 0; padding: 0;">
  <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-top: 20px; margin-bottom: 20px;">
    
    <!-- Header with Logo -->
    <div style="background: linear-gradient(135deg, #0056b3 0%, #003366 100%); padding: 35px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">FK CARS</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 14px; font-style: italic;">Premium Automotive Solutions</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 30px;">
      <h2 style="color: #0056b3; margin-top: 0; margin-bottom: 20px; text-align: center; font-size: 22px;">Thank You for Contacting Us</h2>
      
      <p style="color: #444; font-size: 16px;">Dear ${fullname},</p>
      
      <p style="color: #444; font-size: 16px;">Thank you for reaching out to FK Cars. We have received your inquiry regarding "<strong>${subject}</strong>" and are excited to assist you.</p>
      
      <p style="color: #444; font-size: 16px;">Our dedicated team will review your message and get back to you as soon as possible. We strive to respond to all inquiries within 24-48 business hours.</p>
      
      <!-- Information Box -->
      <div style="background-color: #f0f7ff; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 5px solid #0056b3;">
        <h3 style="color: #0056b3; margin-top: 0; margin-bottom: 12px; font-size: 18px;">Inquiry Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 100px; color: #555;">Subject:</td>
            <td style="padding: 8px 0;">${subject}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Date:</td>
            <td style="padding: 8px 0;">${new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Time:</td>
            <td style="padding: 8px 0;">${new Date().toLocaleTimeString()}</td>
          </tr>
        </table>
        <p style="font-size: 14px; margin: 0; color: #666;">Reference #: ${Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
      </div>
      
      <p style="color: #444; font-size: 16px;">If you have any additional questions or information to provide, please feel free to reply to this email or contact us directly.</p>
      
      <p style="color: #444; font-size: 16px;">We appreciate your interest in FK Cars and look forward to serving you.</p>
      
      <p style="color: #444; font-size: 16px; margin-bottom: 0;">Best regards,</p>
      <p style="color: #444; font-size: 16px; font-weight: bold; margin-top: 5px;">The FK Cars Team</p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
        <a href="https://fkcars.com" style="display: inline-block; background: #0056b3; color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: 500; font-size: 16px;">Visit Our Website</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 25px; text-align: center; border-top: 1px solid #eaeaea;">
      <p style="margin: 0; color: #666; font-size: 14px;">© ${new Date().getFullYear()} FK Cars. All rights reserved.</p>
      <div style="margin-top: 15px;">
        <p style="margin: 5px 0; color: #666; font-size: 13px;">
          <strong>Contact Us:</strong> +123-456-7890 | info@fkcars.com
        </p>
        <p style="margin: 5px 0; color: #666; font-size: 13px;">
          123 Auto Lane, Car City, CC 12345
        </p>
      </div>
      
      <!-- Social Media Icons (Simple Unicode) -->
      <div style="margin-top: 15px;">
        <a href="#" style="color: #0056b3; text-decoration: none; margin: 0 10px; font-size: 20px;">&#xf39e;</a>
        <a href="#" style="color: #0056b3; text-decoration: none; margin: 0 10px; font-size: 20px;">&#xf099;</a>
        <a href="#" style="color: #0056b3; text-decoration: none; margin: 0 10px; font-size: 20px;">&#xf0e1;</a>
        <a href="#" style="color: #0056b3; text-decoration: none; margin: 0 10px; font-size: 20px;">&#xf16d;</a>
      </div>
      
      <p style="margin-top: 15px; color: #999; font-size: 12px;">
        This is an automated message. Please do not reply directly to this email.
      </p>
    </div>
  </div>
</body>
</html>
`
    };
    
    await transporter.sendMail(confirmationOptions);
    console.log(`Confirmation email sent to ${email}`);
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to process email for ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};


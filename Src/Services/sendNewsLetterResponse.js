import nodemailer from "nodemailer";
import { asyncHandler } from "../Utilities/asyncHandler.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendResponse = async ({ email }) => {
  try {
    const confirmationOptions = {
      from: `"FK Cars" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "🚗 Welcome to FK Cars Newsletter!",
      text: `
Thank you for subscribing to FK Cars Newsletter!

You're now part of our exclusive automotive community.

Best regards,
The FK Cars Team
`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FK Cars</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="500" style="max-width: 500px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0056b3, #003d82); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <div style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; line-height: 60px; text-align: center;">
                <span style="font-size: 25px;">🚗</span>
              </div>
              <h1 style="color: white; margin: 0 0 5px 0; font-size: 28px; font-weight: bold;">FK CARS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 12px; text-transform: uppercase;">Premium Automotive Excellence</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 25px 20px;">
              
              <!-- Welcome -->
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 30px;">🎉</span>
                <h2 style="color: #333; font-size: 22px; margin: 10px 0; font-weight: bold;">Thank You for Subscribing!</h2>
                <p style="color: #666; font-size: 14px; margin: 0;">Welcome to <strong>FK Cars</strong>! You're now part of our automotive community.</p>
              </div>
              
              <!-- Benefits -->
              <div style="background-color: #f8f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #0056b3; margin: 0 0 15px 0; font-size: 16px; text-align: center;">✨ What You'll Get</h3>
                
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td width="50%" style="padding: 8px; vertical-align: top;">
                      <div style="display: flex; align-items: center;">
                        <span style="margin-right: 8px; font-size: 16px;">🚗</span>
                        <span style="color: #333; font-size: 12px; font-weight: bold;">Latest Collections</span>
                      </div>
                    </td>
                    <td width="50%" style="padding: 8px; vertical-align: top;">
                      <div style="display: flex; align-items: center;">
                        <span style="margin-right: 8px; font-size: 16px;">💰</span>
                        <span style="color: #333; font-size: 12px; font-weight: bold;">Exclusive Deals</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; vertical-align: top;">
                      <div style="display: flex; align-items: center;">
                        <span style="margin-right: 8px; font-size: 16px;">📰</span>
                        <span style="color: #333; font-size: 12px; font-weight: bold;">Industry Insights</span>
                      </div>
                    </td>
                    <td style="padding: 8px; vertical-align: top;">
                      <div style="display: flex; align-items: center;">
                        <span style="margin-right: 8px; font-size: 16px;">🎊</span>
                        <span style="color: #333; font-size: 12px; font-weight: bold;">VIP Events</span>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 20px 0;">
                <a href="https://fkcars.com" style="display: inline-block; background: linear-gradient(135deg, #0056b3, #003d82); color: white; text-decoration: none; padding: 10px 25px; border-radius: 20px; font-weight: bold; font-size: 13px;">
                  🚗 Explore Collection
                </a>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
              
              <!-- Social Links -->
              <div style="margin-bottom: 15px;">
                <a href="#" style="display: inline-block; width: 30px; height: 30px; background: #3b5998; border-radius: 50%; color: white; text-decoration: none; line-height: 30px; font-size: 12px; margin: 0 3px;">f</a>
                <a href="#" style="display: inline-block; width: 30px; height: 30px; background: #1da1f2; border-radius: 50%; color: white; text-decoration: none; line-height: 30px; font-size: 12px; margin: 0 3px;">t</a>
                <a href="#" style="display: inline-block; width: 30px; height: 30px; background: #e4405f; border-radius: 50%; color: white; text-decoration: none; line-height: 30px; font-size: 12px; margin: 0 3px;">i</a>
              </div>
              
              <!-- Contact -->
              <p style="color: #666; margin: 5px 0; font-size: 11px;">
                📞 +1 (555) 123-4567 | ✉️ info@fkcars.com
              </p>
              
              <!-- Legal -->
              <p style="color: #999; margin: 10px 0 0 0; font-size: 10px;">
                © ${new Date().getFullYear()} FK Cars. All rights reserved.<br>
                <a href="#" style="color: #0056b3; text-decoration: none;">Unsubscribe</a> | 
                <a href="#" style="color: #0056b3; text-decoration: none;">Privacy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
    };

    const result = await transporter.sendMail(confirmationOptions);
    console.log(`Newsletter subscription confirmation sent to: ${email}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error(`Failed to send newsletter confirmation to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};
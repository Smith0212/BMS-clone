/**
 * Email Templates Utility
 * Professional and attractive email templates for Redeemplus
 */

const getEmailHeader = () => {
  return `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">
        Redeemplus
      </h1>
      <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 14px;">Your Trusted Rewards Platform</p>
    </div>
  `;
};

const getEmailFooter = () => {
  return `
    <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 3px solid #667eea; margin-top: 40px;">
      <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px;">
        <strong>Need Help?</strong>
      </p>
      <p style="color: #6c757d; margin: 0 0 20px 0; font-size: 13px;">
        If you have any questions or need assistance, please don't hesitate to contact our support team.
      </p>
      <div style="margin: 20px 0;">
        <p style="color: #6c757d; margin: 5px 0; font-size: 12px;">
          © ${new Date().getFullYear()} Redeemplus. All rights reserved.
        </p>
        <p style="color: #6c757d; margin: 5px 0; font-size: 12px;">
          This is an automated email, please do not reply to this message.
        </p>
      </div>
    </div>
  `;
};

const getEmailWrapper = (content) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redeemplus</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <tr>
                <td style="padding: 0;">
                  ${getEmailHeader()}
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="padding: 0;">
                  ${getEmailFooter()}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Generate OTP Email Template
 * @param {string} otp - The OTP code
 * @param {string} userName - Name of the user (optional)
 * @param {string} action - Action type (signup, login, etc.)
 * @returns {string} HTML email template
 */
const getOTPEmailTemplate = (otp, userName = 'User', action = 'signup') => {
  const actionText = action === 'signup' ? 'registration' : action === 'login' ? 'login' : 'verification';
  const expiryMinutes = 10;
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #ffffff; font-size: 32px; font-weight: bold;">🔐</span>
      </div>
      <h2 style="color: #333333; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">
        ${action === 'signup' ? 'Welcome to Redeemplus!' : 'Verification Code'}
      </h2>
      <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.6;">
        Hello ${userName},
      </p>
    </div>
    
    <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 5px;">
      <p style="color: #333333; margin: 0 0 15px 0; font-size: 15px; line-height: 1.6;">
        ${action === 'signup' 
          ? 'Thank you for joining Redeemplus! To complete your registration, please use the verification code below:'
          : 'Please use the following verification code to complete your ' + actionText + ':'
        }
      </p>
      
      <div style="text-align: center; margin: 25px 0;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: inline-block; padding: 20px 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
          <p style="color: #ffffff; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${otp}
          </p>
        </div>
      </div>
      
      <p style="color: #666666; margin: 15px 0 0 0; font-size: 14px; text-align: center; line-height: 1.6;">
        <strong style="color: #333333;">This code will expire in ${expiryMinutes} minutes.</strong>
      </p>
    </div>
    
    <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin: 25px 0;">
      <p style="color: #856404; margin: 0; font-size: 13px; line-height: 1.6;">
        <strong>⚠️ Security Tip:</strong> Never share this code with anyone. Redeemplus will never ask for your OTP via phone or email.
      </p>
    </div>
    
    <p style="color: #666666; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; text-align: center;">
      If you didn't request this code, please ignore this email or contact our support team.
    </p>
  `;
  
  return getEmailWrapper(content);
};

/**
 * Generate Password Reset Email Template
 * @param {string} userName - Name of the user
 * @param {string} resetLink - Password reset link
 * @param {number} expiryHours - Expiry time in hours (default: 1)
 * @returns {string} HTML email template
 */
const getPasswordResetEmailTemplate = (userName, resetLink, expiryHours = 1) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #ffffff; font-size: 32px; font-weight: bold;">🔑</span>
      </div>
      <h2 style="color: #333333; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">
        Password Reset Request
      </h2>
      <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.6;">
        Hello ${userName},
      </p>
    </div>
    
    <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 5px;">
      <p style="color: #333333; margin: 0 0 15px 0; font-size: 15px; line-height: 1.6;">
        We received a request to reset your password for your Redeemplus account. Click the button below to create a new password:
      </p>
    </div>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${resetLink}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: #ffffff; 
                padding: 16px 40px; 
                text-decoration: none; 
                border-radius: 8px; 
                display: inline-block; 
                font-size: 16px; 
                font-weight: 600; 
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;">
        Reset My Password
      </a>
    </div>
    
    <div style="background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 5px; padding: 15px; margin: 25px 0;">
      <p style="color: #004085; margin: 0 0 10px 0; font-size: 13px; line-height: 1.6;">
        <strong>🔗 Alternative Method:</strong> If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="color: #004085; margin: 0; font-size: 12px; word-break: break-all; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 10px; border-radius: 3px;">
        ${resetLink}
      </p>
    </div>
    
    <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin: 25px 0;">
      <p style="color: #856404; margin: 0; font-size: 13px; line-height: 1.6;">
        <strong>⏰ Important:</strong> This link will expire in <strong>${expiryHours} hour${expiryHours > 1 ? 's' : ''}</strong>. For security reasons, please reset your password as soon as possible.
      </p>
    </div>
    
    <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 25px 0;">
      <p style="color: #721c24; margin: 0; font-size: 13px; line-height: 1.6;">
        <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged. If you're concerned about your account security, please contact our support team immediately.
      </p>
    </div>
  `;
  
  return getEmailWrapper(content);
};

/**
 * Generate Sub-Admin Welcome Email Template
 * @param {string} name - Name of the sub-admin
 * @param {string} tempPassword - Temporary password
 * @param {string} adminPanelUrl - Admin panel URL
 * @returns {string} HTML email template
 */
const getSubAdminWelcomeEmailTemplate = (name, tempPassword, adminPanelUrl) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #ffffff; font-size: 32px; font-weight: bold;">👋</span>
      </div>
      <h2 style="color: #333333; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">
        Welcome to Redeemplus Admin Panel!
      </h2>
      <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.6;">
        Hello ${name},
      </p>
    </div>
    
    // <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 5px;">
    //   <p style="color: #333333; margin: 0 0 15px 0; font-size: 15px; line-height: 1.6;">
    //     Congratulations! Your sub-admin account has been successfully created. You now have access to the Redeemplus Admin Panel where you can manage various aspects of the platform.
    //   </p>
    // </div>
    
    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px solid #667eea; border-radius: 8px; padding: 25px; margin: 30px 0;">
      <p style="color: #333333; margin: 0 0 15px 0; font-size: 14px; font-weight: 600; text-align: center;">
        Your Temporary Login Credentials
      </p>
      <div style="background-color: #ffffff; border-radius: 5px; padding: 20px; margin: 15px 0; text-align: center;">
        <p style="color: #666666; margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
          Temporary Password
        </p>
        <p style="color: #667eea; margin: 0; font-size: 28px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 4px;">
          ${tempPassword}
        </p>
      </div>
    </div>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${adminPanelUrl}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: #ffffff; 
                padding: 16px 40px; 
                text-decoration: none; 
                border-radius: 8px; 
                display: inline-block; 
                font-size: 16px; 
                font-weight: 600; 
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
        Access Admin Panel
      </a>
    </div>
    
    <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin: 25px 0;">
      <p style="color: #856404; margin: 0 0 10px 0; font-size: 13px; line-height: 1.6;">
        <strong>🔒 Security Reminder:</strong>
      </p>
      <ul style="color: #856404; margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
        <li>Please change your password immediately after your first login</li>
        <li>Use a strong password with a combination of letters, numbers, and special characters</li>
        <li>Never share your login credentials with anyone</li>
        <li>If you suspect any unauthorized access, contact the main administrator immediately</li>
      </ul>
    </div>
    
    <div style="background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 5px; padding: 15px; margin: 25px 0;">
      <p style="color: #004085; margin: 0; font-size: 13px; line-height: 1.6;">
        <strong>📋 Next Steps:</strong>
      </p>
      <ol style="color: #004085; margin: 10px 0 0 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
        <li>Log in to the admin panel using your email and the temporary password above</li>
        <li>Change your password to something secure and memorable</li>
        <li>Familiarize yourself with the admin panel features and your assigned permissions</li>
        <li>If you have any questions, don't hesitate to contact the main administrator</li>
      </ol>
    </div>
    
    <p style="color: #666666; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; text-align: center;">
      We're excited to have you on board! Welcome to the Redeemplus team.
    </p>
  `;
  
  return getEmailWrapper(content);
};

module.exports = {
  getOTPEmailTemplate,
  getPasswordResetEmailTemplate,
  getSubAdminWelcomeEmailTemplate,
  getEmailWrapper,
  getEmailHeader,
  getEmailFooter
};


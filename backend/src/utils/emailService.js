const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'shreeshyamhub01@gmail.com',
      pass: process.env.EMAIL_PASS // App password from Gmail
    }
  });
};

// Send staff approval notification to admin
const sendStaffRequestNotification = async (staffRequest) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: 'shreeshyamhub01@gmail.com',
      to: 'shreeshyamhub01@gmail.com', // Admin email
      subject: '🔔 New Staff Registration Request - Ankisho Billing Software',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">💼 New Staff Registration Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Ankisho Billing Software - Admin Notification</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Staff Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${staffRequest.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${staffRequest.email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Phone:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${staffRequest.phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Request Date:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(staffRequest.requestDate).toLocaleDateString('en-IN')}</td>
              </tr>
              ${staffRequest.additionalInfo ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Additional Info:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${staffRequest.additionalInfo}</td>
              </tr>
              ` : ''}
            </table>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; margin-bottom: 20px;">Please login to your admin panel to approve or reject this request.</p>
              <a href="http://localhost:3000/staff-requests" style="background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">View Staff Requests</a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This is an automated notification from Ankisho Billing Software</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Staff request notification sent to admin');
  } catch (error) {
    console.error('Error sending staff request notification:', error);
  }
};

// Send approval confirmation to staff
const sendStaffApprovalEmail = async (staffData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: 'shreeshyamhub01@gmail.com',
      to: staffData.email,
      subject: '🎉 Welcome to Ankisho Billing Software - Account Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #45A049 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Welcome to Our Team!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been approved</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hello ${staffData.name}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Congratulations! Your staff registration request has been approved by the admin. 
              You can now access the Ankisho Billing Software with your credentials.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Your Login Details:</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${staffData.email}</p>
              <p style="margin: 5px 0;"><strong>Role:</strong> Staff Member</p>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">Use the password you created during registration</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:3000/login" style="background: linear-gradient(45deg, #4CAF50 30%, #45A049 90%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Login Now</a>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
              <h4 style="color: #1976d2; margin-top: 0;">What you can do:</h4>
              <ul style="color: #666; line-height: 1.8;">
                <li>Manage products and inventory</li>
                <li>Handle customer interactions</li>
                <li>Process sales and purchases</li>
                <li>Generate reports</li>
                <li>Access dashboard analytics</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>Welcome to the team! If you have any questions, please contact your administrator.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Approval email sent to staff:', staffData.email);
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
};

// Send rejection notification to staff
const sendStaffRejectionEmail = async (staffData, reason) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: 'shreeshyamhub01@gmail.com',
      to: staffData.email,
      subject: '📋 Update on Your Staff Registration Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📋 Registration Update</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Ankisho Billing Software</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hello ${staffData.name},</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Thank you for your interest in joining our team. After careful review, 
              we are unable to approve your staff registration request at this time.
            </p>
            
            ${reason ? `
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9800;">
              <h4 style="color: #F57C00; margin-top: 0;">Reason:</h4>
              <p style="color: #666; margin: 0;">${reason}</p>
            </div>
            ` : ''}
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              If you believe this is an error or would like to reapply in the future, 
              please contact the administrator for more information.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>Thank you for your understanding.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Rejection email sent to staff:', staffData.email);
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
};

module.exports = {
  sendStaffRequestNotification,
  sendStaffApprovalEmail,
  sendStaffRejectionEmail
};

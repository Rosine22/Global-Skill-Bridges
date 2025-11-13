const nodemailer = require('nodemailer');
require('dotenv').config();


class EmailService {
  constructor() {
    // Configure email transporter based on environment variables
    // Prefer SMTP_HOST/SMTP_PORT if provided; otherwise fallback to Gmail service
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '0', 10);
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: false,
        auth: { user, pass },
      });
    } else {
      // Fallback to Gmail service if specific host not configured
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: user || process.env.GMAIL_USER || process.env.SMTP_USER,
          pass: pass || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS,
        },
      });
    }

  // Use deployed frontend URL as the default fallback so emails/links point to production
  this.baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_BASE_URL || 'https://global-skill-bridges-git-2fd38f-uwinezarosine16-2552s-projects.vercel.app';
  }

  /**
   * Send application status update email
   */
  async sendApplicationStatusUpdate(application, user, newStatus) {
    try {
      const templates = this.getStatusEmailTemplate(application, user, newStatus);
      
      const mailOptions = {
        from: `"Global Skills Bridge" <${process.env.FROM_EMAIL || 'globalskills4@gmail.com'}>`,
        to: user.email,
        subject: templates.subject,
        html: templates.html,
        text: templates.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send interview scheduled email
   */
  async sendInterviewScheduledEmail(application, user, interviewDetails) {
    try {
      const templates = this.getInterviewEmailTemplate(application, user, interviewDetails);
      
      const mailOptions = {
        from: `"Global Skills Bridge" <${process.env.FROM_EMAIL || 'globalskills4@gmail.com'}>`,
        to: user.email,
        subject: templates.subject,
        html: templates.html,
        text: templates.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Interview email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending interview email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send job offer email
   */
  async sendJobOfferEmail(application, user, offerDetails) {
    try {
      const templates = this.getOfferEmailTemplate(application, user, offerDetails);
      
      const mailOptions = {
        from: `"Global Skills Bridge" <${process.env.FROM_EMAIL || 'globalskills4@gmail.com'}>`,
        to: user.email,
        subject: templates.subject,
        html: templates.html,
        text: templates.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Job offer email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending job offer email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, resetToken, user) {
    try {
      const resetUrl = `${this.baseUrl}/reset-password/${resetToken}`;
      const templates = this.getPasswordResetEmailTemplate(email, resetUrl, user);
      
      const mailOptions = {
        from: `"Global Skills Bridge" <${process.env.FROM_EMAIL || 'globalskills4@gmail.com'}>`,
        to: email,
        subject: templates.subject,
        html: templates.html,
        text: templates.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email verification email
   */
  async sendEmailVerificationEmail(email, verificationToken, user) {
    try {
      const verificationUrl = `${this.baseUrl}/verify-email/${verificationToken}`;
      const templates = this.getEmailVerificationTemplate(email, verificationUrl, user);
      
      const mailOptions = {
        from: `"Global Skills Bridge" <${process.env.FROM_EMAIL || 'globalskills4@gmail.com'}>`,
        to: email,
        subject: templates.subject,
        html: templates.html,
        text: templates.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email verification sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get email template for application status updates
   */
  getStatusEmailTemplate(application, user, newStatus) {
    const applicationUrl = `${this.baseUrl}/applications/${application._id}`;
    const dashboardUrl = `${this.baseUrl}/dashboard`;

    const statusMessages = {
      'under-review': {
        subject: `Your application for ${application.job?.title} is now under review`,
        greeting: 'Good news!',
        message: `Your application for the position of ${application.job?.title} at ${application.job?.company} is now being reviewed by our hiring team.`,
        action: 'We\'ll keep you updated on the progress of your application.'
      },
      'shortlisted': {
        subject: `🎉 You've been shortlisted for ${application.job?.title}!`,
        greeting: 'Congratulations!',
        message: `You have been shortlisted for the position of ${application.job?.title} at ${application.job?.company}. Your profile impressed our hiring team!`,
        action: 'We\'ll be in touch soon with next steps.'
      },
      'interview-scheduled': {
        subject: `Interview scheduled for ${application.job?.title} position`,
        greeting: 'Interview Invitation',
        message: `An interview has been scheduled for your application to ${application.job?.title} at ${application.job?.company}.`,
        action: 'Please check your dashboard for interview details and be prepared for the conversation.'
      },
      'hired': {
        subject: `🎊 Congratulations! You've been selected for ${application.job?.title}`,
        greeting: 'Welcome to the team!',
        message: `Congratulations! We are pleased to offer you the position of ${application.job?.title} at ${application.job?.company}.`,
        action: 'Please check your dashboard for offer details and next steps.'
      },
      'rejected': {
        subject: `Update on your application for ${application.job?.title}`,
        greeting: 'Thank you for your interest',
        message: `Thank you for your interest in the ${application.job?.title} position at ${application.job?.company}. After careful consideration, we have decided to move forward with other candidates.`,
        action: 'We encourage you to apply for other positions that match your skills and experience.'
      }
    };

    const template = statusMessages[newStatus] || statusMessages['under-review'];

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 12px; }
          .status-${newStatus} { background: ${this.getStatusColor(newStatus)}; color: white; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Global Skills Bridge</h1>
          <p>Connecting talent with opportunity</p>
        </div>
        <div class="content">
          <h2>${template.greeting}</h2>
          <p>Dear ${user.name},</p>
          <p>${template.message}</p>
          
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3>Application Details</h3>
            <p><strong>Position:</strong> ${application.job?.title}</p>
            <p><strong>Company:</strong> ${application.job?.company}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${newStatus}">${newStatus.replace('-', ' ')}</span></p>
            <p><strong>Applied:</strong> ${new Date(application.createdAt).toLocaleDateString()}</p>
          </div>

          <p>${template.action}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${applicationUrl}" class="button">View Application Details</a>
            <br>
            <a href="${dashboardUrl}" class="button" style="background: #28a745;">Go to Dashboard</a>
          </div>

          <p>Best regards,<br>
          The Global Skills Bridge Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>If you have any questions, please contact us through your dashboard or visit our support center.</p>
          <p>&copy; ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      ${template.greeting}

      Dear ${user.name},

      ${template.message}

      Application Details:
      - Position: ${application.job?.title}
      - Company: ${application.job?.company}
      - Status: ${newStatus.replace('-', ' ')}
      - Applied: ${new Date(application.createdAt).toLocaleDateString()}

      ${template.action}

      View your application: ${applicationUrl}
      Go to Dashboard: ${dashboardUrl}

      Best regards,
      The Global Skills Bridge Team

      ---
      This is an automated message. Please do not reply to this email.
      If you have any questions, please contact us through your dashboard.
      © ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.
    `;

    return {
      subject: template.subject,
      html,
      text
    };
  }

  /**
   * Get email template for interview scheduling
   */
  getInterviewEmailTemplate(application, user, interviewDetails) {
    const applicationUrl = `${this.baseUrl}/applications/${application._id}`;
    const dashboardUrl = `${this.baseUrl}/dashboard`;

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
    };

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Scheduled - ${application.job?.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 20px 0; }
          .interview-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #28a745; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Interview Scheduled!</h1>
          <p>You're one step closer to your dream job</p>
        </div>
        <div class="content">
          <h2>Great News!</h2>
          <p>Dear ${user.name},</p>
          <p>Congratulations! ${application.job?.company} has scheduled an interview for your application to the <strong>${application.job?.title}</strong> position.</p>
          
          <div class="interview-details">
            <h3>📅 Interview Details</h3>
            <p><strong>Date & Time:</strong> ${formatDate(interviewDetails.scheduledDate)}</p>
            <p><strong>Duration:</strong> ${interviewDetails.duration} minutes</p>
            <p><strong>Type:</strong> ${interviewDetails.type.charAt(0).toUpperCase() + interviewDetails.type.slice(1)} Interview</p>
            ${interviewDetails.location ? `<p><strong>Location:</strong> ${interviewDetails.location}</p>` : ''}
            ${interviewDetails.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${interviewDetails.meetingLink}">${interviewDetails.meetingLink}</a></p>` : ''}
            
            <h4>👤 Your Interviewer</h4>
            <p><strong>Name:</strong> ${interviewDetails.interviewer.name}</p>
            <p><strong>Title:</strong> ${interviewDetails.interviewer.title}</p>
            <p><strong>Email:</strong> ${interviewDetails.interviewer.email}</p>
          </div>

          <h3>💡 Interview Tips</h3>
          <ul>
            <li>Review the job description and your application</li>
            <li>Research the company and its recent developments</li>
            <li>Prepare questions about the role and company culture</li>
            <li>Test your technology if it's a video interview</li>
            <li>Arrive 5-10 minutes early (or join the call early)</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${applicationUrl}" class="button">View Application Details</a>
            <br>
            <a href="${dashboardUrl}" class="button" style="background: #28a745;">Go to Dashboard</a>
          </div>

          <p>We're excited for you and wish you the best of luck!</p>
          
          <p>Best regards,<br>
          The Global Skills Bridge Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>If you need to reschedule or have any questions, please contact the interviewer directly or reach out through your dashboard.</p>
          <p>&copy; ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      🎉 Interview Scheduled!

      Dear ${user.name},

      Congratulations! ${application.job?.company} has scheduled an interview for your application to the ${application.job?.title} position.

      📅 Interview Details:
      - Date & Time: ${formatDate(interviewDetails.scheduledDate)}
      - Duration: ${interviewDetails.duration} minutes
      - Type: ${interviewDetails.type.charAt(0).toUpperCase() + interviewDetails.type.slice(1)} Interview
      ${interviewDetails.location ? `- Location: ${interviewDetails.location}` : ''}
      ${interviewDetails.meetingLink ? `- Meeting Link: ${interviewDetails.meetingLink}` : ''}

      👤 Your Interviewer:
      - Name: ${interviewDetails.interviewer.name}
      - Title: ${interviewDetails.interviewer.title}
      - Email: ${interviewDetails.interviewer.email}

      💡 Interview Tips:
      - Review the job description and your application
      - Research the company and its recent developments
      - Prepare questions about the role and company culture
      - Test your technology if it's a video interview
      - Arrive 5-10 minutes early

      View your application: ${applicationUrl}
      Go to Dashboard: ${dashboardUrl}

      We're excited for you and wish you the best of luck!

      Best regards,
      The Global Skills Bridge Team

      ---
      This is an automated message. Please do not reply to this email.
      If you need to reschedule or have any questions, please contact the interviewer directly.
      © ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.
    `;

    return {
      subject: `🎉 Interview Scheduled - ${application.job?.title} at ${application.job?.company}`,
      html,
      text
    };
  }

  /**
   * Get email template for job offers
   */
  getOfferEmailTemplate(application, user, offerDetails) {
    const applicationUrl = `${this.baseUrl}/applications/${application._id}`;
    const dashboardUrl = `${this.baseUrl}/dashboard`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Offer - ${application.job?.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #28a745; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 20px 0; }
          .offer-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #28a745; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎊 Congratulations!</h1>
          <p>You've got the job!</p>
        </div>
        <div class="content">
          <h2>Welcome to the Team!</h2>
          <p>Dear ${user.name},</p>
          <p>We are thrilled to extend an offer for the position of <strong>${application.job?.title}</strong> at ${application.job?.company}!</p>
          
          ${offerDetails ? `
          <div class="offer-details">
            <h3>💼 Offer Details</h3>
            ${offerDetails.salary ? `<p><strong>Salary:</strong> ${offerDetails.currency || '$'} ${offerDetails.salary.toLocaleString()}</p>` : ''}
            ${offerDetails.startDate ? `<p><strong>Start Date:</strong> ${new Date(offerDetails.startDate).toLocaleDateString()}</p>` : ''}
            ${offerDetails.benefits && offerDetails.benefits.length > 0 ? `
            <p><strong>Benefits:</strong></p>
            <ul>
              ${offerDetails.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
            </ul>
            ` : ''}
          </div>
          ` : ''}

          <p>Your skills, experience, and interview performance impressed our team, and we believe you'll be a valuable addition to our organization.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${applicationUrl}" class="button">View Offer Details</a>
            <br>
            <a href="${dashboardUrl}" class="button" style="background: #667eea;">Go to Dashboard</a>
          </div>

          <p>Please review the offer details in your dashboard and let us know your decision. We're excited about the possibility of you joining our team!</p>
          
          <p>Congratulations again, and welcome aboard!</p>
          
          <p>Best regards,<br>
          The Hiring Team at ${application.job?.company}<br>
          Global Skills Bridge</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>For questions about your offer, please contact the hiring team through your dashboard.</p>
          <p>&copy; ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      🎊 Congratulations! You've got the job!

      Dear ${user.name},

      We are thrilled to extend an offer for the position of ${application.job?.title} at ${application.job?.company}!

      ${offerDetails ? `
      💼 Offer Details:
      ${offerDetails.salary ? `- Salary: ${offerDetails.currency || '$'} ${offerDetails.salary.toLocaleString()}` : ''}
      ${offerDetails.startDate ? `- Start Date: ${new Date(offerDetails.startDate).toLocaleDateString()}` : ''}
      ${offerDetails.benefits && offerDetails.benefits.length > 0 ? `- Benefits: ${offerDetails.benefits.join(', ')}` : ''}
      ` : ''}

      Your skills, experience, and interview performance impressed our team, and we believe you'll be a valuable addition to our organization.

      Please review the offer details in your dashboard and let us know your decision.

      View offer details: ${applicationUrl}
      Go to Dashboard: ${dashboardUrl}

      Congratulations again, and welcome aboard!

      Best regards,
      The Hiring Team at ${application.job?.company}
      Global Skills Bridge

      ---
      This is an automated message. Please do not reply to this email.
      For questions about your offer, please contact the hiring team through your dashboard.
      © ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.
    `;

    return {
      subject: `🎊 Job Offer - ${application.job?.title} at ${application.job?.company}`,
      html,
      text
    };
  }

  /**
   * Get email template for password reset
   */
  getPasswordResetEmailTemplate(email, resetUrl, user) {
    const dashboardUrl = `${this.baseUrl}/dashboard`;
    const userName = user ? user.name : email.split('@')[0];

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Global Skills Bridge</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; margin: 20px 0; font-weight: bold; text-align: center; }
          .security-notice { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .reset-link { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Reset Your Password</h1>
          <p>Global Skills Bridge Security</p>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>We received a request to reset your password for your Global Skills Bridge account associated with this email address.</p>
          
          <div class="reset-link">
            <h3>Click the button below to reset your password:</h3>
            <a href="${resetUrl}" class="button">Reset My Password</a>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              Or copy and paste this link in your browser:<br>
              <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>

          <div class="security-notice">
            <h4>🔒 Security Information:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>This link will expire in 1 hour for security reasons</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password won't be changed until you create a new one</li>
              <li>Make sure to choose a strong, unique password</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="color: #667eea; text-decoration: none;">← Back to Global Skills Bridge</a>
          </div>

          <p>If you're having trouble with the button above, copy and paste the URL into your web browser.</p>
          
          <p>Best regards,<br>
          The Global Skills Bridge Security Team</p>
        </div>
        <div class="footer">
          <p><strong>Didn't request this?</strong> If you didn't ask to reset your password, you can safely ignore this email. Your password will remain unchanged.</p>
          <p>For security questions, contact us through your dashboard or visit our help center.</p>
          <p>&copy; ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      🔐 Reset Your Password - Global Skills Bridge

      Hello ${userName},

      We received a request to reset your password for your Global Skills Bridge account associated with this email address.

      To reset your password, please visit the following link:
      ${resetUrl}

      🔒 Security Information:
      - This link will expire in 1 hour for security reasons
      - If you didn't request this reset, please ignore this email
      - Your password won't be changed until you create a new one
      - Make sure to choose a strong, unique password

      If you're having trouble with the link above, copy and paste it into your web browser.

      Didn't request this? If you didn't ask to reset your password, you can safely ignore this email. Your password will remain unchanged.

      Best regards,
      The Global Skills Bridge Security Team

      ---
      For security questions, contact us through your dashboard or visit our help center.
      © ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.
    `;

    return {
      subject: '🔐 Reset your Global Skills Bridge password',
      html,
      text
    };
  }

  /**
   * Get email template for email verification
   */
  getEmailVerificationTemplate(email, verificationUrl, user) {
    const dashboardUrl = `${this.baseUrl}/dashboard`;
    const userName = user ? user.name : email.split('@')[0];

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Global Skills Bridge</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #28a745; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .verification-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #28a745; text-align: center; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✉️ Verify Your Email</h1>
          <p>Welcome to Global Skills Bridge!</p>
        </div>
        <div class="content">
          <h2>Almost there!</h2>
          <p>Hello ${userName},</p>
          <p>Thank you for joining Global Skills Bridge! To complete your account setup and start connecting with opportunities, please verify your email address.</p>
          
          <div class="verification-box">
            <h3>Click the button below to verify your email:</h3>
            <a href="${verificationUrl}" class="button">Verify My Email</a>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              Or copy and paste this link in your browser:<br>
              <a href="${verificationUrl}" style="color: #28a745; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>

          <h3>✨ What's next after verification?</h3>
          <ul>
            <li>Complete your profile to get better job matches</li>
            <li>Start browsing thousands of job opportunities</li>
            <li>Connect with mentors and industry professionals</li>
            <li>Access skills verification and training programs</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="color: #28a745; text-decoration: none;">Go to Dashboard →</a>
          </div>
          
          <p>Welcome aboard, and we look forward to helping you achieve your career goals!</p>
          
          <p>Best regards,<br>
          The Global Skills Bridge Team</p>
        </div>
        <div class="footer">
          <p>If you didn't create an account with Global Skills Bridge, you can safely ignore this email.</p>
          <p>Need help? Contact us through your dashboard or visit our support center.</p>
          <p>&copy; ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      ✉️ Verify Your Email - Global Skills Bridge

      Hello ${userName},

      Thank you for joining Global Skills Bridge! To complete your account setup and start connecting with opportunities, please verify your email address.

      To verify your email, please visit the following link:
      ${verificationUrl}

      ✨ What's next after verification?
      - Complete your profile to get better job matches
      - Start browsing thousands of job opportunities
      - Connect with mentors and industry professionals
      - Access skills verification and training programs

      Welcome aboard, and we look forward to helping you achieve your career goals!

      Go to Dashboard: ${dashboardUrl}

      Best regards,
      The Global Skills Bridge Team

      ---
      If you didn't create an account with Global Skills Bridge, you can safely ignore this email.
      Need help? Contact us through your dashboard or visit our support center.
      © ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.
    `;

    return {
      subject: '✉️ Verify your Global Skills Bridge email address',
      html,
      text
    };
  }

  /**
   * Get status color for email templates
   */
  getStatusColor(status) {
    const colors = {
      'submitted': '#007bff',
      'under-review': '#ffc107',
      'shortlisted': '#28a745',
      'interview-scheduled': '#6f42c1',
      'hired': '#17a2b8',
      'rejected': '#dc3545'
    };
    return colors[status] || '#6c757d';
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send emails');
      return { success: true };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send employer account approval notification
   */
  async sendEmployerApprovalEmail(employer, status, adminMessage = '') {
    try {
      const templates = this.getEmployerApprovalTemplate(employer, status, adminMessage);
      
      const mailOptions = {
        from: `"Global Skills Bridge Admin" <${process.env.FROM_EMAIL || 'globalskills4@gmail.com'}>`,
        to: employer.email,
        subject: templates.subject,
        html: templates.html,
        text: templates.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Employer approval email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending employer approval email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send new employer registration notification to admin
   */
  async sendNewEmployerNotificationToAdmin(employer) {
    try {
      const templates = this.getNewEmployerAdminTemplate(employer);
      
      const mailOptions = {
        from: `"Global Skills Bridge System" <${process.env.FROM_EMAIL || 'globalskills4@gmail.com'}>`,
        to: process.env.ADMIN_EMAIL || 'admin@globalskillsbridge.com',
        cc: process.env.RTB_ADMIN_EMAIL || 'rtb@rtb.gov.rw',
        subject: templates.subject,
        html: templates.html,
        text: templates.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Admin notification email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending admin notification email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to new job seeker
   */
  async sendJobSeekerWelcomeEmail(user) {
    try {
      const templates = this.getJobSeekerWelcomeTemplate(user);
      
      const mailOptions = {
        from: `"Global Skills Bridge" <${process.env.FROM_EMAIL || 'globalskills4@gmail.com'}>`,
        to: user.email,
        subject: templates.subject,
        html: templates.html,
        text: templates.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send new job application notification to employer
   */
  async sendNewApplicationNotificationToEmployer(application, jobSeeker, employer) {
    try {
      const templates = this.getNewApplicationEmployerTemplate(application, jobSeeker, employer);
      
      const mailOptions = {
        from: `"Global Skills Bridge" <${process.env.FROM_EMAIL || 'globalskills4@gmail.com'}>`,
        to: employer.email,
        subject: templates.subject,
        html: templates.html,
        text: templates.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Employer notification email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending employer notification email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send mentorship request notification
   */
  async sendMentorshipRequestEmail(mentorshipRequest, mentor, jobSeeker) {
    try {
      const templates = this.getMentorshipRequestTemplate(mentorshipRequest, mentor, jobSeeker);
      
      const mailOptions = {
        from: `"Global Skills Bridge" <${process.env.FROM_EMAIL || 'globalskills4@gmail.com'}>`,
        to: mentor.email,
        subject: templates.subject,
        html: templates.html,
        text: templates.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Mentorship request email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending mentorship request email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get employer approval email template
   */
  

  /**
   * Get new employer admin notification template
   */
  getNewEmployerAdminTemplate(employer) {
    const reviewUrl = `${this.baseUrl}/admin/employer-approvals`;
    // Normalize company info fields for backward compatibility
    const companyName = employer.companyInfo?.name || employer.companyName || employer.name || 'Company';
    const contactPerson = employer.companyInfo?.contactPerson || employer.contactPerson || employer.name || companyName;
    const phone = employer.companyInfo?.phone || employer.phone || 'Not provided';
    const industry = employer.companyInfo?.industry || employer.industry || 'Not provided';
    const size = employer.companyInfo?.size || employer.companySize || 'Not provided';
    const location = employer.companyInfo?.location || employer.location || 'Not provided';
    const website = employer.companyInfo?.website || employer.website || 'Not provided';
    const registrationNumber = employer.companyInfo?.registrationNumber || employer.companyRegistration || 'Not provided';

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Employer Registration - Admin Review Required</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #6f42c1 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #dc3545; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .employer-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc3545; }
          .urgent { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1> Admin Alert</h1>
          <p>New Employer Registration Pending Review</p>
        </div>
        <div class="content">
          <h2>Action Required: New Employer Application</h2>
          <p>Dear Admin,</p>
          <p>A new employer has registered and requires approval before they can access the platform.</p>
          
          <div class="urgent">
            <h4> Review Required</h4>
            <p>This employer account is pending approval and waiting for administrative review.</p>
          </div>

          <div class="employer-details">
            <h3>Company Details</h3>
            <p><strong>Company Name:</strong> ${companyName}</p>
            <p><strong>Contact Person:</strong> ${contactPerson}</p>
            <p><strong>Email:</strong> ${employer.email}</p>
            <p><strong>Phone:</strong> ${employer.phone || (employer.companyInfo && employer.companyInfo.phone) || 'Not provided'}</p>
            <p><strong>Industry:</strong> ${industry}</p>
            <p><strong>Company Size:</strong> ${employer.companyInfo?.size || employer.companySize || 'Not provided'}</p>
            <p><strong>Location:</strong> ${companyLocation}</p>
            <p><strong>Website:</strong> ${employer.companyInfo?.website || employer.website || 'Not provided'}</p>
            <p><strong>Registration Date:</strong> ${new Date(employer.createdAt).toLocaleDateString()}</p>
            <p><strong>Company Registration:</strong> ${employer.companyInfo?.registrationNumber || employer.companyRegistration || 'Not provided'}</p>
            <p><strong>Tax ID:</strong> ${employer.taxId || 'Not provided'}</p>
          </div>

          <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4>Company Description:</h4>
            <p style="margin: 0;">${employer.description || 'No description provided'}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reviewUrl}" class="button">Review Application</a>
          </div>

          <p>Please review this application and approve or reject it based on our platform guidelines.</p>

          <p>Best regards,<br>
          Global Skills Bridge System</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Global Skills Bridge.</p>
          <p>&copy; ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
  New Employer Registration - Admin Review Required

      Dear Admin,

      A new employer has registered and requires approval before they can access the platform.

  Company Details:
  - Company Name: ${companyName}
  - Contact Person: ${contactPerson}
  - Email: ${employer.email}
  - Phone: ${phone}
  - Industry: ${industry}
  - Company Size: ${size}
  - Location: ${location}
  - Website: ${website}
  - Registration Date: ${new Date(employer.createdAt).toLocaleDateString()}
  - Company Registration: ${registrationNumber}
  - Tax ID: ${employer.taxId || 'Not provided'}

      Company Description: ${employer.description || 'No description provided'}

      Review Application: ${reviewUrl}

      Please review this application and approve or reject it based on our platform guidelines.

      Best regards,
      Global Skills Bridge System

      ---
      This is an automated notification from Global Skills Bridge.
      © ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.
    `;

    return {
      subject: ' New Employer Registration Pending Review - Global Skills Bridge',
      html,
      text
    };
  }

  /**
   * Get job seeker welcome email template
   */
  getJobSeekerWelcomeTemplate(user) {
    const dashboardUrl = `${this.baseUrl}/dashboard`;
    const profileUrl = `${this.baseUrl}/profile`;
    const skillsUrl = `${this.baseUrl}/skills-verification`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Global Skills Bridge</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .steps { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .step { padding: 15px 0; border-bottom: 1px solid #eee; }
          .step:last-child { border-bottom: none; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1> Welcome to Global Skills Bridge!</h1>
          <p>Your journey to global opportunities starts here</p>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>Welcome to Global Skills Bridge - the platform connecting TVET graduates with verified global employment opportunities.</p>
          
          <div class="steps">
            <h3> Get Started in 3 Easy Steps:</h3>
            <div class="step">
              <h4>1. Complete Your Profile</h4>
              <p>Add your skills, education, and experience to showcase your qualifications to employers worldwide.</p>
            </div>
            <div class="step">
              <h4>2. Verify Your Skills</h4>
              <p>Get your competencies verified through our secure blockchain system to build trust with employers.</p>
            </div>
            <div class="step">
              <h4>3. Apply for Global Opportunities</h4>
              <p>Browse and apply to job opportunities that match your skills and career goals.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            <a href="${profileUrl}" class="button">Complete Profile</a>
            <a href="${skillsUrl}" class="button">Verify Skills</a>
          </div>

          <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4> What You Can Do:</h4>
            <ul>
              <li>Access thousands of global job opportunities</li>
              <li>Get mentorship from industry experts</li>
              <li>Verify your skills with blockchain technology</li>
              <li>Connect with Rwandan diaspora professionals</li>
              <li>Build your professional network</li>
            </ul>
          </div>

          <p>Need help getting started? Our support team is here to assist you every step of the way.</p>

          <p>Best regards,<br>
          The Global Skills Bridge Team</p>
        </div>
        <div class="footer">
          <p>This is an automated welcome message from Global Skills Bridge.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>&copy; ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Global Skills Bridge!

      Hello ${user.name}!

      Welcome to Global Skills Bridge - the platform connecting TVET graduates with verified global employment opportunities.

      Get Started in 3 Easy Steps:

      1. Complete Your Profile
      Add your skills, education, and experience to showcase your qualifications to employers worldwide.

      2. Verify Your Skills
      Get your competencies verified through our secure blockchain system to build trust with employers.

      3. Apply for Global Opportunities
      Browse and apply to job opportunities that match your skills and career goals.

      Quick Links:
      - Dashboard: ${dashboardUrl}
      - Complete Profile: ${profileUrl}
      - Verify Skills: ${skillsUrl}

      What You Can Do:
      - Access thousands of global job opportunities
      - Get mentorship from industry experts
      - Verify your skills with blockchain technology
      - Connect with Rwandan diaspora professionals
      - Build your professional network

      Need help getting started? Our support team is here to assist you every step of the way.

      Best regards,
      The Global Skills Bridge Team

      ---
      This is an automated welcome message from Global Skills Bridge.
      If you have any questions, please contact our support team.
      © ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.
    `;

    return {
      subject: ' Welcome to Global Skills Bridge - Your Global Career Journey Starts Now!',
      html,
      text
    };
  }

  /**
   * Get new application employer notification template
   */
  getNewApplicationEmployerTemplate(application, jobSeeker, employer) {
    const applicationUrl = `${this.baseUrl}/applications/${application._id}`;
    const dashboardUrl = `${this.baseUrl}/dashboard`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Job Application Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #28a745; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .candidate-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #28a745; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 New Application Received</h1>
          <p>A qualified candidate has applied for your position</p>
        </div>
        <div class="content">
          <h2>New Job Application</h2>
          <p>Dear ${employer.contactPerson || employer.companyName},</p>
          <p>Great news! You have received a new application for your job posting.</p>
          
          <div class="candidate-info">
            <h3>Candidate Information</h3>
            <p><strong>Name:</strong> ${jobSeeker.name}</p>
            <p><strong>Position Applied:</strong> ${application.job?.title}</p>
            <p><strong>Application Date:</strong> ${new Date(application.createdAt).toLocaleDateString()}</p>
            <p><strong>Skills Verified:</strong> ${jobSeeker.isVerified ? ' Yes' : ' Pending'}</p>
            <p><strong>Experience Level:</strong> ${jobSeeker.experienceLevel || 'Not specified'}</p>
          </div>

          <p>We recommend reviewing the candidate's profile and application materials promptly to secure top talent.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${applicationUrl}" class="button">Review Application</a>
            <a href="${dashboardUrl}" class="button" style="background: #6c757d;">Go to Dashboard</a>
          </div>

          <p>Best regards,<br>
          The Global Skills Bridge Team</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Global Skills Bridge.</p>
          <p>&copy; ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      New Job Application Received

      Dear ${employer.contactPerson || employer.companyName},

      Great news! You have received a new application for your job posting.

      Candidate Information:
      - Name: ${jobSeeker.name}
      - Position Applied: ${application.job?.title}
      - Application Date: ${new Date(application.createdAt).toLocaleDateString()}
      - Skills Verified: ${jobSeeker.isVerified ? 'Yes' : 'Pending'}
      - Experience Level: ${jobSeeker.experienceLevel || 'Not specified'}

      We recommend reviewing the candidate's profile and application materials promptly to secure top talent.

      Review Application: ${applicationUrl}
      Dashboard: ${dashboardUrl}

      Best regards,
      The Global Skills Bridge Team

      ---
      This is an automated notification from Global Skills Bridge.
      © ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.
    `;

    return {
      subject: '📋 New Job Application Received - Global Skills Bridge',
      html,
      text
    };
  }

  /**
   * Get mentorship request notification template
   */
  getMentorshipRequestTemplate(mentorshipRequest, mentor, jobSeeker) {
    const mentorshipUrl = `${this.baseUrl}/mentorship/${mentorshipRequest._id}`;
    const dashboardUrl = `${this.baseUrl}/dashboard`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Mentorship Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #6f42c1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .request-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6f42c1; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1> New Mentorship Request</h1>
          <p>Someone wants to learn from your expertise</p>
        </div>
        <div class="content">
          <h2>Mentorship Request</h2>
          <p>Dear ${mentor.name},</p>
          <p>You have received a new mentorship request from a job seeker who values your expertise and experience.</p>
          
          <div class="request-info">
            <h3>Request Details</h3>
            <p><strong>From:</strong> ${jobSeeker.name}</p>
            <p><strong>Field of Interest:</strong> ${mentorshipRequest.field || 'Not specified'}</p>
            <p><strong>Request Date:</strong> ${new Date(mentorshipRequest.createdAt).toLocaleDateString()}</p>
            <p><strong>Goals:</strong> ${mentorshipRequest.goals || 'Not specified'}</p>
          </div>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4>Message from ${jobSeeker.name}:</h4>
            <p style="margin: 0; font-style: italic;">"${mentorshipRequest.message || 'No message provided'}"</p>
          </div>

          <p>Your mentorship can make a significant impact on someone's career journey. Consider accepting this request to share your knowledge and help shape the next generation of professionals.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${mentorshipUrl}" class="button">Review Request</a>
            <a href="${dashboardUrl}" class="button" style="background: #6c757d;">Go to Dashboard</a>
          </div>

          <p>Best regards,<br>
          The Global Skills Bridge Team</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Global Skills Bridge.</p>
          <p>&copy; ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      New Mentorship Request

      Dear ${mentor.name},

      You have received a new mentorship request from a job seeker who values your expertise and experience.

      Request Details:
      - From: ${jobSeeker.name}
      - Field of Interest: ${mentorshipRequest.field || 'Not specified'}
      - Request Date: ${new Date(mentorshipRequest.createdAt).toLocaleDateString()}
      - Goals: ${mentorshipRequest.goals || 'Not specified'}

      Message from ${jobSeeker.name}:
      "${mentorshipRequest.message || 'No message provided'}"

      Your mentorship can make a significant impact on someone's career journey. Consider accepting this request to share your knowledge and help shape the next generation of professionals.

      Review Request: ${mentorshipUrl}
      Dashboard: ${dashboardUrl}

      Best regards,
      The Global Skills Bridge Team

      ---
      This is an automated notification from Global Skills Bridge.
      © ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.
    `;

    return {
      subject: ' New Mentorship Request - Global Skills Bridge',
      html,
      text
    };
  }

  /**
   * Send employer approval status email
   */
  async sendEmployerApprovalEmail(employer, isApproved, adminNotes = '') {
    try {
      const templates = this.getEmployerApprovalTemplate(employer, isApproved, adminNotes);
      
      const mailOptions = {
        from: `"Global Skills Bridge" <${process.env.FROM_EMAIL || 'globalskills4@gmail.com'}>`,
        to: employer.email,
        subject: templates.subject,
        html: templates.html,
        text: templates.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Employer approval email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending employer approval email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get employer approval email template
   */
  getEmployerApprovalTemplate(employer, isApproved, adminNotes) {
    const dashboardUrl = `${this.baseUrl}/dashboard`;
    const loginUrl = `${this.baseUrl}/login`;
    const supportUrl = `${this.baseUrl}/support`;
    
  const statusColor = isApproved ? '#28a745' : '#dc3545';
  const statusText = isApproved ? 'Approved' : 'Rejected';

    // Extract actual user data from database
    const employerName = employer.name || 'Valued Employer';
    const companyName = employer.companyInfo?.name || 'Your Company';
    const companyIndustry = employer.companyInfo?.industry || 'Not specified';
    const companyLocation = employer.location?.city && employer.location?.country 
      ? `${employer.location.city}, ${employer.location.country}` 
      : employer.location?.country || 'Not specified';
    const registrationDate = employer.createdAt 
      ? new Date(employer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'N/A';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border: 1px solid #e0e0e0;
          }
          .status-badge {
            display: inline-block;
            padding: 10px 20px;
            background: ${statusColor};
            color: white;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
          }
          .info-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid ${statusColor};
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: ${isApproved ? '#667eea' : '#6c757d'};
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 5px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
            border-radius: 0 0 10px 10px;
          }
          h2 {
            color: #333;
            margin-bottom: 20px;
          }
          .next-steps {
            background: #e7f3ff;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .next-steps h3 {
            margin-top: 0;
            color: #0066cc;
          }
          .next-steps ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .next-steps li {
            margin: 8px 0;
          }
          .account-details {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .account-details p {
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Employer Account ${statusText}</h1>
        </div>
        <div class="content">
          <h2>Dear ${employerName},</h2>
          
          <p>We have reviewed your employer account application for <strong>${companyName}</strong> on Global Skills Bridge.</p>
          
          <div style="text-align: center;">
            <span class="status-badge">Application ${statusText}</span>
          </div>

          <div class="account-details">
            <h3 style="margin-top: 0;">Account Information</h3>
            <p><strong>Company Name:</strong> ${companyName}</p>
            <p><strong>Contact Person:</strong> ${employerName}</p>
            <p><strong>Email:</strong> ${employer.email}</p>
            <p><strong>Industry:</strong> ${companyIndustry}</p>
            <p><strong>Location:</strong> ${companyLocation}</p>
            <p><strong>Registration Date:</strong> ${registrationDate}</p>
          </div>

          ${isApproved ? `

          <div class="info-box">
            <p style="margin: 0;"><strong>Congratulations!</strong> Your employer account has been approved and is now active.</p>
          </div>

          ${adminNotes ? `
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="margin-top: 0;">Admin Notes:</h4>
            <p style="margin: 0;">${adminNotes}</p>
          </div>
          ` : ''}

          <div class="next-steps">
            <h3>Next Steps:</h3>
            <ul>
              <li>Log in to your employer dashboard</li>
              <li>Complete your company profile</li>
              <li>Post your first job opening</li>
              <li>Start connecting with talented candidates</li>
              <li>Explore our talent search features</li>
            </ul>
          </div>

          <p>You now have full access to all employer features including:</p>
          <ul>
            <li>Post unlimited job openings</li>
            <li>Search and filter candidates by skills and location</li>
            <li>Review applications and schedule interviews</li>
            <li>Message candidates directly</li>
            <li>Access to verified skill profiles</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
          </div>

          <p>If you need any assistance getting started, our support team is here to help!</p>
          ` : `
          <div class="info-box">
            <p style="margin: 0;"><strong>Application Status:</strong> Unfortunately, your employer account application has not been approved at this time.</p>
          </div>

          ${adminNotes ? `
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="margin-top: 0;">Admin Notes:</h4>
            <p style="margin: 0;">${adminNotes}</p>
          </div>
          ` : ''}

          <div class="next-steps">
            <h3>What You Can Do:</h3>
            <ul>
              <li>Review our employer account requirements</li>
              <li>Update your company information</li>
              <li>Provide additional verification documents</li>
              <li>Reapply after addressing the concerns</li>
              <li>Contact our support team for clarification</li>
            </ul>
          </div>

          <p>If you believe this decision was made in error or if you have additional information to provide, please contact our support team.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${supportUrl}" class="button">Contact Support</a>
            <a href="${loginUrl}" class="button" style="background: #6c757d;">Update Profile</a>
          </div>
          `}

          <p>Thank you for your interest in Global Skills Bridge. We're committed to connecting employers with the best talent across Africa and beyond.</p>

          <p>Best regards,<br>
          The Global Skills Bridge Team</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Global Skills Bridge.</p>
          <p>If you have questions, please contact us at globalskills4@gmail.com</p>
          <p>&copy; ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Employer Account ${statusText}

      Dear ${employerName},

      We have reviewed your employer account application for ${companyName} on Global Skills Bridge.

      Application Status: ${statusText}

      Account Information:
      - Company Name: ${companyName}
      - Contact Person: ${employerName}
      - Email: ${employer.email}
      - Industry: ${companyIndustry}
      - Location: ${companyLocation}
      - Registration Date: ${registrationDate}

      ${isApproved ? `
      Congratulations! Your employer account has been approved and is now active.

      Next Steps:
      - Log in to your employer dashboard
      - Complete your company profile
      - Post your first job opening
      - Start connecting with talented candidates
      - Explore our talent search features

      You now have full access to all employer features including:
      - Post unlimited job openings
      - Search and filter candidates by skills and location
      - Review applications and schedule interviews
      - Message candidates directly
      - Access to verified skill profiles

      Go to Dashboard: ${dashboardUrl}

      If you need any assistance getting started, our support team is here to help!
      ` : `
      Unfortunately, your employer account application has not been approved at this time.

      ${adminNotes ? `Admin Notes: ${adminNotes}\n` : ''}

      What You Can Do:
      - Review our employer account requirements
      - Update your company information
      - Provide additional verification documents
      - Reapply after addressing the concerns
      - Contact our support team for clarification

      If you believe this decision was made in error or if you have additional information to provide, please contact our support team.

      Contact Support: ${supportUrl}
      Update Profile: ${loginUrl}
      `}

      Thank you for your interest in Global Skills Bridge. We're committed to connecting employers with the best talent across Africa and beyond.

      Best regards,
      The Global Skills Bridge Team

      ---
      This is an automated notification from Global Skills Bridge.
      If you have questions, please contact us at globalskills4@gmail.com
      © ${new Date().getFullYear()} Global Skills Bridge. All rights reserved.
    `;

    return {
      subject: `Your Employer Account Has Been ${statusText} - Global Skills Bridge`,
      html,
      text
    };
  }
}

module.exports = EmailService;
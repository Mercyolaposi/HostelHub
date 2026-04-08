import nodemailer from 'nodemailer';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmailNotification({ 
  to, 
  subject, 
  html 
}: { 
  to: string; 
  subject: string; 
  html: string; 
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Mock Email Notification:', { to, subject, html });
    return { success: true, mocked: true };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"HostelHub" <noreply@hostelhub.com>',
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email notification:', error);
    throw error;
  }
}

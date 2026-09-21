import nodemailer from 'nodemailer';

// Configure Transporter (Uses env vars or realistic dev fallback)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.ethereal.email';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

let transporter = null;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

// In-Memory Email Dispatch Log for demonstration & testing
export const emailDispatchLogs = [];

export async function sendEmail({ to, subject, html, text }) {
  const dispatchRecord = {
    id: 'EML-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    to,
    subject,
    timestamp: new Date().toISOString(),
    status: 'SENT'
  };

  console.log(`[SMTP Email Service] Sending email to: ${to} | Subject: "${subject}"`);

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: '"Swift Line Courier" <notifications@myswiftline.com>',
        to,
        subject,
        text: text || html.replace(/<[^>]*>?/gm, ''),
        html
      });
      console.log(`[SMTP Success] Message ID: ${info.messageId}`);
      dispatchRecord.messageId = info.messageId;
    } catch (err) {
      console.error(`[SMTP Error] ${err.message}`);
      dispatchRecord.status = 'FAILED_FALLBACK_SIMULATED';
      dispatchRecord.error = err.message;
    }
  } else {
    console.log('[SMTP Notice] Using simulated email delivery (Set SMTP_USER & SMTP_PASS in .env for live server delivery).');
    dispatchRecord.status = 'SIMULATED_SUCCESS';
  }

  emailDispatchLogs.unshift(dispatchRecord);
  if (emailDispatchLogs.length > 100) emailDispatchLogs.pop();
  return dispatchRecord;
}

export function buildTrackingStatusEmail(shipment, newStatus, location) {
  return {
    to: shipment.recipient_email || shipment.sender_email,
    subject: `Swift Line Alert: Shipment ${shipment.tracking_number} - Status Updated to ${newStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0F2C59; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">SWIFT LINE WORLDWIDE COURIER</h1>
          <p style="color: #FF6B00; margin: 5px 0 0 0; font-size: 14px;">Global Logistics & Express Delivery</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <h2 style="color: #0F2C59; margin-top: 0;">Shipment Status Update</h2>
          <p>Hello,</p>
          <p>Your package with tracking number <strong style="color: #FF6B00;">${shipment.tracking_number}</strong> has a new update:</p>
          
          <div style="background-color: #F8FAFC; padding: 16px; border-left: 4px solid #FF6B00; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #0F2C59;">Current Status: ${newStatus.replace('_', ' ')}</p>
            <p style="margin: 4px 0 0 0; color: #64748B;">Location: ${location}</p>
            <p style="margin: 4px 0 0 0; color: #64748B;">Courier: ${shipment.courier_partner || 'Swift Line Express'}</p>
          </div>

          <p>You can live track your package anytime at:</p>
          <p><a href="https://myswiftline.com/tracking?number=${shipment.tracking_number}" style="display: inline-block; background-color: #FF6B00; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Live Track Package</a></p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94A3B8;">Swift Line Worldwide Courier Inc. | https://myswiftline.com</p>
        </div>
      </div>
    `
  };
}

import nodemailer from 'nodemailer';

// Configure Transporter dynamically from environment
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.zoho.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
  return null;
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

  const transporter = getTransporter();

  if (transporter) {
    try {
      const senderAddress = process.env.SMTP_USER || 'support@myswiftline.com';
      const info = await transporter.sendMail({
        from: `"Swift Line Courier" <${senderAddress}>`,
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

export async function sendShipmentNotification(shipment, newStatus, location) {
  const recipients = [];
  if (shipment.sender_email) {
    recipients.push({ email: shipment.sender_email, name: shipment.sender_name, isSender: true });
  }
  if (shipment.recipient_email && shipment.recipient_email.toLowerCase() !== shipment.sender_email?.toLowerCase()) {
    recipients.push({ email: shipment.recipient_email, name: shipment.recipient_name, isSender: false });
  }

  for (const { email, name, isSender } of recipients) {
    const roleTitle = isSender ? 'Sender Copy' : 'Recipient Notification';
    const actionText = newStatus === 'ORDER_CREATED'
      ? (isSender ? 'Your shipment booking has been confirmed & registered in the Swift Line global network.' : 'A new international shipment has been dispatched to you via Swift Line Courier.')
      : `The status of shipment ${shipment.tracking_number} has been updated to ${newStatus.replace('_', ' ')}.`;

    await sendEmail({
      to: email,
      subject: `Swift Line Alert: Shipment [${shipment.tracking_number}] - ${newStatus.replace('_', ' ')} (${roleTitle})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #0F2C59; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">SWIFT LINE WORLDWIDE COURIER</h1>
            <p style="color: #FF6B00; margin: 5px 0 0 0; font-size: 14px;">Worldwide Express Delivery Network</p>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <h2 style="color: #0F2C59; margin-top: 0;">Shipment ${newStatus === 'ORDER_CREATED' ? 'Booking Confirmed' : 'Status Update'}</h2>
            <p>Hello <strong>${name || 'Valued Client'}</strong>,</p>
            <p>${actionText}</p>
            
            <div style="background-color: #F8FAFC; padding: 18px; border-left: 4px solid #FF6B00; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #0F2C59;">Tracking Number: <span style="color: #FF6B00;">${shipment.tracking_number}</span></p>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569;"><strong>Status:</strong> ${newStatus.replace('_', ' ')}</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;"><strong>Location:</strong> ${location || 'In Transit Hub'}</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;"><strong>Carrier:</strong> ${shipment.courier_partner || 'Swift Line Express'}</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;"><strong>Route:</strong> ${shipment.sender_country || 'Origin'} ➔ ${shipment.recipient_country || 'Destination'}</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;"><strong>Package Weight:</strong> ${shipment.weight_kg || 1} kg</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;"><strong>Declared Cargo Value:</strong> $${shipment.declared_value_usd || 100} USD</p>
            </div>

            <p>You can track the live GPS telemetry and transit milestones anytime:</p>
            <p><a href="https://myswiftline.com/tracking?number=${shipment.tracking_number}" style="display: inline-block; background-color: #FF6B00; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Live Track Package</a></p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94A3B8;">Swift Line Worldwide Courier Inc. | 742 Fifth Avenue, New York, NY 10019 | support@myswiftline.com</p>
          </div>
        </div>
      `
    }).catch(err => console.error(`Failed to send shipment email to ${email}:`, err));
  }
}

import express from 'express';
import supabase from '../db/supabaseClient.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// ─── 1. POST /api/ai/chat ─────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message text is required' });

  const query = message.trim();

  // Check for tracking number pattern (e.g. SL-1234567-US)
  const trackingMatch = query.match(/SL-\d{7}-[A-Z]{2}/i);

  if (trackingMatch) {
    const trackingNum = trackingMatch[0].toUpperCase();
    const { data: shipment } = await supabase
      .from('shipments')
      .select('*')
      .ilike('tracking_number', trackingNum)
      .single();

    if (shipment) {
      return res.json({
        reply: `📦 **Live Package Status Found!**\n\n- **Tracking Number:** \`${shipment.tracking_number}\`\n- **Status:** **${shipment.status.replace(/_/g, ' ')}**\n- **Current Location:** ${shipment.current_location}\n- **Origin ➔ Destination:** ${shipment.origin} to ${shipment.destination}\n- **Courier Partner:** ${shipment.courier_partner}\n- **Estimated Delivery:** ${new Date(shipment.estimated_delivery).toLocaleDateString()}\n\nWould you like me to send a detailed status report to your email?`,
        foundShipment: shipment
      });
    } else {
      return res.json({
        reply: `I searched our global database for tracking number \`${trackingNum}\`, but could not find a matching active shipment. Please double-check the tracking code or contact our support team.`
      });
    }
  }

  // Pre-configured smart bot answers
  const lower = query.toLowerCase();
  let reply = '';

  if (lower.includes('rate') || lower.includes('cost') || lower.includes('price')) {
    reply = "💡 **Swift Line Express Rates:**\n- Air Express: Starts at **$25.00** base + $4.50/kg (1-3 Days)\n- DHL Express Option: $35.00 base + $6.00/kg\n- Ocean Container: $15.00 base + $2.00/kg (10-15 Days)\n\nYou can use our interactive **Shipping Calculator** for instant weight & destination quotes!";
  } else if (lower.includes('prohibited') || lower.includes('restricted') || lower.includes('customs')) {
    reply = "⚠️ **Restricted Items Notice:** Dangerous goods, lithium batteries over 100Wh, illegal substances, and uncertified pharmaceuticals cannot be shipped via express air. Customs declarations are required for all international shipments.";
  } else if (lower.includes('dhl') || lower.includes('fedex') || lower.includes('ups') || lower.includes('aramex')) {
    reply = "🌐 **Global Partner Logistics:** Swift Line integrates with **DHL Express, FedEx World, UPS Worldwide, Aramex, and Maersk** — single-window tracking and consolidated global shipping labels.";
  } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('support')) {
    reply = "📞 **24/7 Swift Line Global Support:**\n- Phone: +1 (800) 555-SWIFT\n- Email: support@myswiftline.com\n- Headquarters: 742 Fifth Avenue, New York, NY 10019";
  } else if (lower.includes('founded') || lower.includes('history') || lower.includes('about')) {
    reply = "🏢 **About Swift Line:** Founded in **2011** in New York, Swift Line Worldwide Courier has grown to serve clients across 190+ countries. We specialize in express air freight, ocean logistics, and real-time parcel tracking.";
  } else {
    reply = `Thank you for contacting Swift Line AI Assistant. I can help you **live track packages**, **calculate global rates**, **find partner couriers**, or **connect you with support**.\n\nTo track a package, simply type your tracking number (e.g. \`SL-9842104-US\`).`;
  }

  res.json({ reply });
});

// ─── 2. POST /api/ai/email-transcript ────────────────────────────────────────
router.post('/email-transcript', async (req, res) => {
  const { userEmail, messages, trackingNumber } = req.body;
  if (!userEmail) return res.status(400).json({ error: 'User email address is required' });

  const formattedMessages = (messages || [])
    .map(m => `<p><strong>${m.sender === 'user' ? 'Client' : 'Swift Line AI'}:</strong> ${m.text.replace(/\n/g, '<br>')}</p>`)
    .join('');

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #0F2C59; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0F2C59; padding: 20px; text-align: center; color: white;">
        <h2 style="margin:0;">Swift Line AI Support Transcript</h2>
        <p style="color: #FF6B00; margin: 5px 0 0 0;">Official Customer Service Inquiry</p>
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <p>Hello,</p>
        <p>Below is your saved AI chat transcript from <strong>https://myswiftline.com</strong>:</p>
        <div style="background-color: #F8FAFC; padding: 15px; border-radius: 6px; margin: 15px 0;">
          ${formattedMessages || '<p>No messages recorded.</p>'}
        </div>
        <p style="font-size: 13px; color: #64748B;">Our support team has received a copy of this transcript and will follow up if needed.</p>
      </div>
    </div>
  `;

  const dispatchResult = await sendEmail({
    to: userEmail,
    subject: `Swift Line Support Transcript${trackingNumber ? ` (Tracking: ${trackingNumber})` : ''}`,
    html: emailHtml
  });

  res.json({ message: 'Chat transcript emailed successfully', dispatchResult });
});

export default router;

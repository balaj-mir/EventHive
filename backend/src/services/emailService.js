const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send ticket confirmation email with QR code attachments
 */
const sendTicketEmail = async ({ to, userName, eventTitle, eventDate, venue, tickets }) => {
  const ticketRows = tickets
    .map(
      (t) => `
      <tr>
        <td style="padding:12px; border:1px solid #e5e7eb;">${t.ticketNumber}</td>
        <td style="padding:12px; border:1px solid #e5e7eb;">${t.tierName}</td>
        <td style="padding:12px; border:1px solid #e5e7eb; text-align:center;">
          <img src="cid:qr_${t.ticketNumber}" width="120" height="120" alt="QR Code" />
        </td>
      </tr>`
    )
    .join('');

  const attachments = tickets.map((t) => ({
    filename: `ticket_${t.ticketNumber}.png`,
    content: t.qrCodeImage.replace(/^data:image\/png;base64,/, ''),
    encoding: 'base64',
    cid: `qr_${t.ticketNumber}`,
  }));

  const mailOptions = {
    from: `"EventHive 🎟️" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Your Tickets for ${eventTitle} — EventHive`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif; max-width:600px; margin:0 auto; background:#0f0f1a; color:#fff; border-radius:16px; overflow:hidden;">
        <div style="background:linear-gradient(135deg,#7c3aed,#db2777); padding:40px; text-align:center;">
          <h1 style="margin:0; font-size:28px;">🎟️ EventHive</h1>
          <p style="margin:8px 0 0; opacity:0.9;">Your tickets are confirmed!</p>
        </div>
        <div style="padding:32px;">
          <p style="font-size:18px;">Hi <strong>${userName}</strong>,</p>
          <p>You're all set for <strong>${eventTitle}</strong>!</p>
          <div style="background:#1a1a2e; border-radius:12px; padding:20px; margin:20px 0;">
            <p><strong>📅 Date:</strong> ${new Date(eventDate).toLocaleString()}</p>
            <p><strong>📍 Venue:</strong> ${venue.name}, ${venue.city}</p>
          </div>
          <h3 style="color:#a78bfa;">Your Tickets</h3>
          <table style="width:100%; border-collapse:collapse; font-size:14px;">
            <thead>
              <tr style="background:#7c3aed; color:#fff;">
                <th style="padding:12px; text-align:left;">Ticket #</th>
                <th style="padding:12px; text-align:left;">Tier</th>
                <th style="padding:12px; text-align:center;">QR Code</th>
              </tr>
            </thead>
            <tbody>${ticketRows}</tbody>
          </table>
          <p style="margin-top:24px; opacity:0.7; font-size:12px;">Present your QR code at the entrance for check-in. Each code is unique and single-use.</p>
        </div>
        <div style="background:#1a1a2e; padding:20px; text-align:center; font-size:12px; opacity:0.6;">
          <p>EventHive — Book It. Live It. 🎶</p>
        </div>
      </div>`,
    attachments,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendTicketEmail };

const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a JWT-signed QR payload + base64 PNG image for a ticket
 */
const generateTicketQR = async ({ ticketNumber, eventId, userId }) => {
  const payload = {
    ticketNumber,
    eventId: eventId.toString(),
    userId: userId.toString(),
    issuedAt: Date.now(),
  };

  // Sign the QR data so it can't be forged
  const qrCodeData = jwt.sign(payload, process.env.QR_SECRET, { expiresIn: '365d' });

  // Generate base64 PNG QR image
  const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    width: 300,
  });

  return { qrCodeData, qrCodeImage };
};

/**
 * Generate a unique ticket number
 */
const generateTicketNumber = () => {
  const prefix = 'EVH';
  const id = uuidv4().replace(/-/g, '').substring(0, 10).toUpperCase();
  return `${prefix}-${id}`;
};

/**
 * Verify a scanned QR code payload
 */
const verifyQRPayload = (qrCodeData) => {
  return jwt.verify(qrCodeData, process.env.QR_SECRET);
};

module.exports = { generateTicketQR, generateTicketNumber, verifyQRPayload };

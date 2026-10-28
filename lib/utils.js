export function generateTicketCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BM-${randomStr}`;
}

export function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

export function sendWhatsAppMessage(phone, name, plate, motorModel, category, ticketCode) {
  const formattedPhone = formatPhoneNumber(phone);
  const ticketUrl = `${window.location.origin}/ticket-check?q=${ticketCode}`;
  
  const message = `Halo *${name}*,\n\nPendaftaran Anda di event *BubaranMothai 2027* telah di-ACC! 🎉\n\n` +
    `📌 *Detail Kendaraan:*\n` +
    `• Plat Nomor: *${plate}*\n` +
    `• Motor: *${motorModel}*\n` +
    `• Kategori: *${category}*\n\n` +
    `Silakan unduh E-Ticket QR Code Anda melalui link berikut:\n` +
    `${ticketUrl}\n\n` +
    `Tunjukkan QR Code ini saat masuk ke lokasi acara. Terima kasih!`;

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
}
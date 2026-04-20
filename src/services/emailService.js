const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function sendReservationConfirmation({ to, nom, massage, date }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) return;

  const dateFormatee = new Date(date).toLocaleString('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  });

  await transporter.sendMail({
    from: `"SereniSpa" <${process.env.GMAIL_USER}>`,
    to,
    subject: '✅ Confirmation de votre réservation — SereniSpa',
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:auto;padding:32px;background:#faf9f7;border-radius:12px">
        <h2 style="color:#2d5a27">Réservation confirmée 🌿</h2>
        <p>Bonjour <strong>${nom}</strong>,</p>
        <p>Votre réservation a bien été enregistrée :</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#666">Soin</td><td style="padding:8px;font-weight:bold">${massage}</td></tr>
          <tr><td style="padding:8px;color:#666">Date</td><td style="padding:8px;font-weight:bold">${dateFormatee}</td></tr>
        </table>
        <p>À bientôt au SereniSpa !</p>
        <hr style="border:none;border-top:1px solid #e0ddd8;margin:24px 0">
        <p style="font-size:12px;color:#999">SereniSpa — Spa éthique &amp; éco-responsable</p>
      </div>
    `,
  });
}

module.exports = { sendReservationConfirmation };

const sendEmail = async ({ to, subject, text, html }) => {
  if (process.env.EMAIL_HOST) {
    console.warn('[EMAIL] SMTP not configured — install nodemailer and set EMAIL_HOST/EMAIL_USER/EMAIL_PASS.');
  }

  console.log('═══════════════════════════════════════');
  console.log(`  To: ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Text: ${text}`);
  console.log('═══════════════════════════════════════');
};

export { sendEmail };

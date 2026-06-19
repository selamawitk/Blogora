const sendEmail = async ({ to, subject, text, html }) => {
  if (process.env.NODE_ENV === 'production') {
    // Log email for now — swap this block with a real email provider
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
    return;
  }

  // Development: log to console
  console.log('═══════════════════════════════════════');
  console.log(`  To: ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  ${text}`);
  console.log('═══════════════════════════════════════');
};

export { sendEmail };

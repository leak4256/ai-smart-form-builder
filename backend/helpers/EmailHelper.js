const nodemailer = require('nodemailer');

// Initialize the transporter once for the entire application
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Generic function to send emails used throughout the server
 * @param {string} to - Email address of the recipient
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email content in HTML format
 */
const sendCustomEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent
    });
    return { success: true };
  } catch (error) {
    console.error("Error in emailHelper:", error);
    throw error; // Throw the error forward so the endpoint can handle it
  }
};

module.exports = { sendCustomEmail };
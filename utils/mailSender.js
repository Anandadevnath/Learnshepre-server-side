require("dotenv").config();

// No-op mail sender when MAIL_* env vars are not configured.
// This avoids runtime errors when mail is not needed.
exports.mailSender = async (email, title, body) => {
    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
        console.log(`mailSender skipped: MAIL_* not configured. To enable, set MAIL_HOST, MAIL_USER, MAIL_PASS in .env`);
        return null;
    }

    // If you do want to enable real mail sending, implement here using nodemailer.
    // Keeping function signature consistent for callers.
    try {
        const nodemailer = require("nodemailer");
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
        });
        let info = await transporter.sendMail({
            from: `"Learn Sphere - by Kanad" <${process.env.MAIL_USER}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });
        console.log('mail sent:', info.response || info);
        return info;
    } catch (error) {
        console.log('mailSender error:', error.message || error);
        return null;
    }
};

const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { from_name, reply_to, subject, message } = req.body;

    // Basic Input Validation
    if (!from_name || !reply_to || !message) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error: Name, email, and message are required.'
        });
    }

    // SMTP credentials from Environment Variables
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_RECEIVER } = process.env;

    if (!SMTP_USER || !SMTP_PASS) {
        return res.status(500).json({
            success: false,
            message: 'SMTP configuration error: SMTP credentials not set on Vercel.'
        });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(SMTP_PORT || '587'),
            secure: parseInt(SMTP_PORT) === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });

        const mailOptions = {
            from: `"Portfolio Contact Form" <${SMTP_USER}>`,
            to: CONTACT_RECEIVER || SMTP_USER,
            replyTo: reply_to,
            subject: `💼 Portfolio Contact: ${subject || 'New Inquiry from ' + from_name}`,
            text: `You have received a new message from your portfolio contact form.\n\n` +
                  `Name: ${from_name}\n` +
                  `Email: ${reply_to}\n` +
                  `Subject: ${subject || 'N/A'}\n\n` +
                  `Message:\n${message}\n\n` +
                  `--- Submitted via Vercel Serverless Function ---`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #00d9ff; border-bottom: 2px solid #9d00ff; padding-bottom: 10px;">New Portfolio Inquiry</h2>
                    <p><strong>Name:</strong> ${from_name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${reply_to}">${reply_to}</a></p>
                    <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p><strong>Message:</strong></p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap; line-height: 1.5;">${message}</div>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 11px; color: #888;">Submitted via Vercel Serverless Function</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({
            success: true,
            message: 'Email sent successfully!'
        });
    } catch (err) {
        console.error('❌ Nodemailer failed to send email:', err);
        return res.status(500).json({
            success: false,
            message: 'Nodemailer failed to send email: ' + err.message
        });
    }
}

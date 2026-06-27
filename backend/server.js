const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for local development
app.use(cors({
    origin: '*', // Adjust this to specific domains in production if needed
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Data directory and contacts file setup
const DATA_DIR = path.join(__dirname, 'data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Helper to ensure data directory and file exist
async function ensureDataFileExists() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        try {
            await fs.access(CONTACTS_FILE);
        } catch {
            // File does not exist, create it with an empty array
            await fs.writeFile(CONTACTS_FILE, JSON.stringify([], null, 2));
            console.log('📝 Created contacts.json file');
        }
    } catch (err) {
        console.error('❌ Error creating data directory or file:', err);
    }
}

// Ensure database setup on startup
ensureDataFileExists();

// Contact Form Endpoint
app.post('/api/contact', async (req, res) => {
    const { from_name, reply_to, subject, message } = req.body;

    console.log(`📩 Received new contact submission from: ${from_name} <${reply_to}>`);

    // Basic Input Validation
    if (!from_name || !reply_to || !message) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error: Name, email, and message are required.'
        });
    }

    const newContact = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        name: from_name,
        email: reply_to,
        subject: subject || 'No Subject',
        message: message,
        submittedAt: new Date().toISOString()
    };

    let savedLocally = false;
    let emailSent = false;
    let emailError = null;

    // 1. Save locally to JSON file
    try {
        await ensureDataFileExists();
        const data = await fs.readFile(CONTACTS_FILE, 'utf8');
        const contacts = JSON.parse(data || '[]');
        contacts.push(newContact);
        await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
        savedLocally = true;
        console.log('✅ Contact inquiry saved locally.');
    } catch (err) {
        console.error('❌ Failed to save contact locally:', err);
    }

    // 2. Send email via SMTP if credentials are configured
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_RECEIVER } = process.env;

    if (SMTP_USER && SMTP_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                host: SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(SMTP_PORT || '587'),
                secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
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
                      `--- Submitted at: ${newContact.submittedAt} ---`,
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
                        <p style="font-size: 11px; color: #888;">Submitted via Portfolio Contact Form at ${new Date(newContact.submittedAt).toLocaleString()}</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            emailSent = true;
            console.log('✅ Email notification sent successfully.');
        } catch (err) {
            console.error('❌ Nodemailer failed to send email:', err);
            emailError = err.message;
        }
    } else {
        console.log('⚠️ SMTP credentials not set in .env. Skipping email sending, saved locally only.');
        emailError = 'SMTP credentials not configured';
    }

    // Determine HTTP status and response based on success conditions
    if (savedLocally && emailSent) {
        return res.status(200).json({
            success: true,
            message: 'Inquiry received and email sent successfully!'
        });
    } else if (savedLocally) {
        return res.status(200).json({
            success: true,
            emailSent: false,
            message: 'Inquiry saved locally. (Email alert could not be sent: ' + emailError + ')'
        });
    } else {
        return res.status(500).json({
            success: false,
            message: 'Server Error: Failed to save the inquiry or send email.'
        });
    }
});

// Fallback for SPA Routing: Send index.html for any other requests (except API)
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📂 Serving static frontend files from: ${frontendPath}`);
});

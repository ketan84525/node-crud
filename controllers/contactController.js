const nodemailer = require("nodemailer");
const Contact = require("../models/contactModel");

exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Save message to database
        const result = await Contact.saveMessage(name, email, phone, message);

        // Email Configuration
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Use an App Password, NOT your real email password
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Thank You for Contacting Us",
            text: `Hello ${name},\n\nThank you for reaching out. We will get back to you soon!\n\nMessage: ${message}\n\nRegards, Team`,
        };

        await transporter.sendMail(mailOptions);

        res.json({
            message: "Message submitted successfully",
            data: { name, email, message }
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

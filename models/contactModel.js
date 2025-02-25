const db = require("../config/db");

const Contact = {
    saveMessage: async (name, email, phone, message) => {
        try {
            const [result] = await db.query(
                "INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)",
                [name, email, phone, message]
            );
            return result;
        } catch (error) {
            console.error("❌ Database error:", error);
            throw error;
        }
    },
};

module.exports = Contact;

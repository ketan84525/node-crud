const db = require('../config/db'); // Ensure this uses mysql2 with `.promise()`

const User = {
    getAll: async () => {
        try {
            const [rows] = await db.query("SELECT id, name, email, mobile FROM users");
            return rows;
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const [results] = await db.query("SELECT id, name, email, mobile FROM users WHERE id = ?", [id]);
            return results.length > 0 ? results[0] : null; // Return single user or null
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },
    
    getByEmail: async (email) => {
        try {
            const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
            return rows[0] || null;
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },

    getByEmailOrMobile: async (email, mobile) => {
        try {
            const [rows] = await db.query(
                "SELECT id, name, email, mobile FROM users WHERE email = ? OR mobile = ?", 
                [email, mobile]
            );
            return rows;
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },

    create: async (data) => {
        try {
            const [result] = await db.query("INSERT INTO users SET ?", data);
            return { insertId: result.insertId }; // Return an object similar to getAll
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            const [result] = await db.query("UPDATE users SET ? WHERE id = ?", [data, id]);
            return { updated: result.affectedRows > 0 }; // Return an object like `create`
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
            return { deleted: result.affectedRows > 0 }; // Return an object like `create`
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    }
};

module.exports = User;

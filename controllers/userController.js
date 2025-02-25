const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fastCsv = require('fast-csv');
const ExcelJS = require("exceljs");
const PDFDocument = require('pdfkit');
const fs = require('fs');

require('dotenv').config(); // Load environment variables

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/dp_images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single('dp'); // 'dp' is the name attribute in form-data
//     User.getAll((err, users) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }

//         if (users.length === 0) {
//             return res.status(404).json({ message: "No users found to export" });
//         }

//         // Ensure the exports directory exists
//         const exportDir = path.join(__dirname, "../exports");
//         if (!fs.existsSync(exportDir)) {
//             fs.mkdirSync(exportDir, { recursive: true });
//         }

//         // Define CSV file path
//         const filePath = path.join(exportDir, "users.csv");

//         // Create a writable stream
//         const ws = fs.createWriteStream(filePath);

//         // Handle stream errors
//         ws.on("error", (err) => {
//             console.error("Stream error:", err);
//             return res.status(500).json({ error: "File write error" });
//         });

//         // Convert user data to CSV
//         fastCsv
//             .write(users, { headers: true })
//             .pipe(ws)
//             .on("finish", () => {
//                 res.download(filePath, "users.csv", (err) => {
//                     if (err) {
//                         console.error("Download error:", err);
//                         return res.status(500).json({ error: "File download error" });
//                     }
//                     fs.unlinkSync(filePath); // Delete file after sending
//                 });
//             })
//             .on("error", (err) => {
//                 console.error("CSV writing error:", err);
//                 return res.status(500).json({ error: "CSV processing error" });
//             });
//     });
// };

exports.exportCSV = async (req, res) => {
    try {
        const users = await User.getAll(); // Await the promise

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found to export" });
        }

        // Ensure the exports directory exists
        const exportDir = path.join(__dirname, "../exports/csv");
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "");
        const fileName = `users_${timestamp}.csv`;
        const filePath = path.join(exportDir, fileName);

        const ws = fs.createWriteStream(filePath);

        // Convert user data to CSV and write to file
        await new Promise((resolve, reject) => {
            fastCsv
                .write(users, { headers: true })
                .pipe(ws)
                .on("finish", resolve)
                .on("error", reject);
        });

        console.log("CSV file successfully created at:", filePath);

        res.status(200).json({
            success: true,
            message: "CSV file created successfully",
            file_path: `/exports/csv/${fileName}`,
        });

    } catch (error) {
        console.error("Error exporting CSV:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.exportExcel = async (req, res) => {
    try {
        const users = await User.getAll(); // Await the promise

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found to export" });
        }

        // Ensure the exports directory exists
        const exportDir = path.join(__dirname, "../exports/xlsx");
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "");
        const fileName = `users_${timestamp}.xlsx`;
        const filePath = path.join(exportDir, fileName);

        // Create a new Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Users");

        // Define columns
        worksheet.columns = [
            { header: "ID", key: "id", width: 10 },
            { header: "Name", key: "name", width: 25 },
            { header: "Email", key: "email", width: 30 },
            { header: "Mobile", key: "mobile", width: 15 },
        ];

        // Add user data
        users.forEach(user => worksheet.addRow(user));

        // Save the Excel file
        await workbook.xlsx.writeFile(filePath);
        console.log("Excel file successfully created at:", filePath);

        // Send success response with file path
        res.status(200).json({
            success: true,
            message: "Excel file created successfully",
            file_path: `/exports/xlsx/${fileName}`
        });

    } catch (error) {
        console.error("Excel export error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.exportPDF = async (req, res) => {
    try {
        const users = await User.getAll(); // Await the promise

        if (!users || users.length === 0) {
            return res.status(404).json({ success: false, message: "No users found to export" });
        }

        // Ensure the exports directory exists
        const exportDir = path.join(__dirname, "../exports/pdf");
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        // Generate timestamped filename
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "");
        const fileName = `users_${timestamp}.pdf`;
        const filePath = path.join(exportDir, fileName);

        // Create a new PDF document
        const doc = new PDFDocument({ margin: 50, size: "A4" });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Title
        doc.fontSize(20).text("User List", { align: "center" }).moveDown(2);

        // Table Headers
        const startX = 50;
        const startY = doc.y;
        const columnWidths = { id: 40, name: 120, email: 180, mobile: 120 };

        doc.fontSize(12).text("ID", startX, startY, { width: columnWidths.id, bold: true })
            .text("Name", startX + columnWidths.id + 10, startY, { width: columnWidths.name, bold: true })
            .text("Email", startX + columnWidths.id + columnWidths.name + 20, startY, { width: columnWidths.email, bold: true })
            .text("Mobile", startX + columnWidths.id + columnWidths.name + columnWidths.email + 30, startY, { width: columnWidths.mobile, bold: true });

        doc.moveDown();

        // User Data
        users.forEach(user => {
            const y = doc.y; // Get current Y position
            doc.text(user.id.toString(), startX, y, { width: columnWidths.id })
                .text(user.name, startX + columnWidths.id + 10, y, { width: columnWidths.name })
                .text(user.email, startX + columnWidths.id + columnWidths.name + 20, y, { width: columnWidths.email })
                .text(user.mobile, startX + columnWidths.id + columnWidths.name + columnWidths.email + 30, y, { width: columnWidths.mobile });

            doc.moveDown();
        });

        // End PDF and save
        doc.end();

        stream.on("finish", () => {
            console.log("PDF file successfully created at:", filePath);

            // Send success response with file path
            res.status(200).json({
                success: true,
                message: "PDF file created successfully",
                file_path: `/exports/pdf/${fileName}`
            });
        });

    } catch (error) {
        console.error("PDF export error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Without Pagination
/* exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll(); // Await the promise
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: error.message });
    }
}; */

exports.getAllUsers = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        const users = await User.getAll(page, limit);

        res.json({
            page,
            limit,
            total: users.length,
            users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.getById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, pass, mobile } = req.body;
        const dp = req.file ? req.file.filename : null; // Store filename in DB

        if (!name || !email || !pass || !mobile) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if email or mobile already exists
        const existingUsers = await User.getByEmailOrMobile(email, mobile);

        if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];
            if (existingUser.email === email && existingUser.mobile === mobile) {
                return res.status(400).json({ message: "Email and Mobile number are already registered" });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ message: "Email is already registered" });
            }
            if (existingUser.mobile === mobile) {
                return res.status(400).json({ message: "Mobile number is already registered" });
            }
        }

        // Hash the password
        const hashedPass = await bcrypt.hash(pass, 10);
        const newUser = { name, email, password: hashedPass, mobile, dp };

        const result = await User.create(newUser);
        res.json({ message: "User created successfully", id: result.insertId, dp });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, email, pass } = req.body;
        let updatedUser = { name, email };

        // Hash new password if provided
        if (pass) {
            updatedUser.password = await bcrypt.hash(pass, 10);
        }

        const isUpdated = await User.update(req.params.id, updatedUser);

        if (!isUpdated) {
            return res.status(404).json({ message: "User not found or no changes made" });
        }

        res.json({ message: "User updated successfully" });

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const isDeleted = await User.delete(req.params.id);

        if (!isDeleted) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, pass } = req.body;

        // Fetch user by email
        const user = await User.getByEmail(email);
        if (!user) return res.status(401).json({ message: "Invalid credentials 1" });

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials 2" });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
};

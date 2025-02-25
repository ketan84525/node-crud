const db = require('../config/db');

const checkPermission = (module, action) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.userId; // Use optional chaining to avoid undefined errors

            if (!userId) {
                return res.status(403).json({ message: "Access Denied" });
            }

            // Fetch user role
            const [userRows] = await db.query('SELECT role_id FROM users WHERE id = ?', [userId]);
            if (userRows.length === 0 || !userRows[0].role_id) {
                return res.status(403).json({ message: "Access Denied" });
            }
            const roleId = userRows[0].role_id;

            // Check permission
            const [permissionRows] = await db.query(
                `SELECT * FROM permissions WHERE role_id = ? AND module = ? LIMIT 1`,
                [roleId, module]
            );

            if (permissionRows.length === 0 || !permissionRows[0][action]) {
                return res.status(403).json({ message: "Access Denied" });
            }

            next();
        } catch (error) {
            console.error("Error in checkPermission middleware:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    };
};

module.exports = checkPermission;

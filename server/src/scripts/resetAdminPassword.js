const bcrypt = require('bcryptjs');
const db = require('../db');

async function resetAdminPassword() {
    try {
        // Create new password hash
        const newPassword = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        // Update admin user password
        const query = `
            UPDATE users 
            SET password_hash = $1, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE email = $2 
            RETURNING id, email
        `;
        
        const { rows } = await db.query(query, [password_hash, 'admin@safaricom.co.ke']);

        if (rows.length > 0) {
            console.log('✅ Admin password updated successfully');
            console.log('🔑 New password is:', newPassword);
            console.log('👤 For user:', rows[0].email);
            console.log('🔐 New hash:', password_hash);
        } else {
            console.error('❌ Admin user not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting admin password:', error);
        process.exit(1);
    }
}

resetAdminPassword(); 
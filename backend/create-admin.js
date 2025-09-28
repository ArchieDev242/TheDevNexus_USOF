import bcrypt from 'bcrypt';
import User from './models/User.js';
import dbConnect from './utils/dbConnect.js';

async function createAdmin() {
    try {
        console.log('🔧 Creating admin user...');
        
        // Спочатку перевіримо чи є існуючі адміни
        const existingAdmins = await User.find_by_role('admin');
        console.log('📊 Existing admins:', existingAdmins.length);
        
        if (existingAdmins.length > 0) {
            console.log('📋 Current admin users:');
            existingAdmins.forEach(admin => {
                console.log(`  - ID: ${admin.id}, Login: ${admin.login}, Email: ${admin.email}, Verified: ${admin.email_verified}`);
            });
        }
        
        // Створюємо нового адміна
        const adminData = {
            login: 'admin',
            password: 'admin123', // Буде хешований в методі create()
            full_name: 'System Administrator',
            email: 'admin@usof.com',
            role: 'admin',
            email_verified: true
        };
        
        // Перевіряємо чи існує користувач з таким логіном
        const existingByLogin = await User.find_by_login(adminData.login);
        if (existingByLogin) {
            console.log('⚠️  User with login "admin" already exists');
            
            // Якщо існує, але не адмін - робимо адміном
            if (existingByLogin.role !== 'admin') {
                await existingByLogin.update_role('admin');
                await existingByLogin.update({ email_verified: true });
                console.log('✅ Updated existing user to admin role');
            }
            
            // Оновлюємо пароль
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await existingByLogin.update({ 
                password: hashedPassword,
                email: 'admin@usof.com',
                email_verified: true 
            });
            
            console.log('✅ Admin password updated to: admin123');
            console.log('📧 Admin email updated to: admin@usof.com');
            return existingByLogin;
        }
        
        // Перевіряємо чи існує користувач з таким email
        const existingByEmail = await User.find_by_email(adminData.email);
        if (existingByEmail) {
            console.log('⚠️  User with email "admin@usof.com" already exists');
            
            // Робимо його адміном
            if (existingByEmail.role !== 'admin') {
                await existingByEmail.update_role('admin');
                console.log('✅ Updated existing user to admin role');
            }
            
            // Оновлюємо пароль
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await existingByEmail.update({ 
                password: hashedPassword,
                login: 'admin',
                email_verified: true 
            });
            
            console.log('✅ Admin password updated to: admin123');
            console.log('🔑 Admin login updated to: admin');
            return existingByEmail;
        }
        
        // Створюємо нового адміна
        const admin = new User(adminData);
        const result = await admin.create();
        
        console.log('✅ New admin created successfully!');
        console.log('🔑 Login: admin');
        console.log('🔒 Password: admin123');
        console.log('📧 Email: admin@usof.com');
        console.log('🆔 ID:', result.user.id);
        
        return result.user;
        
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        throw error;
    }
}

async function listAllUsers() {
    try {
        console.log('\n📋 All users in database:');
        const users = await User.find_all();
        
        if (users.length === 0) {
            console.log('  No users found');
            return;
        }
        
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ID: ${user.id}`);
            console.log(`     Login: ${user.login}`);
            console.log(`     Email: ${user.email}`);
            console.log(`     Role: ${user.role}`);
            console.log(`     Email Verified: ${user.email_verified}`);
            console.log(`     Created: ${user.created_at}`);
            console.log('     ---');
        });
        
    } catch (error) {
        console.error('❌ Error listing users:', error.message);
    }
}

// Запускаємо скрипт
async function main() {
    try {
        console.log('🚀 Starting admin creation script...\n');
        
        await listAllUsers();
        await createAdmin();
        
        console.log('\n📋 Updated user list:');
        await listAllUsers();
        
        console.log('\n🎉 Script completed successfully!');
        console.log('\n💡 You can now login to admin panel with:');
        console.log('   URL: http://localhost:3000/admin-panel/login');
        console.log('   Login: admin');
        console.log('   Password: admin123');
        
        process.exit(0);
        
    } catch (error) {
        console.error('💥 Script failed:', error);
        process.exit(1);
    }
}

main();

import bcrypt from 'bcrypt';
import User from './models/User.js';
import DB_connect from './utils/dbConnect.js';

async function create_admin() {
    try 
    {
        console.log('🔧 Creating admin user...');
        
        const existing_admins = await User.find_by_role('admin');
        console.log('Existing admins:', existing_admins.length);
        
        if(existing_admins.length > 0) 
            {
            console.log('📋 Current admin users:');
            existing_admins.forEach(admin => {
                console.log(`  - ID: ${admin.id}, Login: ${admin.login}, Email: ${admin.email}, Verified: ${admin.email_verified}`);
            });
        }
        
        const admin_data = {
            login: 'admin',
            password: 'admin123',
            full_name: 'System Administrator',
            email: 'admin@usof.com',
            role: 'admin',
            email_verified: true
        };
        
        const existing_by_login = await User.find_by_login(admin_data.login);
        if(existing_by_login) 
            {
            console.log('⚠️  User with login "admin" already exists');
            
            if(existing_by_login.role !== 'admin') 
                {
                await existing_by_login.update_role('admin');
                await existing_by_login.update({ email_verified: true });
                console.log('✅ Updated existing user to admin role');
            }
            
            const hashed_password = await bcrypt.hash('admin123', 10);
            await existing_by_login.update({ 
                password: hashed_password,
                email: 'admin@usof.com',
                email_verified: true 
            });
            
            console.log('✅ Admin password updated to: admin123');
            console.log('Admin email updated to: admin@usof.com');
            return existing_by_login;
        }
        
        const existing_by_email = await User.find_by_email(admin_data.email);
        if(existing_by_email) 
            {
            console.log('⚠️  User with email "admin@usof.com" already exists');
            
            if(existing_by_email.role !== 'admin') 
                {
                await existing_by_email.update_role('admin');
                console.log('✅ Updated existing user to admin role');
            }
            
            const hashed_password = await bcrypt.hash('admin123', 10);
            await existing_by_email.update({ 
                password: hashed_password,
                login: 'admin',
                email_verified: true 
            });
            
            console.log('✅ Admin password updated to: admin123');
            console.log('🔑 Admin login updated to: admin');
            return existing_by_email;
        }
        
        const admin = new User(admin_data);
        const result = await admin.create();

        console.log('✅ New admin created successfully!');
        console.log('Login: admin');
        console.log('Password: admin123');
        console.log('Email: admin@usof.com');
        console.log('ID:', result.user.id);
        
        return result.user;
        
    } catch(error) 
    {
        console.error('❌ Error creating admin:', error.message);
        throw error;
    }
}

async function list_aall_users() 
{
    try 
    {
        console.log('\nAll users in database:');
        const users = await User.find_all();
        
        if(users.length === 0) 
            {
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
        
    } catch(error) 
    {
        console.error('❌ Error listing users:', error.message);
    }
}

async function main() 
{
    try 
    {
        console.log('Starting admin creation script...\n');
        
        await list_aall_users();
        await create_admin();
        
        console.log('\nUpdated user list:');
        await list_aall_users();
        
        console.log('\nScript completed successfully!');
        console.log('\nYou can now login to admin panel with:');
        console.log('   URL: http://localhost:3000/admin-panel/login');
        console.log('   Login: admin');
        console.log('   Password: admin123');
        
        process.exit(0);
        
    } catch(error) 
    {
        console.error('Script failed:', error);
        process.exit(1);
    }
}

main();

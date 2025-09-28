import { sequelize, User } from './admin/sequelize.js';

async function testSequelize() {
    try {
        console.log('🧪 Testing Sequelize connection...');
        
        // Тест підключення
        await sequelize.authenticate();
        console.log('✅ Sequelize connection OK');
        
        // Тест читання користувачів
        console.log('📋 Testing user fetch...');
        const users = await User.findAll({
            limit: 5,
            attributes: ['id', 'login', 'email', 'role', 'email_verified']
        });
        
        console.log(`📊 Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`  - ${user.id}: ${user.login} (${user.role}) - verified: ${user.email_verified}`);
        });
        
        // Тест оновлення користувача 18
        console.log('🔧 Testing user update...');
        const user18 = await User.findByPk(18);
        if (user18) {
            console.log('👤 User 18 before update:', {
                id: user18.id,
                login: user18.login,
                role: user18.role
            });
            
            await user18.update({ role: 'admin' });
            
            console.log('✅ User 18 after update:', {
                id: user18.id,
                login: user18.login,
                role: user18.role
            });
        } else {
            console.log('❌ User 18 not found');
        }
        
    } catch (error) {
        console.error('💥 Sequelize test failed:', error);
    } finally {
        await sequelize.close();
        console.log('🔒 Sequelize connection closed');
    }
}

testSequelize();

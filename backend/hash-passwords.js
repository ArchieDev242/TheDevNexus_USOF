import bcrypt from 'bcrypt';
import dbConnect from './utils/dbConnect.js';

async function hash_test_passwords() 
{
    try 
    {
        console.log('Хешуємо паролі тестових користувачів...');
        
        const test_users = [
            { login: 'admin', password: 'ZJKQ4DGx8Z0k38Eu934r9NDhTCQ21m7NFUJlYE4kM81ySsrEhs' },
            { login: 'gamedev_ukr', password: 'bNtqeaGMsrMW5Ehfn2Z7Vxs0Fhe3o83oy53' },
            { login: 'unity_master', password: 'Mh3j4V2Iks7m02kx4ikea9I0Lm898ZAO4t4' },
            { login: 'indie_dev', password: 'qOk07w63u7C282l5ImL055PP0JnMzE1Y42I67WF6' },
            { login: 'artist_2d', password: 'rwwOysP13rvF2M5mG5l2w7Q3FCOITWQgpe' }
        ];

        for(const user of test_users) 
            {
            console.log(`Хешуємо пароль для користувача: ${user.login}`);
            
            const hashed_password = await bcrypt.hash(user.password, 10);
            
            const query = 'UPDATE users SET password = ? WHERE login = ?';
            await dbConnect.make_request(query, [hashed_password, user.login]);
            
            console.log(`   Пароль оновлено для ${user.login}`);
            console.log(`   Оригінальний: ${user.password}`);
            console.log(`   Хешований: ${hashed_password}\n`);
        }
        
        console.log('Всі паролі успішно захешовані!');
        console.log('\nТепер можеш використовувати ці паролі для входу:');
        test_users.forEach(user => {
            console.log(`${user.login}: ${user.password}`);
        });
        
        process.exit(0);
    } catch(error) 
    {
        console.error('Помилка при хешуванні паролів:', error);
        process.exit(1);
    }
}

hash_test_passwords();

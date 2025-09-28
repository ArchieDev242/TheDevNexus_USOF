import fetch from 'node-fetch';

async function testAdminLogin() {
    try {
        console.log('🧪 Testing admin login...');
        
        const loginData = {
            loginOrEmail: 'admin',
            password: 'admin123'
        };
        
        console.log('📤 Sending login request:', { 
            loginOrEmail: loginData.loginOrEmail, 
            passwordLength: loginData.password.length 
        });
        
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', Object.fromEntries(response.headers));
        
        const result = await response.json();
        console.log('📥 Response body:', result);
        
        if (response.ok) {
            console.log('✅ Login successful!');
            console.log('🍪 Token present:', !!result.token);
        } else {
            console.log('❌ Login failed:', result.message || result.error);
        }
        
    } catch (error) {
        console.error('💥 Test failed:', error.message);
    }
}

testAdminLogin();

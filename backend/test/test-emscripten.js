import EmscriptenService from '../services/EmscriptenService.js';

async function test_emscripten() {
    console.log('🧪 Testing Emscripten Service...\n');

    // 1. Перевірка встановлення
    console.log('1️⃣ Checking Emscripten installation...');
    const installation = await EmscriptenService.check_emscripten_installation();
    console.log('Installation status:', installation);
    console.log('');

    if (!installation.installed) {
        console.log('❌ Emscripten is not installed. Please install it first.');
        return;
    }

    // 2. Тест connection
    console.log('2️⃣ Testing Emscripten connection...');
    const connection = await EmscriptenService.test_connection();
    console.log('Connection test:', connection);
    console.log('');

    // 3. Тест C коду
    console.log('3️⃣ Testing C code execution...');
    const c_code = `
#include <stdio.h>

int main() {
    printf("Hello from C via Emscripten!\\n");
    printf("Testing math: 2 + 2 = %d\\n", 2 + 2);
    return 0;
}`;

    try {
        const c_result = await EmscriptenService.execute_code(c_code, 'c');
        console.log('C execution result:', c_result);
    } catch (error) {
        console.error('C execution error:', error);
    }
    console.log('');

    // 4. Тест C++ коду
    console.log('4️⃣ Testing C++ code execution...');
    const cpp_code = `
#include <iostream>
#include <vector>

int main() {
    std::cout << "Hello from C++ via Emscripten!" << std::endl;
    
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int num : numbers) {
        sum += num;
    }
    
    std::cout << "Sum of numbers: " << sum << std::endl;
    return 0;
}`;

    try {
        const cpp_result = await EmscriptenService.execute_code(cpp_code, 'cpp');
        console.log('C++ execution result:', cpp_result);
    } catch (error) {
        console.error('C++ execution error:', error);
    }
    console.log('');

    // 5. Інформація про сервіс
    console.log('5️⃣ Service information:');
    const service_info = EmscriptenService.get_service_info();
    console.log(service_info);
}

test_emscripten().catch(console.error);

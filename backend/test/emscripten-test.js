import EmscriptenService from '../services/EmscriptenService.js';

async function test_emscripten() {
    console.log('🧪 Testing Emscripten Service with temp cleanup...\n');

    // Тест 1: Перевірка підключення
    console.log('📡 Testing connection...');
    const connection_test = await EmscriptenService.test_connection();
    console.log('Result:', connection_test);
    console.log('');

    // Тест 2: Компіляція C коду
    console.log('🔨 Testing C compilation...');
    const c_code = `
#include <stdio.h>
int main() {
    printf("Hello from C with temp cleanup!\\n");
    for(int i = 1; i <= 5; i++) {
        printf("Count: %d\\n", i);
    }
    return 0;
}`;
    
    const c_result = await EmscriptenService.execute_code(c_code, 'c');
    console.log('C Result:', c_result);
    console.log('');

    // Тест 3: Компіляція C++ коду
    console.log('⚡ Testing C++ compilation...');
    const cpp_code = `
#include <iostream>
#include <vector>
using namespace std;

int main() {
    cout << "Hello from C++ with temp cleanup!" << endl;
    vector<int> numbers = {1, 2, 3, 4, 5};
    
    cout << "Vector contents: ";
    for(int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    return 0;
}`;

    const cpp_result = await EmscriptenService.execute_code(cpp_code, 'cpp');
    console.log('C++ Result:', cpp_result);
    console.log('');

    // Тест 4: Код з помилкою
    console.log('❌ Testing error handling...');
    const error_code = `
#include <stdio.h>
int main() {
    undefined_function(); // це викличе помилку компіляції
    return 0;
}`;

    const error_result = await EmscriptenService.execute_code(error_code, 'c');
    console.log('Error Result:', error_result);
    console.log('');

    console.log('✅ All tests completed!');
    console.log('🗑️  Check that no temp directories are left in /tmp/emscripten_*');
}

test_emscripten().catch(console.error);

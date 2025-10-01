#!/usr/bin/env node

import JDoodle_service from '../services/JDoodleService.js';
import emscripten_service from '../services/EmscriptenService.js';
import code_snippet_service from '../services/CodeSnippetService.js';

console.log('🧪 Testing Code Execution Services...\n');

async function testJDoodle() {
    console.log('📍 Testing JDoodle Service:');
    
    // Перевірка кредитів
    const credits = await JDoodle_service.check_credits();
    console.log('💳 Credits:', credits);
    
    // Тестування з'єднання
    const connection = await JDoodle_service.test_connection();
    console.log('🔗 Connection test:', connection.success ? '✅' : '❌', connection.message);
    
    // Тестування виконання Python коду
    const pythonCode = `
print("Hello from Python!")
x = 5
y = 10
print(f"Sum: {x + y}")
`;
    
    console.log('\n🐍 Testing Python execution:');
    const pythonResult = await JDoodle_service.execute_code(pythonCode, 'python3');
    console.log('Result:', pythonResult.success ? '✅' : '❌');
    console.log('Output:', pythonResult.output);
    if (pythonResult.error) console.log('Error:', pythonResult.error);
    
    // Тестування виконання Java коду
    const javaCode = `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        int sum = 5 + 10;
        System.out.println("Sum: " + sum);
    }
}`;
    
    console.log('\n☕ Testing Java execution:');
    const javaResult = await JDoodle_service.execute_code(javaCode, 'java');
    console.log('Result:', javaResult.success ? '✅' : '❌');
    console.log('Output:', javaResult.output);
    if (javaResult.error) console.log('Error:', javaResult.error);
}

async function testEmscripten() {
    console.log('\n📍 Testing Emscripten Service:');
    
    // Перевірка установки
    const installation = await emscripten_service.check_emscripten_installation();
    console.log('🔧 Installation check:', installation.installed ? '✅' : '❌', installation.message);
    
    if (installation.installed) {
        // Тестування з'єднання
        const connection = await emscripten_service.test_connection();
        console.log('🔗 Connection test:', connection.success ? '✅' : '❌', connection.message);
        
        // Тестування виконання C коду
        const cCode = `
#include <stdio.h>
int main() {
    printf("Hello from C!\\n");
    int sum = 5 + 10;
    printf("Sum: %d\\n", sum);
    return 0;
}`;
        
        console.log('\n🔧 Testing C execution:');
        const cResult = await emscripten_service.execute_code(cCode, 'c');
        console.log('Result:', cResult.success ? '✅' : '❌');
        console.log('Output:', cResult.output);
        if (cResult.error) console.log('Error:', cResult.error);
    }
}

async function testIntegratedService() {
    console.log('\n📍 Testing Integrated Code Snippet Service:');
    
    // Тестування JavaScript (локально)
    const jsCode = `
console.log("Hello from JavaScript!");
const sum = 5 + 10;
console.log("Sum:", sum);
return sum;`;
    
    console.log('\n🌐 Testing JavaScript execution (local):');
    const jsResult = await code_snippet_service.run_code(jsCode, 'javascript', { service: 'local' });
    console.log('Result:', jsResult.execution.success ? '✅' : '❌');
    console.log('Output:', jsResult.execution.result);
    console.log('Service:', jsResult.executionService);
    
    // Тестування Python (через JDoodle)
    const pythonCode = `
print("Hello from Python via JDoodle!")
x = 15
y = 25
print(f"Sum: {x + y}")`;
    
    console.log('\n🐍 Testing Python execution (JDoodle):');
    const pythonResult = await code_snippet_service.run_code(pythonCode, 'python', { service: 'jdoodle' });
    console.log('Result:', pythonResult.execution.success ? '✅' : '❌');
    console.log('Output:', pythonResult.execution.output);
    console.log('Service:', pythonResult.executionService);
    
    // Тестування автоматичного вибору сервісу
    console.log('\n🤖 Testing automatic service selection:');
    const autoResult = await code_snippet_service.run_code(pythonCode, 'python', { service: 'auto' });
    console.log('Auto-selected service:', autoResult.executionService);
    console.log('Result:', autoResult.execution.success ? '✅' : '❌');
}

async function showServiceInfo() {
    console.log('\n📊 Service Information:');
    
    console.log('\n🔹 JDoodle Info:');
    console.log(JDoodle_service.get_service_info());
    
    console.log('\n🔹 Emscripten Info:');
    console.log(emscripten_service.get_service_info());
    
    console.log('\n🔹 Supported Languages:');
    const languages = code_snippet_service.get_supported_langs();
    languages.forEach(lang => {
        console.log(`  - ${lang.name}: services=[${lang.services.join(', ')}], default=${lang.defaultService}`);
    });
}

async function main() {
    try {
        await showServiceInfo();
        await testJDoodle();
        await testEmscripten();
        await testIntegratedService();
        
        console.log('\n🎉 Testing completed!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Запуск тестів
main();

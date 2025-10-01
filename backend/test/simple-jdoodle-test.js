import JDoodle_service from '../services/JDoodleService.js';

const testCode = 'print("Hello from JDoodle!")';

console.log('🧪 Testing JDoodle with Python...');

JDoodle_service.execute_code(testCode, 'python3').then(result => {
  console.log('✅ Success:', result.success);
  console.log('📤 Output:', result.output);
  console.log('⏱️  Execution time:', result.executionTime + 'ms');
  console.log('💾 Memory used:', result.memoryUsed + ' bytes');
  
  if (result.success) {
    console.log('🎉 JDoodle integration working!');
  } else {
    console.log('❌ Error:', result.error);
  }
}).catch(error => {
  console.error('❌ Test failed:', error.message);
});

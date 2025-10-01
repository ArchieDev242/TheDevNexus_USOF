# Code Execution API Documentation

## Overview

Інтегрована система виконання коду, що підтримує декілька мов програмування через різні сервіси:
- **Local**: JavaScript виконання в Node.js (VM2)
- **JDoodle**: Хмарний сервіс для виконання коду різних мов
- **Emscripten**: Компіляція та виконання C/C++ через WebAssembly

## API Endpoints

### 1. Виконання коду
```
POST /api/code/execute
```

**Request Body:**
```json
{
  "code": "print('Hello World')",
  "language": "python",
  "service": "auto",
  "timeout": 10000,
  "stdin": ""
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "code": "print('Hello World')",
    "language": "python",
    "highlightedCode": "<span class='hljs-built_in'>print</span>...",
    "execution": {
      "success": true,
      "result": "Hello World\n",
      "output": "Hello World\n",
      "error": null,
      "executionTime": 1250,
      "service": "jdoodle"
    },
    "validation": {
      "errors": [],
      "warnings": []
    },
    "executionService": "jdoodle"
  }
}
```

### 2. Підтримувані мови
```
GET /api/code/languages
```

**Response:**
```json
{
  "success": true,
  "data": {
    "languages": [
      {
        "name": "javascript",
        "services": ["local"],
        "defaultService": "local"
      },
      {
        "name": "python",
        "services": ["jdoodle"],
        "defaultService": "jdoodle"
      }
    ],
    "total": 15
  }
}
```

### 3. Доступні сервіси для мови
```
GET /api/code/languages/:language/services
```

**Response:**
```json
{
  "success": true,
  "data": {
    "language": "python",
    "services": ["jdoodle"],
    "defaultService": "jdoodle"
  }
}
```

### 4. Статус сервісів
```
GET /api/code/services/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jdoodle": {
      "success": true,
      "message": "JDoodle connection successful",
      "info": {
        "name": "JDoodle",
        "dailyLimit": 200
      },
      "credits": {
        "used": 15,
        "total": 200
      }
    },
    "emscripten": {
      "success": false,
      "message": "Emscripten is not installed"
    },
    "local": {
      "success": true,
      "message": "Local JavaScript execution available"
    }
  }
}
```

### 5. Тестування сервісу
```
POST /api/code/services/:service/test
```

**Request Body (optional):**
```json
{
  "code": "console.log('test')",
  "language": "javascript"
}
```

### 6. Підсвічування синтаксису
```
POST /api/code/highlight
```

**Request Body:**
```json
{
  "code": "function hello() { return 'world'; }",
  "language": "javascript"
}
```

### 7. Форматування коду
```
POST /api/code/format
```

### 8. Валідація коду
```
POST /api/code/validate
```

## Підтримувані мови

### JDoodle Service
- **JavaScript/Node.js**: `javascript`, `nodejs`
- **Python**: `python`, `python3`
- **Java**: `java`
- **C++**: `cpp`
- **C**: `c`
- **C#**: `csharp`
- **PHP**: `php`
- **Go**: `go`
- **Rust**: `rust`
- **Kotlin**: `kotlin`
- **Swift**: `swift`

### Emscripten Service
- **C**: `c`
- **C++**: `cpp`

### Local Service
- **JavaScript**: `javascript`

## Configuration

### JDoodle Setup
1. Зареєструйтеся на [JDoodle](https://www.jdoodle.com/)
2. Отримайте Client ID та Client Secret
3. Встановіть їх у `JDoodleService.js`:
```javascript
static CLIENT_ID = 'your_client_id';
static CLIENT_SECRET = 'your_client_secret';
```

### Emscripten Setup
1. Встановіть Emscripten SDK в корінь проекту:
```bash
# Перейдіть в корінь проекту
cd /path/to/your/project

# Клонуйте emsdk
git clone https://github.com/emscripten-core/emsdk.git

# Встановіть останню версію
cd emsdk
./emsdk install latest
./emsdk activate latest
```

2. Сервіс автоматично знайде Emscripten в папці `emsdk/upstream/emscripten`

3. Перевірте установку:
```bash
# Запустіть тест
node backend/test/test-emscripten.js
```

**Примітка**: Emscripten буде встановлений в папку `emsdk` в корені вашого проекту. Це займає приблизно 350MB дискового простору.

## Rate Limiting

- **Code Execution**: 50 запитів на 15 хвилин
- **Other Operations**: 100 запитів на 15 хвилин

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Error Types
- **400**: Invalid request (missing code/language)
- **429**: Rate limit exceeded
- **500**: Service execution error
- **503**: Service unavailable

## Usage Examples

### Frontend Integration (JavaScript)
```javascript
// Виконання Python коду
const executeCode = async (code, language) => {
  try {
    const response = await fetch('/api/code/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        code: code,
        language: language,
        service: 'auto'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Output:', result.data.execution.output);
      console.log('Service used:', result.data.executionService);
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};

// Використання
executeCode('print("Hello from Python!")', 'python');
```

### Testing Services
```javascript
// Перевірка доступності сервісів
const checkServices = async () => {
  const response = await fetch('/api/code/services/status');
  const result = await response.json();
  
  console.log('JDoodle available:', result.data.jdoodle.success);
  console.log('Credits used:', result.data.jdoodle.credits.used);
};
```

## Security Features

1. **Code Validation**: Перевірка на небезпечні конструкції
2. **Timeout Protection**: Обмеження часу виконання
3. **Rate Limiting**: Запобігання зловживанням
4. **Authentication**: Вимагає авторизації для виконання
5. **Sandboxing**: Ізоляція виконання коду

## Monitoring

- Всі виконання логуються
- Відстеження використання кредитів JDoodle
- Моніторинг помилок та таймаутів
- Статистика використання мов та сервісів

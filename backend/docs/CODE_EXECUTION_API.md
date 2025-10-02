# Code Execution & Snippets API

## Overview
Meet the platform’s miniature code studio. The Code Execution API lets you run, highlight, format, and validate snippets across multiple runtimes—without ever leaving the product. Three execution backends are supported out of the box:

- **Local (VM2)** – Safe JavaScript execution inside Node.js.
- **JDoodle** – Cloud-powered execution for a wide range of languages.
- **Emscripten** – WebAssembly magic for compiling and running C/C++.

All endpoints live under the `/api/code` prefix.

> **Pro tip:** Pair execution with highlighting and validation to deliver a polished “write → preview → ship” snippet experience.

## Core Endpoints

### 1. Execute code
```
POST /api/code/execute
```

**Request body**
```json
{
  "code": "print('Hello World')",
  "language": "python",
  "service": "auto",
  "timeout": 10000,
  "stdin": ""
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "code": "print('Hello World')",
    "language": "python",
    "highlightedCode": "<span class='hljs-built_in'>print</span>(...)",
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

### 2. List supported languages
```
GET /api/code/languages
```

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

### 3. Discover services for a language
```
GET /api/code/languages/:language/services
```

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

### 4. Check service health
```
GET /api/code/services/status
```

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

### 5. Smoke-test a service
```
POST /api/code/services/:service/test
```

```json
{
  "code": "console.log('test')",
  "language": "javascript"
}
```

## Snippet Toolkit
Take snippets from raw text to production-ready preview using the trio of helper endpoints below:

| Endpoint | Purpose |
| -------- | ------- |
| `POST /api/code/highlight` | Returns HTML/ANSI highlighting for any supported language. |
| `POST /api/code/format` | Formats code (where language tooling allows) for cleaner diffs. |
| `POST /api/code/validate` | Lints and sanity-checks snippets before execution. |

**Highlight request example**
```json
{
  "code": "function hello() { return 'world'; }",
  "language": "javascript"
}
```

## Language Matrix

### JDoodle service
- JavaScript / Node.js: `javascript`, `nodejs`
- Python: `python`, `python3`
- Java: `java`
- C / C++: `c`, `cpp`
- C#: `csharp`
- PHP: `php`
- Go: `go`
- Rust: `rust`
- Kotlin: `kotlin`
- Swift: `swift`

### Emscripten service
- C: `c`
- C++: `cpp`

### Local service
- JavaScript: `javascript`

## Configuration Notes

### JDoodle setup
1. Register at [JDoodle](https://www.jdoodle.com/).
2. Grab your Client ID and Client Secret.
3. Update `JDoodleService.js`:
   ```javascript
   static CLIENT_ID = 'your_client_id';
   static CLIENT_SECRET = 'your_client_secret';
   ```

### Emscripten setup
```bash
cd /path/to/your/project
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
```

- The service auto-detects the toolchain under `emsdk/upstream/emscripten`.
- Validate the installation with:
  ```bash
  node backend/test/test-emscripten.js
  ```
- Disk footprint is roughly 350 MB.

## Rate Limits
- **`POST /execute`** – 50 requests per 15 minutes
- **All other code endpoints** – 100 requests per 15 minutes

## Error Reference

Common envelope:
```json
{
  "success": false,
  "error": "Error message here"
}
```

| Status | Meaning |
| ------ | ------- |
| 400 | Payload issues (missing code, unsupported language, etc.) |
| 429 | Rate limit exceeded |
| 500 | Execution failure inside the selected service |
| 503 | Service temporarily unavailable |

## Usage Patterns

### Frontend execution helper
```javascript
const executeCode = async (code, language) => {
  const response = await fetch('/api/code/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code, language, service: 'auto' })
  });

  const result = await response.json();

  if (result.success) {
    console.log('Output:', result.data.execution.output);
    console.log('Service used:', result.data.executionService);
  } else {
    console.error('Error:', result.error);
  }
};

executeCode('print("Hello from Python!")', 'python');
```

### Monitors & health checks
```javascript
const checkServices = async () => {
  const response = await fetch('/api/code/services/status');
  const result = await response.json();

  console.log('JDoodle available:', result.data.jdoodle.success);
  console.log('Credits used:', result.data.jdoodle.credits.used);
};
```

## Safety Nets
1. **Validation** – Sniffs out dangerous constructs before execution.
2. **Timeouts** – Stops runaway processes.
3. **Rate limiting** – Keeps abuse in check.
4. **Authentication** – Ensures only trusted users can execute code.
5. **Sandboxing** – Isolates runtime environments.

## Observability
- Every execution is logged with metadata for auditing.
- JDoodle credit usage is tracked so you never overrun daily quotas.
- Failures and timeouts surface in centralized monitoring.
- Language/service usage metrics help you tune quotas and defaults.

## Quick Testing

### Terminal (curl)
```bash
# Execute Python code and print the result
curl -X POST http://127.0.0.1:3000/api/code/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Hello DevNexus\")","language":"python","service":"auto"}'

# Highlight a JavaScript snippet
curl -X POST http://127.0.0.1:3000/api/code/highlight \
  -H "Content-Type: application/json" \
  -d '{"code":"const hi = () => 42;","language":"javascript"}'

# Inspect service health before running anything heavy
curl http://127.0.0.1:3000/api/code/services/status
```

### Postman Walkthrough
1. **Collection prep**: Create “Code Execution API” with `{{base_url}} = http://127.0.0.1:3000/api/code`.
2. **Run snippet**: Add POST `{{base_url}}/execute` using a raw JSON body; save the response to inspect `execution.output` and `executionService`.
3. **Highlight & format**: Duplicate the request and aim it at `/highlight` and `/format` with the same snippet to validate the pre-processing pipeline.
4. **Validate**: Add POST `{{base_url}}/validate` and purposely send malformed code to see validation warnings come back.
5. **Health check**: Finish with GET `{{base_url}}/services/status` so your monitoring dashboards can confirm which backends are ready for prime time.

## Quick Reference

### Code Execution
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

### Supported Languages
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

### Available Services for Language
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

### Service Status
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

### Service Testing
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

### Syntax Highlighting
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

### Code Formatting
```
POST /api/code/format
```

### Code Validation
```
POST /api/code/validate
```

## Extended Language Support

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

## Setup Instructions

### JDoodle Setup
1. Register at [JDoodle](https://www.jdoodle.com/)
2. Get your Client ID and Client Secret
3. Set them in `JDoodleService.js`:
```javascript
static CLIENT_ID = 'your_client_id';
static CLIENT_SECRET = 'your_client_secret';
```

### Emscripten Setup
1. Install Emscripten SDK in project root:
```bash
# Navigate to project root
cd /path/to/your/project

# Clone emsdk
git clone https://github.com/emscripten-core/emsdk.git

# Install latest version
cd emsdk
./emsdk install latest
./emsdk activate latest
```

2. Service automatically detects Emscripten in `emsdk/upstream/emscripten` folder

3. Verify installation:
```bash
# Run test
node backend/test/test-emscripten.js
```

**Note**: Emscripten will be installed in the `emsdk` folder in your project root. This takes approximately 350MB of disk space.

## Performance Limits

- **Code Execution**: 50 requests per 15 minutes
- **Other Operations**: 100 requests per 15 minutes

## Response Codes

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

## Integration Examples

### Frontend Integration (JavaScript)
```javascript
// Execute Python code
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

// Usage
executeCode('print("Hello from Python!")', 'python');
```

### Service Testing
```javascript
// Check service availability
const checkServices = async () => {
  const response = await fetch('/api/code/services/status');
  const result = await response.json();
  
  console.log('JDoodle available:', result.data.jdoodle.success);
  console.log('Credits used:', result.data.jdoodle.credits.used);
};
```

## Security Measures

1. **Code Validation**: Checks for dangerous constructs
2. **Timeout Protection**: Execution time limits
3. **Rate Limiting**: Prevents abuse
4. **Authentication**: Requires authorization for execution
5. **Sandboxing**: Code execution isolation

## Analytics & Monitoring

- All executions are logged
- JDoodle credit usage tracking
- Error and timeout monitoring
- Language and service usage statistics

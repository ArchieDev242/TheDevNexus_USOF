import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class emscripten_service 
{
    static PROJECT_ROOT = path.resolve(__dirname, '../..');
    static EMSCRIPTEN_PATH = process.env.EMSCRIPTEN_PATH || path.join(this.PROJECT_ROOT, 'emsdk/upstream/emscripten');

    static create_temp_dir() 
    {
        const temp_base = os.tmpdir();
        const unique_id = `emscripten_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return path.join(temp_base, unique_id);
    }

    static async execute_code(code, language, options = {}) 
    {
        const { timeout = 10000 } = options;
        let temp_dir = null;
        
        try 
        {
            temp_dir = this.create_temp_dir();
            await fs.mkdir(temp_dir, { recursive: true });
            
            const start_time = Date.now();
            const temp_id = `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const extension = language === 'cpp' ? '.cpp' : '.c';
            const source_file = path.join(temp_dir, `${temp_id}${extension}`);
            const wasm_file = path.join(temp_dir, `${temp_id}.wasm`);
            const js_file = path.join(temp_dir, `${temp_id}.cjs`);

            await fs.writeFile(source_file, code);

            const compile_result = await this.compile_with_emscripten(source_file, js_file, language, timeout, temp_dir);
            
            if(!compile_result.success) 
                {
                await this.cleanup_directory(temp_dir);
                return compile_result;
            }

            const execute_result = await this.execute_compiled_code(js_file, timeout, temp_dir);
            
            await this.cleanup_directory(temp_dir);
            
            const execution_time = Date.now() - start_time;

            return {
                ...execute_result,
                executionTime: execution_time,
                compilationOutput: compile_result.output
            };

        } catch(error) 
        {
            console.error('❌ Emscripten execution failed:', error.message);

            if(temp_dir) await this.cleanup_directory(temp_dir);

            return {
                success: false,
                result: null,
                output: '',
                error: `Emscripten service error: ${error.message}`,
                executionTime: 0
            };
        }
    }

    static async compile_with_emscripten(sourceFile, outputFile, language, timeout, temp_dir) 
    {
        return new Promise((resolve) => {
            const compiler = language === 'cpp' ? 'em++' : 'emcc';
            const compiler_path = path.join(this.EMSCRIPTEN_PATH, compiler);
            const args = [
                sourceFile,
                '-o', outputFile,
                '-s', 'WASM=1',
                '-s', 'EXPORTED_RUNTIME_METHODS=["ccall","cwrap"]',
                '-s', 'ENVIRONMENT=node',
                '-s', 'EXPORT_ES6=0',
                '--no-entry'
            ];

            console.log(`Compiling ${language} code with ${compiler}...`);
            console.log(`Using temp directory: ${temp_dir}`);

            const child_process = spawn(compiler_path, args, {
                cwd: temp_dir,
                env: { 
                    ...process.env, 
                    PATH: `${this.EMSCRIPTEN_PATH}:${process.env.PATH}`,
                    EMSCRIPTEN: this.EMSCRIPTEN_PATH
                }
            });

            let stdout = '';
            let stderr = '';

            child_process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child_process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            const timer = setTimeout(() => {
                child_process.kill();
                resolve({
                    success: false,
                    output: stderr,
                    error: 'Compilation timeout'
                });
            }, timeout);

            child_process.on('close', (code) => {
                clearTimeout(timer);
                resolve({
                    success: code === 0,
                    output: stdout + stderr,
                    error: code !== 0 ? stderr : null
                });
            });

            child_process.on('error', (error) => {
                clearTimeout(timer);
                resolve({
                    success: false,
                    output: '',
                    error: `Compiler error: ${error.message}`
                });
            });
        });
    }

    static async execute_compiled_code(jsFile, timeout, temp_dir) 
    {
        return new Promise((resolve) => {
            console.log('▶Executing compiled WebAssembly code...');

            const child_process = spawn('node', [jsFile], {
                cwd: temp_dir
            });

            let stdout = '';
            let stderr = '';

            child_process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child_process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            const timer = setTimeout(() => {
                child_process.kill();
                resolve({
                    success: false,
                    result: null,
                    output: stdout,
                    error: 'Execution timeout'
                });
            }, timeout);

            child_process.on('close', (code) => {
                clearTimeout(timer);
                resolve({
                    success: code === 0,
                    result: stdout,
                    output: stdout,
                    error: code !== 0 ? stderr : null
                });
            });

            child_process.on('error', (error) => {
                clearTimeout(timer);
                resolve({
                    success: false,
                    result: null,
                    output: stdout,
                    error: `Execution error: ${error.message}`
                });
            });
        });
    }

    static async cleanup_directory(dir_path) 
    {
        try 
        {
            await fs.rm(dir_path, { recursive: true, force: true });
            console.log(`Cleaned up temp directory: ${dir_path}`);
        } catch(error) 
        {
            console.warn(`⚠️ Failed to cleanup temp directory: ${error.message}`);
        }
    }

    static async cleanup(files) 
    {
        for(const file of files) 
            {
            try 
            {
                await fs.unlink(file);
            } catch(error) 
            {
                // ignore
            }
        }
    }

    static async check_emscripten_installation() 
    {
        return new Promise((resolve) => {
            const emcc_path = path.join(this.EMSCRIPTEN_PATH, 'emcc');
            const child_process = spawn(emcc_path, ['--version'], {
                env: { ...process.env, PATH: `${this.EMSCRIPTEN_PATH}:${process.env.PATH}` }
            });
            
            let stdout = '';
            let stderr = '';
            
            child_process.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            child_process.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            child_process.on('close', (code) => {
                resolve({
                    installed: code === 0,
                    message: code === 0 ? `Emscripten is installed: ${stdout.trim()}` : 'Emscripten is not installed',
                    version: code === 0 ? stdout.trim() : null
                });
            });

            child_process.on('error', (error) => {
                resolve({
                    installed: false,
                    message: `Emscripten is not installed or not accessible: ${error.message}`
                });
            });
        });
    }

    static get_service_info() 
    {
        return {
            name: 'Emscripten',
            url: 'https://emscripten.org/',
            description: 'Compile C/C++ code to WebAssembly',
            supportedLanguages: ['c', 'cpp'],
            features: [
                'Native C/C++ execution',
                'WebAssembly compilation',
                'High performance',
                'Full standard library support'
            ],
            requirements: [
                'Emscripten SDK must be installed',
                'Node.js runtime for execution'
            ]
        };
    }

    static async test_connection() 
    {
        try 
        {
            const install_check = await this.check_emscripten_installation();
            if(!install_check.installed) 
                {
                return {
                    success: false,
                    message: 'Emscripten is not installed',
                    error: install_check.message
                };
            }

            const test_code = `
#include <stdio.h>
int main() {
    printf("Hello from Emscripten! Temp cleanup working!\\n");
    return 0;
}`;
            
            const result = await this.execute_code(test_code, 'c');
            
            return {
                success: result.success,
                message: result.success ? 'Emscripten connection successful (with temp cleanup)' : 'Emscripten connection failed',
                output: result.output,
                error: result.error
            };
        } catch(error) 
        {
            return {
                success: false,
                message: 'Emscripten connection test failed',
                error: error.message
            };
        }
    }

    static get_supported_langs() 
    {
        return ['c', 'cpp'];
    }

    static is_lang_supported(language) 
    {
        return ['c', 'cpp'].includes(language);
    }
}

export default emscripten_service;

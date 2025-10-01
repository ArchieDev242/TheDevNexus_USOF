import hljs from 'highlight.js';
import { VM } from 'vm2';
import error_handler from '../middleware/errorHandler.js';
import JDoodleService from './JDoodleService.js';
import EmscriptenService from './EmscriptenService.js';

class code_snippet_service 
{
    static supported_langs = [
        'javascript', 'python', 'java', 'cpp', 'csharp', 'php', 
        'html', 'css', 'sql', 'json', 'xml', 'markdown', 'bash',
        'c', 'python3', 'nodejs', 'go', 'rust', 'kotlin', 'swift'
    ];

    static lang_mapping = {
        jdoodle: 
        {
            'javascript': 'nodejs',
            'python': 'python3',
            'java': 'java',
            'cpp': 'cpp17',
            'c': 'c',
            'csharp': 'csharp',
            'php': 'php',
            'go': 'go',
            'rust': 'rust',
            'kotlin': 'kotlin',
            'swift': 'swift',
            'python3': 'python3',
            'nodejs': 'nodejs'
        },
        emscripten: 
        {
            'c': 'c',
            'cpp': 'cpp'
        }
    };

    static code_highlighting(code, language = 'auto') 
    {
        try 
        {
            if(language === 'auto') 
                {
                const result = hljs.highlightAuto(code);
                return {
                    highlightedCode: result.value,
                    detectedLanguage: result.language,
                    relevance: result.relevance
                };
            } else if(this.supported_langs.includes(language)) 
                {
                const result = hljs.highlight(code, { language });

                return {
                    highlightedCode: result.value,
                    detectedLanguage: language,
                    relevance: 100
                };
            } else 
                {
                throw new Error(`Unsupported language: ${language}`);
            }
        } 
        catch(error) 
        {
            throw new Error(`Code highlighting failed: ${error.message}`);
        }
    }

    static JS_execute(code, timeout = 5000) 
    {
        try 
        {
            const vm = new VM({
                timeout,
                sandbox: 
                {
                    console: 
                    {
                        log: (...args) => args.join(' '),
                        error: (...args) => `ERROR: ${args.join(' ')}`,
                        warn: (...args) => `WARNING: ${args.join(' ')}`
                    }
                },
                eval: false,
                wasm: false
            });

            const start_time = Date.now();
            const result = vm.run(code);
            const execution_time = Date.now() - start_time;

            return {
                success: true,
                result: result,
                executionTime: execution_time,
                error: null
            };
        } 
        catch(error) 
        {
            return {
                success: false,
                result: null,
                executionTime: 0,
                error: error.message
            };
        }
    }

    static validate_code(code, language) 
    {
        const errors = [];
        const warnings = [];

        if(!code || code.trim().length === 0) 
            {
            errors.push('Code cannot be empty');
            return { errors, warnings };
        }

        if(code.length > 50000) 
            {
            errors.push('Code is too long (max 50,000 characters)');
        }

        const dangerous_patterns = [
            /eval\s*\(/,
            /Function\s*\(/,
            /setTimeout\s*\(/,
            /setInterval\s*\(/,
            /require\s*\(/,
            /import\s*\(/,
            /process\./,
            /global\./,
            /window\./,
            /document\./
        ];

        dangerous_patterns.forEach(pattern => {
            if(pattern.test(code)) 
                {
                warnings.push(`Potentially dangerous code detected: ${pattern.source}`);
            }
        });

        if(language === 'javascript') 
            {
            if(!/^\s*\/\/|^\s*\/\*/.test(code) && code.includes('function') && !code.includes('return')) 
                {
                warnings.push('Function might be missing return statement');
            }
        }

        return { errors, warnings };
    }

    static format_code(code, language) 
    {
        try 
        {
            let formatted = code;

            formatted = formatted.replace(/[ \t]+$/gm, '');
            
            if(language === 'javascript' || language === 'json') 
                {
                const lines = formatted.split('\n');
                let indent_level = 0;
                const indent_size = 2;

                formatted = lines.map(line => {
                    const trimmed = line.trim();
                    
                    if(trimmed.includes('}') || trimmed.includes(']')) 
                        {
                        indent_level = Math.max(0, indent_level - 1);
                    }
                    
                    const indented = ' '.repeat(indent_level * indent_size) + trimmed;
                    
                    if(trimmed.includes('{') || trimmed.includes('[')) indent_level++;
                    
                    return indented;
                }).join('\n');
            }

            return {
                success: true,
                formattedCode: formatted,
                error: null
            };
        } 
        catch(error) 
        {
            return {
                success: false,
                formattedCode: code,
                error: error.message
            };
        }
    }

    static create_snippet(data) 
    {
        const { title, code, language, description, isPublic = false } = data;
        
        const validation = this.validate_code(code, language);
        if(validation.errors.length > 0) throw error_handler.validation_error(validation.errors);

        const highlighted = this.code_highlighting(code, language);
        const formatted = this.format_code(code, language);

        return {
            title,
            code: formatted.formattedCode,
            language: highlighted.detectedLanguage,
            description,
            isPublic,
            highlightedCode: highlighted.highlightedCode,
            validation: validation,
            createdAt: new Date().toISOString()
        };
    }

    static async run_code(code, language, options = {}) 
    {
        const { timeout = 5000, memoryLimit = 50, service = 'auto' } = options;
        
        const validation = this.validate_code(code, language);
        if(validation.errors.length > 0) throw error_handler.validation_error(validation.errors);

        let result = {};
        let executionService = service;

        if(service === 'auto') 
            {
            if(language === 'javascript' || language === 'nodejs') 
                {
                executionService = 'local';
            } else if(this.lang_mapping.emscripten[language]) 
                {
                executionService = 'emscripten';
            } else if(this.lang_mapping.jdoodle[language]) 
                {
                executionService = 'jdoodle';
            } else 
                {
                executionService = 'local';
            }
        }

        try {
            switch(executionService) 
            {
                case 'local':
                    if(language === 'javascript' || language === 'nodejs') 
                        {
                        result = this.JS_execute(code, timeout);
                    } else 
                        {
                        result = {
                            success: false,
                            result: null,
                            executionTime: 0,
                            error: `Local execution not supported for ${language}. Try using JDoodle service.`,
                            service: 'local'
                        };
                    } break;

                case 'jdoodle':
                    const jdoodle_language = this.lang_mapping.jdoodle[language];
                    if(jdoodle_language) 
                        {
                        result = await JDoodleService.executeCode(code, jdoodle_language, { timeout });
                        result.service = 'jdoodle';
                    } else 
                        {
                        result = {
                            success: false,
                            result: null,
                            executionTime: 0,
                            error: `JDoodle execution not supported for ${language}`,
                            service: 'jdoodle'
                        };
                    } break;

                case 'emscripten':
                    const emscripten_language = this.lang_mapping.emscripten[language];
                    if(emscripten_language) 
                        {
                        result = await EmscriptenService.executeCode(code, emscripten_language, { timeout });
                        result.service = 'emscripten';
                    } else 
                        {
                        result = {
                            success: false,
                            result: null,
                            executionTime: 0,
                            error: `Emscripten execution not supported for ${language}`,
                            service: 'emscripten'
                        };
                    } break;
                    
                default:
                    result = {
                        success: false,
                        result: null,
                        executionTime: 0,
                        error: `Unknown execution service: ${service}`,
                        service: service
                    };
            }
        } catch(error) 
        {
            result = {
                success: false,
                result: null,
                executionTime: 0,
                error: `Execution failed: ${error.message}`,
                service: executionService
            };
        }

        const highlighted = this.code_highlighting(code, language);

        return {
            code: code,
            language: highlighted.detectedLanguage,
            highlightedCode: highlighted.highlightedCode,
            execution: result,
            validation: validation,
            executionService: executionService
        };
    }

    static get_available_services(language) 
    {
        const services = ['local'];
        
        if(this.lang_mapping.jdoodle[language]) services.push('jdoodle');
        
        if(this.lang_mapping.emscripten[language]) services.push('emscripten');
        
        return services;
    }

    static get_supported_langs() 
    {
        return this.supported_langs.map(lang => ({
            name: lang,
            services: this.get_available_services(lang),
            defaultService: this.get_default_service(lang)
        }));
    }

    static get_default_service(language) 
    {
        if(language === 'javascript' || language === 'nodejs') 
            {
            return 'local';
        } else if(this.lang_mapping.emscripten[language]) 
            {
            return 'emscripten';
        } else if(this.lang_mapping.jdoodle[language]) 
            {
            return 'jdoodle';
        }
        return 'local';
    }
}

export default code_snippet_service;

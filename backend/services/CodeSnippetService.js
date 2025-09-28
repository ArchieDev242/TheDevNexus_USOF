import hljs from 'highlight.js';
import { VM } from 'vm2';
import ErrorHandler from '../middleware/errorHandler.js';

class CodeSnippetService 
{
    static supportedLanguages = [
        'javascript', 'python', 'java', 'cpp', 'csharp', 'php', 
        'html', 'css', 'sql', 'json', 'xml', 'markdown', 'bash'
    ];

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
            } else if(this.supportedLanguages.includes(language)) 
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
        if(validation.errors.length > 0) throw ErrorHandler.validation_error(validation.errors);

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
        const { timeout = 5000, memoryLimit = 50 } = options;
        
        const validation = this.validate_code(code, language);
        if(validation.errors.length > 0) throw ErrorHandler.validation_error(validation.errors);

        let result = {};

        switch(language) 
        {
            case 'javascript': result = this.JS_execute(code, timeout); break;
                
            default:
                result = {
                    success: false,
                    result: null,
                    executionTime: 0,
                    error: `Execution not supported for ${language}`
                };
        }

        const highlighted = this.code_highlighting(code, language);

        return {
            code: code,
            language: highlighted.detectedLanguage,
            highlightedCode: highlighted.highlightedCode,
            execution: result,
            validation: validation
        };
    }
}

export default CodeSnippetService;

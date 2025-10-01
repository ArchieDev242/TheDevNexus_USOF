import code_snippet_service from '../services/CodeSnippetService.js';
import JDoodle_service from '../services/JDoodleService.js';
import emscripten_service from '../services/EmscriptenService.js';
import error_handler from '../middleware/errorHandler.js';

class code_execution_controller 
{
    static async execute_code(req, res) 
    {
        try 
        {
            const { code, language, service = 'auto', timeout = 10000, stdin = '' } = req.body;

            if(!code || !language) 
                {
                return res.status(400).json({
                    success: false,
                    error: 'Code and language are required'
                });
            }

            if(!code_snippet_service.supported_langs.includes(language)) 
                {
                return res.status(400).json({
                    success: false,
                    error: `Unsupported language: ${language}`,
                    supportedLanguages: code_snippet_service.supported_langs
                });
            }

            console.log(`Executing ${language} code via ${service} service...`);

            const result = await code_snippet_service.run_code(code, language, {
                service,
                timeout,
                stdin
            });

            res.json({
                success: true,
                data: result
            });

        } catch(error) 
        {
            console.error('❌ Code execution error:', error);
            error_handler.handleError(res, error);
        }
    }

    static async get_supported_langs(req, res) 
    {
        try 
        {
            const languages = code_snippet_service.get_supported_langs();
            
            res.json({
                success: true,
                data: 
                {
                    languages,
                    total: languages.length
                }
            });
        } catch(error) 
        {
            error_handler.handleError(res, error);
        }
    }

    static async get_available_services(req, res) 
    {
        try 
        {
            const { language } = req.params;

            if(!code_snippet_service.supported_langs.includes(language)) 
                {
                return res.status(400).json({
                    success: false,
                    error: `Unsupported language: ${language}`
                });
            }

            const services = code_snippet_service.get_available_services(language);
            const default_service = code_snippet_service.get_default_service(language);

            res.json({
                success: true,
                data: 
                {
                    language,
                    services,
                    defaultService: default_service
                }
            });
        } catch(error) 
        {
            error_handler.handleError(res, error);
        }
    }

    static async get_services_status(req, res) 
    {
        try 
        {
            console.log('Checking services status...');

            const [jdoodleStatus, emscriptenStatus, jdoodleCredits] = await Promise.all([
                JDoodle_service.test_connection(),
                emscripten_service.test_connection(),
                JDoodle_service.check_credits()
            ]);

            const status = {
                jdoodle: 
                {
                    ...jdoodleStatus,
                    info: JDoodle_service.get_service_info(),
                    credits: jdoodleCredits
                },
                emscripten: 
                {
                    ...emscriptenStatus,
                    info: emscripten_service.get_service_info()
                },
                local: 
                {
                    success: true,
                    message: 'Local JavaScript execution available',
                    supportedLanguages: ['javascript', 'nodejs']
                }
            };

            res.json({
                success: true,
                data: status
            });
        } catch(error) 
        {
            error_handler.handleError(res, error);
        }
    }

    static async test_service(req, res) 
    {
        try 
        {
            const { service } = req.params;
            const { code, language } = req.body;

            let result;

            switch(service) 
            {
                case 'jdoodle':
                    if(code && language) 
                        {
                        const jdoodle_lang = code_snippet_service.lang_mapping.jdoodle[language];
                        if(!jdoodle_lang) 
                            {
                            return res.status(400).json({
                                success: false,
                                error: `JDoodle doesn't support ${language}`
                            });
                        }
                        result = await JDoodle_service.execute_code(code, jdoodle_lang);
                    } else 
                        {
                        result = await JDoodle_service.test_connection();
                    }
                    break;

                case 'emscripten':
                    if(code && language) 
                        {
                        if(!emscripten_service.is_lang_supported(language)) 
                            {
                            return res.status(400).json({
                                success: false,
                                error: `Emscripten doesn't support ${language}`
                            });
                        }
                        result = await emscripten_service.execute_code(code, language);
                    } else 
                        {
                        result = await emscripten_service.test_connection();
                    }

                    break;

                case 'local':
                    if(code && (language === 'javascript' || language === 'nodejs')) 
                        {
                        result = code_snippet_service.JS_execute(code);
                        result.service = 'local';
                    } else 
                        {
                        result = {
                            success: true,
                            message: 'Local JavaScript execution is available',
                            service: 'local'
                        };
                    }
                    break;

                default:
                    return res.status(400).json({
                        success: false,
                        error: `Unknown service: ${service}`
                    });
            }

            res.json({
                success: true,
                data: result
            });

        } catch(error) 
        {
            error_handler.handleError(res, error);
        }
    }

    static async syntax_highlight(req, res) 
    {
        try 
        {
            const { code, language = 'auto' } = req.body;

            if(!code) 
                {
                return res.status(400).json({
                    success: false,
                    error: 'Code is required'
                });
            }

            const result = code_snippet_service.code_highlighting(code, language);
            
            res.json({
                success: true,
                data: result
            });
        } catch(error) 
        {
            error_handler.handleError(res, error);
        }
    }

    static async code_formatting(req, res) 
    {
        try 
        {
            const { code, language } = req.body;

            if(!code || !language) 
                {
                return res.status(400).json({
                    success: false,
                    error: 'Code and language are required'
                });
            }

            const result = code_snippet_service.format_code(code, language);
            
            res.json({
                success: true,
                data: result
            });
        } catch(error) 
        {
            error_handler.handleError(res, error);
        }
    }

    static async code_validation(req, res) 
    {
        try 
        {
            const { code, language } = req.body;

            if(!code || !language) 
                {
                return res.status(400).json({
                    success: false,
                    error: 'Code and language are required'
                });
            }

            const result = code_snippet_service.validate_code(code, language);
            
            res.json({
                success: true,
                data: result
            });
        } catch(error) 
        {
            error_handler.handleError(res, error);
        }
    }
}

export default code_execution_controller;

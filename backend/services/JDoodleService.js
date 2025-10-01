class JDoodle_service 
{
    static CLIENT_ID = 'e87ed506b56fb68fa28865d4b97485cb';
    static CLIENT_SECRET = 'ea18798506b3118bd814c98603c82638c7b344387e59779456814ff89b3f8bd9';
    static API_URL = 'https://api.jdoodle.com/v1/execute';
    static CREDIT_URL = 'https://api.jdoodle.com/v1/credit-spent';

    static language_v = {
        'nodejs': '4',
        'python3': '4',
        'java': '4',
        'cpp17': '1',
        'c': '5',
        'csharp': '4',
        'php': '4',
        'go': '4',
        'rust': '4',
        'kotlin': '4',
        'swift': '4'
    };

    static async execute_code(code, language, options = {}) 
    {
        const { timeout = 10, memoryLimit = 128000, stdin = '' } = options;
        
        try 
        {
            const start_time = Date.now();
            
            const request_body = {
                clientId: this.CLIENT_ID,
                clientSecret: this.CLIENT_SECRET,
                script: code,
                language: language,
                versionIndex: this.language_v[language] || '0',
                stdin: stdin
            };

            console.log(`Executing ${language} code via JDoodle...`);
            console.log('Request body:', JSON.stringify(request_body, null, 2));
            
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: 
                {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request_body)
            });

            if(!response.ok) 
                {
                const error_txt = await response.text();
                console.error('JDoodle API Error Response:', error_txt);
                throw new Error(`JDoodle API responded with status: ${response.status} - ${error_txt}`);
            }

            const result = await response.json();
            console.log('JDoodle API Response:', JSON.stringify(result, null, 2));
            const executionTime = Date.now() - start_time;

            if(result.error) 
                {
                return {
                    success: false,
                    result: null,
                    output: result.output || '',
                    error: result.error,
                    executionTime: executionTime,
                    memoryUsed: parseInt(result.memory) || 0,
                    cpuTime: parseFloat(result.cpuTime) || 0,
                    statusCode: result.statusCode || 1
                };
            }

            const is_success = result.statusCode === 200 && result.isExecutionSuccess;

            return {
                success: is_success,
                result: result.output || '',
                output: result.output || '',
                error: !is_success ? (result.output || 'Unknown error') : null,
                executionTime: executionTime,
                memoryUsed: parseInt(result.memory) || 0,
                cpuTime: parseFloat(result.cpuTime) || 0,
                statusCode: result.statusCode || 0
            };

        } catch(error) 
        {
            console.error('❌ JDoodle execution failed:', error.message);
            return {
                success: false,
                result: null,
                output: '',
                error: `JDoodle service error: ${error.message}`,
                executionTime: 0,
                memoryUsed: 0,
                cpuTime: 0,
                statusCode: -1
            };
        }
    }

    static async check_credits() 
    {
        try 
        {
            const response = await fetch(this.CREDIT_URL, {
                method: 'POST',
                headers: 
                {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    clientId: this.CLIENT_ID,
                    clientSecret: this.CLIENT_SECRET
                })
            });

            if(!response.ok) throw new Error(`Failed to check credits: ${response.status}`);

            const result = await response.json();
            return {
                success: true,
                used: result.used || 0,
                total: 200 // 200 credits per day for free plan
            };
        } catch(error) 
        {
            console.error('❌ Failed to check JDoodle credits:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static get_supported_langs() 
    {
        return Object.keys(this.language_v);
    }

    static is_lang_supported(language) 
    {
        return this.language_v.hasOwnProperty(language);
    }

    static get_lang_v(language) 
    {
        return this.language_v[language] || 'Unknown';
    }

    static get_service_info() 
    {
        return {
            name: 'JDoodle',
            url: 'https://www.jdoodle.com/',
            dailyLimit: 200,
            supportedLanguages: this.get_supported_langs(),
            features: [
                'Multiple programming languages',
                'Real-time code execution',
                'Memory and CPU time monitoring',
                'Standard input support',
                'Error handling and debugging'
            ]
        };
    }

    static async test_connection() 
    {
        try 
        {
            const test_code = 'console.log("Hello from JDoodle!");';
            const result = await this.execute_code(test_code, 'nodejs');
            
            return {
                success: result.success,
                message: result.success ? 'JDoodle connection successful' : 'JDoodle connection failed',
                output: result.output,
                error: result.error
            };
        } catch(error) 
        {
            return {
                success: false,
                message: 'JDoodle connection test failed',
                error: error.message
            };
        }
    }
}

export default JDoodle_service;

import { Router } from 'express';
import code_execution_controller from '../controllers/codeExecutionController.js';
import auth_middleware from '../middleware/auth.js';
import RateLimit from '../middleware/rateLimit.js';

const router = Router();

const code_execution_limiter = new RateLimit().limit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 50,
    message: 'Too many code execution requests. Please try again later.'
});

const general_limiter = new RateLimit().limit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: 'Too many requests. Please try again later.'
});

router.post('/execute', auth_middleware.require_auth, code_execution_limiter, code_execution_controller.execute_code);

router.get('/languages', general_limiter, code_execution_controller.get_supported_langs);

router.get('/languages/:language/services', general_limiter, code_execution_controller.get_available_services);

router.get('/services/status', auth_middleware.require_auth, general_limiter, code_execution_controller.get_services_status);

router.post('/services/:service/test', auth_middleware.require_auth, general_limiter, code_execution_controller.test_service);

router.post('/highlight', general_limiter, code_execution_controller.syntax_highlight);

router.post('/format', general_limiter, code_execution_controller.code_formatting);

router.post('/validate', general_limiter, code_execution_controller.code_validation);

export default router;

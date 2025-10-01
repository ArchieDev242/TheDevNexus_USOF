import { Router } from 'express';
import code_execution_controller from '../controllers/codeExecutionController.js';
import auth_middleware from '../middleware/auth.js';
import RateLimit from '../middleware/rateLimit.js';

const router = Router();

// Rate limiting для виконання коду (більш строгий)
const codeExecutionLimiter = new RateLimit().limit({
    windowMs: 15 * 60 * 1000, // 15 хвилин
    maxRequests: 50, // максимум 50 виконань на 15 хвилин
    message: 'Too many code execution requests. Please try again later.'
});

// Rate limiting для інших операцій
const generalLimiter = new RateLimit().limit({
    windowMs: 15 * 60 * 1000, // 15 хвилин
    maxRequests: 100, // максимум 100 запитів на 15 хвилин
    message: 'Too many requests. Please try again later.'
});

// Виконання коду (потребує аутентифікації та rate limiting)
router.post('/execute', auth_middleware.require_auth, codeExecutionLimiter, code_execution_controller.execute_code);

// Отримання підтримуваних мов
router.get('/languages', generalLimiter, code_execution_controller.get_supported_langs);

// Отримання доступних сервісів для мови
router.get('/languages/:language/services', generalLimiter, code_execution_controller.get_available_services);

// Перевірка статусу сервісів
router.get('/services/status', auth_middleware.require_auth, generalLimiter, code_execution_controller.get_services_status);

// Тестування конкретного сервісу
router.post('/services/:service/test', auth_middleware.require_auth, generalLimiter, code_execution_controller.test_service);

// Підсвічування синтаксису
router.post('/highlight', generalLimiter, code_execution_controller.syntax_highlight);

// Форматування коду
router.post('/format', generalLimiter, code_execution_controller.code_formatting);

// Валідація коду
router.post('/validate', generalLimiter, code_execution_controller.code_validation);

export default router;

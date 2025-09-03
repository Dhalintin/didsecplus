import { Router } from 'express';
import { generate2FA, verify2FA, enable2FA, disable2FA } from '../controllers/twoFactorAuth';
import { authMiddleware } from '../../../middlewares/authMiddleware';

const twofaRoutes= Router();

twofaRoutes.get('/generate', authMiddleware, generate2FA);
twofaRoutes.post('/verify', authMiddleware, verify2FA);
twofaRoutes.post('/enable', authMiddleware, enable2FA);
twofaRoutes.post('/disable', authMiddleware, disable2FA);

export default twofaRoutes; 
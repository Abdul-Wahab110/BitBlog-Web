import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/send-registration-otp', AuthController.sendRegistrationOtp);
router.post('/verify-registration-otp', AuthController.verifyRegistrationOtp);
router.post('/resend-registration-otp', AuthController.resendRegistrationOtp);
router.post('/login', AuthController.login);
router.post('/firebase-sync', AuthController.firebaseSync);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/change-password', authenticate, AuthController.changePassword);

export default router;

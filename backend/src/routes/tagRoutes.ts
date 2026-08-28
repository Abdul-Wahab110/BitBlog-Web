import { Router } from 'express';
import { TagController } from '../controllers/apiControllers';

const router = Router();

router.get('/', TagController.getTags);

export default router;

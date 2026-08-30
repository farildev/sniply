import { Router } from 'express';
import { urlController } from '../controllers/url.controller';

const router = Router();

router.post('/shorten', urlController.shorten);

export default router;

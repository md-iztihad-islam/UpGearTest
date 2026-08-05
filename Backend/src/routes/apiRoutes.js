import express from 'express';
import v2Routes from './version02/v2Routes.js';

const router = express.Router();

router.use('/v2', v2Routes);

export default router;
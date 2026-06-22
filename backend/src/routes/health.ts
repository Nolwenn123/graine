import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/health — vérifie que l'API répond
router.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

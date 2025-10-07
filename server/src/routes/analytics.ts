import { Router } from 'express';

const router = Router();

router.get('/trends', (req, res) => {
  // Stub: return trend data
  return res.json({ monthly: [] });
});

export default router;



import { Router } from 'express';

const router = Router();

router.get('/summary', (req, res) => {
  // Stub: compute summary
  return res.json({ totalIncome: 0, totalExpense: 0, balance: 0 });
});

export default router;



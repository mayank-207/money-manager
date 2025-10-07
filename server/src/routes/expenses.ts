import { Router } from 'express';

const router = Router();
const expenses: any[] = [];

router.get('/', (req, res) => {
  return res.json(expenses);
});

router.post('/', (req, res) => {
  const e = { id: `${Date.now()}`, ...req.body };
  expenses.push(e);
  return res.status(201).json(e);
});

export default router;



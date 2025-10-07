import { Router } from 'express';

const router = Router();
const groups: any[] = [];

router.get('/', (req, res) => {
  return res.json(groups);
});

router.post('/', (req, res) => {
  const g = { id: `${Date.now()}`, memberIds: [], ...req.body };
  groups.push(g);
  return res.status(201).json(g);
});

export default router;



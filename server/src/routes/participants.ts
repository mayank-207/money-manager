import { Router } from 'express';

const router = Router();
const participants: any[] = [];

router.get('/', (req, res) => {
  return res.json(participants);
});

router.post('/', (req, res) => {
  const p = { id: `${Date.now()}`, ...req.body };
  participants.push(p);
  return res.status(201).json(p);
});

export default router;



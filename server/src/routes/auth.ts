import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  // Stub: validate credentials and issue token
  return res.json({ token: 'dev-token', user: { id: 'u1', email: req.body.email } });
});

router.post('/register', (req, res) => {
  // Stub: create user
  return res.status(201).json({ id: 'u1', email: req.body.email });
});

export default router;



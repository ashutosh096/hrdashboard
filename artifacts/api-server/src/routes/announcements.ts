import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

let announcementsList: any[] = [];

router.get('/', (req, res) => {
  res.json(announcementsList);
});

router.post('/', (req, res) => {
  const { title, content, priority, isPinned } = req.body;
  const newAnn = {
    id: `ann-${Date.now()}`,
    title,
    content,
    priority: priority || 'NORMAL',
    isPinned: !!isPinned,
    createdAt: new Date().toISOString(),
  };
  announcementsList.unshift(newAnn);
  res.status(201).json(newAnn);
});

export default router;

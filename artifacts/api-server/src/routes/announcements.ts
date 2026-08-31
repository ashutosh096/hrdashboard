import { Router } from 'express';

const router = Router();

let announcementsList = [
  { id: 'ann-1', title: 'Q3 All-Hands & Entity Performance Review', content: 'Join us this Thursday at 4 PM for the combined EHM and CliAgro quarterly review.', priority: 'URGENT', isPinned: true, createdAt: '2026-08-29' },
  { id: 'ann-2', title: 'Updated Google Calendar & Meet Sync Guide', content: 'All employees are requested to connect Google OAuth on first login to sync meeting links.', priority: 'IMPORTANT', isPinned: true, createdAt: '2026-08-30' },
];

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
    createdAt: new Date().toISOString().split('T')[0],
  };
  announcementsList.unshift(newAnn);
  res.status(201).json(newAnn);
});

export default router;

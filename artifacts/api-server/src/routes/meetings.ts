import { Router } from 'express';

const router = Router();

let meetingsList = [
  {
    id: 'm-1',
    title: 'Team Standup & Sprint Sync',
    description: 'Daily operational check-in across EHM and CliAgro core leads.',
    startTime: new Date(Date.now() + 15 * 60000).toISOString(),
    endTime: new Date(Date.now() + 45 * 60000).toISOString(),
    location: 'Zoom / Google Meet',
    googleMeetUrl: 'https://meet.google.com/hros-standup-2026',
    organizerName: 'Sanjay Kapoor',
    inviteeAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    ],
    status: 'Starting Soon',
  },
  {
    id: 'm-2',
    title: 'Design Review & Architecture Audit',
    description: 'Reviewing brand refresh graphics and CliAgro IoT Gateway schema.',
    startTime: new Date(Date.now() + 180 * 60000).toISOString(),
    endTime: new Date(Date.now() + 225 * 60000).toISOString(),
    location: 'Google Meet',
    googleMeetUrl: 'https://meet.google.com/hros-design-rev',
    organizerName: 'Priya Sharma',
    inviteeAvatars: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    ],
    status: 'Upcoming',
  },
];

router.get('/', (req, res) => {
  res.json(meetingsList);
});

router.post('/', (req, res) => {
  const { title, description, startTime, endTime } = req.body;
  const newMeeting = {
    id: `m-${Date.now()}`,
    title: title || 'New Meeting',
    description: description || '',
    startTime: startTime || new Date().toISOString(),
    endTime: endTime || new Date(Date.now() + 30 * 60000).toISOString(),
    location: 'Google Meet',
    googleMeetUrl: `https://meet.google.com/hros-${Math.floor(1000 + Math.random() * 9000)}`,
    organizerName: 'You',
    inviteeAvatars: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'],
    status: 'Scheduled',
  };
  meetingsList.unshift(newMeeting);
  res.status(201).json(newMeeting);
});

router.get('/sync', (req, res) => {
  console.log('[CALENDAR SYNC] Executing Google Calendar two-way sync...');
  res.json({ message: 'Google Calendar sync completed successfully.', syncedEvents: 2 });
});

export default router;

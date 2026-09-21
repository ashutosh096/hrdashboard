import { Router, Request, Response } from 'express';
import { db, meetings, meetingAttendees, employees, users, eq, ne, and, gte, lte, inArray } from '@workspace/db';
import { refreshAccessToken } from './auth.js';
import { requireAuth } from '../middleware/auth.js';
import { pullGoogleCalendarEvents } from '../services/calendar-sync.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  try {
    const isEmployee = (req as any).user?.role === 'EMPLOYEE';
    const userId = (req as any).user?.id;
    const empId = (req as any).user?.employeeId;
    const userEmail = ((req as any).user?.email || '').toLowerCase();

    const allMeetings = await db.select().from(meetings).where(ne(meetings.status, 'CANCELLED'));

    if (!isEmployee) {
      return res.json(allMeetings);
    }

    const userAttendeeRecords = await db
      .select({ meetingId: meetingAttendees.meetingId })
      .from(meetingAttendees)
      .where(
        empId ? eq(meetingAttendees.employeeId, empId) : eq(meetingAttendees.employeeId, userId!)
      );
    const attendedMeetingIds = new Set(userAttendeeRecords.map(a => a.meetingId));

    const scopedMeetings = allMeetings.filter(m => {
      const isOrganizer = (userId && m.organizerId === userId) || (empId && m.organizerId === empId);
      const isAttendeeInTable = attendedMeetingIds.has(m.id);
      
      const inviteesArr = Array.isArray(m.invitees) ? (m.invitees as string[]) : [];
      const isInvited = (
        (userId && inviteesArr.includes(userId)) ||
        (empId && inviteesArr.includes(empId)) ||
        (userEmail && inviteesArr.some(inv => typeof inv === 'string' && inv.toLowerCase() === userEmail))
      );

      return isOrganizer || isAttendeeInTable || isInvited;
    });

    res.json(scopedMeetings);
  } catch (err) {
    console.error('[MEETINGS GET ROUTE ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
});

// GET /api/meetings/availability
router.get('/availability', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const fromQuery = req.query.from ? new Date(req.query.from as string) : now;
    const toQuery = req.query.to ? new Date(req.query.to as string) : new Date(Date.now() + 7 * 86400000);

    const allEmps = await db.select().from(employees);
    const activeMeetings = await db
      .select()
      .from(meetings)
      .where(
        and(
          ne(meetings.status, 'CANCELLED'),
          gte(meetings.endTime, fromQuery),
          lte(meetings.startTime, toQuery)
        )
      );

    const result = allEmps.map(emp => {
      const empMeetings = activeMeetings.filter(m => {
        const isOrganizer = m.organizerId === emp.id;
        const isInvited = Array.isArray(m.invitees) && (m.invitees as string[]).includes(emp.id);
        return isOrganizer || isInvited;
      });

      const busy = empMeetings.map(m => ({
        meetingId: m.id,
        meetingTitle: m.title,
        start: m.startTime,
        end: m.endTime,
      }));

      const isBusyRightNow = busy.some(b => now >= new Date(b.start) && now <= new Date(b.end));

      return {
        employeeId: emp.id,
        name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email,
        email: emp.email,
        designation: emp.designation,
        isBusyRightNow,
        busy,
      };
    });

    res.json(result);
  } catch (err: any) {
    console.error('[AVAILABILITY FETCH ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch team availability' });
  }
});

// GET /api/meetings/sync
router.get('/sync', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const accessToken = await refreshAccessToken(userId);
    if (!accessToken) {
      return res.status(400).json({
        message: 'Google Calendar is not connected to your account. Please click "Connect Google Calendar" to grant calendar permissions.',
        connected: false,
        needsOAuth: true,
      });
    }

    const syncResult = await pullGoogleCalendarEvents(userId);
    res.json({
      message: 'Google Calendar sync completed successfully.',
      connected: true,
      ...syncResult,
    });
  } catch (err: any) {
    console.error('[SYNC ENDPOINT ERROR]:', err);
    res.status(500).json({ message: 'Calendar sync failed' });
  }
});

// POST /api/meetings - Create meeting and add attendees to Google event
router.post('/', async (req: Request, res: Response) => {
  const { title, description, startTime, endTime, location, organizerId, invitees, source } = req.body;
  const callerUser = (req as any).user;
  const callerRole = (callerUser?.role || '').toUpperCase();

  try {
    // Prevent organizer spoofing: Non-admins are locked to their own employeeId or userId
    let resolvedOrganizerId = callerUser?.employeeId || callerUser?.id;
    if (callerRole === 'ADMIN' && organizerId) {
      resolvedOrganizerId = organizerId;
    }

    let organizerUserId = callerUser?.id || null;
    if (resolvedOrganizerId && resolvedOrganizerId !== callerUser?.employeeId) {
      const [organizerUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.employeeId, resolvedOrganizerId));
      if (organizerUser) organizerUserId = organizerUser.id;
    }

    const inviteeList = Array.isArray(invitees) ? invitees : [];
    
    // Resolve email addresses for all invitees for Google Calendar attendee sync
    const attendeeEmails: string[] = [];
    if (inviteeList.length > 0) {
      const matchedEmps = await db
        .select({ email: employees.email })
        .from(employees)
        .where(inArray(employees.id, inviteeList));
      matchedEmps.forEach(e => {
        if (e.email) attendeeEmails.push(e.email.toLowerCase().trim());
      });
    }

    const meetingSource = (source === 'GOOGLE_CALENDAR' || source === 'GOOGLE_CALENDAR_IMPORTED') ? source : 'INTERNAL';
    let googleEventId: string | null = null;
    let googleMeetUrl: string | null = null;

    if (meetingSource === 'GOOGLE_CALENDAR') {
      const accessToken = organizerUserId ? await refreshAccessToken(organizerUserId) : null;

      if (!accessToken) {
        return res.status(400).json({
          message: 'Google Calendar is not connected to your account. Please click "Connect Google Calendar" to connect Google first.',
          needsOAuth: true,
        });
      }

      try {
        const startISO = startTime ? new Date(startTime).toISOString() : new Date().toISOString();
        const endISO = endTime ? new Date(endTime).toISOString() : new Date(Date.now() + 30 * 60000).toISOString();
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

        const googleAttendees = attendeeEmails.map(email => ({ email }));

        const calRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: title || 'HROS Meeting',
            description: description || '',
            start: { dateTime: startISO, timeZone: userTimeZone },
            end: { dateTime: endISO, timeZone: userTimeZone },
            attendees: googleAttendees,
            conferenceData: {
              createRequest: {
                requestId: `meet-${Date.now()}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' },
              },
            },
          }),
        });

        const calData = await calRes.json();
        if (calRes.ok) {
          googleEventId = calData.id || null;
          googleMeetUrl = calData.hangoutLink || calData.htmlLink || null;
        } else {
          console.error('[GOOGLE CALENDAR API ERROR]:', calData);
          return res.status(400).json({
            message: `Google Calendar API Error: ${calData.error?.message || 'Failed to create event'}`,
          });
        }
      } catch (calErr: any) {
        console.error('[GOOGLE CALENDAR API FETCH EXCEPTION]:', calErr);
        return res.status(500).json({ message: 'Failed to communicate with Google Calendar API' });
      }
    }

    const start = startTime ? new Date(startTime) : new Date();
    const end = endTime ? new Date(endTime) : new Date(Date.now() + 30 * 60000);

    const [newMeeting] = await db
      .insert(meetings)
      .values({
        title: title || 'New Meeting',
        description: description || '',
        startTime: start,
        endTime: end,
        location: location || 'Google Meet',
        googleMeetUrl,
        googleEventId,
        organizerId: resolvedOrganizerId,
        invitees: inviteeList,
        source: meetingSource,
        status: 'SCHEDULED',
      })
      .returning();

    if (inviteeList.length > 0) {
      const attendeeRows = inviteeList.map((empId: string) => ({
        meetingId: newMeeting.id,
        employeeId: empId,
        responseStatus: 'PENDING' as const,
      }));
      await db.insert(meetingAttendees).values(attendeeRows);
    }

    res.status(201).json(newMeeting);
  } catch (err: any) {
    console.error('[MEETING CREATION ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to create meeting' });
  }
});

export default router;

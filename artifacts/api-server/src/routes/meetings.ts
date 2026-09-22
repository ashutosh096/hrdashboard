import { Router, Request, Response } from 'express';
import { db, meetings, meetingAttendees, employees, users, eq, ne, and, gte, lte, inArray } from '@workspace/db';
import { refreshAccessToken } from './auth.js';
import { requireAuth } from '../middleware/auth.js';
import { pullGoogleCalendarEvents } from '../services/calendar-sync.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const empId = (req as any).user?.employeeId;
    const userEmail = ((req as any).user?.email || '').toLowerCase();

    const allMeetings = await db.select().from(meetings).where(ne(meetings.status, 'CANCELLED'));

    const userAttendeeRecords = await db
      .select({ meetingId: meetingAttendees.meetingId })
      .from(meetingAttendees)
      .where(
        empId ? eq(meetingAttendees.employeeId, empId) : eq(meetingAttendees.employeeId, userId!)
      );
    const attendedMeetingIds = new Set(userAttendeeRecords.map((a) => a.meetingId));

    // Scoped strictly to the logged-in user:
    // 1) Meetings they organized (organizerId matches userId or employeeId)
    // 2) Meetings where they are recorded as attendee in meeting_attendees
    // 3) Meetings where they are invited in invitees list by userId, employeeId, or email
    const scopedMeetings = allMeetings.filter((m) => {
      const isOrganizer = (userId && m.organizerId === userId) || (empId && m.organizerId === empId);
      const isAttendeeInTable = attendedMeetingIds.has(m.id);

      const inviteesArr = Array.isArray(m.invitees) ? (m.invitees as any[]) : [];
      const isInvited = inviteesArr.some((inv) => {
        if (!inv) return false;
        if (typeof inv === 'string') {
          const lower = inv.toLowerCase().trim();
          return (
            (userId && lower === userId.toLowerCase()) ||
            (empId && lower === empId.toLowerCase()) ||
            (userEmail && lower === userEmail)
          );
        }
        if (typeof inv === 'object') {
          return (
            (inv.id && (inv.id === userId || inv.id === empId)) ||
            (inv.email && userEmail && inv.email.toLowerCase() === userEmail)
          );
        }
        return false;
      });

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
    // Default to start of 7 days ago to 14 days in future so all today's past and upcoming meetings are included
    const defaultFrom = new Date(Date.now() - 7 * 86400000);
    defaultFrom.setHours(0, 0, 0, 0);
    const defaultTo = new Date(Date.now() + 14 * 86400000);

    const fromQuery = req.query.from ? new Date(req.query.from as string) : defaultFrom;
    const toQuery = req.query.to ? new Date(req.query.to as string) : defaultTo;

    const currentUserId = (req as any).user?.id;
    const currentEmpId = (req as any).user?.employeeId;
    const currentUserEmail = ((req as any).user?.email || '').toLowerCase();

    const allEmps = await db.select().from(employees);
    const allUsers = await db.select().from(users);

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

    const result = allEmps.map((emp) => {
      const empEmail = (emp.email || '').toLowerCase();
      const linkedUser = allUsers.find((u) => (u.email && u.email.toLowerCase() === empEmail) || (emp.id && u.employeeId === emp.id));
      const empUserId = linkedUser?.id;

      const isSelf =
        (currentEmpId && emp.id === currentEmpId) ||
        (currentUserEmail && empEmail === currentUserEmail) ||
        (currentUserId && empUserId === currentUserId);

      const empMeetings = activeMeetings.filter((m) => {
        const isOrganizer =
          m.organizerId === emp.id ||
          (empUserId && m.organizerId === empUserId);

        const inviteesArr = Array.isArray(m.invitees) ? (m.invitees as any[]) : [];
        const isInvited = inviteesArr.some((inv) => {
          if (!inv) return false;
          if (typeof inv === 'string') {
            const lower = inv.toLowerCase().trim();
            return (
              lower === emp.id.toLowerCase() ||
              (empEmail && lower === empEmail) ||
              (empUserId && lower === empUserId.toLowerCase())
            );
          }
          if (typeof inv === 'object') {
            return (
              (inv.id && (inv.id === emp.id || (empUserId && inv.id === empUserId))) ||
              (inv.email && empEmail && inv.email.toLowerCase() === empEmail)
            );
          }
          return false;
        });

        return isOrganizer || isInvited;
      });

      // Sort meetings chronologically in ascending order (earliest/morning first, then noon, then evening)
      empMeetings.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      const busy = empMeetings.map((m, idx) => {
        const isViewerAttendee =
          isSelf ||
          (currentUserId && m.organizerId === currentUserId) ||
          (currentEmpId && m.organizerId === currentEmpId) ||
          (Array.isArray(m.invitees) &&
            m.invitees.some((inv: any) => {
              if (!inv) return false;
              if (typeof inv === 'string') {
                const lower = inv.toLowerCase().trim();
                return (
                  (currentEmpId && lower === currentEmpId.toLowerCase()) ||
                  (currentUserId && lower === currentUserId.toLowerCase()) ||
                  (currentUserEmail && lower === currentUserEmail)
                );
              }
              if (typeof inv === 'object') {
                return (
                  (inv.id && ((currentEmpId && inv.id === currentEmpId) || (currentUserId && inv.id === currentUserId))) ||
                  (inv.email && currentUserEmail && inv.email.toLowerCase() === currentUserEmail)
                );
              }
              return false;
            }));

        return {
          meetingId: m.id,
          // Privacy preservation: show generic "Meeting 1", "Meeting 2" in chronological order
          meetingTitle: isViewerAttendee ? m.title : `Meeting ${idx + 1}`,
          isPrivate: !isViewerAttendee,
          start: m.startTime,
          end: m.endTime,
        };
      });


      const isBusyRightNow = busy.some(
        (b) => now >= new Date(b.start) && now <= new Date(b.end)
      );

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
    // Prevent organizer spoofing and ensure valid employeeId foreign key
    let resolvedOrganizerId = callerUser?.employeeId;
    if (!resolvedOrganizerId && callerUser?.email) {
      const [emp] = await db
        .select({ id: employees.id })
        .from(employees)
        .where(eq(employees.email, callerUser.email.toLowerCase().trim()));
      if (emp) resolvedOrganizerId = emp.id;
    }

    if (callerRole === 'ADMIN' && organizerId) {
      resolvedOrganizerId = organizerId;
    }

    if (!resolvedOrganizerId) {
      const [firstEmp] = await db.select({ id: employees.id }).from(employees).limit(1);
      resolvedOrganizerId = firstEmp?.id;
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

// PATCH /api/meetings/:id - Update meeting details / MoM (Minutes of Meeting) / description
router.patch('/:id', async (req: Request, res: Response) => {
  const meetingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { title, description, startTime, endTime, location } = req.body;

  try {
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (location !== undefined) updateData.location = location;

    const [updated] = await db
      .update(meetings)
      .set(updateData)
      .where(eq(meetings.id, meetingId!))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json(updated);
  } catch (err: any) {
    console.error('[MEETING UPDATE ERROR]:', err);
    res.status(500).json({ message: 'Failed to update meeting details' });
  }
});

// DELETE /api/meetings/:id - Cancel meeting
router.delete('/:id', async (req: Request, res: Response) => {
  const meetingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const [cancelled] = await db
      .update(meetings)
      .set({ status: 'CANCELLED' })
      .where(eq(meetings.id, meetingId!))
      .returning();

    if (!cancelled) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json({ message: 'Meeting cancelled successfully', meeting: cancelled });
  } catch (err: any) {
    console.error('[MEETING DELETE ERROR]:', err);
    res.status(500).json({ message: 'Failed to cancel meeting' });
  }
});

export default router;

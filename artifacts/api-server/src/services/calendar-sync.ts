import { db, meetings, users, employees, googleTokens, eq, and, gte, lte } from '@workspace/db';
import { refreshAccessToken } from '../routes/auth.js';

export async function pullGoogleCalendarEvents(userId: string): Promise<{ created: number; updated: number; cancelled: number }> {
  let created = 0;
  let updated = 0;
  let cancelled = 0;

  try {
    const accessToken = await refreshAccessToken(userId);
    if (!accessToken) {
      console.log(`[CALENDAR SYNC NOTICE] No active Google Calendar token for user ${userId}`);
      return { created, updated, cancelled };
    }

    const [userRow] = await db.select().from(users).where(eq(users.id, userId));
    const userEmail = (userRow?.email || '').toLowerCase();
    let organizerEmployeeId = userRow?.employeeId;

    if (!organizerEmployeeId && userEmail) {
      const [matchedEmp] = await db.select().from(employees).where(eq(employees.email, userEmail));
      if (matchedEmp) organizerEmployeeId = matchedEmp.id;
    }

    if (!organizerEmployeeId) {
      console.error(`[CALENDAR SYNC ERROR] No employee record found to associate meetings for user ${userId} (${userEmail}). Skipping calendar sync.`);
      return { created, updated, cancelled };
    }

    // Query 30 days past to 60 days future to capture all past & upcoming events
    const past30Days = new Date(Date.now() - 30 * 86400000);
    const future60Days = new Date(Date.now() + 60 * 86400000);

    const fetchedGoogleEventIds = new Set<string>();

    // 1. Sync ONLY the user's PRIMARY calendar
    try {
      const googleUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${encodeURIComponent(past30Days.toISOString())}` +
        `&timeMax=${encodeURIComponent(future60Days.toISOString())}` +
        `&singleEvents=true`;

      const res = await fetch(googleUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        console.warn(`[CALENDAR SYNC] Failed to fetch primary calendar for user ${userId}: HTTP ${res.status}`);
        return { created, updated, cancelled };
      }

      const data = await res.json();
      const items: any[] = data.items || [];

      for (const event of items) {
        if (!event.id || event.status === 'cancelled') continue;

        // 2. Filter out personal blocks: a meeting requires >= 2 attendees AND at least one other participant besides the syncing user
        const rawAttendees: any[] = Array.isArray(event.attendees) ? event.attendees : [];
        const otherAttendees = rawAttendees.filter((a: any) => {
          const email = (a.email || '').toLowerCase().trim();
          return email && email !== userEmail && !a.self;
        });

        if (rawAttendees.length < 2 || otherAttendees.length === 0) {
          // Skip personal blocks (e.g., "School Time", "Office", focus time, single-person appointments)
          continue;
        }

        fetchedGoogleEventIds.add(event.id);
        const title = event.summary || '(No title)';
        const description = event.description || '';
        const startStr = event.start?.dateTime || event.start?.date;
        const endStr = event.end?.dateTime || event.end?.date;

        if (!startStr || !endStr) continue;

        let startTime: Date;
        let endTime: Date;

        if (event.start?.date && !event.start?.dateTime) {
          // All-day event in Indian Standard Time (Asia/Kolkata)
          startTime = new Date(`${event.start.date}T00:00:00+05:30`);
          const endDateStr = event.end?.date || event.start.date;
          endTime = new Date(`${endDateStr}T23:59:59+05:30`);
        } else {
          startTime = new Date(startStr);
          endTime = new Date(endStr);
        }

        if (endTime.getTime() <= startTime.getTime()) {
          endTime = new Date(startTime.getTime() + 30 * 60000);
        }

        const googleMeetUrl = event.hangoutLink || event.htmlLink || null;

        // Extract all attendees from Google Calendar event
        const attendeesList: string[] = Array.isArray(event.attendees)
          ? event.attendees.map((a: any) => a.email || a.displayName || a.id).filter(Boolean)
          : [];

        // Always ensure syncing user is in invitees so event is strictly visible to them
        if (userEmail && !attendeesList.some((a) => a.toLowerCase() === userEmail)) {
          attendeesList.push(userEmail);
        }
        if (userRow?.id && !attendeesList.includes(userRow.id)) {
          attendeesList.push(userRow.id);
        }
        if (organizerEmployeeId && !attendeesList.includes(organizerEmployeeId)) {
          attendeesList.push(organizerEmployeeId);
        }

        const [existingMeeting] = await db
          .select()
          .from(meetings)
          .where(eq(meetings.googleEventId, event.id));

        if (existingMeeting) {
          const existingInvitees: string[] = Array.isArray(existingMeeting.invitees) ? (existingMeeting.invitees as string[]) : [];
          const mergedInvitees = Array.from(new Set([...existingInvitees, ...attendeesList]));
          const inviteesChanged =
            mergedInvitees.length !== existingInvitees.length ||
            !mergedInvitees.every((x) => existingInvitees.includes(x));

          const hasChanged =
            existingMeeting.title !== title ||
            existingMeeting.description !== description ||
            new Date(existingMeeting.startTime).getTime() !== startTime.getTime() ||
            new Date(existingMeeting.endTime).getTime() !== endTime.getTime() ||
            existingMeeting.status !== 'SCHEDULED' ||
            inviteesChanged ||
            (googleMeetUrl && existingMeeting.googleMeetUrl !== googleMeetUrl);

          if (hasChanged) {
            await db
              .update(meetings)
              .set({
                title,
                description,
                startTime,
                endTime,
                invitees: mergedInvitees,
                googleMeetUrl: googleMeetUrl || existingMeeting.googleMeetUrl,
                status: 'SCHEDULED',
              })
              .where(eq(meetings.id, existingMeeting.id));
            updated++;
          }
        } else {
          await db.insert(meetings).values({
            title,
            description,
            startTime,
            endTime,
            location: 'Google Meet',
            googleMeetUrl,
            organizerId: organizerEmployeeId,
            invitees: attendeesList,
            googleEventId: event.id,
            source: 'GOOGLE_CALENDAR_IMPORTED',
            status: 'SCHEDULED',
          });
          created++;
        }
      }
    } catch (calErr) {
      console.error(`[CALENDAR EVENT FETCH ERROR] Failed for primary calendar:`, calErr);
    }


    // Mark missing previously-synced events as CANCELLED within query window
    const syncedMeetings = await db
      .select()
      .from(meetings)
      .where(
        and(
          eq(meetings.organizerId, organizerEmployeeId),
          gte(meetings.startTime, past30Days),
          lte(meetings.startTime, future60Days)
        )
      );

    for (const m of syncedMeetings) {
      if (m.googleEventId && !fetchedGoogleEventIds.has(m.googleEventId) && m.status !== 'CANCELLED') {
        await db.update(meetings).set({ status: 'CANCELLED' }).where(eq(meetings.id, m.id));
        cancelled++;
      }
    }

    console.log(`[CALENDAR SYNC SUCCESS] User ${userId}: ${created} created, ${updated} updated, ${cancelled} cancelled.`);
  } catch (err) {
    console.error(`[CALENDAR SYNC EXCEPTION] Sync failed for user ${userId}:`, err);
  }

  return { created, updated, cancelled };
}

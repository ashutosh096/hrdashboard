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
    let organizerEmployeeId = userRow?.employeeId;

    if (!organizerEmployeeId) {
      const [firstEmp] = await db.select().from(employees).limit(1);
      organizerEmployeeId = firstEmp?.id;
    }

    if (!organizerEmployeeId) {
      console.error(`[CALENDAR SYNC ERROR] No employee record found to associate meetings for user ${userId}`);
      return { created, updated, cancelled };
    }

    // Query 30 days past to 60 days future to capture all past & upcoming events
    const past30Days = new Date(Date.now() - 30 * 86400000);
    const future60Days = new Date(Date.now() + 60 * 86400000);

    // 1. Fetch all user calendars (Primary + Secondary calendars like 'ehm testing')
    let calendarIds = ['primary'];
    try {
      const calListRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (calListRes.ok) {
        const calListData = await calListRes.json();
        if (Array.isArray(calListData.items) && calListData.items.length > 0) {
          calendarIds = calListData.items.map((item: any) => item.id).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn('[CALENDAR LIST FETCH WARNING] Falling back to primary calendar:', e);
    }

    const fetchedGoogleEventIds = new Set<string>();

    // 2. Fetch events from all user calendars
    for (const calId of calendarIds) {
      try {
        const googleUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?` +
          `timeMin=${encodeURIComponent(past30Days.toISOString())}` +
          `&timeMax=${encodeURIComponent(future60Days.toISOString())}` +
          `&singleEvents=true`;

        const res = await fetch(googleUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) continue;

        const data = await res.json();
        const items: any[] = data.items || [];

        for (const event of items) {
          if (!event.id || event.status === 'cancelled') continue;

          fetchedGoogleEventIds.add(event.id);
          const title = event.summary || '(No title)';
          const description = event.description || '';
          const startStr = event.start?.dateTime || event.start?.date;
          const endStr = event.end?.dateTime || event.end?.date;

          if (!startStr || !endStr) continue;

          const startTime = new Date(startStr);
          const endTime = new Date(endStr);
          const googleMeetUrl = event.hangoutLink || event.htmlLink || null;

          const [existingMeeting] = await db
            .select()
            .from(meetings)
            .where(eq(meetings.googleEventId, event.id));

          if (existingMeeting) {
            const hasChanged =
              existingMeeting.title !== title ||
              existingMeeting.description !== description ||
              new Date(existingMeeting.startTime).getTime() !== startTime.getTime() ||
              new Date(existingMeeting.endTime).getTime() !== endTime.getTime() ||
              existingMeeting.status !== 'SCHEDULED' ||
              (googleMeetUrl && existingMeeting.googleMeetUrl !== googleMeetUrl);

            if (hasChanged) {
              await db
                .update(meetings)
                .set({
                  title,
                  description,
                  startTime,
                  endTime,
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
              googleEventId: event.id,
              source: 'GOOGLE_CALENDAR_IMPORTED',
              status: 'SCHEDULED',
            });
            created++;
          }
        }
      } catch (calErr) {
        console.error(`[CALENDAR EVENT FETCH ERROR] Failed for calendar ${calId}:`, calErr);
      }
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

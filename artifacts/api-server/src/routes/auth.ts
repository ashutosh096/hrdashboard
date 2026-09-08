import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, users, invites, googleTokens, eq } from '@workspace/db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hros_jwt_super_secret_key_2026';

// Refresh Access Token helper function for Google Calendar API calls
export async function refreshAccessToken(userId: string): Promise<string | null> {
  try {
    const [tokenRow] = await db
      .select()
      .from(googleTokens)
      .where(eq(googleTokens.userId, userId));

    if (!tokenRow) return null;

    // Return current access token if it hasn't expired yet (with 5 min buffer)
    const now = new Date(Date.now() + 5 * 60 * 1000);
    if (tokenRow.expiry && new Date(tokenRow.expiry) > now) {
      return tokenRow.accessToken;
    }

    if (!tokenRow.refreshToken) return tokenRow.accessToken;

    // Refresh access token via Google OAuth token endpoint
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: tokenRow.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[REFRESH TOKEN ERROR]:', data);
      return tokenRow.accessToken;
    }

    const newAccessToken = data.access_token;
    const newExpiry = new Date(Date.now() + (data.expires_in || 3600) * 1000);

    await db
      .update(googleTokens)
      .set({ accessToken: newAccessToken, expiry: newExpiry, updatedAt: new Date() })
      .where(eq(googleTokens.userId, userId));

    return newAccessToken;
  } catch (err) {
    console.error('[REFRESH ACCESS TOKEN ERROR]:', err);
    return null;
  }
}

// Secure Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId || undefined,
      managedTeamId: user.managedTeamId || undefined,
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, user: userPayload });
  } catch (err: any) {
    console.error('[AUTH ROUTE ERROR] Login failed:', err);
    const detail = err?.message || String(err);
    return res.status(500).json({ message: `Server login failed: ${detail}` });
  }
});

// Secure Set Password Route via Invite Token
router.post('/set-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password required' });
  }

  try {
    const [invite] = await db
      .select()
      .from(invites)
      .where(eq(invites.token, token));

    if (!invite) {
      return res.status(400).json({ message: 'Invalid or expired invite token' });
    }

    if (invite.status === 'ACCEPTED') {
      return res.status(400).json({ message: 'Invite token has already been accepted' });
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Invite token has expired' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const inviteEmail = invite.email.toLowerCase().trim();

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, inviteEmail));

    let userId: string;
    let userRole = invite.role || 'EMPLOYEE';
    let employeeId = invite.employeeId || undefined;

    if (existingUser) {
      userId = existingUser.id;
      userRole = existingUser.role || invite.role;
      await db
        .update(users)
        .set({
          passwordHash,
          status: 'ACTIVE',
          role: userRole,
          employeeId: employeeId || existingUser.employeeId,
        })
        .where(eq(users.id, existingUser.id));
    } else {
      const [newUser] = await db
        .insert(users)
        .values({
          email: inviteEmail,
          passwordHash,
          role: invite.role,
          status: 'ACTIVE',
          employeeId: invite.employeeId,
        })
        .returning();
      userId = newUser ? newUser.id : 'user-' + Date.now();
    }

    await db
      .update(invites)
      .set({ status: 'ACCEPTED' })
      .where(eq(invites.id, invite.id));

    const userPayload = {
      id: userId,
      email: inviteEmail,
      role: userRole,
      employeeId,
    };

    const authToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ message: 'Password set successfully', token: authToken, user: userPayload });
  } catch (err) {
    console.error('[SET-PASSWORD ERROR]:', err);
    return res.status(500).json({ message: 'Failed to set password' });
  }
});

// Google OAuth URL generation route
router.get('/google', async (req, res) => {
  let userId = (req.query.userId as string) || '';
  const inviteToken = (req.query.inviteToken as string) || '';

  if (!userId && inviteToken) {
    try {
      const [inviteRow] = await db
        .select()
        .from(invites)
        .where(eq(invites.token, inviteToken));

      if (inviteRow) {
        const inviteEmail = inviteRow.email.toLowerCase().trim();
        let [userRow] = await db
          .select({ id: users.id, role: users.role, employeeId: users.employeeId })
          .from(users)
          .where(eq(users.email, inviteEmail));

        // Create user row if brand-new invitee clicks Google button first
        if (!userRow) {
          const [newUser] = await db
            .insert(users)
            .values({
              email: inviteEmail,
              passwordHash: '',
              role: inviteRow.role || 'EMPLOYEE',
              status: 'ACTIVE',
              employeeId: inviteRow.employeeId,
            })
            .returning();
          userRow = newUser;
          console.log(`[GOOGLE OAUTH INVITE] Automatically created user account ${newUser.id} for invited employee ${inviteEmail}`);
        }

        if (userRow) {
          userId = userRow.id;
        }
        // NOTE: Invite is marked ACCEPTED inside callback ONLY after token exchange succeeds!
      }
    } catch (err) {
      console.error('[GOOGLE OAUTH INVITE LOOKUP ERROR]:', err);
    }
  }

  const state = Buffer.from(JSON.stringify({ userId, inviteToken })).toString('base64');
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `response_type=code` +
    `&client_id=${encodeURIComponent(process.env.GOOGLE_CLIENT_ID || '')}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.events')}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${encodeURIComponent(state)}`;

  res.redirect(googleAuthUrl);
});

// Google OAuth Callback route
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code missing');
  }

  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('[GOOGLE OAUTH ERROR] Token exchange failed:', tokenData);
      return res.status(400).json({ message: 'Google OAuth token exchange failed', error: tokenData });
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    let userId: string | null = null;
    let inviteToken: string | null = null;

    if (state && typeof state === 'string') {
      try {
        const parsedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
        userId = parsedState.userId || null;
        inviteToken = parsedState.inviteToken || null;
      } catch {
        userId = state;
      }
    }

    const isUuid = (str: string | null) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!userId || !isUuid(userId)) {
      const [firstUser] = await db.select().from(users).limit(1);
      userId = firstUser?.id || null;
    }

    let authTokenToSend: string | null = null;

    if (userId) {
      const [targetUser] = await db.select().from(users).where(eq(users.id, userId));
      if (targetUser) {
        const userPayload = {
          id: targetUser.id,
          email: targetUser.email,
          role: targetUser.role,
          employeeId: targetUser.employeeId || undefined,
        };
        authTokenToSend = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });
      }

      const expiry = new Date(Date.now() + (expires_in || 3600) * 1000);
      const [existingToken] = await db.select().from(googleTokens).where(eq(googleTokens.userId, userId));

      if (existingToken) {
        await db.update(googleTokens)
          .set({
            accessToken: access_token,
            refreshToken: refresh_token || existingToken.refreshToken,
            expiry,
            updatedAt: new Date(),
          })
          .where(eq(googleTokens.userId, userId));
      } else {
        await db.insert(googleTokens).values({
          userId,
          accessToken: access_token,
          refreshToken: refresh_token || '',
          expiry,
        });
      }

      // ITEM 2 FIX: Mark invite as ACCEPTED ONLY AFTER OAuth token exchange has succeeded!
      if (inviteToken) {
        await db
          .update(invites)
          .set({ status: 'ACCEPTED' })
          .where(eq(invites.token, inviteToken));
      }
    }

    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const redirectUrl = authTokenToSend
      ? `${appUrl}/dashboard?token=${authTokenToSend}&calendarConnected=true`
      : `${appUrl}/dashboard?calendarConnected=true`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error('[GOOGLE CALLBACK ERROR]:', err);
    res.status(500).send('OAuth Callback Error');
  }
});

export default router;

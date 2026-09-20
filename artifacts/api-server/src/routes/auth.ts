import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, users, invites, googleTokens, employees, eq, sql } from '@workspace/db';

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

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '365d' });
    return res.json({ token, user: userPayload });
  } catch (err: any) {
    console.error('[AUTH ROUTE ERROR] Login failed:', err);
    let detail = err?.message || String(err);
    if (err?.errors && Array.isArray(err.errors)) {
      detail = err.errors.map((e: any) => e.message || String(e)).join('; ');
    }
    return res.status(500).json({ message: `Server login failed: ${detail}` });
  }
});

// Verify Current User Session Route
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const [user] = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists in database' });
    }
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId || undefined,
        managedTeamId: user.managedTeamId || undefined,
      },
    });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// Secure Set Password Route via Invite Token or Email Activation
router.post('/set-password', async (req, res) => {
  const { token, password, email } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  if (!token && !email) {
    return res.status(400).json({ message: 'Either invite token or registered email address is required' });
  }

  try {
    const targetEmail = email ? email.toLowerCase().trim() : '';

    let invite: any = null;
    if (token) {
      [invite] = await db
        .select()
        .from(invites)
        .where(eq(invites.token, token));
    }

    if (!invite && targetEmail) {
      [invite] = await db
        .select()
        .from(invites)
        .where(sql`TRIM(LOWER(${invites.email})) = ${targetEmail}`);
    }

    // Fallback: Check if an employee profile exists for targetEmail
    let empRecord: any = null;
    if (targetEmail) {
      [empRecord] = await db
        .select()
        .from(employees)
        .where(sql`TRIM(LOWER(${employees.email})) = ${targetEmail}`);
    }

    // Check if user already exists
    const searchEmail = targetEmail || (invite ? invite.email.toLowerCase().trim() : '');
    const [existingUser] = searchEmail
      ? await db.select().from(users).where(sql`TRIM(LOWER(${users.email})) = ${searchEmail}`)
      : [null];

    if (!invite && !empRecord && !existingUser) {
      return res.status(400).json({ message: `No active invitation record found for this token or email address.` });
    }

    if (invite && targetEmail && invite.email && targetEmail !== invite.email.toLowerCase().trim()) {
      return res.status(400).json({ message: `Entered email (${email}) does not match invitation recipient (${invite.email})` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const finalEmail = searchEmail;
    const employeeId = empRecord ? empRecord.id : (invite ? invite.employeeId : (existingUser ? existingUser.employeeId : undefined));
    const userRole = existingUser?.role || (invite ? invite.role : 'EMPLOYEE');

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
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
          email: finalEmail,
          passwordHash,
          role: userRole,
          status: 'ACTIVE',
          employeeId: employeeId,
        })
        .returning();
      userId = newUser ? newUser.id : 'user-' + Date.now();
    }

    if (invite) {
      await db
        .update(invites)
        .set({ status: 'ACCEPTED' })
        .where(eq(invites.id, invite.id));
    }

    const userPayload = {
      id: userId,
      email: finalEmail,
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
  const returnPath = (req.query.returnPath as string) || '/meetings';

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
      }
    } catch (err) {
      console.error('[GOOGLE OAUTH INVITE LOOKUP ERROR]:', err);
    }
  }

  const reqHost = req.get('host') || 'localhost:5000';
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const apiServerUrl = `${proto}://${reqHost}`;

  const clientOrigin = (req.headers.referer ? new URL(req.headers.referer).origin : null) || process.env.APP_URL || (proto === 'https' ? `https://${reqHost}` : 'http://localhost:5173');

  const state = Buffer.from(JSON.stringify({ userId, inviteToken, returnPath, appUrl: clientOrigin, apiServerUrl })).toString('base64');
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${apiServerUrl}/api/auth/google/callback`;

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
    let userId: string | null = null;
    let inviteToken: string | null = null;
    let returnPath = '/meetings';
    let appUrl = process.env.APP_URL || 'http://localhost:5173';
    let apiServerUrl = '';

    if (state && typeof state === 'string') {
      try {
        const parsedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
        userId = parsedState.userId || null;
        inviteToken = parsedState.inviteToken || null;
        if (parsedState.returnPath) returnPath = parsedState.returnPath;
        if (parsedState.appUrl) appUrl = parsedState.appUrl;
        if (parsedState.apiServerUrl) apiServerUrl = parsedState.apiServerUrl;
      } catch {
        userId = state;
      }
    }

    const isUuid = (str: string | null) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!userId || !isUuid(userId)) {
      return res.status(400).json({ message: 'Invalid or missing session state' });
    }

    const reqHost = req.get('host') || 'localhost:5000';
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
    const currentApiUrl = apiServerUrl || `${proto}://${reqHost}`;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${currentApiUrl}/api/auth/google/callback`;

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

    const [targetUser] = await db.select().from(users).where(eq(users.id, userId));
    if (!targetUser) {
      return res.status(400).json({ message: 'Invalid or missing session state' });
    }

    const userPayload = {
      id: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      employeeId: targetUser.employeeId || undefined,
    };
    const authTokenToSend = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });

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

    if (inviteToken) {
      await db
        .update(invites)
        .set({ status: 'ACCEPTED' })
        .where(eq(invites.token, inviteToken));
    }

    const targetUrl = returnPath.startsWith('/') ? returnPath : `/${returnPath}`;
    const redirectUrl = `${appUrl}${targetUrl}?token=${authTokenToSend}&calendarConnected=true`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error('[GOOGLE CALLBACK ERROR]:', err);
    res.status(500).send('OAuth Callback Error');
  }
});

export default router;

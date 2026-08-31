import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, users, invites, eq } from '@workspace/db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hros_jwt_super_secret_key_2026';

// Secure Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    // Look up user by email in the DB users table
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare submitted password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Sign JWT payload using real DB fields
    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId || undefined,
      managedTeamId: user.managedTeamId || undefined,
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: userPayload });
  } catch (err) {
    console.error('[AUTH ROUTE ERROR] Login failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Secure Set Password Route via Invite Token
router.post('/set-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password required' });
  }

  try {
    // 1. Look up the token in the invites table
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

    // 2. Hash the submitted password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const inviteEmail = invite.email.toLowerCase().trim();

    // 3. Look up existing user by email
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

    // 4. Mark the invite as ACCEPTED
    await db
      .update(invites)
      .set({ status: 'ACCEPTED' })
      .where(eq(invites.id, invite.id));

    // 5. Sign and return a JWT for that real user
    const userPayload = {
      id: userId,
      email: inviteEmail,
      role: userRole,
      employeeId,
    };

    const authToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ message: 'Password set successfully', token: authToken, user: userPayload });
  } catch (err) {
    console.error('[SET-PASSWORD ERROR]:', err);
    return res.status(500).json({ message: 'Failed to set password' });
  }
});

router.get('/google', (req, res) => {
  const inviteToken = req.query.inviteToken;
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id'}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback')}&scope=https://www.googleapis.com/auth/calendar.events&state=${inviteToken || ''}`;
  res.redirect(redirectUrl);
});

router.get('/google/callback', (req, res) => {
  res.redirect('/dashboard?welcome=true');
});

export default router;

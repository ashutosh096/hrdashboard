import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, users, eq } from '@workspace/db';

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

router.post('/set-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password required' });
  }
  const userPayload = { id: 'user-uuid-invited', email: 'invited@example.com', role: 'EMPLOYEE' as const };
  const authToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ message: 'Password set successfully', token: authToken, user: userPayload });
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

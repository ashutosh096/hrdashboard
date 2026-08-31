import { Router } from 'express';
import jwt from 'jsonwebtoken';
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hros_jwt_super_secret_key_2026';
// Mock user store / auth endpoint for local standalone or database mode
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // Default Admin fallback login
    if (email === 'admin@example.com' && (password === 'admin123' || password === process.env.SEED_ADMIN_PASSWORD)) {
        const user = { id: 'admin-uuid-1', email, role: 'ADMIN' };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, user });
    }
    // Sample Manager login
    if (email === 'manager@ehm.com') {
        const user = { id: 'manager-uuid-1', email, role: 'MANAGER', entityId: 'ehm-uuid' };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, user });
    }
    // Sample Employee login
    if (email === 'employee@ehm.com') {
        const user = { id: 'employee-uuid-1', email, role: 'EMPLOYEE', entityId: 'ehm-uuid' };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, user });
    }
    // Generic fallback user for demo
    const user = { id: 'user-uuid-demo', email, role: 'ADMIN' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user });
});
router.post('/set-password', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({ message: 'Token and password required' });
    }
    const user = { id: 'user-uuid-invited', email: 'invited@example.com', role: 'EMPLOYEE' };
    const authToken = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ message: 'Password set successfully', token: authToken, user });
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

// Serverless & Node API Handler for Admin and Financial User Authentication
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve(process.cwd(), 'data', 'finance-data.json');
let failedAttempts = {}; // in-memory rate limiting: { [emailOrIp]: { count, lockedUntil } }
let localPin = 'rayan2026';

function getDbUsers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const db = JSON.parse(raw);
      return db.users || [];
    }
  } catch (e) {
    console.error('Error reading users from finance db:', e);
  }
  return [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const host = (req.headers && req.headers.host) || 'localhost';
  const url = new URL(req.url, `http://${host}`);
  const action = url.searchParams.get('action') || (req.body && req.body.action) || 'status';

  if (req.method === 'GET') {
    res.status(200).json({ success: true, local: true });
    return;
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};
    const postAction = body.action || action;

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'client';
    const emailKey = (body.email || body.username || ip).toLowerCase().trim();

    // Check rate limiting / lockout
    const attemptRecord = failedAttempts[emailKey];
    if (attemptRecord && attemptRecord.lockedUntil && Date.now() < attemptRecord.lockedUntil) {
      const remainingSeconds = Math.ceil((attemptRecord.lockedUntil - Date.now()) / 1000);
      res.status(429).json({
        success: false,
        authorized: false,
        error: `Account locked due to 5 repeated failed attempts. Please retry in ${remainingSeconds} seconds.`
      });
      return;
    }

    // 1. PIN-based login (Legacy Command Center compatibility)
    if (postAction === 'verify' && (body.pin || (body.password && !body.email))) {
      const entered = (body.password || body.pin || '').trim();
      if (entered === localPin) {
        if (failedAttempts[emailKey]) delete failedAttempts[emailKey];
        res.status(200).json({ success: true, authorized: true, role: 'super_admin' });
      } else {
        res.status(401).json({ success: false, authorized: false, error: 'Invalid administrative access key' });
      }
      return;
    }

    // 2. Email + Password Authentication for Financial Portal
    if (postAction === 'login' || postAction === 'finance_login' || (body.email && body.password)) {
      const email = (body.email || '').toLowerCase().trim();
      const password = (body.password || '').trim();

      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required' });
        return;
      }

      const users = getDbUsers();
      const matchedUser = users.find(u => u.email.toLowerCase() === email);

      if (matchedUser && matchedUser.password === password) {
        if (matchedUser.status === 'suspended') {
          res.status(403).json({ success: false, error: 'This employee account is suspended. Please contact Super Administrator.' });
          return;
        }

        // Reset failed attempts on success
        if (failedAttempts[emailKey]) delete failedAttempts[emailKey];

        const sessionToken = `sess_${Buffer.from(`${matchedUser.id}:${Date.now()}:${Math.random()}`).toString('base64url')}`;
        
        // Return user profile without password
        const { password: _, ...safeUser } = matchedUser;
        res.status(200).json({
          success: true,
          authorized: true,
          token: sessionToken,
          user: safeUser,
          message: `Welcome back, ${matchedUser.name}`
        });
        return;
      }

      // Record failed attempt
      if (!failedAttempts[emailKey]) {
        failedAttempts[emailKey] = { count: 1 };
      } else {
        failedAttempts[emailKey].count++;
        if (failedAttempts[emailKey].count >= 5) {
          failedAttempts[emailKey].lockedUntil = Date.now() + 60000; // 60 seconds lockout
        }
      }

      const remainingAttempts = 5 - failedAttempts[emailKey].count;
      res.status(401).json({
        success: false,
        authorized: false,
        error: remainingAttempts > 0 
          ? `Invalid email or password. ${remainingAttempts} attempts remaining before account lockout.`
          : 'Account locked for 60 seconds due to repeated failed login attempts.'
      });
      return;
    }

    // 3. Forgot Password simulation
    if (action === 'forgot_password') {
      const email = (body.email || '').toLowerCase().trim();
      const users = getDbUsers();
      const user = users.find(u => u.email.toLowerCase() === email);
      if (user) {
        res.status(200).json({
          success: true,
          message: `Password reset instructions and verification code have been dispatched to ${email}.`
        });
      } else {
        // Return 200 to prevent user enumeration
        res.status(200).json({
          success: true,
          message: `If an account exists with this email, password reset instructions have been sent.`
        });
      }
      return;
    }

    // 4. Update password
    if (action === 'change_password') {
      const email = (body.email || '').toLowerCase().trim();
      const currentPassword = (body.current_password || '').trim();
      const newPassword = (body.new_password || '').trim();

      if (newPassword.length < 6) {
        res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
        return;
      }

      try {
        if (fs.existsSync(DATA_FILE)) {
          const raw = fs.readFileSync(DATA_FILE, 'utf-8');
          const db = JSON.parse(raw);
          const user = db.users.find(u => u.email.toLowerCase() === email);
          if (user && user.password === currentPassword) {
            user.password = newPassword;
            fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
            res.status(200).json({ success: true, message: 'Password updated successfully' });
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }

      res.status(400).json({ success: false, error: 'Current password incorrect' });
      return;
    }
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}

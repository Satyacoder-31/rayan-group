// Serverless & Dev API Handler for Live Assistance Chat
// Supports cross-device polling, messaging, and status management

let sessions = {};
let messages = {};

// Clean up stale sessions older than 24h
function cleanOldData() {
  const now = Date.now();
  for (const id in sessions) {
    if (now - sessions[id].lastActivity > 24 * 60 * 60 * 1000) {
      delete sessions[id];
      delete messages[id];
    }
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const host = (req.headers && req.headers.host) || 'localhost';
  const url = new URL(req.url, `http://${host}`);
  const action = url.searchParams.get('action') || (req.body && req.body.action) || 'poll';

  cleanOldData();

  // 1. Visitor or Admin Polls for Messages
  if (req.method === 'GET') {
    if (action === 'list_sessions') {
      // Admin lists all sessions
      const sessionList = Object.values(sessions).sort((a, b) => b.lastActivity - a.lastActivity);
      res.status(200).json({ success: true, sessions: sessionList });
      return;
    }

    if (action === 'get_messages') {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) {
        res.status(400).json({ error: 'Missing sessionId' });
        return;
      }
      const sessionMsgs = messages[sessionId] || [];
      const session = sessions[sessionId] || null;
      res.status(200).json({ success: true, session, messages: sessionMsgs });
      return;
    }

    if (action === 'poll') {
      const sessionId = url.searchParams.get('sessionId');
      const since = parseInt(url.searchParams.get('since') || '0', 10);
      const sessionMsgs = (messages[sessionId] || []).filter(m => m.timestamp > since);
      res.status(200).json({
        success: true,
        session: sessions[sessionId] || null,
        messages: sessionMsgs,
        serverTime: Date.now()
      });
      return;
    }

    res.status(200).json({ success: true, status: 'Live Assistance API Online' });
    return;
  }

  // 2. POST actions (Send Message, Admin Reply, Resolve, etc.)
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};

    const subAction = body.action || action;
    const { sessionId, text, sender, senderName, page, visitorInfo } = body;

    if (!sessionId) {
      res.status(400).json({ error: 'Missing sessionId' });
      return;
    }

    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        id: sessionId,
        visitorName: visitorInfo?.name || senderName || 'Website Visitor',
        page: page || '/',
        createdAt: Date.now(),
        lastActivity: Date.now(),
        unreadForAdmin: 0,
        unreadForVisitor: 0,
        status: 'active'
      };
      messages[sessionId] = [];
    }

    const session = sessions[sessionId];
    session.lastActivity = Date.now();
    if (page) session.page = page;
    if (visitorInfo?.name) session.visitorName = visitorInfo.name;

    if (subAction === 'send' || subAction === 'reply') {
      if (!text || !text.trim()) {
        res.status(400).json({ error: 'Message text cannot be empty' });
        return;
      }

      const isVisitor = (sender !== 'admin');
      const msg = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        sessionId,
        sender: isVisitor ? 'visitor' : 'admin',
        senderName: isVisitor ? (session.visitorName || 'Visitor') : (senderName || 'Corporate Executive Desk'),
        text: text.trim(),
        timestamp: Date.now(),
        read: false
      };

      messages[sessionId].push(msg);

      if (isVisitor) {
        session.unreadForAdmin = (session.unreadForAdmin || 0) + 1;
        session.lastMessage = text.trim();
        session.status = 'active';
      } else {
        session.unreadForVisitor = (session.unreadForVisitor || 0) + 1;
        session.lastMessage = text.trim();
      }

      res.status(200).json({ success: true, message: msg, session });
      return;
    }

    if (subAction === 'mark_read') {
      const by = body.by || 'admin';
      if (by === 'admin') {
        session.unreadForAdmin = 0;
      } else {
        session.unreadForVisitor = 0;
      }
      (messages[sessionId] || []).forEach(m => {
        if (by === 'admin' && m.sender === 'visitor') m.read = true;
        if (by === 'visitor' && m.sender === 'admin') m.read = true;
      });
      res.status(200).json({ success: true, session });
      return;
    }

    if (subAction === 'resolve') {
      session.status = 'resolved';
      res.status(200).json({ success: true, session });
      return;
    }

    if (subAction === 'clear') {
      delete sessions[sessionId];
      delete messages[sessionId];
      res.status(200).json({ success: true, cleared: sessionId });
      return;
    }

    res.status(400).json({ error: 'Unknown action' });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}

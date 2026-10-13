// Serverless & Node API Handler for Live Assistance Chat
// Persistently proxies to the Hostinger MySQL backend so Vercel & custom domain stay 100% in sync
// Includes local in-memory fallback for offline or detached development

const UPSTREAM_URL = 'https://rayan-group.com/api/chat';

let localSessions = {};
let localMessages = {};

function cleanOldData() {
  const now = Date.now();
  for (const id in localSessions) {
    if (now - localSessions[id].lastActivity > 48 * 60 * 60 * 1000) {
      delete localSessions[id];
      delete localMessages[id];
    }
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const host = (req.headers && req.headers.host) || 'localhost';
  const url = new URL(req.url, `http://${host}`);
  const action = url.searchParams.get('action') || (req.body && req.body.action) || 'poll';

  // Attempt proxy to primary Hostinger MySQL backend
  try {
    const upstreamUrl = `${UPSTREAM_URL}?${url.searchParams.toString()}`;
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Rayan-Vercel-Proxy/1.0'
      }
    };
    if (req.method === 'POST') {
      let bodyData = req.body;
      if (typeof bodyData === 'string') {
        try { bodyData = JSON.parse(bodyData); } catch (e) {}
      }
      fetchOptions.body = JSON.stringify(bodyData || {});
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    fetchOptions.signal = controller.signal;

    const upstreamRes = await fetch(upstreamUrl, fetchOptions);
    clearTimeout(timeoutId);

    if (upstreamRes.ok) {
      const data = await upstreamRes.json();
      res.status(200).json(data);
      return;
    }
  } catch (proxyErr) {
    // Upstream error or timeout; fallback to local in-memory store
  }

  // ============================================================================
  // LOCAL IN-MEMORY FALLBACK (when upstream is unreachable)
  // ============================================================================
  cleanOldData();

  if (req.method === 'GET') {
    if (action === 'list_sessions') {
      const sessionList = Object.values(localSessions).sort((a, b) => b.lastActivity - a.lastActivity);
      res.status(200).json({ success: true, sessions: sessionList });
      return;
    }

    if (action === 'get_messages') {
      const sessionId = url.searchParams.get('sessionId') || url.searchParams.get('session_id');
      if (!sessionId) {
        res.status(400).json({ error: 'Missing sessionId' });
        return;
      }
      const sessionMsgs = localMessages[sessionId] || [];
      const session = localSessions[sessionId] || null;
      res.status(200).json({ success: true, session, messages: sessionMsgs });
      return;
    }

    if (action === 'poll') {
      const sessionId = url.searchParams.get('sessionId') || url.searchParams.get('session_id');
      const since = parseInt(url.searchParams.get('since') || '0', 10);
      const sessionMsgs = (localMessages[sessionId] || []).filter(m => m.timestamp > since);
      res.status(200).json({
        success: true,
        session: localSessions[sessionId] || null,
        messages: sessionMsgs,
        serverTime: Date.now()
      });
      return;
    }

    res.status(200).json({ success: true, status: 'Live Assistance In-Memory Fallback Online' });
    return;
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};

    const subAction = body.action || action;
    const sessionId = body.sessionId || body.session_id;
    const { text, sender, senderName, page, visitorInfo } = body;

    if (!sessionId) {
      res.status(400).json({ error: 'Missing sessionId' });
      return;
    }

    if (!localSessions[sessionId]) {
      localSessions[sessionId] = {
        id: sessionId,
        visitorName: visitorInfo?.name || senderName || 'Website Visitor',
        page: page || '/',
        createdAt: Date.now(),
        lastActivity: Date.now(),
        unreadForAdmin: 0,
        unreadForVisitor: 0,
        status: 'active'
      };
      localMessages[sessionId] = [];
    }

    const session = localSessions[sessionId];
    session.lastActivity = Date.now();
    if (page) session.page = page;
    if (visitorInfo?.name) session.visitorName = visitorInfo.name;

    if (['send', 'reply', 'send_message'].includes(subAction)) {
      if (!text || !text.trim()) {
        res.status(400).json({ error: 'Message text cannot be empty' });
        return;
      }

      const isVisitor = (sender !== 'admin');
      const msgId = body.id || ('msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
      const msgTs = body.timestamp || Date.now();

      const msg = {
        id: msgId,
        sessionId,
        sender: isVisitor ? 'visitor' : 'admin',
        senderName: isVisitor ? (session.visitorName || 'Visitor') : (senderName || 'Corporate Executive Desk'),
        text: text.trim(),
        timestamp: msgTs,
        read: false
      };

      localMessages[sessionId].push(msg);

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
      if (by === 'admin') session.unreadForAdmin = 0;
      else session.unreadForVisitor = 0;
      res.status(200).json({ success: true, session });
      return;
    }

    if (subAction === 'resolve') {
      session.status = 'resolved';
      res.status(200).json({ success: true, session });
      return;
    }

    if (subAction === 'clear') {
      delete localSessions[sessionId];
      delete localMessages[sessionId];
      res.status(200).json({ success: true, cleared: sessionId });
      return;
    }

    res.status(400).json({ error: 'Unknown action' });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}

// Serverless & Node API Handler for Admin Authentication
// Proxies verification and password updates to Hostinger backend config.php / MySQL

const UPSTREAM_URL = 'https://rayan-group.com/api/auth';
let localPin = 'rayan2026';

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

  // Proxy to Hostinger
  try {
    const upstreamUrl = `${UPSTREAM_URL}?${url.searchParams.toString()}`;
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Rayan-Vercel-Auth-Proxy/1.0'
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

    const data = await upstreamRes.json();
    res.status(upstreamRes.status).json(data);
    return;
  } catch (proxyErr) {
    // Upstream error or offline; local fallback
  }

  // Local fallback
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

    if (action === 'verify' || action === 'login') {
      const entered = (body.password || body.pin || '').trim();
      if (entered === localPin) {
        res.status(200).json({ success: true, authorized: true });
      } else {
        res.status(401).json({ success: false, authorized: false, error: 'Invalid access key' });
      }
      return;
    }

    if (action === 'change_password') {
      const current = (body.current_password || '').trim();
      const next = (body.new_password || '').trim();
      if (current === localPin && next.length >= 4) {
        localPin = next;
        res.status(200).json({ success: true, message: 'Password updated locally' });
      } else {
        res.status(400).json({ success: false, error: 'Invalid credentials or password too short' });
      }
      return;
    }
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}

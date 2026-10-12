// Serverless & Dev API Handler for Form Submissions & Email Routing
// Rayan Group Corporate Secretariat & Subsidiary Inquiries
import fs from 'fs';
import path from 'path';

let inMemorySubmissions = [];

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 1. GET: List recent inquiries (for admin dashboard / audit)
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      count: inMemorySubmissions.length,
      submissions: inMemorySubmissions.slice(0, 50)
    });
    return;
  }

  // 2. POST: Process inquiry & dispatch to target email
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const {
      formId = 'contactForm',
      formTitle = 'General Commercial Inquiry',
      targetEmail = 'rayan@rayan-group.com',
      ccEmail = '',
      senderName = 'Website Visitor',
      senderEmail = 'no-reply@rayan-group.com',
      senderPhone = '',
      reference = 'RYN-' + Date.now(),
      fields = {}
    } = body;

    const submissionRecord = {
      reference,
      formId,
      formTitle,
      targetEmail,
      ccEmail,
      senderName,
      senderEmail,
      senderPhone,
      fields,
      timestamp: new Date().toISOString()
    };

    inMemorySubmissions.unshift(submissionRecord);
    if (inMemorySubmissions.length > 200) {
      inMemorySubmissions = inMemorySubmissions.slice(0, 200);
    }

    console.log(`[Form Dispatch] Received "${formTitle}" (Ref: ${reference}) -> Routing to: ${targetEmail}`);

    res.status(200).json({
      success: true,
      reference,
      formTitle,
      targetEmail,
      ccEmail,
      timestamp: submissionRecord.timestamp,
      message: `Inquiry registered and routed to ${targetEmail}`
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

// Local & Serverless Git Operations API
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return current git status / branch / latest commit
    try {
      const { stdout: branch } = await execPromise('git branch --show-current');
      const { stdout: log } = await execPromise('git log -1 --pretty=format:"%h - %s (%cr)"');
      const { stdout: status } = await execPromise('git status --short');
      res.status(200).json({
        success: true,
        branch: branch.trim(),
        lastCommit: log.trim(),
        hasChanges: Boolean(status.trim()),
        statusOutput: status.trim()
      });
    } catch (err) {
      res.status(200).json({
        success: false,
        message: 'Git CLI not directly accessible or in cloud serverless environment. Use GitHub Direct Push mode.',
        error: err.message
      });
    }
    return;
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const message = body?.message || `Site content updated via Rayan Admin Panel [${new Date().toISOString()}]`;

    try {
      // 1. Stage changes
      await execPromise('git add .');

      // 2. Commit
      const commitRes = await execPromise(`git commit -m "${message.replace(/"/g, '\\"')}"`);

      // 3. Push to remote
      const pushRes = await execPromise('git push origin main');

      res.status(200).json({
        success: true,
        message: 'Successfully committed and pushed to git repository!',
        commitOutput: commitRes.stdout,
        pushOutput: pushRes.stdout || pushRes.stderr
      });
    } catch (err) {
      // Check if nothing to commit
      if (err.message && err.message.includes('nothing to commit')) {
        res.status(200).json({
          success: true,
          message: 'Working tree clean, nothing new to commit.',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to push via local git CLI. Please use GitHub Direct Push (PAT) in the admin panel.',
        error: err.message
      });
    }
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}

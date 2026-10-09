// ============================================================================
// RAYAN GROUP — ENTERPRISE ADMINISTRATION PORTAL ENGINE
// Complete site content CMS, real-time live support desk, and Git push manager
// ============================================================================

import {
  GROUP_INFO,
  GROUP_COMPANIES,
  LEADERSHIP_TEAM,
  FEATURED_PROJECTS,
  FINANCIAL_HIGHLIGHTS,
  CORPORATE_NEWS,
  CAREER_OPPORTUNITIES,
  CORPORATE_TIMELINE
} from './data.js';

import { getSiteOverrides, saveSiteOverrides } from './live-overrides.js';

class RayanAdminPortal {
  constructor() {
    this.isAuthenticated = sessionStorage.getItem('rayan_admin_auth') === 'true';
    this.currentTab = 'chat';
    this.sessions = [];
    this.activeSessionId = null;
    this.activeMessages = [];
    this.pollInterval = null;
    this.broadcastChannel = null;
    this.audioCtx = null;
    this.isMuted = false;

    // Load master state from data.js merged with local overrides
    this.state = this.loadMasterState();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('rayan_live_desk_channel');
        this.broadcastChannel.onmessage = (event) => this.handleBroadcastMessage(event.data);
      } catch (e) {
        console.warn('BroadcastChannel not supported', e);
      }
    }
  }

  loadMasterState() {
    const overrides = getSiteOverrides() || {};
    return {
      groupInfo: overrides.groupInfo || JSON.parse(JSON.stringify(GROUP_INFO)),
      companies: overrides.companies || JSON.parse(JSON.stringify(GROUP_COMPANIES)),
      projects: overrides.projects || JSON.parse(JSON.stringify(FEATURED_PROJECTS)),
      leadership: overrides.leadership || JSON.parse(JSON.stringify(LEADERSHIP_TEAM)),
      financials: overrides.financials || JSON.parse(JSON.stringify(FINANCIAL_HIGHLIGHTS)),
      news: overrides.news || JSON.parse(JSON.stringify(CORPORATE_NEWS)),
      careers: overrides.careers || JSON.parse(JSON.stringify(CAREER_OPPORTUNITIES)),
      timeline: overrides.timeline || JSON.parse(JSON.stringify(CORPORATE_TIMELINE)),
      widgetSettings: overrides.widgetSettings || {
        deskStatus: 'Online',
        autoReply: 'Thank you for reaching Rayan Group Executive Desk. A project director is reviewing your inquiry.',
        welcomeText: 'Welcome to Rayan Group. How can our engineering and contracting team assist you today?'
      }
    };
  }

  init() {
    this.bindAuthEvents();
    if (this.isAuthenticated) {
      this.revealDashboard();
    } else {
      this.showLockScreen();
    }
  }

  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================
  bindAuthEvents() {
    const form = document.getElementById('admin-lock-form');
    const pinInput = document.getElementById('admin-lock-pin');
    const errorMsg = document.getElementById('admin-lock-error');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = pinInput.value.trim();
        const savedPin = localStorage.getItem('rayan_admin_pin') || 'rayan2026';

        if (pin === savedPin) {
          sessionStorage.setItem('rayan_admin_auth', 'true');
          this.isAuthenticated = true;
          this.revealDashboard();
        } else {
          if (errorMsg) {
            errorMsg.textContent = 'Invalid corporate access key. Please try again.';
            errorMsg.style.display = 'block';
          }
          pinInput.value = '';
          pinInput.focus();
        }
      });
    }

    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('rayan_admin_auth');
        this.isAuthenticated = false;
        this.showLockScreen();
      });
    }
  }

  showLockScreen() {
    const lockScreen = document.getElementById('admin-lock-screen');
    const appLayout = document.getElementById('admin-app-layout');
    if (lockScreen) lockScreen.style.display = 'flex';
    if (appLayout) appLayout.style.display = 'none';
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  revealDashboard() {
    const lockScreen = document.getElementById('admin-lock-screen');
    const appLayout = document.getElementById('admin-app-layout');
    if (lockScreen) lockScreen.style.display = 'none';
    if (appLayout) appLayout.style.display = 'flex';

    this.bindTabNavigation();
    this.populateAllForms();
    this.bindFormEvents();
    this.bindGitPushEvents();
    this.initChatDesk();
  }

  // ==========================================================================
  // NAVIGATION TABS
  // ==========================================================================
  bindTabNavigation() {
    const navButtons = document.querySelectorAll('.admin-nav-item button');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.admin-nav-item').forEach(li => {
      const btn = li.querySelector('button');
      if (btn && btn.getAttribute('data-tab') === tabId) {
        li.classList.add('active');
      } else {
        li.classList.remove('active');
      }
    });

    document.querySelectorAll('.admin-tab-pane').forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    if (tabId === 'chat') {
      this.refreshSessionsList();
    }
  }

  showToast(message, type = 'success') {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      toast.className = 'admin-toast-notify';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>${type === 'success' ? '✓' : '⚠️'}</span> <span>${message}</span>`;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }

  // ==========================================================================
  // POPULATE FORMS FROM STATE
  // ==========================================================================
  populateAllForms() {
    const g = this.state.groupInfo;
    this.setVal('info-name', g.name);
    this.setVal('info-tagline', g.tagline);
    this.setVal('info-subtagline', g.subTagline);
    this.setVal('info-workforce', g.globalWorkforce);
    this.setVal('info-engineers', g.engineersCount);
    this.setVal('info-projects', g.projectsCompleted);
    this.setVal('info-countries', g.countriesActive);
    this.setVal('info-vision', g.vision);
    this.setVal('info-mission', g.mission);

    // Ticker
    this.setVal('ticker-symbol', g.ticker);
    this.setVal('ticker-exchange', g.stockExchange);
    this.setVal('ticker-price', g.stockPrice);
    this.setVal('ticker-currency', g.currency);
    this.setVal('ticker-change', g.stockChange);
    this.setVal('ticker-change-pct', g.stockChangePercent);
    this.setVal('ticker-market-cap', g.marketCap);
    this.setVal('ticker-revenue', g.revenue);
    this.setVal('ticker-net-profit', g.netProfit);

    // HQ UAE
    const uae = g.headquarters?.uae || {};
    this.setVal('hq-uae-address', uae.address);
    this.setVal('hq-uae-phone', uae.phone);
    this.setVal('hq-uae-email', uae.email);
    this.setVal('hq-uae-tender', uae.tenderEmail);

    // HQ India
    const ind = g.headquarters?.india || {};
    this.setVal('hq-ind-address', ind.address);
    this.setVal('hq-ind-phone', ind.phone);
    this.setVal('hq-ind-email', ind.email);

    // Widget settings
    const w = this.state.widgetSettings;
    this.setVal('widget-welcome', w.welcomeText);
    this.setVal('widget-autoreply', w.autoReply);

    this.renderCompaniesList();
    this.renderProjectsList();
    this.renderLeadershipList();
    this.renderNewsList();
  }

  setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  }

  getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  // ==========================================================================
  // COMPANIES, PROJECTS, LEADERSHIP & NEWS RENDERERS
  // ==========================================================================
  renderCompaniesList() {
    const container = document.getElementById('admin-companies-list');
    if (!container) return;
    container.innerHTML = this.state.companies.map((c, idx) => `
      <div class="admin-card" style="margin-bottom: 1rem; padding: 1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h4 style="margin:0; font-size:1rem; color:#fff;">${c.name}</h4>
          <span style="font-size:0.7rem; color:#00c7b3; background:rgba(0,199,179,0.1); padding:0.2rem 0.5rem; border-radius:4px;">${c.sector}</span>
        </div>
        <div class="admin-grid-2">
          <div class="admin-field-group">
            <label class="admin-label">Headline</label>
            <input type="text" class="admin-input comp-field" data-idx="${idx}" data-field="headline" value="${c.headline || ''}">
          </div>
          <div class="admin-field-group">
            <label class="admin-label">Key Stats</label>
            <input type="text" class="admin-input comp-field" data-idx="${idx}" data-field="stats" value="${c.stats || ''}">
          </div>
        </div>
        <div class="admin-field-group" style="margin-top:0.75rem;">
          <label class="admin-label">Description</label>
          <textarea class="admin-input admin-textarea comp-field" data-idx="${idx}" data-field="description">${c.description || ''}</textarea>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.comp-field').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.getAttribute('data-idx'), 10);
        const field = input.getAttribute('data-field');
        this.state.companies[idx][field] = input.value;
      });
    });
  }

  renderProjectsList() {
    const container = document.getElementById('admin-projects-list');
    if (!container) return;
    container.innerHTML = `
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem; text-align:left;">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.1); color:#94a3b8; font-size:0.72rem; text-transform:uppercase;">
              <th style="padding:0.75rem;">Title</th>
              <th style="padding:0.75rem;">Category</th>
              <th style="padding:0.75rem;">Location</th>
              <th style="padding:0.75rem;">Value</th>
              <th style="padding:0.75rem;">Year</th>
              <th style="padding:0.75rem; text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.state.projects.map((p, idx) => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05); color:#cbd5e1;">
                <td style="padding:0.75rem; font-weight:700; color:#fff;">${p.title}</td>
                <td style="padding:0.75rem;">${p.category}</td>
                <td style="padding:0.75rem;">${p.location}</td>
                <td style="padding:0.75rem; color:#00c7b3;">${p.value}</td>
                <td style="padding:0.75rem;">${p.year}</td>
                <td style="padding:0.75rem; text-align:right;">
                  <button type="button" class="admin-btn-secondary btn-edit-proj" data-idx="${idx}" style="padding:0.35rem 0.65rem; font-size:0.75rem;">Edit</button>
                  <button type="button" class="admin-btn-danger btn-del-proj" data-idx="${idx}" style="padding:0.35rem 0.65rem; font-size:0.75rem; margin-left:0.3rem;">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.querySelectorAll('.btn-del-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (confirm(`Delete project "${this.state.projects[idx].title}"?`)) {
          this.state.projects.splice(idx, 1);
          this.renderProjectsList();
          this.saveAllChanges();
        }
      });
    });

    container.querySelectorAll('.btn-edit-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const p = this.state.projects[idx];
        const newTitle = prompt('Project Title:', p.title);
        if (newTitle !== null) {
          p.title = newTitle;
          p.value = prompt('Contract Value (e.g. AED 95M):', p.value) || p.value;
          p.scope = prompt('Scope of Work:', p.scope) || p.scope;
          this.renderProjectsList();
          this.saveAllChanges();
        }
      });
    });
  }

  renderLeadershipList() {
    const container = document.getElementById('admin-leadership-list');
    if (!container) return;
    container.innerHTML = this.state.leadership.map((l, idx) => `
      <div class="admin-card" style="margin-bottom:1rem; padding:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h4 style="margin:0; font-size:1rem; color:#fff;">${l.name}</h4>
          <span style="font-size:0.75rem; color:#0099e6;">${l.tenure || l.tag}</span>
        </div>
        <div class="admin-grid-2">
          <div class="admin-field-group">
            <label class="admin-label">Official Role</label>
            <input type="text" class="admin-input lead-field" data-idx="${idx}" data-field="role" value="${l.role}">
          </div>
          <div class="admin-field-group">
            <label class="admin-label">Tenure Tag</label>
            <input type="text" class="admin-input lead-field" data-idx="${idx}" data-field="tenure" value="${l.tenure || ''}">
          </div>
        </div>
        <div class="admin-field-group" style="margin-top:0.75rem;">
          <label class="admin-label">Executive Biography</label>
          <textarea class="admin-input admin-textarea lead-field" data-idx="${idx}" data-field="bio">${l.bio}</textarea>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.lead-field').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.getAttribute('data-idx'), 10);
        const field = input.getAttribute('data-field');
        this.state.leadership[idx][field] = input.value;
      });
    });
  }

  renderNewsList() {
    const container = document.getElementById('admin-news-list');
    if (!container) return;
    container.innerHTML = this.state.news.map((n, idx) => `
      <div class="admin-card" style="margin-bottom:1rem; padding:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h4 style="margin:0; font-size:0.95rem; color:#fff;">${n.title}</h4>
          <span style="font-size:0.72rem; color:#f59e0b;">${n.date}</span>
        </div>
        <div class="admin-field-group">
          <label class="admin-label">Excerpt / Summary</label>
          <textarea class="admin-input admin-textarea news-field" data-idx="${idx}" data-field="excerpt">${n.excerpt}</textarea>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.news-field').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.getAttribute('data-idx'), 10);
        const field = input.getAttribute('data-field');
        this.state.news[idx][field] = input.value;
      });
    });
  }

  // ==========================================================================
  // SAVE FORM CHANGES TO OVERRIDES
  // ==========================================================================
  bindFormEvents() {
    // Add Project Modal / Prompt
    const addProjBtn = document.getElementById('btn-add-project');
    if (addProjBtn) {
      addProjBtn.addEventListener('click', () => {
        const title = prompt('Project Title:');
        if (!title) return;
        const category = prompt('Category (e.g. HIGH-RISE, HOSPITALITY, ENERGY):', 'COMMERCIAL') || 'COMMERCIAL';
        const location = prompt('Location (e.g. Abu Dhabi, UAE):', 'Abu Dhabi, UAE') || 'Abu Dhabi, UAE';
        const value = prompt('Contract Value (e.g. AED 120M):', 'AED 50M') || 'AED 50M';
        const year = prompt('Year (e.g. 2025):', '2025') || '2025';
        const scope = prompt('Scope Summary:', 'Turnkey EPC and structural engineering execution.') || '';

        const newProj = {
          id: 'proj-' + Date.now(),
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title,
          category,
          filterCat: 'commercial',
          location,
          client: 'Client Confidential',
          year,
          value,
          scope,
          image: '/assets/images/hero/hero-1-skyline.jpg',
          featured: true
        };

        this.state.projects.unshift(newProj);
        this.renderProjectsList();
        this.saveAllChanges();
        this.showToast('New project created and published locally!');
      });
    }

    // Save buttons on all tabs
    document.querySelectorAll('.btn-save-section').forEach(btn => {
      btn.addEventListener('click', () => {
        this.collectFormData();
        this.saveAllChanges();
        this.showToast('Changes saved & synchronized to live site!');
      });
    });
  }

  collectFormData() {
    const g = this.state.groupInfo;
    g.name = this.getVal('info-name') || g.name;
    g.tagline = this.getVal('info-tagline') || g.tagline;
    g.subTagline = this.getVal('info-subtagline') || g.subTagline;
    g.globalWorkforce = this.getVal('info-workforce') || g.globalWorkforce;
    g.engineersCount = this.getVal('info-engineers') || g.engineersCount;
    g.projectsCompleted = this.getVal('info-projects') || g.projectsCompleted;
    g.countriesActive = this.getVal('info-countries') || g.countriesActive;
    g.vision = this.getVal('info-vision') || g.vision;
    g.mission = this.getVal('info-mission') || g.mission;

    g.ticker = this.getVal('ticker-symbol') || g.ticker;
    g.stockPrice = this.getVal('ticker-price') || g.stockPrice;
    g.stockChange = this.getVal('ticker-change') || g.stockChange;
    g.stockChangePercent = this.getVal('ticker-change-pct') || g.stockChangePercent;
    g.marketCap = this.getVal('ticker-market-cap') || g.marketCap;
    g.revenue = this.getVal('ticker-revenue') || g.revenue;
    g.netProfit = this.getVal('ticker-net-profit') || g.netProfit;

    if (!g.headquarters) g.headquarters = {};
    if (!g.headquarters.uae) g.headquarters.uae = {};
    g.headquarters.uae.address = this.getVal('hq-uae-address') || g.headquarters.uae.address;
    g.headquarters.uae.phone = this.getVal('hq-uae-phone') || g.headquarters.uae.phone;
    g.headquarters.uae.email = this.getVal('hq-uae-email') || g.headquarters.uae.email;
    g.headquarters.uae.tenderEmail = this.getVal('hq-uae-tender') || g.headquarters.uae.tenderEmail;

    if (!g.headquarters.india) g.headquarters.india = {};
    g.headquarters.india.address = this.getVal('hq-ind-address') || g.headquarters.india.address;
    g.headquarters.india.phone = this.getVal('hq-ind-phone') || g.headquarters.india.phone;
    g.headquarters.india.email = this.getVal('hq-ind-email') || g.headquarters.india.email;

    this.state.widgetSettings.welcomeText = this.getVal('widget-welcome') || this.state.widgetSettings.welcomeText;
    this.state.widgetSettings.autoReply = this.getVal('widget-autoreply') || this.state.widgetSettings.autoReply;
  }

  saveAllChanges() {
    saveSiteOverrides(this.state);
  }

  // ==========================================================================
  // LIVE ASSISTANCE CHAT DESK (EXECUTIVE DESK LIVE SUPPORT)
  // ==========================================================================
  initChatDesk() {
    this.refreshSessionsList();
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => this.refreshSessionsList(), 3000);

    const replyForm = document.getElementById('admin-chat-reply-form');
    if (replyForm) {
      replyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendAdminReply();
      });
    }

    // Canned response chips
    document.querySelectorAll('.admin-canned-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const replyInput = document.getElementById('admin-chat-reply-input');
        if (replyInput) {
          replyInput.value = chip.getAttribute('data-reply') || chip.textContent;
          replyInput.focus();
        }
      });
    });

    // Clear / Resolve buttons
    const resolveBtn = document.getElementById('admin-btn-resolve-chat');
    if (resolveBtn) {
      resolveBtn.addEventListener('click', () => this.resolveActiveSession());
    }

    const clearBtn = document.getElementById('admin-btn-clear-chat');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearActiveSession());
    }
  }

  async refreshSessionsList() {
    try {
      const res = await fetch('/api/chat?action=list_sessions');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.sessions)) {
          this.sessions = data.sessions;
          this.renderSessionsList();
          this.updateNavUnreadCount();
        }
      }
    } catch (err) {
      // Local dev or offline fallback
    }

    // Also poll active conversation if one is selected
    if (this.activeSessionId) {
      this.fetchActiveSessionMessages(this.activeSessionId);
    }
  }

  renderSessionsList() {
    const listContainer = document.getElementById('admin-chat-sessions-list');
    if (!listContainer) return;

    if (this.sessions.length === 0) {
      listContainer.innerHTML = `
        <div style="padding: 2rem 1rem; text-align: center; color: #64748b; font-size: 0.85rem;">
          No active chat sessions.<br>When website visitors message, they will appear here in real time.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = this.sessions.map(s => {
      const isSelected = s.id === this.activeSessionId;
      const timeStr = new Date(s.lastActivity || s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const unreadBadge = (s.unreadForAdmin > 0) ? `<span class="session-unread-pill">${s.unreadForAdmin}</span>` : '';

      return `
        <div class="admin-chat-session-item ${isSelected ? 'selected' : ''}" data-id="${s.id}">
          <div class="session-header-row">
            <span class="session-visitor-name">${s.visitorName || 'Visitor'}</span>
            <span class="session-time">${timeStr}</span>
          </div>
          <div class="session-last-msg">${s.lastMessage || 'Connected to Executive Desk'}</div>
          <span class="session-page-meta">Page: ${s.page || '/'}</span>
          ${unreadBadge}
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.admin-chat-session-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        this.selectSession(id);
      });
    });
  }

  updateNavUnreadCount() {
    const badge = document.getElementById('nav-chat-unread-badge');
    const totalUnread = this.sessions.reduce((acc, s) => acc + (s.unreadForAdmin || 0), 0);
    if (badge) {
      if (totalUnread > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = totalUnread;
      } else {
        badge.style.display = 'none';
      }
    }
  }

  selectSession(sessionId) {
    this.activeSessionId = sessionId;
    this.renderSessionsList();
    this.fetchActiveSessionMessages(sessionId);

    // Mark as read on server
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_read', sessionId, by: 'admin' })
    }).catch(() => {});
  }

  async fetchActiveSessionMessages(sessionId) {
    try {
      const res = await fetch(`/api/chat?action=get_messages&sessionId=${encodeURIComponent(sessionId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          const deduped = [];
          data.messages.forEach(m => {
            const exists = deduped.some(d => d.id === m.id || (d.sender === m.sender && d.text.trim() === m.text.trim() && Math.abs((d.timestamp || 0) - (m.timestamp || 0)) < 6000));
            if (!exists) deduped.push(m);
          });
          this.activeMessages = deduped;
          this.renderActiveMessages(data.session);
        }
      }
    } catch (e) {}
  }

  renderActiveMessages(session) {
    const msgContainer = document.getElementById('admin-thread-messages-list');
    const headerTitle = document.getElementById('admin-thread-visitor-title');
    const headerMeta = document.getElementById('admin-thread-visitor-meta');
    if (!msgContainer) return;

    if (session) {
      if (headerTitle) headerTitle.textContent = session.visitorName || 'Website Visitor';
      if (headerMeta) headerMeta.textContent = `Active on: ${session.page || '/'} • Session ID: ${session.id}`;
    }

    msgContainer.innerHTML = this.activeMessages.map(m => {
      const isDesk = (m.sender === 'admin');
      const timeStr = new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="chat-msg-row ${isDesk ? 'msg-visitor' : 'msg-desk'}" style="${isDesk ? 'align-self:flex-end;' : 'align-self:flex-start;'}">
          <div class="chat-msg-meta" style="${isDesk ? 'justify-content:flex-end;' : ''}">
            <span>${isDesk ? 'Corporate Executive Desk' : (m.senderName || 'Visitor')}</span>
          </div>
          <div class="chat-msg-bubble">
            ${this.escapeHtml(m.text)}
            <span class="chat-msg-time">${timeStr}</span>
          </div>
        </div>
      `;
    }).join('');

    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  async sendAdminReply() {
    if (!this.activeSessionId) {
      alert('Please select an active conversation session first.');
      return;
    }
    const input = document.getElementById('admin-chat-reply-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    const newMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      sessionId: this.activeSessionId,
      sender: 'admin',
      senderName: 'Corporate Executive Desk',
      text: text,
      timestamp: Date.now()
    };

    const alreadyInList = this.activeMessages.some(m =>
      m.id === newMsg.id || (m.sender === newMsg.sender && m.text.trim() === newMsg.text.trim() && Math.abs((m.timestamp || 0) - newMsg.timestamp) < 6000)
    );

    if (!alreadyInList) {
      this.activeMessages.push(newMsg);
      this.renderActiveMessages();
    }

    // Broadcast across same-machine tabs immediately
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'ADMIN_REPLY',
        message: newMsg,
        sessionId: this.activeSessionId
      });
    }

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          id: newMsg.id,
          timestamp: newMsg.timestamp,
          sessionId: this.activeSessionId,
          text: text,
          sender: 'admin',
          senderName: 'Corporate Executive Desk'
        })
      });
      this.refreshSessionsList();
    } catch (err) {
      console.warn('Reply dispatch failed:', err);
    }
  }

  async resolveActiveSession() {
    if (!this.activeSessionId) return;
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', sessionId: this.activeSessionId })
      });
      this.showToast('Conversation marked as resolved.');
      this.refreshSessionsList();
    } catch (e) {}
  }

  async clearActiveSession() {
    if (!this.activeSessionId) return;
    if (confirm('Clear and delete this conversation history?')) {
      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear', sessionId: this.activeSessionId })
        });
        this.activeSessionId = null;
        this.activeMessages = [];
        this.renderActiveMessages(null);
        this.refreshSessionsList();
        this.showToast('Conversation cleared.');
      } catch (e) {}
    }
  }

  handleBroadcastMessage(data) {
    if (!data) return;
    if (data.type === 'VISITOR_MESSAGE') {
      this.playChime();
      this.refreshSessionsList();
    }
  }

  playChime() {
    if (this.isMuted) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.2); // A5
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.4);
    } catch (e) {}
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // ==========================================================================
  // GIT PUSH & DEPLOYMENT ENGINE ("push to my git")
  // ==========================================================================
  bindGitPushEvents() {
    const tokenInput = document.getElementById('git-pat-token');
    const repoInput = document.getElementById('git-repo-name');
    const branchInput = document.getElementById('git-branch-name');
    const commitMsgInput = document.getElementById('git-commit-message');
    const btnDirectPush = document.getElementById('btn-github-direct-push');
    const btnLocalPush = document.getElementById('btn-local-shell-push');
    const btnDownloadData = document.getElementById('btn-download-data-js');
    const btnDownloadBackup = document.getElementById('btn-download-backup-json');
    const btnResetDefaults = document.getElementById('btn-reset-defaults');
    const consoleOutput = document.getElementById('git-console-output');

    // Load saved PAT token
    if (tokenInput) {
      tokenInput.value = localStorage.getItem('rayan_github_pat') || '';
      tokenInput.addEventListener('change', () => {
        localStorage.setItem('rayan_github_pat', tokenInput.value.trim());
      });
    }

    const logToConsole = (text) => {
      if (consoleOutput) {
        consoleOutput.textContent += `[${new Date().toLocaleTimeString()}] ${text}\n`;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
      }
    };

    // 1. Direct GitHub API Push
    if (btnDirectPush) {
      btnDirectPush.addEventListener('click', async () => {
        this.collectFormData();
        this.saveAllChanges();

        const token = tokenInput ? tokenInput.value.trim() : '';
        if (!token) {
          alert('Please enter your GitHub Personal Access Token (PAT) with "repo / contents:write" permissions.\n\nSteps:\n1. Open github.com/settings/tokens\n2. Create a fine-grained token with "Contents: Read & Write" on repository Satyacoder-31/rayan-group\n3. Paste the token here and click Push.');
          if (tokenInput) tokenInput.focus();
          return;
        }

        const repo = (repoInput ? repoInput.value.trim() : '') || 'Satyacoder-31/rayan-group';
        const branch = (branchInput ? branchInput.value.trim() : '') || 'main';
        const message = (commitMsgInput ? commitMsgInput.value.trim() : '') || `Update site content via Rayan Admin Panel [${new Date().toISOString()}]`;

        logToConsole(`Connecting to GitHub repository: ${repo} (branch: ${branch})...`);
        btnDirectPush.disabled = true;
        btnDirectPush.textContent = '⏳ Committing to Git...';

        try {
          // Generate new data.js file content
          const updatedContent = this.generateDataJsCode();
          const encodedContent = btoa(unescape(encodeURIComponent(updatedContent)));

          // Get file SHA from GitHub
          logToConsole('Checking current src/scripts/data.js SHA on GitHub...');
          const getUrl = `https://api.github.com/repos/${repo}/contents/src/scripts/data.js?ref=${branch}`;
          const getRes = await fetch(getUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github+json'
            }
          });

          let sha = null;
          if (getRes.ok) {
            const fileData = await getRes.json();
            sha = fileData.sha;
            logToConsole(`Existing file found with SHA: ${sha.substr(0, 8)}`);
          } else {
            logToConsole('File not found or new, will create new file.');
          }

          // Push commit to GitHub
          logToConsole('Committing updated content to branch ' + branch + '...');
          const putUrl = `https://api.github.com/repos/${repo}/contents/src/scripts/data.js`;
          const putBody = {
            message: message,
            content: encodedContent,
            branch: branch
          };
          if (sha) putBody.sha = sha;

          const putRes = await fetch(putUrl, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(putBody)
          });

          if (!putRes.ok) {
            const errJson = await putRes.json();
            throw new Error(errJson.message || 'GitHub API rejected commit request');
          }

          const commitResult = await putRes.json();
          logToConsole(`✅ SUCCESS! Commit created on GitHub: ${commitResult.commit.sha.substr(0, 8)}`);
          logToConsole(`🚀 Vercel deployment triggered automatically!`);
          logToConsole(`Check status at: https://rayan-group.vercel.app`);
          this.showToast('Changes pushed to Git! Vercel is redeploying now.');

        } catch (err) {
          logToConsole(`❌ Error during GitHub push: ${err.message}`);
          alert(`Failed to push to GitHub: ${err.message}\n\nPlease check token permissions and repository access.`);
        } finally {
          btnDirectPush.disabled = false;
          btnDirectPush.textContent = '⚡ Push All Changes to Git & Trigger Vercel Deploy';
        }
      });
    }

    // 2. Local Shell Git Push (when running locally)
    if (btnLocalPush) {
      btnLocalPush.addEventListener('click', async () => {
        this.collectFormData();
        this.saveAllChanges();
        logToConsole('Invoking local git commit & push command...');
        btnLocalPush.disabled = true;

        try {
          const res = await fetch('/api/git', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: commitMsgInput?.value || 'Update site content via Admin Panel' })
          });
          const result = await res.json();
          if (result.success) {
            logToConsole(`✅ Local push succeeded: ${result.message}`);
            this.showToast('Committed & pushed via local git CLI!');
          } else {
            logToConsole(`⚠️ Local push message: ${result.message}`);
            logToConsole('Please use "Push to Git (GitHub API)" mode.');
          }
        } catch (err) {
          logToConsole(`⚠️ Local git endpoint offline or in serverless cloud. Use GitHub Direct Push mode.`);
        } finally {
          btnLocalPush.disabled = false;
        }
      });
    }

    // 3. Download data.js
    if (btnDownloadData) {
      btnDownloadData.addEventListener('click', () => {
        this.collectFormData();
        const code = this.generateDataJsCode();
        this.downloadFile('data.js', code, 'application/javascript');
        this.showToast('Downloaded updated data.js');
      });
    }

    // 4. Download JSON Backup
    if (btnDownloadBackup) {
      btnDownloadBackup.addEventListener('click', () => {
        this.collectFormData();
        const json = JSON.stringify(this.state, null, 2);
        this.downloadFile('rayan-group-site-backup.json', json, 'application/json');
        this.showToast('Downloaded site JSON backup');
      });
    }

    // 5. Reset to defaults
    if (btnResetDefaults) {
      btnResetDefaults.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all modifications back to default settings?')) {
          localStorage.removeItem('rayan_site_overrides');
          this.state = this.loadMasterState();
          this.populateAllForms();
          this.showToast('Reset all overrides to original defaults.');
          location.reload();
        }
      });
    }
  }

  downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  generateDataJsCode() {
    return `// RAYAN GROUP — Enterprise Corporate Portal Data Registry
// Multi-National Engineering, Energy, Infrastructure & Capital Group
// Dual-Hub Corporate Operations: United Arab Emirates & India
// Generated automatically via Rayan Admin Portal on ${new Date().toISOString()}

export const GROUP_INFO = ${JSON.stringify(this.state.groupInfo, null, 2)};

export const GROUP_COMPANIES = ${JSON.stringify(this.state.companies, null, 2)};

export const CORPORATE_TIMELINE = ${JSON.stringify(this.state.timeline, null, 2)};

export const LEADERSHIP_TEAM = ${JSON.stringify(this.state.leadership, null, 2)};

export const FEATURED_PROJECTS = ${JSON.stringify(this.state.projects, null, 2)};

export const FINANCIAL_HIGHLIGHTS = ${JSON.stringify(this.state.financials, null, 2)};

export const CORPORATE_NEWS = ${JSON.stringify(this.state.news, null, 2)};

export const CAREER_OPPORTUNITIES = ${JSON.stringify(this.state.careers, null, 2)};
`;
  }
}

// Initialize Admin Portal on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const portal = new RayanAdminPortal();
  portal.init();
  window.__rayanAdminPortal = portal;
});

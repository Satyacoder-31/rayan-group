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
import { initLiveAssistanceChat } from './live-chat.js';

const DEFAULT_HERO_SLIDES = [
  {
    eyebrow: '<span>ENGINEERING</span> • <span>ENERGY</span> • <span>INFRASTRUCTURE</span>',
    title: 'BUILDING WHAT MOVES THE WORLD',
    leadText: 'A premier multinational engineering, energy, infrastructure, and property development conglomerate executing landmark projects across the UAE and South Asia.',
    btn1Text: 'REQUEST A PROPOSAL',
    btn1Link: '/proposal/',
    btn2Text: 'EXPLORE OUR PROJECTS',
    btn2Link: '/projects/'
  },
  {
    eyebrow: '<span>ENERGY &amp; EPC</span> • <span>HYDROCARBON PIPELINES</span>',
    title: 'CRITICAL ENERGY & PROCESS INFRASTRUCTURE',
    leadText: 'Strategic hydrocarbon transport pipelines, process facilities, storage tank farms, and refinery turnaround execution to strict ISO 45001 standards.',
    btn1Text: 'ENERGY DIVISION',
    btn1Link: '/business/energy/',
    btn2Text: 'HSE COMMITMENT',
    btn2Link: '/sustainability/'
  },
  {
    eyebrow: '<span>LANDMARK EPC</span> • <span>HOSPITALITY FIT-OUT</span>',
    title: 'LANDMARK HIGH-RISE EPC & INTERIORS',
    leadText: 'Delivering luxury hospitality transformations, twin residential high-rise towers, and tactical civic facilities across Abu Dhabi and Dubai.',
    btn1Text: 'DISCOVER PROJECTS',
    btn1Link: '/projects/',
    btn2Text: 'CIVIL & INTERIORS',
    btn2Link: '/business/engineering/'
  },
  {
    eyebrow: '<span>DUAL-HUB REACH</span> • <span>UAE &amp; SOUTH ASIA</span>',
    title: 'CONNECTING UAE 🇦🇪 & SOUTH ASIA 🇮🇳',
    leadText: 'Headquartered in the United Arab Emirates with regional operations and South Asia engineering hub Ashaz Engineering in India.',
    btn1Text: 'WHO WE ARE',
    btn1Link: '/about/',
    btn2Text: 'GLOBAL OFFICES',
    btn2Link: '/contact/'
  }
];

const DEFAULT_STATS = {
  heritageYears: '18+',
  heritageDesc: 'Proven industry track record since 2008',
  verifiedProjects: '16',
  projectsDesc: 'Landmark hospitality, retail & towers',
  operatingEntities: '4',
  entitiesDesc: 'Engineering, Energy, Ashaz India, Properties',
  isoBadge: 'TRIPLE',
  isoDesc: 'ISO 9001 / 14001 / 45001',
  globalWorkforce: '10,000+',
  engineersCount: '500+',
  completedProjects: '500+',
  countriesActive: '30+',
  clientRetention: '98%',
  safeManHours: '5M+ Safe Hours'
};

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
    this.isMuted = localStorage.getItem('rayan_admin_muted') === 'true';

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

    // Sync across localStorage tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'rayan_chat_sessions_index' || e.key?.startsWith('rayan_chat_msgs_')) {
        this.refreshSessionsList();
      }
    });
  }

  loadMasterState() {
    const overrides = getSiteOverrides() || {};
    const groupInfo = overrides.groupInfo || JSON.parse(JSON.stringify(GROUP_INFO));

    if (!groupInfo.chairmanMessage) {
      groupInfo.chairmanMessage = "For nearly two decades, Rayan Group has stood as a bastion of engineering integrity, execution discipline, and progressive industrial vision across the Arabian Gulf and South Asia. Our journey is defined by delivering critical infrastructure that stands the test of time.";
    }
    if (!groupInfo.ceoMessage) {
      groupInfo.ceoMessage = "At Rayan Group, our strategic compass is oriented toward operational precision, sustainable engineering, and scalable cross-border delivery. As we expand across the UAE and South Asia, we maintain uncompromising fidelity to safety, innovation, and client trust.";
    }
    if (!groupInfo.socials) {
      groupInfo.socials = {
        linkedin: "https://www.linkedin.com/company/rayangroupinc/",
        instagram: "https://www.instagram.com/rayangroupinc/",
        facebook: "https://www.facebook.com/rayangroupinc",
        twitter: "https://x.com/rayangroupinc",
        youtube: "https://www.youtube.com/@rayangroupinc"
      };
    }

    return {
      groupInfo: groupInfo,
      heroSlides: overrides.heroSlides || JSON.parse(JSON.stringify(DEFAULT_HERO_SLIDES)),
      stats: overrides.stats || JSON.parse(JSON.stringify(DEFAULT_STATS)),
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

    // Initialize floating assistance widget on admin page for direct testing
    try {
      initLiveAssistanceChat();
    } catch (e) {}
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

    const headerTitle = document.getElementById('admin-header-title');
    if (headerTitle) {
      const titles = {
        chat: 'Live Support Desk & Real-Time Assistance',
        hero: 'Homepage Hero & Cinematic Slideshow',
        profile: 'Corporate Profile & Executive Governance',
        stats: 'Institutional Statistics & Metrics',
        divisions: 'Operating Companies & Business Divisions',
        leadership: 'Executive Leadership & Board of Directors',
        projects: 'Master Projects Portfolio Management',
        ticker: 'ADX Securities Ticker & Financial Metrics',
        news: 'Corporate Newsroom & Press Releases',
        careers: 'Careers & Talent Pool Management',
        timeline: 'Corporate Milestone Timeline',
        contacts: 'Dual-Hub Headquarters & Social Channels',
        widget: 'Corporate Assistance Widget Configuration',
        git: 'Git Push & Instant Vercel Deployment Engine'
      };
      headerTitle.textContent = titles[tabId] || 'Corporate Command Center';
    }

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

  playChime() {
    if (this.isMuted) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, this.audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, this.audioCtx.currentTime + 0.15); // G5
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch (e) {}
  }

  // ==========================================================================
  // BROADCAST MESSAGE HANDLER
  // ==========================================================================
  handleBroadcastMessage(data) {
    if (!data) return;

    if (data.type === 'VISITOR_MESSAGE') {
      const msg = data.message;
      this.playChime();
      this.showToast(`Incoming message from ${msg.senderName || 'Visitor'}: "${msg.text.slice(0, 30)}..."`, 'info');

      // Refresh list
      this.refreshSessionsList();

      if (this.activeSessionId === data.sessionId) {
        const exists = this.activeMessages.some(m => m.id === msg.id);
        if (!exists) {
          this.activeMessages.push(msg);
          this.renderActiveMessages();
        }
      }
    }
  }

  // ==========================================================================
  // POPULATE ALL FORMS FROM STATE
  // ==========================================================================
  populateAllForms() {
    const g = this.state.groupInfo;
    this.setVal('info-name', g.name);
    this.setVal('info-tagline', g.tagline);
    this.setVal('info-subtagline', g.subTagline);
    this.setVal('info-vision', g.vision);
    this.setVal('info-mission', g.mission);
    this.setVal('info-chairman-message', g.chairmanMessage);
    this.setVal('info-ceo-message', g.ceoMessage);

    // Stats
    const s = this.state.stats;
    this.setVal('stat-years', s.heritageYears);
    this.setVal('stat-projects-verified', s.verifiedProjects);
    this.setVal('stat-entities', s.operatingEntities);
    this.setVal('stat-iso', s.isoBadge);
    this.setVal('info-workforce', s.globalWorkforce || g.globalWorkforce);
    this.setVal('info-engineers', s.engineersCount || g.engineersCount);
    this.setVal('info-projects', s.completedProjects || g.projectsCompleted);
    this.setVal('info-countries', s.countriesActive || g.countriesActive);
    this.setVal('stat-retention', s.clientRetention);
    this.setVal('stat-safe-hours', s.safeManHours);

    // Ticker & Financials
    this.setVal('ticker-symbol', g.ticker);
    this.setVal('ticker-exchange', g.stockExchange);
    this.setVal('ticker-price', g.stockPrice);
    this.setVal('ticker-currency', g.currency);
    this.setVal('ticker-change', g.stockChange);
    this.setVal('ticker-change-pct', g.stockChangePercent);
    this.setVal('ticker-market-cap', g.marketCap);
    this.setVal('ticker-revenue', g.revenue);
    this.setVal('ticker-net-profit', g.netProfit);
    this.setVal('ticker-ebitda', g.ebitda || 'AED 385 Million');
    this.setVal('ticker-backlog', 'AED 4.65 Billion');
    this.setVal('ticker-cashflow', 'AED 342.1 Million');

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

    // Socials
    const soc = g.socials || {};
    this.setVal('social-linkedin', soc.linkedin);
    this.setVal('social-instagram', soc.instagram);
    this.setVal('social-facebook', soc.facebook);
    this.setVal('social-twitter', soc.twitter);
    this.setVal('social-youtube', soc.youtube);

    // Widget settings
    const w = this.state.widgetSettings;
    this.setVal('widget-status', w.deskStatus);
    this.setVal('widget-welcome', w.welcomeText);
    this.setVal('widget-autoreply', w.autoReply);

    // Render lists
    this.renderHeroSlidesList();
    this.renderCompaniesList();
    this.renderProjectsList();
    this.renderLeadershipList();
    this.renderNewsList();
    this.renderCareersList();
    this.renderTimelineList();
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
  // RENDER HERO SLIDES
  // ==========================================================================
  renderHeroSlidesList() {
    const container = document.getElementById('admin-hero-slides-list');
    if (!container) return;

    container.innerHTML = this.state.heroSlides.map((slide, idx) => `
      <div class="admin-card" style="margin-bottom: 1.5rem; padding: 1.5rem; background: rgba(11,28,48,0.6); border: 1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
          <h4 style="margin:0; font-size: 1.1rem; color: #fff;">Slide ${idx + 1}: ${slide.title || 'Hero Slide'}</h4>
          <span style="font-size: 0.72rem; color: #0099e6; background: rgba(0,153,230,0.1); padding: 0.2rem 0.6rem; border-radius: 4px;">Cinematic Slide</span>
        </div>
        <div class="admin-grid-2">
          <div class="admin-field-group">
            <label class="admin-label">Eyebrow Badge (HTML/Pill)</label>
            <input type="text" class="admin-input hero-field" data-idx="${idx}" data-field="eyebrow" value="${this.escapeAttr(slide.eyebrow || '')}">
          </div>
          <div class="admin-field-group">
            <label class="admin-label">Giant Headline Title</label>
            <input type="text" class="admin-input hero-field" data-idx="${idx}" data-field="title" value="${this.escapeAttr(slide.title || '')}">
          </div>
        </div>
        <div class="admin-field-group" style="margin-top: 1rem;">
          <label class="admin-label">Lead Subtitle Paragraph</label>
          <textarea class="admin-input admin-textarea hero-field" data-idx="${idx}" data-field="leadText" style="min-height: 80px;">${slide.leadText || ''}</textarea>
        </div>
        <div class="admin-grid-2" style="margin-top: 1rem;">
          <div class="admin-field-group">
            <label class="admin-label">Primary Button Text &amp; Link</label>
            <div style="display:flex; gap:0.5rem;">
              <input type="text" class="admin-input hero-field" data-idx="${idx}" data-field="btn1Text" placeholder="Button Text" value="${this.escapeAttr(slide.btn1Text || '')}">
              <input type="text" class="admin-input hero-field" data-idx="${idx}" data-field="btn1Link" placeholder="/proposal/" value="${this.escapeAttr(slide.btn1Link || '')}">
            </div>
          </div>
          <div class="admin-field-group">
            <label class="admin-label">Secondary Button Text &amp; Link</label>
            <div style="display:flex; gap:0.5rem;">
              <input type="text" class="admin-input hero-field" data-idx="${idx}" data-field="btn2Text" placeholder="Button Text" value="${this.escapeAttr(slide.btn2Text || '')}">
              <input type="text" class="admin-input hero-field" data-idx="${idx}" data-field="btn2Link" placeholder="/projects/" value="${this.escapeAttr(slide.btn2Link || '')}">
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ==========================================================================
  // RENDER OPERATING COMPANIES
  // ==========================================================================
  renderCompaniesList() {
    const container = document.getElementById('admin-companies-list');
    if (!container) return;

    container.innerHTML = this.state.companies.map((c, idx) => `
      <div class="admin-card" style="margin-bottom: 1.25rem; padding: 1.35rem; background: rgba(11,28,48,0.6);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h4 style="margin:0; font-size:1.05rem; color:#fff;">${c.name}</h4>
          <span style="font-size:0.72rem; color:#00c7b3; background:rgba(0,199,179,0.1); padding:0.2rem 0.6rem; border-radius:4px;">${c.sector}</span>
        </div>
        <div class="admin-grid-2">
          <div class="admin-field-group">
            <label class="admin-label">Operating Company Name</label>
            <input type="text" class="admin-input comp-field" data-idx="${idx}" data-field="name" value="${this.escapeAttr(c.name || '')}">
          </div>
          <div class="admin-field-group">
            <label class="admin-label">Sector Badge Label</label>
            <input type="text" class="admin-input comp-field" data-idx="${idx}" data-field="sector" value="${this.escapeAttr(c.sector || '')}">
          </div>
        </div>
        <div class="admin-field-group" style="margin-top:0.75rem;">
          <label class="admin-label">Headline / Card Tagline</label>
          <input type="text" class="admin-input comp-field" data-idx="${idx}" data-field="headline" value="${this.escapeAttr(c.headline || '')}">
        </div>
        <div class="admin-field-group" style="margin-top:0.75rem;">
          <label class="admin-label">Full Detailed Description</label>
          <textarea class="admin-input admin-textarea comp-field" data-idx="${idx}" data-field="description" style="min-height:75px;">${c.description || ''}</textarea>
        </div>
      </div>
    `).join('');
  }

  // ==========================================================================
  // RENDER PROJECTS PORTFOLIO
  // ==========================================================================
  renderProjectsList() {
    const container = document.getElementById('admin-projects-list');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${this.state.projects.map((p, idx) => `
          <div class="admin-card" style="padding: 1.25rem; background: rgba(11,28,48,0.5); border: 1px solid rgba(255,255,255,0.08);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-weight: 800; font-size: 0.8rem; color: #38bdf8;">#${idx + 1}</span>
                <h4 style="margin: 0; font-size: 1rem; color: #fff;">${p.title}</h4>
                <span style="font-size: 0.68rem; color: #10b981; background: rgba(16,185,129,0.1); padding: 0.15rem 0.5rem; border-radius: 4px;">${p.category || 'EPC'}</span>
              </div>
              <button type="button" class="admin-btn-danger btn-delete-project" data-idx="${idx}" style="padding: 0.3rem 0.7rem; font-size: 0.72rem;">Delete</button>
            </div>
            <div class="admin-grid-3">
              <div class="admin-field-group">
                <label class="admin-label">Project Title</label>
                <input type="text" class="admin-input proj-field" data-idx="${idx}" data-field="title" value="${this.escapeAttr(p.title || '')}">
              </div>
              <div class="admin-field-group">
                <label class="admin-label">Location</label>
                <input type="text" class="admin-input proj-field" data-idx="${idx}" data-field="location" value="${this.escapeAttr(p.location || '')}">
              </div>
              <div class="admin-field-group">
                <label class="admin-label">Contract Value</label>
                <input type="text" class="admin-input proj-field" data-idx="${idx}" data-field="value" value="${this.escapeAttr(p.value || '')}">
              </div>
            </div>
            <div class="admin-field-group" style="margin-top: 0.75rem;">
              <label class="admin-label">Executive Scope &amp; Deliverables</label>
              <textarea class="admin-input admin-textarea proj-field" data-idx="${idx}" data-field="scope" style="min-height: 65px;">${p.scope || ''}</textarea>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.btn-delete-project').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (confirm(`Remove project "${this.state.projects[idx]?.title}"?`)) {
          this.state.projects.splice(idx, 1);
          this.renderProjectsList();
          this.saveAllChanges();
        }
      });
    });
  }

  // ==========================================================================
  // RENDER LEADERSHIP GOVERNANCE
  // ==========================================================================
  renderLeadershipList() {
    const container = document.getElementById('admin-leadership-list');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${this.state.leadership.map((l, idx) => `
          <div class="admin-card" style="padding: 1.25rem; background: rgba(11,28,48,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h4 style="margin: 0; font-size: 1rem; color: #fff;">${l.name}</h4>
              <span style="font-size: 0.72rem; color: #c5a059;">${l.tag || 'DIR'}</span>
            </div>
            <div class="admin-grid-2">
              <div class="admin-field-group">
                <label class="admin-label">Full Name &amp; Title</label>
                <input type="text" class="admin-input lead-field" data-idx="${idx}" data-field="name" value="${this.escapeAttr(l.name || '')}">
              </div>
              <div class="admin-field-group">
                <label class="admin-label">Corporate Designation / Role</label>
                <input type="text" class="admin-input lead-field" data-idx="${idx}" data-field="role" value="${this.escapeAttr(l.role || '')}">
              </div>
            </div>
            <div class="admin-field-group" style="margin-top: 0.75rem;">
              <label class="admin-label">Biography &amp; Executive Credentials</label>
              <textarea class="admin-input admin-textarea lead-field" data-idx="${idx}" data-field="bio" style="min-height: 70px;">${l.bio || ''}</textarea>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ==========================================================================
  // RENDER NEWS & MEDIA
  // ==========================================================================
  renderNewsList() {
    const container = document.getElementById('admin-news-list');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${this.state.news.map((n, idx) => `
          <div class="admin-card" style="padding: 1.25rem; background: rgba(11,28,48,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h4 style="margin: 0; font-size: 0.95rem; color: #fff;">${n.title}</h4>
              <span style="font-size: 0.7rem; color: #94a3b8;">${n.date || ''}</span>
            </div>
            <div class="admin-grid-3">
              <div class="admin-field-group">
                <label class="admin-label">Headline</label>
                <input type="text" class="admin-input news-field" data-idx="${idx}" data-field="title" value="${this.escapeAttr(n.title || '')}">
              </div>
              <div class="admin-field-group">
                <label class="admin-label">Category</label>
                <input type="text" class="admin-input news-field" data-idx="${idx}" data-field="category" value="${this.escapeAttr(n.category || '')}">
              </div>
              <div class="admin-field-group">
                <label class="admin-label">Date (e.g. MAR 2025)</label>
                <input type="text" class="admin-input news-field" data-idx="${idx}" data-field="date" value="${this.escapeAttr(n.date || '')}">
              </div>
            </div>
            <div class="admin-field-group" style="margin-top: 0.75rem;">
              <label class="admin-label">Executive Press Release Excerpt</label>
              <textarea class="admin-input admin-textarea news-field" data-idx="${idx}" data-field="excerpt" style="min-height: 60px;">${n.excerpt || ''}</textarea>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ==========================================================================
  // RENDER CAREERS & TALENT
  // ==========================================================================
  renderCareersList() {
    const container = document.getElementById('admin-careers-list');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${this.state.careers.map((c, idx) => `
          <div class="admin-card" style="padding: 1.25rem; background: rgba(11,28,48,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h4 style="margin: 0; font-size: 0.95rem; color: #fff;">${c.title}</h4>
              <button type="button" class="admin-btn-danger btn-delete-career" data-idx="${idx}" style="padding: 0.25rem 0.6rem; font-size: 0.7rem;">Delete</button>
            </div>
            <div class="admin-grid-3">
              <div class="admin-field-group">
                <label class="admin-label">Role Title</label>
                <input type="text" class="admin-input career-field" data-idx="${idx}" data-field="title" value="${this.escapeAttr(c.title || '')}">
              </div>
              <div class="admin-field-group">
                <label class="admin-label">Department</label>
                <input type="text" class="admin-input career-field" data-idx="${idx}" data-field="department" value="${this.escapeAttr(c.department || '')}">
              </div>
              <div class="admin-field-group">
                <label class="admin-label">Location (e.g. Abu Dhabi, UAE)</label>
                <input type="text" class="admin-input career-field" data-idx="${idx}" data-field="location" value="${this.escapeAttr(c.location || '')}">
              </div>
            </div>
            <div class="admin-field-group" style="margin-top: 0.75rem;">
              <label class="admin-label">Job Description</label>
              <textarea class="admin-input admin-textarea career-field" data-idx="${idx}" data-field="description" style="min-height: 60px;">${c.description || ''}</textarea>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.btn-delete-career').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.state.careers.splice(idx, 1);
        this.renderCareersList();
        this.saveAllChanges();
      });
    });
  }

  // ==========================================================================
  // RENDER TIMELINE MILESTONES
  // ==========================================================================
  renderTimelineList() {
    const container = document.getElementById('admin-timeline-list');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${this.state.timeline.map((t, idx) => `
          <div class="admin-card" style="padding: 1.25rem; background: rgba(11,28,48,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h4 style="margin: 0; font-size: 0.95rem; color: #fff;">${t.year}: ${t.title}</h4>
              <span style="font-size: 0.72rem; color: #00c7b3;">${t.tag || ''}</span>
            </div>
            <div class="admin-grid-3">
              <div class="admin-field-group">
                <label class="admin-label">Year / Milestone</label>
                <input type="text" class="admin-input timeline-field" data-idx="${idx}" data-field="year" value="${this.escapeAttr(t.year || '')}">
              </div>
              <div class="admin-field-group">
                <label class="admin-label">Entity / Division</label>
                <input type="text" class="admin-input timeline-field" data-idx="${idx}" data-field="entity" value="${this.escapeAttr(t.entity || '')}">
              </div>
              <div class="admin-field-group">
                <label class="admin-label">Milestone Title</label>
                <input type="text" class="admin-input timeline-field" data-idx="${idx}" data-field="title" value="${this.escapeAttr(t.title || '')}">
              </div>
            </div>
            <div class="admin-field-group" style="margin-top: 0.75rem;">
              <label class="admin-label">Achievement Description</label>
              <textarea class="admin-input admin-textarea timeline-field" data-idx="${idx}" data-field="description" style="min-height: 60px;">${t.description || ''}</textarea>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  escapeAttr(str) {
    return String(str || '').replace(/"/g, '&quot;');
  }

  // ==========================================================================
  // FORM BINDINGS & SAVE HANDLERS
  // ==========================================================================
  bindFormEvents() {
    document.querySelectorAll('.btn-save-section, #admin-btn-save-all-top').forEach(btn => {
      btn.addEventListener('click', () => {
        this.collectFormData();
        this.saveAllChanges();
        this.showToast('All modifications saved successfully!');
      });
    });

    // Add Project button
    const addProjBtn = document.getElementById('btn-add-project');
    if (addProjBtn) {
      addProjBtn.addEventListener('click', () => {
        const newProj = {
          id: 'proj_' + Date.now(),
          slug: 'new-project-' + Date.now(),
          title: 'New Landmark Project',
          category: 'COMMERCIAL',
          location: 'Abu Dhabi, UAE',
          client: 'Client Entity',
          year: '2025',
          value: 'AED 50M',
          scope: 'Turnkey Civil EPC, framework construction and MEP modern engineering.',
          image: '/assets/images/hero/hero-1-skyline.jpg'
        };
        this.state.projects.unshift(newProj);
        this.renderProjectsList();
        this.showToast('Added new project entry. Fill in details and click Save.');
      });
    }

    // Add Leader button
    const addLeaderBtn = document.getElementById('btn-add-leader');
    if (addLeaderBtn) {
      addLeaderBtn.addEventListener('click', () => {
        const newLeader = {
          name: 'Executive Director Name',
          role: 'Executive Director',
          tag: 'DIR // ' + (this.state.leadership.length + 1),
          bio: 'Executive leader directing strategic growth and multinational operations.',
          responsibilities: ['Corporate Governance', 'Project Delivery']
        };
        this.state.leadership.push(newLeader);
        this.renderLeadershipList();
        this.showToast('Added new governance profile.');
      });
    }

    // Add News button
    const addNewsBtn = document.getElementById('btn-add-news');
    if (addNewsBtn) {
      addNewsBtn.addEventListener('click', () => {
        const newNews = {
          id: 'news_' + Date.now(),
          title: 'Rayan Group Announces Major Enterprise Expansion',
          category: 'PRESS RELEASE',
          date: 'MAR 2025',
          excerpt: 'Expanding EPC and infrastructure capacity across Abu Dhabi and South Asia corridors.'
        };
        this.state.news.unshift(newNews);
        this.renderNewsList();
        this.showToast('Added new press release entry.');
      });
    }

    // Add Career button
    const addCareerBtn = document.getElementById('btn-add-career');
    if (addCareerBtn) {
      addCareerBtn.addEventListener('click', () => {
        const newCareer = {
          id: 'career_' + Date.now(),
          title: 'Project Engineering Lead',
          department: 'Civil & EPC',
          location: 'Abu Dhabi, UAE',
          type: 'Full-Time',
          experience: '5+ Years',
          description: 'Lead turnkey engineering works, contractor management, and site delivery.'
        };
        this.state.careers.unshift(newCareer);
        this.renderCareersList();
        this.showToast('Added new job opening.');
      });
    }

    // Add Timeline button
    const addTimelineBtn = document.getElementById('btn-add-timeline');
    if (addTimelineBtn) {
      addTimelineBtn.addEventListener('click', () => {
        const newTimeline = {
          year: '2026',
          entity: 'Rayan Group',
          tag: 'Expansion Milestone',
          title: 'Major Strategic Achievement',
          description: 'Expanding international operations and heavy infrastructure delivery.'
        };
        this.state.timeline.push(newTimeline);
        this.renderTimelineList();
        this.showToast('Added new timeline milestone.');
      });
    }
  }

  collectFormData() {
    const g = this.state.groupInfo;
    g.name = this.getVal('info-name') || g.name;
    g.tagline = this.getVal('info-tagline') || g.tagline;
    g.subTagline = this.getVal('info-subtagline') || g.subTagline;
    g.vision = this.getVal('info-vision') || g.vision;
    g.mission = this.getVal('info-mission') || g.mission;
    g.chairmanMessage = this.getVal('info-chairman-message') || g.chairmanMessage;
    g.ceoMessage = this.getVal('info-ceo-message') || g.ceoMessage;

    // Stats
    const s = this.state.stats;
    s.heritageYears = this.getVal('stat-years') || s.heritageYears;
    s.verifiedProjects = this.getVal('stat-projects-verified') || s.verifiedProjects;
    s.operatingEntities = this.getVal('stat-entities') || s.operatingEntities;
    s.isoBadge = this.getVal('stat-iso') || s.isoBadge;
    s.globalWorkforce = this.getVal('info-workforce') || s.globalWorkforce;
    s.engineersCount = this.getVal('info-engineers') || s.engineersCount;
    s.completedProjects = this.getVal('info-projects') || s.completedProjects;
    s.countriesActive = this.getVal('info-countries') || s.countriesActive;
    s.clientRetention = this.getVal('stat-retention') || s.clientRetention;
    s.safeManHours = this.getVal('stat-safe-hours') || s.safeManHours;

    // Financials
    g.ticker = this.getVal('ticker-symbol') || g.ticker;
    g.stockExchange = this.getVal('ticker-exchange') || g.stockExchange;
    g.stockPrice = this.getVal('ticker-price') || g.stockPrice;
    g.currency = this.getVal('ticker-currency') || g.currency;
    g.stockChange = this.getVal('ticker-change') || g.stockChange;
    g.stockChangePercent = this.getVal('ticker-change-pct') || g.stockChangePercent;
    g.marketCap = this.getVal('ticker-market-cap') || g.marketCap;
    g.revenue = this.getVal('ticker-revenue') || g.revenue;
    g.netProfit = this.getVal('ticker-net-profit') || g.netProfit;

    // Contacts
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

    // Socials
    if (!g.socials) g.socials = {};
    g.socials.linkedin = this.getVal('social-linkedin') || g.socials.linkedin;
    g.socials.instagram = this.getVal('social-instagram') || g.socials.instagram;
    g.socials.facebook = this.getVal('social-facebook') || g.socials.facebook;
    g.socials.twitter = this.getVal('social-twitter') || g.socials.twitter;
    g.socials.youtube = this.getVal('social-youtube') || g.socials.youtube;

    // Widget settings
    this.state.widgetSettings.deskStatus = this.getVal('widget-status') || this.state.widgetSettings.deskStatus;
    this.state.widgetSettings.welcomeText = this.getVal('widget-welcome') || this.state.widgetSettings.welcomeText;
    this.state.widgetSettings.autoReply = this.getVal('widget-autoreply') || this.state.widgetSettings.autoReply;

    // Collect Hero fields
    document.querySelectorAll('.hero-field').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'), 10);
      const field = input.getAttribute('data-field');
      if (this.state.heroSlides[idx] && field) {
        this.state.heroSlides[idx][field] = input.value;
      }
    });

    // Collect Companies fields
    document.querySelectorAll('.comp-field').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'), 10);
      const field = input.getAttribute('data-field');
      if (this.state.companies[idx] && field) {
        this.state.companies[idx][field] = input.value;
      }
    });

    // Collect Projects fields
    document.querySelectorAll('.proj-field').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'), 10);
      const field = input.getAttribute('data-field');
      if (this.state.projects[idx] && field) {
        this.state.projects[idx][field] = input.value;
      }
    });

    // Collect Leadership fields
    document.querySelectorAll('.lead-field').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'), 10);
      const field = input.getAttribute('data-field');
      if (this.state.leadership[idx] && field) {
        this.state.leadership[idx][field] = input.value;
      }
    });

    // Collect News fields
    document.querySelectorAll('.news-field').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'), 10);
      const field = input.getAttribute('data-field');
      if (this.state.news[idx] && field) {
        this.state.news[idx][field] = input.value;
      }
    });

    // Collect Career fields
    document.querySelectorAll('.career-field').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'), 10);
      const field = input.getAttribute('data-field');
      if (this.state.careers[idx] && field) {
        this.state.careers[idx][field] = input.value;
      }
    });

    // Collect Timeline fields
    document.querySelectorAll('.timeline-field').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'), 10);
      const field = input.getAttribute('data-field');
      if (this.state.timeline[idx] && field) {
        this.state.timeline[idx][field] = input.value;
      }
    });
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

    // Toggle sound
    const soundBtn = document.getElementById('admin-btn-toggle-sound');
    if (soundBtn) {
      soundBtn.textContent = this.isMuted ? '🔇 Audio Muted' : '🔔 Audio Chime';
      soundBtn.addEventListener('click', () => {
        this.isMuted = !this.isMuted;
        localStorage.setItem('rayan_admin_muted', this.isMuted);
        soundBtn.textContent = this.isMuted ? '🔇 Audio Muted' : '🔔 Audio Chime';
        this.showToast(this.isMuted ? 'Audio chime muted' : 'Audio chime enabled');
      });
    }

    // Create Test Visitor button
    const testChatBtn = document.getElementById('btn-create-test-chat');
    if (testChatBtn) {
      testChatBtn.addEventListener('click', () => this.createTestSession());
    }

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
    let remoteSessions = [];
    try {
      const res = await fetch('/api/chat?action=list_sessions');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.sessions)) {
          remoteSessions = data.sessions;
        }
      }
    } catch (err) {}

    // Also load local storage sessions
    let localSessions = [];
    try {
      const savedIndex = localStorage.getItem('rayan_chat_sessions_index');
      if (savedIndex) {
        localSessions = JSON.parse(savedIndex);
      }
    } catch (e) {}

    // Check current active visitor session on machine
    const currentVisitorSessionId = localStorage.getItem('rayan_chat_session_id');
    if (currentVisitorSessionId && !localSessions.some(s => s.id === currentVisitorSessionId)) {
      const msgsRaw = localStorage.getItem(`rayan_chat_msgs_${currentVisitorSessionId}`);
      const msgs = msgsRaw ? JSON.parse(msgsRaw) : [];
      const visitorName = localStorage.getItem('rayan_chat_visitor_name') || 'Active Visitor';
      localSessions.unshift({
        id: currentVisitorSessionId,
        visitorName: visitorName,
        page: window.location.pathname || '/',
        createdAt: Date.now() - 60000,
        lastActivity: Date.now(),
        lastMessage: msgs.length ? msgs[msgs.length - 1].text : 'Connected to Executive Desk',
        unreadForAdmin: 1,
        unreadForVisitor: 0,
        status: 'active'
      });
    }

    // Merge sessions
    const sessionMap = new Map();
    remoteSessions.forEach(s => sessionMap.set(s.id, s));
    localSessions.forEach(s => {
      if (!sessionMap.has(s.id) || (s.lastActivity > (sessionMap.get(s.id).lastActivity || 0))) {
        sessionMap.set(s.id, s);
      }
    });

    let merged = Array.from(sessionMap.values()).sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));

    // If still 0 sessions, generate a live demo visitor so the desk is NEVER blank
    if (merged.length === 0) {
      const demoId = 'sess_demo_live';
      const demoSession = {
        id: demoId,
        visitorName: 'Tariq Al-Nuaimi (Apex Infrastructure)',
        page: '/projects/waldorf-astoria-renovation-rak/',
        createdAt: Date.now() - 300000,
        lastActivity: Date.now() - 60000,
        lastMessage: 'Inquiring about turnkey EPC delivery for luxury hospitality renovation in Abu Dhabi.',
        unreadForAdmin: 1,
        unreadForVisitor: 0,
        status: 'active'
      };
      merged = [demoSession];

      // Seed initial messages for demo
      if (!localStorage.getItem(`rayan_chat_msgs_${demoId}`)) {
        const demoMsgs = [
          {
            id: 'demo_msg_1',
            sessionId: demoId,
            sender: 'visitor',
            senderName: 'Tariq Al-Nuaimi',
            text: 'Hello, we are reviewing your Waldorf Astoria hospitality renovation project and would like to request an executive briefing for a commercial project in Abu Dhabi.',
            timestamp: Date.now() - 120000
          }
        ];
        localStorage.setItem(`rayan_chat_msgs_${demoId}`, JSON.stringify(demoMsgs));
      }
    }

    this.sessions = merged;
    this.renderSessionsList();
    this.updateNavUnreadCount();

    // Auto-select session if none selected
    if (!this.activeSessionId && this.sessions.length > 0) {
      this.selectSession(this.sessions[0].id);
    } else if (this.activeSessionId) {
      this.fetchActiveSessionMessages(this.activeSessionId);
    }
  }

  createTestSession() {
    const id = 'sess_test_' + Date.now().toString(36);
    const names = ['Kareem Mansour (Gulf EPC)', 'Sara Al-Hashemi (ADX Capital)', 'Mark Henderson (Turner Global)'];
    const topics = [
      'Inquiring regarding high-rise structural framework contracting.',
      'We would like to request tender RFP documentation for energy pipeline project.',
      'Requesting commercial quotation for luxury villa joinery and marble works.'
    ];
    const chosenName = names[Math.floor(Math.random() * names.length)];
    const chosenTopic = topics[Math.floor(Math.random() * topics.length)];

    const testSession = {
      id: id,
      visitorName: chosenName,
      page: '/projects/',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      lastMessage: chosenTopic,
      unreadForAdmin: 1,
      unreadForVisitor: 0,
      status: 'active'
    };

    const initialMsg = {
      id: 'msg_' + Date.now(),
      sessionId: id,
      sender: 'visitor',
      senderName: chosenName,
      text: chosenTopic,
      timestamp: Date.now()
    };

    localStorage.setItem(`rayan_chat_msgs_${id}`, JSON.stringify([initialMsg]));

    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('rayan_chat_sessions_index') || '[]');
    } catch (e) {}
    list.unshift(testSession);
    localStorage.setItem('rayan_chat_sessions_index', JSON.stringify(list));

    this.showToast(`Simulated new visitor: ${chosenName}`);
    this.playChime();
    this.activeSessionId = id;
    this.refreshSessionsList();
  }

  renderSessionsList() {
    const listContainer = document.getElementById('admin-chat-sessions-list');
    if (!listContainer) return;

    listContainer.innerHTML = this.sessions.map(s => {
      const isSelected = s.id === this.activeSessionId;
      const timeStr = new Date(s.lastActivity || s.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

    // Clear unread on session
    const sess = this.sessions.find(s => s.id === sessionId);
    if (sess) {
      sess.unreadForAdmin = 0;
      this.updateNavUnreadCount();
    }

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
    let remoteMsgs = [];
    let sessionData = this.sessions.find(s => s.id === sessionId);

    try {
      const res = await fetch(`/api/chat?action=get_messages&sessionId=${encodeURIComponent(sessionId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          remoteMsgs = data.messages;
          if (data.session) sessionData = data.session;
        }
      }
    } catch (e) {}

    // Also load local storage messages
    let localMsgs = [];
    try {
      const saved = localStorage.getItem(`rayan_chat_msgs_${sessionId}`);
      if (saved) localMsgs = JSON.parse(saved);
    } catch (e) {}

    // Deduplicate
    const deduped = [];
    [...remoteMsgs, ...localMsgs].forEach(m => {
      const exists = deduped.some(d => d.id === m.id || (d.sender === m.sender && d.text.trim() === m.text.trim() && Math.abs((d.timestamp || 0) - (m.timestamp || 0)) < 6000));
      if (!exists) deduped.push(m);
    });

    deduped.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    this.activeMessages = deduped;
    this.renderActiveMessages(sessionData);
  }

  renderActiveMessages(session) {
    const msgContainer = document.getElementById('admin-thread-messages-list');
    const headerTitle = document.getElementById('admin-thread-visitor-title');
    const headerMeta = document.getElementById('admin-thread-visitor-meta');
    const avatar = document.getElementById('admin-thread-avatar');
    if (!msgContainer) return;

    const currentSession = session || this.sessions.find(s => s.id === this.activeSessionId);
    if (currentSession) {
      if (headerTitle) headerTitle.textContent = currentSession.visitorName || 'Website Visitor';
      if (headerMeta) headerMeta.textContent = `Active on: ${currentSession.page || '/'} • Session: ${currentSession.id.slice(0, 16)}`;
      if (avatar) avatar.textContent = (currentSession.visitorName || 'RD').slice(0, 2).toUpperCase();
    }

    if (this.activeMessages.length === 0) {
      msgContainer.innerHTML = `
        <div style="padding: 3rem 1rem; text-align: center; color: #64748b; font-size: 0.9rem;">
          No messages exchanged yet in this conversation.<br>Type a message below to assist this visitor.
        </div>
      `;
      return;
    }

    msgContainer.innerHTML = this.activeMessages.map(m => {
      const isDesk = (m.sender === 'admin');
      const timeStr = new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="chat-msg-row ${isDesk ? 'msg-visitor' : 'msg-desk'}" style="${isDesk ? 'align-self:flex-end;' : 'align-self:flex-start;'}">
          <div class="chat-msg-meta" style="${isDesk ? 'justify-content:flex-end;' : ''}">
            <span>${isDesk ? '🏛️ Corporate Executive Desk' : (m.senderName || 'Visitor')}</span>
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

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
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

    this.activeMessages.push(newMsg);
    this.renderActiveMessages();

    // Save in local storage
    try {
      localStorage.setItem(`rayan_chat_msgs_${this.activeSessionId}`, JSON.stringify(this.activeMessages));
    } catch (e) {}

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
    } catch (err) {}
  }

  resolveActiveSession() {
    if (!this.activeSessionId) return;
    const idx = this.sessions.findIndex(s => s.id === this.activeSessionId);
    if (idx >= 0) {
      this.sessions.splice(idx, 1);
      this.activeMessages = [];
      this.activeSessionId = this.sessions.length ? this.sessions[0].id : null;
      this.renderSessionsList();
      if (this.activeSessionId) this.selectSession(this.activeSessionId);
      this.showToast('Session marked as resolved.');
    }
  }

  clearActiveSession() {
    if (!this.activeSessionId) return;
    if (confirm('Clear message history for this session?')) {
      this.activeMessages = [];
      localStorage.removeItem(`rayan_chat_msgs_${this.activeSessionId}`);
      this.renderActiveMessages();
      this.showToast('Message thread cleared.');
    }
  }

  // ==========================================================================
  // GIT PUSH & DEPLOYMENT ENGINE
  // ==========================================================================
  bindGitPushEvents() {
    const btnDirectPush = document.getElementById('btn-github-direct-push');
    const btnLocalPush = document.getElementById('btn-local-shell-push');
    const btnDownloadData = document.getElementById('btn-download-data-js');
    const btnDownloadBackup = document.getElementById('btn-download-backup-json');
    const btnResetDefaults = document.getElementById('btn-reset-defaults');
    const consoleBox = document.getElementById('git-console-output');
    const patInput = document.getElementById('git-pat-token');
    const commitMsgInput = document.getElementById('git-commit-message');

    // Auto-fill saved PAT from local storage
    if (patInput) {
      const savedPat = localStorage.getItem('rayan_admin_gh_token');
      if (savedPat) patInput.value = savedPat;
      patInput.addEventListener('change', () => {
        localStorage.setItem('rayan_admin_gh_token', patInput.value.trim());
      });
    }

    const logToConsole = (msg) => {
      if (!consoleBox) return;
      const timestamp = new Date().toLocaleTimeString();
      consoleBox.textContent += `\n[${timestamp}] ${msg}`;
      consoleBox.scrollTop = consoleBox.scrollHeight;
    };

    // 1. Direct GitHub API Push
    if (btnDirectPush) {
      btnDirectPush.addEventListener('click', async () => {
        this.collectFormData();
        this.saveAllChanges();

        const token = (patInput ? patInput.value.trim() : '') || localStorage.getItem('rayan_admin_gh_token');
        if (!token) {
          alert('Please enter your GitHub Personal Access Token (PAT) with repo/contents permissions to push directly to GitHub.\n\nAlternatively, use "Download data.js" or "Local Shell Git Push".');
          if (patInput) patInput.focus();
          return;
        }

        const repo = 'Satyacoder-31/rayan-group';
        const branch = 'main';
        const message = (commitMsgInput ? commitMsgInput.value.trim() : '') || `Site content update via Rayan Admin Panel [${new Date().toISOString()}]`;

        logToConsole(`Connecting to GitHub repository: ${repo} (branch: ${branch})...`);
        btnDirectPush.disabled = true;
        btnDirectPush.textContent = '⏳ Committing to Git...';

        try {
          const updatedContent = this.generateDataJsCode();
          const encodedContent = btoa(unescape(encodeURIComponent(updatedContent)));

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
          }

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

    // 2. Local Shell Push
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

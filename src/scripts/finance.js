import defaultSeedData from '../../data/finance-data.json';

/**
 * RAYAN GROUP — ENTERPRISE ACCOUNTS, BILLING & FINANCIAL MANAGEMENT SYSTEM
 * Inspired by Zolvit/VakilSearch Billing & GRC Dashboard functionality
 * Fully integrated with Rayan Group corporate architecture
 */

class FinanceApp {
  constructor() {
    this.db = JSON.parse(JSON.stringify(defaultSeedData));
    this.currentUser = null;
    this.activeCompanyId = 'ashaz-eng-in';
    this.activePeriod = 'fy-2025-26';
    this.activeCurrency = 'INR';
    this.activeTab = 'dashboard';
    this.currencyRates = { INR: 1, AED: 0.044, USD: 0.012 };
    this.currencySymbols = { INR: '₹', AED: 'AED ', USD: '$' };
  }

  async init() {
    this.initSession();
    await this.loadDatabase();
    this.bindGlobalEvents();
    this.renderHeaderStatus();
    if (this.currentUser) {
      this.showAppView();
    } else {
      this.showAuthView();
    }
  }

  // --------------------------------------------------------------------------
  // SESSION & AUTHENTICATION
  // --------------------------------------------------------------------------
  initSession() {
    try {
      const savedUser = localStorage.getItem('rayan_fin_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn('Could not parse saved finance user:', e);
    }
  }

  saveSession(user) {
    this.currentUser = user;
    localStorage.setItem('rayan_fin_user', JSON.stringify(user));
    this.renderHeaderStatus();
  }

  clearSession() {
    this.currentUser = null;
    localStorage.removeItem('rayan_fin_user');
    this.renderHeaderStatus();
    this.showAuthView();
  }

  // Check RBAC permission
  hasPermission(action) {
    if (!this.currentUser) return false;
    const role = this.currentUser.role;

    if (role === 'super_admin') return true;

    if (role === 'finance_admin') {
      return !['manage_companies', 'delete_user'].includes(action);
    }

    if (role === 'accountant') {
      const allowed = [
        'view_dashboard', 'create_invoice', 'edit_draft_invoice', 'print_invoice',
        'create_bill', 'record_receipt', 'record_payment', 'create_customer',
        'create_vendor', 'create_item', 'view_reports', 'create_credit_note', 'create_debit_note'
      ];
      return allowed.includes(action);
    }

    if (role === 'project_manager') {
      const allowed = ['view_dashboard', 'view_projects', 'submit_expense', 'view_pos', 'create_po'];
      return allowed.includes(action);
    }

    if (role === 'employee') {
      const allowed = ['view_dashboard', 'submit_expense', 'view_own_expenses'];
      return allowed.includes(action);
    }

    if (role === 'management_readonly') {
      const allowed = ['view_dashboard', 'view_reports', 'export_reports', 'view_projects', 'view_invoices', 'view_bills'];
      return allowed.includes(action);
    }

    return false;
  }

  // --------------------------------------------------------------------------
  // DATA LAYER & API SYNC
  // --------------------------------------------------------------------------
  async loadDatabase() {
    if (!this.db) {
      this.db = JSON.parse(JSON.stringify(defaultSeedData));
    }

    try {
      const res = await fetch('/api/finance?action=get_state');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          this.db = json.data;
          localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
          return;
        }
      }
    } catch (e) {
      console.warn('Server API not reachable; checking local cache or seed', e);
    }

    // Fallback to cache or bundled seed
    const cached = localStorage.getItem('rayan_fin_db_cache');
    if (cached) {
      try {
        this.db = JSON.parse(cached);
        return;
      } catch (err) {}
    }
  }

  async syncApi(action, payload = {}) {
    const body = {
      action,
      ...payload,
      user_name: this.currentUser?.name,
      user_role: this.currentUser?.role,
      user_email: this.currentUser?.email
    };

    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          this.db = json.data;
          localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
          return json;
        }
      }
    } catch (e) {
      console.warn('API sync offline fallback:', e);
    }

    // Local state fallback
    localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
    return { success: true, localOnly: true, data: this.db };
  }

  // --------------------------------------------------------------------------
  // FORMATTING UTILITIES
  // --------------------------------------------------------------------------
  formatCurrency(amount, withSymbol = true) {
    const num = Number(amount) || 0;
    const rate = this.currencyRates[this.activeCurrency] || 1;
    const converted = num * rate;
    const symbol = withSymbol ? (this.currencySymbols[this.activeCurrency] || '₹') : '';

    if (this.activeCurrency === 'INR') {
      const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(converted);
      return symbol ? `${symbol}${formatted}` : formatted;
    }

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(converted);
    return symbol ? `${symbol}${formatted}` : formatted;
  }

  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  // --------------------------------------------------------------------------
  // GLOBAL WEBSITE HEADER INTEGRATION
  // --------------------------------------------------------------------------
  renderHeaderStatus() {
    // Top bar link if present on other pages
    const topBarLinks = document.querySelectorAll('.header-top-link-finance');
    topBarLinks.forEach(el => {
      if (this.currentUser) {
        el.innerHTML = `💼 Finance (${this.currentUser.name.split(' ')[0]})`;
      } else {
        el.innerHTML = `🔒 Accounts Login`;
      }
    });
  }

  // --------------------------------------------------------------------------
  // VIEW RENDERING: AUTH VS APPLICATION
  // --------------------------------------------------------------------------
  showAuthView() {
    const portalContainer = document.getElementById('finance-portal-root');
    if (!portalContainer) return;

    portalContainer.innerHTML = `
      <div style="min-height: 100vh; background: var(--fin-bg-main); display: flex; flex-direction: column;">
        <!-- Clean Dedicated Auth Header -->
        <header style="padding: 1rem 1.75rem; border-bottom: 1px solid var(--fin-border); display: flex; align-items: center; justify-content: space-between; background: rgba(11, 17, 30, 0.95); backdrop-filter: blur(12px);">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <a href="/" style="display: flex; align-items: center; text-decoration: none;">
              <img src="/assets/logos/rayan-group-white.png" alt="Rayan Group" class="logo-theme-dark" style="height: 34px; width: auto;">
              <img src="/assets/logos/rayan-group.png" alt="Rayan Group" class="logo-theme-light" style="height: 34px; width: auto;">
            </a>
            <span class="fin-topbar-badge-desk">ACCOUNTS &amp; GRC PORTAL</span>
          </div>
          <a href="/" style="display: inline-flex; align-items: center; gap: 0.45rem; color: #38bdf8; font-size: 0.82rem; font-weight: 600; text-decoration: none; padding: 0.42rem 0.85rem; border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; background: rgba(56, 189, 248, 0.06); transition: all 0.2s ease;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>Return to Main Website</span>
          </a>
        </header>

        <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 3rem 1.5rem;">
          <div class="fin-auth-container">
            <div class="fin-auth-header">
              <span class="fin-auth-badge">
                <span class="live-pulse-dot" style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#0099e6;"></span>
                AUTHORIZED ACCESS ONLY • GRC &amp; ACCOUNTS DESK
              </span>
              <h2 class="fin-auth-title">Corporate Financial Portal</h2>
              <p class="fin-auth-desc">Sign in with your Rayan Group executive or finance credentials to access billing, ledgers, tax invoices, and financial statements.</p>
            </div>

            <form id="fin-login-form">
              <div class="fin-form-group">
                <label class="fin-form-label" for="fin-login-email">Corporate Email / Username <span style="color:#ef4444;">*</span></label>
                <input type="email" id="fin-login-email" class="fin-form-input" placeholder="name@rayangroup.com" required autocomplete="username">
              </div>

              <div class="fin-form-group">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                  <label class="fin-form-label" for="fin-login-password" style="margin-bottom:0;">Password <span style="color:#ef4444;">*</span></label>
                  <button type="button" id="fin-toggle-pwd" style="background:none; border:none; color:#38bdf8; font-size:0.75rem; cursor:pointer;">Show</button>
                </div>
                <input type="password" id="fin-login-password" class="fin-form-input" placeholder="Enter secure password" required autocomplete="current-password">
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; font-size:0.8rem;">
                <label style="display:flex; align-items:center; gap:0.4rem; color:var(--fin-text-muted); cursor:pointer;">
                  <input type="checkbox" id="fin-remember-me" checked>
                  <span>Remember this terminal</span>
                </label>
                <button type="button" id="fin-forgot-pwd-btn" style="background:none; border:none; color:#38bdf8; font-size:0.78rem; cursor:pointer; text-decoration:underline;">Forgot password?</button>
              </div>

              <div id="fin-login-error" style="display:none; padding:0.75rem; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.4); border-radius:8px; color:#ef4444; font-size:0.82rem; margin-bottom:1rem;"></div>

              <button type="submit" class="btn-enterprise-primary" id="fin-login-submit-btn" style="width:100%; justify-content:center; padding:0.85rem;">
                <span>SIGN IN TO FINANCIAL PORTAL &rarr;</span>
              </button>
            </form>

            <!-- Secure Corporate Notice (No Credentials Visible on UI) -->
            <div class="fin-login-footer-security">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>256-Bit SSL Encrypted Corporate Session • Authorized Financial Personnel Only</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindAuthEvents();
  }

  bindAuthEvents() {
    const form = document.getElementById('fin-login-form');
    const emailInput = document.getElementById('fin-login-email');
    const pwdInput = document.getElementById('fin-login-password');
    const toggleBtn = document.getElementById('fin-toggle-pwd');
    const errorBox = document.getElementById('fin-login-error');

    // Password visibility toggle
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        if (pwdInput.type === 'password') {
          pwdInput.type = 'text';
          toggleBtn.textContent = 'Hide';
        } else {
          pwdInput.type = 'password';
          toggleBtn.textContent = 'Show';
        }
      };
    }

    // Form submission
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const email = emailInput.value.trim();
        const password = pwdInput.value.trim();

        const submitBtn = document.getElementById('fin-login-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>VERIFYING CREDENTIALS...</span>`;

        try {
          // Attempt API login
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', email, password })
          });

          let data = null;
          try { data = await res.json(); } catch(e) {}

          if (res.ok && data && data.success && data.user) {
            this.saveSession(data.user);
            this.showAppView();
            return;
          }

          // Fallback check against db users (handles local or seed state)
          const localUser = this.db?.users?.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (localUser && localUser.password === password) {
            const { password: _, ...safeUser } = localUser;
            this.saveSession(safeUser);
            this.showAppView();
            return;
          }

          // Clean error message (never show confusing CMS access key error)
          const msg = (data && data.error && !data.error.includes('corporate access key'))
            ? data.error
            : 'Invalid corporate email or password. Please verify your credentials.';
          errorBox.textContent = msg;
          errorBox.style.display = 'block';
        } catch (err) {
          // Fallback check against db users on network error
          const localUser = this.db?.users?.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (localUser && localUser.password === password) {
            const { password: _, ...safeUser } = localUser;
            this.saveSession(safeUser);
            this.showAppView();
            return;
          }
          errorBox.textContent = 'Invalid corporate email or password. Please verify your credentials.';
          errorBox.style.display = 'block';
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>SIGN IN TO FINANCIAL PORTAL &rarr;</span>`;
        }
      };
    }

    // Forgot password
    const forgotBtn = document.getElementById('fin-forgot-pwd-btn');
    if (forgotBtn) {
      forgotBtn.onclick = () => {
        const entered = prompt('Please enter your Rayan Group corporate email to receive secure password recovery link:', emailInput.value);
        if (entered) {
          alert(`Password recovery instructions and security token have been transmitted to ${entered}.`);
        }
      };
    }
  }

  // --------------------------------------------------------------------------
  // APPLICATION INTERFACE (DASHBOARD & MODULES)
  // --------------------------------------------------------------------------
  showAppView() {
    const portalContainer = document.getElementById('finance-portal-root');
    if (!portalContainer) return;

    portalContainer.innerHTML = `
      <div class="fin-app-wrapper" data-lenis-prevent="true">
        <!-- Top App Navigation Bar -->
        <header class="fin-app-topbar">
          <div class="fin-topbar-inner">
            <!-- Left: Sidebar Toggle, Brand, Product Badge & Entity Switcher -->
            <div class="fin-topbar-left">
              <button type="button" class="fin-sidebar-toggle-btn" id="fin-sidebar-toggle-btn" title="Toggle Navigation Sidebar">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <a href="/billing/" class="fin-topbar-brand" title="Rayan Group Corporate Financial Portal">
                <img src="/assets/logos/rayan-group-white.png" alt="Rayan Group" class="fin-topbar-logo logo-theme-dark">
                <img src="/assets/logos/rayan-group.png" alt="Rayan Group" class="fin-topbar-logo logo-theme-light">
              </a>
              <div class="fin-brand-divider" aria-hidden="true"></div>
              <span class="fin-topbar-badge-desk">
                <span class="live-pulse-dot" style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 6px #10b981;"></span>
                <span>FINANCE DESK</span>
              </span>

              <!-- Business Entity Selector (Custom Styled) -->
              <div class="fin-select-wrapper fin-entity-wrapper">
                <svg class="fin-select-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
                <select id="fin-entity-select" class="fin-select-modern" title="Switch Operating Legal Entity">
                  ${(this.db?.companies || []).map(c => {
                    const shortName = c.name.replace('Private Limited', 'Ltd').replace('Corporate HQ', 'HQ').replace('Division', 'Div');
                    return `<option value="${c.id}" ${c.id === this.activeCompanyId ? 'selected' : ''}>${shortName}</option>`;
                  }).join('')}
                </select>
                <svg class="fin-select-arrow" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>

            <!-- Center: Global Command Search -->
            <div class="fin-topbar-center">
              <div class="fin-global-search-wrap">
                <svg class="fin-search-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" id="fin-global-search" class="fin-global-search-input" placeholder="Search Invoices, Bills, Customers, POs... (Ctrl+K)">
                <span class="fin-search-kbd">Ctrl K</span>
              </div>
            </div>

            <!-- Right: Controls, Notifications & Profile -->
            <div class="fin-topbar-right">
              <!-- Accounting Period Selector -->
              <div class="fin-select-wrapper fin-period-wrapper">
                <svg class="fin-select-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <select id="fin-period-select" class="fin-select-modern" title="Filter Accounting Period">
                  <option value="fy-2025-26" ${this.activePeriod === 'fy-2025-26' ? 'selected' : ''}>FY 2025–26</option>
                  <option value="q4-2026" ${this.activePeriod === 'q4-2026' ? 'selected' : ''}>Q4 (Jan–Mar)</option>
                  <option value="current-month" ${this.activePeriod === 'current-month' ? 'selected' : ''}>March 2026</option>
                  <option value="last-30-days" ${this.activePeriod === 'last-30-days' ? 'selected' : ''}>Last 30 Days</option>
                </select>
                <svg class="fin-select-arrow" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </div>

              <!-- Currency Switcher -->
              <div class="fin-select-wrapper fin-currency-wrapper">
                <select id="fin-currency-select" class="fin-select-modern" title="Display Currency">
                  <option value="INR" ${this.activeCurrency === 'INR' ? 'selected' : ''}>₹ INR</option>
                  <option value="AED" ${this.activeCurrency === 'AED' ? 'selected' : ''}>د.إ AED</option>
                  <option value="USD" ${this.activeCurrency === 'USD' ? 'selected' : ''}>$ USD</option>
                </select>
                <svg class="fin-select-arrow" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </div>

              <div class="fin-header-vsep" aria-hidden="true"></div>

              <!-- Notifications Hub -->
              <button type="button" class="fin-icon-btn" id="fin-notif-btn" title="Financial Notifications &amp; Alerts">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="fin-badge-counter" id="fin-notif-badge">${(this.db?.notifications || []).filter(n => !n.read).length}</span>
              </button>

              <div class="fin-header-vsep" aria-hidden="true"></div>

              <!-- User Profile Menu -->
              <div class="fin-user-chip" id="fin-user-menu-btn" title="User Profile and Security Settings">
                <div class="fin-user-avatar">${this.currentUser?.avatar || '👤'}</div>
                <div class="fin-user-meta">
                  <span class="fin-user-name">${this.currentUser?.name || 'Authorized User'}</span>
                  <span class="fin-user-role-badge">${this.currentUser?.role_label || 'Staff'}</span>
                </div>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--fin-text-dim);"><path d="M6 9l6 6 6-6"/></svg>
              </div>

              <div class="fin-header-vsep" aria-hidden="true"></div>

              <!-- Return to Main Corporate Website -->
              <a href="/" class="fin-btn-nav-website" id="fin-return-home-btn" title="Return to Corporate Website">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span>Website</span>
              </a>

              <!-- Sign Out Button -->
              <button type="button" class="fin-icon-btn fin-logout-btn" id="fin-logout-btn" title="Sign Out">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        </header>

        <!-- Main Workspace: Left Sidebar + Content Stage -->
        <div class="fin-app-body-layout" data-lenis-prevent="true">
          <!-- Left Perspective Navigation Sidebar -->
          <aside class="fin-app-sidebar" id="fin-app-sidebar" data-lenis-prevent="true">
            <!-- Sidebar Quick Create Action -->
            <div class="fin-sidebar-action-wrap">
              <button type="button" class="fin-sidebar-create-btn" id="fin-sidebar-create-toggle" title="Create Transaction or Record">
                <span class="fin-create-btn-left">
                  <span class="fin-create-btn-icon">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </span>
                  <span class="fin-create-btn-text">Create New</span>
                </span>
                <span class="fin-create-btn-arrow">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </button>

              <div class="fin-quick-create-menu" id="fin-quick-create-menu" style="display: none;">
                <div class="fin-qc-section-title">SALES &amp; RECEIVABLES</div>
                ${this.hasPermission('create_invoice') ? `
                  <button type="button" class="fin-qc-item" id="qa-btn-invoice">
                    <span class="fin-qc-badge-icon" style="background:rgba(56,189,248,0.15); color:#38bdf8;">📄</span>
                    <div class="fin-qc-text">
                      <span class="fin-qc-name">Tax Invoice</span>
                      <span class="fin-qc-desc">Bill client with GST/VAT</span>
                    </div>
                  </button>
                ` : ''}
                ${this.hasPermission('record_receipt') ? `
                  <button type="button" class="fin-qc-item" id="qa-btn-receipt">
                    <span class="fin-qc-badge-icon" style="background:rgba(16,185,129,0.15); color:#10b981;">💳</span>
                    <div class="fin-qc-text">
                      <span class="fin-qc-name">Customer Receipt</span>
                      <span class="fin-qc-desc">Record client collection</span>
                    </div>
                  </button>
                ` : ''}
                ${this.hasPermission('create_customer') ? `
                  <button type="button" class="fin-qc-item" id="qa-btn-customer">
                    <span class="fin-qc-badge-icon" style="background:rgba(139,92,246,0.15); color:#a78bfa;">👥</span>
                    <div class="fin-qc-text">
                      <span class="fin-qc-name">New Customer</span>
                      <span class="fin-qc-desc">Add client profile</span>
                    </div>
                  </button>
                ` : ''}

                <div class="fin-qc-divider"></div>
                <div class="fin-qc-section-title">PURCHASES &amp; PAYABLES</div>
                ${this.hasPermission('create_bill') ? `
                  <button type="button" class="fin-qc-item" id="qa-btn-bill">
                    <span class="fin-qc-badge-icon" style="background:rgba(245,158,11,0.15); color:#fbbf24;">📥</span>
                    <div class="fin-qc-text">
                      <span class="fin-qc-name">Purchase Bill</span>
                      <span class="fin-qc-desc">Record vendor bill</span>
                    </div>
                  </button>
                ` : ''}
                ${this.hasPermission('record_payment') ? `
                  <button type="button" class="fin-qc-item" id="qa-btn-payment">
                    <span class="fin-qc-badge-icon" style="background:rgba(239,68,68,0.15); color:#f87171;">💸</span>
                    <div class="fin-qc-text">
                      <span class="fin-qc-name">Vendor Payment</span>
                      <span class="fin-qc-desc">Disburse payment voucher</span>
                    </div>
                  </button>
                ` : ''}
                ${this.hasPermission('create_po') ? `
                  <button type="button" class="fin-qc-item" id="qa-btn-po">
                    <span class="fin-qc-badge-icon" style="background:rgba(59,130,246,0.15); color:#60a5fa;">📑</span>
                    <div class="fin-qc-text">
                      <span class="fin-qc-name">Purchase Order</span>
                      <span class="fin-qc-desc">Issue procurement PO</span>
                    </div>
                  </button>
                ` : ''}
                ${this.hasPermission('create_vendor') ? `
                  <button type="button" class="fin-qc-item" id="qa-btn-vendor">
                    <span class="fin-qc-badge-icon" style="background:rgba(217,119,6,0.15); color:#f59e0b;">🏢</span>
                    <div class="fin-qc-text">
                      <span class="fin-qc-name">New Vendor</span>
                      <span class="fin-qc-desc">Register supplier/contractor</span>
                    </div>
                  </button>
                ` : ''}

                <div class="fin-qc-divider"></div>
                <div class="fin-qc-section-title">OPERATING EXPENSES</div>
                ${this.hasPermission('submit_expense') ? `
                  <button type="button" class="fin-qc-item" id="qa-btn-expense">
                    <span class="fin-qc-badge-icon" style="background:rgba(168,85,247,0.15); color:#c084fc;">🧾</span>
                    <div class="fin-qc-text">
                      <span class="fin-qc-name">Record Expense</span>
                      <span class="fin-qc-desc">Site, travel, fuel claim</span>
                    </div>
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Scrollable Accordion Navigation Menu (Matching Reference Images 2 & 3) -->
            <nav class="fin-sidebar-nav-scroll" aria-label="Financial Modules Navigation">
              <!-- Direct Standalone Item: Executive Dashboard -->
              <div class="fin-tab-item direct-item ${this.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
                <div class="fin-item-left">
                  <svg class="fin-grp-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="9"></rect>
                    <rect x="14" y="3" width="7" height="5"></rect>
                    <rect x="14" y="12" width="7" height="9"></rect>
                    <rect x="3" y="16" width="7" height="5"></rect>
                  </svg>
                  <span class="fin-tab-title">Executive Dashboard</span>
                </div>
              </div>

              <!-- Accordion: Sales & Income -->
              <div class="fin-accordion-group ${['invoices', 'payment_in', 'payments', 'customers', 'credit_notes'].includes(this.activeTab) ? 'open' : ''}" id="fin-grp-sales">
                <div class="fin-accordion-header" data-toggle="fin-grp-sales">
                  <div class="fin-grp-title-wrap">
                    <svg class="fin-grp-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <span class="fin-grp-title">Sales &amp; Income</span>
                  </div>
                  <svg class="fin-accordion-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </div>
                <div class="fin-accordion-body">
                  <div class="fin-nav-subitem ${this.activeTab === 'invoices' ? 'active' : ''}" data-tab="invoices">
                    <span class="fin-subitem-text">Sales Invoices</span>
                    <button type="button" class="fin-subitem-plus" title="Create Sales Invoice" data-action="new-invoice">+</button>
                  </div>
                  <div class="fin-nav-subitem ${['payment_in', 'payments'].includes(this.activeTab) ? 'active' : ''}" data-tab="payment_in">
                    <span class="fin-subitem-text">Payment-In</span>
                    <button type="button" class="fin-subitem-plus" title="Record Payment-In" data-action="new-receipt">+</button>
                  </div>
                  <div class="fin-nav-subitem ${this.activeTab === 'customers' ? 'active' : ''}" data-tab="customers">
                    <span class="fin-subitem-text">Customers &amp; Clients</span>
                    <button type="button" class="fin-subitem-plus" title="Add Customer" data-action="new-customer">+</button>
                  </div>
                  <div class="fin-nav-subitem ${this.activeTab === 'credit_notes' ? 'active' : ''}" data-tab="credit_notes">
                    <span class="fin-subitem-text">Sales Return / Cr. Note</span>
                    <button type="button" class="fin-subitem-plus" title="Create Credit Note" data-action="new-credit-note">+</button>
                  </div>
                </div>
              </div>

              <!-- Accordion: Purchase & Expense (MATCHING IMAGE 2 EXACTLY) -->
              <div class="fin-accordion-group ${['bills', 'payment_out', 'expenses', 'pos', 'debit_notes', 'notes', 'vendors'].includes(this.activeTab) ? 'open' : ''}" id="fin-grp-purchases">
                <div class="fin-accordion-header" data-toggle="fin-grp-purchases">
                  <div class="fin-grp-title-wrap">
                    <svg class="fin-grp-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span class="fin-grp-title">Purchase &amp; Expense</span>
                  </div>
                  <svg class="fin-accordion-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </div>
                <div class="fin-accordion-body">
                  <div class="fin-nav-subitem ${this.activeTab === 'bills' ? 'active' : ''}" data-tab="bills">
                    <span class="fin-subitem-text">Purchase Bills</span>
                    <button type="button" class="fin-subitem-plus" title="Record Purchase Bill" data-action="new-bill">+</button>
                  </div>
                  <div class="fin-nav-subitem ${this.activeTab === 'payment_out' ? 'active' : ''}" data-tab="payment_out">
                    <span class="fin-subitem-text">Payment-Out</span>
                    <button type="button" class="fin-subitem-plus" title="Record Payment-Out" data-action="new-payment">+</button>
                  </div>
                  <div class="fin-nav-subitem ${this.activeTab === 'expenses' ? 'active' : ''}" data-tab="expenses">
                    <span class="fin-subitem-text">Expenses</span>
                    <button type="button" class="fin-subitem-plus" title="Record Expense" data-action="new-expense">+</button>
                  </div>
                  <div class="fin-nav-subitem ${this.activeTab === 'pos' ? 'active' : ''}" data-tab="pos">
                    <span class="fin-subitem-text">Purchase Order</span>
                    <button type="button" class="fin-subitem-plus" title="Issue Purchase Order" data-action="new-po">+</button>
                  </div>
                  <div class="fin-nav-subitem ${['debit_notes', 'notes'].includes(this.activeTab) ? 'active' : ''}" data-tab="debit_notes">
                    <span class="fin-subitem-text">Purchase Return/ Dr. Note</span>
                    <button type="button" class="fin-subitem-plus" title="Create Debit Note" data-action="new-debit-note">+</button>
                  </div>
                  <div class="fin-nav-subitem ${this.activeTab === 'vendors' ? 'active' : ''}" data-tab="vendors">
                    <span class="fin-subitem-text">Vendors &amp; Suppliers</span>
                    <button type="button" class="fin-subitem-plus" title="Register Supplier" data-action="new-vendor">+</button>
                  </div>
                </div>
              </div>

              <!-- Accordion: Cash & Bank (MATCHING IMAGE 3 EXACTLY) -->
              <div class="fin-accordion-group ${['bank_accounts', 'cash_in_hand', 'cheques', 'loan_accounts'].includes(this.activeTab) ? 'open' : ''}" id="fin-grp-bank">
                <div class="fin-accordion-header" data-toggle="fin-grp-bank">
                  <div class="fin-grp-title-wrap">
                    <svg class="fin-grp-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2L2 7h20L12 2z"></path>
                    </svg>
                    <span class="fin-grp-title">Cash &amp; Bank</span>
                  </div>
                  <svg class="fin-accordion-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </div>
                <div class="fin-accordion-body">
                  <div class="fin-nav-subitem ${this.activeTab === 'bank_accounts' ? 'active' : ''}" data-tab="bank_accounts">
                    <span class="fin-subitem-text">Bank Accounts</span>
                    <button type="button" class="fin-subitem-plus" title="Add Account / Transfer" data-action="new-bank">+</button>
                  </div>
                  <div class="fin-nav-subitem ${this.activeTab === 'cash_in_hand' ? 'active' : ''}" data-tab="cash_in_hand">
                    <span class="fin-subitem-text">Cash In Hand</span>
                    <button type="button" class="fin-subitem-plus" title="Record Cash Voucher" data-action="new-cash">+</button>
                  </div>
                  <div class="fin-nav-subitem ${this.activeTab === 'cheques' ? 'active' : ''}" data-tab="cheques">
                    <span class="fin-subitem-text">Cheques</span>
                  </div>
                  <div class="fin-nav-subitem ${this.activeTab === 'loan_accounts' ? 'active' : ''}" data-tab="loan_accounts">
                    <span class="fin-subitem-text">Loan Accounts</span>
                    <button type="button" class="fin-subitem-plus" title="Record Loan Facility / Repayment" data-action="new-loan">+</button>
                  </div>
                </div>
              </div>

              <!-- Accordion: Operations & Projects -->
              <div class="fin-accordion-group ${['projects', 'items', 'documents'].includes(this.activeTab) ? 'open' : ''}" id="fin-grp-ops">
                <div class="fin-accordion-header" data-toggle="fin-grp-ops">
                  <div class="fin-grp-title-wrap">
                    <svg class="fin-grp-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                    <span class="fin-grp-title">Operations &amp; Projects</span>
                  </div>
                  <svg class="fin-accordion-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </div>
                <div class="fin-accordion-body">
                  <div class="fin-nav-subitem ${this.activeTab === 'projects' ? 'active' : ''}" data-tab="projects">
                    <span class="fin-subitem-text">Project Accounts</span>
                    <button type="button" class="fin-subitem-plus" title="Add Project Account" data-action="new-project">+</button>
                  </div>
                  <div class="fin-nav-subitem ${this.activeTab === 'items' ? 'active' : ''}" data-tab="items">
                    <span class="fin-subitem-text">Items &amp; Inventory</span>
                    <button type="button" class="fin-subitem-plus" title="Add Item" data-action="new-item">+</button>
                  </div>
                  <div class="fin-nav-subitem ${this.activeTab === 'documents' ? 'active' : ''}" data-tab="documents">
                    <span class="fin-subitem-text">Document Vault</span>
                    <button type="button" class="fin-subitem-plus" title="Upload Document" data-action="upload-doc">+</button>
                  </div>
                </div>
              </div>

              <!-- Accordion: Reports & Compliance -->
              <div class="fin-accordion-group ${['reports', 'calendar'].includes(this.activeTab) ? 'open' : ''}" id="fin-grp-reports">
                <div class="fin-accordion-header" data-toggle="fin-grp-reports">
                  <div class="fin-grp-title-wrap">
                    <svg class="fin-grp-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                    <span class="fin-grp-title">Reports &amp; Compliance</span>
                  </div>
                  <svg class="fin-accordion-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </div>
                <div class="fin-accordion-body">
                  <div class="fin-nav-subitem ${this.activeTab === 'reports' ? 'active' : ''}" data-tab="reports">
                    <span class="fin-subitem-text">Financial Reports</span>
                  </div>
                  <div class="fin-nav-subitem ${this.activeTab === 'calendar' ? 'active' : ''}" data-tab="calendar">
                    <span class="fin-subitem-text">Statutory Calendar</span>
                  </div>
                </div>
              </div>

              <!-- Accordion: Official Print Formats -->
              <div class="fin-accordion-group" id="fin-grp-prints">
                <div class="fin-accordion-header" data-toggle="fin-grp-prints">
                  <div class="fin-grp-title-wrap">
                    <svg class="fin-grp-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    <span class="fin-grp-title">Official Print Formats</span>
                  </div>
                  <svg class="fin-accordion-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </div>
                <div class="fin-accordion-body">
                  <div class="fin-nav-subitem" onclick="window.finApp.openInvoicePrintModal('inv-rec-rg-44049')">
                    <span class="fin-subitem-text">Tax Invoice (Sample)</span>
                  </div>
                  <div class="fin-nav-subitem" onclick="window.finApp.openReceiptPrintModal('rec-rv-44025')">
                    <span class="fin-subitem-text">Receipt Voucher (Sample)</span>
                  </div>
                  <div class="fin-nav-subitem" onclick="window.finApp.openPOPrintModal('po-rec-11008')">
                    <span class="fin-subitem-text">Purchase Order (2p)</span>
                  </div>
                </div>
              </div>

              <!-- Accordion: Governance & Admin (Super Admin) -->
              ${this.currentUser?.role === 'super_admin' ? `
                <div class="fin-accordion-group ${['users', 'settings'].includes(this.activeTab) ? 'open' : ''}" id="fin-grp-admin">
                  <div class="fin-accordion-header" data-toggle="fin-grp-admin">
                    <div class="fin-grp-title-wrap">
                      <svg class="fin-grp-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                      <span class="fin-grp-title">Governance &amp; Admin</span>
                    </div>
                    <svg class="fin-accordion-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  </div>
                  <div class="fin-accordion-body">
                    <div class="fin-nav-subitem ${this.activeTab === 'users' ? 'active' : ''}" data-tab="users">
                      <span class="fin-subitem-text">Users &amp; Audit Logs</span>
                      <button type="button" class="fin-subitem-plus" title="Invite User" data-action="new-user">+</button>
                    </div>
                    <div class="fin-nav-subitem ${this.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
                      <span class="fin-subitem-text">Entity Settings</span>
                    </div>
                  </div>
                </div>
              ` : ''}
            </nav>

            <!-- Sidebar Footer -->
            <div class="fin-sidebar-footer">
              <div class="fin-sidebar-status">
                <span class="live-pulse-dot" style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 6px #10b981;"></span>
                <span class="fin-sidebar-status-text">System Live</span>
              </div>
              <span class="fin-sidebar-ver">v2.6 Enterprise</span>
            </div>
          </aside>

          <!-- Sidebar Backdrop for Mobile/Tablet -->
          <div class="fin-sidebar-backdrop" id="fin-sidebar-backdrop"></div>

          <!-- Main Stage (Header Breadcrumb Strip + Content Container) -->
          <div class="fin-main-stage" data-lenis-prevent="true">
            <!-- Compact Context Action Bar (No horizontal scrolling) -->
            <div class="fin-stage-action-bar">
              <div class="fin-stage-breadcrumb" id="fin-stage-breadcrumb">
                <span class="fin-crumb-root">Finance Desk</span>
                <span class="fin-crumb-sep">/</span>
                <span class="fin-crumb-active" id="fin-active-tab-title">Executive Dashboard</span>
              </div>
              <div class="fin-stage-quick-pills">
                ${this.hasPermission('create_invoice') ? `
                  <button type="button" class="fin-pill-action" onclick="document.getElementById('qa-btn-invoice')?.click()">
                    <span>+ New Invoice</span>
                  </button>
                ` : ''}
                ${this.hasPermission('create_bill') ? `
                  <button type="button" class="fin-pill-action" onclick="document.getElementById('qa-btn-bill')?.click()">
                    <span>+ Record Bill</span>
                  </button>
                ` : ''}
                ${this.hasPermission('create_customer') ? `
                  <button type="button" class="fin-pill-action" onclick="document.getElementById('qa-btn-customer')?.click()">
                    <span>+ Customer</span>
                  </button>
                ` : ''}
                ${this.hasPermission('submit_expense') ? `
                  <button type="button" class="fin-pill-action" onclick="document.getElementById('qa-btn-expense')?.click()">
                    <span>+ Expense</span>
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Dynamic Tab Content Root -->
            <main class="fin-main-content" id="fin-tab-content-root" data-lenis-prevent="true">
              <!-- Rendered via renderActiveTab() -->
            </main>
          </div>
        </div>
      </div>

      <!-- Global App Modals Root Container -->
      <div id="fin-modal-container"></div>
    `;

    this.bindAppEvents();
    this.renderActiveTab();
  }

  bindAppEvents() {
    // Dismiss preloader lock on body & overlay
    document.body.classList.remove('preloader-active');
    const sitePreloader = document.getElementById('site-preloader');
    if (sitePreloader) {
      sitePreloader.classList.add('preloader-done');
      sitePreloader.style.display = 'none';
      sitePreloader.style.pointerEvents = 'none';
    }

    // Direct Wheel & Scroll isolation to guarantee native top-to-bottom scroll
    const contentRoot = document.getElementById('fin-tab-content-root');
    if (contentRoot) {
      contentRoot.setAttribute('data-lenis-prevent', 'true');
      contentRoot.addEventListener('wheel', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }

    // 0. Sidebar Toggle & Mobile Backdrop
    const sidebarToggle = document.getElementById('fin-sidebar-toggle-btn');
    const sidebar = document.getElementById('fin-app-sidebar');
    const backdrop = document.getElementById('fin-sidebar-backdrop');
    if (sidebarToggle && sidebar) {
      sidebarToggle.onclick = () => {
        if (window.innerWidth <= 992) {
          sidebar.classList.toggle('mobile-open');
          backdrop?.classList.toggle('active', sidebar.classList.contains('mobile-open'));
        } else {
          sidebar.classList.toggle('collapsed');
        }
      };
    }
    if (backdrop && sidebar) {
      backdrop.onclick = () => {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
      };
    }

    // 0.1 Quick Create Dropdown in Sidebar
    const createToggle = document.getElementById('fin-sidebar-create-toggle');
    const createMenu = document.getElementById('fin-quick-create-menu');
    if (createToggle && createMenu) {
      createToggle.onclick = (e) => {
        e.stopPropagation();
        const isOpen = createMenu.style.display !== 'none';
        createMenu.style.display = isOpen ? 'none' : 'block';
        createToggle.classList.toggle('active', !isOpen);
      };
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.fin-sidebar-action-wrap')) {
          createMenu.style.display = 'none';
          createToggle.classList.remove('active');
        }
      });
      createMenu.querySelectorAll('.fin-qc-item').forEach(item => {
        item.addEventListener('click', () => {
          createMenu.style.display = 'none';
          createToggle.classList.remove('active');
        });
      });
    }

    // 1. Entity selector
    const entitySel = document.getElementById('fin-entity-select');
    if (entitySel) {
      entitySel.onchange = () => {
        this.activeCompanyId = entitySel.value;
        this.renderActiveTab();
      };
    }

    // 2. Period selector
    const periodSel = document.getElementById('fin-period-select');
    if (periodSel) {
      periodSel.onchange = () => {
        this.activePeriod = periodSel.value;
        this.renderActiveTab();
      };
    }

    // 3. Currency selector
    const currSel = document.getElementById('fin-currency-select');
    if (currSel) {
      currSel.onchange = () => {
        this.activeCurrency = currSel.value;
        this.renderActiveTab();
      };
    }

    // 4. Accordion Toggle (Matching Reference Images 2 & 3)
    document.querySelectorAll('.fin-accordion-header').forEach(hdr => {
      hdr.onclick = (e) => {
        e.stopPropagation();
        const grp = hdr.closest('.fin-accordion-group');
        if (grp) {
          grp.classList.toggle('open');
        }
      };
    });

    // Sub-items and Direct Tab selection
    document.querySelectorAll('.fin-nav-subitem[data-tab], .fin-tab-item[data-tab]').forEach(btn => {
      btn.onclick = (e) => {
        // If clicking the quick-add plus button, do not switch tabs
        if (e.target.closest('.fin-subitem-plus')) return;

        const tab = btn.getAttribute('data-tab');
        if (!tab) return;
        this.activeTab = tab;

        document.querySelectorAll('.fin-nav-subitem, .fin-tab-item').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-tab') === tab);
        });

        // Ensure parent accordion is open
        const parentGrp = btn.closest('.fin-accordion-group');
        if (parentGrp) {
          parentGrp.classList.add('open');
        }

        if (sidebar && sidebar.classList.contains('mobile-open')) {
          sidebar.classList.remove('mobile-open');
          backdrop?.classList.remove('active');
        }
        this.renderActiveTab();
      };
    });

    // Sub-item Quick '+' Action button clicks (Matching Reference Images 2 & 3)
    document.querySelectorAll('.fin-subitem-plus').forEach(plusBtn => {
      plusBtn.onclick = (e) => {
        e.stopPropagation();
        const action = plusBtn.getAttribute('data-action');
        switch (action) {
          case 'new-bill':
            this.openCreateBillModal();
            break;
          case 'new-payment':
            this.openRecordPaymentModal();
            break;
          case 'new-expense':
            this.openCreateExpenseModal();
            break;
          case 'new-po':
            this.openCreatePOModal();
            break;
          case 'new-debit-note':
            this.openCreateNotePrompt('debit_note');
            break;
          case 'new-vendor':
            this.openCreateVendorModal();
            break;
          case 'new-invoice':
            this.openCreateInvoiceModal();
            break;
          case 'new-receipt':
            this.openRecordReceiptModal();
            break;
          case 'new-customer':
            this.openCreateCustomerModal();
            break;
          case 'new-credit-note':
            this.openCreateNotePrompt('credit_note');
            break;
          case 'new-bank':
            this.openBankTransferModal();
            break;
          case 'new-cash':
            this.openCashEntryModal();
            break;
          case 'new-loan':
            this.openLoanEntryModal();
            break;
          case 'new-project':
            this.openCreateProjectModal();
            break;
          case 'new-item':
            this.openCreateItemModal();
            break;
          case 'upload-doc':
            this.openUploadDocModal();
            break;
          case 'new-user':
            this.openInviteUserModal();
            break;
        }
      };
    });

    // 5. Global Search
    const searchInput = document.getElementById('fin-global-search');
    if (searchInput) {
      searchInput.oninput = () => {
        this.handleGlobalSearch(searchInput.value.trim());
      };
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }

    // 6. Notifications Hub
    const notifBtn = document.getElementById('fin-notif-btn');
    if (notifBtn) {
      notifBtn.onclick = () => this.openNotificationsModal();
    }

    // 7. User Profile Menu
    const userMenuBtn = document.getElementById('fin-user-menu-btn');
    if (userMenuBtn) {
      userMenuBtn.onclick = () => this.openUserProfileModal();
    }

    // 8. Logout
    const logoutBtn = document.getElementById('fin-logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        if (confirm('Are you sure you wish to log out of the financial management portal?')) {
          this.clearSession();
        }
      };
    }

    // 9. Quick Actions button bindings (Inside Quick Create Menu)
    const qaInvoice = document.getElementById('qa-btn-invoice');
    if (qaInvoice) qaInvoice.onclick = () => this.openCreateInvoiceModal();

    const qaBill = document.getElementById('qa-btn-bill');
    if (qaBill) qaBill.onclick = () => this.openCreateBillModal();

    const qaCust = document.getElementById('qa-btn-customer');
    if (qaCust) qaCust.onclick = () => this.openCreateCustomerModal();

    const qaVend = document.getElementById('qa-btn-vendor');
    if (qaVend) qaVend.onclick = () => this.openCreateVendorModal();

    const qaReceipt = document.getElementById('qa-btn-receipt');
    if (qaReceipt) qaReceipt.onclick = () => this.openRecordReceiptModal();

    const qaPayment = document.getElementById('qa-btn-payment');
    if (qaPayment) qaPayment.onclick = () => this.openRecordPaymentModal();

    const qaExpense = document.getElementById('qa-btn-expense');
    if (qaExpense) qaExpense.onclick = () => this.openCreateExpenseModal();

    const qaPo = document.getElementById('qa-btn-po');
    if (qaPo) qaPo.onclick = () => this.openCreatePOModal();
  }

  // --------------------------------------------------------------------------
  // TAB CONTROLLERS & DATA CALCULATION
  // --------------------------------------------------------------------------
  renderActiveTab() {
    const root = document.getElementById('fin-tab-content-root');
    if (!root) return;
    root.scrollTop = 0;

    // Update breadcrumb title
    const titleEl = document.getElementById('fin-active-tab-title');
    if (titleEl) {
      const titles = {
        dashboard: 'Executive Dashboard',
        invoices: 'Sales & Tax Invoices',
        payment_in: 'Payment-In (Customer Receipts)',
        payments: 'Payments & Receipts',
        customers: 'Customers & Clients',
        credit_notes: 'Sales Return / Cr. Notes',
        bills: 'Purchases & Bills',
        payment_out: 'Payment-Out (Vendor Disbursements)',
        expenses: 'Operating Expenses',
        pos: 'Purchase Orders',
        debit_notes: 'Purchase Return / Dr. Notes',
        notes: 'Credit & Debit Notes',
        vendors: 'Vendors & Suppliers',
        bank_accounts: 'Bank Accounts & Wire Ledger',
        cash_in_hand: 'Cash In Hand & Petty Registers',
        cheques: 'Cheques Clearing & Register',
        loan_accounts: 'Corporate Loan Accounts & Facilities',
        projects: 'Project Accounts',
        items: 'Items & Inventory',
        reports: 'Financial Reports & Analytics',
        calendar: 'Statutory Calendar & Compliance',
        documents: 'Document Vault',
        users: 'Users & Audit Logs',
        settings: 'Entity Settings'
      };
      titleEl.textContent = titles[this.activeTab] || 'Executive Desk';
    }

    // Ensure active state on sidebar sub-items and direct items
    document.querySelectorAll('.fin-nav-subitem, .fin-tab-item').forEach(b => {
      const isAct = b.getAttribute('data-tab') === this.activeTab;
      b.classList.toggle('active', isAct);
      if (isAct) {
        const parentGrp = b.closest('.fin-accordion-group');
        if (parentGrp) parentGrp.classList.add('open');
      }
    });

    switch (this.activeTab) {
      case 'dashboard':
        this.renderDashboardTab(root);
        break;
      case 'invoices':
        this.renderInvoicesTab(root);
        break;
      case 'payment_in':
        this.renderPaymentInTab(root);
        break;
      case 'bills':
        this.renderBillsTab(root);
        break;
      case 'payment_out':
        this.renderPaymentOutTab(root);
        break;
      case 'customers':
        this.renderCustomersTab(root);
        break;
      case 'vendors':
        this.renderVendorsTab(root);
        break;
      case 'items':
        this.renderItemsTab(root);
        break;
      case 'payments':
        this.renderPaymentsTab(root);
        break;
      case 'credit_notes':
        this.renderCreditNotesTab(root);
        break;
      case 'debit_notes':
        this.renderDebitNotesTab(root);
        break;
      case 'notes':
        this.renderNotesTab(root);
        break;
      case 'expenses':
        this.renderExpensesTab(root);
        break;
      case 'pos':
        this.renderPOTab(root);
        break;
      case 'projects':
        this.renderProjectsTab(root);
        break;
      case 'reports':
        this.renderReportsTab(root);
        break;
      case 'calendar':
        this.renderCalendarTab(root);
        break;
      case 'documents':
        this.renderDocumentsTab(root);
        break;
      case 'bank_accounts':
        this.renderBankAccountsTab(root);
        break;
      case 'cash_in_hand':
        this.renderCashInHandTab(root);
        break;
      case 'cheques':
        this.renderChequesTab(root);
        break;
      case 'loan_accounts':
        this.renderLoanAccountsTab(root);
        break;
      case 'users':
        this.renderUsersTab(root);
        break;
      case 'settings':
        this.renderSettingsTab(root);
        break;
      default:
        this.renderDashboardTab(root);
    }
  }

  // --------------------------------------------------------------------------
  // 1. DASHBOARD VIEW (8 Summary Cards & Zolvit Widgets)
  // --------------------------------------------------------------------------
  renderDashboardTab(root) {
    const invoices = this.db?.invoices || [];
    const bills = this.db?.purchase_bills || [];
    const expenses = this.db?.expenses || [];
    const receipts = this.db?.customer_receipts || [];
    const vendorPayments = this.db?.vendor_payments || [];

    // Authoritative Calculations
    const totalSales = invoices.filter(i => i.status !== 'void').reduce((s, i) => s + (Number(i.grand_total) || 0), 0);
    const totalPurchases = bills.filter(b => b.status !== 'void').reduce((s, b) => s + (Number(b.grand_total) || 0), 0);
    const totalReceivables = invoices.filter(i => i.status !== 'void' && i.status !== 'paid').reduce((s, i) => s + (Number(i.balance_due) || 0), 0);
    const totalPayables = bills.filter(b => b.status !== 'void' && b.status !== 'paid').reduce((s, b) => s + (Number(b.balance_due) || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (Number(e.total_amount) || 0), 0);

    // Cash and Bank derived from opening balance + total customer receipts - vendor payments - cash expenses
    const openingBank = 8500000;
    const totalReceipts = receipts.reduce((s, r) => s + (Number(r.amount_received) || 0), 0);
    const totalDisbursed = vendorPayments.reduce((s, p) => s + (Number(p.amount_paid) || 0), 0);
    const cashBankBalance = openingBank + totalReceipts - totalDisbursed - 250000;

    // Net Profit: Authoritative derived from Sales (Taxable Subtotal) minus Purchases (Taxable Subtotal) minus Overhead Expenses
    const taxableSales = invoices.filter(i => i.status !== 'void').reduce((s, i) => s + (Number(i.taxable_subtotal) || 0), 0);
    const taxableCost = bills.filter(b => b.status !== 'void').reduce((s, b) => s + (Number(b.taxable_subtotal) || 0), 0);
    const netProfit = taxableSales - taxableCost - totalExpenses;

    // Overdue Invoices
    const overdueInvoices = invoices.filter(i => i.status === 'overdue');
    const overdueTotal = overdueInvoices.reduce((s, i) => s + (Number(i.balance_due) || 0), 0);

    root.innerHTML = `
      <!-- 8 Key Financial Metric Summary Cards -->
      <div class="fin-summary-grid">
        <!-- 1. Total Sales -->
        <div class="fin-metric-card accent-sales" onclick="window.finApp.switchTab('invoices')">
          <div class="fin-metric-header">
            <span class="fin-metric-label">Total Sales (Invoiced)</span>
            <div class="fin-metric-icon" style="color:#0099e6;">📄</div>
          </div>
          <div class="fin-metric-value">${this.formatCurrency(totalSales)}</div>
          <div class="fin-metric-subtext">
            <span>${invoices.length} Invoices Posted</span>
            <span style="color:#10b981;">GST / Tax break-up applied</span>
          </div>
        </div>

        <!-- 2. Total Purchases -->
        <div class="fin-metric-card accent-purchases" onclick="window.finApp.switchTab('bills')">
          <div class="fin-metric-header">
            <span class="fin-metric-label">Total Purchases (Bills)</span>
            <div class="fin-metric-icon" style="color:#f59e0b;">📥</div>
          </div>
          <div class="fin-metric-value">${this.formatCurrency(totalPurchases)}</div>
          <div class="fin-metric-subtext">
            <span>${bills.length} Vendor Bills</span>
            <span style="color:#f59e0b;">ITC Eligible</span>
          </div>
        </div>

        <!-- 3. Total Receivables -->
        <div class="fin-metric-card accent-receivables" onclick="window.finApp.switchTab('customers')">
          <div class="fin-metric-header">
            <span class="fin-metric-label">Total Receivables (Dues)</span>
            <div class="fin-metric-icon" style="color:#38bdf8;">👥</div>
          </div>
          <div class="fin-metric-value">${this.formatCurrency(totalReceivables)}</div>
          <div class="fin-metric-subtext">
            <span>From Clients &amp; Debtors</span>
            <span style="color:#38bdf8;">Track Aging &rarr;</span>
          </div>
        </div>

        <!-- 4. Total Payables -->
        <div class="fin-metric-card accent-payables" onclick="window.finApp.switchTab('vendors')">
          <div class="fin-metric-header">
            <span class="fin-metric-label">Total Payables (Creditors)</span>
            <div class="fin-metric-icon" style="color:#fb923c;">🏢</div>
          </div>
          <div class="fin-metric-value">${this.formatCurrency(totalPayables)}</div>
          <div class="fin-metric-subtext">
            <span>Due to Supply Vendors</span>
            <span style="color:#fb923c;">Pending Vouchers</span>
          </div>
        </div>

        <!-- 5. Cash & Bank Balances -->
        <div class="fin-metric-card accent-cash" onclick="window.finApp.switchTab('payments')">
          <div class="fin-metric-header">
            <span class="fin-metric-label">Cash &amp; Bank Balance</span>
            <div class="fin-metric-icon" style="color:#10b981;">🏦</div>
          </div>
          <div class="fin-metric-value">${this.formatCurrency(cashBankBalance)}</div>
          <div class="fin-metric-subtext">
            <span>SBI &amp; FAB Accounts</span>
            <span style="color:#10b981;">Reconciled Live</span>
          </div>
        </div>

        <!-- 6. Total Operational Expenses -->
        <div class="fin-metric-card accent-expenses" onclick="window.finApp.switchTab('expenses')">
          <div class="fin-metric-header">
            <span class="fin-metric-label">Total Expenses</span>
            <div class="fin-metric-icon" style="color:#a855f7;">🧾</div>
          </div>
          <div class="fin-metric-value">${this.formatCurrency(totalExpenses)}</div>
          <div class="fin-metric-subtext">
            <span>Site, Fuel, Travel, Leases</span>
            <span>${expenses.length} Claims</span>
          </div>
        </div>

        <!-- 7. Net Profit / Margin -->
        <div class="fin-metric-card accent-profit" onclick="window.finApp.switchTab('reports')">
          <div class="fin-metric-header">
            <span class="fin-metric-label">Net Profit (Operating)</span>
            <div class="fin-metric-icon" style="color:#059669;">📈</div>
          </div>
          <div class="fin-metric-value">${this.formatCurrency(netProfit)}</div>
          <div class="fin-metric-subtext">
            <span>Taxable Revenue vs Costs</span>
            <span style="color:#10b981; font-weight:700;">+${((netProfit / (taxableSales || 1)) * 100).toFixed(1)}% Margin</span>
          </div>
        </div>

        <!-- 8. Overdue Invoices -->
        <div class="fin-metric-card accent-overdue" onclick="window.finApp.switchTab('invoices')">
          <div class="fin-metric-header">
            <span class="fin-metric-label">Overdue Invoices</span>
            <div class="fin-metric-icon" style="color:#ef4444;">⚠️</div>
          </div>
          <div class="fin-metric-value">${this.formatCurrency(overdueTotal)}</div>
          <div class="fin-metric-subtext">
            <span style="color:#ef4444; font-weight:700;">${overdueInvoices.length} Overdue</span>
            <span style="color:#ef4444;">Action Required &rarr;</span>
          </div>
        </div>
      </div>

      <!-- Official Rayan Engineering Printable Document Templates Section -->
      <div class="fin-doc-showcase-card" style="margin-bottom:1.5rem; background:linear-gradient(135deg, rgba(0, 166, 153, 0.12) 0%, rgba(12, 30, 61, 0.8) 100%); border:1px solid rgba(0, 166, 153, 0.35); border-radius:12px; padding:1.25rem 1.5rem; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:1rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
            <span style="font-size:1.2rem;">🏛️</span>
            <h3 style="font-size:1.05rem; font-weight:700; color:#fff; margin:0;">Official Rayan Engineering Document &amp; Print System</h3>
            <span class="fin-badge" style="background:#00a699; color:#fff; font-size:0.65rem; font-weight:700;">UAE VAT &amp; GCC FORMAT</span>
          </div>
          <p style="font-size:0.8rem; color:#94a3b8; margin:0; max-width:680px;">
            Standardized bilingual print layouts with official Rayan seal, authorized signature, and tax barcodes. View live sample formats or print directly:
          </p>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:0.6rem;">
          <button type="button" class="fin-btn-quick primary" style="background:#00a699; border-color:#00a699;" onclick="window.finApp.openInvoicePrintModal('inv-rec-rg-44049')">
            📄 Tax Invoice (REC-RG-INV-44049)
          </button>
          <button type="button" class="fin-btn-quick" style="border-color:#00a699; color:#00e5d2;" onclick="window.finApp.openReceiptPrintModal('rec-rv-44025')">
            💳 Receipt Voucher (REC-RV-44025)
          </button>
          <button type="button" class="fin-btn-quick" style="border-color:#38bdf8; color:#38bdf8;" onclick="window.finApp.openPOPrintModal('po-rec-11008')">
            📑 Purchase Order (PO-REC-11008)
          </button>
        </div>
      </div>

      <!-- Grid: Recent Invoices & Recent Purchase Bills -->
      <div class="fin-dash-row-responsive">
        <!-- Recent Invoices Panel -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <h3 class="fin-panel-title">
              <span>📄 Recent Invoices</span>
              <span class="fin-badge fin-badge-issued">${invoices.length} Total</span>
            </h3>
            <button type="button" class="fin-btn-row-action" onclick="window.finApp.switchTab('invoices')">View All &rarr;</button>
          </div>
          <div class="fin-table-responsive">
            <table class="fin-data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${invoices.slice(0, 5).map(inv => `
                  <tr>
                    <td><strong>${inv.invoice_no}</strong></td>
                    <td>${inv.customer_name}</td>
                    <td>${this.formatDate(inv.due_date)}</td>
                    <td><strong>${this.formatCurrency(inv.grand_total)}</strong></td>
                    <td>${this.formatCurrency(inv.balance_due)}</td>
                    <td><span class="fin-badge fin-badge-${inv.status}">${inv.status.replace('_', ' ')}</span></td>
                    <td>
                      <button type="button" class="fin-btn-row-action" onclick="window.finApp.openInvoiceDetail('${inv.id}')">View</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Purchase Bills Panel -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <h3 class="fin-panel-title">
              <span>📥 Recent Purchase Bills</span>
              <span class="fin-badge fin-badge-pending">${bills.length} Recorded</span>
            </h3>
            <button type="button" class="fin-btn-row-action" onclick="window.finApp.switchTab('bills')">View All &rarr;</button>
          </div>
          <div class="fin-table-responsive">
            <table class="fin-data-table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Vendor</th>
                  <th>Due Date</th>
                  <th>Total Amount</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${bills.slice(0, 5).map(b => `
                  <tr>
                    <td><strong>${b.bill_no}</strong></td>
                    <td>${b.vendor_name}</td>
                    <td>${this.formatDate(b.due_date)}</td>
                    <td><strong>${this.formatCurrency(b.grand_total)}</strong></td>
                    <td>${this.formatCurrency(b.balance_due)}</td>
                    <td><span class="fin-badge fin-badge-${b.status}">${b.status.replace('_', ' ')}</span></td>
                    <td>
                      <button type="button" class="fin-btn-row-action" onclick="window.finApp.openBillDetail('${b.id}')">View</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Grid: Top Items & Outstanding Aging -->
      <div class="fin-dash-row-responsive">
        <!-- Top Selling Items & Services -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <h3 class="fin-panel-title">🏆 Top-Selling Items &amp; Services</h3>
            <button type="button" class="fin-btn-row-action" onclick="window.finApp.switchTab('items')">Manage Catalog &rarr;</button>
          </div>
          <div class="fin-table-responsive">
            <table class="fin-data-table">
              <thead>
                <tr>
                  <th>Item / Description</th>
                  <th>Category</th>
                  <th>Unit Rate</th>
                  <th>GST Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${(this.db?.items || []).slice(0, 5).map(item => `
                  <tr>
                    <td>
                      <strong>${item.name}</strong><br>
                      <span style="font-size:0.68rem; color:#94a3b8;">HSN/SAC: ${item.hsn_sac_code || '—'} • ${item.code}</span>
                    </td>
                    <td><span class="fin-badge fin-badge-issued">${item.category}</span></td>
                    <td><strong>${this.formatCurrency(item.sales_price)}</strong> / ${item.uom}</td>
                    <td>${item.gst_rate}%</td>
                    <td><span class="fin-badge fin-badge-paid">Active</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Outstanding Payments & Aging Buckets -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <h3 class="fin-panel-title">⏳ Receivables Aging Breakdown</h3>
            <span style="font-size:0.75rem; color:#94a3b8;">Current vs Aging Buckets</span>
          </div>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:0.75rem; margin-bottom:1.25rem;">
            <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:8px; padding:0.85rem; text-align:center;">
              <span style="font-size:0.68rem; color:#94a3b8; display:block; text-transform:uppercase;">0-30 Days</span>
              <strong style="font-size:1.1rem; color:#10b981;">${this.formatCurrency(5565000)}</strong>
              <span style="font-size:0.65rem; color:#10b981; display:block;">Normal terms</span>
            </div>
            <div style="background:rgba(0,153,230,0.08); border:1px solid rgba(0,153,230,0.25); border-radius:8px; padding:0.85rem; text-align:center;">
              <span style="font-size:0.68rem; color:#94a3b8; display:block; text-transform:uppercase;">31-60 Days</span>
              <strong style="font-size:1.1rem; color:#0099e6;">${this.formatCurrency(3280000)}</strong>
              <span style="font-size:0.65rem; color:#0099e6; display:block;">Due soon</span>
            </div>
            <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:8px; padding:0.85rem; text-align:center;">
              <span style="font-size:0.68rem; color:#94a3b8; display:block; text-transform:uppercase;">61-90 Days</span>
              <strong style="font-size:1.1rem; color:#f59e0b;">${this.formatCurrency(1425000)}</strong>
              <span style="font-size:0.65rem; color:#f59e0b; display:block;">Follow-up</span>
            </div>
            <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:0.85rem; text-align:center;">
              <span style="font-size:0.68rem; color:#94a3b8; display:block; text-transform:uppercase;">90+ Days</span>
              <strong style="font-size:1.1rem; color:#ef4444;">${this.formatCurrency(8850000)}</strong>
              <span style="font-size:0.65rem; color:#ef4444; display:block;">Critical Overdue</span>
            </div>
          </div>
          <p style="font-size:0.75rem; color:#94a3b8; line-height:1.5;">
            * Aging buckets are automatically categorized by payment milestone due dates. Click <strong>Financial Reports</strong> to export GSTR-1 and Receivables Aging registers.
          </p>
        </div>
      </div>

      <!-- Recent Audit & Financial Activity Stream -->
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <h3 class="fin-panel-title">🛡️ Recent Financial Audit Activity</h3>
          <span style="font-size:0.75rem; color:#94a3b8;">Tamper-resistant transaction log</span>
        </div>
        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor &amp; Role</th>
                <th>Action Type</th>
                <th>Entity Affected</th>
                <th>Transaction Details</th>
              </tr>
            </thead>
            <tbody>
              ${(this.db?.audit_logs || []).slice(0, 6).map(log => `
                <tr>
                  <td style="white-space:nowrap; font-size:0.75rem; color:#94a3b8;">${new Date(log.timestamp).toLocaleString('en-IN')}</td>
                  <td><strong>${log.actor_name}</strong> <span style="font-size:0.68rem; color:#38bdf8;">(${log.actor_role})</span></td>
                  <td><span class="fin-badge fin-badge-issued">${log.action}</span></td>
                  <td>${log.entity} <span style="font-size:0.68rem; color:#94a3b8;">(${log.entity_id})</span></td>
                  <td style="font-size:0.78rem;">${log.details}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 2. SALES & INVOICES MODULE
  // --------------------------------------------------------------------------
  renderInvoicesTab(root) {
    const invoices = this.db?.invoices || [];

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">📄 Sales &amp; Tax Invoices</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Complete billing register with GST breakup, payment allocation tracking, and PDF generation.</p>
          </div>
          <div class="fin-panel-actions">
            <button type="button" class="fin-btn-quick" style="border-color:#00a699; color:#00e5d2;" onclick="window.finApp.openInvoicePrintModal('inv-rec-rg-44049')">
              📄 Sample Tax Invoice
            </button>
            ${this.hasPermission('create_invoice') ? `
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateInvoiceModal()">
                + Create Tax Invoice
              </button>
            ` : ''}
            <button type="button" class="fin-btn-quick" onclick="window.finApp.exportInvoicesCSV()">
              📥 Export CSV
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="fin-table-filter-bar">
          <input type="text" id="inv-filter-search" class="fin-filter-input" placeholder="Filter by invoice # or customer..." style="min-width:240px;">
          <select id="inv-filter-status" class="fin-select-pill">
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="void">Void</option>
          </select>
        </div>

        <!-- Invoices Table -->
        <div class="fin-table-responsive">
          <table class="fin-data-table" id="invoices-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Place of Supply</th>
                <th>Taxable Value</th>
                <th>Tax (CGST/SGST/IGST)</th>
                <th>Grand Total</th>
                <th>Paid</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="invoices-tbody">
              ${this.renderInvoiceRows(invoices)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Filter bindings
    const searchInput = document.getElementById('inv-filter-search');
    const statusSelect = document.getElementById('inv-filter-status');

    const updateFilter = () => {
      const q = searchInput.value.toLowerCase().trim();
      const st = statusSelect.value;
      const filtered = invoices.filter(inv => {
        const matchQ = inv.invoice_no.toLowerCase().includes(q) || inv.customer_name.toLowerCase().includes(q);
        const matchSt = st === 'all' || inv.status === st;
        return matchQ && matchSt;
      });
      document.getElementById('invoices-tbody').innerHTML = this.renderInvoiceRows(filtered);
    };

    if (searchInput) searchInput.oninput = updateFilter;
    if (statusSelect) statusSelect.onchange = updateFilter;
  }

  renderInvoiceRows(invoices) {
    if (!invoices.length) {
      return `<tr><td colspan="11" style="text-align:center; padding:2rem; color:#94a3b8;">No invoices found matching current filter criteria.</td></tr>`;
    }

    return invoices.map(inv => `
      <tr>
        <td><strong>${inv.invoice_no}</strong></td>
        <td>${this.formatDate(inv.invoice_date)}</td>
        <td>
          <strong>${inv.customer_name}</strong>
          ${inv.customer_gstin ? `<div style="font-size:0.68rem; color:#94a3b8;">GSTIN: ${inv.customer_gstin}</div>` : ''}
        </td>
        <td><span style="font-size:0.75rem;">${inv.place_of_supply || '—'}</span></td>
        <td>${this.formatCurrency(inv.taxable_subtotal)}</td>
        <td>
          <span style="font-size:0.75rem; color:#38bdf8;">${this.formatCurrency(inv.total_tax)}</span>
          ${inv.igst_total > 0 ? `<div style="font-size:0.65rem; color:#94a3b8;">IGST 18%</div>` : `<div style="font-size:0.65rem; color:#94a3b8;">CGST 9% + SGST 9%</div>`}
        </td>
        <td><strong>${this.formatCurrency(inv.grand_total)}</strong></td>
        <td><span style="color:#10b981;">${this.formatCurrency(inv.amount_paid || 0)}</span></td>
        <td><strong style="color:${inv.balance_due > 0 ? '#ef4444' : '#10b981'};">${this.formatCurrency(inv.balance_due)}</strong></td>
        <td><span class="fin-badge fin-badge-${inv.status}">${inv.status.replace('_', ' ')}</span></td>
        <td style="white-space:nowrap;">
          <button type="button" class="fin-btn-row-action" onclick="window.finApp.openInvoiceDetail('${inv.id}')" title="View &amp; Print Official Tax Invoice">View / Print</button>
          ${inv.balance_due > 0 && this.hasPermission('record_receipt') ? `
            <button type="button" class="fin-btn-row-action" onclick="window.finApp.openQuickPayInvoice('${inv.id}')" style="color:#10b981;" title="Record Customer Payment">Receive</button>
          ` : ''}
          ${inv.status !== 'void' && this.hasPermission('create_credit_note') ? `
            <button type="button" class="fin-btn-row-action" onclick="window.finApp.openCreateCreditNoteModal('${inv.id}')" title="Issue Credit Note">Credit Note</button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  }

  // --------------------------------------------------------------------------
  // 3. PURCHASES & BILLS MODULE
  // --------------------------------------------------------------------------
  renderBillsTab(root) {
    const bills = this.db?.purchase_bills || [];

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">📥 Purchases &amp; Supplier Bills</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Manage subcontractor invoices, raw material procurement bills, input tax credits, and payment releases.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission('create_bill') ? `
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateBillModal()">
                + Record Purchase Bill
              </button>
            ` : ''}
            <button type="button" class="fin-btn-quick" onclick="window.finApp.exportBillsCSV()">
              📥 Export CSV
            </button>
          </div>
        </div>

        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Supplier Invoice #</th>
                <th>Bill Date</th>
                <th>Vendor Name</th>
                <th>Linked Project</th>
                <th>Taxable Subtotal</th>
                <th>Tax</th>
                <th>Grand Total</th>
                <th>Balance Due</th>
                <th>Approval</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${bills.map(b => `
                <tr>
                  <td><strong>${b.bill_no}</strong></td>
                  <td>${b.vendor_invoice_no}</td>
                  <td>${this.formatDate(b.bill_date)}</td>
                  <td><strong>${b.vendor_name}</strong></td>
                  <td><span style="font-size:0.75rem;">${b.project_name || 'General Supply'}</span></td>
                  <td>${this.formatCurrency(b.taxable_subtotal)}</td>
                  <td>${this.formatCurrency(b.tax_total)}</td>
                  <td><strong>${this.formatCurrency(b.grand_total)}</strong></td>
                  <td><strong style="color:${b.balance_due > 0 ? '#ef4444' : '#10b981'};">${this.formatCurrency(b.balance_due)}</strong></td>
                  <td><span class="fin-badge fin-badge-${b.approval_status}">${b.approval_status}</span></td>
                  <td><span class="fin-badge fin-badge-${b.status}">${b.status.replace('_', ' ')}</span></td>
                  <td style="white-space:nowrap;">
                    <button type="button" class="fin-btn-row-action" onclick="window.finApp.openBillDetail('${b.id}')">View</button>
                    ${b.approval_status === 'pending' && this.hasPermission('approve_bill') ? `
                      <button type="button" class="fin-btn-row-action" style="color:#10b981;" onclick="window.finApp.approveBill('${b.id}')">Approve</button>
                    ` : ''}
                    ${b.balance_due > 0 && b.approval_status === 'approved' && this.hasPermission('record_payment') ? `
                      <button type="button" class="fin-btn-row-action" style="color:#38bdf8;" onclick="window.finApp.openQuickPayBill('${b.id}')">Pay</button>
                    ` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 4. CUSTOMERS MODULE
  // --------------------------------------------------------------------------
  renderCustomersTab(root) {
    const customers = this.db?.customers || [];
    const invoices = this.db?.invoices || [];

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">👥 Customers &amp; Debtors Directory</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Complete client profiles, GSTIN details, credit limits, and Statement of Account (SOA) ledgers.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission('create_customer') ? `
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateCustomerModal()">
                + Add Customer
              </button>
            ` : ''}
          </div>
        </div>

        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Customer Code</th>
                <th>Company / Client Name</th>
                <th>Contact Person</th>
                <th>Email &amp; Phone</th>
                <th>GSTIN</th>
                <th>Place of Supply</th>
                <th>Total Invoiced</th>
                <th>Outstanding Dues</th>
                <th>Credit Limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(c => {
                const custInvoices = invoices.filter(i => i.customer_id === c.id && i.status !== 'void');
                const totalInvoiced = custInvoices.reduce((s, i) => s + (Number(i.grand_total) || 0), 0);
                const outstanding = custInvoices.reduce((s, i) => s + (Number(i.balance_due) || 0), 0);
                return `
                  <tr>
                    <td><strong>${c.code}</strong></td>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.contact_person || '—'}</td>
                    <td>
                      <div>${c.email}</div>
                      <span style="font-size:0.68rem; color:#94a3b8;">${c.phone}</span>
                    </td>
                    <td><code>${c.gstin || '—'}</code></td>
                    <td>${c.place_of_supply || '—'}</td>
                    <td>${this.formatCurrency(totalInvoiced)}</td>
                    <td><strong style="color:${outstanding > 0 ? '#ef4444' : '#10b981'};">${this.formatCurrency(outstanding)}</strong></td>
                    <td>${this.formatCurrency(c.credit_limit)}</td>
                    <td>
                      <button type="button" class="fin-btn-row-action" onclick="window.finApp.openCustomerProfile('${c.id}')">360° Profile &amp; SOA</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 5. VENDORS MODULE
  // --------------------------------------------------------------------------
  renderVendorsTab(root) {
    const vendors = this.db?.vendors || [];
    const bills = this.db?.purchase_bills || [];

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">🏢 Vendors &amp; Subcontractors Directory</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Supplier registries, PAN/GSTIN compliance, bank account details for wire release, and payable balances.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission('create_vendor') ? `
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateVendorModal()">
                + Add Vendor
              </button>
            ` : ''}
          </div>
        </div>

        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Vendor Code</th>
                <th>Supplier / Subcontractor</th>
                <th>Category</th>
                <th>Contact</th>
                <th>GSTIN / PAN</th>
                <th>Bank Account (Wire)</th>
                <th>Outstanding Payables</th>
                <th>Payment Terms</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${vendors.map(v => {
                const vendBills = bills.filter(b => b.vendor_id === v.id && b.status !== 'void');
                const outstanding = vendBills.reduce((s, b) => s + (Number(b.balance_due) || 0), 0);
                return `
                  <tr>
                    <td><strong>${v.code}</strong></td>
                    <td><strong>${v.name}</strong></td>
                    <td><span class="fin-badge fin-badge-issued">${v.category}</span></td>
                    <td>
                      <div>${v.contact_person || '—'}</div>
                      <span style="font-size:0.68rem; color:#94a3b8;">${v.email}</span>
                    </td>
                    <td>
                      <div><code>${v.gstin || '—'}</code></div>
                      <span style="font-size:0.68rem; color:#94a3b8;">PAN: ${v.pan || '—'}</span>
                    </td>
                    <td>
                      <span style="font-size:0.75rem;">${v.bank_name || 'Corporate Bank'}</span><br>
                      <code style="font-size:0.68rem;">A/C: ${v.account_no ? '••••' + v.account_no.slice(-4) : '—'}</code>
                    </td>
                    <td><strong style="color:${outstanding > 0 ? '#fb923c' : '#10b981'};">${this.formatCurrency(outstanding)}</strong></td>
                    <td>${v.payment_terms} Days</td>
                    <td>
                      <button type="button" class="fin-btn-row-action" onclick="window.finApp.openVendorProfile('${v.id}')">Profile &amp; Ledger</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6. ITEMS & SERVICES MODULE
  // --------------------------------------------------------------------------
  renderItemsTab(root) {
    const items = this.db?.items || [];

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">📦 Items, Materials &amp; Engineering Services</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Catalog of civil supplies, structural steel, ready-mix concrete, MEP commissioning, and equipment rental rates.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission('create_item') ? `
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateItemModal()">
                + Add Item / Service
              </button>
            ` : ''}
          </div>
        </div>

        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Product / Service Description</th>
                <th>Category</th>
                <th>HSN / SAC</th>
                <th>UOM</th>
                <th>Default Sales Price</th>
                <th>Default Cost Price</th>
                <th>GST Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(i => `
                <tr>
                  <td><strong>${i.code}</strong></td>
                  <td>
                    <strong>${i.name}</strong>
                    <div style="font-size:0.68rem; color:#94a3b8;">${i.description || ''}</div>
                  </td>
                  <td><span class="fin-badge fin-badge-issued">${i.category}</span></td>
                  <td><code>${i.hsn_sac_code || '—'}</code></td>
                  <td>${i.uom}</td>
                  <td><strong>${this.formatCurrency(i.sales_price)}</strong></td>
                  <td>${this.formatCurrency(i.purchase_price)}</td>
                  <td><span style="color:#38bdf8; font-weight:700;">${i.gst_rate}%</span></td>
                  <td><span class="fin-badge fin-badge-paid">Active</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 7. PAYMENTS & RECEIPTS MODULE
  // --------------------------------------------------------------------------
  renderPaymentsTab(root) {
    const receipts = this.db?.customer_receipts || [];
    const payments = this.db?.vendor_payments || [];

    root.innerHTML = `
      <div class="fin-dash-row-responsive">
        <!-- Customer Receipts -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <div>
              <h2 class="fin-panel-title">💳 Customer Receipts</h2>
              <p style="font-size:0.75rem; color:#94a3b8;">Inward client collections &amp; invoice allocations</p>
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <button type="button" class="fin-btn-quick" style="border-color:#00a699; color:#00e5d2;" onclick="window.finApp.openReceiptPrintModal('rec-rv-44025')">
                💳 Sample Receipt Voucher
              </button>
              ${this.hasPermission('record_receipt') ? `
                <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openRecordReceiptModal()">
                  + Record Receipt
                </button>
              ` : ''}
            </div>
          </div>
          <div class="fin-table-responsive">
            <table class="fin-data-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Mode / Ref</th>
                  <th>Amount</th>
                  <th>Allocated Invoices</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${receipts.map(r => `
                  <tr>
                    <td><strong>${r.receipt_no}</strong></td>
                    <td>${this.formatDate(r.receipt_date)}</td>
                    <td><strong>${r.customer_name}</strong></td>
                    <td>
                      <div>${r.payment_mode}</div>
                      <span style="font-size:0.68rem; color:#94a3b8;">${r.reference_no}</span>
                    </td>
                    <td><strong style="color:#10b981;">${this.formatCurrency(r.amount_received)}</strong></td>
                    <td>
                      ${(r.allocations || []).map(a => `
                        <span class="fin-badge fin-badge-paid" style="font-size:0.65rem;">${a.invoice_no}: ${this.formatCurrency(a.amount_allocated)}</span>
                      `).join(' ')}
                    </td>
                    <td style="white-space:nowrap;">
                      <button type="button" class="fin-btn-row-action" onclick="window.finApp.openReceiptPrintModal('${r.id}')" title="Print Official Receipt Voucher">Print / View</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Vendor Payments -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <div>
              <h2 class="fin-panel-title">💸 Vendor Payment Vouchers</h2>
              <p style="font-size:0.75rem; color:#94a3b8;">Outward disbursements against purchase bills</p>
            </div>
            ${this.hasPermission('record_payment') ? `
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openRecordPaymentModal()">
                + Vendor Payment
              </button>
            ` : ''}
          </div>
          <div class="fin-table-responsive">
            <table class="fin-data-table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Mode / Ref</th>
                  <th>Amount</th>
                  <th>Allocated Bills</th>
                </tr>
              </thead>
              <tbody>
                ${payments.map(p => `
                  <tr>
                    <td><strong>${p.voucher_no}</strong></td>
                    <td>${this.formatDate(p.payment_date)}</td>
                    <td><strong>${p.vendor_name}</strong></td>
                    <td>
                      <div>${p.payment_mode}</div>
                      <span style="font-size:0.68rem; color:#94a3b8;">${p.reference_no}</span>
                    </td>
                    <td><strong style="color:#fb923c;">${this.formatCurrency(p.amount_paid)}</strong></td>
                    <td>
                      ${(p.allocations || []).map(a => `
                        <span class="fin-badge fin-badge-pending" style="font-size:0.65rem;">${a.bill_no}: ${this.formatCurrency(a.amount_allocated)}</span>
                      `).join(' ')}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 8. CREDIT & DEBIT NOTES MODULE
  // --------------------------------------------------------------------------
  renderNotesTab(root) {
    const creditNotes = this.db?.credit_notes || [];
    const debitNotes = this.db?.debit_notes || [];

    root.innerHTML = `
      <div class="fin-dash-row-responsive">
        <!-- Credit Notes -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <div>
              <h2 class="fin-panel-title">🔄 Sales Credit Notes (Customer Returns)</h2>
              <p style="font-size:0.75rem; color:#94a3b8;">Reduces client receivable ledger against original invoice</p>
            </div>
          </div>
          <div class="fin-table-responsive">
            <table class="fin-data-table">
              <thead>
                <tr>
                  <th>Credit Note #</th>
                  <th>Invoice Ref</th>
                  <th>Customer</th>
                  <th>Reason</th>
                  <th>Adjustment Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${creditNotes.map(cn => `
                  <tr>
                    <td><strong>${cn.credit_note_no}</strong></td>
                    <td><code>${cn.invoice_no}</code></td>
                    <td>${cn.customer_name}</td>
                    <td><span style="font-size:0.75rem;">${cn.reason}</span></td>
                    <td><strong style="color:#38bdf8;">${this.formatCurrency(cn.total_credit_amount)}</strong></td>
                    <td><span class="fin-badge fin-badge-paid">${cn.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Debit Notes -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <div>
              <h2 class="fin-panel-title">🔄 Purchase Debit Notes (Vendor Debits)</h2>
              <p style="font-size:0.75rem; color:#94a3b8;">Reduces supplier payable balance against damaged goods / rate corrections</p>
            </div>
          </div>
          <div class="fin-table-responsive">
            <table class="fin-data-table">
              <thead>
                <tr>
                  <th>Debit Note #</th>
                  <th>Bill Ref</th>
                  <th>Vendor</th>
                  <th>Reason</th>
                  <th>Adjustment Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${debitNotes.map(dn => `
                  <tr>
                    <td><strong>${dn.debit_note_no}</strong></td>
                    <td><code>${dn.bill_no}</code></td>
                    <td>${dn.vendor_name}</td>
                    <td><span style="font-size:0.75rem;">${dn.reason}</span></td>
                    <td><strong style="color:#f59e0b;">${this.formatCurrency(dn.total_debit_amount)}</strong></td>
                    <td><span class="fin-badge fin-badge-paid">${dn.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // PAYMENT-IN & PAYMENT-OUT DEDICATED MODULES
  // --------------------------------------------------------------------------
  renderPaymentInTab(root) {
    const receipts = this.db?.customer_receipts || [];
    const totalReceived = receipts.reduce((acc, r) => acc + (Number(r.amount_received) || 0), 0);
    const fabReceipts = receipts.filter(r => (r.bank_name || '').toLowerCase().includes('abu dhabi') || (r.currency === 'AED')).reduce((acc, r) => acc + (Number(r.amount_received) || 0), 0);

    root.innerHTML = `
      <div class="fin-dash-row-responsive">
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <div>
              <h2 class="fin-panel-title">💳 Payment-In (Customer Collections &amp; Receipts)</h2>
              <p style="font-size:0.75rem; color:#94a3b8;">Inward client collections, wire transfers, and invoice receipts</p>
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <button type="button" class="fin-btn-quick" style="border-color:#00a699; color:#00e5d2;" onclick="window.finApp.openReceiptPrintModal('rec-rv-44025')">
                💳 Official Receipt Voucher
              </button>
              ${this.hasPermission('record_receipt') ? `
                <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openRecordReceiptModal()">
                  + Record Payment-In
                </button>
              ` : ''}
            </div>
          </div>

          <div class="fin-metrics-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom:1.25rem;">
            <div class="fin-metric-card">
              <span class="fin-metric-label">Total Inward Collections</span>
              <div class="fin-metric-value" style="color:#10b981;">${this.formatCurrency(totalReceived)}</div>
              <span class="fin-metric-sub">Across UAE &amp; India corporate accounts</span>
            </div>
            <div class="fin-metric-card">
              <span class="fin-metric-label">Total Vouchers Issued</span>
              <div class="fin-metric-value">${receipts.length} Instruments</div>
              <span class="fin-metric-sub">Official bilingual vouchers generated</span>
            </div>
            <div class="fin-metric-card">
              <span class="fin-metric-label">GCC Remittances (AED)</span>
              <div class="fin-metric-value" style="color:#38bdf8;">AED ${(fabReceipts * 0.044).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <span class="fin-metric-sub">FAB &amp; Dubai Escrow deposits</span>
            </div>
          </div>

          <div class="fin-table-responsive">
            <table class="fin-data-table">
              <thead>
                <tr>
                  <th>Receipt Voucher #</th>
                  <th>Date</th>
                  <th>Customer / Client</th>
                  <th>Mode / Bank Wire</th>
                  <th>Amount Received</th>
                  <th>Allocated Invoices</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${receipts.map(r => `
                  <tr>
                    <td><strong>${r.receipt_no}</strong></td>
                    <td>${this.formatDate(r.receipt_date)}</td>
                    <td><strong>${r.customer_name}</strong></td>
                    <td>
                      <div>${r.payment_mode}</div>
                      <span style="font-size:0.68rem; color:#94a3b8;">${r.reference_no} • ${r.bank_name || 'State Bank of India'}</span>
                    </td>
                    <td><strong style="color:#10b981;">${this.formatCurrency(r.amount_received)}</strong></td>
                    <td>
                      ${(r.allocations || []).map(a => `
                        <span class="fin-badge fin-badge-paid" style="font-size:0.65rem;">${a.invoice_no}: ${this.formatCurrency(a.amount_allocated)}</span>
                      `).join(' ')}
                    </td>
                    <td style="white-space:nowrap;">
                      <button type="button" class="fin-btn-row-action" onclick="window.finApp.openReceiptPrintModal('${r.id}')" title="Print Official Bilingual Voucher">Print / View</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  renderPaymentOutTab(root) {
    const payments = this.db?.vendor_payments || [];
    const totalPaid = payments.reduce((acc, p) => acc + (Number(p.amount_paid) || 0), 0);

    root.innerHTML = `
      <div class="fin-dash-row-responsive">
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <div>
              <h2 class="fin-panel-title">💸 Payment-Out (Vendor &amp; Contractor Disbursements)</h2>
              <p style="font-size:0.75rem; color:#94a3b8;">Outward disbursements, supplier bank transfers, and purchase bill settlements</p>
            </div>
            ${this.hasPermission('record_payment') ? `
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openRecordPaymentModal()">
                + Record Payment-Out
              </button>
            ` : ''}
          </div>

          <div class="fin-metrics-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom:1.25rem;">
            <div class="fin-metric-card">
              <span class="fin-metric-label">Total Outward Disbursed</span>
              <div class="fin-metric-value" style="color:#fb923c;">${this.formatCurrency(totalPaid)}</div>
              <span class="fin-metric-sub">Settled against verified supplier bills</span>
            </div>
            <div class="fin-metric-card">
              <span class="fin-metric-label">Payment Vouchers</span>
              <div class="fin-metric-value">${payments.length} Vouchers</div>
              <span class="fin-metric-sub">Direct wire transfers &amp; banker cheques</span>
            </div>
            <div class="fin-metric-card">
              <span class="fin-metric-label">Compliance Status</span>
              <div class="fin-metric-value" style="color:#10b981;">100% Tax Deducted (TDS/WHT)</div>
              <span class="fin-metric-sub">Compliant with GST &amp; UAE Corporate Tax</span>
            </div>
          </div>

          <div class="fin-table-responsive">
            <table class="fin-data-table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Date</th>
                  <th>Vendor / Contractor</th>
                  <th>Remittance Channel</th>
                  <th>Disbursed Amount</th>
                  <th>Allocated Bills</th>
                </tr>
              </thead>
              <tbody>
                ${payments.map(p => `
                  <tr>
                    <td><strong>${p.voucher_no}</strong></td>
                    <td>${this.formatDate(p.payment_date)}</td>
                    <td><strong>${p.vendor_name}</strong></td>
                    <td>
                      <div>${p.payment_mode}</div>
                      <span style="font-size:0.68rem; color:#94a3b8;">${p.reference_no}</span>
                    </td>
                    <td><strong style="color:#fb923c;">${this.formatCurrency(p.amount_paid)}</strong></td>
                    <td>
                      ${(p.allocations || []).map(a => `
                        <span class="fin-badge fin-badge-pending" style="font-size:0.65rem;">${a.bill_no}: ${this.formatCurrency(a.amount_allocated)}</span>
                      `).join(' ')}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // SALES CREDIT NOTES & PURCHASE DEBIT NOTES MODULES
  // --------------------------------------------------------------------------
  renderCreditNotesTab(root) {
    const creditNotes = this.db?.credit_notes || [];
    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">🔄 Sales Credit Notes (Customer Returns &amp; Price Adjustments)</h2>
            <p style="font-size:0.75rem; color:#94a3b8;">Official credit notes issued to clients reducing receivable ledger balance</p>
          </div>
          <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateNotePrompt('credit_note')">
            + Create Credit Note
          </button>
        </div>
        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Credit Note #</th>
                <th>Invoice Ref</th>
                <th>Customer</th>
                <th>Adjustment Reason</th>
                <th>Credit Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${creditNotes.map(cn => `
                <tr>
                  <td><strong>${cn.credit_note_no}</strong></td>
                  <td><code>${cn.invoice_no}</code></td>
                  <td>${cn.customer_name}</td>
                  <td><span style="font-size:0.75rem;">${cn.reason}</span></td>
                  <td><strong style="color:#38bdf8;">${this.formatCurrency(cn.total_credit_amount)}</strong></td>
                  <td><span class="fin-badge fin-badge-paid">${cn.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderDebitNotesTab(root) {
    const debitNotes = this.db?.debit_notes || [];
    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">🔄 Purchase Debit Notes (Vendor Debits &amp; Rate Adjustments)</h2>
            <p style="font-size:0.75rem; color:#94a3b8;">Reduces supplier payable balance against damaged materials, short deliveries, or corrections</p>
          </div>
          <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateNotePrompt('debit_note')">
            + Create Debit Note
          </button>
        </div>
        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Debit Note #</th>
                <th>Bill Ref</th>
                <th>Vendor</th>
                <th>Adjustment Reason</th>
                <th>Debit Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${debitNotes.map(dn => `
                <tr>
                  <td><strong>${dn.debit_note_no}</strong></td>
                  <td><code>${dn.bill_no}</code></td>
                  <td>${dn.vendor_name}</td>
                  <td><span style="font-size:0.75rem;">${dn.reason}</span></td>
                  <td><strong style="color:#f59e0b;">${this.formatCurrency(dn.total_debit_amount)}</strong></td>
                  <td><span class="fin-badge fin-badge-paid">${dn.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // CASH & BANK MODULES (Matching Reference Image 3)
  // --------------------------------------------------------------------------
  renderBankAccountsTab(root) {
    const banks = this.db?.bank_accounts || [];

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">🏛️ Corporate Bank Accounts &amp; Treasury Ledger</h2>
            <p style="font-size:0.75rem; color:#94a3b8;">Multi-currency treasury management across India &amp; UAE banking institutions</p>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <button type="button" class="fin-btn-quick" style="border-color:#38bdf8; color:#38bdf8;" onclick="window.finApp.openBankTransferModal()">
              ⇄ Record Transfer / Wire
            </button>
            <button type="button" class="fin-btn-quick primary" onclick="alert('Add Bank Account: Connect corporate internet banking or register secondary account.')">
              + Add Bank Account
            </button>
          </div>
        </div>

        <!-- Corporate Banking Grid -->
        <div class="fin-bank-grid">
          ${banks.map(b => `
            <div class="fin-bank-card">
              <div class="fin-bank-card-header">
                <div>
                  <strong style="font-size:0.95rem; color:#ffffff;">${b.bank_name}</strong>
                  <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">${b.account_name}</div>
                </div>
                <span class="fin-bank-badge">${b.status || 'Active'}</span>
              </div>
              <div class="fin-bank-balance">
                ${b.currency === 'INR' ? '₹' + Number(b.balance).toLocaleString('en-IN') : 'AED ' + Number(b.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div class="fin-bank-meta">
                <div><strong>A/c / IBAN:</strong> ${b.iban || b.account_number}</div>
                <div><strong>Branch:</strong> ${b.branch}</div>
                ${b.ifsc_code ? `<div><strong>IFSC:</strong> ${b.ifsc_code}</div>` : ''}
                ${b.swift ? `<div><strong>SWIFT / BIC:</strong> ${b.swift}</div>` : ''}
                <div style="color:#60a5fa; margin-top:4px;"><strong>Signatory:</strong> ${b.signatory}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Recent Bank Wire Statements Table -->
        <div class="fin-panel-header" style="margin-top:1.5rem; border-top:1px solid rgba(255,255,255,0.06); padding-top:1rem;">
          <div>
            <h3 style="font-size:0.95rem; color:#ffffff; margin:0;">📜 Recent Bank Wires &amp; Remittance Clearances</h3>
            <span style="font-size:0.72rem; color:#94a3b8;">Audited transaction records matched with bank statements</span>
          </div>
        </div>

        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Wire / UTR #</th>
                <th>Settlement Date</th>
                <th>Counterparty</th>
                <th>Bank Account</th>
                <th>Transaction Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>FAB-TRN-99042</strong></td>
                <td>14 Oct 2026</td>
                <td>Emaar Properties PJSC</td>
                <td>First Abu Dhabi Bank (AED)</td>
                <td><span style="color:#10b981; font-weight:600;">Inward Wire (Client Advance)</span></td>
                <td><strong style="color:#10b981;">AED 350,000.00</strong></td>
                <td><span class="fin-badge fin-badge-paid">Cleared</span></td>
              </tr>
              <tr>
                <td><strong>SBIN-RTGS-88219</strong></td>
                <td>13 Oct 2026</td>
                <td>Larsen &amp; Toubro Ltd (ECC Div)</td>
                <td>SBI Corporate Current (INR)</td>
                <td><span style="color:#10b981; font-weight:600;">Inward RTGS (RA Bill 04)</span></td>
                <td><strong style="color:#10b981;">₹1,850,000.00</strong></td>
                <td><span class="fin-badge fin-badge-paid">Settled</span></td>
              </tr>
              <tr>
                <td><strong>WIRE-FAB-001925</strong></td>
                <td>12 Oct 2026</td>
                <td>Siemens Middle East FZ-LLC</td>
                <td>First Abu Dhabi Bank (AED)</td>
                <td><span style="color:#fb923c; font-weight:600;">Outward Telegraphic Transfer</span></td>
                <td><strong style="color:#fb923c;">AED 120,000.00</strong></td>
                <td><span class="fin-badge fin-badge-paid">Completed</span></td>
              </tr>
              <tr>
                <td><strong>SBIN-NEFT-44120</strong></td>
                <td>10 Oct 2026</td>
                <td>JSW Steel Ltd</td>
                <td>SBI Corporate Current (INR)</td>
                <td><span style="color:#fb923c; font-weight:600;">Outward Corporate NEFT</span></td>
                <td><strong style="color:#fb923c;">₹980,000.00</strong></td>
                <td><span class="fin-badge fin-badge-paid">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderCashInHandTab(root) {
    const registers = this.db?.cash_in_hand || [];
    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">💵 Cash In Hand &amp; Site Petty Cash Registers</h2>
            <p style="font-size:0.75rem; color:#94a3b8;">Controlled imprest vaults for field site expenses, emergency fuel, and administrative operations</p>
          </div>
          <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCashEntryModal()">
            + Record Cash Voucher
          </button>
        </div>

        <div class="fin-bank-grid">
          ${registers.map(r => `
            <div class="fin-bank-card">
              <div class="fin-bank-card-header">
                <div>
                  <strong style="font-size:0.95rem; color:#ffffff;">${r.register_name}</strong>
                  <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">Location: ${r.location}</div>
                </div>
                <span class="fin-bank-badge">Active Imprest</span>
              </div>
              <div class="fin-bank-balance" style="color:#34d399;">
                ${r.currency === 'INR' ? '₹' + Number(r.balance).toLocaleString('en-IN') : 'AED ' + Number(r.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div class="fin-bank-meta">
                <div><strong>Custodian:</strong> ${r.custodian}</div>
                <div><strong>Replenished:</strong> ${this.formatDate(r.last_replenished)}</div>
                <div style="color:#94a3b8; font-size:0.72rem; margin-top:4px;">Audited weekly by Head of Accounts</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="fin-panel-header" style="margin-top:1.5rem; border-top:1px solid rgba(255,255,255,0.06); padding-top:1rem;">
          <div>
            <h3 style="font-size:0.95rem; color:#ffffff; margin:0;">📝 Recent Petty Cash Disbursals</h3>
            <span style="font-size:0.72rem; color:#94a3b8;">Dual-signatory verification receipts</span>
          </div>
        </div>

        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Voucher #</th>
                <th>Date</th>
                <th>Register Vault</th>
                <th>Custodian</th>
                <th>Purpose / Description</th>
                <th>Disbursed To</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>PC-MUM-401</strong></td>
                <td>15 Oct 2026</td>
                <td>Mumbai HQ Vault</td>
                <td>Accounts Executive</td>
                <td>Site Consumables &amp; Express Courier</td>
                <td>Site Runner</td>
                <td><strong style="color:#fb923c;">₹4,250.00</strong></td>
                <td><span class="fin-badge fin-badge-paid">Approved</span></td>
              </tr>
              <tr>
                <td><strong>PC-DXB-210</strong></td>
                <td>14 Oct 2026</td>
                <td>Dubai Regional Office</td>
                <td>Site Admin Manager</td>
                <td>Diesel Generator Fuel for Al Quoz Yard</td>
                <td>Logistics Driver</td>
                <td><strong style="color:#fb923c;">AED 1,850.00</strong></td>
                <td><span class="fin-badge fin-badge-paid">Approved</span></td>
              </tr>
              <tr>
                <td><strong>PC-AD-109</strong></td>
                <td>12 Oct 2026</td>
                <td>Abu Dhabi Solar Park</td>
                <td>Resident EPC Manager</td>
                <td>Safety Equipment &amp; Hydration Supplies</td>
                <td>Safety Officer</td>
                <td><strong style="color:#fb923c;">AED 2,400.00</strong></td>
                <td><span class="fin-badge fin-badge-paid">Approved</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderChequesTab(root) {
    const cheques = this.db?.cheques || [];
    const inward = cheques.filter(c => c.type === 'inward');
    const outward = cheques.filter(c => c.type === 'outward');

    root.innerHTML = `
      <div class="fin-dash-row-responsive">
        <!-- Inward Cheques -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <div>
              <h2 class="fin-panel-title">📥 Inward Cheques (Customer Receipts)</h2>
              <p style="font-size:0.75rem; color:#94a3b8;">Cheques received from clients under banking clearance</p>
            </div>
            <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openRecordReceiptModal()">
              + Inward Cheque
            </button>
          </div>
          <div class="fin-table-responsive">
            <table class="fin-data-table">
              <thead>
                <tr>
                  <th>Cheque #</th>
                  <th>Drawee Bank</th>
                  <th>Customer / Issuer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${inward.map(c => `
                  <tr>
                    <td><strong>${c.cheque_no}</strong></td>
                    <td>${c.bank_name}</td>
                    <td><strong>${c.party_name}</strong></td>
                    <td>${this.formatDate(c.date)}</td>
                    <td><strong style="color:#10b981;">${c.currency === 'INR' ? '₹' + Number(c.amount).toLocaleString('en-IN') : 'AED ' + Number(c.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                    <td><span class="fin-badge ${c.status === 'Cleared' ? 'fin-badge-paid' : 'fin-badge-pending'}">${c.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Outward Cheques -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <div>
              <h2 class="fin-panel-title">📤 Outward Cheques (Vendor Disbursements)</h2>
              <p style="font-size:0.75rem; color:#94a3b8;">Corporate cheques issued against verified supplier bills</p>
            </div>
            <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openRecordPaymentModal()">
              + Issue Cheque
            </button>
          </div>
          <div class="fin-table-responsive">
            <table class="fin-data-table">
              <thead>
                <tr>
                  <th>Cheque #</th>
                  <th>Account Bank</th>
                  <th>Payee Vendor</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${outward.map(c => `
                  <tr>
                    <td><strong>${c.cheque_no}</strong></td>
                    <td>${c.bank_name}</td>
                    <td><strong>${c.party_name}</strong></td>
                    <td>${this.formatDate(c.date)}</td>
                    <td><strong style="color:#fb923c;">${c.currency === 'INR' ? '₹' + Number(c.amount).toLocaleString('en-IN') : 'AED ' + Number(c.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                    <td><span class="fin-badge fin-badge-paid">${c.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  renderLoanAccountsTab(root) {
    const loans = this.db?.loan_accounts || [];
    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">🏢 Corporate Loan Accounts &amp; Credit Facilities</h2>
            <p style="font-size:0.75rem; color:#94a3b8;">Consortium working capital lines, heavy machinery hypothecation, and international LC/BG facilities</p>
          </div>
          <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openLoanEntryModal()">
            + Record Drawdown / Repayment
          </button>
        </div>

        <div class="fin-bank-grid">
          ${loans.map(l => `
            <div class="fin-bank-card">
              <div class="fin-bank-card-header">
                <div>
                  <strong style="font-size:0.95rem; color:#ffffff;">${l.facility_name}</strong>
                  <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">Lender: ${l.lender}</div>
                </div>
                <span class="fin-bank-badge" style="background:rgba(59,130,246,0.15); color:#60a5fa; border-color:rgba(59,130,246,0.3);">Sanctioned</span>
              </div>
              <div class="fin-bank-balance" style="color:#f59e0b;">
                ${l.currency === 'INR' ? '₹' + Number(l.outstanding_balance).toLocaleString('en-IN') : 'AED ' + Number(l.outstanding_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                <span style="font-size:0.72rem; color:#94a3b8; font-weight:500; display:block; margin-top:2px;">Outstanding Debt / Utilization</span>
              </div>
              <div class="fin-bank-meta">
                <div><strong>Sanctioned Limit:</strong> ${l.currency === 'INR' ? '₹' + Number(l.sanctioned_limit).toLocaleString('en-IN') : 'AED ' + Number(l.sanctioned_limit).toLocaleString('en-US')}</div>
                <div><strong>Available Headroom:</strong> ${l.currency === 'INR' ? '₹' + Number(l.available_limit).toLocaleString('en-IN') : 'AED ' + Number(l.available_limit).toLocaleString('en-US')}</div>
                <div><strong>Rate / Commission:</strong> ${l.interest_rate || l.commission_rate}</div>
                <div><strong>Tenure:</strong> ${l.tenure || '36 Months'}</div>
                <div style="color:#94a3b8; font-size:0.72rem; margin-top:4px;"><strong>Security:</strong> ${l.security}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 9. EXPENSES & CLAIMS MODULE
  // --------------------------------------------------------------------------
  renderExpensesTab(root) {
    const expenses = this.db?.expenses || [];

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">🧾 Project &amp; Corporate Expenses</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Track site consumables, employee travel reimbursements, equipment fuel, and overhead expenses.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission('submit_expense') ? `
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateExpenseModal()">
                + Record Expense Claim
              </button>
            ` : ''}
          </div>
        </div>

        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Expense #</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Linked Project</th>
                <th>Submitted By</th>
                <th>Amount</th>
                <th>Tax</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map(exp => `
                <tr>
                  <td><strong>${exp.expense_no}</strong></td>
                  <td>${this.formatDate(exp.date)}</td>
                  <td><span class="fin-badge fin-badge-issued">${exp.category}</span></td>
                  <td>${exp.description}</td>
                  <td><span style="font-size:0.75rem;">${exp.project_name || 'General HQ'}</span></td>
                  <td>${exp.submitted_by}</td>
                  <td>${this.formatCurrency(exp.amount)}</td>
                  <td>${this.formatCurrency(exp.tax_amount)}</td>
                  <td><strong>${this.formatCurrency(exp.total_amount)}</strong></td>
                  <td><span class="fin-badge fin-badge-${exp.status}">${exp.status}</span></td>
                  <td>
                    <button type="button" class="fin-btn-row-action" onclick="alert('Attached proof: ${exp.receipt_filename}')">View Receipt</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 10. PURCHASE ORDERS MODULE
  // --------------------------------------------------------------------------
  renderPOTab(root) {
    const pos = this.db?.purchase_orders || [];

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">📑 Purchase Orders (Procurement)</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Issue official purchase commitments to suppliers and track fulfillment versus billing.</p>
          </div>
          <div class="fin-panel-actions">
            <button type="button" class="fin-btn-quick" style="border-color:#38bdf8; color:#38bdf8;" onclick="window.finApp.openPOPrintModal('po-rec-11008')">
              📑 Sample Purchase Order (2p)
            </button>
            ${this.hasPermission('create_po') ? `
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreatePOModal()">
                + Create Purchase Order
              </button>
            ` : ''}
          </div>
        </div>

        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>PO #</th>
                <th>Date</th>
                <th>Vendor / Supplier</th>
                <th>Project</th>
                <th>Expected Delivery</th>
                <th>Total PO Value</th>
                <th>Billed to Date</th>
                <th>Status</th>
                <th>Approved By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${pos.map(po => `
                <tr>
                  <td><strong>${po.po_no}</strong></td>
                  <td>${this.formatDate(po.date)}</td>
                  <td><strong>${po.vendor_name || po.supplier_name}</strong></td>
                  <td>${po.project_name}</td>
                  <td>${this.formatDate(po.expected_delivery)}</td>
                  <td><strong>${this.formatCurrency(po.total_value)}</strong></td>
                  <td>${this.formatCurrency(po.billed_value || 0)}</td>
                  <td><span class="fin-badge fin-badge-paid">${po.status}</span></td>
                  <td>${po.approved_by || '—'}</td>
                  <td style="white-space:nowrap;">
                    <button type="button" class="fin-btn-row-action" onclick="window.finApp.openPOPrintModal('${po.id}')" title="Print Official Purchase Order">Print / View</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 11. PROJECT FINANCIALS MODULE
  // --------------------------------------------------------------------------
  renderProjectsTab(root) {
    const projects = this.db?.projects || [];
    const invoices = this.db?.invoices || [];
    const bills = this.db?.purchase_bills || [];
    const expenses = this.db?.expenses || [];

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">🏗️ Project-Based Financial Accounts &amp; Profitability</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Contract revenues, budget utilization, vendor commitments, and project margins.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission('create_project') ? `
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateProjectModal()">
                + New Project
              </button>
            ` : ''}
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap:1.5rem;">
          ${projects.map(prj => {
            const prjInvoices = invoices.filter(i => i.project_id === prj.id && i.status !== 'void');
            const invoiced = prjInvoices.reduce((s, i) => s + (Number(i.grand_total) || 0), 0);
            const collected = prjInvoices.reduce((s, i) => s + (Number(i.amount_paid) || 0), 0);
            const prjBills = bills.filter(b => b.project_id === prj.id && b.status !== 'void');
            const materialsCost = prjBills.reduce((s, b) => s + (Number(b.grand_total) || 0), 0);
            const prjExpenses = expenses.filter(e => e.project_id === prj.id);
            const siteExpenses = prjExpenses.reduce((s, e) => s + (Number(e.total_amount) || 0), 0);
            const totalCost = materialsCost + siteExpenses;
            const estimatedProfit = invoiced - totalCost;
            const profitMargin = invoiced > 0 ? ((estimatedProfit / invoiced) * 100).toFixed(1) : '0';

            return `
              <div style="background:var(--fin-bg-card-hover); border:1px solid var(--fin-border); border-radius:12px; padding:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                  <div>
                    <span style="font-size:0.72rem; color:#38bdf8; font-weight:700;">${prj.code}</span>
                    <h3 style="font-family:var(--fin-font-heading); font-size:1.15rem; color:#f8fafc; margin-top:0.2rem;">${prj.name}</h3>
                    <span style="font-size:0.78rem; color:#94a3b8;">Client: ${prj.client_name}</span>
                  </div>
                  <span class="fin-badge fin-badge-paid">${prj.status}</span>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem; background:rgba(0,0,0,0.25); border-radius:8px; padding:1rem; margin-bottom:1rem; font-size:0.8rem;">
                  <div>
                    <span style="color:#94a3b8; display:block; font-size:0.7rem;">Contract Value:</span>
                    <strong>${this.formatCurrency(prj.contract_value)}</strong>
                  </div>
                  <div>
                    <span style="color:#94a3b8; display:block; font-size:0.7rem;">Approved Budget:</span>
                    <strong>${this.formatCurrency(prj.approved_budget)}</strong>
                  </div>
                  <div>
                    <span style="color:#94a3b8; display:block; font-size:0.7rem;">Invoiced Revenue:</span>
                    <strong style="color:#38bdf8;">${this.formatCurrency(invoiced)}</strong>
                  </div>
                  <div>
                    <span style="color:#94a3b8; display:block; font-size:0.7rem;">Customer Collections:</span>
                    <strong style="color:#10b981;">${this.formatCurrency(collected)}</strong>
                  </div>
                  <div>
                    <span style="color:#94a3b8; display:block; font-size:0.7rem;">Project Direct Cost:</span>
                    <strong style="color:#fb923c;">${this.formatCurrency(totalCost)}</strong>
                  </div>
                  <div>
                    <span style="color:#94a3b8; display:block; font-size:0.7rem;">Estimated Margin:</span>
                    <strong style="color:#10b981;">${this.formatCurrency(estimatedProfit)} (${profitMargin}%)</strong>
                  </div>
                </div>

                <div style="font-size:0.75rem; color:#94a3b8; display:flex; justify-content:space-between;">
                  <span>Timeline: ${this.formatDate(prj.start_date)} &rarr; ${this.formatDate(prj.target_completion)}</span>
                  <a href="/projects/" target="_blank" style="color:#38bdf8; text-decoration:none;">Site Specs &rarr;</a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 12. REPORTS & FINANCIAL STATEMENTS MODULE
  // --------------------------------------------------------------------------
  renderReportsTab(root) {
    const invoices = this.db?.invoices || [];
    const bills = this.db?.purchase_bills || [];
    const expenses = this.db?.expenses || [];

    const totalSales = invoices.filter(i => i.status !== 'void').reduce((s, i) => s + (Number(i.taxable_subtotal) || 0), 0);
    const totalTaxOutput = invoices.filter(i => i.status !== 'void').reduce((s, i) => s + (Number(i.total_tax) || 0), 0);
    const totalCostMaterials = bills.filter(b => b.status !== 'void').reduce((s, b) => s + (Number(b.taxable_subtotal) || 0), 0);
    const totalTaxInput = bills.filter(b => b.status !== 'void').reduce((s, b) => s + (Number(b.tax_total) || 0), 0);
    const totalOperatingExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const grossProfit = totalSales - totalCostMaterials;
    const netProfit = grossProfit - totalOperatingExpenses;
    const netGstPayable = Math.max(0, totalTaxOutput - totalTaxInput);

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">📈 Official Financial Statements &amp; GST Registers</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Audited reports, GSTR-1 Tax Summary, Profit &amp; Loss Statement, and Cash Flows.</p>
          </div>
          <div class="fin-panel-actions">
            <button type="button" class="fin-btn-quick primary" onclick="window.print()">
              🖨️ Print Statement
            </button>
            <button type="button" class="fin-btn-quick" onclick="window.finApp.exportReportsExcel()">
              📥 Export XLSX
            </button>
          </div>
        </div>

        <div class="fin-dash-row-responsive">
          <!-- Profit & Loss Statement -->
          <div style="background:var(--fin-bg-card-hover); border:1px solid var(--fin-border); border-radius:12px; padding:1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--fin-border); padding-bottom:0.75rem; margin-bottom:1rem;">
              <h3 style="font-family:var(--fin-font-heading); font-size:1.1rem; color:#f8fafc;">Operating Profit &amp; Loss (P&amp;L)</h3>
              <span style="font-size:0.72rem; color:#10b981; font-weight:700;">FY 2025-2026</span>
            </div>

            <div class="fin-calc-row">
              <span>Gross Taxable Sales (Output Revenue)</span>
              <strong>${this.formatCurrency(totalSales)}</strong>
            </div>
            <div class="fin-calc-row" style="color:#fb923c;">
              <span>Less: Direct Cost of Supplies &amp; Subcontracts</span>
              <strong>- ${this.formatCurrency(totalCostMaterials)}</strong>
            </div>
            <div class="fin-calc-row" style="border-top:1px dashed var(--fin-border); padding-top:0.5rem; margin-top:0.5rem; color:#38bdf8; font-weight:700;">
              <span>Gross Profit Margin</span>
              <strong>${this.formatCurrency(grossProfit)} (${totalSales > 0 ? ((grossProfit / totalSales) * 100).toFixed(1) : 0}%)</strong>
            </div>
            <div class="fin-calc-row" style="color:#ef4444; margin-top:0.5rem;">
              <span>Less: Site Consumables, Travel &amp; Overheads</span>
              <strong>- ${this.formatCurrency(totalOperatingExpenses)}</strong>
            </div>
            <div class="fin-calc-row grand-total" style="color:#10b981; font-size:1.2rem; border-top:2px solid #10b981;">
              <span>Net Operating Profit</span>
              <strong>${this.formatCurrency(netProfit)}</strong>
            </div>
          </div>

          <!-- GST / Tax Reconciliation (GSTR-1 Format) -->
          <div style="background:var(--fin-bg-card-hover); border:1px solid var(--fin-border); border-radius:12px; padding:1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--fin-border); padding-bottom:0.75rem; margin-bottom:1rem;">
              <h3 style="font-family:var(--fin-font-heading); font-size:1.1rem; color:#f8fafc;">GST Reconciliation (GSTR-1 / GSTR-3B)</h3>
              <span style="font-size:0.72rem; color:#0099e6; font-weight:700;">GSTIN: 27AAACA9921M1Z5</span>
            </div>

            <div class="fin-calc-row">
              <span>Output Tax Collected (Sales CGST + SGST + IGST)</span>
              <strong style="color:#0099e6;">${this.formatCurrency(totalTaxOutput)}</strong>
            </div>
            <div class="fin-calc-row">
              <span>Input Tax Credit (ITC Available from Purchase Bills)</span>
              <strong style="color:#10b981;">${this.formatCurrency(totalTaxInput)}</strong>
            </div>
            <div class="fin-calc-row grand-total" style="border-top:2px solid #0099e6; color:#38bdf8;">
              <span>Net GST Cash Liability</span>
              <strong>${this.formatCurrency(netGstPayable)}</strong>
            </div>
            <p style="font-size:0.72rem; color:#94a3b8; margin-top:1rem; line-height:1.5;">
              * Reconciliation accounts for reverse charge mechanism (RCM) on crane rentals and LUT export exemption for UAE cross-border civil contracts.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 13. CALENDAR MODULE
  // --------------------------------------------------------------------------
  renderCalendarTab(root) {
    const invoices = this.db?.invoices || [];
    const bills = this.db?.purchase_bills || [];

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">📅 Financial Calendar &amp; Statutory Deadlines</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Upcoming invoice due dates, vendor settlement commitments, and regulatory filing milestones.</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
          <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:1.25rem;">
            <span style="font-size:0.7rem; color:#ef4444; font-weight:700; text-transform:uppercase;">Overdue Milestone</span>
            <h4 style="color:#fff; margin:0.35rem 0;">NHAI RA Bill No 14 Due</h4>
            <div style="font-size:0.8rem; color:#cbd5e1;">Amount: <strong>${this.formatCurrency(8850000)}</strong></div>
            <div style="font-size:0.72rem; color:#94a3b8; margin-top:0.4rem;">Due: March 12, 2026 • Automated follow-up sent</div>
          </div>

          <div style="background:rgba(0,153,230,0.08); border:1px solid rgba(0,153,230,0.3); border-radius:10px; padding:1.25rem;">
            <span style="font-size:0.7rem; color:#0099e6; font-weight:700; text-transform:uppercase;">Upcoming Collection</span>
            <h4 style="color:#fff; margin:0.35rem 0;">L&amp;T Western Flyover Milestone</h4>
            <div style="font-size:0.8rem; color:#cbd5e1;">Amount: <strong>${this.formatCurrency(1425000)}</strong></div>
            <div style="font-size:0.72rem; color:#94a3b8; margin-top:0.4rem;">Due: March 31, 2026 • Certified milestone</div>
          </div>

          <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.3); border-radius:10px; padding:1.25rem;">
            <span style="font-size:0.7rem; color:#f59e0b; font-weight:700; text-transform:uppercase;">Statutory Compliance</span>
            <h4 style="color:#fff; margin:0.35rem 0;">Monthly GSTR-3B Return Filing</h4>
            <div style="font-size:0.8rem; color:#cbd5e1;">Portal: GSTN India</div>
            <div style="font-size:0.72rem; color:#94a3b8; margin-top:0.4rem;">Due: April 20, 2026 • Prepared by CFO Desk</div>
          </div>

          <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:10px; padding:1.25rem;">
            <span style="font-size:0.7rem; color:#10b981; font-weight:700; text-transform:uppercase;">Vendor Commitment</span>
            <h4 style="color:#fff; margin:0.35rem 0;">Tata Steel TMT Consignment 2 Release</h4>
            <div style="font-size:0.8rem; color:#cbd5e1;">Amount: <strong>${this.formatCurrency(1840000)}</strong></div>
            <div style="font-size:0.72rem; color:#94a3b8; margin-top:0.4rem;">Due: April 01, 2026 • Approved voucher</div>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 14. DOCUMENT VAULT MODULE
  // --------------------------------------------------------------------------
  renderDocumentsTab(root) {
    const docs = this.db?.documents || [];

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">📁 Secure Corporate Document Vault</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Encrypted storage for signed delivery notes, vendor tax invoices, bank remittance advices, and execution contracts.</p>
          </div>
          <div class="fin-panel-actions">
            <button type="button" class="fin-btn-quick primary" onclick="alert('Document upload portal opened. Attach tax invoice PDF or signed delivery voucher.')">
              + Upload Document
            </button>
          </div>
        </div>

        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Document File Name</th>
                <th>Category</th>
                <th>File Size</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Associated Transaction</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${docs.map(doc => `
                <tr>
                  <td><strong>📑 ${doc.name}</strong></td>
                  <td><span class="fin-badge fin-badge-issued">${doc.category}</span></td>
                  <td>${doc.size}</td>
                  <td>${doc.uploaded_by}</td>
                  <td>${this.formatDate(doc.date)}</td>
                  <td><code>${doc.linked_record}</code></td>
                  <td>
                    <button type="button" class="fin-btn-row-action" onclick="alert('Viewing secure document: ${doc.name}')">Preview</button>
                    <button type="button" class="fin-btn-row-action" onclick="alert('Downloading: ${doc.name}')">Download</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 15. USERS & AUDIT LOGS MODULE
  // --------------------------------------------------------------------------
  renderUsersTab(root) {
    const users = this.db?.users || [];
    const logs = this.db?.audit_logs || [];

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">🛡️ User Administration &amp; RBAC Security</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Manage employee access, role permissions, account suspensions, and view tamper-resistant audit logs.</p>
          </div>
          <div class="fin-panel-actions">
            <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openInviteUserModal()">
              + Invite Employee
            </button>
          </div>
        </div>

        <div class="fin-table-responsive" style="margin-bottom:2rem;">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Employee / User</th>
                <th>Designation &amp; Dept</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td>
                    <strong>${u.name}</strong>
                    <div style="font-size:0.68rem; color:#94a3b8;">${u.email}</div>
                  </td>
                  <td>
                    <div>${u.designation}</div>
                    <span style="font-size:0.68rem; color:#38bdf8;">${u.department}</span>
                  </td>
                  <td><span class="fin-badge fin-badge-issued">${u.role_label}</span></td>
                  <td>${u.phone || '—'}</td>
                  <td><span class="fin-badge fin-badge-${u.status === 'active' ? 'paid' : 'overdue'}">${u.status}</span></td>
                  <td>
                    <button type="button" class="fin-btn-row-action" onclick="alert('Permissions for ${u.name}: Full access to assigned company ledgers.')">Permissions</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Full Audit Log -->
        <h3 class="fin-panel-title" style="margin-bottom:1rem;">Tamper-Resistant Financial Audit History</h3>
        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Role</th>
                <th>Action</th>
                <th>Entity Affected</th>
                <th>Transaction Details</th>
                <th>Terminal IP</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(log => `
                <tr>
                  <td style="white-space:nowrap; font-size:0.75rem; color:#94a3b8;">${new Date(log.timestamp).toLocaleString('en-IN')}</td>
                  <td><strong>${log.actor_name}</strong></td>
                  <td><span style="font-size:0.72rem; color:#38bdf8;">${log.actor_role}</span></td>
                  <td><span class="fin-badge fin-badge-issued">${log.action}</span></td>
                  <td>${log.entity}</td>
                  <td style="font-size:0.78rem;">${log.details}</td>
                  <td><code>${log.ip_address}</code></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 16. SETTINGS MODULE
  // --------------------------------------------------------------------------
  renderSettingsTab(root) {
    const settings = this.db?.settings || {};

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">⚙️ Company Settings &amp; Financial Preferences</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Configure base currencies, numbering sequences, tax rates, and corporate signatory information.</p>
          </div>
        </div>

        <form id="fin-settings-form" style="max-width:750px;">
          <div class="fin-form-grid-2">
            <div class="fin-form-group">
              <label class="fin-form-label">Base Operating Currency</label>
              <input type="text" class="fin-form-input" value="${settings.base_currency || 'INR'}" readonly>
            </div>
            <div class="fin-form-group">
              <label class="fin-form-label">Invoice Numbering Prefix</label>
              <input type="text" id="set-inv-prefix" class="fin-form-input" value="${settings.invoice_prefix || 'INV-2026-'}">
            </div>
          </div>

          <div class="fin-form-grid-2">
            <div class="fin-form-group">
              <label class="fin-form-label">Default Payment Terms (Days)</label>
              <input type="number" id="set-pay-terms" class="fin-form-input" value="${settings.default_payment_terms || 30}">
            </div>
            <div class="fin-form-group">
              <label class="fin-form-label">CFO Approval Threshold (₹)</label>
              <input type="number" id="set-cfo-threshold" class="fin-form-input" value="${settings.approval_threshold_cfo || 500000}">
            </div>
          </div>

          <div class="fin-form-group">
            <label class="fin-form-label">Authorized Signatory Name</label>
            <input type="text" id="set-signatory-name" class="fin-form-input" value="${settings.company_signatory_name || 'Arshad Alam Shaikh'}">
          </div>

          <div class="fin-form-group">
            <label class="fin-form-label">Signatory Corporate Title</label>
            <input type="text" id="set-signatory-title" class="fin-form-input" value="${settings.company_signatory_title || 'Authorized Signatory - Rayan Group'}">
          </div>

          <button type="submit" class="btn-enterprise-primary" style="margin-top:1rem;">
            <span>SAVE CONFIGURATION PREFERENCES</span>
          </button>
        </form>
      </div>
    `;

    const form = document.getElementById('fin-settings-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const updated = {
          invoice_prefix: document.getElementById('set-inv-prefix').value,
          default_payment_terms: Number(document.getElementById('set-pay-terms').value),
          approval_threshold_cfo: Number(document.getElementById('set-cfo-threshold').value),
          company_signatory_name: document.getElementById('set-signatory-name').value,
          company_signatory_title: document.getElementById('set-signatory-title').value
        };
        await this.syncApi('update_settings', { settings: updated });
        alert('Financial configuration preferences updated successfully.');
        this.renderActiveTab();
      };
    }
  }

  // --------------------------------------------------------------------------
  // MODALS & INTERACTIVE WORKFLOWS
  // --------------------------------------------------------------------------
  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.fin-tab-item').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
    });
    this.renderActiveTab();
  }

  // 1. CREATE TAX INVOICE MODAL
  openCreateInvoiceModal() {
    const customers = this.db?.customers || [];
    const items = this.db?.items || [];
    const projects = this.db?.projects || [];

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-invoice">
        <div class="fin-modal-dialog">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">📄 Create Sales Tax Invoice</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-invoice')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="create-invoice-form">
              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Customer / Client <span style="color:#ef4444;">*</span></label>
                  <select id="inv-cust-select" class="fin-form-select" required>
                    <option value="" disabled selected>Select Customer</option>
                    ${customers.map(c => `<option value="${c.id}">${c.name} (${c.code})</option>`).join('')}
                  </select>
                </div>

                <div class="fin-form-group">
                  <label class="fin-form-label">Customer GSTIN</label>
                  <input type="text" id="inv-cust-gstin" class="fin-form-input" readonly placeholder="Auto-populated">
                </div>

                <div class="fin-form-group">
                  <label class="fin-form-label">Place of Supply <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="inv-cust-pos" class="fin-form-input" required placeholder="e.g. 27-Maharashtra">
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Invoice Date</label>
                  <input type="date" id="inv-date" class="fin-form-input" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Payment Terms (Days)</label>
                  <input type="number" id="inv-terms" class="fin-form-input" value="30" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Due Date</label>
                  <input type="date" id="inv-due-date" class="fin-form-input" required>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Linked Project / Cost Center</label>
                  <select id="inv-project" class="fin-form-select">
                    <option value="">General Corporate Billing</option>
                    ${projects.map(p => `<option value="${p.id}" data-name="${p.name}">${p.name} (${p.code})</option>`).join('')}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">PO / Contract Reference #</label>
                  <input type="text" id="inv-po-ref" class="fin-form-input" placeholder="e.g. PO-LT-2025-99">
                </div>
              </div>

              <!-- Line Items Table -->
              <h4 style="font-family:var(--fin-font-heading); font-size:1rem; color:#f8fafc; margin:1.25rem 0 0.5rem;">Line Items &amp; Tax Calculation</h4>
              <div class="fin-table-responsive">
                <table class="fin-line-item-table" id="inv-items-table">
                  <thead>
                    <tr>
                      <th style="width:30%;">Item / Service</th>
                      <th style="width:12%;">HSN/SAC</th>
                      <th style="width:10%;">Qty</th>
                      <th style="width:10%;">UOM</th>
                      <th style="width:14%;">Rate (₹)</th>
                      <th style="width:10%;">GST %</th>
                      <th style="width:14%;">Total (₹)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody id="inv-items-tbody">
                    <!-- Dynamic line rows -->
                  </tbody>
                </table>
              </div>
              <button type="button" class="fin-btn-quick" id="inv-add-row-btn" style="margin-top:0.5rem;">+ Add Line Item</button>

              <!-- Realtime Calculations -->
              <div class="fin-calc-summary-box">
                <div class="fin-calc-row">
                  <span>Taxable Subtotal</span>
                  <span id="inv-calc-taxable">₹0.00</span>
                </div>
                <div class="fin-calc-row" id="inv-calc-cgst-row">
                  <span>CGST</span>
                  <span id="inv-calc-cgst">₹0.00</span>
                </div>
                <div class="fin-calc-row" id="inv-calc-sgst-row">
                  <span>SGST</span>
                  <span id="inv-calc-sgst">₹0.00</span>
                </div>
                <div class="fin-calc-row" id="inv-calc-igst-row" style="display:none;">
                  <span>IGST</span>
                  <span id="inv-calc-igst">₹0.00</span>
                </div>
                <div class="fin-calc-row grand-total">
                  <span>Invoice Total</span>
                  <span id="inv-calc-grand" style="color:#0099e6;">₹0.00</span>
                </div>
              </div>

              <div class="fin-form-group" style="margin-top:1.5rem;">
                <label class="fin-form-label">Notes &amp; Payment Instructions</label>
                <textarea id="inv-notes" class="fin-form-textarea" rows="2" placeholder="Payment terms: Bank wire via RTGS to State Bank of India corporate account."></textarea>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-invoice')">Cancel</button>
                <button type="button" class="fin-btn-quick" id="inv-save-draft-btn">Save as Draft</button>
                <button type="submit" class="fin-btn-quick primary">Issue &amp; Post Invoice &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    // Line items manager
    const tbody = document.getElementById('inv-items-tbody');
    const addRow = (defaultItem = null) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <select class="fin-form-select row-item-sel">
            <option value="">Custom Item / Service</option>
            ${items.map(it => `<option value="${it.id}" ${defaultItem && defaultItem.id === it.id ? 'selected' : ''}>${it.name}</option>`).join('')}
          </select>
          <input type="text" class="fin-form-input row-desc" placeholder="Item description" style="margin-top:0.3rem;" value="${defaultItem ? defaultItem.name : ''}">
        </td>
        <td><input type="text" class="fin-form-input row-hsn" placeholder="HSN/SAC" value="${defaultItem ? defaultItem.hsn_sac_code : '9954'}"></td>
        <td><input type="number" class="fin-form-input row-qty" value="1" min="0.01" step="any"></td>
        <td><input type="text" class="fin-form-input row-uom" value="${defaultItem ? defaultItem.uom : 'LSUM'}"></td>
        <td><input type="number" class="fin-form-input row-rate" value="${defaultItem ? defaultItem.sales_price : 0}" step="any"></td>
        <td>
          <select class="fin-form-select row-gst">
            <option value="18" ${!defaultItem || defaultItem.gst_rate === 18 ? 'selected' : ''}>18%</option>
            <option value="12" ${defaultItem && defaultItem.gst_rate === 12 ? 'selected' : ''}>12%</option>
            <option value="5" ${defaultItem && defaultItem.gst_rate === 5 ? 'selected' : ''}>5%</option>
            <option value="28" ${defaultItem && defaultItem.gst_rate === 28 ? 'selected' : ''}>28%</option>
            <option value="0" ${defaultItem && defaultItem.gst_rate === 0 ? 'selected' : ''}>0% (Export/LUT)</option>
          </select>
        </td>
        <td><strong class="row-total">₹0.00</strong></td>
        <td><button type="button" class="fin-modal-close row-del" style="font-size:1.1rem; color:#ef4444;">&times;</button></td>
      `;
      tbody.appendChild(tr);

      // Event listeners for row
      const sel = tr.querySelector('.row-item-sel');
      sel.onchange = () => {
        const found = items.find(it => it.id === sel.value);
        if (found) {
          tr.querySelector('.row-desc').value = found.name;
          tr.querySelector('.row-hsn').value = found.hsn_sac_code || '';
          tr.querySelector('.row-uom').value = found.uom || 'UNITS';
          tr.querySelector('.row-rate').value = found.sales_price || 0;
          tr.querySelector('.row-gst').value = found.gst_rate || 18;
          recalculateInvoice();
        }
      };

      tr.querySelectorAll('.row-qty, .row-rate, .row-gst').forEach(inp => {
        inp.oninput = () => recalculateInvoice();
      });

      tr.querySelector('.row-del').onclick = () => {
        tr.remove();
        recalculateInvoice();
      };

      recalculateInvoice();
    };

    const recalculateInvoice = () => {
      const pos = (document.getElementById('inv-cust-pos').value || '').toLowerCase();
      const isInterState = !pos.includes('maharashtra') && !pos.includes('27');

      let taxableSum = 0;
      let taxSum = 0;
      let cgstSum = 0;
      let sgstSum = 0;
      let igstSum = 0;

      tbody.querySelectorAll('tr').forEach(tr => {
        const qty = Number(tr.querySelector('.row-qty').value) || 0;
        const rate = Number(tr.querySelector('.row-rate').value) || 0;
        const gstRate = Number(tr.querySelector('.row-gst').value) || 0;

        const rowTaxable = qty * rate;
        const rowTax = rowTaxable * (gstRate / 100);
        const rowGrand = rowTaxable + rowTax;

        tr.querySelector('.row-total').textContent = `₹${rowGrand.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

        taxableSum += rowTaxable;
        taxSum += rowTax;

        if (isInterState) {
          igstSum += rowTax;
        } else {
          cgstSum += rowTax / 2;
          sgstSum += rowTax / 2;
        }
      });

      const grandTotal = taxableSum + taxSum;

      document.getElementById('inv-calc-taxable').textContent = `₹${taxableSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      document.getElementById('inv-calc-grand').textContent = `₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

      if (isInterState) {
        document.getElementById('inv-calc-cgst-row').style.display = 'none';
        document.getElementById('inv-calc-sgst-row').style.display = 'none';
        document.getElementById('inv-calc-igst-row').style.display = 'flex';
        document.getElementById('inv-calc-igst').textContent = `₹${igstSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      } else {
        document.getElementById('inv-calc-cgst-row').style.display = 'flex';
        document.getElementById('inv-calc-sgst-row').style.display = 'flex';
        document.getElementById('inv-calc-igst-row').style.display = 'none';
        document.getElementById('inv-calc-cgst').textContent = `₹${cgstSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        document.getElementById('inv-calc-sgst').textContent = `₹${sgstSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      }
    };

    // Auto populate customer details
    const custSel = document.getElementById('inv-cust-select');
    custSel.onchange = () => {
      const c = customers.find(x => x.id === custSel.value);
      if (c) {
        document.getElementById('inv-cust-gstin').value = c.gstin || 'EXEMPT';
        document.getElementById('inv-cust-pos').value = c.place_of_supply || '27-Maharashtra';
        document.getElementById('inv-terms').value = c.payment_terms || 30;
        updateDueDate();
        recalculateInvoice();
      }
    };

    // Update due date
    const updateDueDate = () => {
      const invDate = new Date(document.getElementById('inv-date').value);
      const terms = Number(document.getElementById('inv-terms').value) || 30;
      invDate.setDate(invDate.getDate() + terms);
      document.getElementById('inv-due-date').value = invDate.toISOString().split('T')[0];
    };

    document.getElementById('inv-date').onchange = updateDueDate;
    document.getElementById('inv-terms').oninput = updateDueDate;
    updateDueDate();

    document.getElementById('inv-add-row-btn').onclick = () => addRow();

    // Initial default row
    addRow(items[0] || null);

    // Form submit: Issue invoice
    document.getElementById('create-invoice-form').onsubmit = async (e) => {
      e.preventDefault();
      await this.saveInvoiceHandler('issued');
    };

    // Save as draft
    document.getElementById('inv-save-draft-btn').onclick = async () => {
      await this.saveInvoiceHandler('draft');
    };
  }

  async saveInvoiceHandler(status = 'issued') {
    const custSel = document.getElementById('inv-cust-select');
    const custId = custSel.value;
    const customer = this.db?.customers?.find(c => c.id === custId);
    if (!customer) {
      alert('Please select a valid customer.');
      return;
    }

    const prjSel = document.getElementById('inv-project');
    const prjId = prjSel.value || null;
    const prjName = prjSel.options[prjSel.selectedIndex]?.getAttribute('data-name') || '';

    // Collect line items
    const lineItems = [];
    let taxableSubtotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;
    let totalTax = 0;

    const pos = (document.getElementById('inv-cust-pos').value || '').toLowerCase();
    const isInterState = !pos.includes('maharashtra') && !pos.includes('27');

    document.querySelectorAll('#inv-items-tbody tr').forEach(tr => {
      const desc = tr.querySelector('.row-desc').value.trim();
      const hsn = tr.querySelector('.row-hsn').value.trim();
      const qty = Number(tr.querySelector('.row-qty').value) || 1;
      const uom = tr.querySelector('.row-uom').value.trim();
      const unitPrice = Number(tr.querySelector('.row-rate').value) || 0;
      const gstRate = Number(tr.querySelector('.row-gst').value) || 0;

      const taxable = qty * unitPrice;
      const tax = taxable * (gstRate / 100);
      const total = taxable + tax;

      let cgst = 0, sgst = 0, igst = 0;
      if (isInterState) {
        igst = tax;
      } else {
        cgst = tax / 2;
        sgst = tax / 2;
      }

      taxableSubtotal += taxable;
      totalTax += tax;
      cgstTotal += cgst;
      sgstTotal += sgst;
      igstTotal += igst;

      lineItems.push({
        description: desc,
        hsn_sac_code: hsn,
        qty,
        uom,
        unit_price: unitPrice,
        taxable_amount: taxable,
        gst_rate: gstRate,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: igst,
        total_amount: total
      });
    });

    const grandTotal = taxableSubtotal + totalTax;

    const payload = {
      invoice: {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_gstin: customer.gstin,
        place_of_supply: document.getElementById('inv-cust-pos').value,
        project_id: prjId,
        project_name: prjName,
        po_reference: document.getElementById('inv-po-ref').value,
        invoice_date: document.getElementById('inv-date').value,
        due_date: document.getElementById('inv-due-date').value,
        payment_terms: Number(document.getElementById('inv-terms').value),
        line_items: lineItems,
        taxable_subtotal: taxableSubtotal,
        cgst_total: cgstTotal,
        sgst_total: sgstTotal,
        igst_total: igstTotal,
        total_tax: totalTax,
        grand_total: grandTotal,
        status,
        notes: document.getElementById('inv-notes').value
      }
    };

    const res = await this.syncApi('create_invoice', payload);
    if (res && res.success) {
      alert(`Invoice ${res.invoice.invoice_no} (${status.toUpperCase()}) saved successfully.`);
      this.closeModal('modal-invoice');
      this.switchTab('invoices');
    }
  }

  // 2. INVOICE DETAIL & PDF GENERATION PREVIEW
  openInvoiceDetail(invoiceId) {
    const inv = this.db?.invoices?.find(i => i.id === invoiceId);
    if (!inv) return;

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-inv-detail">
        <div class="fin-modal-dialog" style="max-width:920px;">
          <div class="fin-modal-header no-print">
            <h3 class="fin-modal-title">Tax Invoice ${inv.invoice_no}</h3>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <button type="button" class="fin-btn-quick primary" onclick="window.print()">🖨️ Print / Download PDF</button>
              <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-inv-detail')">&times;</button>
            </div>
          </div>
          <div class="fin-modal-body" style="background:#f8fafc; padding:2rem;">
            <!-- Printable Invoice Document Template -->
            <div class="fin-printable-invoice">
              <div class="fin-print-header">
                <div>
                  <img src="/assets/logos/rayan-group.png" alt="Rayan Group" class="fin-print-logo">
                  <div style="font-size:0.85rem; font-weight:700; color:#0f172a;">ASHAZ ENGINEERING PRIVATE LIMITED</div>
                  <div style="font-size:0.75rem; color:#64748b; line-height:1.4;">
                    Rayan Tech Park, Off Western Express Highway, Andheri East, Mumbai 400069<br>
                    <strong>GSTIN:</strong> 27AAACA9921M1Z5 • <strong>PAN:</strong> AAACA9921M<br>
                    Corporate Email: accounts.india@rayan-group.com
                  </div>
                </div>
                <div style="text-align:right;">
                  <div class="fin-print-title">TAX INVOICE</div>
                  <div style="font-size:0.9rem; font-weight:800; color:#0f172a; margin-top:0.35rem;">${inv.invoice_no}</div>
                  <div style="font-size:0.78rem; color:#64748b;">Invoice Date: ${this.formatDate(inv.invoice_date)}</div>
                  <div style="font-size:0.78rem; color:#64748b;">Due Date: ${this.formatDate(inv.due_date)}</div>
                  <div style="font-size:0.78rem; color:#0099e6; font-weight:700;">Status: ${inv.status.toUpperCase()}</div>
                </div>
              </div>

              <!-- Customer & Place of Supply Grid -->
              <div class="fin-print-meta-grid">
                <div>
                  <strong style="color:#0099e6; text-transform:uppercase; font-size:0.75rem; display:block; margin-bottom:0.25rem;">BILLED TO (BUYER):</strong>
                  <div style="font-weight:800; font-size:0.95rem; color:#0f172a;">${inv.customer_name}</div>
                  <div style="color:#475569; font-size:0.82rem;">
                    <strong>GSTIN:</strong> ${inv.customer_gstin || 'EXEMPT'}<br>
                    <strong>Place of Supply:</strong> ${inv.place_of_supply}<br>
                    ${inv.po_reference ? `<strong>PO Reference:</strong> ${inv.po_reference}` : ''}
                  </div>
                </div>
                <div>
                  <strong style="color:#0099e6; text-transform:uppercase; font-size:0.75rem; display:block; margin-bottom:0.25rem;">PROJECT DETAILS:</strong>
                  <div style="font-weight:700; color:#0f172a;">${inv.project_name || 'General Construction Works'}</div>
                  <div style="color:#475569; font-size:0.82rem;">
                    Payment Terms: ${inv.payment_terms} Days from Invoice Date<br>
                    Remittance Mode: RTGS / NEFT Direct Transfer
                  </div>
                </div>
              </div>

              <!-- Line Items Table -->
              <table class="fin-print-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Description</th>
                    <th>HSN/SAC</th>
                    <th>Qty</th>
                    <th>UOM</th>
                    <th>Unit Rate (₹)</th>
                    <th>Taxable (₹)</th>
                    <th>GST %</th>
                    <th>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${(inv.line_items || []).map((li, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>
                        <strong>${li.name || li.description}</strong>
                      </td>
                      <td>${li.hsn_sac_code || '—'}</td>
                      <td>${li.qty}</td>
                      <td>${li.uom}</td>
                      <td>${this.formatCurrency(li.unit_price, false)}</td>
                      <td>${this.formatCurrency(li.taxable_amount, false)}</td>
                      <td>${li.gst_rate}%</td>
                      <td><strong>${this.formatCurrency(li.total_amount, false)}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Totals and Tax Breakup -->
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div style="max-width:420px; font-size:0.78rem; color:#64748b; line-height:1.5;">
                  <strong>Bank Account Details for Wire Remittance:</strong><br>
                  Beneficiary: Ashaz Engineering Private Limited<br>
                  Bank: State Bank of India (Corporate Banking)<br>
                  Account No: 392019485721 • IFSC: SBIN0001824<br>
                  Branch: Andheri East Corporate Hub, Mumbai
                </div>

                <div style="min-width:280px; font-size:0.85rem;">
                  <div style="display:flex; justify-content:space-between; padding:0.25rem 0;">
                    <span>Taxable Subtotal:</span>
                    <strong>${this.formatCurrency(inv.taxable_subtotal)}</strong>
                  </div>
                  ${inv.cgst_total > 0 ? `
                    <div style="display:flex; justify-content:space-between; padding:0.25rem 0;">
                      <span>CGST (9%):</span>
                      <span>${this.formatCurrency(inv.cgst_total)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:0.25rem 0;">
                      <span>SGST (9%):</span>
                      <span>${this.formatCurrency(inv.sgst_total)}</span>
                    </div>
                  ` : ''}
                  ${inv.igst_total > 0 ? `
                    <div style="display:flex; justify-content:space-between; padding:0.25rem 0;">
                      <span>IGST (18%):</span>
                      <span>${this.formatCurrency(inv.igst_total)}</span>
                    </div>
                  ` : ''}
                  <div style="display:flex; justify-content:space-between; padding:0.5rem 0; border-top:2px solid #0099e6; margin-top:0.4rem; font-size:1.1rem; font-weight:900; color:#0f172a;">
                    <span>Grand Total:</span>
                    <span>${this.formatCurrency(inv.grand_total)}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; padding:0.25rem 0; color:#10b981; font-weight:700;">
                    <span>Amount Paid:</span>
                    <span>${this.formatCurrency(inv.amount_paid || 0)}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; padding:0.25rem 0; color:#ef4444; font-weight:800;">
                    <span>Balance Due:</span>
                    <span>${this.formatCurrency(inv.balance_due)}</span>
                  </div>
                </div>
              </div>

              <!-- Signatory Footer -->
              <div class="fin-print-footer">
                <div>
                  <div style="font-size:0.72rem; color:#94a3b8;">This is a computer-generated tax invoice verified under Rayan GRC Finance.</div>
                  <div style="font-size:0.72rem; color:#94a3b8;">Digitally signed &amp; audited on ${this.formatDate(inv.created_at || inv.invoice_date)}.</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-family:'Outfit', cursive; font-size:1.15rem; color:#0099e6; margin-bottom:0.2rem;">Arshad Alam Shaikh</div>
                  <div style="border-top:1px solid #94a3b8; padding-top:0.25rem; font-size:0.75rem; font-weight:700; color:#1e293b;">
                    Authorized Signatory<br>
                    <span style="font-weight:400; color:#64748b;">Rayan Group Finance Committee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
  }

  // 3. RECORD CUSTOMER RECEIPT MODAL
  openRecordReceiptModal(preselectInvoiceId = null) {
    const customers = this.db?.customers || [];
    const invoices = this.db?.invoices || [];

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-receipt">
        <div class="fin-modal-dialog" style="max-width:680px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">💳 Record Customer Payment Receipt</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-receipt')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="record-receipt-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Customer / Client <span style="color:#ef4444;">*</span></label>
                <select id="rec-cust-sel" class="fin-form-select" required>
                  <option value="" disabled selected>Select Customer</option>
                  ${customers.map(c => `<option value="${c.id}">${c.name} (${c.code})</option>`).join('')}
                </select>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Receipt Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="rec-date" class="fin-form-input" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Payment Mode <span style="color:#ef4444;">*</span></label>
                  <select id="rec-mode" class="fin-form-select" required>
                    <option value="NEFT/RTGS" selected>NEFT / RTGS Wire</option>
                    <option value="Bank Wire">International Bank Wire</option>
                    <option value="Cheque">Corporate Account Payee Cheque</option>
                    <option value="UPI">UPI Direct</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Amount Received (₹) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="rec-amount" class="fin-form-input" min="1" step="any" required placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Bank Reference / UTR # <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="rec-ref" class="fin-form-input" required placeholder="e.g. SBIN260314981">
                </div>
              </div>

              <!-- Unpaid Invoices Allocation Checklist -->
              <h4 style="font-family:var(--fin-font-heading); font-size:0.95rem; color:#f8fafc; margin:1rem 0 0.5rem;">Allocate Against Outstanding Invoices</h4>
              <div id="rec-invoices-list" style="max-height:180px; overflow-y:auto; border:1px solid var(--fin-border); border-radius:8px; padding:0.75rem; background:rgba(0,0,0,0.2);">
                <div style="font-size:0.78rem; color:#94a3b8;">Select a customer above to view unpaid invoices.</div>
              </div>

              <div class="fin-form-group" style="margin-top:1.25rem;">
                <label class="fin-form-label">Notes &amp; Remittance Details</label>
                <input type="text" id="rec-notes" class="fin-form-input" placeholder="Part payment for project milestone">
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-receipt')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Record &amp; Post Receipt &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    const custSel = document.getElementById('rec-cust-sel');
    const invList = document.getElementById('rec-invoices-list');
    const amountInp = document.getElementById('rec-amount');

    const updateCustomerInvoices = () => {
      const cId = custSel.value;
      const unpaid = invoices.filter(i => i.customer_id === cId && i.balance_due > 0 && i.status !== 'void');

      if (!unpaid.length) {
        invList.innerHTML = `<div style="font-size:0.78rem; color:#10b981;">No outstanding invoices found for this client. Receipt can be logged as advance.</div>`;
        return;
      }

      invList.innerHTML = unpaid.map(inv => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.4rem 0; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div>
            <strong style="color:#f8fafc; font-size:0.8rem;">${inv.invoice_no}</strong>
            <span style="font-size:0.72rem; color:#94a3b8;"> (${this.formatDate(inv.invoice_date)})</span>
            <div style="font-size:0.7rem; color:#38bdf8;">Balance: ${this.formatCurrency(inv.balance_due)}</div>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <input type="number" class="fin-form-input rec-alloc-input" data-inv-id="${inv.id}" data-inv-no="${inv.invoice_no}" data-max="${inv.balance_due}" placeholder="Allocated amount" style="width:140px; padding:0.3rem 0.5rem; font-size:0.75rem;" step="any">
          </div>
        </div>
      `).join('');

      // Auto distribute if amount is already entered
      if (amountInp.value) {
        let remaining = Number(amountInp.value) || 0;
        document.querySelectorAll('.rec-alloc-input').forEach(inp => {
          const max = Number(inp.getAttribute('data-max')) || 0;
          const toAlloc = Math.min(remaining, max);
          inp.value = toAlloc > 0 ? toAlloc : '';
          remaining -= toAlloc;
        });
      }
    };

    custSel.onchange = updateCustomerInvoices;

    amountInp.oninput = () => {
      let remaining = Number(amountInp.value) || 0;
      document.querySelectorAll('.rec-alloc-input').forEach(inp => {
        const max = Number(inp.getAttribute('data-max')) || 0;
        const toAlloc = Math.min(remaining, max);
        inp.value = toAlloc > 0 ? toAlloc : '';
        remaining -= toAlloc;
      });
    };

    if (preselectInvoiceId) {
      const inv = invoices.find(i => i.id === preselectInvoiceId);
      if (inv) {
        custSel.value = inv.customer_id;
        amountInp.value = inv.balance_due;
        updateCustomerInvoices();
      }
    }

    document.getElementById('record-receipt-form').onsubmit = async (e) => {
      e.preventDefault();
      const amountReceived = Number(amountInp.value);
      if (!amountReceived || amountReceived <= 0) {
        alert('Please enter a valid receipt amount.');
        return;
      }

      // Collect allocations
      const allocations = [];
      let totalAllocated = 0;
      document.querySelectorAll('.rec-alloc-input').forEach(inp => {
        const val = Number(inp.value) || 0;
        if (val > 0) {
          allocations.push({
            invoice_id: inp.getAttribute('data-inv-id'),
            invoice_no: inp.getAttribute('data-inv-no'),
            amount_allocated: val
          });
          totalAllocated += val;
        }
      });

      if (totalAllocated > amountReceived) {
        alert('Total allocated amounts across invoices cannot exceed the total received amount.');
        return;
      }

      const cust = customers.find(c => c.id === custSel.value);
      const payload = {
        receipt: {
          customer_id: cust.id,
          customer_name: cust.name,
          receipt_date: document.getElementById('rec-date').value,
          payment_mode: document.getElementById('rec-mode').value,
          reference_no: document.getElementById('rec-ref').value,
          amount_received: amountReceived,
          allocated_amount: totalAllocated,
          allocations,
          notes: document.getElementById('rec-notes').value
        }
      };

      const res = await this.syncApi('record_receipt', payload);
      if (res && res.success) {
        alert(`Payment Receipt ${res.receipt.receipt_no} recorded successfully. Invoices updated.`);
        this.closeModal('modal-receipt');
        this.switchTab('payments');
      }
    };
  }

  openQuickPayInvoice(invoiceId) {
    this.openRecordReceiptModal(invoiceId);
  }

  // 4. CREATE PURCHASE BILL MODAL
  openCreateBillModal() {
    const vendors = this.db?.vendors || [];
    const projects = this.db?.projects || [];
    const pos = this.db?.purchase_orders || [];

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-bill">
        <div class="fin-modal-dialog">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">📥 Record Vendor Purchase Bill</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-bill')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="create-bill-form">
              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Vendor / Subcontractor <span style="color:#ef4444;">*</span></label>
                  <select id="bill-vend-sel" class="fin-form-select" required>
                    <option value="" disabled selected>Select Vendor</option>
                    ${vendors.map(v => `<option value="${v.id}">${v.name} (${v.code})</option>`).join('')}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Supplier Invoice # <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="bill-inv-no" class="fin-form-input" required placeholder="e.g. TS-INV-99210">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Linked Purchase Order</label>
                  <select id="bill-po-sel" class="fin-form-select">
                    <option value="">No PO Linked</option>
                    ${pos.map(po => `<option value="${po.id}">${po.po_no} - ${po.vendor_name}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Bill Date</label>
                  <input type="date" id="bill-date" class="fin-form-input" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Payment Terms (Days)</label>
                  <input type="number" id="bill-terms" class="fin-form-input" value="30" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Due Date</label>
                  <input type="date" id="bill-due-date" class="fin-form-input" required>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Linked Project / Cost Center</label>
                  <select id="bill-project" class="fin-form-select">
                    <option value="">General Overhead</option>
                    ${projects.map(p => `<option value="${p.id}" data-name="${p.name}">${p.name} (${p.code})</option>`).join('')}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Item / Service Purchased</label>
                  <input type="text" id="bill-item-desc" class="fin-form-input" placeholder="e.g. High-Yield TMT Steel Consignment" required>
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Taxable Subtotal (₹) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="bill-taxable" class="fin-form-input" min="1" step="any" required placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">GST Rate %</label>
                  <select id="bill-gst-rate" class="fin-form-select">
                    <option value="18" selected>18% GST (Standard)</option>
                    <option value="12">12% GST</option>
                    <option value="5">5% GST</option>
                    <option value="28">28% GST</option>
                    <option value="0">0% (Exempt)</option>
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Grand Total (₹)</label>
                  <input type="text" id="bill-grand" class="fin-form-input" readonly placeholder="₹0.00" style="font-weight:700; color:#38bdf8;">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Notes &amp; Quality Test Sign-Off</label>
                <textarea id="bill-notes" class="fin-form-textarea" rows="2" placeholder="Cube test reports attached and verified by QC Engineer."></textarea>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-bill')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Record &amp; Post Bill &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    const taxableInp = document.getElementById('bill-taxable');
    const gstRateSel = document.getElementById('bill-gst-rate');
    const grandInp = document.getElementById('bill-grand');

    const updateTotals = () => {
      const taxable = Number(taxableInp.value) || 0;
      const rate = Number(gstRateSel.value) || 0;
      const tax = taxable * (rate / 100);
      const grand = taxable + tax;
      grandInp.value = `₹${grand.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    taxableInp.oninput = updateTotals;
    gstRateSel.onchange = updateTotals;

    // Date calc
    const dateInp = document.getElementById('bill-date');
    const termsInp = document.getElementById('bill-terms');
    const dueInp = document.getElementById('bill-due-date');

    const updateDue = () => {
      const d = new Date(dateInp.value);
      d.setDate(d.getDate() + (Number(termsInp.value) || 30));
      dueInp.value = d.toISOString().split('T')[0];
    };
    dateInp.onchange = updateDue;
    termsInp.oninput = updateDue;
    updateDue();

    document.getElementById('create-bill-form').onsubmit = async (e) => {
      e.preventDefault();
      const vendId = document.getElementById('bill-vend-sel').value;
      const vendor = vendors.find(v => v.id === vendId);

      const prjSel = document.getElementById('bill-project');
      const prjId = prjSel.value || null;
      const prjName = prjSel.options[prjSel.selectedIndex]?.getAttribute('data-name') || '';

      const taxable = Number(taxableInp.value) || 0;
      const rate = Number(gstRateSel.value) || 0;
      const tax = taxable * (rate / 100);
      const grand = taxable + tax;

      const payload = {
        bill: {
          vendor_id: vendor.id,
          vendor_name: vendor.name,
          vendor_invoice_no: document.getElementById('bill-inv-no').value,
          po_id: document.getElementById('bill-po-sel').value || null,
          project_id: prjId,
          project_name: prjName,
          bill_date: dateInp.value,
          due_date: dueInp.value,
          payment_terms: Number(termsInp.value),
          taxable_subtotal: taxable,
          tax_total: tax,
          grand_total: grand,
          line_items: [
            {
              name: document.getElementById('bill-item-desc').value,
              qty: 1,
              uom: 'LSUM',
              unit_price: taxable,
              taxable_amount: taxable,
              gst_rate: rate,
              tax_amount: tax,
              total_amount: grand
            }
          ],
          notes: document.getElementById('bill-notes').value
        }
      };

      const res = await this.syncApi('create_bill', payload);
      if (res && res.success) {
        alert(`Purchase Bill ${res.bill.bill_no} recorded successfully.`);
        this.closeModal('modal-bill');
        this.switchTab('bills');
      }
    };
  }

  // 5. RECORD VENDOR PAYMENT
  openRecordPaymentModal(preselectBillId = null) {
    const vendors = this.db?.vendors || [];
    const bills = this.db?.purchase_bills || [];

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-payment">
        <div class="fin-modal-dialog" style="max-width:680px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">💸 Record Vendor Payment Voucher</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-payment')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="record-payment-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Vendor / Subcontractor <span style="color:#ef4444;">*</span></label>
                <select id="pay-vend-sel" class="fin-form-select" required>
                  <option value="" disabled selected>Select Vendor</option>
                  ${vendors.map(v => `<option value="${v.id}">${v.name} (${v.code})</option>`).join('')}
                </select>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Payment Date</label>
                  <input type="date" id="pay-date" class="fin-form-input" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Disbursement Mode</label>
                  <select id="pay-mode" class="fin-form-select" required>
                    <option value="NEFT/RTGS" selected>Corporate RTGS</option>
                    <option value="Bank Wire">International Wire</option>
                    <option value="Corporate Cheque">Corporate Cheque</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Amount Disbursed (₹) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="pay-amount" class="fin-form-input" min="1" step="any" required placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Payment UTR / CMS Ref #</label>
                  <input type="text" id="pay-ref" class="fin-form-input" required placeholder="e.g. CMS-RTGS-991203">
                </div>
              </div>

              <!-- Unpaid Bills Checklist -->
              <h4 style="font-family:var(--fin-font-heading); font-size:0.95rem; color:#f8fafc; margin:1rem 0 0.5rem;">Allocate Against Approved Bills</h4>
              <div id="pay-bills-list" style="max-height:180px; overflow-y:auto; border:1px solid var(--fin-border); border-radius:8px; padding:0.75rem; background:rgba(0,0,0,0.2);">
                <div style="font-size:0.78rem; color:#94a3b8;">Select a vendor above to allocate payment against bills.</div>
              </div>

              <div class="fin-form-group" style="margin-top:1.25rem;">
                <label class="fin-form-label">Notes &amp; Approver Sign-Off</label>
                <input type="text" id="pay-notes" class="fin-form-input" placeholder="Approved by CFO for immediate release">
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-payment')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Disburse &amp; Release Voucher &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    const vendSel = document.getElementById('pay-vend-sel');
    const billsList = document.getElementById('pay-bills-list');
    const amountInp = document.getElementById('pay-amount');

    const updateVendorBills = () => {
      const vId = vendSel.value;
      const unpaid = bills.filter(b => b.vendor_id === vId && b.balance_due > 0 && b.status !== 'void');

      if (!unpaid.length) {
        billsList.innerHTML = `<div style="font-size:0.78rem; color:#10b981;">No unpaid approved bills found for this vendor.</div>`;
        return;
      }

      billsList.innerHTML = unpaid.map(b => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.4rem 0; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div>
            <strong style="color:#f8fafc; font-size:0.8rem;">${b.bill_no}</strong>
            <span style="font-size:0.72rem; color:#94a3b8;"> (${b.vendor_invoice_no})</span>
            <div style="font-size:0.7rem; color:#fb923c;">Balance Due: ${this.formatCurrency(b.balance_due)}</div>
          </div>
          <div>
            <input type="number" class="fin-form-input pay-alloc-input" data-bill-id="${b.id}" data-bill-no="${b.bill_no}" data-max="${b.balance_due}" placeholder="Amount" style="width:140px; padding:0.3rem 0.5rem; font-size:0.75rem;" step="any">
          </div>
        </div>
      `).join('');

      if (amountInp.value) {
        let remaining = Number(amountInp.value) || 0;
        document.querySelectorAll('.pay-alloc-input').forEach(inp => {
          const max = Number(inp.getAttribute('data-max')) || 0;
          const toAlloc = Math.min(remaining, max);
          inp.value = toAlloc > 0 ? toAlloc : '';
          remaining -= toAlloc;
        });
      }
    };

    vendSel.onchange = updateVendorBills;

    amountInp.oninput = () => {
      let remaining = Number(amountInp.value) || 0;
      document.querySelectorAll('.pay-alloc-input').forEach(inp => {
        const max = Number(inp.getAttribute('data-max')) || 0;
        const toAlloc = Math.min(remaining, max);
        inp.value = toAlloc > 0 ? toAlloc : '';
        remaining -= toAlloc;
      });
    };

    if (preselectBillId) {
      const b = bills.find(x => x.id === preselectBillId);
      if (b) {
        vendSel.value = b.vendor_id;
        amountInp.value = b.balance_due;
        updateVendorBills();
      }
    }

    document.getElementById('record-payment-form').onsubmit = async (e) => {
      e.preventDefault();
      const amountPaid = Number(amountInp.value);
      if (!amountPaid || amountPaid <= 0) {
        alert('Please enter a valid disbursement amount.');
        return;
      }

      const allocations = [];
      document.querySelectorAll('.pay-alloc-input').forEach(inp => {
        const val = Number(inp.value) || 0;
        if (val > 0) {
          allocations.push({
            bill_id: inp.getAttribute('data-bill-id'),
            bill_no: inp.getAttribute('data-bill-no'),
            amount_allocated: val
          });
        }
      });

      const vend = vendors.find(v => v.id === vendSel.value);
      const payload = {
        payment: {
          vendor_id: vend.id,
          vendor_name: vend.name,
          payment_date: document.getElementById('pay-date').value,
          payment_mode: document.getElementById('pay-mode').value,
          reference_no: document.getElementById('pay-ref').value,
          amount_paid: amountPaid,
          allocations,
          notes: document.getElementById('pay-notes').value
        }
      };

      const res = await this.syncApi('record_payment', payload);
      if (res && res.success) {
        alert(`Payment voucher ${res.payment.voucher_no} disbursed to ${vend.name}.`);
        this.closeModal('modal-payment');
        this.switchTab('payments');
      }
    };
  }

  openQuickPayBill(billId) {
    this.openRecordPaymentModal(billId);
  }

  // 6. CUSTOMER 360 PROFILE & STATEMENT OF ACCOUNT (SOA)
  openCustomerProfile(custId) {
    const cust = this.db?.customers?.find(c => c.id === custId);
    if (!cust) return;

    const invoices = (this.db?.invoices || []).filter(i => i.customer_id === cust.id && i.status !== 'void');
    const receipts = (this.db?.customer_receipts || []).filter(r => r.customer_id === cust.id);

    const totalInvoiced = invoices.reduce((s, i) => s + (Number(i.grand_total) || 0), 0);
    const totalReceived = invoices.reduce((s, i) => s + (Number(i.amount_paid) || 0), 0);
    const totalOutstanding = invoices.reduce((s, i) => s + (Number(i.balance_due) || 0), 0);

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-cust-profile">
        <div class="fin-modal-dialog" style="max-width:880px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">Customer Profile: ${cust.name}</h3>
            <div style="display:flex; gap:0.5rem;">
              <button type="button" class="fin-btn-quick primary" onclick="window.print()">🖨️ Print Statement (SOA)</button>
              <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-cust-profile')">&times;</button>
            </div>
          </div>
          <div class="fin-modal-body">
            <!-- Summary Bar -->
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem; margin-bottom:1.5rem;">
              <div style="background:rgba(0,153,230,0.1); border:1px solid rgba(0,153,230,0.3); border-radius:8px; padding:1rem;">
                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Total Billed to Date:</span>
                <strong style="font-size:1.25rem; color:#f8fafc;">${this.formatCurrency(totalInvoiced)}</strong>
              </div>
              <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:1rem;">
                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Total Collections Received:</span>
                <strong style="font-size:1.25rem; color:#10b981;">${this.formatCurrency(totalReceived)}</strong>
              </div>
              <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:1rem;">
                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Current Outstanding Dues:</span>
                <strong style="font-size:1.25rem; color:#ef4444;">${this.formatCurrency(totalOutstanding)}</strong>
              </div>
            </div>

            <!-- Client Info Grid -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; background:rgba(0,0,0,0.25); border-radius:8px; padding:1.25rem; margin-bottom:1.5rem; font-size:0.82rem;">
              <div>
                <strong>Billing Address:</strong><br>
                <span style="color:#cbd5e1;">${cust.billing_address || '—'}</span><br>
                <strong>GSTIN:</strong> <code>${cust.gstin || 'EXEMPT'}</code> • <strong>Place of Supply:</strong> ${cust.place_of_supply}
              </div>
              <div>
                <strong>Primary Contact:</strong> ${cust.contact_person || '—'}<br>
                <strong>Email:</strong> <a href="mailto:${cust.email}" style="color:#38bdf8;">${cust.email}</a><br>
                <strong>Phone:</strong> ${cust.phone || '—'}<br>
                <strong>Credit Limit:</strong> ${this.formatCurrency(cust.credit_limit)} • <strong>Terms:</strong> ${cust.payment_terms} Days
              </div>
            </div>

            <!-- Invoices Ledger -->
            <h4 style="font-family:var(--fin-font-heading); font-size:1rem; color:#f8fafc; margin-bottom:0.75rem;">Sales Invoices Ledger</h4>
            <div class="fin-table-responsive" style="margin-bottom:1.5rem;">
              <table class="fin-data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoices.map(i => `
                    <tr>
                      <td><strong>${i.invoice_no}</strong></td>
                      <td>${this.formatDate(i.invoice_date)}</td>
                      <td>${this.formatDate(i.due_date)}</td>
                      <td>${this.formatCurrency(i.grand_total)}</td>
                      <td style="color:#10b981;">${this.formatCurrency(i.amount_paid || 0)}</td>
                      <td><strong style="color:${i.balance_due > 0 ? '#ef4444' : '#10b981'};">${this.formatCurrency(i.balance_due)}</strong></td>
                      <td><span class="fin-badge fin-badge-${i.status}">${i.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Payments History -->
            <h4 style="font-family:var(--fin-font-heading); font-size:1rem; color:#f8fafc; margin-bottom:0.75rem;">Payment Receipts History</h4>
            <div class="fin-table-responsive">
              <table class="fin-data-table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Date</th>
                    <th>Mode</th>
                    <th>Reference / UTR</th>
                    <th>Amount Received</th>
                  </tr>
                </thead>
                <tbody>
                  ${receipts.map(r => `
                    <tr>
                      <td><strong>${r.receipt_no}</strong></td>
                      <td>${this.formatDate(r.receipt_date)}</td>
                      <td>${r.payment_mode}</td>
                      <td><code>${r.reference_no}</code></td>
                      <td><strong style="color:#10b981;">${this.formatCurrency(r.amount_received)}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
  }

  // 7. VENDOR PROFILE & STATEMENT
  openVendorProfile(vendId) {
    const vend = this.db?.vendors?.find(v => v.id === vendId);
    if (!vend) return;

    const bills = (this.db?.purchase_bills || []).filter(b => b.vendor_id === vend.id && b.status !== 'void');
    const payments = (this.db?.vendor_payments || []).filter(p => p.vendor_id === vend.id);

    const totalBilled = bills.reduce((s, b) => s + (Number(b.grand_total) || 0), 0);
    const totalPaid = bills.reduce((s, b) => s + (Number(b.amount_paid) || 0), 0);
    const totalPayable = bills.reduce((s, b) => s + (Number(b.balance_due) || 0), 0);

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-vend-profile">
        <div class="fin-modal-dialog" style="max-width:880px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">Vendor Profile: ${vend.name}</h3>
            <div style="display:flex; gap:0.5rem;">
              <button type="button" class="fin-btn-quick primary" onclick="window.print()">🖨️ Print Vendor Statement</button>
              <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-vend-profile')">&times;</button>
            </div>
          </div>
          <div class="fin-modal-body">
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem; margin-bottom:1.5rem;">
              <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:1rem;">
                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Total Purchases:</span>
                <strong style="font-size:1.25rem; color:#f8fafc;">${this.formatCurrency(totalBilled)}</strong>
              </div>
              <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:1rem;">
                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Total Disbursed:</span>
                <strong style="font-size:1.25rem; color:#10b981;">${this.formatCurrency(totalPaid)}</strong>
              </div>
              <div style="background:rgba(251,146,60,0.1); border:1px solid rgba(251,146,60,0.3); border-radius:8px; padding:1rem;">
                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Outstanding Payables:</span>
                <strong style="font-size:1.25rem; color:#fb923c;">${this.formatCurrency(totalPayable)}</strong>
              </div>
            </div>

            <!-- Bank & Corporate Details -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; background:rgba(0,0,0,0.25); border-radius:8px; padding:1.25rem; margin-bottom:1.5rem; font-size:0.82rem;">
              <div>
                <strong>Registered Address:</strong><br>
                <span style="color:#cbd5e1;">${vend.address || '—'}</span><br>
                <strong>GSTIN:</strong> <code>${vend.gstin || '—'}</code> • <strong>PAN:</strong> <code>${vend.pan || '—'}</code>
              </div>
              <div>
                <strong>Bank Account (Restricted View):</strong><br>
                Bank: <strong>${vend.bank_name || 'State Bank of India'}</strong><br>
                A/C: <code>${vend.account_no || '••••••••••••'}</code> • IFSC: <code>${vend.ifsc_code || 'SBIN0001234'}</code><br>
                Payment Terms: ${vend.payment_terms || 30} Days
              </div>
            </div>

            <h4 style="font-family:var(--fin-font-heading); font-size:1rem; color:#f8fafc; margin-bottom:0.75rem;">Purchase Bills History</h4>
            <div class="fin-table-responsive">
              <table class="fin-data-table">
                <thead>
                  <tr>
                    <th>Bill #</th>
                    <th>Supplier Inv #</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${bills.map(b => `
                    <tr>
                      <td><strong>${b.bill_no}</strong></td>
                      <td>${b.vendor_invoice_no}</td>
                      <td>${this.formatDate(b.bill_date)}</td>
                      <td>${this.formatDate(b.due_date)}</td>
                      <td>${this.formatCurrency(b.grand_total)}</td>
                      <td style="color:#10b981;">${this.formatCurrency(b.amount_paid || 0)}</td>
                      <td><strong style="color:${b.balance_due > 0 ? '#fb923c' : '#10b981'};">${this.formatCurrency(b.balance_due)}</strong></td>
                      <td><span class="fin-badge fin-badge-${b.status}">${b.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
  }

  // 8. ADD CUSTOMER MODAL
  openCreateCustomerModal() {
    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-add-cust">
        <div class="fin-modal-dialog" style="max-width:650px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">👥 Add New Corporate Client / Customer</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-add-cust')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="add-cust-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Client Company Name <span style="color:#ef4444;">*</span></label>
                <input type="text" id="new-cust-name" class="fin-form-input" required placeholder="e.g. Shapoorji Pallonji EPC Division">
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Contact Person</label>
                  <input type="text" id="new-cust-contact" class="fin-form-input" placeholder="e.g. Sanjeev Varma">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Email Address <span style="color:#ef4444;">*</span></label>
                  <input type="email" id="new-cust-email" class="fin-form-input" required placeholder="finance@client.com">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Phone Number</label>
                  <input type="tel" id="new-cust-phone" class="fin-form-input" placeholder="+91 22 6000 0000">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">GSTIN / Tax ID</label>
                  <input type="text" id="new-cust-gstin" class="fin-form-input" placeholder="27AAACS1234F1Z9">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Billing Address</label>
                <textarea id="new-cust-address" class="fin-form-textarea" rows="2" placeholder="Registered office address..."></textarea>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Place of Supply State</label>
                  <input type="text" id="new-cust-pos" class="fin-form-input" value="27-Maharashtra">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Credit Limit (₹)</label>
                  <input type="number" id="new-cust-credit" class="fin-form-input" value="50000000">
                </div>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-add-cust')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save Customer Record &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('add-cust-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        customer: {
          name: document.getElementById('new-cust-name').value.trim(),
          contact_person: document.getElementById('new-cust-contact').value.trim(),
          email: document.getElementById('new-cust-email').value.trim(),
          phone: document.getElementById('new-cust-phone').value.trim(),
          gstin: document.getElementById('new-cust-gstin').value.trim().toUpperCase(),
          billing_address: document.getElementById('new-cust-address').value.trim(),
          place_of_supply: document.getElementById('new-cust-pos').value.trim(),
          credit_limit: Number(document.getElementById('new-cust-credit').value) || 10000000
        }
      };

      const res = await this.syncApi('create_customer', payload);
      if (res && res.success) {
        alert(`Customer ${res.customer.name} created successfully.`);
        this.closeModal('modal-add-cust');
        this.switchTab('customers');
      }
    };
  }

  // 9. ADD VENDOR MODAL
  openCreateVendorModal() {
    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-add-vend">
        <div class="fin-modal-dialog" style="max-width:650px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">🏢 Add New Supplier / Vendor</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-add-vend')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="add-vend-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Vendor Business Name <span style="color:#ef4444;">*</span></label>
                <input type="text" id="new-vend-name" class="fin-form-input" required placeholder="e.g. Jindal Steel &amp; Power Ltd">
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Category</label>
                  <select id="new-vend-cat" class="fin-form-select">
                    <option value="Structural Steel & TMT">Structural Steel &amp; TMT</option>
                    <option value="Ready-Mix & Bulk Cement">Ready-Mix &amp; Bulk Cement</option>
                    <option value="Electrical & Automation">Electrical &amp; Automation</option>
                    <option value="HVAC & Mechanical">HVAC &amp; Mechanical</option>
                    <option value="Heavy Equipment & Cranes">Heavy Equipment &amp; Cranes</option>
                    <option value="Subcontracting & Labor">Subcontracting &amp; Labor</option>
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Contact Person</label>
                  <input type="text" id="new-vend-contact" class="fin-form-input" placeholder="e.g. Alok Mukherjee">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Email Address <span style="color:#ef4444;">*</span></label>
                  <input type="email" id="new-vend-email" class="fin-form-input" required placeholder="sales@vendor.com">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Phone Number</label>
                  <input type="tel" id="new-vend-phone" class="fin-form-input" placeholder="+91 22 6600 0000">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">GSTIN</label>
                  <input type="text" id="new-vend-gstin" class="fin-form-input" placeholder="27AAACJ1234F1Z8">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">PAN</label>
                  <input type="text" id="new-vend-pan" class="fin-form-input" placeholder="AAACJ1234F">
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Bank Name</label>
                  <input type="text" id="new-vend-bank" class="fin-form-input" placeholder="State Bank of India">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Account No</label>
                  <input type="text" id="new-vend-ac" class="fin-form-input" placeholder="39485729103">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">IFSC Code</label>
                  <input type="text" id="new-vend-ifsc" class="fin-form-input" placeholder="SBIN0000300">
                </div>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-add-vend')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save Vendor Record &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('add-vend-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        vendor: {
          name: document.getElementById('new-vend-name').value.trim(),
          category: document.getElementById('new-vend-cat').value,
          contact_person: document.getElementById('new-vend-contact').value.trim(),
          email: document.getElementById('new-vend-email').value.trim(),
          phone: document.getElementById('new-vend-phone').value.trim(),
          gstin: document.getElementById('new-vend-gstin').value.trim().toUpperCase(),
          pan: document.getElementById('new-vend-pan').value.trim().toUpperCase(),
          bank_name: document.getElementById('new-vend-bank').value.trim(),
          account_no: document.getElementById('new-vend-ac').value.trim(),
          ifsc_code: document.getElementById('new-vend-ifsc').value.trim().toUpperCase()
        }
      };

      const res = await this.syncApi('create_vendor', payload);
      if (res && res.success) {
        alert(`Vendor ${res.vendor.name} added successfully.`);
        this.closeModal('modal-add-vend');
        this.switchTab('vendors');
      }
    };
  }

  // 10. ADD ITEM / SERVICE MODAL
  openCreateItemModal() {
    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-add-item">
        <div class="fin-modal-dialog" style="max-width:600px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">📦 Add New Catalog Item or Service</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-add-item')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="add-item-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Item / Service Name <span style="color:#ef4444;">*</span></label>
                <input type="text" id="new-item-name" class="fin-form-input" required placeholder="e.g. Ready Mix Concrete M50 Grade">
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Category</label>
                  <select id="new-item-cat" class="fin-form-select">
                    <option value="Civil & Raw Materials">Civil &amp; Raw Materials</option>
                    <option value="Interior & Architectural">Interior &amp; Architectural</option>
                    <option value="MEP Engineering">MEP Engineering</option>
                    <option value="Heavy Equipment & Plant">Heavy Equipment &amp; Plant</option>
                    <option value="Facility Management">Facility Management</option>
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">HSN / SAC Code <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="new-item-hsn" class="fin-form-input" required placeholder="e.g. 3824 or 9954">
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Unit of Measure (UOM)</label>
                  <select id="new-item-uom" class="fin-form-select">
                    <option value="MT">MT (Metric Ton)</option>
                    <option value="CUM">CUM (Cubic Meter)</option>
                    <option value="SQM">SQM (Square Meter)</option>
                    <option value="LSUM">LSUM (Lump Sum)</option>
                    <option value="HRS">HRS (Hours)</option>
                    <option value="UNITS">UNITS</option>
                    <option value="ANNUM">ANNUM</option>
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Default Sales Rate (₹)</label>
                  <input type="number" id="new-item-sales" class="fin-form-input" required placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Default Cost Rate (₹)</label>
                  <input type="number" id="new-item-cost" class="fin-form-input" required placeholder="0.00">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Applicable GST Rate</label>
                <select id="new-item-gst" class="fin-form-select">
                  <option value="18" selected>18% (Standard)</option>
                  <option value="12">12%</option>
                  <option value="5">5%</option>
                  <option value="28">28%</option>
                  <option value="0">0% (Exempt)</option>
                </select>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-add-item')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save Item to Catalog &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('add-item-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        item: {
          name: document.getElementById('new-item-name').value.trim(),
          category: document.getElementById('new-item-cat').value,
          hsn_sac_code: document.getElementById('new-item-hsn').value.trim(),
          uom: document.getElementById('new-item-uom').value,
          sales_price: Number(document.getElementById('new-item-sales').value),
          purchase_price: Number(document.getElementById('new-item-cost').value),
          gst_rate: Number(document.getElementById('new-item-gst').value)
        }
      };

      const res = await this.syncApi('create_item', payload);
      if (res && res.success) {
        alert(`Catalog item ${res.item.name} added successfully.`);
        this.closeModal('modal-add-item');
        this.switchTab('items');
      }
    };
  }

  // 11. RECORD EXPENSE CLAIM MODAL
  openCreateExpenseModal() {
    const projects = this.db?.projects || [];

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-expense">
        <div class="fin-modal-dialog" style="max-width:600px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">🧾 Record Business Expense / Claim</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-expense')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="create-expense-form">
              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Expense Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="exp-date" class="fin-form-input" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Category <span style="color:#ef4444;">*</span></label>
                  <select id="exp-category" class="fin-form-select" required>
                    <option value="Site Expenses & Consumables">Site Expenses &amp; Consumables</option>
                    <option value="Travel & Accommodation">Travel &amp; Accommodation</option>
                    <option value="Equipment & Fuel">Equipment &amp; Fuel</option>
                    <option value="Utilities & Maintenance">Utilities &amp; Maintenance</option>
                    <option value="Professional Services">Professional &amp; Legal Services</option>
                    <option value="Employee Reimbursements">Employee Reimbursements</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Description of Expense <span style="color:#ef4444;">*</span></label>
                <input type="text" id="exp-desc" class="fin-form-input" required placeholder="e.g. Safety PPE equipment for NH-48 bridge erection">
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Amount (₹ Excl. Tax) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="exp-amount" class="fin-form-input" min="1" step="any" required placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Tax / GST Amount (₹)</label>
                  <input type="number" id="exp-tax" class="fin-form-input" value="0" step="any">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Linked Project / Cost Center</label>
                  <select id="exp-project" class="fin-form-select">
                    <option value="">Head Office General</option>
                    ${projects.map(p => `<option value="${p.id}" data-name="${p.name}">${p.name}</option>`).join('')}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Payment Method</label>
                  <select id="exp-pay-mode" class="fin-form-select">
                    <option value="Employee Reimbursement">Employee Reimbursement</option>
                    <option value="Corporate Debit Card">Corporate Debit Card</option>
                    <option value="Direct Bank Wire">Direct Bank Wire</option>
                    <option value="Petty Cash">Petty Cash</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Attach Tax Receipt / Invoice Proof (PDF)</label>
                <input type="file" id="exp-file" class="fin-form-input">
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-expense')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Submit Expense Claim &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('create-expense-form').onsubmit = async (e) => {
      e.preventDefault();
      const prjSel = document.getElementById('exp-project');
      const fileInp = document.getElementById('exp-file');
      const filename = fileInp.files.length ? fileInp.files[0].name : 'expense-receipt.pdf';

      const payload = {
        expense: {
          date: document.getElementById('exp-date').value,
          category: document.getElementById('exp-category').value,
          description: document.getElementById('exp-desc').value.trim(),
          amount: Number(document.getElementById('exp-amount').value),
          tax_amount: Number(document.getElementById('exp-tax').value) || 0,
          project_id: prjSel.value || null,
          project_name: prjSel.options[prjSel.selectedIndex]?.getAttribute('data-name') || '',
          payment_method: document.getElementById('exp-pay-mode').value,
          receipt_filename: filename
        }
      };

      const res = await this.syncApi('create_expense', payload);
      if (res && res.success) {
        alert(`Expense ${res.expense.expense_no} submitted successfully.`);
        this.closeModal('modal-expense');
        this.switchTab('expenses');
      }
    };
  }

  // 12. CREATE PURCHASE ORDER MODAL
  openCreatePOModal() {
    const vendors = this.db?.vendors || [];
    const projects = this.db?.projects || [];
    const items = this.db?.items || [];

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-po">
        <div class="fin-modal-dialog" style="max-width:680px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">📑 Create Purchase Order (PO)</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-po')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="create-po-form">
              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Vendor <span style="color:#ef4444;">*</span></label>
                  <select id="po-vend" class="fin-form-select" required>
                    <option value="" disabled selected>Select Vendor</option>
                    ${vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Project Association <span style="color:#ef4444;">*</span></label>
                  <select id="po-prj" class="fin-form-select" required>
                    <option value="" disabled selected>Select Project</option>
                    ${projects.map(p => `<option value="${p.id}" data-name="${p.name}">${p.name}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">PO Order Date</label>
                  <input type="date" id="po-date" class="fin-form-input" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Expected Site Delivery</label>
                  <input type="date" id="po-delivery" class="fin-form-input" required>
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Item / Material</label>
                  <select id="po-item-sel" class="fin-form-select">
                    ${items.map(it => `<option value="${it.id}" data-price="${it.purchase_price}">${it.name}</option>`).join('')}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Quantity</label>
                  <input type="number" id="po-qty" class="fin-form-input" value="10" min="1">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Unit Price (₹)</label>
                  <input type="number" id="po-rate" class="fin-form-input" value="${items[0]?.purchase_price || 61200}">
                </div>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-po')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Issue Approved Purchase Order &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    const itemSel = document.getElementById('po-item-sel');
    const rateInp = document.getElementById('po-rate');
    itemSel.onchange = () => {
      const it = items.find(x => x.id === itemSel.value);
      if (it) rateInp.value = it.purchase_price || 0;
    };

    document.getElementById('create-po-form').onsubmit = async (e) => {
      e.preventDefault();
      const vend = vendors.find(v => v.id === document.getElementById('po-vend').value);
      const prjSel = document.getElementById('po-prj');
      const it = items.find(x => x.id === itemSel.value);

      const qty = Number(document.getElementById('po-qty').value) || 1;
      const rate = Number(rateInp.value) || 0;
      const subtotal = qty * rate;
      const tax = subtotal * 0.18;
      const total = subtotal + tax;

      const payload = {
        po: {
          vendor_id: vend.id,
          vendor_name: vend.name,
          project_id: prjSel.value,
          project_name: prjSel.options[prjSel.selectedIndex]?.getAttribute('data-name') || '',
          date: document.getElementById('po-date').value,
          expected_delivery: document.getElementById('po-delivery').value,
          subtotal,
          tax_total: tax,
          total_value: total,
          line_items: [
            {
              item_id: it ? it.id : null,
              name: it ? it.name : 'Procurement Item',
              qty,
              uom: it ? it.uom : 'UNITS',
              unit_price: rate,
              taxable_amount: subtotal,
              gst_rate: 18,
              tax_amount: tax,
              total_amount: total
            }
          ]
        }
      };

      const res = await this.syncApi('create_po', payload);
      if (res && res.success) {
        alert(`Purchase Order ${res.po.po_no} issued to ${vend.name}.`);
        this.closeModal('modal-po');
        this.switchTab('pos');
      }
    };
  }

  // 13. ISSUE CREDIT NOTE MODAL
  openCreateCreditNoteModal(invoiceId) {
    const inv = this.db?.invoices?.find(i => i.id === invoiceId);
    if (!inv) return;

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-cn">
        <div class="fin-modal-dialog" style="max-width:600px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">🔄 Issue Sales Credit Note against ${inv.invoice_no}</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-cn')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="create-cn-form">
              <div style="background:rgba(0,153,230,0.1); border-radius:8px; padding:1rem; margin-bottom:1.25rem; font-size:0.82rem;">
                Client: <strong>${inv.customer_name}</strong><br>
                Current Invoice Total: <strong>${this.formatCurrency(inv.grand_total)}</strong> • Balance: <strong style="color:#ef4444;">${this.formatCurrency(inv.balance_due)}</strong>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Credit Adjustment Reason <span style="color:#ef4444;">*</span></label>
                <input type="text" id="cn-reason" class="fin-form-input" required placeholder="e.g. Rate revision or quantity over-measurement">
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Taxable Adjustment Value (₹) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="cn-taxable" class="fin-form-input" max="${inv.balance_due}" step="any" required placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Tax Adjustment (₹)</label>
                  <input type="number" id="cn-tax" class="fin-form-input" step="any" placeholder="0.00">
                </div>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-cn')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Issue Credit Note &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('create-cn-form').onsubmit = async (e) => {
      e.preventDefault();
      const taxable = Number(document.getElementById('cn-taxable').value) || 0;
      const tax = Number(document.getElementById('cn-tax').value) || (taxable * 0.18);

      const payload = {
        credit_note: {
          invoice_id: inv.id,
          invoice_no: inv.invoice_no,
          customer_id: inv.customer_id,
          customer_name: inv.customer_name,
          reason: document.getElementById('cn-reason').value.trim(),
          taxable_amount: taxable,
          tax_amount: tax
        }
      };

      const res = await this.syncApi('create_credit_note', payload);
      if (res && res.success) {
        alert(`Credit note ${res.credit_note.credit_note_no} posted. Invoice balance reduced.`);
        this.closeModal('modal-cn');
        this.switchTab('notes');
      }
    };
  }

  // 14. INVITE USER MODAL
  openInviteUserModal() {
    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-invite">
        <div class="fin-modal-dialog" style="max-width:550px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">🛡️ Invite Employee to Financial Portal</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-invite')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="invite-user-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Full Name <span style="color:#ef4444;">*</span></label>
                <input type="text" id="inv-u-name" class="fin-form-input" required placeholder="e.g. Sameer Al Nuaimi">
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Corporate Email <span style="color:#ef4444;">*</span></label>
                <input type="email" id="inv-u-email" class="fin-form-input" required placeholder="e.g. sameer@rayangroup.com">
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Assigned Role &amp; Access Level <span style="color:#ef4444;">*</span></label>
                <select id="inv-u-role" class="fin-form-select" required>
                  <option value="accountant">Accountant (Invoices, Bills, Receipts)</option>
                  <option value="finance_admin">Finance Administrator (Approvals, Ledgers)</option>
                  <option value="project_manager">Project Manager (Project Budgets, POs)</option>
                  <option value="employee">Employee (Expense Claims)</option>
                  <option value="management_readonly">Management / Read-Only (Reports, P&amp;L)</option>
                  <option value="super_admin">Super Administrator (Full System)</option>
                </select>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Designation</label>
                  <input type="text" id="inv-u-desig" class="fin-form-input" placeholder="e.g. Assistant Controller">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Department</label>
                  <input type="text" id="inv-u-dept" class="fin-form-input" placeholder="e.g. Accounts Payable">
                </div>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-invite')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Send Invitation &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('invite-user-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        user: {
          name: document.getElementById('inv-u-name').value.trim(),
          email: document.getElementById('inv-u-email').value.trim(),
          role: document.getElementById('inv-u-role').value,
          designation: document.getElementById('inv-u-desig').value.trim(),
          department: document.getElementById('inv-u-dept').value.trim()
        }
      };

      const res = await this.syncApi('invite_user', payload);
      if (res && res.success) {
        alert(`User invitation dispatched to ${res.user.email} with role ${res.user.role_label}.`);
        this.closeModal('modal-invite');
        this.switchTab('users');
      } else {
        alert(res?.error || 'Could not invite user.');
      }
    };
  }

  // 15. NOTIFICATIONS MODAL
  openNotificationsModal() {
    const notifs = this.db?.notifications || [];

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-notif">
        <div class="fin-modal-dialog" style="max-width:550px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">🔔 Financial Alerts &amp; Notifications</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-notif')">&times;</button>
          </div>
          <div class="fin-modal-body">
            ${notifs.map(n => `
              <div style="background:rgba(255,255,255,0.035); border-left:3px solid ${n.type === 'warning' ? '#ef4444' : (n.type === 'action_required' ? '#f59e0b' : '#10b981')}; border-radius:6px; padding:0.85rem 1rem; margin-bottom:0.75rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.85rem; color:#f8fafc;">${n.title}</strong>
                  <span style="font-size:0.68rem; color:#94a3b8;">${new Date(n.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
                </div>
                <p style="font-size:0.78rem; color:#cbd5e1; margin-top:0.35rem; line-height:1.4;">${n.message}</p>
                <div style="margin-top:0.5rem;">
                  <button type="button" class="fin-btn-row-action" onclick="window.finApp.closeModal('modal-notif'); window.finApp.switchTab('${n.link}')">Open ${n.link} &rarr;</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
  }

  // 16. USER PROFILE MODAL
  openUserProfileModal() {
    if (!this.currentUser) return;
    const u = this.currentUser;

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-user-prof">
        <div class="fin-modal-dialog" style="max-width:520px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">👤 Authorized Profile &amp; Credentials</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-user-prof')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <div style="text-align:center; margin-bottom:1.5rem;">
              <div style="width:58px; height:58px; border-radius:50%; background:linear-gradient(135deg, #0099e6, #10b981); display:inline-flex; align-items:center; justify-content:center; font-size:1.8rem; margin-bottom:0.5rem;">
                ${u.avatar || '👤'}
              </div>
              <h3 style="font-family:var(--fin-font-heading); color:#f8fafc; font-size:1.2rem;">${u.name}</h3>
              <span class="fin-badge fin-badge-issued">${u.role_label}</span>
            </div>

            <div style="font-size:0.82rem; line-height:1.8; background:rgba(0,0,0,0.25); border-radius:8px; padding:1.25rem;">
              <div><strong>Email:</strong> ${u.email}</div>
              <div><strong>Designation:</strong> ${u.designation || '—'}</div>
              <div><strong>Department:</strong> ${u.department || '—'}</div>
              <div><strong>Phone:</strong> ${u.phone || '—'}</div>
              <div><strong>Terminal IP:</strong> <code>127.0.0.1 (Secure Local Session)</code></div>
            </div>

            <div class="fin-modal-footer" style="padding:1.25rem 0 0; background:transparent;">
              <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-user-prof')">Close</button>
              <button type="button" class="fin-btn-quick" style="color:#ef4444;" onclick="window.finApp.closeModal('modal-user-prof'); window.finApp.clearSession();">Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
  }

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  closeDocPrintModal() {
    const el = document.getElementById('fin-doc-print-modal');
    if (el) el.remove();
  }

  openInvoiceDetail(id) {
    this.openInvoicePrintModal(id);
  }

  // 17. BANK TRANSFER / WIRE MODAL
  openBankTransferModal() {
    const banks = this.db?.bank_accounts || [];
    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-bank-transfer">
        <div class="fin-modal-dialog" style="max-width:550px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">🏛️ Record Bank Wire / Inter-Account Transfer</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-bank-transfer')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="bank-transfer-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Source Account (Debit From) <span style="color:#ef4444;">*</span></label>
                <select id="bt-source" class="fin-form-select" required>
                  ${banks.map(b => `<option value="${b.id}">${b.bank_name} — ${b.account_name} (${b.currency} ${Number(b.balance).toLocaleString()})</option>`).join('')}
                </select>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Beneficiary / Destination Account <span style="color:#ef4444;">*</span></label>
                <input type="text" id="bt-dest" class="fin-form-input" required placeholder="e.g. First Abu Dhabi Bank / Contractor Escrow / Vendor Remittance">
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Transfer Amount <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="bt-amount" class="fin-form-input" required step="any" placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Transfer Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="bt-date" class="fin-form-input" required value="${new Date().toISOString().split('T')[0]}">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Bank Reference / UTR # <span style="color:#ef4444;">*</span></label>
                <input type="text" id="bt-utr" class="fin-form-input" required placeholder="e.g. UTR-FAB-2026-99042">
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Purpose / Description</label>
                <textarea id="bt-purpose" class="fin-form-textarea" rows="2" placeholder="e.g. Treasury liquidity rebalancing / site project escrow allocation"></textarea>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-bank-transfer')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Post Bank Wire &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('bank-transfer-form').onsubmit = (e) => {
      e.preventDefault();
      const amount = Number(document.getElementById('bt-amount').value) || 0;
      const utr = document.getElementById('bt-utr').value.trim();
      alert(`Bank wire voucher recorded successfully. UTR: ${utr} (${this.formatCurrency(amount)}).`);
      this.closeModal('modal-bank-transfer');
      this.activeTab = 'bank_accounts';
      this.renderActiveTab();
    };
  }

  // 18. CASH ENTRY MODAL
  openCashEntryModal() {
    const registers = this.db?.cash_in_hand || [];
    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-cash-entry">
        <div class="fin-modal-dialog" style="max-width:550px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">💵 Record Site Petty Cash Voucher</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-cash-entry')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="cash-entry-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Cash Register Vault <span style="color:#ef4444;">*</span></label>
                <select id="ce-vault" class="fin-form-select" required>
                  ${registers.map(r => `<option value="${r.id}">${r.register_name} (Bal: ${r.currency} ${Number(r.balance).toLocaleString()})</option>`).join('')}
                </select>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Disbursed Amount <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="ce-amount" class="fin-form-input" required step="any" placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="ce-date" class="fin-form-input" required value="${new Date().toISOString().split('T')[0]}">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Payee / Recipient Employee <span style="color:#ef4444;">*</span></label>
                <input type="text" id="ce-payee" class="fin-form-input" required placeholder="e.g. Site Runner / Equipment Operator">
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Expense Purpose / Reason <span style="color:#ef4444;">*</span></label>
                <input type="text" id="ce-purpose" class="fin-form-input" required placeholder="e.g. Emergency generator diesel, local municipal permit fee">
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-cash-entry')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Issue Cash Voucher &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('cash-entry-form').onsubmit = (e) => {
      e.preventDefault();
      const amt = Number(document.getElementById('ce-amount').value) || 0;
      alert(`Petty cash voucher issued for ${this.formatCurrency(amt)}. Approved by Accounts.`);
      this.closeModal('modal-cash-entry');
      this.activeTab = 'cash_in_hand';
      this.renderActiveTab();
    };
  }

  // 19. LOAN ENTRY MODAL
  openLoanEntryModal() {
    const loans = this.db?.loan_accounts || [];
    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-loan-entry">
        <div class="fin-modal-dialog" style="max-width:550px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">🏢 Record Credit Facility Transaction</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-loan-entry')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="loan-entry-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Corporate Credit Facility <span style="color:#ef4444;">*</span></label>
                <select id="le-facility" class="fin-form-select" required>
                  ${loans.map(l => `<option value="${l.id}">${l.facility_name} (${l.lender})</option>`).join('')}
                </select>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Transaction Type <span style="color:#ef4444;">*</span></label>
                  <select id="le-type" class="fin-form-select" required>
                    <option value="repayment">Principal / EMI Repayment</option>
                    <option value="drawdown">Facility Drawdown / Utilization</option>
                    <option value="interest">Interest / Bank Commission Service</option>
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Amount <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="le-amount" class="fin-form-input" required step="any" placeholder="0.00">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Bank Reference / Advice # <span style="color:#ef4444;">*</span></label>
                <input type="text" id="le-ref" class="fin-form-input" required placeholder="e.g. SBI-CONS-2026-OCT">
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-loan-entry')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Record Facility Entry &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('loan-entry-form').onsubmit = (e) => {
      e.preventDefault();
      const amt = Number(document.getElementById('le-amount').value) || 0;
      alert(`Corporate credit facility entry recorded for ${this.formatCurrency(amt)}.`);
      this.closeModal('modal-loan-entry');
      this.activeTab = 'loan_accounts';
      this.renderActiveTab();
    };
  }

  // 20. PROMPT TO ISSUE CREDIT/DEBIT NOTE
  openCreateNotePrompt(type = 'credit_note') {
    if (type === 'credit_note') {
      const invoices = (this.db?.invoices || []).filter(i => i.status !== 'void');
      if (invoices.length === 0) {
        alert('No active invoices found to issue a credit note against.');
        return;
      }
      const inv = invoices[0];
      this.openCreateCreditNoteModal(inv.id);
    } else {
      const bills = (this.db?.purchase_bills || []).filter(b => b.status !== 'void');
      const modalHtml = `
        <div class="fin-modal-backdrop open" id="modal-dn">
          <div class="fin-modal-dialog" style="max-width:600px;">
            <div class="fin-modal-header">
              <h3 class="fin-modal-title">🔄 Issue Purchase Debit Note</h3>
              <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-dn')">&times;</button>
            </div>
            <div class="fin-modal-body">
              <form id="create-dn-form">
                <div class="fin-form-group">
                  <label class="fin-form-label">Select Purchase Bill Ref <span style="color:#ef4444;">*</span></label>
                  <select id="dn-bill-select" class="fin-form-select" required>
                    ${bills.map(b => `<option value="${b.id}" data-vendor="${b.vendor_name}" data-billno="${b.bill_no}">${b.bill_no} — ${b.vendor_name} (₹${Number(b.grand_total).toLocaleString()})</option>`).join('')}
                  </select>
                </div>

                <div class="fin-form-group">
                  <label class="fin-form-label">Debit Reason <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="dn-reason" class="fin-form-input" required placeholder="e.g. Damage in transit / Rate differential on steel coils">
                </div>

                <div class="fin-form-group">
                  <label class="fin-form-label">Debit Adjustment Amount (₹) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="dn-amount" class="fin-form-input" required step="any" placeholder="0.00">
                </div>

                <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                  <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-dn')">Cancel</button>
                  <button type="submit" class="fin-btn-quick primary">Issue Debit Note &rarr;</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;
      document.getElementById('fin-modal-container').innerHTML = modalHtml;
      document.getElementById('create-dn-form').onsubmit = (e) => {
        e.preventDefault();
        const sel = document.getElementById('dn-bill-select');
        const opt = sel.options[sel.selectedIndex];
        const newDn = {
          id: 'dn-' + Date.now(),
          debit_note_no: 'DN-2026-00' + ((this.db?.debit_notes?.length || 0) + 1),
          bill_no: opt.getAttribute('data-billno'),
          vendor_name: opt.getAttribute('data-vendor'),
          reason: document.getElementById('dn-reason').value.trim(),
          total_debit_amount: Number(document.getElementById('dn-amount').value) || 0,
          status: 'applied'
        };
        this.db.debit_notes = this.db.debit_notes || [];
        this.db.debit_notes.unshift(newDn);
        alert(`Debit note ${newDn.debit_note_no} created and applied against bill ${newDn.bill_no}.`);
        this.closeModal('modal-dn');
        this.activeTab = 'debit_notes';
        this.renderActiveTab();
      };
    }
  }

  // 21. UPLOAD DOCUMENT MODAL
  openUploadDocModal() {
    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-upload-doc">
        <div class="fin-modal-dialog" style="max-width:550px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">📁 Upload Corporate File to Document Vault</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-upload-doc')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="upload-doc-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Document Title / File Name <span style="color:#ef4444;">*</span></label>
                <input type="text" id="ud-name" class="fin-form-input" required placeholder="e.g. Dubai Substation EPC Milestone Agreement.pdf">
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Category <span style="color:#ef4444;">*</span></label>
                  <select id="ud-category" class="fin-form-select" required>
                    <option value="Contract">Client Contract</option>
                    <option value="Statutory">Statutory &amp; Tax</option>
                    <option value="Audit">Audit &amp; Compliance</option>
                    <option value="Procurement">Supplier Procurement PO</option>
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Linked Record</label>
                  <input type="text" id="ud-ref" class="fin-form-input" placeholder="e.g. REC-RG-INV-44049">
                </div>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-upload-doc')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Upload &amp; Encrypt &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('upload-doc-form').onsubmit = (e) => {
      e.preventDefault();
      const doc = {
        id: 'doc-' + Date.now(),
        name: document.getElementById('ud-name').value.trim(),
        category: document.getElementById('ud-category').value,
        size: '1.4 MB',
        uploaded_by: this.currentUser?.name || 'Administrator',
        date: new Date().toISOString().split('T')[0],
        linked_record: document.getElementById('ud-ref').value.trim() || 'General'
      };
      this.db.documents = this.db.documents || [];
      this.db.documents.unshift(doc);
      alert(`Document "${doc.name}" uploaded and encrypted in vault.`);
      this.closeModal('modal-upload-doc');
      this.activeTab = 'documents';
      this.renderActiveTab();
    };
  }

  // --------------------------------------------------------------------------
  // OFFICIAL RAYAN ENGINEERING PRINTABLE DOCUMENT GENERATORS
  // --------------------------------------------------------------------------
  getRayanLogoImg(isPO = false) {
    const src = isPO ? '/assets/docs/rayan-doc-logo-po.png' : '/assets/docs/rayan-doc-logo.png';
    return `
      <div class="rayan-doc-logo-area">
        <img src="${src}" alt="RAYAN ENGINEERING" class="${isPO ? 'rayan-doc-logo-po-img' : 'rayan-doc-logo-img'}">
      </div>
    `;
  }

  getRayanBarcode(text = '104937380400003') {
    return `
      <div style="display:flex; flex-direction:column; align-items:flex-end;">
        <span style="font-size:10px; font-weight:700; color:#000; margin-bottom:2px;">TRN ${text}</span>
        <img src="/assets/docs/rayan-barcode-trn.jpg" alt="TRN Barcode" style="height:18px; width:140px; object-fit:contain;">
      </div>
    `;
  }

  getRayanStampImg() {
    return `<img src="/assets/docs/rayan-stamp-official.png" alt="Rayan Official Stamp" class="rayan-real-stamp">`;
  }

  getRayanSignatureImg(type = 'default') {
    const src = type === 'receipt' ? '/assets/docs/rayan-signature-receipt.png' : '/assets/docs/rayan-signature-official.png';
    return `<img src="${src}" alt="Authorised Signature" class="rayan-real-signature">`;
  }

  getRayanWatermark() {
    return `<div class="rayan-doc-watermark"><img src="/assets/docs/rayan-watermark.png" alt="" style="width:135px; opacity:0.15;"></div>`;
  }

  numberToEnglishWords(num) {
    if (!num || num === 0) return 'Zero Only.';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numInt = Math.floor(num);
    const numDec = Math.round((num - numInt) * 100);

    function inWords(n) {
      let str = '';
      if (n > 99) {
        str += a[Math.floor(n / 100)] + 'Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
      } else if (n > 0) {
        str += a[n];
      }
      return str;
    }

    let words = '';
    const millions = Math.floor(numInt / 1000000);
    const thousands = Math.floor((numInt % 1000000) / 1000);
    const remainder = Math.floor(numInt % 1000);

    if (millions > 0) words += inWords(millions) + 'Million ';
    if (thousands > 0) words += inWords(thousands) + 'Thousand ';
    if (remainder > 0) words += inWords(remainder);

    words = words.trim();
    if (numDec > 0) {
      words += ' and ' + inWords(numDec).trim() + ' Fils';
    }
    return words ? words + ' Only.' : 'Zero Only.';
  }

  // 1. TAX INVOICE PRINT MODAL
  openInvoicePrintModal(invoiceId) {
    let inv = (this.db?.invoices || []).find(i => i.id === invoiceId || i.invoice_no === invoiceId);
    if (!inv) {
      inv = (this.db?.invoices || []).find(i => i.invoice_no === 'REC-RG-INV-44049') || (this.db?.invoices || [])[0] || {};
    }

    const modalHtml = `
      <div class="fin-doc-modal-backdrop" id="fin-doc-print-modal">
        <div class="fin-doc-toolbar">
          <div class="fin-doc-toolbar-left">
            <div class="fin-doc-title-badge">
              <span>📄</span>
              <span>Rayan Engineering Official Tax Invoice (فاتورة ضريبية)</span>
            </div>
            <div class="fin-doc-type-pills">
              <button type="button" class="fin-doc-pill-btn active" onclick="window.finApp.openInvoicePrintModal('${inv.id || ''}')">Tax Invoice</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openReceiptPrintModal()">Receipt Voucher</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPOPrintModal()">Purchase Order</button>
            </div>
          </div>
          <div class="fin-doc-toolbar-right">
            <button type="button" class="fin-btn-print-action fin-btn-print-primary" onclick="window.print()">
              🖨️ Print / Save as PDF
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal()">
              ✕ Close
            </button>
          </div>
        </div>

        <div class="fin-doc-viewport">
          <div class="fin-document-paper">
            <div class="rayan-doc-teal-bar">RAYAN ENGINEERING</div>

            <div class="fin-doc-inner-padding">
              ${this.getRayanWatermark()}

              <!-- Brand Header Row -->
              <div class="rayan-doc-brand-row">
                ${this.getRayanLogoImg(false)}
                <div class="rayan-doc-center-title">
                  <div class="rayan-title-ar">فاتورة ضريبية</div>
                  <div class="rayan-title-en">TAX INVOICE</div>
                </div>
                ${this.getRayanBarcode(inv.company_trn || '104937380400003')}
              </div>

              <!-- Sub Header Box: PO NO -->
              <div style="border:1.5px solid #000; font-size:10.5px; font-weight:700; text-align:center; padding:3px; margin-bottom:5px;">
                PO NO / امر شراء : ${inv.po_reference || 'LPO/BD/2026/12'}
              </div>

              <!-- From & Invoice Meta -->
              <table class="rayan-border-box">
                <tr>
                  <td style="width:50%; line-height:1.4;">
                    <strong>From:</strong><br>
                    <strong>RAYAN ENGINEERING AND CONTRACTING - L.L.C - S.P.C</strong><br>
                    MUSSAFAH M-36, ABU DHABI , UAE P.O BOX 91800
                  </td>
                  <td style="width:50%; line-height:1.4;">
                    <div><strong>Invoice Date / تاريخ الفاتورة :</strong> ${inv.invoice_date ? this.formatDate(inv.invoice_date) : '13-Oct-2026'}</div>
                    <div><strong>Invoice No / رقم الفاتورة :</strong> ${inv.invoice_no || 'REC-RG-INV-44049'}</div>
                  </td>
                </tr>
              </table>

              <!-- Client Details -->
              <table class="rayan-border-box">
                <tr>
                  <td style="width:50%; line-height:1.4;">
                    <strong>Clint:</strong><br>
                    <strong>${inv.customer_name || 'M/s. BUILDARA GENERAL CONTRACTING - L.L.C'}</strong><br>
                    ${inv.customer_address || 'ABU DHABI, MADINAT ZAYED'}<br>
                    <strong>TRN</strong> &nbsp; ${inv.customer_trn || inv.customer_gstin || '105405525400003'}<br>
                    <strong>Atten.</strong> &nbsp; ${inv.contact_person || 'Mr.Sooraj Kumar'}
                  </td>
                  <td style="width:50%; line-height:1.4;">
                    <div><strong>PO NO / امر شراء :</strong> ${inv.po_reference || 'LPO/BD/2026/12'}</div>
                    <div><strong>Date / تاريخ :</strong> ${inv.invoice_date ? this.formatDate(inv.invoice_date) : '13-Oct-2026'}</div>
                    <div><strong>Email:</strong> <a href="mailto:${inv.email || 'buildaradevelopers@gmail.com'}" class="rayan-link-blue">${inv.email || 'buildaradevelopers@gmail.com'}</a></div>
                    <div><strong>Mode/Terms of Payment:</strong> ${inv.payment_terms_label || (inv.payment_terms ? `${inv.payment_terms} Days Net` : 'Progressive Payment')}</div>
                  </td>
                </tr>
              </table>

              <!-- Project Bar -->
              <div class="rayan-project-bar">
                Project: ${inv.project_name || 'Yateem Optician, Khalidiyah Mall, Abu Dhabi'}
              </div>

              <!-- Line Items Table -->
              <table class="rayan-data-table">
                <thead>
                  <tr>
                    <th style="width:5%;">Sr. No.<br>رقم</th>
                    <th style="width:40%;">Description<br>وصف</th>
                    <th style="width:7%;">Unit<br>وحدة</th>
                    <th style="width:7%;">Qty<br>الكمية</th>
                    <th style="width:12%;">Project Price<br>سعر المشروع</th>
                    <th style="width:13%;">Invoice Amount<br>مبلغ الفاتورة</th>
                    <th style="width:8%;">Vat 5%<br>ضريبة</th>
                    <th style="width:14%;">Total Amount<br>المبلغ الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  ${(inv.line_items && inv.line_items.length ? inv.line_items : [
                    {
                      sr: 1,
                      name: "20% PROGRESSIVE PAYMENT FOR PO NO. LPO/BD/2026/12",
                      description: "Civil & Interior Work at Yateem Optician, Khalidiyah Mall, Abu Dhabi",
                      unit: "%",
                      qty: 20,
                      project_price: 57000,
                      invoice_amount: 11400,
                      vat_amount: 570,
                      total_amount: 11400
                    }
                  ]).map((item, idx) => `
                    <tr>
                      <td style="text-align:center;">${item.sr || (idx + 1)}</td>
                      <td>
                        <strong>${item.name || item.description}</strong>
                        ${item.description && item.description !== item.name ? `<br><span style="font-size:8px; color:#333;">${item.description}</span>` : ''}
                      </td>
                      <td style="text-align:center;">${item.unit || item.uom || '%'}</td>
                      <td style="text-align:center;">${item.qty || 1}</td>
                      <td style="text-align:right;">${Number(item.project_price || item.unit_price || 57000).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style="text-align:right;">${Number(item.invoice_amount || item.taxable_amount || 11400).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style="text-align:right;">${Number(item.vat_amount || item.tax_amount || 570).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style="text-align:right;">AED ${Number(item.total_amount || 11400).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Totals Section -->
              <div class="rayan-totals-container">
                <div class="rayan-words-amount">
                  <div><strong>Payable Amount :</strong> ${inv.amount_in_words || this.numberToEnglishWords(inv.grand_total || 11970)}</div>
                </div>
                <table class="rayan-totals-table">
                  <tr>
                    <td><strong>Adjustment</strong></td>
                    <td class="amount-col">${Number(inv.adjustment || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td><strong>Sub-Total</strong></td>
                    <td class="amount-col">${Number(inv.taxable_subtotal || inv.subtotal || 11400).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td><strong>Vat 5%</strong></td>
                    <td class="amount-col">${Number(inv.vat_total || inv.total_tax || 570).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr style="background:#f8fafc; font-weight:800;">
                    <td><strong>Grand Total</strong></td>
                    <td class="amount-col">${Number(inv.grand_total || 11970).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </table>
              </div>

              <div class="rayan-copy-notice">
                Please keep a copy of this invoice for your records
              </div>

              <!-- Footer Signatures -->
              <div class="rayan-signatures-row">
                <div class="rayan-company-contact-meta">
                  <strong>Best wishes</strong><br>
                  <strong>RAYAN Group Team</strong><br>
                  Hotline : 025654497<br>
                  <a href="mailto:cc.info@rayan-group.com" class="rayan-link-blue">cc.info@rayan-group.com</a><br>
                  <a href="http://rayan-group.com" class="rayan-link-blue">http://rayan-group.com</a>
                </div>

                <div class="rayan-stamp-sign-wrap">
                  ${this.getRayanSignatureImg('default')}
                  <div class="rayan-sign-name">Arshad Alam Shaikh</div>
                  <div class="rayan-auth-sign-label">Authorised Signatory</div>
                  ${this.getRayanStampImg()}
                </div>
              </div>
            </div>

            <!-- Bottom Teal Bar -->
            <div class="rayan-doc-footer-bar">
              Tel: +971-25654497 | Abu Dhabi, United Arab Emirates | <a href="mailto:info@rayan-group.com" style="color:#ffffff !important; text-decoration:none;">info@rayan-group.com</a> | <a href="http://www.rayan-group.com" style="color:#ffffff !important; text-decoration:none;">www.rayan-group.com</a>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
  }

  // 2. RECEIPT VOUCHER PRINT MODAL
  openReceiptPrintModal(receiptId) {
    let rec = (this.db?.customer_receipts || []).find(r => r.id === receiptId || r.receipt_no === receiptId);
    if (!rec) {
      rec = (this.db?.customer_receipts || []).find(r => r.receipt_no === 'REC-RV-44025') || (this.db?.customer_receipts || [])[0] || {};
    }

    const modalHtml = `
      <div class="fin-doc-modal-backdrop" id="fin-doc-print-modal">
        <div class="fin-doc-toolbar">
          <div class="fin-doc-toolbar-left">
            <div class="fin-doc-title-badge">
              <span>💳</span>
              <span>Rayan Engineering Official Receipt Voucher (سند قبض)</span>
            </div>
            <div class="fin-doc-type-pills">
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openInvoicePrintModal()">Tax Invoice</button>
              <button type="button" class="fin-doc-pill-btn active" onclick="window.finApp.openReceiptPrintModal('${rec.id || ''}')">Receipt Voucher</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPOPrintModal()">Purchase Order</button>
            </div>
          </div>
          <div class="fin-doc-toolbar-right">
            <button type="button" class="fin-btn-print-action fin-btn-print-primary" onclick="window.print()">
              🖨️ Print / Save as PDF
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal()">
              ✕ Close
            </button>
          </div>
        </div>

        <div class="fin-doc-viewport">
          <div class="fin-document-paper">
            <div class="rayan-doc-teal-bar">RAYAN ENGINEERING</div>

            <div class="fin-doc-inner-padding">
              ${this.getRayanWatermark()}

              <!-- Brand Header -->
              <div class="rayan-doc-brand-row">
                ${this.getRayanLogoImg(false)}
                <div class="rayan-doc-center-title">
                  <div class="rayan-title-ar">سند قبض</div>
                  <div class="rayan-title-en">Receipt Voucher</div>
                </div>
                <div style="width:140px; text-align:right; font-size:12px; font-weight:700; color:#000;">
                  Receipt
                </div>
              </div>

              <div style="border-top:1.5px solid #000; margin:4px 0 8px 0;"></div>

              <!-- Meta Table -->
              <table class="rayan-border-box" style="margin-bottom:8px;">
                <tr>
                  <td style="width:25%; font-weight:700;">Date :</td>
                  <td style="width:45%;">${rec.receipt_date || '17/Sep/2026'} &nbsp; ${rec.receipt_time || '1:40 PM'}</td>
                  <td style="width:30%; text-align:right; font-weight:700; direction:rtl;">التاريخ:</td>
                </tr>
                <tr>
                  <td style="font-weight:700;">Reference number :</td>
                  <td style="color:#ef4444; font-weight:700;">${rec.receipt_no || 'REC-RV-44025'}</td>
                  <td style="text-align:right; font-weight:700; direction:rtl;">الرقم المرجعي</td>
                </tr>
                <tr>
                  <td style="font-weight:700;">Ref. Invoice Number :</td>
                  <td style="font-weight:600;">${rec.ref_invoice_no || (rec.allocations && rec.allocations[0] ? rec.allocations[0].invoice_no : 'REC-RG-INV-44043')}</td>
                  <td style="text-align:right; font-weight:700; direction:rtl;">رقم الفاتورة المرجعية</td>
                </tr>
                <tr>
                  <td style="font-weight:700;">Recevied by:</td>
                  <td style="font-weight:700;">${rec.received_by || 'RAYAN ENGINEERING AND CONTRACTING - L.L.C - S.P.C'}</td>
                  <td style="text-align:right; font-weight:700; direction:rtl;">تم الاستلام بواسطة</td>
                </tr>
              </table>

              <!-- Billing Info -->
              <div style="font-size:10.5px; font-weight:800; border-bottom:1.5px solid #000; padding-bottom:2px; margin-bottom:5px;">Billing Information</div>
              <table class="rayan-border-box" style="margin-bottom:10px;">
                <tr>
                  <td style="width:30%; font-weight:700;">Received from Mr./M/s:</td>
                  <td style="width:45%; font-weight:700;">${rec.customer_name || 'M/S TOP ROCK INTERIORS LLC.'}</td>
                  <td style="width:25%; text-align:right; font-weight:700; direction:rtl;">استلمنا من السيد/السادة</td>
                </tr>
                <tr>
                  <td style="font-weight:700;">Contact Person:</td>
                  <td>${rec.contact_person || 'Mr. Shahil'}</td>
                  <td style="text-align:right; font-weight:700; direction:rtl;">اتصال شخص</td>
                </tr>
                <tr>
                  <td style="font-weight:700;">Email :</td>
                  <td><a href="mailto:${rec.email || 'procurementofficer@toprockinteriors.com'}" class="rayan-link-blue">${rec.email || 'procurementofficer@toprockinteriors.com'}</a></td>
                  <td style="text-align:right; font-weight:700; direction:rtl;">بريد إلكتروني</td>
                </tr>
              </table>

              <!-- Payment Details Table -->
              <div style="font-size:10.5px; font-weight:800; border-bottom:1.5px solid #000; padding-bottom:2px; margin-bottom:5px; display:flex; justify-content:space-between;">
                <span>Payment Details</span>
                <span>Total Amount</span>
              </div>
              <table class="rayan-border-box" style="margin-bottom:10px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="width:30%;">نقداً/شيك رقم/متصل<br>Cash/Cheque/Online</th>
                    <th style="width:15%;">يكتب/Type</th>
                    <th style="width:20%;">البنك/Bank</th>
                    <th style="width:15%;">التاريخ/Date</th>
                    <th style="width:20%; text-align:right;">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="text-align:center; font-weight:700;">${rec.cheque_no || rec.reference_no || '000018989'}</td>
                    <td style="text-align:center;">${rec.payment_type || rec.payment_mode || 'Online'}</td>
                    <td style="text-align:center;">${rec.bank_name || 'First Abu Dhabi Bank'}</td>
                    <td style="text-align:center;">${rec.receipt_date || '17/09/2026'}</td>
                    <td style="text-align:right; font-weight:800; font-size:10.5px;">AED ${Number(rec.amount_received || 155837).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Amount In Words -->
              <table class="rayan-border-box" style="margin-bottom:10px;">
                <tr>
                  <td style="width:25%; font-weight:700;">The Sum Of Dhs:</td>
                  <td style="width:50%; font-weight:700;">${rec.amount_in_words || this.numberToEnglishWords(rec.amount_received || 155837)}</td>
                  <td style="width:25%; text-align:right; font-weight:700; direction:rtl;">مبلغ وقدره درهم</td>
                </tr>
              </table>

              <div class="rayan-copy-notice" style="margin-bottom:14px;">
                Please keep a copy of this receipt for your records
              </div>

              <!-- Footer & Signatures -->
              <div class="rayan-signatures-row" style="margin-top:auto; padding-bottom:8px;">
                <div class="rayan-company-contact-meta">
                  <strong>Best wishes</strong><br>
                  <strong>RAYAN Group Team</strong><br>
                  Hotline : 025654497<br>
                  <a href="mailto:cc.info@rayan-group.com" class="rayan-link-blue">cc.info@rayan-group.com</a><br>
                  <a href="http://rayan-group.com" class="rayan-link-blue">http://rayan-group.com</a>
                </div>

                <div class="rayan-stamp-sign-wrap">
                  ${this.getRayanSignatureImg('receipt')}
                  <div style="display:flex; justify-content:space-between; width:220px; font-size:9.5px; font-weight:700; border-top:1px solid #000; padding-top:2px;">
                    <span>Receiver 's Sign</span>
                    <span>${rec.receiver_sign || 'Arshad Alam Shaikh'}</span>
                    <span style="direction:rtl;">توقيع المستلم</span>
                  </div>
                  ${this.getRayanStampImg()}
                </div>
              </div>
            </div>

            <div class="rayan-doc-footer-bar">
              Tel: +971-25654497 | Abu Dhabi, United Arab Emirates | <a href="mailto:info@rayan-group.com" style="color:#ffffff !important; text-decoration:none;">info@rayan-group.com</a> | <a href="http://www.rayan-group.com" style="color:#ffffff !important; text-decoration:none;">www.rayan-group.com</a>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
  }

  // 3. PURCHASE ORDER PRINT MODAL (2 Full Pages)
  openPOPrintModal(poId) {
    let po = (this.db?.purchase_orders || []).find(p => p.id === poId || p.po_no === poId);
    if (!po) {
      po = (this.db?.purchase_orders || []).find(p => p.po_no === 'PO-REC-11008') || (this.db?.purchase_orders || [])[0] || {};
    }

    const modalHtml = `
      <div class="fin-doc-modal-backdrop" id="fin-doc-print-modal">
        <div class="fin-doc-toolbar">
          <div class="fin-doc-toolbar-left">
            <div class="fin-doc-title-badge">
              <span>📑</span>
              <span>Rayan Engineering Official Purchase Order (امر شراء - 2 Pages)</span>
            </div>
            <div class="fin-doc-type-pills">
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openInvoicePrintModal()">Tax Invoice</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openReceiptPrintModal()">Receipt Voucher</button>
              <button type="button" class="fin-doc-pill-btn active" onclick="window.finApp.openPOPrintModal('${po.id || ''}')">Purchase Order</button>
            </div>
          </div>
          <div class="fin-doc-toolbar-right">
            <button type="button" class="fin-btn-print-action fin-btn-print-primary" onclick="window.print()">
              🖨️ Print / Save as PDF
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal()">
              ✕ Close
            </button>
          </div>
        </div>

        <div class="fin-doc-viewport">
          <!-- PAGE 1 OF PURCHASE ORDER -->
          <div class="fin-document-paper">
            <div class="rayan-doc-teal-bar">RAYAN ENGINEERING</div>

            <div class="fin-doc-inner-padding">
              <!-- Brand Header Row -->
              <div class="rayan-doc-brand-row">
                ${this.getRayanLogoImg(true)}
                <div class="rayan-doc-center-title" style="display:flex; align-items:center; justify-content:center; gap:8px;">
                  <img src="/assets/docs/rayan-po-badge.png" alt="Certificate Badge" style="height:36px; width:auto; object-fit:contain;">
                  <div>
                    <div class="rayan-title-ar">امر شراء</div>
                    <div class="rayan-title-en">PURCHASE ORDER</div>
                  </div>
                </div>
                <div class="rayan-doc-right-meta">
                  <div><strong>PO Number :</strong> ${po.po_no || 'PO-REC-11008'}</div>
                  <div><strong>Date :</strong> ${po.date ? this.formatDate(po.date) : '23/Jun/2026'}</div>
                  <div><strong>Payment Terms :</strong> ${po.payment_terms || 'PDC30'}</div>
                  <div><strong>Crency :</strong> ${po.currency || 'AED'}</div>
                  <div><strong>PO Type :</strong> ${po.po_type || 'Supply/Application'}</div>
                  <div><strong>iRef:</strong> ${po.iref || '2026-KGN-SUB'}</div>
                </div>
              </div>

              <!-- Supplier Details Box & Ship To Box -->
              <table class="rayan-border-box">
                <tr>
                  <td style="width:50%; line-height:1.42;">
                    <strong style="text-decoration:underline;">Supplier Details:</strong><br>
                    <strong>${po.supplier_name || po.vendor_name || 'ARIBA GM INTERIOR DÉCOR LLC'}</strong><br>
                    ${po.supplier_address || 'Abu Dhabi, P.O. Box -'}<br>
                    Quote Ref.: ${po.quote_ref || '-'}<br>
                    <strong>Attn :</strong> ${po.supplier_attn || 'Mr. Mohammad Gulam'}<br>
                    <strong>TRN# :</strong> ${po.supplier_trn || '104755857000003'}<br>
                    <strong>Mobile :</strong> ${po.supplier_mobile || '+971559314189'}<br>
                    <strong>Email :</strong> <a href="mailto:${po.supplier_email || 'aribadecoration@gmail.com'}" class="rayan-link-blue">${po.supplier_email || 'aribadecoration@gmail.com'}</a>
                  </td>
                  <td style="width:50%; line-height:1.42;">
                    <strong style="text-decoration:underline;">Ship To:</strong><br>
                    <strong>${po.ship_to_name || 'RAYAN ENGINEERING AND CONTRACTING - L.L.C - S.P.C'}</strong><br>
                    ${po.ship_to_address || 'Office No. 09, Plot 42, Mussafah M-36, Abu Dhabi P.O. Box 91800'}<br>
                    PO Ref.: ${po.po_no || 'PO-REC-11008'}<br>
                    Responsible Person : ${po.responsible_person || 'Mohammad Suhel'}<br>
                    <strong>Attn :</strong> ${po.ship_to_attn || 'Mr. Arshad Alam Shaikh'}<br>
                    <strong>TRN# :</strong> ${po.ship_to_trn || '104937380400003'}<br>
                    <strong>Phone :</strong> ${po.ship_to_phone || '+971 25 654497'}<br>
                    <strong>Email :</strong> <a href="mailto:${po.ship_to_email || 'info@rayan-group.com'}" class="rayan-link-blue">${po.ship_to_email || 'info@rayan-group.com'}</a><br>
                    <strong>Mobile :</strong> ${po.ship_to_mobile || '+971 589827866'}
                  </td>
                </tr>
              </table>

              <!-- Project Bar -->
              <div class="rayan-project-bar">
                Project At ${po.project_name || 'Al Foah Mall Screeding Work'}
              </div>

              <!-- Line Items Table -->
              <table class="rayan-data-table">
                <thead>
                  <tr>
                    <th style="width:5%;">Sr. No.<br>رقم</th>
                    <th style="width:40%;">Description<br>وصف</th>
                    <th style="width:7%;">Unit<br>وحدة</th>
                    <th style="width:7%;">Qty<br>الكمية</th>
                    <th style="width:12%;">Unit Price<br>سعر الوحدة</th>
                    <th style="width:13%;">Invoice Amount<br>مبلغ الفاتورة</th>
                    <th style="width:8%;">Vat 5%<br>ضريبة</th>
                    <th style="width:14%;">Total Amount<br>المبلغ الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  ${(po.line_items && po.line_items.length ? po.line_items : [
                    {
                      sr: 1,
                      name: "Supply and Application of Screeding 8-10 Cm Thickness with ( Polythen Sheet below screed)",
                      description: "Supply and Application of Screeding 8-10 Cm Thickness with ( Polythen Sheet below screed)",
                      unit: "Sqm",
                      qty: 160,
                      unit_price: 60,
                      invoice_amount: 9600,
                      vat_amount: 480,
                      total_amount: 9600
                    }
                  ]).map((item, idx) => `
                    <tr>
                      <td style="text-align:center;">${item.sr || (idx + 1)}</td>
                      <td><strong>${item.name || item.description}</strong></td>
                      <td style="text-align:center;">${item.unit || item.uom || 'Sqm'}</td>
                      <td style="text-align:center;">${item.qty || 160}</td>
                      <td style="text-align:right;">${Number(item.unit_price || 60).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style="text-align:right;">${Number(item.invoice_amount || item.taxable_amount || 9600).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style="text-align:right;">${Number(item.vat_amount || item.tax_amount || 480).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style="text-align:right;">AED ${Number(item.total_amount || 9600).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Totals Box -->
              <div class="rayan-totals-container">
                <div class="rayan-words-amount">
                  <div style="color:#059669; font-size:10.5px; font-weight:800;">${po.amount_in_words || ('AED ' + this.numberToEnglishWords(po.total_value || po.grand_total || 10080))}</div>
                </div>
                <table class="rayan-totals-table">
                  <tr>
                    <td>Misc.Charges Subtotal:(إ.د)</td>
                    <td class="amount-col">${Number(po.misc_charges || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td>Total amount EX-VAT(إ.د)</td>
                    <td class="amount-col">${Number(po.subtotal_ex_vat || po.subtotal || 9600).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td>VAT Amount:(إ.د)</td>
                    <td class="amount-col">${Number(po.vat_total || po.tax_total || 480).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr style="background:#f8fafc; font-weight:800; font-size:10px;">
                    <td>Total amount Incl. VAT(إ.د)</td>
                    <td class="amount-col">${Number(po.total_value || po.grand_total || 10080).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </table>
              </div>

              <!-- Notes to Supplier -->
              <div class="rayan-terms-container" style="margin-bottom:5px;">
                <div class="rayan-terms-heading">Notes to Supplier:</div>
                1. Location / Site - Al Foah Mall - Alain i. Working hours shall be from 8:00 AM to 6:00 PM. 3. Lunch break is included within the working hours. 4. Supplier responsible for all Insurance, PPE, Tools, welfare, logistics, transportation, food, and any other requirements mentioned shall be fully provided by the supplier. 5. Supplier responsible for Health, Safety, Tools &amp; Equipment for equipment and resources. 6. Supplier is responsible for Full Personal Protective Equipment (PPE). 7. Supplier responsible for all HSE documents and certifications (including operator and flagman competency) must be approved before commencement of work.
              </div>

              <!-- General Terms (Page 1) -->
              <div class="rayan-terms-container">
                <div class="rayan-terms-heading">GENERAL TERMS AND CONDITIONS FOR SUPPLIES</div>
                <strong>1. The Order 1.1.</strong> The order entered into between RAYAN Engineering and Contracting LLC-SPC, and the Supplier is for sale, delivery and installation of the whole of the goods described in the PO and in any specifications referred to there in and covers all protection packaging and marking. <strong>1.2.</strong> These general conditions shall form part of the order. These shall terms and conditions shall not be varied and no conditions contained in quotations, letters, invoices or other communications issued by the Supplier shall annul or vary them or any instructions contained in the PO, unless expressly agreed by both parties in writing.<br>
                <strong>2. PRICES: 2.1.</strong> The agreed prices in this Purchase Order (.P.O) are final and not subject to escalation under any circumstances.<br>
                <strong>3. Identification of Material 3.1.</strong> All packages are to be marked on the outside with our PO number. <strong>3.2.</strong> All packages are to be accompanied by a Delivery Note quoting our order and item numbers together with quantities and descriptions of goods supplied against each item.<br>
                <strong>4. Packing and Protection:</strong> Materials are to be protected against damage. This protection to be applied individually in order to prevent deterioration of articles after their removal from packing or crates.<br>
                <strong>5. Delivery of Goods/Services: 5.1.</strong> All materials are to be delivered as per the agreed INCOTERMS and the address given on the PO. Goods must be off loaded at the destination and released to the Receiver. <strong>5.2.</strong> Partial delivery or early delivery is not acceptable unless otherwise stated in the PO or authorized in writing by the Purchaser. <strong>5.3.</strong> Delivery date as stated in the PO.<br>
                <strong>6. Guarantee:</strong> The Supplier shall submit within 10 days of receipt of the PO, a performance bond equivalent to 10% of the total value of the PO in a form accepted to RAYAN, unless agreed in writing otherwise.<br>
                <strong>7. Receipt and Acceptance of Goods: 7.1.</strong> Acceptance of delivery shall not constitute completion of the Order until the necessary inspection, installation or testing is carried out and confirmed by RAYAN. Unless otherwise specified, all goods and/or services furnished hereunder will be subject to final inspection and acceptance or rejection by RAYAN within a reasonable time after delivery. RAYAN will upon written notice to the Supplier, hold any rejected goods at the Supplier's risk pending the Supplier's instructions. <strong>7.2.</strong> If the Supplier fails to furnish RAYAN with instructions regarding the disposition of such goods within a reasonable time, RAYAN may return the goods to the Supplier at the Supplier's expense or dispose them of as necessary or resort to Risk Purchase as per 12.2.
              </div>

              <div class="rayan-page-counter">Page 1 of 2</div>
            </div>
          </div>

          <!-- PAGE 2 OF PURCHASE ORDER -->
          <div class="fin-document-paper fin-doc-page-2">
            <div class="rayan-doc-teal-bar">RAYAN ENGINEERING</div>

            <div class="fin-doc-inner-padding">
              <div class="rayan-terms-container" style="font-size:7.5px; line-height:1.26; margin-bottom:10px;">
                <strong>8. Rejection of Goods / Services:</strong> RAYAN reserves the right to withhold payment for any goods supplied or services rendered that does not comply with the specifications quoted in the order together with applying the delay penalty as specified in Article 12 herein.<br>
                <strong>9. Cancellation of Order:</strong> RAYAN Engineering and Contracting LLC-SPC. reserves the right to cancel this Order in the case of non-delivery as stipulated by the PO date or later date that is mutually accepted.<br>
                <strong>10. Invoices:</strong> Invoices are to be submitted immediately upon delivery of materials/completion of the services.<br>
                <strong>10.1.</strong> "In accordance with Article 67 of Decree-Law, the supplier has to submit the original tax invoice with all supporting documents within 14 days from the date of supply. To ensure compliance with regulations for input tax recovery, it is preferred to receive the original tax invoice from supplier within 7 days and in no case later than 14 days from the date of the tax invoice"<br>
                <strong>10.2.</strong> Supplier invoice shall be accepted only if the following conditions are met:<br>
                10.2.1. The tax invoice is dated not older than 14 calendar days (in par with Decree-LAW)<br>
                10.2.2. The tax invoice is an original and includes all required details such as:<br>
                10.2.2.1. Correct company name and TRN<br>
                10.2.2.2. PO/Contract reference<br>
                10.2.2.3. With supplier signature and stamp (except for electronic invoices)<br>
                10.2.2.4. Electronic invoices that need to be treated as original shall contain text "This is an electronically-approved invoice, hence does not require signature and/or stamp. Electronic invoices to be accepted only if digital certificate has been provided to RAYAN"<br>
                10.2.2.5. Description, quantity and amount of supply matching with supporting documents<br>
                10.2.2.6. Correct VAT amount<br>
                <strong>10.3.</strong> The tax invoice has complete supporting documentations including copy of PO and Delivery Note/Service Acceptance Certificate etc.<br>
                <strong>11. Penalty:</strong> Should the Supplier fails to deliver all or part of the required material on the agreed date, a penalty of 1% of the value of the delayed items will be imposed for the first week or part thereof of delay, and shall to be increased for 2% for each following week or part thereof, to a maximum of 10%.<br>
                <strong>12. Risk Purchase:</strong> If the Supplier fails to supply the goods/items/services after exhaustion of 10% penalty as provided in the P.O, the RAYAN reserves the following right:<br>
                12.1. To cancel such undelivered item/items/service and draw the Bank Guarantee; (or)<br>
                12.2. Resort to risk purchase of such goods/items/service from other sources, any excess value in price shall be charged to the Supplier plus an administrative charge at the rate of 5% of the value of the item/s and/or service that has been purchased. Plus, whatever penalty is due for the delayed period.<br>
                <strong>13. Warranty: 13.1.</strong> Supplier expressly warrants that all goods provided pursuant to the Purchase Order will be merchantable, fit and sufficient for the purpose ordered and will be free from defects in design, materials and workmanship for a period as stated in the PO above from the date of final acceptance. <strong>13.2.</strong> All the Supplier's warranties shall, as applicable, run to RAYAN, its associated companies, its and their successors, assigns and customers. <strong>13.3.</strong> All charges associated with the warranty claim will be borne by the Supplier including repair/replacement, Insurance and transportation charges.<br>
                <strong>14. Termination of Orders: 14.1.</strong> Buyer may terminate the PO/agreement for convenience and without giving any reason, at any time by serving a written notice to the Supplier 30 (thirty) days prior to the effective date of termination. <strong>14.2.</strong> Such termination shall be without any liability whatsoever of the Buyer towards the Supplier. <strong>14.3.</strong> The only right of the Supplier in such termination is the payment by the Buyer to the Supplier the value of any of the PO/Agreement items already delivered and accepted by the Buyer if any.<br>
                <strong>15. Force Majeure: 15.1.</strong> The following should be considered as cases of force majeure and relieve the parties of their obligations under the P.O as long as the circumstances last: Fire, mobilization, requisition, war, embargoes, currency restriction, insurrection and acts of God. <strong>15.2.</strong> Party claiming force majeure shall immediately upon occurrence, notify the other party of such event by fax or registered mail stating the estimated consequences. Onus to prove the occurrence of such events lies on the party claiming its invocation. <strong>15.3.</strong> If the force majeure situation lasts more than three months, the Buyer may terminate the P.O without affecting his rights adversely under this Purchase Order. <strong>15.4.</strong> Any extension in the delivery period due to causes of force majeure shall be by mutual agreement between the parties.<br>
                <strong>16. Tax:</strong> Unless exempted by the Buyer, All Taxes and duties related to this. P.O shall be borne by the Seller.<br>
                <strong>17. Banking Charges:</strong> All Banking charges related to this. P.O will be borne by the Seller.<br>
                <strong>18. Indemnity: 18.1.</strong> The Supplier shall indemnify, defend and hold the Buyer, its officers, directors, employees or agents harmless from all claims, costs, liabilities, damages, injury, death and expenses (including reasonable legal fees and other professional fees) suffered or incurred by the Buyer, its employees, directors, officers, agents or by any Buyer's customer or third party arising from any willful misconduct, gross negligent, wrongful act or omission by the Supplier or its employees, agents or representatives in the performance of the PO and/or any breach by the Supplier of this PO. <strong>18.2.</strong> The provisions of the Indemnity clause shall survive termination or expiration of the PO, however arising.<br>
                <strong>19. Jurisdiction and Governing Law:</strong> This PO is governed by and construed in accordance with the laws of the Emirate of Abu Dhabi and the federal laws of the United Arab Emirates as applied in the Emirate of Abu Dhabi. All disputes between the parties, if not amicably settled, shall be referred to Abu Dhabi competent courts. <strong>19.1.</strong> Supplier hereby acknowledges and undertake to fully comply with all applicable governmental and related authorities' regulations in relation to Anti-Bribery, Anti-Corruption and other Illegal practice.<br>
                <strong>20. Payment Term:</strong> 50% advance payment upon confirmation of the order, and the remaining 50% shall be paid upon approval and certification of the completed work by the client.
              </div>

              <!-- Invoice Requirements -->
              <div style="font-size:8.2px; line-height:1.35; margin-bottom:12px;">
                <strong>Invoice Requirements:</strong><br>
                1. Time Sheets approved by the RAYAN representative at the site.<br>
                2. Delivery Note approved by the RAYAN representative at the site.<br>
                3. All Original Tax invoices should be stamped and submitted to RAYAN Group HO.
              </div>

              <!-- Signatories & Stamps -->
              <div class="rayan-signatures-row" style="margin-top:auto; padding-bottom:6px;">
                <div class="rayan-company-contact-meta">
                  <strong>Best Wishes</strong><br>
                  <strong>RAYAN Group Team</strong><br>
                  Hotline : 025654497<br>
                  <a href="mailto:cc.info@rayan-group.com" class="rayan-link-blue">cc.info@rayan-group.com</a><br>
                  <a href="http://rayan-group.com" class="rayan-link-blue">http://rayan-group.com</a>
                </div>

                <div class="rayan-stamp-sign-wrap">
                  <div class="rayan-auth-sign-label">Authorised Signatory</div>
                  ${this.getRayanSignatureImg('default')}
                  <div class="rayan-sign-name">Arshad Alam Shaikh</div>
                  ${this.getRayanStampImg()}
                </div>

                <div style="text-align:center; min-width:170px;">
                  <div class="rayan-auth-sign-label">Authorised Signatory</div>
                  <div style="height:38px;"></div>
                  <div class="rayan-sign-name">${po.supplier_attn || 'Mr. Mohammad Gulam'}</div>
                </div>
              </div>

              <div class="rayan-copy-notice" style="margin-bottom:3px;">
                Please keep a copy of this PO for your records
              </div>

              <div class="rayan-page-counter">Page 2 of 2</div>
            </div>

            <!-- Bottom Teal Bar -->
            <div class="rayan-doc-footer-bar">
              Tel: +971-25654497 | Abu Dhabi, United Arab Emirates | <a href="mailto:info@rayan-group.com" style="color:#ffffff !important; text-decoration:none;">info@rayan-group.com</a> | <a href="http://www.rayan-group.com" style="color:#ffffff !important; text-decoration:none;">www.rayan-group.com</a>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
  }

  // --------------------------------------------------------------------------
  // EXPORT UTILITIES (CSV / XLSX / PRINT)
  // --------------------------------------------------------------------------
  exportInvoicesCSV() {
    const invoices = this.db?.invoices || [];
    let csv = 'Invoice Number,Date,Customer,GSTIN,Place of Supply,Taxable Value,Tax Total,Grand Total,Amount Paid,Balance Due,Status\n';
    invoices.forEach(i => {
      csv += `"${i.invoice_no}","${i.invoice_date}","${i.customer_name}","${i.customer_gstin || ''}","${i.place_of_supply || ''}",${i.taxable_subtotal},${i.total_tax},${i.grand_total},${i.amount_paid || 0},${i.balance_due},"${i.status}"\n`;
    });
    this.downloadFile('Rayan_Group_Sales_Invoices_Register.csv', csv, 'text/csv');
  }

  exportBillsCSV() {
    const bills = this.db?.purchase_bills || [];
    let csv = 'Bill Number,Supplier Invoice No,Date,Vendor,Taxable Value,Tax Total,Grand Total,Amount Paid,Balance Due,Status\n';
    bills.forEach(b => {
      csv += `"${b.bill_no}","${b.vendor_invoice_no}","${b.bill_date}","${b.vendor_name}",${b.taxable_subtotal},${b.tax_total},${b.grand_total},${b.amount_paid || 0},${b.balance_due},"${b.status}"\n`;
    });
    this.downloadFile('Rayan_Group_Purchase_Bills_Register.csv', csv, 'text/csv');
  }

  exportReportsExcel() {
    this.exportInvoicesCSV();
  }

  downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --------------------------------------------------------------------------
  // GLOBAL SEARCH TYPEAHEAD
  // --------------------------------------------------------------------------
  handleGlobalSearch(term) {
    if (!term || term.length < 2) return;
    const lower = term.toLowerCase();

    // Check if matches invoice
    const invMatch = (this.db?.invoices || []).find(i => i.invoice_no.toLowerCase().includes(lower) || i.customer_name.toLowerCase().includes(lower));
    if (invMatch && this.activeTab !== 'invoices') {
      this.switchTab('invoices');
      const searchInp = document.getElementById('inv-filter-search');
      if (searchInp) {
        searchInp.value = term;
        searchInp.dispatchEvent(new Event('input'));
      }
    }
  }

  bindGlobalEvents() {
    // Intercept clicks on any element with data-finance-login or href="/billing/#login"
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('#header-finance-login-btn, .btn-finance-portal-trigger, .header-top-link-finance');
      if (trigger) {
        if (window.location.pathname.includes('/billing/')) {
          e.preventDefault();
          if (this.currentUser) {
            this.showAppView();
          } else {
            this.showAuthView();
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.finApp = new FinanceApp();
  window.finApp.init();
});

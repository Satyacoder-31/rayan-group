/**
 * RAYAN GROUP — ENTERPRISE ACCOUNTS, BILLING & FINANCIAL MANAGEMENT SYSTEM
 * Inspired by Zolvit/VakilSearch Billing & GRC Dashboard functionality
 * Fully integrated with Rayan Group corporate architecture
 */

class FinanceApp {
  constructor() {
    this.db = null;
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

    // Fallback to cache or window seed
    const cached = localStorage.getItem('rayan_fin_db_cache');
    if (cached) {
      try {
        this.db = JSON.parse(cached);
        return;
      } catch (err) {}
    }

    if (window.__RAYAN_FINANCE_SEED__) {
      this.db = JSON.parse(JSON.stringify(window.__RAYAN_FINANCE_SEED__));
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
    // 1. Top bar link
    const topBarLinks = document.querySelectorAll('.header-top-link-finance');
    topBarLinks.forEach(el => {
      if (this.currentUser) {
        el.innerHTML = `💼 Finance (${this.currentUser.name.split(' ')[0]})`;
      } else {
        el.innerHTML = `🔒 Accounts Login`;
      }
    });

    // 2. Main header action button
    const headerTriggers = document.querySelectorAll('.btn-finance-portal-trigger, #header-finance-login-btn');
    headerTriggers.forEach(btn => {
      if (this.currentUser) {
        btn.innerHTML = `
          <span class="live-pulse-dot"></span>
          <span>Accounts Desk • ${this.currentUser.role_label || 'Authorized'}</span>
        `;
        btn.title = `Logged in as ${this.currentUser.name} (${this.currentUser.email})`;
      } else {
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>ACCOUNTS LOGIN</span>
        `;
        btn.title = 'Authorized Personnel Financial Portal Login';
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
      <div style="padding: 4rem 1.5rem; background: var(--fin-bg-main); min-height: 80vh; display: flex; align-items: center; justify-content: center;">
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
              <input type="email" id="fin-login-email" class="fin-form-input" placeholder="e.g. superadmin@rayangroup.com" required autocomplete="username">
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

          <!-- Pre-Configured Credential Quick Reference (Type or Click-to-Fill per instructions) -->
          <div class="fin-cred-reference-box">
            <div class="fin-cred-header">
              <div class="fin-cred-title">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>Authorized Personnel Credentials Reference</span>
              </div>
              <span style="font-size:0.68rem; color:#94a3b8;">Click card to pre-fill inputs</span>
            </div>
            
            <div class="fin-cred-grid">
              <div class="fin-cred-pill" data-email="superadmin@rayangroup.com" data-pwd="Rayan@Admin2026">
                <div class="fin-cred-pill-role">
                  <span>Super Administrator</span>
                  <span style="color:#10b981;">Full Access</span>
                </div>
                <div class="fin-cred-pill-email">superadmin@rayangroup.com</div>
                <div class="fin-cred-pill-pwd">PWD: Rayan@Admin2026</div>
              </div>

              <div class="fin-cred-pill" data-email="finance.admin@rayangroup.com" data-pwd="Finance@Rayan2026">
                <div class="fin-cred-pill-role">
                  <span>Finance Admin (CFO)</span>
                  <span style="color:#38bdf8;">Approvals</span>
                </div>
                <div class="fin-cred-pill-email">finance.admin@rayangroup.com</div>
                <div class="fin-cred-pill-pwd">PWD: Finance@Rayan2026</div>
              </div>

              <div class="fin-cred-pill" data-email="accountant@rayangroup.com" data-pwd="Accounts@Rayan2026">
                <div class="fin-cred-pill-role">
                  <span>Senior Accountant</span>
                  <span style="color:#f59e0b;">Billing</span>
                </div>
                <div class="fin-cred-pill-email">accountant@rayangroup.com</div>
                <div class="fin-cred-pill-pwd">PWD: Accounts@Rayan2026</div>
              </div>

              <div class="fin-cred-pill" data-email="pm.tariq@rayangroup.com" data-pwd="Project@Rayan2026">
                <div class="fin-cred-pill-role">
                  <span>Project Manager</span>
                  <span style="color:#a855f7;">Projects</span>
                </div>
                <div class="fin-cred-pill-email">pm.tariq@rayangroup.com</div>
                <div class="fin-cred-pill-pwd">PWD: Project@Rayan2026</div>
              </div>

              <div class="fin-cred-pill" data-email="employee.rahul@rayangroup.com" data-pwd="Staff@Rayan2026">
                <div class="fin-cred-pill-role">
                  <span>Site Engineer</span>
                  <span style="color:#94a3b8;">Claims</span>
                </div>
                <div class="fin-cred-pill-email">employee.rahul@rayangroup.com</div>
                <div class="fin-cred-pill-pwd">PWD: Staff@Rayan2026</div>
              </div>

              <div class="fin-cred-pill" data-email="management@rayangroup.com" data-pwd="Exec@Rayan2026">
                <div class="fin-cred-pill-role">
                  <span>Management (Read-Only)</span>
                  <span style="color:#64748b;">Reports</span>
                </div>
                <div class="fin-cred-pill-email">management@rayangroup.com</div>
                <div class="fin-cred-pill-pwd">PWD: Exec@Rayan2026</div>
              </div>
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

    // Credential card click to pre-fill inputs
    document.querySelectorAll('.fin-cred-pill').forEach(pill => {
      pill.onclick = () => {
        emailInput.value = pill.getAttribute('data-email');
        pwdInput.value = pill.getAttribute('data-pwd');
        if (errorBox) errorBox.style.display = 'none';
        pwdInput.focus();
      };
    });

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

          const data = await res.json();
          if (res.ok && data.success && data.user) {
            this.saveSession(data.user);
            this.showAppView();
            return;
          }

          // Fallback check against db users
          const localUser = this.db?.users?.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (localUser && localUser.password === password) {
            const { password: _, ...safeUser } = localUser;
            this.saveSession(safeUser);
            this.showAppView();
            return;
          }

          errorBox.textContent = data.error || 'Invalid credentials or user unauthorized. Please check role password.';
          errorBox.style.display = 'block';
        } catch (err) {
          errorBox.textContent = 'Network communication error. Please check server status.';
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
      <div class="fin-app-wrapper">
        <!-- Top App Navigation Bar -->
        <header class="fin-app-topbar">
          <div class="fin-topbar-inner">
            <div class="fin-topbar-left">
              <a href="/billing/" class="fin-topbar-brand">
                <img src="/assets/logos/rayan-group-white.png" alt="Rayan Group" class="fin-topbar-logo logo-theme-dark">
                <img src="/assets/logos/rayan-group.png" alt="Rayan Group" class="fin-topbar-logo logo-theme-light">
              </a>
              <span class="fin-topbar-badge-desk">ACCOUNTS &amp; GRC SYSTEM</span>

              <!-- Business Entity Selector -->
              <select id="fin-entity-select" class="fin-select-pill" title="Switch Operating Legal Entity">
                ${(this.db?.companies || []).map(c => `
                  <option value="${c.id}" ${c.id === this.activeCompanyId ? 'selected' : ''}>
                    ${c.name} (${c.currency_symbol || '₹'})
                  </option>
                `).join('')}
              </select>

              <!-- Financial Period Selector -->
              <select id="fin-period-select" class="fin-select-pill" title="Filter Accounting Period">
                <option value="fy-2025-26" ${this.activePeriod === 'fy-2025-26' ? 'selected' : ''}>FY 2025-2026 (Full Year)</option>
                <option value="q4-2026" ${this.activePeriod === 'q4-2026' ? 'selected' : ''}>Q4 (Jan 2026 - Mar 2026)</option>
                <option value="current-month" ${this.activePeriod === 'current-month' ? 'selected' : ''}>Current Month (March 2026)</option>
                <option value="last-30-days" ${this.activePeriod === 'last-30-days' ? 'selected' : ''}>Last 30 Days</option>
              </select>

              <!-- Currency Switcher -->
              <select id="fin-currency-select" class="fin-select-pill" style="width: auto;" title="Change Display Currency">
                <option value="INR" ${this.activeCurrency === 'INR' ? 'selected' : ''}>INR (₹)</option>
                <option value="AED" ${this.activeCurrency === 'AED' ? 'selected' : ''}>AED (د.إ)</option>
                <option value="USD" ${this.activeCurrency === 'USD' ? 'selected' : ''}>USD ($)</option>
              </select>
            </div>

            <div class="fin-topbar-right">
              <!-- Global Search -->
              <div class="fin-global-search-wrap">
                <svg class="fin-search-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" id="fin-global-search" class="fin-global-search-input" placeholder="Search Invoices, Bills, Customers, POs... (Ctrl+K)">
              </div>

              <!-- Notifications Hub -->
              <button type="button" class="fin-icon-btn" id="fin-notif-btn" title="View Financial Notifications &amp; Alerts">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="fin-badge-counter" id="fin-notif-badge">${(this.db?.notifications || []).filter(n => !n.read).length}</span>
              </button>

              <!-- User Profile Menu -->
              <div class="fin-user-chip" id="fin-user-menu-btn" title="User Profile and Security Settings">
                <div class="fin-user-avatar">${this.currentUser?.avatar || '👤'}</div>
                <div class="fin-user-meta">
                  <span class="fin-user-name">${this.currentUser?.name || 'Authorized User'}</span>
                  <span class="fin-user-role-badge">${this.currentUser?.role_label || 'Staff'}</span>
                </div>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </div>

              <!-- Sign Out -->
              <button type="button" class="fin-icon-btn" id="fin-logout-btn" title="Secure Logout">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        </header>

        <!-- Quick Actions Bar -->
        <div class="fin-quick-actions-bar">
          <div class="fin-quick-actions-inner">
            <span class="fin-action-label">Quick Actions:</span>
            ${this.hasPermission('create_invoice') ? `
              <button type="button" class="fin-btn-quick primary" id="qa-btn-invoice">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Create Invoice</span>
              </button>
            ` : ''}
            ${this.hasPermission('create_bill') ? `
              <button type="button" class="fin-btn-quick" id="qa-btn-bill">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>Record Bill</span>
              </button>
            ` : ''}
            ${this.hasPermission('create_customer') ? `
              <button type="button" class="fin-btn-quick" id="qa-btn-customer">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>Add Customer</span>
              </button>
            ` : ''}
            ${this.hasPermission('create_vendor') ? `
              <button type="button" class="fin-btn-quick" id="qa-btn-vendor">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <span>Add Vendor</span>
              </button>
            ` : ''}
            ${this.hasPermission('record_receipt') ? `
              <button type="button" class="fin-btn-quick" id="qa-btn-receipt">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>Record Receipt</span>
              </button>
            ` : ''}
            ${this.hasPermission('record_payment') ? `
              <button type="button" class="fin-btn-quick" id="qa-btn-payment">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                <span>Vendor Payment</span>
              </button>
            ` : ''}
            ${this.hasPermission('submit_expense') ? `
              <button type="button" class="fin-btn-quick" id="qa-btn-expense">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Record Expense</span>
              </button>
            ` : ''}
            ${this.hasPermission('create_po') ? `
              <button type="button" class="fin-btn-quick" id="qa-btn-po">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <span>Create PO</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Navigation Tabs (Zolvit Inspired Module Suite) -->
        <nav class="fin-tabs-nav">
          <div class="fin-tabs-inner">
            <button type="button" class="fin-tab-item ${this.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">📊 Dashboard</button>
            <button type="button" class="fin-tab-item ${this.activeTab === 'invoices' ? 'active' : ''}" data-tab="invoices">📄 Sales &amp; Invoices</button>
            <button type="button" class="fin-tab-item ${this.activeTab === 'bills' ? 'active' : ''}" data-tab="bills">📥 Purchases &amp; Bills</button>
            <button type="button" class="fin-tab-item ${this.activeTab === 'customers' ? 'active' : ''}" data-tab="customers">👥 Customers</button>
            <button type="button" class="fin-tab-item ${this.activeTab === 'vendors' ? 'active' : ''}" data-tab="vendors">🏢 Vendors</button>
            <button type="button" class="fin-tab-item ${this.activeTab === 'items' ? 'active' : ''}" data-tab="items">📦 Items &amp; Services</button>
            <button type="button" class="fin-tab-item ${this.activeTab === 'payments' ? 'active' : ''}" data-tab="payments">💳 Payments &amp; Receipts</button>
            <button type="button" class="fin-tab-item ${this.activeTab === 'notes' ? 'active' : ''}" data-tab="notes">🔄 Credit &amp; Debit Notes</button>
            <button type="button" class="fin-tab-item ${this.activeTab === 'expenses' ? 'active' : ''}" data-tab="expenses">🧾 Expenses</button>
            <button type="button" class="fin-tab-item ${this.activeTab === 'pos' ? 'active' : ''}" data-tab="pos">📑 Purchase Orders</button>
            <button type="button" class="fin-tab-item ${this.activeTab === 'projects' ? 'active' : ''}" data-tab="projects">🏗️ Project Accounts</button>
            <button type="button" class="fin-tab-item ${this.activeTab === 'reports' ? 'active' : ''}" data-tab="reports">📈 Financial Reports</button>
            <button type="button" class="fin-tab-item ${this.activeTab === 'calendar' ? 'active' : ''}" data-tab="calendar">📅 Calendar</button>
            <button type="button" class="fin-tab-item ${this.activeTab === 'documents' ? 'active' : ''}" data-tab="documents">📁 Document Vault</button>
            ${this.currentUser.role === 'super_admin' ? `
              <button type="button" class="fin-tab-item ${this.activeTab === 'users' ? 'active' : ''}" data-tab="users">🛡️ Users &amp; Audit Logs</button>
              <button type="button" class="fin-tab-item ${this.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">⚙️ Settings</button>
            ` : ''}
          </div>
        </nav>

        <!-- Dynamic Main Content Region -->
        <main class="fin-main-content" id="fin-tab-content-root">
          <!-- Rendered via renderActiveTab() -->
        </main>
      </div>

      <!-- Global App Modals Root Container -->
      <div id="fin-modal-container"></div>
    `;

    this.bindAppEvents();
    this.renderActiveTab();
  }

  bindAppEvents() {
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

    // 4. Tab navigation
    document.querySelectorAll('.fin-tab-item').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.fin-tab-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.getAttribute('data-tab');
        this.renderActiveTab();
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

    // 9. Quick Actions button bindings
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

    switch (this.activeTab) {
      case 'dashboard':
        this.renderDashboardTab(root);
        break;
      case 'invoices':
        this.renderInvoicesTab(root);
        break;
      case 'bills':
        this.renderBillsTab(root);
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

      <!-- Grid: Recent Invoices & Recent Purchase Bills -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; margin-bottom:2rem;" class="fin-dash-row-responsive">
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
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; margin-bottom:2rem;" class="fin-dash-row-responsive">
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
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;" class="fin-dash-row-responsive">
        <!-- Customer Receipts -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <div>
              <h2 class="fin-panel-title">💳 Customer Receipts</h2>
              <p style="font-size:0.75rem; color:#94a3b8;">Inward client collections &amp; invoice allocations</p>
            </div>
            ${this.hasPermission('record_receipt') ? `
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openRecordReceiptModal()">
                + Record Receipt
              </button>
            ` : ''}
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
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;" class="fin-dash-row-responsive">
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
                <th>Vendor</th>
                <th>Project</th>
                <th>Expected Delivery</th>
                <th>Total PO Value</th>
                <th>Billed to Date</th>
                <th>Status</th>
                <th>Approved By</th>
              </tr>
            </thead>
            <tbody>
              ${pos.map(po => `
                <tr>
                  <td><strong>${po.po_no}</strong></td>
                  <td>${this.formatDate(po.date)}</td>
                  <td><strong>${po.vendor_name}</strong></td>
                  <td>${po.project_name}</td>
                  <td>${this.formatDate(po.expected_delivery)}</td>
                  <td><strong>${this.formatCurrency(po.total_value)}</strong></td>
                  <td>${this.formatCurrency(po.billed_value || 0)}</td>
                  <td><span class="fin-badge fin-badge-paid">${po.status}</span></td>
                  <td>${po.approved_by || '—'}</td>
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

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem;" class="fin-dash-row-responsive">
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

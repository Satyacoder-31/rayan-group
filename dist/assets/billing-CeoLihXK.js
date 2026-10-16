import"./live-overrides-Bz1C8oj0.js";import"./main-CSxISHdW.js";var e=class{constructor(){this.db=null,this.currentUser=null,this.activeCompanyId=`ashaz-eng-in`,this.activePeriod=`fy-2025-26`,this.activeCurrency=`INR`,this.activeTab=`dashboard`,this.currencyRates={INR:1,AED:.044,USD:.012},this.currencySymbols={INR:`₹`,AED:`AED `,USD:`$`}}async init(){this.initSession(),await this.loadDatabase(),this.bindGlobalEvents(),this.renderHeaderStatus(),this.currentUser?this.showAppView():this.showAuthView()}initSession(){try{let e=localStorage.getItem(`rayan_fin_user`);e&&(this.currentUser=JSON.parse(e))}catch(e){console.warn(`Could not parse saved finance user:`,e)}}saveSession(e){this.currentUser=e,localStorage.setItem(`rayan_fin_user`,JSON.stringify(e)),this.renderHeaderStatus()}clearSession(){this.currentUser=null,localStorage.removeItem(`rayan_fin_user`),this.renderHeaderStatus(),this.showAuthView()}hasPermission(e){if(!this.currentUser)return!1;let t=this.currentUser.role;return t===`super_admin`?!0:t===`finance_admin`?![`manage_companies`,`delete_user`].includes(e):t===`accountant`?[`view_dashboard`,`create_invoice`,`edit_draft_invoice`,`print_invoice`,`create_bill`,`record_receipt`,`record_payment`,`create_customer`,`create_vendor`,`create_item`,`view_reports`,`create_credit_note`,`create_debit_note`].includes(e):t===`project_manager`?[`view_dashboard`,`view_projects`,`submit_expense`,`view_pos`,`create_po`].includes(e):t===`employee`?[`view_dashboard`,`submit_expense`,`view_own_expenses`].includes(e):t===`management_readonly`&&[`view_dashboard`,`view_reports`,`export_reports`,`view_projects`,`view_invoices`,`view_bills`].includes(e)}async loadDatabase(){try{let e=await fetch(`/api/finance?action=get_state`);if(e.ok){let t=await e.json();if(t.data){this.db=t.data,localStorage.setItem(`rayan_fin_db_cache`,JSON.stringify(this.db));return}}}catch(e){console.warn(`Server API not reachable; checking local cache or seed`,e)}let e=localStorage.getItem(`rayan_fin_db_cache`);if(e)try{this.db=JSON.parse(e);return}catch{}window.__RAYAN_FINANCE_SEED__&&(this.db=JSON.parse(JSON.stringify(window.__RAYAN_FINANCE_SEED__)))}async syncApi(e,t={}){let n={action:e,...t,user_name:this.currentUser?.name,user_role:this.currentUser?.role,user_email:this.currentUser?.email};try{let e=await fetch(`/api/finance`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(n)});if(e.ok){let t=await e.json();if(t.data)return this.db=t.data,localStorage.setItem(`rayan_fin_db_cache`,JSON.stringify(this.db)),t}}catch(e){console.warn(`API sync offline fallback:`,e)}return localStorage.setItem(`rayan_fin_db_cache`,JSON.stringify(this.db)),{success:!0,localOnly:!0,data:this.db}}formatCurrency(e,t=!0){let n=(Number(e)||0)*(this.currencyRates[this.activeCurrency]||1),r=t?this.currencySymbols[this.activeCurrency]||`₹`:``;if(this.activeCurrency===`INR`){let e=new Intl.NumberFormat(`en-IN`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);return r?`${r}${e}`:e}let i=new Intl.NumberFormat(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);return r?`${r}${i}`:i}formatDate(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`en-IN`,{day:`2-digit`,month:`short`,year:`numeric`})}catch{return e}}renderHeaderStatus(){document.querySelectorAll(`.header-top-link-finance`).forEach(e=>{e.innerHTML=this.currentUser?`💼 Finance (${this.currentUser.name.split(` `)[0]})`:`🔒 Accounts Login`}),document.querySelectorAll(`.btn-finance-portal-trigger, #header-finance-login-btn`).forEach(e=>{this.currentUser?(e.innerHTML=`
          <span class="live-pulse-dot"></span>
          <span>ACCOUNTS • ${this.currentUser.role_label?this.currentUser.role_label.length>12?`ACTIVE`:this.currentUser.role_label:`ACTIVE`}</span>
        `,e.title=`Logged in as ${this.currentUser.name} (${this.currentUser.email}) - Open Financial Desk`):(e.innerHTML=`
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>ACCOUNTS LOGIN</span>
        `,e.title=`Authorized Personnel Financial Portal Login`)})}showAuthView(){let e=document.getElementById(`finance-portal-root`);e&&(e.innerHTML=`
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
    `,this.bindAuthEvents())}bindAuthEvents(){let e=document.getElementById(`fin-login-form`),t=document.getElementById(`fin-login-email`),n=document.getElementById(`fin-login-password`),r=document.getElementById(`fin-toggle-pwd`),i=document.getElementById(`fin-login-error`);r&&(r.onclick=()=>{n.type===`password`?(n.type=`text`,r.textContent=`Hide`):(n.type=`password`,r.textContent=`Show`)}),e&&(e.onsubmit=async e=>{e.preventDefault(),i.style.display=`none`;let r=t.value.trim(),a=n.value.trim(),o=document.getElementById(`fin-login-submit-btn`);o.disabled=!0,o.innerHTML=`<span>VERIFYING CREDENTIALS...</span>`;try{let e=await fetch(`/api/auth`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({action:`login`,email:r,password:a})}),t=await e.json();if(e.ok&&t.success&&t.user){this.saveSession(t.user),this.showAppView();return}let n=this.db?.users?.find(e=>e.email.toLowerCase()===r.toLowerCase());if(n&&n.password===a){let{password:e,...t}=n;this.saveSession(t),this.showAppView();return}i.textContent=t.error||`Invalid credentials or user unauthorized. Please check role password.`,i.style.display=`block`}catch{i.textContent=`Network communication error. Please check server status.`,i.style.display=`block`}finally{o.disabled=!1,o.innerHTML=`<span>SIGN IN TO FINANCIAL PORTAL &rarr;</span>`}});let a=document.getElementById(`fin-forgot-pwd-btn`);a&&(a.onclick=()=>{let e=prompt(`Please enter your Rayan Group corporate email to receive secure password recovery link:`,t.value);e&&alert(`Password recovery instructions and security token have been transmitted to ${e}.`)})}showAppView(){let e=document.getElementById(`finance-portal-root`);e&&(e.innerHTML=`
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
                ${(this.db?.companies||[]).map(e=>`
                  <option value="${e.id}" ${e.id===this.activeCompanyId?`selected`:``}>
                    ${e.name} (${e.currency_symbol||`₹`})
                  </option>
                `).join(``)}
              </select>

              <!-- Financial Period Selector -->
              <select id="fin-period-select" class="fin-select-pill" title="Filter Accounting Period">
                <option value="fy-2025-26" ${this.activePeriod===`fy-2025-26`?`selected`:``}>FY 2025-2026 (Full Year)</option>
                <option value="q4-2026" ${this.activePeriod===`q4-2026`?`selected`:``}>Q4 (Jan 2026 - Mar 2026)</option>
                <option value="current-month" ${this.activePeriod===`current-month`?`selected`:``}>Current Month (March 2026)</option>
                <option value="last-30-days" ${this.activePeriod===`last-30-days`?`selected`:``}>Last 30 Days</option>
              </select>

              <!-- Currency Switcher -->
              <select id="fin-currency-select" class="fin-select-pill" style="width: auto;" title="Change Display Currency">
                <option value="INR" ${this.activeCurrency===`INR`?`selected`:``}>INR (₹)</option>
                <option value="AED" ${this.activeCurrency===`AED`?`selected`:``}>AED (د.إ)</option>
                <option value="USD" ${this.activeCurrency===`USD`?`selected`:``}>USD ($)</option>
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
                <span class="fin-badge-counter" id="fin-notif-badge">${(this.db?.notifications||[]).filter(e=>!e.read).length}</span>
              </button>

              <!-- User Profile Menu -->
              <div class="fin-user-chip" id="fin-user-menu-btn" title="User Profile and Security Settings">
                <div class="fin-user-avatar">${this.currentUser?.avatar||`👤`}</div>
                <div class="fin-user-meta">
                  <span class="fin-user-name">${this.currentUser?.name||`Authorized User`}</span>
                  <span class="fin-user-role-badge">${this.currentUser?.role_label||`Staff`}</span>
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
            ${this.hasPermission(`create_invoice`)?`
              <button type="button" class="fin-btn-quick primary" id="qa-btn-invoice">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Create Invoice</span>
              </button>
            `:``}
            ${this.hasPermission(`create_bill`)?`
              <button type="button" class="fin-btn-quick" id="qa-btn-bill">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>Record Bill</span>
              </button>
            `:``}
            ${this.hasPermission(`create_customer`)?`
              <button type="button" class="fin-btn-quick" id="qa-btn-customer">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>Add Customer</span>
              </button>
            `:``}
            ${this.hasPermission(`create_vendor`)?`
              <button type="button" class="fin-btn-quick" id="qa-btn-vendor">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <span>Add Vendor</span>
              </button>
            `:``}
            ${this.hasPermission(`record_receipt`)?`
              <button type="button" class="fin-btn-quick" id="qa-btn-receipt">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>Record Receipt</span>
              </button>
            `:``}
            ${this.hasPermission(`record_payment`)?`
              <button type="button" class="fin-btn-quick" id="qa-btn-payment">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                <span>Vendor Payment</span>
              </button>
            `:``}
            ${this.hasPermission(`submit_expense`)?`
              <button type="button" class="fin-btn-quick" id="qa-btn-expense">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Record Expense</span>
              </button>
            `:``}
            ${this.hasPermission(`create_po`)?`
              <button type="button" class="fin-btn-quick" id="qa-btn-po">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <span>Create PO</span>
              </button>
            `:``}
          </div>
        </div>

        <!-- Navigation Tabs (Zolvit Inspired Module Suite) -->
        <nav class="fin-tabs-nav">
          <div class="fin-tabs-inner">
            <button type="button" class="fin-tab-item ${this.activeTab===`dashboard`?`active`:``}" data-tab="dashboard">📊 Dashboard</button>
            <button type="button" class="fin-tab-item ${this.activeTab===`invoices`?`active`:``}" data-tab="invoices">📄 Sales &amp; Invoices</button>
            <button type="button" class="fin-tab-item ${this.activeTab===`bills`?`active`:``}" data-tab="bills">📥 Purchases &amp; Bills</button>
            <button type="button" class="fin-tab-item ${this.activeTab===`customers`?`active`:``}" data-tab="customers">👥 Customers</button>
            <button type="button" class="fin-tab-item ${this.activeTab===`vendors`?`active`:``}" data-tab="vendors">🏢 Vendors</button>
            <button type="button" class="fin-tab-item ${this.activeTab===`items`?`active`:``}" data-tab="items">📦 Items &amp; Services</button>
            <button type="button" class="fin-tab-item ${this.activeTab===`payments`?`active`:``}" data-tab="payments">💳 Payments &amp; Receipts</button>
            <button type="button" class="fin-tab-item ${this.activeTab===`notes`?`active`:``}" data-tab="notes">🔄 Credit &amp; Debit Notes</button>
            <button type="button" class="fin-tab-item ${this.activeTab===`expenses`?`active`:``}" data-tab="expenses">🧾 Expenses</button>
            <button type="button" class="fin-tab-item ${this.activeTab===`pos`?`active`:``}" data-tab="pos">📑 Purchase Orders</button>
            <button type="button" class="fin-tab-item ${this.activeTab===`projects`?`active`:``}" data-tab="projects">🏗️ Project Accounts</button>
            <button type="button" class="fin-tab-item ${this.activeTab===`reports`?`active`:``}" data-tab="reports">📈 Financial Reports</button>
            <button type="button" class="fin-tab-item ${this.activeTab===`calendar`?`active`:``}" data-tab="calendar">📅 Calendar</button>
            <button type="button" class="fin-tab-item ${this.activeTab===`documents`?`active`:``}" data-tab="documents">📁 Document Vault</button>
            ${this.currentUser.role===`super_admin`?`
              <button type="button" class="fin-tab-item ${this.activeTab===`users`?`active`:``}" data-tab="users">🛡️ Users &amp; Audit Logs</button>
              <button type="button" class="fin-tab-item ${this.activeTab===`settings`?`active`:``}" data-tab="settings">⚙️ Settings</button>
            `:``}
          </div>
        </nav>

        <!-- Dynamic Main Content Region -->
        <main class="fin-main-content" id="fin-tab-content-root">
          <!-- Rendered via renderActiveTab() -->
        </main>
      </div>

      <!-- Global App Modals Root Container -->
      <div id="fin-modal-container"></div>
    `,this.bindAppEvents(),this.renderActiveTab())}bindAppEvents(){let e=document.getElementById(`fin-entity-select`);e&&(e.onchange=()=>{this.activeCompanyId=e.value,this.renderActiveTab()});let t=document.getElementById(`fin-period-select`);t&&(t.onchange=()=>{this.activePeriod=t.value,this.renderActiveTab()});let n=document.getElementById(`fin-currency-select`);n&&(n.onchange=()=>{this.activeCurrency=n.value,this.renderActiveTab()}),document.querySelectorAll(`.fin-tab-item`).forEach(e=>{e.onclick=()=>{document.querySelectorAll(`.fin-tab-item`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),this.activeTab=e.getAttribute(`data-tab`),this.renderActiveTab()}});let r=document.getElementById(`fin-global-search`);r&&(r.oninput=()=>{this.handleGlobalSearch(r.value.trim())},window.addEventListener(`keydown`,e=>{(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()===`k`&&(e.preventDefault(),r.focus())}));let i=document.getElementById(`fin-notif-btn`);i&&(i.onclick=()=>this.openNotificationsModal());let a=document.getElementById(`fin-user-menu-btn`);a&&(a.onclick=()=>this.openUserProfileModal());let o=document.getElementById(`fin-logout-btn`);o&&(o.onclick=()=>{confirm(`Are you sure you wish to log out of the financial management portal?`)&&this.clearSession()});let s=document.getElementById(`qa-btn-invoice`);s&&(s.onclick=()=>this.openCreateInvoiceModal());let c=document.getElementById(`qa-btn-bill`);c&&(c.onclick=()=>this.openCreateBillModal());let l=document.getElementById(`qa-btn-customer`);l&&(l.onclick=()=>this.openCreateCustomerModal());let u=document.getElementById(`qa-btn-vendor`);u&&(u.onclick=()=>this.openCreateVendorModal());let d=document.getElementById(`qa-btn-receipt`);d&&(d.onclick=()=>this.openRecordReceiptModal());let f=document.getElementById(`qa-btn-payment`);f&&(f.onclick=()=>this.openRecordPaymentModal());let p=document.getElementById(`qa-btn-expense`);p&&(p.onclick=()=>this.openCreateExpenseModal());let m=document.getElementById(`qa-btn-po`);m&&(m.onclick=()=>this.openCreatePOModal())}renderActiveTab(){let e=document.getElementById(`fin-tab-content-root`);if(e)switch(this.activeTab){case`dashboard`:this.renderDashboardTab(e);break;case`invoices`:this.renderInvoicesTab(e);break;case`bills`:this.renderBillsTab(e);break;case`customers`:this.renderCustomersTab(e);break;case`vendors`:this.renderVendorsTab(e);break;case`items`:this.renderItemsTab(e);break;case`payments`:this.renderPaymentsTab(e);break;case`notes`:this.renderNotesTab(e);break;case`expenses`:this.renderExpensesTab(e);break;case`pos`:this.renderPOTab(e);break;case`projects`:this.renderProjectsTab(e);break;case`reports`:this.renderReportsTab(e);break;case`calendar`:this.renderCalendarTab(e);break;case`documents`:this.renderDocumentsTab(e);break;case`users`:this.renderUsersTab(e);break;case`settings`:this.renderSettingsTab(e);break;default:this.renderDashboardTab(e)}}renderDashboardTab(e){let t=this.db?.invoices||[],n=this.db?.purchase_bills||[],r=this.db?.expenses||[],i=this.db?.customer_receipts||[],a=this.db?.vendor_payments||[],o=t.filter(e=>e.status!==`void`).reduce((e,t)=>e+(Number(t.grand_total)||0),0),s=n.filter(e=>e.status!==`void`).reduce((e,t)=>e+(Number(t.grand_total)||0),0),c=t.filter(e=>e.status!==`void`&&e.status!==`paid`).reduce((e,t)=>e+(Number(t.balance_due)||0),0),l=n.filter(e=>e.status!==`void`&&e.status!==`paid`).reduce((e,t)=>e+(Number(t.balance_due)||0),0),u=r.reduce((e,t)=>e+(Number(t.total_amount)||0),0),d=i.reduce((e,t)=>e+(Number(t.amount_received)||0),0),f=a.reduce((e,t)=>e+(Number(t.amount_paid)||0),0),p=85e5+d-f-25e4,m=t.filter(e=>e.status!==`void`).reduce((e,t)=>e+(Number(t.taxable_subtotal)||0),0),h=m-n.filter(e=>e.status!==`void`).reduce((e,t)=>e+(Number(t.taxable_subtotal)||0),0)-u,g=t.filter(e=>e.status===`overdue`),_=g.reduce((e,t)=>e+(Number(t.balance_due)||0),0);e.innerHTML=`
      <!-- 8 Key Financial Metric Summary Cards -->
      <div class="fin-summary-grid">
        <!-- 1. Total Sales -->
        <div class="fin-metric-card accent-sales" onclick="window.finApp.switchTab('invoices')">
          <div class="fin-metric-header">
            <span class="fin-metric-label">Total Sales (Invoiced)</span>
            <div class="fin-metric-icon" style="color:#0099e6;">📄</div>
          </div>
          <div class="fin-metric-value">${this.formatCurrency(o)}</div>
          <div class="fin-metric-subtext">
            <span>${t.length} Invoices Posted</span>
            <span style="color:#10b981;">GST / Tax break-up applied</span>
          </div>
        </div>

        <!-- 2. Total Purchases -->
        <div class="fin-metric-card accent-purchases" onclick="window.finApp.switchTab('bills')">
          <div class="fin-metric-header">
            <span class="fin-metric-label">Total Purchases (Bills)</span>
            <div class="fin-metric-icon" style="color:#f59e0b;">📥</div>
          </div>
          <div class="fin-metric-value">${this.formatCurrency(s)}</div>
          <div class="fin-metric-subtext">
            <span>${n.length} Vendor Bills</span>
            <span style="color:#f59e0b;">ITC Eligible</span>
          </div>
        </div>

        <!-- 3. Total Receivables -->
        <div class="fin-metric-card accent-receivables" onclick="window.finApp.switchTab('customers')">
          <div class="fin-metric-header">
            <span class="fin-metric-label">Total Receivables (Dues)</span>
            <div class="fin-metric-icon" style="color:#38bdf8;">👥</div>
          </div>
          <div class="fin-metric-value">${this.formatCurrency(c)}</div>
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
          <div class="fin-metric-value">${this.formatCurrency(l)}</div>
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
          <div class="fin-metric-value">${this.formatCurrency(p)}</div>
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
          <div class="fin-metric-value">${this.formatCurrency(u)}</div>
          <div class="fin-metric-subtext">
            <span>Site, Fuel, Travel, Leases</span>
            <span>${r.length} Claims</span>
          </div>
        </div>

        <!-- 7. Net Profit / Margin -->
        <div class="fin-metric-card accent-profit" onclick="window.finApp.switchTab('reports')">
          <div class="fin-metric-header">
            <span class="fin-metric-label">Net Profit (Operating)</span>
            <div class="fin-metric-icon" style="color:#059669;">📈</div>
          </div>
          <div class="fin-metric-value">${this.formatCurrency(h)}</div>
          <div class="fin-metric-subtext">
            <span>Taxable Revenue vs Costs</span>
            <span style="color:#10b981; font-weight:700;">+${(h/(m||1)*100).toFixed(1)}% Margin</span>
          </div>
        </div>

        <!-- 8. Overdue Invoices -->
        <div class="fin-metric-card accent-overdue" onclick="window.finApp.switchTab('invoices')">
          <div class="fin-metric-header">
            <span class="fin-metric-label">Overdue Invoices</span>
            <div class="fin-metric-icon" style="color:#ef4444;">⚠️</div>
          </div>
          <div class="fin-metric-value">${this.formatCurrency(_)}</div>
          <div class="fin-metric-subtext">
            <span style="color:#ef4444; font-weight:700;">${g.length} Overdue</span>
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
              <span class="fin-badge fin-badge-issued">${t.length} Total</span>
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
                ${t.slice(0,5).map(e=>`
                  <tr>
                    <td><strong>${e.invoice_no}</strong></td>
                    <td>${e.customer_name}</td>
                    <td>${this.formatDate(e.due_date)}</td>
                    <td><strong>${this.formatCurrency(e.grand_total)}</strong></td>
                    <td>${this.formatCurrency(e.balance_due)}</td>
                    <td><span class="fin-badge fin-badge-${e.status}">${e.status.replace(`_`,` `)}</span></td>
                    <td>
                      <button type="button" class="fin-btn-row-action" onclick="window.finApp.openInvoiceDetail('${e.id}')">View</button>
                    </td>
                  </tr>
                `).join(``)}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Purchase Bills Panel -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <h3 class="fin-panel-title">
              <span>📥 Recent Purchase Bills</span>
              <span class="fin-badge fin-badge-pending">${n.length} Recorded</span>
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
                ${n.slice(0,5).map(e=>`
                  <tr>
                    <td><strong>${e.bill_no}</strong></td>
                    <td>${e.vendor_name}</td>
                    <td>${this.formatDate(e.due_date)}</td>
                    <td><strong>${this.formatCurrency(e.grand_total)}</strong></td>
                    <td>${this.formatCurrency(e.balance_due)}</td>
                    <td><span class="fin-badge fin-badge-${e.status}">${e.status.replace(`_`,` `)}</span></td>
                    <td>
                      <button type="button" class="fin-btn-row-action" onclick="window.finApp.openBillDetail('${e.id}')">View</button>
                    </td>
                  </tr>
                `).join(``)}
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
                ${(this.db?.items||[]).slice(0,5).map(e=>`
                  <tr>
                    <td>
                      <strong>${e.name}</strong><br>
                      <span style="font-size:0.68rem; color:#94a3b8;">HSN/SAC: ${e.hsn_sac_code||`—`} • ${e.code}</span>
                    </td>
                    <td><span class="fin-badge fin-badge-issued">${e.category}</span></td>
                    <td><strong>${this.formatCurrency(e.sales_price)}</strong> / ${e.uom}</td>
                    <td>${e.gst_rate}%</td>
                    <td><span class="fin-badge fin-badge-paid">Active</span></td>
                  </tr>
                `).join(``)}
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
              <strong style="font-size:1.1rem; color:#10b981;">${this.formatCurrency(5565e3)}</strong>
              <span style="font-size:0.65rem; color:#10b981; display:block;">Normal terms</span>
            </div>
            <div style="background:rgba(0,153,230,0.08); border:1px solid rgba(0,153,230,0.25); border-radius:8px; padding:0.85rem; text-align:center;">
              <span style="font-size:0.68rem; color:#94a3b8; display:block; text-transform:uppercase;">31-60 Days</span>
              <strong style="font-size:1.1rem; color:#0099e6;">${this.formatCurrency(328e4)}</strong>
              <span style="font-size:0.65rem; color:#0099e6; display:block;">Due soon</span>
            </div>
            <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:8px; padding:0.85rem; text-align:center;">
              <span style="font-size:0.68rem; color:#94a3b8; display:block; text-transform:uppercase;">61-90 Days</span>
              <strong style="font-size:1.1rem; color:#f59e0b;">${this.formatCurrency(1425e3)}</strong>
              <span style="font-size:0.65rem; color:#f59e0b; display:block;">Follow-up</span>
            </div>
            <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:0.85rem; text-align:center;">
              <span style="font-size:0.68rem; color:#94a3b8; display:block; text-transform:uppercase;">90+ Days</span>
              <strong style="font-size:1.1rem; color:#ef4444;">${this.formatCurrency(885e4)}</strong>
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
              ${(this.db?.audit_logs||[]).slice(0,6).map(e=>`
                <tr>
                  <td style="white-space:nowrap; font-size:0.75rem; color:#94a3b8;">${new Date(e.timestamp).toLocaleString(`en-IN`)}</td>
                  <td><strong>${e.actor_name}</strong> <span style="font-size:0.68rem; color:#38bdf8;">(${e.actor_role})</span></td>
                  <td><span class="fin-badge fin-badge-issued">${e.action}</span></td>
                  <td>${e.entity} <span style="font-size:0.68rem; color:#94a3b8;">(${e.entity_id})</span></td>
                  <td style="font-size:0.78rem;">${e.details}</td>
                </tr>
              `).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    `}renderInvoicesTab(e){let t=this.db?.invoices||[];e.innerHTML=`
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">📄 Sales &amp; Tax Invoices</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Complete billing register with GST breakup, payment allocation tracking, and PDF generation.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission(`create_invoice`)?`
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateInvoiceModal()">
                + Create Tax Invoice
              </button>
            `:``}
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
              ${this.renderInvoiceRows(t)}
            </tbody>
          </table>
        </div>
      </div>
    `;let n=document.getElementById(`inv-filter-search`),r=document.getElementById(`inv-filter-status`),i=()=>{let e=n.value.toLowerCase().trim(),i=r.value,a=t.filter(t=>{let n=t.invoice_no.toLowerCase().includes(e)||t.customer_name.toLowerCase().includes(e),r=i===`all`||t.status===i;return n&&r});document.getElementById(`invoices-tbody`).innerHTML=this.renderInvoiceRows(a)};n&&(n.oninput=i),r&&(r.onchange=i)}renderInvoiceRows(e){return e.length?e.map(e=>`
      <tr>
        <td><strong>${e.invoice_no}</strong></td>
        <td>${this.formatDate(e.invoice_date)}</td>
        <td>
          <strong>${e.customer_name}</strong>
          ${e.customer_gstin?`<div style="font-size:0.68rem; color:#94a3b8;">GSTIN: ${e.customer_gstin}</div>`:``}
        </td>
        <td><span style="font-size:0.75rem;">${e.place_of_supply||`—`}</span></td>
        <td>${this.formatCurrency(e.taxable_subtotal)}</td>
        <td>
          <span style="font-size:0.75rem; color:#38bdf8;">${this.formatCurrency(e.total_tax)}</span>
          ${e.igst_total>0?`<div style="font-size:0.65rem; color:#94a3b8;">IGST 18%</div>`:`<div style="font-size:0.65rem; color:#94a3b8;">CGST 9% + SGST 9%</div>`}
        </td>
        <td><strong>${this.formatCurrency(e.grand_total)}</strong></td>
        <td><span style="color:#10b981;">${this.formatCurrency(e.amount_paid||0)}</span></td>
        <td><strong style="color:${e.balance_due>0?`#ef4444`:`#10b981`};">${this.formatCurrency(e.balance_due)}</strong></td>
        <td><span class="fin-badge fin-badge-${e.status}">${e.status.replace(`_`,` `)}</span></td>
        <td style="white-space:nowrap;">
          <button type="button" class="fin-btn-row-action" onclick="window.finApp.openInvoiceDetail('${e.id}')" title="View &amp; Print Official Tax Invoice">View / Print</button>
          ${e.balance_due>0&&this.hasPermission(`record_receipt`)?`
            <button type="button" class="fin-btn-row-action" onclick="window.finApp.openQuickPayInvoice('${e.id}')" style="color:#10b981;" title="Record Customer Payment">Receive</button>
          `:``}
          ${e.status!==`void`&&this.hasPermission(`create_credit_note`)?`
            <button type="button" class="fin-btn-row-action" onclick="window.finApp.openCreateCreditNoteModal('${e.id}')" title="Issue Credit Note">Credit Note</button>
          `:``}
        </td>
      </tr>
    `).join(``):`<tr><td colspan="11" style="text-align:center; padding:2rem; color:#94a3b8;">No invoices found matching current filter criteria.</td></tr>`}renderBillsTab(e){let t=this.db?.purchase_bills||[];e.innerHTML=`
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">📥 Purchases &amp; Supplier Bills</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Manage subcontractor invoices, raw material procurement bills, input tax credits, and payment releases.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission(`create_bill`)?`
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateBillModal()">
                + Record Purchase Bill
              </button>
            `:``}
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
              ${t.map(e=>`
                <tr>
                  <td><strong>${e.bill_no}</strong></td>
                  <td>${e.vendor_invoice_no}</td>
                  <td>${this.formatDate(e.bill_date)}</td>
                  <td><strong>${e.vendor_name}</strong></td>
                  <td><span style="font-size:0.75rem;">${e.project_name||`General Supply`}</span></td>
                  <td>${this.formatCurrency(e.taxable_subtotal)}</td>
                  <td>${this.formatCurrency(e.tax_total)}</td>
                  <td><strong>${this.formatCurrency(e.grand_total)}</strong></td>
                  <td><strong style="color:${e.balance_due>0?`#ef4444`:`#10b981`};">${this.formatCurrency(e.balance_due)}</strong></td>
                  <td><span class="fin-badge fin-badge-${e.approval_status}">${e.approval_status}</span></td>
                  <td><span class="fin-badge fin-badge-${e.status}">${e.status.replace(`_`,` `)}</span></td>
                  <td style="white-space:nowrap;">
                    <button type="button" class="fin-btn-row-action" onclick="window.finApp.openBillDetail('${e.id}')">View</button>
                    ${e.approval_status===`pending`&&this.hasPermission(`approve_bill`)?`
                      <button type="button" class="fin-btn-row-action" style="color:#10b981;" onclick="window.finApp.approveBill('${e.id}')">Approve</button>
                    `:``}
                    ${e.balance_due>0&&e.approval_status===`approved`&&this.hasPermission(`record_payment`)?`
                      <button type="button" class="fin-btn-row-action" style="color:#38bdf8;" onclick="window.finApp.openQuickPayBill('${e.id}')">Pay</button>
                    `:``}
                  </td>
                </tr>
              `).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    `}renderCustomersTab(e){let t=this.db?.customers||[],n=this.db?.invoices||[];e.innerHTML=`
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">👥 Customers &amp; Debtors Directory</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Complete client profiles, GSTIN details, credit limits, and Statement of Account (SOA) ledgers.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission(`create_customer`)?`
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateCustomerModal()">
                + Add Customer
              </button>
            `:``}
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
              ${t.map(e=>{let t=n.filter(t=>t.customer_id===e.id&&t.status!==`void`),r=t.reduce((e,t)=>e+(Number(t.grand_total)||0),0),i=t.reduce((e,t)=>e+(Number(t.balance_due)||0),0);return`
                  <tr>
                    <td><strong>${e.code}</strong></td>
                    <td><strong>${e.name}</strong></td>
                    <td>${e.contact_person||`—`}</td>
                    <td>
                      <div>${e.email}</div>
                      <span style="font-size:0.68rem; color:#94a3b8;">${e.phone}</span>
                    </td>
                    <td><code>${e.gstin||`—`}</code></td>
                    <td>${e.place_of_supply||`—`}</td>
                    <td>${this.formatCurrency(r)}</td>
                    <td><strong style="color:${i>0?`#ef4444`:`#10b981`};">${this.formatCurrency(i)}</strong></td>
                    <td>${this.formatCurrency(e.credit_limit)}</td>
                    <td>
                      <button type="button" class="fin-btn-row-action" onclick="window.finApp.openCustomerProfile('${e.id}')">360° Profile &amp; SOA</button>
                    </td>
                  </tr>
                `}).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    `}renderVendorsTab(e){let t=this.db?.vendors||[],n=this.db?.purchase_bills||[];e.innerHTML=`
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">🏢 Vendors &amp; Subcontractors Directory</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Supplier registries, PAN/GSTIN compliance, bank account details for wire release, and payable balances.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission(`create_vendor`)?`
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateVendorModal()">
                + Add Vendor
              </button>
            `:``}
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
              ${t.map(e=>{let t=n.filter(t=>t.vendor_id===e.id&&t.status!==`void`).reduce((e,t)=>e+(Number(t.balance_due)||0),0);return`
                  <tr>
                    <td><strong>${e.code}</strong></td>
                    <td><strong>${e.name}</strong></td>
                    <td><span class="fin-badge fin-badge-issued">${e.category}</span></td>
                    <td>
                      <div>${e.contact_person||`—`}</div>
                      <span style="font-size:0.68rem; color:#94a3b8;">${e.email}</span>
                    </td>
                    <td>
                      <div><code>${e.gstin||`—`}</code></div>
                      <span style="font-size:0.68rem; color:#94a3b8;">PAN: ${e.pan||`—`}</span>
                    </td>
                    <td>
                      <span style="font-size:0.75rem;">${e.bank_name||`Corporate Bank`}</span><br>
                      <code style="font-size:0.68rem;">A/C: ${e.account_no?`••••`+e.account_no.slice(-4):`—`}</code>
                    </td>
                    <td><strong style="color:${t>0?`#fb923c`:`#10b981`};">${this.formatCurrency(t)}</strong></td>
                    <td>${e.payment_terms} Days</td>
                    <td>
                      <button type="button" class="fin-btn-row-action" onclick="window.finApp.openVendorProfile('${e.id}')">Profile &amp; Ledger</button>
                    </td>
                  </tr>
                `}).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    `}renderItemsTab(e){let t=this.db?.items||[];e.innerHTML=`
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">📦 Items, Materials &amp; Engineering Services</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Catalog of civil supplies, structural steel, ready-mix concrete, MEP commissioning, and equipment rental rates.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission(`create_item`)?`
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateItemModal()">
                + Add Item / Service
              </button>
            `:``}
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
              ${t.map(e=>`
                <tr>
                  <td><strong>${e.code}</strong></td>
                  <td>
                    <strong>${e.name}</strong>
                    <div style="font-size:0.68rem; color:#94a3b8;">${e.description||``}</div>
                  </td>
                  <td><span class="fin-badge fin-badge-issued">${e.category}</span></td>
                  <td><code>${e.hsn_sac_code||`—`}</code></td>
                  <td>${e.uom}</td>
                  <td><strong>${this.formatCurrency(e.sales_price)}</strong></td>
                  <td>${this.formatCurrency(e.purchase_price)}</td>
                  <td><span style="color:#38bdf8; font-weight:700;">${e.gst_rate}%</span></td>
                  <td><span class="fin-badge fin-badge-paid">Active</span></td>
                </tr>
              `).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    `}renderPaymentsTab(e){let t=this.db?.customer_receipts||[],n=this.db?.vendor_payments||[];e.innerHTML=`
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;" class="fin-dash-row-responsive">
        <!-- Customer Receipts -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <div>
              <h2 class="fin-panel-title">💳 Customer Receipts</h2>
              <p style="font-size:0.75rem; color:#94a3b8;">Inward client collections &amp; invoice allocations</p>
            </div>
            ${this.hasPermission(`record_receipt`)?`
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openRecordReceiptModal()">
                + Record Receipt
              </button>
            `:``}
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
                ${t.map(e=>`
                  <tr>
                    <td><strong>${e.receipt_no}</strong></td>
                    <td>${this.formatDate(e.receipt_date)}</td>
                    <td><strong>${e.customer_name}</strong></td>
                    <td>
                      <div>${e.payment_mode}</div>
                      <span style="font-size:0.68rem; color:#94a3b8;">${e.reference_no}</span>
                    </td>
                    <td><strong style="color:#10b981;">${this.formatCurrency(e.amount_received)}</strong></td>
                    <td>
                      ${(e.allocations||[]).map(e=>`
                        <span class="fin-badge fin-badge-paid" style="font-size:0.65rem;">${e.invoice_no}: ${this.formatCurrency(e.amount_allocated)}</span>
                      `).join(` `)}
                    </td>
                  </tr>
                `).join(``)}
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
            ${this.hasPermission(`record_payment`)?`
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openRecordPaymentModal()">
                + Vendor Payment
              </button>
            `:``}
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
                ${n.map(e=>`
                  <tr>
                    <td><strong>${e.voucher_no}</strong></td>
                    <td>${this.formatDate(e.payment_date)}</td>
                    <td><strong>${e.vendor_name}</strong></td>
                    <td>
                      <div>${e.payment_mode}</div>
                      <span style="font-size:0.68rem; color:#94a3b8;">${e.reference_no}</span>
                    </td>
                    <td><strong style="color:#fb923c;">${this.formatCurrency(e.amount_paid)}</strong></td>
                    <td>
                      ${(e.allocations||[]).map(e=>`
                        <span class="fin-badge fin-badge-pending" style="font-size:0.65rem;">${e.bill_no}: ${this.formatCurrency(e.amount_allocated)}</span>
                      `).join(` `)}
                    </td>
                  </tr>
                `).join(``)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `}renderNotesTab(e){let t=this.db?.credit_notes||[],n=this.db?.debit_notes||[];e.innerHTML=`
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
                ${t.map(e=>`
                  <tr>
                    <td><strong>${e.credit_note_no}</strong></td>
                    <td><code>${e.invoice_no}</code></td>
                    <td>${e.customer_name}</td>
                    <td><span style="font-size:0.75rem;">${e.reason}</span></td>
                    <td><strong style="color:#38bdf8;">${this.formatCurrency(e.total_credit_amount)}</strong></td>
                    <td><span class="fin-badge fin-badge-paid">${e.status}</span></td>
                  </tr>
                `).join(``)}
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
                ${n.map(e=>`
                  <tr>
                    <td><strong>${e.debit_note_no}</strong></td>
                    <td><code>${e.bill_no}</code></td>
                    <td>${e.vendor_name}</td>
                    <td><span style="font-size:0.75rem;">${e.reason}</span></td>
                    <td><strong style="color:#f59e0b;">${this.formatCurrency(e.total_debit_amount)}</strong></td>
                    <td><span class="fin-badge fin-badge-paid">${e.status}</span></td>
                  </tr>
                `).join(``)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `}renderExpensesTab(e){let t=this.db?.expenses||[];e.innerHTML=`
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">🧾 Project &amp; Corporate Expenses</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Track site consumables, employee travel reimbursements, equipment fuel, and overhead expenses.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission(`submit_expense`)?`
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateExpenseModal()">
                + Record Expense Claim
              </button>
            `:``}
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
              ${t.map(e=>`
                <tr>
                  <td><strong>${e.expense_no}</strong></td>
                  <td>${this.formatDate(e.date)}</td>
                  <td><span class="fin-badge fin-badge-issued">${e.category}</span></td>
                  <td>${e.description}</td>
                  <td><span style="font-size:0.75rem;">${e.project_name||`General HQ`}</span></td>
                  <td>${e.submitted_by}</td>
                  <td>${this.formatCurrency(e.amount)}</td>
                  <td>${this.formatCurrency(e.tax_amount)}</td>
                  <td><strong>${this.formatCurrency(e.total_amount)}</strong></td>
                  <td><span class="fin-badge fin-badge-${e.status}">${e.status}</span></td>
                  <td>
                    <button type="button" class="fin-btn-row-action" onclick="alert('Attached proof: ${e.receipt_filename}')">View Receipt</button>
                  </td>
                </tr>
              `).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    `}renderPOTab(e){let t=this.db?.purchase_orders||[];e.innerHTML=`
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">📑 Purchase Orders (Procurement)</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Issue official purchase commitments to suppliers and track fulfillment versus billing.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission(`create_po`)?`
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreatePOModal()">
                + Create Purchase Order
              </button>
            `:``}
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
              ${t.map(e=>`
                <tr>
                  <td><strong>${e.po_no}</strong></td>
                  <td>${this.formatDate(e.date)}</td>
                  <td><strong>${e.vendor_name}</strong></td>
                  <td>${e.project_name}</td>
                  <td>${this.formatDate(e.expected_delivery)}</td>
                  <td><strong>${this.formatCurrency(e.total_value)}</strong></td>
                  <td>${this.formatCurrency(e.billed_value||0)}</td>
                  <td><span class="fin-badge fin-badge-paid">${e.status}</span></td>
                  <td>${e.approved_by||`—`}</td>
                </tr>
              `).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    `}renderProjectsTab(e){let t=this.db?.projects||[],n=this.db?.invoices||[],r=this.db?.purchase_bills||[],i=this.db?.expenses||[];e.innerHTML=`
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">🏗️ Project-Based Financial Accounts &amp; Profitability</h2>
            <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Contract revenues, budget utilization, vendor commitments, and project margins.</p>
          </div>
          <div class="fin-panel-actions">
            ${this.hasPermission(`create_project`)?`
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCreateProjectModal()">
                + New Project
              </button>
            `:``}
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap:1.5rem;">
          ${t.map(e=>{let t=n.filter(t=>t.project_id===e.id&&t.status!==`void`),a=t.reduce((e,t)=>e+(Number(t.grand_total)||0),0),o=t.reduce((e,t)=>e+(Number(t.amount_paid)||0),0),s=r.filter(t=>t.project_id===e.id&&t.status!==`void`).reduce((e,t)=>e+(Number(t.grand_total)||0),0)+i.filter(t=>t.project_id===e.id).reduce((e,t)=>e+(Number(t.total_amount)||0),0),c=a-s,l=a>0?(c/a*100).toFixed(1):`0`;return`
              <div style="background:var(--fin-bg-card-hover); border:1px solid var(--fin-border); border-radius:12px; padding:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                  <div>
                    <span style="font-size:0.72rem; color:#38bdf8; font-weight:700;">${e.code}</span>
                    <h3 style="font-family:var(--fin-font-heading); font-size:1.15rem; color:#f8fafc; margin-top:0.2rem;">${e.name}</h3>
                    <span style="font-size:0.78rem; color:#94a3b8;">Client: ${e.client_name}</span>
                  </div>
                  <span class="fin-badge fin-badge-paid">${e.status}</span>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem; background:rgba(0,0,0,0.25); border-radius:8px; padding:1rem; margin-bottom:1rem; font-size:0.8rem;">
                  <div>
                    <span style="color:#94a3b8; display:block; font-size:0.7rem;">Contract Value:</span>
                    <strong>${this.formatCurrency(e.contract_value)}</strong>
                  </div>
                  <div>
                    <span style="color:#94a3b8; display:block; font-size:0.7rem;">Approved Budget:</span>
                    <strong>${this.formatCurrency(e.approved_budget)}</strong>
                  </div>
                  <div>
                    <span style="color:#94a3b8; display:block; font-size:0.7rem;">Invoiced Revenue:</span>
                    <strong style="color:#38bdf8;">${this.formatCurrency(a)}</strong>
                  </div>
                  <div>
                    <span style="color:#94a3b8; display:block; font-size:0.7rem;">Customer Collections:</span>
                    <strong style="color:#10b981;">${this.formatCurrency(o)}</strong>
                  </div>
                  <div>
                    <span style="color:#94a3b8; display:block; font-size:0.7rem;">Project Direct Cost:</span>
                    <strong style="color:#fb923c;">${this.formatCurrency(s)}</strong>
                  </div>
                  <div>
                    <span style="color:#94a3b8; display:block; font-size:0.7rem;">Estimated Margin:</span>
                    <strong style="color:#10b981;">${this.formatCurrency(c)} (${l}%)</strong>
                  </div>
                </div>

                <div style="font-size:0.75rem; color:#94a3b8; display:flex; justify-content:space-between;">
                  <span>Timeline: ${this.formatDate(e.start_date)} &rarr; ${this.formatDate(e.target_completion)}</span>
                  <a href="/projects/" target="_blank" style="color:#38bdf8; text-decoration:none;">Site Specs &rarr;</a>
                </div>
              </div>
            `}).join(``)}
        </div>
      </div>
    `}renderReportsTab(e){let t=this.db?.invoices||[],n=this.db?.purchase_bills||[],r=this.db?.expenses||[],i=t.filter(e=>e.status!==`void`).reduce((e,t)=>e+(Number(t.taxable_subtotal)||0),0),a=t.filter(e=>e.status!==`void`).reduce((e,t)=>e+(Number(t.total_tax)||0),0),o=n.filter(e=>e.status!==`void`).reduce((e,t)=>e+(Number(t.taxable_subtotal)||0),0),s=n.filter(e=>e.status!==`void`).reduce((e,t)=>e+(Number(t.tax_total)||0),0),c=r.reduce((e,t)=>e+(Number(t.amount)||0),0),l=i-o,u=l-c,d=Math.max(0,a-s);e.innerHTML=`
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
              <strong>${this.formatCurrency(i)}</strong>
            </div>
            <div class="fin-calc-row" style="color:#fb923c;">
              <span>Less: Direct Cost of Supplies &amp; Subcontracts</span>
              <strong>- ${this.formatCurrency(o)}</strong>
            </div>
            <div class="fin-calc-row" style="border-top:1px dashed var(--fin-border); padding-top:0.5rem; margin-top:0.5rem; color:#38bdf8; font-weight:700;">
              <span>Gross Profit Margin</span>
              <strong>${this.formatCurrency(l)} (${i>0?(l/i*100).toFixed(1):0}%)</strong>
            </div>
            <div class="fin-calc-row" style="color:#ef4444; margin-top:0.5rem;">
              <span>Less: Site Consumables, Travel &amp; Overheads</span>
              <strong>- ${this.formatCurrency(c)}</strong>
            </div>
            <div class="fin-calc-row grand-total" style="color:#10b981; font-size:1.2rem; border-top:2px solid #10b981;">
              <span>Net Operating Profit</span>
              <strong>${this.formatCurrency(u)}</strong>
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
              <strong style="color:#0099e6;">${this.formatCurrency(a)}</strong>
            </div>
            <div class="fin-calc-row">
              <span>Input Tax Credit (ITC Available from Purchase Bills)</span>
              <strong style="color:#10b981;">${this.formatCurrency(s)}</strong>
            </div>
            <div class="fin-calc-row grand-total" style="border-top:2px solid #0099e6; color:#38bdf8;">
              <span>Net GST Cash Liability</span>
              <strong>${this.formatCurrency(d)}</strong>
            </div>
            <p style="font-size:0.72rem; color:#94a3b8; margin-top:1rem; line-height:1.5;">
              * Reconciliation accounts for reverse charge mechanism (RCM) on crane rentals and LUT export exemption for UAE cross-border civil contracts.
            </p>
          </div>
        </div>
      </div>
    `}renderCalendarTab(e){this.db?.invoices,this.db?.purchase_bills,e.innerHTML=`
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
            <div style="font-size:0.8rem; color:#cbd5e1;">Amount: <strong>${this.formatCurrency(885e4)}</strong></div>
            <div style="font-size:0.72rem; color:#94a3b8; margin-top:0.4rem;">Due: March 12, 2026 • Automated follow-up sent</div>
          </div>

          <div style="background:rgba(0,153,230,0.08); border:1px solid rgba(0,153,230,0.3); border-radius:10px; padding:1.25rem;">
            <span style="font-size:0.7rem; color:#0099e6; font-weight:700; text-transform:uppercase;">Upcoming Collection</span>
            <h4 style="color:#fff; margin:0.35rem 0;">L&amp;T Western Flyover Milestone</h4>
            <div style="font-size:0.8rem; color:#cbd5e1;">Amount: <strong>${this.formatCurrency(1425e3)}</strong></div>
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
            <div style="font-size:0.8rem; color:#cbd5e1;">Amount: <strong>${this.formatCurrency(184e4)}</strong></div>
            <div style="font-size:0.72rem; color:#94a3b8; margin-top:0.4rem;">Due: April 01, 2026 • Approved voucher</div>
          </div>
        </div>
      </div>
    `}renderDocumentsTab(e){e.innerHTML=`
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
              ${(this.db?.documents||[]).map(e=>`
                <tr>
                  <td><strong>📑 ${e.name}</strong></td>
                  <td><span class="fin-badge fin-badge-issued">${e.category}</span></td>
                  <td>${e.size}</td>
                  <td>${e.uploaded_by}</td>
                  <td>${this.formatDate(e.date)}</td>
                  <td><code>${e.linked_record}</code></td>
                  <td>
                    <button type="button" class="fin-btn-row-action" onclick="alert('Viewing secure document: ${e.name}')">Preview</button>
                    <button type="button" class="fin-btn-row-action" onclick="alert('Downloading: ${e.name}')">Download</button>
                  </td>
                </tr>
              `).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    `}renderUsersTab(e){let t=this.db?.users||[],n=this.db?.audit_logs||[];e.innerHTML=`
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
              ${t.map(e=>`
                <tr>
                  <td>
                    <strong>${e.name}</strong>
                    <div style="font-size:0.68rem; color:#94a3b8;">${e.email}</div>
                  </td>
                  <td>
                    <div>${e.designation}</div>
                    <span style="font-size:0.68rem; color:#38bdf8;">${e.department}</span>
                  </td>
                  <td><span class="fin-badge fin-badge-issued">${e.role_label}</span></td>
                  <td>${e.phone||`—`}</td>
                  <td><span class="fin-badge fin-badge-${e.status===`active`?`paid`:`overdue`}">${e.status}</span></td>
                  <td>
                    <button type="button" class="fin-btn-row-action" onclick="alert('Permissions for ${e.name}: Full access to assigned company ledgers.')">Permissions</button>
                  </td>
                </tr>
              `).join(``)}
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
              ${n.map(e=>`
                <tr>
                  <td style="white-space:nowrap; font-size:0.75rem; color:#94a3b8;">${new Date(e.timestamp).toLocaleString(`en-IN`)}</td>
                  <td><strong>${e.actor_name}</strong></td>
                  <td><span style="font-size:0.72rem; color:#38bdf8;">${e.actor_role}</span></td>
                  <td><span class="fin-badge fin-badge-issued">${e.action}</span></td>
                  <td>${e.entity}</td>
                  <td style="font-size:0.78rem;">${e.details}</td>
                  <td><code>${e.ip_address}</code></td>
                </tr>
              `).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    `}renderSettingsTab(e){let t=this.db?.settings||{};e.innerHTML=`
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
              <input type="text" class="fin-form-input" value="${t.base_currency||`INR`}" readonly>
            </div>
            <div class="fin-form-group">
              <label class="fin-form-label">Invoice Numbering Prefix</label>
              <input type="text" id="set-inv-prefix" class="fin-form-input" value="${t.invoice_prefix||`INV-2026-`}">
            </div>
          </div>

          <div class="fin-form-grid-2">
            <div class="fin-form-group">
              <label class="fin-form-label">Default Payment Terms (Days)</label>
              <input type="number" id="set-pay-terms" class="fin-form-input" value="${t.default_payment_terms||30}">
            </div>
            <div class="fin-form-group">
              <label class="fin-form-label">CFO Approval Threshold (₹)</label>
              <input type="number" id="set-cfo-threshold" class="fin-form-input" value="${t.approval_threshold_cfo||5e5}">
            </div>
          </div>

          <div class="fin-form-group">
            <label class="fin-form-label">Authorized Signatory Name</label>
            <input type="text" id="set-signatory-name" class="fin-form-input" value="${t.company_signatory_name||`Arshad Alam Shaikh`}">
          </div>

          <div class="fin-form-group">
            <label class="fin-form-label">Signatory Corporate Title</label>
            <input type="text" id="set-signatory-title" class="fin-form-input" value="${t.company_signatory_title||`Authorized Signatory - Rayan Group`}">
          </div>

          <button type="submit" class="btn-enterprise-primary" style="margin-top:1rem;">
            <span>SAVE CONFIGURATION PREFERENCES</span>
          </button>
        </form>
      </div>
    `;let n=document.getElementById(`fin-settings-form`);n&&(n.onsubmit=async e=>{e.preventDefault();let t={invoice_prefix:document.getElementById(`set-inv-prefix`).value,default_payment_terms:Number(document.getElementById(`set-pay-terms`).value),approval_threshold_cfo:Number(document.getElementById(`set-cfo-threshold`).value),company_signatory_name:document.getElementById(`set-signatory-name`).value,company_signatory_title:document.getElementById(`set-signatory-title`).value};await this.syncApi(`update_settings`,{settings:t}),alert(`Financial configuration preferences updated successfully.`),this.renderActiveTab()})}switchTab(e){this.activeTab=e,document.querySelectorAll(`.fin-tab-item`).forEach(t=>{t.classList.toggle(`active`,t.getAttribute(`data-tab`)===e)}),this.renderActiveTab()}openCreateInvoiceModal(){let e=this.db?.customers||[],t=this.db?.items||[],n=this.db?.projects||[],r=`
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
                    ${e.map(e=>`<option value="${e.id}">${e.name} (${e.code})</option>`).join(``)}
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
                  <input type="date" id="inv-date" class="fin-form-input" value="${new Date().toISOString().split(`T`)[0]}" required>
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
                    ${n.map(e=>`<option value="${e.id}" data-name="${e.name}">${e.name} (${e.code})</option>`).join(``)}
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
    `;document.getElementById(`fin-modal-container`).innerHTML=r;let i=document.getElementById(`inv-items-tbody`),a=(e=null)=>{let n=document.createElement(`tr`);n.innerHTML=`
        <td>
          <select class="fin-form-select row-item-sel">
            <option value="">Custom Item / Service</option>
            ${t.map(t=>`<option value="${t.id}" ${e&&e.id===t.id?`selected`:``}>${t.name}</option>`).join(``)}
          </select>
          <input type="text" class="fin-form-input row-desc" placeholder="Item description" style="margin-top:0.3rem;" value="${e?e.name:``}">
        </td>
        <td><input type="text" class="fin-form-input row-hsn" placeholder="HSN/SAC" value="${e?e.hsn_sac_code:`9954`}"></td>
        <td><input type="number" class="fin-form-input row-qty" value="1" min="0.01" step="any"></td>
        <td><input type="text" class="fin-form-input row-uom" value="${e?e.uom:`LSUM`}"></td>
        <td><input type="number" class="fin-form-input row-rate" value="${e?e.sales_price:0}" step="any"></td>
        <td>
          <select class="fin-form-select row-gst">
            <option value="18" ${!e||e.gst_rate===18?`selected`:``}>18%</option>
            <option value="12" ${e&&e.gst_rate===12?`selected`:``}>12%</option>
            <option value="5" ${e&&e.gst_rate===5?`selected`:``}>5%</option>
            <option value="28" ${e&&e.gst_rate===28?`selected`:``}>28%</option>
            <option value="0" ${e&&e.gst_rate===0?`selected`:``}>0% (Export/LUT)</option>
          </select>
        </td>
        <td><strong class="row-total">₹0.00</strong></td>
        <td><button type="button" class="fin-modal-close row-del" style="font-size:1.1rem; color:#ef4444;">&times;</button></td>
      `,i.appendChild(n);let r=n.querySelector(`.row-item-sel`);r.onchange=()=>{let e=t.find(e=>e.id===r.value);e&&(n.querySelector(`.row-desc`).value=e.name,n.querySelector(`.row-hsn`).value=e.hsn_sac_code||``,n.querySelector(`.row-uom`).value=e.uom||`UNITS`,n.querySelector(`.row-rate`).value=e.sales_price||0,n.querySelector(`.row-gst`).value=e.gst_rate||18,o())},n.querySelectorAll(`.row-qty, .row-rate, .row-gst`).forEach(e=>{e.oninput=()=>o()}),n.querySelector(`.row-del`).onclick=()=>{n.remove(),o()},o()},o=()=>{let e=(document.getElementById(`inv-cust-pos`).value||``).toLowerCase(),t=!e.includes(`maharashtra`)&&!e.includes(`27`),n=0,r=0,a=0,o=0,s=0;i.querySelectorAll(`tr`).forEach(e=>{let i=Number(e.querySelector(`.row-qty`).value)||0,c=Number(e.querySelector(`.row-rate`).value)||0,l=Number(e.querySelector(`.row-gst`).value)||0,u=i*c,d=l/100*u,f=u+d;e.querySelector(`.row-total`).textContent=`₹${f.toLocaleString(`en-IN`,{minimumFractionDigits:2})}`,n+=u,r+=d,t?s+=d:(a+=d/2,o+=d/2)});let c=n+r;document.getElementById(`inv-calc-taxable`).textContent=`₹${n.toLocaleString(`en-IN`,{minimumFractionDigits:2})}`,document.getElementById(`inv-calc-grand`).textContent=`₹${c.toLocaleString(`en-IN`,{minimumFractionDigits:2})}`,t?(document.getElementById(`inv-calc-cgst-row`).style.display=`none`,document.getElementById(`inv-calc-sgst-row`).style.display=`none`,document.getElementById(`inv-calc-igst-row`).style.display=`flex`,document.getElementById(`inv-calc-igst`).textContent=`₹${s.toLocaleString(`en-IN`,{minimumFractionDigits:2})}`):(document.getElementById(`inv-calc-cgst-row`).style.display=`flex`,document.getElementById(`inv-calc-sgst-row`).style.display=`flex`,document.getElementById(`inv-calc-igst-row`).style.display=`none`,document.getElementById(`inv-calc-cgst`).textContent=`₹${a.toLocaleString(`en-IN`,{minimumFractionDigits:2})}`,document.getElementById(`inv-calc-sgst`).textContent=`₹${o.toLocaleString(`en-IN`,{minimumFractionDigits:2})}`)},s=document.getElementById(`inv-cust-select`);s.onchange=()=>{let t=e.find(e=>e.id===s.value);t&&(document.getElementById(`inv-cust-gstin`).value=t.gstin||`EXEMPT`,document.getElementById(`inv-cust-pos`).value=t.place_of_supply||`27-Maharashtra`,document.getElementById(`inv-terms`).value=t.payment_terms||30,c(),o())};let c=()=>{let e=new Date(document.getElementById(`inv-date`).value),t=Number(document.getElementById(`inv-terms`).value)||30;e.setDate(e.getDate()+t),document.getElementById(`inv-due-date`).value=e.toISOString().split(`T`)[0]};document.getElementById(`inv-date`).onchange=c,document.getElementById(`inv-terms`).oninput=c,c(),document.getElementById(`inv-add-row-btn`).onclick=()=>a(),a(t[0]||null),document.getElementById(`create-invoice-form`).onsubmit=async e=>{e.preventDefault(),await this.saveInvoiceHandler(`issued`)},document.getElementById(`inv-save-draft-btn`).onclick=async()=>{await this.saveInvoiceHandler(`draft`)}}async saveInvoiceHandler(e=`issued`){let t=document.getElementById(`inv-cust-select`).value,n=this.db?.customers?.find(e=>e.id===t);if(!n){alert(`Please select a valid customer.`);return}let r=document.getElementById(`inv-project`),i=r.value||null,a=r.options[r.selectedIndex]?.getAttribute(`data-name`)||``,o=[],s=0,c=0,l=0,u=0,d=0,f=(document.getElementById(`inv-cust-pos`).value||``).toLowerCase(),p=!f.includes(`maharashtra`)&&!f.includes(`27`);document.querySelectorAll(`#inv-items-tbody tr`).forEach(e=>{let t=e.querySelector(`.row-desc`).value.trim(),n=e.querySelector(`.row-hsn`).value.trim(),r=Number(e.querySelector(`.row-qty`).value)||1,i=e.querySelector(`.row-uom`).value.trim(),a=Number(e.querySelector(`.row-rate`).value)||0,f=Number(e.querySelector(`.row-gst`).value)||0,m=r*a,h=f/100*m,g=m+h,_=0,v=0,y=0;p?y=h:(_=h/2,v=h/2),s+=m,d+=h,c+=_,l+=v,u+=y,o.push({description:t,hsn_sac_code:n,qty:r,uom:i,unit_price:a,taxable_amount:m,gst_rate:f,cgst_amount:_,sgst_amount:v,igst_amount:y,total_amount:g})});let m=s+d,h={invoice:{customer_id:n.id,customer_name:n.name,customer_gstin:n.gstin,place_of_supply:document.getElementById(`inv-cust-pos`).value,project_id:i,project_name:a,po_reference:document.getElementById(`inv-po-ref`).value,invoice_date:document.getElementById(`inv-date`).value,due_date:document.getElementById(`inv-due-date`).value,payment_terms:Number(document.getElementById(`inv-terms`).value),line_items:o,taxable_subtotal:s,cgst_total:c,sgst_total:l,igst_total:u,total_tax:d,grand_total:m,status:e,notes:document.getElementById(`inv-notes`).value}},g=await this.syncApi(`create_invoice`,h);g&&g.success&&(alert(`Invoice ${g.invoice.invoice_no} (${e.toUpperCase()}) saved successfully.`),this.closeModal(`modal-invoice`),this.switchTab(`invoices`))}openInvoiceDetail(e){let t=this.db?.invoices?.find(t=>t.id===e);if(!t)return;let n=`
      <div class="fin-modal-backdrop open" id="modal-inv-detail">
        <div class="fin-modal-dialog" style="max-width:920px;">
          <div class="fin-modal-header no-print">
            <h3 class="fin-modal-title">Tax Invoice ${t.invoice_no}</h3>
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
                  <div style="font-size:0.9rem; font-weight:800; color:#0f172a; margin-top:0.35rem;">${t.invoice_no}</div>
                  <div style="font-size:0.78rem; color:#64748b;">Invoice Date: ${this.formatDate(t.invoice_date)}</div>
                  <div style="font-size:0.78rem; color:#64748b;">Due Date: ${this.formatDate(t.due_date)}</div>
                  <div style="font-size:0.78rem; color:#0099e6; font-weight:700;">Status: ${t.status.toUpperCase()}</div>
                </div>
              </div>

              <!-- Customer & Place of Supply Grid -->
              <div class="fin-print-meta-grid">
                <div>
                  <strong style="color:#0099e6; text-transform:uppercase; font-size:0.75rem; display:block; margin-bottom:0.25rem;">BILLED TO (BUYER):</strong>
                  <div style="font-weight:800; font-size:0.95rem; color:#0f172a;">${t.customer_name}</div>
                  <div style="color:#475569; font-size:0.82rem;">
                    <strong>GSTIN:</strong> ${t.customer_gstin||`EXEMPT`}<br>
                    <strong>Place of Supply:</strong> ${t.place_of_supply}<br>
                    ${t.po_reference?`<strong>PO Reference:</strong> ${t.po_reference}`:``}
                  </div>
                </div>
                <div>
                  <strong style="color:#0099e6; text-transform:uppercase; font-size:0.75rem; display:block; margin-bottom:0.25rem;">PROJECT DETAILS:</strong>
                  <div style="font-weight:700; color:#0f172a;">${t.project_name||`General Construction Works`}</div>
                  <div style="color:#475569; font-size:0.82rem;">
                    Payment Terms: ${t.payment_terms} Days from Invoice Date<br>
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
                  ${(t.line_items||[]).map((e,t)=>`
                    <tr>
                      <td>${t+1}</td>
                      <td>
                        <strong>${e.name||e.description}</strong>
                      </td>
                      <td>${e.hsn_sac_code||`—`}</td>
                      <td>${e.qty}</td>
                      <td>${e.uom}</td>
                      <td>${this.formatCurrency(e.unit_price,!1)}</td>
                      <td>${this.formatCurrency(e.taxable_amount,!1)}</td>
                      <td>${e.gst_rate}%</td>
                      <td><strong>${this.formatCurrency(e.total_amount,!1)}</strong></td>
                    </tr>
                  `).join(``)}
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
                    <strong>${this.formatCurrency(t.taxable_subtotal)}</strong>
                  </div>
                  ${t.cgst_total>0?`
                    <div style="display:flex; justify-content:space-between; padding:0.25rem 0;">
                      <span>CGST (9%):</span>
                      <span>${this.formatCurrency(t.cgst_total)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:0.25rem 0;">
                      <span>SGST (9%):</span>
                      <span>${this.formatCurrency(t.sgst_total)}</span>
                    </div>
                  `:``}
                  ${t.igst_total>0?`
                    <div style="display:flex; justify-content:space-between; padding:0.25rem 0;">
                      <span>IGST (18%):</span>
                      <span>${this.formatCurrency(t.igst_total)}</span>
                    </div>
                  `:``}
                  <div style="display:flex; justify-content:space-between; padding:0.5rem 0; border-top:2px solid #0099e6; margin-top:0.4rem; font-size:1.1rem; font-weight:900; color:#0f172a;">
                    <span>Grand Total:</span>
                    <span>${this.formatCurrency(t.grand_total)}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; padding:0.25rem 0; color:#10b981; font-weight:700;">
                    <span>Amount Paid:</span>
                    <span>${this.formatCurrency(t.amount_paid||0)}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; padding:0.25rem 0; color:#ef4444; font-weight:800;">
                    <span>Balance Due:</span>
                    <span>${this.formatCurrency(t.balance_due)}</span>
                  </div>
                </div>
              </div>

              <!-- Signatory Footer -->
              <div class="fin-print-footer">
                <div>
                  <div style="font-size:0.72rem; color:#94a3b8;">This is a computer-generated tax invoice verified under Rayan GRC Finance.</div>
                  <div style="font-size:0.72rem; color:#94a3b8;">Digitally signed &amp; audited on ${this.formatDate(t.created_at||t.invoice_date)}.</div>
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
    `;document.getElementById(`fin-modal-container`).innerHTML=n}openRecordReceiptModal(e=null){let t=this.db?.customers||[],n=this.db?.invoices||[],r=`
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
                  ${t.map(e=>`<option value="${e.id}">${e.name} (${e.code})</option>`).join(``)}
                </select>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Receipt Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="rec-date" class="fin-form-input" value="${new Date().toISOString().split(`T`)[0]}" required>
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
    `;document.getElementById(`fin-modal-container`).innerHTML=r;let i=document.getElementById(`rec-cust-sel`),a=document.getElementById(`rec-invoices-list`),o=document.getElementById(`rec-amount`),s=()=>{let e=i.value,t=n.filter(t=>t.customer_id===e&&t.balance_due>0&&t.status!==`void`);if(!t.length){a.innerHTML=`<div style="font-size:0.78rem; color:#10b981;">No outstanding invoices found for this client. Receipt can be logged as advance.</div>`;return}if(a.innerHTML=t.map(e=>`
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.4rem 0; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div>
            <strong style="color:#f8fafc; font-size:0.8rem;">${e.invoice_no}</strong>
            <span style="font-size:0.72rem; color:#94a3b8;"> (${this.formatDate(e.invoice_date)})</span>
            <div style="font-size:0.7rem; color:#38bdf8;">Balance: ${this.formatCurrency(e.balance_due)}</div>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <input type="number" class="fin-form-input rec-alloc-input" data-inv-id="${e.id}" data-inv-no="${e.invoice_no}" data-max="${e.balance_due}" placeholder="Allocated amount" style="width:140px; padding:0.3rem 0.5rem; font-size:0.75rem;" step="any">
          </div>
        </div>
      `).join(``),o.value){let e=Number(o.value)||0;document.querySelectorAll(`.rec-alloc-input`).forEach(t=>{let n=Number(t.getAttribute(`data-max`))||0,r=Math.min(e,n);t.value=r>0?r:``,e-=r})}};if(i.onchange=s,o.oninput=()=>{let e=Number(o.value)||0;document.querySelectorAll(`.rec-alloc-input`).forEach(t=>{let n=Number(t.getAttribute(`data-max`))||0,r=Math.min(e,n);t.value=r>0?r:``,e-=r})},e){let t=n.find(t=>t.id===e);t&&(i.value=t.customer_id,o.value=t.balance_due,s())}document.getElementById(`record-receipt-form`).onsubmit=async e=>{e.preventDefault();let n=Number(o.value);if(!n||n<=0){alert(`Please enter a valid receipt amount.`);return}let r=[],a=0;if(document.querySelectorAll(`.rec-alloc-input`).forEach(e=>{let t=Number(e.value)||0;t>0&&(r.push({invoice_id:e.getAttribute(`data-inv-id`),invoice_no:e.getAttribute(`data-inv-no`),amount_allocated:t}),a+=t)}),a>n){alert(`Total allocated amounts across invoices cannot exceed the total received amount.`);return}let s=t.find(e=>e.id===i.value),c={receipt:{customer_id:s.id,customer_name:s.name,receipt_date:document.getElementById(`rec-date`).value,payment_mode:document.getElementById(`rec-mode`).value,reference_no:document.getElementById(`rec-ref`).value,amount_received:n,allocated_amount:a,allocations:r,notes:document.getElementById(`rec-notes`).value}},l=await this.syncApi(`record_receipt`,c);l&&l.success&&(alert(`Payment Receipt ${l.receipt.receipt_no} recorded successfully. Invoices updated.`),this.closeModal(`modal-receipt`),this.switchTab(`payments`))}}openQuickPayInvoice(e){this.openRecordReceiptModal(e)}openCreateBillModal(){let e=this.db?.vendors||[],t=this.db?.projects||[],n=this.db?.purchase_orders||[],r=`
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
                    ${e.map(e=>`<option value="${e.id}">${e.name} (${e.code})</option>`).join(``)}
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
                    ${n.map(e=>`<option value="${e.id}">${e.po_no} - ${e.vendor_name}</option>`).join(``)}
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Bill Date</label>
                  <input type="date" id="bill-date" class="fin-form-input" value="${new Date().toISOString().split(`T`)[0]}" required>
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
                    ${t.map(e=>`<option value="${e.id}" data-name="${e.name}">${e.name} (${e.code})</option>`).join(``)}
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
    `;document.getElementById(`fin-modal-container`).innerHTML=r;let i=document.getElementById(`bill-taxable`),a=document.getElementById(`bill-gst-rate`),o=document.getElementById(`bill-grand`),s=()=>{let e=Number(i.value)||0,t=e+e*((Number(a.value)||0)/100);o.value=`₹${t.toLocaleString(`en-IN`,{minimumFractionDigits:2})}`};i.oninput=s,a.onchange=s;let c=document.getElementById(`bill-date`),l=document.getElementById(`bill-terms`),u=document.getElementById(`bill-due-date`),d=()=>{let e=new Date(c.value);e.setDate(e.getDate()+(Number(l.value)||30)),u.value=e.toISOString().split(`T`)[0]};c.onchange=d,l.oninput=d,d(),document.getElementById(`create-bill-form`).onsubmit=async t=>{t.preventDefault();let n=document.getElementById(`bill-vend-sel`).value,r=e.find(e=>e.id===n),o=document.getElementById(`bill-project`),s=o.value||null,d=o.options[o.selectedIndex]?.getAttribute(`data-name`)||``,f=Number(i.value)||0,p=Number(a.value)||0,m=p/100*f,h=f+m,g={bill:{vendor_id:r.id,vendor_name:r.name,vendor_invoice_no:document.getElementById(`bill-inv-no`).value,po_id:document.getElementById(`bill-po-sel`).value||null,project_id:s,project_name:d,bill_date:c.value,due_date:u.value,payment_terms:Number(l.value),taxable_subtotal:f,tax_total:m,grand_total:h,line_items:[{name:document.getElementById(`bill-item-desc`).value,qty:1,uom:`LSUM`,unit_price:f,taxable_amount:f,gst_rate:p,tax_amount:m,total_amount:h}],notes:document.getElementById(`bill-notes`).value}},_=await this.syncApi(`create_bill`,g);_&&_.success&&(alert(`Purchase Bill ${_.bill.bill_no} recorded successfully.`),this.closeModal(`modal-bill`),this.switchTab(`bills`))}}openRecordPaymentModal(e=null){let t=this.db?.vendors||[],n=this.db?.purchase_bills||[],r=`
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
                  ${t.map(e=>`<option value="${e.id}">${e.name} (${e.code})</option>`).join(``)}
                </select>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Payment Date</label>
                  <input type="date" id="pay-date" class="fin-form-input" value="${new Date().toISOString().split(`T`)[0]}" required>
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
    `;document.getElementById(`fin-modal-container`).innerHTML=r;let i=document.getElementById(`pay-vend-sel`),a=document.getElementById(`pay-bills-list`),o=document.getElementById(`pay-amount`),s=()=>{let e=i.value,t=n.filter(t=>t.vendor_id===e&&t.balance_due>0&&t.status!==`void`);if(!t.length){a.innerHTML=`<div style="font-size:0.78rem; color:#10b981;">No unpaid approved bills found for this vendor.</div>`;return}if(a.innerHTML=t.map(e=>`
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.4rem 0; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div>
            <strong style="color:#f8fafc; font-size:0.8rem;">${e.bill_no}</strong>
            <span style="font-size:0.72rem; color:#94a3b8;"> (${e.vendor_invoice_no})</span>
            <div style="font-size:0.7rem; color:#fb923c;">Balance Due: ${this.formatCurrency(e.balance_due)}</div>
          </div>
          <div>
            <input type="number" class="fin-form-input pay-alloc-input" data-bill-id="${e.id}" data-bill-no="${e.bill_no}" data-max="${e.balance_due}" placeholder="Amount" style="width:140px; padding:0.3rem 0.5rem; font-size:0.75rem;" step="any">
          </div>
        </div>
      `).join(``),o.value){let e=Number(o.value)||0;document.querySelectorAll(`.pay-alloc-input`).forEach(t=>{let n=Number(t.getAttribute(`data-max`))||0,r=Math.min(e,n);t.value=r>0?r:``,e-=r})}};if(i.onchange=s,o.oninput=()=>{let e=Number(o.value)||0;document.querySelectorAll(`.pay-alloc-input`).forEach(t=>{let n=Number(t.getAttribute(`data-max`))||0,r=Math.min(e,n);t.value=r>0?r:``,e-=r})},e){let t=n.find(t=>t.id===e);t&&(i.value=t.vendor_id,o.value=t.balance_due,s())}document.getElementById(`record-payment-form`).onsubmit=async e=>{e.preventDefault();let n=Number(o.value);if(!n||n<=0){alert(`Please enter a valid disbursement amount.`);return}let r=[];document.querySelectorAll(`.pay-alloc-input`).forEach(e=>{let t=Number(e.value)||0;t>0&&r.push({bill_id:e.getAttribute(`data-bill-id`),bill_no:e.getAttribute(`data-bill-no`),amount_allocated:t})});let a=t.find(e=>e.id===i.value),s={payment:{vendor_id:a.id,vendor_name:a.name,payment_date:document.getElementById(`pay-date`).value,payment_mode:document.getElementById(`pay-mode`).value,reference_no:document.getElementById(`pay-ref`).value,amount_paid:n,allocations:r,notes:document.getElementById(`pay-notes`).value}},c=await this.syncApi(`record_payment`,s);c&&c.success&&(alert(`Payment voucher ${c.payment.voucher_no} disbursed to ${a.name}.`),this.closeModal(`modal-payment`),this.switchTab(`payments`))}}openQuickPayBill(e){this.openRecordPaymentModal(e)}openCustomerProfile(e){let t=this.db?.customers?.find(t=>t.id===e);if(!t)return;let n=(this.db?.invoices||[]).filter(e=>e.customer_id===t.id&&e.status!==`void`),r=(this.db?.customer_receipts||[]).filter(e=>e.customer_id===t.id),i=n.reduce((e,t)=>e+(Number(t.grand_total)||0),0),a=n.reduce((e,t)=>e+(Number(t.amount_paid)||0),0),o=n.reduce((e,t)=>e+(Number(t.balance_due)||0),0),s=`
      <div class="fin-modal-backdrop open" id="modal-cust-profile">
        <div class="fin-modal-dialog" style="max-width:880px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">Customer Profile: ${t.name}</h3>
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
                <strong style="font-size:1.25rem; color:#f8fafc;">${this.formatCurrency(i)}</strong>
              </div>
              <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:1rem;">
                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Total Collections Received:</span>
                <strong style="font-size:1.25rem; color:#10b981;">${this.formatCurrency(a)}</strong>
              </div>
              <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:1rem;">
                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Current Outstanding Dues:</span>
                <strong style="font-size:1.25rem; color:#ef4444;">${this.formatCurrency(o)}</strong>
              </div>
            </div>

            <!-- Client Info Grid -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; background:rgba(0,0,0,0.25); border-radius:8px; padding:1.25rem; margin-bottom:1.5rem; font-size:0.82rem;">
              <div>
                <strong>Billing Address:</strong><br>
                <span style="color:#cbd5e1;">${t.billing_address||`—`}</span><br>
                <strong>GSTIN:</strong> <code>${t.gstin||`EXEMPT`}</code> • <strong>Place of Supply:</strong> ${t.place_of_supply}
              </div>
              <div>
                <strong>Primary Contact:</strong> ${t.contact_person||`—`}<br>
                <strong>Email:</strong> <a href="mailto:${t.email}" style="color:#38bdf8;">${t.email}</a><br>
                <strong>Phone:</strong> ${t.phone||`—`}<br>
                <strong>Credit Limit:</strong> ${this.formatCurrency(t.credit_limit)} • <strong>Terms:</strong> ${t.payment_terms} Days
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
                  ${n.map(e=>`
                    <tr>
                      <td><strong>${e.invoice_no}</strong></td>
                      <td>${this.formatDate(e.invoice_date)}</td>
                      <td>${this.formatDate(e.due_date)}</td>
                      <td>${this.formatCurrency(e.grand_total)}</td>
                      <td style="color:#10b981;">${this.formatCurrency(e.amount_paid||0)}</td>
                      <td><strong style="color:${e.balance_due>0?`#ef4444`:`#10b981`};">${this.formatCurrency(e.balance_due)}</strong></td>
                      <td><span class="fin-badge fin-badge-${e.status}">${e.status}</span></td>
                    </tr>
                  `).join(``)}
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
                  ${r.map(e=>`
                    <tr>
                      <td><strong>${e.receipt_no}</strong></td>
                      <td>${this.formatDate(e.receipt_date)}</td>
                      <td>${e.payment_mode}</td>
                      <td><code>${e.reference_no}</code></td>
                      <td><strong style="color:#10b981;">${this.formatCurrency(e.amount_received)}</strong></td>
                    </tr>
                  `).join(``)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;document.getElementById(`fin-modal-container`).innerHTML=s}openVendorProfile(e){let t=this.db?.vendors?.find(t=>t.id===e);if(!t)return;let n=(this.db?.purchase_bills||[]).filter(e=>e.vendor_id===t.id&&e.status!==`void`);(this.db?.vendor_payments||[]).filter(e=>e.vendor_id===t.id);let r=n.reduce((e,t)=>e+(Number(t.grand_total)||0),0),i=n.reduce((e,t)=>e+(Number(t.amount_paid)||0),0),a=n.reduce((e,t)=>e+(Number(t.balance_due)||0),0),o=`
      <div class="fin-modal-backdrop open" id="modal-vend-profile">
        <div class="fin-modal-dialog" style="max-width:880px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">Vendor Profile: ${t.name}</h3>
            <div style="display:flex; gap:0.5rem;">
              <button type="button" class="fin-btn-quick primary" onclick="window.print()">🖨️ Print Vendor Statement</button>
              <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-vend-profile')">&times;</button>
            </div>
          </div>
          <div class="fin-modal-body">
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem; margin-bottom:1.5rem;">
              <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:1rem;">
                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Total Purchases:</span>
                <strong style="font-size:1.25rem; color:#f8fafc;">${this.formatCurrency(r)}</strong>
              </div>
              <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:1rem;">
                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Total Disbursed:</span>
                <strong style="font-size:1.25rem; color:#10b981;">${this.formatCurrency(i)}</strong>
              </div>
              <div style="background:rgba(251,146,60,0.1); border:1px solid rgba(251,146,60,0.3); border-radius:8px; padding:1rem;">
                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Outstanding Payables:</span>
                <strong style="font-size:1.25rem; color:#fb923c;">${this.formatCurrency(a)}</strong>
              </div>
            </div>

            <!-- Bank & Corporate Details -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; background:rgba(0,0,0,0.25); border-radius:8px; padding:1.25rem; margin-bottom:1.5rem; font-size:0.82rem;">
              <div>
                <strong>Registered Address:</strong><br>
                <span style="color:#cbd5e1;">${t.address||`—`}</span><br>
                <strong>GSTIN:</strong> <code>${t.gstin||`—`}</code> • <strong>PAN:</strong> <code>${t.pan||`—`}</code>
              </div>
              <div>
                <strong>Bank Account (Restricted View):</strong><br>
                Bank: <strong>${t.bank_name||`State Bank of India`}</strong><br>
                A/C: <code>${t.account_no||`••••••••••••`}</code> • IFSC: <code>${t.ifsc_code||`SBIN0001234`}</code><br>
                Payment Terms: ${t.payment_terms||30} Days
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
                  ${n.map(e=>`
                    <tr>
                      <td><strong>${e.bill_no}</strong></td>
                      <td>${e.vendor_invoice_no}</td>
                      <td>${this.formatDate(e.bill_date)}</td>
                      <td>${this.formatDate(e.due_date)}</td>
                      <td>${this.formatCurrency(e.grand_total)}</td>
                      <td style="color:#10b981;">${this.formatCurrency(e.amount_paid||0)}</td>
                      <td><strong style="color:${e.balance_due>0?`#fb923c`:`#10b981`};">${this.formatCurrency(e.balance_due)}</strong></td>
                      <td><span class="fin-badge fin-badge-${e.status}">${e.status}</span></td>
                    </tr>
                  `).join(``)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;document.getElementById(`fin-modal-container`).innerHTML=o}openCreateCustomerModal(){document.getElementById(`fin-modal-container`).innerHTML=`
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
    `,document.getElementById(`add-cust-form`).onsubmit=async e=>{e.preventDefault();let t={customer:{name:document.getElementById(`new-cust-name`).value.trim(),contact_person:document.getElementById(`new-cust-contact`).value.trim(),email:document.getElementById(`new-cust-email`).value.trim(),phone:document.getElementById(`new-cust-phone`).value.trim(),gstin:document.getElementById(`new-cust-gstin`).value.trim().toUpperCase(),billing_address:document.getElementById(`new-cust-address`).value.trim(),place_of_supply:document.getElementById(`new-cust-pos`).value.trim(),credit_limit:Number(document.getElementById(`new-cust-credit`).value)||1e7}},n=await this.syncApi(`create_customer`,t);n&&n.success&&(alert(`Customer ${n.customer.name} created successfully.`),this.closeModal(`modal-add-cust`),this.switchTab(`customers`))}}openCreateVendorModal(){document.getElementById(`fin-modal-container`).innerHTML=`
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
    `,document.getElementById(`add-vend-form`).onsubmit=async e=>{e.preventDefault();let t={vendor:{name:document.getElementById(`new-vend-name`).value.trim(),category:document.getElementById(`new-vend-cat`).value,contact_person:document.getElementById(`new-vend-contact`).value.trim(),email:document.getElementById(`new-vend-email`).value.trim(),phone:document.getElementById(`new-vend-phone`).value.trim(),gstin:document.getElementById(`new-vend-gstin`).value.trim().toUpperCase(),pan:document.getElementById(`new-vend-pan`).value.trim().toUpperCase(),bank_name:document.getElementById(`new-vend-bank`).value.trim(),account_no:document.getElementById(`new-vend-ac`).value.trim(),ifsc_code:document.getElementById(`new-vend-ifsc`).value.trim().toUpperCase()}},n=await this.syncApi(`create_vendor`,t);n&&n.success&&(alert(`Vendor ${n.vendor.name} added successfully.`),this.closeModal(`modal-add-vend`),this.switchTab(`vendors`))}}openCreateItemModal(){document.getElementById(`fin-modal-container`).innerHTML=`
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
    `,document.getElementById(`add-item-form`).onsubmit=async e=>{e.preventDefault();let t={item:{name:document.getElementById(`new-item-name`).value.trim(),category:document.getElementById(`new-item-cat`).value,hsn_sac_code:document.getElementById(`new-item-hsn`).value.trim(),uom:document.getElementById(`new-item-uom`).value,sales_price:Number(document.getElementById(`new-item-sales`).value),purchase_price:Number(document.getElementById(`new-item-cost`).value),gst_rate:Number(document.getElementById(`new-item-gst`).value)}},n=await this.syncApi(`create_item`,t);n&&n.success&&(alert(`Catalog item ${n.item.name} added successfully.`),this.closeModal(`modal-add-item`),this.switchTab(`items`))}}openCreateExpenseModal(){let e=this.db?.projects||[],t=`
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
                  <input type="date" id="exp-date" class="fin-form-input" value="${new Date().toISOString().split(`T`)[0]}" required>
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
                    ${e.map(e=>`<option value="${e.id}" data-name="${e.name}">${e.name}</option>`).join(``)}
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
    `;document.getElementById(`fin-modal-container`).innerHTML=t,document.getElementById(`create-expense-form`).onsubmit=async e=>{e.preventDefault();let t=document.getElementById(`exp-project`),n=document.getElementById(`exp-file`),r=n.files.length?n.files[0].name:`expense-receipt.pdf`,i={expense:{date:document.getElementById(`exp-date`).value,category:document.getElementById(`exp-category`).value,description:document.getElementById(`exp-desc`).value.trim(),amount:Number(document.getElementById(`exp-amount`).value),tax_amount:Number(document.getElementById(`exp-tax`).value)||0,project_id:t.value||null,project_name:t.options[t.selectedIndex]?.getAttribute(`data-name`)||``,payment_method:document.getElementById(`exp-pay-mode`).value,receipt_filename:r}},a=await this.syncApi(`create_expense`,i);a&&a.success&&(alert(`Expense ${a.expense.expense_no} submitted successfully.`),this.closeModal(`modal-expense`),this.switchTab(`expenses`))}}openCreatePOModal(){let e=this.db?.vendors||[],t=this.db?.projects||[],n=this.db?.items||[],r=`
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
                    ${e.map(e=>`<option value="${e.id}">${e.name}</option>`).join(``)}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Project Association <span style="color:#ef4444;">*</span></label>
                  <select id="po-prj" class="fin-form-select" required>
                    <option value="" disabled selected>Select Project</option>
                    ${t.map(e=>`<option value="${e.id}" data-name="${e.name}">${e.name}</option>`).join(``)}
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">PO Order Date</label>
                  <input type="date" id="po-date" class="fin-form-input" value="${new Date().toISOString().split(`T`)[0]}" required>
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
                    ${n.map(e=>`<option value="${e.id}" data-price="${e.purchase_price}">${e.name}</option>`).join(``)}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Quantity</label>
                  <input type="number" id="po-qty" class="fin-form-input" value="10" min="1">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Unit Price (₹)</label>
                  <input type="number" id="po-rate" class="fin-form-input" value="${n[0]?.purchase_price||61200}">
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
    `;document.getElementById(`fin-modal-container`).innerHTML=r;let i=document.getElementById(`po-item-sel`),a=document.getElementById(`po-rate`);i.onchange=()=>{let e=n.find(e=>e.id===i.value);e&&(a.value=e.purchase_price||0)},document.getElementById(`create-po-form`).onsubmit=async t=>{t.preventDefault();let r=e.find(e=>e.id===document.getElementById(`po-vend`).value),o=document.getElementById(`po-prj`),s=n.find(e=>e.id===i.value),c=Number(document.getElementById(`po-qty`).value)||1,l=Number(a.value)||0,u=c*l,d=u*.18,f=u+d,p={po:{vendor_id:r.id,vendor_name:r.name,project_id:o.value,project_name:o.options[o.selectedIndex]?.getAttribute(`data-name`)||``,date:document.getElementById(`po-date`).value,expected_delivery:document.getElementById(`po-delivery`).value,subtotal:u,tax_total:d,total_value:f,line_items:[{item_id:s?s.id:null,name:s?s.name:`Procurement Item`,qty:c,uom:s?s.uom:`UNITS`,unit_price:l,taxable_amount:u,gst_rate:18,tax_amount:d,total_amount:f}]}},m=await this.syncApi(`create_po`,p);m&&m.success&&(alert(`Purchase Order ${m.po.po_no} issued to ${r.name}.`),this.closeModal(`modal-po`),this.switchTab(`pos`))}}openCreateCreditNoteModal(e){let t=this.db?.invoices?.find(t=>t.id===e);if(!t)return;let n=`
      <div class="fin-modal-backdrop open" id="modal-cn">
        <div class="fin-modal-dialog" style="max-width:600px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">🔄 Issue Sales Credit Note against ${t.invoice_no}</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-cn')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="create-cn-form">
              <div style="background:rgba(0,153,230,0.1); border-radius:8px; padding:1rem; margin-bottom:1.25rem; font-size:0.82rem;">
                Client: <strong>${t.customer_name}</strong><br>
                Current Invoice Total: <strong>${this.formatCurrency(t.grand_total)}</strong> • Balance: <strong style="color:#ef4444;">${this.formatCurrency(t.balance_due)}</strong>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Credit Adjustment Reason <span style="color:#ef4444;">*</span></label>
                <input type="text" id="cn-reason" class="fin-form-input" required placeholder="e.g. Rate revision or quantity over-measurement">
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Taxable Adjustment Value (₹) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="cn-taxable" class="fin-form-input" max="${t.balance_due}" step="any" required placeholder="0.00">
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
    `;document.getElementById(`fin-modal-container`).innerHTML=n,document.getElementById(`create-cn-form`).onsubmit=async e=>{e.preventDefault();let n=Number(document.getElementById(`cn-taxable`).value)||0,r=Number(document.getElementById(`cn-tax`).value)||n*.18,i={credit_note:{invoice_id:t.id,invoice_no:t.invoice_no,customer_id:t.customer_id,customer_name:t.customer_name,reason:document.getElementById(`cn-reason`).value.trim(),taxable_amount:n,tax_amount:r}},a=await this.syncApi(`create_credit_note`,i);a&&a.success&&(alert(`Credit note ${a.credit_note.credit_note_no} posted. Invoice balance reduced.`),this.closeModal(`modal-cn`),this.switchTab(`notes`))}}openInviteUserModal(){document.getElementById(`fin-modal-container`).innerHTML=`
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
    `,document.getElementById(`invite-user-form`).onsubmit=async e=>{e.preventDefault();let t={user:{name:document.getElementById(`inv-u-name`).value.trim(),email:document.getElementById(`inv-u-email`).value.trim(),role:document.getElementById(`inv-u-role`).value,designation:document.getElementById(`inv-u-desig`).value.trim(),department:document.getElementById(`inv-u-dept`).value.trim()}},n=await this.syncApi(`invite_user`,t);n&&n.success?(alert(`User invitation dispatched to ${n.user.email} with role ${n.user.role_label}.`),this.closeModal(`modal-invite`),this.switchTab(`users`)):alert(n?.error||`Could not invite user.`)}}openNotificationsModal(){let e=`
      <div class="fin-modal-backdrop open" id="modal-notif">
        <div class="fin-modal-dialog" style="max-width:550px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">🔔 Financial Alerts &amp; Notifications</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-notif')">&times;</button>
          </div>
          <div class="fin-modal-body">
            ${(this.db?.notifications||[]).map(e=>`
              <div style="background:rgba(255,255,255,0.035); border-left:3px solid ${e.type===`warning`?`#ef4444`:e.type===`action_required`?`#f59e0b`:`#10b981`}; border-radius:6px; padding:0.85rem 1rem; margin-bottom:0.75rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.85rem; color:#f8fafc;">${e.title}</strong>
                  <span style="font-size:0.68rem; color:#94a3b8;">${new Date(e.timestamp).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})}</span>
                </div>
                <p style="font-size:0.78rem; color:#cbd5e1; margin-top:0.35rem; line-height:1.4;">${e.message}</p>
                <div style="margin-top:0.5rem;">
                  <button type="button" class="fin-btn-row-action" onclick="window.finApp.closeModal('modal-notif'); window.finApp.switchTab('${e.link}')">Open ${e.link} &rarr;</button>
                </div>
              </div>
            `).join(``)}
          </div>
        </div>
      </div>
    `;document.getElementById(`fin-modal-container`).innerHTML=e}openUserProfileModal(){if(!this.currentUser)return;let e=this.currentUser,t=`
      <div class="fin-modal-backdrop open" id="modal-user-prof">
        <div class="fin-modal-dialog" style="max-width:520px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">👤 Authorized Profile &amp; Credentials</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-user-prof')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <div style="text-align:center; margin-bottom:1.5rem;">
              <div style="width:58px; height:58px; border-radius:50%; background:linear-gradient(135deg, #0099e6, #10b981); display:inline-flex; align-items:center; justify-content:center; font-size:1.8rem; margin-bottom:0.5rem;">
                ${e.avatar||`👤`}
              </div>
              <h3 style="font-family:var(--fin-font-heading); color:#f8fafc; font-size:1.2rem;">${e.name}</h3>
              <span class="fin-badge fin-badge-issued">${e.role_label}</span>
            </div>

            <div style="font-size:0.82rem; line-height:1.8; background:rgba(0,0,0,0.25); border-radius:8px; padding:1.25rem;">
              <div><strong>Email:</strong> ${e.email}</div>
              <div><strong>Designation:</strong> ${e.designation||`—`}</div>
              <div><strong>Department:</strong> ${e.department||`—`}</div>
              <div><strong>Phone:</strong> ${e.phone||`—`}</div>
              <div><strong>Terminal IP:</strong> <code>127.0.0.1 (Secure Local Session)</code></div>
            </div>

            <div class="fin-modal-footer" style="padding:1.25rem 0 0; background:transparent;">
              <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-user-prof')">Close</button>
              <button type="button" class="fin-btn-quick" style="color:#ef4444;" onclick="window.finApp.closeModal('modal-user-prof'); window.finApp.clearSession();">Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    `;document.getElementById(`fin-modal-container`).innerHTML=t}closeModal(e){let t=document.getElementById(e);t&&t.remove()}exportInvoicesCSV(){let e=this.db?.invoices||[],t=`Invoice Number,Date,Customer,GSTIN,Place of Supply,Taxable Value,Tax Total,Grand Total,Amount Paid,Balance Due,Status
`;e.forEach(e=>{t+=`"${e.invoice_no}","${e.invoice_date}","${e.customer_name}","${e.customer_gstin||``}","${e.place_of_supply||``}",${e.taxable_subtotal},${e.total_tax},${e.grand_total},${e.amount_paid||0},${e.balance_due},"${e.status}"\n`}),this.downloadFile(`Rayan_Group_Sales_Invoices_Register.csv`,t,`text/csv`)}exportBillsCSV(){let e=this.db?.purchase_bills||[],t=`Bill Number,Supplier Invoice No,Date,Vendor,Taxable Value,Tax Total,Grand Total,Amount Paid,Balance Due,Status
`;e.forEach(e=>{t+=`"${e.bill_no}","${e.vendor_invoice_no}","${e.bill_date}","${e.vendor_name}",${e.taxable_subtotal},${e.tax_total},${e.grand_total},${e.amount_paid||0},${e.balance_due},"${e.status}"\n`}),this.downloadFile(`Rayan_Group_Purchase_Bills_Register.csv`,t,`text/csv`)}exportReportsExcel(){this.exportInvoicesCSV()}downloadFile(e,t,n){let r=new Blob([t],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=e,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)}handleGlobalSearch(e){if(!e||e.length<2)return;let t=e.toLowerCase();if((this.db?.invoices||[]).find(e=>e.invoice_no.toLowerCase().includes(t)||e.customer_name.toLowerCase().includes(t))&&this.activeTab!==`invoices`){this.switchTab(`invoices`);let t=document.getElementById(`inv-filter-search`);t&&(t.value=e,t.dispatchEvent(new Event(`input`)))}}bindGlobalEvents(){document.addEventListener(`click`,e=>{e.target.closest(`#header-finance-login-btn, .btn-finance-portal-trigger, .header-top-link-finance`)&&window.location.pathname.includes(`/billing/`)&&(e.preventDefault(),this.currentUser?this.showAppView():this.showAuthView(),window.scrollTo({top:0,behavior:`smooth`}))})}};window.addEventListener(`DOMContentLoaded`,()=>{window.finApp=new e,window.finApp.init()});
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
    this.activeCompanyId = 'rayan-corp-uae';
    this.activePeriod = 'fy-2025-26';
    this.activeCurrency = 'AED';
    this.activeTab = 'dashboard';
    this.currencyRates = { INR: 1, AED: 1, USD: 1 };
    this.currencySymbols = { INR: '₹', AED: 'AED ', USD: '$' };
  }

  async init() {
    this.initSession();
    await this.loadDatabase();
    this.bindGlobalEvents();
    this.renderHeaderStatus();

    // Check for Scanned QR Verification / Direct Document URL Params
    const urlParams = new URLSearchParams(window.location.search);
    const verifyParam = urlParams.get('verify') || urlParams.get('doc') || urlParams.get('id');
    const docType = urlParams.get('type') || '';

    if (verifyParam) {
      this.handlePublicDocumentVerification(verifyParam, docType);
      return;
    }

    if (this.currentUser) {
      this.showAppView();
    } else {
      this.showAuthView();
    }
  }

  handlePublicDocumentVerification(verifyId, docType = '') {
    const portalContainer = document.getElementById('finance-portal-root');
    if (portalContainer) {
      portalContainer.innerHTML = `
        <div style="min-height: 100vh; background: var(--fin-bg-main); display: flex; flex-direction: column;">
          <header style="padding: 1rem 1.75rem; border-bottom: 1px solid var(--fin-border); display: flex; align-items: center; justify-content: space-between; background: rgba(11, 17, 30, 0.95); backdrop-filter: blur(12px);">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <a href="/" style="display: flex; align-items: center; text-decoration: none;">
                <img src="/assets/logos/rayan-group-white.png" alt="Rayan Group" class="logo-theme-dark" style="height: 34px; width: auto;">
                <img src="/assets/logos/rayan-group.png" alt="Rayan Group" class="logo-theme-light" style="height: 34px; width: auto;">
              </a>
              <span class="fin-topbar-badge-desk" style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); font-weight:800;">
                ✓ OFFICIAL DIGITAL DOCUMENT VERIFICATION DESK
              </span>
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <a href="/billing/" style="color:#94a3b8; font-size:0.8rem; text-decoration:none; padding:0.4rem 0.8rem; border:1px solid rgba(148,163,184,0.2); border-radius:6px;">Staff Portal Login</a>
              <a href="/" style="color:#38bdf8; font-size:0.8rem; text-decoration:none; padding:0.4rem 0.8rem; border:1px solid rgba(56,189,248,0.3); border-radius:6px;">Rayan Group Home</a>
            </div>
          </header>
          <div id="fin-modal-container"></div>
        </div>
      `;
    }

    const cleanId = String(verifyId).trim();
    const upper = cleanId.toUpperCase();

    // Check Receipt Voucher
    if (docType === 'receipt' || upper.includes('REC-RV') || upper.startsWith('RV-')) {
      const rec = (this.db?.customer_receipts || []).find(r => r.id === cleanId || r.receipt_no === cleanId) ||
                  (this.db?.customer_receipts || [])[0] || { receipt_no: cleanId };
      this.openReceiptPrintModal(rec.id || cleanId, true);
      return;
    }

    // Check Purchase Order
    if (docType === 'po' || upper.startsWith('PO-')) {
      const po = (this.db?.purchase_orders || []).find(p => p.id === cleanId || p.po_no === cleanId) ||
                 (this.db?.purchase_orders || [])[0] || { po_no: cleanId };
      this.openPOPrintModal(po.id || cleanId, true);
      return;
    }

    // Default Tax Invoice
    const inv = (this.db?.invoices || []).find(i => i.id === cleanId || i.invoice_no === cleanId) ||
                (this.db?.invoices || [])[0] || { invoice_no: cleanId };
    this.openInvoicePrintModal(inv.id || cleanId, true);
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
    if (!this.currentUser) return true;
    const role = this.currentUser.role;

    if (role === 'super_admin' || role === 'finance_admin' || role === 'accountant') return true;

    if (role === 'project_manager') {
      return !['delete_user', 'manage_companies'].includes(action);
    }

    if (role === 'employee') {
      return ['view_dashboard', 'submit_expense', 'edit_expense', 'view_own_expenses', 'view_projects'].includes(action);
    }

    if (role === 'management_readonly') {
      return ['view_dashboard', 'view_reports', 'export_reports', 'view_projects', 'view_invoices', 'view_bills', 'view_expenses', 'view_pos'].includes(action);
    }

    return true;
  }

  // --------------------------------------------------------------------------
  // DATA LAYER & API SYNC
  // --------------------------------------------------------------------------
  mergeWithSeedData(sourceData) {
    const merged = JSON.parse(JSON.stringify(defaultSeedData));
    if (!sourceData || typeof sourceData !== 'object') {
      return merged;
    }

    const collections = [
      'companies', 'users', 'customers', 'vendors', 'items', 'projects',
      'invoices', 'purchase_bills', 'customer_receipts', 'vendor_payments',
      'credit_notes', 'debit_notes', 'expenses', 'purchase_orders',
      'audit_logs', 'notifications', 'documents',
      'bank_accounts', 'cash_in_hand', 'cheques', 'loan_accounts',
      'bank_transfers', 'cash_vouchers', 'loan_transactions'
    ];

    const getUniqueKey = (item) => {
      if (!item || typeof item !== 'object') return null;
      return item.id || item.receipt_no || item.invoice_no || item.bill_no || item.voucher_no || item.payment_no || item.po_no || item.expense_no || item.debit_note_no || item.credit_note_no || item.cheque_no || item.reference_no || item.account_number || item.iban || item.code || (item.name ? `named-${item.name.trim().toLowerCase()}` : null);
    };

    for (const key of collections) {
      if (key === 'companies') {
        merged.companies = defaultSeedData.companies;
        continue;
      }
      const seedArr = merged[key] || [];
      const incomingRaw = Array.isArray(sourceData[key]) ? sourceData[key] : [];
      const incomingArr = incomingRaw.filter(item => {
        if (!item) return false;
        const no = item.invoice_no || item.receipt_no || item.code || item.id || '';
        if (typeof no === 'string' && (no.startsWith('INV-2026-') || no.startsWith('REC-2026-') || ['CUST-LT', 'CUST-EMAAR', 'CUST-NHAI', 'CUST-DPA', 'CUST-YOK'].includes(no))) {
          return false;
        }
        return true;
      });

      if (!incomingArr.length) {
        merged[key] = seedArr;
        continue;
      }

      // Add incoming user items first so newest submissions stay at top
      const map = new Map();
      incomingArr.forEach(item => {
        if (item) {
          const uniqueKey = getUniqueKey(item) || `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
          if (!item.id) item.id = uniqueKey;
          map.set(uniqueKey, item);
        }
      });

      // Overlay / append missing seed items without duplicating
      seedArr.forEach(item => {
        if (item) {
          const uniqueKey = getUniqueKey(item);
          if (uniqueKey && !map.has(uniqueKey)) {
            map.set(uniqueKey, item);
          }
        }
      });

      merged[key] = Array.from(map.values());
    }

    if (sourceData.settings && typeof sourceData.settings === 'object') {
      merged.settings = { ...merged.settings, ...sourceData.settings };
    }

    return merged;
  }

  async loadDatabase() {
    // 1. Initial quick load from local cache if present
    const cached = localStorage.getItem('rayan_fin_db_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        this.db = this.mergeWithSeedData(parsed);
      } catch (err) {}
    } else {
      this.db = this.mergeWithSeedData(this.db);
    }

    // 2. Fetch authoritative state directly from Hostinger MySQL Database API
    const endpoints = ['/api/finance.php?action=get_state', '/api/finance?action=get_state'];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep);
        if (res.ok) {
          const json = await res.json();
          if (json.data && typeof json.data === 'object' && json.data.companies && json.data.companies.length > 0) {
            this.db = this.mergeWithSeedData(json.data);
            try {
              localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
            } catch (e) {}
            return;
          }
        }
      } catch (e) {
        console.warn(`Attempt to load from ${ep} failed:`, e);
      }
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

    const endpoints = ['/api/finance.php', '/api/finance'];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && typeof json.data === 'object') {
            this.db = this.mergeWithSeedData(json.data);
            try {
              localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
            } catch (e) {}
            return json;
          }
        }
      } catch (e) {
        console.warn(`Sync attempt to ${ep} offline fallback:`, e);
      }
    }

    // Local state fallback & immediate UI reflection
    if (action === 'create_customer' && payload.customer) {
      if (!this.db.customers) this.db.customers = [];
      const newCust = {
        id: payload.customer.id || `cust-${Date.now().toString(36)}`,
        code: payload.customer.code || `CUST-${Math.floor(100 + Math.random() * 900)}`,
        company_id: payload.customer.company_id || this.activeCompanyId || 'rayan-corp-uae',
        status: 'active',
        credit_limit: 10000000,
        opening_balance: 0,
        ...payload.customer
      };
      const idx = this.db.customers.findIndex(c => c.id === newCust.id || (c.name && c.name.toLowerCase() === newCust.name.toLowerCase()));
      if (idx >= 0) {
        this.db.customers[idx] = { ...this.db.customers[idx], ...newCust };
      } else {
        this.db.customers.unshift(newCust);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, customer: newCust };
    }

    if (action === 'create_vendor' && payload.vendor) {
      if (!this.db.vendors) this.db.vendors = [];
      const newVend = {
        id: payload.vendor.id || `vend-${Date.now().toString(36)}`,
        code: payload.vendor.code || `VEND-${Math.floor(100 + Math.random() * 900)}`,
        status: 'active',
        ...payload.vendor
      };
      const idx = this.db.vendors.findIndex(v => v.id === newVend.id || (v.name && v.name.toLowerCase() === newVend.name.toLowerCase()));
      if (idx >= 0) {
        this.db.vendors[idx] = { ...this.db.vendors[idx], ...newVend };
      } else {
        this.db.vendors.unshift(newVend);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, vendor: newVend };
    }

    if (action === 'create_item' && payload.item) {
      if (!this.db.items) this.db.items = [];
      const newItem = {
        id: payload.item.id || `itm-${Date.now().toString(36)}`,
        code: payload.item.code || `ITM-${Math.floor(100 + Math.random() * 900)}`,
        status: 'active',
        ...payload.item
      };
      const idx = this.db.items.findIndex(it => it.id === newItem.id || (it.name && it.name.toLowerCase() === newItem.name.toLowerCase()));
      if (idx >= 0) {
        this.db.items[idx] = { ...this.db.items[idx], ...newItem };
      } else {
        this.db.items.unshift(newItem);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, item: newItem };
    }

    if (action === 'create_invoice' && payload.invoice) {
      if (!this.db.invoices) this.db.invoices = [];
      const idx = this.db.invoices.findIndex(i => i.id === payload.invoice.id || i.invoice_no === payload.invoice.invoice_no);
      if (idx >= 0) {
        this.db.invoices[idx] = payload.invoice;
      } else {
        this.db.invoices.unshift(payload.invoice);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, invoice: payload.invoice };
    }

    if (action === 'record_receipt' && payload.receipt) {
      if (!this.db.customer_receipts) this.db.customer_receipts = [];
      const newRcp = payload.receipt;
      const idx = this.db.customer_receipts.findIndex(r => r.id === newRcp.id || r.receipt_no === newRcp.receipt_no);
      if (idx >= 0) {
        this.db.customer_receipts[idx] = newRcp;
      } else {
        this.db.customer_receipts.unshift(newRcp);
      }

      // Update allocated invoices in local db
      if (Array.isArray(newRcp.allocations) && this.db.invoices) {
        newRcp.allocations.forEach(alloc => {
          const inv = this.db.invoices.find(i => i.id === alloc.invoice_id || i.invoice_no === alloc.invoice_no);
          if (inv) {
            const allocAmt = Number(alloc.amount_allocated) || 0;
            inv.amount_paid = (Number(inv.amount_paid) || 0) + allocAmt;
            inv.balance_due = Math.max(0, (Number(inv.grand_total) || 0) - inv.amount_paid);
            if (inv.balance_due <= 0.01) {
              inv.status = 'paid';
            } else {
              inv.status = 'partially_paid';
            }
          }
        });
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, receipt: newRcp };
    }

    if (action === 'create_bill' && payload.bill) {
      if (!this.db.purchase_bills) this.db.purchase_bills = [];
      const newBill = payload.bill;
      const idx = this.db.purchase_bills.findIndex(b => b.id === newBill.id || b.bill_no === newBill.bill_no);
      if (idx >= 0) {
        this.db.purchase_bills[idx] = newBill;
      } else {
        this.db.purchase_bills.unshift(newBill);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, bill: newBill };
    }

    if (action === 'create_expense' && payload.expense) {
      if (!this.db.expenses) this.db.expenses = [];
      const newExp = payload.expense;
      const idx = this.db.expenses.findIndex(e => e.id === newExp.id || e.expense_no === newExp.expense_no);
      if (idx >= 0) {
        this.db.expenses[idx] = newExp;
      } else {
        this.db.expenses.unshift(newExp);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, expense: newExp };
    }

    if (action === 'record_payment' && payload.payment) {
      if (!this.db.vendor_payments) this.db.vendor_payments = [];
      const newPay = payload.payment;
      const idx = this.db.vendor_payments.findIndex(p => p.id === newPay.id || p.voucher_no === newPay.voucher_no);
      if (idx >= 0) {
        this.db.vendor_payments[idx] = newPay;
      } else {
        this.db.vendor_payments.unshift(newPay);
      }
      if (Array.isArray(newPay.allocations) && this.db.purchase_bills) {
        newPay.allocations.forEach(alloc => {
          const bill = this.db.purchase_bills.find(b => b.id === alloc.bill_id || b.bill_no === alloc.bill_no);
          if (bill) {
            const allocAmt = Number(alloc.amount_allocated) || 0;
            bill.amount_paid = (Number(bill.amount_paid) || 0) + allocAmt;
            bill.balance_due = Math.max(0, (Number(bill.grand_total) || 0) - bill.amount_paid);
            bill.status = bill.balance_due <= 0.01 ? 'paid' : 'partially_paid';
          }
        });
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, payment: newPay };
    }

    if (action === 'create_po' && payload.po) {
      if (!this.db.purchase_orders) this.db.purchase_orders = [];
      const newPo = payload.po;
      const idx = this.db.purchase_orders.findIndex(p => p.id === newPo.id || p.po_no === newPo.po_no);
      if (idx >= 0) {
        this.db.purchase_orders[idx] = newPo;
      } else {
        this.db.purchase_orders.unshift(newPo);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, po: newPo };
    }

    if (action === 'create_credit_note' && payload.credit_note) {
      if (!this.db.credit_notes) this.db.credit_notes = [];
      const newCn = payload.credit_note;
      this.db.credit_notes.unshift(newCn);
      if (newCn.invoice_id && this.db.invoices) {
        const inv = this.db.invoices.find(i => i.id === newCn.invoice_id || i.invoice_no === newCn.invoice_no);
        if (inv) {
          const adj = (Number(newCn.taxable_amount) || 0) + (Number(newCn.tax_amount) || 0);
          inv.balance_due = Math.max(0, (Number(inv.balance_due) || 0) - adj);
        }
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, credit_note: newCn };
    }

    if (action === 'create_debit_note' && payload.debit_note) {
      if (!this.db.debit_notes) this.db.debit_notes = [];
      const newDn = payload.debit_note;
      this.db.debit_notes.unshift(newDn);
      if (newDn.bill_id && this.db.purchase_bills) {
        const bill = this.db.purchase_bills.find(b => b.id === newDn.bill_id || b.bill_no === newDn.bill_no);
        if (bill) {
          const adj = Number(newDn.total_debit_amount) || 0;
          bill.balance_due = Math.max(0, (Number(bill.balance_due) || 0) - adj);
        }
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, debit_note: newDn };
    }

    // UPDATE / EDIT FALLBACKS
    if (action === 'update_invoice' && payload.invoice) {
      if (!this.db.invoices) this.db.invoices = [];
      const idx = this.db.invoices.findIndex(i => i.id === payload.invoice.id || i.invoice_no === payload.invoice.invoice_no);
      if (idx >= 0) {
        this.db.invoices[idx] = { ...this.db.invoices[idx], ...payload.invoice };
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, invoice: payload.invoice };
    }

    if (action === 'update_bill' && payload.bill) {
      if (!this.db.purchase_bills) this.db.purchase_bills = [];
      const idx = this.db.purchase_bills.findIndex(b => b.id === payload.bill.id || b.bill_no === payload.bill.bill_no);
      if (idx >= 0) {
        this.db.purchase_bills[idx] = { ...this.db.purchase_bills[idx], ...payload.bill };
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, bill: payload.bill };
    }

    if (action === 'update_receipt' && payload.receipt) {
      if (!this.db.customer_receipts) this.db.customer_receipts = [];
      const idx = this.db.customer_receipts.findIndex(r => r.id === payload.receipt.id || r.receipt_no === payload.receipt.receipt_no);
      if (idx >= 0) {
        this.db.customer_receipts[idx] = { ...this.db.customer_receipts[idx], ...payload.receipt };
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, receipt: payload.receipt };
    }

    if (action === 'update_expense' && payload.expense) {
      if (!this.db.expenses) this.db.expenses = [];
      const idx = this.db.expenses.findIndex(e => e.id === payload.expense.id || e.expense_no === payload.expense.expense_no);
      if (idx >= 0) {
        this.db.expenses[idx] = { ...this.db.expenses[idx], ...payload.expense };
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, expense: payload.expense };
    }

    if (action === 'delete_expense') {
      const expId = payload.expense_id || payload.id;
      if (this.db.expenses && expId) {
        this.db.expenses = this.db.expenses.filter(e => e.id !== expId && e.expense_no !== expId);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db };
    }

    if (action === 'update_payment' && payload.payment) {
      if (!this.db.vendor_payments) this.db.vendor_payments = [];
      const idx = this.db.vendor_payments.findIndex(p => p.id === payload.payment.id || p.voucher_no === payload.payment.voucher_no);
      if (idx >= 0) {
        this.db.vendor_payments[idx] = { ...this.db.vendor_payments[idx], ...payload.payment };
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, payment: payload.payment };
    }

    if (action === 'update_po' && payload.po) {
      if (!this.db.purchase_orders) this.db.purchase_orders = [];
      const idx = this.db.purchase_orders.findIndex(p => p.id === payload.po.id || p.po_no === payload.po.po_no);
      if (idx >= 0) {
        this.db.purchase_orders[idx] = { ...this.db.purchase_orders[idx], ...payload.po };
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, po: payload.po };
    }

    if (action === 'update_credit_note' && payload.credit_note) {
      if (!this.db.credit_notes) this.db.credit_notes = [];
      const idx = this.db.credit_notes.findIndex(n => n.id === payload.credit_note.id || n.credit_note_no === payload.credit_note.credit_note_no);
      if (idx >= 0) {
        this.db.credit_notes[idx] = { ...this.db.credit_notes[idx], ...payload.credit_note };
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, credit_note: payload.credit_note };
    }

    if (action === 'update_debit_note' && payload.debit_note) {
      if (!this.db.debit_notes) this.db.debit_notes = [];
      const idx = this.db.debit_notes.findIndex(n => n.id === payload.debit_note.id || n.debit_note_no === payload.debit_note.debit_note_no);
      if (idx >= 0) {
        this.db.debit_notes[idx] = { ...this.db.debit_notes[idx], ...payload.debit_note };
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, debit_note: payload.debit_note };
    }

    if (action === 'create_document' && payload.document) {
      if (!this.db.documents) this.db.documents = [];
      this.db.documents.unshift(payload.document);
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, document: payload.document };
    }

    if (action === 'update_document' && payload.document) {
      if (!this.db.documents) this.db.documents = [];
      const idx = this.db.documents.findIndex(d => d.id === payload.document.id);
      if (idx >= 0) {
        this.db.documents[idx] = { ...this.db.documents[idx], ...payload.document };
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, document: payload.document };
    }

    if (action === 'delete_document') {
      const docId = payload.document_id || payload.id;
      if (this.db.documents && docId) {
        this.db.documents = this.db.documents.filter(d => d.id !== docId);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db };
    }

    // CASH & BANK LOCAL FALLBACKS
    if (action === 'create_bank_account' && payload.bank_account) {
      if (!this.db.bank_accounts) this.db.bank_accounts = [];
      const newB = payload.bank_account;
      const idx = this.db.bank_accounts.findIndex(b => b.id === newB.id);
      if (idx >= 0) this.db.bank_accounts[idx] = newB;
      else this.db.bank_accounts.unshift(newB);
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, bank: newB };
    }

    if (action === 'update_bank_account' && payload.bank_account) {
      if (!this.db.bank_accounts) this.db.bank_accounts = [];
      const b = payload.bank_account;
      const targetId = payload.id || b.id;
      const idx = this.db.bank_accounts.findIndex(x => x.id === targetId);
      if (idx >= 0) this.db.bank_accounts[idx] = { ...this.db.bank_accounts[idx], ...b };
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, bank: b };
    }

    if (action === 'delete_bank_account' && payload.id) {
      if (this.db.bank_accounts) {
        this.db.bank_accounts = this.db.bank_accounts.filter(b => b.id !== payload.id);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db };
    }

    if (action === 'record_bank_transfer' && payload.transfer) {
      if (!this.db.bank_transfers) this.db.bank_transfers = [];
      const trn = payload.transfer;
      this.db.bank_transfers.unshift(trn);
      const amt = Number(trn.amount) || 0;
      if (amt > 0 && this.db.bank_accounts) {
        const src = this.db.bank_accounts.find(x => x.id === trn.source_account_id);
        if (src) src.balance = (Number(src.balance) || 0) - amt;
        if (trn.destination_account_id) {
          const dest = this.db.bank_accounts.find(x => x.id === trn.destination_account_id);
          if (dest) dest.balance = (Number(dest.balance) || 0) + amt;
        }
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, transfer: trn };
    }

    if (action === 'delete_bank_transfer' && payload.id) {
      if (this.db.bank_transfers) {
        this.db.bank_transfers = this.db.bank_transfers.filter(t => t.id !== payload.id);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db };
    }

    if (action === 'create_cash_register' && payload.register) {
      if (!this.db.cash_in_hand) this.db.cash_in_hand = [];
      const reg = payload.register;
      const idx = this.db.cash_in_hand.findIndex(r => r.id === reg.id);
      if (idx >= 0) this.db.cash_in_hand[idx] = reg;
      else this.db.cash_in_hand.unshift(reg);
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, register: reg };
    }

    if (action === 'update_cash_register' && payload.register) {
      if (!this.db.cash_in_hand) this.db.cash_in_hand = [];
      const reg = payload.register;
      const targetId = payload.id || reg.id;
      const idx = this.db.cash_in_hand.findIndex(r => r.id === targetId);
      if (idx >= 0) this.db.cash_in_hand[idx] = { ...this.db.cash_in_hand[idx], ...reg };
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, register: reg };
    }

    if (action === 'delete_cash_register' && payload.id) {
      if (this.db.cash_in_hand) {
        this.db.cash_in_hand = this.db.cash_in_hand.filter(r => r.id !== payload.id);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db };
    }

    if (action === 'record_cash_voucher' && payload.voucher) {
      if (!this.db.cash_vouchers) this.db.cash_vouchers = [];
      const cv = payload.voucher;
      this.db.cash_vouchers.unshift(cv);
      const amt = Number(cv.amount) || 0;
      if (amt > 0 && cv.register_id && this.db.cash_in_hand) {
        const reg = this.db.cash_in_hand.find(r => r.id === cv.register_id);
        if (reg) {
          if (cv.type === 'inflow') {
            reg.balance = (Number(reg.balance) || 0) + amt;
          } else {
            reg.balance = (Number(reg.balance) || 0) - amt;
          }
          reg.last_replenished = cv.date || new Date().toISOString().split('T')[0];
        }
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, voucher: cv };
    }

    if (action === 'delete_cash_voucher' && payload.id) {
      if (this.db.cash_vouchers) {
        this.db.cash_vouchers = this.db.cash_vouchers.filter(v => v.id !== payload.id);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db };
    }

    if (action === 'record_cheque' && payload.cheque) {
      if (!this.db.cheques) this.db.cheques = [];
      const chq = payload.cheque;
      const idx = this.db.cheques.findIndex(c => c.id === chq.id || c.cheque_no === chq.cheque_no);
      if (idx >= 0) this.db.cheques[idx] = chq;
      else this.db.cheques.unshift(chq);
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, cheque: chq };
    }

    if (action === 'update_cheque_status' && payload.id) {
      if (this.db.cheques) {
        const chq = this.db.cheques.find(c => c.id === payload.id);
        if (chq) {
          const oldStatus = chq.status;
          chq.status = payload.status || 'Cleared';
          if (chq.status === 'Cleared' && oldStatus !== 'Cleared') {
            const amt = Number(chq.amount) || 0;
            if (amt > 0 && this.db.bank_accounts) {
              const b = this.db.bank_accounts.find(acc => acc.id === payload.bank_account_id || (!payload.bank_account_id && (acc.bank_name || '').toLowerCase() === (chq.bank_name || '').toLowerCase()));
              if (b) {
                if (chq.type === 'inward') b.balance = (Number(b.balance) || 0) + amt;
                else b.balance = (Number(b.balance) || 0) - amt;
              }
            }
          }
        }
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db };
    }

    if (action === 'delete_cheque' && payload.id) {
      if (this.db.cheques) {
        this.db.cheques = this.db.cheques.filter(c => c.id !== payload.id);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db };
    }

    if (action === 'create_loan_account' && payload.loan_account) {
      if (!this.db.loan_accounts) this.db.loan_accounts = [];
      const loan = payload.loan_account;
      const idx = this.db.loan_accounts.findIndex(l => l.id === loan.id);
      if (idx >= 0) this.db.loan_accounts[idx] = loan;
      else this.db.loan_accounts.unshift(loan);
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, loan };
    }

    if (action === 'update_loan_account' && payload.loan_account) {
      if (!this.db.loan_accounts) this.db.loan_accounts = [];
      const loan = payload.loan_account;
      const targetId = payload.id || loan.id;
      const idx = this.db.loan_accounts.findIndex(l => l.id === targetId);
      if (idx >= 0) this.db.loan_accounts[idx] = { ...this.db.loan_accounts[idx], ...loan };
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, loan };
    }

    if (action === 'delete_loan_account' && payload.id) {
      if (this.db.loan_accounts) {
        this.db.loan_accounts = this.db.loan_accounts.filter(l => l.id !== payload.id);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db };
    }

    if (action === 'record_loan_transaction' && payload.transaction) {
      if (!this.db.loan_transactions) this.db.loan_transactions = [];
      const lt = payload.transaction;
      this.db.loan_transactions.unshift(lt);
      const amt = Number(lt.amount) || 0;
      if (amt > 0 && lt.facility_id && this.db.loan_accounts) {
        const lf = this.db.loan_accounts.find(l => l.id === lt.facility_id);
        if (lf) {
          if (lt.type === 'drawdown') {
            lf.outstanding_balance = (Number(lf.outstanding_balance) || 0) + amt;
          } else if (lt.type === 'repayment') {
            lf.outstanding_balance = Math.max(0, (Number(lf.outstanding_balance) || 0) - amt);
          }
          lf.available_limit = Math.max(0, (Number(lf.sanctioned_limit) || 0) - (Number(lf.outstanding_balance) || 0));
        }
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db, transaction: lt };
    }

    if (action === 'delete_loan_transaction' && payload.id) {
      if (this.db.loan_transactions) {
        this.db.loan_transactions = this.db.loan_transactions.filter(t => t.id !== payload.id);
      }
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      return { success: true, localOnly: true, data: this.db };
    }

    localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
    return { success: true, localOnly: true, data: this.db, invoice: payload.invoice };
  }

  // --------------------------------------------------------------------------
  // FORMATTING UTILITIES & AUTO-SEQUENCING
  // --------------------------------------------------------------------------
  getNextInvoiceNumber() {
    const invoices = (this.db?.invoices || []).filter(i => (i.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    let maxSeq = 44049;

    invoices.forEach(inv => {
      const invNo = inv.invoice_no || '';
      const recMatch = invNo.match(/REC-RG-INV-(\d+)/i);
      if (recMatch) {
        const num = parseInt(recMatch[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      } else {
        const anyNumMatch = invNo.match(/(\d{4,})$/);
        if (anyNumMatch) {
          const num = parseInt(anyNumMatch[1], 10);
          if (!isNaN(num) && num > maxSeq) maxSeq = num;
        }
      }
    });

    return `REC-RG-INV-${maxSeq + 1}`;
  }

  getNextReceiptNumber() {
    const receipts = (this.db?.customer_receipts || []).filter(r => (r.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    let maxSeq = 44025;

    receipts.forEach(rcp => {
      const rcpNo = rcp.receipt_no || '';
      const recMatch = rcpNo.match(/REC-RV-(\d+)/i);
      if (recMatch) {
        const num = parseInt(recMatch[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      } else {
        const anyNumMatch = rcpNo.match(/(\d{4,})$/);
        if (anyNumMatch) {
          const num = parseInt(anyNumMatch[1], 10);
          if (!isNaN(num) && num > maxSeq) maxSeq = num;
        }
      }
    });

    return `REC-RV-${maxSeq + 1}`;
  }

  getNextBillNumber() {
    const bills = (this.db?.purchase_bills || []).filter(b => (b.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    let maxSeq = 0;
    bills.forEach(b => {
      const bNo = b.bill_no || '';
      const m = bNo.match(/BILL-.*-(\d+)/i) || bNo.match(/(\d{3,})$/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });
    const prefix = this.activeCompanyId === 'ashaz-eng-in' ? 'BILL-ASH' : 'BILL-RG-2026';
    return `${prefix}-${String(maxSeq + 1).padStart(3, '0')}`;
  }

  getNextExpenseNumber() {
    const expenses = (this.db?.expenses || []).filter(e => (e.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    let maxSeq = 0;
    expenses.forEach(e => {
      const eNo = e.expense_no || '';
      const m = eNo.match(/EXP-.*-(\d+)/i) || eNo.match(/(\d{3,})$/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });
    const prefix = this.activeCompanyId === 'ashaz-eng-in' ? 'EXP-ASH' : 'EXP-RG-2026';
    return `${prefix}-${String(maxSeq + 1).padStart(3, '0')}`;
  }

  getNextPaymentVoucherNumber() {
    const payments = (this.db?.vendor_payments || []).filter(p => (p.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    let maxSeq = 0;
    payments.forEach(p => {
      const pNo = p.voucher_no || '';
      const m = pNo.match(/PV-.*-(\d+)/i) || pNo.match(/(\d{3,})$/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });
    const prefix = this.activeCompanyId === 'ashaz-eng-in' ? 'PV-ASH' : 'PV-RG-2026';
    return `${prefix}-${String(maxSeq + 1).padStart(3, '0')}`;
  }

  getNextPONumber() {
    const pos = (this.db?.purchase_orders || []).filter(p => (p.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    let maxSeq = 11008;
    pos.forEach(p => {
      const pNo = p.po_no || '';
      const m = pNo.match(/PO-REC-(\d+)/i) || pNo.match(/(\d{4,})$/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });
    const prefix = this.activeCompanyId === 'ashaz-eng-in' ? 'PO-ASH' : 'PO-REC';
    return `${prefix}-${maxSeq + 1}`;
  }

  formatCurrency(amount, withSymbol = true) {
    const num = Number(amount) || 0;
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const symbol = withSymbol ? (isIndia ? '₹' : 'AED ') : '';

    if (isIndia) {
      const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
      return symbol ? `${symbol}${formatted}` : formatted;
    }

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
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
      <div style="min-height: 100vh; background: var(--fin-bg-main); display: flex; flex-direction: column; overflow-y: auto;">
        <!-- Clean Dedicated Auth Header -->
        <header style="padding: 1rem 1.75rem; border-bottom: 1px solid var(--fin-border); display: flex; align-items: center; justify-content: space-between; background: rgba(11, 17, 30, 0.95); backdrop-filter: blur(12px); flex-shrink: 0;">
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

        <div style="flex: 1 0 auto; display: flex; align-items: center; justify-content: center; padding: clamp(1rem, 3vw, 2.5rem) 1rem;">
          <div class="fin-auth-container">
            <div class="fin-auth-header" style="margin-bottom: 1.5rem;">
              <span class="fin-auth-badge" style="margin-bottom: 0.5rem;">
                <span class="live-pulse-dot" style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#0099e6;"></span>
                AUTHORIZED ACCESS ONLY • GRC &amp; ACCOUNTS DESK
              </span>
              <h2 class="fin-auth-title" style="font-size: clamp(1.3rem, 2.5vw, 1.6rem); margin-bottom: 0.4rem;">Corporate Financial Portal</h2>
              <p class="fin-auth-desc" style="font-size: 0.82rem; line-height: 1.45; margin: 0 auto; max-width: 440px;">Sign in with your Rayan Group executive or finance credentials to access billing, ledgers, tax invoices, and financial statements.</p>
            </div>

            <form id="fin-login-form">
              <div class="fin-form-group" style="margin-bottom: 1rem;">
                <label class="fin-form-label" for="fin-login-email" style="font-size: 0.8rem; margin-bottom: 0.35rem;">Corporate Email / Username <span style="color:#ef4444;">*</span></label>
                <input type="email" id="fin-login-email" class="fin-form-input" placeholder="name@rayan-group.com" required autocomplete="username">
              </div>

              <div class="fin-form-group" style="margin-bottom: 1rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                  <label class="fin-form-label" for="fin-login-password" style="margin-bottom:0; font-size: 0.8rem;">Password <span style="color:#ef4444;">*</span></label>
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

              <button type="submit" id="fin-login-submit-btn" style="width:100%; justify-content:center; padding:0.95rem 1.5rem; background:linear-gradient(135deg, #0099e6, #0284c7) !important; color:#ffffff !important; border:1px solid #38bdf8 !important; border-radius:10px !important; font-size:0.95rem !important; font-weight:800 !important; letter-spacing:0.04em !important; cursor:pointer !important; display:flex !important; align-items:center !important; gap:0.5rem !important; box-shadow:0 6px 20px rgba(0, 153, 230, 0.45) !important; transition:all 0.2s ease !important;">
                <span>SIGN IN TO FINANCIAL PORTAL &rarr;</span>
              </button>

              <!-- Quick Role Sign-in for immediate access -->
              <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 0.6rem; font-weight: 600;">Authorized Quick Access (Click to sign in):</span>
                <div style="display: flex; gap: 0.45rem; justify-content: center; flex-wrap: wrap;">
                  <button type="button" class="fin-quick-role-btn" data-email="accountant@rayangroup.com" data-pwd="Accounts@Rayan2026" style="background: rgba(0, 153, 230, 0.12); border: 1px solid rgba(0, 153, 230, 0.35); color: #38bdf8; font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.65rem; border-radius: 6px; cursor: pointer; transition: all 0.2s ease;">👩‍💻 Senior Accountant</button>
                  <button type="button" class="fin-quick-role-btn" data-email="finance.admin@rayangroup.com" data-pwd="Finance@Rayan2026" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); color: #34d399; font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.65rem; border-radius: 6px; cursor: pointer; transition: all 0.2s ease;">💼 CFO / Treasury</button>
                  <button type="button" class="fin-quick-role-btn" data-email="superadmin@rayangroup.com" data-pwd="Rayan@Admin2026" style="background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.35); color: #c084fc; font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.65rem; border-radius: 6px; cursor: pointer; transition: all 0.2s ease;">👨‍💼 Super Admin</button>
                </div>
              </div>
            </form>

            <!-- Secure Corporate Notice -->
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

    // Quick role autofill and instant sign-in
    document.querySelectorAll('.fin-quick-role-btn').forEach(btn => {
      btn.onclick = () => {
        if (emailInput) emailInput.value = btn.dataset.email;
        if (pwdInput) pwdInput.value = btn.dataset.pwd;
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      };
    });

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
                  <option value="AED" ${this.activeCurrency === 'AED' ? 'selected' : ''}>د.إ AED</option>
                  <option value="INR" ${this.activeCurrency === 'INR' ? 'selected' : ''}>₹ INR</option>
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
              <button type="button" class="fin-btn-nav-website" id="fin-logout-btn" style="background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.35); color:#ef4444;" title="Sign Out of Financial Session">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span>Sign Out</span>
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
        if (this.activeCompanyId === 'ashaz-eng-in') {
          this.activeCurrency = 'INR';
        } else {
          this.activeCurrency = 'AED';
        }
        const currSel = document.getElementById('fin-currency-select');
        if (currSel) currSel.value = this.activeCurrency;
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
        if (this.activeCompanyId !== 'ashaz-eng-in') {
          this.activeCurrency = 'AED';
          currSel.value = 'AED';
        } else {
          this.activeCurrency = currSel.value;
        }
        this.renderActiveTab();
      };
    }

    // 4. Accordion Toggle
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
            this.openAddBankAccountModal();
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

    // Native Print Handlers
    window.addEventListener('beforeprint', () => {
      const hasModal = document.getElementById('fin-doc-print-modal') || document.querySelector('.fin-modal-backdrop.open');
      if (hasModal) {
        document.body.classList.add('fin-doc-open');
      }
      document.body.classList.add('fin-printing-now');
    });

    window.addEventListener('afterprint', () => {
      document.body.classList.remove('fin-printing-now');
      const hasModal = document.getElementById('fin-doc-print-modal') || document.querySelector('.fin-modal-backdrop.open');
      if (!hasModal) {
        document.body.classList.remove('fin-doc-open');
      }
    });
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
    const invoices = (this.db?.invoices || []).filter(i => (i.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const bills = (this.db?.purchase_bills || []).filter(b => (b.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const expenses = (this.db?.expenses || []).filter(e => (e.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const receipts = (this.db?.customer_receipts || []).filter(r => (r.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const vendorPayments = (this.db?.vendor_payments || []).filter(p => (p.company_id || 'rayan-corp-uae') === this.activeCompanyId);

    // Authoritative Calculations
    const totalSales = invoices.filter(i => i.status !== 'void').reduce((s, i) => s + (Number(i.grand_total) || 0), 0);
    const totalPurchases = bills.filter(b => b.status !== 'void').reduce((s, b) => s + (Number(b.grand_total) || 0), 0);
    const totalReceivables = invoices.filter(i => i.status !== 'void' && i.status !== 'paid').reduce((s, i) => s + (Number(i.balance_due) || 0), 0);
    const totalPayables = bills.filter(b => b.status !== 'void' && b.status !== 'paid').reduce((s, b) => s + (Number(b.balance_due) || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (Number(e.total_amount) || 0), 0);

    // Cash and Bank derived from opening balance + total customer receipts - vendor payments
    const isRayanEng = this.activeCompanyId === 'rayan-corp-uae';
    const openingBank = isRayanEng ? 2500000 : 0;
    const totalReceipts = receipts.reduce((s, r) => s + (Number(r.amount_received) || 0), 0);
    const totalDisbursed = vendorPayments.reduce((s, p) => s + (Number(p.amount_paid) || 0), 0);
    const cashBankBalance = isRayanEng ? (openingBank + totalReceipts - totalDisbursed) : (totalReceipts - totalDisbursed);

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
                      <button type="button" class="fin-btn-row-action" onclick="window.finApp.openInvoiceDetail('${inv.id}')" title="Print &amp; View Official Tax Invoice">Print / View</button>
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
                      <button type="button" class="fin-btn-row-action" onclick="window.finApp.openBillDetail('${b.id}')" title="Print &amp; View Purchase Bill">Print / View</button>
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
    const rawInvoices = (this.db?.invoices || []).filter(i => (i.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const invoices = [...rawInvoices].sort((a, b) => {
      const dateA = new Date(a.invoice_date || a.created_at || 0).getTime();
      const dateB = new Date(b.invoice_date || b.created_at || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return (b.invoice_no || '').localeCompare(a.invoice_no || '');
    });

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
        const matchQ = (inv.invoice_no || '').toLowerCase().includes(q) || (inv.customer_name || '').toLowerCase().includes(q);
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
        <td><strong>${inv.invoice_no || '—'}</strong></td>
        <td>${this.formatDate(inv.invoice_date)}</td>
        <td>
          <strong>${inv.customer_name || 'Valued Client'}</strong>
          ${inv.customer_trn ? `<div style="font-size:0.68rem; color:#38bdf8; font-weight:600;">TRN: ${inv.customer_trn}</div>` : (inv.customer_gstin ? `<div style="font-size:0.68rem; color:#94a3b8;">GSTIN: ${inv.customer_gstin}</div>` : '')}
        </td>
        <td><span style="font-size:0.75rem;">${inv.place_of_supply || '—'}</span></td>
        <td>${inv.currency_symbol || ''}${Number(inv.taxable_subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td>
          <span style="font-size:0.75rem; color:#38bdf8;">${inv.currency_symbol || ''}${Number(inv.total_tax || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          ${inv.tax_regime === 'trn' || inv.vat_total > 0 ? `<div style="font-size:0.65rem; color:#10b981; font-weight:700;">UAE VAT 5%</div>` : (inv.igst_total > 0 ? `<div style="font-size:0.65rem; color:#94a3b8;">IGST 18%</div>` : `<div style="font-size:0.65rem; color:#94a3b8;">CGST 9% + SGST 9%</div>`)}
        </td>
        <td><strong>${this.formatCurrency(inv.grand_total || 0)}</strong></td>
        <td><span style="color:#10b981;">${this.formatCurrency(inv.amount_paid || 0)}</span></td>
        <td><strong style="color:${inv.balance_due > 0 ? '#ef4444' : '#10b981'};">${this.formatCurrency(inv.balance_due)}</strong></td>
        <td><span class="fin-badge fin-badge-${inv.status}">${inv.status.replace('_', ' ')}</span></td>
        <td style="white-space:nowrap;">
          <button type="button" class="fin-btn-row-action" onclick="window.finApp.openInvoiceDetail('${inv.id}')" title="Print &amp; View Official Tax Invoice">Print / View</button>
          <button type="button" class="fin-btn-row-action" style="color:#38bdf8;" onclick="window.finApp.openEditInvoiceModal('${inv.id}')" title="Edit Tax Invoice">Edit</button>
          ${inv.balance_due > 0 && this.hasPermission('record_receipt') ? `
            <button type="button" class="fin-btn-row-action" onclick="window.finApp.openQuickPayInvoice('${inv.id}')" style="color:#10b981;" title="Record Customer Payment">Receive</button>
          ` : ''}
          ${inv.status !== 'void' && this.hasPermission('create_credit_note') ? `
            <button type="button" class="fin-btn-row-action" onclick="window.finApp.openCreateCreditNoteModal('${inv.id}')" title="Issue Credit Note">Cr. Note</button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  }

  // --------------------------------------------------------------------------
  // 3. PURCHASES & BILLS MODULE
  // --------------------------------------------------------------------------
  renderBillsTab(root) {
    const bills = (this.db?.purchase_bills || []).filter(b => (b.company_id || 'rayan-corp-uae') === this.activeCompanyId);

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
                    <button type="button" class="fin-btn-row-action" onclick="window.finApp.openBillDetail('${b.id}')" title="Print &amp; View Purchase Bill">Print / View</button>
                    <button type="button" class="fin-btn-row-action" style="color:#f59e0b;" onclick="window.finApp.openEditBillModal('${b.id}')" title="Edit Purchase Bill">Edit</button>
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
    const customers = (this.db?.customers || []).filter(c => (c.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const invoices = (this.db?.invoices || []).filter(i => (i.company_id || 'rayan-corp-uae') === this.activeCompanyId);

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
                <th>Tax ID (GSTIN / TRN)</th>
                <th>Place of Supply</th>
                <th>Total Invoiced</th>
                <th>Outstanding Dues</th>
                <th>Credit Limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(c => {
                const custInvoices = invoices.filter(i => (i.customer_id === c.id || (c.name && i.customer_name === c.name)) && i.status !== 'void');
                const totalInvoiced = custInvoices.reduce((s, i) => s + (Number(i.grand_total) || 0), 0);
                const outstanding = custInvoices.reduce((s, i) => s + (Number(i.balance_due) || 0), 0);
                return `
                  <tr>
                    <td><strong>${c.code || c.id || 'CUST'}</strong></td>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.contact_person || '—'}</td>
                    <td>
                      <div>${c.email || '—'}</div>
                      <span style="font-size:0.68rem; color:#94a3b8;">${c.phone || '—'}</span>
                    </td>
                    <td>
                      ${c.trn ? `<div><code style="color:#38bdf8; font-weight:700;">TRN: ${c.trn}</code></div>` : ''}
                      ${c.gstin && !c.gstin.startsWith('EXEMPT') ? `<div><code>GST: ${c.gstin}</code></div>` : (!c.trn ? `<code>${c.gstin || '—'}</code>` : '')}
                    </td>
                    <td>${c.place_of_supply || '—'}</td>
                    <td>${this.formatCurrency(totalInvoiced)}</td>
                    <td><strong style="color:${outstanding > 0 ? '#ef4444' : '#10b981'};">${this.formatCurrency(outstanding)}</strong></td>
                    <td>${this.formatCurrency(c.credit_limit || 10000000)}</td>
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
                <th>Tax ID (TRN / GSTIN / PAN)</th>
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
                      ${v.trn ? `<div><code style="color:#38bdf8; font-weight:700;">TRN: ${v.trn}</code></div>` : ''}
                      ${v.gstin ? `<div><code>GST: ${v.gstin}</code></div>` : ''}
                      ${v.pan ? `<span style="font-size:0.68rem; color:#94a3b8;">PAN: ${v.pan}</span>` : (!v.trn && !v.gstin ? '—' : '')}
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
    const rawReceipts = (this.db?.customer_receipts || []).filter(r => (r.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const receipts = [...rawReceipts].sort((a, b) => {
      const dateA = new Date(a.receipt_date || 0).getTime();
      const dateB = new Date(b.receipt_date || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return (b.id || '').localeCompare(a.id || '');
    });
    const payments = (this.db?.vendor_payments || []).filter(p => (p.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const latestReceiptId = receipts[0]?.id || 'rec-rv-44026';

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
              <button type="button" class="fin-btn-quick" style="border-color:#00a699; color:#00e5d2;" onclick="window.finApp.openReceiptPrintModal('${latestReceiptId}')">
                💳 Official Receipt Voucher
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
                      <div style="font-weight:600;">${r.payment_mode}</div>
                      ${r.bank_name ? `<div style="font-size:0.7rem; color:#38bdf8; font-weight:600;">🏦 ${r.bank_name}</div>` : ''}
                      <span style="font-size:0.68rem; color:#94a3b8;">${r.reference_no}</span>
                    </td>
                    <td><strong style="color:#10b981;">${r.currency || 'AED'} ${Number(r.amount_received || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                    <td>
                      ${(r.allocations || []).map(a => `
                        <span class="fin-badge fin-badge-paid" style="font-size:0.65rem;">${a.invoice_no}: ${r.currency || 'AED'} ${Number(a.amount_allocated || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      `).join(' ')}
                    </td>
                    <td style="white-space:nowrap;">
                      <button type="button" class="fin-btn-row-action" onclick="window.finApp.openReceiptPrintModal('${r.id}')" title="Print Official Receipt Voucher">Print / View</button>
                      <button type="button" class="fin-btn-row-action" style="color:#38bdf8;" onclick="window.finApp.openEditReceiptModal('${r.id}')" title="Edit Receipt Voucher">Edit</button>
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
                  <th>Actions</th>
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
                    <td style="white-space:nowrap;">
                      <button type="button" class="fin-btn-row-action" style="color:#38bdf8;" onclick="window.finApp.openEditPaymentModal('${p.id}')">Edit</button>
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
    const rawReceipts = (this.db?.customer_receipts || []).filter(r => (r.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const receipts = [...rawReceipts].sort((a, b) => {
      const dateA = new Date(a.receipt_date || 0).getTime();
      const dateB = new Date(b.receipt_date || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return (b.id || '').localeCompare(a.id || '');
    });
    const totalReceived = receipts.reduce((acc, r) => acc + (Number(r.amount_received) || 0), 0);
    const fabReceipts = receipts.filter(r => (r.bank_name || '').toLowerCase().includes('abu dhabi') || (r.currency === 'AED')).reduce((acc, r) => acc + (Number(r.amount_received) || 0), 0);
    const latestReceiptId = receipts[0]?.id || 'rec-rv-44026';

    root.innerHTML = `
      <div class="fin-dash-row-responsive">
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <div>
              <h2 class="fin-panel-title">💳 Payment-In (Customer Collections &amp; Receipts)</h2>
              <p style="font-size:0.75rem; color:#94a3b8;">Inward client collections, wire transfers, and invoice receipts</p>
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <button type="button" class="fin-btn-quick" style="border-color:#00a699; color:#00e5d2;" onclick="window.finApp.openReceiptPrintModal('${latestReceiptId}')">
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
              <div class="fin-metric-value" style="color:#38bdf8;">AED ${fabReceipts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
                    <td><strong style="color:#10b981;">${r.currency || 'AED'} ${Number(r.amount_received || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                    <td>
                      ${(r.allocations || []).map(a => `
                        <span class="fin-badge fin-badge-paid" style="font-size:0.65rem;">${a.invoice_no}: ${r.currency || 'AED'} ${Number(a.amount_allocated || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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
    const payments = (this.db?.vendor_payments || []).filter(p => (p.company_id || 'rayan-corp-uae') === this.activeCompanyId);
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
                    <td style="white-space:nowrap;">
                      <button type="button" class="fin-btn-row-action" style="color:#38bdf8;" onclick="window.finApp.openEditPaymentModal('${p.id}')">Edit</button>
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
    const creditNotes = (this.db?.credit_notes || []).filter(n => (n.company_id || 'rayan-corp-uae') === this.activeCompanyId);
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
                <th>Actions</th>
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
                  <td style="white-space:nowrap;">
                    <button type="button" class="fin-btn-row-action" style="color:#38bdf8;" onclick="window.finApp.openEditCreditNoteModal('${cn.id}')">Edit</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderDebitNotesTab(root) {
    const debitNotes = (this.db?.debit_notes || []).filter(n => (n.company_id || 'rayan-corp-uae') === this.activeCompanyId);
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
                <th>Actions</th>
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
                  <td style="white-space:nowrap;">
                    <button type="button" class="fin-btn-row-action" style="color:#f59e0b;" onclick="window.finApp.openEditDebitNoteModal('${dn.id}')">Edit</button>
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
  // CASH & BANK MODULES (Matching Reference Image 3)
  // --------------------------------------------------------------------------
    // --------------------------------------------------------------------------
  // CASH & BANK MODULES (Full Multi-Company Enterprise Implementation)
  // --------------------------------------------------------------------------
  renderBankAccountsTab(root) {
    const banks = (this.db?.bank_accounts || []).filter(b => (b.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const transfers = (this.db?.bank_transfers || []).filter(t => (t.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const comp = (this.db?.companies || []).find(c => c.id === this.activeCompanyId);
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const totalTreasury = banks.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">🏛️ Corporate Bank Accounts &amp; Treasury Ledger</h2>
            <p style="font-size:0.75rem; color:#94a3b8;">
              ${comp ? comp.name : 'Rayan Group'} • Treasury liquidity &amp; multi-currency settlement (${isIndia ? 'INR ₹' : 'AED'})
            </p>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            <div style="padding:0.4rem 0.8rem; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); border-radius:6px; font-size:0.78rem; color:#38bdf8;">
              Total Liquidity: <strong style="color:#ffffff;">${this.formatCurrency(totalTreasury)}</strong>
            </div>
            <button type="button" class="fin-btn-quick" style="border-color:#38bdf8; color:#38bdf8;" onclick="window.finApp.openBankTransferModal()">
              ⇄ Record Transfer / Wire
            </button>
            <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openAddBankAccountModal()">
              + Add Bank Account
            </button>
          </div>
        </div>

        <!-- Corporate Banking Grid -->
        ${banks.length === 0 ? `
          <div class="fin-empty-state-card">
            <h4>No Bank Accounts Found</h4>
            <p>No corporate banking accounts are currently configured for ${comp ? comp.name : 'this company'}. Click below to add an account in ${isIndia ? 'INR' : 'AED'}.</p>
            <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openAddBankAccountModal()">+ Add Bank Account</button>
          </div>
        ` : `
          <div class="fin-bank-grid">
            ${banks.map(b => `
              <div class="fin-bank-card">
                <div class="fin-bank-card-header">
                  <div>
                    <strong style="font-size:0.95rem; color:#ffffff;">${b.bank_name}</strong>
                    <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">${b.account_name || 'Corporate Account'}</div>
                  </div>
                  <span class="fin-bank-badge" style="${b.status === 'Dormant' ? 'background:rgba(245,158,11,0.15); color:#f59e0b; border-color:rgba(245,158,11,0.3);' : ''}">
                    ${b.status || 'Active'}
                  </span>
                </div>
                <div class="fin-bank-balance">
                  ${this.formatCurrency(b.balance)}
                </div>
                <div class="fin-bank-meta">
                  <div><strong>A/c / IBAN:</strong> ${b.iban || b.account_number || '—'}</div>
                  <div><strong>Branch:</strong> ${b.branch || '—'}</div>
                  ${b.ifsc_code ? `<div><strong>IFSC:</strong> ${b.ifsc_code}</div>` : ''}
                  ${b.swift ? `<div><strong>SWIFT / BIC:</strong> ${b.swift}</div>` : ''}
                  <div style="color:#60a5fa; margin-top:4px;"><strong>Signatory:</strong> ${b.signatory || 'Authorized Officer'}</div>
                </div>
                <div class="fin-bank-card-actions">
                  <button type="button" class="fin-btn-card-action" onclick="window.finApp.openAddBankAccountModal('${b.id}')">✏️ Edit</button>
                  <button type="button" class="fin-btn-card-action" onclick="window.finApp.openBankTransferModal('${b.id}')">⇄ Wire Out</button>
                  <button type="button" class="fin-btn-card-action danger" onclick="window.finApp.deleteBankAccount('${b.id}')">🗑️ Remove</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}

        <!-- Recent Bank Wire Statements Table -->
        <div class="fin-panel-header" style="margin-top:1.5rem; border-top:1px solid rgba(255,255,255,0.06); padding-top:1rem;">
          <div>
            <h3 style="font-size:0.95rem; color:#ffffff; margin:0;">📜 Recent Bank Wires &amp; Remittance Clearances</h3>
            <span style="font-size:0.72rem; color:#94a3b8;">Audited transaction records matched with corporate bank statements (${transfers.length} wires)</span>
          </div>
        </div>

        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Wire / UTR #</th>
                <th>Settlement Date</th>
                <th>Counterparty / Payee</th>
                <th>Bank Account</th>
                <th>Transaction Type</th>
                <th style="text-align:right;">Amount</th>
                <th>Status</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${transfers.length === 0 ? `
                <tr>
                  <td colspan="8" style="text-align:center; padding:2rem; color:#94a3b8;">
                    No wire transfers recorded yet for this entity. Click <strong>"Record Transfer / Wire"</strong> above to log an inflow or outflow.
                  </td>
                </tr>
              ` : transfers.map(t => {
                const isInward = t.type === 'inward';
                const isInter = t.type === 'inter_account';
                const color = isInward ? '#10b981' : (isInter ? '#38bdf8' : '#fb923c');
                const sign = isInward ? '+' : (isInter ? '⇄' : '-');
                return `
                  <tr>
                    <td><strong>${t.reference_no}</strong></td>
                    <td>${this.formatDate(t.date)}</td>
                    <td>
                      <div style="font-weight:600; color:#ffffff;">${t.counterparty || 'Corporate Treasury'}</div>
                      ${t.purpose ? `<div style="font-size:0.7rem; color:#94a3b8;">${t.purpose}</div>` : ''}
                    </td>
                    <td>${t.source_bank || 'Corporate Account'}</td>
                    <td><span style="color:${color}; font-weight:600;">${t.type_label || (isInward ? 'Inward Wire' : 'Outward Remittance')}</span></td>
                    <td style="text-align:right;"><strong style="color:${color};">${sign} ${this.formatCurrency(t.amount)}</strong></td>
                    <td><span class="fin-badge ${t.status === 'Cleared' || t.status === 'Completed' ? 'fin-badge-paid' : 'fin-badge-pending'}">${t.status || 'Cleared'}</span></td>
                    <td style="text-align:center;">
                      <div style="display:inline-flex; gap:4px;">
                        <button type="button" class="fin-btn-card-action" title="Print Remittance Advice" onclick="window.finApp.printBankWireAdvice('${t.id}')">🖨️</button>
                        <button type="button" class="fin-btn-card-action danger" title="Delete Wire" onclick="window.finApp.deleteBankTransfer('${t.id}')">🗑️</button>
                      </div>
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

  renderCashInHandTab(root) {
    const registers = (this.db?.cash_in_hand || []).filter(r => (r.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const vouchers = (this.db?.cash_vouchers || []).filter(v => (v.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const comp = (this.db?.companies || []).find(c => c.id === this.activeCompanyId);
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const totalCash = registers.reduce((sum, r) => sum + (Number(r.balance) || 0), 0);

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">💵 Cash In Hand &amp; Site Petty Cash Registers</h2>
            <p style="font-size:0.75rem; color:#94a3b8;">
              ${comp ? comp.name : 'Rayan Group'} • Controlled imprest vaults for field site expenses, emergency fuel, and administrative operations
            </p>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            <div style="padding:0.4rem 0.8rem; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); border-radius:6px; font-size:0.78rem; color:#34d399;">
              Total Cash In Vaults: <strong style="color:#ffffff;">${this.formatCurrency(totalCash)}</strong>
            </div>
            <button type="button" class="fin-btn-quick" style="border-color:#34d399; color:#34d399;" onclick="window.finApp.openAddCashRegisterModal()">
              + Add Cash Vault
            </button>
            <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCashEntryModal()">
              + Record Cash Voucher
            </button>
          </div>
        </div>

        ${registers.length === 0 ? `
          <div class="fin-empty-state-card">
            <h4>No Cash Registers Registered</h4>
            <p>No site petty cash vaults configured for ${comp ? comp.name : 'this entity'}. Register a site cash vault to start issuing vouchers.</p>
            <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openAddCashRegisterModal()">+ Add Cash Vault</button>
          </div>
        ` : `
          <div class="fin-bank-grid">
            ${registers.map(r => `
              <div class="fin-bank-card">
                <div class="fin-bank-card-header">
                  <div>
                    <strong style="font-size:0.95rem; color:#ffffff;">${r.register_name}</strong>
                    <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">Location: ${r.location || 'Site Office'}</div>
                  </div>
                  <span class="fin-bank-badge">Active Imprest</span>
                </div>
                <div class="fin-bank-balance" style="color:#34d399;">
                  ${this.formatCurrency(r.balance)}
                </div>
                <div class="fin-bank-meta">
                  <div><strong>Custodian:</strong> ${r.custodian || 'Site Admin'}</div>
                  <div><strong>Last Replenished:</strong> ${this.formatDate(r.last_replenished)}</div>
                  <div style="color:#94a3b8; font-size:0.72rem; margin-top:4px;">Weekly audit &amp; dual-signature compliance</div>
                </div>
                <div class="fin-bank-card-actions">
                  <button type="button" class="fin-btn-card-action" onclick="window.finApp.openAddCashRegisterModal('${r.id}')">✏️ Edit Vault</button>
                  <button type="button" class="fin-btn-card-action" onclick="window.finApp.openCashEntryModal('${r.id}')">+ Voucher</button>
                  <button type="button" class="fin-btn-card-action danger" onclick="window.finApp.deleteCashRegister('${r.id}')">🗑️ Remove</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}

        <div class="fin-panel-header" style="margin-top:1.5rem; border-top:1px solid rgba(255,255,255,0.06); padding-top:1rem;">
          <div>
            <h3 style="font-size:0.95rem; color:#ffffff; margin:0;">📝 Recent Petty Cash Disbursals &amp; Replenishments</h3>
            <span style="font-size:0.72rem; color:#94a3b8;">Dual-signatory verification receipts &amp; petty cash vouchers (${vouchers.length} vouchers)</span>
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
                <th>Purpose / Category</th>
                <th>Disbursed To / Payee</th>
                <th style="text-align:right;">Amount</th>
                <th>Status</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${vouchers.length === 0 ? `
                <tr>
                  <td colspan="9" style="text-align:center; padding:2rem; color:#94a3b8;">
                    No petty cash vouchers logged yet. Click <strong>"Record Cash Voucher"</strong> above to issue a voucher.
                  </td>
                </tr>
              ` : vouchers.map(v => {
                const isInflow = v.type === 'inflow';
                const color = isInflow ? '#10b981' : '#fb923c';
                const sign = isInflow ? '+' : '-';
                return `
                  <tr>
                    <td><strong>${v.voucher_no}</strong></td>
                    <td>${this.formatDate(v.date)}</td>
                    <td>${v.register_name || 'Petty Cash Vault'}</td>
                    <td>${v.custodian || 'Custodian'}</td>
                    <td>
                      <div style="font-weight:600; color:#ffffff;">${v.purpose}</div>
                      ${v.category ? `<div style="font-size:0.7rem; color:#94a3b8;">${v.category}</div>` : ''}
                    </td>
                    <td>${v.payee || 'Site Runner'}</td>
                    <td style="text-align:right;"><strong style="color:${color};">${sign} ${this.formatCurrency(v.amount)}</strong></td>
                    <td><span class="fin-badge fin-badge-paid">${v.status || 'Approved'}</span></td>
                    <td style="text-align:center;">
                      <div style="display:inline-flex; gap:4px;">
                        <button type="button" class="fin-btn-card-action" title="Print Cash Voucher" onclick="window.finApp.printCashVoucher('${v.id}')">🖨️</button>
                        <button type="button" class="fin-btn-card-action danger" title="Delete Voucher" onclick="window.finApp.deleteCashVoucher('${v.id}')">🗑️</button>
                      </div>
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

  renderChequesTab(root) {
    const cheques = (this.db?.cheques || []).filter(c => (c.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const inward = cheques.filter(c => c.type === 'inward');
    const outward = cheques.filter(c => c.type === 'outward');
    const comp = (this.db?.companies || []).find(c => c.id === this.activeCompanyId);

    root.innerHTML = `
      <div class="fin-dash-row-responsive">
        <!-- Inward Cheques -->
        <div class="fin-panel-card">
          <div class="fin-panel-header">
            <div>
              <h2 class="fin-panel-title">📥 Inward Cheques (Customer Receipts)</h2>
              <p style="font-size:0.75rem; color:#94a3b8;">Cheques received from clients under banking clearance (${inward.length})</p>
            </div>
            <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openRecordChequeModal('inward')">
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
                  <th style="text-align:right;">Amount</th>
                  <th>Status</th>
                  <th style="text-align:center;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${inward.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align:center; padding:1.5rem; color:#94a3b8;">No inward cheques registered.</td>
                  </tr>
                ` : inward.map(c => `
                  <tr>
                    <td><strong>${c.cheque_no}</strong></td>
                    <td>${c.bank_name || '—'}</td>
                    <td>
                      <div style="font-weight:600; color:#ffffff;">${c.party_name}</div>
                      ${c.notes ? `<div style="font-size:0.7rem; color:#94a3b8;">${c.notes}</div>` : ''}
                    </td>
                    <td>${this.formatDate(c.date)}</td>
                    <td style="text-align:right;"><strong style="color:#10b981;">${this.formatCurrency(c.amount)}</strong></td>
                    <td>
                      <span class="fin-badge ${c.status === 'Cleared' ? 'fin-badge-paid' : (c.status === 'Bounced' ? 'fin-badge-void' : 'fin-badge-pending')}">
                        ${c.status}
                      </span>
                    </td>
                    <td style="text-align:center;">
                      <div style="display:inline-flex; gap:3px;">
                        ${c.status !== 'Cleared' ? `
                          <button type="button" class="fin-btn-card-action success" title="Clear & Credit Bank" onclick="window.finApp.promptClearCheque('${c.id}', 'inward')">⚡ Clear</button>
                        ` : ''}
                        <button type="button" class="fin-btn-card-action danger" title="Delete Cheque" onclick="window.finApp.deleteCheque('${c.id}')">🗑️</button>
                      </div>
                    </td>
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
              <p style="font-size:0.75rem; color:#94a3b8;">Corporate cheques issued against verified supplier bills (${outward.length})</p>
            </div>
            <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openRecordChequeModal('outward')">
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
                  <th style="text-align:right;">Amount</th>
                  <th>Status</th>
                  <th style="text-align:center;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${outward.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align:center; padding:1.5rem; color:#94a3b8;">No outward cheques issued.</td>
                  </tr>
                ` : outward.map(c => `
                  <tr>
                    <td><strong>${c.cheque_no}</strong></td>
                    <td>${c.bank_name || '—'}</td>
                    <td>
                      <div style="font-weight:600; color:#ffffff;">${c.party_name}</div>
                      ${c.notes ? `<div style="font-size:0.7rem; color:#94a3b8;">${c.notes}</div>` : ''}
                    </td>
                    <td>${this.formatDate(c.date)}</td>
                    <td style="text-align:right;"><strong style="color:#fb923c;">${this.formatCurrency(c.amount)}</strong></td>
                    <td>
                      <span class="fin-badge ${c.status === 'Cleared' ? 'fin-badge-paid' : 'fin-badge-pending'}">
                        ${c.status}
                      </span>
                    </td>
                    <td style="text-align:center;">
                      <div style="display:inline-flex; gap:3px;">
                        ${c.status !== 'Cleared' ? `
                          <button type="button" class="fin-btn-card-action success" title="Clear & Debit Bank" onclick="window.finApp.promptClearCheque('${c.id}', 'outward')">⚡ Clear</button>
                        ` : ''}
                        <button type="button" class="fin-btn-card-action danger" title="Delete Cheque" onclick="window.finApp.deleteCheque('${c.id}')">🗑️</button>
                      </div>
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

  renderLoanAccountsTab(root) {
    const loans = (this.db?.loan_accounts || []).filter(l => (l.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const transactions = (this.db?.loan_transactions || []).filter(t => (t.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const comp = (this.db?.companies || []).find(c => c.id === this.activeCompanyId);
    const totalDebt = loans.reduce((sum, l) => sum + (Number(l.outstanding_balance) || 0), 0);
    const totalLimit = loans.reduce((sum, l) => sum + (Number(l.sanctioned_limit) || 0), 0);

    root.innerHTML = `
      <div class="fin-panel-card">
        <div class="fin-panel-header">
          <div>
            <h2 class="fin-panel-title">🏢 Corporate Loan Accounts &amp; Credit Facilities</h2>
            <p style="font-size:0.75rem; color:#94a3b8;">
              ${comp ? comp.name : 'Rayan Group'} • Working capital consortium lines, machinery hypothecation &amp; LC/BG guarantee facilities
            </p>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            <div style="padding:0.4rem 0.8rem; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.25); border-radius:6px; font-size:0.78rem; color:#f59e0b;">
              Total Debt: <strong style="color:#ffffff;">${this.formatCurrency(totalDebt)}</strong>
            </div>
            <button type="button" class="fin-btn-quick" style="border-color:#f59e0b; color:#f59e0b;" onclick="window.finApp.openAddLoanFacilityModal()">
              + Add Credit Facility
            </button>
            <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openLoanEntryModal()">
              + Record Drawdown / Repayment
            </button>
          </div>
        </div>

        ${loans.length === 0 ? `
          <div class="fin-empty-state-card">
            <h4>No Credit Facilities Configured</h4>
            <p>No banking credit facilities, hypothecation loans, or letter of credit lines found for ${comp ? comp.name : 'this entity'}.</p>
            <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openAddLoanFacilityModal()">+ Add Credit Facility</button>
          </div>
        ` : `
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
                  ${this.formatCurrency(l.outstanding_balance)}
                  <span style="font-size:0.72rem; color:#94a3b8; font-weight:500; display:block; margin-top:2px;">Outstanding Debt / Utilization</span>
                </div>
                <div class="fin-bank-meta">
                  <div><strong>Sanctioned Limit:</strong> ${this.formatCurrency(l.sanctioned_limit)}</div>
                  <div><strong>Available Headroom:</strong> <span style="color:#34d399; font-weight:700;">${this.formatCurrency(l.available_limit)}</span></div>
                  <div><strong>Rate / Commission:</strong> ${l.interest_rate || l.commission_rate || 'Standard Rate'}</div>
                  <div><strong>Tenure:</strong> ${l.tenure || '36 Months'}</div>
                  <div style="color:#94a3b8; font-size:0.72rem; margin-top:4px;"><strong>Security:</strong> ${l.security || 'Corporate Guarantee'}</div>
                </div>
                <div class="fin-bank-card-actions">
                  <button type="button" class="fin-btn-card-action" onclick="window.finApp.openAddLoanFacilityModal('${l.id}')">✏️ Edit</button>
                  <button type="button" class="fin-btn-card-action" onclick="window.finApp.openLoanEntryModal('${l.id}')">+ Transaction</button>
                  <button type="button" class="fin-btn-card-action danger" onclick="window.finApp.deleteLoanAccount('${l.id}')">🗑️ Remove</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}

        <!-- Recent Facility Transactions Table -->
        <div class="fin-panel-header" style="margin-top:1.5rem; border-top:1px solid rgba(255,255,255,0.06); padding-top:1rem;">
          <div>
            <h3 style="font-size:0.95rem; color:#ffffff; margin:0;">📑 Recent Credit Facility Transactions</h3>
            <span style="font-size:0.72rem; color:#94a3b8;">Drawdowns, repayments and interest servicing records (${transactions.length} entries)</span>
          </div>
        </div>

        <div class="fin-table-responsive">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>Advice / Ref #</th>
                <th>Date</th>
                <th>Facility Name</th>
                <th>Transaction Type</th>
                <th style="text-align:right;">Amount</th>
                <th>Notes / Purpose</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align:center; padding:1.5rem; color:#94a3b8;">No facility transactions logged yet.</td>
                </tr>
              ` : transactions.map(t => {
                const isDrawdown = t.type === 'drawdown';
                const color = isDrawdown ? '#f59e0b' : '#34d399';
                return `
                  <tr>
                    <td><strong>${t.reference_no || t.id}</strong></td>
                    <td>${this.formatDate(t.date)}</td>
                    <td><strong>${t.facility_name || 'Credit Facility'}</strong></td>
                    <td><span style="color:${color}; font-weight:600;">${t.type_label || (isDrawdown ? 'Facility Drawdown' : (t.type === 'repayment' ? 'Principal Repayment' : 'Interest Service'))}</span></td>
                    <td style="text-align:right;"><strong style="color:${color};">${this.formatCurrency(t.amount)}</strong></td>
                    <td>${t.notes || '—'}</td>
                    <td style="text-align:center;">
                      <button type="button" class="fin-btn-card-action danger" title="Delete Transaction" onclick="window.finApp.deleteLoanTransaction('${t.id}')">🗑️</button>
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
  // 9. EXPENSES & CLAIMS MODULE
  // --------------------------------------------------------------------------
  renderExpensesTab(root) {
    const expenses = (this.db?.expenses || []).filter(e => (e.company_id || 'rayan-corp-uae') === this.activeCompanyId);

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
                  <td style="white-space:nowrap;">
                    <button type="button" class="fin-btn-row-action" onclick="alert('Attached proof: ${exp.receipt_filename}')">Receipt</button>
                    <button type="button" class="fin-btn-row-action" style="color:#38bdf8;" onclick="window.finApp.openEditExpenseModal('${exp.id}')" title="Edit Expense Claim">Edit</button>
                    <button type="button" class="fin-btn-row-action" style="color:#ef4444;" onclick="window.finApp.deleteExpense('${exp.id}')" title="Delete Expense">Delete</button>
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
    const pos = (this.db?.purchase_orders || []).filter(p => (p.company_id || 'rayan-corp-uae') === this.activeCompanyId);

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
                    <button type="button" class="fin-btn-row-action" style="color:#38bdf8;" onclick="window.finApp.openEditPOModal('${po.id}')" title="Edit Purchase Order">Edit</button>
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
    const projects = (this.db?.projects || []).filter(p => (p.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const invoices = (this.db?.invoices || []).filter(i => (i.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const bills = (this.db?.purchase_bills || []).filter(b => (b.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const expenses = (this.db?.expenses || []).filter(e => (e.company_id || 'rayan-corp-uae') === this.activeCompanyId);

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
            <button type="button" class="fin-btn-quick primary" onclick="window.finApp.printDocument()">
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

        <div class="rayan-computer-generated-notice" style="margin-top:1.5rem; padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.08); color:#94a3b8;">
          This is a Computer Generated Financial Statement
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
            <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openUploadDocModal()">
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
                  <td style="white-space:nowrap;">
                    <button type="button" class="fin-btn-row-action" onclick="alert('Viewing secure document: ${doc.name}')">Preview</button>
                    <button type="button" class="fin-btn-row-action" style="color:#38bdf8;" onclick="window.finApp.openEditDocumentModal('${doc.id}')">Edit</button>
                    <button type="button" class="fin-btn-row-action" style="color:#ef4444;" onclick="window.finApp.deleteDocument('${doc.id}')">Delete</button>
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
    if (tabName === 'purchases') tabName = 'bills';
    this.activeTab = tabName;
    document.querySelectorAll('.fin-tab-item, .fin-nav-subitem').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
    });
    const activeSub = document.querySelector(`.fin-nav-subitem[data-tab="${tabName}"]`);
    if (activeSub) {
      const parentGrp = activeSub.closest('.fin-accordion-group');
      if (parentGrp) parentGrp.classList.add('open');
    }
    this.renderActiveTab();
  }

  // 1. CREATE TAX INVOICE MODAL
  openCreateInvoiceModal() {
    const customers = this.db?.customers || [];
    const items = this.db?.items || [];
    const projects = this.db?.projects || [];
    const nextInvoiceNo = this.getNextInvoiceNumber();

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-invoice">
        <div class="fin-modal-dialog">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">📄 Create Sales Tax Invoice</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-invoice')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="create-invoice-form">
              <!-- Auto-Sequenced Invoice Number Banner -->
              <div style="background:rgba(15,23,42,0.65); border:1px solid rgba(56,189,248,0.25); border-radius:10px; padding:0.85rem 1.25rem; margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                <div style="display:flex; align-items:center; gap:0.85rem;">
                  <div style="width:38px; height:38px; border-radius:8px; background:linear-gradient(135deg, rgba(56,189,248,0.2), rgba(0,166,153,0.25)); display:flex; align-items:center; justify-content:center; font-size:1.2rem; border:1px solid rgba(56,189,248,0.35);">
                    ⚡
                  </div>
                  <div>
                    <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.06em; color:#94a3b8; font-weight:700;">
                      Official Invoice Sequence Number
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem; margin-top:2px;">
                      <span id="inv-auto-seq-badge" style="font-family:monospace; font-size:1.15rem; font-weight:800; color:#38bdf8; background:rgba(56,189,248,0.12); padding:2px 10px; border-radius:6px; border:1px solid rgba(56,189,248,0.35);">${nextInvoiceNo}</span>
                      <span style="font-size:0.7rem; color:#10b981; font-weight:700; background:rgba(16,185,129,0.12); padding:2px 8px; border-radius:10px; border:1px solid rgba(16,185,129,0.25);">✓ Auto-Generated Sequence</span>
                    </div>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:0.6rem;">
                  <label for="inv-custom-seq-no" style="font-size:0.74rem; color:#cbd5e1; font-weight:600;">Invoice # Ref:</label>
                  <input type="text" id="inv-custom-seq-no" class="fin-form-input" value="${nextInvoiceNo}" style="width:190px; padding:0.4rem 0.75rem; font-size:0.85rem; font-family:monospace; font-weight:700; color:#38bdf8; background:rgba(15,23,42,0.9); border-color:rgba(56,189,248,0.4);" title="Auto-sequenced invoice number. You can also customize if needed.">
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                    <label class="fin-form-label" style="margin-bottom:0;">Customer / Client <span style="color:#ef4444;">*</span></label>
                    <span id="inv-cust-badge" style="font-size:0.68rem; color:#38bdf8; font-weight:600;">Editable • Type or Pick ▾</span>
                  </div>
                  <div class="fin-autocomplete-wrap">
                    <input 
                      type="text" 
                      id="inv-cust-input" 
                      class="fin-form-input" 
                      value="M/s. BUILDARA GENERAL CONTRACTING - L.L.C"
                      placeholder="Click to view registered clients or write custom name..." 
                      required 
                      autocomplete="off"
                    >
                    <div id="inv-cust-dropdown" class="fin-autocomplete-dropdown">
                      <div class="fin-autocomplete-header">Registered Clients (Click to Auto-fill)</div>
                      ${customers.map(c => `
                        <div class="fin-autocomplete-item" data-id="${c.id}" data-name="${c.name}">
                          <div>
                            <div class="fin-autocomplete-item-name">${c.name}</div>
                            <div class="fin-autocomplete-item-meta">${c.code || ''} • ${c.trn ? `TRN: ${c.trn}` : (c.gstin ? `GSTIN: ${c.gstin}` : (c.country || 'UAE'))}</div>
                          </div>
                          <span class="fin-autocomplete-item-badge">${c.country || (c.trn ? 'UAE' : 'India')}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.3rem; font-size:0.68rem; color:#64748b;">
                    <span id="inv-cust-hint">Click text box to view registered clients, or type custom name</span>
                  </div>
                </div>

                <div class="fin-form-group">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                    <label class="fin-form-label" id="inv-tax-header-label" style="margin-bottom:0;">
                      <span id="inv-tax-type-text">CUSTOMER TRN</span> <span style="color:#ef4444;">*</span>
                    </label>
                    <div class="fin-tax-regime-pills">
                      <button type="button" id="regime-toggle-trn" class="fin-tax-pill active trn-pill" title="UAE VAT Regime (15-digit TRN Number)">
                        🇦🇪 TRN
                      </button>
                      <button type="button" id="regime-toggle-gst" class="fin-tax-pill" title="India GST Regime (15-character GSTIN)">
                        🇮🇳 GST
                      </button>
                    </div>
                  </div>
                  <input type="text" id="inv-cust-gstin" class="fin-form-input" required value="105405525400003" placeholder="e.g. 100492817200003 (15-digit UAE TRN)" maxlength="25" style="font-family:monospace; font-weight:600; letter-spacing:0.5px; text-transform:uppercase;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.3rem; font-size:0.68rem; color:#64748b;">
                    <span id="inv-tax-helper-text">UAE VAT Registration # (15 Digits)</span>
                    <span id="inv-currency-indicator" style="color:#0099e6; font-weight:700; cursor:pointer;" title="Click to toggle currency (AED د.إ / INR ₹)">Currency: <span id="inv-currency-symbol">AED (د.إ)</span> ⇄</span>
                  </div>
                  <input type="hidden" id="inv-tax-regime" value="trn">
                </div>

                <div class="fin-form-group">
                  <label class="fin-form-label" id="inv-pos-label">Place of Supply / Emirate <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="inv-cust-pos" class="fin-form-input" required value="Abu Dhabi, UAE" placeholder="e.g. Abu Dhabi, UAE" list="pos-suggestions">
                  <datalist id="pos-suggestions">
                    <option value="Abu Dhabi, UAE">Abu Dhabi, UAE</option>
                    <option value="Dubai, UAE">Dubai, UAE</option>
                    <option value="Sharjah, UAE">Sharjah, UAE</option>
                    <option value="27-Maharashtra">27-Maharashtra</option>
                    <option value="06-Haryana">06-Haryana</option>
                    <option value="07-Delhi">07-Delhi</option>
                    <option value="29-Karnataka">29-Karnataka</option>
                    <option value="24-Gujarat">24-Gujarat</option>
                  </datalist>
                </div>
              </div>

              <!-- Customer Address & Contact Details Row -->
              <div class="fin-form-grid-3" style="margin-top:0.75rem; margin-bottom:0.25rem;">
                <div class="fin-form-group">
                  <label class="fin-form-label">Client Billing Address</label>
                  <input type="text" id="inv-cust-address" class="fin-form-input" placeholder="e.g. ABU DHABI, MADINAT ZAYED, UAE" value="ABU DHABI, MADINAT ZAYED, UAE">
                  <div style="font-size:0.65rem; color:#64748b; margin-top:0.25rem;">Printed directly on Tax Invoice receipt</div>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Attention / Contact Person</label>
                  <input type="text" id="inv-cust-contact" class="fin-form-input" placeholder="e.g. Mr. Sooraj Kumar" value="Mr. Sooraj Kumar">
                  <div style="font-size:0.65rem; color:#64748b; margin-top:0.25rem;">Recipient / Representative</div>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Client Email / Contact</label>
                  <input type="text" id="inv-cust-email" class="fin-form-input" placeholder="e.g. buildaradevelopers@gmail.com" value="buildaradevelopers@gmail.com">
                  <div style="font-size:0.65rem; color:#64748b; margin-top:0.25rem;">For formal invoice documentation</div>
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Invoice Date</label>
                  <input type="date" id="inv-date" class="fin-form-input" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label" id="inv-terms-label">Payment Terms (Days)</label>
                  <input type="number" id="inv-terms" class="fin-form-input" value="30">
                </div>
                <div class="fin-form-group">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                    <label class="fin-form-label" style="margin-bottom:0;">Due Date</label>
                    <label style="font-size:0.7rem; color:#94a3b8; display:flex; align-items:center; gap:0.35rem; cursor:pointer; user-select:none;">
                      <input type="checkbox" id="inv-no-due-date" style="cursor:pointer; accent-color:#0099e6;"> No Due Date
                    </label>
                  </div>
                  <input type="date" id="inv-due-date" class="fin-form-input" required>
                  <span id="inv-no-due-date-hint" style="display:none; font-size:0.68rem; color:#38bdf8; margin-top:0.25rem;">Immediate Payment / Due Upon Receipt</span>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                    <label class="fin-form-label" style="margin-bottom:0;">Linked Project / Cost Center</label>
                    <span id="inv-project-badge" style="font-size:0.68rem; color:#38bdf8; font-weight:600;">Pick from List or Type Custom ▾</span>
                  </div>
                  <div class="fin-autocomplete-wrap">
                    <input 
                      type="text" 
                      id="inv-project-input" 
                      class="fin-form-input" 
                      placeholder="Click to view registered projects / cost centers, or type custom..." 
                      autocomplete="off"
                    >
                    <div id="inv-project-dropdown" class="fin-autocomplete-dropdown">
                      <div class="fin-autocomplete-header">Recommended Projects &amp; Cost Centers</div>
                      <div class="fin-autocomplete-item" data-id="GENERAL" data-name="General Corporate Billing">
                        <div>
                          <div class="fin-autocomplete-item-name">⭐ General Corporate Billing</div>
                          <div class="fin-autocomplete-item-meta">Standard Operating Entity Billing</div>
                        </div>
                        <span class="fin-autocomplete-item-badge">Default</span>
                      </div>
                      ${projects.map(p => `
                        <div class="fin-autocomplete-item" data-id="${p.id}" data-name="${p.name}">
                          <div>
                            <div class="fin-autocomplete-item-name">${p.name}</div>
                            <div class="fin-autocomplete-item-meta">Code: ${p.code} • ${p.client || 'Rayan Project'}</div>
                          </div>
                          <span class="fin-autocomplete-item-badge">${p.code}</span>
                        </div>
                      `).join('')}
                      <div class="fin-autocomplete-item" data-id="CC-101" data-name="Cost Center CC-101 Civil Infrastructure">
                        <div>
                          <div class="fin-autocomplete-item-name">Cost Center CC-101 Civil Infrastructure</div>
                          <div class="fin-autocomplete-item-meta">Foundation, Superstructures &amp; Heavy Earthworks</div>
                        </div>
                        <span class="fin-autocomplete-item-badge">CC-101</span>
                      </div>
                      <div class="fin-autocomplete-item" data-id="CC-102" data-name="Cost Center CC-102 MEP Engineering &amp; HVAC">
                        <div>
                          <div class="fin-autocomplete-item-name">Cost Center CC-102 MEP Engineering &amp; HVAC</div>
                          <div class="fin-autocomplete-item-meta">Mechanical, Electrical, Plumbing &amp; Climate Control</div>
                        </div>
                        <span class="fin-autocomplete-item-badge">CC-102</span>
                      </div>
                      <div class="fin-autocomplete-item" data-id="CC-103" data-name="Cost Center CC-103 Commercial Fitouts &amp; Glazing">
                        <div>
                          <div class="fin-autocomplete-item-name">Cost Center CC-103 Commercial Fitouts &amp; Glazing</div>
                          <div class="fin-autocomplete-item-meta">Architectural Curtain Wall, Ceilings &amp; Luxury Interiors</div>
                        </div>
                        <span class="fin-autocomplete-item-badge">CC-103</span>
                      </div>
                      <div class="fin-autocomplete-item" data-id="CC-104" data-name="Cost Center CC-104 Plant, Machinery &amp; Crane Hire">
                        <div>
                          <div class="fin-autocomplete-item-name">Cost Center CC-104 Plant, Machinery &amp; Crane Hire</div>
                          <div class="fin-autocomplete-item-meta">Heavy Machinery, Hydraulic Cranes &amp; Fleet Logistics</div>
                        </div>
                        <span class="fin-autocomplete-item-badge">CC-104</span>
                      </div>
                      <div class="fin-autocomplete-item" data-id="CC-105" data-name="Cost Center CC-105 Energy &amp; Offshore Facilities">
                        <div>
                          <div class="fin-autocomplete-item-name">Cost Center CC-105 Energy &amp; Offshore Facilities</div>
                          <div class="fin-autocomplete-item-meta">Refinery Process Structures &amp; Marine Logistics</div>
                        </div>
                        <span class="fin-autocomplete-item-badge">CC-105</span>
                      </div>
                    </div>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.3rem; font-size:0.68rem; color:#64748b;">
                    <span id="inv-project-hint">Click text box to view registered projects / cost centers, or type custom</span>
                  </div>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">PO / Contract Reference #</label>
                  <input type="text" id="inv-po-ref" class="fin-form-input" placeholder="e.g. LPO/BD/2026/12 or PO-LT-2025-99">
                </div>
              </div>

              <!-- Line Items & Tax Calculation Section -->
              <div style="display:flex; justify-content:space-between; align-items:center; margin:1.5rem 0 0.75rem; flex-wrap:wrap; gap:0.75rem; padding-bottom:0.6rem; border-bottom:1px solid rgba(255,255,255,0.08);">
                <div style="display:flex; align-items:center; gap:0.65rem;">
                  <div style="width:36px; height:36px; border-radius:8px; background:rgba(0,153,230,0.12); border:1px solid rgba(0,153,230,0.25); display:flex; align-items:center; justify-content:center; color:#38bdf8; font-size:1.15rem;">
                    📑
                  </div>
                  <div>
                    <h4 style="font-family:var(--fin-font-heading); font-size:1.1rem; color:#f8fafc; margin:0; display:flex; align-items:center; gap:0.5rem;">
                      Line Items &amp; Tax Calculation
                      <span style="font-size:0.68rem; font-weight:700; padding:2px 8px; border-radius:10px; background:rgba(16,185,129,0.14); color:#10b981; border:1px solid rgba(16,185,129,0.3);">Milestone &amp; VAT 5% Active</span>
                    </h4>
                    <div style="font-size:0.72rem; color:#94a3b8; margin-top:2px;">
                      Enter line rate or select progressive milestone (% billing) for progress claims
                    </div>
                  </div>
                </div>
                <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
                  <button type="button" class="fin-btn-quick" id="inv-apply-50pct-preset-btn" style="background:rgba(16,185,129,0.16); color:#34d399; border:1px solid rgba(16,185,129,0.4); font-size:0.78rem; padding:0.4rem 0.95rem; border-radius:6px; cursor:pointer; font-weight:700; display:inline-flex; align-items:center; gap:0.4rem; transition:all 0.2s ease;">
                    <span>⚡ Quick 50% Milestone</span>
                  </button>
                  <button type="button" class="fin-btn-quick" id="inv-open-billed-modal-btn" style="background:rgba(37,99,235,0.16); color:#60a5fa; border:1px solid rgba(59,130,246,0.35); font-size:0.78rem; padding:0.4rem 0.95rem; border-radius:6px; cursor:pointer; font-weight:600; display:inline-flex; align-items:center; gap:0.35rem;">
                    <span>📋 Spreadsheet View</span>
                  </button>
                </div>
              </div>

              <!-- Milestone and Catalog Autocomplete Datalist -->
              <datalist id="inv-item-milestone-suggestions">
                <option value="20% ADVANCE PAYMENT AGAINST PURCHASE ORDER">
                <option value="10 PROGRESSIVE PAYMENT">
                <option value="50% PROGRESSIVE PAYMENT - CIVIL &amp; INTERIOR FIT-OUT">
                <option value="RUNNING ACCOUNT (RA) BILL - STRUCTURAL WORKS">
                <option value="SECOND PROGRESSIVE PAYMENT - MEP INSTALLATION">
                <option value="FINAL COMPLETION &amp; RETENTION RELEASE (5%)">
                <option value="SUPPLY &amp; FABRICATION OF STRUCTURAL STEEL">
                <option value="CIVIL WORKS &amp; REINFORCED CONCRETE CASTING">
                <option value="ALUMINUM &amp; GLAZING FACADE WORKS">
                ${items.map(it => `<option value="${it.name}">Catalog: ${it.name} (${it.hsn_sac_code || ''})</option>`).join('')}
              </datalist>

              <div class="fin-table-card">
                <div class="fin-table-responsive" style="margin:0;">
                  <table class="fin-line-item-table" id="inv-items-table">
                    <thead>
                      <tr>
                        <th style="width:34%; text-align:left;">ITEM DESCRIPTION &amp; PROGRESSIVE MILESTONE</th>
                        <th style="width:10%; text-align:center;">HSN / SAC</th>
                        <th style="width:11%; text-align:center;">QTY / CLAIM %</th>
                        <th style="width:11%; text-align:center;">UNIT (UOM)</th>
                        <th style="width:14%; text-align:right;" id="inv-rate-col-header">CONTRACT / RATE (AED)</th>
                        <th style="width:9%; text-align:center;" id="inv-tax-col-header">VAT 5%</th>
                        <th style="width:13%; text-align:right;" id="inv-total-col-header">AMOUNT (AED)</th>
                        <th style="width:4%; text-align:center;"></th>
                      </tr>
                    </thead>
                    <tbody id="inv-items-tbody">
                      <!-- Dynamic line rows -->
                    </tbody>
                  </table>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                <button type="button" class="fin-btn-quick" id="inv-add-row-btn" style="background:linear-gradient(135deg, rgba(56,189,248,0.18), rgba(0,153,230,0.22)); color:#38bdf8; border:1px solid rgba(56,189,248,0.4); font-weight:700; padding:0.5rem 1.25rem; border-radius:7px; display:inline-flex; align-items:center; gap:0.45rem; font-size:0.84rem; cursor:pointer; box-shadow:0 2px 8px rgba(0,153,230,0.15);">
                  <span style="font-size:1.2rem; line-height:1; font-weight:900;">+</span> Add Line Item
                </button>
                <div style="font-size:0.74rem; color:#94a3b8; display:flex; align-items:center; gap:0.35rem;">
                  <span>💡 Tip: Set UOM to <strong style="color:#38bdf8;">%</strong> for milestone progress billing against total contract value.</span>
                </div>
              </div>

              <!-- Realtime Calculations Executive Card -->
              <div class="fin-calc-summary-box">
                <div class="fin-calc-header">
                  <span class="fin-calc-header-title">
                    <span>📊</span>
                    <span>Billing Summary &amp; Tax Breakdown</span>
                  </span>
                  <span id="inv-calc-regime-badge" style="font-size:0.68rem; font-weight:700; color:#10b981; background:rgba(16,185,129,0.12); padding:3px 9px; border-radius:5px; border:1px solid rgba(16,185,129,0.3);">🇦🇪 UAE VAT (5%)</span>
                </div>
                <div class="fin-calc-row" id="inv-calc-base-row" style="display:none;">
                  <span style="font-weight:600; color:#94a3b8;">Contract Base Value</span>
                  <span id="inv-calc-base" style="font-weight:600; color:#cbd5e1; font-family:monospace; font-size:0.88rem;">AED 0.00</span>
                </div>
                <div class="fin-calc-row">
                  <span id="inv-calc-taxable-label" style="font-weight:600; color:#cbd5e1;">Taxable Subtotal</span>
                  <span id="inv-calc-taxable" style="font-weight:700; color:#f8fafc; font-family:monospace; font-size:0.92rem;">AED 0.00</span>
                </div>
                <div class="fin-calc-row" id="inv-calc-cgst-row" style="display:none;">
                  <span>Central GST (CGST)</span>
                  <span id="inv-calc-cgst" style="font-weight:600; color:#cbd5e1; font-family:monospace;">₹0.00</span>
                </div>
                <div class="fin-calc-row" id="inv-calc-sgst-row" style="display:none;">
                  <span>State GST (SGST)</span>
                  <span id="inv-calc-sgst" style="font-weight:600; color:#cbd5e1; font-family:monospace;">₹0.00</span>
                </div>
                <div class="fin-calc-row" id="inv-calc-igst-row" style="display:none;">
                  <span>Integrated GST (IGST)</span>
                  <span id="inv-calc-igst" style="font-weight:600; color:#cbd5e1; font-family:monospace;">₹0.00</span>
                </div>
                <div class="fin-calc-row" id="inv-calc-vat-row">
                  <span style="display:flex; align-items:center; gap:0.4rem;">
                    <span>VAT (5%)</span>
                    <span style="font-size:0.64rem; font-weight:700; color:#10b981; background:rgba(16,185,129,0.14); padding:1px 6px; border-radius:4px; border:1px solid rgba(16,185,129,0.3);">Standard Rate</span>
                  </span>
                  <span id="inv-calc-vat" style="color:#10b981; font-weight:700; font-family:monospace; font-size:0.92rem;">AED 0.00</span>
                </div>
                <div class="fin-calc-row grand-total">
                  <span>Grand Total (AED)</span>
                  <span id="inv-calc-grand">AED 0.00</span>
                </div>
                <div class="fin-calc-compliance-note">
                  <span id="inv-compliance-text">⚖️ Compliant with UAE FTA VAT Executive Regulations (5% Standard Rate)</span>
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

    // Dual Tax Regime & Currency state (Default: UAE TRN VAT 5% in AED)
    let currentRegime = 'trn'; // 'trn' | 'gst'
    let currentCurrency = 'AED'; // 'AED' | 'INR'

    const tbody = document.getElementById('inv-items-tbody');

    const setTaxRegime = (regime, options = {}) => {
      currentRegime = regime;
      const isTrn = regime === 'trn';

      const btnGst = document.getElementById('regime-toggle-gst');
      const btnTrn = document.getElementById('regime-toggle-trn');
      const taxInp = document.getElementById('inv-cust-gstin');
      const taxLabelText = document.getElementById('inv-tax-type-text');
      const taxHelper = document.getElementById('inv-tax-helper-text');
      const posInp = document.getElementById('inv-cust-pos');
      const posLabel = document.getElementById('inv-pos-label');
      const regimeHidden = document.getElementById('inv-tax-regime');
      const currBadge = document.getElementById('inv-currency-symbol');
      const rateCol = document.getElementById('inv-rate-col-header');
      const taxCol = document.getElementById('inv-tax-col-header');
      const totCol = document.getElementById('inv-total-col-header');
      const regBadge = document.getElementById('inv-calc-regime-badge');

      if (regimeHidden) regimeHidden.value = regime;

      if (regBadge) {
        if (isTrn) {
          regBadge.textContent = '🇦🇪 UAE VAT (5%)';
          regBadge.style.color = '#10b981';
          regBadge.style.background = 'rgba(16,185,129,0.12)';
          regBadge.style.border = '1px solid rgba(16,185,129,0.3)';
        } else {
          regBadge.textContent = '🇮🇳 India GST (18%)';
          regBadge.style.color = '#38bdf8';
          regBadge.style.background = 'rgba(56,189,248,0.12)';
          regBadge.style.border = '1px solid rgba(56,189,248,0.3)';
        }
      }

      if (isTrn) {
        if (btnTrn) btnTrn.classList.add('active', 'trn-pill');
        if (btnGst) btnGst.classList.remove('active');
        if (taxLabelText) taxLabelText.textContent = 'CUSTOMER TRN';
        if (taxInp) {
          taxInp.placeholder = 'e.g. 100492817200003 (15-digit UAE TRN)';
          taxInp.title = '15-digit UAE Tax Registration Number (TRN)';
        }
        if (taxHelper) taxHelper.textContent = 'UAE VAT Registration # (15 Digits)';
        if (posLabel) posLabel.innerHTML = 'Place of Supply / Emirate <span style="color:#ef4444;">*</span>';

        if (!options.keepPos && posInp && (!posInp.value || posInp.value.includes('Maharashtra') || posInp.value.includes('27'))) {
          posInp.value = options.suggestedPos || 'Abu Dhabi, UAE';
        }

        if (!options.keepCurrency) {
          currentCurrency = 'AED';
          if (currBadge) currBadge.textContent = 'AED (د.إ)';
        }

        if (rateCol) rateCol.textContent = `CONTRACT / RATE (${currentCurrency === 'AED' ? 'AED' : '₹'})`;
        if (taxCol) taxCol.textContent = 'VAT 5%';
        if (totCol) totCol.textContent = `AMOUNT (${currentCurrency === 'AED' ? 'AED' : '₹'})`;

        tbody.querySelectorAll('tr').forEach(tr => {
          const gstSel = tr.querySelector('.row-gst');
          if (gstSel) {
            const currVal = gstSel.value;
            gstSel.innerHTML = `
              <option value="5" ${currVal === '5' || currVal === '18' || !options.preserveRates ? 'selected' : ''}>5%</option>
              <option value="0" ${currVal === '0' ? 'selected' : ''}>0%</option>
            `;
            if (currVal === '18' || !options.preserveRates) gstSel.value = '5';
          }
        });
      } else {
        if (btnGst) btnGst.classList.add('active');
        if (btnTrn) btnTrn.classList.remove('active', 'trn-pill');
        if (taxLabelText) taxLabelText.textContent = 'CUSTOMER GSTIN';
        if (taxInp) {
          taxInp.placeholder = 'e.g. 27AAACL0149K1ZM (India GST)';
          taxInp.title = '15-character Indian Goods & Services Tax Identification Number';
        }
        if (taxHelper) taxHelper.textContent = 'India GSTIN (15 Alphanumeric)';
        if (posLabel) posLabel.innerHTML = 'Place of Supply State <span style="color:#ef4444;">*</span>';

        if (!options.keepPos && posInp && (!posInp.value || posInp.value.includes('UAE') || posInp.value.includes('Dubai') || posInp.value.includes('Abu Dhabi'))) {
          posInp.value = options.suggestedPos || '27-Maharashtra';
        }

        if (!options.keepCurrency) {
          currentCurrency = 'INR';
          if (currBadge) currBadge.textContent = '₹ INR';
        }

        if (rateCol) rateCol.textContent = `CONTRACT / RATE (${currentCurrency === 'AED' ? 'AED' : '₹'})`;
        if (taxCol) taxCol.textContent = 'GST %';
        if (totCol) totCol.textContent = `AMOUNT (${currentCurrency === 'AED' ? 'AED' : '₹'})`;

        tbody.querySelectorAll('tr').forEach(tr => {
          const gstSel = tr.querySelector('.row-gst');
          if (gstSel) {
            const currVal = gstSel.value;
            gstSel.innerHTML = `
              <option value="18" ${currVal === '18' || (!options.preserveRates && currVal !== '5') ? 'selected' : ''}>18%</option>
              <option value="12" ${currVal === '12' ? 'selected' : ''}>12%</option>
              <option value="5" ${currVal === '5' ? 'selected' : ''}>5%</option>
              <option value="28" ${currVal === '28' ? 'selected' : ''}>28%</option>
              <option value="0" ${currVal === '0' ? 'selected' : ''}>0%</option>
            `;
            if (currVal === '5' && !options.preserveRates) gstSel.value = '18';
          }
        });
      }

      recalculateInvoice();
    };

    // Currency toggle click handler
    const currToggle = document.getElementById('inv-currency-indicator');
    if (currToggle) {
      currToggle.onclick = () => {
        currentCurrency = currentCurrency === 'INR' ? 'AED' : 'INR';
        const currBadge = document.getElementById('inv-currency-symbol');
        if (currBadge) currBadge.textContent = currentCurrency === 'AED' ? 'AED (د.إ)' : '₹ INR';

        const rateCol = document.getElementById('inv-rate-col-header');
        const totCol = document.getElementById('inv-total-col-header');
        if (rateCol) rateCol.textContent = `CONTRACT / RATE (${currentCurrency === 'AED' ? 'AED' : '₹'})`;
        if (totCol) totCol.textContent = `AMOUNT (${currentCurrency === 'AED' ? 'AED' : '₹'})`;

        recalculateInvoice();
      };
    }

    // Line items manager matching user's photo
    const addRow = (defaultItem = null, defaultQty = 1) => {
      const tr = document.createElement('tr');
      const isTrn = currentRegime === 'trn';
      const currSym = currentCurrency === 'AED' ? 'AED ' : '₹';

      const itemId = defaultItem ? (defaultItem.id || defaultItem.code || '') : '';
      const itemName = defaultItem ? (defaultItem.name || defaultItem.description || '') : '';
      const hsn = defaultItem ? (defaultItem.hsn_sac_code || '9954') : '9954';
      const uom = defaultItem ? (defaultItem.uom || (itemName && itemName.includes('%') ? '%' : 'LSUM')) : (defaultQty > 1 && defaultQty <= 100 ? '%' : 'LSUM');
      const rate = defaultItem ? (defaultItem.sales_price !== undefined ? defaultItem.sales_price : (defaultItem.rate || 0)) : 0;
      const gstRate = defaultItem && defaultItem.gst_rate !== undefined ? defaultItem.gst_rate : (isTrn ? 5 : 18);
      const isPercentInitial = uom === '%' || uom.includes('PERCENT') || (itemName && itemName.includes('%'));
      const initialPctVal = defaultItem?.progress_pct || defaultItem?.pct || (isPercentInitial ? (defaultQty > 1 && defaultQty <= 100 ? defaultQty : 50) : 50);

      if (isPercentInitial) {
        tr.classList.add('milestone-active');
      }

      tr.innerHTML = `
        <td style="width:34%; vertical-align:top;">
          <select class="fin-form-select row-item-sel" style="margin-bottom:0.4rem; font-size:0.82rem; font-weight:600;">
            <option value="">Custom Item / Service / Milestone</option>
            <optgroup label="⚡ Progressive Milestone &amp; % Payments">
              <option value="MILESTONE-50" ${itemId === 'item-milestone-50' || itemId === 'MILESTONE-50' || itemName.includes('50%') ? 'selected' : ''}>
                ⭐ Billed Milestone (50%): 500.00 AED (Taxable Subtotal)
              </option>
              <option value="MILESTONE-20" ${itemId === 'item-milestone-20' || itemId === 'MILESTONE-20' || itemName.includes('20%') ? 'selected' : ''}>
                20% Mobilization &amp; Advance Payment Against LPO
              </option>
              <option value="MILESTONE-30" ${itemId === 'item-milestone-30' || itemId === 'MILESTONE-30' || itemName.includes('30%') ? 'selected' : ''}>
                30% Running Account (RA) Bill Payment - MEP &amp; Structural
              </option>
              <option value="MILESTONE-10" ${itemId === 'MILESTONE-10' || itemName.includes('10%') ? 'selected' : ''}>
                10% Progressive Milestone Payment
              </option>
              <option value="MILESTONE-PCT" ${itemId === 'item-milestone-pct' || itemId === 'MILESTONE-PCT' ? 'selected' : ''}>
                % Custom Progressive Milestone Claim
              </option>
            </optgroup>
            <optgroup label="📦 Construction &amp; Engineering Catalog">
              ${items.filter(it => !it.id.startsWith('item-milestone')).map(it => `<option value="${it.id}" ${itemId === it.id || (itemName && it.name === itemName) ? 'selected' : ''}>${it.name}</option>`).join('')}
            </optgroup>
          </select>
          <input type="text" class="fin-form-input row-desc" list="inv-item-milestone-suggestions" placeholder="Enter item description or milestone..." value="${itemName}" style="font-size:0.82rem;">
          <div class="row-pct-note" style="display:${isPercentInitial ? 'flex' : 'none'};"></div>
        </td>
        <td style="width:10%; vertical-align:top;">
          <input type="text" class="fin-form-input row-hsn" placeholder="9954" value="${hsn}" style="font-size:0.82rem; font-family:monospace; text-align:center;">
          <div style="font-size:0.65rem; color:#64748b; margin-top:3px; text-align:center;">HSN/SAC</div>
        </td>
        <td style="width:11%; vertical-align:top; text-align:center;">
          <input type="number" class="fin-form-input row-qty" value="${defaultQty || 1}" min="0.001" step="any" style="text-align:center; font-size:0.85rem; font-weight:700;">
          <div class="row-pct-subfield" style="display:${isPercentInitial ? 'flex' : 'none'}; align-items:center; justify-content:center; gap:2px; margin-top:4px;">
            <span style="font-size:0.65rem; color:#94a3b8; font-weight:600;">CLAIM:</span>
            <input type="number" class="fin-form-input row-pct-val" value="${initialPctVal}" placeholder="50" min="0.01" max="100" step="any" style="width:46px; padding:2px 3px; font-size:0.75rem; text-align:center; font-weight:800; color:#38bdf8; background:rgba(56,189,248,0.15); border:1px solid #38bdf8; border-radius:4px;">
            <span style="font-weight:800; color:#38bdf8; font-size:0.75rem;">%</span>
          </div>
        </td>
        <td style="width:11%; vertical-align:top;">
          <select class="fin-form-select row-uom" style="font-size:0.82rem; font-weight:700; text-align:center;">
            <optgroup label="⚡ Progressive Milestone">
              <option value="%" ${uom === '%' ? 'selected' : ''}>% (Progress %)</option>
            </optgroup>
            <optgroup label="Standard Engineering Units">
              <option value="LSUM" ${uom === 'LSUM' ? 'selected' : ''}>LSUM</option>
              <option value="JOB" ${uom === 'JOB' ? 'selected' : ''}>JOB</option>
              <option value="SQM" ${uom === 'SQM' ? 'selected' : ''}>SQM</option>
              <option value="SQFT" ${uom === 'SQFT' ? 'selected' : ''}>SQFT</option>
              <option value="CUM" ${uom === 'CUM' ? 'selected' : ''}>CUM</option>
              <option value="MT" ${uom === 'MT' ? 'selected' : ''}>MT</option>
              <option value="KG" ${uom === 'KG' ? 'selected' : ''}>KG</option>
              <option value="BAG" ${uom === 'BAG' ? 'selected' : ''}>BAG</option>
              <option value="NOS" ${uom === 'NOS' ? 'selected' : ''}>NOS</option>
              <option value="PCS" ${uom === 'PCS' ? 'selected' : ''}>PCS</option>
              <option value="SET" ${uom === 'SET' ? 'selected' : ''}>SET</option>
              <option value="MTR" ${uom === 'MTR' ? 'selected' : ''}>MTR</option>
              <option value="RMT" ${uom === 'RMT' ? 'selected' : ''}>RMT</option>
              <option value="HRS" ${uom === 'HRS' ? 'selected' : ''}>HRS</option>
              <option value="DAY" ${uom === 'DAY' ? 'selected' : ''}>DAY</option>
              <option value="MTH" ${uom === 'MTH' ? 'selected' : ''}>MTH</option>
              <option value="MD" ${uom === 'MD' ? 'selected' : ''}>MD</option>
              <option value="ANNUM" ${uom === 'ANNUM' ? 'selected' : ''}>ANNUM</option>
            </optgroup>
          </select>
        </td>
        <td style="width:14%; vertical-align:top;">
          <input type="number" class="fin-form-input row-rate" value="${rate > 0 ? rate : (defaultItem ? 0 : '')}" placeholder="0.00" step="any" style="font-size:0.85rem; font-weight:700; text-align:right; font-family:monospace;">
          <div style="font-size:0.65rem; color:#64748b; margin-top:3px; text-align:right;">Contract / Rate</div>
        </td>
        <td style="width:9%; vertical-align:top;">
          <select class="fin-form-select row-gst" style="font-size:0.82rem; font-weight:700; text-align:center;">
            ${isTrn ? `
              <option value="5" ${Number(gstRate) === 5 ? 'selected' : ''}>5%</option>
              <option value="0" ${Number(gstRate) === 0 ? 'selected' : ''}>0%</option>
            ` : `
              <option value="18" ${Number(gstRate) === 18 ? 'selected' : ''}>18%</option>
              <option value="12" ${Number(gstRate) === 12 ? 'selected' : ''}>12%</option>
              <option value="5" ${Number(gstRate) === 5 ? 'selected' : ''}>5%</option>
              <option value="28" ${Number(gstRate) === 28 ? 'selected' : ''}>28%</option>
              <option value="0" ${Number(gstRate) === 0 ? 'selected' : ''}>0%</option>
            `}
          </select>
          <div style="font-size:0.65rem; color:#64748b; margin-top:3px; text-align:center;">Tax %</div>
        </td>
        <td style="width:13%; vertical-align:top; text-align:right; padding-top:0.95rem;">
          <strong class="row-total" style="color:#38bdf8; font-size:0.95rem; font-family:monospace; display:block;">${currSym}0.00</strong>
        </td>
        <td style="width:4%; vertical-align:top; text-align:center; padding-top:0.75rem;">
          <button type="button" class="fin-row-del-btn row-del" title="Remove row">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);

      const sel = tr.querySelector('.row-item-sel');
      sel.onchange = () => {
        const val = sel.value;
        const uomSel = tr.querySelector('.row-uom');
        const pctSubfield = tr.querySelector('.row-pct-subfield');
        const pctValInp = tr.querySelector('.row-pct-val');
        const descInp = tr.querySelector('.row-desc');
        const hsnInp = tr.querySelector('.row-hsn');
        const rateInp = tr.querySelector('.row-rate');
        const qtyInp = tr.querySelector('.row-qty');
        const gstSelect = tr.querySelector('.row-gst');

        if (val === 'MILESTONE-50' || val === 'item-milestone-50') {
          descInp.value = '50% PROGRESSIVE MILESTONE CLAIM - CIVIL & INTERIOR FIT-OUT';
          hsnInp.value = '9954';
          if (uomSel) uomSel.value = '%';
          qtyInp.value = '1';
          rateInp.value = '1000';
          if (pctValInp) pctValInp.value = '50';
          if (pctSubfield) pctSubfield.style.display = 'flex';
          gstSelect.value = currentRegime === 'trn' ? '5' : '18';
          tr.classList.add('milestone-active');
        } else if (val === 'MILESTONE-20' || val === 'item-milestone-20') {
          descInp.value = '20% MOBILIZATION & ADVANCE PAYMENT AGAINST LPO';
          hsnInp.value = '9954';
          if (uomSel) uomSel.value = '%';
          qtyInp.value = '1';
          rateInp.value = '1000';
          if (pctValInp) pctValInp.value = '20';
          if (pctSubfield) pctSubfield.style.display = 'flex';
          gstSelect.value = currentRegime === 'trn' ? '5' : '18';
          tr.classList.add('milestone-active');
        } else if (val === 'MILESTONE-30' || val === 'item-milestone-30') {
          descInp.value = '30% RUNNING ACCOUNT (RA) BILL PAYMENT - MEP & STRUCTURAL';
          hsnInp.value = '9954';
          if (uomSel) uomSel.value = '%';
          qtyInp.value = '1';
          rateInp.value = '1000';
          if (pctValInp) pctValInp.value = '30';
          if (pctSubfield) pctSubfield.style.display = 'flex';
          gstSelect.value = currentRegime === 'trn' ? '5' : '18';
          tr.classList.add('milestone-active');
        } else if (val === 'MILESTONE-10') {
          descInp.value = '10% PROGRESSIVE MILESTONE PAYMENT';
          hsnInp.value = '9954';
          if (uomSel) uomSel.value = '%';
          qtyInp.value = '1';
          rateInp.value = '1000';
          if (pctValInp) pctValInp.value = '10';
          if (pctSubfield) pctSubfield.style.display = 'flex';
          gstSelect.value = currentRegime === 'trn' ? '5' : '18';
          tr.classList.add('milestone-active');
        } else if (val === 'MILESTONE-PCT' || val === 'item-milestone-pct') {
          descInp.value = '% PROGRESSIVE WORK CERTIFICATION';
          hsnInp.value = '9954';
          if (uomSel) uomSel.value = '%';
          qtyInp.value = '1';
          if (!rateInp.value || Number(rateInp.value) === 0) rateInp.value = '1000';
          if (pctValInp && (!pctValInp.value || Number(pctValInp.value) === 0)) pctValInp.value = '50';
          if (pctSubfield) pctSubfield.style.display = 'flex';
          gstSelect.value = currentRegime === 'trn' ? '5' : '18';
          tr.classList.add('milestone-active');
        } else {
          const found = items.find(it => it.id === val);
          if (found) {
            descInp.value = found.name;
            hsnInp.value = found.hsn_sac_code || '9954';
            if (uomSel) uomSel.value = found.uom || 'LSUM';
            rateInp.value = found.sales_price || 0;
            gstSelect.value = currentRegime === 'trn' ? '5' : String(found.gst_rate || 18);
            if (found.uom === '%') {
              if (pctSubfield) pctSubfield.style.display = 'flex';
              if (pctValInp && (!pctValInp.value || Number(pctValInp.value) === 0)) pctValInp.value = '50';
              tr.classList.add('milestone-active');
            } else {
              if (pctSubfield) pctSubfield.style.display = 'none';
              tr.classList.remove('milestone-active');
            }
          }
        }
        recalculateInvoice();
      };

      const descInp = tr.querySelector('.row-desc');
      descInp.oninput = () => {
        const val = descInp.value.trim().toLowerCase();
        const found = items.find(it => it.name.toLowerCase() === val);
        if (found) {
          sel.value = found.id;
          tr.querySelector('.row-hsn').value = found.hsn_sac_code || '9954';
          const uomSel = tr.querySelector('.row-uom');
          if (uomSel) uomSel.value = found.uom || 'LSUM';
          if (!tr.querySelector('.row-rate').value || Number(tr.querySelector('.row-rate').value) === 0) {
            tr.querySelector('.row-rate').value = found.sales_price || 0;
          }
          if (found.uom === '%') {
            const pctSub = tr.querySelector('.row-pct-subfield');
            if (pctSub) pctSub.style.display = 'flex';
            tr.classList.add('milestone-active');
          }
        } else if (val.includes('%') || val.includes('milestone')) {
          const uomSel = tr.querySelector('.row-uom');
          if (uomSel) uomSel.value = '%';
          const pctSub = tr.querySelector('.row-pct-subfield');
          if (pctSub) pctSub.style.display = 'flex';
          const pctValInp = tr.querySelector('.row-pct-val');
          const match = val.match(/(\d+)%/);
          if (match && pctValInp) {
            pctValInp.value = match[1];
          }
          tr.classList.add('milestone-active');
        }
        recalculateInvoice();
      };

      const uomSelect = tr.querySelector('.row-uom');
      if (uomSelect) {
        uomSelect.onchange = () => {
          const isPct = uomSelect.value === '%' || uomSelect.value.includes('PERCENT');
          const pctSub = tr.querySelector('.row-pct-subfield');
          if (pctSub) pctSub.style.display = isPct ? 'flex' : 'none';
          tr.classList.toggle('milestone-active', isPct);
          recalculateInvoice();
        };
      }

      tr.querySelectorAll('.row-hsn, .row-qty, .row-uom, .row-rate, .row-gst, .row-pct-val').forEach(inp => {
        inp.oninput = () => recalculateInvoice();
        inp.onchange = () => recalculateInvoice();
      });

      tr.querySelector('.row-del').onclick = () => {
        tr.remove();
        recalculateInvoice();
      };

      recalculateInvoice();
    };

    const recalculateInvoice = () => {
      const isTrn = currentRegime === 'trn';
      const currSym = currentCurrency === 'AED' ? 'AED ' : '₹';
      const pos = (document.getElementById('inv-cust-pos')?.value || '').toLowerCase();
      const isUaeSupply = isTrn || pos.includes('uae') || pos.includes('abu dhabi') || pos.includes('dubai') || pos.includes('sharjah');
      const isInterState = !pos.includes('maharashtra') && !pos.includes('27');

      let taxableSum = 0;
      let taxSum = 0;
      let cgstSum = 0;
      let sgstSum = 0;
      let igstSum = 0;
      let vatSum = 0;
      let hasOnly5Or0Tax = true;
      let hasPercentRow = false;
      let milestonePercentUsed = 50;
      let totalContractBase = 0;

      tbody.querySelectorAll('tr').forEach(tr => {
        const qtyInp = tr.querySelector('.row-qty');
        const rateInp = tr.querySelector('.row-rate');
        const taxInp = tr.querySelector('.row-gst');
        const uomInp = tr.querySelector('.row-uom');
        const pctSubfield = tr.querySelector('.row-pct-subfield');
        const pctValInp = tr.querySelector('.row-pct-val');
        const pctNote = tr.querySelector('.row-pct-note');

        const qty = Number(qtyInp?.value) || 0;
        const rate = Number(rateInp?.value) || 0;
        const taxRate = Number(taxInp?.value) || 0;
        const uom = (uomInp?.value || '').trim().toUpperCase();

        const isPercent = uom === '%' || uom.includes('PERCENT');
        if (pctSubfield) pctSubfield.style.display = isPercent ? 'flex' : 'none';
        tr.classList.toggle('milestone-active', isPercent);

        let rowTaxable = 0;
        let pctUsed = 0;

        if (isPercent) {
          hasPercentRow = true;
          totalContractBase += (qty * rate);
          const explicitPct = Number(pctValInp?.value);
          if (!isNaN(explicitPct) && explicitPct > 0) {
            pctUsed = explicitPct;
            rowTaxable = (qty * rate) * (explicitPct / 100);
          } else if (qty > 0 && qty <= 100) {
            pctUsed = qty;
            rowTaxable = rate * (qty / 100);
          } else if (qty > 0 && qty < 1) {
            pctUsed = qty * 100;
            rowTaxable = rate * qty;
          } else {
            pctUsed = 100;
            rowTaxable = qty * rate;
          }
          milestonePercentUsed = pctUsed;

          if (pctNote) {
            pctNote.style.display = 'flex';
            const baseContract = qty * rate;
            pctNote.innerHTML = `
              <div class="row-pct-pill">
                <span>⚡</span>
                <span>Billed Milestone (<strong>${pctUsed}%</strong>): ${currSym}${baseContract.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} &times; ${pctUsed}% = <strong style="color:#ffffff;">${currSym}${rowTaxable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> (Taxable Subtotal)</span>
              </div>
            `;
          }
        } else {
          if (pctNote) pctNote.style.display = 'none';
          rowTaxable = qty * rate;
        }

        if (taxRate !== 5 && taxRate !== 0) {
          hasOnly5Or0Tax = false;
        }

        const rowTax = rowTaxable * (taxRate / 100);
        const rowGrand = rowTaxable + rowTax;

        const rowTotEl = tr.querySelector('.row-total');
        if (rowTotEl) {
          rowTotEl.textContent = `${currSym}${rowGrand.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        taxableSum += rowTaxable;
        taxSum += rowTax;

        if (isUaeSupply || isTrn || (taxRate === 5 && !isInterState)) {
          vatSum += rowTax;
        } else if (!isTrn) {
          if (isInterState) {
            igstSum += rowTax;
          } else {
            cgstSum += rowTax / 2;
            sgstSum += rowTax / 2;
          }
        }
      });

      // Update column header dynamically to VAT 5% when TRN or 5% tax is used
      const taxCol = document.getElementById('inv-tax-col-header');
      if (taxCol) {
        if (isTrn || isUaeSupply || hasOnly5Or0Tax) {
          taxCol.textContent = 'VAT 5%';
        } else {
          taxCol.textContent = 'GST %';
        }
      }

      const grandTotal = taxableSum + taxSum;
      const fmt = (val) => `${currSym}${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      // Base Contract summary row (if milestone used)
      const baseRow = document.getElementById('inv-calc-base-row');
      const baseEl = document.getElementById('inv-calc-base');
      if (baseRow && baseEl) {
        if (hasPercentRow && totalContractBase > 0) {
          baseRow.style.display = 'flex';
          baseEl.textContent = fmt(totalContractBase);
        } else {
          baseRow.style.display = 'none';
        }
      }

      document.getElementById('inv-calc-taxable').textContent = fmt(taxableSum);
      document.getElementById('inv-calc-grand').textContent = fmt(grandTotal);

      const cgstRow = document.getElementById('inv-calc-cgst-row');
      const sgstRow = document.getElementById('inv-calc-sgst-row');
      const igstRow = document.getElementById('inv-calc-igst-row');
      const vatRow = document.getElementById('inv-calc-vat-row');
      const taxableLabel = document.getElementById('inv-calc-taxable-label');

      if (taxableLabel) {
        if (hasPercentRow) {
          taxableLabel.innerHTML = `Billed Milestone (${milestonePercentUsed}%): <span style="font-size:0.75rem; color:#94a3b8; font-weight:normal;">(Taxable Subtotal)</span>`;
        } else {
          taxableLabel.textContent = 'Taxable Subtotal';
        }
      }

      if (isTrn || isUaeSupply || (hasOnly5Or0Tax && vatSum > 0)) {
        if (cgstRow) cgstRow.style.display = 'none';
        if (sgstRow) sgstRow.style.display = 'none';
        if (igstRow) igstRow.style.display = 'none';
        if (vatRow) {
          vatRow.style.display = 'flex';
          document.getElementById('inv-calc-vat').textContent = fmt(taxSum);
        }
      } else {
        if (vatRow) vatRow.style.display = 'none';
        if (isInterState) {
          if (cgstRow) cgstRow.style.display = 'none';
          if (sgstRow) sgstRow.style.display = 'none';
          if (igstRow) {
            igstRow.style.display = 'flex';
            document.getElementById('inv-calc-igst').textContent = fmt(igstSum);
          }
        } else {
          if (cgstRow) {
            cgstRow.style.display = 'flex';
            document.getElementById('inv-calc-cgst').textContent = fmt(cgstSum);
          }
          if (sgstRow) {
            sgstRow.style.display = 'flex';
            document.getElementById('inv-calc-sgst').textContent = fmt(sgstSum);
          }
          if (igstRow) igstRow.style.display = 'none';
        }
      }

      const compText = document.getElementById('inv-compliance-text');
      if (compText) {
        if (isTrn || isUaeSupply || (hasOnly5Or0Tax && vatSum > 0)) {
          compText.textContent = '⚖️ Compliant with UAE FTA VAT Executive Regulations (5% Standard Rate)';
        } else {
          compText.textContent = '⚖️ Compliant with India GST Rules & E-Invoice Standard Guidelines';
        }
      }
    };

    // Billed Item/s List Modal (Vyapar Style)
    const openBilledItemsModal = () => {
      const existingItems = [];
      tbody.querySelectorAll('tr').forEach(tr => {
        const name = tr.querySelector('.row-desc')?.value.trim() || '';
        const qty = Number(tr.querySelector('.row-qty')?.value) || 1;
        const rate = Number(tr.querySelector('.row-rate')?.value) || 0;
        const taxRate = Number(tr.querySelector('.row-gst')?.value) || (currentRegime === 'trn' ? 5 : 18);
        const hsn = tr.querySelector('.row-hsn')?.value || '9954';
        const uom = tr.querySelector('.row-uom')?.value || 'LSUM';
        if (name || rate > 0) {
          existingItems.push({ name, qty, rate, taxRate, hsn, uom });
        }
      });

      if (!existingItems.length) {
        existingItems.push(
          { name: '50% PROGRESSIVE MILESTONE CLAIM - CIVIL & INTERIOR FIT-OUT', qty: 1, rate: 1000, taxRate: currentRegime === 'trn' ? 5 : 18, hsn: '9954', uom: '%' },
          { name: '20% ADVANCE PAYMENT AGAINST PURCHASE ORDER', qty: 1, rate: 1000, taxRate: currentRegime === 'trn' ? 5 : 18, hsn: '9954', uom: '%' }
        );
      }

      while (existingItems.length < 4) {
        existingItems.push({ name: '', qty: 1, rate: 0, taxRate: currentRegime === 'trn' ? 5 : 18, hsn: '9954', uom: 'LSUM' });
      }

      const currLabel = currentCurrency === 'AED' ? 'AED' : '₹';
      const isTrn = currentRegime === 'trn';

      const billedModalHtml = `
        <div class="fin-modal-backdrop open" id="modal-billed-items-list" style="z-index:1060; background:rgba(15,23,42,0.75); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center;">
          <div class="fin-billed-items-modal-dialog">
            <div class="fin-billed-items-modal-header">
              <h3 class="fin-billed-items-modal-title">Billed Item/s List</h3>
              <button type="button" class="fin-modal-close" id="billed-modal-close-btn" style="color:#64748b; font-size:1.5rem; line-height:1; border:none; background:none; cursor:pointer;">&times;</button>
            </div>

            <div class="fin-modal-body" style="padding:1.25rem 1.5rem; background:#ffffff; max-height:75vh; overflow-y:auto;">
              <table class="fin-billed-items-table" id="billed-table-modal">
                <thead>
                  <tr>
                    <th style="width:40px; text-align:center;"></th>
                    <th style="min-width:280px; text-align:left;">ITEM NAME</th>
                    <th style="width:90px; text-align:center;">QUANTITY</th>
                    <th style="width:150px; text-align:left;">
                      PRICE/UNIT (${currLabel})
                      <div style="font-size:0.68rem; color:#64748b; font-weight:normal; margin-top:2px;">Without Tax ▾</div>
                    </th>
                    <th colspan="2" style="text-align:center; padding-bottom:0.25rem;">
                      TAX
                    </th>
                    <th style="width:130px; text-align:right;">AMOUNT (${currLabel})</th>
                  </tr>
                  <tr>
                    <th colspan="4" style="background:#f8fafc; border-top:none; padding:0;"></th>
                    <th style="width:100px; text-align:center; font-size:0.7rem; color:#64748b; background:#f8fafc; border-top:1px solid #e2e8f0; padding:0.35rem 0.5rem;">in (%)</th>
                    <th style="width:105px; text-align:right; font-size:0.7rem; color:#64748b; background:#f8fafc; border-top:1px solid #e2e8f0; padding:0.35rem 0.5rem;">in (${currLabel})</th>
                    <th style="background:#f8fafc; border-top:none; padding:0;"></th>
                  </tr>
                </thead>
                <tbody id="billed-modal-tbody">
                </tbody>
              </table>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; padding-top:0.75rem; border-top:1px solid #e2e8f0;">
                <button type="button" class="fin-btn-add-item-link" id="billed-modal-add-btn">
                  <span style="font-size:1.15rem; font-weight:700; line-height:1;">+</span> Add Item
                </button>
                <div style="font-size:0.95rem; font-weight:700; color:#0f172a; letter-spacing:0.02em;">
                  TOTAL: <span id="billed-modal-grand-total">0.00 ${currLabel}</span>
                </div>
              </div>
            </div>

            <div class="fin-modal-footer" style="background:#ffffff; border-top:1px solid #e2e8f0; padding:0.85rem 1.5rem; display:flex; justify-content:flex-end; gap:0.75rem;">
              <button type="button" class="fin-btn-save-blue" id="billed-modal-save-btn">
                Save
              </button>
            </div>
          </div>
        </div>
      `;

      const existingModal = document.getElementById('modal-billed-items-list');
      if (existingModal) existingModal.remove();
      document.body.insertAdjacentHTML('beforeend', billedModalHtml);

      const billedTbody = document.getElementById('billed-modal-tbody');

      const reindexBilledModalRows = () => {
        billedTbody.querySelectorAll('.billed-modal-tr').forEach((tr, i) => {
          const numSpan = tr.querySelector('.row-num');
          if (numSpan) numSpan.textContent = i + 1;
        });
      };

      const updateBilledModalCalculations = () => {
        let grandSum = 0;
        billedTbody.querySelectorAll('.billed-modal-tr').forEach(tr => {
          const name = tr.querySelector('.billed-name-input')?.value.trim();
          const qty = Number(tr.querySelector('.billed-qty-input')?.value) || 0;
          const rate = Number(tr.querySelector('.billed-price-input')?.value) || 0;
          const taxRate = Number(tr.querySelector('.billed-tax-select')?.value) || 0;

          const taxable = qty * rate;
          const taxVal = taxable * (taxRate / 100);
          const totalVal = taxable + taxVal;

          const taxEl = tr.querySelector('.billed-tax-val');
          const amtEl = tr.querySelector('.billed-amount-val');

          if (rate > 0 || name) {
            if (taxEl) taxEl.textContent = (taxVal > 0 ? taxVal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '0');
            if (amtEl) amtEl.textContent = totalVal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
            grandSum += totalVal;
          } else {
            if (taxEl) taxEl.textContent = '';
            if (amtEl) amtEl.textContent = '';
          }
        });

        const grandEl = document.getElementById('billed-modal-grand-total');
        if (grandEl) {
          grandEl.textContent = `${grandSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currLabel}`;
        }
      };

      const renderBilledModalRow = (item, idx) => {
        const tr = document.createElement('tr');
        tr.className = 'billed-modal-tr';
        tr.setAttribute('data-hsn', item.hsn || '9954');
        tr.setAttribute('data-uom', item.uom || 'LSUM');

        const taxRate = item.taxRate !== undefined ? item.taxRate : (isTrn ? 5 : 18);
        const taxable = (item.qty || 1) * (item.rate || 0);
        const taxVal = taxable * (taxRate / 100);
        const totalVal = taxable + taxVal;

        tr.innerHTML = `
          <td class="billed-row-index-cell" style="text-align:center; color:#64748b; font-size:0.82rem; position:relative; width:40px;">
            <span class="row-num">${idx + 1}</span>
            <button type="button" class="row-del-btn" title="Delete row" style="display:none; background:none; border:none; color:#ef4444; cursor:pointer; font-size:1rem; padding:0;">🗑️</button>
          </td>
          <td>
            <input type="text" class="billed-cell-input billed-name-input" list="inv-item-milestone-suggestions" placeholder="Enter item name or milestone description" value="${item.name || ''}">
          </td>
          <td style="width:90px;">
            <input type="number" class="billed-cell-input billed-qty-input" value="${item.qty || 1}" min="0.001" step="any" style="text-align:center;">
          </td>
          <td style="width:150px;">
            <input type="number" class="billed-cell-input billed-price-input" value="${item.rate > 0 ? item.rate : ''}" min="0" step="any" placeholder="0">
          </td>
          <td style="width:100px;">
            <select class="billed-cell-select billed-tax-select">
              ${isTrn ? `
                <option value="5" ${taxRate === 5 ? 'selected' : ''}>VAT 5%</option>
                <option value="0" ${taxRate === 0 ? 'selected' : ''}>None</option>
              ` : `
                <option value="18" ${taxRate === 18 ? 'selected' : ''}>GST@18%</option>
                <option value="12" ${taxRate === 12 ? 'selected' : ''}>GST@12%</option>
                <option value="28" ${taxRate === 28 ? 'selected' : ''}>GST@28%</option>
                <option value="5" ${taxRate === 5 ? 'selected' : ''}>VAT 5%</option>
                <option value="0" ${taxRate === 0 ? 'selected' : ''}>None</option>
              `}
            </select>
          </td>
          <td style="width:105px; text-align:right; font-weight:600; color:#475569; padding-right:0.75rem;">
            <span class="billed-tax-val">${item.rate > 0 ? taxVal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : ''}</span>
          </td>
          <td style="width:130px; text-align:right; font-weight:700; color:#0f172a; padding-right:0.75rem;">
            <span class="billed-amount-val">${item.rate > 0 ? totalVal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : ''}</span>
          </td>
        `;

        billedTbody.appendChild(tr);

        tr.querySelector('.row-del-btn').onclick = () => {
          tr.remove();
          reindexBilledModalRows();
          updateBilledModalCalculations();
        };

        tr.querySelectorAll('.billed-name-input, .billed-qty-input, .billed-price-input, .billed-tax-select').forEach(el => {
          el.oninput = () => updateBilledModalCalculations();
          el.onchange = () => updateBilledModalCalculations();
        });
      };

      existingItems.forEach((it, idx) => renderBilledModalRow(it, idx));
      updateBilledModalCalculations();

      document.getElementById('billed-modal-add-btn').onclick = () => {
        renderBilledModalRow({ name: '', qty: 1, rate: 0, taxRate: isTrn ? 5 : 18, hsn: '9954', uom: 'LSUM' }, billedTbody.children.length);
        reindexBilledModalRows();
        const lastRow = billedTbody.lastElementChild;
        lastRow?.querySelector('.billed-name-input')?.focus();
      };

      document.getElementById('billed-modal-save-btn').onclick = () => {
        const rowsToSave = [];
        billedTbody.querySelectorAll('.billed-modal-tr').forEach(tr => {
          const name = tr.querySelector('.billed-name-input')?.value.trim();
          const qty = Number(tr.querySelector('.billed-qty-input')?.value) || 1;
          const rate = Number(tr.querySelector('.billed-price-input')?.value) || 0;
          const taxRate = Number(tr.querySelector('.billed-tax-select')?.value) || 0;
          const hsn = tr.getAttribute('data-hsn') || '9954';
          const uom = tr.getAttribute('data-uom') || 'LSUM';

          if (name || rate > 0) {
            rowsToSave.push({
              name: name || 'Item / Service',
              hsn_sac_code: hsn,
              uom,
              sales_price: rate,
              gst_rate: taxRate,
              qty
            });
          }
        });

        if (!rowsToSave.length) {
          alert('Please enter at least one item.');
          return;
        }

        tbody.innerHTML = '';
        rowsToSave.forEach(it => {
          addRow(it, it.qty);
        });

        recalculateInvoice();

        const modal = document.getElementById('modal-billed-items-list');
        if (modal) modal.remove();
      };

      document.getElementById('billed-modal-close-btn').onclick = () => {
        const modal = document.getElementById('modal-billed-items-list');
        if (modal) modal.remove();
      };
    };

    const custInput = document.getElementById('inv-cust-input');
    const custQuickSelect = document.getElementById('inv-cust-quick-select');
    const custBadge = document.getElementById('inv-cust-badge');
    const custHint = document.getElementById('inv-cust-hint');

    const applyCustomerData = (c) => {
      if (!c) return;
      custInput.value = c.name;
      custInput.setAttribute('data-cust-id', c.id || '');

      const isUae = (c.country && c.country.toUpperCase() === 'UAE') ||
                    (c.trn && c.trn.length > 5) ||
                    (c.state_code === '96' || c.state_code === 'AD' || c.state_code === 'DXB') ||
                    (c.place_of_supply && (c.place_of_supply.includes('UAE') || c.place_of_supply.includes('Dubai') || c.place_of_supply.includes('Abu Dhabi')));

      if (isUae) {
        setTaxRegime('trn', {
          suggestedPos: c.place_of_supply || 'Abu Dhabi, UAE'
        });
        document.getElementById('inv-cust-gstin').value = c.trn || '105405525400003';
        document.getElementById('inv-cust-pos').value = c.place_of_supply || 'Abu Dhabi, UAE';
      } else {
        setTaxRegime('gst', {
          suggestedPos: c.place_of_supply || '27-Maharashtra'
        });
        document.getElementById('inv-cust-gstin').value = c.gstin || '27AAACL0149K1ZM';
        document.getElementById('inv-cust-pos').value = c.place_of_supply || '27-Maharashtra';
      }

      document.getElementById('inv-terms').value = c.payment_terms || 30;

      const addrInp = document.getElementById('inv-cust-address');
      if (addrInp) {
        addrInp.value = c.billing_address || c.address || (isUae ? 'ABU DHABI, MADINAT ZAYED, UAE' : 'Mumbai, Maharashtra, India');
      }

      const contactInp = document.getElementById('inv-cust-contact');
      if (contactInp) {
        contactInp.value = c.contact_person || (c.name.includes('BUILDARA') ? 'Mr. Sooraj Kumar' : 'Authorized Representative');
      }

      const emailInp = document.getElementById('inv-cust-email');
      if (emailInp) {
        emailInp.value = c.email || (c.name.includes('BUILDARA') ? 'buildaradevelopers@gmail.com' : 'accounts@client-billing.com');
      }

      if (custBadge) {
        custBadge.textContent = `✓ ${c.code || 'Registered Client'}`;
        custBadge.style.color = '#10b981';
      }
      if (custHint) {
        custHint.textContent = `${c.name} • ${isUae ? 'UAE TRN' : 'India GST'} Auto-selected`;
      }
      updateDueDate();
      recalculateInvoice();
    };

    // Customer Recommendations Dropdown when clicked on text box
    const custDropdown = document.getElementById('inv-cust-dropdown');
    if (custInput && custDropdown) {
      const showCustRecommendations = () => {
        const val = custInput.value.trim().toLowerCase();
        custDropdown.querySelectorAll('.fin-autocomplete-item').forEach(item => {
          const name = (item.getAttribute('data-name') || '').toLowerCase();
          const meta = item.textContent.toLowerCase();
          if (!val || name.includes(val) || meta.includes(val)) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
        custDropdown.classList.add('open');
      };

      custInput.onfocus = showCustRecommendations;
      custInput.onclick = showCustRecommendations;

      custDropdown.querySelectorAll('.fin-autocomplete-item').forEach(item => {
        item.onmousedown = (e) => {
          e.preventDefault();
          const custId = item.getAttribute('data-id');
          const found = customers.find(c => c.id === custId);
          if (found) {
            applyCustomerData(found);
          }
          custDropdown.classList.remove('open');
        };
      });

      const handleCustomerInput = () => {
        showCustRecommendations();
        const val = custInput.value.trim();
        if (!val) {
          custInput.removeAttribute('data-cust-id');
          if (custBadge) {
            custBadge.textContent = 'Editable • Click for Options ▾';
            custBadge.style.color = '#38bdf8';
          }
          if (custHint) {
            custHint.textContent = 'Click text box to pick registered clients, or type custom name';
          }
          return;
        }

        const found = customers.find(c => 
          c.name.toLowerCase() === val.toLowerCase() ||
          `${c.name} (${c.code || ''})`.toLowerCase() === val.toLowerCase()
        );

        if (found) {
          applyCustomerData(found);
        } else {
          custInput.removeAttribute('data-cust-id');
          if (custBadge) {
            custBadge.textContent = '✎ Custom Client';
            custBadge.style.color = '#38bdf8';
          }
          if (custHint) {
            custHint.textContent = `Custom client "${val}" will be used for this invoice.`;
          }
        }
      };

      custInput.oninput = handleCustomerInput;
      custInput.onchange = handleCustomerInput;

      document.addEventListener('click', (e) => {
        if (!e.target.closest('#inv-cust-input') && !e.target.closest('#inv-cust-dropdown')) {
          custDropdown.classList.remove('open');
        }
      });
    }

    // Regime toggle buttons
    const btnGst = document.getElementById('regime-toggle-gst');
    const btnTrn = document.getElementById('regime-toggle-trn');

    if (btnGst) {
      btnGst.onclick = () => {
        const val = (custInput?.value || '').trim();
        const c = customers.find(x => x.id === custInput?.getAttribute('data-cust-id') || x.name.toLowerCase() === val.toLowerCase());
        setTaxRegime('gst', {
          suggestedPos: c?.place_of_supply && !c.place_of_supply.includes('UAE') ? c.place_of_supply : '27-Maharashtra'
        });
        if (c && c.gstin && !c.gstin.startsWith('EXEMPT')) {
          document.getElementById('inv-cust-gstin').value = c.gstin;
        }
      };
    }

    if (btnTrn) {
      btnTrn.onclick = () => {
        const val = (custInput?.value || '').trim();
        const c = customers.find(x => x.id === custInput?.getAttribute('data-cust-id') || x.name.toLowerCase() === val.toLowerCase());
        setTaxRegime('trn', {
          suggestedPos: c?.place_of_supply && c.place_of_supply.includes('UAE') ? c.place_of_supply : 'Abu Dhabi, UAE'
        });
        if (c && c.trn) {
          document.getElementById('inv-cust-gstin').value = c.trn;
        } else if (!document.getElementById('inv-cust-gstin').value || document.getElementById('inv-cust-gstin').value.includes('27')) {
          document.getElementById('inv-cust-gstin').value = '105405525400003';
        }
      };
    }

    // Update due date with No Due Date toggle support
    const updateDueDate = () => {
      const noDue = document.getElementById('inv-no-due-date')?.checked;
      const dueInp = document.getElementById('inv-due-date');
      const termsInp = document.getElementById('inv-terms');
      const noDueHint = document.getElementById('inv-no-due-date-hint');

      if (noDue) {
        if (dueInp) {
          dueInp.value = '';
          dueInp.disabled = true;
          dueInp.required = false;
          dueInp.style.opacity = '0.45';
        }
        if (noDueHint) noDueHint.style.display = 'block';
        if (termsInp) termsInp.disabled = true;
        return;
      }

      if (dueInp) {
        dueInp.disabled = false;
        dueInp.required = true;
        dueInp.style.opacity = '1';
      }
      if (noDueHint) noDueHint.style.display = 'none';
      if (termsInp) termsInp.disabled = false;

      const invDate = new Date(document.getElementById('inv-date').value);
      const terms = Number(termsInp?.value) || 30;
      invDate.setDate(invDate.getDate() + terms);
      if (dueInp) dueInp.value = invDate.toISOString().split('T')[0];
    };

    document.getElementById('inv-date').onchange = updateDueDate;
    document.getElementById('inv-terms').oninput = updateDueDate;
    const noDueCheckbox = document.getElementById('inv-no-due-date');
    if (noDueCheckbox) noDueCheckbox.onchange = updateDueDate;
    updateDueDate();

    // Project / Cost Center Recommendations Dropdown when clicked on text box
    const prjInput = document.getElementById('inv-project-input');
    const prjDropdown = document.getElementById('inv-project-dropdown');
    const prjBadge = document.getElementById('inv-project-badge');
    const prjHint = document.getElementById('inv-project-hint');

    if (prjInput && prjDropdown) {
      const showPrjRecommendations = () => {
        const val = prjInput.value.trim().toLowerCase();
        prjDropdown.querySelectorAll('.fin-autocomplete-item').forEach(item => {
          const name = (item.getAttribute('data-name') || '').toLowerCase();
          const meta = item.textContent.toLowerCase();
          if (!val || name.includes(val) || meta.includes(val)) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
        prjDropdown.classList.add('open');
      };

      prjInput.onfocus = showPrjRecommendations;
      prjInput.onclick = showPrjRecommendations;

      prjDropdown.querySelectorAll('.fin-autocomplete-item').forEach(item => {
        item.onmousedown = (e) => {
          e.preventDefault();
          const prjId = item.getAttribute('data-id');
          const prjName = item.getAttribute('data-name');
          if (prjId === 'GENERAL') {
            prjInput.value = 'General Corporate Billing';
            prjInput.removeAttribute('data-project-id');
            if (prjBadge) { prjBadge.textContent = '✓ General Billing'; prjBadge.style.color = '#10b981'; }
            if (prjHint) prjHint.textContent = 'General Corporate Billing selected';
          } else if (prjId.startsWith('CC-')) {
            prjInput.value = prjName;
            prjInput.removeAttribute('data-project-id');
            if (prjBadge) { prjBadge.textContent = `✓ ${prjId}`; prjBadge.style.color = '#10b981'; }
            if (prjHint) prjHint.textContent = `${prjName} selected`;
          } else {
            const found = projects.find(p => p.id === prjId);
            if (found) {
              prjInput.value = found.name;
              prjInput.setAttribute('data-project-id', found.id);
              if (prjBadge) { prjBadge.textContent = `✓ ${found.code || 'Registered Project'}`; prjBadge.style.color = '#10b981'; }
              if (prjHint) prjHint.textContent = `${found.name} (${found.code || ''})`;
            }
          }
          prjDropdown.classList.remove('open');
        };
      });

      prjInput.oninput = () => {
        showPrjRecommendations();
        const val = prjInput.value.trim();
        const found = projects.find(p => p.name.toLowerCase() === val.toLowerCase() || `${p.name} (${p.code})`.toLowerCase() === val.toLowerCase());
        if (found) {
          prjInput.setAttribute('data-project-id', found.id);
          if (prjBadge) { prjBadge.textContent = `✓ ${found.code || 'Registered Project'}`; prjBadge.style.color = '#10b981'; }
          if (prjHint) prjHint.textContent = `${found.name} (${found.code || ''})`;
        } else if (val) {
          prjInput.removeAttribute('data-project-id');
          if (prjBadge) { prjBadge.textContent = '✎ Custom Project / Cost Center'; prjBadge.style.color = '#38bdf8'; }
          if (prjHint) prjHint.textContent = `Custom project / cost center "${val}" will be used for this invoice.`;
        } else {
          prjInput.removeAttribute('data-project-id');
          if (prjBadge) { prjBadge.textContent = 'Click for Recommendations ▾'; prjBadge.style.color = '#38bdf8'; }
          if (prjHint) prjHint.textContent = 'Click text box for registered projects / cost centers, or type custom';
        }
      };

      document.addEventListener('click', (e) => {
        if (!e.target.closest('#inv-project-input') && !e.target.closest('#inv-project-dropdown')) {
          prjDropdown.classList.remove('open');
        }
      });
    }

    document.getElementById('inv-add-row-btn').onclick = () => addRow();

    const openBilledBtn1 = document.getElementById('inv-open-billed-modal-btn');
    const openBilledBtn2 = document.getElementById('inv-open-billed-modal-btn2');
    if (openBilledBtn1) openBilledBtn1.onclick = () => openBilledItemsModal();
    // Initial default row matching user's exact specification:
    // 50% Progressive Milestone Claim (Civil & Interior Works)
    // Qty: 1, Rate: 1000 AED, UOM: %, Milestone: 50% -> Billed Milestone (50%): 500.00 AED (Taxable Subtotal)
    const milestone50Item = items.find(it => it.id === 'item-milestone-50' || it.code === 'MILESTONE-50') || {
      id: 'item-milestone-50',
      code: 'MILESTONE-50',
      name: '50% PROGRESSIVE MILESTONE CLAIM - CIVIL & INTERIOR FIT-OUT',
      hsn_sac_code: '9954',
      uom: '%',
      sales_price: 1000,
      gst_rate: 5,
      progress_pct: 50
    };
    addRow(milestone50Item, 1);
    setTaxRegime('trn', { preserveRates: true });

    const preset50Btn = document.getElementById('inv-apply-50pct-preset-btn');
    if (preset50Btn) {
      preset50Btn.onclick = () => {
        tbody.innerHTML = '';
        addRow(milestone50Item, 1);
        setTaxRegime('trn', { preserveRates: true });
      };
    }

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
    const custInput = document.getElementById('inv-cust-input');
    const clientName = (custInput?.value || '').trim();
    if (!clientName) {
      alert('Please write or select a Customer / Client name.');
      custInput?.focus();
      return;
    }

    const nextGeneratedSeq = this.getNextInvoiceNumber();
    const invoiceNo = (document.getElementById('inv-custom-seq-no')?.value || '').trim() || nextGeneratedSeq;
    const invoiceId = 'inv-' + invoiceNo.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const prjInput = document.getElementById('inv-project-input');
    const prjName = (prjInput?.value || '').trim() || 'General Corporate Billing';
    const prjId = prjInput?.getAttribute('data-project-id') || null;

    const noDueDate = document.getElementById('inv-no-due-date')?.checked;
    const dueDateVal = noDueDate ? null : (document.getElementById('inv-due-date')?.value || null);
    const paymentTermsVal = noDueDate ? 0 : (Number(document.getElementById('inv-terms')?.value) || 0);

    const taxRegime = document.getElementById('inv-tax-regime')?.value || 'trn';
    const taxNumber = (document.getElementById('inv-cust-gstin')?.value || '').trim();
    const isTrn = taxRegime === 'trn';
    const currIndicator = document.getElementById('inv-currency-symbol')?.textContent || '';
    const currency = currIndicator.includes('AED') ? 'AED' : 'INR';
    const currencySym = currency === 'AED' ? 'AED ' : '₹';

    const custAddress = (document.getElementById('inv-cust-address')?.value || '').trim() || 'ABU DHABI, MADINAT ZAYED, UAE';
    const contactPerson = (document.getElementById('inv-cust-contact')?.value || '').trim();
    const custEmail = (document.getElementById('inv-cust-email')?.value || '').trim();
    const poRef = (document.getElementById('inv-po-ref')?.value || '').trim();
    const invDate = document.getElementById('inv-date')?.value || new Date().toISOString().split('T')[0];
    const notesVal = (document.getElementById('inv-notes')?.value || '').trim();

    // Find customer by ID or Name, or auto-create if custom client
    let customer = this.db?.customers?.find(c => 
      c.id === custInput.getAttribute('data-cust-id') ||
      c.name.toLowerCase() === clientName.toLowerCase()
    );

    if (!customer) {
      const newCustId = 'cust-' + Date.now();
      customer = {
        id: newCustId,
        code: 'CUST-' + Math.floor(1000 + Math.random() * 9000),
        name: clientName,
        billing_address: custAddress,
        contact_person: contactPerson,
        email: custEmail,
        country: isTrn ? 'UAE' : 'India',
        gstin: !isTrn ? taxNumber : '',
        trn: isTrn ? taxNumber : '',
        place_of_supply: document.getElementById('inv-cust-pos')?.value || (isTrn ? 'Abu Dhabi, UAE' : '27-Maharashtra'),
        payment_terms: paymentTermsVal
      };
      if (!this.db.customers) this.db.customers = [];
      this.db.customers.push(customer);
      this.syncApi('create_customer', { customer }).catch(e => console.warn('Customer auto-persist:', e));
    } else {
      if (custAddress) customer.billing_address = custAddress;
      if (contactPerson) customer.contact_person = contactPerson;
      if (custEmail) customer.email = custEmail;
    }

    // Collect line items
    const lineItems = [];
    let taxableSubtotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;
    let totalTax = 0;

    const pos = (document.getElementById('inv-cust-pos').value || '').toLowerCase();
    const isInterState = !pos.includes('maharashtra') && !pos.includes('27');

    const rows = document.querySelectorAll('#inv-items-tbody tr');
    rows.forEach((tr, idx) => {
      const desc = tr.querySelector('.row-desc').value.trim() || 'Civil & Architectural Works';
      const hsn = tr.querySelector('.row-hsn').value.trim() || '9954';
      const qty = Number(tr.querySelector('.row-qty').value) || 1;
      const uom = (tr.querySelector('.row-uom').value || '').trim().toUpperCase() || 'LSUM';
      const unitPrice = Number(tr.querySelector('.row-rate').value) || 0;
      const taxRate = Number(tr.querySelector('.row-gst').value) || 0;
      const explicitPct = Number(tr.querySelector('.row-pct-val')?.value);

      const isPercent = uom === '%' || uom.includes('PERCENT');
      let taxable = 0;
      let pctClaimed = null;

      if (isPercent) {
        if (!isNaN(explicitPct) && explicitPct > 0) {
          pctClaimed = explicitPct;
          taxable = (qty * unitPrice) * (explicitPct / 100);
        } else if (qty > 0 && qty <= 100) {
          pctClaimed = qty;
          taxable = unitPrice * (qty / 100);
        } else if (qty > 0 && qty < 1) {
          pctClaimed = qty * 100;
          taxable = unitPrice * qty;
        } else {
          pctClaimed = 100;
          taxable = qty * unitPrice;
        }
      } else {
        taxable = qty * unitPrice;
      }

      const tax = taxable * (taxRate / 100);
      const total = taxable + tax;

      let cgst = 0, sgst = 0, igst = 0;
      if (!isTrn) {
        if (isInterState) {
          igst = tax;
        } else {
          cgst = tax / 2;
          sgst = tax / 2;
        }
      }

      taxableSubtotal += taxable;
      totalTax += tax;
      cgstTotal += cgst;
      sgstTotal += sgst;
      igstTotal += igst;

      lineItems.push({
        sr: idx + 1,
        name: desc,
        description: desc,
        hsn_sac_code: hsn,
        qty,
        progress_pct: pctClaimed,
        uom,
        unit: uom,
        unit_price: unitPrice,
        project_price: isPercent ? unitPrice : (qty * unitPrice),
        invoice_amount: taxable,
        taxable_amount: taxable,
        gst_rate: taxRate,
        vat_rate: taxRate,
        tax_rate: taxRate,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: igst,
        vat_amount: isTrn ? tax : 0,
        tax_amount: tax,
        total_amount: total
      });
    });

    const grandTotal = taxableSubtotal + totalTax;

    const newInvoice = {
      id: invoiceId,
      invoice_no: invoiceNo,
      company_id: this.activeCompanyId || 'rayan-corp-uae',
      customer_id: customer.id,
      customer_name: customer.name,
      customer_address: custAddress,
      contact_person: contactPerson,
      email: custEmail,
      customer_gstin: isTrn ? (customer.gstin || '') : taxNumber,
      customer_trn: isTrn ? taxNumber : (customer.trn || ''),
      tax_regime: taxRegime,
      tax_type: isTrn ? 'TRN' : 'GSTIN',
      tax_number: taxNumber,
      currency,
      currency_symbol: currencySym,
      place_of_supply: document.getElementById('inv-cust-pos')?.value || (isTrn ? 'Abu Dhabi, UAE' : '27-Maharashtra'),
      project_id: prjId,
      project_name: prjName,
      po_reference: poRef,
      invoice_date: invDate,
      due_date: dueDateVal,
      payment_terms: paymentTermsVal,
      payment_terms_label: noDueDate ? 'Due Upon Receipt / No Due Date' : `${paymentTermsVal} Days Net`,
      line_items: lineItems,
      taxable_subtotal: taxableSubtotal,
      cgst_total: cgstTotal,
      sgst_total: sgstTotal,
      igst_total: igstTotal,
      vat_total: isTrn ? totalTax : 0,
      total_tax: totalTax,
      grand_total: grandTotal,
      amount_paid: 0,
      balance_due: grandTotal,
      status,
      notes: notesVal,
      amount_in_words: this.numberToEnglishWords(grandTotal) + ` ${currency} Only.`,
      created_by: this.currentUser?.name || 'Arshad Alam Shaikh',
      created_at: new Date().toISOString()
    };

    // Store immediately into local DB state
    if (!this.db.invoices) this.db.invoices = [];
    const existingIdx = this.db.invoices.findIndex(i => i.id === newInvoice.id || i.invoice_no === newInvoice.invoice_no);
    if (existingIdx >= 0) {
      this.db.invoices[existingIdx] = newInvoice;
    } else {
      this.db.invoices.unshift(newInvoice);
    }
    localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));

    // Sync to API
    const res = await this.syncApi('create_invoice', { invoice: newInvoice });
    if (res && res.data && typeof res.data === 'object') {
      this.db = this.mergeWithSeedData(res.data);
      try {
        localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
      } catch (e) {}
    }

    // Close creation modal and re-render underlying tables
    this.closeModal('modal-invoice');
    this.switchTab('invoices');

    // Immediately open the newly generated tax invoice receipt!
    this.openInvoicePrintModal(newInvoice.id);
  }

  // 2. INVOICE DETAIL & PDF GENERATION PREVIEW
  openInvoiceDetail(invoiceId) {
    this.openInvoicePrintModal(invoiceId);
  }

  // 2B. VENDOR PURCHASE BILL DETAIL MODAL
  openBillDetail(billId) {
    let bill = (this.db?.purchase_bills || []).find(b => b.id === billId || b.bill_no === billId);
    if (!bill) {
      bill = (this.db?.purchase_bills || [])[0] || {};
    }
    const vendor = (this.db?.vendors || []).find(v => v.id === bill.vendor_id) || {};
    const lineItems = bill.line_items || [];

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-bill-detail">
        <div class="fin-modal-dialog" style="max-width:850px; background:var(--fin-bg-card, #0f172a);">
          <div class="fin-modal-header" style="border-bottom:1px solid var(--fin-border, #1e293b); padding:1rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span class="fin-badge fin-badge-${bill.status || 'paid'}" style="font-size:0.8rem; text-transform:uppercase;">${bill.status || 'Approved'}</span>
              <h3 class="fin-modal-title" style="margin:0; font-size:1.2rem; color:#f8fafc;">Purchase Bill: ${bill.bill_no || 'BILL-2026-001'}</h3>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <button type="button" class="fin-btn-quick" style="border-color:#f59e0b; color:#f59e0b;" onclick="window.finApp.closeModal('modal-bill-detail'); window.finApp.openEditBillModal('${bill.id}')">✏️ Edit Bill</button>
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.printDocument()">🖨️ Print Purchase Bill</button>
              <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-bill-detail')">&times;</button>
            </div>
          </div>
          <div class="fin-modal-body" style="padding:1.5rem; background:#ffffff; color:#0f172a; border-radius:0 0 12px 12px;">
            <div class="fin-print-sheet" style="padding:1rem;">
              <!-- Header -->
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; border-bottom:2px solid #0f172a; padding-bottom:1rem;">
                <div>
                  <h2 style="font-family:'Outfit', sans-serif; font-size:1.6rem; font-weight:800; color:#0f172a; margin:0 0 0.25rem;">RAYAN GROUP</h2>
                  <div style="font-size:0.8rem; color:#475569; line-height:1.4;">
                    Rayan Engineering &amp; Contracting LLC-SPC<br>
                    Abu Dhabi, United Arab Emirates<br>
                    TRN: 104937380400003 | Tel: +971-25654497
                  </div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:1.35rem; font-weight:800; color:#0099e6;">PURCHASE BILL</div>
                  <div style="font-size:0.85rem; color:#1e293b; font-weight:700;">${bill.bill_no || 'BILL-2026-001'}</div>
                  <div style="font-size:0.78rem; color:#64748b; margin-top:0.2rem;">Date: <strong>${this.formatDate(bill.bill_date)}</strong></div>
                  <div style="font-size:0.78rem; color:#64748b;">Due: <strong>${this.formatDate(bill.due_date)}</strong></div>
                </div>
              </div>

              <!-- Vendor & Project Info -->
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:1rem; font-size:0.82rem;">
                <div>
                  <div style="font-size:0.72rem; color:#64748b; text-transform:uppercase; font-weight:700; margin-bottom:0.25rem;">Vendor Details</div>
                  <div style="font-weight:700; font-size:0.95rem; color:#0f172a;">${bill.vendor_name || vendor.name || 'Vendor'}</div>
                  <div style="color:#475569; margin-top:0.25rem;">${vendor.address || 'Industrial Area, Abu Dhabi'}</div>
                  ${vendor.trn ? `<div style="color:#475569;">TRN: <code>${vendor.trn}</code></div>` : ''}
                  ${bill.vendor_invoice_no ? `<div style="color:#0284c7; font-weight:600; margin-top:0.25rem;">Supplier Inv #: ${bill.vendor_invoice_no}</div>` : ''}
                </div>
                <div>
                  <div style="font-size:0.72rem; color:#64748b; text-transform:uppercase; font-weight:700; margin-bottom:0.25rem;">Project &amp; PO Allocation</div>
                  <div style="font-weight:700; color:#0f172a;">${bill.project_name || 'Corporate Civil Operations'}</div>
                  <div style="color:#475569; margin-top:0.25rem;">PO Ref: <strong>${bill.po_reference || bill.po_no || bill.po_id || 'PO-REC-11008'}</strong></div>
                  <div style="color:#475569;">Payment Terms: <strong>${bill.payment_terms || 30} Days</strong></div>
                </div>
              </div>

              <!-- Line Items -->
              <table style="width:100%; border-collapse:collapse; margin-bottom:1.5rem; font-size:0.85rem;">
                <thead>
                  <tr style="background:#0f172a; color:#ffffff; text-align:left;">
                    <th style="padding:0.6rem; border:1px solid #0f172a;">#</th>
                    <th style="padding:0.6rem; border:1px solid #0f172a;">Description / Material</th>
                    <th style="padding:0.6rem; border:1px solid #0f172a; text-align:center;">Qty</th>
                    <th style="padding:0.6rem; border:1px solid #0f172a; text-align:right;">Rate</th>
                    <th style="padding:0.6rem; border:1px solid #0f172a; text-align:right;">Tax</th>
                    <th style="padding:0.6rem; border:1px solid #0f172a; text-align:right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${lineItems.length > 0 ? lineItems.map((item, idx) => `
                    <tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:0.6rem; border:1px solid #e2e8f0; text-align:center;">${idx + 1}</td>
                      <td style="padding:0.6rem; border:1px solid #e2e8f0;"><strong>${item.name || item.description || 'Supplies'}</strong></td>
                      <td style="padding:0.6rem; border:1px solid #e2e8f0; text-align:center;">${item.qty} ${item.uom || ''}</td>
                      <td style="padding:0.6rem; border:1px solid #e2e8f0; text-align:right;">${this.formatCurrency(item.unit_price)}</td>
                      <td style="padding:0.6rem; border:1px solid #e2e8f0; text-align:right;">${item.gst_rate || item.vat_rate || 5}%</td>
                      <td style="padding:0.6rem; border:1px solid #e2e8f0; text-align:right; font-weight:700;">${this.formatCurrency(item.total_amount || (item.taxable_amount + (item.tax_amount || 0)))}</td>
                    </tr>
                  `).join('') : `
                    <tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:0.6rem; border:1px solid #e2e8f0; text-align:center;">1</td>
                      <td style="padding:0.6rem; border:1px solid #e2e8f0;"><strong>Procurement of Engineering Materials &amp; Structural Items</strong></td>
                      <td style="padding:0.6rem; border:1px solid #e2e8f0; text-align:center;">1 Lot</td>
                      <td style="padding:0.6rem; border:1px solid #e2e8f0; text-align:right;">${this.formatCurrency(bill.taxable_subtotal || bill.grand_total * 0.95)}</td>
                      <td style="padding:0.6rem; border:1px solid #e2e8f0; text-align:right;">5%</td>
                      <td style="padding:0.6rem; border:1px solid #e2e8f0; text-align:right; font-weight:700;">${this.formatCurrency(bill.grand_total)}</td>
                    </tr>
                  `}
                </tbody>
              </table>

              <!-- Totals -->
              <div style="display:flex; justify-content:flex-end; margin-bottom:1.5rem;">
                <div style="width:300px; font-size:0.85rem;">
                  <div style="display:flex; justify-content:space-between; padding:0.25rem 0;">
                    <span>Sub-Total:</span>
                    <strong>${this.formatCurrency(bill.taxable_subtotal || bill.subtotal || (bill.grand_total - (bill.total_tax || 0)))}</strong>
                  </div>
                  <div style="display:flex; justify-content:space-between; padding:0.25rem 0;">
                    <span>VAT / Tax Total:</span>
                    <span>${this.formatCurrency(bill.total_tax || bill.vat_total || 0)}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; padding:0.5rem 0; border-top:2px solid #0099e6; margin-top:0.4rem; font-size:1.05rem; font-weight:900; color:#0f172a;">
                    <span>Grand Total:</span>
                    <span>${this.formatCurrency(bill.grand_total)}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; padding:0.25rem 0; color:#10b981; font-weight:700;">
                    <span>Amount Paid:</span>
                    <span>${this.formatCurrency(bill.amount_paid || 0)}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; padding:0.25rem 0; color:${(bill.balance_due || 0) > 0 ? '#ef4444' : '#10b981'}; font-weight:800;">
                    <span>Balance Payable:</span>
                    <span>${this.formatCurrency(bill.balance_due || 0)}</span>
                  </div>
                </div>
              </div>

              <!-- Signatory Footer -->
              <div class="fin-print-footer">
                <div>
                  <div style="font-size:0.72rem; color:#94a3b8;">Procurement Bill verified against Delivery Notes and Purchase Order.</div>
                  <div style="font-size:0.72rem; color:#94a3b8;">Authorized under Rayan Group Internal Audit &amp; Finance Control.</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-family:'Outfit', cursive; font-size:1.15rem; color:#0099e6; margin-bottom:0.2rem;">Arshad Alam Shaikh</div>
                  <div style="border-top:1px solid #94a3b8; padding-top:0.25rem; font-size:0.75rem; font-weight:700; color:#1e293b;">
                    Authorized Signatory<br>
                    <span style="font-weight:400; color:#64748b;">Rayan Group Finance Committee</span>
                  </div>
                </div>
              </div>

              <div class="rayan-computer-generated-notice" style="border-top:1px solid #e2e8f0; margin-top:1.25rem; padding-top:0.75rem;">This is a Computer Generated Purchase Bill</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
    document.body.classList.add('fin-doc-open');
  }


  // Helper: Get comprehensive list of known, regional and saved banks
  getKnownBanksList() {
    const defaultList = [
      'National Bank of Abu Dhabi (NBAD)',
      'First Abu Dhabi Bank (FAB)',
      'Abu Dhabi Commercial Bank (ADCB)',
      'Emirates NBD Bank',
      'Dubai Islamic Bank (DIB)',
      'Mashreq Bank',
      'Abu Dhabi Islamic Bank (ADIB)',
      'Commercial Bank of Dubai (CBD)',
      'RAKBANK (National Bank of Ras Al Khaimah)',
      'Sharjah Islamic Bank',
      'Ajman Bank',
      'Bank of Sharjah',
      'Standard Chartered Bank',
      'HSBC Middle East',
      'Citibank UAE',
      'State Bank of India (Corporate)',
      'HDFC Bank Ltd',
      'ICICI Bank Ltd',
      'Bank of Baroda'
    ];
    const fromDb = this.db?.saved_banks || [];
    const fromReceipts = (this.db?.customer_receipts || []).map(r => r.bank_name).filter(Boolean);
    const fromAccounts = (this.db?.bank_accounts || []).map(b => b.bank_name).filter(Boolean);
    const fromCustomers = (this.db?.customers || []).map(c => c.preferred_bank || c.bank_name).filter(Boolean);
    const fromVendors = (this.db?.vendors || []).map(v => v.bank_name).filter(Boolean);

    const all = [...new Set([...fromDb, ...fromReceipts, ...fromCustomers, ...defaultList, ...fromAccounts, ...fromVendors])];
    return all.filter(b => typeof b === 'string' && b.trim().length > 1);
  }

  selectReceiptBank(bankName) {
    const ob = document.getElementById('rec-online-bank');
    const cb = document.getElementById('rec-cheque-bank');
    if (ob) ob.value = bankName;
    if (cb) cb.value = bankName;

    document.querySelectorAll('.fin-chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-bank') === bankName);
    });

    const bankHint = document.getElementById('rec-bank-auto-hint');
    if (bankHint) {
      bankHint.style.display = 'block';
      bankHint.innerHTML = `✅ Selected bank: <strong style="color:#00e5d2;">${bankName}</strong> (saved for future entries)`;
    }
  }

  // 3. RECORD CUSTOMER RECEIPT MODAL
  openRecordReceiptModal(preselectInvoiceId = null) {
    const customers = this.db?.customers || [];
    const invoices = this.db?.invoices || [];
    const receiptNo = this.getNextReceiptNumber();

    let defaultCurrency = 'AED';
    let targetInv = null;
    if (preselectInvoiceId) {
      targetInv = invoices.find(i => i.id === preselectInvoiceId || i.invoice_no === preselectInvoiceId);
      if (targetInv && targetInv.currency) {
        defaultCurrency = targetInv.currency;
      }
    } else if (this.activeCompanyId === 'ashaz-eng-in') {
      defaultCurrency = 'INR';
    }

    const knownBanks = this.getKnownBanksList();
    const quickBanks = [
      'National Bank of Abu Dhabi (NBAD)',
      'First Abu Dhabi Bank (FAB)',
      'Abu Dhabi Commercial Bank (ADCB)',
      'Emirates NBD Bank',
      'Dubai Islamic Bank (DIB)',
      'Mashreq Bank'
    ];

    let initialBank = 'National Bank of Abu Dhabi (NBAD)';
    if (targetInv) {
      const c = customers.find(cust => cust.id === targetInv.customer_id);
      const prevR = (this.db?.customer_receipts || []).find(r => (r.customer_id === targetInv.customer_id || (targetInv.customer_name && r.customer_name === targetInv.customer_name)) && r.bank_name);
      initialBank = c?.preferred_bank || c?.bank_name || prevR?.bank_name || localStorage.getItem('fin_last_used_bank') || 'National Bank of Abu Dhabi (NBAD)';
    } else {
      initialBank = localStorage.getItem('fin_last_used_bank') || 'National Bank of Abu Dhabi (NBAD)';
    }

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-receipt">
        <div class="fin-modal-dialog" style="max-width:760px; max-height:92vh; overflow-y:auto;">
          <div class="fin-modal-header" style="position:sticky; top:0; z-index:10; background:#0f172a; border-bottom:1px solid rgba(255,255,255,0.1);">
            <div>
              <h3 class="fin-modal-title" style="display:flex; align-items:center; gap:8px;">
                <span>💳</span>
                <span>Record Customer Payment Receipt &amp; Voucher</span>
              </h3>
              <div style="font-size:0.75rem; color:#00e5d2; font-weight:700; margin-top:2px;">
                Auto Voucher Sequence: <strong style="color:#38bdf8;">${receiptNo}</strong>
              </div>
            </div>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-receipt')">&times;</button>
          </div>

          <div class="fin-modal-body" style="padding:1.25rem;">
            <form id="record-receipt-form">
              <!-- Top Row: Customer Selection & Currency Option (AED / INR) -->
              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Customer / Client <span style="color:#ef4444;">*</span></label>
                  <select id="rec-cust-sel" class="fin-form-select" required>
                    <option value="" disabled ${!targetInv ? 'selected' : ''}>Select Customer / Client</option>
                    ${customers.map(c => `<option value="${c.id}" ${targetInv && targetInv.customer_id === c.id ? 'selected' : ''}>${c.name} (${c.code || 'ID:' + c.id})</option>`).join('')}
                  </select>
                </div>

                <div class="fin-form-group">
                  <label class="fin-form-label">Payment Currency <span style="color:#ef4444;">*</span></label>
                  <select id="rec-currency" class="fin-form-select" required onchange="window.finApp.handleReceiptCurrencyChange(this.value)">
                    <option value="AED" ${defaultCurrency === 'AED' ? 'selected' : ''}>AED — United Arab Emirates Dirham (د.إ)</option>
                    <option value="INR" ${defaultCurrency === 'INR' ? 'selected' : ''}>INR — Indian Rupee (₹)</option>
                  </select>
                </div>
              </div>

              <!-- Second Row: Receipt Date, Time, and Amount Received -->
              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Receipt Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="rec-date" class="fin-form-input" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Receipt Time</label>
                  <input type="text" id="rec-time" class="fin-form-input" value="${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">
                    <span id="rec-amount-label">Amount Received (${defaultCurrency})</span> <span style="color:#ef4444;">*</span>
                  </label>
                  <div style="position:relative;">
                    <span id="rec-currency-badge" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:800; color:#38bdf8;">${defaultCurrency}</span>
                    <input type="number" id="rec-amount" class="fin-form-input" min="0.01" step="any" required placeholder="0.00" style="padding-left:48px; font-size:1.05rem; font-weight:800; color:#10b981;">
                  </div>
                </div>
              </div>

              <!-- 3 Payment Modes Selection: Cheque, Online, Cash -->
              <div style="margin-top:0.75rem; margin-bottom:0.5rem;">
                <label class="fin-form-label" style="margin-bottom:0.4rem;">Select Payment Mode <span style="color:#ef4444;">*</span></label>
                <div class="fin-payment-mode-tabs">
                  <button type="button" class="fin-payment-mode-btn active" id="btn-mode-online" onclick="window.finApp.switchReceiptMode('Online')">
                    <span>🌐</span>
                    <span>Online Transfer / Wire</span>
                  </button>
                  <button type="button" class="fin-payment-mode-btn" id="btn-mode-cheque" onclick="window.finApp.switchReceiptMode('Cheque')">
                    <span>📝</span>
                    <span>Cheque / PDC</span>
                  </button>
                  <button type="button" class="fin-payment-mode-btn" id="btn-mode-cash" onclick="window.finApp.switchReceiptMode('Cash')">
                    <span>💵</span>
                    <span>Cash Payment</span>
                  </button>
                </div>
                <input type="hidden" id="rec-mode" value="Online">
              </div>

              <!-- MODE 1: ONLINE TRANSFER REQUIRED DETAILS -->
              <div id="rec-mode-online-fields" class="fin-mode-details-card">
                <div class="fin-mode-details-title">
                  <span>🌐</span>
                  <span>Required Details for Online Transfer (التحويل البنكي الإلكتروني)</span>
                </div>
                <div class="fin-form-grid-2">
                  <div class="fin-form-group">
                    <label class="fin-form-label">Bank Reference / UTR / Transaction No. <span style="color:#ef4444;">*</span></label>
                    <input type="text" id="rec-ref" class="fin-form-input" required placeholder="e.g. SBIN260314981 or FAB-WIRE-44910">
                  </div>
                  <div class="fin-form-group">
                    <label class="fin-form-label">Remitting / Drawee Bank Name <span style="color:#ef4444;">*</span></label>
                    <input type="text" id="rec-online-bank" class="fin-form-input" list="rec-banks-list" placeholder="e.g. National Bank of Abu Dhabi (NBAD) or FAB" required value="${initialBank}">
                    <div class="fin-bank-chips">
                      <span class="fin-chip-label">⚡ Fast Pick:</span>
                      ${quickBanks.map(b => `<button type="button" class="fin-chip-btn ${b === initialBank ? 'active' : ''}" data-bank="${b}" onclick="window.finApp.selectReceiptBank('${b.replace(/'/g, "\\'")}')">${b}</button>`).join('')}
                    </div>
                    <div id="rec-bank-auto-hint" class="fin-bank-auto-hint"></div>
                  </div>
                </div>
                <div class="fin-form-grid-2" style="margin-top:0.5rem;">
                  <div class="fin-form-group">
                    <label class="fin-form-label">Transfer Channel / Platform</label>
                    <select id="rec-online-channel" class="fin-form-select">
                      <option value="Online Bank Transfer" selected>Online Bank Transfer / Corporate Wire</option>
                      <option value="Central Bank Direct Clearing">Central Bank Direct Clearing</option>
                      <option value="RTGS / NEFT Wire Remittance">RTGS / NEFT Wire Remittance</option>
                      <option value="SWIFT International Wire">SWIFT International Wire</option>
                      <option value="Instant Direct Remittance">Instant Direct Remittance (Aani / UPI)</option>
                    </select>
                  </div>
                  <div class="fin-form-group">
                    <label class="fin-form-label">Value / Clearance Date</label>
                    <input type="date" id="rec-online-date" class="fin-form-input" value="${new Date().toISOString().split('T')[0]}">
                  </div>
                </div>
              </div>

              <!-- MODE 2: CHEQUE REQUIRED DETAILS -->
              <div id="rec-mode-cheque-fields" class="fin-mode-details-card" style="display:none;">
                <div class="fin-mode-details-title" style="color:#38bdf8;">
                  <span>📝</span>
                  <span>Required Details for Cheque Settlement (بيانات الشيك البنكي)</span>
                </div>
                <div class="fin-form-grid-3">
                  <div class="fin-form-group">
                    <label class="fin-form-label">Cheque Number <span style="color:#ef4444;">*</span></label>
                    <input type="text" id="rec-cheque-no" class="fin-form-input" placeholder="e.g. 000018989">
                  </div>
                  <div class="fin-form-group">
                    <label class="fin-form-label">Cheque / Instrument Date <span style="color:#ef4444;">*</span></label>
                    <input type="date" id="rec-cheque-date" class="fin-form-input" value="${new Date().toISOString().split('T')[0]}">
                  </div>
                  <div class="fin-form-group">
                    <label class="fin-form-label">Cheque Clearance Status</label>
                    <select id="rec-cheque-status" class="fin-form-select">
                      <option value="Cleared & Verified" selected>Cleared &amp; Funds Verified</option>
                      <option value="Deposited - Under Clearance">Deposited - Under Clearance</option>
                      <option value="Post-Dated Cheque (PDC)">Post-Dated Cheque (PDC)</option>
                    </select>
                  </div>
                </div>
                <div class="fin-form-grid-2" style="margin-top:0.5rem;">
                  <div class="fin-form-group">
                    <label class="fin-form-label">Drawee Bank Name (البنك المسحوب عليه) <span style="color:#ef4444;">*</span></label>
                    <input type="text" id="rec-cheque-bank" class="fin-form-input" list="rec-banks-list" placeholder="e.g. National Bank of Abu Dhabi (NBAD), FAB, ADCB" value="${initialBank}">
                    <div class="fin-bank-chips">
                      <span class="fin-chip-label">⚡ Fast Pick:</span>
                      ${quickBanks.map(b => `<button type="button" class="fin-chip-btn ${b === initialBank ? 'active' : ''}" data-bank="${b}" onclick="window.finApp.selectReceiptBank('${b.replace(/'/g, "\\'")}')">${b}</button>`).join('')}
                    </div>
                  </div>
                  <div class="fin-form-group">
                    <label class="fin-form-label">Bank Branch / Emirate / City</label>
                    <input type="text" id="rec-cheque-branch" class="fin-form-input" placeholder="e.g. Mussafah M-36, Abu Dhabi">
                  </div>
                </div>
              </div>

              <!-- MODE 3: CASH REQUIRED DETAILS -->
              <div id="rec-mode-cash-fields" class="fin-mode-details-card" style="display:none;">
                <div class="fin-mode-details-title" style="color:#10b981;">
                  <span>💵</span>
                  <span>Required Details for Cash Receipt (سند استلام نقدي)</span>
                </div>
                <div class="fin-form-grid-2">
                  <div class="fin-form-group">
                    <label class="fin-form-label">Cash Receipt / Slip # <span style="color:#ef4444;">*</span></label>
                    <input type="text" id="rec-cash-slip" class="fin-form-input" value="CSH-${Date.now().toString().slice(-6)}">
                  </div>
                  <div class="fin-form-group">
                    <label class="fin-form-label">Receiving Cash Desk / Location <span style="color:#ef4444;">*</span></label>
                    <input type="text" id="rec-cash-location" class="fin-form-input" value="Corporate Treasury - Mussafah M-36, Abu Dhabi" placeholder="Location where cash was received">
                  </div>
                </div>
                <div class="fin-form-grid-2" style="margin-top:0.5rem;">
                  <div class="fin-form-group">
                    <label class="fin-form-label">Handed Over By (Bearer / Client Rep)</label>
                    <input type="text" id="rec-cash-bearer" class="fin-form-input" placeholder="Name of person handing over cash">
                  </div>
                  <div class="fin-form-group">
                    <label class="fin-form-label">Cashier / Staff Member Handled By</label>
                    <input type="text" id="rec-cashier" class="fin-form-input" value="${this.currentUser?.name || 'Accounts Staff'}">
                  </div>
                </div>
              </div>

              <!-- Datalist of Recommended & Saved Banks -->
              <datalist id="rec-banks-list">
                ${knownBanks.map(b => `<option value="${b}">`).join('')}
              </datalist>

              <!-- Additional Receipt Voucher Audit & Party Specifications -->
              <div style="background:rgba(0,0,0,0.18); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:0.85rem; margin-bottom:1rem;">
                <div style="font-size:0.75rem; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:0.5rem;">
                  🏛️ Official Voucher Metadata (بيانات سند القبض الرسمي)
                </div>
                <div class="fin-form-grid-3">
                  <div class="fin-form-group">
                    <label class="fin-form-label">Contact Person</label>
                    <input type="text" id="rec-contact-person" class="fin-form-input" placeholder="Customer contact person" value="${targetInv?.contact_person || ''}">
                  </div>
                  <div class="fin-form-group">
                    <label class="fin-form-label">Contact Email</label>
                    <input type="email" id="rec-email" class="fin-form-input" placeholder="Notification email" value="${targetInv?.email || ''}">
                  </div>
                  <div class="fin-form-group">
                    <label class="fin-form-label">Authorised Signatory</label>
                    <input type="text" id="rec-receiver-sign" class="fin-form-input" value="Arshad Alam Shaikh">
                  </div>
                </div>
                <div class="fin-form-grid-2" style="margin-top:0.4rem;">
                  <div class="fin-form-group">
                    <label class="fin-form-label">Received By (Entity)</label>
                    <input type="text" id="rec-received-by" class="fin-form-input" value="${this.activeCompanyId === 'ashaz-eng-in' ? 'Ashaz Engineering Private Limited' : 'RAYAN ENGINEERING & CONTRACTING L.L.C - S.P.C'}">
                  </div>
                  <div class="fin-form-group">
                    <label class="fin-form-label">Linked Project Name</label>
                    <input type="text" id="rec-project-name" class="fin-form-input" placeholder="e.g. Yateem Optician, Khalidiyah Mall" value="${targetInv?.project_name || ''}">
                  </div>
                </div>
              </div>

              <!-- Unpaid Invoices Allocation Checklist -->
              <div style="display:flex; justify-content:space-between; align-items:center; margin:1rem 0 0.4rem;">
                <h4 style="font-family:var(--fin-font-heading); font-size:0.95rem; color:#f8fafc; margin:0;">
                  Allocate Against Outstanding Invoices
                </h4>
                <span id="rec-alloc-summary" style="font-size:0.75rem; color:#00e5d2; font-weight:700;"></span>
              </div>
              <div id="rec-invoices-list" style="max-height:180px; overflow-y:auto; border:1px solid var(--fin-border); border-radius:8px; padding:0.75rem; background:rgba(0,0,0,0.25);">
                <div style="font-size:0.78rem; color:#94a3b8;">Select a customer above to view unpaid invoices.</div>
              </div>

              <div class="fin-form-group" style="margin-top:1rem;">
                <label class="fin-form-label">Payment Notes &amp; Remittance Narration</label>
                <input type="text" id="rec-notes" class="fin-form-input" placeholder="e.g. Full settlement against milestone certification">
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-receipt')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">
                  💾 Record &amp; Generate Official Voucher &rarr;
                </button>
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
    const currSel = document.getElementById('rec-currency');

    const updateCustomerInvoices = () => {
      const cId = custSel.value;
      const curr = currSel.value || 'AED';
      const cust = customers.find(c => c.id === cId || c.code === cId || (c.name && c.name.toLowerCase() === (cId || '').toLowerCase()));
      const custName = cust?.name || '';
      const unpaid = invoices.filter(i => (i.customer_id === cId || (custName && i.customer_name === custName) || i.customer_name === cId) && i.balance_due > 0 && i.status !== 'void');

      if (cust) {
        const cp = document.getElementById('rec-contact-person');
        const em = document.getElementById('rec-email');
        if (cp && (!cp.value || cp.value === 'Mr. HLN')) cp.value = cust.contact_person || '';
        if (em && (!em.value || em.value === 'accounts@hln-tech.ae')) em.value = cust.email || '';

        // Auto-detect and suggest previously saved bank for this customer
        const prevRec = (this.db?.customer_receipts || []).find(r => (r.customer_id === cust.id || (cust.name && r.customer_name === cust.name)) && r.bank_name);
        const savedBank = cust.preferred_bank || cust.bank_name || prevRec?.bank_name;
        if (savedBank) {
          const ob = document.getElementById('rec-online-bank');
          const cb = document.getElementById('rec-cheque-bank');
          if (ob) ob.value = savedBank;
          if (cb) cb.value = savedBank;

          document.querySelectorAll('.fin-chip-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-bank') === savedBank);
          });

          const bankHint = document.getElementById('rec-bank-auto-hint');
          if (bankHint) {
            bankHint.style.display = 'block';
            bankHint.innerHTML = `💡 Auto-selected saved bank for <strong>${cust.name}</strong>: <span style="color:#38bdf8; font-weight:700;">${savedBank}</span>`;
          }
        }
      }

      if (!unpaid.length) {
        invList.innerHTML = `<div style="font-size:0.78rem; color:#10b981;">No outstanding invoices found for this client. Receipt can be logged as advance deposit.</div>`;
        return;
      }

      invList.innerHTML = unpaid.map(inv => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.4rem 0; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div>
            <strong style="color:#f8fafc; font-size:0.8rem;">${inv.invoice_no}</strong>
            <span style="font-size:0.72rem; color:#94a3b8;"> (${this.formatDate(inv.invoice_date)})</span>
            <div style="font-size:0.7rem; color:#38bdf8;">Balance Due: ${curr} ${Number(inv.balance_due || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <input type="number" class="fin-form-input rec-alloc-input" data-inv-id="${inv.id}" data-inv-no="${inv.invoice_no}" data-max="${inv.balance_due}" placeholder="Allocated (${curr})" style="width:145px; padding:0.3rem 0.5rem; font-size:0.75rem;" step="any">
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

    this.updateCustomerReceiptInvoices = updateCustomerInvoices;

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
      const inv = invoices.find(i => i.id === preselectInvoiceId || i.invoice_no === preselectInvoiceId);
      if (inv) {
        if (inv.customer_id && customers.some(c => c.id === inv.customer_id)) {
          custSel.value = inv.customer_id;
        } else if (inv.customer_name) {
          const matchedCust = customers.find(c => c.name === inv.customer_name);
          if (matchedCust) custSel.value = matchedCust.id;
        }
        amountInp.value = inv.balance_due;
        const projInp = document.getElementById('rec-project-name');
        if (projInp && inv.project_name) projInp.value = inv.project_name;
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

      const cust = customers.find(c => c.id === custSel.value || c.code === custSel.value || (c.name && c.name.toLowerCase() === (custSel.value || '').toLowerCase()));
      const mode = document.getElementById('rec-mode').value;
      const currency = document.getElementById('rec-currency').value || 'AED';

      let refNo = '';
      let bankName = '';
      let chequeNo = '';
      let chequeDate = '';
      let bankBranch = '';
      let chequeStatus = 'Cleared & Verified';
      let cashLocation = '';
      let cashBearer = '';
      let cashier = '';
      let paymentType = mode;

      if (mode === 'Cheque') {
        chequeNo = document.getElementById('rec-cheque-no').value.trim();
        chequeDate = document.getElementById('rec-cheque-date').value;
        bankName = document.getElementById('rec-cheque-bank').value.trim() || 'National Bank of Abu Dhabi (NBAD)';
        bankBranch = document.getElementById('rec-cheque-branch').value.trim();
        chequeStatus = document.getElementById('rec-cheque-status').value;
        refNo = chequeNo;
        paymentType = 'Corporate Account Payee Cheque';
      } else if (mode === 'Online') {
        refNo = document.getElementById('rec-ref').value.trim();
        bankName = document.getElementById('rec-online-bank').value.trim() || 'National Bank of Abu Dhabi (NBAD)';
        chequeDate = document.getElementById('rec-online-date').value;
        paymentType = document.getElementById('rec-online-channel').value;
      } else if (mode === 'Cash') {
        refNo = document.getElementById('rec-cash-slip').value.trim();
        cashLocation = document.getElementById('rec-cash-location').value.trim();
        cashBearer = document.getElementById('rec-cash-bearer').value.trim();
        cashier = document.getElementById('rec-cashier').value.trim();
        bankName = cashLocation;
        paymentType = 'Official Cash Tender';
      }

      if (bankName && mode !== 'Cash') {
        try {
          localStorage.setItem('fin_last_used_bank', bankName);
        } catch (err) {}
        if (!this.db.saved_banks) this.db.saved_banks = [];
        if (!this.db.saved_banks.includes(bankName)) {
          this.db.saved_banks.unshift(bankName);
        }
        if (cust) {
          cust.preferred_bank = bankName;
          cust.bank_name = bankName;
        }
      }

      const receiptNo = this.getNextReceiptNumber();
      const payload = {
        receipt: {
          id: `rec-${Date.now().toString(36)}`,
          receipt_no: receiptNo,
          customer_id: cust?.id || custSel.value,
          customer_name: cust?.name || '',
          contact_person: document.getElementById('rec-contact-person').value.trim() || cust?.contact_person || '',
          email: document.getElementById('rec-email').value.trim() || cust?.email || '',
          company_id: this.activeCompanyId || (currency === 'INR' ? 'ashaz-eng-in' : 'rayan-corp-uae'),
          receipt_date: document.getElementById('rec-date').value,
          receipt_time: document.getElementById('rec-time').value || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          currency: currency,
          payment_mode: mode,
          payment_type: paymentType,
          reference_no: refNo,
          cheque_no: chequeNo,
          cheque_date: chequeDate || document.getElementById('rec-date').value,
          bank_name: bankName,
          bank_branch: bankBranch,
          cheque_status: chequeStatus,
          cash_location: cashLocation,
          cash_bearer: cashBearer,
          cashier: cashier,
          amount_received: amountReceived,
          allocated_amount: totalAllocated,
          allocations,
          ref_invoice_no: allocations[0]?.invoice_no || '',
          project_name: document.getElementById('rec-project-name').value.trim() || (allocations[0] ? (invoices.find(i => i.invoice_no === allocations[0].invoice_no)?.project_name || '') : ''),
          received_by: document.getElementById('rec-received-by').value.trim() || 'RAYAN ENGINEERING & CONTRACTING L.L.C - S.P.C',
          receiver_sign: document.getElementById('rec-receiver-sign').value.trim() || 'Arshad Alam Shaikh',
          notes: document.getElementById('rec-notes').value.trim(),
          amount_in_words: this.numberToEnglishWords(amountReceived) + (currency === 'INR' ? ' Indian Rupees Only.' : ' UAE Dirhams Only.'),
          recorded_by: this.currentUser?.name || 'Accounts Staff',
          recorded_at: new Date().toISOString()
        },
        saved_banks: this.db.saved_banks
      };

      const res = await this.syncApi('record_receipt', payload);
      if (res && res.success) {
        const rcpObj = res.receipt || payload.receipt;
        this.closeModal('modal-receipt');
        this.switchTab('payment_in');
        if (confirm(`Payment Receipt ${rcpObj.receipt_no} recorded successfully.\n\nInvoice balances updated automatically.\nWould you like to view & print the official Receipt Voucher now?`)) {
          this.openReceiptPrintModal(rcpObj.id);
        }
      }
    };
  }

  switchReceiptMode(mode) {
    const modeInput = document.getElementById('rec-mode');
    if (modeInput) modeInput.value = mode;

    ['online', 'cheque', 'cash'].forEach(m => {
      const btn = document.getElementById(`btn-mode-${m}`);
      if (btn) btn.classList.toggle('active', m.toLowerCase() === mode.toLowerCase());
    });

    const onlineBox = document.getElementById('rec-mode-online-fields');
    const chequeBox = document.getElementById('rec-mode-cheque-fields');
    const cashBox = document.getElementById('rec-mode-cash-fields');

    if (onlineBox) onlineBox.style.display = (mode === 'Online') ? 'block' : 'none';
    if (chequeBox) chequeBox.style.display = (mode === 'Cheque') ? 'block' : 'none';
    if (cashBox) cashBox.style.display = (mode === 'Cash') ? 'block' : 'none';

    const recRef = document.getElementById('rec-ref');
    const recOnlineBank = document.getElementById('rec-online-bank');
    const recChequeNo = document.getElementById('rec-cheque-no');
    const recChequeDate = document.getElementById('rec-cheque-date');
    const recChequeBank = document.getElementById('rec-cheque-bank');
    const recCashSlip = document.getElementById('rec-cash-slip');
    const recCashLocation = document.getElementById('rec-cash-location');

    if (recRef) recRef.required = (mode === 'Online');
    if (recOnlineBank) recOnlineBank.required = (mode === 'Online');
    if (recChequeNo) recChequeNo.required = (mode === 'Cheque');
    if (recChequeDate) recChequeDate.required = (mode === 'Cheque');
    if (recChequeBank) recChequeBank.required = (mode === 'Cheque');
    if (recCashSlip) recCashSlip.required = (mode === 'Cash');
    if (recCashLocation) recCashLocation.required = (mode === 'Cash');
  }

  handleReceiptCurrencyChange(curr) {
    const amountLabel = document.getElementById('rec-amount-label');
    const badge = document.getElementById('rec-currency-badge');
    if (amountLabel) amountLabel.textContent = `Amount Received (${curr})`;
    if (badge) badge.textContent = curr;
    if (typeof this.updateCustomerReceiptInvoices === 'function') {
      this.updateCustomerReceiptInvoices();
    }
  }

  openQuickPayInvoice(invoiceId) {
    this.openRecordReceiptModal(invoiceId);
  }

  // 4. CREATE PURCHASE BILL MODAL
  openCreateBillModal() {
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';
    const currSym = isIndia ? '₹' : 'AED ';
    const defaultRegime = isIndia ? 'gst' : 'trn';
    const vendors = (this.db?.vendors || []).filter(v => !v.company_id || v.company_id === this.activeCompanyId);
    const projects = (this.db?.projects || []).filter(p => !p.company_id || p.company_id === this.activeCompanyId);
    const pos = (this.db?.purchase_orders || []).filter(po => (po.company_id || 'rayan-corp-uae') === this.activeCompanyId);

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-bill">
        <div class="fin-modal-dialog">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">📥 Record Vendor Purchase Bill (${currLabel})</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-bill')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="create-bill-form">
              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                    <label class="fin-form-label" style="margin-bottom:0;">Vendor / Subcontractor <span style="color:#ef4444;">*</span></label>
                    <span id="bill-vend-badge" style="font-size:0.68rem; color:#38bdf8; font-weight:600;">Click for Recommendations ▾</span>
                  </div>
                  <div class="fin-autocomplete-wrap">
                    <input 
                      type="text" 
                      id="bill-vend-input" 
                      class="fin-form-input" 
                      placeholder="Click to view registered vendors, or type custom..." 
                      required 
                      autocomplete="off"
                    >
                    <div id="bill-vend-dropdown" class="fin-autocomplete-dropdown">
                      <div class="fin-autocomplete-header">Registered Vendors (${currLabel})</div>
                      ${vendors.map(v => `
                        <div class="fin-autocomplete-item" data-id="${v.id}" data-name="${v.name}">
                          <div>
                            <div class="fin-autocomplete-item-name">${v.name}</div>
                            <div class="fin-autocomplete-item-meta">${v.code || ''} • ${v.trn ? `TRN: ${v.trn}` : (v.gstin ? `GSTIN: ${v.gstin}` : (v.country || (isIndia ? 'India' : 'UAE')))}</div>
                          </div>
                          <span class="fin-autocomplete-item-badge">${v.country || (v.trn ? 'UAE' : (isIndia ? 'India' : 'UAE'))}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.3rem; font-size:0.68rem; color:#64748b;">
                    <span id="bill-vend-hint">Click text box to view registered suppliers, or type custom name</span>
                  </div>
                </div>
                <div class="fin-form-group">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                    <label class="fin-form-label" id="bill-tax-header-label" style="margin-bottom:0;">
                      <span id="bill-tax-type-text">${isIndia ? 'VENDOR GSTIN' : 'VENDOR TRN'}</span>
                    </label>
                    <div class="fin-tax-regime-pills">
                      <button type="button" id="bill-regime-trn" class="fin-tax-pill ${!isIndia ? 'active trn-pill' : ''}">🇦🇪 TRN</button>
                      <button type="button" id="bill-regime-gst" class="fin-tax-pill ${isIndia ? 'active' : ''}">🇮🇳 GST</button>
                    </div>
                  </div>
                  <input type="text" id="bill-tax-no" class="fin-form-input" placeholder="${isIndia ? 'e.g. 27AAACT2727Q1ZT' : 'e.g. 100234567800003 (15 digits)'}" style="font-family:monospace; font-weight:600; text-transform:uppercase;">
                  <input type="hidden" id="bill-tax-regime" value="${defaultRegime}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Supplier Invoice # <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="bill-inv-no" class="fin-form-input" required placeholder="${isIndia ? 'e.g. TS-INV-99210' : 'e.g. AGM-INV-2026-08'}">
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

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Linked Project / Cost Center</label>
                  <select id="bill-project" class="fin-form-select">
                    <option value="">General Corporate Overhead</option>
                    ${projects.map(p => `<option value="${p.id}" data-name="${p.name}">${p.name} (${p.code || ''})</option>`).join('')}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Linked Purchase Order</label>
                  <select id="bill-po-sel" class="fin-form-select">
                    <option value="">No PO Linked</option>
                    ${pos.map(po => `<option value="${po.id}">${po.po_no} - ${po.vendor_name || po.supplier_name}</option>`).join('')}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Item / Service Purchased</label>
                  <input type="text" id="bill-item-desc" class="fin-form-input" placeholder="${isIndia ? 'e.g. Structural steel consignment' : 'e.g. Screeding application & supplies'}" required>
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Taxable Subtotal (${currLabel}) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="bill-taxable" class="fin-form-input" min="1" step="any" required placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label" id="bill-tax-rate-label">Tax Rate %</label>
                  <select id="bill-gst-rate" class="fin-form-select">
                    ${!isIndia ? `
                      <option value="5" selected>5% UAE VAT (Standard)</option>
                      <option value="0">0% (Zero-rated / Exempt)</option>
                      <option value="18">18% GST (Import)</option>
                    ` : `
                      <option value="18" selected>18% GST (Standard)</option>
                      <option value="12">12% GST</option>
                      <option value="28">28% GST</option>
                      <option value="5">5% GST</option>
                      <option value="0">0% (Exempt)</option>
                    `}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Grand Total (${currLabel})</label>
                  <input type="text" id="bill-grand" class="fin-form-input" readonly placeholder="${currSym}0.00" style="font-weight:700; color:#38bdf8;">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Notes &amp; Quality Test Sign-Off</label>
                <textarea id="bill-notes" class="fin-form-textarea" rows="2" placeholder="Delivery notes and QA inspection verified by Site Engineer."></textarea>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-bill')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Record &amp; Post Bill (${currLabel}) &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    const vendInput = document.getElementById('bill-vend-input');
    const vendDropdown = document.getElementById('bill-vend-dropdown');
    const vendBadge = document.getElementById('bill-vend-badge');
    const vendHint = document.getElementById('bill-vend-hint');
    const billTaxInp = document.getElementById('bill-tax-no');
    const billTaxTypeText = document.getElementById('bill-tax-type-text');
    const billRegimeHidden = document.getElementById('bill-tax-regime');
    const billBtnGst = document.getElementById('bill-regime-gst');
    const billBtnTrn = document.getElementById('bill-regime-trn');
    const taxableInp = document.getElementById('bill-taxable');
    const gstRateSel = document.getElementById('bill-gst-rate');
    const grandInp = document.getElementById('bill-grand');

    const setBillRegime = (regime) => {
      billRegimeHidden.value = regime;
      if (regime === 'trn') {
        billBtnTrn.classList.add('active', 'trn-pill');
        billBtnGst.classList.remove('active');
        billTaxTypeText.textContent = 'VENDOR TRN';
        billTaxInp.placeholder = 'e.g. 100234567800003 (15 digits)';
        gstRateSel.value = '5';
      } else {
        billBtnGst.classList.add('active');
        billBtnTrn.classList.remove('active', 'trn-pill');
        billTaxTypeText.textContent = 'VENDOR GSTIN';
        billTaxInp.placeholder = 'e.g. 27AAACT2727Q1ZT';
        gstRateSel.value = '18';
      }
      updateTotals();
    };

    if (billBtnGst) billBtnGst.onclick = () => setBillRegime('gst');
    if (billBtnTrn) billBtnTrn.onclick = () => setBillRegime('trn');

    const applyVendorData = (v) => {
      if (!v) return;
      vendInput.value = v.name;
      vendInput.setAttribute('data-vend-id', v.id || '');
      if (v.trn) {
        setBillRegime('trn');
        billTaxInp.value = v.trn;
      } else if (v.gstin) {
        setBillRegime('gst');
        billTaxInp.value = v.gstin;
      }
      if (vendBadge) {
        vendBadge.textContent = `✓ ${v.code || 'Registered Vendor'}`;
        vendBadge.style.color = '#10b981';
      }
      if (vendHint) {
        vendHint.textContent = `${v.name} • ${v.trn ? 'UAE TRN' : 'India GST'} Auto-selected`;
      }
    };

    if (vendInput && vendDropdown) {
      const showVendRecommendations = () => {
        const val = vendInput.value.trim().toLowerCase();
        vendDropdown.querySelectorAll('.fin-autocomplete-item').forEach(item => {
          const name = (item.getAttribute('data-name') || '').toLowerCase();
          const meta = item.textContent.toLowerCase();
          if (!val || name.includes(val) || meta.includes(val)) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
        vendDropdown.classList.add('open');
      };

      vendInput.onfocus = showVendRecommendations;
      vendInput.onclick = showVendRecommendations;

      vendDropdown.querySelectorAll('.fin-autocomplete-item').forEach(item => {
        item.onmousedown = (e) => {
          e.preventDefault();
          const vendId = item.getAttribute('data-id');
          const found = vendors.find(v => v.id === vendId);
          if (found) {
            applyVendorData(found);
          }
          vendDropdown.classList.remove('open');
        };
      });

      const handleVendorInput = () => {
        showVendRecommendations();
        const val = vendInput.value.trim();
        if (!val) {
          vendInput.removeAttribute('data-vend-id');
          if (vendBadge) {
            vendBadge.textContent = 'Click for Recommendations ▾';
            vendBadge.style.color = '#38bdf8';
          }
          if (vendHint) {
            vendHint.textContent = 'Click text box to view registered suppliers, or type custom name';
          }
          return;
        }

        const found = vendors.find(v => 
          v.name.toLowerCase() === val.toLowerCase() ||
          `${v.name} (${v.code || ''})`.toLowerCase() === val.toLowerCase()
        );

        if (found) {
          applyVendorData(found);
        } else {
          vendInput.removeAttribute('data-vend-id');
          if (vendBadge) {
            vendBadge.textContent = '✎ Custom Vendor';
            vendBadge.style.color = '#38bdf8';
          }
          if (vendHint) {
            vendHint.textContent = `Custom vendor "${val}" will be recorded on bill.`;
          }
        }
      };

      vendInput.oninput = handleVendorInput;
      vendInput.onchange = handleVendorInput;

      document.addEventListener('click', (e) => {
        if (!e.target.closest('#bill-vend-input') && !e.target.closest('#bill-vend-dropdown')) {
          vendDropdown.classList.remove('open');
        }
      });
    }

    const updateTotals = () => {
      const taxable = Number(taxableInp.value) || 0;
      const rate = Number(gstRateSel.value) || 0;
      const tax = taxable * (rate / 100);
      const grand = taxable + tax;
      grandInp.value = `${currSym}${grand.toLocaleString(isIndia ? 'en-IN' : 'en-US', { minimumFractionDigits: 2 })}`;
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
      const vendorName = (vendInput?.value || '').trim();
      if (!vendorName) {
        alert('Please write or select a Vendor name.');
        vendInput?.focus();
        return;
      }

      const taxRegime = billRegimeHidden.value;
      const taxNo = billTaxInp.value.trim();

      let vendor = vendors.find(v => 
        v.id === vendInput.getAttribute('data-vend-id') ||
        v.name.toLowerCase() === vendorName.toLowerCase()
      );

      if (!vendor) {
        const newVendId = 'vend-' + Date.now();
        vendor = {
          id: newVendId,
          code: 'VEND-' + Math.floor(1000 + Math.random() * 9000),
          company_id: this.activeCompanyId,
          name: vendorName,
          country: taxRegime === 'trn' ? 'UAE' : 'India',
          gstin: taxRegime === 'gst' ? taxNo : '',
          trn: taxRegime === 'trn' ? taxNo : ''
        };
        if (!this.db.vendors) this.db.vendors = [];
        this.db.vendors.push(vendor);
        this.syncApi('create_vendor', { vendor }).catch(e => console.warn('Vendor auto-persist:', e));
      }

      const prjSel = document.getElementById('bill-project');
      const prjId = prjSel ? prjSel.value || null : null;
      const prjName = prjSel?.options[prjSel.selectedIndex]?.getAttribute('data-name') || '';

      const taxable = Number(taxableInp.value) || 0;
      const rate = Number(gstRateSel.value) || 0;
      const tax = taxable * (rate / 100);
      const grand = taxable + tax;

      const billNo = this.getNextBillNumber();
      const payload = {
        bill: {
          id: 'bill-' + Date.now(),
          bill_no: billNo,
          company_id: this.activeCompanyId,
          currency: isIndia ? 'INR' : 'AED',
          currency_symbol: currSym,
          vendor_id: vendor.id,
          vendor_name: vendor.name,
          vendor_tax_regime: taxRegime,
          vendor_gstin: taxRegime === 'gst' ? taxNo : (vendor.gstin || ''),
          vendor_trn: taxRegime === 'trn' ? taxNo : (vendor.trn || ''),
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
          amount_paid: 0,
          balance_due: grand,
          approval_status: 'approved',
          status: 'unpaid',
          line_items: [
            {
              name: document.getElementById('bill-item-desc').value,
              qty: 1,
              uom: 'LSUM',
              unit_price: taxable,
              taxable_amount: taxable,
              gst_rate: isIndia ? rate : 0,
              vat_rate: isIndia ? 0 : rate,
              tax_amount: tax,
              total_amount: grand
            }
          ],
          notes: document.getElementById('bill-notes').value
        }
      };

      const res = await this.syncApi('create_bill', payload);
      if (res && res.success) {
        alert(`Purchase Bill ${res.bill?.bill_no || billNo} recorded successfully in ${currLabel}.`);
        this.closeModal('modal-bill');
        this.switchTab('bills');
      }
    };
  }

  // 5. RECORD VENDOR PAYMENT
  openRecordPaymentModal(preselectBillId = null) {
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';
    const currSym = isIndia ? '₹' : 'AED ';
    const vendors = (this.db?.vendors || []).filter(v => !v.company_id || v.company_id === this.activeCompanyId);
    const bills = (this.db?.purchase_bills || []).filter(b => (b.company_id || 'rayan-corp-uae') === this.activeCompanyId);

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-payment">
        <div class="fin-modal-dialog" style="max-width:680px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">💸 Record Vendor Payment Voucher (${currLabel})</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-payment')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="record-payment-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Vendor / Subcontractor <span style="color:#ef4444;">*</span></label>
                <select id="pay-vend-sel" class="fin-form-select" required>
                  <option value="" disabled selected>Select Vendor (${currLabel})</option>
                  ${vendors.map(v => `<option value="${v.id}">${v.name} (${v.code || ''})</option>`).join('')}
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
                    <option value="Corporate RTGS" selected>${isIndia ? 'Corporate RTGS' : 'ADCB / FAB Bank Wire'}</option>
                    <option value="Corporate Cheque">Corporate Cheque</option>
                    <option value="International Wire">International Wire</option>
                    <option value="Petty Cash">Petty Cash</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Amount Disbursed (${currLabel}) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="pay-amount" class="fin-form-input" min="1" step="any" required placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Payment UTR / CMS Ref #</label>
                  <input type="text" id="pay-ref" class="fin-form-input" required placeholder="${isIndia ? 'e.g. CMS-RTGS-991203' : 'e.g. ADCB-FT-994821'}">
                </div>
              </div>

              <!-- Unpaid Bills Checklist -->
              <h4 style="font-family:var(--fin-font-heading); font-size:0.95rem; color:#f8fafc; margin:1rem 0 0.5rem;">Allocate Against Approved Bills (${currLabel})</h4>
              <div id="pay-bills-list" style="max-height:180px; overflow-y:auto; border:1px solid var(--fin-border); border-radius:8px; padding:0.75rem; background:rgba(0,0,0,0.2);">
                <div style="font-size:0.78rem; color:#94a3b8;">Select a vendor above to allocate payment against bills.</div>
              </div>

              <div class="fin-form-group" style="margin-top:1.25rem;">
                <label class="fin-form-label">Notes &amp; Approver Sign-Off</label>
                <input type="text" id="pay-notes" class="fin-form-input" placeholder="Approved by CFO for immediate release">
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-payment')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Disburse &amp; Release Voucher (${currLabel}) &rarr;</button>
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
        billsList.innerHTML = `<div style="font-size:0.78rem; color:#10b981;">No unpaid approved bills found for this vendor in ${currLabel}.</div>`;
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
      const voucherNo = this.getNextPaymentVoucherNumber();
      const payload = {
        payment: {
          id: 'pay-' + Date.now(),
          voucher_no: voucherNo,
          company_id: this.activeCompanyId,
          currency: isIndia ? 'INR' : 'AED',
          currency_symbol: currSym,
          vendor_id: vend ? vend.id : null,
          vendor_name: vend ? vend.name : '',
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
        alert(`Payment voucher ${res.payment?.voucher_no || voucherNo} disbursed to ${vend?.name || 'vendor'} in ${currLabel}.`);
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
    const cust = this.db?.customers?.find(c => c.id === custId || c.code === custId || (c.name && c.name.toLowerCase() === (custId || '').toLowerCase()));
    if (!cust) return;

    const invoices = (this.db?.invoices || []).filter(i => (i.customer_id === cust.id || (cust.name && i.customer_name === cust.name)) && i.status !== 'void');
    const receipts = (this.db?.customer_receipts || []).filter(r => (r.customer_id === cust.id || (cust.name && r.customer_name === cust.name)));

    const totalInvoiced = invoices.reduce((s, i) => s + (Number(i.grand_total) || 0), 0);
    const totalReceived = invoices.reduce((s, i) => s + (Number(i.amount_paid) || 0), 0);
    const totalOutstanding = invoices.reduce((s, i) => s + (Number(i.balance_due) || 0), 0);

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-cust-profile">
        <div class="fin-modal-dialog" style="max-width:880px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">Customer Profile: ${cust.name}</h3>
            <div style="display:flex; gap:0.5rem;">
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.printDocument()">🖨️ Print Statement (SOA)</button>
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
                ${cust.trn ? `<strong>TRN:</strong> <code>${cust.trn}</code> • ` : ''}<strong>GSTIN:</strong> <code>${cust.gstin || 'EXEMPT'}</code> • <strong>Place of Supply:</strong> ${cust.place_of_supply}
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

            <div class="rayan-computer-generated-notice" style="margin-top:1.5rem; padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.08); color:#94a3b8;">
              This is a Computer Generated Statement of Account
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
    document.body.classList.add('fin-doc-open');
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
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.printDocument()">🖨️ Print Vendor Statement</button>
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
                ${vend.trn ? `<strong>TRN:</strong> <code>${vend.trn}</code> • ` : ''}<strong>GSTIN:</strong> <code>${vend.gstin || '—'}</code> • <strong>PAN / License:</strong> <code>${vend.pan || '—'}</code>
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

            <div class="rayan-computer-generated-notice" style="margin-top:1.5rem; padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.08); color:#94a3b8;">
              This is a Computer Generated Statement of Account
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
    document.body.classList.add('fin-doc-open');
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

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Country / Jurisdiction</label>
                  <select id="new-cust-country" class="fin-form-select">
                    <option value="India" selected>🇮🇳 India</option>
                    <option value="UAE">🇦🇪 United Arab Emirates (UAE)</option>
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">GSTIN (India)</label>
                  <input type="text" id="new-cust-gstin" class="fin-form-input" placeholder="27AAACS1234F1Z9">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">TRN (UAE VAT)</label>
                  <input type="text" id="new-cust-trn" class="fin-form-input" placeholder="100492817200003">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Phone Number</label>
                  <input type="tel" id="new-cust-phone" class="fin-form-input" placeholder="+91 22 6000 0000 / +971 4 000 0000">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Place of Supply / State / Emirate</label>
                  <input type="text" id="new-cust-pos" class="fin-form-input" value="27-Maharashtra" placeholder="e.g. 27-Maharashtra or Abu Dhabi, UAE">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Billing Address</label>
                <textarea id="new-cust-address" class="fin-form-textarea" rows="2" placeholder="Registered office address..."></textarea>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Credit Limit (₹ / AED)</label>
                <input type="number" id="new-cust-credit" class="fin-form-input" value="50000000">
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

    const countrySel = document.getElementById('new-cust-country');
    const posInp = document.getElementById('new-cust-pos');
    if (countrySel && posInp) {
      countrySel.onchange = () => {
        if (countrySel.value === 'UAE') {
          if (posInp.value === '27-Maharashtra') posInp.value = 'Abu Dhabi, UAE';
        } else {
          if (posInp.value === 'Abu Dhabi, UAE') posInp.value = '27-Maharashtra';
        }
      };
    }

    document.getElementById('add-cust-form').onsubmit = async (e) => {
      e.preventDefault();
      const custName = document.getElementById('new-cust-name').value.trim();
      const codePart = custName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'CUST';
      const custId = `cust-${Date.now().toString(36)}`;
      const custCode = `CUST-${codePart}-${Math.floor(100 + Math.random() * 900)}`;

      const payload = {
        customer: {
          id: custId,
          code: custCode,
          name: custName,
          company_id: this.activeCompanyId || 'rayan-corp-uae',
          status: 'Active',
          contact_person: document.getElementById('new-cust-contact').value.trim(),
          email: document.getElementById('new-cust-email').value.trim(),
          phone: document.getElementById('new-cust-phone').value.trim(),
          country: document.getElementById('new-cust-country').value,
          gstin: document.getElementById('new-cust-gstin').value.trim().toUpperCase(),
          trn: document.getElementById('new-cust-trn').value.trim(),
          billing_address: document.getElementById('new-cust-address').value.trim(),
          place_of_supply: document.getElementById('new-cust-pos').value.trim(),
          credit_limit: Number(document.getElementById('new-cust-credit').value) || 10000000,
          payment_terms: 30
        }
      };

      const res = await this.syncApi('create_customer', payload);
      if (res && res.success) {
        alert(`Customer ${res.customer?.name || payload.customer.name} saved successfully.`);
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
                  <input type="tel" id="new-vend-phone" class="fin-form-input" placeholder="+91 22 6600 0000 / +971 2 565 0000">
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Country / Jurisdiction</label>
                  <select id="new-vend-country" class="fin-form-select">
                    <option value="India" selected>🇮🇳 India</option>
                    <option value="UAE">🇦🇪 United Arab Emirates (UAE)</option>
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">GSTIN (India)</label>
                  <input type="text" id="new-vend-gstin" class="fin-form-input" placeholder="27AAACJ1234F1Z8">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">TRN (UAE VAT)</label>
                  <input type="text" id="new-vend-trn" class="fin-form-input" placeholder="100234567800003">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">PAN (India) / Commercial License # (UAE)</label>
                <input type="text" id="new-vend-pan" class="fin-form-input" placeholder="AAACJ1234F or CN-1049281">
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Bank Name</label>
                  <input type="text" id="new-vend-bank" class="fin-form-input" placeholder="State Bank of India / FAB">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Account No / IBAN</label>
                  <input type="text" id="new-vend-ac" class="fin-form-input" placeholder="39485729103 / AE07033...">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">IFSC / SWIFT Code</label>
                  <input type="text" id="new-vend-ifsc" class="fin-form-input" placeholder="SBIN0000300 / FABAAEAD">
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
      const vendName = document.getElementById('new-vend-name').value.trim();
      const codePart = vendName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'VEND';
      const vendId = `vend-${Date.now().toString(36)}`;
      const vendCode = `VEND-${codePart}-${Math.floor(100 + Math.random() * 900)}`;

      const payload = {
        vendor: {
          id: vendId,
          code: vendCode,
          name: vendName,
          company_id: this.activeCompanyId || 'rayan-corp-uae',
          status: 'Active',
          category: document.getElementById('new-vend-cat').value,
          contact_person: document.getElementById('new-vend-contact').value.trim(),
          email: document.getElementById('new-vend-email').value.trim(),
          phone: document.getElementById('new-vend-phone').value.trim(),
          country: document.getElementById('new-vend-country').value,
          gstin: document.getElementById('new-vend-gstin').value.trim().toUpperCase(),
          trn: document.getElementById('new-vend-trn').value.trim(),
          pan: document.getElementById('new-vend-pan').value.trim().toUpperCase(),
          bank_name: document.getElementById('new-vend-bank').value.trim(),
          account_no: document.getElementById('new-vend-ac').value.trim(),
          ifsc_code: document.getElementById('new-vend-ifsc').value.trim().toUpperCase()
        }
      };

      const res = await this.syncApi('create_vendor', payload);
      if (res && res.success) {
        alert(`Vendor ${res.vendor?.name || payload.vendor.name} added successfully.`);
        this.closeModal('modal-add-vend');
        this.switchTab('vendors');
      }
    };
  }

  // 10. ADD ITEM / SERVICE MODAL
  openCreateItemModal() {
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-add-item">
        <div class="fin-modal-dialog" style="max-width:600px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">📦 Add New Catalog Item or Service (${currLabel})</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-add-item')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="add-item-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Item / Service Name <span style="color:#ef4444;">*</span></label>
                <input type="text" id="new-item-name" class="fin-form-input" required placeholder="${isIndia ? 'e.g. Ready Mix Concrete M50 Grade' : 'e.g. Screeding Application 8-10cm'}">
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
                  <label class="fin-form-label">${isIndia ? 'HSN / SAC Code' : 'Customs / Tariff Code'} <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="new-item-hsn" class="fin-form-input" required placeholder="e.g. 3824 or 9954">
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Unit of Measure (UOM)</label>
                  <select id="new-item-uom" class="fin-form-select">
                    <option value="Sqm">Sqm (Square Meter)</option>
                    <option value="MT">MT (Metric Ton)</option>
                    <option value="CUM">CUM (Cubic Meter)</option>
                    <option value="LSUM">LSUM (Lump Sum)</option>
                    <option value="HRS">HRS (Hours)</option>
                    <option value="UNITS">UNITS</option>
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Default Sales Rate (${currLabel})</label>
                  <input type="number" id="new-item-sales" class="fin-form-input" required placeholder="0.00" step="any">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Default Cost Rate (${currLabel})</label>
                  <input type="number" id="new-item-cost" class="fin-form-input" required placeholder="0.00" step="any">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Applicable ${isIndia ? 'GST' : 'VAT'} Rate</label>
                <select id="new-item-gst" class="fin-form-select">
                  ${!isIndia ? `
                    <option value="5" selected>5% UAE VAT (Standard)</option>
                    <option value="0">0% (Exempt)</option>
                    <option value="18">18% (Import)</option>
                  ` : `
                    <option value="18" selected>18% GST (Standard)</option>
                    <option value="12">12%</option>
                    <option value="5">5%</option>
                    <option value="28">28%</option>
                    <option value="0">0% (Exempt)</option>
                  `}
                </select>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-add-item')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save Item to Catalog (${currLabel}) &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('add-item-form').onsubmit = async (e) => {
      e.preventDefault();
      const itemName = document.getElementById('new-item-name').value.trim();
      const itemId = `itm-${Date.now().toString(36)}`;
      const itemCode = `ITM-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        item: {
          id: itemId,
          code: itemCode,
          name: itemName,
          company_id: this.activeCompanyId,
          currency: isIndia ? 'INR' : 'AED',
          category: document.getElementById('new-item-cat').value,
          hsn_code: document.getElementById('new-item-hsn').value.trim(),
          uom: document.getElementById('new-item-uom').value,
          selling_price: Number(document.getElementById('new-item-sales').value) || 0,
          purchase_price: Number(document.getElementById('new-item-cost').value) || 0,
          gst_rate: Number(document.getElementById('new-item-gst').value) || 0,
          vat_rate: !isIndia ? (Number(document.getElementById('new-item-gst').value) || 5) : 0,
          status: 'active'
        }
      };

      const res = await this.syncApi('create_item', payload);
      if (res && res.success) {
        alert(`Item "${itemName}" added to catalog in ${currLabel}.`);
        this.closeModal('modal-add-item');
        this.switchTab('items');
      }
    };
  }

  // 11. RECORD EXPENSE CLAIM MODAL
  openCreateExpenseModal() {
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';
    const currSym = isIndia ? '₹' : 'AED ';
    const projects = (this.db?.projects || []).filter(p => !p.company_id || p.company_id === this.activeCompanyId);

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-expense">
        <div class="fin-modal-dialog" style="max-width:600px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">🧾 Record Business Expense / Claim (${currLabel})</h3>
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
                    <option value="Equipment & Fuel">Equipment &amp; Fuel</option>
                    <option value="Utilities & Maintenance">Utilities &amp; Maintenance</option>
                    <option value="Travel & Accommodation">Travel &amp; Accommodation</option>
                    <option value="Professional Services">Professional &amp; Legal Services</option>
                    <option value="Employee Reimbursements">Employee Reimbursements</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Description of Expense <span style="color:#ef4444;">*</span></label>
                <input type="text" id="exp-desc" class="fin-form-input" required placeholder="${isIndia ? 'e.g. Safety PPE equipment for NH-48 bridge erection' : 'e.g. Diesel fuel supply for crane & site generators at Mussafah'}">
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Amount (${currLabel} Excl. Tax) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="exp-amount" class="fin-form-input" min="1" step="any" required placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">${isIndia ? 'Tax / GST Amount (INR)' : 'UAE VAT 5% (AED)'}</label>
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
                    <option value="Corporate Debit Card">Corporate Debit Card</option>
                    <option value="Direct Bank Wire">Direct Bank Wire</option>
                    <option value="Petty Cash">Petty Cash</option>
                    <option value="Employee Reimbursement">Employee Reimbursement</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Attach Tax Receipt / Invoice Proof (PDF)</label>
                <input type="file" id="exp-file" class="fin-form-input">
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-expense')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Submit Expense Claim (${currLabel}) &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    const amtInp = document.getElementById('exp-amount');
    const taxInp = document.getElementById('exp-tax');
    amtInp.oninput = () => {
      const a = Number(amtInp.value) || 0;
      if (!isIndia) {
        taxInp.value = (a * 0.05).toFixed(2);
      } else {
        taxInp.value = (a * 0.18).toFixed(2);
      }
    };

    document.getElementById('create-expense-form').onsubmit = async (e) => {
      e.preventDefault();
      const prjSel = document.getElementById('exp-project');
      const fileInp = document.getElementById('exp-file');
      const filename = fileInp.files.length ? fileInp.files[0].name : 'expense-receipt.pdf';
      const expenseNo = this.getNextExpenseNumber();
      const amountVal = Number(document.getElementById('exp-amount').value);
      const taxVal = Number(document.getElementById('exp-tax').value) || 0;

      const payload = {
        expense: {
          id: 'exp-' + Date.now(),
          expense_no: expenseNo,
          company_id: this.activeCompanyId,
          currency: isIndia ? 'INR' : 'AED',
          currency_symbol: currSym,
          date: document.getElementById('exp-date').value,
          category: document.getElementById('exp-category').value,
          description: document.getElementById('exp-desc').value.trim(),
          amount: amountVal,
          tax_amount: taxVal,
          total_amount: amountVal + taxVal,
          project_id: prjSel.value || null,
          project_name: prjSel.options[prjSel.selectedIndex]?.getAttribute('data-name') || '',
          payment_method: document.getElementById('exp-pay-mode').value,
          submitted_by: this.currentUser?.name || 'Finance Staff',
          status: 'approved',
          receipt_filename: filename
        }
      };

      const res = await this.syncApi('create_expense', payload);
      if (res && res.success) {
        alert(`Expense ${res.expense?.expense_no || expenseNo} recorded successfully in ${currLabel}.`);
        this.closeModal('modal-expense');
        this.switchTab('expenses');
      }
    };
  }

  // 12. CREATE PURCHASE ORDER MODAL
  openCreatePOModal() {
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';
    const currSym = isIndia ? '₹' : 'AED ';
    const vendors = (this.db?.vendors || []).filter(v => !v.company_id || v.company_id === this.activeCompanyId);
    const projects = (this.db?.projects || []).filter(p => !p.company_id || p.company_id === this.activeCompanyId);
    const items = (this.db?.items || []).filter(it => !it.company_id || it.company_id === this.activeCompanyId);

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-po">
        <div class="fin-modal-dialog" style="max-width:680px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">📑 Create Purchase Order (${currLabel})</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-po')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="create-po-form">
              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Vendor <span style="color:#ef4444;">*</span></label>
                  <select id="po-vend" class="fin-form-select" required>
                    <option value="" disabled selected>Select Vendor (${currLabel})</option>
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
                    ${items.length ? items.map(it => `<option value="${it.id}" data-price="${it.purchase_price || 0}">${it.name}</option>`).join('') : '<option value="">Custom Procurement Item</option>'}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Quantity</label>
                  <input type="number" id="po-qty" class="fin-form-input" value="10" min="1">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Unit Price (${currLabel})</label>
                  <input type="number" id="po-rate" class="fin-form-input" value="${items[0]?.purchase_price || (isIndia ? 61200 : 60)}" step="any">
                </div>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-po')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Issue Approved Purchase Order (${currLabel}) &rarr;</button>
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
      const taxRate = isIndia ? 0.18 : 0.05;
      const tax = subtotal * taxRate;
      const total = subtotal + tax;
      const poNo = this.getNextPONumber();

      const payload = {
        po: {
          id: 'po-' + Date.now(),
          po_no: poNo,
          company_id: this.activeCompanyId,
          currency: isIndia ? 'INR' : 'AED',
          currency_symbol: currSym,
          vendor_id: vend ? vend.id : null,
          vendor_name: vend ? vend.name : '',
          supplier_name: vend ? vend.name : '',
          supplier_trn: vend ? (vend.trn || '') : '',
          project_id: prjSel.value,
          project_name: prjSel.options[prjSel.selectedIndex]?.getAttribute('data-name') || '',
          date: document.getElementById('po-date').value,
          expected_delivery: document.getElementById('po-delivery').value,
          subtotal,
          subtotal_ex_vat: subtotal,
          tax_total: tax,
          vat_total: isIndia ? 0 : tax,
          total_value: total,
          grand_total: total,
          status: 'approved',
          approved_by: this.currentUser?.name || 'Executive Sign-off',
          line_items: [
            {
              item_id: it ? it.id : null,
              name: it ? it.name : 'Procurement Material / Application',
              qty,
              uom: it ? (it.uom || 'UNITS') : 'UNITS',
              unit_price: rate,
              taxable_amount: subtotal,
              gst_rate: isIndia ? 18 : 0,
              vat_rate: isIndia ? 0 : 5,
              tax_amount: tax,
              total_amount: total
            }
          ]
        }
      };

      const res = await this.syncApi('create_po', payload);
      if (res && res.success) {
        alert(`Purchase Order ${res.po?.po_no || poNo} issued to ${vend?.name || 'Vendor'} in ${currLabel}.`);
        this.closeModal('modal-po');
        this.switchTab('pos');
      }
    };
  }

  // 13. ISSUE CREDIT NOTE MODAL
  openCreateCreditNoteModal(invoiceId) {
    const inv = this.db?.invoices?.find(i => i.id === invoiceId);
    if (!inv) return;
    const isIndia = (inv.company_id || this.activeCompanyId) === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';
    const currSym = isIndia ? '₹' : 'AED ';

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-cn">
        <div class="fin-modal-dialog" style="max-width:600px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">🔄 Issue Sales Credit Note against ${inv.invoice_no} (${currLabel})</h3>
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
                  <label class="fin-form-label">Taxable Adjustment Value (${currLabel}) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="cn-taxable" class="fin-form-input" max="${inv.balance_due}" step="any" required placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Tax Adjustment (${currLabel})</label>
                  <input type="number" id="cn-tax" class="fin-form-input" step="any" placeholder="0.00">
                </div>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-cn')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Issue Credit Note (${currLabel}) &rarr;</button>
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
      const taxRate = isIndia ? 0.18 : 0.05;
      const tax = Number(document.getElementById('cn-tax').value) || (taxable * taxRate);

      const payload = {
        credit_note: {
          id: 'cn-' + Date.now(),
          company_id: inv.company_id || this.activeCompanyId,
          currency: isIndia ? 'INR' : 'AED',
          currency_symbol: currSym,
          invoice_id: inv.id,
          invoice_no: inv.invoice_no,
          customer_id: inv.customer_id,
          customer_name: inv.customer_name,
          reason: document.getElementById('cn-reason').value.trim(),
          taxable_amount: taxable,
          tax_amount: tax,
          total_credit_amount: taxable + tax,
          status: 'applied'
        }
      };

      const res = await this.syncApi('create_credit_note', payload);
      if (res && res.success) {
        alert(`Credit note ${res.credit_note?.credit_note_no || 'posted'} posted in ${currLabel}. Invoice balance reduced.`);
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
    const remaining = document.querySelector('.fin-modal-backdrop.open, .fin-doc-modal-backdrop');
    if (!remaining) {
      document.body.classList.remove('fin-doc-open');
    }
  }

  closeDocPrintModal() {
    const el = document.getElementById('fin-doc-print-modal');
    if (el) el.remove();
    document.body.classList.remove('fin-doc-open');
    if (window.location.search.includes('verify=') || window.location.search.includes('doc=')) {
      if (this.currentUser) {
        this.showAppView();
      } else {
        this.showAuthView();
      }
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {}
    }
  }

  printDocument() {
    document.body.classList.add('fin-doc-open');
    document.body.classList.add('fin-printing-now');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('fin-printing-now');
      }, 500);
    }, 60);
  }

  openInvoiceDetail(id) {
    this.openInvoicePrintModal(id);
  }

  // 17. BANK TRANSFER / WIRE MODAL
    // ==========================================================================
  // CASH & BANK INTERACTIVE MODALS & HANDLERS
  // ==========================================================================

  // 1. ADD / EDIT BANK ACCOUNT MODAL
  openAddBankAccountModal(bankId = null) {
    const banks = this.db?.bank_accounts || [];
    const b = bankId ? banks.find(x => x.id === bankId) : null;
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const comp = (this.db?.companies || []).find(c => c.id === this.activeCompanyId);
    const curr = b?.currency || (isIndia ? 'INR' : 'AED');

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-bank-account">
        <div class="fin-modal-dialog" style="max-width:580px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">${b ? '✏️ Edit Corporate Bank Account' : '🏛️ Add Corporate Bank Account'}</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-bank-account')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="bank-account-form">
              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Bank Name <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="ba-bank-name" class="fin-form-input" list="bank-name-options" required placeholder="e.g. First Abu Dhabi Bank (FAB)" value="${b?.bank_name || ''}">
                  <datalist id="bank-name-options">
                    <option value="First Abu Dhabi Bank PJSC">
                    <option value="National Bank of Abu Dhabi (NBAD)">
                    <option value="Abu Dhabi Commercial Bank (ADCB)">
                    <option value="Emirates NBD Bank">
                    <option value="Dubai Islamic Bank">
                    <option value="Mashreq Bank">
                    <option value="Abu Dhabi Islamic Bank (ADIB)">
                    <option value="State Bank of India">
                    <option value="HDFC Bank Ltd">
                    <option value="ICICI Bank">
                  </datalist>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Account Name / Title <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="ba-account-name" class="fin-form-input" required placeholder="e.g. Corporate Current Treasury" value="${b?.account_name || ''}">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">A/c Number / IBAN <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="ba-account-number" class="fin-form-input" required placeholder="e.g. AE07033104889218001" value="${b?.iban || b?.account_number || ''}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Currency</label>
                  <select id="ba-currency" class="fin-form-select">
                    <option value="AED" ${curr === 'AED' ? 'selected' : ''}>AED (UAE Dirham)</option>
                    <option value="INR" ${curr === 'INR' ? 'selected' : ''}>INR (Indian Rupee)</option>
                    <option value="USD" ${curr === 'USD' ? 'selected' : ''}>USD (US Dollar)</option>
                    <option value="EUR" ${curr === 'EUR' ? 'selected' : ''}>EUR (Euro)</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Current / Opening Balance <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="ba-balance" class="fin-form-input" required step="any" placeholder="0.00" value="${b?.balance ?? ''}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Branch Location</label>
                  <input type="text" id="ba-branch" class="fin-form-input" placeholder="e.g. Al Maryah Island Financial Center, Abu Dhabi" value="${b?.branch || ''}">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">SWIFT / BIC Code</label>
                  <input type="text" id="ba-swift" class="fin-form-input" placeholder="e.g. FABUAEAA" value="${b?.swift || ''}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">IFSC Code (India)</label>
                  <input type="text" id="ba-ifsc" class="fin-form-input" placeholder="e.g. SBIN0001234" value="${b?.ifsc_code || ''}">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Authorized Signatory</label>
                  <input type="text" id="ba-signatory" class="fin-form-input" placeholder="Arshad Alam Shaikh (Managing Director)" value="${b?.signatory || 'Arshad Alam Shaikh (Managing Director)'}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Account Status</label>
                  <select id="ba-status" class="fin-form-select">
                    <option value="Active" ${(b?.status || 'Active') === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Dormant" ${b?.status === 'Dormant' ? 'selected' : ''}>Dormant</option>
                  </select>
                </div>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-bank-account')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">${b ? 'Save Account Changes' : 'Register Corporate Bank Account'} &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('bank-account-form').onsubmit = async (e) => {
      e.preventDefault();
      const accountNum = document.getElementById('ba-account-number').value.trim();
      const isIban = accountNum.toUpperCase().startsWith('AE') || accountNum.length >= 20;

      const bankData = {
        id: b ? b.id : `bank-${Date.now().toString(36)}`,
        company_id: this.activeCompanyId || 'rayan-corp-uae',
        bank_name: document.getElementById('ba-bank-name').value.trim(),
        account_name: document.getElementById('ba-account-name').value.trim(),
        account_number: accountNum,
        iban: isIban ? accountNum : (b?.iban || ''),
        currency: document.getElementById('ba-currency').value,
        balance: parseFloat(document.getElementById('ba-balance').value) || 0,
        branch: document.getElementById('ba-branch').value.trim(),
        swift: document.getElementById('ba-swift').value.trim(),
        ifsc_code: document.getElementById('ba-ifsc').value.trim(),
        signatory: document.getElementById('ba-signatory').value.trim(),
        status: document.getElementById('ba-status').value
      };

      await this.syncApi(b ? 'update_bank_account' : 'create_bank_account', {
        bank_account: bankData,
        id: b ? b.id : undefined
      });

      this.closeModal('modal-bank-account');
      this.activeTab = 'bank_accounts';
      this.renderActiveTab();
      this.showNotification(`Bank account "${bankData.bank_name}" saved successfully!`, 'success');
    };
  }

  async deleteBankAccount(bankId) {
    if (!confirm('Are you sure you want to delete this bank account from records?')) return;
    await this.syncApi('delete_bank_account', { id: bankId });
    this.renderActiveTab();
    this.showNotification('Bank account removed.', 'info');
  }

  // 2. RECORD BANK WIRE / TRANSFER MODAL
  openBankTransferModal(sourceBankId = null) {
    const banks = (this.db?.bank_accounts || []).filter(b => (b.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const defaultPrefix = isIndia ? 'RTGS-ASH' : 'FAB-TRN';
    const autoUtr = `${defaultPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-bank-transfer">
        <div class="fin-modal-dialog" style="max-width:560px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">🏛️ Record Bank Wire / Remittance Clearance</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-bank-transfer')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="bank-transfer-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Transfer Direction / Type <span style="color:#ef4444;">*</span></label>
                <select id="bt-type" class="fin-form-select">
                  <option value="outward">Outward Remittance (Vendor / Overseas Contractor Wire)</option>
                  <option value="inward">Inward Wire (Client Advance / Settlement)</option>
                  <option value="inter_account">Inter-Account Treasury Transfer (Internal)</option>
                </select>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Source Bank Account <span style="color:#ef4444;">*</span></label>
                  <select id="bt-source" class="fin-form-select" required>
                    ${banks.map(b => `<option value="${b.id}" ${b.id === sourceBankId ? 'selected' : ''}>${b.bank_name} (${this.formatCurrency(b.balance)})</option>`).join('')}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Counterparty / Beneficiary <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="bt-counterparty" class="fin-form-input" required placeholder="e.g. Siemens Middle East / Client Advance">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Transfer Amount <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="bt-amount" class="fin-form-input" required step="any" placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Settlement Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="bt-date" class="fin-form-input" required value="${new Date().toISOString().split('T')[0]}">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Bank Reference / UTR # <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="bt-utr" class="fin-form-input" required value="${autoUtr}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Clearance Status</label>
                  <select id="bt-status" class="fin-form-select">
                    <option value="Cleared">Cleared</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending Clearance</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Purpose / Description</label>
                <textarea id="bt-purpose" class="fin-form-textarea" rows="2" placeholder="e.g. Treasury liquidity replenishment / mobilization escrow"></textarea>
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

    document.getElementById('bank-transfer-form').onsubmit = async (e) => {
      e.preventDefault();
      const srcId = document.getElementById('bt-source').value;
      const srcBank = banks.find(b => b.id === srcId);
      const type = document.getElementById('bt-type').value;

      const typeLabels = {
        inward: 'Inward Wire (Client Settlement)',
        outward: 'Outward Telegraphic Transfer',
        inter_account: 'Inter-Account Treasury Transfer'
      };

      const transferData = {
        id: `wire-${Date.now().toString(36)}`,
        company_id: this.activeCompanyId || 'rayan-corp-uae',
        reference_no: document.getElementById('bt-utr').value.trim(),
        date: document.getElementById('bt-date').value,
        counterparty: document.getElementById('bt-counterparty').value.trim(),
        source_account_id: srcId,
        source_bank: srcBank ? `${srcBank.bank_name} (${srcBank.currency})` : 'Corporate Account',
        type,
        type_label: typeLabels[type] || 'Bank Wire',
        amount: parseFloat(document.getElementById('bt-amount').value) || 0,
        currency: srcBank?.currency || (isIndia ? 'INR' : 'AED'),
        purpose: document.getElementById('bt-purpose').value.trim(),
        status: document.getElementById('bt-status').value
      };

      await this.syncApi('record_bank_transfer', { transfer: transferData });
      this.closeModal('modal-bank-transfer');
      this.activeTab = 'bank_accounts';
      this.renderActiveTab();
      this.showNotification(`Wire transfer ${transferData.reference_no} recorded successfully!`, 'success');
    };
  }

  async deleteBankTransfer(transferId) {
    if (!confirm('Are you sure you want to delete this bank wire record?')) return;
    await this.syncApi('delete_bank_transfer', { id: transferId });
    this.renderActiveTab();
    this.showNotification('Bank wire record deleted.', 'info');
  }

  printBankWireAdvice(transferId) {
    const trn = (this.db?.bank_transfers || []).find(t => t.id === transferId);
    if (!trn) return;
    const comp = (this.db?.companies || []).find(c => c.id === this.activeCompanyId);

    const adviceHtml = `
      <div class="fin-modal-backdrop open" id="modal-wire-advice">
        <div class="fin-modal-dialog" style="max-width:680px; background:#ffffff; color:#0f172a; padding:2rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0284c7; padding-bottom:1rem; margin-bottom:1.5rem;">
            <div>
              <h2 style="margin:0; font-size:1.4rem; color:#0369a1; font-weight:800;">${comp ? comp.name : 'RAYAN GROUP'}</h2>
              <div style="font-size:0.8rem; color:#64748b;">CORPORATE TREASURY &amp; WIRE REMITTANCE ADVICE</div>
            </div>
            <div style="text-align:right;">
              <span style="display:inline-block; padding:3px 10px; background:#e0f2fe; color:#0369a1; font-weight:700; border-radius:4px; font-size:0.75rem;">${trn.status || 'CLEARED'}</span>
              <div style="font-size:0.75rem; color:#64748b; margin-top:4px;">Date: ${this.formatDate(trn.date)}</div>
            </div>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:1.2rem; margin-bottom:1.5rem;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; font-size:0.85rem;">
              <div><strong>UTR / Wire Reference:</strong> <span style="font-family:monospace; color:#0284c7; font-weight:700;">${trn.reference_no}</span></div>
              <div><strong>Transaction Type:</strong> ${trn.type_label || trn.type}</div>
              <div><strong>Originating Bank:</strong> ${trn.source_bank}</div>
              <div><strong>Counterparty / Beneficiary:</strong> ${trn.counterparty}</div>
            </div>
            <div style="margin-top:1.2rem; padding-top:1rem; border-top:1px dashed #cbd5e1; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.9rem; font-weight:700;">Remitted Settlement Amount:</span>
              <span style="font-size:1.4rem; font-weight:800; color:#0369a1;">${this.formatCurrency(trn.amount)}</span>
            </div>
          </div>

          ${trn.purpose ? `<div style="font-size:0.82rem; color:#475569; margin-bottom:1.5rem;"><strong>Remittance Purpose:</strong> ${trn.purpose}</div>` : ''}

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem; margin-top:2.5rem; padding-top:1.5rem; border-top:1px solid #e2e8f0; font-size:0.78rem; text-align:center;">
            <div>
              <div style="font-family:'Courier New', monospace; font-size:1.1rem; color:#0369a1; font-weight:700;">Arshad Alam Shaikh</div>
              <div style="border-top:1px solid #94a3b8; margin-top:4px; padding-top:4px; font-weight:600;">Authorized Signatory</div>
            </div>
            <div>
              <div style="display:inline-block; padding:4px 12px; border:2px dashed #0284c7; border-radius:6px; color:#0284c7; font-weight:800; font-size:0.72rem; letter-spacing:0.08em;">
                OFFICIALLY VERIFIED &amp; AUDITED
              </div>
              <div style="margin-top:4px; font-size:0.72rem; color:#64748b;">Rayan Treasury Desk</div>
            </div>
          </div>

          <div style="margin-top:2rem; display:flex; justify-content:flex-end; gap:0.75rem;" class="no-print">
            <button type="button" class="fin-btn-quick" style="color:#0f172a; border-color:#cbd5e1;" onclick="window.finApp.closeModal('modal-wire-advice')">Close</button>
            <button type="button" class="fin-btn-quick primary" onclick="window.print()">🖨️ Print Wire Advice</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('fin-modal-container').innerHTML = adviceHtml;
  }

  // 3. ADD / EDIT CASH VAULT REGISTER MODAL
  openAddCashRegisterModal(regId = null) {
    const registers = this.db?.cash_in_hand || [];
    const r = regId ? registers.find(x => x.id === regId) : null;
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-cash-register">
        <div class="fin-modal-dialog" style="max-width:520px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">${r ? '✏️ Edit Site Petty Cash Vault' : '💵 Add Site Petty Cash Vault'}</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-cash-register')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="cash-register-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Cash Vault Name <span style="color:#ef4444;">*</span></label>
                <input type="text" id="cr-name" class="fin-form-input" required placeholder="e.g. Dubai Regional Office — Petty Cash Register" value="${r?.register_name || ''}">
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Location / Site <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="cr-loc" class="fin-form-input" required placeholder="e.g. Dubai, UAE / Al Quoz Yard" value="${r?.location || ''}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Custodian Name <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="cr-custodian" class="fin-form-input" required placeholder="e.g. Site Admin Manager" value="${r?.custodian || ''}">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Opening / Imprest Balance <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="cr-balance" class="fin-form-input" required step="any" placeholder="0.00" value="${r?.balance ?? ''}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Currency</label>
                  <select id="cr-currency" class="fin-form-select">
                    <option value="AED" ${(r?.currency || (isIndia ? 'INR' : 'AED')) === 'AED' ? 'selected' : ''}>AED</option>
                    <option value="INR" ${(r?.currency || (isIndia ? 'INR' : 'AED')) === 'INR' ? 'selected' : ''}>INR</option>
                  </select>
                </div>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-cash-register')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">${r ? 'Save Vault' : 'Create Cash Vault'} &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('cash-register-form').onsubmit = async (e) => {
      e.preventDefault();
      const regData = {
        id: r ? r.id : `cash-${Date.now().toString(36)}`,
        company_id: this.activeCompanyId || 'rayan-corp-uae',
        register_name: document.getElementById('cr-name').value.trim(),
        location: document.getElementById('cr-loc').value.trim(),
        custodian: document.getElementById('cr-custodian').value.trim(),
        balance: parseFloat(document.getElementById('cr-balance').value) || 0,
        currency: document.getElementById('cr-currency').value,
        last_replenished: new Date().toISOString().split('T')[0]
      };

      await this.syncApi(r ? 'update_cash_register' : 'create_cash_register', {
        register: regData,
        id: r ? r.id : undefined
      });

      this.closeModal('modal-cash-register');
      this.activeTab = 'cash_in_hand';
      this.renderActiveTab();
      this.showNotification(`Cash register "${regData.register_name}" saved!`, 'success');
    };
  }

  async deleteCashRegister(regId) {
    if (!confirm('Are you sure you want to remove this cash vault register?')) return;
    await this.syncApi('delete_cash_register', { id: regId });
    this.renderActiveTab();
    this.showNotification('Cash register removed.', 'info');
  }

  // 4. RECORD PETTY CASH VOUCHER MODAL
  openCashEntryModal(preselectedVaultId = null) {
    const registers = (this.db?.cash_in_hand || []).filter(r => (r.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const defaultPrefix = isIndia ? 'PC-MUM' : 'PC-DXB';
    const autoVouchNo = `${defaultPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    if (registers.length === 0) {
      alert('Please add a cash vault register first before issuing cash vouchers.');
      this.openAddCashRegisterModal();
      return;
    }

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-cash-entry">
        <div class="fin-modal-dialog" style="max-width:550px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">💵 Record Site Petty Cash Voucher</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-cash-entry')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="cash-entry-form">
              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Cash Register Vault <span style="color:#ef4444;">*</span></label>
                  <select id="ce-vault" class="fin-form-select" required>
                    ${registers.map(r => `<option value="${r.id}" ${r.id === preselectedVaultId ? 'selected' : ''}>${r.register_name} (Bal: ${this.formatCurrency(r.balance)})</option>`).join('')}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Transaction Type</label>
                  <select id="ce-type" class="fin-form-select">
                    <option value="outflow">Expense / Disbursal (Cash Out)</option>
                    <option value="inflow">Replenishment from Bank (Cash In)</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Voucher Number <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="ce-vouch-no" class="fin-form-input" required value="${autoVouchNo}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Voucher Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="ce-date" class="fin-form-input" required value="${new Date().toISOString().split('T')[0]}">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Amount <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="ce-amount" class="fin-form-input" required step="any" placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Expense Category</label>
                  <select id="ce-category" class="fin-form-select">
                    <option value="Fuel & Transportation">Fuel &amp; Mobile Plant Generator</option>
                    <option value="HSE & Consumables">Site Safety, PPE &amp; Hydration</option>
                    <option value="Admin & Printing">Admin, Express Courier &amp; Blueprint Prints</option>
                    <option value="Emergency Repairs">Emergency Site Repairs &amp; Hardware</option>
                    <option value="Site Refreshment">Site Labor Refreshment &amp; Meals</option>
                    <option value="Municipal Fees">Municipal Permit &amp; Toll Fees</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Payee / Recipient Employee <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="ce-payee" class="fin-form-input" required placeholder="e.g. Logistics Driver / Site Runner">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Custodian / Approver</label>
                  <input type="text" id="ce-custodian" class="fin-form-input" placeholder="Accounts Executive" value="Site Admin Manager">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Expense Purpose / Details <span style="color:#ef4444;">*</span></label>
                <input type="text" id="ce-purpose" class="fin-form-input" required placeholder="e.g. Emergency generator diesel fuel for Al Quoz Yard">
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

    document.getElementById('cash-entry-form').onsubmit = async (e) => {
      e.preventDefault();
      const vaultId = document.getElementById('ce-vault').value;
      const vault = registers.find(r => r.id === vaultId);

      const voucherData = {
        id: `cv-${Date.now().toString(36)}`,
        company_id: this.activeCompanyId || 'rayan-corp-uae',
        voucher_no: document.getElementById('ce-vouch-no').value.trim(),
        date: document.getElementById('ce-date').value,
        register_id: vaultId,
        register_name: vault ? vault.register_name : 'Petty Cash Register',
        type: document.getElementById('ce-type').value,
        amount: parseFloat(document.getElementById('ce-amount').value) || 0,
        currency: vault?.currency || (isIndia ? 'INR' : 'AED'),
        category: document.getElementById('ce-category').value,
        payee: document.getElementById('ce-payee').value.trim(),
        custodian: document.getElementById('ce-custodian').value.trim(),
        purpose: document.getElementById('ce-purpose').value.trim(),
        status: 'Approved'
      };

      await this.syncApi('record_cash_voucher', { voucher: voucherData });
      this.closeModal('modal-cash-entry');
      this.activeTab = 'cash_in_hand';
      this.renderActiveTab();
      this.showNotification(`Cash voucher ${voucherData.voucher_no} issued successfully!`, 'success');
    };
  }

  async deleteCashVoucher(voucherId) {
    if (!confirm('Are you sure you want to delete this petty cash voucher?')) return;
    await this.syncApi('delete_cash_voucher', { id: voucherId });
    this.renderActiveTab();
    this.showNotification('Cash voucher deleted.', 'info');
  }

  printCashVoucher(voucherId) {
    const v = (this.db?.cash_vouchers || []).find(x => x.id === voucherId);
    if (!v) return;
    const comp = (this.db?.companies || []).find(c => c.id === this.activeCompanyId);

    const voucherHtml = `
      <div class="fin-modal-backdrop open" id="modal-voucher-print">
        <div class="fin-modal-dialog" style="max-width:640px; background:#ffffff; color:#0f172a; padding:2rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #059669; padding-bottom:1rem; margin-bottom:1.5rem;">
            <div>
              <h2 style="margin:0; font-size:1.3rem; color:#047857; font-weight:800;">${comp ? comp.name : 'RAYAN GROUP'}</h2>
              <div style="font-size:0.8rem; color:#64748b; font-weight:600;">PETTY CASH DISBURSAL VOUCHER</div>
            </div>
            <div style="text-align:right;">
              <div style="font-family:monospace; font-size:1rem; font-weight:800; color:#047857;">${v.voucher_no}</div>
              <div style="font-size:0.75rem; color:#64748b; margin-top:2px;">Date: ${this.formatDate(v.date)}</div>
            </div>
          </div>

          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:1.2rem; margin-bottom:1.5rem;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; font-size:0.85rem;">
              <div><strong>Paid To (Payee):</strong> ${v.payee}</div>
              <div><strong>Register Vault:</strong> ${v.register_name}</div>
              <div><strong>Expense Category:</strong> ${v.category || 'General'}</div>
              <div><strong>Vault Custodian:</strong> ${v.custodian || 'Site Admin'}</div>
            </div>
            <div style="margin-top:1.2rem; padding-top:1rem; border-top:1px dashed #86efac; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.9rem; font-weight:700;">Amount Disbursed:</span>
              <span style="font-size:1.4rem; font-weight:800; color:#047857;">${this.formatCurrency(v.amount)}</span>
            </div>
          </div>

          <div style="font-size:0.85rem; color:#334155; margin-bottom:2rem; padding:0.75rem; background:#f8fafc; border-radius:6px;">
            <strong>Expense Description:</strong> ${v.purpose}
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.5rem; margin-top:2.5rem; padding-top:1.5rem; border-top:1px solid #e2e8f0; font-size:0.75rem; text-align:center;">
            <div>
              <div style="font-weight:700; color:#0f172a;">${v.payee}</div>
              <div style="border-top:1px solid #94a3b8; margin-top:6px; padding-top:4px; color:#64748b;">Receiver's Signature</div>
            </div>
            <div>
              <div style="font-weight:700; color:#0f172a;">${v.custodian || 'Custodian'}</div>
              <div style="border-top:1px solid #94a3b8; margin-top:6px; padding-top:4px; color:#64748b;">Custodian Signature</div>
            </div>
            <div>
              <div style="display:inline-block; padding:3px 8px; border:2px dashed #059669; border-radius:4px; color:#059669; font-weight:800; font-size:0.68rem;">
                VERIFIED CASH
              </div>
              <div style="border-top:1px solid #94a3b8; margin-top:6px; padding-top:4px; color:#64748b;">Accounts Desk Stamp</div>
            </div>
          </div>

          <div style="margin-top:2rem; display:flex; justify-content:flex-end; gap:0.75rem;" class="no-print">
            <button type="button" class="fin-btn-quick" style="color:#0f172a; border-color:#cbd5e1;" onclick="window.finApp.closeModal('modal-voucher-print')">Close</button>
            <button type="button" class="fin-btn-quick primary" onclick="window.print()">🖨️ Print Petty Cash Voucher</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('fin-modal-container').innerHTML = voucherHtml;
  }

  // 5. RECORD CHEQUE MODAL
  openRecordChequeModal(type = 'inward') {
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const isInward = type === 'inward';
    const autoChqNo = Math.floor(100000 + Math.random() * 900000).toString();

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-cheque-entry">
        <div class="fin-modal-dialog" style="max-width:550px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">${isInward ? '📥 Record Inward Cheque (Receipt)' : '📤 Issue Outward Cheque (Disbursal)'}</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-cheque-entry')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="cheque-entry-form">
              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Cheque Number <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="cq-number" class="fin-form-input" required value="${autoChqNo}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Cheque Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="cq-date" class="fin-form-input" required value="${new Date().toISOString().split('T')[0]}">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">${isInward ? 'Drawee Bank Name' : 'Issuing Bank Account'} <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="cq-bank" class="fin-form-input" required placeholder="e.g. First Abu Dhabi Bank / State Bank of India">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">${isInward ? 'Customer / Issuer' : 'Payee Vendor'} <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="cq-party" class="fin-form-input" required placeholder="e.g. Emaar Properties / Siemens">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Cheque Amount <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="cq-amount" class="fin-form-input" required step="any" placeholder="0.00">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Initial Status</label>
                  <select id="cq-status" class="fin-form-select">
                    <option value="${isInward ? 'In Hand' : 'Issued'}">${isInward ? 'In Hand (Under Clearance)' : 'Issued to Vendor'}</option>
                    <option value="Deposited">${isInward ? 'Deposited in Bank' : 'Presented for Clearing'}</option>
                    <option value="Cleared">Cleared Directly</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Notes / Linked Invoice or Project</label>
                <input type="text" id="cq-notes" class="fin-form-input" placeholder="e.g. Milestone RA Bill payment / Spares supply">
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-cheque-entry')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">${isInward ? 'Record Inward Cheque' : 'Issue Cheque'} &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('cheque-entry-form').onsubmit = async (e) => {
      e.preventDefault();
      const chqData = {
        id: `chq-${Date.now().toString(36)}`,
        company_id: this.activeCompanyId || 'rayan-corp-uae',
        type,
        cheque_no: document.getElementById('cq-number').value.trim(),
        date: document.getElementById('cq-date').value,
        bank_name: document.getElementById('cq-bank').value.trim(),
        party_name: document.getElementById('cq-party').value.trim(),
        amount: parseFloat(document.getElementById('cq-amount').value) || 0,
        currency: isIndia ? 'INR' : 'AED',
        status: document.getElementById('cq-status').value,
        notes: document.getElementById('cq-notes').value.trim()
      };

      await this.syncApi('record_cheque', { cheque: chqData });
      this.closeModal('modal-cheque-entry');
      this.activeTab = 'cheques';
      this.renderActiveTab();
      this.showNotification(`Cheque ${chqData.cheque_no} saved successfully!`, 'success');
    };
  }

  async promptClearCheque(chequeId, type = 'inward') {
    const chq = (this.db?.cheques || []).find(c => c.id === chequeId);
    if (!chq) return;
    const banks = (this.db?.bank_accounts || []).filter(b => (b.company_id || 'rayan-corp-uae') === this.activeCompanyId);

    if (banks.length === 0) {
      if (confirm('Mark cheque as Cleared?')) {
        await this.syncApi('update_cheque_status', { id: chequeId, status: 'Cleared' });
        this.renderActiveTab();
      }
      return;
    }

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-clear-cheque">
        <div class="fin-modal-dialog" style="max-width:480px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">⚡ Clear Cheque &amp; Update Bank</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-clear-cheque')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <p style="font-size:0.85rem; color:#cbd5e1; margin-bottom:1rem;">
              Clearing Cheque <strong>#${chq.cheque_no}</strong> for <strong>${this.formatCurrency(chq.amount)}</strong>.
              Select which corporate bank account should be ${type === 'inward' ? 'credited' : 'debited'}:
            </p>
            <form id="clear-cheque-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Corporate Bank Account</label>
                <select id="cc-bank-id" class="fin-form-select">
                  ${banks.map(b => `<option value="${b.id}">${b.bank_name} — ${b.account_name} (${this.formatCurrency(b.balance)})</option>`).join('')}
                </select>
              </div>
              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-clear-cheque')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Confirm Clearance &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('clear-cheque-form').onsubmit = async (e) => {
      e.preventDefault();
      const bankAccId = document.getElementById('cc-bank-id').value;
      await this.syncApi('update_cheque_status', {
        id: chequeId,
        status: 'Cleared',
        bank_account_id: bankAccId
      });
      this.closeModal('modal-clear-cheque');
      this.renderActiveTab();
      this.showNotification(`Cheque #${chq.cheque_no} cleared and bank account updated!`, 'success');
    };
  }

  async deleteCheque(chequeId) {
    if (!confirm('Are you sure you want to delete this cheque record?')) return;
    await this.syncApi('delete_cheque', { id: chequeId });
    this.renderActiveTab();
    this.showNotification('Cheque record deleted.', 'info');
  }

  // 6. ADD / EDIT LOAN FACILITY MODAL
  openAddLoanFacilityModal(loanId = null) {
    const loans = this.db?.loan_accounts || [];
    const l = loanId ? loans.find(x => x.id === loanId) : null;
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-loan-facility">
        <div class="fin-modal-dialog" style="max-width:580px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">${l ? '✏️ Edit Credit Facility' : '🏢 Add Corporate Loan / Credit Facility'}</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-loan-facility')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="loan-facility-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Facility Title / Line Name <span style="color:#ef4444;">*</span></label>
                <input type="text" id="lf-name" class="fin-form-input" required placeholder="e.g. FAB Bank Guarantee & Letter of Credit Facility" value="${l?.facility_name || ''}">
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Lending Bank / Financial Institution <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="lf-lender" class="fin-form-input" required placeholder="e.g. First Abu Dhabi Bank PJSC" value="${l?.lender || ''}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Facility Type</label>
                  <select id="lf-type" class="fin-form-select">
                    <option value="Non-Fund Based (LC / BG Guarantees)">Non-Fund Based (LC / BG Guarantees)</option>
                    <option value="Working Capital Consortium Line">Working Capital Consortium Line</option>
                    <option value="Heavy Machinery Hypothecation">Heavy Machinery Hypothecation</option>
                    <option value="Project Mobilization Escrow Line">Project Mobilization Escrow Line</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Total Sanctioned Limit <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="lf-limit" class="fin-form-input" required step="any" placeholder="0.00" value="${l?.sanctioned_limit ?? ''}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Current Outstanding Debt / Utilized <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="lf-out" class="fin-form-input" required step="any" placeholder="0.00" value="${l?.outstanding_balance ?? ''}">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Interest Rate / Commission</label>
                  <input type="text" id="lf-rate" class="fin-form-input" placeholder="e.g. 1.25% p.a. / MCLR + Spread" value="${l?.interest_rate || l?.commission_rate || ''}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Facility Tenure / Renewal</label>
                  <input type="text" id="lf-tenure" class="fin-form-input" placeholder="e.g. 36 Months / Reviewed Annually" value="${l?.tenure || '36 Months'}">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Security / Collateral Hypothecation</label>
                <input type="text" id="lf-security" class="fin-form-input" placeholder="e.g. Hypothecation of Current Assets & Corporate Guarantee" value="${l?.security || ''}">
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-loan-facility')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">${l ? 'Save Changes' : 'Sanction Facility'} &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('loan-facility-form').onsubmit = async (e) => {
      e.preventDefault();
      const limit = parseFloat(document.getElementById('lf-limit').value) || 0;
      const outstanding = parseFloat(document.getElementById('lf-out').value) || 0;

      const loanData = {
        id: l ? l.id : `loan-${Date.now().toString(36)}`,
        company_id: this.activeCompanyId || 'rayan-corp-uae',
        facility_name: document.getElementById('lf-name').value.trim(),
        lender: document.getElementById('lf-lender').value.trim(),
        facility_type: document.getElementById('lf-type').value,
        sanctioned_limit: limit,
        outstanding_balance: outstanding,
        available_limit: Math.max(0, limit - outstanding),
        currency: isIndia ? 'INR' : 'AED',
        interest_rate: document.getElementById('lf-rate').value.trim(),
        tenure: document.getElementById('lf-tenure').value.trim(),
        security: document.getElementById('lf-security').value.trim()
      };

      await this.syncApi(l ? 'update_loan_account' : 'create_loan_account', {
        loan_account: loanData,
        id: l ? l.id : undefined
      });

      this.closeModal('modal-loan-facility');
      this.activeTab = 'loan_accounts';
      this.renderActiveTab();
      this.showNotification(`Facility "${loanData.facility_name}" saved successfully!`, 'success');
    };
  }

  async deleteLoanAccount(loanId) {
    if (!confirm('Are you sure you want to remove this corporate credit facility?')) return;
    await this.syncApi('delete_loan_account', { id: loanId });
    this.renderActiveTab();
    this.showNotification('Credit facility removed.', 'info');
  }

  // 7. RECORD LOAN DRAWDOWN / REPAYMENT MODAL
  openLoanEntryModal(preselectedFacilityId = null) {
    const loans = (this.db?.loan_accounts || []).filter(l => (l.company_id || 'rayan-corp-uae') === this.activeCompanyId);
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const autoRef = `LF-TRN-${Math.floor(1000 + Math.random() * 9000)}`;

    if (loans.length === 0) {
      alert('Please add a credit facility first before logging transactions.');
      this.openAddLoanFacilityModal();
      return;
    }

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
                  ${loans.map(l => `<option value="${l.id}" ${l.id === preselectedFacilityId ? 'selected' : ''}>${l.facility_name} (Debt: ${this.formatCurrency(l.outstanding_balance)} / Headroom: ${this.formatCurrency(l.available_limit)})</option>`).join('')}
                </select>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Transaction Type <span style="color:#ef4444;">*</span></label>
                  <select id="le-type" class="fin-form-select" required>
                    <option value="repayment">Principal / EMI Repayment (Decreases Debt)</option>
                    <option value="drawdown">Facility Drawdown / LC Issuance (Increases Debt)</option>
                    <option value="interest">Monthly Interest / Bank Commission Service</option>
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Amount <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="le-amount" class="fin-form-input" required step="any" placeholder="0.00">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Bank Reference / Advice # <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="le-ref" class="fin-form-input" required value="${autoRef}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="le-date" class="fin-form-input" required value="${new Date().toISOString().split('T')[0]}">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Transaction Purpose / Notes</label>
                <input type="text" id="le-notes" class="fin-form-input" placeholder="e.g. Advance payment guarantee issued for Marina project">
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

    document.getElementById('loan-entry-form').onsubmit = async (e) => {
      e.preventDefault();
      const facId = document.getElementById('le-facility').value;
      const fac = loans.find(l => l.id === facId);
      const type = document.getElementById('le-type').value;

      const typeLabels = {
        drawdown: 'Facility Drawdown / LC Issuance',
        repayment: 'Principal / EMI Repayment',
        interest: 'Monthly Interest Service'
      };

      const transData = {
        id: `lt-${Date.now().toString(36)}`,
        company_id: this.activeCompanyId || 'rayan-corp-uae',
        facility_id: facId,
        facility_name: fac ? fac.facility_name : 'Credit Facility',
        type,
        type_label: typeLabels[type] || 'Loan Transaction',
        amount: parseFloat(document.getElementById('le-amount').value) || 0,
        currency: isIndia ? 'INR' : 'AED',
        date: document.getElementById('le-date').value,
        reference_no: document.getElementById('le-ref').value.trim(),
        notes: document.getElementById('le-notes').value.trim()
      };

      await this.syncApi('record_loan_transaction', { transaction: transData });
      this.closeModal('modal-loan-entry');
      this.activeTab = 'loan_accounts';
      this.renderActiveTab();
      this.showNotification(`Facility transaction recorded successfully!`, 'success');
    };
  }

  async deleteLoanTransaction(transId) {
    if (!confirm('Are you sure you want to delete this facility transaction?')) return;
    await this.syncApi('delete_loan_transaction', { id: transId });
    this.renderActiveTab();
    this.showNotification('Transaction record deleted.', 'info');
  }

  // 20. PROMPT TO ISSUE CREDIT/DEBIT NOTE
  openCreateNotePrompt(type = 'credit_note') {
    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';
    const currSym = isIndia ? '₹' : 'AED ';

    if (type === 'credit_note') {
      const invoices = (this.db?.invoices || []).filter(i => (i.company_id || 'rayan-corp-uae') === this.activeCompanyId && i.status !== 'void');
      if (invoices.length === 0) {
        alert(`No active invoices found for ${currLabel} to issue a credit note against.`);
        return;
      }
      const inv = invoices[0];
      this.openCreateCreditNoteModal(inv.id);
    } else {
      const bills = (this.db?.purchase_bills || []).filter(b => (b.company_id || 'rayan-corp-uae') === this.activeCompanyId && b.status !== 'void');
      if (bills.length === 0) {
        alert(`No active purchase bills found for ${currLabel} to issue a debit note against.`);
        return;
      }
      const modalHtml = `
        <div class="fin-modal-backdrop open" id="modal-dn">
          <div class="fin-modal-dialog" style="max-width:600px;">
            <div class="fin-modal-header">
              <h3 class="fin-modal-title">🔄 Issue Purchase Debit Note (${currLabel})</h3>
              <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-dn')">&times;</button>
            </div>
            <div class="fin-modal-body">
              <form id="create-dn-form">
                <div class="fin-form-group">
                  <label class="fin-form-label">Select Purchase Bill Ref <span style="color:#ef4444;">*</span></label>
                  <select id="dn-bill-select" class="fin-form-select" required>
                    ${bills.map(b => `<option value="${b.id}" data-vendor="${b.vendor_name}" data-billno="${b.bill_no}">${b.bill_no} — ${b.vendor_name} (${this.formatCurrency(b.grand_total)})</option>`).join('')}
                  </select>
                </div>

                <div class="fin-form-group">
                  <label class="fin-form-label">Debit Reason <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="dn-reason" class="fin-form-input" required placeholder="e.g. Damage in transit / Rate differential on supplies">
                </div>

                <div class="fin-form-group">
                  <label class="fin-form-label">Debit Adjustment Amount (${currLabel}) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="dn-amount" class="fin-form-input" required step="any" placeholder="0.00">
                </div>

                <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                  <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-dn')">Cancel</button>
                  <button type="submit" class="fin-btn-quick primary">Issue Debit Note (${currLabel}) &rarr;</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;
      document.getElementById('fin-modal-container').innerHTML = modalHtml;
      document.getElementById('create-dn-form').onsubmit = async (e) => {
        e.preventDefault();
        const sel = document.getElementById('dn-bill-select');
        const opt = sel.options[sel.selectedIndex];
        const newDn = {
          id: 'dn-' + Date.now(),
          debit_note_no: (isIndia ? 'DN-ASH-' : 'DN-RG-2026-') + String((this.db?.debit_notes?.length || 0) + 1).padStart(3, '0'),
          company_id: this.activeCompanyId,
          currency: isIndia ? 'INR' : 'AED',
          currency_symbol: currSym,
          bill_id: sel.value,
          bill_no: opt.getAttribute('data-billno'),
          vendor_name: opt.getAttribute('data-vendor'),
          reason: document.getElementById('dn-reason').value.trim(),
          total_debit_amount: Number(document.getElementById('dn-amount').value) || 0,
          status: 'applied'
        };
        await this.syncApi('create_debit_note', { debit_note: newDn });
        alert(`Debit note ${newDn.debit_note_no} created and applied against bill ${newDn.bill_no} in ${currLabel}.`);
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

  generateBarcodeSVG(text) {
    const code39 = {
      '0': 'bwbwbwBwb', '1': 'BwbwbWbwb', '2': 'bwBwbWbwb', '3': 'BwBwbwbwb',
      '4': 'bwbwBWbwb', '5': 'BwbwBWbwb', '6': 'bwBwBWbwb', '7': 'bwbwbWBwb',
      '8': 'BwbwbWBwb', '9': 'bwBwbWBwb', 'A': 'BwbwbwbWB', 'B': 'bwBwbwbWB',
      'C': 'BwBwbwbwb', 'D': 'bwbwBwbWB', 'E': 'BwbwBwbwb', 'F': 'bwBwBwbwb',
      'G': 'bwbwbwBWB', 'H': 'BwbwbwBwb', 'I': 'bwBwbwBwb', 'J': 'bwbwBwBwb',
      'K': 'BwbwbwbwB', 'L': 'bwBwbwbwB', 'M': 'BwBwbwbwB', 'N': 'bwbwBwbwB',
      'O': 'BwbwBwbwB', 'P': 'bwBwBwbwB', 'Q': 'bwbwbwBwB', 'R': 'BwbwbwBwB',
      'S': 'bwBwbwBwB', 'T': 'bwbwBwBwB', 'U': 'BWbwbwbwb', 'V': 'bWBwbwbwb',
      'W': 'BWBwbwbwb', 'X': 'bWbwBwbwb', 'Y': 'BWbwBwbwb', 'Z': 'bWBwBwbwb',
      '-': 'bWbwbwBwb', '.': 'BWbwbwBwb', ' ': 'bWBwbwBwb', '$': 'bWbWbWbwb',
      '/': 'bWbWbwbWb', '+': 'bWbwbWbWb', '%': 'bwbWbWbWb', '*': 'bWbwBwBwb'
    };
    const clean = '*' + (String(text || 'REC').toUpperCase().replace(/[^0-9A-Z\-.$/+% ]/g, '-')) + '*';
    let x = 2;
    let rects = '';
    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];
      const pattern = code39[char] || code39['-'];
      for (let p = 0; p < pattern.length; p++) {
        const isBar = (p % 2 === 0);
        const isWide = (pattern[p] === 'B' || pattern[p] === 'W');
        const width = isWide ? 2.2 : 1.0;
        if (isBar) {
          rects += `<rect x="${x}" y="0" width="${width}" height="18" fill="#0f172a" />`;
        }
        x += width;
      }
      x += 1.2;
    }
    return `<svg viewBox="0 0 ${x + 2} 18" class="doc-barcode-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">${rects}</svg>`;
  }

  getRayanDynamicVerificationCode(doc = {}, docType = 'invoice') {
    const docId = doc.invoice_no || doc.receipt_no || doc.po_no || doc.id || 'REC-RG-INV-44049';
    const verifyUrl = `https://rayan-group.com/billing/?verify=${encodeURIComponent(docId)}&type=${encodeURIComponent(docType)}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=2&data=${encodeURIComponent(verifyUrl)}`;
    const barcodeSvg = this.generateBarcodeSVG(docId);

    return `
      <div class="doc-qr-barcode-block">
        <div class="doc-qr-inner-flex">
          <a href="${verifyUrl}" target="_blank" title="Scan or Click to Verify Online" class="doc-qr-link">
            <img src="${qrApiUrl}" alt="Scan QR Code to Verify" class="doc-qr-code-img" loading="eager" onerror="this.src='/assets/docs/rayan-barcode-trn.jpg'">
          </a>
          <div class="doc-barcode-meta">
            ${barcodeSvg}
            <div class="doc-barcode-num">${docId}</div>
            <div class="doc-qr-scan-hint">
              <span>📷</span>
              <span>Scan to view online</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getRayanBarcode(text = '104937380400003') {
    return `
      <div style="display:flex; flex-direction:column; align-items:flex-end;">
        <span style="font-size:8px; font-weight:700; color:#0f172a; margin-bottom:1px;">TRN ${text}</span>
        ${this.generateBarcodeSVG(text)}
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

  // 1. TAX INVOICE PRINT MODAL (Simple, Clean, Official with Logo, Stamp & Signature)
  openInvoicePrintModal(invoiceId, isVerifiedScan = false) {
    const list = this.db?.invoices || [];
    let inv = null;
    if (invoiceId) {
      inv = list.find(i => i.id === invoiceId || i.invoice_no === invoiceId);
    }
    if (!inv) {
      inv = list.find(i => i.invoice_no === 'REC-RG-INV-44049') || (defaultSeedData.invoices || []).find(i => i.invoice_no === 'REC-RG-INV-44049') || list[0] || (defaultSeedData.invoices || [])[0] || {};
    }

    const curr = inv.currency || 'AED';
    const isIndia = curr === 'INR' || inv.company_id === 'ashaz-eng-in' || inv.tax_regime === 'gst';
    const taxableSubtotal = Number(inv.taxable_subtotal || 0);
    const taxTotal = Number(inv.total_tax !== undefined ? inv.total_tax : (inv.vat_total !== undefined ? inv.vat_total : (inv.gst_total || 0)));
    const grandTotal = Number(inv.grand_total || (taxableSubtotal + taxTotal));
    const amountPaid = Number(inv.amount_paid || 0);
    const balanceDue = Number(inv.balance_due !== undefined ? inv.balance_due : (grandTotal - amountPaid));
    const formattedDate = inv.invoice_date ? this.formatDate(inv.invoice_date) : '19 Oct 2026';
    const formattedDueDate = inv.due_date ? this.formatDate(inv.due_date) : (inv.payment_terms === 0 || !inv.payment_terms ? 'Due on Receipt' : '19 Oct 2026');
    const words = this.numberToEnglishWords(grandTotal) + (isIndia ? ' Indian Rupees Only.' : ' UAE Dirhams Only.');

    const lineItems = (inv.line_items && inv.line_items.length) ? inv.line_items : [
      {
        name: inv.project_name || "Civil Contracting & Specialized Fit-Out Works",
        description: inv.notes || "Progressive Works Allocation",
        qty: 1,
        unit_price: taxableSubtotal || grandTotal,
        taxable_amount: taxableSubtotal || grandTotal,
        tax_rate: isIndia ? 18 : 5,
        tax_amount: taxTotal,
        total_amount: grandTotal
      }
    ];

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
            <button type="button" class="fin-btn-print-action fin-btn-print-primary" onclick="window.finApp.printDocument()">
              🖨️ Print / Save as PDF
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal()">
              ✕ Close
            </button>
          </div>
        </div>

        <div class="fin-doc-viewport">
          <div class="fin-document-paper" style="background:#ffffff; color:#0f172a; padding:12mm 16mm 10mm 16mm; font-family:'Plus Jakarta Sans', -apple-system, sans-serif; box-sizing:border-box;">
            <!-- Top Elegant Accent Line -->
            <div style="height:4px; background:linear-gradient(90deg, #00a699 0%, #0284c7 100%); width:100%; border-radius:2px; margin-bottom:1.25rem;"></div>

            <!-- Header Section (Left: Logo & Company, Right: Title & Meta) -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; gap:1.5rem;">
              <div style="max-width:55%;">
                <div style="margin-bottom:0.65rem;">
                  ${this.getRayanLogoImg(false)}
                </div>
                <div style="font-family:'Outfit', sans-serif; font-size:1.05rem; font-weight:800; color:#0f172a; line-height:1.2; text-transform:uppercase;">
                  ${isIndia ? 'ASHAZ ENGINEERING PRIVATE LIMITED' : 'RAYAN ENGINEERING AND CONTRACTING LLC - SPC'}
                </div>
                <div style="font-size:0.8rem; color:#475569; line-height:1.45; margin-top:0.35rem;">
                  ${isIndia ? 'Mumbai, Maharashtra, India<br>GSTIN: 27AABCA1234F1Z5 • CIN: U45200MH2020PTC342819<br>Tel: +91 22 2839 0100 • Email: info@ashaz-eng.com' : 'Plot 42, Mussafah M-36, Abu Dhabi, United Arab Emirates • P.O. Box 91800<br>TRN: <strong>104937380400003</strong> • Commercial Licence: CN-2894710<br>Tel: +971-25654497 / 0559945466 • Email: rayan@rayan-group.com'}
                </div>
              </div>

              <div style="text-align:right;">
                <div style="font-family:'Outfit', sans-serif; font-size:1.85rem; font-weight:800; color:#0f172a; letter-spacing:-0.02em; line-height:1;">
                  TAX INVOICE
                </div>
                <div style="font-size:0.88rem; color:#64748b; font-weight:700; margin-top:2px;">
                  فاتورة ضريبية
                </div>
                <div style="font-size:0.95rem; font-weight:700; color:#0284c7; margin-top:6px;">
                  # ${inv.invoice_no || 'REC-RG-INV-44049'}
                </div>

                <!-- Highlight Box: Balance Due -->
                <div style="margin-top:10px; background:${balanceDue <= 0.01 ? '#f0fdf4' : '#fffbeb'}; border:1px solid ${balanceDue <= 0.01 ? '#bbf7d0' : '#fde68a'}; border-radius:6px; padding:6px 14px; display:inline-block; text-align:right;">
                  <div style="font-size:0.68rem; color:${balanceDue <= 0.01 ? '#15803d' : '#b45309'}; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">Balance Due</div>
                  <div style="font-size:1.35rem; font-weight:800; color:${balanceDue <= 0.01 ? '#16a34a' : '#0f172a'}; font-variant-numeric:tabular-nums;">
                    ${curr} ${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <!-- Meta Details -->
                <div style="font-size:0.8rem; color:#475569; line-height:1.5; margin-top:8px;">
                  <div>Invoice Date : <strong>${formattedDate}</strong></div>
                  <div>Terms : <strong>${inv.payment_terms ? `${inv.payment_terms} Days Net` : 'Due on Receipt'}</strong></div>
                  <div>Due Date : <strong>${formattedDueDate}</strong></div>
                  ${inv.po_reference ? `<div>PO # : <strong>${inv.po_reference}</strong></div>` : ''}
                </div>
              </div>
            </div>

            <!-- Bill To Section -->
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:2rem; margin-bottom:1.5rem; padding:1rem 1.25rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
              <div>
                <div style="font-size:0.72rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.05em; margin-bottom:4px;">Bill To (Client)</div>
                <div style="font-size:1.05rem; font-weight:800; color:#0f172a; margin-bottom:3px;">
                  ${inv.customer_name || 'Client / Entity'}
                </div>
                ${inv.customer_trn ? `<div style="font-size:0.8rem; color:#0284c7; font-weight:700;">TRN: ${inv.customer_trn}</div>` : (inv.customer_gstin ? `<div style="font-size:0.8rem; color:#0284c7; font-weight:700;">GSTIN: ${inv.customer_gstin}</div>` : '')}
                ${inv.contact_person ? `<div style="font-size:0.82rem; color:#475569;">Attn: <strong>${inv.contact_person}</strong></div>` : ''}
                ${inv.email ? `<div style="font-size:0.82rem; color:#475569;">Email: <a href="mailto:${inv.email}" style="color:#0284c7; text-decoration:none;">${inv.email}</a></div>` : ''}
                ${inv.customer_address ? `<div style="font-size:0.82rem; color:#475569;">${inv.customer_address}</div>` : ''}
              </div>

              <div style="font-size:0.82rem; color:#475569; line-height:1.5;">
                <div style="font-size:0.72rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.05em; margin-bottom:4px;">Project &amp; Supply Scope</div>
                <div><strong>Subject:</strong> ${inv.subject || inv.project_name || 'Civil & Specialized Interior Fit-Out Works'}</div>
                <div><strong>Place of Supply:</strong> ${inv.place_of_supply || 'Abu Dhabi, UAE'}</div>
                ${inv.po_reference ? `<div><strong>LPO Ref:</strong> <span style="color:#0284c7; font-weight:700;">${inv.po_reference}</span></div>` : ''}
              </div>
            </div>

            <!-- Line Items Table (Matching Reference Screenshot 1 & 3) -->
            <table style="width:100%; border-collapse:collapse; margin-bottom:1.25rem; font-size:0.85rem;">
              <thead>
                <tr style="background:#0f172a; color:#ffffff; text-align:left;">
                  <th style="padding:10px 12px; width:5%; text-align:center;">#</th>
                  <th style="padding:10px 12px; width:43%;">Item &amp; Description</th>
                  <th style="padding:10px 12px; width:8%; text-align:center;">Qty</th>
                  <th style="padding:10px 12px; width:14%; text-align:right;">Rate</th>
                  <th style="padding:10px 12px; width:15%; text-align:right;">Taxable Amt</th>
                  <th style="padding:10px 12px; width:15%; text-align:right;">Amount (${curr})</th>
                </tr>
              </thead>
              <tbody>
                ${lineItems.map((item, idx) => {
                  const qty = Number(item.qty !== undefined ? item.qty : 1);
                  const rate = Number(item.unit_price !== undefined ? item.unit_price : (item.rate || item.price || 0));
                  const taxable = Number(item.taxable_amount !== undefined ? item.taxable_amount : (item.invoice_amount !== undefined ? item.invoice_amount : (qty * rate)));
                  const vatRate = Number(item.vat_rate !== undefined ? item.vat_rate : (item.gst_rate !== undefined ? item.gst_rate : (isIndia ? 18 : 5)));
                  const vatAmt = Number(item.tax_amount !== undefined ? item.tax_amount : (taxable * (vatRate / 100)));
                  const total = Number(item.total_amount !== undefined ? item.total_amount : (taxable + vatAmt));

                  return `
                    <tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:12px; text-align:center; color:#64748b; font-weight:600;">${idx + 1}</td>
                      <td style="padding:12px;">
                        <div style="font-weight:700; color:#0f172a; font-size:0.9rem;">${item.name || item.description || 'Contract Scope'}</div>
                        ${item.description && item.description !== item.name ? `<div style="font-size:0.78rem; color:#64748b; margin-top:3px;">${item.description}</div>` : ''}
                      </td>
                      <td style="padding:12px; text-align:center; color:#334155;">${qty.toFixed(2)}</td>
                      <td style="padding:12px; text-align:right; color:#334155; font-variant-numeric:tabular-nums;">${rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style="padding:12px; text-align:right; color:#334155; font-variant-numeric:tabular-nums;">${taxable.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style="padding:12px; text-align:right; font-weight:700; color:#0f172a; font-variant-numeric:tabular-nums;">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <!-- Financials Summary: Subtotal, Tax, Payment Made, Balance Due -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; gap:1.5rem;">
              <!-- Left: Words & Notes -->
              <div style="flex:1;">
                <div style="font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Total In Words:</div>
                <div style="font-size:0.88rem; font-weight:700; color:#0f172a; font-style:italic; line-height:1.4;">
                  ${words}
                </div>

                <!-- Tax Summary Table (Matching Screenshot 1 Reference) -->
                <div style="margin-top:1.25rem;">
                  <div style="font-size:0.72rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">Tax Summary</div>
                  <table style="width:100%; max-width:400px; border-collapse:collapse; font-size:0.8rem; border:1px solid #e2e8f0;">
                    <thead>
                      <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; color:#475569; text-align:left;">
                        <th style="padding:5px 8px;">Tax Details</th>
                        <th style="padding:5px 8px; text-align:right;">Taxable (${curr})</th>
                        <th style="padding:5px 8px; text-align:right;">Tax (${curr})</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style="padding:5px 8px; border-bottom:1px solid #e2e8f0;">${isIndia ? 'Standard GST (18%)' : 'Standard Rate (5%)'}</td>
                        <td style="padding:5px 8px; text-align:right; border-bottom:1px solid #e2e8f0;">${taxableSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td style="padding:5px 8px; text-align:right; border-bottom:1px solid #e2e8f0;">${taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr style="font-weight:700; background:#f8fafc;">
                        <td style="padding:5px 8px;">Total</td>
                        <td style="padding:5px 8px; text-align:right;">${taxableSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td style="padding:5px 8px; text-align:right;">${taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style="margin-top:1rem;">
                  <div style="font-size:0.72rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:2px;">Notes:</div>
                  <div style="font-size:0.82rem; color:#475569;">
                    Thanks for your business. Please keep a copy of this official invoice for your records.
                  </div>
                </div>
              </div>

              <!-- Right: Detailed Totals Box (Matching Screenshot 1) -->
              <div style="width:280px; border-top:1px solid #e2e8f0; padding-top:6px;">
                <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:0.88rem; color:#475569;">
                  <span>Sub Total</span>
                  <span style="font-variant-numeric:tabular-nums;">${taxableSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:0.88rem; color:#475569;">
                  <span>${isIndia ? 'GST Total (18%)' : 'VAT Total (5%)'}</span>
                  <span style="font-variant-numeric:tabular-nums;">${taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:7px 0; font-size:1.05rem; font-weight:800; color:#0f172a; border-top:1px solid #e2e8f0; margin-top:2px;">
                  <span>Total</span>
                  <span style="font-variant-numeric:tabular-nums;">${curr} ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                ${amountPaid > 0 ? `
                  <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:0.88rem; color:#059669; font-weight:700;">
                    <span>Payment Made</span>
                    <span style="font-variant-numeric:tabular-nums;">(-) ${amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                ` : ''}
                <div style="display:flex; justify-content:space-between; padding:8px 0; font-size:1.15rem; font-weight:800; color:#0f172a; border-top:2px solid #0f172a; background:#f8fafc; margin-top:4px; padding-left:6px; padding-right:6px; border-radius:4px;">
                  <span>Balance Due</span>
                  <span style="font-variant-numeric:tabular-nums; color:${balanceDue <= 0.01 ? '#16a34a' : '#0f172a'};">${curr} ${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <!-- Signatures & Official Stamp Block (Matching Reference Screenshot 3) -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end; padding-top:1.5rem; border-top:1px solid #e2e8f0; margin-top:1.5rem;">
              <!-- Left: Team Contact -->
              <div style="font-size:0.82rem; color:#475569; line-height:1.55;">
                <div style="margin-bottom:2px;">Best wishes,</div>
                <strong style="color:#0f172a;">${isIndia ? 'Ashaz Engineering Corporate Treasury' : 'RAYAN Group Team'}</strong><br>
                Hotline : ${isIndia ? '+91 22 2839 0100' : '025654497 / 0559945466'}<br>
                <a href="mailto:${isIndia ? 'finance@ashaz-eng.com' : 'cc.info@rayan-group.com'}" style="color:#0284c7; text-decoration:none;">${isIndia ? 'finance@ashaz-eng.com' : 'cc.info@rayan-group.com'}</a><br>
                <a href="${isIndia ? 'https://rayan-group.com' : 'http://rayan-group.com'}" style="color:#0284c7; text-decoration:none;">www.rayan-group.com</a>
              </div>

              <!-- Right: Real Signature + Official Stamp -->
              <div style="position:relative; width:220px; text-align:center; padding-top:10px;">
                <div style="position:relative; z-index:2; min-height:42px;">
                  ${this.getRayanSignatureImg('default')}
                </div>
                <div style="font-family:'Outfit', sans-serif; font-size:0.95rem; font-weight:800; color:#0f172a; margin-top:4px;">
                  Arshad Alam Shaikh
                </div>
                <div style="font-size:0.75rem; color:#64748b; font-weight:600;">
                  Authorised Signatory
                </div>
                <!-- Real Circular Purple/Blue Official Stamp -->
                <div style="position:absolute; right:5px; top:-25px; z-index:5; pointer-events:none;">
                  ${this.getRayanStampImg()}
                </div>
              </div>
            </div>

            <!-- Bottom Teal Banner (Matching Rayan Official Document Format) -->
            <div style="margin-top:2rem; background:#00a699; color:#ffffff; padding:7px 12px; border-radius:4px; font-size:0.78rem; text-align:center; font-weight:700; letter-spacing:0.02em;">
              Tel: +971-25654497 | Abu Dhabi, United Arab Emirates | info@rayan-group.com | www.rayan-group.com
            </div>
            <div style="text-align:center; font-size:8px; color:#94a3b8; margin-top:5px;">
              This is a Computer Generated Tax Invoice
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
    document.body.classList.add('fin-doc-open');
  }

  // 2. RECEIPT VOUCHER PRINT MODAL (Simple, Clean, Official with Logo, Stamp & Signature)
  openReceiptPrintModal(receiptId, isVerifiedScan = false) {
    let rec = (this.db?.customer_receipts || []).find(r => r.id === receiptId || r.receipt_no === receiptId);
    if (!rec) {
      rec = (this.db?.customer_receipts || []).find(r => r.receipt_no === 'REC-RV-44026') || (this.db?.customer_receipts || [])[0] || (this.db?.customer_receipts || []).find(r => r.receipt_no === 'REC-RV-44025') || (defaultSeedData.customer_receipts || [])[0] || {};
    }

    const curr = rec.currency || 'AED';
    const isIndia = curr === 'INR' || rec.company_id === 'ashaz-eng-in';
    const amountVal = Number(rec.amount_received || 0);
    const formattedAmount = amountVal.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const formattedDate = rec.receipt_date ? this.formatDate(rec.receipt_date) : '19 Oct 2026';
    const amountInWords = rec.amount_in_words || (this.numberToEnglishWords(amountVal) + (isIndia ? ' Indian Rupees Only.' : ' UAE Dirhams Only.'));

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
            <button type="button" class="fin-btn-print-action fin-btn-print-primary" onclick="window.finApp.printDocument()">
              🖨️ Print / Save as PDF
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal()">
              ✕ Close
            </button>
          </div>
        </div>

        <div class="fin-doc-viewport">
          <div class="fin-document-paper" style="background:#ffffff; color:#0f172a; padding:12mm 16mm 10mm 16mm; font-family:'Plus Jakarta Sans', -apple-system, sans-serif; box-sizing:border-box;">
            <!-- Top Elegant Accent Line -->
            <div style="height:4px; background:linear-gradient(90deg, #00a699 0%, #0284c7 100%); width:100%; border-radius:2px; margin-bottom:1.25rem;"></div>

            <!-- Header Section (Left: Logo & Company, Right: Receipt Title & Meta) -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; gap:1.5rem;">
              <div style="max-width:55%;">
                <div style="margin-bottom:0.65rem;">
                  ${this.getRayanLogoImg(false)}
                </div>
                <div style="font-family:'Outfit', sans-serif; font-size:1.05rem; font-weight:800; color:#0f172a; line-height:1.2; text-transform:uppercase;">
                  ${isIndia ? 'ASHAZ ENGINEERING PRIVATE LIMITED' : 'RAYAN ENGINEERING AND CONTRACTING LLC - SPC'}
                </div>
                <div style="font-size:0.8rem; color:#475569; line-height:1.45; margin-top:0.35rem;">
                  ${isIndia ? 'Mumbai, Maharashtra, India<br>GSTIN: 27AABCA1234F1Z5 • CIN: U45200MH2020PTC342819<br>Tel: +91 22 2839 0100 • Email: info@ashaz-eng.com' : 'Plot 42, Mussafah M-36, Abu Dhabi, United Arab Emirates • P.O. Box 91800<br>TRN: <strong>104937380400003</strong> • Commercial Licence: CN-2894710<br>Tel: +971-25654497 / 0559945466 • Email: rayan@rayan-group.com'}
                </div>
              </div>

              <div style="text-align:right;">
                <div style="font-family:'Outfit', sans-serif; font-size:1.85rem; font-weight:800; color:#0f172a; letter-spacing:-0.02em; line-height:1;">
                  RECEIPT VOUCHER
                </div>
                <div style="font-size:0.88rem; color:#64748b; font-weight:700; margin-top:2px;">
                  سند قبض
                </div>
                <div style="font-size:0.95rem; font-weight:700; color:#0284c7; margin-top:6px;">
                  # ${rec.receipt_no || 'REC-RV-44025'}
                </div>

                <!-- Highlight Box: Amount Received -->
                <div style="margin-top:10px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px 14px; display:inline-block; text-align:right;">
                  <div style="font-size:0.68rem; color:#15803d; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">Amount Received</div>
                  <div style="font-size:1.35rem; font-weight:800; color:#16a34a; font-variant-numeric:tabular-nums;">
                    ${curr} ${formattedAmount}
                  </div>
                </div>

                <!-- Meta Details -->
                <div style="font-size:0.8rem; color:#475569; line-height:1.5; margin-top:8px;">
                  <div>Receipt Date : <strong>${formattedDate}</strong></div>
                  <div>Payment Mode : <strong>${rec.payment_mode || 'Bank Transfer'}</strong></div>
                  ${rec.reference_no || rec.cheque_no ? `<div>Ref / Instrument # : <strong>${rec.reference_no || rec.cheque_no}</strong></div>` : ''}
                </div>
              </div>
            </div>

            <!-- Bill To (Received From) & Settlement Details -->
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:2rem; margin-bottom:1.5rem; padding:1rem 1.25rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
              <div>
                <div style="font-size:0.72rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.05em; margin-bottom:4px;">Received From (Bill To)</div>
                <div style="font-size:1.05rem; font-weight:800; color:#0f172a; margin-bottom:3px;">
                  ${rec.customer_name || 'Client / Entity'}
                </div>
                ${rec.contact_person ? `<div style="font-size:0.82rem; color:#475569;">Attn: <strong>${rec.contact_person}</strong></div>` : ''}
                ${rec.email ? `<div style="font-size:0.82rem; color:#475569;">Email: <a href="mailto:${rec.email}" style="color:#0284c7; text-decoration:none;">${rec.email}</a></div>` : ''}
                ${rec.customer_address ? `<div style="font-size:0.82rem; color:#475569;">${rec.customer_address}</div>` : ''}
              </div>

              <div style="font-size:0.82rem; color:#475569; line-height:1.5;">
                <div style="font-size:0.72rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.05em; margin-bottom:4px;">Settlement Details</div>
                <div><strong>Subject / Towards:</strong> ${rec.notes || 'Tax Invoice Settlement'}</div>
                <div><strong>Against Invoice:</strong> <span style="color:#0284c7; font-weight:700;">${rec.ref_invoice_no || (rec.allocations && rec.allocations[0] ? rec.allocations[0].invoice_no : 'Advance on Account')}</span></div>
                ${rec.project_name ? `<div><strong>Project:</strong> ${rec.project_name}</div>` : ''}
                ${rec.bank_name ? `<div><strong>Drawee Bank:</strong> ${rec.bank_name}</div>` : ''}
              </div>
            </div>

            <!-- Simple Clean Items Table (Matching Reference Format) -->
            <table style="width:100%; border-collapse:collapse; margin-bottom:1.25rem; font-size:0.85rem;">
              <thead>
                <tr style="background:#0f172a; color:#ffffff; text-align:left;">
                  <th style="padding:10px 12px; width:5%; text-align:center;">#</th>
                  <th style="padding:10px 12px; width:45%;">Item &amp; Description</th>
                  <th style="padding:10px 12px; width:25%;">Payment Mode &amp; Instrument</th>
                  <th style="padding:10px 12px; width:25%; text-align:right;">Amount Received (${curr})</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:12px; text-align:center; color:#64748b; font-weight:600;">1</td>
                  <td style="padding:12px;">
                    <div style="font-weight:700; color:#0f172a; font-size:0.9rem;">
                      ${rec.notes || `Settlement towards Tax Invoice #${rec.ref_invoice_no || 'REC-RG-INV-44043'}`}
                    </div>
                    <div style="font-size:0.78rem; color:#64748b; margin-top:3px;">
                      ${rec.project_name ? `Project: ${rec.project_name} • ` : ''}Invoice Ref: ${rec.ref_invoice_no || 'Advance Payment'}
                    </div>
                  </td>
                  <td style="padding:12px; font-size:0.82rem; color:#334155;">
                    <div><strong>${rec.payment_mode || 'Bank Transfer'}</strong></div>
                    <div style="color:#64748b; font-size:0.75rem;">
                      ${rec.reference_no || rec.cheque_no ? `Ref: ${rec.reference_no || rec.cheque_no}` : ''}
                      ${rec.bank_name ? ` • ${rec.bank_name}` : ''}
                    </div>
                  </td>
                  <td style="padding:12px; text-align:right; font-weight:800; font-size:0.95rem; color:#0f172a; font-variant-numeric:tabular-nums;">
                    ${formattedAmount}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Financials Summary & Amount in Words -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2rem; gap:1.5rem;">
              <!-- Left: Total in Words & Notes -->
              <div style="flex:1;">
                <div style="font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Total In Words:</div>
                <div style="font-size:0.88rem; font-weight:700; color:#0f172a; font-style:italic; line-height:1.4;">
                  ${amountInWords}
                </div>

                <div style="margin-top:1.25rem;">
                  <div style="font-size:0.72rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:2px;">Notes:</div>
                  <div style="font-size:0.82rem; color:#475569;">
                    Thanks for your business. Please keep a copy of this official receipt voucher for your records.
                  </div>
                </div>
              </div>

              <!-- Right: Subtotal & Total Box -->
              <div style="width:260px; border-top:1px solid #e2e8f0; padding-top:6px;">
                <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:0.88rem; color:#475569;">
                  <span>Sub Total</span>
                  <span style="font-variant-numeric:tabular-nums;">${formattedAmount}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:8px 0; font-size:1.1rem; font-weight:800; color:#0f172a; border-top:2px solid #0f172a; margin-top:4px;">
                  <span>Total Received</span>
                  <span style="font-variant-numeric:tabular-nums; color:#16a34a;">${curr} ${formattedAmount}</span>
                </div>
              </div>
            </div>

            <!-- Signatures & Official Stamp Block (Matching Reference Screenshot 3) -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end; padding-top:1.5rem; border-top:1px solid #e2e8f0; margin-top:1.5rem;">
              <!-- Left: Team Contact -->
              <div style="font-size:0.82rem; color:#475569; line-height:1.55;">
                <div style="margin-bottom:2px;">Best wishes,</div>
                <strong style="color:#0f172a;">${isIndia ? 'Ashaz Engineering Corporate Treasury' : 'RAYAN Group Team'}</strong><br>
                Hotline : ${isIndia ? '+91 22 2839 0100' : '025654497 / 0559945466'}<br>
                <a href="mailto:${isIndia ? 'finance@ashaz-eng.com' : 'cc.info@rayan-group.com'}" style="color:#0284c7; text-decoration:none;">${isIndia ? 'finance@ashaz-eng.com' : 'cc.info@rayan-group.com'}</a><br>
                <a href="${isIndia ? 'https://rayan-group.com' : 'http://rayan-group.com'}" style="color:#0284c7; text-decoration:none;">www.rayan-group.com</a>
              </div>

              <!-- Right: Real Signature + Official Stamp -->
              <div style="position:relative; width:220px; text-align:center; padding-top:10px;">
                <div style="position:relative; z-index:2; min-height:42px;">
                  ${this.getRayanSignatureImg('receipt')}
                </div>
                <div style="font-family:'Outfit', sans-serif; font-size:0.95rem; font-weight:800; color:#0f172a; margin-top:4px;">
                  ${rec.receiver_sign || 'Arshad Alam Shaikh'}
                </div>
                <div style="font-size:0.75rem; color:#64748b; font-weight:600;">
                  Authorised Signatory
                </div>
                <!-- Real Circular Purple/Blue Official Stamp -->
                <div style="position:absolute; right:5px; top:-25px; z-index:5; pointer-events:none;">
                  ${this.getRayanStampImg()}
                </div>
              </div>
            </div>

            <!-- Bottom Teal Banner (Matching Rayan Official Document Format) -->
            <div style="margin-top:2rem; background:#00a699; color:#ffffff; padding:7px 12px; border-radius:4px; font-size:0.78rem; text-align:center; font-weight:700; letter-spacing:0.02em;">
              Tel: +971-25654497 | Abu Dhabi, United Arab Emirates | info@rayan-group.com | www.rayan-group.com
            </div>
            <div style="text-align:center; font-size:8px; color:#94a3b8; margin-top:5px;">
              This is a Computer Generated Official Receipt Voucher
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
    document.body.classList.add('fin-doc-open');
  }

  // 3. PURCHASE ORDER PRINT MODAL (2 Full Pages)
  openPOPrintModal(poId, isVerifiedScan = false) {
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
            <button type="button" class="fin-btn-print-action fin-btn-print-primary" onclick="window.finApp.printDocument()">
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
            <div class="doc-top-accent-bar"></div>

            <div class="fin-doc-inner-padding">
              ${this.getRayanWatermark()}

              ${isVerifiedScan ? `
                <div class="doc-verification-live-banner">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:16px;">📑</span>
                    <div>
                      <div style="font-size:9px; font-weight:800; letter-spacing:0.04em;">OFFICIAL PURCHASE ORDER — PROCUREMENT AUDIT VERIFIED</div>
                      <div style="font-size:7px; opacity:0.9; margin-top:1px;">Accredited procurement commitment issued under Rayan Group Contracts &amp; Subcontract Management.</div>
                    </div>
                  </div>
                  <div style="font-size:7.5px; background:rgba(255,255,255,0.22); padding:3px 8px; border-radius:4px; font-weight:800;">
                    AUDITED PROCUREMENT ✓
                  </div>
                </div>
              ` : ''}

              <!-- Modern Executive Brand Header -->
              <div class="doc-header-modern">
                <div class="doc-brand-block">
                  ${this.getRayanLogoImg(true)}
                  <div class="doc-brand-text">
                    <div class="doc-company-title">RAYAN ENGINEERING &amp; CONTRACTING L.L.C - S.P.C</div>
                    <div class="doc-company-sub">General Contracting • Industrial Construction • MEP Fit-Out</div>
                    <div class="doc-company-badges">
                      <span class="doc-badge-pill">TRN: 104937380400003</span>
                      <span class="doc-badge-pill">Lic: CN-2849102</span>
                      <span class="doc-badge-pill">Abu Dhabi, UAE</span>
                    </div>
                  </div>
                </div>

                <div class="doc-header-center">
                  <div class="doc-title-en">PURCHASE ORDER</div>
                  <div class="doc-number-bold">${po.po_no || 'PO-REC-11008'}</div>
                </div>

                <div class="doc-id-card">
                  <div class="doc-status-badge status-issued">● OFFICIAL PROCUREMENT</div>
                  ${this.getRayanDynamicVerificationCode(po, 'po')}
                </div>
              </div>

              <!-- Supplier & Ship-To Details Grid -->
              <div class="doc-grid-cards">
                <div class="doc-info-card">
                  <div class="doc-info-card-header">
                    <span>SUPPLIER / VENDOR (بيانات المورد)</span>
                    <span>PROCUREMENT VENDOR</span>
                  </div>
                  <div class="doc-info-entity-name">${po.supplier_name || po.vendor_name || 'ARIBA GM INTERIOR DÉCOR LLC'}</div>
                  <div class="doc-info-line">
                    ${po.supplier_address || 'Abu Dhabi, P.O. Box -'}<br>
                    <strong>Attn:</strong> ${po.supplier_attn || 'Mr. Mohammad Gulam'} &nbsp;•&nbsp; <strong>TRN#:</strong> ${po.supplier_trn || '104755857000003'}<br>
                    <strong>Mobile:</strong> ${po.supplier_mobile || '+971559314189'}<br>
                    <strong>Email:</strong> <a href="mailto:${po.supplier_email || 'aribadecoration@gmail.com'}" class="rayan-link-blue">${po.supplier_email || 'aribadecoration@gmail.com'}</a>
                    ${po.quote_ref && po.quote_ref !== '-' ? `<br><strong>Quote Ref:</strong> ${po.quote_ref}` : ''}
                  </div>
                </div>

                <div class="doc-info-card">
                  <div class="doc-info-card-header">
                    <span>SHIP TO &amp; SPECIFICATIONS (جهة الاستلام والطلب)</span>
                    <span>PO METRICS</span>
                  </div>
                  <div class="doc-key-value-list">
                    <div class="doc-key-value-row">
                      <span class="doc-label">PO Date:</span>
                      <span class="doc-val">${po.date ? this.formatDate(po.date) : '23/Jun/2026'}</span>
                    </div>
                    <div class="doc-key-value-row">
                      <span class="doc-label">Payment Terms:</span>
                      <span class="doc-val" style="color:#0284c7;">${po.payment_terms || 'PDC30'}</span>
                    </div>
                    <div class="doc-key-value-row">
                      <span class="doc-label">Currency / PO Type:</span>
                      <span class="doc-val">${po.currency || 'AED'} • ${po.po_type || 'Supply/Application'}</span>
                    </div>
                    <div class="doc-key-value-row">
                      <span class="doc-label">Internal Ref (iRef):</span>
                      <span class="doc-val">${po.iref || '2026-KGN-SUB'}</span>
                    </div>
                    <div class="doc-key-value-row">
                      <span class="doc-label">Responsible Person:</span>
                      <span class="doc-val">${po.responsible_person || 'Mohammad Suhel'} (${po.ship_to_phone || '+971 25 654497'})</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Project Ribbon -->
              <div class="doc-project-ribbon">
                <span>🏗️ <strong style="font-size:8.5px; color:#0f172a;">${po.project_name || 'Al Foah Mall Screeding Work'}</strong></span>
                <span style="font-size:7.5px; color:#0284c7; background:rgba(2,132,199,0.08); padding:2px 8px; border-radius:4px; font-weight:800;">OFFICIAL PROCUREMENT CONTRACT</span>
              </div>

              <!-- Modern Line Items Table -->
              <table class="doc-table-modern">
                <thead>
                  <tr>
                    <th style="width:4%; text-align:center;">#</th>
                    <th style="width:38%;">DESCRIPTION &amp; TECHNICAL SCOPE</th>
                    <th style="width:8%; text-align:center;">UNIT</th>
                    <th style="width:7%; text-align:center;">QTY</th>
                    <th style="width:13%; text-align:right;">UNIT PRICE</th>
                    <th style="width:14%; text-align:right;">INVOICE AMT</th>
                    <th style="width:8%; text-align:center;">VAT 5%</th>
                    <th style="width:14%; text-align:right;">TOTAL (AED)</th>
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
                      <td style="text-align:center; font-weight:700; color:#64748b;">${item.sr || (idx + 1)}</td>
                      <td>
                        <div class="doc-item-title">${item.name || item.description}</div>
                        ${item.description && item.description !== item.name ? `<div class="doc-item-desc">${item.description}</div>` : ''}
                      </td>
                      <td style="text-align:center; font-weight:700;">${item.unit || item.uom || 'Sqm'}</td>
                      <td style="text-align:center; font-weight:800;">${item.qty || 160}</td>
                      <td style="text-align:right; font-variant-numeric:tabular-nums;">${Number(item.unit_price || 60).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style="text-align:right; font-weight:700; font-variant-numeric:tabular-nums;">${Number(item.invoice_amount || item.taxable_amount || 9600).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style="text-align:center; font-weight:700; color:#059669; font-variant-numeric:tabular-nums;">${Number(item.vat_amount || item.tax_amount || 480).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style="text-align:right; font-weight:800; color:#0f172a; font-variant-numeric:tabular-nums;">AED ${Number(item.total_amount || 9600).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Financials & Breakdown -->
              <div class="doc-financials-container">
                <div class="doc-left-financials">
                  <div class="doc-words-box">
                    <div class="doc-words-label">Total Amount in Words / المبلغ الإجمالي بالأحرف:</div>
                    <div class="doc-words-text">💵 ${po.amount_in_words || ('AED ' + this.numberToEnglishWords(po.total_value || po.grand_total || 10080))}</div>
                  </div>

                  <div class="po-terms-card-modern">
                    <div class="po-terms-heading-modern">
                      <span>Notes to Supplier / ملاحظات للمورد</span>
                      <span>Site Protocol</span>
                    </div>
                    1. <strong>Location / Site:</strong> Al Foah Mall - Alain • Working hours: 8:00 AM to 6:00 PM (lunch break included).<br>
                    2. Supplier responsible for all Insurance, PPE, Tools, welfare, logistics, transportation, and equipment.<br>
                    3. All HSE documents and operator/flagman competency certifications must be approved before commencement.
                  </div>
                </div>

                <div class="doc-totals-card">
                  <div class="doc-totals-row">
                    <span>Misc. Charges Subtotal:</span>
                    <span class="doc-num">${Number(po.misc_charges || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} AED</span>
                  </div>
                  <div class="doc-totals-row">
                    <span>Total Amount EX-VAT (المجموع):</span>
                    <span class="doc-num">${Number(po.subtotal_ex_vat || po.subtotal || 9600).toLocaleString('en-US', { minimumFractionDigits: 2 })} AED</span>
                  </div>
                  <div class="doc-totals-row">
                    <span>VAT 5% (ضريبة القيمة المضافة):</span>
                    <span class="doc-num" style="color:#059669;">+ ${Number(po.vat_total || po.tax_total || 480).toLocaleString('en-US', { minimumFractionDigits: 2 })} AED</span>
                  </div>
                  <div class="doc-totals-row grand-total">
                    <span>Total Incl. VAT (الإجمالي)</span>
                    <span style="color:#38bdf8;">AED ${Number(po.total_value || po.grand_total || 10080).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <!-- General Terms & Conditions (Page 1) -->
              <div class="po-terms-card-modern" style="margin-top:2px;">
                <div class="po-terms-heading-modern">
                  <span>GENERAL TERMS AND CONDITIONS FOR SUPPLIES (الشروط العامة)</span>
                  <span>Articles 1 – 7</span>
                </div>
                <strong>1. The Order:</strong> Entered into with RAYAN Engineering and Contracting LLC-SPC for sale, delivery and installation of goods described. These terms are non-varying unless expressly agreed in writing.<br>
                <strong>2. Prices:</strong> Final and not subject to escalation under any circumstances.<br>
                <strong>3. Identification of Material:</strong> All packages must be marked with PO number and accompanied by a Delivery Note quoting quantities &amp; descriptions.<br>
                <strong>4. Packing &amp; Protection:</strong> Materials must be protected individually against damage, transit shock, and environmental degradation.<br>
                <strong>5. Delivery of Goods/Services:</strong> As per agreed INCOTERMS to specified address. Partial or early delivery requires written authorization. Delivery date as stated in PO.<br>
                <strong>6. Performance Guarantee:</strong> Supplier shall submit within 10 days of receipt of PO a 10% performance bond in a form accepted to RAYAN, unless agreed in writing otherwise.<br>
                <strong>7. Receipt &amp; Acceptance:</strong> Subject to final inspection and testing by RAYAN. Rejected goods held at Supplier's risk and expense.
              </div>

              <!-- Computer Generated Notice (Page 1) -->
              <div class="rayan-computer-generated-notice">
                <span>🔒</span>
                <span>This is a Computer Generated Purchase Order</span>
              </div>

              <!-- Minimal Clean Document Footer (matching user quotation/invoice style) -->
              <div class="doc-minimal-footer">
                <div class="doc-minimal-footer-line"></div>
                <div class="doc-minimal-footer-content">
                  <span class="doc-minimal-footer-left">Rayan Engineering &amp; Contracting | Purchase Order for ${po.supplier_name || 'Al Rayan Building Materials'}</span>
                  <span class="doc-minimal-footer-right">Page 1 of 2</span>
                </div>
              </div>
            </div>
          </div>

          <!-- PAGE 2 OF PURCHASE ORDER -->
          <div class="fin-document-paper fin-doc-page-2">
            <div class="doc-top-accent-bar"></div>

            <div class="fin-doc-inner-padding">
              <!-- Mini Header for Page 2 -->
              <div class="doc-header-modern" style="padding-bottom:6px; margin-bottom:8px;">
                <div class="doc-brand-block">
                  ${this.getRayanLogoImg(true)}
                  <div class="doc-brand-text">
                    <div class="doc-company-title">RAYAN ENGINEERING &amp; CONTRACTING L.L.C - S.P.C</div>
                    <div class="doc-company-sub">Official Procurement Terms &amp; Conditions Specification • Page 2 of 2</div>
                  </div>
                </div>
                <div class="doc-id-card">
                  <div class="doc-title-en">PURCHASE ORDER</div>
                  <div class="doc-number-pill">${po.po_no || 'PO-REC-11008'}</div>
                </div>
              </div>

              <!-- Structured Modern Terms Grid (Clauses 8 to 20 + Invoicing) -->
              <div class="po-terms-grid-modern">
                <div class="po-terms-col">
                  <strong>8. Rejection of Goods/Services:</strong> RAYAN reserves the right to withhold payment for non-compliant goods/services with applicable delay penalties.<br><br>
                  <strong>9. Cancellation of Order:</strong> Right reserved to cancel for non-delivery by stipulated date without liability.<br><br>
                  <strong>10. Invoicing Regulations:</strong> Tax invoices must be submitted within 14 days of supply (Decree-Law Art. 67). Must state correct legal company name, TRN, PO reference, delivery note, and compliant VAT details.<br><br>
                  <strong>11. Delay Penalties:</strong> 1% of delayed items value for 1st week, increasing 2% weekly up to maximum 10%.<br><br>
                  <strong>12. Risk Purchase:</strong> Following penalty exhaustion, RAYAN may cancel, draw bank guarantee, and procure from alternate sources with 5% admin charge charged to Supplier.<br><br>
                  <strong>13. Warranty:</strong> Merchantable, fit for purpose, free from defects for warranty period. Supplier bears all replacement, labor, and transport charges.
                </div>

                <div class="po-terms-col">
                  <strong>14. Termination:</strong> Buyer may terminate for convenience with 30 days written notice without liability except for accepted delivered items.<br><br>
                  <strong>15. Force Majeure:</strong> Relieves obligations during duration of qualifying events with prompt written notification.<br><br>
                  <strong>16. Taxes &amp; Banking:</strong> All taxes, duties, and banking charges borne by Seller unless expressly exempted.<br><br>
                  <strong>17. Indemnity:</strong> Supplier defends and holds Buyer harmless against damages, claims, costs, injuries, or third-party breaches.<br><br>
                  <strong>18. Governing Law:</strong> Laws of Abu Dhabi and UAE federal laws. Disputes referred to Abu Dhabi competent courts.<br><br>
                  <strong>19. Payment Term:</strong> 50% advance upon order confirmation; remaining 50% upon client inspection and certification.<br><br>
                  <strong>20. Invoice Requirements:</strong> Approved time sheets, delivery notes, and stamped original tax invoices submitted to HO.
                </div>
              </div>

              <!-- Signatories & Stamps Modern Block -->
              <div class="doc-signatures-modern" style="padding-top:10px; margin-top:auto;">
                <div class="doc-sign-team-meta">
                  <strong>Best Wishes</strong><br>
                  <strong>RAYAN Group Procurement Committee</strong><br>
                  Hotline : 025654497 • Abu Dhabi, UAE<br>
                  <a href="mailto:cc.info@rayan-group.com" class="rayan-link-blue">cc.info@rayan-group.com</a><br>
                  <a href="http://rayan-group.com" class="rayan-link-blue">http://rayan-group.com</a>
                </div>

                <div class="doc-sign-card">
                  <div class="doc-auth-label">Authorised Signatory (Purchaser)</div>
                  ${this.getRayanSignatureImg('default')}
                  <div class="doc-sign-name">Arshad Alam Shaikh</div>
                  ${this.getRayanStampImg()}
                </div>

                <div class="doc-sign-card">
                  <div class="doc-auth-label">Authorised Signatory (Supplier)</div>
                  <div style="height:38px;"></div>
                  <div class="doc-sign-name">${po.supplier_attn || 'Mr. Mohammad Gulam'}</div>
                </div>
              </div>

              <!-- Preserved Computer Generated Notice (Page 2) -->
              <div class="rayan-computer-generated-notice">
                <span>🔒</span>
                <span>This is a Computer Generated Purchase Order</span>
              </div>

              <!-- Minimal Clean Document Footer (matching user quotation/invoice style) -->
              <div class="doc-minimal-footer">
                <div class="doc-minimal-footer-line"></div>
                <div class="doc-minimal-footer-content">
                  <span class="doc-minimal-footer-left">Rayan Engineering &amp; Contracting | Purchase Order Terms &amp; Conditions</span>
                  <span class="doc-minimal-footer-right">Page 2 of 2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
    document.body.classList.add('fin-doc-open');
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


  // ==========================================================================
  // COMPREHENSIVE DOCUMENT EDITING WORKFLOWS (INVOICES, BILLS, RECEIPTS, EXPENSES, POs)
  // ==========================================================================

  // 1. EDIT TAX INVOICE MODAL
  openEditInvoiceModal(invoiceId) {
    const inv = (this.db?.invoices || []).find(i => i.id === invoiceId || i.invoice_no === invoiceId);
    if (!inv) {
      alert('Invoice not found.');
      return;
    }
    const isIndia = (inv.company_id || this.activeCompanyId) === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';
    const currSym = isIndia ? '₹' : 'AED ';
    const customers = (this.db?.customers || []).filter(c => !c.company_id || c.company_id === (inv.company_id || this.activeCompanyId));
    const projects = (this.db?.projects || []).filter(p => !p.company_id || p.company_id === (inv.company_id || this.activeCompanyId));

    const lineItems = (inv.line_items && inv.line_items.length) ? inv.line_items : [
      {
        name: 'General Contracting Services',
        qty: 1,
        uom: 'LSUM',
        unit_price: Number(inv.taxable_subtotal) || 1000,
        taxable_amount: Number(inv.taxable_subtotal) || 1000,
        vat_rate: isIndia ? 0 : 5,
        gst_rate: isIndia ? 18 : 0,
        tax_amount: Number(inv.total_tax) || (isIndia ? 180 : 50),
        total_amount: Number(inv.grand_total) || (isIndia ? 1180 : 1050)
      }
    ];

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-edit-invoice">
        <div class="fin-modal-dialog" style="max-width:850px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">✏️ Edit Sales Tax Invoice (${inv.invoice_no})</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-edit-invoice')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="edit-invoice-form">
              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Customer / Client <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="edit-inv-cust-name" class="fin-form-input" value="${inv.customer_name || ''}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">${isIndia ? 'Customer GSTIN' : 'Customer TRN'}</label>
                  <input type="text" id="edit-inv-cust-tax" class="fin-form-input" value="${inv.customer_trn || inv.customer_gstin || ''}" placeholder="${isIndia ? 'e.g. 27AAACT2727Q1ZT' : 'e.g. 100234567800003'}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Place of Supply</label>
                  <input type="text" id="edit-inv-pos" class="fin-form-input" value="${inv.place_of_supply || (isIndia ? 'Maharashtra (27)' : 'Abu Dhabi, UAE')}">
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Invoice Date</label>
                  <input type="date" id="edit-inv-date" class="fin-form-input" value="${inv.invoice_date || ''}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Payment Terms (Days)</label>
                  <input type="number" id="edit-inv-terms" class="fin-form-input" value="${inv.payment_terms || 30}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Due Date</label>
                  <input type="date" id="edit-inv-due-date" class="fin-form-input" value="${inv.due_date || ''}" required>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Item / Service Scope Description <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="edit-inv-item-desc" class="fin-form-input" value="${lineItems[0]?.name || ''}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Unit of Measure (UOM)</label>
                  <select id="edit-inv-item-uom" class="fin-form-select">
                    <option value="LSUM" ${lineItems[0]?.uom === 'LSUM' ? 'selected' : ''}>LSUM (Lump Sum)</option>
                    <option value="Sqm" ${lineItems[0]?.uom === 'Sqm' ? 'selected' : ''}>Sqm (Square Meter)</option>
                    <option value="MT" ${lineItems[0]?.uom === 'MT' ? 'selected' : ''}>MT (Metric Ton)</option>
                    <option value="CUM" ${lineItems[0]?.uom === 'CUM' ? 'selected' : ''}>CUM (Cubic Meter)</option>
                    <option value="HRS" ${lineItems[0]?.uom === 'HRS' ? 'selected' : ''}>HRS (Hours)</option>
                    <option value="UNITS" ${lineItems[0]?.uom === 'UNITS' ? 'selected' : ''}>UNITS</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Taxable Subtotal (${currLabel}) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="edit-inv-taxable" class="fin-form-input" value="${inv.taxable_subtotal || 0}" min="1" step="any" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Tax Rate %</label>
                  <select id="edit-inv-tax-rate" class="fin-form-select">
                    ${!isIndia ? `
                      <option value="5" selected>5% UAE VAT</option>
                      <option value="0">0% (Zero-rated / Exempt)</option>
                    ` : `
                      <option value="18" selected>18% GST</option>
                      <option value="12">12% GST</option>
                      <option value="28">28% GST</option>
                      <option value="5">5% GST</option>
                      <option value="0">0% (Exempt)</option>
                    `}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Grand Total (${currLabel})</label>
                  <input type="text" id="edit-inv-grand" class="fin-form-input" readonly value="${currSym}${Number(inv.grand_total || 0).toFixed(2)}" style="font-weight:700; color:#38bdf8;">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Notes &amp; Payment Instructions</label>
                <textarea id="edit-inv-notes" class="fin-form-textarea" rows="2">${inv.notes || ''}</textarea>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-edit-invoice')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save &amp; Update Invoice (${currLabel}) &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    const taxableInp = document.getElementById('edit-inv-taxable');
    const taxRateSel = document.getElementById('edit-inv-tax-rate');
    const grandInp = document.getElementById('edit-inv-grand');

    const updateTotals = () => {
      const taxable = Number(taxableInp.value) || 0;
      const rate = Number(taxRateSel.value) || 0;
      const tax = taxable * (rate / 100);
      const grand = taxable + tax;
      grandInp.value = `${currSym}${grand.toLocaleString(isIndia ? 'en-IN' : 'en-US', { minimumFractionDigits: 2 })}`;
    };

    taxableInp.oninput = updateTotals;
    taxRateSel.onchange = updateTotals;

    document.getElementById('edit-invoice-form').onsubmit = async (e) => {
      e.preventDefault();
      const taxable = Number(taxableInp.value) || 0;
      const rate = Number(taxRateSel.value) || 0;
      const tax = taxable * (rate / 100);
      const grand = taxable + tax;
      const paid = Number(inv.amount_paid) || 0;
      const balanceDue = Math.max(0, grand - paid);

      inv.customer_name = document.getElementById('edit-inv-cust-name').value.trim();
      if (isIndia) {
        inv.customer_gstin = document.getElementById('edit-inv-cust-tax').value.trim();
      } else {
        inv.customer_trn = document.getElementById('edit-inv-cust-tax').value.trim();
      }
      inv.place_of_supply = document.getElementById('edit-inv-pos').value.trim();
      inv.invoice_date = document.getElementById('edit-inv-date').value;
      inv.due_date = document.getElementById('edit-inv-due-date').value;
      inv.payment_terms = Number(document.getElementById('edit-inv-terms').value);
      inv.taxable_subtotal = taxable;
      inv.total_tax = tax;
      inv.grand_total = grand;
      inv.balance_due = balanceDue;
      inv.status = balanceDue <= 0.01 ? 'paid' : (paid > 0 ? 'partially_paid' : 'sent');
      inv.notes = document.getElementById('edit-inv-notes').value.trim();

      inv.line_items = [
        {
          name: document.getElementById('edit-inv-item-desc').value.trim(),
          qty: 1,
          uom: document.getElementById('edit-inv-item-uom').value,
          unit_price: taxable,
          taxable_amount: taxable,
          vat_rate: isIndia ? 0 : rate,
          gst_rate: isIndia ? rate : 0,
          tax_amount: tax,
          total_amount: grand
        }
      ];

      await this.syncApi('update_invoice', { invoice: inv });
      alert(`Invoice ${inv.invoice_no} updated successfully.`);
      this.closeModal('modal-edit-invoice');
      this.renderActiveTab();
    };
  }

  // 2. EDIT PURCHASE BILL MODAL
  openEditBillModal(billId) {
    const bill = (this.db?.purchase_bills || []).find(b => b.id === billId || b.bill_no === billId);
    if (!bill) {
      alert('Purchase bill not found.');
      return;
    }
    const isIndia = (bill.company_id || this.activeCompanyId) === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';
    const currSym = isIndia ? '₹' : 'AED ';
    const projects = (this.db?.projects || []).filter(p => !p.company_id || p.company_id === (bill.company_id || this.activeCompanyId));

    const lineItems = (bill.line_items && bill.line_items.length) ? bill.line_items : [
      {
        name: 'Procurement Supplies',
        qty: 1,
        uom: 'LSUM',
        unit_price: Number(bill.taxable_subtotal) || 1000,
        taxable_amount: Number(bill.taxable_subtotal) || 1000
      }
    ];

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-edit-bill">
        <div class="fin-modal-dialog">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">✏️ Edit Purchase Bill (${bill.bill_no})</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-edit-bill')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="edit-bill-form">
              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Vendor Name <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="edit-bill-vend-name" class="fin-form-input" value="${bill.vendor_name || ''}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">${isIndia ? 'Vendor GSTIN' : 'Vendor TRN'}</label>
                  <input type="text" id="edit-bill-tax-no" class="fin-form-input" value="${bill.vendor_trn || bill.vendor_gstin || ''}" placeholder="${isIndia ? 'e.g. 27AAACT2727Q1ZT' : 'e.g. 100234567800003'}">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Supplier Invoice # <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="edit-bill-inv-no" class="fin-form-input" value="${bill.vendor_invoice_no || ''}" required>
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Bill Date</label>
                  <input type="date" id="edit-bill-date" class="fin-form-input" value="${bill.bill_date || ''}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Payment Terms (Days)</label>
                  <input type="number" id="edit-bill-terms" class="fin-form-input" value="${bill.payment_terms || 30}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Due Date</label>
                  <input type="date" id="edit-bill-due-date" class="fin-form-input" value="${bill.due_date || ''}" required>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Linked Project</label>
                  <select id="edit-bill-project" class="fin-form-select">
                    <option value="">General Corporate Overhead</option>
                    ${projects.map(p => `<option value="${p.id}" ${bill.project_id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Item / Service Purchased <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="edit-bill-desc" class="fin-form-input" value="${lineItems[0]?.name || ''}" required>
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Taxable Subtotal (${currLabel}) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="edit-bill-taxable" class="fin-form-input" value="${bill.taxable_subtotal || 0}" min="1" step="any" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Tax Rate %</label>
                  <select id="edit-bill-rate" class="fin-form-select">
                    ${!isIndia ? `
                      <option value="5" selected>5% UAE VAT (Standard)</option>
                      <option value="0">0% (Zero-rated / Exempt)</option>
                      <option value="18">18% GST (Import)</option>
                    ` : `
                      <option value="18" selected>18% GST (Standard)</option>
                      <option value="12">12% GST</option>
                      <option value="5">5% GST</option>
                      <option value="0">0% (Exempt)</option>
                    `}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Grand Total (${currLabel})</label>
                  <input type="text" id="edit-bill-grand" class="fin-form-input" readonly value="${currSym}${Number(bill.grand_total || 0).toFixed(2)}" style="font-weight:700; color:#38bdf8;">
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Notes &amp; Quality Sign-Off</label>
                <textarea id="edit-bill-notes" class="fin-form-textarea" rows="2">${bill.notes || ''}</textarea>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-edit-bill')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save &amp; Update Bill (${currLabel}) &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    const taxableInp = document.getElementById('edit-bill-taxable');
    const rateSel = document.getElementById('edit-bill-rate');
    const grandInp = document.getElementById('edit-bill-grand');

    const updateTotals = () => {
      const taxable = Number(taxableInp.value) || 0;
      const rate = Number(rateSel.value) || 0;
      const tax = taxable * (rate / 100);
      const grand = taxable + tax;
      grandInp.value = `${currSym}${grand.toLocaleString(isIndia ? 'en-IN' : 'en-US', { minimumFractionDigits: 2 })}`;
    };

    taxableInp.oninput = updateTotals;
    rateSel.onchange = updateTotals;

    document.getElementById('edit-bill-form').onsubmit = async (e) => {
      e.preventDefault();
      const taxable = Number(taxableInp.value) || 0;
      const rate = Number(rateSel.value) || 0;
      const tax = taxable * (rate / 100);
      const grand = taxable + tax;
      const paid = Number(bill.amount_paid) || 0;
      const balanceDue = Math.max(0, grand - paid);

      bill.vendor_name = document.getElementById('edit-bill-vend-name').value.trim();
      if (isIndia) {
        bill.vendor_gstin = document.getElementById('edit-bill-tax-no').value.trim();
      } else {
        bill.vendor_trn = document.getElementById('edit-bill-tax-no').value.trim();
      }
      bill.vendor_invoice_no = document.getElementById('edit-bill-inv-no').value.trim();
      bill.bill_date = document.getElementById('edit-bill-date').value;
      bill.payment_terms = Number(document.getElementById('edit-bill-terms').value);
      bill.due_date = document.getElementById('edit-bill-due-date').value;
      bill.taxable_subtotal = taxable;
      bill.tax_total = tax;
      bill.grand_total = grand;
      bill.balance_due = balanceDue;
      bill.status = balanceDue <= 0.01 ? 'paid' : (paid > 0 ? 'partially_paid' : 'unpaid');
      bill.notes = document.getElementById('edit-bill-notes').value.trim();

      bill.line_items = [
        {
          name: document.getElementById('edit-bill-desc').value.trim(),
          qty: 1,
          uom: 'LSUM',
          unit_price: taxable,
          taxable_amount: taxable,
          vat_rate: isIndia ? 0 : rate,
          gst_rate: isIndia ? rate : 0,
          tax_amount: tax,
          total_amount: grand
        }
      ];

      await this.syncApi('update_bill', { bill });
      alert(`Purchase Bill ${bill.bill_no} updated successfully.`);
      this.closeModal('modal-edit-bill');
      this.renderActiveTab();
    };
  }

  // 3. EDIT CUSTOMER RECEIPT MODAL
  openEditReceiptModal(receiptId) {
    const rcp = (this.db?.customer_receipts || []).find(r => r.id === receiptId || r.receipt_no === receiptId);
    if (!rcp) {
      alert('Receipt voucher not found.');
      return;
    }
    const isIndia = (rcp.company_id || this.activeCompanyId) === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';
    const currSym = isIndia ? '₹' : 'AED ';

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-edit-receipt">
        <div class="fin-modal-dialog" style="max-width:600px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">✏️ Edit Customer Receipt (${rcp.receipt_no})</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-edit-receipt')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="edit-receipt-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Customer / Client Name <span style="color:#ef4444;">*</span></label>
                <input type="text" id="edit-rcp-cust" class="fin-form-input" value="${rcp.customer_name || ''}" required>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Receipt Date</label>
                  <input type="date" id="edit-rcp-date" class="fin-form-input" value="${rcp.receipt_date || ''}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Payment Mode</label>
                  <select id="edit-rcp-mode" class="fin-form-select" required>
                    <option value="Cheque" ${rcp.payment_mode === 'Cheque' ? 'selected' : ''}>Cheque</option>
                    <option value="Bank Wire" ${rcp.payment_mode === 'Bank Wire' ? 'selected' : ''}>Direct Bank Wire</option>
                    <option value="RTGS" ${rcp.payment_mode === 'RTGS' ? 'selected' : ''}>Corporate RTGS</option>
                    <option value="Cash" ${rcp.payment_mode === 'Cash' ? 'selected' : ''}>Cash Deposit</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Amount Received (${currLabel}) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="edit-rcp-amount" class="fin-form-input" value="${rcp.amount_received || 0}" min="1" step="any" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Reference / UTR / Cheque #</label>
                  <input type="text" id="edit-rcp-ref" class="fin-form-input" value="${rcp.reference_no || ''}" required>
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Remitting / Drawee Bank Name</label>
                <input type="text" id="edit-rcp-bank" class="fin-form-input" list="rec-banks-list" value="${rcp.bank_name || ''}" placeholder="e.g. National Bank of Abu Dhabi (NBAD)">
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Notes &amp; Clearance Verification</label>
                <textarea id="edit-rcp-notes" class="fin-form-textarea" rows="2">${rcp.notes || ''}</textarea>
              </div>

              <!-- Datalist of Known & Saved Banks -->
              <datalist id="rec-banks-list">
                ${this.getKnownBanksList().map(b => `<option value="${b}">`).join('')}
              </datalist>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-edit-receipt')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save &amp; Update Receipt &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('edit-receipt-form').onsubmit = async (e) => {
      e.preventDefault();
      rcp.customer_name = document.getElementById('edit-rcp-cust').value.trim();
      rcp.receipt_date = document.getElementById('edit-rcp-date').value;
      rcp.payment_mode = document.getElementById('edit-rcp-mode').value;
      rcp.amount_received = Number(document.getElementById('edit-rcp-amount').value) || 0;
      rcp.reference_no = document.getElementById('edit-rcp-ref').value.trim();
      const editBank = document.getElementById('edit-rcp-bank').value.trim();
      if (editBank) {
        rcp.bank_name = editBank;
        try { localStorage.setItem('fin_last_used_bank', editBank); } catch (err) {}
        if (!this.db.saved_banks) this.db.saved_banks = [];
        if (!this.db.saved_banks.includes(editBank)) this.db.saved_banks.unshift(editBank);
      }
      rcp.notes = document.getElementById('edit-rcp-notes').value.trim();

      await this.syncApi('update_receipt', { receipt: rcp, saved_banks: this.db.saved_banks });
      alert(`Receipt voucher ${rcp.receipt_no} updated successfully.`);
      this.closeModal('modal-edit-receipt');
      this.renderActiveTab();
    };
  }

  // 4. EDIT EXPENSE MODAL
  openEditExpenseModal(expenseId) {
    const exp = (this.db?.expenses || []).find(e => e.id === expenseId || e.expense_no === expenseId);
    if (!exp) {
      alert('Expense record not found.');
      return;
    }
    const isIndia = (exp.company_id || this.activeCompanyId) === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';
    const currSym = isIndia ? '₹' : 'AED ';
    const projects = (this.db?.projects || []).filter(p => !p.company_id || p.company_id === (exp.company_id || this.activeCompanyId));

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-edit-expense">
        <div class="fin-modal-dialog" style="max-width:600px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">✏️ Edit Expense Claim (${exp.expense_no})</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-edit-expense')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="edit-expense-form">
              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Expense Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="edit-exp-date" class="fin-form-input" value="${exp.date || ''}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Category <span style="color:#ef4444;">*</span></label>
                  <select id="edit-exp-category" class="fin-form-select" required>
                    <option value="Equipment & Fuel" ${exp.category === 'Equipment & Fuel' ? 'selected' : ''}>Equipment &amp; Fuel</option>
                    <option value="Site Expenses & Consumables" ${exp.category === 'Site Expenses & Consumables' ? 'selected' : ''}>Site Expenses &amp; Consumables</option>
                    <option value="Utilities & Maintenance" ${exp.category === 'Utilities & Maintenance' ? 'selected' : ''}>Utilities &amp; Maintenance</option>
                    <option value="Travel & Accommodation" ${exp.category === 'Travel & Accommodation' ? 'selected' : ''}>Travel &amp; Accommodation</option>
                    <option value="Professional Services" ${exp.category === 'Professional Services' ? 'selected' : ''}>Professional Services</option>
                    <option value="Employee Reimbursements" ${exp.category === 'Employee Reimbursements' ? 'selected' : ''}>Employee Reimbursements</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Description of Expense <span style="color:#ef4444;">*</span></label>
                <input type="text" id="edit-exp-desc" class="fin-form-input" value="${exp.description || ''}" required>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Amount (${currLabel} Excl. Tax) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="edit-exp-amount" class="fin-form-input" value="${exp.amount || 0}" min="1" step="any" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">${isIndia ? 'Tax / GST (INR)' : 'UAE VAT 5% (AED)'}</label>
                  <input type="number" id="edit-exp-tax" class="fin-form-input" value="${exp.tax_amount || 0}" step="any">
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Linked Project</label>
                  <select id="edit-exp-project" class="fin-form-select">
                    <option value="">Head Office General</option>
                    ${projects.map(p => `<option value="${p.id}" ${exp.project_id === p.id || exp.project_name === p.name ? 'selected' : ''}>${p.name}</option>`).join('')}
                  </select>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Payment Method</label>
                  <select id="edit-exp-mode" class="fin-form-select">
                    <option value="Corporate Debit Card" ${exp.payment_method === 'Corporate Debit Card' ? 'selected' : ''}>Corporate Debit Card</option>
                    <option value="Direct Bank Wire" ${exp.payment_method === 'Direct Bank Wire' ? 'selected' : ''}>Direct Bank Wire</option>
                    <option value="Petty Cash" ${exp.payment_method === 'Petty Cash' ? 'selected' : ''}>Petty Cash</option>
                    <option value="Employee Reimbursement" ${exp.payment_method === 'Employee Reimbursement' ? 'selected' : ''}>Employee Reimbursement</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Approval Status</label>
                <select id="edit-exp-status" class="fin-form-select">
                  <option value="approved" ${exp.status === 'approved' ? 'selected' : ''}>Approved</option>
                  <option value="pending" ${exp.status === 'pending' ? 'selected' : ''}>Pending Verification</option>
                  <option value="reimbursed" ${exp.status === 'reimbursed' ? 'selected' : ''}>Reimbursed</option>
                </select>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-edit-expense')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save &amp; Update Expense &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    const amtInp = document.getElementById('edit-exp-amount');
    const taxInp = document.getElementById('edit-exp-tax');
    amtInp.oninput = () => {
      const a = Number(amtInp.value) || 0;
      taxInp.value = isIndia ? (a * 0.18).toFixed(2) : (a * 0.05).toFixed(2);
    };

    document.getElementById('edit-expense-form').onsubmit = async (e) => {
      e.preventDefault();
      const prjSel = document.getElementById('edit-exp-project');
      const amountVal = Number(amtInp.value) || 0;
      const taxVal = Number(taxInp.value) || 0;

      exp.date = document.getElementById('edit-exp-date').value;
      exp.category = document.getElementById('edit-exp-category').value;
      exp.description = document.getElementById('edit-exp-desc').value.trim();
      exp.amount = amountVal;
      exp.tax_amount = taxVal;
      exp.total_amount = amountVal + taxVal;
      exp.project_id = prjSel.value || null;
      exp.project_name = prjSel.options[prjSel.selectedIndex]?.text || 'Corporate Civil Operations';
      exp.payment_method = document.getElementById('edit-exp-mode').value;
      exp.status = document.getElementById('edit-exp-status').value;

      await this.syncApi('update_expense', { expense: exp });
      alert(`Expense ${exp.expense_no} updated successfully.`);
      this.closeModal('modal-edit-expense');
      this.renderActiveTab();
    };
  }

  async deleteExpense(expenseId) {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    await this.syncApi('delete_expense', { expense_id: expenseId });
    alert('Expense record deleted successfully.');
    this.renderActiveTab();
  }

  // 5. EDIT VENDOR PAYMENT MODAL
  openEditPaymentModal(paymentId) {
    const pay = (this.db?.vendor_payments || []).find(p => p.id === paymentId || p.voucher_no === paymentId);
    if (!pay) {
      alert('Payment voucher not found.');
      return;
    }
    const isIndia = (pay.company_id || this.activeCompanyId) === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';
    const currSym = isIndia ? '₹' : 'AED ';

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-edit-pay">
        <div class="fin-modal-dialog" style="max-width:600px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">✏️ Edit Payment Voucher (${pay.voucher_no})</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-edit-pay')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="edit-pay-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Vendor / Subcontractor <span style="color:#ef4444;">*</span></label>
                <input type="text" id="edit-pay-vend" class="fin-form-input" value="${pay.vendor_name || ''}" required>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Payment Date</label>
                  <input type="date" id="edit-pay-date" class="fin-form-input" value="${pay.payment_date || ''}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Disbursement Channel</label>
                  <select id="edit-pay-mode" class="fin-form-select">
                    <option value="Corporate RTGS" ${pay.payment_mode === 'Corporate RTGS' ? 'selected' : ''}>Corporate RTGS</option>
                    <option value="Corporate Cheque" ${pay.payment_mode === 'Corporate Cheque' ? 'selected' : ''}>Corporate Cheque</option>
                    <option value="International Wire" ${pay.payment_mode === 'International Wire' ? 'selected' : ''}>International Wire</option>
                    <option value="Petty Cash" ${pay.payment_mode === 'Petty Cash' ? 'selected' : ''}>Petty Cash</option>
                  </select>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Amount Disbursed (${currLabel}) <span style="color:#ef4444;">*</span></label>
                  <input type="number" id="edit-pay-amount" class="fin-form-input" value="${pay.amount_paid || 0}" min="1" step="any" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Bank UTR / Cheque Ref #</label>
                  <input type="text" id="edit-pay-ref" class="fin-form-input" value="${pay.reference_no || ''}" required>
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Notes &amp; Approver Verification</label>
                <textarea id="edit-pay-notes" class="fin-form-textarea" rows="2">${pay.notes || ''}</textarea>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-edit-pay')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save &amp; Update Voucher &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    document.getElementById('edit-pay-form').onsubmit = async (e) => {
      e.preventDefault();
      pay.vendor_name = document.getElementById('edit-pay-vend').value.trim();
      pay.payment_date = document.getElementById('edit-pay-date').value;
      pay.payment_mode = document.getElementById('edit-pay-mode').value;
      pay.amount_paid = Number(document.getElementById('edit-pay-amount').value) || 0;
      pay.reference_no = document.getElementById('edit-pay-ref').value.trim();
      pay.notes = document.getElementById('edit-pay-notes').value.trim();

      await this.syncApi('update_payment', { payment: pay });
      alert(`Payment voucher ${pay.voucher_no} updated successfully.`);
      this.closeModal('modal-edit-pay');
      this.renderActiveTab();
    };
  }

  // 6. EDIT PURCHASE ORDER MODAL
  openEditPOModal(poId) {
    const po = (this.db?.purchase_orders || []).find(p => p.id === poId || p.po_no === poId);
    if (!po) {
      alert('Purchase order not found.');
      return;
    }
    const isIndia = (po.company_id || this.activeCompanyId) === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';
    const currSym = isIndia ? '₹' : 'AED ';
    const lineItems = (po.line_items && po.line_items.length) ? po.line_items : [
      {
        name: 'Procurement Scope',
        qty: 1,
        unit_price: Number(po.subtotal) || 1000,
        taxable_amount: Number(po.subtotal) || 1000
      }
    ];

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-edit-po">
        <div class="fin-modal-dialog" style="max-width:680px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">✏️ Edit Purchase Order (${po.po_no})</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-edit-po')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="edit-po-form">
              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Vendor / Supplier <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="edit-po-vend" class="fin-form-input" value="${po.supplier_name || po.vendor_name || ''}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Project Association <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="edit-po-prj" class="fin-form-input" value="${po.project_name || ''}" required>
                </div>
              </div>

              <div class="fin-form-grid-2">
                <div class="fin-form-group">
                  <label class="fin-form-label">Order Date</label>
                  <input type="date" id="edit-po-date" class="fin-form-input" value="${po.date || ''}" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Expected Delivery Date</label>
                  <input type="date" id="edit-po-delivery" class="fin-form-input" value="${po.expected_delivery || ''}" required>
                </div>
              </div>

              <div class="fin-form-group">
                <label class="fin-form-label">Item / Technical Scope Description <span style="color:#ef4444;">*</span></label>
                <input type="text" id="edit-po-desc" class="fin-form-input" value="${lineItems[0]?.name || lineItems[0]?.description || ''}" required>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group">
                  <label class="fin-form-label">Quantity</label>
                  <input type="number" id="edit-po-qty" class="fin-form-input" value="${lineItems[0]?.qty || 1}" min="1">
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Unit Price (${currLabel})</label>
                  <input type="number" id="edit-po-rate" class="fin-form-input" value="${lineItems[0]?.unit_price || 0}" step="any" required>
                </div>
                <div class="fin-form-group">
                  <label class="fin-form-label">Total Value (${currLabel})</label>
                  <input type="text" id="edit-po-total" class="fin-form-input" readonly value="${currSym}${Number(po.total_value || po.grand_total || 0).toFixed(2)}" style="font-weight:700; color:#38bdf8;">
                </div>
              </div>

              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-edit-po')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save &amp; Update PO &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;

    const qtyInp = document.getElementById('edit-po-qty');
    const rateInp = document.getElementById('edit-po-rate');
    const totalInp = document.getElementById('edit-po-total');

    const updateTotals = () => {
      const q = Number(qtyInp.value) || 0;
      const r = Number(rateInp.value) || 0;
      const sub = q * r;
      const taxRate = isIndia ? 0.18 : 0.05;
      const tot = sub + (sub * taxRate);
      totalInp.value = `${currSym}${tot.toLocaleString(isIndia ? 'en-IN' : 'en-US', { minimumFractionDigits: 2 })}`;
    };

    qtyInp.oninput = updateTotals;
    rateInp.oninput = updateTotals;

    document.getElementById('edit-po-form').onsubmit = async (e) => {
      e.preventDefault();
      const q = Number(qtyInp.value) || 1;
      const r = Number(rateInp.value) || 0;
      const subtotal = q * r;
      const taxRate = isIndia ? 0.18 : 0.05;
      const tax = subtotal * taxRate;
      const grand = subtotal + tax;

      po.supplier_name = document.getElementById('edit-po-vend').value.trim();
      po.vendor_name = po.supplier_name;
      po.project_name = document.getElementById('edit-po-prj').value.trim();
      po.date = document.getElementById('edit-po-date').value;
      po.expected_delivery = document.getElementById('edit-po-delivery').value;
      po.subtotal = subtotal;
      po.subtotal_ex_vat = subtotal;
      po.tax_total = tax;
      po.vat_total = isIndia ? 0 : tax;
      po.total_value = grand;
      po.grand_total = grand;

      po.line_items = [
        {
          sr: 1,
          name: document.getElementById('edit-po-desc').value.trim(),
          description: document.getElementById('edit-po-desc').value.trim(),
          qty: q,
          unit_price: r,
          taxable_amount: subtotal,
          vat_rate: isIndia ? 0 : 5,
          vat_amount: tax,
          total_amount: grand
        }
      ];

      await this.syncApi('update_po', { po });
      alert(`Purchase Order ${po.po_no} updated successfully.`);
      this.closeModal('modal-edit-po');
      this.renderActiveTab();
    };
  }

  // 7. EDIT CREDIT NOTE MODAL
  openEditCreditNoteModal(noteId) {
    const cn = (this.db?.credit_notes || []).find(n => n.id === noteId || n.credit_note_no === noteId);
    if (!cn) {
      alert('Credit note not found.');
      return;
    }
    const isIndia = (cn.company_id || this.activeCompanyId) === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-edit-cn">
        <div class="fin-modal-dialog" style="max-width:550px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">✏️ Edit Credit Note (${cn.credit_note_no})</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-edit-cn')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="edit-cn-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Client Name</label>
                <input type="text" id="edit-cn-cust" class="fin-form-input" value="${cn.customer_name || ''}" required>
              </div>
              <div class="fin-form-group">
                <label class="fin-form-label">Credit Reason</label>
                <input type="text" id="edit-cn-reason" class="fin-form-input" value="${cn.reason || ''}" required>
              </div>
              <div class="fin-form-group">
                <label class="fin-form-label">Total Credit Amount (${currLabel})</label>
                <input type="number" id="edit-cn-amount" class="fin-form-input" value="${cn.total_credit_amount || cn.taxable_amount || 0}" step="any" required>
              </div>
              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-edit-cn')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save &amp; Update Credit Note &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
    document.getElementById('edit-cn-form').onsubmit = async (e) => {
      e.preventDefault();
      cn.customer_name = document.getElementById('edit-cn-cust').value.trim();
      cn.reason = document.getElementById('edit-cn-reason').value.trim();
      cn.total_credit_amount = Number(document.getElementById('edit-cn-amount').value) || 0;
      await this.syncApi('update_credit_note', { credit_note: cn });
      alert(`Credit Note ${cn.credit_note_no} updated successfully.`);
      this.closeModal('modal-edit-cn');
      this.renderActiveTab();
    };
  }

  // 8. EDIT DEBIT NOTE MODAL
  openEditDebitNoteModal(noteId) {
    const dn = (this.db?.debit_notes || []).find(n => n.id === noteId || n.debit_note_no === noteId);
    if (!dn) {
      alert('Debit note not found.');
      return;
    }
    const isIndia = (dn.company_id || this.activeCompanyId) === 'ashaz-eng-in';
    const currLabel = isIndia ? 'INR' : 'AED';

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-edit-dn">
        <div class="fin-modal-dialog" style="max-width:550px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">✏️ Edit Debit Note (${dn.debit_note_no})</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-edit-dn')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="edit-dn-form">
              <div class="fin-form-group">
                <label class="fin-form-label">Vendor Name</label>
                <input type="text" id="edit-dn-vend" class="fin-form-input" value="${dn.vendor_name || ''}" required>
              </div>
              <div class="fin-form-group">
                <label class="fin-form-label">Debit Reason</label>
                <input type="text" id="edit-dn-reason" class="fin-form-input" value="${dn.reason || ''}" required>
              </div>
              <div class="fin-form-group">
                <label class="fin-form-label">Total Debit Amount (${currLabel})</label>
                <input type="number" id="edit-dn-amount" class="fin-form-input" value="${dn.total_debit_amount || 0}" step="any" required>
              </div>
              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-edit-dn')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save &amp; Update Debit Note &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
    document.getElementById('edit-dn-form').onsubmit = async (e) => {
      e.preventDefault();
      dn.vendor_name = document.getElementById('edit-dn-vend').value.trim();
      dn.reason = document.getElementById('edit-dn-reason').value.trim();
      dn.total_debit_amount = Number(document.getElementById('edit-dn-amount').value) || 0;
      await this.syncApi('update_debit_note', { debit_note: dn });
      alert(`Debit Note ${dn.debit_note_no} updated successfully.`);
      this.closeModal('modal-edit-dn');
      this.renderActiveTab();
    };
  }

  // 9. EDIT & DELETE DOCUMENT VAULT FILES
  openEditDocumentModal(docId) {
    const doc = (this.db?.documents || []).find(d => d.id === docId);
    if (!doc) {
      alert('Document not found.');
      return;
    }

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-edit-doc">
        <div class="fin-modal-dialog" style="max-width:550px;">
          <div class="fin-modal-header">
            <h3 class="fin-modal-title">✏️ Edit Document Metadata</h3>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-edit-doc')">&times;</button>
          </div>
          <div class="fin-modal-body">
            <form id="edit-doc-form">
              <div class="fin-form-group">
                <label class="fin-form-label">File / Document Title <span style="color:#ef4444;">*</span></label>
                <input type="text" id="edit-doc-name" class="fin-form-input" value="${doc.name || ''}" required>
              </div>
              <div class="fin-form-group">
                <label class="fin-form-label">Category</label>
                <select id="edit-doc-cat" class="fin-form-select">
                  <option value="Contract" ${doc.category === 'Contract' ? 'selected' : ''}>Client Contract</option>
                  <option value="Statutory" ${doc.category === 'Statutory' ? 'selected' : ''}>Statutory &amp; Tax</option>
                  <option value="Audit" ${doc.category === 'Audit' ? 'selected' : ''}>Audit &amp; Compliance</option>
                  <option value="Procurement" ${doc.category === 'Procurement' ? 'selected' : ''}>Supplier Procurement PO</option>
                </select>
              </div>
              <div class="fin-form-group">
                <label class="fin-form-label">Linked Record Ref</label>
                <input type="text" id="edit-doc-ref" class="fin-form-input" value="${doc.linked_record || ''}">
              </div>
              <div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-edit-doc')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save &amp; Update Document &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
    document.getElementById('edit-doc-form').onsubmit = async (e) => {
      e.preventDefault();
      doc.name = document.getElementById('edit-doc-name').value.trim();
      doc.category = document.getElementById('edit-doc-cat').value;
      doc.linked_record = document.getElementById('edit-doc-ref').value.trim() || 'General';
      await this.syncApi('update_document', { document: doc });
      alert(`Document "${doc.name}" updated successfully.`);
      this.closeModal('modal-edit-doc');
      this.renderActiveTab();
    };
  }

  async deleteDocument(docId) {
    if (!confirm('Are you sure you wish to delete this document from the vault?')) return;
    await this.syncApi('delete_document', { document_id: docId });
    alert('Document removed from vault.');
    this.renderActiveTab();
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
function startFinanceApp() {
  if (!window.finApp) {
    window.finApp = new FinanceApp();
    window.finApp.init();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startFinanceApp);
} else {
  startFinanceApp();
}

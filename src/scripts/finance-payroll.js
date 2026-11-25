/**
 * Rayan Group — Human Resources & Payroll Management Module
 * - Worker / Employee Profiles & Records Directory
 * - Monthly Payroll Register & Compensation Breakdown
 * - Direct Bank Transfer & RAYAN E-Wallets Payout Balance Deductions
 * - Real-Time Project Labor Cost & Profit Deductions
 * - Exact High-Resolution Print / PDF Payslip Replica (A4 portrait format)
 */

export function registerPayrollModules(FinanceApp) {
  const proto = FinanceApp.prototype;

  // ==========================================================================
  // 1. HELPERS & UTILITIES
  // ==========================================================================
  const formatMoney = (amount, currency = 'AED') => {
    const num = Number(amount) || 0;
    return `${currency} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const escapeHtml = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  proto.escapeHtml = escapeHtml;
  proto.syncWithBackend = function (action, payload) {
    if (typeof this.syncApi === 'function') {
      return this.syncApi(action, payload);
    }
    return Promise.resolve({ ok: true });
  };

  // Standard Monthly Payroll Periods Reference
  const PAYROLL_PERIODS = [
    { key: '2026-07', short: 'Jul-26', full: 'July 2026', label: 'July 2026' },
    { key: '2026-06', short: 'Jun-26', full: 'June 2026', label: 'June 2026' },
    { key: '2026-05', short: 'May-26', full: 'May 2026', label: 'May 2026' },
    { key: '2026-04', short: 'Apr-26', full: 'April 2026', label: 'April 2026' },
    { key: '2026-03', short: 'Mar-26', full: 'March 2026', label: 'March 2026' },
    { key: '2026-02', short: 'Feb-26', full: 'February 2026', label: 'February 2026' },
    { key: '2026-01', short: 'Jan-26', full: 'January 2026', label: 'January 2026' },
    { key: '2025-12', short: 'Dec-25', full: 'December 2025', label: 'December 2025' },
    { key: '2025-11', short: 'Nov-25', full: 'November 2025', label: 'November 2025' },
    { key: '2025-10', short: 'Oct-25', full: 'October 2025', label: 'October 2025' }
  ];

  const doesSlipMatchPeriod = (slip, period) => {
    if (!slip || !period) return false;
    const my = (slip.month_year || '').trim().toLowerCase();
    const pl = (slip.period_label || '').trim().toLowerCase();
    const pd = (slip.payment_date || '').trim().toLowerCase();
    const ps = (period.short || '').toLowerCase();
    const pf = (period.full || period.label || '').toLowerCase();
    const pk = (period.key || '').toLowerCase();
    return my === ps || my === pf || pl === ps || pl === pf || pl.includes(pf) || my.includes(ps) || pd.startsWith(pk);
  };

  const getPeriodsForFilter = (filterKey = '3m') => {
    if (filterKey === '1m') {
      return [PAYROLL_PERIODS[1]]; // June 2026 (1 Month)
    } else if (filterKey === '3m') {
      return PAYROLL_PERIODS.slice(1, 4); // June 2026, May 2026, April 2026 (3 Months)
    } else if (filterKey === '6m') {
      return PAYROLL_PERIODS.slice(1, 7); // June 2026 to January 2026 (6 Months)
    } else {
      return PAYROLL_PERIODS.slice(0, 8); // All recent months
    }
  };

  const getPeriodsForEmployee = (emp, filterKey = '3m', allSlips = []) => {
    const basePeriods = getPeriodsForFilter(filterKey);
    if (filterKey === 'all') {
      const extraPeriods = [];
      allSlips.forEach(s => {
        const matchesExisting = basePeriods.some(p => doesSlipMatchPeriod(s, p));
        if (!matchesExisting) {
          extraPeriods.push({
            key: s.payment_date ? s.payment_date.slice(0, 7) : 'extra',
            short: s.month_year || 'Period',
            full: s.period_label || s.month_year || 'Recorded Period',
            label: s.period_label || s.month_year || 'Recorded Period'
          });
        }
      });
      return [...basePeriods, ...extraPeriods];
    }
    return basePeriods;
  };

  // Helper to ensure initial default employee & payslip if empty
  proto.ensurePayrollSeedData = function () {
    if (!this.db) return;

    const storedDel = (function () {
      try {
        const raw = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('rayan_fin_deleted_employee_ids') || '[]') : [];
        return Array.isArray(raw) ? raw : [];
      } catch (e) { return []; }
    })();

    const deleted = Array.from(new Set([
      ...(Array.isArray(this.db.deleted_employee_ids) ? this.db.deleted_employee_ids : []),
      ...storedDel
    ])).map(id => String(id || '').trim().toLowerCase()).filter(Boolean);
    this.db.deleted_employee_ids = deleted;

    if (!Array.isArray(this.db.employees)) {
      this.db.employees = [];
    }

    // Always purge dummy/sample employee Md Ashraf Ali
    this.db.employees = this.db.employees.filter(e => e && e.id !== 'emp-rg11047' && !(e.name && e.name.toLowerCase().includes('ashraf')));
    if (Array.isArray(this.db.letters_of_assignment)) {
      this.db.letters_of_assignment = this.db.letters_of_assignment.filter(l => l && l.employee_id !== 'emp-rg11047' && !(l.employee_name && l.employee_name.toLowerCase().includes('ashraf')));
    }

    // Filter out all user-deleted employee IDs & numbers
    if (deleted.length > 0) {
      this.db.employees = this.db.employees.filter(e => {
        if (!e) return false;
        const eId = String(e.id || '').trim().toLowerCase();
        const eNo = String(e.employee_no || '').trim().toLowerCase();
        return !deleted.includes(eId) && !deleted.includes(eNo);
      });
    }

    // If directory is empty, seed the authoritative real employees
    if (this.db.employees.length === 0 && !this.db.employees_initialized && !deleted.includes('emp-mwlpkkbr') && !deleted.includes('emp-en12001')) {
      this.db.employees_initialized = true;
      this.db.employees = [
        {
          id: 'emp-mwlpkkbr',
          employee_no: 'EN12001',
          company_id: this.activeCompanyId || 'rayan-corp-uae',
          name: 'Nadeem Akhtar Nazmul Hoda',
          name_ar: 'نديم اختر نظم هدي',
          position: 'Civil Engineer',
          position_ar: 'مهندس مدني',
          department: 'Rayan Engineering',
          date_of_joining: '2023-04-14',
          date_of_appointment: '2023-04-14',
          currency: 'AED',
          phone: '+971 555411543',
          email: 'nadeem.hmsit@gmail.com',
          emirates_id: '784-1998-3368120-0',
          passport_no: 'U3566719',
          nationality: 'India',
          nationality_ar: 'هندي',
          visa_status: 'Employment Visa (Rayan Engineering)',
          basic_salary: 9500.00,
          accommodation_allowance: 5500.00,
          consolidated_allowance: 0.00,
          other_allowance: 1500.00,
          bank_name: 'Emirates NBD Bank PJSC',
          swift: 'EBILAEADXXX',
          iban: '',
          account_no: '',
          default_pay_method: 'AED RAYAN GROUP Host To Host',
          project_id: '',
          project_name: 'Corporate / General Overhead',
          status: 'Active',
          created_at: '2023-04-14T09:00:00Z',
          updated_at: '2026-11-18T05:56:24.423Z'
        },
        {
          id: 'emp-en12009',
          employee_no: 'EN12009',
          company_id: this.activeCompanyId || 'rayan-corp-uae',
          name: 'Bakhteyar Alam Mokhtar Ahmad',
          name_ar: 'بختيار عالم مختار احمد',
          position: 'Civil Engineer',
          position_ar: 'مهندس مدني',
          department: 'Rayan Engineering',
          date_of_joining: '2025-08-07',
          date_of_appointment: '2025-08-07',
          currency: 'AED',
          phone: '+971 50 123 4567',
          email: 'bakhteyar@rayan-group.com',
          emirates_id: '784-1988-1234567-1',
          passport_no: 'S3552106',
          nationality: 'India',
          nationality_ar: 'هندي',
          visa_status: 'Employment Visa (Rayan Engineering)',
          basic_salary: 9500.00,
          accommodation_allowance: 5500.00,
          consolidated_allowance: 0.00,
          other_allowance: 0.00,
          bank_name: 'Emirates NBD Bank PJSC',
          swift: 'EBILAEADXXX',
          iban: 'AE860260001015934645101',
          account_no: 'AE860260001015934645101',
          default_pay_method: 'AED RAYAN GROUP Host To Host',
          project_id: 'prj-toprock-police-01',
          project_name: 'Project # The New Dubai Police Academy @ Al Rowaiyah, Dubai',
          status: 'Active',
          created_at: '2025-08-07T09:00:00Z',
          updated_at: '2026-11-18T05:50:52.305Z'
        }
      ];
    } else {
      this.db.employees_initialized = true;

      // Deduplicate by normalized employee_no/id (keeping newest updated_at & non-empty photo) without overriding user edits
      if (Array.isArray(this.db.employees)) {
        const parseTs = (obj) => {
          const t = obj?.updated_at || obj?.created_at || '';
          const ms = t ? Date.parse(String(t).replace(' ', 'T')) : 0;
          return Number.isFinite(ms) ? ms : 0;
        };
        const dedupedMap = new Map();
        this.db.employees.forEach(e => {
          if (!e) return;
          const k = (e.employee_no || e.id || '').trim().toUpperCase();
          if (!k) return;
          if (!dedupedMap.has(k)) {
            dedupedMap.set(k, e);
          } else {
            const prev = dedupedMap.get(k);
            const curTs = parseTs(e);
            const prevTs = parseTs(prev);
            if (curTs > prevTs) {
              const merged = { ...prev, ...e };
              if (!e.photo && prev.photo) merged.photo = prev.photo;
              dedupedMap.set(k, merged);
            } else if (!prev.photo && e.photo) {
              prev.photo = e.photo;
            }
          }
        });
        this.db.employees = Array.from(dedupedMap.values());
        this.db.employees.sort((a, b) => (a.employee_no || '').localeCompare(b.employee_no || '', undefined, { numeric: true, sensitivity: 'base' }));
      }
    }

    if (!Array.isArray(this.db.employment_certificates) || this.db.employment_certificates.length === 0) {
      this.db.employment_certificates = [
        {
          id: 'cert-rec-hc-2025-11004',
          cert_no: 'REC/HC/2025/11004',
          ref_no: 'REC/HC/2025/11004',
          company_id: this.activeCompanyId || 'rayan-corp-uae',
          date: 'August 13, 2025',
          employee_id: 'emp-en12001',
          employee_name_en: 'Bakhteyar Alam Mokhtar Ahmad',
          employee_name_ar: 'بختيار عالم مختار احمد',
          job_title_en: 'Civil Engineer',
          job_title_ar: 'مهندس مدني',
          joining_date_en: '07/08/2025',
          joining_date_ar: '2025-08-07',
          nationality_en: 'India',
          nationality_ar: 'هندي',
          passport_no: 'S3552106',
          currency: 'AED',
          basic_salary: 16000.00,
          accommodation_allowance: 4000.00,
          total_salary: 20000.00,
          purpose: 'This certificate is issued upon request for whatever purpose it may serve, with no responsibility on the part of the company.',
          purpose_ar: 'وقد أعطيت له هذه الشهـادة بناء على طلبه، دون تحمل الشركة أدنى مسؤولية تجاه الغير.',
          verification_email: 'rayan@rayan-group.com',
          signatory_name: 'Arshad Alam Shaikh',
          signatory_name_ar: 'ارشد عالم شيخ',
          signatory_title: 'Chief Officer of People & Culture',
          signatory_title_ar: 'الرئيس التنفيذي لقطاع الموارد البشرية و الثقافة المؤسسية',
          status: 'Issued',
          created_at: '2025-08-13T10:00:00Z'
        }
      ];
    }

    if (!Array.isArray(this.db.letters_of_assignment) || this.db.letters_of_assignment.length === 0) {
      this.db.letters_of_assignment = [
        {
          id: 'loa-rg-hc-2026-12004',
          loa_no: 'RG/HC/LOA/2026/12004',
          ref_no: 'RG/HC/LOA/2026/12004',
          company_id: this.activeCompanyId || 'rayan-corp-uae',
          date: '07/08/2025',
          employee_id: 'emp-en12001',
          employee_name: 'Bakhteyar Alam Mokhtar Ahmad',
          passport_no: 'S3552106',
          nationality: 'India',
          position: 'Civil Engineer',
          reporting_manager: 'Site Supervisor or his designated nominee',
          working_hours: '08 hours a day and 6 days a week',
          currency: 'AED',
          basic_salary: 1100.00,
          food_allowance: 200.00,
          overtime_amount: 200.00,
          overtime_hours: '2-3 HRS.Per/Day',
          grand_total: 1500.00,
          joining_deadline: '15-09-2026',
          signatory_name: 'Arshad Alam Shaikh',
          signatory_name_ar: 'ارشد عالم شيخ',
          signatory_title: 'Chief Executive Officer',
          signatory_title_ar: 'الرئيس التنفيذي',
          status: 'Issued',
          created_at: '2026-08-26T09:00:00Z'
        }
      ];
    }

    if (!Array.isArray(this.db.payroll)) {
      this.db.payroll = [];
    }
    const deletedSlips = [];
    try {
      if (typeof localStorage !== 'undefined') {
        deletedSlips.push(...JSON.parse(localStorage.getItem('rayan_fin_deleted_payroll_ids') || '[]'));
      }
    } catch (e) { }
    if (Array.isArray(this.db.deleted_payroll_ids)) {
      deletedSlips.push(...this.db.deleted_payroll_ids);
    }
    if (deletedSlips.length > 0) {
      this.db.payroll = this.db.payroll.filter(p => !deletedSlips.includes(p.id) && !deletedSlips.includes(p.slip_no));
    }

    if (!this.db.payroll_initialized && this.db.payroll.length === 0 && !deletedSlips.includes('ps-june2026-en12001') && !deletedSlips.includes('PSJune 2026/EN12001')) {
      this.db.payroll_initialized = true;
      this.db.payroll = [
        {
          id: 'ps-june2026-en12001',
          slip_no: 'PSJune 2026/EN12001',
          company_id: this.activeCompanyId || 'rayan-corp-uae',
          employee_id: 'emp-en12001',
          employee_no: 'EN12001',
          employee_name: 'Bakhteyar Alam Mokhtar Ahmad',
          position: 'Civil Engineer',
          department: 'Rayan Engineering',
          date_of_appointment: '2025-08-07',
          currency: 'AED',
          month_year: 'Jun-26',
          period_label: 'June 2026',
          printed_date: '10-Jul-26',
          payment_date: '2026-07-10',
          basic_salary: 9500.00,
          accommodation_allowance: 5500.00,
          consolidated_allowance: 0.00,
          normal_overtime: 0.00,
          overtime_hrs: '0',
          other_earnings: 0.00,
          total_earnings: 15000.00,
          advance_deduction: 0.00,
          absence_deduction: 0.00,
          loan_deduction: 0.00,
          other_deductions: 0.00,
          total_deductions: 0.00,
          net_pay: 15000.00,
          breakdown_items: [
            { date: '10/07/2026', element_name: 'Basic Salary', element_type: 'Standard Earnings', remark: 'Standard Basic Monthly', hrs: '', amount: 9500.00 },
            { date: '10/07/2026', element_name: 'Accommodation Allowance', element_type: 'Standard Earnings', remark: 'Housing Allowance', hrs: '', amount: 5500.00 }
          ],
          bank_name: 'Emirates NBD Bank PJSC',
          swift: 'EBILAEADXXX',
          iban: 'AE860260001015934645101',
          account_no: 'AE860260001015934645101',
          pay_method: 'AED RAYAN GROUP Host To Host',
          transferred_amount: 15000.00,
          status: 'Paid',
          payout_source_type: 'bank',
          payout_source_id: 'bank-adcb-uae',
          payout_source_name: 'Abu Dhabi Commercial Bank (ADCB)',
          payout_reference: 'TXN-PAYROLL-20260710-01',
          project_id: 'prj-toprock-police-01',
          project_name: 'The New Dubai Police Academy @ Al Rowaiyah, Dubai',
          notes: 'Civil Engineer monthly compensation for June 2026',
          created_at: '2026-07-10T11:30:00Z'
        }
      ];
    }
  };

  // ==========================================================================
  // 2. EMPLOYEES DIRECTORY TAB VIEW
  // ==========================================================================
  proto.renderEmployeesTab = function (root) {
    if (!root) root = document.getElementById('fin-tab-content-root') || document.getElementById('fin-view-container');
    if (!root) return;
    this.ensurePayrollSeedData();
    const employees = (this.db?.employees || []).filter(e => this.matchesActiveCompany(e.company_id));
    // Sort employees strictly in ascending serial order by employee_no (EN12001, EN12002, EN12003, etc.)
    employees.sort((a, b) => (a.employee_no || '').localeCompare(b.employee_no || '', undefined, { numeric: true, sensitivity: 'base' }));

    const totalActive = employees.filter(e => (e.status || 'Active').toLowerCase() === 'active').length;
    const totalResigned = employees.filter(e => (e.status || '').toLowerCase() === 'resigned').length;
    const totalTerminated = employees.filter(e => (e.status || '').toLowerCase() === 'terminated').length;
    const totalSalaryMonthly = employees.reduce((sum, e) => {
      const basic = Number(e.basic_salary) || 0;
      const acc = Number(e.accommodation_allowance) || 0;
      const cons = Number(e.consolidated_allowance) || 0;
      const oth = Number(e.other_allowance) || 0;
      return sum + basic + acc + cons + oth;
    }, 0);

    const engineeringOpsCount = employees.filter(e => {
      const dep = (e.department || '').toLowerCase();
      const pos = (e.position || '').toLowerCase();
      return dep.includes('engineering') || dep.includes('operation') || pos.includes('manager') || pos.includes('engineer');
    }).length;

    const projects = (this.db?.projects || []).filter(p => this.matchesActiveCompany(p.company_id));

    root.innerHTML = `
      <div class="fin-tab-header">
        <div class="fin-tab-title-wrap">
          <h2 class="fin-panel-title">👥 Employee &amp; Worker Directory</h2>
          <p class="fin-panel-sub">Workforce directory, designations, salary structures, bank coordinates &amp; project assignments</p>
        </div>
        <div class="fin-tab-actions">
          <button type="button" class="fin-btn-secondary" onclick="window.finApp.exportEmployeesCsv()">
            📤 Export CSV
          </button>
          <button type="button" class="fin-btn-secondary" onclick="window.finApp.switchTab('payroll')">
            💼 View Payroll Register
          </button>
          <button type="button" class="fin-btn-primary" style="background:#10b981; border-color:#10b981;" onclick="window.finApp.openRecordEmployeePaymentModal()">
            💳 Record Salary Payment
          </button>
          <button type="button" class="fin-btn-primary" onclick="window.finApp.openEmployeeModal()">
            + Add New Employee
          </button>
        </div>
      </div>

      <!-- Metrics Overview Cards -->
      <div class="fin-metrics-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
        <div class="fin-metric-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:1.25rem; cursor:pointer; transition:transform 0.15s ease;" onclick="window.finApp.setEmployeeStatusFilter('active')" title="Click to filter and view Active Workforce only">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; display:flex; justify-content:space-between; align-items:center;">
            <span>Active Workforce</span>
            <span style="font-size:0.68rem; color:#38bdf8; background:rgba(56,189,248,0.14); padding:2px 8px; border-radius:10px; font-weight:700;">View Active 🟢</span>
          </div>
          <div style="font-size:1.85rem; font-weight:800; color:#38bdf8; margin:6px 0;">${totalActive}</div>
          <div style="font-size:0.72rem; color:#64748b;">Total enrolled personnel: ${employees.length} (Click to filter)</div>
        </div>

        <div class="fin-metric-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Standard Monthly Payroll</div>
          <div style="font-size:1.85rem; font-weight:800; color:#10b981; margin:6px 0;">${this.formatCurrency(totalSalaryMonthly)}</div>
          <div style="font-size:0.72rem; color:#64748b;">Sum of monthly base salaries &amp; allowances</div>
        </div>

        <div class="fin-metric-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Operations &amp; Engineering</div>
          <div style="font-size:1.85rem; font-weight:800; color:#c084fc; margin:6px 0;">${engineeringOpsCount}</div>
          <div style="font-size:0.72rem; color:#64748b;">Supervisors, managers &amp; engineers</div>
        </div>

        <div class="fin-metric-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Site Labor &amp; Technicians</div>
          <div style="font-size:1.85rem; font-weight:800; color:#f59e0b; margin:6px 0;">${Math.max(0, employees.length - engineeringOpsCount)}</div>
          <div style="font-size:0.72rem; color:#64748b;">Direct project allocated labor</div>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="fin-filter-bar" style="display:flex; flex-direction:column; gap:0.85rem; margin-bottom:1.25rem; background:rgba(15,23,42,0.55); padding:1rem 1.15rem; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
        <!-- Quick Status View Selector Tabs -->
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.65rem; padding-bottom:0.75rem; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
            <span style="font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.04em; margin-right:4px;">Workforce View:</span>
            <button type="button" class="fin-emp-filter-pill active" id="fin-emp-pill-all" onclick="window.finApp.setEmployeeStatusFilter('')" style="display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px; font-size:0.78rem; font-weight:700; cursor:pointer; background:rgba(56,189,248,0.2); color:#38bdf8; border:1px solid #38bdf8; box-shadow:0 0 10px rgba(56,189,248,0.25); transition:all 0.15s ease;">
              👥 All Employees <span style="background:rgba(255,255,255,0.14); padding:1px 6px; border-radius:10px; font-size:0.7rem;">${employees.length}</span>
            </button>
            <button type="button" class="fin-emp-filter-pill" id="fin-emp-pill-active" onclick="window.finApp.setEmployeeStatusFilter('active')" style="display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px; font-size:0.78rem; font-weight:700; cursor:pointer; background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.25); transition:all 0.15s ease;">
              🟢 Active Employees <span style="background:rgba(16,185,129,0.2); padding:1px 6px; border-radius:10px; font-size:0.7rem;">${totalActive}</span>
            </button>
            <button type="button" class="fin-emp-filter-pill" id="fin-emp-pill-resigned" onclick="window.finApp.setEmployeeStatusFilter('resigned')" style="display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px; font-size:0.78rem; font-weight:700; cursor:pointer; background:rgba(245,158,11,0.1); color:#f59e0b; border:1px solid rgba(245,158,11,0.25); transition:all 0.15s ease;">
              🟡 Resigned <span style="background:rgba(245,158,11,0.2); padding:1px 6px; border-radius:10px; font-size:0.7rem;">${totalResigned}</span>
            </button>
            <button type="button" class="fin-emp-filter-pill" id="fin-emp-pill-terminated" onclick="window.finApp.setEmployeeStatusFilter('terminated')" style="display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px; font-size:0.78rem; font-weight:700; cursor:pointer; background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.25); transition:all 0.15s ease;">
              🔴 Terminated <span style="background:rgba(239,68,68,0.2); padding:1px 6px; border-radius:10px; font-size:0.7rem;">${totalTerminated}</span>
            </button>
          </div>
          <div style="font-size:0.72rem; color:#94a3b8;">
            Showing <strong id="fin-emp-showing-count" style="color:#f1f5f9;">${employees.length}</strong> of ${employees.length} personnel
          </div>
        </div>

        <!-- Filter Controls Row -->
        <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
          <div style="flex:1; min-width:240px; position:relative;">
            <input type="text" id="fin-emp-search" class="fin-form-input" placeholder="Search by name, employee #, designation, bank, IBAN..." style="width:100%; padding-left:2.2rem;" oninput="window.finApp.filterEmployeeRows()">
            <span style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); color:#64748b;">🔍</span>
          </div>
          <select id="fin-emp-dept-filter" class="fin-form-select" style="min-width:170px;" onchange="window.finApp.filterEmployeeRows()">
            <option value="">All Departments</option>
            <option value="Rayan Engineering">Rayan Engineering</option>
            <option value="Civil & Fitout">Civil &amp; Fitout</option>
            <option value="Operations">Operations</option>
            <option value="MEP & Electrical">MEP &amp; Electrical</option>
            <option value="Management">Management</option>
          </select>
          <select id="fin-emp-proj-filter" class="fin-form-select" style="min-width:190px;" onchange="window.finApp.filterEmployeeRows()">
            <option value="">All Project Allocations</option>
            <option value="corporate">Corporate / General Overhead</option>
            ${projects.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.code || '')} - ${escapeHtml(p.name)}</option>`).join('')}
          </select>
          <select id="fin-emp-status-filter" class="fin-form-select" style="min-width:165px; font-weight:700;" onchange="window.finApp.onStatusFilterDropdownChange(this.value)">
            <option value="">All Statuses (${employees.length})</option>
            <option value="active">🟢 Active Employees (${totalActive})</option>
            <option value="on leave">On Leave</option>
            <option value="resigned">🟡 Resigned (${totalResigned})</option>
            <option value="terminated">🔴 Terminated (${totalTerminated})</option>
          </select>
          <select id="fin-emp-rehire-filter" class="fin-form-select" style="min-width:150px;" onchange="window.finApp.filterEmployeeRows()">
            <option value="">All Rehire Status</option>
            <option value="yes">✓ Eligible for Rehire</option>
            <option value="no">✕ Ineligible for Rehire</option>
          </select>
          <button type="button" class="fin-btn-secondary" onclick="window.finApp.resetEmployeeFilters()" title="Reset all filters">
            🔄 Reset
          </button>
        </div>
      </div>

      <!-- Employees Directory Table -->
      <div class="fin-table-card">
        <div class="fin-table-responsive" style="overflow-x:auto;">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th style="width:40px; text-align:center; padding:9px 8px;">#</th>
                <th style="width:95px; padding:9px 10px;">Emp #</th>
                <th style="padding:9px 10px;">Employee</th>
                <th style="padding:9px 10px;">Designation &amp; Dept</th>
                <th style="padding:9px 10px;">Project Allocation</th>
                <th style="text-align:right; width:130px; padding:9px 10px;">Monthly Salary</th>
                <th style="padding:9px 10px;">Payment Method</th>
                <th style="width:85px; text-align:center; padding:9px 8px;">Status</th>
                <th style="width:190px; text-align:right; padding:9px 10px;">Actions</th>
              </tr>
            </thead>
            <tbody id="fin-emp-tbody">
              ${this.renderEmployeeRowsHtml(employees)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  proto.renderEmployeeRowsHtml = function (employees) {
    if (!employees || employees.length === 0) {
      return `
        <tr>
          <td colspan="9" style="text-align:center; padding:2.5rem 1rem; color:#94a3b8;">
            <div style="font-size:1.8rem; margin-bottom:0.4rem;">👥</div>
            <div style="font-weight:600; font-size:0.95rem; color:#cbd5e1;">No Employee Records Found</div>
            <div style="font-size:0.78rem; margin-top:3px;">Click "+ Add New Employee" to register personnel into the directory.</div>
          </td>
        </tr>
      `;
    }

    // Always sort in ascending serial order by employee_no (EN12001, EN12002, EN12003, EN12004, EN12005)
    const sortedEmployees = [...employees].sort((a, b) => {
      return (a.employee_no || '').localeCompare(b.employee_no || '', undefined, { numeric: true, sensitivity: 'base' });
    });

    return sortedEmployees.map((emp, index) => {
      const basic = Number(emp.basic_salary) || 0;
      const acc = Number(emp.accommodation_allowance) || 0;
      const cons = Number(emp.consolidated_allowance) || 0;
      const oth = Number(emp.other_allowance) || 0;
      const totalSalary = basic + acc + cons + oth;

      const rawStatus = (emp.status || 'Active').trim();
      const statusLower = rawStatus.toLowerCase();
      const isAct = statusLower === 'active';
      const isResigned = statusLower === 'resigned';
      const isTerminated = statusLower === 'terminated';
      const isOnLeave = statusLower === 'on leave';

      // DISTINCT COLORING:
      // Resigned = Vivid Amber / Warm Gold (#f59e0b)
      // Terminated = Vivid Crimson / Red (#ef4444)
      // Active = Vivid Emerald Green (#10b981)
      // On Leave = Purple (#a855f7)
      let statusColor = '#94a3b8';
      let statusBg = 'rgba(148,163,184,0.12)';
      let statusBorder = 'rgba(148,163,184,0.3)';
      let statusLabel = rawStatus;

      if (isAct) {
        statusColor = '#10b981';
        statusBg = 'rgba(16,185,129,0.14)';
        statusBorder = 'rgba(16,185,129,0.35)';
        statusLabel = 'Active';
      } else if (isResigned) {
        statusColor = '#f59e0b';
        statusBg = 'rgba(245,158,11,0.15)';
        statusBorder = 'rgba(245,158,11,0.4)';
        statusLabel = 'Resigned';
      } else if (isTerminated) {
        statusColor = '#ef4444';
        statusBg = 'rgba(239,68,68,0.16)';
        statusBorder = 'rgba(239,68,68,0.45)';
        statusLabel = 'Terminated';
      } else if (isOnLeave) {
        statusColor = '#a855f7';
        statusBg = 'rgba(168,85,247,0.14)';
        statusBorder = 'rgba(168,85,247,0.35)';
        statusLabel = 'On Leave';
      }

      // Rehire eligibility: default to yes unless explicitly 'no' or false
      const isEligibleForRehire = emp.eligible_for_rehire !== 'no' && emp.eligible_for_rehire !== false;
      const rehireColor = isEligibleForRehire ? '#10b981' : '#ef4444';
      const rehireBg = isEligibleForRehire ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';
      const rehireBorder = isEligibleForRehire ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)';
      const rehireLabel = isEligibleForRehire ? '✓ Rehire: Yes' : '✕ Rehire: No';

      const initials = (emp.name || 'EM').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
      const hasPhoto = Boolean(emp.photo);
      const photoHtml = hasPhoto
        ? `<img src="${emp.photo}" alt="${escapeHtml(emp.name)}" style="width:32px; height:32px; border-radius:8px; object-fit:cover; border:1px solid rgba(56,189,248,0.4); flex-shrink:0; box-shadow:0 2px 6px rgba(0,0,0,0.35);">`
        : `<div style="width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.25) 100%); border:1px solid rgba(56,189,248,0.3); display:flex; align-items:center; justify-content:center; font-weight:800; color:#38bdf8; font-size:0.8rem; flex-shrink:0;">${initials}</div>`;

      return `
        <tr data-emp-id="${escapeHtml(emp.id)}" style="transition:background 0.15s ease;">
          <td style="color:#94a3b8; font-size:0.78rem; text-align:center; padding:7px 8px; vertical-align:middle; font-weight:700;">${index + 1}</td>
          <td style="padding:7px 10px; vertical-align:middle; white-space:nowrap;">
            <div style="cursor:pointer; display:inline-block;" onclick="window.finApp.openEmployeeProfileModal('${emp.id}')" title="Click to view full dossier, documents &amp; payouts ledger">
              <strong style="color:#38bdf8; font-weight:700; font-family:monospace; font-size:0.88rem; text-decoration:underline; text-decoration-color:rgba(56,189,248,0.4);">
                ${escapeHtml(emp.employee_no || 'EN---')}
              </strong>
            </div>
          </td>
          <td style="padding:7px 10px; vertical-align:middle;">
            <div style="display:flex; align-items:center; gap:9px; cursor:pointer;" onclick="window.finApp.openEmployeeProfileModal('${emp.id}')" title="Click to view full employee profile dossier">
              ${photoHtml}
              <div style="min-width:0;">
                <div style="font-weight:700; color:#f8fafc; font-size:0.88rem; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${escapeHtml(emp.name || 'Unnamed')}
                </div>
                ${emp.phone ? `<div style="font-size:0.7rem; color:#94a3b8; margin-top:1px;">📞 ${escapeHtml(emp.phone)}</div>` : ''}
              </div>
            </div>
          </td>
          <td style="padding:7px 10px; vertical-align:middle; white-space:nowrap;">
            <div style="color:#e2e8f0; font-weight:600; font-size:0.83rem; line-height:1.2;">${escapeHtml(emp.position || emp.designation || 'Staff')}</div>
            <div style="font-size:0.72rem; color:#38bdf8; margin-top:1px;">${escapeHtml(emp.department || 'Rayan Engineering')}</div>
          </td>
          <td style="padding:7px 10px; vertical-align:middle; white-space:nowrap;">
            <div style="color:#cbd5e1; font-size:0.82rem; font-weight:500;">
              ${escapeHtml(emp.project_name || 'Corporate Overhead')}
            </div>
          </td>
          <td style="text-align:right; padding:7px 10px; vertical-align:middle; white-space:nowrap;">
            <div style="cursor:pointer; display:inline-block;" onclick="window.finApp.openQuickSalaryModal('${emp.id}')" title="Click to quickly change / edit salary &amp; allowances">
              <div style="font-weight:800; color:#10b981; font-size:0.9rem; display:inline-flex; align-items:center; gap:4px;">
                <span>${this.formatCurrency(totalSalary, emp.currency || 'AED')}</span>
                <span style="font-size:0.68rem; color:#38bdf8; opacity:0.85;">✏️</span>
              </div>
            </div>
          </td>
          <td style="padding:7px 10px; vertical-align:middle; white-space:nowrap;">
            <div style="font-size:0.8rem; font-weight:600; color:#f1f5f9;">${escapeHtml(emp.bank_name || 'Cash / On-Hand')}</div>
            <div style="font-size:0.7rem; color:#94a3b8; font-family:monospace;">
              ${emp.iban ? `IBAN: •••• ${escapeHtml(emp.iban.slice(-4))}` : 'Rayan E-Wallets / Cash'}
            </div>
          </td>
          <td style="text-align:center; padding:7px 8px; vertical-align:middle; white-space:nowrap;">
            <!-- Primary Status Badge with distinct colors -->
            <span style="display:inline-block; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:700; color:${statusColor}; background:${statusBg}; border:1px solid ${statusBorder};">
              ${escapeHtml(statusLabel)}
            </span>
            ${((isResigned || isTerminated) && (emp.end_date || emp.resignation_date)) ? `
              <div style="font-size:0.65rem; color:${statusColor}; margin-top:2px; font-family:monospace;" title="${isTerminated ? 'Termination date' : 'Resignation / Last working day'}">
                ${isTerminated ? 'Terminated:' : 'Left:'} ${escapeHtml(emp.end_date || emp.resignation_date)}
              </div>
            ` : ''}
            <!-- Rehire Eligibility Badge ONLY for former/inactive employees (NOT for active employees) -->
            ${(!isAct && (isResigned || isTerminated)) ? `
              <div style="margin-top:3px;">
                <span style="display:inline-flex; align-items:center; gap:2px; padding:1px 6px; border-radius:8px; font-size:0.64rem; font-weight:700; color:${rehireColor}; background:${rehireBg}; border:1px solid ${rehireBorder}; cursor:pointer;" onclick="event.stopPropagation(); window.finApp.toggleEmployeeRehireEligibility('${emp.id}')" title="Click to toggle rehire eligibility (Current: ${isEligibleForRehire ? 'Eligible' : 'Not Eligible'})">
                  ${rehireLabel}
                </span>
              </div>
            ` : ''}
          </td>
          <td style="text-align:right; padding:7px 10px; vertical-align:middle; white-space:nowrap;">
            <div style="display:inline-flex; gap:4px; align-items:center; flex-wrap:nowrap; justify-content:flex-end;">
              <button type="button" class="fin-btn-row-action" style="background:linear-gradient(135deg, rgba(14,165,233,0.22), rgba(99,102,241,0.22)); color:#38bdf8; border:1px solid rgba(56,189,248,0.45); font-weight:700; padding:4px 9px; font-size:0.74rem; border-radius:5px; cursor:pointer; white-space:nowrap;" onclick="window.finApp.openEmployeeProfileModal('${emp.id}')" title="View Full Employee Dossier, Documents &amp; Ledger">
                👤 Profile
              </button>
              <button type="button" class="fin-btn-row-action" style="background:rgba(16,185,129,0.18); color:#10b981; border:1px solid rgba(16,185,129,0.4); padding:4px 9px; font-size:0.74rem; font-weight:700; border-radius:5px; cursor:pointer; white-space:nowrap;" onclick="window.finApp.openRecordEmployeePaymentModal('${emp.id}')" title="Record Monthly Salary Payout">
                💳 Pay
              </button>
              <button type="button" class="fin-btn-row-action" style="background:rgba(255,255,255,0.08); color:#f1f5f9; border:1px solid rgba(255,255,255,0.18); padding:4px 9px; font-size:0.74rem; font-weight:700; border-radius:5px; cursor:pointer; white-space:nowrap;" onclick="event.stopPropagation(); window.finApp.openEmployeeModal('${emp.id}')" title="Edit Employee Profile &amp; Compensation">
                ✏️ Edit
              </button>
              <button type="button" class="fin-btn-row-action" style="background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.25); padding:4px 7px; font-size:0.74rem; border-radius:5px; cursor:pointer;" onclick="window.finApp.deleteEmployee('${emp.id}')" title="Delete Employee">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  proto.filterEmployeeRows = function () {
    const q = (document.getElementById('fin-emp-search')?.value || '').toLowerCase().trim();
    const dept = (document.getElementById('fin-emp-dept-filter')?.value || '').toLowerCase().trim();
    const prj = (document.getElementById('fin-emp-proj-filter')?.value || '').toLowerCase().trim();
    const status = (document.getElementById('fin-emp-status-filter')?.value || '').toLowerCase().trim();
    const rehireFilter = (document.getElementById('fin-emp-rehire-filter')?.value || '').toLowerCase().trim();

    const employees = (this.db?.employees || []).filter(e => {
      if (!this.matchesActiveCompany(e.company_id)) return false;

      if (q) {
        const hay = `${e.employee_no || ''} ${e.name || ''} ${e.position || ''} ${e.department || ''} ${e.bank_name || ''} ${e.iban || ''} ${e.phone || ''} ${e.rehire_notes || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (dept && !(e.department || '').toLowerCase().includes(dept)) return false;
      if (prj) {
        if (prj === 'corporate' && e.project_id) return false;
        if (prj !== 'corporate' && (e.project_id || '').toLowerCase() !== prj) return false;
      }
      if (status) {
        const empSt = (e.status || 'active').toLowerCase().trim();
        if (status === 'resigned') {
          if (empSt !== 'resigned') return false;
        } else if (status === 'terminated') {
          if (empSt !== 'terminated') return false;
        } else if (empSt !== status) {
          return false;
        }
      }
      if (rehireFilter) {
        const isRehire = e.eligible_for_rehire !== 'no' && e.eligible_for_rehire !== false;
        if (rehireFilter === 'yes' && !isRehire) return false;
        if (rehireFilter === 'no' && isRehire) return false;
      }

      return true;
    });

    // Always sort filtered employees serially by employee_no
    employees.sort((a, b) => (a.employee_no || '').localeCompare(b.employee_no || '', undefined, { numeric: true, sensitivity: 'base' }));

    const countEl = document.getElementById('fin-emp-showing-count');
    if (countEl) countEl.textContent = employees.length;

    const tbody = document.getElementById('fin-emp-tbody');
    if (tbody) {
      tbody.innerHTML = this.renderEmployeeRowsHtml(employees);
    }
  };

  proto.setEmployeeStatusFilter = function (status) {
    const sel = document.getElementById('fin-emp-status-filter');
    if (sel) sel.value = status;
    this.updateStatusPills(status);
    this.filterEmployeeRows();
  };

  proto.onStatusFilterDropdownChange = function (val) {
    this.updateStatusPills(val);
    this.filterEmployeeRows();
  };

  proto.updateStatusPills = function (activeVal) {
    const pills = [
      { id: 'fin-emp-pill-all', val: '' },
      { id: 'fin-emp-pill-active', val: 'active' },
      { id: 'fin-emp-pill-resigned', val: 'resigned' },
      { id: 'fin-emp-pill-terminated', val: 'terminated' }
    ];
    pills.forEach(p => {
      const el = document.getElementById(p.id);
      if (!el) return;
      const isSelected = (p.val === activeVal);
      if (isSelected) {
        el.classList.add('active');
        if (p.val === 'active') {
          el.style.background = 'rgba(16,185,129,0.25)';
          el.style.borderColor = '#10b981';
          el.style.boxShadow = '0 0 12px rgba(16,185,129,0.3)';
        } else if (p.val === 'resigned') {
          el.style.background = 'rgba(245,158,11,0.25)';
          el.style.borderColor = '#f59e0b';
          el.style.boxShadow = '0 0 12px rgba(245,158,11,0.3)';
        } else if (p.val === 'terminated') {
          el.style.background = 'rgba(239,68,68,0.25)';
          el.style.borderColor = '#ef4444';
          el.style.boxShadow = '0 0 12px rgba(239,68,68,0.3)';
        } else {
          el.style.background = 'rgba(56,189,248,0.25)';
          el.style.borderColor = '#38bdf8';
          el.style.boxShadow = '0 0 12px rgba(56,189,248,0.3)';
        }
      } else {
        el.classList.remove('active');
        el.style.boxShadow = 'none';
        if (p.val === 'active') {
          el.style.background = 'rgba(16,185,129,0.1)';
          el.style.borderColor = 'rgba(16,185,129,0.25)';
        } else if (p.val === 'resigned') {
          el.style.background = 'rgba(245,158,11,0.1)';
          el.style.borderColor = 'rgba(245,158,11,0.25)';
        } else if (p.val === 'terminated') {
          el.style.background = 'rgba(239,68,68,0.1)';
          el.style.borderColor = 'rgba(239,68,68,0.25)';
        } else {
          el.style.background = 'rgba(255,255,255,0.06)';
          el.style.borderColor = 'rgba(255,255,255,0.12)';
        }
      }
    });
  };

  proto.resetEmployeeFilters = function () {
    const s = document.getElementById('fin-emp-search');
    const d = document.getElementById('fin-emp-dept-filter');
    const p = document.getElementById('fin-emp-proj-filter');
    const st = document.getElementById('fin-emp-status-filter');
    const r = document.getElementById('fin-emp-rehire-filter');
    if (s) s.value = '';
    if (d) d.value = '';
    if (p) p.value = '';
    if (st) st.value = '';
    if (r) r.value = '';
    this.updateStatusPills('');
    this.filterEmployeeRows();
  };

  // ==========================================================================
  // 3. PAYROLL & MONTHLY PAYSLIPS TAB VIEW
  // ==========================================================================
  proto.renderPayrollTab = function (root) {
    if (!root) root = document.getElementById('fin-tab-content-root') || document.getElementById('fin-view-container');
    if (!root) return;
    this.ensurePayrollSeedData();
    const payroll = (this.db?.payroll || []).filter(p => this.matchesActiveCompany(p.company_id));
    const employees = (this.db?.employees || []).filter(e => this.matchesActiveCompany(e.company_id));
    const activeEmployees = employees.filter(e => (e.status || 'Active').toLowerCase() === 'active');
    const formerEmployees = employees.filter(e => (e.status || 'Active').toLowerCase() !== 'active');

    const totalSlips = payroll.length;
    const paidSlips = payroll.filter(p => (p.status || '').toLowerCase() === 'paid');
    const totalDisbursed = paidSlips.reduce((sum, p) => sum + (Number(p.net_pay || p.transferred_amount) || 0), 0);

    const pendingSlips = payroll.filter(p => (p.status || '').toLowerCase() !== 'paid');
    const totalPending = pendingSlips.reduce((sum, p) => sum + (Number(p.net_pay || p.total_earnings) || 0), 0);

    const projectAllocated = payroll.filter(p => Boolean(p.project_id || p.project_name))
      .reduce((sum, p) => sum + (Number(p.net_pay || p.total_earnings) || 0), 0);

    const monthsSet = new Set(payroll.map(p => p.month_year || p.period_label).filter(Boolean));
    const projects = (this.db?.projects || []).filter(p => this.matchesActiveCompany(p.company_id));
    const currentPeriodFilter = this.payrollPeriodFilter || 'all';

    root.innerHTML = `
      <div class="fin-tab-header">
        <div class="fin-tab-title-wrap">
          <h2 class="fin-panel-title">💼 Payroll &amp; Monthly Pay Slips</h2>
          <p class="fin-panel-sub">Monthly salary compensation registers, allowances, overtime &amp; bank / RAYAN E-Wallets payouts</p>
        </div>
        <div class="fin-tab-actions">
          <button type="button" class="fin-btn-secondary" onclick="window.finApp.exportPayrollCsv()">
            📤 Export Payroll CSV
          </button>
          <button type="button" class="fin-btn-secondary" onclick="window.finApp.switchTab('employees')">
            👥 Employees Directory
          </button>
          <button type="button" class="fin-btn-primary" style="background:#10b981; border-color:#10b981;" onclick="window.finApp.openRecordEmployeePaymentModal()">
            💳 Record Salary Payment
          </button>
          <button type="button" class="fin-btn-primary" onclick="window.finApp.openPayslipModal()">
            + Create Monthly Pay Slip
          </button>
        </div>
      </div>

      <!-- Payroll Summary Metrics -->
      <div class="fin-metrics-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
        <div class="fin-metric-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Total Pay Slips</div>
          <div style="font-size:1.85rem; font-weight:800; color:#38bdf8; margin:6px 0;">${totalSlips}</div>
          <div style="font-size:0.72rem; color:#64748b;">${paidSlips.length} settled • ${pendingSlips.length} pending payout</div>
        </div>

        <div class="fin-metric-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Total Disbursed (Paid)</div>
          <div style="font-size:1.85rem; font-weight:800; color:#10b981; margin:6px 0;">${this.formatCurrency(totalDisbursed)}</div>
          <div style="font-size:0.72rem; color:#64748b;">Directly deducted from bank / e-wallets</div>
        </div>

        <div class="fin-metric-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Pending Liabilities</div>
          <div style="font-size:1.85rem; font-weight:800; color:${totalPending > 0 ? '#f59e0b' : '#64748b'}; margin:6px 0;">${this.formatCurrency(totalPending)}</div>
          <div style="font-size:0.72rem; color:#64748b;">Awaiting payout confirmation</div>
        </div>

        <div class="fin-metric-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Project Allocated Labor</div>
          <div style="font-size:1.85rem; font-weight:800; color:#c084fc; margin:6px 0;">${this.formatCurrency(projectAllocated)}</div>
          <div style="font-size:0.72rem; color:#64748b;">Deducted from site project ledgers</div>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="fin-filter-bar" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; margin-bottom:1.25rem; background:rgba(15,23,42,0.4); padding:1rem; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
        <!-- Period Filter Pills -->
        <div style="display:flex; align-items:center; gap:0.35rem; background:rgba(15,23,42,0.6); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
          <button type="button" class="fin-pay-period-pill ${currentPeriodFilter === 'all' ? 'active' : ''}" data-period="all" onclick="window.finApp.setPayrollPeriodFilter('all')" style="${currentPeriodFilter === 'all' ? 'background:#38bdf8; color:#0f172a; font-weight:700;' : 'background:rgba(255,255,255,0.06); color:#cbd5e1;'} padding:4px 10px; border-radius:6px; font-size:0.75rem; border:none; cursor:pointer;">
            All Periods
          </button>
          <button type="button" class="fin-pay-period-pill ${currentPeriodFilter === '1m' ? 'active' : ''}" data-period="1m" onclick="window.finApp.setPayrollPeriodFilter('1m')" style="${currentPeriodFilter === '1m' ? 'background:#38bdf8; color:#0f172a; font-weight:700;' : 'background:rgba(255,255,255,0.06); color:#cbd5e1;'} padding:4px 10px; border-radius:6px; font-size:0.75rem; border:none; cursor:pointer;">
            1 Month
          </button>
          <button type="button" class="fin-pay-period-pill ${currentPeriodFilter === '3m' ? 'active' : ''}" data-period="3m" onclick="window.finApp.setPayrollPeriodFilter('3m')" style="${currentPeriodFilter === '3m' ? 'background:#38bdf8; color:#0f172a; font-weight:700;' : 'background:rgba(255,255,255,0.06); color:#cbd5e1;'} padding:4px 10px; border-radius:6px; font-size:0.75rem; border:none; cursor:pointer;">
            3 Months
          </button>
          <button type="button" class="fin-pay-period-pill ${currentPeriodFilter === '6m' ? 'active' : ''}" data-period="6m" onclick="window.finApp.setPayrollPeriodFilter('6m')" style="${currentPeriodFilter === '6m' ? 'background:#38bdf8; color:#0f172a; font-weight:700;' : 'background:rgba(255,255,255,0.06); color:#cbd5e1;'} padding:4px 10px; border-radius:6px; font-size:0.75rem; border:none; cursor:pointer;">
            6 Months
          </button>
        </div>

        <div style="flex:1; min-width:200px; position:relative;">
          <input type="text" id="fin-pay-search" class="fin-form-input" placeholder="Search slip #, employee, bank, ref..." style="width:100%; padding-left:2.2rem;" oninput="window.finApp.filterPayrollRows()">
          <span style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); color:#64748b;">🔍</span>
        </div>

        <!-- Filter by Employee -->
        <select id="fin-pay-emp-filter" class="fin-form-select" style="min-width:180px;" onchange="window.finApp.filterPayrollRows()">
          <option value="">All Employees (${employees.length})</option>
          <optgroup label="🟢 Active Employees (${activeEmployees.length})">
            ${activeEmployees.map(e => `<option value="${escapeHtml(e.id)}">${escapeHtml(e.employee_no)} - ${escapeHtml(e.name)}</option>`).join('')}
          </optgroup>
          ${formerEmployees.length > 0 ? `
          <optgroup label="⚪ Former Employees (${formerEmployees.length})">
            ${formerEmployees.map(e => `<option value="${escapeHtml(e.id)}">${escapeHtml(e.employee_no)} - ${escapeHtml(e.name)} [${escapeHtml(e.status)}]</option>`).join('')}
          </optgroup>
          ` : ''}
        </select>

        <!-- Filter by Source Type -->
        <select id="fin-pay-source-filter" class="fin-form-select" style="min-width:160px;" onchange="window.finApp.filterPayrollRows()">
          <option value="">All Payment Sources</option>
          <option value="bank">🏦 Bank Accounts</option>
          <option value="cash">💵 RAYAN E-Wallets</option>
        </select>

        <select id="fin-pay-status-filter" class="fin-form-select" style="min-width:130px;" onchange="window.finApp.filterPayrollRows()">
          <option value="">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="draft">Draft</option>
        </select>

        <select id="fin-pay-proj-filter" class="fin-form-select" style="min-width:180px;" onchange="window.finApp.filterPayrollRows()">
          <option value="">All Projects</option>
          <option value="corporate">Corporate / Overhead</option>
          ${projects.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.code || '')} - ${escapeHtml(p.name)}</option>`).join('')}
        </select>

        <button type="button" class="fin-btn-secondary" onclick="window.finApp.renderPayrollTab((document.getElementById('fin-tab-content-root') || document.getElementById('fin-view-container')))">
          🔄 Refresh
        </button>
      </div>

      <!-- Payroll Register Table -->
      <div class="fin-table-card">
        <div class="fin-table-responsive" style="overflow-x:auto;">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th style="width:45px;">#</th>
                <th style="width:170px;">Slip # &amp; Month</th>
                <th>Employee Details</th>
                <th>Project Cost Center</th>
                <th style="text-align:right;">Earnings</th>
                <th style="text-align:right;">Deductions</th>
                <th style="text-align:right;">Net Payable</th>
                <th>Payment Source</th>
                <th style="width:90px; text-align:center;">Status</th>
                <th style="width:210px; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody id="fin-pay-tbody">
              ${this.renderPayrollRowsHtml(payroll)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  proto.renderPayrollRowsHtml = function (payroll) {
    if (!payroll || payroll.length === 0) {
      return `
        <tr>
          <td colspan="10" style="text-align:center; padding:3rem 1rem; color:#94a3b8;">
            <div style="font-size:2rem; margin-bottom:0.5rem;">📜</div>
            <div style="font-weight:600; font-size:1rem; color:#cbd5e1;">No Pay Slips Found</div>
            <div style="font-size:0.8rem; margin-top:4px;">Generate a pay slip to disburse salary and record deductions.</div>
          </td>
        </tr>
      `;
    }

    return payroll.map((slip, index) => {
      const isPaid = (slip.status || '').toLowerCase() === 'paid';
      const statusColor = isPaid ? '#10b981' : '#f59e0b';
      const statusBg = isPaid ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)';

      const totalEarn = Number(slip.total_earnings) || (Number(slip.basic_salary || 0) + Number(slip.accommodation_allowance || 0) + Number(slip.consolidated_allowance || 0) + Number(slip.normal_overtime || 0));
      const totalDed = Number(slip.total_deductions) || 0;
      const netPay = Number(slip.net_pay) || (totalEarn - totalDed);

      return `
        <tr data-slip-id="${escapeHtml(slip.id)}">
          <td style="color:#64748b; font-size:0.8rem;">${index + 1}</td>
          <td>
            <strong style="color:#38bdf8; font-weight:700; font-family:monospace; font-size:0.88rem;">
              ${escapeHtml(slip.slip_no || 'PS---')}
            </strong>
            <div style="font-size:0.75rem; color:#cbd5e1; font-weight:600; margin-top:2px;">
              🗓️ ${escapeHtml(slip.month_year || slip.period_label || 'Current')}
            </div>
            <div style="font-size:0.68rem; color:#64748b;">
              Date: ${escapeHtml(slip.payment_date || slip.printed_date || '---')}
            </div>
          </td>
          <td>
            <div style="font-weight:700; color:#f8fafc; font-size:0.92rem;">${escapeHtml(slip.employee_name || 'Staff')}</div>
            <div style="font-size:0.74rem; color:#94a3b8;">
              <span style="font-family:monospace; color:#38bdf8;">${escapeHtml(slip.employee_no || '')}</span> • ${escapeHtml(slip.position || '')}
            </div>
          </td>
          <td>
            <div style="color:#e2e8f0; font-size:0.82rem; font-weight:600;">
              ${escapeHtml(slip.project_name || 'Corporate Overhead')}
            </div>
            <div style="font-size:0.7rem; color:#10b981;">
              ${slip.project_id ? '✓ Deducted from Project P&amp;L' : 'Corporate General Account'}
            </div>
          </td>
          <td style="text-align:right; font-weight:600; color:#cbd5e1; font-size:0.88rem;">
            ${this.formatCurrency(totalEarn, slip.currency || 'AED')}
          </td>
          <td style="text-align:right; font-weight:600; color:${totalDed > 0 ? '#ef4444' : '#64748b'}; font-size:0.88rem;">
            ${totalDed > 0 ? `-${this.formatCurrency(totalDed, slip.currency || 'AED')}` : 'AED 0.00'}
          </td>
          <td style="text-align:right;">
            <div style="font-weight:800; color:#10b981; font-size:0.95rem;">
              ${this.formatCurrency(netPay, slip.currency || 'AED')}
            </div>
            ${slip.normal_overtime > 0 ? `<div style="font-size:0.65rem; color:#38bdf8;">Incl. OT: ${this.formatCurrency(slip.normal_overtime)}</div>` : ''}
          </td>
          <td>
            <div style="font-size:0.82rem; font-weight:700; color:#f1f5f9; display:flex; align-items:center; gap:5px;">
              <span>${slip.payout_source_type === 'cash' ? '💵' : '🏦'}</span>
              <span>${escapeHtml(slip.payout_source_name || (slip.payout_source_type === 'cash' ? 'RAYAN E-Wallets' : 'Bank Transfer'))}</span>
            </div>
            <div style="font-size:0.7rem; color:${isPaid ? '#10b981' : '#f59e0b'}; font-weight:600; margin-top:2px;">
              ${isPaid ? '✓ Deducted from Account' : '⏳ Linked (Pending Payout)'}
            </div>
            ${slip.payout_reference ? `
              <div style="font-size:0.68rem; color:#64748b; font-family:monospace; margin-top:2px;">
                Ref: ${escapeHtml(slip.payout_reference)}
              </div>
            ` : ''}
          </td>
          <td style="text-align:center; white-space:nowrap;">
            <span style="display:inline-block; padding:3px 9px; border-radius:12px; font-size:0.72rem; font-weight:700; color:${statusColor}; background:${statusBg}; border:1px solid ${statusColor}40;">
              ${escapeHtml((slip.status || 'Draft').toUpperCase())}
            </span>
            ${!isPaid ? `
              <div style="margin-top:5px;">
                <button type="button" class="fin-btn-row-action" style="background:linear-gradient(135deg, #059669 0%, #10b981 100%); color:#ffffff; font-weight:800; border:none; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:0.72rem; display:inline-flex; align-items:center; gap:4px; box-shadow:0 2px 8px rgba(16,185,129,0.35); transition:transform 0.15s ease;" onclick="window.finApp.disbursePayrollDirect('${escapeHtml(slip.id)}')" title="Pay and deduct balance immediately from ${escapeHtml(slip.payout_source_name || 'RAYAN E-Wallets')}">
                  ⚡ Pay &amp; Deduct
                </button>
              </div>
            ` : `
              <div style="margin-top:3px; font-size:0.68rem; color:#10b981; font-weight:600;">
                ✓ Deducted
              </div>
            `}
          </td>
          <td style="text-align:right;">
            <div style="display:inline-flex; gap:0.35rem; align-items:center;">
              <button type="button" class="fin-btn-row-action" style="background:rgba(56,189,248,0.12); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); padding:4px 8px; font-size:0.75rem;" onclick="window.finApp.openPayslipPrintModal('${slip.id}')" title="Print / View Official Pay Slip">
                🖨️ View
              </button>
              ${!isPaid ? `
                <button type="button" class="fin-btn-row-action" style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.35); padding:4px 8px; font-size:0.75rem; font-weight:700;" onclick="window.finApp.openDisburseSalaryModal('${slip.id}')" title="Disburse & Deduct Balance">
                  💳 Pay Out
                </button>
              ` : ''}
              <button type="button" class="fin-btn-row-action" style="background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.12); padding:4px 7px; font-size:0.75rem;" onclick="window.finApp.openPayslipModal('${slip.id}')" title="Edit Pay Slip">
                ✏️
              </button>
              <button type="button" class="fin-btn-row-action" style="background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.25); padding:4px 7px; font-size:0.75rem;" onclick="window.finApp.deletePayslip('${slip.id}')" title="Delete Pay Slip">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  proto.setPayrollPeriodFilter = function (periodKey) {
    this.payrollPeriodFilter = periodKey;
    document.querySelectorAll('.fin-pay-period-pill').forEach(btn => {
      if (btn.getAttribute('data-period') === periodKey) {
        btn.classList.add('active');
        btn.style.background = '#38bdf8';
        btn.style.color = '#0f172a';
        btn.style.fontWeight = '700';
      } else {
        btn.classList.remove('active');
        btn.style.background = 'rgba(255,255,255,0.06)';
        btn.style.color = '#cbd5e1';
        btn.style.fontWeight = '500';
      }
    });
    this.filterPayrollRows();
  };

  proto.filterPayrollRows = function () {
    const q = (document.getElementById('fin-pay-search')?.value || '').toLowerCase().trim();
    const empId = (document.getElementById('fin-pay-emp-filter')?.value || '').trim();
    const sourceFilter = (document.getElementById('fin-pay-source-filter')?.value || '').toLowerCase().trim();
    const status = (document.getElementById('fin-pay-status-filter')?.value || '').toLowerCase().trim();
    const prj = (document.getElementById('fin-pay-proj-filter')?.value || '').toLowerCase().trim();
    const periodPill = this.payrollPeriodFilter || 'all';

    const payroll = (this.db?.payroll || []).filter(p => {
      if (!this.matchesActiveCompany(p.company_id)) return false;

      if (q) {
        const hay = `${p.slip_no || ''} ${p.employee_name || ''} ${p.employee_no || ''} ${p.month_year || ''} ${p.bank_name || ''} ${p.payout_source_name || ''} ${p.project_name || ''} ${p.payout_reference || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (empId) {
        if (p.employee_id !== empId && p.employee_no !== empId) return false;
      }
      if (sourceFilter) {
        if (sourceFilter === 'bank' && (p.payout_source_type || 'bank') !== 'bank') return false;
        if (sourceFilter === 'cash' && (p.payout_source_type || 'bank') !== 'cash') return false;
      }
      if (status && (p.status || 'draft').toLowerCase() !== status) return false;
      if (prj) {
        if (prj === 'corporate' && p.project_id) return false;
        if (prj !== 'corporate' && (p.project_id || '').toLowerCase() !== prj) return false;
      }
      if (periodPill && periodPill !== 'all') {
        const periods = getPeriodsForFilter(periodPill);
        const matchesPeriod = periods.some(period => doesSlipMatchPeriod(p, period));
        if (!matchesPeriod) return false;
      }

      return true;
    });

    const tbody = document.getElementById('fin-pay-tbody');
    if (tbody) {
      tbody.innerHTML = this.renderPayrollRowsHtml(payroll);
    }
  };

  // ==========================================================================
  // 4. EMPLOYEE MODAL (ADD / EDIT) & PHOTO AVATAR HANDLERS
  // ==========================================================================
  proto.handleEmployeePhotoUpload = function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        // High quality scale down to max 320x320 for snappy payload & crisp display
        const maxDim = 320;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        const valInput = document.getElementById('fin-emp-photo-val');
        if (valInput) valInput.value = dataUrl;
        if (window.finApp) window.finApp._empPhotoRemoved = false;

        const previewImg = document.getElementById('fin-emp-photo-preview-img');
        const placeholder = document.getElementById('fin-emp-photo-placeholder');
        const removeBtn = document.getElementById('fin-emp-photo-remove-btn');
        if (previewImg) {
          previewImg.src = dataUrl;
          previewImg.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'inline-flex';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  proto.removeEmployeePhoto = function () {
    this._empPhotoRemoved = true;
    const valInput = document.getElementById('fin-emp-photo-val');
    if (valInput) valInput.value = '';
    const fileInput = document.getElementById('fin-emp-photo-input');
    if (fileInput) fileInput.value = '';
    const previewImg = document.getElementById('fin-emp-photo-preview-img');
    const placeholder = document.getElementById('fin-emp-photo-placeholder');
    const removeBtn = document.getElementById('fin-emp-photo-remove-btn');
    if (previewImg) {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'flex';
    if (removeBtn) removeBtn.style.display = 'none';
  };

  proto.openEmployeeModal = function (empId = null, fromProfile = false) {
    this._empPhotoRemoved = false;
    if (fromProfile || document.getElementById('fin-emp-profile-modal-backdrop')) {
      this._editingFromProfileEmpId = empId;
    }
    let emp = null;
    if (empId) {
      const searchKey = String(empId).trim().toLowerCase();
      emp = (this.db?.employees || []).find(e =>
        (e.id && String(e.id).trim().toLowerCase() === searchKey) ||
        (e.employee_no && String(e.employee_no).trim().toLowerCase() === searchKey)
      );
    }

    const isEdit = Boolean(emp);
    const projects = (this.db?.projects || []).filter(p => this.matchesActiveCompany(p.company_id));

    // Auto-calculate next sequential employee number if creating new
    let defaultEmpNo = emp?.employee_no || '';
    if (!defaultEmpNo) {
      let maxNo = 12000;
      (this.db?.employees || []).forEach(e => {
        const m = (e.employee_no || '').match(/EN(\d+)/i);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num > maxNo) maxNo = num;
        }
      });
      defaultEmpNo = 'EN' + (maxNo + 1);
    }

    const basicSalary = emp ? Number(emp.basic_salary || 0) : '0.00';
    const accAllowance = emp ? Number(emp.accommodation_allowance || 0) : '';
    const otherAllowance = emp ? Number(emp.other_allowance || 0) : '';

    const hasPhoto = Boolean(emp?.photo);

    const html = `
      <div class="fin-modal-backdrop open" id="fin-emp-modal-backdrop" style="z-index: 100030;">
        <div class="fin-modal-dialog" style="max-width:860px; width:95%; max-height:92vh; background:#0d1527; border:1px solid rgba(56,189,248,0.25); box-shadow:0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(0,153,230,0.12); display:flex; flex-direction:column; border-radius:16px; overflow:hidden;">
          <!-- Executive Header -->
          <div class="fin-modal-header" style="background:linear-gradient(180deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%); padding:1.25rem 1.75rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.85rem;">
              <div style="width:42px; height:42px; border-radius:10px; background:linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(0,153,230,0.3) 100%); border:1px solid rgba(56,189,248,0.35); display:flex; align-items:center; justify-content:center; font-size:1.35rem; box-shadow:0 4px 12px rgba(56,189,248,0.15);">👤</div>
              <div>
                <h3 class="fin-modal-title" style="margin:0; font-size:1.2rem; font-weight:800; color:#f8fafc;">
                  ${isEdit ? '✏️ Edit Employee Profile &amp; Records' : '👤 Register New Employee &amp; Worker'}
                </h3>
                <p style="margin:2px 0 0; font-size:0.75rem; color:#94a3b8;">
                  Personnel file, photo avatar, residential addresses, emergency contacts &amp; compensation
                </p>
              </div>
            </div>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeEmployeeModal()" title="Close">&times;</button>
          </div>

          <!-- Form Body -->
          <form id="fin-emp-form" class="fin-modal-body" onsubmit="window.finApp.saveEmployeeForm(event)" style="padding:1.5rem 1.75rem; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:1.25rem;">
            <input type="hidden" name="id" value="${emp?.id || ''}">
            <input type="hidden" name="photo" id="fin-emp-photo-val" value="${escapeHtml(emp?.photo || '')}">

            <!-- Card 1: Photo Avatar & Role Identification -->
            <div class="fin-form-section-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
              <div class="fin-form-section-header" style="margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.06); font-weight:700; color:#38bdf8; font-size:0.88rem; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span>👤</span>
                  <span>Employee Photo &amp; Primary Identification</span>
                </div>
                <span style="font-size:0.7rem; color:#94a3b8;">Required fields marked with <span style="color:#ef4444;">*</span></span>
              </div>

              <!-- Photo Upload Strip -->
              <div style="display:flex; align-items:center; gap:1.25rem; margin-bottom:1.25rem; background:rgba(0,0,0,0.25); border:1px dashed rgba(56,189,248,0.3); border-radius:12px; padding:1rem; flex-wrap:wrap;">
                <div style="position:relative; width:88px; height:88px; border-radius:14px; overflow:hidden; background:#0f172a; border:2px solid rgba(56,189,248,0.4); display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 4px 14px rgba(0,0,0,0.4);">
                  <img id="fin-emp-photo-preview-img" src="${emp?.photo || ''}" alt="Employee Photo" style="width:100%; height:100%; object-fit:cover; display:${hasPhoto ? 'block' : 'none'};">
                  <div id="fin-emp-photo-placeholder" style="display:${hasPhoto ? 'none' : 'flex'}; flex-direction:column; align-items:center; justify-content:center; color:#64748b; font-weight:700; font-size:1.5rem;">
                    <span>📷</span>
                    <span style="font-size:0.62rem; color:#94a3b8; margin-top:2px; font-family:sans-serif;">No Photo</span>
                  </div>
                </div>

                <div style="flex:1; min-width:220px;">
                  <div style="font-weight:700; color:#f8fafc; font-size:0.9rem; margin-bottom:3px;">
                    Employee Portrait Photo / Staff Avatar
                  </div>
                  <div style="font-size:0.75rem; color:#94a3b8; margin-bottom:0.75rem; line-height:1.4;">
                    Upload an official passport or portrait photograph. Displays in the directory, executive profile, ID badges, and official payslips.
                  </div>
                  <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <input type="file" id="fin-emp-photo-input" accept="image/*" style="display:none;" onchange="window.finApp.handleEmployeePhotoUpload(event)">
                    <button type="button" class="fin-btn-secondary" style="background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.4); font-size:0.78rem; padding:6px 14px; font-weight:700; cursor:pointer;" onclick="document.getElementById('fin-emp-photo-input').click()">
                      📷 Choose / Upload Photo
                    </button>
                    <button type="button" id="fin-emp-photo-remove-btn" class="fin-btn-secondary" style="background:rgba(239,68,68,0.12); color:#ef4444; border:1px solid rgba(239,68,68,0.3); font-size:0.78rem; padding:6px 12px; cursor:pointer; display:${hasPhoto ? 'inline-flex' : 'none'};" onclick="window.finApp.removeEmployeePhoto()">
                      ✖ Remove Photo
                    </button>
                  </div>
                </div>
              </div>

              <!-- Identification Inputs -->
              <div class="fin-form-grid-3" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Employee ID / No. <span style="color:#ef4444;">*</span></label>
                  <input type="text" name="employee_no" class="fin-form-input" required value="${escapeHtml(defaultEmpNo)}" placeholder="e.g. EN12005" style="font-family:monospace; font-weight:700; color:#38bdf8;">
                  <span style="font-size:0.68rem; color:#64748b;">Auto-sequenced company ID</span>
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Full Name <span style="color:#ef4444;">*</span></label>
                  <input type="text" name="name" class="fin-form-input" required value="${escapeHtml(emp?.name || '')}" placeholder="e.g. Nadeem Akhtar Nazmul Hoda" style="font-weight:600;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Designation / Job Title <span style="color:#ef4444;">*</span></label>
                  <input type="text" name="position" class="fin-form-input" required value="${escapeHtml(emp?.position || emp?.designation || '')}" placeholder="e.g. Civil Engineer">
                </div>
              </div>
              <div class="fin-form-grid-3" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Department</label>
                  <input type="text" name="department" class="fin-form-input" value="${escapeHtml(emp?.department || 'Rayan Engineering')}" placeholder="e.g. Rayan Engineering">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Date of Joining</label>
                  <input type="date" name="date_of_joining" class="fin-form-input" value="${emp?.date_of_joining || new Date().toISOString().split('T')[0]}">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Gender <span style="color:#ef4444;">*</span></label>
                  <select name="gender" id="fin-emp-gender-select" class="fin-form-select" style="font-weight:700;">
                    <option value="Male" ${(emp?.gender || '').toLowerCase() === 'female' ? '' : 'selected'}>👨 Male</option>
                    <option value="Female" ${(emp?.gender || '').toLowerCase() === 'female' ? 'selected' : ''}>👩 Female</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Card 2: Legal Identity, Passports & Labor Details -->
            <div class="fin-form-section-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
              <div class="fin-form-section-header" style="margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.06); font-weight:700; color:#10b981; font-size:0.88rem; display:flex; align-items:center; gap:6px;">
                <span>🪪</span>
                <span>Legal Identity, Passports &amp; Labor Details</span>
              </div>
              <div class="fin-form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Emirates ID (EID)</label>
                  <input type="text" name="emirates_id" class="fin-form-input" value="${escapeHtml(emp?.emirates_id || '')}" placeholder="784-1998-3368120-0" style="font-family:monospace; font-weight:600;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">EID Expiry Date</label>
                  <input type="date" name="eid_expiry_date" class="fin-form-input" value="${emp?.eid_expiry_date || emp?.visa_expiry_date || ''}">
                </div>
              </div>
              <div class="fin-form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Passport No.</label>
                  <input type="text" name="passport_no" class="fin-form-input" value="${escapeHtml(emp?.passport_no || '')}" placeholder="e.g. U3566719" style="font-family:monospace; font-weight:700;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Passport Expiry Date <span style="font-size:0.68rem; color:#f59e0b; font-weight:normal;">(passport validity)</span></label>
                  <input type="date" name="passport_expiry_date" class="fin-form-input" value="${emp?.passport_expiry_date || ''}" style="border-color:rgba(245,158,11,0.35);">
                </div>
              </div>
              <div class="fin-form-grid-3" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Nationality</label>
                  <input type="text" name="nationality" class="fin-form-input" value="${escapeHtml(emp?.nationality || 'India')}" placeholder="e.g. India">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Visa Status</label>
                  <select name="visa_status" class="fin-form-select">
                    <option value="Employment Visa (Rayan Engineering)" ${(emp?.visa_status || '').includes('Employment') || !emp?.visa_status ? 'selected' : ''}>Employment Visa (Rayan Engineering)</option>
                    <option value="Residence Visa" ${(emp?.visa_status || '') === 'Residence Visa' ? 'selected' : ''}>Residence Visa</option>
                    <option value="Investor / Partner Visa" ${(emp?.visa_status || '').includes('Investor') ? 'selected' : ''}>Investor / Partner Visa</option>
                    <option value="Mission / Visit Visa" ${(emp?.visa_status || '').includes('Visit') ? 'selected' : ''}>Mission / Visit Visa</option>
                    <option value="Under Processing" ${(emp?.visa_status || '').includes('Processing') ? 'selected' : ''}>Under Processing</option>
                  </select>
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Labor Card / Work Permit No.</label>
                  <input type="text" name="labor_card_no" class="fin-form-input" value="${escapeHtml(emp?.labor_card_no || '')}" placeholder="e.g. 12345678" style="font-family:monospace;">
                </div>
              </div>
            </div>

            <!-- Card 3: Contact Coordinates & Residential Addresses -->
            <div class="fin-form-section-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
              <div class="fin-form-section-header" style="margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.06); font-weight:700; color:#38bdf8; font-size:0.88rem; display:flex; align-items:center; gap:6px;">
                <span>📍</span>
                <span>Contact Coordinates &amp; Residential Addresses (UAE &amp; Home Country)</span>
              </div>
              <div class="fin-form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Contact / Phone Number</label>
                  <input type="text" name="phone" class="fin-form-input" value="${escapeHtml(emp?.phone || '')}" placeholder="+971 55 541 1543">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Email Address</label>
                  <input type="email" name="email" class="fin-form-input" value="${escapeHtml(emp?.email || '')}" placeholder="name@domain.com">
                </div>
              </div>

              <!-- Complete Addresses -->
              <div class="fin-form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">UAE Residential Address</label>
                  <textarea name="address" rows="2" class="fin-form-input" style="resize:vertical; min-height:54px;" placeholder="Flat / Villa, Building, Street, Area/Sector, Emirate (e.g. Flat 302, Building 14, Musaffah M-14, Abu Dhabi, UAE)">${escapeHtml(emp?.address || emp?.local_address || '')}</textarea>
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Permanent Home Country Address</label>
                  <textarea name="permanent_address" rows="2" class="fin-form-input" style="resize:vertical; min-height:54px;" placeholder="Village / Town, District, State, Postal Code, Country (e.g. Siwan, Bihar, India)">${escapeHtml(emp?.permanent_address || '')}</textarea>
                </div>
              </div>

              <!-- Emergency Contact Details -->
              <div style="background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.85rem; margin-top:0.25rem;">
                <div style="font-size:0.75rem; font-weight:700; color:#cbd5e1; margin-bottom:0.6rem; text-transform:uppercase; letter-spacing:0.03em;">
                  🚨 Emergency Contact Coordinates
                </div>
                <div class="fin-form-grid-3" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.75rem;">
                  <div class="fin-form-group" style="margin-bottom:0;">
                    <label class="fin-field-label" style="font-size:0.72rem;">Contact Person Name</label>
                    <input type="text" name="emergency_contact_name" class="fin-form-input" value="${escapeHtml(emp?.emergency_contact_name || '')}" placeholder="e.g. Mohammad Nazmul">
                  </div>
                  <div class="fin-form-group" style="margin-bottom:0;">
                    <label class="fin-field-label" style="font-size:0.72rem;">Relationship</label>
                    <input type="text" name="emergency_contact_relation" class="fin-form-input" value="${escapeHtml(emp?.emergency_contact_relation || '')}" placeholder="e.g. Father / Brother / Spouse">
                  </div>
                  <div class="fin-form-group" style="margin-bottom:0;">
                    <label class="fin-field-label" style="font-size:0.72rem;">Emergency Phone</label>
                    <input type="text" name="emergency_contact_phone" class="fin-form-input" value="${escapeHtml(emp?.emergency_contact_phone || '')}" placeholder="+91 98765 43210">
                  </div>
                </div>
              </div>
            </div>

            <!-- Card 4: Monthly Compensation Elements -->
            <div class="fin-form-section-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
              <div class="fin-form-section-header" style="margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.06); font-weight:700; color:#f59e0b; font-size:0.88rem; display:flex; align-items:center; gap:6px;">
                <span>💵</span>
                <span>Monthly Compensation Structure (AED)</span>
              </div>
              <div class="fin-form-grid-3" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; margin-bottom:1rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Basic Salary (AED)</label>
                  <input type="number" step="0.01" name="basic_salary" id="fin-emp-basic" class="fin-form-input" value="${basicSalary}" placeholder="0.00" oninput="window.finApp.calcEmpGrossSalary()" style="font-weight:700;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Accommodation Allowance (AED)</label>
                  <input type="number" step="0.01" name="accommodation_allowance" id="fin-emp-acc" class="fin-form-input" value="${accAllowance}" placeholder="0.00" oninput="window.finApp.calcEmpGrossSalary()" style="font-weight:700;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Other Allowance (AED)</label>
                  <input type="number" step="0.01" name="other_allowance" id="fin-emp-oth" class="fin-form-input" value="${otherAllowance}" placeholder="0.00" oninput="window.finApp.calcEmpGrossSalary()" style="font-weight:700;">
                </div>
              </div>

              <!-- Live Calculated Total Monthly Salary -->
              <div style="background:linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(56,189,248,0.1) 100%); border:1px solid rgba(16,185,129,0.3); border-radius:10px; padding:0.85rem 1.25rem; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.82rem; color:#cbd5e1; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Total Monthly Standard Salary:</span>
                <strong id="fin-emp-gross-preview" style="font-size:1.25rem; font-weight:800; color:#10b981;">AED 0.00</strong>
              </div>
            </div>

            <!-- Card 5: Banking Coordinates, Project & Status -->
            <div class="fin-form-section-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
              <div class="fin-form-section-header" style="margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.06); font-weight:700; color:#c084fc; font-size:0.88rem; display:flex; align-items:center; gap:6px;">
                <span>🏦</span>
                <span>Bank Details, Project Allocation &amp; Status</span>
              </div>
              <div class="fin-form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Bank Name</label>
                  <input type="text" name="bank_name" class="fin-form-input" value="${escapeHtml(emp?.bank_name || '')}" placeholder="e.g. Emirates NBD Bank PJSC / Cash">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">IBAN / Account Number</label>
                  <input type="text" name="iban" class="fin-form-input" value="${escapeHtml(emp?.iban || emp?.account_no || '')}" placeholder="AE86..." style="font-family:monospace; font-weight:600;">
                </div>
              </div>
              <div class="fin-form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Project Allocation</label>
                  <select name="project_id" class="fin-form-select">
                    <option value="">Corporate / General Overhead</option>
                    ${projects.map(p => `
                      <option value="${escapeHtml(p.id)}" ${emp?.project_id === p.id ? 'selected' : ''}>
                        ${escapeHtml(p.code || '')} - ${escapeHtml(p.name)}
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Employment Status</label>
                  <select name="status" id="fin-emp-status-select" class="fin-form-select" onchange="window.finApp.onEmployeeStatusChange(this.value)">
                    <option value="Active" ${emp?.status === 'Active' || !emp ? 'selected' : ''}>Active</option>
                    <option value="On Leave" ${emp?.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
                    <option value="Resigned" ${emp?.status === 'Resigned' ? 'selected' : ''}>Resigned</option>
                    <option value="Terminated" ${emp?.status === 'Terminated' ? 'selected' : ''}>Terminated</option>
                  </select>
                </div>
              </div>

              <!-- Resignation & Exit Details Panel (Prominently shown ONLY when Resigned or Terminated) -->
              <div id="fin-emp-end-date-section" style="margin-top:1rem; padding:1.15rem; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:10px; display:${(emp?.status === 'Resigned' || emp?.status === 'Terminated') ? 'block' : 'none'};">
                <div style="font-size:0.84rem; font-weight:700; color:#f87171; margin-bottom:0.75rem; display:flex; align-items:center; justify-content:space-between; gap:6px;">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span>📅</span>
                    <span id="fin-emp-exit-title">${emp?.status === 'Terminated' ? 'Termination &amp; Exit Record' : 'Resignation &amp; Exit Record'}</span>
                  </div>
                  <span style="font-size:0.68rem; color:#fca5a5; font-weight:600; background:rgba(239,68,68,0.15); padding:2px 8px; border-radius:4px;">Former Personnel Exit Dossier</span>
                </div>
                <div class="fin-form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                  <div class="fin-form-group" style="margin-bottom:0;">
                    <label class="fin-field-label" style="color:#fca5a5;">End Date / Last Working Day <span style="color:#ef4444;">*</span></label>
                    <input type="date" name="end_date" id="fin-emp-end-date" class="fin-form-input" value="${emp?.end_date || emp?.resignation_date || ''}" style="border-color:rgba(239,68,68,0.45); font-weight:700;">
                    <span style="font-size:0.68rem; color:#94a3b8;">Effective date of resignation / departure</span>
                  </div>
                  <div class="fin-form-group" style="margin-bottom:0;">
                    <label class="fin-field-label">Reason for Leaving / Exit Remarks</label>
                    <input type="text" name="end_reason" id="fin-emp-end-reason" class="fin-form-input" value="${escapeHtml(emp?.end_reason || emp?.resignation_reason || '')}" placeholder="e.g. Resigned - Relieved on notice">
                    <span style="font-size:0.68rem; color:#94a3b8;">Optional exit remark / relieving status</span>
                  </div>
                </div>

                <!-- Rehire Option (Only for Exited / Resigned / Terminated Employees) -->
                <div class="fin-form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.06);">
                  <div class="fin-form-group" style="margin-bottom:0;">
                    <label class="fin-field-label">Eligible to Rehire Employee? <span style="color:#ef4444;">*</span></label>
                    <select name="eligible_for_rehire" id="fin-emp-rehire-select" class="fin-form-select" style="font-weight:700;">
                      <option value="yes" ${emp?.eligible_for_rehire !== 'no' && emp?.eligible_for_rehire !== false ? 'selected' : ''}>✅ Yes (Eligible for Rehire)</option>
                      <option value="no" ${emp?.eligible_for_rehire === 'no' || emp?.eligible_for_rehire === false ? 'selected' : ''}>⛔ No (Ineligible / Do Not Rehire)</option>
                    </select>
                    <span style="font-size:0.68rem; color:#94a3b8;">Corporate HR clearance policy for future rehiring</span>
                  </div>
                  <div class="fin-form-group" style="margin-bottom:0;">
                    <label class="fin-field-label">Rehire Clearance Remarks / Notes</label>
                    <input type="text" name="rehire_notes" class="fin-form-input" value="${escapeHtml(emp?.rehire_notes || '')}" placeholder="e.g. Good standing, eligible upon new tender award">
                    <span style="font-size:0.68rem; color:#94a3b8;">HR commentary on rehire decision or conditions</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Optional Bilingual Support for Official Letters -->
            <details style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.75rem 1rem;">
              <summary style="cursor:pointer; color:#94a3b8; font-size:0.8rem; font-weight:600;">Optional: Arabic Name &amp; Designation (for Arabic Employment Certificates)</summary>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:0.75rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label" style="text-align:right;">اسم الموظف (عربي)</label>
                  <input type="text" name="name_ar" class="fin-form-input fin-input-ar" value="${escapeHtml(emp?.name_ar || '')}" placeholder="نديم اختر نظم هدي" dir="rtl">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label" style="text-align:right;">المسمى الوظيفي (عربي)</label>
                  <input type="text" name="position_ar" class="fin-form-input fin-input-ar" value="${escapeHtml(emp?.position_ar || '')}" placeholder="مهندس مدني" dir="rtl">
                </div>
              </div>
            </details>

            <!-- Footer Actions -->
            <div class="fin-modal-footer" style="padding:1.15rem 0 0 0; background:transparent; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem;">
              <button type="button" class="fin-btn-secondary" onclick="window.finApp.closeEmployeeModal()">Cancel</button>
              <button type="submit" id="fin-emp-save-btn" class="fin-btn-primary" style="background:#10b981; border-color:#10b981; font-weight:700;">
                ${isEdit ? '💾 Update Employee Profile' : '✓ Save Employee to Directory'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showCustomModal(html);
    this.calcEmpGrossSalary();
  };

  proto.calcEmpGrossSalary = function () {
    const basic = parseFloat(document.getElementById('fin-emp-basic')?.value) || 0;
    const acc = parseFloat(document.getElementById('fin-emp-acc')?.value) || 0;
    const oth = parseFloat(document.getElementById('fin-emp-oth')?.value) || 0;
    const total = basic + acc + oth;

    const el = document.getElementById('fin-emp-gross-preview');
    if (el) {
      el.textContent = (typeof this.formatCurrency === 'function') ? this.formatCurrency(total) : formatMoney(total);
    }
  };

  proto.onEmployeeStatusChange = function (val) {
    const sec = document.getElementById('fin-emp-end-date-section');
    const isExit = val === 'Resigned' || val === 'Terminated';
    if (sec) {
      sec.style.display = isExit ? 'block' : 'none';
      const titleEl = document.getElementById('fin-emp-exit-title');
      if (titleEl) {
        titleEl.textContent = val === 'Terminated' ? 'Termination & Exit Record' : 'Resignation & Exit Record';
      }
    }
    if (!isExit) {
      const endInput = document.getElementById('fin-emp-end-date');
      if (endInput) endInput.value = '';
      const endReason = document.getElementById('fin-emp-end-reason');
      if (endReason) endReason.value = '';
    } else {
      const endInput = document.getElementById('fin-emp-end-date');
      if (endInput && !endInput.value) {
        endInput.value = new Date().toISOString().split('T')[0];
      }
    }
  };

  proto.syncEmployeeEndDate = function (val) {
    const endInput = document.getElementById('fin-emp-end-date');
    const quickInput = document.getElementById('fin-emp-end-date-quick');
    if (endInput && endInput.value !== val) endInput.value = val;
    if (quickInput && quickInput.value !== val) quickInput.value = val;
    const statusSelect = document.getElementById('fin-emp-status-select');
    if (val && statusSelect && statusSelect.value === 'Active') {
      statusSelect.value = 'Resigned';
      this.onEmployeeStatusChange('Resigned');
    }
  };

  proto.closeEmployeeModal = function () {
    const el = document.getElementById('fin-emp-modal-backdrop');
    if (el) el.remove();
    this.closeCustomModal('fin-emp-modal-backdrop');
    if (this._editingFromProfileEmpId) {
      const pId = this._editingFromProfileEmpId;
      this._editingFromProfileEmpId = null;
      this.openEmployeeProfileModal(pId);
    }
  };

  proto.saveEmployeeForm = async function (e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = document.getElementById('fin-emp-save-btn') || form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳</span> Saving Employee...';
    }

    const formData = new FormData(form);
    const rawId = formData.get('id');
    const isEdit = Boolean(rawId && rawId.trim());
    const empNo = (formData.get('employee_no') || '').trim();
    let empId = isEdit ? rawId.trim() : (empNo ? 'emp-' + empNo.toLowerCase() : ('emp-' + Date.now().toString(36)));
    const prjId = formData.get('project_id') || '';
    const prj = (this.db?.projects || []).find(p => p.id === prjId);

    const basicSalary = parseFloat(formData.get('basic_salary')) || 0;
    const accAllowance = parseFloat(formData.get('accommodation_allowance')) || 0;
    const otherAllowance = parseFloat(formData.get('other_allowance')) || 0;
    let empStatus = (formData.get('status') || 'Active').trim();
    let endDate = (formData.get('end_date') || '').trim();
    let endReason = (formData.get('end_reason') || '').trim();
    const gender = (formData.get('gender') || 'Male').trim();

    // If user explicitly selected Active or On Leave, clear exit dates so status is never forced to Resigned!
    if (empStatus === 'Active' || empStatus === 'On Leave') {
      endDate = '';
      endReason = '';
    }

    const eligibleForRehire = (formData.get('eligible_for_rehire') || 'yes').trim();
    const rehireNotes = (formData.get('rehire_notes') || '').trim();

    const empObj = {
      id: empId,
      employee_no: empNo,
      company_id: this.activeCompanyId || 'rayan-corp-uae',
      name: (formData.get('name') || '').trim(),
      position: (formData.get('position') || '').trim(),
      designation: (formData.get('position') || '').trim(),
      department: (formData.get('department') || 'Rayan Engineering').trim(),
      name_ar: (formData.get('name_ar') || '').trim(),
      position_ar: (formData.get('position_ar') || '').trim(),
      gender: gender,
      passport_no: (formData.get('passport_no') || '').trim(),
      passport_expiry_date: formData.get('passport_expiry_date') || '',
      emirates_id: (formData.get('emirates_id') || '').trim(),
      eid_expiry_date: formData.get('eid_expiry_date') || '',
      nationality: (formData.get('nationality') || 'India').trim(),
      date_of_joining: formData.get('date_of_joining') || '',
      date_of_appointment: formData.get('date_of_joining') || '',
      end_date: endDate,
      resignation_date: endDate,
      date_of_leaving: endDate,
      end_reason: endReason,
      resignation_reason: endReason,
      phone: (formData.get('phone') || '').trim(),
      email: (formData.get('email') || '').trim(),
      photo: formData.get('photo') || '',
      address: (formData.get('address') || '').trim(),
      local_address: (formData.get('address') || '').trim(),
      permanent_address: (formData.get('permanent_address') || '').trim(),
      emergency_contact_name: (formData.get('emergency_contact_name') || '').trim(),
      emergency_contact_relation: (formData.get('emergency_contact_relation') || '').trim(),
      emergency_contact_phone: (formData.get('emergency_contact_phone') || '').trim(),
      visa_status: (formData.get('visa_status') || 'Employment Visa (Rayan Engineering)').trim(),
      visa_expiry_date: formData.get('visa_expiry_date') || '',
      labor_card_no: (formData.get('labor_card_no') || '').trim(),
      basic_salary: basicSalary,
      accommodation_allowance: accAllowance,
      consolidated_allowance: 0,
      other_allowance: otherAllowance,
      bank_name: (formData.get('bank_name') || '').trim(),
      swift: 'EBILAEADXXX',
      iban: (formData.get('iban') || '').trim(),
      account_no: (formData.get('iban') || '').trim(),
      default_pay_method: formData.get('bank_name')?.toLowerCase().includes('cash') ? 'RAYAN E-Wallets / Cash' : 'AED RAYAN GROUP Host To Host',
      project_id: prjId,
      project_name: prj ? prj.name : 'Corporate / General Overhead',
      status: empStatus,
      eligible_for_rehire: eligibleForRehire,
      rehire_notes: rehireNotes,
      updated_at: new Date().toISOString()
    };

    if (!Array.isArray(this.db.employees)) {
      this.db.employees = [];
    }

    // Undelete if previously marked deleted
    if (Array.isArray(this.db.deleted_employee_ids)) {
      const eIdLow = String(empId).toLowerCase();
      const eNoLow = String(empObj.employee_no || '').toLowerCase();
      this.db.deleted_employee_ids = this.db.deleted_employee_ids.filter(id => {
        const idLow = String(id || '').toLowerCase();
        return idLow !== eIdLow && idLow !== eNoLow;
      });
    }
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('rayan_fin_deleted_employee_ids') || '[]');
        const eIdLow = String(empId).toLowerCase();
        const eNoLow = String(empObj.employee_no || '').toLowerCase();
        const updatedStored = stored.filter(id => {
          const idLow = String(id || '').toLowerCase();
          return idLow !== eIdLow && idLow !== eNoLow;
        });
        localStorage.setItem('rayan_fin_deleted_employee_ids', JSON.stringify(updatedStored));
      }
    } catch (e) { }

    if (isEdit) {
      let idx = this.db.employees.findIndex(em => em.id === rawId.trim());
      if (idx < 0) {
        idx = this.db.employees.findIndex(em => em.id === empId || em.employee_no === empObj.employee_no);
      }
      if (idx >= 0) {
        if (!empObj.photo && !this._empPhotoRemoved && this.db.employees[idx].photo) {
          empObj.photo = this.db.employees[idx].photo;
        }
        this.db.employees[idx] = { ...this.db.employees[idx], ...empObj };
      } else {
        this.db.employees.push(empObj);
      }
    } else {
      const existingIdx = this.db.employees.findIndex(em => em.employee_no === empObj.employee_no || em.id === empObj.id);
      if (existingIdx >= 0) {
        if (!empObj.photo && !this._empPhotoRemoved && this.db.employees[existingIdx].photo) {
          empObj.photo = this.db.employees[existingIdx].photo;
        }
        this.db.employees[existingIdx] = { ...this.db.employees[existingIdx], ...empObj };
      } else {
        this.db.employees.push(empObj);
      }
    }
    this._empPhotoRemoved = false;

    // Deduplicate employees by employee_no so collisions never persist
    const seenEmpNos = new Set();
    this.db.employees = this.db.employees.filter(em => {
      const key = (em.employee_no || em.id || '').toUpperCase();
      if (!key) return true;
      if (seenEmpNos.has(key)) return false;
      seenEmpNos.add(key);
      return true;
    });
    // Maintain ascending serial order by employee_no
    this.db.employees.sort((a, b) => (a.employee_no || '').localeCompare(b.employee_no || '', undefined, { numeric: true, sensitivity: 'base' }));

    // Cross-sync Employment Certificates and LOA
    if (Array.isArray(this.db.employment_certificates)) {
      this.db.employment_certificates.forEach(c => {
        if ((c.employee_id && c.employee_id === empObj.id) ||
          (c.employee_name_en && empObj.name && (c.employee_name_en.toLowerCase() === empObj.name.toLowerCase() || c.employee_name_en.toLowerCase().includes(empObj.name.toLowerCase()))) ||
          (c.passport_no && empObj.passport_no && c.passport_no === empObj.passport_no)) {
          c.employee_name_en = empObj.name;
          c.job_title_en = empObj.position;
          c.basic_salary = empObj.basic_salary;
          c.accommodation_allowance = empObj.accommodation_allowance;
          c.total_salary = empObj.basic_salary + empObj.accommodation_allowance;
        }
      });
    }

    const returnProfileId = this._editingFromProfileEmpId || (document.getElementById('fin-emp-profile-modal-backdrop') ? empObj.id : null);
    this._editingFromProfileEmpId = null;

    if (typeof this.saveDatabaseToCache === 'function') {
      this.saveDatabaseToCache();
    } else {
      if (typeof this.saveDatabaseToCache === 'function') { this.saveDatabaseToCache(); } else { try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (err) { } }
    }

    this.closeEmployeeModal();

    if (typeof this.showNotification === 'function') {
      this.showNotification(`✓ Employee "${empObj.name}" (${empObj.employee_no}) saved successfully!`, 'success');
    } else if (typeof this.showToast === 'function') {
      this.showToast(`✓ Employee "${empObj.name}" saved successfully!`, 'success');
    }

    // Sync with backend API
    try {
      if (typeof this.syncApi === 'function') {
        await this.syncApi('save_employee', { employee: empObj });
      } else if (typeof this.syncWithBackend === 'function') {
        await this.syncWithBackend('save_employee', { employee: empObj });
      }
    } catch (err) {
      console.warn('Employee backend sync warning:', err);
    }

    // Re-render active tab immediately
    if (this.activeTab === 'employees') {
      this.renderEmployeesTab((document.getElementById('fin-tab-content-root') || document.getElementById('fin-view-container')));
    } else if (typeof this.renderActiveTab === 'function') {
      this.renderActiveTab();
    }

    // If Employee Profile was open, update it in-place
    if (returnProfileId) {
      this.openEmployeeProfileModal(returnProfileId);
    }
  };

  proto.deleteEmployee = async function (empId) {
    const searchKey = String(empId).trim().toLowerCase();
    const emp = (this.db?.employees || []).find(e =>
      (e.id && String(e.id).trim().toLowerCase() === searchKey) ||
      (e.employee_no && String(e.employee_no).trim().toLowerCase() === searchKey)
    );
    if (!emp) return;

    const confirmed = (typeof window !== 'undefined' && typeof window.confirm === 'function')
      ? window.confirm(`Are you sure you want to delete employee "${emp.name}" (${emp.employee_no || ''})?`)
      : true;
    if (!confirmed) return;

    if (!Array.isArray(this.db.deleted_employee_ids)) {
      this.db.deleted_employee_ids = [];
    }
    const idKey = String(emp.id || '').trim().toLowerCase();
    const noKey = String(emp.employee_no || '').trim().toLowerCase();
    if (idKey && !this.db.deleted_employee_ids.includes(idKey)) {
      this.db.deleted_employee_ids.push(idKey);
    }
    if (noKey && !this.db.deleted_employee_ids.includes(noKey)) {
      this.db.deleted_employee_ids.push(noKey);
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('rayan_fin_deleted_employee_ids') || '[]');
        if (idKey && !stored.includes(idKey)) stored.push(idKey);
        if (noKey && !stored.includes(noKey)) stored.push(noKey);
        localStorage.setItem('rayan_fin_deleted_employee_ids', JSON.stringify(stored));
      }
    } catch (e) { }

    this.db.employees = (this.db.employees || []).filter(e => {
      const eId = String(e.id || '').trim().toLowerCase();
      const eNo = String(e.employee_no || '').trim().toLowerCase();
      return eId !== idKey && eNo !== noKey;
    });
    if (typeof this.saveDatabaseToCache === 'function') { this.saveDatabaseToCache(); } else { try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (err) { } }

    // Sync deletion with backend
    try {
      if (typeof this.syncApi === 'function') {
        await this.syncApi('delete_employee', { id: emp.id, employee_no: emp.employee_no });
      } else if (typeof this.syncWithBackend === 'function') {
        await this.syncWithBackend('delete_employee', { id: emp.id, employee_no: emp.employee_no });
      }
    } catch (err) {
      console.warn('Backend delete_employee sync error:', err);
    }

    if (typeof this.showNotification === 'function') {
      this.showNotification(`Employee "${emp.name}" deleted successfully.`, 'info');
    } else if (typeof this.showToast === 'function') {
      this.showToast(`Employee "${emp.name}" deleted successfully.`, 'info');
    }

    const tbody = document.getElementById('fin-emp-tbody');
    if (tbody && typeof this.renderEmployeeRowsHtml === 'function') {
      const activeEmps = (this.db.employees || []).filter(e => typeof this.matchesActiveCompany === 'function' ? this.matchesActiveCompany(e.company_id) : true);
      tbody.innerHTML = this.renderEmployeeRowsHtml(activeEmps);
    }

    if (typeof this.renderActiveTab === 'function') {
      this.renderActiveTab();
    } else {
      const root = document.getElementById('fin-tab-content-root') || (document.getElementById('fin-tab-content-root') || document.getElementById('fin-view-container'));
      if (root && typeof this.renderEmployeesTab === 'function') {
        this.renderEmployeesTab(root);
      }
    }
  };

  // ==========================================================================
  // 5. EXECUTIVE EMPLOYEE PROFILE & DOSSIER (LIKE PROJECT ACCOUNTS)
  // ==========================================================================
  proto.openEmployeeProfileModal = function (empId) {
    this.ensurePayrollSeedData();
    let emp = null;
    const employees = this.db?.employees || [];
    if (empId) {
      const searchKey = String(empId).trim().toLowerCase();
      emp = employees.find(e =>
        e.id === empId ||
        e.employee_no === empId ||
        String(e.id || '').toLowerCase() === searchKey ||
        String(e.employee_no || '').toLowerCase() === searchKey ||
        String(e.name || '').toLowerCase() === searchKey ||
        String(e.name || '').toLowerCase().includes(searchKey)
      );
    }
    if (!emp) {
      emp = employees[0];
    }
    if (!emp) {
      if (typeof this.showNotification === 'function') {
        this.showNotification('Employee record not found.', 'error');
      } else if (typeof this.showToast === 'function') {
        this.showToast('Employee record not found.', 'error');
      }
      return;
    }

    // Calculate all recorded salary payouts from payroll table
    const allSlips = (this.db?.payroll || []).filter(p => {
      return p.employee_id === emp.id ||
        (emp.employee_no && p.employee_no === emp.employee_no) ||
        (emp.name && p.employee_name && p.employee_name.toLowerCase().trim() === emp.name.toLowerCase().trim());
    });
    allSlips.sort((a, b) => new Date(b.payment_date || b.created_at || '1970-01-01') - new Date(a.payment_date || a.created_at || '1970-01-01'));

    const lifetimePaid = allSlips.filter(p => (p.status || '').toLowerCase() === 'paid')
      .reduce((sum, p) => sum + (Number(p.net_pay) || Number(p.transferred_amount) || Number(p.total_earnings) || 0), 0);

    const lifetimeDeductions = allSlips
      .reduce((sum, p) => sum + (Number(p.total_deductions) || 0), 0);

    const basic = Number(emp.basic_salary) || 0;
    const acc = Number(emp.accommodation_allowance) || 0;
    const cons = Number(emp.consolidated_allowance) || 0;
    const oth = Number(emp.other_allowance) || 0;
    const standardMonthly = basic + acc + cons + oth;

    // Service Tenure calculation
    let tenureStr = '---';
    if (emp.date_of_joining) {
      const start = new Date(emp.date_of_joining);
      if (!isNaN(start.getTime())) {
        const endDateObj = (emp.end_date || emp.resignation_date) ? new Date(emp.end_date || emp.resignation_date) : new Date();
        const end = !isNaN(endDateObj.getTime()) ? endDateObj : new Date();
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        if (months < 0) { years--; months += 12; }
        let parts = [];
        if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
        parts.push(`${months} mo${months !== 1 ? 's' : ''}`);
        tenureStr = parts.join(' ') || '< 1 mo';
        if (emp.end_date || emp.resignation_date) {
          tenureStr += ` (Ended: ${emp.end_date || emp.resignation_date})`;
        }
      }
    }

    const rawStatus = (emp.status || 'Active').trim();
    const statusLower = rawStatus.toLowerCase();
    const isAct = statusLower === 'active';
    const isResigned = statusLower === 'resigned';
    const isTerminated = statusLower === 'terminated';
    const isOnLeave = statusLower === 'on leave';

    // DISTINCT COLORING:
    let statusColor = '#94a3b8';
    let statusBg = 'rgba(148,163,184,0.14)';
    let statusBorder = 'rgba(148,163,184,0.3)';
    let statusLabel = rawStatus;

    if (isAct) {
      statusColor = '#10b981';
      statusBg = 'rgba(16,185,129,0.14)';
      statusBorder = 'rgba(16,185,129,0.35)';
      statusLabel = 'Active';
    } else if (isResigned) {
      statusColor = '#f59e0b';
      statusBg = 'rgba(245,158,11,0.16)';
      statusBorder = 'rgba(245,158,11,0.4)';
      statusLabel = 'Resigned';
    } else if (isTerminated) {
      statusColor = '#ef4444';
      statusBg = 'rgba(239,68,68,0.16)';
      statusBorder = 'rgba(239,68,68,0.45)';
      statusLabel = 'Terminated';
    } else if (isOnLeave) {
      statusColor = '#a855f7';
      statusBg = 'rgba(168,85,247,0.14)';
      statusBorder = 'rgba(168,85,247,0.35)';
      statusLabel = 'On Leave';
    }

    const isEligibleForRehire = emp.eligible_for_rehire !== 'no' && emp.eligible_for_rehire !== false;
    const rehireColor = isEligibleForRehire ? '#10b981' : '#ef4444';
    const rehireBg = isEligibleForRehire ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)';
    const rehireBorder = isEligibleForRehire ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)';

    const initials = (emp.name || 'EM').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const hasPhoto = Boolean(emp.photo);

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="fin-emp-profile-modal-backdrop">
        <div class="fin-modal-dialog" style="max-width:1080px; width:95%; max-height:92vh; background:#0d1527; border:1px solid rgba(56,189,248,0.3); box-shadow:0 25px 70px rgba(0,0,0,0.85), 0 0 50px rgba(0,153,230,0.15); display:flex; flex-direction:column; border-radius:18px; overflow:hidden;">
          
          <!-- Executive Profile Header (Like Project Accounts) -->
          <div class="fin-modal-header" style="background:linear-gradient(180deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%); padding:1.25rem 1.75rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div style="display:flex; align-items:center; gap:1.15rem; min-width:280px;">
              <!-- 84x84 Executive Avatar -->
              <div style="position:relative; width:84px; height:84px; border-radius:16px; overflow:hidden; background:#0f172a; border:2px solid rgba(56,189,248,0.5); flex-shrink:0; box-shadow:0 6px 20px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center;">
                ${hasPhoto ? `
                  <img src="${emp.photo}" alt="${escapeHtml(emp.name)}" style="width:100%; height:100%; object-fit:cover;">
                ` : `
                  <div style="width:100%; height:100%; background:linear-gradient(135deg, rgba(56,189,248,0.25) 0%, rgba(0,153,230,0.35) 100%); display:flex; align-items:center; justify-content:center; font-size:1.85rem; font-weight:800; color:#38bdf8;">
                    ${initials}
                  </div>
                `}
                <span style="position:absolute; bottom:4px; right:4px; width:12px; height:12px; border-radius:50%; background:${statusColor}; border:2px solid #0f172a;"></span>
              </div>

              <!-- Name & Primary Titles -->
              <div>
                <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:4px;">
                  <span style="font-family:monospace; font-size:0.85rem; font-weight:800; color:#38bdf8; background:rgba(56,189,248,0.12); padding:2px 8px; border-radius:6px; border:1px solid rgba(56,189,248,0.3);">
                    ${escapeHtml(emp.employee_no || 'EN---')}
                  </span>
                  <!-- Distinct Status Badge (Amber for Resigned, Red for Terminated, Green for Active) -->
                  <span style="font-size:0.72rem; padding:2px 9px; border-radius:12px; background:${statusBg}; color:${statusColor}; font-weight:800; border:1px solid ${statusBorder};">
                    ${escapeHtml(statusLabel)}${((isResigned || isTerminated) && (emp.end_date || emp.resignation_date)) ? ` • ${isTerminated ? 'Terminated' : 'Relieved'}: ${escapeHtml(emp.end_date || emp.resignation_date)}` : ''}
                  </span>
                  <span style="font-size:0.72rem; padding:2px 8px; border-radius:6px; background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.1);">
                    ${(emp.gender || '').toLowerCase() === 'female' ? '👩 Female' : '👨 Male'}
                  </span>
                  <!-- Rehire Eligibility Header Badge ONLY for former / inactive employees -->
                  ${(!isAct && (isResigned || isTerminated)) ? `
                    <span style="font-size:0.72rem; padding:2px 9px; border-radius:12px; background:${rehireBg}; color:${rehireColor}; font-weight:800; border:1px solid ${rehireBorder}; display:inline-flex; align-items:center; gap:4px; cursor:pointer;" onclick="window.finApp.toggleEmployeeRehireEligibility('${emp.id}')" title="Click to toggle rehire clearance">
                      <span>${isEligibleForRehire ? '✓' : '⛔'}</span> Rehire Eligible: <strong>${isEligibleForRehire ? 'YES' : 'NO'}</strong>
                    </span>
                  ` : ''}
                  <span style="font-size:0.72rem; padding:2px 8px; border-radius:6px; background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.1);">
                    ${escapeHtml(emp.department || 'Rayan Engineering')}
                  </span>
                </div>
                <h2 style="margin:0; font-size:1.35rem; font-weight:800; color:#f8fafc; line-height:1.2; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                  <span>${escapeHtml(emp.name || 'Unnamed')}</span>
                  ${emp.name_ar ? `<span style="font-family:'Amiri', serif; font-size:1.15rem; color:#94a3b8; font-weight:600;">(${escapeHtml(emp.name_ar)})</span>` : ''}
                </h2>
                <div style="font-size:0.82rem; color:#38bdf8; font-weight:600; margin-top:3px;">
                  ${escapeHtml(emp.position || emp.designation || 'Staff')}
                  ${emp.position_ar ? ` • <span style="font-family:'Amiri', serif; font-size:0.9rem; color:#cbd5e1;">${escapeHtml(emp.position_ar)}</span>` : ''}
                </div>
              </div>
            </div>

            <!-- Header Quick Action Buttons -->
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <button type="button" class="fin-btn-row-action" style="background:linear-gradient(135deg, rgba(16,185,129,0.22), rgba(56,189,248,0.22)); color:#10b981; border:1px solid rgba(16,185,129,0.45); padding:6px 12px; font-size:0.78rem; font-weight:700; cursor:pointer;" onclick="window.finApp.openQuickSalaryModal('${emp.id}')" title="Change or adjust salary &amp; allowances">
                💵 Edit Salary
              </button>
              <button type="button" class="fin-btn-row-action" style="background:rgba(56,189,248,0.18); color:#38bdf8; border:1px solid rgba(56,189,248,0.4); padding:6px 12px; font-size:0.78rem; font-weight:700; cursor:pointer;" onclick="window.finApp.openEmployeeModal('${emp.id}')" title="Edit Employee Profile">
                ✏️ Edit Profile
              </button>
              <button type="button" class="fin-btn-row-action" style="background:rgba(16,185,129,0.18); color:#10b981; border:1px solid rgba(16,185,129,0.4); padding:6px 12px; font-size:0.78rem; font-weight:700; cursor:pointer;" onclick="window.finApp.openRecordEmployeePaymentModal('${emp.id}')" title="Record Monthly Payout">
                💳 Record Payout
              </button>
              <button type="button" class="fin-btn-row-action" style="background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.15); padding:6px 10px; font-size:0.78rem; cursor:pointer;" onclick="window.finApp.openPayslipPrintModal('${emp.id}')" title="Open Pay Slip">
                📜 Pay Slip
              </button>
              <button type="button" class="fin-btn-row-action" style="background:rgba(14,165,233,0.15); color:#38bdf8; border:1px solid rgba(14,165,233,0.35); padding:6px 10px; font-size:0.78rem; font-weight:700; cursor:pointer;" onclick="window.finApp.openEmploymentCertificatePrintModal('${emp.id}')" title="Employment Certificate">
                🏛️ Emp Cert
              </button>
              <button type="button" class="fin-btn-row-action" style="background:rgba(99,102,241,0.15); color:#818cf8; border:1px solid rgba(99,102,241,0.35); padding:6px 10px; font-size:0.78rem; font-weight:700; cursor:pointer;" onclick="window.finApp.openLetterOfAssignmentPrintModal('${emp.id}')" title="Letter of Assignment">
                📄 Assignment
              </button>
              <button type="button" class="fin-btn-row-action" style="background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid rgba(245,158,11,0.35); padding:6px 10px; font-size:0.78rem; font-weight:700; cursor:pointer;" onclick="window.finApp.printEmployeeProfile('${emp.id}')" title="Print Complete Profile Dossier">
                🖨️ Print Profile
              </button>
              <button type="button" class="fin-modal-close" onclick="window.finApp.closeEmployeeProfileModal()" title="Close">&times;</button>
            </div>
          </div>

          <!-- Body Scroll Container -->
          <div class="fin-modal-body" style="padding:1.5rem 1.75rem; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:1.25rem;">
            
            <!-- 1. Executive Financial & Compensation Strip (6 KPIs Like Project Accounts) -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(155px, 1fr)); gap:0.85rem;">
              <div onclick="window.finApp.openQuickSalaryModal('${emp.id}')" style="background:rgba(15,23,42,0.6); border:1px solid rgba(56,189,248,0.3); border-radius:12px; padding:1rem; cursor:pointer; position:relative; transition:all 0.15s ease;" onmouseover="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 15px rgba(56,189,248,0.25)';" onmouseout="this.style.borderColor='rgba(56,189,248,0.3)'; this.style.boxShadow='none';" title="Click to change or adjust Monthly Basic Salary">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:0.7rem; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Monthly Basic</span>
                  <span style="font-size:0.65rem; color:#38bdf8; background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.3); padding:1px 6px; border-radius:4px; font-weight:700;">✏️ Edit</span>
                </div>
                <div style="font-size:1.35rem; font-weight:800; color:#f8fafc; margin-top:3px;">
                  ${this.formatCurrency(basic)}
                </div>
                <div style="font-size:0.68rem; color:#64748b;">Base contractual salary</div>
              </div>

              <div onclick="window.finApp.openQuickSalaryModal('${emp.id}')" style="background:rgba(15,23,42,0.6); border:1px solid rgba(56,189,248,0.3); border-radius:12px; padding:1rem; cursor:pointer; position:relative; transition:all 0.15s ease;" onmouseover="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 15px rgba(56,189,248,0.25)';" onmouseout="this.style.borderColor='rgba(56,189,248,0.3)'; this.style.boxShadow='none';" title="Click to change or adjust Allowances">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:0.7rem; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Allowances</span>
                  <span style="font-size:0.65rem; color:#38bdf8; background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.3); padding:1px 6px; border-radius:4px; font-weight:700;">✏️ Edit</span>
                </div>
                <div style="font-size:1.35rem; font-weight:800; color:#38bdf8; margin-top:3px;">
                  ${this.formatCurrency(acc + cons + oth)}
                </div>
                <div style="font-size:0.68rem; color:#64748b;">Acc: ${this.formatCurrency(acc)} ${(cons + oth) > 0 ? `• Oth: ${this.formatCurrency(cons + oth)}` : ''}</div>
              </div>

              <div onclick="window.finApp.openQuickSalaryModal('${emp.id}')" style="background:linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(15,23,42,0.6) 100%); border:1px solid rgba(16,185,129,0.45); border-radius:12px; padding:1rem; cursor:pointer; position:relative; transition:all 0.15s ease;" onmouseover="this.style.borderColor='#10b981'; this.style.boxShadow='0 0 15px rgba(16,185,129,0.3)';" onmouseout="this.style.borderColor='rgba(16,185,129,0.45)'; this.style.boxShadow='none';" title="Click to change or adjust total remuneration">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:0.7rem; color:#10b981; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Standard Gross Monthly</span>
                  <span style="font-size:0.65rem; color:#10b981; background:rgba(16,185,129,0.18); border:1px solid rgba(16,185,129,0.35); padding:1px 6px; border-radius:4px; font-weight:700;">✏️ Change</span>
                </div>
                <div style="font-size:1.45rem; font-weight:800; color:#10b981; margin-top:3px;">
                  ${this.formatCurrency(standardMonthly)}
                </div>
                <div style="font-size:0.68rem; color:#94a3b8;">Total remuneration per cycle</div>
              </div>

              <div style="background:linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(15,23,42,0.6) 100%); border:1px solid rgba(56,189,248,0.35); border-radius:12px; padding:1rem;">
                <span style="font-size:0.7rem; color:#38bdf8; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Lifetime Paid to Date</span>
                <div style="font-size:1.45rem; font-weight:800; color:#38bdf8; margin-top:3px;">
                  ${this.formatCurrency(lifetimePaid)}
                </div>
                <div style="font-size:0.68rem; color:#94a3b8;">${allSlips.length} payroll cycle(s) recorded</div>
              </div>

              <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1rem;">
                <span style="font-size:0.7rem; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Lifetime Deductions</span>
                <div style="font-size:1.35rem; font-weight:800; color:#f59e0b; margin-top:3px;">
                  ${this.formatCurrency(lifetimeDeductions)}
                </div>
                <div style="font-size:0.68rem; color:#64748b;">Advances, loans &amp; leaves</div>
              </div>

              <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1rem;">
                <span style="font-size:0.7rem; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Remittance Channel</span>
                <div style="font-size:0.95rem; font-weight:800; color:#c084fc; margin-top:4px; word-break:break-word;">
                  ${escapeHtml(emp.bank_name || 'Cash / RAYAN E-Wallets')}
                </div>
                <div style="font-size:0.68rem; color:#64748b; font-family:monospace; margin-top:2px;">
                  ${emp.iban ? emp.iban.slice(-8) : 'Direct payout'}
                </div>
              </div>
            </div>

            <!-- 2. Detailed 3-Card Information Grid -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(310px, 1fr)); gap:1rem;">
              
              <!-- Card A: Legal Identity & Immigration -->
              <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="font-size:0.85rem; font-weight:700; color:#10b981; margin-bottom:0.85rem; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:6px;">
                    <span>🪪</span>
                    <span>Legal Identity &amp; Immigration</span>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.6rem; font-size:0.82rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span style="color:#94a3b8;">Gender:</span>
                      <strong style="color:#f8fafc; font-size:0.85rem;">
                        ${(emp.gender || '').toLowerCase() === 'female' ? '👩 Female' : '👨 Male'}
                      </strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span style="color:#94a3b8;">Emirates ID (EID):</span>
                      <strong style="color:#f8fafc; font-family:monospace; font-size:0.85rem;">${escapeHtml(emp.emirates_id || 'Not Provided')}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span style="color:#94a3b8;">EID Expiry Date:</span>
                      <strong style="color:#cbd5e1; font-weight:700;">${escapeHtml(emp.eid_expiry_date || emp.visa_expiry_date || '---')}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span style="color:#94a3b8;">Passport Number:</span>
                      <strong style="color:#38bdf8; font-family:monospace; font-weight:700;">${escapeHtml(emp.passport_no || '---')}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span style="color:#94a3b8;">Passport Expiry Date:</span>
                      <strong style="color:#f59e0b; font-weight:700;">${escapeHtml(emp.passport_expiry_date || '---')}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span style="color:#94a3b8;">Nationality:</span>
                      <strong style="color:#e2e8f0;">${escapeHtml(emp.nationality || 'India')}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span style="color:#94a3b8;">Visa Status:</span>
                      <span style="background:rgba(56,189,248,0.12); color:#38bdf8; padding:2px 7px; border-radius:4px; font-size:0.75rem; font-weight:600; border:1px solid rgba(56,189,248,0.3);">
                        ${escapeHtml(emp.visa_status || 'Employment Visa')}
                      </span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span style="color:#94a3b8;">Labor Card / MoHRE No.:</span>
                      <strong style="color:#cbd5e1; font-family:monospace;">${escapeHtml(emp.labor_card_no || '---')}</strong>
                    </div>
                  </div>
                </div>
                <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:0.6rem; margin-top:0.75rem; font-size:0.75rem; color:#94a3b8; display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px;">
                  <span>Joined: <strong style="color:#cbd5e1;">${escapeHtml(emp.date_of_joining || '---')}</strong></span>
                  ${(emp.end_date || emp.resignation_date) ? `<span>End Date: <strong style="color:#ef4444;">${escapeHtml(emp.end_date || emp.resignation_date)}</strong></span>` : ''}
                  <span>Tenure: <strong style="color:${(emp.end_date || emp.resignation_date) ? '#f87171' : '#10b981'};">${tenureStr}</strong></span>
                </div>
                ${(emp.end_reason || emp.resignation_reason) ? `
                  <div style="font-size:0.72rem; color:#f87171; margin-top:4px; font-weight:600;">
                    Exit Remark: ${escapeHtml(emp.end_reason || emp.resignation_reason)}
                  </div>
                ` : ''}
                <!-- Rehire Policy Clearance Card (Shown ONLY for Exited/Former Employees) -->
                ${(!isAct && (isResigned || isTerminated)) ? `
                  <div style="background:${isEligibleForRehire ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'}; border:1px solid ${rehireBorder}; border-radius:8px; padding:0.75rem 0.95rem; margin-top:0.75rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div>
                      <div style="font-size:0.68rem; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Rehire Policy Clearance</div>
                      <div style="font-size:0.92rem; font-weight:800; color:${rehireColor}; margin-top:2px; display:flex; align-items:center; gap:6px;">
                        <span>${isEligibleForRehire ? '✅' : '⛔'}</span>
                        <span>Eligible for Rehire: <u>${isEligibleForRehire ? 'YES' : 'NO'}</u></span>
                      </div>
                      ${emp.rehire_notes ? `
                        <div style="font-size:0.72rem; color:#cbd5e1; margin-top:3px; line-height:1.35;">
                          <strong>Notes:</strong> ${escapeHtml(emp.rehire_notes)}
                        </div>
                      ` : ''}
                    </div>
                    <div>
                      <button type="button" class="fin-btn-row-action" style="background:${isEligibleForRehire ? 'rgba(239,68,68,0.18)' : 'rgba(16,185,129,0.18)'}; color:${isEligibleForRehire ? '#f87171' : '#10b981'}; border:1px solid ${isEligibleForRehire ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}; padding:5px 11px; font-size:0.74rem; font-weight:700; cursor:pointer; border-radius:6px;" onclick="window.finApp.toggleEmployeeRehireEligibility('${emp.id}')">
                        ${isEligibleForRehire ? 'Mark Ineligible (No)' : 'Mark Eligible (Yes)'}
                      </button>
                    </div>
                  </div>
                ` : `
                  <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:8px; padding:0.6rem 0.85rem; margin-top:0.75rem; display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.1rem;">🟢</span>
                    <div>
                      <div style="font-size:0.68rem; color:#94a3b8; font-weight:700; text-transform:uppercase;">Employment Status</div>
                      <div style="font-size:0.84rem; font-weight:800; color:#10b981;">Active Personnel (Currently Employed)</div>
                    </div>
                  </div>
                `}
              </div>

              <!-- Card B: Addresses & Contact Coordinates -->
              <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="font-size:0.85rem; font-weight:700; color:#38bdf8; margin-bottom:0.85rem; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:6px;">
                    <span>📍</span>
                    <span>Addresses &amp; Contact Coordinates</span>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.6rem; font-size:0.82rem;">
                    <div>
                      <span style="color:#94a3b8; display:block; font-size:0.72rem; margin-bottom:2px;">UAE Residential Address:</span>
                      <strong style="color:#f8fafc; font-size:0.82rem; line-height:1.35; display:block;">
                        ${escapeHtml(emp.address || emp.local_address || 'Musaffah M-14, Industrial Area, Abu Dhabi, UAE')}
                      </strong>
                    </div>
                    <div>
                      <span style="color:#94a3b8; display:block; font-size:0.72rem; margin-bottom:2px;">Permanent Home Country Address:</span>
                      <span style="color:#cbd5e1; font-size:0.8rem; line-height:1.35; display:block;">
                        ${escapeHtml(emp.permanent_address || '---')}
                      </span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
                      <span style="color:#94a3b8;">Phone / Mobile:</span>
                      <a href="tel:${escapeHtml(emp.phone || '')}" style="color:#38bdf8; font-weight:700; text-decoration:none;">${escapeHtml(emp.phone || '---')}</a>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span style="color:#94a3b8;">Official Email:</span>
                      <a href="mailto:${escapeHtml(emp.email || '')}" style="color:#cbd5e1; text-decoration:none;">${escapeHtml(emp.email || '---')}</a>
                    </div>
                  </div>
                </div>
                <div style="background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:0.6rem 0.8rem; margin-top:0.75rem;">
                  <div style="font-size:0.7rem; color:#f59e0b; font-weight:700; text-transform:uppercase;">🚨 Emergency Contact:</div>
                  <div style="font-size:0.78rem; color:#f8fafc; font-weight:600; margin-top:2px;">
                    ${escapeHtml(emp.emergency_contact_name || 'Emergency contact on record')} ${emp.emergency_contact_relation ? `(${escapeHtml(emp.emergency_contact_relation)})` : ''}
                  </div>
                  <div style="font-size:0.72rem; color:#94a3b8; font-family:monospace; margin-top:1px;">
                    ${escapeHtml(emp.emergency_contact_phone || emp.phone || '---')}
                  </div>
                </div>
              </div>

              <!-- Card C: Banking Coordinates & Project Allocation -->
              <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="font-size:0.85rem; font-weight:700; color:#c084fc; margin-bottom:0.85rem; padding-bottom:0.5rem; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:6px;">
                    <span>🏦</span>
                    <span>Banking &amp; Project Allocation</span>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.6rem; font-size:0.82rem;">
                    <div>
                      <span style="color:#94a3b8; display:block; font-size:0.72rem; margin-bottom:2px;">Corporate Bank / Channel:</span>
                      <strong style="color:#f8fafc; font-size:0.85rem;">${escapeHtml(emp.bank_name || 'Emirates NBD Bank PJSC / Cash')}</strong>
                    </div>
                    <div>
                      <span style="color:#94a3b8; display:block; font-size:0.72rem; margin-bottom:2px;">IBAN / Settlement Account:</span>
                      <strong style="color:#38bdf8; font-family:monospace; font-size:0.82rem; word-break:break-all;">
                        ${escapeHtml(emp.iban || emp.account_no || 'Direct via RAYAN E-Wallets / Cash')}
                      </strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span style="color:#94a3b8;">SWIFT / BIC Code:</span>
                      <strong style="color:#cbd5e1; font-family:monospace;">${escapeHtml(emp.swift || 'EBILAEADXXX')}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span style="color:#94a3b8;">Default Pay Method:</span>
                      <span style="font-size:0.75rem; color:#cbd5e1;">${escapeHtml(emp.default_pay_method || 'AED Host To Host / Wallets')}</span>
                    </div>
                    <div>
                      <span style="color:#94a3b8; display:block; font-size:0.72rem; margin-bottom:2px;">Current Project Assignment:</span>
                      <div style="background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); border-radius:6px; padding:5px 8px; font-weight:700; color:#38bdf8; font-size:0.78rem;">
                        🏗️ ${escapeHtml(emp.project_name || 'Corporate / General Overhead')}
                      </div>
                    </div>
                  </div>
                </div>
                <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:0.6rem; margin-top:0.75rem; font-size:0.74rem; color:#94a3b8;">
                  Allocated project costs automatically routed to project P&amp;L
                </div>
              </div>

            </div>

            <!-- 3. Complete Payouts & Salary History Ledger Table -->
            <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.75rem;">
                <div>
                  <h3 style="margin:0; font-size:1.05rem; font-weight:800; color:#f8fafc; display:flex; align-items:center; gap:8px;">
                    <span>💼</span>
                    <span>Official Salary Disbursements &amp; Payouts Ledger</span>
                  </h3>
                  <p style="margin:2px 0 0; font-size:0.75rem; color:#94a3b8;">
                    Complete historical record of monthly compensation slips, deductions, and bank / RAYAN E-Wallets settlements
                  </p>
                </div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <span style="font-size:0.78rem; color:#94a3b8; font-weight:600;">${allSlips.length} Cycles</span>
                  <button type="button" class="fin-btn-primary" style="background:#10b981; border-color:#10b981; font-size:0.78rem; padding:6px 12px; font-weight:700;" onclick="window.finApp.openRecordEmployeePaymentModal('${emp.id}')">
                    + Record Monthly Salary
                  </button>
                </div>
              </div>

              <!-- Payouts Table -->
              <div class="fin-table-responsive" style="overflow-x:auto;">
                <table class="fin-data-table" style="width:100%; border-collapse:collapse; font-size:0.82rem;">
                  <thead>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.3); text-align:left;">
                      <th style="padding:8px 10px; width:40px;">#</th>
                      <th style="padding:8px 10px;">Cycle / Period</th>
                      <th style="padding:8px 10px;">Pay Slip #</th>
                      <th style="padding:8px 10px;">Payment Date</th>
                      <th style="padding:8px 10px; text-align:right;">Basic Salary</th>
                      <th style="padding:8px 10px; text-align:right;">Allowances</th>
                      <th style="padding:8px 10px; text-align:right;">Deductions</th>
                      <th style="padding:8px 10px; text-align:right;">Net Payout</th>
                      <th style="padding:8px 10px;">Disbursement Channel</th>
                      <th style="padding:8px 10px; text-align:center;">Status</th>
                      <th style="padding:8px 10px; text-align:right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${allSlips.length === 0 ? `
                      <tr>
                        <td colspan="11" style="text-align:center; padding:2.5rem 1rem; color:#94a3b8;">
                          <div style="font-size:1.8rem; margin-bottom:0.4rem;">💳</div>
                          <div style="font-weight:700; color:#cbd5e1; font-size:0.95rem;">No Salary Payments Recorded Yet</div>
                          <div style="font-size:0.78rem; margin-top:3px; color:#64748b;">Click "+ Record Monthly Salary" above to create and disburse the first payroll slip.</div>
                        </td>
                      </tr>
                    ` : allSlips.map((slip, idx) => {
      const sBasic = Number(slip.basic_salary) || 0;
      const sAcc = Number(slip.accommodation_allowance) || 0;
      const sCons = Number(slip.consolidated_allowance) || 0;
      const sOt = Number(slip.normal_overtime) || 0;
      const sAllow = sAcc + sCons + sOt;
      const sDed = Number(slip.total_deductions) || 0;
      const sNet = Number(slip.net_pay) || Number(slip.total_earnings) || 0;
      const isPaid = (slip.status || 'Paid').toLowerCase() === 'paid';
      const pStatusColor = isPaid ? '#10b981' : '#f59e0b';
      const pStatusBg = isPaid ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)';

      return `
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                          <td style="padding:8px 10px; color:#64748b; font-size:0.75rem;">${idx + 1}</td>
                          <td style="padding:8px 10px; font-weight:700; color:#f8fafc;">
                            ${escapeHtml(slip.period_label || slip.month_year || '---')}
                          </td>
                          <td style="padding:8px 10px;">
                            <strong style="color:#38bdf8; font-family:monospace; font-size:0.8rem;">
                              ${escapeHtml(slip.slip_no || '---')}
                            </strong>
                          </td>
                          <td style="padding:8px 10px; color:#cbd5e1; font-size:0.78rem;">
                            ${escapeHtml(slip.payment_date || slip.printed_date || '---')}
                          </td>
                          <td style="padding:8px 10px; text-align:right; color:#e2e8f0;">
                            ${this.formatCurrency(sBasic)}
                          </td>
                          <td style="padding:8px 10px; text-align:right; color:#38bdf8;">
                            ${this.formatCurrency(sAllow)}
                          </td>
                          <td style="padding:8px 10px; text-align:right; color:${sDed > 0 ? '#ef4444' : '#64748b'};">
                            ${sDed > 0 ? '-' + this.formatCurrency(sDed) : 'AED 0.00'}
                          </td>
                          <td style="padding:8px 10px; text-align:right;">
                            <strong style="color:#10b981; font-size:0.92rem; font-weight:800;">
                              ${this.formatCurrency(sNet)}
                            </strong>
                          </td>
                          <td style="padding:8px 10px;">
                            <div style="font-size:0.78rem; color:#f1f5f9; font-weight:600;">
                              ${escapeHtml(slip.payout_source_name || slip.pay_method || 'Bank Transfer')}
                            </div>
                            ${slip.payout_reference ? `<div style="font-size:0.68rem; color:#64748b; font-family:monospace;">Ref: ${escapeHtml(slip.payout_reference)}</div>` : ''}
                          </td>
                          <td style="padding:8px 10px; text-align:center;">
                            <span style="display:inline-block; padding:2px 8px; border-radius:10px; font-size:0.7rem; font-weight:700; color:${pStatusColor}; background:${pStatusBg}; border:1px solid ${pStatusColor}40;">
                              ${escapeHtml(slip.status || 'Paid')}
                            </span>
                          </td>
                          <td style="padding:8px 10px; text-align:right;">
                            <div style="display:inline-flex; gap:4px; align-items:center; justify-content:flex-end;">
                              <button type="button" class="fin-btn-row-action" style="background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.12); padding:3px 7px; font-size:0.72rem; cursor:pointer;" onclick="window.finApp.openPayslipPrintModal('${slip.id}')" title="Print Official Pay Slip">
                                📜 Slip
                              </button>
                              ${!isPaid ? `
                                <button type="button" class="fin-btn-row-action" style="background:rgba(16,185,129,0.18); color:#10b981; border:1px solid rgba(16,185,129,0.4); padding:3px 7px; font-size:0.72rem; font-weight:700; cursor:pointer;" onclick="window.finApp.openDisburseSalaryModal('${slip.id}')" title="Disburse & Deduct">
                                  💳 Pay
                                </button>
                              ` : ''}
                            </div>
                          </td>
                        </tr>
                      `;
    }).join('')}
                  </tbody>
                  ${allSlips.length > 0 ? `
                    <tfoot>
                      <tr style="border-top:2px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.4); font-weight:800;">
                        <td colspan="4" style="padding:10px; color:#f8fafc; font-size:0.82rem; text-transform:uppercase;">
                          Grand Totals (${allSlips.length} Cycles):
                        </td>
                        <td style="padding:10px; text-align:right; color:#e2e8f0;">
                          ${this.formatCurrency(allSlips.reduce((acc, s) => acc + (Number(s.basic_salary) || 0), 0))}
                        </td>
                        <td style="padding:10px; text-align:right; color:#38bdf8;">
                          ${this.formatCurrency(allSlips.reduce((acc, s) => acc + (Number(s.accommodation_allowance) || 0) + (Number(s.consolidated_allowance) || 0) + (Number(s.normal_overtime) || 0), 0))}
                        </td>
                        <td style="padding:10px; text-align:right; color:#ef4444;">
                          ${this.formatCurrency(lifetimeDeductions)}
                        </td>
                        <td style="padding:10px; text-align:right; color:#10b981; font-size:0.95rem;">
                          ${this.formatCurrency(lifetimePaid)}
                        </td>
                        <td colspan="3" style="padding:10px; text-align:right; color:#94a3b8; font-size:0.75rem;">
                          Audited Corporate Payouts Ledger
                        </td>
                      </tr>
                    </tfoot>
                  ` : ''}
                </table>
              </div>
            </div>

            <!-- Footer Action Bar -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.08); padding-top:1rem; flex-wrap:wrap; gap:0.75rem;">
              <div style="font-size:0.75rem; color:#94a3b8;">
                Employee record: <strong style="color:#f1f5f9;">${escapeHtml(emp.name)}</strong> (${escapeHtml(emp.employee_no)}) • Updated ${new Date().toLocaleDateString('en-GB')}
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="fin-btn-secondary" onclick="window.finApp.closeEmployeeProfileModal()">
                  Close
                </button>
                <button type="button" class="fin-btn-primary" style="background:#10b981; border-color:#10b981; font-weight:700;" onclick="window.finApp.openRecordEmployeePaymentModal('${emp.id}')">
                  💳 Record Monthly Salary
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    this.showCustomModal(modalHtml);
  };

  proto.closeEmployeeProfileModal = function () {
    this.closeCustomModal('fin-emp-profile-modal-backdrop');
  };

  proto.openQuickSalaryModal = function (empId) {
    let emp = null;
    const employees = this.db?.employees || [];
    if (empId) {
      const searchKey = String(empId).trim().toLowerCase();
      emp = employees.find(e =>
        (e.id && String(e.id).trim().toLowerCase() === searchKey) ||
        (e.employee_no && String(e.employee_no).trim().toLowerCase() === searchKey)
      );
    }
    if (!emp) emp = employees[0];
    if (!emp) {
      alert('Employee record not found.');
      return;
    }

    const basic = Number(emp.basic_salary) || 0;
    const acc = Number(emp.accommodation_allowance) || 0;
    const oth = Number(emp.other_allowance) || 0;
    const gross = basic + acc + oth;

    // Remove any existing quick modal
    const existing = document.getElementById('fin-quick-salary-modal-backdrop');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'fin-quick-salary-modal-backdrop';
    modal.className = 'fin-modal-backdrop open';
    modal.style.cssText = 'position:fixed; inset:0; z-index:100050; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.8); backdrop-filter:blur(6px); padding:1rem;';

    modal.innerHTML = `
      <div class="fin-modal-dialog" style="max-width:540px; width:100%; background:#0d1527; border:1px solid rgba(56,189,248,0.4); border-radius:16px; box-shadow:0 25px 70px rgba(0,0,0,0.9), 0 0 40px rgba(56,189,248,0.2); overflow:hidden; display:flex; flex-direction:column; animation:fadeIn 0.15s ease-out;">
        <!-- Modal Header -->
        <div style="background:linear-gradient(180deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%); padding:1.15rem 1.4rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(56,189,248,0.25) 100%); border:1px solid rgba(16,185,129,0.35); display:flex; align-items:center; justify-content:center; font-size:1.25rem;">💵</div>
            <div>
              <h3 style="margin:0; font-size:1.1rem; font-weight:800; color:#f8fafc;">Change Monthly Salary &amp; Allowances</h3>
              <p style="margin:2px 0 0; font-size:0.74rem; color:#94a3b8;">
                <strong style="color:#38bdf8;">${escapeHtml(emp.name)}</strong> (${escapeHtml(emp.employee_no || '')}) • ${escapeHtml(emp.position || 'Staff')}
              </p>
            </div>
          </div>
          <button type="button" class="fin-modal-close" onclick="document.getElementById('fin-quick-salary-modal-backdrop')?.remove()" style="font-size:1.4rem; color:#94a3b8; background:none; border:none; cursor:pointer; line-height:1;">&times;</button>
        </div>

        <!-- Form Body -->
        <form id="fin-quick-salary-form" onsubmit="window.finApp.saveQuickSalary(event, '${emp.id}')" style="padding:1.4rem; display:flex; flex-direction:column; gap:1.1rem;">
          <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem; display:flex; flex-direction:column; gap:0.85rem;">
            <div class="fin-form-group" style="margin-bottom:0;">
              <label class="fin-field-label" style="display:flex; justify-content:space-between;">
                <span>Monthly Basic Salary (${emp.currency || 'AED'}) <span style="color:#ef4444;">*</span></span>
                <span style="color:#64748b; font-weight:normal; font-size:0.7rem;">Contractual Base</span>
              </label>
              <input type="number" step="0.01" id="quick-salary-basic" class="fin-form-input" value="${basic}" required placeholder="0.00" oninput="window.finApp.calcQuickSalaryGross()" style="font-weight:700; font-size:1rem; color:#f8fafc;">
            </div>

            <div class="fin-form-group" style="margin-bottom:0;">
              <label class="fin-field-label" style="display:flex; justify-content:space-between;">
                <span>Accommodation Allowance (${emp.currency || 'AED'})</span>
                <span style="color:#64748b; font-weight:normal; font-size:0.7rem;">Housing element</span>
              </label>
              <input type="number" step="0.01" id="quick-salary-acc" class="fin-form-input" value="${acc}" placeholder="0.00" oninput="window.finApp.calcQuickSalaryGross()" style="font-weight:700; font-size:1rem; color:#38bdf8;">
            </div>

            <div class="fin-form-group" style="margin-bottom:0;">
              <label class="fin-field-label" style="display:flex; justify-content:space-between;">
                <span>Other / Transport / Site Allowance (${emp.currency || 'AED'})</span>
                <span style="color:#64748b; font-weight:normal; font-size:0.7rem;">Utilities, food, transport</span>
              </label>
              <input type="number" step="0.01" id="quick-salary-oth" class="fin-form-input" value="${oth}" placeholder="0.00" oninput="window.finApp.calcQuickSalaryGross()" style="font-weight:700; font-size:1rem; color:#f59e0b;">
            </div>
          </div>

          <!-- Live Standard Gross Summary Banner -->
          <div style="background:linear-gradient(90deg, rgba(16,185,129,0.18) 0%, rgba(56,189,248,0.12) 100%); border:1px solid rgba(16,185,129,0.35); border-radius:10px; padding:0.9rem 1.15rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.7rem; color:#cbd5e1; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Calculated Monthly Gross Total</div>
              <div style="font-size:0.72rem; color:#94a3b8;">Sum of Basic + Accommodation + Other Allowances</div>
            </div>
            <strong id="quick-salary-gross-preview" style="font-size:1.35rem; font-weight:800; color:#10b981;">
              ${this.formatCurrency(gross, emp.currency || 'AED')}
            </strong>
          </div>

          <!-- Buttons -->
          <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.35rem;">
            <button type="button" class="fin-btn-secondary" onclick="document.getElementById('fin-quick-salary-modal-backdrop')?.remove()">
              Cancel
            </button>
            <button type="submit" id="quick-salary-save-btn" class="fin-btn-primary" style="background:#10b981; border-color:#10b981; font-weight:700; padding:8px 18px;">
              💾 Save &amp; Update Salary
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => {
      document.getElementById('quick-salary-basic')?.focus();
      document.getElementById('quick-salary-basic')?.select();
    }, 50);
  };

  proto.calcQuickSalaryGross = function () {
    const basic = parseFloat(document.getElementById('quick-salary-basic')?.value) || 0;
    const acc = parseFloat(document.getElementById('quick-salary-acc')?.value) || 0;
    const oth = parseFloat(document.getElementById('quick-salary-oth')?.value) || 0;
    const total = basic + acc + oth;
    const el = document.getElementById('quick-salary-gross-preview');
    if (el) {
      el.textContent = (typeof this.formatCurrency === 'function') ? this.formatCurrency(total) : ('AED ' + total.toFixed(2));
    }
  };

  proto.saveQuickSalary = async function (e, empId) {
    if (e && e.preventDefault) e.preventDefault();
    const btn = document.getElementById('quick-salary-save-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⏳</span> Saving...';
    }

    const searchKey = String(empId).trim().toLowerCase();
    const emp = (this.db?.employees || []).find(em =>
      em.id === empId ||
      em.employee_no === empId ||
      String(em.id || '').toLowerCase() === searchKey ||
      String(em.employee_no || '').toLowerCase() === searchKey
    );

    if (!emp) {
      alert('Employee record not found.');
      return;
    }

    const basic = parseFloat(document.getElementById('quick-salary-basic')?.value) || 0;
    const acc = parseFloat(document.getElementById('quick-salary-acc')?.value) || 0;
    const oth = parseFloat(document.getElementById('quick-salary-oth')?.value) || 0;

    emp.basic_salary = basic;
    emp.accommodation_allowance = acc;
    emp.other_allowance = oth;
    emp.consolidated_allowance = 0;
    emp.updated_at = new Date().toISOString();

    // Cross-sync to employment certificates
    if (Array.isArray(this.db.employment_certificates)) {
      this.db.employment_certificates.forEach(c => {
        if ((c.employee_id && c.employee_id === emp.id) ||
          (c.employee_name_en && emp.name && (c.employee_name_en.toLowerCase() === emp.name.toLowerCase() || c.employee_name_en.toLowerCase().includes(emp.name.toLowerCase()))) ||
          (c.passport_no && emp.passport_no && c.passport_no === emp.passport_no)) {
          c.basic_salary = basic;
          c.accommodation_allowance = acc;
          c.total_salary = basic + acc;
        }
      });
    }

    if (typeof this.saveDatabaseToCache === 'function') {
      this.saveDatabaseToCache();
    } else {
      if (typeof this.saveDatabaseToCache === 'function') { this.saveDatabaseToCache(); } else { try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (err) { } }
    }

    // Close quick modal
    document.getElementById('fin-quick-salary-modal-backdrop')?.remove();

    if (typeof this.showNotification === 'function') {
      this.showNotification(`✓ Salary for ${emp.name} updated to ${this.formatCurrency(basic + acc + oth, emp.currency || 'AED')} successfully!`, 'success');
    } else if (typeof this.showToast === 'function') {
      this.showToast(`✓ Salary updated successfully!`, 'success');
    }

    // Re-render Profile Modal immediately if open
    const profBackdrop = document.getElementById('fin-emp-profile-modal-backdrop');
    if (profBackdrop) {
      this.openEmployeeProfileModal(emp.id);
    }

    // Re-render Directory table if active
    if (this.activeTab === 'employees') {
      const root = document.getElementById('fin-tab-content-root') || document.getElementById('fin-view-container');
      if (root) this.renderEmployeesTab(root);
    }

    // Sync with backend API
    try {
      if (typeof this.syncApi === 'function') {
        await this.syncApi('save_employee', { employee: emp });
      } else if (typeof this.syncWithBackend === 'function') {
        await this.syncWithBackend('save_employee', { employee: emp });
      }
    } catch (err) {
      console.warn('Salary backend sync warning:', err);
    }

    // Ensure profile & directory reflect updated state after backend sync
    if (document.getElementById('fin-emp-profile-modal-backdrop')) {
      this.openEmployeeProfileModal(emp.id);
    }
    if (this.activeTab === 'employees') {
      const root = document.getElementById('fin-tab-content-root') || document.getElementById('fin-view-container');
      if (root) this.renderEmployeesTab(root);
    }
  };

  proto.printEmployeeProfile = function (empId) {
    const emp = (this.db?.employees || []).find(e => e.id === empId || e.employee_no === empId);
    if (!emp) return;

    const allSlips = (this.db?.payroll || []).filter(p => {
      return p.employee_id === emp.id ||
        (emp.employee_no && p.employee_no === emp.employee_no) ||
        (emp.name && p.employee_name && p.employee_name.toLowerCase().trim() === emp.name.toLowerCase().trim());
    });
    allSlips.sort((a, b) => new Date(b.payment_date || b.created_at || '1970-01-01') - new Date(a.payment_date || a.created_at || '1970-01-01'));

    const basic = Number(emp.basic_salary) || 0;
    const acc = Number(emp.accommodation_allowance) || 0;
    const oth = Number(emp.other_allowance) || 0;
    const totalStandard = basic + acc + oth;
    const lifetimePaid = allSlips.filter(p => (p.status || '').toLowerCase() === 'paid')
      .reduce((sum, p) => sum + (Number(p.net_pay) || Number(p.total_earnings) || 0), 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the Employee Profile Dossier.');
      return;
    }

    const printDocHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Employee Dossier - ${escapeHtml(emp.employee_no)} - ${escapeHtml(emp.name)}</title>
        <style>
          @page { size: A4 portrait; margin: 12mm 15mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; margin: 0; padding: 0; font-size: 10.5pt; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px; }
          .company-name { font-size: 13pt; font-weight: 800; color: #0f172a; text-transform: uppercase; }
          .doc-title { font-size: 15pt; font-weight: 800; color: #0284c7; margin-top: 4px; }
          .profile-card { display: flex; gap: 16px; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px; }
          .avatar-box { width: 80px; height: 80px; border-radius: 8px; border: 1px solid #cbd5e1; overflow: hidden; background: #e2e8f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 800; font-size: 20pt; color: #0284c7; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
          .kpi-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; }
          .kpi-label { font-size: 7.5pt; color: #64748b; font-weight: 700; text-transform: uppercase; }
          .kpi-val { font-size: 12pt; font-weight: 800; color: #0f172a; margin-top: 2px; }
          .section-title { font-size: 10.5pt; font-weight: 800; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 14px 0 8px 0; }
          table.data-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 14px; }
          table.data-table th, table.data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          table.data-table th { background: #f1f5f9; font-weight: 700; color: #334155; }
          .text-right { text-align: right; }
          .footer { font-size: 8pt; color: #64748b; text-align: center; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company-name">RAYAN ENGINEERING AND CONTRACTING LLC SPC</div>
            <div style="font-size: 8pt; color: #64748b;">Abu Dhabi, United Arab Emirates • TRN: 104937380400003</div>
            <div class="doc-title">OFFICIAL EMPLOYEE PROFILE &amp; COMPENSATION DOSSIER</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12pt; font-weight: 800; color: #0284c7; font-family: monospace;">${escapeHtml(emp.employee_no)}</div>
            <div style="font-size: 8pt; color: #64748b;">Printed: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div class="profile-card">
          <div class="avatar-box">
            ${emp.photo ? `<img src="${emp.photo}" style="width:100%; height:100%; object-fit:cover;">` : (emp.name || 'EM').slice(0, 2).toUpperCase()}
          </div>
          <div style="flex: 1;">
            <div style="font-size: 13pt; font-weight: 800; color: #0f172a;">${escapeHtml(emp.name)} ${emp.name_ar ? `(${escapeHtml(emp.name_ar)})` : ''}</div>
            <div style="font-size: 9.5pt; font-weight: 700; color: #0284c7; margin: 2px 0;">${escapeHtml(emp.position || emp.designation || 'Staff')} • ${escapeHtml(emp.department || 'Rayan')}</div>
            <div style="font-size: 8pt; color: #475569;">
              Status: <strong>${escapeHtml(emp.status || 'Active')}</strong> • Joining Date: <strong>${escapeHtml(emp.date_of_joining || '---')}</strong> • Project: <strong>${escapeHtml(emp.project_name || 'Corporate Overhead')}</strong>
            </div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-box">
            <div class="kpi-label">Basic Monthly</div>
            <div class="kpi-val">${this.formatCurrency(basic)}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Allowances Monthly</div>
            <div class="kpi-val">${this.formatCurrency(acc + oth)}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Total Standard Monthly</div>
            <div class="kpi-val" style="color: #059669;">${this.formatCurrency(totalStandard)}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Lifetime Salary Paid</div>
            <div class="kpi-val" style="color: #0284c7;">${this.formatCurrency(lifetimePaid)}</div>
          </div>
        </div>

        <div class="section-title">1. Legal Identity, Passports &amp; Bank Coordinates</div>
        <table class="data-table">
          <tr>
            <th style="width:20%;">Emirates ID (EID)</th>
            <td style="width:30%; font-family:monospace; font-weight:700;">${escapeHtml(emp.emirates_id || '---')}</td>
            <th style="width:20%;">EID Expiry Date</th>
            <td style="width:30%; font-weight:700;">${escapeHtml(emp.eid_expiry_date || emp.visa_expiry_date || '---')}</td>
          </tr>
          <tr>
            <th>Passport No.</th>
            <td style="font-family:monospace; font-weight:700;">${escapeHtml(emp.passport_no || '---')} (${escapeHtml(emp.nationality || 'India')})</td>
            <th>Passport Expiry Date</th>
            <td style="font-weight:700; color:#b45309;">${escapeHtml(emp.passport_expiry_date || '---')}</td>
          </tr>
          <tr>
            <th>Gender</th>
            <td style="font-weight:700;">${(emp.gender || '').toLowerCase() === 'female' ? '👩 Female' : '👨 Male'}</td>
            <th>Visa Status</th>
            <td>${escapeHtml(emp.visa_status || 'Employment Visa')}</td>
          </tr>
          <tr>
            <th>Labor Card No.</th>
            <td style="font-family:monospace;">${escapeHtml(emp.labor_card_no || '---')}</td>
            <th>Payment Channel</th>
            <td>${escapeHtml(emp.default_pay_method || 'Bank Transfer')}</td>
          </tr>
          <tr>
            <th>Payment Channel</th>
            <td>${escapeHtml(emp.default_pay_method || 'Bank Transfer')}</td>
            <th>Bank Name</th>
            <td>${escapeHtml(emp.bank_name || 'Cash / On-Hand')}</td>
          </tr>
          <tr>
            <th>IBAN / Account</th>
            <td style="font-family:monospace; font-weight:600;" colspan="${(emp.status === 'Resigned' || emp.status === 'Terminated') ? '1' : '3'}">${escapeHtml(emp.iban || emp.account_no || '---')}</td>
            ${(emp.status === 'Resigned' || emp.status === 'Terminated') ? `
            <th>Rehire Eligibility</th>
            <td style="font-weight:700; color:${emp.eligible_for_rehire === 'no' || emp.eligible_for_rehire === false ? '#dc2626' : '#16a34a'};">
              ${emp.eligible_for_rehire === 'no' || emp.eligible_for_rehire === false ? '⛔ INELIGIBLE (Do Not Rehire)' : '✅ ELIGIBLE FOR REHIRE (Approved)'}
            </td>` : ''}
          </tr>
          ${(emp.status === 'Resigned' || emp.status === 'Terminated') ? `
          <tr>
            <th>Exit / Departure Date</th>
            <td style="font-weight:700; color:#dc2626;">${escapeHtml(emp.end_date || emp.resignation_date || '---')}</td>
            <th>Exit / Rehire Remarks</th>
            <td>${escapeHtml(emp.rehire_notes || emp.end_reason || 'Clearance on file in accordance with corporate HR policy')}</td>
          </tr>` : ''}
        </table>

        <div class="section-title">2. Residential Addresses &amp; Emergency Contacts</div>
        <table class="data-table">
          <tr>
            <th style="width:25%;">UAE Residential Address</th>
            <td style="width:75%;">${escapeHtml(emp.address || emp.local_address || '---')}</td>
          </tr>
          <tr>
            <th>Permanent Home Country Address</th>
            <td>${escapeHtml(emp.permanent_address || '---')}</td>
          </tr>
          <tr>
            <th>Contact Phone &amp; Email</th>
            <td>Phone: <strong>${escapeHtml(emp.phone || '---')}</strong> • Email: <strong>${escapeHtml(emp.email || '---')}</strong></td>
          </tr>
          <tr>
            <th>Emergency Contact</th>
            <td><strong>${escapeHtml(emp.emergency_contact_name || '---')}</strong> ${emp.emergency_contact_relation ? `(${escapeHtml(emp.emergency_contact_relation)})` : ''} • Phone: <strong>${escapeHtml(emp.emergency_contact_phone || '---')}</strong></td>
          </tr>
        </table>

        <div class="section-title">3. Official Salary Disbursements &amp; Payouts History (${allSlips.length} Cycles)</div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:30px;">#</th>
              <th>Period / Month</th>
              <th>Slip #</th>
              <th>Payment Date</th>
              <th class="text-right">Basic</th>
              <th class="text-right">Allowances</th>
              <th class="text-right">Deductions</th>
              <th class="text-right">Net Paid</th>
              <th>Disbursement Source</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${allSlips.length === 0 ? '<tr><td colspan="10" style="text-align:center; color:#64748b; padding:12px;">No salary disbursements recorded to date.</td></tr>' : allSlips.map((s, i) => `
              <tr>
                <td>${i + 1}</td>
                <td style="font-weight:700;">${escapeHtml(s.period_label || s.month_year || '---')}</td>
                <td style="font-family:monospace; font-weight:600;">${escapeHtml(s.slip_no || '---')}</td>
                <td>${escapeHtml(s.payment_date || '---')}</td>
                <td class="text-right">${this.formatCurrency(s.basic_salary || 0)}</td>
                <td class="text-right">${this.formatCurrency((Number(s.accommodation_allowance) || 0) + (Number(s.consolidated_allowance) || 0) + (Number(s.normal_overtime) || 0))}</td>
                <td class="text-right" style="color:#ef4444;">${this.formatCurrency(s.total_deductions || 0)}</td>
                <td class="text-right" style="font-weight:800; color:#059669;">${this.formatCurrency(s.net_pay || s.total_earnings || 0)}</td>
                <td>${escapeHtml(s.payout_source_name || s.pay_method || 'Bank Transfer')}</td>
                <td style="font-weight:700;">${escapeHtml(s.status || 'Paid')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Confidential Personnel Record • RAYAN ENGINEERING AND CONTRACTING LLC SPC • Generated via Corporate Accounts Portal
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printDocHtml);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  };


  proto.openEmployeeSalaryHistoryModal = function (empId, periodFilter = '3m') {
    this.ensurePayrollSeedData();
    this.lastEmployeeHistoryFilter = periodFilter;
    const emp = (this.db?.employees || []).find(e => e.id === empId || e.employee_no === empId);
    if (!emp) {
      this.showToast ? this.showToast('Employee not found', 'error') : alert('Employee not found');
      return;
    }

    const empSlips = (this.db?.payroll || []).filter(p => {
      if (!this.matchesActiveCompany(p.company_id)) return false;
      return p.employee_id === emp.id || (emp.employee_no && p.employee_no === emp.employee_no);
    });

    const periods = getPeriodsForEmployee(emp, periodFilter, empSlips);

    const basic = Number(emp.basic_salary) || 0;
    const acc = Number(emp.accommodation_allowance) || 0;
    const cons = Number(emp.consolidated_allowance) || 0;
    const oth = Number(emp.other_allowance) || 0;
    const totalStandard = basic + acc + cons + oth;

    // Calculate metrics for the period
    let periodPaidCount = 0;
    let periodUnpaidCount = 0;
    let periodTotalPaid = 0;
    let periodTotalPending = 0;

    periods.forEach(p => {
      const slip = empSlips.find(s => doesSlipMatchPeriod(s, p));
      if (slip) {
        if ((slip.status || '').toLowerCase() === 'paid') {
          periodPaidCount++;
          periodTotalPaid += Number(slip.net_pay || slip.transferred_amount || 0);
        } else {
          periodUnpaidCount++;
          periodTotalPending += Number(slip.net_pay || slip.total_earnings || 0);
        }
      } else {
        periodUnpaidCount++;
        periodTotalPending += totalStandard;
      }
    });

    // Generate Month Cards
    const cardsHtml = periods.map(p => {
      const slip = empSlips.find(s => doesSlipMatchPeriod(s, p));
      if (slip) {
        const isPaid = (slip.status || '').toLowerCase() === 'paid';
        const netAmount = Number(slip.net_pay || slip.transferred_amount || 0);
        const slipEarn = Number(slip.total_earnings) || (Number(slip.basic_salary || 0) + Number(slip.accommodation_allowance || 0) + Number(slip.consolidated_allowance || 0) + Number(slip.normal_overtime || 0));
        const slipDed = Number(slip.total_deductions) || 0;
        const sourceLabel = slip.payout_source_type === 'cash'
          ? `💵 RAYAN E-Wallets (${escapeHtml(slip.payout_source_name || 'RAYAN E-Wallets')})`
          : `🏦 ${escapeHtml(slip.payout_source_name || slip.bank_name || 'Bank Account')}`;

        return `
          <div style="background:${isPaid ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)'}; border:1px solid ${isPaid ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}; border-radius:12px; padding:1.25rem; margin-bottom:1rem; transition:all 0.2s ease;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.75rem; margin-bottom:0.75rem;">
              <div>
                <div style="display:flex; align-items:center; gap:0.6rem;">
                  <span style="font-size:1.1rem; font-weight:800; color:#f8fafc;">🗓️ ${escapeHtml(p.full)}</span>
                  <span style="font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:10px; background:${isPaid ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.18)'}; color:${isPaid ? '#10b981' : '#f59e0b'}; border:1px solid ${isPaid ? '#10b981' : '#f59e0b'}40;">
                    ${isPaid ? '✓ PAID & DEDUCTED' : '⏳ PENDING PAYOUT'}
                  </span>
                </div>
                <div style="font-size:0.78rem; color:#94a3b8; margin-top:3px;">
                  Pay Slip #: <strong style="color:#38bdf8; font-family:monospace;">${escapeHtml(slip.slip_no)}</strong>
                  • Date: <strong>${escapeHtml(slip.payment_date || slip.printed_date || '---')}</strong>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.75rem; color:#94a3b8; font-weight:600;">Net Salary ${isPaid ? 'Paid' : 'Payable'}:</div>
                <div style="font-size:1.35rem; font-weight:800; color:${isPaid ? '#10b981' : '#f59e0b'};">
                  ${formatMoney(netAmount, slip.currency || 'AED')}
                </div>
              </div>
            </div>

            <!-- Breakdown Pills -->
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.85rem; font-size:0.75rem; background:rgba(15,23,42,0.4); padding:0.65rem 0.85rem; border-radius:8px; border:1px solid rgba(255,255,255,0.04);">
              <span style="color:#cbd5e1;">Basic: <strong style="color:#f8fafc;">${formatMoney(slip.basic_salary)}</strong></span>
              <span style="color:#64748b;">•</span>
              <span style="color:#cbd5e1;">Accom: <strong style="color:#f8fafc;">${formatMoney(slip.accommodation_allowance)}</strong></span>
              <span style="color:#64748b;">•</span>
              <span style="color:#cbd5e1;">Consol: <strong style="color:#f8fafc;">${formatMoney(slip.consolidated_allowance)}</strong></span>
              ${Number(slip.normal_overtime) > 0 ? `
                <span style="color:#64748b;">•</span>
                <span style="color:#38bdf8;">OT: <strong style="color:#38bdf8;">${formatMoney(slip.normal_overtime)}</strong> (${escapeHtml(slip.overtime_hrs || '0')} hrs)</span>
              ` : ''}
              ${slipDed > 0 ? `
                <span style="color:#64748b;">•</span>
                <span style="color:#ef4444;">Deductions: <strong style="color:#ef4444;">-${formatMoney(slipDed)}</strong></span>
              ` : ''}
            </div>

            <!-- Payout Source & Ref info -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; border-top:1px solid rgba(255,255,255,0.06); padding-top:0.75rem;">
              <div style="font-size:0.75rem; color:#94a3b8;">
                <span style="font-weight:600; color:#cbd5e1;">Deduction Source:</span> ${sourceLabel}
                ${slip.payout_reference ? `<span style="color:#64748b;"> • Ref: <code style="color:#38bdf8; font-family:monospace;">${escapeHtml(slip.payout_reference)}</code></span>` : ''}
              </div>
              <div style="display:inline-flex; gap:0.4rem; align-items:center;">
                <button type="button" class="fin-btn-row-action" style="background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); padding:4px 9px; font-size:0.75rem;" onclick="window.finApp.openPayslipPrintModal('${slip.id}')" title="Print Official Replica PDF">
                  🖨️ Payslip PDF
                </button>
                ${!isPaid ? `
                  <button type="button" class="fin-btn-row-action" style="background:rgba(16,185,129,0.2); color:#10b981; border:1px solid rgba(16,185,129,0.4); padding:4px 9px; font-size:0.75rem; font-weight:700;" onclick="window.finApp.openDisburseSalaryModal('${slip.id}')" title="Disburse and deduct now">
                    💳 Deduct &amp; Disburse
                  </button>
                ` : ''}
                <button type="button" class="fin-btn-row-action" style="background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.12); padding:4px 8px; font-size:0.75rem;" onclick="window.finApp.openRecordEmployeePaymentModal('${emp.id}', '${p.full}', '${slip.id}')" title="Edit Compensation Breakdown">
                  ✏️ Edit
                </button>
                <button type="button" class="fin-btn-row-action" style="background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.2); padding:4px 7px; font-size:0.75rem;" onclick="window.finApp.deletePayslip('${slip.id}')" title="Delete Slip">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        `;
      } else {
        // UNRECORDED MONTH
        return `
          <div style="background:rgba(30,41,59,0.35); border:1px dashed rgba(255,255,255,0.15); border-radius:12px; padding:1.25rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div>
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <span style="font-size:1.05rem; font-weight:700; color:#f8fafc;">🗓️ ${escapeHtml(p.full)}</span>
                <span style="font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:10px; background:rgba(245,158,11,0.1); color:#f59e0b; border:1px solid rgba(245,158,11,0.3);">
                  ⚠️ Unrecorded / Not Paid
                </span>
              </div>
              <div style="font-size:0.78rem; color:#94a3b8; margin-top:4px;">
                Registered Standard Monthly Salary: <strong style="color:#10b981;">${formatMoney(totalStandard)}</strong> (Basic: ${formatMoney(basic)} + Accom: ${formatMoney(acc)} + Cons: ${formatMoney(cons)})
              </div>
            </div>
            <div>
              <button type="button" class="fin-btn-primary" style="background:#10b981; border-color:#10b981; padding:7px 14px; font-size:0.82rem; font-weight:700; display:inline-flex; align-items:center; gap:6px;" onclick="window.finApp.openRecordEmployeePaymentModal('${emp.id}', '${p.full}')">
                <span>💳</span> Record Payment for ${escapeHtml(p.full)}
              </button>
            </div>
          </div>
        `;
      }
    }).join('');

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="fin-emp-history-modal-backdrop">
        <div class="fin-modal-dialog" style="max-width:920px; width:95%; max-height:92vh; background:#0d1527; border:1px solid rgba(56,189,248,0.25); box-shadow:0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(0,153,230,0.12); display:flex; flex-direction:column; border-radius:16px; overflow:hidden;">
          <!-- Executive Header -->
          <div class="fin-modal-header" style="background:linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.85) 100%); padding:1.25rem 1.75rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.85rem;">
              <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(0,153,230,0.3) 100%); border:1px solid rgba(56,189,248,0.35); display:flex; align-items:center; justify-content:center; font-size:1.35rem; box-shadow:0 4px 12px rgba(56,189,248,0.15);">📊</div>
              <div>
                <h3 class="fin-modal-title" style="margin:0; font-size:1.25rem; font-weight:800; color:#f8fafc; letter-spacing:-0.01em;">
                  Month-Wise Salary &amp; Payment History
                </h3>
                <p style="margin:2px 0 0 0; font-size:0.78rem; color:#94a3b8;">
                  Track monthly compensation records, settlements, and bank / RAYAN E-Wallets deductions
                </p>
              </div>
            </div>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeEmployeeSalaryHistoryModal()" title="Close">&times;</button>
          </div>

          <div style="padding:1.5rem;">
            <!-- Employee Profile Summary Card -->
            <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:1.2rem; margin-bottom:1.25rem;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
                <div>
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <div style="display:flex; align-items:center; gap:0.6rem;">
                      ${emp.photo ? `
                        <img src="${emp.photo}" style="width:40px; height:40px; border-radius:8px; object-fit:cover; border:1px solid rgba(56,189,248,0.4);">
                      ` : ''}
                      <strong style="color:#f8fafc; font-size:1.1rem;">${escapeHtml(emp.name)}</strong>
                    </div>
                    <span style="font-family:monospace; font-size:0.8rem; font-weight:700; color:#38bdf8; background:rgba(56,189,248,0.12); padding:2px 7px; border-radius:6px; border:1px solid rgba(56,189,248,0.3);">
                      ${escapeHtml(emp.employee_no)}
                    </span>
                    <span style="font-size:0.72rem; padding:2px 8px; border-radius:12px; background:rgba(16,185,129,0.12); color:#10b981; font-weight:700;">
                      ${escapeHtml(emp.status || 'Active')}
                    </span>
                  </div>
                  <div style="font-size:0.82rem; color:#cbd5e1; margin-top:4px;">
                    <strong>${escapeHtml(emp.position || 'Staff')}</strong> • <span style="color:#38bdf8;">${escapeHtml(emp.department || 'Rayan')}</span>
                  </div>
                  <div style="font-size:0.74rem; color:#94a3b8; margin-top:4px;">
                    Allocation: <strong style="color:#f1f5f9;">${escapeHtml(emp.project_name || 'Corporate Overhead')}</strong>
                    ${emp.iban ? ` • Bank: <span style="font-family:monospace; color:#cbd5e1;">${escapeHtml(emp.bank_name || 'Bank')} (${escapeHtml(emp.iban)})</span>` : ''}
                  </div>
                </div>

                <div style="text-align:right;">
                  <div style="font-size:0.72rem; color:#94a3b8; font-weight:600; text-transform:uppercase;">Registered Standard Salary:</div>
                  <div style="font-size:1.35rem; font-weight:800; color:#10b981; margin:2px 0;">
                    ${formatMoney(totalStandard, emp.currency || 'AED')}
                  </div>
                  <div style="font-size:0.7rem; color:#64748b;">
                    Basic: ${formatMoney(basic)} • Acc: ${formatMoney(acc)} • Cons: ${formatMoney(cons)}
                  </div>
                </div>
              </div>
            </div>

            <!-- Period Filter Pills Toolbar -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.25rem;">
              <div style="display:flex; align-items:center; gap:0.4rem; background:rgba(15,23,42,0.6); padding:4px; border-radius:10px; border:1px solid rgba(255,255,255,0.08);">
                <button type="button" class="fin-doc-pill-btn ${periodFilter === '1m' ? 'active' : ''}" style="${periodFilter === '1m' ? 'background:#38bdf8; color:#0f172a; font-weight:700;' : ''}" onclick="window.finApp.openEmployeeSalaryHistoryModal('${emp.id}', '1m')">
                  🗓️ 1 Month
                </button>
                <button type="button" class="fin-doc-pill-btn ${periodFilter === '3m' ? 'active' : ''}" style="${periodFilter === '3m' ? 'background:#38bdf8; color:#0f172a; font-weight:700;' : ''}" onclick="window.finApp.openEmployeeSalaryHistoryModal('${emp.id}', '3m')">
                  🗓️ 3 Months (Quarter)
                </button>
                <button type="button" class="fin-doc-pill-btn ${periodFilter === '6m' ? 'active' : ''}" style="${periodFilter === '6m' ? 'background:#38bdf8; color:#0f172a; font-weight:700;' : ''}" onclick="window.finApp.openEmployeeSalaryHistoryModal('${emp.id}', '6m')">
                  🗓️ 6 Months (Half-Year)
                </button>
                <button type="button" class="fin-doc-pill-btn ${periodFilter === 'all' ? 'active' : ''}" style="${periodFilter === 'all' ? 'background:#38bdf8; color:#0f172a; font-weight:700;' : ''}" onclick="window.finApp.openEmployeeSalaryHistoryModal('${emp.id}', 'all')">
                  🌐 All Recorded History
                </button>
              </div>

              <button type="button" class="fin-btn-primary" style="background:#10b981; border-color:#10b981;" onclick="window.finApp.openRecordEmployeePaymentModal('${emp.id}')">
                + Record Monthly Payment
              </button>
            </div>

            <!-- Metrics Summary Strip -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:0.75rem; margin-bottom:1.5rem;">
              <div style="background:rgba(15,23,42,0.5); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.85rem;">
                <div style="font-size:0.7rem; color:#94a3b8; font-weight:600;">Timeframe Range</div>
                <div style="font-size:1.15rem; font-weight:800; color:#38bdf8; margin-top:2px;">
                  ${periodFilter === '1m' ? 'Last 1 Month' : (periodFilter === '3m' ? 'Last 3 Months' : (periodFilter === '6m' ? 'Last 6 Months' : 'All Months'))}
                </div>
                <div style="font-size:0.68rem; color:#64748b;">${periods.length} monthly cycles</div>
              </div>
              <div style="background:rgba(15,23,42,0.5); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.85rem;">
                <div style="font-size:0.7rem; color:#94a3b8; font-weight:600;">Settled (Paid)</div>
                <div style="font-size:1.15rem; font-weight:800; color:#10b981; margin-top:2px;">
                  ${periodPaidCount} / ${periods.length}
                </div>
                <div style="font-size:0.68rem; color:#64748b;">Deducted from Bank/Wallets</div>
              </div>
              <div style="background:rgba(15,23,42,0.5); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.85rem;">
                <div style="font-size:0.7rem; color:#94a3b8; font-weight:600;">Total Net Disbursed</div>
                <div style="font-size:1.15rem; font-weight:800; color:#10b981; margin-top:2px;">
                  ${formatMoney(periodTotalPaid)}
                </div>
                <div style="font-size:0.68rem; color:#64748b;">Actual payout amount</div>
              </div>
              <div style="background:rgba(15,23,42,0.5); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.85rem;">
                <div style="font-size:0.7rem; color:#94a3b8; font-weight:600;">Unrecorded / Pending</div>
                <div style="font-size:1.15rem; font-weight:800; color:${periodUnpaidCount > 0 ? '#f59e0b' : '#64748b'}; margin-top:2px;">
                  ${periodUnpaidCount} months
                </div>
                <div style="font-size:0.68rem; color:#64748b;">Awaiting recording/payout</div>
              </div>
            </div>

            <!-- Month Cards Timeline -->
            <div style="margin-bottom:1rem;">
              <div style="font-size:0.82rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:0.75rem;">
                Month-by-Month Payment Breakdown
              </div>
              ${cardsHtml}
            </div>

            <!-- Footer Action -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.08); padding-top:1.25rem; margin-top:1rem;">
              <div style="font-size:0.75rem; color:#94a3b8;">
                Click "+ Record Payment" on any unrecorded month to calculate salary and deduct from Bank or RAYAN E-Wallets.
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="fin-btn-secondary" onclick="window.finApp.closeEmployeeSalaryHistoryModal()">
                  Close
                </button>
                <button type="button" class="fin-btn-primary" style="background:#10b981; border-color:#10b981;" onclick="window.finApp.openRecordEmployeePaymentModal('${emp.id}')">
                  💳 + Record Monthly Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.showCustomModal(modalHtml);
  };

  proto.closeEmployeeSalaryHistoryModal = function () {
    this.closeCustomModal('fin-emp-history-modal-backdrop');
  };

  // ==========================================================================
  // 6. RECORD EMPLOYEE SALARY PAYMENT MODAL (MONTH-WISE & DIRECT DEDUCTIONS)
  // ==========================================================================
  proto.openRecordEmployeePaymentModal = function (empId = null, defaultMonth = null, slipId = null) {
    this.ensurePayrollSeedData();
    let slip = null;
    if (slipId) {
      slip = (this.db?.payroll || []).find(p => p.id === slipId);
    }

    const employees = (this.db?.employees || []).filter(e => this.matchesActiveCompany(e.company_id));
    const projects = (this.db?.projects || []).filter(p => this.matchesActiveCompany(p.company_id));
    const bankAccounts = (this.db?.bank_accounts || []).filter(b => this.matchesActiveCompany(b.company_id));
    const cashRegisters = (this.db?.cash_in_hand || []).filter(c => this.matchesActiveCompany(c.company_id));

    const activeEmployees = employees.filter(e => (e.status || 'Active').toLowerCase() === 'active');
    const formerEmployees = employees.filter(e => (e.status || 'Active').toLowerCase() !== 'active');

    // Determine target employee
    let targetEmp = null;
    if (slip?.employee_id || slip?.employee_no) {
      const sIdLow = String(slip.employee_id || '').trim().toLowerCase();
      const sNoLow = String(slip.employee_no || '').trim().toLowerCase();
      targetEmp = employees.find(e =>
        (sIdLow && (String(e.id || '').toLowerCase() === sIdLow || String(e.employee_no || '').toLowerCase() === sIdLow)) ||
        (sNoLow && String(e.employee_no || '').toLowerCase() === sNoLow)
      );
    } else if (empId) {
      targetEmp = employees.find(e => e.id === empId || e.employee_no === empId || (e.name && e.name.toLowerCase() === (empId || '').toLowerCase()));
    } else if (activeEmployees.length > 0) {
      targetEmp = activeEmployees[0];
    } else if (employees.length > 0) {
      targetEmp = employees[0];
    }

    const isEdit = Boolean(slip);
    const targetMonth = defaultMonth || slip?.period_label || slip?.month_year || 'June 2026';
    const slipNo = slip?.slip_no || `PS${targetMonth.replace(/\s+/g, '')}/${targetEmp?.employee_no || 'EN12001'}`;

    const basicSalary = slip?.basic_salary ?? (targetEmp?.basic_salary ?? 9500);
    const accAllowance = slip?.accommodation_allowance ?? (targetEmp?.accommodation_allowance ?? 12500);
    const consAllowance = slip?.consolidated_allowance ?? (targetEmp?.consolidated_allowance ?? 8000);
    const otAmount = slip?.normal_overtime ?? 0;
    const otHrs = slip?.overtime_hrs ?? '0.0';
    const otherEarn = slip?.other_earnings ?? 0;

    const advDed = slip?.advance_deduction ?? 0;
    const absDed = slip?.absence_deduction ?? 0;
    const loanDed = slip?.loan_deduction ?? 0;

    const sourceType = slip?.payout_source_type || 'bank';
    const defaultStatus = slip?.status || 'Paid';
    const paymentDate = slip?.payment_date || new Date().toISOString().split('T')[0];

    // Bank accounts options
    const bankOpts = (bankAccounts.length > 0 ? bankAccounts : [
      { id: 'bank-adcb-uae', bank_name: 'Abu Dhabi Commercial Bank (ADCB)', balance: 3114846.10 }
    ]).map(b => `<option value="${escapeHtml(b.id)}" ${slip?.payout_source_id === b.id ? 'selected' : ''}>🏦 ${escapeHtml(b.bank_name)} (${formatMoney(b.balance)})</option>`).join('');

    // Cash registers options
    const cashOpts = (cashRegisters.length > 0 ? cashRegisters : [
      { id: 'cash-mw5esv3w', register_name: 'RAYAN E-Wallets', balance: 1326786.10 }
    ]).map(c => `<option value="${escapeHtml(c.id)}" ${(slip?.payout_source_id === c.id || (!slip?.payout_source_id && (c.id === 'cash-mw5esv3w' || (c.register_name || '').toLowerCase().includes('wallet')))) ? 'selected' : ''}>💵 ${escapeHtml(c.register_name || 'RAYAN E-Wallets')} (${formatMoney(c.balance)})</option>`).join('');

    const html = `
      <div class="fin-modal-backdrop open" id="fin-record-payment-modal-backdrop">
        <div class="fin-modal-dialog" style="max-width:920px; width:95%; max-height:92vh; background:#0d1527; border:1px solid rgba(56,189,248,0.25); box-shadow:0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(0,153,230,0.12); display:flex; flex-direction:column; border-radius:16px; overflow:hidden;">
          <!-- Executive Header -->
          <div class="fin-modal-header" style="background:linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.85) 100%); padding:1.25rem 1.75rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.85rem;">
              <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.3) 100%); border:1px solid rgba(16,185,129,0.35); display:flex; align-items:center; justify-content:center; font-size:1.35rem; box-shadow:0 4px 12px rgba(16,185,129,0.15);">💳</div>
              <div>
                <h3 class="fin-modal-title" style="margin:0; font-size:1.25rem; font-weight:800; color:#f8fafc; letter-spacing:-0.01em;">
                  ${isEdit ? '✏️ Edit Month-Wise Salary Payment' : '💳 Record Month-Wise Salary Payment'}
                </h3>
                <p style="margin:2px 0 0; font-size:0.78rem; color:#94a3b8;">
                  Calculate Net Pay &amp; Directly Deduct from Bank Account or RAYAN E-Wallets • تسجيل مسير الرواتب
                </p>
              </div>
            </div>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeRecordEmployeePaymentModal()" title="Close">&times;</button>
          </div>

          <!-- Body Form -->
          <form id="fin-record-payment-form" class="fin-modal-body" onsubmit="window.finApp.saveRecordEmployeePaymentForm(event)" style="padding:1.5rem 1.75rem; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:1.25rem;">
            <input type="hidden" name="id" value="${slip?.id || ''}">

            <!-- Card 1: Registered Employee & Target Period -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>📋</span>
                  <span>Registered Employee &amp; Target Payroll Period</span>
                </div>
              </div>
              <div class="fin-form-grid-3" style="align-items:flex-start;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <label class="fin-field-label" style="margin-bottom:0;">Registered Employee <span style="color:#ef4444;">*</span></label>
                    <div style="display:flex; gap:3px;">
                      <button type="button" id="fin-rec-filter-active-btn" class="fin-doc-pill-btn active" style="padding:1px 6px; font-size:0.65rem; font-weight:700; background:rgba(16,185,129,0.22); color:#10b981; border:1px solid rgba(16,185,129,0.4); cursor:pointer;" onclick="window.finApp.toggleRecEmpFilter('active')">🟢 Active Only</button>
                      <button type="button" id="fin-rec-filter-all-btn" class="fin-doc-pill-btn" style="padding:1px 6px; font-size:0.65rem; font-weight:700; background:rgba(255,255,255,0.06); color:#94a3b8; border:1px solid rgba(255,255,255,0.15); cursor:pointer;" onclick="window.finApp.toggleRecEmpFilter('all')">👥 All</button>
                    </div>
                  </div>
                  <select name="employee_id" id="fin-rec-emp-select" class="fin-form-select" required onchange="window.finApp.onRecordEmpChange(this.value)" style="border-color:rgba(56,189,248,0.35); background:#0f172a; font-weight:600;">
                    <optgroup label="🟢 Active Employees (${activeEmployees.length})" id="fin-rec-optgroup-active">
                      ${activeEmployees.map(e => `
                        <option value="${escapeHtml(e.id)}" ${(targetEmp?.id === e.id) ? 'selected' : ''}>
                          ${escapeHtml(e.employee_no)} — ${escapeHtml(e.name)} (${escapeHtml(e.position || 'Staff')})
                        </option>
                      `).join('')}
                    </optgroup>
                    ${formerEmployees.length > 0 ? `
                    <optgroup label="⚪ Former / Inactive Staff (${formerEmployees.length})" id="fin-rec-optgroup-former">
                      ${formerEmployees.map(e => `
                        <option value="${escapeHtml(e.id)}" ${(targetEmp?.id === e.id) ? 'selected' : ''}>
                          ${escapeHtml(e.employee_no)} — ${escapeHtml(e.name)} [${escapeHtml(e.status || 'Inactive')}]
                        </option>
                      `).join('')}
                    </optgroup>
                    ` : ''}
                  </select>
                </div>

                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Payroll Period Month <span style="color:#ef4444;">*</span></label>
                  <div style="display:flex; gap:0.5rem;">
                    <select name="month_period_select" id="fin-rec-month-select" class="fin-form-select" onchange="window.finApp.onRecordMonthSelectChange(this.value)" style="background:#0f172a;">
                      ${PAYROLL_PERIODS.map(p => `
                        <option value="${escapeHtml(p.full)}" ${(targetMonth === p.full || targetMonth === p.short || targetMonth === p.key) ? 'selected' : ''}>
                          ${escapeHtml(p.full)} (${escapeHtml(p.short)})
                        </option>
                      `).join('')}
                      <option value="custom">Custom Month...</option>
                    </select>
                    <input type="text" name="month_year" id="fin-rec-month-input" class="fin-form-input" style="display:none; width:120px;" placeholder="e.g. May 2026" value="${escapeHtml(targetMonth)}">
                  </div>
                  <!-- Quick Month Buttons -->
                  <div style="display:flex; gap:0.35rem; margin-top:0.4rem;">
                    <button type="button" class="fin-doc-pill-btn" style="padding:2px 7px; font-size:0.7rem;" onclick="window.finApp.setRecordMonth('June 2026')">June 2026</button>
                    <button type="button" class="fin-doc-pill-btn" style="padding:2px 7px; font-size:0.7rem;" onclick="window.finApp.setRecordMonth('May 2026')">May 2026</button>
                    <button type="button" class="fin-doc-pill-btn" style="padding:2px 7px; font-size:0.7rem;" onclick="window.finApp.setRecordMonth('April 2026')">April 2026</button>
                  </div>
                </div>

                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Pay Slip Reference # <span style="color:#ef4444;">*</span></label>
                  <input type="text" name="slip_no" id="fin-rec-slip-no" class="fin-form-input" required value="${escapeHtml(slipNo)}" placeholder="PSJune2026/EN12001" style="font-family:monospace; font-weight:700; color:#38bdf8;">
                </div>
              </div>
            </div>

            <!-- Card 2: Monthly Earnings & Allowances (AED) -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title" style="color:#10b981;">
                  <span>💵</span>
                  <span>1. Monthly Earnings &amp; Allowances (AED)</span>
                </div>
              </div>
              <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:0.75rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Basic Salary *</label>
                  <input type="number" step="0.01" name="basic_salary" id="fin-rec-basic" class="fin-form-input" required value="${basicSalary}" oninput="window.finApp.calcRecordPaymentTotals()" style="font-weight:700;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Accommodation</label>
                  <input type="number" step="0.01" name="accommodation_allowance" id="fin-rec-acc" class="fin-form-input" value="${accAllowance}" oninput="window.finApp.calcRecordPaymentTotals()" style="font-weight:700;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Consolidated</label>
                  <input type="number" step="0.01" name="consolidated_allowance" id="fin-rec-cons" class="fin-form-input" value="${consAllowance}" oninput="window.finApp.calcRecordPaymentTotals()" style="font-weight:700;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Overtime (AED)</label>
                  <input type="number" step="0.01" name="normal_overtime" id="fin-rec-ot" class="fin-form-input" value="${otAmount}" oninput="window.finApp.calcRecordPaymentTotals()" style="font-weight:700;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">OT Hours</label>
                  <input type="text" name="overtime_hrs" id="fin-rec-ot-hrs" class="fin-form-input" value="${escapeHtml(otHrs)}" placeholder="e.g. 10.0">
                </div>
              </div>
            </div>

            <!-- Card 3: Deductions Breakdown (AED) -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title" style="color:#ef4444;">
                  <span>📉</span>
                  <span>2. Deductions &amp; Recoveries (AED)</span>
                </div>
              </div>
              <div class="fin-form-grid-3">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Salary Advance Deductions</label>
                  <input type="number" step="0.01" name="advance_deduction" id="fin-rec-adv" class="fin-form-input" value="${advDed}" oninput="window.finApp.calcRecordPaymentTotals()" style="font-weight:700; color:#ef4444;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Absences / Unpaid Leaves</label>
                  <input type="number" step="0.01" name="absence_deduction" id="fin-rec-abs" class="fin-form-input" value="${absDed}" oninput="window.finApp.calcRecordPaymentTotals()" style="font-weight:700; color:#ef4444;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Loan / Other Deductions</label>
                  <input type="number" step="0.01" name="loan_deduction" id="fin-rec-loan" class="fin-form-input" value="${loanDed}" oninput="window.finApp.calcRecordPaymentTotals()" style="font-weight:700; color:#ef4444;">
                </div>
              </div>
            </div>

            <!-- Live Calculation Summary Card -->
            <div style="background:rgba(15,23,42,0.85); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:1.15rem 1.4rem; display:grid; grid-template-columns:1fr 1fr 1.35fr; gap:1.25rem; align-items:center;">
              <div>
                <span style="font-size:0.74rem; color:#94a3b8; display:block; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">Gross Monthly Earnings:</span>
                <strong id="fin-rec-tot-earn" style="font-size:1.25rem; color:#38bdf8;">AED 30,000.00</strong>
              </div>
              <div>
                <span style="font-size:0.74rem; color:#94a3b8; display:block; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">Total Deductions:</span>
                <strong id="fin-rec-tot-ded" style="font-size:1.25rem; color:#ef4444;">AED 0.00</strong>
              </div>
              <div style="background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.35); border-radius:10px; padding:0.75rem 1.15rem;">
                <span style="font-size:0.75rem; color:#10b981; font-weight:800; display:block; text-transform:uppercase; letter-spacing:0.04em;">Net Salary Payable / Deducted:</span>
                <strong id="fin-rec-net-pay" style="font-size:1.45rem; font-weight:900; color:#10b981;">AED 30,000.00</strong>
              </div>
            </div>

            <!-- Card 4: Payout Source & Direct Account Deduction -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title" style="color:#38bdf8;">
                  <span>🏦</span>
                  <span>3. Payout Source &amp; Direct Account Deduction</span>
                </div>
              </div>
              <div class="fin-form-grid-3" style="margin-bottom:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Deduct Balance From <span style="color:#ef4444;">*</span></label>
                  <select name="payout_source_type" id="fin-rec-source-type" class="fin-form-select" required onchange="window.finApp.onRecordSourceTypeChange(this.value)">
                    <option value="bank" ${sourceType === 'bank' ? 'selected' : ''}>🏦 Bank Account (Wire Transfer)</option>
                    <option value="cash" ${sourceType === 'cash' ? 'selected' : ''}>💵 RAYAN E-Wallets / Cash in Hand</option>
                  </select>
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Specific Account / Register <span style="color:#ef4444;">*</span></label>
                  <select name="payout_source_id" id="fin-rec-source-id" class="fin-form-select" required>
                    ${sourceType === 'cash' ? cashOpts : bankOpts}
                  </select>
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Payment Status <span style="color:#ef4444;">*</span></label>
                  <select name="status" id="fin-rec-status" class="fin-form-select">
                    <option value="Paid" ${slip?.status === 'Paid' || !slip ? 'selected' : ''}>Paid (Deduct Balance Now)</option>
                    <option value="Draft" ${slip?.status === 'Draft' ? 'selected' : ''}>Draft (Preview Only)</option>
                    <option value="Pending" ${slip?.status === 'Pending' ? 'selected' : ''}>Pending Approval</option>
                  </select>
                </div>
              </div>
              <div class="fin-form-grid-2">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Disbursement Date</label>
                  <input type="date" name="payment_date" class="fin-form-input" required value="${paymentDate}">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Transaction / Cheque Reference</label>
                  <input type="text" name="reference_notes" class="fin-form-input" value="${escapeHtml(slip?.reference_notes || `SAL-${targetMonth.replace(/\s+/g, '')}-${targetEmp?.employee_no || 'EMP'}`)}" placeholder="e.g. TXN-100234">
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="fin-modal-footer" style="padding:1.15rem 0 0 0; background:transparent; border-top:1px solid rgba(255,255,255,0.08); margin-top:0.5rem;">
              <button type="button" class="fin-btn-secondary" onclick="window.finApp.closeRecordEmployeePaymentModal()">Cancel</button>
              <button type="submit" class="fin-btn-primary" style="background:linear-gradient(135deg, #059669 0%, #10b981 100%); border-color:#34d399;">
                ${isEdit ? '💾 Update Salary Record' : '✓ Record Salary &amp; Deduct Balance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showCustomModal(html);
    this.calcRecordPaymentTotals();
  };

  proto.closeRecordEmployeePaymentModal = function () {
    this.closeCustomModal('fin-record-payment-modal-backdrop');
  };

  proto.setRecordMonth = function (monthName) {
    const sel = document.getElementById('fin-rec-month-select');
    const input = document.getElementById('fin-rec-month-input');
    if (sel) {
      sel.value = monthName;
      if (sel.value !== monthName) {
        sel.value = 'custom';
        if (input) {
          input.style.display = 'block';
          input.value = monthName;
        }
      } else if (input) {
        input.style.display = 'none';
        input.value = monthName;
      }
    }
    const empId = document.getElementById('fin-rec-emp-select')?.value;
    const emp = (this.db?.employees || []).find(e => e.id === empId);
    const slipNoEl = document.getElementById('fin-rec-slip-no');
    if (slipNoEl && emp) {
      slipNoEl.value = `PS${monthName.replace(/\s+/g, '')}/${emp.employee_no || 'EN'}`;
    }
  };

  proto.onRecordMonthSelectChange = function (val) {
    const input = document.getElementById('fin-rec-month-input');
    if (val === 'custom') {
      if (input) {
        input.style.display = 'block';
        input.focus();
      }
    } else {
      if (input) {
        input.style.display = 'none';
        input.value = val;
      }
      const empId = document.getElementById('fin-rec-emp-select')?.value;
      const emp = (this.db?.employees || []).find(e => e.id === empId);
      const slipNoEl = document.getElementById('fin-rec-slip-no');
      if (slipNoEl && emp) {
        slipNoEl.value = `PS${val.replace(/\s+/g, '')}/${emp.employee_no || 'EN'}`;
      }
    }
  };

  proto.toggleRecEmpFilter = function (mode) {
    const actBtn = document.getElementById('fin-rec-filter-active-btn');
    const allBtn = document.getElementById('fin-rec-filter-all-btn');
    const formerGroup = document.getElementById('fin-rec-optgroup-former');
    if (mode === 'active') {
      if (formerGroup) formerGroup.style.display = 'none';
      if (actBtn) { actBtn.style.background = 'rgba(16,185,129,0.25)'; actBtn.style.borderColor = '#10b981'; actBtn.style.color = '#10b981'; }
      if (allBtn) { allBtn.style.background = 'rgba(255,255,255,0.06)'; allBtn.style.borderColor = 'rgba(255,255,255,0.15)'; allBtn.style.color = '#94a3b8'; }
    } else {
      if (formerGroup) formerGroup.style.display = '';
      if (allBtn) { allBtn.style.background = 'rgba(56,189,248,0.25)'; allBtn.style.borderColor = '#38bdf8'; allBtn.style.color = '#38bdf8'; }
      if (actBtn) { actBtn.style.background = 'rgba(255,255,255,0.06)'; actBtn.style.borderColor = 'rgba(255,255,255,0.15)'; actBtn.style.color = '#94a3b8'; }
    }
  };

  proto.onRecordEmpChange = function (empId) {
    const emp = (this.db?.employees || []).find(e => e.id === empId);
    if (!emp) return;

    const monthVal = document.getElementById('fin-rec-month-select')?.value || 'June 2026';
    const slipNoEl = document.getElementById('fin-rec-slip-no');
    if (slipNoEl) {
      slipNoEl.value = `PS${monthVal.replace(/\s+/g, '')}/${emp.employee_no || 'EN'}`;
    }

    if (emp.basic_salary !== undefined) {
      const el = document.getElementById('fin-rec-basic');
      if (el) el.value = emp.basic_salary;
    }
    if (emp.accommodation_allowance !== undefined) {
      const el = document.getElementById('fin-rec-acc');
      if (el) el.value = emp.accommodation_allowance;
    }
    if (emp.consolidated_allowance !== undefined) {
      const el = document.getElementById('fin-rec-cons');
      if (el) el.value = emp.consolidated_allowance;
    }

    const projSel = document.getElementById('fin-rec-proj-select');
    if (projSel && emp.project_id) {
      projSel.value = emp.project_id;
    }

    this.calcRecordPaymentTotals();
  };

  proto.onRecordSourceTypeChange = function (type) {
    const idSel = document.getElementById('fin-rec-source-id');
    if (!idSel) return;

    if (type === 'cash') {
      const cashRegisters = (this.db?.cash_in_hand || []).filter(c => this.matchesActiveCompany(c.company_id));
      const list = cashRegisters.length > 0 ? cashRegisters : [
        { id: 'cash-mw5esv3w', register_name: 'RAYAN E-Wallets', balance: 1326786.10 }
      ];
      idSel.innerHTML = list.map(c => `
        <option value="${escapeHtml(c.id)}" ${(c.id === 'cash-mw5esv3w' || (c.register_name || '').toLowerCase().includes('wallet')) ? 'selected' : ''}>💵 ${escapeHtml(c.register_name || 'RAYAN E-Wallets')} (${formatMoney(c.balance)})</option>
      `).join('');
    } else {
      const bankAccounts = (this.db?.bank_accounts || []).filter(b => this.matchesActiveCompany(b.company_id));
      const list = bankAccounts.length > 0 ? bankAccounts : [
        { id: 'bank-adcb-uae', bank_name: 'Abu Dhabi Commercial Bank (ADCB)', balance: 3114846.10 }
      ];
      idSel.innerHTML = list.map(b => `
        <option value="${escapeHtml(b.id)}">🏦 ${escapeHtml(b.bank_name)} (${formatMoney(b.balance)})</option>
      `).join('');
    }
  };

  proto.calcRecordPaymentTotals = function () {
    const basic = parseFloat(document.getElementById('fin-rec-basic')?.value) || 0;
    const acc = parseFloat(document.getElementById('fin-rec-acc')?.value) || 0;
    const cons = parseFloat(document.getElementById('fin-rec-cons')?.value) || 0;
    const ot = parseFloat(document.getElementById('fin-rec-ot')?.value) || 0;
    const totEarn = basic + acc + cons + ot;

    const adv = parseFloat(document.getElementById('fin-rec-adv')?.value) || 0;
    const abs = parseFloat(document.getElementById('fin-rec-abs')?.value) || 0;
    const loan = parseFloat(document.getElementById('fin-rec-loan')?.value) || 0;
    const totDed = adv + abs + loan;

    const net = Math.max(0, totEarn - totDed);

    const earnEl = document.getElementById('fin-rec-tot-earn');
    const dedEl = document.getElementById('fin-rec-tot-ded');
    const netEl = document.getElementById('fin-rec-net-pay');

    if (earnEl) earnEl.textContent = formatMoney(totEarn);
    if (dedEl) dedEl.textContent = formatMoney(totDed);
    if (netEl) netEl.textContent = formatMoney(net);
  };

  proto.saveRecordEmployeePaymentForm = async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const slipId = formData.get('id') || `ps-${Date.now().toString(36)}`;
    const empId = formData.get('employee_id');
    const emp = (this.db?.employees || []).find(em => em.id === empId);

    const prjId = formData.get('project_id') || '';
    const prj = (this.db?.projects || []).find(p => p.id === prjId);

    let rawMonth = (formData.get('month_period_select') || '').trim();
    if (rawMonth === 'custom' || !rawMonth) {
      rawMonth = (formData.get('month_year') || '').trim() || 'June 2026';
    }

    let monthShort = rawMonth;
    let periodLabel = rawMonth;
    const matchedRef = PAYROLL_PERIODS.find(p => p.full.toLowerCase() === rawMonth.toLowerCase() || p.short.toLowerCase() === rawMonth.toLowerCase() || p.key === rawMonth);
    if (matchedRef) {
      monthShort = matchedRef.short;
      periodLabel = matchedRef.full;
    } else if (rawMonth.length > 7 && !rawMonth.includes('-')) {
      const parts = rawMonth.split(' ');
      if (parts.length === 2) {
        monthShort = `${parts[0].slice(0, 3)}-${parts[1].slice(-2)}`;
      }
    }

    const basic = parseFloat(formData.get('basic_salary')) || 0;
    const acc = parseFloat(formData.get('accommodation_allowance')) || 0;
    const cons = parseFloat(formData.get('consolidated_allowance')) || 0;
    const ot = parseFloat(formData.get('normal_overtime')) || 0;
    const otHrs = (formData.get('overtime_hrs') || '').trim();
    const totEarn = basic + acc + cons + ot;

    const adv = parseFloat(formData.get('advance_deduction')) || 0;
    const abs = parseFloat(formData.get('absence_deduction')) || 0;
    const loan = parseFloat(formData.get('loan_deduction')) || 0;
    const totDed = adv + abs + loan;

    const netPay = Math.max(0, totEarn - totDed);
    const status = formData.get('status') || 'Paid';
    const sourceType = formData.get('payout_source_type') || 'bank';
    const sourceId = formData.get('payout_source_id') || '';

    let sourceName = '';
    if (sourceType === 'cash') {
      const reg = (this.db?.cash_in_hand || []).find(c => c.id === sourceId);
      sourceName = reg ? reg.register_name : 'RAYAN E-Wallets';
    } else {
      const bank = (this.db?.bank_accounts || []).find(b => b.id === sourceId);
      sourceName = bank ? bank.bank_name : 'Abu Dhabi Commercial Bank (ADCB)';
    }

    const payDate = formData.get('payment_date') || new Date().toISOString().split('T')[0];
    const userSlipNo = (formData.get('slip_no') || '').trim();
    const slipNo = userSlipNo || `PS${periodLabel.replace(/\s+/g, '')}/${emp ? emp.employee_no : 'EN'}`;
    const payRef = (formData.get('payout_reference') || formData.get('reference_notes') || '').trim() || `TXN-PAYROLL-${payDate.replace(/-/g, '')}-${emp ? emp.employee_no : 'EN'}`;

    const slipObj = {
      id: slipId,
      slip_no: slipNo,
      company_id: this.activeCompanyId || 'rayan-corp-uae',
      employee_id: empId,
      employee_no: emp ? emp.employee_no : '',
      employee_name: emp ? emp.name : '',
      position: emp ? (emp.position || emp.designation) : '',
      department: emp ? emp.department : 'Rayan Engineering',
      date_of_appointment: emp ? (emp.date_of_joining || emp.date_of_appointment) : '2025-08-07',
      currency: emp ? emp.currency : 'AED',
      month_year: monthShort,
      period_label: periodLabel,
      printed_date: payDate,
      payment_date: payDate,
      basic_salary: basic,
      accommodation_allowance: acc,
      consolidated_allowance: cons,
      normal_overtime: ot,
      overtime_hrs: otHrs,
      total_earnings: totEarn,
      advance_deduction: adv,
      absence_deduction: abs,
      loan_deduction: loan,
      total_deductions: totDed,
      net_pay: netPay,
      breakdown_items: [
        { date: payDate, element_name: 'Basic Salary', element_type: 'Standard Earnings', remark: 'Standard Monthly Base', hrs: '', amount: basic },
        { date: payDate, element_name: 'Accommodation Allowance', element_type: 'Standard Earnings', remark: 'Executive Housing', hrs: '', amount: acc },
        { date: payDate, element_name: 'Consolidated Allowance', element_type: 'Standard Earnings', remark: 'Site Transport & Perks', hrs: '', amount: cons },
        ...(ot > 0 ? [{ date: payDate, element_name: 'Normal Overtime', element_type: 'Standard Earnings', remark: 'Approved Site Overtime', hrs: otHrs || '10', amount: ot }] : [])
      ],
      bank_name: emp ? (emp.bank_name || 'Emirates NBD Bank PJSC') : 'Emirates NBD Bank PJSC',
      swift: emp ? (emp.swift || 'EBILAEADXXX') : 'EBILAEADXXX',
      iban: emp ? (emp.iban || '') : '',
      account_no: emp ? (emp.account_no || '') : '',
      pay_method: (sourceType === 'cash') ? 'RAYAN E-Wallets / Cash' : (emp ? (emp.default_pay_method || 'AED RAYAN GROUP Host To Host') : 'AED RAYAN GROUP Host To Host'),
      transferred_amount: netPay,
      status: status,
      payout_source_type: sourceType,
      payout_source_id: sourceId,
      payout_source_name: sourceName,
      payout_reference: payRef,
      project_id: prjId,
      project_name: prj ? prj.name : 'Corporate / General Overhead',
      updated_at: new Date().toISOString()
    };

    if (!Array.isArray(this.db.payroll)) {
      this.db.payroll = [];
    }

    const idx = this.db.payroll.findIndex(p => p.id === slipId);
    if (idx >= 0) {
      this.db.payroll[idx] = { ...this.db.payroll[idx], ...slipObj };
    } else {
      this.db.payroll.unshift(slipObj);
    }

    // Execute direct balance deduction from selected Bank Account or RAYAN E-Wallets if marked Paid!
    if (status === 'Paid') {
      this.applyPayrollPayoutDeduction(slipObj);
    }

    this.closeRecordEmployeePaymentModal();
    this.normalizeAllBalances();
    if (typeof this.saveDatabaseToCache === 'function') {
      this.saveDatabaseToCache();
    }

    const deductionMsg = status === 'Paid'
      ? ` and deducted ${this.formatCurrency(netPay)} from ${sourceName}`
      : '';
    this.showToast
      ? this.showToast(`Pay slip ${slipObj.slip_no} (${periodLabel}) recorded${deductionMsg}!`, 'success')
      : alert(`Pay slip recorded!`);

    // Sync with backend API
    try {
      await this.syncWithBackend('save_payroll', { payroll: slipObj });
      if (status === 'Paid') {
        await this.syncWithBackend('disburse_payroll', {
          slip_id: slipObj.id,
          payroll: slipObj,
          source_type: sourceType,
          source_id: sourceId,
          amount: netPay,
          payment_date: payDate,
          payout_reference: payRef
        });
      }
    } catch (err) {
      console.warn('Backend payroll sync warning:', err);
    }

    // Refresh history modal if it was open
    const historyModal = document.getElementById('fin-emp-history-modal-backdrop');
    if (historyModal && empId) {
      this.openEmployeeSalaryHistoryModal(empId, this.lastEmployeeHistoryFilter || '3m');
    }

    // Refresh profile modal if it was open
    const profileModal = document.getElementById('fin-emp-profile-modal-backdrop');
    if (profileModal && empId) {
      this.openEmployeeProfileModal(empId);
    }

    // Refresh views if open
    if (this.activeTab === 'payroll') {
      this.renderPayrollTab((document.getElementById('fin-tab-content-root') || document.getElementById('fin-view-container')));
    } else if (this.activeTab === 'employees') {
      this.renderEmployeesTab((document.getElementById('fin-tab-content-root') || document.getElementById('fin-view-container')));
    }
  };

  // ==========================================================================
  // 7. PAYSLIP MODAL (CREATE / EDIT) - Delegates to Record Payment Modal
  // ==========================================================================
  proto.openPayslipModal = function (slipId = null, preselectedEmpId = null) {
    if (!slipId && preselectedEmpId) {
      this.openRecordEmployeePaymentModal(preselectedEmpId, null, null);
    } else if (slipId && !preselectedEmpId) {
      // Check if slipId is actually an empId
      const emp = (this.db?.employees || []).find(e => e.id === slipId || e.employee_no === slipId);
      if (emp) {
        this.openRecordEmployeePaymentModal(emp.id, null, null);
      } else {
        this.openRecordEmployeePaymentModal(null, null, slipId);
      }
    } else {
      this.openRecordEmployeePaymentModal(preselectedEmpId, null, slipId);
    }
  };
  proto.closePayslipModal = function () {
    this.closeRecordEmployeePaymentModal();
  };
  proto.onPayslipEmployeeChange = function (empId) {
    this.onRecordEmpChange(empId);
  };
  proto.calcPayslipTotals = function () {
    this.calcRecordPaymentTotals();
  };
  proto.onPayslipSourceTypeChange = function (type) {
    this.onRecordSourceTypeChange(type);
  };
  proto.savePayslipForm = function (e) {
    return this.saveRecordEmployeePaymentForm(e);
  };

  proto.deletePayslip = async function (slipId) {
    if (!this.db) return;
    const slip = (this.db?.payroll || []).find(p => p.id === slipId || p.slip_no === slipId);
    const slipNo = slip ? slip.slip_no : slipId;
    const empName = slip ? slip.employee_name : 'Employee';

    const confirmed = (typeof window !== 'undefined' && typeof window.confirm === 'function')
      ? window.confirm(`Are you sure you want to delete pay slip "${slipNo}" for ${empName}?`)
      : true;
    if (!confirmed) return;

    // Track in deleted_payroll_ids so it is NEVER restored
    if (!Array.isArray(this.db.deleted_payroll_ids)) {
      this.db.deleted_payroll_ids = [];
    }
    if (slip?.id && !this.db.deleted_payroll_ids.includes(slip.id)) this.db.deleted_payroll_ids.push(slip.id);
    if (slipId && !this.db.deleted_payroll_ids.includes(slipId)) this.db.deleted_payroll_ids.push(slipId);
    if (slipNo && !this.db.deleted_payroll_ids.includes(slipNo)) this.db.deleted_payroll_ids.push(slipNo);

    try {
      if (typeof localStorage !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('rayan_fin_deleted_payroll_ids') || '[]');
        if (slip?.id && !stored.includes(slip.id)) stored.push(slip.id);
        if (slipId && !stored.includes(slipId)) stored.push(slipId);
        if (slipNo && !stored.includes(slipNo)) stored.push(slipNo);
        localStorage.setItem('rayan_fin_deleted_payroll_ids', JSON.stringify(stored));
      }
    } catch (e) { }

    this.db.payroll_initialized = true;
    this.db.payroll = (this.db.payroll || []).filter(p => p.id !== slipId && p.slip_no !== slipId && (!slip || (p.id !== slip.id && p.slip_no !== slip.slip_no)));

    if (typeof this.saveDatabaseToCache === 'function') {
      this.saveDatabaseToCache();
    } else {
      if (typeof this.saveDatabaseToCache === 'function') { this.saveDatabaseToCache(); } else { try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (err) { } }
    }

    // Sync deletion with backend
    try {
      if (typeof this.syncApi === 'function') {
        await this.syncApi('delete_payroll', { id: slip?.id || slipId, slip_no: slipNo });
      } else if (typeof this.syncWithBackend === 'function') {
        await this.syncWithBackend('delete_payroll', { id: slip?.id || slipId, slip_no: slipNo });
      }
    } catch (err) {
      console.warn('Delete payroll backend sync warning:', err);
    }

    if (typeof this.normalizeAllBalances === 'function') {
      this.normalizeAllBalances();
    }
    if (typeof this.showNotification === 'function') {
      this.showNotification(`✓ Pay slip "${slipNo}" deleted successfully.`, 'info');
    } else if (typeof this.showToast === 'function') {
      this.showToast(`✓ Pay slip "${slipNo}" deleted`, 'info');
    }

    if (this.activeTab === 'payroll') {
      this.renderPayrollTab((document.getElementById('fin-tab-content-root') || document.getElementById('fin-view-container')));
    } else if (typeof this.renderActiveTab === 'function') {
      this.renderActiveTab();
    }
  };

  // ==========================================================================
  // 6. PAYOUT EXECUTION & BALANCE DEDUCTION MODAL
  // ==========================================================================
  proto.openDisburseSalaryModal = function (slipId) {
    const slip = (this.db?.payroll || []).find(p => p.id === slipId);
    if (!slip) return;

    const bankAccounts = (this.db?.bank_accounts || []).filter(b => this.matchesActiveCompany(b.company_id));
    const cashRegisters = (this.db?.cash_in_hand || []).filter(c => this.matchesActiveCompany(c.company_id));

    const html = `
      <div class="fin-modal-backdrop open" id="fin-disburse-modal-backdrop">
        <div class="fin-modal-dialog" style="max-width:580px; width:95%; background:#0d1527; border:1px solid rgba(56,189,248,0.25); box-shadow:0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(0,153,230,0.12); display:flex; flex-direction:column; border-radius:16px; overflow:hidden;">
          <div class="fin-modal-header" style="background:linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.85) 100%); padding:1.25rem 1.75rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.3) 100%); border:1px solid rgba(16,185,129,0.35); display:flex; align-items:center; justify-content:center; font-size:1.3rem;">💳</div>
              <div>
                <h3 class="fin-modal-title" style="margin:0; font-size:1.2rem; font-weight:800; color:#f8fafc;">Disburse Salary Payout</h3>
                <p style="margin:2px 0 0 0; font-size:0.75rem; color:#94a3b8;">Deduct net wages directly from Bank Account or RAYAN E-Wallets</p>
              </div>
            </div>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeDisburseModal()" title="Close">&times;</button>
          </div>

          <form id="fin-disburse-form" onsubmit="window.finApp.processDisburseSalary(event, '${slip.id}')" style="padding:1.5rem;">
            <!-- Slip Summary Box -->
            <div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.25); border-radius:10px; padding:1rem; margin-bottom:1.25rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <span style="font-size:0.75rem; color:#94a3b8;">Employee:</span>
                <strong style="color:#f8fafc; font-size:0.95rem;">${escapeHtml(slip.employee_name)} (${escapeHtml(slip.employee_no)})</strong>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <span style="font-size:0.75rem; color:#94a3b8;">Pay Slip #:</span>
                <span style="color:#38bdf8; font-family:monospace; font-weight:700;">${escapeHtml(slip.slip_no)}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.5rem; margin-top:0.5rem;">
                <span style="font-size:0.82rem; font-weight:700; color:#10b981;">Net Salary to Deduct:</span>
                <strong style="font-size:1.25rem; font-weight:800; color:#10b981;">
                  ${this.formatCurrency(slip.net_pay, slip.currency || 'AED')}
                </strong>
              </div>
            </div>

            <!-- Payout Source Selection -->
            <div style="margin-bottom:1rem;">
              <label class="fin-form-label">Payment Source Type *</label>
              <select name="payout_source_type" id="fin-disb-source-type" class="fin-form-select" required onchange="window.finApp.onDisburseSourceTypeChange(this.value)">
                <option value="bank">Bank Account (Electronic Wire / Host To Host)</option>
                <option value="cash">RAYAN E-Wallets / Cash in Hand Register</option>
              </select>
            </div>

            <div style="margin-bottom:1rem;">
              <label class="fin-form-label">Select Account to Deduct Balance From *</label>
              <select name="payout_source_id" id="fin-disb-source-id" class="fin-form-select" required>
                ${bankAccounts.map(b => `<option value="${escapeHtml(b.id)}">🏦 ${escapeHtml(b.bank_name)} (${this.formatCurrency(b.balance)})</option>`).join('')}
              </select>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
              <div>
                <label class="fin-form-label">Disbursement Date</label>
                <input type="date" name="payment_date" class="fin-form-input" required value="${new Date().toISOString().split('T')[0]}">
              </div>
              <div>
                <label class="fin-form-label">Transaction / Cheque Ref</label>
                <input type="text" name="payout_reference" class="fin-form-input" value="TXN-PAYROLL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}">
              </div>
            </div>

            <!-- Actions -->
            <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
              <button type="button" class="fin-btn-secondary" onclick="window.finApp.closeDisburseModal()">Cancel</button>
              <button type="submit" class="fin-btn-primary" style="background:#10b981; border-color:#10b981;">
                ✓ Confirm &amp; Deduct Payout
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showCustomModal(html);
  };

  proto.onDisburseSourceTypeChange = function (type) {
    const idSel = document.getElementById('fin-disb-source-id');
    if (!idSel) return;

    if (type === 'cash') {
      const cashRegisters = (this.db?.cash_in_hand || []).filter(c => this.matchesActiveCompany(c.company_id));
      idSel.innerHTML = cashRegisters.map(c => `
        <option value="${escapeHtml(c.id)}">💵 ${escapeHtml(c.register_name || 'RAYAN E-Wallets')} (${this.formatCurrency(c.balance)})</option>
      `).join('');
    } else {
      const bankAccounts = (this.db?.bank_accounts || []).filter(b => this.matchesActiveCompany(b.company_id));
      idSel.innerHTML = bankAccounts.map(b => `
        <option value="${escapeHtml(b.id)}">🏦 ${escapeHtml(b.bank_name)} (${this.formatCurrency(b.balance)})</option>
      `).join('');
    }
  };

  proto.closeDisburseModal = function () {
    this.closeCustomModal('fin-disburse-modal-backdrop');
  };

  proto.processDisburseSalary = async function (e, slipId) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const slip = (this.db?.payroll || []).find(p => p.id === slipId);
    if (!slip) return;

    const sourceType = formData.get('payout_source_type') || 'bank';
    const sourceId = formData.get('payout_source_id') || '';
    const payDate = formData.get('payment_date') || new Date().toISOString().split('T')[0];
    const payRef = formData.get('payout_reference') || `TXN-PAYROLL-${Date.now().toString().slice(-6)}`;

    let sourceName = '';
    if (sourceType === 'cash') {
      const reg = (this.db?.cash_in_hand || []).find(c => c.id === sourceId);
      sourceName = reg ? reg.register_name : 'RAYAN E-Wallets';
    } else {
      const bank = (this.db?.bank_accounts || []).find(b => b.id === sourceId);
      sourceName = bank ? bank.bank_name : 'Bank Transfer';
    }

    slip.status = 'Paid';
    slip.payment_date = payDate;
    slip.payout_source_type = sourceType;
    slip.payout_source_id = sourceId;
    slip.payout_source_name = sourceName;
    slip.payout_reference = payRef;
    slip.updated_at = new Date().toISOString();

    // Deduct balance from Bank or Cash
    this.applyPayrollPayoutDeduction(slip);

    this.closeDisburseModal();
    this.normalizeAllBalances();
    if (typeof this.saveDatabaseToCache === 'function') {
      this.saveDatabaseToCache();
    }
    this.showToast ? this.showToast(`Salary disbursed: ${this.formatCurrency(slip.net_pay)} deducted from ${sourceName}`, 'success') : null;

    try {
      await this.syncWithBackend('disburse_payroll', {
        slip_id: slip.id,
        payroll: slip,
        source_type: sourceType,
        source_id: sourceId,
        amount: slip.net_pay,
        payment_date: payDate,
        payout_reference: payRef
      });
    } catch (err) {
      console.warn('Backend disburse sync warning:', err);
    }

    if (this.activeTab === 'payroll') {
      this.renderPayrollTab((document.getElementById('fin-tab-content-root') || document.getElementById('fin-view-container')));
    }
  };

  proto.disbursePayrollDirect = async function (slipId) {
    this.ensurePayrollSeedData();
    const slip = (this.db?.payroll || []).find(p => p.id === slipId);
    if (!slip) {
      alert('Pay slip not found');
      return;
    }

    const net = Number(slip.net_pay) || (Number(slip.total_earnings || 0) - Number(slip.total_deductions || 0));
    const sourceType = slip.payout_source_type || 'cash';
    let sourceName = slip.payout_source_name || (sourceType === 'cash' ? 'RAYAN E-Wallets' : 'Abu Dhabi Commercial Bank (ADCB)');
    let currentBalance = 0;

    if (sourceType === 'cash') {
      const reg = (this.db?.cash_in_hand || []).find(c => c.id === slip.payout_source_id) ||
        (this.db?.cash_in_hand || []).find(c => (c.register_name || '').toLowerCase().includes('wallet')) ||
        (this.db?.cash_in_hand || [])[0];
      if (reg) {
        sourceName = reg.register_name;
        currentBalance = Number(reg.balance) || 0;
        slip.payout_source_id = reg.id;
      }
    } else {
      const bank = (this.db?.bank_accounts || []).find(b => b.id === slip.payout_source_id) ||
        (this.db?.bank_accounts || [])[0];
      if (bank) {
        sourceName = bank.bank_name;
        currentBalance = Number(bank.balance) || 0;
        slip.payout_source_id = bank.id;
      }
    }
    slip.payout_source_name = sourceName;

    const confirmMsg = `⚡ Confirm Salary Payout & Direct Balance Deduction:\n\n` +
      `• Employee: ${slip.employee_name} (${slip.employee_no || ''})\n` +
      `• Pay Slip Ref: ${slip.slip_no}\n` +
      `• Target Period: ${slip.month_year || slip.period_label || 'Current'}\n` +
      `• Payout Net Amount: ${this.formatCurrency(net, slip.currency || 'AED')}\n` +
      `• Payment Source: ${sourceName} (Available Balance: ${this.formatCurrency(currentBalance)})\n\n` +
      `Click OK to deduct ${this.formatCurrency(net)} immediately from ${sourceName} and mark this slip as Paid.`;

    if (!confirm(confirmMsg)) return;

    slip.status = 'Paid';
    slip.payment_date = new Date().toISOString().split('T')[0];
    if (!slip.payout_reference) {
      slip.payout_reference = `TXN-PAYROLL-${slip.payment_date.replace(/-/g, '')}-${slip.employee_no || 'EMP'}`;
    }
    slip.updated_at = new Date().toISOString();

    // Execute direct deduction from cash or bank and create outflow voucher/wire
    this.applyPayrollPayoutDeduction(slip);
    this.normalizeAllBalances();
    if (typeof this.saveDatabaseToCache === 'function') {
      this.saveDatabaseToCache();
    }

    this.showToast
      ? this.showToast(`✓ Salary disbursed: ${this.formatCurrency(net)} deducted from ${sourceName}`, 'success')
      : alert(`✓ Salary disbursed: ${this.formatCurrency(net)} deducted from ${sourceName}`);

    // Sync with backend API
    try {
      await this.syncWithBackend('disburse_payroll', {
        slip_id: slip.id,
        payroll: slip,
        source_type: slip.payout_source_type || 'cash',
        source_id: slip.payout_source_id,
        amount: net,
        payment_date: slip.payment_date,
        payout_reference: slip.payout_reference
      });
    } catch (err) {
      console.warn('Backend disburse sync warning:', err);
    }

    if (this.activeTab === 'payroll') {
      this.renderPayrollTab((document.getElementById('fin-tab-content-root') || document.getElementById('fin-view-container')));
    } else if (typeof this.renderActiveTab === 'function') {
      this.renderActiveTab();
    }
  };

  proto.applyPayrollPayoutDeduction = function (slip) {
    const net = Number(slip.net_pay) || 0;
    if (net <= 0) return;

    const sourceType = slip.payout_source_type || 'bank';
    const sourceId = slip.payout_source_id;

    if (sourceType === 'cash') {
      let reg = (this.db?.cash_in_hand || []).find(c => c.id === sourceId);
      if (!reg) {
        reg = (this.db?.cash_in_hand || []).find(c => (c.register_name || '').toLowerCase().includes('rayan e-wallet'));
      }
      if (reg) {
        reg.balance = Math.round(((Number(reg.balance) || 0) - net) * 100) / 100;

        // Create Cash Voucher Record
        if (!Array.isArray(this.db.cash_vouchers)) this.db.cash_vouchers = [];
        const cvNo = slip.payout_reference || `CV-SAL-${slip.employee_no}-${Date.now().toString().slice(-4)}`;
        const exists = this.db.cash_vouchers.find(v => v.voucher_no === cvNo || (v.purpose && v.purpose.includes(slip.slip_no)));
        if (!exists) {
          this.db.cash_vouchers.unshift({
            id: `cv-${Date.now()}`,
            voucher_no: cvNo,
            company_id: slip.company_id || 'rayan-corp-uae',
            register_id: reg.id,
            cash_in_hand_id: reg.id,
            register_name: reg.register_name,
            custodian: reg.custodian || 'Arshad Alam Shaikh',
            voucher_date: slip.payment_date || new Date().toISOString().split('T')[0],
            date: slip.payment_date || new Date().toISOString().split('T')[0],
            type: 'outflow',
            category: 'Salary & Labor Payout',
            payee: slip.employee_name,
            party_name: slip.employee_name,
            amount: net,
            currency: slip.currency || 'AED',
            purpose: `Salary Payout for ${slip.month_year || slip.period_label} to ${slip.employee_name} (${slip.slip_no})`,
            status: 'Approved',
            created_at: new Date().toISOString()
          });
        }
      }
    } else {
      let bank = (this.db?.bank_accounts || []).find(b => b.id === sourceId);
      if (!bank && Array.isArray(this.db?.bank_accounts) && this.db.bank_accounts.length > 0) {
        bank = this.db.bank_accounts[0];
      }
      if (bank) {
        bank.balance = Math.round(((Number(bank.balance) || 0) - net) * 100) / 100;

        // Create Outward Bank Transfer Record
        if (!Array.isArray(this.db.bank_transfers)) this.db.bank_transfers = [];
        const wireRef = slip.payout_reference || `SAL-${slip.slip_no.replace(/[^a-zA-Z0-9]/g, '')}`;
        const exists = this.db.bank_transfers.find(w => w.reference_no === wireRef || (w.purpose && w.purpose.includes(slip.slip_no)));
        if (!exists) {
          this.db.bank_transfers.unshift({
            id: `wire-${Date.now()}`,
            company_id: slip.company_id || 'rayan-corp-uae',
            reference_no: wireRef,
            transfer_date: slip.payment_date || new Date().toISOString().split('T')[0],
            date: slip.payment_date || new Date().toISOString().split('T')[0],
            counterparty: slip.employee_name,
            source_account_id: bank.id,
            source_bank: bank.bank_name || 'Bank',
            type: 'outward',
            type_label: 'Salary & Wage Payout',
            amount: net,
            currency: slip.currency || 'AED',
            purpose: `Salary Payout for ${slip.month_year || slip.period_label} to ${slip.employee_name} (${slip.slip_no})`,
            status: 'Cleared',
            created_at: new Date().toISOString()
          });
        }
      }
    }
  };

  // ==========================================================================
  // 7. EXACT REPLICA PRINT PREVIEW & PDF EXPORT MODAL
  // ==========================================================================
  proto.openPayslipPrintModal = function (slipOrEmpId = null) {
    this.ensurePayrollSeedData();
    let slip = null;
    const allSlips = this.db?.payroll || [];

    if (slipOrEmpId) {
      slip = allSlips.find(p => p.id === slipOrEmpId || p.slip_no === slipOrEmpId || p.employee_id === slipOrEmpId || (p.employee_no && p.employee_no === slipOrEmpId));
      if (!slip) {
        const emp = (this.db?.employees || []).find(e => e.id === slipOrEmpId || e.employee_no === slipOrEmpId || e.name === slipOrEmpId);
        if (emp) {
          // Look for existing slip for this employee
          slip = allSlips.find(p => p.employee_id === emp.id || (emp.employee_no && p.employee_no === emp.employee_no));
          if (!slip) {
            // Build official dynamic slip for this employee based on their profile
            const basic = Number(emp.basic_salary) || 9500;
            const acc = Number(emp.accommodation_allowance) || 0;
            const cons = Number(emp.consolidated_allowance) || 0;
            const oth = Number(emp.other_allowance) || 0;
            const totEarn = basic + acc + cons + oth;
            slip = {
              id: `ps-${emp.id}-${Date.now().toString(36)}`,
              slip_no: `PSJune 2026/${emp.employee_no || 'EN12001'}`,
              company_id: emp.company_id || this.activeCompanyId || 'rayan-corp-uae',
              employee_id: emp.id,
              employee_name: emp.name,
              employee_no: emp.employee_no,
              position: emp.position,
              department: emp.department || 'Rayan Engineering',
              date_of_joining: emp.date_of_joining,
              month_year: 'June 2026',
              period_label: 'June 2026',
              currency: emp.currency || 'AED',
              basic_salary: basic,
              accommodation_allowance: acc,
              consolidated_allowance: cons,
              normal_overtime: oth,
              overtime_hrs: '0.0',
              total_earnings: totEarn,
              advance_deduction: 0,
              absence_deduction: 0,
              loan_deduction: 0,
              total_deductions: 0,
              net_pay: totEarn,
              payout_source_type: (emp.bank_name && !emp.bank_name.toLowerCase().includes('cash')) ? 'bank' : 'cash',
              bank_name: emp.bank_name || 'Emirates NBD Bank PJSC',
              account_no: emp.account_no || emp.iban || 'Cash In Hand',
              status: 'Paid',
              payment_date: '2026-06-30'
            };
            if (!Array.isArray(this.db.payroll)) this.db.payroll = [];
            this.db.payroll.push(slip);
            if (typeof this.saveDatabaseToCache === 'function') { this.saveDatabaseToCache(); } else { try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (err) { } }
          }
        }
      }
    }
    if (!slip) {
      slip = allSlips[0] || {};
    }

    const isIndia = this.activeCompanyId === 'ashaz-eng-in';
    const curr = slip.currency || (isIndia ? 'INR' : 'AED');
    const comp = (this.db?.companies || []).find(c => c.id === (slip.company_id || this.activeCompanyId)) ||
      (this.companies || []).find(c => c.id === (slip.company_id || this.activeCompanyId)) ||
      (this.db?.companies || [])[0] || {};
    const compName = 'RAYAN ENGINEERING AND CONTRACTING LLC SPC';
    const compTrn = isIndia ? (comp.gstin || '27AABCU9603R1ZM') : (comp.trn_vat || '104937380400003');

    const basicVal = Number(slip.basic_salary) || 9500;
    const accVal = Number(slip.accommodation_allowance) || 5500;
    const consVal = Number(slip.consolidated_allowance) || 0;
    const otVal = Number(slip.normal_overtime) || 0;
    const totEarnVal = Number(slip.total_earnings) || (basicVal + accVal + consVal + otVal);
    const totDedVal = Number(slip.total_deductions) || 0;
    const netVal = Number(slip.net_pay) || (totEarnVal - totDedVal);

    const slipDocNo = slip.slip_no || slip.emp_id || 'Pay-Slip';
    const modalHtml = `
      <div class="fin-doc-modal-backdrop" id="fin-doc-print-modal" data-doc-no="${escapeHtml(slipDocNo)}" data-doc-type="Employee Pay Slip">
        <style>
          #fin-doc-print-modal [contenteditable="true"] {
            transition: background 0.15s, outline 0.15s;
            border-radius: 2px;
            padding: 1px 3px;
          }
          #fin-doc-print-modal [contenteditable="true"]:hover {
            background: rgba(56, 189, 248, 0.12) !important;
            outline: 1px dashed #0284c7 !important;
            cursor: text;
          }
          #fin-doc-print-modal [contenteditable="true"]:focus {
            background: rgba(56, 189, 248, 0.22) !important;
            outline: 1.5px solid #0284c7 !important;
          }
          @media print {
            #fin-doc-print-modal [contenteditable="true"] {
              outline: none !important;
              background: transparent !important;
              padding: 0 !important;
            }
            .no-print {
              display: none !important;
            }
          }
        </style>
        <div class="fin-doc-toolbar">
          <div class="fin-doc-toolbar-left">
            <div class="fin-doc-title-badge">
              <span>📜</span>
              <span>Employee Pay Slip (قسيمة راتب الموظف) — ${escapeHtml(slip.slip_no || 'PSJune 2026/EN12001')}</span>
            </div>
            <div class="fin-doc-type-pills">
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openInvoicePrintModal()">Tax Invoice</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openReceiptPrintModal()">Receipt Voucher</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPaymentPrintModal()">Payment Voucher</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openBillPrintModal()">Purchase Bill</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPOPrintModal()">Purchase Order</button>
              <button type="button" class="fin-doc-pill-btn active" onclick="window.finApp.openPayslipPrintModal('${slip.id}')">Employee Pay Slip</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openEmploymentCertificatePrintModal()">Emp Cert</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openLetterOfAssignmentPrintModal()">Assignment Letter</button>
            </div>
          </div>
          <div class="fin-doc-toolbar-right">
            <button type="button" class="fin-btn-print-action fin-btn-toggle-stamp" id="btn-toggle-stamp-sign" onclick="window.finApp.toggleDocStampSign()" title="Toggle Stamp & Signature On / Off">
              <span>🔲</span> Toggle Stamp &amp; Sign
            </button>
            <button type="button" class="fin-btn-print-action" onclick="window.finApp.closeDocPrintModal(); window.finApp.openPayslipModal('${slip.id}')" style="color:#f59e0b; border-color:rgba(245,158,11,0.4);">
              <span>✏️</span> Edit Pay Slip (Form)
            </button>
            <button type="button" class="fin-btn-print-primary" onclick="window.finApp ? window.finApp.printDocument() : window.print()">
              <span>🖨️</span> Print / Save as PDF
            </button>
            <button type="button" class="fin-btn-print-action" onclick="window.finApp.downloadPayslipDocument('${slip.id}')">
              <span>⬇️</span> Download Document
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-close" onclick="window.finApp.closeDocPrintModal()">
              <span>✕</span> Close
            </button>
          </div>
        </div>

        <div class="fin-doc-viewport">
          <div class="fin-document-paper" style="background:#ffffff; color:#111827; padding:8mm 12mm 6mm 12mm; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing:border-box; width:100%; max-width:820px; margin:0 auto 1.5rem auto; box-shadow:0 4px 20px rgba(0,0,0,0.08); border-radius:4px; page-break-inside:avoid !important; break-inside:avoid !important; flex-shrink:0; min-height:auto; height:auto; position:relative; overflow:hidden; font-size:11px;">

            <!-- Center Watermark -->
            ${this.getRayanWatermark ? this.getRayanWatermark() : ''}

            <!-- Document Content Layer -->
            <div style="position:relative; z-index:1;">

              <!-- 3-Column Header Grid matching Official Rayan Layout -->
              <div style="display:grid; grid-template-columns:1fr auto 1fr; align-items:start; margin-bottom:0.75rem; gap:0.75rem; width:100%;">
                <!-- Column 1: Logo & Company & QR -->
                <div style="justify-self:start; max-width:100%;">
                  <div style="margin-bottom:0.35rem;">
                    <img src="/assets/docs/rayan-doc-logo.png" alt="RAYAN ENGINEERING" style="height:40px; width:auto; display:block;">
                  </div>
                  <div style="font-size:0.74rem; font-weight:800; color:#111827; text-transform:uppercase; letter-spacing:0.01em; line-height:1.25; margin-bottom:1px;">
                    ${compName}
                  </div>
                  <div style="font-size:0.68rem; color:#4b5563; line-height:1.3; margin-bottom:2px;">
                    ${isIndia ? 'GSTIN' : 'TRN'}: ${compTrn}
                  </div>
                  ${this.getRayanDynamicVerificationCode ? this.getRayanDynamicVerificationCode(slip, 'payslip') : ''}
                </div>

                <!-- Column 2: Exact Dead-Center Bilingual Title -->
                <div style="text-align:center; padding-top:2px; justify-self:center; min-width:210px;">
                  <div style="font-family:'Amiri', serif; font-size:1.35rem; font-weight:700; color:#0284c7; line-height:1.15;">قسيمة راتب الموظف</div>
                  <div style="font-family:'Outfit', -apple-system, sans-serif; font-size:1.45rem; font-weight:800; color:#111827; letter-spacing:0.02em; line-height:1.1;">EMPLOYEE PAY SLIP</div>
                  <div style="font-size:0.62rem; color:#64748b; font-weight:700; margin-top:2px; letter-spacing:0.04em; text-transform:uppercase;">SALARY DISBURSEMENT STATEMENT — ${escapeHtml(slip.month_year || 'Jun-26')}</div>
                </div>

                <!-- Column 3: Metadata -->
                <div style="text-align:right; justify-self:end;">
                  <div style="font-size:0.92rem; font-weight:800; color:#0284c7; font-family:monospace; margin-bottom:2px;" contenteditable="true" spellcheck="false" title="Click to edit slip no">
                    ${escapeHtml(slip.slip_no || 'PSJune 2026/EN12001')}
                  </div>
                  <div style="font-size:0.80rem; font-weight:700; color:#111827; margin-bottom:4px;">
                    Period: <span contenteditable="true" spellcheck="false" title="Click to edit month">${escapeHtml(slip.month_year || 'Jun-26')}</span>
                  </div>
                  <div style="margin-bottom:5px;">
                    <span style="background:rgba(16,185,129,0.12); color:#059669; border:1px solid rgba(16,185,129,0.3); padding:2px 8px; border-radius:4px; font-weight:800; font-size:0.68rem; letter-spacing:0.04em;">
                      DISBURSED
                    </span>
                  </div>
                  <table style="margin-left:auto; font-size:0.74rem; color:#4b5563; border-collapse:collapse; text-align:right; white-space:nowrap;">
                    <tr>
                      <td style="padding:1px 6px; color:#6b7280;">Printed Date :</td>
                      <td style="padding:1px 0 1px 6px; font-weight:700; color:#111827;" contenteditable="true" spellcheck="false" title="Click to edit date">${escapeHtml(slip.printed_date || '10-Jul-26')}</td>
                    </tr>
                    <tr>
                      <td style="padding:1px 6px; color:#6b7280;">Currency :</td>
                      <td style="padding:1px 0 1px 6px; font-weight:700; color:#0284c7;" contenteditable="true" spellcheck="false" title="Click to edit currency">${escapeHtml(slip.currency || 'AED')}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- TABLE 1: Employee Information -->
              <div style="margin-bottom:0.75rem; border:1px solid #cbd5e1; border-radius:4px; overflow:hidden;">
                <div style="background:#0f172a; color:#ffffff; padding:5px 8px; font-size:0.72rem; font-weight:800; text-align:center; text-transform:uppercase; letter-spacing:0.03em;">
                  Employee Information (بيانات الموظف)
                </div>
                <div style="display:flex; align-items:stretch;">
                  ${(function () {
        const matchedEmp = (allSlips && slip.employee_id) ? (window.finApp?.db?.employees || []).find(e => e.id === slip.employee_id || e.employee_no === slip.employee_no) : null;
        if (matchedEmp && matchedEmp.photo) {
          return `
                        <div style="padding:6px; background:#f8fafc; border-right:1px solid #cbd5e1; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                          <img src="${matchedEmp.photo}" alt="Staff Photo" style="width:58px; height:68px; object-fit:cover; border-radius:4px; border:1px solid #cbd5e1; box-shadow:0 1px 4px rgba(0,0,0,0.1);">
                        </div>
                      `;
        }
        return '';
      })()}
                <table style="width:100%; border-collapse:collapse; font-size:0.72rem; text-align:left;">
                  <tbody>
                    <tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:4px 8px; width:16%; font-weight:600; color:#475569; background:#f8fafc;">Employee No.</td>
                      <td style="padding:4px 8px; width:20%; font-weight:700; color:#111827;"><span contenteditable="true" spellcheck="false" title="Click to edit">${escapeHtml(slip.employee_no || 'EN12001')}</span></td>
                      <td style="padding:4px 8px; width:16%; font-weight:600; color:#475569; background:#f8fafc;">Date Of Appt.</td>
                      <td style="padding:4px 8px; width:20%; font-weight:700; color:#111827;"><span contenteditable="true" spellcheck="false" title="Click to edit">${escapeHtml(slip.date_of_appointment || '2025-08-07')}</span></td>
                      <td style="padding:4px 8px; width:12%; font-weight:600; color:#475569; background:#f8fafc;">Currency</td>
                      <td style="padding:4px 8px; width:16%; font-weight:700; color:#0284c7;"><span contenteditable="true" spellcheck="false" title="Click to edit">${escapeHtml(slip.currency || 'AED')}</span></td>
                    </tr>
                    <tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:4px 8px; font-weight:600; color:#475569; background:#f8fafc;">Employee Name</td>
                      <td colspan="5" style="padding:4px 8px; font-weight:800; color:#111827; font-size:0.78rem;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit employee name">${escapeHtml(slip.employee_name || 'Bakhteyar Alam Mokhtar Ahmad')}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:4px 8px; font-weight:600; color:#475569; background:#f8fafc;">Position</td>
                      <td colspan="2" style="padding:4px 8px; font-weight:700; color:#111827;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit position">${escapeHtml(slip.position || 'Civil Engineer')}</span>
                      </td>
                      <td style="padding:4px 8px; font-weight:600; color:#475569; background:#f8fafc;">Department</td>
                      <td colspan="2" style="padding:4px 8px; font-weight:700; color:#111827;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit department">${escapeHtml(slip.department || 'Rayan Engineering')}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>

              <!-- TABLE 2: Salary Breakdown (Earnings vs Deductions) -->
              <div style="margin-bottom:0.75rem; border:1px solid #cbd5e1; border-radius:4px; overflow:hidden;">
                <div style="background:#0f172a; color:#ffffff; padding:5px 8px; font-size:0.72rem; font-weight:800; text-align:center; text-transform:uppercase; letter-spacing:0.03em;">
                  Salary Breakdown (تفاصيل الراتب والبدلات والاستقطاعات)
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:0.72rem; text-align:left;">
                  <thead>
                    <tr style="background:#f8fafc; border-bottom:1px solid #cbd5e1; font-size:0.70rem; font-weight:700;">
                      <th colspan="2" style="padding:4px 8px; text-align:center; width:50%; color:#0f172a; border-right:1px solid #cbd5e1;">EARNINGS (المستحقات)</th>
                      <th colspan="2" style="padding:4px 8px; text-align:center; width:50%; color:#0f172a;">DEDUCTIONS (الاستقطاعات)</th>
                    </tr>
                    <tr style="background:#f1f5f9; border-bottom:1px solid #cbd5e1; font-size:0.68rem; color:#475569; text-transform:uppercase;">
                      <th style="padding:3px 8px; width:28%;">Element Name</th>
                      <th style="padding:3px 8px; text-align:right; width:22%; border-right:1px solid #cbd5e1;">Amount</th>
                      <th style="padding:3px 8px; width:28%;">Element Name</th>
                      <th style="padding:3px 8px; text-align:right; width:22%;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:4px 8px; color:#334155;">Basic Salary</td>
                      <td style="padding:4px 8px; text-align:right; font-weight:700; color:#111827; border-right:1px solid #cbd5e1;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit">${formatMoney(slip.basic_salary || basicVal, curr)}</span>
                      </td>
                      <td style="padding:4px 8px; color:#64748b;"><span contenteditable="true" spellcheck="false">${slip.advance_deduction > 0 ? 'Salary Advance' : ''}</span></td>
                      <td style="padding:4px 8px; text-align:right; color:#dc2626;"><span contenteditable="true" spellcheck="false">${slip.advance_deduction > 0 ? formatMoney(slip.advance_deduction, curr) : ''}</span></td>
                    </tr>
                    <tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:4px 8px; color:#334155;">Accommodation Allowance</td>
                      <td style="padding:4px 8px; text-align:right; font-weight:700; color:#111827; border-right:1px solid #cbd5e1;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit">${formatMoney(slip.accommodation_allowance || accVal, curr)}</span>
                      </td>
                      <td style="padding:4px 8px; color:#64748b;"><span contenteditable="true" spellcheck="false">${slip.absence_deduction > 0 ? 'Absence / Leave' : ''}</span></td>
                      <td style="padding:4px 8px; text-align:right; color:#dc2626;"><span contenteditable="true" spellcheck="false">${slip.absence_deduction > 0 ? formatMoney(slip.absence_deduction, curr) : ''}</span></td>
                    </tr>
                    <tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:4px 8px; color:#334155;">Consolidated Allowance</td>
                      <td style="padding:4px 8px; text-align:right; font-weight:700; color:#111827; border-right:1px solid #cbd5e1;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit">${formatMoney(slip.consolidated_allowance || consVal, curr)}</span>
                      </td>
                      <td style="padding:4px 8px; color:#64748b;"><span contenteditable="true" spellcheck="false">${slip.loan_deduction > 0 ? 'Loan / Penalties' : ''}</span></td>
                      <td style="padding:4px 8px; text-align:right; color:#dc2626;"><span contenteditable="true" spellcheck="false">${slip.loan_deduction > 0 ? formatMoney(slip.loan_deduction, curr) : ''}</span></td>
                    </tr>
                    <tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:4px 8px; color:#334155;">Normal Overtime</td>
                      <td style="padding:4px 8px; text-align:right; font-weight:700; color:#111827; border-right:1px solid #cbd5e1;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit">${formatMoney(slip.normal_overtime || otVal, curr)}</span>
                      </td>
                      <td style="padding:4px 8px;"></td>
                      <td style="padding:4px 8px; text-align:right;"></td>
                    </tr>
                    <tr style="font-weight:700; background:#f8fafc; border-bottom:1px solid #cbd5e1;">
                      <td style="padding:4px 8px; color:#0f172a;">Total Earnings</td>
                      <td style="padding:4px 8px; text-align:right; color:#0f172a; border-right:1px solid #cbd5e1;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit">${formatMoney(slip.total_earnings || totEarnVal, curr)}</span>
                      </td>
                      <td style="padding:4px 8px; color:#0f172a;">Total Deductions</td>
                      <td style="padding:4px 8px; text-align:right; color:#dc2626;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit">${totDedVal > 0 ? formatMoney(totDedVal, curr) : ''}</span>
                      </td>
                    </tr>
                    <tr style="font-weight:800; font-size:0.84rem; background:#ecfdf5;">
                      <td colspan="3" style="padding:6px 10px; color:#15803d; border-right:1px solid #86efac; text-transform:uppercase;">
                        Net Pay (صافي الراتب المستحق)
                      </td>
                      <td style="padding:6px 10px; text-align:right; color:#15803d; font-size:0.92rem; font-family:'Outfit', sans-serif;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit net pay">${formatMoney(slip.net_pay || netVal, curr)}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- TABLE 3: Payment Details -->
              <div style="margin-bottom:0.75rem; border:1px solid #cbd5e1; border-radius:4px; overflow:hidden;">
                <div style="background:#0f172a; color:#ffffff; padding:5px 8px; font-size:0.72rem; font-weight:800; text-align:center; text-transform:uppercase; letter-spacing:0.03em;">
                  Payment Details (بيانات التحويل البنكي)
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:0.72rem; text-align:left;">
                  <tbody>
                    <tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:4px 8px; width:18%; font-weight:600; color:#475569; background:#f8fafc;">Bank Name</td>
                      <td style="padding:4px 8px; width:34%; font-weight:700; color:#111827;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit">${escapeHtml(slip.bank_name || 'Emirates NBD Bank PJSC')}</span>
                      </td>
                      <td style="padding:4px 8px; width:18%; font-weight:600; color:#475569; background:#f8fafc;">Swift/IFSC</td>
                      <td style="padding:4px 8px; width:30%; font-weight:700; color:#111827;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit">${escapeHtml(slip.swift || 'EBILAEADXXX')}</span>
                      </td>
                    </tr>
                    <tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:4px 8px; font-weight:600; color:#475569; background:#f8fafc;">IBAN No.</td>
                      <td style="padding:4px 8px; font-weight:700; color:#0284c7; font-family:monospace;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit">${escapeHtml(slip.iban || 'AE860260001015934645101')}</span>
                      </td>
                      <td style="padding:4px 8px; font-weight:600; color:#475569; background:#f8fafc;">Account No.</td>
                      <td style="padding:4px 8px; font-weight:700; color:#111827; font-family:monospace;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit">${escapeHtml(slip.account_no || 'AE860260001015934645101')}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:4px 8px; font-weight:600; color:#475569; background:#f8fafc;">Pay Method</td>
                      <td style="padding:4px 8px; font-weight:700; color:#111827;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit">${escapeHtml(slip.pay_method || 'AED RAYAN GROUP Host To Host')}</span>
                      </td>
                      <td style="padding:4px 8px; font-weight:600; color:#475569; background:#f8fafc;">Transferred Amount</td>
                      <td style="padding:4px 8px; font-weight:800; color:#15803d; font-size:0.80rem; text-align:right;">
                        <span contenteditable="true" spellcheck="false" title="Click to edit">${formatMoney(slip.transferred_amount || netVal, curr)}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- TABLE 4: Employee Break Down for the month -->
              <div style="margin-bottom:0.75rem; border:1px solid #cbd5e1; border-radius:4px; overflow:hidden;">
                <div style="background:#0f172a; color:#ffffff; padding:5px 8px; font-size:0.72rem; font-weight:800; text-align:center; text-transform:uppercase; letter-spacing:0.03em;">
                  Employee Break Down for the month of ${escapeHtml(slip.period_label || slip.month_year || 'June 2026')}
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:0.72rem; text-align:left;">
                  <thead>
                    <tr style="background:#f1f5f9; color:#475569; font-size:0.68rem; text-transform:uppercase; border-bottom:1px solid #cbd5e1;">
                      <th style="padding:4px 8px; width:15%;">Date</th>
                      <th style="padding:4px 8px; width:30%;">Element Name</th>
                      <th style="padding:4px 8px; width:22%;">Element Type</th>
                      <th style="padding:4px 8px; width:15%;">Remark</th>
                      <th style="padding:4px 8px; width:6%; text-align:center;">Hrs</th>
                      <th style="padding:4px 8px; width:12%; text-align:right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(slip.breakdown_items && slip.breakdown_items.length > 0) ? slip.breakdown_items.map(item => `
                      <tr style="border-bottom:1px solid #e2e8f0;">
                        <td style="padding:4px 8px; color:#64748b;"><span contenteditable="true" spellcheck="false">${escapeHtml(item.date || '10/07/2026')}</span></td>
                        <td style="padding:4px 8px; font-weight:600; color:#111827;"><span contenteditable="true" spellcheck="false">${escapeHtml(item.element_name || '')}</span></td>
                        <td style="padding:4px 8px; color:#475569;"><span contenteditable="true" spellcheck="false">${escapeHtml(item.element_type || 'Standard Earnings')}</span></td>
                        <td style="padding:4px 8px; color:#64748b;"><span contenteditable="true" spellcheck="false">${escapeHtml(item.remark || '')}</span></td>
                        <td style="padding:4px 8px; text-align:center; color:#64748b;"><span contenteditable="true" spellcheck="false">${escapeHtml(item.hrs || '')}</span></td>
                        <td style="padding:4px 8px; text-align:right; font-weight:700; color:#111827;"><span contenteditable="true" spellcheck="false">${formatMoney(item.amount, curr)}</span></td>
                      </tr>
                    `).join('') : `
                      <tr style="border-bottom:1px solid #e2e8f0;">
                        <td style="padding:4px 8px; color:#64748b;"><span contenteditable="true" spellcheck="false">10/07/2026</span></td>
                        <td style="padding:4px 8px; font-weight:600; color:#111827;"><span contenteditable="true" spellcheck="false">Basic Salary</span></td>
                        <td style="padding:4px 8px; color:#475569;"><span contenteditable="true" spellcheck="false">Standard Earnings</span></td>
                        <td style="padding:4px 8px;"><span contenteditable="true" spellcheck="false">Standard Basic Monthly</span></td>
                        <td style="padding:4px 8px; text-align:center;"></td>
                        <td style="padding:4px 8px; text-align:right; font-weight:700; color:#111827;"><span contenteditable="true" spellcheck="false">${formatMoney(basicVal, curr)}</span></td>
                      </tr>
                      <tr style="border-bottom:1px solid #e2e8f0;">
                        <td style="padding:4px 8px; color:#64748b;"><span contenteditable="true" spellcheck="false">10/07/2026</span></td>
                        <td style="padding:4px 8px; font-weight:600; color:#111827;"><span contenteditable="true" spellcheck="false">Accommodation Allowance</span></td>
                        <td style="padding:4px 8px; color:#475569;"><span contenteditable="true" spellcheck="false">Standard Earnings</span></td>
                        <td style="padding:4px 8px;"><span contenteditable="true" spellcheck="false">Housing Allowance</span></td>
                        <td style="padding:4px 8px; text-align:center;"></td>
                        <td style="padding:4px 8px; text-align:right; font-weight:700; color:#111827;"><span contenteditable="true" spellcheck="false">${formatMoney(accVal, curr)}</span></td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>

              <!-- Cost Center Allocation Note -->
              ${slip.project_name ? `
                <div style="font-size:0.68rem; color:#64748b; margin-top:-0.35rem; margin-bottom:0.75rem; font-style:italic;" contenteditable="true" spellcheck="false">
                  Cost Center Allocation: ${escapeHtml(slip.project_name)} &bull; Direct Project Profit/Loss Deduction
                </div>
              ` : ''}

              <!-- Dual Authorised Signatures Section (2 Columns) -->
              <table style="width:100%; table-layout:fixed; border-collapse:collapse; margin-top:0.5rem; padding-top:0.35rem; border-top:1px solid #cbd5e1; page-break-inside:avoid !important; break-inside:avoid !important;">
                <colgroup>
                  <col style="width:50%;">
                  <col style="width:50%;">
                </colgroup>
                <tr>
                  <!-- Left Column: Employee Acknowledgment -->
                  <td style="vertical-align:bottom; text-align:center; padding:0 12px;">
                    <div style="font-size:0.64rem; font-weight:800; color:#111827; text-transform:uppercase; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      EMPLOYEE ACKNOWLEDGMENT (إقرار الموظف)
                    </div>
                    <div style="position:relative; width:180px; height:70px; margin:0 auto; display:flex; align-items:center; justify-content:center;">
                      <div style="border:1.5px dashed #94a3b8; border-radius:4px; width:170px; height:54px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#64748b; font-size:0.58rem; font-weight:700; background:#f8fafc; white-space:nowrap; box-sizing:border-box;">
                        <div>[ Employee Acceptance &amp; Signature ]</div>
                        <div style="font-size:0.52rem; color:#0284c7; margin-top:2px;">Received with thanks</div>
                      </div>
                    </div>
                    <div style="border-top:1.5px solid #111827; width:160px; margin:3px auto 3px auto;"></div>
                    <div style="font-size:0.64rem; font-weight:800; color:#111827;" contenteditable="true" spellcheck="false" title="Click to edit">${escapeHtml(slip.employee_name || 'Employee Signature')}</div>
                    <div style="font-size:0.58rem; color:#4b5563;">Date: ${escapeHtml(slip.printed_date || '10-Jul-26')}</div>
                  </td>

                  <!-- Right Column: Rayan Engineering Authorised Signatory with stamp & signature -->
                  <td style="vertical-align:bottom; text-align:center; padding:0 12px;">
                    <div style="font-size:0.64rem; font-weight:800; color:#111827; text-transform:uppercase; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${compName}
                    </div>
                    <div id="payslip-stamp-signature-wrap" class="fin-stamp-sign-container" style="position:relative; width:180px; height:74px; margin:0 auto; cursor:pointer;" onclick="window.finApp.toggleDocStampSign()" title="Click to show/hide stamp & signature">
                      <img id="payslip-stamp" src="/assets/docs/rayan-stamp-official.png" alt="Rayan Official Stamp" style="position:absolute; left:8px; top:-6px; width:76px; height:76px; mix-blend-mode:multiply; opacity:0.95; pointer-events:none; z-index:1; transition:opacity 0.2s;">
                      <img id="payslip-signature" src="/assets/docs/rayan-signature-official.png" alt="Arshad Alam Shaikh Signature" style="position:absolute; left:30px; top:10px; width:125px; height:auto; mix-blend-mode:multiply; opacity:0.95; pointer-events:none; z-index:2; transition:opacity 0.2s;">
                    </div>
                    <div style="border-top:1.5px solid #111827; width:160px; margin:3px auto 3px auto;"></div>
                    <div style="font-size:0.64rem; font-weight:800; color:#111827;" contenteditable="true" spellcheck="false" title="Click to edit title">Authorised Signatory</div>
                    <div style="font-size:0.58rem; color:#4b5563;" contenteditable="true" spellcheck="false" title="Click to edit name">Arshad Alam Shaikh &bull; Managing Director</div>
                  </td>
                </tr>
              </table>

              <!-- Notes & Best Wishes Section -->
              <div style="margin-top:0.75rem; font-size:0.58rem; color:#475569; line-height:1.45; page-break-inside:avoid !important; break-inside:avoid !important;">
                <div style="font-weight:700; color:#111827; margin-bottom:1px;">Notes:</div>
                <div style="margin-bottom:2px; color:#475569;" contenteditable="true" spellcheck="false">Please keep a copy of this pay slip for your confidential personal tax and employment records.</div>
                <div style="font-weight:800; color:#111827;">Best wishes,</div>
                <div style="font-weight:700; color:#0284c7;">RAYAN Group Team</div>
                <div style="color:#64748b;">Abu Dhabi, U.A.E &nbsp;&bull;&nbsp; Hotline : +971 2 565 4497 &nbsp;&bull;&nbsp; <a href="mailto:info@rayan-group.com" style="color:#0284c7; text-decoration:none;">info@rayan-group.com</a> &nbsp;&bull;&nbsp; <a href="http://rayan-group.com" target="_blank" style="color:#0284c7; text-decoration:none;">http://rayan-group.com</a></div>
              </div>

              <!-- Clean Fixed System-Generated Footer Below the Line (Spaced) -->
              <div style="margin-top:1.15rem; padding-top:0.55rem; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; font-size:0.68rem; color:#64748b; font-family:'Plus Jakarta Sans', -apple-system, sans-serif; page-break-inside:avoid !important; break-inside:avoid !important;">
                <div style="min-width:60px; font-weight:600; color:#9ca3af;">${escapeHtml(slip.slip_no || 'PSJune 2026/EN12001')}</div>
                <div style="flex:1; text-align:center; letter-spacing:0.01em; font-weight:500;">
                  This is a system-generated Employee Pay Slip and does not require a signature or stamp.
                </div>
                <div style="min-width:60px; text-align:right; font-size:0.65rem; color:#9ca3af;">Page 1 of 1</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    `;

    this.getModalContainer().innerHTML = modalHtml;
    document.body.classList.add('fin-doc-open');
    if (this.setActiveDocumentTitle) this.setActiveDocumentTitle(slipDocNo, 'Employee Pay Slip', slip.employee_name);
  };

  proto.downloadPayslipDocument = function (slipId) {
    const slip = (this.db?.payroll || []).find(p => p.id === slipId) || (this.db?.payroll || [])[0];
    const cleanDocNo = this.sanitizeFilename ? this.sanitizeFilename(slip?.slip_no || slip?.emp_id || 'Pay-Slip') : (slip?.slip_no || 'Pay-Slip').replace(/[/\\?%*:|"<>]/g, '-');
    const filename = `${cleanDocNo} - Employee Pay Slip.html`;
    const paper = document.querySelector('.fin-document-paper');
    if (!paper) {
      window.print();
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(this.sanitizeFilename ? this.sanitizeFilename(slip?.slip_no || 'Pay-Slip') : (slip?.slip_no || 'Pay-Slip'))} - Employee Pay Slip</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap">
        <style>
          body { margin:0; padding:20px; background:#f1f5f9; font-family:'Plus Jakarta Sans', sans-serif; }
          .fin-document-paper { background:#fff; max-width:800px; margin:0 auto; padding:12mm; border-radius:6px; box-shadow:0 4px 15px rgba(0,0,0,0.1); }
          @media print {
            body { background:#fff; padding:0; }
            .fin-document-paper { box-shadow:none; padding:5mm; width:100%; max-width:100%; }
          }
        </style>
      </head>
      <body>
        ${paper.outerHTML}
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ==========================================================================
  // 8. CSV EXPORTS
  // ==========================================================================
  proto.exportEmployeesCsv = function () {
    const employees = (this.db?.employees || []).filter(e => this.matchesActiveCompany(e.company_id));
    if (employees.length === 0) {
      alert('No employee records to export');
      return;
    }

    const headers = [
      'Employee No', 'Name', 'Position', 'Department', 'Date of Joining',
      'Currency', 'Phone', 'Email', 'Emirates ID',
      'Basic Salary', 'Accommodation Allowance', 'Consolidated Allowance', 'Other Allowance', 'Total Standard Salary',
      'Bank Name', 'Swift', 'IBAN', 'Account No', 'Pay Method',
      'Project Allocation', 'Status'
    ];

    const rows = employees.map(e => {
      const basic = Number(e.basic_salary) || 0;
      const acc = Number(e.accommodation_allowance) || 0;
      const cons = Number(e.consolidated_allowance) || 0;
      const oth = Number(e.other_allowance) || 0;
      const tot = basic + acc + cons + oth;

      return [
        `"${(e.employee_no || '').replace(/"/g, '""')}"`,
        `"${(e.name || '').replace(/"/g, '""')}"`,
        `"${(e.position || e.designation || '').replace(/"/g, '""')}"`,
        `"${(e.department || '').replace(/"/g, '""')}"`,
        `"${e.date_of_joining || ''}"`,
        `"${e.currency || 'AED'}"`,
        `"${e.phone || ''}"`,
        `"${e.email || ''}"`,
        `"${e.emirates_id || ''}"`,
        basic,
        acc,
        cons,
        oth,
        tot,
        `"${(e.bank_name || '').replace(/"/g, '""')}"`,
        `"${e.swift || ''}"`,
        `'${e.iban || ''}`,
        `'${e.account_no || ''}`,
        `"${(e.default_pay_method || '').replace(/"/g, '""')}"`,
        `"${(e.project_name || '').replace(/"/g, '""')}"`,
        `"${e.status || 'Active'}"`
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RAYAN_Employees_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  proto.exportPayrollCsv = function () {
    const payroll = (this.db?.payroll || []).filter(p => this.matchesActiveCompany(p.company_id));
    if (payroll.length === 0) {
      alert('No payroll records to export');
      return;
    }

    const headers = [
      'Slip No', 'Month/Period', 'Payment Date', 'Employee No', 'Employee Name',
      'Position', 'Department', 'Project Allocation',
      'Basic Salary', 'Accommodation', 'Consolidated', 'Overtime Hours', 'Overtime Amount', 'Total Earnings',
      'Advance Deductions', 'Absence Deductions', 'Loan Deductions', 'Total Deductions', 'Net Pay',
      'Payment Source Type', 'Payment Source Name', 'Payout Reference', 'Pay Method Text', 'Status'
    ];

    const rows = payroll.map(p => [
      `"${(p.slip_no || '').replace(/"/g, '""')}"`,
      `"${p.month_year || p.period_label || ''}"`,
      `"${p.payment_date || ''}"`,
      `"${p.employee_no || ''}"`,
      `"${(p.employee_name || '').replace(/"/g, '""')}"`,
      `"${(p.position || '').replace(/"/g, '""')}"`,
      `"${(p.department || '').replace(/"/g, '""')}"`,
      `"${(p.project_name || '').replace(/"/g, '""')}"`,
      Number(p.basic_salary) || 0,
      Number(p.accommodation_allowance) || 0,
      Number(p.consolidated_allowance) || 0,
      `"${p.overtime_hrs || ''}"`,
      Number(p.normal_overtime) || 0,
      Number(p.total_earnings) || 0,
      Number(p.advance_deduction) || 0,
      Number(p.absence_deduction) || 0,
      Number(p.loan_deduction) || 0,
      Number(p.total_deductions) || 0,
      Number(p.net_pay) || 0,
      `"${p.payout_source_type || 'bank'}"`,
      `"${(p.payout_source_name || p.bank_name || '').replace(/"/g, '""')}"`,
      `"${p.payout_reference || ''}"`,
      `"${(p.pay_method || '').replace(/"/g, '""')}"`,
      `"${p.status || 'Draft'}"`
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RAYAN_Payroll_Register_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  // ==========================================================================
  // 8. EMPLOYMENT CERTIFICATES (شهادة عمل - BILINGUAL)
  // ==========================================================================
  proto.toggleDocStampSign = function () {
    const modal = document.getElementById('fin-doc-print-modal') || document;
    const wrappers = modal.querySelectorAll(
      '#po-stamp-signature-wrap, #payslip-stamp-signature-wrap, #emp-cert-stamp-sign-wrap, #loa-stamp-sign-wrap, #wcc-stamp-sign-wrap, #ult-stamp-sign-wrap, #dn-stamp-sign-wrap, #ltr-stamp-sign-wrap, #fin-stamp-signature-wrap, .fin-stamp-sign-container, .fin-stamp-signature-wrap'
    );

    let isCurrentlyHidden = false;
    if (wrappers && wrappers.length > 0) {
      wrappers.forEach(w => {
        if (w.style.opacity === '0' || w.style.display === 'none' || w.classList.contains('stamp-hidden')) {
          isCurrentlyHidden = true;
        }
      });
      const newHidden = !isCurrentlyHidden;
      wrappers.forEach(w => {
        if (newHidden) {
          w.style.opacity = '0';
          w.classList.add('stamp-hidden');
        } else {
          w.style.opacity = '1';
          w.style.display = '';
          w.classList.remove('stamp-hidden');
        }
      });

      const btn = modal.querySelector('.fin-btn-toggle-stamp, #btn-toggle-stamp-sign, button[onclick*="toggleDocStampSign"]');
      if (btn) {
        if (newHidden) {
          btn.innerHTML = '<span>☑️</span> Show Stamp &amp; Sign';
          btn.style.background = '#ef4444';
          btn.style.borderColor = '#ef4444';
          btn.style.color = '#ffffff';
          btn.setAttribute('title', 'Click to restore Stamp & Signature');
        } else {
          btn.innerHTML = '<span>🔲</span> Toggle Stamp &amp; Sign';
          btn.style.background = '#0284c7';
          btn.style.borderColor = '#0284c7';
          btn.style.color = '#ffffff';
          btn.setAttribute('title', 'Click to hide Stamp & Signature (for manual signing)');
        }
      }

      if (this.showToast) {
        this.showToast(newHidden ? 'Stamp & signature hidden for manual hand-signing' : 'Stamp & signature visible', 'info');
      }
    } else {
      const stampImgs = modal.querySelectorAll('img[src*="stamp"], img[src*="signature"]');
      if (stampImgs && stampImgs.length > 0) {
        let isHidden = (stampImgs[0].style.opacity === '0' || stampImgs[0].style.display === 'none');
        stampImgs.forEach(img => {
          img.style.opacity = isHidden ? '1' : '0';
        });
        if (this.showToast) {
          this.showToast(isHidden ? 'Stamp & signature visible' : 'Stamp & signature hidden', 'info');
        }
      }
    }
  };

  proto.getEmploymentCertificates = function () {
    this.ensurePayrollSeedData();
    return (this.db?.employment_certificates || []).filter(c => this.matchesActiveCompany(c.company_id));
  };

  proto.openEmploymentCertificatePrintModal = function (certOrEmpId, isVerifiedScan = false) {
    this.ensurePayrollSeedData();
    let cert = null;
    const certs = this.getEmploymentCertificates();

    if (certOrEmpId) {
      cert = certs.find(c => c.id === certOrEmpId || c.cert_no === certOrEmpId || c.ref_no === certOrEmpId || c.employee_id === certOrEmpId);
      if (!cert) {
        const emp = (this.db?.employees || []).find(e => e.id === certOrEmpId || e.name === certOrEmpId || e.employee_no === certOrEmpId);
        if (emp) {
          cert = {
            id: `cert-${emp.id}`,
            cert_no: `REC/HC/${new Date().getFullYear()}/11004`,
            ref_no: `REC/HC/${new Date().getFullYear()}/11004`,
            company_id: emp.company_id || this.activeCompanyId,
            date: 'August 13, 2025',
            employee_id: emp.id,
            employee_name_en: emp.name,
            employee_name_ar: emp.name_ar || emp.name,
            job_title_en: emp.position || 'Civil Engineer',
            job_title_ar: emp.position_ar || 'مهندس مدني',
            joining_date_en: emp.date_of_joining ? this.formatDate(emp.date_of_joining) : '07/08/2025',
            joining_date_ar: emp.date_of_joining || '2025-08-07',
            end_date_en: (emp.end_date || emp.resignation_date) ? this.formatDate(emp.end_date || emp.resignation_date) : '',
            end_date_ar: emp.end_date || emp.resignation_date || '',
            employment_status: emp.status || 'Active',
            nationality_en: emp.nationality || 'India',
            nationality_ar: emp.nationality_ar || 'هندي',
            passport_no: emp.passport_no || 'S3552106',
            basic_salary: Number(emp.basic_salary) || 9500.00,
            accommodation_allowance: Number(emp.accommodation_allowance) || 5500.00,
            total_salary: (Number(emp.basic_salary) || 9500) + (Number(emp.accommodation_allowance) || 5500),
            currency: emp.currency || 'AED',
            salary_option: 'with_salary',
            target_preset: 'general',
            issued_to_en: 'Whom It May Concern',
            issued_to_ar: 'لمن يهمه الأمر',
            purpose: 'This certificate is issued upon request for whatever purpose it may serve, with no responsibility on the part of the company.',
            purpose_ar: 'وقد أعطيت له هذه الشهـادة بناء على طلبه، دون تحمل الشركة أدنى مسؤولية تجاه الغير.',
            verification_email: 'rayan@rayan-group.com',
            signatory_name: 'Arshad Alam Shaikh',
            signatory_name_ar: 'ارشد عالم شيخ',
            signatory_title: 'Chief Officer of People & Culture',
            signatory_title_ar: 'الرئيس التنفيذي لقطاع الموارد البشرية و الثقافة المؤسسية',
            status: 'Issued'
          };
        }
      }
    }
    if (!cert) cert = certs[0] || (this.db?.employment_certificates || [])[0] || {
      id: 'cert-rec-hc-2025-11004',
      cert_no: 'REC/HC/2025/11004',
      ref_no: 'REC/HC/2025/11004',
      date: 'August 13, 2025',
      employee_name_en: 'Bakhteyar Alam Mokhtar Ahmad',
      employee_name_ar: 'بختيار عالم مختار احمد',
      job_title_en: 'Civil Engineer',
      job_title_ar: 'مهندس مدني',
      joining_date_en: '07/08/2025',
      joining_date_ar: '2025-08-07',
      nationality_en: 'India',
      nationality_ar: 'هندي',
      passport_no: 'S3552106',
      basic_salary: 9500,
      accommodation_allowance: 5500,
      total_salary: 15000,
      currency: 'AED',
      salary_option: 'with_salary',
      target_preset: 'general',
      issued_to_en: 'Whom It May Concern',
      issued_to_ar: 'لمن يهمه الأمر',
      signatory_name: 'Arshad Alam Shaikh',
      signatory_name_ar: 'ارشد عالم شيخ',
      signatory_title: 'Chief Officer of People & Culture',
      signatory_title_ar: 'الرئيس التنفيذي لقطاع الموارد البشرية و الثقافة المؤسسية'
    };

    cert.reference_no = cert.ref_no || cert.cert_no || 'REC/HC/2025/11004';
    cert.status = cert.status || 'OFFICIAL / VERIFIED';

    const isWithoutSalary = (cert.salary_option === 'without_salary');
    const issuedToEn = cert.issued_to_en || 'Whom It May Concern';
    const issuedToAr = cert.issued_to_ar || 'لمن يهمه الأمر';

    const basicVal = Number(cert.basic_salary) || 9500;
    const accVal = Number(cert.accommodation_allowance) || 5500;
    const totalVal = basicVal + accVal;
    const curr = cert.currency || 'AED';

    const certDocNo = cert.ref_no || cert.cert_no || 'CERT-EMP';
    const modalHtml = `
      <div class="fin-doc-modal-backdrop" id="fin-doc-print-modal" data-doc-no="${escapeHtml(certDocNo)}" data-doc-type="Salary & Employment Certificate">
        <style>
          #fin-doc-print-modal [contenteditable="true"] {
            transition: background 0.15s, outline 0.15s;
            border-radius: 2px;
            padding: 1px 3px;
          }
          #fin-doc-print-modal [contenteditable="true"]:hover {
            background: rgba(56, 189, 248, 0.12) !important;
            outline: 1px dashed #0284c7 !important;
            cursor: text;
          }
          #fin-doc-print-modal [contenteditable="true"]:focus {
            background: rgba(56, 189, 248, 0.22) !important;
            outline: 1.5px solid #0284c7 !important;
          }
          @page {
            size: A4 portrait;
            margin: 4mm 6mm !important;
          }
          @media print {
            html, body {
              height: 100% !important;
              max-height: 100% !important;
              overflow: hidden !important;
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .fin-doc-viewport {
              padding: 0 !important;
              margin: 0 !important;
              overflow: visible !important;
            }
            .fin-document-paper {
              box-shadow: none !important;
              margin: 0 auto !important;
              padding: 4mm 8mm 3mm 8mm !important;
              max-height: 282mm !important;
              height: auto !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-before: avoid !important;
              page-break-after: avoid !important;
            }
            #fin-doc-print-modal [contenteditable="true"] {
              outline: none !important;
              background: transparent !important;
              padding: 0 !important;
            }
            .no-print {
              display: none !important;
            }
          }
        </style>
        <div class="fin-doc-toolbar">
          <div class="fin-doc-toolbar-left">
            <div class="fin-doc-title-badge">
              <span>🏛️</span>
              <span>Official Employment Certificate (شهادة عمل) — ${escapeHtml(cert.ref_no || cert.cert_no || 'REC/HC/2025/11004')}</span>
            </div>
            <div class="fin-doc-type-pills">
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openInvoicePrintModal()">Tax Invoice</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openReceiptPrintModal()">Receipt Voucher</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPaymentPrintModal()">Payment Voucher</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openBillPrintModal()">Purchase Bill</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPOPrintModal()">Purchase Order</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPayslipPrintModal()">Employee Pay Slip</button>
              <button type="button" class="fin-doc-pill-btn active" onclick="window.finApp.openEmploymentCertificatePrintModal('${cert.id}')">Emp Cert</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openLetterOfAssignmentPrintModal()">Assignment Letter</button>
            </div>
          </div>
          <div class="fin-doc-toolbar-right">
            <!-- 1-Click Toggle Salary Option -->
            <button type="button" class="fin-btn-print-action" id="btn-toggle-cert-salary" onclick="window.finApp.toggleCertSalaryDisplay('${cert.id}')" style="background:${isWithoutSalary ? 'rgba(234,179,8,0.15)' : 'rgba(2,132,199,0.15)'}; color:${isWithoutSalary ? '#eab308' : '#38bdf8'}; border-color:${isWithoutSalary ? 'rgba(234,179,8,0.4)' : 'rgba(56,189,248,0.4)'}; font-weight:700;" title="Toggle With / Without Salary Breakdown">
              <span>${isWithoutSalary ? '💵' : '📄'}</span> ${isWithoutSalary ? 'Show Salary' : 'Hide Salary (Service Only)'}
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-toggle-stamp" id="btn-toggle-stamp-sign" onclick="window.finApp.toggleDocStampSign()" title="Toggle Stamp & Signature On / Off">
              <span>🔲</span> Toggle Stamp &amp; Sign
            </button>
            <button type="button" class="fin-btn-print-action" style="background:#0284c7; color:#ffffff; border-color:#0284c7; font-weight:700; font-size:0.75rem;" onclick="window.finApp.openEditEmploymentCertModal('${cert.id}')">
              <span>✏️</span> Edit Certificate (Form)
            </button>
            <button type="button" class="fin-btn-print-primary" onclick="window.finApp ? window.finApp.printDocument() : window.print()">
              <span>🖨️</span> Print / Save as PDF
            </button>
            <button type="button" class="fin-btn-print-action" onclick="window.finApp.downloadEmploymentCertificateDocument('${cert.id}')">
              <span>⬇️</span> Download Document
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-close" onclick="window.finApp.closeDocPrintModal()">
              <span>✕</span> Close
            </button>
          </div>
        </div>

        <div class="fin-doc-viewport">
          <div class="fin-document-paper" style="background:#ffffff; color:#0f172a; padding:5mm 10mm 4mm 10mm; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing:border-box; width:100%; max-width:820px; margin:0 auto 1.5rem auto; box-shadow:0 4px 20px rgba(0,0,0,0.08); border-radius:4px; position:relative; overflow:hidden; page-break-inside:avoid !important; break-inside:avoid !important; max-height:282mm;">

            ${this.getRayanWatermark ? this.getRayanWatermark() : ''}

            <!-- Top 3-Column Corporate Header -->
            <div style="display:grid; grid-template-columns:1fr auto 1fr; align-items:flex-start; gap:12px; border-bottom:1.5px solid #0f172a; padding-bottom:6px; margin-bottom:6px;">
              <!-- Column 1: Left - Rayan Logo, Legal Name, TRN, Dynamic QR/Barcode Verification Block -->
              <div style="text-align:left; justify-self:start;">
                <div style="margin-bottom:2px;">
                  <img src="/assets/docs/rayan-doc-logo.png" alt="Rayan Engineering" style="height:36px; width:auto; display:block;">
                </div>
                <div style="font-size:0.72rem; font-weight:800; color:#0f172a; line-height:1.2; text-transform:uppercase; letter-spacing:0.01em;">
                  RAYAN ENGINEERING AND CONTRACTING LLC SPC
                </div>
                <div style="font-size:0.65rem; font-weight:700; color:#64748b; line-height:1.2; margin-top:1px;">
                  TRN: 104937380400003
                </div>
                <div style="font-size:0.60rem; color:#64748b; line-height:1.2;">
                  Abu Dhabi, UAE | Tel: +971 2 565 4497
                </div>
                ${this.getRayanDynamicVerificationCode ? this.getRayanDynamicVerificationCode(cert, 'emp_cert') : ''}
              </div>

              <!-- Column 2: Center - Dead-Center Bilingual Certificate Title & Target Addressee -->
              <div style="text-align:center; padding-top:2px; justify-self:center; min-width:200px;">
                <div style="font-family:'Amiri', serif; font-size:1.35rem; font-weight:700; color:#0284c7; line-height:1.15;">شهادة عمل</div>
                <div style="font-family:'Outfit', -apple-system, sans-serif; font-size:1.25rem; font-weight:800; color:#0f172a; letter-spacing:0.02em; line-height:1.1;">EMPLOYMENT CERTIFICATE</div>
                <div style="font-size:0.60rem; color:#64748b; font-weight:700; margin-top:2px; letter-spacing:0.04em; text-transform:uppercase;">
                  ${isWithoutSalary ? 'OFFICIAL CERTIFICATE OF EMPLOYMENT (SERVICE CONTINUITY)' : 'OFFICIAL STATEMENT OF EMPLOYMENT & SALARY'}
                </div>
                <div style="margin-top:3px;">
                  <span style="font-size:0.72rem; color:#0284c7; font-weight:800; background:#f0f9ff; border:1px solid #bae6fd; border-radius:4px; padding:2px 8px; display:inline-block;" contenteditable="true" spellcheck="false" title="Click to edit addressee">
                    ${escapeHtml(issuedToEn)} | <span style="font-family:'Amiri', serif; font-size:0.78rem;">${escapeHtml(issuedToAr)}</span>
                  </span>
                </div>
              </div>

              <!-- Column 3: Right - Reference, Status Badge, Date Table -->
              <div style="text-align:right; justify-self:end;">
                <div style="font-size:0.88rem; font-weight:800; color:#0284c7; font-family:monospace; margin-bottom:2px;" contenteditable="true" spellcheck="false" title="Click to edit cert no">
                  # ${escapeHtml(cert.ref_no || cert.cert_no || 'REC/HC/2025/11004')}
                </div>
                <div style="display:inline-block; font-size:0.58rem; font-weight:800; color:#15803d; background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.3); border-radius:3px; padding:1px 5px; text-transform:uppercase; margin-bottom:3px;">
                  ${escapeHtml(cert.status || 'OFFICIAL / VERIFIED')}
                </div>
                <table style="margin-left:auto; font-size:0.66rem; color:#475569; border-collapse:collapse;">
                  <tr>
                    <td style="padding:1px 3px 1px 0; font-weight:600; text-align:right;">Date:</td>
                    <td style="padding:1px 0; font-weight:700; color:#0f172a; text-align:right;" contenteditable="true" spellcheck="false">${escapeHtml(cert.date || 'August 13, 2025')}</td>
                    <td style="padding:1px 0 1px 3px; font-family:'Amiri', serif; font-size:0.72rem; text-align:right;">:التاريخ</td>
                  </tr>
                  <tr>
                    <td style="padding:1px 3px 1px 0; font-weight:600; text-align:right;">Validity:</td>
                    <td style="padding:1px 0; font-weight:700; color:#0f172a; text-align:right;">30 Days Net</td>
                    <td style="padding:1px 0 1px 3px; font-family:'Amiri', serif; font-size:0.72rem; text-align:right;">:الصلاحية</td>
                  </tr>
                  <tr>
                    <td style="padding:1px 3px 1px 0; font-weight:600; text-align:right;">Category:</td>
                    <td style="padding:1px 0; font-weight:700; color:#0f172a; text-align:right;">${isWithoutSalary ? 'Service Record' : 'With Remuneration'}</td>
                    <td style="padding:1px 0 1px 3px; font-family:'Amiri', serif; font-size:0.72rem; text-align:right;">:الفئة</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- 2-Column Corporate Info Cards -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:6px;">
              <!-- Card 1: English Particulars -->
              <div style="border:1px solid #cbd5e1; border-top:3px solid #0284c7; border-radius:4px; background:#f8fafc; padding:5px 8px; font-size:0.68rem; line-height:1.35;">
                <div style="font-weight:800; font-size:0.68rem; color:#0284c7; text-transform:uppercase; margin-bottom:3px; display:flex; justify-content:space-between;">
                  <span>EMPLOYEE PARTICULARS</span>
                  <span style="font-size:0.60rem; color:#64748b;">CIVIL / ENGINEERING</span>
                </div>
                <div style="color:#0f172a; font-weight:800; font-size:0.76rem; margin-bottom:2px;" contenteditable="true" spellcheck="false">
                  ${escapeHtml(cert.employee_name_en || 'Bakhteyar Alam Mokhtar Ahmad')}
                </div>
                <div style="color:#334155;"><strong>Job Title:</strong> <span contenteditable="true" spellcheck="false">${escapeHtml(cert.job_title_en || 'Civil Engineer')}</span></div>
                <div style="color:#334155;"><strong>Joining Date:</strong> <span contenteditable="true" spellcheck="false">${escapeHtml(cert.joining_date_en || '07/08/2025')}</span></div>
                ${cert.end_date_en ? `
                  <div style="color:#334155;"><strong>End / Relieved Date:</strong> <span contenteditable="true" spellcheck="false" style="color:#ef4444; font-weight:700;">${escapeHtml(cert.end_date_en)}</span></div>
                ` : ''}
                <div style="color:#334155;"><strong>Nationality:</strong> <span contenteditable="true" spellcheck="false">${escapeHtml(cert.nationality_en || 'India')}</span></div>
                <div style="color:#334155;"><strong>Passport No:</strong> <span contenteditable="true" spellcheck="false" style="font-family:monospace; font-weight:700;">${escapeHtml(cert.passport_no || 'S3552106')}</span></div>
                ${isWithoutSalary ? `
                  <div style="color:#334155; margin-top:1px;"><strong>Employment Status:</strong> <span style="color:${((cert.employment_status || '').toLowerCase() === 'resigned' || (cert.employment_status || '').toLowerCase() === 'terminated') ? '#ef4444' : '#15803d'}; font-weight:700;" contenteditable="true" spellcheck="false">${((cert.employment_status || '').toLowerCase() === 'resigned' || (cert.employment_status || '').toLowerCase() === 'terminated') ? 'Resigned / Relieved' : 'Active / Currently On-Duty'}</span></div>
                ` : `
                  <div style="color:#334155; margin-top:1px;"><strong>Monthly Salary:</strong> <span style="font-weight:700; color:#0f172a;" contenteditable="true" spellcheck="false">${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</span></div>
                `}
              </div>

              <!-- Card 2: Arabic Particulars (RTL) -->
              <div style="border:1px solid #cbd5e1; border-top:3px solid #0f172a; border-radius:4px; background:#f8fafc; padding:5px 8px; font-size:0.68rem; line-height:1.35; direction:rtl; text-align:right;">
                <div style="font-weight:800; font-size:0.68rem; color:#0f172a; text-transform:uppercase; margin-bottom:3px; display:flex; justify-content:space-between; font-family:'Amiri', serif;">
                  <span>تفاصيل الموظف والوظيفة</span>
                  <span style="font-size:0.60rem; color:#64748b;">الهندسة المدنية</span>
                </div>
                <div style="color:#0f172a; font-weight:800; font-size:0.80rem; margin-bottom:2px; font-family:'Amiri', serif;" contenteditable="true" spellcheck="false">
                  ${escapeHtml(cert.employee_name_ar || 'بختيار عالم مختار احمد')}
                </div>
                <div style="color:#334155; font-family:'Amiri', serif; font-size:0.72rem;"><strong>المسمى الوظيفي:</strong> <span contenteditable="true" spellcheck="false">${escapeHtml(cert.job_title_ar || 'مهندس مدني')}</span></div>
                <div style="color:#334155; font-family:'Amiri', serif; font-size:0.72rem;"><strong>تاريخ التعيين:</strong> <span contenteditable="true" spellcheck="false">${escapeHtml(cert.joining_date_ar || '07-08-2025')}</span></div>
                ${cert.end_date_ar ? `
                  <div style="color:#334155; font-family:'Amiri', serif; font-size:0.72rem;"><strong>تاريخ انتهاء الخدمة:</strong> <span contenteditable="true" spellcheck="false" style="color:#ef4444; font-weight:700;">${escapeHtml(cert.end_date_ar)}</span></div>
                ` : ''}
                <div style="color:#334155; font-family:'Amiri', serif; font-size:0.72rem;"><strong>الجنسية:</strong> <span contenteditable="true" spellcheck="false">${escapeHtml(cert.nationality_ar || 'هندي')}</span></div>
                <div style="color:#334155; font-family:'Amiri', serif; font-size:0.72rem;"><strong>رقم الجواز:</strong> <span contenteditable="true" spellcheck="false" style="font-family:monospace; font-weight:700;">${escapeHtml(cert.passport_no || 'S3552106')}</span></div>
                ${isWithoutSalary ? `
                  <div style="color:#334155; font-family:'Amiri', serif; font-size:0.72rem; margin-top:1px;"><strong>الحالة الوظيفية:</strong> <span style="color:${((cert.employment_status || '').toLowerCase() === 'resigned' || (cert.employment_status || '').toLowerCase() === 'terminated') ? '#ef4444' : '#15803d'}; font-weight:700;" contenteditable="true" spellcheck="false">${((cert.employment_status || '').toLowerCase() === 'resigned' || (cert.employment_status || '').toLowerCase() === 'terminated') ? 'مستقيل / انتهت خدمته' : 'على رأس عمله (نشط)'}</span></div>
                ` : `
                  <div style="color:#334155; font-family:'Amiri', serif; font-size:0.72rem; margin-top:1px;"><strong>الراتب الشهري:</strong> <span style="font-weight:700; color:#0f172a;" contenteditable="true" spellcheck="false">${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} درهم</span></div>
                `}
              </div>
            </div>

            <!-- Official Bilingual Certification Statement -->
            <table style="width:100%; border-collapse:collapse; margin-bottom:6px; background:#ffffff; border:1px solid #e2e8f0; border-radius:4px;">
              <tr>
                <td style="width:49%; vertical-align:top; padding:5px 8px; font-size:0.67rem; line-height:1.35; color:#334155; text-align:justify;" contenteditable="true" spellcheck="false">
                  ${isWithoutSalary ? `
                    RAYAN Engineering and Contracting l.l.c- s.p.c, a subsidiary of RAYAN Group, certifies that the under mentioned employee is currently in the active service of the company as <strong>${escapeHtml(cert.job_title_en || 'Civil Engineer')}</strong> since <strong>${escapeHtml(cert.joining_date_en || '07/08/2025')}</strong>. This certificate is issued upon request of the employee to be presented to <strong>${escapeHtml(issuedToEn)}</strong>, with no financial liability on the part of the company.
                  ` : `
                    RAYAN Engineering and Contracting l.l.c- s.p.c, a subsidiary of RAYAN Group, certifies that the under mentioned employee is currently in the service of the company and receiving a monthly salary as detailed below. This certificate is issued upon request of the employee to be presented to <strong>${escapeHtml(issuedToEn)}</strong>, with no responsibility on the part of the company.
                  `}
                </td>
                <td style="width:2%; vertical-align:stretch; padding:0; text-align:center;">
                  <div style="background:#0284c7; width:2px; height:100%; min-height:48px; margin:0 auto; border-radius:1px;"></div>
                </td>
                <td style="width:49%; vertical-align:top; padding:5px 8px; font-size:0.70rem; line-height:1.38; color:#334155; direction:rtl; text-align:justify; font-family:'Amiri', serif;" contenteditable="true" spellcheck="false">
                  ${isWithoutSalary ? `
                    تشهد شركة ريان الهندسيه و للمقاولات - ذ م م - ش ش و إحدى شركات مجموعة رايان بأن الموظف المذكور يعمل لدينا بمهنة <strong>${escapeHtml(cert.job_title_ar || 'مهندس مدني')}</strong> منذ تاريخ <strong>${escapeHtml(cert.joining_date_ar || '07-08-2025')}</strong> ولا يزال على رأس عمله حتى تاريخه. وقد أعطيت له هذه الشهادة بناء على طلبه لتقديمها إلى <strong>${escapeHtml(issuedToAr)}</strong>، دون تحمل الشركة أدنى مسؤولية مالية تجاه الغير.
                  ` : `
                    تشهد شركة ريان الهندسيه و للمقاولات - ذ م م - ش ش و إحدى شركات مجموعة رايان بأن الموظف المذكور يعمل لدينا، ولايزال على رأس عمله حتّى تاريخه ويتقاضى راتب شهري كما يلي. وقد أعطيت له هذه الشهادة بناء على طلبه لتقديمها إلى <strong>${escapeHtml(issuedToAr)}</strong>، دون تحمل الشركة أدنى مسؤولية تجاه الغير.
                  `}
                </td>
              </tr>
            </table>

            <!-- Corporate Remuneration Section (Only shown when With Salary) -->
            <div id="emp-cert-salary-section" style="display:${isWithoutSalary ? 'none' : 'block'};">
              <!-- Corporate Remuneration Table -->
              <table style="width:100%; border-collapse:collapse; font-size:0.68rem; margin-bottom:6px; border:1px solid #cbd5e1;">
                <thead>
                  <tr style="background:#0f172a; color:#ffffff; font-weight:700; font-size:0.64rem; text-transform:uppercase; letter-spacing:0.03em;">
                    <th style="padding:4px 6px; width:30px; text-align:center; border-right:1px solid #334155;">#</th>
                    <th style="padding:4px 6px; text-align:left; border-right:1px solid #334155;">Salary Breakdown &amp; Allowances / تفاصيل الراتب والبدلات</th>
                    <th style="padding:4px 6px; width:120px; text-align:center; border-right:1px solid #334155;">Frequency / الدورية</th>
                    <th style="padding:4px 8px; width:140px; text-align:right;">Monthly Amount (${curr})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:3px 6px; text-align:center; color:#64748b; font-weight:700; border-right:1px solid #e2e8f0;">1</td>
                    <td style="padding:3px 6px; border-right:1px solid #e2e8f0;">
                      <div style="font-weight:700; color:#0f172a;">BASIC SALARY <span style="font-family:'Amiri', serif; font-size:0.72rem; color:#475569;">(راتب اساسي)</span></div>
                      <div style="font-size:0.60rem; color:#64748b;">Fixed primary contractual salary</div>
                    </td>
                    <td style="padding:3px 6px; text-align:center; color:#475569; border-right:1px solid #e2e8f0;">Monthly / شهري</td>
                    <td style="padding:3px 8px; text-align:right; font-weight:700; color:#0f172a; font-family:monospace;" contenteditable="true" spellcheck="false">${basicVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;">
                    <td style="padding:3px 6px; text-align:center; color:#64748b; font-weight:700; border-right:1px solid #e2e8f0;">2</td>
                    <td style="padding:3px 6px; border-right:1px solid #e2e8f0;">
                      <div style="font-weight:700; color:#0f172a;">ACCOMMODATION ALLOWANCE <span style="font-family:'Amiri', serif; font-size:0.72rem; color:#475569;">(علاوة سكن)</span></div>
                      <div style="font-size:0.60rem; color:#64748b;">Company provided accommodation allowance</div>
                    </td>
                    <td style="padding:3px 6px; text-align:center; color:#475569; border-right:1px solid #e2e8f0;">Monthly / شهري</td>
                    <td style="padding:3px 8px; text-align:right; font-weight:700; color:#0f172a; font-family:monospace;" contenteditable="true" spellcheck="false">${accVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  <tr style="background:#e0f2fe; border-top:1.5px solid #0284c7; font-weight:800;">
                    <td colspan="2" style="padding:4px 6px; color:#0369a1; border-right:1px solid #bae6fd;">
                      <span>TOTAL GROSS MONTHLY SALARY : </span>
                      <span style="font-family:'Amiri', serif; font-size:0.74rem;">(إجمالي الراتب الشهري)</span>
                    </td>
                    <td style="padding:4px 6px; text-align:center; color:#0369a1; border-right:1px solid #bae6fd;">AED DIRHAM</td>
                    <td style="padding:4px 8px; text-align:right; color:#0369a1; font-size:0.80rem; font-family:monospace;" contenteditable="true" spellcheck="false">${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curr}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Amount in words banner -->
              <div style="border:1px solid #e2e8f0; background:#f8fafc; border-radius:4px; padding:3px 8px; font-size:0.64rem; color:#334155; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                <div><strong>Total In Words:</strong> <span contenteditable="true" spellcheck="false">Fifteen Thousand AE Dirham Only.</span></div>
                <div style="direction:rtl; font-family:'Amiri', serif; font-size:0.72rem;"><strong>المبلغ بالحروف:</strong> <span contenteditable="true" spellcheck="false">خمسة عشر ألف درهم إماراتي فقط لا غير.</span></div>
              </div>
            </div>

            <!-- Signatory & Official People & Culture Stamp Box -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:4px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
              <!-- Left Side: Inquiries and Verification info -->
              <div style="font-size:0.62rem; color:#475569; line-height:1.3; max-width:55%;">
                <div style="font-weight:700; color:#0f172a; margin-bottom:1px;">Official Verification Inquiries:</div>
                <div>For verification inquires, contact us at <a href="mailto:info@rayan-group.com" style="color:#0284c7; font-weight:700; text-decoration:none;">info@rayan-group.com</a> | <a href="mailto:rayan@rayan-group.com" style="color:#0284c7; font-weight:700; text-decoration:none;">rayan@rayan-group.com</a></div>
                <div>Tel: +971 2 565 4497 | Abu Dhabi, United Arab Emirates</div>
              </div>

              <!-- Right Side: Official Signatory & People and Culture Stamp -->
              <div style="text-align:center; min-width:240px; position:relative;">
                <div id="emp-cert-stamp-sign-wrap" class="fin-stamp-sign-container" style="position:relative; width:240px; height:58px; margin:0 auto; cursor:pointer;" onclick="window.finApp.toggleDocStampSign()" title="Click to show/hide official stamp & signature">
                  <!-- Round People & Culture Stamp -->
                  <img src="/assets/docs/rayan-people-culture-stamp.png" alt="Rayan Group People & Culture Stamp" style="position:absolute; right:10px; top:-14px; width:76px; height:76px; mix-blend-mode:multiply; opacity:0.95; pointer-events:none; z-index:1; transition:opacity 0.2s;">
                  <!-- Arshad Alam Shaikh Signature -->
                  <img src="/assets/docs/rayan-signature-official.png" alt="Arshad Alam Shaikh Signature" style="position:absolute; left:16px; top:4px; width:100px; height:auto; mix-blend-mode:multiply; opacity:0.95; pointer-events:none; z-index:2; transition:opacity 0.2s;">
                </div>
                <div style="position:relative; z-index:3;">
                  <div contenteditable="true" spellcheck="false" style="font-family:'Amiri', serif; font-size:0.86rem; font-weight:700; color:#0f172a; line-height:1.15;" title="Click to edit name (Arabic)">${cert.signatory_name_ar || 'ارشد عالم شيخ'}</div>
                  <div contenteditable="true" spellcheck="false" style="font-weight:800; font-size:0.75rem; color:#0f172a; line-height:1.15;" title="Click to edit name (English)">${cert.signatory_name || 'Arshad Alam Shaikh'}</div>
                  <div contenteditable="true" spellcheck="false" style="font-family:'Amiri', serif; font-size:0.68rem; font-weight:700; color:#475569; line-height:1.15;" title="Click to edit title (Arabic)">${cert.signatory_title_ar || 'الرئيس التنفيذي لقطاع الموارد البشرية و الثقافة المؤسسية'}</div>
                  <div contenteditable="true" spellcheck="false" style="font-weight:700; font-size:0.62rem; color:#475569; line-height:1.15;" title="Click to edit title (English)">${cert.signatory_title || 'Chief Officer of People & Culture'}</div>
                </div>
              </div>
            </div>

            <!-- Group Includes 4 Logos Strip -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; font-size:0.60rem; color:#64748b; border-bottom:1px solid #e2e8f0; padding-bottom:3px;">
              <div style="font-weight:700; color:#475569;">* The Group Includes:</div>
              <img src="/assets/docs/rayan-group-four-logos-strip.png" alt="Rayan Group Subsidiaries" style="height:18px; width:auto; max-width:280px; object-fit:contain;">
              <div style="font-family:'Amiri', serif; font-weight:700; direction:rtl; font-size:0.68rem; color:#475569;">*تشمل المجموعة</div>
            </div>

            <!-- Bottom Section: Bilingual Notes (Left) & Standard Corporate Best Wishes (Right) -->
            <div style="display:grid; grid-template-columns:1.2fr 0.8fr; gap:12px; align-items:flex-start; margin-bottom:4px;">
              <!-- Left: Bilingual Official Notes -->
              <div style="font-size:0.58rem; color:#64748b; line-height:1.3;">
                <div style="font-weight:700; color:#0f172a; margin-bottom:1px;">Important Certification Notes / ملاحظات هامة:</div>
                <div style="display:flex; justify-content:space-between; gap:8px;">
                  <div style="width:50%;" contenteditable="true" spellcheck="false">
                    • Any amendment or erasure revokes this certificate.<br>
                    • Validity: 30 days from the date of issuance.<br>
                    • Official electronic certificate with system verification.
                  </div>
                  <div style="width:50%; direction:rtl; text-align:right; font-family:'Amiri', serif; font-size:0.64rem;" contenteditable="true" spellcheck="false">
                    • أي شطب أو تعديل في هذه الشهادة يلغيها.<br>
                    • صلاحية الشهادة 30 يوماً من تاريخ إصدارها.<br>
                    • أصدرت هذه الشهادة عبر النظام مع رمز التحقق الإلكتروني.
                  </div>
                </div>
              </div>

              <!-- Right: Standard Corporate Best Wishes (matching Sales Invoice) -->
              <div style="font-size:0.60rem; color:#475569; line-height:1.3; text-align:right;">
                <div style="font-weight:700; color:#0f172a;">Best wishes</div>
                <div style="font-weight:800; color:#0f172a;">RAYAN Group Team</div>
                <div style="color:#64748b;">Abu Dhabi, U.A.E</div>
                <div style="color:#64748b;">Hotline : +971 2 565 4497</div>
                <div><a href="mailto:info@rayan-group.com" style="color:#0284c7; text-decoration:none;">info@rayan-group.com</a></div>
                <div><a href="http://rayan-group.com" style="color:#0284c7; text-decoration:none;">http://rayan-group.com</a></div>
              </div>
            </div>

            <!-- Fixed 1px System-Generated Footer Line -->
            <div style="border-top:1px solid #e2e8f0; padding-top:2px; display:flex; justify-content:space-between; align-items:center; font-size:0.56rem; color:#94a3b8;">
              <div># ${escapeHtml(cert.ref_no || cert.cert_no || 'REC/HC/2025/11004')}</div>
              <div>This is an official system-generated certificate and does not require a physical signature when verified online.</div>
              <div>Page 1 of 1</div>
            </div>

          </div>
        </div>
      </div>
    `;

    this.getModalContainer().innerHTML = modalHtml;
    document.body.classList.add('fin-doc-open');
    if (this.setActiveDocumentTitle) this.setActiveDocumentTitle(certDocNo, 'Salary & Employment Certificate', cert.employee_name);
  };

  proto.toggleCertSalaryDisplay = function (certId) {
    let cert = (this.db?.employment_certificates || []).find(c => c.id === certId || c.ref_no === certId);
    if (!cert) cert = (this.db?.employment_certificates || [])[0];
    if (cert) {
      cert.salary_option = (cert.salary_option === 'without_salary') ? 'with_salary' : 'without_salary';
      if (typeof this.saveDatabaseToCache === 'function') { this.saveDatabaseToCache(); } else { try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (err) { } }
      this.openEmploymentCertificatePrintModal(cert.id);
      this.showNotification(cert.salary_option === 'without_salary' ? 'Switched to: Certificate WITHOUT Salary (Service Only)' : 'Switched to: Certificate WITH Salary Breakdown', 'info');
    }
  };

  proto.downloadEmploymentCertificateDocument = function (certId) {
    let cert = (this.db?.employment_certificates || []).find(c => c.id === certId || c.cert_no === certId || c.ref_no === certId) || (this.db?.employment_certificates || [])[0];
    if (!cert) return;
    const paperHtml = document.querySelector('#fin-doc-print-modal .fin-document-paper')?.outerHTML;
    if (paperHtml) {
      const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(this.sanitizeFilename ? this.sanitizeFilename(cert.ref_no || cert.cert_no) : (cert.ref_no || cert.cert_no))} - Salary & Employment Certificate</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; padding: 20px; background: #f1f5f9; display: flex; justify-content: center; font-family: 'Plus Jakarta Sans', sans-serif; }
    .fin-document-paper { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    @media print {
      body { background: transparent !important; padding: 0 !important; }
      .fin-document-paper { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
    }
  </style>
</head>
<body>
  ${paperHtml}
</body>
</html>`;
      const cleanDocNo = this.sanitizeFilename ? this.sanitizeFilename(cert.ref_no || cert.cert_no) : (cert.ref_no || cert.cert_no).replace(/[/\\?%*:|"<>]/g, '-');
      this.downloadFile(`${cleanDocNo} - Salary & Employment Certificate.html`, fullDoc, 'text/html');
      this.showNotification(`Downloaded Employment Certificate ${cert.ref_no}.`, 'success');
    }
  };

  proto.openEditEmploymentCertModal = function (certId) {
    this.ensurePayrollSeedData();
    let cert = (this.db?.employment_certificates || []).find(c => c.id === certId || c.ref_no === certId);
    if (!cert) cert = (this.db?.employment_certificates || [])[0] || {};

    const employees = (this.db?.employees || []).filter(e => this.matchesActiveCompany(e.company_id));
    const activeEmps = employees.filter(e => (e.status || 'Active').toLowerCase() === 'active');
    const formerEmps = employees.filter(e => (e.status || 'Active').toLowerCase() !== 'active');
    const empOptions = `
      <optgroup label="🟢 Active Employees (${activeEmps.length})">
        ${activeEmps.map(e => `<option value="${e.id}" ${cert.employee_id === e.id ? 'selected' : ''}>${escapeHtml(e.name)} (${escapeHtml(e.employee_no || '')})</option>`).join('')}
      </optgroup>
      ${formerEmps.length > 0 ? `
      <optgroup label="⚪ Former Staff (${formerEmps.length})">
        ${formerEmps.map(e => `<option value="${e.id}" ${cert.employee_id === e.id ? 'selected' : ''}>${escapeHtml(e.name)} (${escapeHtml(e.employee_no || '')}) [${escapeHtml(e.status)}]</option>`).join('')}
      </optgroup>
      ` : ''}
    `;

    const isWithoutSalary = (cert.salary_option === 'without_salary');
    const targetPreset = cert.target_preset || 'general';

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-emp-cert-edit" style="z-index:100030;">
        <div class="fin-modal-dialog" style="max-width:880px; width:95%; max-height:92vh; background:#0d1527; border:1px solid rgba(56,189,248,0.25); box-shadow:0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(0,153,230,0.12); display:flex; flex-direction:column; border-radius:16px; overflow:hidden;">
          <!-- Executive Header -->
          <div class="fin-modal-header" style="background:linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.85) 100%); padding:1.25rem 1.75rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.85rem;">
              <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(0,153,230,0.3) 100%); border:1px solid rgba(56,189,248,0.35); display:flex; align-items:center; justify-content:center; font-size:1.35rem; box-shadow:0 4px 12px rgba(56,189,248,0.15);">🏛️</div>
              <div>
                <h3 class="fin-modal-title" style="margin:0; font-size:1.25rem; font-weight:800; color:#f8fafc; letter-spacing:-0.01em;">
                  Edit Employment Certificate Details
                </h3>
                <p style="margin:2px 0 0; font-size:0.78rem; color:#94a3b8;">
                  Workforce Verification &amp; Salary Authentication • شهادة عمل وتفاصيل الراتب
                </p>
              </div>
            </div>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-emp-cert-edit')" title="Close">&times;</button>
          </div>

          <!-- Body Form -->
          <form id="form-emp-cert-edit" class="fin-modal-body" onsubmit="event.preventDefault(); window.finApp.saveEmploymentCertForm(event);" style="padding:1.5rem 1.75rem; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:1.25rem;">
            <input type="hidden" name="id" value="${cert.id || ''}">

            <!-- Card 1: Certificate Reference & Fast Auto-Fill -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>📋</span>
                  <span>Certificate Reference &amp; Fast Auto-Fill</span>
                </div>
              </div>
              <div class="fin-form-grid-2" style="margin-bottom:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Reference Number (Ref.:) <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" name="ref_no" value="${escapeHtml(cert.ref_no || 'REC/HC/2025/11004')}" required style="font-weight:700; color:#38bdf8; font-family:monospace;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Certificate Date <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" name="date" value="${escapeHtml(cert.date || 'August 13, 2025')}" required>
                </div>
              </div>
              <div class="fin-form-group" style="margin-bottom:0;">
                <label class="fin-field-label" style="display:flex; justify-content:space-between; align-items:center;">
                  <span>Auto-Fill From Registered Workforce</span>
                  <span style="font-size:0.72rem; color:#38bdf8; text-transform:none; font-weight:normal;">⚡ Instantly loads name, trade, passport &amp; compensation</span>
                </label>
                <select class="fin-form-select" id="edit-cert-emp-select" onchange="window.finApp.onCertEmployeeSelectChange(this.value)" style="border-color:rgba(56,189,248,0.35); background:#0f172a;">
                  <option value="">-- Choose Registered Employee to auto-populate fields --</option>
                  ${empOptions}
                </select>
              </div>
            </div>

            <!-- Card 2: Certificate Mode & Target Addressee -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>⚙️</span>
                  <span>Certificate Mode &amp; Target Addressee (الجهة الموجه إليها)</span>
                </div>
              </div>
              <div class="fin-form-grid-2" style="margin-bottom:1rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label" style="color:#38bdf8;">Certificate Type / نوع الشهادة</label>
                  <select class="fin-form-select" id="cert-salary-option" name="salary_option" onchange="window.finApp.onCertSalaryOptionChange(this.value)" style="border-color:#0284c7; font-weight:700; background:#0f172a;">
                    <option value="with_salary" ${!isWithoutSalary ? 'selected' : ''}>💵 With Salary Breakdown (شهادة مع تفاصيل الراتب)</option>
                    <option value="without_salary" ${isWithoutSalary ? 'selected' : ''}>📄 Without Salary / Service Only (شهادة بدون راتب / استمرارية عمل)</option>
                  </select>
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label" style="color:#38bdf8;">Addressee Preset / الجهة الموجه إليها</label>
                  <select class="fin-form-select" id="cert-target-preset" name="target_preset" onchange="window.finApp.onCertTargetPresetChange(this.value)" style="border-color:#0284c7; font-weight:700; background:#0f172a;">
                    <option value="general" ${targetPreset === 'general' ? 'selected' : ''}>General / To Whom It May Concern (لمن يهمه الأمر)</option>
                    <option value="bank" ${targetPreset === 'bank' ? 'selected' : ''}>🏦 For Bank / إلى البنك (Loan / Finance / Account Opening)</option>
                    <option value="embassy" ${targetPreset === 'embassy' ? 'selected' : ''}>🏛️ For Embassy / إلى السفارة (Visa Application / Travel)</option>
                    <option value="ministry" ${targetPreset === 'ministry' ? 'selected' : ''}>🏢 For Government / Ministry / Immigration (الجهات الحكومية)</option>
                    <option value="custom" ${targetPreset === 'custom' ? 'selected' : ''}>✏️ Custom Specific Addressee (تخصيص جهة معينة)</option>
                  </select>
                </div>
              </div>

              <!-- Dynamic Custom Addressee Line -->
              <div id="cert-custom-target-row" style="display:${(targetPreset === 'custom' || targetPreset === 'bank' || targetPreset === 'embassy' || targetPreset === 'ministry') ? 'grid' : 'none'}; grid-template-columns:1fr 1fr; gap:1rem; background:rgba(2,132,199,0.08); border:1px solid rgba(56,189,248,0.25); border-radius:10px; padding:1rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">
                    Addressee Header Line (English) <span class="fin-field-badge-en">🇺🇸 EN</span>
                  </label>
                  <input type="text" class="fin-form-input" id="cert-issued-to-en" name="issued_to_en" value="${escapeHtml(cert.issued_to_en || 'Whom It May Concern')}" placeholder="e.g. To: The Bank Manager / Embassy of Italy">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>إلى الجهة / المخاطب (باللغة العربية)</span>
                    <span class="fin-field-badge-ar">🇦🇪 AR</span>
                  </label>
                  <input type="text" class="fin-form-input fin-input-ar" id="cert-issued-to-ar" name="issued_to_ar" value="${escapeHtml(cert.issued_to_ar || 'لمن يهمه الأمر')}" placeholder="مثال: إلى: مدير البنك / سفارة إيطاليا">
                </div>
              </div>
            </div>

            <!-- Card 3: Employee Particulars & Designation (Bilingual) -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>👤</span>
                  <span>Employee Particulars &amp; Bilingual Designation</span>
                </div>
              </div>
              <div class="fin-form-grid-2" style="margin-bottom:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Employee Name (English) <span class="fin-field-badge-en">🇺🇸 EN</span> <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" id="cert-emp-name-en" name="employee_name_en" value="${escapeHtml(cert.employee_name_en || '')}" required placeholder="e.g. Bakhteyar Alam Mokhtar Ahmad">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>اسم الموظف (باللغة العربية)</span>
                    <span class="fin-field-badge-ar">🇦🇪 AR</span>
                  </label>
                  <input type="text" class="fin-form-input fin-input-ar" id="cert-emp-name-ar" name="employee_name_ar" value="${escapeHtml(cert.employee_name_ar || '')}" required placeholder="مثال: بختيار عالم مختار احمد">
                </div>
              </div>

              <div class="fin-form-grid-2" style="margin-bottom:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Job Title / Designation (English) <span class="fin-field-badge-en">🇺🇸 EN</span> <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" id="cert-job-title-en" name="job_title_en" value="${escapeHtml(cert.job_title_en || '')}" required placeholder="e.g. Civil Engineer">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>المسمى الوظيفي (باللغة العربية)</span>
                    <span class="fin-field-badge-ar">🇦🇪 AR</span>
                  </label>
                  <input type="text" class="fin-form-input fin-input-ar" id="cert-job-title-ar" name="job_title_ar" value="${escapeHtml(cert.job_title_ar || '')}" required placeholder="مثال: مهندس مدني">
                </div>
              </div>

              <div class="fin-form-grid-3">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Passport No. <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" id="cert-passport-no" name="passport_no" value="${escapeHtml(cert.passport_no || 'S3552106')}" required placeholder="e.g. S3552106" style="font-family:monospace; font-weight:700;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Nationality (EN / AR) <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" id="cert-nationality-en" name="nationality_en" value="${escapeHtml(cert.nationality_en || 'India')}" required placeholder="e.g. India / هندي">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Joining Date (EN / AR) <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" id="cert-joining-date-en" name="joining_date_en" value="${escapeHtml(cert.joining_date_en || '07/08/2025')}" required placeholder="DD/MM/YYYY">
                </div>
              </div>
            </div>

            <!-- Card 4: Standard Monthly Compensation (AED) -->
            <div class="fin-form-section-card" id="cert-salary-fields-section" style="display:${isWithoutSalary ? 'none' : 'block'};">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title" style="color:#10b981;">
                  <span>💵</span>
                  <span>Standard Monthly Compensation (AED)</span>
                </div>
              </div>
              <div class="fin-form-grid-3" style="align-items:flex-end;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Basic Salary (AED)</label>
                  <input type="number" step="0.01" class="fin-form-input" id="cert-basic-salary" name="basic_salary" value="${cert.basic_salary || 9500}" oninput="window.finApp.calcCertTotalSalary()" style="font-weight:700; color:#f8fafc;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Accommodation Allowance (AED)</label>
                  <input type="number" step="0.01" class="fin-form-input" id="cert-acc-salary" name="accommodation_allowance" value="${cert.accommodation_allowance || 5500}" oninput="window.finApp.calcCertTotalSalary()" style="font-weight:700; color:#f8fafc;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label" style="color:#10b981; font-weight:800;">Total Monthly Salary (AED)</label>
                  <input type="number" step="0.01" class="fin-form-input" id="cert-total-salary" name="total_salary" value="${cert.total_salary || 15000}" readonly style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.4); font-weight:800; font-size:1.05rem; color:#10b981;">
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="fin-modal-footer" style="padding:1.15rem 0 0 0; background:transparent; border-top:1px solid rgba(255,255,255,0.08); margin-top:0.5rem;">
              <button type="button" class="fin-btn-secondary" onclick="window.finApp.closeModal('modal-emp-cert-edit')">Cancel</button>
              <button type="submit" class="fin-btn-primary">💾 Save Certificate &amp; Preview</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.getModalContainer().innerHTML = modalHtml;
  };

  proto.onCertSalaryOptionChange = function (val) {
    const sec = document.getElementById('cert-salary-fields-section');
    if (sec) sec.style.display = (val === 'without_salary') ? 'none' : 'grid';
  };

  proto.onCertTargetPresetChange = function (val) {
    const row = document.getElementById('cert-custom-target-row');
    const enInput = document.getElementById('cert-issued-to-en');
    const arInput = document.getElementById('cert-issued-to-ar');
    if (!row || !enInput || !arInput) return;

    if (val === 'bank') {
      row.style.display = 'grid';
      enInput.value = 'To: The Bank Manager / Banking Operations & Credit Facilities Department';
      arInput.value = 'إلى: مدير البنك / إدارة التسهيلات المصرفية والائتمان';
    } else if (val === 'embassy') {
      row.style.display = 'grid';
      enInput.value = 'To: The Visa Section / Embassy & Consular Affairs';
      arInput.value = 'إلى: قسم التأشيرات / السفارة والشؤون القنصلية';
    } else if (val === 'ministry') {
      row.style.display = 'grid';
      enInput.value = 'To: General Directorate of Residency and Foreigners Affairs / Competent Authorities';
      arInput.value = 'إلى: الإدارة العامة للإقامة وشؤون الأجانب / الجهات المختصة';
    } else if (val === 'custom') {
      row.style.display = 'grid';
      if (!enInput.value || enInput.value.includes('Whom It May Concern')) enInput.value = 'To: ';
      if (!arInput.value || arInput.value.includes('لمن يهمه الأمر')) arInput.value = 'إلى: ';
    } else {
      row.style.display = 'none';
      enInput.value = 'Whom It May Concern';
      arInput.value = 'لمن يهمه الأمر';
    }
  };

  proto.onCertEmployeeSelectChange = function (empId) {
    if (!empId) return;
    const emp = (this.db?.employees || []).find(e => e.id === empId);
    if (!emp) return;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('cert-emp-name-en', emp.name || '');
    setVal('cert-emp-name-ar', emp.name_ar || emp.name || '');
    setVal('cert-job-title-en', emp.position || '');
    setVal('cert-job-title-ar', emp.position_ar || emp.position || '');
    setVal('cert-passport-no', emp.passport_no || '');
    setVal('cert-nationality-en', emp.nationality || 'India');
    setVal('cert-joining-date-en', emp.date_of_joining ? this.formatDate(emp.date_of_joining) : '07/08/2025');

    const basic = Number(emp.basic_salary) || 0;
    const acc = Number(emp.accommodation_allowance) || 0;
    setVal('cert-basic-salary', basic);
    setVal('cert-acc-salary', acc);
    setVal('cert-total-salary', basic + acc);
  };

  proto.calcCertTotalSalary = function () {
    const basic = parseFloat(document.getElementById('cert-basic-salary')?.value) || 0;
    const acc = parseFloat(document.getElementById('cert-acc-salary')?.value) || 0;
    const totalEl = document.getElementById('cert-total-salary');
    if (totalEl) totalEl.value = (basic + acc).toFixed(2);
  };

  proto.saveEmploymentCertForm = async function (e) {
    const form = e.target;
    const formData = new FormData(form);
    const id = formData.get('id') || `cert-${Date.now()}`;

    const updated = {
      id,
      cert_no: formData.get('ref_no'),
      ref_no: formData.get('ref_no'),
      company_id: this.activeCompanyId || 'rayan-corp-uae',
      date: formData.get('date'),
      salary_option: formData.get('salary_option') || 'with_salary',
      target_preset: formData.get('target_preset') || 'general',
      issued_to_en: formData.get('issued_to_en') || 'Whom It May Concern',
      issued_to_ar: formData.get('issued_to_ar') || 'لمن يهمه الأمر',
      employee_name_en: formData.get('employee_name_en'),
      employee_name_ar: formData.get('employee_name_ar'),
      job_title_en: formData.get('job_title_en'),
      job_title_ar: formData.get('job_title_ar'),
      joining_date_en: formData.get('joining_date_en'),
      joining_date_ar: formData.get('joining_date_en'),
      nationality_en: formData.get('nationality_en'),
      nationality_ar: formData.get('nationality_en') === 'India' ? 'هندي' : formData.get('nationality_en'),
      passport_no: formData.get('passport_no'),
      basic_salary: parseFloat(formData.get('basic_salary')) || 0,
      accommodation_allowance: parseFloat(formData.get('accommodation_allowance')) || 0,
      total_salary: parseFloat(formData.get('total_salary')) || 0,
      currency: 'AED',
      purpose: 'This certificate is issued upon request for whatever purpose it may serve, with no responsibility on the part of the company.',
      purpose_ar: 'وقد أعطيت له هذه الشهـادة بناء على طلبه، دون تحمل الشركة أدنى مسؤولية تجاه الغير.',
      verification_email: 'rayan@rayan-group.com',
      signatory_name: 'Arshad Alam Shaikh',
      signatory_name_ar: 'ارشد عالم شيخ',
      signatory_title: 'Chief Officer of People & Culture',
      signatory_title_ar: 'الرئيس التنفيذي لقطاع الموارد البشرية و الثقافة المؤسسية',
      status: 'Issued',
      updated_at: new Date().toISOString()
    };

    if (!Array.isArray(this.db.employment_certificates)) this.db.employment_certificates = [];
    const idx = this.db.employment_certificates.findIndex(c => c.id === id);
    if (idx >= 0) this.db.employment_certificates[idx] = { ...this.db.employment_certificates[idx], ...updated };
    else this.db.employment_certificates.unshift(updated);

    // Two-way synchronization with Employee Directory
    if (!Array.isArray(this.db.employees)) this.db.employees = [];
    const normName = (updated.employee_name_en || '').toLowerCase().trim();
    let empIdx = this.db.employees.findIndex(em => {
      const emName = (em.name || '').toLowerCase().trim();
      return (updated.passport_no && em.passport_no === updated.passport_no) ||
        (emName && normName && (emName === normName || emName.includes(normName) || normName.includes(emName)));
    });

    let syncedEmp = null;
    if (empIdx >= 0) {
      this.db.employees[empIdx] = {
        ...this.db.employees[empIdx],
        name: updated.employee_name_en,
        name_ar: updated.employee_name_ar || this.db.employees[empIdx].name_ar,
        position: updated.job_title_en,
        designation: updated.job_title_en,
        position_ar: updated.job_title_ar || this.db.employees[empIdx].position_ar,
        passport_no: updated.passport_no || this.db.employees[empIdx].passport_no,
        nationality: updated.nationality_en || this.db.employees[empIdx].nationality,
        date_of_joining: updated.joining_date_en || this.db.employees[empIdx].date_of_joining,
        basic_salary: updated.basic_salary,
        accommodation_allowance: updated.accommodation_allowance,
        updated_at: new Date().toISOString()
      };
      syncedEmp = this.db.employees[empIdx];
    } else {
      syncedEmp = {
        id: `emp-${Date.now().toString(36)}`,
        employee_no: `EN${Math.floor(12000 + Math.random() * 900)}`,
        company_id: this.activeCompanyId || 'rayan-corp-uae',
        name: updated.employee_name_en,
        name_ar: updated.employee_name_ar,
        position: updated.job_title_en,
        designation: updated.job_title_en,
        position_ar: updated.job_title_ar,
        department: 'Rayan Engineering',
        date_of_joining: updated.joining_date_en || '2025-08-07',
        date_of_appointment: updated.joining_date_en || '2025-08-07',
        currency: 'AED',
        phone: '+971 50 123 4567',
        email: 'bakhteyar@rayan-group.com',
        emirates_id: '784-1988-1234567-1',
        passport_no: updated.passport_no,
        nationality: updated.nationality_en,
        visa_status: 'Employment Visa (Rayan Engineering)',
        basic_salary: updated.basic_salary,
        accommodation_allowance: updated.accommodation_allowance,
        consolidated_allowance: 0,
        other_allowance: 0,
        bank_name: 'Emirates NBD Bank PJSC',
        status: 'Active',
        updated_at: new Date().toISOString()
      };
      this.db.employees.unshift(syncedEmp);
    }

    if (typeof this.saveDatabaseToCache === 'function') { this.saveDatabaseToCache(); } else { try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (err) { } }
    this.closeModal('modal-emp-cert-edit');
    this.showNotification(`Employment Certificate ${updated.ref_no} & Employee Directory saved successfully.`, 'success');
    this.openEmploymentCertificatePrintModal(updated.id);
    await this.syncApi('save_employment_certificate', { certificate: updated });
    if (syncedEmp) {
      await this.syncApi('save_employee', { employee: syncedEmp });
    }
  };

  proto.deleteEmploymentCertificate = async function (certId) {
    const cert = (this.db?.employment_certificates || []).find(c => c.id === certId || c.ref_no === certId);
    const label = cert ? cert.ref_no : certId;
    if (!confirm(`Are you sure you want to delete Employment Certificate ${label}?`)) return;

    if (this.db.employment_certificates) {
      this.db.employment_certificates = this.db.employment_certificates.filter(c => c.id !== certId && c.ref_no !== certId);
    }
    if (typeof this.saveDatabaseToCache === 'function') { this.saveDatabaseToCache(); } else { try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (err) { } }
    this.renderActiveTab();
    this.showNotification(`Certificate ${label} deleted.`, 'info');
    await this.syncApi('delete_employment_certificate', { id: certId });
  };

  proto.renderEmploymentCertificatesTab = function (root) {
    this.ensurePayrollSeedData();
    const certs = this.getEmploymentCertificates();

    root.innerHTML = `
      <div class="fin-tab-header">
        <div class="fin-tab-title-wrap">
          <h2 class="fin-panel-title">🏛️ Official Employment Certificates (شهادات عمل)</h2>
          <p class="fin-panel-sub">Official bilingual (English &amp; Arabic) salary verification certificates with electronic signatures &amp; People &amp; Culture corporate stamps</p>
        </div>
        <div class="fin-tab-actions">
          <button type="button" class="fin-btn-secondary" onclick="window.finApp.openEmploymentCertificatePrintModal()">
            📄 Sample Certificate
          </button>
          <button type="button" class="fin-btn-primary" onclick="window.finApp.openEditEmploymentCertModal()">
            + Issue Employment Certificate
          </button>
        </div>
      </div>

      <div class="fin-panel-card">
        <div class="fin-table-wrapper">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Certificate Ref #</th>
                <th>Date</th>
                <th>Employee Name (English / Arabic)</th>
                <th>Designation</th>
                <th>Passport #</th>
                <th style="text-align:right;">Monthly Salary</th>
                <th style="text-align:center;">Status</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${certs.length === 0 ? `
                <tr>
                  <td colspan="9" style="text-align:center; padding:3rem 1rem; color:#94a3b8;">
                    <div style="font-size:2rem; margin-bottom:0.5rem;">🏛️</div>
                    <div style="font-weight:600; font-size:1rem; color:#cbd5e1;">No Employment Certificates Found</div>
                    <div style="font-size:0.8rem; margin-top:4px;">Click "+ Issue Employment Certificate" to generate an official certificate.</div>
                  </td>
                </tr>
              ` : certs.map((c, idx) => `
                <tr>
                  <td style="color:#64748b; font-size:0.8rem;">${idx + 1}</td>
                  <td>
                    <strong style="color:#38bdf8; font-weight:700; cursor:pointer;" onclick="window.finApp.openEmploymentCertificatePrintModal('${c.id}')" title="Preview Certificate">
                      ${escapeHtml(c.ref_no || c.cert_no || '')}
                    </strong>
                  </td>
                  <td>${escapeHtml(c.date || '')}</td>
                  <td>
                    <div style="font-weight:700; color:#f8fafc;">${escapeHtml(c.employee_name_en || '')}</div>
                    <div style="font-size:0.75rem; color:#94a3b8; font-family:'Amiri', serif;">${escapeHtml(c.employee_name_ar || '')}</div>
                  </td>
                  <td>
                    <div>${escapeHtml(c.job_title_en || '')}</div>
                    <div style="font-size:0.72rem; color:#38bdf8; font-family:'Amiri', serif;">${escapeHtml(c.job_title_ar || '')}</div>
                  </td>
                  <td style="font-family:monospace; color:#cbd5e1;">${escapeHtml(c.passport_no || '')}</td>
                  <td style="text-align:right; font-weight:800; color:#10b981;">
                    ${this.formatCurrency(c.total_salary || 15000, c.currency || 'AED')}
                  </td>
                  <td style="text-align:center;">
                    <span style="display:inline-block; padding:3px 9px; border-radius:12px; font-size:0.72rem; font-weight:700; color:#10b981; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3);">
                      ${escapeHtml(c.status || 'Issued')}
                    </span>
                  </td>
                  <td style="text-align:right;">
                    <div style="display:inline-flex; gap:0.35rem; align-items:center;">
                      <button type="button" class="fin-btn-row-action" style="color:#00e5d2; font-weight:700;" onclick="window.finApp.openEmploymentCertificatePrintModal('${c.id}')" title="View &amp; Print">Print / View</button>
                      <button type="button" class="fin-btn-row-action" style="color:#f59e0b; font-weight:700;" onclick="window.finApp.openEditEmploymentCertModal('${c.id}')" title="Edit">Edit</button>
                      <button type="button" class="fin-btn-row-action" style="color:#ef4444;" onclick="window.finApp.deleteEmploymentCertificate('${c.id}')" title="Delete">Delete</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  // ==========================================================================
  // 9. LETTERS OF ASSIGNMENT (خطاب التكليف والتعيين - 2 PAGES)
  // ==========================================================================
  proto.getLettersOfAssignment = function () {
    this.ensurePayrollSeedData();
    return (this.db?.letters_of_assignment || []).filter(l => this.matchesActiveCompany(l.company_id));
  };

  proto.openLetterOfAssignmentPrintModal = function (loaOrEmpId, isVerifiedScan = false) {
    this.ensurePayrollSeedData();
    let loa = null;
    const loas = this.getLettersOfAssignment();

    if (loaOrEmpId) {
      loa = loas.find(l => l.id === loaOrEmpId || l.loa_no === loaOrEmpId || l.ref_no === loaOrEmpId || l.employee_id === loaOrEmpId);
      if (!loa) {
        const emp = (this.db?.employees || []).find(e => e.id === loaOrEmpId || e.name === loaOrEmpId || e.employee_no === loaOrEmpId);
        if (emp) {
          loa = {
            id: `loa-${emp.id}`,
            loa_no: `RG/HC/LOA/${new Date().getFullYear()}/11047`,
            ref_no: `RG/HC/LOA/${new Date().getFullYear()}/11047`,
            company_id: emp.company_id || this.activeCompanyId,
            date: '26/08/2026',
            employee_id: emp.id,
            employee_name: emp.name,
            passport_no: emp.passport_no || 'C6976631',
            nationality: emp.nationality || 'India',
            position: emp.position || 'General Mason/Tiles Mason',
            reporting_manager: 'Site Supervisor or his designated nominee',
            working_hours: '08 hours a day and 6 days a week',
            basic_salary: Number(emp.basic_salary) || 1100.00,
            food_allowance: Number(emp.consolidated_allowance) || 200.00,
            overtime_amount: Number(emp.other_allowance) || 200.00,
            overtime_hours: '2-3 HRS.Per/Day',
            grand_total: (Number(emp.basic_salary) || 1100) + (Number(emp.consolidated_allowance) || 200) + (Number(emp.other_allowance) || 200),
            currency: emp.currency || 'AED',
            joining_deadline: '15-09-2026',
            signatory_name: 'Arshad Alam Shaikh',
            signatory_name_ar: 'ارشد عالم شيخ',
            signatory_title: 'Chief Executive Officer',
            signatory_title_ar: 'الرئيس التنفيذي',
            status: 'Issued'
          };
        }
      }
    }
    if (!loa) loa = loas[0] || (this.db?.letters_of_assignment || [])[0];

    loa.reference_no = loa.ref_no || loa.loa_no || 'RG/HC/LOA/2026/11047';

    const basicVal = Number(loa.basic_salary) || 1100;
    const foodVal = Number(loa.food_allowance) || 200;
    const otVal = Number(loa.overtime_amount) || 200;
    const grandTotalVal = basicVal + foodVal + otVal;
    const curr = loa.currency || 'AED';

    const loaDocNo = loa.ref_no || loa.loa_no || 'LOA';
    const modalHtml = `
      <div class="fin-doc-modal-backdrop" id="fin-doc-print-modal" data-doc-no="${escapeHtml(loaDocNo)}" data-doc-type="Letter of Assignment">
        <style>
          #fin-doc-print-modal [contenteditable="true"] {
            transition: background 0.15s, outline 0.15s;
            border-radius: 2px;
            padding: 1px 3px;
          }
          #fin-doc-print-modal [contenteditable="true"]:hover {
            background: rgba(56, 189, 248, 0.12) !important;
            outline: 1px dashed #0284c7 !important;
            cursor: text;
          }
          #fin-doc-print-modal [contenteditable="true"]:focus {
            background: rgba(56, 189, 248, 0.22) !important;
            outline: 1.5px solid #0284c7 !important;
          }
          @page {
            size: A4 portrait;
            margin: 6mm 8mm !important;
          }
          @media print {
            html, body {
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .fin-doc-viewport {
              padding: 0 !important;
              margin: 0 !important;
              overflow: visible !important;
            }
            .fin-document-paper {
              box-shadow: none !important;
              margin: 0 auto !important;
              padding: 6mm 10mm 5mm 10mm !important;
              width: 100% !important;
              max-width: 100% !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .fin-doc-page-2 {
              page-break-before: always !important;
              break-before: page !important;
              margin-top: 0 !important;
            }
            #fin-doc-print-modal [contenteditable="true"] {
              outline: none !important;
              background: transparent !important;
              padding: 0 !important;
            }
            .no-print {
              display: none !important;
            }
          }
        </style>
        <div class="fin-doc-toolbar">
          <div class="fin-doc-toolbar-left">
            <div class="fin-doc-title-badge">
              <span>📜</span>
              <span>Official Letter of Assignment (خطاب التكليف والتعيين — 2 Pages) — ${escapeHtml(loa.ref_no || loa.loa_no || 'RG/HC/LOA/2026/11047')}</span>
            </div>
            <div class="fin-doc-type-pills">
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openInvoicePrintModal()">Tax Invoice</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openReceiptPrintModal()">Receipt Voucher</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPaymentPrintModal()">Payment Voucher</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openBillPrintModal()">Purchase Bill</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPOPrintModal()">Purchase Order</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPayslipPrintModal()">Employee Pay Slip</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openEmploymentCertificatePrintModal()">Emp Cert</button>
              <button type="button" class="fin-doc-pill-btn active" onclick="window.finApp.openLetterOfAssignmentPrintModal('${loa.id}')">Assignment Letter</button>
            </div>
          </div>
          <div class="fin-doc-toolbar-right">
            <button type="button" class="fin-btn-print-action fin-btn-toggle-stamp" id="btn-toggle-stamp-sign" onclick="window.finApp.toggleDocStampSign()" title="Toggle Stamp & Signature On / Off">
              <span>🔲</span> Toggle Stamp &amp; Sign
            </button>
            <button type="button" class="fin-btn-print-action" style="background:#6366f1; color:#ffffff; border-color:#6366f1; font-weight:700; font-size:0.75rem;" onclick="window.finApp.openEditLetterOfAssignmentModal('${loa.id}')">
              <span>✏️</span> Edit LOA Details
            </button>
            <button type="button" class="fin-btn-print-primary" onclick="window.finApp ? window.finApp.printDocument() : window.print()">
              <span>🖨️</span> Print / Save as PDF
            </button>
            <button type="button" class="fin-btn-print-action" onclick="window.finApp.downloadLetterOfAssignmentDocument('${loa.id}')">
              <span>⬇️</span> Download Document
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-close" onclick="window.finApp.closeDocPrintModal()">
              <span>✕</span> Close
            </button>
          </div>
        </div>

        <div class="fin-doc-viewport">
          <!-- PAGE 1 OF LETTER OF ASSIGNMENT -->
          <div class="fin-document-paper" style="background:#ffffff; color:#0f172a; padding:6mm 12mm 5mm 12mm; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size:11.5px; line-height:1.38; box-sizing:border-box; width:100%; max-width:820px; margin:0 auto 1.5rem auto; box-shadow:0 4px 20px rgba(0,0,0,0.08); border-radius:4px; position:relative; overflow:hidden;">
            
            ${this.getRayanWatermark ? this.getRayanWatermark() : ''}

            <!-- Top 3-Column Corporate Header -->
            <div style="display:grid; grid-template-columns:1fr auto 1fr; align-items:flex-start; gap:12px; border-bottom:1.5px solid #0f172a; padding-bottom:6px; margin-bottom:8px;">
              <!-- Column 1: Left - Rayan Group Logo, Entity Name, TRN, Dynamic QR/Barcode Verification Block -->
              <div style="text-align:left; justify-self:start;">
                <div style="margin-bottom:2px;">
                  <img src="/assets/docs/rayan-group-header-logo.png" alt="Rayan Group" style="height:36px; width:auto; display:block;">
                </div>
                <div style="font-size:0.72rem; font-weight:800; color:#0f172a; line-height:1.2; text-transform:uppercase; letter-spacing:0.01em;">
                  RAYAN ENGINEERING AND CONTRACTING LLC SPC
                </div>
                <div style="font-size:0.65rem; font-weight:700; color:#64748b; line-height:1.2; margin-top:1px;">
                  TRN: 104937380400003
                </div>
                <div style="font-size:0.60rem; color:#64748b; line-height:1.2;">
                  Abu Dhabi, UAE | Tel: +971 2 565 4497
                </div>
                ${this.getRayanDynamicVerificationCode ? this.getRayanDynamicVerificationCode(loa, 'loa') : ''}
              </div>

              <!-- Column 2: Center - Dead-Center Bilingual Document Title -->
              <div style="text-align:center; padding-top:2px; justify-self:center; min-width:210px;">
                <div style="font-family:'Amiri', serif; font-size:1.35rem; font-weight:700; color:#0284c7; line-height:1.15;">خطاب التكليف والتعيين</div>
                <div style="font-family:'Outfit', -apple-system, sans-serif; font-size:1.25rem; font-weight:800; color:#0f172a; letter-spacing:0.02em; line-height:1.1;">LETTER OF ASSIGNMENT</div>
                <div style="font-size:0.60rem; color:#64748b; font-weight:700; margin-top:2px; letter-spacing:0.04em; text-transform:uppercase;">OFFICIAL EMPLOYMENT CONTRACT &amp; TERMS</div>
              </div>

              <!-- Column 3: Right - Reference, Status Badge, Date Table -->
              <div style="text-align:right; justify-self:end;">
                <div style="font-size:0.88rem; font-weight:800; color:#0284c7; font-family:monospace; margin-bottom:2px;" contenteditable="true" spellcheck="false" title="Click to edit ref no">
                  # ${escapeHtml(loa.ref_no || loa.loa_no || 'RG/HC/LOA/2026/11047')}
                </div>
                <div style="display:inline-block; font-size:0.58rem; font-weight:800; color:#b45309; background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); border-radius:3px; padding:1px 5px; text-transform:uppercase; margin-bottom:3px;">
                  CONFIDENTIAL / سري وشخصي
                </div>
                <table style="margin-left:auto; font-size:0.66rem; color:#475569; border-collapse:collapse;">
                  <tr>
                    <td style="padding:1px 3px 1px 0; font-weight:600; text-align:right;">Date:</td>
                    <td style="padding:1px 0; font-weight:700; color:#0f172a; text-align:right;" contenteditable="true" spellcheck="false">${escapeHtml(loa.date || '26/08/2026')}</td>
                    <td style="padding:1px 0 1px 3px; font-family:'Amiri', serif; font-size:0.72rem; text-align:right;">:التاريخ</td>
                  </tr>
                  <tr>
                    <td style="padding:1px 3px 1px 0; font-weight:600; text-align:right;">Joining:</td>
                    <td style="padding:1px 0; font-weight:700; color:#0f172a; text-align:right;" contenteditable="true" spellcheck="false">${escapeHtml(loa.joining_deadline || '15-09-2026')}</td>
                    <td style="padding:1px 0 1px 3px; font-family:'Amiri', serif; font-size:0.72rem; text-align:right;">:الالتحاق</td>
                  </tr>
                  <tr>
                    <td style="padding:1px 3px 1px 0; font-weight:600; text-align:right;">Contract:</td>
                    <td style="padding:1px 0; font-weight:700; color:#0f172a; text-align:right;">2 Years Term</td>
                    <td style="padding:1px 0 1px 3px; font-family:'Amiri', serif; font-size:0.72rem; text-align:right;">:المدة</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- 2-Column Corporate Info Cards -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:8px;">
              <!-- Card 1: Candidate Particulars -->
              <div style="border:1px solid #cbd5e1; border-top:3px solid #0284c7; border-radius:4px; background:#f8fafc; padding:5px 8px; font-size:0.68rem; line-height:1.35;">
                <div style="font-weight:800; font-size:0.68rem; color:#0284c7; text-transform:uppercase; margin-bottom:3px; display:flex; justify-content:space-between;">
                  <span>CANDIDATE PARTICULARS</span>
                  <span style="font-family:'Amiri', serif; font-size:0.72rem; color:#64748b;">بيانات المرشح</span>
                </div>
                <div style="color:#0f172a; font-weight:800; font-size:0.78rem; margin-bottom:2px;" contenteditable="true" spellcheck="false">
                  ${escapeHtml(loa.employee_name || 'Employee Name')}
                </div>
                <div style="color:#334155;"><strong>Passport No:</strong> <span contenteditable="true" spellcheck="false" style="font-family:monospace; font-weight:700;">${escapeHtml(loa.passport_no || 'C6976631')}</span></div>
                <div style="color:#334155;"><strong>Nationality:</strong> <span contenteditable="true" spellcheck="false">${escapeHtml(loa.nationality || 'India')}</span></div>
              </div>

              <!-- Card 2: Assignment Details -->
              <div style="border:1px solid #cbd5e1; border-top:3px solid #0f172a; border-radius:4px; background:#f8fafc; padding:5px 8px; font-size:0.68rem; line-height:1.35;">
                <div style="font-weight:800; font-size:0.68rem; color:#0f172a; text-transform:uppercase; margin-bottom:3px; display:flex; justify-content:space-between;">
                  <span>ASSIGNMENT DETAILS</span>
                  <span style="font-family:'Amiri', serif; font-size:0.72rem; color:#64748b;">تفاصيل التكليف والوظيفة</span>
                </div>
                <div style="color:#0f172a; font-weight:800; font-size:0.78rem; margin-bottom:2px;" contenteditable="true" spellcheck="false">
                  ${escapeHtml(loa.position || 'General Mason / Tiles Mason')}
                </div>
                <div style="color:#334155;"><strong>Reporting Manager:</strong> <span contenteditable="true" spellcheck="false">${escapeHtml(loa.reporting_manager || 'Site Supervisor or his designated nominee')}</span></div>
                <div style="color:#334155;"><strong>Working Hours:</strong> <span contenteditable="true" spellcheck="false">${escapeHtml(loa.working_hours || '08 hours a day and 6 days a week')}</span></div>
              </div>
            </div>

            <!-- Congratulations & Offer Introduction -->
            <div style="border:1px solid #e2e8f0; background:#ffffff; border-radius:4px; padding:6px 10px; font-size:0.68rem; line-height:1.4; color:#334155; margin-bottom:8px; text-align:justify;">
              <div style="font-weight:800; color:#0f172a; margin-bottom:2px;">
                Dear Mr. <span contenteditable="true" spellcheck="false">${escapeHtml(loa.employee_name || 'Employee Name')}</span> — Congratulations!
              </div>
              <p style="margin:0;" contenteditable="true" spellcheck="false">
                We are pleased to offer you employment in the position of <strong>${escapeHtml(loa.position || 'General Mason/Tiles Mason')}</strong> with us here at <strong>Rayan Group</strong> based on the interview and discussions held with you. All visa formalities and your commencement of work will be under <strong>Rayan Engineering and Contracting L.L.C-S.P.C</strong>. Please find below the detailed terms and conditions of our assignment agreement:
              </p>
            </div>

            <!-- Remuneration Table -->
            <table style="width:100%; border-collapse:collapse; font-size:0.68rem; margin-bottom:8px; border:1px solid #cbd5e1;">
              <thead>
                <tr style="background:#0f172a; color:#ffffff; font-weight:700; font-size:0.64rem; text-transform:uppercase; letter-spacing:0.03em;">
                  <th style="padding:4px 6px; width:30px; text-align:center; border-right:1px solid #334155;">#</th>
                  <th style="padding:4px 8px; text-align:left; border-right:1px solid #334155;">Remuneration Component / بند الراتب والبدلات</th>
                  <th style="padding:4px 8px; text-align:left; border-right:1px solid #334155;">Terms &amp; Frequency / الشروط والضوابط</th>
                  <th style="padding:4px 8px; width:140px; text-align:right;">Monthly Amount (${curr})</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:3px 6px; text-align:center; color:#64748b; font-weight:700; border-right:1px solid #e2e8f0;">1</td>
                  <td style="padding:3px 8px; border-right:1px solid #e2e8f0; font-weight:700; color:#0f172a;">Basic Salary (الراتب الأساسي)</td>
                  <td style="padding:3px 8px; border-right:1px solid #e2e8f0; color:#475569;">Fixed monthly base contractual remuneration</td>
                  <td style="padding:3px 8px; text-align:right; font-weight:700; color:#0f172a; font-family:monospace;" contenteditable="true" spellcheck="false">${basicVal.toFixed(2)}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;">
                  <td style="padding:3px 6px; text-align:center; color:#64748b; font-weight:700; border-right:1px solid #e2e8f0;">2</td>
                  <td style="padding:3px 8px; border-right:1px solid #e2e8f0; font-weight:700; color:#0f172a;">Food Allowance (بدل طعام)</td>
                  <td style="padding:3px 8px; border-right:1px solid #e2e8f0; color:#475569;">Monthly food provision allowance</td>
                  <td style="padding:3px 8px; text-align:right; font-weight:700; color:#0f172a; font-family:monospace;" contenteditable="true" spellcheck="false">${foodVal.toFixed(2)}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:3px 6px; text-align:center; color:#64748b; font-weight:700; border-right:1px solid #e2e8f0;">3</td>
                  <td style="padding:3px 8px; border-right:1px solid #e2e8f0; font-weight:700; color:#0f172a;">Approximate Over Time (${escapeHtml(loa.overtime_hours || '2-3 HRS.Per/Day')})</td>
                  <td style="padding:3px 8px; border-right:1px solid #e2e8f0; color:#475569;">Overtime as per site requirement &amp; management approval</td>
                  <td style="padding:3px 8px; text-align:right; font-weight:700; color:#0f172a; font-family:monospace;" contenteditable="true" spellcheck="false">${otVal.toFixed(2)}</td>
                </tr>
                <tr style="background:#e0f2fe; border-top:1.5px solid #0284c7; font-weight:800;">
                  <td colspan="2" style="padding:4px 8px; color:#0369a1; border-right:1px solid #bae6fd;">
                    GRAND TOTAL MONTHLY REMUNERATION (إجمالي الراتب الشهري)
                  </td>
                  <td style="padding:4px 8px; color:#0369a1; border-right:1px solid #bae6fd; font-size:0.64rem;">Monthly Package</td>
                  <td style="padding:4px 8px; text-align:right; color:#0369a1; font-size:0.82rem; font-family:monospace;" contenteditable="true" spellcheck="false">${grandTotalVal.toFixed(2)} ${curr}</td>
                </tr>
              </tbody>
            </table>

            <!-- Articles 1 through 10 (Page 1) -->
            <div style="font-size:0.67rem; line-height:1.36; color:#334155; text-align:justify;">
              <div style="margin-bottom:3px;"><strong style="color:#0f172a;">1. Accommodation allowance:</strong> Shared Accommodation (Provision or allowance) will be provided by the company.</div>
              <div style="margin-bottom:3px;"><strong style="color:#0f172a;">2. Transportation:</strong> Shared Transportation to and from the site is under company scope.</div>
              <div style="margin-bottom:3px;"><strong style="color:#0f172a;">3. Vacation and Earned leave:</strong> You are entitled to 60 calendar annual leave after completion of 2 years of service, in accordance with UAE Labor Law. Leave can be availed only on due approval.</div>
              <div style="margin-bottom:3px;"><strong style="color:#0f172a;">4. Contract:</strong> Contract shall be two years' term of employment. The employer acknowledges and agrees that the Corporation may terminate an "At Will" employment at any time, with or without cause as stipulated by law.</div>
              <div style="margin-bottom:3px;"><strong style="color:#0f172a;">5. Air Ticket:</strong> You are entitled to Economy Class return air ticket from the UAE to the nearest international airport in your home country every two years upon completion of two years of service.</div>
              <div style="margin-bottom:3px;"><strong style="color:#0f172a;">6. Medical and Insurance:</strong> You will be covered under Group Life, Personal Accident and Medical Insurance Schemes of the Company as per UAE Law and Company policy.</div>
              <div style="margin-bottom:3px;"><strong style="color:#0f172a;">7. Probation:</strong> The first 6 months of employment will be probationary. During this period if performance is not found satisfactory, the company may terminate employment without notice period.</div>
              <div style="margin-bottom:3px;"><strong style="color:#0f172a;">8. Termination of Employment:</strong> This agreement can be terminated by either party serving the other with Three-month prior notice in writing.</div>
              <div style="margin-bottom:3px;"><strong style="color:#0f172a;">9. Protection against religious discrimination:</strong> It is strictly illegal to discriminate against any individual based on religion in all company activities. Equal opportunity is mandated for all.</div>
              <div><strong style="color:#0f172a;">10. Confidentiality:</strong></div>
              <div style="padding-left:10px; color:#475569;">
                a) You agree not to disclose confidential information of the employer during or after employment.<br>
                b) Includes client lists, trade secrets, project drawings, client details, and pricing structures.<br>
                c) Upon termination, employee will return all confidential materials and provide written certification of destruction.
              </div>
            </div>

            <!-- Page 1 Footer Line -->
            <div style="margin-top:8px; border-top:1px solid #cbd5e1; padding-top:3px; display:flex; justify-content:space-between; align-items:center; font-size:0.56rem; color:#94a3b8;">
              <div># ${escapeHtml(loa.ref_no || loa.loa_no || 'RG/HC/LOA/2026/11047')}</div>
              <div>This is an official system-generated Letter of Assignment.</div>
              <div>Page 1 of 2</div>
            </div>

          </div>

          <!-- PAGE 2 OF LETTER OF ASSIGNMENT -->
          <div class="fin-document-paper fin-doc-page-2" style="background:#ffffff; color:#0f172a; padding:6mm 12mm 5mm 12mm; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size:11.5px; line-height:1.38; box-sizing:border-box; width:100%; max-width:820px; margin:0 auto 1.5rem auto; box-shadow:0 4px 20px rgba(0,0,0,0.08); border-radius:4px; position:relative; overflow:hidden;">
            
            ${this.getRayanWatermark ? this.getRayanWatermark() : ''}

            <!-- Top Header matching PO Page 2 and Corporate Documents -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #0f172a; padding-bottom:5px; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <img src="/assets/docs/rayan-group-header-logo.png" alt="Rayan Group" style="height:28px; width:auto;">
                <div>
                  <div style="font-size:0.70rem; font-weight:800; color:#0f172a; text-transform:uppercase;">RAYAN ENGINEERING AND CONTRACTING LLC SPC</div>
                  <div style="font-size:0.60rem; color:#64748b;">LETTER OF ASSIGNMENT — TERMS &amp; CONDITIONS (CONTINUATION)</div>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.75rem; font-weight:800; color:#0284c7; font-family:monospace;"># ${escapeHtml(loa.ref_no || loa.loa_no || 'RG/HC/LOA/2026/11047')}</div>
                <div style="font-size:0.60rem; color:#64748b;">Page 2 of 2 | Date: ${escapeHtml(loa.date || '26/08/2026')}</div>
              </div>
            </div>

            <!-- Articles Continuation (Page 2) -->
            <div style="font-size:0.67rem; line-height:1.36; color:#334155; text-align:justify;">
              <div style="padding-left:10px; margin-bottom:5px; color:#475569;">
                d) <strong style="color:#0f172a;">Company protects its employees from discrimination based on religion.</strong> It is illegal for any employee to discriminate against individuals because of religion in hiring, firing, promotions, increments, or other job opportunities. Any violation will face immediate termination.
              </div>

              <div style="margin-bottom:5px;">
                <strong style="color:#0f172a;">11. Employment Terms &amp; Conditions:</strong><br>
                All terms and conditions of employment are governed strictly by the UAE Labor Law and are subject to change as per Company Policy based on statutory and business requirements.
              </div>

              <div style="margin-bottom:6px;">
                <strong style="color:#0f172a;">12. Entire Agreement:</strong><br>
                a) Employment is subject to visa approval from competent ministries in the UAE.<br>
                b) The offer is valid subject to client approval, medical fitness certification and CICPA security pass approval.<br>
                c) Remuneration commences upon work permit approval and physical reporting/joining at assigned site.<br>
                d) Terms and conditions herein replace any prior verbal or written understanding between parties.<br>
                e) Any variation to this agreement must be executed in writing signed by authorized management.<br>
                f) During employment, employee shall strictly abide by HSE guidelines, site rules and group regulations.<br>
                g) All assignment terms must be treated as personal and confidential.<br>
                h) <strong style="color:#0f172a;">Work Assignments and Locations:</strong> The company reserves the right to assign or re-assign employee to any project facility ("onshore" or "offshore") across UAE or affiliated group entities.
              </div>
            </div>

            <!-- Delighted Offer Statement -->
            <div style="border:1px solid #e2e8f0; background:#f8fafc; border-radius:4px; padding:6px 10px; font-size:0.68rem; line-height:1.38; color:#334155; margin-bottom:8px;">
              <div>We are delighted to extend this offer. Please sign and return one copy of this letter latest by <strong style="color:#0f172a;">${escapeHtml(loa.joining_deadline || '15-09-2026')}</strong>.</div>
              <div style="margin-top:2px;">We look forward to establishing a fruitful working relationship and welcome you to the Rayan Group team.</div>
            </div>

            <!-- Signatures Section: Left Employer (Stamp + Sign), Right Candidate Acceptance -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:flex-start; margin-bottom:6px; page-break-inside:avoid !important; break-inside:avoid !important;">
              <!-- Left Column: For Rayan Group -->
              <div style="border:1px solid #cbd5e1; border-top:3px solid #0284c7; border-radius:4px; padding:6px 10px; background:#ffffff;">
                <div style="font-weight:800; font-size:0.70rem; color:#0284c7; text-transform:uppercase; margin-bottom:2px;">For RAYAN GROUP (جهة التعيين)</div>
                <div style="font-size:0.60rem; color:#64748b; margin-bottom:2px;">Authorized Corporate Management</div>
                
                <div id="loa-stamp-sign-wrap" class="fin-stamp-sign-container" style="position:relative; width:220px; height:62px; margin:2px 0; cursor:pointer;" onclick="window.finApp.toggleDocStampSign()" title="Click to show/hide official stamp & signature">
                  <!-- Rayan Group Round Stamp -->
                  <img src="/assets/docs/rayan-group-round-stamp.png" alt="Rayan Group Stamp" style="position:absolute; left:0; top:-12px; width:78px; height:78px; mix-blend-mode:multiply; opacity:0.95; pointer-events:none; z-index:1; transition:opacity 0.2s;">
                  <!-- Arshad Alam Shaikh Signature -->
                  <img src="/assets/docs/rayan-signature-official.png" alt="Arshad Alam Shaikh Signature" style="position:absolute; left:22px; top:6px; width:110px; height:auto; mix-blend-mode:multiply; opacity:0.95; pointer-events:none; z-index:2; transition:opacity 0.2s;">
                </div>
                
                <div style="position:relative; z-index:3;">
                  <div style="font-family:'Amiri', serif; font-size:0.86rem; font-weight:700; color:#0f172a; line-height:1.15;">${loa.signatory_name_ar || 'ارشد عالم شيخ'}</div>
                  <div style="font-weight:800; font-size:0.75rem; color:#0f172a; line-height:1.15;">${loa.signatory_name || 'Arshad Alam Shaikh'}</div>
                  <div style="font-family:'Amiri', serif; font-size:0.68rem; font-weight:700; color:#475569; line-height:1.15;">${loa.signatory_title_ar || 'الرئيس التنفيذي'}</div>
                  <div contenteditable="true" spellcheck="false" style="font-weight:700; font-size:0.62rem; color:#475569; line-height:1.15;" title="Click to edit title">${loa.signatory_title || 'Chief Executive Officer'}</div>
                </div>
              </div>

              <!-- Right Column: Candidate Acceptance -->
              <div style="border:1px solid #cbd5e1; border-top:3px solid #0f172a; border-radius:4px; padding:6px 10px; background:#ffffff; font-size:0.66rem; line-height:1.35;">
                <div style="font-weight:800; font-size:0.70rem; color:#0f172a; text-transform:uppercase; margin-bottom:2px;">CANDIDATE ACCEPTANCE (إقرار وقبول المرشح)</div>
                <div style="color:#334155; margin-bottom:4px;">
                  I, <strong style="color:#0f172a;">${escapeHtml(loa.employee_name || 'Employee Name')}</strong>, accept the offer of employment on the terms and conditions stated in this letter of my own free choice.
                </div>
                
                <table style="width:100%; font-size:0.64rem; border-collapse:collapse; margin-top:4px;">
                  <tr>
                    <td style="width:110px; padding:3px 0; color:#64748b; font-weight:600;">Candidate Name:</td>
                    <td style="font-weight:800; color:#0f172a;">${escapeHtml(loa.employee_name || 'Employee Name')}</td>
                  </tr>
                  <tr>
                    <td style="padding:3px 0; color:#64748b; font-weight:600;">Date of Joining:</td>
                    <td style="border-bottom:1px solid #94a3b8; height:18px;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding:3px 0; color:#64748b; font-weight:600;">Candidate Signature:</td>
                    <td style="border-bottom:1px solid #94a3b8; height:18px;">&nbsp;</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Standard Corporate Notes & Best Wishes Block (matching Sales Invoice) -->
            <div style="display:grid; grid-template-columns:1.2fr 0.8fr; gap:12px; align-items:flex-start; margin-bottom:4px; border-top:1px solid #e2e8f0; padding-top:4px;">
              <!-- Left: Notes -->
              <div style="font-size:0.60rem; color:#64748b; line-height:1.3;">
                <div style="font-weight:700; color:#0f172a; margin-bottom:1px;">Notes</div>
                <div style="color:#475569;">Please return a signed copy of this Letter of Assignment for official visa processing, security pass clearance, and HR records.</div>
              </div>

              <!-- Right: Corporate Best Wishes -->
              <div style="font-size:0.60rem; color:#475569; line-height:1.3; text-align:right;">
                <div style="font-weight:700; color:#0f172a;">Best wishes</div>
                <div style="font-weight:800; color:#0f172a;">RAYAN Group Team</div>
                <div style="color:#64748b;">Abu Dhabi, U.A.E</div>
                <div style="color:#64748b;">Hotline : +971 2 565 4497</div>
                <div><a href="mailto:info@rayan-group.com" style="color:#0284c7; text-decoration:none;">info@rayan-group.com</a></div>
                <div><a href="http://rayan-group.com" style="color:#0284c7; text-decoration:none;">http://rayan-group.com</a></div>
              </div>
            </div>

            <!-- Page 2 Footer Line -->
            <div style="border-top:1px solid #e2e8f0; padding-top:2px; display:flex; justify-content:space-between; align-items:center; font-size:0.56rem; color:#94a3b8;">
              <div># ${escapeHtml(loa.ref_no || loa.loa_no || 'RG/HC/LOA/2026/11047')}</div>
              <div>This is an official system-generated Letter of Assignment.</div>
              <div>Page 2 of 2</div>
            </div>

          </div>
        </div>
      </div>
    `;

    this.getModalContainer().innerHTML = modalHtml;
    document.body.classList.add('fin-doc-open');
    if (this.setActiveDocumentTitle) this.setActiveDocumentTitle(loaDocNo, 'Letter of Assignment', loa.employee_name);
  };

  proto.downloadLetterOfAssignmentDocument = function (loaId) {
    let loa = (this.db?.letters_of_assignment || []).find(l => l.id === loaId || l.loa_no === loaId || l.ref_no === loaId) || (this.db?.letters_of_assignment || [])[0];
    if (!loa) return;
    const papers = document.querySelectorAll('#fin-doc-print-modal .fin-document-paper');
    if (papers && papers.length) {
      let pagesHtml = '';
      papers.forEach(p => { pagesHtml += p.outerHTML; });

      const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(this.sanitizeFilename ? this.sanitizeFilename(loa.ref_no || loa.loa_no) : (loa.ref_no || loa.loa_no))} - Letter of Assignment</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; padding: 20px; background: #f1f5f9; display: flex; flex-direction: column; align-items: center; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
    .fin-document-paper { box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-bottom: 20px; }
    @media print {
      body { background: transparent !important; padding: 0 !important; }
      .fin-document-paper { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
      .fin-doc-page-2 { page-break-before: always !important; break-before: page !important; }
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
      const cleanDocNo = this.sanitizeFilename ? this.sanitizeFilename(loa.ref_no || loa.loa_no) : (loa.ref_no || loa.loa_no).replace(/[/\\?%*:|"<>]/g, '-');
      this.downloadFile(`${cleanDocNo} - Letter of Assignment.html`, fullDoc, 'text/html');
      this.showNotification(`Downloaded Letter of Assignment ${loa.ref_no}.`, 'success');
    }
  };

  proto.openEditLetterOfAssignmentModal = function (loaId) {
    this.ensurePayrollSeedData();
    let loa = (this.db?.letters_of_assignment || []).find(l => l.id === loaId || l.ref_no === loaId);
    if (!loa) loa = (this.db?.letters_of_assignment || [])[0] || {};

    const employees = (this.db?.employees || []).filter(e => this.matchesActiveCompany(e.company_id));
    const activeEmps = employees.filter(e => (e.status || 'Active').toLowerCase() === 'active');
    const formerEmps = employees.filter(e => (e.status || 'Active').toLowerCase() !== 'active');
    const empOptions = `
      <optgroup label="🟢 Active Employees (${activeEmps.length})">
        ${activeEmps.map(e => `<option value="${e.id}" ${loa.employee_id === e.id ? 'selected' : ''}>${escapeHtml(e.name)} (${escapeHtml(e.employee_no || '')})</option>`).join('')}
      </optgroup>
      ${formerEmps.length > 0 ? `
      <optgroup label="⚪ Former Staff (${formerEmps.length})">
        ${formerEmps.map(e => `<option value="${e.id}" ${loa.employee_id === e.id ? 'selected' : ''}>${escapeHtml(e.name)} (${escapeHtml(e.employee_no || '')}) [${escapeHtml(e.status)}]</option>`).join('')}
      </optgroup>
      ` : ''}
    `;

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-loa-edit" style="z-index:100030;">
        <div class="fin-modal-dialog" style="max-width:880px; width:95%; max-height:92vh; background:#0d1527; border:1px solid rgba(56,189,248,0.25); box-shadow:0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(0,153,230,0.12); display:flex; flex-direction:column; border-radius:16px; overflow:hidden;">
          <!-- Executive Header -->
          <div class="fin-modal-header" style="background:linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.85) 100%); padding:1.25rem 1.75rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.85rem;">
              <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(129,140,248,0.3) 100%); border:1px solid rgba(129,140,248,0.35); display:flex; align-items:center; justify-content:center; font-size:1.35rem; box-shadow:0 4px 12px rgba(99,102,241,0.15);">📜</div>
              <div>
                <h3 class="fin-modal-title" style="margin:0; font-size:1.25rem; font-weight:800; color:#f8fafc; letter-spacing:-0.01em;">
                  Edit Letter of Assignment Details
                </h3>
                <p style="margin:2px 0 0; font-size:0.78rem; color:#94a3b8;">
                  Deployment Terms, Trade Designation &amp; Remuneration Structure • خطاب التكليف والتعيين
                </p>
              </div>
            </div>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-loa-edit')" title="Close">&times;</button>
          </div>

          <!-- Body Form -->
          <form id="form-loa-edit" class="fin-modal-body" onsubmit="event.preventDefault(); window.finApp.saveLetterOfAssignmentForm(event);" style="padding:1.5rem 1.75rem; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:1.25rem;">
            <input type="hidden" name="id" value="${loa.id || ''}">

            <!-- Card 1: Assignment Reference & Fast Auto-Fill -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>📋</span>
                  <span>Assignment Reference &amp; Auto-Fill</span>
                </div>
              </div>
              <div class="fin-form-grid-2" style="margin-bottom:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Reference Number (REF:) <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" name="ref_no" value="${escapeHtml(loa.ref_no || 'RG/HC/LOA/2026/11047')}" required style="font-weight:700; color:#38bdf8; font-family:monospace;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Assignment Date <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" name="date" value="${escapeHtml(loa.date || '26/08/2026')}" required>
                </div>
              </div>
              <div class="fin-form-group" style="margin-bottom:0;">
                <label class="fin-field-label" style="display:flex; justify-content:space-between; align-items:center;">
                  <span>Auto-Fill Candidate Details</span>
                  <span style="font-size:0.72rem; color:#38bdf8; text-transform:none; font-weight:normal;">⚡ Syncs trade, passport, nationality &amp; wages</span>
                </label>
                <select class="fin-form-select" id="edit-loa-emp-select" onchange="window.finApp.onLoaEmployeeSelectChange(this.value)" style="border-color:rgba(56,189,248,0.35); background:#0f172a;">
                  <option value="">-- Choose Registered Employee to auto-populate fields --</option>
                  ${empOptions}
                </select>
              </div>
            </div>

            <!-- Card 2: Candidate Identification & Trade Designation -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>👤</span>
                  <span>Candidate Identification &amp; Trade</span>
                </div>
              </div>
              <div class="fin-form-grid-2" style="margin-bottom:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Employee Full Name <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" id="loa-emp-name" name="employee_name" value="${escapeHtml(loa.employee_name || 'Employee Name')}" required placeholder="e.g. Md Ashraf Ali">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Passport No. <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" id="loa-passport-no" name="passport_no" value="${escapeHtml(loa.passport_no || 'C6976631')}" required placeholder="e.g. C6976631" style="font-family:monospace; font-weight:700;">
                </div>
              </div>
              <div class="fin-form-grid-2">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Position / Trade Designation <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" id="loa-position" name="position" value="${escapeHtml(loa.position || 'General Mason/Tiles Mason')}" required placeholder="e.g. General Mason/Tiles Mason">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Nationality <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" id="loa-nationality" name="nationality" value="${escapeHtml(loa.nationality || 'India')}" required placeholder="e.g. India">
                </div>
              </div>
            </div>

            <!-- Card 3: Assignment Terms & Deployment Schedule -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>🛠️</span>
                  <span>Deployment Terms &amp; Reporting Schedule</span>
                </div>
              </div>
              <div class="fin-form-grid-2" style="margin-bottom:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Reporting Manager / Site Supervisor <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" name="reporting_manager" value="${escapeHtml(loa.reporting_manager || 'Site Supervisor or his designated nominee')}" required>
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Working Hours Standard <span style="color:#ef4444;">*</span></label>
                  <input type="text" class="fin-form-input" name="working_hours" value="${escapeHtml(loa.working_hours || '08 hours a day and 6 days a week')}" required>
                </div>
              </div>
              <div class="fin-form-group" style="margin-bottom:0;">
                <label class="fin-field-label">Joining Deadline Date <span style="color:#ef4444;">*</span></label>
                <input type="text" class="fin-form-input" name="joining_deadline" value="${escapeHtml(loa.joining_deadline || '15-09-2026')}" required placeholder="DD-MM-YYYY">
              </div>
            </div>

            <!-- Card 4: Wage & Allowance Breakdown (AED) -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title" style="color:#10b981;">
                  <span>💵</span>
                  <span>Monthly Remuneration &amp; Allowance Breakdown (AED)</span>
                </div>
              </div>
              <div class="fin-form-grid-4" style="align-items:flex-end;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Basic Salary (AED) <span style="color:#ef4444;">*</span></label>
                  <input type="number" step="0.01" class="fin-form-input" id="loa-basic-salary" name="basic_salary" value="${loa.basic_salary || 1100}" oninput="window.finApp.calcLoaGrandTotal()" required style="font-weight:700;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Food Allowance (AED) <span style="color:#ef4444;">*</span></label>
                  <input type="number" step="0.01" class="fin-form-input" id="loa-food-salary" name="food_allowance" value="${loa.food_allowance || 200}" oninput="window.finApp.calcLoaGrandTotal()" required style="font-weight:700;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label">Overtime Amount (AED) <span style="color:#ef4444;">*</span></label>
                  <input type="number" step="0.01" class="fin-form-input" id="loa-ot-salary" name="overtime_amount" value="${loa.overtime_amount || 200}" oninput="window.finApp.calcLoaGrandTotal()" required style="font-weight:700;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-field-label" style="color:#10b981; font-weight:800;">GRAND TOTAL (AED)</label>
                  <input type="number" step="0.01" class="fin-form-input" id="loa-grand-total" name="grand_total" value="${loa.grand_total || 1500}" readonly style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.4); font-weight:800; font-size:1.05rem; color:#10b981;">
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="fin-modal-footer" style="padding:1.15rem 0 0 0; background:transparent; border-top:1px solid rgba(255,255,255,0.08); margin-top:0.5rem;">
              <button type="button" class="fin-btn-secondary" onclick="window.finApp.closeModal('modal-loa-edit')">Cancel</button>
              <button type="submit" class="fin-btn-primary">💾 Save LOA &amp; Preview</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.getModalContainer().innerHTML = modalHtml;
  };

  proto.onLoaEmployeeSelectChange = function (empId) {
    if (!empId) return;
    const emp = (this.db?.employees || []).find(e => e.id === empId);
    if (!emp) return;
    const nameEl = document.getElementById('loa-emp-name');
    const passEl = document.getElementById('loa-passport-no');
    const posEl = document.getElementById('loa-position');
    const natEl = document.getElementById('loa-nationality');
    const basicEl = document.getElementById('loa-basic-salary');
    const foodEl = document.getElementById('loa-food-salary');
    const otEl = document.getElementById('loa-ot-salary');

    if (nameEl) nameEl.value = emp.name || '';
    if (passEl) passEl.value = emp.passport_no || 'C6976631';
    if (posEl) posEl.value = emp.position || 'General Mason/Tiles Mason';
    if (natEl) natEl.value = emp.nationality || 'India';
    if (basicEl) basicEl.value = emp.basic_salary || 1100;
    if (foodEl) foodEl.value = emp.consolidated_allowance || 200;
    if (otEl) otEl.value = emp.other_allowance || 200;
    this.calcLoaGrandTotal();
  };

  proto.calcLoaGrandTotal = function () {
    const basic = parseFloat(document.getElementById('loa-basic-salary')?.value) || 0;
    const food = parseFloat(document.getElementById('loa-food-salary')?.value) || 0;
    const ot = parseFloat(document.getElementById('loa-ot-salary')?.value) || 0;
    const totalEl = document.getElementById('loa-grand-total');
    if (totalEl) totalEl.value = (basic + food + ot).toFixed(2);
  };

  proto.saveLetterOfAssignmentForm = async function (e) {
    const form = e.target;
    const formData = new FormData(form);
    const id = formData.get('id') || `loa-${Date.now()}`;

    const updated = {
      id,
      loa_no: formData.get('ref_no'),
      ref_no: formData.get('ref_no'),
      company_id: this.activeCompanyId || 'rayan-corp-uae',
      date: formData.get('date'),
      employee_name: formData.get('employee_name'),
      passport_no: formData.get('passport_no'),
      nationality: formData.get('nationality'),
      position: formData.get('position'),
      reporting_manager: formData.get('reporting_manager'),
      working_hours: formData.get('working_hours'),
      basic_salary: parseFloat(formData.get('basic_salary')) || 0,
      food_allowance: parseFloat(formData.get('food_allowance')) || 0,
      overtime_amount: parseFloat(formData.get('overtime_amount')) || 0,
      overtime_hours: '2-3 HRS.Per/Day',
      grand_total: parseFloat(formData.get('grand_total')) || 0,
      currency: 'AED',
      joining_deadline: formData.get('joining_deadline'),
      signatory_name: 'Arshad Alam Shaikh',
      signatory_name_ar: 'ارشد عالم شيخ',
      signatory_title: 'Chief Executive Officer',
      signatory_title_ar: 'الرئيس التنفيذي',
      status: 'Issued',
      updated_at: new Date().toISOString()
    };

    if (!Array.isArray(this.db.letters_of_assignment)) this.db.letters_of_assignment = [];
    const idx = this.db.letters_of_assignment.findIndex(l => l.id === id);
    if (idx >= 0) this.db.letters_of_assignment[idx] = { ...this.db.letters_of_assignment[idx], ...updated };
    else this.db.letters_of_assignment.unshift(updated);

    // Two-way synchronization with Employee Directory
    if (!Array.isArray(this.db.employees)) this.db.employees = [];
    const normName = (updated.employee_name || '').toLowerCase().trim();
    let empIdx = this.db.employees.findIndex(em => {
      const emName = (em.name || '').toLowerCase().trim();
      return (updated.passport_no && em.passport_no === updated.passport_no) ||
        (emName && normName && (emName === normName || emName.includes(normName) || normName.includes(emName)));
    });

    let syncedEmp = null;
    if (empIdx >= 0) {
      this.db.employees[empIdx] = {
        ...this.db.employees[empIdx],
        name: updated.employee_name,
        position: updated.position,
        designation: updated.position,
        passport_no: updated.passport_no || this.db.employees[empIdx].passport_no,
        nationality: updated.nationality || this.db.employees[empIdx].nationality,
        basic_salary: updated.basic_salary,
        other_allowance: updated.food_allowance,
        updated_at: new Date().toISOString()
      };
      syncedEmp = this.db.employees[empIdx];
    } else {
      syncedEmp = {
        id: `emp-${Date.now().toString(36)}`,
        employee_no: 'RG11647',
        company_id: this.activeCompanyId || 'rayan-corp-uae',
        name: updated.employee_name,
        position: updated.position,
        designation: updated.position,
        department: 'Rayan Engineering',
        date_of_joining: updated.date || '2026-09-15',
        date_of_appointment: updated.date || '2026-08-26',
        currency: 'AED',
        passport_no: updated.passport_no,
        nationality: updated.nationality,
        visa_status: 'Employment Visa (Rayan Engineering)',
        basic_salary: updated.basic_salary,
        accommodation_allowance: 0,
        consolidated_allowance: 200,
        other_allowance: updated.food_allowance || 200,
        bank_name: 'Cash / On-Hand',
        status: 'Active',
        updated_at: new Date().toISOString()
      };
      this.db.employees.push(syncedEmp);
    }

    if (typeof this.saveDatabaseToCache === 'function') { this.saveDatabaseToCache(); } else { try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (err) { } }
    this.closeModal('modal-loa-edit');
    this.showNotification(`Letter of Assignment ${updated.ref_no} & Employee Directory saved.`, 'success');
    this.openLetterOfAssignmentPrintModal(updated.id);
    await this.syncApi('save_letter_of_assignment', { letter_of_assignment: updated });
    if (syncedEmp) {
      await this.syncApi('save_employee', { employee: syncedEmp });
    }
  };

  proto.deleteLetterOfAssignment = async function (loaId) {
    const loa = (this.db?.letters_of_assignment || []).find(l => l.id === loaId || l.ref_no === loaId);
    const label = loa ? loa.ref_no : loaId;
    if (!confirm(`Are you sure you want to delete Letter of Assignment ${label}?`)) return;

    if (this.db.letters_of_assignment) {
      this.db.letters_of_assignment = this.db.letters_of_assignment.filter(l => l.id !== loaId && l.ref_no !== loaId);
    }
    if (typeof this.saveDatabaseToCache === 'function') { this.saveDatabaseToCache(); } else { try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (err) { } }
    this.renderActiveTab();
    this.showNotification(`Letter ${label} deleted.`, 'info');
    await this.syncApi('delete_letter_of_assignment', { id: loaId });
  };

  proto.renderLettersOfAssignmentTab = function (root) {
    this.ensurePayrollSeedData();
    const loas = this.getLettersOfAssignment();

    root.innerHTML = `
      <div class="fin-tab-header">
        <div class="fin-tab-title-wrap">
          <h2 class="fin-panel-title">📜 Official Letters of Assignment (خطابات التكليف والتعيين)</h2>
          <p class="fin-panel-sub">Official 2-page employment offer letters with compensation structures, legal conditions &amp; executive seals</p>
        </div>
        <div class="fin-tab-actions">
          <button type="button" class="fin-btn-secondary" onclick="window.finApp.openLetterOfAssignmentPrintModal()">
            📄 Sample Letter (2p)
          </button>
          <button type="button" class="fin-btn-primary" onclick="window.finApp.openEditLetterOfAssignmentModal()">
            + Issue Letter of Assignment
          </button>
        </div>
      </div>

      <div class="fin-panel-card">
        <div class="fin-table-wrapper">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Letter Ref #</th>
                <th>Date</th>
                <th>Employee / Nominee</th>
                <th>Position</th>
                <th>Passport #</th>
                <th>Joining Deadline</th>
                <th style="text-align:right;">Grand Total (AED)</th>
                <th style="text-align:center;">Status</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${loas.length === 0 ? `
                <tr>
                  <td colspan="10" style="text-align:center; padding:3rem 1rem; color:#94a3b8;">
                    <div style="font-size:2rem; margin-bottom:0.5rem;">📜</div>
                    <div style="font-weight:600; font-size:1rem; color:#cbd5e1;">No Letters of Assignment Found</div>
                    <div style="font-size:0.8rem; margin-top:4px;">Click "+ Issue Letter of Assignment" to generate an official 2-page offer letter.</div>
                  </td>
                </tr>
              ` : loas.map((l, idx) => `
                <tr>
                  <td style="color:#64748b; font-size:0.8rem;">${idx + 1}</td>
                  <td>
                    <strong style="color:#38bdf8; font-weight:700; cursor:pointer;" onclick="window.finApp.openLetterOfAssignmentPrintModal('${l.id}')" title="Preview Letter">
                      ${escapeHtml(l.ref_no || l.loa_no || '')}
                    </strong>
                  </td>
                  <td>${escapeHtml(l.date || '')}</td>
                  <td>
                    <div style="font-weight:700; color:#f8fafc;">${escapeHtml(l.employee_name || '')}</div>
                    <div style="font-size:0.75rem; color:#94a3b8;">${escapeHtml(l.nationality || '')}</div>
                  </td>
                  <td>${escapeHtml(l.position || '')}</td>
                  <td style="font-family:monospace; color:#cbd5e1;">${escapeHtml(l.passport_no || '')}</td>
                  <td style="color:#f59e0b; font-weight:600;">${escapeHtml(l.joining_deadline || '')}</td>
                  <td style="text-align:right; font-weight:800; color:#10b981;">
                    ${this.formatCurrency(l.grand_total || 1500, l.currency || 'AED')}
                  </td>
                  <td style="text-align:center;">
                    <span style="display:inline-block; padding:3px 9px; border-radius:12px; font-size:0.72rem; font-weight:700; color:#10b981; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3);">
                      ${escapeHtml(l.status || 'Issued')}
                    </span>
                  </td>
                  <td style="text-align:right;">
                    <div style="display:inline-flex; gap:0.35rem; align-items:center;">
                      <button type="button" class="fin-btn-row-action" style="color:#00e5d2; font-weight:700;" onclick="window.finApp.openLetterOfAssignmentPrintModal('${l.id}')" title="View &amp; Print">Print / View</button>
                      <button type="button" class="fin-btn-row-action" style="color:#f59e0b; font-weight:700;" onclick="window.finApp.openEditLetterOfAssignmentModal('${l.id}')" title="Edit">Edit</button>
                      <button type="button" class="fin-btn-row-action" style="color:#ef4444;" onclick="window.finApp.deleteLetterOfAssignment('${l.id}')" title="Delete">Delete</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

}

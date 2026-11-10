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

  // Helper to ensure initial default employee & payslip if empty
  proto.ensurePayrollSeedData = function () {
    if (!this.db) return;
    if (!Array.isArray(this.db.employees) || this.db.employees.length === 0) {
      this.db.employees = [
        {
          id: 'emp-en12001',
          employee_no: 'EN12001',
          company_id: this.activeCompanyId || 'rayan-corp-uae',
          name: 'Bakhteyar Alam',
          position: 'Operation Manager',
          department: 'Rayan Engineering',
          date_of_joining: '2025-08-07',
          date_of_appointment: '2025-08-07',
          currency: 'AED',
          phone: '+971 50 123 4567',
          email: 'bakhteyar@rayan-group.com',
          emirates_id: '784-1988-1234567-1',
          passport_no: 'N1234567',
          visa_status: 'Employment Visa (Rayan Engineering)',
          basic_salary: 9500.00,
          accommodation_allowance: 12500.00,
          consolidated_allowance: 8000.00,
          other_allowance: 0.00,
          bank_name: 'Emirates NBD Bank PJSC',
          swift: 'EBILAEADXXX',
          iban: 'AE860260001015934645101',
          account_no: 'AE860260001015934645101',
          default_pay_method: 'AED RAYAN GROUP Host To Host',
          project_id: 'prj-toprock-police-01',
          project_name: 'The New Dubai Police Academy @ Al Rowaiyah, Dubai',
          status: 'Active',
          created_at: '2025-08-07T09:00:00Z'
        }
      ];
    }
    if (!Array.isArray(this.db.payroll) || this.db.payroll.length === 0) {
      this.db.payroll = [
        {
          id: 'ps-june2026-en12001',
          slip_no: 'PSJune 2026/EN12001',
          company_id: this.activeCompanyId || 'rayan-corp-uae',
          employee_id: 'emp-en12001',
          employee_no: 'EN12001',
          employee_name: 'Bakhteyar Alam',
          position: 'Operation Manager',
          department: 'Rayan Engineering',
          date_of_appointment: '2025-08-07',
          currency: 'AED',
          month_year: 'Jun-26',
          period_label: 'June 2026',
          printed_date: '10-Jul-26',
          payment_date: '2026-07-10',
          basic_salary: 9500.00,
          accommodation_allowance: 12500.00,
          consolidated_allowance: 8000.00,
          normal_overtime: 1000.00,
          overtime_hrs: '10.0',
          other_earnings: 0.00,
          total_earnings: 31000.00,
          advance_deduction: 0.00,
          absence_deduction: 0.00,
          loan_deduction: 0.00,
          other_deductions: 0.00,
          total_deductions: 0.00,
          net_pay: 31000.00,
          breakdown_items: [
            { date: '10/07/2026', element_name: 'Basic Salary', element_type: 'Standard Earnings', remark: 'Standard Basic Monthly', hrs: '', amount: 9500.00 },
            { date: '10/07/2026', element_name: 'Accommodation Allowance', element_type: 'Standard Earnings', remark: 'Executive Housing Allowance', hrs: '', amount: 12500.00 },
            { date: '10/07/2026', element_name: 'Consolidated Allowance', element_type: 'Standard Earnings', remark: 'Transport & Corporate Allowance', hrs: '', amount: 8000.00 },
            { date: '10/07/2026', element_name: 'Normal Overtime', element_type: 'Standard Earnings', remark: 'Project Operations Supervision', hrs: '10', amount: 1000.00 }
          ],
          bank_name: 'Emirates NBD Bank PJSC',
          swift: 'EBILAEADXXX',
          iban: 'AE860260001015934645101',
          account_no: 'AE860260001015934645101',
          pay_method: 'AED RAYAN GROUP Host To Host',
          transferred_amount: 31000.00,
          status: 'Paid',
          payout_source_type: 'bank',
          payout_source_id: 'bank-adcb-uae',
          payout_source_name: 'Abu Dhabi Commercial Bank (ADCB)',
          payout_reference: 'TXN-PAYROLL-20260710-01',
          project_id: 'prj-toprock-police-01',
          project_name: 'The New Dubai Police Academy @ Al Rowaiyah, Dubai',
          notes: 'Operation Manager monthly compensation for June 2026',
          created_at: '2026-07-10T11:30:00Z'
        }
      ];
    }
  };

  // ==========================================================================
  // 2. EMPLOYEES DIRECTORY TAB VIEW
  // ==========================================================================
  proto.renderEmployeesTab = function (root) {
    this.ensurePayrollSeedData();
    const employees = (this.db?.employees || []).filter(e => this.matchesActiveCompany(e.company_id));

    const totalActive = employees.filter(e => (e.status || 'Active').toLowerCase() === 'active').length;
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
          <button type="button" class="fin-btn-primary" onclick="window.finApp.openEmployeeModal()">
            + Add New Employee
          </button>
        </div>
      </div>

      <!-- Metrics Overview Cards -->
      <div class="fin-metrics-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
        <div class="fin-metric-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
          <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Active Workforce</div>
          <div style="font-size:1.85rem; font-weight:800; color:#38bdf8; margin:6px 0;">${totalActive}</div>
          <div style="font-size:0.72rem; color:#64748b;">Total enrolled personnel: ${employees.length}</div>
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
      <div class="fin-filter-bar" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; margin-bottom:1.25rem; background:rgba(15,23,42,0.4); padding:1rem; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
        <div style="flex:1; min-width:240px; position:relative;">
          <input type="text" id="fin-emp-search" class="fin-form-input" placeholder="Search by name, employee #, designation, bank, IBAN..." style="width:100%; padding-left:2.2rem;" oninput="window.finApp.filterEmployeeRows()">
          <span style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); color:#64748b;">🔍</span>
        </div>
        <select id="fin-emp-dept-filter" class="fin-form-select" style="min-width:180px;" onchange="window.finApp.filterEmployeeRows()">
          <option value="">All Departments</option>
          <option value="Rayan Engineering">Rayan Engineering</option>
          <option value="Civil & Fitout">Civil &amp; Fitout</option>
          <option value="Operations">Operations</option>
          <option value="MEP & Electrical">MEP &amp; Electrical</option>
          <option value="Management">Management</option>
        </select>
        <select id="fin-emp-proj-filter" class="fin-form-select" style="min-width:200px;" onchange="window.finApp.filterEmployeeRows()">
          <option value="">All Project Allocations</option>
          <option value="corporate">Corporate / General Overhead</option>
          ${projects.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.code || '')} - ${escapeHtml(p.name)}</option>`).join('')}
        </select>
        <select id="fin-emp-status-filter" class="fin-form-select" style="min-width:130px;" onchange="window.finApp.filterEmployeeRows()">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="on leave">On Leave</option>
          <option value="resigned">Resigned / Former</option>
        </select>
        <button type="button" class="fin-btn-secondary" onclick="window.finApp.renderEmployeesTab(document.getElementById('fin-view-container'))">
          🔄 Refresh
        </button>
      </div>

      <!-- Employees Directory Table -->
      <div class="fin-table-card">
        <div class="fin-table-responsive" style="overflow-x:auto;">
          <table class="fin-data-table">
            <thead>
              <tr>
                <th style="width:45px;">#</th>
                <th style="width:110px;">Emp #</th>
                <th>Employee Name &amp; Contact</th>
                <th>Designation &amp; Dept</th>
                <th>Primary Project Allocation</th>
                <th style="text-align:right;">Monthly Standard Salary</th>
                <th>Bank &amp; IBAN Coordinates</th>
                <th style="width:90px; text-align:center;">Status</th>
                <th style="width:170px; text-align:right;">Actions</th>
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
          <td colspan="9" style="text-align:center; padding:3rem 1rem; color:#94a3b8;">
            <div style="font-size:2rem; margin-bottom:0.5rem;">👥</div>
            <div style="font-weight:600; font-size:1rem; color:#cbd5e1;">No Employee Records Found</div>
            <div style="font-size:0.8rem; margin-top:4px;">Click "+ Add New Employee" to register personnel into the directory.</div>
          </td>
        </tr>
      `;
    }

    return employees.map((emp, index) => {
      const basic = Number(emp.basic_salary) || 0;
      const acc = Number(emp.accommodation_allowance) || 0;
      const cons = Number(emp.consolidated_allowance) || 0;
      const oth = Number(emp.other_allowance) || 0;
      const totalSalary = basic + acc + cons + oth;

      const isAct = (emp.status || 'Active').toLowerCase() === 'active';
      const statusColor = isAct ? '#10b981' : '#f59e0b';
      const statusBg = isAct ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)';

      return `
        <tr data-emp-id="${escapeHtml(emp.id)}">
          <td style="color:#64748b; font-size:0.8rem;">${index + 1}</td>
          <td>
            <strong style="color:#38bdf8; font-weight:700; font-family:monospace; font-size:0.9rem;">
              ${escapeHtml(emp.employee_no || 'EN---')}
            </strong>
          </td>
          <td>
            <div style="font-weight:700; color:#f8fafc; font-size:0.92rem;">${escapeHtml(emp.name || 'Unnamed')}</div>
            <div style="font-size:0.72rem; color:#94a3b8; margin-top:2px;">
              ${emp.phone ? `📞 ${escapeHtml(emp.phone)}` : ''} 
              ${emp.email ? `• ✉️ ${escapeHtml(emp.email)}` : ''}
            </div>
            ${emp.emirates_id ? `<div style="font-size:0.68rem; color:#64748b; font-family:monospace;">EID: ${escapeHtml(emp.emirates_id)}</div>` : ''}
          </td>
          <td>
            <div style="color:#e2e8f0; font-weight:600; font-size:0.85rem;">${escapeHtml(emp.position || emp.designation || 'Staff')}</div>
            <div style="font-size:0.72rem; color:#38bdf8;">${escapeHtml(emp.department || 'General')}</div>
          </td>
          <td>
            <div style="color:#cbd5e1; font-size:0.82rem; font-weight:500;">
              ${escapeHtml(emp.project_name || 'Corporate / General Overhead')}
            </div>
            <div style="font-size:0.7rem; color:#64748b;">
              Appt: ${escapeHtml(emp.date_of_joining || emp.date_of_appointment || '---')}
            </div>
          </td>
          <td style="text-align:right;">
            <div style="font-weight:800; color:#10b981; font-size:0.92rem;">
              ${this.formatCurrency(totalSalary, emp.currency || 'AED')}
            </div>
            <div style="font-size:0.68rem; color:#64748b;">
              Basic: ${this.formatCurrency(basic)} • Acc: ${this.formatCurrency(acc)}
            </div>
          </td>
          <td>
            <div style="font-size:0.8rem; font-weight:600; color:#f1f5f9;">${escapeHtml(emp.bank_name || 'Cash / On-Hand')}</div>
            <div style="font-size:0.7rem; color:#94a3b8; font-family:monospace;">
              ${emp.iban ? `IBAN: ${escapeHtml(emp.iban)}` : (emp.account_no ? `Acc: ${escapeHtml(emp.account_no)}` : 'Pay via Rayan E-Wallets / Cash')}
            </div>
          </td>
          <td style="text-align:center;">
            <span style="display:inline-block; padding:3px 9px; border-radius:12px; font-size:0.72rem; font-weight:700; color:${statusColor}; background:${statusBg}; border:1px solid ${statusColor}40;">
              ${escapeHtml(emp.status || 'Active')}
            </span>
          </td>
          <td style="text-align:right;">
            <div style="display:inline-flex; gap:0.35rem; align-items:center;">
              <button type="button" class="fin-btn-row-action" style="background:rgba(16,185,129,0.12); color:#10b981; border:1px solid rgba(16,185,129,0.3); padding:4px 8px; font-size:0.75rem;" onclick="window.finApp.openPayslipModal(null, '${emp.id}')" title="Create Monthly Pay Slip">
                📜 Pay Slip
              </button>
              <button type="button" class="fin-btn-row-action" style="background:rgba(56,189,248,0.1); color:#38bdf8; border:1px solid rgba(56,189,248,0.25); padding:4px 7px; font-size:0.75rem;" onclick="window.finApp.openEmployeeModal('${emp.id}')" title="Edit Profile">
                ✏️
              </button>
              <button type="button" class="fin-btn-row-action" style="background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.25); padding:4px 7px; font-size:0.75rem;" onclick="window.finApp.deleteEmployee('${emp.id}')" title="Delete Employee">
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

    const employees = (this.db?.employees || []).filter(e => {
      if (!this.matchesActiveCompany(e.company_id)) return false;

      if (q) {
        const hay = `${e.employee_no || ''} ${e.name || ''} ${e.position || ''} ${e.department || ''} ${e.bank_name || ''} ${e.iban || ''} ${e.phone || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (dept && !(e.department || '').toLowerCase().includes(dept)) return false;
      if (prj) {
        if (prj === 'corporate' && e.project_id) return false;
        if (prj !== 'corporate' && (e.project_id || '').toLowerCase() !== prj) return false;
      }
      if (status && (e.status || 'active').toLowerCase() !== status) return false;

      return true;
    });

    const tbody = document.getElementById('fin-emp-tbody');
    if (tbody) {
      tbody.innerHTML = this.renderEmployeeRowsHtml(employees);
    }
  };

  // ==========================================================================
  // 3. PAYROLL & MONTHLY PAYSLIPS TAB VIEW
  // ==========================================================================
  proto.renderPayrollTab = function (root) {
    this.ensurePayrollSeedData();
    const payroll = (this.db?.payroll || []).filter(p => this.matchesActiveCompany(p.company_id));

    const totalSlips = payroll.length;
    const paidSlips = payroll.filter(p => (p.status || '').toLowerCase() === 'paid');
    const totalDisbursed = paidSlips.reduce((sum, p) => sum + (Number(p.net_pay || p.transferred_amount) || 0), 0);

    const pendingSlips = payroll.filter(p => (p.status || '').toLowerCase() !== 'paid');
    const totalPending = pendingSlips.reduce((sum, p) => sum + (Number(p.net_pay || p.total_earnings) || 0), 0);

    const projectAllocated = payroll.filter(p => Boolean(p.project_id || p.project_name))
      .reduce((sum, p) => sum + (Number(p.net_pay || p.total_earnings) || 0), 0);

    const monthsSet = new Set(payroll.map(p => p.month_year || p.period_label).filter(Boolean));
    const projects = (this.db?.projects || []).filter(p => this.matchesActiveCompany(p.company_id));

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
        <div style="flex:1; min-width:240px; position:relative;">
          <input type="text" id="fin-pay-search" class="fin-form-input" placeholder="Search by slip #, employee, position, month, bank..." style="width:100%; padding-left:2.2rem;" oninput="window.finApp.filterPayrollRows()">
          <span style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); color:#64748b;">🔍</span>
        </div>
        <select id="fin-pay-month-filter" class="fin-form-select" style="min-width:140px;" onchange="window.finApp.filterPayrollRows()">
          <option value="">All Periods</option>
          ${[...monthsSet].map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('')}
        </select>
        <select id="fin-pay-status-filter" class="fin-form-select" style="min-width:130px;" onchange="window.finApp.filterPayrollRows()">
          <option value="">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="draft">Draft</option>
        </select>
        <select id="fin-pay-proj-filter" class="fin-form-select" style="min-width:200px;" onchange="window.finApp.filterPayrollRows()">
          <option value="">All Projects</option>
          <option value="corporate">Corporate / Overhead</option>
          ${projects.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.code || '')} - ${escapeHtml(p.name)}</option>`).join('')}
        </select>
        <button type="button" class="fin-btn-secondary" onclick="window.finApp.renderPayrollTab(document.getElementById('fin-view-container'))">
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
            <div style="font-size:0.8rem; font-weight:600; color:#f1f5f9;">
              ${escapeHtml(slip.payout_source_name || slip.bank_name || 'Bank Transfer')}
            </div>
            <div style="font-size:0.7rem; color:#94a3b8;">
              ${slip.payout_source_type === 'cash' ? '💵 Cash / RAYAN E-Wallets' : '🏦 Bank Transfer / Wire'}
              ${slip.payout_reference ? ` • Ref: ${escapeHtml(slip.payout_reference)}` : ''}
            </div>
          </td>
          <td style="text-align:center;">
            <span style="display:inline-block; padding:3px 9px; border-radius:12px; font-size:0.72rem; font-weight:700; color:${statusColor}; background:${statusBg}; border:1px solid ${statusColor}40;">
              ${escapeHtml((slip.status || 'Draft').toUpperCase())}
            </span>
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

  proto.filterPayrollRows = function () {
    const q = (document.getElementById('fin-pay-search')?.value || '').toLowerCase().trim();
    const month = (document.getElementById('fin-pay-month-filter')?.value || '').toLowerCase().trim();
    const status = (document.getElementById('fin-pay-status-filter')?.value || '').toLowerCase().trim();
    const prj = (document.getElementById('fin-pay-proj-filter')?.value || '').toLowerCase().trim();

    const payroll = (this.db?.payroll || []).filter(p => {
      if (!this.matchesActiveCompany(p.company_id)) return false;

      if (q) {
        const hay = `${p.slip_no || ''} ${p.employee_name || ''} ${p.employee_no || ''} ${p.month_year || ''} ${p.bank_name || ''} ${p.project_name || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (month && !(p.month_year || p.period_label || '').toLowerCase().includes(month)) return false;
      if (status && (p.status || 'draft').toLowerCase() !== status) return false;
      if (prj) {
        if (prj === 'corporate' && p.project_id) return false;
        if (prj !== 'corporate' && (p.project_id || '').toLowerCase() !== prj) return false;
      }

      return true;
    });

    const tbody = document.getElementById('fin-pay-tbody');
    if (tbody) {
      tbody.innerHTML = this.renderPayrollRowsHtml(payroll);
    }
  };

  // ==========================================================================
  // 4. EMPLOYEE MODAL (ADD / EDIT)
  // ==========================================================================
  proto.openEmployeeModal = function (empId = null) {
    let emp = null;
    if (empId) {
      emp = (this.db?.employees || []).find(e => e.id === empId);
    }

    const isEdit = Boolean(emp);
    const projects = (this.db?.projects || []).filter(p => this.matchesActiveCompany(p.company_id));

    const html = `
      <div class="fin-modal-backdrop open" id="fin-emp-modal-backdrop">
        <div class="fin-modal" style="max-width:760px; width:95%; max-height:90vh; overflow-y:auto; background:#0f172a; border:1px solid rgba(255,255,255,0.12); border-radius:14px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
          <div class="fin-modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.08);">
            <div>
              <h3 class="fin-modal-title" style="margin:0; font-size:1.15rem; color:#f8fafc;">
                ${isEdit ? '✏️ Edit Employee Profile' : '👥 Add New Employee / Worker'}
              </h3>
              <p style="margin:4px 0 0 0; font-size:0.75rem; color:#94a3b8;">
                Worker coordinates, department, compensation breakdown &amp; bank disbursement details
              </p>
            </div>
            <button type="button" class="fin-btn-ghost" onclick="window.finApp.closeEmployeeModal()" style="font-size:1.2rem; cursor:pointer;">✕</button>
          </div>

          <form id="fin-emp-form" onsubmit="window.finApp.saveEmployeeForm(event)" style="padding:1.5rem;">
            <input type="hidden" name="id" value="${emp?.id || ''}">

            <!-- Section 1: Identification & Designation -->
            <div style="font-size:0.78rem; font-weight:700; color:#38bdf8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem;">
              1. Basic Information &amp; Position
            </div>
            <div style="display:grid; grid-template-columns:1fr 2fr; gap:1rem; margin-bottom:1rem;">
              <div>
                <label class="fin-form-label">Employee No. *</label>
                <input type="text" name="employee_no" class="fin-form-input" required value="${escapeHtml(emp?.employee_no || `EN${Math.floor(12000 + Math.random() * 900)}`)}" placeholder="e.g. EN12001">
              </div>
              <div>
                <label class="fin-form-label">Full Name *</label>
                <input type="text" name="name" class="fin-form-input" required value="${escapeHtml(emp?.name || '')}" placeholder="e.g. Bakhteyar Alam">
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; margin-bottom:1rem;">
              <div>
                <label class="fin-form-label">Position / Designation *</label>
                <input type="text" name="position" class="fin-form-input" required value="${escapeHtml(emp?.position || emp?.designation || '')}" placeholder="e.g. Operation Manager">
              </div>
              <div>
                <label class="fin-form-label">Department</label>
                <input type="text" name="department" class="fin-form-input" value="${escapeHtml(emp?.department || 'Rayan Engineering')}" placeholder="e.g. Rayan Engineering">
              </div>
              <div>
                <label class="fin-form-label">Date of Appointment / Joining</label>
                <input type="date" name="date_of_joining" class="fin-form-input" value="${emp?.date_of_joining || emp?.date_of_appointment || new Date().toISOString().split('T')[0]}">
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; margin-bottom:1.25rem;">
              <div>
                <label class="fin-form-label">Phone Contact</label>
                <input type="text" name="phone" class="fin-form-input" value="${escapeHtml(emp?.phone || '')}" placeholder="+971 50 ---">
              </div>
              <div>
                <label class="fin-form-label">Email Address</label>
                <input type="email" name="email" class="fin-form-input" value="${escapeHtml(emp?.email || '')}" placeholder="name@rayan-group.com">
              </div>
              <div>
                <label class="fin-form-label">Emirates ID (EID)</label>
                <input type="text" name="emirates_id" class="fin-form-input" value="${escapeHtml(emp?.emirates_id || '')}" placeholder="784-1988-1234567-1">
              </div>
            </div>

            <!-- Section 2: Standard Salary Structure -->
            <div style="font-size:0.78rem; font-weight:700; color:#10b981; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:1rem;">
              2. Standard Monthly Salary Elements (${emp?.currency || 'AED'})
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:0.75rem; margin-bottom:0.75rem;">
              <div>
                <label class="fin-form-label">Basic Salary *</label>
                <input type="number" step="0.01" name="basic_salary" id="fin-emp-basic" class="fin-form-input" required value="${emp?.basic_salary ?? 9500}" oninput="window.finApp.calcEmpGrossSalary()">
              </div>
              <div>
                <label class="fin-form-label">Accommodation Allowance</label>
                <input type="number" step="0.01" name="accommodation_allowance" id="fin-emp-acc" class="fin-form-input" value="${emp?.accommodation_allowance ?? 12500}" oninput="window.finApp.calcEmpGrossSalary()">
              </div>
              <div>
                <label class="fin-form-label">Consolidated Allowance</label>
                <input type="number" step="0.01" name="consolidated_allowance" id="fin-emp-cons" class="fin-form-input" value="${emp?.consolidated_allowance ?? 8000}" oninput="window.finApp.calcEmpGrossSalary()">
              </div>
              <div>
                <label class="fin-form-label">Other Allowance</label>
                <input type="number" step="0.01" name="other_allowance" id="fin-emp-oth" class="fin-form-input" value="${emp?.other_allowance ?? 0}" oninput="window.finApp.calcEmpGrossSalary()">
              </div>
            </div>

            <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:8px; padding:0.6rem 1rem; display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
              <span style="font-size:0.8rem; color:#94a3b8; font-weight:600;">Standard Monthly Gross Salary:</span>
              <strong id="fin-emp-gross-preview" style="font-size:1.05rem; color:#10b981;">AED 30,000.00</strong>
            </div>

            <!-- Section 3: Banking & Payout Credentials -->
            <div style="font-size:0.78rem; font-weight:700; color:#f59e0b; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:1rem;">
              3. Banking &amp; Payout Disbursement Coordinates
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
              <div>
                <label class="fin-form-label">Bank Name</label>
                <input type="text" name="bank_name" class="fin-form-input" value="${escapeHtml(emp?.bank_name || 'Emirates NBD Bank PJSC')}" placeholder="e.g. Emirates NBD Bank PJSC">
              </div>
              <div>
                <label class="fin-form-label">Swift / IFSC Code</label>
                <input type="text" name="swift" class="fin-form-input" value="${escapeHtml(emp?.swift || 'EBILAEADXXX')}" placeholder="e.g. EBILAEADXXX">
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
              <div>
                <label class="fin-form-label">IBAN Number</label>
                <input type="text" name="iban" class="fin-form-input" value="${escapeHtml(emp?.iban || '')}" placeholder="AE860260001015934645101">
              </div>
              <div>
                <label class="fin-form-label">Account Number</label>
                <input type="text" name="account_no" class="fin-form-input" value="${escapeHtml(emp?.account_no || '')}" placeholder="AE860260001015934645101">
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
              <div>
                <label class="fin-form-label">Default Pay Method</label>
                <select name="default_pay_method" class="fin-form-select">
                  <option value="AED RAYAN GROUP Host To Host" ${emp?.default_pay_method?.includes('Host To Host') ? 'selected' : ''}>AED RAYAN GROUP Host To Host</option>
                  <option value="Bank Transfer / Wire" ${emp?.default_pay_method?.includes('Bank Transfer') ? 'selected' : ''}>Bank Transfer / Wire</option>
                  <option value="RAYAN E-Wallets / Cash" ${emp?.default_pay_method?.includes('Wallets') || emp?.default_pay_method?.includes('Cash') ? 'selected' : ''}>RAYAN E-Wallets / Cash</option>
                  <option value="Cheque" ${emp?.default_pay_method === 'Cheque' ? 'selected' : ''}>Cheque</option>
                </select>
              </div>
              <div>
                <label class="fin-form-label">Primary Project Allocation</label>
                <select name="project_id" class="fin-form-select" id="fin-emp-proj-select">
                  <option value="">Corporate / General Overhead</option>
                  ${projects.map(p => `
                    <option value="${escapeHtml(p.id)}" ${emp?.project_id === p.id ? 'selected' : ''}>
                      ${escapeHtml(p.code || '')} - ${escapeHtml(p.name)}
                    </option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label class="fin-form-label">Employment Status</label>
                <select name="status" class="fin-form-select">
                  <option value="Active" ${emp?.status === 'Active' || !emp ? 'selected' : ''}>Active</option>
                  <option value="On Leave" ${emp?.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
                  <option value="Resigned" ${emp?.status === 'Resigned' ? 'selected' : ''}>Resigned</option>
                  <option value="Terminated" ${emp?.status === 'Terminated' ? 'selected' : ''}>Terminated</option>
                </select>
              </div>
            </div>

            <!-- Footer Actions -->
            <div style="display:flex; justify-content:flex-end; gap:0.75rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:1.25rem;">
              <button type="button" class="fin-btn-secondary" onclick="window.finApp.closeEmployeeModal()">Cancel</button>
              <button type="submit" class="fin-btn-primary">
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
    const cons = parseFloat(document.getElementById('fin-emp-cons')?.value) || 0;
    const oth = parseFloat(document.getElementById('fin-emp-oth')?.value) || 0;
    const total = basic + acc + cons + oth;

    const el = document.getElementById('fin-emp-gross-preview');
    if (el) {
      el.textContent = this.formatCurrency(total);
    }
  };

  proto.closeEmployeeModal = function () {
    this.closeCustomModal('fin-emp-modal-backdrop');
  };

  proto.saveEmployeeForm = async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const empId = formData.get('id') || `emp-${Date.now().toString(36)}`;
    const prjId = formData.get('project_id') || '';
    const prj = (this.db?.projects || []).find(p => p.id === prjId);

    const empObj = {
      id: empId,
      employee_no: formData.get('employee_no') || '',
      company_id: this.activeCompanyId || 'rayan-corp-uae',
      name: formData.get('name') || '',
      position: formData.get('position') || '',
      department: formData.get('department') || 'Rayan Engineering',
      date_of_joining: formData.get('date_of_joining') || '',
      date_of_appointment: formData.get('date_of_joining') || '',
      phone: formData.get('phone') || '',
      email: formData.get('email') || '',
      emirates_id: formData.get('emirates_id') || '',
      basic_salary: parseFloat(formData.get('basic_salary')) || 0,
      accommodation_allowance: parseFloat(formData.get('accommodation_allowance')) || 0,
      consolidated_allowance: parseFloat(formData.get('consolidated_allowance')) || 0,
      other_allowance: parseFloat(formData.get('other_allowance')) || 0,
      bank_name: formData.get('bank_name') || '',
      swift: formData.get('swift') || '',
      iban: formData.get('iban') || '',
      account_no: formData.get('account_no') || '',
      default_pay_method: formData.get('default_pay_method') || 'AED RAYAN GROUP Host To Host',
      project_id: prjId,
      project_name: prj ? prj.name : 'Corporate / General Overhead',
      status: formData.get('status') || 'Active',
      updated_at: new Date().toISOString()
    };

    if (!Array.isArray(this.db.employees)) {
      this.db.employees = [];
    }

    const idx = this.db.employees.findIndex(em => em.id === empId || em.employee_no === empObj.employee_no);
    if (idx >= 0) {
      this.db.employees[idx] = { ...this.db.employees[idx], ...empObj };
    } else {
      this.db.employees.unshift(empObj);
    }

    this.closeEmployeeModal();
    this.showToast ? this.showToast('Employee profile saved successfully!', 'success') : alert('Employee profile saved successfully!');

    // Sync with backend API
    try {
      await this.syncWithBackend('save_employee', { employee: empObj });
    } catch (err) {
      console.warn('Employee backend sync warning:', err);
    }

    if (this.activeTab === 'employees') {
      this.renderEmployeesTab(document.getElementById('fin-view-container'));
    }
  };

  proto.deleteEmployee = async function (empId) {
    const emp = (this.db?.employees || []).find(e => e.id === empId);
    if (!emp) return;

    if (!confirm(`Are you sure you want to delete employee "${emp.name}" (${emp.employee_no})?`)) {
      return;
    }

    this.db.employees = this.db.employees.filter(e => e.id !== empId);

    // Sync deletion with backend
    try {
      await this.syncWithBackend('delete_employee', { id: empId });
    } catch (err) {}

    this.showToast ? this.showToast('Employee profile deleted', 'info') : null;
    if (this.activeTab === 'employees') {
      this.renderEmployeesTab(document.getElementById('fin-view-container'));
    }
  };

  // ==========================================================================
  // 5. PAYSLIP MODAL (CREATE / EDIT)
  // ==========================================================================
  proto.openPayslipModal = function (slipId = null, preselectedEmpId = null) {
    this.ensurePayrollSeedData();
    let slip = null;
    if (slipId) {
      slip = (this.db?.payroll || []).find(p => p.id === slipId);
    }

    const employees = (this.db?.employees || []).filter(e => this.matchesActiveCompany(e.company_id));
    const projects = (this.db?.projects || []).filter(p => this.matchesActiveCompany(p.company_id));
    const bankAccounts = (this.db?.bank_accounts || []).filter(b => this.matchesActiveCompany(b.company_id));
    const cashRegisters = (this.db?.cash_in_hand || []).filter(c => this.matchesActiveCompany(c.company_id));

    // Choose target employee
    let targetEmp = null;
    if (slip?.employee_id) {
      targetEmp = employees.find(e => e.id === slip.employee_id);
    } else if (preselectedEmpId) {
      targetEmp = employees.find(e => e.id === preselectedEmpId);
    } else if (employees.length > 0) {
      targetEmp = employees[0];
    }

    const isEdit = Boolean(slip);
    const slipNo = slip?.slip_no || `PSJune 2026/${targetEmp?.employee_no || 'EN12001'}`;

    const html = `
      <div class="fin-modal-backdrop open" id="fin-payslip-modal-backdrop">
        <div class="fin-modal" style="max-width:850px; width:95%; max-height:92vh; overflow-y:auto; background:#0f172a; border:1px solid rgba(255,255,255,0.12); border-radius:14px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
          <div class="fin-modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.08);">
            <div>
              <h3 class="fin-modal-title" style="margin:0; font-size:1.15rem; color:#f8fafc;">
                ${isEdit ? '✏️ Edit Monthly Pay Slip' : '📜 Create Official Monthly Pay Slip'}
              </h3>
              <p style="margin:4px 0 0 0; font-size:0.75rem; color:#94a3b8;">
                Generate official payroll voucher, calculate net earnings &amp; configure account payout deductions
              </p>
            </div>
            <button type="button" class="fin-btn-ghost" onclick="window.finApp.closePayslipModal()" style="font-size:1.2rem; cursor:pointer;">✕</button>
          </div>

          <form id="fin-payslip-form" onsubmit="window.finApp.savePayslipForm(event)" style="padding:1.5rem;">
            <input type="hidden" name="id" value="${slip?.id || ''}">

            <!-- Section 1: Employee Selection & Pay Period -->
            <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:1rem; margin-bottom:1.25rem;">
              <div>
                <label class="fin-form-label">Select Employee *</label>
                <select name="employee_id" id="fin-ps-emp-select" class="fin-form-select" required onchange="window.finApp.onPayslipEmployeeChange(this.value)">
                  ${employees.map(e => `
                    <option value="${escapeHtml(e.id)}" ${(targetEmp?.id === e.id) ? 'selected' : ''}>
                      ${escapeHtml(e.employee_no)} — ${escapeHtml(e.name)} (${escapeHtml(e.position || 'Staff')})
                    </option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label class="fin-form-label">Pay Slip Reference # *</label>
                <input type="text" name="slip_no" id="fin-ps-slip-no" class="fin-form-input" required value="${escapeHtml(slipNo)}" placeholder="PSJune 2026/EN12001">
              </div>
              <div>
                <label class="fin-form-label">Month &amp; Period *</label>
                <input type="text" name="month_year" class="fin-form-input" required value="${escapeHtml(slip?.month_year || 'Jun-26')}" placeholder="e.g. Jun-26">
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 2fr; gap:1rem; margin-bottom:1.25rem;">
              <div>
                <label class="fin-form-label">Printed Date</label>
                <input type="text" name="printed_date" class="fin-form-input" value="${escapeHtml(slip?.printed_date || '10-Jul-26')}">
              </div>
              <div>
                <label class="fin-form-label">Payment Due / Date</label>
                <input type="date" name="payment_date" class="fin-form-input" value="${slip?.payment_date || new Date().toISOString().split('T')[0]}">
              </div>
              <div>
                <label class="fin-form-label">Project Cost Center (Profit &amp; Loss Deduction) *</label>
                <select name="project_id" class="fin-form-select" id="fin-ps-proj-select">
                  <option value="">Corporate / General Overhead (No Project)</option>
                  ${projects.map(p => `
                    <option value="${escapeHtml(p.id)}" ${(slip?.project_id === p.id || (!slip && targetEmp?.project_id === p.id)) ? 'selected' : ''}>
                      ${escapeHtml(p.code || '')} - ${escapeHtml(p.name)}
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Section 2: Earnings & Allowances -->
            <div style="font-size:0.78rem; font-weight:700; color:#10b981; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:1rem;">
              Earnings Elements (AED)
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
              <div>
                <label class="fin-form-label">Basic Salary</label>
                <input type="number" step="0.01" name="basic_salary" id="fin-ps-basic" class="fin-form-input" value="${slip?.basic_salary ?? (targetEmp?.basic_salary ?? 9500)}" oninput="window.finApp.calcPayslipTotals()">
              </div>
              <div>
                <label class="fin-form-label">Accommodation</label>
                <input type="number" step="0.01" name="accommodation_allowance" id="fin-ps-acc" class="fin-form-input" value="${slip?.accommodation_allowance ?? (targetEmp?.accommodation_allowance ?? 12500)}" oninput="window.finApp.calcPayslipTotals()">
              </div>
              <div>
                <label class="fin-form-label">Consolidated</label>
                <input type="number" step="0.01" name="consolidated_allowance" id="fin-ps-cons" class="fin-form-input" value="${slip?.consolidated_allowance ?? (targetEmp?.consolidated_allowance ?? 8000)}" oninput="window.finApp.calcPayslipTotals()">
              </div>
              <div>
                <label class="fin-form-label">OT Amount</label>
                <input type="number" step="0.01" name="normal_overtime" id="fin-ps-ot" class="fin-form-input" value="${slip?.normal_overtime ?? 1000}" oninput="window.finApp.calcPayslipTotals()">
              </div>
              <div>
                <label class="fin-form-label">OT Hours</label>
                <input type="text" name="overtime_hrs" class="fin-form-input" value="${escapeHtml(slip?.overtime_hrs ?? '10.0')}" placeholder="e.g. 10.0">
              </div>
            </div>

            <!-- Section 3: Deductions -->
            <div style="font-size:0.78rem; font-weight:700; color:#ef4444; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:1rem;">
              Deductions Elements (AED)
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; margin-bottom:1rem;">
              <div>
                <label class="fin-form-label">Salary Advance Deductions</label>
                <input type="number" step="0.01" name="advance_deduction" id="fin-ps-adv" class="fin-form-input" value="${slip?.advance_deduction ?? 0}" oninput="window.finApp.calcPayslipTotals()">
              </div>
              <div>
                <label class="fin-form-label">Absences / Unpaid Leaves</label>
                <input type="number" step="0.01" name="absence_deduction" id="fin-ps-abs" class="fin-form-input" value="${slip?.absence_deduction ?? 0}" oninput="window.finApp.calcPayslipTotals()">
              </div>
              <div>
                <label class="fin-form-label">Loan / Other Deductions</label>
                <input type="number" step="0.01" name="loan_deduction" id="fin-ps-loan" class="fin-form-input" value="${slip?.loan_deduction ?? 0}" oninput="window.finApp.calcPayslipTotals()">
              </div>
            </div>

            <!-- Summary Totals Preview -->
            <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:1rem; display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; margin-bottom:1.25rem;">
              <div>
                <span style="font-size:0.75rem; color:#94a3b8; display:block;">Total Gross Earnings:</span>
                <strong id="fin-ps-tot-earn" style="font-size:1.15rem; color:#38bdf8;">AED 31,000.00</strong>
              </div>
              <div>
                <span style="font-size:0.75rem; color:#94a3b8; display:block;">Total Deductions:</span>
                <strong id="fin-ps-tot-ded" style="font-size:1.15rem; color:#ef4444;">AED 0.00</strong>
              </div>
              <div style="background:rgba(16,185,129,0.12); padding:0.4rem 0.8rem; border-radius:8px; border:1px solid rgba(16,185,129,0.3);">
                <span style="font-size:0.75rem; color:#10b981; font-weight:700; display:block;">Net Payable:</span>
                <strong id="fin-ps-net-pay" style="font-size:1.25rem; color:#10b981;">AED 31,000.00</strong>
              </div>
            </div>

            <!-- Section 4: Bank & Payout Execution Settings -->
            <div style="font-size:0.78rem; font-weight:700; color:#c084fc; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:1rem;">
              4. Payment &amp; Balance Deduction Settings
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; margin-bottom:1rem;">
              <div>
                <label class="fin-form-label">Payment Status</label>
                <select name="status" id="fin-ps-status" class="fin-form-select" onchange="window.finApp.onPayslipStatusChange(this.value)">
                  <option value="Paid" ${slip?.status === 'Paid' ? 'selected' : ''}>Paid (Deduct from Account Now)</option>
                  <option value="Pending" ${slip?.status === 'Pending' || !slip ? 'selected' : ''}>Pending / Awaiting Payout</option>
                  <option value="Draft" ${slip?.status === 'Draft' ? 'selected' : ''}>Draft</option>
                </select>
              </div>
              <div id="fin-ps-source-type-wrap">
                <label class="fin-form-label">Disburse / Deduct From</label>
                <select name="payout_source_type" id="fin-ps-source-type" class="fin-form-select" onchange="window.finApp.onPayslipSourceTypeChange(this.value)">
                  <option value="bank" ${slip?.payout_source_type === 'bank' || !slip ? 'selected' : ''}>Bank Account</option>
                  <option value="cash" ${slip?.payout_source_type === 'cash' ? 'selected' : ''}>RAYAN E-Wallets / Cash in Hand</option>
                </select>
              </div>
              <div id="fin-ps-source-acc-wrap">
                <label class="fin-form-label">Specific Account / Register</label>
                <select name="payout_source_id" id="fin-ps-source-id" class="fin-form-select">
                  ${bankAccounts.map(b => `<option value="${escapeHtml(b.id)}" ${slip?.payout_source_id === b.id ? 'selected' : ''}>🏦 ${escapeHtml(b.bank_name)} (${this.formatCurrency(b.balance)})</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
              <div>
                <label class="fin-form-label">Pay Method Text on Slip</label>
                <input type="text" name="pay_method" class="fin-form-input" value="${escapeHtml(slip?.pay_method || targetEmp?.default_pay_method || 'AED RAYAN GROUP Host To Host')}">
              </div>
              <div>
                <label class="fin-form-label">Payout Reference / Cheque #</label>
                <input type="text" name="payout_reference" class="fin-form-input" value="${escapeHtml(slip?.payout_reference || `TXN-PAYROLL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`)}" placeholder="e.g. TXN-PAYROLL-20260710-01">
              </div>
            </div>

            <!-- Footer Buttons -->
            <div style="display:flex; justify-content:flex-end; gap:0.75rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:1.25rem;">
              <button type="button" class="fin-btn-secondary" onclick="window.finApp.closePayslipModal()">Cancel</button>
              <button type="submit" class="fin-btn-primary">
                ${isEdit ? '💾 Update Pay Slip' : '✓ Generate &amp; Save Pay Slip'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showCustomModal(html);
    this.calcPayslipTotals();
    this.onPayslipSourceTypeChange(slip?.payout_source_type || 'bank');
  };

  proto.onPayslipEmployeeChange = function (empId) {
    const emp = (this.db?.employees || []).find(e => e.id === empId);
    if (!emp) return;

    const slipNoEl = document.getElementById('fin-ps-slip-no');
    if (slipNoEl && slipNoEl.value.includes('/')) {
      const prefix = slipNoEl.value.split('/')[0];
      slipNoEl.value = `${prefix}/${emp.employee_no || 'EN---'}`;
    }

    if (emp.basic_salary !== undefined) document.getElementById('fin-ps-basic').value = emp.basic_salary;
    if (emp.accommodation_allowance !== undefined) document.getElementById('fin-ps-acc').value = emp.accommodation_allowance;
    if (emp.consolidated_allowance !== undefined) document.getElementById('fin-ps-cons').value = emp.consolidated_allowance;

    const projSel = document.getElementById('fin-ps-proj-select');
    if (projSel && emp.project_id) {
      projSel.value = emp.project_id;
    }

    this.calcPayslipTotals();
  };

  proto.calcPayslipTotals = function () {
    const basic = parseFloat(document.getElementById('fin-ps-basic')?.value) || 0;
    const acc = parseFloat(document.getElementById('fin-ps-acc')?.value) || 0;
    const cons = parseFloat(document.getElementById('fin-ps-cons')?.value) || 0;
    const ot = parseFloat(document.getElementById('fin-ps-ot')?.value) || 0;
    const totEarn = basic + acc + cons + ot;

    const adv = parseFloat(document.getElementById('fin-ps-adv')?.value) || 0;
    const abs = parseFloat(document.getElementById('fin-ps-abs')?.value) || 0;
    const loan = parseFloat(document.getElementById('fin-ps-loan')?.value) || 0;
    const totDed = adv + abs + loan;

    const net = Math.max(0, totEarn - totDed);

    const earnEl = document.getElementById('fin-ps-tot-earn');
    const dedEl = document.getElementById('fin-ps-tot-ded');
    const netEl = document.getElementById('fin-ps-net-pay');

    if (earnEl) earnEl.textContent = this.formatCurrency(totEarn);
    if (dedEl) dedEl.textContent = this.formatCurrency(totDed);
    if (netEl) netEl.textContent = this.formatCurrency(net);
  };

  proto.onPayslipSourceTypeChange = function (type) {
    const idSel = document.getElementById('fin-ps-source-id');
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

  proto.closePayslipModal = function () {
    this.closeCustomModal('fin-payslip-modal-backdrop');
  };

  proto.savePayslipForm = async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const slipId = formData.get('id') || `ps-${Date.now().toString(36)}`;
    const empId = formData.get('employee_id');
    const emp = (this.db?.employees || []).find(em => em.id === empId);

    const prjId = formData.get('project_id') || '';
    const prj = (this.db?.projects || []).find(p => p.id === prjId);

    const basic = parseFloat(formData.get('basic_salary')) || 0;
    const acc = parseFloat(formData.get('accommodation_allowance')) || 0;
    const cons = parseFloat(formData.get('consolidated_allowance')) || 0;
    const ot = parseFloat(formData.get('normal_overtime')) || 0;
    const otHrs = formData.get('overtime_hrs') || '';
    const totEarn = basic + acc + cons + ot;

    const adv = parseFloat(formData.get('advance_deduction')) || 0;
    const abs = parseFloat(formData.get('absence_deduction')) || 0;
    const loan = parseFloat(formData.get('loan_deduction')) || 0;
    const totDed = adv + abs + loan;

    const netPay = Math.max(0, totEarn - totDed);
    const status = formData.get('status') || 'Pending';
    const sourceType = formData.get('payout_source_type') || 'bank';
    const sourceId = formData.get('payout_source_id') || '';

    let sourceName = '';
    if (sourceType === 'cash') {
      const reg = (this.db?.cash_in_hand || []).find(c => c.id === sourceId);
      sourceName = reg ? reg.register_name : 'RAYAN E-Wallets';
    } else {
      const bank = (this.db?.bank_accounts || []).find(b => b.id === sourceId);
      sourceName = bank ? bank.bank_name : 'Bank Transfer';
    }

    const payDate = formData.get('payment_date') || new Date().toISOString().split('T')[0];
    const printedDate = formData.get('printed_date') || '10-Jul-26';

    const slipObj = {
      id: slipId,
      slip_no: formData.get('slip_no') || '',
      company_id: this.activeCompanyId || 'rayan-corp-uae',
      employee_id: empId,
      employee_no: emp ? emp.employee_no : '',
      employee_name: emp ? emp.name : '',
      position: emp ? (emp.position || emp.designation) : '',
      department: emp ? emp.department : 'Rayan Engineering',
      date_of_appointment: emp ? (emp.date_of_joining || emp.date_of_appointment) : '2025-08-07',
      currency: emp ? emp.currency : 'AED',
      month_year: formData.get('month_year') || 'Jun-26',
      period_label: formData.get('month_year') || 'June 2026',
      printed_date: printedDate,
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
      pay_method: formData.get('pay_method') || 'AED RAYAN GROUP Host To Host',
      transferred_amount: netPay,
      status: status,
      payout_source_type: sourceType,
      payout_source_id: sourceId,
      payout_source_name: sourceName,
      payout_reference: formData.get('payout_reference') || '',
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

    // Execute direct deduction from Bank Account or Cash in Hand if marked Paid!
    if (status === 'Paid') {
      this.applyPayrollPayoutDeduction(slipObj);
    }

    this.closePayslipModal();
    this.normalizeAllBalances();
    this.showToast ? this.showToast(`Pay Slip ${slipObj.slip_no} generated successfully!`, 'success') : null;

    try {
      await this.syncWithBackend('save_payroll', { payroll: slipObj });
    } catch (err) {
      console.warn('Payroll backend sync warning:', err);
    }

    if (this.activeTab === 'payroll') {
      this.renderPayrollTab(document.getElementById('fin-view-container'));
    }
  };

  proto.deletePayslip = async function (slipId) {
    const slip = (this.db?.payroll || []).find(p => p.id === slipId);
    if (!slip) return;

    if (!confirm(`Are you sure you want to delete pay slip "${slip.slip_no}" for ${slip.employee_name}?`)) {
      return;
    }

    this.db.payroll = this.db.payroll.filter(p => p.id !== slipId);

    try {
      await this.syncWithBackend('delete_payroll', { id: slipId });
    } catch (err) {}

    this.normalizeAllBalances();
    this.showToast ? this.showToast('Pay slip deleted', 'info') : null;
    if (this.activeTab === 'payroll') {
      this.renderPayrollTab(document.getElementById('fin-view-container'));
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
        <div class="fin-modal" style="max-width:540px; width:95%; background:#0f172a; border:1px solid rgba(255,255,255,0.12); border-radius:14px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
          <div class="fin-modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.08);">
            <div>
              <h3 class="fin-modal-title" style="margin:0; font-size:1.1rem; color:#f8fafc;">
                💳 Disburse Salary Payout
              </h3>
              <p style="margin:3px 0 0 0; font-size:0.75rem; color:#94a3b8;">
                Deduct net wages directly from Bank Account or RAYAN E-Wallets
              </p>
            </div>
            <button type="button" class="fin-btn-ghost" onclick="window.finApp.closeDisburseModal()" style="font-size:1.2rem; cursor:pointer;">✕</button>
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
                <input type="text" name="payout_reference" class="fin-form-input" value="TXN-PAYROLL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}">
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
      this.renderPayrollTab(document.getElementById('fin-view-container'));
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
            cash_in_hand_id: reg.id,
            register_name: reg.register_name,
            voucher_date: slip.payment_date || new Date().toISOString().split('T')[0],
            date: slip.payment_date || new Date().toISOString().split('T')[0],
            type: 'outflow',
            category: 'Salary & Labor Payout',
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
  proto.openPayslipPrintModal = function (slipId = null) {
    this.ensurePayrollSeedData();
    let slip = (this.db?.payroll || []).find(p => p.id === slipId || p.slip_no === slipId);
    if (!slip) {
      slip = (this.db?.payroll || [])[0] || {};
    }

    const modalHtml = `
      <div class="fin-doc-modal-backdrop" id="fin-doc-print-modal">
        <div class="fin-doc-toolbar">
          <div class="fin-doc-toolbar-left">
            <div class="fin-doc-title-badge">
              <span>📜</span>
              <span>Employee Pay Slip — ${escapeHtml(slip.slip_no || 'PSJune 2026/EN12001')}</span>
            </div>
            <div class="fin-doc-type-pills">
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openInvoicePrintModal()">Tax Invoice</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openReceiptPrintModal()">Receipt Voucher</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPaymentPrintModal()">Payment Voucher</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openBillPrintModal()">Purchase Bill</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPOPrintModal()">Purchase Order</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openCreditNotePrintModal()">Credit Note</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openDebitNotePrintModal()">Debit Note</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openWorkCompletionPrintModal()">Completion Cert</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openDeliveryNotePrintModal()">Delivery Note</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openUndertakingLetterPrintModal()">Undertaking Letter</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openCustomLetterPrintModal()">Official Letter</button>
              <button type="button" class="fin-doc-pill-btn active" onclick="window.finApp.openPayslipPrintModal('${slip.id}')">Employee Pay Slip</button>
            </div>
          </div>
          <div class="fin-doc-toolbar-right">
            <button type="button" class="fin-btn-print-action fin-btn-print-primary" onclick="window.finApp.printDocument()">
              🖨️ Print / Save as PDF
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.downloadPayslipDocument('${slip.id}')">
              📥 Download Document
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal(); window.finApp.openPayslipModal('${slip.id}')" style="color:#f59e0b; border-color:rgba(245,158,11,0.4);">
              ✏️ Edit Pay Slip
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal()">
              ✕ Close
            </button>
          </div>
        </div>

        <div class="fin-doc-viewport">
          <div class="fin-document-paper" style="background:#ffffff; color:#000000; padding:10mm 12mm 8mm 12mm; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing:border-box; width:100%; max-width:820px; margin:0 auto 2rem auto; box-shadow:0 4px 20px rgba(0,0,0,0.08); border-radius:4px; position:relative; overflow:hidden;">

            <!-- Center Watermark -->
            ${this.getRayanWatermark ? this.getRayanWatermark() : ''}

            <!-- Document Content Layer -->
            <div style="position:relative; z-index:1;">

              <!-- Header with Official Brand Logo -->
              <div style="text-align:center; margin-bottom:0.75rem;">
                <img src="/assets/docs/rayan-doc-logo.png" alt="RAYAN ENGINEERING" style="height:56px; width:auto; display:inline-block; margin:0 auto;" onerror="this.src='/assets/logos/rayan-group.png'">
                <div style="border-top:3px solid #009cb2; margin-top:8px; width:100%;"></div>
              </div>

              <!-- Top Printed Meta Row -->
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem; font-size:0.8rem;">
                <div>
                  <span style="color:#0284c7; font-weight:700;">Printed Date:</span>
                  <span style="color:#0f172a; font-weight:600; margin-left:6px;">${escapeHtml(slip.printed_date || '10-Jul-26')}</span>
                </div>
                <div style="color:#0f172a; font-weight:700; font-size:0.88rem;">
                  ${escapeHtml(slip.slip_no || 'PSJune 2026/EN12001')}
                </div>
              </div>

              <!-- Pay Slip Title & Month Banner -->
              <div style="text-align:center; margin-bottom:1.15rem;">
                <div style="color:#00838f; font-size:1.22rem; font-weight:800; letter-spacing:0.06em; text-transform:uppercase;">
                  EMPLOYEE PAY SLIP
                </div>
                <div style="color:#0f172a; font-size:1rem; font-weight:700; margin-top:2px;">
                  ${escapeHtml(slip.month_year || 'Jun-26')}
                </div>
              </div>

              <!-- TABLE 1: Employee Information -->
              <table style="width:100%; border-collapse:collapse; border:1.5px solid #000000; margin-bottom:0.9rem; font-size:0.76rem;">
                <thead>
                  <tr>
                    <th colspan="6" style="background:#137547; color:#ffffff; font-weight:700; text-align:center; padding:4px 6px; border:1px solid #000000; font-size:0.85rem; letter-spacing:0.02em;">
                      Employee Information
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="border:1px solid #000000; padding:4px 8px; width:17%; font-weight:500;">Employee No.</td>
                    <td style="border:1px solid #000000; padding:4px 8px; width:22%; font-weight:700;">${escapeHtml(slip.employee_no || 'EN12001')}</td>
                    <td style="border:1px solid #000000; padding:4px 8px; width:18%; font-weight:500;">Date Off Appt.</td>
                    <td style="border:1px solid #000000; padding:4px 8px; width:20%; font-weight:700;">${escapeHtml(slip.date_of_appointment || '7/Aug/2025')}</td>
                    <td style="border:1px solid #000000; padding:4px 8px; width:11%; font-weight:500;">Currency</td>
                    <td style="border:1px solid #000000; padding:4px 8px; width:12%; font-weight:700;">${escapeHtml(slip.currency || 'AED')}</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #000000; padding:4px 8px; font-weight:500;">Employee Name</td>
                    <td colspan="5" style="border:1px solid #000000; padding:4px 8px; font-weight:700; font-size:0.82rem;">${escapeHtml(slip.employee_name || 'Bakhteyar Alam')}</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #000000; padding:4px 8px; font-weight:500;">Position</td>
                    <td colspan="2" style="border:1px solid #000000; padding:4px 8px; font-weight:700;">${escapeHtml(slip.position || 'Operation Manager')}</td>
                    <td style="border:1px solid #000000; padding:4px 8px; font-weight:500;">Department</td>
                    <td colspan="2" style="border:1px solid #000000; padding:4px 8px; font-weight:700;">${escapeHtml(slip.department || 'Rayan Engineering')}</td>
                  </tr>
                </tbody>
              </table>

              <!-- TABLE 2: Salary Breakdown (Earnings vs Deductions) -->
              <table style="width:100%; border-collapse:collapse; border:1.5px solid #000000; margin-bottom:0.9rem; font-size:0.76rem;">
                <thead>
                  <tr>
                    <th colspan="4" style="background:#137547; color:#ffffff; font-weight:700; text-align:center; padding:4px 6px; border:1px solid #000000; font-size:0.85rem; letter-spacing:0.02em;">
                      Salary Breakdown
                    </th>
                  </tr>
                  <tr>
                    <th colspan="2" style="border:1px solid #000000; padding:3px 6px; text-align:center; font-weight:700; width:50%; background:#f8fafc;">Earnings</th>
                    <th colspan="2" style="border:1px solid #000000; padding:3px 6px; text-align:center; font-weight:700; width:50%; background:#f8fafc;">Deductions</th>
                  </tr>
                  <tr style="font-size:0.72rem; color:#475569;">
                    <th style="border:1px solid #000000; padding:3px 8px; text-align:left; width:28%; font-weight:600;">Element Name</th>
                    <th style="border:1px solid #000000; padding:3px 8px; text-align:right; width:22%; font-weight:600;">Amount</th>
                    <th style="border:1px solid #000000; padding:3px 8px; text-align:left; width:28%; font-weight:600;">Element Name</th>
                    <th style="border:1px solid #000000; padding:3px 8px; text-align:right; width:22%; font-weight:600;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="border:1px solid #000000; padding:4px 8px;">Basic Salary</td>
                    <td style="border:1px solid #000000; padding:4px 8px; text-align:right; font-weight:600;">${formatMoney(slip.basic_salary, slip.currency || 'AED')}</td>
                    <td style="border:1px solid #000000; padding:4px 8px;">${slip.advance_deduction > 0 ? 'Salary Advance' : ''}</td>
                    <td style="border:1px solid #000000; padding:4px 8px; text-align:right;">${slip.advance_deduction > 0 ? formatMoney(slip.advance_deduction, slip.currency || 'AED') : ''}</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #000000; padding:4px 8px;">Accommodation Allowance</td>
                    <td style="border:1px solid #000000; padding:4px 8px; text-align:right; font-weight:600;">${formatMoney(slip.accommodation_allowance, slip.currency || 'AED')}</td>
                    <td style="border:1px solid #000000; padding:4px 8px;">${slip.absence_deduction > 0 ? 'Absence / Leave' : ''}</td>
                    <td style="border:1px solid #000000; padding:4px 8px; text-align:right;">${slip.absence_deduction > 0 ? formatMoney(slip.absence_deduction, slip.currency || 'AED') : ''}</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #000000; padding:4px 8px;">Consolidated Allowance</td>
                    <td style="border:1px solid #000000; padding:4px 8px; text-align:right; font-weight:600;">${formatMoney(slip.consolidated_allowance, slip.currency || 'AED')}</td>
                    <td style="border:1px solid #000000; padding:4px 8px;">${slip.loan_deduction > 0 ? 'Loan / Penalties' : ''}</td>
                    <td style="border:1px solid #000000; padding:4px 8px; text-align:right;">${slip.loan_deduction > 0 ? formatMoney(slip.loan_deduction, slip.currency || 'AED') : ''}</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #000000; padding:4px 8px;">Normal Overtime</td>
                    <td style="border:1px solid #000000; padding:4px 8px; text-align:right; font-weight:600;">${formatMoney(slip.normal_overtime, slip.currency || 'AED')}</td>
                    <td style="border:1px solid #000000; padding:4px 8px;"></td>
                    <td style="border:1px solid #000000; padding:4px 8px; text-align:right;"></td>
                  </tr>
                  <tr style="font-weight:700; background:#fafafa;">
                    <td style="border:1px solid #000000; padding:4px 8px;">Total Earnings</td>
                    <td style="border:1px solid #000000; padding:4px 8px; text-align:right;">${formatMoney(slip.total_earnings, slip.currency || 'AED')}</td>
                    <td style="border:1px solid #000000; padding:4px 8px;">Total Deductions</td>
                    <td style="border:1px solid #000000; padding:4px 8px; text-align:right;">${slip.total_deductions > 0 ? formatMoney(slip.total_deductions, slip.currency || 'AED') : ''}</td>
                  </tr>
                  <tr style="font-weight:800; font-size:0.86rem;">
                    <td colspan="3" style="border:1px solid #000000; padding:6px 10px; color:#137547;">Net Pay</td>
                    <td style="border:1px solid #000000; padding:6px 10px; text-align:right; background:#dcfce7; color:#14532d; font-size:0.92rem;">
                      ${formatMoney(slip.net_pay, slip.currency || 'AED')}
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- TABLE 3: Payment Details -->
              <table style="width:100%; border-collapse:collapse; border:1.5px solid #000000; margin-bottom:0.9rem; font-size:0.76rem;">
                <thead>
                  <tr>
                    <th colspan="4" style="background:#137547; color:#ffffff; font-weight:700; text-align:center; padding:4px 6px; border:1px solid #000000; font-size:0.85rem; letter-spacing:0.02em;">
                      Payment Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="border:1px solid #000000; padding:4px 8px; width:20%; font-weight:500;">Bank Name</td>
                    <td style="border:1px solid #000000; padding:4px 8px; width:35%; font-weight:700;">${escapeHtml(slip.bank_name || 'Emirates NBD Bank PJSC')}</td>
                    <td style="border:1px solid #000000; padding:4px 8px; width:20%; font-weight:500;">Swift/IFSC</td>
                    <td style="border:1px solid #000000; padding:4px 8px; width:25%; font-weight:700;">${escapeHtml(slip.swift || 'EBILAEADXXX')}</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #000000; padding:4px 8px; font-weight:500;">IBAN No.</td>
                    <td style="border:1px solid #000000; padding:4px 8px; font-weight:700; font-family:monospace;">${escapeHtml(slip.iban || 'AE860260001015934645101')}</td>
                    <td style="border:1px solid #000000; padding:4px 8px; font-weight:500;">Account No.</td>
                    <td style="border:1px solid #000000; padding:4px 8px; font-weight:700; font-family:monospace;">${escapeHtml(slip.account_no || 'AE860260001015934645101')}</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #000000; padding:4px 8px; font-weight:500;">Pay Method</td>
                    <td style="border:1px solid #000000; padding:4px 8px; font-weight:700;">${escapeHtml(slip.pay_method || 'AED RAYAN GROUP Host To Host')}</td>
                    <td style="border:1px solid #000000; padding:4px 8px; font-weight:500;">Transferred amount</td>
                    <td style="border:1px solid #000000; padding:4px 8px; font-weight:800; font-size:0.84rem; text-align:right;">
                      ${formatMoney(slip.transferred_amount || slip.net_pay, slip.currency || 'AED')}
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- TABLE 4: Employee Break Down for the month -->
              <table style="width:100%; border-collapse:collapse; border:1.5px solid #000000; margin-bottom:1.5rem; font-size:0.75rem;">
                <thead>
                  <tr>
                    <th colspan="6" style="background:#137547; color:#ffffff; font-weight:700; text-align:center; padding:4px 6px; border:1px solid #000000; font-size:0.85rem; letter-spacing:0.02em;">
                      Employee Break Down for the month of ${escapeHtml(slip.period_label || slip.month_year || 'June 2026')}
                    </th>
                  </tr>
                  <tr style="background:#f8fafc; font-size:0.73rem;">
                    <th style="border:1px solid #000000; padding:4px 8px; width:15%; text-align:left;">Date</th>
                    <th style="border:1px solid #000000; padding:4px 8px; width:30%; text-align:left;">Element Name</th>
                    <th style="border:1px solid #000000; padding:4px 8px; width:22%; text-align:left;">Element Type</th>
                    <th style="border:1px solid #000000; padding:4px 8px; width:15%; text-align:left;">Remark</th>
                    <th style="border:1px solid #000000; padding:4px 8px; width:6%; text-align:center;">Hrs</th>
                    <th style="border:1px solid #000000; padding:4px 8px; width:12%; text-align:right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${(slip.breakdown_items && slip.breakdown_items.length > 0) ? slip.breakdown_items.map(item => `
                    <tr>
                      <td style="border:1px solid #000000; padding:4px 8px;">${escapeHtml(item.date || '10/07/2026')}</td>
                      <td style="border:1px solid #000000; padding:4px 8px; font-weight:600;">${escapeHtml(item.element_name || '')}</td>
                      <td style="border:1px solid #000000; padding:4px 8px; color:#475569;">${escapeHtml(item.element_type || 'Standard Earnings')}</td>
                      <td style="border:1px solid #000000; padding:4px 8px; color:#64748b;">${escapeHtml(item.remark || '')}</td>
                      <td style="border:1px solid #000000; padding:4px 8px; text-align:center;">${escapeHtml(item.hrs || '')}</td>
                      <td style="border:1px solid #000000; padding:4px 8px; text-align:right; font-weight:700;">${formatMoney(item.amount, slip.currency || 'AED')}</td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td style="border:1px solid #000000; padding:4px 8px;">10/07/2026</td>
                      <td style="border:1px solid #000000; padding:4px 8px; font-weight:600;">Basic Salary</td>
                      <td style="border:1px solid #000000; padding:4px 8px; color:#475569;">Standard Earnings</td>
                      <td style="border:1px solid #000000; padding:4px 8px;"></td>
                      <td style="border:1px solid #000000; padding:4px 8px;"></td>
                      <td style="border:1px solid #000000; padding:4px 8px; text-align:right; font-weight:700;">${formatMoney(slip.basic_salary, slip.currency || 'AED')}</td>
                    </tr>
                    <tr>
                      <td style="border:1px solid #000000; padding:4px 8px;">10/07/2026</td>
                      <td style="border:1px solid #000000; padding:4px 8px; font-weight:600;">Accommodation Allowance</td>
                      <td style="border:1px solid #000000; padding:4px 8px; color:#475569;">Standard Earnings</td>
                      <td style="border:1px solid #000000; padding:4px 8px;"></td>
                      <td style="border:1px solid #000000; padding:4px 8px;"></td>
                      <td style="border:1px solid #000000; padding:4px 8px; text-align:right; font-weight:700;">${formatMoney(slip.accommodation_allowance, slip.currency || 'AED')}</td>
                    </tr>
                    <tr>
                      <td style="border:1px solid #000000; padding:4px 8px;">10/07/2026</td>
                      <td style="border:1px solid #000000; padding:4px 8px; font-weight:600;">Consolidated Allowance</td>
                      <td style="border:1px solid #000000; padding:4px 8px; color:#475569;">Standard Earnings</td>
                      <td style="border:1px solid #000000; padding:4px 8px;"></td>
                      <td style="border:1px solid #000000; padding:4px 8px;"></td>
                      <td style="border:1px solid #000000; padding:4px 8px; text-align:right; font-weight:700;">${formatMoney(slip.consolidated_allowance, slip.currency || 'AED')}</td>
                    </tr>
                    <tr>
                      <td style="border:1px solid #000000; padding:4px 8px;">10/07/2026</td>
                      <td style="border:1px solid #000000; padding:4px 8px; font-weight:600;">Normal Overtime</td>
                      <td style="border:1px solid #000000; padding:4px 8px; color:#475569;">Standard Earnings</td>
                      <td style="border:1px solid #000000; padding:4px 8px;"></td>
                      <td style="border:1px solid #000000; padding:4px 8px; text-align:center;">${escapeHtml(slip.overtime_hrs || '10')}</td>
                      <td style="border:1px solid #000000; padding:4px 8px; text-align:right; font-weight:700;">${formatMoney(slip.normal_overtime, slip.currency || 'AED')}</td>
                    </tr>
                  `}
                </tbody>
              </table>

              <!-- Project & Cost Allocation Note (if linked) -->
              ${slip.project_name ? `
                <div style="font-size:0.7rem; color:#64748b; margin-top:-0.5rem; margin-bottom:1rem; font-style:italic;">
                  Cost Center Allocation: ${escapeHtml(slip.project_name)} • Direct Project Profit/Loss Deduction
                </div>
              ` : ''}

              <!-- Bottom Contact Bar (matching sample) -->
              <div style="background:#00a3c4; color:#ffffff; padding:6px 12px; text-align:center; font-size:0.74rem; font-weight:600; letter-spacing:0.02em; border-radius:2px; margin-top:1.5rem;">
                Tel: +971-25654497 | Abu Dhabi, United Arab Emirates | info@rayan-group.com | www.rayan-group.com
              </div>

            </div>
          </div>
        </div>
      </div>
    `;

    this.showCustomModal(modalHtml);
  };

  proto.downloadPayslipDocument = function (slipId) {
    const slip = (this.db?.payroll || []).find(p => p.id === slipId) || (this.db?.payroll || [])[0];
    const filename = `PAYSLIP_${(slip?.slip_no || 'slip').replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
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
        <title>${escapeHtml(slip?.slip_no || 'Employee Pay Slip')}</title>
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
}

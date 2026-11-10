/**
 * Rayan Group — Operations & Contracts Document Modules
 * 1. WORK COMPLETION CERTIFICATE (شهادة اتمام العمل)
 * 2. Material Delivery Note (إذن تسليم مواد)
 * 3. Subcontractor Undertaking Letter (خطاب تعهد مقاول من الباطن)
 * 4. Corporate Official Letter (Editable Letterhead / Latter Editable)
 */

export function registerDocumentModules(FinanceApp) {
  const proto = FinanceApp.prototype;

  // ==========================================================================
  // CUSTOM MODAL CONTROLS (SHOW & CLOSE MODAL DIALOGS)
  // ==========================================================================
  proto.showCustomModal = function (html) {
    let container = document.getElementById('fin-modal-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'fin-modal-container';
      document.body.appendChild(container);
    }
    container.innerHTML = html;
    document.body.classList.add('fin-doc-open');
  };

  proto.closeCustomModal = function (id) {
    if (id) {
      this.closeModal(id);
    } else {
      const container = document.getElementById('fin-modal-container');
      if (container) container.innerHTML = '';
      document.body.classList.remove('fin-doc-open');
    }
  };

  // ==========================================================================
  // 1. WORK COMPLETION CERTIFICATES (شهادة اتمام العمل)
  // ==========================================================================
  proto.renderWorkCompletionRows = function (certs, query = '') {
    if (!certs || !certs.length) {
      return `
        <tr>
          <td colspan="9" style="text-align:center; padding:2.5rem 1rem; color:#94a3b8;">
            <div style="font-size:1.8rem; margin-bottom:0.5rem;">📜</div>
            <div style="font-weight:700; font-size:1rem; color:#f8fafc;">No Work Completion Certificates found ${query ? `matching "${query.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"` : ''}</div>
            <div style="font-size:0.8rem; margin-top:0.25rem;">Click "+ Create Completion Certificate" to issue a certified completion handover.</div>
          </td>
        </tr>
      `;
    }

    return certs.map((c, idx) => {
      const isApp = (c.status || '').toLowerCase() === 'approved';
      return `
        <tr>
          <td style="text-align:center; font-weight:700; color:#94a3b8; white-space:nowrap; width:45px;">${idx + 1}</td>
          <td style="white-space:nowrap !important; min-width:185px; font-weight:800; color:#38bdf8;" class="fin-inv-number-cell">
            <div style="cursor:pointer;" onclick="window.finApp.openWorkCompletionPrintModal('${c.id}')" title="View Official Certificate">
              ${c.cert_no || c.reference_no}
            </div>
            ${c.subcontract_agreement ? `<div style="font-size:0.7rem; color:#94a3b8; font-weight:500;">Agr: ${c.subcontract_agreement}</div>` : ''}
          </td>
          <td style="white-space:nowrap !important; color:#cbd5e1; font-size:0.82rem; min-width:125px;">
            ${this.formatDate(c.date || c.created_at)}
            ${c.time ? `<div style="font-size:0.7rem; color:#94a3b8;">${c.time}</div>` : ''}
          </td>
          <td style="white-space:nowrap; min-width:220px; font-weight:700; color:#f8fafc;">
            <div class="fin-customer-cell">${c.client_name || 'Client'}</div>
            ${c.contact_person ? `<div style="font-size:0.72rem; color:#94a3b8; font-weight:500;">Attn: ${c.contact_person}</div>` : ''}
          </td>
          <td style="white-space:nowrap; color:#cbd5e1; font-size:0.82rem; min-width:190px;">
            ${c.main_client || '—'}
          </td>
          <td style="white-space:nowrap; color:#f8fafc; font-weight:600; min-width:190px;">
            ${c.project_name || 'Al Foah Mall Alain'}
          </td>
          <td style="color:#cbd5e1; font-size:0.8rem; min-width:220px;">
            ${c.scope_description || 'Scope of works executed according to PO'}
          </td>
          <td style="text-align:center; white-space:nowrap; min-width:110px;">
            <span class="fin-badge ${isApp ? 'fin-badge-approved' : 'fin-badge-pending'}" style="font-size:0.72rem;">
              ${c.status || 'Approved'}
            </span>
          </td>
          <td style="text-align:right; white-space:nowrap !important; min-width:190px;">
            <button type="button" class="fin-btn-row-action" style="color:#00e5d2; font-weight:700;" onclick="window.finApp.openWorkCompletionPrintModal('${c.id}')" title="Print &amp; View Official Document">Print / View</button>
            <button type="button" class="fin-btn-row-action" style="color:#f59e0b; font-weight:700;" onclick="window.finApp.openWorkCompletionModal('${c.id}')" title="Edit Certificate Details">Edit</button>
            <button type="button" class="fin-btn-row-action" style="color:#ef4444;" onclick="window.finApp.deleteWorkCompletion('${c.id}')" title="Delete Certificate">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  };

  proto.renderWorkCompletionTab = function (root) {
    const certs = this.db?.work_completion_certificates || [];
    this.wccSearchQuery = this.wccSearchQuery || '';
    this.wccFilterStatus = this.wccFilterStatus || 'all';
    this.wccSort = this.wccSort || 'serial-desc';

    const approvedCount = certs.filter(c => (c.status || '').toLowerCase() === 'approved').length;
    const pendingCount = certs.filter(c => (c.status || '').toLowerCase() === 'pending').length;

    const html = `
      <div class="fin-tab-pane active" id="pane-work-completion">
        <div class="fin-panel-card" style="margin-bottom:1.5rem;">
          <div class="fin-panel-header" style="flex-wrap:wrap; gap:1rem; align-items:flex-start;">
            <div>
              <h2 class="fin-panel-title" style="font-size:1.35rem; display:flex; align-items:center; gap:0.6rem;">
                <span>📜</span>
                <span>Work Completion Certificates</span>
                <span class="fin-badge fin-badge-issued" style="font-size:0.75rem;">${certs.length} Total</span>
              </h2>
              <p style="color:#94a3b8; font-size:0.82rem; margin-top:0.25rem;">
                Official client handover sign-offs, subcontract execution certifications, and project completion certificates with dual-authorization stamps.
              </p>
            </div>
            <div class="fin-panel-actions" style="display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap;">
              <button type="button" class="fin-btn-quick" style="border-color:rgba(255,255,255,0.2); color:#cbd5e1;" onclick="window.finApp.refreshDatabaseAndRender()">
                🔄 Sync &amp; Refresh
              </button>
              <button type="button" class="fin-btn-quick" style="border-color:#10b981; color:#10b981;" onclick="window.finApp.openWorkCompletionPrintModal()">
                📜 Sample Certificate
              </button>
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openWorkCompletionModal()">
                + Create Completion Certificate
              </button>
              <button type="button" class="fin-btn-quick" style="border-color:#38bdf8; color:#38bdf8;" onclick="window.finApp.exportWorkCompletionCSV()">
                📥 Export CSV
              </button>
            </div>
          </div>

          <!-- Summary Stats -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-top:1.25rem; margin-bottom:1.25rem;">
            <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:1rem;">
              <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Total Handover Certificates</div>
              <div style="font-size:1.6rem; font-weight:800; color:#f8fafc; margin-top:0.25rem;">${certs.length}</div>
            </div>
            <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:1rem;">
              <div style="font-size:0.75rem; color:#34d399; text-transform:uppercase; font-weight:700;">Approved &amp; Certified</div>
              <div style="font-size:1.6rem; font-weight:800; color:#10b981; margin-top:0.25rem;">${approvedCount}</div>
            </div>
            <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:1rem;">
              <div style="font-size:0.75rem; color:#fbbf24; text-transform:uppercase; font-weight:700;">Under Review / Pending</div>
              <div style="font-size:1.6rem; font-weight:800; color:#f59e0b; margin-top:0.25rem;">${pendingCount}</div>
            </div>
          </div>

          <!-- Search & Filter Controls -->
          <div class="fin-table-filter-bar" style="display:flex; flex-wrap:wrap; gap:0.6rem; align-items:center; margin-bottom:1.15rem;">
            <div style="position:relative; flex:1; min-width:280px; max-width:480px;">
              <input type="text" id="wcc-filter-search" class="fin-filter-input" placeholder="🔍 Search cert #, ref #, client, contractor, project..." value="${this.wccSearchQuery || ''}" style="width:100%; padding-left:2.2rem; padding-right:2rem; box-sizing:border-box;">
              <span style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); color:#64748b; font-size:0.9rem; pointer-events:none;">🔍</span>
              <button type="button" id="wcc-search-clear" style="display:${this.wccSearchQuery ? 'block' : 'none'}; position:absolute; right:0.6rem; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; cursor:pointer; font-size:0.9rem; padding:0;" title="Clear search">✕</button>
            </div>
            <select id="wcc-filter-status" class="fin-select-pill">
              <option value="all" ${this.wccFilterStatus === 'all' ? 'selected' : ''}>All Statuses (${certs.length})</option>
              <option value="approved" ${this.wccFilterStatus === 'approved' ? 'selected' : ''}>Approved &amp; Certified (${approvedCount})</option>
              <option value="pending" ${this.wccFilterStatus === 'pending' ? 'selected' : ''}>Under Review (${pendingCount})</option>
            </select>
            <select id="wcc-filter-sort" class="fin-select-pill" title="Order Certificates">
              <option value="serial-desc" ${this.wccSort === 'serial-desc' ? 'selected' : ''}>🔢 Cert # (High to Low)</option>
              <option value="serial-asc" ${this.wccSort === 'serial-asc' ? 'selected' : ''}>🔢 Cert # (Low to High)</option>
              <option value="date-desc" ${this.wccSort === 'date-desc' ? 'selected' : ''}>📅 Date (Newest First)</option>
              <option value="date-asc" ${this.wccSort === 'date-asc' ? 'selected' : ''}>📅 Date (Oldest First)</option>
              <option value="client-asc" ${this.wccSort === 'client-asc' ? 'selected' : ''}>🔤 Client Name (A to Z)</option>
              <option value="client-desc" ${this.wccSort === 'client-desc' ? 'selected' : ''}>🔤 Client Name (Z to A)</option>
            </select>
            <div id="wcc-count-badge" style="font-size:0.75rem; color:#94a3b8; font-weight:600; margin-left:auto;">
              Showing <span id="wcc-showing-count">${certs.length}</span> of ${certs.length} certificates
            </div>
          </div>

          <!-- Register Table with Responsive Horizontal Scroll -->
          <div class="fin-table-responsive">
            <table class="fin-data-table" id="wcc-data-table">
              <thead>
                <tr>
                  <th style="width:45px; text-align:center; white-space:nowrap;">#</th>
                  <th style="white-space:nowrap; min-width:185px;">CERT / REF #</th>
                  <th style="white-space:nowrap; min-width:125px;">DATE &amp; TIME</th>
                  <th style="white-space:nowrap; min-width:220px;">CLIENT / SUBCONTRACTOR</th>
                  <th style="white-space:nowrap; min-width:190px;">MAIN CLIENT / CONTRACTOR</th>
                  <th style="white-space:nowrap; min-width:190px;">PROJECT &amp; LOCATION</th>
                  <th style="white-space:nowrap; min-width:220px;">SCOPE / MATERIAL SUMMARY</th>
                  <th style="text-align:center; white-space:nowrap; min-width:110px;">STATUS</th>
                  <th style="text-align:right; white-space:nowrap; min-width:190px;">ACTIONS</th>
                </tr>
              </thead>
              <tbody id="wcc-table-tbody">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    root.innerHTML = html;

    const tbody = document.getElementById('wcc-table-tbody');
    const sInput = document.getElementById('wcc-filter-search');
    const sClear = document.getElementById('wcc-search-clear');
    const fStatus = document.getElementById('wcc-filter-status');
    const fSort = document.getElementById('wcc-filter-sort');
    const countBadge = document.getElementById('wcc-showing-count');

    const updateFilter = () => {
      const q = (sInput?.value || '').toLowerCase().trim();
      const status = fStatus?.value || 'all';
      const sort = fSort?.value || 'serial-desc';
      this.wccSearchQuery = q;
      this.wccFilterStatus = status;
      this.wccSort = sort;

      if (sClear) sClear.style.display = q ? 'block' : 'none';

      let list = certs.filter(c => {
        const matchQuery = !q ||
          (c.cert_no || '').toLowerCase().includes(q) ||
          (c.reference_no || '').toLowerCase().includes(q) ||
          (c.client_name || '').toLowerCase().includes(q) ||
          (c.project_name || '').toLowerCase().includes(q) ||
          (c.main_client || '').toLowerCase().includes(q) ||
          (c.po_no || '').toLowerCase().includes(q) ||
          (c.subcontract_agreement || '').toLowerCase().includes(q) ||
          (c.contact_person || '').toLowerCase().includes(q);
        const matchStatus = status === 'all' || (c.status || '').toLowerCase() === status.toLowerCase();
        return matchQuery && matchStatus;
      });

      list.sort((a, b) => {
        if (sort === 'serial-desc') return (b.cert_no || b.reference_no || '').localeCompare(a.cert_no || a.reference_no || '', undefined, { numeric: true });
        if (sort === 'serial-asc') return (a.cert_no || a.reference_no || '').localeCompare(b.cert_no || b.reference_no || '', undefined, { numeric: true });
        if (sort === 'date-desc') return new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0);
        if (sort === 'date-asc') return new Date(a.date || a.created_at || 0) - new Date(b.date || b.created_at || 0);
        if (sort === 'client-asc') return (a.client_name || '').localeCompare(b.client_name || '');
        if (sort === 'client-desc') return (b.client_name || '').localeCompare(a.client_name || '');
        return 0;
      });

      if (tbody) tbody.innerHTML = this.renderWorkCompletionRows(list, q);
      if (countBadge) countBadge.textContent = list.length;
    };

    if (sInput) {
      sInput.oninput = () => updateFilter();
    }
    if (sClear) {
      sClear.onclick = () => {
        if (sInput) {
          sInput.value = '';
          updateFilter();
          sInput.focus();
        }
      };
    }
    if (fStatus) fStatus.onchange = () => updateFilter();
    if (fSort) fSort.onchange = () => updateFilter();

    updateFilter();
  };

  // ==========================================================================
  // 2. MATERIAL DELIVERY NOTES (إذن تسليم مواد)
  // ==========================================================================
  proto.renderDeliveryNoteRows = function (notes, query = '') {
    if (!notes || !notes.length) {
      return `
        <tr>
          <td colspan="9" style="text-align:center; padding:2.5rem 1rem; color:#94a3b8;">
            <div style="font-size:1.8rem; margin-bottom:0.5rem;">🚚</div>
            <div style="font-weight:700; font-size:1rem; color:#f8fafc;">No Delivery Notes recorded ${query ? `matching "${query.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"` : ''}</div>
            <div style="font-size:0.8rem; margin-top:0.25rem;">Click "+ Create Delivery Note" to issue a material dispatch slip.</div>
          </td>
        </tr>
      `;
    }

    return notes.map((n, idx) => {
      const isDel = (n.status || '').toLowerCase() === 'delivered';
      const itemsCount = (n.items || []).length;
      return `
        <tr>
          <td style="text-align:center; font-weight:700; color:#94a3b8; white-space:nowrap; width:45px;">${idx + 1}</td>
          <td style="white-space:nowrap !important; min-width:160px; font-weight:800; color:#38bdf8;" class="fin-inv-number-cell">
            <div style="cursor:pointer;" onclick="window.finApp.openDeliveryNotePrintModal('${n.id}')" title="View Delivery Note">
              ${n.dn_no}
            </div>
            ${n.po_reference ? `<div style="font-size:0.7rem; color:#94a3b8; font-weight:500;">PO: ${n.po_reference}</div>` : ''}
          </td>
          <td style="white-space:nowrap !important; color:#cbd5e1; font-size:0.82rem; min-width:125px;">
            ${this.formatDate(n.date || n.created_at)}
            ${n.time ? `<div style="font-size:0.7rem; color:#94a3b8;">${n.time}</div>` : ''}
          </td>
          <td style="white-space:nowrap; min-width:220px; font-weight:700; color:#f8fafc;">
            <div class="fin-customer-cell">${n.client_name || 'Client'}</div>
            ${n.receiver_name ? `<div style="font-size:0.72rem; color:#94a3b8; font-weight:500;">Recv: ${n.receiver_name}</div>` : ''}
          </td>
          <td style="white-space:nowrap; min-width:200px; color:#cbd5e1; font-size:0.82rem;">
            <div style="font-weight:600; color:#f8fafc;">${n.project_name || 'Project Site'}</div>
            <div style="font-size:0.72rem; color:#94a3b8;">${n.site_location || 'Site Gate'}</div>
          </td>
          <td style="white-space:nowrap; text-align:center; font-weight:700; color:#38bdf8; min-width:120px;">
            ${itemsCount} Line Item${itemsCount === 1 ? '' : 's'}
          </td>
          <td style="white-space:nowrap; color:#cbd5e1; font-size:0.8rem; min-width:180px;">
            <div style="font-weight:600; color:#f8fafc;">${n.vehicle_no || 'AUH-49210'}</div>
            <div style="font-size:0.72rem; color:#94a3b8;">${n.driver_name || 'Driver'} ${n.driver_contact ? `(${n.driver_contact})` : ''}</div>
          </td>
          <td style="text-align:center; white-space:nowrap; min-width:110px;">
            <span class="fin-badge ${isDel ? 'fin-badge-approved' : 'fin-badge-pending'}" style="font-size:0.72rem;">
              ${n.status || 'Delivered'}
            </span>
          </td>
          <td style="text-align:right; white-space:nowrap !important; min-width:190px;">
            <button type="button" class="fin-btn-row-action" style="color:#00e5d2; font-weight:700;" onclick="window.finApp.openDeliveryNotePrintModal('${n.id}')" title="Print &amp; View Delivery Note">Print / View</button>
            <button type="button" class="fin-btn-row-action" style="color:#f59e0b; font-weight:700;" onclick="window.finApp.openDeliveryNoteModal('${n.id}')" title="Edit Delivery Note">Edit</button>
            <button type="button" class="fin-btn-row-action" style="color:#ef4444;" onclick="window.finApp.deleteDeliveryNote('${n.id}')" title="Delete Delivery Note">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  };

  proto.renderDeliveryNotesTab = function (root) {
    const notes = this.db?.delivery_notes || [];
    this.dnSearchQuery = this.dnSearchQuery || '';
    this.dnFilterStatus = this.dnFilterStatus || 'all';
    this.dnSort = this.dnSort || 'serial-desc';

    const deliveredCount = notes.filter(n => (n.status || '').toLowerCase() === 'delivered').length;
    const transitCount = notes.filter(n => (n.status || '').toLowerCase() === 'in transit').length;

    const html = `
      <div class="fin-tab-pane active" id="pane-delivery-notes">
        <div class="fin-panel-card" style="margin-bottom:1.5rem;">
          <div class="fin-panel-header" style="flex-wrap:wrap; gap:1rem; align-items:flex-start;">
            <div>
              <h2 class="fin-panel-title" style="font-size:1.35rem; display:flex; align-items:center; gap:0.6rem;">
                <span>🚚</span>
                <span>Material Delivery Notes</span>
                <span class="fin-badge fin-badge-issued" style="font-size:0.75rem;">${notes.length} Total</span>
              </h2>
              <p style="color:#94a3b8; font-size:0.82rem; margin-top:0.25rem;">
                Dispatch receipts, site material delivery tracking, and storekeeper receipt acknowledgements with dual-signatory verification.
              </p>
            </div>
            <div class="fin-panel-actions" style="display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap;">
              <button type="button" class="fin-btn-quick" style="border-color:rgba(255,255,255,0.2); color:#cbd5e1;" onclick="window.finApp.refreshDatabaseAndRender()">
                🔄 Sync &amp; Refresh
              </button>
              <button type="button" class="fin-btn-quick" style="border-color:#10b981; color:#10b981;" onclick="window.finApp.openDeliveryNotePrintModal()">
                🚚 Sample Delivery Note
              </button>
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openDeliveryNoteModal()">
                + Create Delivery Note
              </button>
              <button type="button" class="fin-btn-quick" style="border-color:#38bdf8; color:#38bdf8;" onclick="window.finApp.exportDeliveryNotesCSV()">
                📥 Export CSV
              </button>
            </div>
          </div>

          <!-- Summary Stats -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-top:1.25rem; margin-bottom:1.25rem;">
            <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:1rem;">
              <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Total Dispatches</div>
              <div style="font-size:1.6rem; font-weight:800; color:#f8fafc; margin-top:0.25rem;">${notes.length}</div>
            </div>
            <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:1rem;">
              <div style="font-size:0.75rem; color:#34d399; text-transform:uppercase; font-weight:700;">Delivered &amp; Stamped</div>
              <div style="font-size:1.6rem; font-weight:800; color:#10b981; margin-top:0.25rem;">${deliveredCount}</div>
            </div>
            <div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.3); border-radius:8px; padding:1rem;">
              <div style="font-size:0.75rem; color:#38bdf8; text-transform:uppercase; font-weight:700;">In Transit / Dispatched</div>
              <div style="font-size:1.6rem; font-weight:800; color:#38bdf8; margin-top:0.25rem;">${transitCount}</div>
            </div>
          </div>

          <!-- Search & Filter Controls -->
          <div class="fin-table-filter-bar" style="display:flex; flex-wrap:wrap; gap:0.6rem; align-items:center; margin-bottom:1.15rem;">
            <div style="position:relative; flex:1; min-width:280px; max-width:480px;">
              <input type="text" id="dn-filter-search" class="fin-filter-input" placeholder="🔍 Search DN #, client, project, vehicle, driver..." value="${this.dnSearchQuery || ''}" style="width:100%; padding-left:2.2rem; padding-right:2rem; box-sizing:border-box;">
              <span style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); color:#64748b; font-size:0.9rem; pointer-events:none;">🔍</span>
              <button type="button" id="dn-search-clear" style="display:${this.dnSearchQuery ? 'block' : 'none'}; position:absolute; right:0.6rem; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; cursor:pointer; font-size:0.9rem; padding:0;" title="Clear search">✕</button>
            </div>
            <select id="dn-filter-status" class="fin-select-pill">
              <option value="all" ${this.dnFilterStatus === 'all' ? 'selected' : ''}>All Statuses (${notes.length})</option>
              <option value="delivered" ${this.dnFilterStatus === 'delivered' ? 'selected' : ''}>Delivered (${deliveredCount})</option>
              <option value="in transit" ${this.dnFilterStatus === 'in transit' ? 'selected' : ''}>In Transit (${transitCount})</option>
            </select>
            <select id="dn-filter-sort" class="fin-select-pill" title="Order Delivery Notes">
              <option value="serial-desc" ${this.dnSort === 'serial-desc' ? 'selected' : ''}>🔢 DN # (High to Low)</option>
              <option value="serial-asc" ${this.dnSort === 'serial-asc' ? 'selected' : ''}>🔢 DN # (Low to High)</option>
              <option value="date-desc" ${this.dnSort === 'date-desc' ? 'selected' : ''}>📅 Date (Newest First)</option>
              <option value="date-asc" ${this.dnSort === 'date-asc' ? 'selected' : ''}>📅 Date (Oldest First)</option>
              <option value="client-asc" ${this.dnSort === 'client-asc' ? 'selected' : ''}>🔤 Consignee (A to Z)</option>
              <option value="client-desc" ${this.dnSort === 'client-desc' ? 'selected' : ''}>🔤 Consignee (Z to A)</option>
            </select>
            <div id="dn-count-badge" style="font-size:0.75rem; color:#94a3b8; font-weight:600; margin-left:auto;">
              Showing <span id="dn-showing-count">${notes.length}</span> of ${notes.length} delivery notes
            </div>
          </div>

          <!-- Register Table with Responsive Horizontal Scroll -->
          <div class="fin-table-responsive">
            <table class="fin-data-table" id="dn-data-table">
              <thead>
                <tr>
                  <th style="width:45px; text-align:center; white-space:nowrap;">#</th>
                  <th style="white-space:nowrap; min-width:160px;">DN NUMBER</th>
                  <th style="white-space:nowrap; min-width:125px;">DISPATCH DATE</th>
                  <th style="white-space:nowrap; min-width:220px;">CONSIGNEE / CLIENT</th>
                  <th style="white-space:nowrap; min-width:200px;">DESTINATION PROJECT SITE</th>
                  <th style="text-align:center; white-space:nowrap; min-width:120px;">ITEMS (QTY)</th>
                  <th style="white-space:nowrap; min-width:180px;">VEHICLE &amp; DRIVER</th>
                  <th style="text-align:center; white-space:nowrap; min-width:110px;">STATUS</th>
                  <th style="text-align:right; white-space:nowrap; min-width:190px;">ACTIONS</th>
                </tr>
              </thead>
              <tbody id="dn-table-tbody">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    root.innerHTML = html;

    const tbody = document.getElementById('dn-table-tbody');
    const sInput = document.getElementById('dn-filter-search');
    const sClear = document.getElementById('dn-search-clear');
    const fStatus = document.getElementById('dn-filter-status');
    const fSort = document.getElementById('dn-filter-sort');
    const countBadge = document.getElementById('dn-showing-count');

    const updateFilter = () => {
      const q = (sInput?.value || '').toLowerCase().trim();
      const status = fStatus?.value || 'all';
      const sort = fSort?.value || 'serial-desc';
      this.dnSearchQuery = q;
      this.dnFilterStatus = status;
      this.dnSort = sort;

      if (sClear) sClear.style.display = q ? 'block' : 'none';

      let list = notes.filter(n => {
        const matchQuery = !q ||
          (n.dn_no || '').toLowerCase().includes(q) ||
          (n.client_name || '').toLowerCase().includes(q) ||
          (n.project_name || '').toLowerCase().includes(q) ||
          (n.site_location || '').toLowerCase().includes(q) ||
          (n.vehicle_no || '').toLowerCase().includes(q) ||
          (n.driver_name || '').toLowerCase().includes(q) ||
          (n.po_reference || '').toLowerCase().includes(q) ||
          (n.receiver_name || '').toLowerCase().includes(q) ||
          (n.items || []).some(it => (it.description || '').toLowerCase().includes(q));
        const matchStatus = status === 'all' || (n.status || '').toLowerCase() === status.toLowerCase();
        return matchQuery && matchStatus;
      });

      list.sort((a, b) => {
        if (sort === 'serial-desc') return (b.dn_no || '').localeCompare(a.dn_no || '', undefined, { numeric: true });
        if (sort === 'serial-asc') return (a.dn_no || '').localeCompare(b.dn_no || '', undefined, { numeric: true });
        if (sort === 'date-desc') return new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0);
        if (sort === 'date-asc') return new Date(a.date || a.created_at || 0) - new Date(b.date || b.created_at || 0);
        if (sort === 'client-asc') return (a.client_name || '').localeCompare(b.client_name || '');
        if (sort === 'client-desc') return (b.client_name || '').localeCompare(a.client_name || '');
        return 0;
      });

      if (tbody) tbody.innerHTML = this.renderDeliveryNoteRows(list, q);
      if (countBadge) countBadge.textContent = list.length;
    };

    if (sInput) {
      sInput.oninput = () => updateFilter();
    }
    if (sClear) {
      sClear.onclick = () => {
        if (sInput) {
          sInput.value = '';
          updateFilter();
          sInput.focus();
        }
      };
    }
    if (fStatus) fStatus.onchange = () => updateFilter();
    if (fSort) fSort.onchange = () => updateFilter();

    updateFilter();
  };

  // ==========================================================================
  // 3. SUBCONTRACTOR UNDERTAKING LETTERS (خطاب تعهد مقاول من الباطن)
  // ==========================================================================
  proto.renderUndertakingLetterRows = function (letters, query = '') {
    if (!letters || !letters.length) {
      return `
        <tr>
          <td colspan="9" style="text-align:center; padding:2.5rem 1rem; color:#94a3b8;">
            <div style="font-size:1.8rem; margin-bottom:0.5rem;">🛡️</div>
            <div style="font-weight:700; font-size:1rem; color:#f8fafc;">No Undertaking Letters found ${query ? `matching "${query.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"` : ''}</div>
            <div style="font-size:0.8rem; margin-top:0.25rem;">Click "+ Create Undertaking Letter" to draft a legal safety undertaking letter.</div>
          </td>
        </tr>
      `;
    }

    return letters.map((l, idx) => {
      const empCount = (l.employees || []).length;
      return `
        <tr>
          <td style="text-align:center; font-weight:700; color:#94a3b8; white-space:nowrap; width:45px;">${idx + 1}</td>
          <td style="white-space:nowrap !important; min-width:180px; font-weight:800; color:#38bdf8;" class="fin-inv-number-cell">
            <div style="cursor:pointer;" onclick="window.finApp.openUndertakingLetterPrintModal('${l.id}')" title="View 2-Page Undertaking Document">
              ${l.ref_no}
            </div>
          </td>
          <td style="white-space:nowrap !important; color:#cbd5e1; font-size:0.82rem; min-width:110px;">
            ${this.formatDate(l.date || l.created_at)}
          </td>
          <td style="white-space:nowrap; min-width:220px; font-weight:700; color:#f8fafc;">
            <div class="fin-customer-cell">${l.client_name || l.attention_company || 'Client'}</div>
            ${l.attention ? `<div style="font-size:0.72rem; color:#94a3b8; font-weight:500;">Attn: ${l.attention}</div>` : ''}
          </td>
          <td style="white-space:nowrap; color:#f8fafc; font-weight:600; font-size:0.82rem; min-width:200px;">
            ${l.project_name || 'Project Site'}
          </td>
          <td style="white-space:nowrap; color:#cbd5e1; font-size:0.82rem; min-width:180px;">
            <span style="background:rgba(56,189,248,0.12); color:#38bdf8; padding:2px 8px; border-radius:4px; font-weight:600;">
              ${l.activity_type || 'Interiors Work'}
            </span>
          </td>
          <td style="text-align:center; white-space:nowrap; font-weight:800; color:#10b981; min-width:120px;">
            ${empCount} Personnel
          </td>
          <td style="white-space:nowrap; color:#cbd5e1; font-size:0.82rem; min-width:180px;">
            <div style="font-weight:700; color:#f8fafc;">${l.responsible_person || 'Eng. Bakhteyar Alam'}</div>
            <div style="font-size:0.7rem; color:#94a3b8;">${l.designation || 'Construction Manager'}</div>
          </td>
          <td style="text-align:right; white-space:nowrap !important; min-width:190px;">
            <button type="button" class="fin-btn-row-action" style="color:#00e5d2; font-weight:700;" onclick="window.finApp.openUndertakingLetterPrintModal('${l.id}')" title="Print &amp; View Official 2-Page Undertaking Letter">Print / View</button>
            <button type="button" class="fin-btn-row-action" style="color:#f59e0b; font-weight:700;" onclick="window.finApp.openUndertakingLetterModal('${l.id}')" title="Edit Letter &amp; Employee List">Edit</button>
            <button type="button" class="fin-btn-row-action" style="color:#ef4444;" onclick="window.finApp.deleteUndertakingLetter('${l.id}')" title="Delete Undertaking Letter">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  };

  proto.renderUndertakingLettersTab = function (root) {
    const letters = this.db?.undertaking_letters || [];
    this.ultSearchQuery = this.ultSearchQuery || '';
    this.ultFilterStatus = this.ultFilterStatus || 'all';
    this.ultSort = this.ultSort || 'serial-desc';

    const totalWorkers = letters.reduce((sum, l) => sum + ((l.employees || []).length), 0);

    const html = `
      <div class="fin-tab-pane active" id="pane-undertaking-letters">
        <div class="fin-panel-card" style="margin-bottom:1.5rem;">
          <div class="fin-panel-header" style="flex-wrap:wrap; gap:1rem; align-items:flex-start;">
            <div>
              <h2 class="fin-panel-title" style="font-size:1.35rem; display:flex; align-items:center; gap:0.6rem;">
                <span>🛡️</span>
                <span>Subcontractor Undertaking Letters</span>
                <span class="fin-badge fin-badge-issued" style="font-size:0.75rem;">${letters.length} Total</span>
              </h2>
              <p style="color:#94a3b8; font-size:0.82rem; margin-top:0.25rem;">
                Official DM/Trakhees statutory HSE undertakings, workforce deputations, and safety indemnity letters under UAE Federal Decree-Law No. 33 of 2021.
              </p>
            </div>
            <div class="fin-panel-actions" style="display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap;">
              <button type="button" class="fin-btn-quick" style="border-color:rgba(255,255,255,0.2); color:#cbd5e1;" onclick="window.finApp.refreshDatabaseAndRender()">
                🔄 Sync &amp; Refresh
              </button>
              <button type="button" class="fin-btn-quick" style="border-color:#10b981; color:#10b981;" onclick="window.finApp.openUndertakingLetterPrintModal()">
                🛡️ Sample Undertaking
              </button>
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openUndertakingLetterModal()">
                + Create Undertaking Letter
              </button>
              <button type="button" class="fin-btn-quick" style="border-color:#38bdf8; color:#38bdf8;" onclick="window.finApp.exportUndertakingLettersCSV()">
                📥 Export CSV
              </button>
            </div>
          </div>

          <!-- Summary Stats -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-top:1.25rem; margin-bottom:1.25rem;">
            <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:1rem;">
              <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Active Undertakings</div>
              <div style="font-size:1.6rem; font-weight:800; color:#f8fafc; margin-top:0.25rem;">${letters.length}</div>
            </div>
            <div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.3); border-radius:8px; padding:1rem;">
              <div style="font-size:0.75rem; color:#38bdf8; text-transform:uppercase; font-weight:700;">Total Deputed Personnel</div>
              <div style="font-size:1.6rem; font-weight:800; color:#38bdf8; margin-top:0.25rem;">${totalWorkers} Workers</div>
            </div>
            <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:1rem;">
              <div style="font-size:0.75rem; color:#34d399; text-transform:uppercase; font-weight:700;">HSE &amp; Labor Law Compliance</div>
              <div style="font-size:1.6rem; font-weight:800; color:#10b981; margin-top:0.25rem;">100% Certified</div>
            </div>
          </div>

          <!-- Search & Filter Controls -->
          <div class="fin-table-filter-bar" style="display:flex; flex-wrap:gap:0.6rem; align-items:center; margin-bottom:1.15rem;">
            <div style="position:relative; flex:1; min-width:280px; max-width:480px;">
              <input type="text" id="ult-filter-search" class="fin-filter-input" placeholder="🔍 Search ref #, client, project, worker name, Emirates ID..." value="${this.ultSearchQuery || ''}" style="width:100%; padding-left:2.2rem; padding-right:2rem; box-sizing:border-box;">
              <span style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); color:#64748b; font-size:0.9rem; pointer-events:none;">🔍</span>
              <button type="button" id="ult-search-clear" style="display:${this.ultSearchQuery ? 'block' : 'none'}; position:absolute; right:0.6rem; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; cursor:pointer; font-size:0.9rem; padding:0;" title="Clear search">✕</button>
            </div>
            <select id="ult-filter-status" class="fin-select-pill">
              <option value="all" ${this.ultFilterStatus === 'all' ? 'selected' : ''}>All Undertakings (${letters.length})</option>
              <option value="active" ${this.ultFilterStatus === 'active' ? 'selected' : ''}>Active / Compliant</option>
            </select>
            <select id="ult-filter-sort" class="fin-select-pill" title="Order Undertakings">
              <option value="serial-desc" ${this.ultSort === 'serial-desc' ? 'selected' : ''}>🔢 Ref # (High to Low)</option>
              <option value="serial-asc" ${this.ultSort === 'serial-asc' ? 'selected' : ''}>🔢 Ref # (Low to High)</option>
              <option value="date-desc" ${this.ultSort === 'date-desc' ? 'selected' : ''}>📅 Date (Newest First)</option>
              <option value="date-asc" ${this.ultSort === 'date-asc' ? 'selected' : ''}>📅 Date (Oldest First)</option>
              <option value="client-asc" ${this.ultSort === 'client-asc' ? 'selected' : ''}>🔤 Contractor (A to Z)</option>
              <option value="client-desc" ${this.ultSort === 'client-desc' ? 'selected' : ''}>🔤 Contractor (Z to A)</option>
            </select>
            <div id="ult-count-badge" style="font-size:0.75rem; color:#94a3b8; font-weight:600; margin-left:auto;">
              Showing <span id="ult-showing-count">${letters.length}</span> of ${letters.length} letters
            </div>
          </div>

          <!-- Register Table with Responsive Horizontal Scroll -->
          <div class="fin-table-responsive">
            <table class="fin-data-table" id="ult-data-table">
              <thead>
                <tr>
                  <th style="width:45px; text-align:center; white-space:nowrap;">#</th>
                  <th style="white-space:nowrap; min-width:180px;">REF NUMBER</th>
                  <th style="white-space:nowrap; min-width:110px;">DATE</th>
                  <th style="white-space:nowrap; min-width:220px;">CONTRACTOR / CLIENT</th>
                  <th style="white-space:nowrap; min-width:200px;">PROJECT / SITE</th>
                  <th style="white-space:nowrap; min-width:180px;">WORK ACTIVITY</th>
                  <th style="text-align:center; white-space:nowrap; min-width:120px;">WORKERS DEPUTED</th>
                  <th style="white-space:nowrap; min-width:180px;">RESPONSIBLE PERSON</th>
                  <th style="text-align:right; white-space:nowrap; min-width:190px;">ACTIONS</th>
                </tr>
              </thead>
              <tbody id="ult-table-tbody">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    root.innerHTML = html;

    const tbody = document.getElementById('ult-table-tbody');
    const sInput = document.getElementById('ult-filter-search');
    const sClear = document.getElementById('ult-search-clear');
    const fStatus = document.getElementById('ult-filter-status');
    const fSort = document.getElementById('ult-filter-sort');
    const countBadge = document.getElementById('ult-showing-count');

    const updateFilter = () => {
      const q = (sInput?.value || '').toLowerCase().trim();
      const status = fStatus?.value || 'all';
      const sort = fSort?.value || 'serial-desc';
      this.ultSearchQuery = q;
      this.ultFilterStatus = status;
      this.ultSort = sort;

      if (sClear) sClear.style.display = q ? 'block' : 'none';

      let list = letters.filter(l => {
        const matchQuery = !q ||
          (l.ref_no || '').toLowerCase().includes(q) ||
          (l.client_name || '').toLowerCase().includes(q) ||
          (l.attention_company || '').toLowerCase().includes(q) ||
          (l.attention || '').toLowerCase().includes(q) ||
          (l.project_name || '').toLowerCase().includes(q) ||
          (l.subject || '').toLowerCase().includes(q) ||
          (l.activity_type || '').toLowerCase().includes(q) ||
          (l.responsible_person || '').toLowerCase().includes(q) ||
          (l.employees || []).some(emp => (emp.name || '').toLowerCase().includes(q) || (emp.emirates_id || '').toLowerCase().includes(q));
        const matchStatus = status === 'all' || (l.status || '').toLowerCase() === status.toLowerCase();
        return matchQuery && matchStatus;
      });

      list.sort((a, b) => {
        if (sort === 'serial-desc') return (b.ref_no || '').localeCompare(a.ref_no || '', undefined, { numeric: true });
        if (sort === 'serial-asc') return (a.ref_no || '').localeCompare(b.ref_no || '', undefined, { numeric: true });
        if (sort === 'date-desc') return new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0);
        if (sort === 'date-asc') return new Date(a.date || a.created_at || 0) - new Date(b.date || b.created_at || 0);
        if (sort === 'client-asc') return (a.client_name || a.attention_company || '').localeCompare(b.client_name || b.attention_company || '');
        if (sort === 'client-desc') return (b.client_name || b.attention_company || '').localeCompare(a.client_name || a.attention_company || '');
        return 0;
      });

      if (tbody) tbody.innerHTML = this.renderUndertakingLetterRows(list, q);
      if (countBadge) countBadge.textContent = list.length;
    };

    if (sInput) {
      sInput.oninput = () => updateFilter();
    }
    if (sClear) {
      sClear.onclick = () => {
        if (sInput) {
          sInput.value = '';
          updateFilter();
          sInput.focus();
        }
      };
    }
    if (fStatus) fStatus.onchange = () => updateFilter();
    if (fSort) fSort.onchange = () => updateFilter();

    updateFilter();
  };

  // ==========================================================================
  // 4. CORPORATE LETTERS TAB (LATTER EDITABLE / OFFICIAL CORRESPONDENCE)
  // ==========================================================================
  proto.renderCustomLetterRows = function (letters, query = '') {
    if (!letters || !letters.length) {
      return `
        <tr>
          <td colspan="9" style="text-align:center; padding:2.5rem 1rem; color:#94a3b8;">
            <div style="font-size:1.8rem; margin-bottom:0.5rem;">✉️</div>
            <div style="font-weight:700; font-size:1rem; color:#f8fafc;">No Official Letters drafted ${query ? `matching "${query.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"` : ''}</div>
            <div style="font-size:0.8rem; margin-top:0.25rem;">Click "+ Draft New Letter" to compose an official letterhead document.</div>
          </td>
        </tr>
      `;
    }

    return letters.map((l, idx) => {
      const isIssued = (l.status || '').toLowerCase() === 'issued';
      return `
        <tr>
          <td style="text-align:center; font-weight:700; color:#94a3b8; white-space:nowrap; width:45px;">${idx + 1}</td>
          <td style="white-space:nowrap !important; min-width:180px; font-weight:800; color:#38bdf8;" class="fin-inv-number-cell">
            <div style="cursor:pointer;" onclick="window.finApp.openCustomLetterPrintModal('${l.id}')" title="View Letter Document">
              ${l.ref_no}
            </div>
          </td>
          <td style="white-space:nowrap !important; color:#cbd5e1; font-size:0.82rem; min-width:110px;">
            ${this.formatDate(l.date || l.created_at)}
          </td>
          <td style="white-space:nowrap; min-width:220px; font-weight:700; color:#f8fafc;">
            <div class="fin-customer-cell">${l.recipient_company || l.recipient_name || 'Recipient'}</div>
            ${l.attention ? `<div style="font-size:0.72rem; color:#94a3b8; font-weight:500;">Attn: ${l.attention}</div>` : ''}
          </td>
          <td style="white-space:nowrap; color:#cbd5e1; font-size:0.82rem; min-width:200px;">
            ${l.project_name || 'General Corporate'}
          </td>
          <td style="color:#f8fafc; font-weight:600; font-size:0.82rem; min-width:240px;">
            ${l.subject || 'Official Communication'}
          </td>
          <td style="white-space:nowrap; color:#cbd5e1; font-size:0.82rem; min-width:170px;">
            <div style="font-weight:700; color:#f8fafc;">${l.signatory_name || 'Authorized Signatory'}</div>
            <div style="font-size:0.7rem; color:#94a3b8;">${l.designation || 'Construction Manager'}</div>
          </td>
          <td style="text-align:center; white-space:nowrap; min-width:100px;">
            <span class="fin-badge ${isIssued ? 'fin-badge-approved' : 'fin-badge-pending'}" style="font-size:0.72rem;">
              ${l.status || 'Issued'}
            </span>
          </td>
          <td style="text-align:right; white-space:nowrap !important; min-width:190px;">
            <button type="button" class="fin-btn-row-action" style="color:#00e5d2; font-weight:700;" onclick="window.finApp.openCustomLetterPrintModal('${l.id}')" title="Print &amp; View Letter">Print / View</button>
            <button type="button" class="fin-btn-row-action" style="color:#f59e0b; font-weight:700;" onclick="window.finApp.openCustomLetterModal('${l.id}')" title="Edit Letter Content">Edit</button>
            <button type="button" class="fin-btn-row-action" style="color:#ef4444;" onclick="window.finApp.deleteCustomLetter('${l.id}')" title="Delete Letter">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  };

  proto.renderLettersTab = function (root) {
    const letters = this.db?.custom_letters || [];
    this.ltrSearchQuery = this.ltrSearchQuery || '';
    this.ltrFilterStatus = this.ltrFilterStatus || 'all';
    this.ltrSort = this.ltrSort || 'serial-desc';

    const html = `
      <div class="fin-tab-pane active" id="pane-letters">
        <div class="fin-panel-card" style="margin-bottom:1.5rem;">
          <div class="fin-panel-header" style="flex-wrap:wrap; gap:1rem; align-items:flex-start;">
            <div>
              <h2 class="fin-panel-title" style="font-size:1.35rem; display:flex; align-items:center; gap:0.6rem;">
                <span>✉️</span>
                <span>Corporate Letters &amp; Correspondence</span>
                <span class="fin-badge fin-badge-issued" style="font-size:0.75rem;">${letters.length} Total</span>
              </h2>
              <p style="color:#94a3b8; font-size:0.82rem; margin-top:0.25rem;">
                Fully editable official corporate correspondence, commercial notices, mobilization letters, and authority submissions on Rayan letterhead.
              </p>
            </div>
            <div class="fin-panel-actions" style="display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap;">
              <button type="button" class="fin-btn-quick" style="border-color:rgba(255,255,255,0.2); color:#cbd5e1;" onclick="window.finApp.refreshDatabaseAndRender()">
                🔄 Sync &amp; Refresh
              </button>
              <button type="button" class="fin-btn-quick" style="border-color:#10b981; color:#10b981;" onclick="window.finApp.openCustomLetterPrintModal()">
                ✉️ Sample Letter
              </button>
              <button type="button" class="fin-btn-quick primary" onclick="window.finApp.openCustomLetterModal()">
                + Draft New Letter
              </button>
              <button type="button" class="fin-btn-quick" style="border-color:#38bdf8; color:#38bdf8;" onclick="window.finApp.exportLettersCSV()">
                📥 Export CSV
              </button>
            </div>
          </div>

          <!-- Summary Stats -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-top:1.25rem; margin-bottom:1.25rem;">
            <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:1rem;">
              <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Total Letters Drafted</div>
              <div style="font-size:1.6rem; font-weight:800; color:#f8fafc; margin-top:0.25rem;">${letters.length}</div>
            </div>
            <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:1rem;">
              <div style="font-size:0.75rem; color:#34d399; text-transform:uppercase; font-weight:700;">Official Letterhead Format</div>
              <div style="font-size:1.6rem; font-weight:800; color:#10b981; margin-top:0.25rem;">100% Ready</div>
            </div>
            <div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.3); border-radius:8px; padding:1rem;">
              <div style="font-size:0.75rem; color:#38bdf8; text-transform:uppercase; font-weight:700;">Dual Auth &amp; Official Seal</div>
              <div style="font-size:1.6rem; font-weight:800; color:#38bdf8; margin-top:0.25rem;">Included</div>
            </div>
          </div>

          <!-- Search & Filter Controls -->
          <div class="fin-table-filter-bar" style="display:flex; flex-wrap:wrap; gap:0.6rem; align-items:center; margin-bottom:1.15rem;">
            <div style="position:relative; flex:1; min-width:280px; max-width:480px;">
              <input type="text" id="ltr-filter-search" class="fin-filter-input" placeholder="🔍 Search letters by ref #, recipient, subject, project..." value="${this.ltrSearchQuery || ''}" style="width:100%; padding-left:2.2rem; padding-right:2rem; box-sizing:border-box;">
              <span style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); color:#64748b; font-size:0.9rem; pointer-events:none;">🔍</span>
              <button type="button" id="ltr-search-clear" style="display:${this.ltrSearchQuery ? 'block' : 'none'}; position:absolute; right:0.6rem; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; cursor:pointer; font-size:0.9rem; padding:0;" title="Clear search">✕</button>
            </div>
            <select id="ltr-filter-sort" class="fin-select-pill" title="Order Letters">
              <option value="serial-desc" ${this.ltrSort === 'serial-desc' ? 'selected' : ''}>🔢 Ref # (High to Low)</option>
              <option value="serial-asc" ${this.ltrSort === 'serial-asc' ? 'selected' : ''}>🔢 Ref # (Low to High)</option>
              <option value="date-desc" ${this.ltrSort === 'date-desc' ? 'selected' : ''}>📅 Date (Newest First)</option>
              <option value="date-asc" ${this.ltrSort === 'date-asc' ? 'selected' : ''}>📅 Date (Oldest First)</option>
              <option value="client-asc" ${this.ltrSort === 'client-asc' ? 'selected' : ''}>🔤 Recipient (A to Z)</option>
              <option value="client-desc" ${this.ltrSort === 'client-desc' ? 'selected' : ''}>🔤 Recipient (Z to A)</option>
            </select>
            <div id="ltr-count-badge" style="font-size:0.75rem; color:#94a3b8; font-weight:600; margin-left:auto;">
              Showing <span id="ltr-showing-count">${letters.length}</span> of ${letters.length} letters
            </div>
          </div>

          <!-- Register Table with Responsive Horizontal Scroll -->
          <div class="fin-table-responsive">
            <table class="fin-data-table" id="ltr-data-table">
              <thead>
                <tr>
                  <th style="width:45px; text-align:center; white-space:nowrap;">#</th>
                  <th style="white-space:nowrap; min-width:180px;">REF NUMBER</th>
                  <th style="white-space:nowrap; min-width:110px;">DATE</th>
                  <th style="white-space:nowrap; min-width:220px;">RECIPIENT / TO</th>
                  <th style="white-space:nowrap; min-width:200px;">PROJECT REFERENCE</th>
                  <th style="white-space:nowrap; min-width:240px;">SUBJECT LINE</th>
                  <th style="white-space:nowrap; min-width:170px;">SIGNATORY</th>
                  <th style="text-align:center; white-space:nowrap; min-width:100px;">STATUS</th>
                  <th style="text-align:right; white-space:nowrap; min-width:190px;">ACTIONS</th>
                </tr>
              </thead>
              <tbody id="ltr-table-tbody">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    root.innerHTML = html;

    const tbody = document.getElementById('ltr-table-tbody');
    const sInput = document.getElementById('ltr-filter-search');
    const sClear = document.getElementById('ltr-search-clear');
    const fSort = document.getElementById('ltr-filter-sort');
    const countBadge = document.getElementById('ltr-showing-count');

    const updateFilter = () => {
      const q = (sInput?.value || '').toLowerCase().trim();
      const sort = fSort?.value || 'serial-desc';
      this.ltrSearchQuery = q;
      this.ltrSort = sort;

      if (sClear) sClear.style.display = q ? 'block' : 'none';

      let list = letters.filter(l => {
        const matchQuery = !q ||
          (l.ref_no || '').toLowerCase().includes(q) ||
          (l.recipient_company || '').toLowerCase().includes(q) ||
          (l.recipient_name || '').toLowerCase().includes(q) ||
          (l.attention || '').toLowerCase().includes(q) ||
          (l.subject || '').toLowerCase().includes(q) ||
          (l.project_name || '').toLowerCase().includes(q) ||
          (l.signatory_name || '').toLowerCase().includes(q);
        return matchQuery;
      });

      list.sort((a, b) => {
        if (sort === 'serial-desc') return (b.ref_no || '').localeCompare(a.ref_no || '', undefined, { numeric: true });
        if (sort === 'serial-asc') return (a.ref_no || '').localeCompare(b.ref_no || '', undefined, { numeric: true });
        if (sort === 'date-desc') return new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0);
        if (sort === 'date-asc') return new Date(a.date || a.created_at || 0) - new Date(b.date || b.created_at || 0);
        if (sort === 'client-asc') return (a.recipient_company || a.recipient_name || '').localeCompare(b.recipient_company || b.recipient_name || '');
        if (sort === 'client-desc') return (b.recipient_company || b.recipient_name || '').localeCompare(a.recipient_company || a.recipient_name || '');
        return 0;
      });

      if (tbody) tbody.innerHTML = this.renderCustomLetterRows(list, q);
      if (countBadge) countBadge.textContent = list.length;
    };

    if (sInput) {
      sInput.oninput = () => updateFilter();
    }
    if (sClear) {
      sClear.onclick = () => {
        if (sInput) {
          sInput.value = '';
          updateFilter();
          sInput.focus();
        }
      };
    }
    if (fSort) fSort.onchange = () => updateFilter();

    updateFilter();
  };

  // ==========================================================================
  // 5. WORK COMPLETION CERTIFICATE EDIT MODAL
  // ==========================================================================
  proto.openWorkCompletionModal = function (certId = null) {
    const isEdit = Boolean(certId);
    let cert = null;
    if (isEdit) {
      cert = (this.db?.work_completion_certificates || []).find(c => c.id === certId || c.cert_no === certId);
    }
    if (!cert) {
      const nextNum = (this.db?.work_completion_certificates || []).length + 11020;
      cert = {
        id: `wcc-${Date.now()}`,
        cert_no: `REC-JOB COM-${nextNum}`,
        reference_no: `REC-JOB COM-${nextNum}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        subcontract_agreement: 'IB-037-136',
        client_name: 'M/s IRON BEAM BUILDING CONTRACTING L.L.C',
        main_client: 'M/s Emirates Driving Company',
        contact_person: 'Mr. Mohamed Abuelgasim',
        email: 'mohamed.a@ironbeam.ae',
        project_name: 'Al Foah Mall Alain',
        scope_work_ref: 'IB-037-136',
        scope_description: 'Total Screed Work 160 Sqm',
        body_text: `With respect to the subjected agreement We, Rayan Engineering and Contracting LLC-SPC Confirm and Certify that all the works mentioned in the attached scope of work (IB-037-136) Have been Satisfactorily Executed and Completed.\n(Total Screed Work 160 Sqm)\n\nWe wish to take this opportunity to request a work completion certificate.\nIt would also be great if you detailed my accomplishment in this project to make it more powerful and we will be forever grateful for doing this\n\nI accept the above works on behalf of M/s IRON BEAM BUILDING CONTRACTING L.L.C, to be complete and to my satisfaction by Rayan Engineering and Contracting LLC-SPC as specified in the PO.`,
        acceptance_statement: `I accept the above works on behalf of M/s IRON BEAM BUILDING CONTRACTING L.L.C, to be complete and to my satisfaction by Rayan Engineering and Contracting LLC-SPC as specified in the PO.`,
        authorized_signatory_client: 'Mr. Mohamed Abuelgasim',
        authorized_signatory_rayan: 'Eng. Bakhteyar Alam',
        include_stamp: true,
        include_signature: true,
        status: 'Approved'
      };
    }

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-wcc-edit">
        <div class="fin-modal-dialog" style="max-width:920px; max-height:92vh; background:#0d1527; border:1px solid rgba(56,189,248,0.25); box-shadow:0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(0,153,230,0.12); display:flex; flex-direction:column; border-radius:16px; overflow:hidden;">
          <div class="fin-modal-header" style="background:linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.85) 100%); padding:1.25rem 1.75rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(0,153,230,0.3) 100%); border:1px solid rgba(56,189,248,0.35); display:flex; align-items:center; justify-content:center; font-size:1.3rem;">📜</div>
              <div>
                <h3 class="fin-modal-title" style="margin:0; font-size:1.25rem; font-weight:800; color:#f8fafc; letter-spacing:-0.01em;">
                  ${isEdit ? 'Edit Work Completion Certificate' : 'Create Work Completion Certificate'}
                </h3>
                <p style="margin:2px 0 0; font-size:0.78rem; color:#94a3b8;">Client Handover Sign-Off &amp; Subcontract Certification • شهادة اتمام العمل</p>
              </div>
            </div>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-wcc-edit')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); width:32px; height:32px; border-radius:8px; color:#cbd5e1; font-size:1.1rem; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s ease;">&times;</button>
          </div>
          <form id="form-wcc-edit" class="fin-modal-body" style="padding:1.5rem 1.75rem; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:1.25rem;">
            <input type="hidden" id="wcc-id" value="${cert.id}">

            <!-- Card 1: Certificate Reference & Timeline -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>📋</span>
                  <span>Certificate Reference &amp; Execution Timeline</span>
                </div>
              </div>
              <div class="fin-form-grid-3">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Certificate / Job Ref # <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="wcc-cert-no" class="fin-form-input" value="${cert.cert_no || cert.reference_no}" required style="font-weight:700; color:#38bdf8;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Completion Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="wcc-date" class="fin-form-input" value="${cert.date || new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Execution Time</label>
                  <input type="text" id="wcc-time" class="fin-form-input" value="${cert.time || '6:27 PM'}" placeholder="e.g. 6:27 PM">
                </div>
              </div>
            </div>

            <!-- Card 2: Client & Subcontracting Entities -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>🏢</span>
                  <span>Client &amp; Contracting Parties</span>
                </div>
              </div>
              <div class="fin-form-grid-2" style="margin-bottom:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Client / Subcontractor Name <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="wcc-client-name" class="fin-form-input" value="${cert.client_name}" required placeholder="M/s IRON BEAM BUILDING CONTRACTING L.L.C">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Main Contractor / Client</label>
                  <input type="text" id="wcc-main-client" class="fin-form-input" value="${cert.main_client || ''}" placeholder="M/s Emirates Driving Company">
                </div>
              </div>
              <div class="fin-form-grid-3">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Contact Person</label>
                  <input type="text" id="wcc-contact-person" class="fin-form-input" value="${cert.contact_person || ''}" placeholder="Mr. Mohamed Abuelgasim">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Contact Email</label>
                  <input type="email" id="wcc-email" class="fin-form-input" value="${cert.email || ''}" placeholder="mohamed.a@ironbeam.ae">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Sub-contract Agr / PO Ref</label>
                  <input type="text" id="wcc-subcontract-agreement" class="fin-form-input" value="${cert.subcontract_agreement || ''}" placeholder="IB-037-136">
                </div>
              </div>
            </div>

            <!-- Card 3: Project Location & Scope -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>🏗️</span>
                  <span>Project Location &amp; Scope Overview</span>
                </div>
              </div>
              <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Project Name &amp; Site <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="wcc-project-name" class="fin-form-input" value="${cert.project_name}" required placeholder="Al Foah Mall Alain">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Scope Description (Short)</label>
                  <input type="text" id="wcc-scope-desc" class="fin-form-input" value="${cert.scope_description || ''}" placeholder="Total Screed Work 160 Sqm">
                </div>
              </div>
            </div>

            <!-- Card 4: Handover Declarations & Statements -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>📝</span>
                  <span>Handover Declarations &amp; Scope Details</span>
                </div>
              </div>
              <div class="fin-form-group" style="margin-bottom:1.15rem;">
                <label class="fin-form-label">Certificate Body &amp; Handover Declarations <span style="color:#ef4444;">*</span></label>
                <textarea id="wcc-body-text" class="fin-form-textarea" rows="6" style="resize:vertical; font-family:inherit; line-height:1.55;" required>${cert.body_text}</textarea>
              </div>
              <div class="fin-form-group" style="margin-bottom:0;">
                <label class="fin-form-label">Client Acceptance Statement</label>
                <textarea id="wcc-acceptance" class="fin-form-textarea" rows="2" style="resize:vertical; font-family:inherit; line-height:1.45;">${cert.acceptance_statement || ''}</textarea>
              </div>
            </div>

            <!-- Card 5: Dual Signatories & Status -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>✍️</span>
                  <span>Dual Signatories &amp; Certification Status</span>
                </div>
              </div>
              <div class="fin-form-grid-3">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Client Signatory</label>
                  <input type="text" id="wcc-client-sig" class="fin-form-input" value="${cert.authorized_signatory_client || cert.contact_person || ''}" placeholder="Mr. Mohamed Abuelgasim">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Rayan Authorized Signatory</label>
                  <input type="text" id="wcc-rayan-sig" class="fin-form-input" value="${cert.authorized_signatory_rayan || 'Eng. Bakhteyar Alam'}" placeholder="Eng. Bakhteyar Alam">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Approval Status</label>
                  <select id="wcc-status" class="fin-form-select" style="width:100%;">
                    <option value="Approved" ${cert.status === 'Approved' ? 'selected' : ''}>Approved &amp; Certified</option>
                    <option value="Pending" ${cert.status === 'Pending' ? 'selected' : ''}>Pending Review</option>
                    <option value="Draft" ${cert.status === 'Draft' ? 'selected' : ''}>Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Card 6: Dual Authorization Seals -->
            <div class="fin-auth-badge-card">
              <label class="fin-auth-checkbox-label">
                <input type="checkbox" id="wcc-inc-stamp" ${cert.include_stamp !== false ? 'checked' : ''}>
                <span>Include Official Company Stamp (Blue Rayan Round Stamp)</span>
              </label>
              <label class="fin-auth-checkbox-label">
                <input type="checkbox" id="wcc-inc-sig" ${cert.include_signature !== false ? 'checked' : ''}>
                <span>Include Authorized Signatures</span>
              </label>
            </div>

            <div class="fin-modal-footer" style="padding:1.25rem 0 0 0; display:flex; justify-content:flex-end; gap:0.85rem; border-top:1px solid rgba(255,255,255,0.1); background:transparent;">
              <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-wcc-edit')">Cancel</button>
              <button type="submit" class="fin-btn-quick primary">💾 ${isEdit ? 'Save & Update Certificate' : 'Save & Issue Certificate'}</button>
            </div>
          </form>
        </div>
      </div>`;

    this.showCustomModal(modalHtml);

    const form = document.getElementById('form-wcc-edit');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const updated = {
          id: document.getElementById('wcc-id').value,
          cert_no: document.getElementById('wcc-cert-no').value.trim(),
          reference_no: document.getElementById('wcc-cert-no').value.trim(),
          date: document.getElementById('wcc-date').value,
          time: document.getElementById('wcc-time').value.trim(),
          client_name: document.getElementById('wcc-client-name').value.trim(),
          main_client: document.getElementById('wcc-main-client').value.trim(),
          contact_person: document.getElementById('wcc-contact-person').value.trim(),
          email: document.getElementById('wcc-email').value.trim(),
          subcontract_agreement: document.getElementById('wcc-subcontract-agreement').value.trim(),
          po_no: document.getElementById('wcc-subcontract-agreement').value.trim(),
          project_name: document.getElementById('wcc-project-name').value.trim(),
          scope_description: document.getElementById('wcc-scope-desc').value.trim(),
          body_text: document.getElementById('wcc-body-text').value.trim(),
          acceptance_statement: document.getElementById('wcc-acceptance').value.trim(),
          authorized_signatory_client: document.getElementById('wcc-client-sig').value.trim(),
          authorized_signatory_rayan: document.getElementById('wcc-rayan-sig').value.trim(),
          status: document.getElementById('wcc-status').value,
          include_stamp: document.getElementById('wcc-inc-stamp').checked,
          include_signature: document.getElementById('wcc-inc-sig').checked,
          updated_at: new Date().toISOString()
        };

        if (!this.db.work_completion_certificates) {
          this.db.work_completion_certificates = [];
        }

        const idx = this.db.work_completion_certificates.findIndex(c => c.id === updated.id);
        if (idx >= 0) {
          this.db.work_completion_certificates[idx] = { ...this.db.work_completion_certificates[idx], ...updated };
        } else {
          this.db.work_completion_certificates.unshift(updated);
        }

        try {
          localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
        } catch (err) { }

        this.closeModal('modal-wcc-edit');
        this.renderActiveTab();
        this.showNotification(`Work Completion Certificate ${updated.cert_no} saved successfully.`, 'success');

        await this.syncApi('save_work_completion', { certificate: updated });
      };
    }
  };

  // ==========================================================================
  // 6. DELIVERY NOTE EDIT MODAL
  // ==========================================================================
  proto.openDeliveryNoteModal = function (dnId = null) {
    const isEdit = Boolean(dnId);
    let dn = null;
    if (isEdit) {
      dn = (this.db?.delivery_notes || []).find(n => n.id === dnId || n.dn_no === dnId);
    }
    if (!dn) {
      const nextNum = (this.db?.delivery_notes || []).length + 1001;
      dn = {
        id: `dn-${Date.now()}`,
        dn_no: `DN-REC-${nextNum}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        po_reference: 'PODSUB-2026/0810',
        client_name: 'M/S TOP ROCK INTERIORS LLC',
        project_name: 'The New Dubai Police Academy @ Alrowaiyah, Dubai Fit out Work',
        site_location: 'Alrowaiyah, Dubai - Sector 4 Gate 2',
        vehicle_no: 'DXB-54219',
        driver_name: 'Abdul Rashid',
        driver_contact: '+971 55 819 4022',
        dispatch_from: 'Rayan Central Fabrication & Storage Yard - Mussafah M-36',
        receiver_name: 'Site Supervisor Tariq',
        receiver_eid: '784-1988-4459201-1',
        status: 'Delivered',
        notes: 'All materials inspected at dispatch and unloaded in verified sound structural condition.',
        items: [
          { srl: 1, description: 'Gypsum Board 12.5mm Moisture Resistant Standard', unit: 'Sheets', qty_ordered: 250, qty_delivered: 250, remarks: 'Prime Quality' },
          { srl: 2, description: 'Galvanized Steel Studs 70mm x 3.0m Heavy Duty', unit: 'Pcs', qty_ordered: 180, qty_delivered: 180, remarks: 'Verified Gauge' },
          { srl: 3, description: 'Acoustic Insulation Mineral Wool 50mm 48kg/m3', unit: 'Rolls', qty_ordered: 45, qty_delivered: 45, remarks: 'Standard Fire Rated' }
        ],
        dispatched_by: 'Logistics Supervisor Rashid Khan',
        include_stamp: true,
        include_signature: true
      };
    }

    const items = dn.items && dn.items.length ? dn.items : [
      { srl: 1, description: 'Materials / Subcontracting Procurement Items', unit: 'LSUM', qty_ordered: 1, qty_delivered: 1, remarks: 'Good Condition' }
    ];

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-dn-edit">
        <div class="fin-modal-dialog" style="max-width:960px; max-height:92vh; background:#0d1527; border:1px solid rgba(56,189,248,0.25); box-shadow:0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(0,153,230,0.12); display:flex; flex-direction:column; border-radius:16px; overflow:hidden;">
          <div class="fin-modal-header" style="background:linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.85) 100%); padding:1.25rem 1.75rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(0,153,230,0.3) 100%); border:1px solid rgba(56,189,248,0.35); display:flex; align-items:center; justify-content:center; font-size:1.3rem;">🚚</div>
              <div>
                <h3 class="fin-modal-title" style="margin:0; font-size:1.25rem; font-weight:800; color:#f8fafc; letter-spacing:-0.01em;">
                  ${isEdit ? 'Edit Material Delivery Note' : 'Create Material Delivery Note'}
                </h3>
                <p style="margin:2px 0 0; font-size:0.78rem; color:#94a3b8;">Official Material Dispatch Voucher &amp; Storekeeper Receipt • إذن تسليم مواد</p>
              </div>
            </div>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-dn-edit')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); width:32px; height:32px; border-radius:8px; color:#cbd5e1; font-size:1.1rem; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s ease;">&times;</button>
          </div>
          <form id="form-dn-edit" class="fin-modal-body" style="padding:1.5rem 1.75rem; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:1.25rem;">
            <input type="hidden" id="dn-id" value="${dn.id}">

            <!-- Card 1: Dispatch & Reference Info -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>📋</span>
                  <span>Dispatch &amp; Reference Information</span>
                </div>
              </div>
              <div class="fin-form-grid-3">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Delivery Note # <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="dn-number" class="fin-form-input" value="${dn.dn_no}" required style="font-weight:700; color:#38bdf8;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Dispatch Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="dn-date" class="fin-form-input" value="${dn.date}" required>
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">PO / LPO Reference</label>
                  <input type="text" id="dn-po-ref" class="fin-form-input" value="${dn.po_reference || ''}" placeholder="PODSUB-2026/0810">
                </div>
              </div>
            </div>

            <!-- Card 2: Consignee & Project Delivery Site -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>🏢</span>
                  <span>Consignee &amp; Project Site Details</span>
                </div>
              </div>
              <div class="fin-form-grid-2" style="margin-bottom:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Consignee / Client Name <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="dn-client-name" class="fin-form-input" value="${dn.client_name}" required placeholder="M/S TOP ROCK INTERIORS LLC">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Project Name <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="dn-project-name" class="fin-form-input" value="${dn.project_name}" required placeholder="The New Dubai Police Academy">
                </div>
              </div>
              <div class="fin-form-grid-2">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Dispatch Yard / Storage Origin</label>
                  <input type="text" id="dn-dispatch-from" class="fin-form-input" value="${dn.dispatch_from || ''}" placeholder="Rayan Central Storage Yard - Mussafah M-36">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Site Delivery Gate / Location <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="dn-site-location" class="fin-form-input" value="${dn.site_location || ''}" required placeholder="Alrowaiyah, Dubai Gate 2">
                </div>
              </div>
            </div>

            <!-- Card 3: Logistics, Vehicle & Driver Information -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>🚛</span>
                  <span>Logistics, Vehicle &amp; Driver Information</span>
                </div>
              </div>
              <div class="fin-form-grid-3">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Vehicle / Truck Plate #</label>
                  <input type="text" id="dn-vehicle-no" class="fin-form-input" value="${dn.vehicle_no || ''}" placeholder="DXB-54219">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Driver Name</label>
                  <input type="text" id="dn-driver-name" class="fin-form-input" value="${dn.driver_name || ''}" placeholder="Abdul Rashid">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Driver Mobile Contact</label>
                  <input type="text" id="dn-driver-contact" class="fin-form-input" value="${dn.driver_contact || ''}" placeholder="+971 55 819 4022">
                </div>
              </div>
            </div>

            <!-- Card 4: Delivered Material Line Items -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div>
                  <div class="fin-form-section-title">
                    <span>📦</span>
                    <span>Delivered Material Items</span>
                  </div>
                  <div class="fin-form-section-desc">Itemize materials, specifications, and verified dispatched quantities</div>
                </div>
                <button type="button" class="fin-btn-quick" style="padding:6px 14px; font-size:0.78rem; border-color:#38bdf8; color:#38bdf8; display:flex; align-items:center; gap:0.4rem; font-weight:700;" onclick="window.finApp.addDeliveryItemRow()">
                  <span>+</span>
                  <span>Add Material Item</span>
                </button>
              </div>

              <div style="overflow-x:auto; border:1px solid rgba(255,255,255,0.08); border-radius:10px; background:rgba(11,17,30,0.65);">
                <table class="fin-line-item-table" style="width:100%; border-collapse:collapse; margin:0;" id="table-dn-items">
                  <thead>
                    <tr>
                      <th style="padding:0.75rem 0.85rem; width:44%;">Material Description / Specification</th>
                      <th style="padding:0.75rem 0.85rem; width:13%;">Unit</th>
                      <th style="padding:0.75rem 0.85rem; width:12%; text-align:right;">Qty Ordered</th>
                      <th style="padding:0.75rem 0.85rem; width:12%; text-align:right;">Qty Delivered</th>
                      <th style="padding:0.75rem 0.85rem; width:15%;">Condition / Remarks</th>
                      <th style="padding:0.75rem 0.85rem; width:4%; text-align:center;"></th>
                    </tr>
                  </thead>
                  <tbody id="dn-items-body">
                    ${items.map((item, idx) => `
                      <tr class="dn-item-row">
                        <td style="padding:0.5rem 0.65rem;">
                          <input type="text" class="fin-form-input dn-item-desc" value="${item.description || ''}" placeholder="Material description / specification" required style="width:100%; font-size:0.83rem;">
                        </td>
                        <td style="padding:0.5rem 0.65rem;">
                          <input type="text" class="fin-form-input dn-item-unit" value="${item.unit || 'Nos'}" placeholder="Unit (Sheets, Pcs)" style="width:100%; font-size:0.83rem;">
                        </td>
                        <td style="padding:0.5rem 0.65rem;">
                          <input type="number" step="any" class="fin-form-input dn-item-ordered" value="${item.qty_ordered || 1}" style="width:100%; text-align:right; font-size:0.83rem; font-weight:600;">
                        </td>
                        <td style="padding:0.5rem 0.65rem;">
                          <input type="number" step="any" class="fin-form-input dn-item-delivered" value="${item.qty_delivered || 1}" style="width:100%; text-align:right; font-size:0.83rem; font-weight:700; color:#10b981;">
                        </td>
                        <td style="padding:0.5rem 0.65rem;">
                          <input type="text" class="fin-form-input dn-item-remarks" value="${item.remarks || 'Prime Quality'}" placeholder="Sound Condition" style="width:100%; font-size:0.83rem;">
                        </td>
                        <td style="padding:0.5rem 0.65rem; text-align:center;">
                          <button type="button" class="fin-row-del-btn" onclick="window.finApp.removeDeliveryItemRow(this)" title="Remove Item">&times;</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Card 5: Receiver & Logistics Verification -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>✍️</span>
                  <span>Site Receiving &amp; Logistics Verification</span>
                </div>
              </div>
              <div class="fin-form-grid-2" style="margin-bottom:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Receiver Name &amp; Designation</label>
                  <input type="text" id="dn-receiver-name" class="fin-form-input" value="${dn.receiver_name || ''}" placeholder="Site Supervisor Tariq">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Receiver Emirates ID</label>
                  <input type="text" id="dn-receiver-eid" class="fin-form-input" value="${dn.receiver_eid || ''}" placeholder="784-1988-4459201-1">
                </div>
              </div>
              <div class="fin-form-group" style="margin-bottom:0;">
                <label class="fin-form-label">Dispatched By &amp; Verification Remarks</label>
                <input type="text" id="dn-dispatched-by" class="fin-form-input" value="${dn.dispatched_by || 'Logistics Supervisor Rashid Khan'}">
              </div>
            </div>

            <!-- Card 6: Dual Authorization Seals -->
            <div class="fin-auth-badge-card">
              <label class="fin-auth-checkbox-label">
                <input type="checkbox" id="dn-inc-stamp" ${dn.include_stamp !== false ? 'checked' : ''}>
                <span>Include Official Company Stamp (Blue Rayan Round Stamp)</span>
              </label>
              <label class="fin-auth-checkbox-label">
                <input type="checkbox" id="dn-inc-sig" ${dn.include_signature !== false ? 'checked' : ''}>
                <span>Include Authorized Signatures</span>
              </label>
            </div>

            <div class="fin-modal-footer" style="padding:1.25rem 0 0 0; display:flex; justify-content:flex-end; gap:0.85rem; border-top:1px solid rgba(255,255,255,0.1); background:transparent;">
              <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-dn-edit')">Cancel</button>
              <button type="submit" class="fin-btn-quick primary">💾 ${isEdit ? 'Save & Update Delivery Note' : 'Save & Issue Delivery Note'}</button>
            </div>
          </form>
        </div>
      </div>`;

    this.showCustomModal(modalHtml);

    const form = document.getElementById('form-dn-edit');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const rows = Array.from(document.querySelectorAll('#dn-items-body .dn-item-row'));
        const items = rows.map((r, i) => ({
          srl: i + 1,
          description: r.querySelector('.dn-item-desc')?.value.trim() || '',
          unit: r.querySelector('.dn-item-unit')?.value.trim() || 'Nos',
          qty_ordered: parseFloat(r.querySelector('.dn-item-ordered')?.value) || 1,
          qty_delivered: parseFloat(r.querySelector('.dn-item-delivered')?.value) || 1,
          remarks: r.querySelector('.dn-item-remarks')?.value.trim() || 'Sound Condition'
        })).filter(it => it.description);

        const updated = {
          id: document.getElementById('dn-id').value,
          dn_no: document.getElementById('dn-number').value.trim(),
          reference_no: document.getElementById('dn-number').value.trim(),
          date: document.getElementById('dn-date').value,
          po_reference: document.getElementById('dn-po-ref').value.trim(),
          client_name: document.getElementById('dn-client-name').value.trim(),
          project_name: document.getElementById('dn-project-name').value.trim(),
          dispatch_from: document.getElementById('dn-dispatch-from').value.trim(),
          site_location: document.getElementById('dn-site-location').value.trim(),
          vehicle_no: document.getElementById('dn-vehicle-no').value.trim(),
          driver_name: document.getElementById('dn-driver-name').value.trim(),
          driver_contact: document.getElementById('dn-driver-contact').value.trim(),
          items: items,
          receiver_name: document.getElementById('dn-receiver-name').value.trim(),
          receiver_eid: document.getElementById('dn-receiver-eid').value.trim(),
          dispatched_by: document.getElementById('dn-dispatched-by').value.trim(),
          include_stamp: document.getElementById('dn-inc-stamp').checked,
          include_signature: document.getElementById('dn-inc-sig').checked,
          status: 'Delivered',
          updated_at: new Date().toISOString()
        };

        if (!this.db.delivery_notes) {
          this.db.delivery_notes = [];
        }

        const idx = this.db.delivery_notes.findIndex(n => n.id === updated.id);
        if (idx >= 0) {
          this.db.delivery_notes[idx] = { ...this.db.delivery_notes[idx], ...updated };
        } else {
          this.db.delivery_notes.unshift(updated);
        }

        try {
          localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
        } catch (err) { }

        this.closeModal('modal-dn-edit');
        this.renderActiveTab();
        this.showNotification(`Delivery Note ${updated.dn_no} saved successfully.`, 'success');

        await this.syncApi('save_delivery_note', { delivery_note: updated });
      };
    }
  };

  proto.addDeliveryItemRow = function () {
    const tbody = document.getElementById('dn-items-body');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.className = 'dn-item-row';
    tr.innerHTML = `
      <td style="padding:0.5rem 0.65rem;">
        <input type="text" class="fin-form-input dn-item-desc" value="" placeholder="Material description / specification" required style="width:100%; font-size:0.83rem;">
      </td>
      <td style="padding:0.5rem 0.65rem;">
        <input type="text" class="fin-form-input dn-item-unit" value="Nos" placeholder="Unit (Sheets, Pcs)" style="width:100%; font-size:0.83rem;">
      </td>
      <td style="padding:0.5rem 0.65rem;">
        <input type="number" step="any" class="fin-form-input dn-item-ordered" value="1" style="width:100%; text-align:right; font-size:0.83rem; font-weight:600;">
      </td>
      <td style="padding:0.5rem 0.65rem;">
        <input type="number" step="any" class="fin-form-input dn-item-delivered" value="1" style="width:100%; text-align:right; font-size:0.83rem; font-weight:700; color:#10b981;">
      </td>
      <td style="padding:0.5rem 0.65rem;">
        <input type="text" class="fin-form-input dn-item-remarks" value="Prime Quality" placeholder="Sound Condition" style="width:100%; font-size:0.83rem;">
      </td>
      <td style="padding:0.5rem 0.65rem; text-align:center;">
        <button type="button" class="fin-row-del-btn" onclick="window.finApp.removeDeliveryItemRow(this)" title="Remove Item">&times;</button>
      </td>
    `;
    tbody.appendChild(tr);
  };

  proto.removeDeliveryItemRow = function (btn) {
    const row = btn.closest('.dn-item-row');
    if (row) row.remove();
  };

  // ==========================================================================
  // 7. SUBCONTRACTOR UNDERTAKING LETTER EDIT MODAL
  // ==========================================================================
  proto.openUndertakingLetterModal = function (letterId = null) {
    const isEdit = Boolean(letterId);
    let ult = null;
    if (isEdit) {
      ult = (this.db?.undertaking_letters || []).find(l => l.id === letterId || l.ref_no === letterId);
    }
    if (!ult) {
      const nextNum = (this.db?.undertaking_letters || []).length + 11006;
      ult = {
        id: `ult-${Date.now()}`,
        ref_no: `REC-RG-ULT-${nextNum}`,
        date: new Date().toISOString().split('T')[0],
        attention: 'Project Manager',
        attention_company: 'M/S TOP ROCK INTERIORS LLC',
        client_name: 'M/S TOP ROCK INTERIORS LLC',
        project_name: 'The New Dubai Police Academy @ Alrowaiyah, Dubai Fit out Work',
        activity_type: 'Interiors Work',
        subject: 'Subcontractor Undertaking letter M/S RAYAN ENGINEERING AND CONTRACTING L.L.C – S.P.C,',
        body_text: `With reference to the above-mentioned project/ subject we hereby confirm that we have subcontractor agreement with M/S TOP ROCK INTERIORS LLC,\n\nUpon terms and conditions in line with our contract being deputed for (Interiors Work) activities in your project M/S RAYAN ENGINEERING AND CONTRACTING L.L.C – S.P.C,,, will be responsible for any precautionary measures as far as safety is concerned and also agree that we will follow M/S TOP ROCK INTERIORS LLC \`s safety policy, M/S TOP ROCK INTERIORS LLC, HSE Plan and site safety rules based on DM/Trakhees regulations and Workmen Compensation Policy against all sums payable under the UAE Federal Decree - Law No. 33 of 2021, Article 37, also we agree that in case of any accidents or incidents occurred to any of the above company\`s workers or our employees we will take full responsibility of the person\`s treatments and any consequences like penalty or any legal complications related to the accident/incident also we agree that we can terminate above companies at any time if the violate HSE regulations set by the authorities.`,
        responsible_person: 'Eng. Bakhteyar Alam',
        designation: 'Construction Manager',
        include_stamp: true,
        include_signature: true,
        status: 'Active',
        employees: [
          { srl: 1, name: 'BHAGWAN DEEN MOLEY', emirates_id: '784-1983-8618357-2', nationality: 'Indian', profession: 'RG/JUMA ALROKN' },
          { srl: 2, name: 'CHAETU PRASAD YADAV MOLE YADAV', emirates_id: '784-1980-0879530-8', nationality: 'Indian', profession: 'RG/JUMA ALROKN' },
          { srl: 3, name: 'SHAHBAN ALI AKBAR ALI', emirates_id: '784-2003-1266689-2', nationality: 'Indian', profession: 'RG/JUMA ALROKN' },
          { srl: 4, name: 'ELIUS MOROL MD ALAM MOROL', emirates_id: '784-1999-8851573-2', nationality: 'Bangladesh', profession: 'RG/JUMA ALROKN' },
          { srl: 5, name: 'ASHOK KUMAR BABU LAL', emirates_id: '784-1982-6097953-3', nationality: 'Indian', profession: 'RG/JUMA ALROKN' },
          { srl: 6, name: 'OM PRAKASH KANHAIYA LAL', emirates_id: '784-1998-2546929-1', nationality: 'Indian', profession: 'RG/JUMA ALROKN' },
          { srl: 7, name: 'WAJID ALI SOLAHU', emirates_id: '784-1991-5410265-3', nationality: 'Indian', profession: 'RG/JUMA ALROKN' },
          { srl: 8, name: 'BIRENDRA YADAV', emirates_id: '784-2001-5776745-8', nationality: 'Nepal', profession: 'RG/TRUST WAY' },
          { srl: 9, name: 'FOOL CHANDRA SALIKRAM', emirates_id: '784-1998-5293711-1', nationality: 'Indian', profession: 'RG/TRUST WAY' }
        ]
      };
    }

    const employees = ult.employees && ult.employees.length ? ult.employees : [
      { srl: 1, name: 'BHAGWAN DEEN MOLEY', emirates_id: '784-1983-8618357-2', nationality: 'Indian', profession: 'RG/JUMA ALROKN' }
    ];

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-ult-edit">
        <div class="fin-modal-dialog" style="max-width:960px; max-height:92vh; background:#0d1527; border:1px solid rgba(56,189,248,0.25); box-shadow:0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(0,153,230,0.12); display:flex; flex-direction:column; border-radius:16px; overflow:hidden;">
          <div class="fin-modal-header" style="background:linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.85) 100%); padding:1.25rem 1.75rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(0,153,230,0.3) 100%); border:1px solid rgba(56,189,248,0.35); display:flex; align-items:center; justify-content:center; font-size:1.3rem;">🛡️</div>
              <div>
                <h3 class="fin-modal-title" style="margin:0; font-size:1.25rem; font-weight:800; color:#f8fafc; letter-spacing:-0.01em;">
                  ${isEdit ? 'Edit Subcontractor Undertaking Letter' : 'Create Subcontractor Undertaking Letter'}
                </h3>
                <p style="margin:2px 0 0; font-size:0.78rem; color:#94a3b8;">UAE Federal Decree Law 33 of 2021 Legal Compliance Undertaking • خطاب تعهد</p>
              </div>
            </div>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-ult-edit')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); width:32px; height:32px; border-radius:8px; color:#cbd5e1; font-size:1.1rem; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s ease;">&times;</button>
          </div>
          <form id="form-ult-edit" class="fin-modal-body" style="padding:1.5rem 1.75rem; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:1.25rem;">
            <input type="hidden" id="ult-id" value="${ult.id}">

            <!-- Card 1: Document Reference & Date -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>📋</span>
                  <span>Document Reference &amp; Date</span>
                </div>
              </div>
              <div class="fin-form-grid-2">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Reference Number <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="ult-ref-no" class="fin-form-input" value="${ult.ref_no}" required style="font-weight:700; color:#38bdf8;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Letter Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="ult-date" class="fin-form-input" value="${ult.date}" required>
                </div>
              </div>
            </div>

            <!-- Card 2: Contractor & Project Details -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>🏢</span>
                  <span>Recipient Contractor &amp; Project Details</span>
                </div>
              </div>
              <div class="fin-form-grid-2" style="margin-bottom:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Attention (Contact / Title)</label>
                  <input type="text" id="ult-attention" class="fin-form-input" value="${ult.attention || 'Project Manager'}" placeholder="Project Manager">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Contractor / Client Company <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="ult-client-name" class="fin-form-input" value="${ult.client_name || ult.attention_company}" required placeholder="M/S TOP ROCK INTERIORS LLC">
                </div>
              </div>
              <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:1.15rem; margin-bottom:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Project Name &amp; Fit-Out Scope <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="ult-project-name" class="fin-form-input" value="${ult.project_name}" required placeholder="The New Dubai Police Academy @ Alrowaiyah">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Activity Type (in parentheses)</label>
                  <input type="text" id="ult-activity-type" class="fin-form-input" value="${ult.activity_type || 'Interiors Work'}" placeholder="Interiors Work">
                </div>
              </div>
              <div class="fin-form-group" style="margin-bottom:0;">
                <label class="fin-form-label">Subject Line <span style="color:#ef4444;">*</span></label>
                <input type="text" id="ult-subject" class="fin-form-input" value="${ult.subject}" required>
              </div>
            </div>

            <!-- Card 3: Legal Declarations -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>⚖️</span>
                  <span>Undertaking Legal Declarations (UAE Federal Decree Law 33 of 2021)</span>
                </div>
              </div>
              <div class="fin-form-group" style="margin-bottom:0;">
                <label class="fin-form-label">Mandatory Legal Clauses &amp; Wage Protection Declarations <span style="color:#ef4444;">*</span></label>
                <textarea id="ult-body-text" class="fin-form-textarea" rows="7" style="resize:vertical; font-family:inherit; line-height:1.55;" required>${ult.body_text}</textarea>
              </div>
            </div>

            <!-- Card 4: Deputed Workforce Table -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div>
                  <div class="fin-form-section-title">
                    <span>👷</span>
                    <span>Deputed Workforce / Employee List</span>
                  </div>
                  <div class="fin-form-section-desc">Certified personnel roster under corporate sponsorship with verified Emirates IDs</div>
                </div>
                <button type="button" class="fin-btn-quick" style="padding:6px 14px; font-size:0.78rem; border-color:#38bdf8; color:#38bdf8; display:flex; align-items:center; gap:0.4rem; font-weight:700;" onclick="window.finApp.addUndertakingEmployeeRow()">
                  <span>+</span>
                  <span>Add Deputed Worker</span>
                </button>
              </div>

              <div style="overflow-x:auto; border:1px solid rgba(255,255,255,0.08); border-radius:10px; background:rgba(11,17,30,0.65);">
                <table class="fin-line-item-table" style="width:100%; border-collapse:collapse; margin:0;" id="table-ult-employees">
                  <thead>
                    <tr>
                      <th style="padding:0.75rem 0.85rem; width:32%;">Worker Full Name</th>
                      <th style="padding:0.75rem 0.85rem; width:26%;">Emirates ID</th>
                      <th style="padding:0.75rem 0.85rem; width:18%;">Nationality</th>
                      <th style="padding:0.75rem 0.85rem; width:20%;">Profession / Trade</th>
                      <th style="padding:0.75rem 0.85rem; width:4%; text-align:center;"></th>
                    </tr>
                  </thead>
                  <tbody id="ult-employees-body">
                    ${employees.map((emp, idx) => `
                      <tr class="ult-emp-row">
                        <td style="padding:0.5rem 0.65rem;">
                          <input type="text" class="fin-form-input ult-emp-name" value="${emp.name || ''}" placeholder="Full Name" required style="width:100%; font-size:0.83rem;">
                        </td>
                        <td style="padding:0.5rem 0.65rem;">
                          <input type="text" class="fin-form-input ult-emp-eid" value="${emp.emirates_id || ''}" placeholder="784-XXXX-XXXXXXX-X" required style="width:100%; font-size:0.83rem; font-weight:600;">
                        </td>
                        <td style="padding:0.5rem 0.65rem;">
                          <input type="text" class="fin-form-input ult-emp-nat" value="${emp.nationality || 'Indian'}" placeholder="Nationality" style="width:100%; font-size:0.83rem;">
                        </td>
                        <td style="padding:0.5rem 0.65rem;">
                          <input type="text" class="fin-form-input ult-emp-prof" value="${emp.profession || 'RG/JUMA ALROKN'}" placeholder="Profession" style="width:100%; font-size:0.83rem;">
                        </td>
                        <td style="padding:0.5rem 0.65rem; text-align:center;">
                          <button type="button" class="fin-row-del-btn" onclick="window.finApp.removeUndertakingEmployeeRow(this)" title="Remove Worker">&times;</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Card 5: Rayan Responsible Signatory -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>✍️</span>
                  <span>Rayan Responsible Management Signatory</span>
                </div>
              </div>
              <div class="fin-form-grid-2">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Responsible Person (Signatory) <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="ult-resp-person" class="fin-form-input" value="${ult.responsible_person || 'Eng. Bakhteyar Alam'}" required>
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Designation</label>
                  <input type="text" id="ult-designation" class="fin-form-input" value="${ult.designation || 'Construction Manager'}">
                </div>
              </div>
            </div>

            <!-- Card 6: Official Authorization Seals -->
            <div class="fin-auth-badge-card">
              <label class="fin-auth-checkbox-label">
                <input type="checkbox" id="ult-inc-stamp" ${ult.include_stamp !== false ? 'checked' : ''}>
                <span>Include Official Company Stamp (Blue Rayan Round Stamp)</span>
              </label>
              <label class="fin-auth-checkbox-label">
                <input type="checkbox" id="ult-inc-sig" ${ult.include_signature !== false ? 'checked' : ''}>
                <span>Include Construction Manager Signature</span>
              </label>
            </div>

            <div class="fin-modal-footer" style="padding:1.25rem 0 0 0; display:flex; justify-content:flex-end; gap:0.85rem; border-top:1px solid rgba(255,255,255,0.1); background:transparent;">
              <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-ult-edit')">Cancel</button>
              <button type="submit" class="fin-btn-quick primary">💾 ${isEdit ? 'Save & Update Undertaking Letter' : 'Save & Issue Undertaking Letter'}</button>
            </div>
          </form>
        </div>
      </div>`;

    this.showCustomModal(modalHtml);

    const form = document.getElementById('form-ult-edit');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const rows = Array.from(document.querySelectorAll('#ult-employees-body .ult-emp-row'));
        const employees = rows.map((r, i) => ({
          srl: i + 1,
          name: r.querySelector('.ult-emp-name')?.value.trim() || '',
          emirates_id: r.querySelector('.ult-emp-eid')?.value.trim() || '',
          nationality: r.querySelector('.ult-emp-nat')?.value.trim() || 'Indian',
          profession: r.querySelector('.ult-emp-prof')?.value.trim() || 'Technician'
        })).filter(emp => emp.name);

        const updated = {
          id: document.getElementById('ult-id').value,
          ref_no: document.getElementById('ult-ref-no').value.trim(),
          reference_no: document.getElementById('ult-ref-no').value.trim(),
          date: document.getElementById('ult-date').value,
          attention: document.getElementById('ult-attention').value.trim(),
          attention_company: document.getElementById('ult-client-name').value.trim(),
          client_name: document.getElementById('ult-client-name').value.trim(),
          project_name: document.getElementById('ult-project-name').value.trim(),
          activity_type: document.getElementById('ult-activity-type').value.trim(),
          subject: document.getElementById('ult-subject').value.trim(),
          body_text: document.getElementById('ult-body-text').value.trim(),
          responsible_person: document.getElementById('ult-resp-person').value.trim(),
          designation: document.getElementById('ult-designation').value.trim(),
          include_stamp: document.getElementById('ult-inc-stamp').checked,
          include_signature: document.getElementById('ult-inc-sig').checked,
          status: 'Active',
          employees: employees,
          updated_at: new Date().toISOString()
        };

        if (!this.db.undertaking_letters) {
          this.db.undertaking_letters = [];
        }

        const idx = this.db.undertaking_letters.findIndex(l => l.id === updated.id);
        if (idx >= 0) {
          this.db.undertaking_letters[idx] = { ...this.db.undertaking_letters[idx], ...updated };
        } else {
          this.db.undertaking_letters.unshift(updated);
        }

        try {
          localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
        } catch (err) { }

        this.closeModal('modal-ult-edit');
        this.renderActiveTab();
        this.showNotification(`Undertaking Letter ${updated.ref_no} saved successfully.`, 'success');

        await this.syncApi('save_undertaking_letter', { undertaking_letter: updated });
      };
    }
  };

  proto.addUndertakingEmployeeRow = function () {
    const tbody = document.getElementById('ult-employees-body');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.className = 'ult-emp-row';
    tr.innerHTML = `
      <td style="padding:0.5rem 0.65rem;">
        <input type="text" class="fin-form-input ult-emp-name" value="" placeholder="Full Name" required style="width:100%; font-size:0.83rem;">
      </td>
      <td style="padding:0.5rem 0.65rem;">
        <input type="text" class="fin-form-input ult-emp-eid" value="784-" placeholder="784-XXXX-XXXXXXX-X" required style="width:100%; font-size:0.83rem; font-weight:600;">
      </td>
      <td style="padding:0.5rem 0.65rem;">
        <input type="text" class="fin-form-input ult-emp-nat" value="Indian" placeholder="Nationality" style="width:100%; font-size:0.83rem;">
      </td>
      <td style="padding:0.5rem 0.65rem;">
        <input type="text" class="fin-form-input ult-emp-prof" value="RG/JUMA ALROKN" placeholder="Trade / Designation" style="width:100%; font-size:0.83rem;">
      </td>
      <td style="padding:0.5rem 0.65rem; text-align:center;">
        <button type="button" class="fin-row-del-btn" onclick="window.finApp.removeUndertakingEmployeeRow(this)" title="Remove Worker">&times;</button>
      </td>
    `;
    tbody.appendChild(tr);
  };

  proto.removeUndertakingEmployeeRow = function (btn) {
    const row = btn.closest('.ult-emp-row');
    if (row) row.remove();
  };

  // ==========================================================================
  // 8. CORPORATE LETTER EDIT MODAL (LATTER EDITABLE)
  // ==========================================================================
  proto.openCustomLetterModal = function (letterId = null) {
    const isEdit = Boolean(letterId);
    let ltr = null;
    if (isEdit) {
      ltr = (this.db?.custom_letters || []).find(l => l.id === letterId || l.ref_no === letterId);
    }
    if (!ltr) {
      const nextNum = (this.db?.custom_letters || []).length + 101;
      ltr = {
        id: `let-${Date.now()}`,
        ref_no: `REC-LTR-2026-${nextNum}`,
        reference_no: `REC-LTR-2026-${nextNum}`,
        date: new Date().toISOString().split('T')[0],
        attention: 'The Project Director',
        recipient_name: 'Eng. Tariq Mansoor',
        recipient_company: 'M/S BUILDARA GENERAL CONTRACTING - L.L.C',
        address: 'Sector E-25, Abu Dhabi, United Arab Emirates',
        project_name: 'Commercial & Residential Tower Fit-Out - Sector E-25',
        subject: 'Mobilization Notice & Safety Compliance Certification for Tower Fit-Out Package',
        body_text: `Dear Sir,\n\nWe are pleased to inform you that M/S RAYAN ENGINEERING AND CONTRACTING L.L.C – S.P.C has completed all pre-mobilization formalities, statutory HSE approvals, and workforce inductions for the Commercial & Residential Tower Fit-Out project at Sector E-25, Abu Dhabi.\n\nOur specialized site MEP & civil installation teams along with necessary equipment, certified scaffolding, and approved safety gears have been deployed on site effective from today. All works will strictly adhere to the approved project specifications, DM/Civil Defense regulations, and quality standards.\n\nWe assure you of our highest standard of workmanship and timely project milestone delivery. Kindly acknowledge receipt of this letter.`,
        signatory_name: 'Eng. Bakhteyar Alam',
        designation: 'Construction Manager',
        include_stamp: true,
        include_signature: true,
        status: 'Issued'
      };
    }

    const modalHtml = `
      <div class="fin-modal-backdrop open" id="modal-ltr-edit">
        <div class="fin-modal-dialog" style="max-width:900px; max-height:92vh; background:#0d1527; border:1px solid rgba(56,189,248,0.25); box-shadow:0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(0,153,230,0.12); display:flex; flex-direction:column; border-radius:16px; overflow:hidden;">
          <div class="fin-modal-header" style="background:linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.85) 100%); padding:1.25rem 1.75rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(0,153,230,0.3) 100%); border:1px solid rgba(56,189,248,0.35); display:flex; align-items:center; justify-content:center; font-size:1.3rem;">✉️</div>
              <div>
                <h3 class="fin-modal-title" style="margin:0; font-size:1.25rem; font-weight:800; color:#f8fafc; letter-spacing:-0.01em;">
                  ${isEdit ? 'Edit Official Letter' : 'Compose Corporate Letter (Latter Editable)'}
                </h3>
                <p style="margin:2px 0 0; font-size:0.78rem; color:#94a3b8;">Official Company Letterhead Document &amp; Formal Notice • خطاب رسمي</p>
              </div>
            </div>
            <button type="button" class="fin-modal-close" onclick="window.finApp.closeModal('modal-ltr-edit')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); width:32px; height:32px; border-radius:8px; color:#cbd5e1; font-size:1.1rem; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s ease;">&times;</button>
          </div>
          <form id="form-ltr-edit" class="fin-modal-body" style="padding:1.5rem 1.75rem; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:1.25rem;">
            <input type="hidden" id="ltr-id" value="${ltr.id}">

            <!-- Card 1: Dispatch Reference & Date -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>📋</span>
                  <span>Dispatch Reference &amp; Date</span>
                </div>
              </div>
              <div class="fin-form-grid-2">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Reference Number <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="ltr-ref-no" class="fin-form-input" value="${ltr.ref_no}" required style="font-weight:700; color:#38bdf8;">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Letter Date <span style="color:#ef4444;">*</span></label>
                  <input type="date" id="ltr-date" class="fin-form-input" value="${ltr.date}" required>
                </div>
              </div>
            </div>

            <!-- Card 2: Recipient Details & Project Reference -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>🏢</span>
                  <span>Recipient &amp; Entity Information</span>
                </div>
              </div>
              <div class="fin-form-grid-2" style="margin-bottom:1.15rem;">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Attention / Contact Name</label>
                  <input type="text" id="ltr-attention" class="fin-form-input" value="${ltr.attention || ''}" placeholder="The Project Director / General Manager">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Recipient Company <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="ltr-recipient-company" class="fin-form-input" value="${ltr.recipient_company}" required placeholder="Company / Authority Name">
                </div>
              </div>
              <div class="fin-form-grid-2">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Recipient Address / City</label>
                  <input type="text" id="ltr-address" class="fin-form-input" value="${ltr.address || ''}" placeholder="Abu Dhabi, United Arab Emirates">
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Project / Contract Reference</label>
                  <input type="text" id="ltr-project-name" class="fin-form-input" value="${ltr.project_name || ''}" placeholder="Project Name / Tender #">
                </div>
              </div>
            </div>

            <!-- Card 3: Letter Subject & Body -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>✍️</span>
                  <span>Letter Subject &amp; Paragraphs</span>
                </div>
              </div>
              <div class="fin-form-group" style="margin-bottom:1.15rem;">
                <label class="fin-form-label">Subject Line <span style="color:#ef4444;">*</span></label>
                <input type="text" id="ltr-subject" class="fin-form-input" value="${ltr.subject}" required placeholder="Subject: - ...">
              </div>
              <div class="fin-form-group" style="margin-bottom:0;">
                <label class="fin-form-label">Letter Body Text (Fully Editable Paragraphs) <span style="color:#ef4444;">*</span></label>
                <textarea id="ltr-body-text" class="fin-form-textarea" rows="9" style="resize:vertical; font-family:inherit; line-height:1.6;" required>${ltr.body_text}</textarea>
              </div>
            </div>

            <!-- Card 4: Signatory Designation -->
            <div class="fin-form-section-card">
              <div class="fin-form-section-header">
                <div class="fin-form-section-title">
                  <span>🖋️</span>
                  <span>Corporate Signatory Designation</span>
                </div>
              </div>
              <div class="fin-form-grid-2">
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Signatory Name <span style="color:#ef4444;">*</span></label>
                  <input type="text" id="ltr-signatory-name" class="fin-form-input" value="${ltr.signatory_name || 'Eng. Bakhteyar Alam'}" required>
                </div>
                <div class="fin-form-group" style="margin-bottom:0;">
                  <label class="fin-form-label">Designation</label>
                  <input type="text" id="ltr-designation" class="fin-form-input" value="${ltr.designation || 'Construction Manager'}">
                </div>
              </div>
            </div>

            <!-- Card 5: Official Authorization Seals -->
            <div class="fin-auth-badge-card">
              <label class="fin-auth-checkbox-label">
                <input type="checkbox" id="ltr-inc-stamp" ${ltr.include_stamp !== false ? 'checked' : ''}>
                <span>Include Official Company Stamp (Blue Rayan Round Stamp)</span>
              </label>
              <label class="fin-auth-checkbox-label">
                <input type="checkbox" id="ltr-inc-sig" ${ltr.include_signature !== false ? 'checked' : ''}>
                <span>Include Authorized Signature</span>
              </label>
            </div>

            <div class="fin-modal-footer" style="padding:1.25rem 0 0 0; display:flex; justify-content:flex-end; gap:0.85rem; border-top:1px solid rgba(255,255,255,0.1); background:transparent;">
              <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-ltr-edit')">Cancel</button>
              <button type="submit" class="fin-btn-quick primary">💾 ${isEdit ? 'Save & Update Letter' : 'Save & Issue Letter'}</button>
            </div>
          </form>
        </div>
      </div>`;

    this.showCustomModal(modalHtml);

    const form = document.getElementById('form-ltr-edit');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const updated = {
          id: document.getElementById('ltr-id').value,
          ref_no: document.getElementById('ltr-ref-no').value.trim(),
          reference_no: document.getElementById('ltr-ref-no').value.trim(),
          date: document.getElementById('ltr-date').value,
          attention: document.getElementById('ltr-attention').value.trim(),
          recipient_company: document.getElementById('ltr-recipient-company').value.trim(),
          address: document.getElementById('ltr-address').value.trim(),
          project_name: document.getElementById('ltr-project-name').value.trim(),
          subject: document.getElementById('ltr-subject').value.trim(),
          body_text: document.getElementById('ltr-body-text').value.trim(),
          signatory_name: document.getElementById('ltr-signatory-name').value.trim(),
          designation: document.getElementById('ltr-designation').value.trim(),
          include_stamp: document.getElementById('ltr-inc-stamp').checked,
          include_signature: document.getElementById('ltr-inc-sig').checked,
          status: 'Issued',
          updated_at: new Date().toISOString()
        };

        if (!this.db.custom_letters) {
          this.db.custom_letters = [];
        }

        const idx = this.db.custom_letters.findIndex(l => l.id === updated.id);
        if (idx >= 0) {
          this.db.custom_letters[idx] = { ...this.db.custom_letters[idx], ...updated };
        } else {
          this.db.custom_letters.unshift(updated);
        }

        try {
          localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
        } catch (err) { }

        this.closeModal('modal-ltr-edit');
        this.renderActiveTab();
        this.showNotification(`Letter ${updated.ref_no} saved successfully.`, 'success');

        await this.syncApi('save_custom_letter', { custom_letter: updated });
      };
    }
  };

  // ==========================================================================
  // 9. PRINT & VIEW MODALS (MATCHING EXACT UPLOADED DESIGNS)
  // ==========================================================================

  // --- Work Completion Certificate Print Modal ---
  proto.openWorkCompletionPrintModal = function (certId, isVerifiedScan = false) {
    let cert = (this.db?.work_completion_certificates || []).find(c => c.id === certId || c.cert_no === certId);
    if (!cert) {
      cert = (this.db?.work_completion_certificates || [])[0] || {};
    }

    const modalHtml = `
      <div class="fin-doc-modal-backdrop" id="fin-doc-print-modal">
        <div class="fin-doc-toolbar">
          <div class="fin-doc-toolbar-left">
            <div class="fin-doc-title-badge">
              <span>📜</span>
              <span>Work Completion Certificate — ${cert.cert_no || 'REC-JOB COM-11020'}</span>
            </div>
            <div class="fin-doc-type-pills">
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openInvoicePrintModal()">Tax Invoice</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openReceiptPrintModal()">Receipt Voucher</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPaymentPrintModal()">Payment Voucher</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openBillPrintModal()">Purchase Bill</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openPOPrintModal()">Purchase Order</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openCreditNotePrintModal()">Credit Note</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openDebitNotePrintModal()">Debit Note</button>
              <button type="button" class="fin-doc-pill-btn active" onclick="window.finApp.openWorkCompletionPrintModal('${cert.id}')">Completion Cert</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openDeliveryNotePrintModal()">Delivery Note</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openUndertakingLetterPrintModal()">Undertaking Letter</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openCustomLetterPrintModal()">Official Letter</button>
            </div>
          </div>
          <div class="fin-doc-toolbar-right">
            <button type="button" class="fin-btn-print-action fin-btn-print-primary" onclick="window.finApp.printDocument()">
              🖨️ Print / Save as PDF
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.downloadWorkCompletionDocument('${cert.id}')">
              📥 Download Document
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal(); window.finApp.openWorkCompletionModal('${cert.id}')" style="color:#f59e0b; border-color:rgba(245,158,11,0.4);">
              ✏️ Edit Certificate
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal()">
              ✕ Close
            </button>
          </div>
        </div>

        <div class="fin-doc-viewport">
          <div class="fin-document-paper" style="background:#ffffff; color:#111827; padding:8mm 12mm 6mm 12mm; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing:border-box; width:100%; max-width:820px; margin:0 auto 2rem auto; box-shadow:0 4px 20px rgba(0,0,0,0.08); border-radius:4px; position:relative; overflow:hidden;">

            <!-- Center Watermark -->
            ${this.getRayanWatermark ? this.getRayanWatermark() : ''}

            <!-- Main Document Layer -->
            <div style="position:relative; z-index:1;">

              <!-- Top Cyan Bar -->
              <div style="background:#00a3c4; height:18px; margin:-8mm -12mm 15px -12mm; padding:2px 12px; display:flex; align-items:center;">
                <span style="color:#ffffff; font-size:0.68rem; font-weight:800; letter-spacing:0.04em;">RAYAN ENGINEERING</span>
              </div>

              <!-- Header with Logo and Bilingual Title -->
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.2rem;">
                <div>
                  <img src="/assets/docs/rayan-doc-logo.png" alt="RAYAN ENGINEERING" style="height:48px; width:auto; display:block;">
                </div>
                <div style="text-align:center; flex:1;">
                  <div style="font-family:'Amiri', serif; font-size:1.45rem; font-weight:700; color:#111827; line-height:1.2;">
                    شهادة اتمام العمل
                  </div>
                  <div style="font-family:'Outfit', sans-serif; font-size:1.2rem; font-weight:800; color:#111827; letter-spacing:0.04em; text-transform:uppercase;">
                    WORK COMPLETION CERTIFICATE
                  </div>
                </div>
                <div style="width:48px;"></div>
              </div>

              <!-- Metadata & Reference Table -->
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; border-top:1px solid #111827; border-bottom:1px solid #111827; padding:6px 0;">
                <div style="width:45%;">
                  <div style="font-weight:700; color:#111827; font-size:0.84rem;">To.</div>
                  <div style="font-weight:800; color:#111827; font-size:0.88rem;">${cert.contact_person || cert.to_name || 'Mr. Mohamed Abuelgasim'}</div>
                  <div style="font-weight:700; color:#374151; font-size:0.82rem;">${cert.client_name || cert.to_company || 'M/s IRON BEAM BUILDING CONTRACTING L.L.C'}</div>
                </div>

                <div style="width:55%;">
                  <table style="width:100%; font-size:0.78rem; border-collapse:collapse; text-align:right;">
                    <tr>
                      <td style="font-weight:700; text-align:left; color:#111827; width:22%;">Date :</td>
                      <td style="font-weight:800; color:#111827; text-align:left; width:30%;">${this.formatDate(cert.date)}</td>
                      <td style="font-weight:700; color:#111827; text-align:left; width:25%;">${cert.time || '6:27 PM'}</td>
                      <td style="font-family:'Amiri', serif; font-weight:700; color:#111827; width:23%; font-size:0.82rem;">التاريخ:</td>
                    </tr>
                    <tr>
                      <td style="font-weight:700; text-align:left; color:#111827;">Reference number :</td>
                      <td colspan="2" style="font-weight:800; color:#dc2626; text-align:left;">${cert.cert_no || cert.reference_no}</td>
                      <td style="font-family:'Amiri', serif; font-weight:700; color:#111827; font-size:0.82rem;">الرقم المرجعي</td>
                    </tr>
                    <tr>
                      <td style="font-weight:700; text-align:left; color:#111827; line-height:1.2;">Sub-contract<br>Agreement</td>
                      <td colspan="2" style="font-weight:800; color:#111827; text-align:left;">${cert.subcontract_agreement || cert.po_no || 'IB-037-136'}</td>
                      <td style="font-family:'Amiri', serif; font-weight:700; color:#111827; font-size:0.82rem;">طلب شراء محلي</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Project Information Bilingual Box -->
              <div style="border:1.5px solid #111827; padding:8px 12px; margin-bottom:1.2rem; background:#fbfcfe;">
                <div style="font-size:0.84rem; font-weight:800; color:#111827; text-decoration:underline; margin-bottom:6px;">
                  Project Information
                </div>
                <table style="width:100%; font-size:0.80rem; border-collapse:collapse;">
                  <tr>
                    <td style="width:18%; font-weight:700; color:#111827; padding:2px 0;">Project #</td>
                    <td style="font-weight:700; color:#111827; padding:2px 0;">${cert.project_name || 'Al Foah Mall Alain'}</td>
                    <td style="width:20%; text-align:right; font-family:'Amiri', serif; font-weight:700; color:#111827; padding:2px 0;">مشروع#</td>
                  </tr>
                  <tr>
                    <td style="font-weight:700; color:#111827; padding:2px 0;">Clint Name:</td>
                    <td style="font-weight:800; color:#111827; padding:2px 0;">${cert.client_name || 'M/s IRON BEAM BUILDING CONTRACTING L.L.C'}</td>
                    <td style="text-align:right; font-family:'Amiri', serif; font-weight:700; color:#111827; padding:2px 0;">اسم كلينت</td>
                  </tr>
                  <tr>
                    <td style="font-weight:700; color:#111827; padding:2px 0;">Main Clint:</td>
                    <td style="font-weight:700; color:#111827; padding:2px 0;">${cert.main_client || 'M/s Emirates Driving Company'}</td>
                    <td style="text-align:right; font-family:'Amiri', serif; font-weight:700; color:#111827; padding:2px 0;">كلينت الرئيسي</td>
                  </tr>
                  <tr>
                    <td style="font-weight:700; color:#111827; padding:2px 0;">Contact Person:</td>
                    <td style="font-weight:700; color:#111827; padding:2px 0;">${cert.contact_person || 'Mr. Mohamed Abuelgasim'}</td>
                    <td style="text-align:right; font-family:'Amiri', serif; font-weight:700; color:#111827; padding:2px 0;">اتصال شخص</td>
                  </tr>
                  <tr>
                    <td style="font-weight:700; color:#111827; padding:2px 0;">Email :</td>
                    <td style="font-weight:700; color:#0284c7; padding:2px 0;">${cert.email || 'mohamed.a@ironbeam.ae'}</td>
                    <td style="text-align:right; font-family:'Amiri', serif; font-weight:700; color:#111827; padding:2px 0;">بريد إلكتروني</td>
                  </tr>
                </table>
              </div>

              <!-- Dear Sir & Certification Declarations -->
              <div style="font-size:0.84rem; line-height:1.55; color:#111827; margin-bottom:1.2rem;">
                <div style="font-weight:700; margin-bottom:8px;">Dear Sir,</div>
                <div style="white-space:pre-line; margin-bottom:10px;">
                  ${cert.body_text}
                </div>
              </div>

              <!-- Verification Notice -->
              <div style="border-top:1px solid #111827; border-bottom:1px solid #111827; padding:4px 0; margin-bottom:1rem; font-size:0.76rem; font-weight:700; color:#111827;">
                Please keep a copy of this Work Completion Certificate for your records
              </div>

              <!-- Best Wishes & Contacts -->
              <div style="font-size:0.78rem; line-height:1.45; color:#374151; margin-bottom:1.5rem;">
                <div style="color:#111827;">Best wishes</div>
                <div style="font-weight:800; color:#111827;">RAYAN Group Team</div>
                <div>Hotline : 025654497</div>
                <div><a href="mailto:cc.info@rayan-group.com" style="color:#0284c7; text-decoration:none;">cc.info@rayan-group.com</a></div>
                <div><a href="http://rayan-group.com" style="color:#0284c7; text-decoration:none;">http://rayan-group.com</a></div>
              </div>

              <!-- Two Signature Boxes Side-by-Side (Matching Uploaded PDF) -->
              <div style="display:grid; grid-template-columns:1fr 1fr; border:1.5px solid #111827; min-height:130px; margin-bottom:1.5rem;">
                <!-- Left: Client Signatory -->
                <div style="border-right:1.5px solid #111827; padding:10px 12px; display:flex; flex-direction:column; justify-content:space-between;">
                  <div>
                    <div style="font-size:0.80rem; font-weight:800; color:#111827; margin-bottom:2px;">
                      ${cert.client_name || 'M/s IRON BEAM BUILDING CONTRACTING L.L.C'}
                    </div>
                    <div style="font-size:0.78rem; font-weight:700; color:#374151;">
                      Authorized Signatory:
                    </div>
                  </div>
                  <div style="min-height:50px; display:flex; align-items:flex-end; color:#9ca3af; font-size:0.72rem; font-style:italic;">
                    Signature &amp; Stamp
                  </div>
                </div>

                <!-- Right: Rayan Engineering Signatory with Stamp + Signature -->
                <div style="padding:10px 12px; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
                  <div>
                    <div style="font-size:0.80rem; font-weight:800; color:#111827; margin-bottom:2px;">
                      RAYAN ENGINEERING AND CONTRACTING LLC-SPC
                    </div>
                    <div style="font-size:0.78rem; font-weight:700; color:#374151;">
                      Authorized Signatory:
                    </div>
                  </div>
                  <div style="display:flex; align-items:center; gap:15px; position:relative; min-height:60px; margin-top:5px;">
                    ${cert.include_signature !== false ? `
                      <img src="/assets/docs/rayan-signature-construction.png" alt="Signature" style="height:55px; width:auto; display:block; filter:contrast(1.2);">
                    ` : ''}
                    ${cert.include_stamp !== false ? `
                      <img src="/assets/docs/rayan-stamp-round.png" alt="Stamp" style="height:75px; width:auto; display:block; filter:contrast(1.15);">
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- Solid Cyan Footer Strip -->
              <div style="background:#00a3c4; color:#ffffff; padding:6px 10px; font-size:0.72rem; font-weight:700; text-align:center; margin:-6mm -12mm -6mm -12mm; letter-spacing:0.02em;">
                Tel: +971-25654497 | Abu Dhabi, United Arab Emirates | info@rayan-group.com | www.rayan-group.com
              </div>

            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
    document.body.classList.add('fin-doc-open');
  };

  proto.downloadWorkCompletionDocument = function (certId) {
    let cert = (this.db?.work_completion_certificates || []).find(c => c.id === certId || c.cert_no === certId);
    if (!cert) return;
    const paperHtml = document.querySelector('#fin-doc-print-modal .fin-document-paper')?.outerHTML;
    if (paperHtml) {
      const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Work Completion Certificate - ${cert.cert_no}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body { background: #f1f5f9; padding: 2rem; display: flex; justify-content: center; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    .fin-document-paper { max-width: 820px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 8px; box-sizing: border-box; }
    @media print {
      @page { size: A4 portrait; margin: 6mm 8mm; }
      body { background: #fff; padding: 0; }
      .fin-document-paper { box-shadow: none; border-radius: 0; max-width: 100%; width: 100%; padding: 6mm 8mm !important; }
    }
  </style>
</head>
<body>
  ${paperHtml}
</body>
</html>`;
      this.downloadFile(`${cert.cert_no}_Work_Completion.html`, fullDoc, 'text/html');
      this.showNotification(`Downloaded ${cert.cert_no} Work Completion Certificate.`, 'success');
    }
  };

  // --- Subcontractor Undertaking Letter Print Modal (2-Page Layout) ---
  proto.openUndertakingLetterPrintModal = function (letterId, isVerifiedScan = false) {
    let ult = (this.db?.undertaking_letters || []).find(l => l.id === letterId || l.ref_no === letterId);
    if (!ult) {
      ult = (this.db?.undertaking_letters || [])[0] || {};
    }

    const employees = ult.employees && ult.employees.length ? ult.employees : [
      { srl: 1, name: 'BHAGWAN DEEN MOLEY', emirates_id: '784-1983-8618357-2', nationality: 'Indian', profession: 'RG/JUMA ALROKN' }
    ];

    const modalHtml = `
      <div class="fin-doc-modal-backdrop" id="fin-doc-print-modal">
        <div class="fin-doc-toolbar">
          <div class="fin-doc-toolbar-left">
            <div class="fin-doc-title-badge">
              <span>🛡️</span>
              <span>Subcontractor Undertaking Letter (2 Pages) — ${ult.ref_no || 'REC-RG-ULT-11006'}</span>
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
              <button type="button" class="fin-doc-pill-btn active" onclick="window.finApp.openUndertakingLetterPrintModal('${ult.id}')">Undertaking Letter</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openCustomLetterPrintModal()">Official Letter</button>
            </div>
          </div>
          <div class="fin-doc-toolbar-right">
            <button type="button" class="fin-btn-print-action fin-btn-print-primary" onclick="window.finApp.printDocument()">
              🖨️ Print / Save as PDF
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.downloadUndertakingLetterDocument('${ult.id}')">
              📥 Download Document
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal(); window.finApp.openUndertakingLetterModal('${ult.id}')" style="color:#f59e0b; border-color:rgba(245,158,11,0.4);">
              ✏️ Edit Letter
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal()">
              ✕ Close
            </button>
          </div>
        </div>

        <div class="fin-doc-viewport">
          <!-- PAGE 1: Undertaking Statement -->
          <div class="fin-document-paper" style="background:#ffffff; color:#111827; padding:12mm 16mm 10mm 16mm; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing:border-box; width:100%; max-width:820px; margin:0 auto 1.5rem auto; box-shadow:0 4px 20px rgba(0,0,0,0.08); border-radius:4px; position:relative; min-height:1020px; display:flex; flex-direction:column; justify-content:space-between;">
            ${this.getRayanWatermark ? this.getRayanWatermark() : ''}

            <div style="position:relative; z-index:1;">
              <!-- Header Logo -->
              <div style="text-align:center; margin-bottom:1.5rem;">
                <img src="/assets/docs/rayan-doc-logo.png" alt="RAYAN ENGINEERING" style="height:56px; width:auto; display:inline-block;">
              </div>

              <!-- Date & Ref Row -->
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.88rem; font-weight:700; color:#111827; margin-bottom:1.8rem;">
                <div>Date: ${this.formatDate(ult.date)}.</div>
                <div>Ref.: ${ult.ref_no}</div>
              </div>

              <!-- Document Title -->
              <div style="text-align:center; margin-bottom:1.8rem;">
                <h1 style="font-size:1.15rem; font-weight:800; color:#111827; text-decoration:underline; letter-spacing:0.01em; margin:0;">
                  Subcontractor undertaking letter.
                </h1>
              </div>

              <!-- Attention & Project Details -->
              <div style="font-size:0.86rem; color:#111827; line-height:1.6; margin-bottom:1.2rem;">
                <div style="font-weight:700;">Attention: - ${ult.attention || 'Project Manager'},</div>
                <div style="font-weight:800; text-transform:uppercase; margin-bottom:0.6rem;">${ult.client_name || ult.attention_company || 'M/S TOP ROCK INTERIORS LLC'}</div>
                <div style="font-weight:800; margin-bottom:0.4rem;">Project: ${ult.project_name || 'The New Dubai Police Academy @ Alrowaiyah, Dubai Fit out Work'}</div>
                <div style="font-weight:800;">Subject: - ${ult.subject || 'Subcontractor Undertaking letter M/S RAYAN ENGINEERING AND CONTRACTING L.L.C – S.P.C,'}</div>
              </div>

              <!-- Body Paragraphs -->
              <div style="font-size:0.86rem; line-height:1.75; color:#111827; text-align:justify;">
                <div style="font-weight:700; margin-bottom:8px;">Dear Sir,</div>
                <div style="white-space:pre-line;">
                  ${ult.body_text}
                </div>
              </div>
            </div>

            <!-- Page 1 Bottom Footer -->
            <div style="position:relative; z-index:1; border-top:1px solid #e2e8f0; padding-top:0.75rem; margin-top:2rem; font-size:0.75rem; color:#64748b; line-height:1.4;">
              <div style="color:#0284c7; font-weight:700; margin-bottom:1px;">Abu Dhabi, UAE</div>
              <div>Tel: +971-25654497 | Abu Dhabi, United Arab Emirates | info@rayan-group.com | www.rayan-group.com</div>
            </div>
          </div>

          <!-- PAGE 2: Employee List Table & Dual Stamps -->
          <div class="fin-document-paper" style="background:#ffffff; color:#111827; padding:12mm 16mm 10mm 16mm; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing:border-box; width:100%; max-width:820px; margin:0 auto 2rem auto; box-shadow:0 4px 20px rgba(0,0,0,0.08); border-radius:4px; position:relative; min-height:1020px; display:flex; flex-direction:column; justify-content:space-between; page-break-before:always; break-before:page;">
            ${this.getRayanWatermark ? this.getRayanWatermark() : ''}

            <div style="position:relative; z-index:1;">
              <!-- Header Logo -->
              <div style="text-align:center; margin-bottom:1.5rem;">
                <img src="/assets/docs/rayan-doc-logo.png" alt="RAYAN ENGINEERING" style="height:56px; width:auto; display:inline-block;">
              </div>

              <!-- Title -->
              <div style="text-align:center; margin-bottom:1.5rem;">
                <h2 style="font-size:1.3rem; font-weight:800; color:#1e3a8a; letter-spacing:0.04em; text-transform:uppercase; margin:0;">
                  EMPLOYEE LIST
                </h2>
              </div>

              <!-- Employee Table -->
              <table style="width:100%; border-collapse:collapse; font-size:0.80rem; border:1px solid #1e3a8a; margin-bottom:2rem;">
                <thead>
                  <tr style="background:#bfdbfe; color:#1e3a8a; font-weight:800;">
                    <th style="border:1px solid #1e3a8a; padding:8px 6px; width:7%; text-align:center;">SRL.</th>
                    <th style="border:1px solid #1e3a8a; padding:8px 10px; width:38%; text-align:left;">NAME</th>
                    <th style="border:1px solid #1e3a8a; padding:8px 10px; width:25%; text-align:center;">EMIRATES ID</th>
                    <th style="border:1px solid #1e3a8a; padding:8px 8px; width:15%; text-align:center;">NATIONALITY</th>
                    <th style="border:1px solid #1e3a8a; padding:8px 8px; width:15%; text-align:center;">PROFESSION</th>
                  </tr>
                </thead>
                <tbody>
                  ${employees.map((emp, idx) => `
                    <tr style="border-bottom:1px solid #cbd5e1; background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                      <td style="border:1px solid #1e3a8a; padding:6px 6px; text-align:center; font-weight:700;">${idx + 1}</td>
                      <td style="border:1px solid #1e3a8a; padding:6px 10px; font-weight:700; color:#111827; text-transform:uppercase;">${emp.name}</td>
                      <td style="border:1px solid #1e3a8a; padding:6px 10px; text-align:center; font-family:monospace; font-weight:600; color:#1e293b;">${emp.emirates_id}</td>
                      <td style="border:1px solid #1e3a8a; padding:6px 8px; text-align:center; color:#334155;">${emp.nationality}</td>
                      <td style="border:1px solid #1e3a8a; padding:6px 8px; text-align:center; font-weight:600; color:#111827; font-size:0.75rem;">${emp.profession}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Sign-off Block -->
              <div style="font-size:0.86rem; color:#111827; line-height:1.6; margin-top:1.5rem;">
                <div style="font-weight:700; margin-bottom:8px;">Truly</div>
                <div style="font-weight:700;">Responsible Person: <strong>${ult.responsible_person || 'Eng. Bakhteyar Alam'}</strong></div>
                <div style="font-weight:700; margin-bottom:12px;">Designation: <strong>${ult.designation || 'Construction Manager'}</strong></div>

                <div style="display:flex; align-items:flex-start; gap:2.5rem; margin-top:1rem;">
                  <div>
                    <div style="font-size:0.78rem; font-weight:700; color:#475569; margin-bottom:4px;">Signature</div>
                    ${ult.include_signature !== false ? `
                      <img src="/assets/docs/rayan-signature-construction.png" alt="Signature" style="height:65px; width:auto; display:block; filter:contrast(1.2);">
                    ` : ''}
                  </div>
                  <div>
                    <div style="font-size:0.78rem; font-weight:700; color:#475569; margin-bottom:4px;">Company Stamp</div>
                    ${ult.include_stamp !== false ? `
                      <img src="/assets/docs/rayan-stamp-round.png" alt="Company Stamp" style="height:90px; width:auto; display:block; filter:contrast(1.2);">
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>

            <!-- Page 2 Bottom Footer -->
            <div style="position:relative; z-index:1; border-top:1px solid #e2e8f0; padding-top:0.75rem; margin-top:2rem; font-size:0.75rem; color:#64748b; line-height:1.4;">
              <div style="color:#0284c7; font-weight:700; margin-bottom:1px;">Abu Dhabi, UAE</div>
              <div>Tel: +971-25654497 | Abu Dhabi, United Arab Emirates | info@rayan-group.com | www.rayan-group.com</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
    document.body.classList.add('fin-doc-open');
  };

  proto.downloadUndertakingLetterDocument = function (letterId) {
    let ult = (this.db?.undertaking_letters || []).find(l => l.id === letterId || l.ref_no === letterId);
    if (!ult) return;
    const pages = document.querySelectorAll('#fin-doc-print-modal .fin-document-paper');
    if (pages.length) {
      const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Subcontractor Undertaking Letter - ${ult.ref_no}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { background: #f1f5f9; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 2rem; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    .fin-document-paper { max-width: 820px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 8px; box-sizing: border-box; }
    @media print {
      @page { size: A4 portrait; margin: 8mm 10mm; }
      body { background: #fff; padding: 0; gap: 0; }
      .fin-document-paper { box-shadow: none; border-radius: 0; max-width: 100%; width: 100%; padding: 8mm 10mm !important; page-break-after: always; break-after: page; }
    }
  </style>
</head>
<body>
  ${Array.from(pages).map(p => p.outerHTML).join('\n')}
</body>
</html>`;
      this.downloadFile(`${ult.ref_no}_Undertaking_Letter.html`, fullDoc, 'text/html');
      this.showNotification(`Downloaded ${ult.ref_no} Undertaking Letter.`, 'success');
    }
  };

  // --- Material Delivery Note Print Modal ---
  proto.openDeliveryNotePrintModal = function (dnId, isVerifiedScan = false) {
    let dn = (this.db?.delivery_notes || []).find(n => n.id === dnId || n.dn_no === dnId);
    if (!dn) {
      dn = (this.db?.delivery_notes || [])[0] || {};
    }

    const items = dn.items && dn.items.length ? dn.items : [
      { srl: 1, description: 'Material Items as per approved delivery order', unit: 'LSUM', qty_ordered: 1, qty_delivered: 1, remarks: 'Verified Sound' }
    ];

    const modalHtml = `
      <div class="fin-doc-modal-backdrop" id="fin-doc-print-modal">
        <div class="fin-doc-toolbar">
          <div class="fin-doc-toolbar-left">
            <div class="fin-doc-title-badge">
              <span>🚚</span>
              <span>Delivery Note — ${dn.dn_no || 'DN-REC-1001'}</span>
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
              <button type="button" class="fin-doc-pill-btn active" onclick="window.finApp.openDeliveryNotePrintModal('${dn.id}')">Delivery Note</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openUndertakingLetterPrintModal()">Undertaking Letter</button>
              <button type="button" class="fin-doc-pill-btn" onclick="window.finApp.openCustomLetterPrintModal()">Official Letter</button>
            </div>
          </div>
          <div class="fin-doc-toolbar-right">
            <button type="button" class="fin-btn-print-action fin-btn-print-primary" onclick="window.finApp.printDocument()">
              🖨️ Print / Save as PDF
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.downloadDeliveryNoteDocument('${dn.id}')">
              📥 Download Document
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal(); window.finApp.openDeliveryNoteModal('${dn.id}')" style="color:#f59e0b; border-color:rgba(245,158,11,0.4);">
              ✏️ Edit Delivery Note
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal()">
              ✕ Close
            </button>
          </div>
        </div>

        <div class="fin-doc-viewport">
          <div class="fin-document-paper" style="background:#ffffff; color:#111827; padding:8mm 12mm 8mm 12mm; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing:border-box; width:100%; max-width:820px; margin:0 auto 2rem auto; box-shadow:0 4px 20px rgba(0,0,0,0.08); border-radius:4px; position:relative; overflow:hidden;">
            ${this.getRayanWatermark ? this.getRayanWatermark() : ''}

            <div style="position:relative; z-index:1;">
              <!-- Header -->
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; border-bottom:2px solid #111827; padding-bottom:0.75rem;">
                <div style="max-width:55%;">
                  <img src="/assets/docs/rayan-doc-logo.png" alt="RAYAN ENGINEERING" style="height:44px; width:auto; display:block; margin-bottom:4px;">
                  <div style="font-size:0.80rem; font-weight:800; color:#111827; text-transform:uppercase;">RAYAN ENGINEERING AND CONTRACTING LLC SPC</div>
                  <div style="font-size:0.75rem; color:#475569;">TRN: 100234567800003 | Abu Dhabi, United Arab Emirates</div>
                  <div style="font-size:0.75rem; color:#475569;">Hotline: +971 2 565 4497 | info@rayan-group.com</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-family:'Outfit', sans-serif; font-size:1.75rem; font-weight:800; color:#111827; line-height:1;">DELIVERY NOTE</div>
                  <div style="font-family:'Amiri', serif; font-size:1.1rem; font-weight:700; color:#374151; margin-top:2px;">إذن تسليم مواد</div>
                  <div style="font-size:0.92rem; font-weight:800; color:#0284c7; margin-top:4px;"># ${dn.dn_no}</div>
                  <div style="font-size:0.78rem; color:#475569; margin-top:2px;">Date: <strong>${this.formatDate(dn.date)} ${dn.time || ''}</strong></div>
                </div>
              </div>

              <!-- Details Grid (Consignee & Project Delivery Site) -->
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:1.2rem;">
                <div style="border:1px solid #cbd5e1; border-radius:6px; padding:10px; background:#f8fafc;">
                  <div style="font-size:0.70rem; font-weight:800; color:#0284c7; text-transform:uppercase; margin-bottom:4px;">DELIVERED TO (المستلم)</div>
                  <div style="font-size:0.88rem; font-weight:800; color:#111827;">${dn.client_name || 'Client Name'}</div>
                  <div style="font-size:0.78rem; color:#475569; margin-top:3px;">PO Ref: <strong>${dn.po_reference || 'Direct LPO'}</strong></div>
                  <div style="font-size:0.78rem; color:#475569;">Attn: <strong>${dn.receiver_name || 'Site Storekeeper'}</strong></div>
                </div>

                <div style="border:1px solid #cbd5e1; border-radius:6px; padding:10px; background:#f8fafc;">
                  <div style="font-size:0.70rem; font-weight:800; color:#0284c7; text-transform:uppercase; margin-bottom:4px;">PROJECT &amp; DISPATCH SITE (موقع المشروع)</div>
                  <div style="font-size:0.88rem; font-weight:800; color:#111827;">${dn.project_name || 'Project Site'}</div>
                  <div style="font-size:0.78rem; color:#475569; margin-top:3px;">Site Gate: <strong>${dn.site_location || 'Main Delivery Gate'}</strong></div>
                  <div style="font-size:0.78rem; color:#475569;">Dispatch Origin: <strong>${dn.dispatch_from || 'Central Yard Mussafah'}</strong></div>
                  <div style="font-size:0.78rem; color:#475569;">Vehicle: <strong>${dn.vehicle_no || 'AUH-49210'}</strong> • Driver: <strong>${dn.driver_name || 'Rashid'}</strong></div>
                </div>
              </div>

              <!-- Line Items Table -->
              <table style="width:100%; border-collapse:collapse; font-size:0.78rem; border:1px solid #111827; margin-bottom:1.2rem;">
                <thead>
                  <tr style="background:#111827; color:#ffffff;">
                    <th style="border:1px solid #111827; padding:6px 4px; width:5%; text-align:center;">#</th>
                    <th style="border:1px solid #111827; padding:6px 8px; width:48%; text-align:left;">Material Particulars / Specifications</th>
                    <th style="border:1px solid #111827; padding:6px 6px; width:10%; text-align:center;">Unit</th>
                    <th style="border:1px solid #111827; padding:6px 6px; width:12%; text-align:center;">Ordered Qty</th>
                    <th style="border:1px solid #111827; padding:6px 6px; width:12%; text-align:center;">Delivered Qty</th>
                    <th style="border:1px solid #111827; padding:6px 6px; width:13%; text-align:center;">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((it, idx) => `
                    <tr style="border-bottom:1px solid #cbd5e1; background:#ffffff;">
                      <td style="border:1px solid #111827; padding:6px 4px; text-align:center; font-weight:700;">${idx + 1}</td>
                      <td style="border:1px solid #111827; padding:6px 8px; font-weight:700; color:#111827;">${it.description}</td>
                      <td style="border:1px solid #111827; padding:6px 6px; text-align:center; font-weight:600;">${it.unit || 'Nos'}</td>
                      <td style="border:1px solid #111827; padding:6px 6px; text-align:center; font-variant-numeric:tabular-nums; font-weight:600;">${it.qty_ordered || 1}</td>
                      <td style="border:1px solid #111827; padding:6px 6px; text-align:center; font-weight:800; color:#059669; font-variant-numeric:tabular-nums;">${it.qty_delivered || 1}</td>
                      <td style="border:1px solid #111827; padding:6px 6px; text-align:center; font-size:0.75rem; color:#475569;">${it.remarks || 'Sound Condition'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Notes & Inspection Statement -->
              <div style="font-size:0.76rem; color:#475569; line-height:1.45; border-left:3px solid #0284c7; padding-left:8px; margin-bottom:1.5rem;">
                <strong>Inspection &amp; Verification Note:</strong> All items listed above have been verified, counted, and inspected prior to dispatch. The receiver confirms that the goods were delivered in satisfactory and undamaged condition.
              </div>

              <!-- Dual Signature Section -->
              <div style="display:grid; grid-template-columns:1fr 1fr; border:1px solid #111827; min-height:120px; margin-bottom:1rem;">
                <!-- Dispatched By -->
                <div style="border-right:1px solid #111827; padding:8px 12px; display:flex; flex-direction:column; justify-content:space-between;">
                  <div>
                    <div style="font-size:0.76rem; font-weight:800; color:#111827;">DISPATCHED BY (مرسل من):</div>
                    <div style="font-size:0.78rem; color:#475569; margin-top:2px;">RAYAN ENGINEERING &amp; CONTRACTING</div>
                    <div style="font-size:0.75rem; color:#64748b;">${dn.dispatched_by || 'Storekeeper / Logistics Officer'}</div>
                  </div>
                  <div style="display:flex; align-items:center; gap:12px; min-height:55px;">
                    ${dn.include_signature !== false ? `
                      <img src="/assets/docs/rayan-signature-construction.png" alt="Signature" style="height:48px; width:auto; display:block;">
                    ` : ''}
                    ${dn.include_stamp !== false ? `
                      <img src="/assets/docs/rayan-stamp-round.png" alt="Stamp" style="height:65px; width:auto; display:block;">
                    ` : ''}
                  </div>
                </div>

                <!-- Received By -->
                <div style="padding:8px 12px; display:flex; flex-direction:column; justify-content:space-between;">
                  <div>
                    <div style="font-size:0.76rem; font-weight:800; color:#111827;">RECEIVED BY (المستلم في الموقع):</div>
                    <div style="font-size:0.78rem; font-weight:700; color:#111827; margin-top:2px;">Name: ${dn.receiver_name || 'Site Supervisor'}</div>
                    <div style="font-size:0.75rem; color:#64748b;">Emirates ID: ${dn.receiver_eid || '784-XXXX-XXXXXXX-X'}</div>
                  </div>
                  <div style="border-top:1px dashed #cbd5e1; padding-top:4px; display:flex; justify-content:space-between; font-size:0.72rem; color:#64748b;">
                    <span>Receiver Signature</span>
                    <span>Date &amp; Site Stamp</span>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="text-align:center; font-size:0.72rem; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:0.4rem;">
                Official Material Transfer &amp; Delivery Document • Rayan Engineering and Contracting LLC SPC • Abu Dhabi, UAE
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
    document.body.classList.add('fin-doc-open');
  };

  proto.downloadDeliveryNoteDocument = function (dnId) {
    let dn = (this.db?.delivery_notes || []).find(n => n.id === dnId || n.dn_no === dnId);
    if (!dn) return;
    const paperHtml = document.querySelector('#fin-doc-print-modal .fin-document-paper')?.outerHTML;
    if (paperHtml) {
      const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Delivery Note - ${dn.dn_no}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body { background: #f1f5f9; padding: 2rem; display: flex; justify-content: center; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    .fin-document-paper { max-width: 820px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 8px; box-sizing: border-box; }
    @media print {
      @page { size: A4 portrait; margin: 6mm 8mm; }
      body { background: #fff; padding: 0; }
      .fin-document-paper { box-shadow: none; border-radius: 0; max-width: 100%; width: 100%; padding: 6mm 8mm !important; }
    }
  </style>
</head>
<body>
  ${paperHtml}
</body>
</html>`;
      this.downloadFile(`${dn.dn_no}_Delivery_Note.html`, fullDoc, 'text/html');
      this.showNotification(`Downloaded ${dn.dn_no} Delivery Note.`, 'success');
    }
  };

  // --- Corporate Official Letter Print Modal (Latter Editable) ---
  proto.openCustomLetterPrintModal = function (letterId, isVerifiedScan = false) {
    let ltr = (this.db?.custom_letters || []).find(l => l.id === letterId || l.ref_no === letterId);
    if (!ltr) {
      ltr = (this.db?.custom_letters || [])[0] || {};
    }

    const modalHtml = `
      <div class="fin-doc-modal-backdrop" id="fin-doc-print-modal">
        <div class="fin-doc-toolbar">
          <div class="fin-doc-toolbar-left">
            <div class="fin-doc-title-badge">
              <span>✉️</span>
              <span>Official Letter — ${ltr.ref_no || 'REC-LTR-2026-101'}</span>
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
              <button type="button" class="fin-doc-pill-btn active" onclick="window.finApp.openCustomLetterPrintModal('${ltr.id}')">Official Letter</button>
            </div>
          </div>
          <div class="fin-doc-toolbar-right">
            <button type="button" class="fin-btn-print-action fin-btn-print-primary" onclick="window.finApp.printDocument()">
              🖨️ Print / Save as PDF
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.downloadCustomLetterDocument('${ltr.id}')">
              📥 Download Document
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal(); window.finApp.openCustomLetterModal('${ltr.id}')" style="color:#f59e0b; border-color:rgba(245,158,11,0.4);">
              ✏️ Edit Letter
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal()">
              ✕ Close
            </button>
          </div>
        </div>

        <div class="fin-doc-viewport">
          <div class="fin-document-paper" style="background:#ffffff; color:#111827; padding:12mm 16mm 10mm 16mm; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing:border-box; width:100%; max-width:820px; margin:0 auto 2rem auto; box-shadow:0 4px 20px rgba(0,0,0,0.08); border-radius:4px; position:relative; min-height:1020px; display:flex; flex-direction:column; justify-content:space-between;">
            ${this.getRayanWatermark ? this.getRayanWatermark() : ''}

            <div style="position:relative; z-index:1;">
              <!-- Letterhead Header -->
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #111827; padding-bottom:1rem; margin-bottom:1.5rem;">
                <div>
                  <img src="/assets/docs/rayan-doc-logo.png" alt="RAYAN ENGINEERING" style="height:50px; width:auto; display:block; margin-bottom:4px;">
                  <div style="font-size:0.80rem; font-weight:800; color:#111827; text-transform:uppercase;">RAYAN ENGINEERING AND CONTRACTING LLC SPC</div>
                  <div style="font-size:0.75rem; color:#475569;">TRN: 100234567800003 | Mussafah M-36, Abu Dhabi, UAE</div>
                </div>
                <div style="text-align:right; font-size:0.82rem; color:#374151;">
                  <div style="font-weight:700; color:#111827;">Ref: <span style="color:#0284c7;">${ltr.ref_no}</span></div>
                  <div>Date: <strong>${this.formatDate(ltr.date)}</strong></div>
                </div>
              </div>

              <!-- Recipient & Subject -->
              <div style="margin-bottom:1.5rem; font-size:0.88rem; line-height:1.5; color:#111827;">
                ${ltr.attention ? `<div style="font-weight:700;">To: ${ltr.attention}</div>` : ''}
                ${ltr.recipient_name ? `<div style="font-weight:700;">${ltr.recipient_name}</div>` : ''}
                <div style="font-weight:800; text-transform:uppercase; font-size:0.92rem;">${ltr.recipient_company}</div>
                ${ltr.address ? `<div style="color:#475569; font-size:0.82rem;">${ltr.address}</div>` : ''}
                ${ltr.project_name ? `<div style="margin-top:8px; font-weight:700; color:#0284c7;">Project: ${ltr.project_name}</div>` : ''}
                <div style="margin-top:12px; font-size:0.92rem; font-weight:800; color:#111827; text-decoration:underline;">
                  ${ltr.subject}
                </div>
              </div>

              <!-- Body Paragraphs -->
              <div style="font-size:0.88rem; line-height:1.8; color:#111827; white-space:pre-line; text-align:justify; margin-bottom:2rem;">
                ${ltr.body_text}
              </div>

              <!-- Sign-off Block with Stamp & Signature -->
              <div style="font-size:0.88rem; color:#111827; line-height:1.5; margin-top:1.5rem;">
                <div>Sincerely / With best regards,</div>
                <div style="font-weight:800; margin-top:4px;">RAYAN ENGINEERING AND CONTRACTING LLC SPC</div>
                <div style="font-weight:800; color:#1e3a8a; margin-top:2px;">${ltr.signatory_name || 'Eng. Bakhteyar Alam'}</div>
                <div style="color:#475569; font-size:0.82rem;">${ltr.designation || 'Construction Manager'}</div>

                <div style="display:flex; align-items:center; gap:20px; margin-top:10px;">
                  ${ltr.include_signature !== false ? `
                    <img src="/assets/docs/rayan-signature-construction.png" alt="Signature" style="height:55px; width:auto; display:block;">
                  ` : ''}
                  ${ltr.include_stamp !== false ? `
                    <img src="/assets/docs/rayan-stamp-round.png" alt="Stamp" style="height:80px; width:auto; display:block;">
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- Bottom Letterhead Footer -->
            <div style="position:relative; z-index:1; border-top:1px solid #cbd5e1; padding-top:0.75rem; margin-top:2rem; font-size:0.75rem; color:#64748b; display:flex; justify-content:space-between; align-items:center;">
              <div>Hotline: +971 2 565 4497 | info@rayan-group.com</div>
              <div>www.rayan-group.com</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fin-modal-container').innerHTML = modalHtml;
    document.body.classList.add('fin-doc-open');
  };

  proto.downloadCustomLetterDocument = function (letterId) {
    let ltr = (this.db?.custom_letters || []).find(l => l.id === letterId || l.ref_no === letterId);
    if (!ltr) return;
    const paperHtml = document.querySelector('#fin-doc-print-modal .fin-document-paper')?.outerHTML;
    if (paperHtml) {
      const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Letter - ${ltr.ref_no}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { background: #f1f5f9; padding: 2rem; display: flex; justify-content: center; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    .fin-document-paper { max-width: 820px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 8px; box-sizing: border-box; }
    @media print {
      @page { size: A4 portrait; margin: 8mm 10mm; }
      body { background: #fff; padding: 0; }
      .fin-document-paper { box-shadow: none; border-radius: 0; max-width: 100%; width: 100%; padding: 8mm 10mm !important; }
    }
  </style>
</head>
<body>
  ${paperHtml}
</body>
</html>`;
      this.downloadFile(`${ltr.ref_no}_Official_Letter.html`, fullDoc, 'text/html');
      this.showNotification(`Downloaded ${ltr.ref_no} Letter.`, 'success');
    }
  };

  // ==========================================================================
  // 10. DELETION HANDLERS
  // ==========================================================================
  proto.deleteWorkCompletion = async function (certId) {
    const cert = (this.db?.work_completion_certificates || []).find(c => c.id === certId || c.cert_no === certId);
    const label = cert ? cert.cert_no : certId;
    if (!confirm(`Are you sure you want to delete Work Completion Certificate ${label}?`)) return;

    if (this.db.work_completion_certificates) {
      this.db.work_completion_certificates = this.db.work_completion_certificates.filter(c => c.id !== certId && c.cert_no !== certId);
    }
    try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (e) { }

    this.renderActiveTab();
    this.showNotification(`Work Completion Certificate ${label} deleted.`, 'info');
    await this.syncApi('delete_work_completion', { id: certId, cert_id: certId });
  };

  proto.deleteDeliveryNote = async function (dnId) {
    const dn = (this.db?.delivery_notes || []).find(n => n.id === dnId || n.dn_no === dnId);
    const label = dn ? dn.dn_no : dnId;
    if (!confirm(`Are you sure you want to delete Delivery Note ${label}?`)) return;

    if (this.db.delivery_notes) {
      this.db.delivery_notes = this.db.delivery_notes.filter(n => n.id !== dnId && n.dn_no !== dnId);
    }
    try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (e) { }

    this.renderActiveTab();
    this.showNotification(`Delivery Note ${label} deleted.`, 'info');
    await this.syncApi('delete_delivery_note', { id: dnId, dn_id: dnId });
  };

  proto.deleteUndertakingLetter = async function (letterId) {
    const ult = (this.db?.undertaking_letters || []).find(l => l.id === letterId || l.ref_no === letterId);
    const label = ult ? ult.ref_no : letterId;
    if (!confirm(`Are you sure you want to delete Undertaking Letter ${label}?`)) return;

    if (this.db.undertaking_letters) {
      this.db.undertaking_letters = this.db.undertaking_letters.filter(l => l.id !== letterId && l.ref_no !== letterId);
    }
    try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (e) { }

    this.renderActiveTab();
    this.showNotification(`Undertaking Letter ${label} deleted.`, 'info');
    await this.syncApi('delete_undertaking_letter', { id: letterId, ref_no: label });
  };

  proto.deleteCustomLetter = async function (letterId) {
    const ltr = (this.db?.custom_letters || []).find(l => l.id === letterId || l.ref_no === letterId);
    const label = ltr ? ltr.ref_no : letterId;
    if (!confirm(`Are you sure you want to delete Official Letter ${label}?`)) return;

    if (this.db.custom_letters) {
      this.db.custom_letters = this.db.custom_letters.filter(l => l.id !== letterId && l.ref_no !== letterId);
    }
    try { localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db)); } catch (e) { }

    this.renderActiveTab();
    this.showNotification(`Letter ${label} deleted.`, 'info');
    await this.syncApi('delete_custom_letter', { id: letterId, ref_no: label });
  };

  // ==========================================================================
  // 11. CSV EXPORT UTILITIES (WITH EXCEL TEXT QUOTING APOSTROPHE)
  // ==========================================================================
  const triggerCSVDownload = (finApp, filename, csvContent) => {
    const finalContent = csvContent.startsWith('\uFEFF') ? csvContent : ('\uFEFF' + csvContent);
    if (typeof finApp.downloadFile === 'function') {
      finApp.downloadFile(filename, finalContent, 'text/csv;charset=utf-8;');
    } else {
      const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  proto.exportWorkCompletionCSV = function () {
    const certs = this.db?.work_completion_certificates || [];
    if (!certs.length) {
      this.showNotification('No completion certificates available to export.', 'warning');
      return;
    }
    const headers = ['Certificate Number', 'Reference Number', 'Date', 'Time', 'Client / Subcontractor', 'Contact Person', 'Main Contractor', 'Project', 'PO / Agreement Ref', 'Scope Description', 'Status'];
    const rows = certs.map(c => [
      `'${c.cert_no || ''}`,
      `'${c.reference_no || ''}`,
      `'${c.date || ''}`,
      `"${(c.time || '').replace(/"/g, '""')}"`,
      `"${(c.client_name || '').replace(/"/g, '""')}"`,
      `"${(c.contact_person || '').replace(/"/g, '""')}"`,
      `"${(c.main_client || '').replace(/"/g, '""')}"`,
      `"${(c.project_name || '').replace(/"/g, '""')}"`,
      `'${c.subcontract_agreement || c.po_no || ''}`,
      `"${(c.scope_description || '').replace(/"/g, '""')}"`,
      `"${c.status || 'Approved'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    triggerCSVDownload(this, `Work_Completion_Certificates_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
    this.showNotification('Work Completion Certificates exported to CSV successfully.', 'success');
  };

  proto.exportDeliveryNotesCSV = function () {
    const notes = this.db?.delivery_notes || [];
    if (!notes.length) {
      this.showNotification('No delivery notes available to export.', 'warning');
      return;
    }
    const headers = ['DN Number', 'Reference Number', 'Date', 'Time', 'Consignee / Client', 'Project Name', 'Site Location', 'Vehicle Number', 'Driver Name', 'Driver Contact', 'Items Count', 'Receiver Name', 'Status'];
    const rows = notes.map(n => [
      `'${n.dn_no || ''}`,
      `'${n.reference_no || n.dn_no || ''}`,
      `'${n.date || ''}`,
      `"${(n.time || '').replace(/"/g, '""')}"`,
      `"${(n.client_name || '').replace(/"/g, '""')}"`,
      `"${(n.project_name || '').replace(/"/g, '""')}"`,
      `"${(n.site_location || '').replace(/"/g, '""')}"`,
      `'${n.vehicle_no || ''}`,
      `"${(n.driver_name || '').replace(/"/g, '""')}"`,
      `'${n.driver_contact || ''}`,
      `'${(n.items || []).length}`,
      `"${(n.receiver_name || '').replace(/"/g, '""')}"`,
      `"${n.status || 'Delivered'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    triggerCSVDownload(this, `Delivery_Notes_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
    this.showNotification('Delivery Notes exported to CSV successfully.', 'success');
  };

  proto.exportUndertakingLettersCSV = function () {
    const letters = this.db?.undertaking_letters || [];
    if (!letters.length) {
      this.showNotification('No undertaking letters available to export.', 'warning');
      return;
    }
    const headers = ['Reference Number', 'Date', 'Attention', 'Client / Contractor', 'Project', 'Activity Type', 'Workers Count', 'Responsible Person', 'Designation', 'Status'];
    const rows = letters.map(l => [
      `'${l.ref_no || ''}`,
      `'${l.date || ''}`,
      `"${(l.attention || '').replace(/"/g, '""')}"`,
      `"${(l.client_name || l.attention_company || '').replace(/"/g, '""')}"`,
      `"${(l.project_name || '').replace(/"/g, '""')}"`,
      `"${(l.activity_type || '').replace(/"/g, '""')}"`,
      `'${(l.employees || []).length}`,
      `"${(l.responsible_person || '').replace(/"/g, '""')}"`,
      `"${(l.designation || '').replace(/"/g, '""')}"`,
      `"${l.status || 'Active'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    triggerCSVDownload(this, `Undertaking_Letters_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
    this.showNotification('Undertaking Letters exported to CSV successfully.', 'success');
  };

  proto.exportLettersCSV = function () {
    const letters = this.db?.custom_letters || [];
    if (!letters.length) {
      this.showNotification('No corporate letters available to export.', 'warning');
      return;
    }
    const headers = ['Reference Number', 'Date', 'Attention', 'Recipient Company', 'Project Reference', 'Subject', 'Signatory Name', 'Designation', 'Status'];
    const rows = letters.map(l => [
      `'${l.ref_no || ''}`,
      `'${l.date || ''}`,
      `"${(l.attention || '').replace(/"/g, '""')}"`,
      `"${(l.recipient_company || '').replace(/"/g, '""')}"`,
      `"${(l.project_name || '').replace(/"/g, '""')}"`,
      `"${(l.subject || '').replace(/"/g, '""')}"`,
      `"${(l.signatory_name || '').replace(/"/g, '""')}"`,
      `"${(l.designation || '').replace(/"/g, '""')}"`,
      `"${l.status || 'Issued'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    triggerCSVDownload(this, `Corporate_Letters_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
    this.showNotification('Corporate Letters exported to CSV successfully.', 'success');
  };
}

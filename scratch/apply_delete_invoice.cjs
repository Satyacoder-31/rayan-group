const fs = require('fs');

// 1. UPDATE src/scripts/finance.js
let js = fs.readFileSync('src/scripts/finance.js', 'utf8').replace(/\r\n/g, '\n');

// 1A. Add Delete button in renderInvoicesTab
const oldRowAction = `          \${inv.status !== 'void' && inv.status !== 'draft' && this.hasPermission('create_credit_note') ? \`
            <button type="button" class="fin-btn-row-action" onclick="window.finApp.openCreateCreditNoteModal('\${inv.id}')" title="Issue Credit Note">Cr. Note</button>
          \` : ''}
        </td>`;

const newRowAction = `          \${inv.status !== 'void' && inv.status !== 'draft' && this.hasPermission('create_credit_note') ? \`
            <button type="button" class="fin-btn-row-action" onclick="window.finApp.openCreateCreditNoteModal('\${inv.id}')" title="Issue Credit Note">Cr. Note</button>
          \` : ''}
          <button type="button" class="fin-btn-row-action" style="color:#ef4444;" onclick="window.finApp.deleteInvoice('\${inv.id}')" title="Delete Tax Invoice">Delete</button>
        </td>`;

if (js.includes(oldRowAction)) {
  js = js.replace(oldRowAction, newRowAction);
  console.log('✓ 1A. Added Delete button in renderInvoicesTab');
} else {
  console.error('✗ 1A. oldRowAction not found');
}

// 1B. Add Delete button in openInvoicePrintModal
const oldPrintActions = `            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal(); window.finApp.openEditInvoiceModal('\${inv.id || \'\'}')" style="color:#38bdf8; border-color:rgba(56,189,248,0.4);">
              ✏️ Edit Invoice
            </button>`;

const newPrintActions = `            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal(); window.finApp.openEditInvoiceModal('\${inv.id || \'\'}')" style="color:#38bdf8; border-color:rgba(56,189,248,0.4);">
              ✏️ Edit Invoice
            </button>
            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal(); window.finApp.deleteInvoice('\${inv.id || \'\'}')" style="color:#ef4444; border-color:rgba(239,68,68,0.4);">
              🗑️ Delete
            </button>`;

if (js.includes(oldPrintActions)) {
  js = js.replace(oldPrintActions, newPrintActions);
  console.log('✓ 1B. Added Delete button in openInvoicePrintModal');
} else {
  console.error('✗ 1B. oldPrintActions not found');
}

// 1C. Add Delete button in openEditInvoiceModal footer
const oldEditFooter = `              <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1.5rem;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-edit-invoice')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save &amp; Update Invoice (\${currLabel}) &rarr;</button>
              </div>`;

const newEditFooter = `              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem;">
                <button type="button" class="fin-btn-quick" style="background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.4); cursor:pointer;" onclick="window.finApp.closeModal('modal-edit-invoice'); window.finApp.deleteInvoice('\${inv.id || \'\'}')">🗑️ Delete Invoice</button>
                <div style="display:flex; gap:0.5rem;">
                  <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-edit-invoice')">Cancel</button>
                  <button type="submit" class="fin-btn-quick primary">Save &amp; Update Invoice (\${currLabel}) &rarr;</button>
                </div>
              </div>`;

if (js.includes(oldEditFooter)) {
  js = js.replace(oldEditFooter, newEditFooter);
  console.log('✓ 1C. Added Delete button in openEditInvoiceModal footer');
} else {
  console.error('✗ 1C. oldEditFooter not found');
}

// 1D. Add async deleteInvoice method
const deleteMethodTarget = `  // 10. PROCUREMENT & DISBURSEMENT ACTION HANDLERS
  async deleteBill(billId) {`;

const deleteInvoiceMethod = `  // 9B. INVOICE DELETE ACTION HANDLER
  async deleteInvoice(invoiceId) {
    const inv = (this.db?.invoices || []).find(i => i.id === invoiceId || i.invoice_no === invoiceId);
    const label = inv ? inv.invoice_no : invoiceId;
    if (!confirm(\`Are you sure you want to delete Tax Invoice \${label}?\`)) return;

    try {
      await this.syncApi('delete_invoice', { invoice_id: invoiceId, id: invoiceId });
    } catch (err) {
      console.warn('API sync warning for delete_invoice:', err);
    }

    if (this.db.invoices) {
      this.db.invoices = this.db.invoices.filter(i => i.id !== invoiceId && i.invoice_no !== invoiceId);
    }

    // Also remove any allocations in customer receipts pointing to this invoice
    if (this.db.customer_receipts) {
      this.db.customer_receipts.forEach(rcp => {
        if (rcp.allocations && Array.isArray(rcp.allocations)) {
          rcp.allocations = rcp.allocations.filter(a => a.invoice_id !== invoiceId && a.invoice_no !== invoiceId && a.invoice_no !== label);
        }
      });
    }

    this.normalizeAllBalances();
    try {
      localStorage.setItem('rayan_fin_db_cache', JSON.stringify(this.db));
    } catch (e) {}

    this.showNotification(\`Tax Invoice \${label} deleted successfully.\`, 'info');
    this.renderActiveTab();
  }

  // 10. PROCUREMENT & DISBURSEMENT ACTION HANDLERS
  async deleteBill(billId) {`;

if (js.includes(deleteMethodTarget)) {
  js = js.replace(deleteMethodTarget, deleteInvoiceMethod);
  console.log('✓ 1D. Added async deleteInvoice method in FinanceApp');
} else {
  console.error('✗ 1D. deleteMethodTarget not found');
}

// 1E. Bump CURRENT_DB_VERSION to v2026_clean_v18
js = js.replace("const CURRENT_DB_VERSION = 'v2026_clean_v17';", "const CURRENT_DB_VERSION = 'v2026_clean_v18';");
console.log('✓ 1E. Bumped DB version to v2026_clean_v18');

fs.writeFileSync('src/scripts/finance.js', js, 'utf8');

// 2. UPDATE public/api/finance.php
let php = fs.readFileSync('public/api/finance.php', 'utf8').replace(/\r\n/g, '\n');

const oldHydrateCondition = `if (empty($data['invoices']) || count($data['invoices']) < 50) {`;
const newHydrateCondition = `if (empty($data['invoices'])) {`;

if (php.includes(oldHydrateCondition)) {
  php = php.replace(oldHydrateCondition, newHydrateCondition);
  console.log('✓ 2. Updated hydration condition in public/api/finance.php');
} else {
  console.warn('Note: oldHydrateCondition not found or already updated');
}

fs.writeFileSync('public/api/finance.php', php, 'utf8');

console.log('\nAll updates applied successfully!');


const fs = require('fs');

let js = fs.readFileSync('src/scripts/finance.js', 'utf8').replace(/\r\n/g, '\n');

// 1. Check target in renderInvoicesTab
const targetRowAction = `          \${inv.status !== 'void' && inv.status !== 'draft' && this.hasPermission('create_credit_note') ? \`
            <button type="button" class="fin-btn-row-action" onclick="window.finApp.openCreateCreditNoteModal('\${inv.id}')" title="Issue Credit Note">Cr. Note</button>
          \` : ''}
        </td>`;

console.log('Found targetRowAction (with \\n):', js.includes(targetRowAction));

// 2. Check target in openInvoicePrintModal
const targetPrintActions = `            <button type="button" class="fin-btn-print-action fin-btn-print-ghost" onclick="window.finApp.closeDocPrintModal(); window.finApp.openEditInvoiceModal('\${inv.id || \'\'}')" style="color:#38bdf8; border-color:rgba(56,189,248,0.4);">
              ✏️ Edit Invoice
            </button>`;

console.log('Found targetPrintActions (with \\n):', js.includes(targetPrintActions));

// 3. Check target in openEditInvoiceModal footer
const p = js.indexOf('modal-edit-invoice');
const endForm = js.indexOf('</form>', p);
console.log('Snippet around edit footer:\n', js.slice(endForm - 250, endForm + 50));

// 4. Check target for deleteInvoice method insertion
const pBill = js.indexOf('async deleteBill(');
console.log('Snippet around deleteBill:\n', js.slice(pBill - 100, pBill + 50));

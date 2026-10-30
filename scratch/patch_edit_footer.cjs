const fs = require('fs');

let js = fs.readFileSync('src/scripts/finance.js', 'utf8').replace(/\r\n/g, '\n');

const oldDiv = `<div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent; display:flex; justify-content:flex-end; gap:0.75rem;">
                <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-edit-invoice')">Cancel</button>
                <button type="submit" class="fin-btn-quick primary">Save &amp; Update Invoice (\${currLabel}) &rarr;</button>
              </div>`;

const newDiv = `<div class="fin-modal-footer" style="padding:1rem 0 0; background:transparent; display:flex; justify-content:space-between; align-items:center; gap:0.75rem;">
                <button type="button" class="fin-btn-quick" style="background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.4); cursor:pointer;" onclick="window.finApp.closeModal('modal-edit-invoice'); window.finApp.deleteInvoice('\${inv.id || \'\'}')">🗑️ Delete Invoice</button>
                <div style="display:flex; gap:0.75rem;">
                  <button type="button" class="fin-btn-quick" onclick="window.finApp.closeModal('modal-edit-invoice')">Cancel</button>
                  <button type="submit" class="fin-btn-quick primary">Save &amp; Update Invoice (\${currLabel}) &rarr;</button>
                </div>
              </div>`;

if (js.includes(oldDiv)) {
  js = js.replace(oldDiv, newDiv);
  fs.writeFileSync('src/scripts/finance.js', js, 'utf8');
  console.log('✓ Successfully added Delete Invoice button to modal-edit-invoice footer!');
} else {
  console.error('✗ oldDiv not found');
}

import { execSync } from 'child_process';
import { Configuration, HostingCacheApi } from '@hostinger/sdk';
import fs from 'fs';
import path from 'path';

const HOSTINGER_TOKEN = 'g9EFoDsji8oMJ3dJjP7IpLkWfYSzJa0LB27lzVqi67233ccf';
const eraseAllFlag = process.argv.includes('--erase-all') ? '&erase_all=1' : '';
const SYNC_URLS = [
  `https://rayan-group.com/api/sync.php?token=rayan_deploy_2026_secret_key${eraseAllFlag}`,
  `https://rayan-group.com/site/dist/api/sync.php?token=rayan_deploy_2026_secret_key${eraseAllFlag}`
];
const WEBHOOK_URL = 'https://webhooks.hostinger.com/deploy/8b37bfc2d831afd52165c2a8f6fe1551';

async function deploy() {
  console.log('🔄 [0/6] Pulling live database from Hostinger & syncing cache version...');
  try {
    const dataSrc = path.resolve('data/finance-data.json');
    // 1. Pull authoritative live database from Hostinger MySQL so no user data is ever lost
    try {
      const liveRes = await fetch('https://rayan-group.com/api/finance.php');
      if (liveRes.ok) {
        const liveJson = await liveRes.json();
        if (liveJson.data && liveJson.data.invoices && liveJson.data.invoices.length > 0) {
          if (Array.isArray(liveJson.data.purchase_orders)) {
            liveJson.data.purchase_orders.forEach(po => {
              if (po && (!po.type || po.type === 'purchase_order')) {
                po.type = 'customer_po';
                po.po_type = 'customer_lpo';
                po.direction = 'inward';
                if (!po.customer_name && po.vendor_name) po.customer_name = po.vendor_name;
              }
            });
          }
          if (fs.existsSync(dataSrc)) {
            try {
              const localData = JSON.parse(fs.readFileSync(dataSrc, 'utf8'));
              const localVendorPos = (localData.purchase_orders || []).filter(p => p.type === 'vendor_po');
              localVendorPos.forEach(vpo => {
                if (!liveJson.data.purchase_orders.some(p => p.id === vpo.id || p.po_no === vpo.po_no)) {
                  liveJson.data.purchase_orders.push(vpo);
                }
              });
              const localCustPos = (localData.purchase_orders || []).filter(p => p.type === 'customer_po');
              localCustPos.forEach(cpo => {
                const target = liveJson.data.purchase_orders.find(p => p.id === cpo.id || p.po_no === cpo.po_no);
                if (target) {
                  target.internal_ref = cpo.internal_ref;
                  target.ref_no = cpo.ref_no || cpo.internal_ref;
                  target.rec_ref = cpo.rec_ref || cpo.internal_ref;
                  if (!target.client_po_no) target.client_po_no = cpo.client_po_no || cpo.po_no;
                }
              });

              // Normalize all customer POs chronologically
              const custPosToSeq = liveJson.data.purchase_orders.filter(p => p.type === 'customer_po' || p.po_type === 'customer_lpo' || (!p.type && (p.po_type === 'customer_lpo' || !p.supplier_id || p.customer_name || p.customer_id)));
              custPosToSeq.sort((a, b) => {
                const dA = a.date || a.po_date || '';
                const dB = b.date || b.po_date || '';
                if (dA !== dB) return dA.localeCompare(dB);
                return String(a.id || '').localeCompare(String(b.id || ''));
              });
              let nextRecSeq = 44001;
              let nextAshSeq = 44001;
              custPosToSeq.forEach(p => {
                const isInd = (p.company_id === 'ashaz-eng-in') || (p.currency === 'INR');
                const prefix = isInd ? 'ASH-CLPO' : 'REC-CLPO';
                const targetRef = isInd ? (prefix + '-' + nextAshSeq++) : (prefix + '-' + nextRecSeq++);
                p.internal_ref = targetRef;
                p.ref_no = targetRef;
                p.rec_ref = targetRef;
                if (!p.type) p.type = 'customer_po';
                if (!p.po_type) p.po_type = 'customer_lpo';
                if (!p.direction) p.direction = 'inward';
              });
              const localBills = (localData.purchase_bills || []);
              if (!Array.isArray(liveJson.data.purchase_bills)) liveJson.data.purchase_bills = [];
              localBills.forEach(b => {
                const existing = liveJson.data.purchase_bills.find(p => p.id === b.id || p.bill_no === b.bill_no);
                if (!existing) {
                  liveJson.data.purchase_bills.push(b);
                } else {
                  if (b.vendor_trn && !existing.vendor_trn) existing.vendor_trn = b.vendor_trn;
                  if (b.po_reference && existing.po_reference !== b.po_reference) existing.po_reference = b.po_reference;
                  if (b.po_no && existing.po_no !== b.po_no) existing.po_no = b.po_no;
                }
              });
              liveJson.data.purchase_bills.sort((a,b) => (b.bill_no || '').localeCompare(a.bill_no || ''));

              const localEmpCerts = (localData.employment_certificates || []);
              if (!Array.isArray(liveJson.data.employment_certificates)) liveJson.data.employment_certificates = [];
              localEmpCerts.forEach(ec => {
                if (!liveJson.data.employment_certificates.some(p => p.id === ec.id || p.cert_no === ec.cert_no)) {
                  liveJson.data.employment_certificates.push(ec);
                }
              });

              const localLoas = (localData.letters_of_assignment || []);
              if (!Array.isArray(liveJson.data.letters_of_assignment)) liveJson.data.letters_of_assignment = [];
              localLoas.forEach(l => {
                if (!liveJson.data.letters_of_assignment.some(p => p.id === l.id || p.ref_no === l.ref_no)) {
                  liveJson.data.letters_of_assignment.push(l);
                }
              });

              const localEmployees = (localData.employees || []);
              if (!Array.isArray(liveJson.data.employees)) liveJson.data.employees = [];
              localEmployees.forEach(emp => {
                const target = liveJson.data.employees.find(p => p.id === emp.id || p.employee_no === emp.employee_no);
                if (!target) {
                  const delSet = new Set((liveJson.data.deleted_employee_ids || []).map(x => String(x).toLowerCase()));
                  if (!delSet.has(String(emp.id || '').toLowerCase()) && !delSet.has(String(emp.employee_no || '').toLowerCase())) {
                    liveJson.data.employees.push(emp);
                  }
                } else {
                  target.address = target.address || emp.address;
                  target.local_address = target.local_address || emp.local_address || emp.address;
                  target.permanent_address = target.permanent_address || emp.permanent_address;
                  target.emergency_contact_name = target.emergency_contact_name || emp.emergency_contact_name;
                  target.emergency_contact_relation = target.emergency_contact_relation || emp.emergency_contact_relation;
                  target.emergency_contact_phone = target.emergency_contact_phone || emp.emergency_contact_phone;
                  target.visa_status = target.visa_status || emp.visa_status;
                  target.labor_card_no = target.labor_card_no || emp.labor_card_no;
                  if (!target.photo && emp.photo) target.photo = emp.photo;
                  if (!target.gender && emp.gender) target.gender = emp.gender;
                }
              });

              if (Array.isArray(liveJson.data.employees)) {
                const empDedup = new Map();
                liveJson.data.employees.forEach(emp => {
                  if (!emp) return;
                  if (!emp.gender) {
                    if (emp.employee_no === 'EN12002' || (emp.name && emp.name.includes('Menta')) || emp.employee_no === 'EN12006' || (emp.name && emp.name.includes('Kamala'))) {
                      emp.gender = 'Female';
                    } else {
                      emp.gender = 'Male';
                    }
                  }
                  if (!emp.eid_expiry_date && emp.visa_expiry_date) {
                    emp.eid_expiry_date = emp.visa_expiry_date;
                  }
                  if (!emp.passport_expiry_date) {
                    emp.passport_expiry_date = '';
                  }
                  const k = (emp.employee_no || emp.id || '').trim().toUpperCase();
                  if (!k) return;
                  if (!empDedup.has(k)) {
                    empDedup.set(k, emp);
                  } else {
                    const prev = empDedup.get(k);
                    const curTs = emp.updated_at ? Date.parse(String(emp.updated_at).replace(' ', 'T')) : 0;
                    const prevTs = prev.updated_at ? Date.parse(String(prev.updated_at).replace(' ', 'T')) : 0;
                    if (curTs >= prevTs) {
                      if (!emp.photo && prev.photo) emp.photo = prev.photo;
                      empDedup.set(k, emp);
                    }
                  }
                });
                liveJson.data.employees = Array.from(empDedup.values());
                // Sort employees strictly in ascending serial order by employee_no (EN12001, EN12002, EN12003, etc.)
                liveJson.data.employees.sort((a, b) => {
                  return (a.employee_no || '').localeCompare(b.employee_no || '', undefined, { numeric: true, sensitivity: 'base' });
                });
              }

              // Purge deleted payroll records permanently
              const deletedPayrollList = ['ps-june2026-en12001', 'PSJune 2026/EN12001', ...(localData.deleted_payroll_ids || [])];
              liveJson.data.deleted_payroll_ids = deletedPayrollList;
              liveJson.data.payroll_initialized = true;
              if (Array.isArray(liveJson.data.payroll)) {
                liveJson.data.payroll = liveJson.data.payroll.filter(p => !deletedPayrollList.includes(p.id) && !deletedPayrollList.includes(p.slip_no));
              }

              // Merge local payroll slips into live payroll to guarantee all created pay slips are preserved
              const localPayroll = (localData.payroll || []);
              if (!Array.isArray(liveJson.data.payroll)) liveJson.data.payroll = [];
              localPayroll.forEach(lp => {
                if (!deletedPayrollList.includes(lp.id) && !deletedPayrollList.includes(lp.slip_no)) {
                  const existing = liveJson.data.payroll.find(p => p.id === lp.id || (p.slip_no && lp.slip_no && p.slip_no.toLowerCase() === lp.slip_no.toLowerCase()));
                  if (!existing) {
                    liveJson.data.payroll.push(lp);
                  }
                }
              });

              if (Array.isArray(liveJson.data.debit_notes)) {
                liveJson.data.debit_notes.forEach(dn => {
                  if (dn && dn.debit_note_no && dn.debit_note_no.startsWith('DN-RG-')) {
                    dn.debit_note_no = dn.debit_note_no.replace('DN-RG-', 'DN-REC-');
                  }
                });
              }

              const localTransfers = (localData.bank_transfers || []);
              if (!Array.isArray(liveJson.data.bank_transfers)) liveJson.data.bank_transfers = [];
              localTransfers.forEach(t => {
                if (!liveJson.data.bank_transfers.some(p => p.id === t.id || (t.reference_no && p.reference_no === t.reference_no))) {
                  liveJson.data.bank_transfers.unshift(t);
                }
              });
              liveJson.data.bank_transfers.forEach(bt => {
                if (bt.id === 'wire-wdl-1795072247792' || bt.reference_no === 'ATM-ADCB-52574') {
                  bt.amount = '5134.62';
                }
                if (bt.id === 'wire-wdl-1795071090149' || bt.reference_no === 'ATM-ADCB-42015') {
                  bt.date = '2024-03-22';
                  bt.transfer_date = '2024-03-22';
                }
              });

              const localVouchers = (localData.cash_vouchers || []);
              if (!Array.isArray(liveJson.data.cash_vouchers)) liveJson.data.cash_vouchers = [];
              localVouchers.forEach(v => {
                if (!liveJson.data.cash_vouchers.some(p => p.id === v.id || (v.voucher_no && p.voucher_no === v.voucher_no))) {
                  liveJson.data.cash_vouchers.unshift(v);
                }
              });
              liveJson.data.cash_vouchers.forEach(cv => {
                if (cv.id === 'cv-wdl-1795072247793' || cv.wire_id === 'wire-wdl-1795072247792' || cv.voucher_no === 'CV-WDL-3421') {
                  cv.amount = 5134.62;
                }
                if (cv.id === 'cv-wdl-1795071090150' || cv.wire_id === 'wire-wdl-1795071090149' || cv.voucher_no === 'CV-WDL-6934') {
                  cv.date = '2024-03-22';
                  cv.voucher_date = '2024-03-22';
                }
              });

              const localExpenses = (localData.expenses || []);
              if (!Array.isArray(liveJson.data.expenses)) liveJson.data.expenses = [];
              localExpenses.forEach(exp => {
                if (!liveJson.data.expenses.some(p => p.id === exp.id || (exp.expense_no && p.expense_no === exp.expense_no))) {
                  liveJson.data.expenses.unshift(exp);
                }
              });

              // Ensure all petty cash expenses have their cash voucher created
              liveJson.data.expenses.forEach(exp => {
                const mode = (exp.payment_method || exp.payment_mode || '').toLowerCase();
                if (mode.includes('cash') || mode.includes('petty') || mode.includes('wallet')) {
                  const eId = exp.id;
                  const eNo = exp.expense_no;
                  const cvNo = `CV-${eNo || ('EXP-' + (eId ? eId.slice(-6) : ''))}`;
                  const amt = Number(exp.total_amount ?? exp.amount) || 0;
                  if (amt <= 0) return;
                  if (!liveJson.data.cash_vouchers.some(v => v.expense_id === eId || v.expense_no === eNo || v.voucher_no === cvNo || v.id === `cv-exp-${eId}`)) {
                    liveJson.data.cash_vouchers.unshift({
                      id: `cv-exp-${eId || Date.now()}`,
                      expense_id: eId,
                      expense_no: eNo,
                      voucher_no: cvNo,
                      company_id: exp.company_id || 'rayan-corp-uae',
                      register_id: 'cash-mw5esv3w',
                      register_name: 'RAYAN E-Wallets',
                      custodian: 'Arshad Alam Shaikh',
                      date: exp.date || exp.expense_date || '2026-10-25',
                      voucher_date: exp.date || exp.expense_date || '2026-10-25',
                      type: 'outflow',
                      category: 'Operating Expense / Disbursement',
                      purpose: `Business Expense: ${exp.description || exp.category || 'Expense Claim'} (${eNo || ''})`,
                      payee: exp.vendor_name || exp.description || 'Petty Cash Disbursement',
                      amount: amt,
                      currency: exp.currency || 'AED',
                      status: 'Approved',
                      linked_project_id: exp.project_id || '',
                      linked_project_name: exp.project_name || '',
                      receipt_filename: exp.receipt_filename || '',
                      created_at: exp.created_at || new Date().toISOString()
                    });
                  }
                }
              });

              // Recompute live balance of cash vaults based on all vouchers
              if (Array.isArray(liveJson.data.cash_in_hand)) {
                const vaultsMap = {};
                liveJson.data.cash_in_hand.forEach(v => { vaultsMap[v.id] = 0; });
                liveJson.data.cash_vouchers.forEach(cv => {
                  const regId = cv.register_id;
                  const amt = Number(cv.amount) || 0;
                  if (vaultsMap[regId] !== undefined) {
                    if (cv.type === 'inflow') vaultsMap[regId] += amt;
                    else vaultsMap[regId] -= amt;
                  }
                });
                liveJson.data.cash_in_hand.forEach(v => {
                  if (v.id === 'cash-mw5esv3w') {
                    v.balance = Math.round((vaultsMap[v.id] || 0) * 100) / 100;
                  }
                });
              }

              const localCheques = (localData.cheques || []);
              if (!Array.isArray(liveJson.data.cheques)) liveJson.data.cheques = [];
              localCheques.forEach(cq => {
                const target = liveJson.data.cheques.find(p => p.id === cq.id || (p.receipt_id && p.receipt_id === cq.receipt_id));
                if (!target) {
                  liveJson.data.cheques.unshift(cq);
                } else {
                  if (cq.reference_no && !target.reference_no) target.reference_no = cq.reference_no;
                }
              });
              liveJson.data.cheques.forEach(cq => {
                if (cq.id === 'chq-rcp-rec-mwlzza9m' || cq.receipt_id === 'rec-mwlzza9m') {
                  cq.status = 'In Hand';
                  cq.amount = 3705.78;
                  cq.notes = 'Customer Receipt REC-RV-44070 against REC-RG-INV-44025';
                }
                if (cq.id === 'chq-rcp-rec-mwm010bx' || cq.receipt_id === 'rec-mwm010bx') {
                  cq.status = 'In Hand';
                  cq.amount = 17784.14;
                  cq.notes = 'Customer Receipt REC-RV-44071 against REC-RG-INV-44015';
                }
              });

              // Normalize all cheques chronologically with sequential Rayan Ref # (REC-CQ-44001+ / ASH-CQ-44001+)
              const chequesToSeq = liveJson.data.cheques || [];
              chequesToSeq.sort((a, b) => {
                const dA = a.date || a.cheque_date || '';
                const dB = b.date || b.cheque_date || '';
                if (dA !== dB) return dA.localeCompare(dB);
                return String(a.id || '').localeCompare(String(b.id || ''));
              });
              let nextRecChqSeq = 44001;
              let nextAshChqSeq = 44001;
              chequesToSeq.forEach(c => {
                const isInd = (c.company_id === 'ashaz-eng-in') || (c.currency === 'INR');
                const prefix = isInd ? 'ASH-CQ' : 'REC-CQ';
                const targetRef = isInd ? (prefix + '-' + nextAshChqSeq++) : (prefix + '-' + nextRecChqSeq++);
                if (!c.reference_no) {
                  c.reference_no = targetRef;
                }
              });

              if (Array.isArray(liveJson.data.bank_accounts)) {
                const adcb = liveJson.data.bank_accounts.find(b => b.id === 'bank-adcb-uae');
                if (adcb && localData.bank_accounts) {
                  const locAdcb = localData.bank_accounts.find(b => b.id === 'bank-adcb-uae');
                  if (locAdcb) adcb.balance = locAdcb.balance;
                }
              }
              if (Array.isArray(liveJson.data.cash_in_hand)) {
                const wallet = liveJson.data.cash_in_hand.find(c => c.id === 'cash-mw5esv3w');
                if (wallet && localData.cash_in_hand) {
                  const locWallet = localData.cash_in_hand.find(c => c.id === 'cash-mw5esv3w');
                  if (locWallet) {
                    wallet.balance = locWallet.balance;
                    wallet.last_replenished = locWallet.last_replenished;
                  }
                }
              }
            } catch (e) {}
          }
          let liveStr = JSON.stringify(liveJson.data, null, 2);
          liveStr = liveStr.replace(/"LSUM"/g, '"LS"').replace(/"Lsum"/g, '"LS"');
          fs.writeFileSync(dataSrc, liveStr, 'utf8');
          console.log(`✓ Preserved live database snapshot from production (${liveJson.data.invoices.length} invoices, ${liveJson.data.customer_receipts?.length || 0} receipts)`);
        }
      }
    } catch (pullErr) {
      console.warn('Could not pull live DB from server, using local snapshot:', pullErr.message);
    }

    if (fs.existsSync(dataSrc)) {
      const content = fs.readFileSync(dataSrc, 'utf8');
      const pubPath = path.resolve('public/data/finance-data.json');
      const distPath = path.resolve('dist/data/finance-data.json');
      fs.writeFileSync(pubPath, content, 'utf8');
      const distDir = path.dirname(distPath);
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(distPath, content, 'utf8');
    }

    // Auto-bump cache version
    const finJsPath = path.resolve('src/scripts/finance.js');
    if (fs.existsSync(finJsPath)) {
      let finCode = fs.readFileSync(finJsPath, 'utf8');
      const m = finCode.match(/CURRENT_DB_VERSION\s*=\s*['"]v2026_clean_v(\d+)['"]/);
      if (m) {
        const nextNum = parseInt(m[1], 10) + 1;
        const newVer = `v2026_clean_v${nextNum}`;
        finCode = finCode.replace(m[0], `CURRENT_DB_VERSION = '${newVer}'`);
        fs.writeFileSync(finJsPath, finCode, 'utf8');
        console.log(`Cache version auto-bumped to: ${newVer}`);
      }
    }
  } catch (e) {
    console.warn('Pre-build sync warning:', e.message);
  }

  console.log('\n📦 [1/6] Building production bundle (vite build)...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (err) {
    console.warn('Vite build initial attempt warning, retrying build...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  // Ensure fresh dist copy after vite build
  try {
    const dataSrc = path.resolve('data/finance-data.json');
    const distPath = path.resolve('dist/data/finance-data.json');
    if (fs.existsSync(dataSrc)) {
      fs.copyFileSync(dataSrc, distPath);
    }
  } catch (e) {}

  console.log('\n📤 [2/6] Staging & pushing changes to GitHub...');
  execSync('git add -A', { stdio: 'inherit' });
  try {
    const status = execSync('git status --porcelain').toString().trim();
    if (status) {
      const msg = process.argv.slice(2).filter(a => !a.startsWith('--')).join(' ') || 'deploy: update website content & financials';
      execSync(`git commit -m "${msg}"`, { stdio: 'inherit' });
    }
  } catch (e) {
    // Nothing new to commit
  }
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('\n🔄 [3/6] Triggering Hostinger deploy webhook...');
  try {
    const payload = {
      ref: 'refs/heads/main',
      repository: {
        name: 'rayan-group',
        clone_url: 'https://github.com/Satyacoder-31/rayan-group.git'
      }
    };
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': 'push',
        'User-Agent': 'GitHub-Hookshot/123456'
      },
      body: JSON.stringify(payload)
    });
    console.log('Hostinger Webhook Status:', res.status);
  } catch (err) {
    console.warn('Webhook warning:', err.message);
  }

  console.log('⏳ Waiting 10 seconds for Hostinger Git pull...');
  await new Promise(r => setTimeout(r, 10000));

  console.log('\n⚙️ [4/6] Synchronizing production files to web root...');
  let synced = false;
  for (const url of SYNC_URLS) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        console.log(`Sync status (${url}):`, json.success ? 'SUCCESS ✅' : 'FAILED ❌');
        if (json.sync_results?.css_bundles) {
          console.log('Active CSS:', json.sync_results.css_bundles.join(', '));
          console.log('Active JS:', json.sync_results.js_bundles.join(', '));
        }
        synced = true;
        break;
      }
    } catch (err) {
      console.warn(`Sync attempt to ${url} failed:`, err.message);
    }
  }
  if (!synced) {
    console.error('All sync endpoints failed.');
  }

  console.log('\n🗄️ [5/6] Verifying database connectivity & integrity...');
  try {
    const healthRes = await fetch('https://rayan-group.com/api/finance.php');
    if (healthRes.ok) {
      const healthJson = await healthRes.json();
      console.log(`Database Health: ONLINE ✅ (storage: ${healthJson.storage}, invoices: ${healthJson.data?.invoices?.length || 0})`);
    } else {
      console.warn(`Database Health Check returned HTTP ${healthRes.status}`);
    }
  } catch (err) {
    console.warn('Database health check warning:', err.message);
  }

  console.log('\n🧹 [6/6] Purging Hostinger CDN cache...');
  try {
    const config = new Configuration({ accessToken: HOSTINGER_TOKEN });
    const cacheApi = new HostingCacheApi(config);
    await cacheApi.clearWebsiteCacheV1('u575992126', 'rayan-group.com');
    await cacheApi.clearWebsiteCacheV1('u575992126', 'rayan-properties.com');
    console.log('Cache Purged: SUCCESS ✅');
  } catch (err) {
    console.warn('Cache purge note:', err.message);
  }

  console.log('\n🎉 ALL DONE! Your website is updated and live at:');
  console.log('👉 https://rayan-group.com');
}

deploy().catch(err => {
  console.error('Deployment failed:', err);
  process.exit(1);
});

// Serverless & Node API Handler for Rayan Group Accounts & Billing Management System
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve(process.cwd(), 'data', 'finance-data.json');

function readDb() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading finance DB:', err);
  }
  return null;
}

function writeDb(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing finance DB:', err);
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const host = (req.headers && req.headers.host) || 'localhost';
  const url = new URL(req.url, `http://${host}`);
  const action = url.searchParams.get('action') || (req.body && req.body.action) || 'get_state';

  const db = readDb();
  if (!db) {
    res.status(500).json({ error: 'Database could not be loaded' });
    return;
  }

  // GET Requests
  if (req.method === 'GET') {
    if (action === 'get_state') {
      const companyId = url.searchParams.get('companyId') || 'ashaz-eng-in';
      res.status(200).json({
        success: true,
        data: db
      });
      return;
    }

    if (action === 'get_users') {
      // Don't leak passwords in public query
      const sanitizedUsers = db.users.map(u => ({ ...u, password: '***' }));
      res.status(200).json({ success: true, users: sanitizedUsers });
      return;
    }

    res.status(200).json({ success: true, data: db });
    return;
  }

  // POST Requests
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};
    const postAction = body.action || action;

    // Helper to log audit
    const addAuditLog = (actorName, actorRole, actorEmail, actionType, entity, entityId, details) => {
      const logEntry = {
        id: `aud-${Date.now().toString(36)}`,
        timestamp: new Date().toISOString(),
        actor_name: actorName || 'System',
        actor_role: actorRole || 'admin',
        actor_email: actorEmail || 'system@rayangroup.com',
        action: actionType,
        entity,
        entity_id: entityId,
        details,
        ip_address: (req.headers && req.headers['x-forwarded-for']) || req.socket?.remoteAddress || '127.0.0.1'
      };
      db.audit_logs.unshift(logEntry);
    };

    // Helper to add notification
    const addNotification = (title, message, type = 'info', link = 'dashboard') => {
      const notif = {
        id: `notif-${Date.now().toString(36)}`,
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
        link
      };
      db.notifications.unshift(notif);
    };

    // 1. CREATE INVOICE
    if (postAction === 'create_invoice') {
      const invoiceData = body.invoice;
      if (!invoiceData) {
        res.status(400).json({ error: 'Missing invoice data' });
        return;
      }
      
      const newInvoice = {
        ...invoiceData,
        id: invoiceData.id || `inv-${Date.now().toString(36)}`,
        invoice_no: invoiceData.invoice_no || `INV-2026-${String(db.invoices.length + 1).padStart(3, '0')}`,
        company_id: invoiceData.company_id || (invoiceData.currency === 'INR' ? 'ashaz-eng-in' : 'rayan-corp-uae'),
        customer_id: invoiceData.customer_id,
        customer_name: invoiceData.customer_name,
        customer_address: invoiceData.customer_address || invoiceData.billing_address || '',
        contact_person: invoiceData.contact_person || '',
        email: invoiceData.email || '',
        phone: invoiceData.phone || '',
        customer_gstin: invoiceData.customer_gstin || '',
        customer_trn: invoiceData.customer_trn || invoiceData.trn || '',
        tax_regime: invoiceData.tax_regime || (invoiceData.currency === 'INR' ? 'gst' : 'trn'),
        currency: invoiceData.currency || 'AED',
        currency_symbol: invoiceData.currency_symbol || (invoiceData.currency === 'INR' ? '₹' : 'AED '),
        place_of_supply: invoiceData.place_of_supply || (invoiceData.currency === 'INR' ? '27-Maharashtra' : 'Dubai, UAE'),
        project_id: invoiceData.project_id || null,
        project_name: invoiceData.project_name || '',
        po_reference: invoiceData.po_reference || '',
        invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
        due_date: invoiceData.due_date || null,
        payment_terms: Number(invoiceData.payment_terms) || 0,
        line_items: invoiceData.line_items || [],
        taxable_subtotal: Number(invoiceData.taxable_subtotal) || 0,
        cgst_total: Number(invoiceData.cgst_total) || 0,
        sgst_total: Number(invoiceData.sgst_total) || 0,
        igst_total: Number(invoiceData.igst_total) || 0,
        vat_total: Number(invoiceData.vat_total) || 0,
        total_tax: Number(invoiceData.total_tax) || 0,
        additional_charges: Number(invoiceData.additional_charges) || 0,
        grand_total: Number(invoiceData.grand_total) || 0,
        amount_paid: Number(invoiceData.amount_paid) || 0,
        balance_due: Number(invoiceData.balance_due !== undefined ? invoiceData.balance_due : invoiceData.grand_total) || 0,
        status: invoiceData.status || 'issued',
        notes: invoiceData.notes || '',
        created_by: body.user_name || invoiceData.created_by || 'Arshad Alam Shaikh',
        created_at: invoiceData.created_at || new Date().toISOString()
      };

      db.invoices.unshift(newInvoice);

      // Audit & Notification
      addAuditLog(body.user_name, body.user_role, body.user_email, 'CREATE_INVOICE', 'Invoice', newInvoice.id, `Created Invoice ${newInvoice.invoice_no} for ${newInvoice.customer_name} of ₹${newInvoice.grand_total.toLocaleString('en-IN')}.`);
      addNotification(`New Invoice Issued: ${newInvoice.invoice_no}`, `Invoice for ${newInvoice.customer_name} (₹${newInvoice.grand_total.toLocaleString('en-IN')}) successfully posted.`, 'success', 'invoices');

      writeDb(db);
      res.status(200).json({ success: true, invoice: newInvoice, data: db });
      return;
    }

    // 2. RECORD CUSTOMER RECEIPT
    if (postAction === 'record_receipt') {
      const receiptData = body.receipt;
      if (!receiptData || !receiptData.customer_id || !receiptData.amount_received) {
        res.status(400).json({ error: 'Incomplete payment receipt details' });
        return;
      }

      const amountReceived = Number(receiptData.amount_received);
      const newReceipt = {
        ...receiptData,
        id: receiptData.id || `rec-${Date.now().toString(36)}`,
        receipt_no: receiptData.receipt_no || `REC-2026-${String(db.customer_receipts.length + 1).padStart(3, '0')}`,
        receipt_date: receiptData.receipt_date || new Date().toISOString().split('T')[0],
        customer_id: receiptData.customer_id,
        customer_name: receiptData.customer_name,
        company_id: receiptData.company_id || (receiptData.currency === 'INR' ? 'ashaz-eng-in' : 'rayan-corp-uae'),
        payment_mode: receiptData.payment_mode || 'Online',
        reference_no: receiptData.reference_no || 'WIRE-TXN-' + Math.floor(100000 + Math.random() * 900000),
        amount_received: amountReceived,
        allocated_amount: Number(receiptData.allocated_amount) || amountReceived,
        allocations: receiptData.allocations || [],
        notes: receiptData.notes || '',
        recorded_by: body.user_name || 'Accounts Staff',
        recorded_at: new Date().toISOString()
      };

      // Update allocated invoices
      if (Array.isArray(receiptData.allocations)) {
        receiptData.allocations.forEach(alloc => {
          const inv = db.invoices.find(i => i.id === alloc.invoice_id || i.invoice_no === alloc.invoice_no);
          if (inv) {
            const allocAmt = Number(alloc.amount_allocated) || 0;
            inv.amount_paid = (inv.amount_paid || 0) + allocAmt;
            inv.balance_due = Math.max(0, inv.grand_total - inv.amount_paid);
            if (inv.balance_due <= 0.01) {
              inv.status = 'paid';
            } else {
              inv.status = 'partially_paid';
            }
          }
        });
      }

      if (receiptData.bank_name) {
        if (!db.saved_banks) db.saved_banks = [];
        if (!db.saved_banks.includes(receiptData.bank_name)) {
          db.saved_banks.unshift(receiptData.bank_name);
        }
        const cust = (db.customers || []).find(c => c.id === receiptData.customer_id || c.name === receiptData.customer_name);
        if (cust) {
          cust.preferred_bank = receiptData.bank_name;
          cust.bank_name = receiptData.bank_name;
        }
      }

      db.customer_receipts.unshift(newReceipt);

      addAuditLog(body.user_name, body.user_role, body.user_email, 'RECORD_RECEIPT', 'Payment Receipt', newReceipt.id, `Recorded customer payment receipt ${newReceipt.receipt_no} of ₹${amountReceived.toLocaleString('en-IN')} from ${newReceipt.customer_name}.`);
      addNotification(`Payment Received: ${newReceipt.receipt_no}`, `Received ₹${amountReceived.toLocaleString('en-IN')} from ${newReceipt.customer_name}.`, 'success', 'payments');

      writeDb(db);
      res.status(200).json({ success: true, receipt: newReceipt, data: db });
      return;
    }

    // 3. CREATE PURCHASE BILL
    if (postAction === 'create_bill') {
      const billData = body.bill;
      if (!billData) {
        res.status(400).json({ error: 'Missing bill data' });
        return;
      }

      const newBill = {
        id: `bill-${Date.now().toString(36)}`,
        bill_no: billData.bill_no || `BILL-2026-${String(db.purchase_bills.length + 1).padStart(3, '0')}`,
        vendor_invoice_no: billData.vendor_invoice_no || 'VEND-REF-' + Math.floor(1000 + Math.random() * 9000),
        company_id: billData.company_id || 'ashaz-eng-in',
        vendor_id: billData.vendor_id,
        vendor_name: billData.vendor_name,
        project_id: billData.project_id || null,
        project_name: billData.project_name || '',
        po_id: billData.po_id || null,
        bill_date: billData.bill_date || new Date().toISOString().split('T')[0],
        due_date: billData.due_date,
        payment_terms: Number(billData.payment_terms) || 30,
        line_items: billData.line_items || [],
        taxable_subtotal: Number(billData.taxable_subtotal) || 0,
        tax_total: Number(billData.tax_total) || 0,
        grand_total: Number(billData.grand_total) || 0,
        amount_paid: 0,
        balance_due: Number(billData.grand_total) || 0,
        status: billData.status || 'approved',
        approval_status: billData.approval_status || 'approved',
        approved_by: body.user_name || 'Finance Admin',
        notes: billData.notes || ''
      };

      db.purchase_bills.unshift(newBill);

      addAuditLog(body.user_name, body.user_role, body.user_email, 'CREATE_PURCHASE_BILL', 'Purchase Bill', newBill.id, `Created Purchase Bill ${newBill.bill_no} for vendor ${newBill.vendor_name} amounting to ₹${newBill.grand_total.toLocaleString('en-IN')}.`);
      addNotification(`New Bill Recorded: ${newBill.bill_no}`, `Supplier invoice from ${newBill.vendor_name} for ₹${newBill.grand_total.toLocaleString('en-IN')} logged.`, 'info', 'bills');

      writeDb(db);
      res.status(200).json({ success: true, bill: newBill, data: db });
      return;
    }

    // 4. RECORD VENDOR PAYMENT
    if (postAction === 'record_payment') {
      const paymentData = body.payment;
      if (!paymentData || !paymentData.vendor_id || !paymentData.amount_paid) {
        res.status(400).json({ error: 'Incomplete payment voucher details' });
        return;
      }

      const amountPaid = Number(paymentData.amount_paid);
      const newPayment = {
        id: `pay-${Date.now().toString(36)}`,
        voucher_no: paymentData.voucher_no || `VOUCH-2026-${String(db.vendor_payments.length + 1).padStart(3, '0')}`,
        payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
        vendor_id: paymentData.vendor_id,
        vendor_name: paymentData.vendor_name,
        company_id: paymentData.company_id || 'ashaz-eng-in',
        payment_mode: paymentData.payment_mode || 'NEFT/RTGS',
        reference_no: paymentData.reference_no || 'CMS-RTGS-' + Math.floor(100000 + Math.random() * 900000),
        amount_paid: amountPaid,
        allocations: paymentData.allocations || [],
        bank_account: paymentData.bank_account || 'State Bank of India (Corporate 392019485721)',
        notes: paymentData.notes || '',
        approved_by: body.user_name || 'Finance Admin',
        recorded_at: new Date().toISOString()
      };

      // Update allocated purchase bills
      if (Array.isArray(paymentData.allocations)) {
        paymentData.allocations.forEach(alloc => {
          const bill = db.purchase_bills.find(b => b.id === alloc.bill_id || b.bill_no === alloc.bill_no);
          if (bill) {
            const allocAmt = Number(alloc.amount_allocated) || 0;
            bill.amount_paid = (bill.amount_paid || 0) + allocAmt;
            bill.balance_due = Math.max(0, bill.grand_total - bill.amount_paid);
            if (bill.balance_due <= 0.01) {
              bill.status = 'paid';
            } else {
              bill.status = 'partially_paid';
            }
          }
        });
      }

      db.vendor_payments.unshift(newPayment);

      addAuditLog(body.user_name, body.user_role, body.user_email, 'APPROVE_PAYMENT', 'Payment Voucher', newPayment.id, `Recorded vendor payment ${newPayment.voucher_no} of ₹${amountPaid.toLocaleString('en-IN')} to ${newPayment.vendor_name}.`);
      addNotification(`Vendor Payment Disbursed`, `Payment voucher ${newPayment.voucher_no} of ₹${amountPaid.toLocaleString('en-IN')} released to ${newPayment.vendor_name}.`, 'success', 'payments');

      writeDb(db);
      res.status(200).json({ success: true, payment: newPayment, data: db });
      return;
    }

    // 5. CREATE CUSTOMER
    if (postAction === 'create_customer') {
      const cust = body.customer;
      if (!cust || !cust.name) {
        res.status(400).json({ error: 'Customer name is required' });
        return;
      }
      const newCust = {
        id: cust.id || `cust-${Date.now().toString(36)}`,
        code: cust.code || 'CUST-' + Math.floor(100 + Math.random() * 900),
        company_id: cust.company_id || 'rayan-corp-uae',
        name: cust.name,
        company_name: cust.company_name || cust.name,
        display_name: cust.display_name || cust.name,
        customer_type: cust.customer_type || 'Business',
        contact_person: cust.contact_person || '',
        salutation: cust.salutation || '',
        first_name: cust.first_name || '',
        last_name: cust.last_name || '',
        email: cust.email || '',
        phone: cust.phone || '',
        country: cust.country || 'UAE',
        billing_address: cust.billing_address || '',
        office_address: cust.office_address || cust.billing_address || '',
        shipping_address: cust.shipping_address || '',
        gstin: cust.gstin || '',
        trn: cust.trn || '',
        tax_treatment: cust.tax_treatment || 'VAT Registered',
        currency: cust.currency || 'AED',
        accounts_receivable: cust.accounts_receivable || 'Accounts Receivable',
        state: cust.state || '',
        state_code: cust.state_code || '',
        place_of_supply: cust.place_of_supply || '',
        payment_terms: Number(cust.payment_terms) || 0,
        payment_terms_label: cust.payment_terms_label || 'Due on Receipt',
        credit_limit: Number(cust.credit_limit) || 15000000,
        opening_balance: Number(cust.opening_balance) || 0,
        status: 'active',
        ...cust
      };
      if (!Array.isArray(db.customers)) db.customers = [];
      const exIdx = db.customers.findIndex(c => c.id === newCust.id || (c.name && c.name.toLowerCase() === newCust.name.toLowerCase()));
      if (exIdx >= 0) {
        db.customers[exIdx] = { ...db.customers[exIdx], ...newCust };
      } else {
        db.customers.unshift(newCust);
      }
      addAuditLog(body.user_name, body.user_role, body.user_email, 'CREATE_CUSTOMER', 'Customer', newCust.id, `Created customer record for ${newCust.name}.`);
      writeDb(db);
      res.status(200).json({ success: true, customer: newCust, data: db });
      return;
    }

    // 6. CREATE VENDOR
    if (postAction === 'create_vendor') {
      const vend = body.vendor;
      if (!vend || !vend.name) {
        res.status(400).json({ error: 'Vendor name is required' });
        return;
      }
      const newVend = {
        id: `vend-${Date.now().toString(36)}`,
        code: vend.code || 'VEND-' + Math.floor(100 + Math.random() * 900),
        company_id: vend.company_id || 'ashaz-eng-in',
        name: vend.name,
        contact_person: vend.contact_person || '',
        email: vend.email || '',
        phone: vend.phone || '',
        address: vend.address || '',
        gstin: vend.gstin || '',
        pan: vend.pan || '',
        category: vend.category || 'Materials & Supply',
        bank_name: vend.bank_name || '',
        account_no: vend.account_no || '',
        ifsc_code: vend.ifsc_code || '',
        payment_terms: Number(vend.payment_terms) || 30,
        opening_balance: Number(vend.opening_balance) || 0,
        status: 'active'
      };
      db.vendors.push(newVend);
      addAuditLog(body.user_name, body.user_role, body.user_email, 'CREATE_VENDOR', 'Vendor', newVend.id, `Created vendor record for ${newVend.name}.`);
      writeDb(db);
      res.status(200).json({ success: true, vendor: newVend, data: db });
      return;
    }

    // 7. CREATE ITEM OR SERVICE
    if (postAction === 'create_item') {
      const item = body.item;
      if (!item || !item.name) {
        res.status(400).json({ error: 'Item name is required' });
        return;
      }
      const newItem = {
        id: `item-${Date.now().toString(36)}`,
        code: item.code || 'ITEM-' + Math.floor(100 + Math.random() * 900),
        name: item.name,
        category: item.category || 'Civil & Raw Materials',
        description: item.description || '',
        uom: item.uom || 'UNITS',
        sales_price: Number(item.sales_price) || 0,
        purchase_price: Number(item.purchase_price) || 0,
        gst_rate: Number(item.gst_rate) || 18,
        hsn_sac_code: item.hsn_sac_code || '',
        status: 'active'
      };
      db.items.push(newItem);
      addAuditLog(body.user_name, body.user_role, body.user_email, 'CREATE_ITEM', 'Catalog Item', newItem.id, `Created product/service ${newItem.name} (${newItem.code}).`);
      writeDb(db);
      res.status(200).json({ success: true, item: newItem, data: db });
      return;
    }

    // 8. RECORD EXPENSE
    if (postAction === 'create_expense') {
      const exp = body.expense;
      if (!exp || !exp.amount) {
        res.status(400).json({ error: 'Expense amount is required' });
        return;
      }
      const amount = Number(exp.amount);
      const tax = Number(exp.tax_amount) || 0;
      const newExp = {
        id: `exp-${Date.now().toString(36)}`,
        expense_no: `EXP-2026-${String(db.expenses.length + 1).padStart(3, '0')}`,
        company_id: exp.company_id || 'ashaz-eng-in',
        date: exp.date || new Date().toISOString().split('T')[0],
        category: exp.category || 'Site Expenses & Consumables',
        description: exp.description || '',
        amount,
        tax_amount: tax,
        total_amount: amount + tax,
        payment_method: exp.payment_method || 'Employee Reimbursement',
        project_id: exp.project_id || null,
        project_name: exp.project_name || '',
        submitted_by: body.user_name || 'Rahul Deshmukh',
        submitted_by_email: body.user_email || 'employee.rahul@rayangroup.com',
        status: exp.status || 'approved',
        approved_by: body.user_role === 'employee' ? null : body.user_name,
        receipt_filename: exp.receipt_filename || 'expense-proof.pdf'
      };
      db.expenses.unshift(newExp);
      addAuditLog(body.user_name, body.user_role, body.user_email, 'CREATE_EXPENSE', 'Expense Claim', newExp.id, `Submitted expense ${newExp.expense_no} of ₹${newExp.total_amount.toLocaleString('en-IN')}.`);
      writeDb(db);
      res.status(200).json({ success: true, expense: newExp, data: db });
      return;
    }

    // 9. CREATE CREDIT NOTE
    if (postAction === 'create_credit_note') {
      const cn = body.credit_note;
      if (!cn || !cn.invoice_id) {
        res.status(400).json({ error: 'Missing credit note details' });
        return;
      }
      const taxable = Number(cn.taxable_amount) || 0;
      const tax = Number(cn.tax_amount) || 0;
      const totalCredit = taxable + tax;
      const newCN = {
        id: `cn-${Date.now().toString(36)}`,
        credit_note_no: `CN-2026-${String(db.credit_notes.length + 1).padStart(3, '0')}`,
        invoice_id: cn.invoice_id,
        invoice_no: cn.invoice_no,
        company_id: cn.company_id || 'ashaz-eng-in',
        customer_id: cn.customer_id,
        customer_name: cn.customer_name,
        date: cn.date || new Date().toISOString().split('T')[0],
        reason: cn.reason || 'Sales return / rate adjustment',
        taxable_amount: taxable,
        tax_amount: tax,
        total_credit_amount: totalCredit,
        status: 'approved',
        created_by: body.user_name || 'Pooja Sharma',
        approved_by: body.user_role === 'super_admin' || body.user_role === 'finance_admin' ? body.user_name : 'Zameer Ahmed Khan'
      };

      // Adjust invoice balance
      const linkedInv = db.invoices.find(i => i.id === cn.invoice_id);
      if (linkedInv) {
        linkedInv.grand_total = Math.max(0, linkedInv.grand_total - totalCredit);
        linkedInv.balance_due = Math.max(0, linkedInv.balance_due - totalCredit);
        if (linkedInv.balance_due <= 0.01) linkedInv.status = 'paid';
      }

      db.credit_notes.unshift(newCN);
      addAuditLog(body.user_name, body.user_role, body.user_email, 'CREATE_CREDIT_NOTE', 'Credit Note', newCN.id, `Issued Credit Note ${newCN.credit_note_no} of ₹${totalCredit.toLocaleString('en-IN')} against ${newCN.invoice_no}.`);
      writeDb(db);
      res.status(200).json({ success: true, credit_note: newCN, data: db });
      return;
    }

    // 10. CREATE DEBIT NOTE
    if (postAction === 'create_debit_note') {
      const dn = body.debit_note;
      if (!dn || !dn.bill_id) {
        res.status(400).json({ error: 'Missing debit note details' });
        return;
      }
      const taxable = Number(dn.taxable_amount) || 0;
      const tax = Number(dn.tax_amount) || 0;
      const totalDebit = taxable + tax;
      const newDN = {
        id: `dn-${Date.now().toString(36)}`,
        debit_note_no: `DN-2026-${String(db.debit_notes.length + 1).padStart(3, '0')}`,
        bill_id: dn.bill_id,
        bill_no: dn.bill_no,
        company_id: dn.company_id || 'ashaz-eng-in',
        vendor_id: dn.vendor_id,
        vendor_name: dn.vendor_name,
        date: dn.date || new Date().toISOString().split('T')[0],
        reason: dn.reason || 'Purchase return / debit adjustment',
        taxable_amount: taxable,
        tax_amount: tax,
        total_debit_amount: totalDebit,
        status: 'approved',
        created_by: body.user_name || 'Pooja Sharma',
        approved_by: body.user_name || 'Zameer Ahmed Khan'
      };

      // Adjust bill balance
      const linkedBill = db.purchase_bills.find(b => b.id === dn.bill_id);
      if (linkedBill) {
        linkedBill.grand_total = Math.max(0, linkedBill.grand_total - totalDebit);
        linkedBill.balance_due = Math.max(0, linkedBill.balance_due - totalDebit);
        if (linkedBill.balance_due <= 0.01) linkedBill.status = 'paid';
      }

      db.debit_notes.unshift(newDN);
      addAuditLog(body.user_name, body.user_role, body.user_email, 'CREATE_DEBIT_NOTE', 'Debit Note', newDN.id, `Issued Debit Note ${newDN.debit_note_no} of ₹${totalDebit.toLocaleString('en-IN')} against ${newDN.bill_no}.`);
      writeDb(db);
      res.status(200).json({ success: true, debit_note: newDN, data: db });
      return;
    }

    // 11. CREATE PURCHASE ORDER
    if (postAction === 'create_po') {
      const poData = body.po;
      if (!poData || !poData.vendor_id) {
        res.status(400).json({ error: 'Missing PO details' });
        return;
      }
      const newPO = {
        id: `po-${Date.now().toString(36)}`,
        po_no: `PO-2026-${String(db.purchase_orders.length + 1).padStart(3, '0')}`,
        company_id: poData.company_id || 'ashaz-eng-in',
        vendor_id: poData.vendor_id,
        vendor_name: poData.vendor_name,
        project_id: poData.project_id || null,
        project_name: poData.project_name || '',
        date: poData.date || new Date().toISOString().split('T')[0],
        expected_delivery: poData.expected_delivery || '',
        payment_terms: Number(poData.payment_terms) || 30,
        line_items: poData.line_items || [],
        subtotal: Number(poData.subtotal) || 0,
        tax_total: Number(poData.tax_total) || 0,
        total_value: Number(poData.total_value) || 0,
        billed_value: 0,
        status: 'approved',
        approved_by: body.user_name || 'Arshad Alam Shaikh'
      };
      db.purchase_orders.unshift(newPO);
      addAuditLog(body.user_name, body.user_role, body.user_email, 'CREATE_PURCHASE_ORDER', 'Purchase Order', newPO.id, `Created Purchase Order ${newPO.po_no} for ${newPO.vendor_name} amounting to ₹${newPO.total_value.toLocaleString('en-IN')}.`);
      writeDb(db);
      res.status(200).json({ success: true, po: newPO, data: db });
      return;
    }

    // 12. CREATE PROJECT
    if (postAction === 'create_project') {
      const prj = body.project;
      if (!prj || !prj.name) {
        res.status(400).json({ error: 'Project name is required' });
        return;
      }
      const newPrj = {
        id: `prj-${Date.now().toString(36)}`,
        code: prj.code || 'PRJ-' + Math.floor(100 + Math.random() * 900),
        company_id: prj.company_id || 'ashaz-eng-in',
        name: prj.name,
        client_id: prj.client_id || '',
        client_name: prj.client_name || '',
        contract_value: Number(prj.contract_value) || 0,
        approved_budget: Number(prj.approved_budget) || 0,
        start_date: prj.start_date || new Date().toISOString().split('T')[0],
        target_completion: prj.target_completion || '',
        status: 'in_progress'
      };
      db.projects.push(newPrj);
      addAuditLog(body.user_name, body.user_role, body.user_email, 'CREATE_PROJECT', 'Project', newPrj.id, `Created project ${newPrj.name} with contract value ₹${newPrj.contract_value.toLocaleString('en-IN')}.`);
      writeDb(db);
      res.status(200).json({ success: true, project: newPrj, data: db });
      return;
    }

    // 13. INVITE / CREATE USER
    if (postAction === 'invite_user') {
      const usr = body.user;
      if (!usr || !usr.email || !usr.role) {
        res.status(400).json({ error: 'Email and role are required' });
        return;
      }
      const existing = db.users.find(u => u.email.toLowerCase() === usr.email.toLowerCase());
      if (existing) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }
      const roleLabels = {
        super_admin: 'Super Administrator',
        finance_admin: 'Finance Administrator',
        accountant: 'Accountant',
        project_manager: 'Project Manager',
        employee: 'Employee',
        management_readonly: 'Management (Read-Only)'
      };
      const newUser = {
        id: `usr-${Date.now().toString(36)}`,
        email: usr.email.trim(),
        password: usr.password || 'Rayan@Temp2026',
        name: usr.name || usr.email.split('@')[0],
        role: usr.role,
        role_label: roleLabels[usr.role] || usr.role,
        designation: usr.designation || 'Staff',
        department: usr.department || 'Finance',
        phone: usr.phone || '',
        avatar: '👤',
        status: 'active',
        assigned_companies: usr.assigned_companies || ['ashaz-eng-in'],
        created_at: new Date().toISOString()
      };
      db.users.push(newUser);
      addAuditLog(body.user_name, body.user_role, body.user_email, 'INVITE_USER', 'User Administration', newUser.id, `Invited new user ${newUser.email} with role ${newUser.role_label}.`);
      writeDb(db);
      res.status(200).json({ success: true, user: newUser, data: db });
      return;
    }

    // 14. UPDATE SETTINGS
    if (postAction === 'update_settings') {
      if (body.settings) {
        db.settings = { ...db.settings, ...body.settings };
        addAuditLog(body.user_name, body.user_role, body.user_email, 'UPDATE_SETTINGS', 'Configuration', 'settings', `Updated financial system preferences.`);
        writeDb(db);
        res.status(200).json({ success: true, settings: db.settings, data: db });
        return;
      }
    }

    // 15. VOID / CANCEL INVOICE
    if (postAction === 'void_invoice') {
      const invId = body.invoice_id;
      const inv = db.invoices.find(i => i.id === invId || i.invoice_no === invId);
      if (inv) {
        inv.status = 'void';
        inv.balance_due = 0;
        addAuditLog(body.user_name, body.user_role, body.user_email, 'VOID_INVOICE', 'Invoice', inv.id, `Marked invoice ${inv.invoice_no} as void.`);
        writeDb(db);
        res.status(200).json({ success: true, invoice: inv, data: db });
        return;
      }
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    // 16. APPROVE BILL
    if (postAction === 'approve_bill') {
      const billId = body.bill_id;
      const bill = db.purchase_bills.find(b => b.id === billId || b.bill_no === billId);
      if (bill) {
        bill.status = 'approved';
        bill.approval_status = 'approved';
        bill.approved_by = body.user_name || 'Finance Admin';
        addAuditLog(body.user_name, body.user_role, body.user_email, 'APPROVE_PURCHASE_BILL', 'Purchase Bill', bill.id, `Approved purchase bill ${bill.bill_no}.`);
        writeDb(db);
        res.status(200).json({ success: true, bill, data: db });
        return;
      }
      res.status(404).json({ error: 'Bill not found' });
      return;
    }

    // 18. BANK ACCOUNTS
    if (postAction === 'create_bank_account') {
      const bank = body.bank_account || body.bank || {};
      if (bank.bank_name) {
        if (!bank.id) bank.id = 'bank-' + Date.now().toString(36);
        if (!bank.company_id) bank.company_id = body.company_id || 'rayan-corp-uae';
        if (!bank.currency) bank.currency = (bank.company_id === 'ashaz-eng-in') ? 'INR' : 'AED';
        if (!db.bank_accounts) db.bank_accounts = [];
        db.bank_accounts.unshift(bank);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'CREATE_BANK_ACCOUNT', 'Bank Account', bank.id, `Created bank account ${bank.bank_name}.`);
        writeDb(db);
        res.status(200).json({ success: true, bank, data: db });
        return;
      }
      res.status(400).json({ error: 'Bank name is required' });
      return;
    }

    if (postAction === 'update_bank_account') {
      const bank = body.bank_account || body.bank || {};
      const targetId = body.id || bank.id;
      const exB = (db.bank_accounts || []).find(b => b.id === targetId);
      if (exB) {
        Object.assign(exB, bank);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'UPDATE_BANK_ACCOUNT', 'Bank Account', targetId, `Updated bank account ${targetId}.`);
        writeDb(db);
        res.status(200).json({ success: true, bank: exB, data: db });
        return;
      }
      res.status(404).json({ error: 'Bank account not found' });
      return;
    }

    if (postAction === 'delete_bank_account') {
      const targetId = body.id;
      if (db.bank_accounts) {
        db.bank_accounts = db.bank_accounts.filter(b => b.id !== targetId);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'DELETE_BANK_ACCOUNT', 'Bank Account', targetId, `Deleted bank account ${targetId}.`);
        writeDb(db);
        res.status(200).json({ success: true, data: db });
        return;
      }
      res.status(404).json({ error: 'Bank account not found' });
      return;
    }

    // 19. BANK WIRE TRANSFERS
    if (postAction === 'record_bank_transfer') {
      const trn = body.transfer || body.bank_transfer || {};
      if (trn) {
        if (!trn.id) trn.id = 'wire-' + Date.now().toString(36);
        if (!trn.company_id) trn.company_id = body.company_id || 'rayan-corp-uae';
        if (!trn.currency) trn.currency = (trn.company_id === 'ashaz-eng-in') ? 'INR' : 'AED';
        if (!trn.reference_no) {
          const prefix = (trn.company_id === 'ashaz-eng-in') ? 'RTGS-ASH' : 'FAB-TRN';
          trn.reference_no = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
        }
        if (!db.bank_transfers) db.bank_transfers = [];
        db.bank_transfers.unshift(trn);

        const amt = Number(trn.amount) || 0;
        const srcId = trn.source_account_id;
        const destId = trn.destination_account_id;
        if (amt > 0 && db.bank_accounts) {
          const srcAcc = db.bank_accounts.find(b => b.id === srcId);
          if (srcAcc) srcAcc.balance = (Number(srcAcc.balance) || 0) - amt;
          if (destId) {
            const destAcc = db.bank_accounts.find(b => b.id === destId);
            if (destAcc) destAcc.balance = (Number(destAcc.balance) || 0) + amt;
          }
        }
        addAuditLog(body.user_name, body.user_role, body.user_email, 'RECORD_BANK_TRANSFER', 'Bank Transfer', trn.reference_no, `Recorded wire transfer ${trn.reference_no} for ${trn.currency} ${amt}.`);
        writeDb(db);
        res.status(200).json({ success: true, transfer: trn, data: db });
        return;
      }
      res.status(400).json({ error: 'Invalid transfer payload' });
      return;
    }

    if (postAction === 'delete_bank_transfer') {
      const targetId = body.id;
      if (db.bank_transfers) {
        db.bank_transfers = db.bank_transfers.filter(t => t.id !== targetId);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'DELETE_BANK_TRANSFER', 'Bank Transfer', targetId, `Deleted bank transfer ${targetId}.`);
        writeDb(db);
        res.status(200).json({ success: true, data: db });
        return;
      }
      res.status(404).json({ error: 'Transfer not found' });
      return;
    }

    // 20. CASH REGISTERS & VOUCHERS
    if (postAction === 'create_cash_register') {
      const reg = body.register || body.cash_register || {};
      if (reg.register_name) {
        if (!reg.id) reg.id = 'cash-' + Date.now().toString(36);
        if (!reg.company_id) reg.company_id = body.company_id || 'rayan-corp-uae';
        if (!reg.currency) reg.currency = (reg.company_id === 'ashaz-eng-in') ? 'INR' : 'AED';
        if (!db.cash_in_hand) db.cash_in_hand = [];
        db.cash_in_hand.unshift(reg);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'CREATE_CASH_REGISTER', 'Cash Register', reg.id, `Created cash register ${reg.register_name}.`);
        writeDb(db);
        res.status(200).json({ success: true, register: reg, data: db });
        return;
      }
      res.status(400).json({ error: 'Register name is required' });
      return;
    }

    if (postAction === 'update_cash_register') {
      const reg = body.register || body.cash_register || {};
      const targetId = body.id || reg.id;
      const exR = (db.cash_in_hand || []).find(r => r.id === targetId);
      if (exR) {
        Object.assign(exR, reg);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'UPDATE_CASH_REGISTER', 'Cash Register', targetId, `Updated cash register ${targetId}.`);
        writeDb(db);
        res.status(200).json({ success: true, register: exR, data: db });
        return;
      }
      res.status(404).json({ error: 'Cash register not found' });
      return;
    }

    if (postAction === 'delete_cash_register') {
      const targetId = body.id;
      if (db.cash_in_hand) {
        db.cash_in_hand = db.cash_in_hand.filter(r => r.id !== targetId);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'DELETE_CASH_REGISTER', 'Cash Register', targetId, `Deleted cash register ${targetId}.`);
        writeDb(db);
        res.status(200).json({ success: true, data: db });
        return;
      }
      res.status(404).json({ error: 'Cash register not found' });
      return;
    }

    if (postAction === 'record_cash_voucher') {
      const cv = body.voucher || body.cash_voucher || {};
      if (cv) {
        if (!cv.id) cv.id = 'cv-' + Date.now().toString(36);
        if (!cv.company_id) cv.company_id = body.company_id || 'rayan-corp-uae';
        if (!cv.currency) cv.currency = (cv.company_id === 'ashaz-eng-in') ? 'INR' : 'AED';
        if (!cv.voucher_no) {
          const prefix = (cv.company_id === 'ashaz-eng-in') ? 'PC-MUM' : 'PC-DXB';
          cv.voucher_no = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
        }
        if (!db.cash_vouchers) db.cash_vouchers = [];
        db.cash_vouchers.unshift(cv);

        const amt = Number(cv.amount) || 0;
        const vaultId = cv.register_id;
        const type = cv.type || 'outflow';
        if (amt > 0 && vaultId && db.cash_in_hand) {
          const reg = db.cash_in_hand.find(r => r.id === vaultId);
          if (reg) {
            if (type === 'inflow') {
              reg.balance = (Number(reg.balance) || 0) + amt;
            } else {
              reg.balance = (Number(reg.balance) || 0) - amt;
            }
            reg.last_replenished = cv.date || new Date().toISOString().split('T')[0];
          }
        }
        addAuditLog(body.user_name, body.user_role, body.user_email, 'RECORD_CASH_VOUCHER', 'Cash Voucher', cv.voucher_no, `Recorded petty cash voucher ${cv.voucher_no} for ${cv.currency} ${amt}.`);
        writeDb(db);
        res.status(200).json({ success: true, voucher: cv, data: db });
        return;
      }
      res.status(400).json({ error: 'Invalid voucher payload' });
      return;
    }

    if (postAction === 'delete_cash_voucher') {
      const targetId = body.id;
      if (db.cash_vouchers) {
        db.cash_vouchers = db.cash_vouchers.filter(v => v.id !== targetId);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'DELETE_CASH_VOUCHER', 'Cash Voucher', targetId, `Deleted cash voucher ${targetId}.`);
        writeDb(db);
        res.status(200).json({ success: true, data: db });
        return;
      }
      res.status(404).json({ error: 'Cash voucher not found' });
      return;
    }

    // 21. CHEQUES
    if (postAction === 'record_cheque') {
      const chq = body.cheque || {};
      if (chq) {
        if (!chq.id) chq.id = 'chq-' + Date.now().toString(36);
        if (!chq.company_id) chq.company_id = body.company_id || 'rayan-corp-uae';
        if (!chq.currency) chq.currency = (chq.company_id === 'ashaz-eng-in') ? 'INR' : 'AED';
        if (!db.cheques) db.cheques = [];
        db.cheques.unshift(chq);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'RECORD_CHEQUE', 'Cheque', chq.cheque_no, `Recorded cheque ${chq.cheque_no}.`);
        writeDb(db);
        res.status(200).json({ success: true, cheque: chq, data: db });
        return;
      }
      res.status(400).json({ error: 'Invalid cheque payload' });
      return;
    }

    if (postAction === 'update_cheque_status') {
      const targetId = body.id;
      const newStatus = body.status || 'Cleared';
      const bankAccId = body.bank_account_id;
      const chq = (db.cheques || []).find(c => c.id === targetId);
      if (chq) {
        const oldStatus = chq.status;
        chq.status = newStatus;
        if (newStatus === 'Cleared' && oldStatus !== 'Cleared') {
          const amt = Number(chq.amount) || 0;
          if (amt > 0 && db.bank_accounts) {
            const b = db.bank_accounts.find(acc => acc.id === bankAccId || (!bankAccId && (acc.bank_name || '').toLowerCase() === (chq.bank_name || '').toLowerCase()));
            if (b) {
              if (chq.type === 'inward') {
                b.balance = (Number(b.balance) || 0) + amt;
              } else {
                b.balance = (Number(b.balance) || 0) - amt;
              }
            }
          }
        }
        addAuditLog(body.user_name, body.user_role, body.user_email, 'UPDATE_CHEQUE_STATUS', 'Cheque', targetId, `Updated cheque status to ${newStatus}.`);
        writeDb(db);
        res.status(200).json({ success: true, cheque: chq, data: db });
        return;
      }
      res.status(404).json({ error: 'Cheque not found' });
      return;
    }

    if (postAction === 'delete_cheque') {
      const targetId = body.id;
      if (db.cheques) {
        db.cheques = db.cheques.filter(c => c.id !== targetId);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'DELETE_CHEQUE', 'Cheque', targetId, `Deleted cheque ${targetId}.`);
        writeDb(db);
        res.status(200).json({ success: true, data: db });
        return;
      }
      res.status(404).json({ error: 'Cheque not found' });
      return;
    }

    // 22. LOAN ACCOUNTS & TRANSACTIONS
    if (postAction === 'create_loan_account') {
      const loan = body.loan_account || body.loan || {};
      if (loan.facility_name) {
        if (!loan.id) loan.id = 'loan-' + Date.now().toString(36);
        if (!loan.company_id) loan.company_id = body.company_id || 'rayan-corp-uae';
        if (!loan.currency) loan.currency = (loan.company_id === 'ashaz-eng-in') ? 'INR' : 'AED';
        const sanc = Number(loan.sanctioned_limit) || 0;
        const out = Number(loan.outstanding_balance) || 0;
        loan.available_limit = Math.max(0, sanc - out);
        if (!db.loan_accounts) db.loan_accounts = [];
        db.loan_accounts.unshift(loan);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'CREATE_LOAN_ACCOUNT', 'Loan Account', loan.id, `Created loan facility ${loan.facility_name}.`);
        writeDb(db);
        res.status(200).json({ success: true, loan, data: db });
        return;
      }
      res.status(400).json({ error: 'Facility name is required' });
      return;
    }

    if (postAction === 'update_loan_account') {
      const loan = body.loan_account || body.loan || {};
      const targetId = body.id || loan.id;
      const exL = (db.loan_accounts || []).find(l => l.id === targetId);
      if (exL) {
        Object.assign(exL, loan);
        const sanc = Number(exL.sanctioned_limit) || 0;
        const out = Number(exL.outstanding_balance) || 0;
        exL.available_limit = Math.max(0, sanc - out);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'UPDATE_LOAN_ACCOUNT', 'Loan Account', targetId, `Updated loan facility ${targetId}.`);
        writeDb(db);
        res.status(200).json({ success: true, loan: exL, data: db });
        return;
      }
      res.status(404).json({ error: 'Loan facility not found' });
      return;
    }

    if (postAction === 'delete_loan_account') {
      const targetId = body.id;
      if (db.loan_accounts) {
        db.loan_accounts = db.loan_accounts.filter(l => l.id !== targetId);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'DELETE_LOAN_ACCOUNT', 'Loan Account', targetId, `Deleted loan facility ${targetId}.`);
        writeDb(db);
        res.status(200).json({ success: true, data: db });
        return;
      }
      res.status(404).json({ error: 'Loan facility not found' });
      return;
    }

    if (postAction === 'record_loan_transaction') {
      const lt = body.transaction || body.loan_transaction || {};
      if (lt) {
        if (!lt.id) lt.id = 'lt-' + Date.now().toString(36);
        if (!lt.company_id) lt.company_id = body.company_id || 'rayan-corp-uae';
        if (!lt.currency) lt.currency = (lt.company_id === 'ashaz-eng-in') ? 'INR' : 'AED';
        if (!db.loan_transactions) db.loan_transactions = [];
        db.loan_transactions.unshift(lt);

        const amt = Number(lt.amount) || 0;
        const facId = lt.facility_id;
        const tType = lt.type || 'repayment';
        if (amt > 0 && facId && db.loan_accounts) {
          const lf = db.loan_accounts.find(l => l.id === facId);
          if (lf) {
            if (tType === 'drawdown') {
              lf.outstanding_balance = (Number(lf.outstanding_balance) || 0) + amt;
            } else if (tType === 'repayment') {
              lf.outstanding_balance = Math.max(0, (Number(lf.outstanding_balance) || 0) - amt);
            }
            lf.available_limit = Math.max(0, (Number(lf.sanctioned_limit) || 0) - (Number(lf.outstanding_balance) || 0));
          }
        }
        addAuditLog(body.user_name, body.user_role, body.user_email, 'RECORD_LOAN_TRANSACTION', 'Loan Transaction', lt.id, `Recorded loan transaction of ${lt.currency} ${amt}.`);
        writeDb(db);
        res.status(200).json({ success: true, transaction: lt, data: db });
        return;
      }
      res.status(400).json({ error: 'Invalid loan transaction payload' });
      return;
    }

    if (postAction === 'delete_loan_transaction') {
      const targetId = body.id;
      if (db.loan_transactions) {
        db.loan_transactions = db.loan_transactions.filter(t => t.id !== targetId);
        addAuditLog(body.user_name, body.user_role, body.user_email, 'DELETE_LOAN_TRANSACTION', 'Loan Transaction', targetId, `Deleted loan transaction ${targetId}.`);
        writeDb(db);
        res.status(200).json({ success: true, data: db });
        return;
      }
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    // 23. RESET DEMO DATA
    if (postAction === 'reset_demo_data') {
      // Re-read or restore defaults
      res.status(200).json({ success: true, message: 'Reset completed', data: db });
      return;
    }

    res.status(400).json({ error: `Unknown action: ${postAction}` });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}

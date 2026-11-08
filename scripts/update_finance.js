import fs from 'fs';

let php = fs.readFileSync('public/api/finance.php', 'utf8');

// 1. Definition of reconcileAllPaymentRecordsPhp
const reconcileFunctionPhp = `
function reconcileAllPaymentRecordsPhp(&$data, $pdo) {
    if (!$data || !is_array($data)) return;

    // 1. Purge canonical vouchers from deleted_vendor_payments setting
    $canonicalVpIds = [
        'PV-REC-44001', 'PV-REC-44002', 'PV-REC-44003', 'PV-REC-44004', 'PV-REC-44005', 'PV-REC-44006',
        'pay-1793642108024', 'pay-1793974452744',
        'pay-1793890308989', 'pay-1793974978543',
        'pay-1793894011459', 'pay-1793975240000',
        'pay-1793894232210', 'pay-1793976417852',
        'pay-1793894993039', 'pay-1793976590000',
        'pay-1793898169781', 'pay-1793977952016'
    ];
    $canonicalVpSet = array_flip(array_map('strtolower', $canonicalVpIds));
    if ($pdo) {
        try {
            $rawDel = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'deleted_vendor_payments'")->fetchColumn();
            if ($rawDel) {
                $curDel = json_decode($rawDel, true) ?: [];
                $filteredDel = array_values(array_filter($curDel, function($id) use ($canonicalVpSet) {
                    return !isset($canonicalVpSet[strtolower($id)]);
                }));
                $stmtDel = $pdo->prepare("REPLACE INTO finance_settings (setting_key, setting_val, updated_at) VALUES ('deleted_vendor_payments', :val, NOW())");
                $stmtDel->execute([':val' => json_encode($filteredDel)]);
            }
        } catch (Exception $e) {}
    }

    // 2. Authoritative 6 Vendor Payment Vouchers (Payment-Out)
    $canonicalVendorPayments = [
        [
            'id' => 'pay-1793974452744',
            'voucher_no' => 'PV-REC-44001',
            'company_id' => 'rayan-corp-uae',
            'currency' => 'AED',
            'currency_symbol' => 'AED ',
            'vendor_id' => 'vend-mw3q187t',
            'vendor_name' => 'M/S GENERAL EXPENSES FOR THE PROJECT',
            'payment_date' => '2023-09-13',
            'payment_mode' => 'Online',
            'reference_no' => 'Cash / Bank Transfer',
            'amount_paid' => 47231.00,
            'allocations' => [
                [
                    'bill_id' => 'bill-1793974433713',
                    'bill_no' => 'BILL-REC-1001',
                    'vendor_invoice_no' => 'General',
                    'amount_allocated' => 47231.00
                ]
            ],
            'notes' => 'Disbursement against General',
            'status' => 'Released & Reconciled',
            'created_at' => '2023-09-13T10:00:00.000Z'
        ],
        [
            'id' => 'pay-1793974978543',
            'voucher_no' => 'PV-REC-44002',
            'company_id' => 'rayan-corp-uae',
            'currency' => 'AED',
            'currency_symbol' => 'AED ',
            'vendor_id' => 'vend-mw3q187t',
            'vendor_name' => 'M/S GENERAL EXPENSES FOR THE PROJECT',
            'payment_date' => '2023-07-06',
            'payment_mode' => 'Online',
            'reference_no' => 'Cash / Bank Transfer',
            'amount_paid' => 18500.00,
            'allocations' => [
                [
                    'bill_id' => 'bill-1793974961216',
                    'bill_no' => 'BILL-REC-1002',
                    'vendor_invoice_no' => 'General',
                    'amount_allocated' => 18500.00
                ]
            ],
            'notes' => 'Disbursement against General',
            'status' => 'Released & Reconciled',
            'created_at' => '2023-07-06T10:00:00.000Z'
        ],
        [
            'id' => 'pay-1793975240000',
            'voucher_no' => 'PV-REC-44003',
            'company_id' => 'rayan-corp-uae',
            'currency' => 'AED',
            'currency_symbol' => 'AED ',
            'vendor_id' => 'vend-mw3q187t',
            'vendor_name' => 'M/S GENERAL EXPENSES FOR THE PROJECT',
            'payment_date' => '2024-11-15',
            'payment_mode' => 'Online',
            'reference_no' => 'Cash / Bank Transfer',
            'amount_paid' => 110000.00,
            'allocations' => [
                [
                    'bill_id' => 'bill-1793975224831',
                    'bill_no' => 'BILL-REC-1003',
                    'vendor_invoice_no' => 'General',
                    'amount_allocated' => 110000.00
                ]
            ],
            'notes' => 'Disbursement against General',
            'status' => 'Released & Reconciled',
            'created_at' => '2024-11-15T10:00:00.000Z'
        ],
        [
            'id' => 'pay-1793976417852',
            'voucher_no' => 'PV-REC-44004',
            'company_id' => 'rayan-corp-uae',
            'currency' => 'AED',
            'currency_symbol' => 'AED ',
            'vendor_id' => 'vend-mw3q187t',
            'vendor_name' => 'M/S GENERAL EXPENSES FOR THE PROJECT',
            'payment_date' => '2024-10-12',
            'payment_mode' => 'Online',
            'reference_no' => 'Cash / Bank Transfer',
            'amount_paid' => 129864.48,
            'allocations' => [
                [
                    'bill_id' => 'bill-1793975959757',
                    'bill_no' => 'BILL-REC-1004',
                    'vendor_invoice_no' => 'General',
                    'amount_allocated' => 129864.48
                ]
            ],
            'notes' => 'Disbursement against General',
            'status' => 'Released & Reconciled',
            'created_at' => '2024-10-12T10:00:00.000Z'
        ],
        [
            'id' => 'pay-1793976590000',
            'voucher_no' => 'PV-REC-44005',
            'company_id' => 'rayan-corp-uae',
            'currency' => 'AED',
            'currency_symbol' => 'AED ',
            'vendor_id' => 'vend-mw3q187t',
            'vendor_name' => 'M/S GENERAL EXPENSES FOR THE PROJECT',
            'payment_date' => '2024-03-22',
            'payment_mode' => 'Online',
            'reference_no' => 'Cash / Bank Transfer',
            'amount_paid' => 99.01,
            'allocations' => [
                [
                    'bill_id' => 'bill-1793976570260',
                    'bill_no' => 'BILL-REC-1005',
                    'vendor_invoice_no' => 'General',
                    'amount_allocated' => 99.01
                ]
            ],
            'notes' => 'Disbursement against General',
            'status' => 'Released & Reconciled',
            'created_at' => '2024-03-22T10:00:00.000Z'
        ],
        [
            'id' => 'pay-1793977952016',
            'voucher_no' => 'PV-REC-44006',
            'company_id' => 'rayan-corp-uae',
            'currency' => 'AED',
            'currency_symbol' => 'AED ',
            'vendor_id' => 'vend-mw3q187t',
            'vendor_name' => 'M/S GENERAL EXPENSES FOR THE PROJECT',
            'payment_date' => '2024-07-15',
            'payment_mode' => 'Online',
            'reference_no' => 'Cash / Bank Transfer',
            'amount_paid' => 9902.52,
            'allocations' => [
                [
                    'bill_id' => 'bill-1793977952016',
                    'bill_no' => 'BILL-REC-1006',
                    'vendor_invoice_no' => 'General',
                    'amount_allocated' => 9902.52
                ]
            ],
            'notes' => 'Disbursement against General',
            'status' => 'Released & Reconciled',
            'created_at' => '2024-07-15T10:00:00.000Z'
        ]
    ];

    if (!isset($data['vendor_payments']) || !is_array($data['vendor_payments'])) {
        $data['vendor_payments'] = [];
    }
    foreach ($canonicalVendorPayments as $cPay) {
        $found = false;
        foreach ($data['vendor_payments'] as &$vp) {
            if (($vp['id'] ?? '') === $cPay['id'] || ($vp['voucher_no'] ?? '') === $cPay['voucher_no']) {
                $vp = array_merge($vp, $cPay);
                $found = true;
                break;
            }
        }
        unset($vp);
        if (!$found) {
            $data['vendor_payments'][] = $cPay;
        }
    }

    usort($data['vendor_payments'], function($a, $b) {
        return strcmp($b['voucher_no'] ?? '', $a['voucher_no'] ?? '');
    });

    // 3. Mark the 6 purchase bills BILL-REC-1001 to BILL-REC-1006 as paid
    $paidBills = [
        'BILL-REC-1001' => 47231.00,
        'BILL-REC-1002' => 18500.00,
        'BILL-REC-1003' => 110000.00,
        'BILL-REC-1004' => 129864.48,
        'BILL-REC-1005' => 99.01,
        'BILL-REC-1006' => 9902.52
    ];
    if (!empty($data['purchase_bills']) && is_array($data['purchase_bills'])) {
        foreach ($data['purchase_bills'] as &$pb) {
            $bNo = $pb['bill_no'] ?? '';
            if (isset($paidBills[$bNo])) {
                $pb['amount_paid'] = $paidBills[$bNo];
                $pb['balance_due'] = 0.00;
                $pb['status'] = 'paid';
            }
        }
        unset($pb);
    }

    // 4. Ensure Outward Bank Transfers for the 6 Payment-Out Vouchers
    if (!isset($data['bank_transfers']) || !is_array($data['bank_transfers'])) {
        $data['bank_transfers'] = [];
    }
    $outwardWires = [
        [
            'id' => 'wire-pv-rec-44001',
            'payment_id' => 'pay-1793974452744',
            'voucher_no' => 'PV-REC-44001',
            'reference_no' => 'PV-REC-44001',
            'company_id' => 'rayan-corp-uae',
            'date' => '2023-09-13',
            'source_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S GENERAL EXPENSES FOR THE PROJECT',
            'amount' => 47231.00,
            'currency' => 'AED',
            'type' => 'outward',
            'type_label' => 'Outward Vendor Remittance (PV-REC-44001)',
            'purpose' => 'Disbursement against BILL-REC-1001 (Mina Palace Laundry Refurbishment Work)',
            'status' => 'Cleared',
            'created_at' => '2023-09-13T10:00:00.000Z'
        ],
        [
            'id' => 'wire-pv-rec-44002',
            'payment_id' => 'pay-1793974978543',
            'voucher_no' => 'PV-REC-44002',
            'reference_no' => 'PV-REC-44002',
            'company_id' => 'rayan-corp-uae',
            'date' => '2023-07-06',
            'source_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S GENERAL EXPENSES FOR THE PROJECT',
            'amount' => 18500.00,
            'currency' => 'AED',
            'type' => 'outward',
            'type_label' => 'Outward Vendor Remittance (PV-REC-44002)',
            'purpose' => 'Disbursement against BILL-REC-1002 (GIC - MBZ City Villa #43)',
            'status' => 'Cleared',
            'created_at' => '2023-07-06T10:00:00.000Z'
        ],
        [
            'id' => 'wire-pv-rec-44003',
            'payment_id' => 'pay-1793975240000',
            'voucher_no' => 'PV-REC-44003',
            'reference_no' => 'PV-REC-44003',
            'company_id' => 'rayan-corp-uae',
            'date' => '2024-11-15',
            'source_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S GENERAL EXPENSES FOR THE PROJECT',
            'amount' => 110000.00,
            'currency' => 'AED',
            'type' => 'outward',
            'type_label' => 'Outward Vendor Remittance (PV-REC-44003)',
            'purpose' => 'Disbursement against BILL-REC-1003 (Hayat Communications Properties)',
            'status' => 'Cleared',
            'created_at' => '2024-11-15T10:00:00.000Z'
        ],
        [
            'id' => 'wire-pv-rec-44004',
            'payment_id' => 'pay-1793976417852',
            'voucher_no' => 'PV-REC-44004',
            'reference_no' => 'PV-REC-44004',
            'company_id' => 'rayan-corp-uae',
            'date' => '2024-10-12',
            'source_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S GENERAL EXPENSES FOR THE PROJECT',
            'amount' => 129864.48,
            'currency' => 'AED',
            'type' => 'outward',
            'type_label' => 'Outward Vendor Remittance (PV-REC-44004)',
            'purpose' => 'Disbursement against BILL-REC-1004 (Serenia Residences Palm Jumeirah)',
            'status' => 'Cleared',
            'created_at' => '2024-10-12T10:00:00.000Z'
        ],
        [
            'id' => 'wire-pv-rec-44005',
            'payment_id' => 'pay-1793976590000',
            'voucher_no' => 'PV-REC-44005',
            'reference_no' => 'PV-REC-44005',
            'company_id' => 'rayan-corp-uae',
            'date' => '2024-03-22',
            'source_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S GENERAL EXPENSES FOR THE PROJECT',
            'amount' => 99.01,
            'currency' => 'AED',
            'type' => 'outward',
            'type_label' => 'Outward Vendor Remittance (PV-REC-44005)',
            'purpose' => 'Disbursement against BILL-REC-1005 (Porsche service Centre Mussafah)',
            'status' => 'Cleared',
            'created_at' => '2024-03-22T10:00:00.000Z'
        ],
        [
            'id' => 'wire-pv-rec-44006',
            'payment_id' => 'pay-1793977952016',
            'voucher_no' => 'PV-REC-44006',
            'reference_no' => 'PV-REC-44006',
            'company_id' => 'rayan-corp-uae',
            'date' => '2024-07-15',
            'source_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S GENERAL EXPENSES FOR THE PROJECT',
            'amount' => 9902.52,
            'currency' => 'AED',
            'type' => 'outward',
            'type_label' => 'Outward Vendor Remittance (PV-REC-44006)',
            'purpose' => 'Disbursement against BILL-REC-1006 (Cafe Bateel @ Yas Mall)',
            'status' => 'Cleared',
            'created_at' => '2024-07-15T10:00:00.000Z'
        ]
    ];
    foreach ($outwardWires as $ow) {
        $foundOw = false;
        foreach ($data['bank_transfers'] as &$bt) {
            if (($bt['id'] ?? '') === $ow['id'] || ($bt['payment_id'] ?? '') === $ow['payment_id'] || ($bt['reference_no'] ?? '') === $ow['reference_no']) {
                $bt = array_merge($bt, $ow);
                $foundOw = true;
                break;
            }
        }
        unset($bt);
        if (!$foundOw) {
            $data['bank_transfers'][] = $ow;
        }
    }

    // 5. Ensure Inward Bank Transfers for All 39 Online Receipts
    $missingInwardWires = [
        [
            'id' => 'wire-rcp-rec-mvwq4r8p',
            'receipt_id' => 'rec-mvwq4r8p',
            'company_id' => 'rayan-corp-uae',
            'reference_no' => 'PHUB287277788',
            'date' => '2023-12-20',
            'source_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S HAYAT COMMUNICATIONS LLC',
            'amount' => 42525.00,
            'currency' => 'AED',
            'type' => 'inward',
            'type_label' => 'Inward Client Wire (REC-RV-44004)',
            'purpose' => 'Client Wire Settlement against REC-RV-44004',
            'status' => 'Cleared',
            'created_at' => '2023-12-20T10:00:00.000Z'
        ],
        [
            'id' => 'wire-rcp-rec-mvxemwxo',
            'receipt_id' => 'rec-mvxemwxo',
            'company_id' => 'rayan-corp-uae',
            'reference_no' => 'PHUB564873075',
            'date' => '2025-11-08',
            'source_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S MAP OUT DECOR TECHNICAL SERVICES LLC',
            'amount' => 19668.60,
            'currency' => 'AED',
            'type' => 'inward',
            'type_label' => 'Inward Client Wire (REC-RV-44027)',
            'purpose' => 'Client Wire Settlement against REC-RV-44027',
            'status' => 'Cleared',
            'created_at' => '2025-11-08T10:00:00.000Z'
        ],
        [
            'id' => 'wire-rcp-rec-mvz0onzn',
            'receipt_id' => 'rec-mvz0onzn',
            'company_id' => 'rayan-corp-uae',
            'reference_no' => 'RGL-44039-2026',
            'date' => '2026-05-15',
            'source_bank' => 'Corporate Treasury / Gateway',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S IRON BEAM GENERAL CONTRACTING LLC',
            'amount' => 4179.00,
            'currency' => 'AED',
            'type' => 'inward',
            'type_label' => 'Inward Client Wire (REC-RV-44039)',
            'purpose' => 'Payment Received by Rayan Group Payment Link',
            'status' => 'Cleared',
            'created_at' => '2026-05-15T10:00:00.000Z'
        ],
        [
            'id' => 'wire-rcp-rec-mvz0n5m8',
            'receipt_id' => 'rec-mvz0n5m8',
            'company_id' => 'rayan-corp-uae',
            'reference_no' => 'RGL-44047-2026',
            'date' => '2026-06-23',
            'source_bank' => 'Corporate Treasury / Gateway',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S IRON BEAM GENERAL CONTRACTING LLC',
            'amount' => 6300.00,
            'currency' => 'AED',
            'type' => 'inward',
            'type_label' => 'Inward Client Wire (REC-RV-44047)',
            'purpose' => 'Payment Received by Rayan Group Payment Link',
            'status' => 'Cleared',
            'created_at' => '2026-06-23T10:00:00.000Z'
        ],
        [
            'id' => 'wire-rcp-rec-mvz0j0x4',
            'receipt_id' => 'rec-mvz0j0x4',
            'company_id' => 'rayan-corp-uae',
            'reference_no' => 'RGL-44051-2026',
            'date' => '2026-08-03',
            'source_bank' => 'Corporate Treasury / Gateway',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S IRON BEAM GENERAL CONTRACTING LLC',
            'amount' => 5512.50,
            'currency' => 'AED',
            'type' => 'inward',
            'type_label' => 'Inward Client Wire (REC-RV-44051)',
            'purpose' => 'Payment Received by Rayan Group Payment Link',
            'status' => 'Cleared',
            'created_at' => '2026-08-03T10:00:00.000Z'
        ],
        [
            'id' => 'wire-rcp-rec-mvz0k0gr',
            'receipt_id' => 'rec-mvz0k0gr',
            'company_id' => 'rayan-corp-uae',
            'reference_no' => 'RGL-44052-2026',
            'date' => '2026-08-03',
            'source_bank' => 'Corporate Treasury / Gateway',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S IRON BEAM GENERAL CONTRACTING LLC',
            'amount' => 6329.51,
            'currency' => 'AED',
            'type' => 'inward',
            'type_label' => 'Inward Client Wire (REC-RV-44052)',
            'purpose' => 'Payment Received by Rayan Group Payment Link',
            'status' => 'Cleared',
            'created_at' => '2026-08-03T10:00:00.000Z'
        ],
        [
            'id' => 'wire-rcp-rec-mvz0pnba',
            'receipt_id' => 'rec-mvz0pnba',
            'company_id' => 'rayan-corp-uae',
            'reference_no' => 'RGL-44054-2026',
            'date' => '2026-09-08',
            'source_bank' => 'Corporate Treasury / Gateway',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S IRON BEAM GENERAL CONTRACTING LLC',
            'amount' => 3782.63,
            'currency' => 'AED',
            'type' => 'inward',
            'type_label' => 'Inward Client Wire (REC-RV-44054)',
            'purpose' => 'Payment Received by Rayan Group Payment Link',
            'status' => 'Cleared',
            'created_at' => '2026-09-08T10:00:00.000Z'
        ],
        [
            'id' => 'wire-rcp-rec-mvy5qam2',
            'receipt_id' => 'rec-mvy5qam2',
            'company_id' => 'rayan-corp-uae',
            'reference_no' => 'ADB05116-2',
            'date' => '2026-09-14',
            'source_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S AYAT TECHNICAL SERVICES EST.',
            'amount' => 4743.70,
            'currency' => 'AED',
            'type' => 'inward',
            'type_label' => 'Inward Client Wire (REC-RV-44057)',
            'purpose' => 'Client Wire Settlement against REC-RV-44057',
            'status' => 'Cleared',
            'created_at' => '2026-09-14T10:00:00.000Z'
        ],
        [
            'id' => 'wire-rcp-rec-mvyu9b7z',
            'receipt_id' => 'rec-mvyu9b7z',
            'company_id' => 'rayan-corp-uae',
            'reference_no' => 'PHUB717651099',
            'date' => '2026-09-14',
            'source_bank' => 'First Abu Dhabi Bank (FAB)',
            'source_account_id' => 'bank-fab-group',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S BUILDARA GENERAL CONTRACTING - L.L.C',
            'amount' => 11966.85,
            'currency' => 'AED',
            'type' => 'inward',
            'type_label' => 'Inward Client Wire (REC-RV-44058)',
            'purpose' => 'Client Wire Settlement against REC-RV-44058',
            'status' => 'Cleared',
            'created_at' => '2026-09-14T10:00:00.000Z'
        ]
    ];
    foreach ($missingInwardWires as $iw) {
        $foundIw = false;
        foreach ($data['bank_transfers'] as &$bt) {
            if (($bt['id'] ?? '') === $iw['id'] || ($bt['receipt_id'] ?? '') === $iw['receipt_id']) {
                $bt = array_merge($bt, $iw);
                $foundIw = true;
                break;
            }
        }
        unset($bt);
        if (!$foundIw) {
            $data['bank_transfers'][] = $iw;
        }
    }

    usort($data['bank_transfers'], function($a, $b) {
        return strcmp($b['date'] ?? '', $a['date'] ?? '');
    });

    // 6. Ensure Cheque 001464 for REC-RV-44003 is present in cheques
    if (!isset($data['cheques']) || !is_array($data['cheques'])) {
        $data['cheques'] = [];
    }
    $chq1464 = [
        'id' => 'chq-rcp-rec-mvwphhbz',
        'receipt_id' => 'rec-mvwphhbz',
        'company_id' => 'rayan-corp-uae',
        'type' => 'inward',
        'cheque_no' => '001464',
        'bank_name' => 'Emirates NBD',
        'branch' => 'Abu Dhabi',
        'party_name' => 'M/S MORGANTI GCC l UAE',
        'date' => '2023-09-09',
        'amount' => 12700.00,
        'currency' => 'AED',
        'status' => 'Cleared',
        'notes' => 'Customer Cheque Clearance against REC-RV-44003',
        'created_at' => '2023-09-09T10:00:00.000Z'
    ];
    $foundChq = false;
    foreach ($data['cheques'] as &$cq) {
        if (($cq['cheque_no'] ?? '') === '001464' || ($cq['receipt_id'] ?? '') === 'rec-mvwphhbz') {
            $cq = array_merge($cq, $chq1464);
            $foundChq = true;
            break;
        }
    }
    unset($cq);
    if (!$foundChq) {
        $data['cheques'][] = $chq1464;
    }

    usort($data['cheques'], function($a, $b) {
        return strcmp($b['date'] ?? '', $a['date'] ?? '');
    });

    // 7. Ensure Cash Vouchers CV-REC-RV-44044 & CV-REC-RV-44028 are standardized into RAYAN E-Wallets
    if (!isset($data['cash_vouchers']) || !is_array($data['cash_vouchers'])) {
        $data['cash_vouchers'] = [];
    }
    foreach ($data['cash_vouchers'] as &$cv) {
        $vNo = $cv['voucher_no'] ?? '';
        $rId = $cv['receipt_id'] ?? '';
        if ($rId === 'rec-mw5amp7q' || $vNo === 'CV-REC-RV-44064' || $vNo === 'CV-REC-RV-44044') {
            $cv['voucher_no'] = 'CV-REC-RV-44044';
            $cv['register_id'] = 'cash-mw5esv3w';
            $cv['register_name'] = 'RAYAN E-Wallets';
            $cv['date'] = '2026-06-09';
            $cv['amount'] = 9000.00;
            $cv['payee'] = 'M/S MOBIN AL LISAILI VILLA DUBAI';
            $cv['purpose'] = 'Customer Cash Collection for M/S MOBIN AL LISAILI VILLA DUBAI (REC-RV-44044)';
            $cv['custodian'] = 'Arshad Alam Shaikh';
            $cv['type'] = 'inflow';
            $cv['status'] = 'Approved';
        }
        if ($rId === 'rec-mw0m7mcs' || $vNo === 'CV-REC-RV-44093' || $vNo === 'CV-REC-RV-44028') {
            $cv['voucher_no'] = 'CV-REC-RV-44028';
            $cv['register_id'] = 'cash-mw5esv3w';
            $cv['register_name'] = 'RAYAN E-Wallets';
            $cv['date'] = '2025-11-14';
            $cv['amount'] = 5000.00;
            $cv['payee'] = 'M/S HLN TECHNICAL SERVICES LLC';
            $cv['purpose'] = 'Customer Cash Collection for M/S HLN TECHNICAL SERVICES LLC (REC-RV-44028)';
            $cv['custodian'] = 'Arshad Alam Shaikh';
            $cv['type'] = 'inflow';
            $cv['status'] = 'Approved';
        }
    }
    unset($cv);
}
`;

// Insert reconcileAllPaymentRecordsPhp right before function loadFinanceDb
php = php.replace('function loadFinanceDb($pdo, $dataFile, $candidates) {', reconcileFunctionPhp + '\nfunction loadFinanceDb($pdo, $dataFile, $candidates) {');

// 2. In purgeDummyFinanceRecords, make sure canonical payment IDs are preserved in validPayIds
const targetValidPay = `    $validPayIds = [];
    if (!empty($data['vendor_payments']) && is_array($data['vendor_payments'])) {`;

const replValidPay = `    $validPayIds = [];
    $canonicalVpIds = [
        'pay-1793642108024', 'pay-1793974452744',
        'pay-1793890308989', 'pay-1793974978543',
        'pay-1793894011459', 'pay-1793975240000',
        'pay-1793894232210', 'pay-1793976417852',
        'pay-1793894993039', 'pay-1793976590000',
        'pay-1793898169781', 'pay-1793977952016'
    ];
    foreach ($canonicalVpIds as $cid) {
        $validPayIds[$cid] = true;
    }
    if (!empty($data['vendor_payments']) && is_array($data['vendor_payments'])) {`;
php = php.replace(targetValidPay, replValidPay);

// 3. In loadFinanceDb, exempt canonical vouchers from deleted_vendor_payments
const targetLoadDel = `                    // Retrieve deleted payment vouchers blacklist to prevent resurrection
                    $deletedVpList = [];
                    try {
                        $rawDel = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'deleted_vendor_payments'")->fetchColumn();`;

const replLoadDel = `                    // Retrieve deleted payment vouchers blacklist to prevent resurrection (exempting canonical project vouchers)
                    $deletedVpList = [];
                    $canonicalVpExempt = [
                        'pv-rec-44001' => true, 'pv-rec-44002' => true, 'pv-rec-44003' => true,
                        'pv-rec-44004' => true, 'pv-rec-44005' => true, 'pv-rec-44006' => true,
                        'pay-1793642108024' => true, 'pay-1793974452744' => true,
                        'pay-1793890308989' => true, 'pay-1793974978543' => true,
                        'pay-1793894011459' => true, 'pay-1793975240000' => true,
                        'pay-1793894232210' => true, 'pay-1793976417852' => true,
                        'pay-1793894993039' => true, 'pay-1793976590000' => true,
                        'pay-1793898169781' => true, 'pay-1793977952016' => true
                    ];
                    try {
                        $rawDel = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'deleted_vendor_payments'")->fetchColumn();
                        if ($rawDel) {
                            $curDelArr = json_decode($rawDel, true) ?: [];
                            $deletedVpList = array_values(array_filter($curDelArr, function($x) use ($canonicalVpExempt) {
                                return !isset($canonicalVpExempt[strtolower($x)]);
                            }));
                        }
                    } catch (Exception $e) {}`;
php = php.replace(targetLoadDel, replLoadDel);

// 4. In syncFromRelationalTables, exempt canonical vouchers from deleted_vendor_payments
const targetSyncDel = `        $deletedVpList = [];
        try {
            $rawDel = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'deleted_vendor_payments'")->fetchColumn();`;

const replSyncDel = `        $deletedVpList = [];
        $canonicalVpExempt = [
            'pv-rec-44001' => true, 'pv-rec-44002' => true, 'pv-rec-44003' => true,
            'pv-rec-44004' => true, 'pv-rec-44005' => true, 'pv-rec-44006' => true,
            'pay-1793642108024' => true, 'pay-1793974452744' => true,
            'pay-1793890308989' => true, 'pay-1793974978543' => true,
            'pay-1793894011459' => true, 'pay-1793975240000' => true,
            'pay-1793894232210' => true, 'pay-1793976417852' => true,
            'pay-1793894993039' => true, 'pay-1793976590000' => true,
            'pay-1793898169781' => true, 'pay-1793977952016' => true
        ];
        try {
            $rawDel = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'deleted_vendor_payments'")->fetchColumn();
            if ($rawDel) {
                $curDelArr = json_decode($rawDel, true) ?: [];
                $deletedVpList = array_values(array_filter($curDelArr, function($x) use ($canonicalVpExempt) {
                    return !isset($canonicalVpExempt[strtolower($x)]);
                }));
            }
        } catch (Exception $e) {}`;
php = php.replace(targetSyncDel, replSyncDel);

// 5. In loadFinanceDb, call reconcileAllPaymentRecordsPhp before recalculateAllFinanceBalances
const targetRecalc = `                    recalculateAllFinanceBalances($data);
                    syncToRelationalTables($pdo, $data);
                    saveFinanceDb($pdo, $dataFile, $data, $candidates);
                    return $data;`;

const replRecalc = `                    reconcileAllPaymentRecordsPhp($data, $pdo);
                    recalculateAllFinanceBalances($data);
                    syncToRelationalTables($pdo, $data);
                    saveFinanceDb($pdo, $dataFile, $data, $candidates);
                    return $data;`;
php = php.replace(targetRecalc, replRecalc);

// 6. Bump version_tag to v74_all_payment_records_reconciled
php = php.replace(`'version_tag' => 'v73_pv_44006_active',`, `'version_tag' => 'v74_all_payment_records_reconciled',`);

fs.writeFileSync('public/api/finance.php', php, 'utf8');
console.log('Successfully updated public/api/finance.php!');

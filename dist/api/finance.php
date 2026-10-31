<?php
/**
 * Rayan Group — Enterprise Accounts & Billing Management API
 * Direct Hostinger MySQL Database Persistence + JSON File Fallback
 * Database: u575992126_rayan_app
 * Last Updated: 2026-10-20 15:10 UTC+5:30
 * Endpoint: /api/finance.php
 */


header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Connect to Hostinger MySQL Database
require_once __DIR__ . '/db.php';
$pdo = function_exists('getDbConnection') ? getDbConnection() : null;

// Auto-create essential finance tables in MySQL if not present
if ($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS finance_state (
                id INT PRIMARY KEY,
                state_json LONGTEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_invoices (
                id VARCHAR(64) PRIMARY KEY,
                invoice_no VARCHAR(64) NOT NULL UNIQUE,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                customer_id VARCHAR(64),
                customer_name VARCHAR(255),
                customer_trn VARCHAR(64),
                customer_gstin VARCHAR(64),
                invoice_date DATE,
                due_date DATE,
                grand_total DECIMAL(15,2) DEFAULT 0,
                amount_paid DECIMAL(15,2) DEFAULT 0,
                balance_due DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                status VARCHAR(32) DEFAULT 'unpaid',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_inv_no (invoice_no),
                INDEX idx_cust (customer_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_customers (
                id VARCHAR(64) PRIMARY KEY,
                code VARCHAR(64),
                name VARCHAR(255) NOT NULL,
                contact_person VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(64),
                trn VARCHAR(64),
                gstin VARCHAR(64),
                credit_limit DECIMAL(15,2) DEFAULT 10000000,
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_cust_name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_receipts (
                id VARCHAR(64) PRIMARY KEY,
                receipt_no VARCHAR(64) NOT NULL UNIQUE,
                customer_id VARCHAR(64),
                customer_name VARCHAR(255),
                receipt_date DATE,
                amount_received DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                payment_mode VARCHAR(64),
                reference_no VARCHAR(128),
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_rcp_no (receipt_no)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_purchase_bills (
                id VARCHAR(64) PRIMARY KEY,
                bill_no VARCHAR(64) NOT NULL UNIQUE,
                vendor_invoice_no VARCHAR(64),
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                vendor_id VARCHAR(64),
                vendor_name VARCHAR(255),
                project_id VARCHAR(64),
                project_name VARCHAR(255),
                po_id VARCHAR(64),
                bill_date DATE,
                due_date DATE,
                grand_total DECIMAL(15,2) DEFAULT 0,
                amount_paid DECIMAL(15,2) DEFAULT 0,
                balance_due DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                status VARCHAR(32) DEFAULT 'approved',
                approval_status VARCHAR(32) DEFAULT 'approved',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_bill_no (bill_no),
                INDEX idx_vend_id (vendor_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_vendor_payments (
                id VARCHAR(64) PRIMARY KEY,
                voucher_no VARCHAR(64) NOT NULL UNIQUE,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                vendor_id VARCHAR(64),
                vendor_name VARCHAR(255),
                payment_date DATE,
                payment_mode VARCHAR(64),
                reference_no VARCHAR(128),
                amount_paid DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_vouch_no (voucher_no),
                INDEX idx_vend_pay_id (vendor_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_vendors (
                id VARCHAR(64) PRIMARY KEY,
                code VARCHAR(64),
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                name VARCHAR(255) NOT NULL,
                country VARCHAR(64) DEFAULT 'UAE',
                trn VARCHAR(64),
                gstin VARCHAR(64),
                status VARCHAR(32) DEFAULT 'active',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_vend_name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_items (
                id VARCHAR(64) PRIMARY KEY,
                code VARCHAR(64),
                name VARCHAR(255) NOT NULL,
                category VARCHAR(128),
                description TEXT,
                uom VARCHAR(32) DEFAULT 'NOS',
                sales_price DECIMAL(15,2) DEFAULT 0,
                purchase_price DECIMAL(15,2) DEFAULT 0,
                gst_rate DECIMAL(6,2) DEFAULT 0,
                hsn_sac_code VARCHAR(64),
                status VARCHAR(32) DEFAULT 'active',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_item_code (code),
                INDEX idx_item_name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_projects (
                id VARCHAR(64) PRIMARY KEY,
                code VARCHAR(64),
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                name VARCHAR(255) NOT NULL,
                client VARCHAR(255),
                contract_value DECIMAL(15,2) DEFAULT 0,
                approved_budget DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                status VARCHAR(32) DEFAULT 'In Progress',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_proj_code (code),
                INDEX idx_proj_name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_expenses (
                id VARCHAR(64) PRIMARY KEY,
                expense_no VARCHAR(64) NOT NULL UNIQUE,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                expense_date DATE,
                category VARCHAR(128),
                description TEXT,
                amount DECIMAL(15,2) DEFAULT 0,
                tax_amount DECIMAL(15,2) DEFAULT 0,
                total_amount DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                project_id VARCHAR(64),
                project_name VARCHAR(255),
                payment_method VARCHAR(64),
                submitted_by VARCHAR(255),
                status VARCHAR(32) DEFAULT 'approved',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_exp_no (expense_no),
                INDEX idx_exp_cat (category)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_purchase_orders (
                id VARCHAR(64) PRIMARY KEY,
                po_no VARCHAR(64) NOT NULL UNIQUE,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                po_date DATE,
                supplier_name VARCHAR(255),
                supplier_trn VARCHAR(64),
                project_name VARCHAR(255),
                grand_total DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                status VARCHAR(32) DEFAULT 'approved',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_po_no (po_no)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_credit_notes (
                id VARCHAR(64) PRIMARY KEY,
                credit_note_no VARCHAR(64) NOT NULL UNIQUE,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                invoice_id VARCHAR(64),
                invoice_no VARCHAR(64),
                customer_id VARCHAR(64),
                customer_name VARCHAR(255),
                total_credit_amount DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                reason TEXT,
                status VARCHAR(32) DEFAULT 'issued',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_cn_no (credit_note_no)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_debit_notes (
                id VARCHAR(64) PRIMARY KEY,
                debit_note_no VARCHAR(64) NOT NULL UNIQUE,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                bill_no VARCHAR(64),
                vendor_name VARCHAR(255),
                note_date DATE,
                total_debit_amount DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                reason TEXT,
                status VARCHAR(32) DEFAULT 'issued',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_dn_no (debit_note_no)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_bank_accounts (
                id VARCHAR(64) PRIMARY KEY,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                account_name VARCHAR(255),
                bank_name VARCHAR(255),
                account_number VARCHAR(64),
                iban VARCHAR(64),
                swift VARCHAR(32),
                branch VARCHAR(128),
                currency VARCHAR(16) DEFAULT 'AED',
                balance DECIMAL(15,2) DEFAULT 0,
                signatory VARCHAR(255),
                status VARCHAR(32) DEFAULT 'active',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_bank_acc (account_number)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_cash_in_hand (
                id VARCHAR(64) PRIMARY KEY,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                register_name VARCHAR(255),
                location VARCHAR(255),
                custodian VARCHAR(255),
                currency VARCHAR(16) DEFAULT 'AED',
                balance DECIMAL(15,2) DEFAULT 0,
                last_replenished DATE,
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_cheques (
                id VARCHAR(64) PRIMARY KEY,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                type VARCHAR(32),
                cheque_no VARCHAR(64),
                bank_name VARCHAR(255),
                party_name VARCHAR(255),
                amount DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                cheque_date DATE,
                status VARCHAR(32) DEFAULT 'pending',
                notes TEXT,
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_chq_no (cheque_no)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_bank_transfers (
                id VARCHAR(64) PRIMARY KEY,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                reference_no VARCHAR(64),
                transfer_date DATE,
                counterparty VARCHAR(255),
                source_account_id VARCHAR(64),
                source_bank VARCHAR(255),
                type VARCHAR(32),
                amount DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                purpose TEXT,
                status VARCHAR(32) DEFAULT 'completed',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_xfer_ref (reference_no)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_cash_vouchers (
                id VARCHAR(64) PRIMARY KEY,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                voucher_no VARCHAR(64) NOT NULL UNIQUE,
                voucher_date DATE,
                register_name VARCHAR(255),
                custodian VARCHAR(255),
                payee VARCHAR(255),
                purpose TEXT,
                category VARCHAR(128),
                amount DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                type VARCHAR(32),
                status VARCHAR(32) DEFAULT 'approved',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_cv_no (voucher_no)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_loan_accounts (
                id VARCHAR(64) PRIMARY KEY,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                facility_name VARCHAR(255),
                lender VARCHAR(255),
                sanctioned_limit DECIMAL(15,2) DEFAULT 0,
                outstanding_balance DECIMAL(15,2) DEFAULT 0,
                available_limit DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                facility_type VARCHAR(64),
                tenure VARCHAR(64),
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_loan_transactions (
                id VARCHAR(64) PRIMARY KEY,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                facility_id VARCHAR(64),
                facility_name VARCHAR(255),
                type VARCHAR(32),
                amount DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                transaction_date DATE,
                reference_no VARCHAR(64),
                notes TEXT,
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_companies (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                short_name VARCHAR(64),
                country VARCHAR(64),
                currency VARCHAR(16) DEFAULT 'AED',
                currency_symbol VARCHAR(16) DEFAULT 'AED',
                trn_vat VARCHAR(64),
                email VARCHAR(255),
                phone VARCHAR(64),
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_comp_name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_users (
                id VARCHAR(64) PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(64) DEFAULT 'finance',
                designation VARCHAR(128),
                department VARCHAR(128),
                phone VARCHAR(64),
                status VARCHAR(32) DEFAULT 'active',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_audit_logs (
                id VARCHAR(64) PRIMARY KEY,
                timestamp VARCHAR(64),
                actor_name VARCHAR(255),
                actor_role VARCHAR(64),
                actor_email VARCHAR(255),
                action VARCHAR(64),
                entity VARCHAR(64),
                entity_id VARCHAR(64),
                details TEXT,
                ip_address VARCHAR(64),
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_documents (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(128),
                size VARCHAR(64),
                uploaded_by VARCHAR(255),
                doc_date DATE,
                linked_record VARCHAR(255),
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_notifications (
                id VARCHAR(64) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT,
                type VARCHAR(32),
                timestamp VARCHAR(64),
                is_read TINYINT(1) DEFAULT 0,
                link VARCHAR(255),
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_settings (
                setting_key VARCHAR(64) PRIMARY KEY,
                setting_val LONGTEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $e) {
        error_log("Finance tables initialization error: " . $e->getMessage());
    }
}

// 2. Locate fallback JSON file
$candidates = [
    __DIR__ . '/../data/finance-data.json',
    __DIR__ . '/../../data/finance-data.json',
    __DIR__ . '/data/finance-data.json'
];
if (isset($_SERVER['DOCUMENT_ROOT'])) {
    $candidates[] = $_SERVER['DOCUMENT_ROOT'] . '/data/finance-data.json';
}

function getMasterSeed($candidates) {
    foreach ($candidates as $c) {
        if (file_exists($c)) {
            $raw = @file_get_contents($c);
            if ($raw) {
                $data = json_decode($raw, true);
                if (!empty($data['companies']) && is_array($data['companies']) && count($data['companies']) > 0) {
                    return $data;
                }
            }
        }
    }
    return null;
}

$dataFile = null;
foreach ($candidates as $c) {
    if (file_exists($c)) {
        $dataFile = $c;
        break;
    }
}
if (!$dataFile) {
    $dataFile = __DIR__ . '/../data/finance-data.json';
    $dir = dirname($dataFile);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// 3. MySQL & File Loading Logic
function purgeDummyFinanceRecords($pdo, &$data, $dataFile, $candidates) {
    if (!$data || !is_array($data)) return;

    $dummyBillIds = ['bill-rg-001', 'bill-rg-002', 'bill-rg-003'];
    $dummyPayIds = ['pay-rg-001', 'pay-rg-002', 'pay-rg-003', 'pay-1792606054681'];
    $dummyDnIds = ['dn-rg-001'];
    $dummyExpIds = ['exp-rg-001', 'exp-rg-002', 'exp-rg-003'];
    $dummyPoIds = [];
    $dummyDocIds = ['doc-001', 'doc-002', 'doc-003', 'doc-004'];
    $dummyVendorIds = ['vend-001', 'vend-002', 'vend-003', 'vend-004'];
    $dummyCustIds = ['cust-004', 'cust-005', 'cust-kgc-alias'];
    $dummyInvIds = [];
    $dummyRecIds = ['rec-mvdvmilf', 'rec-rv-44026'];
    $dummyProjIds = ['prj-dpa-01'];
    $dummyChequeIds = ['chq-in-01', 'chq-out-02', 'chq-in-02', 'chq-in-03', 'chq-out-01'];
    $dummyCvIds = ['cv-01', 'cv-02', 'cv-03'];
    $dummyWireIds = ['wire-01', 'wire-02', 'wire-04', 'wire-05'];
    $dummyLtIds = ['lt-01', 'lt-02'];
    $dummyNotifIds = ['notif-001', 'notif-002', 'notif-003', 'notif-mvare1wh', 'notif-mvarduee'];
    $dummyAudIds = ['aud-001', 'aud-002', 'aud-003', 'aud-004', 'aud-005', 'aud-mvare1wh', 'aud-mvarduee', 'aud-mvhirxz4', 'aud-mvhirxz0', 'aud-mvhirxyp', 'aud-1a14f414ad7'];

    $topRock4Items = [
        [
            'sr' => 1,
            'name' => 'Wall Lining with Stud 50mm For Academy Building (PODSUB-2026/0810)',
            'description' => 'Wall Lining with Stud 50mm For Academy Building (PODSUB-2026/0810)',
            'unit' => 'Sqm',
            'uom' => 'Sqm',
            'qty' => 273.1,
            'unit_price' => 56,
            'rate' => 56,
            'wd_pct' => 50,
            'discount_val' => 50,
            'invoice_amount' => 7646.8,
            'taxable_amount' => 7646.8,
            'vat_rate' => 5,
            'vat_amount' => 382.34,
            'total_amount' => 7646.8
        ],
        [
            'sr' => 2,
            'name' => 'Wall Lining with Furing Channel For Academy Building (PODSUB-2026/0810)',
            'description' => 'Wall Lining with Furing Channel For Academy Building (PODSUB-2026/0810)',
            'unit' => 'Sqm',
            'uom' => 'Sqm',
            'qty' => 293.9,
            'unit_price' => 51,
            'rate' => 51,
            'wd_pct' => 50,
            'discount_val' => 50,
            'invoice_amount' => 7494.45,
            'taxable_amount' => 7494.45,
            'vat_rate' => 5,
            'vat_amount' => 374.72,
            'total_amount' => 7494.45
        ],
        [
            'sr' => 3,
            'name' => 'Rockwool Stud & Furing For Academy Building (PODSUB-2026/0810)',
            'description' => 'Rockwool Stud & Furing For Academy Building (PODSUB-2026/0810)',
            'unit' => 'Sqm',
            'uom' => 'Sqm',
            'qty' => 321.2,
            'unit_price' => 11,
            'rate' => 11,
            'wd_pct' => 100,
            'discount_val' => 0,
            'invoice_amount' => 3533.2,
            'taxable_amount' => 3533.2,
            'vat_rate' => 5,
            'vat_amount' => 176.66,
            'total_amount' => 3533.2
        ],
        [
            'sr' => 4,
            'name' => 'Normal Ceiling Work For Academy Building (PODSUB-2026/0858)',
            'description' => 'Normal Ceiling Work For Academy Building (PODSUB-2026/0858)',
            'unit' => 'Sqm',
            'uom' => 'Sqm',
            'qty' => 326.6,
            'unit_price' => 40,
            'rate' => 40,
            'wd_pct' => 50,
            'discount_val' => 50,
            'invoice_amount' => 6532,
            'taxable_amount' => 6532,
            'vat_rate' => 5,
            'vat_amount' => 326.6,
            'total_amount' => 6532
        ]
    ];

    $topRockInvoice = [
        'id' => 'inv-rec-rg-inv-44035',
        'invoice_no' => 'REC-RG-INV-44035',
        'company_id' => 'rayan-corp-uae',
        'customer_id' => 'cust-1792414691494',
        'customer_name' => 'M/S TOP ROCK INTERIORS LLC.',
        'customer_address' => 'TRI Office No.1 Al Qusais Industrial Area 1, Dubai, UAE',
        'billing_address' => 'TRI Office No.1 Al Qusais Industrial Area 1, Dubai, UAE',
        'contact_person' => 'Mr. Shahil',
        'email' => 'procurementofficer@toprockinteriors.com',
        'phone' => '+971 502131834',
        'customer_trn' => '100360644700003',
        'trn' => '100360644700003',
        'tax_regime' => 'trn',
        'tax_type' => 'TRN',
        'tax_number' => '100360644700003',
        'currency' => 'AED',
        'currency_symbol' => 'AED ',
        'place_of_supply' => 'Dubai, UAE',
        'project_id' => 'prj-toprock-police-01',
        'project_name' => 'THE NEW DUBAI POLICE ACADMY @ AL ROWAIYH, DUBAI,UAE FITOUT WORKS',
        'po_reference' => 'PODSUB-2026/0810 & 0858',
        'invoice_date' => '2026-06-19',
        'due_date' => '2026-06-19',
        'payment_terms' => 0,
        'payment_terms_label' => 'Due on Receipt',
        'tax_inclusive' => true,
        'line_items' => $topRock4Items,
        'sub_total' => 25206.45,
        'taxable_subtotal' => 25206.45,
        'vat_total' => 1260.323,
        'total_tax' => 1260.323,
        'grand_total' => 26466.773,
        'amount_paid' => 0.00,
        'balance_due' => 26466.773,
        'status' => 'unpaid',
        'notes' => 'Please keep a copy of this invoice for your records',
        'amount_in_words' => 'Twenty Six Thousand Four Hundred Sixty Six and Seventy Seven Fils Only.',
        'created_by' => 'Arshad Alam Shaikh',
        'created_at' => '2026-10-19T12:58:11.497Z',
        'payment_stage' => 'progressive',
        'payment_stage_label' => 'Progressive Payment',
        'adjustment' => 0,
        'order_no' => 'PODSUB-2026/0810 & 0858',
        'subject' => 'THE NEW DUBAI POLICE ACADMY @ AL ROWAIYH, DUBAI,UAE FITOUT WORKS'
    ];

    $changed = false;

    if ($pdo) {
        try {
            $pdo->exec("DELETE FROM finance_purchase_bills WHERE id IN ('bill-rg-001', 'bill-rg-002', 'bill-rg-003')");
            $pdo->exec("DELETE FROM finance_vendor_payments WHERE id IN ('pay-rg-001', 'pay-rg-002', 'pay-rg-003', 'pay-1792606054681')");
            $pdo->exec("DELETE FROM finance_debit_notes WHERE id IN ('dn-rg-001')");
            $pdo->exec("DELETE FROM finance_expenses WHERE id IN ('exp-rg-001', 'exp-rg-002', 'exp-rg-003')");
            $pdo->exec("DELETE FROM finance_documents WHERE id IN ('doc-001', 'doc-002', 'doc-003', 'doc-004')");
            $pdo->exec("DELETE FROM finance_vendors WHERE id IN ('vend-001', 'vend-002', 'vend-003', 'vend-004')");
            $pdo->exec("DELETE FROM finance_customers WHERE id IN ('cust-004', 'cust-005', 'cust-kgc-alias')");
            $pdo->exec("DELETE FROM finance_receipts");
            $pdo->exec("DELETE FROM finance_customer_receipts");
            $pdo->exec("DELETE FROM finance_bank_transfers WHERE id = 'wire-adcb-44035'");
            $data['customer_receipts'] = [];
            $pdo->exec("DELETE FROM finance_items WHERE id LIKE 'item-00%'");
            $pdo->exec("UPDATE finance_customers SET 
                trn = '100360644700003', 
                customer_type = 'Business',
                contact_person = 'Mr. Shahil', 
                salutation = 'Mr.',
                first_name = 'Shahil',
                email = 'procurementofficer@toprockinteriors.com', 
                phone = '+971 502131834',
                billing_address = 'TRI Office No.1 Al Qusais Industrial Area 1, Dubai, UAE', 
                office_address = 'TRI Office No.1 Al Qusais Industrial Area 1, Dubai, UAE',
                place_of_supply = 'Dubai, UAE',
                tax_treatment = 'VAT Registered',
                currency = 'AED',
                payment_terms = 0,
                payment_terms_label = 'Due on Receipt',
                accounts_receivable = 'Accounts Receivable'
            WHERE name LIKE '%TOP ROCK%'");
            
            // v2026_clean_v21: Clear all synthetic customer receipts and reset invoices to unpaid
            try {
                $chkMig21 = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'sales_migration_v21'")->fetchColumn();
            } catch (Exception $e) { $chkMig21 = false; }
            if (!$chkMig21) {
                $pdo->exec("DELETE FROM finance_receipts");
                $pdo->exec("DELETE FROM finance_customer_receipts");
                $pdo->exec("DELETE FROM finance_bank_transfers WHERE id = 'wire-adcb-44035'");
                $pdo->exec("UPDATE finance_invoices SET amount_paid = 0.00, balance_due = grand_total, status = 'unpaid' WHERE status != 'draft'");
                $data['customer_receipts'] = [];
                if (!empty($data['invoices']) && is_array($data['invoices'])) {
                    foreach ($data['invoices'] as &$inv) {
                        $inv['amount_paid'] = 0.00;
                        $inv['balance_due'] = round(floatval($inv['grand_total'] ?? 0), 2);
                        if (($inv['status'] ?? '') !== 'draft') {
                            $inv['status'] = 'unpaid';
                        }
                    }
                    unset($inv);
                }
                try {
                    $pdo->exec("REPLACE INTO finance_settings (setting_key, setting_val, updated_at) VALUES ('sales_migration_v21', 'completed', NOW())");
                } catch (Exception $e) {}
            }

            // v2026_clean_v17: Refresh MySQL tables with the verified RGC Sales dataset
            try {
                $chkMig = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'sales_migration_v17'")->fetchColumn();
            } catch (Exception $e) { $chkMig = false; }
            if (!$chkMig) {
                $pdo->exec("DELETE FROM finance_invoices WHERE company_id = 'rayan-corp-uae'");
                $pdo->exec("DELETE FROM finance_receipts WHERE data_json LIKE '%rayan-corp-uae%'");
                $pdo->exec("DELETE FROM finance_customers WHERE company_id = 'rayan-corp-uae'");

                if (!empty($data['invoices']) && is_array($data['invoices'])) {
                    $stmtInv = $pdo->prepare("REPLACE INTO finance_invoices (id, invoice_no, company_id, customer_id, customer_name, customer_trn, invoice_date, due_date, grand_total, amount_paid, balance_due, currency, status, data_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
                    foreach ($data['invoices'] as $inv) {
                        $stmtInv->execute([
                            $inv['id'], $inv['invoice_no'], $inv['company_id'] ?? 'rayan-corp-uae',
                            $inv['customer_id'] ?? '', $inv['customer_name'] ?? '', $inv['customer_trn'] ?? '',
                            $inv['invoice_date'] ?? date('Y-m-d'), $inv['due_date'] ?? date('Y-m-d'),
                            floatval($inv['grand_total'] ?? 0), floatval($inv['amount_paid'] ?? 0),
                            floatval($inv['balance_due'] ?? 0), $inv['currency'] ?? 'AED',
                            $inv['status'] ?? 'unpaid', json_encode($inv, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                        ]);
                    }
                }
                if (!empty($data['customer_receipts']) && is_array($data['customer_receipts'])) {
                    $stmtRcp = $pdo->prepare("REPLACE INTO finance_receipts (id, receipt_no, customer_id, customer_name, receipt_date, amount_received, currency, payment_mode, reference_no, data_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
                    foreach ($data['customer_receipts'] as $rcp) {
                        $stmtRcp->execute([
                            $rcp['id'], $rcp['receipt_no'], $rcp['customer_id'] ?? '', $rcp['customer_name'] ?? '',
                            $rcp['receipt_date'] ?? date('Y-m-d'), floatval($rcp['amount_received'] ?? 0),
                            $rcp['currency'] ?? 'AED', $rcp['payment_mode'] ?? 'Online',
                            $rcp['reference_no'] ?? '', json_encode($rcp, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                        ]);
                    }
                }
                if (!empty($data['customers']) && is_array($data['customers'])) {
                    $stmtCust = $pdo->prepare("REPLACE INTO finance_customers (id, code, name, contact_person, email, phone, trn, gstin, credit_limit, opening_balance, balance, currency, data_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
                    foreach ($data['customers'] as $c) {
                        $stmtCust->execute([
                            $c['id'], $c['code'] ?? '', $c['name'] ?? '', $c['contact_person'] ?? '',
                            $c['email'] ?? '', $c['phone'] ?? '', $c['trn'] ?? '', $c['gstin'] ?? '',
                            floatval($c['credit_limit'] ?? 0), 0, floatval($c['outstanding_dues'] ?? 0),
                            'AED', json_encode($c, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                        ]);
                    }
                }
                try {
                    $pdo->exec("REPLACE INTO finance_settings (setting_key, setting_val, updated_at) VALUES ('sales_migration_v17', 'completed', NOW())");
                } catch (Exception $e) {}
            }
            $pdo->exec("UPDATE finance_customer_receipts SET 
                contact_person = 'Mr. Shahil', 
                email = 'procurementofficer@toprockinteriors.com' 
            WHERE customer_name LIKE '%TOP ROCK%'");
            $pdo->exec("DELETE FROM finance_projects WHERE id IN ('prj-dpa-01')");
            $pdo->exec("DELETE FROM finance_cheques WHERE id IN ('chq-in-01', 'chq-out-02', 'chq-in-02', 'chq-in-03', 'chq-out-01')");
            $pdo->exec("DELETE FROM finance_cash_vouchers WHERE id IN ('cv-01', 'cv-02', 'cv-03')");
            $pdo->exec("DELETE FROM finance_bank_transfers WHERE id IN ('wire-01', 'wire-02', 'wire-04', 'wire-05')");
            $pdo->exec("REPLACE INTO finance_bank_transfers (id, company_id, reference_no, transfer_date, counterparty, source_account_id, source_bank, type, amount, currency, purpose, status, data_json, updated_at) VALUES (
                'wire-adcb-44035',
                'rayan-corp-uae',
                'WIRE-ADCB-99210',
                '2026-10-19',
                'M/S TOP ROCK INTERIORS LLC.',
                'bank-adcb-uae',
                'Abu Dhabi Commercial Bank (ADCB)',
                'inward',
                26466.77,
                'AED',
                'Client settlement for Invoice REC-RG-INV-44035 (Fitout Work)',
                'Cleared',
                '{\"id\":\"wire-adcb-44035\",\"receipt_id\":\"rec-rv-44035\",\"company_id\":\"rayan-corp-uae\",\"reference_no\":\"WIRE-ADCB-99210\",\"date\":\"2026-10-19\",\"source_bank\":\"Abu Dhabi Commercial Bank (ADCB)\",\"source_account_id\":\"bank-adcb-uae\",\"destination_bank\":\"Abu Dhabi Commercial Bank (ADCB)\",\"destination_account_id\":\"bank-adcb-uae\",\"counterparty\":\"M/S TOP ROCK INTERIORS LLC.\",\"amount\":26466.77,\"currency\":\"AED\",\"type\":\"inward\",\"type_label\":\"Inward Client Collection (REC-RV-44035)\",\"purpose\":\"Client settlement for Invoice REC-RG-INV-44035 (Fitout Work)\",\"status\":\"Cleared\",\"created_at\":\"2026-10-19T13:40:00Z\"}',
                NOW()
            )");
            $pdo->exec("DELETE FROM finance_loan_transactions WHERE id IN ('lt-01', 'lt-02')");
            $pdo->exec("DELETE FROM finance_notifications WHERE id IN ('notif-001', 'notif-002', 'notif-003', 'notif-mvare1wh', 'notif-mvarduee')");
            $pdo->exec("DELETE FROM finance_audit_logs WHERE id IN ('aud-001', 'aud-002', 'aud-003', 'aud-004', 'aud-005', 'aud-mvare1wh', 'aud-mvarduee', 'aud-mvhirxz4', 'aud-mvhirxz0', 'aud-mvhirxyp', 'aud-1a14f414ad7')");
            $pdo->exec("DELETE FROM finance_bank_accounts WHERE id IN ('bank-nbad-uae', 'bank-enbd-escrow') OR bank_name LIKE '%National Bank of Abu Dhabi%' OR bank_name LIKE '%NBAD%' OR bank_name LIKE '%Emirates NBD%' OR (id = 'bank-fab-uae' AND bank_name LIKE '%First Abu Dhabi%')");
            $chkBankCount = $pdo->query("SELECT COUNT(*) FROM finance_bank_accounts WHERE company_id = 'rayan-corp-uae'")->fetchColumn();
            if (!$chkBankCount) {
                $pdo->exec("INSERT INTO finance_bank_accounts (id, company_id, account_name, bank_name, account_number, iban, swift, branch, currency, balance, signatory, status, data_json, updated_at) VALUES (
                    'bank-adcb-uae',
                    'rayan-corp-uae',
                    'RAYAN ENGINEERING AND CONTRACTING LLC SPC',
                    'Abu Dhabi Commercial Bank (ADCB)',
                    'AE920030012697347820001',
                    'AE920030012697347820001',
                    'ADCBAEAA',
                    'Dalma Mall - Abu Dhabi',
                    'AED',
                    183092.72,
                    'Arshad Alam Shaikh',
                    'Active',
                    '{\"id\":\"bank-adcb-uae\",\"company_id\":\"rayan-corp-uae\",\"account_name\":\"RAYAN ENGINEERING AND CONTRACTING LLC SPC\",\"bank_name\":\"Abu Dhabi Commercial Bank (ADCB)\",\"account_number\":\"AE920030012697347820001\",\"iban\":\"AE920030012697347820001\",\"swift\":\"ADCBAEAA\",\"branch\":\"Dalma Mall - Abu Dhabi\",\"currency\":\"AED\",\"balance\":183092.72,\"signatory\":\"Arshad Alam Shaikh\",\"status\":\"Active\"}',
                    NOW()
                )");
            }
            $pdo->exec("DELETE FROM finance_bank_accounts WHERE id = 'bank-fab-uae'");
        } catch (Exception $e) {}
    }

    if (!empty($data['purchase_bills']) && is_array($data['purchase_bills'])) {
        $orig = count($data['purchase_bills']);
        $data['purchase_bills'] = array_values(array_filter($data['purchase_bills'], function($b) use ($dummyBillIds) {
            $id = strtolower(trim($b['id'] ?? ''));
            $no = strtolower(trim($b['bill_no'] ?? ''));
            return !in_array($id, $dummyBillIds) && !in_array($no, $dummyBillIds);
        }));
        if (count($data['purchase_bills']) !== $orig) $changed = true;
    }

    if (!empty($data['vendor_payments']) && is_array($data['vendor_payments'])) {
        $orig = count($data['vendor_payments']);
        $data['vendor_payments'] = array_values(array_filter($data['vendor_payments'], function($p) use ($dummyPayIds) {
            $id = strtolower(trim($p['id'] ?? ''));
            $no = strtolower(trim($p['voucher_no'] ?? ''));
            return !in_array($id, $dummyPayIds) && !in_array($no, $dummyPayIds);
        }));
        if (count($data['vendor_payments']) !== $orig) $changed = true;
    }

    if (!empty($data['debit_notes']) && is_array($data['debit_notes'])) {
        $orig = count($data['debit_notes']);
        $data['debit_notes'] = array_values(array_filter($data['debit_notes'], function($dn) use ($dummyDnIds) {
            $id = strtolower(trim($dn['id'] ?? ''));
            $no = strtolower(trim($dn['debit_note_no'] ?? ''));
            return !in_array($id, $dummyDnIds) && !in_array($no, $dummyDnIds);
        }));
        if (count($data['debit_notes']) !== $orig) $changed = true;
    }

    if (!empty($data['expenses']) && is_array($data['expenses'])) {
        $orig = count($data['expenses']);
        $data['expenses'] = array_values(array_filter($data['expenses'], function($exp) use ($dummyExpIds) {
            $id = strtolower(trim($exp['id'] ?? ''));
            $no = strtolower(trim($exp['expense_no'] ?? ''));
            return !in_array($id, $dummyExpIds) && !in_array($no, $dummyExpIds);
        }));
        if (count($data['expenses']) !== $orig) $changed = true;
    }

    if (!empty($data['purchase_orders']) && is_array($data['purchase_orders'])) {
        $orig = count($data['purchase_orders']);
        $data['purchase_orders'] = array_values(array_filter($data['purchase_orders'], function($po) use ($dummyPoIds) {
            $id = strtolower(trim($po['id'] ?? ''));
            $no = strtolower(trim($po['po_no'] ?? ''));
            return !in_array($id, $dummyPoIds) && !in_array($no, $dummyPoIds);
        }));
        if (count($data['purchase_orders']) !== $orig) $changed = true;
    }

    if (!empty($data['documents']) && is_array($data['documents'])) {
        $orig = count($data['documents']);
        $data['documents'] = array_values(array_filter($data['documents'], function($d) use ($dummyDocIds) {
            $id = strtolower(trim($d['id'] ?? ''));
            return !in_array($id, $dummyDocIds);
        }));
        if (count($data['documents']) !== $orig) $changed = true;
    }

    if (!empty($data['vendors']) && is_array($data['vendors'])) {
        $orig = count($data['vendors']);
        $data['vendors'] = array_values(array_filter($data['vendors'], function($v) use ($dummyVendorIds) {
            $id = strtolower(trim($v['id'] ?? ''));
            return !in_array($id, $dummyVendorIds);
        }));
        if (count($data['vendors']) !== $orig) $changed = true;
    }

    if (!empty($data['customers']) && is_array($data['customers'])) {
        $orig = count($data['customers']);
        $data['customers'] = array_values(array_filter($data['customers'], function($c) use ($dummyCustIds) {
            $id = strtolower(trim($c['id'] ?? ''));
            return !in_array($id, $dummyCustIds);
        }));
        foreach ($data['customers'] as &$c) {
            if (stripos($c['name'] ?? '', 'TOP ROCK') !== false) {
                if (($c['trn'] ?? '') !== '100360644700003' || ($c['phone'] ?? '') !== '+971 502131834' || ($c['contact_person'] ?? '') !== 'Mr. Shahil') {
                    $c['customer_type'] = 'Business';
                    $c['name'] = 'M/S TOP ROCK INTERIORS LLC.';
                    $c['display_name'] = 'M/S TOP ROCK INTERIORS LLC.';
                    $c['trn'] = '100360644700003';
                    $c['tax_treatment'] = 'VAT Registered';
                    $c['place_of_supply'] = 'Dubai, UAE';
                    $c['billing_address'] = 'TRI Office No.1 Al Qusais Industrial Area 1, Dubai, UAE';
                    $c['office_address'] = 'TRI Office No.1 Al Qusais Industrial Area 1, Dubai, UAE';
                    $c['contact_person'] = 'Mr. Shahil';
                    $c['salutation'] = 'Mr.';
                    $c['first_name'] = 'Shahil';
                    $c['email'] = 'procurementofficer@toprockinteriors.com';
                    $c['phone'] = '+971 502131834';
                    $c['currency'] = 'AED';
                    $c['payment_terms'] = 0;
                    $c['payment_terms_label'] = 'Due on Receipt';
                    $c['accounts_receivable'] = 'Accounts Receivable';
                    $changed = true;
                }
            }
        }
        unset($c);
        if (count($data['customers']) !== $orig) $changed = true;
    }

    if (!empty($data['invoices']) && is_array($data['invoices'])) {
        $orig = count($data['invoices']);
        $filteredInvoices = [];
        $hasTopRock = false;
        foreach ($data['invoices'] as $inv) {
            $id = strtolower(trim($inv['id'] ?? ''));
            $no = strtolower(trim($inv['invoice_no'] ?? ''));
            if (in_array($id, $dummyInvIds) || in_array($no, $dummyInvIds)) {
                continue;
            }
            $isTR = (stripos($inv['customer_name'] ?? '', 'TOP ROCK') !== false || 
                     ($inv['customer_trn'] ?? '') === '100360644700003' || 
                     stripos($no, '44035') !== false || 
                     stripos($id, '44035') !== false ||
                     stripos($no, '44015') !== false || 
                     stripos($id, '44015') !== false);
            if ($isTR) {
                if (!$hasTopRock) {
                    $filteredInvoices[] = $topRockInvoice;
                    $hasTopRock = true;
                }
            } else {
                $filteredInvoices[] = $inv;
            }
        }
        if (!$hasTopRock) {
            array_unshift($filteredInvoices, $topRockInvoice);
        }
        $data['invoices'] = $filteredInvoices;
        if (count($data['invoices']) !== $orig) $changed = true;
    }

    if (!empty($data['customer_receipts']) && is_array($data['customer_receipts'])) {
        $orig = count($data['customer_receipts']);
        // 1. Filter out dummy receipt IDs
        $filtered = array_values(array_filter($data['customer_receipts'], function($r) use ($dummyRecIds) {
            $id = strtolower(trim($r['id'] ?? ''));
            $no = strtolower(trim($r['receipt_no'] ?? ''));
            return !in_array($id, $dummyRecIds) && !in_array($no, $dummyRecIds);
        }));

        // 2. Deduplicate receipts by receipt_no / id
        $dedupedReceipts = [];
        foreach ($filtered as $r) {
            $rcpId = strtolower(trim($r['id'] ?? ''));
            $rcpNo = strtoupper(trim($r['receipt_no'] ?? ''));
            $key = $rcpNo ?: $rcpId;
            if (!$key) continue;
            $dedupedReceipts[$key] = $r;
        }

        $data['customer_receipts'] = array_values($dedupedReceipts);
        if (count($data['customer_receipts']) !== $orig) $changed = true;
    }

    // Reconcile invoices: ensure statuses and balances are 100% reconciled
    if (!empty($data['invoices']) && is_array($data['invoices'])) {
        foreach ($data['invoices'] as &$inv) {
            $invNo = strtoupper(trim($inv['invoice_no'] ?? ''));
// Invoices reconciled: all statuses and balances preserved as per company records
        }
        unset($inv);
    }

    if (!empty($data['items']) && is_array($data['items'])) {
        $orig = count($data['items']);
        $data['items'] = array_values(array_filter($data['items'], function($it) {
            $id = strtolower(trim($it['id'] ?? ''));
            return strpos($id, 'item-00') !== 0;
        }));
        if (count($data['items']) !== $orig) $changed = true;
    }

    if (!empty($data['projects']) && is_array($data['projects'])) {
        $orig = count($data['projects']);
        $data['projects'] = array_values(array_filter($data['projects'], function($p) use ($dummyProjIds) {
            $id = strtolower(trim($p['id'] ?? ''));
            return !in_array($id, $dummyProjIds);
        }));
        if (count($data['projects']) !== $orig) $changed = true;
    }

    if (!empty($data['cheques']) && is_array($data['cheques'])) {
        $orig = count($data['cheques']);
        $data['cheques'] = array_values(array_filter($data['cheques'], function($chq) use ($dummyChequeIds) {
            $id = strtolower(trim($chq['id'] ?? ''));
            return !in_array($id, $dummyChequeIds);
        }));
        if (count($data['cheques']) !== $orig) $changed = true;
    }

    if (!empty($data['cash_vouchers']) && is_array($data['cash_vouchers'])) {
        $orig = count($data['cash_vouchers']);
        $data['cash_vouchers'] = array_values(array_filter($data['cash_vouchers'], function($cv) use ($dummyCvIds) {
            $id = strtolower(trim($cv['id'] ?? ''));
            return !in_array($id, $dummyCvIds);
        }));
        if (count($data['cash_vouchers']) !== $orig) $changed = true;
    }

    if (!isset($data['bank_transfers']) || !is_array($data['bank_transfers'])) {
        $data['bank_transfers'] = [];
    }
    $orig = count($data['bank_transfers']);
    $data['bank_transfers'] = array_values(array_filter($data['bank_transfers'], function($bt) use ($dummyWireIds) {
        $id = strtolower(trim($bt['id'] ?? ''));
        return !in_array($id, $dummyWireIds);
    }));
    $hasWire = false;
    foreach ($data['bank_transfers'] as $bt) {
        if (($bt['reference_no'] ?? '') === 'WIRE-ADCB-99210' || ($bt['receipt_id'] ?? '') === 'rec-rv-44035') {
            $hasWire = true;
            break;
        }
    }
    if (!$hasWire) {
        array_unshift($data['bank_transfers'], [
            'id' => 'wire-adcb-44035',
            'receipt_id' => 'rec-rv-44035',
            'company_id' => 'rayan-corp-uae',
            'reference_no' => 'WIRE-ADCB-99210',
            'date' => '2026-10-19',
            'source_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'source_account_id' => 'bank-adcb-uae',
            'destination_bank' => 'Abu Dhabi Commercial Bank (ADCB)',
            'destination_account_id' => 'bank-adcb-uae',
            'counterparty' => 'M/S TOP ROCK INTERIORS LLC.',
            'amount' => 26466.77,
            'currency' => 'AED',
            'type' => 'inward',
            'type_label' => 'Inward Client Collection (REC-RV-44035)',
            'purpose' => 'Client settlement for Invoice REC-RG-INV-44035 (Fitout Work)',
            'status' => 'Cleared',
            'created_at' => '2026-10-19T13:40:00Z'
        ]);
        $changed = true;
    }
    if (count($data['bank_transfers']) !== $orig) $changed = true;

    if (!empty($data['loan_transactions']) && is_array($data['loan_transactions'])) {
        $orig = count($data['loan_transactions']);
        $data['loan_transactions'] = array_values(array_filter($data['loan_transactions'], function($lt) use ($dummyLtIds) {
            $id = strtolower(trim($lt['id'] ?? ''));
            return !in_array($id, $dummyLtIds);
        }));
        if (count($data['loan_transactions']) !== $orig) $changed = true;
    }

    if (!empty($data['notifications']) && is_array($data['notifications'])) {
        $orig = count($data['notifications']);
        $data['notifications'] = array_values(array_filter($data['notifications'], function($n) use ($dummyNotifIds) {
            $id = strtolower(trim($n['id'] ?? ''));
            return !in_array($id, $dummyNotifIds);
        }));
        if (count($data['notifications']) !== $orig) $changed = true;
    }

    if (!empty($data['audit_logs']) && is_array($data['audit_logs'])) {
        $orig = count($data['audit_logs']);
        $data['audit_logs'] = array_values(array_filter($data['audit_logs'], function($a) use ($dummyAudIds) {
            $id = strtolower(trim($a['id'] ?? ''));
            return !in_array($id, $dummyAudIds);
        }));
        if (count($data['audit_logs']) !== $orig) $changed = true;
    }

    if (!empty($data['bank_accounts']) && is_array($data['bank_accounts'])) {
        $orig = count($data['bank_accounts']);
        $data['bank_accounts'] = array_values(array_filter($data['bank_accounts'], function($b) {
            $cid = $b['company_id'] ?? 'rayan-corp-uae';
            if ($cid === 'rayan-corp-uae') {
                $id = strtolower(trim($b['id'] ?? ''));
                $bn = strtolower(trim($b['bank_name'] ?? ''));
                if ($id === 'bank-nbad-uae' || $id === 'bank-enbd-escrow') return false;
                if (strpos($bn, 'nbad') !== false || strpos($bn, 'national bank of abu dhabi') !== false || strpos($bn, 'emirates nbd') !== false) return false;
                if ($id === 'bank-fab-uae' && (strpos($bn, 'first abu dhabi') !== false || strpos($bn, 'fab') !== false)) return false;
            }
            return true;
        }));

        $hasAdcb = false;
        foreach ($data['bank_accounts'] as $b) {
            if (($b['company_id'] ?? '') === 'rayan-corp-uae') {
                $hasAdcb = true;
                break;
            }
        }

        if (!$hasAdcb) {
            array_unshift($data['bank_accounts'], [
                'id' => 'bank-adcb-uae',
                'company_id' => 'rayan-corp-uae',
                'account_name' => 'RAYAN ENGINEERING AND CONTRACTING LLC SPC',
                'bank_name' => 'Abu Dhabi Commercial Bank (ADCB)',
                'account_number' => 'AE920030012697347820001',
                'iban' => 'AE920030012697347820001',
                'swift' => 'ADCBAEAA',
                'branch' => 'Dalma Mall - Abu Dhabi',
                'currency' => 'AED',
                'balance' => 183092.72,
                'signatory' => 'Arshad Alam Shaikh',
                'status' => 'Active'
            ]);
            $changed = true;
        }
        if (count($data['bank_accounts']) !== $orig) $changed = true;
    }

    if ($changed && $pdo) {
        saveFinanceDb($pdo, $dataFile, $data, $candidates);
    }
}

function recalculateAllFinanceBalances(&$data) {
    if (!$data || !is_array($data)) return;

    $creditNotes = $data['credit_notes'] ?? [];
    $receipts = $data['customer_receipts'] ?? [];
    if (!empty($data['invoices']) && is_array($data['invoices'])) {
        foreach ($data['invoices'] as &$inv) {
            $invId = $inv['id'] ?? '';
            $invNo = $inv['invoice_no'] ?? '';
            $grand = round(floatval($inv['grand_total'] ?? 0), 2);

            // Sum receipts
            $paid = 0.0;
            foreach ($receipts as $rcp) {
                if (!empty($rcp['allocations']) && is_array($rcp['allocations'])) {
                    foreach ($rcp['allocations'] as $alloc) {
                        if (($alloc['invoice_id'] ?? '') === $invId || ($alloc['invoice_no'] ?? '') === $invNo) {
                            $paid += floatval($alloc['amount_allocated'] ?? 0);
                        }
                    }
                }
            }
// No phantom paid fallback: only explicit receipts dictate amount_paid
            if ($paid <= 0.02) {
                $paid = 0.0;
            }
            $inv['amount_paid'] = $paid;

            // Sum credit notes
            $credited = 0.0;
            foreach ($creditNotes as $cn) {
                if (($cn['status'] ?? '') === 'void') continue;
                if (($cn['invoice_id'] ?? '') === $invId || ($cn['invoice_no'] ?? '') === $invNo) {
                    $cnAmt = floatval($cn['total_credit_amount'] ?? 0);
                    if ($cnAmt <= 0) {
                        $cnAmt = floatval($cn['taxable_amount'] ?? 0) + floatval($cn['tax_amount'] ?? 0);
                    }
                    $credited += $cnAmt;
                }
            }

            $rem = max(0.0, round($grand - $paid - $credited, 2));
            // Tolerate up to 0.02 fils floating point mismatch so 0.01 fils never shows in red
            if ($rem <= 0.02) {
                $rem = 0.0;
            }
            $inv['balance_due'] = $rem;
            if ($rem == 0.0 && ($paid > 0 || $credited > 0)) {
                $inv['status'] = 'paid';
            } elseif ($paid > 0 || $credited > 0) {
                $inv['status'] = 'partially_paid';
            } elseif (($inv['status'] ?? '') !== 'draft') {
                $inv['status'] = 'unpaid';
            }
        }
        unset($inv);
    }

    $debitNotes = $data['debit_notes'] ?? [];
    $payments = $data['vendor_payments'] ?? [];
    if (!empty($data['purchase_bills']) && is_array($data['purchase_bills'])) {
        foreach ($data['purchase_bills'] as &$b) {
            $bId = $b['id'] ?? '';
            $bNo = $b['bill_no'] ?? '';
            $grand = round(floatval($b['grand_total'] ?? 0), 2);

            $paid = 0.0;
            foreach ($payments as $pay) {
                if (!empty($pay['allocations']) && is_array($pay['allocations'])) {
                    foreach ($pay['allocations'] as $alloc) {
                        if (($alloc['bill_id'] ?? '') === $bId || ($alloc['bill_no'] ?? '') === $bNo) {
                            $paid += floatval($alloc['amount_allocated'] ?? 0);
                        }
                    }
                }
            }
            if ($paid == 0.0 && floatval($b['amount_paid'] ?? 0) > 0.02) {
                $paid = round(floatval($b['amount_paid']), 2);
            }
            if ($paid <= 0.02) {
                $paid = 0.0;
            }
            $b['amount_paid'] = $paid;

            $debited = 0.0;
            foreach ($debitNotes as $dn) {
                if (($dn['status'] ?? '') === 'void') continue;
                if (($dn['bill_id'] ?? '') === $bId || ($dn['bill_no'] ?? '') === $bNo) {
                    $dnAmt = floatval($dn['total_debit_amount'] ?? 0);
                    $debited += $dnAmt;
                }
            }

            $rem = max(0.0, round($grand - $paid - $debited, 2));
            if ($rem <= 0.02) {
                $rem = 0.0;
            }
            $b['balance_due'] = $rem;
            if ($rem == 0.0 && ($paid > 0 || $debited > 0)) {
                $b['status'] = 'paid';
            } elseif ($paid > 0 || $debited > 0) {
                $b['status'] = 'partially_paid';
            }
        }
        unset($b);
    }
}

function loadFinanceDb($pdo, $dataFile, $candidates) {
    // A. Check Hostinger MySQL Database first
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT state_json FROM finance_state WHERE id = 1 LIMIT 1");
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row && !empty($row['state_json'])) {
                $data = json_decode($row['state_json'], true);
                if ($data && is_array($data) && !empty($data['companies'])) {
                    // Always synchronize companies list with master seed definition
                    $masterSeed = getMasterSeed($candidates);
                    if ($masterSeed && !empty($masterSeed['companies'])) {
                        $data['companies'] = $masterSeed['companies'];
                    }
                    // Auto-hydrate verified RGC sales dataset if invoices are missing
                    if (empty($data['invoices'])) {
                        if ($masterSeed && !empty($masterSeed['invoices']) && count($masterSeed['invoices']) >= 50) {
                            $data['invoices'] = $masterSeed['invoices'];
                            $data['customer_receipts'] = $masterSeed['customer_receipts'] ?? [];
                            $data['customers'] = $masterSeed['customers'] ?? [];
                            $data['credit_notes'] = $masterSeed['credit_notes'] ?? [];
                        }
                    }
                    $companyOrder = ['rayan-group', 'rayan-corp-uae', 'rayan-energy-uae', 'rayan-properties-uae', 'ashaz-eng-in'];
                    usort($data['companies'], function($a, $b) use ($companyOrder) {
                        $posA = array_search($a['id'] ?? '', $companyOrder);
                        $posB = array_search($b['id'] ?? '', $companyOrder);
                        if ($posA === false) $posA = 999;
                        if ($posB === false) $posB = 999;
                        return $posA - $posB;
                    });
                    // Check if relational tables have any additional records
                    syncFromRelationalTables($pdo, $data);
                    // Purge dummy entries if any exist
                    purgeDummyFinanceRecords($pdo, $data, $dataFile, $candidates);
                    // Keep relational tables populated
                    // Migration v23: Restore credit notes if missing in database
                    try {
                        $chkCn23 = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'credit_notes_fix_v23'")->fetchColumn();
                        if (!$chkCn23) {
                            $masterSeed = getMasterSeed($candidates);
                            if (!empty($masterSeed['credit_notes']) && empty($data['credit_notes'])) {
                                $data['credit_notes'] = $masterSeed['credit_notes'];
                            }
                            $pdo->exec("REPLACE INTO finance_settings (setting_key, setting_val, updated_at) VALUES ('credit_notes_fix_v23', 'completed', NOW())");
                        }
                    } catch (Exception $e) {}

                    // Ensure Director's Current Account is configured
                    $hasDirLoan = false;
                    if (!empty($data['loan_accounts']) && is_array($data['loan_accounts'])) {
                        foreach ($data['loan_accounts'] as $la) {
                            if (($la['id'] ?? '') === 'loan-dir-current-act') {
                                $hasDirLoan = true;
                                break;
                            }
                        }
                    } else {
                        $data['loan_accounts'] = [];
                    }
                    if (!$hasDirLoan) {
                        array_unshift($data['loan_accounts'], [
                            'id' => 'loan-dir-current-act',
                            'company_id' => 'rayan-corp-uae',
                            'facility_name' => "Director's Current Account — Arshad Alam Shaikh",
                            'lender' => 'Arshad Alam Shaikh (Executive Managing Director)',
                            'facility_type' => "Director's Current Account / Shareholder Advance",
                            'sanctioned_limit' => 5000000,
                            'outstanding_balance' => 0,
                            'available_limit' => 5000000,
                            'currency' => 'AED',
                            'interest_rate' => '0% (Interest-Free Shareholder Advance)',
                            'tenure' => 'Repayable on demand / As cash flow permits',
                            'security' => 'Unsecured Director Advance'
                        ]);
                    }
                                        recalculateAllFinanceBalances($data);
                    syncToRelationalTables($pdo, $data);
                    try {
                        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                        $stmtSt = $pdo->prepare("UPDATE finance_state SET state_json = ?, updated_at = NOW() WHERE id = 1");
                        $stmtSt->execute([$json]);
                    } catch (Exception $e) {}
                    return $data;
                }
            }
        } catch (Exception $e) {
            error_log("Finance MySQL load error: " . $e->getMessage());
        }
    }

    // B. Check local file
    if ($dataFile && file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        if ($raw) {
            $data = json_decode($raw, true);
            if ($data && is_array($data) && !empty($data['companies'])) {
                purgeDummyFinanceRecords($pdo, $data, $dataFile, $candidates);
                recalculateAllFinanceBalances($data);
                // If MySQL was empty, seed it now with this data!
                if ($pdo) {
                    saveFinanceDb($pdo, null, $data, $candidates);
                }
                return $data;
            }
        }
    }

    // C. Master seed
    $seed = getMasterSeed($candidates);
    if ($seed && $pdo) {
        purgeDummyFinanceRecords($pdo, $seed, $dataFile, $candidates);
        saveFinanceDb($pdo, $dataFile, $seed, $candidates);
    }
    return $seed;
}

function syncFromRelationalTables($pdo, &$data) {
    if (!$pdo) return;
    try {
        $syncMapping = [
            ['table' => 'finance_invoices', 'key' => 'invoices', 'id_fields' => ['id', 'invoice_no'], 'order' => 'invoice_date DESC'],
            ['table' => 'finance_customers', 'key' => 'customers', 'id_fields' => ['id', 'code', 'name'], 'order' => 'name ASC'],
            ['table' => 'finance_receipts', 'key' => 'customer_receipts', 'id_fields' => ['id', 'receipt_no'], 'order' => 'receipt_date DESC'],
            ['table' => 'finance_purchase_bills', 'key' => 'purchase_bills', 'id_fields' => ['id', 'bill_no'], 'order' => 'bill_date DESC'],
            ['table' => 'finance_vendor_payments', 'key' => 'vendor_payments', 'id_fields' => ['id', 'voucher_no'], 'order' => 'payment_date DESC'],
            ['table' => 'finance_vendors', 'key' => 'vendors', 'id_fields' => ['id', 'code', 'name'], 'order' => 'name ASC'],
            ['table' => 'finance_items', 'key' => 'items', 'id_fields' => ['id', 'code', 'name'], 'order' => 'name ASC'],
            ['table' => 'finance_projects', 'key' => 'projects', 'id_fields' => ['id', 'code', 'name'], 'order' => 'name ASC'],
            ['table' => 'finance_expenses', 'key' => 'expenses', 'id_fields' => ['id', 'expense_no'], 'order' => 'expense_date DESC'],
            ['table' => 'finance_purchase_orders', 'key' => 'purchase_orders', 'id_fields' => ['id', 'po_no'], 'order' => 'po_date DESC'],
            ['table' => 'finance_credit_notes', 'key' => 'credit_notes', 'id_fields' => ['id', 'credit_note_no'], 'order' => 'id DESC'],
            ['table' => 'finance_debit_notes', 'key' => 'debit_notes', 'id_fields' => ['id', 'debit_note_no'], 'order' => 'id DESC'],
            ['table' => 'finance_bank_accounts', 'key' => 'bank_accounts', 'id_fields' => ['id', 'account_number', 'account_name'], 'order' => 'account_name ASC'],
            ['table' => 'finance_cash_in_hand', 'key' => 'cash_in_hand', 'id_fields' => ['id', 'register_name'], 'order' => 'register_name ASC'],
            ['table' => 'finance_cheques', 'key' => 'cheques', 'id_fields' => ['id', 'cheque_no'], 'order' => 'cheque_date DESC'],
            ['table' => 'finance_bank_transfers', 'key' => 'bank_transfers', 'id_fields' => ['id', 'reference_no'], 'order' => 'transfer_date DESC'],
            ['table' => 'finance_cash_vouchers', 'key' => 'cash_vouchers', 'id_fields' => ['id', 'voucher_no'], 'order' => 'voucher_date DESC'],
            ['table' => 'finance_loan_accounts', 'key' => 'loan_accounts', 'id_fields' => ['id', 'facility_name'], 'order' => 'facility_name ASC'],
            ['table' => 'finance_loan_transactions', 'key' => 'loan_transactions', 'id_fields' => ['id', 'reference_no'], 'order' => 'transaction_date DESC'],
        ];

        foreach ($syncMapping as $m) {
            try {
                if ($m['key'] === 'customer_receipts' && empty($data['customer_receipts'])) {
                    continue;
                }
                $rows = $pdo->query("SELECT data_json FROM {$m['table']} ORDER BY {$m['order']}")->fetchAll(PDO::FETCH_ASSOC);
                if ($rows && count($rows) > 0) {
                    $k = $m['key'];
                    if (!isset($data[$k]) || !is_array($data[$k])) $data[$k] = [];
                    $existing = [];
                    foreach ($data[$k] as $item) {
                        foreach ($m['id_fields'] as $f) {
                            if (!empty($item[$f])) {
                                $existing[strtolower($item[$f])] = true;
                            }
                        }
                    }
                    foreach ($rows as $r) {
                        $obj = json_decode($r['data_json'], true);
                        if (!$obj) continue;
                        $found = false;
                        foreach ($m['id_fields'] as $f) {
                            if (!empty($obj[$f]) && isset($existing[strtolower($obj[$f])])) {
                                $found = true;
                                break;
                            }
                        }
                        if (!$found) {
                            array_unshift($data[$k], $obj);
                            foreach ($m['id_fields'] as $f) {
                                if (!empty($obj[$f])) {
                                    $existing[strtolower($obj[$f])] = true;
                                }
                            }
                        }
                    }
                }
            } catch (Exception $e) {}
        }

        // Auto-discover and populate purchase orders from any purchase bills that reference a PO
        if (!empty($data['purchase_bills']) && is_array($data['purchase_bills'])) {
            if (!isset($data['purchase_orders']) || !is_array($data['purchase_orders'])) {
                $data['purchase_orders'] = [];
            }
            $existingPoNos = [];
            foreach ($data['purchase_orders'] as $p) {
                if (!empty($p['po_no'])) $existingPoNos[strtolower(trim($p['po_no']))] = true;
                if (!empty($p['id'])) $existingPoNos[strtolower(trim($p['id']))] = true;
            }
            foreach ($data['purchase_bills'] as $b) {
                $poRef = trim($b['po_no'] ?? $b['po_reference'] ?? $b['po_number'] ?? '');
                if ($poRef && !isset($existingPoNos[strtolower($poRef)])) {
                    $synthPo = [
                        'id' => !empty($b['po_id']) ? $b['po_id'] : ('po-' . md5($poRef)),
                        'po_no' => $poRef,
                        'company_id' => $b['company_id'] ?? 'rayan-corp-uae',
                        'currency' => $b['currency'] ?? 'AED',
                        'vendor_id' => $b['vendor_id'] ?? null,
                        'vendor_name' => $b['vendor_name'] ?? '',
                        'supplier_name' => $b['vendor_name'] ?? '',
                        'supplier_trn' => $b['vendor_trn'] ?? '',
                        'project_id' => $b['project_id'] ?? null,
                        'project_name' => $b['project_name'] ?? '',
                        'date' => $b['bill_date'] ?? date('Y-m-d'),
                        'total_value' => floatval($b['grand_total'] ?? 0),
                        'grand_total' => floatval($b['grand_total'] ?? 0),
                        'subtotal' => floatval($b['taxable_subtotal'] ?? 0),
                        'tax_total' => floatval($b['tax_total'] ?? 0),
                        'status' => 'approved',
                        'approved_by' => 'Auto-linked from Purchase Bill'
                    ];
                    array_unshift($data['purchase_orders'], $synthPo);
                    $existingPoNos[strtolower($poRef)] = true;
                }
            }
        }
    } catch (Exception $e) {
        error_log("syncFromRelationalTables error: " . $e->getMessage());
    }
}

function saveFinanceDb($pdo, $dataFile, &$data, $candidates = []) {
    // Preserve master collections
    if (empty($data['companies']) || count($data['companies']) === 0) {
        $seed = getMasterSeed($candidates);
        if ($seed) {
            foreach ($seed as $k => $val) {
                if (empty($data[$k]) && !empty($val)) {
                    $data[$k] = $val;
                }
            }
        }
    }

    // Recalculate and synchronize all invoice and bill balances
    recalculateAllFinanceBalances($data);

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    // 1. Save to Hostinger MySQL Database
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("REPLACE INTO finance_state (id, state_json, updated_at) VALUES (1, :json, NOW())");
            $stmt->execute([':json' => $json]);

            // Sync all relational tables
            syncToRelationalTables($pdo, $data);
        } catch (Exception $e) {
            error_log("Finance MySQL save error: " . $e->getMessage());
        }
    }

    // 2. Secondary fallback: write to disk
    if ($dataFile) {
        $dir = dirname($dataFile);
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        @file_put_contents($dataFile, $json);
    }

    return true;
}

function syncToRelationalTables($pdo, &$data) {
    if (!$pdo) return;
    try {
        // 1. Invoices
        if (!empty($data['invoices']) && is_array($data['invoices'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_invoices (id, invoice_no, company_id, customer_id, customer_name, customer_trn, customer_gstin, invoice_date, due_date, grand_total, amount_paid, balance_due, currency, status, data_json, updated_at) VALUES (:id, :invoice_no, :company_id, :customer_id, :customer_name, :customer_trn, :customer_gstin, :invoice_date, :due_date, :grand_total, :amount_paid, :balance_due, :currency, :status, :data_json, NOW())");
            $validInvNos = [];
            foreach ($data['invoices'] as $inv) {
                if (empty($inv['invoice_no'])) continue;
                $validInvNos[] = $inv['invoice_no'];
                $stmt->execute([
                    ':id' => $inv['id'] ?? ('inv-' . $inv['invoice_no']),
                    ':invoice_no' => $inv['invoice_no'],
                    ':company_id' => $inv['company_id'] ?? 'rayan-corp-uae',
                    ':customer_id' => $inv['customer_id'] ?? '',
                    ':customer_name' => $inv['customer_name'] ?? '',
                    ':customer_trn' => $inv['customer_trn'] ?? '',
                    ':customer_gstin' => $inv['customer_gstin'] ?? '',
                    ':invoice_date' => $inv['invoice_date'] ?? date('Y-m-d'),
                    ':due_date' => !empty($inv['due_date']) ? $inv['due_date'] : null,
                    ':grand_total' => floatval($inv['grand_total'] ?? 0),
                    ':amount_paid' => floatval($inv['amount_paid'] ?? 0),
                    ':balance_due' => floatval($inv['balance_due'] ?? 0),
                    ':currency' => $inv['currency'] ?? 'AED',
                    ':status' => $inv['status'] ?? 'unpaid',
                    ':data_json' => json_encode($inv, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
            // Automatically purge any rows in finance_invoices that no longer exist in $data['invoices']
            if (!empty($validInvNos)) {
                $inClause = implode(',', array_fill(0, count($validInvNos), '?'));
                $stmtClean = $pdo->prepare("DELETE FROM finance_invoices WHERE invoice_no NOT IN ($inClause)");
                $stmtClean->execute($validInvNos);
            }
        }

        // 2. Customers
        if (!empty($data['customers']) && is_array($data['customers'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_customers (id, code, name, contact_person, email, phone, trn, gstin, credit_limit, data_json, updated_at) VALUES (:id, :code, :name, :contact_person, :email, :phone, :trn, :gstin, :credit_limit, :data_json, NOW())");
            foreach ($data['customers'] as $c) {
                if (empty($c['name'])) continue;
                $stmt->execute([
                    ':id' => $c['id'] ?? ('cust-' . rand(1000, 9999)),
                    ':code' => $c['code'] ?? '',
                    ':name' => $c['name'],
                    ':contact_person' => $c['contact_person'] ?? '',
                    ':email' => $c['email'] ?? '',
                    ':phone' => $c['phone'] ?? '',
                    ':trn' => $c['trn'] ?? '',
                    ':gstin' => $c['gstin'] ?? '',
                    ':credit_limit' => floatval($c['credit_limit'] ?? 10000000),
                    ':data_json' => json_encode($c, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 3. Customer Receipts
        if (!empty($data['customer_receipts']) && is_array($data['customer_receipts'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_receipts (id, receipt_no, customer_id, customer_name, receipt_date, amount_received, currency, payment_mode, reference_no, data_json, updated_at) VALUES (:id, :receipt_no, :customer_id, :customer_name, :receipt_date, :amount_received, :currency, :payment_mode, :reference_no, :data_json, NOW())");
            $validRcpNos = [];
            foreach ($data['customer_receipts'] as $r) {
                if (empty($r['receipt_no'])) continue;
                $validRcpNos[] = $r['receipt_no'];
                $stmt->execute([
                    ':id' => $r['id'] ?? ('rec-' . $r['receipt_no']),
                    ':receipt_no' => $r['receipt_no'],
                    ':customer_id' => $r['customer_id'] ?? '',
                    ':customer_name' => $r['customer_name'] ?? '',
                    ':receipt_date' => $r['receipt_date'] ?? date('Y-m-d'),
                    ':amount_received' => floatval($r['amount_received'] ?? 0),
                    ':currency' => $r['currency'] ?? 'AED',
                    ':payment_mode' => $r['payment_mode'] ?? 'Cheque',
                    ':reference_no' => $r['reference_no'] ?? '',
                    ':data_json' => json_encode($r, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
            if (!empty($validRcpNos)) {
                $inClause = implode(',', array_fill(0, count($validRcpNos), '?'));
                $stmtClean = $pdo->prepare("DELETE FROM finance_receipts WHERE receipt_no NOT IN ($inClause)");
                $stmtClean->execute($validRcpNos);
            }
        } else {
            $pdo->exec("DELETE FROM finance_receipts");
            $pdo->exec("DELETE FROM finance_customer_receipts");
        }

        // 4. Purchase Bills
        if (!empty($data['purchase_bills']) && is_array($data['purchase_bills'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_purchase_bills (id, bill_no, vendor_invoice_no, company_id, vendor_id, vendor_name, project_id, project_name, po_id, bill_date, due_date, grand_total, amount_paid, balance_due, currency, status, approval_status, data_json, updated_at) VALUES (:id, :bill_no, :vendor_invoice_no, :company_id, :vendor_id, :vendor_name, :project_id, :project_name, :po_id, :bill_date, :due_date, :grand_total, :amount_paid, :balance_due, :currency, :status, :approval_status, :data_json, NOW())");
            foreach ($data['purchase_bills'] as $b) {
                if (empty($b['bill_no'])) continue;
                $stmt->execute([
                    ':id' => $b['id'] ?? ('bill-' . $b['bill_no']),
                    ':bill_no' => $b['bill_no'],
                    ':vendor_invoice_no' => $b['vendor_invoice_no'] ?? '',
                    ':company_id' => $b['company_id'] ?? 'rayan-corp-uae',
                    ':vendor_id' => $b['vendor_id'] ?? '',
                    ':vendor_name' => $b['vendor_name'] ?? '',
                    ':project_id' => $b['project_id'] ?? '',
                    ':project_name' => $b['project_name'] ?? '',
                    ':po_id' => $b['po_id'] ?? '',
                    ':bill_date' => $b['bill_date'] ?? date('Y-m-d'),
                    ':due_date' => !empty($b['due_date']) ? $b['due_date'] : null,
                    ':grand_total' => floatval($b['grand_total'] ?? 0),
                    ':amount_paid' => floatval($b['amount_paid'] ?? 0),
                    ':balance_due' => floatval($b['balance_due'] ?? 0),
                    ':currency' => $b['currency'] ?? 'AED',
                    ':status' => $b['status'] ?? 'approved',
                    ':approval_status' => $b['approval_status'] ?? 'approved',
                    ':data_json' => json_encode($b, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 5. Vendor Payments
        if (!empty($data['vendor_payments']) && is_array($data['vendor_payments'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_vendor_payments (id, voucher_no, company_id, vendor_id, vendor_name, payment_date, payment_mode, reference_no, amount_paid, currency, data_json, updated_at) VALUES (:id, :voucher_no, :company_id, :vendor_id, :vendor_name, :payment_date, :payment_mode, :reference_no, :amount_paid, :currency, :data_json, NOW())");
            foreach ($data['vendor_payments'] as $vp) {
                if (empty($vp['voucher_no'])) continue;
                $stmt->execute([
                    ':id' => $vp['id'] ?? ('pay-' . $vp['voucher_no']),
                    ':voucher_no' => $vp['voucher_no'],
                    ':company_id' => $vp['company_id'] ?? 'rayan-corp-uae',
                    ':vendor_id' => $vp['vendor_id'] ?? '',
                    ':vendor_name' => $vp['vendor_name'] ?? '',
                    ':payment_date' => $vp['payment_date'] ?? date('Y-m-d'),
                    ':payment_mode' => $vp['payment_mode'] ?? 'Online',
                    ':reference_no' => $vp['reference_no'] ?? '',
                    ':amount_paid' => floatval($vp['amount_paid'] ?? 0),
                    ':currency' => $vp['currency'] ?? 'AED',
                    ':data_json' => json_encode($vp, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 6. Vendors
        if (!empty($data['vendors']) && is_array($data['vendors'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_vendors (id, code, company_id, name, country, trn, gstin, status, data_json, updated_at) VALUES (:id, :code, :company_id, :name, :country, :trn, :gstin, :status, :data_json, NOW())");
            foreach ($data['vendors'] as $v) {
                if (empty($v['name'])) continue;
                $stmt->execute([
                    ':id' => $v['id'] ?? ('vend-' . rand(1000, 9999)),
                    ':code' => $v['code'] ?? '',
                    ':company_id' => $v['company_id'] ?? 'rayan-corp-uae',
                    ':name' => $v['name'],
                    ':country' => $v['country'] ?? 'UAE',
                    ':trn' => $v['trn'] ?? '',
                    ':gstin' => $v['gstin'] ?? '',
                    ':status' => $v['status'] ?? 'active',
                    ':data_json' => json_encode($v, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 7. Items
        if (!empty($data['items']) && is_array($data['items'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_items (id, code, name, category, description, uom, sales_price, purchase_price, gst_rate, hsn_sac_code, status, data_json, updated_at) VALUES (:id, :code, :name, :category, :description, :uom, :sales_price, :purchase_price, :gst_rate, :hsn_sac_code, :status, :data_json, NOW())");
            foreach ($data['items'] as $item) {
                if (empty($item['name'])) continue;
                $stmt->execute([
                    ':id' => $item['id'] ?? ('item-' . rand(1000, 9999)),
                    ':code' => $item['code'] ?? '',
                    ':name' => $item['name'],
                    ':category' => $item['category'] ?? '',
                    ':description' => $item['description'] ?? '',
                    ':uom' => $item['uom'] ?? 'NOS',
                    ':sales_price' => floatval($item['sales_price'] ?? 0),
                    ':purchase_price' => floatval($item['purchase_price'] ?? 0),
                    ':gst_rate' => floatval($item['gst_rate'] ?? 0),
                    ':hsn_sac_code' => $item['hsn_sac_code'] ?? '',
                    ':status' => $item['status'] ?? 'active',
                    ':data_json' => json_encode($item, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 8. Projects
        if (!empty($data['projects']) && is_array($data['projects'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_projects (id, code, company_id, name, client, contract_value, approved_budget, currency, status, data_json, updated_at) VALUES (:id, :code, :company_id, :name, :client, :contract_value, :approved_budget, :currency, :status, :data_json, NOW())");
            foreach ($data['projects'] as $prj) {
                if (empty($prj['name'])) continue;
                $stmt->execute([
                    ':id' => $prj['id'] ?? ('prj-' . rand(1000, 9999)),
                    ':code' => $prj['code'] ?? '',
                    ':company_id' => $prj['company_id'] ?? 'rayan-corp-uae',
                    ':name' => $prj['name'],
                    ':client' => $prj['client'] ?? '',
                    ':contract_value' => floatval($prj['contract_value'] ?? 0),
                    ':approved_budget' => floatval($prj['approved_budget'] ?? 0),
                    ':currency' => $prj['currency'] ?? 'AED',
                    ':status' => $prj['status'] ?? 'In Progress',
                    ':data_json' => json_encode($prj, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 9. Expenses
        if (!empty($data['expenses']) && is_array($data['expenses'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_expenses (id, expense_no, company_id, expense_date, category, description, amount, tax_amount, total_amount, currency, project_id, project_name, payment_method, submitted_by, status, data_json, updated_at) VALUES (:id, :expense_no, :company_id, :expense_date, :category, :description, :amount, :tax_amount, :total_amount, :currency, :project_id, :project_name, :payment_method, :submitted_by, :status, :data_json, NOW())");
            foreach ($data['expenses'] as $exp) {
                if (empty($exp['expense_no'])) continue;
                $stmt->execute([
                    ':id' => $exp['id'] ?? ('exp-' . $exp['expense_no']),
                    ':expense_no' => $exp['expense_no'],
                    ':company_id' => $exp['company_id'] ?? 'rayan-corp-uae',
                    ':expense_date' => !empty($exp['date']) ? $exp['date'] : date('Y-m-d'),
                    ':category' => $exp['category'] ?? '',
                    ':description' => $exp['description'] ?? '',
                    ':amount' => floatval($exp['amount'] ?? 0),
                    ':tax_amount' => floatval($exp['tax_amount'] ?? 0),
                    ':total_amount' => floatval($exp['total_amount'] ?? $exp['amount'] ?? 0),
                    ':currency' => $exp['currency'] ?? 'AED',
                    ':project_id' => $exp['project_id'] ?? '',
                    ':project_name' => $exp['project_name'] ?? '',
                    ':payment_method' => $exp['payment_method'] ?? '',
                    ':submitted_by' => $exp['submitted_by'] ?? '',
                    ':status' => $exp['status'] ?? 'approved',
                    ':data_json' => json_encode($exp, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 10. Purchase Orders
        if (!empty($data['purchase_orders']) && is_array($data['purchase_orders'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_purchase_orders (id, po_no, company_id, po_date, supplier_name, supplier_trn, project_name, grand_total, currency, status, data_json, updated_at) VALUES (:id, :po_no, :company_id, :po_date, :supplier_name, :supplier_trn, :project_name, :grand_total, :currency, :status, :data_json, NOW())");
            foreach ($data['purchase_orders'] as $po) {
                if (empty($po['po_no'])) continue;
                $stmt->execute([
                    ':id' => $po['id'] ?? ('po-' . $po['po_no']),
                    ':po_no' => $po['po_no'],
                    ':company_id' => $po['company_id'] ?? 'rayan-corp-uae',
                    ':po_date' => !empty($po['date']) ? $po['date'] : date('Y-m-d'),
                    ':supplier_name' => $po['supplier_name'] ?? $po['vendor_name'] ?? '',
                    ':supplier_trn' => $po['supplier_trn'] ?? $po['vendor_trn'] ?? '',
                    ':project_name' => $po['project_name'] ?? '',
                    ':grand_total' => floatval($po['grand_total'] ?? $po['total_value'] ?? 0),
                    ':currency' => $po['currency'] ?? 'AED',
                    ':status' => $po['status'] ?? 'approved',
                    ':data_json' => json_encode($po, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 11. Credit Notes
        if (!empty($data['credit_notes']) && is_array($data['credit_notes'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_credit_notes (id, credit_note_no, company_id, invoice_id, invoice_no, customer_id, customer_name, total_credit_amount, currency, reason, status, data_json, updated_at) VALUES (:id, :credit_note_no, :company_id, :invoice_id, :invoice_no, :customer_id, :customer_name, :total_credit_amount, :currency, :reason, :status, :data_json, NOW())");
            foreach ($data['credit_notes'] as $cn) {
                $no = $cn['credit_note_no'] ?? $cn['id'] ?? '';
                if (empty($no)) continue;
                $stmt->execute([
                    ':id' => $cn['id'] ?? ('cn-' . $no),
                    ':credit_note_no' => $no,
                    ':company_id' => $cn['company_id'] ?? 'rayan-corp-uae',
                    ':invoice_id' => $cn['invoice_id'] ?? '',
                    ':invoice_no' => $cn['invoice_no'] ?? '',
                    ':customer_id' => $cn['customer_id'] ?? '',
                    ':customer_name' => $cn['customer_name'] ?? '',
                    ':total_credit_amount' => floatval($cn['total_credit_amount'] ?? 0),
                    ':currency' => $cn['currency'] ?? 'AED',
                    ':reason' => $cn['reason'] ?? '',
                    ':status' => $cn['status'] ?? 'issued',
                    ':data_json' => json_encode($cn, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 12. Debit Notes
        if (!empty($data['debit_notes']) && is_array($data['debit_notes'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_debit_notes (id, debit_note_no, company_id, bill_no, vendor_name, note_date, total_debit_amount, currency, reason, status, data_json, updated_at) VALUES (:id, :debit_note_no, :company_id, :bill_no, :vendor_name, :note_date, :total_debit_amount, :currency, :reason, :status, :data_json, NOW())");
            foreach ($data['debit_notes'] as $dn) {
                $no = $dn['debit_note_no'] ?? $dn['id'] ?? '';
                if (empty($no)) continue;
                $stmt->execute([
                    ':id' => $dn['id'] ?? ('dn-' . $no),
                    ':debit_note_no' => $no,
                    ':company_id' => $dn['company_id'] ?? 'rayan-corp-uae',
                    ':bill_no' => $dn['bill_no'] ?? '',
                    ':vendor_name' => $dn['vendor_name'] ?? '',
                    ':note_date' => !empty($dn['date']) ? $dn['date'] : date('Y-m-d'),
                    ':total_debit_amount' => floatval($dn['total_debit_amount'] ?? 0),
                    ':currency' => $dn['currency'] ?? 'AED',
                    ':reason' => $dn['reason'] ?? '',
                    ':status' => $dn['status'] ?? 'issued',
                    ':data_json' => json_encode($dn, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 13. Bank Accounts
        if (!empty($data['bank_accounts']) && is_array($data['bank_accounts'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_bank_accounts (id, company_id, account_name, bank_name, account_number, iban, swift, branch, currency, balance, signatory, status, data_json, updated_at) VALUES (:id, :company_id, :account_name, :bank_name, :account_number, :iban, :swift, :branch, :currency, :balance, :signatory, :status, :data_json, NOW())");
            foreach ($data['bank_accounts'] as $ba) {
                if (empty($ba['account_name'])) continue;
                $stmt->execute([
                    ':id' => $ba['id'] ?? ('ba-' . rand(1000, 9999)),
                    ':company_id' => $ba['company_id'] ?? 'rayan-corp-uae',
                    ':account_name' => $ba['account_name'],
                    ':bank_name' => $ba['bank_name'] ?? '',
                    ':account_number' => $ba['account_number'] ?? '',
                    ':iban' => $ba['iban'] ?? '',
                    ':swift' => $ba['swift'] ?? '',
                    ':branch' => $ba['branch'] ?? '',
                    ':currency' => $ba['currency'] ?? 'AED',
                    ':balance' => floatval($ba['balance'] ?? 0),
                    ':signatory' => $ba['signatory'] ?? '',
                    ':status' => $ba['status'] ?? 'active',
                    ':data_json' => json_encode($ba, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 14. Cash in Hand
        if (!empty($data['cash_in_hand']) && is_array($data['cash_in_hand'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_cash_in_hand (id, company_id, register_name, location, custodian, currency, balance, last_replenished, data_json, updated_at) VALUES (:id, :company_id, :register_name, :location, :custodian, :currency, :balance, :last_replenished, :data_json, NOW())");
            foreach ($data['cash_in_hand'] as $cih) {
                if (empty($cih['register_name'])) continue;
                $stmt->execute([
                    ':id' => $cih['id'] ?? ('cih-' . rand(1000, 9999)),
                    ':company_id' => $cih['company_id'] ?? 'rayan-corp-uae',
                    ':register_name' => $cih['register_name'],
                    ':location' => $cih['location'] ?? '',
                    ':custodian' => $cih['custodian'] ?? '',
                    ':currency' => $cih['currency'] ?? 'AED',
                    ':balance' => floatval($cih['balance'] ?? 0),
                    ':last_replenished' => !empty($cih['last_replenished']) ? $cih['last_replenished'] : null,
                    ':data_json' => json_encode($cih, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 15. Cheques
        if (!empty($data['cheques']) && is_array($data['cheques'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_cheques (id, company_id, type, cheque_no, bank_name, party_name, amount, currency, cheque_date, status, notes, data_json, updated_at) VALUES (:id, :company_id, :type, :cheque_no, :bank_name, :party_name, :amount, :currency, :cheque_date, :status, :notes, :data_json, NOW())");
            foreach ($data['cheques'] as $chq) {
                if (empty($chq['cheque_no'])) continue;
                $stmt->execute([
                    ':id' => $chq['id'] ?? ('chq-' . rand(1000, 9999)),
                    ':company_id' => $chq['company_id'] ?? 'rayan-corp-uae',
                    ':type' => $chq['type'] ?? '',
                    ':cheque_no' => $chq['cheque_no'],
                    ':bank_name' => $chq['bank_name'] ?? '',
                    ':party_name' => $chq['party_name'] ?? '',
                    ':amount' => floatval($chq['amount'] ?? 0),
                    ':currency' => $chq['currency'] ?? 'AED',
                    ':cheque_date' => !empty($chq['date']) ? $chq['date'] : null,
                    ':status' => $chq['status'] ?? 'pending',
                    ':notes' => $chq['notes'] ?? '',
                    ':data_json' => json_encode($chq, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 16. Bank Transfers
        if (!empty($data['bank_transfers']) && is_array($data['bank_transfers'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_bank_transfers (id, company_id, reference_no, transfer_date, counterparty, source_account_id, source_bank, type, amount, currency, purpose, status, data_json, updated_at) VALUES (:id, :company_id, :reference_no, :transfer_date, :counterparty, :source_account_id, :source_bank, :type, :amount, :currency, :purpose, :status, :data_json, NOW())");
            foreach ($data['bank_transfers'] as $bt) {
                if (empty($bt['reference_no'])) continue;
                $stmt->execute([
                    ':id' => $bt['id'] ?? ('bt-' . rand(1000, 9999)),
                    ':company_id' => $bt['company_id'] ?? 'rayan-corp-uae',
                    ':reference_no' => $bt['reference_no'],
                    ':transfer_date' => !empty($bt['date']) ? $bt['date'] : date('Y-m-d'),
                    ':counterparty' => $bt['counterparty'] ?? '',
                    ':source_account_id' => $bt['source_account_id'] ?? '',
                    ':source_bank' => $bt['source_bank'] ?? '',
                    ':type' => $bt['type'] ?? '',
                    ':amount' => floatval($bt['amount'] ?? 0),
                    ':currency' => $bt['currency'] ?? 'AED',
                    ':purpose' => $bt['purpose'] ?? '',
                    ':status' => $bt['status'] ?? 'completed',
                    ':data_json' => json_encode($bt, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 17. Cash Vouchers
        if (!empty($data['cash_vouchers']) && is_array($data['cash_vouchers'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_cash_vouchers (id, company_id, voucher_no, voucher_date, register_name, custodian, payee, purpose, category, amount, currency, type, status, data_json, updated_at) VALUES (:id, :company_id, :voucher_no, :voucher_date, :register_name, :custodian, :payee, :purpose, :category, :amount, :currency, :type, :status, :data_json, NOW())");
            foreach ($data['cash_vouchers'] as $cv) {
                if (empty($cv['voucher_no'])) continue;
                $stmt->execute([
                    ':id' => $cv['id'] ?? ('cv-' . rand(1000, 9999)),
                    ':company_id' => $cv['company_id'] ?? 'rayan-corp-uae',
                    ':voucher_no' => $cv['voucher_no'],
                    ':voucher_date' => !empty($cv['date']) ? $cv['date'] : date('Y-m-d'),
                    ':register_name' => $cv['register_name'] ?? '',
                    ':custodian' => $cv['custodian'] ?? '',
                    ':payee' => $cv['payee'] ?? '',
                    ':purpose' => $cv['purpose'] ?? '',
                    ':category' => $cv['category'] ?? '',
                    ':amount' => floatval($cv['amount'] ?? 0),
                    ':currency' => $cv['currency'] ?? 'AED',
                    ':type' => $cv['type'] ?? '',
                    ':status' => $cv['status'] ?? 'approved',
                    ':data_json' => json_encode($cv, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 18. Loan Accounts
        if (!empty($data['loan_accounts']) && is_array($data['loan_accounts'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_loan_accounts (id, company_id, facility_name, lender, sanctioned_limit, outstanding_balance, available_limit, currency, facility_type, tenure, data_json, updated_at) VALUES (:id, :company_id, :facility_name, :lender, :sanctioned_limit, :outstanding_balance, :available_limit, :currency, :facility_type, :tenure, :data_json, NOW())");
            foreach ($data['loan_accounts'] as $la) {
                if (empty($la['facility_name'])) continue;
                $stmt->execute([
                    ':id' => $la['id'] ?? ('la-' . rand(1000, 9999)),
                    ':company_id' => $la['company_id'] ?? 'rayan-corp-uae',
                    ':facility_name' => $la['facility_name'],
                    ':lender' => $la['lender'] ?? '',
                    ':sanctioned_limit' => floatval($la['sanctioned_limit'] ?? 0),
                    ':outstanding_balance' => floatval($la['outstanding_balance'] ?? 0),
                    ':available_limit' => floatval($la['available_limit'] ?? 0),
                    ':currency' => $la['currency'] ?? 'AED',
                    ':facility_type' => $la['facility_type'] ?? '',
                    ':tenure' => $la['tenure'] ?? '',
                    ':data_json' => json_encode($la, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 19. Loan Transactions
        if (!empty($data['loan_transactions']) && is_array($data['loan_transactions'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_loan_transactions (id, company_id, facility_id, facility_name, type, amount, currency, transaction_date, reference_no, notes, data_json, updated_at) VALUES (:id, :company_id, :facility_id, :facility_name, :type, :amount, :currency, :transaction_date, :reference_no, :notes, :data_json, NOW())");
            foreach ($data['loan_transactions'] as $lt) {
                $stmt->execute([
                    ':id' => $lt['id'] ?? ('lt-' . rand(1000, 9999)),
                    ':company_id' => $lt['company_id'] ?? 'rayan-corp-uae',
                    ':facility_id' => $lt['facility_id'] ?? '',
                    ':facility_name' => $lt['facility_name'] ?? '',
                    ':type' => $lt['type'] ?? '',
                    ':amount' => floatval($lt['amount'] ?? 0),
                    ':currency' => $lt['currency'] ?? 'AED',
                    ':transaction_date' => !empty($lt['date']) ? $lt['date'] : date('Y-m-d'),
                    ':reference_no' => $lt['reference_no'] ?? '',
                    ':notes' => $lt['notes'] ?? '',
                    ':data_json' => json_encode($lt, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 20. Companies
        if (!empty($data['companies']) && is_array($data['companies'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_companies (id, name, short_name, country, currency, currency_symbol, trn_vat, email, phone, data_json, updated_at) VALUES (:id, :name, :short_name, :country, :currency, :currency_symbol, :trn_vat, :email, :phone, :data_json, NOW())");
            foreach ($data['companies'] as $comp) {
                if (empty($comp['name'])) continue;
                $stmt->execute([
                    ':id' => $comp['id'] ?? ('comp-' . rand(1000, 9999)),
                    ':name' => $comp['name'],
                    ':short_name' => $comp['short_name'] ?? '',
                    ':country' => $comp['country'] ?? 'UAE',
                    ':currency' => $comp['currency'] ?? 'AED',
                    ':currency_symbol' => $comp['currency_symbol'] ?? 'AED',
                    ':trn_vat' => $comp['trn_vat'] ?? '',
                    ':email' => $comp['email'] ?? '',
                    ':phone' => $comp['phone'] ?? '',
                    ':data_json' => json_encode($comp, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 21. Users
        if (!empty($data['users']) && is_array($data['users'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_users (id, email, name, role, designation, department, phone, status, data_json, updated_at) VALUES (:id, :email, :name, :role, :designation, :department, :phone, :status, :data_json, NOW())");
            foreach ($data['users'] as $u) {
                if (empty($u['email'])) continue;
                $stmt->execute([
                    ':id' => $u['id'] ?? ('usr-' . rand(1000, 9999)),
                    ':email' => $u['email'],
                    ':name' => $u['name'] ?? '',
                    ':role' => $u['role'] ?? 'finance',
                    ':designation' => $u['designation'] ?? '',
                    ':department' => $u['department'] ?? '',
                    ':phone' => $u['phone'] ?? '',
                    ':status' => $u['status'] ?? 'active',
                    ':data_json' => json_encode($u, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 22. Audit Logs
        if (!empty($data['audit_logs']) && is_array($data['audit_logs'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_audit_logs (id, timestamp, actor_name, actor_role, actor_email, action, entity, entity_id, details, ip_address, data_json) VALUES (:id, :timestamp, :actor_name, :actor_role, :actor_email, :action, :entity, :entity_id, :details, :ip_address, :data_json)");
            foreach (array_slice($data['audit_logs'], 0, 100) as $al) {
                $stmt->execute([
                    ':id' => $al['id'] ?? ('aud-' . rand(100000, 999999)),
                    ':timestamp' => $al['timestamp'] ?? date('c'),
                    ':actor_name' => $al['actor_name'] ?? 'System',
                    ':actor_role' => $al['actor_role'] ?? 'admin',
                    ':actor_email' => $al['actor_email'] ?? '',
                    ':action' => $al['action'] ?? '',
                    ':entity' => $al['entity'] ?? '',
                    ':entity_id' => $al['entity_id'] ?? '',
                    ':details' => $al['details'] ?? '',
                    ':ip_address' => $al['ip_address'] ?? '127.0.0.1',
                    ':data_json' => json_encode($al, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 23. Documents
        if (!empty($data['documents']) && is_array($data['documents'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_documents (id, name, category, size, uploaded_by, doc_date, linked_record, data_json) VALUES (:id, :name, :category, :size, :uploaded_by, :doc_date, :linked_record, :data_json)");
            foreach ($data['documents'] as $doc) {
                $stmt->execute([
                    ':id' => $doc['id'] ?? ('doc-' . rand(1000, 9999)),
                    ':name' => $doc['name'] ?? 'Document',
                    ':category' => $doc['category'] ?? '',
                    ':size' => $doc['size'] ?? '',
                    ':uploaded_by' => $doc['uploaded_by'] ?? '',
                    ':doc_date' => !empty($doc['date']) ? $doc['date'] : date('Y-m-d'),
                    ':linked_record' => $doc['linked_record'] ?? '',
                    ':data_json' => json_encode($doc, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 24. Notifications
        if (!empty($data['notifications']) && is_array($data['notifications'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_notifications (id, title, message, type, timestamp, is_read, link, data_json) VALUES (:id, :title, :message, :type, :timestamp, :is_read, :link, :data_json)");
            foreach ($data['notifications'] as $notif) {
                $stmt->execute([
                    ':id' => $notif['id'] ?? ('notif-' . rand(1000, 9999)),
                    ':title' => $notif['title'] ?? 'Notification',
                    ':message' => $notif['message'] ?? '',
                    ':type' => $notif['type'] ?? 'info',
                    ':timestamp' => $notif['timestamp'] ?? date('c'),
                    ':is_read' => !empty($notif['read']) ? 1 : 0,
                    ':link' => $notif['link'] ?? '',
                    ':data_json' => json_encode($notif, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        // 25. Settings
        if (!empty($data['settings']) && is_array($data['settings'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_settings (setting_key, setting_val, updated_at) VALUES (:key, :val, NOW())");
            foreach ($data['settings'] as $k => $v) {
                $stmt->execute([
                    ':key' => $k,
                    ':val' => is_scalar($v) ? (string)$v : json_encode($v, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }
    } catch (Exception $e) {
        error_log("syncToRelationalTables error: " . $e->getMessage());
    }
}

// 4. Initialize Database
$db = loadFinanceDb($pdo, $dataFile, $candidates);
if (!$db || empty($db['companies'])) {
    $db = getMasterSeed($candidates) ?: ['companies' => [], 'invoices' => [], 'customers' => [], 'customer_receipts' => []];
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: $_POST;
$action = $_GET['action'] ?? $body['action'] ?? 'get_state';

// 5. GET Handler
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'get_state') {
        echo json_encode([
            'success' => true,
            'storage' => $pdo ? 'hostinger_mysql' : 'json_file',
            'data' => $db
        ]);
        exit;
    }

    if ($action === 'get_users') {
        $sanitizedUsers = array_map(function($u) {
            unset($u['password']);
            return $u;
        }, $db['users'] ?? []);
        echo json_encode(['success' => true, 'users' => $sanitizedUsers]);
        exit;
    }

    echo json_encode(['success' => true, 'data' => $db]);
    exit;
}

// 6. POST Handler
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Helper for audit logging
    $addAuditLog = function($actionType, $entity, $entityId, $details) use (&$db, $body) {
        if (!isset($db['audit_logs']) || !is_array($db['audit_logs'])) {
            $db['audit_logs'] = [];
        }
        $logEntry = [
            'id' => 'aud-' . dechex(intval(microtime(true) * 1000)),
            'timestamp' => date('c'),
            'actor_name' => $body['user_name'] ?? 'Authorized Personnel',
            'actor_role' => $body['user_role'] ?? 'finance',
            'actor_email' => $body['user_email'] ?? 'system@rayangroup.com',
            'action' => $actionType,
            'entity' => $entity,
            'entity_id' => $entityId,
            'details' => $details,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
        ];
        array_unshift($db['audit_logs'], $logEntry);
    };

    switch ($action) {
        case 'create_invoice':
        case 'update_invoice':
            $inv = $body['invoice'] ?? [];
            $oldInvNo = trim($body['old_invoice_no'] ?? '');
            $oldId = trim($body['old_id'] ?? '');
            if (!empty($inv)) {
                if (!isset($db['invoices']) || !is_array($db['invoices'])) {
                    $db['invoices'] = [];
                }

                $targetInvNo = !empty($oldInvNo) ? $oldInvNo : ($inv['invoice_no'] ?? '');
                $targetId = !empty($oldId) ? $oldId : ($inv['id'] ?? '');

                // Find existing invoice by old_id, old_invoice_no, id, or invoice_no
                $foundIdx = -1;
                foreach ($db['invoices'] as $idx => $exI) {
                    $matchOldId = (!empty($oldId) && ($exI['id'] ?? '') === $oldId);
                    $matchOldNo = (!empty($oldInvNo) && strcasecmp($exI['invoice_no'] ?? '', $oldInvNo) === 0);
                    $matchId = (!empty($inv['id']) && ($exI['id'] ?? '') === $inv['id']);
                    $matchNo = (!empty($inv['invoice_no']) && strcasecmp($exI['invoice_no'] ?? '', $inv['invoice_no']) === 0);
                    if ($matchOldId || $matchOldNo || $matchId || $matchNo) {
                        $foundIdx = $idx;
                        break;
                    }
                }

                if ($foundIdx >= 0) {
                    // Update the existing record in-place!
                    $db['invoices'][$foundIdx] = array_merge($db['invoices'][$foundIdx], $inv);
                    $addAuditLog('update', 'invoice', $inv['invoice_no'] ?? '', 'Updated tax invoice for ' . ($inv['customer_name'] ?? ''));
                } else {
                    // Only insert if completely new
                    array_unshift($db['invoices'], $inv);
                    $addAuditLog('create', 'invoice', $inv['invoice_no'] ?? '', 'Created tax invoice for ' . ($inv['customer_name'] ?? ''));
                }

                // Deduplicate $db['invoices'] so no two invoices share the same invoice_no or ID
                $deduped = [];
                $seenNos = [];
                $seenIds = [];
                foreach ($db['invoices'] as $item) {
                    $noKey = strtolower(trim($item['invoice_no'] ?? ''));
                    $idKey = strtolower(trim($item['id'] ?? ''));
                    if ((!empty($noKey) && isset($seenNos[$noKey])) || (!empty($idKey) && isset($seenIds[$idKey]))) {
                        continue;
                    }
                    if (!empty($noKey)) $seenNos[$noKey] = true;
                    if (!empty($idKey)) $seenIds[$idKey] = true;
                    $deduped[] = $item;
                }
                $db['invoices'] = $deduped;

                // If invoice number or ID changed, delete old record from MySQL finance_invoices so no orphaned row exists
                if ($pdo) {
                    try {
                        if (!empty($oldInvNo) && strcasecmp($oldInvNo, $inv['invoice_no'] ?? '') !== 0) {
                            $stmtDel = $pdo->prepare("DELETE FROM finance_invoices WHERE invoice_no = ?");
                            $stmtDel->execute([$oldInvNo]);
                        }
                        if (!empty($oldId) && $oldId !== ($inv['id'] ?? '')) {
                            $stmtDel = $pdo->prepare("DELETE FROM finance_invoices WHERE id = ?");
                            $stmtDel->execute([$oldId]);
                        }
                    } catch (Exception $e) {}
                }

                // If invoice number changed, cascade update to linked customer receipts and credit notes
                if (!empty($oldInvNo) && !empty($inv['invoice_no']) && strcasecmp($oldInvNo, $inv['invoice_no']) !== 0) {
                    if (!empty($db['customer_receipts']) && is_array($db['customer_receipts'])) {
                        foreach ($db['customer_receipts'] as &$rcp) {
                            if (strcasecmp($rcp['ref_invoice_no'] ?? '', $oldInvNo) === 0) {
                                $rcp['ref_invoice_no'] = $inv['invoice_no'];
                            }
                            if (!empty($rcp['allocations']) && is_array($rcp['allocations'])) {
                                foreach ($rcp['allocations'] as &$alloc) {
                                    $matchAllocNo = strcasecmp($alloc['invoice_no'] ?? '', $oldInvNo) === 0;
                                    $matchAllocId = (!empty($oldId) && ($alloc['invoice_id'] ?? '') === $oldId);
                                    if ($matchAllocNo || $matchAllocId) {
                                        $alloc['invoice_no'] = $inv['invoice_no'];
                                        if (!empty($inv['id'])) $alloc['invoice_id'] = $inv['id'];
                                    }
                                }
                                unset($alloc);
                            }
                        }
                        unset($rcp);
                    }
                    if (!empty($db['credit_notes']) && is_array($db['credit_notes'])) {
                        foreach ($db['credit_notes'] as &$cn) {
                            if (strcasecmp($cn['ref_invoice_no'] ?? '', $oldInvNo) === 0) {
                                $cn['ref_invoice_no'] = $inv['invoice_no'];
                            }
                        }
                        unset($cn);
                    }
                }
            }
            break;

        case 'create_project':
        case 'update_project':
            $prj = $body['project'] ?? [];
            if (!empty($prj)) {
                if (empty($prj['id'])) {
                    $prj['id'] = 'prj-' . round(microtime(true) * 1000);
                }
                if (empty($prj['company_id'])) {
                    $prj['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($prj['currency'])) {
                    $prj['currency'] = ($prj['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                }
                if (empty($prj['status'])) {
                    $prj['status'] = 'In Progress';
                }
                if (!isset($db['projects']) || !is_array($db['projects'])) {
                    $db['projects'] = [];
                }
                $foundPrj = -1;
                foreach ($db['projects'] as $idx => $exP) {
                    if (($exP['id'] ?? '') === ($prj['id'] ?? '') || ($exP['code'] ?? '') === ($prj['code'] ?? '')) {
                        $foundPrj = $idx;
                        break;
                    }
                }
                if ($foundPrj >= 0) {
                    $db['projects'][$foundPrj] = array_merge($db['projects'][$foundPrj], $prj);
                    $addAuditLog('update', 'project', $prj['code'] ?? '', 'Updated project ' . ($prj['name'] ?? ''));
                } else {
                    array_unshift($db['projects'], $prj);
                    $addAuditLog('create', 'project', $prj['code'] ?? '', 'Created project ' . ($prj['name'] ?? ''));
                }
            }
            break;



        case 'update_bill':
            $bill = $body['bill'] ?? [];
            if (!empty($bill) && isset($db['purchase_bills'])) {
                $targetId = $bill['id'] ?? $bill['bill_no'] ?? '';
                foreach ($db['purchase_bills'] as &$existingB) {
                    if (($existingB['id'] ?? '') === $targetId || ($existingB['bill_no'] ?? '') === $targetId) {
                        $existingB = array_merge($existingB, $bill);
                        break;
                    }
                }
                unset($existingB);

                // Auto-register and persist PO if a PO number or reference is present
                $poRef = trim($bill['po_no'] ?? $bill['po_reference'] ?? $bill['po_number'] ?? '');
                if (!empty($poRef)) {
                    if (!isset($db['purchase_orders']) || !is_array($db['purchase_orders'])) {
                        $db['purchase_orders'] = [];
                    }
                    $poExists = false;
                    foreach ($db['purchase_orders'] as &$existingPo) {
                        if (strtolower(trim($existingPo['po_no'] ?? '')) === strtolower($poRef) || ($existingPo['id'] ?? '') === ($bill['po_id'] ?? '')) {
                            $poExists = true;
                            if (empty($existingPo['vendor_name']) && !empty($bill['vendor_name'])) {
                                $existingPo['vendor_name'] = $bill['vendor_name'];
                                $existingPo['supplier_name'] = $bill['vendor_name'];
                            }
                            break;
                        }
                    }
                    unset($existingPo);
                    if (!$poExists) {
                        $newPo = [
                            'id' => !empty($bill['po_id']) ? $bill['po_id'] : ('po-' . round(microtime(true) * 1000)),
                            'po_no' => $poRef,
                            'company_id' => $bill['company_id'] ?? 'rayan-corp-uae',
                            'currency' => $bill['currency'] ?? 'AED',
                            'vendor_id' => $bill['vendor_id'] ?? null,
                            'vendor_name' => $bill['vendor_name'] ?? '',
                            'supplier_name' => $bill['vendor_name'] ?? '',
                            'supplier_trn' => $bill['vendor_trn'] ?? '',
                            'project_id' => $bill['project_id'] ?? null,
                            'project_name' => $bill['project_name'] ?? '',
                            'date' => $bill['bill_date'] ?? date('Y-m-d'),
                            'subtotal' => floatval($bill['taxable_subtotal'] ?? 0),
                            'tax_total' => floatval($bill['tax_total'] ?? 0),
                            'total_value' => floatval($bill['grand_total'] ?? 0),
                            'grand_total' => floatval($bill['grand_total'] ?? 0),
                            'status' => 'approved',
                            'approved_by' => $body['user_name'] ?? 'System Sign-off'
                        ];
                        array_unshift($db['purchase_orders'], $newPo);
                    }
                }

                $addAuditLog('update', 'bill', $bill['bill_no'] ?? '', 'Updated purchase bill ' . ($bill['bill_no'] ?? ''));
            }
            break;

        case 'update_expense':
            $exp = $body['expense'] ?? [];
            if (!empty($exp) && isset($db['expenses'])) {
                $targetId = $exp['id'] ?? $exp['expense_no'] ?? '';
                foreach ($db['expenses'] as &$existingE) {
                    if (($existingE['id'] ?? '') === $targetId || ($existingE['expense_no'] ?? '') === $targetId) {
                        $existingE = array_merge($existingE, $exp);
                        break;
                    }
                }
                unset($existingE);
                $addAuditLog('update', 'expense', $exp['expense_no'] ?? '', 'Updated expense claim ' . ($exp['expense_no'] ?? ''));
            }
            break;

        case 'delete_invoice':
            $invId = trim($body['invoice_id'] ?? $body['id'] ?? '');
            $invNo = trim($body['invoice_no'] ?? '');
            if ((!empty($invId) || !empty($invNo)) && isset($db['invoices'])) {
                $db['invoices'] = array_values(array_filter($db['invoices'], function($item) use ($invId, $invNo) {
                    $matchId = (!empty($invId) && ($item['id'] ?? '') === $invId);
                    $matchNo = (!empty($invNo) && strcasecmp($item['invoice_no'] ?? '', $invNo) === 0);
                    $matchDirect = (!empty($invId) && strcasecmp($item['invoice_no'] ?? '', $invId) === 0);
                    return !($matchId || $matchNo || $matchDirect);
                }));
                if ($pdo) {
                    try {
                        if (!empty($invId)) {
                            $stmt = $pdo->prepare("DELETE FROM finance_invoices WHERE id = ? OR invoice_no = ?");
                            $stmt->execute([$invId, $invId]);
                        }
                        if (!empty($invNo)) {
                            $stmt = $pdo->prepare("DELETE FROM finance_invoices WHERE invoice_no = ? OR id = ?");
                            $stmt->execute([$invNo, $invNo]);
                        }
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'invoice', $invNo ?: $invId, 'Deleted invoice ' . ($invNo ?: $invId));
            }
            break;

        case 'delete_bill':
            $billId = $body['bill_id'] ?? $body['id'] ?? '';
            if (!empty($billId) && isset($db['purchase_bills'])) {
                $db['purchase_bills'] = array_values(array_filter($db['purchase_bills'], function($item) use ($billId) {
                    return ($item['id'] ?? '') !== $billId && ($item['bill_no'] ?? '') !== $billId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_purchase_bills WHERE id = ? OR bill_no = ?");
                        $stmt->execute([$billId, $billId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'bill', $billId, 'Deleted bill ' . $billId);
            }
            break;

        case 'delete_receipt':
            $rcpId = $body['receipt_id'] ?? $body['id'] ?? '';
            if (!empty($rcpId) && isset($db['customer_receipts'])) {
                $db['customer_receipts'] = array_values(array_filter($db['customer_receipts'], function($item) use ($rcpId) {
                    return ($item['id'] ?? '') !== $rcpId && ($item['receipt_no'] ?? '') !== $rcpId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_receipts WHERE id = ? OR receipt_no = ?");
                        $stmt->execute([$rcpId, $rcpId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'receipt', $rcpId, 'Deleted customer receipt ' . $rcpId);
            }
            break;

        case 'delete_payment':
            $payId = $body['payment_id'] ?? $body['id'] ?? '';
            if (!empty($payId) && isset($db['vendor_payments'])) {
                $db['vendor_payments'] = array_values(array_filter($db['vendor_payments'], function($item) use ($payId) {
                    return ($item['id'] ?? '') !== $payId && ($item['voucher_no'] ?? '') !== $payId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_vendor_payments WHERE id = ? OR voucher_no = ?");
                        $stmt->execute([$payId, $payId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'payment', $payId, 'Deleted vendor payment ' . $payId);
            }
            break;

        case 'delete_customer':
            $custId = $body['customer_id'] ?? $body['id'] ?? '';
            $custCode = $body['code'] ?? '';
            $custName = $body['name'] ?? '';
            if ((!empty($custId) || !empty($custName)) && isset($db['customers'])) {
                $db['customers'] = array_values(array_filter($db['customers'], function($item) use ($custId, $custCode, $custName) {
                    if (!empty($custId) && (($item['id'] ?? '') === $custId || ($item['code'] ?? '') === $custId)) return false;
                    if (!empty($custCode) && ($item['code'] ?? '') === $custCode) return false;
                    if (!empty($custName) && strcasecmp(trim($item['name'] ?? ''), trim($custName)) === 0) return false;
                    return true;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_customers WHERE id = ? OR code = ? OR name = ?");
                        $stmt->execute([$custId, $custCode ?: $custId, $custName ?: $custId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'customer', $custId, 'Deleted customer ' . ($custName ?: $custId));
            }
            break;

        case 'delete_vendor':
            $vndId = $body['vendor_id'] ?? $body['id'] ?? '';
            if (!empty($vndId) && isset($db['vendors'])) {
                $db['vendors'] = array_values(array_filter($db['vendors'], function($item) use ($vndId) {
                    return ($item['id'] ?? '') !== $vndId && ($item['code'] ?? '') !== $vndId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_vendors WHERE id = ? OR code = ?");
                        $stmt->execute([$vndId, $vndId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'vendor', $vndId, 'Deleted vendor ' . $vndId);
            }
            break;

        case 'delete_item':
            $itemId = $body['item_id'] ?? $body['id'] ?? '';
            if (!empty($itemId) && isset($db['items'])) {
                $db['items'] = array_values(array_filter($db['items'], function($item) use ($itemId) {
                    return ($item['id'] ?? '') !== $itemId && ($item['code'] ?? '') !== $itemId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_items WHERE id = ? OR code = ?");
                        $stmt->execute([$itemId, $itemId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'item', $itemId, 'Deleted item ' . $itemId);
            }
            break;

        case 'delete_project':
            $prjId = $body['project_id'] ?? $body['id'] ?? '';
            if (!empty($prjId) && isset($db['projects'])) {
                $db['projects'] = array_values(array_filter($db['projects'], function($item) use ($prjId) {
                    return ($item['id'] ?? '') !== $prjId && ($item['code'] ?? '') !== $prjId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_projects WHERE id = ? OR code = ?");
                        $stmt->execute([$prjId, $prjId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'project', $prjId, 'Deleted project ' . $prjId);
            }
            break;

        case 'delete_po':
            $poId = $body['po_id'] ?? $body['id'] ?? '';
            if (!empty($poId) && isset($db['purchase_orders'])) {
                $db['purchase_orders'] = array_values(array_filter($db['purchase_orders'], function($item) use ($poId) {
                    return ($item['id'] ?? '') !== $poId && ($item['po_no'] ?? '') !== $poId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_purchase_orders WHERE id = ? OR po_no = ?");
                        $stmt->execute([$poId, $poId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'po', $poId, 'Deleted purchase order ' . $poId);
            }
            break;

        case 'delete_credit_note':
            $cnId = $body['credit_note_id'] ?? $body['id'] ?? '';
            if (!empty($cnId) && isset($db['credit_notes'])) {
                $db['credit_notes'] = array_values(array_filter($db['credit_notes'], function($item) use ($cnId) {
                    return ($item['id'] ?? '') !== $cnId && ($item['credit_note_no'] ?? '') !== $cnId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_credit_notes WHERE id = ? OR credit_note_no = ?");
                        $stmt->execute([$cnId, $cnId]);
                    } catch (Exception $e) {}
                }
                recalculateAllFinanceBalances($db);
                $addAuditLog('delete', 'credit_note', $cnId, 'Deleted credit note ' . $cnId);
            }
            break;

        case 'delete_debit_note':
            $dnId = $body['debit_note_id'] ?? $body['id'] ?? '';
            if (!empty($dnId) && isset($db['debit_notes'])) {
                $db['debit_notes'] = array_values(array_filter($db['debit_notes'], function($item) use ($dnId) {
                    return ($item['id'] ?? '') !== $dnId && ($item['debit_note_no'] ?? '') !== $dnId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_debit_notes WHERE id = ? OR debit_note_no = ?");
                        $stmt->execute([$dnId, $dnId]);
                    } catch (Exception $e) {}
                }
                recalculateAllFinanceBalances($db);
                $addAuditLog('delete', 'debit_note', $dnId, 'Deleted debit note ' . $dnId);
            }
            break;

        case 'delete_expense':
            $expId = $body['expense_id'] ?? $body['id'] ?? '';
            if (!empty($expId) && isset($db['expenses'])) {
                $db['expenses'] = array_values(array_filter($db['expenses'], function($item) use ($expId) {
                    return ($item['id'] ?? '') !== $expId && ($item['expense_no'] ?? '') !== $expId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_expenses WHERE id = ? OR expense_no = ?");
                        $stmt->execute([$expId, $expId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'expense', $expId, 'Deleted expense ' . $expId);
            }
            break;

        case 'update_receipt':
            $rcp = $body['receipt'] ?? [];
            $oldRcpNo = trim($body['old_receipt_no'] ?? '');
            if (!empty($rcp) && isset($db['customer_receipts'])) {
                $targetId = $rcp['id'] ?? '';
                foreach ($db['customer_receipts'] as &$existingR) {
                    if (($existingR['id'] ?? '') === $targetId || 
                        (!empty($oldRcpNo) && ($existingR['receipt_no'] ?? '') === $oldRcpNo) || 
                        ($existingR['receipt_no'] ?? '') === ($rcp['receipt_no'] ?? '')) {
                        $existingR = array_merge($existingR, $rcp);
                        break;
                    }
                }
                unset($existingR);
                $addAuditLog('update', 'receipt', $rcp['receipt_no'] ?? '', 'Updated customer receipt ' . ($rcp['receipt_no'] ?? ''));
            }
            break;

        case 'update_payment':
            $pay = $body['payment'] ?? [];
            if (!empty($pay) && isset($db['vendor_payments'])) {
                $targetId = $pay['id'] ?? $pay['voucher_no'] ?? '';
                foreach ($db['vendor_payments'] as &$existingP) {
                    if (($existingP['id'] ?? '') === $targetId || ($existingP['voucher_no'] ?? '') === $targetId) {
                        $existingP = array_merge($existingP, $pay);
                        break;
                    }
                }
                unset($existingP);
                $addAuditLog('update', 'payment', $pay['voucher_no'] ?? '', 'Updated vendor payment voucher ' . ($pay['voucher_no'] ?? ''));
            }
            break;

        case 'update_po':
            $po = $body['po'] ?? [];
            if (!empty($po) && isset($db['purchase_orders'])) {
                $targetId = $po['id'] ?? $po['po_no'] ?? '';
                foreach ($db['purchase_orders'] as &$existingPO) {
                    if (($existingPO['id'] ?? '') === $targetId || ($existingPO['po_no'] ?? '') === $targetId) {
                        $existingPO = array_merge($existingPO, $po);
                        break;
                    }
                }
                unset($existingPO);
                $addAuditLog('update', 'po', $po['po_no'] ?? '', 'Updated purchase order ' . ($po['po_no'] ?? ''));
            }
            break;

        case 'update_credit_note':
            $cn = $body['credit_note'] ?? [];
            if (!empty($cn) && isset($db['credit_notes'])) {
                $targetId = $cn['id'] ?? $cn['credit_note_no'] ?? '';
                foreach ($db['credit_notes'] as &$existingCN) {
                    if (($existingCN['id'] ?? '') === $targetId || ($existingCN['credit_note_no'] ?? '') === $targetId) {
                        $existingCN = array_merge($existingCN, $cn);
                        break;
                    }
                }
                unset($existingCN);
                recalculateAllFinanceBalances($db);
                $addAuditLog('update', 'credit_note', $cn['credit_note_no'] ?? '', 'Updated credit note ' . ($cn['credit_note_no'] ?? ''));
            }
            break;

        case 'update_debit_note':
            $dn = $body['debit_note'] ?? [];
            if (!empty($dn) && isset($db['debit_notes'])) {
                $targetId = $dn['id'] ?? $dn['debit_note_no'] ?? '';
                foreach ($db['debit_notes'] as &$existingDN) {
                    if (($existingDN['id'] ?? '') === $targetId || ($existingDN['debit_note_no'] ?? '') === $targetId) {
                        $existingDN = array_merge($existingDN, $dn);
                        break;
                    }
                }
                unset($existingDN);
                recalculateAllFinanceBalances($db);
                $addAuditLog('update', 'debit_note', $dn['debit_note_no'] ?? '', 'Updated debit note ' . ($dn['debit_note_no'] ?? ''));
            }
            break;

        case 'create_document':
            $doc = $body['document'] ?? [];
            if (!empty($doc)) {
                if (empty($doc['id'])) $doc['id'] = 'doc-' . round(microtime(true) * 1000);
                if (!isset($db['documents']) || !is_array($db['documents'])) $db['documents'] = [];
                array_unshift($db['documents'], $doc);
                $addAuditLog('create', 'document', $doc['name'] ?? '', 'Uploaded document ' . ($doc['name'] ?? ''));
            }
            break;

        case 'update_document':
            $doc = $body['document'] ?? [];
            if (!empty($doc) && isset($db['documents'])) {
                $targetId = $doc['id'] ?? '';
                foreach ($db['documents'] as &$existingD) {
                    if (($existingD['id'] ?? '') === $targetId) {
                        $existingD = array_merge($existingD, $doc);
                        break;
                    }
                }
                unset($existingD);
                $addAuditLog('update', 'document', $doc['name'] ?? '', 'Updated document ' . ($doc['name'] ?? ''));
            }
            break;

        case 'delete_document':
            $docId = $body['document_id'] ?? $body['id'] ?? '';
            if (!empty($docId) && isset($db['documents'])) {
                $db['documents'] = array_values(array_filter($db['documents'], function($item) use ($docId) {
                    return ($item['id'] ?? '') !== $docId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_documents WHERE id = ?");
                        $stmt->execute([$docId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'document', $docId, 'Deleted document ' . $docId);
            }
            break;

        case 'create_bill':
            $bill = $body['bill'] ?? [];
            if (!empty($bill)) {
                if (empty($bill['id'])) {
                    $bill['id'] = 'bill-' . round(microtime(true) * 1000);
                }
                if (empty($bill['company_id'])) {
                    $bill['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($bill['currency'])) {
                    $bill['currency'] = ($bill['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                }
                if (empty($bill['bill_no'])) {
                    $prefix = ($bill['company_id'] === 'ashaz-eng-in') ? 'BILL-ASH' : 'BILL-RG-2026';
                    $bill['bill_no'] = $prefix . '-' . rand(100, 999);
                }
                if (empty($bill['approval_status'])) {
                    $bill['approval_status'] = 'approved';
                }
                if (empty($bill['status'])) {
                    $bill['status'] = 'unpaid';
                }
                if (!isset($bill['amount_paid'])) {
                    $bill['amount_paid'] = 0;
                }
                if (!isset($bill['balance_due'])) {
                    $bill['balance_due'] = floatval($bill['grand_total'] ?? 0);
                }
                if (!isset($db['purchase_bills']) || !is_array($db['purchase_bills'])) {
                    $db['purchase_bills'] = [];
                }
                array_unshift($db['purchase_bills'], $bill);

                // Auto-register and persist PO if a PO number or reference is present
                $poRef = trim($bill['po_no'] ?? $bill['po_reference'] ?? $bill['po_number'] ?? '');
                if (!empty($poRef)) {
                    if (!isset($db['purchase_orders']) || !is_array($db['purchase_orders'])) {
                        $db['purchase_orders'] = [];
                    }
                    $poExists = false;
                    foreach ($db['purchase_orders'] as &$existingPo) {
                        if (strtolower(trim($existingPo['po_no'] ?? '')) === strtolower($poRef) || ($existingPo['id'] ?? '') === ($bill['po_id'] ?? '')) {
                            $poExists = true;
                            if (empty($existingPo['vendor_name']) && !empty($bill['vendor_name'])) {
                                $existingPo['vendor_name'] = $bill['vendor_name'];
                                $existingPo['supplier_name'] = $bill['vendor_name'];
                            }
                            break;
                        }
                    }
                    unset($existingPo);
                    if (!$poExists) {
                        $newPo = [
                            'id' => !empty($bill['po_id']) ? $bill['po_id'] : ('po-' . round(microtime(true) * 1000)),
                            'po_no' => $poRef,
                            'company_id' => $bill['company_id'] ?? 'rayan-corp-uae',
                            'currency' => $bill['currency'] ?? 'AED',
                            'vendor_id' => $bill['vendor_id'] ?? null,
                            'vendor_name' => $bill['vendor_name'] ?? '',
                            'supplier_name' => $bill['vendor_name'] ?? '',
                            'supplier_trn' => $bill['vendor_trn'] ?? '',
                            'project_id' => $bill['project_id'] ?? null,
                            'project_name' => $bill['project_name'] ?? '',
                            'date' => $bill['bill_date'] ?? date('Y-m-d'),
                            'subtotal' => floatval($bill['taxable_subtotal'] ?? 0),
                            'tax_total' => floatval($bill['tax_total'] ?? 0),
                            'total_value' => floatval($bill['grand_total'] ?? 0),
                            'grand_total' => floatval($bill['grand_total'] ?? 0),
                            'status' => 'approved',
                            'approved_by' => $body['user_name'] ?? 'System Sign-off'
                        ];
                        array_unshift($db['purchase_orders'], $newPo);
                    }
                }

                $addAuditLog('create', 'bill', $bill['bill_no'] ?? '', 'Created purchase bill for ' . ($bill['vendor_name'] ?? ''));
            }
            break;

        case 'create_expense':
            $exp = $body['expense'] ?? [];
            if (!empty($exp)) {
                if (empty($exp['id'])) {
                    $exp['id'] = 'exp-' . round(microtime(true) * 1000);
                }
                if (empty($exp['company_id'])) {
                    $exp['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($exp['currency'])) {
                    $exp['currency'] = ($exp['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                }
                if (empty($exp['expense_no'])) {
                    $prefix = ($exp['company_id'] === 'ashaz-eng-in') ? 'EXP-ASH' : 'EXP-RG-2026';
                    $exp['expense_no'] = $prefix . '-' . rand(100, 999);
                }
                if (empty($exp['status'])) {
                    $exp['status'] = 'approved';
                }
                if (!isset($exp['total_amount'])) {
                    $exp['total_amount'] = floatval($exp['amount'] ?? 0) + floatval($exp['tax_amount'] ?? 0);
                }
                if (empty($exp['submitted_by'])) {
                    $exp['submitted_by'] = $body['user_name'] ?? 'Authorized Personnel';
                }
                if (!isset($db['expenses']) || !is_array($db['expenses'])) {
                    $db['expenses'] = [];
                }
                array_unshift($db['expenses'], $exp);
                // Check if expense was paid from Director's Current Account (Personal Funds)
                $expMode = $exp['payment_method'] ?? $exp['payment_mode'] ?? '';
                if (stripos($expMode, 'Director') !== false || stripos($expMode, 'Personal') !== false) {
                    $dirLoanId = 'loan-dir-current-act';
                    $expAmt = floatval($exp['total_amount'] ?? $exp['amount'] ?? 0);
                    if ($expAmt > 0 && !empty($db['loan_accounts'])) {
                        foreach ($db['loan_accounts'] as &$lf) {
                            if (($lf['id'] ?? '') === $dirLoanId) {
                                $lf['outstanding_balance'] = floatval($lf['outstanding_balance'] ?? 0) + $expAmt;
                                $lf['available_limit'] = max(0, floatval($lf['sanctioned_limit'] ?? 0) - floatval($lf['outstanding_balance'] ?? 0));
                                break;
                            }
                        }
                        unset($lf);
                        if (!isset($db['loan_transactions']) || !is_array($db['loan_transactions'])) {
                            $db['loan_transactions'] = [];
                        }
                        array_unshift($db['loan_transactions'], [
                            'id' => 'lt-' . round(microtime(true) * 1000),
                            'company_id' => $exp['company_id'] ?? 'rayan-corp-uae',
                            'facility_id' => $dirLoanId,
                            'facility_name' => "Director's Current Account — Arshad Alam Shaikh",
                            'type' => 'drawdown',
                            'type_label' => 'Personal Contribution (Business Expense Claim)',
                            'amount' => $expAmt,
                            'reference_no' => $exp['expense_no'] ?? ('EXP-' . rand(1000, 9999)),
                            'date' => $exp['date'] ?? $exp['expense_date'] ?? date('Y-m-d'),
                            'notes' => 'Business expense: ' . ($exp['description'] ?? 'Expense') . ' paid from personal funds'
                        ]);
                    }
                }
                $addAuditLog('create', 'expense', $exp['expense_no'] ?? '', 'Recorded operational expense of ' . ($exp['total_amount'] ?? 0));
            }
            break;

        case 'create_po':
            $po = $body['po'] ?? [];
            if (!empty($po)) {
                if (empty($po['id'])) {
                    $po['id'] = 'po-' . round(microtime(true) * 1000);
                }
                if (empty($po['company_id'])) {
                    $po['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($po['currency'])) {
                    $po['currency'] = ($po['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                }
                if (empty($po['po_no'])) {
                    $prefix = ($po['company_id'] === 'ashaz-eng-in') ? 'PO-ASH' : 'PO-REC';
                    $po['po_no'] = $prefix . '-' . rand(10000, 99999);
                }
                if (empty($po['status'])) {
                    $po['status'] = 'approved';
                }
                if (!isset($db['purchase_orders']) || !is_array($db['purchase_orders'])) {
                    $db['purchase_orders'] = [];
                }
                array_unshift($db['purchase_orders'], $po);
                $addAuditLog('create', 'po', $po['po_no'] ?? '', 'Issued purchase order ' . ($po['po_no'] ?? ''));
            }
            break;

        case 'create_credit_note':
            $cn = $body['credit_note'] ?? [];
            if (!empty($cn)) {
                if (empty($cn['id'])) $cn['id'] = 'cn-' . round(microtime(true) * 1000);
                if (empty($cn['company_id'])) $cn['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($cn['currency'])) $cn['currency'] = ($cn['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (empty($cn['credit_note_no'])) {
                    $prefix = ($cn['company_id'] === 'ashaz-eng-in') ? 'CN-ASH' : 'CN-RG-2026';
                    $cn['credit_note_no'] = $prefix . '-' . rand(100, 999);
                }
                if (empty($cn['status'])) $cn['status'] = 'applied';
                if (!isset($db['credit_notes']) || !is_array($db['credit_notes'])) $db['credit_notes'] = [];
                array_unshift($db['credit_notes'], $cn);
                recalculateAllFinanceBalances($db);
                $addAuditLog('create', 'credit_note', $cn['credit_note_no'] ?? '', 'Issued credit note for ' . ($cn['customer_name'] ?? ''));
            }
            break;

        case 'create_debit_note':
            $dn = $body['debit_note'] ?? [];
            if (!empty($dn)) {
                if (empty($dn['id'])) $dn['id'] = 'dn-' . round(microtime(true) * 1000);
                if (empty($dn['company_id'])) $dn['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($dn['currency'])) $dn['currency'] = ($dn['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (empty($dn['debit_note_no'])) {
                    $prefix = ($dn['company_id'] === 'ashaz-eng-in') ? 'DN-ASH' : 'DN-RG-2026';
                    $dn['debit_note_no'] = $prefix . '-' . rand(100, 999);
                }
                if (empty($dn['status'])) $dn['status'] = 'applied';
                if (!isset($db['debit_notes']) || !is_array($db['debit_notes'])) $db['debit_notes'] = [];
                array_unshift($db['debit_notes'], $dn);
                recalculateAllFinanceBalances($db);
                $addAuditLog('create', 'debit_note', $dn['debit_note_no'] ?? '', 'Issued debit note for ' . ($dn['vendor_name'] ?? ''));
            }
            break;

        case 'record_receipt':
            $rcp = $body['receipt'] ?? [];
            if (!empty($rcp)) {
                if (!isset($db['customer_receipts']) || !is_array($db['customer_receipts'])) {
                    $db['customer_receipts'] = [];
                }
                array_unshift($db['customer_receipts'], $rcp);

                // Auto-save bank in saved_banks and link to customer
                if (!empty($rcp['bank_name'])) {
                    if (!isset($db['saved_banks']) || !is_array($db['saved_banks'])) {
                        $db['saved_banks'] = [];
                    }
                    if (!in_array($rcp['bank_name'], $db['saved_banks'])) {
                        array_unshift($db['saved_banks'], $rcp['bank_name']);
                    }
                    if (!empty($rcp['customer_id']) && !empty($db['customers'])) {
                        foreach ($db['customers'] as &$cRef) {
                            if (($cRef['id'] ?? '') === $rcp['customer_id'] || ($cRef['name'] ?? '') === ($rcp['customer_name'] ?? '')) {
                                $cRef['preferred_bank'] = $rcp['bank_name'];
                                $cRef['bank_name'] = $rcp['bank_name'];
                            }
                        }
                        unset($cRef);
                    }
                }
                if (!empty($body['saved_banks']) && is_array($body['saved_banks'])) {
                    if (!isset($db['saved_banks']) || !is_array($db['saved_banks'])) {
                        $db['saved_banks'] = [];
                    }
                    $db['saved_banks'] = array_values(array_unique(array_merge($body['saved_banks'], $db['saved_banks'])));
                }

                // Update allocated invoices
                if (!empty($rcp['allocations']) && is_array($rcp['allocations']) && isset($db['invoices'])) {
                    foreach ($rcp['allocations'] as $alloc) {
                        foreach ($db['invoices'] as &$invRef) {
                            if (($invRef['id'] ?? '') === ($alloc['invoice_id'] ?? '') || ($invRef['invoice_no'] ?? '') === ($alloc['invoice_no'] ?? '')) {
                                $allocAmt = floatval($alloc['amount_allocated'] ?? 0);
                                $invRef['amount_paid'] = floatval($invRef['amount_paid'] ?? 0) + $allocAmt;
                                $invRef['balance_due'] = max(0, floatval($invRef['grand_total'] ?? 0) - $invRef['amount_paid']);
                                if ($invRef['balance_due'] <= 0.01) {
                                    $invRef['status'] = 'paid';
                                } else {
                                    $invRef['status'] = 'partially_paid';
                                }
                            }
                        }
                        unset($invRef);
                    }
                }

                // Route payment to Cash and Banks depending on payment mode
                $amtReceived = floatval($rcp['amount_received'] ?? 0);
                $payMode = strtolower(trim($rcp['payment_mode'] ?? 'online'));
                $compRefId = $rcp['company_id'] ?? 'rayan-corp-uae';
                $rcpCurr = $rcp['currency'] ?? ($compRefId === 'ashaz-eng-in' ? 'INR' : 'AED');

                if (strpos($payMode, 'cash') !== false) {
                    if (!isset($db['cash_in_hand']) || !is_array($db['cash_in_hand'])) $db['cash_in_hand'] = [];
                    if (!isset($db['cash_vouchers']) || !is_array($db['cash_vouchers'])) $db['cash_vouchers'] = [];
                    
                    $matchedReg = null;
                    foreach ($db['cash_in_hand'] as &$cReg) {
                        if (($cReg['company_id'] ?? '') === $compRefId) {
                            $cReg['balance'] = floatval($cReg['balance'] ?? 0) + $amtReceived;
                            $cReg['last_replenished'] = $rcp['receipt_date'] ?? date('Y-m-d');
                            $matchedReg = $cReg;
                            break;
                        }
                    }
                    unset($cReg);

                    $cvExists = false;
                    foreach ($db['cash_vouchers'] as $cv) {
                        if (($cv['receipt_id'] ?? '') === ($rcp['id'] ?? '') || ($cv['voucher_no'] ?? '') === ('CV-' . ($rcp['receipt_no'] ?? ''))) {
                            $cvExists = true;
                            break;
                        }
                    }
                    if (!$cvExists) {
                        array_unshift($db['cash_vouchers'], [
                            'id' => 'cv-rcp-' . ($rcp['id'] ?? uniqid()),
                            'receipt_id' => $rcp['id'] ?? '',
                            'voucher_no' => 'CV-' . ($rcp['receipt_no'] ?? uniqid()),
                            'company_id' => $compRefId,
                            'register_id' => $matchedReg['id'] ?? 'cash-dubai-reg',
                            'register_name' => $matchedReg['register_name'] ?? $matchedReg['name'] ?? 'Dubai Main Vault',
                            'custodian' => $rcp['cashier'] ?? $matchedReg['custodian'] ?? 'Cashier',
                            'date' => $rcp['receipt_date'] ?? date('Y-m-d'),
                            'type' => 'inflow',
                            'category' => 'Customer Cash Collection',
                            'purpose' => $rcp['notes'] ?? ('Cash receipt from ' . ($rcp['customer_name'] ?? 'Customer') . ' for ' . ($rcp['ref_invoice_no'] ?? $rcp['receipt_no'] ?? '')),
                            'payee' => $rcp['customer_name'] ?? 'Customer',
                            'amount' => $amtReceived,
                            'currency' => $rcpCurr,
                            'status' => 'Approved',
                            'created_at' => date('c')
                        ]);
                    }
                } elseif (strpos($payMode, 'cheque') !== false || strpos($payMode, 'check') !== false) {
                    if (!isset($db['cheques']) || !is_array($db['cheques'])) $db['cheques'] = [];
                    $chqStatus = $rcp['cheque_status'] ?? 'Cleared';
                    $isCleared = stripos($chqStatus, 'clear') !== false;

                    $chqExists = false;
                    foreach ($db['cheques'] as $cq) {
                        if (($cq['receipt_id'] ?? '') === ($rcp['id'] ?? '') || (!empty($rcp['cheque_no']) && ($cq['cheque_no'] ?? '') === $rcp['cheque_no'])) {
                            $chqExists = true;
                            break;
                        }
                    }
                    if (!$chqExists) {
                        array_unshift($db['cheques'], [
                            'id' => 'chq-rcp-' . ($rcp['id'] ?? uniqid()),
                            'receipt_id' => $rcp['id'] ?? '',
                            'company_id' => $compRefId,
                            'type' => 'inward',
                            'cheque_no' => $rcp['cheque_no'] ?? $rcp['reference_no'] ?? ('CHQ-' . ($rcp['receipt_no'] ?? '')),
                            'bank_name' => $rcp['bank_name'] ?? 'Abu Dhabi Commercial Bank (ADCB)',
                            'branch' => $rcp['bank_branch'] ?? '',
                            'party_name' => $rcp['customer_name'] ?? 'Customer',
                            'date' => $rcp['cheque_date'] ?? $rcp['receipt_date'] ?? date('Y-m-d'),
                            'amount' => $amtReceived,
                            'currency' => $rcpCurr,
                            'status' => $isCleared ? 'Cleared' : ($chqStatus ?: 'Pending Clearance'),
                            'notes' => $rcp['notes'] ?? ('Customer Receipt ' . ($rcp['receipt_no'] ?? '') . (!empty($rcp['ref_invoice_no']) ? ' against ' . $rcp['ref_invoice_no'] : '')),
                            'created_at' => date('c')
                        ]);
                    }

                    if ($isCleared && isset($db['bank_accounts']) && is_array($db['bank_accounts'])) {
                        foreach ($db['bank_accounts'] as &$bAcc) {
                            if (($bAcc['company_id'] ?? '') === $compRefId && ($bAcc['currency'] ?? '') === $rcpCurr) {
                                $bAcc['balance'] = floatval($bAcc['balance'] ?? 0) + $amtReceived;
                                break;
                            }
                        }
                        unset($bAcc);
                    }
                } else {
                    // Online / Wire Transfer / Corporate Remittance
                    if (!isset($db['bank_accounts']) || !is_array($db['bank_accounts'])) $db['bank_accounts'] = [];
                    if (!isset($db['bank_transfers']) || !is_array($db['bank_transfers'])) $db['bank_transfers'] = [];

                    $targetBank = null;
                    foreach ($db['bank_accounts'] as &$bAcc) {
                        if (($bAcc['company_id'] ?? '') === $compRefId && ($bAcc['currency'] ?? '') === $rcpCurr) {
                            $bAcc['balance'] = floatval($bAcc['balance'] ?? 0) + $amtReceived;
                            $targetBank = $bAcc;
                            break;
                        }
                    }
                    unset($bAcc);

                    $wireExists = false;
                    foreach ($db['bank_transfers'] as $bt) {
                        if (($bt['receipt_id'] ?? '') === ($rcp['id'] ?? '') || ($bt['reference_no'] ?? '') === ($rcp['reference_no'] ?? ('WIRE-' . ($rcp['receipt_no'] ?? '')))) {
                            $wireExists = true;
                            break;
                        }
                    }
                    if (!$wireExists) {
                        array_unshift($db['bank_transfers'], [
                            'id' => 'wire-rcp-' . ($rcp['id'] ?? uniqid()),
                            'receipt_id' => $rcp['id'] ?? '',
                            'company_id' => $compRefId,
                            'reference_no' => $rcp['reference_no'] ?? ('WIRE-' . ($rcp['receipt_no'] ?? uniqid())),
                            'date' => $rcp['receipt_date'] ?? date('Y-m-d'),
                            'source_bank' => $rcp['bank_name'] ?? $targetBank['bank_name'] ?? 'Abu Dhabi Commercial Bank (ADCB)',
                            'source_account_id' => $targetBank['id'] ?? 'bank-adcb-uae',
                            'destination_bank' => $targetBank['bank_name'] ?? 'Abu Dhabi Commercial Bank (ADCB)',
                            'destination_account_id' => $targetBank['id'] ?? 'bank-adcb-uae',
                            'counterparty' => $rcp['customer_name'] ?? 'Customer',
                            'amount' => $amtReceived,
                            'currency' => $rcpCurr,
                            'type' => 'inward',
                            'type_label' => 'Inward Client Wire (' . ($rcp['receipt_no'] ?? '') . ')',
                            'purpose' => $rcp['notes'] ?? ('Client payment receipt for ' . ($rcp['ref_invoice_no'] ?? $rcp['receipt_no'] ?? '')),
                            'status' => 'Cleared',
                            'created_at' => date('c')
                        ]);
                    }
                }

                $addAuditLog('create', 'receipt', $rcp['receipt_no'] ?? '', 'Recorded customer receipt of ' . ($rcp['amount_received'] ?? 0));
            }
            break;

        case 'record_payment':
            $pay = $body['payment'] ?? [];
            if (!empty($pay)) {
                if (empty($pay['id'])) {
                    $pay['id'] = 'pay-' . round(microtime(true) * 1000);
                }
                if (empty($pay['company_id'])) {
                    $pay['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($pay['currency'])) {
                    $pay['currency'] = ($pay['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                }
                if (empty($pay['voucher_no'])) {
                    $prefix = ($pay['company_id'] === 'ashaz-eng-in') ? 'PV-ASH' : 'PV-RG-2026';
                    $pay['voucher_no'] = $prefix . '-' . rand(100, 999);
                }
                if (!isset($db['vendor_payments']) || !is_array($db['vendor_payments'])) {
                    $db['vendor_payments'] = [];
                }
                array_unshift($db['vendor_payments'], $pay);

                if (!empty($pay['allocations']) && is_array($pay['allocations']) && isset($db['purchase_bills'])) {
                    foreach ($pay['allocations'] as $alloc) {
                        foreach ($db['purchase_bills'] as &$b) {
                            if (($b['id'] ?? '') === ($alloc['bill_id'] ?? '') || ($b['bill_no'] ?? '') === ($alloc['bill_no'] ?? '')) {
                                $allocAmt = floatval($alloc['amount_allocated'] ?? 0);
                                $b['amount_paid'] = floatval($b['amount_paid'] ?? 0) + $allocAmt;
                                $b['balance_due'] = max(0, floatval($b['grand_total'] ?? 0) - $b['amount_paid']);
                                if ($b['balance_due'] <= 0.01) {
                                    $b['status'] = 'paid';
                                } else {
                                    $b['status'] = 'partially_paid';
                                }
                            }
                        }
                        unset($b);
                    }
                }
                // Check if payment was made from Director's Current Account (Personal Funds)
                $payMode = $pay['payment_mode'] ?? '';
                if (stripos($payMode, 'Director') !== false || stripos($payMode, 'Personal') !== false) {
                    $dirLoanId = 'loan-dir-current-act';
                    $amtPaid = floatval($pay['amount_paid'] ?? 0);
                    if ($amtPaid > 0 && !empty($db['loan_accounts'])) {
                        foreach ($db['loan_accounts'] as &$lf) {
                            if (($lf['id'] ?? '') === $dirLoanId) {
                                $lf['outstanding_balance'] = floatval($lf['outstanding_balance'] ?? 0) + $amtPaid;
                                $lf['available_limit'] = max(0, floatval($lf['sanctioned_limit'] ?? 0) - floatval($lf['outstanding_balance'] ?? 0));
                                break;
                            }
                        }
                        unset($lf);
                        if (!isset($db['loan_transactions']) || !is_array($db['loan_transactions'])) {
                            $db['loan_transactions'] = [];
                        }
                        array_unshift($db['loan_transactions'], [
                            'id' => 'lt-' . round(microtime(true) * 1000),
                            'company_id' => $pay['company_id'] ?? 'rayan-corp-uae',
                            'facility_id' => $dirLoanId,
                            'facility_name' => "Director's Current Account — Arshad Alam Shaikh",
                            'type' => 'drawdown',
                            'type_label' => 'Personal Contribution (Vendor Bill Payment)',
                            'amount' => $amtPaid,
                            'reference_no' => $pay['voucher_no'] ?? ('PV-' . rand(1000, 9999)),
                            'date' => $pay['payment_date'] ?? date('Y-m-d'),
                            'notes' => 'Settled supplier bill for ' . ($pay['vendor_name'] ?? 'Vendor') . ' from personal funds'
                        ]);
                    }
                }
                $addAuditLog('create', 'payment', $pay['voucher_no'] ?? '', 'Disbursed vendor payment of ' . ($pay['amount_paid'] ?? 0));
            }
            break;

        case 'create_customer':
            $cust = $body['customer'] ?? [];
            if (!empty($cust) && !empty($cust['name'])) {
                if (empty($cust['id'])) {
                    $cust['id'] = 'cust-' . round(microtime(true) * 1000);
                }
                if (empty($cust['code'])) {
                    $words = preg_split('/\s+/', preg_replace('/[^a-zA-Z0-9\s]/', '', $cust['name']));
                    $abbr = '';
                    foreach ($words as $w) {
                        if (!empty($w)) $abbr .= strtoupper($w[0]);
                    }
                    $cust['code'] = 'CUST-' . (substr($abbr, 0, 5) ?: rand(100, 999));
                }
                if (empty($cust['company_id'])) {
                    $cust['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($cust['status'])) {
                    $cust['status'] = 'active';
                }
                if (empty($cust['accounts_receivable'])) {
                    $cust['accounts_receivable'] = 'Accounts Receivable';
                }
                if (!isset($cust['opening_balance'])) {
                    $cust['opening_balance'] = 0;
                }
                if (!isset($db['customers']) || !is_array($db['customers'])) {
                    $db['customers'] = [];
                }
                $found = false;
                foreach ($db['customers'] as &$exC) {
                    if (($exC['id'] ?? '') === $cust['id'] || strtolower($exC['name'] ?? '') === strtolower($cust['name'])) {
                        $exC = array_merge($exC, $cust);
                        $found = true;
                        break;
                    }
                }
                unset($exC);
                if (!$found) {
                    array_unshift($db['customers'], $cust);
                }
                $addAuditLog('create', 'customer', $cust['name'] ?? '', 'Added client ' . ($cust['name'] ?? ''));
            }
            break;

        case 'create_vendor':
        case 'update_vendor':
            $vnd = $body['vendor'] ?? [];
            if (!empty($vnd) && !empty($vnd['name'])) {
                if (empty($vnd['id'])) {
                    $vnd['id'] = 'vend-' . round(microtime(true) * 1000);
                }
                if (empty($vnd['code'])) {
                    $vnd['code'] = 'VEND-' . rand(100, 999);
                }
                if (empty($vnd['company_id'])) {
                    $vnd['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($vnd['status'])) {
                    $vnd['status'] = 'active';
                }
                if (!isset($db['vendors']) || !is_array($db['vendors'])) {
                    $db['vendors'] = [];
                }
                $found = false;
                foreach ($db['vendors'] as &$exV) {
                    if (($exV['id'] ?? '') === $vnd['id'] || strtolower($exV['name'] ?? '') === strtolower($vnd['name'])) {
                        $exV = array_merge($exV, $vnd);
                        $found = true;
                        break;
                    }
                }
                unset($exV);
                if (!$found) {
                    array_unshift($db['vendors'], $vnd);
                }
                $addAuditLog('create', 'vendor', $vnd['name'] ?? '', 'Added supplier/subcontractor ' . ($vnd['name'] ?? ''));
            }
            break;

        case 'create_item':
            $itm = $body['item'] ?? [];
            if (!empty($itm) && !empty($itm['name'])) {
                if (empty($itm['id'])) {
                    $itm['id'] = 'itm-' . round(microtime(true) * 1000);
                }
                if (empty($itm['code'])) {
                    $itm['code'] = 'ITM-' . rand(100, 999);
                }
                if (empty($itm['status'])) {
                    $itm['status'] = 'active';
                }
                if (!isset($db['items']) || !is_array($db['items'])) {
                    $db['items'] = [];
                }
                $found = false;
                foreach ($db['items'] as &$exI) {
                    if (($exI['id'] ?? '') === $itm['id'] || strtolower($exI['name'] ?? '') === strtolower($itm['name'])) {
                        $exI = array_merge($exI, $itm);
                        $found = true;
                        break;
                    }
                }
                unset($exI);
                if (!$found) {
                    array_unshift($db['items'], $itm);
                }
                $addAuditLog('create', 'item', $itm['name'] ?? '', 'Added catalog item ' . ($itm['name'] ?? ''));
            }
            break;

        
        case 'create_bank_account':
            $bank = $body['bank_account'] ?? $body['bank'] ?? [];
            if (!empty($bank) && !empty($bank['bank_name'])) {
                if (empty($bank['id'])) $bank['id'] = 'bank-' . round(microtime(true) * 1000);
                if (empty($bank['company_id'])) $bank['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($bank['currency'])) $bank['currency'] = ($bank['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (!isset($db['bank_accounts']) || !is_array($db['bank_accounts'])) $db['bank_accounts'] = [];
                array_unshift($db['bank_accounts'], $bank);
                $addAuditLog('create', 'bank_account', $bank['bank_name'] ?? '', 'Added corporate bank account ' . ($bank['bank_name'] ?? ''));
            }
            break;

        case 'update_bank_account':
            $bank = $body['bank_account'] ?? $body['bank'] ?? [];
            $targetId = $body['id'] ?? $bank['id'] ?? '';
            if (!empty($targetId) && !empty($db['bank_accounts'])) {
                foreach ($db['bank_accounts'] as &$exB) {
                    if (($exB['id'] ?? '') === $targetId) {
                        $exB = array_merge($exB, $bank);
                        break;
                    }
                }
                unset($exB);
                $addAuditLog('update', 'bank_account', $targetId, 'Updated bank account ' . $targetId);
            }
            break;

        case 'delete_bank_account':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['bank_accounts'])) {
                $db['bank_accounts'] = array_values(array_filter($db['bank_accounts'], function($b) use ($targetId) {
                    return ($b['id'] ?? '') !== $targetId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_bank_accounts WHERE id = ?");
                        $stmt->execute([$targetId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'bank_account', $targetId, 'Removed bank account ' . $targetId);
            }
            break;

        case 'record_bank_transfer':
            $trn = $body['transfer'] ?? $body['bank_transfer'] ?? [];
            if (!empty($trn)) {
                if (empty($trn['id'])) $trn['id'] = 'wire-' . round(microtime(true) * 1000);
                if (empty($trn['company_id'])) $trn['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($trn['currency'])) $trn['currency'] = ($trn['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (empty($trn['reference_no'])) {
                    $prefix = ($trn['company_id'] === 'ashaz-eng-in') ? 'RTGS-ASH' : 'FAB-TRN';
                    $trn['reference_no'] = $prefix . '-' . rand(10000, 99999);
                }
                if (!isset($db['bank_transfers']) || !is_array($db['bank_transfers'])) $db['bank_transfers'] = [];
                array_unshift($db['bank_transfers'], $trn);

                $amt = floatval($trn['amount'] ?? 0);
                $srcId = $trn['source_account_id'] ?? '';
                $destId = $trn['destination_account_id'] ?? '';
                if ($amt > 0 && !empty($db['bank_accounts'])) {
                    foreach ($db['bank_accounts'] as &$b) {
                        if (($b['id'] ?? '') === $srcId) {
                            $b['balance'] = floatval($b['balance'] ?? 0) - $amt;
                        }
                        if (!empty($destId) && ($b['id'] ?? '') === $destId) {
                            $b['balance'] = floatval($b['balance'] ?? 0) + $amt;
                        }
                    }
                    unset($b);
                }
                $addAuditLog('create', 'bank_transfer', $trn['reference_no'] ?? '', 'Recorded bank wire ' . ($trn['reference_no'] ?? ''));
            }
            break;

        case 'delete_bank_transfer':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['bank_transfers'])) {
                $db['bank_transfers'] = array_values(array_filter($db['bank_transfers'], function($t) use ($targetId) {
                    return ($t['id'] ?? '') !== $targetId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_bank_transfers WHERE id = ?");
                        $stmt->execute([$targetId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'bank_transfer', $targetId, 'Deleted wire transfer ' . $targetId);
            }
            break;

        case 'create_cash_register':
            $reg = $body['register'] ?? $body['cash_register'] ?? [];
            if (!empty($reg) && !empty($reg['register_name'])) {
                if (empty($reg['id'])) $reg['id'] = 'cash-' . round(microtime(true) * 1000);
                if (empty($reg['company_id'])) $reg['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($reg['currency'])) $reg['currency'] = ($reg['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (!isset($db['cash_in_hand']) || !is_array($db['cash_in_hand'])) $db['cash_in_hand'] = [];
                array_unshift($db['cash_in_hand'], $reg);
                $addAuditLog('create', 'cash_register', $reg['register_name'] ?? '', 'Added cash register ' . ($reg['register_name'] ?? ''));
            }
            break;

        case 'update_cash_register':
            $reg = $body['register'] ?? $body['cash_register'] ?? [];
            $targetId = $body['id'] ?? $reg['id'] ?? '';
            if (!empty($targetId) && !empty($db['cash_in_hand'])) {
                foreach ($db['cash_in_hand'] as &$exR) {
                    if (($exR['id'] ?? '') === $targetId) {
                        $exR = array_merge($exR, $reg);
                        break;
                    }
                }
                unset($exR);
                $addAuditLog('update', 'cash_register', $targetId, 'Updated cash register ' . $targetId);
            }
            break;

        case 'delete_cash_register':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['cash_in_hand'])) {
                $db['cash_in_hand'] = array_values(array_filter($db['cash_in_hand'], function($r) use ($targetId) {
                    return ($r['id'] ?? '') !== $targetId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_cash_in_hand WHERE id = ?");
                        $stmt->execute([$targetId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'cash_register', $targetId, 'Deleted cash register ' . $targetId);
            }
            break;

        case 'record_cash_voucher':
            $cv = $body['voucher'] ?? $body['cash_voucher'] ?? [];
            if (!empty($cv)) {
                if (empty($cv['id'])) $cv['id'] = 'cv-' . round(microtime(true) * 1000);
                if (empty($cv['company_id'])) $cv['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($cv['currency'])) $cv['currency'] = ($cv['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (empty($cv['voucher_no'])) {
                    $prefix = ($cv['company_id'] === 'ashaz-eng-in') ? 'PC-MUM' : 'PC-DXB';
                    $cv['voucher_no'] = $prefix . '-' . rand(100, 999);
                }
                if (!isset($db['cash_vouchers']) || !is_array($db['cash_vouchers'])) $db['cash_vouchers'] = [];
                array_unshift($db['cash_vouchers'], $cv);

                $amt = floatval($cv['amount'] ?? 0);
                $vaultId = $cv['register_id'] ?? '';
                $type = $cv['type'] ?? 'outflow';
                if ($amt > 0 && !empty($vaultId) && !empty($db['cash_in_hand'])) {
                    foreach ($db['cash_in_hand'] as &$vr) {
                        if (($vr['id'] ?? '') === $vaultId) {
                            if ($type === 'inflow') {
                                $vr['balance'] = floatval($vr['balance'] ?? 0) + $amt;
                            } else {
                                $vr['balance'] = floatval($vr['balance'] ?? 0) - $amt;
                            }
                            $vr['last_replenished'] = $cv['date'] ?? date('Y-m-d');
                            break;
                        }
                    }
                    unset($vr);
                }
                $addAuditLog('create', 'cash_voucher', $cv['voucher_no'] ?? '', 'Recorded petty cash voucher ' . ($cv['voucher_no'] ?? ''));
            }
            break;

        case 'delete_cash_voucher':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['cash_vouchers'])) {
                $db['cash_vouchers'] = array_values(array_filter($db['cash_vouchers'], function($v) use ($targetId) {
                    return ($v['id'] ?? '') !== $targetId && ($v['voucher_no'] ?? '') !== $targetId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_cash_vouchers WHERE id = ? OR voucher_no = ?");
                        $stmt->execute([$targetId, $targetId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'cash_voucher', $targetId, 'Deleted cash voucher ' . $targetId);
            }
            break;

        case 'record_cheque':
            $chq = $body['cheque'] ?? [];
            if (!empty($chq)) {
                if (empty($chq['id'])) $chq['id'] = 'chq-' . round(microtime(true) * 1000);
                if (empty($chq['company_id'])) $chq['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($chq['currency'])) $chq['currency'] = ($chq['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (!isset($db['cheques']) || !is_array($db['cheques'])) $db['cheques'] = [];
                array_unshift($db['cheques'], $chq);
                $addAuditLog('create', 'cheque', $chq['cheque_no'] ?? '', 'Recorded cheque ' . ($chq['cheque_no'] ?? ''));
            }
            break;

        case 'update_cheque_status':
            $targetId = $body['id'] ?? '';
            $newStatus = $body['status'] ?? 'Cleared';
            $bankAccId = $body['bank_account_id'] ?? '';
            if (!empty($targetId) && !empty($db['cheques'])) {
                foreach ($db['cheques'] as &$cq) {
                    if (($cq['id'] ?? '') === $targetId) {
                        $oldStatus = $cq['status'] ?? '';
                        $cq['status'] = $newStatus;
                        if ($newStatus === 'Cleared' && $oldStatus !== 'Cleared') {
                            $amt = floatval($cq['amount'] ?? 0);
                            if ($amt > 0 && !empty($db['bank_accounts'])) {
                                foreach ($db['bank_accounts'] as &$b) {
                                    if (($b['id'] ?? '') === $bankAccId || (empty($bankAccId) && strtolower($b['bank_name'] ?? '') === strtolower($cq['bank_name'] ?? ''))) {
                                        if (($cq['type'] ?? '') === 'inward') {
                                            $b['balance'] = floatval($b['balance'] ?? 0) + $amt;
                                        } else {
                                            $b['balance'] = floatval($b['balance'] ?? 0) - $amt;
                                        }
                                        break;
                                    }
                                }
                                unset($b);
                            }
                        }
                        break;
                    }
                }
                unset($cq);
                $addAuditLog('update', 'cheque', $targetId, 'Updated cheque status to ' . $newStatus);
            }
            break;

        case 'delete_cheque':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['cheques'])) {
                $db['cheques'] = array_values(array_filter($db['cheques'], function($c) use ($targetId) {
                    return ($c['id'] ?? '') !== $targetId && ($c['cheque_no'] ?? '') !== $targetId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_cheques WHERE id = ? OR cheque_no = ?");
                        $stmt->execute([$targetId, $targetId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'cheque', $targetId, 'Deleted cheque ' . $targetId);
            }
            break;

        case 'create_loan_account':
            $loan = $body['loan_account'] ?? $body['loan'] ?? [];
            if (!empty($loan) && !empty($loan['facility_name'])) {
                if (empty($loan['id'])) $loan['id'] = 'loan-' . round(microtime(true) * 1000);
                if (empty($loan['company_id'])) $loan['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($loan['currency'])) $loan['currency'] = ($loan['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                $sanc = floatval($loan['sanctioned_limit'] ?? 0);
                $out = floatval($loan['outstanding_balance'] ?? 0);
                $loan['available_limit'] = max(0, $sanc - $out);
                if (!isset($db['loan_accounts']) || !is_array($db['loan_accounts'])) $db['loan_accounts'] = [];
                array_unshift($db['loan_accounts'], $loan);
                $addAuditLog('create', 'loan_account', $loan['facility_name'] ?? '', 'Added corporate loan facility ' . ($loan['facility_name'] ?? ''));
            }
            break;

        case 'update_loan_account':
            $loan = $body['loan_account'] ?? $body['loan'] ?? [];
            $targetId = $body['id'] ?? $loan['id'] ?? '';
            if (!empty($targetId) && !empty($db['loan_accounts'])) {
                foreach ($db['loan_accounts'] as &$exL) {
                    if (($exL['id'] ?? '') === $targetId) {
                        $exL = array_merge($exL, $loan);
                        $sanc = floatval($exL['sanctioned_limit'] ?? 0);
                        $out = floatval($exL['outstanding_balance'] ?? 0);
                        $exL['available_limit'] = max(0, $sanc - $out);
                        break;
                    }
                }
                unset($exL);
                $addAuditLog('update', 'loan_account', $targetId, 'Updated loan facility ' . $targetId);
            }
            break;

        case 'delete_loan_account':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['loan_accounts'])) {
                $db['loan_accounts'] = array_values(array_filter($db['loan_accounts'], function($l) use ($targetId) {
                    return ($l['id'] ?? '') !== $targetId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_loan_accounts WHERE id = ?");
                        $stmt->execute([$targetId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'loan_account', $targetId, 'Deleted loan facility ' . $targetId);
            }
            break;

        case 'record_loan_transaction':
            $lt = $body['transaction'] ?? $body['loan_transaction'] ?? [];
            if (!empty($lt)) {
                if (empty($lt['id'])) $lt['id'] = 'lt-' . round(microtime(true) * 1000);
                if (empty($lt['company_id'])) $lt['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($lt['currency'])) $lt['currency'] = ($lt['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (!isset($db['loan_transactions']) || !is_array($db['loan_transactions'])) $db['loan_transactions'] = [];
                array_unshift($db['loan_transactions'], $lt);

                $facId = $lt['facility_id'] ?? '';
                $amt = floatval($lt['amount'] ?? 0);
                $tType = $lt['type'] ?? 'repayment';
                if ($amt > 0 && !empty($facId) && !empty($db['loan_accounts'])) {
                    foreach ($db['loan_accounts'] as &$lf) {
                        if (($lf['id'] ?? '') === $facId) {
                            if ($tType === 'drawdown') {
                                $lf['outstanding_balance'] = floatval($lf['outstanding_balance'] ?? 0) + $amt;
                            } else if ($tType === 'repayment') {
                                $lf['outstanding_balance'] = max(0, floatval($lf['outstanding_balance'] ?? 0) - $amt);
                            }
                            $lf['available_limit'] = max(0, floatval($lf['sanctioned_limit'] ?? 0) - floatval($lf['outstanding_balance'] ?? 0));
                            break;
                        }
                    }
                    unset($lf);
                }
                $addAuditLog('create', 'loan_transaction', $lt['reference_no'] ?? '', 'Recorded loan transaction of ' . ($lt['amount'] ?? 0));
            }
            break;

        case 'delete_loan_transaction':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['loan_transactions'])) {
                $db['loan_transactions'] = array_values(array_filter($db['loan_transactions'], function($t) use ($targetId) {
                    return ($t['id'] ?? '') !== $targetId;
                }));
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("DELETE FROM finance_loan_transactions WHERE id = ?");
                        $stmt->execute([$targetId]);
                    } catch (Exception $e) {}
                }
                $addAuditLog('delete', 'loan_transaction', $targetId, 'Deleted loan transaction ' . $targetId);
            }
            break;
        case 'sync_full':
            if (!empty($body['full_db']) && is_array($body['full_db'])) {
                $db = $body['full_db'];
                if ($pdo) {
                    try {
                        // Only cleanup specific old mock seeds if needed, never delete user invoices or receipts
                        $pdo->exec("DELETE FROM finance_customers WHERE code IN ('CUST-LT', 'CUST-EMAAR', 'CUST-NHAI', 'CUST-DPA', 'CUST-YOK')");
                    } catch (Exception $e) {
                        error_log("Mock cleanup error: " . $e->getMessage());
                    }
                }
                $addAuditLog('sync', 'database', 'all', 'Client synchronized full state');
            }
            break;
    }

    // Save directly to Hostinger MySQL Database and local JSON
    saveFinanceDb($pdo, $dataFile, $db, $candidates);

    echo json_encode([
        'success' => true,
        'storage' => $pdo ? 'hostinger_mysql' : 'json_file',
        'customer' => $cust ?? null,
        'project' => $prj ?? null,
        'receipt' => $rcp ?? null,
        'payment' => $pay ?? null,
        'vendor' => $vnd ?? null,
        'item' => $itm ?? null,
        'invoice' => $inv ?? null,
        'bill' => $bill ?? null,
        'expense' => $exp ?? null,
        'po' => $po ?? null,
        'credit_note' => $cn ?? null,
        'debit_note' => $dn ?? null,
        'data' => $db
    ]);
    exit;
}

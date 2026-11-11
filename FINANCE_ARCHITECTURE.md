# Rayan Group - Finance & Accounts Fast Architecture Guide

> **Purpose:** This document outlines the streamlined architecture, developer tools, and workflow for Rayan Group's financial portal (`/billing/`). It eliminates the 1–2 hour friction cycle by providing automated tooling, direct inspection, and 1-command deployment.

---

## 1. Fast CLI Developer Tools

You can now inspect, update, verify, and sync finance data in **seconds** without writing temporary scratch scripts.

| Task | Command | Description |
| :--- | :--- | :--- |
| **Inspect any entity** | `npm run fin inspect <query>` | Search invoices, receipts, bills, and projects matching number, name, or customer. |
| **Inspect Project Card** | `npm run fin project <code_or_id>` | Computes and displays the exact Project Card metrics (Collections, Due, Profit, Cash Flow). |
| **Mark Invoice Paid** | `npm run fin set-invoice <inv_no> --paid` | Sets invoice to `paid`, balance due to `0.00`, and updates all local database mirrors. |
| **Set Invoice Balances** | `npm run fin set-invoice <inv_no> --amount-paid <amt>` | Updates paid amount and recalculates balance due automatically. |
| **Mark Bill Paid** | `npm run fin set-bill <bill_no> --paid` | Sets purchase bill to `paid`, balance due to `0.00`. |
| **Health Check & Verify** | `npm run fin:verify` | Audits all project ledgers and invoice balances against contracts and receipts. |
| **Push to Live MySQL** | `npm run fin:sync` | Directly synchronizes local database to Hostinger MySQL via `api/finance.php?action=sync_full`. |
| **Build & Deploy Everything**| `npm run deploy` | **1-command pipeline**: auto-bumps version, builds Vite, pushes Git, triggers webhook, syncs web root, syncs MySQL, and purges CDN cache. |

---

## 2. The 3 Data Layers & How They Sync

```
[ Developer / Admin UI ]
           │
           ▼
[ data/finance-data.json ] ───(npm run deploy / npm run fin:sync)───► [ Hostinger MySQL ]
           │                                                                    │
     (vite build)                                                      (api/finance.php)
           ▼                                                                    │
[ public/data/ & dist/data/ ] ─────────────────────────────────────────────────►│
                                                                                ▼
                                                                 [ Browser LocalStorage ]
                                                             (Auto-busted via CURRENT_DB_VERSION)
```

1. **Local Master Data (`data/finance-data.json`):**
   - Authoritative local JSON file.
   - Synchronized across `public/data/finance-data.json` and `dist/data/finance-data.json` automatically on build/deploy.
2. **Server Relational Database (`public/api/finance.php` + Hostinger MySQL):**
   - Tables: `finance_invoices`, `finance_receipts`, `finance_purchase_bills`, `finance_vendor_payments`, `finance_projects`, `finance_customers`, `finance_state`.
   - `deploy.js` automatically issues `action=sync_full` on every deployment.
3. **Browser Client Cache (`src/scripts/finance.js`):**
   - Key: `rayan_fin_db_version`.
   - **Auto-busted on every deploy**: `deploy.js` automatically increments `CURRENT_DB_VERSION` (e.g. `v86` $\to$ `v87`), ensuring clients never get stuck on stale localStorage data.

---

## 3. Project Financial Math Rules

All projects in Rayan Group follow unified financial rules:

- **Effective Revenue:** If a project is closed or contracted, `contract_value` is the authoritative project revenue.
- **Customer Collections:** Exact sum of all customer receipts allocated to project invoices.
- **Pending Client Due:** `contract_value - Customer Collections` (synchronized with the open balance of progressive project invoices).
- **Total Costs & Expenses:** `Purchase Bills + Site Petty Cash Expenses + Direct Payroll Salaries`.
- **Net Profit:** `Effective Revenue - Total Costs & Expenses`.
- **Net Profit Margin %:** `(Net Profit / Effective Revenue) * 100%`.
- **Cash Flow Position:** `Customer Collections - Paid Project Bills & Expenses`.

---

## 4. Quick Troubleshooting Guide

- **An invoice shows unpaid on the website:**
  1. Run `npm run fin inspect <invoice_no>` to see its stored status, payments, and receipt allocations.
  2. If paid, run `npm run fin set-invoice <invoice_no> --paid`.
  3. Run `npm run deploy` to push the update live to MySQL and flush client caches.
- **A project financial card is off by a few fils:**
  1. Run `npm run fin project <project_code>` to see the exact breakdown.
  2. Check receipt allocations with `npm run fin inspect <project_code>`.
  3. Fix the specific invoice or receipt and run `npm run deploy`.

const fs = require('fs');
const path = require('path');
const https = require('https');

https.get('https://rayan-group.com/api/finance.php', (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const apiData = JSON.parse(body).data;
    console.log('API employees count:', apiData.employees.length);
    apiData.employees.forEach(e => console.log('  API emp:', e.id, e.employee_no, e.name));

    const financeJs = fs.readFileSync('src/scripts/finance.js', 'utf8');
    const defaultSeedData = require(path.resolve('data/finance-data.json'));

    const app = {
      db: JSON.parse(JSON.stringify(defaultSeedData)),
      activeCompanyId: 'rayan-corp-uae',
      isUaeEntity(id) {
        return id === 'rayan-corp-uae' || id === 'rayan-group' || id === 'rayan-properties-uae';
      },
      matchesActiveCompany(itemCompanyId) {
        if (this.activeCompanyId === 'rayan-group') return this.isUaeEntity(itemCompanyId);
        if (this.activeCompanyId === 'rayan-corp-uae') return (itemCompanyId === 'rayan-corp-uae' || itemCompanyId === 'rayan-group' || !itemCompanyId);
        return itemCompanyId === this.activeCompanyId;
      }
    };

    const s = financeJs.indexOf('mergeWithSeedData(sourceData) {');
    const e = financeJs.indexOf('\n  sanitizeInvoices()', s);
    const bodyStr = financeJs.substring(s + 31, e).trim();
    // remove trailing }
    const cleanBody = bodyStr.replace(/}\s*$/, '');
    const mergeFn = new Function('defaultSeedData', 'sourceData', cleanBody);

    const merged = mergeFn(defaultSeedData, apiData);
    console.log('\n--- After mergeWithSeedData ---');
    console.log('Merged employees count:', merged.employees?.length);
    (merged.employees || []).forEach(e => console.log('  Merged emp:', e.id, e.employee_no, e.name));

    const payrollJs = fs.readFileSync('src/scripts/finance-payroll.js', 'utf8');
    const seedStart = payrollJs.indexOf('proto.ensurePayrollSeedData = function () {');
    const seedEnd = payrollJs.indexOf('\n  // ==========================================================================\n  // 2. EMPLOYEE & WORKER PROFILES TAB', seedStart);
    const ensureBody = payrollJs.substring(seedStart + 43, seedEnd).trim().replace(/};\s*$/, '');
    const ensureFn = new Function(ensureBody);

    app.db = merged;
    ensureFn.call(app);

    console.log('\n--- After ensurePayrollSeedData ---');
    console.log('Final employees count:', app.db.employees?.length);
    app.db.employees.forEach(e => console.log('  Final emp:', e.id, e.employee_no, e.name));

    const activeEmps = app.db.employees.filter(e => app.matchesActiveCompany(e.company_id));
    console.log('\n--- Active company employees for rayan-corp-uae ---');
    activeEmps.forEach(e => console.log('  Active emp:', e.id, e.employee_no, e.name));
  });
});

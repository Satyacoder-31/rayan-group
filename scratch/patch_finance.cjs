const fs = require('fs');

const jsPath = 'src/scripts/finance.js';
let js = fs.readFileSync(jsPath, 'utf8');

console.log('Original finance.js length:', js.length);

// 1. In renderProjectsTab: filter by matchesActiveCompany
const oldProjectsFilter = "const allProjects = (this.db?.projects || []).filter(p => (p.company_id || 'rayan-corp-uae') === this.activeCompanyId);";
const newProjectsFilter = "const allProjects = (this.db?.projects || []).filter(p => this.matchesActiveCompany(p.company_id));";

if (js.includes(oldProjectsFilter)) {
    js = js.replace(oldProjectsFilter, newProjectsFilter);
    console.log('Replaced oldProjectsFilter successfully');
} else {
    console.warn('Could not find oldProjectsFilter');
}

// 2. In openEditProjectModal: keep company_id safe & reset status filter to 'all' after save
const oldCompanyPayload = "company_id: prj.company_id || this.activeCompanyId || 'rayan-corp-uae',";
const newCompanyPayload = "company_id: prj.company_id || 'rayan-corp-uae',";

if (js.includes(oldCompanyPayload)) {
    js = js.replace(oldCompanyPayload, newCompanyPayload);
    console.log('Replaced oldCompanyPayload successfully');
} else {
    console.warn('Could not find oldCompanyPayload');
}

// In openEditProjectModal on submit success, ensure _prjFilter.status = 'all' so edited project is never hidden
const oldSaveSuccess = "this.closeModal('modal-edit-project');\n        this.showNotification(`Project \"${payload.project.name}\" (${payload.project.code}) updated successfully.`, 'success');";
const newSaveSuccess = "if (this._prjFilter) this._prjFilter.status = 'all';\n        this.closeModal('modal-edit-project');\n        this.showNotification(`Project \"${payload.project.name}\" (${payload.project.code}) updated successfully.`, 'success');";

if (js.includes(oldSaveSuccess)) {
    js = js.replace(oldSaveSuccess, newSaveSuccess);
    console.log('Replaced oldSaveSuccess successfully');
} else {
    console.warn('Could not find oldSaveSuccess');
}

// 3. In syncApi offline fallback: match strictly by ID
const oldSyncFallback = "const idx = this.db.projects.findIndex(p => p.id === newPrj.id || (p.code && p.code.toLowerCase() === newPrj.code.toLowerCase()));";
const newSyncFallback = "const idx = this.db.projects.findIndex(p => p.id === newPrj.id);";

if (js.includes(oldSyncFallback)) {
    js = js.replace(oldSyncFallback, newSyncFallback);
    console.log('Replaced oldSyncFallback successfully');
} else {
    console.warn('Could not find oldSyncFallback');
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Updated finance.js length:', js.length);

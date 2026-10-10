const fs = require('fs');
const path = require('path');
const { wrapPage, renderPageHero, ensureDir } = require('./build_multipage_site.cjs');

function createRoute(relativePath, { title, description, activePath, heroHtml, content }) {
  const fullPath = path.join(__dirname, relativePath);
  ensureDir(fullPath);
  const html = wrapPage({ title, description, activePath, heroHtml, content });
  fs.writeFileSync(fullPath, html, 'utf8');
  console.log(`Generated: ${relativePath}`);
}

// ============================================================================
// 1. REQUEST A PROPOSAL / BUSINESS ENQUIRIES (/proposal/index.html)
// ============================================================================
createRoute('proposal/index.html', {
  title: 'Request a Proposal | Business Enquiries',
  description: 'Submit project tender specifications, request proposals, and initiate partnership inquiries with Rayan Group for engineering, energy, infrastructure, and properties projects.',
  activePath: '/proposal/',
  heroHtml: renderPageHero({
    category: 'CLIENT ENGAGEMENT & TENDERS',
    title: 'REQUEST A PROPOSAL',
    description: 'Collaborate with Rayan Group across the UAE, India, and regional markets. Provide your project parameters and tender requirements for expedited commercial evaluation.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Business Services', href: '/proposal/' }, { label: 'Request a Proposal', href: '/proposal/' }],
    bgImage: '/assets/images/hero/hero-1-skyline.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 3.5rem;" class="intro-grid-responsive">
        
        <!-- Left: RFP Form -->
        <div>
          <div style="margin-bottom: 2rem;">
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">COMMERCIAL SPECIFICATION FORM</span>
            <h2 style="font-family: var(--font-heading); font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; color: #fff; margin-top: 0.35rem;">SUBMIT PROJECT TENDER DETAILS</h2>
            <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
              Please complete the project evaluation form below. Our commercial estimating team and technical directors will review your parameters and respond within 48 business hours.
            </p>
          </div>

          <div class="service-form-card">
            <form id="rfpForm" onsubmit="event.preventDefault(); alert('Thank you. Your proposal inquiry has been registered. Reference: RFP-RYN-' + Math.floor(100000 + Math.random() * 900000) + '. Our commercial team will contact you within 48 hours.'); this.reset();">
              
              <!-- Contact Details -->
              <h3 style="font-size: 1.1rem; color: #0099e6; font-weight: 700; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">1. CLIENT / CONTACT INFORMATION</h3>
              
              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="rfp-name">Full Name <span class="req">*</span></label>
                  <input type="text" id="rfp-name" class="service-form-input" required placeholder="e.g. Tariq Al Mansoori">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="rfp-company">Company / Organization <span class="req">*</span></label>
                  <input type="text" id="rfp-company" class="service-form-input" required placeholder="e.g. Emaar Properties / Aldar / ADNOC">
                </div>
              </div>

              <div class="form-grid-2col" style="margin-bottom: 1.75rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="rfp-email">Corporate Email <span class="req">*</span></label>
                  <input type="email" id="rfp-email" class="service-form-input" required placeholder="name@company.com">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="rfp-phone">Phone / WhatsApp Number <span class="req">*</span></label>
                  <input type="tel" id="rfp-phone" class="service-form-input" required placeholder="+971 50 123 4567">
                </div>
              </div>

              <!-- Project Parameters -->
              <h3 style="font-size: 1.1rem; color: #0099e6; font-weight: 700; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">2. PROJECT SCOPE &amp; SPECIFICATIONS</h3>

              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="rfp-division">Required Business Division <span class="req">*</span></label>
                  <select id="rfp-division" class="service-form-select" required>
                    <option value="" disabled selected>Select Business Division</option>
                    <option value="engineering">Rayan Engineering &amp; Turnkey Contracting</option>
                    <option value="energy">Rayan Energy &amp; Process EPC</option>
                    <option value="ashaz">Ashaz Engineering (India Regional Hub)</option>
                    <option value="properties">Rayan Properties (Upcoming)</option>
                    <option value="multiple">Multi-Disciplinary / Integrated Group Scope</option>
                  </select>
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="rfp-type">Project Sector / Type <span class="req">*</span></label>
                  <select id="rfp-type" class="service-form-select" required>
                    <option value="" disabled selected>Select Sector</option>
                    <option value="commercial">Commercial High-Rise / Mixed-Use</option>
                    <option value="hospitality">Luxury Hospitality &amp; Resort Overhaul</option>
                    <option value="residential">Bespoke Coastal Residential / Villas</option>
                    <option value="interior">Interior Design &amp; Turnkey Fit-Out</option>
                    <option value="facilities-management">Facilities Management &amp; Property Maintenance (FM / AMC)</option>
                    <option value="defense">Defense, Security &amp; Special Tactical</option>
                    <option value="energy">Oil &amp; Gas / Process Piping</option>
                    <option value="fabrication">Heavy Structural Steel / Fabrication</option>
                    <option value="infrastructure">Civic Infrastructure &amp; Paving Works</option>
                    <option value="other">Other Specialized Contracting</option>
                  </select>
                </div>
              </div>

              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="rfp-location">Project Location (Emirate / Region) <span class="req">*</span></label>
                  <input type="text" id="rfp-location" class="service-form-input" required placeholder="e.g. Abu Dhabi, Dubai, RAK, India">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="rfp-budget">Estimated Project Budget (AED) <span class="req">*</span></label>
                  <select id="rfp-budget" class="service-form-select" required>
                    <option value="" disabled selected>Select Budget Range</option>
                    <option value="under10m">Under AED 10 Million</option>
                    <option value="10m-50m">AED 10M – 50 Million</option>
                    <option value="50m-200m">AED 50M – 200 Million</option>
                    <option value="over200m">AED 200 Million+</option>
                    <option value="tender">Formal Tender Stage / Confidential</option>
                  </select>
                </div>
              </div>

              <div class="service-form-group" style="margin-bottom: 1.5rem;">
                <label class="service-form-label" for="rfp-desc">Scope Description &amp; Technical Requirements <span class="req">*</span></label>
                <textarea id="rfp-desc" class="service-form-textarea" rows="4" required placeholder="Provide an overview of the scope of work, timeline, site constraints, and specific engineering or equipment requirements..."></textarea>
              </div>

              <!-- Document Upload -->
              <div class="service-form-group" style="margin-bottom: 2rem;">
                <label class="service-form-label">Tender Documents / BOQ / Drawings (Optional)</label>
                <div class="file-dropzone" onclick="document.getElementById('rfp-file').click();">
                  <input type="file" id="rfp-file" multiple style="display: none;" onchange="const list = document.getElementById('rfp-file-name'); list.textContent = this.files.length ? Array.from(this.files).map(f => f.name).join(', ') : '';">
                  <div class="file-dropzone-icon">📁</div>
                  <div class="file-dropzone-title">Click or drag files here to upload</div>
                  <div class="file-dropzone-desc">Supports PDF, DWG, ZIP, XLSX, DOCX (Up to 50MB per file)</div>
                  <div id="rfp-file-name" class="file-dropzone-selected"></div>
                </div>
              </div>

              <!-- Submit Button & CTAs -->
              <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                <button type="submit" class="btn-enterprise-primary" style="padding: 1rem 2.25rem; font-size: 0.95rem; font-weight: 800;">
                  <span>SUBMIT PROPOSAL REQUEST</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <span style="font-size: 0.78rem; color: #94a3b8; display: inline-flex; align-items: center; gap: 0.35rem;">
                  <span style="color: #10b981;">✔</span> 100% Confidentiality &amp; NDA Protection Guaranteed
                </span>
              </div>
            </form>
          </div>
        </div>

        <!-- Right: Commercial Team & Capabilities Summary -->
        <div>
          <!-- Commercial Desk Card -->
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase; letter-spacing: 0.1em;">TENDERS &amp; COMMERCIAL DESK</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.3rem; color: #fff; margin: 0.5rem 0 1rem;">DIRECT ENGAGEMENT</h3>
            
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.5rem;">
              For urgent tender submissions, joint ventures, or direct consortium prequalification, contact our central estimating desk directly:
            </p>

            <div style="display: flex; flex-direction: column; gap: 1rem; font-size: 0.85rem;">
              <div style="border-left: 2px solid #0099e6; padding-left: 0.75rem;">
                <strong style="color: #fff; display: block;">Abu Dhabi Commercial HQ:</strong>
                <span style="color: #94a3b8;">Phone: +971-25654497</span><br>
                <a href="mailto:tender@rayan-group.com" style="color: #0099e6; text-decoration: none;">tender@rayan-group.com</a>
              </div>
              <div style="border-left: 2px solid #10b981; padding-left: 0.75rem;">
                <strong style="color: #fff; display: block;">South Asia Regional Hub:</strong>
                <span style="color: #94a3b8;">Ashaz Engineering, India</span><br>
                <span style="color: #94a3b8;">Phone: +91-9973086910</span><br>
                <a href="mailto:ashaz@rayan-group.com" style="color: #0099e6; text-decoration: none;">ashaz@rayan-group.com</a>
              </div>
            </div>

            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.08);">
              <a href="/contact/" class="btn-enterprise-secondary" style="width: 100%; justify-content: center; text-align: center; font-size: 0.8rem; padding: 0.75rem 1rem;">
                <span>TALK TO OUR TEAM →</span>
              </a>
            </div>
          </div>

          <!-- Why Partner With Rayan -->
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
            <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; margin-bottom: 1rem;">OUR CONTRACTING ADVANTAGE</h4>
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.85rem; color: #94a3b8;">
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #0099e6; font-weight: 700;">▸</span>
                <span><strong>18+ Years Industry Heritage:</strong> Extensive civil, energy, and infrastructure track record since 2008 across UAE &amp; South Asia.</span>
              </li>
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #0099e6; font-weight: 700;">▸</span>
                <span><strong>Triple ISO Certifications:</strong> Fully audited ISO 9001 (Quality), ISO 14001 (Environment), and ISO 45001 (Occupational Safety).</span>
              </li>
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #0099e6; font-weight: 700;">▸</span>
                <span><strong>Heavy Plant &amp; Equipment Fleets:</strong> High-capacity mobile cranes, earthmovers, pipe fabrication plant, and precision logistics.</span>
              </li>
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #0099e6; font-weight: 700;">▸</span>
                <span><strong>End-to-End Turnkey Delivery:</strong> Engineering, procurement, construction, MEP, fit-out, and civil handover.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 2. SUPPLIERS & PROCUREMENT PORTAL (/procurement/index.html)
// ============================================================================
createRoute('procurement/index.html', {
  title: 'Suppliers & Procurement Portal | Vendor Registration',
  description: 'Vendor registration, approved vendor list (AVL) onboarding, supplier prequalification criteria, documentation checklist, and procurement code of conduct at Rayan Group.',
  activePath: '/procurement/',
  heroHtml: renderPageHero({
    category: 'SUPPLY CHAIN & VENDOR RELATIONS',
    title: 'SUPPLIERS & PROCUREMENT',
    description: 'Fostering ethical, resilient, and high-performance supply chain partnerships across materials, specialized subcontracting, heavy equipment, and energy technology.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Business Services', href: '/procurement/' }, { label: 'Procurement', href: '/procurement/' }],
    bgImage: '/assets/images/hero/hero-1-skyline.jpg'
  }),
  content: `
  <!-- 4-Step Onboarding Process -->
  <section class="section" style="padding: 5rem 0 3.5rem; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 720px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">TRANSPARENT ONBOARDING</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.5rem); font-weight: 800; color: #fff; margin-top: 0.35rem;">VENDOR ONBOARDING WORKFLOW</h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          Our procurement division operates a structured, merit-based prequalification process inspired by international best practices to ensure mutual compliance and long-term delivery capability.
        </p>
      </div>

      <div class="process-step-grid">
        <div class="process-step-card">
          <div class="process-step-num">01</div>
          <h3 class="process-step-title">Online Registration</h3>
          <p class="process-step-desc">Submit your company credentials, trade license, commercial registration, tax certificate, and primary product/service categorization.</p>
        </div>

        <div class="process-step-card">
          <div class="process-step-num">02</div>
          <h3 class="process-step-title">QHSE &amp; Compliance Audit</h3>
          <p class="process-step-desc">Evaluation of your quality management systems, environmental safety protocols, ISO certifications, and labor welfare practices.</p>
        </div>

        <div class="process-step-card">
          <div class="process-step-num">03</div>
          <h3 class="process-step-title">AVL Enlistment</h3>
          <p class="process-step-desc">Approved vendors receive formal notification and admission to the Rayan Group Approved Vendor List (AVL) across relevant operating divisions.</p>
        </div>

        <div class="process-step-card">
          <div class="process-step-num">04</div>
          <h3 class="process-step-title">Tender Invitations</h3>
          <p class="process-step-desc">Enlisted partners receive direct requests for quotation (RFQs), procurement packages, and specialized subcontracting opportunities.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Vendor Registration Form & Documentation Checklist -->
  <section class="section" id="prequalification" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 3.5rem;" class="intro-grid-responsive">
        
        <!-- Registration Form -->
        <div>
          <div style="margin-bottom: 2rem;">
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">OFFICIAL ENROLLMENT</span>
            <h2 style="font-family: var(--font-heading); font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; color: #fff; margin-top: 0.35rem;">VENDOR REGISTRATION FORM</h2>
            <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
              Please complete all mandatory fields. Ensure attached trade certificates and company profiles are in high-resolution PDF format. For direct vendor prequalification assistance, contact <a href="mailto:vendors@rayan-group.com" style="color: #0099e6; font-weight: 600; text-decoration: none;">vendors@rayan-group.com</a>.
            </p>
          </div>

          <div class="service-form-card">
            <form id="vendorForm" onsubmit="event.preventDefault(); alert('Vendor registration received. Reference: VND-RYN-' + Math.floor(100000 + Math.random() * 900000) + '. Dossier routed to vendors@rayan-group.com. Our procurement audit team will verify your documentation within 3-5 business days.'); this.reset();">
              
              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="vnd-company">Company Legal Name <span class="req">*</span></label>
                  <input type="text" id="vnd-company" class="service-form-input" required placeholder="e.g. Gulf Structural Steel L.L.C.">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="vnd-license">Trade License / Commercial Reg. No <span class="req">*</span></label>
                  <input type="text" id="vnd-license" class="service-form-input" required placeholder="e.g. CN-1234567">
                </div>
              </div>

              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="vnd-country">Jurisdiction / Emirate <span class="req">*</span></label>
                  <select id="vnd-country" class="service-form-select" required>
                    <option value="" disabled selected>Select Jurisdiction</option>
                    <option value="ad">Abu Dhabi, UAE</option>
                    <option value="dxb">Dubai, UAE</option>
                    <option value="rak">Ras Al Khaimah / Northern Emirates, UAE</option>
                    <option value="ksa">Kingdom of Saudi Arabia</option>
                    <option value="in">India / South Asia</option>
                    <option value="intl">Other International</option>
                  </select>
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="vnd-category">Primary Supply Category <span class="req">*</span></label>
                  <select id="vnd-category" class="service-form-select" required>
                    <option value="" disabled selected>Select Supply Category</option>
                    <option value="civil-materials">Civil &amp; Structural Building Materials (Steel, Concrete, Aggregates)</option>
                    <option value="interior-design">Interior Design &amp; Turnkey Fit-Out (Residential, Commercial &amp; Joinery)</option>
                    <option value="facilities-management">Facilities Management &amp; Property Maintenance (FM / AMC, HVAC, MEP)</option>
                    <option value="mep">MEP Equipment, Switchgear &amp; HVAC</option>
                    <option value="fabrication">Structural Steel, Precast &amp; Fabrication Modules</option>
                    <option value="energy">Piping, Valves, Pressure Vessels &amp; Process Equipment</option>
                    <option value="machinery">Heavy Equipment Rental &amp; Logistics Fleets</option>
                    <option value="subcontracting">Specialized Subcontracting (Civil, Waterproofing, Piling)</option>
                    <option value="safety">QHSE, Safety Wear &amp; Environmental Services</option>
                    <option value="other">Other Commercial Services</option>
                  </select>
                </div>
              </div>

              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="vnd-contact">Primary Contact Person <span class="req">*</span></label>
                  <input type="text" id="vnd-contact" class="service-form-input" required placeholder="Name &amp; Designation">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="vnd-email">Corporate Email Address <span class="req">*</span></label>
                  <input type="email" id="vnd-email" class="service-form-input" required placeholder="procurement@yourcompany.com">
                </div>
              </div>

              <div class="form-grid-2col" style="margin-bottom: 1.5rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="vnd-phone">Telephone / Mobile Number <span class="req">*</span></label>
                  <input type="tel" id="vnd-phone" class="service-form-input" required placeholder="+971 2 123 4567">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="vnd-vat">VAT / TRN Registration No <span class="req">*</span></label>
                  <input type="text" id="vnd-vat" class="service-form-input" required placeholder="100-XXXX-XXXX-XXXX">
                </div>
              </div>

              <!-- File Upload for Vendor Dossier -->
              <div class="service-form-group" style="margin-bottom: 2rem;">
                <label class="service-form-label">Vendor Dossier Upload (Trade License, VAT Certificate &amp; Profile) <span class="req">*</span></label>
                <div class="file-dropzone" onclick="document.getElementById('vnd-file').click();">
                  <input type="file" id="vnd-file" multiple style="display: none;" required onchange="const list = document.getElementById('vnd-file-name'); list.textContent = this.files.length ? Array.from(this.files).map(f => f.name).join(', ') : '';">
                  <div class="file-dropzone-icon">📋</div>
                  <div class="file-dropzone-title">Upload Prequalification Dossier</div>
                  <div class="file-dropzone-desc">Attach Trade License, VAT certificate, company profile, and ISO certifications (PDF, ZIP up to 50MB)</div>
                  <div id="vnd-file-name" class="file-dropzone-selected"></div>
                </div>
              </div>

              <div style="margin-bottom: 1.5rem;">
                <label style="display: flex; gap: 0.65rem; font-size: 0.85rem; color: #94a3b8; cursor: pointer;">
                  <input type="checkbox" required style="accent-color: #0099e6; margin-top: 0.2rem;">
                  <span>I certify that all information submitted is true and accurate, and that my organization adheres to Rayan Group's Supplier Code of Conduct and Zero-Bribery standards.</span>
                </label>
              </div>

              <button type="submit" class="btn-enterprise-primary" style="padding: 1rem 2.25rem; font-size: 0.95rem; font-weight: 800;">
                <span>SUBMIT VENDOR REGISTRATION</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </form>
          </div>
        </div>

        <!-- Documentation Checklist & Code of Conduct -->
        <div>
          <!-- Required Documentation Checklist -->
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase; letter-spacing: 0.1em;">PREQUALIFICATION CHECKLIST</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: #fff; margin: 0.5rem 0 1rem;">REQUIRED DOCUMENTATION</h3>
            
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem; color: #94a3b8;">
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #10b981; font-weight: 700;">✓</span>
                <span><strong>Valid Commercial / Trade License:</strong> Minimum 3 months validity with matching operational activities.</span>
              </li>
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #10b981; font-weight: 700;">✓</span>
                <span><strong>Chamber of Commerce Certificate:</strong> Issued by relevant Emirate or jurisdiction.</span>
              </li>
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #10b981; font-weight: 700;">✓</span>
                <span><strong>VAT / TRN Registration Certificate:</strong> Official tax registration confirmation.</span>
              </li>
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #10b981; font-weight: 700;">✓</span>
                <span><strong>Corporate Profile &amp; Project Track Record:</strong> Summary of top projects delivered over the last 3-5 years.</span>
              </li>
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #10b981; font-weight: 700;">✓</span>
                <span><strong>QHSE &amp; ISO Credentials:</strong> ISO 9001, ISO 14001, and ISO 45001 certificates if applicable.</span>
              </li>
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #10b981; font-weight: 700;">✓</span>
                <span><strong>Bank Account Confirmation Letter:</strong> Official bank verification of corporate IBAN.</span>
              </li>
            </ul>
          </div>

          <!-- Official SAP Ariba Supplier Network Registration Card -->
          <div class="ariba-verification-card" style="margin-bottom: 2rem;">
            <div class="ariba-verification-header">
              <div>
                <span style="font-size: 0.72rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.1em; display: block;">VERIFIED SAP BUSINESS NETWORK</span>
                <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: #fff; margin: 0.25rem 0 0;">SUPPLIER PROFILE</h3>
              </div>
              <span class="ariba-verification-anid" title="Rayan Group SAP Ariba Network ID">ANID: AN11136910824</span>
            </div>
            
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">
              Institutional clients, EPC contractors, and procurement departments can transact, issue tender RFQs, and verify Rayan Group’s authenticated supplier credentials directly on SAP Ariba Network.
            </p>

            <a href="https://portal.us.bn.cloud.ariba.com/profile/public?anId=AN11136910824" target="_blank" rel="noopener noreferrer" class="ariba-network-badge ariba-network-badge--lg" title="Open Rayan Group Profile on SAP Ariba Network (ANID: AN11136910824)" style="width: 100%; justify-content: center;">
              <div class="ariba-badge-content" style="justify-content: center; gap: 1.25rem;">
                <div class="ariba-badge-text">
                  <span class="ariba-badge-sub">Find us on</span>
                  <span class="ariba-badge-main">Ariba Network</span>
                </div>
                <div class="ariba-badge-icon">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M4 27 L16 5 L28 27" stroke="#F59E0B" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 27 L16 16 L22 27" stroke="#F59E0B" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </a>
          </div>

          <!-- Supplier Code of Conduct (Khansaheb / Ethos pattern) -->
          <div id="code-of-conduct" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em;">ETHICS &amp; GOVERNANCE</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: #fff; margin: 0.5rem 0 1rem;">SUPPLIER CODE OF CONDUCT</h3>
            
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1rem;">
              Rayan Group requires all vendors, subcontractors, and suppliers to uphold rigorous standards across:
            </p>

            <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.85rem; color: #cbd5e1;">
              <div>
                <strong style="color: #fff;">• Zero Tolerance for Bribery &amp; Corruption:</strong> Complete prohibition of gifts, kickbacks, or improper inducements.
              </div>
              <div>
                <strong style="color: #fff;">• Labor Rights &amp; Worker Welfare:</strong> Full compliance with UAE &amp; Indian labor regulations, prompt wages, and safe housing.
              </div>
              <div>
                <strong style="color: #fff;">• Health, Safety &amp; Environment:</strong> Strict enforcement of site safety protocols and hazardous waste mitigation.
              </div>
            </div>

            <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.8rem; color: #94a3b8;">
              <div style="margin-bottom: 0.35rem;">Vendor Registration Desk: <a href="mailto:vendors@rayan-group.com" style="color: #0099e6; font-weight: 600; text-decoration: none;">vendors@rayan-group.com</a></div>
              <div>Direct Purchase Queries: <a href="mailto:purchase@rayan-group.com" style="color: #cbd5e1; text-decoration: none;">purchase@rayan-group.com</a></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 3. BILLING & ACCOUNTS DESK (/billing/index.html)
// ============================================================================
createRoute('billing/index.html', {
  title: 'Billing & Accounts Desk | Vendor & Client Accounts',
  description: 'Corporate billing and accounts inquiry portal for invoice tracking, payment status verification, purchase order queries, and accounts department contact at Rayan Group.',
  activePath: '/billing/',
  heroHtml: renderPageHero({
    category: 'FINANCIAL SERVICES & DISBURSEMENTS',
    title: 'BILLING & ACCOUNTS DESK',
    description: 'Corporate workflow for invoice status verification, purchase order reconciliation, payment milestone queries, and vendor finance support.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Business Services', href: '/billing/' }, { label: 'Billing & Accounts', href: '/billing/' }],
    bgImage: '/assets/images/hero/hero-3-energy.jpg'
  }),
  content: `
  <!-- Security Notice Banner -->
  <section class="section" style="padding: 2.5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="background: rgba(0,153,230,0.08); border: 1px solid rgba(0,153,230,0.25); border-radius: 10px; padding: 1.5rem 2rem; display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
        <div style="font-size: 2rem;">🔒</div>
        <div style="flex: 1;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; margin-bottom: 0.25rem;">CORPORATE INQUIRY PORTAL • SECURE VERIFICATION</h3>
          <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; line-height: 1.5;">
            Rayan Group conducts financial transactions strictly via regulated corporate banking wires and verified letters of credit under executed contracts. We do not accept or process credit card payments or retail transactions online.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Billing Inquiry Form & Guidelines -->
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 3.5rem;" class="intro-grid-responsive">
        
        <!-- Inquiry Form -->
        <div>
          <div style="margin-bottom: 2rem;">
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">ACCOUNTS ENQUIRY DESK</span>
            <h2 style="font-family: var(--font-heading); font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; color: #fff; margin-top: 0.35rem;">SUBMIT INVOICE OR PAYMENT QUERY</h2>
            <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
              Please provide your approved Purchase Order (PO) or Subcontract Agreement reference for expedited accounts payable status checking.
            </p>
          </div>

          <div class="service-form-card">
            <form id="billingForm" onsubmit="event.preventDefault(); alert('Billing inquiry received. Reference: ACC-RYN-' + Math.floor(100000 + Math.random() * 900000) + '. Our finance department will review your ledger status and respond via email within 2 business days.'); this.reset();">
              
              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="bill-type">Inquiry Nature <span class="req">*</span></label>
                  <select id="bill-type" class="service-form-select" required>
                    <option value="" disabled selected>Select Inquiry Type</option>
                    <option value="invoice-status">Vendor Invoice Status Verification</option>
                    <option value="payment-advice">Payment Remittance Advice Request</option>
                    <option value="po-query">Purchase Order / Contract Value Query</option>
                    <option value="statement">Statement of Account (SOA) Reconciliation</option>
                    <option value="client-billing">Client Milestone Billing Query</option>
                  </select>
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="bill-entity">Rayan Group Entity Billed <span class="req">*</span></label>
                  <select id="bill-entity" class="service-form-select" required>
                    <option value="" disabled selected>Select Operating Entity</option>
                    <option value="rayan-group">Rayan Group</option>
                    <option value="engineering">Rayan Engineering</option>
                    <option value="energy">Rayan Energy</option>
                    <option value="ashaz">Ashaz Engineering (India)</option>
                    <option value="properties">Rayan Properties</option>
                  </select>
                </div>
              </div>

              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="bill-vendor">Company / Vendor Name <span class="req">*</span></label>
                  <input type="text" id="bill-vendor" class="service-form-input" required placeholder="Your registered company name">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="bill-contact">Contact Person <span class="req">*</span></label>
                  <input type="text" id="bill-contact" class="service-form-input" required placeholder="Name &amp; Finance Designation">
                </div>
              </div>

              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="bill-email">Accounts Email Address <span class="req">*</span></label>
                  <input type="email" id="bill-email" class="service-form-input" required placeholder="finance@yourcompany.com">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="bill-phone">Phone Number <span class="req">*</span></label>
                  <input type="tel" id="bill-phone" class="service-form-input" required placeholder="+971 50 123 4567">
                </div>
              </div>

              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="bill-po">Purchase Order / Contract No <span class="req">*</span></label>
                  <input type="text" id="bill-po" class="service-form-input" required placeholder="e.g. PO-2024-XXXX">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="bill-inv">Tax Invoice Number <span class="req">*</span></label>
                  <input type="text" id="bill-inv" class="service-form-input" required placeholder="e.g. INV-10928">
                </div>
              </div>

              <div class="form-grid-2col" style="margin-bottom: 1.5rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="bill-amount">Invoice Amount &amp; Currency <span class="req">*</span></label>
                  <input type="text" id="bill-amount" class="service-form-input" required placeholder="e.g. AED 125,000.00">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="bill-date">Invoice Date <span class="req">*</span></label>
                  <input type="date" id="bill-date" class="service-form-input" required>
                </div>
              </div>

              <div class="service-form-group" style="margin-bottom: 1.5rem;">
                <label class="service-form-label" for="bill-notes">Inquiry Details &amp; Additional Information</label>
                <textarea id="bill-notes" class="service-form-textarea" rows="3" placeholder="Provide any additional context, delivery note references, or site engineer sign-off details..."></textarea>
              </div>

              <!-- File Upload for Invoice Copy -->
              <div class="service-form-group" style="margin-bottom: 2rem;">
                <label class="service-form-label">Attach Tax Invoice &amp; Delivery Note / Sign-off (PDF)</label>
                <div class="file-dropzone" onclick="document.getElementById('bill-file').click();">
                  <input type="file" id="bill-file" multiple style="display: none;" onchange="const list = document.getElementById('bill-file-name'); list.textContent = this.files.length ? Array.from(this.files).map(f => f.name).join(', ') : '';">
                  <div class="file-dropzone-icon">📑</div>
                  <div class="file-dropzone-title">Upload Invoice or Delivery Documents</div>
                  <div class="file-dropzone-desc">Attach signed delivery notes, approved inspection requests, or tax invoice PDFs (Up to 25MB)</div>
                  <div id="bill-file-name" class="file-dropzone-selected"></div>
                </div>
              </div>

              <button type="submit" class="btn-enterprise-primary" style="padding: 1rem 2.25rem; font-size: 0.95rem; font-weight: 800;">
                <span>SUBMIT BILLING INQUIRY</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </form>
          </div>
        </div>

        <!-- Accounts Payable Guidelines -->
        <div>
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase; letter-spacing: 0.1em;">ACCOUNTS PAYABLE PROTOCOL</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: #fff; margin: 0.5rem 0 1rem;">PAYMENT POLICIES</h3>
            
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.85rem; color: #94a3b8;">
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #0099e6; font-weight: 700;">▸</span>
                <span><strong>3-Way Matching:</strong> All invoices must match an approved Rayan Group Purchase Order and signed Material Delivery Note (MDN).</span>
              </li>
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #0099e6; font-weight: 700;">▸</span>
                <span><strong>Tax Compliance:</strong> Invoices must clearly state TRN, breakdown 5% UAE VAT, and bear corporate stamp.</span>
              </li>
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #0099e6; font-weight: 700;">▸</span>
                <span><strong>Disbursement Cycles:</strong> Standard payment disbursements are processed on bi-monthly cycles via electronic banking transfer.</span>
              </li>
              <li style="display: flex; gap: 0.6rem; align-items: flex-start;">
                <span style="color: #0099e6; font-weight: 700;">▸</span>
                <span><strong>Bank Details Change:</strong> Bank modifications require an official attested letter from your financial institution.</span>
              </li>
            </ul>
          </div>

          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
            <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; margin-bottom: 1rem;">ACCOUNTS CONTACT POINTS</h4>
            <div style="font-size: 0.85rem; color: #94a3b8; line-height: 1.6;">
              <strong style="color: #fff; display: block;">Finance Department (UAE):</strong>
              Office No. 09, Plot No. 42, Mussafah M-36, Abu Dhabi, UAE<br>
              <span style="color: #0099e6;">accounts@rayan-group.com</span><br>
              Direct: +971-25654497 (Ext. 204)
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 4. COOKIE POLICY (/cookies/index.html) - Khansaheb Pattern
// ============================================================================
createRoute('cookies/index.html', {
  title: 'Cookie Policy | Legal Disclosures',
  description: 'Understand how Rayan Group utilizes cookies and related tracking technologies to provide seamless site functionality and analytics.',
  activePath: '/cookies/',
  heroHtml: renderPageHero({
    category: 'LEGAL & PRIVACY COMPLIANCE',
    title: 'COOKIE POLICY',
    description: 'This Cookie Policy explains how Rayan Group uses cookies and similar technologies on our corporate website.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Legal', href: '/terms/' }, { label: 'Cookie Policy', href: '/cookies/' }],
    bgImage: '/assets/images/about/overview.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="max-width: 860px; margin: 0 auto; color: #94a3b8; font-size: 0.95rem; line-height: 1.8;">
        
        <div style="margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <span style="font-size: 0.8rem; color: #0099e6; font-weight: 700;">LAST UPDATED: OCTOBER 2026</span>
          <h2 style="font-family: var(--font-heading); font-size: 2rem; color: #fff; margin-top: 0.5rem;">HOW WE USE COOKIES</h2>
        </div>

        <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">1. What Are Cookies?</h3>
        <p>Cookies are small text files placed on your computer or mobile device when you access our website. They help us ensure the platform operates efficiently, recognize your device preferences (such as light or dark theme choice), and gather anonymized aggregated traffic metrics.</p>

        <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">2. Categories of Cookies We Use</h3>
        <ul style="list-style: disc; padding-left: 1.5rem; margin-bottom: 1.5rem;">
          <li><strong style="color: #fff;">Strictly Necessary Cookies:</strong> Essential for browsing our corporate portal, navigating between business divisions, and submitting tender inquiries securely.</li>
          <li><strong style="color: #fff;">Preference Cookies:</strong> Remember your selections, including color theme (Light vs. Dark mode) and language settings.</li>
          <li><strong style="color: #fff;">Performance &amp; Analytics Cookies:</strong> Collect anonymous data on how visitors explore our project portfolio and division pages, allowing us to enhance site speed and usability.</li>
        </ul>

        <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">3. Third-Party Technologies</h3>
        <p>We do not sell personal browsing data to advertising brokers. Any third-party integrations (such as interactive maps or document viewing utilities) comply with relevant data protection statutes.</p>

        <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">4. Managing Your Cookie Preferences</h3>
        <p>You can control or disable cookies through your browser settings at any time. Disabling certain cookies may affect interactive features, such as preloader animations or saved theme preferences.</p>

        <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">5. Contact Legal Office</h3>
        <p>For inquiries regarding our Cookie Policy, please reach out to our legal department at <span style="color: #0099e6;">legal@rayan-group.com</span>.</p>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 5. LEGAL DISCLAIMER (/disclaimer/index.html) - Khansaheb Pattern
// ============================================================================
createRoute('disclaimer/index.html', {
  title: 'Corporate Legal Disclaimer | Rayan Group',
  description: 'Official corporate legal disclaimer regarding website materials, engineering scopes, third-party references, and intellectual property.',
  activePath: '/disclaimer/',
  heroHtml: renderPageHero({
    category: 'LEGAL & REGULATORY NOTICE',
    title: 'CORPORATE DISCLAIMER',
    description: 'Notice regarding informational scope, contracting disclaimers, and intellectual property across Rayan Group online platforms.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Legal', href: '/terms/' }, { label: 'Disclaimer', href: '/disclaimer/' }],
    bgImage: '/assets/images/about/overview.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="max-width: 860px; margin: 0 auto; color: #94a3b8; font-size: 0.95rem; line-height: 1.8;">
        
        <div style="margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <span style="font-size: 0.8rem; color: #0099e6; font-weight: 700;">OFFICIAL CORPORATE NOTICE</span>
          <h2 style="font-family: var(--font-heading); font-size: 2rem; color: #fff; margin-top: 0.5rem;">WEBSITE &amp; CONTRACTING DISCLAIMER</h2>
        </div>

        <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">1. General Informational Use</h3>
        <p>The materials, specifications, and project highlights displayed on this website are published solely for general corporate informational purposes by Rayan Group. While all reasonable diligence is exercised to maintain factual precision, content does not constitute a legally binding contractual tender or engineering warranty unless formalized in an executed agreement.</p>

        <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">2. Engineering &amp; Project Representation</h3>
        <p>Project scopes, imagery, and specifications reflect actual delivered or ongoing assignments across our engineering, energy, infrastructure, and properties operations. Specific scope boundaries, joint venture participation, and client deliverables are governed exclusively by executed master construction contracts and FIDIC agreements.</p>

        <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">3. Private Group Status</h3>
        <p>Rayan Group is a private corporate conglomerate. Nothing on this website constitutes an offer to buy or sell securities, shares, or public financial instruments in any jurisdiction.</p>

        <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">4. Intellectual Property Rights</h3>
        <p>All trademarks, logos, technical drawings, project photography, and documentation on this website are the proprietary property of Rayan Group or used with appropriate contractual authorization. Unauthorized reproduction or commercial use is strictly prohibited under UAE and international copyright laws.</p>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 6. CORPORATE SITEMAP (/sitemap/index.html) - Khansaheb Pattern
// ============================================================================
createRoute('sitemap/index.html', {
  title: 'Corporate Sitemap | Rayan Group Directory',
  description: 'Comprehensive directory and sitemap of all corporate pages, business divisions, project portfolio, client services, and legal disclosures.',
  activePath: '/sitemap/',
  heroHtml: renderPageHero({
    category: 'WEBSITE DIRECTORY',
    title: 'CORPORATE SITEMAP',
    description: 'Complete navigational architecture and directory of Rayan Group portals, operating companies, case studies, and business workflows.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Sitemap', href: '/sitemap/' }],
    bgImage: '/assets/images/about/overview.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2.5rem;">
        
        <!-- Corporate Section -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #0099e6; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">CORPORATE</h3>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.9rem;">
            <li><a href="/" style="color: #fff; text-decoration: none;">• Home Page</a></li>
            <li><a href="/about/" style="color: #cbd5e1; text-decoration: none;">• Who We Are</a></li>
            <li><a href="/leadership/" style="color: #cbd5e1; text-decoration: none;">• Executive Leadership</a></li>
            <li><a href="/about/#timeline" style="color: #cbd5e1; text-decoration: none;">• Corporate Heritage &amp; Timeline</a></li>
            <li><a href="/sustainability/" style="color: #cbd5e1; text-decoration: none;">• Sustainability &amp; HSE Strategy</a></li>
            <li><a href="/news/" style="color: #cbd5e1; text-decoration: none;">• Newsroom &amp; Media</a></li>
            <li><a href="/contact/" style="color: #cbd5e1; text-decoration: none;">• Global Office Directory</a></li>
          </ul>
        </div>

        <!-- Businesses & Divisions -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #0099e6; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">OPERATING COMPANIES</h3>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.9rem;">
            <li><a href="/business/" style="color: #fff; text-decoration: none;">• All Operating Companies</a></li>
            <li><a href="/business/engineering/" style="color: #cbd5e1; text-decoration: none;">• Rayan Engineering</a></li>
            <li><a href="/business/energy/" style="color: #cbd5e1; text-decoration: none;">• Rayan Energy</a></li>
            <li><a href="/business/ashaz/" style="color: #cbd5e1; text-decoration: none;">• Ashaz Engineering (India)</a></li>
            <li><a href="/business/properties/" style="color: #cbd5e1; text-decoration: none;">• Rayan Properties (Upcoming)</a></li>
          </ul>
        </div>

        <!-- Business Services -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #0099e6; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">BUSINESS SERVICES</h3>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.9rem;">
            <li><a href="/proposal/" style="color: #fff; text-decoration: none;">• Request a Proposal (RFP)</a></li>
            <li><a href="/procurement/" style="color: #cbd5e1; text-decoration: none;">• Suppliers &amp; Procurement Portal</a></li>
            <li><a href="/procurement/#prequalification" style="color: #cbd5e1; text-decoration: none;">• Vendor Prequalification Form</a></li>
            <li><a href="/procurement/#code-of-conduct" style="color: #cbd5e1; text-decoration: none;">• Supplier Code of Conduct</a></li>
            <li><a href="/billing/" style="color: #cbd5e1; text-decoration: none;">• Billing &amp; Accounts Desk</a></li>
          </ul>
        </div>

        <!-- Projects Portfolio -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #0099e6; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">PROJECT PORTFOLIO</h3>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.9rem;">
            <li><a href="/projects/" style="color: #fff; text-decoration: none;">• Master Projects Showcase (16 Deliveries)</a></li>
            <li><a href="/projects/waldorf-astoria-renovation-rak/" style="color: #cbd5e1; text-decoration: none;">• Waldorf Astoria RAK Overhaul</a></li>
            <li><a href="/projects/palm-jumeirah-rec-estate/" style="color: #cbd5e1; text-decoration: none;">• Palm Jumeirah Waterfront Estate</a></li>
            <li><a href="/projects/c2-towers-al-bateen/" style="color: #cbd5e1; text-decoration: none;">• C2 Towers Al Bateen High-Rise</a></li>
            <li><a href="/projects/edge-group-remaya/" style="color: #cbd5e1; text-decoration: none;">• EDGE Group REMAYA Complex</a></li>
            <li><a href="/projects/roxy-cinema-dubai-hills-mall/" style="color: #cbd5e1; text-decoration: none;">• Roxy Cinemas Dubai Hills Mall</a></li>
          </ul>
        </div>

        <!-- Careers & People -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #0099e6; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">CAREERS &amp; TALENT</h3>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.9rem;">
            <li><a href="/careers/" style="color: #fff; text-decoration: none;">• Careers Overview</a></li>
            <li><a href="/careers/#why-rayan" style="color: #cbd5e1; text-decoration: none;">• Why Work with Rayan</a></li>
            <li><a href="/careers/#departments" style="color: #cbd5e1; text-decoration: none;">• Engineering Disciplines &amp; Departments</a></li>
            <li><a href="/careers/#apply" style="color: #cbd5e1; text-decoration: none;">• Talent Pool Application &amp; CV Upload</a></li>
          </ul>
        </div>

        <!-- Legal & Policies -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #0099e6; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">LEGAL &amp; COMPLIANCE</h3>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.9rem;">
            <li><a href="/privacy/" style="color: #cbd5e1; text-decoration: none;">• Privacy Policy</a></li>
            <li><a href="/terms/" style="color: #cbd5e1; text-decoration: none;">• Terms &amp; Conditions</a></li>
            <li><a href="/cookies/" style="color: #cbd5e1; text-decoration: none;">• Cookie Policy</a></li>
            <li><a href="/disclaimer/" style="color: #cbd5e1; text-decoration: none;">• Corporate Legal Disclaimer</a></li>
          </ul>
        </div>

      </div>
    </div>
  </section>
  `
});

console.log('Business services and legal routes generated successfully.');

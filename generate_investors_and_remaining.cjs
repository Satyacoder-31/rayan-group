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
// 1. CORPORATE PROFILE / PRIVATE GOVERNANCE (/investors/index.html)
// Clean unlisted corporate governance without fake stock exchange data
// ============================================================================
createRoute('investors/index.html', {
  title: 'Corporate Governance & Private Group Profile',
  description: 'Rayan Group is a privately held engineering and infrastructure conglomerate operating across the UAE and South Asia with strict corporate governance.',
  activePath: '/investors/',
  heroHtml: renderPageHero({
    category: 'CORPORATE GOVERNANCE & STRUCTURE',
    title: 'PRIVATE GROUP PROFILE',
    description: 'Operating as a privately held multinational conglomerate with prudent capital allocation, independent oversight, and long-term industrial commitment.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Corporate Profile', href: '/investors/' }],
    bgImage: '/assets/images/about/overview.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="max-width: 860px; margin: 0 auto;">
        
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: clamp(2rem, 4vw, 3.5rem); margin-bottom: 3.5rem;">
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">CORPORATE OWNERSHIP &amp; STRUCTURE</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(1.75rem, 3vw, 2.5rem); font-weight: 800; color: #fff; margin: 0.5rem 0 1.5rem;">PRIVATE MULTINATIONAL ENTERPRISE</h2>
          
          <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.25rem;">
            Rayan Group is a 100% privately held corporate enterprise headquartered in the United Arab Emirates, with major operational hubs in India. The group does not list public equity or issue publicly traded shares on secondary stock exchanges.
          </p>

          <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.65; margin-bottom: 2rem;">
            Our financial discipline is driven by strategic reinvestment, conservative balance sheet management, and long-standing banking relationships with premier financial institutions across the GCC and South Asia.
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.08);">
            <div>
              <span style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Legal Structure</span>
              <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">L.L.C - S.P.C (UAE)</div>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Ownership</span>
              <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">100% Privately Held</div>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Operating Hubs</span>
              <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #0099e6; margin-top: 0.25rem;">United Arab Emirates &amp; India</div>
            </div>
          </div>
        </div>

        <!-- Governance Charters -->
        <div style="margin-bottom: 3.5rem;">
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">FIDUCIARY RIGOR</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #fff; margin: 0.5rem 0 1.5rem;">GOVERNANCE PRINCIPLES</h3>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
            <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.75rem;">
              <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Executive Oversight</h4>
              <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6;">Board-level steering committees maintain rigorous technical and financial oversight across all major construction and energy contracts.</p>
            </div>
            <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.75rem;">
              <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Independent Financial Audits</h4>
              <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6;">Annual accounts and project-level financial disclosures are reviewed by certified independent auditing institutions in accordance with IFRS.</p>
            </div>
            <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.75rem;">
              <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">QHSE Zero-Harm Commitment</h4>
              <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6;">Strict corporate safety governance aligned with ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 certifications.</p>
            </div>
          </div>
        </div>

        <!-- Partnership Contact -->
        <div style="background: linear-gradient(135deg, #091a2e 0%, #061320 100%); border: 1px solid rgba(0,153,230,0.25); border-radius: 12px; padding: 2.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
          <div>
            <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">Strategic Joint Ventures &amp; Banking Enquiries</h4>
            <p style="color: #94a3b8; font-size: 0.9rem; margin: 0;">For institutional partnerships or banking verifications, contact our executive office directly.</p>
          </div>
          <a href="/contact/" class="btn-enterprise-primary">EXECUTIVE CONTACT →</a>
        </div>

      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 2. CAREERS & TALENT POOL (/careers/index.html) - EthosEnergy & Khansaheb Pattern
// ============================================================================
createRoute('careers/index.html', {
  title: 'Careers & Talent Pool | Join Rayan Group',
  description: 'Explore engineering, energy, infrastructure, and corporate careers with Rayan Group across the UAE and India. Submit your CV to our global talent pool.',
  activePath: '/careers/',
  heroHtml: renderPageHero({
    category: 'PEOPLE & CULTURE',
    title: 'BUILD YOUR FUTURE WITH US',
    description: 'Join a dynamic, multinational engineering conglomerate executing high-impact infrastructure, energy, and civil contracting projects across the UAE and South Asia.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Careers', href: '/careers/' }],
    bgImage: '/assets/images/careers/careers-hero.jpg'
  }),
  content: `
  <!-- Why Work With Rayan (EthosEnergy / Khansaheb Pattern) -->
  <section class="section" id="why-rayan" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; margin-bottom: 5rem;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">OUR PEOPLE PHILOSOPHY</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 800; color: #fff; margin: 0.5rem 0 1.25rem;">EMPOWERING ENGINEERING EXCELLENCE</h2>
          <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.25rem;">
            At Rayan Group, our professionals are the driving engine behind our landmark achievements. From high-specification luxury renovations and defensive installations to South Asia regional fabrication and critical energy piping, we foster an environment of technical rigor, integrity, and meritocratic growth.
          </p>
          <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.65;">
            Operating across dual strategic hubs in the UAE and India, we provide our engineers and specialists with exposure to cutting-edge methodologies, heavy machinery fleets, and world-class safety protocols.
          </p>
        </div>
        <div>
          <img src="/assets/images/careers/engineering-team.jpg" alt="Rayan Group Engineering Team" style="width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        </div>
      </div>

      <!-- Core Employee Pillars -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 5rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🛡️</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Zero-Harm Safety Culture</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Our triple ISO certification (9001/14001/45001) guarantees that safety is non-negotiable. Every team member has the authority to stop unsafe work.</p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🌐</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Dual-Hub International Mobility</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Collaborate seamlessly across our Abu Dhabi headquarters, Dubai projects, and Ashaz Engineering fabrication facilities in South Asia.</p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🏗️</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Signature Project Experience</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Deliver landmark assignments alongside tier-one clients including Brock Construction, Emaar, Hilton, Al Wahda, and defense authorities.</p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">📈</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Professional Development</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Continuous technical training, leadership advancement pathways, and international industry credentials support.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Operating Departments (EthosEnergy Pattern) -->
  <section class="section" id="departments" style="padding: 5rem 0; background: #07111e; border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 700px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">ORGANIZATIONAL DISCIPLINES</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.5rem); font-weight: 800; color: #fff; margin-top: 0.35rem;">OUR OPERATING DEPARTMENTS</h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          Rayan Group deploys specialized multi-disciplinary teams across five core divisions and supporting corporate services.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.75rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin-bottom: 0.5rem;">1. Civil &amp; Structural Engineering</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Turnkey commercial high-rise construction, luxury residential fit-out, MEP integration, and structural renovations.</p>
          <span style="font-size: 0.75rem; color: #0099e6; font-weight: 600;">Hubs: Abu Dhabi, Dubai, India</span>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin-bottom: 0.5rem;">2. Ashaz Engineering Regional Hub</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Heavy structural steel fabrication, industrial workshops, and South Asia regional EPC contracting.</p>
          <span style="font-size: 0.75rem; color: #0099e6; font-weight: 600;">Hubs: Bettiah, Bihar &amp; New Delhi, India</span>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin-bottom: 0.5rem;">3. Energy &amp; Industrial EPC</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Hydrocarbon storage terminal works, process piping, pressure vessel installation, and substation electrical works.</p>
          <span style="font-size: 0.75rem; color: #0099e6; font-weight: 600;">Hubs: Abu Dhabi &amp; India Regional</span>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin-bottom: 0.5rem;">4. Heavy Infrastructure &amp; Earthworks</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Highway corridor excavation, subgrade stabilization, stormwater drainage, and large-scale site development.</p>
          <span style="font-size: 0.75rem; color: #0099e6; font-weight: 600;">Hubs: Abu Dhabi &amp; Northern Emirates</span>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin-bottom: 0.5rem;">5. Heavy Fleet &amp; Rigging Logistics</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Heavy crawler crane coordination, multi-axle hydraulic transport, plant maintenance, and logistics fleet control.</p>
          <span style="font-size: 0.75rem; color: #0099e6; font-weight: 600;">Hubs: Mussafah Industrial Yard &amp; India</span>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin-bottom: 0.5rem;">6. QHSE, Estimating &amp; Commercial</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Quality assurance audits, environmental compliance, commercial estimating, quantity surveying, and contract law.</p>
          <span style="font-size: 0.75rem; color: #0099e6; font-weight: 600;">Hubs: Abu Dhabi HQ</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Job Application & Talent Pool Form (Khansaheb / EthosEnergy Pattern) -->
  <section class="section" id="apply" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 3.5rem;" class="intro-grid-responsive">
        
        <!-- Application Form -->
        <div>
          <div style="margin-bottom: 2rem;">
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">GENERAL RECRUITMENT &amp; TALENT POOL</span>
            <h2 style="font-family: var(--font-heading); font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; color: #fff; margin-top: 0.35rem;">SUBMIT YOUR CV / APPLICATION</h2>
            <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
              Whether applying for active openings or joining our ongoing talent database, submit your credentials below. Our talent acquisition team reviews all engineering dossiers.
            </p>
          </div>

          <div class="service-form-card">
            <form id="careerForm">
              
              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="car-name">Full Legal Name <span class="req">*</span></label>
                  <input type="text" id="car-name" name="candidateName" class="service-form-input" required placeholder="e.g. Rahul Sharma / Omar Khalid">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="car-email">Email Address <span class="req">*</span></label>
                  <input type="email" id="car-email" name="candidateEmail" class="service-form-input" required placeholder="name@email.com">
                </div>
              </div>

              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="car-phone">Phone / WhatsApp Number <span class="req">*</span></label>
                  <input type="tel" id="car-phone" name="phoneNumber" class="service-form-input" required placeholder="+971 50 123 4567">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="car-location">Current Residence / Location <span class="req">*</span></label>
                  <input type="text" id="car-location" name="currentLocation" class="service-form-input" required placeholder="e.g. Abu Dhabi, Dubai, India">
                </div>
              </div>

              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="car-dept">Target Department / Discipline <span class="req">*</span></label>
                  <select id="car-dept" name="targetDiscipline" class="service-form-select" required>
                    <option value="" disabled selected>Select Discipline</option>
                    <option value="Civil & Structural Engineering">Civil &amp; Structural Engineering</option>
                    <option value="Ashaz Engineering (India Hub)">Ashaz Engineering (India Hub)</option>
                    <option value="Energy, Piping & Process EPC">Energy, Piping &amp; Process EPC</option>
                    <option value="Highway & Civil Infrastructure">Highway &amp; Heavy Civil Infrastructure</option>
                    <option value="Heavy Fleet & Logistics">Heavy Fleet &amp; Crane Operations</option>
                    <option value="QHSE & Environmental Safety">QHSE &amp; Environmental Safety</option>
                    <option value="Commercial & Estimating">Commercial, Estimating &amp; Quantity Surveying</option>
                    <option value="Finance & Administration">Finance, HR &amp; Corporate Administration</option>
                  </select>
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="car-exp">Total Years of Experience <span class="req">*</span></label>
                  <select id="car-exp" name="experienceLevel" class="service-form-select" required>
                    <option value="" disabled selected>Select Experience Range</option>
                    <option value="0 - 2 Years (Entry Level)">Entry Level / Graduate (0 - 2 Years)</option>
                    <option value="3 - 7 Years (Mid-Level)">Mid-Level Professional (3 - 7 Years)</option>
                    <option value="8 - 12 Years (Senior Specialist)">Senior Engineer / Specialist (8 - 12 Years)</option>
                    <option value="13+ Years (Project Director)">Project Director / Management (13+ Years)</option>
                  </select>
                </div>
              </div>

              <div class="service-form-group" style="margin-bottom: 1.5rem;">
                <label class="service-form-label" for="car-notes">Cover Note / Key Projects Handled</label>
                <textarea id="car-notes" name="coverNote" class="service-form-textarea" rows="3" placeholder="Briefly highlight your technical specialties, key past projects, software proficiencies, or availability timeline..."></textarea>
              </div>

              <!-- CV / Resume Upload Dropzone -->
              <div class="service-form-group" style="margin-bottom: 2rem;">
                <label class="service-form-label">Upload CV / Resume (PDF / DOCX) <span class="req">*</span></label>
                <div class="file-dropzone" onclick="document.getElementById('car-file').click();">
                  <input type="file" id="car-file" name="resumeFile" style="display: none;" required onchange="const list = document.getElementById('car-file-name'); list.textContent = this.files.length ? this.files[0].name : '';">
                  <div class="file-dropzone-icon">📄</div>
                  <div class="file-dropzone-title">Upload Your Resume / CV</div>
                  <div class="file-dropzone-desc">Accepted formats: PDF, DOCX (Up to 15MB)</div>
                  <div id="car-file-name" class="file-dropzone-selected"></div>
                </div>
              </div>

              <button type="submit" class="btn-enterprise-primary" style="padding: 1rem 2.25rem; font-size: 0.95rem; font-weight: 800;">
                <span>SUBMIT APPLICATION TO TALENT POOL</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </form>
          </div>
        </div>

        <!-- Sample Requisitions & Recruitment Notice -->
        <div>
          <!-- Sample Opportunities Notice -->
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase; letter-spacing: 0.1em;">REPRESENTATIVE DISCIPLINES</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: #fff; margin: 0.5rem 0 1rem;">SAMPLE REQUISITIONS</h3>
            
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">
              We regularly onboard specialized talent across the following roles as project pipelines expand:
            </p>

            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem; color: #cbd5e1;">
              <li style="border-left: 2px solid #0099e6; padding-left: 0.65rem;">
                <strong style="color: #fff; display: block;">Senior Project Engineer (Civil &amp; Fit-Out)</strong>
                <span style="color: #94a3b8; font-size: 0.78rem;">Abu Dhabi • Commercial &amp; Hospitality Projects</span>
              </li>
              <li style="border-left: 2px solid #10b981; padding-left: 0.65rem;">
                <strong style="color: #fff; display: block;">Senior Structural Steel / Fabrication Engineer</strong>
                <span style="color: #94a3b8; font-size: 0.78rem;">India &amp; UAE • Ashaz Regional Hub</span>
              </li>
              <li style="border-left: 2px solid #f59e0b; padding-left: 0.65rem;">
                <strong style="color: #fff; display: block;">Energy Piping &amp; Quality Inspector</strong>
                <span style="color: #94a3b8; font-size: 0.78rem;">India &amp; UAE Hubs • ASME / API Standards</span>
              </li>
              <li style="border-left: 2px solid #0099e6; padding-left: 0.65rem;">
                <strong style="color: #fff; display: block;">HSE Officer (ISO 45001 / NEBOSH)</strong>
                <span style="color: #94a3b8; font-size: 0.78rem;">Abu Dhabi &amp; Dubai • Zero-Harm Enforcement</span>
              </li>
            </ul>
          </div>

          <!-- Recruitment Fraud Warning -->
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em;">RECRUITMENT INTEGRITY</span>
            <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; margin: 0.5rem 0 0.75rem;">OFFICIAL RECRUITMENT ONLY</h4>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1rem;">
              Rayan Group never charges fees or demands security deposits at any stage of the recruitment process. All official communications originate strictly from <span style="color: #0099e6;">@rayan-group.com</span>.
            </p>
            <div style="font-size: 0.8rem; color: #94a3b8;">
              Recruitment Enquiries:<br>
              <a href="mailto:recruitment@rayan-group.com" style="color: #0099e6; font-weight: 600; text-decoration: none;">recruitment@rayan-group.com</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 3. NEWSROOM (/news/index.html)
// ============================================================================
createRoute('news/index.html', {
  title: 'Corporate Newsroom & Project Announcements',
  description: 'Stay updated with Rayan Group corporate news, contract awards, infrastructure project completions, and QHSE milestones.',
  activePath: '/news/',
  heroHtml: renderPageHero({
    category: 'MEDIA & COMMUNICATIONS',
    title: 'CORPORATE NEWSROOM',
    description: 'Official announcements, landmark contract awards, infrastructure project milestones, and corporate developments across the UAE and South Asia.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Newsroom', href: '/news/' }],
    bgImage: '/assets/images/news/news-hero.jpg'
  }),
  content: `
  <!-- LIVE NEWS WIRE / TICKER STRIP -->
  <div style="background: #06111f; border-bottom: 1px solid rgba(0, 199, 179, 0.2); padding: 0.75rem 0; font-size: 0.8rem; overflow: hidden; position: relative;">
    <div class="container" style="display: flex; align-items: center; gap: 1rem;">
      <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(0, 199, 179, 0.15); color: #00c7b3; padding: 0.25rem 0.65rem; border-radius: 4px; font-weight: 800; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; border: 1px solid rgba(0, 199, 179, 0.35);">
        <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #00c7b3; box-shadow: 0 0 8px #00c7b3; animation: pulseDot 1.5s infinite;"></span>
        LATEST WIRE
      </div>
      <div style="overflow: hidden; white-space: nowrap; flex: 1;">
        <div class="news-wire-marquee" style="display: inline-block; color: #cbd5e1;">
          <span style="margin-right: 2.5rem;"><strong style="color: #fff;">[OCT 2026]</strong> Rayan Group Awarded Turnkey Commercial EPC &amp; Infrastructure Works in Abu Dhabi</span>
          <span style="margin-right: 2.5rem;"><strong style="color: #fff;">[AUG 2026]</strong> Govt. of India Officially Awards Registered Trade Mark No. 6580565 Under Class 37 Construction</span>
          <span style="margin-right: 2.5rem;"><strong style="color: #fff;">[JAN 2026]</strong> Triple ISO 9001 / 14001 / 45001 Global Accreditations Renewed With Zero Non-Conformances</span>
          <span style="margin-right: 2.5rem;"><strong style="color: #fff;">[NOV 2025]</strong> Successful Handover of Waldorf Astoria Luxury Hospitality Overhaul in Ras Al Khaimah</span>
          <span style="margin-right: 2.5rem;"><strong style="color: #fff;">[SEP 2025]</strong> Ashaz Engineering Scales Automated Structural Steel Fabrication Capacity in South Asia Hub</span>
        </div>
      </div>
    </div>
  </div>

  <section class="section" style="padding: 4.5rem 0; background: var(--bg-dark);">
    <div class="container">

      <!-- FEATURED HEADLINE STORY (SPOTLIGHT) -->
      <div style="margin-bottom: 4.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <span style="font-size: 0.75rem; font-weight: 700; color: #00c7b3; letter-spacing: 0.14em; text-transform: uppercase; display: block;">EDITORIAL SPOTLIGHT</span>
            <h2 style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #fff; margin: 0.2rem 0 0;">TOP HEADLINE STORY</h2>
          </div>
          <span style="font-size: 0.75rem; color: #94a3b8; background: rgba(255,255,255,0.04); padding: 0.35rem 0.85rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">OFFICIAL COMMUNIQUÉ</span>
        </div>

        <article style="background: linear-gradient(135deg, #0c1828 0%, #071322 100%); border: 1px solid rgba(0, 199, 179, 0.3); border-radius: 16px; overflow: hidden; display: grid; grid-template-columns: 1.15fr 1fr; box-shadow: 0 20px 50px rgba(0,0,0,0.5);" class="featured-story-grid">
          <div style="position: relative; min-height: 340px; overflow: hidden;">
            <img src="/assets/images/news/contract-signing.jpg" alt="Rayan Group Landmark EPC Signing" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="featured-story-img">
            <div style="position: absolute; top: 1.25rem; left: 1.25rem; background: rgba(7, 17, 30, 0.85); backdrop-filter: blur(8px); padding: 0.35rem 0.85rem; border-radius: 6px; border: 1px solid rgba(0, 199, 179, 0.4); font-size: 0.72rem; font-weight: 800; color: #00c7b3;">
              FEATURED RELEASE &bull; ABU DHABI
            </div>
          </div>
          <div style="padding: clamp(2rem, 3.5vw, 3.5rem); display: flex; flex-direction: column; justify-content: center;">
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; font-size: 0.78rem;">
              <span style="font-weight: 800; color: #0099e6; text-transform: uppercase; letter-spacing: 0.06em;">CONTRACT AWARD</span>
              <span style="color: #64748b;">&bull;</span>
              <span style="color: #94a3b8;">OCTOBER 2026</span>
              <span style="color: #64748b;">&bull;</span>
              <span style="color: #94a3b8;">4 MIN READ</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: clamp(1.4rem, 2.2vw, 2rem); font-weight: 800; color: #fff; line-height: 1.25; margin-bottom: 1rem;">
              Rayan Group Awarded Major Turnkey Commercial &amp; Infrastructure EPC Works in Abu Dhabi
            </h3>
            <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.75rem;">
              Rayan Group has been awarded a flagship multi-discipline turnkey EPC contract encompassing structural civil works, heavy structural framing, and high-precision MEP systems for landmark commercial and mixed-use infrastructure developments in Abu Dhabi. Mobilization adheres strictly to ISO 45001 safety mandates and Estidama Pearl environmental guidelines.
            </p>
            <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
              <a href="/news/rayan-group-expands-offshore-portfolio/" class="btn-enterprise-primary" style="background: #00c7b3; border-color: #00c7b3;">
                READ FULL RELEASE →
              </a>
              <button type="button" onclick="openNewsModal('article-1')" class="btn-enterprise-secondary" style="border-color: rgba(255,255,255,0.2); color: #e2e8f0;">
                QUICK SUMMARY 📄
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- FILTER TABS & INSTANT SEARCH BAR -->
      <div style="background: #091424; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.25rem 1.75rem; margin-bottom: 3rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;" id="news-filter-tabs">
          <button type="button" class="news-tab-btn active" data-filter="all">All Announcements (8)</button>
          <button type="button" class="news-tab-btn" data-filter="contracts">Contract Awards (2)</button>
          <button type="button" class="news-tab-btn" data-filter="handover">Project Handover (2)</button>
          <button type="button" class="news-tab-btn" data-filter="corporate">Corporate &amp; Legal (2)</button>
          <button type="button" class="news-tab-btn" data-filter="qhse">QHSE &amp; Safety (1)</button>
          <button type="button" class="news-tab-btn" data-filter="regional">Regional Hubs (1)</button>
        </div>
        <div style="min-width: 260px; position: relative;">
          <input type="text" id="news-search-input" placeholder="Search news, contracts, keywords..." style="width: 100%; background: #06101c; border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 0.65rem 1rem 0.65rem 2.25rem; border-radius: 8px; font-size: 0.85rem; outline: none; transition: border-color 0.2s ease;">
          <svg style="position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: #94a3b8;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
        </div>
      </div>

      <!-- 8 EXPANDED RICH NEWS ARTICLES GRID -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 2.25rem; margin-bottom: 5rem;" id="news-grid-container">
        
        <!-- Article 1: Contract Award -->
        <article class="news-card-item" data-category="contracts" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s ease, border-color 0.3s ease;">
          <div style="height: 220px; overflow: hidden; position: relative;">
            <img src="/assets/images/news/contract-signing.jpg" alt="Commercial EPC Award" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; bottom: 0.75rem; left: 0.75rem; background: rgba(7, 17, 30, 0.85); backdrop-filter: blur(6px); font-size: 0.7rem; font-weight: 700; color: #0099e6; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid rgba(0, 153, 230, 0.3);">
              ABU DHABI HQ
            </span>
          </div>
          <div style="padding: 1.75rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">CONTRACT AWARD</span>
              <span style="color: #64748b;">&bull;</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">OCTOBER 2026</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 0.85rem;">
              Rayan Group Awarded Major Turnkey Commercial &amp; Infrastructure EPC Works
            </h3>
            <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Turnkey civil construction, MEP integration, and advanced structural execution for landmark developments in Abu Dhabi.
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem; margin-top: auto;">
              <a href="/news/rayan-group-expands-offshore-portfolio/" style="color: #0099e6; font-size: 0.825rem; font-weight: 700; text-decoration: none;">READ FULL RELEASE →</a>
              <span style="font-size: 0.75rem; color: #64748b;">3 min read</span>
            </div>
          </div>
        </article>

        <!-- Article 2: India Registered Trademark Awarded -->
        <article class="news-card-item" data-category="corporate" style="background: #0c1828; border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s ease, border-color 0.3s ease;">
          <div style="height: 220px; overflow: hidden; position: relative;">
            <img src="/assets/images/news/ashaz-expansion.jpg" alt="India Trademark Sealed" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; bottom: 0.75rem; left: 0.75rem; background: rgba(7, 17, 30, 0.85); backdrop-filter: blur(6px); font-size: 0.7rem; font-weight: 700; color: #38bdf8; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.3);">
              GOVT. OF INDIA TRADEMARK
            </span>
          </div>
          <div style="padding: 1.75rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">CORPORATE &amp; LEGAL</span>
              <span style="color: #64748b;">&bull;</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">AUGUST 2026</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 0.85rem;">
              Rayan Group (India) Officially Awarded Registered Trade Mark No. 6580565 Under Class 37
            </h3>
            <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Certificate of Registration sealed by Trade Marks Registry, Mumbai, establishing protected intellectual property across construction contracting and civil engineering services.
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem; margin-top: auto;">
              <button type="button" onclick="openNewsModal('article-2')" style="background: none; border: none; padding: 0; color: #38bdf8; font-size: 0.825rem; font-weight: 700; cursor: pointer;">VIEW OFFICIAL NOTICE →</button>
              <span style="font-size: 0.75rem; color: #64748b;">4 min read</span>
            </div>
          </div>
        </article>

        <!-- Article 3: Project Handover (Waldorf Astoria) -->
        <article class="news-card-item" data-category="handover" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s ease, border-color 0.3s ease;">
          <div style="height: 220px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/waldorf-astoria-renovation-rak.jpg" alt="Waldorf Astoria Overhaul" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; bottom: 0.75rem; left: 0.75rem; background: rgba(7, 17, 30, 0.85); backdrop-filter: blur(6px); font-size: 0.7rem; font-weight: 700; color: #10b981; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">
              HOSPITALITY FIT-OUT
            </span>
          </div>
          <div style="padding: 1.75rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase;">PROJECT HANDOVER</span>
              <span style="color: #64748b;">&bull;</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">NOVEMBER 2025</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 0.85rem;">
              Successful Handover: Waldorf Astoria Luxury Hospitality Overhaul in RAK
            </h3>
            <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Full-scope interior fit-out, acoustic MEP reconfiguration, and luxury guestroom modernization delivered in partnership with Brock Construction.
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem; margin-top: auto;">
              <a href="/projects/waldorf-astoria-renovation-rak/" style="color: #10b981; font-size: 0.825rem; font-weight: 700; text-decoration: none;">VIEW CASE STUDY →</a>
              <span style="font-size: 0.75rem; color: #64748b;">5 min read</span>
            </div>
          </div>
        </article>

        <!-- Article 4: Triple ISO Accreditation -->
        <article class="news-card-item" data-category="qhse" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s ease, border-color 0.3s ease;">
          <div style="height: 220px; overflow: hidden; position: relative;">
            <img src="/assets/images/sustainability/iso-45001.jpg" alt="Triple ISO Accreditation" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; bottom: 0.75rem; left: 0.75rem; background: rgba(7, 17, 30, 0.85); backdrop-filter: blur(6px); font-size: 0.7rem; font-weight: 700; color: #00c7b3; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid rgba(0, 199, 179, 0.3);">
              TRIPLE ACCREDITATION
            </span>
          </div>
          <div style="padding: 1.75rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #00c7b3; text-transform: uppercase;">QHSE AUDIT</span>
              <span style="color: #64748b;">&bull;</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">JANUARY 2026</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 0.85rem;">
              Rayan Group Successfully Renews Global Triple ISO Quality &amp; Safety Certifications
            </h3>
            <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Achieving full compliance across ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 audits across all construction yards and regional engineering hubs.
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem; margin-top: auto;">
              <a href="/sustainability/" style="color: #00c7b3; font-size: 0.825rem; font-weight: 700; text-decoration: none;">VIEW HSE POLICY →</a>
              <span style="font-size: 0.75rem; color: #64748b;">3 min read</span>
            </div>
          </div>
        </article>

        <!-- Article 5: Ashaz Engineering Steel Fabrication -->
        <article class="news-card-item" data-category="regional" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s ease, border-color 0.3s ease;">
          <div style="height: 220px; overflow: hidden; position: relative;">
            <img src="/assets/images/business/01-engineering.jpg" alt="Ashaz Steel Fabrication" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; bottom: 0.75rem; left: 0.75rem; background: rgba(7, 17, 30, 0.85); backdrop-filter: blur(6px); font-size: 0.7rem; font-weight: 700; color: #00c7b3; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid rgba(0, 199, 179, 0.3);">
              SOUTH ASIA HUB
            </span>
          </div>
          <div style="padding: 1.75rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #00c7b3; text-transform: uppercase;">REGIONAL EXPANSION</span>
              <span style="color: #64748b;">&bull;</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">SEPTEMBER 2025</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 0.85rem;">
              Ashaz Engineering Expands Heavy Structural Steel Fabrication Facilities
            </h3>
            <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Commissioning advanced CNC profiling, automated submerged arc welding lines, and pre-engineered building fabrication capacity in Bettiah (Bihar) and New Delhi.
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem; margin-top: auto;">
              <a href="/business/ashaz/" style="color: #00c7b3; font-size: 0.825rem; font-weight: 700; text-decoration: none;">EXPLORE ASHAZ HUB →</a>
              <span style="font-size: 0.75rem; color: #64748b;">4 min read</span>
            </div>
          </div>
        </article>

        <!-- Article 6: Energy Substation EPC -->
        <article class="news-card-item" data-category="contracts" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s ease, border-color 0.3s ease;">
          <div style="height: 220px; overflow: hidden; position: relative;">
            <img src="/assets/images/business/04-energy.jpg" alt="Rayan Energy Substation" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; bottom: 0.75rem; left: 0.75rem; background: rgba(7, 17, 30, 0.85); backdrop-filter: blur(6px); font-size: 0.7rem; font-weight: 700; color: #10b981; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">
              POWER INFRASTRUCTURE
            </span>
          </div>
          <div style="padding: 1.75rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase;">ENERGY EPC</span>
              <span style="color: #64748b;">&bull;</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">JULY 2025</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 0.85rem;">
              Rayan Energy Delivers High-Precision Substation &amp; Industrial Piping Infrastructure
            </h3>
            <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Executing turnkey high-voltage transmission, automated substation switchgear, and process pipeline works delivered to stringent international safety standards.
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem; margin-top: auto;">
              <a href="/business/energy/" style="color: #10b981; font-size: 0.825rem; font-weight: 700; text-decoration: none;">EXPLORE ENERGY DIVISION →</a>
              <span style="font-size: 0.75rem; color: #64748b;">4 min read</span>
            </div>
          </div>
        </article>

        <!-- Article 7: Interior Design Launch -->
        <article class="news-card-item" data-category="handover" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s ease, border-color 0.3s ease;">
          <div style="height: 220px; overflow: hidden; position: relative;">
            <img src="/assets/images/business/07-interiors.jpg" alt="Interior Fit-Out Launch" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; bottom: 0.75rem; left: 0.75rem; background: rgba(7, 17, 30, 0.85); backdrop-filter: blur(6px); font-size: 0.7rem; font-weight: 700; color: #00c7b3; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid rgba(0, 199, 179, 0.3);">
              DUBAI DESIGN HUB
            </span>
          </div>
          <div style="padding: 1.75rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #00c7b3; text-transform: uppercase;">EXPANDED DIVISION</span>
              <span style="color: #64748b;">&bull;</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">MARCH 2026</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 0.85rem;">
              Rayan Group Introduces Turnkey Interior Design &amp; Architectural Fit-Out Division
            </h3>
            <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Providing luxury residential interior styling, bespoke corporate workspace design, space planning, and turnkey joinery contracting across Dubai and Abu Dhabi.
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem; margin-top: auto;">
              <a href="/services/#interior-work" style="color: #00c7b3; font-size: 0.825rem; font-weight: 700; text-decoration: none;">EXPLORE INTERIOR SERVICES →</a>
              <span style="font-size: 0.75rem; color: #64748b;">3 min read</span>
            </div>
          </div>
        </article>

        <!-- Article 8: Facilities Management Nationwide Expansion -->
        <article class="news-card-item" data-category="corporate" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s ease, border-color 0.3s ease;">
          <div style="height: 220px; overflow: hidden; position: relative;">
            <img src="/assets/images/business/06-mep.jpg" alt="Facilities Management Expansion" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; bottom: 0.75rem; left: 0.75rem; background: rgba(7, 17, 30, 0.85); backdrop-filter: blur(6px); font-size: 0.7rem; font-weight: 700; color: #0099e6; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid rgba(0, 153, 230, 0.3);">
              UAE NATIONWIDE
            </span>
          </div>
          <div style="padding: 1.75rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">FACILITIES SERVICES</span>
              <span style="color: #64748b;">&bull;</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">APRIL 2026</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 0.85rem;">
              Rayan Group Announces 24/7 Total Facilities Management &amp; Preventive AMC Packages
            </h3>
            <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Full-spectrum HVAC duct cleaning, electrical maintenance, plumbing overhauls, and annual preventive servicing contracts for commercial and residential estates.
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem; margin-top: auto;">
              <a href="/services/#facilities-management" style="color: #0099e6; font-size: 0.825rem; font-weight: 700; text-decoration: none;">VIEW FM SERVICES →</a>
              <span style="font-size: 0.75rem; color: #64748b;">3 min read</span>
            </div>
          </div>
        </article>

      </div>

      <!-- CORPORATE MEDIA ASSETS & PRESS KIT HUB -->
      <div style="margin-bottom: 4.5rem; background: linear-gradient(135deg, #091726 0%, #06111f 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: clamp(2rem, 4vw, 3rem);">
        <div style="text-align: center; max-width: 720px; margin: 0 auto 2.5rem;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #00c7b3; letter-spacing: 0.14em; text-transform: uppercase;">MEDIA RESOURCES</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(1.8rem, 2.5vw, 2.4rem); font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.35rem 0 0.5rem;">
            CORPORATE PRESS KIT &amp; BRAND ASSETS
          </h2>
          <p style="color: #94a3b8; font-size: 0.95rem; margin: 0; line-height: 1.6;">
            Accredited journalists, partners, and media organizations may download verified corporate documentation, high-resolution logos, and executive materials.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
          <!-- Kit 1 -->
          <div class="press-kit-box" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column;">
            <div style="width: 44px; height: 44px; border-radius: 8px; background: rgba(0, 153, 230, 0.15); color: #0099e6; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: 1rem;">
              📁
            </div>
            <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0 0 0.4rem;">Official Logo Pack</h4>
            <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0 0 1.25rem; flex: 1;">Vector SVG, transparent PNG, light and dark variations with brand guidelines.</p>
            <a href="/assets/logos/rayan-group.png" download class="btn-kit-download">DOWNLOAD (ZIP/PNG) ↓</a>
          </div>

          <!-- Kit 2 -->
          <div class="press-kit-box" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column;">
            <div style="width: 44px; height: 44px; border-radius: 8px; background: rgba(0, 199, 179, 0.15); color: #00c7b3; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: 1rem;">
              📄
            </div>
            <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0 0 0.4rem;">Group Factsheet 2026</h4>
            <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0 0 1.25rem; flex: 1;">Key operational metrics, dual-hub footprint, entity overviews, and milestone timeline.</p>
            <button type="button" onclick="downloadFactsheetNotice()" class="btn-kit-download">DOWNLOAD FACTSHEET ↓</button>
          </div>

          <!-- Kit 3 -->
          <div class="press-kit-box" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column;">
            <div style="width: 44px; height: 44px; border-radius: 8px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: 1rem;">
              🛡️
            </div>
            <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0 0 0.4rem;">Accreditations &amp; IP</h4>
            <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0 0 1.25rem; flex: 1;">Triple ISO 9001/14001/45001 certificates &amp; Govt. of India Trademark No. 6580565.</p>
            <a href="/sustainability/" class="btn-kit-download">VIEW COMPLIANCE HUB →</a>
          </div>

          <!-- Kit 4 -->
          <div class="press-kit-box" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column;">
            <div style="width: 44px; height: 44px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: 1rem;">
              📸
            </div>
            <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0 0 0.4rem;">Leadership Portraits</h4>
            <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0 0 1.25rem; flex: 1;">High-resolution executive photography, official executive bios, and governance credentials.</p>
            <a href="/leadership/" class="btn-kit-download">VIEW GOVERNANCE →</a>
          </div>
        </div>
      </div>

      <!-- DUAL-HUB MEDIA INQUIRIES & PR CONTACT DESKS -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; margin-bottom: 4rem;" class="media-contact-grid">
        <!-- UAE Desk -->
        <div style="background: #0c1828; border: 1px solid rgba(0, 153, 230, 0.3); border-radius: 12px; padding: 2.25rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
            <span style="font-size: 1.35rem;">🇦🇪</span>
            <div>
              <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">UAE CORPORATE HEADQUARTERS</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0;">MEDIA RELATIONS DESK</h3>
            </div>
          </div>
          <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.25rem;">
            Inquiries regarding GCC turnkey EPC contract awards, tender milestones, and executive interview availability.
          </p>
          <div style="font-size: 0.85rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
            <div>📍 Plot No. 42, Mussafah M-36, Abu Dhabi, UAE</div>
            <div>✉️ <a href="mailto:media@rayan-group.com" style="color: #0099e6; text-decoration: none; font-weight: 600;">media@rayan-group.com</a> &bull; <a href="mailto:rayan@rayan-group.com" style="color: #0099e6; text-decoration: none;">rayan@rayan-group.com</a></div>
            <div>📞 +971-25654497</div>
          </div>
          <a href="mailto:media@rayan-group.com" class="btn-enterprise-primary" style="background: #0099e6; border-color: #0099e6;">CONTACT UAE PR DESK →</a>
        </div>

        <!-- India Hub Desk -->
        <div style="background: #0c1828; border: 1px solid rgba(0, 199, 179, 0.3); border-radius: 12px; padding: 2.25rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
            <span style="font-size: 1.35rem;">🇮🇳</span>
            <div>
              <span style="font-size: 0.72rem; font-weight: 700; color: #00c7b3; text-transform: uppercase;">SOUTH ASIA REGIONAL HUB</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0;">ASHAZ COMMUNICATIONS DESK</h3>
            </div>
          </div>
          <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.25rem;">
            Inquiries regarding South Asia fabrication infrastructure, India tenders, and regional media syndication.
          </p>
          <div style="font-size: 0.85rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
            <div>📍 Bettiah, West Champaran, Bihar - 845438 &amp; New Delhi, India</div>
            <div>✉️ <a href="mailto:ashaz@rayan-group.com" style="color: #00c7b3; text-decoration: none; font-weight: 600;">ashaz@rayan-group.com</a></div>
            <div>📞 +91-9973086910</div>
          </div>
          <a href="mailto:ashaz@rayan-group.com" class="btn-enterprise-primary" style="background: #00c7b3; border-color: #00c7b3;">CONTACT INDIA PR DESK →</a>
        </div>
      </div>

      <!-- PRESS WIRE SUBSCRIPTION STRIP -->
      <div style="background: #081220; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2.5rem; text-align: center; max-width: 820px; margin: 0 auto;">
        <span style="font-size: 0.72rem; font-weight: 700; color: #00c7b3; letter-spacing: 0.12em; text-transform: uppercase;">DIRECT SYNDICATION</span>
        <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.5rem;">
          SUBSCRIBE TO CORPORATE PRESS ALERTS
        </h3>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem;">
          Receive official press communiqués, quarterly corporate updates, and landmark EPC contract notifications directly to your corporate inbox.
        </p>
        <form onsubmit="handlePressSubscribe(event)" style="display: flex; gap: 0.75rem; max-width: 520px; margin: 0 auto; flex-wrap: wrap; justify-content: center;">
          <input type="email" id="press-subscriber-email" required placeholder="Enter corporate email address..." style="flex: 1; min-width: 240px; background: #0c1828; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; padding: 0.75rem 1rem; font-size: 0.88rem; outline: none;">
          <button type="submit" class="btn-enterprise-primary" style="background: #00c7b3; border-color: #00c7b3; white-space: nowrap;">
            JOIN PRESS WIRE
          </button>
        </form>
        <div id="press-subscribe-msg" style="display: none; margin-top: 1rem; font-size: 0.85rem; color: #10b981;">
          ✓ Successfully subscribed to Rayan Group Official Press Wire.
        </div>
      </div>

    </div>
  </section>

  <!-- INTERACTIVE NEWS SUMMARY MODAL -->
  <div id="news-summary-modal" style="display: none; position: fixed; inset: 0; z-index: 9999; background: rgba(3, 8, 16, 0.85); backdrop-filter: blur(8px); align-items: center; justify-content: center; padding: 1.5rem;" onclick="if(event.target===this)closeNewsModal()">
    <div style="background: #0c1828; border: 1px solid rgba(0, 199, 179, 0.4); border-radius: 16px; max-width: 720px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2.5rem; position: relative; box-shadow: 0 25px 60px rgba(0,0,0,0.7);">
      <button type="button" onclick="closeNewsModal()" style="position: absolute; top: 1.25rem; right: 1.25rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); width: 36px; height: 36px; border-radius: 50%; color: #fff; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
      <div id="modal-content-body">
        <!-- Injected via Javascript -->
      </div>
    </div>
  </div>

  <style>
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .news-tab-btn {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: #94a3b8;
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .news-tab-btn:hover {
      background: rgba(255,255,255,0.08);
      color: #fff;
    }
    .news-tab-btn.active {
      background: #00c7b3;
      border-color: #00c7b3;
      color: #07111e;
    }
    .news-card-item:hover {
      transform: translateY(-4px);
      border-color: rgba(0, 199, 179, 0.4) !important;
      box-shadow: 0 15px 35px rgba(0,0,0,0.4);
    }
    .btn-kit-download {
      display: inline-block;
      text-align: center;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.12);
      color: #e2e8f0;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      font-size: 0.76rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-kit-download:hover {
      background: rgba(0, 199, 179, 0.15);
      border-color: #00c7b3;
      color: #00c7b3;
    }
    @media (max-width: 900px) {
      .featured-story-grid {
        grid-template-columns: 1fr !important;
      }
      .media-contact-grid {
        grid-template-columns: 1fr !important;
      }
    }
  </style>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Filter Tabs Logic
      var tabs = document.querySelectorAll('.news-tab-btn');
      var cards = document.querySelectorAll('.news-card-item');
      var searchInput = document.getElementById('news-search-input');

      tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
          tabs.forEach(function(t) { t.classList.remove('active'); });
          tab.classList.add('active');
          var filter = tab.getAttribute('data-filter');
          applyFilters(filter, searchInput ? searchInput.value.toLowerCase() : '');
        });
      });

      if (searchInput) {
        searchInput.addEventListener('input', function() {
          var activeTab = document.querySelector('.news-tab-btn.active');
          var filter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
          applyFilters(filter, searchInput.value.toLowerCase());
        });
      }

      function applyFilters(category, query) {
        cards.forEach(function(card) {
          var cardCategory = card.getAttribute('data-category');
          var cardText = card.textContent.toLowerCase();
          var matchesCategory = (category === 'all' || cardCategory === category);
          var matchesQuery = !query || cardText.indexOf(query) !== -1;

          if (matchesCategory && matchesQuery) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      }
    });

    var newsModalData = {
      'article-1': {
        category: 'CONTRACT AWARD // ABU DHABI EPC',
        title: 'Rayan Group Awarded Major Turnkey Commercial & Infrastructure EPC Works in Abu Dhabi',
        body: '<p style=\"color: #cbd5e1; font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.25rem;\"><strong>ABU DHABI, UAE</strong> &mdash; Rayan Group has been awarded a flagship multi-discipline turnkey EPC contract encompassing structural civil works, heavy structural framing, and high-precision MEP systems for landmark commercial and mixed-use infrastructure developments in Abu Dhabi.</p>' +
          '<div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.85rem; margin-bottom: 1.5rem;\">' +
            '<div style=\"background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 0.9rem;\">' +
              '<div style=\"font-size: 0.7rem; font-weight: 700; color: #0099e6; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem;\">📍 Location</div>' +
              '<div style=\"font-size: 0.875rem; color: #fff; font-weight: 600;\">Abu Dhabi, United Arab Emirates</div>' +
            '</div>' +
            '<div style=\"background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 0.9rem;\">' +
              '<div style=\"font-size: 0.7rem; font-weight: 700; color: #00c7b3; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem;\">🏗️ Execution Model</div>' +
              '<div style=\"font-size: 0.875rem; color: #fff; font-weight: 600;\">Full Turnkey EPC &amp; Contracting</div>' +
            '</div>' +
            '<div style=\"background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 0.9rem;\">' +
              '<div style=\"font-size: 0.7rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem;\">🌱 Green Mandate</div>' +
              '<div style=\"font-size: 0.875rem; color: #fff; font-weight: 600;\">Estidama Pearl Sustainability Guidelines</div>' +
            '</div>' +
            '<div style=\"background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 0.9rem;\">' +
              '<div style=\"font-size: 0.7rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem;\">🛡️ QHSE Safety Mandate</div>' +
              '<div style=\"font-size: 0.875rem; color: #fff; font-weight: 600;\">Zero-Harm &bull; ISO 45001:2018 Certified</div>' +
            '</div>' +
          '</div>' +
          '<div style=\"background: #07111e; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 1.15rem 1.35rem; margin-bottom: 1.5rem;\">' +
            '<div style=\"font-size: 0.75rem; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.65rem;\">Key Scope Breakdown</div>' +
            '<ul style=\"margin: 0; padding-left: 1.15rem; color: #cbd5e1; font-size: 0.85rem; line-height: 1.65;\">' +
              '<li><strong style=\"color: #fff;\">Structural &amp; Civil Works:</strong> Deep foundation stabilization, reinforced substructures, and precast casting.</li>' +
              '<li><strong style=\"color: #fff;\">Heavy Steel Framing:</strong> Precision structural steel design, heavy fabrication, and crane erection.</li>' +
              '<li><strong style=\"color: #fff;\">Turnkey MEP &amp; HVAC:</strong> High-capacity ventilation, chillers, power distribution switchgear, and plumbing.</li>' +
              '<li><strong style=\"color: #fff;\">Life-Safety Systems:</strong> Intelligent addressable fire detection, deluge suppression, and emergency networks.</li>' +
            '</ul>' +
          '</div>' +
          '<div style=\"background: rgba(0, 199, 179, 0.06); border-left: 3px solid #00c7b3; padding: 0.9rem 1.15rem; border-radius: 0 8px 8px 0; margin-bottom: 1.5rem;\">' +
            '<p style=\"font-style: italic; color: #e2e8f0; font-size: 0.85rem; line-height: 1.6; margin: 0;\">“This landmark turnkey award demonstrates our multi-decade engineering agility, cross-border execution strength between UAE and India, and unyielding adherence to world-class safety.”</p>' +
            '<span style=\"display: block; font-size: 0.72rem; color: #00c7b3; font-weight: 700; margin-top: 0.35rem; text-transform: uppercase;\">&mdash; Executive Leadership, RAYAN Group</span>' +
          '</div>',
        link: '/news/rayan-group-expands-offshore-portfolio/',
        secondaryLink: '/business/engineering/',
        secondaryLinkText: 'VIEW EPC CAPABILITIES →'
      },
      'article-2': {
        category: 'CORPORATE & INTELLECTUAL PROPERTY // AUGUST 2026',
        title: 'Rayan Group (India) Officially Awarded Registered Trade Mark No. 6580565 Under Class 37',
        body: '<p style=\"color: #cbd5e1; line-height: 1.7; margin-bottom: 1.25rem;\"><strong>MUMBAI / NEW DELHI, INDIA</strong> &mdash; The Trade Marks Registry, Government of India, has officially issued the Certificate of Registration of Trade Mark (No. 6580565) to Rayan Group under Class 37 (Construction Services) of the Trade Marks Act, 1999.</p>' +
          '<div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.85rem; margin-bottom: 1.5rem;\">' +
            '<div style=\"background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 0.9rem;\">' +
              '<div style=\"font-size: 0.7rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem;\">📜 Certificate No.</div>' +
              '<div style=\"font-size: 0.875rem; color: #fff; font-weight: 600;\">Trade Mark No. 6580565</div>' +
            '</div>' +
            '<div style=\"background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 0.9rem;\">' +
              '<div style=\"font-size: 0.7rem; font-weight: 700; color: #00c7b3; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem;\">🏛️ Jurisdiction</div>' +
              '<div style=\"font-size: 0.875rem; color: #fff; font-weight: 600;\">Govt. of India &bull; Class 37</div>' +
            '</div>' +
          '</div>' +
          '<p style=\"color: #cbd5e1; line-height: 1.7; margin-bottom: 1.25rem;\">This seals proprietary intellectual property protection for the Group\'s expanding South Asia engineering and regional contracting operations led by Ashaz Engineering.</p>' +
          '<div style=\"background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; padding: 1rem 1.25rem; border-radius: 0 6px 6px 0; margin-bottom: 1.5rem;\"><p style=\"font-style: italic; color: #fff; margin: 0;\">“Protected branding reinforces our cross-border synergy between the UAE capital hub and South Asia regional operations.” &mdash; Mr. Arshad Alam Shaikh, Founder &amp; Chairman</p></div>',
        link: '/about/#timeline',
        secondaryLink: '/business/ashaz/',
        secondaryLinkText: 'EXPLORE ASHAZ ENGINEERING →'
      }
    };

    function openNewsModal(id) {
      var modal = document.getElementById('news-summary-modal');
      var container = document.getElementById('modal-content-body');
      var item = newsModalData[id];
      if (!modal || !container || !item) return;

      var buttonsHtml = '<div style=\"display: flex; gap: 0.85rem; align-items: center; margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.25rem; flex-wrap: wrap;\">' +
        '<a href=\"' + item.link + '\" class=\"btn-enterprise-primary\" style=\"background: #00c7b3; border-color: #00c7b3; font-size: 0.825rem; padding: 0.65rem 1.25rem;\">FULL ARTICLE PAGE →</a>';
      
      if (item.secondaryLink) {
        buttonsHtml += '<a href=\"' + item.secondaryLink + '\" class=\"btn-enterprise-secondary\" style=\"font-size: 0.825rem; padding: 0.65rem 1.25rem; border-color: rgba(0,153,230,0.4); color: #38bdf8;\">' + item.secondaryLinkText + '</a>';
      }

      buttonsHtml += '<button type=\"button\" onclick=\"closeNewsModal()\" class=\"btn-enterprise-secondary\" style=\"font-size: 0.825rem; padding: 0.65rem 1.25rem; margin-left: auto;\">CLOSE ✕</button>' +
        '</div>';

      container.innerHTML = '<span style=\"font-size: 0.72rem; font-weight: 700; color: #00c7b3; letter-spacing: 0.12em; text-transform: uppercase; display: inline-block; margin-bottom: 0.5rem;\">' + item.category + '</span>' +
        '<h2 style=\"font-family: var(--font-heading); font-size: clamp(1.25rem, 2vw, 1.6rem); font-weight: 800; color: #fff; margin: 0 0 1rem; line-height: 1.3;\">' + item.title + '</h2>' +
        item.body +
        buttonsHtml;

      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeNewsModal() {
      var modal = document.getElementById('news-summary-modal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }

    window.openNewsModal = openNewsModal;
    window.closeNewsModal = closeNewsModal;

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeNewsModal();
    });

    function downloadFactsheetNotice() {
      alert('Rayan Group Corporate Factsheet (2026 Edition): Initiating secure download.');
    }

    function handlePressSubscribe(e) {
      e.preventDefault();
      var input = document.getElementById('press-subscriber-email');
      var msg = document.getElementById('press-subscribe-msg');
      if (input && msg) {
        msg.style.display = 'block';
        input.value = '';
        setTimeout(function() {
          msg.style.display = 'none';
        }, 5000);
      }
    }
  </script>
  `
});

// ============================================================================
// 4. NEWS DETAIL ARTICLE (/news/rayan-group-expands-offshore-portfolio/index.html)
// ============================================================================
createRoute('news/rayan-group-expands-offshore-portfolio/index.html', {
  title: 'Turnkey Commercial & Infrastructure EPC Contract Award',
  description: 'Official corporate announcement regarding Rayan Group turnkey engineering, procurement and construction contracts in Abu Dhabi.',
  activePath: '/news/',
  heroHtml: renderPageHero({
    category: 'CORPORATE ANNOUNCEMENT',
    title: 'COMMERCIAL & INFRASTRUCTURE EPC AWARD',
    description: 'Securing turnkey engineering, structural execution, and civil contracting for major regional development.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'News', href: '/news/' }, { label: 'EPC Contract Award', href: '/news/rayan-group-expands-offshore-portfolio/' }],
    bgImage: '/assets/images/business/hero-1-skyline.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container" style="max-width: 900px;">
      <div style="display: flex; gap: 2rem; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.5rem; margin-bottom: 3rem;">
        <div>
          <span style="font-size: 0.75rem; color: #94a3b8; display: block;">PUBLISHED</span>
          <strong style="color: #fff; font-size: 0.9rem;">February 2025</strong>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: #94a3b8; display: block;">LOCATION</span>
          <strong style="color: #fff; font-size: 0.9rem;">Abu Dhabi, UAE</strong>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: #94a3b8; display: block;">SECTOR</span>
          <strong style="color: #0099e6; font-size: 0.9rem;">Civil Engineering &amp; EPC</strong>
        </div>
      </div>

      <div style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.8; margin-bottom: 3rem;">
        <p style="font-size: 1.2rem; font-weight: 500; color: #fff; margin-bottom: 2rem; line-height: 1.6;">
          <strong>ABU DHABI, UAE</strong> — Rayan Group, a premier multinational engineering, energy, and infrastructure conglomerate, today announced the formal award of turnkey civil engineering and structural execution works for strategic commercial and mixed-use infrastructure development in Abu Dhabi.
        </p>

        <p style="margin-bottom: 1.75rem;">
          Under the scope of the project, Rayan Engineering will execute comprehensive structural construction, advanced MEP coordination, and architectural integration. The project incorporates rigorous sustainability metrics and adheres to Estidama Pearl environmental guidelines.
        </p>

        <div style="margin: 3rem 0; padding: 2rem; background: #0c1828; border-left: 4px solid #0099e6; border-radius: 0 8px 8px 0;">
          <blockquote style="font-family: var(--font-heading); font-size: 1.25rem; font-style: italic; color: #fff; line-height: 1.5; margin: 0 0 1rem;">
            "This contract award underscores Rayan Group's proven reputation for delivering high-complexity structural engineering and turnkey project execution on accelerated schedules."
          </blockquote>
          <cite style="font-size: 0.9rem; color: #0099e6; font-weight: 700; text-transform: uppercase;">— Executive Committee, Rayan Group</cite>
        </div>

        <p style="margin-bottom: 1.75rem;">
          Mobilization on-site adheres strictly to Rayan Group's zero-harm safety standards under certified ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 procedures.
        </p>
      </div>

      <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <a href="/news/" style="color: #0099e6; font-weight: 700; text-decoration: none;">← BACK TO ALL NEWS</a>
        <a href="/proposal/" class="btn-enterprise-primary">REQUEST A PROPOSAL →</a>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 5. MEDIA / GALLERY PAGE (/media/index.html)
// ============================================================================
createRoute('media/index.html', {
  title: 'Media Gallery & Project Photography Showcase',
  description: 'Explore high-resolution photography of Rayan Group landmark infrastructure, hospitality overhauls, energy facilities, and engineering projects.',
  activePath: '/media/',
  heroHtml: renderPageHero({
    category: 'MEDIA & BRAND ASSETS',
    title: 'PROJECT PHOTOGRAPHY',
    description: 'Visual documentation of our deliveries across civil construction, luxury hospitality, coastal estates, and specialized engineering.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Media Gallery', href: '/media/' }],
    bgImage: '/assets/images/projects/yas-mall.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 2rem;">
        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/waldorf-astoria-renovation-rak.jpg" alt="Waldorf Astoria Luxury Renovation" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">5-STAR LUXURY HOSPITALITY</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Waldorf Astoria Hotel Luxury Renovation, RAK</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/palm-jumeirah-rec-estate.jpg" alt="Palm Jumeirah Luxury Estate" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase;">COASTAL RESIDENTIAL</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Palm Jumeirah Ultra-Luxury Waterfront Estate</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/c2-towers-al-bateen.jpg" alt="C2 Towers Al Bateen" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">HIGH-RISE ENGINEERING</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">C2 Towers Twin High-Rise Development, Al Bateen</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/edge-group-remaya.jpg" alt="Edge Group REMAYA" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #c5a059; text-transform: uppercase;">DEFENSE &amp; TACTICAL</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">EDGE Group - REMAYA Tactical Shooting Complex</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/luxury-island-infinity-pool.jpg" alt="Luxury Island Infinity Pool" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">AQUATIC RESORT ENGINEERING</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Luxury Island 50m Oceanfront Cantilevered Pool</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/roxy-cinema-dubai-hills-mall.jpg" alt="Roxy Cinemas Dubai Hills" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">ACOUSTIC ENGINEERING</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Roxy Cinemas VIP Auditoriums, Dubai Hills Mall</h3>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 6. CONTACT PAGE (/contact/index.html)
// ============================================================================
createRoute('contact/index.html', {
  title: 'Global Contact Directory | Headquarters & Regional Hubs',
  description: 'Connect with Rayan Group corporate headquarters in Abu Dhabi, commercial hub in Dubai, or South Asia manufacturing hub in India.',
  activePath: '/contact/',
  heroHtml: renderPageHero({
    category: 'GLOBAL COMMUNICATIONS',
    title: 'GET IN TOUCH',
    description: 'Our executive team, commercial tenders department, and regional operations are available across Abu Dhabi, Dubai, and India.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Contact', href: '/contact/' }],
    bgImage: '/assets/images/about/global-presence.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4.5rem;" class="intro-grid-responsive">
        
        <!-- Contact Info Left -->
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">HEADQUARTERS &amp; HUBS</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.5rem); font-weight: 800; color: #fff; margin: 0.5rem 0 2rem;">GLOBAL DIRECTORY</h2>

          <div style="display: flex; flex-direction: column; gap: 1.75rem;">
            <!-- Abu Dhabi HQ -->
            <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.75rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">GLOBAL CORPORATE HEADQUARTERS</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.5rem;">Abu Dhabi, United Arab Emirates</h3>
              <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 0.75rem;">
                Office No. 09, Plot No. 42, Mussafah M-36, Industrial Area, Abu Dhabi, UAE
              </p>
              <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">
                <div><strong>Telephone:</strong> +971-25654497</div>
                <div><strong>General Inquiries:</strong> <a href="mailto:rayan@rayan-group.com" style="color: #cbd5e1; text-decoration: none;">rayan@rayan-group.com</a></div>
                <div><strong>Tenders &amp; Proposals:</strong> <a href="mailto:tender@rayan-group.com" style="color: #0099e6; text-decoration: none;">tender@rayan-group.com</a></div>
              </div>
            </div>

            <!-- Dubai Operations -->
            <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.75rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase;">DUBAI REGIONAL OPERATIONS</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.5rem;">Dubai, United Arab Emirates</h3>
              <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 0.75rem;">
                Commercial Project Operations &amp; Site Offices, Dubai, UAE
              </p>
              <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">
                <div><strong>Inquiries:</strong> <a href="mailto:rayan@rayan-group.com" style="color: #cbd5e1; text-decoration: none;">rayan@rayan-group.com</a></div>
              </div>
            </div>

            <!-- India Hub -->
            <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.75rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #c5a059; text-transform: uppercase;">SOUTH ASIA ENGINEERING HUB</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.5rem;">Ashaz Engineering (India)</h3>
              <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 0.75rem;">
                Bettiah, West Champaran, Bihar - 845438, India
              </p>
              <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">
                <div><strong>Telephone / Mobile:</strong> <a href="tel:+919973086910" style="color: #0099e6; text-decoration: none; font-weight: 600;">+91-9973086910</a></div>
                <div style="margin-top: 0.25rem;"><strong>Email:</strong> <a href="mailto:ashaz@rayan-group.com" style="color: #cbd5e1; text-decoration: none;">ashaz@rayan-group.com</a></div>
              </div>
            </div>

            <!-- Official Social & Digital Media Channels -->
            <div style="background: #0c1828; border: 1px solid rgba(0, 153, 230, 0.25); border-radius: 10px; padding: 1.75rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">VERIFIED DIGITAL PRESENCE</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.75rem;">Official Social &amp; Media Channels</h3>
              <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.25rem;">
                Connect with our corporate communications desk, project showcases, and career announcements across verified platforms:
              </p>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <a href="https://www.linkedin.com/company/rayangroupinc/" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-radius: 8px; background: rgba(0, 153, 230, 0.08); border: 1px solid rgba(0, 153, 230, 0.25); color: #fff; text-decoration: none; transition: transform 0.2s ease;">
                  <span style="display: inline-flex; align-items: center; gap: 0.65rem; font-weight: 700; font-size: 0.875rem;">
                    <span style="color: #38bdf8;">LinkedIn</span>
                    <span style="color: #94a3b8; font-weight: 400; font-size: 0.8rem;">/company/rayangroupinc</span>
                  </span>
                  <span style="color: #0099e6; font-weight: 700; font-size: 0.85rem;">Connect ↗</span>
                </a>
                <a href="https://www.instagram.com/rayangroupinc/" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-radius: 8px; background: rgba(0, 153, 230, 0.08); border: 1px solid rgba(0, 153, 230, 0.25); color: #fff; text-decoration: none; transition: transform 0.2s ease;">
                  <span style="display: inline-flex; align-items: center; gap: 0.65rem; font-weight: 700; font-size: 0.875rem;">
                    <span style="color: #38bdf8;">Instagram</span>
                    <span style="color: #94a3b8; font-weight: 400; font-size: 0.8rem;">@rayangroupinc</span>
                  </span>
                  <span style="color: #0099e6; font-weight: 700; font-size: 0.85rem;">Follow ↗</span>
                </a>
                <a href="https://www.facebook.com/rayangroupinc" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-radius: 8px; background: rgba(0, 153, 230, 0.08); border: 1px solid rgba(0, 153, 230, 0.25); color: #fff; text-decoration: none; transition: transform 0.2s ease;">
                  <span style="display: inline-flex; align-items: center; gap: 0.65rem; font-weight: 700; font-size: 0.875rem;">
                    <span style="color: #38bdf8;">Facebook</span>
                    <span style="color: #94a3b8; font-weight: 400; font-size: 0.8rem;">@rayangroupinc</span>
                  </span>
                  <span style="color: #0099e6; font-weight: 700; font-size: 0.85rem;">Follow ↗</span>
                </a>
                <a href="https://x.com/rayangroupinc" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-radius: 8px; background: rgba(0, 153, 230, 0.08); border: 1px solid rgba(0, 153, 230, 0.25); color: #fff; text-decoration: none; transition: transform 0.2s ease;">
                  <span style="display: inline-flex; align-items: center; gap: 0.65rem; font-weight: 700; font-size: 0.875rem;">
                    <span style="color: #38bdf8;">X (Twitter)</span>
                    <span style="color: #94a3b8; font-weight: 400; font-size: 0.8rem;">@rayangroupinc</span>
                  </span>
                  <span style="color: #0099e6; font-weight: 700; font-size: 0.85rem;">Follow ↗</span>
                </a>
                <a href="https://www.youtube.com/@rayangroupinc" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-radius: 8px; background: rgba(0, 153, 230, 0.08); border: 1px solid rgba(0, 153, 230, 0.25); color: #fff; text-decoration: none; transition: transform 0.2s ease;">
                  <span style="display: inline-flex; align-items: center; gap: 0.65rem; font-weight: 700; font-size: 0.875rem;">
                    <span style="color: #38bdf8;">YouTube</span>
                    <span style="color: #94a3b8; font-weight: 400; font-size: 0.8rem;">@rayangroupinc</span>
                  </span>
                  <span style="color: #0099e6; font-weight: 700; font-size: 0.85rem;">Subscribe ↗</span>
                </a>
              </div>
            </div>

            <!-- SAP Ariba Network Directory Card -->
            <div style="background: #0c1828; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 1.75rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                <span style="font-size: 0.75rem; font-weight: 700; color: #f59e0b; text-transform: uppercase;">VERIFIED PROCUREMENT NETWORK</span>
                <span class="ariba-verification-anid">ANID: AN11136910824</span>
              </div>
              <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.5rem;">SAP Ariba Business Network</h3>
              <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.25rem;">
                For institutional procurement desks, registered buyers, and enterprise supply chain partners to connect and transact with Rayan Group:
              </p>
              <a href="https://portal.us.bn.cloud.ariba.com/profile/public?anId=AN11136910824" target="_blank" rel="noopener noreferrer" class="ariba-network-badge" title="Verify Rayan Group on SAP Ariba Network (ANID: AN11136910824)" aria-label="Find Rayan Group on SAP Ariba Network">
                <div class="ariba-badge-content">
                  <div class="ariba-badge-text">
                    <span class="ariba-badge-sub">Find us on</span>
                    <span class="ariba-badge-main">Ariba Network</span>
                  </div>
                  <div class="ariba-badge-icon">
                    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M4 27 L16 5 L28 27" stroke="#F59E0B" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M10 27 L16 16 L22 27" stroke="#F59E0B" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Validated Contact Form Right -->
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">DIRECT INQUIRY</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.5rem); font-weight: 800; color: #fff; margin: 0.5rem 0 2rem;">SEND A MESSAGE</h2>

          <form id="contactForm" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Full Name *</label>
              <input type="text" name="fullName" required placeholder="e.g. Tariq Al Mansoori" class="service-form-input">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" class="intro-grid-responsive">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Corporate Email *</label>
                <input type="email" name="corporateEmail" required placeholder="name@company.com" class="service-form-input">
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Contact Number</label>
                <input type="tel" name="contactNumber" placeholder="+971 50 123 4567" class="service-form-input">
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Inquiry Nature *</label>
              <select name="inquiryNature" required class="service-form-select">
                <option value="">Select Category...</option>
                <option value="Proposal & Tenders">Request a Proposal / Tenders</option>
                <option value="Suppliers & Procurement">Suppliers &amp; Procurement</option>
                <option value="Billing & Accounts Desk">Billing &amp; Accounts Desk</option>
                <option value="Careers & Recruitment">Careers &amp; Recruitment</option>
                <option value="General Commercial Inquiry">General Commercial Inquiry</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Message / Scope Details *</label>
              <textarea name="messageDetails" required rows="4" placeholder="Detail your project requirements, scope of work, or inquiry..." class="service-form-textarea"></textarea>
            </div>

            <button type="submit" class="btn-enterprise-primary" style="padding: 1rem; width: 100%; justify-content: center;">SUBMIT INQUIRY →</button>
          </form>
        </div>

      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 7. PRIVACY POLICY (/privacy/index.html) - UAE Law No. 45 / 2021 Compliant
// ============================================================================
createRoute('privacy/index.html', {
  title: 'Privacy Policy | Data Protection Notice',
  description: 'Rayan Group corporate privacy policy and personal data protection standards under UAE federal laws.',
  activePath: '/privacy/',
  heroHtml: renderPageHero({
    category: 'LEGAL & DATA COMPLIANCE',
    title: 'PRIVACY POLICY',
    description: 'Our commitment to safeguarding personal data in accordance with UAE Federal Decree-Law No. 45 of 2021 regarding Personal Data Protection.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Legal', href: '/terms/' }, { label: 'Privacy Policy', href: '/privacy/' }],
    bgImage: '/assets/images/about/overview.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container" style="max-width: 860px; color: #94a3b8; font-size: 0.95rem; line-height: 1.8;">
      <div style="margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
        <span style="font-size: 0.8rem; color: #0099e6; font-weight: 700;">LAST UPDATED: OCTOBER 2026</span>
        <h2 style="font-family: var(--font-heading); font-size: 2rem; color: #fff; margin-top: 0.5rem;">DATA PROTECTION COMPLIANCE</h2>
      </div>

      <p style="margin-bottom: 1.5rem;">
        This Privacy Policy explains how Rayan Group, its subsidiaries, and regional operating companies collect, process, and safeguard information submitted through our corporate web portals.
      </p>

      <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">1. Information We Collect</h3>
      <p style="margin-bottom: 1.5rem;">
        We collect data provided voluntarily when clients request proposals, suppliers submit prequalification dossiers, or candidates apply to our talent pool. This may include names, corporate email addresses, telephone numbers, company registration documents, and resumes.
      </p>

      <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">2. Purpose of Processing</h3>
      <p style="margin-bottom: 1.5rem;">
        Submitted details are used strictly to evaluate commercial bids, process vendor onboarding, facilitate accounts payable inquiries, and screen talent applications. We do not sell or monetize personal or commercial information.
      </p>

      <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">3. Data Security</h3>
      <p style="margin-bottom: 1.5rem;">
        We implement technical and organizational controls including encrypted communications (TLS 1.3), firewall safeguards, and role-based access restrictions to protect proprietary corporate data from unauthorized disclosure.
      </p>

      <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">4. Inquiries &amp; Rights</h3>
      <p>
        For inquiries regarding data protection, contact our administrative office at <a href="mailto:rayan@rayan-group.com" style="color: #0099e6; text-decoration: none;">rayan@rayan-group.com</a>.
      </p>
    </div>
  </section>
  `
});

// ============================================================================
// 8. TERMS & CONDITIONS (/terms/index.html) - Khansaheb Pattern
// ============================================================================
createRoute('terms/index.html', {
  title: 'Terms of Use & Website Conditions',
  description: 'Terms and conditions governing the access and use of the Rayan Group corporate website and digital portals.',
  activePath: '/terms/',
  heroHtml: renderPageHero({
    category: 'LEGAL TERMS & GOVERNANCE',
    title: 'TERMS & CONDITIONS',
    description: 'Terms of access, intellectual property rules, and legal conditions governing the use of Rayan Group digital channels.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Legal', href: '/terms/' }, { label: 'Terms & Conditions', href: '/terms/' }],
    bgImage: '/assets/images/about/overview.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container" style="max-width: 860px; color: #94a3b8; font-size: 0.95rem; line-height: 1.8;">
      <div style="margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
        <span style="font-size: 0.8rem; color: #0099e6; font-weight: 700;">LAST UPDATED: OCTOBER 2026</span>
        <h2 style="font-family: var(--font-heading); font-size: 2rem; color: #fff; margin-top: 0.5rem;">WEBSITE TERMS OF ACCESS</h2>
      </div>

      <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">1. Acceptance of Terms</h3>
      <p style="margin-bottom: 1.5rem;">
        By accessing or using this website, you agree to comply with and be bound by these Terms and Conditions and all applicable laws of the United Arab Emirates.
      </p>

      <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">2. Intellectual Property Rights &amp; Registered Trade Marks</h3>
      <p style="margin-bottom: 1.5rem;">
        All content on this site, including logos, visual identity assets, structural engineering descriptions, photography, and technical media, is the proprietary property of Rayan Group. "Rayan Group" is an officially registered trade mark under the Trade Marks Act, 1999 (Registration Certificate No. 3997390, Trade Mark No. 6580565, Class 37 Construction Services awarded by the Trade Marks Registry, Government of India). Reproduction, copying, or unauthorized commercial use of the brand, emblem, or materials without prior written consent is strictly prohibited.
      </p>

      <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">3. Commercial Scope</h3>
      <p style="margin-bottom: 1.5rem;">
        Website content is presented for informational purposes. Formal commercial commitments, tender quotations, and subcontracting obligations arise solely from executed written contracts under relevant FIDIC or standard engineering agreements.
      </p>

      <h3 style="color: #fff; font-size: 1.25rem; margin: 2rem 0 0.75rem;">4. Governing Law</h3>
      <p>
        These terms are governed by and construed in accordance with the laws of the United Arab Emirates as applied in the Emirate of Abu Dhabi.
      </p>
    </div>
  </section>
  `
});

console.log('Clean Corporate, Careers, News, Media, Contact & Legal pages generated successfully.');

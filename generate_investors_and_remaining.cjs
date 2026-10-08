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
            <form id="careerForm" onsubmit="event.preventDefault(); alert('Thank you for your application. Reference: APP-RYN-' + Math.floor(100000 + Math.random() * 900000) + '. Your resume has been entered into the Rayan Group talent database. Our HR recruitment team will contact qualified candidates.'); this.reset();">
              
              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="car-name">Full Legal Name <span class="req">*</span></label>
                  <input type="text" id="car-name" class="service-form-input" required placeholder="e.g. Rahul Sharma / Omar Khalid">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="car-email">Email Address <span class="req">*</span></label>
                  <input type="email" id="car-email" class="service-form-input" required placeholder="name@email.com">
                </div>
              </div>

              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="car-phone">Phone / WhatsApp Number <span class="req">*</span></label>
                  <input type="tel" id="car-phone" class="service-form-input" required placeholder="+971 50 123 4567">
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="car-location">Current Residence / Location <span class="req">*</span></label>
                  <input type="text" id="car-location" class="service-form-input" required placeholder="e.g. Abu Dhabi, Dubai, India">
                </div>
              </div>

              <div class="form-grid-2col" style="margin-bottom: 1.25rem;">
                <div class="service-form-group">
                  <label class="service-form-label" for="car-dept">Target Department / Discipline <span class="req">*</span></label>
                  <select id="car-dept" class="service-form-select" required>
                    <option value="" disabled selected>Select Discipline</option>
                    <option value="civil">Civil &amp; Structural Engineering</option>
                    <option value="ashaz">Ashaz Engineering (India Hub)</option>
                    <option value="energy">Energy, Piping &amp; Process EPC</option>
                    <option value="infrastructure">Highway &amp; Heavy Civil Infrastructure</option>
                    <option value="logistics">Heavy Fleet &amp; Crane Operations</option>
                    <option value="qhse">QHSE &amp; Environmental Safety</option>
                    <option value="commercial">Commercial, Estimating &amp; Quantity Surveying</option>
                    <option value="corporate">Finance, HR &amp; Corporate Administration</option>
                  </select>
                </div>
                <div class="service-form-group">
                  <label class="service-form-label" for="car-exp">Total Years of Experience <span class="req">*</span></label>
                  <select id="car-exp" class="service-form-select" required>
                    <option value="" disabled selected>Select Experience Range</option>
                    <option value="entry">Entry Level / Graduate (0 - 2 Years)</option>
                    <option value="mid">Mid-Level Professional (3 - 7 Years)</option>
                    <option value="senior">Senior Engineer / Specialist (8 - 12 Years)</option>
                    <option value="lead">Project Director / Management (13+ Years)</option>
                  </select>
                </div>
              </div>

              <div class="service-form-group" style="margin-bottom: 1.5rem;">
                <label class="service-form-label" for="car-notes">Cover Note / Key Projects Handled</label>
                <textarea id="car-notes" class="service-form-textarea" rows="3" placeholder="Briefly highlight your technical specialties, key past projects, software proficiencies, or availability timeline..."></textarea>
              </div>

              <!-- CV / Resume Upload Dropzone -->
              <div class="service-form-group" style="margin-bottom: 2rem;">
                <label class="service-form-label">Upload CV / Resume (PDF / DOCX) <span class="req">*</span></label>
                <div class="file-dropzone" onclick="document.getElementById('car-file').click();">
                  <input type="file" id="car-file" style="display: none;" required onchange="const list = document.getElementById('car-file-name'); list.textContent = this.files.length ? this.files[0].name : '';">
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
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 2.5rem; margin-bottom: 4rem;">
        
        <!-- Article 1 -->
        <article style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="height: 220px; overflow: hidden;">
            <img src="/assets/images/business/hero-1-skyline.jpg" alt="Commercial EPC" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">CONTRACT AWARD</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">FEBRUARY 2025</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 1rem;">
              Rayan Group Awarded Major Turnkey Commercial &amp; Infrastructure EPC Works
            </h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Turnkey civil construction, MEP integration, and advanced structural execution for landmark developments in Abu Dhabi.
            </p>
            <a href="/news/rayan-group-expands-offshore-portfolio/" class="btn-enterprise-primary" style="align-self: flex-start;">READ FULL RELEASE →</a>
          </div>
        </article>

        <!-- Article 2 -->
        <article style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="height: 220px; overflow: hidden;">
            <img src="/assets/images/projects/waldorf-astoria-renovation-rak.jpg" alt="Waldorf Astoria Overhaul" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase;">PROJECT HANDOVER</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">NOVEMBER 2024</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 1rem;">
              Successful Handover: Waldorf Astoria Luxury Hospitality Overhaul in RAK
            </h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Full-scope interior fit-out, acoustic MEP reconfiguration, and luxury guestroom modernization delivered in partnership with Brock Construction.
            </p>
            <a href="/projects/waldorf-astoria-renovation-rak/" class="btn-enterprise-secondary" style="align-self: flex-start;">VIEW CASE STUDY →</a>
          </div>
        </article>

        <!-- Article 3 -->
        <article style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="height: 220px; overflow: hidden;">
            <img src="/assets/images/sustainability/iso-45001.jpg" alt="Triple ISO" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #c5a059; text-transform: uppercase;">QHSE AUDIT</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">JANUARY 2025</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 1rem;">
              Rayan Group Successfully Renews Global Triple ISO Quality &amp; Safety Certifications
            </h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Achieving full compliance across ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 audits across all construction yards and regional engineering hubs.
            </p>
            <a href="/sustainability/" class="btn-enterprise-secondary" style="align-self: flex-start;">VIEW HSE POLICY →</a>
          </div>
        </article>
      </div>

      <!-- Media Inquiries Box -->
      <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2rem;">
        <div>
          <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Media &amp; Press Communications</h4>
          <p style="color: #94a3b8; font-size: 0.9rem; margin: 0;">For official brand guidelines, executive interview requests, or image assets, reach out to our communications team.</p>
        </div>
        <a href="mailto:info@rayan-group.com" class="btn-enterprise-primary">CONTACT COMMUNICATIONS →</a>
      </div>
    </div>
  </section>
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
                <div><strong>General Inquiries:</strong> info@rayan-group.com</div>
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
                <div><strong>Inquiries:</strong> info@rayan-group.com</div>
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
          </div>
        </div>

        <!-- Validated Contact Form Right -->
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">DIRECT INQUIRY</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.5rem); font-weight: 800; color: #fff; margin: 0.5rem 0 2rem;">SEND A MESSAGE</h2>

          <form onsubmit="event.preventDefault(); alert('Your message has been received. Our team will contact you shortly.'); this.reset();" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Full Name *</label>
              <input type="text" required placeholder="e.g. Tariq Al Mansoori" class="service-form-input">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" class="intro-grid-responsive">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Corporate Email *</label>
                <input type="email" required placeholder="name@company.com" class="service-form-input">
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Contact Number</label>
                <input type="tel" placeholder="+971 50 123 4567" class="service-form-input">
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Inquiry Nature *</label>
              <select required class="service-form-select">
                <option value="">Select Category...</option>
                <option value="proposal">Request a Proposal / Tenders</option>
                <option value="procurement">Suppliers &amp; Procurement</option>
                <option value="billing">Billing &amp; Accounts Desk</option>
                <option value="careers">Careers &amp; Recruitment</option>
                <option value="general">General Commercial Inquiry</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Message / Scope Details *</label>
              <textarea required rows="4" placeholder="Detail your project requirements, scope of work, or inquiry..." class="service-form-textarea"></textarea>
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
        For inquiries regarding data protection, contact our administrative office at <span style="color: #0099e6;">info@rayan-group.com</span>.
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

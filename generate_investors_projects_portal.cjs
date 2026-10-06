const fs = require('fs');
const path = require('path');
const { wrapPage, renderPageHero, ensureDir } = require('./build_multipage_site.cjs');

function createRoute(relativePath, { title, description, activePath, heroHtml, content }) {
  const fullPath = path.join(__dirname, relativePath);
  ensureDir(fullPath);
  const html = wrapPage({ title, description, activePath, heroHtml, content });
  fs.writeFileSync(fullPath, html, 'utf8');
  console.log(`Generated route: ${relativePath}`);
}

const irSubnav = (activeHref) => [
  { label: 'Overview', href: '/investors/', active: activeHref === '/investors/' },
  { label: 'Financial Results', href: '/investors/financial-results/', active: activeHref === '/investors/financial-results/' },
  { label: 'Annual Reports', href: '/investors/annual-reports/', active: activeHref === '/investors/annual-reports/' },
  { label: 'Presentations', href: '/investors/presentations/', active: activeHref === '/investors/presentations/' },
  { label: 'Shareholders', href: '/investors/shareholder-information/', active: activeHref === '/investors/shareholder-information/' },
  { label: 'Governance', href: '/investors/corporate-governance/', active: activeHref === '/investors/corporate-governance/' },
  { label: 'Stock Info', href: '/investors/stock-information/', active: activeHref === '/investors/stock-information/' },
  { label: 'IR Calendar', href: '/investors/financial-calendar/', active: activeHref === '/investors/financial-calendar/' },
];

// ============================================================================
// 10. PROJECTS PORTFOLIO (projects/index.html)
// ============================================================================
createRoute('projects/index.html', {
  title: 'Project Portfolio Showcase',
  description: 'Explore Rayan Group landmark projects in commercial retail, marine dredging, luxury residential, and industrial infrastructure.',
  activePath: '/projects/',
  heroHtml: renderPageHero({
    category: 'PROJECT SHOWCASE',
    title: 'PROJECTS DEFINING OUR SCALE',
    description: 'A track record of over 500 completed turnkey projects combining structural precision with uncompromised delivery.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects/' }],
    bgImage: '/assets/images/projects/al-wahda-mall.jpg',
    subnav: [
      { label: 'All Projects', href: '/projects/', active: true },
      { label: 'Al Wahda Mall', href: '/projects/al-wahda-mall/', active: false },
      { label: 'Ghantoot Palace', href: '/projects/ghantoot-palace/', active: false },
      { label: 'Yas Mall', href: '/projects/yas-mall/', active: false }
    ]
  }),
  content: `
  <section class="section" style="padding: 6rem 0; background: #07111e;">
    <div class="container">
      <!-- Filter Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 3.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.5rem;">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;" class="project-filter-group">
          <button type="button" class="subnav-tab-link project-filter-btn active" data-filter="all">ALL (8)</button>
          <button type="button" class="subnav-tab-link project-filter-btn" data-filter="commercial">COMMERCIAL (4)</button>
          <button type="button" class="subnav-tab-link project-filter-btn" data-filter="marine">MARINE (1)</button>
          <button type="button" class="subnav-tab-link project-filter-btn" data-filter="energy">ENERGY (1)</button>
          <button type="button" class="subnav-tab-link project-filter-btn" data-filter="infrastructure">INFRASTRUCTURE (2)</button>
        </div>
        <div style="font-size: 0.8125rem; color: #94a3b8;">SHOWING 8 MAJOR ASSETS</div>
      </div>

      <!-- Project Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 2rem;">
        <article class="project-editorial-card" data-project-cat="commercial" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 250px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/al-wahda-mall.jpg" alt="Al Wahda Mall" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6;">AED 371.2M</span>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">COMMERCIAL / ABU DHABI</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0.4rem 0 0.75rem;">Al Wahda Mall Development</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">Civil engineering, structural framing, luxury tile installations, and retail finishes for Max / HLN Technical.</p>
            <a href="/projects/al-wahda-mall/" style="font-size: 0.825rem; font-weight: 700; color: #0099e6; text-decoration: none;">EXPLORE CASE STUDY →</a>
          </div>
        </article>

        <article class="project-editorial-card" data-project-cat="commercial" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 250px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/ghantoot-palace.jpg" alt="Ghantoot Palace" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #c5a059;">AED 185.0M</span>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">INTERIORS / GHANTOOT</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0.4rem 0 0.75rem;">Ghantoot Royal Private Estate</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">Bespoke architectural gypsum, vaulted ceilings, and hand-finished VIP interiors.</p>
            <a href="/projects/ghantoot-palace/" style="font-size: 0.825rem; font-weight: 700; color: #c5a059; text-decoration: none;">EXPLORE CASE STUDY →</a>
          </div>
        </article>

        <article class="project-editorial-card" data-project-cat="commercial" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 250px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/yas-mall.jpg" alt="Yas Mall" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6;">AED 54.2M</span>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">RETAIL / YAS ISLAND</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0.4rem 0 0.75rem;">Yas Mall Destination Fit-Out</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">MEP integration, custom architectural woodwork, and turnkey retail delivery for Café Bateel.</p>
            <a href="/projects/yas-mall/" style="font-size: 0.825rem; font-weight: 700; color: #0099e6; text-decoration: none;">EXPLORE CASE STUDY →</a>
          </div>
        </article>

        <article class="project-editorial-card" data-project-cat="marine" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 250px; overflow: hidden; position: relative;">
            <img src="/assets/images/business/marine-offshore-port.jpg" alt="Marine Dredging" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6;">AED 420.0M</span>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">MARINE / ABU DHABI</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0.4rem 0 0.75rem;">Arabian Gulf Coastal Industrial Berth</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">Channel deepening to -14m CD, 1.2M m³ reclamation, heavy quay walls, and industrial vessel berthing.</p>
            <a href="/business/marine/" style="font-size: 0.825rem; font-weight: 700; color: #0099e6; text-decoration: none;">DISCOVER MARINE WORKS →</a>
          </div>
        </article>

        <article class="project-editorial-card" data-project-cat="energy" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 250px; overflow: hidden; position: relative;">
            <img src="/assets/images/business/energy-refinery-complex.jpg" alt="Energy Pipeline" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6;">AED 610.0M</span>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">ENERGY / AL DHAFRA</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0.4rem 0 0.75rem;">Habshan Energy Pipeline Corridor</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">Heavy industrial pipeline trenching, high-pressure compressor tie-ins, and cathodic protection.</p>
            <a href="/business/energy/" style="font-size: 0.825rem; font-weight: 700; color: #0099e6; text-decoration: none;">DISCOVER ENERGY WORKS →</a>
          </div>
        </article>

        <article class="project-editorial-card" data-project-cat="infrastructure" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 250px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/porsche-service-center.jpg" alt="Porsche Center" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6;">AED 42.5M</span>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">INDUSTRIAL / ABU DHABI</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0.4rem 0 0.75rem;">Porsche Industrial Service Facility</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">Structural reinforcement, high-grade drainage remediation, and civil facility overhaul for Ali &amp; Sons Motors.</p>
            <a href="/business/infrastructure/" style="font-size: 0.825rem; font-weight: 700; color: #0099e6; text-decoration: none;">DISCOVER CIVIL WORKS →</a>
          </div>
        </article>
      </div>
    </div>
  </section>
  `
});

// Case Studies
createRoute('projects/al-wahda-mall/index.html', {
  title: 'Al Wahda Mall Development Case Study',
  description: 'AED 371.2M commercial retail and structural engineering expansion project delivered by Rayan Group.',
  activePath: '/projects/al-wahda-mall/',
  heroHtml: renderPageHero({
    category: 'PROJECT CASE STUDY',
    title: 'AL WAHDA MALL DEVELOPMENT',
    description: 'Landmark commercial retail and structural engineering expansion delivered with zero operational disruption.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects/' }, { label: 'Al Wahda Mall', href: '/projects/al-wahda-mall/' }],
    bgImage: '/assets/images/projects/al-wahda-mall.jpg',
    subnav: [
      { label: 'Overview', href: '#overview', active: true },
      { label: 'Specifications', href: '#specs', active: false },
      { label: 'Gallery', href: '#gallery', active: false }
    ]
  }),
  content: `
  <section class="section" style="padding: 6rem 0; background: #07111e;">
    <div class="container">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 4rem;" class="intro-grid-responsive">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-bottom: 1.5rem;">PROJECT NARRATIVE</h2>
          <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.5rem;">
            Rayan Group was selected by HLN Technical Services to execute extensive civil reinforcement, foundation works, and acoustic architectural gypsum fit-outs for the multi-story commercial retail expansion at Al Wahda Mall, Abu Dhabi.
          </p>
          <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.7; margin-bottom: 2rem;">
            Executing within an active, high-traffic commercial destination required rigorous logistical synchronization, night-shift structural operations, and strict adherence to Estidama safety and environmental guidelines.
          </p>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 1rem;">KEY HIGHLIGHTS</h3>
          <ul style="color: #94a3b8; line-height: 1.8; font-size: 0.95rem; margin-bottom: 2.5rem; padding-left: 1.25rem;">
            <li>Zero operational disruption to over 50,000 daily mall visitors</li>
            <li>Post-tensioned slab reinforcement and specialized tile engineering</li>
            <li>Delivered ahead of scheduled retail launch with zero lost-time incidents</li>
          </ul>
          <a href="/projects/" class="btn-enterprise-secondary">← BACK TO ALL PROJECTS</a>
        </div>

        <div>
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;" id="specs">
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 1.5rem; text-transform: uppercase;">PROJECT METRICS</h3>
            <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
              <span style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Contract Value</span>
              <div style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #0099e6;">AED 371,194,710</div>
            </div>
            <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
              <span style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Client</span>
              <div style="font-size: 0.95rem; color: #fff; font-weight: 600;">Max / HLN Technical Services LLC</div>
            </div>
            <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
              <span style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Location</span>
              <div style="font-size: 0.95rem; color: #fff; font-weight: 600;">Abu Dhabi, UAE</div>
            </div>
            <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
              <span style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Scope</span>
              <div style="font-size: 0.85rem; color: #cbd5e1;">Civil, Tiles, Structural Gypsum, Foundation</div>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Quality Certification</span>
              <div style="font-size: 0.85rem; color: #10b981; font-weight: 600;">ISO 9001:2015 &amp; ISO 45001:2018</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

createRoute('projects/ghantoot-palace/index.html', {
  title: 'Ghantoot Royal Private Estate Case Study',
  description: 'Bespoke ornamental gypsum and vaulted architectural interior fit-out delivered by Rayan Group.',
  activePath: '/projects/ghantoot-palace/',
  heroHtml: renderPageHero({
    category: 'PROJECT CASE STUDY',
    title: 'GHANTOOT ROYAL PRIVATE ESTATE',
    description: 'Exquisite ornamental gypsum architecture and vaulted hand-carved ceilings for private royal residential suites.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects/' }, { label: 'Ghantoot Palace', href: '/projects/ghantoot-palace/' }],
    bgImage: '/assets/images/projects/ghantoot-palace.jpg'
  }),
  content: `
  <section class="section" style="padding: 6rem 0; background: #07111e;">
    <div class="container">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 4rem;" class="intro-grid-responsive">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-bottom: 1.5rem;">CRAFTSMANSHIP &amp; ARCHITECTURAL INTEGRITY</h2>
          <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.5rem;">
            Rayan Architectural Interiors delivered monumental hand-cast gypsum panels, intricate Arabic geometric mouldings, and vaulted ceiling restoration for the private royal residence in Ghantoot, Abu Dhabi.
          </p>
          <a href="/projects/" class="btn-enterprise-secondary">← BACK TO ALL PROJECTS</a>
        </div>
        <div>
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #c5a059; margin-bottom: 1.5rem; text-transform: uppercase;">PROJECT METRICS</h3>
            <p style="color: #cbd5e1; font-size: 0.9rem;"><strong>Value:</strong> AED 185,000,000</p>
            <p style="color: #cbd5e1; font-size: 0.9rem; margin-top: 0.5rem;"><strong>Client:</strong> Private Royal Office / HM Villa</p>
            <p style="color: #cbd5e1; font-size: 0.9rem; margin-top: 0.5rem;"><strong>Location:</strong> Ghantoot, Abu Dhabi</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

createRoute('projects/yas-mall/index.html', {
  title: 'Yas Mall Destination Fit-Out Case Study',
  description: 'Iconic commercial retail engineering and specialty MEP installation delivered by Rayan Group.',
  activePath: '/projects/yas-mall/',
  heroHtml: renderPageHero({
    category: 'PROJECT CASE STUDY',
    title: 'YAS MALL DESTINATION FIT-OUT',
    description: 'High-spec mechanical, electrical, plumbing, and architectural ceiling fit-out at Yas Island, Abu Dhabi.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects/' }, { label: 'Yas Mall', href: '/projects/yas-mall/' }],
    bgImage: '/assets/images/projects/yas-mall.jpg'
  }),
  content: `
  <section class="section" style="padding: 6rem 0; background: #07111e;">
    <div class="container">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 4rem;" class="intro-grid-responsive">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-bottom: 1.5rem;">RETAIL ENGINEERING EXCELLENCE</h2>
          <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.5rem;">
            Delivered specialty MEP engineering, acoustic gypsum ceilings, and luxury hospitality fit-out for flagship retail destination at Yas Mall, Abu Dhabi.
          </p>
          <a href="/projects/" class="btn-enterprise-secondary">← BACK TO ALL PROJECTS</a>
        </div>
        <div>
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #0099e6; margin-bottom: 1.5rem; text-transform: uppercase;">PROJECT METRICS</h3>
            <p style="color: #cbd5e1; font-size: 0.9rem;"><strong>Value:</strong> AED 54,182,000</p>
            <p style="color: #cbd5e1; font-size: 0.9rem; margin-top: 0.5rem;"><strong>Client:</strong> Café Bateel / Top Rock Interiors</p>
            <p style="color: #cbd5e1; font-size: 0.9rem; margin-top: 0.5rem;"><strong>Location:</strong> Yas Island, Abu Dhabi</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 14. SUSTAINABILITY PAGE (sustainability/index.html)
// ============================================================================
createRoute('sustainability/index.html', {
  title: 'Sustainability, ESG & Net-Zero Pathway',
  description: 'Rayan Group ESG commitments: 30% carbon emission reduction by 2030, zero-harm health & safety, and triple ISO certifications.',
  activePath: '/sustainability/',
  heroHtml: renderPageHero({
    category: 'ESG STRATEGY',
    title: 'SUSTAINABILITY AT OUR CORE',
    description: 'Pioneering decarbonization, marine biodiversity protection, and zero-harm workplace safety across all multinational projects.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Sustainability', href: '/sustainability/' }],
    bgImage: '/assets/images/sustainability/renewable-energy.jpg',
    subnav: [
      { label: 'ESG Pillars', href: '#pillars', active: true },
      { label: 'Carbon Reduction', href: '#carbon', active: false },
      { label: 'HSE Safety (ISO 45001)', href: '#safety', active: false },
      { label: 'Triple Certifications', href: '#certifications', active: false }
    ]
  }),
  content: `
  <section class="section" style="padding: 6rem 0; background: #07111e;" id="pillars">
    <div class="container">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; margin-bottom: 5rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #10b981; letter-spacing: 0.1em; text-transform: uppercase;">PILLAR 01</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0.5rem 0 1rem; text-transform: uppercase;">ENVIRONMENTAL RESPONSIBILITY</h3>
          <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.65;">
            Integrating solar hybrid power on remote sites, reducing dredging silt dispersal, and targeting 30% carbon emission reduction across operations by 2030.
          </p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #0099e6; letter-spacing: 0.1em; text-transform: uppercase;">PILLAR 02</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0.5rem 0 1rem; text-transform: uppercase;">SOCIAL &amp; WORKFORCE HSE</h3>
          <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.65;">
            Uncompromising zero-harm safety culture under ISO 45001:2018, workforce health screenings, fair wages, and extensive skills training across all job sites.
          </p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #c5a059; letter-spacing: 0.1em; text-transform: uppercase;">PILLAR 03</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0.5rem 0 1rem; text-transform: uppercase;">FIDUCIARY GOVERNANCE</h3>
          <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.65;">
            Zero-tolerance bribery and corruption policy, transparent ESG disclosures, independent audit committees, and strict corporate ethics compliance.
          </p>
        </div>
      </div>

      <!-- Triple Certifications Card -->
      <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 3rem;" id="certifications">
        <div style="text-align: center; max-width: 700px; margin: 0 auto 3rem;">
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">VERIFIED STANDARDS</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">TRIPLE ISO CERTIFICATIONS</h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2rem;">
          <div style="text-align: center; padding: 2rem; background: rgba(255,255,255,0.02); border-radius: 8px;">
            <div style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #0099e6;">ISO 9001:2015</div>
            <div style="font-size: 0.85rem; color: #cbd5e1; font-weight: 600; margin: 0.5rem 0;">Quality Management System</div>
            <span style="font-size: 0.75rem; color: #94a3b8;">ANID: AN11136910824</span>
          </div>

          <div style="text-align: center; padding: 2rem; background: rgba(255,255,255,0.02); border-radius: 8px;">
            <div style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #10b981;">ISO 14001:2015</div>
            <div style="font-size: 0.85rem; color: #cbd5e1; font-weight: 600; margin: 0.5rem 0;">Environmental Management</div>
            <span style="font-size: 0.75rem; color: #94a3b8;">EMS-RE-23051702YJRJW52</span>
          </div>

          <div style="text-align: center; padding: 2rem; background: rgba(255,255,255,0.02); border-radius: 8px;">
            <div style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #c5a059;">ISO 45001:2018</div>
            <div style="font-size: 0.85rem; color: #cbd5e1; font-weight: 600; margin: 0.5rem 0;">Occupational Health &amp; Safety</div>
            <span style="font-size: 0.75rem; color: #94a3b8;">OHS-RE-23051702YJRJW52</span>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

console.log('Projects & Sustainability pages generated.');

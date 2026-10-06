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

const businessSubnav = (activeHref) => [
  { label: 'All Divisions', href: '/business/', active: activeHref === '/business/' },
  { label: 'Civil & EPC', href: '/business/engineering/', active: activeHref === '/business/engineering/' },
  { label: 'Marine & Coastal', href: '/business/marine/', active: activeHref === '/business/marine/' },
  { label: 'Infrastructure', href: '/business/infrastructure/', active: activeHref === '/business/infrastructure/' },
  { label: 'Energy & Oil/Gas', href: '/business/energy/', active: activeHref === '/business/energy/' },
  { label: 'Heavy Logistics', href: '/business/logistics/', active: activeHref === '/business/logistics/' },
];

// ============================================================================
// 4. BUSINESS OVERVIEW (business/index.html)
// ============================================================================
createRoute('business/index.html', {
  title: 'Our Business Divisions & Operating Capabilities',
  description: 'Explore Rayan Group multi-sector operating divisions across civil contracting, marine dredging, energy infrastructure, and heavy fleet logistics.',
  activePath: '/business/',
  heroHtml: renderPageHero({
    category: 'BUSINESS SECTORS',
    title: 'WHAT WE DO',
    description: 'Delivering end-to-end engineering, offshore maritime contracting, hydrocarbon energy EPC, and foundational infrastructure at multinational scale.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Business', href: '/business/' }],
    bgImage: '/assets/images/hero/hero-infrastructure-cranes.jpg',
    subnav: businessSubnav('/business/')
  }),
  content: `
  <section class="section" style="padding: 6rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 780px; margin: 0 auto 4.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">CAPABILITIES AT SCALE</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">CORE OPERATING DIVISIONS</h2>
        <p style="color: #94a3b8; font-size: 1rem; margin-top: 1rem; line-height: 1.6;">Rayan Group combines technical ingenuity with operational horsepower across five pillars of global engineering.</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 3rem;">
        <!-- Division 1 -->
        <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 3.5rem; align-items: center; background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: clamp(1.5rem, 3.5vw, 3rem);" class="intro-grid-responsive">
          <div>
            <span style="font-family: var(--font-heading); font-size: 2rem; font-weight: 900; color: #0099e6;">01</span>
            <h3 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 1rem;">Engineering &amp; Turnkey Construction</h3>
            <p style="color: #cbd5e1; font-size: 1rem; line-height: 1.65; margin-bottom: 1.5rem;">
              Full-lifecycle EPC contracting for residential high-rises, commercial retail complexes, and industrial warehouses. Overseeing site foundation piling, structural concrete, and certified ISO 9001 handovers.
            </p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">500+ Projects</span>
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">Turnkey High-Rise</span>
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">BIM Integrated</span>
            </div>
            <a href="/business/engineering/" class="btn-enterprise-primary">DISCOVER DIVISION →</a>
          </div>
          <div>
            <img src="/assets/images/business/01-engineering.jpg" alt="Civil Engineering" style="width: 100%; height: 340px; object-fit: cover; border-radius: 8px;">
          </div>
        </div>

        <!-- Division 2 -->
        <div style="display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 3.5rem; align-items: center; background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: clamp(1.5rem, 3.5vw, 3rem);" class="intro-grid-responsive">
          <div>
            <img src="/assets/images/business/marine-offshore-port.jpg" alt="Marine Dredging" style="width: 100%; height: 340px; object-fit: cover; border-radius: 8px;">
          </div>
          <div>
            <span style="font-family: var(--font-heading); font-size: 2rem; font-weight: 900; color: #0099e6;">02</span>
            <h3 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 1rem;">Marine &amp; Coastal Works</h3>
            <p style="color: #cbd5e1; font-size: 1rem; line-height: 1.65; margin-bottom: 1.5rem;">
              Offshore capital dredging, island reclamation, deep-water port berthing, rock revetments, and breakwater construction supporting vital Arabian Gulf maritime trade arteries.
            </p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">Deep-Water Dredging</span>
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">Port Infrastructure</span>
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">Island Reclamation</span>
            </div>
            <a href="/business/marine/" class="btn-enterprise-primary">DISCOVER DIVISION →</a>
          </div>
        </div>

        <!-- Division 3 -->
        <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 3.5rem; align-items: center; background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: clamp(1.5rem, 3.5vw, 3rem);" class="intro-grid-responsive">
          <div>
            <span style="font-family: var(--font-heading); font-size: 2rem; font-weight: 900; color: #0099e6;">03</span>
            <h3 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 1rem;">Infrastructure &amp; Heavy Civil</h3>
            <p style="color: #cbd5e1; font-size: 1rem; line-height: 1.65; margin-bottom: 1.5rem;">
              Connecting metropolitan hubs through arterial highways, grade-separated bridges, earthmoving, urban stormwater retention tunnels, and public utility networks.
            </p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">Highway Corridors</span>
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">Bridge Structures</span>
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">Utility Networks</span>
            </div>
            <a href="/business/infrastructure/" class="btn-enterprise-primary">DISCOVER DIVISION →</a>
          </div>
          <div>
            <img src="/assets/images/business/03-infrastructure.jpg" alt="Heavy Infrastructure" style="width: 100%; height: 340px; object-fit: cover; border-radius: 8px;">
          </div>
        </div>

        <!-- Division 4 -->
        <div style="display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 3.5rem; align-items: center; background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: clamp(1.5rem, 3.5vw, 3rem);" class="intro-grid-responsive">
          <div>
            <img src="/assets/images/business/energy-refinery-complex.jpg" alt="Energy Facilities" style="width: 100%; height: 340px; object-fit: cover; border-radius: 8px;">
          </div>
          <div>
            <span style="font-family: var(--font-heading); font-size: 2rem; font-weight: 900; color: #0099e6;">04</span>
            <h3 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 1rem;">Energy &amp; Offshore EPC</h3>
            <p style="color: #cbd5e1; font-size: 1rem; line-height: 1.65; margin-bottom: 1.5rem;">
              Supporting the lifecycle of onshore and offshore oil and gas facilities, cross-country hydrocarbon transport pipelines, gas compressor terminals, and refinery maintenance.
            </p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">Hydrocarbon Pipelines</span>
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">Process Terminals</span>
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">Zero-Harm Record</span>
            </div>
            <a href="/business/energy/" class="btn-enterprise-primary">DISCOVER DIVISION →</a>
          </div>
        </div>

        <!-- Division 5 -->
        <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 3.5rem; align-items: center; background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: clamp(1.5rem, 3.5vw, 3rem);" class="intro-grid-responsive">
          <div>
            <span style="font-family: var(--font-heading); font-size: 2rem; font-weight: 900; color: #0099e6;">05</span>
            <h3 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 1rem;">Heavy Fleet Logistics &amp; Transport</h3>
            <p style="color: #cbd5e1; font-size: 1rem; line-height: 1.65; margin-bottom: 1.5rem;">
              Operating a proprietary fleet of 180+ heavy cranes, hydraulic multi-axle modular trailers, and marine transport vessels managing nationwide logistics and project cargo.
            </p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">180+ Units</span>
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">Heavy Modular Fleet</span>
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 4px; background: rgba(0,153,230,0.1); color: #0099e6;">Project Cargo</span>
            </div>
            <a href="/business/logistics/" class="btn-enterprise-primary">DISCOVER DIVISION →</a>
          </div>
          <div>
            <img src="/assets/images/business/05-logistics.jpg" alt="Logistics Fleet" style="width: 100%; height: 340px; object-fit: cover; border-radius: 8px;">
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Operating Companies Anchor Section -->
  <section id="companies" class="section" style="padding: 6rem 0; background: #050b14;">
    <div class="container">
      <div style="text-align: center; max-width: 700px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">CONGLOMERATE ENTITIES</span>
        <h2 style="font-family: var(--font-heading); font-size: 2.5rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">OPERATING COMPANIES</h2>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.75rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
          <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Rayan Engineering &amp; Contracting L.L.C</h4>
          <span style="font-size: 0.72rem; color: #0099e6; text-transform: uppercase; font-weight: 700;">Abu Dhabi, UAE (HQ)</span>
          <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0.75rem; line-height: 1.55;">Turnkey building construction, high-rises, and industrial facilities.</p>
        </div>
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
          <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Rayan Marine &amp; Coastal Contracting</h4>
          <span style="font-size: 0.72rem; color: #0099e6; text-transform: uppercase; font-weight: 700;">Arabian Gulf Maritime Hub</span>
          <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0.75rem; line-height: 1.55;">Offshore dredging, port berths, breakwaters, and marine logistics.</p>
        </div>
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
          <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Rayan Energy &amp; Offshore Works</h4>
          <span style="font-size: 0.72rem; color: #0099e6; text-transform: uppercase; font-weight: 700;">Al Dhafra / Regional Corridors</span>
          <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0.75rem; line-height: 1.55;">Onshore &amp; offshore oil/gas pipelines and industrial process terminals.</p>
        </div>
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
          <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Rayan Group India Regional Hub</h4>
          <span style="font-size: 0.72rem; color: #0099e6; text-transform: uppercase; font-weight: 700;">Bettiah / New Delhi, India</span>
          <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0.75rem; line-height: 1.55;">South Asia infrastructure development, regional EPC and digital engineering.</p>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 5. BUSINESS SUB-PAGE: ENGINEERING
// ============================================================================
createRoute('business/engineering/index.html', {
  title: 'Civil & Turnkey Building Construction EPC',
  description: 'Rayan Group flagship building construction division delivering commercial skyscrapers, residential complexes, and industrial frameworks.',
  activePath: '/business/engineering/',
  heroHtml: renderPageHero({
    category: 'BUSINESS DIVISION 01',
    title: 'CIVIL & BUILDING CONSTRUCTION',
    description: 'Turnkey commercial and residential construction, structural engineering frameworks, and precision project management.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Business', href: '/business/' }, { label: 'Engineering', href: '/business/engineering/' }],
    bgImage: '/assets/images/business/01-engineering.jpg',
    subnav: businessSubnav('/business/engineering/')
  }),
  content: `
  <section class="section" style="padding: 6rem 0; background: #07111e;">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.85rem;">CIVIL EXCELLENCE</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.75rem; font-weight: 800; color: #fff; line-height: 1.15; text-transform: uppercase; margin-bottom: 1.5rem;">ENGINEERING COMMERCIAL &amp; INDUSTRIAL HORIZONS</h2>
          <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.65; margin-bottom: 1.25rem;">
            Rayan Engineering &amp; Contracting delivers turnkey execution from foundation excavation and deep piling to structural concrete frames, MEP integration, and premium architectural finishes.
          </p>
          <ul style="color: #94a3b8; font-size: 0.95rem; line-height: 1.8; margin-bottom: 2rem; padding-left: 1.25rem;">
            <li>High-rise commercial towers and shopping destination malls</li>
            <li>Industrial warehouse complexes and logistics distribution hubs</li>
            <li>Deep foundation piling, shoring, and post-tensioned slabs</li>
            <li>Stringent ISO 9001:2015 quality assurance and schedule control</li>
          </ul>
          <a href="/projects/al-wahda-mall/" class="btn-enterprise-primary">VIEW AL WAHDA MALL CASE STUDY →</a>
        </div>
        <div>
          <img src="/assets/images/projects/al-wahda-mall.jpg" alt="Al Wahda Mall Construction" style="width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 6. BUSINESS SUB-PAGE: MARINE
// ============================================================================
createRoute('business/marine/index.html', {
  title: 'Marine & Coastal Engineering Works',
  description: 'Deep-water capital dredging, port infrastructure, maritime reclamation, and breakwaters across the Arabian Gulf.',
  activePath: '/business/marine/',
  heroHtml: renderPageHero({
    category: 'BUSINESS DIVISION 02',
    title: 'MARINE & COASTAL WORKS',
    description: 'Offshore dredging, deep-water port berthing, maritime reclamation, rock revetments, and coastal infrastructure.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Business', href: '/business/' }, { label: 'Marine', href: '/business/marine/' }],
    bgImage: '/assets/images/business/marine-offshore-port.jpg',
    subnav: businessSubnav('/business/marine/')
  }),
  content: `
  <section class="section" style="padding: 6rem 0; background: #07111e;">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.85rem;">MARITIME SPECIALIZATION</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.75rem; font-weight: 800; color: #fff; line-height: 1.15; text-transform: uppercase; margin-bottom: 1.5rem;">SHAPING COASTLINES &amp; NAVIGATIONAL CORRIDORS</h2>
          <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.65; margin-bottom: 1.25rem;">
            Rayan Marine operates heavy dredging vessels and maritime support barges executing complex coastal capital works, navigational channel deepening, and artificial island reclamation.
          </p>
          <ul style="color: #94a3b8; font-size: 0.95rem; line-height: 1.8; margin-bottom: 2rem; padding-left: 1.25rem;">
            <li>Capital and maintenance dredging to -16m Chart Datum</li>
            <li>Heavy rock armour placement, groynes, and breakwaters</li>
            <li>Industrial quay wall construction and vessel berthing jetties</li>
            <li>Marine environmental monitoring adhering to ISO 14001</li>
          </ul>
          <a href="/contact/" class="btn-enterprise-primary">INQUIRE ON MARINE WORKS →</a>
        </div>
        <div>
          <img src="/assets/images/business/marine-offshore-port.jpg" alt="Marine Works" style="width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 7. BUSINESS SUB-PAGE: INFRASTRUCTURE
// ============================================================================
createRoute('business/infrastructure/index.html', {
  title: 'Heavy Civil Infrastructure & Transportation Corridors',
  description: 'Constructing arterial highways, bridges, urban utility networks, and municipal civil engineering projects.',
  activePath: '/business/infrastructure/',
  heroHtml: renderPageHero({
    category: 'BUSINESS DIVISION 03',
    title: 'HEAVY CIVIL INFRASTRUCTURE',
    description: 'Arterial roadways, grade-separated bridges, earthmoving, urban storm retention, and major utility corridors.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Business', href: '/business/' }, { label: 'Infrastructure', href: '/business/infrastructure/' }],
    bgImage: '/assets/images/business/03-infrastructure.jpg',
    subnav: businessSubnav('/business/infrastructure/')
  }),
  content: `
  <section class="section" style="padding: 6rem 0; background: #07111e;">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.85rem;">CIVIL ARTERIES</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.75rem; font-weight: 800; color: #fff; line-height: 1.15; text-transform: uppercase; margin-bottom: 1.5rem;">CONNECTING INDUSTRIAL &amp; CIVIC GROWTH</h2>
          <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.65; margin-bottom: 1.25rem;">
            From heavy earthworks and grade preparation to high-capacity asphalt highways and reinforced concrete bridges, Rayan Infrastructure builds the foundation of economic progress.
          </p>
          <ul style="color: #94a3b8; font-size: 0.95rem; line-height: 1.8; margin-bottom: 2rem; padding-left: 1.25rem;">
            <li>120+ km of delivered roadway corridors and access roads</li>
            <li>Pre-cast concrete flyovers and pedestrian overpasses</li>
            <li>Stormwater retention ponds and deep gravitational sewers</li>
            <li>Heavy earthmoving fleet exceeding 180 active equipment units</li>
          </ul>
          <a href="/projects/" class="btn-enterprise-primary">VIEW CIVIL PROJECTS →</a>
        </div>
        <div>
          <img src="/assets/images/business/03-infrastructure.jpg" alt="Civil Infrastructure" style="width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 8. BUSINESS SUB-PAGE: ENERGY
// ============================================================================
createRoute('business/energy/index.html', {
  title: 'Onshore & Offshore Energy Facilities EPC',
  description: 'Hydrocarbon pipelines, refinery turnaround contracting, gas compressor stations, and industrial process facilities.',
  activePath: '/business/energy/',
  heroHtml: renderPageHero({
    category: 'BUSINESS DIVISION 04',
    title: 'ENERGY & OFFSHORE EPC',
    description: 'EPC contracting for upstream and downstream hydrocarbon facilities, pipelines, and refinery maintenance.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Business', href: '/business/' }, { label: 'Energy', href: '/business/energy/' }],
    bgImage: '/assets/images/business/energy-refinery-complex.jpg',
    subnav: businessSubnav('/business/energy/')
  }),
  content: `
  <section class="section" style="padding: 6rem 0; background: #07111e;">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.85rem;">CRITICAL HYDROCARBONS</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.75rem; font-weight: 800; color: #fff; line-height: 1.15; text-transform: uppercase; margin-bottom: 1.5rem;">SAFETY &amp; RELIABILITY ACROSS ENERGY ASSETS</h2>
          <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.65; margin-bottom: 1.25rem;">
            Rayan Energy delivers high-spec pipeline engineering, offshore platform reinforcement, pressure vessel tie-ins, and ongoing operational maintenance for leading regional energy operators.
          </p>
          <ul style="color: #94a3b8; font-size: 0.95rem; line-height: 1.8; margin-bottom: 2rem; padding-left: 1.25rem;">
            <li>Cross-country high-pressure gas and liquid hydrocarbon pipelines</li>
            <li>Refinery shutdown maintenance and turnaround contracting</li>
            <li>Cathodic protection, pipeline pigging, and radiographic inspection</li>
            <li>Zero-harm safety track record certified under ISO 45001:2018</li>
          </ul>
          <a href="/sustainability/" class="btn-enterprise-primary">VIEW HSE &amp; SAFETY CREDENTIALS →</a>
        </div>
        <div>
          <img src="/assets/images/business/energy-refinery-complex.jpg" alt="Refinery Pipeline" style="width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 9. BUSINESS SUB-PAGE: LOGISTICS
// ============================================================================
createRoute('business/logistics/index.html', {
  title: 'Heavy Logistics, Cranes & Fleet Management',
  description: 'Operating a fleet of 180+ crawler cranes, specialized multi-axle modular transport, and marine equipment.',
  activePath: '/business/logistics/',
  heroHtml: renderPageHero({
    category: 'BUSINESS DIVISION 05',
    title: 'HEAVY LOGISTICS & INDUSTRIAL FLEET',
    description: 'Specialized crawler cranes, multi-axle hydraulic trailers, maritime tugs, and project cargo shipping.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Business', href: '/business/' }, { label: 'Logistics', href: '/business/logistics/' }],
    bgImage: '/assets/images/business/05-logistics.jpg',
    subnav: businessSubnav('/business/logistics/')
  }),
  content: `
  <section class="section" style="padding: 6rem 0; background: #07111e;">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.85rem;">FLEET POWER</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.75rem; font-weight: 800; color: #fff; line-height: 1.15; text-transform: uppercase; margin-bottom: 1.5rem;">HEAVY EQUIPMENT &amp; GLOBAL PROJECT LOGISTICS</h2>
          <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.65; margin-bottom: 1.25rem;">
            Rayan Heavy Logistics provides internal and third-party logistics support, deploying high-tonnage cranes, marine barges, and specialized heavy transport to meet strict project timelines.
          </p>
          <ul style="color: #94a3b8; font-size: 0.95rem; line-height: 1.8; margin-bottom: 2rem; padding-left: 1.25rem;">
            <li>Crawler cranes up to 750 tonnes lifting capacity</li>
            <li>Hydraulic modular multi-axle trailers for super-heavy industrial loads</li>
            <li>Maritime tugs, anchor handling vessels, and flat-top barges</li>
            <li>Telematics tracking and 24/7 preventative maintenance fleet depots</li>
          </ul>
          <a href="/contact/" class="btn-enterprise-primary">CHARTER &amp; FLEET INQUIRIES →</a>
        </div>
        <div>
          <img src="/assets/images/business/05-logistics.jpg" alt="Logistics Fleet" style="width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        </div>
      </div>
    </div>
  </section>
  `
});

console.log('Business pages generated.');

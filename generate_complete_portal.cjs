const fs = require('fs');
const path = require('path');
const { wrapPage, renderPageHero, ensureDir } = require('./build_multipage_site.cjs');

function createRoute(relativePath, { title, description, activePath, heroHtml, content }) {
  const fullPath = path.join(__dirname, relativePath);
  ensureDir(fullPath);
  const html = wrapPage({ title, description, activePath, heroHtml, content });
  fs.writeFileSync(fullPath, html, 'utf8');
  console.log(`Generated division route: ${relativePath}`);
}

const businessSubnav = (activeHref) => [
  { label: 'Overview', href: '/business/', active: activeHref === '/business/' },
  { label: 'Engineering & Contracting', href: '/business/engineering/', active: activeHref === '/business/engineering/' },
  { label: 'Marine & Dredging', href: '/business/marine/', active: activeHref === '/business/marine/' },
  { label: 'Energy & EPC', href: '/business/energy/', active: activeHref === '/business/energy/' },
  { label: 'Civil Infrastructure', href: '/business/infrastructure/', active: activeHref === '/business/infrastructure/' },
  { label: 'Heavy Fleet Logistics', href: '/business/logistics/', active: activeHref === '/business/logistics/' },
];

// Helper to render standardized division pages (EthosEnergy / NMDC pattern)
function renderDivisionPage({
  number,
  title,
  tagline,
  overview,
  keyStats,
  capabilities,
  services,
  industries,
  equipment,
  safetyQuality,
  featuredProjects,
  divisionKey
}) {
  return `
  <!-- Division Overview & Stats -->
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">OPERATIONAL DIVISION ${number}</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 800; color: #fff; line-height: 1.2; text-transform: uppercase; margin: 0.5rem 0 1.25rem;">
            ${tagline}
          </h2>
          <div style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.5rem;">
            ${overview}
          </div>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a href="/proposal/?division=${divisionKey}" class="btn-enterprise-primary" style="padding: 0.9rem 2rem;">REQUEST A PROPOSAL →</a>
            <a href="#capabilities" class="btn-enterprise-secondary" style="padding: 0.9rem 2rem;">VIEW CAPABILITIES ↓</a>
          </div>
        </div>

        <!-- Verified Key Stats Grid -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          ${keyStats.map(stat => `
            <div>
              <span style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">${stat.label}</span>
              <div style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 900; color: #0099e6; margin: 0.25rem 0;">${stat.value}</div>
              <span style="font-size: 0.8rem; color: #cbd5e1;">${stat.sub}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </section>

  <!-- Core Capabilities & Services -->
  <section class="section" id="capabilities" style="padding: 5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 700px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">TECHNICAL HORSEPOWER</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(1.85rem, 3vw, 2.5rem); font-weight: 800; color: #fff; margin-top: 0.35rem;">CORE CAPABILITIES</h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">Precision engineering, specialized equipment deployment, and end-to-end execution across high-complexity scopes.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.75rem; margin-bottom: 4rem;">
        ${capabilities.map(cap => `
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
            <div style="font-size: 1.8rem; margin-bottom: 0.75rem;">${cap.icon}</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">${cap.title}</h3>
            <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">${cap.desc}</p>
          </div>
        `).join('')}
      </div>

      <!-- Services Breakdown -->
      <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2.5rem;">
        <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: #fff; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">SPECIALIZED SERVICES PORTFOLIO</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
          ${services.map(srv => `
            <div>
              <strong style="color: #0099e6; display: block; font-size: 0.95rem; margin-bottom: 0.25rem;">▸ ${srv.title}</strong>
              <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.5; margin: 0;">${srv.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </section>

  <!-- Industries Served & Equipment / Technology -->
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;" class="intro-grid-responsive">
        
        <!-- Industries Served -->
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">SECTOR IMPACT</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.85rem; font-weight: 800; color: #fff; margin: 0.5rem 0 1.5rem;">INDUSTRIES SERVED</h3>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${industries.map(ind => `
              <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <strong style="color: #fff; font-size: 0.95rem;">${ind.title}</strong>
                  <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 0.2rem;">${ind.desc}</div>
                </div>
                <span style="color: #0099e6; font-weight: 700;">→</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Equipment & Technology -->
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #10b981;">PLANT &amp; SYSTEMS</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.85rem; font-weight: 800; color: #fff; margin: 0.5rem 0 1.5rem;">EQUIPMENT &amp; TECHNOLOGY</h3>
          
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
            <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">
              ${equipment.summary}
            </p>
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.85rem;">
              ${equipment.items.map(item => `
                <li style="display: flex; gap: 0.75rem; align-items: flex-start; font-size: 0.875rem; color: #94a3b8;">
                  <span style="color: #10b981; font-weight: 700;">✓</span>
                  <span><strong style="color: #fff;">${item.name}:</strong> ${item.spec}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- Safety & Quality (QHSE) -->
  <section class="section" style="padding: 4.5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="background: linear-gradient(135deg, #091a2e 0%, #061320 100%); border: 1px solid rgba(0,153,230,0.25); border-radius: 14px; padding: clamp(2rem, 3.5vw, 3rem); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 2rem;">
        <div style="max-width: 680px;">
          <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em;">SAFETY &amp; QUALITY ASSURANCE</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.65rem; color: #fff; margin: 0.35rem 0 0.75rem;">ZERO-HARM QHSE CULTURE</h3>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin: 0;">
            ${safetyQuality}
          </p>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <span style="font-size: 0.75rem; font-weight: 700; padding: 0.5rem 0.85rem; border-radius: 6px; background: rgba(0,153,230,0.15); border: 1px solid rgba(0,153,230,0.3); color: #70c4ff;">ISO 9001:2015</span>
          <span style="font-size: 0.75rem; font-weight: 700; padding: 0.5rem 0.85rem; border-radius: 6px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #34d399;">ISO 14001:2015</span>
          <span style="font-size: 0.75rem; font-weight: 700; padding: 0.5rem 0.85rem; border-radius: 6px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #fbbf24;">ISO 45001:2018</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Projects -->
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 3rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">PROVEN DELIVERIES</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(1.85rem, 3vw, 2.5rem); font-weight: 800; color: #fff; margin-top: 0.35rem;">FEATURED PROJECTS</h2>
        </div>
        <a href="/projects/" class="btn-enterprise-secondary">ALL 16 PROJECTS SHOWCASE →</a>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; margin-bottom: 4rem;">
        ${featuredProjects.map(proj => `
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
            <div style="height: 200px; overflow: hidden;">
              <img src="${proj.image}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="padding: 1.75rem; flex: 1; display: flex; flex-direction: column;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">${proj.sector}</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0.35rem 0 0.5rem;">${proj.title}</h3>
              <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.5; margin-bottom: 1.25rem; flex: 1;">${proj.desc}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem;">
                <span style="font-size: 0.75rem; color: #cbd5e1;">📍 ${proj.location}</span>
                <a href="${proj.href}" style="color: #0099e6; font-size: 0.8rem; font-weight: 700; text-decoration: none;">VIEW CASE STUDY →</a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Action Banner CTA -->
      <div class="action-cta-banner">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.35rem;">COLLABORATE ON YOUR NEXT DEVELOPMENT</span>
          <h3 style="font-family: var(--font-heading); font-size: clamp(1.5rem, 2.5vw, 2.2rem); font-weight: 800; color: #fff; margin: 0;">READY TO START YOUR PROJECT?</h3>
          <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; max-width: 600px;">Submit your tender parameters or schedule a technical consultation with our commercial estimating directors.</p>
        </div>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="/proposal/?division=${divisionKey}" class="btn-enterprise-primary" style="padding: 1rem 2.25rem;">REQUEST A PROPOSAL</a>
          <a href="/contact/" class="btn-enterprise-secondary" style="padding: 1rem 2rem;">TALK TO OUR TEAM</a>
        </div>
      </div>
    </div>
  </section>
  `;
}

// ============================================================================
// 1. BUSINESS OVERVIEW (/business/index.html)
// ============================================================================
createRoute('business/index.html', {
  title: 'Our Businesses, Divisions & Operating Subsidiaries',
  description: 'Explore Rayan Group 5 integrated operational divisions and operating companies across civil engineering, marine dredging, energy EPC, infrastructure, and heavy fleet logistics.',
  activePath: '/business/',
  heroHtml: renderPageHero({
    category: 'CONGLOMERATE CAPABILITIES',
    title: 'OUR BUSINESSES',
    description: 'An integrated multi-disciplinary powerhouse executing landmark civil engineering, marine dredging, energy EPC, heavy infrastructure, and specialized logistics.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Businesses', href: '/business/' }],
    bgImage: '/assets/images/hero/hero-1-skyline.jpg',
    subnav: businessSubnav('/business/')
  }),
  content: `
  <!-- 5 Core Divisions Cards -->
  <section class="section" style="padding: 5rem 0; background: var(--bg-dark); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 760px; margin: 0 auto 4rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">OPERATIONAL SECTORS</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">5 CORE BUSINESS DIVISIONS</h2>
        <p style="color: #94a3b8; font-size: 1rem; margin-top: 0.75rem; line-height: 1.6;">
          Rayan Group operates five specialized operational divisions backed by high-capacity heavy machinery, certified QHSE management, and 50+ years combined executive heritage.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 2rem; margin-bottom: 4rem;">
        <!-- Division 1: Engineering & Contracting -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="height: 220px; overflow: hidden; position: relative;">
            <img src="/assets/images/business/01-engineering.jpg" alt="Engineering & Contracting" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; left: 1rem; background: rgba(0,153,230,0.85); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 4px;">DIVISION 01</span>
          </div>
          <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem;">Engineering &amp; Contracting</h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Turnkey civil EPC, commercial high-rise towers, luxury hospitality overhauls, acoustic auditorium engineering, and certified structural frameworks.
            </p>
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.78rem; color: #10b981; font-weight: 600;">ISO 9001 Certified</span>
              <a href="/business/engineering/" class="btn-enterprise-primary" style="font-size: 0.8rem; padding: 0.5rem 1rem;">EXPLORE DIVISION →</a>
            </div>
          </div>
        </div>

        <!-- Division 2: Marine & Dredging -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="height: 220px; overflow: hidden; position: relative;">
            <img src="/assets/images/hero/hero-2-marine.jpg" alt="Marine & Dredging" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; left: 1rem; background: rgba(0,153,230,0.85); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 4px;">DIVISION 02</span>
          </div>
          <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem;">Marine &amp; Dredging</h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Coastal reclamation, harbor navigation channel deepening, breakwater rock armor, sheet-pile quay walls, and oceanfront cantilevered aquatic works.
            </p>
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.78rem; color: #10b981; font-weight: 600;">Marine Fleets &amp; Barges</span>
              <a href="/business/marine/" class="btn-enterprise-primary" style="font-size: 0.8rem; padding: 0.5rem 1rem;">EXPLORE DIVISION →</a>
            </div>
          </div>
        </div>

        <!-- Division 3: Energy & EPC -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="height: 220px; overflow: hidden; position: relative;">
            <img src="/assets/images/business/energy-refinery-complex.jpg" alt="Energy & EPC" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; left: 1rem; background: rgba(0,153,230,0.85); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 4px;">DIVISION 03</span>
          </div>
          <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem;">Energy &amp; EPC</h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Onshore and industrial process energy facilities, cross-country hydrocarbon transport pipelines, gas compressor terminals, and refinery maintenance.
            </p>
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.78rem; color: #10b981; font-weight: 600;">ASME &amp; API Rigor</span>
              <a href="/business/energy/" class="btn-enterprise-primary" style="font-size: 0.8rem; padding: 0.5rem 1rem;">EXPLORE DIVISION →</a>
            </div>
          </div>
        </div>

        <!-- Division 4: Civil Infrastructure -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="height: 220px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/al-qua-school-infrastructure.jpg" alt="Civil Infrastructure" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; left: 1rem; background: rgba(0,153,230,0.85); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 4px;">DIVISION 04</span>
          </div>
          <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem;">Heavy Civil Infrastructure</h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Highway corridors, large-scale earthmoving, deep stormwater drainage, precast bridges, interlock paving, and municipal utility networks.
            </p>
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.78rem; color: #10b981; font-weight: 600;">Municipal Approvals</span>
              <a href="/business/infrastructure/" class="btn-enterprise-primary" style="font-size: 0.8rem; padding: 0.5rem 1rem;">EXPLORE DIVISION →</a>
            </div>
          </div>
        </div>

        <!-- Division 5: Heavy Fleet Logistics -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="height: 220px; overflow: hidden; position: relative;">
            <img src="/assets/images/about/overview.jpg" alt="Heavy Fleet Logistics" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; left: 1rem; background: rgba(0,153,230,0.85); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 4px;">DIVISION 05</span>
          </div>
          <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem;">Heavy Fleet Logistics</h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              High-capacity crawler and mobile crane hire up to 750 tonnes, multi-axle hydraulic transport, engineered heavy lifting, and plant mobilization.
            </p>
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.78rem; color: #10b981; font-weight: 600;">Up to 750T Rigging</span>
              <a href="/business/logistics/" class="btn-enterprise-primary" style="font-size: 0.8rem; padding: 0.5rem 1rem;">EXPLORE DIVISION →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Operating Subsidiaries Card (NMDC Pattern) -->
  <section class="business-units-section" id="companies" aria-label="Group Companies and Subsidiaries" style="padding: 5rem 0; background: #07111e;">
    <div class="container">
      <div class="business-units-header">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--brand-cyan, #0099e6); display: block; margin-bottom: 0.5rem;">CONGLOMERATE SUBSIDIARIES</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.8vw, 3.25rem); font-weight: 800; color: #fff; text-transform: uppercase; line-height: 1.15; margin: 0 0 0.85rem;">OPERATING COMPANIES &amp; SUBSIDIARIES</h2>
        <p style="font-size: 1.05rem; line-height: 1.65; color: #cbd5e1; max-width: 660px; margin: 0 auto;">
          An integrated ecosystem of specialized civil engineering, energy facilities, South Asia infrastructure, and premier properties operating under unified governance.
        </p>
      </div>

      <div class="bu-card-container">
        <div class="bu-card">
          <div class="bu-top-bar">
            <span class="bu-top-label">BUSINESS UNITS</span>
            <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 600; letter-spacing: 0.05em;">RAYAN ENTERPRISE MATRIX</span>
          </div>

          <div class="bu-slides-viewport" role="region" aria-live="polite">
            <!-- Slide 0: Rayan Group -->
            <div class="bu-slide active" data-slide="0">
              <div class="bu-logo-col">
                <img src="/assets/logos/rayan-group-white.png" alt="Rayan Group" width="240" height="70">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Rayan Group</h3>
                  <span class="bu-badge bu-badge-holding">PARENT HOLDING</span>
                </div>
                <p class="bu-company-desc">
                  The premier multinational holding conglomerate orchestrating landmark civil engineering, critical energy infrastructure, and regional capital ventures. Headquartered in Abu Dhabi with expanding multinational corridors, Rayan Group unites specialized divisions under rigorous engineering precision and fiduciary stewardship.
                </p>
                <a href="/about/" class="bu-action-link">
                  <span class="bu-action-box">↗</span>
                  <span>Explore Group Overview</span>
                </a>
              </div>
            </div>

            <!-- Slide 1: Rayan Engineering -->
            <div class="bu-slide" data-slide="1">
              <div class="bu-logo-col">
                <img src="/assets/logos/rayan-engineering-white.png" alt="Rayan Engineering" width="240" height="75">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Rayan Engineering &amp; Contracting</h3>
                  <span class="bu-badge bu-badge-active">CIVIL &amp; GENERAL CONTRACTING</span>
                </div>
                <p class="bu-company-desc">
                  The flagship engineering enterprise executing turnkey building construction, high-rise commercial towers, luxury residential estates, and complex industrial complexes across the UAE. With 50+ years of combined leadership heritage, Rayan Engineering sets benchmarks in structural excellence.
                </p>
                <a href="/business/engineering/" class="bu-action-link">
                  <span class="bu-action-box">↗</span>
                  <span>Visit Engineering Division</span>
                </a>
              </div>
            </div>

            <!-- Slide 2: Rayan Energy -->
            <div class="bu-slide" data-slide="2">
              <div class="bu-logo-col">
                <img src="/assets/logos/rayan-energy-white.png" alt="Rayan Energy" width="240" height="75">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Rayan Energy</h3>
                  <span class="bu-badge bu-badge-active">OIL, GAS &amp; PROCESS FACILITIES</span>
                </div>
                <p class="bu-company-desc">
                  Powering mission-critical energy infrastructure through onshore and process EPC services, strategic hydrocarbon pipeline corridors, petrochemical process plants, and refinery turnaround execution to strict ISO 45001 standards.
                </p>
                <a href="/business/energy/" class="bu-action-link">
                  <span class="bu-action-box">↗</span>
                  <span>Visit Energy Division</span>
                </a>
              </div>
            </div>

            <!-- Slide 3: Ashaz Engineering (India) -->
            <div class="bu-slide" data-slide="3">
              <div class="bu-logo-col">
                <img src="/assets/logos/ashaz-engineering-white.png" alt="Ashaz Engineering (India)" width="200" height="150">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Ashaz Engineering (India)</h3>
                  <span class="bu-badge bu-badge-india">SOUTH ASIA REGIONAL HUB</span>
                </div>
                <p class="bu-company-desc">
                  Rayan Group's strategic South Asia engineering and regional contracting arm based in Bettiah and New Delhi. Ashaz Engineering delivers heavy civil works, structural fabrication, industrial infrastructure, and technical contracting.
                </p>
                <a href="/about/#india-hub" class="bu-action-link">
                  <span class="bu-action-box">↗</span>
                  <span>Explore Ashaz Regional Hub</span>
                </a>
              </div>
            </div>

            <!-- Slide 4: Rayan Properties -->
            <div class="bu-slide" data-slide="4">
              <div class="bu-logo-col">
                <img src="/assets/logos/rayan-properties-white.png" alt="Rayan Properties" width="240" height="72">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Rayan Properties</h3>
                  <span class="bu-badge bu-badge-upcoming">UPCOMING DIVISION</span>
                </div>
                <p class="bu-company-desc">
                  Rayan Group's upcoming premier real estate development enterprise. Curating ultra-luxury waterfront estates, master-planned residential communities, architectural landmark high-rises, and prime commercial destinations across UAE metropolitan locations.
                </p>
                <a href="/contact/" class="bu-action-link">
                  <span class="bu-action-box">↗</span>
                  <span>Upcoming Division • Register Interest</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Bottom Selector Pills Row -->
          <div class="bu-pills-row" role="tablist" aria-label="Company Selector Tabs">
            <button type="button" class="bu-pill active" data-index="0" role="tab" aria-selected="true">
              <span class="bu-pill-slash" style="color: #0099e6;">/</span>
              <div>
                <span class="bu-pill-label">Rayan Group</span>
                <span class="bu-pill-subtag">Parent Holding</span>
              </div>
            </button>

            <button type="button" class="bu-pill" data-index="1" role="tab" aria-selected="false">
              <span class="bu-pill-slash" style="color: #00c7b3;">/</span>
              <div>
                <span class="bu-pill-label">Rayan Engineering</span>
                <span class="bu-pill-subtag">Civil &amp; EPC</span>
              </div>
            </button>

            <button type="button" class="bu-pill" data-index="2" role="tab" aria-selected="false">
              <span class="bu-pill-slash" style="color: #00ad61;">/</span>
              <div>
                <span class="bu-pill-label">Rayan Energy</span>
                <span class="bu-pill-subtag">Oil, Gas &amp; Energy</span>
              </div>
            </button>

            <button type="button" class="bu-pill" data-index="3" role="tab" aria-selected="false">
              <span class="bu-pill-slash" style="color: #14949b;">/</span>
              <div>
                <span class="bu-pill-label">Ashaz Engineering</span>
                <span class="bu-pill-subtag">India Regional Hub</span>
              </div>
            </button>

            <button type="button" class="bu-pill" data-index="4" role="tab" aria-selected="false">
              <span class="bu-pill-slash" style="color: #f59e0b;">/</span>
              <div>
                <span class="bu-pill-label">Rayan Properties</span>
                <span class="bu-pill-subtag" style="color: #fbbf24;">Upcoming</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 2. DIVISION: ENGINEERING & CONTRACTING (/business/engineering/index.html)
// ============================================================================
createRoute('business/engineering/index.html', {
  title: 'Engineering & Contracting | Turnkey Civil EPC | Rayan Group',
  description: 'Full-lifecycle turnkey building construction, commercial high-rise towers, luxury hospitality overhauls, acoustic engineering, and structural concrete frameworks.',
  activePath: '/business/engineering/',
  heroHtml: renderPageHero({
    category: 'BUSINESS DIVISION 01',
    title: 'ENGINEERING & CONTRACTING',
    description: 'Turnkey civil contracting, commercial high-rises, luxury resort renovations, specialized acoustic installations, and certified structural frameworks across the UAE.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Businesses', href: '/business/' }, { label: 'Engineering & Contracting', href: '/business/engineering/' }],
    bgImage: '/assets/images/business/01-engineering.jpg',
    subnav: businessSubnav('/business/engineering/')
  }),
  content: renderDivisionPage({
    number: '01',
    title: 'Engineering & Contracting',
    tagline: 'TURNKEY CIVIL EPC & HIGH-SPECIFICATION CONSTRUCTION',
    divisionKey: 'engineering',
    overview: `
      Rayan Engineering &amp; Contracting is our flagship civil delivery division, executing high-complexity construction across the United Arab Emirates. With over 50 years of combined executive leadership heritage, we manage projects from deep shoring and foundation piling through post-tensioned concrete superstructures, integrated MEP systems, and bespoke architectural handover.
      <br><br>
      Our project portfolio spans major shopping destinations, 5-star luxury hospitality overhauls, commercial high-rise towers, and specialized tactical defense infrastructure for clients including Brock Construction, Emaar, Hilton/Waldorf Astoria, and defense entities.
    `,
    keyStats: [
      { label: 'Leadership Heritage', value: '50+ Yrs', sub: 'Combined Executive Track Record' },
      { label: 'Core Projects', value: '16 Verified', sub: 'Landmark UAE Deliveries' },
      { label: 'Quality Audit', value: 'ISO 9001', sub: '2015 Bureau Veritas Certified' },
      { label: 'Delivery Model', value: 'Turnkey', sub: 'EPC / Design & Build / Fit-out' }
    ],
    capabilities: [
      { icon: '🏢', title: 'Commercial & High-Rise Construction', desc: 'Turnkey structural concrete frameworks, post-tensioned slabs, glass curtain-wall facades, and high-capacity vertical transportation coordination.' },
      { icon: '🏨', title: 'Luxury Hospitality Renovation', desc: 'Accelerated-schedule hotel overhauls, acoustic ceiling isolation, bespoke joinery, MEP reconfigurations, and luxury suite modernizations.' },
      { icon: '🎯', title: 'Specialized Defense & Tactical Works', desc: 'Ballistic baffle walls, specialized structural isolation, secure facilities, and high-precision tactical defense infrastructure.' },
      { icon: '🎬', title: 'Acoustic & VIP Interior Fit-Out', desc: 'STC-rated acoustic partitions, cinema stadium seating frameworks, luxury mall retail precincts, and commercial fit-out.' },
      { icon: '🏗️', title: 'Deep Foundations & Shoring', desc: 'Secant piling, contiguous shoring walls, ground dewatering, and heavy raft foundations for high-load urban structures.' },
      { icon: '⚡', title: 'Turnkey MEP & Building Automation', desc: 'High-voltage switchgear, central HVAC chiller plants, fire life-safety suppression, and integrated BMS building controls.' }
    ],
    services: [
      { title: 'Turnkey General Contracting', desc: 'Full-scope management of construction sites under single-point FIDIC contracts.' },
      { title: 'Value Engineering', desc: 'Optimizing structural design, material selection, and MEP routing to reduce capital costs.' },
      { title: 'Hospitality Refurbishment', desc: 'Operational facility upgrades executed without disrupting guest operations.' },
      { title: 'Commercial Retail Fit-Out', desc: 'Flagship brand store construction in premier regional shopping destinations.' },
      { title: 'Structural Strengthening', desc: 'Carbon fiber (CFRP) reinforcement, slab post-tensioning, and load-bearing alterations.' }
    ],
    industries: [
      { title: 'Commercial Retail & Malls', desc: 'Large-scale shopping destinations and mall extensions (e.g. Al Wahda Mall, Dubai Hills Mall).' },
      { title: 'Luxury Hospitality & Resorts', desc: '5-star hotels and waterfront leisure properties (e.g. Waldorf Astoria RAK).' },
      { title: 'Prime Residential Estates', desc: 'Bespoke coastal mansions, private villas, and high-rise residences.' },
      { title: 'Defense & Institutional', desc: 'Tactical facilities, civic training centers, and secure installations.' }
    ],
    equipment: {
      summary: 'Rayan Engineering operates state-of-the-art construction plant, digital BIM design suites, and certified surveying instruments to ensure millimeter-accurate construction tolerances.',
      items: [
        { name: 'BIM & 3D Coordination', spec: 'Autodesk Revit & Navisworks clash-detection platforms.' },
        { name: 'Precision Surveying', spec: 'Leica robotic total stations and 3D terrestrial laser scanners.' },
        { name: 'Heavy Lifting Systems', spec: 'High-capacity tower cranes and internal climbing systems.' },
        { name: 'Concrete Technology', spec: 'Automated batching control and laser screed floor leveling.' }
      ]
    },
    safetyQuality: 'Rayan Engineering adheres to certified ISO 9001:2015 Quality Management and ISO 45001:2018 Occupational Health & Safety. Every construction yard operates under zero-harm site protocols with full-time NEBOSH-certified safety inspectors.',
    featuredProjects: [
      { title: 'Waldorf Astoria Luxury Hotel Overhaul', sector: '5-Star Hospitality EPC', image: '/assets/images/projects/waldorf-astoria-renovation-rak.jpg', desc: 'Comprehensive interior fit-out, MEP modernization, and acoustic upgrades in Ras Al Khaimah in partnership with Brock Construction.', location: 'Ras Al Khaimah, UAE', href: '/projects/waldorf-astoria-renovation-rak/' },
      { title: 'C2 Towers Twin High-Rise Development', sector: 'Commercial & High-Rise', image: '/assets/images/projects/c2-towers-al-bateen.jpg', desc: 'Twin 22-story waterfront residential towers featuring post-tensioned slabs, deep basements, and luxury finishes.', location: 'Al Bateen, Abu Dhabi', href: '/projects/c2-towers-al-bateen/' },
      { title: 'EDGE Group REMAYA Tactical Complex', sector: 'Defense & Special Works', image: '/assets/images/projects/edge-group-remaya.jpg', desc: 'Specialized defense tactical shooting complex incorporating acoustic baffling and heavy structural containment.', location: 'Abu Dhabi, UAE', href: '/projects/edge-group-remaya/' }
    ]
  })
});

// ============================================================================
// 3. DIVISION: MARINE & DREDGING (/business/marine/index.html)
// ============================================================================
createRoute('business/marine/index.html', {
  title: 'Marine & Dredging | Coastal Engineering & Reclamation | Rayan Group',
  description: 'Coastal reclamation, navigation channel deepening, breakwater rock armor, sheet piling, quay walls, and oceanfront aquatic engineering.',
  activePath: '/business/marine/',
  heroHtml: renderPageHero({
    category: 'BUSINESS DIVISION 02',
    title: 'MARINE & DREDGING',
    description: 'Harbor deepening, land reclamation, coastal protection revetments, quay wall construction, and bespoke oceanfront aquatic structures across the UAE coast.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Businesses', href: '/business/' }, { label: 'Marine & Dredging', href: '/business/marine/' }],
    bgImage: '/assets/images/hero/hero-2-marine.jpg',
    subnav: businessSubnav('/business/marine/')
  }),
  content: renderDivisionPage({
    number: '02',
    title: 'Marine & Dredging',
    tagline: 'SHAPING COASTLINES & OFFSHORE WATERFRONT HORIZONS',
    divisionKey: 'marine',
    overview: `
      Rayan Marine &amp; Dredging delivers specialized coastal and maritime engineering solutions. From deep-water navigation channel deepening and coastal reclamation to heavy rock armor breakwaters and precast quay walls, our marine operations combine specialized marine plant with geotechnical precision.
      <br><br>
      Our coastal engineering capabilities also encompass complex oceanfront aquatic installations—such as the landmark 50-meter cantilevered concrete oceanfront pool on Luxury Island and coastal stabilization works along Palm Jumeirah.
    `,
    keyStats: [
      { label: 'Marine Expertise', value: 'Turnkey', sub: 'Deep Dredging & Coastal Armor' },
      { label: 'Coastal Scope', value: 'Reclamation', sub: 'Harbor Deepening & Quay Walls' },
      { label: 'Environmental QHSE', value: 'ISO 14001', sub: 'Marine Ecology Protection' },
      { label: 'Specialized Works', value: 'Aquatic EPC', sub: 'Cantilevered Oceanfront Structures' }
    ],
    capabilities: [
      { icon: '🌊', title: 'Capital & Maintenance Dredging', desc: 'Navigational channel deepening, port basin excavation, and removal of marine sediment to precise hydrographic depths.' },
      { icon: '🏝️', title: 'Land Reclamation & Island Development', desc: 'Engineered placement of dredged marine fill, dynamic compaction, vibroflotation, and geotextile slope stabilization.' },
      { icon: '🧱', title: 'Breakwaters & Coastal Protection', desc: 'Heavy rock armoring, core-loc concrete accropodes, revetments, and shoreline wave dissipation systems.' },
      { icon: '⚓', title: 'Quay Walls, Jetties & Marinas', desc: 'Precast concrete block quay walls, steel sheet-pile bulkheads, pontoon mooring berths, and marina infrastructure.' },
      { icon: '🏊', title: 'Oceanfront Aquatic Engineering', desc: 'High-complexity cantilevered concrete aquatic pools, marine saltwater filtration systems, and coastal landscaping.' },
      { icon: '🛰️', title: 'Hydrographic & Bathymetric Survey', desc: 'Multibeam sonar seabed mapping, real-time RTK GPS dredging tracking, and environmental turbidity monitoring.' }
    ],
    services: [
      { title: 'Navigation Dredging', desc: 'Precision excavation of berths, approach channels, and turning basins.' },
      { title: 'Coastal Erosion Control', desc: 'Engineered rock revetments and groynes to safeguard coastal assets.' },
      { title: 'Sheet Pile Bulkheads', desc: 'High-strength steel sheet piling for marina basin containment.' },
      { title: 'Marine Concrete Structures', desc: 'Saltwater-resistant sulphate-resistant concrete marine foundations.' }
    ],
    industries: [
      { title: 'Port & Maritime Authorities', desc: 'Commercial shipping channels, harbor expansions, and port facilities.' },
      { title: 'Waterfront Developers', desc: 'Private coastal islands, luxury beach resorts, and marina precincts.' },
      { title: 'Coastal Infrastructure', desc: 'Municipal sea defenses, storm surge barriers, and coastal highway revetments.' }
    ],
    equipment: {
      summary: 'Our marine operations deploy a versatile fleet of cutter suction dredging plant, spud-leg barges, long-reach marine excavators, and precision hydrographic surveying vessels.',
      items: [
        { name: 'Dredging Equipment', spec: 'Cutter suction and marine backhoe dredgers with RTK GPS monitoring.' },
        { name: 'Marine Transport', spec: 'Split hopper barges and heavy marine tugboats.' },
        { name: 'Long-Reach Excavators', spec: '24m-reach marine backhoe units for underwater rock placement.' },
        { name: 'Hydrographic Systems', spec: 'Dual-frequency multibeam sonar with real-time seabed depth logging.' }
      ]
    },
    safetyQuality: 'Our marine division operates under strict ISO 14001:2015 Marine Environmental protocols. Silt curtains and real-time turbidity sensors ensure marine ecology and coral ecosystems remain fully protected throughout offshore execution.',
    featuredProjects: [
      { title: 'Luxury Island 50m Oceanfront Cantilevered Pool', sector: 'Aquatic & Coastal Engineering', image: '/assets/images/projects/luxury-island-infinity-pool.jpg', desc: 'Engineering a signature 50-meter cantilevered concrete swimming pool extending over the marine coastline with high-grade marine waterproofing.', location: 'Private Coastal Island, UAE', href: '/projects/luxury-island-infinity-pool/' },
      { title: 'Palm Jumeirah Ultra-Luxury Waterfront Coastal Works', sector: 'Coastal Residential EPC', image: '/assets/images/projects/palm-jumeirah-rec-estate.jpg', desc: 'Waterfront ground stabilization, custom coastal retaining structures, and luxury estate civil execution.', location: 'Palm Jumeirah, Dubai', href: '/projects/palm-jumeirah-rec-estate/' }
    ]
  })
});

// ============================================================================
// 4. DIVISION: ENERGY & EPC (/business/energy/index.html)
// ============================================================================
createRoute('business/energy/index.html', {
  title: 'Energy & EPC | Hydrocarbon Facilities & Process Piping | Rayan Group',
  description: 'Onshore and industrial energy facilities, cross-country hydrocarbon transport pipelines, gas compressor terminals, pressure vessel works, and refinery maintenance.',
  activePath: '/business/energy/',
  heroHtml: renderPageHero({
    category: 'BUSINESS DIVISION 03',
    title: 'ENERGY & EPC',
    description: 'EPC contracting for upstream and downstream hydrocarbon facilities, cross-country pipelines, process plants, and refinery maintenance to strict ISO 45001 standards.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Businesses', href: '/business/' }, { label: 'Energy & EPC', href: '/business/energy/' }],
    bgImage: '/assets/images/business/energy-refinery-complex.jpg',
    subnav: businessSubnav('/business/energy/')
  }),
  content: renderDivisionPage({
    number: '03',
    title: 'Energy & EPC',
    tagline: 'CRITICAL ENERGY FACILITIES & INDUSTRIAL PIPELINE INFRASTRUCTURE',
    divisionKey: 'energy',
    overview: `
      Rayan Energy provides specialized engineering, procurement, and construction (EPC) solutions for critical hydrocarbon, industrial process, and energy infrastructure. We execute onshore process piping, storage tank farms, compressor terminal installations, and refinery shutdown maintenance.
      <br><br>
      Operating in full compliance with ASME, API, and ADNOC-aligned engineering specifications, Rayan Energy combines multi-disciplinary mechanical, electrical, and instrumentation expertise with an uncompromising zero-harm safety record.
    `,
    keyStats: [
      { label: 'Energy Standards', value: 'ASME / API', sub: 'High-Pressure Code Compliant' },
      { label: 'Safety Track Record', value: 'Zero Harm', sub: 'ISO 45001 Certified Procedures' },
      { label: 'Scope Expertise', value: 'Turnkey EPC', sub: 'Piping, Tanks & Terminals' },
      { label: 'Regional Reach', value: 'UAE & India', sub: 'Dual Strategic Hubs' }
    ],
    capabilities: [
      { icon: '🛢️', title: 'Hydrocarbon Cross-Country Pipelines', desc: 'Trenching, stringing, automated orbital welding, cathodic protection, hydrostatic testing, and intelligent pigging for oil & gas transport.' },
      { icon: '🏭', title: 'Storage Tank Farms & Terminals', desc: 'API 650 / API 620 storage tank fabrication, floating roof installations, bund wall construction, and hydrocarbon manifold piping.' },
      { icon: '⚙️', title: 'Process Plant Mechanical EPC', desc: 'Process equipment installation, heat exchangers, pressure vessels, rotating machinery alignment, and high-pressure steam systems.' },
      { icon: '🔧', title: 'Plant Turnaround & Shutdowns', desc: 'Scheduled refinery turnaround contracting, valve overhaul, flare line maintenance, and accelerated-schedule shutdown execution.' },
      { icon: '⚡', title: 'Electrical & Instrumentation (E&I)', desc: 'Explosion-proof hazardous area installations, DCS/SCADA integration, pneumatic instrumentation, and cable tray raceways.' },
      { icon: '🔬', title: 'Non-Destructive Testing (NDT)', desc: '100% radiographic, ultrasonic, magnetic particle, and dye penetrant inspection by ASNT Level II/III certified personnel.' }
    ],
    services: [
      { title: 'Pipeline EPC', desc: 'Complete civil and mechanical execution of high-pressure pipeline corridors.' },
      { title: 'Tank Farm Construction', desc: 'Turnkey fuel and chemical storage facilities with automated gauging.' },
      { title: 'Plant Shutdown Services', desc: 'Safe, fast-track mechanical execution during scheduled refinery overhauls.' },
      { title: 'Cathodic Protection', desc: 'Impressed current and sacrificial anode corrosion mitigation systems.' }
    ],
    industries: [
      { title: 'Upstream & Downstream Hydrocarbons', desc: 'Oil & gas producers, refineries, and petrochemical processing complexes.' },
      { title: 'Energy Distribution & Storage', desc: 'Strategic fuel storage terminals and regional distribution pipelines.' },
      { title: 'Industrial Utilities', desc: 'High-pressure steam, natural gas, and industrial process plants.' }
    ],
    equipment: {
      summary: 'Our energy division operates automated pipeline welding systems, calibrated hydrostatic testing manifolds, radiographic NDT equipment, and dedicated pipe fabrication yards in the UAE and India.',
      items: [
        { name: 'Automated Welding', spec: 'Lincoln Electric orbital pipeline welding systems and certified welders.' },
        { name: 'Hydrostatic Testing', spec: 'High-pressure test skids with computerized pressure-time logging up to 500 bar.' },
        { name: 'NDT Inspection', spec: 'X-ray crawler units and phased-array ultrasonic testing (PAUT) systems.' },
        { name: 'Pipe Bending & Handling', spec: 'Hydraulic field cold-bending machines up to 48-inch diameter pipe.' }
      ]
    },
    safetyQuality: 'Rayan Energy operates strict Permit-to-Work (PTW), Confined Space Entry, and Hazardous Energy Lockout-Tagout (LOTO) procedures. We hold verified ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 certifications.',
    featuredProjects: [
      { title: 'Hydrocarbon Storage Tank Farm & Piping', sector: 'Energy & Industrial EPC', image: '/assets/images/business/energy-refinery-complex.jpg', desc: 'Turnkey storage tank mechanical erection, interconnecting manifold piping, and automated fire suppression systems.', location: 'UAE Energy Corridor', href: '/business/energy/' },
      { title: 'Industrial Substation Civil & Mechanical Works', sector: 'Energy Infrastructure', image: '/assets/images/about/overview.jpg', desc: 'Reinforced concrete blast-resistant substation building and specialized cable trench networks.', location: 'Abu Dhabi Industrial Zone', href: '/business/energy/' }
    ]
  })
});

// ============================================================================
// 5. DIVISION: HEAVY CIVIL INFRASTRUCTURE (/business/infrastructure/index.html)
// ============================================================================
createRoute('business/infrastructure/index.html', {
  title: 'Heavy Civil Infrastructure | Highways, Earthworks & Utilities | Rayan Group',
  description: 'Highway corridors, bulk earthworks, site grading, stormwater drainage, bridges, interlock paving, and municipal utility networks across the UAE.',
  activePath: '/business/infrastructure/',
  heroHtml: renderPageHero({
    category: 'BUSINESS DIVISION 04',
    title: 'HEAVY CIVIL INFRASTRUCTURE',
    description: 'Highway corridors, bridges, bulk earthmoving, subgrade stabilization, stormwater networks, and civic utility infrastructure across the UAE.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Businesses', href: '/business/' }, { label: 'Civil Infrastructure', href: '/business/infrastructure/' }],
    bgImage: '/assets/images/projects/al-qua-school-infrastructure.jpg',
    subnav: businessSubnav('/business/infrastructure/')
  }),
  content: renderDivisionPage({
    number: '04',
    title: 'Heavy Civil Infrastructure',
    tagline: 'ARTERIAL HIGHWAYS, BULK EARTHWORKS & MUNICIPAL UTILITY CORRIDORS',
    divisionKey: 'infrastructure',
    overview: `
      Rayan Civil Infrastructure delivers the foundational backbone of regional urban and transport growth. Specializing in arterial road corridors, massive bulk earthmoving, deep municipal wet and dry utilities, and civic facility infrastructure, we transform challenging terrain into build-ready developments.
      <br><br>
      From delivering over 35,000 square meters of high-durability interlock paving and infrastructure for the Al Qua School campus to executing road and utility corridors for major master-planned developments, our infrastructure division sets benchmarks in speed, compaction quality, and municipal compliance.
    `,
    keyStats: [
      { label: 'Campus Infrastructure', value: '35,000+ m²', sub: 'Paving Delivered at Al Qua' },
      { label: 'Earthmoving Fleet', value: 'Heavy Plant', sub: 'Excavators, Graders & Rollers' },
      { label: 'Quality Compliance', value: 'ISO 9001', sub: 'Municipality Approved Testing' },
      { label: 'Civil Deliveries', value: 'Turnkey', sub: 'Roads, Drainage & Networks' }
    ],
    capabilities: [
      { icon: '🛣️', title: 'Highway & Arterial Road Construction', desc: 'Subgrade stabilization, aggregate road base laying, asphalt paving, curb installation, and directional signage.' },
      { icon: '🚜', title: 'Bulk Earthmoving & Site Grading', desc: 'Millions of cubic meters of cut-and-fill, rocky excavation, precision laser grading, and structural platform compaction.' },
      { icon: '🌧️', title: 'Stormwater & Drainage Networks', desc: 'Deep stormwater trunk lines, precast culverts, retention ponds, soakaway systems, and underground attenuation tanks.' },
      { icon: '🚰', title: 'Potable Water & Sewerage Networks', desc: 'Ductile iron and HDPE water transmission mains, gravity sewer pipelines, manholes, and pumping station civil works.' },
      { icon: '🧱', title: 'Large-Scale Paving & Civic Infrastructure', desc: 'Heavy-duty interlocking concrete paving for schools, civic plazas, logistics yards, and commercial transport terminals.' },
      { icon: '🌉', title: 'Bridges & Culvert Structures', desc: 'Reinforced concrete substructures, precast prestressed bridge girders, approach ramps, and retaining walls.' }
    ],
    services: [
      { title: 'Arterial Road Construction', desc: 'Asphalt paving and full-depth roadway construction to municipal standards.' },
      { title: 'Deep Drainage Networks', desc: 'Trenching, pipe laying, and backfill under strict density testing.' },
      { title: 'Campus Site Development', desc: 'Comprehensive civil works for schools, hospitals, and institutional grounds.' },
      { title: 'Subgrade Soil Stabilization', desc: 'Chemical and mechanical soil improvement for heavy structural platforms.' }
    ],
    industries: [
      { title: 'Municipal & Transport Authorities', desc: 'Government highways, urban arterial roads, and municipal drainage systems.' },
      { title: 'Master Community Developers', desc: 'Residential township infrastructure, utility networks, and access corridors.' },
      { title: 'Educational & Civic Institutions', desc: 'Large educational campuses, sports complexes, and government facilities.' }
    ],
    equipment: {
      summary: 'Our civil infrastructure division operates Caterpillar, Komatsu, and Dynapac heavy earthmoving fleets equipped with 3D GPS automated machine guidance for millimeter-accurate grade control.',
      items: [
        { name: 'Earthmoving Fleets', spec: 'Heavy hydraulic excavators up to 50T and high-capacity articulated dump trucks.' },
        { name: 'Grade Control', spec: 'CAT 140M motor graders equipped with Trimble 3D GPS machine control.' },
        { name: 'Compaction Equipment', spec: '15T-20T vibratory soil compactors with continuous compaction value (CCV) logging.' },
        { name: 'Paving Equipment', spec: 'Asphalt pavers and mechanical interlock paving machines for accelerated delivery.' }
      ]
    },
    safetyQuality: 'All civil infrastructure works undergo certified in-situ nuclear density testing, California Bearing Ratio (CBR) verification, and asphalt core sampling approved by UAE municipalities and international testing bodies.',
    featuredProjects: [
      { title: 'Al Qua School 35,000+ sqm Infrastructure & Paving', sector: 'Educational Civic Infrastructure', image: '/assets/images/projects/al-qua-school-infrastructure.jpg', desc: 'Over 35,000 sqm of high-durability interlock paving, subbase grading, and stormwater drainage for campus operations.', location: 'Abu Dhabi Region, UAE', href: '/projects/al-qua-school-infrastructure/' },
      { title: 'Silicon Oasis Residential & Infrastructure Works', sector: 'Highway & Civil EPC', image: '/assets/images/projects/silicon-oasis-residence.jpg', desc: 'Civil site preparation, structural foundation execution, and utility interconnections for mixed-use development.', location: 'Dubai Silicon Oasis, UAE', href: '/projects/silicon-oasis-residence/' }
    ]
  })
});

// ============================================================================
// 6. DIVISION: HEAVY FLEET LOGISTICS (/business/logistics/index.html)
// ============================================================================
createRoute('business/logistics/index.html', {
  title: 'Heavy Fleet Logistics | Crane Hire up to 750T & Heavy Lift | Rayan Group',
  description: 'Heavy crane rental up to 750 tonnes, multi-axle modular transport (SPMT), engineered heavy lifting, plant maintenance, and site equipment mobilization.',
  activePath: '/business/logistics/',
  heroHtml: renderPageHero({
    category: 'BUSINESS DIVISION 05',
    title: 'HEAVY FLEET LOGISTICS',
    description: 'High-capacity crane rental up to 750 tonnes, modular hydraulic transport, engineered lift planning, and heavy equipment mobilization across the UAE.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Businesses', href: '/business/' }, { label: 'Heavy Fleet Logistics', href: '/business/logistics/' }],
    bgImage: '/assets/images/about/overview.jpg',
    subnav: businessSubnav('/business/logistics/')
  }),
  content: renderDivisionPage({
    number: '05',
    title: 'Heavy Fleet Logistics',
    tagline: 'HIGH-CAPACITY HEAVY LIFTS & SPECIALIZED RIGGING LOGISTICS',
    divisionKey: 'logistics',
    overview: `
      Rayan Heavy Fleet Logistics powers critical lifting and transport operations across the region. Backed by high-tonnage mobile cranes and crawler cranes with capacities up to 750 tonnes, multi-axle hydraulic transport trailers, and certified rigging engineers, we provide complete engineered lifting solutions.
      <br><br>
      From erecting heavy precast beams and structural high-rise steel on commercial towers to mobilizing oversized refinery vessels and marine equipment, our logistics division ensures safe, timely, and certified equipment support.
    `,
    keyStats: [
      { label: 'Lifting Capacity', value: 'Up to 750T', sub: 'Heavy Crawler & Mobile Cranes' },
      { label: 'Rigging Engineering', value: 'Certified', sub: '3D CAD Lift Planning Studies' },
      { label: 'Safety Standards', value: 'LOLER & OSHA', sub: 'Third-Party Certified Gear' },
      { label: 'Fleet Base', value: 'Mussafah M-36', sub: 'Central Industrial Yard & Workshops' }
    ],
    capabilities: [
      { icon: '🏗️', title: 'Heavy Mobile & Crawler Crane Hire', desc: 'Fleet ranging from 50T all-terrain cranes to 750T heavy crawler cranes for complex industrial and structural erection.' },
      { icon: '🚛', title: 'Oversized & Heavy Haulage Transport', desc: 'Multi-axle hydraulic modular trailers, low-bed transporters, and specialized transport for indivisible heavy equipment loads.' },
      { icon: '📐', title: 'Engineered 3D Lift Planning', desc: 'Comprehensive lift studies, ground bearing pressure assessments, outrigger mat calculations, and tandem lift engineering.' },
      { icon: '⚙️', title: 'Plant Maintenance & Fleet Depot', desc: 'Central maintenance workshops in Mussafah M-36 ensuring 98%+ fleet availability and predictive component servicing.' },
      { icon: '👷', title: 'Certified Rigging & Slinging Crews', desc: 'Third-party certified crane operators, banksmen, and rigging supervisors trained to international LOLER standards.' },
      { icon: '📡', title: '24/7 Telemetry & Fleet Tracking', desc: 'Real-time GPS tracking, load-moment indicator (LMI) diagnostics, and automated preventive maintenance alerts.' }
    ],
    services: [
      { title: 'Heavy Crane Rental', desc: 'Dry and wet lease options with fully certified operating crew.' },
      { title: 'Engineered Rigging Consultancy', desc: 'Method statements, risk assessments, and CAD rigging diagrams.' },
      { title: 'Heavy Plant Mobilization', desc: 'Fast-track site equipment delivery and assembly across the UAE.' },
      { title: 'Turnkey Project Heavy Lifting', desc: 'Single-point management of all lifting operations on megaproject sites.' }
    ],
    industries: [
      { title: 'High-Rise & Megaproject Construction', desc: 'Structural steel erection, tower crane erection, and precast beam placement.' },
      { title: 'Energy & Oil/Gas Facilities', desc: 'Refinery reactor lifting, column installations, and turnaround equipment.' },
      { title: 'Marine & Offshore Shipyards', desc: 'Marine component handling, barge loading, and drydock heavy lifts.' }
    ],
    equipment: {
      summary: 'Our fleet comprises premier equipment from Liebherr, Terex-Demag, and Tadano, maintained to manufacturer tolerances in our central Mussafah industrial facility.',
      items: [
        { name: 'Crawler Cranes', spec: 'Lattice-boom crawler cranes up to 750 tonnes lifting capacity.' },
        { name: 'All-Terrain Mobile Cranes', spec: 'Multi-axle mobile cranes from 50T to 500T with variable outrigger base.' },
        { name: 'Heavy Modular Trailers', spec: 'Hydraulic multi-axle trailers with synchronized electronic steering.' },
        { name: 'Rigging Gear', spec: 'Certified spreader beams, heavy grommets, and load cells tested to 2x WLL.' }
      ]
    },
    safetyQuality: 'Every crane and rigging accessory carries current third-party load test certification from internationally accredited inspection agencies. Lift operations operate strictly under approved permit systems.',
    featuredProjects: [
      { title: 'High-Rise Structural Erection Logistics', sector: 'Heavy Lift Engineering', image: '/assets/images/projects/c2-towers-al-bateen.jpg', desc: 'Coordinating high-capacity tower crane erection and heavy steel placement for C2 Towers high-rise development.', location: 'Abu Dhabi, UAE', href: '/projects/c2-towers-al-bateen/' },
      { title: 'Coastal Heavy Equipment Mobilization', sector: 'Plant Fleet Logistics', image: '/assets/images/projects/palm-jumeirah-rec-estate.jpg', desc: 'Mobilizing heavy piling rigs, excavators, and coastal equipment to Palm Jumeirah waterfront site.', location: 'Dubai, UAE', href: '/projects/palm-jumeirah-rec-estate/' }
    ]
  })
});

console.log('Complete business portal and 5 core division pages generated successfully.');

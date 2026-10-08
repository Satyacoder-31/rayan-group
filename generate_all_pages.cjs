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
  { label: 'All Companies', href: '/business/', active: activeHref === '/business/' },
  { label: 'Rayan Engineering', href: '/business/engineering/', active: activeHref === '/business/engineering/' },
  { label: 'Rayan Energy', href: '/business/energy/', active: activeHref === '/business/energy/' },
  { label: 'Ashaz Engineering (India)', href: '/business/ashaz/', active: activeHref === '/business/ashaz/' },
  { label: 'Rayan Properties (Upcoming)', href: '/business/properties/', active: activeHref === '/business/properties/' },
];

// ============================================================================
// 2. ABOUT PAGE (about/index.html)
// ============================================================================
createRoute('about/index.html', {
  title: 'Who We Are & Corporate History',
  description: 'Discover Rayan Group, our history from founding in the United Arab Emirates to multinational scale across the UAE and South Asia, core values, and vision for 2030.',
  activePath: '/about/',
  heroHtml: renderPageHero({
    category: 'CORPORATE OVERVIEW',
    title: 'WHO WE ARE',
    description: 'Engineering excellence built over decades of industrial execution, cross-border synergy, and fiduciary discipline.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'About', href: '/about/' }, { label: 'Who We Are', href: '/about/' }],
    bgImage: '/assets/images/about/overview.jpg',
    subnav: [
      { label: 'Who We Are', href: '/about/', active: true },
      { label: 'Executive Governance', href: '/leadership/', active: false },
      { label: 'Corporate Timeline', href: '#timeline', active: false },
      { label: 'India Hub (Ashaz)', href: '#india-hub', active: false },
      { label: 'Operating Companies', href: '/business/', active: false }
    ]
  }),
  content: `
  <section class="section" style="padding: 6rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.85rem;">CONGLOMERATE VISION</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 3.25rem); font-weight: 800; color: #fff; line-height: 1.15; text-transform: uppercase; margin-bottom: 1.5rem;">SHAPING CRITICAL INFRASTRUCTURE WITH PURPOSE.</h2>
          <p style="font-size: 1.05rem; line-height: 1.7; color: #cbd5e1; margin-bottom: 1.25rem;">
            Established in the United Arab Emirates, Rayan Group has expanded into a multi-sector engineering and infrastructure enterprise encompassing civil contracting, energy infrastructure facilities, and regional industrial hubs.
          </p>
          <p style="font-size: 0.95rem; line-height: 1.7; color: #94a3b8; margin-bottom: 2rem;">
            Our dual-market presence in the United Arab Emirates and India allows us to combine UAE capital efficiency and megaproject agility with world-class engineering talent, executing projects from design and BIM structural modeling to commissioning with certified ISO 9001 and ISO 45001 compliance.
          </p>
          <div style="display: flex; gap: 1.5rem;">
            <a href="/leadership/" class="btn-enterprise-primary">EXECUTIVE LEADERSHIP →</a>
            <a href="/business/" class="btn-enterprise-secondary">EXPLORE DIVISIONS</a>
          </div>
        </div>
        <div>
          <img src="/assets/images/about/history.jpg" alt="Rayan Group Infrastructure" style="width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
        </div>
      </div>

      <!-- Verified Statistics Row (Increasing Animated Counters: 50+, 16, 4) -->
      <div class="stats-counter-grid">
        <div class="stat-counter-card">
          <div class="stat-counter-number-wrap">
            <span class="stat-counter-val" data-counter-target="50" data-counter-suffix="+" data-counter-duration="1800">50+</span>
          </div>
          <div class="stat-counter-label">YEARS HERITAGE</div>
          <div class="stat-counter-desc">Combined leadership execution</div>
        </div>

        <div class="stat-counter-card">
          <div class="stat-counter-number-wrap">
            <span class="stat-counter-val" data-counter-target="16" data-counter-duration="1500">16</span>
          </div>
          <div class="stat-counter-label">VERIFIED PROJECTS</div>
          <div class="stat-counter-desc">Landmark hospitality, retail &amp; towers</div>
        </div>

        <div class="stat-counter-card">
          <div class="stat-counter-number-wrap">
            <span class="stat-counter-val" data-counter-target="4" data-counter-duration="1200">4</span>
          </div>
          <div class="stat-counter-label">OPERATING ENTITIES</div>
          <div class="stat-counter-desc">Engineering, Energy, Ashaz India, Properties</div>
        </div>

        <div class="stat-counter-card">
          <div class="stat-counter-number-wrap">
            <span class="stat-counter-val stat-counter-text-badge">TRIPLE</span>
          </div>
          <div class="stat-counter-label" style="color: #10b981;">ISO ACCREDITED</div>
          <div class="stat-counter-desc">ISO 9001 / 14001 / 45001</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Mission & Vision Cards -->
  <section class="section" style="padding: 6rem 0; background: #050b14; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 8px; background: rgba(0,153,230,0.15); display: flex; align-items: center; justify-content: center; color: #0099e6; margin-bottom: 1.5rem;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem; text-transform: uppercase;">OUR VISION</h3>
          <p style="color: #94a3b8; line-height: 1.65; font-size: 0.95rem;">
            To be the premier multinational engineering, energy, and infrastructure conglomerate recognized for delivering innovative, sustainable, and high-impact built environments across global markets.
          </p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 8px; background: rgba(0,153,230,0.15); display: flex; align-items: center; justify-content: center; color: #0099e6; margin-bottom: 1.5rem;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem; text-transform: uppercase;">OUR MISSION</h3>
          <p style="color: #94a3b8; line-height: 1.65; font-size: 0.95rem;">
            To provide reliable civil engineering, energy solutions, and infrastructure contracting with an unwavering focus on safety, fiduciary excellence, client satisfaction, and technological innovation.
          </p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 8px; background: rgba(0,153,230,0.15); display: flex; align-items: center; justify-content: center; color: #0099e6; margin-bottom: 1.5rem;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem; text-transform: uppercase;">CORE VALUES</h3>
          <p style="color: #94a3b8; line-height: 1.65; font-size: 0.95rem;">
            Uncompromising structural integrity, zero-harm health &amp; safety (ISO 45001), environmental stewardship (ISO 14001), and enduring cross-border partnership.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Corporate Timeline -->
  <section id="timeline" class="section" style="padding: 6rem 0; background: #07111e;">
    <div class="container">
      <div style="text-align: center; max-width: 720px; margin: 0 auto 4rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">GROWTH &amp; MILESTONES</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">CORPORATE TIMELINE</h2>
        <p style="color: #94a3b8; font-size: 1rem; margin-top: 0.75rem; line-height: 1.6;">The foundational evolution of Rayan Group and its specialized operating enterprises across the UAE and South Asia.</p>
      </div>

      <div style="max-width: 860px; margin: 0 auto; position: relative; border-left: 2px solid rgba(0,153,230,0.3); padding-left: 2.5rem;">
        <!-- 2021: Rayan Group -->
        <div style="margin-bottom: 3.5rem; position: relative;">
          <div style="position: absolute; left: calc(-2.5rem - 7px); top: 0; width: 14px; height: 14px; border-radius: 50%; background: #0099e6; box-shadow: 0 0 12px #0099e6;"></div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #0099e6;">2021</span>
            <span style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(0,153,230,0.15); color: #0099e6; border: 1px solid rgba(0,153,230,0.3); padding: 0.2rem 0.6rem; border-radius: 4px;">GROUP ESTABLISHMENT</span>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.5rem;">Establishment of Rayan Group</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.65;">
            Rayan Group was established in 2021 in the United Arab Emirates as the parent enterprise, instituting executive corporate governance, strategic capital allocation, and long-term vision across multidisciplinary contracting and infrastructure sectors.
          </p>
        </div>

        <!-- 2022: Rayan Engineering -->
        <div style="margin-bottom: 3.5rem; position: relative;">
          <div style="position: absolute; left: calc(-2.5rem - 7px); top: 0; width: 14px; height: 14px; border-radius: 50%; background: #f97316; box-shadow: 0 0 12px #f97316;"></div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #f97316;">2022</span>
            <span style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(249,115,22,0.15); color: #f97316; border: 1px solid rgba(249,115,22,0.3); padding: 0.2rem 0.6rem; border-radius: 4px;">CIVIL &amp; INTERIORS EPC</span>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.5rem;">Establishment of Rayan Engineering</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.65;">
            Founded in 2022 as Rayan Group's flagship civil delivery arm, executing turnkey building construction, commercial high-rise towers, luxury hospitality overhauls, retail fit-outs, and architectural engineering across Abu Dhabi, Dubai, and the UAE.
          </p>
        </div>

        <!-- 2022: Rayan Energy -->
        <div style="margin-bottom: 3.5rem; position: relative;">
          <div style="position: absolute; left: calc(-2.5rem - 7px); top: 0; width: 14px; height: 14px; border-radius: 50%; background: #10b981; box-shadow: 0 0 12px #10b981;"></div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #10b981;">2022</span>
            <span style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); padding: 0.2rem 0.6rem; border-radius: 4px;">ELECTRICAL &amp; MECHANICAL EPC</span>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.5rem;">Establishment of Rayan Energy</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.65;">
            Established in 2022 to deliver specialized full-lifecycle electrical and mechanical EPC services, high-voltage substations, process piping networks, and critical energy infrastructure operating to strict ISO 45001 zero-harm safety benchmarks.
          </p>
        </div>

        <!-- 2024: ASHAZ Engineering -->
        <div style="margin-bottom: 3.5rem; position: relative;">
          <div style="position: absolute; left: calc(-2.5rem - 7px); top: 0; width: 14px; height: 14px; border-radius: 50%; background: #00c7b3; box-shadow: 0 0 12px #00c7b3;"></div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #00c7b3;">2024</span>
            <span style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(0,199,179,0.15); color: #00c7b3; border: 1px solid rgba(0,199,179,0.3); padding: 0.2rem 0.6rem; border-radius: 4px;">SOUTH ASIA REGIONAL HUB</span>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.5rem;">Establishment of ASHAZ Engineering</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.65;">
            Established in 2024 as Rayan Group's strategic South Asia engineering and regional contracting arm based in Bettiah and New Delhi, providing heavy civil works, structural steel fabrication, industrial workshops, and cross-border delivery synergy.
          </p>
        </div>

        <!-- Upcoming: Rayan Properties -->
        <div style="position: relative;">
          <div style="position: absolute; left: calc(-2.5rem - 7px); top: 0; width: 14px; height: 14px; border-radius: 50%; background: #fbbf24; box-shadow: 0 0 12px #fbbf24;"></div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #fbbf24;">UPCOMING</span>
            <span style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); padding: 0.2rem 0.6rem; border-radius: 4px;">PROPERTY DEVELOPMENT DIVISION</span>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.5rem;">Launch of Rayan Properties</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.65;">
            The upcoming premier property development division of Rayan Group, curating luxury waterfront estates, master-planned residential communities, and landmark commercial developments across the United Arab Emirates.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- South Asia Regional Hub: Ashaz Engineering (India) -->
  <section id="india-hub" class="section" style="padding: 6rem 0; background: #050b14; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #00c7b3; display: block; margin-bottom: 0.85rem;">SOUTH ASIA REGIONAL HUB</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; color: #fff; line-height: 1.2; text-transform: uppercase; margin-bottom: 1.25rem;">
            ASHAZ ENGINEERING (INDIA)
          </h2>
          <p style="font-size: 1.05rem; line-height: 1.7; color: #cbd5e1; margin-bottom: 1.25rem;">
            Established in 2024 as Rayan Group's strategic South Asia engineering and regional contracting arm, Ashaz Engineering operates from Bettiah (Bihar) and New Delhi, providing heavy structural steel fabrication, pre-engineered buildings, and civil contracting across India.
          </p>
          <p style="font-size: 0.95rem; line-height: 1.7; color: #94a3b8; margin-bottom: 2rem;">
            With certified fabrication yards, automated welding lines, and an integrated engineering team, Ashaz Engineering delivers monumental scale while maintaining seamless technical synergies with Rayan Group's UAE megaprojects.
          </p>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a href="/business/ashaz/" class="btn-enterprise-primary" style="background: #00c7b3; border-color: #00c7b3;">EXPLORE ASHAZ ENGINEERING →</a>
            <a href="/contact/" class="btn-enterprise-secondary">CONTACT INDIA HUB</a>
          </div>
        </div>
        <div>
          <div style="background: #0c1828; border: 1px solid rgba(0,199,179,0.3); border-radius: 14px; overflow: hidden; padding: 2.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 700; color: #00c7b3; text-transform: uppercase;">GOVERNANCE</span>
                <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: #fff; margin: 0.2rem 0 0;">BOARD OF DIRECTORS</h3>
              </div>
              <span style="font-size: 0.75rem; background: rgba(0,199,179,0.15); color: #00c7b3; border: 1px solid rgba(0,199,179,0.3); padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 700;">ASHAZ INDIA</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
              <div style="display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(0,199,179,0.2); border: 2px solid #00c7b3; display: flex; align-items: center; justify-content: center; color: #00c7b3; font-weight: 800; font-size: 0.9rem;">AA</div>
                <div>
                  <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0;">Mr. Arshad Alam</h4>
                  <span style="font-size: 0.78rem; color: #00c7b3; font-weight: 600;">Director — Ashaz Engineering</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(0,199,179,0.2); border: 2px solid #00c7b3; display: flex; align-items: center; justify-content: center; color: #00c7b3; font-weight: 800; font-size: 0.9rem;">BA</div>
                <div>
                  <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0;">Mr. Bakhteyar Alam</h4>
                  <span style="font-size: 0.78rem; color: #00c7b3; font-weight: 600;">Director — Ashaz Engineering</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(0,199,179,0.2); border: 2px solid #00c7b3; display: flex; align-items: center; justify-content: center; color: #00c7b3; font-weight: 800; font-size: 0.9rem;">KU</div>
                <div>
                  <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0;">Mr. Khalid Umar</h4>
                  <span style="font-size: 0.78rem; color: #00c7b3; font-weight: 600;">Director — Ashaz Engineering</span>
                </div>
              </div>
            </div>
            <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.8rem; color: #94a3b8;">
              📍 Bettiah, West Champaran, Bihar &amp; New Delhi, India
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 3. LEADERSHIP PAGE (leadership/index.html)
// ============================================================================
createRoute('leadership/index.html', {
  title: 'Executive Leadership & Corporate Governance',
  description: 'Meet the Board of Directors and executive leaders directing Rayan Group across the UAE and South Asia.',
  activePath: '/leadership/',
  heroHtml: renderPageHero({
    category: 'GOVERNANCE & DIRECTORS',
    title: 'EXECUTIVE LEADERSHIP',
    description: 'Visionary leadership directing multi-billion dirham operations with structural precision, safety compliance, and fiduciary excellence.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'About', href: '/about/' }, { label: 'Leadership', href: '/leadership/' }],
    bgImage: '/assets/images/investors/boardroom-governance.jpg',
    subnav: [
      { label: 'Executive Profiles', href: '#profiles', active: true },
      { label: 'Board Committees', href: '#committees', active: false },
      { label: 'Governance Charters', href: '/investors/corporate-governance/', active: false }
    ]
  }),
  content: `
  <section id="profiles" class="section" style="padding: 6rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 750px; margin: 0 auto 4.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">BOARD OF DIRECTORS</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">EXECUTIVE GOVERNANCE</h2>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 2.5rem;">
        <!-- Chairman -->
        <div style="background: #0c1828; border: 1px solid rgba(197,160,89,0.3); border-radius: 12px; padding: 2.5rem; text-align: center; position: relative;">
          <div style="position: absolute; top: 1.25rem; right: 1.25rem; font-size: 0.75rem; font-weight: 700; color: #c5a059; border: 1px solid rgba(197,160,89,0.4); padding: 0.2rem 0.6rem; border-radius: 4px;">DIR // 01</div>
          <div style="width: 110px; height: 110px; border-radius: 50%; border: 3px solid #c5a059; margin: 0 auto 1.5rem; background: radial-gradient(circle, rgba(197,160,89,0.2) 0%, #07111e 70%); display: flex; align-items: center; justify-content: center; color: #c5a059;">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">Mr. Arshad Alam</h3>
          <div style="font-size: 0.8125rem; font-weight: 700; color: #c5a059; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.25rem;">Founder &amp; Group Chairman | Director, Ashaz Engineering (India)</div>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">
            Pioneering the corporate governance, strategic vision, and cross-border expansion of Rayan Group and Ashaz Engineering across Abu Dhabi, Dubai, India, and international markets.
          </p>
          <div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Strategic Vision</span>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Capital Allocation</span>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Global Hubs</span>
          </div>
        </div>

        <!-- COO -->
        <div style="background: #0c1828; border: 1px solid rgba(0,153,230,0.3); border-radius: 12px; padding: 2.5rem; text-align: center; position: relative;">
          <div style="position: absolute; top: 1.25rem; right: 1.25rem; font-size: 0.75rem; font-weight: 700; color: #0099e6; border: 1px solid rgba(0,153,230,0.4); padding: 0.2rem 0.6rem; border-radius: 4px;">DIR // 02</div>
          <div style="width: 110px; height: 110px; border-radius: 50%; border: 3px solid #0099e6; margin: 0 auto 1.5rem; background: radial-gradient(circle, rgba(0,153,230,0.2) 0%, #07111e 70%); display: flex; align-items: center; justify-content: center; color: #0099e6;">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">Eng. Bakhteyar Alam</h3>
          <div style="font-size: 0.8125rem; font-weight: 700; color: #0099e6; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.25rem;">Chief Operating Officer (COO) | Director, Ashaz Engineering (India)</div>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">
            Directing multi-disciplinary engineering operations, 500+ qualified engineers, on-site safety protocols, and precision delivery across 500+ turnkey megaprojects.
          </p>
          <div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Turnkey Execution</span>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">HSE ISO 45001</span>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">500+ Engineers</span>
          </div>
        </div>

        <!-- CFO -->
        <div style="background: #0c1828; border: 1px solid rgba(0,153,230,0.3); border-radius: 12px; padding: 2.5rem; text-align: center; position: relative;">
          <div style="position: absolute; top: 1.25rem; right: 1.25rem; font-size: 0.75rem; font-weight: 700; color: #0099e6; border: 1px solid rgba(0,153,230,0.4); padding: 0.2rem 0.6rem; border-radius: 4px;">DIR // 03</div>
          <div style="width: 110px; height: 110px; border-radius: 50%; border: 3px solid #0099e6; margin: 0 auto 1.5rem; background: radial-gradient(circle, rgba(0,153,230,0.2) 0%, #07111e 70%); display: flex; align-items: center; justify-content: center; color: #0099e6;">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">Eng. Nadeem Akhtar</h3>
          <div style="font-size: 0.8125rem; font-weight: 700; color: #0099e6; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.25rem;">Chief Financial Officer (CFO)</div>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">
            Directing institutional fiscal governance, capital efficiency, commercial risk management, contract tendering, and sustainable international enterprise growth.
          </p>
          <div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Fiscal Governance</span>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Commercial Risk</span>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Capital Markets</span>
          </div>
        </div>

        <!-- Director Khalid Umar -->
        <div style="background: #0c1828; border: 1px solid rgba(0,199,179,0.3); border-radius: 12px; padding: 2.5rem; text-align: center; position: relative;">
          <div style="position: absolute; top: 1.25rem; right: 1.25rem; font-size: 0.75rem; font-weight: 700; color: #00c7b3; border: 1px solid rgba(0,199,179,0.4); padding: 0.2rem 0.6rem; border-radius: 4px;">DIR // 04</div>
          <div style="width: 110px; height: 110px; border-radius: 50%; border: 3px solid #00c7b3; margin: 0 auto 1.5rem; background: radial-gradient(circle, rgba(0,199,179,0.2) 0%, #07111e 70%); display: flex; align-items: center; justify-content: center; color: #00c7b3;">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">Mr. Khalid Umar</h3>
          <div style="font-size: 0.8125rem; font-weight: 700; color: #00c7b3; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.25rem;">Director — Ashaz Engineering (India)</div>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">
            Directing South Asia operations, heavy structural steel fabrication, industrial workshops, and regional contracting delivery across India.
          </p>
          <div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">South Asia Operations</span>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Steel Fabrication</span>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Industrial Contracting</span>
          </div>
        </div>
      </div>

      <!-- Ashaz Engineering (India) Board of Directors Highlight -->
      <div style="margin-top: 5rem; background: linear-gradient(135deg, #091a2e 0%, #061320 100%); border: 1px solid rgba(0,199,179,0.3); border-radius: 16px; padding: 3rem;">
        <div style="text-align: center; max-width: 720px; margin: 0 auto 3rem;">
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #00c7b3;">REGIONAL GOVERNANCE</span>
          <h3 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.35rem 0 0.5rem;">ASHAZ ENGINEERING (INDIA) — BOARD OF DIRECTORS</h3>
          <p style="color: #94a3b8; font-size: 0.95rem; margin: 0; line-height: 1.6;">Directing strategic operations, industrial steel fabrication facilities, and regional contracting execution across India.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; text-align: center;">
            <div style="width: 70px; height: 70px; border-radius: 50%; border: 2px solid #00c7b3; margin: 0 auto 1rem; background: rgba(0,199,179,0.15); display: flex; align-items: center; justify-content: center; color: #00c7b3; font-weight: 800; font-size: 1.2rem;">AA</div>
            <h4 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">Mr. Arshad Alam</h4>
            <div style="font-size: 0.8rem; font-weight: 700; color: #00c7b3; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem;">Director</div>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.5; margin: 0;">Group Chairman directing corporate governance, strategic capital allocation, and South Asia cross-border expansion.</p>
          </div>

          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; text-align: center;">
            <div style="width: 70px; height: 70px; border-radius: 50%; border: 2px solid #00c7b3; margin: 0 auto 1rem; background: rgba(0,199,179,0.15); display: flex; align-items: center; justify-content: center; color: #00c7b3; font-weight: 800; font-size: 1.2rem;">BA</div>
            <h4 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">Mr. Bakhteyar Alam</h4>
            <div style="font-size: 0.8rem; font-weight: 700; color: #00c7b3; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem;">Director</div>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.5; margin: 0;">Chief Operating Officer directing engineering standards, turnkey project delivery, and ISO 45001 safety mandates.</p>
          </div>

          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; text-align: center;">
            <div style="width: 70px; height: 70px; border-radius: 50%; border: 2px solid #00c7b3; margin: 0 auto 1rem; background: rgba(0,199,179,0.15); display: flex; align-items: center; justify-content: center; color: #00c7b3; font-weight: 800; font-size: 1.2rem;">KU</div>
            <h4 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">Mr. Khalid Umar</h4>
            <div style="font-size: 0.8rem; font-weight: 700; color: #00c7b3; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem;">Director</div>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.5; margin: 0;">Directing South Asia operations, heavy steel fabrication plants, and regional contracting infrastructure across India.</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  </section>

  <!-- Board Committees -->
  <section id="committees" class="section" style="padding: 6rem 0; background: #050b14;">
    <div class="container">
      <div style="text-align: center; max-width: 700px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">OVERSIGHT &amp; INTEGRITY</span>
        <h2 style="font-family: var(--font-heading); font-size: 2.5rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">BOARD COMMITTEES</h2>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
          <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">Audit &amp; Risk Committee</h4>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.25rem;">Oversees financial reporting accuracy, internal controls, statutory audits, and enterprise risk frameworks.</p>
          <span style="font-size: 0.75rem; color: #0099e6; font-weight: 700;">Independent Oversight</span>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
          <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">ESG &amp; Sustainability Steering</h4>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.25rem;">Guides decarbonization roadmap, environmental compliance, workforce health &amp; safety, and community impact.</p>
          <span style="font-size: 0.75rem; color: #10b981; font-weight: 700;">Net-Zero 2050 Mandate</span>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
          <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">Nomination &amp; Remuneration</h4>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.25rem;">Directs executive evaluation, board succession planning, and performance-aligned executive compensation.</p>
          <span style="font-size: 0.75rem; color: #0099e6; font-weight: 700;">Institutional Governance</span>
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
    description: 'Pioneering decarbonization, biodiversity protection, and zero-harm workplace safety across all multinational projects.',
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
            Integrating solar hybrid power on remote sites, reducing construction waste, and targeting 30% carbon emission reduction across operations by 2030.
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

console.log('Generated About, Leadership & Sustainability pages.');

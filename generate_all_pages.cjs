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
    description: 'A premier multinational engineering, infrastructure, and energy conglomerate with an 18+ year execution heritage since 2008, delivering landmark turnkey EPC projects and high-precision contracting across the UAE and India.',
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
            Rayan Group is a premier multinational engineering, contracting, and infrastructure conglomerate operating across the United Arab Emirates and India. Built on an 18+ year foundation of continuous industry execution established in 2008, our enterprise delivers high-specification turnkey EPC projects, civil &amp; interiors contracting, electrical &amp; mechanical systems, heavy structural steel fabrication, and sustainable energy infrastructure.
          </p>
          <p style="font-size: 0.95rem; line-height: 1.7; color: #94a3b8; margin-bottom: 2rem;">
            With operational headquarters in Abu Dhabi (UAE) and regional engineering fabrication works in Bettiah &amp; New Delhi (Ashaz Engineering, India), Rayan Group combines GCC megaproject agility with world-class engineering execution. Governed by uncompromised fiduciary discipline, dedicated executive leadership, and triple ISO accreditations (ISO 9001 / ISO 14001 / ISO 45001), we transform complex architectural visions into enduring, monumental infrastructure.
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

      <!-- Verified Statistics Row (Increasing Animated Counters: 18+, 16, 4) -->
      <div class="stats-counter-grid">
        <div class="stat-counter-card">
          <div class="stat-counter-number-wrap">
            <span class="stat-counter-val" data-counter-target="18" data-counter-suffix="+" data-counter-duration="1500">18+</span>
          </div>
          <div class="stat-counter-label">YEARS HERITAGE</div>
          <div class="stat-counter-desc">Proven industry track record since 2008</div>
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

        <!-- 2026: Rayan Group (India) Trade Mark Awarded -->
        <div style="margin-bottom: 3.5rem; position: relative;">
          <div style="position: absolute; left: calc(-2.5rem - 7px); top: 0; width: 14px; height: 14px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 12px #38bdf8;"></div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #38bdf8;">2026</span>
            <span style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); padding: 0.2rem 0.6rem; border-radius: 4px;">REGISTERED TRADEMARK AWARDED</span>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.5rem;">Rayan Group (India) — Official Registered Trademark Awarded</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.65; margin-bottom: 0.75rem;">
            Certificate of Registration of Trade Mark (No. 6580565, Class 37 Construction Services) officially sealed and awarded under the Trade Marks Act, 1999 by the Trade Marks Registry, Government of India, establishing protected intellectual property and corporate branding for Rayan Group.
          </p>
          <div style="display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.25); padding: 0.45rem 0.9rem; border-radius: 6px; font-size: 0.8rem; color: #7dd3fc;">
            <span>🛡️</span>
            <span><strong>Trade Mark No:</strong> 6580565 &bull; <strong>Class:</strong> 37 (Construction Services) &bull; <strong>Trade Marks Registry:</strong> Mumbai, Govt. of India</span>
          </div>
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
                  <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0;">Mr. Arshad Alam Shaikh</h4>
                  <span style="font-size: 0.78rem; color: #00c7b3; font-weight: 600;">Founder &amp; Chairman &mdash; <span style="white-space: nowrap;">Rayan Group (UAE &amp; India)</span> | Director</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(0,199,179,0.2); border: 2px solid #00c7b3; display: flex; align-items: center; justify-content: center; color: #00c7b3; font-weight: 800; font-size: 0.9rem;">SF</div>
                <div>
                  <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0;">Mrs. Sadaf Fatma</h4>
                  <span style="font-size: 0.78rem; color: #00c7b3; font-weight: 600;">Chief Executive Officer &mdash; <span style="white-space: nowrap;">Rayan Group (UAE &amp; India)</span> | Director</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(0,199,179,0.2); border: 2px solid #00c7b3; display: flex; align-items: center; justify-content: center; color: #00c7b3; font-weight: 800; font-size: 0.9rem;">BA</div>
                <div>
                  <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0;">Mr. Bakhteyar Alam</h4>
                  <span style="font-size: 0.78rem; color: #00c7b3; font-weight: 600;">Chief Operating Officer | Director</span>
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
            <div style="margin-top: 0.75rem; padding: 0.65rem 0.85rem; border-radius: 6px; background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.25); font-size: 0.76rem; color: #7dd3fc; display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1rem;">🛡️</span>
              <div>
                <strong style="color: #fff; display: block;">Registered Trade Mark Awarded (2026)</strong>
                Trade Mark No. 6580565 &bull; Class 37 (Construction Services) &bull; Trade Marks Registry, Govt. of India
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Executive Leadership Messages Showcase on About Page -->
  <section class="section" style="padding: 5rem 0; background: #06101c; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="background: linear-gradient(135deg, #0d1e33 0%, #081424 100%); border: 1px solid rgba(197,160,89,0.3); border-radius: 16px; padding: clamp(2rem, 4vw, 3.5rem); display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2.5rem; align-items: center;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #c5a059;">EXECUTIVE PERSPECTIVES</span>
          <h3 style="font-family: var(--font-heading); font-size: clamp(1.8rem, 2.5vw, 2.4rem); font-weight: 800; color: #fff; margin: 0.35rem 0 1rem; line-height: 1.2;">
            LEADERSHIP MESSAGES
          </h3>
          <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.7; margin: 0 0 1.5rem;">
            Read the official strategic addresses from Founder &amp; Chairman Mr. Arshad Alam Shaikh and Chief Executive Officer Mrs. Sadaf Fatma detailing our dual-hub vision, disciplined execution, and long-term value creation across the UAE and India.
          </p>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a href="/leadership/#chairman-message" class="btn-enterprise-primary" style="background: #c5a059; border-color: #c5a059; color: #07111e; font-weight: 800;">
              READ CHAIRMAN’S ADDRESS →
            </a>
            <a href="/leadership/#ceo-message" class="btn-enterprise-secondary" style="border-color: #00c7b3; color: #00c7b3;">
              READ CEO’S ADDRESS →
            </a>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="background: rgba(197,160,89,0.08); border-left: 3px solid #c5a059; padding: 1.25rem 1.5rem; border-radius: 0 8px 8px 0;">
            <p style="font-style: italic; color: #e2e8f0; font-size: 0.9rem; margin: 0 0 0.5rem; line-height: 1.5;">“Success is measured not only by the projects we complete, but by the trust we build and the value we contribute to the communities in which we operate.”</p>
            <div style="font-size: 0.78rem; font-weight: 700; color: #c5a059;">&mdash; Mr. Arshad Alam Shaikh, Founder &amp; Chairman</div>
          </div>
          <div style="background: rgba(0,199,179,0.08); border-left: 3px solid #00c7b3; padding: 1.25rem 1.5rem; border-radius: 0 8px 8px 0;">
            <p style="font-style: italic; color: #e2e8f0; font-size: 0.9rem; margin: 0 0 0.5rem; line-height: 1.5;">“Our mission: creating lasting value today while building transformational opportunities for tomorrow.”</p>
            <div style="font-size: 0.78rem; font-weight: 700; color: #00c7b3;">&mdash; Mrs. Sadaf Fatma, Chief Executive Officer (CEO)</div>
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
      { label: 'Chairman’s Message', href: '#chairman-message', active: false },
      { label: 'CEO’s Message', href: '#ceo-message', active: false },
      { label: 'Ashaz India Board', href: '#ashaz-board', active: false },
      { label: 'Board Committees', href: '#committees', active: false },
      { label: 'Corporate Governance', href: '/investors/corporate-governance/', active: false }
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
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">Mr. Arshad Alam Shaikh</h3>
          <div style="font-size: 0.8125rem; font-weight: 700; color: #c5a059; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.25rem; line-height: 1.45;">FOUNDER &amp; CHAIRMAN<br><span style="white-space: nowrap;">RAYAN GROUP (UAE &amp; INDIA)</span></div>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">
            Pioneering the corporate governance, strategic vision, and cross-border expansion of Rayan Group and Ashaz Engineering across Abu Dhabi, Dubai, India, and international markets.
          </p>
          <div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Strategic Vision</span>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Capital Allocation</span>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3);">Trade Mark Proprietor (Govt. of India)</span>
          </div>
          <div style="margin-top: 1.25rem;">
            <a href="#chairman-message" style="display: inline-flex; align-items: center; gap: 0.45rem; font-size: 0.78rem; font-weight: 700; color: #c5a059; border: 1px solid rgba(197,160,89,0.4); background: rgba(197,160,89,0.08); padding: 0.45rem 1rem; border-radius: 6px; text-decoration: none;">
              <span>Read Chairman’s Address</span> <span>↓</span>
            </a>
          </div>
        </div>

        <!-- CEO -->
        <div style="background: #0c1828; border: 1px solid rgba(197,160,89,0.3); border-radius: 12px; padding: 2.5rem; text-align: center; position: relative;">
          <div style="position: absolute; top: 1.25rem; right: 1.25rem; font-size: 0.75rem; font-weight: 700; color: #c5a059; border: 1px solid rgba(197,160,89,0.4); padding: 0.2rem 0.6rem; border-radius: 4px;">EXEC // 02</div>
          <div style="width: 110px; height: 110px; border-radius: 50%; border: 3px solid #c5a059; margin: 0 auto 1.5rem; background: radial-gradient(circle, rgba(197,160,89,0.2) 0%, #07111e 70%); display: flex; align-items: center; justify-content: center; color: #c5a059;">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"></circle></svg>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">Mrs. Sadaf Fatma</h3>
          <div style="font-size: 0.8125rem; font-weight: 700; color: #c5a059; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.25rem; line-height: 1.45;">CHIEF EXECUTIVE OFFICER (CEO)<br><span style="white-space: nowrap;">RAYAN GROUP (UAE &amp; INDIA)</span></div>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">
            Leading overall enterprise strategy, operational transformation, multi-regional business growth, and executive governance across UAE and India operations.
          </p>
          <div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Enterprise Leadership</span>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Corporate Strategy</span>
            <span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #cbd5e1;">Global Operations</span>
          </div>
          <div style="margin-top: 1.25rem;">
            <a href="#ceo-message" style="display: inline-flex; align-items: center; gap: 0.45rem; font-size: 0.78rem; font-weight: 700; color: #00c7b3; border: 1px solid rgba(0,199,179,0.4); background: rgba(0,199,179,0.08); padding: 0.45rem 1rem; border-radius: 6px; text-decoration: none;">
              <span>Read CEO’s Address</span> <span>↓</span>
            </a>
          </div>
        </div>

        <!-- COO -->
        <div style="background: #0c1828; border: 1px solid rgba(0,153,230,0.3); border-radius: 12px; padding: 2.5rem; text-align: center; position: relative;">
          <div style="position: absolute; top: 1.25rem; right: 1.25rem; font-size: 0.75rem; font-weight: 700; color: #0099e6; border: 1px solid rgba(0,153,230,0.4); padding: 0.2rem 0.6rem; border-radius: 4px;">EXEC // 03</div>
          <div style="width: 110px; height: 110px; border-radius: 50%; border: 3px solid #0099e6; margin: 0 auto 1.5rem; background: radial-gradient(circle, rgba(0,153,230,0.2) 0%, #07111e 70%); display: flex; align-items: center; justify-content: center; color: #0099e6;">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"></circle></svg>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">Eng. Bakhteyar Alam</h3>
          <div style="font-size: 0.8125rem; font-weight: 700; color: #0099e6; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.25rem; line-height: 1.45;">CHIEF OPERATING OFFICER (COO)<br><span style="white-space: nowrap;">DIRECTOR, ASHAZ ENGINEERING (INDIA)</span></div>
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
          <div style="position: absolute; top: 1.25rem; right: 1.25rem; font-size: 0.75rem; font-weight: 700; color: #0099e6; border: 1px solid rgba(0,153,230,0.4); padding: 0.2rem 0.6rem; border-radius: 4px;">DIR // 04</div>
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
          <div style="position: absolute; top: 1.25rem; right: 1.25rem; font-size: 0.75rem; font-weight: 700; color: #00c7b3; border: 1px solid rgba(0,199,179,0.4); padding: 0.2rem 0.6rem; border-radius: 4px;">DIR // 05</div>
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
      <div id="ashaz-board" style="margin-top: 5rem; background: linear-gradient(135deg, #091a2e 0%, #061320 100%); border: 1px solid rgba(0,199,179,0.3); border-radius: 16px; padding: 3rem;">
        <div style="text-align: center; max-width: 720px; margin: 0 auto 3rem;">
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #00c7b3;">REGIONAL GOVERNANCE</span>
          <h3 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.35rem 0 0.5rem;">ASHAZ ENGINEERING (INDIA) — BOARD OF DIRECTORS</h3>
          <p style="color: #94a3b8; font-size: 0.95rem; margin: 0; line-height: 1.6;">Directing strategic operations, industrial steel fabrication facilities, and regional contracting execution across India.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2rem;">
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; text-align: center;">
            <div style="width: 70px; height: 70px; border-radius: 50%; border: 2px solid #00c7b3; margin: 0 auto 1rem; background: rgba(0,199,179,0.15); display: flex; align-items: center; justify-content: center; color: #00c7b3; font-weight: 800; font-size: 1.2rem;">AA</div>
            <h4 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">Mr. Arshad Alam Shaikh</h4>
            <div style="font-size: 0.8rem; font-weight: 700; color: #00c7b3; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem;">Founder &amp; Chairman | Director</div>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.5; margin: 0;">Founder &amp; Chairman directing corporate governance, strategic capital allocation, and South Asia cross-border expansion.</p>
          </div>

          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; text-align: center;">
            <div style="width: 70px; height: 70px; border-radius: 50%; border: 2px solid #00c7b3; margin: 0 auto 1rem; background: rgba(0,199,179,0.15); display: flex; align-items: center; justify-content: center; color: #00c7b3; font-weight: 800; font-size: 1.2rem;">SF</div>
            <h4 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">Mrs. Sadaf Fatma</h4>
            <div style="font-size: 0.8rem; font-weight: 700; color: #00c7b3; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem;">Chief Executive Officer | Director</div>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.5; margin: 0;">Chief Executive Officer directing enterprise operations, strategic partnerships, and organizational growth across the UAE and India.</p>
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

  <!-- ========================================================================= -->
  <!-- CHAIRMAN'S MESSAGE SECTION                                                -->
  <!-- ========================================================================= -->
  <section id="chairman-message" class="section" style="padding: 6.5rem 0; background: linear-gradient(180deg, #07111e 0%, #0a1728 100%); border-bottom: 1px solid rgba(197,160,89,0.25); position: relative; overflow: hidden;">
    <div style="position: absolute; top: -120px; right: -120px; width: 450px; height: 450px; border-radius: 50%; background: radial-gradient(circle, rgba(197,160,89,0.08) 0%, transparent 70%); pointer-events: none;"></div>

    <div class="container">
      <div style="max-width: 1040px; margin: 0 auto; background: #0c1828; border: 1px solid rgba(197,160,89,0.35); border-radius: 16px; padding: clamp(2rem, 5vw, 4.5rem); box-shadow: 0 25px 60px rgba(0,0,0,0.45); position: relative;">
        
        <!-- Header Meta -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 1.5rem; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(197,160,89,0.25);">
          <div>
            <span style="display: inline-block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #c5a059; margin-bottom: 0.5rem;">
              EXECUTIVE ADDRESS // FOUNDER &amp; CHAIRMAN
            </span>
            <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 800; color: #fff; margin: 0; line-height: 1.2;">
              CHAIRMAN’S MESSAGE
            </h2>
            <div style="font-size: 0.95rem; color: #94a3b8; margin-top: 0.5rem; font-weight: 500;">
              Strategic Vision, Cross-Border Synergies &amp; Enduring Value Creation
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 64px; height: 64px; border-radius: 50%; border: 2.5px solid #c5a059; background: radial-gradient(circle, rgba(197,160,89,0.25) 0%, #07111e 70%); display: flex; align-items: center; justify-content: center; color: #c5a059; font-weight: 800; font-size: 1.25rem;">
              AA
            </div>
            <div style="text-align: left;">
              <div style="color: #fff; font-weight: 700; font-size: 1.05rem;">Mr. Arshad Alam Shaikh</div>
              <div style="color: #c5a059; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">Founder &amp; Chairman</div>
              <div style="color: #64748b; font-size: 0.74rem;">Rayan Group (UAE &amp; India)</div>
            </div>
          </div>
        </div>

        <!-- Pull Quote -->
        <div style="background: rgba(197,160,89,0.06); border-left: 4px solid #c5a059; padding: 1.5rem 1.75rem; border-radius: 0 10px 10px 0; margin-bottom: 2.5rem;">
          <p style="font-family: var(--font-heading); font-size: clamp(1.05rem, 1.8vw, 1.25rem); font-style: italic; color: #f1f5f9; line-height: 1.6; margin: 0;">
            “At RAYAN Group, our measure of success extends far beyond the scale of projects we engineer or the commercial milestones we reach. Our true legacy is defined by the enduring trust we cultivate, the institutional integrity we uphold, and the transformative value we deliver to our communities and partners.”
          </p>
        </div>

        <!-- Message Prose -->
        <div style="color: #cbd5e1; font-size: 1.025rem; line-height: 1.85; display: flex; flex-direction: column; gap: 1.35rem;">
          <p style="font-weight: 600; color: #e2e8f0; font-size: 1.1rem; margin: 0;">
            Dear Valued Partners, Clients, Investors, and Friends,
          </p>

          <p style="margin: 0;">
            It gives me immense personal honor and profound pleasure to welcome you to <strong>RAYAN Group</strong> &mdash; a diversified, forward-looking multinational conglomerate anchored by deep operational excellence across the United Arab Emirates and the Republic of India.
          </p>

          <p style="margin: 0;">
            Over the years, our organization has achieved a purposeful evolution. What began as a focused engineering and contracting enterprise has flourished into a multi-sector industrial powerhouse. Today, our operational capabilities span complex turnkey engineering, civil and commercial construction, strategic infrastructure, energy systems, industrial manufacturing, and high-impact commercial development. This extraordinary journey has been charted by a steadfast founding vision: to build self-sustaining, resilient enterprises, create exceptional economic value for our clients, and cultivate lifelong strategic partnerships grounded in trust, uncompromising integrity, and superior execution.
          </p>

          <!-- Dual-Hub Advantage Callout -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(197,160,89,0.25); border-radius: 12px; padding: 1.75rem; margin: 0.5rem 0;">
            <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: #c5a059; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 0.75rem;">
              The Strategic Dual-Hub Advantage: Connecting UAE &amp; India
            </h4>
            <p style="margin: 0; color: #94a3b8; font-size: 0.95rem; line-height: 1.7;">
              Our presence across the United Arab Emirates and India delivers a distinct, synergistic competitive advantage. The UAE stands as our sovereign epicenter for global capital, cutting-edge infrastructure, world-class business governance, and gateway access to Middle Eastern markets. In dynamic harmony, our India operations provide direct access to an elite reservoir of engineering talent, advanced technical capabilities, scalable manufacturing and steel fabrication capacity, and boundless emerging opportunities. By bridging these two economic powerhouses, RAYAN Group delivers an integrated, cost-efficient, and globally competitive delivery platform executing projects to exacting international standards.
            </p>
          </div>

          <p style="margin: 0;">
            At RAYAN Group, our operating philosophy is guided by collective unity and decentralized agility. Each of our operating subsidiaries maintains its specialized discipline and operational focus, while drawing upon the institutional strength, technical depth, and financial backing of the Group. This unified synergy empowers us to anticipate market shifts, orchestrate multidisciplinary EPC undertakings, and capitalize on high-potential opportunities across diverse geographies.
          </p>

          <p style="margin: 0;">
            Our foundational commitments remain absolute: uncompromised occupational health and safety (zero-harm), flawless quality assurance, pioneering technological innovation, environmental sustainability, and ethical business stewardship. We invest relentlessly in our human capital, digital engineering systems, and strategic alliances because we recognize that enduring institutions are forged through continuous, disciplined improvement.
          </p>

          <p style="margin: 0;">
            As we look to the horizon, our roadmap is defined by responsible expansion, strengthening our market leadership in established sectors, pioneering new sustainable industries, and generating sustainable long-term value for our clients, employees, partners, and society at large.
          </p>

          <p style="margin: 0;">
            I extend my deepest gratitude to our esteemed clients, strategic partners, dedicated workforce of over 500 professionals, and sovereign authorities whose trust has made our journey possible. Your confidence fuels our determination to reach higher, innovate further, and build with purpose.
          </p>

          <p style="margin: 0.5rem 0 0;">
            Together, we look forward to building a stronger, more diversified, and globally connected RAYAN Group.
          </p>
        </div>

        <!-- Signature Block -->
        <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(197,160,89,0.25); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 1.5rem;">
          <div>
            <div style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 0.5rem;">With sincere regards and warmest respect,</div>
            <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; letter-spacing: -0.01em;">
              Mr. Arshad Alam Shaikh
            </div>
            <div style="font-size: 0.85rem; font-weight: 700; color: #c5a059; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.2rem;">
              Founder &amp; Chairman
            </div>
            <div style="color: #94a3b8; font-size: 0.825rem; margin-top: 0.15rem;">
              RAYAN GROUP (UAE &amp; INDIA)
            </div>
          </div>
          <div style="text-align: right;">
            <div style="display: inline-block; padding: 0.5rem 1rem; border-radius: 6px; background: rgba(197,160,89,0.1); border: 1px solid rgba(197,160,89,0.3); font-size: 0.8rem; color: #c5a059; font-weight: 700;">
              18+ YEARS INDUSTRY HERITAGE &bull; EST. 2008
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- CEO'S MESSAGE SECTION                                                     -->
  <!-- ========================================================================= -->
  <section id="ceo-message" class="section" style="padding: 6.5rem 0; background: linear-gradient(180deg, #0a1728 0%, #07111e 100%); border-bottom: 1px solid rgba(0,199,179,0.25); position: relative; overflow: hidden;">
    <div style="position: absolute; bottom: -120px; left: -120px; width: 450px; height: 450px; border-radius: 50%; background: radial-gradient(circle, rgba(0,199,179,0.08) 0%, transparent 70%); pointer-events: none;"></div>

    <div class="container">
      <div style="max-width: 1040px; margin: 0 auto; background: #0c1828; border: 1px solid rgba(0,199,179,0.35); border-radius: 16px; padding: clamp(2rem, 5vw, 4.5rem); box-shadow: 0 25px 60px rgba(0,0,0,0.45); position: relative;">
        
        <!-- Header Meta -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 1.5rem; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(0,199,179,0.25);">
          <div>
            <span style="display: inline-block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #00c7b3; margin-bottom: 0.5rem;">
              EXECUTIVE ADDRESS // CHIEF EXECUTIVE OFFICER
            </span>
            <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 800; color: #fff; margin: 0; line-height: 1.2;">
              CEO’S MESSAGE
            </h2>
            <div style="font-size: 0.95rem; color: #94a3b8; margin-top: 0.5rem; font-weight: 500;">
              Disciplined Execution, People-Centric Culture &amp; Agile Enterprise Growth
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 64px; height: 64px; border-radius: 50%; border: 2.5px solid #00c7b3; background: radial-gradient(circle, rgba(0,199,179,0.25) 0%, #07111e 70%); display: flex; align-items: center; justify-content: center; color: #00c7b3; font-weight: 800; font-size: 1.25rem;">
              SF
            </div>
            <div style="text-align: left;">
              <div style="color: #fff; font-weight: 700; font-size: 1.05rem;">Mrs. Sadaf Fatma</div>
              <div style="color: #00c7b3; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">Chief Executive Officer (CEO)</div>
              <div style="color: #64748b; font-size: 0.74rem;">Rayan Group (UAE &amp; India)</div>
            </div>
          </div>
        </div>

        <!-- Pull Quote -->
        <div style="background: rgba(0,199,179,0.06); border-left: 4px solid #00c7b3; padding: 1.5rem 1.75rem; border-radius: 0 10px 10px 0; margin-bottom: 2.5rem;">
          <p style="font-family: var(--font-heading); font-size: clamp(1.05rem, 1.8vw, 1.25rem); font-style: italic; color: #f1f5f9; line-height: 1.6; margin: 0;">
            “Great enterprises are forged through inspired people, resilient partnerships, disciplined execution, and an unshakeable clarity of purpose. At RAYAN Group, our mission is simple yet profound: to create lasting value today while building stronger opportunities for tomorrow.”
          </p>
        </div>

        <!-- Message Prose -->
        <div style="color: #cbd5e1; font-size: 1.025rem; line-height: 1.85; display: flex; flex-direction: column; gap: 1.35rem;">
          <p style="font-weight: 600; color: #e2e8f0; font-size: 1.1rem; margin: 0;">
            A Warm Welcome to RAYAN Group,
          </p>

          <p style="margin: 0;">
            Our corporate journey has continuously been guided by an enduring conviction: transformative businesses are not created by chance, but by deliberate discipline, exceptional talent, trustworthy alliances, and a clear vision for what lies ahead.
          </p>

          <p style="margin: 0;">
            Today, <strong>RAYAN Group</strong> is advancing with accelerating momentum as a diversified multinational enterprise. Across our operational hubs in the United Arab Emirates and India, we unite deep domain expertise across multi-disciplinary engineering, turnkey civil contracting, strategic infrastructure, commercial renewable energy, and heavy industrial fabrication.
          </p>

          <p style="margin: 0;">
            Our primary strength originates from the collective capabilities, passion, and technical mastery of our multidisciplinary team. While each operating entity functions with dedicated autonomy and sector specialization, we are unified by a shared standard of excellence, common institutional values, and an uncompromising commitment to delivering measurable, high-impact outcomes for our clients and stakeholders.
          </p>

          <!-- Twin Pillars Highlight -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(0,199,179,0.25); border-radius: 12px; padding: 1.75rem; margin: 0.5rem 0;">
            <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: #00c7b3; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 0.75rem;">
              Twin Pillars of Strategic Growth: UAE &amp; India
            </h4>
            <p style="margin: 0; color: #94a3b8; font-size: 0.95rem; line-height: 1.7;">
              The UAE and India constitute the twin foundations of our corporate growth strategy. The UAE provides a dynamic global stage for iconic infrastructure, advanced industrial initiatives, and ambitious mega-developments. Concurrently, India delivers extraordinary technical intellect, engineering ingenuity, state-of-the-art manufacturing infrastructure, and sustained long-term economic vigor. By synchronizing these strategic corridors, we unlock unprecedented enterprise value that transcends individual project boundaries.
            </p>
          </div>

          <p style="margin: 0;">
            At RAYAN Group, our operational benchmark is centered not merely on <em>what</em> we build, but <em>how</em> we construct it. Rigorous quality control, zero-compromise occupational safety (HSE), operational efficiency, cutting-edge engineering technologies, and ESG stewardship remain woven into every blueprint and field operation.
          </p>

          <p style="margin: 0;">
            In an era of rapid technological transformation and changing global markets, enterprise agility is paramount. Clients rightfully demand faster execution, greater fiscal value, and higher performance benchmarks. We are meeting this imperative by modernizing our project delivery frameworks, adopting Building Information Modeling (BIM) and digital systems, empowering our people through continuous learning, and exploring clean energy solutions that keep our clients competitive in tomorrow's economy.
          </p>

          <p style="margin: 0;">
            Our vision for the future is bold and unyielding: to establish RAYAN Group as a benchmark multinational organization recognized for operational reliability, technical precision, and enduring social contribution across global markets.
          </p>

          <p style="margin: 0;">
            This trajectory would be impossible without the tireless dedication of our engineers, project managers, and workforce; the continued confidence of our clients; and the steadfast collaboration of our strategic partners. To each of you, I express my deepest respect and personal appreciation.
          </p>

          <p style="margin: 0.5rem 0 0;">
            Thank you for being part of the RAYAN Group journey.
          </p>
        </div>

        <!-- Signature Block -->
        <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(0,199,179,0.25); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 1.5rem;">
          <div>
            <div style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 0.5rem;">With warm regards and shared dedication,</div>
            <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff; letter-spacing: -0.01em;">
              Mrs. Sadaf Fatma
            </div>
            <div style="font-size: 0.85rem; font-weight: 700; color: #00c7b3; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.2rem;">
              Chief Executive Officer (CEO)
            </div>
            <div style="color: #94a3b8; font-size: 0.825rem; margin-top: 0.15rem;">
              RAYAN GROUP (UAE &amp; INDIA)
            </div>
          </div>
          <div style="text-align: right;">
            <div style="display: inline-block; padding: 0.5rem 1rem; border-radius: 6px; background: rgba(0,199,179,0.1); border: 1px solid rgba(0,199,179,0.3); font-size: 0.8rem; color: #00c7b3; font-weight: 700;">
              DISCIPLINED EXECUTION &bull; SUSTAINABLE GROWTH
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

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

// Common IR subnav configuration
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
// 1. INVESTOR RELATIONS HUB (/investors/index.html)
// ============================================================================
createRoute('investors/index.html', {
  title: 'Investor Relations Dashboard & Financial Performance',
  description: 'Access Rayan Group financial results, annual reports, stock performance (ADX: RYNG), shareholder disclosures, and institutional governance.',
  activePath: '/investors/',
  heroHtml: renderPageHero({
    category: 'INVESTOR RELATIONS',
    title: 'CAPITAL & VALUE CREATION',
    description: 'Delivering sustainable long-term value through operational scale, engineering discipline, and prudent capital allocation across high-growth international markets.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Investors', href: '/investors/' }],
    bgImage: '/assets/images/investors/investor-hero.jpg',
    subnav: irSubnav('/investors/')
  }),
  content: `
  <!-- Key Financial Metrics Bar -->
  <section class="section" style="padding: 5rem 0 3rem; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 750px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">FINANCIAL HIGHLIGHTS FY2024</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">RECORD CORPORATE PERFORMANCE</h2>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 3.5rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; text-align: center;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">REVENUE FY2024</span>
          <div style="font-family: var(--font-heading); font-size: 2.75rem; font-weight: 800; color: #0099e6; margin: 0.5rem 0;" data-counter-target="1.82" data-counter-prefix="AED " data-counter-suffix="B" data-counter-decimals="2">AED 1.82B</div>
          <span style="font-size: 0.8125rem; color: #10b981; font-weight: 600;">▲ +24.2% YoY Growth</span>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; text-align: center;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">EBITDA</span>
          <div style="font-family: var(--font-heading); font-size: 2.75rem; font-weight: 800; color: #fff; margin: 0.5rem 0;" data-counter-target="385" data-counter-prefix="AED " data-counter-suffix="M">AED 385M</div>
          <span style="font-size: 0.8125rem; color: #10b981; font-weight: 600;">▲ 21.1% EBITDA Margin</span>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; text-align: center;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">NET PROFIT</span>
          <div style="font-family: var(--font-heading); font-size: 2.75rem; font-weight: 800; color: #0099e6; margin: 0.5rem 0;" data-counter-target="246" data-counter-prefix="AED " data-counter-suffix="M">AED 246M</div>
          <span style="font-size: 0.8125rem; color: #10b981; font-weight: 600;">▲ +19.4% YoY Growth</span>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; text-align: center;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">MARKET CAPITALIZATION</span>
          <div style="font-family: var(--font-heading); font-size: 2.75rem; font-weight: 800; color: #c5a059; margin: 0.5rem 0;" data-counter-target="8.52" data-counter-prefix="AED " data-counter-suffix="B" data-counter-decimals="2">AED 8.52B</div>
          <span style="font-size: 0.8125rem; color: #cbd5e1;">ADX: RYNG Listing</span>
        </div>
      </div>

      <!-- Quick Portals Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <a href="/investors/financial-results/" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem; text-decoration: none; display: block; transition: all 0.3s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #0099e6;">REPORTS &amp; AUDITS</span>
            <span style="color: #0099e6;">→</span>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Financial Results</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.5;">Access quarterly statements, audited annual accounts, income statements, and cash flows.</p>
        </a>

        <a href="/investors/annual-reports/" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem; text-decoration: none; display: block; transition: all 0.3s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #0099e6;">DOWNLOAD ARCHIVE</span>
            <span style="color: #0099e6;">→</span>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Annual Reports</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.5;">Comprehensive annual reports, integrated ESG performance, and auditor sign-offs in PDF format.</p>
        </a>

        <a href="/investors/presentations/" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem; text-decoration: none; display: block; transition: all 0.3s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #0099e6;">DISCLOSURES</span>
            <span style="color: #0099e6;">→</span>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Investor Presentations</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.5;">Quarterly roadshow slides, Capital Markets Day presentations, and executive webcasts.</p>
        </a>

        <a href="/investors/stock-information/" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem; text-decoration: none; display: block; transition: all 0.3s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #0099e6;">ADX LISTING</span>
            <span style="color: #0099e6;">→</span>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Stock Information</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.5;">Real-time stock quote (ADX: RYNG), historical chart data, shares in issue, and valuation ratios.</p>
        </a>
      </div>
    </div>
  </section>

  <!-- Investor Relations Contact & Secretary -->
  <section class="section" style="padding: 5rem 0; background: #050b14;">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">SHAREHOLDER ENGAGEMENT</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.5rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 1.5rem;">INVESTOR RELATIONS SECRETARIAT</h2>
          <p style="color: #cbd5e1; font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem;">
            Rayan Group is committed to continuous, fair, and transparent communication with institutional investors, analysts, and retail shareholders globally.
          </p>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; gap: 1rem; align-items: center;">
              <span style="color: #0099e6; font-weight: 700; width: 140px;">IR EMAIL:</span>
              <a href="mailto:ir@rayangroup.com" style="color: #fff; text-decoration: none;">ir@rayangroup.com</a>
            </div>
            <div style="display: flex; gap: 1rem; align-items: center;">
              <span style="color: #0099e6; font-weight: 700; width: 140px;">DIRECT LINE:</span>
              <span style="color: #fff;">+971 2 642 8899</span>
            </div>
            <div style="display: flex; gap: 1rem; align-items: center;">
              <span style="color: #0099e6; font-weight: 700; width: 140px;">REGISTRAR:</span>
              <span style="color: #fff;">Abu Dhabi Securities Exchange (ADX)</span>
            </div>
          </div>
        </div>
        <div>
          <img src="/assets/images/investors/corporate-financial-tower.jpg" alt="Rayan Group Headquarters" style="width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 2. FINANCIAL RESULTS (/investors/financial-results/index.html)
// ============================================================================
createRoute('investors/financial-results/index.html', {
  title: 'Financial Results, Statements & Segment Performance',
  description: 'Audited financial statements, quarterly income statements, EBITDA margins, and divisional revenue performance for Rayan Group.',
  activePath: '/investors/financial-results/',
  heroHtml: renderPageHero({
    category: 'FINANCIAL REPORTING',
    title: 'FINANCIAL RESULTS',
    description: 'Disciplined revenue compounding, resilient operational margins, and strong balance sheet liquidity across all business verticals.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Investors', href: '/investors/' }, { label: 'Financial Results', href: '/investors/financial-results/' }],
    bgImage: '/assets/images/investors/corporate-financial-tower.jpg',
    subnav: irSubnav('/investors/financial-results/')
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: #07111e;">
    <div class="container">
      <div style="margin-bottom: 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">STATEMENT OF COMPREHENSIVE INCOME</span>
        <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">FY2024 CONSOLIDATED PERFORMANCE</h2>
      </div>

      <!-- Financial Data Table -->
      <div class="ir-table-wrapper" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 4rem;">
        <div style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); flex-wrap: wrap; gap: 1rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin: 0;">Summary Income Statement (in AED Millions)</h3>
          <div class="ir-table-search">
            <input type="text" placeholder="Search line items..." style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem;">
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
            <thead>
              <tr style="background: rgba(255,255,255,0.03); color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08);">
                <th style="padding: 1rem 1.5rem; font-weight: 700;">METRIC / LINE ITEM</th>
                <th style="padding: 1rem 1.5rem; font-weight: 700; text-align: right;">FY 2024</th>
                <th style="padding: 1rem 1.5rem; font-weight: 700; text-align: right;">FY 2023</th>
                <th style="padding: 1rem 1.5rem; font-weight: 700; text-align: right;">YoY CHANGE</th>
                <th style="padding: 1rem 1.5rem; font-weight: 700; text-align: center;">DISCLOSURE</th>
              </tr>
            </thead>
            <tbody style="color: #cbd5e1;">
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 1rem 1.5rem; font-weight: 700; color: #fff;">Consolidated Revenue</td>
                <td style="padding: 1rem 1.5rem; text-align: right; font-weight: 700; color: #0099e6;">1,824.5</td>
                <td style="padding: 1rem 1.5rem; text-align: right;">1,468.2</td>
                <td style="padding: 1rem 1.5rem; text-align: right; color: #10b981; font-weight: 600;">+24.2%</td>
                <td style="padding: 1rem 1.5rem; text-align: center;"><a href="#" class="doc-download-btn" data-doc-name="FY2024 Revenue Breakdown" style="color: #0099e6; text-decoration: none;">Download PDF</a></td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 1rem 1.5rem;">Cost of Operations &amp; Direct Materials</td>
                <td style="padding: 1rem 1.5rem; text-align: right;">(1,312.0)</td>
                <td style="padding: 1rem 1.5rem; text-align: right;">(1,062.5)</td>
                <td style="padding: 1rem 1.5rem; text-align: right; color: #94a3b8;">+23.4%</td>
                <td style="padding: 1rem 1.5rem; text-align: center;"><a href="#" class="doc-download-btn" data-doc-name="Operational Cost Note" style="color: #0099e6; text-decoration: none;">Download PDF</a></td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 1rem 1.5rem; font-weight: 700; color: #fff;">Gross Profit</td>
                <td style="padding: 1rem 1.5rem; text-align: right; font-weight: 700; color: #fff;">512.5</td>
                <td style="padding: 1rem 1.5rem; text-align: right;">405.7</td>
                <td style="padding: 1rem 1.5rem; text-align: right; color: #10b981; font-weight: 600;">+26.3%</td>
                <td style="padding: 1rem 1.5rem; text-align: center;"><a href="#" class="doc-download-btn" data-doc-name="Gross Margin Analysis" style="color: #0099e6; text-decoration: none;">Download PDF</a></td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 1rem 1.5rem; font-weight: 700; color: #fff;">EBITDA</td>
                <td style="padding: 1rem 1.5rem; text-align: right; font-weight: 700; color: #10b981;">385.2</td>
                <td style="padding: 1rem 1.5rem; text-align: right;">318.0</td>
                <td style="padding: 1rem 1.5rem; text-align: right; color: #10b981; font-weight: 600;">+21.1%</td>
                <td style="padding: 1rem 1.5rem; text-align: center;"><a href="#" class="doc-download-btn" data-doc-name="EBITDA Reconciliation" style="color: #0099e6; text-decoration: none;">Download PDF</a></td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 1rem 1.5rem; font-weight: 700; color: #fff;">Net Profit Attributable to Shareholders</td>
                <td style="padding: 1rem 1.5rem; text-align: right; font-weight: 700; color: #c5a059;">246.0</td>
                <td style="padding: 1rem 1.5rem; text-align: right;">206.0</td>
                <td style="padding: 1rem 1.5rem; text-align: right; color: #10b981; font-weight: 600;">+19.4%</td>
                <td style="padding: 1rem 1.5rem; text-align: center;"><a href="#" class="doc-download-btn" data-doc-name="FY2024 Full Audit" style="color: #0099e6; text-decoration: none;">Download PDF</a></td>
              </tr>
              <tr>
                <td style="padding: 1rem 1.5rem;">Basic &amp; Diluted EPS (AED)</td>
                <td style="padding: 1rem 1.5rem; text-align: right; font-weight: 700; color: #fff;">0.82</td>
                <td style="padding: 1rem 1.5rem; text-align: right;">0.69</td>
                <td style="padding: 1rem 1.5rem; text-align: right; color: #10b981; font-weight: 600;">+18.8%</td>
                <td style="padding: 1rem 1.5rem; text-align: center;"><a href="#" class="doc-download-btn" data-doc-name="Share Capital Notes" style="color: #0099e6; text-decoration: none;">Download PDF</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Segment Performance Cards -->
      <div>
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">OPERATIONAL DIVERSIFICATION</span>
        <h2 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 2rem;">REVENUE CONTRIBUTION BY DIVISION</h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
              <h4 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff;">Civil &amp; General Contracting</h4>
              <span style="font-weight: 700; color: #0099e6;">42%</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem;">AED 766M Revenue. Driven by commercial retail, luxury residential, and mixed-use towers.</p>
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
              <div style="width: 42%; height: 100%; background: #0099e6;"></div>
            </div>
          </div>

          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
              <h4 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff;">Energy &amp; Oil/Gas EPC</h4>
              <span style="font-weight: 700; color: #10b981;">28%</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem;">AED 511M Revenue. Pipeline installation, storage tank farms, and petrochemical maintenance.</p>
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
              <div style="width: 28%; height: 100%; background: #10b981;"></div>
            </div>
          </div>

          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
              <h4 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff;">International Operations (Ashaz India)</h4>
              <span style="font-weight: 700; color: #c5a059;">18%</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem;">AED 328M Revenue. Industrial fabrication, mechanical engineering, and cross-border project execution.</p>
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
              <div style="width: 18%; height: 100%; background: #c5a059;"></div>
            </div>
          </div>

          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
              <h4 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff;">Heavy Logistics &amp; Other</h4>
              <span style="font-weight: 700; color: #38bdf8;">12%</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem;">AED 219M Revenue. Heavy crane charters, modular transport, and specialist engineering MEP.</p>
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
              <div style="width: 12%; height: 100%; background: #38bdf8;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 3. ANNUAL REPORTS (/investors/annual-reports/index.html)
// ============================================================================
createRoute('investors/annual-reports/index.html', {
  title: 'Annual Reports, Integrated Audits & ESG Disclosures',
  description: 'Download audited Annual Reports, Integrated Reports, Corporate Governance Statements, and ESG Disclosures for Rayan Group.',
  activePath: '/investors/annual-reports/',
  heroHtml: renderPageHero({
    category: 'INVESTOR DISCLOSURES',
    title: 'ANNUAL REPORTS ARCHIVE',
    description: 'Providing comprehensive transparency into annual operations, financial performance, strategic milestones, and stakeholder value creation.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Investors', href: '/investors/' }, { label: 'Annual Reports', href: '/investors/annual-reports/' }],
    bgImage: '/assets/images/investors/governance.jpg',
    subnav: irSubnav('/investors/annual-reports/')
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: #07111e;">
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 3rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">STATUTORY PUBLICATIONS</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">ANNUAL REPORT LIBRARY</h2>
        </div>
        <div style="font-size: 0.85rem; color: #94a3b8;">Format: High-Resolution PDF (Interactive)</div>
      </div>

      <!-- Searchable Report Table -->
      <div class="ir-table-wrapper" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
        <div style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); flex-wrap: wrap; gap: 1rem;">
          <div style="font-weight: 700; color: #fff;">Filter Publications by Year or Topic</div>
          <div class="ir-table-search">
            <input type="text" placeholder="Search reports (e.g. 2024, ESG, Audit)..." style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; width: 280px;">
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
            <thead>
              <tr style="background: rgba(255,255,255,0.03); color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08);">
                <th style="padding: 1.1rem 1.5rem; font-weight: 700;">YEAR</th>
                <th style="padding: 1.1rem 1.5rem; font-weight: 700;">DOCUMENT TITLE</th>
                <th style="padding: 1.1rem 1.5rem; font-weight: 700;">CATEGORY</th>
                <th style="padding: 1.1rem 1.5rem; font-weight: 700;">FILE SIZE</th>
                <th style="padding: 1.1rem 1.5rem; font-weight: 700; text-align: right;">ACTION</th>
              </tr>
            </thead>
            <tbody style="color: #cbd5e1;">
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 1.1rem 1.5rem; font-weight: 700; color: #0099e6;">2024</td>
                <td style="padding: 1.1rem 1.5rem; font-weight: 600; color: #fff;">Rayan Group Integrated Annual Report 2024</td>
                <td style="padding: 1.1rem 1.5rem;"><span style="background: rgba(0,153,230,0.15); color: #0099e6; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem;">Full Financials</span></td>
                <td style="padding: 1.1rem 1.5rem; color: #94a3b8;">14.2 MB</td>
                <td style="padding: 1.1rem 1.5rem; text-align: right;"><button type="button" class="doc-download-btn btn-enterprise-primary" data-doc-name="Annual Report 2024" style="padding: 0.4rem 0.9rem; font-size: 0.75rem;">DOWNLOAD PDF ↓</button></td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 1.1rem 1.5rem; font-weight: 700; color: #0099e6;">2024</td>
                <td style="padding: 1.1rem 1.5rem; font-weight: 600; color: #fff;">Sustainability &amp; ESG Governance Report 2024</td>
                <td style="padding: 1.1rem 1.5rem;"><span style="background: rgba(16,185,129,0.15); color: #10b981; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem;">ESG Disclosure</span></td>
                <td style="padding: 1.1rem 1.5rem; color: #94a3b8;">8.6 MB</td>
                <td style="padding: 1.1rem 1.5rem; text-align: right;"><button type="button" class="doc-download-btn btn-enterprise-primary" data-doc-name="ESG Report 2024" style="padding: 0.4rem 0.9rem; font-size: 0.75rem;">DOWNLOAD PDF ↓</button></td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 1.1rem 1.5rem; font-weight: 700; color: #0099e6;">2024</td>
                <td style="padding: 1.1rem 1.5rem; font-weight: 600; color: #fff;">Corporate Governance Statement &amp; Board Report</td>
                <td style="padding: 1.1rem 1.5rem;"><span style="background: rgba(197,160,89,0.15); color: #c5a059; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem;">Governance</span></td>
                <td style="padding: 1.1rem 1.5rem; color: #94a3b8;">4.1 MB</td>
                <td style="padding: 1.1rem 1.5rem; text-align: right;"><button type="button" class="doc-download-btn btn-enterprise-primary" data-doc-name="Corporate Governance 2024" style="padding: 0.4rem 0.9rem; font-size: 0.75rem;">DOWNLOAD PDF ↓</button></td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 1.1rem 1.5rem; font-weight: 700; color: #0099e6;">2023</td>
                <td style="padding: 1.1rem 1.5rem; font-weight: 600; color: #fff;">Rayan Group Integrated Annual Report 2023</td>
                <td style="padding: 1.1rem 1.5rem;"><span style="background: rgba(0,153,230,0.15); color: #0099e6; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem;">Full Financials</span></td>
                <td style="padding: 1.1rem 1.5rem; color: #94a3b8;">12.8 MB</td>
                <td style="padding: 1.1rem 1.5rem; text-align: right;"><button type="button" class="doc-download-btn btn-enterprise-primary" data-doc-name="Annual Report 2023" style="padding: 0.4rem 0.9rem; font-size: 0.75rem;">DOWNLOAD PDF ↓</button></td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 1.1rem 1.5rem; font-weight: 700; color: #0099e6;">2022</td>
                <td style="padding: 1.1rem 1.5rem; font-weight: 600; color: #fff;">Rayan Group Annual Financial Statement 2022</td>
                <td style="padding: 1.1rem 1.5rem;"><span style="background: rgba(0,153,230,0.15); color: #0099e6; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem;">Full Financials</span></td>
                <td style="padding: 1.1rem 1.5rem; color: #94a3b8;">9.4 MB</td>
                <td style="padding: 1.1rem 1.5rem; text-align: right;"><button type="button" class="doc-download-btn btn-enterprise-primary" data-doc-name="Annual Report 2022" style="padding: 0.4rem 0.9rem; font-size: 0.75rem;">DOWNLOAD PDF ↓</button></td>
              </tr>
              <tr>
                <td style="padding: 1.1rem 1.5rem; font-weight: 700; color: #0099e6;">2021</td>
                <td style="padding: 1.1rem 1.5rem; font-weight: 600; color: #fff;">Inaugural Group Consolidation Report 2021</td>
                <td style="padding: 1.1rem 1.5rem;"><span style="background: rgba(0,153,230,0.15); color: #0099e6; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem;">Foundational</span></td>
                <td style="padding: 1.1rem 1.5rem; color: #94a3b8;">6.2 MB</td>
                <td style="padding: 1.1rem 1.5rem; text-align: right;"><button type="button" class="doc-download-btn btn-enterprise-primary" data-doc-name="Consolidation Report 2021" style="padding: 0.4rem 0.9rem; font-size: 0.75rem;">DOWNLOAD PDF ↓</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 4. INVESTOR PRESENTATIONS (/investors/presentations/index.html)
// ============================================================================
createRoute('investors/presentations/index.html', {
  title: 'Investor Presentations, Roadshow Decks & Webcasts',
  description: 'Download Rayan Group executive presentations, Capital Markets Day slide decks, and quarterly earnings call conference webcasts.',
  activePath: '/investors/presentations/',
  heroHtml: renderPageHero({
    category: 'EXECUTIVE DISCLOSURES',
    title: 'INVESTOR PRESENTATIONS',
    description: 'Executive overviews, market outlooks, capital expenditure plans, and commercial growth strategies presented to international institutional investors.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Investors', href: '/investors/' }, { label: 'Presentations', href: '/investors/presentations/' }],
    bgImage: '/assets/images/investors/boardroom-governance.jpg',
    subnav: irSubnav('/investors/presentations/')
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: #07111e;">
    <div class="container">
      <div style="margin-bottom: 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">ROADSHOWS &amp; EARNINGS CALLS</span>
        <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">LATEST INVESTOR DECKS</h2>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 2rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
          <div style="height: 180px; position: relative; overflow: hidden;">
            <img src="/assets/images/investors/investor-hero.jpg" alt="Capital Markets Day" style="width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; top: 1rem; left: 1rem; background: #0099e6; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 4px;">KEYNOTE PRESENTATION</div>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;">FEB 2025 • ABU DHABI</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.5rem 0 1rem; line-height: 1.3;">Capital Markets Day 2025: Engineering The Decade of Growth</h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">Comprehensive 48-page slide deck outlining Rayan Group's multi-billion AED project backlog, Energy EPC expansion, and Ashaz Engineering India manufacturing hub.</p>
            <button type="button" class="doc-download-btn btn-enterprise-primary" data-doc-name="Capital Markets Day 2025 Deck" style="width: 100%; justify-content: center;">DOWNLOAD DECK (PDF 18MB) ↓</button>
          </div>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
          <div style="height: 180px; position: relative; overflow: hidden;">
            <img src="/assets/images/investors/corporate-financial-tower.jpg" alt="FY2024 Results Presentation" style="width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; top: 1rem; left: 1rem; background: #10b981; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 4px;">EARNINGS CALL</div>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;">JAN 2025 • GLOBAL WEBCAST</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.5rem 0 1rem; line-height: 1.3;">FY2024 Full Year Financial Results Presentation</h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">CFO &amp; CEO presentation covering 24.2% top-line revenue expansion, EBITDA expansion to AED 385M, and capital expenditure roadmap.</p>
            <button type="button" class="doc-download-btn btn-enterprise-primary" data-doc-name="FY2024 Earnings Presentation" style="width: 100%; justify-content: center;">DOWNLOAD DECK (PDF 9MB) ↓</button>
          </div>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
          <div style="height: 180px; position: relative; overflow: hidden;">
            <img src="/assets/images/business/03-energy.jpg" alt="Energy &amp; Industrial EPC" style="width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; top: 1rem; left: 1rem; background: #c5a059; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 4px;">DIVISIONAL DECK</div>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;">NOV 2024 • LONDON ROADSHOW</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.5rem 0 1rem; line-height: 1.3;">Energy EPC &amp; Industrial Infrastructure Deck</h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">Deep dive into Rayan Group's energy infrastructure assets, turnkey EPC capabilities, industrial manufacturing plants, and hydrocarbon storage contracts.</p>
            <button type="button" class="doc-download-btn btn-enterprise-primary" data-doc-name="Energy and EPC Deck" style="width: 100%; justify-content: center;">DOWNLOAD DECK (PDF 11MB) ↓</button>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 5. SHAREHOLDER INFORMATION (/investors/shareholder-information/index.html)
// ============================================================================
createRoute('investors/shareholder-information/index.html', {
  title: 'Shareholder Information, Capital Structure & Dividends',
  description: 'Examine Rayan Group share capital distribution, institutional shareholder register, dividend history, and registry services.',
  activePath: '/investors/shareholder-information/',
  heroHtml: renderPageHero({
    category: 'INVESTOR SERVICES',
    title: 'SHAREHOLDER INFORMATION',
    description: 'Providing comprehensive share capital structure, historic dividend distribution track records, and share registrar contact points.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Investors', href: '/investors/' }, { label: 'Shareholder Info', href: '/investors/shareholder-information/' }],
    bgImage: '/assets/images/investors/governance.jpg',
    subnav: irSubnav('/investors/shareholder-information/')
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: #07111e;">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: flex-start; margin-bottom: 5rem;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">CAPITAL STRUCTURE</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 1.5rem;">EQUITY &amp; SHARE DISTRIBUTION</h2>
          <p style="color: #cbd5e1; font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem;">
            Rayan Group has 300,000,000 ordinary shares listed and traded on the Abu Dhabi Securities Exchange under ticker symbol <strong>RYNG</strong>, with nominal par value of AED 1.00 each.
          </p>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); padding: 1.25rem; border-radius: 8px; display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Issued &amp; Paid-Up Capital:</span>
              <span style="font-weight: 700; color: #fff;">AED 300,000,000</span>
            </div>
            <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); padding: 1.25rem; border-radius: 8px; display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Total Ordinary Shares:</span>
              <span style="font-weight: 700; color: #fff;">300,000,000 Shares</span>
            </div>
            <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); padding: 1.25rem; border-radius: 8px; display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Founding &amp; Strategic Sponsors:</span>
              <span style="font-weight: 700; color: #0099e6;">68.5%</span>
            </div>
            <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); padding: 1.25rem; border-radius: 8px; display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Institutional &amp; Public Float:</span>
              <span style="font-weight: 700; color: #10b981;">31.5%</span>
            </div>
          </div>
        </div>

        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">SHARE REGISTRAR</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 1.5rem;">REGISTRATION SERVICES</h2>
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem;">
            <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 1rem;">Abu Dhabi Securities Exchange (ADX)</h4>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">
              Shareholders requiring assistance with share certificate reconciliation, dividends payment status, bank account updates, or NIN transfers should consult ADX Registry Services.
            </p>
            <div style="color: #cbd5e1; font-size: 0.875rem; line-height: 1.8;">
              <div><strong>Toll-Free (UAE):</strong> 800 ADX (800 239)</div>
              <div><strong>International:</strong> +971 2 627 7777</div>
              <div><strong>Email:</strong> contactus@adx.ae</div>
              <div><strong>Website:</strong> www.adx.ae</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dividend History Table -->
      <div>
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">CASH DISTRIBUTIONS</span>
        <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 2rem;">HISTORIC DIVIDEND TRACK RECORD</h2>

        <div class="ir-table-wrapper" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
              <thead>
                <tr style="background: rgba(255,255,255,0.03); color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08);">
                  <th style="padding: 1rem 1.5rem;">FINANCIAL YEAR</th>
                  <th style="padding: 1rem 1.5rem;">DIVIDEND PER SHARE</th>
                  <th style="padding: 1rem 1.5rem;">TOTAL PAYOUT</th>
                  <th style="padding: 1rem 1.5rem;">EX-DIVIDEND DATE</th>
                  <th style="padding: 1rem 1.5rem;">PAYMENT DATE</th>
                  <th style="padding: 1rem 1.5rem; text-align: right;">STATUS</th>
                </tr>
              </thead>
              <tbody style="color: #cbd5e1;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                  <td style="padding: 1rem 1.5rem; font-weight: 700; color: #fff;">FY 2024 (Proposed)</td>
                  <td style="padding: 1rem 1.5rem; font-weight: 700; color: #0099e6;">AED 0.85</td>
                  <td style="padding: 1rem 1.5rem;">AED 255.0M</td>
                  <td style="padding: 1rem 1.5rem;">Apr 14, 2025</td>
                  <td style="padding: 1rem 1.5rem;">May 02, 2025</td>
                  <td style="padding: 1rem 1.5rem; text-align: right;"><span style="color: #c5a059; font-weight: 700;">Subject to AGM</span></td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                  <td style="padding: 1rem 1.5rem; font-weight: 700; color: #fff;">FY 2023</td>
                  <td style="padding: 1rem 1.5rem; font-weight: 700; color: #0099e6;">AED 0.72</td>
                  <td style="padding: 1rem 1.5rem;">AED 216.0M</td>
                  <td style="padding: 1rem 1.5rem;">Apr 10, 2024</td>
                  <td style="padding: 1rem 1.5rem;">Apr 29, 2024</td>
                  <td style="padding: 1rem 1.5rem; text-align: right;"><span style="color: #10b981; font-weight: 700;">Paid</span></td>
                </tr>
                <tr>
                  <td style="padding: 1rem 1.5rem; font-weight: 700; color: #fff;">FY 2022</td>
                  <td style="padding: 1rem 1.5rem; font-weight: 700; color: #0099e6;">AED 0.58</td>
                  <td style="padding: 1rem 1.5rem;">AED 174.0M</td>
                  <td style="padding: 1rem 1.5rem;">Apr 12, 2023</td>
                  <td style="padding: 1rem 1.5rem;">Apr 30, 2023</td>
                  <td style="padding: 1rem 1.5rem; text-align: right;"><span style="color: #10b981; font-weight: 700;">Paid</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 6. CORPORATE GOVERNANCE (/investors/corporate-governance/index.html)
// ============================================================================
createRoute('investors/corporate-governance/index.html', {
  title: 'Corporate Governance Framework & Board Charters',
  description: 'Rayan Group institutional governance framework, board committees, code of business conduct, ethics line, and compliance policies.',
  activePath: '/investors/corporate-governance/',
  heroHtml: renderPageHero({
    category: 'INTEGRITY & FIDUCIARY ETHICS',
    title: 'CORPORATE GOVERNANCE',
    description: 'Operating with strict institutional oversight, transparent disclosure standards, independent board committees, and uncompromising integrity.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Investors', href: '/investors/' }, { label: 'Governance', href: '/investors/corporate-governance/' }],
    bgImage: '/assets/images/investors/boardroom-governance.jpg',
    subnav: irSubnav('/investors/corporate-governance/')
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: #07111e;">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; margin-bottom: 5rem;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">INSTITUTIONAL RIGOR</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 1.5rem;">OUR GOVERNANCE PHILOSOPHY</h2>
          <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.25rem;">
            At Rayan Group, sound corporate governance is not merely compliance—it is the foundation of long-term commercial competitiveness and stakeholder trust across the UAE, South Asia, and global markets.
          </p>
          <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.65;">
            Our board structure enforces clear separation between non-executive oversight and operational executive management, ensuring accountability, risk mitigation, and ethical stewardship.
          </p>
        </div>
        <div>
          <img src="/assets/images/investors/boardroom-governance.jpg" alt="Boardroom Governance" style="width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        </div>
      </div>

      <!-- Governance Pillars & Charters -->
      <div>
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">GOVERNANCE INSTRUMENTS</span>
        <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 2rem;">BOARD CHARTERS &amp; ETHICS POLICIES</h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
            <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">Audit &amp; Risk Committee Charter</h4>
            <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.5rem;">Mandates direct oversight over external auditors, quarterly financial statement veracity, enterprise risk heatmaps, and cybersecurity controls.</p>
            <button type="button" class="doc-download-btn btn-enterprise-primary" data-doc-name="Audit Committee Charter" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;">DOWNLOAD CHARTER (PDF) ↓</button>
          </div>

          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
            <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">Code of Business Conduct &amp; Ethics</h4>
            <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.5rem;">Applies to 10,000+ professionals across all group companies. Enforces zero tolerance for bribery, anti-corruption, and strict fair competition.</p>
            <button type="button" class="doc-download-btn btn-enterprise-primary" data-doc-name="Code of Conduct" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;">DOWNLOAD CODE (PDF) ↓</button>
          </div>

          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem;">
            <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">Whistleblower &amp; Integrity Policy</h4>
            <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.5rem;">Confidential reporting mechanism managed by an independent third-party ombudsman, guaranteeing absolute protection for bona fide reporters.</p>
            <button type="button" class="doc-download-btn btn-enterprise-primary" data-doc-name="Whistleblower Policy" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;">DOWNLOAD POLICY (PDF) ↓</button>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 7. STOCK INFORMATION (/investors/stock-information/index.html)
// ============================================================================
createRoute('investors/stock-information/index.html', {
  title: 'Stock Information & Trading Metrics (ADX: RYNG)',
  description: 'Monitor Rayan Group equity performance on Abu Dhabi Securities Exchange (ADX: RYNG), interactive quote, valuation multiples, and analyst coverage.',
  activePath: '/investors/stock-information/',
  heroHtml: renderPageHero({
    category: 'EQUITY CAPITAL MARKETS',
    title: 'STOCK INFORMATION',
    description: 'Real-time equity market data, trading multiples, historical price dynamics, and equity research analyst consensus for ADX: RYNG.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Investors', href: '/investors/' }, { label: 'Stock Information', href: '/investors/stock-information/' }],
    bgImage: '/assets/images/investors/investor-hero.jpg',
    subnav: irSubnav('/investors/stock-information/')
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: #07111e;">
    <div class="container">
      <!-- Live Ticker Card -->
      <div style="background: #0c1828; border: 1px solid rgba(0,153,230,0.3); border-radius: 12px; padding: 2.5rem; margin-bottom: 4rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 2rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
              <span style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff;">ADX: RYNG</span>
              <span style="font-size: 0.8rem; background: rgba(0,153,230,0.15); color: #0099e6; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 700;">ABU DHABI SECURITIES EXCHANGE</span>
            </div>
            <div style="font-family: var(--font-heading); font-size: clamp(2.5rem, 4vw, 3.5rem); font-weight: 800; color: #38bdf8;">
              AED 28.40
              <span style="font-size: 1.25rem; font-weight: 600; color: #10b981; margin-left: 0.75rem;">▲ +0.50 (+1.79%)</span>
            </div>
            <span style="font-size: 0.75rem; color: #94a3b8;">Trading Currency: United Arab Emirates Dirham (AED) • Market Status: Market Closed</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem 3rem;">
            <div>
              <span style="font-size: 0.75rem; color: #94a3b8; display: block;">Day Range</span>
              <span style="font-size: 1.1rem; font-weight: 700; color: #fff;">AED 27.90 - 28.65</span>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: #94a3b8; display: block;">52-Week Range</span>
              <span style="font-size: 1.1rem; font-weight: 700; color: #fff;">AED 21.20 - 30.15</span>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: #94a3b8; display: block;">Market Capitalization</span>
              <span style="font-size: 1.1rem; font-weight: 700; color: #0099e6;">AED 8.52 Billion</span>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: #94a3b8; display: block;">Trailing P/E Ratio</span>
              <span style="font-size: 1.1rem; font-weight: 700; color: #fff;">14.6x</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Analyst Coverage Table -->
      <div>
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">INSTITUTIONAL RESEARCH</span>
        <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 2rem;">ANALYST COVERAGE &amp; CONSENSUS</h2>

        <div class="ir-table-wrapper" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
              <thead>
                <tr style="background: rgba(255,255,255,0.03); color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08);">
                  <th style="padding: 1rem 1.5rem;">INVESTMENT BANK / BROKERAGE</th>
                  <th style="padding: 1rem 1.5rem;">LEAD ANALYST</th>
                  <th style="padding: 1rem 1.5rem;">RATING</th>
                  <th style="padding: 1rem 1.5rem;">TARGET PRICE</th>
                  <th style="padding: 1rem 1.5rem; text-align: right;">LAST REPORT</th>
                </tr>
              </thead>
              <tbody style="color: #cbd5e1;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                  <td style="padding: 1rem 1.5rem; font-weight: 700; color: #fff;">FAB Securities</td>
                  <td style="padding: 1rem 1.5rem;">Tarek Al-Mansoor</td>
                  <td style="padding: 1rem 1.5rem;"><span style="color: #10b981; font-weight: 700;">BUY / OUTPERFORM</span></td>
                  <td style="padding: 1rem 1.5rem; font-weight: 700; color: #0099e6;">AED 33.50</td>
                  <td style="padding: 1rem 1.5rem; text-align: right; color: #94a3b8;">Feb 2025</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                  <td style="padding: 1rem 1.5rem; font-weight: 700; color: #fff;">EFG Hermes</td>
                  <td style="padding: 1rem 1.5rem;">Kareem Mostafa</td>
                  <td style="padding: 1rem 1.5rem;"><span style="color: #10b981; font-weight: 700;">BUY</span></td>
                  <td style="padding: 1rem 1.5rem; font-weight: 700; color: #0099e6;">AED 32.00</td>
                  <td style="padding: 1rem 1.5rem; text-align: right; color: #94a3b8;">Jan 2025</td>
                </tr>
                <tr>
                  <td style="padding: 1rem 1.5rem; font-weight: 700; color: #fff;">Emirates NBD Capital</td>
                  <td style="padding: 1rem 1.5rem;">Sarah Siddiqui</td>
                  <td style="padding: 1rem 1.5rem;"><span style="color: #c5a059; font-weight: 700;">ACCUMULATE</span></td>
                  <td style="padding: 1rem 1.5rem; font-weight: 700; color: #0099e6;">AED 31.25</td>
                  <td style="padding: 1rem 1.5rem; text-align: right; color: #94a3b8;">Dec 2024</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 8. FINANCIAL CALENDAR (/investors/financial-calendar/index.html)
// ============================================================================
createRoute('investors/financial-calendar/index.html', {
  title: 'Financial Calendar & Corporate Earnings Timeline',
  description: 'Upcoming corporate events, earnings releases, Annual General Meeting (AGM), and dividend payment key dates for Rayan Group.',
  activePath: '/investors/financial-calendar/',
  heroHtml: renderPageHero({
    category: 'INVESTOR ENGAGEMENT',
    title: 'FINANCIAL CALENDAR',
    description: 'Upcoming financial disclosures, quarterly board meetings, Annual General Meeting, and key dividend distribution record dates.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Investors', href: '/investors/' }, { label: 'Financial Calendar', href: '/investors/financial-calendar/' }],
    bgImage: '/assets/images/investors/investor-hero.jpg',
    subnav: irSubnav('/investors/financial-calendar/')
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: #07111e;">
    <div class="container">
      <div style="margin-bottom: 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">SCHEDULE OF EVENTS</span>
        <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">2025/2026 INVESTOR TIMELINE</h2>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="background: #0c1828; border: 1px solid rgba(0,153,230,0.3); border-radius: 10px; padding: 2rem; display: grid; grid-template-columns: 160px 1fr 140px; gap: 2rem; align-items: center;" class="intro-grid-responsive">
          <div>
            <span style="font-size: 0.75rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">UPCOMING</span>
            <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff;">APR 14, 2025</div>
          </div>
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Annual General Assembly Meeting (AGM)</h3>
            <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.5;">Shareholders vote on FY2024 audited accounts, proposed AED 0.85/share cash dividend, and board committee reappointments. Venue: Abu Dhabi &amp; Hybrid Webcast.</p>
          </div>
          <div style="text-align: right;">
            <button type="button" class="btn-enterprise-primary doc-download-btn" data-doc-name="AGM Invitation & Agenda" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;">AGM NOTICE ↓</button>
          </div>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem; display: grid; grid-template-columns: 160px 1fr 140px; gap: 2rem; align-items: center;" class="intro-grid-responsive">
          <div>
            <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">UPCOMING</span>
            <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff;">MAY 12, 2025</div>
          </div>
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Q1 2025 Financial Results Announcement</h3>
            <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.5;">Release of condensed interim financial statements for the three-month period ending March 31, 2025, followed by institutional earnings conference call.</p>
          </div>
          <div style="text-align: right;">
            <span style="color: #0099e6; font-size: 0.8rem; font-weight: 700;">LIVE WEBCAST</span>
          </div>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem; display: grid; grid-template-columns: 160px 1fr 140px; gap: 2rem; align-items: center;" class="intro-grid-responsive">
          <div>
            <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">UPCOMING</span>
            <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff;">AUG 11, 2025</div>
          </div>
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Q2 / Half-Year 2025 Interim Results</h3>
            <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.5;">Review of first six months operational trajectory, industrial plant utilization rates, and civil project deliveries.</p>
          </div>
          <div style="text-align: right;">
            <span style="color: #0099e6; font-size: 0.8rem; font-weight: 700;">LIVE WEBCAST</span>
          </div>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 2rem; display: grid; grid-template-columns: 160px 1fr 140px; gap: 2rem; align-items: center;" class="intro-grid-responsive">
          <div>
            <span style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase;">COMPLETED</span>
            <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff;">FEB 18, 2025</div>
          </div>
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">FY2024 Full Year Financial Results Disclosed</h3>
            <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.5;">Audit sign-off and filing on Abu Dhabi Securities Exchange portal with revenue surpassing AED 1.82 Billion.</p>
          </div>
          <div style="text-align: right;">
            <a href="/investors/financial-results/" class="btn-enterprise-secondary" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;">VIEW AUDIT →</a>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 9. CORPORATE NEWSROOM (/news/index.html)
// ============================================================================
createRoute('news/index.html', {
  title: 'Corporate Newsroom, Press Releases & Announcements',
  description: 'Stay updated with Rayan Group corporate news, major contract awards, infrastructure project completions, and international media releases.',
  activePath: '/news/',
  heroHtml: renderPageHero({
    category: 'MEDIA & COMMUNICATIONS',
    title: 'CORPORATE NEWSROOM',
    description: 'Official corporate statements, press releases, major project contract awards, executive appointments, and industry developments.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Newsroom', href: '/news/' }],
    bgImage: '/assets/images/news/news-hero.jpg',
    subnav: [
      { label: 'All News', href: '/news/', active: true },
      { label: 'Press Releases', href: '/news/#press', active: false },
      { label: 'Financial Disclosures', href: '/investors/financial-results/', active: false },
      { label: 'Media Gallery', href: '/media/', active: false }
    ]
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: #07111e;">
    <div class="container">
      <!-- News Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 2.5rem; margin-bottom: 4rem;">
        <!-- Featured Article 1 -->
        <article style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="height: 220px; overflow: hidden;">
            <img src="/assets/images/business/hero-1-skyline.jpg" alt="Commercial EPC" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          </div>
          <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">PRESS RELEASE</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">MARCH 04, 2025</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 1rem;">
              Rayan Group Awarded Landmark AED 450M Commercial &amp; Infrastructure EPC Contract
            </h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Turnkey civil construction, MEP systems, and advanced structural engineering for landmark mixed-use towers in Abu Dhabi.
            </p>
            <a href="/news/rayan-group-expands-offshore-portfolio/" class="btn-enterprise-primary" style="align-self: flex-start;">READ FULL ARTICLE →</a>
          </div>
        </article>

        <!-- Article 2 -->
        <article style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="height: 220px; overflow: hidden;">
            <img src="/assets/images/investors/corporate-financial-tower.jpg" alt="Record Revenue" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase;">FINANCIAL</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">FEBRUARY 18, 2025</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 1rem;">
              Rayan Group Reports Record FY2024 Revenue Surpassing AED 1.82 Billion
            </h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Strong 24.2% top-line growth driven by civil infrastructure, energy EPC execution, and high-margin specialized industrial engineering.
            </p>
            <a href="/investors/financial-results/" class="btn-enterprise-secondary" style="align-self: flex-start;">VIEW FINANCIAL AUDIT →</a>
          </div>
        </article>

        <!-- Article 3 -->
        <article style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="height: 220px; overflow: hidden;">
            <img src="/assets/images/sustainability/iso-45001.jpg" alt="Triple ISO" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #c5a059; text-transform: uppercase;">CORPORATE &amp; HSE</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">JANUARY 25, 2025</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 1rem;">
              Rayan Group Successfully Renews Global Triple ISO Quality &amp; Safety Certifications
            </h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; flex: 1;">
              Achieving 100% compliance across ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 audits across all construction yards.
            </p>
            <a href="/sustainability/" class="btn-enterprise-secondary" style="align-self: flex-start;">VIEW CERTIFICATIONS →</a>
          </div>
        </article>
      </div>

      <!-- Media Inquiries Box -->
      <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2rem;">
        <div>
          <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Media &amp; Press Inquiries</h4>
          <p style="color: #94a3b8; font-size: 0.9rem;">For official press kit downloads, executive interview requests, or image assets, please reach out to our communications team.</p>
        </div>
        <a href="mailto:media@rayangroup.com" class="btn-enterprise-primary">CONTACT PRESS OFFICE →</a>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 10. NEWS DETAIL ARTICLE (/news/rayan-group-expands-offshore-portfolio/index.html)
// ============================================================================
createRoute('news/rayan-group-expands-offshore-portfolio/index.html', {
  title: 'Rayan Group Awarded Landmark AED 450M Commercial & Infrastructure EPC Contract',
  description: 'Official corporate announcement regarding Rayan Group awarding of AED 450 Million turnkey engineering, procurement and construction contract.',
  activePath: '/news/',
  heroHtml: renderPageHero({
    category: 'PRESS RELEASE • OFFICIAL ANNOUNCEMENT',
    title: 'LANDMARK AED 450M EPC CONTRACT',
    description: 'Securing turnkey engineering, procurement, and structural construction for major regional development.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'News', href: '/news/' }, { label: 'EPC Contract Award', href: '/news/rayan-group-expands-offshore-portfolio/' }],
    bgImage: '/assets/images/business/hero-1-skyline.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: #07111e;">
    <div class="container" style="max-width: 900px;">
      <div style="display: flex; gap: 2rem; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.5rem; margin-bottom: 3rem;">
        <div>
          <span style="font-size: 0.75rem; color: #94a3b8; display: block;">PUBLISHED</span>
          <strong style="color: #fff; font-size: 0.9rem;">March 04, 2025</strong>
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

      <div style="color: #cbd5e1; font-size: 1.1rem; line-height: 1.8; margin-bottom: 3rem;">
        <p style="font-size: 1.25rem; font-weight: 500; color: #fff; margin-bottom: 2rem; line-height: 1.6;">
          <strong>ABU DHABI, UAE</strong> — Rayan Group, a leading multinational engineering, energy, and infrastructure conglomerate, today announced the formal signing of a major turnkey civil EPC contract valued at AED 450 Million for strategic commercial and mixed-use tower development in the Emirate of Abu Dhabi.
        </p>

        <p style="margin-bottom: 1.75rem;">
          Under the scope of the contract, Rayan Engineering will deliver full-scope structural engineering, MEP systems installation, post-tensioned slab construction, and advanced architectural finishing. The development spans over 140,000 square meters of built-up area and integrates state-of-the-art building management systems with Estidama Pearl 2 green building certification.
        </p>

        <div style="margin: 3rem 0; padding: 2rem; background: #0c1828; border-left: 4px solid #0099e6; border-radius: 0 8px 8px 0;">
          <blockquote style="font-family: var(--font-heading); font-size: 1.35rem; font-style: italic; color: #fff; line-height: 1.5; margin: 0 0 1rem;">
            "This landmark award underscores Rayan Group's proven reputation for delivering high-complexity structural engineering and turnkey project execution on accelerated schedules. Our continuous investment in digital construction management and sustainable materials ensures we exceed international benchmarks."
          </blockquote>
          <cite style="font-size: 0.9rem; color: #0099e6; font-weight: 700; text-transform: uppercase;">— Eng. Mohammad Sajjad, Founder &amp; Group Chairman</cite>
        </div>

        <p style="margin-bottom: 1.75rem;">
          Mobilization on-site has commenced immediately, with major structural construction scheduled across four sequential phases over an 18-month execution timeline. The project adheres to strict environmental standards under ISO 14001:2015 and ISO 45001:2018 safety protocols.
        </p>

        <p>
          This contract award further expands Rayan Group's consolidated unexecuted project backlog to exceed AED 3.8 Billion across its civil contracting, energy EPC, and industrial manufacturing divisions.
        </p>
      </div>

      <!-- Article Footer & Back Link -->
      <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <a href="/news/" style="color: #0099e6; font-weight: 700; text-decoration: none;">← BACK TO ALL NEWS</a>
        <div style="display: flex; gap: 1rem;">
          <button type="button" class="btn-enterprise-secondary" onclick="navigator.clipboard.writeText(window.location.href); alert('Article URL copied to clipboard.');">SHARE LINK</button>
          <a href="/investors/" class="btn-enterprise-primary">INVESTOR RELATIONS →</a>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 11. CAREERS PAGE (/careers/index.html)
// ============================================================================
createRoute('careers/index.html', {
  title: 'Careers & Global Engineering Opportunities',
  description: 'Join Rayan Group. Discover career opportunities in civil engineering, energy EPC, project management, and corporate services across the UAE and India.',
  activePath: '/careers/',
  heroHtml: renderPageHero({
    category: 'PEOPLE & CULTURE',
    title: 'BUILD YOUR FUTURE WITH US',
    description: 'Empowering 10,000+ professionals across world-class engineering, energy, and infrastructure megaprojects with merit-driven leadership and global mobility.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Careers', href: '/careers/' }],
    bgImage: '/assets/images/careers/careers-hero.jpg',
    subnav: [
      { label: 'Overview', href: '/careers/', active: true },
      { label: 'Why Rayan', href: '#why-us', active: false },
      { label: 'Culture & Benefits', href: '#benefits', active: false },
      { label: 'Open Positions', href: '#jobs', active: false }
    ]
  }),
  content: `
  <!-- Why Work With Us Section -->
  <section class="section" style="padding: 6rem 0; background: #07111e;" id="why-us">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; margin-bottom: 6rem;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">OUR HUMAN CAPITAL</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; color: #fff; line-height: 1.2; text-transform: uppercase; margin: 0.5rem 0 1.5rem;">WHERE ENGINEERING AMBITION MEETS LIMITLESS OPPORTUNITY.</h2>
          <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.5rem;">
            At Rayan Group, our greatest competitive asset is our diverse workforce of over 10,000 engineers, project directors, technicians, and craft specialists representing over 25 nationalities.
          </p>
          <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.65;">
            We offer our professionals hands-on exposure to signature infrastructure, state-of-the-art heavy equipment fleets, fast-track career progression, and an uncompromising safety culture certified under ISO 45001.
          </p>
        </div>
        <div>
          <img src="/assets/images/careers/engineering-team.jpg" alt="Rayan Group Engineers" style="width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        </div>
      </div>

      <!-- Benefits Grid -->
      <div id="benefits" style="margin-bottom: 6rem;">
        <div style="text-align: center; max-width: 700px; margin: 0 auto 3.5rem;">
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">EMPLOYEE EXPERIENCE</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">WHY JOIN RAYAN GROUP</h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem;">
            <div style="width: 50px; height: 50px; border-radius: 8px; background: rgba(0,153,230,0.15); display: flex; align-items: center; justify-content: center; color: #0099e6; margin-bottom: 1.5rem;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">Landmark Megaprojects</h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">Work on high-profile regional retail malls, commercial towers, energy infrastructure, and industrial fabrication facilities.</p>
          </div>

          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem;">
            <div style="width: 50px; height: 50px; border-radius: 8px; background: rgba(16,185,129,0.15); display: flex; align-items: center; justify-content: center; color: #10b981; margin-bottom: 1.5rem;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">Global Cross-Hub Mobility</h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">Opportunities to rotate between our headquarters in Abu Dhabi, Dubai operations, and South Asia India manufacturing hub.</p>
          </div>

          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem;">
            <div style="width: 50px; height: 50px; border-radius: 8px; background: rgba(197,160,89,0.15); display: flex; align-items: center; justify-content: center; color: #c5a059; margin-bottom: 1.5rem;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">Continuous Training Academy</h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">Institutional technical certifications, project management professional (PMP) sponsorships, and executive leadership tracks.</p>
          </div>
        </div>
      </div>

      <!-- Live Job Search Interface -->
      <div id="jobs">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 3rem;">
          <div>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">OPEN OPPORTUNITIES</span>
            <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.5rem;">CURRENT CAREER VACANCIES</h2>
          </div>
          <div style="font-size: 0.85rem; color: #94a3b8;">Showing 5 Active Requisitions across UAE &amp; India</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Job 1 -->
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
            <div>
              <span style="font-size: 0.75rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">ENGINEERING &amp; EPC • REF: ENG-2025-09</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.35rem 0 0.5rem;">Senior Civil Project Director</h3>
              <div style="display: flex; gap: 1.5rem; color: #94a3b8; font-size: 0.85rem;">
                <span>📍 Abu Dhabi, UAE</span>
                <span>⏱ Full-time / Permanent</span>
                <span>🎓 12+ Years Experience</span>
              </div>
            </div>
            <button type="button" class="btn-enterprise-primary" onclick="alert('Please email your CV to careers@rayangroup.com quoting REF: ENG-2025-09')">APPLY FOR POSITION →</button>
          </div>

          <!-- Job 2 -->
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
            <div>
              <span style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase;">ENERGY &amp; EPC • REF: EN-2025-04</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.35rem 0 0.5rem;">Principal Energy Pipeline &amp; EPC Lead</h3>
              <div style="display: flex; gap: 1.5rem; color: #94a3b8; font-size: 0.85rem;">
                <span>📍 Abu Dhabi, UAE</span>
                <span>⏱ Full-time / Permanent</span>
                <span>🎓 10+ Years EPC &amp; Energy Experience</span>
              </div>
            </div>
            <button type="button" class="btn-enterprise-primary" onclick="alert('Please email your CV to careers@rayangroup.com quoting REF: EN-2025-04')">APPLY FOR POSITION →</button>
          </div>

          <!-- Job 3 -->
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
            <div>
              <span style="font-size: 0.75rem; font-weight: 700; color: #c5a059; text-transform: uppercase;">HEALTH &amp; SAFETY • REF: HSE-2025-02</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.35rem 0 0.5rem;">Lead Corporate HSE Manager (ISO 45001)</h3>
              <div style="display: flex; gap: 1.5rem; color: #94a3b8; font-size: 0.85rem;">
                <span>📍 Dubai, UAE</span>
                <span>⏱ Full-time / Permanent</span>
                <span>🎓 8+ Years NEBOSH / ISO Auditing</span>
              </div>
            </div>
            <button type="button" class="btn-enterprise-primary" onclick="alert('Please email your CV to careers@rayangroup.com quoting REF: HSE-2025-02')">APPLY FOR POSITION →</button>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 12. MEDIA / GALLERY PAGE (/media/index.html)
// ============================================================================
createRoute('media/index.html', {
  title: 'Media Gallery & Corporate Photography Showcase',
  description: 'Explore high-resolution photography of Rayan Group landmark infrastructure, energy facilities, industrial construction, and executive operations.',
  activePath: '/media/',
  heroHtml: renderPageHero({
    category: 'MEDIA & BRAND ASSETS',
    title: 'CORPORATE PHOTOGRAPHY',
    description: 'Immersive visual documentation of our multinational operations across civil construction, energy EPC, and industrial contracting.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Media Gallery', href: '/media/' }],
    bgImage: '/assets/images/projects/yas-mall.jpg',
    subnav: [
      { label: 'All Photos', href: '/media/', active: true },
      { label: 'Projects', href: '/projects/', active: false },
      { label: 'Newsroom', href: '/news/', active: false }
    ]
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: #07111e;">
    <div class="container">
      <!-- Media Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 2rem;">
        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/waldorf-astoria-renovation-rak.jpg" alt="Waldorf Astoria Luxury Renovation" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">5-STAR HOSPITALITY</span>
            <h3 class="media-card-title" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Waldorf Astoria Hotel Luxury Renovation, RAK</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/palm-jumeirah-rec-estate.jpg" alt="Palm Jumeirah Luxury Estate" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase;">COASTAL RESIDENTIAL</span>
            <h3 class="media-card-title" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Palm Jumeirah Ultra-Luxury Waterfront Estate</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/c2-towers-al-bateen.jpg" alt="C2 Towers Al Bateen" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">HIGH-RISE ENGINEERING</span>
            <h3 class="media-card-title" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">C2 Towers Twin High-Rise Development, Al Bateen</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/edge-group-remaya.jpg" alt="Edge Group REMAYA" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #c5a059; text-transform: uppercase;">DEFENSE &amp; TACTICAL</span>
            <h3 class="media-card-title" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">EDGE Group - REMAYA Tactical Shooting Complex</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/luxury-island-infinity-pool.jpg" alt="Luxury Island Infinity Pool" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">AQUATIC RESORT ENGINEERING</span>
            <h3 class="media-card-title" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Luxury Island 50m Oceanfront Cantilevered Pool</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/roxy-cinema-dubai-hills-mall.jpg" alt="Roxy Cinemas Dubai Hills" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">ACOUSTIC ENGINEERING</span>
            <h3 class="media-card-title" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Roxy Cinemas VIP Auditoriums, Dubai Hills Mall</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/al-wahda-mall.jpg" alt="Al Wahda Mall" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">COMMERCIAL RETAIL</span>
            <h3 class="media-card-title" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Al Wahda Mall Grand Extension, Abu Dhabi</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/business/hero-1-skyline.jpg" alt="Commercial EPC" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase;">CIVIL &amp; INFRASTRUCTURE</span>
            <h3 class="media-card-title" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Turnkey Commercial Towers &amp; Civil EPC</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/business/energy-refinery-complex.jpg" alt="Energy Refinery" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #c5a059; text-transform: uppercase;">ENERGY EPC</span>
            <h3 class="media-card-title" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Hydrocarbon Storage Tank Farm &amp; Pipelines</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/ghantoot-palace.jpg" alt="Ghantoot Palace" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">ROYAL ESTATES</span>
            <h3 class="media-card-title" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Ghantoot Royal Private Estate &amp; Custom Millwork</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/yas-mall.jpg" alt="Yas Mall" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">RETAIL EPC</span>
            <h3 class="media-card-title" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Yas Mall Retail Precinct Engineering, Yas Island</h3>
          </div>
        </div>

        <div class="media-thumb-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
          <div style="height: 260px; overflow: hidden;">
            <img src="/assets/images/projects/al-qua-school-infrastructure.jpg" alt="Al Qua School Infrastructure" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          </div>
          <div style="padding: 1.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase;">CAMPUS CIVIC WORKS</span>
            <h3 class="media-card-title" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">Al Qua School 35,000+ sqm Interlock &amp; Paving</h3>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Lightbox Modal -->
  <div class="lightbox-modal" style="position: fixed; inset: 0; background: rgba(5,11,20,0.95); z-index: 10000; display: none; align-items: center; justify-content: center; padding: 2rem;">
    <button type="button" class="lightbox-close" style="position: absolute; top: 2rem; right: 2rem; background: transparent; border: none; color: #fff; font-size: 2rem; cursor: pointer;">✕</button>
    <div style="max-width: 1100px; max-height: 85vh; text-align: center;">
      <img src="" alt="Enlarged view" class="lightbox-img" style="max-width: 100%; max-height: 75vh; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 30px 60px rgba(0,0,0,0.8);">
      <div class="lightbox-caption-text" style="color: #cbd5e1; font-family: var(--font-heading); font-size: 1.1rem; margin-top: 1.25rem; font-weight: 600;"></div>
    </div>
  </div>
  `
});

// ============================================================================
// 13. CONTACT PAGE (/contact/index.html)
// ============================================================================
createRoute('contact/index.html', {
  title: 'Global Contact Center, Headquarters & Regional Hubs',
  description: 'Connect with Rayan Group executive headquarters in Abu Dhabi, regional office in Dubai, or South Asia manufacturing hub in India.',
  activePath: '/contact/',
  heroHtml: renderPageHero({
    category: 'GLOBAL COMMUNICATIONS',
    title: 'GET IN TOUCH',
    description: 'Our executive corporate team, tender bidding secretariat, and investor relations officers are available across our global offices.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Contact', href: '/contact/' }],
    bgImage: '/assets/images/about/global-presence.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: #07111e;">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4.5rem;" class="intro-grid-responsive">
        <!-- Contact Info Left -->
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">HEADQUARTERS &amp; HUBS</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 2rem;">GLOBAL DIRECTORY</h2>

          <div style="display: flex; flex-direction: column; gap: 2rem;">
            <!-- Abu Dhabi HQ -->
            <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.75rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">GLOBAL HEADQUARTERS</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.5rem;">Abu Dhabi, United Arab Emirates</h3>
              <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 0.75rem;">
                Tower 2, Al Maryah Island Business District, Abu Dhabi, UAE
              </p>
              <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">
                <div>Phone: +971 2 642 8899</div>
                <div>Email: hq@rayangroup.com</div>
              </div>
            </div>

            <!-- Dubai Hub -->
            <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.75rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase;">COMMERCIAL REGIONAL HUB</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.5rem;">Dubai, United Arab Emirates</h3>
              <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 0.75rem;">
                Business Bay Commercial Tower, P.O. Box 48123, Dubai, UAE
              </p>
              <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">
                <div>Phone: +971 4 398 7722</div>
                <div>Email: dubai@rayangroup.com</div>
              </div>
            </div>

            <!-- India Hub -->
            <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.75rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #c5a059; text-transform: uppercase;">SOUTH ASIA INDUSTRIAL HUB</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0.5rem;">Rayan Group India Ltd.</h3>
              <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 0.75rem;">
                Rayan Industrial Engineering Complex, Mumbai / Gujarat Industrial Corridor, India
              </p>
              <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">
                <div>Phone: +91 22 6842 1100</div>
                <div>Email: india@rayangroup.com</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Validated Contact Form Right -->
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">CORPORATE INQUIRY</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin: 0.5rem 0 2rem;">SEND AN OFFICIAL MESSAGE</h2>

          <form data-enterprise-form style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Full Legal Name *</label>
              <input type="text" required placeholder="e.g. Alexander Vance" style="width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 0.85rem 1rem; border-radius: 6px; font-size: 0.95rem;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" class="intro-grid-responsive">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Corporate Email *</label>
                <input type="email" required placeholder="name@company.com" style="width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 0.85rem 1rem; border-radius: 6px; font-size: 0.95rem;">
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Contact Number</label>
                <input type="tel" placeholder="+971 50 000 0000" style="width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 0.85rem 1rem; border-radius: 6px; font-size: 0.95rem;">
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Nature of Inquiry *</label>
              <select required style="width: 100%; background: #07111e; border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 0.85rem 1rem; border-radius: 6px; font-size: 0.95rem;">
                <option value="">Select Category...</option>
                <option value="tender">Commercial Tender / Civil EPC (Rayan Engineering)</option>
                <option value="energy">Energy &amp; Oil/Gas Infrastructure (Rayan Energy)</option>
                <option value="ashaz">Industrial Fabrication &amp; Engineering (Ashaz India)</option>
                <option value="properties">Real Estate Development (Rayan Properties)</option>
                <option value="investors">Investor Relations &amp; Equity Disclosures</option>
                <option value="careers">Careers &amp; Human Capital</option>
                <option value="media">Press &amp; Media Communications</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase;">Message / Scope Details *</label>
              <textarea required rows="4" placeholder="Detail your project requirements, scope of work, or inquiry..." style="width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 0.85rem 1rem; border-radius: 6px; font-size: 0.95rem; resize: vertical;"></textarea>
            </div>

            <button type="submit" class="btn-enterprise-primary" style="padding: 1rem; width: 100%; justify-content: center;">TRANSMIT ENQUIRY →</button>
          </form>
        </div>
      </div>
    </div>
  </section>
  `
});

// ============================================================================
// 14. PRIVACY POLICY (/privacy/index.html)
// ============================================================================
createRoute('privacy/index.html', {
  title: 'Corporate Privacy Policy & Data Protection',
  description: 'Rayan Group corporate privacy policy, personal data protection standards under UAE federal laws, and international disclosure practices.',
  activePath: '/privacy/',
  heroHtml: renderPageHero({
    category: 'LEGAL & COMPLIANCE',
    title: 'PRIVACY POLICY',
    description: 'Our commitment to safeguarding personal data in accordance with UAE Federal Decree-Law No. 45 of 2021 regarding Personal Data Protection.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Privacy Policy', href: '/privacy/' }],
    bgImage: '/assets/images/investors/governance.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: #07111e;">
    <div class="container" style="max-width: 860px; color: #cbd5e1; font-size: 1rem; line-height: 1.8;">
      <p style="margin-bottom: 1.5rem;">
        This Privacy Policy explains how Rayan Group, its subsidiaries, joint ventures, and operating companies collect, process, and safeguard information submitted through our global website and digital portals.
      </p>

      <h3 style="font-family: var(--font-heading); color: #fff; font-size: 1.35rem; margin: 2rem 0 1rem;">1. Information We Collect</h3>
      <p style="margin-bottom: 1.5rem;">
        We collect personal data you provide voluntarily when submitting business tenders, career applications, or investor relations inquiries. This may include your name, corporate email address, contact numbers, and project specifications.
      </p>

      <h3 style="font-family: var(--font-heading); color: #fff; font-size: 1.35rem; margin: 2rem 0 1rem;">2. Purpose of Data Processing</h3>
      <p style="margin-bottom: 1.5rem;">
        Data is processed strictly to respond to procurement inquiries, manage institutional investor communications, evaluate job candidacies, and ensure regulatory compliance with financial exchange authorities.
      </p>

      <h3 style="font-family: var(--font-heading); color: #fff; font-size: 1.35rem; margin: 2rem 0 1rem;">3. Data Security &amp; Retention</h3>
      <p style="margin-bottom: 1.5rem;">
        Rayan Group enforces military-grade transport layer security (TLS 1.3), firewall isolation, and role-based access control to prevent unauthorized access or disclosure of confidential corporate information.
      </p>

      <h3 style="font-family: var(--font-heading); color: #fff; font-size: 1.35rem; margin: 2rem 0 1rem;">4. Contacting Data Protection Officer</h3>
      <p>
        For inquiries regarding our data handling or to request erasure of your details, contact: <strong>dpo@rayangroup.com</strong>.
      </p>
    </div>
  </section>
  `
});

// ============================================================================
// 15. TERMS & CONDITIONS (/terms/index.html)
// ============================================================================
createRoute('terms/index.html', {
  title: 'Terms of Use & Legal Disclaimer',
  description: 'Terms and conditions governing the use of the Rayan Group corporate website and electronic portals.',
  activePath: '/terms/',
  heroHtml: renderPageHero({
    category: 'LEGAL & COMPLIANCE',
    title: 'TERMS OF USE',
    description: 'Terms of access and legal disclaimers governing the use of Rayan Group corporate web assets and financial disclosures.',
    breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Terms of Use', href: '/terms/' }],
    bgImage: '/assets/images/investors/governance.jpg'
  }),
  content: `
  <section class="section" style="padding: 5rem 0; background: #07111e;">
    <div class="container" style="max-width: 860px; color: #cbd5e1; font-size: 1rem; line-height: 1.8;">
      <h3 style="font-family: var(--font-heading); color: #fff; font-size: 1.35rem; margin: 0 0 1rem;">1. Acceptance of Terms</h3>
      <p style="margin-bottom: 1.5rem;">
        By accessing or browsing this website, you agree to be bound by these Terms of Use and all applicable laws and regulations of the United Arab Emirates.
      </p>

      <h3 style="font-family: var(--font-heading); color: #fff; font-size: 1.35rem; margin: 2rem 0 1rem;">2. Intellectual Property Rights</h3>
      <p style="margin-bottom: 1.5rem;">
        All trademarks, logos, engineering drawings, photography, texts, and brand elements displayed on this portal are the proprietary property of Rayan Group and protected by international intellectual property laws.
      </p>

      <h3 style="font-family: var(--font-heading); color: #fff; font-size: 1.35rem; margin: 2rem 0 1rem;">3. Forward-Looking Statements Disclaimer</h3>
      <p style="margin-bottom: 1.5rem;">
        Materials on this portal may contain forward-looking statements regarding revenues, backlogs, and market developments. These statements are subject to operational uncertainties and do not constitute an invitation or offer to invest in securities.
      </p>

      <h3 style="font-family: var(--font-heading); color: #fff; font-size: 1.35rem; margin: 2rem 0 1rem;">4. Governing Law &amp; Jurisdiction</h3>
      <p>
        These terms shall be governed by and construed in accordance with the laws of the Emirate of Abu Dhabi and federal laws of the United Arab Emirates.
      </p>
    </div>
  </section>
  `
});

console.log('All remaining Investor, News, Careers, Media, Contact & Legal pages generated successfully!');

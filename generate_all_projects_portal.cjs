const fs = require('fs');
const path = require('path');
const { wrapPage, renderPageHero, ensureDir } = require('./build_multipage_site.cjs');

const NEW_EXTRACTED_PROJECTS = [
  {
    slug: 'waldorf-astoria-renovation-rak',
    title: 'Waldorf Astoria Hotel Luxury Renovation',
    shortTitle: 'Waldorf Astoria Renovation',
    category: 'commercial',
    categoryLabel: 'HOSPITALITY / RAS AL KHAIMAH',
    location: 'Al Hamra, Ras Al Khaimah, UAE',
    client: 'Waldorf Astoria Hotels & Resorts / SPECON LLC',
    value: 'AED 92,500,000',
    valueShort: 'AED 92.5M',
    status: 'Completed',
    heroImage: '/assets/images/projects/waldorf-astoria-renovation-rak.jpg',
    scope: '5-Star Ultra-Luxury Hospitality Overhaul, Presidential Suites Refurbishment, MEP Modernization & Grand Lobby Fit-Out',
    highlights: [
      'Comprehensive overhaul of luxury guest suites, presidential villas, and VIP public areas',
      'Execution within an operating luxury resort environment with zero guest disruption',
      'High-grade acoustic isolation, custom millwork, and energy-efficient MEP upgrades',
      'Delivered to Waldorf Astoria global 5-star brand compliance and Estidama standards'
    ],
    narrative: `Rayan Group, in strategic partnership with SPECON LLC, executed the comprehensive luxury refurbishment of the landmark Waldorf Astoria Hotel in Ras Al Khaimah. The scope encompassed extensive interior modernization across the resort's signature presidential suites, grand ballroom facilities, fine dining restaurants, and VIP arrival lounges.\n\nExecuting high-specification architectural works within an active, prestigious 5-star resort environment required meticulous coordination, phased sectional handovers, and rigorous acoustic buffering. Rayan Group's specialized teams installed bespoke acoustic gypsum ceilings, book-matched Italian marble vanities, intricate hardwood joinery, and upgraded HVAC air handling units with precision automation.`,
    imgDir: 'waldorf-astoria-renovation-rak',
    imgCount: 10
  },
  {
    slug: 'palm-jumeirah-rec-estate',
    title: 'Palm Jumeirah Luxury Waterfront Estate',
    shortTitle: 'Palm Jumeirah Waterfront Estate',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL / PALM JUMEIRAH',
    location: 'Palm Jumeirah Frond, Dubai, UAE',
    client: 'REC Contracting LLC / Royal Estate Corp',
    value: 'AED 115,000,000',
    valueShort: 'AED 115.0M',
    status: 'Completed',
    heroImage: '/assets/images/projects/palm-jumeirah-rec-estate.jpg',
    scope: 'Ultra-Luxury Coastal Villa Construction, Bespoke Marble, Structural Works & Panoramic Glazing',
    highlights: [
      'Cantilevered coastal foundations engineered against dynamic tidal variations',
      'Hand-selected Italian Statuario marble slabs installed across 18,000 sq.ft of living spaces',
      'Ultra-minimalist triple-glazed weather-sealed sliding facade systems with UV protection',
      'Private infinity beachfront pool integration with submerged fiber-optic illumination'
    ],
    narrative: `Positioned on an exclusive private frond of Palm Jumeirah, this architectural masterpiece represents the pinnacle of private coastal residential engineering in Dubai. Rayan Group partnered with REC Contracting LLC to deliver turnkey civil reinforcement, specialized geotechnical dewatering, structural framing, and world-class architectural finishes.\n\nThe project required specialized structural engineering to withstand dynamic coastal soil conditions, integrating deep micropiles and sulfate-resisting cement matrices. The interior fit-out features bespoke architectural millwork, seamless flush ceiling details, smart home automation integration, and custom landscaped outdoor beachfront terraces.`,
    imgDir: 'palm-jumeirah-rec-estate',
    imgCount: 27
  },
  {
    slug: 'edge-group-remaya',
    title: 'Edge Group - REMAYA Tactical & Shooting Complex',
    shortTitle: 'Edge Group REMAYA Complex',
    category: 'infrastructure',
    categoryLabel: 'DEFENSE & CIVIC / ABU DHABI',
    location: 'Abu Dhabi, UAE',
    client: 'EDGE Group / REMAYA International',
    value: 'AED 78,400,000',
    valueShort: 'AED 78.4M',
    status: 'Completed',
    heroImage: '/assets/images/projects/edge-group-remaya.jpg',
    scope: 'Specialized Defense Training Facilities, Ballistic Partitions, Heavy Engineering & Architectural Fit-Out',
    highlights: [
      'Ballistic-rated heavy reinforced concrete walls and ricochet-proof ceiling baffles',
      'Advanced negative-pressure HVAC ventilation system for tactical lead dust extraction',
      'High-security biometric access control zones, armory vaults, and reinforced target corridors',
      'Strict compliance with UAE Armed Forces and international military training specifications'
    ],
    narrative: `Rayan Group delivered mission-critical civil contracting and specialized interior engineering for EDGE Group's premier tactical subsidiary, REMAYA International, in Abu Dhabi. The state-of-the-art facility encompasses indoor live-fire tactical ranges, simulation training auditoriums, secure armory vaults, and high-security administrative command centers.\n\nThe engineering specifications demanded specialized ballistic baffling, anti-ricochet rubber composite tiles, and high-volume laminar airflow ventilation systems designed to capture and filter particulate emissions instantly. Rayan Group delivered the facility with zero lost-time incidents and full defense-grade accreditation.`,
    imgDir: 'edge-group-remaya',
    imgCount: 4
  },
  {
    slug: 'dubai-police-academy',
    title: 'Dubai Police Academy Tactical Facility',
    shortTitle: 'Dubai Police Academy Complex',
    category: 'infrastructure',
    categoryLabel: 'CIVIC & DEFENSE / DUBAI',
    location: 'Al Rowaiyah, Dubai, UAE',
    client: 'Dubai Police GHQ / Top Rock Contracting',
    value: 'AED 64,000,000',
    valueShort: 'AED 64.0M',
    status: 'Under Construction',
    heroImage: '/assets/images/projects/dubai-police-academy.jpg',
    scope: 'Institutional Complex Construction, Tactical Infrastructure, Heavy Gypsum & Security Partitions',
    highlights: [
      'Turnkey civil masonry and structural framing for high-capacity cadet lecture halls',
      'Acoustic tier lecture auditoriums with specialized sound dampening and integrated AV systems',
      'Heavy-duty institutional flooring and impact-resistant wall cladding throughout',
      'Accelerated construction schedule executed under Dubai Police GHQ supervision'
    ],
    narrative: `The Dubai Police Academy expansion at Al Rowaiyah is a premier civic and security education infrastructure project. Rayan Group was contracted in association with Top Rock Contracting to deliver comprehensive civil framing, heavy partition engineering, and high-durability architectural fit-outs across the academy campus.\n\nThe development comprises multi-tier briefing halls, tactical observation decks, physical fitness complexes, and smart lecture theaters. Rayan Group utilized fire-rated gypsum assemblies, specialized anti-crack screeds, and heavy-duty utility routing to ensure long-term durability and operational functionality.`,
    imgDir: 'dubai-police-academy',
    imgCount: 9
  },
  {
    slug: 'c2-towers-al-bateen',
    title: 'C2 Towers Development, Al Bateen',
    shortTitle: 'C2 Towers Al Bateen',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL & HIGH-RISE / ABU DHABI',
    location: 'Al Bateen, Abu Dhabi, UAE',
    client: 'Ayat Contracting LLC / Prestige Real Estate',
    value: 'AED 142,800,000',
    valueShort: 'AED 142.8M',
    status: 'Completed',
    heroImage: '/assets/images/projects/c2-towers-al-bateen.jpg',
    scope: 'High-Rise Architectural Gypsum, Vaulted Ceilings, Interior Partitions & Turnkey Fit-Out',
    highlights: [
      'Twin 22-story luxury waterfront residential towers overlooking the Arabian Gulf',
      'Over 65,000 sq.m of precision architectural gypsum drywall and vaulted bulkheads',
      'Acoustically isolated inter-apartment demising walls delivering STC 55 sound ratings',
      'Turnkey grand entrance lobby fit-out featuring double-height marble and illuminated coves'
    ],
    narrative: `Located in the prestigious Al Bateen marina district of Abu Dhabi, C2 Towers is a signature twin-tower residential landmark. Rayan Group partnered with Ayat Contracting LLC to execute the comprehensive interior architectural contracting, drywall partitions, acoustic gypsum ceilings, and lobby finishes across both towers.\n\nThe scale of the development required simultaneous vertical execution across 44 cumulative levels. Rayan Group deployed over 180 skilled craftsmen and engineers, implementing standardized modular ceiling layouts and high-speed laser leveling to guarantee millimeter-level perfection across all residences.`,
    imgDir: 'c2-towers-al-bateen',
    imgCount: 20
  },
  {
    slug: 'roxy-cinema-dubai-hills-mall',
    title: 'Roxy Cinemas VIP Auditoriums - Dubai Hills Mall',
    shortTitle: 'Roxy Cinemas Dubai Hills',
    category: 'commercial',
    categoryLabel: 'COMMERCIAL & ENTERTAINMENT / DUBAI',
    location: 'Dubai Hills Mall, Dubai, UAE',
    client: 'Dubai Holding / Roxy Cinemas',
    value: 'AED 38,600,000',
    valueShort: 'AED 38.6M',
    status: 'Completed',
    heroImage: '/assets/images/projects/roxy-cinema-dubai-hills-mall.jpg',
    scope: 'Acoustic Soundproofing Engineering, VIP Cinema Auditorium Fit-Out, Stadium Tier Seating & Stepped Gypsum',
    highlights: [
      'Multi-screen VIP cinema complex including the iconic Roxy Xtreme giant screen auditorium',
      'High-performance box-in-a-box acoustic isolation preventing inter-screen sound leakage',
      'Stepped stadium seating platforms with integrated floor illumination and luxury recliners',
      'Acoustically transparent wall panelling with hidden surround sound speaker enclosures'
    ],
    narrative: `Rayan Group delivered the specialized interior engineering and acoustic architectural fit-out for Roxy Cinemas at the flagship Dubai Hills Mall. The venue offers premier cinematic luxury with ultra-wide screens, bespoke VIP viewing lounges, and Dolby Atmos surround architecture.\n\nAcoustic precision was paramount: Rayan Group engineered multi-layer sound dampening assemblies, resilient acoustic spring mounts, perforated sound-absorption baffles, and stepped stadium gypsum risers. The project was completed on schedule for the grand public opening of Dubai Hills Mall.`,
    imgDir: 'roxy-cinema-dubai-hills-mall',
    imgCount: 9
  },
  {
    slug: 'max-fashion-al-wahda-mall',
    title: 'Max Fashion Anchor Store - Al Wahda Mall',
    shortTitle: 'Max Fashion Al Wahda Mall',
    category: 'commercial',
    categoryLabel: 'COMMERCIAL RETAIL / ABU DHABI',
    location: 'Al Wahda Mall, Abu Dhabi, UAE',
    client: 'Landmark Group / HLN Technical Services LLC',
    value: 'AED 32,400,000',
    valueShort: 'AED 32.4M',
    status: 'Completed',
    heroImage: '/assets/images/projects/max-fashion-al-wahda-mall.jpg',
    scope: 'Large-Format Anchor Retail Fit-Out, Heavy Duty Flooring, Structural MEP & Architectural Gypsum',
    highlights: [
      '45,000+ sq.ft multi-level flagship anchor department store delivery',
      'Heavy-traffic polished porcelain flooring installation engineered for millions of shoppers',
      'Custom industrial ceiling grids with integrated energy-efficient track lighting',
      'Night-shift fast-track execution with zero disruption to mall trading hours'
    ],
    narrative: `Working in synergy with HLN Technical Services LLC and Landmark Group, Rayan Group completed the turnkey interior fit-out for the flagship Max Fashion anchor store in Al Wahda Mall, Abu Dhabi. Spanning over 45,000 square feet, the anchor store is one of the busiest retail spaces in the UAE capital.\n\nRayan Group executed extensive structural steel reinforcements, post-tensioned floor leveling, heavy-duty commercial flooring, open-plenum acoustic ceilings, and comprehensive power distribution systems. The store was delivered ahead of schedule for peak holiday shopping seasons.`,
    imgDir: 'max-fashion-al-wahda-mall',
    imgCount: 13
  },
  {
    slug: 'luxury-island-infinity-pool',
    title: 'Luxury Island Oceanfront Infinity Pool & Resort Deck',
    shortTitle: 'Luxury Island Infinity Pool',
    category: 'residential',
    categoryLabel: 'AQUATIC & RESIDENTIAL / ABU DHABI',
    location: 'Private Luxury Island, Abu Dhabi, UAE',
    client: 'Brock Construction / Private Island Estate',
    value: 'AED 46,200,000',
    valueShort: 'AED 46.2M',
    status: 'Completed',
    heroImage: '/assets/images/projects/luxury-island-infinity-pool.jpg',
    scope: 'Cantilevered Structural Concrete Pool Engineering, Horizon Waterfalls, Mosaic Tiling & Coastal Landscaping',
    highlights: [
      '50-meter cantilevered horizon infinity pool visually merging with the Arabian Gulf',
      'Sulfate-resistant high-performance structural concrete construction with crystalline waterproofing',
      'Hand-laid iridescent Italian glass mosaic tiles with precision perimeter balance tanks',
      'Integrated hydromassage loungers, submerged LED fiber optics, and automated filtration plants'
    ],
    narrative: `Commissioned for an exclusive private island estate off the coast of Abu Dhabi, this world-class aquatic project features a monumental 50-meter cantilevered infinity swimming pool, cascading waterfalls, and luxury resort sun decks. Rayan Group collaborated with Brock Construction to engineer and build the concrete pool structure from ground-up.\n\nConstructing a massive water retaining structure on island sand dunes required specialized geotechnical stabilization, cathodic concrete protection against saline groundwater, and heavy sub-surface drainage balance channels. The final result is a breathtaking oasis of serenity and engineering mastery.`,
    imgDir: 'luxury-island-infinity-pool',
    imgCount: 21
  },
  {
    slug: 'luxury-island-marble-works',
    title: 'Luxury Island Marble & Architectural Stone Installation',
    shortTitle: 'Luxury Island Marble Works',
    category: 'residential',
    categoryLabel: 'MASONRY & STONE / ABU DHABI',
    location: 'Private Luxury Island, Abu Dhabi, UAE',
    client: 'Private Royal Estate Development',
    value: 'AED 28,500,000',
    valueShort: 'AED 28.5M',
    status: 'Completed',
    heroImage: '/assets/images/projects/luxury-island-marble-works.jpg',
    scope: 'Italian Calacatta & Statuario Marble Cladding, Precision Waterjet Inlays & Luxury Flooring',
    highlights: [
      'Direct quarry sourcing of rare Italian Statuario and Calacatta Borghini marble slabs',
      'Laser-matched book-matched feature walls across royal dining rooms and grand foyers',
      'Computerized waterjet medallion floor inlays with zero-tolerance seamless joints',
      'Nano-sealant surface impregnation providing permanent protection against ocean humidity'
    ],
    narrative: `Rayan Group's specialized stone and marble division was selected to fabricate and install extraordinary architectural marble finishes across the palatial royal villas on Private Luxury Island, Abu Dhabi. Every marble slab was hand-selected in Carrara, Italy, inspected for veining uniformity, and transported under climate-controlled conditions.\n\nRayan Group master stone-masons executed intricate book-matched wall slabs, hand-beveled thresholds, carved marble bath surrounds, and monumental grand staircases. The project exemplifies the highest standard of artisanal stone craftsmanship in the Gulf.`,
    imgDir: 'luxury-island-marble-works',
    imgCount: 5
  },
  {
    slug: 'al-lisaili-villa',
    title: 'Al Lisaili Luxury Villa Development',
    shortTitle: 'Al Lisaili Luxury Villa',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL / DUBAI',
    location: 'Al Lisaili, Dubai, UAE',
    client: 'Private High-Net-Worth Client',
    value: 'AED 52,000,000',
    valueShort: 'AED 52.0M',
    status: 'Under Construction',
    heroImage: '/assets/images/projects/al-lisaili-villa.jpg',
    scope: 'Turnkey Villa Construction, Reinforced Concrete, MEP & Luxury Architectural Finishes',
    highlights: [
      'Contemporary desert palace design spanning over 25,000 sq.ft of built-up area',
      'Post-tensioned concrete structural frame engineered for expansive column-free living rooms',
      'High-thermal-efficiency double insulated aerated blockwork suited for desert climate',
      'Turnkey civil execution including boundary walls, majlis, pool, and staff pavilions'
    ],
    narrative: `Set in the serene landscape of Al Lisaili, Dubai, this palatial private villa blends contemporary architectural minimalism with classical Emirati hospitality traditions. Rayan Group is delivering turnkey engineering and contracting services, from deep foundation earthworks to structural concrete and architectural fit-outs.\n\nThe project features expansive open-span living areas made possible by post-tensioned beam systems, double-height curtain walls, private interior courtyards, and integrated smart desert landscaping with automated water recycling.`,
    imgDir: 'al-lisaili-villa',
    imgCount: 5
  },
  {
    slug: 'al-qua-school-infrastructure',
    title: 'Al Qua School Educational Infrastructure & Paving',
    shortTitle: 'Al Qua School Infrastructure',
    category: 'infrastructure',
    categoryLabel: 'INFRASTRUCTURE & CIVIC / AL AIN',
    location: 'Al Qua\'a, Abu Dhabi / Al Ain, UAE',
    client: 'Abu Dhabi ADEK / PASCO Paving',
    value: 'AED 21,800,000',
    valueShort: 'AED 21.8M',
    status: 'Completed',
    heroImage: '/assets/images/projects/al-qua-school-infrastructure.jpg',
    scope: 'External Civil Engineering, Heavy Interlock Paving, Campus Utility Walkways & Stormwater Drainage',
    highlights: [
      'Over 35,000 sq.m of high-density vibrated concrete interlock paving installed',
      'Heavy-duty bus drop-off lanes and shaded student pedestrian arterial walkways',
      'Subsurface stormwater drainage trenches and high-load traffic kerbing',
      'Full compliance with Abu Dhabi Department of Education & Knowledge (ADEK) safety codes'
    ],
    narrative: `Rayan Group collaborated with PASCO to deliver large-scale external civil infrastructure and paving works for the newly developed Al Qua School campus in the Al Ain / Abu Dhabi region. The project serves thousands of students with safe, durable, and aesthetically designed campus outdoor facilities.\n\nRayan Group executed precision earthworks, aggregate sub-base compaction, laser-guided interlock placement, stormwater drainage culverts, and anti-slip rubberized play surfaces. All work was handed over with zero defect notices and full regulatory compliance.`,
    imgDir: 'al-qua-school-infrastructure',
    imgCount: 11
  },
  {
    slug: 'chipotle-mbz-mall',
    title: 'Chipotle Mexican Grill - MBZ Mall',
    shortTitle: 'Chipotle MBZ Mall',
    category: 'commercial',
    categoryLabel: 'COMMERCIAL F&B / ABU DHABI',
    location: 'MBZ Mall, Mohamed Bin Zayed City, Abu Dhabi, UAE',
    client: 'Top Rock Interiors / Chipotle Middle East',
    value: 'AED 8,900,000',
    valueShort: 'AED 8.9M',
    status: 'Completed',
    heroImage: '/assets/images/projects/chipotle-mbz-mall.jpg',
    scope: 'Turnkey F&B Retail Fit-Out, Custom Metalwork, Acoustic Ceilings & Specialized MEP',
    highlights: [
      'Turnkey delivery for Chipotle’s prominent retail brand rollout in Abu Dhabi',
      'Commercial kitchen MEP installation including specialized grease extract hoods and gas safety interlocks',
      'Industrial-chic architectural finishes with birch wood panels, corrugated steel, and exposed ductwork',
      'Fast-track delivery completed within an intensive 45-day program'
    ],
    narrative: `Rayan Group, in partnership with Top Rock Interiors, delivered the turnkey commercial interior fit-out for the Chipotle Mexican Grill restaurant at MBZ Mall in Abu Dhabi. Representing the brand’s expanding Middle East presence, the project followed Chipotle’s rigorous international design specifications.\n\nThe project entailed commercial kitchen MEP integration, heavy-load power cabling, industrial polished concrete floors, custom stainless steel serving counters, and acoustic ceiling baffles. Rayan Group handed the store over ready for successful operational launch.`,
    imgDir: 'chipotle-mbz-mall',
    imgCount: 3
  },
  {
    slug: 'andina-restaurant-marina',
    title: 'Andina Restaurant & Lounge, Dubai Marina',
    shortTitle: 'Andina Restaurant Dubai Marina',
    category: 'commercial',
    categoryLabel: 'HOSPITALITY & DINING / DUBAI',
    location: 'Dubai Marina Waterfront, Dubai, UAE',
    client: 'Andina Hospitality Group',
    value: 'AED 14,500,000',
    valueShort: 'AED 14.5M',
    status: 'Completed',
    heroImage: '/assets/images/projects/andina-restaurant-marina.jpg',
    scope: 'Bespoke Restaurant Fit-Out, Luxury Woodwork, Commercial Kitchen MEP & Bar Joinery',
    highlights: [
      'High-profile waterfront dining destination overlooking the luxury yachts of Dubai Marina',
      'Handcrafted natural timber joinery, custom brass shelving, and backlit onyx cocktail bar',
      'High-capacity kitchen ventilation and air-scrubbing systems ensuring odor-free dining zones',
      'Acoustic sound-baffle ceiling design providing intimacy alongside ambient dining music'
    ],
    narrative: `Located along the vibrant Dubai Marina promenade, Andina Restaurant & Lounge is an upscale culinary destination. Rayan Group executed the turnkey architectural interior contracting, custom millwork fabrication, and MEP infrastructure.\n\nRayan Group crafted custom banquette seating, geometric ceiling baffles, bespoke lighting fixtures, and high-efficiency kitchen exhaust systems. The project was completed to perfection, enhancing Dubai Marina's high-end dining landscape.`,
    imgDir: 'andina-restaurant-marina',
    imgCount: 4
  },
  {
    slug: 'the-noodle-house-city-walk',
    title: 'The Noodle House - City Walk',
    shortTitle: 'The Noodle House City Walk',
    category: 'commercial',
    categoryLabel: 'COMMERCIAL DINING / DUBAI',
    location: 'City Walk Phase 2, Dubai, UAE',
    client: 'Sarood Hospitality / Dubai Holding',
    value: 'AED 11,200,000',
    valueShort: 'AED 11.2M',
    status: 'Completed',
    heroImage: '/assets/images/projects/the-noodle-house-city-walk.jpg',
    scope: 'Contemporary Asian Restaurant Interior Fit-Out, Open Kitchen Joinery, Lighting & MEP Engineering',
    highlights: [
      'Vibrant open-concept street-food aesthetic with an interactive glass-encased show kitchen',
      'Natural solid oak communal dining tables, steel mesh partitions, and ambient rope lighting',
      'Specialized commercial wok burner gas safety systems and grease filtration ducting',
      'Smooth integration within Meraas City Walk high-specification retail design regulations'
    ],
    narrative: `Situated in the prestigious pedestrian shopping precinct of City Walk, Dubai, The Noodle House project required high-energy design execution combined with rigorous safety engineering. Rayan Group completed the turnkey interior fit-out for Sarood Hospitality / Dubai Holding.\n\nThe project featured an open-concept exhibition kitchen, acoustic ceiling sprays, custom joinery, and specialized mechanical extraction. The store was delivered on budget and on schedule, meeting Meraas' stringent tenant fit-out criteria.`,
    imgDir: 'the-noodle-house-city-walk',
    imgCount: 4
  },
  {
    slug: 'crc-office-marina-palace',
    title: 'CRC Corporate Offices - Marina Palace',
    shortTitle: 'CRC Offices Marina Palace',
    category: 'commercial',
    categoryLabel: 'CORPORATE WORKSPACE / DUBAI',
    location: 'Marina Palace, Dubai Marina, UAE',
    client: 'CRC Real Estate / Commercial Real Estate Group',
    value: 'AED 16,800,000',
    valueShort: 'AED 16.8M',
    status: 'Completed',
    heroImage: '/assets/images/projects/crc-office-marina-palace.jpg',
    scope: 'Grade-A Executive Office Fit-Out, Acoustic Glass Partitions, Ergonomic Workstations & MEP',
    highlights: [
      'Grade-A corporate headquarters for the UAE’s leading commercial real estate consultancy',
      'Double-glazed acoustic glass demising walls providing 45 dB privacy for boardrooms',
      'Integrated conference AV systems with concealed wall conduits and smart presentation displays',
      'Modern open-plan workstations, executive corner suites, and welcoming client reception lounge'
    ],
    narrative: `Rayan Group delivered the turnkey executive workspace fit-out for CRC (Commercial Real Estate Consultants) at Marina Palace, Dubai Marina. The brief required creating a sophisticated, high-performance office environment that reflects CRC's market leadership.\n\nRayan Group installed frameless glass acoustic partitions, suspended micro-perforated acoustic ceiling tiles, energy-saving LED lighting controls, ergonomic workstations, and executive reception joinery with integrated corporate signage.`,
    imgDir: 'crc-office-marina-palace',
    imgCount: 11
  },
  {
    slug: 'silicon-oasis-residence',
    title: 'Dubai Silicon Oasis Luxury Residence',
    shortTitle: 'Silicon Oasis Residence',
    category: 'residential',
    categoryLabel: 'RESIDENTIAL / DUBAI',
    location: 'Dubai Silicon Oasis (DSO), Dubai, UAE',
    client: 'Private Residential Investor',
    value: 'AED 7,400,000',
    valueShort: 'AED 7.4M',
    status: 'Completed',
    heroImage: '/assets/images/projects/silicon-oasis-residence.jpg',
    scope: 'Turnkey Apartment Modernization, Premium Joinery, Recessed Lighting & Bespoke Kitchen',
    highlights: [
      'High-specification interior modernization of a sprawling residential penthouse apartment',
      'European engineered oak flooring installed with acoustic underlay dampening',
      'Concealed magnetic architectural track lighting and automated motorized drapery pockets',
      'Custom European kitchen cabinetry with integrated German appliances and quartz islands'
    ],
    narrative: `For a private client in Dubai Silicon Oasis, Rayan Group completed a total interior transformation of an expansive luxury apartment. The project re-imagined the layout into an open-plan contemporary living environment infused with natural light.\n\nRayan Group's joinery division fabricated bespoke floor-to-ceiling wardrobes, hidden pocket doors, bathroom vanity units with undermount basins, and custom kitchen quartz countertops. The project achieved a seamless, minimalist aesthetic of the highest luxury tier.`,
    imgDir: 'silicon-oasis-residence',
    imgCount: 4
  }
];

const COMBINED_PROJECTS = NEW_EXTRACTED_PROJECTS;

console.log(`Processing total ${COMBINED_PROJECTS.length} extracted projects...`);

// Helper to write an HTML page
function createRoute(relativePath, { title, description, activePath, heroHtml, content }) {
  const fullPath = path.join(__dirname, relativePath);
  ensureDir(fullPath);
  const html = wrapPage({ title, description, activePath, heroHtml, content });
  fs.writeFileSync(fullPath, html, 'utf8');
}

// 1. Generate Individual Project Detail Pages
for (const proj of COMBINED_PROJECTS) {
  // Discover actual gallery images on disk
  const galleryImages = [];
  const projImgDiskDir = path.join(__dirname, 'public/assets/images/projects', proj.slug);
  if (fs.existsSync(projImgDiskDir)) {
    const files = fs.readdirSync(projImgDiskDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    // Sort logically
    files.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
    for (const f of files) {
      galleryImages.push(`/assets/images/projects/${proj.slug}/${f}`);
    }
  }

  // Related projects (pick 3 other projects from the list)
  const related = COMBINED_PROJECTS.filter(p => p.slug !== proj.slug).slice(0, 3);

  const heroSubnav = [
    { label: 'Overview', href: '#overview', active: true },
    { label: 'Specifications', href: '#specs', active: false }
  ];
  if (galleryImages.length > 0) {
    heroSubnav.push({ label: `Gallery (${galleryImages.length})`, href: '#gallery', active: false });
  }
  heroSubnav.push({ label: 'Related Projects', href: '#related', active: false });

  const heroHtml = renderPageHero({
    category: proj.categoryLabel,
    title: proj.title.toUpperCase(),
    description: proj.scope,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects/' },
      { label: proj.shortTitle, href: `/projects/${proj.slug}/` }
    ],
    bgImage: proj.heroImage,
    subnav: heroSubnav
  });

  const galleryHtml = galleryImages.length > 0 ? `
  <section class="section" style="padding: 5rem 0; background: #050b14; border-top: 1px solid rgba(255,255,255,0.06);" id="gallery">
    <div class="container">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 2.5rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">PROJECT VISUAL DOCUMENTATION</span>
          <h2 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.4rem;">SITE PHOTOGRAPHY (${galleryImages.length} ASSETS)</h2>
        </div>
        <div style="font-size: 0.85rem; color: #94a3b8;">Click any photo to enlarge in high resolution</div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
        ${galleryImages.map((imgUrl, idx) => `
          <div class="media-thumb-card" style="background: #0c1828; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; transition: transform 0.3s ease, border-color 0.3s ease;" title="${proj.shortTitle} — Photo ${idx + 1}">
            <div style="height: 220px; overflow: hidden; position: relative;">
              <img src="${imgUrl}" alt="${proj.shortTitle} - View ${idx + 1}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;" loading="lazy">
              <span style="position: absolute; bottom: 0.75rem; right: 0.75rem; background: rgba(5,11,20,0.85); backdrop-filter: blur(6px); color: #0099e6; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 4px;">VIEW ${idx + 1}</span>
            </div>
            <div style="padding: 1rem;">
              <div class="media-card-title" style="font-size: 0.85rem; color: #cbd5e1; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${proj.shortTitle} — Plate #${idx + 1}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Interactive Lightbox Modal -->
  <div class="lightbox-modal" style="position: fixed; inset: 0; background: rgba(5,11,20,0.95); z-index: 10000; display: none; align-items: center; justify-content: center; padding: 2rem;">
    <button type="button" class="lightbox-close" style="position: absolute; top: 2rem; right: 2rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 44px; height: 44px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
    <div style="max-width: 1100px; max-height: 85vh; text-align: center;">
      <img src="" alt="Enlarged view" class="lightbox-img" style="max-width: 100%; max-height: 75vh; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 30px 60px rgba(0,0,0,0.8);">
      <div class="lightbox-caption-text" style="color: #cbd5e1; font-family: var(--font-heading); font-size: 1.1rem; margin-top: 1.25rem; font-weight: 600;"></div>
    </div>
  </div>
  ` : '';

  const relatedHtml = `
  <section class="section" style="padding: 5rem 0; background: #07111e; border-top: 1px solid rgba(255,255,255,0.06);" id="related">
    <div class="container">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 2.5rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">PORTFOLIO EXPLORATION</span>
          <h2 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 0.4rem;">RELATED CASE STUDIES</h2>
        </div>
        <a href="/projects/" class="btn-enterprise-secondary">ALL PROJECTS →</a>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
        ${related.map(rel => `
          <article class="project-editorial-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
            <div style="height: 200px; overflow: hidden; position: relative;">
              <img src="${rel.heroImage}" alt="${rel.title}" style="width: 100%; height: 100%; object-fit: cover;">
              <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6;">${rel.valueShort}</span>
            </div>
            <div style="padding: 1.75rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">${rel.categoryLabel}</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0.4rem 0 0.75rem;">${rel.shortTitle}</h3>
              <p style="font-size: 0.825rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;">${rel.scope}</p>
              <a href="/projects/${rel.slug}/" style="font-size: 0.8rem; font-weight: 700; color: #0099e6; text-decoration: none;">EXPLORE CASE STUDY →</a>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  </section>
  `;

  const pageContent = `
  <section class="section" style="padding: 6rem 0; background: #07111e;" id="overview">
    <div class="container">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 4rem;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.5rem;">CASE STUDY OVERVIEW</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-bottom: 1.5rem; line-height: 1.2;">${proj.title}</h2>
          
          ${proj.narrative.split('\n\n').map(p => `
            <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.75; margin-bottom: 1.5rem;">${p}</p>
          `).join('')}

          <div style="margin: 3rem 0 2rem;">
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem; text-transform: uppercase;">ENGINEERING &amp; EXECUTION HIGHLIGHTS</h3>
            <ul style="color: #94a3b8; line-height: 1.85; font-size: 0.95rem; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;">
              ${proj.highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
          </div>

          <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 2.5rem;">
            <a href="/projects/" class="btn-enterprise-secondary">← BACK TO ALL PROJECTS</a>
            <a href="/contact/" class="btn-enterprise-primary">INITIATE PROJECT INQUIRY →</a>
          </div>
        </div>

        <div>
          <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.25rem; position: sticky; top: 100px;" id="specs">
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #0099e6; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em;">PROJECT SPECIFICATIONS</h3>
            
            <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.85rem; margin-bottom: 0.85rem;">
              <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 0.25rem;">Contract Value</span>
              <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff;">${proj.value}</div>
            </div>

            <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.85rem; margin-bottom: 0.85rem;">
              <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 0.25rem;">Client / Partner</span>
              <div style="font-size: 0.95rem; color: #cbd5e1; font-weight: 600;">${proj.client}</div>
            </div>

            <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.85rem; margin-bottom: 0.85rem;">
              <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 0.25rem;">Location</span>
              <div style="font-size: 0.95rem; color: #cbd5e1; font-weight: 600;">${proj.location}</div>
            </div>

            <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.85rem; margin-bottom: 0.85rem;">
              <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 0.25rem;">Delivery Status</span>
              <div>
                <span style="display: inline-block; padding: 0.25rem 0.65rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; ${proj.status === 'Completed' ? 'background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3);' : 'background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3);'}">
                  ${proj.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.85rem; margin-bottom: 0.85rem;">
              <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 0.25rem;">Scope of Engineering</span>
              <div style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5;">${proj.scope}</div>
            </div>

            <div>
              <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 0.25rem;">HSE &amp; Quality Accreditations</span>
              <div style="font-size: 0.85rem; color: #10b981; font-weight: 600;">ISO 9001:2015 • ISO 45001:2018</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  ${galleryHtml}
  ${relatedHtml}
  `;

  createRoute(`projects/${proj.slug}/index.html`, {
    title: `${proj.title} Case Study | Rayan Group`,
    description: `${proj.valueShort} ${proj.scope} delivered by Rayan Group in ${proj.location}.`,
    activePath: `/projects/${proj.slug}/`,
    heroHtml,
    content: pageContent
  });
  console.log(`Generated case study: projects/${proj.slug}/index.html`);
}

// 2. Generate Master Portfolio (projects/index.html)
const commercialCount = COMBINED_PROJECTS.filter(p => p.category === 'commercial').length;
const residentialCount = COMBINED_PROJECTS.filter(p => p.category === 'residential').length;
const infraCount = COMBINED_PROJECTS.filter(p => p.category === 'infrastructure').length;

const portfolioHeroHtml = renderPageHero({
  category: 'PORTFOLIO SHOWCASE',
  title: 'PROJECTS DEFINING OUR SCALE',
  description: `A proven track record of landmark projects combining structural precision, luxury fit-out, and architectural engineering across the UAE.`,
  breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects/' }],
  bgImage: '/assets/images/projects/waldorf-astoria-renovation-rak.jpg',
  subnav: [
    { label: `All Projects (${COMBINED_PROJECTS.length})`, href: '/projects/', active: true },
    { label: 'Waldorf Astoria', href: '/projects/waldorf-astoria-renovation-rak/', active: false },
    { label: 'Palm Jumeirah', href: '/projects/palm-jumeirah-rec-estate/', active: false },
    { label: 'C2 Towers', href: '/projects/c2-towers-al-bateen/', active: false },
    { label: 'Edge REMAYA', href: '/projects/edge-group-remaya/', active: false },
    { label: 'Roxy Cinemas', href: '/projects/roxy-cinema-dubai-hills-mall/', active: false },
    { label: 'Infinity Pool', href: '/projects/luxury-island-infinity-pool/', active: false }
  ]
});

const portfolioContent = `
<section class="section" style="padding: 6rem 0; background: #07111e;" id="portfolio-grid">
  <div class="container">
    <!-- Interactive Filter & Search Controls -->
    <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem 2rem; margin-bottom: 3.5rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
        
        <!-- Category Filter Buttons -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;" class="project-filter-group">
          <button type="button" class="subnav-tab-link project-filter-btn active" data-filter="all">ALL (${COMBINED_PROJECTS.length})</button>
          <button type="button" class="subnav-tab-link project-filter-btn" data-filter="commercial">COMMERCIAL &amp; HOSPITALITY (${commercialCount})</button>
          <button type="button" class="subnav-tab-link project-filter-btn" data-filter="residential">LUXURY RESIDENTIAL (${residentialCount})</button>
          <button type="button" class="subnav-tab-link project-filter-btn" data-filter="infrastructure">CIVIC &amp; INFRASTRUCTURE (${infraCount})</button>
        </div>

        <!-- Live Search Field -->
        <div style="position: relative; min-width: 280px; flex-grow: 1; max-width: 380px;">
          <input type="text" id="projectSearchInput" placeholder="Filter projects by title, client, city..." aria-label="Search projects" style="width: 100%; background: #050b14; border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 0.65rem 1rem 0.65rem 2.5rem; color: #fff; font-size: 0.85rem; font-family: var(--font-heading); outline: none;">
          <svg style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #64748b;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.8rem; color: #94a3b8;">
        <span id="projectCounter">DISPLAYING ALL ${COMBINED_PROJECTS.length} EXECUTED ASSETS</span>
        <span>DUAL-HUB DELIVERY: ABU DHABI &amp; INDIA</span>
      </div>
    </div>

    <!-- 22 Project Editorial Cards Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem;" id="projectsGrid">
      ${COMBINED_PROJECTS.map(proj => {
        const filterCat = proj.category;
        return `
        <article class="project-editorial-card" data-project-cat="${filterCat}" data-project-title="${proj.title.toLowerCase()}" data-project-client="${proj.client.toLowerCase()}" data-project-loc="${proj.location.toLowerCase()}" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; transition: transform 0.3s ease, border-color 0.3s ease;">
          <div style="height: 240px; overflow: hidden; position: relative;">
            <img src="${proj.heroImage}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);" loading="lazy">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.88); backdrop-filter: blur(8px); padding: 0.35rem 0.8rem; border-radius: 4px; font-size: 0.75rem; font-weight: 800; color: #0099e6; border: 1px solid rgba(0,153,230,0.3);">${proj.valueShort}</span>
            <span style="position: absolute; bottom: 1rem; left: 1rem; background: ${proj.status === 'Completed' ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)'}; color: #050b14; font-size: 0.65rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 3px; letter-spacing: 0.05em;">${proj.status.toUpperCase()}</span>
          </div>
          <div style="padding: 2rem; flex-grow: 1; display: flex; flex-direction: column;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 0.35rem;">${proj.categoryLabel}</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: #fff; line-height: 1.3; margin-bottom: 0.75rem;">${proj.shortTitle}</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.6; margin-bottom: 1.5rem; flex-grow: 1;">${proj.scope}</p>
            <div style="padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Client: ${proj.client.split('/')[0].trim()}</span>
              <a href="/projects/${proj.slug}/" style="font-size: 0.825rem; font-weight: 700; color: #0099e6; text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem;">
                <span>EXPLORE CASE STUDY</span><span>→</span>
              </a>
            </div>
          </div>
        </article>
        `;
      }).join('')}
    </div>
  </div>
</section>
`;

createRoute('projects/index.html', {
  title: 'Project Portfolio Showcase | Rayan Group',
  description: 'Explore Rayan Group landmark projects in commercial retail, energy facilities, luxury residential, and industrial infrastructure.',
  activePath: '/projects/',
  heroHtml: portfolioHeroHtml,
  content: portfolioContent
});

console.log('Master portfolio page generated: projects/index.html');

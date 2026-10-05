// Rayan Engineering & Contracting L.L.C - S.P.C
// Official Data Source: Company Profile 2025 (Abu Dhabi, UAE & India)

export const COMPANY_INFO = {
  name: "Rayan Engineering & Contracting L.L.C - S.P.C",
  shortName: "Rayan Engineering",
  legalForm: "L.L.C - S.P.C",
  website: "www.rayan-group.com",
  established: 2021,
  tagline: "Building with Precision. Engineering with Purpose.",
  description: "Welcome to Rayan Engineering, a leading provider of comprehensive building projects, civil engineering, construction, and building maintenance engineering services. We are dedicated to delivering innovative, reliable, and sustainable solutions to meet the complex needs of our clients across the UAE and India.",
  stats: [
    { value: 50, suffix: "+", label: "Qualified Engineers", description: "Specialists handling concept, design, execution & commissioning" },
    { value: 500, suffix: "+", label: "Projects Delivered", description: "Across commercial, residential, retail, and industrial sectors" },
    { value: 2021, suffix: "", label: "Established", description: "Setting benchmarks in precision and engineering excellence" },
    { value: 2, suffix: " Hubs", label: "UAE & India Operations", description: "Strategic regional presence in Abu Dhabi, Dubai, Al Ain & India" }
  ],
  contacts: {
    uae: {
      title: "UAE Corporate Headquarters",
      address: "Office No. 09, Plot No. 42, Mussafah M-36, Industrial Area, Abu Dhabi, U.A.E.",
      landline: "+971-25654497",
      email: "info@rayan-group.com",
      emirates: ["Abu Dhabi", "Dubai", "Sharjah", "Al Ain"],
      timezone: "Asia/Dubai",
      timeLabel: "GST (UTC+4)",
      coordinates: "24.3498° N, 54.5085° E"
    },
    india: {
      title: "India Regional Office",
      address: "Akbar Nagar, Mansatolla, Town-2, Bettiah, West Champaran, Bihar, India - 845438",
      email: "ashaz@rayan-group.com",
      timezone: "Asia/Kolkata",
      timeLabel: "IST (UTC+5:30)",
      coordinates: "26.8028° N, 84.5028° E"
    }
  },
  vision: "To be a leading engineering and construction company recognized for delivering innovative, sustainable, and high-quality solutions that shape a better built environment.",
  mission: "To provide reliable engineering, construction, and maintenance services with an unwavering focus on quality, safety, and client satisfaction, while fostering technological innovation and enduring partnerships."
};

export const LEADERSHIP_TEAM = [
  {
    name: "Arshad Alam Shaikh",
    role: "Founder / Chairman",
    image: "/assets/team/arshad-alam-shaikh.jpg",
    bio: "Pioneering the strategic vision and engineering standards of Rayan Engineering across the GCC and South Asia.",
    initials: "AS"
  },
  {
    name: "Eng. Bakhteyar Alam",
    role: "Chief Operating Officer (COO)",
    image: "/assets/team/eng-bakhteyar-alam.jpg",
    bio: "Directing multi-disciplinary engineering operations, rigorous safety compliance, and seamless on-site project execution.",
    initials: "BA"
  },
  {
    name: "Eng. Nadeem Akhtar",
    role: "Chief Financial Officer (CFO)",
    image: "/assets/team/eng-nadeem-akhtar.jpg",
    bio: "Managing institutional fiscal governance, capital efficiency, commercial risk, and sustainable international expansion.",
    initials: "NA"
  }
];

export const SERVICES = [
  {
    id: "01",
    slug: "building-construction",
    title: "Building Construction",
    subtitle: "Turnkey Commercial & Residential Construction",
    description: "End-to-end construction of residential, commercial, and industrial facilities. Our experienced management oversees every phase from foundation laying and structural engineering to architectural fit-outs, ensuring structural integrity, strict schedule adherence, and superior craftsmanship.",
    image: "/assets/services/01-building-construction.jpg",
    features: ["Turnkey Project Execution", "Commercial & Residential High-Rises", "Industrial Warehouse Construction", "Structural Foundation & Frameworks", "Rigorous Quality Assurance"]
  },
  {
    id: "02",
    slug: "building-maintenance",
    title: "Building Maintenance",
    subtitle: "Preventive & Corrective Facility Upkeep",
    description: "Ongoing professional inspection, preventive upkeep, and structural repair to preserve facility value, safety, and operational continuity. We specialize in preserving asset longevity across residential compounds, high-traffic commercial centers, and corporate headquarters.",
    image: "/assets/services/02-building-maintenance.jpg",
    features: ["24/7 Facility Support", "Preventive Maintenance Contracts", "Structural Health Audits", "Façade & Waterproofing Repairs", "Asset Life-Cycle Optimization"]
  },
  {
    id: "03",
    slug: "civil-engineering-works",
    title: "Civil Engineering Works",
    subtitle: "Structural Design & Infrastructure Development",
    description: "Comprehensive civil engineering solutions including structural design, site development, earthworks, heavy concrete foundations, and critical urban infrastructure. Delivered with advanced engineering simulation and stringent site safety protocols.",
    image: "/assets/services/03-civil-engineering.jpg",
    features: ["Structural Analysis & Design", "Substructure & Piling Works", "Roads & Site Grading", "Retaining Structures", "Civil Infrastructure Utilities"]
  },
  {
    id: "04",
    slug: "renovation-remodeling",
    title: "Renovation & Remodeling",
    subtitle: "Architectural Modernization & Spatial Upgrades",
    description: "Upgrading existing structures into modern, efficient, and visually stunning spaces. From complete commercial space reconfigurations to high-end residential modernization, we breathe new life into existing architectural envelopes.",
    image: "/assets/services/04-renovation-remodeling.jpg",
    features: ["Commercial Fitout Reconfigurations", "Historical & Modern Facade Upgrades", "Spatial Layout Optimization", "Gypsum, Flooring & Partitioning", "Minimal Business Downtime"]
  },
  {
    id: "05",
    slug: "mep-services",
    title: "MEP Services",
    subtitle: "Mechanical, Electrical & Plumbing Integration",
    description: "Full-lifecycle Mechanical, Electrical, and Plumbing engineering. We design, install, test, and commission integrated MEP systems built to international engineering standards, enhancing energy efficiency and building lifecycle performance.",
    image: "/assets/services/05-mep-services.jpg",
    features: ["Integrated MEP Design & CAD", "High-Efficiency HVAC Ducts & Piping", "Power Distribution & Panels", "Sanitary & Drainage Networks", "Testing & Commissioning"]
  },
  {
    id: "06",
    slug: "project-management",
    title: "Project Management",
    subtitle: "Precision Governance From Concept to Handover",
    description: "Complete oversight and engineering coordination from initial feasibility and planning through procurement, construction supervision, and handover. We employ modern CPM scheduling to ensure zero budget drift and strictly timed handovers.",
    image: "/assets/services/06-project-management.jpg",
    features: ["CPM & Gantt Schedule Governance", "Cost Engineering & Value Engineering", "Contractor & Vendor Coordination", "Site Inspection & Quality Verification", "Turnkey Handover & As-Built Documentation"]
  },
  {
    id: "07",
    slug: "safety-compliance",
    title: "Safety & Compliance",
    subtitle: "Zero-Harm Health, Safety & Environmental Systems",
    description: "Rigorous implementation of HSE management systems adhering strictly to UAE statutory codes, OSHA regulations, and ISO 45001 / ISO 14001 international standards. We cultivate an uncompromised zero-harm culture on every job site.",
    image: "/assets/services/07-safety-compliance.jpg",
    features: ["ISO 45001 & ISO 14001 Protocols", "Site Hazard Identification & Risk Assessment", "Third-Party Safety Audits", "Fire & Life-Safety Compliance", "Continuous Workforce HSE Training"]
  },
  {
    id: "08",
    slug: "hvac-air-conditioning",
    title: "HVAC / Air Conditioning",
    subtitle: "Climate Control & Ventilation Engineering",
    description: "Specialized design, installation, maintenance, and contractual agreements for centralized chilled water systems, VRV/VRF systems, industrial ventilation, and precision cooling units engineered for extreme Gulf climatic conditions.",
    image: "/assets/services/08-hvac-air-conditioning.jpg",
    features: ["Chilled Water & VRF Systems", "Ductwork Fabrication & Air Balancing", "Indoor Air Quality & Ventilation", "Compressor & Chiller Overhauls", "Emergency Cooling Maintenance"]
  },
  {
    id: "09",
    slug: "mechanical-contracting",
    title: "Mechanical Contracting",
    subtitle: "Industrial Mechanical Systems & Heavy Installation",
    description: "Turnkey mechanical contracting encompassing heavy machinery installation, industrial piping networks, high-pressure pumps, fire fighting infrastructure, and mechanical utility distribution for commercial and industrial facilities.",
    image: "/assets/services/09-mechanical-contracting.jpg",
    features: ["Industrial Piping & Welded Manifolds", "Heavy Equipment Rigging & Alignment", "Fire Protection Sprinkler Systems", "Hydraulic & Pneumatic Networks", "Pump Stations & Chiller Plants"]
  },
  {
    id: "10",
    slug: "mechanical-engineering-consultancy",
    title: "Mechanical Engineering Consultancy",
    subtitle: "Specialized Technical Advisory & Optimization",
    description: "Expert consultancy and engineering analysis for complex mechanical systems. Our senior engineers deliver tailored design reviews, energy audits, thermal dynamic simulations, and system optimization across multiple industries.",
    image: "/assets/services/10-mechanical-consultancy.jpg",
    features: ["System Design Review & Optimization", "Thermal & Fluid Dynamics Modeling", "Energy Audit & Carbon Reduction", "Technical Feasibility Studies", "Peer Review & Value Engineering"]
  },
  {
    id: "11",
    slug: "electrical-works",
    title: "Electrical Works",
    subtitle: "High, Medium & Low Voltage Electrical Engineering",
    description: "High-standard electrical solutions for residential, commercial, and industrial facilities. Our certified electricians execute medium/low voltage distribution, transformer substations, switchgear panels, architectural lighting, and fiber optic cabling.",
    image: "/assets/services/11-electrical-works.jpg",
    features: ["MDB/SMDB/DB Distribution Panels", "Architectural & Industrial LED Lighting", "Backup Generators & UPS Systems", "Fiber Optic & Structured Cabling", "Earthing & Lightning Protection"]
  },
  {
    id: "12",
    slug: "oil-and-gas-services",
    title: "Oil & Gas Services",
    subtitle: "Onshore & Offshore Facilities Support",
    description: "Comprehensive engineering, maintenance, and operational contracting for onshore and offshore oil and gas fields, processing plants, pipelines, and terminal storage. Focused on stringent safety, technical precision, and environmental protection.",
    image: "/assets/services/12-oil-and-gas.jpg",
    features: ["Onshore & Offshore Field Maintenance", "Process Piping & Structural Fabrication", "Valve Maintenance & Hydro-Testing", "Plant Shutdown & Turnaround Support", "Stringent HSE Standards Compliance"]
  },
  {
    id: "13",
    slug: "interior-design-decor",
    title: "Interior Design & Décor",
    subtitle: "Luxury Fit-Out & Bespoke Spatial Architecture",
    description: "Transforming interior volumes into captivating, functional environments. From corporate boardrooms and luxury retail boutiques to residential palaces, we harmonize bespoke material finishes, acoustic ceilings, and custom joinery.",
    image: "/assets/services/13-interior-design.jpg",
    features: ["Space Planning & 3D Visualization", "Custom Gypsum & Acoustic Ceilings", "Architectural Joinery & Millwork", "Luxury Marble & Porcelain Flooring", "Bespoke Lighting Design"]
  },
  {
    id: "14",
    slug: "car-parking-shades",
    title: "Car Parking Shades",
    subtitle: "Architectural Tensile Membrane & Steel Structures",
    description: "Design, structural engineering, fabrication, and installation of durable car parking shade structures across Dubai, Abu Dhabi, Sharjah, and all Emirates. Engineered using advanced tensile fabric patterning and steel finite element analysis to withstand harsh desert heat.",
    image: "/assets/services/14-car-parking-shades.jpg",
    features: ["Tensile Fabric & PTFE/PVDF Shades", "Cantilever & Arch Structural Steel Designs", "UV Blockage & Extreme Heat Mitigation", "Foundation Design & Wind Load Compliance", "Turnkey Fabrication & Installation"]
  }
];

export const PROJECTS = [
  {
    id: "prj-1",
    name: "Porsche Service Center",
    location: "Abu Dhabi, UAE",
    client: "Ali & Sons Motors",
    mainContractor: "Ali & Sons Motors",
    category: "Commercial & Automotive",
    scope: "Rectification Work for Rain Water Damage & Waterproofing Restoration",
    contractValue: "AED 1,622.00",
    image: "/assets/projects/porsche-service-center.jpg",
    year: "2023 - 2024",
    description: "High-precision rehabilitation and waterproof drainage rectification for the premier Porsche Service Center facility in Abu Dhabi, safeguarding luxury automotive service bays against stormwater ingress.",
    tags: ["Rectification", "Waterproofing", "Automotive", "Abu Dhabi"]
  },
  {
    id: "prj-2",
    name: "Ghantoot Palace",
    location: "Abu Dhabi, UAE",
    client: "HM Villa",
    mainContractor: "Al Muluki Décor & General Maintenance",
    category: "Palaces & Luxury Residential",
    scope: "Multi-Phase Ornamental Gypsum Artistry & Architectural Ceilings",
    contractValue: "AED 41,000.00 (Phased Contracts)",
    image: "/assets/projects/ghantoot-palace.jpg",
    year: "2023",
    description: "Bespoke ornamental gypsum fabrication, vaulted ceiling details, and refined interior decorative architectural work delivered for the prestigious royal private residence in Ghantoot.",
    tags: ["Palace", "Gypsum Architecture", "Luxury Decor", "Abu Dhabi"]
  },
  {
    id: "prj-3",
    name: "Al Wahda Mall",
    location: "Abu Dhabi, UAE",
    client: "Max Retail",
    mainContractor: "HLN Technical Services LLC",
    category: "Commercial & Retail",
    scope: "Civil Works, Foundation Engineering, Tiles, Gypsum & High-Finish Painting",
    contractValue: "AED 379,594.71 (Combined Packages)",
    image: "/assets/projects/al-wahda-mall.jpg",
    year: "2023 - 2024",
    description: "Extensive civil foundation reinforcement, commercial porcelain tiling, partition walls, and retail fit-out finishes for the flagship Max department store at Al Wahda Mall, Abu Dhabi.",
    tags: ["Retail Fitout", "Civil Works", "Foundations", "Abu Dhabi"]
  },
  {
    id: "prj-4",
    name: "Jimi Mall",
    location: "Al Ain, UAE",
    client: "Homecentre",
    mainContractor: "HLN Technical Services LLC",
    category: "Commercial & Retail",
    scope: "Comprehensive Gypsum Partitions, Acoustic Ceilings & Specialist Painting",
    contractValue: "AED 52,500.00",
    image: "/assets/projects/jimi-mall.jpg",
    year: "2023",
    description: "Large-format retail fit-out for Homecentre at Jimi Mall Al Ain, integrating acoustic drywall partitions, multi-level ceiling reveals, and commercial-grade protective wall coatings.",
    tags: ["Retail Fitout", "Gypsum Works", "Acoustics", "Al Ain"]
  },
  {
    id: "prj-5",
    name: "Yas Mall",
    location: "Abu Dhabi, UAE",
    client: "Café Bateel",
    mainContractor: "Top Rock Interiors LLC",
    category: "Commercial & Retail",
    scope: "Luxury Gypsum Sculpting, Moldings & Premium Painting Work",
    contractValue: "AED 54,182.00",
    image: "/assets/projects/yas-mall.jpg",
    year: "2023",
    description: "Intricate interior fit-out for the luxury gourmet hospitality venue Café Bateel within Yas Mall, requiring flawless finishes, micro-reveal gypsum details, and premium satin coatings.",
    tags: ["Hospitality", "Interior Gypsum", "Luxury Finishes", "Yas Island"]
  },
  {
    id: "prj-6",
    name: "Al Quoz Federal Office",
    location: "Dubai, UAE",
    client: "Hayat Communications",
    mainContractor: "Hayat Communications",
    category: "Corporate & Government",
    scope: "Civil Maintenance, Facilities Refurbishment & Executive Pantry Renovation",
    contractValue: "AED 156,450.00 (Cumulative Packages)",
    image: "/assets/projects/al-quoz-office.jpg",
    year: "2023 - 2024",
    description: "Multi-scope civil maintenance and interior refurbishment for Hayat Communications federal office in Al Quoz Dubai, including executive pantry reconstruction and structural masonry upkeep.",
    tags: ["Corporate Office", "Civil Maintenance", "Renovation", "Dubai"]
  },
  {
    id: "prj-7",
    name: "Laundry Refurbishment — HM Palace",
    location: "Abu Dhabi, UAE",
    client: "HM Palace",
    mainContractor: "Hi Profile General Maintenance LLC",
    category: "Palaces & Luxury Residential",
    scope: "Industrial Laundry Refurbishment, Heavy MEP Utilities & Anti-Corrosive Tiling",
    contractValue: "AED 241,500.00",
    image: "/assets/projects/laundry-refurbishment.jpg",
    year: "2022 - 2023",
    description: "Turnkey industrial refurbishment of the high-capacity commercial laundry facility at HM Palace Abu Dhabi, featuring industrial steam and wastewater plumbing, thermal insulation, and chemical-resistant finishes.",
    tags: ["Industrial MEP", "Palace Refurbishment", "Abu Dhabi"]
  },
  {
    id: "prj-8",
    name: "DDP-MBZ Villa 43",
    location: "Abu Dhabi, UAE",
    client: "Morganti GCC",
    mainContractor: "Morganti GCC",
    category: "Luxury Residential",
    scope: "Complete Electrical Infrastructure, Lighting Controls & Distribution",
    contractValue: "AED 25,400.00",
    image: "/assets/projects/mbz-villa.jpg",
    year: "2023",
    description: "Advanced electrical wiring, smart distribution boards, and luxury architectural lighting installations for Villa 43 within the prestigious Mohammed Bin Zayed (MBZ) City master community.",
    tags: ["Electrical Infrastructure", "MBZ City", "Abu Dhabi"]
  },
  {
    id: "prj-9",
    name: "Serinia BG03 / BG04",
    location: "Dubai, UAE",
    client: "Serinia",
    mainContractor: "Focus Tech LLC",
    category: "Luxury Residential & Towers",
    scope: "Gypsum Partitions, Italian Porcelain Tiling, Painting & Electrical Works",
    contractValue: "AED 116,480.00 (Combined Packages)",
    image: "/assets/projects/serinia-tower.jpg",
    year: "2023",
    description: "High-end residential interior engineering and finishes across multiple units for Serinia in Dubai, encompassing precision wall tiling, custom gypsum cornices, and complete electrical fixture installation.",
    tags: ["High-End Residential", "MEP & Tiling", "Dubai"]
  }
];

export const CERTIFICATIONS = [
  {
    id: "iso-9001",
    title: "ISO 9001:2015",
    standard: "Quality Management System",
    accreditation: "UKASL Certified (UK Assessment & Certification Services Ltd)",
    scope: "Turnkey Building Contracting, Civil Works, MEP Engineering, Maintenance & Oil & Gas Facilities Support",
    image: "/assets/certificates/iso-9001-quality.jpg",
    badge: "Quality Excellence",
    status: "Active & Verified"
  },
  {
    id: "iso-45001",
    title: "ISO 45001:2018",
    standard: "Occupational Health & Safety Management System",
    accreditation: "UKASL Certified (Certificate No: OHS-RE-23051703C0YBACO)",
    scope: "Air Conditioning, Ventilation, Mechanical Contracting, Civil Construction, Electrical Works, Fiber Optics, and Onshore/Offshore Oil & Gas Facilities Services",
    image: "/assets/certificates/iso-45001-health-safety.jpg",
    badge: "Health & Safety",
    status: "Active & Verified"
  },
  {
    id: "iso-14001",
    title: "ISO 14001:2015",
    standard: "Environmental Management System",
    accreditation: "UKASL Certified (Certificate No: EMS-RE-23051702YJRJW52)",
    scope: "Environmental protocols across Mechanical Contracting, Electrical Installations, Civil Works, and Energy Infrastructure",
    image: "/assets/certificates/iso-14001-environmental.jpg",
    badge: "Environmental",
    status: "Active & Verified"
  }
];

export const CLIENTS = [
  { name: "Al-Futtaim Group", logo: "/assets/clients/al-futtaim.jpg", category: "Conglomerate & Retail" },
  { name: "NMDC Energy", logo: "/assets/clients/nmdc-energy.jpg", category: "Energy & Infrastructure" },
  { name: "Arabian Construction Co. (ACC)", logo: "/assets/clients/arabian-construction.jpg", category: "International Contracting" },
  { name: "Al Rakha Group", logo: "/assets/clients/al-rakha-group.jpg", category: "Construction & Development" },
  { name: "Ali & Sons Motors", logo: null, category: "Automotive & Industrial" },
  { name: "Morganti GCC", logo: null, category: "Project Management & Construction" },
  { name: "HLN Technical Services LLC", logo: null, category: "Retail & Commercial Services" },
  { name: "Top Rock Interiors LLC", logo: null, category: "Luxury Hospitality & Fit-Out" },
  { name: "Hayat Communications", logo: null, category: "Telecom & Federal Infrastructure" },
  { name: "HM Palace & Royal Villas", logo: null, category: "Palaces & Private Estates" }
];

export const CORE_VALUES = [
  {
    title: "Precision Engineering",
    number: "01",
    description: "Every millimeter, structural calculation, and installation is verified by qualified engineers according to international standards."
  },
  {
    title: "Uncompromising Safety",
    number: "02",
    description: "Certified under ISO 45001:2018 with a rigorous zero-harm safety culture embedded across every site and offshore operation."
  },
  {
    title: "Timely Handover",
    number: "03",
    description: "Strict critical path governance and CPM project management ensuring complex milestones are met without schedule slip."
  },
  {
    title: "Client-Centric Trust",
    number: "04",
    description: "Transparent accountability, institutional integrity, and enduring commercial partnerships across the UAE and India."
  }
];

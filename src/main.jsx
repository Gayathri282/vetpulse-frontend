import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { io } from "socket.io-client";
import "./style.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");

async function api(path, opt = {}) {
  const h = { ...(opt.headers || {}) };
  if (!(opt.body instanceof FormData)) h["Content-Type"] = "application/json";
  if (getToken()) h.Authorization = `Bearer ${getToken()}`;
  const r = await fetch(API + path, { ...opt, headers: h });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(d.message || "Request failed");
  return d;
}

// Medical Brand Logo Component
function Logo({ onClick }) {
  return (
    <div className="logo" onClick={onClick} title="VetPulse — Medical Tele-Veterinary Care">
      <div className="logo-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          <path d="M12 6.5a2.5 2.5 0 0 1 4.5 1.5c0 2.5-4.5 5.5-4.5 5.5S7.5 10.5 7.5 8A2.5 2.5 0 0 1 12 6.5z" />
        </svg>
      </div>
      <div className="logo-text">
        <b>VetPulse</b>
        <span>Clinical Tele-Care</span>
      </div>
    </div>
  );
}

// SVG Icons Collection
const Icons = {
  Video: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Rx: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  AI: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
  Guide: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Records: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  History: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Star: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#f97316" stroke="#f97316" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
};

// High Resolution Condition Articles Data
const ARTICLES_DATA = [
  {
    id: "ear-infection",
    title: "Otitis Externa (Ear Inflammation & Infection)",
    category: "Ears & Eyes",
    catClass: "cat-ears",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
    meaning: "Otitis Externa is an acute or chronic inflammation of the outer ear canal causing intense discomfort, odor, and swelling.",
    symptoms: ["Head shaking & ear scratching", "Dark brown or yellow discharge", "Foul odor coming from ears", "Redness and heat sensitivity"],
    whatToDo: [
      "Avoid inserting cotton swabs deep into ear canals.",
      "Gently wipe outer ear flaps with a vet-approved cleaning wipe.",
      "Schedule a video consult for microscopic diagnosis and targeted medicated drops."
    ],
    urgency: "Moderate — Needs prompt medical treatment to prevent eardrum damage."
  },
  {
    id: "gastro-upset",
    title: "Gastroenteritis (Vomiting & Upset Stomach)",
    category: "Digestive",
    catClass: "cat-digestive",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    meaning: "Inflammation of stomach and intestines, usually triggered by sudden food changes, dietary indiscretion, parasites, or viral infections.",
    symptoms: ["Repeated vomiting or retching", "Watery or loose stool", "Loss of appetite and lethargy", "Abdominal discomfort & gurgling"],
    whatToDo: [
      "Offer small amounts of fresh water continuously to prevent dehydration.",
      "Fast from solid food for 6–8 hours, then introduce a bland diet (boiled chicken & white rice).",
      "Consult a doctor immediately if blood is present or symptoms exceed 24 hours."
    ],
    urgency: "High if persistent or accompanied by severe lethargy."
  },
  {
    id: "skin-dermatitis",
    title: "Allergic Dermatitis & Skin Rash",
    category: "Skin & Coat",
    catClass: "cat-skin",
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80",
    meaning: "Hypersensitivity reaction caused by environmental allergens (pollen, dust mites), flea bites, or specific food ingredients.",
    symptoms: ["Obsessive licking, biting, or scratching", "Red, inflamed skin patches or hot spots", "Hair loss or flaky coat", "Secondary skin infections"],
    whatToDo: [
      "Maintain strict flea and tick preventive treatments year-round.",
      "Bathe with a mild hypoallergenic oat-based pet shampoo.",
      "Get a prescription for anti-itch therapy or hypoallergenic diet mapping."
    ],
    urgency: "Routine to Moderate — Causes significant distress if untreated."
  },
  {
    id: "dental-disease",
    title: "Periodontal Disease & Dental Tartar",
    category: "Dental & Mobility",
    catClass: "cat-dental",
    image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80",
    meaning: "Plaque accumulation hardens into tartar, leading to gingivitis, tooth loss, and bacterial infection beneath the gumline.",
    symptoms: ["Severe bad breath (halitosis)", "Yellow-brown tartar buildup on teeth", "Bleeding or inflamed gums", "Difficulty chewing food"],
    whatToDo: [
      "Incorporate daily teeth brushing with animal-safe enzymatic toothpaste.",
      "Provide veterinary-approved dental chews.",
      "Schedule routine professional dental scaling."
    ],
    urgency: "Routine — Progressive condition requiring routine maintenance."
  },
  {
    id: "heatstroke-dehydration",
    title: "Dehydration & Heat Stress Emergency",
    category: "Urgent Care",
    catClass: "cat-urgent",
    image: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=800&q=80",
    meaning: "Heat stress occurs when body temperature rises dangerously high due to hot climate exposure or overexertion, causing acute organ distress.",
    symptoms: ["Excessive heavy panting & drooling", "Bright red or pale gums", "Weakness, dizziness, or collapse", "Dry, non-elastic skin coat"],
    whatToDo: [
      "Move to a cool, shaded air-conditioned area immediately.",
      "Apply cool (NOT ice-cold) water to paws, chest, and ear flaps.",
      "Offer small sips of cool water and seek emergency vet care."
    ],
    urgency: "CRITICAL EMERGENCY — Act immediately!"
  },
  {
    id: "flea-tick-dermatitis",
    title: "Flea Allergy Dermatitis & Parasites",
    category: "Skin & Coat",
    catClass: "cat-skin",
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
    meaning: "Flea saliva reaction causing extreme allergic itching, crusting skin lesions, and risk of flea-borne tapeworm infection.",
    symptoms: ["Intense biting near tail base", "Flea dirt (black specks) in fur", "Red crusty papules", "Secondary bacterial crusts"],
    whatToDo: [
      "Apply vet-prescribed monthly spot-on flea treatment.",
      "Wash bedding in hot water (60°C).",
      "Consult vet for oral anti-parasitic treatment."
    ],
    urgency: "Moderate — Requires continuous preventive care."
  },
  {
    id: "flutd-urinary",
    title: "Feline Lower Urinary Tract Disease (FLUTD)",
    category: "Urgent Care",
    catClass: "cat-urgent",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    meaning: "Collection of conditions affecting feline bladder and urethra, including urinary crystals, inflammation, or life-threatening urethral blockage.",
    symptoms: ["Straining to urinate or crying in litter box", "Frequent small attempts to urinate", "Blood in urine", "Licking genital area constantly"],
    whatToDo: [
      "Increase water intake using pet water fountains.",
      "Switch to veterinary urinary wet diet formula.",
      "Seek IMMEDIATE emergency vet care if cat cannot pass urine."
    ],
    urgency: "HIGH TO CRITICAL — Inability to urinate is a fatal emergency."
  },
  {
    id: "canine-arthritis",
    title: "Canine Osteoarthritis & Joint Stiffness",
    category: "Dental & Mobility",
    catClass: "cat-dental",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
    meaning: "Progressive degeneration of joint cartilage causing pain, stiffness, and reduced mobility in senior or large breed dogs.",
    symptoms: ["Stiffness when rising from bed", "Reluctance to climb stairs or jump", "Limping or altered gait", "Joint swelling and touch sensitivity"],
    whatToDo: [
      "Provide orthopedic supportive pet bedding.",
      "Administer vet-prescribed Omega-3 & Joint supplements (Glucosamine).",
      "Schedule video consult for safe anti-inflammatory pain management."
    ],
    urgency: "Routine — Manageable with long-term therapy."
  }
];

// Production Clinical Hero Banner Component
function HeroBanner({ onBookNow, onAskAI }) {
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <h1>Expert Veterinary Care,<br />Right From Your Home.</h1>
        <p>
          Book 1-on-1 video consultations with top certified veterinarians, receive digital prescriptions in chat, and get 24/7 AI health guidance for your animals.
        </p>
        
        <div className="hero-actions">
          <button style={{ padding: "14px 28px", fontSize: "14px" }} onClick={onBookNow}>
            <Icons.Calendar /> Book Consultation Now
          </button>
          <button className="button-indigo" style={{ padding: "14px 24px", fontSize: "14px" }} onClick={onAskAI}>
            <Icons.AI /> Ask AI Health Assistant
          </button>
        </div>

        <div className="hero-stats-row">
          <div className="stat-card">
            <b>4.9 / 5</b>
            <span>Satisfaction</span>
          </div>
          <div className="stat-card">
            <b>50+</b>
            <span>Certified Vets</span>
          </div>
          <div className="stat-card">
            <b>15 Min</b>
            <span>Fast Slots</span>
          </div>
          <div className="stat-card">
            <b>100%</b>
            <span>Encrypted</span>
          </div>
        </div>
      </div>

      <div className="hero-widget-card">
        <div className="hero-img-wrapper">
          <img
            src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80"
            alt="Veterinary Doctor Examining Pet"
          />
          <span className="hero-floating-badge">🟢 Certified Vet On-Call</span>
        </div>
        <h3 style={{ margin: "14px 0 6px", fontSize: "19px" }}>Trusted Clinical Tele-Veterinary Care</h3>
        <p style={{ fontSize: "13.5px", margin: "0 0 16px" }}>
          Instant WebRTC HD video calls, digital Rx prescriptions, and secure lab report management.
        </p>
        <button style={{ width: "100%" }} onClick={onBookNow}>
          Find Available Specialists
        </button>
      </div>
    </div>
  );
}

// Production Core Services Grid with Subtle Medical Icon Boxes
function ServicesSection({ onServiceClick }) {
  const services = [
    {
      icon: <Icons.Video />,
      theme: "theme-teal",
      title: "WebRTC Video Consultations",
      desc: "Connect face-to-face with licensed veterinarians over secure HD video calls from home."
    },
    {
      icon: <Icons.Rx />,
      theme: "theme-coral",
      title: "Digital Prescriptions (Rx)",
      desc: "Receive official digital prescriptions with clear medication dosages and care instructions in chat."
    },
    {
      icon: <Icons.AI />,
      theme: "theme-indigo",
      title: "24/7 AI Pet Assistant",
      desc: "Get immediate AI guidance on symptoms, toxic food alerts, vaccine schedules, and emergency flags."
    },
    {
      icon: <Icons.Guide />,
      theme: "theme-amber",
      title: "Common Health Guides",
      desc: "Explore detailed articles on ear infections, digestive distress, skin allergies, dental care, and heatstroke."
    },
    {
      icon: <Icons.Records />,
      theme: "theme-purple",
      title: "Digital Medical Records",
      desc: "Securely upload and manage pet lab reports, blood work, vaccination logs, and medical history."
    },
    {
      icon: <Icons.History />,
      theme: "theme-sage",
      title: "Consultation History",
      desc: "Access your past doctor notes, prescription downloads, and easily schedule follow-up appointments."
    }
  ];

  return (
    <div className="services-section">
      <div className="section-header">
        <div>
          <h2>Comprehensive Veterinary Services</h2>
          <p>Everything you need to keep your pets healthy, happy, and thriving.</p>
        </div>
      </div>

      <div className="services-grid">
        {services.map((s, i) => (
          <div className="service-card" key={i} onClick={() => onServiceClick(s.title)}>
            <div className={`service-icon-wrapper ${s.theme}`}>{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <span style={{ color: "var(--brand-primary-dark)", fontWeight: "700", fontSize: "13px" }}>
              Explore Service →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Production Clinical CTA Banner with Single Full-Width Featured Doctor Profile & Instant Booking
function CTABanner({ doctors = [], onConnect }) {
  // Select lead doctor profile (or fallback)
  const featuredDoc = doctors[0] || {
    _id: "doc1",
    name: "Dr. Ananya Nair",
    specialty: "Senior Veterinary Medical Officer · Internal Medicine & Dermatology Specialist",
    degrees: "BVSc & AH, MVSc (Veterinary Internal Medicine)",
    rating: 4.9,
    reviewsCount: 124,
    experienceYears: 10,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    bio: "Licensed Senior Veterinary Specialist with over 10 years of tele-health practice. Expert in small animal internal medicine, dermatology, preventive wellness, and remote video diagnostics."
  };

  const isVikram = featuredDoc.email?.includes("vikram") || featuredDoc.name?.includes("Vikram");
  const isRajesh = featuredDoc.email?.includes("rajesh") || featuredDoc.name?.includes("Rajesh");
  
  const avatar = featuredDoc.avatar || (isVikram
    ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
    : isRajesh
    ? "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80"
    : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80");

  const degrees = featuredDoc.degrees || (isVikram
    ? "BVSc & AH, MVSc (Veterinary Surgery & Radiology), PhD"
    : isRajesh
    ? "BVSc & AH, MVSc (Avian Medicine & Exotic Pet Health)"
    : "BVSc & AH, MVSc (Veterinary Internal Medicine)");

  const bio = featuredDoc.bio || (isVikram
    ? "Specialist in veterinary surgery, orthopedic repair, joint reconstruction, soft tissue repair, and trauma emergency critical care."
    : isRajesh
    ? "Specialist in exotic pet medicine, avian health, small mammal care, reptile wellness, and emergency pediatric pet consultation."
    : "Licensed Senior Veterinary Specialist with 10+ years practice in tele-diagnosis, internal medicine, skin allergy care, and digital Rx prescriptions.");

  return (
    <div className="cta-banner">
      <div className="cta-banner-top">
        <div className="cta-content">
          <span className="cta-live-pill">🟢 TELE-VETERINARY CARE ON-CALL</span>
          <h2>Want to consult a veterinary doctor now?</h2>
          <p>Book an instant 1-on-1 video consultation, share health reports, and receive official digital prescriptions online.</p>
        </div>
        <button
          className="cta-connect-btn"
          onClick={() => onConnect?.(featuredDoc)}
        >
          Connect Now →
        </button>
      </div>

      {/* Single Featured Veterinary Doctor Profile Filling the Section */}
      <div className="cta-featured-doctor-wrapper">
        <div className="cta-featured-doctor-header">
          <span className="cta-section-label">🩺 On-Call Lead Veterinary Specialist Profile</span>
          <span className="cta-online-status-badge">🟢 Online & Ready for Video Call</span>
        </div>

        <div className="cta-single-doctor-card" onClick={() => onConnect?.(featuredDoc)}>
          <div className="cta-single-doc-left">
            <div className="cta-single-avatar-box">
              <img src={avatar} alt={featuredDoc.name} className="cta-single-doc-avatar" />
              <span className="cta-single-status-dot" title="Online Now"></span>
            </div>
            <div className="cta-single-rating-box">
              <b>⭐ {featuredDoc.rating || 4.9} / 5.0</b>
              <span>({featuredDoc.reviewsCount || 124}+ Verified Reviews)</span>
            </div>
          </div>

          <div className="cta-single-doc-body">
            <div className="cta-single-doc-title-row">
              <h3>{featuredDoc.name}</h3>
              <span className="cta-single-verified">✓ VCI Certified Specialist</span>
            </div>

            <div className="cta-single-doc-spec">{featuredDoc.specialty || "Senior Veterinary Specialist"}</div>
            
            <div className="cta-single-meta-chips">
              <span className="meta-chip">🎓 {degrees}</span>
              <span className="meta-chip">⏳ {featuredDoc.experienceYears || 10}+ Yrs Clinical Practice</span>
              <span className="meta-chip">💬 English, Hindi, Regional</span>
            </div>

            <p className="cta-single-doc-bio">"{bio}"</p>

            <div className="cta-single-footer-row">
              <div className="cta-single-price-tag">
                <span className="price-label">Clinical Video Consultation</span>
                <b className="price-val">₹500 <span className="price-dur">(30 Min HD Video Call)</span></b>
              </div>

              <button
                className="cta-single-book-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onConnect?.(featuredDoc);
                }}
              >
                Book Consultation with {featuredDoc.name?.split(" ")[1] || "Doctor"} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Home Page Health Conditions Section (Displays exactly 1 ROW of 3 cards + View More trigger)
function ArticlesSection({ onSelectDoctor, onViewAllConditions }) {
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Home section displays top 1 row (3 featured cards)
  const homeArticles = ARTICLES_DATA.slice(0, 3);

  return (
    <div className="articles-section" id="articles-section">
      <div className="section-header" style={{ alignItems: "center" }}>
        <div>
          <h2>Common Animal Health Conditions</h2>
          <p>Learn what symptoms mean, immediate home care steps, and when to consult a veterinarian.</p>
        </div>
        <button className="button-secondary" onClick={onViewAllConditions}>
          View All Health Conditions ({ARTICLES_DATA.length}) →
        </button>
      </div>

      {/* Exactly 1 Row of Featured Cards */}
      <div className="articles-grid">
        {homeArticles.map(art => (
          <div className="article-card" key={art.id}>
            <img src={art.image} alt={art.title} className="article-image" />
            <div className="article-body">
              <span className={`article-category ${art.catClass}`}>{art.category}</span>
              <h3>{art.title}</h3>
              
              <div className="article-snippet">
                <b>What does this mean?</b>
                <p style={{ margin: 0 }}>{art.meaning.substring(0, 90)}...</p>
              </div>

              <div style={{ marginTop: "auto", paddingTop: "12px", display: "flex", gap: "10px" }}>
                <button style={{ flex: 1 }} onClick={() => setSelectedArticle(art)}>Read Care Guide</button>
                <button className="button-outline" onClick={() => onSelectDoctor?.()}>Ask Vet</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More Trigger Bar */}
      <div className="view-more-banner">
        <div className="view-more-content">
          <span className="view-more-badge">📚 VETERINARY CARE DIRECTORY</span>
          <h3>Looking for specific pet symptoms or health guides?</h3>
          <p>
            Explore our complete medical library of {ARTICLES_DATA.length} condition guides with symptom checklists and action plans.
          </p>
        </div>
        <button className="button-primary view-more-btn" onClick={onViewAllConditions}>
          View More Conditions Directory →
        </button>
      </div>

      {/* Single Article Detailed Care Guide Modal */}
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSelectDoctor={() => { setSelectedArticle(null); onSelectDoctor?.(); }}
        />
      )}
    </div>
  );
}

// Dedicated Full-Page Health Conditions Directory
function AllConditionsPage({ onBack, onSelectDoctor }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const categories = ["All", "Ears & Eyes", "Digestive", "Skin & Coat", "Dental & Mobility", "Urgent Care"];

  const filtered = ARTICLES_DATA.filter(a => {
    const matchCat = filter === "All" || a.category === filter;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.meaning.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="all-conditions-page">
      <div className="directory-header-bar">
        <button className="button-outline" onClick={onBack} style={{ padding: "10px 18px" }}>
          ← Back to Main Portal
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="trust-badge" style={{ background: "var(--brand-primary-light)", color: "var(--brand-primary)", border: "1px solid var(--brand-primary-border)" }}>
            📚 Veterinary Care Library ({ARTICLES_DATA.length} Guides)
          </span>
        </div>
      </div>

      <div className="directory-hero">
        <h1>Comprehensive Animal Health & Symptom Directory</h1>
        <p>Search veterinary condition guides, key symptoms to watch for, home emergency steps, and vet consultation flags.</p>
        
        <div className="directory-search-box">
          <input
            type="text"
            placeholder="Search by condition or symptom (e.g. ear, vomiting, rash, parasites)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="articles-filter-bar" style={{ justifyContent: "center", marginBottom: "36px" }}>
        {categories.map(c => (
          <button key={c} className={filter === c ? "active" : ""} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="articles-grid">
        {filtered.map(art => (
          <div className="article-card" key={art.id}>
            <img src={art.image} alt={art.title} className="article-image" />
            <div className="article-body">
              <span className={`article-category ${art.catClass}`}>{art.category}</span>
              <h3>{art.title}</h3>
              
              <div className="article-snippet">
                <b>What does this mean?</b>
                <p style={{ margin: 0 }}>{art.meaning.substring(0, 95)}...</p>
              </div>

              <div style={{ marginTop: "auto", paddingTop: "12px", display: "flex", gap: "10px" }}>
                <button style={{ flex: 1 }} onClick={() => setSelectedArticle(art)}>Read Care Guide</button>
                <button className="button-outline" onClick={() => { onBack(); onSelectDoctor?.(); }}>Ask Vet</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSelectDoctor={() => { setSelectedArticle(null); onBack(); onSelectDoctor?.(); }}
        />
      )}
    </div>
  );
}

// Reusable Article Detail Modal Component
function ArticleDetailModal({ article, onClose, onSelectDoctor }) {
  if (!article) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="article-modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span className={`article-category ${article.catClass}`}>{article.category}</span>
          <button className="ghost" onClick={onClose}>✕ Close</button>
        </div>
        
        <h2 style={{ fontSize: "26px", marginBottom: "14px", color: "var(--brand-navy)" }}>{article.title}</h2>
        <img src={article.image} alt={article.title} style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "16px", marginBottom: "24px" }} />

        <div style={{ background: "var(--brand-primary-light)", padding: "18px 22px", borderRadius: "14px", marginBottom: "22px", border: "1px solid var(--brand-primary-border)" }}>
          <h4 style={{ margin: "0 0 6px", color: "var(--brand-primary-hover)" }}>What Does This Mean?</h4>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)" }}>{article.meaning}</p>
        </div>

        <div style={{ marginBottom: "22px" }}>
          <h4 style={{ margin: "0 0 10px", color: "var(--brand-navy)" }}>Key Symptoms To Watch For</h4>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            {article.symptoms.map((s, i) => <li key={i} style={{ marginBottom: "8px", fontSize: "14px" }}>{s}</li>)}
          </ul>
        </div>

        <div style={{ marginBottom: "26px" }}>
          <h4 style={{ margin: "0 0 10px", color: "var(--brand-navy)" }}>What To Do (Action Plan)</h4>
          <ol style={{ paddingLeft: "20px", margin: 0 }}>
            {article.whatToDo.map((step, i) => <li key={i} style={{ marginBottom: "8px", fontSize: "14px" }}>{step}</li>)}
          </ol>
        </div>

        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "16px", borderRadius: "14px", marginBottom: "28px", color: "#dc2626", fontSize: "14px" }}>
          <b>Urgency & Warning:</b> {article.urgency}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{ flex: 1, padding: "14px" }} onClick={onSelectDoctor}>
            Connect With Veterinary Doctor Now
          </button>
          <button className="button-outline" onClick={onClose} style={{ padding: "14px 20px" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// Doctors Section - Single Certified Veterinary Specialist Profile
function DoctorsSection({ doctors = [], slots = [], apps = [], onBookSlot }) {
  const [currentTab, setCurrentTab] = useState("slots");

  // Display single primary doctor (Dr. Ananya Nair or first available doctor)
  const doc = doctors[0] || {
    _id: "650000000000000000000001",
    name: "Dr. Ananya Nair",
    email: "doctor@vetpulse.demo",
    specialty: "Senior Veterinary Medical Officer · Internal Medicine & Dermatology Specialist",
    rating: 4.9,
    reviewsCount: 124,
    experienceYears: 10,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    bio: "Licensed Senior Veterinary Medical Officer with 10+ years of clinical tele-health practice. Specialist in small animal internal medicine, dermatology, gastrointestinal health, preventive wellness, and remote video diagnostics."
  };

  const docSlots = slots.filter(s => String(s.doctorId) === String(doc._id));
  const degrees = "BVSc & AH, MVSc (Veterinary Internal Medicine & Dermatology)";

  const isSlotBooked = (s) => {
    return apps.some(a => {
      if (a.status === "cancelled") return false;
      const docIdMatch = !a.doctorId || String(a.doctorId?._id || a.doctorId) === String(doc._id);
      if (!docIdMatch) return false;

      const appDate = new Date(a.startAt);
      const appDay = appDate.getDay();
      const appHours = String(appDate.getHours()).padStart(2, "0");
      const appMins = String(appDate.getMinutes()).padStart(2, "0");
      const appTime = `${appHours}:${appMins}`;

      return appDay === s.dayOfWeek && appTime === s.start;
    });
  };

  return (
    <div className="doctors-section" id="doctors-section">
      <div className="section-header">
        <div>
          <h2>Certified Lead Veterinary Specialist</h2>
          <p>Book 1-on-1 consultations directly with our licensed Senior Veterinary Medical Officer.</p>
        </div>
      </div>

      <div className="single-doctor-section-card">
        <div className="doctor-badge-row" style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <span className="verified-badge">✓ Licensed Senior Veterinary Officer</span>
          <span className="online-badge">🟢 Online & Available for Instant Booking</span>
        </div>

        <div className="doctor-profile-top" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <img
            src={doc.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"}
            alt={doc.name}
            style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--brand-primary)" }}
          />
          <div className="doctor-meta">
            <h3 style={{ fontSize: "24px", color: "var(--brand-navy)", margin: "0 0 4px" }}>{doc.name}</h3>
            <div className="doctor-specialty" style={{ fontSize: "14.5px", color: "var(--brand-primary-dark)", fontWeight: "600" }}>
              {doc.specialty}
            </div>
            <div className="doctor-rating" style={{ fontSize: "13.5px", marginTop: "6px", color: "#d97706" }}>
              <Icons.Star /> {doc.rating || 4.9} ({doc.reviewsCount || 124}+ verified reviews) • {doc.experienceYears || 10}+ yrs clinical exp
            </div>
          </div>
        </div>

        <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "18px 0", lineHeight: "1.6" }}>
          {doc.bio}
        </p>

        <div className="doctor-credentials-strip" style={{ padding: "14px 18px", borderRadius: "14px", background: "var(--bg-main)", marginBottom: "20px", fontSize: "13px", display: "grid", gap: "6px" }}>
          <div><b>Qualifications:</b> {degrees}</div>
          <div><b>Licensure:</b> VCI Registered Veterinary Officer</div>
          <div><b>Languages:</b> English, Hindi, Regional</div>
        </div>

        <div className="doctor-prices" style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
          <div className="price-pill" style={{ padding: "12px 18px", background: "var(--bg-main)", borderRadius: "12px", flex: 1 }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>General Tele-Consultation</span>
            <b style={{ fontSize: "15px", color: "var(--brand-navy)" }}>30 min • ₹500</b>
          </div>
          <div className="price-pill accent-price" style={{ padding: "12px 18px", background: "var(--brand-primary-light)", borderRadius: "12px", flex: 1, border: "1px solid var(--brand-primary-border)" }}>
            <span style={{ fontSize: "12px", color: "var(--brand-primary-hover)", display: "block" }}>Comprehensive & Dermatology Care</span>
            <b style={{ fontSize: "15px", color: "var(--brand-primary-dark)" }}>45 min • ₹750</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <button
            className={currentTab === "slots" ? "button-primary" : "button-outline"}
            style={{ flex: 1, padding: "12px", fontSize: "14px" }}
            onClick={() => setCurrentTab("slots")}
          >
            📅 Available Consultation Slots ({docSlots.length > 0 ? docSlots.length : 6})
          </button>
          <button
            className={currentTab === "overview" ? "button-primary" : "button-outline"}
            style={{ flex: 1, padding: "12px", fontSize: "14px" }}
            onClick={() => setCurrentTab("overview")}
          >
            📋 Detailed Clinical Profile & Credentials
          </button>
        </div>

        {currentTab === "slots" && (
          <div className="slots-container" style={{ padding: "20px", borderRadius: "18px", background: "var(--bg-main)" }}>
            <b style={{ fontSize: "14px", color: "var(--brand-navy)", display: "block", marginBottom: "12px" }}>
              Select Time Slot to Book Appointment:
            </b>
            <div className="slots-grid">
              {(docSlots.length > 0 ? docSlots : [
                { dayOfWeek: 1, start: "09:00", duration: 30, price: 500 },
                { dayOfWeek: 1, start: "14:00", duration: 45, price: 750 },
                { dayOfWeek: 2, start: "10:00", duration: 30, price: 500 },
                { dayOfWeek: 2, start: "15:00", duration: 45, price: 750 },
                { dayOfWeek: 3, start: "09:00", duration: 30, price: 500 },
                { dayOfWeek: 3, start: "16:00", duration: 45, price: 750 }
              ]).map((s, i) => {
                const booked = isSlotBooked(s);
                return (
                  <button
                    key={i}
                    className={`slot-btn ${booked ? "booked" : ""}`}
                    disabled={booked}
                    onClick={() => !booked && onBookSlot(doc, s)}
                  >
                    {booked
                      ? `🔒 ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][s.dayOfWeek]} • ${s.start} (Booked)`
                      : `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][s.dayOfWeek]} • ${s.start} (${s.duration}m)`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {currentTab === "overview" && (
          <div className="doctor-overview-box" style={{ padding: "20px", borderRadius: "18px", background: "var(--bg-main)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "16px", color: "var(--brand-navy)" }}>About {doc.name}</h4>
            <p style={{ margin: "0 0 12px", fontSize: "13.5px", lineHeight: "1.6" }}>
              Dr. Ananya Nair is a certified Senior Veterinary Officer with over 10 years of clinical practice. She specializes in small animal internal medicine, dermatology, gastrointestinal health, and remote diagnostic video consults.
            </p>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13.5px" }}>
              <li style={{ marginBottom: "6px" }}>Registered Member of Veterinary Council of India (VCI)</li>
              <li style={{ marginBottom: "6px" }}>Expert in remote digital prescription writing (Rx) & lab report triage</li>
              <li style={{ marginBottom: "6px" }}>Over 1,200+ successful tele-veterinary consultations completed</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Patient Appointments Portal Component
function MyAppointmentsSection({ apps, onOpenConsultation }) {
  return (
    <div className="appointments-card" id="my-appointments">
      <div className="section-header" style={{ marginBottom: "20px" }}>
        <div>
          <h2>My Scheduled Consultations</h2>
          <p>View active video appointments, status, and consultation room access.</p>
        </div>
      </div>

      {apps.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No booked consultations yet. Select a veterinarian above to schedule.</p>
      ) : (
        apps.map(a => (
          <div className="appointment-item" key={a._id}>
            <div>
              <b>{new Date(a.startAt).toLocaleString()}</b>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                With {a.doctorId?.name || "Veterinarian"}
              </div>
            </div>
            <span>{a.duration} min · ₹{a.price}</span>
            <span className={`pill ${a.status}`}>{a.status}</span>
            <button onClick={() => onOpenConsultation(a)}>
              {a.paymentStatus === "paid" ? "Open Consultation Room" : "Payment Required"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

// Voice-Enabled Talking AI Chatbot Drawer Component
function AIChatDrawer({ isOpen, onClose, onConnectDoctor }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your VetPulse Voice AI Health Assistant. Ask me any question about pet health, symptoms, diet, behavior, or vaccine guidance — I am here to talk and assist you!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const quickQuestions = ["Upset Stomach / Vomiting", "Ear Scratching & Smell", "Skin Rash & Itching", "Diet & Toxic Foods", "Vaccine Schedule"];

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingIndex(null);
  };

  const speakText = (text, msgIdx) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    if (speakingIndex === msgIdx && isSpeaking) {
      stopSpeech();
      return;
    }

    // Clean markdown formatting for natural speech synthesis
    const cleanText = text
      .replace(/•/g, "")
      .replace(/[*_#`-]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick a clear natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha")));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingIndex(msgIdx);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
    }
  }, [isOpen]);

  const handleSend = async (qText) => {
    const text = qText || input;
    if (!text.trim()) return;

    stopSpeech();
    const userMsg = { sender: "user", text };
    setMessages(prev => [...prev, userMsg]);
    if (!qText) setInput("");
    setLoading(true);

    try {
      const res = await api("/api/ai-chat", { method: "POST", body: JSON.stringify({ question: text }) });
      const newBotMsg = {
        sender: "bot",
        text: res.answer,
        category: res.category,
        recommendedAction: res.recommendedAction
      };
      
      setMessages(prev => {
        const updated = [...prev, newBotMsg];
        const newIndex = updated.length - 1;
        
        // Speak response out loud if voice is enabled
        if (!isMuted) {
          setTimeout(() => speakText(res.answer, newIndex), 200);
        }
        return updated;
      });
    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "Sorry, I had trouble processing that request. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-drawer">
      <div className="ai-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3>VetPulse Talking AI Assistant</h3>
          {isSpeaking && (
            <div className="audio-wave-box" title="AI Voice Speaking">
              <span className="wave-bar"></span>
              <span className="wave-bar"></span>
              <span className="wave-bar"></span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            className="voice-toggle-btn"
            title={isMuted ? "Unmute Voice Speech" : "Mute Voice Speech"}
            onClick={() => {
              if (!isMuted) stopSpeech();
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? "🔇 Muted" : "🔊 Voice Active"}
          </button>
          
          {isSpeaking && (
            <button className="voice-stop-btn" title="Stop Current Speech" onClick={stopSpeech}>
              ⏹ Stop
            </button>
          )}

          <button className="ghost" style={{ color: "#fff", padding: "4px 8px" }} onClick={() => { stopSpeech(); onClose(); }}>✕</button>
        </div>
      </div>

      <div className="ai-body">
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ${m.sender}`}>
            <div className="ai-msg-header">
              {m.category && <span className="ai-category-badge">[{m.category}]</span>}
              {m.sender === "bot" && (
                <button
                  className={`speak-bubble-btn ${speakingIndex === i && isSpeaking ? "speaking" : ""}`}
                  title={speakingIndex === i && isSpeaking ? "Stop Speech" : "Read Aloud"}
                  onClick={() => speakText(m.text, i)}
                >
                  {speakingIndex === i && isSpeaking ? "⏹ Stop Speaking" : "🔊 Read Aloud"}
                </button>
              )}
            </div>

            <div style={{ whiteSpace: "pre-line", marginTop: "4px" }}>{m.text}</div>
            
            {m.recommendedAction && (
              <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed var(--brand-primary-border)" }}>
                <button
                  style={{ width: "100%", padding: "9px", fontSize: "12px", background: "var(--brand-navy)" }}
                  onClick={() => { stopSpeech(); onClose(); onConnectDoctor?.(); }}
                >
                  🩺 Connect With Licensed Vet Specialist
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="ai-msg bot">Consulting veterinary medical guidelines...</div>}
      </div>

      <div className="ai-quick-chips">
        {quickQuestions.map((q, i) => (
          <button key={i} className="chip-btn" onClick={() => handleSend(q)}>{q}</button>
        ))}
      </div>

      <div className="ai-input-area">
        <input
          placeholder="Ask any animal health, diet, or behavior question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button onClick={() => handleSend()}>Ask AI</button>
      </div>
    </div>
  );
}

// Authentication Component
function Login({ onLogin }) {
  const [register, setRegister] = useState(false);
  const [f, setF] = useState({
    name: "Demo Pet Parent",
    email: "patient@vetpulse.demo",
    password: "patient123",
    petName: "Milo",
    petType: "Dog"
  });
  const [err, setErr] = useState("");

  const handleGoogleCallback = async (response) => {
    try {
      const d = await api("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential: response.credential })
      });
      localStorage.setItem("token", d.token);
      onLogin(d.user);
    } catch (x) {
      setErr("Google authentication failed: " + x.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const d = await api("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({
          email: "google_parent@vetpulse.demo",
          name: "Google Pet Parent"
        })
      });
      localStorage.setItem("token", d.token);
      onLogin(d.user);
    } catch (x) {
      setErr(x.message);
    }
  };

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && googleClientId && !googleClientId.includes("demo_google")) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback
        });
        const targetDiv = document.getElementById("googleSignInDiv");
        if (targetDiv) {
          window.google.accounts.id.renderButton(targetDiv, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with"
          });
        }
      } catch (e) {
        console.warn("Google Sign-In init:", e);
      }
    }
  }, []);

  const submit = async (e, customPayload) => {
    if (e) e.preventDefault();
    const payload = customPayload || f;
    try {
      const d = await api(register ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      localStorage.setItem("token", d.token);
      onLogin(d.user);
    } catch (x) {
      setErr(x.message);
    }
  };

  const quickLogin = (email, password) => {
    setF(prev => ({ ...prev, email, password }));
    submit(null, { email, password });
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        {/* Left Branding Hero Sidebar */}
        <div className="auth-brand-side">
          <Logo />
          <div className="auth-hero-content">
            <h2>Certified Tele-Veterinary Care & AI Health Triage</h2>
            <p>
              Connect 1-on-1 with top licensed veterinary surgeons and internal medicine specialists for HD video consultations, digital prescriptions, and 24/7 AI-guided care.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <span className="feat-icon">🩺</span>
                <div>
                  <b>Licensed Specialist Vets</b>
                  <span>Board-certified veterinary doctors on duty.</span>
                </div>
              </div>
              <div className="auth-feature-item">
                <span className="feat-icon">📄</span>
                <div>
                  <b>Digital Prescriptions (Rx)</b>
                  <span>Receive official prescriptions directly in consultation chat.</span>
                </div>
              </div>
              <div className="auth-feature-item">
                <span className="feat-icon">🤖</span>
                <div>
                  <b>24/7 Voice AI Assistant</b>
                  <span>Instant talking AI guidance on pet symptoms & emergency flags.</span>
                </div>
              </div>
            </div>

            <div className="auth-trust-strip">
              <span>🔒 256-Bit Encrypted</span>
              <span>•</span>
              <span>VCI Certified</span>
              <span>•</span>
              <span>Instant Video HD</span>
            </div>
          </div>
        </div>

        {/* Right Interactive Login & Quick Demo Form */}
        <div className="auth-form-side">
          <h1 style={{ fontSize: "22px", margin: "0 0 6px" }}>
            {register ? "Create Pet Parent Account" : "Sign In to Tele-Health Portal"}
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0 0 20px", fontSize: "13.5px" }}>
            Enter your credentials or use Google 1-click login below.
          </p>

          {/* Google 1-Click Sign-In Options */}
          <div style={{ marginBottom: "16px" }}>
            <div id="googleSignInDiv" style={{ marginBottom: "8px" }}></div>
            <button
              type="button"
              className="google-sign-in-btn"
              onClick={handleGoogleSignIn}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.617z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0 20px", color: "var(--text-muted)", fontSize: "11.5px", fontWeight: "600" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }}></div>
            <span>OR EMAIL SIGN IN</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }}></div>
          </div>

          <form onSubmit={submit}>
            {register && (
              <div style={{ display: "grid", gap: "10px", marginBottom: "10px" }}>
                <input placeholder="Your Full Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
                <input placeholder="Pet Name" value={f.petName} onChange={e => setF({ ...f, petName: e.target.value })} />
              </div>
            )}
            <div style={{ display: "grid", gap: "10px", marginBottom: "14px" }}>
              <input placeholder="Email Address" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
              <input type="password" placeholder="Password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
            </div>
            
            {err && <div style={{ color: "#a33", background: "#fff0ef", padding: "10px", borderRadius: "8px", marginBottom: "12px", fontSize: "13px" }}>{err}</div>}
            
            <button type="submit" style={{ width: "100%", padding: "11px", fontSize: "14px" }}>
              {register ? "Create Account" : "Sign In to Portal"}
            </button>
          </form>
          
          <button className="link" style={{ width: "100%", marginTop: "10px", fontSize: "13px" }} onClick={() => setRegister(!register)}>
            {register ? "Already have an account? Sign in" : "Create a new pet parent account"}
          </button>

          <div className="demo-credentials-box">
            <div className="demo-header">
              <span className="demo-badge">PRODUCTION DEMO ACCESS</span>
              <b style={{ fontSize: "13px", color: "var(--brand-navy)", display: "block", marginTop: "4px" }}>
                Select Role for Instant 1-Click Login:
              </b>
            </div>

            <div className="demo-login-grid">
              <button className="demo-login-btn doctor-theme" type="button" onClick={() => quickLogin("doctor@vetpulse.demo", "doctor123")}>
                <div className="demo-btn-left">
                  <span className="role-icon">👩‍⚕️</span>
                  <div>
                    <b>Doctor Login:</b> Dr. Ananya Nair (Senior Vet Officer)
                    <div className="demo-subtext">doctor@vetpulse.demo • Pass: doctor123</div>
                  </div>
                </div>
                <span className="demo-arrow">Sign in →</span>
              </button>

              <button className="demo-login-btn admin-theme" type="button" onClick={() => quickLogin("admin@vetpulse.demo", "admin123")}>
                <div className="demo-btn-left">
                  <span className="role-icon">👑</span>
                  <div>
                    <b>Admin Login:</b> System Administrator
                    <div className="demo-subtext">admin@vetpulse.demo • Pass: admin123</div>
                  </div>
                </div>
                <span className="demo-arrow danger-arrow">Sign in →</span>
              </button>

              <button className="demo-login-btn patient-theme" type="button" onClick={() => quickLogin("patient@vetpulse.demo", "patient123")}>
                <div className="demo-btn-left">
                  <span className="role-icon">🐾</span>
                  <div>
                    <b>Patient Login:</b> Demo Pet Parent (Milo)
                    <div className="demo-subtext">patient@vetpulse.demo • Pass: patient123</div>
                  </div>
                </div>
                <span className="demo-arrow success-arrow">Sign in →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Patient View Portal Component
function Patient({ user, onLogout }) {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [apps, setApps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [chat, setChat] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [showAllConditions, setShowAllConditions] = useState(false);

  useEffect(() => {
    Promise.all([
      api("/api/doctors"),
      api("/api/availability"),
      api("/api/appointments")
    ]).then(([docs, s, a]) => {
      setDoctors(docs);
      setSlots(s);
      setApps(a);
    }).catch(err => console.error(err));
  }, []);

  const bookSlot = async (doc, s) => {
    try {
      const day = new Date();
      day.setDate(day.getDate() + ((s.dayOfWeek - day.getDay() + 7) % 7 || 7));
      const [h, m] = s.start.split(":");
      day.setHours(h, m, 0, 0);

      const a = await api("/api/appointments/book", {
        method: "POST",
        body: JSON.stringify({
          doctorId: doc._id,
          startAt: day,
          duration: s.duration,
          price: s.price
        })
      });
      setApps([a, ...apps]);
      alert(`Demo payment successful! Appointment booked with ${doc.name}.`);
    } catch (e) {
      alert(e.message);
    }
  };

  const scrollToSection = id => {
    if (showAllConditions) {
      setShowAllConditions(false);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header>
        <Logo onClick={() => { setShowAllConditions(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        <div className="nav-links">
          <button onClick={() => { setShowAllConditions(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Home</button>
          <button onClick={() => scrollToSection("doctors-section")}>Find Vets</button>
          <button onClick={() => setShowAllConditions(true)}>Health Guides</button>
          <button onClick={() => scrollToSection("my-appointments")}>My Consultations</button>
          <button onClick={() => setAiOpen(true)}>💬 AI Assistant</button>
        </div>
        <div className="header-right">
          <div className="user-badge">
            <span>🐾</span> {user.name} ({user.petName || "Pet"})
          </div>
          <button className="ghost" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main>
        {showAllConditions ? (
          <AllConditionsPage
            onBack={() => setShowAllConditions(false)}
            onSelectDoctor={() => scrollToSection("doctors-section")}
          />
        ) : (
          <div className="dashboard-layout">
            {/* Top Patient Header Bar */}
            <div className="patient-welcome-bar">
              <div className="welcome-left">
                <h2>Welcome back, {user.name} 👋</h2>
                <p>Caring for <b>{user.petName || 'Pet'} ({user.petType || 'Dog'})</b> • Clinical Tele-Health Portal</p>
              </div>
              <div className="welcome-quick-pills">
                <span className="pill-badge active">🟢 2 Licensed Doctors Online</span>
                <span className="pill-badge">⚡ Instant 15-Min Slots</span>
                <span className="pill-badge">🤖 Voice AI Assistant Ready</span>
              </div>
            </div>

            {/* 2-Column Portal Workspace Grid Division */}
            <div className="portal-grid-container">
              {/* Primary Column (Left) */}
              <div className="portal-main-col">
                <HeroBanner
                  onBookNow={() => scrollToSection("doctors-section")}
                  onAskAI={() => setAiOpen(true)}
                />

                <DoctorsSection doctors={doctors} slots={slots} apps={apps} onBookSlot={bookSlot} />

                <ServicesSection onServiceClick={title => {
                  if (title.includes("Video") || title.includes("History")) scrollToSection("doctors-section");
                  else if (title.includes("AI")) setAiOpen(true);
                  else setShowAllConditions(true);
                }} />

                <ArticlesSection
                  onSelectDoctor={() => scrollToSection("doctors-section")}
                  onViewAllConditions={() => setShowAllConditions(true)}
                />

                <CTABanner
                  doctors={doctors}
                  onConnect={() => scrollToSection("doctors-section")}
                />
              </div>

              {/* Sidebar Column (Right) */}
              <div className="portal-sidebar-col">
                <MyAppointmentsSection
                  apps={apps}
                  onOpenConsultation={ap => { setSelected(ap); setChat(true); }}
                />

                <div className="sidebar-widget-card ai-widget-card">
                  <div className="widget-header">
                    <Icons.AI />
                    <h3>VetPulse Voice AI Assistant</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 14px" }}>
                    Get immediate voice-enabled guidance on symptoms, diet, vaccines, or toxic foods.
                  </p>
                  <button style={{ width: "100%", padding: "10px", fontSize: "13px" }} onClick={() => setAiOpen(true)}>
                    💬 Launch Talking AI Assistant
                  </button>
                </div>

                <div className="sidebar-widget-card emergency-widget-card">
                  <div className="emergency-header">
                    <span className="pulse-dot"></span>
                    <b>24/7 Emergency Triage</b>
                  </div>
                  <p style={{ margin: "8px 0 4px", fontSize: "12.5px" }}>Direct vet emergency dispatch helpline:</p>
                  <div className="emergency-phone">📞 1-800-VET-PULSE</div>
                  <span className="emergency-note">For critical trauma, breathing distress, or acute poisoning.</span>
                </div>

                <div className="sidebar-widget-card wellness-widget-card">
                  <h4>Pet Preventive Health Checklist</h4>
                  <ul className="wellness-checklist">
                    <li>✓ Annual Rabies & DHPP Vaccination</li>
                    <li>✓ Quarterly Deworming Protocol</li>
                    <li>✓ Monthly Flea & Tick Preventive</li>
                    <li>✓ Bi-annual Oral & Dental Scaling</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Redesigned Premium Footer */}
      <footer className="footer-redesign">
        <div className="footer-top-strip">
          <div className="footer-newsletter">
            <div>
              <h3>Stay Informed on Animal Care & Health Guidelines</h3>
              <p>Get monthly veterinary health tips, seasonal allergy alerts, and emergency care checklists.</p>
            </div>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email address..." />
              <button onClick={() => alert("Thank you for subscribing to VetPulse Health Updates!")}>Subscribe</button>
            </div>
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-brand-col">
            <Logo />
            <p className="footer-desc">
              VetPulse is a certified clinical tele-veterinary platform connecting pet owners with licensed doctors for HD video consultations, digital prescriptions (Rx), and 24/7 AI-assisted health triage.
            </p>
            <div className="footer-trust-badges">
              <span className="trust-badge">🔒 256-Bit Encrypted</span>
              <span className="trust-badge">🩺 VCI Certified Vets</span>
              <span className="trust-badge">⚡ 24/7 Tele-Care</span>
            </div>
          </div>

          <div>
            <h4>Clinical Services</h4>
            <ul className="footer-links-list">
              <li><button className="link-btn" onClick={() => scrollToSection("doctors-section")}>WebRTC HD Video Consult</button></li>
              <li><button className="link-btn" onClick={() => scrollToSection("doctors-section")}>Digital Prescriptions (Rx)</button></li>
              <li><button className="link-btn" onClick={() => scrollToSection("articles-section")}>Common Symptom Guides</button></li>
              <li><button className="link-btn" onClick={() => scrollToSection("my-appointments")}>Consultation Records</button></li>
              <li><button className="link-btn" onClick={() => setAiOpen(true)}>24/7 AI Health Assistant</button></li>
            </ul>
          </div>

          <div>
            <h4>Veterinary Specialties</h4>
            <ul className="footer-links-list">
              <li><span className="static-link">Internal Medicine</span></li>
              <li><span className="static-link">Dermatology & Rash Care</span></li>
              <li><span className="static-link">Gastroenterology</span></li>
              <li><span className="static-link">Ear & Eye Infections</span></li>
              <li><span className="static-link">Preventive Wellness & Vaccines</span></li>
            </ul>
          </div>

          <div>
            <h4>Emergency Triage</h4>
            <div className="emergency-card">
              <div className="emergency-header">
                <span className="pulse-dot"></span>
                <b>24/7 Veterinary Helpline</b>
              </div>
              <p style={{ margin: "6px 0", fontSize: "13px", color: "#e2e8f0" }}>
                For critical life-threatening conditions, contact emergency dispatch:
              </p>
              <div className="emergency-phone">📞 1-800-VET-PULSE</div>
              <span className="emergency-note">Always keep local emergency clinic contact numbers ready.</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div>
              © {new Date().getFullYear()} VetPulse Tele-Veterinary Healthcare Inc. All rights reserved.
            </div>
            <div className="legal-links">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Clinical Care</span>
              <span>•</span>
              <span>HIPAA Compliance</span>
              <span>•</span>
              <span>Tele-Health Disclaimer</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Pet Assistant Drawer */}
      <button className="ai-fab" onClick={() => setAiOpen(!aiOpen)}>
        <Icons.AI /> VetPulse AI
      </button>

      <AIChatDrawer
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        onConnectDoctor={() => scrollToSection("doctors-section")}
      />

      {/* WebRTC Video Call & Consultation Modal */}
      {selected && chat && (
        <Consultation app={selected} user={user} onClose={() => setChat(false)} />
      )}
    </>
  );
}

// Doctor View Portal Component
function Doctor({ user, onLogout }) {
  const [apps, setApps] = useState([]);
  const [active, setActive] = useState(null);
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(500);

  useEffect(() => {
    api("/api/appointments").then(setApps);
  }, []);

  return (
    <>
      <header>
        <Logo />
        <div className="header-right">
          <div className="user-badge"><b>Doctor Portal:</b> {user.name}</div>
          <button className="ghost" onClick={onLogout}>Logout</button>
        </div>
      </header>
      <main>
        <div style={{ background: "#fff", border: "1.5px solid var(--border-subtle)", borderRadius: "20px", padding: "32px", marginBottom: "28px", boxShadow: "var(--shadow-sm)" }}>
          <h1>{user.name} — Practice Portal</h1>
          <p>Manage appointments, video consultations, prescriptions, and patient records.</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
            <select value={duration} onChange={e => setDuration(+e.target.value)} style={{ width: "200px" }}>
              <option value="30">30 minutes slot</option>
              <option value="45">45 minutes slot</option>
            </select>
            <input type="number" value={price} onChange={e => setPrice(+e.target.value)} placeholder="Price (₹)" style={{ width: "150px" }} />
            <button onClick={async () => {
              await api("/api/availability", {
                method: "POST",
                body: JSON.stringify({ dayOfWeek: 1, start: "10:00", end: "18:00", duration, price })
              });
              alert("New Monday slot template added.");
            }}>
              Add Slot Template
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1.5px solid var(--border-subtle)", borderRadius: "20px", padding: "32px", boxShadow: "var(--shadow-sm)" }}>
          <h2>Scheduled Patient Consultations</h2>
          {apps.length === 0 ? <p>No scheduled patient appointments yet.</p> : apps.map(a => (
            <div className="appointment-item" key={a._id}>
              <div>
                <b>{new Date(a.startAt).toLocaleString()}</b>
                <div style={{ fontSize: "13px" }}>Patient: {a.patientId?.name} ({a.patientId?.petName || "Pet"})</div>
              </div>
              <span>{a.duration} min · ₹{a.price}</span>
              <span className={`pill ${a.status}`}>{a.status}</span>
              <button onClick={() => setActive(a)}>Open Consultation Room</button>
            </div>
          ))}
        </div>
      </main>

      {active && (
        <Consultation
          app={active}
          user={user}
          doctorMode
          onClose={() => { setActive(null); api("/api/appointments").then(setApps); }}
        />
      )}
    </>
  );
}

// WebRTC Consultation Modal Component — Production Ready Engine
function Consultation({ app, user, doctorMode, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [docs, setDocs] = useState([]);
  const [med, setMed] = useState({ name: "", dose: "", frequency: "", duration: "", instructions: "" });
  const [advice, setAdvice] = useState("");

  // Live WebRTC Audio/Video & View States
  const [callState, setCallState] = useState("idle"); // 'idle' | 'connecting' | 'connected' | 'disconnected' | 'failed'
  const [mobileTab, setMobileTab] = useState("video"); // 'video' | 'chat'
  const [peerConnected, setPeerConnected] = useState(false);
  const [peerUser, setPeerUser] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [timer, setTimer] = useState(0);

  const socket = useRef(null);
  const localStream = useRef(null);
  const screenStream = useRef(null);
  const pc = useRef(null);
  const iceCandidatesQueue = useRef([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Enterprise STUN & TURN Infrastructure Configuration
  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" }
    ]
  };

  // Acquire local webcam and microphone stream with fallbacks
  const getLocalMedia = async () => {
    if (localStream.current) return localStream.current;
    try {
      setMediaError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.warn("Media device access error:", err);
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.current = audioOnly;
        setMediaError("Camera blocked/unavailable. Consultation operating in audio-only mode.");
        return audioOnly;
      } catch (errAudio) {
        setMediaError("Camera & Microphone access not granted. Please allow browser permissions.");
        return null;
      }
    }
  };

  const createPeerConnection = async () => {
    if (pc.current) return pc.current;

    const newPC = new RTCPeerConnection(rtcConfig);
    pc.current = newPC;

    newPC.onicecandidate = (event) => {
      if (event.candidate && socket.current) {
        socket.current.emit("webrtc-signal", {
          appointmentId: app._id,
          data: { candidate: event.candidate }
        });
      }
    };

    newPC.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setCallState("connected");
        setPeerConnected(true);
      }
    };

    newPC.onconnectionstatechange = () => {
      if (newPC.connectionState === "connected") {
        setCallState("connected");
        setPeerConnected(true);
      } else if (newPC.connectionState === "disconnected" || newPC.connectionState === "failed") {
        setCallState("disconnected");
        setPeerConnected(false);
      }
    };

    newPC.oniceconnectionstatechange = () => {
      if (newPC.iceConnectionState === "connected" || newPC.iceConnectionState === "completed") {
        setCallState("connected");
        setPeerConnected(true);
      } else if (newPC.iceConnectionState === "failed") {
        setCallState("failed");
      }
    };

    const stream = await getLocalMedia();
    if (stream) {
      stream.getTracks().forEach(track => {
        newPC.addTrack(track, stream);
      });
    }

    return newPC;
  };

  const processQueuedIceCandidates = async () => {
    if (!pc.current || !pc.current.remoteDescription) return;
    while (iceCandidatesQueue.current.length > 0) {
      const candidate = iceCandidatesQueue.current.shift();
      try {
        await pc.current.addIceCandidate(candidate);
      } catch (e) {
        console.error("Error adding queued candidate:", e);
      }
    }
  };

  const handleIncomingOffer = async (offer) => {
    setCallState("connecting");
    const connection = await createPeerConnection();
    await connection.setRemoteDescription(new RTCSessionDescription(offer));
    await processQueuedIceCandidates();

    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);

    socket.current.emit("webrtc-signal", {
      appointmentId: app._id,
      data: { answer: connection.localDescription }
    });
  };

  const handleIncomingAnswer = async (answer) => {
    if (pc.current) {
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
      await processQueuedIceCandidates();
      setCallState("connected");
      setPeerConnected(true);
    }
  };

  const handleIncomingCandidate = async (candidate) => {
    if (pc.current && pc.current.remoteDescription) {
      try {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding ICE candidate:", e);
      }
    } else {
      iceCandidatesQueue.current.push(new RTCIceCandidate(candidate));
    }
  };

  const startCall = async () => {
    setCallState("connecting");
    const connection = await createPeerConnection();
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);

    socket.current.emit("presence", { appointmentId: app._id, present: true });
    socket.current.emit("webrtc-signal", {
      appointmentId: app._id,
      data: { offer: connection.localDescription }
    });
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!pc.current) {
      await startCall();
    }
    if (isScreenSharing) {
      if (screenStream.current) {
        screenStream.current.getTracks().forEach(t => t.stop());
        screenStream.current = null;
      }
      const videoTrack = localStream.current?.getVideoTracks()[0];
      const sender = pc.current.getSenders().find(s => s.track && s.track.kind === "video");
      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }
      if (localVideoRef.current && localStream.current) {
        localVideoRef.current.srcObject = localStream.current;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStream.current = stream;
        const screenTrack = stream.getVideoTracks()[0];
        const sender = pc.current.getSenders().find(s => s.track && s.track.kind === "video");
        if (sender && screenTrack) {
          await sender.replaceTrack(screenTrack);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);

        screenTrack.onended = () => {
          toggleScreenShare();
        };
      } catch (err) {
        console.warn("Screen share cancelled:", err);
      }
    }
  };

  useEffect(() => {
    const tInterval = setInterval(() => setTimer(x => x + 1), 1000);
    api(`/api/appointments/${app._id}/messages`).then(setMessages);
    api(`/api/appointments/${app._id}/documents`).then(setDocs);

    getLocalMedia();

    socket.current = io(API, { auth: { token: getToken() } });
    socket.current.emit("join-appointment", { appointmentId: app._id });

    socket.current.on("new-message", m => setMessages(x => [...x, m]));
    socket.current.on("document-added", d => setDocs(x => [d, ...x]));

    socket.current.on("room-status", ({ count, user }) => {
      if (count > 1) {
        setPeerConnected(true);
      }
    });

    socket.current.on("peer-joined", ({ user }) => {
      setPeerConnected(true);
      if (user) setPeerUser(user);
      // Auto initiate call if room active
      startCall();
    });

    socket.current.on("peer-left", () => {
      setPeerConnected(false);
      setCallState("disconnected");
    });

    socket.current.on("webrtc-signal", async ({ data, senderUser }) => {
      if (senderUser) setPeerUser(senderUser);
      if (data.offer) {
        await handleIncomingOffer(data.offer);
      } else if (data.answer) {
        await handleIncomingAnswer(data.answer);
      } else if (data.candidate) {
        await handleIncomingCandidate(data.candidate);
      }
    });

    socket.current.on("peer-presence", x => {
      setPeerConnected(x.present);
      if (x.user) setPeerUser(x.user);
    });

    return () => {
      clearInterval(tInterval);
      if (localStream.current) {
        localStream.current.getTracks().forEach(t => t.stop());
      }
      if (screenStream.current) {
        screenStream.current.getTracks().forEach(t => t.stop());
      }
      if (pc.current) {
        pc.current.close();
      }
      socket.current?.disconnect();
    };
  }, []);

  const send = () => {
    if (text.trim()) {
      socket.current.emit("chat-message", { appointmentId: app._id, text });
      setText("");
    }
  };

  const sendPrescription = async () => {
    await api(`/api/appointments/${app._id}/prescription`, {
      method: "POST",
      body: JSON.stringify({ medicines: [med], advice })
    });
    setMed({ name: "", dose: "", frequency: "", duration: "", instructions: "" });
    setAdvice("");
    alert("Prescription generated & sent to chat!");
  };

  const complete = async ok => {
    await api(`/api/appointments/${app._id}/complete`, {
      method: "POST",
      body: JSON.stringify({ completed: ok })
    });
    alert(ok ? "Appointment completed." : "Appointment marked uncompleted.");
  };

  const formatTimer = sec => {
    const hrs = String(Math.floor(sec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const otherPersonName = doctorMode
    ? (app.patientId?.name || "Patient")
    : (app.doctorId?.name || "Dr. Ananya Nair");

  const otherPersonRole = doctorMode ? "Pet Parent" : "Senior Veterinary Officer";

  return (
    <div className="modal">
      <div className="consult">
        {/* Video Viewport Column */}
        <div className={`video ${mobileTab === "chat" ? "mobile-hidden" : ""}`}>
          <div className="videohead">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>{doctorMode ? "🐾" : "🩺"}</span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <b style={{ fontSize: "14.5px", color: "#fff", lineHeight: "1.2" }}>
                  {doctorMode ? `Patient Consultation — ${otherPersonName}` : `Live Consultation with ${otherPersonName}`}
                </b>
                <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                  🔒 256-Bit Encrypted WebRTC HD Stream
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span className="timer-badge">⏱ {formatTimer(timer)}</span>
              <span className={`webrtc-status-badge ${callState}`}>
                {callState === "connected" && "🟢 HD Connected"}
                {callState === "connecting" && "🟡 Connecting..."}
                {callState === "idle" && (peerConnected ? "🟢 Peer Ready" : "🟡 Waiting...")}
                {callState === "disconnected" && "⚪ Disconnected"}
                {callState === "failed" && "🔴 Failed"}
              </span>
            </div>
          </div>

          {/* Mobile View Switcher Bar */}
          <div className="mobile-view-tabs">
            <button className={mobileTab === "video" ? "active" : ""} onClick={() => setMobileTab("video")}>
              📹 Video Call Stream
            </button>
            <button className={mobileTab === "chat" ? "active" : ""} onClick={() => setMobileTab("chat")}>
              💬 Chat & Rx ({messages.length})
            </button>
          </div>

          <div className="remote-wrapper">
            {/* Top-Left Participant Overlay Card */}
            <div className="participant-info-overlay">
              <span className="part-dot"></span>
              <div>
                <b>{otherPersonName}</b>
                <span>{otherPersonRole}</span>
              </div>
            </div>

            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote"
              poster={doctorMode ? "/pet_patient_dog.png" : "/vet_doctor_female.png"}
            />

            {/* Local Self Video / Picture-in-Picture */}
            <div className="local-video-container">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="local"
                style={{ display: isVideoOff ? "none" : "block" }}
              />
              {isVideoOff && (
                <div className="local-video-off-placeholder">
                  <span>📷</span>
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>Cam Off</span>
                </div>
              )}
            </div>

            {mediaError && (
              <div className="video-overlay-msg">
                <span style={{ fontSize: "28px" }}>⚠️</span>
                <p style={{ margin: "8px 0 0", fontSize: "13.5px" }}>{mediaError}</p>
              </div>
            )}
          </div>

          {/* Modern Floating Controls Bar */}
          <div className="controls">
            {callState !== "connected" && (
              <button className="control-btn primary" onClick={startCall}>
                📞 Connect HD Call
              </button>
            )}

            <button
              className={`control-btn ${isMuted ? "active" : ""}`}
              onClick={toggleMute}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? "🔇 Unmute" : "🎙️ Mute"}
            </button>

            <button
              className={`control-btn ${isVideoOff ? "active" : ""}`}
              onClick={toggleCamera}
              title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
            >
              {isVideoOff ? "📷 Cam On" : "📹 Cam Off"}
            </button>

            <button
              className={`control-btn ${isScreenSharing ? "active" : ""}`}
              onClick={toggleScreenShare}
              title="Share Screen or Reports"
            >
              {isScreenSharing ? "🛑 Stop Share" : "🖥️ Share Screen"}
            </button>

            <button className="control-btn danger-btn" onClick={onClose}>
              ❌ End Call
            </button>
          </div>
        </div>

        {/* Sidebar Workspace Column (Chat, Prescriptions & Reports) */}
        <aside className={mobileTab === "video" ? "mobile-hidden" : ""}>
          {/* Mobile Back to Video Button */}
          <div className="mobile-view-tabs mobile-only">
            <button className={mobileTab === "video" ? "active" : ""} onClick={() => setMobileTab("video")}>
              📹 Back to Video Call
            </button>
            <button className={mobileTab === "chat" ? "active" : ""} onClick={() => setMobileTab("chat")}>
              💬 Chat & Rx ({messages.length})
            </button>
          </div>

          <div className="tabs">
            <b className="tab-title active">💬 Consultation Chat</b>
            {doctorMode && <b className="tab-title">📄 Rx Prescription</b>}
          </div>

          <div className="chatlog">
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "28px 16px", fontSize: "13px" }}>
                💬 Consultation chat initialized.<br />Send a message to start communicating with the {doctorMode ? "patient parent" : "doctor"}.
              </div>
            ) : (
              messages.map(m => (
                <div className={m.senderId?._id === user.id ? "mine" : "theirs"} key={m._id}>
                  <div className="chat-sender-name">
                    {m.senderId?.name} {m.senderId?._id === user.id ? "(You)" : ""}
                  </div>
                  <p className="chat-text">{m.text}</p>
                  {m.prescriptionId && (
                    <div className="prescription-card-in-chat">
                      <div className="rx-badge">📄 DIGITAL PRESCRIPTION (Rx)</div>
                      {m.prescriptionId.medicines?.map((x, i) => (
                        <div key={i} className="rx-medicine-item">
                          <strong>💊 {x.name}</strong>
                          <div className="rx-med-details">
                            <span>Dose: {x.dose || "1 tablet"}</span> • <span>Freq: {x.frequency || "Twice daily"}</span> • <span>Duration: {x.duration || "5 days"}</span>
                          </div>
                        </div>
                      ))}
                      {m.prescriptionId.advice && (
                        <p className="rx-advice">💡 <strong>Vet Advice:</strong> {m.prescriptionId.advice}</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {doctorMode ? (
            <div className="prescription-form-area">
              <b style={{ fontSize: "13.5px", color: "var(--brand-navy)", display: "block", marginBottom: "4px" }}>
                ✍️ Write Digital Prescription (Rx)
              </b>
              <div className="rx-inputs-grid">
                <input placeholder="Medicine Name (e.g. Amoxicillin 250mg)" value={med.name} onChange={e => setMed({ ...med, name: e.target.value })} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  <input placeholder="Dosage (e.g. 1 tab)" value={med.dose} onChange={e => setMed({ ...med, dose: e.target.value })} />
                  <input placeholder="Frequency (2x daily)" value={med.frequency} onChange={e => setMed({ ...med, frequency: e.target.value })} />
                </div>
                <input placeholder="Duration (e.g. 7 days)" value={med.duration} onChange={e => setMed({ ...med, duration: e.target.value })} />
                <textarea rows="2" placeholder="Clinical Advice & Instructions..." value={advice} onChange={e => setAdvice(e.target.value)} />
              </div>

              <button className="button-indigo" style={{ width: "100%", padding: "10px", marginTop: "8px", fontSize: "13px" }} onClick={sendPrescription}>
                📄 Generate & Send Prescription
              </button>

              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button className="button-secondary" style={{ flex: 1, padding: "8px", fontSize: "12px" }} onClick={() => complete(true)}>
                  ✓ Mark Completed
                </button>
                <button className="ghost" style={{ flex: 1, padding: "8px", fontSize: "12px" }} onClick={() => complete(false)}>
                  Mark Uncompleted
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="doc-upload-area">
                <label style={{ display: "block" }}>
                  <b style={{ fontSize: "12.5px", display: "block", marginBottom: "4px", color: "var(--brand-navy)" }}>
                    📎 Attach Pet Reports / Blood Work / X-Rays
                  </b>
                  <input type="file" onChange={async e => {
                    if (e.target.files[0]) {
                      const f = new FormData();
                      f.append("file", e.target.files[0]);
                      const d = await api(`/api/appointments/${app._id}/documents`, { method: "POST", body: f });
                      setDocs(x => [d, ...x]);
                    }
                  }} />
                </label>
                {docs.length > 0 && (
                  <div className="doc-pills-list">
                    {docs.map(d => <span key={d._id} className="doc-pill">📄 {d.originalName}</span>)}
                  </div>
                )}
              </div>

              <div className="composer">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && send()}
                  placeholder="Type message to veterinarian..."
                />
                <button onClick={send}>Send</button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

// Admin Control Portal Component
function Admin({ user, onLogout }) {
  const [stats, setStats] = useState({ doctorsCount: 0, patientsCount: 0, appointmentsCount: 0, totalRevenue: 0 });
  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tab, setTab] = useState("overview");

  const [newDoc, setNewDoc] = useState({
    name: "",
    email: "",
    password: "doctor123",
    specialty: "Veterinary Specialist · General Care",
    bio: "Licensed tele-veterinarian providing expert care for pets.",
    experienceYears: 5,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const refreshData = () => {
    api("/api/admin/stats").then(setStats).catch(console.error);
    api("/api/admin/users").then(setUsers).catch(console.error);
    api("/api/admin/appointments").then(setApps).catch(console.error);
    api("/api/doctors").then(setDoctors).catch(console.error);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await api("/api/admin/doctors/create", {
        method: "POST",
        body: JSON.stringify(newDoc)
      });
      setMsg(`Doctor profile for ${newDoc.name} created successfully!`);
      setNewDoc({
        name: "",
        email: "",
        password: "doctor123",
        specialty: "Veterinary Specialist · General Care",
        bio: "Licensed tele-veterinarian providing expert care for pets.",
        experienceYears: 5,
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
      });
      refreshData();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <>
      <header>
        <Logo />
        <div className="header-right">
          <div className="user-badge" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
            👑 Admin Portal: {user.name}
          </div>
          <button className="ghost" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main>
        {/* Admin Header Banner */}
        <div style={{ background: "var(--brand-navy)", color: "#fff", padding: "32px 36px", borderRadius: "24px", marginBottom: "28px" }}>
          <h1 style={{ color: "#fff", margin: "0 0 8px", fontSize: "28px" }}>Platform Administration & Management</h1>
          <p style={{ color: "#94a3b8", margin: "0 0 24px" }}>
            Overview of platform analytics, doctor profile management, appointments history, and registered users.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
            <div style={{ background: "rgba(255,255,255,0.08)", padding: "16px 20px", borderRadius: "14px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>TOTAL DOCTORS</span>
              <b style={{ fontSize: "26px", color: "#fff" }}>{stats.doctorsCount || doctors.length}</b>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", padding: "16px 20px", borderRadius: "14px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>REGISTERED PATIENTS</span>
              <b style={{ fontSize: "26px", color: "#fff" }}>{stats.patientsCount || 1}</b>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", padding: "16px 20px", borderRadius: "14px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>TOTAL APPOINTMENTS</span>
              <b style={{ fontSize: "26px", color: "#fff" }}>{stats.appointmentsCount || apps.length}</b>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", padding: "16px 20px", borderRadius: "14px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>PLATFORM REVENUE</span>
              <b style={{ fontSize: "26px", color: "#4ade80" }}>₹{stats.totalRevenue || 0}</b>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", borderBottom: "2px solid var(--border-subtle)", paddingBottom: "12px" }}>
          <button className={tab === "overview" ? "" : "button-outline"} onClick={() => setTab("overview")}>
            📊 Doctor Profiles & Management
          </button>
          <button className={tab === "appointments" ? "" : "button-outline"} onClick={() => setTab("appointments")}>
            📅 All Platform Appointments ({apps.length})
          </button>
          <button className={tab === "users" ? "" : "button-outline"} onClick={() => setTab("users")}>
            👥 User Directory ({users.length})
          </button>
        </div>

        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
              {/* Doctor Profiles List */}
              <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                <h3 style={{ margin: "0 0 16px" }}>Active Doctor Profiles</h3>
                <div style={{ display: "grid", gap: "14px" }}>
                  {doctors.map(doc => (
                    <div key={doc._id} style={{ display: "flex", gap: "14px", alignItems: "center", padding: "12px", borderRadius: "12px", border: "1px solid var(--border-subtle)", background: "var(--bg-main)" }}>
                      <img src={doc.avatar || "/vet_doctor_female.png"} alt={doc.name} style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <b>{doc.name}</b>
                        <div style={{ fontSize: "12px", color: "var(--brand-blue)" }}>{doc.specialty}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{doc.email} · {doc.experienceYears || 10}+ yrs exp</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Doctor Profile Form */}
              <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                <h3 style={{ margin: "0 0 16px" }}>➕ Create New Doctor Profile</h3>
                
                {msg && <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px", border: "1px solid #bbf7d0" }}>{msg}</div>}
                {err && <div style={{ background: "#fff0ef", color: "#a33", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>{err}</div>}

                <form onSubmit={handleCreateDoctor} style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>Doctor Full Name</label>
                    <input required placeholder="e.g. Dr. Rajesh Sharma" value={newDoc.name} onChange={e => setNewDoc({ ...newDoc, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>Email Address (Login)</label>
                    <input required type="email" placeholder="e.g. rajesh@vetpulse.demo" value={newDoc.email} onChange={e => setNewDoc({ ...newDoc, email: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>Initial Password</label>
                    <input required type="text" value={newDoc.password} onChange={e => setNewDoc({ ...newDoc, password: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>Specialty / Sub-specialization</label>
                    <input required placeholder="e.g. Veterinary Cardiology & Internal Medicine" value={newDoc.specialty} onChange={e => setNewDoc({ ...newDoc, specialty: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>Years of Experience</label>
                    <input type="number" value={newDoc.experienceYears} onChange={e => setNewDoc({ ...newDoc, experienceYears: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>Bio / Professional Summary</label>
                    <textarea rows="2" value={newDoc.bio} onChange={e => setNewDoc({ ...newDoc, bio: e.target.value })} />
                  </div>
                  <button type="submit" style={{ marginTop: "6px" }}>
                    Create & Activate Doctor Account
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {tab === "appointments" && (
          <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
            <h3 style={{ margin: "0 0 14px" }}>System Appointments History</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Duration</th>
                    <th>Fee</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>No platform appointments recorded yet.</td></tr>
                  ) : (
                    apps.map(a => (
                      <tr key={a._id}>
                        <td>{new Date(a.startAt).toLocaleString()}</td>
                        <td><b>{a.patientId?.name || "Patient"}</b> ({a.patientId?.petName || "Pet"})</td>
                        <td><b>{a.doctorId?.name || "Doctor"}</b></td>
                        <td>{a.duration} mins</td>
                        <td>₹{a.price}</td>
                        <td>
                          <span style={{ color: a.paymentStatus === "paid" ? "var(--brand-green)" : "#d97706", fontWeight: "700" }}>
                            {a.paymentStatus === "paid" ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td><span className={`pill ${a.status}`}>{a.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
            <h3 style={{ margin: "0 0 14px" }}>Registered Platform Users</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Pet Info</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td><b>{u.name}</b></td>
                      <td>{u.email}</td>
                      <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                      <td>{u.petName ? `${u.petName} (${u.petType || 'Pet'})` : '—'}</td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));

  const login = u => {
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) return <Login onLogin={login} />;
  if (user.role === "doctor") return <Doctor user={user} onLogout={logout} />;
  if (user.role === "admin") return <Admin user={user} onLogout={logout} />;
  return <Patient user={user} onLogout={logout} />;
}

createRoot(document.getElementById("root")).render(<App />);

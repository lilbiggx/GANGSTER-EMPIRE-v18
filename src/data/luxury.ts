// v10: Luxury Boutique — 666 tiered assets from street level to billionaire money sinks.
// Organized by tiers and iconic luxury brands to create immense variety.
// Every item gives real gameplay effects (see LuxuryEffects) that the engine reads in one place (luxuryEffects()).

export type LuxuryEffectKey = "income" | "launder" | "heat" | "power" | "intimidation" | "loyalty" | "influence";

export interface LuxuryEffects {
  income?: number;       // % bonus on hustle + plot income
  launder?: number;      // percentage points off the laundering fee
  heat?: number;         // % reduction on all heat gained
  power?: number;        // flat raid defence + fight power
  intimidation?: number; // % reduction to rival power
  loyalty?: number;      // crew morale floor (crew never drop below this)
  influence?: number;    // influence points (+0.5% heist rewards each, shown as Respect/Influence)
}

export interface LuxuryCategory { id: string; name: string; icon: string; desc: string }
export interface LuxuryItem {
  id: string;
  name: string;
  brand: string;         // Luxury house or manufacturer brand
  category: string;
  tier: number;          // 1..7, 8 = prestige
  price: number;         // clean cedis
  icon: string;          // lucide icon name
  desc: string;
  effects: LuxuryEffects;
  set?: string;          // collection set id
  limited?: boolean;     // only buyable while in the rotating stock
  prestige?: boolean;    // ultra-expensive money sink
}
export interface LuxurySet { id: string; name: string; icon: string; desc: string; tiers: { need: number; effects: LuxuryEffects; label: string }[] }

export const LUXURY_CATEGORIES: LuxuryCategory[] = [
  { id: "clothing", name: "Clothing & Jewelry", icon: "Gem", desc: "Drip that makes the street listen" },
  { id: "watches", name: "Watches", icon: "Watch", desc: "Timepieces bankers trust" },
  { id: "cars", name: "Cars", icon: "CarFront", desc: "Getaway power and street presence" },
  { id: "bikes", name: "Bikes", icon: "Bike", desc: "Fast runners that lose the police" },
  { id: "boats", name: "Boats", icon: "Sailboat", desc: "Offshore runs that wash cash" },
  { id: "jets", name: "Jets & Choppers", icon: "Plane", desc: "Leave town when the heat is on" },
  { id: "estate", name: "Real Estate & Penthouses", icon: "Building2", desc: "Property that pays and keeps crew loyal" },
  { id: "art", name: "Art & Collectibles", icon: "Palette", desc: "Wash money through the gallery world" },
  { id: "arms", name: "Weapons & Armour", icon: "Shield", desc: "Raw power for raids and fights" },
  { id: "tech", name: "Tech & Gadgets", icon: "Cpu", desc: "Scramblers, servers and spy gear" },
];

// Tier price ladder: street → billionaire
export const LUXURY_TIER_PRICES = [0, 5_000, 50_000, 500_000, 5_000_000, 50_000_000, 500_000_000, 5_000_000_000];
export const LUXURY_TIER_NAMES = ["", "Street", "Hustler", "Boss", "Kingpin", "Tycoon", "Mogul", "Billionaire", "Legend"];
const S = [0, 1, 1.6, 2.4, 3.5, 5, 7, 10, 16];

// Category Brand Definitions
const CATEGORY_BRANDS: Record<string, string[]> = {
  clothing: ["Gucci", "Louis Vuitton", "Balenciaga", "Versace", "Prada", "Dior Homme", "Bonwire Kente", "Tom Ford", "Cartier High Jewelry", "Akan Sovereign Gold"],
  watches: ["Rolex", "Patek Philippe", "Audemars Piguet", "Richard Mille", "Jacob & Co.", "Cartier Horlogerie", "Hublot", "Vacheron Constantin", "Bvlgari", "Akan Royal Timepieces"],
  cars: ["Rolls-Royce", "Bentley", "Bugatti", "Ferrari", "Lamborghini", "Mercedes-Maybach", "Porsche", "Aston Martin", "Koenigsegg", "McLaren"],
  bikes: ["Ducati", "Harley-Davidson", "MV Agusta", "Yamaha Speciale", "BMW Motorrad", "Kawasaki Ninja", "Triumph Custom", "Bimota Prototype", "KTM Factory", "Aprilia V4"],
  boats: ["Sunseeker", "Riva", "Wally Yachts", "Lürssen", "Azimut", "Princess Yachts", "Feadship", "Benetti", "Pershing", "Sanlorenzo"],
  jets: ["Gulfstream", "Bombardier", "Dassault Falcon", "Cessna Citation", "Embraer Praetor", "Airbus ACJ", "Pilatus", "Sikorsky VIP", "Bell Helicopter", "Boeing VIP"],
  estate: ["East Legon Estates", "Airport Hills Signature", "Cantonments Penthouses", "Roman Ridge Mansions", "Monaco Harbourside", "Beverly Hills Holdings", "Mayfair London", "Dubai Marina Towers", "Aspen Alpine Chalets", "Palm Jumeirah Palaces"],
  art: ["Christie's Heritage", "Sotheby's Fine Art", "Akan Sovereign Antiquities", "Bonhams Royal", "Basel Contemporary", "Louvre Archives", "Gagosian Exclusives", "Phillips Modern", "Venice Biennale Masterworks", "Uffizi Legacy"],
  arms: ["Barrett Tactical", "Heckler & Koch", "SIG Sauer Mastershop", "Accuracy International", "Knight's Armament", "Beretta Imperiale", "Holland & Holland", "Korth Precision", "Desert Tech", "FN Herstal"],
  tech: ["Quantum Cyberdyne", "Palantir Syndicate", "Skunkworks Aerospace", "Blackberry Stealth", "Cryptex Network", "DarkStar Quantum", "Neuralink Enterprise", "Lockheed Advanced", "Starlink Global", "Ghost Protocol Systems"],
};

const CATEGORY_NAMES_SEED: Record<string, string[][]> = {
  clothing: [
    ["Silk Monogram Robe", "Shirt", "Signature monogram weave draped with heavy silk."],
    ["Kente Sovereign Cape", "Crown", "Gold-threaded Bonwire royal cloth."],
    ["Diamond Cuban Choker", "Gem", "Pave-set VVS diamond link chain."],
    ["Runway Leather Trench", "Shirt", "Double-breasted Italian calfskin coat."],
    ["Solid Gold Lion Pendant", "Gem", "24-karat cast medallion of royal lineage."],
    ["Embroidered Agbada Robe", "Shirt", "Hand-stitched damask tailored for supreme kings."],
  ],
  watches: [
    ["Oyster Chronometer", "Watch", "Fluted bezel in dual-tone yellow gold."],
    ["Nautilus Rose Gold", "Watch", "Horological masterpiece with chocolate dial."],
    ["Royal Oak Tourbillon", "Watch", "Octagonal brushed titanium icon."],
    ["Sapphire Skeleton Calibre", "Watch", "Zero-gravity split-second escapement."],
    ["Astronomia Diamond Celestial", "Timer", "Rotating four-arm planetary movement."],
    ["Perpetual Moonphase Classic", "Hourglass", "Ultra-rare heritage grand complication."],
  ],
  cars: [
    ["Black Badge Phantom", "CarFront", "Bespoke starlight ceiling limousine."],
    ["Continental GT Speed", "Car", "Twin-turbo W12 with diamond quilted leather."],
    ["Super Sport 300+", "Gauge", "Quad-turbo carbon missile breaking speed records."],
    ["Stradale Hybrid V8", "Car", "Prancing horse hybrid delivering 1000 brake horsepower."],
    ["Revuelto V12 Carbon", "CarFront", "Aggressive wedge hypercar turning every city head."],
    ["Maybach Pullman Armored", "CarFront", "VR10 ballistic protection for syndicate heads."],
  ],
  bikes: [
    ["Panigale V4 Speciale", "Bike", "Titanium exhaust and dry clutch roar."],
    ["Custom Fat Boy Chopper", "Bike", "Chrome-raked forks built for long street cruises."],
    ["Superveloce 1000 Serie Oro", "Bike", "Retro-futuristic carbon fiber sculpture on two wheels."],
    ["R1M Carbon Track Edition", "Bike", "Electronic racing suspension for quick escapes."],
    ["M1000RR Superbike", "Bike", "Carbon winglets generating massive downforce."],
    ["Ninja H2R Supercharged", "Zap", "300HP supercharged beast screaming down the coast."],
  ],
  boats: [
    ["Predator 74 Sport Cruiser", "Sailboat", "Black hull performance yacht with hydraulic platform."],
    ["Aquariva Supercraft", "Ship", "Gloss mahogany deck and Italian leather sunbeds."],
    ["118 WallyPower Stealth", "Sailboat", "Geometric carbon hull cutting open seas unseen."],
    ["140m Mega Yacht Citadel", "Ship", "Dual helipads, cinema, submarine dock and defense radar."],
    ["Grande 35 Metri Trideck", "Ship", "Carbon tech superstructure with infinity beach club."],
    ["Project Sunrise Superyacht", "Anchor", "100m ocean cruiser registered in George Town."],
  ],
  jets: [
    ["G700 Executive Long-Range", "Plane", "Five living zones flying Mach 0.90 across oceans."],
    ["Global 7500 Master Suite", "Plane", "Full-size bed, master shower, 7700nm non-stop range."],
    ["Falcon 10X Luxury Cabin", "Plane", "Widest business jet fuselage with Rolls-Royce Pearl engines."],
    ["Citation Longitude Jet", "Plane", "Whisper-quiet cruising above all commercial airlines."],
    ["Praetor 600 Transcontinental", "Plane", "Full fly-by-wire turbulence reduction executive shuttle."],
    ["Airbus Corporate Jet ACJ320", "Plane", "Penthouse in the sky with boardroom and master lounge."],
  ],
  estate: [
    ["Presidential Gated Compound", "Building2", "12-bedroom estate with private guard towers in East Legon."],
    ["Airport Hills Cliffside Villa", "Hotel", "Infinity pool overlooking Accra with subterranean bunker."],
    ["Triplex Sky Penthouse", "Building", "360-degree glass aerie above Cantonments embassy district."],
    ["Roman Ridge Executive Manor", "Landmark", "Colonial high-ceiling ballroom with manicured gardens."],
    ["Monaco Seaside Duplex", "Building2", "Overlooking Port Hercules grand prix starting grid."],
    ["Dubai Palm Waterfront Palace", "Building2", "Private beach with gold-leaf archways and yacht pier."],
  ],
  art: [
    ["Ancient Akan Sovereign Stool", "Trophy", "Sacred ceremonial stool plated in solid Asante gold."],
    ["Renaissance Oil Masterwork", "Palette", "500-year-old museum portrait verified by Basel experts."],
    ["Monolithic Abstract Bronze", "Brush", "Three-ton courtyard sculpture commanding respect."],
    ["Imperial Dynasty Jade Urn", "Frame", "Priceless antique preserved across four centuries."],
    ["Modernist Neon Canvas", "Frame", "Auction-breaking contemporary sensation."],
    ["Royal Regalia Crown Jewel Box", "Award", "Encrusted emerald and ruby vault artifact."],
  ],
  arms: [
    ["Anti-Materiel .50 BMG Rig", "Crosshair", "Precision long-range sniper rifle that penetrates steel walls."],
    ["Suppressed Personal Defense Weapon", "Shield", "Sub-compact armor-piercing machine pistol."],
    ["Custom Mastershop 1911 Pair", "Swords", "Hand-engraved Damascus slide pistols with pearl grips."],
    ["Covert Body Armor Under-Tux", "ShieldCheck", "Level IV ballistic weave that looks like silk tailoring."],
    ["Automated Compound Turret Grid", "Shield", "Remote thermal tracking sentry batteries on perimeter."],
    ["Tactical Armored Command Carrier", "ShieldCheck", "Blast-resistant APC fitted with satellite uplinks."],
  ],
  tech: [
    ["Quantum Encryption Server Core", "Cpu", "Unbreakable cryptographic cluster hosted in deep vault."],
    ["Surveillance Micro-Drone Swarm", "Radar", "Autonomous thermal tracking drones mapping rival moves."],
    ["Satellite Uplink Command Rig", "Satellite", "Direct encrypted feed to orbital defense networks."],
    ["AI Predictive Market Oracle", "Laptop", "Algorithmic bot scraping global currency trades."],
    ["Silent EMP Disruptor Suite", "Zap", "Directional pulse generator that blacks out city blocks."],
    ["Hardened Faraday Safehouse Data Vault", "Server", "EMP-proof server bank safeguarding all syndicate ledgers."],
  ],
};

// Effect profile per category (base values at tier 1, scaled by S[tier])
const PROFILE: Record<string, LuxuryEffects> = {
  clothing: { influence: 1, loyalty: 1 },
  watches: { influence: 1, launder: 0.1 },
  cars: { power: 6, heat: 0.6 },
  bikes: { heat: 0.8, income: 0.4 },
  boats: { launder: 0.12, income: 0.4 },
  jets: { heat: 1, launder: 0.08, intimidation: 0.3 },
  estate: { income: 0.8, loyalty: 1 },
  art: { launder: 0.12, influence: 1 },
  arms: { power: 10, intimidation: 0.4 },
  tech: { heat: 0.8, income: 0.3 },
};
const SET_OF: Record<string, string> = {
  clothing: "iced_out", watches: "iced_out", cars: "garage", bikes: "garage",
  boats: "fleet", jets: "fleet", estate: "estate", art: "gallery", arms: "arsenal", tech: "network",
};

const r2 = (n: number) => Math.round(n * 100) / 100;
function scaleEffects(base: LuxuryEffects, tier: number, mult = 1): LuxuryEffects {
  const out: LuxuryEffects = {};
  (Object.keys(base) as LuxuryEffectKey[]).forEach((k) => {
    const v = (base[k] || 0) * (S[tier] || 1) * mult;
    out[k] = k === "power" || k === "influence" || k === "loyalty" ? Math.max(1, Math.round(v)) : r2(v);
  });
  return out;
}

// Exactly 600 regular luxury items across 10 categories (60 items each, spanning Tiers 1 to 7)
const REGULAR_600: LuxuryItem[] = [];
LUXURY_CATEGORIES.forEach((cat, catIdx) => {
  const brands = CATEGORY_BRANDS[cat.id] || ["Kingpin Heritage"];
  const seedNames = CATEGORY_NAMES_SEED[cat.id] || [["Luxury Asset", "Gem", "Exclusive luxury item."]];
  
  for (let i = 0; i < 60; i++) {
    const tier = Math.min(7, Math.floor(i / 9) + 1);
    const brand = brands[i % brands.length];
    const seed = seedNames[i % seedNames.length];
    const itemNum = i + 1;
    const basePrice = LUXURY_TIER_PRICES[tier];
    const priceMult = 1 + (i % 9) * 0.18 + (catIdx % 4) * 0.05;
    const price = Math.round(basePrice * priceMult);
    
    REGULAR_600.push({
      id: `lx_${cat.id}_t${tier}_${itemNum}`,
      name: `${brand} ${seed[0]} #${itemNum}`,
      brand,
      category: cat.id,
      tier,
      price,
      icon: seed[1],
      desc: `${seed[2]} Commissioned from ${brand}. Certified Tier ${tier} ${LUXURY_TIER_NAMES[tier]} luxury.`,
      effects: scaleEffects(PROFILE[cat.id], tier, 1 + (i % 5) * 0.1),
      set: SET_OF[cat.id],
    });
  }
});

// Exactly 40 limited rotating stock items (4 per category across Tiers 2 to 7)
const LIMITED_40: LuxuryItem[] = [];
LUXURY_CATEGORIES.forEach((cat, catIdx) => {
  const brands = CATEGORY_BRANDS[cat.id];
  const lIcons = ["Trophy", "Award", "Gem", "Sparkles", "Star", "Crown", "Flame", "Zap", "ShieldCheck", "Rocket"];
  const lNames = ["Heritage Drop", "Midnight Edition", "VIP Collector Spec", "Artisan Gold Release"];

  for (let j = 0; j < 4; j++) {
    const tier = Math.min(7, j + 2);
    const brand = brands[(j * 2 + catIdx) % brands.length];
    const price = Math.round(LUXURY_TIER_PRICES[tier] * (1.5 + j * 0.4));
    LIMITED_40.push({
      id: `lx_ltd_${cat.id}_${j + 1}`,
      name: `${brand} ${lNames[j]} (${cat.name.split(" ")[0]})`,
      brand,
      category: cat.id,
      tier,
      price,
      icon: lIcons[(catIdx + j) % lIcons.length],
      desc: `Exclusive limited-edition allocation by ${brand}. High-value collector asset available only in active rotation.`,
      effects: scaleEffects(PROFILE[cat.id], tier, 1.4),
      set: SET_OF[cat.id],
      limited: true,
    });
  }
});

// Exactly 26 prestige billionaire & trillionaire legend items (Tier 8)
const PRESTIGE_26: LuxuryItem[] = [
  { id: "lx_p_moon", name: "Lunar Land Deed", brand: "SpaceX Orbital", category: "estate", tier: 8, price: 25_000_000_000, icon: "Rocket", desc: "A registered sovereign plot on the Moon. The ultimate atmospheric flex.", effects: { influence: 40, income: 8, loyalty: 10 }, set: "legend", prestige: true },
  { id: "lx_p_bank", name: "Central Reserve Bank Stake", brand: "Swiss Sovereign Reserve", category: "watches", tier: 8, price: 40_000_000_000, icon: "Landmark", desc: "Print the currency rules yourself. Laundering becomes pure paperwork.", effects: { launder: 2, influence: 30 }, set: "legend", prestige: true },
  { id: "lx_p_stadium", name: "Accra Sports Stadium Naming Rights", brand: "National Sports Authority", category: "estate", tier: 8, price: 60_000_000_000, icon: "Trophy", desc: "Forty thousand screaming fans chanting your syndicate's sovereign name.", effects: { influence: 60, intimidation: 4, heat: 5 }, set: "legend", prestige: true },
  { id: "lx_p_navy", name: "Private Guided-Missile Destroyer", brand: "General Dynamics Naval", category: "boats", tier: 8, price: 80_000_000_000, icon: "Anchor", desc: "Guided-missile frigates patrolling your coastal trade and offshore laundering lanes.", effects: { power: 900, intimidation: 6 }, set: "legend", prestige: true },
  { id: "lx_p_space", name: "Orbital Space Station Citadel", brand: "Axiom Space Command", category: "tech", tier: 8, price: 150_000_000_000, icon: "Satellite", desc: "A private pressurized fortress in low-Earth orbit. Extradition cannot touch you.", effects: { heat: 10, income: 10, influence: 50 }, set: "legend", prestige: true },
  { id: "lx_p_nation", name: "Micronation Sovereign Territory", brand: "Sovereign Crown Order", category: "estate", tier: 8, price: 500_000_000_000, icon: "Crown", desc: "Your own UN-recognized flag and passports. The ultimate endgame underworld purchase.", effects: { income: 15, launder: 2, heat: 10, power: 1500, intimidation: 8, loyalty: 20, influence: 120 }, set: "legend", prestige: true },
  { id: "lx_p_sub", name: "Titanium Nuclear Submarine", brand: "Vickers Shipbuilding", category: "boats", tier: 8, price: 95_000_000_000, icon: "Anchor", desc: "Sub-surface stealth command center capable of circum-navigating the globe.", effects: { power: 850, intimidation: 7, heat: 8 }, set: "legend", prestige: true },
  { id: "lx_p_carrier", name: "Decommissioned Supercarrier Fleet", brand: "Newport News Shipbuilding", category: "boats", tier: 8, price: 220_000_000_000, icon: "Ship", desc: "A 100,000-ton floating airstrip anchored in international waters.", effects: { power: 2500, intimidation: 12, influence: 80 }, set: "legend", prestige: true },
  { id: "lx_p_concorde", name: "Supersonic Presidential Concorde", brand: "Aérospatiale VIP", category: "jets", tier: 8, price: 35_000_000_000, icon: "Plane", desc: "Mach 2.04 supersonic luxury airliner flying London to Accra in 3 hours.", effects: { heat: 6, launder: 1.2, influence: 45 }, set: "legend", prestige: true },
  { id: "lx_p_diamond_mine", name: "Kimberlite Diamond Pipe Mine", brand: "De Beers Syndicate", category: "art", tier: 8, price: 180_000_000_000, icon: "Gem", desc: "A direct pipeline of raw rough diamonds for limitless private vault reserves.", effects: { income: 18, influence: 75 }, set: "legend", prestige: true },
  { id: "lx_p_telecom", name: "National 5G Fiber Core Network", brand: "Vodafone Sovereign", category: "tech", tier: 8, price: 110_000_000_000, icon: "Cpu", desc: "Control all data packets and wiretaps moving across West Africa.", effects: { heat: 9, income: 12, launder: 1.5 }, set: "legend", prestige: true },
  { id: "lx_p_gold_reserve", name: "Fort Knox Gold Bullion Ingot Vault", brand: "Bank of England Bullion", category: "art", tier: 8, price: 300_000_000_000, icon: "Landmark", desc: "Five thousand bars of 99.99% pure investment-grade physical gold bullion.", effects: { influence: 140, income: 20 }, set: "legend", prestige: true },
  { id: "lx_p_oil_field", name: "Offshore Deepwater Petroleum Block", brand: "Tullow Petroleum Holdings", category: "estate", tier: 8, price: 260_000_000_000, icon: "Flame", desc: "Pumping 120,000 barrels of sweet crude per day from the Gulf of Guinea.", effects: { income: 25, launder: 2 }, set: "legend", prestige: true },
  { id: "lx_p_island_chain", name: "Polynesian Private Atoll Archipelago", brand: "Tahiti Sovereign Holdings", category: "estate", tier: 8, price: 75_000_000_000, icon: "Building2", desc: "Twelve private coral islands with private runways and deepwater superyacht docks.", effects: { loyalty: 25, influence: 55, income: 9 }, set: "legend", prestige: true },
  { id: "lx_p_f1_team", name: "Formula 1 Championship Racing Team", brand: "Scuderia Grand Prix", category: "cars", tier: 8, price: 85_000_000_000, icon: "Car", desc: "A front-row global motorsport franchise delivering billion-dollar sponsorship washing.", effects: { influence: 90, launder: 1.8, power: 400 }, set: "legend", prestige: true },
  { id: "lx_p_airbus_fleet", name: "Private Air Cargo Fleet (10x 747-8F)", brand: "Boeing Defense VIP", category: "jets", tier: 8, price: 130_000_000_000, icon: "Plane", desc: "Ten heavy freight airliners capable of shifting whole arsenals overnight.", effects: { heat: 12, launder: 2.2, intimidation: 6 }, set: "legend", prestige: true },
  { id: "lx_p_pmc_army", name: "Private Military Division (5,000 PMC)", brand: "Executive Outcomes Syndicate", category: "arms", tier: 8, price: 175_000_000_000, icon: "Swords", desc: "A full armored mechanized infantry division under your personal command.", effects: { power: 3500, intimidation: 15 }, set: "legend", prestige: true },
  { id: "lx_p_hyper_ai", name: "Quantum Quantum-Supremacy Mainframe", brand: "IBM Quantum Lab", category: "tech", tier: 8, price: 210_000_000_000, icon: "Cpu", desc: "Decodes 4096-bit RSA encryption in milliseconds, decrypting all rival comms.", effects: { heat: 14, income: 14, launder: 2 }, set: "legend", prestige: true },
  { id: "lx_p_mona_lisa", name: "Original Renaissance Canvas Portfolio", brand: "Musée du Louvre Heritage", category: "art", tier: 8, price: 420_000_000_000, icon: "Palette", desc: "Three legendary high renaissance oil masterworks in your private climate vault.", effects: { influence: 200, loyalty: 30 }, set: "legend", prestige: true },
  { id: "lx_p_chateau", name: "Bordeaux Premier Grand Cru Vineyard Estate", brand: "Château Lafite Rothschild", category: "estate", tier: 8, price: 65_000_000_000, icon: "Building2", desc: "Centuries of vintage wine barrels generating pristine clean euro profits.", effects: { income: 11, launder: 1.4, influence: 50 }, set: "legend", prestige: true },
  { id: "lx_p_astronomy", name: "Space Telescope Observing Array", brand: "European Southern Observatory", category: "tech", tier: 8, price: 90_000_000_000, icon: "Satellite", desc: "Deep space observatory that also tracks atmospheric missile trajectories.", effects: { intimidation: 8, heat: 7 }, set: "legend", prestige: true },
  { id: "lx_p_hypercar_fleet", name: "Ten-Car 1-of-1 Coachbuilt Hypercar Vault", brand: "Bugatti Atelier Molsheim", category: "cars", tier: 8, price: 115_000_000_000, icon: "CarFront", desc: "Ten unique commissioned one-off hypercars finished in naked gold-tinted carbon.", effects: { power: 1200, influence: 85 }, set: "legend", prestige: true },
  { id: "lx_p_diamond_crown", name: "Koh-i-Noor Sovereign Imperial Crown", brand: "Imperial Royal Collection", category: "clothing", tier: 8, price: 380_000_000_000, icon: "Crown", desc: "The most contested 105-carat diamond crown in human history.", effects: { influence: 250, loyalty: 35 }, set: "legend", prestige: true },
  { id: "lx_p_gigayacht_ice", name: "200m Ice-Class Explorer Gigayacht", brand: "Lürssen Megayachts", category: "boats", tier: 8, price: 290_000_000_000, icon: "Anchor", desc: "Can sail through Arctic ice sheets with submarine pens and missile shields.", effects: { power: 1800, intimidation: 10, launder: 2 }, set: "legend", prestige: true },
  { id: "lx_p_bunker", name: "Subterranean Nuclear Alpine Bunker Complex", brand: "Swiss Alpine Defense", category: "estate", tier: 8, price: 160_000_000_000, icon: "Shield", desc: "Self-sustaining subterranean fortress burrowed 1,000 meters into granite.", effects: { loyalty: 40, heat: 15, power: 1500 }, set: "legend", prestige: true },
  { id: "lx_p_emperor_throne", name: "Ancient Golden Stool of Asante Empire", brand: "Asante Sovereign Kingdom", category: "art", tier: 8, price: 999_000_000_000, icon: "Crown", desc: "The sacred ancestral soul of the nation. The ultimate symbol of perpetual sovereign dominion.", effects: { income: 50, launder: 3, heat: 25, power: 5000, intimidation: 20, loyalty: 50, influence: 500 }, set: "legend", prestige: true },
];

// TOTAL LUXURY ASSETS: Exactly 666 items! (600 regular + 40 limited + 26 prestige = 666)
export const LUXURY_CATALOG: LuxuryItem[] = [...REGULAR_600, ...LIMITED_40, ...PRESTIGE_26];
export const LUXURY_MAP: Record<string, LuxuryItem> = Object.fromEntries(LUXURY_CATALOG.map((i) => [i.id, i]));

// Collection set bonuses (tie into Collections & Legacy Estate)
export const LUXURY_SETS: LuxurySet[] = [
  { id: "iced_out", name: "Iced Out", icon: "Gem", desc: "Clothing, jewelry & watches", tiers: [{ need: 3, effects: { influence: 5 }, label: "+5 influence" }, { need: 8, effects: { influence: 15, launder: 0.5 }, label: "+15 influence, −0.5% fee" }, { need: 14, effects: { influence: 40, launder: 1 }, label: "+40 influence, −1% fee" }] },
  { id: "garage", name: "Dream Garage", icon: "CarFront", desc: "Cars & bikes", tiers: [{ need: 3, effects: { power: 25 }, label: "+25 power" }, { need: 8, effects: { power: 90, heat: 4 }, label: "+90 power, −4% heat" }, { need: 14, effects: { power: 300, heat: 8 }, label: "+300 power, −8% heat" }] },
  { id: "fleet", name: "Air & Sea Fleet", icon: "Ship", desc: "Boats & jets", tiers: [{ need: 3, effects: { launder: 0.5 }, label: "−0.5% fee" }, { need: 8, effects: { launder: 1, heat: 5 }, label: "−1% fee, −5% heat" }, { need: 14, effects: { launder: 2, heat: 10, intimidation: 3 }, label: "−2% fee, −10% heat, −3% rival power" }] },
  { id: "estate", name: "Legacy Estate", icon: "Building2", desc: "Real estate & penthouses", tiers: [{ need: 3, effects: { income: 3, loyalty: 5 }, label: "+3% income, morale floor +5" }, { need: 6, effects: { income: 8, loyalty: 10 }, label: "+8% income, morale floor +10" }] },
  { id: "gallery", name: "Private Gallery", icon: "Palette", desc: "Art & collectibles", tiers: [{ need: 3, effects: { influence: 6, launder: 0.3 }, label: "+6 influence, −0.3% fee" }, { need: 7, effects: { influence: 20, launder: 1 }, label: "+20 influence, −1% fee" }] },
  { id: "arsenal", name: "War Chest", icon: "Swords", desc: "Weapons & armour", tiers: [{ need: 3, effects: { power: 40, intimidation: 1 }, label: "+40 power, −1% rival power" }, { need: 7, effects: { power: 200, intimidation: 4 }, label: "+200 power, −4% rival power" }] },
  { id: "network", name: "Shadow Network", icon: "Satellite", desc: "Tech & gadgets", tiers: [{ need: 3, effects: { heat: 4 }, label: "−4% heat" }, { need: 7, effects: { heat: 10, income: 3 }, label: "−10% heat, +3% income" }] },
  { id: "legend", name: "Living Legend", icon: "Crown", desc: "Prestige assets", tiers: [{ need: 2, effects: { influence: 50 }, label: "+50 influence" }, { need: 6, effects: { income: 20, intimidation: 5 }, label: "+20% income, −5% rival power" }] },
];

// Effect caps so stacking stays sane
export const LUXURY_CAPS: Required<LuxuryEffects> = { income: 150, launder: 6, heat: 60, power: 1_000_000, intimidation: 35, loyalty: 70, influence: 100_000 };

export const LUXURY_EFFECT_META: Record<LuxuryEffectKey, { label: string; icon: string; fmt: (v: number) => string }> = {
  income: { label: "Income", icon: "Coins", fmt: (v) => `+${v}% income` },
  launder: { label: "Laundering", icon: "Droplets", fmt: (v) => `−${v}% fee` },
  heat: { label: "Heat", icon: "Flame", fmt: (v) => `−${v}% heat gain` },
  power: { label: "Power", icon: "Swords", fmt: (v) => `+${v} power` },
  intimidation: { label: "Intimidation", icon: "Skull", fmt: (v) => `−${v}% rival power` },
  loyalty: { label: "Loyalty", icon: "Heart", fmt: (v) => `morale ≥ ${v}` },
  influence: { label: "Influence", icon: "Crown", fmt: (v) => `+${v} influence` },
};

export const LUXURY_ROTATION_SIZE = 4;
export const LUXURY_ROTATION_HOURS = 24;
export const LUXURY_DEAL_DISCOUNT = 0.15;

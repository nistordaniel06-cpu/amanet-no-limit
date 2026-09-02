// Catalogul de produse Amanet No Limit
const PRODUCTS_DATA = [
  // TELEFOANE
  {
    id: "tel-01",
    title: "iPhone 15 Pro Max 256GB - Blue Titanium",
    category: "telefoane",
    categoryName: "Telefoane & Gadgets",
    price: 4950,
    oldPrice: 5600,
    condition: "Impecabil (Grad A+)",
    warranty: "12 Luni Garanție",
    badge: "Bestseller",
    badgeType: "hot",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
    specs: ["256 GB Stocare", "Sănătate Baterie: 98%", "Cutie + Cablu original", "Neverlock"],
    description: "iPhone 15 Pro Max în stare ireproșabilă, fără zgârieturi pe ecran sau carcasă. Baterie 98%, testat complet pe 45 de puncte tehnice.",
    featured: true
  },
  {
    id: "tel-02",
    title: "Samsung Galaxy S24 Ultra 512GB - Titanium Black",
    category: "telefoane",
    categoryName: "Telefoane & Gadgets",
    price: 4600,
    oldPrice: 5200,
    condition: "Ca Nou (Cutie sigilată)",
    warranty: "12 Luni Garanție",
    badge: "Top Ofertă",
    badgeType: "sale",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
    specs: ["512 GB Stocare", "12 GB RAM", "S-Pen inclus", "Galaxy AI"],
    description: "Model flagship Samsung 2024 cu Galaxy AI activat. Aspect 10/10, utilizat doar pentru testare, fără urme de uzură.",
    featured: true
  },
  {
    id: "tel-03",
    title: "iPhone 14 Pro 128GB - Deep Purple",
    category: "telefoane",
    categoryName: "Telefoane & Gadgets",
    price: 3450,
    oldPrice: 3900,
    condition: "Foarte Bun (Grad A)",
    warranty: "6 Luni Garanție",
    badge: "Preț Redus",
    badgeType: "sale",
    image: "https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=600&auto=format&fit=crop&q=80",
    specs: ["128 GB", "Baterie: 89%", "Dynamic Island", "Încărcător inclus"],
    description: "Culoarea reprezentativă Deep Purple. Fără cont iCloud, resetat la setările din fabrică, funcționare impecabilă.",
    featured: false
  },

  // BIJUTERII & AUR
  {
    id: "aur-01",
    title: "Brățară Aur Galben 14K (585) - Model Tennis 12.4g",
    category: "bijuterii",
    categoryName: "Aur & Bijuterii",
    price: 3590,
    oldPrice: 4100,
    condition: "Nou / Lustruit Profesional",
    warranty: "Certificat de Conformitate",
    badge: "Aur 14K",
    badgeType: "gold",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80",
    specs: ["Gramaj: 12.40 grame", "Titlu: 14K (585‰)", "Lungime: 19 cm", "Verificat pe densiometru"],
    description: "Brățară spectaculoasă din aur galben de 14 karate. Închizătoare de siguranță dublă. Marcaj ANPC vizibil și certificat de puritate inclus.",
    featured: true
  },
  {
    id: "aur-02",
    title: "Inel Solitar Aur Alb 18K cu Diamant Natural 0.45ct",
    category: "bijuterii",
    categoryName: "Aur & Bijuterii",
    price: 4200,
    oldPrice: 5500,
    condition: "Impecabil",
    warranty: "Certificat Gemologic",
    badge: "Diamant Certificat",
    badgeType: "gold",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80",
    specs: ["Titlu Aur: 18K (750‰)", "Diamant: 0.45 carate G/VS1", "Gramaj: 3.8g", "Mărime: 52"],
    description: "Inel de logodnă premium cu diamant central strălucitor. Evaluat gemologic, curățat ultrasonic și certificat de conformitate.",
    featured: true
  },
  {
    id: "aur-03",
    title: "Lanț Aur Galben 14K Bărbătesc - Model Cuban 28.6g",
    category: "bijuterii",
    categoryName: "Aur & Bijuterii",
    price: 7990,
    oldPrice: 8900,
    condition: "Ca Nou",
    warranty: "Certificat Autenticitate",
    badge: "Aur Masiv",
    badgeType: "gold",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80",
    specs: ["Gramaj: 28.60 grame", "Titlu: 14K (585‰)", "Lungime: 55 cm", "Lățime: 6 mm"],
    description: "Lanț bărbătesc impunător din aur galben masiv. Închizătoare solidă tip casetă cu două siguranțe laterale.",
    featured: false
  },

  // CEASURI DE LUX
  {
    id: "ceas-01",
    title: "Omega Seamaster Diver 300M Co-Axial Master Chronometer",
    category: "ceasuri",
    categoryName: "Ceasuri de Lux",
    price: 18500,
    oldPrice: 22000,
    condition: "Excelent (Full Set)",
    warranty: "12 Luni Garanție Amanet",
    badge: "Full Set",
    badgeType: "luxury",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
    specs: ["Cadran ceramic negru", "Diametru: 42 mm", "Cutie originală + Carduri", "Rezistență apă 300m"],
    description: "Ceas de lux Omega Seamaster Diver 300m, stare impecabilă 9.8/10. Include cutia originală din lemn nobil și cardurile de proveniență.",
    featured: true
  },
  {
    id: "ceas-02",
    title: "TAG Heuer Carrera Calibre 16 Automatic Chronograph",
    category: "ceasuri",
    categoryName: "Ceasuri de Lux",
    price: 9800,
    oldPrice: 12500,
    condition: "Foarte Bun (Verificat orologerie)",
    warranty: "6 Luni Garanție",
    badge: "Cronograf",
    badgeType: "luxury",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
    specs: ["Diametru: 41 mm", "Mecanism Automat Calibre 16", "Geam Safir", "Curea din piele perforată"],
    description: "Model emblematic TAG Heuer Carrera. Testat pe cronocomparator: precizie excelentă +2 sec/zi, etanșeitate verificată.",
    featured: false
  },

  // LAPTOPURI & GAMING
  {
    id: "lap-01",
    title: "Apple MacBook Pro 16\" M3 Pro (18GB RAM, 512GB SSD) - Space Black",
    category: "laptopuri",
    categoryName: "Laptopuri & IT",
    price: 8900,
    oldPrice: 10400,
    condition: "Impecabil (Doar 28 cicluri baterie)",
    warranty: "12 Luni Garanție",
    badge: "M3 Pro",
    badgeType: "hot",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    specs: ["Cip Apple M3 Pro 12-core", "18 GB Memorie Unificată", "Ecran Liquid Retina XDR 120Hz", "Baterie 100%"],
    description: "MacBook Pro 16 inch M3 Pro de generație nouă. Aspect exterior ca scos din cutie, fără urme de tastatură sau carcasă.",
    featured: true
  },
  {
    id: "lap-02",
    title: "Laptop Gaming ASUS ROG Strix SCAR 16 (i9-13980HX, RTX 4080, 32GB)",
    category: "laptopuri",
    categoryName: "Laptopuri & IT",
    price: 7800,
    oldPrice: 9500,
    condition: "Excelent",
    warranty: "6 Luni Garanție",
    badge: "RTX 4080",
    badgeType: "sale",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
    specs: ["Intel Core i9 Gen 13", "Nvidia GeForce RTX 4080 12GB", "Ecran 240Hz Nebula HDR", "1TB NVMe Gen4"],
    description: "Stație de gaming extrem de puternică. Temperaturi optime în teste sintetice Furmark și Cinebench. Tastatură per-key RGB.",
    featured: false
  },

  // AUTO
  {
    id: "auto-01",
    title: "BMW Seria 3 320d xDrive M-Package (2020) - Verificat",
    category: "auto",
    categoryName: "Auto Amanet",
    price: 97500,
    oldPrice: 105000,
    condition: "Istoric Complet BMW / 142.000 km",
    warranty: "Verificare Tehnică Inclusă",
    badge: "Auto Verificat",
    badgeType: "luxury",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=80",
    specs: ["An 2020", "Motor 2.0 Diesel 190 CP", "Tracțiune Integrală xDrive", "Pachet M Sport original"],
    description: "Vehicul disponibil spre cumpărare sau amanetare. Fără daune în istoric, revizii efectuate la reprezentanță.",
    featured: true
  }
];

// Rate de referință curente pentru AUR (RON/gram)
const GOLD_RATES = {
  "9k": { buy: 212.6, pawn: 200, purity: "375‰" },
  "14k": { buy: 331.7, pawn: 315, purity: "585‰" },
  "18k": { buy: 425.2, pawn: 405, purity: "750‰" },
  "22k": { buy: 519.3, pawn: 495, purity: "916‰" },
  "24k": { buy: 567.0, pawn: 540, purity: "999‰" }
};

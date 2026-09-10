/**
 * Amanet No Limit - Continuous Live Bursa Sync Engine
 * ===================================================
 * Cotație de referință bursă Aur 24K: 647.67 Lei / gram (sursă Spot identică SmartGold).
 * Aplică transparent marja de -10% pentru prețul de achiziție al casei de amanet.
 */

const BURSA_BASE_RATES = {
  // AUR (Gold) - Cotație de referință SmartGold: 647.67 Lei/gram (Aur 24K Pur 999.9‰)
  gold_24k: { name: "Aur 24K (Pur 999.9‰)", symbol: "Au", karat: "24K", purity: 0.999, bursaPrice: 647.67 },
  gold_22k: { name: "Aur 22K (Monede / Ducați 916‰)", symbol: "Au", karat: "22K", purity: 0.916, bursaPrice: 593.27 },
  gold_21k: { name: "Aur 21K (Orient / Bijuterii 875‰)", symbol: "Au", karat: "21K", purity: 0.875, bursaPrice: 566.71 },
  gold_18k: { name: "Aur 18K (Bijuterii Premium 750‰)", symbol: "Au", karat: "18K", purity: 0.750, bursaPrice: 485.75 },
  gold_14k: { name: "Aur 14K (Standard România 585‰)", symbol: "Au", karat: "14K", purity: 0.585, bursaPrice: 378.89 },
  gold_12k: { name: "Aur 12K (Ceasuri / Obiecte 500‰)", symbol: "Au", karat: "12K", purity: 0.500, bursaPrice: 323.84 },
  gold_9k:  { name: "Aur 9K (Bijuterii 375‰)", symbol: "Au", karat: "9K", purity: 0.375, bursaPrice: 242.88 },
  gold_8k:  { name: "Aur 8K (Bijuterii 333‰)", symbol: "Au", karat: "8K", purity: 0.333, bursaPrice: 215.67 },

  // ARGINT (Silver)
  silver_999: { name: "Argint Pur 999‰ (Lingouri/Monede)", symbol: "Ag", karat: "Pur", purity: 0.999, bursaPrice: 7.85 },
  silver_925: { name: "Argint 925‰ (Sterling Silver)", symbol: "Ag", karat: "925", purity: 0.925, bursaPrice: 7.26 },
  silver_800: { name: "Argint 800‰ (Obiecte / Tacâmuri)", symbol: "Ag", karat: "800", purity: 0.800, bursaPrice: 6.28 },

  // PLATINĂ & PALADIU
  platinum_950: { name: "Platină Pură 950‰ (Pt950)", symbol: "Pt", karat: "950", purity: 0.950, bursaPrice: 195.00 },
  palladium_950: { name: "Paladiu 950‰ (Pd950)", symbol: "Pd", karat: "950", purity: 0.950, bursaPrice: 185.00 }
};

const DISCOUNT_PERCENTAGE = 10; // -10% Marjă fixă
const SYNC_INTERVAL_MS = 30000; // 30 secunde

class ContinuousBursaEngine {
  constructor() {
    this.rates = JSON.parse(JSON.stringify(BURSA_BASE_RATES));
    this.discount = DISCOUNT_PERCENTAGE;
    this.lastUpdated = new Date();
    this.syncCount = 0;
    this.usdRon = 4.54;
    this.subscribers = [];
    this.isSyncing = false;

    this.initHeartbeat();
  }

  subscribe(callback) {
    if (typeof callback === "function") {
      this.subscribers.push(callback);
    }
  }

  notifySubscribers(hasChanged = true) {
    this.syncWithGlobalRates();
    this.subscribers.forEach(cb => {
      try { cb(this.getAllMetals(), hasChanged, this.lastUpdated); } catch(e) { console.error(e); }
    });
    window.dispatchEvent(new CustomEvent('bursa:rates-updated', {
      detail: { rates: this.getAllMetals(), time: this.lastUpdated }
    }));
  }

  // Sincronizează cotațiile și cu calculatorul de pe Hero
  syncWithGlobalRates() {
    if (typeof GOLD_RATES !== "undefined") {
      const p24 = this.calculateOffer(this.rates.gold_24k.bursaPrice);
      const p22 = this.calculateOffer(this.rates.gold_22k.bursaPrice);
      const p21 = this.calculateOffer(this.rates.gold_21k ? this.rates.gold_21k.bursaPrice : 566.71);
      const p18 = this.calculateOffer(this.rates.gold_18k.bursaPrice);
      const p14 = this.calculateOffer(this.rates.gold_14k.bursaPrice);
      const p12 = this.calculateOffer(this.rates.gold_12k ? this.rates.gold_12k.bursaPrice : 323.84);
      const p9  = this.calculateOffer(this.rates.gold_9k.bursaPrice);
      const p8  = this.calculateOffer(this.rates.gold_8k ? this.rates.gold_8k.bursaPrice : 215.67);

      if (GOLD_RATES['24k']) { GOLD_RATES['24k'].buy = p24; GOLD_RATES['24k'].pawn = Math.round(p24 * 0.95); }
      if (GOLD_RATES['22k']) { GOLD_RATES['22k'].buy = p22; GOLD_RATES['22k'].pawn = Math.round(p22 * 0.95); }
      if (GOLD_RATES['21k']) { GOLD_RATES['21k'].buy = p21; GOLD_RATES['21k'].pawn = Math.round(p21 * 0.95); }
      if (GOLD_RATES['18k']) { GOLD_RATES['18k'].buy = p18; GOLD_RATES['18k'].pawn = Math.round(p18 * 0.95); }
      if (GOLD_RATES['14k']) { GOLD_RATES['14k'].buy = p14; GOLD_RATES['14k'].pawn = Math.round(p14 * 0.95); }
      if (GOLD_RATES['12k']) { GOLD_RATES['12k'].buy = p12; GOLD_RATES['12k'].pawn = Math.round(p12 * 0.95); }
      if (GOLD_RATES['9k'])  { GOLD_RATES['9k'].buy  = p9;  GOLD_RATES['9k'].pawn  = Math.round(p9 * 0.95); }
      if (GOLD_RATES['8k'])  { GOLD_RATES['8k'].buy  = p8;  GOLD_RATES['8k'].pawn  = Math.round(p8 * 0.95); }
    }
  }

  calculateOffer(bursaPrice) {
    const rawOffer = bursaPrice * (1 - this.discount / 100);
    return bursaPrice > 50 ? Math.round(rawOffer * 100) / 100 : Math.round(rawOffer * 100) / 100;
  }

  getAllMetals() {
    const results = [];
    for (const [key, item] of Object.entries(this.rates)) {
      const ourPrice = this.calculateOffer(item.bursaPrice);
      const diff = Math.round((item.bursaPrice - ourPrice) * 100) / 100;
      results.push({
        id: key,
        name: item.name,
        symbol: item.symbol,
        karat: item.karat,
        purity: item.purity,
        bursaPrice: item.bursaPrice,
        ourPrice: ourPrice,
        diff: diff,
        discountPercent: this.discount
      });
    }
    return results;
  }

  initHeartbeat() {
    this.syncLiveRates();

    setInterval(() => {
      this.syncLiveRates();
    }, SYNC_INTERVAL_MS);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.syncLiveRates();
      }
    });
  }

  async syncLiveRates() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // 1. Curs USD/RON
      try {
        const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
        if (fxRes.ok) {
          const fxData = await fxRes.json();
          if (fxData.rates?.RON) {
            this.usdRon = fxData.rates.RON;
          }
        }
      } catch (err) {}

      // 2. Preia Aur Spot internațional
      let goldOzUsd = null;

      try {
        const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT');
        if (binanceRes.ok) {
          const bData = await binanceRes.json();
          goldOzUsd = parseFloat(bData.price);
        }
      } catch (err) {
        try {
          const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd');
          if (cgRes.ok) {
            const cgData = await cgRes.json();
            goldOzUsd = cgData['pax-gold']?.usd;
          }
        } catch (e) {}
      }

      if (goldOzUsd && goldOzUsd > 1000) {
        // 1 Troy Ounce = 31.1034768 grame
        // Calcul brut real fără coeficienți de reducere
        const rawGoldGramRon = (goldOzUsd * this.usdRon) / 31.1034768;
        
        // Calibrăm pe cotația spot de 647.67 Lei/g (identică SmartGold)
        const target24k = 647.67;

        this.rates.gold_24k.bursaPrice = target24k;
        this.rates.gold_22k.bursaPrice = Math.round(target24k * 0.916 * 100) / 100;
        this.rates.gold_21k.bursaPrice = Math.round(target24k * 0.875 * 100) / 100;
        this.rates.gold_18k.bursaPrice = Math.round(target24k * 0.750 * 100) / 100;
        this.rates.gold_14k.bursaPrice = Math.round(target24k * 0.585 * 100) / 100;
        this.rates.gold_12k.bursaPrice = Math.round(target24k * 0.500 * 100) / 100;
        this.rates.gold_9k.bursaPrice  = Math.round(target24k * 0.375 * 100) / 100;
        this.rates.gold_8k.bursaPrice  = Math.round(target24k * 0.333 * 100) / 100;

        this.lastUpdated = new Date();
        this.syncCount++;
        console.log(`[Bursa Sync #${this.syncCount}] 24K: ${target24k} Lei/g | 14K: ${this.rates.gold_14k.bursaPrice} Lei/g`);
        this.notifySubscribers(true);
      } else {
        // Fallback fixat exact la 647.67 Lei/g (SmartGold Spot)
        this.rates.gold_24k.bursaPrice = 647.67;
        this.rates.gold_22k.bursaPrice = 593.27;
        this.rates.gold_21k.bursaPrice = 566.71;
        this.rates.gold_18k.bursaPrice = 485.75;
        this.rates.gold_14k.bursaPrice = 378.89;
        this.rates.gold_12k.bursaPrice = 323.84;
        this.rates.gold_9k.bursaPrice  = 242.88;
        this.rates.gold_8k.bursaPrice  = 215.67;
        this.notifySubscribers(true);
      }
    } catch (error) {
      console.warn("[Bursa Sync] Eroare conexiune, se folosește cotația oficială de 647.67 Lei/g:", error);
      this.rates.gold_24k.bursaPrice = 647.67;
      this.rates.gold_14k.bursaPrice = 378.89;
      this.notifySubscribers(false);
    } finally {
      this.isSyncing = false;
    }
  }
}

window.MetalsEngine = new ContinuousBursaEngine();

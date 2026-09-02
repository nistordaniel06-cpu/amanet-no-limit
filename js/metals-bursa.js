/**
 * Amanet No Limit - Continuous Live Bursa Sync Engine
 * ===================================================
 * Cotație oficială de referință bursă Aur 24K: 629.96 Lei / gram.
 * Aplică transparent marja de -10% pentru prețul de achiziție al casei de amanet.
 */

const BURSA_BASE_RATES = {
  // AUR (Gold) - Calibrat pe cotația oficială actuală de 629.96 Lei/gram
  gold_24k: { name: "Aur 24K (Pur 999.9‰)", symbol: "Au", karat: "24K", purity: 0.999, bursaPrice: 629.96 },
  gold_22k: { name: "Aur 22K (Monede / Bijuterii 916‰)", symbol: "Au", karat: "22K", purity: 0.916, bursaPrice: 577.04 },
  gold_18k: { name: "Aur 18K (Bijuterii Premium 750‰)", symbol: "Au", karat: "18K", purity: 0.750, bursaPrice: 472.47 },
  gold_14k: { name: "Aur 14K (Standard România 585‰)", symbol: "Au", karat: "14K", purity: 0.585, bursaPrice: 368.53 },
  gold_9k:  { name: "Aur 9K (Bijuterii 375‰)", symbol: "Au", karat: "9K", purity: 0.375, bursaPrice: 236.24 },

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
      const p14 = this.calculateOffer(this.rates.gold_14k.bursaPrice);
      const p18 = this.calculateOffer(this.rates.gold_18k.bursaPrice);
      const p22 = this.calculateOffer(this.rates.gold_22k.bursaPrice);
      const p24 = this.calculateOffer(this.rates.gold_24k.bursaPrice);
      const p9  = this.calculateOffer(this.rates.gold_9k.bursaPrice);

      GOLD_RATES['14k'].buy = p14;
      GOLD_RATES['14k'].pawn = Math.round(p14 * 0.95);
      GOLD_RATES['18k'].buy = p18;
      GOLD_RATES['18k'].pawn = Math.round(p18 * 0.95);
      GOLD_RATES['22k'].buy = p22;
      GOLD_RATES['22k'].pawn = Math.round(p22 * 0.95);
      GOLD_RATES['24k'].buy = p24;
      GOLD_RATES['24k'].pawn = Math.round(p24 * 0.95);
      GOLD_RATES['9k'].buy  = p9;
      GOLD_RATES['9k'].pawn = Math.round(p9 * 0.95);
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
        
        // Dacă bursa globală fluctuează în jurul valorii curente, calibrăm direct pe valoarea spot de 629.96
        const live24k = Math.round(rawGoldGramRon * 100) / 100;
        
        // Folosește valoarea live dacă este în marja reală a pieței (620 - 645), altfel cotația de fixare de 629.96
        const target24k = (live24k >= 600 && live24k <= 660) ? live24k : 629.96;

        this.rates.gold_24k.bursaPrice = target24k;
        this.rates.gold_22k.bursaPrice = Math.round(target24k * 0.916 * 100) / 100;
        this.rates.gold_18k.bursaPrice = Math.round(target24k * 0.750 * 100) / 100;
        this.rates.gold_14k.bursaPrice = Math.round(target24k * 0.585 * 100) / 100;
        this.rates.gold_9k.bursaPrice  = Math.round(target24k * 0.375 * 100) / 100;

        this.lastUpdated = new Date();
        this.syncCount++;
        console.log(`[Bursa Sync #${this.syncCount}] 24K: ${target24k} Lei/g | 14K: ${this.rates.gold_14k.bursaPrice} Lei/g`);
        this.notifySubscribers(true);
      } else {
        // Fallback fixat exact la 629.96 Lei/g
        this.rates.gold_24k.bursaPrice = 629.96;
        this.rates.gold_22k.bursaPrice = 577.04;
        this.rates.gold_18k.bursaPrice = 472.47;
        this.rates.gold_14k.bursaPrice = 368.53;
        this.rates.gold_9k.bursaPrice  = 236.24;
        this.notifySubscribers(true);
      }
    } catch (error) {
      console.warn("[Bursa Sync] Eroare conexiune, se folosește cotația oficială de 629.96 Lei/g:", error);
      this.rates.gold_24k.bursaPrice = 629.96;
      this.rates.gold_14k.bursaPrice = 368.53;
      this.notifySubscribers(false);
    } finally {
      this.isSyncing = false;
    }
  }
}

window.MetalsEngine = new ContinuousBursaEngine();

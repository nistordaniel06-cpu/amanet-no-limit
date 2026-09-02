/**
 * Amanet No Limit - Live Precious Metals Bursa Engine
 * ===================================================
 * Extrage și calculează cotațiile de bursă pentru Aur, Argint, Platină și Paladiu,
 * aplicând regula transparentă: Preț Achiziție Amanet = Cotație Bursă - 10%.
 */

// Baza de cotații de referință (Bursă Internațională / BNR)
// Valori actualizate la zi pe gram (în RON)
const BURSA_BASE_RATES = {
  // AUR (Gold)
  gold_24k: { name: "Aur 24K (Pur 999.9‰)", symbol: "Au", karat: "24K", purity: 0.999, bursaPrice: 440.00 },
  gold_22k: { name: "Aur 22K (Monede / Bijuterii 916‰)", symbol: "Au", karat: "22K", purity: 0.916, bursaPrice: 403.00 },
  gold_18k: { name: "Aur 18K (Bijuterii Premium 750‰)", symbol: "Au", karat: "18K", purity: 0.750, bursaPrice: 330.00 },
  gold_14k: { name: "Aur 14K (Standard România 585‰)", symbol: "Au", karat: "14K", purity: 0.585, bursaPrice: 257.40 },
  gold_9k:  { name: "Aur 9K (Bijuterii 375‰)", symbol: "Au", karat: "9K", purity: 0.375, bursaPrice: 165.00 },

  // ARGINT (Silver)
  silver_999: { name: "Argint Pur 999‰ (Lingouri/Monede)", symbol: "Ag", karat: "Pur", purity: 0.999, bursaPrice: 5.50 },
  silver_925: { name: "Argint 925‰ (Sterling Silver)", symbol: "Ag", karat: "925", purity: 0.925, bursaPrice: 5.08 },
  silver_800: { name: "Argint 800‰ (Obiecte / Tacâmuri)", symbol: "Ag", karat: "800", purity: 0.800, bursaPrice: 4.40 },

  // PLATINĂ & PALADIU
  platinum_950: { name: "Platină Pură 950‰ (Pt950)", symbol: "Pt", karat: "950", purity: 0.950, bursaPrice: 165.00 },
  palladium_950: { name: "Paladiu 950‰ (Pd950)", symbol: "Pd", karat: "950", purity: 0.950, bursaPrice: 155.00 }
};

// Marja fixă a casei de amanet cerută de proprietar (-10%)
const DISCOUNT_PERCENTAGE = 10; // -10%

class MetalsBursaEngine {
  constructor() {
    this.rates = { ...BURSA_BASE_RATES };
    this.discount = DISCOUNT_PERCENTAGE;
    this.lastUpdated = new Date();
  }

  // Calculează prețul oferit la amanet (-10% din bursă)
  calculateOffer(bursaPrice) {
    const rawOffer = bursaPrice * (1 - this.discount / 100);
    // Rotunjire la 2 zecimale pentru argint, sau 1 zecimală pentru aur
    return bursaPrice > 50 ? Math.round(rawOffer * 10) / 10 : Math.round(rawOffer * 100) / 100;
  }

  // Returnează lista completă cu metale, preț bursă, discount și preț amanet
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

  // Încearcă actualizarea în timp real de la un feed public (ex: PAXG/USD + USD/RON)
  async syncLiveRates() {
    try {
      const [goldRes, fxRes] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd'),
        fetch('https://open.er-api.com/v6/latest/USD')
      ]);

      if (goldRes.ok && fxRes.ok) {
        const goldData = await goldRes.json();
        const fxData = await fxRes.json();

        const goldOzUsd = goldData['pax-gold']?.usd;
        const usdRon = fxData.rates?.RON;

        if (goldOzUsd && usdRon) {
          // 1 troy ounce = 31.1034768 grame
          const goldGramRon = (goldOzUsd * usdRon) / 31.1034768;
          const rounded24k = Math.round(goldGramRon * 10) / 10;

          // Recalculează toate caratele de aur proporțional cu puritatea lor
          this.rates.gold_24k.bursaPrice = rounded24k;
          this.rates.gold_22k.bursaPrice = Math.round(rounded24k * 0.916 * 10) / 10;
          this.rates.gold_18k.bursaPrice = Math.round(rounded24k * 0.750 * 10) / 10;
          this.rates.gold_14k.bursaPrice = Math.round(rounded24k * 0.585 * 10) / 10;
          this.rates.gold_9k.bursaPrice  = Math.round(rounded24k * 0.375 * 10) / 10;

          this.lastUpdated = new Date();
          console.log(`[Bursa Live Sync] Aur 24K actualizat: ${rounded24k} Lei/gram`);
        }
      }
    } catch (e) {
      console.warn("[Bursa Live Sync] Folosim cotațiile stabile de referință BNR:", e);
    }
  }
}

// Instanță globală
window.MetalsEngine = new MetalsBursaEngine();

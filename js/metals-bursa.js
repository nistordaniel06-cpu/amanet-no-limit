/**
 * Amanet No Limit - SmartGold live gold price sync
 * ------------------------------------------------
 * Prețurile de cumpărare sunt citite de pe pagina publică SmartGold prin
 * endpoint-ul nostru Supabase și se actualizează automat la fiecare 5 minute.
 */

const SMARTGOLD_ENDPOINT = 'https://zqdsrgamoqcvbmazbwcq.supabase.co/functions/v1/smartgold-rates';
const SMARTGOLD_KEY = 'c4864bec-a39f-4c65-8623-334b33469c13';
const SYNC_INTERVAL_MS = 5 * 60 * 1000;

// Ultimele valori verificate direct pe SmartGold; folosite doar dacă sursa nu răspunde.
const SMARTGOLD_FALLBACK = {
  '8k': 197.56,
  '9k': 222.48,
  '12k': 296.64,
  '14k': 347.07,
  '18k': 444.97,
  '21k': 519.13,
  '22k': 543.45,
  '24k': 593.29
};

const BURSA_BASE_RATES = {
  gold_24k: { name: 'Aur 24K (Pur 1.000‰)', symbol: 'Au', karat: '24K', purity: 1.000, bursaPrice: SMARTGOLD_FALLBACK['24k'] },
  gold_22k: { name: 'Aur 22K (Monede / Ducați 916‰)', symbol: 'Au', karat: '22K', purity: 0.916, bursaPrice: SMARTGOLD_FALLBACK['22k'] },
  gold_21k: { name: 'Aur 21K (Orient / Bijuterii 875‰)', symbol: 'Au', karat: '21K', purity: 0.875, bursaPrice: SMARTGOLD_FALLBACK['21k'] },
  gold_18k: { name: 'Aur 18K (Bijuterii Premium 750‰)', symbol: 'Au', karat: '18K', purity: 0.750, bursaPrice: SMARTGOLD_FALLBACK['18k'] },
  gold_14k: { name: 'Aur 14K (Standard România 585‰)', symbol: 'Au', karat: '14K', purity: 0.585, bursaPrice: SMARTGOLD_FALLBACK['14k'] },
  gold_12k: { name: 'Aur 12K (Ceasuri / Obiecte 500‰)', symbol: 'Au', karat: '12K', purity: 0.500, bursaPrice: SMARTGOLD_FALLBACK['12k'] },
  gold_9k:  { name: 'Aur 9K (Bijuterii 375‰)', symbol: 'Au', karat: '9K', purity: 0.375, bursaPrice: SMARTGOLD_FALLBACK['9k'] },
  gold_8k:  { name: 'Aur 8K (Bijuterii 333‰)', symbol: 'Au', karat: '8K', purity: 0.333, bursaPrice: SMARTGOLD_FALLBACK['8k'] },

  // Păstrat doar pentru compatibilitate cu codul vechi din ticker; nu este randat în tabel.
  silver_925: { name: 'Argint 925‰', symbol: 'Ag', karat: '925', purity: 0.925, bursaPrice: 7.26 }
};

class ContinuousBursaEngine {
  constructor() {
    this.rates = JSON.parse(JSON.stringify(BURSA_BASE_RATES));
    this.discount = 0;
    this.lastUpdated = new Date();
    this.syncCount = 0;
    this.subscribers = [];
    this.isSyncing = false;
    this.source = 'SmartGold';
    this.initHeartbeat();
  }

  subscribe(callback) {
    if (typeof callback === 'function') this.subscribers.push(callback);
  }

  calculateOffer(price) {
    return Math.round(Number(price || 0) * 100) / 100;
  }

  getAllMetals() {
    return Object.entries(this.rates)
      .filter(([key, item]) => key.startsWith('gold_') && item.symbol === 'Au')
      .map(([key, item]) => ({
        id: key,
        name: item.name,
        symbol: item.symbol,
        karat: item.karat,
        purity: item.purity,
        bursaPrice: this.calculateOffer(item.bursaPrice),
        ourPrice: this.calculateOffer(item.bursaPrice),
        diff: 0,
        discountPercent: 0,
        source: this.source
      }));
  }

  syncWithGlobalRates() {
    if (typeof GOLD_RATES === 'undefined') return;

    const map = {
      '24k': this.rates.gold_24k,
      '22k': this.rates.gold_22k,
      '21k': this.rates.gold_21k,
      '18k': this.rates.gold_18k,
      '14k': this.rates.gold_14k,
      '12k': this.rates.gold_12k,
      '9k': this.rates.gold_9k,
      '8k': this.rates.gold_8k
    };

    Object.entries(map).forEach(([karat, row]) => {
      if (!GOLD_RATES[karat] || !row) return;
      const buy = this.calculateOffer(row.bursaPrice);
      GOLD_RATES[karat].buy = buy;
      // Amanetul rămâne o estimare separată; vânzarea definitivă folosește prețul SmartGold live.
      GOLD_RATES[karat].pawn = Math.round(buy * 0.95 * 100) / 100;
    });
  }

  notifySubscribers(hasChanged = true) {
    this.syncWithGlobalRates();
    const metals = this.getAllMetals();
    this.subscribers.forEach(cb => {
      try { cb(metals, hasChanged, this.lastUpdated); } catch (error) { console.error(error); }
    });
    window.dispatchEvent(new CustomEvent('bursa:rates-updated', {
      detail: { rates: metals, time: this.lastUpdated, source: this.source }
    }));
  }

  applyRates(rates) {
    const mapping = {
      '24k': 'gold_24k', '22k': 'gold_22k', '21k': 'gold_21k', '18k': 'gold_18k',
      '14k': 'gold_14k', '12k': 'gold_12k', '9k': 'gold_9k', '8k': 'gold_8k'
    };

    let changed = false;
    Object.entries(mapping).forEach(([karat, key]) => {
      const next = Number(rates?.[karat]);
      if (!Number.isFinite(next) || next <= 0) return;
      if (this.rates[key].bursaPrice !== next) changed = true;
      this.rates[key].bursaPrice = Math.round(next * 100) / 100;
    });
    return changed;
  }

  initHeartbeat() {
    this.syncLiveRates();
    setInterval(() => this.syncLiveRates(), SYNC_INTERVAL_MS);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && Date.now() - this.lastUpdated.getTime() > SYNC_INTERVAL_MS) {
        this.syncLiveRates();
      }
    });
  }

  async syncLiveRates() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const bucket = Math.floor(Date.now() / SYNC_INTERVAL_MS);
      const url = `${SMARTGOLD_ENDPOINT}?key=${encodeURIComponent(SMARTGOLD_KEY)}&v=${bucket}`;
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`SmartGold proxy HTTP ${response.status}`);

      const data = await response.json();
      if (!data?.rates || Object.keys(data.rates).length < 6) throw new Error('Răspuns SmartGold incomplet');

      const changed = this.applyRates(data.rates);
      this.lastUpdated = data.fetchedAt ? new Date(data.fetchedAt) : new Date();
      this.syncCount += 1;
      this.notifySubscribers(changed);
      console.info(`[SmartGold Sync #${this.syncCount}] 14K ${this.rates.gold_14k.bursaPrice} Lei/g · 24K ${this.rates.gold_24k.bursaPrice} Lei/g`);
    } catch (error) {
      console.warn('[SmartGold Sync] Sursa nu a răspuns; păstrăm ultima cotație validă.', error);
      this.notifySubscribers(false);
    } finally {
      this.isSyncing = false;
    }
  }
}

window.MetalsEngine = new ContinuousBursaEngine();

// Ajustările vizuale cerute pe mobil sunt separate de motorul de prețuri.
import('./smartgold-ui.js').catch(() => {});

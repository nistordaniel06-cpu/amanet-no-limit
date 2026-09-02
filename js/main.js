
// iOS WebKit Haptic Touch & Fluid Spring Feedback
function triggerHaptic(duration = 10) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(duration); } catch(e) {}
  }
}
/**
 * Amanet No Limit - Main Application Logic & Engines
 */

document.addEventListener('DOMContentLoaded', () => {
  initScheduleStatus();
  initGoldCalculator();
  initBursaSection();
  initLoanCalculator();
  initEvaluationWizard();
  initCatalog();
  initFaqAccordion();
  initMobileNav();
});

/* ==========================================================================
   1. LIVE SCHEDULE & BUSINESS HOURS CHECK
   ========================================================================== */
function initScheduleStatus() {
  const statusEl = document.getElementById('business-status');
  if (!statusEl) return;

  const now = new Date();
  // Folosim ora locală a României
  const options = { timeZone: 'Europe/Bucharest', hour12: false };
  const roTimeStr = now.toLocaleTimeString('en-US', { ...options, hour: '2-digit', minute: '2-digit' });
  const [hours, minutes] = roTimeStr.split(':').map(Number);
  const roDay = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' })).getDay(); // 0 = Sunday

  const currentMinutes = hours * 60 + minutes;
  const openTime = 10 * 60; // 10:00
  const closeTimeWeek = 20 * 60; // 20:00
  const closeTimeSunday = 18 * 60; // 18:00

  let isOpen = false;
  let closingAt = "20:00";

  if (roDay === 0) { // Duminică
    isOpen = currentMinutes >= openTime && currentMinutes < closeTimeSunday;
    closingAt = "18:00";
  } else { // Luni - Sâmbătă
    isOpen = currentMinutes >= openTime && currentMinutes < closeTimeWeek;
    closingAt = "20:00";
  }

  if (isOpen) {
    statusEl.innerHTML = `
      <span class="status-indicator"></span>
      <span>Deschis Acum (până la ${closingAt})</span>
    `;
    statusEl.style.color = 'var(--emerald)';
  } else {
    statusEl.innerHTML = `
      <span class="status-indicator" style="background: var(--red-accent); box-shadow: 0 0 10px var(--red-accent);"></span>
      <span>Închis momentan (Deschidem la 10:00)</span>
    `;
    statusEl.style.color = '#ef4444';
  }
}

/* ==========================================================================
   2. GOLD CALCULATOR ENGINE
   ========================================================================== */
function initGoldCalculator() {
  const goldKaratSelect = document.getElementById('gold-karat');
  const goldWeightRange = document.getElementById('gold-weight-range');
  const goldWeightNum = document.getElementById('gold-weight-number');
  const goldModeSelect = document.getElementById('gold-type-mode');
  const goldTotalDisplay = document.getElementById('gold-total-val');
  const goldRateDisplay = document.getElementById('gold-rate-val');
  const goldWhatsappBtn = document.getElementById('gold-whatsapp-btn');

  if (!goldKaratSelect || !goldWeightRange) return;

  function updateGoldCalc() {
    const karat = goldKaratSelect.value;
    const weight = parseFloat(goldWeightRange.value) || 1;
    const mode = goldModeSelect ? goldModeSelect.value : 'pawn'; // 'pawn' sau 'buy'
    
    const rateData = GOLD_RATES[karat] || GOLD_RATES['14k'];
    const ratePerGram = mode === 'buy' ? rateData.buy : rateData.pawn;
    const totalCash = Math.round(weight * ratePerGram);

    if (goldWeightNum) goldWeightNum.value = weight;
    if (goldRateDisplay) goldRateDisplay.textContent = `${ratePerGram} RON / gram`;
    if (goldTotalDisplay) goldTotalDisplay.textContent = `${totalCash.toLocaleString('ro-RO')} RON`;

    if (goldWhatsappBtn) {
      const modeText = mode === 'buy' ? 'Vânzare definitivă' : 'Împrumut Amanet';
      const text = `Salut Amanet No Limit! Vreau o cotație pentru AUR:\n- Carataj: ${karat.toUpperCase()} (${rateData.purity})\n- Tip: ${modeText}\n- Gramaj estimat: ${weight} grame\n- Valoare estimată pe site: ${totalCash} RON.\nCând mă pot prezenta în agenție?`;
      goldWhatsappBtn.href = `https://wa.me/40761229922?text=${encodeURIComponent(text)}`;
    }
  }

  // Sincronizare range <-> input numeric
  goldWeightRange.addEventListener('input', (e) => {
    if (goldWeightNum) goldWeightNum.value = e.target.value;
    updateGoldCalc();
  });

  if (goldWeightNum) {
    goldWeightNum.addEventListener('input', (e) => {
      goldWeightRange.value = e.target.value;
      updateGoldCalc();
    });
  }

  goldKaratSelect.addEventListener('change', updateGoldCalc);
  if (goldModeSelect) goldModeSelect.addEventListener('change', updateGoldCalc);

  // Inițializare prima rulare
  updateGoldCalc();
}

/* ==========================================================================
   3. PAWN LOAN CALCULATOR ENGINE
   ========================================================================== */
function initLoanCalculator() {
  const loanAmountRange = document.getElementById('loan-amount-range');
  const loanAmountNum = document.getElementById('loan-amount-number');
  const loanDaysRange = document.getElementById('loan-days-range');
  const loanDaysNum = document.getElementById('loan-days-number');
  const loanCategory = document.getElementById('loan-category');

  const comisionDailyDisplay = document.getElementById('loan-daily-commission');
  const comisionTotalDisplay = document.getElementById('loan-total-commission');
  const loanTotalRepayDisplay = document.getElementById('loan-total-repay');
  const loanDueDateDisplay = document.getElementById('loan-due-date');
  const loanWhatsappBtn = document.getElementById('loan-whatsapp-btn');

  if (!loanAmountRange || !loanDaysRange) return;

  function calculateDailyRate(amount) {
    if (amount <= 1000) return 0.25; // 0.25% / zi
    if (amount <= 5000) return 0.20; // 0.20% / zi
    if (amount <= 20000) return 0.15; // 0.15% / zi
    return 0.10; // 0.10% / zi pentru sume mari
  }

  function updateLoanCalc() {
    const amount = parseFloat(loanAmountRange.value) || 500;
    const days = parseInt(loanDaysRange.value, 10) || 30;
    const category = loanCategory ? loanCategory.value : 'Aur';

    const dailyPercent = calculateDailyRate(amount);
    const dailyCost = (amount * dailyPercent) / 100;
    const totalCommission = Math.round(dailyCost * days);
    const totalRepay = amount + totalCommission;

    // Calcul scadență
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    const dueFormatted = dueDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });

    if (loanAmountNum) loanAmountNum.value = amount;
    if (loanDaysNum) loanDaysNum.value = days;

    if (comisionDailyDisplay) {
      comisionDailyDisplay.textContent = `${dailyPercent.toFixed(2)}% (${dailyCost.toFixed(2)} RON/zi)`;
    }
    if (comisionTotalDisplay) {
      comisionTotalDisplay.textContent = `${totalCommission.toLocaleString('ro-RO')} RON`;
    }
    if (loanTotalRepayDisplay) {
      loanTotalRepayDisplay.textContent = `${totalRepay.toLocaleString('ro-RO')} RON`;
    }
    if (loanDueDateDisplay) {
      loanDueDateDisplay.textContent = dueFormatted;
    }

    if (loanWhatsappBtn) {
      const text = `Salut Amanet No Limit! Doresc o simulare de împrumut amanet:\n- Categorie garanție: ${category}\n- Sumă împrumutată: ${amount} RON\n- Perioadă: ${days} zile (Scadență: ${dueFormatted})\n- Comision calculat: ${totalCommission} RON\n- Total de returnat: ${totalRepay} RON.\nAveți fonduri disponibile să mă prezint azi?`;
      loanWhatsappBtn.href = `https://wa.me/40761229922?text=${encodeURIComponent(text)}`;
    }
  }

  loanAmountRange.addEventListener('input', (e) => {
    if (loanAmountNum) loanAmountNum.value = e.target.value;
    updateLoanCalc();
  });

  if (loanAmountNum) {
    loanAmountNum.addEventListener('input', (e) => {
      loanAmountRange.value = e.target.value;
      updateLoanCalc();
    });
  }

  loanDaysRange.addEventListener('input', (e) => {
    if (loanDaysNum) loanDaysNum.value = e.target.value;
    updateLoanCalc();
  });

  if (loanDaysNum) {
    loanDaysNum.addEventListener('input', (e) => {
      loanDaysRange.value = e.target.value;
      updateLoanCalc();
    });
  }

  if (loanCategory) loanCategory.addEventListener('change', updateLoanCalc);

  updateLoanCalc();
}

/* ==========================================================================
   4. ONLINE EVALUATION WIZARD & PHOTO UPLOAD
   ========================================================================== */
function initEvaluationWizard() {
  const evalForm = document.getElementById('eval-wizard-form');
  const uploadInput = document.getElementById('eval-photos-input');
  const uploadZone = document.getElementById('eval-upload-zone');
  const previewContainer = document.getElementById('eval-preview-container');

  if (!evalForm) return;

  const uploadedFiles = [];

  // Drag & Drop
  if (uploadZone && uploadInput) {
    uploadZone.addEventListener('click', () => uploadInput.click());

    ['dragenter', 'dragover'].forEach(name => {
      uploadZone.addEventListener(name, (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      uploadZone.addEventListener(name, (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
      });
    });

    uploadZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      handleFiles(files);
    });

    uploadInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });
  }

  function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      uploadedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview-thumb';
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  }

  evalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cat = document.getElementById('eval-cat').value;
    const prod = document.getElementById('eval-prod').value;
    const cond = document.getElementById('eval-condition').value;
    const suma = document.getElementById('eval-amount').value || "Cea mai bună ofertă";
    const nume = document.getElementById('eval-name').value;
    const tel = document.getElementById('eval-phone').value;

    const message = `🔥 *Solicitare Evaluare Online Amanet No Limit*\n👤 Client: ${nume}\n📞 Telefon: ${tel}\n📦 Categorie: ${cat}\n🏷️ Produs / Detalii: ${prod}\n✨ Stare: ${cond}\n💰 Sumă dorită: ${suma} RON\n📷 Poze atașate: ${uploadedFiles.length > 0 ? uploadedFiles.length + ' imagini pregătite de trimitere' : 'Fără poze'}\n\nVă rog să-mi comunicați evaluarea și dacă mă pot prezenta în agenție.`;

    // Deschide WhatsApp
    window.open(`https://wa.me/40761229922?text=${encodeURIComponent(message)}`, '_blank');

    // Confirmare modal
    const modal = document.getElementById('eval-success-modal');
    if (modal) modal.showModal();
  });
}

/* ==========================================================================
   5. CATALOG & STORE WITH REAL-TIME FILTERS
   ========================================================================== */
function initCatalog() {
  const container = document.getElementById('products-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('catalog-search');

  if (!container || typeof PRODUCTS_DATA === 'undefined') return;

  let currentCategory = 'all';
  let searchQuery = '';

  function renderProducts() {
    container.innerHTML = '';

    const filtered = PRODUCTS_DATA.filter(item => {
      const matchCat = currentCategory === 'all' || item.category === currentCategory;
      const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.specs.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <h3>Niciun produs găsit conform criteriilor.</h3>
          <p>Contactați-ne pe WhatsApp la 0761 229 922 pentru comenzi speciale sau verificarea stocului din magazin.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'product-card';
      
      const specsHtml = item.specs.map(s => `<li>${s}</li>`).join('');
      const whatsappMsg = encodeURIComponent(`Salut Amanet No Limit! Sunt interesat de produsul "${item.title}" (Preț: ${item.price.toLocaleString('ro-RO')} RON). Mai este disponibil în agenție?`);

      card.innerHTML = `
        <div class="product-img-wrap">
          <span class="badge-tag ${item.badgeType}">${item.badge}</span>
          <img src="${item.image}" alt="${item.title}" class="product-img" loading="lazy">
        </div>
        <div class="product-body">
          <div class="product-category">${item.categoryName}</div>
          <h3 class="product-title">${item.title}</h3>
          <ul class="product-specs-list">
            ${specsHtml}
          </ul>
          <div class="product-footer">
            <div class="price-wrap">
              ${item.oldPrice ? `<span class="price-old">${item.oldPrice.toLocaleString('ro-RO')} Lei</span>` : ''}
              <span class="price-current">${item.price.toLocaleString('ro-RO')} Lei</span>
            </div>
            <a href="https://wa.me/40761229922?text=${whatsappMsg}" target="_blank" class="btn-inquire">
              <span>Rezervă</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </a>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Evenimente filtre
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category || 'all';
      renderProducts();
    });
  });

  // Căutare live
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderProducts();
    });
  }

  renderProducts();
}

/* ==========================================================================
   6. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   7. MOBILE NAVIGATION & TABS
   ========================================================================== */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // Tab switcher pentru calculatoare pe hero (Aur vs Imprumut)
  const calcTabs = document.querySelectorAll('.calc-tab-btn');
  const calcPanes = document.querySelectorAll('.calc-pane');

  calcTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      triggerHaptic(8);
      const targetPane = tab.dataset.pane;
      calcTabs.forEach(t => t.classList.remove('active'));
      calcPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const activePane = document.getElementById(targetPane);
      if (activePane) activePane.classList.add('active');
    });
  });
}


/* ==========================================================================
   LIVE METALS BURSA & -10% DISCOUNT INTERACTIVE LOGIC
   ========================================================================== */
function initBursaSection() {
  if (!window.MetalsEngine) return;

  const engine = window.MetalsEngine;
  const tbody = document.getElementById("bursa-tbody");
  const simSelect = document.getElementById("sim-metal-select");
  const simRange = document.getElementById("sim-grams-range");
  const simNum = document.getElementById("sim-grams-num");
  const simGramsDisplay = document.getElementById("sim-grams-val");
  const filterBtns = document.querySelectorAll("[data-bursa-filter]");

  let currentFilter = "all";
  let secondsSinceUpdate = 0;

  // Timer secundar pentru afișarea stării în timp real
  setInterval(() => {
    secondsSinceUpdate++;
    const timerBadge = document.getElementById("bursa-timer-badge");
    if (timerBadge) {
      const nextIn = Math.max(0, 30 - (secondsSinceUpdate % 30));
      timerBadge.textContent = `Actualizat acum ${secondsSinceUpdate % 30}s • Următoarea verificare în ${nextIn}s`;
    }
  }, 1000);

  // Funcție de randare tabel cu animație flash la actualizare
  function renderTable(flash = false) {
    if (!tbody) return;
    const metals = engine.getAllMetals();
    
    const filtered = metals.filter(m => {
      if (currentFilter === "gold") return m.symbol === "Au";
      if (currentFilter === "silver") return m.symbol === "Ag";
      if (currentFilter === "platinum") return m.symbol === "Pt" || m.symbol === "Pd";
      return true;
    });

    tbody.innerHTML = filtered.map(m => {
      let badgeClass = "gold";
      if (m.symbol === "Ag") badgeClass = "silver";
      if (m.symbol === "Pt" || m.symbol === "Pd") badgeClass = "platinum";

      const flashClass = flash ? "rate-flash-green" : "";
      const waMsg = encodeURIComponent(`Bună ziua! Vă contactez de pe site-ul amanetnolimit.com. Aș dori să vând ${m.name} la cotația actualizată de bursă: ${m.ourPrice} Lei/gram (-10% din bursă). Când pot veni la agenție?`);

      return `
        <tr>
          <td>
            <div class="bursa-metal-name">
              <span class="metal-badge ${badgeClass}">${m.karat}</span>
              <span>${m.name}</span>
            </div>
          </td>
          <td>
            <span class="price-bursa-tag ${flashClass}">${m.bursaPrice.toFixed(2)} Lei/g</span>
          </td>
          <td>
            <span class="price-discount-tag">-${m.diff.toFixed(2)} Lei (-${m.discountPercent}%)</span>
          </td>
          <td>
            <span class="price-our-tag ${flashClass}">${m.ourPrice.toFixed(2)} Lei/g</span>
          </td>
          <td>
            <a href="https://wa.me/40761229922?text=${waMsg}" target="_blank" 
               class="btn-inquire" style="padding: 6px 12px; font-size: 11.5px; min-height: 36px;">
              💬 Vinde
            </a>
          </td>
        </tr>
      `;
    }).join("");
  }

  // Populare selector simulator
  function populateSelect() {
    if (!simSelect) return;
    const currentVal = simSelect.value;
    const metals = engine.getAllMetals();
    simSelect.innerHTML = metals.map(m => `
      <option value="${m.id}" data-our="${m.ourPrice}" data-bursa="${m.bursaPrice}">
        ${m.name} — ${m.ourPrice} Lei/g (-10% din Bursă)
      </option>
    `).join("");

    if (currentVal && simSelect.querySelector(`option[value="${currentVal}"]`)) {
      simSelect.value = currentVal;
    }
  }

  if (simSelect) {
    populateSelect();
    simSelect.addEventListener("change", () => {
      triggerHaptic(8);
      updateSimulator();
    });
  }

  // Sincronizare Range & Number inputs
  if (simRange && simNum) {
    simRange.addEventListener("input", (e) => {
      simNum.value = e.target.value;
      if (simGramsDisplay) simGramsDisplay.textContent = e.target.value;
      updateSimulator();
    });

    simNum.addEventListener("input", (e) => {
      simRange.value = e.target.value;
      if (simGramsDisplay) simGramsDisplay.textContent = e.target.value;
      updateSimulator();
    });
  }

  function updateSimulator() {
    if (!simSelect) return;
    const selectedOpt = simSelect.options[simSelect.selectedIndex];
    if (!selectedOpt) return;

    const ourPerGram = parseFloat(selectedOpt.dataset.our) || 0;
    const bursaPerGram = parseFloat(selectedOpt.dataset.bursa) || 0;
    const grams = parseFloat(simNum ? simNum.value : 10) || 0;

    const totalBursa = Math.round(bursaPerGram * grams * 100) / 100;
    const totalOur = Math.round(ourPerGram * grams * 10) / 10;
    const totalDiff = Math.round((totalBursa - totalOur) * 100) / 100;

    const bursaEl = document.getElementById("sim-res-bursa");
    const diffEl = document.getElementById("sim-res-diff");
    const ourEl = document.getElementById("sim-res-our");
    const waCta = document.getElementById("sim-whatsapp-cta");

    if (bursaEl) bursaEl.textContent = `${totalBursa.toLocaleString("ro-RO")} Lei`;
    if (diffEl) diffEl.textContent = `-${totalDiff.toLocaleString("ro-RO")} Lei (-10%)`;
    if (ourEl) ourEl.textContent = `${totalOur.toLocaleString("ro-RO")} Lei Cash`;

    if (waCta) {
      const metalText = selectedOpt.text.split("—")[0].trim();
      const msg = encodeURIComponent(`Bună ziua! Conform cotației live de bursă de pe amanetnolimit.com, am ${grams} grame de ${metalText}. Doresc să le vând la prețul calculat de ${totalOur.toLocaleString("ro-RO")} Lei Cash (-10% din bursă). Când pot veni la agenție?`);
      waCta.href = `https://wa.me/40761229922?text=${msg}`;
    }
  }

  // Filtrare tabel
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      triggerHaptic(8);
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.bursaFilter;
      renderTable();
    });
  });

  function updateTopBarTicker(flash = false) {
    const ratesWrap = document.querySelector(".top-bar-rates");
    if (!ratesWrap) return;
    const m = engine.rates;
    const p14 = engine.calculateOffer(m.gold_14k.bursaPrice);
    const p18 = engine.calculateOffer(m.gold_18k.bursaPrice);
    const p24 = engine.calculateOffer(m.gold_24k.bursaPrice);
    const pag = engine.calculateOffer(m.silver_925.bursaPrice);
    const flashClass = flash ? "rate-flash-green" : "";

    ratesWrap.innerHTML = `
      <span>Aur 14K (-10%): <strong class="rate-badge ${flashClass}">${p14} Lei/g</strong></span>
      <span>18K: <strong class="rate-badge ${flashClass}">${p18} Lei/g</strong></span>
      <span>24K: <strong class="rate-badge ${flashClass}">${p24} Lei/g</strong></span>
      <span>Argint 925: <strong class="rate-badge ${flashClass}" style="color: #cbd5e1;">${pag} Lei/g</strong></span>
    `;
  }

  // ABONARE LA MOTORUL DE SINCRONIZARE CONTINUĂ
  engine.subscribe((metals, hasChanged, lastTime) => {
    secondsSinceUpdate = 0;
    populateSelect();
    renderTable(hasChanged);
    updateSimulator();
    updateTopBarTicker(hasChanged);
  });

  // Render initial
  renderTable(false);
  updateSimulator();
  updateTopBarTicker(false);
}
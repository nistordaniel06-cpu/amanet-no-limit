
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

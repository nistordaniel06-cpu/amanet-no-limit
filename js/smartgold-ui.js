const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function injectRequestedStyles() {
  if ($('#smartgold-ui-fixes')) return;
  const style = document.createElement('style');
  style.id = 'smartgold-ui-fixes';
  style.textContent = `
    /* Elemente marcate pentru ștergere */
    .logo-tag,
    .hero-title { display: none !important; }

    /* Păstrăm doar prețul final SmartGold în tabel */
    .bursa-table-wrap table thead th:nth-child(2),
    .bursa-table-wrap table thead th:nth-child(3),
    #bursa-tbody td:nth-child(2),
    #bursa-tbody td:nth-child(3) { display: none !important; }

    [data-bursa-filter="silver"],
    [data-bursa-filter="platinum"] { display: none !important; }

    .top-bar-rates span:last-child { display: none !important; }

    /* Simulator: ascundem valorile vechi Bursă/-10%; rămâne suma reală afișată */
    #sim-res-bursa,
    #sim-res-diff { display: none !important; }
    #sim-res-bursa.closest-placeholder { display: none !important; }

    @media (max-width: 900px) {
      .showcase-banner-card,
      .showcase-media,
      .showcase-info { min-width: 0 !important; width: 100% !important; max-width: 100% !important; }

      .showcase-banner-card {
        padding: 16px 14px 22px !important;
        gap: 18px !important;
        overflow: hidden !important;
      }

      .showcase-slider-wrap {
        width: 100% !important;
        max-width: 100% !important;
        aspect-ratio: 16 / 9 !important;
        min-height: 0 !important;
        border-radius: 18px !important;
        margin: 0 auto !important;
      }

      .showcase-slide img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        object-position: center !important;
      }

      .showcase-info { overflow: hidden !important; }
      .showcase-title,
      .showcase-desc,
      .showcase-pillar-item,
      .showcase-cta-group {
        max-width: 100% !important;
        overflow-wrap: anywhere !important;
        word-break: normal !important;
      }

      .showcase-desc {
        font-size: 14px !important;
        line-height: 1.55 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function removeOldSimulatorRows() {
  ['sim-res-bursa', 'sim-res-diff'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const row = el.closest('.result-row');
    if (row) row.style.display = 'none';
  });
}

function cleanGoldControls() {
  $$('[data-bursa-filter="silver"], [data-bursa-filter="platinum"]').forEach(el => el.remove());

  $$('.bursa-table-wrap table thead th').forEach(th => {
    if (/PE GRAM/i.test(th.textContent || '')) th.textContent = 'PREȚ / GRAM';
  });

  const simulatorTitle = [...document.querySelectorAll('h1,h2,h3,h4')].find(el => /Calculator Vânzare Metal/i.test(el.textContent || ''));
  if (simulatorTitle) simulatorTitle.textContent = '⚡ Calculator Vânzare Aur · SmartGold Live';

  $$('label').forEach(label => {
    if (/Alege Metalul/i.test(label.textContent || '')) label.textContent = 'Alege Aurul & Puritatea:';
  });

  removeOldSimulatorRows();
}

function cleanSelectOptions() {
  const select = $('#sim-metal-select');
  if (!select) return;
  [...select.options].forEach(option => {
    option.textContent = option.textContent
      .replace(/\s*\(-10% din Bursă\)/gi, '')
      .replace(/\s*\(-0% din Bursă\)/gi, '')
      .trim();
  });
}

function rewriteWhatsAppLinks() {
  $$('#bursa-tbody tr').forEach(row => {
    const name = $('.bursa-metal-name span:last-child', row)?.textContent?.trim();
    const priceText = $('.price-our-tag', row)?.textContent?.trim();
    const link = $('a[href*="wa.me"]', row);
    if (!name || !priceText || !link) return;
    const msg = `Bună ziua! Vă contactez de pe site-ul Amanet No Limit. Doresc să vând ${name}. Pe site apare cotația SmartGold actualizată automat: ${priceText}. Când pot veni la agenție?`;
    link.href = `https://wa.me/40761229922?text=${encodeURIComponent(msg)}`;
  });

  const select = $('#sim-metal-select');
  const gramsInput = $('#sim-grams-num');
  const cta = $('#sim-whatsapp-cta');
  if (select && cta) {
    const option = select.options[select.selectedIndex];
    if (option) {
      const grams = Number(gramsInput?.value || 10);
      const rate = Number(option.dataset.our || 0);
      const total = Math.round(rate * grams * 10) / 10;
      const metal = option.textContent.split('—')[0].trim();
      const msg = `Bună ziua! Am ${grams} grame de ${metal}. Conform cotației SmartGold afișate live pe Amanet No Limit, estimarea este ${total.toLocaleString('ro-RO')} Lei. Când pot veni la agenție?`;
      cta.href = `https://wa.me/40761229922?text=${encodeURIComponent(msg)}`;
    }
  }
}

function lockTimerLabel() {
  const badge = $('#bursa-timer-badge');
  if (!badge || badge.dataset.smartgoldLocked === '1') return;
  badge.dataset.smartgoldLocked = '1';
  const desired = 'SmartGold • actualizare automată la 5 minute';
  badge.textContent = desired;
  const observer = new MutationObserver(() => {
    if (badge.textContent !== desired) badge.textContent = desired;
  });
  observer.observe(badge, { childList: true, characterData: true, subtree: true });
}

function refreshUi() {
  injectRequestedStyles();
  cleanGoldControls();
  cleanSelectOptions();
  rewriteWhatsAppLinks();
  lockTimerLabel();
}

function start() {
  refreshUi();
  const tbody = $('#bursa-tbody');
  if (tbody) {
    new MutationObserver(() => {
      cleanSelectOptions();
      rewriteWhatsAppLinks();
    }).observe(tbody, { childList: true, subtree: true });
  }

  const select = $('#sim-metal-select');
  const grams = $('#sim-grams-num');
  select?.addEventListener('change', () => setTimeout(rewriteWhatsAppLinks, 0));
  grams?.addEventListener('input', () => setTimeout(rewriteWhatsAppLinks, 0));
  window.addEventListener('bursa:rates-updated', () => setTimeout(refreshUi, 0));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}

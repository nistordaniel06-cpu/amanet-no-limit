import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.116.0';

const SUPABASE_URL = 'https://zqdsrgamoqcvbmazbwcq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_qZs-11TUAf8pn2PUQyudTw_TvyVAL5G';
const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const $ = (id) => document.getElementById(id);
const authView = $('auth-view');
const claimView = $('claim-view');
const dashboardView = $('dashboard-view');
const logoutBtn = $('logout-btn');
const dialog = $('product-dialog');
let products = [];
let editingId = null;

function setMessage(el, text = '', type = '') {
  el.textContent = text;
  el.className = `message${type ? ` ${type}` : ''}`;
}

function categoryName(category) {
  return ({ telefoane: 'Telefoane & Gadgets', bijuterii: 'Aur & Bijuterii', ceasuri: 'Ceasuri de Lux', laptopuri: 'Laptopuri & IT', auto: 'Auto Amanet' })[category] || category;
}

async function isAdmin(userId) {
  const { data, error } = await client.from('amanet_admins').select('user_id').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function refreshSessionView() {
  const { data: { session } } = await client.auth.getSession();
  authView.classList.toggle('hidden', Boolean(session));
  logoutBtn.classList.toggle('hidden', !session);
  claimView.classList.add('hidden');
  dashboardView.classList.add('hidden');

  if (!session) return;

  try {
    if (await isAdmin(session.user.id)) {
      dashboardView.classList.remove('hidden');
      await loadProducts();
    } else {
      claimView.classList.remove('hidden');
    }
  } catch (error) {
    claimView.classList.remove('hidden');
    setMessage($('claim-message'), `Nu am putut verifica drepturile: ${error.message}`, 'error');
  }
}

$('auth-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage($('auth-message'), 'Se autentifică...');
  const email = $('email').value.trim();
  const password = $('password').value;
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) return setMessage($('auth-message'), error.message, 'error');
  setMessage($('auth-message'), 'Autentificat.', 'ok');
  await refreshSessionView();
});

$('signup-btn').addEventListener('click', async () => {
  const email = $('email').value.trim();
  const password = $('password').value;
  if (!email || password.length < 8) return setMessage($('auth-message'), 'Completează emailul și o parolă de minimum 8 caractere.', 'error');
  setMessage($('auth-message'), 'Se creează contul...');
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) return setMessage($('auth-message'), error.message, 'error');
  if (!data.session) return setMessage($('auth-message'), 'Cont creat. Confirmă emailul, apoi revino și autentifică-te.', 'ok');
  setMessage($('auth-message'), 'Cont creat și autentificat.', 'ok');
  await refreshSessionView();
});

logoutBtn.addEventListener('click', async () => {
  await client.auth.signOut();
  await refreshSessionView();
});

$('claim-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const token = $('claim-token').value.trim();
  setMessage($('claim-message'), 'Se activează...');
  const { data, error } = await client.rpc('claim_amanet_admin', { p_token: token });
  if (error) return setMessage($('claim-message'), error.message, 'error');
  if (!data) return setMessage($('claim-message'), 'Cod invalid sau deja folosit.', 'error');
  setMessage($('claim-message'), 'Administrator activat.', 'ok');
  await refreshSessionView();
});

async function loadProducts() {
  setMessage($('dashboard-message'), 'Se încarcă produsele...');
  const { data, error } = await client.from('amanet_products').select('*').order('sort_order', { ascending: true });
  if (error) return setMessage($('dashboard-message'), error.message, 'error');
  products = data || [];
  setMessage($('dashboard-message'));
  renderProducts();
}

function updateStats() {
  $('stat-total').textContent = products.length;
  $('stat-active').textContent = products.filter((p) => p.active).length;
  $('stat-stock').textContent = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
}

function renderProducts() {
  updateStats();
  const list = $('products-list');
  list.replaceChildren();
  const query = $('admin-search').value.trim().toLowerCase();
  const filter = $('admin-filter').value;
  const visible = products.filter((p) => {
    const matchesText = !query || `${p.title} ${p.category_name} ${p.description}`.toLowerCase().includes(query);
    const matchesCategory = filter === 'all' || p.category === filter;
    return matchesText && matchesCategory;
  });

  if (!visible.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'Nu există produse pentru filtrul ales.';
    list.appendChild(empty);
    return;
  }

  visible.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';

    const image = document.createElement('img');
    image.src = product.image || '../assets/logo.png';
    image.alt = product.title;
    image.loading = 'lazy';
    image.onerror = () => { image.src = '../assets/logo.png'; };

    const meta = document.createElement('div');
    meta.className = 'product-meta';
    const title = document.createElement('h3');
    title.textContent = product.title;
    const sub = document.createElement('div');
    sub.className = 'product-sub';
    [
      `${Number(product.price).toLocaleString('ro-RO')} Lei`,
      `Stoc: ${product.stock}`,
      product.category_name || categoryName(product.category)
    ].forEach((text) => {
      const pill = document.createElement('span');
      pill.className = 'pill';
      pill.textContent = text;
      sub.appendChild(pill);
    });
    const active = document.createElement('span');
    active.className = `pill ${product.active ? 'on' : 'off'}`;
    active.textContent = product.active ? 'Vizibil' : 'Ascuns';
    sub.appendChild(active);
    meta.append(title, sub);

    const actions = document.createElement('div');
    actions.className = 'product-actions';
    const edit = document.createElement('button');
    edit.className = 'secondary';
    edit.type = 'button';
    edit.textContent = 'Editează';
    edit.addEventListener('click', () => openProduct(product));
    actions.appendChild(edit);

    card.append(image, meta, actions);
    list.appendChild(card);
  });
}

$('admin-search').addEventListener('input', renderProducts);
$('admin-filter').addEventListener('change', renderProducts);
$('new-product-btn').addEventListener('click', () => openProduct());
$('close-dialog-btn').addEventListener('click', () => dialog.close());

function openProduct(product = null) {
  editingId = product?.id || null;
  $('dialog-title').textContent = product ? 'Editează produsul' : 'Produs nou';
  $('product-id').value = product?.id || '';
  $('product-title').value = product?.title || '';
  $('product-category').value = product?.category || 'telefoane';
  $('product-category-name').value = product?.category_name || 'Telefoane & Gadgets';
  $('product-price').value = product?.price ?? '';
  $('product-old-price').value = product?.old_price ?? '';
  $('product-stock').value = product?.stock ?? 1;
  $('product-condition').value = product?.condition || '';
  $('product-warranty').value = product?.warranty || '';
  $('product-badge').value = product?.badge || '';
  $('product-badge-type').value = product?.badge_type || '';
  $('product-image').value = product?.image || '';
  $('product-specs').value = (product?.specs || []).join('\n');
  $('product-description').value = product?.description || '';
  $('product-featured').checked = Boolean(product?.featured);
  $('product-active').checked = product ? Boolean(product.active) : true;
  $('delete-product-btn').classList.toggle('hidden', !product);
  setMessage($('product-message'));
  dialog.showModal();
}

$('product-category').addEventListener('change', () => {
  if (!editingId) $('product-category-name').value = categoryName($('product-category').value);
});

$('product-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const category = $('product-category').value;
  const payload = {
    title: $('product-title').value.trim(),
    category,
    category_name: $('product-category-name').value.trim() || categoryName(category),
    price: Number($('product-price').value),
    old_price: $('product-old-price').value ? Number($('product-old-price').value) : null,
    stock: Number($('product-stock').value || 0),
    condition: $('product-condition').value.trim(),
    warranty: $('product-warranty').value.trim(),
    badge: $('product-badge').value.trim(),
    badge_type: $('product-badge-type').value.trim(),
    image: $('product-image').value.trim(),
    specs: $('product-specs').value.split('\n').map((v) => v.trim()).filter(Boolean),
    description: $('product-description').value.trim(),
    featured: $('product-featured').checked,
    active: $('product-active').checked,
    updated_at: new Date().toISOString()
  };

  if (!payload.title || !Number.isFinite(payload.price) || payload.price < 0) return setMessage($('product-message'), 'Titlul și prețul sunt obligatorii.', 'error');
  setMessage($('product-message'), 'Se salvează...');

  let error;
  if (editingId) {
    ({ error } = await client.from('amanet_products').update(payload).eq('id', editingId));
  } else {
    const id = `prod-${Date.now()}`;
    const sortOrder = products.length ? Math.max(...products.map((p) => Number(p.sort_order || 0))) + 10 : 10;
    ({ error } = await client.from('amanet_products').insert({ id, sort_order: sortOrder, ...payload }));
  }

  if (error) return setMessage($('product-message'), error.message, 'error');
  dialog.close();
  await loadProducts();
});

$('delete-product-btn').addEventListener('click', async () => {
  if (!editingId) return;
  const current = products.find((p) => p.id === editingId);
  if (!confirm(`Ștergi definitiv „${current?.title || editingId}”?`)) return;
  setMessage($('product-message'), 'Se șterge...');
  const { error } = await client.from('amanet_products').delete().eq('id', editingId);
  if (error) return setMessage($('product-message'), error.message, 'error');
  dialog.close();
  await loadProducts();
});

client.auth.onAuthStateChange(() => {
  setTimeout(refreshSessionView, 0);
});

await refreshSessionView();

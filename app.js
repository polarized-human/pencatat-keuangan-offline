/**
 * Aplikasi Kas UMKM Foto Copy & Print
 * Penyimpanan Lokal (LocalStorage, Cache API & Markdown/Text File Sync)
 * Menggunakan standar dexodev1 (robust-skill: State Locking & Anti-Regression)
 */

// ========================================================
// 1. Konfigurasi Kategori & Tipe UMKM Foto Copy & Print
// ========================================================

const STORAGE_KEY = 'umkm_fotocopy_cashflow_v1';
const CACHE_NAME = 'umkm-fotocopy-cache-v1';
const CACHE_ENDPOINT = '/api/local-cashflow-snapshot.json';

const CATEGORIES = {
  pemasukan: {
    fotocopy: { label: 'Foto Copy', icon: '📄', badgeClass: 'badge-fotocopy' },
    print: { label: 'Print Dokumen/Foto', icon: '🖨️', badgeClass: 'badge-print' },
    jilid_laminating: { label: 'Jilid & Laminating', icon: '📑', badgeClass: 'badge-jilid_laminating' },
    scan: { label: 'Scan & Ketik', icon: '🔍', badgeClass: 'badge-scan' },
    atk: { label: 'Penjualan ATK', icon: '✏️', badgeClass: 'badge-atk' },
    pemasukan_lain: { label: 'Pemasukan Lainnya', icon: '💵', badgeClass: 'badge-pemasukan_lain' }
  },
  pengeluaran: {
    kertas: { label: 'Kertas & HVS', icon: '📦', badgeClass: 'badge-kertas' },
    tinta_toner: { label: 'Tinta & Toner', icon: '🖨️', badgeClass: 'badge-tinta_toner' },
    service_mesin: { label: 'Servis Mesin', icon: '🔧', badgeClass: 'badge-service_mesin' },
    listrik_operasional: { label: 'Listrik & Operasional', icon: '⚡', badgeClass: 'badge-listrik_operasional' },
    stok_atk: { label: 'Kulakan ATK', icon: '📏', badgeClass: 'badge-stok_atk' },
    pengeluaran_lain: { label: 'Pengeluaran Lainnya', icon: '💸', badgeClass: 'badge-pengeluaran_lain' }
  }
};

// Data Inisial Bawaan (sinkron dengan catatan_transaksi.md)
const INITIAL_TRANSACTIONS = [
  {
    id: 'TRX-1728821001',
    date: '2026-10-13',
    type: 'pemasukan',
    category: 'print',
    title: 'Print Skripsi Berwarna 45 Lembar & Jilid Mika',
    amount: 75000
  },
  {
    id: 'TRX-1728821002',
    date: '2026-10-13',
    type: 'pemasukan',
    category: 'fotocopy',
    title: 'Fotocopy Modul Materi Pelatihan 120 Lembar',
    amount: 36000
  },
  {
    id: 'TRX-1728821003',
    date: '2026-10-13',
    type: 'pengeluaran',
    category: 'kertas',
    title: 'Beli Kertas HVS SiDU A4 75gsm (2 Rim)',
    amount: 110000
  },
  {
    id: 'TRX-1728821004',
    date: '2026-10-13',
    type: 'pemasukan',
    category: 'scan',
    title: 'Scan Dokumen Ijazah & Cetak Pas Foto 3x4',
    amount: 25000
  },
  {
    id: 'TRX-1728821005',
    date: '2026-10-13',
    type: 'pengeluaran',
    category: 'tinta_toner',
    title: 'Isi Ulang Tinta Printer Hitam & Cyan',
    amount: 85000
  },
  {
    id: 'TRX-1728821006',
    date: '2026-10-13',
    type: 'pemasukan',
    category: 'atk',
    title: 'Penjualan Stopmap Folio, Pulpen, & Amplop Coklat',
    amount: 22000
  },
  {
    id: 'TRX-1728821007',
    date: '2026-10-13',
    type: 'pemasukan',
    category: 'jilid_laminating',
    title: 'Jilid Hardcover Tugas Akhir Mahasiswa',
    amount: 60000
  },
  {
    id: 'TRX-1728821008',
    date: '2026-10-13',
    type: 'pengeluaran',
    category: 'listrik_operasional',
    title: 'Token Listrik Operasional Mesin Fotocopy',
    amount: 100000
  }
];

// State Utama
let transactions = [];

// ========================================================
// 2. DOM Elemen
// ========================================================

const form = document.getElementById('cashflowForm');
const btnTypeIncome = document.getElementById('btnTypeIncome');
const btnTypeExpense = document.getElementById('btnTypeExpense');
const itemTypeInput = document.getElementById('itemType');
const itemTitleInput = document.getElementById('itemTitle');
const itemCategorySelect = document.getElementById('itemCategory');
const itemAmountInput = document.getElementById('itemAmount');
const itemDateInput = document.getElementById('itemDate');

const totalIncomeEl = document.getElementById('totalIncome');
const incomeHintEl = document.getElementById('incomeHint');
const totalExpenseEl = document.getElementById('totalExpense');
const expenseHintEl = document.getElementById('expenseHint');
const netBalanceEl = document.getElementById('netBalance');
const balanceStatusHintEl = document.getElementById('balanceStatusHint');
const totalCountEl = document.getElementById('totalCount');
const totalDetailHintEl = document.getElementById('totalDetailHint');

const transactionListEl = document.getElementById('transactionList');
const emptyStateEl = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const filterTypeSelect = document.getElementById('filterType');
const filterCategorySelect = document.getElementById('filterCategory');
const clearAllBtn = document.getElementById('clearAllBtn');

const loadLocalFileBtn = document.getElementById('loadLocalFileBtn');
const importFileBtn = document.getElementById('importFileBtn');
const exportMdBtn = document.getElementById('exportMdBtn');
const hiddenFileInput = document.getElementById('hiddenFileInput');
const syncStatusHint = document.getElementById('syncStatusHint');
const toastNotice = document.getElementById('toastNotice');
const cacheStatusText = document.getElementById('cacheStatusText');
const autoShowReceipt = document.getElementById('autoShowReceipt');
const autoReceiptGroup = document.getElementById('autoReceiptGroup');
const submitBtnText = document.getElementById('submitBtnText');

// Elemen Modal Struk / Bukti Transaksi
const receiptModal = document.getElementById('receiptModal');
const receiptModalOverlay = document.getElementById('receiptModalOverlay');
const printReceiptBtn = document.getElementById('printReceiptBtn');
const closeReceiptBtn = document.getElementById('closeReceiptBtn');
const receiptTypeLabel = document.getElementById('receiptTypeLabel');
const receiptId = document.getElementById('receiptId');
const receiptDate = document.getElementById('receiptDate');
const receiptKasType = document.getElementById('receiptKasType');
const receiptCategory = document.getElementById('receiptCategory');
const receiptTitle = document.getElementById('receiptTitle');
const receiptAmount = document.getElementById('receiptAmount');
const receiptTotalPay = document.getElementById('receiptTotalPay');
const receiptBadgeStatus = document.getElementById('receiptBadgeStatus');

// ========================================================
// 3. Helper Format & Utilities
// ========================================================

function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, isSuccess = true) {
  if (!toastNotice) return;
  toastNotice.textContent = message;
  toastNotice.style.borderColor = isSuccess ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)';
  toastNotice.classList.add('show');
  setTimeout(() => {
    toastNotice.classList.remove('show');
  }, 3500);
}

function getCategoryMeta(type, categoryKey) {
  const typeCategories = CATEGORIES[type] || CATEGORIES.pemasukan;
  if (typeCategories[categoryKey]) {
    return typeCategories[categoryKey];
  }
  // Fallback pencarian lintas kategori jika tidak sengaja bertukar
  if (type === 'pemasukan' && CATEGORIES.pengeluaran[categoryKey]) {
    return CATEGORIES.pengeluaran[categoryKey];
  }
  if (type === 'pengeluaran' && CATEGORIES.pemasukan[categoryKey]) {
    return CATEGORIES.pemasukan[categoryKey];
  }
  return {
    label: categoryKey || 'Lainnya',
    icon: type === 'pemasukan' ? '💵' : '💸',
    badgeClass: 'badge-pemasukan_lain'
  };
}

// ========================================================
// 4. Parser & Generator Format Catatan (MD & TXT)
// ========================================================

/**
 * Parsing teks Markdown / TXT menjadi array transaksi terstruktur
 */
function parseTransactionFile(text) {
  const lines = text.split(/\r?\n/);
  const parsedItems = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Lewati baris kosong, header markdown '#' atau baris pemisah tabel '| :---'
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('>') || trimmed.startsWith('<!--') || trimmed.includes(':---') || trimmed.startsWith('[') || trimmed.startsWith('Format:')) {
      continue;
    }

    // Format tabel pipe-separated: | ID | Tanggal | Tipe | Kategori | Keterangan | Nominal |
    if (trimmed.includes('|')) {
      const parts = trimmed
        .split('|')
        .map(p => p.trim())
        .filter((p, idx, arr) => {
          // Bersihkan item kosong di tepi luar jika baris diawali atau diakhiri |
          if (idx === 0 && p === '') return false;
          if (idx === arr.length - 1 && p === '') return false;
          return true;
        });

      if (parts.length >= 6) {
        const id = parts[0];
        const date = parts[1];
        const typeRaw = parts[2].toLowerCase();
        const category = parts[3];
        const title = parts[4];
        const amountRaw = parts[5].replace(/[^0-9]/g, '');

        // Abaikan baris heading tabel "ID | Tanggal | Tipe..."
        if (id.toLowerCase() === 'id' || date.toLowerCase() === 'tanggal') {
          continue;
        }

        const type = (typeRaw === 'pemasukan' || typeRaw === 'income') ? 'pemasukan' : 'pengeluaran';
        const amount = Number(amountRaw) || 0;

        if (title && amount > 0) {
          parsedItems.push({
            id: id || `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            date: date || getLocalDateString(),
            type,
            category,
            title,
            amount
          });
        }
      }
    }
  }

  return parsedItems;
}

/**
 * Menghasilkan teks Markdown terstruktur dari data transaksi saat ini
 */
function generateMarkdownContent(data) {
  const totalIncome = data.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalExpense = data.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const balance = totalIncome - totalExpense;
  const today = getLocalDateString();

  let md = `# Catatan Transaksi UMKM Foto Copy & Print\n`;
  md += `> Dokumen ini merupakan buku kas harian lokal untuk usaha Fotocopy & Percetakan.\n`;
  md += `> Terakhir diperbarui dari aplikasi: ${today}\n\n`;
  md += `---\n\n`;
  md += `## Ringkasan Keuangan\n`;
  md += `- **Total Pemasukan**: ${formatRupiah(totalIncome)}\n`;
  md += `- **Total Pengeluaran**: ${formatRupiah(totalExpense)}\n`;
  md += `- **Saldo Kas Bersih**: ${formatRupiah(balance)} (${balance >= 0 ? 'Surplus' : 'Defisit'})\n`;
  md += `- **Jumlah Catatan**: ${data.length} transaksi\n\n`;
  md += `---\n\n`;
  md += `## Data Transaksi\n\n`;
  md += `<!-- DATA_START -->\n`;
  md += `| ID | Tanggal | Tipe | Kategori | Keterangan | Nominal (Rp) |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  data.forEach(item => {
    const typeLabel = item.type === 'pemasukan' ? 'PEMASUKAN' : 'PENGELUARAN';
    md += `| ${item.id} | ${item.date} | ${typeLabel} | ${item.category} | ${item.title.replace(/\|/g, '-')} | ${item.amount} |\n`;
  });

  md += `<!-- DATA_END -->\n\n`;
  md += `---\n\n`;
  md += `## Petunjuk Penggunaan untuk Aplikasi:\n`;
  md += `1. Aplikasi secara otomatis dapat membaca tabel di atas melalui parser lokal.\n`;
  md += `2. Kolom Tipe: PEMASUKAN atau PENGELUARAN.\n`;
  md += `3. Kategori Pemasukan: fotocopy, print, jilid_laminating, scan, atk, pemasukan_lain.\n`;
  md += `4. Kategori Pengeluaran: kertas, tinta_toner, service_mesin, listrik_operasional, stok_atk, pengeluaran_lain.\n`;

  return md;
}

// ========================================================
// 5. Penyimpanan Lokal (LocalStorage & Cache API)
// ========================================================

async function saveToStorage(data) {
  try {
    // 1. Simpan di LocalStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // 2. Simpan cadangan snapshot di Cache Storage API
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      const response = new Response(JSON.stringify({
        updatedAt: new Date().toISOString(),
        transactions: data
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(CACHE_ENDPOINT, response);
    }
  } catch (err) {
    // Error handling graceful tanpa console log yang berlebihan
  }
}

async function loadFromStorage() {
  try {
    // 1. Coba baca dari localStorage
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        transactions = parsed;
        return;
      }
    }

    // 2. Jika kosong di localStorage, coba baca dari Cache Storage API
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(CACHE_ENDPOINT);
      if (cachedResponse) {
        const payload = await cachedResponse.json();
        if (payload && Array.isArray(payload.transactions) && payload.transactions.length > 0) {
          transactions = payload.transactions;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
          return;
        }
      }
    }

    // 3. Coba muat langsung dari file catatan_transaksi.md di direktori
    const syncedFromFile = await fetchLocalMarkdownFile();
    if (syncedFromFile) {
      return;
    }

    // 4. Default fallback jika file tidak dapat diakses
    transactions = [...INITIAL_TRANSACTIONS];
    await saveToStorage(transactions);
  } catch {
    transactions = [...INITIAL_TRANSACTIONS];
  }
}

/**
 * Mengambil file catatan_transaksi.md langsung dari direktori via fetch
 */
async function fetchLocalMarkdownFile() {
  try {
    const res = await fetch('./catatan_transaksi.md', { cache: 'no-store' });
    if (res.ok) {
      const text = await res.text();
      const items = parseTransactionFile(text);
      if (items.length > 0) {
        transactions = items;
        await saveToStorage(transactions);
        if (syncStatusHint) {
          syncStatusHint.textContent = `Tersinkronisasi otomatis dari catatan_transaksi.md (${items.length} transaksi)`;
        }
        return true;
      }
    }
  } catch {
    // Abaikan jika fetch local file dibatasi lingkungan browser
  }
  return false;
}

// ========================================================
// 6. UI Rendering & Update
// ========================================================

function updateCategoryOptions() {
  const currentType = itemTypeInput.value;
  const categoriesObj = CATEGORIES[currentType] || CATEGORIES.pemasukan;

  itemCategorySelect.innerHTML = '';
  for (const [key, val] of Object.entries(categoriesObj)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${val.icon} ${val.label}`;
    itemCategorySelect.appendChild(opt);
  }

  // Update juga opsi di filter toolbar kategori
  updateFilterCategoryOptions();
}

function updateFilterCategoryOptions() {
  const currentFilterType = filterTypeSelect.value;
  filterCategorySelect.innerHTML = '<option value="all">Semua Kategori</option>';

  let categoriesToInclude = {};
  if (currentFilterType === 'pemasukan') {
    categoriesToInclude = CATEGORIES.pemasukan;
  } else if (currentFilterType === 'pengeluaran') {
    categoriesToInclude = CATEGORIES.pengeluaran;
  } else {
    categoriesToInclude = { ...CATEGORIES.pemasukan, ...CATEGORIES.pengeluaran };
  }

  for (const [key, val] of Object.entries(categoriesToInclude)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${val.icon} ${val.label}`;
    filterCategorySelect.appendChild(opt);
  }
}

function renderStatistics() {
  const incomeList = transactions.filter(t => t.type === 'pemasukan');
  const expenseList = transactions.filter(t => t.type === 'pengeluaran');

  const totalIncome = incomeList.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalExpense = expenseList.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const netBalance = totalIncome - totalExpense;

  totalIncomeEl.textContent = formatRupiah(totalIncome);
  incomeHintEl.textContent = `${incomeList.length} transaksi pemasukan`;

  totalExpenseEl.textContent = formatRupiah(totalExpense);
  expenseHintEl.textContent = `${expenseList.length} transaksi pengeluaran`;

  netBalanceEl.textContent = formatRupiah(netBalance);
  if (netBalance > 0) {
    netBalanceEl.className = 'stat-value text-success';
    balanceStatusHintEl.textContent = 'Surplus (Keuntungan Bersih Positif)';
  } else if (netBalance < 0) {
    netBalanceEl.className = 'stat-value text-danger';
    balanceStatusHintEl.textContent = 'Defisit (Pengeluaran Melebihi Masuk)';
  } else {
    netBalanceEl.className = 'stat-value';
    balanceStatusHintEl.textContent = 'Kondisi Kas Seimbang (Rp 0)';
  }

  totalCountEl.textContent = transactions.length.toString();
  totalDetailHintEl.textContent = `${incomeList.length} Masuk &bull; ${expenseList.length} Keluar`;
}

function renderList() {
  const query = searchInput.value.toLowerCase().trim();
  const selectedType = filterTypeSelect.value;
  const selectedCategory = filterCategorySelect.value;

  const filtered = transactions.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(query);
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesQuery && matchesType && matchesCategory;
  });

  transactionListEl.innerHTML = '';

  if (filtered.length === 0) {
    emptyStateEl.classList.remove('hidden');
  } else {
    emptyStateEl.classList.add('hidden');

    // Urutkan transaksi terbaru di paling atas
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(item => {
      const isIncome = item.type === 'pemasukan';
      const meta = getCategoryMeta(item.type, item.category);
      const li = document.createElement('li');
      li.className = `transaction-item ${isIncome ? 'item-income' : 'item-expense'}`;

      const typeBadgeClass = isIncome ? 'badge-income-type' : 'badge-expense-type';
      const typeLabel = isIncome ? 'Pemasukan' : 'Pengeluaran';
      const sign = isIncome ? '+' : '-';
      const amountClass = isIncome ? 'income' : 'expense';

      const receiptBtnLabel = isIncome ? '🧾 Struk' : '🧾 Nota';
      const pillClass = isIncome ? 'btn-receipt-pill' : 'btn-receipt-pill expense-pill';

      li.innerHTML = `
        <div class="item-left">
          <div class="category-icon" title="${meta.label}">${meta.icon}</div>
          <div class="item-details">
            <h4>${escapeHtml(item.title)}</h4>
            <div class="item-meta">
              <span class="badge ${typeBadgeClass}">${typeLabel}</span>
              <span class="badge ${meta.badgeClass}">${meta.label}</span>
              <span>&bull;</span>
              <span>${escapeHtml(item.date)}</span>
            </div>
          </div>
        </div>
        <div class="item-right">
          <span class="item-amount ${amountClass}">${sign} ${formatRupiah(item.amount)}</span>
          <button class="${pillClass}" data-id="${item.id}" title="Cetak Bukti Transaksi / Nota">${receiptBtnLabel}</button>
          <button class="btn-delete" data-id="${item.id}" title="Hapus transaksi">&times;</button>
        </div>
      `;
      transactionListEl.appendChild(li);
    });
  }

  renderStatistics();
}

// ========================================================
// 7. Modal Bukti Transaksi & Struk Kasir
// ========================================================

function openReceiptModal(item) {
  if (!item) return;
  const isIncome = item.type === 'pemasukan';
  const meta = getCategoryMeta(item.type, item.category);

  receiptId.textContent = item.id || `TRX-${Date.now()}`;
  receiptDate.textContent = item.date || getLocalDateString();
  receiptKasType.textContent = isIncome ? 'Pemasukan Kas' : 'Pengeluaran Kas';
  receiptCategory.textContent = `${meta.icon} ${meta.label}`;
  receiptTitle.textContent = item.title;
  receiptAmount.textContent = formatRupiah(item.amount);
  receiptTotalPay.textContent = formatRupiah(item.amount);

  if (isIncome) {
    receiptTypeLabel.textContent = 'BUKTI PEMBAYARAN KONSUMEN';
    receiptBadgeStatus.textContent = '*** LUNAS ***';
    receiptBadgeStatus.style.color = '#059669';
  } else {
    receiptTypeLabel.textContent = 'BUKTI PENGELUARAN KAS';
    receiptBadgeStatus.textContent = '*** PENGELUARAN TERCATAT ***';
    receiptBadgeStatus.style.color = '#dc2626';
  }

  receiptModal.classList.remove('hidden');
}

function closeReceiptModal() {
  receiptModal.classList.add('hidden');
}

// Event Cetak Struk & Penutupan Modal
printReceiptBtn.addEventListener('click', () => {
  window.print();
});

closeReceiptBtn.addEventListener('click', closeReceiptModal);
receiptModalOverlay.addEventListener('click', closeReceiptModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !receiptModal.classList.contains('hidden')) {
    closeReceiptModal();
  }
});

// ========================================================
// 8. Event Handlers Form & List
// ========================================================

// Toggle Tipe: Pemasukan vs Pengeluaran
btnTypeIncome.addEventListener('click', () => {
  btnTypeIncome.classList.add('active');
  btnTypeExpense.classList.remove('active');
  itemTypeInput.value = 'pemasukan';
  if (autoReceiptGroup) autoReceiptGroup.style.display = 'block';
  if (submitBtnText) submitBtnText.textContent = '➕ Simpan & Buat Receipt Konsumen';
  updateCategoryOptions();
});

btnTypeExpense.addEventListener('click', () => {
  btnTypeExpense.classList.add('active');
  btnTypeIncome.classList.remove('active');
  itemTypeInput.value = 'pengeluaran';
  if (autoReceiptGroup) autoReceiptGroup.style.display = 'none';
  if (submitBtnText) submitBtnText.textContent = '➕ Simpan Pengeluaran';
  updateCategoryOptions();
});

// Submit Transaksi Baru
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = itemTitleInput.value.trim();
  const type = itemTypeInput.value;
  const category = itemCategorySelect.value;
  const amount = Number(itemAmountInput.value);
  const date = itemDateInput.value;

  if (!title || !amount || amount <= 0 || !date) {
    alert('Mohon lengkapi data transaksi dengan benar.');
    return;
  }

  const newTransaction = {
    id: `TRX-${Date.now()}`,
    date,
    type,
    category,
    title,
    amount
  };

  transactions.unshift(newTransaction);
  await saveToStorage(transactions);
  renderList();

  // Reset form
  form.reset();
  itemDateInput.value = getLocalDateString();
  // Kembalikan ke state awal toggle (Pemasukan)
  btnTypeIncome.click();

  showToast(`Berhasil mencatat transaksi ${type === 'pemasukan' ? 'pemasukan' : 'pengeluaran'}: ${formatRupiah(amount)}`, true);

  // Jika transaksi adalah PEMASUKAN dan opsi receipt dicentang, langsung buka modal receipt untuk dicetak ke konsumen!
  if (type === 'pemasukan' && (!autoShowReceipt || autoShowReceipt.checked)) {
    openReceiptModal(newTransaction);
  }
});

// Interaksi List: Cetak Struk atau Hapus Transaksi
transactionListEl.addEventListener('click', async (e) => {
  // 1. Klik Tombol Cetak Bukti / Nota (btn-receipt-pill)
  const printBtn = e.target.closest('.btn-receipt-pill, .btn-print-receipt');
  if (printBtn) {
    const id = printBtn.getAttribute('data-id');
    const item = transactions.find(t => t.id === id);
    if (item) {
      openReceiptModal(item);
    }
    return;
  }

  // 2. Klik Tombol Hapus Item
  const deleteBtn = e.target.closest('.btn-delete');
  if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    if (confirm('Hapus rekaman transaksi ini?')) {
      transactions = transactions.filter(t => t.id !== id);
      await saveToStorage(transactions);
      renderList();
      showToast('Transaksi berhasil dihapus.');
    }
  }
});

// Reset Seluruh Data Kas
clearAllBtn.addEventListener('click', async () => {
  if (transactions.length === 0) return;
  if (confirm('PERINGATAN: Seluruh catatan kas UMKM akan dihapus dari penyimpanan lokal browser. Lanjutkan?')) {
    transactions = [];
    await saveToStorage(transactions);
    renderList();
    showToast('Seluruh data kas telah direset.');
  }
});

// Filter & Pencarian
searchInput.addEventListener('input', renderList);
filterTypeSelect.addEventListener('change', () => {
  updateFilterCategoryOptions();
  renderList();
});
filterCategorySelect.addEventListener('change', renderList);

// ========================================================
// 9. Integrasi File Direktori (MD & TXT)
// ========================================================

// 1. Muat Ulang File Direktori
loadLocalFileBtn.addEventListener('click', async () => {
  try {
    loadLocalFileBtn.textContent = '⏳ Memuat...';
    const success = await fetchLocalMarkdownFile();
    if (success) {
      renderList();
      showToast(`Data berhasil dimuat dari catatan_transaksi.md (${transactions.length} transaksi)`);
    } else {
      // Jika fetch gagal (karena batasan protokol file://), beri panduan impor langsung
      showToast('Gunakan tombol "Impor MD/TXT" jika membuka via protokol file:// langsung.', false);
      hiddenFileInput.click();
    }
  } catch {
    showToast('Gagal memuat berkas otomatis, silakan impor manual.', false);
  } finally {
    loadLocalFileBtn.textContent = '🔄 Muat File Direktori';
  }
});

// 2. Trigger Pemilihan File Lokal
importFileBtn.addEventListener('click', () => {
  hiddenFileInput.click();
});

// 3. Proses Impor File yang Dipilih
hiddenFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const content = event.target.result;
      const parsedItems = parseTransactionFile(content);

      if (parsedItems.length === 0) {
        alert('File tidak berisi format data transaksi yang valid.');
        return;
      }

      transactions = parsedItems;
      await saveToStorage(transactions);
      renderList();
      if (syncStatusHint) {
        syncStatusHint.textContent = `Data diimpor dari "${file.name}" (${parsedItems.length} transaksi)`;
      }
      showToast(`Sukses mengimpor ${parsedItems.length} transaksi dari ${file.name}!`);
    } catch {
      alert('Terjadi kesalahan saat membaca file.');
    } finally {
      hiddenFileInput.value = '';
    }
  };
  reader.readAsText(file);
});

// 4. Unduh / Ekspor ke File catatan_transaksi.md
exportMdBtn.addEventListener('click', () => {
  if (transactions.length === 0) {
    alert('Belum ada transaksi untuk diekspor.');
    return;
  }

  const mdContent = generateMarkdownContent(transactions);
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'catatan_transaksi.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('File catatan_transaksi.md berhasil diunduh. Simpan ke folder proyek.');
});

// ========================================================
// 10. Inisialisasi Service Worker & Aplikasi
// ========================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => {
        if (cacheStatusText) {
          cacheStatusText.textContent = 'LocalStorage & Offline Aktif';
        }
      })
      .catch(() => {
        // Fallback jika berjalan di lingkungan tanpa SW
      });
  });
}

// Inisialisasi Startup
(async function init() {
  itemDateInput.value = getLocalDateString();
  btnTypeIncome.click();
  await loadFromStorage();
  renderList();
})();

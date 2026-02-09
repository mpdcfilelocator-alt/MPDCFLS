// ===== FILE STORAGE TRACKER - ENHANCED MODERN VERSION =====
// Features: Dark/Light Mode, Modern UI, Responsive, File Management

// ===== Theme Toggle =====
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
}

function setTheme(theme) {
  if (theme === 'dark') {
    html.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    html.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

themeToggle.addEventListener('click', () => {
  const currentTheme = html.classList.contains('dark-mode') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
});

// ===== Navigation =====
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = link.getAttribute('data-section');
    showSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

document.querySelectorAll('.footer-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = link.getAttribute('data-section');
    showSection(section);
  });
});

function showSection(sectionId) {
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
  }
}

// ===== Modal Functions =====
function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

function closeChangeModal() {
  document.getElementById('change-account-modal').classList.remove('active');
}

// ===== Constants =====
const STORAGE_KEY = "fileStorageTrackerData";
const ACCOUNT_KEY = "fileStorageTrackerAccount";
let currentUser = localStorage.getItem('currentUser');

// Token to identify and abort in-progress renders when a new search starts
let currentRenderToken = 0;

// ===== Auth UI =====
function updateAuthUI() {
  const signinBtn = document.getElementById('signin-btn');
  const changeAccountBtn = document.getElementById('change-account-btn');
  const signoutBtn = document.getElementById('signout-header-btn');
  const navFeatures = document.querySelector('[data-section="features"]');
  const navInstructions = document.querySelector('[data-section="instructions"]');
  const navDevelopers = document.querySelector('[data-section="developers"]');
  const homeLink = document.querySelector('.navbar-nav a:first-child');
  const footerQuickLinks = document.getElementById('footer-quick-links');
  const footerLinks = document.querySelectorAll('.footer-link');
  
  if (currentUser) {
    signinBtn.style.display = 'none';
    changeAccountBtn.style.display = 'inline-block';
    signoutBtn.style.display = 'inline-block';
    navFeatures.style.display = 'none';
    navInstructions.style.display = 'none';
    navDevelopers.style.display = 'none';
    footerQuickLinks.style.display = 'none';
    footerLinks.forEach(link => link.style.pointerEvents = 'none');
    homeLink.textContent = 'Dashboard';
    homeLink.setAttribute('data-section', 'dashboard');
  } else {
    signinBtn.style.display = 'inline-block';
    changeAccountBtn.style.display = 'none';
    signoutBtn.style.display = 'none';
    navFeatures.style.display = 'inline-block';
    navInstructions.style.display = 'inline-block';
    navDevelopers.style.display = 'inline-block';
    footerQuickLinks.style.display = 'block';
    footerLinks.forEach(link => link.style.pointerEvents = 'auto');
    homeLink.textContent = 'Home';
    homeLink.setAttribute('data-section', 'hero');
  }
}

// ===== Sign In =====
document.getElementById('signin-btn').addEventListener('click', () => {
  document.getElementById('modal').classList.add('active');
});

document.getElementById('cancel-login').addEventListener('click', closeModal);

document.getElementById('submit-login').addEventListener('click', () => {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;
  
  if (!username || !password) {
    alert('Please enter username and password');
    return;
  }
  
  let storedAccount;
  try {
    storedAccount = JSON.parse(localStorage.getItem(ACCOUNT_KEY));
  } catch (e) {
    console.error('Invalid account data in storage:', e);
    storedAccount = null;
  }
  if (!storedAccount || !storedAccount.username || !storedAccount.password) {
    storedAccount = { username: 'user', password: 'password' };
  }
  
  if (username === storedAccount.username && password === storedAccount.password) {
      currentUser = username;
      localStorage.setItem('currentUser', currentUser);
      document.getElementById('login-user').value = '';
      document.getElementById('login-pass').value = '';
      closeModal();
      updateAuthUI();
      showSection('dashboard');
      // Refresh both results areas (defer to next tick to avoid blocking UI or triggering synchronous mutation loops)
      setTimeout(() => {
        try {
          searchFiles('', 'results');
          searchFiles('', 'results-main');
        } catch (e) {
          console.error('Error refreshing results after sign-in', e);
        }
      }, 0);
    } else {
    alert('Invalid credentials');
  }
});

// ===== Change Account =====
document.getElementById('change-account-btn').addEventListener('click', () => {
  document.getElementById('change-account-modal').classList.add('active');
});

document.getElementById('cancel-change').addEventListener('click', closeChangeModal);

document.getElementById('submit-change').addEventListener('click', () => {
  const newUsername = document.getElementById('change-user').value.trim();
  const newPassword = document.getElementById('change-pass').value;
  const confirmPassword = document.getElementById('change-pass-confirm').value;
  
  if (!newUsername || !newPassword || !confirmPassword) {
    alert('All fields are required');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  if (newPassword.length < 4) {
    alert('Password must be at least 4 characters');
    return;
  }
  
  const newAccount = { username: newUsername, password: newPassword };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(newAccount));
  currentUser = newUsername;
  localStorage.setItem('currentUser', currentUser);
  
  document.getElementById('change-user').value = '';
  document.getElementById('change-pass').value = '';
  document.getElementById('change-pass-confirm').value = '';
  closeChangeModal();
  updateAuthUI();
  alert('Account updated successfully!');
});

// ===== Sign Out =====
document.getElementById('signout-header-btn').addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  updateAuthUI();
  showSection('hero');
  document.getElementById('searchBar').value = '';
  searchFiles('');
});

// ===== File Management =====
async function loadFiles() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing stored files JSON:', e);
    // Notify the user and reset corrupted storage to avoid crashes
    alert('Warning: stored files data is corrupted and has been cleared. Please import a valid backup if you have one.');
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
} 

async function saveFiles(files) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

function addFile() {
  if (!currentUser) {
    alert('Please sign in first');
    return;
  }
  
  const title = document.getElementById('title').value.trim();
  const storage = document.getElementById('storage').value.trim();
  const info = document.getElementById('info').value.trim();
  const nativeDateInput = document.getElementById('native-date-input');
  
  if (!title || !storage) {
    alert('Title and Storage Location are required');
    return;
  }
  
  loadFiles().then(async files => {
    // Determine canonical date: prefer native date picker value, otherwise try parsing from title
    let parsedDate = null;
    if (nativeDateInput && nativeDateInput.value) {
      parsedDate = new Date(nativeDateInput.value);
    }
    if ((!parsedDate || isNaN(parsedDate)) && title) {
      parsedDate = parseDateString(title);
    }
    const fileDateISO = (parsedDate && !isNaN(parsedDate)) ? parsedDate.toISOString() : null;

    const newFile = {
      id: Date.now(),
      title,
      storage,
      info,
      createdDate: new Date().toISOString(),
      fileDate: fileDateISO,
      image: window.uploadedImageData || null // Add image data if uploaded
    };
    
    files.push(newFile);
    await saveFiles(files);
    
    // Show success notification with file details
    const successMessage = `
      <strong>File Added Successfully!</strong><br>
      <br>
      <strong>Date:</strong> ${title}<br>
      <strong>Location:</strong> ${storage}<br>
      ${info ? `<strong>Info:</strong> ${info}` : ''}
    `;
    showSuccessNotification(successMessage);
    
    clearForm();
    document.getElementById('addStatus').textContent = '';

    // Refresh both lists so sorting applies immediately
    searchFiles('', 'results');
    searchFiles('', 'results-main');
  });
} 

function clearForm() {
  document.getElementById('title').value = '';
  document.getElementById('storage').value = '';
  document.getElementById('info').value = '';
  document.getElementById('imageUpload').value = '';
  window.uploadedImageData = null; // Clear uploaded image data
}

function showSuccessNotification(message) {
  const modal = document.getElementById('success-notification');
  const messageEl = document.getElementById('success-message');
  messageEl.innerHTML = message;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeSuccessNotification() {
  const modal = document.getElementById('success-notification');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function displayAddStatus(message, type) {
  const statusEl = document.getElementById('addStatus');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
}

async function searchFiles(query, targetId = 'results') {
  const files = await loadFiles();
  const resultsDiv = document.getElementById(targetId);
  if (!resultsDiv) return;

  // Abort previous in-progress renders
  const myToken = ++currentRenderToken;

  // Clear and mark rendering state
  resultsDiv.innerHTML = '';
  resultsDiv.dataset.rendering = '1';

  console.log(`[searchFiles] start render token=${myToken} totalFiles=${files.length} query="${query}"`);

  if (files.length === 0 && !query) {
    resultsDiv.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 2rem;">📋 No files yet. Sign in to add your first file!</p>';
    delete resultsDiv.dataset.rendering;
    return;
  }

  let filteredFiles = files;
  if (query) {
    filteredFiles = files.filter(f =>
      (f.title || '').toLowerCase().includes(query.toLowerCase()) ||
      (f.storage || '').toLowerCase().includes(query.toLowerCase()) ||
      (f.info || '').toLowerCase().includes(query.toLowerCase())
    );
  }

  if (filteredFiles.length === 0) {
    resultsDiv.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 2rem;">🔍 No files found. Try searching or add a new file.</p>';
    delete resultsDiv.dataset.rendering;
    return;
  }

  // Cap to a safe maximum to avoid freezing the browser
  const MAX_RENDER = 500; // lowered cap to avoid UI freezes
  const overLimit = filteredFiles.length > MAX_RENDER;
  if (overLimit && !window._allowLargeRender) {
    const notice = document.createElement('div');
    notice.style.padding = '1rem';
    notice.style.color = 'var(--text-secondary)';
    notice.style.textAlign = 'center';
    notice.innerHTML = `⚠️ Too many results (${filteredFiles.length}). Showing first ${MAX_RENDER} items to avoid freezing.<br><button id="load-more-inline" style="margin-top:8px;padding:6px 10px;border-radius:6px;">Load all results</button>`;
    resultsDiv.appendChild(notice);
    filteredFiles = filteredFiles.slice(0, MAX_RENDER);

    // Wire up inline load all button
    setTimeout(() => {
      const btn = document.getElementById('load-more-inline');
      if (btn) btn.addEventListener('click', () => {
        window._allowLargeRender = true;
        // restart rendering with same query
        searchFiles(query, targetId);
      });
    }, 0);
  }

  const batchSize = 100;
  let index = 0;

  const renderBatch = () => {
    // If a new render started, abort this one
    if (myToken !== currentRenderToken) {
      console.log(`[searchFiles] aborting token=${myToken} (new token=${currentRenderToken})`);
      delete resultsDiv.dataset.rendering;
      return;
    }

    const end = Math.min(index + batchSize, filteredFiles.length);
    // Build batch HTML and append using a fragment to minimize reflows
    try {
      const html = filteredFiles.slice(index, end).map(file => {
        const dateHtml = file.fileDate ? `<div class="file-date" style="font-size:0.9rem; color:var(--text-secondary);">${formatDateForDisplay(new Date(file.fileDate))}</div>` : '';
        return `
        <div class="file-card" data-file-id="${file.id}" data-date="${file.fileDate || ''}">
          <div class="file-header" style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
            <h3 class="file-title" style="margin:0;"><i class="fas fa-file"></i> ${escapeHtml(file.title)}</h3>
            ${dateHtml}
          </div>
          <div class="file-content" style="display: flex; gap: 20px; align-items: flex-start; margin-top:10px;">
            ${file.image ? `<div style="flex-shrink: 0;">
              <img class="file-image-thumbnail" src="${file.image}" alt="File image" onclick="openImageViewer('${file.image.replace(/'/g, "\\'")}')">
            </div>` : ''}
            <div style="flex: 1; min-width: 0;">
              <div class="file-item">
                <span class="file-label">📁 Location:</span>
                <span class="file-value">${escapeHtml(file.storage)}</span>
              </div>
              ${file.info ? `<div class="file-item">
                <span class="file-label">📝 Info:</span>
                <span class="file-value">${escapeHtml(file.info)}</span>
              </div>` : ''}
            </div>
          </div>
          <div class="file-actions" style="margin-top:12px;">
            <button class="btn btn-primary" onclick="openEditFlow(${file.id})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-secondary" onclick="openDeleteFlow(${file.id})">
              <i class="fas fa-trash"></i> Delete
            </button>
            ${file.borrowedBy ? `<button class="btn btn-outline" disabled style="margin-left:8px;">Borrowed by ${escapeHtml(file.borrowedBy)}</button><button class="btn btn-secondary" style="margin-left:8px;" onclick="returnFile(${file.id})">Return</button>` : `<button class="btn btn-success" style="margin-left:8px;" onclick="borrowFile(${file.id})">Borrow</button>`}
          </div> 
        </div>`;
      }).join('');

      const temp = document.createElement('div');
      temp.innerHTML = html;
      const frag = document.createDocumentFragment();
      while (temp.firstChild) frag.appendChild(temp.firstChild);
      resultsDiv.appendChild(frag);
      console.log(`[searchFiles] rendered items ${index}..${end} (token=${myToken})`);
    } catch (e) {
      console.error('[searchFiles] error rendering batch', e);
      delete resultsDiv.dataset.rendering;
      return;
    }

    index = end;
      // update progress (console only to avoid extra DOM work)
      const percent = Math.round((index / filteredFiles.length) * 100);
      console.log(`[searchFiles] progress ${index}/${filteredFiles.length} (${percent}%)`); 

    if (index < filteredFiles.length) {
      // schedule next batch so the UI can breathe
      setTimeout(renderBatch, 0);
    } else {
      // finished
      delete resultsDiv.dataset.rendering;
      console.log(`[searchFiles] finished render token=${myToken}`);

      // Apply current sort mode once after rendering completes
      const sortSelect = document.getElementById('sort-select');
      if (sortSelect && sortSelect.value) {
        try {
          resultsDiv.dataset.sorting = '1';
          sortResults(resultsDiv, sortSelect.value);
        } finally {
          delete resultsDiv.dataset.sorting;
        }
      }
    }
  };

  // Start rendering in the next tick
  setTimeout(renderBatch, 0);
}  

// Store the action that needs password verification
let pendingAction = null;

function openEditFlow(fileId) {
  pendingAction = { type: 'edit', fileId };
  document.getElementById('verify-modal-title').textContent = 'Verify Password to Edit';
  document.getElementById('password-verify-modal').classList.add('active');
  document.getElementById('verify-password').value = '';
  document.getElementById('verify-password').focus();
}

function openDeleteFlow(fileId) {
  pendingAction = { type: 'delete', fileId };
  document.getElementById('verify-modal-title').textContent = 'Verify Password to Delete';
  document.getElementById('password-verify-modal').classList.add('active');
  document.getElementById('verify-password').value = '';
  document.getElementById('verify-password').focus();
}

function closeVerifyModal() {
  document.getElementById('password-verify-modal').classList.remove('active');
}

function cancelVerify() {
  pendingAction = null;
  closeVerifyModal();
}

function closeEditModal() {
  document.getElementById('edit-file-modal').classList.remove('active');
}

async function proceedWithAction(password) {
  const trimmedPassword = password.trim();
  let storedAccount;
  try {
    storedAccount = JSON.parse(localStorage.getItem(ACCOUNT_KEY));
  } catch (e) {
    console.error('Invalid account data in storage:', e);
    storedAccount = null;
  }
  if (!storedAccount || !storedAccount.username || !storedAccount.password) {
    storedAccount = { username: 'user', password: 'password' };
  }
  
  console.log('Password entered:', trimmedPassword);
  console.log('Stored password:', storedAccount.password);
  console.log('Pending action:', pendingAction);
  
  if (trimmedPassword !== storedAccount.password) {
    alert('Incorrect password!');
    return;
  }
  
  console.log('Password correct, proceeding with action');
  closeVerifyModal();
  alert('Password verified — processing...');
  
  if (!pendingAction) {
    console.error('Pending action is null!');
    return;
  }
  
  if (pendingAction.type === 'edit') {
    console.log('Opening edit for file ID:', pendingAction.fileId);
    await openEditFile(pendingAction.fileId);
  } else if (pendingAction.type === 'delete') {
    console.log('Deleting file ID:', pendingAction.fileId);
    await deleteFile(pendingAction.fileId);
  } else {
    console.error('Unknown action type:', pendingAction.type);
  }
  
  pendingAction = null;
}

async function openEditFile(fileId) {
  const files = await loadFiles();
  const file = files.find(f => f.id === fileId);
  
  if (!file) {
    alert('File not found!');
    return;
  }
  
  document.getElementById('edit-title').value = file.title;
  document.getElementById('edit-storage').value = file.storage;
  document.getElementById('edit-info').value = file.info || '';
  document.getElementById('edit-file-modal').dataset.fileId = fileId;
  document.getElementById('edit-file-modal').classList.add('active');
  document.getElementById('edit-title').focus();
}

async function saveEditFile() {
  const fileId = parseInt(document.getElementById('edit-file-modal').dataset.fileId);
  const title = document.getElementById('edit-title').value.trim();
  const storage = document.getElementById('edit-storage').value.trim();
  const info = document.getElementById('edit-info').value.trim();
  
  if (!title || !storage) {
    alert('Title and Storage Location are required');
    return;
  }
  
  let files = await loadFiles();
  const fileIndex = files.findIndex(f => f.id === fileId);
  
  if (fileIndex !== -1) {
    files[fileIndex].title = title;
    files[fileIndex].storage = storage;
    files[fileIndex].info = info;
    // Re-parse possible date changes in title
    const parsedDate = parseDateString(title);
    files[fileIndex].fileDate = (parsedDate && !isNaN(parsedDate)) ? parsedDate.toISOString() : files[fileIndex].fileDate || null;
    await saveFiles(files);
    closeEditModal();
    const query = document.getElementById('searchBar').value;
    searchFiles(query, 'results');
    searchFiles(query, 'results-main');
    displayAddStatus('✓ File updated successfully!', 'success');
  }
}

async function deleteFile(id) {
  let files = await loadFiles();
  files = files.filter(f => f.id !== id);
  await saveFiles(files);
  
  // Refresh search results - use the current search query from both possible search bars
  const query = document.getElementById('searchBar') ? document.getElementById('searchBar').value : '';
  if (query || document.getElementById('results').innerHTML) {
    searchFiles(query, 'results');
  }
  
  const query2 = document.getElementById('searchBar-main') ? document.getElementById('searchBar-main').value : '';
  if (query2 || document.getElementById('results-main').innerHTML) {
    searchFiles(query2, 'results-main');
  }
  
  displayAddStatus('✓ File deleted successfully!', 'success');
}

// Borrow/Return functions using a selected worker stored in localStorage('selectedWorker')
async function borrowFile(id) {
  const selected = localStorage.getItem('selectedWorker');
  if (!selected) { alert('Please select a worker from the top-left Workers box before borrowing.'); return; }
  let files = await loadFiles();
  const idx = files.findIndex(f => f.id === id);
  if (idx === -1) return;
  if (files[idx].borrowedBy) { alert('File is already borrowed'); return; }
  files[idx].borrowedBy = selected;
  await saveFiles(files);

  // Immediate UI feedback: disable the clicked borrow button if present
  try {
    const card = document.querySelector(`.file-card[data-file-id="${id}"]`);
    if (card) {
      const borrowBtn = card.querySelector('button[onclick^="borrowFile("]');
      if (borrowBtn) {
        borrowBtn.textContent = 'Borrowed';
        borrowBtn.disabled = true;
      }
      const borrowedLabel = document.createElement('div');
      borrowedLabel.style.fontSize = '12px';
      borrowedLabel.style.color = '#555';
      borrowedLabel.textContent = 'Borrowed by: ' + selected;
      const header = card.querySelector('.file-header');
      if (header && !card.querySelector('.borrowed-by-inline')) {
        borrowedLabel.className = 'borrowed-by-inline';
        header.appendChild(borrowedLabel);
      }
    }
  } catch (e) { /* non-fatal UI update failed */ }

  // Re-run searches with small delays to avoid render/token races
  const q = document.getElementById('searchBar') ? document.getElementById('searchBar').value : '';
  const q2 = document.getElementById('searchBar-main') ? document.getElementById('searchBar-main').value : '';
  setTimeout(() => searchFiles(q, 'results'), 80);
  setTimeout(() => searchFiles(q2, 'results-main'), 180);
}

async function returnFile(id) {
  let files = await loadFiles();
  const idx = files.findIndex(f => f.id === id);
  if (idx === -1) return;
  files[idx].borrowedBy = null;
  await saveFiles(files);

  // Immediate UI feedback: enable borrow button and remove inline label
  try {
    const card = document.querySelector(`.file-card[data-file-id="${id}"]`);
    if (card) {
      const borrowBtn = card.querySelector('button[onclick^="borrowFile("]');
      if (borrowBtn) {
        borrowBtn.textContent = 'Borrow';
        borrowBtn.disabled = false;
      }
      const inline = card.querySelector('.borrowed-by-inline');
      if (inline) inline.remove();
    }
  } catch (e) { /* non-fatal */ }

  const q = document.getElementById('searchBar') ? document.getElementById('searchBar').value : '';
  const q2 = document.getElementById('searchBar-main') ? document.getElementById('searchBar-main').value : '';
  setTimeout(() => searchFiles(q, 'results'), 80);
  setTimeout(() => searchFiles(q2, 'results-main'), 180);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

async function exportFiles() {
  const files = await loadFiles();
  if (files.length === 0) {
    alert('No files to export');
    return;
  }
  
  const dataStr = JSON.stringify(files, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `files-backup-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  alert('✓ Files exported successfully!');
}

async function importFiles() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    try {
      const text = await file.text();
      const importedFiles = JSON.parse(text);
      
      if (!Array.isArray(importedFiles)) {
        alert('Invalid file format');
        return;
      }
      
      const existingFiles = await loadFiles();
      const merged = [...existingFiles, ...importedFiles];
      await saveFiles(merged);
      
      alert(`✓ Imported ${importedFiles.length} files!`);
      searchFiles('', 'results');
      searchFiles('', 'results-main');
    } catch (error) {
      alert('Error reading file: ' + error.message);
    }
  };
  
  input.click();
}

// ===== Event Listeners =====
function setupEventListeners() {
  const searchHero = document.getElementById('searchBar');
  if (searchHero) {
    let searchTimeout;
    searchHero.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchFiles(e.target.value, 'results');
      }, 300);
    });
  }

  const searchMain = document.getElementById('searchBar-main');
  if (searchMain) {
    let searchTimeout;
    searchMain.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchFiles(e.target.value, 'results-main');
      }, 300);
    });
  }



  document.getElementById('title').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addFile();
  });

  // Password verification modal listeners
  document.getElementById('cancel-verify').addEventListener('click', closeVerifyModal);
  document.getElementById('submit-verify').addEventListener('click', () => {
    const password = document.getElementById('verify-password').value;
    proceedWithAction(password);
  });

  document.getElementById('verify-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const password = document.getElementById('verify-password').value;
      proceedWithAction(password);
    }
  });

  // Edit modal listeners
  document.getElementById('cancel-edit').addEventListener('click', closeEditModal);
  document.getElementById('submit-edit').addEventListener('click', saveEditFile);

  document.getElementById('edit-title').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveEditFile();
  });

  // Prevent modal from closing when clicking inside
  ['modal', 'change-account-modal', 'password-verify-modal', 'edit-file-modal'].forEach(id => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          if (id === 'password-verify-modal') {
            closeVerifyModal();
          } else if (id === 'edit-file-modal') {
            closeEditModal();
          } else {
            modal.classList.remove('active');
          }
        }
      });
    }
  });
}

// ===== CUSTOM CURSOR IMPLEMENTATION =====
/**
 * Modern custom cursor with flowing tail line effect
 * - Small blue dot (8px) following the mouse
 * - Continuous glowing line tail that fades smoothly
 * - Auto-disables on touch devices
 * - Scales up on hover over clickable elements
 * - Zero lag, uses requestAnimationFrame
 */

/* custom cursor removed to avoid pointer freezes and high CPU usage */

// ===== Initialization =====
window.addEventListener('load', () => {
  initTheme();
  updateAuthUI();
  setupEventListeners();
  showSection('hero');
});

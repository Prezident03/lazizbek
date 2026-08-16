// ==========================================================
// ADMIN.JS
// admin.html sahifasi uchun: Firebase Auth bilan kirish va
// Firestore "projects" collection'ini boshqarish (qo'shish/
// tahrirlash/o'chirish). Buni ishlatish uchun avval Firebase
// Console > Authentication > Sign-in method > Email/Password'ni
// yoqing va Users bo'limidan o'zingizga hisob yarating.
// ==========================================================

const loginWrap = document.getElementById('adminLoginWrap');
const panel = document.getElementById('adminPanel');
const loginForm = document.getElementById('adminLoginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

const listEl = document.getElementById('adminProjectsList');
const modal = document.getElementById('adminModal');
const modalTitle = document.getElementById('modalTitle');
const modalClose = document.getElementById('modalClose');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const newProjectBtn = document.getElementById('newProjectBtn');
const form = document.getElementById('projectForm');
const formError = document.getElementById('formError');
const saveBtn = document.getElementById('saveProjectBtn');

const fCategoryKey = document.getElementById('fCategoryKey');
const fCategoryLabel = document.getElementById('fCategoryLabel');

// ---------- AUTH ----------
if (!auth) {
  loginError.textContent = 'Firebase Auth ulanmagan. firebase-auth-compat.js skripti yuklanganini tekshiring.';
  loginError.classList.add('show');
} else {
  auth.onAuthStateChanged((user) => {
    if (user) {
      loginWrap.style.display = 'none';
      panel.style.display = 'block';
      loadProjects();
    } else {
      loginWrap.style.display = 'flex';
      panel.style.display = 'none';
    }
  });
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.remove('show');
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  loginBtn.disabled = true;
  loginBtn.textContent = 'KIRILMOQDA...';
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    console.error(err);
    if (err.code === 'auth/invalid-api-key' || err.code === 'auth/api-key-not-valid') {
      loginError.textContent = "Firebase konfiguratsiyasi noto'g'ri (js/firebase-config.js). Haqiqiy apiKey/projectId qo'yilganini tekshiring.";
    } else if (err.code === 'auth/user-not-found') {
      loginError.textContent = "Bunday email bilan foydalanuvchi topilmadi. Firebase Console > Authentication > Users'da yaratilganini tekshiring.";
    } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      loginError.textContent = "Parol noto'g'ri.";
    } else if (err.code === 'auth/operation-not-allowed') {
      loginError.textContent = "Email/Password kirish usuli Firebase'da yoqilmagan (Authentication > Sign-in method).";
    } else if (err.code === 'auth/network-request-failed') {
      loginError.textContent = "Internet aloqasi yo'q yoki Firebase domeni bloklangan.";
    } else {
      loginError.textContent = `Xatolik: ${err.code || err.message || 'nomalum xato'}`;
    }
    loginError.classList.add('show');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'KIRISH';
  }
});

logoutBtn.addEventListener('click', () => auth.signOut());

// ---------- CATEGORY LABEL AUTO-FILL ----------
fCategoryKey.addEventListener('change', () => {
  const opt = fCategoryKey.selectedOptions[0];
  if (opt && opt.dataset.label && !fCategoryLabel.value.trim()) {
    fCategoryLabel.value = opt.dataset.label;
  }
});

// ---------- LOAD & RENDER PROJECT LIST ----------
async function loadProjects() {
  listEl.innerHTML = `<p class="mono" style="color:var(--stone-dim);">Yuklanmoqda...</p>`;
  try {
    const snap = await db.collection('projects').orderBy('order', 'asc').get();
    if (snap.empty) {
      listEl.innerHTML = `<p class="mono" style="color:var(--stone-dim);">Hozircha loyiha yo'q. "YANGI LOYIHA" tugmasini bosing.</p>`;
      return;
    }
    const rows = snap.docs.map(doc => {
      const p = doc.data();
      return `
        <div class="admin-project-row" data-id="${doc.id}">
          <div class="admin-project-thumb" style="${p.coverImage ? `background-image:url('${escapeAttr(p.coverImage)}');background-size:cover;background-position:center;` : ''}">
            ${!p.coverImage ? '<i class="ti ti-movie"></i>' : ''}
          </div>
          <div class="admin-project-info">
            <strong>${escapeHtml(p.title || 'Nomsiz')}</strong>
            <span class="mono">${escapeHtml(p.categoryLabel || '')} · ${escapeHtml(p.year || '')}${p.featured ? ' · <span style="color:var(--gold);">BOSH SAHIFADA</span>' : ''}</span>
          </div>
          <div class="admin-project-actions">
            <button type="button" class="btn btn-ghost btn-sm edit-btn" data-id="${doc.id}"><i class="ti ti-edit"></i></button>
            <button type="button" class="btn btn-ghost btn-sm delete-btn" data-id="${doc.id}"><i class="ti ti-trash"></i></button>
          </div>
        </div>`;
    }).join('');
    listEl.innerHTML = rows;

    listEl.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openEdit(btn.dataset.id));
    });
    listEl.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteProject(btn.dataset.id));
    });
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<p class="mono" style="color:var(--stone-dim);">Xatolik: loyihalarni yuklab bo'lmadi.</p>`;
  }
}

// ---------- MODAL OPEN/CLOSE ----------
function openModal() { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal() { modal.classList.remove('open'); document.body.style.overflow = ''; }

newProjectBtn.addEventListener('click', () => {
  form.reset();
  document.getElementById('projectId').value = '';
  document.getElementById('fFeatured').checked = true;
  document.getElementById('fOrder').value = 0;
  modalTitle.textContent = "Yangi loyiha qo'shish";
  formError.classList.remove('show');
  openModal();
});
modalClose.addEventListener('click', closeModal);
cancelFormBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

async function openEdit(id) {
  formError.classList.remove('show');
  try {
    const doc = await db.collection('projects').doc(id).get();
    if (!doc.exists) return;
    const p = doc.data();
    document.getElementById('projectId').value = id;
    document.getElementById('fTitle').value = p.title || '';
    document.getElementById('fCategoryKey').value = p.categoryKey || '';
    document.getElementById('fCategoryLabel').value = p.categoryLabel || '';
    document.getElementById('fDuration').value = p.durationLabel || '';
    document.getElementById('fLocation').value = p.location || '';
    document.getElementById('fYear').value = p.year || '';
    document.getElementById('fCoverImage').value = p.coverImage || '';
    document.getElementById('fVideoUrl').value = p.videoUrl || '';
    document.getElementById('fStoryText').value = p.storyText || '';
    document.getElementById('fFilmText').value = p.filmText || '';
    document.getElementById('fBehindPhotos').value = Array.isArray(p.behindPhotos) ? p.behindPhotos.join('\n') : '';
    document.getElementById('fFeatured').checked = !!p.featured;
    document.getElementById('fOrder').value = typeof p.order === 'number' ? p.order : 0;
    modalTitle.textContent = 'Loyihani tahrirlash';
    openModal();
  } catch (err) {
    console.error(err);
  }
}

async function deleteProject(id) {
  if (!confirm("Ushbu loyihani o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.")) return;
  try {
    await db.collection('projects').doc(id).delete();
    loadProjects();
  } catch (err) {
    console.error(err);
    alert("O'chirishda xatolik yuz berdi.");
  }
}

// ---------- SAVE (CREATE / UPDATE) ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.classList.remove('show');

  const id = document.getElementById('projectId').value;
  const behindRaw = document.getElementById('fBehindPhotos').value.trim();
  const behindPhotos = behindRaw ? behindRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

  const data = {
    title: document.getElementById('fTitle').value.trim(),
    categoryKey: document.getElementById('fCategoryKey').value,
    categoryLabel: document.getElementById('fCategoryLabel').value.trim(),
    durationLabel: document.getElementById('fDuration').value.trim(),
    location: document.getElementById('fLocation').value.trim(),
    year: document.getElementById('fYear').value.trim(),
    coverImage: document.getElementById('fCoverImage').value.trim(),
    videoUrl: document.getElementById('fVideoUrl').value.trim(),
    storyText: document.getElementById('fStoryText').value.trim(),
    filmText: document.getElementById('fFilmText').value.trim(),
    behindPhotos,
    featured: document.getElementById('fFeatured').checked,
    order: Number(document.getElementById('fOrder').value) || 0
  };

  if (!data.title || !data.categoryKey) {
    formError.textContent = "Nomi va kategoriya majburiy.";
    formError.classList.add('show');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'SAQLANMOQDA...';

  try {
    if (id) {
      await db.collection('projects').doc(id).update(data);
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('projects').add(data);
    }
    closeModal();
    loadProjects();
  } catch (err) {
    console.error(err);
    formError.textContent = 'Saqlashda xatolik yuz berdi.';
    formError.classList.add('show');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'SAQLASH';
  }
});

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}
function escapeAttr(str) { return escapeHtml(str); }

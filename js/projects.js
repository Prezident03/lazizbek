// ==========================================================
// PROJECTS.JS
// Firestore "projects" collection'idan loyihalarni o'qib,
// bosh sahifa / portfolio / loyiha (project.html) sahifalarida
// ko'rsatadi. admin.html shu collection'ga yozadi.
//
// Hujjat maydonlari (admin.html shakli orqali to'ldiriladi):
//   title          — "Aziz va Madina" (mijoz/juftlik nomi)
//   categoryKey    — wedding | graduation | loveStory | event | commercial | session | other
//   categoryLabel  — "To'y filmi" (ko'rinadigan yorliq)
//   location       — "Samarqand"
//   year           — "2026"
//   durationLabel  — "6-8 daqiqa" (ixtiyoriy)
//   coverImage     — rasm URL (ixtiyoriy, bo'lmasa gradient fallback)
//   videoUrl       — YouTube yoki Vimeo havolasi (oddiy, watch/share link — o'zi embed'ga aylantiriladi)
//   storyText      — asosiy hikoya matni
//   filmText       — "film haqida" qisqa matn
//   behindPhotos   — massiv, rasm URL'lari (kadr ortidagi lahzalar)
//   featured       — true bo'lsa, bosh sahifada ham chiqadi
//   order          — tartiblash uchun raqam (kichik = birinchi)
// ==========================================================

const FALLBACK_GRADIENTS = [
  'radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.2), transparent 60%), linear-gradient(135deg,#1a1408,#050504)',
  'radial-gradient(ellipse at 70% 30%, rgba(180,100,60,0.2), transparent 60%), linear-gradient(135deg,#1a0e08,#050504)',
  'radial-gradient(ellipse at 40% 60%, rgba(160,60,90,0.2), transparent 60%), linear-gradient(135deg,#1a0b10,#050504)',
  'radial-gradient(ellipse at 60% 40%, rgba(90,130,190,0.2), transparent 60%), linear-gradient(135deg,#0c101a,#050504)',
  'radial-gradient(ellipse at 20% 80%, rgba(212,175,55,0.18), transparent 60%), linear-gradient(135deg,#161308,#050504)',
  'radial-gradient(ellipse at 80% 70%, rgba(140,70,120,0.2), transparent 60%), linear-gradient(135deg,#180c16,#050504)'
];
function gradientFor(seedStr) {
  let h = 0;
  for (let i = 0; i < (seedStr || '').length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  return FALLBACK_GRADIENTS[h % FALLBACK_GRADIENTS.length];
}

// Har qanday YouTube/Vimeo havolasini (watch, share, youtu.be, vimeo.com) embed URL'ga aylantiradi.
function toEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace('www.', '');
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' && parts[1]) return `https://www.youtube.com/embed/${parts[1]}?autoplay=1&rel=0`;
      if (parts[0] === 'shorts' && parts[1]) return `https://www.youtube.com/embed/${parts[1]}?autoplay=1&rel=0`;
    }
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (host === 'vimeo.com') {
      const parts = u.pathname.split('/').filter(Boolean);
      const id = parts[0];
      if (id) return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    if (host === 'player.vimeo.com') {
      return url + (url.includes('?') ? '&' : '?') + 'autoplay=1';
    }
  } catch (e) { /* not a valid URL — ignore */ }
  return null;
}

function workCardHtml(p) {
  const media = p.coverImage
    ? `<img src="${escapeAttr(p.coverImage)}" alt="${escapeAttr(p.title)}" loading="lazy">`
    : `<div class="fallback-bg" style="background:${gradientFor(p.title || p.id)};"></div>`;
  return `
    <a href="project.html?id=${encodeURIComponent(p.id)}" class="work-card-v2 reveal" data-category="${escapeAttr(p.categoryKey || 'other')}">
      <div class="work-thumb">
        ${media}
        <span class="play-btn-ring"><i class="ti ti-player-play-filled"></i></span>
      </div>
      <div class="work-info">
        <h3 class="work-title-v2">${escapeHtml(p.title || 'Nomsiz loyiha')}</h3>
        <p class="work-meta-v2">${escapeHtml(p.categoryLabel || '')} <span class="dot-sep">•</span> ${escapeHtml(p.year || '')}</p>
      </div>
    </a>`;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}
function escapeAttr(str) { return escapeHtml(str); }

async function fetchProjects({ featuredOnly = false, limit = null } = {}) {
  let q = db.collection('projects').orderBy('order', 'asc');
  const snap = await q.get();
  let items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (featuredOnly) items = items.filter(p => p.featured);
  if (limit) items = items.slice(0, limit);
  return items;
}

// ---------- Bosh sahifa: tanlangan ishlar (featured, ko'pi bilan 6 ta) ----------
async function renderHomeWorks() {
  const grid = document.getElementById('worksGrid');
  if (!grid) return;
  try {
    const items = await fetchProjects({ featuredOnly: true, limit: 6 });
    if (!items.length) {
      grid.innerHTML = `<p class="mono" style="color:var(--stone-dim);grid-column:1/-1;text-align:center;padding:40px 0;">Hozircha loyihalar qo'shilmagan. Admin panel orqali qo'shing.</p>`;
      return;
    }
    grid.innerHTML = items.map(workCardHtml).join('');
  } catch (err) {
    console.error('renderHomeWorks error:', err);
    grid.innerHTML = `<p class="mono" style="color:var(--stone-dim);grid-column:1/-1;text-align:center;padding:40px 0;">Loyihalarni yuklab bo'lmadi.</p>`;
  } finally {
    if (window.initPortfolioFilter) window.initPortfolioFilter();
    if (window.scanReveal) window.scanReveal();
  }
}

// ---------- Portfolio sahifasi: barcha loyihalar ----------
async function renderFullPortfolio() {
  const grid = document.getElementById('fullWorksGrid');
  if (!grid) return;
  try {
    const items = await fetchProjects();
    if (!items.length) {
      grid.innerHTML = `<p class="mono" style="color:var(--stone-dim);grid-column:1/-1;text-align:center;padding:60px 0;">Hozircha loyihalar qo'shilmagan. Admin panel orqali qo'shing.</p>`;
      return;
    }
    grid.innerHTML = items.map(workCardHtml).join('');
  } catch (err) {
    console.error('renderFullPortfolio error:', err);
    grid.innerHTML = `<p class="mono" style="color:var(--stone-dim);grid-column:1/-1;text-align:center;padding:60px 0;">Loyihalarni yuklab bo'lmadi.</p>`;
  } finally {
    if (window.initPortfolioFilter) window.initPortfolioFilter();
    if (window.scanReveal) window.scanReveal();
  }
}

// ---------- Loyiha (project.html) sahifasi: bitta loyiha, ?id= orqali ----------
async function renderProjectDetail() {
  const root = document.getElementById('projectRoot');
  if (!root) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    root.innerHTML = projectNotFoundHtml();
    return;
  }

  try {
    const doc = await db.collection('projects').doc(id).get();
    if (!doc.exists) {
      root.innerHTML = projectNotFoundHtml();
      return;
    }
    const p = { id: doc.id, ...doc.data() };
    document.title = `${p.title || 'Loyiha'} — ${p.categoryLabel || ''} · Lazizbek Media`;
    root.innerHTML = projectDetailHtml(p);
    wireProjectPlayer(p);
  } catch (err) {
    console.error('renderProjectDetail error:', err);
    root.innerHTML = projectNotFoundHtml();
  } finally {
    if (window.scanReveal) window.scanReveal();
  }
}

function projectNotFoundHtml() {
  return `
    <div class="section-wrap" style="padding:180px 24px 120px;text-align:center;">
      <span class="eyebrow">LOYIHA TOPILMADI</span>
      <h1 style="margin:18px 0 28px;">Bu loyiha <span class="serif-italic">mavjud emas</span> yoki o'chirilgan.</h1>
      <a href="portfolio.html" class="btn btn-outline">← BARCHA LOYIHALARNI KO'RISH</a>
    </div>`;
}

function projectDetailHtml(p) {
  const embedUrl = toEmbedUrl(p.videoUrl);
  const posterBg = p.coverImage
    ? `background-image:url('${escapeAttr(p.coverImage)}');background-size:cover;background-position:center;`
    : `background:${gradientFor(p.title || p.id)};`;
  const behind = Array.isArray(p.behindPhotos) ? p.behindPhotos.filter(Boolean) : [];

  return `
  <section class="project-detail-hero">
    <div class="section-wrap project-detail-grid">
      <div class="project-detail-info reveal">
        <h1 class="project-detail-title">${escapeHtml(p.title || '')}</h1>
        <p class="project-detail-sub">${escapeHtml(p.categoryLabel || '')}</p>
        <p class="project-detail-loc">${escapeHtml(p.location || '')}${p.location && p.year ? ' <span class="dot-sep">•</span> ' : ''}${escapeHtml(p.year || '')}</p>

        <div class="project-badges">
          ${p.categoryLabel ? `<span class="p-badge"><i class="ti ti-heart"></i> ${escapeHtml(p.categoryLabel.toUpperCase())}</span>` : ''}
          ${p.durationLabel ? `<span class="p-badge"><i class="ti ti-clock"></i> ${escapeHtml(p.durationLabel)}</span>` : ''}
          ${p.year ? `<span class="p-badge"><i class="ti ti-calendar"></i> ${escapeHtml(p.year)}</span>` : ''}
        </div>

        ${p.storyText ? `<p class="project-detail-story">${escapeHtml(p.storyText)}</p>` : ''}

        <div class="project-detail-actions">
          ${embedUrl ? `<button type="button" class="btn btn-gold" id="playFilmBtn"><i class="ti ti-player-play-filled"></i> FILMNI KO'RISH</button>` : ''}
          <button type="button" class="btn btn-outline" id="shareProjectBtn"><i class="ti ti-share-3"></i> ULASHISH</button>
        </div>
      </div>

      <div class="project-detail-video reveal">
        <div class="project-video-frame" id="projectVideoFrame" style="${posterBg}">
          ${embedUrl ? `<button type="button" class="video-play-overlay" id="videoPlayOverlay" aria-label="Videoni ko'rish"><span class="play-btn-ring big"><i class="ti ti-player-play-filled"></i></span></button>` : `<div class="video-no-link"><i class="ti ti-movie-off"></i><span>Video havolasi qo'shilmagan</span></div>`}
        </div>
      </div>
    </div>
  </section>

  ${(p.filmText || behind.length) ? `
  <section class="section project-lower-section">
    <div class="section-wrap project-lower-grid">
      ${p.storyText ? `
      <div class="reveal">
        <h4 class="project-lower-head">HIKOYA</h4>
        <p class="project-lower-text">${escapeHtml(shortenText(p.storyText, 140))}</p>
      </div>` : '<div></div>'}
      ${p.filmText ? `
      <div class="reveal">
        <h4 class="project-lower-head">FILM</h4>
        <p class="project-lower-text">${escapeHtml(p.filmText)}</p>
      </div>` : '<div></div>'}
      ${behind.length ? `
      <div class="reveal project-behind-col">
        <h4 class="project-lower-head">KADRDAN KEYIN</h4>
        <p class="project-lower-text" style="margin-bottom:14px;">Kamera ortidagi lahzalar.</p>
        <div class="project-behind-strip">
          ${behind.slice(0, 4).map(url => `<div class="behind-thumb" style="background-image:url('${escapeAttr(url)}');"></div>`).join('')}
        </div>
      </div>` : ''}
    </div>
  </section>` : ''}

  <section class="project-plan-cta reveal">
    <div class="project-plan-inner">
      <p class="project-plan-text">O'Z HIKOYANGIZNI <span class="serif-italic">rejalashtiryapsizmi?</span></p>
      <a href="buyurtma.html" class="btn btn-gold">SANANGIZNI BAND QILING</a>
    </div>
  </section>`;
}

function shortenText(text, maxLen) {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + '…';
}

function wireProjectPlayer(p) {
  const embedUrl = toEmbedUrl(p.videoUrl);
  const overlay = document.getElementById('videoPlayOverlay');
  const frame = document.getElementById('projectVideoFrame');
  const playFilmBtn = document.getElementById('playFilmBtn');

  function playVideo() {
    if (!embedUrl || !frame) return;
    frame.style.backgroundImage = 'none';
    frame.innerHTML = `<iframe src="${embedUrl}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${escapeAttr(p.title || 'Video')}"></iframe>`;
  }
  if (overlay) overlay.addEventListener('click', playVideo);
  if (playFilmBtn) playFilmBtn.addEventListener('click', playVideo);

  const shareBtn = document.getElementById('shareProjectBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = { title: p.title || 'Lazizbek Media', url: window.location.href };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch (e) { /* user cancelled */ }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          shareBtn.innerHTML = '<i class="ti ti-check"></i> NUSXALANDI';
          setTimeout(() => { shareBtn.innerHTML = '<i class="ti ti-share-3"></i> ULASHISH'; }, 2000);
        } catch (e) { /* clipboard not available */ }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderHomeWorks();
  renderFullPortfolio();
  renderProjectDetail();
});

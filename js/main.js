// ====== NAV SCROLLED STATE ======
const siteNav = document.getElementById('siteNav');
if (siteNav) {
  const onScroll = () => {
    if (window.scrollY > 24) siteNav.classList.add('scrolled');
    else siteNav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ====== MOBILE NAV TOGGLE ======
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const icon = navToggle.querySelector('i');
    if (icon) {
      if (navLinks.classList.contains('open')) {
        icon.classList.remove('ti-menu-2');
        icon.classList.add('ti-x');
      } else {
        icon.classList.remove('ti-x');
        icon.classList.add('ti-menu-2');
      }
    }
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('ti-x');
        icon.classList.add('ti-menu-2');
      }
    });
  });
}

// ====== MOBILE BOTTOM NAV ======
document.querySelectorAll('.mbn-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.action === 'menu') {
      const toggle = document.getElementById('navToggle');
      if (toggle) toggle.click();
      return;
    }
    const link = btn.dataset.link;
    if (!link) return;
    if (link.startsWith('#')) {
      const target = document.querySelector(link);
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    } else if (link === 'index.html' && /(^|\/)index\.html$|\/$/.test(window.location.pathname)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.href = link;
    }
  });
});

// ====== SCROLL REVEAL (single elements) ======
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
}

// ====== SCROLL REVEAL (stagger grids) ======
const staggerEls = document.querySelectorAll('.stagger');
if (staggerEls.length) {
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io2.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  staggerEls.forEach(el => io2.observe(el));
}

// ====== PORTFOLIO FILTER ======
const filterBtns = document.querySelectorAll('.filter-btn');
const pfCards = document.querySelectorAll('[data-category]');
if (filterBtns.length && pfCards.length) {
  const applyFilter = (cat) => {
    pfCards.forEach(card => {
      const c = card.getAttribute('data-category');
      if (cat === 'all' || c === cat) {
        card.style.display = '';
        // Allow next paint, then animate
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      } else {
        card.style.display = 'none';
      }
    });
  };
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter') || 'all';
      applyFilter(cat);
    });
  });
  // Auto-filter from URL query ?cat=...
  const params = new URLSearchParams(window.location.search);
  const auto = params.get('cat');
  if (auto) {
    const match = document.querySelector(`.filter-btn[data-filter="${auto}"]`);
    if (match) {
      filterBtns.forEach(b => b.classList.remove('active'));
      match.classList.add('active');
      applyFilter(auto);
    }
  }
}

// ====== SERVICE SELECT (booking form) ======
const serviceOpts = document.querySelectorAll('.service-select .service-opt');
const serviceInput = document.querySelector('#selectedService');
if (serviceOpts.length) {
  serviceOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      serviceOpts.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      if (serviceInput) serviceInput.value = opt.getAttribute('data-value') || '';
    });
  });
}

// ====== AVAILABILITY CALENDAR ======
(function initCalendar() {
  const calGrid = document.querySelector('.calendar-grid');
  const calMonth = document.querySelector('.calendar-month');
  const prevBtn = document.querySelector('.cal-prev');
  const nextBtn = document.querySelector('.cal-next');
  const dateInput = document.querySelector('#eventDate');
  if (!calGrid || !calMonth) return;

  let viewYear, viewMonth;
  const today = new Date();
  viewYear = today.getFullYear();
  viewMonth = today.getMonth();

  // Sample availability: booked / limited / available
  // Format: { 'YYYY-MM-DD': 'booked' | 'limited' | 'available' }
  const availability = {};
  const mk = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  // Next 60 days: mark random sample states
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const r = Math.random();
    const key = mk(d.getFullYear(), d.getMonth(), d.getDate());
    if (r < 0.22) availability[key] = 'booked';
    else if (r < 0.36) availability[key] = 'limited';
    else availability[key] = 'available';
  }

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  function render() {
    calGrid.innerHTML = '';
    const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    calMonth.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    // Headers (MON-SUN)
    dayNames.forEach(d => {
      const el = document.createElement('div');
      el.className = 'cal-dow';
      el.textContent = d;
      calGrid.appendChild(el);
    });
    const first = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // getDay: 0=Sun, we need Mon=0
    let startOffset = first.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    for (let i = 0; i < startOffset; i++) {
      const el = document.createElement('div');
      el.className = 'cal-day empty';
      calGrid.appendChild(el);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(viewYear, viewMonth, d);
      const key = mk(viewYear, viewMonth, d);
      const el = document.createElement('div');
      el.className = 'cal-day';
      const beforeToday = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const state = availability[key];
      if (beforeToday) {
        el.classList.add('booked');
      } else if (state === 'booked') {
        el.classList.add('booked');
      } else if (state === 'limited') {
        el.classList.add('limited');
      } else {
        el.classList.add('available');
      }
      const num = document.createElement('span');
      num.textContent = d;
      const dot = document.createElement('span');
      dot.className = 'dot';
      el.appendChild(num);
      if (!beforeToday && state) el.appendChild(dot);

      if (!beforeToday && state !== 'booked') {
        el.addEventListener('click', () => {
          document.querySelectorAll('.cal-day.selected').forEach(s => s.classList.remove('selected'));
          el.classList.add('selected');
          if (dateInput) dateInput.value = key;
        });
      }
      calGrid.appendChild(el);
    }
  }
  render();
  if (prevBtn) prevBtn.addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    render();
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    render();
  });
})();

// ====== REVIEWS: MOBILE DOT CAROUSEL SYNC ======
(function initReviewDots() {
  const track = document.getElementById('reviewsTrack');
  const dotsWrap = document.getElementById('reviewDots');
  if (!track || !dotsWrap) return;
  const dots = Array.from(dotsWrap.querySelectorAll('.review-dot'));
  const cards = Array.from(track.children);
  if (!dots.length || !cards.length) return;

  function setActive(idx) {
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closest = 0, closestDist = Infinity;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(cardCenter - trackCenter);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      setActive(closest);
    }, 80);
  }, { passive: true });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const card = cards[i];
      if (card) {
        track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
      }
    });
  });
})();

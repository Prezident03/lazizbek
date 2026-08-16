// ==========================================================
// FIREBASE SOZLAMALARI
// Bu qiymatlarni Firebase Console > Project Settings > Your apps
// bo'limidan olib, shu yerga qo'ying.
// ==========================================================
const firebaseConfig = {
  apiKey: "AIzaSyAjCKlkbj1nsux7x_ZZWBT2HJIlFDhxDqg",
  authDomain: "lazizbek-media.firebaseapp.com",
  projectId: "lazizbek-media",
  storageBucket: "lazizbek-media.firebasestorage.app",
  messagingSenderId: "108966266904",
  appId: "1:108966266904:web:67f46e30417d025cf99b6d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// Auth SDK faqat admin.html'da yuklanadi — boshqa sahifalarda xavfsiz o'tkazib yuboriladi.
const auth = (typeof firebase.auth === 'function') ? firebase.auth() : null;

// ==========================================================
// BUYURTMA FORMASI -> FIRESTORE
// "bookings" collection'iga yangi hujjat qo'shadi.
// Firestore Console'da bookings papkasini ochib, kelgan
// so'rovlarni shu yerdan ko'rasiz.
// ==========================================================
const bookingForm = document.querySelector('#bookingForm');

if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const msgEl = document.querySelector('#formMsg');
    const submitBtn = bookingForm.querySelector('button[type="submit"]');

    const data = {
      service: document.querySelector('#selectedService').value,
      name: document.querySelector('#name').value.trim(),
      phone: document.querySelector('#phone').value.trim(),
      date: document.querySelector('#eventDate').value,
      location: document.querySelector('#location').value.trim(),
      notes: document.querySelector('#notes').value.trim(),
      status: 'new',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!data.service) {
      showMsg('Xizmat turini tanlang.', 'error');
      return;
    }
    if (!data.name || !data.phone || !data.date) {
      showMsg('Ism, telefon va sanani to\'ldiring.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Yuborilmoqda...';

    try {
      await db.collection('bookings').add(data);
      showMsg('So\'rovingiz qabul qilindi. Tez orada bog\'lanamiz!', 'success');
      bookingForm.reset();
      document.querySelectorAll('.service-opt').forEach(o => o.classList.remove('selected'));
    } catch (err) {
      console.error(err);
      showMsg('Xatolik yuz berdi. Qaytadan urinib ko\'ring yoki Telegram orqali yozing.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="ti ti-calendar-event"></i> BO\'SHLIKNI TEKSHIRISH & BAND QILISH';
    }

    function showMsg(text, type) {
      msgEl.textContent = text;
      msgEl.className = `form-msg show ${type}`;
    }
  });
}

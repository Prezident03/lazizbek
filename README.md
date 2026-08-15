# Lazizbek Media — sayt

Dark/gold cinematic uslubdagi videograf sayti. Statik HTML/CSS/JS — build qadamisiz to'g'ridan-to'g'ri Vercel'ga deploy qilinadi.

## Fayl tuzilishi

```
lazizbek-media/
├── index.html          Bosh sahifa
├── portfolio.html       Portfolio galereyasi (filtrlanadi)
├── narxlar.html          Paketlar / narxlar
├── haqida.html           Videograf haqida
├── buyurtma.html         Booking forma (Firestore'ga yozadi)
├── css/style.css        Butun dizayn tizimi
├── js/main.js            Nav, scroll animatsiya, filter
├── js/firebase-config.js Firestore ulanish + forma logikasi
└── images/, assets/      Rasm/video fayllar shu yerga qo'yiladi
```

## 1. GitHub'ga yuklash

```bash
cd lazizbek-media
git init
git add .
git commit -m "Lazizbek Media — birinchi versiya"
git branch -M main
git remote add origin https://github.com/SIZNING_USERNAME/lazizbek-media.git
git push -u origin main
```

## 2. Vercel'ga ulash

1. vercel.com > **Add New Project**
2. GitHub repo'ni tanlang (`lazizbek-media`)
3. Framework: **Other** (static site) — build command va output directory bo'sh qoldiring
4. **Deploy** tugmasini bosing

Shundan keyin har safar GitHub'ga push qilganingizda sayt avtomatik yangilanadi.

## 3. Firebase / Firestore sozlash

1. [console.firebase.google.com](https://console.firebase.google.com) > **Add project**
2. Project ichida **Build > Firestore Database** > Create database (production mode)
3. **Project settings > Your apps > Web app** qo'shing, u yerdan `firebaseConfig` obyektini nusxa oling
4. `js/firebase-config.js` faylidagi `firebaseConfig` qiymatlarini shu bilan almashtiring
5. Firestore'da **Rules** bo'limiga o'ting va booking forma yozishi uchun ruxsat bering, masalan:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{doc} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

Bu — mijozlar forma orqali yozishi mumkin, lekin faqat siz (Firebase Console orqali) o'qiy olasiz degani.

## 4. Video/rasm qo'shish

- **Hero rasmi (bosh sahifa fon surati)**: `images/hero.jpg` nomi bilan (afzalan 1920×1080px yoki kattaroq, gorizontal, to'y/juftlik surati) `images/` papkaga joylang — `index.html` shu faylni avtomatik fon sifatida oladi. Fayl topilmasa, o'rniga zinapoyali oltin-jigarrang gradient ko'rinadi.
- **Portfolio videolari**: YouTube (unlisted) yoki Vimeo'ga yuklab, `portfolio.html` dagi `.pf-card` ichiga link/embed qo'shing — bu tekin va tez ishlaydi.
- **Rasm/thumbnail**: `images/` papkaga qo'ying yoki Firebase Storage ishlatib, URL'ni HTML'ga joylashtiring.

## 5. Domen ulash

Vercel loyihasida **Settings > Domains** > o'z domeningizni kiriting (masalan `lazizbekmedia.uz`), keyin domen provayderingizda ko'rsatilgan DNS yozuvlarini (A yoki CNAME) qo'shing. SSL avtomatik beriladi.

## Keyingi qadamlar (ixtiyoriy)

- Admin panel: Firebase Authentication + alohida `/admin.html` sahifa orqali bookinglarni ko'rish
- Real portfolio videolarni joylashtirish
- Instagram Reels integratsiyasi

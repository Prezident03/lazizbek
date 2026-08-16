# Lazizbek Media — sayt

Dark/gold cinematic uslubdagi videograf sayti. Statik HTML/CSS/JS — build qadamisiz to'g'ridan-to'g'ri Vercel'ga deploy qilinadi.

## Fayl tuzilishi

```
lazizbek-media/
├── index.html          Bosh sahifa
├── portfolio.html       Portfolio galereyasi (Firestore'dan dinamik, filtrlanadi)
├── project.html          Bitta loyiha sahifasi (?id=... orqali, Firestore'dan dinamik)
├── admin.html            Admin panel — loyihalarni qo'shish/tahrirlash/o'chirish
├── narxlar.html          Paketlar / narxlar
├── haqida.html           Videograf haqida
├── buyurtma.html         Booking forma (Firestore'ga yozadi)
├── css/style.css        Butun dizayn tizimi
├── js/main.js            Nav, scroll animatsiya, filter
├── js/firebase-config.js Firestore/Auth ulanish + booking forma logikasi
├── js/projects.js        Portfolio/loyiha sahifalarini Firestore'dan chizadi
├── js/admin.js           Admin panel logikasi (login + CRUD)
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

## 3. Firebase / Firestore / Auth sozlash

1. [console.firebase.google.com](https://console.firebase.google.com) > **Add project**
2. Project ichida **Build > Firestore Database** > Create database (production mode)
3. **Project settings > Your apps > Web app** qo'shing, u yerdan `firebaseConfig` obyektini nusxa oling
4. `js/firebase-config.js` faylidagi `firebaseConfig` qiymatlarini shu bilan almashtiring
5. **Build > Authentication > Sign-in method** > **Email/Password**ni yoqing
6. **Authentication > Users > Add user** — o'zingiz uchun admin email va parol yarating (shu bilan `admin.html`ga kirasiz)
7. Firestore'da **Rules** bo'limiga o'ting va quyidagini joylang:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{doc} {
      allow create: if true;
      allow read, update, delete: if false;
    }
    match /projects/{doc} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

Bu shuni bildiradi: **bookings** — mijozlar forma orqali yozishi mumkin, faqat siz o'qiysiz. **projects** — hamma o'qiy oladi (sayt shundan chiqaradi), lekin faqat login qilgan admin (siz) qo'sha/o'zgartira/o'chira oladi.

## 4. Portfolio loyihalarni admin panel orqali qo'shish

`https://SIZNING-SAYT.vercel.app/admin.html` manziliga kiring (yoki lokal ochib turing), 6-qadamda yaratgan email/parol bilan kiring:

1. **"YANGI LOYIHA"** tugmasini bosing
2. Nomi (masalan "Aziz va Madina"), kategoriya, joylashuv, yil kabi maydonlarni to'ldiring
3. **Video havolasi** maydoniga oddiy YouTube yoki Vimeo linkini joylang (masalan `https://www.youtube.com/watch?v=XXXXXXXX` yoki `https://vimeo.com/XXXXXXXX`) — xuddi YouTube'ga video yuklab, linkni ulashgandek, boshqa hech narsa qilish shart emas, sayt o'zi to'g'ri formatga o'giradi
4. **Muqova rasm havolasi**ga loyihaning asosiy (thumbnail) suratini joylang
5. **"Bosh sahifada ham ko'rsatilsin"**ni belgilasangiz, shu loyiha bosh sahifadagi "Tanlangan ishlar"da ham chiqadi (eng ko'pi 6 ta, "Tartib raqami" bo'yicha saralanadi)
6. **SAQLASH** — loyiha darhol saytda (bosh sahifa, portfolio, loyiha sahifasida) ko'rinadi, kod yozish shart emas

Loyihani o'chirish yoki tahrirlash — ro'yxatdagi qalam/savat tugmalari orqali.

## 5. Video/rasm qo'shish (boshqa bo'limlar)

- **Xizmatlar bo'limi rasmlari**: `images/services/` papkasiga quyidagi nomlar bilan rasm qo'ysangiz, mos karta fon suratiga aylanadi (yoki HTML'dagi `<img src="...">` manzilini to'g'ridan-to'g'ri o'zingizning tashqi havolangizga almashtirsangiz ham ishlaydi): `wedding.jpg`, `graduation.jpg`, `love-story.jpg`, `events.jpg`, `video-session.jpg`, `commercial.jpg`, `intro-motion.jpg`, `other.jpg`. Rasm topilmasa, karta shunchaki quyuq fonda ikonka+matn bilan ko'rinadi — sinib qolmaydi.
- **Hero fon videosi**: bosh sahifadagi katta sarlavha ostida Vimeo showreel video fon sifatida avtomatik ishga tushadi (`index.html` ichidagi Vimeo video ID'ni o'z loyihangizga almashtiring). Video yuklanmaguncha orqada oltin-jigarrang gradient ko'rinadi.

## 6. Domen ulash

Vercel loyihasida **Settings > Domains** > o'z domeningizni kiriting (masalan `lazizbekmedia.uz`), keyin domen provayderingizda ko'rsatilgan DNS yozuvlarini (A yoki CNAME) qo'shing. SSL avtomatik beriladi.

## Keyingi qadamlar (ixtiyoriy)

- Bookinglarni ham admin panel ichida ko'rish (hozircha Firebase Console orqali ko'rasiz)
- Instagram Reels integratsiyasi

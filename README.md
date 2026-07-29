# إمبراطورية الروايات

منصة عربية لنشر وقراءة الروايات، مبنية بـ React و Firebase.

## شنو فيها؟
- تسجيل دخول / إنشاء حساب (Firebase Authentication)
- نشر رواية جديدة مع تصنيف ووصف وصورة غلاف
- كتابة ونشر الفصول
- قراءة الفصول مع تنقل بين "الفصل السابق / التالي"
- تصفح وبحث بالتصنيف أو اسم الكاتب/الرواية
- بروفايل كاتب عام يبين جميع رواياته
- صفحة "رواياتي" لتسيير الروايات ديالك (زيادة فصول، حذف)

## قبل ما تشغل المشروع

### 1. فعّل الخدمات فـ Firebase Console (مشروع novels-empire)
- **Authentication** → Sign-in method → فعّل "Email/Password"
- **Firestore Database** → أنشئ قاعدة بيانات → ابدا بوضع "test mode" (أو دير Publish للـ rules اللي فـ `firestore.rules`)
- **Storage** (اختياري، إلا بغيتي ترفع صور بلا روابط خارجية)

### 2. طبّق قواعد الأمان
انسخ محتوى ملف `firestore.rules` والصقه فـ Firebase Console → Firestore Database → Rules → دوس "Publish".

## كيفاش تشغل المشروع محلياً

```bash
npm install
npm start
```

غادي يحل الموقع فـ `http://localhost:3000`

## كيفاش تنشر الموقع (استضافة مجانية)

أسهل طريقة هي **Firebase Hosting** (حيت المشروع ديالك أصلا فـ Firebase):

```bash
npm install -g firebase-tools
firebase login
npm run build
firebase init hosting   # اختار novels-empire، وحدد "build" كـ public directory
firebase deploy
```

من بعد الـ deploy، غادي يعطيك رابط بحال:
`https://novels-empire.web.app`

## هيكلة المشروع
```
src/
  firebase.js           إعدادات الاتصال بـ Firebase
  context/
    AuthContext.js       تسجيل الدخول والمستخدم
    NovelsContext.js      عمليات الروايات والفصول فـ Firestore
  components/            Header, NovelCard, ProtectedRoute
  screens/                جميع صفحات الموقع
```

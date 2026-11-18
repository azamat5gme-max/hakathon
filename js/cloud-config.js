/* =====================================================================
   ОБЛАКО (Firebase) — чтобы метки, фото и отзывы были общими для ВСЕХ устройств.

   Вставьте сюда firebaseConfig из Firebase Console
   (⚙️ Project settings → General → Your apps → Web app → SDK setup and configuration → Config).
   Пока здесь null — сайт работает как раньше (метки сохраняются в браузере).
   Эти ключи не секретные: они и должны быть в коде сайта. Защита — в правилах firestore.rules.
   ===================================================================== */
window.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyB2lxtGcEb0c8e8bccTmAwYnzg-LpmBkZk',
  authDomain: 'hakathon-bishkek.firebaseapp.com',
  projectId: 'hakathon-bishkek',
  storageBucket: 'hakathon-bishkek.firebasestorage.app',
  messagingSenderId: '122581636390',
  appId: '1:122581636390:web:1dc9837da311785c951de7'
};

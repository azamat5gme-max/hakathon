/* ================= ОБЛАКО (Firebase Firestore): общие метки, фото и отзывы =================
   Включается, только если в js/cloud-config.js вставлен firebaseConfig.
   BB.cloudReady — обещание: облако (если подключилось) или null (тогда работаем как раньше). */
(function () {
  var BB = window.BB = window.BB || {};
  var cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.projectId) { BB.cloudReady = Promise.resolve(null); return; }

  var SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
  function load(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = function () { reject(new Error('load ' + src)); };
      document.head.appendChild(s);
    });
  }

  BB.cloudReady = load(SDK + 'firebase-app-compat.js')
    .then(function () { return load(SDK + 'firebase-firestore-compat.js'); })
    .then(function () {
      firebase.initializeApp(cfg);
      var db = firebase.firestore();
      var cloud = BB.cloud = {
        db: db,
        stamp: function () { return firebase.firestore.FieldValue.serverTimestamp(); },
        comments: {}                                                      // id места → отзывы
      };

      /* Отзывы жителей — общие для всех */
      cloud.addComment = function (loc, c) {
        var data = { placeId: loc.id, name: c.name, type: c.type, text: c.text, date: c.date, createdAt: cloud.stamp() };
        (cloud.comments[loc.id] = cloud.comments[loc.id] || []).push(data);   // сразу показываем у себя
        return db.collection('comments').add(data);
      };
      db.collection('comments').onSnapshot(function (snap) {
        var map = {};
        snap.forEach(function (d) { var c = d.data(); (map[c.placeId] = map[c.placeId] || []).push(c); });
        Object.keys(map).forEach(function (k) {
          map[k].sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
        });
        cloud.comments = map;
        document.dispatchEvent(new CustomEvent('bb:comments'));
      }, function (err) { console.warn('Firebase: отзывы недоступны —', err.message); });

      return cloud;
    })
    .catch(function (err) {
      console.warn('Firebase не подключился — работаю без облака:', err.message);
      return null;
    });
})();

/* Service worker — เก็บเฉพาะไฟล์หน้าแอปไว้เปิดเร็ว/ติดตั้งได้
 * index.html ใช้ "เครือข่ายก่อน" เพื่อให้ได้เวอร์ชันล่าสุดเสมอ (ออฟไลน์จึงใช้ของที่เก็บไว้)
 * ไม่แตะคำขอไปหลังบ้าน (script.google.com) — คำตอบระเบียบต้องสดเสมอ */
var CACHE = 'regadv-shell-v1';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (res) {
    var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); return res;
  }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('index.html'); }); }));
});

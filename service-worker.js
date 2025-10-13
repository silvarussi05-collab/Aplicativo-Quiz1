const CACHE_NAME = "instrumentos-cache-v1";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/assets/images/piano.png",
  "/assets/images/guitarra.png",
  "/assets/images/bateria.png",
  "/assets/sounds/piano.mp3",
  "/assets/sounds/guitarra.mp3",
  "/assets/sounds/bateria.mp3"
];

// Instala o service worker e armazena os arquivos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  console.log("Service Worker instalado!");
});

// Ativa o novo service worker e limpa versões antigas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  console.log("Service Worker ativado!");
});

// Busca do cache primeiro, depois da rede
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

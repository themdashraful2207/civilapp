self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('v1').then((cache) => {
            return cache.addAll([
                '/civilapp/menu.html',
                '/civilapp/proxy.html',
                '/civilapp/manifest.json',
                '/civilapp/icon.png',
                '/civilapp/credentials.json',
                '/civilapp/home.html' // Add if home.html exists
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
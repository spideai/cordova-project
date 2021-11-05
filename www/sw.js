const ORIGIN_URL = `${location.protocol}//${location.host}`;
const CACHE_NAME = "offline-v0.3";
const OFFLINE_URL = "offline.html";
const CACHED_FILES = [
    `${ORIGIN_URL}/${OFFLINE_URL}`,
    `${ORIGIN_URL}/js/index.js`,
    `${ORIGIN_URL}/img/logo.png`,
    `${ORIGIN_URL}/css/index.css`,
    `${ORIGIN_URL}/img/logo2.png`
];

console.log(CACHED_FILES);


// ***** Installation *****
const waitInstallationPromise = () =>
    new Promise((resolve) => {
        caches.open(CACHE_NAME).then((cache) => {
            cache.addAll(CACHED_FILES).then(resolve).catch((e) => {
                console.log(e);});
        }).catch((e) => {
            console.log(e);});
    });

const installServiceWorker = (event) => {
    event.waitUntil(waitInstallationPromise());
    self.skipWaiting();
};
// ***********************

// ***** Activate *****
const deleteOldCaches = () =>
    new Promise((resolve) => {
        console.log("activate");
        caches.keys().then((keys) => {
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        caches.delete(key);
                    }
                })
            ).finally(resolve);
        });
    });

const waitActivatePromise = () =>
    new Promise((resolve) => {
        deleteOldCaches().then(() => {
            if ("navigationPreload" in self.registration) {
                self.registration.navigationPreload.enable().finally(resolve);
            }
        });
    });

const activateServiceWorker = (event) => {
    event.waitUntil(waitActivatePromise());
    self.clients.claim();
};
// ***********************

// ***** Fetch *****
const sendOfflinePage = (resolve) => {
    caches.open(CACHE_NAME).then((cache) => {
        cache.match(OFFLINE_URL).then((cachedResponse) => {
            resolve(cachedResponse);
        });
    });
};

const respondWithFetchPromiseNavigate = (event) =>
    new Promise((resolve) => {
        event.preloadResponse
            .then((preloadResponse) => {
                if (preloadResponse) {
                    resolve(preloadResponse);
                }
                fetch(event.request)
                    .then((networkResponse) => {
                        resolve(networkResponse);
                    })
                    .catch(() => sendOfflinePage(resolve));
            })
            .catch(() => sendOfflinePage(resolve));
    });

const fetchServiceWorker = (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(respondWithFetchPromiseNavigate(event));
    } else if (CACHED_FILES.includes(event.request.url)) {
        event.respondWith(caches.match(event.request));
    } else {
        event.respondWith(respondWithFetchPromiseNavigate(event))
    }
};
// ***********************

// Initiate Service Worker
self.addEventListener("install", installServiceWorker);
self.addEventListener("activate", activateServiceWorker);
self.addEventListener("fetch", fetchServiceWorker);
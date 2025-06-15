/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", () => {
	self.skipWaiting(); // Skip waiting to activate immediately
});

self.addEventListener("activate", () => {
	console.log("Service Worker activated");
});

self.addEventListener("fetch", (event) => {
	if (event.request.url.startsWith(import.meta.env.VITE_BASE_API_URL)) {
		console.log("Service Worker handling API request:", event.request.url);
		// Handle API requests
		event.respondWith(
			fetch(event.request).catch((error) => {
				console.error("Fetch failed; returning offline page instead.", error);
				return new Response("Offline", { status: 503 });
			}),
		);
	}
});

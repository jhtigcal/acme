/// <reference lib="webworker" />

import { handleExchangeRatesRequest } from "./services/exchange-rates";
import { handleProductsRequest } from "./services/products";
import { handleSalesRequest } from "./services/sales";

declare const self: ServiceWorkerGlobalScope;

let activeTeam: string | null = null;

self.addEventListener("install", () => {
  self.skipWaiting(); // Skip waiting to activate immediately
});

self.addEventListener("activate", () => {
  console.log("Service Worker activated");
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case "SET_ACTIVE_TEAM": {
        activeTeam = event.data.teamId;
        break;
      }
      case "GET_ACTIVE_TEAM": {
        if (event.ports && event.ports.length > 0) {
          event.ports[0].postMessage({
            payload: activeTeam,
          });
        }
        break;
      }
      default: {
        console.warn("Unknown message type:", event.data.type);
        break;
      }
    }
  }
});

const fetchedSales = new Set<string>();
const fetchedExchangeRates = new Set<string>();
const fetchedProductMarketplaces = new Set<string>();

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/sales")) {
    if (!activeTeam) {
      console.warn("No active team set, ignoring sales request");
      return event.respondWith(
        new Response("No active team set", { status: 400 })
      );
    }

    return event.respondWith(
      handleSalesRequest(event.request, fetchedSales, activeTeam)
    );
  } else if (event.request.url.includes("/exchange-rates")) {
    return event.respondWith(
      handleExchangeRatesRequest(event.request, fetchedExchangeRates)
    );
  } else if (event.request.url.includes("/products")) {
    if (!activeTeam) {
      console.warn("No active team set, ignoring products request");
      return event.respondWith(
        new Response("No active team set", { status: 400 })
      );
    }
    return event.respondWith(
      handleProductsRequest(
        event.request,
        activeTeam,
        fetchedProductMarketplaces
      )
    );
  }
});

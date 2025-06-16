import { handleExchangeRatesRequest } from "./exchange-rates";
import { handleProductsRequest } from "./products";
import { handleSalesRequest } from "./sales";

export const routeHandlers = [
  { pattern: "/api/exchange-rates", handler: handleExchangeRatesRequest },
  { pattern: "/api/teams/:teamId/products", handler: handleProductsRequest },
  { pattern: "/api/teams/:teamId/sales", handler: handleSalesRequest },
];

function matchRoute(url: string) {
  const urlParts = url.split("/").filter(Boolean); // remove empty strings

  for (const { pattern, handler } of routeHandlers) {
    const patternParts = pattern.split("/").filter(Boolean);

    if (patternParts.length !== urlParts.length) continue;

    let params: Record<string, string> = {};
    let matched = true;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        const paramName = patternParts[i].slice(1);
        params[paramName] = urlParts[i];
      } else if (patternParts[i] !== urlParts[i]) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return { handler, params };
    }
  }

  return null;
}

export { matchRoute };

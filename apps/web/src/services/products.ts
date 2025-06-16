import { db } from "@/lib/db";

async function handleProductsRequest(
  request: Request,
  teamId: string,
  cache: Set<string>
) {
  const url = new URL(request.url);
  const origin = url.origin;
  const pathname = url.pathname;

  const marketplaces = new Set(
    url.searchParams.getAll("marketplaces").map((m) => `${teamId}::${m}`)
  );
  const newMarketplaces = marketplaces.difference(cache);
  if (newMarketplaces.size === 0) {
    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  }
  const query = new URLSearchParams();
  newMarketplaces.values().forEach((marketplace) => {
    cache.add(marketplace);
    query.append("marketplaces", marketplace.replace(`${teamId}::`, ""));
  });

  const response = await fetch(`${origin}${pathname}?${query.toString()}`);

  if (!response.ok) {
    return response;
  }

  const data = await response.json();

  await db.products.bulkPut(data);

  return new Response(null, {
    status: 204,
    headers: { "Content-Type": "application/json" },
  });
}

export { handleProductsRequest };

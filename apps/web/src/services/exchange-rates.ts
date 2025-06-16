import { db } from "@/lib/db";

async function handleExchangeRatesRequest(
  request: Request,
  fetchedDates: Set<string>
) {
  const url = new URL(request.url);
  const origin = url.origin;
  const pathname = url.pathname;

  const dates = new Set(url.searchParams.getAll("dates"));

  const newCombinations = dates.difference(fetchedDates);

  if (newCombinations.size === 0) {
    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  }
  const query = new URLSearchParams();

  newCombinations.values().forEach((date) => {
    fetchedDates.add(date);
    query.append("dates", date);
  });

  const response = await fetch(`${origin}${pathname}?${query.toString()}`);
  if (!response.ok) {
    return response;
  }

  const data = await response.json();

  await db.exchangeRates.bulkPut(data);

  return new Response(null, {
    status: 204,
    headers: { "Content-Type": "application/json" },
  });
}

export { handleExchangeRatesRequest };

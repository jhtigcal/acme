import { db } from "@/lib/db";

const encryptSalesFilterCombination = ({
  date,
  marketplace,
  team,
}: {
  date: string;
  marketplace: string;
  team: string;
}) => `${team}::${marketplace}::${date}`;
const decrpytSalesFilterCombination = (combination: string) => {
  const [team, marketplace, date] = combination.split("::");
  return {
    team,
    marketplace,
    date,
  };
};
const buildSalesFilterCombinations = (filters: {
  team: Set<string>;
  marketplaces: Set<string>;
  dates: Set<string>;
}): Set<string> => {
  let combinations: string[] = [];

  const { team, marketplaces, dates } = filters;
  if (!team.size || !marketplaces.size || !dates.size) {
    return new Set();
  }

  const teamArray = [...team];
  const marketplaceArray = [...marketplaces];
  const datesArray = [...dates];

  for (const t of teamArray) {
    for (const m of marketplaceArray) {
      for (const d of datesArray) {
        const combination = encryptSalesFilterCombination({
          team: t,
          marketplace: m,
          date: d,
        });
        combinations.push(combination);
      }
    }
  }

  return new Set(combinations);
};
const deconstructSalesFilterCombinations = (
  combinations: Set<string>
): {
  team: Set<string>;
  marketplaces: Set<string>;
  dates: Set<string>;
} => {
  const filters = {
    team: new Set<string>(),
    marketplaces: new Set<string>(),
    dates: new Set<string>(),
  };
  combinations.forEach((combination) => {
    const { team, marketplace, date } =
      decrpytSalesFilterCombination(combination);
    filters.team.add(team);
    filters.marketplaces.add(marketplace);
    filters.dates.add(date);
  });
  return filters;
};

async function handleSalesRequest(
  request: Request,
  fetchedSales: Set<string>,
  teamId: string
) {
  const url = new URL(request.url);
  const origin = url.origin;

  const filters = {
    team: new Set([teamId]),
    marketplaces: new Set<string>(),
    dates: new Set<string>(),
  };

  url.searchParams
    .getAll("marketplaces")
    .forEach((m) => filters.marketplaces.add(m));
  url.searchParams.getAll("dates").forEach((d) => filters.dates.add(d));

  const allCombinations = buildSalesFilterCombinations(filters);
  const toFetchCombinations = allCombinations.difference(fetchedSales);

  if (!toFetchCombinations.size) {
    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  }

  const newFilters = deconstructSalesFilterCombinations(toFetchCombinations);
  const query = new URLSearchParams();

  newFilters.dates.forEach((d) => query.append("dates", d));
  newFilters.marketplaces.forEach((m) => query.append("marketplaces", m));

  toFetchCombinations.forEach((c) => fetchedSales.add(c));
  const fetchUrl = `${origin}/api/teams/${teamId}/sales?${query.toString()}`;
  const response = await fetch(fetchUrl, {
    headers: request.headers,
  });

  if (!response.ok) {
    return response;
  }

  const data = await response.json();

  await db.sales.bulkPut(data);

  // Return a 204 No Content response
  // to indicate that the data has been fetched and stored
  return new Response(null, {
    status: 204,
    headers: { "Content-Type": "application/json" },
  });
}

export {
  buildSalesFilterCombinations,
  deconstructSalesFilterCombinations,
  decrpytSalesFilterCombination,
  encryptSalesFilterCombination,
  handleSalesRequest,
};

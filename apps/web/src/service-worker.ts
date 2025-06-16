/// <reference lib="webworker" />

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

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  const match = url.pathname.match(/\/teams\/([^/]+)\/sales/);
  if (!match || event.request.method !== "GET") return;

  const teamId = match[1];
  const origin = url.origin;

  if (!teamId || teamId !== activeTeam) {
    console.log(`Skipping fetch for team ${teamId}`);
    return event.respondWith(fetch(event.request));
  }

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
    return event.respondWith(
      new Response(null, {
        status: 204,
        headers: { "Content-Type": "application/json" },
      })
    );
  }

  const newFilters = deconstructSalesFilterCombinations(toFetchCombinations);

  const query = new URLSearchParams();
  newFilters.dates.forEach((d) => query.append("dates", d));
  newFilters.marketplaces.forEach((m) => query.append("marketplaces", m));

  toFetchCombinations.forEach((c) => fetchedSales.add(c));

  const fetchUrl = `${origin}/api/teams/${teamId}/sales?${query.toString()}`;

  event.respondWith(
    fetch(fetchUrl, {
      headers: event.request.headers,
    })
  );
});

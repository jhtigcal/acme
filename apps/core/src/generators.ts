import { faker } from "@faker-js/faker";
import { MARKETPLACES, START_DATE, CURRENCIES } from "./constants.js";
import type {
  ICurrency,
  IExchangeRate,
  IMarketplace,
  IProduct,
  ISalesDataItem,
  ITeam,
} from "./types.js";

function generateTeams(): ITeam[] {
  return Array.from({ length: 5 }, () => {
    const id = faker.string.uuid();
    const marketplaces = faker.helpers.arrayElements(
      MARKETPLACES,
      faker.number.int({ min: 1, max: 5 })
    );
    return {
      id,
      name: faker.company.name(),
      marketplaces,
    };
  });
}

function generateProducts(teams: ITeam[]): IProduct[] {
  const products: IProduct[] = [];
  for (const team of teams) {
    for (const marketplace of team.marketplaces) {
      const numProducts = faker.number.int({ min: 10, max: 1000 });
      for (let i = 0; i < numProducts; i++) {
        products.push({
          id: faker.string.uuid(),
          teamId: team.id,
          marketplace,
          asin: faker.commerce.isbn(),
          name: faker.commerce.productName(),
          productionCost: faker.number.float({
            min: 5,
            max: 50,
            fractionDigits: 2,
          }),
          currency: getCurrencyByMarketplace(marketplace),
        });
      }
    }
  }
  return products;
}

function generateCurrencyRates(): IExchangeRate[] {
  const days = 365;
  const data: IExchangeRate[] = [];

  for (let i = 0; i < days; i++) {
    const date = START_DATE.plus({ days: i }).toISODate();

    const rates = CURRENCIES.reduce((acc, currency) => {
      acc[currency] = faker.number.float({
        min: 0.5,
        max: 1.5,
        fractionDigits: 4,
      });
      return acc;
    }, {} as Record<string, number>);

    data.push({
      date,
      rates,
    });
  }
  return data;
}

function generateSalesData(
  teams: ITeam[],
  products: IProduct[]
): ISalesDataItem[] {
  const data: ISalesDataItem[] = [];

  for (const team of teams) {
    for (const marketplace of team.marketplaces) {
      const teamProducts = products.filter(
        (p) => p.teamId === team.id && p.marketplace === marketplace
      );

      for (let i = 0; i < 365; i++) {
        const date = START_DATE.plus({ days: i }).toISODate();

        const salesForDay = teamProducts.map((product) => ({
          teamId: team.id,
          marketplace,
          date,
          productId: product.id,
          unitsSold: faker.number.int({ min: 0, max: 20 }),
          revenue: faker.number.float({ min: 0, max: 500, fractionDigits: 2 }),
          currency: product.currency,
        }));

        data.push(...salesForDay);
      }
    }
  }

  return data;
}

function getCurrencyByMarketplace(marketplace: IMarketplace): ICurrency {
  const map = {
    US: "USD",
    UK: "GBP",
    DE: "EUR",
    JP: "JPY",
    CA: "CAD",
  } as const;
  return map[marketplace] ?? ("USD" as const);
}

export {
  generateTeams,
  generateProducts,
  generateCurrencyRates,
  generateSalesData,
  getCurrencyByMarketplace,
};

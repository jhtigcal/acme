import Dexie, { type EntityTable, type Table } from "dexie";

import type {
  IExchangeRate,
  IProduct,
  ISalesDataItem,
} from "../../../core/src/types";

type SalesTable = Table<
  ISalesDataItem,
  // [teamId, date, marketplace, productId]
  [string, string, string, string]
>;
type ProductsTable = EntityTable<IProduct, "id">;
type ExchangeRatesTable = EntityTable<IExchangeRate, "date">;

const db = new Dexie("AcmeDatabase") as Dexie & {
  sales: SalesTable;
  products: ProductsTable;
  exchangeRates: ExchangeRatesTable;
};

// Schema declaration:
db.version(1).stores({
  sales: `
    [teamId+date+productId],
    [teamId+date+marketplace],
    [teamId+date]
  `,
  products: "id, teamId, marketplace",
  exchangeRates: "date",
});

export { db };

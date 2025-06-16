import * as React from "react";
import { ReactCountryFlag } from "react-country-flag";

export const MARKETPLACES_DETAILS_MAP = new Map<
  string,
  { name: string; icon: React.JSX.Element }
>([
  [
    "US",
    { name: "United States", icon: <ReactCountryFlag countryCode="US" svg /> },
  ],
  [
    "UK",
    { name: "United Kingdom", icon: <ReactCountryFlag countryCode="GB" svg /> },
  ],
  ["DE", { name: "Germany", icon: <ReactCountryFlag countryCode="DE" svg /> }],
  ["JP", { name: "Japan", icon: <ReactCountryFlag countryCode="JP" svg /> }],
  ["CA", { name: "Canada", icon: <ReactCountryFlag countryCode="CA" svg /> }],
]);

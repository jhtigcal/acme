import * as React from "react";

import { workerClient } from "@/workers/client";
import { useQuery } from "@tanstack/react-query";
import type { DateValue } from "react-aria-components";

interface UseSalesProps {
  teamId: string | null;
  dateRange: {
    start: DateValue;
    end: DateValue;
  } | null;
  marketplaces: Set<string>;
}

export function useSalesData({
  teamId,
  dateRange,
  marketplaces: _marketplaces,
}: UseSalesProps) {
  const marketplaces = React.useMemo(
    () => [..._marketplaces.values()].sort(),
    [_marketplaces]
  );

  return useQuery({
    queryKey: [
      "team",
      teamId,
      "sales",
      {
        dateRange,
        marketplaces,
      },
    ],
    queryFn: async () => {
      return workerClient.query("sales.list", {
        teamId: teamId!,
        dateRange: {
          start: dateRange!.start.toString(),
          end: dateRange!.end.toString(),
        },
        marketplaces,
      });
    },
    enabled: !!teamId && !!dateRange && marketplaces.length > 0,
  });
}

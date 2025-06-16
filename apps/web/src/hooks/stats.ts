import { workerClient } from "@/workers/client";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import type { DateValue } from "react-aria-components";

export function useStats({
  teamId,
  dateRange,
  marketplaces: _marketplaces,
}: {
  teamId: string | null;
  dateRange: {
    start: DateValue;
    end: DateValue;
  } | null;
  marketplaces: Set<string>;
}) {
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
      return workerClient.query("dashboard.stats", {
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

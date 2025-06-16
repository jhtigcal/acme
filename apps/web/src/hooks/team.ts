import { MARKETPLACES_DETAILS_MAP } from "@/lib/constants";
import { workerClient } from "@/workers/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postMessageToServiceWorker } from "../lib/service-worker";

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => workerClient.query("teams.list", undefined),
    initialData: [],
  });
}

function getMarketplacesDetails(marketplaces: string[]) {
  return marketplaces
    .map((iso) => {
      const details = MARKETPLACES_DETAILS_MAP.get(iso);
      return details ? { name: details.name, iso, icon: details.icon } : null;
    })
    .filter(Boolean) as {
    name: string;
    iso: string;
    icon: React.JSX.Element;
  }[];
}

export function useActiveTeam() {
  const { data: teams } = useTeams();

  return useQuery({
    queryKey: ["teams", "active"],
    queryFn: async () => {
      const activeTeamId = await postMessageToServiceWorker<string | null>(
        "GET_ACTIVE_TEAM"
      );
      if (!activeTeamId) {
        return null;
      }

      const activeTeam = teams.find((team) => team.id === activeTeamId);
      return activeTeam
        ? {
            id: activeTeam.id,
            name: activeTeam.name,
            marketplaces: getMarketplacesDetails(activeTeam.marketplaces),
          }
        : null;
    },
    initialData: null,
  });
}

export function useUpdateActiveTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: string | null) => {
      // Send a message to the service worker to update the active team
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SET_ACTIVE_TEAM",
          teamId,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["teams", "active"],
      });
    },
  });
}

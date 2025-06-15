import { useQuery } from "@tanstack/react-query";
import { workerClient } from "./client";

export function useTeams() {
	return useQuery({
		queryKey: ["teams"],
		queryFn: () => workerClient.query("teams.list", undefined),
	});
}

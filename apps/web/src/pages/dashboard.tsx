import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/field";
import {
	Select,
	SelectItem,
	SelectListBox,
	SelectPopover,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTeams } from "@/workers/use-worker-query";

export function Dashboard() {
	const { data } = useTeams();
	return (
		<main className="max-w-5xl mx-auto my-8">
			<Card>
				<CardHeader>
					<CardTitle>Welcome to Fluvi!</CardTitle>
					<CardDescription>
						Fluvi is a framework for building web applications with a focus on
						simplicity and performance.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div>
						<Select className="w-[320px]" placeholder="Select a team">
							<Label>Select a team</Label>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectPopover className="w-[320px]">
								<SelectListBox items={data}>
									{(item) => <SelectItem>{item.name}</SelectItem>}
								</SelectListBox>
							</SelectPopover>
						</Select>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}

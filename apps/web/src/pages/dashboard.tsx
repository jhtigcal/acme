import { Button } from "@/components/ui/button";
import {
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
  RangeCalendar,
} from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DatePickerContent,
  DateRangePicker,
} from "@/components/ui/date-picker";
import { DateInput } from "@/components/ui/datefield";
import { FieldGroup, Label } from "@/components/ui/field";
import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSalesData } from "@/hooks/sales";
import { useActiveTeam, useUpdateActiveTeam } from "@/hooks/team";
import { useTeams } from "@/workers/use-worker-query";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { type DateValue } from "react-aria-components";

type RangeValue<T> = {
  start: T;
  end: T;
};

export function Dashboard() {
  const { data: teams } = useTeams();
  const { mutateAsync } = useUpdateActiveTeam();
  const { data: activeTeam } = useActiveTeam();

  const [selectedMarketplaces, setSelectedMarketplaces] = React.useState<
    Set<string>
  >(new Set());
  const [selectedDateRange, setSelectedDateRange] =
    React.useState<RangeValue<DateValue> | null>(null);

  const { data: salesData } = useSalesData({
    teamId: activeTeam?.id ?? null,
    dateRange: selectedDateRange,
    marketplaces: selectedMarketplaces,
  });

  React.useEffect(() => {
    console.log("Sales data updated:", salesData);
  }, [salesData]);

  return (
    <main className="max-w-5xl mx-auto my-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Acme!</CardTitle>
          <CardDescription>
            Acme is a framework for building dashboard applications with a focus
            on simplicity and performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <Select
              className="w-[320px]"
              placeholder="Select a team"
              onSelectionChange={(key) => {
                mutateAsync(key as string | null);
              }}
            >
              <Label>Team</Label>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectPopover className="w-[320px]">
                <SelectListBox items={teams} selectionMode="single">
                  {(item) => (
                    <SelectItem id={item.id} className="flex justify-between">
                      {item.name}
                    </SelectItem>
                  )}
                </SelectListBox>
              </SelectPopover>
            </Select>
            {activeTeam?.marketplaces && (
              <>
                <PopoverTrigger>
                  <Button
                    aria-label="Select Marketplaces"
                    className="w-[200px] justify-start"
                    variant="outline"
                  >
                    {selectedMarketplaces.size > 0
                      ? `Marketplaces (${selectedMarketplaces.size} selected)`
                      : "No marketplace selected"}
                  </Button>
                  <Popover>
                    <PopoverDialog
                      className="p-0 w-[200px]"
                      aria-label="Select Marketplaces"
                    >
                      <SelectListBox
                        items={activeTeam.marketplaces}
                        selectedKeys={selectedMarketplaces}
                        onSelectionChange={(keys) => {
                          setSelectedMarketplaces(keys as Set<string>);
                        }}
                        selectionMode="multiple"
                        aria-label="Marketplaces"
                      >
                        {(item) => (
                          <SelectItem
                            id={item.iso}
                            className="flex items-center gap-2"
                            textValue={item.name}
                          >
                            {item.icon}
                            {item.name}
                          </SelectItem>
                        )}
                      </SelectListBox>
                    </PopoverDialog>
                  </Popover>
                </PopoverTrigger>
              </>
            )}
            {!!activeTeam && (
              <DateRangePicker
                className="min-w-[240px] space-y-1"
                value={selectedDateRange}
                onChange={setSelectedDateRange}
              >
                <Label>Date range</Label>
                <FieldGroup>
                  <DateInput variant="ghost" slot={"start"} />
                  <span
                    aria-hidden
                    className="px-2 text-sm text-muted-foreground"
                  >
                    -
                  </span>
                  <DateInput className="flex-1" variant="ghost" slot={"end"} />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-1 size-6 data-[focus-visible]:ring-offset-0"
                  >
                    <CalendarIcon aria-hidden className="size-4" />
                  </Button>
                </FieldGroup>
                <DatePickerContent>
                  <RangeCalendar>
                    <CalendarHeading />
                    <CalendarGrid>
                      <CalendarGridHeader>
                        {(day) => (
                          <CalendarHeaderCell>{day}</CalendarHeaderCell>
                        )}
                      </CalendarGridHeader>
                      <CalendarGridBody>
                        {(date) => <CalendarCell date={date} />}
                      </CalendarGridBody>
                    </CalendarGrid>
                  </RangeCalendar>
                </DatePickerContent>
              </DateRangePicker>
            )}
          </div>
          <div></div>
        </CardContent>
      </Card>
    </main>
  );
}

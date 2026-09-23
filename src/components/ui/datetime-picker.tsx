import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DateTimePickerProps = {
  /** "YYYY-MM-DDTHH:mm" wall-clock value, same shape <input type="datetime-local"> uses. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function DateTimePicker({ value, onChange, placeholder = "Alege data", className }: DateTimePickerProps) {
  const [datePart, timePart] = value ? value.split("T") : ["", ""];
  const selected = datePart ? new Date(`${datePart}T00:00:00`) : undefined;

  const setDate = (date: Date | undefined) => {
    if (!date) {
      onChange("");
      return;
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}T${timePart || "00:00"}`);
  };

  const setTime = (time: string) => {
    if (!datePart) return;
    onChange(`${datePart}T${time || "00:00"}`);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn("flex-1 justify-start text-left font-normal", !datePart && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{selected ? format(selected, "d MMM yyyy", { locale: ro }) : placeholder}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={selected} defaultMonth={selected} onSelect={setDate} initialFocus locale={ro} />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={timePart}
        onChange={(event) => setTime(event.target.value)}
        disabled={!datePart}
        className="w-[110px] shrink-0"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Calendar, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  value?: DateRange;
  onValueChange: (range: DateRange | undefined) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({ 
  value, 
  onValueChange, 
  disabled = false,
  className,
  placeholder = "Pick a date range"
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  
  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder;
    
    if (!range.to) {
      return format(range.from, "MMM d, yyyy");
    }
    
    if (range.from.getTime() === range.to.getTime()) {
      return format(range.from, "MMM d, yyyy");
    }
    
    return `${format(range.from, "MMM d")} - ${format(range.to, "MMM d, yyyy")}`;
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {formatDateRange(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          initialFocus
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={(range) => {
            onValueChange(range);
            if (range?.from && range?.to) {
              setOpen(false);
            }
          }}
          numberOfMonths={2}
        />
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onValueChange(undefined);
              setOpen(false);
            }}
            className="w-full"
          >
            Clear selection
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
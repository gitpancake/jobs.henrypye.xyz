"use client";

import { useState } from "react";
import { Check, ChevronDown, Calendar } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const datePresets = [
  {
    label: "Today",
    getValue: () => new Date(),
  },
  {
    label: "Yesterday", 
    getValue: () => subDays(new Date(), 1),
  },
  {
    label: "3 days ago",
    getValue: () => subDays(new Date(), 3),
  },
  {
    label: "A week ago",
    getValue: () => subDays(new Date(), 7),
  },
  {
    label: "2 weeks ago", 
    getValue: () => subDays(new Date(), 14),
  },
  {
    label: "A month ago",
    getValue: () => subDays(new Date(), 30),
  },
];

interface DateComboboxProps {
  value?: Date;
  onValueChange: (date: Date) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function DateCombobox({ 
  value, 
  onValueChange, 
  disabled = false,
  className,
  placeholder = "Select date..."
}: DateComboboxProps) {
  const [open, setOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const handlePresetSelect = (getValue: () => Date) => {
    onValueChange(getValue());
    setOpen(false);
    setShowCalendar(false);
  };
  
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onValueChange(date);
      setOpen(false);
      setShowCalendar(false);
    }
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
            "w-[180px] justify-between text-sm h-8",
            className
          )}
        >
          <span className="truncate flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {value ? format(value, "MMM d, yyyy") : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        {!showCalendar ? (
          <div className="p-1">
            {datePresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetSelect(preset.getValue)}
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {preset.label}
              </button>
            ))}
            <div className="border-t pt-1 mt-1">
              <button
                onClick={() => setShowCalendar(true)}
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Choose custom date...
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <CalendarComponent
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              initialFocus
            />
            <div className="border-t pt-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalendar(false)}
                className="w-full"
              >
                Back to presets
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
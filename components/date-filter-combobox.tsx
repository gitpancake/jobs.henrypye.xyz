"use client";

import { useState } from "react";
import { Check, ChevronDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const dateFilterOptions = [
  { value: '', label: 'All dates' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisweek', label: 'This Week' },
  { value: 'thismonth', label: 'This Month' },
];

interface DateFilterComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  hasCustomRange?: boolean;
}

export function DateFilterCombobox({ 
  value, 
  onValueChange, 
  disabled = false,
  className,
  hasCustomRange = false
}: DateFilterComboboxProps) {
  const [open, setOpen] = useState(false);
  
  const selectedOption = dateFilterOptions.find(option => option.value === value);
  const displayLabel = hasCustomRange ? 'Custom Range' : selectedOption?.label || "All dates";
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-[140px] justify-between text-sm h-8",
            className
          )}
        >
          <span className="truncate flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {displayLabel}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[140px] p-0">
        <div className="p-1">
          {dateFilterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onValueChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                value === option.value && !hasCustomRange && "bg-accent text-accent-foreground"
              )}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === option.value && !hasCustomRange ? "opacity-100" : "opacity-0"
                )}
              />
              {option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { JobStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type FilterStatus = JobStatus | 'ALL';

const statusFilterOptions: { value: FilterStatus; label: string; color?: string }[] = [
  { value: 'ALL', label: 'All Statuses', color: 'text-foreground' },
  { value: 'APPLIED', label: 'Applied', color: 'text-blue-600' },
  { value: 'INTERVIEWING', label: 'Interviewing', color: 'text-yellow-600' },
  { value: 'ACCEPTED', label: 'Accepted', color: 'text-green-600' },
  { value: 'REJECTED', label: 'Rejected', color: 'text-red-600' },
];

interface StatusFilterComboboxProps {
  value: FilterStatus;
  onValueChange: (value: FilterStatus) => void;
  disabled?: boolean;
  className?: string;
}

export function StatusFilterCombobox({ 
  value, 
  onValueChange, 
  disabled = false,
  className 
}: StatusFilterComboboxProps) {
  const [open, setOpen] = useState(false);
  
  const selectedOption = statusFilterOptions.find(option => option.value === value);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-[160px] justify-between text-sm h-8",
            className
          )}
        >
          <span className={cn("truncate", selectedOption?.color)}>
            {selectedOption?.label || "Select status..."}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[160px] p-0">
        <div className="p-1">
          {statusFilterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onValueChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                value === option.value && "bg-accent text-accent-foreground"
              )}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === option.value ? "opacity-100" : "opacity-0"
                )}
              />
              <span className={option.color}>{option.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
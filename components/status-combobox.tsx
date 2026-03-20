"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { JobStatus } from "@/lib/types";
import { 
  Combobox, 
  ComboboxInput, 
  ComboboxContent, 
  ComboboxList, 
  ComboboxItem,
  ComboboxTrigger,
  ComboboxValue
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const statusOptions: { value: JobStatus; label: string; color: string }[] = [
  { value: 'APPLIED', label: 'Applied', color: 'text-blue-600' },
  { value: 'INTERVIEWING', label: 'Interviewing', color: 'text-yellow-600' },
  { value: 'ACCEPTED', label: 'Accepted', color: 'text-green-600' },
  { value: 'REJECTED', label: 'Rejected', color: 'text-red-600' },
];

interface StatusComboboxProps {
  value: JobStatus;
  onValueChange: (value: JobStatus) => void;
  disabled?: boolean;
  className?: string;
}

export function StatusCombobox({ 
  value, 
  onValueChange, 
  disabled = false,
  className 
}: StatusComboboxProps) {
  const [open, setOpen] = useState(false);
  
  const selectedOption = statusOptions.find(option => option.value === value);
  
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
          <span className={cn("truncate", selectedOption?.color)}>
            {selectedOption?.label || "Select status..."}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[140px] p-0">
        <div className="p-1">
          {statusOptions.map((option) => (
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
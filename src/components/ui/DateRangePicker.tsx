"use client";

import type { DateRange } from "@/types/database";
import { classNames } from "@/lib/utils";

const presets: { label: string; value: DateRange }[] = [
  { label: "Today", value: "today" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

interface DateRangePickerProps {
  selected: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ selected, onChange }: DateRangePickerProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
      {presets.map((preset) => (
        <button
          key={preset.value}
          onClick={() => onChange(preset.value)}
          className={classNames(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            selected === preset.value
              ? "bg-brand-500 text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

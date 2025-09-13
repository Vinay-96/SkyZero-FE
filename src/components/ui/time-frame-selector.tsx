// components/ui/time-frame-selector.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const timeFrames = [
  { value: "today", label: "Today" },
  { value: "oneWeek", label: "One Week" },
  { value: "oneMonth", label: "One Month" },
];

interface TimeFrameSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const TimeFrameSelector = ({
  value,
  onChange,
  className,
}: TimeFrameSelectorProps) => {
  return (
    <div className={cn("flex gap-1 p-1 bg-muted rounded-lg shadow-sm", className)}>
      {timeFrames.map((frame) => (
        <Button
          key={frame.value}
          variant={value === frame.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(frame.value)}
          className={cn(
            "rounded-md",
            value !== frame.value && "hover:bg-background"
          )}
        >
          {frame.label}
        </Button>
      ))}
    </div>
  );
};


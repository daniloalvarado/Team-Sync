import { AudioWaveform } from "lucide-react";
import { cn } from "@/lib/utils"; 

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center justify-center sm:justify-start", className)}>
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <AudioWaveform className="size-4" />
      </div>
    </div>
  );
};

export default Logo;
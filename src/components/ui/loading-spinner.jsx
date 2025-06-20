import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const LoadingSpinner = React.forwardRef(({ className, size = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <Loader2
      ref={ref}
      className={cn("animate-spin", sizeClasses[size], className)}
      {...props}
    />
  );
});
LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
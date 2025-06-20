import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EmptyState = React.forwardRef(({ 
  className,
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="mb-4 p-3 rounded-full bg-gray-100">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && onAction && (
        <Button onClick={onAction} className="mt-4">
          {actionLabel || "Get Started"}
        </Button>
      )}
    </div>
  );
});
EmptyState.displayName = "EmptyState";

export { EmptyState };
import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DatePicker = React.forwardRef(({ 
  value, 
  onChange, 
  placeholder = "Select date",
  disabled = false,
  className,
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateSelect = (date) => {
    if (date) {
      const isoString = date.toISOString().split('T')[0];
      onChange(isoString);
      setIsOpen(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isSelected = (date) => {
    if (!value || !date) return false;
    const selectedDate = new Date(value);
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === new Date().toDateString();
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          {...props}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {value ? formatDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth(-1)}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold">{monthYear}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth(1)}
              className="h-7 w-7"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 font-normal",
                  !date && "invisible",
                  isSelected(date) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  isToday(date) && !isSelected(date) && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleDateSelect(date)}
                disabled={!date}
              >
                {date?.getDate()}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

DatePicker.displayName = "DatePicker";

export { DatePicker };
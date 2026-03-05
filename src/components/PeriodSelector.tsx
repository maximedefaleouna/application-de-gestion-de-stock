import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";

export type DateRangeType = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom' | 'specific';

interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

interface PeriodSelectorProps {
  onPeriodChange?: (period: DateRangeType, range: DateRange) => void;
  className?: string;
}

export function PeriodSelector({ onPeriodChange, className }: PeriodSelectorProps) {
  const [period, setPeriod] = useState<DateRangeType>('today');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [isOpen, setIsOpen] = useState(false);

  const handlePeriodChange = (value: DateRangeType) => {
    setPeriod(value);
    let newRange: DateRange = { from: undefined, to: undefined };

    switch (value) {
      case 'today':
        newRange = {
          from: startOfDay(new Date()),
          to: endOfDay(new Date()),
        };
        break;
      case 'yesterday':
        const yesterday = subDays(new Date(), 1);
        newRange = {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday),
        };
        break;
      case 'last7days':
        newRange = {
          from: startOfDay(subDays(new Date(), 6)),
          to: endOfDay(new Date()),
        };
        break;
      case 'last30days':
        newRange = {
          from: startOfDay(subDays(new Date(), 29)),
          to: endOfDay(new Date()),
        };
        break;
      case 'specific':
        newRange = {
          from: selectedDate ? startOfDay(selectedDate) : undefined,
          to: selectedDate ? endOfDay(selectedDate) : undefined,
        };
        break;
      case 'custom':
        // Will be set via calendar
        break;
    }

    setDateRange(newRange);
    onPeriodChange?.(value, newRange);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (period === 'specific') {
      const newRange = {
        from: date ? startOfDay(date) : undefined,
        to: date ? endOfDay(date) : undefined,
      };
      setDateRange(newRange);
      onPeriodChange?.('specific', newRange);
    }
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      setPeriod('custom');
      onPeriodChange?.('custom', range);
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'today':
        return "Aujourd'hui";
      case 'yesterday':
        return 'Hier';
      case 'last7days':
        return '7 derniers jours';
      case 'last30days':
        return '30 derniers jours';
      case 'specific':
        return selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: fr }) : 'Date spécifique';
      case 'custom':
        if (dateRange.from && dateRange.to) {
          return `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`;
        }
        return 'Période personnalisée';
      default:
        return 'Période';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Période :</span>
          <span className="text-sm font-semibold text-primary">{getPeriodLabel()}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Quick presets */}
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="Sélectionner une période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="yesterday">Hier</SelectItem>
              <SelectItem value="last7days">7 derniers jours</SelectItem>
              <SelectItem value="last30days">30 derniers jours</SelectItem>
              <SelectItem value="specific">Date spécifique</SelectItem>
              <SelectItem value="custom">Intervalle personnalisé</SelectItem>
            </SelectContent>
          </Select>

          {/* Date picker for specific date or custom range */}
          {(period === 'specific' || period === 'custom') && (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 text-sm",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {period === 'custom' ? 'Choisir dates' : 'Choisir date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                {period === 'custom' ? (
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={handleRangeSelect}
                    numberOfMonths={2}
                    locale={fr}
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: cn(
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                      ),
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell:
                        "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: cn(
                        "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                      ),
                      day_range_end: "day-range-end",
                      day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside:
                        "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle:
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                    }}
                  />
                ) : (
                  <Calendar
                    initialFocus
                    mode="single"
                    defaultMonth={selectedDate}
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={fr}
                  />
                )}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
}

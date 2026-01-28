import { format, parse } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: string | null
  onDateChange: (date: string | null) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({ date, onDateChange, placeholder = "Pick a date", disabled }: DatePickerProps) {
  // Convert string (YYYY-MM-DD) to Date object for calendar display
  const dateObj = date ? parse(date, 'yyyy-MM-dd', new Date()) : undefined
  
  // Convert Date back to string (YYYY-MM-DD) when changed
  const handleSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      onDateChange(null)
      return
    }
    // Format as YYYY-MM-DD for storage
    onDateChange(format(newDate, 'yyyy-MM-dd'))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateObj ? format(dateObj, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={dateObj}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

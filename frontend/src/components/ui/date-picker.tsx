import * as React from "react"
import { format, parse } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
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
  label?: string
  id?: string
}

export function DatePicker({ 
  date, 
  onDateChange, 
  placeholder = "Select date", 
  disabled,
  label = "Date of birth",
  id = "date"
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Convert string (YYYY-MM-DD) to Date object for calendar display
  const dateObj = date ? parse(date, 'yyyy-MM-dd', new Date()) : undefined
  
  // Convert Date back to string (YYYY-MM-DD) when changed
  const handleSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      onDateChange(null)
      setOpen(false)
      return
    }
    // Format as YYYY-MM-DD for storage
    onDateChange(format(newDate, 'yyyy-MM-dd'))
    setOpen(false)
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            disabled={disabled}
            className="w-full justify-start font-normal"
          >
            {dateObj ? dateObj.toLocaleDateString() : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={dateObj}
            defaultMonth={dateObj}
            captionLayout="dropdown"
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}

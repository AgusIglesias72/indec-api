"use client"

import * as React from "react"
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface NativeDatePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function NativeDatePicker({
  date,
  onDateChange,
  placeholder = "Seleccionar fecha histórica",
  className,
  disabled = false
}: NativeDatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState<number>(date ? date.getMonth() : new Date().getMonth())
  const [currentYear, setCurrentYear] = React.useState<number>(date ? date.getFullYear() : new Date().getFullYear())

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const dayNames = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"]

  const currentYearNow = new Date().getFullYear()
  const years = []
  for (let i = currentYearNow; i >= 2000; i--) {
    years.push(i)
  }

  const handleSelect = (selectedDate: Date) => {
    onDateChange(selectedDate)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateChange(undefined)
  }

  // Get days in month and starting day of week
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
    
    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentYear, currentMonth)

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear
  }

  const isSelected = (day: number) => {
    if (!date) return false
    return date.getDate() === day && 
           date.getMonth() === currentMonth && 
           date.getFullYear() === currentYear
  }

  const isPastDate = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return checkDate > today
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Generate calendar grid
  const calendarDays = []
  
  // Empty cells for days before the first day of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="w-9 h-9"></div>)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isPast = isPastDate(day)
    const selected = isSelected(day)
    const today = isToday(day)
    
    calendarDays.push(
      <button
        key={day}
        onClick={() => !isPast && handleSelect(new Date(currentYear, currentMonth, day))}
        disabled={isPast}
        className={cn(
          "w-9 h-9 text-sm rounded-md flex items-center justify-center transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          {
            "bg-primary text-primary-foreground hover:bg-primary": selected,
            "bg-accent text-accent-foreground font-semibold": today && !selected,
            "text-muted-foreground cursor-not-allowed opacity-50": isPast,
            "cursor-pointer": !isPast
          }
        )}
      >
        {day}
      </button>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between text-left font-normal h-10 px-3",
              !date && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {date ? formatDate(date) : placeholder}
              </span>
            </div>
            {date && (
              <button
                type="button"
                className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            {/* Month and Year Selectors */}
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={currentMonth.toString()}
                onValueChange={(value) => setCurrentMonth(parseInt(value))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={currentYear.toString()}
                onValueChange={(value) => setCurrentYear(parseInt(value))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calendar Header with Navigation */}
            <div className="relative flex items-center justify-center py-2">
              <button
                onClick={goToPreviousMonth}
                className="absolute left-0 p-1 rounded-md hover:bg-accent transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <h3 className="text-sm font-medium">
                {months[currentMonth]} {currentYear}
              </h3>
              
              <button
                onClick={goToNextMonth}
                className="absolute right-0 p-1 rounded-md hover:bg-accent transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-1">
              {/* Day Names Header */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {dayNames.map((dayName) => (
                  <div
                    key={dayName}
                    className="w-9 h-8 text-xs font-medium text-muted-foreground flex items-center justify-center"
                  >
                    {dayName}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays}
              </div>
            </div>

            {/* Clear button */}
            {date && (
              <div className="border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => handleSelect(undefined as any)}
                >
                  Limpiar selección
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
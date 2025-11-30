import React, { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// DatePicker Component
export const DatePicker = ({
  value,
  onChange,
  placeholder = "Огноо сонгох",
  disabled = false,
  className,
  format = 'YYYY-MM-DD',
  minDate,
  maxDate,
  clearable = true
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [displayDate, setDisplayDate] = useState(value ? new Date(value) : new Date())
  const containerRef = useRef(null)

  // Огноо форматлах
  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Сар нэр авах
  const getMonthName = (month) => {
    const months = [
      'Нэгдүгээр сар', 'Хоёрдугаар сар', 'Гуравдугаар сар', 'Дөрөвдүгээр сар',
      'Тавдугаар сар', 'Зургаадугаар сар', 'Долоодугаар сар', 'Наймдугаар сар',
      'Есдүгээр сар', 'Аравдугаар сар', 'Арван нэгдүгээр сар', 'Арван хоёрдугаар сар'
    ]
    return months[month]
  }

  // Календарын өдрүүд үүсгэх
  const generateCalendarDays = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    const days = []
    
    // Өмнөх сарын өдрүүд
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, -i + 1)
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      })
    }
    
    // Одоогийн сарын өдрүүд
    const today = new Date()
    const selectedDate = value ? new Date(value) : null
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      const isToday = currentDate.toDateString() === today.toDateString()
      const isSelected = selectedDate && currentDate.toDateString() === selectedDate.toDateString()
      
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isDisabled: (minDate && currentDate < minDate) || (maxDate && currentDate > maxDate)
      })
    }
    
    // Дараагийн сарын өдрүүд
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      })
    }
    
    return days
  }

  // Өдөр сонгох
  const handleDateSelect = (date) => {
    onChange(date)
    setIsOpen(false)
  }

  // Сар солих
  const changeMonth = (direction) => {
    setDisplayDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + direction)
      return newDate
    })
  }

  // Цэвэрлэх
  const handleClear = (e) => {
    e.stopPropagation()
    onChange(null)
  }

  // Гаднаас дарахад хаах
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const calendarDays = generateCalendarDays(displayDate)

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input */}
      <div
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:border-gray-400"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={cn("text-sm", value ? "text-gray-900" : "text-gray-500")}>
          {value ? formatDate(value) : placeholder}
        </span>
        <div className="flex items-center space-x-1">
          {clearable && value && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">
              {getMonthName(displayDate.getMonth())} {displayDate.getFullYear()}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-2">
            {['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'].map(day => (
              <div key={day} className="text-xs text-gray-500 text-center py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                onClick={() => !day.isDisabled && handleDateSelect(day.date)}
                disabled={day.isDisabled}
                className={cn(
                  "w-8 h-8 text-xs rounded flex items-center justify-center",
                  "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  day.isCurrentMonth ? "text-gray-900" : "text-gray-400",
                  day.isSelected && "bg-blue-500 text-white hover:bg-blue-600",
                  day.isToday && !day.isSelected && "bg-blue-100 text-blue-600",
                  day.isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {day.date.getDate()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// DateRangePicker Component
export const DateRangePicker = ({
  value = [null, null],
  onChange,
  placeholder = "Огнооны хязгаар сонгох",
  disabled = false,
  className,
  clearable = true,
  minDate,
  maxDate
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [displayDate, setDisplayDate] = useState(new Date())
  const [selectingStart, setSelectingStart] = useState(true)
  const containerRef = useRef(null)

  const [startDate, endDate] = value

  // Огноо форматлах
  const formatDateRange = () => {
    if (!startDate && !endDate) return placeholder
    if (startDate && !endDate) return `${formatDate(startDate)} - `
    if (!startDate && endDate) return ` - ${formatDate(endDate)}`
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Огноо сонгох
  const handleDateSelect = (date) => {
    if (selectingStart) {
      onChange([date, endDate])
      setSelectingStart(false)
    } else {
      if (startDate && date < startDate) {
        onChange([date, startDate])
      } else {
        onChange([startDate, date])
      }
      setSelectingStart(true)
      setIsOpen(false)
    }
  }

  // Цэвэрлэх
  const handleClear = (e) => {
    e.stopPropagation()
    onChange([null, null])
    setSelectingStart(true)
  }

  // Календарын өдрүүд үүсгэх (DatePicker-тэй адилхан)
  const generateCalendarDays = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    const days = []
    
    // Өмнөх сарын өдрүүд
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, -i + 1)
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isInRange: false
      })
    }
    
    // Одоогийн сарын өдрүүд
    const today = new Date()
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      const isToday = currentDate.toDateString() === today.toDateString()
      const isStartSelected = startDate && currentDate.toDateString() === startDate.toDateString()
      const isEndSelected = endDate && currentDate.toDateString() === endDate.toDateString()
      const isInRange = startDate && endDate && currentDate >= startDate && currentDate <= endDate
      
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday,
        isSelected: isStartSelected || isEndSelected,
        isInRange: isInRange && !isStartSelected && !isEndSelected,
        isDisabled: (minDate && currentDate < minDate) || (maxDate && currentDate > maxDate)
      })
    }
    
    // Дараагийн сарын өдрүүд
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isInRange: false
      })
    }
    
    return days
  }

  // Гаднаас дарахад хаах
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const calendarDays = generateCalendarDays(displayDate)

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input */}
      <div
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:border-gray-400"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={cn("text-sm", (startDate || endDate) ? "text-gray-900" : "text-gray-500")}>
          {formatDateRange()}
        </span>
        <div className="flex items-center space-x-1">
          {clearable && (startDate || endDate) && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 p-3">
          {/* Status */}
          <div className="mb-2 text-xs text-gray-500">
            {selectingStart ? "Эхлэх огноо сонгоно уу" : "Дуусах огноо сонгоно уу"}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setDisplayDate(prev => {
                const newDate = new Date(prev)
                newDate.setMonth(newDate.getMonth() - 1)
                return newDate
              })}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">
              {displayDate.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long' })}
            </span>
            <button
              onClick={() => setDisplayDate(prev => {
                const newDate = new Date(prev)
                newDate.setMonth(newDate.getMonth() + 1)
                return newDate
              })}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-2">
            {['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'].map(day => (
              <div key={day} className="text-xs text-gray-500 text-center py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                onClick={() => !day.isDisabled && handleDateSelect(day.date)}
                disabled={day.isDisabled}
                className={cn(
                  "w-8 h-8 text-xs rounded flex items-center justify-center",
                  "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  day.isCurrentMonth ? "text-gray-900" : "text-gray-400",
                  day.isSelected && "bg-blue-500 text-white hover:bg-blue-600",
                  day.isInRange && "bg-blue-100 text-blue-600",
                  day.isToday && !day.isSelected && !day.isInRange && "bg-gray-100",
                  day.isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {day.date.getDate()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
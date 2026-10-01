import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface CalendarPickerProps {
  value: string;
  onChange: (formattedDate: string, rawDate?: Date) => void;
  placeholder?: string;
  className?: string;
  formatMode?: 'date' | 'month' | 'week';
  presets?: any;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date...',
  className = '',
  formatMode = 'date',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Safe date parser that NEVER defaults to weird years (e.g. 2001) from "Week 1" or "Month 1"
  const parseInitialDate = (): Date => {
    if (!value || typeof value !== 'string') return new Date();
    const clean = value.trim();

    // 1. Check if ISO format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const [y, m, d] = clean.split('-').map(Number);
      return new Date(y, m - 1, d);
    }

    // 2. Check if DD Mon YYYY or Mon DD YYYY format
    const yearMatch = clean.match(/\b(20\d\d)\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1], 10);
      for (let i = 0; i < MONTH_NAMES.length; i++) {
        if (clean.toLowerCase().includes(MONTH_NAMES[i].toLowerCase().slice(0, 3))) {
          const dayMatch = clean.match(/\b(\d{1,2})\b/);
          const day = dayMatch ? parseInt(dayMatch[1], 10) : 1;
          return new Date(year, i, day);
        }
      }
      return new Date(year, new Date().getMonth(), 1);
    }

    // 3. For any "Week X" or "Month X" or invalid text, safely default to current date
    return new Date();
  };

  const [viewDate, setViewDate] = useState<Date>(parseInitialDate);

  useEffect(() => {
    if (isOpen) {
      setViewDate(parseInitialDate());
    }
  }, [isOpen, value]);

  const currentYear = viewDate.getFullYear();
  const currentMonthIdx = viewDate.getMonth();
  const currentMonthName = MONTH_NAMES[currentMonthIdx];

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonthIdx - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonthIdx + 1, 1));
  };

  const firstDayOfMonth = new Date(currentYear, currentMonthIdx, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();

  const getIsSelectedDay = (day: number): boolean => {
    if (!value) return false;
    const clean = value.trim();

    // If standard ISO date
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const [y, m, d] = clean.split('-').map(Number);
      return y === currentYear && m === currentMonthIdx + 1 && d === day;
    }

    // Check if day and month match in natural string
    if (clean.toLowerCase().includes(currentMonthName.toLowerCase().slice(0, 3))) {
      const dayMatch = clean.match(/\b(\d{1,2})\b/);
      if (dayMatch && parseInt(dayMatch[1], 10) === day) {
        return true;
      }
    }
    return false;
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(currentYear, currentMonthIdx, day);
    let formatted = '';

    if (formatMode === 'month') {
      formatted = `${currentMonthName} ${currentYear}`;
    } else if (formatMode === 'week') {
      const weekIdx = Math.min(4, Math.ceil(day / 7));
      const startDay = (weekIdx - 1) * 7 + 1;
      const endDay = Math.min(daysInMonth, weekIdx * 7);
      formatted = `Week ${weekIdx} (Days ${startDay}–${endDay})`;
    } else {
      const yyyy = selected.getFullYear();
      const mm = String(selected.getMonth() + 1).padStart(2, '0');
      const dd = String(selected.getDate()).padStart(2, '0');
      formatted = `${yyyy}-${mm}-${dd}`;
    }

    onChange(formatted, selected);
    setIsOpen(false);
  };

  const handleSelectWeekPreset = (weekNum: number) => {
    const startDay = (weekNum - 1) * 7 + 1;
    const endDay = Math.min(daysInMonth, weekNum * 7);
    const formatted = `Week ${weekNum} (Days ${startDay}–${endDay})`;
    const selected = new Date(currentYear, currentMonthIdx, startDay);
    onChange(formatted, selected);
    setIsOpen(false);
  };

  const handleSelectMonthPreset = (monthIdx: number) => {
    const selected = new Date(currentYear, monthIdx, 1);
    const monthName = MONTH_NAMES[monthIdx];
    const formatted = `${monthName} ${currentYear}`;
    onChange(formatted, selected);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Clean Input Box with Calendar Icon (No preset chips outside) */}
      <div
        onClick={() => setIsOpen(true)}
        className="relative flex items-center cursor-pointer group w-full"
      >
        <input
          type="text"
          readOnly
          value={value}
          placeholder={placeholder}
          className="w-full pl-3 pr-16 py-2 h-[38px] text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer group-hover:border-emerald-400 transition-colors shadow-2xs"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('', undefined);
              }}
              className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              title="Clear / Empty Date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            title="Open Calendar Picker"
          >
            <CalendarIcon className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Floating Modal Popover (Never cut off by container overflow or screen bottom) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 w-80 max-w-[95vw] animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header: Month Year + Navigation Arrows */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div>
                <h4 className="text-base font-extrabold text-gray-900 tracking-tight">
                  {currentMonthName} {currentYear}
                </h4>
                <p className="text-[11px] text-gray-400 font-medium">Select a target date or schedule</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-xl text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-xl text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Labels (Su Mo Tu We Th Fr Sa) */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {WEEK_DAYS.map((day) => (
                <span
                  key={day}
                  className="text-[11px] font-bold text-gray-400 py-0.5 uppercase tracking-wider"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`blank-${idx}`} className="w-9 h-9" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const isSelected = getIsSelectedDay(day);

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`w-9 h-9 text-xs font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0088ff] text-white shadow-md font-extrabold scale-105'
                        : 'text-gray-800 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Quick Sprints / Weeks Selector inside Modal */}
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Week Selection</div>
              <div className="grid grid-cols-2 gap-1.5">
                {[1, 2, 3, 4].map((w) => (
                  <button
                    key={`week-btn-${w}`}
                    type="button"
                    onClick={() => handleSelectWeekPreset(w)}
                    className="px-2.5 py-1.5 text-[11px] font-semibold bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-xl border border-gray-200 transition-colors text-left"
                  >
                    Week {w} (Days {(w - 1) * 7 + 1}–{Math.min(daysInMonth, w * 7)})
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setViewDate(now);
                    handleSelectDay(now.getDate());
                  }}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Today
                </button>

                {value && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange('', undefined);
                      setIsOpen(false);
                    }}
                    className="font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {formatMode === 'month' && (
                <button
                  type="button"
                  onClick={() => handleSelectMonthPreset(currentMonthIdx)}
                  className="font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  Whole Month
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

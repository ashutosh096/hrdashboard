import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface SelectOption {
  id: string;
  label: string;
  code?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  isMulti?: boolean;
  multiValues?: string[];
  onMultiChange?: (values: string[]) => void;
  placeholder?: string;
  noneLabel?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value = '',
  onChange,
  isMulti = false,
  multiValues = [],
  onMultiChange,
  placeholder = 'Select option...',
  noneLabel = '-- None (Standalone) --',
  searchPlaceholder = 'Search by name or code...',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Sort options alphabetically by label / code
  const sortedOptions = React.useMemo(() => {
    return [...options].sort((a, b) => {
      const textA = (a.label || a.code || '').toLowerCase();
      const textB = (b.label || b.code || '').toLowerCase();
      return textA.localeCompare(textB);
    });
  }, [options]);

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return sortedOptions;
    const term = searchTerm.toLowerCase();
    return sortedOptions.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(term);
      const matchCode = opt.code ? opt.code.toLowerCase().includes(term) : false;
      const matchSubtitle = opt.subtitle ? opt.subtitle.toLowerCase().includes(term) : false;
      return matchLabel || matchCode || matchSubtitle;
    });
  }, [sortedOptions, searchTerm]);

  // Find single selected item
  const selectedOption = !isMulti ? options.find((opt) => opt.id === value) : null;

  // Find multi selected items
  const selectedMultiOptions = isMulti
    ? options.filter((opt) => multiValues.includes(opt.id) || multiValues.includes(opt.label))
    : [];

  const handleToggleMultiOption = (optIdOrLabel: string) => {
    if (!onMultiChange) return;
    if (multiValues.includes(optIdOrLabel)) {
      onMultiChange(multiValues.filter((v) => v !== optIdOrLabel));
    } else {
      onMultiChange([...multiValues, optIdOrLabel]);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs border rounded-xl bg-white transition-all text-left outline-none ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
            : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
          {isMulti ? (
            selectedMultiOptions.length > 0 ? (
              <div className="flex items-center gap-1.5 truncate font-semibold text-gray-900">
                <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 shrink-0">
                  {selectedMultiOptions.length} Selected
                </span>
                <span className="truncate text-gray-800">
                  {selectedMultiOptions.map((o) => o.label).join(', ')}
                </span>
              </div>
            ) : (
              <span className="text-gray-400 font-medium truncate">{placeholder}</span>
            )
          ) : selectedOption ? (
            <div className="flex items-center gap-1.5 truncate font-semibold text-gray-900">
              {selectedOption.code && (
                <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                  {selectedOption.code}
                </span>
              )}
              <span className="truncate">{selectedOption.label}</span>
            </div>
          ) : (
            <span className="text-gray-400 font-medium truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-gray-400">
          {!isMulti && value && onChange && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          {isMulti && multiValues.length > 0 && onMultiChange && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onMultiChange([]);
              }}
              className="p-0.5 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
              title="Clear all selected"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Floating Menu with 5-item Scroll Window */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-[100] mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Bar */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/80">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium text-gray-800"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Items Window: Max Height for ~5 Visible Items */}
          <div className="max-h-48 overflow-y-auto p-1 divide-y divide-gray-50 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
            {/* None Option for Single Select */}
            {!isMulti && !searchTerm && noneLabel && onChange && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                  !value ? 'bg-emerald-50 text-emerald-800' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <span>{noneLabel}</span>
                {!value && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </button>
            )}

            {/* Filtered Items */}
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-400 font-medium">
                No matching results found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = isMulti
                  ? multiValues.includes(opt.id) || multiValues.includes(opt.label)
                  : opt.id === value;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (isMulti) {
                        handleToggleMultiOption(opt.id);
                      } else {
                        if (onChange) onChange(opt.id);
                        setIsOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'text-gray-800 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                      {isMulti && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 pointer-events-none"
                        />
                      )}
                      {opt.code && (
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                            isSelected
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-gray-100 text-gray-700 border-gray-200 group-hover:border-gray-300'
                          }`}
                        >
                          {opt.code}
                        </span>
                      )}
                      <span className="truncate">{opt.label}</span>
                      {opt.subtitle && (
                        <span className="text-[11px] text-gray-400 truncate">
                          ({opt.subtitle})
                        </span>
                      )}
                    </div>

                    {!isMulti && isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

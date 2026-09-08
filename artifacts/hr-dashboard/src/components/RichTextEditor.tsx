import React, { useRef } from 'react';
import { Bold, Italic, List, ListOrdered, AlignLeft } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}

export const RichTextEditor: React.FC<Props> = ({
  value,
  onChange,
  placeholder = 'Write description with rich formatting...',
  rows = 4,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 0);
  };

  const insertList = (type: 'bullet' | 'number') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = value.substring(start, end);

    const prefix = type === 'bullet' ? '• ' : '1. ';
    const lines = selectedText ? selectedText.split('\n') : ['item'];
    const formattedLines = lines.map((l, idx) => (type === 'bullet' ? `• ${l}` : `${idx + 1}. ${l}`)).join('\n');

    const newValue = value.substring(0, start) + formattedLines + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start, start + formattedLines.length);
    }, 0);
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-2xs focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-gray-600">
        <button
          type="button"
          onClick={() => insertFormatting('**', '**')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
          title="Bold (**text**)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('*', '*')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
          title="Italic (*text*)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => insertList('bullet')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
          title="Bulleted List (• item)"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => insertList('number')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
          title="Numbered List (1. item)"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <span className="text-[10px] font-semibold text-gray-400 ml-auto">Markdown Supported</span>
      </div>

      {/* Input Textarea */}
      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 text-sm text-gray-900 bg-white outline-none resize-y font-medium leading-relaxed"
      />
    </div>
  );
};

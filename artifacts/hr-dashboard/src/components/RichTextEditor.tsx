import React, { useRef } from 'react';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Highlighter } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}

export const RichTextEditor: React.FC<Props> = ({
  value,
  onChange,
  placeholder = 'Write description with rich formatting (bold, highlight, lists, links)...',
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

  const insertLink = () => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = value.substring(start, end);

    const userUrl = window.prompt('Enter Hyperlink URL (e.g. https://google.com):', 'https://');
    if (!userUrl) return;

    const linkText = selectedText || 'Link Description';
    const replacement = `[${linkText}](${userUrl})`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + 1, start + 1 + linkText.length);
    }, 0);
  };

  const insertList = (type: 'bullet' | 'number') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = value.substring(start, end);

    const lines = selectedText ? selectedText.split('\n') : ['List item'];
    const formattedLines = lines.map((l, idx) => (type === 'bullet' ? `• ${l}` : `${idx + 1}. ${l}`)).join('\n');

    const newValue = value.substring(0, start) + formattedLines + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start, start + formattedLines.length);
    }, 0);
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50/90 border-b border-gray-200 text-gray-600 select-none flex-wrap">
        <button
          type="button"
          onClick={() => insertFormatting('**', '**')}
          className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition-colors cursor-pointer"
          title="Bold (**text**)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('*', '*')}
          className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition-colors cursor-pointer"
          title="Italic (*text*)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('==', '==')}
          className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
          title="Highlight (==text==)"
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={insertLink}
          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer flex items-center gap-1"
          title="Insert Hyperlink [text](url)"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => insertList('bullet')}
          className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition-colors cursor-pointer"
          title="Bulleted List (• item)"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => insertList('number')}
          className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition-colors cursor-pointer"
          title="Numbered List (1. item)"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 ml-auto">
          Rich Text Editor
        </span>
      </div>

      {/* Input Textarea */}
      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 text-xs text-gray-900 bg-white outline-none resize-y font-medium leading-relaxed"
      />
    </div>
  );
};
